# K80MutC1 — C1 mutation probe

Axes: operability + coverage:omp (orchestration/tooling). Scope: C1 only; frozen counter unchanged. No integration or contract changes.

## Method and control

Node v24.21.0. Shared clone checked out at `6d03402fddf44cc9797ec590f0f888e933db4677`. Fourteen isolated single-site literal replacements were prepared from identical pristine script bytes; each was then installed **one at a time into the same scratch clone**, measured, and restored in `finally`. The identical full detector was rerun after every restoration. No mutant probe was run concurrently. Each invocation had explicit scratch TMPDIR and --work.

Command (each phase): `TMPDIR=<seat scratch>/tmp/<phase> node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-80/probe/probe80-c1.mjs --tool <seat scratch>/clone --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work <seat scratch>/tmp/<phase>/work`. Child detector timeout: 240 seconds. Each mutant uses exactly one replacement site; m10 replaces the retire function body.

Initial pristine control: `C80_C1: HELD held=13/13`, process exit 0 (supervised control receipt). All fourteen restored controls: m01=13/13/exit0, m02=13/13/exit0, m03=13/13/exit0, m04=13/13/exit0, m05=13/13/exit0, m06=13/13/exit0, m07=13/13/exit0, m08=13/13/exit0, m09=13/13/exit0, m10=13/13/exit0, m11=13/13/exit0, m12=13/13/exit0, m13=13/13/exit0, m14=13/13/exit0.

Arm 13 reads the live lane, not the clone corpus: initial live lane HEAD was `509afb1d`; live working tree contained user changes. The live adopt-journal was observed empty before probing. Control read `SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` and `MAP: CLEAN`. Do not substitute the plan's predicted count 47 for that observed 46. Probe selftest control was PASS (28/28).

## Results

10 killed; 4 survived; 0 inconclusive. A kill requires a passing pristine/restored baseline and a named mutant-related arm failure.

| Mutant | Held | Exit | Failing arms | Verdict |
|---|---|---|---|---|
| m01 | 7/13 | 1 | 01 coverage-clean; 02 coverage-uncovered; 03 map-only-drift-green-coverage; 04 map-orphan-row-green-coverage; 05 both-drift; 12 selftest | KILLED |
| m02 | 10/13 | 1 | 02 coverage-uncovered; 05 both-drift; 12 selftest | KILLED |
| m03 | 10/13 | 1 | 03 map-only-drift-green-coverage; 04 map-orphan-row-green-coverage; 12 selftest | KILLED |
| m04 | 13/13 | 0 | none | SURVIVED |
| m05 | 13/13 | 0 | none | SURVIVED |
| m06 | 13/13 | 0 | none | SURVIVED |
| m07 | 10/13 | 1 | 03 map-only-drift-green-coverage; 04 map-orphan-row-green-coverage; 12 selftest | KILLED |
| m08 | 12/13 | 1 | 09 adopt-duplicate-refused | KILLED |
| m09 | 10/13 | 1 | 08 adopt-on-red-map; 10 adopt-idempotent; 12 selftest | KILLED |
| m10 | 11/13 | 1 | 10 adopt-idempotent; 12 selftest | KILLED |
| m11 | 11/13 | 1 | 08 adopt-on-red-map; 12 selftest | KILLED |
| m12 | 13/13 | 0 | none | SURVIVED |
| m13 | 12/13 | 1 | 12 selftest | KILLED |
| m14 | 11/13 | 1 | 10 adopt-idempotent; 12 selftest | KILLED |

## Manifest and expected detectors

### m01: omit separate map reading

