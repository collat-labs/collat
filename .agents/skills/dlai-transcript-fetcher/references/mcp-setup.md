# Chrome DevTools MCP Setup for DeepLearning.AI Transcript Fetching

## Prerequisites

This skill requires **Chrome DevTools MCP** (`chrome-devtools-mcp`) to be configured and working. It also requires the user to be **logged into DeepLearning.AI** in their Chrome browser — transcripts are only accessible to authenticated users.

## MCP Configuration

Add this to `~/.claude.json` under `mcpServers`:

```json
"chrome-devtools": {
  "args": [
    "chrome-devtools-mcp@latest",
    "--auto-connect"
  ],
  "command": "npx",
  "env": {},
  "type": "stdio"
}
```

### Why `--auto-connect`?

The `--auto-connect` flag enables Chrome 146+'s **Allow remote debugging for this browser instance** feature. Without this flag, the MCP cannot connect to Chrome automatically and would require manual browser configuration each session.

## Browser Setup (Chrome 146+)

### Step 1: Enable Remote Debugging

1. Open Chrome and go to `chrome://inspect/#remote-debugging`
2. Find the toggle: **"Allow remote debugging for this browser instance"**
3. Turn it **ON**

This toggle is a Chrome 146 feature. Without it, the MCP cannot inject scripts into the browser.

### Step 2: Keep Chrome Open

After enabling the toggle, keep the Chrome window open. The MCP connects to this running instance.

### Step 3: Verify Connection

Once configured, try navigating to any DeepLearning.AI lesson page. If the MCP is working, you should be able to:
- Take page snapshots
- Evaluate JavaScript via `performance.getEntries`
- See network requests in the DevTools protocol

## Checking Login State

Transcripts on DeepLearning.AI are only served to logged-in users. Before fetching:

1. Navigate to `https://learn.deeplearning.ai`
2. If you see a login wall instead of course content, the user needs to log in first
3. The VTT URLs themselves do not require auth (they're CDN URLs), but the lesson page that reveals the VTT URL structure requires auth

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| MCP can't connect to Chrome | Remote debugging not enabled | Toggle `chrome://inspect/#remote-debugging` |
| VTT returns 403 | Not logged in | Log into DeepLearning.AI in the Chrome instance |
| No VTT URLs found | Auth required | Must be logged in to see lesson content |
| `performance.getEntries` returns nothing | Page not fully loaded | Wait for page load, or navigate and take snapshot first |
