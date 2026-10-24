# kumitate round 51 — frozen plan

Lane `kumitate-shokunin` (master, jj-colocated). Base and round-open tip
`c90b9de94009b938fa19a089bfaa97df20b54f86` (local == remote, ahead=0). Frozen before any
data seat runs, same commit as both counters. Axes owned: operability + coverage
(orchestration & tooling). This round declares **two claims**, one per distinct axis.

## Context — why these claims

Every live axis sits at its terminal value (operability 9 under the saturating `f_O`;
coverage successors 10/10/10) and the round-50 close recorded the next candidates:
(1) the anti-replay question for R4-class receipts — a separately frozen
captured-invocation instrument or an explicit attestation field (QUALITY Q39's honest
ceiling); (2) the bind guard's site-level arm (not taken this round). The round-49/50
lesson M2 class — receipts presented as time-spaced runs that were byte-identical — was
repaired by re-issue (R50-4) but the *detection* gap remains: nothing in the lane can
machine-distinguish a genuine invocation record from a prelude-only replay. Round 51
lands the instrument that closes that gap (C1) and records the design as sourced
frontier knowledge (C2).

## C1 — operability (capability acquisition): `receipt-attest`

New shipped instrument `scripts/receipt-attest.mjs` (contract `kumitate-receipt-attest-v1`):
turn an invocation record into a machine-checked object.

- `run --out <base> -- <cmd...>` executes `<cmd...>`, captures argv, exit code, stdout and
  stderr sha256, a 128-bit random nonce (`crypto.randomBytes`), wall clocks
  (`Date.now`, ISO start/end) and a monotonic span (`process.hrtime.bigint`), then writes
  `<base>.txt` and `<base>.txt.sha256` (GNU `sha256sum` format over the exact receipt
  bytes). Receipt bytes = a display `run-at:` prelude line plus one canonical-JSON line
  (sorted keys) whose `digest` field binds every semantic field (nonce, argv, exit,
  output hashes, clocks) — sha256 over the JSON line with the `digest` field removed.
- `verify [--ledger <dir>] <file>` recomputes the inner digest, the sidecar hash and the
  clock ordering (wall_end ≥ wall_start, mono ≥ 0); with `--ledger`, walks every other
  `*.txt` receipt in `<dir>` and rejects a nonce already present. Verdict lines:
  `RECEIPT: VALID` exit 0; `RECEIPT: REPLAY` exit 1 for both an inner-digest mismatch and
  a nonce-reuse; `RECEIPT: TAMPERED` exit 1 for a sidecar mismatch; usage 64; unreadable 2.
  No env is recorded; receipts carry no secret material (QUALITY Q42 class).
- `--selftest` hermetic suite ≥10 cases including a flake-injection case whose doctored
  receipt must read `REPLAY` and a sidecar-mismatch case that must read `TAMPERED`.

What it closes (r50 limit (c) / lesson M2): a receipt re-dated by rewriting only its
`run-at:` prelude now fails verification (`TAMPERED` — the sidecar covers the whole file,
prelude included), and a new receipt forged from an old body's nonce fails the ledger
(`REPLAY`). What it does not claim (Q39 ceiling kept verbatim): receipts remain
author-attested invocation records, not cryptographic temporal proof — the instrument
proves integrity of the record and freshness of nonces across a ledger, not the wall-clock
truth of when the bytes were made.

**Predicate, label `ATTEST_HELD`** — frozen counter
`.ufo/waves/round-51/probe/attest51-probe.mjs` (this directory), five checks over the
committed bytes of `<rev>` (`git archive`, never the working tree):
A1 `scripts/receipt-attest.mjs` exists at rev and `--selftest` prints
`ATTEST_SELFTEST: PASS` exit 0; A2 the three committed receipts
`.ufo/waves/round-51/receipts/attest-run-{1,2,3}.txt` (+ sidecars) each verify
`RECEIPT: VALID`, their embedded nonces are pairwise distinct, their file sha256 are
pairwise distinct, and max(run-at) − min(run-at) ≥ 300 s; A3 the committed doctored
control `.ufo/waves/round-51/receipts/attest-run-2-replayed.txt` (run-2's receipt with
only the `run-at:` prelude rewritten, sidecar untouched — the exact lesson-M2 forgery)
verifies `RECEIPT: TAMPERED` exit 1; A4 `verify --ledger` over the round-51 receipts
directory reports no nonce reuse against any prior committed receipt corpus listed in the
probe (r49/r50 receipt files); A5 `pin.receipt-attest` in the SCORECARD
`kumitate-gate-pins-v1` block equals the sha256 of the extracted script and
`node scripts/proxy-check.mjs --strict` (UFO_SRC = live origin checkout) prints
`PROXY: MATCH` exit 0. `ATTEST_HELD` = held=8/8 exit 0 (checks A1, A2, A2c, A3, A3c, A4,
A4c, A5 — the challenge arms A2c/A3c/A4c per the `## Freeze repair addendum`; the body's
original "five checks / held=5/5" wording is superseded by addendum items 3 and 7); any
other reading is `ATTEST_UNMET held=<k>/8` exit 1; crash/unreadable extraction = exit 2
(never a score).

