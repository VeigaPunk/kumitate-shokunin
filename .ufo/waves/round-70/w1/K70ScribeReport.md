# K70ScribeReport — round-70 fleet-report section checklist and SHONEN four canonical boxes

Seat: K70ScribeReport (scribe, leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Axis: operability (integer held at terminal 9). Milestone: ScribeReport.

Frozen inputs read (read-only): plan commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`; base B
`78b98d762ccf3e3a0961f94c4042eaabd2bcb706`; probe `.ufo/waves/round-70/probe/replay70-probe.mjs`
sha256 `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (matches its
`counter-pins.json` entry `replay70-probe`, observed).

Scope: draft the **checklist** the round-70 fleet report must satisfy and draft the **SHONEN
four-box assessment**. The fleet report itself is **not** created by this seat. No production file
was written or edited, and no unrun outcome is asserted as observed.

Full artifact: `.ufo/waves/round-70/build/K70ScribeReport/report-section-checklist.md`
(six required sections with content contracts, the SHONEN four-box draft with pointers, the hash
citation rules, and a 10-step pre-flight for L1). Experiment fixtures and their observed outputs:
`.ufo/waves/round-70/build/K70ScribeReport/experiments/`.

Report: `.ufo/waves/round-70/w1/K70ScribeReport.md`.

---

## Axes (named)

1. **Primary (judged): operability.** Round-70 claims one predicate only — C1 `REPLAY70_HELD` 10/10
   on the ten bounded replay obligations, the integer held at terminal 9. This seat does not score,
   re-run, or amend that predicate and claims no coverage score.
2. **Report conformance.** The report must satisfy three independent parsers at once:
   `scripts/report-receipt-diff.mjs` (six sections + tallies + receipts + hashes),
   `scripts/round-gate.mjs` (size/headings/round identity/SHONEN/record trio), and the fleet
   driver's own `report_of()` predicate (SHONEN marker + ≥ 400 bytes + freshness). Each has its own
   traps; the checklist below is derived from **observed** behaviour of all three, not from prose.
3. **Honesty of the close.** A report that claims `REPLAY70_HELD held=10/10` without a committed
   receipt carrying that pair is a defect, not a formality. The diff gate catches it
   (`TALLY_UNRECEIPTED`, observed).
4. **Preservation of misses.** The predicate is never amended after scoring; a partial
   `held=x/10` must be reported as such with the missing check ids named.

## Prerequisite that blocks the report — WAVE-DONE and results reconciliation

The plan's wave clause: *"No report before WAVE-DONE and results reconciliation."* Observed
snapshots (both taken by this seat, in the lane, read-only):

| Fact | Observed at 2026-10-30T12:40:08-03:00 | Observed at 2026-10-30T12:43:49-03:00 |
|---|---|---|
| `.ufo/waves/round-70/w1-results.json` | absent | absent |
| `.ufo/waves/round-70/close/` | absent | absent |
| Seat reports present (`w1/*.md`) | 45 / 64 | 47 / 64 |
| `w1.ready.partial` entries | 61 / 64 | 62 / 64 |
| `wave-census --round 70` | `seats=64 attack=37 reports=45/64` | `seats=64 attack=37 reports=47/64` |

The wave is **still in flight** (report count rising, ready-partial still filling). The close
receipts, the wave reconciliation file, the `SCORECARD.md` row and the `LOG.md` admission line do
not exist yet — every one of them is something the report cites.

**Highlight for L1: the report cannot be filed from the current state.** Step 1 of the pre-flight
below is a hard gate, not a formality.

## The six required sections, in order — and what each must carry

`scripts/report-receipt-diff.mjs` (`REQUIRED`, contract `kumitate-report-receipt-diff-v3`) requires
these headings **in this order** (`SECTION_ORDER` fires otherwise), each with a non-empty body
(`SECTION_EMPTY`):

1. `## Work performed` — work + evidence pointers (paths, commands, diffs), cross-domain evidence
   with its owning domain (`PROTOCOL.md:147-148`).
2. `## Landed changes` — each landed change tied to a `LOG.md` entry (`PROTOCOL.md:149-150`;
   QUALITY Q11).
3. `## Before → after measurements` — counting command, before, after, verdict, evidence pointer
   (`PROTOCOL.md:150`).
4. `## Sources & frontier` — `SOURCES.md` rows before→after with the counting command, rows added
   by tier, rows touched old→new, frontier rows advanced (`PROTOCOL.md:156-162`).
5. `## Trend verdicts` — expansion / quality / discernment.
6. `## SHONEN` — exactly one such heading, ≥ 4 box lines.

Observed arms (each a real file, run against the real tool; full transcript in
`experiments/report-receipt-diff-arms.txt`):

| Arm | Observed output | Exit |
|---|---|---|
| Baseline draft (6 sections, 4 boxes) | `REPORT_RECEIPT: CLEAN (round=70 rev=1e00955a… bytes=552 report_sha256=1fefbb2d905b)` | 0 |
| Sections reordered | `DRIFT SECTION_ORDER` — `SECTION_ORDER SHONEN before Trend verdicts` | 1 |
| Second `## SHONEN` heading | `DRIFT SHONEN_COUNT` — `SHONEN_COUNT headings=2` | 1 |
| Section with no body | `DRIFT SECTION_EMPTY` — `SECTION_EMPTY Trend verdicts` | 1 |
| `REPLAY70_HELD held=10/10` with no backing receipt | `DRIFT TALLY_UNRECEIPTED` — `TALLY_UNRECEIPTED REPLAY70_HELD held=10/10` | 1 |
| Cited receipt path absent at the rev | `DRIFT RECEIPT_MISSING` — `RECEIPT_MISSING .ufo/waves/round-70/close/replay70-M.txt` | 1 |
| `held=7/7 checks=6` against a `checks=7` receipt | `DRIFT TALLY_CHECKS_MISMATCH` — `TALLY_CHECKS_MISMATCH LEDGER69_HELD held=7/7 checks=6` | 1 |
| `held=7/7 checks=7` against a `checks=7` receipt | no `TALLY_*` finding | 1 |

The tally rule has a scoping clause that matters for round 70: when the claim's own line cites
receipts, only those receipts may carry the pair. The "before" cell may cite
`base/replay70-base.txt` (which carries `REPLAY70_UNMET held=2/10 checks=10`); the "after" cell
needs a **committed close receipt** carrying `REPLAY70_HELD held=10/10` at the measured revision,
cited on the same line.

## Round-70 content already measured by this seat (to be stated in the report)

- **The claim and its command:** `TMPDIR=/fast/scratch/hyaku/kumitate-r70/L1 node
  .ufo/waves/round-70/probe/replay70-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin REV`.
  The base receipt (committed file, quoted — **not** a run by this seat) reads
  `REPLAY70_UNMET held=2/10 checks=10 rev=78b98d76… rule=R70 live=no-live(vacuous-declared)`, R1 and
  R9 PASS, the rest MISS, exit 1.
- **The wave:** `wave-census --round 70` → `seats=64 attack=37`. Roles from `w1-spec.json`:
  critic 16, reviewer 16, executor 13, scout 6, scribe 6, mutation-tester 5, connector 2. The
  attack number uses `wave-census`'s own `ATTACK` set (`reviewer, critic, mutation-tester, labrat`,
  `scripts/wave-census.mjs:55`) — the report must **state the definition**, not only the number;
  the plan asks for "at least 16 attack roles".
