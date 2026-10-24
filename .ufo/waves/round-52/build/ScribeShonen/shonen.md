# SHONEN evidence mapping — round 52 (draft for the close report)

Seat `ScribeShonen` (scribe; lane author). Round 52, lane `kumitate-shokunin`.
Measured state: lane tip `ac5674393f68` (base `02c01258`, freeze `f539a71`, spec `66766f7`), 2026-10-24.
Inputs read: `.ufo/waves/round-52/plan.md` (frozen), `probe/attest52-probe.mjs`, `probe/doctrine52-probe.mjs`,
`base/attest52-base.txt`, `base/doctrine52-base.txt`, `base/baseline-gates.txt`, `w1-spec.json` (64 seats),
`SHONEN.md`, fleet `PROTOCOL.md:144-171`, `.ufo/reports/round-51/kumitate.md:155-170`, `SKILL.md`, `PROVINCE.md`,
`SCORECARD.md`, `LOG.md`, `corpus/SOURCES.md`, `scripts/round-gate.mjs`, `scripts/surface-probe.mjs`.

Scope of this artifact: **draft only**. `SHONEN.md` was not edited (md5 `531ce597e5be89bc71fb0fb6389ac2c5`;
four boxes at lines 5-8). No product file, gate, pin, index, jj state or sibling lane was written. No tool was
installed or upgraded. Read-only commands run by this seat (verbatim outcomes in F4/F7):
`node scripts/surface-probe.mjs --checklists` (188.9 s, `CHECKLIST: 20/23 pass`, `VERDICT: FAIL`),
`node scripts/cite-check.mjs`, `node scripts/round-gate.mjs`, `node scripts/round-gate.mjs --tracked`,
`node scripts/proxy-check.mjs --strict`, `node scripts/claims-check.mjs`, `node scripts/sources-check.mjs`,
`node scripts/kimi-census.mjs`, plus the tracking counts in F7. All at `ac5674393f68` on the live working tree.

## Rule applied

- Fleet `PROTOCOL.md` (report contract): the round report carries "a `SHONEN.md` checklist assessment for that
  lane's shokunin, under a `SHONEN` heading with one line per box (`[x]` / `[ ]` / `[~]` + pointer)"; "`[~]`
  means asserted-by-author, not skipped". Promotion grading is operator/integrator-owned.
- `scripts/round-gate.mjs:363` grades only the heading (`/^#{1,6}\s*SHONEN/im`); the box lines are contract
  prose, so their pointers are for the human/integrator reviewer and must still resolve.
- Round-36 defect class (`.ufo/waves/round-36/build/CriticReportHygiene.md:54`): a `[~]` line with a
  `<pending>` pointer is a filing defect; `[~]` requires a *resolvable* pointer. This draft therefore carries
  **no placeholder tokens**: every pointer is either a path that resolves at `ac5674393f68` today, or a close
  artifact that the frozen plan's own steps create, named together with the exact line/substring the close
  must produce.

## Verifier status — stated plainly (round-51 precedent)

**No box has a named non-author verifier. All four remain `[~]`.** The grounds:

1. Every seat this round — including the 13 reviewer, 6 critic, 5 mutation-tester and 2 sentinel seats — was
   dispatched by the L1 from one frozen 64-seat spec (`w1-spec.json`) in one task call. An L1-dispatched seat
   is a *wave seat*, not an independent reviewer: it runs the same frozen item text, writes into the same round
   tree (`build/<Seat>/`, `w1/<Seat>.md`), and its output is author-side round evidence. It cannot grade
   promotion and is not a non-author reviewer for SHONEN purposes.
2. Round 51's report is the precedent, and it is *stronger* than this round's situation: round 51 carried a
   separate falsify wave with non-author re-opens (`w2/ScoutReopenS100.md`, `w2/ScoutReopenS101.md`, "both
   AGREE") and still filed all four boxes `[~]`, each line closing "No named non-author verifier"
   (`.ufo/reports/round-51/kumitate.md:157-170`). Round 52 is ONE wave (plan §Wave), so it has strictly fewer
   independent-review candidates than round 51 had.
3. The only non-author classes on record are the fleet integrator's closure spot-check (round 51: commit
   `02c0125`, "round-51 verifier spot-check (integrator, hyaku): non-author admit/reject") and the operator.
   Neither has graded round 52; the driver's verification is pending at filing (round-51 report's own wording,
   `:152-154`). `checked=0` is deliberate: only such a non-author may write `[x]`, never this seat nor any
   wave seat.

