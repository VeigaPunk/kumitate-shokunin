# DistWave1 — wave-1 synthesis report (kumitate round 51)

Seat: `DistWave1` (scribe/synthesis; item 31 of the w1 spec). I ran last among the build seats.
Deliverable: `.ufo/waves/round-51/build/DistWave1/wave2-items.md` — **96 numbered wave-2 attack
items**, each naming what it attacks and a one-line method.

## Axes

1. **Operability (C1 / `ATTEST_HELD`)** — can a forger or an under-implemented instrument clear
   the frozen A51 arms, and can the honest instrument clear them at all?
2. **Coverage (C2 / `DOCTRINE_HELD`)** — do the D51 arms force substantive, source-grounded content
   or only surface shape?
3. **Close-commit integrability** — will the round's own harm gates (H1–H5) and A5's proxy arm read
   `MATCH` at the close revision, and are the plan's declared term movements arithmetically right?
4. **Freeze integrity** — are the "frozen" counters stable, executable and internally consistent?

## Inputs actually read

All 21 peer reports present under `.ufo/waves/round-51/w1/` at synthesis time:
ConnSiblingOverlap, CritC1, CritC2, CritFreeze, CritHarm, ExecBaseCounter, ExecSelftestArms,
LabratClocks, RevCounterA, RevCounterD, RevInstrumentContract, RevPlan, RevScope, RevengerGap,
ScoutBaselineHar, ScoutClockSource, ScoutRandomSource, ScoutReceiptCorpora, ScoutSiblingLanes,
SentReceipt, SonicAudit.

**11 of 32 wave-1 seats filed no report** when I ran (ExecInstrument, ExecForgerControl,
ExecPinsRecipe, MutInstrument, MutCounter, LabratM2Replay, ScribeEntry, ScribeSources,
ScribeLesson, ExecSelftestExec). Their surfaces are covered below only by my own bounded
experiments and by the build artefacts present under `build/`, never by a peer report. `build/`
at synthesis time held: ExecBaseCounter (2 transcripts + 1 pre-repair crash transcript),
ExecSelftestArms (28-case harness, 16-mutant battery, scratch reference impl, 3 transcripts),
LabratClocks (5 scripts + transcript), ScoutBaselineHar (12 transcripts), ScoutClockSource,
ScoutRandomSource, ScoutReceiptCorpora (2 sweeps + corpora.md + inventory). `build/ExecInstrument/`
never appeared, so the C1 instrument itself was **not** build-tested by anyone in wave 1.

## Counter bytes under synthesis

| File | sha256 | Identity |
|---|---|---|
| `probe/attest51-probe.mjs` | `f3169a676ede4265d00355cae9e900e70ee27043f624d3c28306249b26348d32` | A51 **v3r5**, 8 checks (A1, A2, A2c, A3, A3c, A4, A4c, A5) |
| `probe/doctrine51-probe.mjs` | `f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0` | D51, 5 checks |
| `plan.md` | `c23b6881b11795e92fd0300f4a54a276dcb47a8016d4bdd8b6b8ed328c0b262e` | includes addendum items 1–7 |

The lane was amended **five times** during wave 1 (`06ecbf4` → `1fd8ace` → `3ed875d` → `8c07e88` →
`8fd3cde` → `4b8da21`). Two of those repairs changed check semantics; the fifth landed **during**
this synthesis. All item statements are against the bytes in the table above.

## What I ran (all bounded, all read-only on the lane)

I independently reproduced or discovered the following. Every line below is an observed reading,
not an inference.

### 1. The stored `digest` field is never validated — CRIT, still open

The probe `attest51-probe.mjs` *writes* a digest for its own A4c twin (line 279) but never *reads
and recomputes* a receipt's stored `digest`. I built a tool that writes a **constant** `f`×64
digest field, never checks it in `verify`, and computes a body fingerprint only inside the ledger
walk:

```
$ node .ufo/waves/round-51/probe/attest51-probe.mjs /tmp/<scratch> <rev>
ATTEST51: ATTEST_HELD held=8/8 checks=8 rev=<rev> rule=A51 version=v3
  | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A5 PASS
exit=0
```

C1 claims "whose `digest` field binds every semantic field (nonce, argv, exit, stdout/stderr
sha256, wall ISO start/end, monotonic span)". At the scored bytes that claim is unscored: a
constant digest passes. *(RevCounterA F-F and RevPlan §(d) flagged the missing digest recomputation
generically; this is the executed demonstration at the current v3r5 bytes, and it survives repairs
3–5.)*

### 2. The instrument's nonce freshness is never checked — CRIT, still open

