# K64R2ExecCounterRerun — raw measurements (round 64, wave 2)

Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin
Measured rev: 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 (integrated tree, wave-2 fact)
Host: linux 7.2.11-arch1-1, node v24.21.0, jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, load1 12.6–31.8
during the runs (fleet-wide load, measured per run by counter-rerun).

## A. jj64-probe through counter-rerun, harness child env (PATH/HOME/LANG only)

    $ node scripts/counter-rerun.mjs --probe .../.ufo/waves/round-64/probe/jj64-probe.mjs \
        --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev 2ed8a5f... --runs 5 --
    COUNTER_RERUN_RUN run=1 exit=1 wall_ms=1264.06 load1=12.60 stdout_bytes=323 stderr_bytes=0 \
      summary_sha256=c1690e46... summary="JJ64_UNMET held=7/8 checks=8 rev=2ed8a5f... rule=J64 | J6 MISS \
      demo-exit=2;rewrite_treechange_seat_state:stated-not-live;abandon_seat_head_seat_state:stated-not-live;\
      abandon_seat_head_files_on_disk:stated-not-live;abandon_empty_seat_state:stated-not-live;\
      update_stale_recovers:stated-not-live"
    ... runs 2-5 identical summary_sha256, wall_ms 1126.84 / 2340.95 / 1349.69 / 1679.40
    COUNTER_RERUN_REASON: run 1 exited 1  (x5)
    COUNTER_RERUN: DISAGREE
    EXIT=1 TOTAL_WALL_MS=7786

## B. same rev, same harness, EDITOR made reachable (jj shim: `EDITOR=true VISUAL=true exec jj "$@"`)

    COUNTER_RERUN_RUN run=1..5 exit=0 wall_ms=1817.14/1786.36/1772.84/1672.07/2072.59 load1=17.36-17.41
    summary_sha256=7ab788659394a172bef0208530bb1bace8e12872d6ba0529edf04afe1917451c
    summary="JJ64_HELD held=8/8 checks=8 rev=2ed8a5f... rule=J64"
    COUNTER_RERUN: AGREE (runs=5)
    EXIT=0 TOTAL_WALL_MS=9143

## C. counter-rerun's child environment (envprobe.mjs, TMPDIR and EDITOR set in the caller)

    $ TMPDIR=/tmp/kumitate-r64/K64R2ExecCounterRerun/alt EDITOR=true node scripts/counter-rerun.mjs \
        --probe /tmp/kumitate-r64/K64R2ExecCounterRerun/envprobe.mjs --lane <lane> --rev 2ed8a5f... --runs 1 --
    summary="ENVPROBE cwd=/home/vgpnk/Projects/shokunin/kumitate-shokunin TMPDIR=<unset> EDITOR=<unset> \
      PATH_HEAD=/run/user/1000/fnm_multishells/...:/home/vgpnk/.local/share/fnm HOME=/home/vgpnk keys=3"
    COUNTER_RERUN: AGREE (runs=1)

## D. cause isolation (demo run directly, same rev, extracted tree)

    $ env -i PATH="$PATH" HOME="$HOME" LANG=C.UTF-8 bash tree/scripts/jj-seat-demo.sh
    JJ_SEAT_DEMO: FAIL-CLOSED squash-into          EXIT=2      (3/3 runs)
    $ bash tree/scripts/jj-seat-demo.sh            (login shell, EDITOR=true)
    JJ_SEAT_DEMO: DONE jj=0.45.1-...                EXIT=0      (3/3 runs)
    $ env -i PATH HOME LANG EDITOR=true   ...      DONE  exit 0
    $ env -i PATH HOME LANG VISUAL=true   ...      DONE  exit 0
    $ env -i PATH HOME LANG EDITOR=false  ...      FAIL-CLOSED squash-into  exit 2
    $ env -i PATH HOME LANG EDITOR=<appends text to $1> ...   DONE exit 0, 21 keys byte-identical to EDITOR=true

    instrumented copy (scratch sq.sh) prints the jj error under the minimal env:
      2: No such file or directory (os error 2)
      Hint: Edited description is left in /tmp/editor-FjM5H3.jjdescription

    demo stdout stability: 3 runs byte-identical, 21 `JJ_SEAT:` keys (`diff` IDENTICAL).

## E. fix measured on a scratch shared clone (lane clone, one-line edit, commit 80faa1b525d163d525b517bb3eb274be2f62d99d)

    $ node .ufo/waves/round-64/probe/jj64-probe.mjs <clone> 80faa1b...
    JJ64_HELD held=8/8 checks=8 rev=80faa1b525d163d525b517bb3eb274be2f62d99d rule=J64     EXIT=0
    $ node scripts/counter-rerun.mjs --probe jj64-probe.mjs --lane <clone> --rev 80faa1b... --runs 5 --
    run=1..5 exit=0 wall_ms=7290.50/3732.82/3791.59/7026.25/2444.73 load1=29.57-31.82
    summary_sha256=841d68e4eab74c3fca1c07a9baba65272725b547e6a2025eef4a847c78605c30
    summary="JJ64_HELD held=8/8 checks=8 rev=80faa1b... rule=J64"
    COUNTER_RERUN: AGREE (runs=5)   EXIT=0 TOTAL_WALL_MS=24324

