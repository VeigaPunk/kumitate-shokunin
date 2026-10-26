VERDICT: One full `harm-matrix.mjs` run leaves the lane byte-identical in `.git`, `.jj` and the worktree (zero writes, sandboxes fully reaped in 4 isolated runs), but its sandbox cleanup is fatal-on-EACCES (a gate that leaves a `0500` dir makes it crash with no verdict and leak both 100–220 MB sandboxes) and its no-verdict rows discard the gate's output, which is why one observed `round-gate-selftest` flake read as `HARM`.

## Evidence

**E1 — the measured run** (`node …/scripts/harm-matrix.mjs --lane <lane> --base 47fe2383151909d31557ada118ad84f90404dc6c --tip 47fe2383151909d31557ada118ad84f90404dc6c --timeout 180`), lane `kumitate-shokunin`, 2026-10-25 22:21:58:
```
EXIT=0 WALL=85s
HARM_MATRIX: CLEAN gates=19 held=15 repaired=0 carried=4 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=47fe23831519 tip=47fe23831519
```
20 `HARM_ROW` lines (`harm-matrix-selftest` = `ABSENT_BOTH`: the tool itself is absent at 47fe2383, first committed at 2ca91a0). Reproduced 3× against the lane (85 s / 68 s / 69 s) and 3× against a fixture clone.

**E2 — (a) git, before → after** (before 22:21:07; after 22:23:26; re-checked 22:35):
```
2ca91a0c81542cad5f731049aa55dd2f99ade98d  (HEAD)   2ca91a0c81542cad5f731049aa55dd2f99ade98d  (master)   [both captures]
status: 8 lines before, 9 after — every line `??` under .ufo/waves/round-65/
        (the extra is `.ufo/waves/round-65/w1.ready.dispatched`, a dispatcher marker, not a gate)
```
No tracked file modified at any capture; no ref, packed-ref or index write (§E7 proves the mechanism).

**E3 — (b) jj, untouched working copy** (`jj --ignore-working-copy -R <lane> op log --limit 1 --no-graph`):
```
before: 8b1683553da4 vgpnk@plazir27 default@ 11 minutes ago, lasted 3 seconds
after:  8b1683553da4 vgpnk@plazir27 default@ 17 minutes ago, lasted 3 seconds
```
Same operation id → the tool created no jj operation and did not snapshot the worktree.

**E4 — (c) mtime trees** (`find … -printf '%p %s %T@\n' | sort`, compared line by line):
```
.git  8516 files  diff = 0 lines   (newest at capture: .git/index 1792977578.37, .git/refs/remotes/origin/master 1792976982.43)
.jj   6465 files  diff = 0 lines   (newest: .jj/working_copy/checkout 1792976982.93)
worktree, -newermt 22:21:07, excluding .ufo/waves/round-65 = 0 files
```
(The single later worktree hit, `corpus/SOURCES.md`, has an empty `git diff --stat` — a peer wrote identical bytes; no ` M` entry ever appeared.)

