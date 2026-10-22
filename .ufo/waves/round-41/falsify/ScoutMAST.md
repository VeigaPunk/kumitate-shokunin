RESULT ScoutMAST rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=partial opened=yes categories=3

# ScoutMAST — MAST paper opened; one census observable maps to FM-3.2, the rest to none

Measured at lane `master` = `4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3` (scratch clone
`/fast/scratch/hyaku/kumitate-r41/seats/ScoutMAST/lane`, detached at that commit). No lane file
was written except this report; no tool was installed or upgraded (none needed).

## Source, access, version

- URL: https://arxiv.org/abs/2503.13657 (abs) and https://arxiv.org/html/2503.13657v3 (full text).
- Opened by ordinary HTTP GET, no challenge encountered.
- Access times (UTC): 2026-10-22T17:14:09Z (abs, via arXiv's own text interface) and
  2026-10-22T17:14:20Z (v3 HTML, `HTTP=200 BYTES=1780259`, sha256
  `e54dc4caed74ca80fb6a9a165fac6ae037e438e22878399830f40c0c38cfbb7d`).
- Version: **v3** is the current version. Submission history on the abs page: v1 Mon, 17 Mar 2025
  19:04:38 UTC; v2 Tue, 22 Apr 2025 18:37:24 UTC; v3 Sun, 26 Oct 2025 23:25:18 UTC. The abs page
  reads "[Submitted on 17 Mar 2025 (v1), last revised 26 Oct 2025 (this version, v3)]" and
  `citation_online_date 2025/10/26`. Licence CC BY-NC-ND 4.0. Author list starts Cemri, Pan,
  Yang, Agrawal, Chopra, Tiwari, Keutzer, Parameswaran, Klein, Ramchandran, Zaharia, Gonzalez,
  Stoica (13).
- Headline numbers, v3 abstract: "1600+ annotated traces", "150 traces", "14 unique modes,
  clustered into 3 categories", "kappa = 0.88". Body (§3.4) says "1642 annotated execution
  traces"; the human-annotated subset is `MAST-Data-human`, 21 traces, three experts each (§1).

## Top-level failure categories (3) — quotes, each <= 25 words

Section 4, "The Multi-Agent System Failure Taxonomy":

1. **FC1. System Design Issues** — "Failures originate from system design decisions, and poor or
   ambiguous prompt specifications." (12 words)
2. **FC2. Inter-Agent Misalignment** — "Failures arise from a breakdown in critical information
   flow from inter-agent interaction and coordination during execution." (17 words)
3. **FC3. Task Verification** — "Failures involve inadequate verification processes that fail to
   detect or correct errors, or premature termination of tasks." (17 words)

Mode counts per category, Appendix A: A.1 holds 5 modes (FM-1.1 to FM-1.5), A.2 holds 6
(FM-2.1 to FM-2.6), A.3 holds 3 (FM-3.1 to FM-3.3) — 14 total, matching the abstract.

## Failure mode nearest "a member reports a count it did not verify"

**FM-3.2, "No or incomplete verification"** (Appendix A.3):
" (partial) omission of proper checking or confirmation of task outcomes or system outputs,
potentially allowing errors or inconsistencies to propagate undetected" (quoted head, 17 words
without the trailing clause; the full definition continues "potentially allowing errors or
inconsistencies to propagate undetected").

The paper's own worked example for this mode, Appendix N.7 (MAS AG2, a math task), is not merely
analogous — it is a count error:

- "They did not verify the answer. They counted one number more even if the numbers were listed."
  (17 words)

The trace: the assistant reads nine listed scores, writes "the total quantity of the quizzes
( which is 9 + 1 = 10)", divides by 10 and returns a wrong score of 130. A member of the MAS
states a quantity one larger than the list it can see, without recounting. That is the same shape
as the round-40 slip the round-41 lesson records ("four mutation-tester seats returned results"
against a payload of three, R40-6) — an off-by-one count asserted from memory while the counted
items were on the page. Confidence high that this is the nearest mode.

Runner-up and why it is not the label: **FM-3.3, "Incorrect verification"** — "Failure to
adequately validate or cross-check crucial information or decisions during the iterations" (13
words). FM-3.3 describes a check that ran and was wrong; the count slip is a check that was not
run at all (the seat-gate record was written from memory, with no recount). FM-3.2 is the
omission mode, so FM-3.2 is nearer. If a later lane sentence says the slip was "verified
incorrectly", it has drifted to FM-3.3 and should say which check ran.