- **Freeze discipline:** `bash scripts/plan-before-ready.sh --round 70` → `PLAN_BEFORE_READY: PASS
  … plan=3dbe7e6e… marker=1e00955a… map=CLEAN files=169 rows=169 covered=169`, exit 0. Base freeze
  receipt `base/freeze-map.txt` reads `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0.
- **Sources & frontier numbers** (computed from committed bytes, base vs HEAD):
  rows 155 → 156; **added**: S217 (own-work, tier A, status `mined`, opened 2026-10-30, recheck
  `on-release`, used-by `corpus/lessons/round-70.md`); **removed**: 0; **touched old→new**: 0 (no
  status transition and no used-by change on any pre-existing row); tiers A 132→133, B 15→15,
  C 8→8; status mined 123→124, queued 13→13, rejected 19→19. Counting command:
  `grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md`.
  Census before/after body identical — six carried W04 duplicate-URL warnings plus
  `kumitate ok …`, exit 0 (diffed against `base/sources.txt`).
- **Frontier step:** S217 is the opened own-work source (frozen round-69 `c2-controls.sh` at B),
  not external authority; expansion **unchanged** (no new uncovered knowledge entry); assimilation
  **none**; one considerthese proposal mined (2026-10-26 idea 4, round-size band accounting) with
  the negative control `base/band-control.json` (`rule: campaign-round-band-64-128`).
- **Other gates observed at close time:** `readme-map` → `README_MAP: CLEAN files=169 rows=169
  covered=169`; `counter-pins` → `COUNTER_PINS: CLEAN pins=38`; `sources-check` →
  `SOURCES_CHECK: CLEAN (rows=156 tiers=A:133,B:15,C:8 status=queued:13,mined:124,rejected:19 …)`;
  `proxy-check` and `claims-check` both **FAIL-CLOSED** — `SRC_NOT_A_DIR --src
  /fast/scratch/hyaku/kumitate-pin/src is absent` (the pinned origin clone is not present on this
  host; this is an environment fact, not a scored zero, and it is recorded as such).
- **Not yet present (so no outcome is claimed):** `scripts/control-replay.mjs` does not exist
  (`ls scripts/control-replay.mjs` → `No such file or directory`); no `| control-replay |` row in
  `SKILL.md` or `SCORECARD.md`; no `scripts/control-replay.mjs` pin.

## SHONEN — the four canonical boxes (draft)

**Mechanics (all observed):** the `SHONEN` heading must occur **exactly once** in the prose
(`SHONEN_COUNT headings=2` on a second heading); at least **four** box lines follow it inside its
own section; `round-gate` reports `REPORT_SHONEN_MISSING` (warning) without a `^#{1,6}\s*SHONEN`
heading; the driver's `report_of()` accepts a SHONEN heading **or** a bold `- **SHONEN**` marker
and requires ≥ 400 bytes. Driver arms observed: `## SHONEN` → ACCEPT; `## Shonen` → ACCEPT (the
driver regex is case/macron tolerant); a non-SHONEN heading → REJECT; 300 bytes → REJECT (floor
400). The lane's `SHONEN.md` is the **unmarked canonical seed** (all four boxes `[ ]`; `git log --
SHONEN.md` shows only `cb1f12e9 seed: kumitate shonen`) and is not edited by a report.

**Marking rule** (`PROTOCOL.md:445-446`): `[x]` only with a named **non-author** verifier; `[~]` =
asserted by the lane with an evidence pointer; `[ ]` = not asserted. Round-70's report is authored
by the lane and non-author closure stays outside the lane, so **no box may carry `[x]`**.

**Draft assessment:**

| Canonical box (verbatim from `SHONEN.md`) | Draft mark | Pointer (to be confirmed by L1 against landed evidence) |
|---|---|---|
| SKILL.md contains real decision tables, error patterns, checklists, cited sources | `[~]` | The new `control-replay` gate-registry row in `SKILL.md` with its exit map, selftest arm, pin binding and counter-compatibility arms. Load-bearing, not decorative: frozen R10 tests the literal substring `\| control-replay \|` (`replay70-probe.mjs:42`). Lane assertion. |
| At least one end-to-end domain task executed and logged in LOG.md | `[~]` | The round-70 counter run at the measured revision (verbatim `REPLAY70_*` line, exit code, close receipt path) plus the dated `LOG.md` round-70 admission entry naming round identity, work revision and gate lines (QUALITY Q11). Lane assertion. |
| Instructions executable by an agent without oral context | `[ ]` | Not asserted. Round-70's own limits are disclosed rather than repaired: the predicate is text/receipt-based, the live `c2 forgecapture` arm is network-dependent, and the base receipt's `live=no-live(vacuous-declared)` shows the live arm is not exercised by the frozen base run. No verifier attestation is available to this lane. |
| No cross-domain bleed (PROVINCE.md still accurate) | `[~]` | Round-70 touches one lane surface only (`operability`, the replay/counter surface). MCP/OAuth-security evidence remains kasegi/kagi's, model serving kama's, evaluation kengaku's; upstream source trees were read only. Lane assertion; no promotion claim. |

## Record trio and floors the report cannot fix by itself

`node scripts/round-gate.mjs --round 70 --repo .` (observed, exit 1,
`ROUND_GATE: DRIFT (round=70 lane=kumitate checks=5 errors=3 warnings=1)`):

| Finding | Observed detail | Owner |
|---|---|---|
| `REPORT_MISSING` (error) | `/home/vgpnk/Projects/shokunin/.ufo/reports/round-70/kumitate.md` | L1, after WAVE-DONE |
| `SCORECARD_ROW_MISSING` (error) | no row starting `\| 70 \|` in `SCORECARD.md` | L1 (append-only row) |
| `LOG_ENTRY_MISSING` (error) | no `- YYYY-MM-DD — round 70` line in `LOG.md` | L1 — **format trap below** |
| `SCORECARD_PLAN_MISSING` (warning) | `## Planned` names no round later than 70 | L1 (a `## Planned` entry naming round 71) |

