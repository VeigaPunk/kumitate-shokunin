#!/usr/bin/env python3
"""Render mutants.md tables from the harness JSON receipts."""
import json
import re
import sys

S = "/fast/scratch/hyaku/kumitate-r95/K95Mutation"


def short(fails):
    out = []
    for f in fails:
        m = re.match(r"\(([a-z]+)\)", f)
        out.append(m.group(1) if m else f.split(" ")[0])
    return ",".join(out) if out else "-"


def verdict(r):
    if r["selftest_verdict"] == "FAIL":
        return "KILLED-by-selftest"
    if "UNMET" in r["counter_verdict"]:
        return "KILLED-by-counter-only"
    return "SURVIVED"


def table(d):
    rows = []
    for r in d["results"]:
        cv = re.sub(r" tool_sha256=\S+", "", r["counter_verdict"])
        rows.append(f"| `{r['name']}` | {r['intent'].split(': ', 1)[-1]} | {r['selftest_summary'].replace('ROUND_GATE_SELFTEST: ', '')} | {cv} | {verdict(r)} | {short(r['selftest_fails'])} |")
    return "\n".join(rows)


if __name__ == "__main__":
    for label in sys.argv[1:]:
        d = json.load(open(f"{S}/mutants-{label}.json"))
        print(f"### {label} target sha256 `{d['target_sha256']}`\n")
        print("| mutant | change | selftest | counter | verdict | failing arms |")
        print("|---|---|---|---|---|---|")
        print(table(d))
        print()
