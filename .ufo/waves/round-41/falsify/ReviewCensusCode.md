RESULT ReviewCensusCode rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=REVISE defects=20

# ReviewCensusCode: review of scripts/wave-census.mjs at 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3

Judged on operability. Milestone: r41 falsify at the measured revision.
Line numbers refer to scripts/wave-census.mjs at that revision (295 lines) unless marked "upstream",
which means the pinned producer scripts/ufo-swarm-wave.mjs (sha256 1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a),
read at /fast/scratch/hyaku/kumitate-pin/src and never written.

## Method

- Detached clone at the measured revision: /fast/scratch/hyaku/kumitate-r41/seats/ReviewCensusCode/lane (git status clean).
- Fixtures, a scratch copy of the producer scripts and all runs live under /fast/scratch/hyaku/kumitate-r41/seats/ReviewCensusCode/ (the pin and the lane were not written).
- Tools: node v24.21.0; jq 1.8.2 at /usr/bin/jq (the interactive shell aliases jq to jaq 3.1.1; the probe ran in a child shell and resolved jq 1.8.2).
- Installed or upgraded: nothing. Lane files written: none, apart from this report. Subagents spawned: none.

## What holds (verified)

- Exit 64 on every usage path: no arguments, --round without value, --round x, unknown flag, --help, --expect without =n, --expect with upper-case wave, trailing --root (8 fixtures, all 64).
- Exit 2 on the fail-closed paths: missing round dir, round dir without dispatch file, empty round dir, unparseable dispatch, dispatch file chmod 000, dispatch that is a directory, schema v2, JSON null/array/number, --root that is a file.
- Exit 0 and exit 1 on CLEAN and DRIFT as documented; the selftest passes 12/12 (exit 0).
- Read-only: sha256 over every file under .ufo in the clone is 77e2ff027bed8c4059f7545de26558fd7ed5cdb6790d80c1d3a717973cd3491b before and after the census runs for rounds 1 to 41; git status shows 0 lines; the census exits 0 on a chmod -R a-w copy of .ufo/waves (text and --json). The write functions (imports at line 41, spawnSync at 42) are used only inside selftest() (lines 166-277). Its temporary directory is removed in finally; none is left behind.
- The probe reproduces: RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0 (exit 0).
- Lane round results match the lesson: round 38 has four STRAY_REPORT findings; round 40 has attack=45 of seats=67; round 39 build reads reports=0/46; round 41 build reads reports=0/34.

## Findings (severity, line numbers, evidence)

### High

H1. A legitimate mixed wave (spawn lanes plus resume lanes) reads as DRIFT. Latent: no committed payload has counts.resume above 0.
- Lines 110-116 compare every registry member with the taskCall task names, so resume members (which are never taskCall tasks) are reported as drift. Lines 97-98 never read resumeSends or counts.resume.
- Evidence: the pinned producer, run from the scratch copy, with spec {wave:"r8-mixed", items:[Mix01 critic, Mix02 reviewer, one resume]} produced counts {spawn:2, resume:1, total:3}, taskCall tasks Mix01,Mix02, and registry.members Mix01 (spawn), Mix02 (spawn), SwarmResume03 (resume). Census: `WAVE round=8 wave=mixed ... seats=2`, `FINDING REGISTRY_MISMATCH round=8 wave=mixed not-in-registry=[] not-in-tasks=[SwarmResume03]`, `WAVE_CENSUS: DRIFT`, exit 1.
- Upstream: resume lanes are added to registry.members at 1102 and 1260. The S038 row cites only 51-56 and 1226.
- Direction: compare spawn-kind members with taskCall tasks and resume-kind members with resumeSends; reconcile counts.total with seats plus resumes.

H2. A resume-only wave makes the census of its whole round fail closed (exit 2). Latent: no committed v1 payload has taskCall null.
- Lines 96-97: taskCall null makes tc null, so every file in the round gets FailClosed "carries no task list".
- Upstream: a resume-only wave emits taskCall null with resumeSends (1307-1309). The comment at 51-52 says the same ("null when the wave resumes only").
- Evidence: round 7 holding the producer's spawn payload plus the producer's resume-only payload gives `wave-census: fail-closed — .../resume-dispatch.json carries no task list`, exit 2, with no census for the spawn wave. Control with the spawn payload alone: `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`, exit 0.
- Impact: one valid resume-only payload blanks the census of its round.
- Direction: treat taskCall null as zero spawn seats; read resumeSends for resume seats; keep exit 2 for payloads that are neither.