## Mapping

| Box (`SHONEN.md`) | Primary close evidence | Fallback pointer (resolves at `ac5674393f68` today) | Non-author verifier |
|---|---|---|---|
| `:5` real decision tables / error patterns / checklists / cited sources | `SKILL.md` at R1: §Dispatch-shape decision table `:12-33`; §Failure-telemetry patterns `:423-473`; §Anti-patterns `:475-539`; §Gate registry `:587-618` (receipt-attest row relabelled `kumitate-receipt-attest-v2`); §Verifiable checklist `:669-709` (23 items, item 23 = receipt-attest suite); `close/FINAL-harm-census.txt` → `CHECKLIST: 23/23 pass`; `corpus/SOURCES.md:115-116` (S102/S103) | `SKILL.md` today (same rows; registry label still `v1`), `base/baseline-gates.txt` | none |
| `:6` end-to-end domain task executed and logged | `LOG.md:2046-` round-52 entry; `SCORECARD.md:2375-` round-52 section (C1/C2 rows, capability-row update, terms/limits); `close/FINAL-*.txt` (A52 `held=13/13`, D52 `held=5/5` at R1); `close/IDEMPOTENCE-*.txt` (R2/R3); `receipts/attest52-run-{1,2,3}.txt` + `.sha256`, `receipts/attest52-run-2-replayed.txt`; `corpus/knowledge/fail-closed-clock-validation.md` | `plan.md` §Claims + §Close sequence; `base/attest52-base.txt` (`held=5/13`), `base/doctrine52-base.txt` (`held=0/5`) | none |
| `:7` executable without oral context | `plan.md` (frozen counting commands and predicate sentences); `probe/attest52-probe.mjs`, `probe/doctrine52-probe.mjs` (self-describing headers; 13 and 5 named checks); `base/*` executed freeze receipts (Q43); seat transcripts that ran the frozen text verbatim — `w1/ExecProbeSanity.md`, `w1/ScoutCensus.md`, `w1/ExecChecklistAudit.md`, `w1/ScribeReport.md`; `close/` v2 selftest transcript ending `ATTEST_SELFTEST: PASS (n/n)`, n>=30 | `plan.md`, both probe sources, `w1/ExecProbeSanity.md` and `w1/ScoutRfc3339.md` (both present at measurement) | none |
| `:8` no cross-domain bleed (`PROVINCE.md` accurate) | `w1/RevScope.md` (province verdict on C1/C2 + wave write pattern); `w1/ConnOverlap.md` (sibling-overlap conclusion); `w1/SentScope.md` (wave write-scope audit: zero modified tracked files); `w1/SentSecrets.md` (no env/secret reach); `PROVINCE.md:8-27` unchanged at R1; `close/FINAL-harm-census.txt` H3 `PROXY: MATCH` + H4 census exit 0 | `PROVINCE.md:8-27`; plan §Claims ("No axis harm admitted"); `w1/ExecProbeSanity.md` | none |

### Box 1 — `SHONEN.md:5`

The four sub-claims and their close-time evidence:

- decision tables — `SKILL.md` §Dispatch-shape decision table (`:12-33`: four rows — three dispatch shapes
  plus the `self-iter` fixture — each row carrying a Source column, plus the disambiguation rules);
- error patterns — §Failure-telemetry patterns (`:423-473`) and §Anti-patterns (`:475-539`, each names its enforcement);
- checklists — §Verifiable checklist (`:669-709`, 23 items); the *executed* reading is H1
  `node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 23/23 pass` in `close/FINAL-harm-census.txt`
  (plan §Harm battery H1). The plan's baseline reads 21/23 and this environment reads 20/23 — the three
  red items are named in F4;
