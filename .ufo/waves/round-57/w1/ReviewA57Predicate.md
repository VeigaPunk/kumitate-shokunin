# ReviewA57Predicate — A57 probe arm-text audit (C1, `ATTEST57_HELD`)

Item: verify the B1..B10 arm texts in `.ufo/waves/round-57/probe/attest57-probe.mjs`
implement the claimed checks (plan §C1 + probe header spec), that `held=10/10
checks=10` is the only score path, and that no arm is vacuously satisfiable.

Verdict: **corroborated** — the frozen probe does what the plan claims. Two
LOW-severity spec-text/implementation gaps and one LOW spoofing-surface note
below; none weakens the predicate when it is graded by the frozen literal.

Frozen bytes audited: sha256 `d177f6d5a7335b5e…` (427 lines), identical to
`.ufo/pins/counter-pins.json` `attest57-probe` pin; 15 `hold(` sites = one call
per check id × success/fail branches, all inside the single `try`.

## Score path — `held=10/10 checks=10` is the only HELD reading

- The only `process.stdout.write` verdict (probe line 426) is
  `${held === checks.length ? 'ATTEST57_HELD' : 'ATTEST57_UNMET'}`; every other
  exit writes `FAIL-CLOSED` to stderr + exit 2 (rev unreadable, catch-all) or
  `USAGE` + exit 64, or `held=0/0 checks=0` + exit 1 (hold-call-deleted guard,
  lines 420-423). Confirmed live: rev `aaaa…40` → `ATTEST57: FAIL-CLOSED rev
  unreadable (2)` exit 2 (`probe-badrev.out`).
- `held=10/10 checks=10` is reachable only by all ten blocks recording `ok:true`.
  At R1 `f0dc6d1` the frozen probe prints the exact frozen predicate sentence
  (`probe-r1-f0dc6d1.out`): `ATTEST57: ATTEST57_HELD held=10/10 checks=10
  rev=f0dc6d1… rule=A57 version=v1` exit 0.
- K3 corroborated live: a hold-call-stubbed mutant (`0&&checks.push`) prints
  `ATTEST57_UNMET held=0/0 checks=0 … | hold-call-deleted` exit 1
  (`mut-holdstub.out`) — same reading the committed MutCounter57 transcript
  attests.

## Arm texts vs claims — all ten implement the claim

B1–B10 each gate on real, falsifiable conditions; none is `hold(id, true)` or
trivially reachable. Live falsification matrix:

| rev | result | proof |
|---|---|---|
| base `7178bfd3` | `UNMET 0/10` | every arm MISSes on absent gate/registry/pins (`probe-base-7178bfd3.out`, K1 do-nothing) |
| R1 `f0dc6d1` | `HELD 10/10` exit 0 | frozen literal reproduced independently |
| corrupt-A (scratch commit `0e51d16`, heartbeat row deleted) | `UNMET 7/10` | B2 `DRIFT first=uncovered:knowledge/worker-heartbeat-liveness.md`, B6 `PROXY: DRIFT C2_DRIFT 135≠134`, B10 `uncovered=1 uncoveredCovered=1` |
| corrupt-B (scratch `0b27898`, `covered=[]`) | `UNMET 6/10` | B2 registry-malformed, B3 arm-d `covered-registry-absent`, B4 no-covered, B10 `unpinned=135` — never a vacuous CLEAN |

Arm-level notes (all corroborate the spec; deltas flagged):

- **B3 DRIFT arms (a–e)** implement the claimed mutations-and-restore on real
  scratch bytes. Expectations match the gate's actual multi-reason DRIFT output
  (`note` lines + `first=`): row-deletion → `uncovered`, file-deletion →
  `orphan-row` (+`stale-covered` since every file is covered), duplicate →
  `duplicate-row`, covered-row deletion → `uncovered` (+`stale-covered`),
  `covered=[]` → `unpinned`. Since `stale-covered`+`unpinned` force
  `covered == files`, the row in arm (a)/(d) is always a covered path, so
  `out.includes(expect)` always matches. Not vacuous.
- **B4 FAIL-CLOSED arms** hit five real rejections in `loadRegistry`/`loadRows`
  (malformed JSON, `version 2`, `covered:"x"`, out-of-namespace entry, missing
  README → `lstatSync` failure), each requiring exit 2.
- **B5/B5c** verifies every pin's sha256 vs blob, requires the r53–56 names +
  the three r57 self-pins with exact paths, plus the held=0/0 transcript and the
  checks-nonempty guard regex. Verified independently: all eleven round-53..56
  pins CARRIED unchanged from base to R1 (`pins-base-vs-r1.out`).
- **B6** SCORECARD pin-vs-gate-sha256 equality AND `proxy-check --strict`
  `PROXY: MATCH` — both bound real bytes (corrupt-A broke both proxy terms).