**LOG format trap (observed).** The gate's LOG check is `^- \d{4}-\d{2}-\d{2} — round <N>\b` — a
**dash-prefixed list item**. Round-70's `LOG.md` entry is currently a `## 2026-10-30 — round 70`
**heading** (`LOG.md:2338`); the same holds for rounds 64, 65, 66, 68, 69 (per-round `grep -c`:
dash=0 / heading=1 for each), while rounds 60–63 still use the dash form. The heading form does not
satisfy the gate. The round-70 admission entry should be written as a dash-prefixed line, or the
gate keeps reporting `LOG_ENTRY_MISSING`. This belongs in the report as an observed fact, not be
absorbed silently.

**Report floors observed** (`scripts/round-gate.mjs:179-180, 355-360`): `REPORT_THIN` below
**1024 bytes** (the 552-byte draft is thin; a 1363-byte variant is not); `REPORT_HEADINGS` needs
≥ 2 lines matching `^#{1,3} `; `REPORT_ROUND_MISMATCH` fires when the text contains neither
`round-70` nor `round 70` (observed on a 42-byte probe).

## Hash-citation discipline (the round-69 lesson, reproduced read-only)

`round-gate` requires every backticked 7–40-hex token to resolve and to be an ancestor of the tip;
`report-receipt-diff` additionally classifies a hash that resolves in the **fleet** repo but not the
lane as `HASH_FOREIGN` unless the citing line also names "fleet".

