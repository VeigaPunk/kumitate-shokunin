# Round 51 — lesson

Lane: kumitate. Round 51 (hyaku run 5; watchdog attempt 1). Base `c90b9de94009b938fa19a089bfaa97df20b54f86` (the round-50 sweep tip at round open; the
integrator's round-50 spotcheck lesson `d788f74` landed between base and the freeze
commit `06ecbf4`). Plan `.ufo/waves/round-51/plan.md` (with its
`## Freeze repair addendum`, eight named items); frozen counters
`.ufo/waves/round-51/probe/attest51-probe.mjs` (rule A51, v3r6, nine checks) and
`probe/doctrine51-probe.mjs` (rule D51, five checks). Round shape: two v1 waves, 32+32
(seat counts in the report); wave 1 build, wave 2 falsify.

Two claims. **C1 — operability (capability acquisition): `receipt-attest`**,
`scripts/receipt-attest.mjs` (contract `kumitate-receipt-attest-v1`), predicate
`ATTEST_HELD` (rule A51). **C2 — frontier coverage (learning, sourced):**
`corpus/knowledge/invocation-attestation.md` citing new rows S100/S101, predicate
`DOCTRINE_HELD` (rule D51). Round-50 closure routed defects R51-1..R51-4 are honored in
the close (close-hygiene sweep, declared-vs-computed terms phrasing, L0 citation style,
live-census limit).

## Mistakes

- **M1 — a frozen counter that was never executed before freezing.** Class: unrun-check
  treated as passed / freeze integrity. Evidence: A51 v1 could not parse (a glob in its own
  JSDoc closed the block comment; crash reads exit 1, masquerading as UNMET — found by
  CritC1); D51 v1 indexed SOURCES columns 9/12 where the schema puts status/used-by at
  8/11, making D3 and D4 mutually exclusive (found independently by ScoutRandomSource and
  ScoutClockSource). Captured by: nothing before the seats — the freeze discipline assumed
  authorship care; the wave's first falsifiers caught both within minutes. Q43's letter
  convicts this round itself: freeze commit `06ecbf4` shipped no executed before-receipt
  (v1 could not even run); the repairs committed the base receipts the same round. Q43
  stands as the prevention rule from round 52 on. Fix: six named
  repairs (addendum items 1–2, then 3–8 as seats falsified v2/v3: the v2 kill rule fell to
  a print-stub (CritC1, RevengerGap), the A3c arm tested the missing-sidecar class not the
  M2 forgery (CritC1), no arm asserted REPLAY (RevPlan), nothing bound the stored digest
  (DistWave1 item 1)); every repair re-measured the base before landing
  (`base/attest-base-v3r6.txt`, `held=0/9`). The durable rule for future rounds: freeze
  means frozen AND executed — a counter whose before-state was never produced is not a
  predicate, it is a hope (QUALITY Q43 class, added this round).
- **M2 — a declared kill rule that was never tested against its own control.** Class:
  survivor / vacuous predicate. Evidence: plan control 2 claimed a stub "cannot clear
  A1/A3"; CritC1 and RevengerGap ran the stub and read A1 PASS (RevCounterA drove the
  full-tree forger to held=5/5). Captured by: CritC1. Fix: addendum item 3 — behavioural
  challenge arms (A2c probe-issued run binding argv + stdout hash; A3c live prelude-tamper;
  A4c same-nonce/different-digest ledger REPLAY; A3d corrupt-digest REPLAY); RevCounterA
  re-verified the forger now reads held=5/8 (static arms remain forgeable by construction —
  the judged object is the committed tree, r49 precedent; recorded as a limit, not hidden).
- **M3 — the literal reading of my own ledger prose made A4 unpassable.** Class:
  contract ambiguity at a boundary I authored. Evidence: the A3 doctored control shares
  run-2's nonce in the same ledger directory; RevInstrumentContract F1 reproduced it live
  in a peer's scratch implementation. Captured by: RevInstrumentContract F1. Fix: addendum
  item 4 (flag only same-nonce + different-digest; self and byte-identical duplicates
  exempt) — RevengerGap verified the trap closed from committed bytes.