Two bounds on this mapping that a citation must carry:

- **Scope.** Section 4 opens by excluding base-model hallucination from the taxonomy's frame:
  "some MAS failures can stem from fundamental limitations of current LLMs, such as hallucination
  or instruction following" (18 words) — MAST then keeps only patterns addressable by design,
  coordination and verification. A fabricated count is a MAST instance **only** when it is framed
  as an omitted verification step, which is exactly how N.7 frames it. A lane sentence that cites
  MAST for "the agent lied about a number" is wider than the paper.
- **Fatality.** Section 5.1: "verification-related failures like 3.2 No or Incomplete Verification
  and 3.3 Incorrect Verification appear frequently even in successful runs" (18 words), filed
  under "Some failures are non-fatal". So citing FM-3.2 does **not** support calling the R40-6
  slip a failure of the round: the paper's own data says this class occurs in successful runs.
  The round-40 round landed its claims, which is consistent with the paper's non-fatal finding.

## Which wave-census observable maps to which mode

Instrument read at `4e58bb0`: `scripts/wave-census.mjs` (16,684 bytes). Observables it prints:
per wave `seats`, `attack`, `reports=<present>/<seats>`, `roles:` map, an `absent:` name list; per
round totals; findings `EXPECT_MISMATCH`, `COUNT_MISMATCH`, `REGISTRY_MISMATCH`, `STRAY_REPORT`,
`EXPECT_UNKNOWN`; and `WAVE_CENSUS: CLEAN|DRIFT` with exit 0/1 (exit 2 fail-closed, 64 usage).

| observable | nearest MAST mode | verdict |
|---|---|---|
| `FINDING EXPECT_MISMATCH` (declared count vs payload role count) | FM-3.2 | **maps.** It is the only observable that mechanically cross-checks a *declared* count against payload bytes, i.e. it forces the recount that N.7 shows the AG2 agent skipped. Bound: it fires only for a count passed as `--expect`; the instrument reads no prose record, so it cannot discover a count stated in `evidence-seat-gate.txt` or a closure. Calling it a detector of R40-6 is wider than the code. |
| `seats=`, `roles:`, `attack=` as printed | FM-3.2 (only through the reader) | **none directly.** These are payload counts, printed under the bare label `seats=`. The instrument's own header says "A payload file proves validation, not dispatch", but that caveat is not in the printed line. A member who reports `seats=34` as "34 seats dispatched" is committing FM-3.2 at the consumption layer; the instrument does not commit it and does not prevent it. |
| `reports=<present>/<seats>`, `absent:` | none | Presence of a file named by a `Report:` trailer. The header already names the reuse limit (round 39 residual seats wrote into `falsify/`, so those count present for both payloads). No mode covers "artifact exists but does not answer the item"; FM-3.2 is the nearest *consumer* risk, not a mapping. |
| `FINDING COUNT_MISMATCH` (envelope `counts.spawn` vs task list) | none | Schema-level consistency of the producer's own envelope. No agent makes a count claim, so no MAST mode applies. |
| `FINDING REGISTRY_MISMATCH` (registry members vs task names) | none | Same: a payload-internal identity check, not agent verification. |
| `FINDING STRAY_REPORT` (report file no task names) | none | Provenance of files; MAST has no mode for untracked artifacts. |
| `FINDING EXPECT_UNKNOWN`, exit 2 fail-closed | none | Input error handling. |
| `WAVE_CENSUS: CLEAN` as a whole | none, and it must not be read as FM-3.2 mitigation for the wave | CLEAN asserts payload-internal consistency only; see the demonstrated gap below. |

## Counter-checks run (each could have failed)

Working directory `/fast/scratch/hyaku/kumitate-r41/seats/ScoutMAST/lane`, HEAD
`4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3`.

