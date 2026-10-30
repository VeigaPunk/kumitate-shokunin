# K70ReviewCounterR7 — round 70, C1 replay isolation (operability)

Seat: K70ReviewCounterR7 (leaf reviewer). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Base B = 78b98d762ccf3e3a0961f94c4042eaabd2bcb706. Frozen plan: 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a. Scope: **c2 forgecapture live fetch origin-sha mismatch and output receipt only.** Judged on operability; milestone ReviewCounterR7.

## Verdict

The c2 forgecapture live digest arm is **operable today** and the R7 output-receipt contract is **satisfiable end-to-end**. I reproduced the arm twice in private scratch (my own transformed copy, then the K70ExecRunner candidate): both runs produced a receipt whose header is byte-identical (modulo fixture rev) to the committed r69 `c2-forgecapture.txt`, including `S210:origin-sha-mismatch`, and the candidate's receipt carries every token R7 requires (`DEPREC69_UNMET`, trailer `live=exercised`, `CONTROL-PASS forgecapture`) with exit 0, reclaimed work dir, and untouched frozen lane receipts. One bounded latent risk in the frozen r69 counter (M11 detail truncation) is disclosed below; it is not exercisable now and is not r70-repairable. One process note: the candidate file was mid-edit during review (an async-entry defect appeared at 12:42 and was fixed by the owner at 12:43:40) — L1 must score the final candidate bytes.

## Commands run and observed outcomes

Reads (all read-only; frozen originals never executed):
- `read` `~/.omp/agent/RULES.md` (no installs; pacman untouched).
- `read` `.ufo/waves/round-70/plan.md`, `base/replay70-base.txt`, `base/freeze-map.txt` (`README_MAP: CLEAN files=169`), `probe/replay70-probe.mjs`, `round-69/probe/c2-controls.sh`, `round-69/probe/deprec69-probe.mjs` (M11 at lines 442–549; digest at 512–521), committed receipt `round-69/controls/c2-forgecapture.txt`, candidate `build/K70ExecRunner/scripts/control-replay.mjs` (read repeatedly; snapshot in my build dir).
- `git -C <lane> rev-parse HEAD` → `1e00955a657a5b955992e23915143e7b3e261bb4`; `git diff 3dbe7e6e..HEAD -- base/ plan.md` → only `band-control.json` and `source-counts.json` added; **plan.md and replay70-base.txt unchanged since freeze**; `git cat-file -t 14057f3e…` (fixture base rev) → commit; S207–S213 URLs read from `git show 14057f3e:corpus/SOURCES.md`; pins read from `git show 14057f3e:.ufo/pins/source-captures.json`.
- Lane receipt integrity before and after my runs: `sha256sum round-69/controls/c2-forgecapture.txt` → `f2ffbd3a29990422bb65543fc34234ea1257294809f696992e1ff571cc6b091e` (matches the base/HEAD value recorded by K70AttackReceiptOverwrite; unchanged after both runs).

Live origin probes (read-only GETs, 45 s timeout each, from my scratch):
- S210 pinned URL → 200, 26389 bytes, sha256 `6608969be1213caf…` — **exactly the recorded pin**. The forgecapture tamper appends one line (fixture: 26438 bytes, pin recomputed to `04950a0a58a47006…`), so live ≠ tampered pin ⇒ `S210:origin-sha-mismatch` is guaranteed while the URL is reachable.
- S209/S212 → 200, both sha256 `0b69229a69b01a37…` (match pins). S207 `c12c3cb7d6b8a30c` / S208 `3f3371911512591e` / S211 `ae9bb7be00604a66` / S213 `ff518cf333b141ab` — **all match pins**. All 7 cited rows live-fetchable as of this review.

