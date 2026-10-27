# answers-evidence.md — seat K68ScribeLedgerC (rounds 61-63)

Every row in `rows.md` was checked twice: by the frozen C1 counter's own L3 code (copied verbatim into
`check-ledger-c.mjs`, restricted to rounds 61..63) and by the committed v1 tool
`scripts/routed-ledger.mjs --from 61 --to 63 --classes` over a `git clone --shared` fixture of the lane at
`39f61816d4ee7a8d401df42c1818c91a9c537bce`. Receipts: `v2mirror-clean.txt`, `tool-clean.txt`,
`tool-mutants.txt`, `v2mirror-mutants.txt`, `tool-selftest.txt`, `selfref-repro.txt`, `reanchor.txt`.

Items (the counter's own fence-aware parser, `items67()` at `ledger68-probe.mjs:133`):
`round 61 sections=1 items=6`, `round 62 sections=1 items=5`, `round 63 sections=1 items=6` → 17 items, 17 rows.

## Closed rows — the answer line, verbatim where cited

| row | item sentence (spot-check) | item quote (words) | class | answer line (verbatim excerpt) |
|---|---|---|---|---|
| R61-V2 | "**R61-V2 — frozen counters admit fabrication and reject honest work.**" | "frozen counters admit fabrication and reject honest work" (8) | frozen-predicate-defect | `SCORECARD.md:2962` — "They are **retired, not repaired**: no later claim cites them." |
| R61-V3 | "**R61-V3 — in-place edits to filed bytes in `165b830`.**" | "in-place edits to filed bytes in 165b830" (7) | append-only-violation | `corpus/lessons/round-60.md:140` — "…and retained at the round-60 measured tree. This paragraph records the correction" |
| R61-V4 | "**R61-V4 — R60 fleet-report placeholders.**" | "R60 fleet-report placeholders" (3) | dangling-pointer | `SCORECARD.md:2956` — "R61-V4: the filed fleet report's six placeholders are mapped, one occurrence each, in `w2/R60Erratum.md`" |
| R61-V5 | "**R61-V5 — proxy DRIFT and an unpinned tool.**" | "proxy DRIFT and an unpinned tool" (6) | reference-drift | `SCORECARD.md:2972` — "`proxy-check` FAIL-CLOSED at base (`pin.make-dispatch-actual` unregistered) repaired — the stanza now reads `PROXY: MATCH`" (the stanza refresh's A/C2 terms and the pin itself are on `SCORECARD.md:2956` and `:330`) |
| R61-V6 | "**R61-V6 — dead seat `Audit19`.**" | "dead seat Audit19" (3) | dispatch-accounting | `.ufo/waves/round-62/w1/Audit19.md:1` — "# Audit19 re-queue — Round60-DeadTable (R61-V6 routed item)" |
| R62-1 | "1. **Declare 1–3 claims before any evidence seats run** (§2)." | "Declare 1-3 claims before any evidence seats run" (8) | wave-shape | `SCORECARD.md:2966` — "Plan `.ufo/waves/round-63/plan.md` frozen at `b38a2065…`, committed before the first `.ready` marker (QUALITY Q58: … round 62 → FAIL `NO_PLAN`)" |
| R62-2 | "2. **Run waves through the validator.**" | "Run waves through the validator" (5) | dispatch-accounting | `.ufo/waves/round-63/close/inline63-tip.txt:2` — "INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)" |
| R62-3 | "3. **R61-V2 remains open** (fourth consecutive round noted)" | "R61-V2 remains open (fourth consecutive round noted)" (7) | carried-unaddressed | `SCORECARD.md:2962` — "no later claim cites them." |
| R63-D1 | "**D1 (R56-V3 recurrence, tenth time).**" | "D1 (R56-V3 recurrence, tenth time)" (6) | reference-drift | `corpus/README.md:190` — "…row added in round 64 so the file does not open the next round in DRIFT" |
| R63-D2 | "**D2.** Commit a transcript of `node scripts/inline-dispatch-evidence.mjs --selftest`" | "Commit a transcript of node scripts/inline-dispatch-evidence.mjs --selftest" (8) | verification-gap | `.ufo/waves/round-64/build/K64ExecSelftestTranscripts/transcripts/inline-dispatch-evidence.mjs.txt:70` — "INLINE_DISPATCH_SELFTEST: PASS (69/69)" |
| R63-D3 | "**D3.** Correct the report/lesson count of w2 name collisions" | "Correct the report/lesson count of w2 name collisions" (8) | tally-drift | `corpus/lessons/round-64.md:15` — "…the host store holds three (`find ~/.omp/agent/sessions` …)" |
| R63-D4 | "**D4.** `K_members` 52 → 49 in the proxy stanza masks four missing kimi-root members" | "K_members 52 → 49 in the proxy stanza masks four missing kimi-root members" (13) | tally-drift | `SCORECARD.md:2985` — "**Kimi layer: DEGRADED (routed defect D4).**" |
| R63-D6 | "**D6.** m_flash share counted strictly (44.3%) is below the ≥50% line and the plan's seat band" | "m_flash share counted strictly (44.3%) is below the ≥50% line" (9) | wave-shape | `.ufo/waves/round-65/plan.md:127` — "m_flash share (executor/scribe/simplifier) >= 50% planned per wave; attack roles >= 25%." |

None of the 13 answer quotes contains a `|` (a pipe splits the 7-cell row) and none is over 25 words.
`reanchor.txt` re-derives every `path:line` in the current worktree: `REANCHOR: CLEAN problems=0`.
Line-shift risk: `SCORECARD.md` is appended at EOF (lines 2956/2962/2966/2972/2985 hold), `corpus/README.md`
gains rows only below 190 (path order), and `.ufo/waves/round-6{0,2,3,4,5}/…` are frozen. If the L1 edits any
of those files in place before integrating, re-run `node reanchor.mjs <lane> rows.md` and patch the numbers.

## Open rows — why, and the exact evidence that would close each

| row | class | reason | evidence measured this round |
|---|---|---|---|
| R61-V1 | uncommitted-work | the item demands a bundle of *each* fixture; only the C2 fixture is committed | `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` present (16,488,385 B); `git cat-file -t ab902da2` → `fatal: Not a valid object name ab902da2`; `SCORECARD.md:2954` says the C1 repository "was absent … and was not synthesized" |
| R62-4 | verification-gap | the item asks for "a ledger row" for the `RevS126Quote.md` anomaly; the ledger cannot answer itself | `selfref-repro.txt`: closing it on `corpus/routed-ledger.md:9` → `FINDING ANSWER_DEAD R62-4@line16:answer-path-not-allowed:corpus/routed-ledger.md`, exit 1 (frozen mirror: `R62-4:answer-path-forbidden`). No lane prose records the disposition — the only mentions outside the spot-check are carry-forward re-listings (`corpus/lessons/round-64.md:124`, `corpus/lessons/round-65.md:130`) |
| R62-5 | citation-integrity | the six W04 duplicate-URL warnings still print at the round-68 base | `.ufo/waves/round-68/base/census-before.txt`: `W04 S034`, `S068`, `S084`, `S095`, `S123`, `S126`, then `kumitate ok`, `exit=0` (`grep -c W04` → 6) |
| R63-D5 | carried-unaddressed | the carried block (Audit19 residuals, the Q51 hash, the six W04 groups, the counters' declared holes) is still open | `git cat-file -t 9237a72` → `fatal: Not a valid object name 9237a72`; the six W04 lines above; Audit19 residuals unchanged (R62-4) |

An `open` row is not a hole in the frozen predicate: L3 counts a row's class before it looks at the status
(`ledger68-probe.mjs:249`, the `classes.set` branch sits above the `status === 'open'` branch at `:250`), so
the four opens still contribute to `classes=` and to the round spans. Measured: this 17-row draft, with its
four opens, prints `classes=11` in both `--classes` runs (`tool-clean.txt`, `v2mirror-clean.txt`).

## Classes — reused tokens, no new slug

All 11 slugs used here come from the canonical 13-slug set of seat `K66ScribeClasses`
(`.ufo/waves/round-66/build/K66ScribeClasses/classes.md`), which also carries the per-item assignment. Merging
my 17 rows into its 57-row assignment gives **zero class disagreements** (round/item keys), so the round-66
seat's slugs `census-warning` (63-D4) and `dispatch-evidence` (62-2) are superseded by the canonical
`tally-drift` / `dispatch-accounting`. Span table: `span-table.md` (57 items, 13 classes, **7 classes at ≥ 4
distinct rounds** — `reference-drift` 7, `carried-unaddressed` 6, `dispatch-accounting` 5, `tally-drift`,
`citation-integrity`, `report-fidelity`, `wave-shape` at 4). L3 needs ≥ 5 classes and ≥ 1 at ≥ 4 rounds.

## Integration recipe for the L1

1. `corpus/routed-ledger.md`, under `## Ledger`, header row `| id | round | item | quote | class | status | answer |`
   then the 17 rows of `rows.md` verbatim (a row's `|` count is exactly 8; do not reflow the quotes).
2. `node reanchor.mjs <lane> rows.md` → expect `REANCHOR: CLEAN problems=0`; patch any `DRIFT` line number.
3. `node scripts/routed-ledger.mjs --root <lane> --from 61 --to 63 --classes` → expect
   `ROUTED_LEDGER: CLEAN spotchecks=3 sections=3 items=17 rows=17 open=4 closed=13 wontfix=0` exit 0.
4. Flip instructions: R63-D6 → `open` if the L1 judges a plan rule that died with round 65 not a close
   (see the report's finding -1); R61-V1 stays `open` until a C1 fixture is reproducible or the item is
   re-scoped by an appended correction; R62-4 stays `open` until a non-ledger line records the disposition.
