---
name: dlai-transcript-fetcher
description: Fetch and organize course transcripts from DeepLearning.AI. Use this skill whenever the user mentions DeepLearning.AI courses, wants to download course transcripts, subtitles, or VTT files from a course, or asks to organize lesson transcripts from learn.deeplearning.ai. It does NOT trigger for general video subtitle downloading — only for DeepLearning.AI courses specifically.
---

# DeepLearning.AI Transcript Fetcher

Fetches video transcripts (VTT subtitles) from DeepLearning.AI courses and saves them as clean, organized Markdown files.

## Prerequisites

**Required: Chrome DevTools MCP + user logged into DeepLearning.AI**

Before using this skill, the user must have:
1. Chrome DevTools MCP configured with `--auto-connect` in `~/.claude.json`
2. Chrome 146+ with **"Allow remote debugging for this browser instance"** toggled ON at `chrome://inspect/#remote-debugging`
3. An active DeepLearning.AI login session in Chrome

See [`references/mcp-setup.md`](references/mcp-setup.md) for the full setup guide.

**If the MCP is not configured**, tell the user to follow the setup guide first. Do not attempt to fetch transcripts without it — the VTT URL discovery requires the DevTools protocol.

## When to Use This Skill

- User provides a DeepLearning.AI course URL or mentions wanting the transcript from one
- User asks to "download transcripts" or "get the subtitles" from a course
- User wants to organize lesson transcripts from learn.deeplearning.ai
- User says "fetch the transcript" for any DeepLearning.AI course

## How It Works

The DeepLearning.AI video hosting infrastructure stores VTT subtitles at predictable paths. This skill discovers those paths by examining network requests on the course lesson page.

## Step-by-Step Process

### Step 1: Navigate and Discover VTT URLs

Use Chrome DevTools MCP to navigate to the course's first lesson page. Then evaluate this JavaScript to find all video resources:

```javascript
() => {
  return performance.getEntriesByType('resource')
    .filter(r => r.name.includes('Radixark'))
    .map(r => r.name);
}
```

From the results, extract all unique VTT subtitle URLs. They look like:
- `https://video.deeplearning.ai/Radixark/C1/L0/subtitle/eng/sc-Radixark-C1-L0-eng.vtt`
- `https://video.deeplearning.ai/Radixark/C1/L1/subtitle/eng/sc-Radixark-C1-L1-eng.vtt`
- `https://video.deeplearning.ai/Radixark/C1/Conclusion/subtitle/eng/sc-Radixark-C1-Conclusion-eng.vtt`

**Important mapping rules:**
- Most lessons use the pattern `L{n}/subtitle/eng/sc-Radixark-C1-L{n}-eng.vtt` (L0, L1, L2, ...)
- The **Conclusion** lesson uses the literal word "Conclusion" instead of a number: `Conclusion/subtitle/eng/sc-Radixark-C1-Conclusion-eng.vtt`
- Quiz lessons typically have no transcript (L6 in the C1 course = quiz = no VTT)

### Step 2: Extract All Lesson Slugs

Also extract all lesson page URLs from the sidebar to map slugs to lesson names:

```javascript
() => {
  const links = document.querySelectorAll('a[href*="/lesson/"]');
  return [...new Set([...links].map(l => l.href))];
}
```

### Step 3: Download VTT Files

Use `curl` to download each VTT file. Use the `-L` flag to follow redirects:

```bash
curl -s -L -o "temp_L{n}.vtt" "https://video.deeplearning.ai/Radixark/C1/L{n}/subtitle/eng/sc-Radixark-C1-L{n}-eng.vtt"
```

For the Conclusion lesson:
```bash
curl -s -L -o "temp_Conclusion.vtt" "https://video.deeplearning.ai/Radixark/C1/Conclusion/subtitle/eng/sc-Radixark-C1-Conclusion-eng.vtt"
```

### Step 4: Map Lesson Slugs to L-numbers

Visit each lesson URL individually and run `performance.getEntries` to find its L-number. The first lesson visited gives you the CDN domain and COURSE_ID; subsequent lessons increment L{n}.

Alternative shortcut: once you have one VTT URL (e.g. L0 from the introduction page), increment L{n} sequentially and batch-download them all — most courses number lessons consecutively from L0. Verify by checking the HTTP status; skip any that return 403.