**E5 — (d) /tmp** — the tool's own sandboxes are reaped in every normal run; isolated with a private `TMPDIR` (the tool honours it):
```
run2 EXIT=0 WALL=68s sandbox_left_in_TMPDIR=0 ; run3 EXIT=0 WALL=69s sandbox_left_in_TMPDIR=0
ctl  EXIT=0 sandboxes_left=0 ; fixrun2 EXIT=0 sandboxes_left=0 ; TMPDIR listing after each: empty
```
`/tmp/harm-matrix.*` seen during the wave belong to concurrent peer instances of the same tool on this lane (mtimes 22:23:06–22:23:56; the three present at my run's start were gone by 22:23). `/tmp/harm-fixture.*`: none. `/tmp/pbr-selftest.*`: 4 stale before my run (21:53, 21:59, 22:07, 22:13) and 4 more appearing 22:28–22:31; the 6 roots produced by my own runs were all reaped (see F4).

**E6 — (e) sandbox-only writes, by hand** — clone of the lane at 47fe2383 (`git clone --no-hardlinks`, `-C` on every call), then the registry's argv with the tool's `CLEAN_ENV` and `cwd` = clone:
```
node scripts/readme-map.mjs                                   exit=1  README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md
node scripts/proxy-check.mjs --strict                          exit=1  PROXY: DRIFT (C2_TOTAL_DRIFT … delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json exit=0 SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 …)
sandbox tree diff (path+size, 26,281 entries incl .git), twice: 0 lines
```
Every byte of these gates' output lands in the sandbox or is not written at all; nothing reaches the lane.

**E7 — negative control** — same tool, `--lane` = a clone, so the real lane is unreachable:
```
clone_git_tree_diff=0   .git/index sha256 589db4404cc7… before == after   sandboxes_left=0
HARM_MATRIX: CLEAN gates=19 held=15 repaired=0 carried=4 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0
```
The tool performs no git write on its `--lane` argument: its lane-side calls are `rev-parse --verify` and `clone` only.

**E8 — two runs back to back (flakiness)** — `diff` of `HARM_ROW` lines, lane runs 1/2/3:
```
18c18  < … gate=plan-before-ready-selftest … base_text="… PASS (38/38) fixtures=/tmp/pbr-selftest.Rci1PE" …
       > … gate=plan-before-ready-selftest … base_text="… PASS (38/38) fixtures=/tmp/pbr-selftest.izLtI0" …
```
One row of twenty differs per pair, only inside `base_text`/`tip_text`; every `id=` is stable (F3). **Six matrix runs total**: 5 read `CLEAN`/exit 0; one (patched copy, clone) read:
```
HARM_ROW gate=round-gate-selftest base=CLEAN tip=FAIL_CLOSED id=HARM base_text="VERDICT: PASS" tip_text="no-verdict exit=1"
HARM_MATRIX: HARM gates=19 … harm=1 …        EXIT=1
```
the same gate run 3× directly in that clone: `exit=0 verdict_line=1 last=VERDICT: PASS` each time → the single `HARM` is a transient gate crash, not a revision change (F2).

**E9 — the defect, reproduced** (`TMPDIR` private; fixture repo with one gate that does `chmodSync('locked', 0o500)` and prints a clean verdict):
```
Error: EACCES, Permission denied: …/tt/harm-matrix.oF6vGP
    at rmSync (node:fs:1282:18)
    at runMatrix (file:///home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/harm-matrix.mjs:136:40)
EXIT=1   stdout: <empty>   leftovers: harm-matrix.H3mlru harm-matrix.oF6vGP (144K)
```
`node -e "rmSync(p,{recursive:true,force:true})"` on a `0500` dir: `RM_THREW code=EACCES`. One sandbox of this lane measures `du -sh /tmp/harm-matrix.*` = **102M–220M**.

**E10 — patch validation** (build dir): `patch -p1` applies cleanly (`APPLIED_EQUALS_FIXED=YES`, `node --check` OK); the hostile fixture then reads `HARM_MATRIX: CLEAN gates=1 held=1 …` with `leftovers=0`; `node patch.diff-applied --selftest --cases <lane>/scripts/harm-cases.json` → `HARM_MATRIX_SELFTEST: PASS (26/26)`; a full clone run reads `class_diff_vs_orig=0` (all 19 classifications identical), `EXIT=0`.

**E11 — F4 reproduction**: `TMPDIR=… timeout -k 2 1 bash scripts/plan-before-ready.sh --selftest` → `EXIT=124`, leftover `pbr-selftest.NlmCeQ` `1.3M`. With the patch: kills at 1 s and 2 s → `leftovers=0`; full run `PLAN_BEFORE_READY_SELFTEST: PASS (38/38)`, `leftovers_after_pass=0`.

## Findings

**K65ExecHarmSafety-1 — medium — sandbox cleanup is fatal and leaks both sandboxes.** `runMatrix`'s `finally` calls `rmSync(d,{recursive:true,force:true})`, which throws `EACCES` on any `0500` directory a gate leaves in its sandbox; the throw escapes `finally`, so the matrix prints **no** verdict (stdout empty), exits 1 with a stack trace, and leaves *both* sandboxes behind because the loop aborts on the first. On this lane a sandbox is 102–220 MB, so two leaks are ~0.2–0.4 GB of `/tmp` per occurrence, and a caller gets exit 1 — the same code as `HARM` — with no `HARM_MATRIX:` line to explain it. Repro: E9 command. Fix: `patch.diff` hunk 2–4 (`reap()` that relaxes modes with `lstat`+`chmod 0700`, retries, and reports `HARM_MATRIX_SANDBOX_LEAK` on stderr instead of throwing; verdict unchanged).

**K65ExecHarmSafety-2 — medium — a no-verdict row keeps none of the gate's output, and a transient gate crash is scored as a harm.** `measure()` returns `text: "no-verdict exit=N"` and drops the up-to-64 MB it captured, so the observed `round-gate-selftest` flake (E8: one `FAIL_CLOSED` in 6 runs, 3/3 direct runs `PASS`) cannot be diagnosed from the matrix at all — exactly the row a reader needs to distinguish a flake from a regression. `CLEAN`→`FAIL_CLOSED` also classifies as `HARM`, i.e. an unreproducible gate crash is counted on the harm axis (C1's H5 reads `exit 0 exactly when harm=0`). Repro: `grep 'gate=round-gate-selftest' build/K65ExecHarmSafety/logs/fixrun.out`. Fix: `patch.diff` hunk 5 appends `last="<last non-empty output line>"` (bounded 160 chars). I deliberately do **not** propose re-classifying `FAIL_CLOSED` out of harm — that would relax the check; a single retry-on-`FAIL_CLOSED` is a strengthening option but changes the id vocabulary and is the L1's call.

