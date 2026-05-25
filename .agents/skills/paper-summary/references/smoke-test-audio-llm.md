# Smoke Test Set: Audio Recognition with LLMs

## Scope

Use this set to validate `paper-summary` on audio understanding / audio recognition papers.

## Test Papers (5)

1. Qwen2-Audio Technical Report (2024)
- URL: https://arxiv.org/abs/2407.10759
- Focus: unified audio-language model for speech, music, and sound understanding

2. Qwen-Audio: Advancing Universal Audio Understanding via Unified Large-Scale Audio-Language Models (2023)
- URL: https://arxiv.org/abs/2311.07919
- Focus: general audio understanding and dialogue over audio

3. SALMONN: Towards Generic Hearing Abilities for Large Language Models (2023)
- URL: https://arxiv.org/abs/2310.13289
- Focus: speech + non-speech hearing abilities and cross-task understanding

4. Audio Flamingo: A Novel Audio Language Model with Few-Shot Learning and Dialogue Abilities (2024)
- URL: https://arxiv.org/abs/2402.01831
- Focus: instruction-following audio-language dialogue and few-shot behavior

5. MERaLiON-AudioLLM: Bridging Audio and Language with Cross-Modal Auditory Perception in MLLMs (2024)
- URL: https://arxiv.org/abs/2412.09818
- Focus: multimodal audio-language perception and cross-modal reasoning

## Prompt Template

Use one prompt per paper:

`Use $paper-summary to analyze this paper: <arxiv-url>. Return: Research Problem, Methodology, Key Contributions, Experimental Results (with quantitative numbers), Limitations, and LLM-as-Judge JSON.`

## Pass Criteria (Smoke Level)

For each paper output, check:

- All 5 required sections are present.
- Every major claim has evidence text with location (section/table/figure/paragraph).
- At least 2 quantitative experiment numbers are reported if present in the paper.
- No obvious hallucinated datasets, metrics, or claims.
- LLM-as-Judge final_score >= 16.

A paper case is considered pass if at least 4/5 checks pass.

Overall smoke test passes if at least 4/5 papers pass.

## Failure Tags

Use these tags in logs for iteration:

- MISSING_SECTION
- WEAK_EVIDENCE
- MISSING_QUANT
- POSSIBLE_HALLUCINATION
- WRONG_CONTRIBUTION

## Log Template

```json
{
  "paper": "https://arxiv.org/abs/2407.10759",
  "checks": {
    "all_sections": true,
    "evidence_grounded": true,
    "quantitative_results": true,
    "no_hallucination": true,
    "score_threshold": true
  },
  "judge": {
    "accuracy": 0,
    "completeness": 0,
    "coverage": 0,
    "hallucination": 0,
    "final_score": 0
  },
  "tags": [],
  "pass": true
}
```
