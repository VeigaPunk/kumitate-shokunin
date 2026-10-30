# K70ReviewSnapshot — Gate frozen snapshot input digests + independent expected findings (new tool)

Scope: review ONLY (a) Gate-standard frozen snapshot input digests and (b) the new tool's
independent expected findings (selftest finding ids / expected exit map). Candidate inspected:
`.ufo/waves/round-70/build/K70ExecRunner/scripts/control-replay.mjs` (read-only; never modified).
Base B = `78b98d762ccf3e3a0961f94c4042eaabd2bcb706`. Frozen counter: `base/replay70-base.txt`
(REPLAY70_UNMET held=2/10; R1 PASS, R9 PASS) — matches plan claim "from the base receipt's 2/10".

Tooling: node v24.21.0 (host, pre-existing; no installs, no pacman transactions).
Scratch: `/fast/scratch/hyaku/kumitate-r70/K70ReviewSnapshot` (created, used, cleaned).
Receipts copied to `.ufo/waves/round-70/build/K70ReviewSnapshot/receipts/` before scratch cleanup.

## Axis A — Gate standard frozen snapshot input digests: CONSISTENT (no defect)

Commands and observed outcomes (full transcript: `build/K70ReviewSnapshot/receipts/snapshot-digests.txt`):

- `git show B:.ufo/waves/round-69/probe/c1-controls.sh | sha256sum`
  → `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12`
  == candidate `FROZEN.c1.sha256` (source line 39) == worktree file (byte-compared earlier, MATCH).
- `git show B:.ufo/waves/round-69/probe/c2-controls.sh | sha256sum`
  → `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4`
  == candidate `FROZEN.c2.sha256` (source line 40) == worktree file (MATCH).
- Round-69 pinned probes at base match base blobs exactly:
  `ledger69-probe.mjs` `1f19d1e6…f946de`, `deprec69-probe.mjs` `af021f87…52e7`,
  `scripts/routed-ledger.mjs` `05aacb5e…13b1` (all three verified against `counter-pins.json` at B).
- Base `counter-pins.json`: 37 pins, NO `scripts/control-replay.mjs` pin at B (correct — R10
  requires the pin added at REV with sha256 == committed tool bytes; L1 integration duty).
- `base/freeze-map.txt` observed: `README_MAP: CLEAN files=169 rows=169 covered=169` — the plan's
  CLEAN-at-commit precondition is met as far as this seat can observe; no PLAN_BEFORE_READY
  anticipation found in the reviewed files.
- Base registration rows: `git show B:SKILL.md | grep -c control-replay` → 0; SCORECARD → 0
  (R10 rows must be added at REV; noted as integration-time verification gap, not a defect now).

Candidate bytes reviewed: sha256 `460c0a6cda9d0d40135ba447dc0812b08e31e12063f1733d080534935eedec32`,
mtime 2026-10-30 12:32:45, 381 lines. NOTE: the candidate was mutated mid-review by its owner
(an earlier on-disk variant had a dynamic ST08 c1 replay; the current canonical bytes have the
offline `ST08-private-syntax`). Both my hash observations post-date the mutation; L1 must re-pin
the digest at commit time against the final integrated bytes.

## Axis B — Independent expected findings for the new tool: ONE DEFECT + bounded gaps

Independent derivation from the two frozen control scripts (the only instruction source for
expected findings) and the frozen probe:

- Exit map: 0 control pass; 1 control fail (incl. live-arm unreachable, "reported, never waived");
  64 usage; 65 frozen-source/transform refusal; 70 internal/timeout; 73 exclusive-create refusal.
  Candidate `EXIT` (line 32) and `parseArgs` ordering (missing-required beats family validity,
  so `--family junk` alone → 64) match this derivation and probe R8.