The probe issues three `run` invocations (A2c, A3c, A4c) and never compares their nonces. A tool
whose `run` always emits nonce `0`×32 — every receipt it will ever write carries the same nonce —
also scores `ATTEST_HELD held=8/8`. A2's distinctness check reads the *committed* receipts' parsed
`nonce` fields, which the instrument does not generate at scoring time; A4's prior-corpus sweep
only greps those same three committed nonces.

```
ATTEST51: ATTEST_HELD held=8/8 checks=8 rev=<rev> rule=A51 version=v3
  | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A5 PASS
exit=0
```

### 3. Repair 5 did close the ledger hole — verified

A real-`run` tool with **no ledger nonce check** now reads `ATTEST_UNMET held=7/8`
(`A4c MISS … ledger(orig)=RECEIPT: VALID ledger(twin)=RECEIPT: VALID`). A tool with **no inner
digest** but a *byte-comparing* ledger reads `held=7/8` (`A4 MISS attest-run-2.txt:ledger exit=1
RECEIPT: REPLAY`) — a byte-comparing ledger wrongly flags the M2 twin, exactly as
RevInstrumentContract F1 / RevengerGap F1 predicted before addendum item 4. So A4c does force a
prelude-independent *body-level* binding; what it does not force is that the binding is the
**declared `digest` field** (finding 1) or that nonces are fresh (finding 2).

### 4. D51 reaches 5/5 on a content-free entry — CRIT, still open

I built a scratch lane with a 12-bullet entry whose every bullet is
`- clause N receipt:scripts/proxy-check.mjs@sha256:<real hash>` (no prose), plus conforming S100 and
S101 rows:

```
DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=f8fa03fe... rule=D51
  | D1 PASS | D2 PASS | D3 PASS | D4 PASS | D5 PASS
exit=0
```

So `DOCTRINE_HELD` is satisfiable by a mechanically cheap hollow entry. This is RevCounterD F-1 /
CritC2 §(c) executed end-to-end against the repaired counter.

### 5. D3 ⟂ D4 was real and is repaired — verified both ways

At the v1 bytes, D3 read `c[9]==='mined' && c[12].includes(ENTRY)`. A canonical 13-split-field
SOURCES row (the shape `sources-check.mjs:261` **requires**) has status at `c[8]`, opened at `c[9]`,
used-by at `c[11]`, and `c[12]===''`. I confirmed:

- canonical row: `fields=13`, D3 predicate **false**;
- 14-field row: D3 predicate **true**, but `sources-check` reports
  `ROW_MALFORMED … split-fields=14; expected 13` → `SOURCES_CHECK: DRIFT` → D4 fails.

The two arms were mutually exclusive; `DOCTRINE_HELD` was unpassable as frozen. Repaired in
`3ed875d` to `c[8]`/`c[11]`; I re-verified the repaired expression against a real S099 row and
against my fixture (D3 PASS). Independent convergence: ScoutClockSource, ScoutRandomSource,
CritC2, RevPlan H-2.

### 6. A5's pin arm cannot be satisfied at the close commit without editing a lane script — HIGH

A5 requires `pin.receipt-attest=([0-9a-f]{64})` somewhere in `SCORECARD.md` **and**
`node scripts/proxy-check.mjs --strict` to print `PROXY: MATCH` exit 0. Observed:

```
# pin placed in the kumitate-gate-pins-v1 block (the plan's placement):
proxy-check: fail-closed — GATE_PIN_KEY_UNKNOWN: line 313: pin.receipt-attest is not a
  kumitate-gate-pins-v1 key
PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) exit=2

# pin placed in the kumitate-proxy-v1 stanza:
PROXY: FAIL-CLOSED (STANZA_KEY_UNKNOWN) exit=2

# the only working fix: add 'pin.receipt-attest' to GATE_PINS in scripts/proxy-check.mjs
#   AND re-pin pin.proxy-check in the v1 stanza (that edit changes proxy-check.mjs's own bytes)
→ PROXY: MATCH (only after the A/C/C2/coverage re-derivation below)
```

`scripts/proxy-check.mjs:461-471` is a hard-coded key set; `parseGatePins` rejects unknown keys
(1053-1056). The plan's §Limits (d) says the gate-pins addition "rides the pending R41-2 operator
ruling (stays pending; recorded, does not block)" — but A5 *requires* it, so it does block. This is
the close-commit critical path and it is not described anywhere in the plan.

### 7. The plan's expected close terms are wrong — HIGH

`plan.md` §"Terms expected to move" says `A 43 → 44`, `C 22 → 23`, "coverage successors unchanged".
Measured:

| rev | A (RE_RUNNABLE) | corpus notes | README rows | derived coverage | declared |
|---|---|---|---|---|---|
| base `c90b9de9` | 43 | 114 | 114 | `floor(10×114/114)` = **10** | 10 ✓ |
| round-open tip | **45** | **115** | 114 | `floor(10×114/115)` = **9** | 10 ✗ |
| projected close (+instrument) | **46** | 116 | 116 (with both README rows) | **10** | 10 |

A is 45 at the round-open tip because the freeze commit itself added two probe `.mjs` files, and
`proxy-check` walks the whole tree. The plan's `43 → 44` cannot be right: the close A is **46**.

`C2_total` is already drifted because `corpus/lessons/round-50-verifier-spotcheck.md` was committed
(`d788f74`) **without** a `corpus/README.md` row. I identified it exactly:

```
readme rows=114 notes=115
MISSING README rows: ['corpus/lessons/round-50-verifier-spotcheck.md']
```

Consequence for `coverage = floor(10 × C1/C1_total × C2/C2_total)`: with the new entry's README row
added but *without* the round-50 spot-check row, `floor(10×115/116)` = **9** ≠ the declared 10 →
`AXES_DRIFT`. Both rows must be added.

Current live reading of the projected close tree (stanza unchanged):

```
PROXY  error  A_DRIFT         A: declared=43 computed=46 delta=+3
PROXY  error  C2_DRIFT        C2: declared=114 computed=115 delta=+1
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=114 computed=116 delta=+2
PROXY  error  AXES_DRIFT      coverage: ## Axes row=10 derived=9
PROXY  warn   PIN_UNPINNED    scripts/receipt-attest.mjs has no pin.<name> key
PROXY: DRIFT … exit=1
```

