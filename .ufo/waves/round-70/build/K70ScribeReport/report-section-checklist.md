# K70ScribeReport — round-70 fleet-report section checklist and SHONEN four-box draft

Seat: K70ScribeReport (scribe, leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Axis: operability. Milestone: ScribeReport.

Scope of this artifact: a **draft** checklist for the round-70 fleet report and the **draft** SHONEN
four-box assessment, both for L1 to use at close. No production file was written or edited. No
outcome is asserted here as observed that was not observed by this seat. The fleet report itself is
**not** created by this seat.

Frozen inputs read (read-only): plan commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`, base B
`78b98d762ccf3e3a0961f94c4042eaabd2bcb706`, probe `.ufo/waves/round-70/probe/replay70-probe.mjs`
sha256 `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1`.

---

## 0. Prerequisite that blocks the report — WAVE-DONE and results reconciliation

The plan's wave-and-ownership clause is explicit: *"No report before WAVE-DONE and results
reconciliation."* Observed at this seat's read time (2026-10-30T12:40:08-03:00):

| Fact | Observed value | Where |
|---|---|---|
| Wave results collection file | **absent** — `.ufo/waves/round-70/w1-results.json` does not exist | `ls .ufo/waves/round-70/w1-results.json` → `No such file or directory` |
| Close directory | **absent** — `.ufo/waves/round-70/close/` does not exist | `ls -d .ufo/waves/round-70/close` → `No such file or directory` |
| Seat reports present | 45 of 64 (still rising during the read) | `ls .ufo/waves/round-70/w1/*.md \| wc -l` → 45 |
| `w1.ready.partial` entries | 61 of 64 spec seats | `json.load(...w1.ready.partial)` → 61 |
| Spec seats absent from `w1.ready.partial` | `K70AttackPrivateOutput`, `K70ConnectPatterns`, `K70ReviewSourcePin` | spec-vs-partial set difference |
| Wave census | `ROUND round=70 waves=1 seats=64 attack=37 reports=45/64` | `node scripts/wave-census.mjs --round 70` → `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)` |

**Consequence for L1: the report must not be filed from the current state.** The counter's own
"after" measurement, the close receipts under `close/`, the wave reconciliation file, and the
`SCORECARD.md`/`LOG.md` round-70 record rows do not exist yet. Every one of them is a prerequisite
the report cites. Filing a report that asserts a `REPLAY70_HELD held=10/10` line today would be a
claim without a receipt; §3 below shows the diff gate catches exactly that.

---

## 1. The six required sections, in order

`scripts/report-receipt-diff.mjs` (`REQUIRED`, contract `kumitate-report-receipt-diff-v3`) parses the
prose and requires six headings **in this order**; `SECTION_ORDER` fires if a later section appears
before an earlier one.

| # | Heading (exact form the regex accepts) | Regex (from `scripts/report-receipt-diff.mjs:56-63`) | Non-empty required |
|---|---|---|---|
| 1 | `## Work performed` | `^#{1,6}\s*\**\s*Work performed` | yes (`SECTION_EMPTY`) |
| 2 | `## Landed changes` | `^#{1,6}\s*\**\s*Landed changes` | yes |
| 3 | `## Before → after measurements` | `^#{1,6}\s*\**\s*Before\s*(?:→\|->)\s*after measurements` | yes |
| 4 | `## Sources & frontier` | `^#{1,6}\s*\**\s*Sources\s*&\s*frontier` | yes |
| 5 | `## Trend verdicts` | `^#{1,6}\s*\**\s*Trend verdicts` | yes |
| 6 | `## SHONEN` | `^#{1,6}\s*\**\s*SHONEN` | yes |

The `→` may be written `->`; a bolded heading (`## **Work performed**`) is accepted. A heading
inside a fenced block is **not** a section: the prose copy blanks fenced regions (`unfence()`,
`scripts/report-receipt-diff.mjs:117-127`), so quoting a required heading in a code fence does not
satisfy it.

### Observed behavior (each arm run against a real draft file)

Command used for every arm below:

```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && \
node scripts/report-receipt-diff.mjs --lane . --round 70 \
  --report .ufo/waves/round-70/build/K70ScribeReport/<file>.md \
  --rev HEAD --fleet /home/vgpnk/Projects/shokunin
```

| Arm | File | Observed output | Exit |
|---|---|---|---|
| Baseline draft (all six sections, 4 SHONEN boxes) | `draft-skeleton.md` | `REPORT_RECEIPT: CLEAN (round=70 rev=1e00955a… bytes=552 report_sha256=1fefbb2d905b)` | 0 |
| Section order violated (SHONEN before Sources/Trend) | `experiments/exp-order.md` | `DRIFT SECTION_ORDER` / `SECTION_ORDER SHONEN before Trend verdicts` | 1 |
| Second `## SHONEN` heading appended | `experiments/exp-dup-shonen.md` | `DRIFT SHONEN_COUNT` / `SHONEN_COUNT headings=2` | 1 |
| A required section left with no body line | `experiments/exp-empty-section.md` | `DRIFT SECTION_EMPTY` / `SECTION_EMPTY Trend verdicts` | 1 |
| An unbacked `REPLAY70_HELD held=10/10` claim | `experiments/exp-held-untallied.md` | `DRIFT TALLY_UNRECEIPTED` / `TALLY_UNRECEIPTED REPLAY70_HELD held=10/10` | 1 |
| `held`/`checks` pair with the wrong `checks` value | `experiments/exp-checks-mismatch.md` | `DRIFT … TALLY_CHECKS_MISMATCH` / `TALLY_CHECKS_MISMATCH LEDGER69_HELD held=7/7 checks=6` | 1 |
| `held`/`checks` pair with the right `checks` value | `experiments/exp-checks-ok.md` | no `TALLY_*` finding (only the section findings) | 1 |
| Cited receipt path that does not exist at the rev | `experiments/exp-tally-scoped.md`, `experiments/exp-tally-fullpath.md` | `DRIFT RECEIPT_MISSING` / `RECEIPT_MISSING .ufo/waves/round-70/close/replay70-M.txt` | 1 |

**Reading of the tally arms.** The diff parses a labelled verdict out of the report prose
(`<LABEL>_HELD|UNMET held=x/y`) and requires a receipt that carries the *same* `(label, x, y)` pair.
When the claim's own line cites receipts, only those cited receipts may carry it. Two consequences
for the round-70 report:

1. The "before" cell may cite `base/replay70-base.txt` (which carries
   `REPLAY70_UNMET held=2/10 checks=10`) — observed to pass.
2. The "after" cell needs a **committed close receipt** carrying `REPLAY70_HELD held=10/10` at the
   measured revision, cited on the same line as the claim, or the diff reports
   `TALLY_UNRECEIPTED`. The close receipt does not exist yet (§0), so this arm cannot be satisfied
   before close.

---

## 2. Content contract for each section

Sources: `PROTOCOL.md:146-168` (minimum content), `PROTOCOL.md:156-162` (Sources & frontier),
`corpus/QUALITY.md:55-86` (Q10–Q15), `scripts/round-gate.mjs` (record kinds).

### 2.1 `## Work performed`

Required by `PROTOCOL.md:147-148`: *work performed and evidence pointers (paths, commands, diffs)*;
plus *cross-domain evidence encountered, with the domain it belongs to*. Round-70 content to cover,
with pointers already observed by this seat:

- The claim and its frozen predicate: `REPLAY70_HELD iff the ten bounded replay obligations hold`,
  probe `.ufo/waves/round-70/probe/replay70-probe.mjs` (sha256 `63f52b75…`), counting command
  `TMPDIR=/fast/scratch/hyaku/kumitate-r70/L1 node .ufo/waves/round-70/probe/replay70-probe.mjs
  /home/vgpnk/Projects/shokunin/kumitate-shokunin REV`.
- The wave: 64 seats, roles critic 16 / reviewer 16 / executor 13 / scout 6 / scribe 6 /
  mutation-tester 5 / connector 2; attack 37 by `wave-census`'s own `ATTACK` set
  (`reviewer, critic, mutation-tester, labrat`, `scripts/wave-census.mjs:55`) — observed
  `ROUND round=70 waves=1 seats=64 attack=37`. The plan asks for "at least 16 attack roles"; 37
  attack-classified seats satisfy it. **State the definition used**, not only the number.
- The wave reconciliation and its `dead` vs `unknown` distinction (L1 writes the close file; the
  sibling seat `K70ScribeWaveCensus` designed schema `ufo-wave-reconciliation-v2`).
- The freeze discipline: plan and counter frozen at `3dbe7e6e…` before any ready marker; base
  receipt `base/replay70-base.txt`; `base/freeze-map.txt` = `README_MAP: CLEAN files=169 rows=169
  covered=169`, exit 0. Observed `PLAN_BEFORE_READY: PASS … map=CLEAN files=169 rows=169 covered=169`
  (`bash scripts/plan-before-ready.sh --round 70`), exit 0.
- The declared limits, not waived: the predicate is a text/receipt predicate; the live `c2
  forgecapture` arm is network-dependent (`live=` is printed, never required); the print-PASS stub
  control stays UNMET by design and is attacked by seats rather than patched after scoring.
- Cross-domain evidence belongs to other lanes (MCP/OAuth security → kasegi/kagi; model serving →
  kama; evaluation → kengaku); round-70 introduced no cross-domain claim.

### 2.2 `## Landed changes`

Every change tied to a `LOG.md` entry (`PROTOCOL.md:149-150`; QUALITY Q11). At close this section
must list, per landed item: the production path changed, the `LOG.md` line, and the commit hash.
Items expected in round 70 (paths only — **L1 writes these**; this seat does not):

- `scripts/control-replay.mjs` (new tool, contract `kumitate-control-replay-v1`).
- `SKILL.md` gate-registry row, name cell the bare word `control-replay` — the frozen check R10
  tests the literal substring `| control-replay |` (`replay70-probe.mjs:42`).
- `SCORECARD.md` capability row with the same bare-name substring, plus the append-only round-70
  evidence section.
- `.ufo/pins/counter-pins.json` entry for `scripts/control-replay.mjs` — R10 requires the pinned
  sha256 to equal the file's own sha256 at the scored commit.
- `LOG.md` round-70 admission entry (Q11) — **and note the format trap in §2.6**.

### 2.3 `## Before → after measurements`

`PROTOCOL.md:150` (before→after in `SCORECARD.md` each round) and the report-receipt-diff tally
rule of §1. Shape it as a table with, per row: the claim, the **counting command**, the before value,
the after value, the verdict, and the evidence pointer. The before cell is already receipt-backed
(`base/replay70-base.txt`, `REPLAY70_UNMET held=2/10 checks=10`, exit 1 — observed). The after cell
must be the verbatim final counter line at the measured revision, and it must be a receipt the
report cites. Report the **misses honestly**: if any of R1–R10 is MISS at the measured revision,
the cell says `held=x/10` with `x<10` and the missing check ids are named; the predicate is never
amended after scoring (plan, "Controls and freeze").

Also record, per QUALITY Q15, the pinned revision every count was measured at.

### 2.4 `## Sources & frontier`

`PROTOCOL.md:156-162`: `SOURCES.md` rows before→after **with the counting command**, rows added by
tier, rows touched old→new, frontier rows advanced; a lane without a corpus writes
`SOURCES: unchanged — <why>`.

Round-70 facts already observed by this seat (from committed bytes):

| Fact | Value | Command |
|---|---|---|
| Counting command | `grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` | — |
| Rows at base B | 155 | `git show 78b98d76…:corpus/SOURCES.md \| grep -cE …` |
| Rows at HEAD | 156 | `git show HEAD:corpus/SOURCES.md \| grep -cE …` |
| Rows added | 1 — **S217** (own-work, tier A, status `mined`, opened 2026-10-30, recheck `on-release`, used-by `corpus/lessons/round-70.md`) | row diff B vs HEAD |
| Rows removed | 0 | row diff B vs HEAD |
| Rows touched old→new | 0 — no status transition, no used-by change on any pre-existing row | cell-wise row diff B vs HEAD |
| Tier counts B → HEAD | A 132→133, B 15→15, C 8→8 | cell-wise row diff |
| Status counts B → HEAD | mined 123→124, queued 13→13, rejected 19→19 | cell-wise row diff |
| Census before/after | body identical: six carried W04 duplicate-URL warnings + `kumitate ok …`, exit 0 | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` vs `base/sources.txt` |

**The frontier step itself is round-70's**, so the section must state: opened source S217 (the
frozen round-69 `c2-controls.sh` at B) is **own-work**, not external authority; the plan's stated
expansion verdict is *unchanged* (no new uncovered knowledge entry); assimilation **none**; one
considerthese proposal mined (2026-10-26 idea 4, round-size band accounting — captured by the
negative control `base/band-control.json`, `rule: campaign-round-band-64-128`).

### 2.5 `## Trend verdicts`

The lane's three-verb vocabulary, as used in the round-69 report and the verifier spot-checks:
**expansion**, **quality**, **discernment**. Each is `improved` / `unchanged` / `degraded` with one
sentence of justification. Draft guidance (not verdicts — the final verdicts are L1's, from
measured evidence):

- *expansion* — plan says unchanged (S217 strengthens an existing motivation; no new uncovered
  entry). The report must still give the measured row delta.
- *quality* — the seat evidence decides: attack seats' findings either confirm the control or expose
  a disclosed limit. Name which limits are disclosed and which are defects.
- *discernment* — the round's honesty of misses, dead/unknown separation in the reconciliation, and
  refusal to amend the predicate after scoring.

### 2.6 `## SHONEN` — the four canonical boxes

**Mechanics first (all observed, all binding):**

- `SHONEN_COUNT` requires the `SHONEN` heading to occur **exactly once** in the prose — a second
  `## SHONEN` heading is a finding (`experiments/exp-dup-shonen.md`, observed
  `SHONEN_COUNT headings=2`).
- At least **four** box lines must follow that heading inside its own section; the counter matches
  `^\s*[-*]\s` lines carrying a `[x]`/`[X]`/`[~]`/`[ ]` marker.
- `round-gate.mjs` additionally reports `REPORT_SHONEN_MISSING` (warning) when no
  `^#{1,6}\s*SHONEN` heading exists; the fleet driver's own `report_of()` predicate
  (`scripts/shokunin-watchdog.sh:187-207`) accepts either a `SHONEN` heading **or** a bold
  `- **SHONEN**` list marker, and requires ≥ 400 bytes.
- Case: the driver regex is `[Ss][Hh]([Oo]|Ō|ō)[Nn][Ee][Nn]`, so `## Shonen` is accepted by the
  driver — observed `report_of(kumitate,70)=ACCEPT` for the `## Shonen` variant and
  `report_of(kumitate,70)=REJECT` for a non-SHONEN heading. The diff's own regex is
  case-insensitive too. Use the canonical capitalisation `## SHONEN` anyway.
- `SHONEN.md` in the lane is the **unmarked seed** (all four boxes `[ ]`, `git log -- SHONEN.md`
  shows only the seed commit `cb1f12e9 seed: kumitate shonen`). The report's assessment is a
  *separate* artifact from the seed file; the seed is not to be edited by the report.

**The four boxes, verbatim from `SHONEN.md` (canonical seed, `PROTOCOL.md:439-446`):**

```
- [ ] SKILL.md contains real decision tables, error patterns, checklists, cited sources
- [ ] At least one end-to-end domain task executed and logged in LOG.md
- [ ] Instructions executable by an agent without oral context
- [ ] No cross-domain bleed (PROVINCE.md still accurate)
```

**Marking rules** (`PROTOCOL.md:445-446`): `[x]` **only** with a named non-author verifier;
`[~]` = asserted by the lane itself with an evidence pointer required; `[ ]` = not asserted.
`[x]` in a lane-authored report is a conformance defect and disqualifies the assessment as
promotion evidence.

**Draft assessment for round 70 — every box `[~]` or `[ ]`, no `[x]`.** The round-70 report is
authored by the lane, so no box can carry `[x]`: promotion verification is operator/non-author
owned and is out of this lane's scope (plan, "Frontier, limits and admission": *Required non-author
closure remains outside this lane*).

| Box | Draft mark | Draft pointer (to be confirmed by L1 against landed evidence) |
|---|---|---|
| 1 — SKILL.md decision tables / error patterns / checklists / cited sources | `[~]` | The new `control-replay` gate-registry row in `SKILL.md` with its exit map, selftest arm, pin binding and counter-compatibility arms; the frozen R10 substring requirement makes the row load-bearing, not decorative. Lane assertion, not non-author verification. |
| 2 — an end-to-end domain task executed and logged in LOG.md | `[~]` | The round-70 counter run at the measured revision (the `REPLAY70_*` line, its exit code, and the close receipt path) plus the dated `LOG.md` round-70 admission entry naming the round identity, work revision and gate lines (QUALITY Q11). Lane assertion. |
| 3 — instructions executable by an agent without oral context | `[ ]` | Not asserted. Round-70's own limits are disclosed rather than repaired (the predicate is text/receipt-based; the live `forgecapture` arm is network-dependent; the base receipt's `live=no-live(vacuous-declared)` shows the live arm is not exercised by the frozen base run). No verifier attestation is available to this lane. |
| 4 — no cross-domain bleed (PROVINCE.md still accurate) | `[~]` | Round-70 touches one lane's own surface (`operability`, the replay/counter surface). MCP/OAuth-security evidence remains kasegi/kagi's, model serving kama's, evaluation kengaku's; upstream source trees were read only. Lane assertion, no promotion claim. |

The draft mirror of this table is in the seat report and in `draft-skeleton.md`.

### 2.7 Record trio the gate checks outside the report text

`scripts/round-gate.mjs --round 70` currently reports (observed, exit 1, `ROUND_GATE: DRIFT (round=70
lane=kumitate checks=5 errors=3 warnings=1)`):

| Finding | Observed detail | Who fixes it |
|---|---|---|
| `REPORT_MISSING` (error) | `/home/vgpnk/Projects/shokunin/.ufo/reports/round-70/kumitate.md` | L1, after WAVE-DONE |
| `SCORECARD_ROW_MISSING` (error) | no table row starting `\| 70 \|` in `SCORECARD.md` | L1 (append-only round-70 row) |
| `LOG_ENTRY_MISSING` (error) | no `- YYYY-MM-DD — round 70` line in `LOG.md` | L1 — **format trap, see below** |
| `SCORECARD_PLAN_MISSING` (warning) | `## Planned` names no round later than 70 | L1 (a `## Planned` entry naming round 71) |

**LOG format trap (observed, worth naming in the report).** The gate's LOG check is
`^- \d{4}-\d{2}-\d{2} — round <N>\b` — a **dash-prefixed list item**. Round-70's `LOG.md` entry is
currently a **`## 2026-10-30 — round 70` heading** (`LOG.md:2338`), and the same is true of rounds
64, 65, 66, 68 and 69 (`grep -c` per round: dash=0, heading=1 for each; rounds 60–63 still use the
dash form). The heading form does **not** satisfy the gate. Either the round-70 admission entry is
written as a dash-prefixed line (`- 2026-10-30 — round 70: …`), or the gate keeps reporting
`LOG_ENTRY_MISSING`. This is a report-visible fact and should not be silently absorbed.

**Report floors the gate checks** (`scripts/round-gate.mjs:179-180, 355-360`), observed on the
draft: `REPORT_THIN` fires below **1024 bytes** (the 552-byte draft is thin; the 1363-byte variant
is not); `REPORT_HEADINGS` needs ≥ 2 lines matching `^#{1,3} `; `REPORT_ROUND_MISMATCH` fires when
the text contains neither `round-70` nor `round 70` (observed on a 42-byte probe).

---

## 3. Hash-citation discipline (the round-69 lesson, reproduced)

`round-gate.mjs` extracts backticked 7–40-hex tokens and requires each to resolve and to be an
ancestor of the lane tip; `report-receipt-diff.mjs` scans 39–41-hex tokens anywhere in the text and
additionally classifies a hash that resolves in the **fleet** repo but not the lane as
`HASH_FOREIGN` unless the line naming it also names "fleet".

Reproduced on the round-69 fleet report, read-only:

```
node scripts/report-receipt-diff.mjs --lane . --round 69 \
  --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-69/kumitate.md \
  --rev 8f2898409c54612e3400189ef7c6e8227a290388 --fleet /home/vgpnk/Projects/shokunin
→ REPORT_RECEIPT: DRIFT HASH_ORPHAN,HASH_FOREIGN
   HASH_ORPHAN  ab5915e7b9671e8a1bd375cc6c2748b78dc91629
   HASH_FOREIGN e1968d1b283d0e452c3a0a6a51448d58184710b7
```

Two distinct causes, confirmed separately:

1. `HASH_ORPHAN` — the cited lane tip `ab5915e7…` was not an ancestor of the `--rev` passed
   (that rev predates the erratum commit). At `--rev HEAD` the same report gives only `HASH_FOREIGN`.
   **Rule: run the diff against the final lane tip**, not against an intermediate revision.
2. `HASH_FOREIGN` — `e1968d1b…` is the **fleet** report commit (observed:
   `git -C /home/vgpnk/Projects/shokunin cat-file -e e1968d1b…^{commit}` → present in fleet;
   the same probe in the lane → *not a valid object name*). The report cited it without naming the
   fleet on that line. Patching only that line's wording in a scratch copy made the diff
   **CLEAN** (observed, exit 0):
   `REPORT_RECEIPT: CLEAN (round=69 rev=1e00955a… bytes=11415 report_sha256=8d8fafa0e8f9)`.

**Rule for round 70:** every lane commit cited must be an ancestor of the tip the diff is run
against; every fleet-repo commit cited must have the word "fleet" on the same line.

---

## 4. Pre-flight checklist for L1 (ordered; each line is a command, not a hope)

| # | Step | Command | Pass condition |
|---|---|---|---|
| 1 | Confirm WAVE-DONE + results | check `.ufo/waves/round-70/w1-results.json` exists and the wave reconciliation is written | both present; otherwise **do not file** |
| 2 | Measure the counter at the final lane tip | `TMPDIR=/fast/scratch/hyaku/kumitate-r70/L1 node .ufo/waves/round-70/probe/replay70-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <TIP>` | prints `REPLAY70_HELD held=10/10 …` **or** `REPLAY70_UNMET held=x/10`; exit 0 / 1 accordingly |
| 3 | Write the close receipt | the exact counter line into `.ufo/waves/round-70/close/replay70-<rev>.txt` | the file carries the same `(label, x, y)` pair the report claims |
| 4 | Write the six sections | per §1–§2 | order preserved, no empty section, exactly one `## SHONEN` |
| 5 | Write the SHONEN four boxes | per §2.6 | four box lines, no `[x]`, every `[~]` carries a pointer |
| 6 | Write the record trio | `SCORECARD.md` row starting `\| 70 \|`; `LOG.md` line `- 2026-10-30 — round 70: …` (dash form); a commit message carrying `round-70` | `node scripts/round-gate.mjs --round 70 --repo .` → `ROUND_GATE: CLEAN` |
| 7 | Diff the report against the receipts | `node scripts/report-receipt-diff.mjs --lane . --round 70 --report <report> --rev <TIP> --fleet /home/vgpnk/Projects/shokunin` | `REPORT_RECEIPT: CLEAN (round=70 …)` exit 0 |
| 8 | Confirm the driver accepts the report | the driver predicate `report_of kumitate 70` (SHONEN marker + ≥ 400 bytes + freshness vs the round baseline) | the driver's completion signal fires |
| 9 | Verify the remote hash | `git ls-remote origin refs/heads/master` | equals the cited tip |
| 10 | Delete the round scratch | `rm -rf /fast/scratch/hyaku/kumitate-r70` after landing | scratch gone; frozen bytes untouched |

---

## 4b. Index of the observed experiments (fixtures + transcripts)

Every arm quoted above is reproducible from the files in this seat's build directory.

| Fixture | Transcript | What it demonstrates |
|---|---|---|
| `draft-skeleton.md` | `experiments/report-receipt-diff-arms.txt` | the six-section, four-box skeleton is `REPORT_RECEIPT: CLEAN` (exit 0) |
| `experiments/exp-order.md` | same | `SECTION_ORDER` when the sections are reordered |
| `experiments/exp-dup-shonen.md` | same | `SHONEN_COUNT headings=2` on a second SHONEN heading |
| `experiments/exp-empty-section.md` | same | `SECTION_EMPTY` on a bodyless section |
| `experiments/exp-held-untallied.md` | same | `TALLY_UNRECEIPTED` for an unbacked `REPLAY70_HELD held=10/10` |
| `experiments/exp-tally-scoped.md`, `experiments/exp-tally-fullpath.md` | same | `RECEIPT_MISSING` for a close receipt that does not exist yet (both the relative and the full-path citation form) |
| `experiments/exp-checks-mismatch.md`, `exp-checks-ok.md`, `exp-noscope.md` | same | `TALLY_CHECKS_MISMATCH` when the cited `checks=` value disagrees with the receipt's |
| — | `experiments/round-gate-arms.txt` | `round-gate --round 70` on the live lane, and on the draft skeleton used as a stand-in fleet report (`REPORT_THIN` below 1024 bytes) |
| — | `experiments/driver-report-of-arms.txt` | the fleet driver's own `report_of kumitate 70` predicate: ACCEPT / ACCEPT / REJECT / REJECT across the four arms (run against a scratch fleet root; the live fleet tree untouched) |
| `experiments/r69-copy.md`, `experiments/r69-fleetword.md` | `experiments/hash-citation-arms.txt` | `HASH_ORPHAN` + `HASH_FOREIGN` on the round-69 report, and the CLEAN flip after adding the word "fleet" to the fleet-commit line |
| — | `experiments/close-state-observations.txt` | the close-state snapshot behind §0 and the round-70 content facts |

---

## 5. What this seat did NOT do

- Did not create the fleet report (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-70/kumitate.md`
  — verified absent).
- Did not edit any production file: `SKILL.md`, `SCORECARD.md`, `LOG.md`, `corpus/SOURCES.md`,
  `corpus/README.md`, `scripts/`, `.ufo/pins/` are byte-unchanged by this seat.
- Did not write `LOG.md`, did not commit, did not push, did not touch git/jj state.
- Did not run the frozen probe against any candidate revision; no `REPLAY70_HELD` outcome is
  asserted here. The counter's base receipt (`held=2/10`) is quoted from the committed file, not
  from a run.
- Did not execute `c1-controls.sh` or `c2-controls.sh` (the originals, nor any copy of them).
- No subagent dispatch; no background job; no `agent://all`; no model override.
- No install, no update, no pacman transaction. Tool versions observed and used:
  `node v24.21.0`, `git 2.56.0`, `bash 5.3.20`, `python3 3.14.8`, `jq` (jaq) 3.1.1.