- **M4 — two plan-body sentences went stale across my own repairs.** Class:
  number-drift / incomplete cross-reference sweep (round-50 M3 class). Evidence: RevPlan
  measured "five checks / held=5/5" still in §C1 after the check set grew to 9, and the
  do-nothing-control paragraph still asserting the falsified stub claim. Captured by:
  RevPlan M-1. Fix: same-commit text repairs (addendum items 5–7; plan.md arithmetic now
  held=9/9 everywhere).

## Gate

Candidates: S100 (man7.org clock_gettime(2)) and S101 (man7.org getrandom(2)), opened by
scout seats this round.

- **S100 — ADMITTED, tier A.** Opened 2026-10-24T01:59:31Z (fetch date 2026-10-23 local,
  -03); HTTP 200; 30,379 bytes; sha256 `7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69`;
  man-pages 6.19, page 2026-03-07. Located quote (22 words), DESCRIPTION,
  `CLOCK_MONOTONIC` paragraph, saved HTML lines 177–179: "The CLOCK_MONOTONIC clock is not
  affected by discontinuous jumps in the system time (e.g., if the system administrator
  manually changes the clock)". Status `mined`; used-by
  `corpus/knowledge/invocation-attestation.md`.
- **S101 — ADMITTED, tier A.** Opened 2026-10-24T01:59:28Z; HTTP 200; 16,466 bytes;
  sha256 `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d`; man-pages
  6.19, page 2026-02-08. Located quote (17 words), DESCRIPTION paragraph 2, saved HTML
  lines 85–86: "By default, getrandom() draws entropy from the urandom source (i.e., the
  same source as the /dev/urandom device)." Status `mined`; used-by
  `corpus/knowledge/invocation-attestation.md`.
- Withheld claims (recorded, not admitted): S100 does NOT say CLOCK_MONOTONIC is
  NTP-immune (frequency adjustments apply); S101 never says "CSPRNG" nor that Node's
  `crypto.randomBytes` calls `getrandom()` — the entry phrases both bounds exactly.
- Rejected: none this round.
- Spot-check: wave-2 seats re-open both rows (fresh fetch, byte-hash compare).
- **S101 `teaches` cell correction (wave-2 seat CritSourcesRows):** old → new:
  `getrandom() draws entropy from the urandom source, the same source as /dev/urandom, and
  its bytes are usable for cryptographic purposes.` → `By default, getrandom() draws
  entropy from the urandom source (the same source as /dev/urandom); its bytes are usable
  for cryptographic purposes.` — restores the omitted "By default," so the teaches cell
  matches the verbatim quote. Row identity, tier, status unchanged.

- **M5 — the challenge command was predictable, so the strongest stub still passes the
  strongest arm.** Class: survivor / predictable-vector oracle. Evidence: seat
  ExecForgerControl (wave 1, delivered late during wave 2 — 53 min, after two
  return-now nudges) built a zero-spawn forger with
  faithful receipt format (canonical digest, GNU sidecar, distinct nonces, ledger
  semantics) and read `ATTEST_HELD held=9/9` — its A2c arm hashes `argv[last]`, and the
  frozen challenge `/usr/bin/printf %s <nonce>` has stdout exactly equal to `argv[last]`,
  so hashing argv satisfies the arm without executing anything. The seat validated the
  fix: nonce delivered on stdin and the probe captures the child's real stdout itself —
  patched probe kills the forger (`A2c MISS`) and passes the honest instrument. Captured
  by: ExecForgerControl's mandated do-nothing control (the original v2 kill-rule class,
  driven one level deeper). Fix: pre-registered for round 52 — arm A2e (stdin challenge)
  plus a `--stdin` contract addition; until then the bypass sits inside the declared
  whole-tree-author forgery boundary (a forger must also ship the matching pin and proxy,
  i.e. author the tree — the judged object by r49 precedent) and is recorded in the
  SCORECARD limits (a)/(b).
