# Content King

A multi-agent AI pipeline that researches your market, then writes production-ready launch content — scripts, threads, ads, landing pages, and Product Hunt launches.

Every piece of content goes through research, iterative writing, and a quality gate before it ships.

## How It Works

1. **You describe your product** — brand, audience, tone, content type
2. **AI agents research your market** — YouTube and X/Twitter research run in parallel
3. **Specialized agents write each section** — hooks, body, CTA — each building on the last
4. **Weapons Check scores every line** — Novelty + Copy Intensity must hit 9+/10 or it gets rewritten
5. **Final content assembles** into a ready-to-use markdown file

The whole pipeline streams live in your browser so you can watch each agent work.

## Content Types

| Type | Length Options |
|------|--------------|
| Launch Video Script | 30s, 60s, 90s, 2min |
| Twitter/X Thread | 5 tweets, 10 tweets, 15 tweets |
| YouTube Ad Script | 15s, 30s, 60s |
| Landing Page Hero | Short, Long |
| Product Hunt Launch | Standard |

## Prerequisites

- **Node.js** v18+
- **Anthropic API key** or an active [Claude Code](https://docs.anthropic.com/en/docs/claude-code) session

## Setup

```bash
git clone https://github.com/sinaghodsi/content-king.git
cd content-king
npm install
```

Set your API key (if not using Claude Code CLI auth):

```bash
export ANTHROPIC_API_KEY=your-key-here
```

## Usage

```bash
npm run dev
```

Open **http://localhost:3111** in your browser.

1. Fill in your product brief (brand name, what it does, audience, features, tone)
2. Pick a content type and length
3. Hit **Run** — the pipeline streams each agent's work live
4. Grab your finished content from the output panel

## Pipeline Steps

| Step | Agent | What It Does |
|------|-------|-------------|
| 00 | Brief | Validates your input and sets word budgets |
| 01 | YouTube Research | Finds what's working on YouTube in your niche |
| 02 | X Research | Finds what's landing on X/Twitter in your niche |
| 03 | Hook | Writes 4 hook options, iterates 3x, scores on 5 dimensions |
| 04 | Body | Writes the core content using research ammunition |
| 05 | CTA | Writes 2 close options (direct + soft), scored on 4 dimensions |
| 06 | Weapons Check | Scores every line — rewrites anything below 9/10 |
| 07 | Assemble | Builds final output file with metadata |

Research steps are automatically skipped when not relevant (e.g., YouTube research is skipped for Twitter threads).

## Project Structure

```
pipeline-gui/
├── server.ts          # Express backend + Claude Agent SDK integration
├── index.html         # Browser UI (dark theme, real-time streaming)
├── pipeline/          # Agent prompt files (numbered for ordering)
│   ├── 00-brief.md
│   ├── 01-research-youtube.md
│   ├── 02-research-x.md
│   ├── 03-hook.md
│   ├── 04-body.md
│   ├── 05-cta.md
│   ├── 06-weapons-check.md
│   └── 07-assemble.md
├── output/            # Generated content files
├── workspace/         # Session working directories (gitignored)
├── brief.md           # Current product brief
└── package.json
```

## Configuration

| Env Variable | Default | Description |
|-------------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | Your Anthropic API key |
| `PIPELINE_DIR` | `./pipeline` | Directory containing agent `.md` files |
| `WORKING_DIR` | project root | Directory Claude Code operates in |

## Customizing the Pipeline

Each step is a markdown file in `pipeline/`. You can:

- **Edit existing agents** — modify the prompts to change writing style, scoring criteria, or iteration count
- **Add new steps** — create a new numbered `.md` file (e.g., `03b-tone-check.md`) and it appears in the GUI automatically
- **Remove steps** — delete or rename the file

The server picks up all `.md` files in the pipeline directory, sorted by filename.

## Tech Stack

- [Claude Agent SDK](https://docs.anthropic.com/en/docs/claude-code/claude-agent-sdk) — AI agent execution
- [Express](https://expressjs.com/) — Server + SSE streaming
- Vanilla HTML/CSS/JS — No framework, no build step

## License

MIT