Literal replacement: `lines: [coverage, map] → lines: [coverage]`. Expected: arms 01–05 and selftest detect missing MAP line. Observed: **KILLED**, held=7/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 01 coverage-clean: FAIL exit=0 out="SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0"
C80_C1 arm 02 coverage-uncovered: FAIL exit=1 out="SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=corpus/lessons/round-75-verifier-spotcheck.md"
C80_C1 arm 03 map-only-drift-green-coverage: FAIL exit=0 out="SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0"
C80_C1 arm 04 map-orphan-row-green-coverage: FAIL exit=0 out="SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0"
C80_C1 arm 05 both-drift: FAIL exit=1 out="SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=corpus/lessons/round-75-verifier-spotcheck.md"
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (23/28)","VERDICT: FAIL"]
```

### m02: always print coverage CLEAN

Literal replacement: `const coverage = uncovered.length === 0 → const coverage = true`. Expected: arms 02/05 reject false CLEAN. Observed: **KILLED**, held=10/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 02 coverage-uncovered: FAIL exit=1 out="SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: DRIFT first=uncovered:lessons/round-75-verifier-spotcheck.md"
C80_C1 arm 05 both-drift: FAIL exit=1 out="SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: DRIFT first=orphan-row:knowledge/ghost.md"
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (25/28)","VERDICT: FAIL"]
```

### m03: conflate map cleanliness with coverage verdict

Literal replacement: `const coverage = uncovered.length === 0 → const coverage = result.clean`. Expected: arms 03/04 reject false coverage DRIFT. Observed: **KILLED**, held=10/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 03 map-only-drift-green-coverage: FAIL exit=0 out="SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=0 first=undefined\nMAP: DRIFT first=uncovered:knowledge/late.md"
C80_C1 arm 04 map-orphan-row-green-coverage: FAIL exit=0 out="SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=0 first=undefined\nMAP: DRIFT first=orphan-row:knowledge/ghost.md"
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (26/28)","VERDICT: FAIL"]
```

### m04: skip post-write target resolution validation

Literal replacement: `!after.valid || target.row || target.pin || !sameOther → !after.valid || !sameOther`. Expected: potential survivor: no post-write unresolved-target oracle fixture. Observed: **SURVIVED**, held=13/13, exit=0.

Coverage finding, not permission to weaken the contract. Existing arm(s) do not exercise this negative branch. Proposed arm (not applied): Add a stateful fixture readme-map oracle: before adoption report target uncovered+unpinned; after writes report the same target findings. Require REFUSED_ORACLE exit 2, exact README/pin rollback, no successful ADOPTED output. Run pristine/mutant against identical oracle responses.

Actual failing-arm output (none):

```text
C80_C1: HELD held=13/13
```

### m05: skip collateral-finding preservation validation

Literal replacement: `!after.valid || target.row || target.pin || !sameOther → !after.valid || target.row || target.pin`. Expected: potential survivor: unrelated finding normally persists without exercising refusal. Observed: **SURVIVED**, held=13/13, exit=0.

Coverage finding, not permission to weaken the contract. Existing arm(s) do not exercise this negative branch. Proposed arm (not applied): Add a stateful fixture oracle: pre-write report target missing plus unrelated finding X; post-write report target resolved but X replaced by Y. Require REFUSED_ORACLE exit 2 and exact restoration of both destinations. This exercises sameOther rejection rather than merely displaying surviving drift.

Actual failing-arm output (none):

```text
C80_C1: HELD held=13/13
```

### m06: collapse both collateral-finding sets to empty

Literal replacement: `return [...new Set(result.findings.filter((f) => !f.includes(key)))].sort(); → return [];`. Expected: same coverage gap as m05. Observed: **SURVIVED**, held=13/13, exit=0.

Coverage finding, not permission to weaken the contract. Existing arm(s) do not exercise this negative branch. Proposed arm (not applied): Use the proposed m05 changed-collateral oracle arm; it must reject changed unrelated findings even when both sets are nonempty.

Actual failing-arm output (none):

```text
C80_C1: HELD held=13/13
```

### m07: map drift always identifies first=oracle

Literal replacement: `const first = /^README_MAP: DRIFT .*?first=([^\r\n ]+)/m.exec(text)?.[1] ?? null; → const first = null;`. Expected: arms 03/04 reject missing concrete first finding. Observed: **KILLED**, held=10/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 03 map-only-drift-green-coverage: FAIL exit=0 out="SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: DRIFT first=oracle"
C80_C1 arm 04 map-orphan-row-green-coverage: FAIL exit=0 out="SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: DRIFT first=oracle"
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (24/28)","VERDICT: FAIL"]
```