H3. CLEAN is reachable with an undispatched wave and with unreported seats (fail-open coverage).
- Line 85 discovers only *-dispatch.json. Nothing compares the <wave>-spec.json files with the payloads. Verdict at 143 and 292 counts findings only; an absent report is not a finding.
- Evidence A: round 36 has falsify-spec.json (keys axes, context, items, milestone, reportDir, wave; 81 items by jq) and no falsify-dispatch.json. `node scripts/wave-census.mjs --round 36` gives `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`, exit 0. The round-36 lesson (corpus/lessons/round-36-verifier-spotcheck.md, lines 32-34) says that wave was validated and never dispatched.
- Evidence B: round 39 build reads `reports=0/46` and round 41 build reads `reports=0/34`; both rounds exit 0 CLEAN.
- Evidence C: round 40 falsify reads `reports=26/35` with 9 absent and exits 0 CLEAN. SKILL.md line 690 makes `--round 40` exit 0 with `WAVE_CENSUS: CLEAN` a checklist pass.
- Direction: cross-check every wave spec against its payload and flag UNDISPATCHED; make CLEAN require reports equal to seats, or add a separate verdict (for example INCOMPLETE, exit 1) that the checklist cannot pass.

### Medium

M1. Uncaught exceptions exit 1. The lane verdict map (SKILL.md lines 593-594) reserves exit 1 for "failed" and sends 2 and 64 to "could not evaluate". Tool faults therefore report as defects.
- Lines: 85 (round-dir readdir), 98 (null task entry), 123 (report-dir readdir), 289 (non-FailClosed errors rethrown), 295 (the exception escapes).
- Evidence: bare payload {"context":"c","tasks":[null]} gives `TypeError: Cannot read properties of null (reading 'name')` at wave-census.mjs:98:57, exit 1. Report dir that is a regular file gives `ENOTDIR: not a directory, scandir` at wave-census.mjs:123:23, exit 1. Report dir chmod 000 gives `EACCES scandir`, exit 1. Round dir chmod 000 gives `EACCES scandir`, exit 1. An unreadable dispatch file, by contrast, exits 2 (lines 92-94). Same class of fault, two exit codes.
- Direction: turn every I/O and shape failure into FailClosed (exit 2); reserve exit 1 for findings.

M2. A v1 envelope with no counts or no registry passes CLEAN.
- Lines 106-110: both checks are guarded (`d.counts &&`, `d.registry && d.registry.members ?`), so an absent field skips the check silently.
- Evidence: v1 without counts gives `WAVE_CENSUS: CLEAN`, exit 0; v1 without registry gives CLEAN, exit 0. The producer always emits both (upstream 1226, 1253-1262, 1296-1298).

M3. A seat without agent or name is accepted and invented values are counted.
- Line 98: String(t.name) and String(t.agent) turn missing fields into "undefined".
- Evidence: bare task with name A and a report but no agent gives `roles: undefined=1`, CLEAN, exit 0. A task with no name and no Report trailer gives `absent: undefined`, CLEAN, exit 0.

M4. Report presence means "the path exists", and paths are not confined to --root.
- Lines 51 (regex lets ".." through), 103 (existsSync), 121-123 (STRAY scan of each report directory).
- Evidence: zero-byte report counts present (`reports=1/1`, exit 0). A directory named A.md counts present (`reports=1/1`, exit 0). A Report path with ".." above --root reads a file outside the lane (`reports=1/1`, exit 0). STRAY scan of an outside directory: `FINDING STRAY_REPORT round=7 wave=build .ufo/waves/../../../y.md`, exit 1.

M5. Report paths outside .ufo/waves are silently counted absent.
- Line 51 requires the .ufo/waves/ prefix.
- Evidence: the producer run with reportDir .ufo/scopes/r9 (two reviewer seats), with both report files present at .ufo/scopes/r9/Scope01.md and Scope02.md. Census: `WAVE round=9 wave=scope ... reports=0/2`, `absent: Scope01 Scope02`, `WAVE_CENSUS: CLEAN`, exit 0.

M6. --expect passes silently when one requested round lacks the wave. Docstring line 32 says otherwise.
- Lines 136-137 raise EXPECT_UNKNOWN only when no requested round holds the wave.
- Evidence: `--round 7 --round 8 --expect build:mutation-tester=1` (build exists only in round 7) gives `WAVE_CENSUS: CLEAN (rounds=2 waves=2 findings=0)`, exit 0. Control with `--round 8` alone gives `FINDING EXPECT_UNKNOWN round=- wave=build`, exit 1.

M7. The selftest cannot see any defect in this report. Its 12 checks pass while the defects reproduce.
- Lines 200-267 (WC01-WC12) cover clean fixtures and the documented findings only. The fixture writers task() and mkRound() (lines 174-184) always emit agent, name, counts, registry, a Report trailer and a taskCall, so the crash, missing-field, resume and presence classes never appear.
- Evidence: `node scripts/wave-census.mjs --selftest` gives `WAVE_CENSUS_SELFTEST: 12/12 pass`, `VERDICT: PASS`, exit 0.

