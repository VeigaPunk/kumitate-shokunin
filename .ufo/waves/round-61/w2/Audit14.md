# A14 — Quarantine-S116: arXiv 2512.08296 register quote splice — falsification

Seat: `L1Kumitate61.Audit14` (critic, round 61 wave 2, godspeed).
Scope: independently inspect arXiv 2512.08296 (abs page, HTML and PDF across all versions) and
verify the S116 register quote splice claim (abstract 260/six vs §4.1 180/four). No lane files,
gate scripts, SOURCES, lessons or scorecards were edited; findings only. Scratch:
`/tmp/kumitate-r61/Audit14/`.

## Counterexample (mechanism story is wrong; verdict disposition is stale)

The wave-1 claim is that the S116 register quote `We conducted 260 experiments across six benchmarks
spanning deterministic to open-world task structures` is a **splice** of the abstract's
260/six onto §4.1's 180/four (`ScoutQuarantineRegister.md:32,63-69,116-118`; committed lesson
`corpus/lessons/round-61.md:28`).

Additional self-contained evidence: the staged row's own recheck cell (`merge/kumitate/SOURCES.append.md:14`, last cell) records `aaron papers fetch 10.48550/arXiv.2512.08296 -m arxiv \| grep -c '260 experiments'` -> `1 (ran 2026-10-23)` — the stager's fetch (unversioned DOI, resolves to v3) found the quote present. Wave-1's "a re-fetch cannot make it true" (ScoutQuarantineRegister.md:69) is thus also contradicted by the row it analyzed.

**Counterexample:** the quote is **verbatim §4.1 of arXiv:2512.08296v3** (published
2026-04-08). v3 rescoped the paper: §4.1 now reads "We conducted **260** experiments across
**six** benchmarks spanning deterministic to open-world task structures" and the abstract also
reads "Across **260** configurations spanning **six** agentic benchmarks". The splice only exists
as a *cross-version* artifact: v3's §4.1 numbers vs v1/v2's §4.1 wording (180/four). Wave-1
pinned its fetches to `…v1`, read v1's §4.1, compared it against the *current unversioned abstract*
(which serves v3), and concluded a splice — but within any single version the abstract and §4.1
are consistent, and the staged quote is a **direct, verbatim v3 quote**, not a splice. The
register's `payload-absent` verdict (absent-defect-register.md:137) was a checker miss: the
unversioned cited URL resolves to v3, where the quote is present.

Impacted axes: verdict correctness (S116 `absent` → `present-in-v3`), provenance claim (quote was
spliced at staging), and the "only [v1]" version claim (false — v1/v2/v3 exist).

## Evidence (commands, exact verdicts, exits)

All fetches by `curl`/`pdftotext` on 2026-10-25T~15:35Z, HTTP 200. sha256 of local scratch
copies (wave-1 receipt sizes identical: abs 45,963 B; v1 HTML 483,834 B; v1 PDF 2,605,518 B).

| artifact | bytes | verdict |
|---|---|---|
| abs page `arxiv.org/abs/2512.08296` | 45,963 | Submission history lists **[v1] 2025-12-09, [v2] 2025-12-17, [v3] 2026-04-08** — "one arXiv version" is false at wave-1 time and now. Abstract: "Across 260 configurations spanning six agentic benchmarks" (verbatim, now and in wave-1's own bytes). |
| `arxiv.org/html/2512.08296v1` | 483,834 | §4.1: "We conducted 180 experiments across four representative benchmarks spanning deterministic to open-world task structures…" — 180/four, no "260 experiments" anywhere. Quote count 0. |
| `arxiv.org/pdf/2512.08296v1` | 2,605,518 | `pdftotext` → same 180/four §4.1; "We conducted 260 experiments" count 0. |
| `arxiv.org/html/2512.08296v2` | 537,755 | §4.1 180/four; "260 experiments" count 0; "260 configurations" count 0. |
| `arxiv.org/html/2512.08296v3` | 663,997 | §4.1: "We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures: Workbench (…), Finance Agent (…), PlanCraft (…), BrowseComp-Plus (…), SWE-bench Verified (…), and Terminal-Bench (…)." — full quote **count 1**. Abstract "Across 260 configurations spanning six agentic benchmarks" (count 7). No "180 experiments" remaining. |
| `arxiv.org/pdf/2512.08296v3` | 3,441,951 | `pdftotext` → full quote count 1; 180-experiments count 0. |
| `arxiv.org/html/2512.08296` (unversioned) | 663,997 | serves v3 (byte-identical to v3 HTML); full quote count 1. |

Verbatim quote matching per version (normalized whitespace):
`v1:0 | v2:0 | v3:1 | unv:1`; "180 experiments": `v1:2 | v2:2 | v3:0`.

Staged row: `merge/kumitate/SOURCES.append.md:14` S202 — anchor "§ Experiments & Results → § Setup
(Benchmarks)", fetched `aaron papers fetch 10.48550/arXiv.2512.08296 -m arxiv` on 2026-10-23;
its quote "260 configurations across six benchmarks and five architectures…" is v3-faithful.
The wave-1 claim that "the staged S202 quote carries the same spliced sentence" (lesson
round-61.md:28) misattributes a verbatim v3 §4.1 quote as a splice.

## Correct sentence

The correct sentence for the register quote, **verbatim from arXiv:2512.08296v3 §4.1**:

> We conducted 260 experiments across six benchmarks spanning deterministic to open-world task
> structures: Workbench (deterministic code execution and tool use with objective pass/fail
> criteria), Finance Agent (multi-step quantitative reasoning and risk assessment), PlanCraft
> (spatiotemporal planning under constraints), BrowseComp-Plus (dynamic web navigation,
> information extraction, and cross-page synthesis), SWE-bench Verified (real-world software
> engineering; GitHub issue resolution with 7 tools including bash, file editing, and test
> execution), and Terminal-Bench (diverse CLI tasks spanning system administration, security,
> and ML training; 2 tools).

The §4.1 sentence in **v1/v2** (the 180/four wording) is:

> We conducted 180 experiments across four representative benchmarks spanning deterministic to
> open-world task structures: Workbench (deterministic code execution and tool use with objective
> pass/fail criteria), Finance Agent (multi-step quantitative reasoning and risk assessment),
> PlanCraft (spatiotemporal planning under constraints), and BrowseComp-Plus (dynamic web
> navigation, information extraction, and cross-page synthesis).

## Smallest safe correction

1. **S116 verdict:** mark `present-in-v3` (unversioned URL resolves to v3; the quote is verbatim
   in v3 §4.1 and in v3's abstract). The `payload-absent` / fabrication class does not apply.
2. **Splice claim:** rephrase to "the quote matches arXiv:2512.08296v3 §4.1 verbatim; it would
   be a splice only against v1/v2, which say 180/four — and the register's unversioned URL must
   be read against v3, and pinned to a version in the row."
3. **Version claim:** correct "only [v1]" (ScoutQuarantineRegister.md:64,116) to
   "[v1] 2025-12-09, [v2] 2025-12-17, [v3] 2026-04-08"; S202's row should pin
   arXiv:2512.08296v3 (and the cite date) since unversioned arXiv URLs drift.

The register quote is thus not fabricated; the register classifier's
(absent-defect-register.py quote-lint v5, "payload-absent" = fabrication class) was wrong for
this row at the time of compilation (v3 existed since 2026-04-08), and the wave-1 narrative
introduced a cross-version comparison error.
