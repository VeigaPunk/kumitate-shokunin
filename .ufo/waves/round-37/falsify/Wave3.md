WAVE3 items=68 dup=3 registry=yes verdict=refuted

Scope: round-37 falsify wave record (spec, dispatch, registry, validator, base/pin, Report trailers, seat accounting). Lane /home/vgpnk/Projects/shokunin/kumitate-shokunin. Writes: this file and scratch config /fast/scratch/kumitate-r37/Wave3/root/config/ufo.json. Validator run with `plan` only (no `run`, no `record`). Installs: none.

## 1. Duplicated prompt: TRIGGERED
Rule: dup = redundant copies of a body identical after removing the item header, record label and output token. Four items on one body give dup=3.
- difflib, Wave1 vs Wave3 spec prompts: 3 `replace` ops, each `'1'`->`'3'` (header `# Item Wave1`, `record 1`, output `WAVE1`). Wave1 vs Wave2: same shape.
- Digit-normalized grouping of all 68 prompts: families of 8 (AuditRemainder, AuditSighting, AuditRouteProbe, AuditNativeTrial, Truth) differ only by `group k/8` or `slice k/8`, which are intentional partitions and not counted. The family of 4 (Wave) has no partition. Pair4/Pair5 match only after digit normalization (`14->15` vs `14->13`): distinct mutants, not counted.
- The validator misses it: `scripts/ufo-swarm-wave.mjs:987-994` rejects only exact expanded-text duplicates. `plan` under a 64-100 band returns rc 0 with all four Wave lanes present.

## 2. Accounting claim unsupported: TRIGGERED
falsify-dispatch.json `policy` = `{source:"config", waveMinLanes:64, waveMaxLanes:100}`.
- Fleet `config/`: the only file setting waveMinLanes/waveMaxLanes is `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json:89-90` = 16 / 32, under `sighting.dispatch.swarm`.
- `node scripts/ufo-swarm-wave.mjs plan --spec .ufo/waves/round-37/falsify-spec.json` with the default config: rc 1, `{"code":"wave_too_wide","message":"a wave carries at most 32 lanes (got 68); split it into sequential waves of 16-32"}`.
- Scratch copy of config/ufo.json with only `sighting.dispatch.swarm.waveMinLanes=64` and `waveMaxLanes=100` changed, `UFO_PROJECT_ROOT=/fast/scratch/kumitate-r37/Wave3/root`: rc 0. plan.policy == dispatch.policy; counts 68/0/68 == dispatch; plan context == dispatch context (sha256 e4adfb78b727b317); `--emit-tasks` texts equal dispatch `taskCall.tasks[].task` for all 68 (0 diffs).
- Result: the dispatch is internally consistent with a 64-100 band, but no artifact records which config set it. `source: "config"` names config/ufo.json, which says 16/32. `round-36/accounting.md:3` says "policy v2, band 64-100" with no config provenance either.
- Fix: record config path and sha256 (or the operator directive) in dispatch and accounting, or validate against the repo config.

## Checks that hold
- Identity: 68 spec items, 68 unique names, 68 dispatch tasks, 68 registry members. Name sets equal across all four; order equal.
- Roles: reviewer 40, mutation-tester 8, critic 8, scout 8, sentinel 4. All in SWARM_ROLES (validator:248). No planner, distiller, labrat or Main. dispatch `agent` == spec role 68/68; registry role == spec role 68/68.
- Headers and outputs: `# Item <name>` matches its item 68/68; output lines unique 68/68.
- Godspeed lead: 68/68 spec prompts and 68/68 composed tasks start with `/skill:godspeed`.
- Report trailer: 68/68 composed tasks end `Report: write your scoped findings to .ufo/waves/round-37/falsify/<name>.md`. Path matches own name, lane-relative as context requires, reportDir matches registry. No spec prompt carries a competing write instruction.
- Base/pin: 91da27c6 resolves to 91da27c6ac17712aa53ea0adb27d89b133d60081. 0614092 resolves and `merge-base --is-ancestor 0614092 91da27c6` succeeds. `/fast/scratch/kumitate-r36/src` HEAD = 31c465f15669f744848bd9f5d56191c5085670f7 = pin; mode `dr-xr-xr-x`. Base/pin tokens occur only in the shared context (2 hits = spec + dispatch), never per item. `kumitate-r37/src`: 0 hits.
- Registry: falsify/swarm-registry.json, schema ufo-swarm-registry-v1, wave kumitate-r37-falsify, reportDir matches; 68 members; agentId = KumitateR36.<name> 68/68; kind spawn 68/68; milestone matches. No agentId collides with the 96 round-36 build-registry ids.
- Filed reports at check time (Pair1-8, Rep3, Verify2, Verify3, Verify8): first lines match their spec output formats.
- Round cap: 68 <= 200 (`round-36/accounting.md:5`).

## Defects below failing threshold
- Registry item linkage: `item` null 68/68 in dispatch and file registry. Spec items carry no `item` key and the validator accepts that (`ufo-swarm-wave.mjs:939-949`). The swarm skill says the registry records item, so resumes cannot name their item. Fix: add item labels or document name-only linkage.
- Seat accounting not frozen: no `.ufo/waves/round-37/accounting.md` (round 36 has one, "frozen at dispatch prep"). `.ufo/reports/round-37/` does not exist, so the report's seat accounting cannot be audited yet. Figures it must carry: 68 spawn / 0 resume / 68 total, the role mix above, and band provenance per item 2.
- Round-36 falsify registry missing: `round-36/accounting.md:4` claims "Falsify wave: 81 seats ... validated on falsify-spec.json". `round-36/falsify/` is empty. The only round-36 JSON with a members map is build/swarm-registry.json (96). Any round-37 report citing 81 falsify seats has no registry or dispatch artifact in the lane tree.
- Pair1-8 mutant location: each prompt says "...in /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs with mutant N". That is a lane production file. The context forbids production writes and allows only /fast/scratch/kumitate-r37/<YourName>/, and no Pair item names a scratch copy. The instruction is ambiguous, and an in-place edit would break the contract. Fix: "copy to /fast/scratch/kumitate-r37/<name>/ and mutate the copy".
- Task-shape risk (not an artifact defect): the swarm skill says each taskCall.tasks entry is exactly {name, agent, task}, which the dispatch matches. This session's task schema requires `solutionSpace` per task. The parent must confirm which schema is live before issuing the batch.
- Nit: Audit items say "take the 1th eighth", "2th eighth", "3th eighth".

## Not verified
- A single batched task call: no spawn transcript. Registry createdAt 06:20:41Z to updatedAt 06:21:01Z fits one run plus one record.
- Per-group anchor counts in the Audit partitions (needs an anchor parser). Removed lines from `git diff --numstat 0614092`: native-trial 9, sighting-wall 10, route-probe 26, remaining-census 46. An 8-way split has no structurally empty group if each removed line carries one anchor.