Reproduction A — my own private copy of the frozen script (`build/K70ReviewCounterR7/c2-forgecapture.private.sh`, diff-verified: LANE/PROBE/W/S substituted, duplicate original assignment block removed, `/tmp/forge-sed.txt` write removed; nothing else changed):
- First run (`HYAKU_SCRATCH=<my scratch>`) → probe crashed `ENOENT … mkdtemp '<scratch>/kumitate-r69/deprec69.XXXXXX'` — the frozen script never mkdirs its probe TMPDIR parent; receipt trailer showed `exit=1`, `CONTROL-FAIL forgecapture`. Demonstrates why a successor must provide the TMPDIR child (the candidate does: it mkdirs `child/tmp`).
- After `mkdir -p <scratch>/kumitate-r69`: exit 0 in 44 s. Receipt (`build/K70ReviewCounterR7/replay-r7-private-receipt.txt`):
  `DEPREC69_UNMET held=9/11 checks=11 rev=cfd195a2371a8b4ce9c885f0374d27a534fb70e0 rule=M69 live=exercised | M9 MISS readme-map-exit=1 | M11 MISS S207:mirror-required,S208:mirror-required,S211:mirror-required,S207:no-snapshot-mirror,S210:origin-sha-mismatch`
  `control=forgecapture live=exercised exit=1 rev=cfd195a…`
  `CONTROL-PASS forgecapture`
  Header line `diff`-equal to the committed r69 receipt after normalizing the rev. Fixture evidence: S210 capture tail `\n\nTODO-tampered-line-for-the-forgecapture-control\n`, pin = tampered sha. `/tmp/forge-sed.txt` absent after run.

