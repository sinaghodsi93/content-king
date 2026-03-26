import express from "express";
import { readdir, readFile } from "fs/promises";
import { join, basename } from "path";
import { query } from "@anthropic-ai/claude-agent-sdk";

const app = express();

// Track active step abort controllers
let activeAbort: AbortController | null = null;
const PORT = 3111;

// Configure your pipeline directory (where .md files live)
const PIPELINE_DIR = process.env.PIPELINE_DIR || "./pipeline";
// Configure the working directory Claude Code operates in
const WORKING_DIR = process.env.WORKING_DIR || import.meta.dirname!;

app.use(express.json());

// ── API: Save product brief ───────────────────────────────────────
app.post("/api/brief", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: "No content provided" });
      return;
    }
    const { writeFile, mkdir } = await import("fs/promises");
    await writeFile(join(WORKING_DIR, "brief.md"), content, "utf-8");
    // Ensure workspace dir exists
    await mkdir(join(WORKING_DIR, "workspace"), { recursive: true });
    res.json({ ok: true });
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

  // Set up abort controller for this run
  const abortController = new AbortController();
  activeAbort = abortController;

  try {
    const promptContent = await readFile(filePath, "utf-8");
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