### m08: allow duplicate-row adoption

Literal replacement: `/^(format-unmapped|duplicate-row):/ → /^(format-unmapped):/`. Expected: arm 09 requires refusal and unchanged bytes. Observed: **KILLED**, held=12/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 09 adopt-duplicate-refused: FAIL exit=0 out="SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-75-verifier-spotcheck.md wrote=pin\nREADME_MAP: DRIFT files=2 rows=3 covered=2 bad=1 first=duplicate-row:lessons/round-75-verifier-spotcheck.md" unchanged=true
```

### m09: omit pin-half write

Literal replacement: `if (m.pin) writes.push([pin, appendPin(originals.get(pin).toString('utf8'), key)]); → comment`. Expected: arm 08 and selftest reject incomplete adoption. Observed: **KILLED**, held=10/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 08 adopt-on-red-map: FAIL exit=2 out="REFUSED_ORACLE"
C80_C1 arm 10 adopt-idempotent: FAIL first adopt failed
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (17/28)","VERDICT: FAIL"]
```

### m10: never retire a journal

Literal replacement: `retire(dir) body → void dir;`. Expected: arm 10 and selftest reject leftover recovery output/journal. Observed: **KILLED**, held=11/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 10 adopt-idempotent: FAIL exit=0 out="RECOVERED corpus/lessons/round-75-verifier-spotcheck.md complete\nSPOTCHECK_ADOPT: ALREADY_ADOPTED corpus/lessons/round-75-verifier-spotcheck.md" unchanged=true
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (19/28)","VERDICT: FAIL"]
```

### m11: ignore missing README rows

Literal replacement: `row: result.findings.includes(`uncovered:${key}`) → row: false`. Expected: arm 08 and selftest reject incomplete adoption. Observed: **KILLED**, held=11/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 08 adopt-on-red-map: FAIL exit=0 out="SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-75-verifier-spotcheck.md wrote=pin\nREADME_MAP: note uncovered:lessons/round-75-verifier-spotcheck.md\nREADME_MAP: note unpinned:knowledge/late.md\nREADME_MAP: DRIFT files=3 rows=1 covered=2 bad=3 first=uncovered:knowledge/late.md"
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (19/28)","VERDICT: FAIL"]
```

### m12: name last uncovered spotcheck as first

Literal replacement: `first=${uncovered[0]} → first=${uncovered.at(-1)}`. Expected: potential survivor: fixture arms each contain only one spotcheck. Observed: **SURVIVED**, held=13/13, exit=0.

Coverage finding, not permission to weaken the contract. Existing arm(s) do not exercise this negative branch. Proposed arm (not applied): Add two missing spotchecks named round-74-verifier-spotcheck.md and round-75-verifier-spotcheck.md. Require exit 1, spotchecks=2 uncovered=2, first=corpus/lessons/round-74-verifier-spotcheck.md. Both first and last currently coincide in every uncovered fixture.

Actual failing-arm output (none):

```text
C80_C1: HELD held=13/13
```

### m13: adopt without publishing pre-image journal

