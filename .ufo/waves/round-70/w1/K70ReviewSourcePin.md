# K70ReviewSourcePin — round-70 C1 replay, review of exact frozen-source pinning

Seat: K70ReviewSourcePin (leaf review seat). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Base B = 78b98d762ccf3e3a0961f94c4042eaabd2bcb706. Frozen plan: 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a. Review axis: the transformed shell source must authenticate **both** frozen originals before any execution (not only needle counts); line-ending drift; host source vs committed revision.

## Scope and state observed

- Production `scripts/control-replay.mjs` does **not** exist in the lane yet (`ls scripts/control-replay.mjs` → No such file; L1 integrates at close). Reviewed the two in-flight candidates: `build/K70ExecRunner/scripts/control-replay.mjs` (candidate runner, 11193 bytes, mtime 12:43) and `build/K70ExecTransform/transform.mjs` + `TRANSFORM-SPEC.md` + `frozen-digests.json` (generator draft, 12:32). Both read as strict, fail-closed implementations of the pinning half of the contract.
- Frozen bytes unchanged and three-way equal: pin tables == committed@B == host working tree, for both controls (`c1-controls.sh` sha256 `01efd6dd…aeda12`, 3844 bytes; `c2-controls.sh` sha256 `679b7d96…a66f4`, 7030 bytes) and both probes (`ledger69-probe.mjs` `1f19d1e6…46de`, `deprec69-probe.mjs` `af021f87…e7e7` — the latter two also equal their `.ufo/pins/counter-pins.json` registry pins). `git status --porcelain .ufo/waves/round-69/probe/` → empty. Both originals are LF-only, no CRLF anywhere (`grep -c $'\r'` → 0; `file` → UTF-8, no CRLF), trailing newline present.
- Originals were **never executed**. My probes stop at the output-existence gate (exit 73) or the pin gate (exit 65); no private control body ran in this seat. Runner `--selftest` (hermetic: static transforms + `bash -n` only; ST05's tampered-lane sub refuses before execution) → `CONTROL_REPLAY_SELFTEST: PASS cases=9 ok=9`.
- Writes: only this report, `build/K70ReviewSourcePin/evidence/{pin-probes.txt,selftest-baseline.txt,host-vs-committed.txt}`. Scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewSourcePin/` created explicitly, evidence copied out, then `rm -rf`; `ls` after → "No such file or directory". No lane/fleet/fleet-root writes; no git/jj mutations; lane git used read-only (`rev-parse`, `show`, `status`, `log`).
- Tooling: **none installed or updated**. Used pre-existing `node v24.21.0`, `git 2.56.0`, `python3`, `sha256sum`, `grep`. No pacman (paused anyway per seat rules), no uv/npm, no service restarts. Channel record: none.

## Commands run and observed outcomes

1. Pin equality: `git -C <lane> show 78b98d:…c1-controls.sh | sha256sum` → `01efd6dd…` == `sha256sum` of host copy == runner `FROZEN.c1.sha256` and == `frozen-digests.json`. Same three-way match for c2 (`679b7d96…`) and both probes. Evidence: `build/K70ReviewSourcePin/evidence/host-vs-committed.txt`.
2. E1 — per-family probe: fake lane `clean1-drift2` (c1 byte-exact pin, c2 with one appended comment line → sha `f3b7e7d3…`): `node build/K70ExecRunner/scripts/control-replay.mjs --lane <fake> --family c1 --mode donothing --out <existing-file> --work <dir>` → `refusing to overwrite existing output`, **exit 73**. The c1 run authenticated c1 and proceeded to the output phase without ever hashing the drifted c2. Sibling-original authentication does not happen on a single-family run.
3. E2 — control: same fake lane, `--family c2` → `frozen-source-sha-mismatch: c2-controls.sh got=f3b7e7d3… want=679b7d96…`, **exit 65**. Own-family drift is refused with got/want hashes.
4. E3 — control: fake lane with c1 byte-flipped (`de8cc0f1…`), `--family c1` → `frozen-source-sha-mismatch: c1-controls.sh got=de8cc0f1… want=01efd6dd…`, **exit 65**. Byte-exact, not needle-count.
5. E4 — line-ending probe: fake lane with c1 rewritten CRLF (`12fc2005…`), `--family c1` → `frozen-source-sha-mismatch … got=12fc2005…`, **exit 65**. Line-ending drift is refused byte-exactly; no CRLF normalization exists anywhere in the candidate (needles are LF-joined, so count checks would also fail after a sha pass).
6. Baseline: `REPLAY70_LANE=<lane> TMPDIR=<scratch> node …/control-replay.mjs --selftest` → `CONTROL_REPLAY_SELFTEST: PASS cases=9 ok=9` (ST05 tamper-refused, ST06 transform-once, ST07 out-exclusive, ST08 five private copies pass `bash -n`, ST09 c2 static transform). Evidence: `selftest-baseline.txt`.
7. Static audit of all hash sites in the candidate (`grep -n sha256`): lines 39–40 (FROZEN pins), 114–115 (`loadFrozen`, single family), 286 (`findLaneRoot` selftest, c1 only). `loadFrozen` call sites: 233 (`runControl`), 340/360/374 (selftest) — every call passes exactly one family. No cross-family authentication exists.
8. Cross-check vs sibling attack seat: `build/K70AttackSourceDrift/needle-counterexample.out` — a naive first-match generator ACCEPTS mutants M1 (unquoted W), M2 (duplicate needle in comment), M3 (retargeted /tmp write), M4 (trailing space); the strict sha-pinned generator refuses all four. Both current drafts implement the strict form.

## Findings

### F1 — Runner authenticates only the selected family's original, not both, before execution (MODERATE, tool-level hardening)

The seat invariant — "authenticate both originals before any execution" — is not met by the K70ExecRunner candidate. `runControl` calls `loadFrozen(lane, family)` (line 233) which sha256-pins exactly the one script being replayed; the sibling original is never read on that invocation. E1 demonstrates a c1 run proceeding to the output phase (exit 73) against a lane whose c2 sibling is drifted. Impact analysis, honestly bounded:

- No false HELD: a drifted *executed* family refuses (exit 65, E2/E3), and in full predicate scoring (R3–R7) both families run, so drift in either file eventually bites one of the five runs. Committed-tree drift is caught independently by the frozen probe's R1 (`git show B:` comparison in the archived tree).
- Real residual: R1 compares the *archived committed* tree; the tool reads the *host working tree*. Host-only drift of the non-executed sibling is invisible to both R1 and a single-family run, so a one-off `--family c1` invocation in a sibling-drifted lane executes silently — the "tool registry, source pin and demonstrated capability row agree" census (R10) is then asserted only for committed bytes, not for host bytes at run time.
- Fix is cheap and in-scope for the contract's "Refuse unexpected frozen source bytes": in `runControl`, pin-check **both** `FROZEN` entries before building/executing either private copy (two small reads + two hashes), and add a selftest case asserting a sibling-drifted lane refuses on any family. The K70ExecTransform draft should apply the same rule at generate time (it currently writes c1's private copy before c2 is authenticated — harmless for a pure generator, but the same two-file preflight costs nothing).

### F2 — Frozen probe bytes are not pinned by the candidate (LOW)

The candidate pins only the two control scripts. The two frozen counters it execs (`ledger69-probe.mjs`, `deprec69-probe.mjs`) are referenced by path with no byte authentication; host drift of a probe would surface only as a CONTROL-FAIL receipt (exit 1), i.e. reported, not refused. Both probes already carry registry pins in `.ufo/pins/counter-pins.json` whose values match host bytes today (evidence file), so extending `loadFrozen` to pin the probe bytes too is trivial and closes the last unauthenticated input on the execution path.

### F3 — What is authenticated, is authenticated by full bytes, not needle counts (VERIFIED GOOD)

For the family that is checked, refusal is sha256 over the raw buffer plus exact-once needle substitution (`subOnce`/`cutOnce`, count ≠ 1 → exit 65) and static post-transform selftest checks (ST06/ST09). E2 (appended comment) and E3 (single-byte flip) both refuse with got/want hashes. This is the fail-closed posture the contract requires; the needle-counterexample seat's M1–M4 mutants show why needle-only substitution is insufficient and confirm both drafts chose the strict generator.

### F4 — Line-ending drift is refused byte-exactly (VERIFIED GOOD)

No `\r\n` normalization exists in either draft; needles are LF-joined. E4: CRLF-ified c1 (`12fc2005…`) → exit 65. Host and committed originals are LF-only today (`grep -c $'\r'` → 0 on both, and on the `git show` blobs via `file`). Any future CRLF introduction fails closed at the hash, not silently repaired.

### F5 — Host-vs-committed: three-way equality holds now; runtime anchor to the commit is absent (LOW, by design)

Pins == committed@B == host bytes for all four frozen files (command 1). The tool reads host files, so host drift from committed refuses — but the embedded table is itself the only source of truth; nothing at runtime checks the table against `git show B:`. Table fidelity is therefore a review/close-time property (L1 adds pins "without changing counter bytes"; the candidate's table matches the measured committed bytes exactly, so the property holds as shipped). Two narrower notes: (a) the `K70ExecTransform` draft's `R70_SRC_DIR` env override is acceptable for a build-dir draft but must not survive into production `scripts/control-replay.mjs` or the pin becomes advisory; (b) that draft's c2 line-80 removal uses a regex (safe only because it runs after the sha gate) while the runner's exact `cutOnce` needle is the stronger form — prefer the runner's.

## Residual risk and verification gaps

- Reviewed candidates, not the final production file: `scripts/control-replay.mjs` will be assembled by L1 at close. F1/F2 should be re-checked against the landed file; the selftest PASS and all probes above are reproducible against the candidate paths cited.
- No full replay execution in this seat (deliberate; E1–E4 stop before any control body runs). Predicate-level coverage of both families comes from the frozen probe R3–R7.
- If the seat invariant "both originals before any execution" is judged inapplicable to single-family runs (each private copy embeds only its own family's bytes), F1 downgrades to informational; the five-run predicate pass remains sound either way because each family run pins its own source.
- Live forgecapture arm (c2 network fetch) is out of this seat's scope; per plan, failure there is reported, never waived.