Observed on the round-69 fleet report:

```
--rev 8f289840… (an intermediate revision) → DRIFT HASH_ORPHAN,HASH_FOREIGN
     HASH_ORPHAN  ab5915e7…   (the later tip; not an ancestor of the rev passed)
     HASH_FOREIGN e1968d1b…   (a fleet-repo commit; observed: present in the fleet repo,
                               "Not a valid object name" in the lane)
--rev HEAD                                → DRIFT HASH_FOREIGN only
scratch copy with the word "fleet" added to that line, --rev HEAD
                                          → REPORT_RECEIPT: CLEAN … exit 0
```

**Rules for round 70:** run the diff against the **final lane tip**; every lane commit cited must be
an ancestor of it; every fleet-repo commit cited must have the word "fleet" on the same line.

## Pre-flight for L1 (each line is a command)

1. Confirm WAVE-DONE and the results collection exist (`.ufo/waves/round-70/w1-results.json`) and
   the wave reconciliation is written. **Otherwise stop — do not file.**
2. Measure the counter at the final lane tip with the plan's command; record the verbatim line and
   exit code.
3. Write that exact line into a close receipt under `.ufo/waves/round-70/close/`.
4. Write the six sections in order, with the content contracts above; exactly one `## SHONEN`.
5. Write the four SHONEN boxes with marks `[~]`/`[ ]` only, every `[~]` carrying a pointer.
6. Write the record trio: `SCORECARD.md` row starting `| 70 |`; `LOG.md` line
   `- 2026-10-30 — round 70: …` (dash form); a commit message carrying `round-70`; a `## Planned`
   entry naming round 71.
7. `node scripts/report-receipt-diff.mjs --lane . --round 70 --report <report> --rev <TIP> --fleet
   /home/vgpnk/Projects/shokunin` → `REPORT_RECEIPT: CLEAN`, exit 0.
8. `node scripts/round-gate.mjs --round 70 --repo .` → `ROUND_GATE: CLEAN`, exit 0.
9. `git ls-remote origin refs/heads/master` equals the cited tip.
10. Delete `/fast/scratch/hyaku/kumitate-r70` after landing; frozen bytes untouched.

## Commands and observed outcomes (all run by this seat)

- `read /home/vgpnk/.omp/agent/RULES.md` — read first. **No install, update or pacman transaction**
  was needed or performed. Tool versions used (all pre-existing): `node v24.21.0`, `git 2.56.0`,
  `bash 5.3.20`, `python3 3.14.8`, `jaq 3.1.1`.