## F. fail-closed arms of jj64 (direct runs, full env)

    --no-live            JJ64_UNMET held=7/8 checks=8 rev=2ed8a5f... rule=J64 | J5 MISS live-fetch-skipped   EXIT=1
    all rows unreachable JJ64_UNMET held=7/8 ... | J5 MISS S198:live-unreachable;S199:live-unreachable;
                         S200:live-unreachable                                                             EXIT=1
      (HTTPS_PROXY=http://127.0.0.1:1 https_proxy=... ALL_PROXY=... ; `unshare -n` refused:
       "unshare: unshare failed: Operation not permitted", exit 1)
    one row flake        JJ64_UNMET held=7/8 ... | J5 MISS S199:live-unreachable                            EXIT=1
      (PATH shim: curl exits 6 only for the firefox-source-docs URL; the other two fetched live)
    SOURCES_CENSUS=<stub exit 1>   JJ64_UNMET held=7/8 ... | J7 MISS census-exit=1 province-names-entry=true
                                   readme-map-clean=true                                                    EXIT=1
    SOURCES_CENSUS=<no-op exit 0>  JJ64_HELD held=8/8 checks=8 rev=2ed8a5f... rule=J64                       EXIT=0

## G. cwd / TMPDIR dependence

    cwd=/                JJ64_HELD 8/8 exit 0
    cwd=/tmp/kumitate-r64 (non-git)   JJ64_HELD 8/8 exit 0
    TMPDIR=<scratch alt dir>          JJ64_HELD 8/8 exit 0
    TMPDIR=<lane>/.tmp-k64r2 (inside the lane git worktree)  JJ64_HELD 8/8 exit 0
    TMPDIR=/nonexistent-k64r2  ->  Error: ENOENT: no such file or directory, mkdtemp '/nonexistent-k64r2/jj64.XXXXXX'
                                   at mkdtempSync (node:fs:3134:18)                                          EXIT=1 (no verdict line)
    receipt64 same: TMPDIR=/nonexistent-k64r2 -> same uncaught ENOENT, EXIT=1, no verdict line
    receipt64 cwd=/      RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f... | P5 MISS report-not-given          EXIT=1

## H. receipt64-probe through counter-rerun

    no --report (the frozen reading):  run=1..5 exit=1 wall_ms=3143.96/3250.36/3567.38/3623.97/3646.22
      summary_sha256=ba60b8dd941710f66760b44ad20163798ecc8ada7e044df8a923ee2f67c56a9b
      summary="RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f... rule=R64 | P5 MISS report-not-given"
      COUNTER_RERUN: DISAGREE   EXIT=1  TOTAL_WALL_MS=17254
    --report <snapshot of a w1/w2 report draft> (P5 exercised): run=1..5 exit=0
      wall_ms=3407.42/3464.37/3388.64/3173.80/3851.43 load1=15.50-16.53
      summary="RECEIPT64_HELD held=5/5 checks=5 rev=2ed8a5f... rule=R64"
      COUNTER_RERUN: AGREE (runs=5)  EXIT=0 TOTAL_WALL_MS=17312
    --fleet <dir that is not a git repo>
      RECEIPT64_UNMET held=3/5 checks=5 rev=2ed8a5f... | P3 MISS fleet-blob-unreadable | P5 MISS report-not-given
      EXIT=1

## I. cost per run

    archive of the measured rev:  git archive 2ed8a5f... | wc -c = 171857920 (172 MB), 14826 files
    extraction alone:             325 ms, 190 MB on disk (du -sm), 14810 regular files
    needed paths only:            git archive 2ed8a5f... scripts corpus PROVINCE.md .ufo/pins | wc -c = 4055040 (4.1 MB)
                                  git archive 2ed8a5f... scripts .ufo/waves/round-64 | wc -c   = 12830720 (12.8 MB)
    successful execve per run (strace -f -e trace=execve, `= 0` lines):
      jj64-probe      132   (46 jj, 44 tput, 11 grep, 5 git, 3 curl, 3 rm, 3 realpath, ...)
      receipt64-probe 642   (521 git, 115 node, 2 git-core, 1 bash)
    network per jj64 run: 3 fetches, 48988 + 53233 + 47694 = 149915 bytes (curl shim, healthy run)
    control cases: 37 directories with an `expect` file; P4 re-runs the whole P2+P3 harness for two stubs,
      i.e. 3x the case cost (39 + 39 + 39 tool invocations by construction; 115 node execs measured).
    wall per run: jj64 1.67-2.34 s (load1 12-17), up to 7.29 s (load1 29-32, clone);
      receipt64 3.17-3.85 s (load1 15-17).

## J. TMPDIR hygiene

    SIGKILL at 0.35 s of jj64-probe   -> /tmp/jj64.* leftovers before=1 after=2
    SIGKILL at 0.6 s of receipt64-probe -> /tmp/receipt64.* leftovers before=3 after=4
    pre-existing orphans: /tmp/receipt64.0P2NiJ, /tmp/receipt64.rUxA0i (19:49:38/41, 2 files each = interrupted
      extractions), /tmp/editor-*.jjdescription x25 (demo editor temp files from failing runs)
    successful runs of my own leave nothing: receipt64 before=2 after=2 (the transient third dir seen once was a
      sibling seat's in-flight extraction)