**K65ExecHarmSafety-3 — low — one registry row's text is never reproducible.** `plan-before-ready-selftest` prints `fixtures=/tmp/pbr-selftest.XXXXXX`, so consecutive matrices always differ in that row (E8), a `report-receipt-diff`-style comparison of two matrix runs can never be clean, and a `NOT_CLEAN` reading of that gate can only ever classify `CARRIED_MOVED`, never `CARRIED`. Repro: `diff <(grep '^HARM_ROW ' logs/run2.out) <(grep '^HARM_ROW ' logs/run3.out)`. Fix: normalise the mkdtemp suffix in `transition()`'s equality test (print the raw text unchanged) — not in `patch.diff`, to keep the integrated diff small.

**K65ExecHarmSafety-4 — low — the registry's `plan-before-ready-selftest` gate leaks its fixture root when it is killed.** The selftest reaps `$root` only on its success path (line 651), and the kill handler that exists (line 177) belongs to the map arm; `timeout` at the gate's budget therefore strands 1.3–4 MB each time (E11), which matches the 8 stale `/tmp/pbr-selftest.*` dirs from 21:53–22:31. `harm-matrix` cannot reap a gate's fixtures (it does not know where they are), so the fix belongs in the gate: `patch-plan-before-ready.sh.diff`. Note the same shape at line 177 (a TERM handler that removes `$t` but does not exit, so the run continues) — untouched, outside this seat's evidence.

**Positive result for C1:** with `--lane` set to a clone the tool writes nothing to that repository (E7), and against the real lane `.git`, `.jj`, the worktree, the refs and the jj op log are unchanged across a full run (E1–E4). The containment that works is *cwd*: gates are ordinary child processes with the real `HOME` and no filesystem jail, and none of the 20 registry gates writes outside its own `mkdtemp` root (static scan of all 20 argv scripts: every `writeFileSync`/`mkdirSync` target is a `mkdtemp` root or is gated behind an explicit `--write`/`--selftest` flag; verified live for 3 of them, E6).

## Artifacts

- `.ufo/waves/round-65/build/K65ExecHarmSafety/patch.diff` — 78 lines, 5 hunks against `scripts/harm-matrix.mjs` (reap helper; guarded `finally`; guarded clone/checkout error paths; `FAIL_CLOSED` output preserved). Applies with `patch -p1`, `--selftest` 26/26, classifications unchanged.
- `.ufo/waves/round-65/build/K65ExecHarmSafety/patch-plan-before-ready.sh.diff` — 16 lines against `scripts/plan-before-ready.sh` (signal handler reaps then exits; EXIT trap reaps).
- `.ufo/waves/round-65/build/K65ExecHarmSafety/logs/` — `run1/2/3.out` (lane, tool as committed), `ctl.out` (clone), `fixrun.out`/`fixrun2.out` (patched), `pbrk.out`/`pbrk4.out`/`pbrfix2.out`, `rows12.diff`, `rows23.diff`, `git-tree.diff`, `jj-tree.diff`, `e/tree.diff`.
- Scratch (ephemeral): `/tmp/kumitate-r65/K65ExecHarmSafety/` — `pre-git-tree.txt`, `pre-jj-tree.txt`, `verify-*-tree.txt`, `orig.mjs`, `fixed.mjs`, `orig-pbr.sh`, `fixed-pbr.sh`, clone `e/sb`, hostile fixture `rofix`, private `TMPDIR`s.

## Limits

- The tool has **no filesystem jail**: a gate can still write anywhere by absolute path, and it inherits the real `HOME`. I measured the 20 registry gates (static scan of every argv script + 3 hand-runs) and not a hypothetical hostile gate's absolute-path writes.
- `omp-census` reads the live `~/.omp/agent`; the OMP harness writes its own transcripts there continuously, so mtime attribution of that tree during my window is impossible (279 files newer than run start, none attributable). `kimi-census`'s root is not `/home/vgpnk/.kimi` (that path does not exist) — I did not locate the real root, so I did not check it for writes.
- One flake observed, not root-caused (the tool discarded the gate's stderr — F2); F2's fix would make the next occurrence diagnosable.
- Gates outside the registry (cite-check, gate-mutants, cap-run, `surface-probe --checklists`) were not exercised.
- `.git/index` differed between my first and last captures only by mtime/stat-cache (size 2094536 unchanged, no tracked modification): that is my own `git status` refreshing the index (timestamps match the check), and E7's clone control shows the tool cannot do it. `corpus/SOURCES.md` changed mtime with a byte-identical tree — concurrent peer activity, not measured here.
- No tools installed; no pacman transaction run.
- Disclosure: one early command of mine lacked `cd`, so its `ro.out` (0 B) and `ro.err` (856 B) landed in the fleet root; both removed at 22:36 and `git -C /home/vgpnk/Projects/shokunin status` shows neither path. No other write of mine exists outside the lane's build path and `/tmp/kumitate-r65/K65ExecHarmSafety/`.