- cited sources — §Gate registry (`:587-618`) with the receipt-attest row's contract label moved to
  `kumitate-receipt-attest-v2`, plus `corpus/SOURCES.md` at 103 rows (S102/S103 appended after S101 at `:114`).

Resolve condition: the integration commits (plan §Close sequence step 1) land the registry relabel and the
checklist stays 23 items; H1 prints 23/23 at R1. If H1 lands at <23, the box is still `[~]` but the pointer must
name the failing item instead of the 23/23 line (dead-seat rule: named, never papered over).

### Box 2 — `SHONEN.md:6`

C1 (operability, `receipt-attest` v2, rule A52) is the end-to-end task: one instrument, one frozen counter,
three genuine receipts, one doctored control, one README-map drift repair. C2 (frontier coverage, rule D52) is
the sourced entry. The LOG entry is the "executed and logged" evidence; the SCORECARD section is the numeric
evidence. The close sequence supplies the cited revision R1, the receipt commit R2 and the idempotence commit R3,
so the report quotes the FINAL line verbatim and the citation rev equals the receipt rev (Q44 / R52-11).

Resolve condition: close-sequence steps 1-3 all land. If the three receipt runs cannot be spaced >=300 s of real
wall time in the integration window, box 2's pointer degrades to the LOG entry + SCORECARD rows and the receipt
gap becomes a named limit — it must not be silently dropped or back-dated.

### Box 3 — `SHONEN.md:7`

The frozen plan is the oral-context substitute: it names every counting command, the two predicate sentences
byte-identically, the kill rules and the close sequence. The probes carry their own check lists in their headers,
and the base receipts prove the commands were *executed* rather than merely written (Q43). The strongest close
pointer is the v2 selftest transcript (`ATTEST_SELFTEST: PASS (n/n)`, n>=30) plus the seat reports that ran the
item text verbatim with no conversation.

Resolve condition: `close/` holds the selftest and harm transcripts, and at least the named seat reports exist
under `w1/`. Fallback (if a seat is dead) is `plan.md` + the probe sources, which resolve today.

### Box 4 — `SHONEN.md:8`

The round's touched set is lane-side by construction: `scripts/receipt-attest.mjs`, `.ufo/pins/*`,
`SKILL.md`, `SCORECARD.md`, `LOG.md`, `corpus/knowledge/fail-closed-clock-validation.md`,
`corpus/lessons/round-52.md`, `corpus/SOURCES.md`, `corpus/README.md` (one drift-fix row + two new rows),
plus the round's own wave artifacts. `PROVINCE.md` §Core already names "the lane's own instruments
`scripts/*.mjs`" and its learning registry, so the capability is in-province; C2's frontier band (durable-execution
research line) is named at `PROVINCE.md:22`.

Resolve condition: `w1/RevScope.md` and `w1/ConnOverlap.md` conclude in-province/no-overlap, `w1/SentScope.md`
finds zero modified tracked files during the wave, and the close harm battery prints `PROXY: MATCH`. **Gap:** no
seat audits the *integration* commits' touched set — `SentScope`'s item text covers only files under
`.ufo/waves/round-52/` plus the lane's `git status`. See F3.

## Report-ready block (round-51 shape; four `[~]` lines, one per box)

For the report's `## SHONEN` section. No angle-bracket revision tokens: the FINAL file's *name* carries the measured close
revision, so the glob form is the citation, matching round 51's `close/A51-*.txt` convention in `LOG.md:2029`.

