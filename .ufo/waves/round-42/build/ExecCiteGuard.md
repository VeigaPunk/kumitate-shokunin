RESULT ExecCiteGuard rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=fixed killed_before=0/5 killed_after=5/5 selftest_ms_before=1112,1067,1187 after=1132,1071,1243
Scope: R41-3 cite-check self-observation guard only; base bytes are b237e3f09c9559e130c7367bd2efa981c4ea516f. Existing child launches now carry increasing depth; depth two is a hard stop. The two existing text/JSON child checks also require both self-observation rows to be skipped. No new selftest case or child-process call was added.
Patch: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane diff b237e3f09c9559e130c7367bd2efa981c4ea516f -- scripts/cite-check.mjs > /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/ExecCiteGuard.patch` → sha256 `4b8f1fcddf95ba340b9b6cc9ddacd7afd396acc99310baf7fb53d8647893e79f`.
Patched tree: `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane add -- scripts/cite-check.mjs && env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git -C /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane write-tree` → `9545951635eaa2855b5ea754bb8c7df51d082132` (tree only; no commit).
Patched-byte mutant anchors; each `from` occurs exactly once:
`guard-outer-literal-2`: `process.env[INJECT41] !== undefined` → `process.env[INJECT41] === '2'`.
`child-text-env-dropped`: `child41(['--selftest'], { [INJECT41]: '1' })` → `child41(['--selftest'])`.
`child-json-env-dropped`: `child41(['--selftest', '--json'], { [INJECT41]: '1' })` → `child41(['--selftest', '--json'])`.
`guard-outer-ne-1`: `process.env[INJECT41] !== undefined` → `process.env[INJECT41] !== '1'`.
`guard-outer-eq-undefined`: `process.env[INJECT41] !== undefined` → `process.env[INJECT41] === undefined`.
Red-before command `node /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/run-cite-mutants.mjs /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane before` → control `75/75`, `VERDICT: PASS`, exit 0.
`guard-outer-literal-2`: RSS cap, no verdict, max 17 processes / 1213916 KiB, group leftovers 0; not a kill.
`child-text-env-dropped`: RSS cap, no verdict, max 17 processes / 1213240 KiB, group leftovers 0; not a kill.
`child-json-env-dropped`: RSS cap, no verdict, max 17 processes / 1210980 KiB, group leftovers 0; not a kill.
`guard-outer-ne-1`: survived, exit 0, `73/73`, two skips, `VERDICT: PASS`, group leftovers 0.
`guard-outer-eq-undefined`: survived, exit 0, `73/73`, two skips, `VERDICT: PASS`, group leftovers 0.
Red-after command `node /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/run-cite-mutants.mjs /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane after` → control `75/75`, `VERDICT: PASS`, exit 0.
`guard-outer-literal-2`: killed, exit 1, `73/75`, two FAIL lines, `VERDICT: FAIL`, max 4 processes / 283732 KiB, group leftovers 0.
`child-text-env-dropped`: killed, exit 1, `74/75`, one FAIL line, `VERDICT: FAIL`, max 4 processes / 263932 KiB, group leftovers 0.
`child-json-env-dropped`: killed, exit 1, `74/75`, one FAIL line, `VERDICT: FAIL`, max 4 processes / 282524 KiB, group leftovers 0.
`guard-outer-ne-1`: killed, exit 1, `73/75`, two FAIL lines, `VERDICT: FAIL`, max 4 processes / 279156 KiB, group leftovers 0.
`guard-outer-eq-undefined`: killed, exit 1, `73/75`, two FAIL lines, `VERDICT: FAIL`, max 4 processes / 282244 KiB, group leftovers 0.
Each mutant had its own process group, 60-second maximum, process cap 30, and 1200000 KiB RSS cap. The three red-before RSS-capped groups were killed by group; every mutant group reported leftovers 0.
Timing command: `node /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/time-selftests.mjs /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane/.exec-cite-timing-old/scripts/cite-check.mjs /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane/scripts/cite-check.mjs; uptime`.
PAIR 1 old: exit 0, `VERDICT: PASS`, 1112 ms; max 3 processes / 196896 KiB, leftovers 0.
PAIR 1 new: exit 0, `VERDICT: PASS`, 1132 ms; max 3 processes / 209684 KiB, leftovers 0.
PAIR 2 old: exit 0, `VERDICT: PASS`, 1067 ms; max 3 processes / 207556 KiB, leftovers 0.
PAIR 2 new: exit 0, `VERDICT: PASS`, 1071 ms; max 3 processes / 210056 KiB, leftovers 0.
PAIR 3 old: exit 0, `VERDICT: PASS`, 1187 ms; max 3 processes / 209440 KiB, leftovers 0.
PAIR 3 new: exit 0, `VERDICT: PASS`, 1243 ms; max 3 processes / 209632 KiB, leftovers 0.
PAIR 4 old: exit 0, `VERDICT: PASS`, 1208 ms; max 3 processes / 211420 KiB, leftovers 0.
PAIR 4 new: exit 0, `VERDICT: PASS`, 1283 ms; max 3 processes / 211984 KiB, leftovers 0.
PAIR 5 old: exit 0, `VERDICT: PASS`, 1335 ms; max 3 processes / 211096 KiB, leftovers 0.
PAIR 5 new: exit 0, `VERDICT: PASS`, 1286 ms; max 3 processes / 208904 KiB, leftovers 0.
`uptime` before/after pairs: `17:03:05 ... load average: 10.05, 8.89, 5.03`; `17:03:30 ... load average: 11.01, 9.17, 5.22`.
Timing comparison: old median 1187 ms, new median 1243 ms (+56 ms); paired deltas were +20,+4,+56,+75,-49 ms (median +20 ms). The +56 ms median shift is within the old-byte run spread of 268 ms (212 ms below that observed noise range). Round-41 open reference was 844/857/838 ms.
Probe command: `node /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/run-cite-probe.mjs /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane 9545951635eaa2855b5ea754bb8c7df51d082132 /fast/scratch/hyaku/kumitate-r42/seats/ExecCiteGuard/lane/.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (runs the committed probe in a watched group).
Probe output: exit 0; max 5 processes / 267248 KiB; leftovers 0; `CONTROL unmutated PASS exit=0 cases=75/75 fail_lines=0`.
Probe result: `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=9545951635eaa2855b5ea754bb8c7df51d082132`; all 16 anchors matched, no literal moved.
Tools installed or updated: none. Risk: the private depth marker is reserved for child selftests; measurements and the committed probe scrubbed inherited `KUMITATE_*` variables. Blockers: none.