- **B7** gate-registry row + `kumitate-readme-map-v1` + `items === 27` + the
  four item→gate bindings — implements the R56-V2 amendment as frozen.
- **B8** three hardcoded receipt names + `.sha256` sidecars, each verified
  `RECEIPT: VALID` under `verify --ledger`; doctored control
  `attest-run-2-replayed.txt` excluded by construction. Nonce uniqueness is
  enforced pairwise AND against a `git grep` of rounds 48–56 at rev (66 prior
  nonces surveyed, all hex; the two non-hex hits are doc templates
  `${n}`/`[0-9a-f]{32}`, uncollidable). Span uses `run-at:` first (the receipts
  carry `run-at:` and `"wall_start"` identical). One edge: `git grep` status≠0
  (no-match exit 1, or error) silently skips the collision sweep — correct for
  the "at rev" semantics, but a rev that deletes rounds 48–56 would vacate it
  (impossible in practice: B5 pins r53–56 probe blobs).
- **B9** lesson `R56-V1/V2/V3` + LOG `R56-V2/V3` + sha256-verified S117..S120
  captures — non-vacuous (corrupt-B left it PASS; it binds committed bytes).
- **B10** independent recompute is *stricter* than claimed: it requires zero
  `uncovered`/`orphans`/`dupes`/`stale`/`uncoveredCovered`/`unpinned` (i.e.
  `covered == files`, not merely subset) AND the gate's own CLEAN verdict.

## Findings (by severity)

1. **LOW — `ATTEST57_HELD` token alone is spoofable by an arm-deleted mutant.**
   `held === checks.length` prints `ATTEST57_HELD` exit 0 even at 9/9: my
   drop-arm mutant (B9's `hold` renamed) prints `ATTEST57: ATTEST57_HELD
   held=9/9 checks=9 …` exit 0 (`mut-droparm.out`). The frozen predicate is the
   full literal `held=10/10 checks=10`, which still kills this mutant — but any
   downstream grader matching only the token or exit code admits it. Consider
   future rules emitting a distinct token when `checks.length !== 10`
   (defense-in-depth only; not a defect in this probe). Also notes a plan-text
   imprecision: K3 says drop-one mutants print `held=9/10` — a deleted arm
   actually prints `held=9/9` (both killed by the literal).
2. **LOW — B9 claims section-scoped checks the implementation doesn't scope.**
   Header/plan say the lesson names the IDs "in its `## Mistakes` section" and
   LOG carries them in "a round-57 entry"; the code greps whole-file.
   Harmless today: the IDs do appear in `## Mistakes` (lesson lines 31–33) and
   inside the round-57 LOG entry (lines 2199–2209, within entry starting 2175),
   but a rev carrying the strings anywhere would satisfy the arm.
3. **LOW — B5's "WITHOUT REGRESSION" is presence+integrity, not declared-value
   equality.** The arm verifies each pin's sha256 matches the blob at rev and
   the r56 names exist; it does not compare the r56 pins' sha256 values to the
   frozen round-56 literals. A rev that rewrites a prior probe *and* its pin
   stays self-consistent (independently, no such regression exists — all eleven
   pins carried byte-identical). The "sorted-unique" wording in the B2 header is
   likewise partially aspirational: uniqueness is enforced (gate rejects
   duplicate covered entries → exit 2 → B2 MISS), sortedness is not (registry
   happens to be sorted).

## Residual risk / verification gaps

- Probe self-integrity rests on the frozen-by-plan convention + the B5d self-pin;
  nothing inside the probe pins its own sha to a literal — a rev rewriting both
  probe and pin is self-consistent under B5. Detected by review, not by the arm.
- B8 sweep-skip on `git grep` non-zero status, and B3 arm (a)/(c)'s
  `findIndex(l.startsWith('| \`'))` assumption that README rows are unindented
  (true at R1; an indented README would misjudge `i` — both skew toward MISS,
  i.e. fail-closed toward UNMET, never toward HELD).
- Unused `EarlyExit` class — dead scaffolding, cosmetic.

## Evidence (all under `.ufo/waves/round-57/build/ReviewA57Predicate/`)

`attest57-probe.frozen.mjs` (copy, sha d177f6d5…), `probe-base-7178bfd3.out`,
`probe-r1-f0dc6d1.out`, `probe-badrev.out`, `probe-corrupt-rowdrop.out`,
`probe-corrupt-covempty.out`, `mut-holdstub.mjs/.out`, `mut-droparm.mjs/.out`,
`pins-base-vs-r1.out`, `nonce-survey.out`, `scratch-lane/` (clone with the two
corruption commits `0e51d16`, `0b27898`). No lane files modified; the clone was
created under my own build dir and lane git state untouched (the pre-existing
`swarm-registry.json` modification predates this seat).
