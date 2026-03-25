# Pipeline GUI

A local browser UI for running your `.md` pipeline steps through Claude Code (Agent SDK).

## Setup

```bash
npm install
```

## Auth

You need one of:
- `ANTHROPIC_API_KEY` environment variable, OR
- An active Claude Code session (logged in via `claude` CLI)

## Usage

```bash
# Default: reads .md files from ./pipeline, works in current directory
npm run dev

# Custom pipeline directory and working directory
PIPELINE_DIR=../my-project/.pipeline WORKING_DIR=../my-project npm run dev
```

Open **http://localhost:3111** in your browser.

## How it works

1. Drop your `.md` prompt files into the `pipeline/` folder (or set `PIPELINE_DIR`)
2. Name them with numeric prefixes to control order: `01-analyze.md`, `02-build.md`, etc.
3. The GUI lists them in the sidebar — click to select, hit **Run**
4. Claude Agent SDK executes the `.md` content as a prompt with full tool access
5. Output streams to the browser in real-time

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `PIPELINE_DIR` | `./pipeline` | Directory containing .md step files |
| `WORKING_DIR` | `process.cwd()` | Directory Claude Code operates in |

## Allowed tools

The agent has access to: `Read`, `Write`, `Edit`, `MultiEdit`, `Bash`, `Glob`, `Grep`.
Permissions are set to `acceptEdits` (auto-approve file changes).

Edit `server.ts` to adjust allowed tools or permission mode.
