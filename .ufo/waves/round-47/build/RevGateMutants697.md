RESULT RevGateMutants697 rev=cac43009 verdict=MECHANISM

Read-only reverse-engineering of the gate-mutants load flake (SKILL.md item 697).
Bytes read with `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show
cac43009b22232c1ae8efdab4f2789516c1fcc6f:scripts/gate-mutants.mjs` (sha256
177f6cbbd70d7503263d00c77357893658a0e393ac722d43034ebd7e429bb717) and `...:scripts/surface-probe.mjs`
(sha256 1361075da7762ce870749331864646fc03114e86720dc6b933bd6efcccb678b5); both identical to the
working tree at the frozen tip. No runs executed (leaf seat; gate not authorized to run).

1. Exit map — gate-mutants.mjs:149 (USAGE): "0 all mutants killed (K43) · 1 one or more survived
or drifted (passed with fewer cases than the control) · 2 setup, nomatch, crash, unstable kill,
timeout, control failure (before or after the mutants) or a missing frozen id · 64 usage".
So timeout and unstable are explicitly exit-2 classes.

2. Per-run budget — gate-mutants.mjs:30 `const TIMEOUT_MS = 60_000;`; :386
`const limit = Math.min(TIMEOUT_MS, Math.max(1, timeoutMs));`; :424-427 a wall-clock setTimeout(limit)
sets `timedOut = true` and SIGKILLs the process group. Every selftest spawn (control, each mutant,
each K43 confirm run) carries its own 60 s wall budget.

3. RSS/process poll — gate-mutants.mjs:429-435: a 100 ms setInterval calls groupStats(pid) (:362-377,
iterates /proc, sums processes in the pgid and VmRSS); `usage.processes > 16 || usage.rssKb > 512*1024`
→ `overflow = true` + group SIGKILL. Children are spawned under `/usr/bin/prlimit --nproc=…` (:413-415).

4. timeout vs unstable — classifyMutant (:517-522): `run.timedOut` → 'timeout' (first run only, no
second run); overflow → 'overflow'; !groupClean/spawnError/!cases → 'crash'; `cases.total !== controlTotal`
→ 'drift'; else killedOnce ? 'killed' : 'survived'. 'unstable' is produced only in runMutant (:693-698):
if the FIRST run is evaluable+killed, an immediate second run must also kill with the same sorted FAIL
names (confirmKill, :526-529). A second run that times out, drifts, or differs in FAIL names →
`state = 'unstable'`. So K timeout = first-run wall kill; *unstable = the K43 double-run disagreement,
which under load is usually the confirm run hitting the same 60 s wall.

5. Control comparison — runControl (:649-668) runs each target's unmutated selftest; controlPass (:537-542)
requires exit 0, `VERDICT: PASS`, fail_lines=0, parsed cases passed==total and total>=floor (cite-check 75,
wave-census 31), and no timedOut/overflow/spawnError + groupClean. Controls run BEFORE the mutants
(:1224-1228, sequential) and each mutant's `controlTotal` is the pre-control total (:1231-1233); controls
re-run after (:1238-1242, CONTROL_AFTER, must pass again or integrity `control-after` fails).
gateExitCode (:544-553): controlFailure OR any state in {nomatch, crash, unstable, timeout, overflow,
drift-without-driftNonKill} → 2; survived/driftNonKill → 1; else all 43 killed + 41 frozen killed → 0.
Main composes it at :1255-1268 (verdict label ERROR/SURVIVED/CLEAN).

6. Where load flips the verdict (all wall-clock artifacts):
   - gate-mutants.mjs:424-427 + :518: a mutant's first run stretched past 60 s → 'timeout' → exit 2.
   - gate-mutants.mjs:693-698 (+ :526-529): confirm run stretched/not-killed → 'unstable' → exit 2.
   - gate-mutants.mjs:539-542 + :545: a pre- or post-control stretched past 60 s → control FAIL →
     exit 2 (even before any mutant runs).
   - Marginal, not load-driven: :431 overflow (RSS>512 MiB, >16 procs) and :889 group kill races.
   The 60 s wall is compared to wall-clock, so neighbor load slows both, and the flip, regardless of the
   mutant's own work. Semantics (K43) are unchanged; these states are harness-guard false positives.