D1. WHAT IT CANNOT SAY (docstring lines 18-25): partly accurate, partly wider than the evidence, and it omits the largest limits.
- Accurate: lines 19-23 (round 39 build of 46 and falsify of 37 never ran: .ufo/waves/round-39/evidence/seat-gate.txt lines 3-6, corpus/lessons/round-39.md line 124; residual seats wrote into falsify/: falsify reads reports=8/37 and residual reads reports=8/8 with the same names). Lines 21-22 (reasons an absent report cannot show, and the safety-filter limit). Lines 24-25 (--expect).
- Overclaim, line 18: "A payload file proves validation, not dispatch." The census checks none of the producer's validation: v1 envelopes without counts or registry pass (M2), and the bare residual payload has no schema at all. The same sentence is copied into the registry row (SKILL.md line 607) and the capability row (SCORECARD.md line 1679, "per validated wave").
- Omitted: (a) a wave with no committed payload is invisible (H3); (b) CLEAN does not mean every seat reported (H3); (c) resume lanes are not read, so resume-only waves fail closed and mixed waves read as drift (H1, H2); (d) presence means "exists" (M4, M5); (e) uncaught errors exit 1 (M1); (f) ".." paths read outside --root (M4).

### Low

D3. Docstring lines 33-34 list three exit-2 triggers. The code also exits 2 on "carries no task list" (line 97). Fixtures K05, K06, K24-K27 all take this path.

D4. Docstring lines 9-10 say the envelope's registry is "the merged ufo-swarm-registry-v1". The envelope carries only this wave's members (upstream 1253-1262 build members from memberEntries; 1297-1298 pass plan.registry through). The merged map is written only to registry.path (upstream 1477-1511). The census's REGISTRY check is right about the envelope; the docstring is wrong.

L1. Line 85: the match on -dispatch.json is case-sensitive. Evidence: build-dispatch.JSON plus a valid falsify-dispatch.json gives `ROUND round=7 waves=1`, CLEAN, exit 0. The build seats vanish without a note.

L2. Line 65: a duplicate --round 7 is accepted. Evidence: `WAVE_CENSUS: CLEAN (rounds=2 waves=2 findings=0)`, exit 0, with the same wave listed twice.

L3. Lines 98 and 103: duplicate seat names in a bare payload are counted twice without a finding. Evidence: `seats=2 reports=2/2`, exit 0.

L4. Lines 139-140 with the grammar at line 69: --expect build:mutationtester=0 (typo for mutation-tester) passes with exit 0 because the role vocabulary is never checked. The correct name gives EXPECT_MISMATCH and exit 1.

L5. Lines 50 and 101: attack-role matching is case-sensitive. An agent named Reviewer gives `roles: Reviewer=1 ... attack=0`, CLEAN, exit 0.

L6. Lines 69-70: a wave with upper-case letters is read (file Build-dispatch.json gives wave=Build) but --expect Build:executor=1 exits 64 with "takes <wave>:<role>=<n>", which does not say why.

L7. Line 93: EACCES and EISDIR are reported as "does not parse" (for example "does not parse: EACCES: permission denied"). Line 84: --root pointing at a regular file reports "round dir ... is missing".

Count: High 3 (H1-H3), Medium 8 (M1-M7, D1), Low 9 (D3, D4, L1-L7). Total 20. Nit, not counted: docstring line 24 is longer than its neighbours.

## Fixture results (exact exit codes; commands were node scripts/wave-census.mjs --root <fixture> --round N, plus the listed flags)

