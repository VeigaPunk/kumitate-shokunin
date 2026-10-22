RESULT ScoutWaveCensusR42 rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=confirmed reports=37/37

# Wave census vs the build dispatch, round 42, at c9a084bf

Scope: `node scripts/wave-census.mjs --round 42` in a clone detached at
`c9a084bf03fb043d3cce5da102fffbc023552a45`, compared with
`.ufo/waves/round-42/build-dispatch.json`, `.ufo/waves/round-42/build-spec.json` and the 37
reports in `.ufo/waves/round-42/build/`. Clone:
`/fast/scratch/hyaku/kumitate-r42/falsify/ScoutWaveCensusR42/lane`; fixtures under the same
scratch dir. No tool installed or upgraded. The `lsp` device is not in this seat's tool
inventory, so symbols were checked by reading `scripts/wave-census.mjs` and by executing it,
never by a language server; no grep output is presented as semantic proof.

## Result

The census is correct at the measured commit. Seats 37, roles exactly as dispatched, attack 14,
reports 37/37, absent 0, stray 0, `WAVE_CENSUS: CLEAN`, exit 0. Reports missing: none. Reports
stray: none. The 38th entry in `build/`, `swarm-registry.json`, is the producer's merged registry
(named by `registry.path`), not a report, and is correctly not counted. Nothing in this round
claims more than that about the census's round-42 output; no report file is a symlink, empty, or
a byte-copy of another, and every `Report:` trailer names `<seat>.md` for that seat.

Two limits are named below (absent reports do not fail the gate; an uninformative duplicate-name
`REGISTRY_MISMATCH`). Neither changes the 37/37 result, and neither is a fix this round claims.

## Evidence (commands and outputs)

