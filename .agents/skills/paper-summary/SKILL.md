---
name: paper-summary
description: Research-grade single-paper analysis with evidence-grounded structured extraction and internal self-evaluation. Use when users ask to summarize or screen one academic paper from an arXiv link/ID or local PDF and need verifiable claims with citations, especially for Chinese-language output to students.
---

# paper-summary

This skill is a research-grade academic paper analysis workflow. It does not only summarize papers. It extracts verifiable, structured scientific knowledge and evaluates quality before finalizing output.

## Core Features

- Structured academic information extraction
- Evidence-grounded outputs with traceable locations
- Hallucination minimization through strict source constraints
- LLM-as-Judge quality scoring
- Self-refinement loop for quality improvement

## Supported Inputs

Exactly one paper per run:

- arXiv links
- arXiv IDs
- Local PDF files

If the user provides multiple papers, ask the user to choose one and do not run batch analysis.

## Workflow (Strict Execution)

### Step 1: Document Parsing

Identify and map core sections:

- Abstract
- Introduction
- Method
- Experiments
- Conclusion

### Step 2: Structured Extraction

Extract the following elements strictly from the paper:

#### Research Problem

- State the exact problem being solved.
- Avoid generic or field-level statements.

#### Methodology

- Core idea
- Model or framework
- Key techniques

#### Key Contributions

- Include explicit contributions only.
- Prefer author-provided numbered contributions when available.

#### Experimental Results

- Dataset names
- Metrics (for example: Accuracy, BLEU, F1)
- Quantitative improvements

#### Limitations

- Include only if explicitly mentioned.
- Otherwise return: "未明确说明（Not explicitly stated）"

### Step 3: Evidence Grounding (Critical)

For every extracted claim:

- Provide direct evidence from the paper.
- Quote or paraphrase with location markers (section, table, figure, or paragraph reference when possible).

Example:

Method:
The paper proposes a transformer-based architecture for sequence modeling.

Evidence:
"We introduce a transformer-based model..." (Method section)

### Step 4: Initial Summary Generation

Generate a structured summary only from extracted elements and grounded evidence.

### Step 5: LLM-as-Judge Evaluation

Score the draft summary:

- Accuracy (0-5): factual correctness against source
- Completeness (0-5): required fields sufficiently covered
- Coverage (0-5): core problem, method, contribution, results included
- Hallucination (0-5): unsupported content level (higher means worse)

Compute:

- final_score = accuracy + completeness + coverage + (5 - hallucination)
- Use scores for internal quality control and refinement only.
- Do not expose score JSON in user-facing final output.

### Step 6: Self-Refinement Loop

If any condition is true:

- `final_score < 16`
- `accuracy < 4`
- `hallucination > 1`

Then:

- Identify weak sections and unsupported claims.
- Regenerate only weak parts with stronger grounding.
- Repeat at most 2 iterations.

### Step 7: Evaluation Logging for Iteration

When possible, append a compact test log:

- Paper identifier
- Scores before and after refinement
- Main error types fixed (missing result, vague method, unsupported claim)
- Final pass or fail status

Use this log to identify recurring failure patterns and improve prompts or structure.

## Final Output Structure

Final answer must be in Chinese.

### 标题

### 研究问题

- 证据

### 方法

- 证据

### 关键贡献

- 证据

### 实验结果（包含具体数字）

- 证据

### 局限性

- 证据

## Hard Constraints (Mandatory)

- Do not hallucinate missing information.
- If uncertain, output exactly: "未明确说明（Not explicitly stated）".
- Include evidence for every major claim.
- Include quantitative results when available.
- Do not generalize beyond paper content.
- Process exactly one paper per invocation.
- If multiple papers are provided, stop and ask the user to pick one paper first.
- Do not output LLM-as-Judge score JSON to users.
- Use Chinese headings and Chinese narrative in final output.

## Example Command

`summary paper https://arxiv.org/pdf/2304.13712`

## Scripts (Optional)

- Aggregate smoke test outcomes:
  `python scripts/evaluate_smoke_results.py references/smoke-results --json`

## Intended Use

- Literature review acceleration
- Research comparison
- Academic analysis
- Relevance screening

## Notes

This is a research-oriented skill, not a casual summarization helper.
Prioritize precision, verifiability, and scientific rigor over style.
