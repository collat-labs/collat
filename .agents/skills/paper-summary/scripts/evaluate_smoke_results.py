#!/usr/bin/env python3
"""
Aggregate paper-summary smoke test logs.

Expected input files:
- A directory containing JSON files.
- Each JSON file follows the log template from references/smoke-test-audio-llm.md.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Aggregate smoke test results.")
    parser.add_argument(
        "results_dir",
        help="Directory containing per-paper JSON result files.",
    )
    parser.add_argument(
        "--min-check-pass",
        type=int,
        default=4,
        help="Minimum number of passed checks for a paper to count as pass when file.pass is missing (default: 4).",
    )
    parser.add_argument(
        "--min-paper-pass",
        type=int,
        default=4,
        help="Minimum number of passed papers for overall smoke pass (default: 4).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print machine-readable JSON summary.",
    )
    return parser.parse_args()


def safe_load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8-sig") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError(f"{path.name}: top-level JSON must be an object")
    return data


def paper_pass(item: dict[str, Any], min_check_pass: int) -> tuple[bool, int]:
    checks = item.get("checks", {})
    if not isinstance(checks, dict):
        checks = {}
    check_true_count = sum(1 for v in checks.values() if v is True)

    explicit = item.get("pass")
    if isinstance(explicit, bool):
        return explicit, check_true_count
    return check_true_count >= min_check_pass, check_true_count


def main() -> int:
    args = parse_args()
    results_dir = Path(args.results_dir)
    if not results_dir.exists() or not results_dir.is_dir():
        raise SystemExit(f"Results directory not found: {results_dir}")

    files = sorted(results_dir.glob("*.json"))
    if not files:
        raise SystemExit(f"No JSON files found under: {results_dir}")

    items: list[dict[str, Any]] = []
    for path in files:
        try:
            data = safe_load_json(path)
        except Exception as exc:  # noqa: BLE001
            raise SystemExit(f"Failed to parse {path}: {exc}") from exc
        data["_file"] = path.name
        items.append(data)

    paper_details: list[dict[str, Any]] = []
    for item in items:
        passed, passed_checks = paper_pass(item, args.min_check_pass)
        paper_details.append(
            {
                "file": item.get("_file", ""),
                "paper": item.get("paper", ""),
                "passed": passed,
                "passed_checks": passed_checks,
                "tags": item.get("tags", []),
            }
        )

    passed_papers = sum(1 for it in paper_details if it["passed"])
    total_papers = len(paper_details)
    overall_pass = passed_papers >= args.min_paper_pass

    summary = {
        "total_papers": total_papers,
        "passed_papers": passed_papers,
        "failed_papers": total_papers - passed_papers,
        "threshold_passed_papers": args.min_paper_pass,
        "overall_pass": overall_pass,
        "details": paper_details,
    }

    if args.json:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
    else:
        print(f"Total papers: {total_papers}")
        print(f"Passed papers: {passed_papers}")
        print(f"Failed papers: {total_papers - passed_papers}")
        print(f"Overall pass: {overall_pass}")
        for detail in paper_details:
            print(
                f"- {detail['file']}: pass={detail['passed']}, "
                f"checks={detail['passed_checks']}, tags={detail['tags']}"
            )

    return 0 if overall_pass else 2


if __name__ == "__main__":
    raise SystemExit(main())
