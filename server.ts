import express from "express";
import { readdir, readFile, stat } from "fs/promises";
import { join, basename } from "path";
import { query } from "@anthropic-ai/claude-agent-sdk";

const app = express();

// Track active step abort controllers
let activeAbort: AbortController | null = null;
const PORT = 3111;

// Session state: tracks which steps to skip and the current session directory
let skipSteps: string[] = [];
let sessionDir: string = "workspace"; // default, overridden per run

// Configure your pipeline directory (where .md files live)
const PIPELINE_DIR = process.env.PIPELINE_DIR || "./pipeline";
// Configure the working directory Claude Code operates in
const WORKING_DIR = process.env.WORKING_DIR || import.meta.dirname!;

app.use(express.json());

// ── API: Save product brief ───────────────────────────────────────
app.post("/api/brief", async (req, res) => {
  try {
    const { content, contentType, brandName } = req.body;
    if (!content) {
      res.status(400).json({ error: "No content provided" });
      return;
    }
    const { writeFile, mkdir } = await import("fs/promises");

    // Build session directory: workspace/YYYYMMDD-HHmmss-brandname
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const safeBrand = (brandName || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    sessionDir = `workspace/${ts}-${safeBrand}`;
    await mkdir(join(WORKING_DIR, sessionDir), { recursive: true });
    await mkdir(join(WORKING_DIR, "output"), { recursive: true });

    // Determine which research steps to skip based on content type
    const researchMap: Record<string, string[]> = {
      "twitter-thread": ["01-research-youtube"],   // X content → skip YouTube
      "youtube-ad":     ["02-research-x"],          // YouTube content → skip X
      "launch-video":   [],                         // Videos benefit from both
      "landing-page":   [],                         // Landing pages benefit from both
      "product-hunt":   [],                         // Product Hunt benefits from both
    };
    skipSteps = researchMap[contentType] || [];

    await writeFile(join(WORKING_DIR, "brief.md"), content, "utf-8");
    res.json({ ok: true, sessionDir, skipSteps });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: List pipeline steps ──────────────────────────────────────
app.get("/api/steps", async (_req, res) => {
  try {
    const files = await readdir(PIPELINE_DIR);
    const mdFiles = files
      .filter((f) => f.endsWith(".md"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const steps = await Promise.all(
      mdFiles.map(async (file) => {
        const content = await readFile(join(PIPELINE_DIR, file), "utf-8");
        const firstLine = content.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "") || file;
        return {
          id: basename(file, ".md"),
          filename: file,
          title: firstLine.slice(0, 80),
          preview: content.slice(0, 300),
        };
      })
    );

    res.json(steps);
  } catch (err: any) {
    res.status(500).json({ error: `Could not read pipeline dir: ${err.message}` });
  }
});

// ── API: Abort the currently running step ────────────────────────
app.post("/api/abort", (_req, res) => {
  if (activeAbort) {
    activeAbort.abort();
    activeAbort = null;
    res.json({ ok: true, message: "Aborted" });
  } else {
    res.json({ ok: true, message: "Nothing running" });
  }
});

// ── API: Run a pipeline step (SSE stream) ─────────────────────────
app.get("/api/run/:stepId", async (req, res) => {
  const stepId = req.params.stepId;
  const filePath = join(PIPELINE_DIR, `${stepId}.md`);

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Check if this step should be skipped
  if (skipSteps.includes(stepId)) {
    send("status", { message: `Skipping step: ${stepId} (not needed for this content type)`, phase: "skipped" });
    send("done", { message: "Step skipped" });
    res.end();
    return;
  }

  // Set up abort controller for this run
  const abortController = new AbortController();
  activeAbort = abortController;

  try {
    let promptContent = await readFile(filePath, "utf-8");

    // Replace workspace/ references with the session-specific directory
    // This ensures each run uses its own isolated directory and never conflicts
    promptContent = promptContent.replaceAll("workspace/", `${sessionDir}/`);

    send("status", { message: `Running step: ${stepId}`, phase: "starting" });

    const stream = query({
      prompt: promptContent,
      options: {
        allowedTools: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Glob", "Grep", "WebSearch", "WebFetch"],
        permissionMode: "acceptEdits",
        cwd: WORKING_DIR,
        abortController,
      },
    });

    for await (const message of stream) {
      if (abortController.signal.aborted) {
        send("status", { message: "Step aborted", phase: "aborted" });
        break;
      }

      switch (message.type) {
        case "system":
          if (message.subtype === "init") {
            send("system", { sessionId: message.session_id });
          }
          break;

        case "assistant":
          for (const block of message.message.content) {
            if ("text" in block && block.text) {
              send("text", { content: block.text });
            }
            if (block.type === "tool_use") {
              send("tool_call", {
                tool: block.name,
                input:
                  typeof block.input === "string"
                    ? block.input.slice(0, 500)
                    : JSON.stringify(block.input).slice(0, 500),
              });
            }
          }
          break;

        case "result":
          send("result", {
            subtype: message.subtype,
            result: message.result?.slice(0, 2000),
          });
          break;
      }
    }

    if (!abortController.signal.aborted) {
      send("done", { message: "Step completed" });
    }
  } catch (err: any) {
    if (abortController.signal.aborted) {
      send("status", { message: "Step aborted", phase: "aborted" });
    } else {
      send("error", { message: err.message });
    }
  } finally {
    if (activeAbort === abortController) activeAbort = null;
    res.end();
  }
});

// ── API: Get full content of a step ───────────────────────────────
app.get("/api/steps/:stepId/content", async (req, res) => {
  try {
    const content = await readFile(join(PIPELINE_DIR, `${req.params.stepId}.md`), "utf-8");
    res.json({ content });
  } catch {
    res.status(404).json({ error: "Step not found" });
  }
});

// ── API: List output files ────────────────────────────────────────
app.get("/api/outputs", async (_req, res) => {
  try {
    const outputDir = join(WORKING_DIR, "output");
    const files = await readdir(outputDir);
    const mdFiles = files.filter((f) => f.endsWith(".md")).sort().reverse();

    const outputs = await Promise.all(
      mdFiles.map(async (file) => {
        const filePath = join(outputDir, file);
        const content = await readFile(filePath, "utf-8");
        const stats = await stat(filePath);

        // Parse first line as title
        const firstLine = content.split("\n").find((l) => l.trim())?.replace(/^#+\s*/, "") || file;

        // Extract metadata table if present
        const metaMatch = content.match(/## Metadata\n\n\|[\s\S]*?\n((?:\|.*\n)*)/);
        const metadata: Record<string, string> = {};
        if (metaMatch) {
          for (const row of metaMatch[0].split("\n").slice(2)) {
            const cols = row.split("|").map((c) => c.trim()).filter(Boolean);
            if (cols.length >= 2) {
              const key = cols[0].replace(/\*\*/g, "").trim();
              const val = cols[1].replace(/\*\*/g, "").trim();
              if (key && val) metadata[key] = val;
            }
          }
        }

        // Extract subtitle line (the blockquote after the title)
        const subtitleMatch = content.match(/^>\s*(.+)$/m);

        return {
          filename: file,
          title: firstLine,
          subtitle: subtitleMatch ? subtitleMatch[1].replace(/\*\*/g, "") : null,
          contentType: metadata["Content Type"] || null,
          date: metadata["Date Generated"] || stats.mtime.toISOString().split("T")[0],
          wordCount: metadata["Word Count"] || null,
          weaponsCheck: metadata["Weapons Check Pass Rate"] || null,
          size: content.length,
        };
      })
    );

    res.json(outputs);
  } catch (err: any) {
    res.json([]);
  }
});

// ── API: Get a single output file ─────────────────────────────────
app.get("/api/outputs/:filename", async (req, res) => {
  try {
    const content = await readFile(join(WORKING_DIR, "output", req.params.filename), "utf-8");
    res.json({ content });
  } catch {
    res.status(404).json({ error: "Output not found" });
  }
});

// ── API: Delete an output file ────────────────────────────────────
app.delete("/api/outputs/:filename", async (req, res) => {
  try {
    const { unlink } = await import("fs/promises");
    await unlink(join(WORKING_DIR, "output", req.params.filename));
    res.json({ ok: true });
  } catch {
    res.status(404).json({ error: "Output not found" });
  }
});

// ── Serve frontend ────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.sendFile(join(import.meta.dirname!, "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n  ┌─────────────────────────────────────────┐`);
  console.log(`  │  Pipeline GUI running                    │`);
  console.log(`  │  http://localhost:${PORT}                  │`);
  console.log(`  │                                         │`);
  console.log(`  │  Pipeline dir: ${PIPELINE_DIR.padEnd(24)}│`);
  console.log(`  │  Working dir:  ${WORKING_DIR.slice(0, 24).padEnd(24)}│`);
  console.log(`  └─────────────────────────────────────────┘\n`);
});