1. `git -C <clone> rev-parse HEAD` → `c9a084bf03fb043d3cce5da102fffbc023552a45`; `git status --porcelain | wc -l` → `0` (all 37 reports are committed bytes).
2. `node scripts/wave-census.mjs --round 42` → `WAVE round=42 wave=build schema=ufo-swarm-wave-dispatch-v1 seats=37 attack=14 reports=37/37 roles: executor=7 scout=7 reviewer=6 critic=5 scribe=5 mutation-tester=3 connector=1 revenger=1 sentinel=1 simplifier=1`
3. same run → `ROUND round=42 waves=1 seats=37 attack=14 reports=37/37` and `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`; `exit=0`.
4. `--round 42 --json` → `seats: 37`, `resumed: 0`, `attack: 14`, `present: 37`, `absent: 0`, `absentNames: []`, `findings: []`, `"verdict": "CLEAN"`.
5. `jq -c '.counts'` / `'.taskCall.tasks|length'` / `'.registry.members|length' build-dispatch.json` → `{"spawn":37,"resume":0,"total":37}` / `37` / `37`; registry `schema` = `ufo-swarm-registry-v1`.
6. task role tally from the dispatch → connector 1, critic 5, executor 7, mutation-tester 3, revenger 1, reviewer 6, scout 7, scribe 5, sentinel 1, simplifier 1 = 37; attack roles reviewer 6 + critic 5 + mutation-tester 3 = 14, matching the printed `attack=14`.
7. `jq -r '.items[].name' build-spec.json | sort` vs dispatch task names `| sort` → `diff` empty (`SPEC_DISPATCH_IDENTICAL`), 37 items each.
8. independent node map (dispatch trailers vs directory) → `tasks=37 md=37 dedup_paths=37 bad=0`.
9. seat→file identity check (trailer basename vs task name) → `mismatches=0`; no report is filed under another seat's name.
10. `find build -maxdepth 1 -type f -name '*.md' | wc -l` → `37`; `find build ! -type f ! -type d | wc -l` → `0` (no symlinks/FIFOs); `lstat` walk → `entries=38 regular=38 min_bytes=2900`.
11. `sha256sum build/*.md | ... | uniq -d | wc -l` → `0` (no byte-identical reports).
12. `--expect 42/build:attack=14` → CLEAN, `exit=0`; `--expect 42/build:attack=13` → `FINDING EXPECT_MISMATCH round=42 wave=build 42/build:attack=13 payload=14`, `WAVE_CENSUS: DRIFT`, `exit=1`.
13. `env -u KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL node scripts/wave-census.mjs --selftest` → `WAVE_CENSUS_SELFTEST: 31/31 pass`, `VERDICT: PASS`, exit 0; cases `WC27`–`WC31` all PASS.
14. `KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL=1 node scripts/wave-census.mjs --selftest` → `FAIL  WC00 injected failure (child run of WC24 only) — injected`, `30/31 pass`, `VERDICT: FAIL`, exit 1 (the suite's self-observation is live, not a vacuous pass).
15. scratch copy of the round under `--root` → `reports=37/37`, CLEAN, exit 0 (same bytes, same verdict).
16. scratch copy + `build/ZzzStray.md` → `FINDING STRAY_REPORT round=42 wave=build .ufo/waves/round-42/build/ZzzStray.md`, DRIFT, exit 1.
17. scratch copy, `ExecKimiLocks.md` renamed to `ExecKimiLocksX.md` → `absent: ExecKimiLocks`, `reports=36/37`, `FINDING STRAY_REPORT .../ExecKimiLocksX.md`, DRIFT, exit 1.
18. scratch copy, `ExecKimiLocks.md` deleted → `absent: ExecKimiLocks`, `reports=36/37`, `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`, exit 0 — an absent report is printed, never a finding.
19. `node scripts/wave-census.mjs --round 40` → 618 bytes, sha256 `69c4eed220d91799d8d71667f1a4f06dfeaddfae47cb0fe34ba8cecca7d6c85a`; `--round 41` → 1344 bytes, sha256 `c0389f5c273e7f396bb221d6ccaec6705fec257240cacc803184b6e50f163e4d`; both equal the after-hashes `ExecCensusHarden.md` claims.
20. round-40 body → `reports=31/32` (`absent: ExecTokenKept`) and `reports=26/35` (9 absent), `ROUND ... reports=57/67`, yet `WAVE_CENSUS: CLEAN`, exit 0.
21. fixture: duplicate seat `Dup` twice, no `counts`/`registry` → `seats=2 ... reports=2/2`, CLEAN, exit 0 (L3 open at c9a084bf, as `corpus/lessons/round-42.md:116-118` says).
22. fixture: duplicate `Dup` twice with a one-member registry → `FINDING REGISTRY_MISMATCH round=90 wave=build not-in-registry=[] not-in-tasks=[]`, DRIFT, exit 1 — fires, but names nothing.
23. leftover scan `pgrep -af ScoutWaveCensusR42` after all runs → `0`.
24. `.ufo/waves/round-42/evidence-seat-gate.txt` → `dispatched 2026-10-22T19:55Z wave kumitate-r42-build 37 seats; slot granted live=42 pending=35 cap=128`, matching the payload's 37 seats and 37 task entries.

## Named limits (not falsifiers of this round's claims)

- **Absent is not a finding.** `WAVE_CENSUS: CLEAN` and exit 0 coexist with `reports=36/37` and
  `absent: <seat>`; `--expect` can assert role/attack counts only, never a report count. So the
  round's `reports=37/37` is printed, not asserted, and a seat that dies before writing leaves the
  gate CLEAN. Checklist item 16 in `SKILL.md:692` is scoped by its parenthetical ("payload counts
  and findings"), and the tool header says an absent report "does not say why", so the round does
  not overclaim; a reader who takes `WAVE_CENSUS: CLEAN` as report presence would be wrong
  (round 40: CLEAN with 10 absent). Pre-existing, not new at c9a084bf.
- **Duplicate-name diagnostic.** When duplicate seat names collide with a smaller registry, the
  finding fires with both `not-in-registry=[]` and `not-in-tasks=[]` (evidence 22): correct exit,
  unreadable detail, and the duplicate itself is never named. No effect on this round (37 distinct
  names, registry 37).
- Minor: the stray scan reads only `.md`, so `swarm-registry.json` in the same dir is invisible to
  it; correct here, but a non-`.md` stray report path would also be invisible.

## Verification boundary

Unrun: nothing in this item. The census was run at the measured commit, its suite both clean and
with the injection hook, its negative paths (stray, renamed, deleted) on a copy of this round, and
both hashes it claims in `ExecCensusHarden.md` were reproduced. No code was edited, no gate was
mutated, no patch is proposed.