- Counting command: `node .ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`
- Before (control): at base `c90b9de9` → expected `ATTEST_UNMET held=0/8` (A1 absent;
  measured `base/attest-base-v3r5.txt`).
  Do-nothing control (SUPERSEDED by addendum item 3 — the original claim "a stub cannot
  clear A1/A3" was falsified by seats CritC1 and RevengerGap; v3's challenge arms A2c/A3c
  now defeat the print-stub class, and RevCounterA re-verified: forger rev 9cb611b7 reads
  ATTEST_UNMET held=5/8 against v3r5): the control reading is committed at
  `build/ExecForgerControl/` and `w1/CritC1.md`.

## C2 — frontier coverage (learning, sourced): `invocation-attestation`

New knowledge entry `corpus/knowledge/invocation-attestation.md` recording the design and
its grounding: why wall clocks alone invite the M2 forgery; CLOCK_MONOTONIC semantics for
the span field (S100); nonce generation via the kernel CSPRNG interface node uses (S101);
the two-layer binding (sidecar over whole file, inner digest over semantic fields); the
nonce ledger; and the kept Q39 ceiling. New SOURCES rows S100 (man7.org
`clock_gettime(2)`) and S101 (man7.org `getrandom(2)`) are opened this round by scout
seats (fetch bytes, hash, ≤25-word located quote each, recorded in the lesson `## Gate`),
written by the scribe, status `mined`, `used-by` the entry. C2 rests on these rows:
the entry's provenance trio cites S100/S101 — this is the round's sourced claim.

**Predicate, label `DOCTRINE_HELD`** — frozen counter
`.ufo/waves/round-51/probe/doctrine51-probe.mjs` (rule `D51`):
D1 the entry exists at rev with the provenance trio (`source:` citing S100 and S101 with
URLs, `verified-at:`, `recheck:`) in its first three lines; D2 ≥12 clause lines, each
carrying a `receipt:<repo-path>@sha256:<64hex>` binding whose path exists at rev with a
matching blob sha256; D3 `corpus/SOURCES.md` at rev carries rows S100 and S101 with
status `mined` and `used-by` naming the entry; D4 `node scripts/sources-check.mjs` against
the extracted tree prints `SOURCES_CHECK: CLEAN` exit 0; D5 the live census
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
exits 0. `DOCTRINE_HELD` = held=5/5 exit 0; else `DOCTRINE_UNMET held=<k>/5` exit 1;
crash/unreadable = exit 2.

- Counting command: `node .ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`
- Before (control): at base `c90b9de9` → expected `DOCTRINE_UNMET held=0/5` (entry absent).

## Terms expected to move

A 43 → **44** (the new shipped instrument; round-51 probe counters live under
`.ufo/waves/round-51/probe/` and add to the frozen A count only by the frozen
`RE_RUNNABLE` walk — recorded, not claimed); C 22 → **23** (checklist item 23 =
receipt-attest hermetic suite; item text integrated with SKILL.md's gate registry row for
`receipt-attest`). Operability integer holds **9** (terminal under `f_O`); coverage
successors unchanged (frontier band entry — no registry family moves). New capability row
`receipt-attest` enters the SCORECARD capabilities table (demonstrated running this
round). Stanza re-derivation (A/C/C2 terms + `pin.receipt-attest`) rides the close commit,
with `proxy-check --strict` MATCH as the harm gate H3.

## Harm rules (declared before data; freeze baseline = round-open measurements)

- H1 `node scripts/surface-probe.mjs --checklists` item-level ≥ the round-open baseline
  **22/22**, exit 0 (`base/baseline-gates.txt`).
- H2 `cap-run` 12/12, `bind-oracle` 7/7, `counter-rerun --selftest` PASS,
  `round-gate --selftest` 61/61 — all at the close commit.
- H3 `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH` exit 0 at the close commit.
- H4 sources census exit 0 at round end.
- H5 round-50 frozen counters do not regress at the close commit: G50 `held=8/8`,
  R50 `held=8/8`.

## Waves

**Round shape: two v1 waves, 32 + 32 = 64 seats (≤128).** Wave 1 `kumitate-r51-w1`
(build, 32 seats, band 32–64 under `scripts/hyaku/ufo-wave-policy.json`): recon, source
opening, instrument build in scratch, entry drafting, and the first falsifiers of both
frozen predicates; the §3 L2 floor (1 connector, 3 executors, 1 scribe, 1 scout, 1
reviewer, 1 critic; the planner seat is the L1's, per the orchestrator ruling — a bounded
planning walk rides scout/reviewer items). Wave 2 `kumitate-r51-w2` (falsify, 32 seats)
dispatched only if wave 1 yields ≥32 distinct attack items; every item names what it
attacks. Residuals, if any, go to one ordinary task call ≤8 seats, counted in the round
total. Seats never edit the lane checkout outside their own report/aux paths; code and
prose are delivered as artifacts the L1 integrates (single integration owner).

## Controls to run before data