| fixture | input | exit | key output |
|---|---|---|---|
| K01 | clean control | 0 | CLEAN, reports 2/2 |
| K02 | round dir missing | 2 | round dir ... is missing |
| K03 | round dir, no dispatch | 2 | holds no *-dispatch.json |
| K04 | dispatch unparseable | 2 | does not parse |
| K05 | v1 without taskCall | 2 | carries no task list |
| K06 | v1 resume-only shape (taskCall null) | 2 | carries no task list |
| K07 | bare tasks [null] | 1 | TypeError at wave-census.mjs:98:57 |
| K08 | task without agent | 0 | roles undefined=1, CLEAN |
| K09 | task without name or trailer | 0 | absent: undefined, CLEAN |
| K10a | v1 without counts | 0 | CLEAN |
| K10b | v1 without registry | 0 | CLEAN |
| K11 | v1 with zero tasks | 0 | seats=0, CLEAN |
| K12 | dispatch name is a directory | 2 | does not parse: EISDIR |
| K13 | report dir is a regular file | 1 | ENOTDIR scandir, wave-census.mjs:123:23 |
| K14 | report dir chmod 000 | 1 | EACCES scandir |
| K15 | Report path with ".." above --root | 0 | reports=1/1 (file outside lane) |
| K16 | zero-byte report | 0 | reports=1/1 |
| K17 | report path is a directory | 0 | reports=1/1 |
| K18 | two rounds, --expect wave absent from round 8 | 0 | CLEAN rounds=2 |
| K18b | one round, same expect | 1 | EXPECT_UNKNOWN |
| K19 | --round 7 twice | 0 | rounds=2 waves=2 |
| K20a | --expect with typo role =0 | 0 | CLEAN |
| K20b | --expect correct role =0 | 1 | EXPECT_MISMATCH payload=1 |
| K21 | build-dispatch.JSON plus falsify | 0 | waves=1 (build dropped silently) |
| K22 | bare duplicate seat names | 0 | seats=2 reports=2/2 |
| K24 | schema v2 | 2 | carries no task list |
| K25-K27 | JSON null, array, number | 2 | carries no task list |
| K28 | --root is a regular file | 2 | round dir ... is missing |
| K29a-h | usage variants | 64 | usage text |
| K30a | Build-dispatch.json | 0 | wave=Build |
| K30b | --expect Build:executor=1 | 64 | usage text |
| K31 | non-empty payload, no trailers | 0 | reports=0/1, CLEAN |
| K32 | empty round dir | 2 | holds no *-dispatch.json |
| K33 | round dir chmod 000 | 1 | EACCES scandir (line 85) |
| K34 | dispatch file chmod 000 | 2 | does not parse: EACCES |
| REAL-7 | producer spawn plus resume-only | 2 | carries no task list |
| REAL-7c | producer spawn only (control) | 0 | CLEAN seats=3 |
| REAL-8 | producer mixed spawn plus resume | 1 | REGISTRY_MISMATCH not-in-tasks=[SwarmResume03] seats=2 |
| SCOPE-9 | producer reportDir .ufo/scopes/r9, files present | 0 | reports=0/2 |
| STRAY-OUT | Report ".." to outside file | 1 | STRAY_REPORT .ufo/waves/../../../y.md |
| CASE | agent Reviewer | 0 | attack=0 |

Committed rounds (the lane's own payloads, run with node scripts/wave-census.mjs --round N):

| round | exit | key output |
|---|---|---|
| 35 | 1 | two STRAY_REPORT in build (ExecS8Fidelity.md, ExecS8Fix.md); not triaged here |
| 36 | 0 | CLEAN; build 96/96; falsify-spec with no payload (H3) |
| 37 | 0 | CLEAN; falsify 68/68 |
| 38 | 1 | four STRAY_REPORT (Check21/49/52/71-supplement.md); build 89/90; falsify 45/88 |
| 39 | 0 | CLEAN; build 0/46; falsify 8/37; residual 8/8 (bare payload) |
| 40 | 0 | CLEAN; build 31/32; falsify 26/35; attack 45 of 67 |
| 41 | 0 | CLEAN; build 0/34 |

Committed payloads checked with jq: no v1 payload has taskCall null or counts.resume above 0 (the residual payload is bare, with no schema).

## Residual risk and verification gaps

- The producer ran from a scratch copy with a config I wrote (ufo.json in the scratch producer root). The host config was not read, so policy defaults may differ.
- H1 and H2 do not change any current committed result (no committed round uses resume lanes). They matter for the first round that does.
- Not run: mutation testing of the census (not asked); EPIPE when stdout closes early; census rounds 1 to 34.
- For K14 and K33 I took the exit codes and error codes but not the full stack; K13 gave the line-level stack.
- Round 35 reads DRIFT (two STRAY files). That round is outside this review and was not triaged.

## Suggested shape of fixes (not applied; reviewer does not edit)

- Read resumeSends and counts.resume; compare members by kind (H1, H2).
- Cross-check specs against payloads; add UNDISPATCHED; make CLEAN depend on reports equal to seats, or add a separate verdict (H3).
- Map every non-FailClosed error to exit 2 and keep exit 1 for findings only (M1).
- Require counts, registry members, name and agent for v1 and for each task; fail closed otherwise (M2, M3).
- Use isFile and size checks; confine resolved report paths to the root; take report locations from each payload (M4, M5).
- Raise EXPECT_UNKNOWN per requested round (M6).
- Add selftest fixtures from real producer output (spawn, resume-only, mixed) and malformed fields (M7).
- Rewrite the WHAT IT CANNOT SAY paragraph and the lines it contradicts (D1, D3, D4).