```markdown
## SHONEN

- `[~]` **SKILL.md contains real decision tables, error patterns, checklists, cited
  sources** — `SKILL.md` §Dispatch-shape decision table `:12-33`, §Failure-telemetry
  patterns `:423-473`, §Anti-patterns `:475-539`, §Gate registry `:587-618` (receipt-attest
  row at `kumitate-receipt-attest-v2`), §Verifiable checklist `:669-709` with `CHECKLIST:
  23/23 pass` at the close (`close/FINAL-harm-census.txt`); sources 101 → 103 rows
  (`corpus/SOURCES.md:115-116`). No named non-author verifier.
- `[~]` **At least one end-to-end domain task executed and logged in LOG.md** — C1
  executed end-to-end (`receipt-attest` v2): `held=5/13` → `held=13/13` at the measured
  close revision, `LOG.md:2046` round-52 entry, `SCORECARD.md:2375` claim rows, three
  spaced receipts plus the doctored control under `receipts/`, and
  `close/FINAL-*.txt` + `close/IDEMPOTENCE-*.txt` carrying the cited revision and its
  idempotence re-run. No named non-author verifier for the box.
- `[~]` **Instructions executable by an agent without oral context** — `plan.md` freezes
  every counting command and both predicate sentences; the two counter sources are
  self-describing (`probe/attest52-probe.mjs`, 13 checks; `probe/doctrine52-probe.mjs`,
  5 checks); `base/*` are executed receipts (not intentions); 64 seats ran the frozen item
  text verbatim (`w1/ExecProbeSanity.md`, `w1/ScoutCensus.md`, `w1/ExecChecklistAudit.md`);
  the v2 selftest prints `ATTEST_SELFTEST: PASS (n/n)`, n>=30. No named non-author verifier.
- `[~]` **No cross-domain bleed (PROVINCE.md still accurate)** — `w1/RevScope.md` and
  `w1/ConnOverlap.md` put C1/C2 in-province with no sibling overlap; `w1/SentScope.md`
  finds zero modified tracked files during the wave; `PROVINCE.md:8-27` stands unchanged
  at the close; `PROXY: MATCH` (`close/FINAL-harm-census.txt`). No named non-author verifier.
```

The four lines remain `[~]`, not `[x]`: promotion grading is operator/integrator-owned
(`PROTOCOL.md`), and no non-author has graded any box for round 52 (see §Verifier status).

## Findings

- **F1 — `w1/` evidence is prospective.** At measurement the report directory held 2 of the
  named files (`w1/ExecProbeSanity.md`, `w1/ScoutRfc3339.md`); `ConnOverlap`, `RevScope`,
  `SentScope`, `SentSecrets`, `ExecChecklistAudit`, `ScribeReport` were still in flight
  (64-seat wave). Plan §Wave: "Dead seats are named, never replaced" — so a dead seat's
  pointer must degrade to the fallback column above, not to a placeholder.
- **F2 — close artifacts do not exist yet.** `.ufo/waves/round-52/close/` and
  `.ufo/waves/round-52/receipts/` were both absent at measurement (`ls` → No such file or
  directory). Boxes 1, 2 and 4's primary pointers depend on close-sequence steps 1-3
  (plan §Close sequence). If the close lands a different filename than
  `close/FINAL-harm-census.txt` (plan §Harm battery fixes only the *directory*), the report
  must cite the actual harm transcript that carries the `CHECKLIST: 23/23` line.
- **F3 — box 4 lacks a close-time touched-set artifact.** `SentScope`'s item covers only
  round-52 wave files plus the lane's `git status` (its text: `find .ufo/waves/round-52
  -type f`, then `git -C <lane> status --porcelain`), not the integration commits.
  Recommended (cheap, one command) so box 4's pointer resolves at close: append
  `git -C <lane> diff --name-only 02c01258..R1` (R1 = the measured close revision) and an empty `git status --porcelain`
  to `close/FINAL-harm-census.txt`. Without it, box 4 rests on `w1/RevScope.md`'s province
  verdict alone — acceptable prose evidence, weaker than a transcript.
- **F4 — checklist readings: plan 21/23, observed 20/23 at `ac5674393f68`.**
  `node scripts/surface-probe.mjs --checklists` prints `CHECKLIST: 20/23 pass` / `VERDICT: FAIL`
  (188.9 s). The three reds, each reproduced individually:

  | Item | Command | Observed |
  |---|---|---|
  | `SKILL.md:687` citation gate | `node scripts/cite-check.mjs` | `CITE_CHECK: DRIFT (files=122 tokens=10649 errors=929 warnings=654)` rc=1 — env-dependent: bare form measures the ambient checkout, not the pin (the round-37 `S7` limit, `w1/falsify/Rep4.md:28`, then `errors=454`) |
  | `SKILL.md:692` round-close artifact audit | `node scripts/round-gate.mjs` | `ROUND_GATE error SCORECARD_ROW_MISSING` — no table row starting `| 51 |` — rc=1 (plus `LOG_ENTRY_MISSING`) |
  | `SKILL.md:694` proxy recompute | `node scripts/proxy-check.mjs --strict` | `PROXY: DRIFT (A_DRIFT declared=71 computed=1142 …)` rc=1 — see F7 |

  So the plan's `CHECKLIST: 21/23` baseline had the proxy and round-gate reds; this environment adds a red
  citation gate. Box 1's pointer is `23/23` only if the close measures a tree where all three are green
  (the citation one needs its pin/`--src` path, the other two are the close's own repairs). The report must
  state the *measured* count at R1, never inherit 21/23.
- **F5 — stale contract label inside checklist item 23.** `SKILL.md:709` reads
  "contract `kumitate-receipt-attest-v1`" while the round ships v2. The label is prose:
  `scripts/surface-probe.mjs` contains no `receipt-attest` literal (checklist items are
  parsed from the `- [ ]` lines' command + expected substring), and the expectation
  `ATTEST_SELFTEST: PASS` is a substring of v2's `ATTEST_SELFTEST: PASS (n/n)`. So the
  item still passes; recommend the integration update the label to
  `kumitate-receipt-attest-v2` so box 1's "cited sources" pointer does not cite a dead
  contract name.
- **F6 — line anchors are revision-scoped.** All `SKILL.md`/`LOG.md`/`SCORECARD.md`/
  `SOURCES.md` line numbers here are measured at `ac5674393f68`; the integration inserts
  lines. The report should cite the section heading plus the nearest line and re-anchor at
  filing (round 37's `Rep4` scored pointer resolution this way).
- **F7 — the live wave inflates the proxy `A` term, so H3 must be measured on committed bytes.**
  `scripts/proxy-check.mjs:935` derives `A = walkFiles(self).filter(RE_RUNNABLE).length`, i.e. it walks the
  whole *working tree*. Measured here: tracked runnable files at `ac5674393f68` = **73** (at base `02c01258` =
  71), untracked runnable files = **714 and rising**, total walked = **1142**, of which **1075** sit under
  `.ufo/waves/round-52/` (this wave's own scratch: seats writing probe scripts under `build/<Seat>/`). Hence
  `PROXY: DRIFT (A_DRIFT declared=71 computed=1142 delta=+1071)` on the live tree, versus the plan's baseline
  `declared=71 computed=73`. Consequences for box 1 and box 4's close pointers:
  1. H1/H3 must run against `R1`'s committed (or `git archive`-extracted) bytes, not the live tree, or they
     will fail on wave scratch that no one intends to ship;
  2. the close's "stanza re-derived A" step must re-derive `A` from the **committed** runnable count at R1 —
     round 51 committed its whole `build/` tree (25 runnable files), so if round 52 commits a comparable
     payload the declared `A` jumps by that amount; if only the two frozen probes are committed, it jumps by 2;
  3. any seat that leaves a runnable file in `build/` after R1 makes the A term depend on whether the
     integration commit happens before or after that file lands. The measured R1 value is the only honest one.
  This is a measurement-scope trap, not a product defect — but it decides whether the report may quote
  `PROXY: MATCH` in box 1/box 4.

## Provenance

- All paths relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin` unless absolute; the fleet report
  and `PROTOCOL.md` are at `/home/vgpnk/Projects/shokunin/`.
- `SHONEN.md` md5 `531ce597e5be89bc71fb0fb6389ac2c5`; base receipts and the plan are the frozen inputs named in
  the header. Round-51 report sha256 `3a977ac156e56731bae35bcda752f223008dc938dde7eee13cdb54798be1cbfe`
  (206 lines).
- Tool installs: none. Gates executed by this seat: `surface-probe --checklists`, `cite-check`,
  `round-gate` (bare and `--tracked`), `proxy-check --strict`, `claims-check`, `sources-check`,
  `kimi-census` — all read-only, outcomes in F4/F7. Lane writes: this file only.