1. `node scripts/wave-census.mjs --round 41` →
   `WAVE round=41 wave=build schema=ufo-swarm-wave-dispatch-v1 seats=34 attack=19 reports=0/34
   roles: reviewer=9 scout=8 critic=7 executor=4 mutation-tester=3 scribe=2 connector=1`
   then `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`, `exit=0`.
   The same commit's `.ufo/waves/round-41/evidence-seat-gate.txt` ends: "The wave was never
   dispatched: 0 seats spawned." **CLEAN coexists with 0 spawned seats.** Had the census flagged
   this payload, findings would be >0. This is the strongest operability bound on the C2 verdict
   word: `CLEAN` says nothing about dispatch.
2. `node scripts/wave-census.mjs --round 40 --expect build:mutation-tester=4` →
   `FINDING EXPECT_MISMATCH round=40 wave=build build:mutation-tester=4 payload=3`,
   `WAVE_CENSUS: DRIFT (rounds=1 waves=2 findings=1)`, `exit=1`. The same run printed
   `ROUND round=40 waves=2 seats=67 attack=45 reports=57/67`.
3. `... --expect build:mutation-tester=3` → `exit=0`. (2)+(3) confirm the C2 kill claim.
4. `... --round 40 --expect build:no-such-role=0` → `WAVE_CENSUS: CLEAN ... findings=0`, `exit=0`.
   A mistyped role asserted as 0 passes vacuously (`got = w.roles[role] ?? 0`). Low severity, but
   it means a zero-count assertion is not a check.
5. Untracked-file test: with `mkdir -p .ufo/waves/round-41/falsify` and an untracked
   `falsify/ScoutMAST.md` in place, `git status --porcelain` showed `?? .ufo/waves/round-41/falsify/`
   and `ScoutMAST` disappeared from the census `absent:` list (count of matches = 1). The
   instrument uses `existsSync` on the working tree, so it counts an uncommitted report as
   present. Plan C2's "over committed bytes" is true only because the counter ran in a clean
   clone; the instrument has no git awareness.
6. Trailer coverage: 370 tasks across the seven committed `*-dispatch.json` of rounds 38–41, all
   370 carry a `Report:` trailer, `TRAILER_UNMATCHED 0` against the instrument's `RE_REPORT`
   (which requires a `.ufo/waves/...md` path). Complete on these rounds. A trailer naming a path
   outside `.ufo/waves/` would be silently classed as absent with no finding — not exercised here.

## Existing source row (attack on what is already written)

`corpus/SOURCES.md:31` already carries this paper as **S018**, tier A, status `queued`, opened
2026-10-19, recheck 365d, anchor "§ Abstract; arXiv:2503.13657v3", teaches "MAST: 1600+ traces, 14
failure modes in 3 categories, kappa 0.88". Every number in that row survives re-opening at v3
today; the v3 pin is correct (v3 is still current, revised 26 Oct 2025, i.e. before the row's
2026-10-19 open). One gap to record: the row's `kappa 0.88` is the **human inter-annotator**
agreement (§3.2, over 21 human-annotated traces), not the annotation pipeline's reliability. The
LLM-as-a-judge (§3.3) is "accuracy 94%, Cohen's Kappa of 0.77" against human labels. A later
sentence that cites 0.88 for the automated annotator, or as a quality bound on MAST-Data's 1642
traces, would be wrong by one hop.

Version trap observed, worth one line for anyone quoting: the arXiv text interface returned an
abstract containing "demonstrating improvement headrooms from better MAS design"; that phrase
occurs **0** times in the v3 HTML, which reads "demonstrating opportunities for improvement
through better MAS design". The interface served an older abstract revision for the same URL. A
quote lifted from that output cannot be attributed to v3.

## Remaining unknowns

- MAST's own text does not enumerate which of its 7 frameworks produce a count-without-recount
  failure, and I did not read Appendix E/J/J.1 (failure-mode-to-statistics correlations) in full;
  any lane claim about how often FM-3.2 occurs beyond the §5.1 "non-fatal, also in successful
  runs" sentence is unread here.
- Whether the lane ever publishes an FM-3.2 mapping into `corpus/knowledge/` is not decided by
  this report; S018 stays `queued` and I made no edit to `SOURCES.md`.
- The 14 unpinned severity decisions and R40-1..R40-7 are out of scope for this seat.