`PROXY: MATCH` is therefore **not** the current state, and H3 fails at the round-open tip already
(independent convergence: ScoutBaselineHar's `09-proxy-drift.txt`, `11-proxy-after-move.txt`).

### 8. A4's ledger/Z3 co-residency trap was real; the fix is contract-only

Before addendum item 4, `verify --ledger <receipts-dir>` had to reject run-2 because the doctored
control in the same directory carries run-2's nonce. I reproduced the failure shape with a
reference implementation: `verify --ledger` on `attest-run-2.txt` → `RECEIPT: REPLAY` → A4 MISS,
while A3 correctly read TAMPERED. Addendum item 4's same-nonce/different-digest exemption resolves
it, and repair 5's A4c arm now enforces it. The instrument must implement the clarified rule
(item 57 of the list).

### 9. A51 v1 literally could not execute — confirmed, repaired

`git show 06ecbf4:.ufo/waves/round-51/probe/attest51-probe.mjs` was a `SyntaxError`:
the glob `round-4*/**` closed the JSDoc block comment, and node exited **1** with a traceback —
exit-code-indistinguishable from a legitimate `ATTEST_UNMET` for a harness keying on exit codes,
and never reaching the counter's own declared fail-closed exit 2. Repaired comment-only in
`1fd8ace`. Independent convergence: ExecBaseCounter F-A51-1, CritC1 §(a), RevPlan H-1.

### 10. A print-stub cleared v2's A1–A4 — confirmed, repaired by A2c/A3c

Against v2/3 I built a static stub printing the verdict strings and scored it; v3's A2c/A3c arms
now kill it (`A2c MISS run exit=0 last=""`, `A3c MISS run exit=0`). Independent convergence:
CritC1 §(b), RevCounterA F-A (which scored a forger with the *then*-current counter at `5/5`),
RevengerGap F2.

## Findings by class: build vs attack

**41 build-side, 55 attack-side** (of 96 items).

- **Build-side (41)** — what the L1 must *produce*: the entry's clause content and alteration/threat
  matrix; the S100/S101 `teaches` cells and date convention; the lesson skeleton and `## Gate`
  ledger; the instrument's ledger / verdict-precedence / canonical-JSON / sidecar / prelude / clock
  / selftest behaviours; the confidentiality sweep and trust-boundary statement; and the
  pin / stanza / README / checklist / SKILL integration.
- **Attack-side (55)** — the falsifiers: 21 target A51 arms, 17 target D51 arms, 8 target
  plan↔counter↔report prose drift, 5 target cross-lane/operational hygiene, 4 target the claim's
  own wording and scope.

## The five highest-severity findings overall

1. **A51 v3r5 never validates the stored `digest` field** (CRIT, executed): a constant-`f`×64 digest
   with the binding computed only inside the ledger walk scores `ATTEST_HELD held=8/8`. C1's central
   mechanism sentence is unscored.
2. **A51 v3r5 never checks the instrument's nonce freshness** (CRIT, executed): a `run` that always
   emits nonce `0`×32 scores `ATTEST_HELD held=8/8`; the plan's "freshness of nonces across a
   ledger" rests on committed fields the instrument does not generate.
3. **D51 admits a content-free entry at `DOCTRINE_HELD held=5/5`** (CRIT, executed): twelve identical
   receipt-only bullets with no prose, plus a substring `used-by` test, plus self-attested `mined`
   and tier (only `community@A` is machine-checked). C2's "grounding" is shape, not substance.
4. **`pin.receipt-attest` is unplaceable without editing `scripts/proxy-check.mjs` and re-pinning
   `pin.proxy-check`** (HIGH, close-blocker, executed): the plan's own placement makes
   `proxy-check --strict` fail closed exit 2 with `GATE_PIN_KEY_UNKNOWN`. A5 cannot pass at the close
   commit until this chain is walked, and the plan never mentions it.
5. **The plan's expected close terms are arithmetically wrong and the trees already read
   `PROXY: DRIFT`** (HIGH, executed): A is 45 at the round-open tip and 46 at close (not 43→44);
   `C2_total` is already 115 vs 114 because of a missing `corpus/README.md` row for the round-50
   verifier spot-check; `coverage` derives **9**, not 10, so `AXES_DRIFT` fires. H3 is currently
   failing, and H5's G50 arm reports `GUARD_UNMET held=7/8` for the same reason.

## Freeze integrity notes for the canonical judge

- Five repairs landed mid-wave; two changed check semantics after the "frozen" declaration. The
  wave-1 reports quote four different A51 identities (`e06be992…` broken, `422e67b0…` v2/v3,
  `5b51c959…` a transient dirty read, `5e75af79…` v3r4) and the counter I scored is `f3169a67…`
  v3r5. A close report that quotes any earlier `held=<k>/5` or `/7` fragment instead of the full
  emitted line will mis-record the verdict — `ConnSiblingOverlap.md:135` already instructs
  `ATTEST_HELD held=5/5`, which is dead.
- `RevCounterA.md` F-D reports the working-tree counter was transiently unparseable (a second
  instance of the v1 comment bug); `SonicAudit.md` F1 independently records two mid-audit hash
  changes. Both are consistent with what I observed (the probe hash moved three times while I ran).
- `plan.md` §C1's body now says eight checks (repair 5) but the do-nothing-control sentence is
  annotated "SUPERSEDED" rather than rewritten, and the rule label `A51` still does not appear in
  the §C1 predicate sentence (it does for `D51`).

## Out-of-scope items observed (not acted on)

- The wave-1 spec's own sweep command (item `ScoutReceiptCorpora`) used
  `round-4{8,9,50}`, which bash expands to `round-48`, `round-49`, `round-450` — round-450 does not
  exist and round-50 is never named. The seat caught it and used the corrected `round-{48,49,50}`.
  Recorded as a spec defect, not a lane defect.
- Six orchestrator dispatch artefacts sit outside the audited containment grammar
  (`w1-assignments.json`, `w1-dispatch.json`, `w1-spec.json`, `w1-taskcall.json`,
  `w1-validate.json`, `w1/swarm-registry.json`); all six are git-tracked in `9d08e6b`, none is a
  seat write (`SonicAudit.md` §3).
- `plan.md` §C2 says the provenance trio sits "in its first three lines"; D51 reads the first five.
  The counter is more permissive; the plan sentence is the one that is wrong (independent:
  CritFreeze F3, RevCounterD F-7, RevPlan M-4, RevScope footnote 1).
- `plan.md` §C2's `getrandom(2)` scope text says "the kernel CSPRNG interface node uses"; the fetched
  page contains the string `CSPRNG` **zero** times and does not establish Node's call chain
  (`ScoutRandomSource.md`). S101's tier-A scope must be narrowed or the bridge separately grounded.

## Files I wrote

- `.ufo/waves/round-51/build/DistWave1/wave2-items.md` (96 numbered items, ~29 KB).
- `.ufo/waves/round-51/w1/DistWave1.md` (this report).

I wrote nothing else. All experiments ran in `mktemp -d` scratch trees with their own `git init`
and one commit; no lane file outside my two paths was modified, no git/jj mutation was run on the
lane, and no package was installed or upgraded (the pacman guard was respected and nothing was
needed).

## Known limits of this report

- Wave 2 will need the 11 missing seat reports' surfaces; where no peer report existed I state my
  own experiment as the source and mark it so. Nothing here upgrades a peer's claim into an
  execution I did not observe.
- I did not build or score a full honest `scripts/receipt-attest.mjs`; the instrument-level findings
  are stated against the frozen arms and against deliberately defective implementations, which is
  what the counter must discriminate.
- The A51/D51 counts I quote are the ones emitted at the bytes in the table; a sixth repair would
  supersede them.