- `read .ufo/waves/round-70/plan.md` — the C1 contract, the freeze, the wave clause, the close
  sequence.
- `read .ufo/waves/round-70/probe/replay70-probe.mjs` — the frozen predicate (read only).
- `sha256sum .ufo/waves/round-70/probe/replay70-probe.mjs` → `63f52b75…bfc0c1`; equals the
  `counter-pins.json` entry for `replay70-probe`.
- `cat .ufo/waves/round-70/base/replay70-base.txt` → `REPLAY70_UNMET held=2/10 checks=10 …`, exit 1
  (quoted from the committed file; **not** re-run here).
- `cat .ufo/waves/round-70/base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`.
- `bash scripts/plan-before-ready.sh --round 70` → `PLAN_BEFORE_READY: PASS … map=CLEAN`, exit 0.
- `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0.
- `node scripts/counter-pins.mjs` → `COUNTER_PINS: CLEAN pins=38`, exit 0.
- `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=156 tiers=A:133,B:15,C:8 …)`.
- `node scripts/wave-census.mjs --round 70` → `ROUND round=70 waves=1 seats=64 attack=37
  reports=47/64`, `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`.
- `node scripts/round-gate.mjs --round 70 --repo .` → `ROUND_GATE: DRIFT (round=70 lane=kumitate
  checks=5 errors=3 warnings=1)`, exit 1 (the four findings tabulated above).
- `node scripts/proxy-check.mjs` → `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src
  /fast/scratch/hyaku/kumitate-pin/src is absent`. Same for `node scripts/claims-check.mjs` →
  `CLAIMS: FAIL-CLOSED (SRC_NOT_A_DIR …)`. **Environment fact, recorded, not scored as zero.**
- `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin kumitate` → six carried W04 warnings + `kumitate ok …`, exit 0;
  body diffed against `base/sources.txt` → identical.
- `node scripts/report-receipt-diff.mjs --lane . --round 70 --report <each draft> --rev HEAD
  --fleet /home/vgpnk/Projects/shokunin` → the seven arms tabulated above (transcript in
  `experiments/report-receipt-diff-arms.txt`).
- `node scripts/report-receipt-diff.mjs --lane . --round 69 --report
  /home/vgpnk/Projects/shokunin/.ufo/reports/round-69/kumitate.md --rev <8f289840…|HEAD> --fleet
  /home/vgpnk/Projects/shokunin` → the hash arms; and the scratch copy with "fleet" added → CLEAN.
- Driver predicate: sourced `scripts/shokunin-watchdog.sh` against a **scratch** fleet root
  (`SHOKUNIN_CONF` pointed at a scratch conf; the live fleet tree untouched) and called
  `report_of kumitate 70` → ACCEPT / ACCEPT / REJECT / REJECT for the four arms.
- `git -C <lane> rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin/kumitate-shokunin`;
  `git merge-base --is-ancestor 78b98d76… HEAD` → yes; `git merge-base --is-ancestor 3dbe7e6e… HEAD`
  → yes. Lane HEAD at read time `1e00955a657a5b955992e23915143e7b3e261bb4`.
- `git log --format='%ae' | sort | uniq -c` was **not** run as an authorship histogram (that is
  L1's close step, Q12); no commit was made by this seat.

**Not run:** the frozen probe against any candidate revision; `c1-controls.sh` / `c2-controls.sh`
(the originals — or any copy of them); the tool `scripts/control-replay.mjs` (does not exist); any
selftest; any fixture git commit; `git push`; any jj operation.

## Scratch, fixtures, tooling, lane integrity

- Scratch was `/fast/scratch/hyaku/kumitate-r70/K70ScribeReport/` only (mkdir explicitly), and it
  was **removed before this report** (see below). No fixture git repository was created; no commit
  was made; `git -C FIXTURE` was therefore never needed — the only git use was read-only
  (`rev-parse`, `show`, `merge-base`, `log`, `cat-file`) against the lane and fleet repos.
- No install, update, or pacman transaction. Tool versions recorded in the commands section.
- No git mutation in lane or fleet; no commit; no push; no jj command; no `agent://all`; no task
  dispatch; no background job; no model override.
