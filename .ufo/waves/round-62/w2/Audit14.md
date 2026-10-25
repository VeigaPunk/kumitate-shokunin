# Audit14 — Quarantine-S116 independent verification

**Agent:** L1Kumitate62.Audit14 (critic)
**Date:** 2026-10-25
**Task:** Independently inspect arXiv 2512.08296 and verify the S116 register quote splice (abstract 260/six vs §4.1 180/four); cite source and the correct sentence.
**Mode:** read-only falsification wave, lane repo only.

---

## 1. Verdict summary

The inherited round-61 predicate **"S116 payload-absent — quote `We conducted 260 experiments across six benchmarks…` splices the abstract (260/six) onto §4.1 (180/four); the paper has only `[v1]`, so a re-fetch cannot make it true"** is **version-dependent and, against the currently served document, false**:

- Against **v1/v2** (9/17 Dec 2025): the splice judgment **holds** — the quoted sentence exists nowhere verbatim; §4.1 reads 180/four and the abstracts list four benchmarks (no 260, no six).
- Against **v3** (8 Apr 2026, currently served by the cited unversioned URL): the quoted sentence exists **verbatim in §4.1**, and the abstract ("Across 260 configurations spanning six agentic benchmarks") is consistent with it — so **payload-absent is false** and the splice characterization is obsolete for the cited source as of today.

The round-61 scout's factual basis ("only `[v1]`"; "re-fetch cannot fix") is **refuted**: arXiv carries three versions, and the current one contains the sentence.

## 2. Sources fetched (all on 2026-10-25)

| Source | What it shows |
|---|---|
| `https://arxiv.org/abs/2512.08296` (raw HTML, current) | Dateline: "Submitted on 9 Dec 2025 (v1), last revised 8 Apr 2026 (this version, v3)". Submission history: v1 2025-12-09, v2 2025-12-17, v3 2026-04-08. Abstract: "Across 260 configurations spanning six agentic benchmarks, five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid), and three LLM families, we perform controlled evaluations, standardizing tools, prompts, and compute to isolate architectural effects." |
| `https://arxiv.org/abs/2512.08296v1` | Abstract says "We evaluate this across four diverse benchmarks: Finance-Agent, BrowseComp-Plus, PlanCraft, and Workbench." — no 260, no six benchmarks. |
| `https://arxiv.org/abs/2512.08296v2` | Abstract says "We evaluate this across four benchmarks: Finance-Agent, BrowseComp-Plus, …" — no 260, no six benchmarks. |
| `https://arxiv.org/html/2512.08296v1` §4.1 (Setup → Benchmarks) | "We conducted 180 experiments across four representative benchmarks spanning deterministic to open-world task structures: Workbench (deterministic code execution and tool use with objective pass/fail criteria), Finance Agent (multi-step quantitative reasoning and risk assessment), PlanCraft (spatiotemporal planning under constraints), and BrowseComp-Plus (dynamic web navigation, information extraction, and cross-page synthesis)." `grep '260 experiments'` → 0 matches. |
| `https://arxiv.org/html/2512.08296v2` §4.1 | Identical 180/four sentence (same four-benchmark list). |
| `https://arxiv.org/html/2512.08296v3` §4.1 (heading `### 4.1 Setup` / `#### Benchmarks.`) | "We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures: Workbench (deterministic code execution and tool use with objective pass/fail criteria), Finance Agent (multi-step quantitative reasoning and risk assessment), PlanCraft (spatiotemporal planning under constraints), BrowseComp-Plus (dynamic web navigation, information extraction, and cross-page synthesis), SWE-bench Verified (real-world software engineering; GitHub issue resolution with 7 tools including bash, file editing, and test execution), and Terminal-Bench (diverse CLI tasks spanning system administration, security, and ML training; 2 tools)." `grep '180 experiments'`/`'four representative'` → 0 matches. |
| `https://arxiv.org/pdf/2512.08296v3` (pdftotext) | p.1 abstract: "Across 260 configurations spanning six agentic benchmarks"; §4.1: "Benchmarks. We conducted 260 experiments across six benchmarks spanning deterministic to …" — corroborates v3 HTML. |

