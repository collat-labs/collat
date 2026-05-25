# dlai-transcript-fetcher

Fetches video transcripts from DeepLearning.AI courses and saves them as organized Markdown files.

## Prerequisites

- Chrome DevTools MCP configured with `--auto-connect` in `~/.claude.json`
- Chrome 146+ with remote debugging enabled at `chrome://inspect/#remote-debugging`
- User logged into DeepLearning.AI in the Chrome browser

See `references/mcp-setup.md` for full setup instructions.

## Usage

When user provides a DeepLearning.AI course URL or asks to download course transcripts.

## How It Works

1. Uses Chrome DevTools MCP to visit the course lesson page
2. Extracts VTT subtitle URLs via `performance.getEntries`
3. Downloads all VTT files and converts them to clean Markdown
4. Saves to `transcripts/` subdirectory with ordered, descriptive filenames