7. Harness — surface-probe.mjs:241 `CHECKLIST_TIMEOUT_MS = 120_000`; :1007-1013 runs each checklist item
via `spawnSync('bash', ['-c', item.command], { timeout: CHECKLIST_TIMEOUT_MS, … })`, sequentially (for
loop :998). `exitOk = typeof run.status === 'number' && item.exits.includes(run.status)`; item failed =
!(exitOk && substringOk). On harness kill, Node returns status=null/signal='SIGTERM' → exitOk=false.
:1020 `verdict = failed ? 'FAIL' : 'PASS'`; :1031-1032 `CHECKLIST: n/m pass` + `VERDICT: FAIL`;
:1049/1054 return 1 on any failed item.

8. Can a 43-mutant battery reach the 120 s harness budget under load? Yes. The battery is 47 selftest
runs (2 pre-controls + 43 mutants over --jobs=4 + 2 CONTROL_AFTER), each with its own 60 s wall ceiling;
serial worst case is 2*60 + ceil(43/4)*60 + 2*60 = 900 s, and even the pre-controls alone can consume the
whole 120 s. Empirically, round-43 at load 35-75 measured the same battery at ~112.9 s (headroom ~7 s;
CritNoHarm.md:32), i.e. already within reach of the harness kill. If the battery crosses 120 s the harness
reports `CHECKLIST FAIL … exit=null expected=0` (signal SIGTERM), `VERDICT: FAIL`, and surface-probe
--checklists exits 1. If it finishes within 120 s under load, the battery itself exits 2 (timeout/unstable/
control-fail) and the harness still reports `CHECKLIST FAIL … exit=2 substring=miss`, exit 1.

9. Recorded load flips (same bytes CLEAN alone):
   - .ufo/waves/round-46/close/gate-mutants-direct.txt:49: `GATE_MUTANTS: CLEAN (mutants=43 killed=43
     frozen=41/41 …)` on the close bytes.
   - .ufo/waves/round-46/close/checklists-4.txt:19: `CHECKLIST FAIL SKILL.md:697 exit=2 expected=0
     substring=miss` (load 55.60); spotcheck §2: 4/4 close runs failed at loads 18.96/27.39/55.60, exit 2.
   - .ufo/waves/round-44/controls/ExecR43ShippedReceipt.md:165/168: `MUTANT … V194-check-ok-true timeout
     cases=not-run/not-run control=32 fail_lines=0 timeout=60000ms` and `GATE_MUTANTS: ERROR (… killed=40
     frozen=38/41 …) unstable=2 timeout=1` at b01ded32.
   - .ufo/waves/round-43/build/CritNoHarm.md:33: at TasksMax=128, `GATE_MUTANTS: ERROR (… unstable=3)`
     exit 2 (2 of 5 runs at 128 ERROR, 0 of 3 at 256).

10. Proposed change (NOT implemented): make the per-run budget load-independent without touching K43. In
runSelftestFile, replace the wall-clock 60 s setTimeout (:424-427) with a CPU-time budget: extend groupStats
(:362-377) to also sum the group's utime+stime ticks (/proc/<pid>/stat fields 14/15) in the existing 100 ms
poll (:429-435) and SIGKILL when cumulative CPU seconds exceed 60 (converted via sysconf(_SC_CLK_TCK));
keep only a generous emergency wall failsafe (e.g. 600 s) for CPU-idle hangs. CPU time consumed is invariant
under scheduler contention, so a slowed-by-load mutant still completes and is judged on its semantics; a true
busy-loop hang still burns CPU and is killed. No survivor is hidden: K43's killedOnce/confirmKill/failNames
checks (:507-529) are unchanged — only the false-timeout class disappears. The harness's own 120 s wall
(:1007) would likewise need headroom or a CPU-based budget for the checklist-level verdict to be load-stable.

Confidence: high for the mechanism (all flip lines traced; corroborated by round-43/44/46 receipts showing
exit 2 with timeout/unstable under load and CLEAN alone). [INFERENCE] only for the magnitude of stretch
under load (no wall-time fields in current receipts; R46-3 asks for them).