1. Both counters at base `c90b9de9` → `ATTEST_UNMET`, `DOCTRINE_UNMET` (before receipts).
2. Static-forger control: a scratch stub `receipt-attest.mjs` printing the verdict
   strings, scored by the frozen A1/A3 arms → must remain UNMET.
3. Baseline battery: proxy `--strict` MATCH, checklists 22/22 — done at round open
   (`base/baseline-gates.txt`, 2026-10-23).

## Limits declared up front

(a) Receipts prove record integrity and ledger nonce freshness, not temporal truth — the
Q39 ceiling sentence is carried into the entry and the lesson. (b) A2's ≥300 s span is
author-scheduled (three runs by the L1 across the round), the same invocation-independence
class the lane has used since R50-4; it is honestly labelled. (c) A4's prior-corpus list
is finite (the probe names it); a negative-claim sweep command is included in the probe
output. (d) The instrument pins a SKILL gate-registry row and a checklist item; the
`kumitate-gate-pins-v1` block addition rides the pending R41-2 operator ruling (stays
pending; recorded, does not block).

## Freeze repair addendum (2026-10-24, append-only; supersedes the freeze bytes it names)

All repairs are named, minimal, and re-based before any data seat scored against the
repaired arms. Base before-state re-measured with the repaired counters at base
`c90b9de9` (both UNMET) and committed under `base/`.

1. **A51 v1 → v2 (`1fd8aceb`)** — comment-only fix: the v1 JSDoc contained the glob
   `round-4*/**`, whose `*/` terminated the block comment; the probe could not execute
   (SyntaxError) and a crash reads exit 1, indistinguishable from a legitimate UNMET.
   Found by seat CritC1 before any data ran against it.
2. **D51 v1 → v2 (`3ed875d3`)** — one-line column-index fix in the D3 SOURCES-row check:
   status is split-field 8 and used-by field 11 (`sources-check.mjs` schema), not 9/12.
   Found independently by two seats (ScoutRandomSource, ScoutClockSource); D3 and D4 were
   mutually exclusive in v1, so `DOCTRINE_HELD` was unpassable as frozen.
3. **A51 v2 → v3 (this addendum's commit)** — seat CritC1 demonstrated a
   verdict-printing stub clears v2's A1..A4, falsifying the plan's declared do-nothing
   kill rule. v3 adds two behavioural challenge arms: **A2c** runs the instrument in
   `run` mode against a probe-issued command (`/usr/bin/printf %s <probe-nonce>`) and
   requires the fresh receipt to bind that argv and the sha256 of the command's real
   output, plus a `sha256sum -c`-clean sidecar (absolute `/usr/bin/sha256sum`); **A3c**
   generates a fresh receipt, rewrites only its `run-at:` prelude and requires
   `RECEIPT: TAMPERED` exit 1. Check set becomes A1, A2, A2c, A3, A3c, A4, A5 (7);
   predicate label and kind unchanged: `ATTEST_HELD` = every check holds. No seat scored
   against v3's arms before this freeze.
4. **Ledger semantics (seat RevInstrumentContract finding F1, confirmed live)** — the A3
   doctored control lives in the same receipts directory as run-2 and carries run-2's
   exact nonce; the literal reading ("reject a nonce already present") makes A4
   unpassable. Clarified contract: the `--ledger` arm flags a nonce only when another
   receipt file binds the SAME nonce to a DIFFERENT record digest; the target file itself
   and byte-identical duplicates (same digest) are exempt. Reuse across distinct records
   is what the ledger detects; verbatim duplication is detected by A2's
   distinct-sha/distinct-nonce arms instead.
5. **Probe-side binaries** — the probe (not the shipped instrument) may spawn host
   binaries; it uses absolute paths (`/usr/bin/printf`, `/usr/bin/sha256sum`) per the
   connector's chousa-r37 PATH-injection note. The shipped instrument itself must compute
   all digests with `node:crypto` and emit the GNU text-mode sidecar without spawning
   `sha256sum`.
6. **A3c sidecar (`8fd3cde1`)** — seat CritC1 found v3's A3c wrote a tampered receipt
   without its sidecar, testing the missing-sidecar class instead of the declared M2
   forgery; the arm now copies the genuine sidecar unchanged to the tampered target.
   Freeze repairs to date: `1fd8aceb` (A51 comment), `3ed875d3` (D51 indexes),
   `8c07e880` (A51 v3 challenge arms), `8fd3cde1` (A3c sidecar).
7. **A4c REPLAY challenge + text repairs (this commit, per seat RevPlan)** — RevPlan
   demonstrated no frozen arm asserted the declared `RECEIPT: REPLAY` class, the §C1 body
   still said "five checks / held=5/5", and the probe header claimed an exit-2 path for
   malformed verdict lines the code never implements. v3r5 adds A4c (probe-crafted
   same-nonce/different-body twin with contract-canonical recomputed digest: twin alone
   VALID; `--ledger` over {original, twin} must read `RECEIPT: REPLAY` exit 1 for both),
   rewrites the body arithmetic to eight checks, and fixes the header claim. Check set:
   A1, A2, A2c, A3, A3c, A4, A4c, A5.