- Receipt contract per mode: first line `LEDGER69_UNMET*` / `DEPREC69_UNMET*` with RC=1, then
  `CONTROL-PASS <mode>` (c2 forgecapture additionally requires the `S210:origin-sha-mismatch`
  digest marker); private receipt path `$CHILD/receipts/{c1|c2}-<mode>.txt`; trailer
  `control=<mode> … exit=1 rev=<REV>`. Candidate redirects W into `$CHILD/receipts` and tees
  CONTROL-PASS/FAIL into the receipt so the new private output satisfies R3–R7's
  `text.includes(label) && text.includes('CONTROL-PASS '+mode)`; original receipt bytes in the
  archived r69 controls dir are never written (probe's `preserved` check).
- Selftest ids ST01–ST09 and expectations (64/64/64/64, 65, true, 73+intact, all-five-modes
  private copy sane, c2 static invariants) all match the independent derivation; stable ids ✓.

### Defect 1 (medium — honest saturation): SKIP is counted as ok, selftest passes vacuously

Source: `build/K70ExecRunner/scripts/control-replay.mjs:303-306` — when `findLaneRoot()` returns
null (frozen snapshot inputs unresolvable from `REPLAY70_LANE`, cwd, or SELF ancestors), ST05–ST09
are pushed as `{ expect: null, obs: null, ok: true, note: 'SKIP: …' }`; line 368
`allOk = results.every(r => r.ok)` then yields banner PASS, exit 0.

Observed (`receipts/selftest-scratch-cwd.txt`):
`TMPDIR=<scratch> node …/control-replay.mjs --selftest` from scratch cwd →
`CONTROL_REPLAY_SELFTEST: PASS cases=9 ok=9` with all five substantive lines
`expect=SKIP observed=SKIP ok SKIP: frozen sources not resolvable`, `exit=0`.

Impact: probe R2 (exit 0 + `/^CONTROL_REPLAY_SELFTEST: PASS/m`) is satisfied by a run that
executed none of ST05–ST09. Under the canonical probe invocation the archived tree resolves the
lane, so R2 is genuinely backed there (observed: `receipts/selftest-lane-cwd.txt`, PASS 9/9 with
`c1/donothing:ok c1/autoledger:ok c2/donothing:ok c2/autoorigin:ok c2/forgecapture:ok`); but
standalone — e.g. after L1 integrates the tool to `scripts/` and someone runs `--selftest` from the
repo root, where no candidate path contains `.ufo/waves/round-69/probe/c1-controls.sh` — the
selftest passes having checked only the argument parser. The "stable finding ids and expected
exit maps" claim is thereby dishonest as an independent signal. Fix direction: treat SKIP as
not-ok (exit 1) or emit a distinct banner (e.g. `PASS cases=9 ran=4 skip=5`) that R2-style
consumers can distinguish.

### Gap 2 (low, bounded): ST08 validates syntax only, not the receipt contract

Current ST08 (lines 336–351) runs `bash -n` on all five private copies plus a receipt-marker
substring check. It never dynamically replays even the hermetic c1 modes, so the expected-finding
map no longer exercises `LEDGER69_UNMET`+`CONTROL-PASS` production end-to-end (an earlier candidate
build did). Bounded justification: c2 dynamic replay is network-dependent (forgecapture live arm,
honestly reported-never-waived per plan), and probe R3–R7 provide integration-time end-to-end
coverage; but as an expected-findings matter the selftest now covers transform/static properties
only. Not a predicate blocker; flagged as residual risk.

### Minor residuals (no action required for the predicate)

- `SCRUB` (lines 45–52) omits `GIT_CONFIG_PARAMETERS`/`GIT_CONFIG_ENVIRONMENT`; inherited
  `git -c` config can reach the fixture's git commands, though no repository-redirect vector is
  exposed (fixture pins identity via explicit `-c`). Defense-in-depth only.
- ST05 mutates byte `b[length-3]` of the frozen script; refusal is via pin hash, so tamper
  semantics are irrelevant to the outcome — robust as written.

## Verification gaps (outside this seat's scope)

- R10 triad at REV (SKILL/SCORECARD rows + pin sha256 == final committed
  `scripts/control-replay.mjs` bytes): base state confirmed (0/0 rows, no pin); integration
  result unverifiable until L1 commits.
- Probe end-to-end run at candidate REV (R3–R7 live forgecapture arm): network-dependent;
  not exercised by this seat.
- Candidate was still owned by a running executor during review (mtime 12:32:45 mid-review);
  findings pinned to sha256 `460c0a6c…` above; any later mutation requires re-review.