Register row (as recorded in round-61 lane artifacts; the register itself is outside this lane): **S116**, quoted sentence **"We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures"**, cited source unversioned `arxiv.org/abs/2512.08296` (e.g. `.ufo/waves/round-61/build/ScoutQuarantineRegister/verdicts.md:44,98`).

## 3. Analysis

1. **The splice is real — for v1/v2.** Neither the v1/v2 abstract (four benchmarks) nor their §4.1 (180/four) contains the quoted wording; the quoted sentence fuses a 260/six count with §4.1's sentence template. If the register row was captured against Dec-2025 versions (or if the source is pinned to v1/v2), the `payload-absent` verdict is correct for that state.
2. **The current document refutes it.** The cited URL is unversioned and today serves v3 (since 2026-04-08). v3 §4.1 contains the quoted sentence verbatim; v3's abstract ("Across 260 configurations spanning six agentic benchmarks") is consistent with it — no splice exists in v3. Hence "payload-absent" and "a re-fetch cannot make it true" are false for the cited source as served now.
3. **Round-61 internal contradiction resolved.** `ScoutQuarantineRegister/verdicts.md:103` claims "The only arXiv version is `[v1]`", while the same build's later note (`verdicts.md:236-240`) states "currently serves v3; v3 §4.1 contains the quoted 260/six sentence verbatim. Versions v1/v2 contain the older 180/four sentence." My independent fetch confirms the second reading: v2 exists (2025-12-17) and v3 exists (2026-04-08). The scout's "only [v1]" claim is wrong, and with it the inference that the quote can never be found.

## 4. Correct sentences (verbatim, with locations)

- **v3 abstract (current)**: "Across 260 configurations spanning six agentic benchmarks, five canonical architectures (Single-Agent and four Multi-Agent: Independent, Centralized, Decentralized, Hybrid), and three LLM families, we perform controlled evaluations, standardizing tools, prompts, and compute to isolate architectural effects." (https://arxiv.org/abs/2512.08296)
- **v3 §4.1 (current) — this is the correct, attested version of the register quote**: "We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures: Workbench (deterministic code execution and tool use with objective pass/fail criteria), Finance Agent (multi-step quantitative reasoning and risk assessment), PlanCraft (spatiotemporal planning under constraints), BrowseComp-Plus (dynamic web navigation, information extraction, and cross-page synthesis), SWE-bench Verified (real-world software engineering; GitHub issue resolution with 7 tools including bash, file editing, and test execution), and Terminal-Bench (diverse CLI tasks spanning system administration, security, and ML training; 2 tools)." (https://arxiv.org/html/2512.08296v3 §4.1; PDF-identical)
- **v1/v2 §4.1 (Dec 2025)**: "We conducted 180 experiments across four representative benchmarks spanning deterministic to open-world task structures: Workbench (deterministic code execution and tool use with objective pass/fail criteria), Finance Agent (multi-step quantitative reasoning and risk assessment), PlanCraft (spatiotemporal planning under constraints), and BrowseComp-Plus (dynamic web navigation, information extraction, and cross-page synthesis)." (https://arxiv.org/html/2512.08296v1|v2 §4.1)

## 5. Impacted axes

- **Calibration** (quote fidelity): the register/staged-gate quote is a splice relative to v1/v2, but is genuine v3 text; any correction must be version-relative, not "always a splice".
- **Verifiability** (source pinning): the register cites an unversioned arXiv URL; the verdict flipped with the document's version (v3, 2026-04-08). Claims like "only [v1]" and "re-fetch cannot fix" are not reproducible. A versioned citation (e.g. `…v1` or the submission-date) is the minimal fix.

## 6. Smallest safe correction

For the S116 row and any staged quote carrying the same sentence: **pin the version**. State the register row against `https://arxiv.org/abs/2512.08296v1` (or v2) — where the splice reading is correct and the quoted sentence is genuinely absent — or against the current `v3`, where the correct §4.1 sentence is exactly the quote and must be cited as v3 text. Do not keep the unversioned URL with a verdict that only holds for v1/v2. No adoption/entry decisions are proposed here (read-only falsification wave).