- **Production files not written.** Only writes: this report, and
  `.ufo/waves/round-70/build/K70ScribeReport/**` (this seat's own build directory).
- Frozen bytes untouched: the plan, the probe, the base receipts, the round-69 controls and the
  counters were read only.

## Gate scope note, and one cross-seat observation

**Scope of `report-receipt-diff`.** It grades *the round report*, not a seat report. Observed by
running it over this wave's seat reports: `K70ScribeRegistry`, `K70ScoutSource217` and
`K70ReviewScope` all report `DRIFT SECTION_MISSING,SHONEN_COUNT` for exactly the same reason — they
are seat findings, not the fleet report. **Do not read a seat report's DRIFT as a defect in the
seat**; the gate applies to the file L1 files at
`/home/vgpnk/Projects/shokunin/.ufo/reports/round-70/kumitate.md`.

**Cross-seat observation (one line, actionable).** The sibling seat report
`.ufo/waves/round-70/w1/K70ScribeScorecard.md` currently trips `PLACEHOLDER` on the token
`__MEASURED__` when the diff gate is run over it (observed). That token is fine in an intermediate
draft, but it must not survive into the **fleet** report: `PLACEHOLDER` fires on
`__[A-Za-z][A-Za-z0-9_]{1,}__` (and on `TODO`, `TBD`, `FIXME`, `XXXX`, `{{NAME}}`, `LANE_HASH`,
`<<…>>`, `<measured>`, "to be filled"). Verified-safe drafting tokens for the fleet report:
`[FILL: measured rev]`, `(PENDING)`, `⟨PENDING …⟩` — none is matched by the pattern. The safe
discipline is stronger than the token choice: an unfilled slot should be **deleted from the prose**,
not left in it.

## Out-of-scope items (recorded, not repaired)

- The fleet report itself, the `close/` receipts, the wave reconciliation file, the `SCORECARD.md`
  row, the `LOG.md` admission line, the `## Planned` entry, the `control-replay` tool and its
  registry/SCORECARD/pin rows — all L1-owned.
- The `LOG.md` heading-vs-dash-line format mismatch for rounds 64–70 (the gate wants the dash form).
- `proxy-check` / `claims-check` FAIL-CLOSED on the absent pinned origin clone — operator-side
  substrate fact.
- Non-author closure (promotion verification, outside spot-check) — explicitly outside this lane
  per the plan.

## Findings routed to L1 (numbered, actionable)

1. **Do not file the report before WAVE-DONE.** The wave is still in flight (47/64 reports,
   62/64 ready-partial, no results file, no `close/`). Filing now would assert a counter outcome
   with no receipt.
2. **The "after" tally needs a committed close receipt.** `TALLY_UNRECEIPTED` fires for
   `REPLAY70_HELD held=10/10` unless a receipt under `close/` carries that exact pair and the claim
   line cites it (observed). Write the verbatim counter line to
   `.ufo/waves/round-70/close/replay70-<rev>.txt` and cite it on the same line as the claim.
3. **Write the `LOG.md` round-70 entry as a dash-prefixed line**, not a `## … — round 70` heading,
   or `LOG_ENTRY_MISSING` persists (observed; rounds 64–70 all use the heading form).
4. **Add the `| 70 |` SCORECARD row and a `## Planned` entry naming round 71**, or
   `SCORECARD_ROW_MISSING` (error) and `SCORECARD_PLAN_MISSING` (warning) persist (observed).
5. **Run the receipt diff against the final lane tip and word fleet citations with "fleet" on the
   same line** — the round-69 report reproduces `HASH_ORPHAN` + `HASH_FOREIGN` without both
   precautions, and the "fleet" wording alone flips the diff to CLEAN (observed).
6. **Keep exactly one `## SHONEN` heading, four box lines, and no `[x]`** (lane-authored report;
   non-author closure is outside the lane).
7. **Report the attack count with its definition** (`wave-census`'s `ATTACK` set), and report the
   seat census from the reconciliation file rather than from a mid-wave snapshot — the numbers were
   still moving during this read (45→47 reports, 61→62 ready entries).
8. **Record the proxy/claims FAIL-CLOSED as an environment fact**, not a scored zero, and disclose
   the `live=no-live(vacuous-declared)` state of the base receipt rather than implying the live
   `forgecapture` arm ran.
9. **Do not carry `__MEASURED__` (or any `PLACEHOLDER`-matched token) from a seat draft into the
   fleet report.** The sibling draft `w1/K70ScribeScorecard.md` trips `PLACEHOLDER` on that token
   today (observed). Delete unfilled slots from the prose rather than leaving them in it.