### Step 5: Convert VTT to Markdown

Write and run a Python script to parse the VTT files and output clean Markdown. The script should be placed in the project folder and run from there:

```python
import re, os

# Pattern A (SGLang): sc-Radixark-C1-L{n}-eng.vtt
# Pattern B (Claude Code): sc-Anthropic-C3-L{n}.vtt
# The script handles both — just match the actual filename

files = {
    'claude-code-01-introduction.md': 'temp_L0.vtt',
    'claude-code-02-what-is-claude-code.md': 'temp_L1.vtt',
    # ... fill in based on discovered lesson names
}

for md_name, vtt_name in files.items():
    with open(vtt_name, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    transcript_lines = []
    skip_patterns = ('WEBVTT', 'X-TIMESTAMP-MAP')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith(skip_patterns):
            i += 1
            continue
        if re.match(r'^\d+$', line):  # cue id
            i += 1
            continue
        if '-->' in line:  # timestamp
            i += 1
            continue
        transcript_lines.append(line)
        i += 1
    
    text = ' '.join(transcript_lines)
    text = re.sub(r'\s+', ' ', text).strip()
    
    with open(md_name, 'w', encoding='utf-8') as f:
        f.write(f'# {md_name.replace(".md","").replace("-"," ").title()}\n\n')
        f.write(f'> Source: DeepLearning.AI\n\n---\n\n{text}\n')
```

### Step 6: Organize Output

Save all `.md` files to a `transcripts/` subdirectory within the target project folder. Original `.vtt` files can be kept alongside for reference.

## VTT URL Patterns Reference

VTT URLs are discovered via `performance.getEntries` on the lesson page — do not guess the URL structure. However, after discovering one VTT URL, you can infer the pattern for that course.

### CDN & Course ID Discovery

Each course has its own CDN domain and course ID. From a VTT URL:
```
https://{CDN}/{COURSE_ID}/{LESSON_ID}/subtitle/eng/sc-{COURSE_ID}-{LESSON_ID}[-eng].vtt
```

Examples from real courses:
| Course | CDN | Course ID | VTT Pattern |
|--------|-----|-----------|-------------|
| SGLang | `video.deeplearning.ai` | `Radixark/C1` | `sc-Radixark-C1-L{n}[-eng].vtt` |
| Claude Code | `dyckms5inbsqq.cloudfront.net` | `Anthropic/C3` | `sc-Anthropic-C3-L{n}.vtt` |

### Lesson ID Format

- Most lessons use `L{n}` (L0, L1, L2, ...)
- The **Conclusion** lesson may use `Conclusion` (literal word) instead of a number — always discover from network requests
- Quiz lessons typically have no VTT transcript

### VTT Filename Suffix

Some courses use `sc-{COURSE_ID}-L{n}.vtt` (no suffix), others use `sc-{COURSE_ID}-L{n}-eng.vtt`. Always check the actual discovered URL — the script should extract from what exists, not assume a suffix.

### General Workflow

1. Navigate to any lesson page
2. Run `performance.getEntries` to find at least one VTT URL
3. Extract CDN domain, COURSE_ID, and LESSON_ID from that URL
4. Infer the pattern for other lessons (L0, L1, L2, ... or "Conclusion")
5. Try downloading; if 403, skip that lesson

## Known Edge Cases

1. **403 on some VTT URLs**: If a lesson returns 403, skip it — quiz lessons typically have no transcript. Some courses also have non-video pages (e.g., "course-notes", "prompts & summaries") that have no VTT.

2. **Named lesson IDs**: "Conclusion" uses literal "Conclusion" instead of a number. Some courses may have other named lessons. Always discover via `performance.getEntries`.

3. **VTT filename suffix varies**: Some courses use `sc-{id}-L{n}.vtt` (no suffix), others use `sc-{id}-L{n}-eng.vtt`. Always discover the actual filename from the lesson page — do not assume either form.

4. **CDN and COURSE_ID vary per course**: Each course has its own CDN domain and course ID. Never hardcode `video.deeplearning.ai` or `Radixark/C1` — extract from the actual VTT URL discovered on the page.

5. **Sidebar lesson count ≠ VTT count**: Courses often have non-video lessons (course-notes, prompts & summaries, quiz) that won't have VTT files. Only count the L-numbered lessons.