Reproduction B — candidate `build/K70ExecRunner/scripts/control-replay.mjs` (sha256 `61f6e0e0ef2b881b44cf04f8698e22f6ff9a01796f6e160208c429a16175d9d8` at 12:43:40; snapshot in my build dir):
- `node control-replay.mjs --lane <lane> --family c2 --mode forgecapture --out <scratch>/r7-out.txt --work <scratch>/work` → exit 0 in ~57 s. Receipt (`build/K70ReviewCounterR7/replay-r7-candidate-receipt.txt`): identical header shape, fixture rev `93e14f1e…`, trailer `control=forgecapture live=exercised exit=1`, and `CONTROL-PASS forgecapture` present (the candidate's `tee -a` transform puts the marker into the receipt — resolving the sibling F5 stdout-only concern). Work dir empty afterwards (`ls -A` → nothing). Lane receipt hash unchanged.
- `--out <existing>` → `refusing to overwrite existing output`, exit 73, existing content `keep` intact. `--family junk` → usage, exit 64.
- `--selftest` with `REPLAY70_LANE` set → `CONTROL_REPLAY_SELFTEST: PASS cases=9 ok=9` (ST01–ST09, stable ids; evidence `build/K70ReviewCounterR7/selftest-candidate.out`).

## Findings

### F1 — Frozen r69 M11 detail truncation can hide the S210:origin-sha-mismatch token (LOW, latent, not r70-repairable)
- `deprec69-probe.mjs:549` prints `bad11.slice(0, 6)`; the c2 control's digest-arm gate greps the receipt for the literal `S210:origin-sha-mismatch` (c2-controls.sh:111).
- In forgecapture, bad11 currently has 5 entries; `S210:origin-sha-mismatch` sits at index 4. It is pushed only after up to 4 structure misses (`S207/S208/S211:mirror-required`, `S207:no-snapshot-mirror`) plus any digest misses for rows cited before S210 (citedIds order S207,S208,S209,…). If S207+S208+S209 all produced origin misses (stacked upstream drift), S210's token would land at index 7 and be sliced off; the control would then print `CONTROL-FAIL forgecapture (the digest arm did not bite)` and exit 1 even though the arm bit.
- Impact: R7 would MISS spuriously under multi-row upstream drift — an honest miss, never a false PASS, and fully consistent with the plan's disclosed network dependence. Not exercisable today (all 7 live hashes match pins, verified above). The counter is frozen; report-only, no amendment after scoring.

### F2 — Aggregate `live=exercised` is an attempted-live stamp, not a fetch-success stamp (informational, frozen semantics)
- The receipt trailer (`live=exercised`) and the r70 probe's aggregate gating (`text.includes('live=exercised')`, replay70-probe.mjs:31) key off flag presence, not fetch success. On total network failure the receipt still says `live=exercised` while the M11 body honestly reports `S210:origin-unreachable` and R7 misses. This is the frozen probe's declared semantics (`exercised` vs `no-live(vacuum-declared)`); failure is reported in the body, never waived. No action.

### F3 — Candidate was mid-edit during review; async-entry defect observed and owner-fixed (process note for L1)
- At 12:42 the candidate had `async function runControl` with `process.exitCode = runControl(parsed)` — assigning a Promise throws `TypeError [ERR_INVALID_ARG_TYPE]` (verified with node -e), which would exit 1 for every arm regardless of outcome. By 12:43:40 the entry was `runControl(parsed).then((code) => { process.exitCode = code; })` and the live R7 run passed end-to-end. Score only the final candidate bytes; do not judge from mid-edit snapshots.

## Bounded justification (why R7's receipt shape is correct and complete)

- Required tokens all observed in the candidate receipt: `DEPREC69_UNMET` (verdict header, first line), `CONTROL-PASS forgecapture` (tee'd marker), trailer `control=forgecapture live=exercised exit=1 rev=<fixture>` — the last also drives the r70 aggregate `live=exercised` claim. Misses preserved honestly: held=9/11 with M9 and M11 detail, identical to the committed r69 receipt modulo fixture rev.
- Failure paths honest: network failure ⇒ receipt shows `S210:origin-unreachable`/`origin-<http>` and `CONTROL-FAIL … (the digest arm did not bite)`, exit 1 ⇒ R7 MISS; existing `--out` ⇒ exit 73, target untouched; bad args ⇒ 64; child timeout (280 s, process-group SIGKILL via `runBashGroup`) ⇒ exit 70 with a `CONTROL-REPLAY-ERROR` receipt. Work reclamation verified empty; lane frozen receipts byte-identical before/after.
- Candidate transform checks (ST06/ST09, exactly-once substitutions, `/tmp/forge-sed.txt` removed, no `HYAKU_SCRATCH`, git `-C "$S/fx"` ×4, private W under the mkdtemp child) all pass; frozen c2 sha constant `679b7d9619ab…` matches the base blob.

## Residual risk and verification gaps

- Sibling findings outside my scope stand as reported: K70AttackReceiptOverwrite F1/F2 (the frozen probe's `preserved` term hashes only the archive tree, so live-lane receipt clobbering is not falsified by the counter) and K70AttackSourceDrift D2/D3. My runs confirm the candidate does not touch the live lane receipts (mitigation is runner-side, as those seats recommended).
- Selftest observation (flagged for L1, R2-adjacent): run without `REPLAY70_LANE` and outside the lane prints `PASS cases=9 ok=9` with ST05–ST09 recorded as `SKIP` (`selftest-candidate.out` first capture) — a bare-pass with 5 lane-dependent cases skipped. Under the frozen probe, selftest runs with cwd = the archived tree, so `findLaneRoot()` resolves and all 9 cases execute (verified). No action needed for scoring; disclosure only.
- Operability of the live arm was verified at review time (all 7 origins reachable, pins matching). A later scoring run remains network-dependent per plan; that dependence is disclosed, never waived.
- Not run: the original `c1-controls.sh`/`c2-controls.sh` (never executed); the frozen `replay70-probe.mjs` against the lane (no scoring event performed); no commits, no pushes, no mutating git in the lane; no production file written.

## Install record

None. No pacman, uv, npm, cargo, or binary installs. Used pre-existing node v24.21.0, git 2.56.0, python3, diff/sha256sum.

## Artifacts

- `build/K70ReviewCounterR7/c2-forgecapture.private.sh` — my diff-verified private copy of the frozen c2 control (review evidence).
- `build/K70ReviewCounterR7/replay-r7-private-receipt.txt` — receipt from my private replay.
- `build/K70ReviewCounterR7/replay-r7-candidate-receipt.txt` — receipt from the candidate run.
- `build/K70ReviewCounterR7/control-replay.candidate-124340.mjs` — sha-verified snapshot of the reviewed candidate bytes.
- `build/K70ReviewCounterR7/selftest-candidate.out` — candidate selftest output (lane set, 9/9).
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70ReviewCounterR7/` removed before yield (`ls` → No such file or directory).