Literal replacement: `journal = stageJournal(lane, path, key, originals); → comment`. Expected: selftest crash cases detect absent staged journal. Observed: **KILLED**, held=12/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (25/28)","VERDICT: FAIL"]
```

### m14: disable ALREADY_ADOPTED short circuit

Literal replacement: `if (!m.row && !m.pin) → if (false && !m.row && !m.pin)`. Expected: arm 10 rejects repeated ADOPTED output. Observed: **KILLED**, held=11/13, exit=1.

Actual failing-arm output:

```text
C80_C1 arm 10 adopt-idempotent: FAIL exit=0 out="SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-75-verifier-spotcheck.md wrote=pin\nREADME_MAP: CLEAN files=2 rows=2 covered=2" unchanged=true
C80_C1 arm 12 selftest: FAIL exit=1 tail=["SPOTCHECK_ADOPT_SELFTEST: FAIL (27/28)","VERDICT: FAIL"]
```

## Restoration hashes

Hash algorithm: SHA-256. Pristine script: `0d9c56dc6d4751e3ea9e0d0eb2ec24c27633637770aecb926f032e53d505bcec`. Final restored clone script: `0d9c56dc6d4751e3ea9e0d0eb2ec24c27633637770aecb926f032e53d505bcec` (exact byte identity). Before and restored-after hashes below were measured for every mutant; full JSON receipt preserves them separately.

| Mutant | Mutated SHA-256 | Before / restored after |
|---|---|---|
| m01 | `9fb8c8fbe0af88dc9d5597a702deee2ffa0921efb4023b7138af17e73e7bd585` | both equal pristine |
| m02 | `8dd550d5b865670680711f519f84b24d82e2589146ea5fbdd4ff609b561d7fa2` | both equal pristine |
| m03 | `2536697a8c13d1d7e9f6dd0d6bb58a90c3a80a6ad32195abcbac4ffdbf6766e5` | both equal pristine |
| m04 | `89e4211c2b60ee3df9c9cd29683873fd713ff8e0799f199af29ee82da0557dab` | both equal pristine |
| m05 | `9aa84c06f56a7a106682bb739a1ac5fa6ca33fab94e5f5c8e7ee40930cf16efb` | both equal pristine |
| m06 | `267f18f5c4ef43f859eb01f6fd88d897fbd19f86fa0d2ff11340be49a3b252a8` | both equal pristine |
| m07 | `9836f61ba38278a1830212ff1059b8eeb4aeefca5d0cd8076239b3eed9cb240a` | both equal pristine |
| m08 | `74c54c7eea8a0048184c42e6f0702b395dbdd89bd563a1d33c7959778e54e671` | both equal pristine |
| m09 | `29d8690d78fcbcd1791b8b7642b2b3777dc2952e6b7161bbf1394f5c79ec450e` | both equal pristine |
| m10 | `64fce176337851799fbbe199b30593feee3f19d2b6b92ec8f44ecb0656292cc4` | both equal pristine |
| m11 | `2423456c75df04a6ab083c822dd56562f7cf68b3a50888f45b6735303eea232b` | both equal pristine |
| m12 | `c51d81fd205cce3c7d054f85bd315f2ee939dd2919be19342d59a5db20469152` | both equal pristine |
| m13 | `3a8ae96cc9918c159cee616ce5002de49435aaab05eb219576d9428b40280e08` | both equal pristine |
| m14 | `574cc25078738a62a9de7429808268d7b719dd766011fd99ac716cb0079f0b79` | both equal pristine |

## Evidence and limits

Raw byte receipts: `K80MutC1/control.log`, `K80MutC1/m01.log` through `m14.log`, `K80MutC1/m01-restored.log` through `m14-restored.log`; machine-readable manifest and before/mutated/after hashes are `K80MutC1/manifest.json` and `K80MutC1/results.json`. All paths are relative to this report's directory. Restored runs are behavioral restoration evidence, not merely hash checks. No counter, production source, or proposed arm was edited. No tools installed or updated. Scratch is deleted after receipts are copied.

The same frozen arm-12 selftest is part of the detector, so a selftest-only kill counts as an observed detector kill, not independent external coverage of each internal check. The corrupt journal fixture in frozen arm 11 checks refusal and unchanged destinations, **not retirement**; its manifest has invalid `deadbeef` hashes. Current selftest intentionally retains a corrupt-pre-image journal for inspection. Do not claim arm 11 proves journal retirement.

Self-evaluation (1–5): accuracy 4 (live arm remains host-dependent); completeness 4 (all fourteen probes and restores exercised, proposed killing arms intentionally unrun); clarity 4 (full output is lengthy but linked); actionability 4 (concrete stateful-oracle proposals require implementation); conciseness 3 (long manifest necessary for reproducible literals). Overall 3.8. Improvements: prioritize target-resolution and collateral-change negative arms, then add the two-uncovered ordering arm.
