# K63R2ReviewEntryLimits — proposed entry repairs (for the L1 to integrate; I own nothing in corpus/)

Target: `corpus/knowledge/multi-agent-coordinator-topologies.md` at a9531c8e617338fd16cb69c61344ef8f17711117.
Each item names the QUALITY criterion it repairs. All capture facts below were re-verified by me against
`.ufo/waves/round-63/build/K63Capture/{arxiv-2512.08296v3.html,bailian-managed-agents-multiagent.md}` (sha256
df31beb3… / 7ea43966…, pins in `.ufo/pins/source-captures.json`).

## P1 — Q6 (cite-check errors; reject gate)

Line 4's `-o live.md && grep -c coordinator live.md` tokenizes as two UNRESOLVED citations
(`live.md not found under src` ×2, severity error). Minimal repair — rename the temp file so no `.md`
token appears:

```diff
-recheck: 90d — `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' https://arxiv.org/html/2512.08296v3 -o live.html && grep -c '260 experiments' live.html` -> 2; `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md' -o live.md && grep -c coordinator live.md` -> 11 (both run 2026-10-25; 663997 and 3388 bytes, byte-identical to this round's captures)
+recheck: 90d — `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' https://arxiv.org/html/2512.08296v3 -o live.html && grep -c '260 experiments' live.html` -> 2; `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' 'https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md' -o bailian-live.txt && grep -c coordinator bailian-live.txt` -> 11 (both run 2026-10-25; 663997 and 3388 bytes, byte-identical to this round's captures)
```

(`live.html` does not trip the checker; only the `.md` token does. Re-run the How-to-apply per-file
command after the edit; it must print 0 for this file.)

## P2 — Q2/Q4 (contradicted absence-claim)

Capture (Figure 3 caption): "Cost-Performance Trade-offs Across Model Families and Architectures … mean
agentic performance (%) versus normalized cost per experiment (USD)" over "180 configurations with full
cost tracking"; §4.1 metrics include "success per 1,000 tokens and cost-normalized performance". "No cost
comparison" is false; wall-clock/latency remain unmeasured (qualitative discussion only).

```diff
-  and tool-call access. The percentages are fixed-budget percentages; the study reports no cost, latency or
-  wall-clock comparison (§4.1).
+  and tool-call access. The percentages are fixed-budget percentages; the study reports no latency or
+  wall-clock comparison, and its cost evidence (Figure 3: normalized USD cost per experiment against
+  performance, 180 configurations with full cost tracking) is not budget-matched to the headline
+  percentages (§4.1).
```

## P3 — Q8 (version-skew content unnamed)

Lane bytes (K63ScoutArxivOpen, 2026-10-25): v1/v2 read "180 experiments across four representative
benchmarks" / "four diverse benchmarks"; v3 reads 260/six; v3's own Figure 3 caption still carries one
stale "180 configurations" (`grep -c '180 configurations' <capture>` → 1).

```diff
-- **Version scope.** arXiv 2512.08296v3 (08 Apr 2026) and the vendor page as served 2026-10-25; earlier paper
-  versions and later vendor changes are out of scope. Benchmarks are named per S197 Table 1; the mapping of those
+- **Version scope.** arXiv 2512.08296v3 (08 Apr 2026) and the vendor page as served 2026-10-25. v1/v2 (Dec 2025)
+  read 180 experiments across four benchmarks — every headline number here is v3-only — and v3 itself still
+  carries one stale "180 configurations" in its Figure 3 caption; do not cite it as the setup figure. Later
+  paper versions and vendor changes are out of scope. Benchmarks are named per S197 Table 1; the mapping of those
```

## P4 — Q4 (unknowns named UNKNOWN)

```diff
-  count against the 1–20 bound: neither source says [INFERENCE: unspecified].
+  count against the 1–20 bound: neither source says — UNKNOWN.
```

## P5 — Q1 (verified-at carries the version observed; house form per at-least-once-dedupe.md:2)

```diff
-verified-at: 2026-10-25
+verified-at: 2026-10-25 (arXiv:2512.08296v3, 08 Apr 2026; Bailian `.md` rendering as served 2026-10-25)
```

## P6 — Q1 (exact anchor)

Capture headings are 多智能体协作 / 编队配置 / 配置示例 / 下一步; the third referent is the field-table
intro "`agents` 中每个条目的字段：" (capture line 24) inside § 编队配置.

```diff
-— § 多智能体协作, § 编队配置, § agents 条目字段 (the `.md` rendering; the bare page is the HTML build)
+— § 多智能体协作, § 编队配置 (its `agents` per-entry field table, "`agents` 中每个条目的字段：") (the `.md` rendering; the bare page is the HTML build)
```
