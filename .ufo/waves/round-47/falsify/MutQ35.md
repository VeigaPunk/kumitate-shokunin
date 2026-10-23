RESULT MutQ35 rev=269dadb6 verdict=SURVIVORS killed=3/5
Axes: operability, behavioral receipt sensitivity, exact-byte restoration. Only the assigned five checker mutations were probed; no C1 counter or other runtime suite was run.
Measured clone HEAD: 269dadb6a56744531bd1201e5944185e96ff6a4c. Requested comparisons use base=2b2bf7bbdedaff3f0c749a8703002bebb104d15c; N tip=9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0; P tip=269dadb6a56744531bd1201e5944185e96ff6a4c.
Read-only checker source: /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/quality/q35-append-only.sh. Only its scratch copy /fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/q35-append-only.sh was mutated, one mutant at a time.
Setup command: `unset $(git rev-parse --local-env-vars 2>/dev/null) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE; mkdir -p /fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35 && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/lane && git -C /fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/lane checkout -q --detach 269dadb6a56744531bd1201e5944185e96ff6a4c` -> exit=0 stdout="" stderr=""; `git -C /fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/lane rev-parse HEAD` -> 269dadb6a56744531bd1201e5944185e96ff6a4c.
Repository-locating variables were unset before cloning; all git writes were confined to the scratch clone. Lane writes are limited to this report.
Source/copy hash command before and after: `sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/quality/q35-append-only.sh /fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/q35-append-only.sh`; both outputs were 3de630055ba06851a19790af2e70aa5f92a31adfcf73f21d2d257f3d92ff7342 followed by their respective paths.
H0=3de630055ba06851a19790af2e70aa5f92a31adfcf73f21d2d257f3d92ff7342 (original, pristine, every restored copy, and final read-only source).
N exact command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 env TMPDIR=/fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/tmp bash /fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/q35-append-only.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin 2b2bf7bb 9b33e03e`
P exact command: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900 env TMPDIR=/fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/tmp bash /fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35/q35-append-only.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin 2b2bf7bb 269dadb6a56744531bd1201e5944185e96ff6a4c`
Expected detector: N rewritten=13 removed=0 exit=1; P rewritten=0 removed=0 exit=0. Verdicts use these behavioral expectations, not the diagnostic frozen_cells declaration.
Every stage below executes both exact commands N and P separately; outputs are losslessly labeled below (JSON strings; \n represents a newline). No baseline failure occurred.
All clones/detectors had RLIMIT_FSIZE=67108864 bytes. Detectors also used the shown scope limits and 900-second kill timeout; TMPDIR was inside this seat. Initial `df -h /fast`: 804G total, 704G used, 100G available (88%).
Exact observed stdout values:
N13="Q35 rewritten=13 removed=0 base=2b2bf7bbdedaff3f0c749a8703002bebb104d15c tip=9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0\nQ35 REWRITTEN S003 cells=7\nQ35 REWRITTEN S004 cells=6,7\nQ35 REWRITTEN S013 cells=6\nQ35 REWRITTEN S041 cells=6\nQ35 REWRITTEN S047 cells=5,6,7\nQ35 REWRITTEN S051 cells=6\nQ35 REWRITTEN S052 cells=7\nQ35 REWRITTEN S053 cells=6\nQ35 REWRITTEN S054 cells=7\nQ35 REWRITTEN S055 cells=6,7\nQ35 REWRITTEN S061 cells=7\nQ35 REWRITTEN S073 cells=7\nQ35 REWRITTEN S076 cells=7\n"
P0="Q35 rewritten=0 removed=0 base=2b2bf7bbdedaff3f0c749a8703002bebb104d15c tip=269dadb6a56744531bd1201e5944185e96ff6a4c\n"
N7="Q35 rewritten=7 removed=0 base=2b2bf7bbdedaff3f0c749a8703002bebb104d15c tip=9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0\nQ35 REWRITTEN S004 cells=6\nQ35 REWRITTEN S013 cells=6\nQ35 REWRITTEN S041 cells=6\nQ35 REWRITTEN S047 cells=5,6\nQ35 REWRITTEN S051 cells=6\nQ35 REWRITTEN S053 cells=6\nQ35 REWRITTEN S055 cells=6\n"
N13U="Q35 rewritten=13 removed=0 base=2b2bf7bbdedaff3f0c749a8703002bebb104d15c tip=9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0\nQ35 REWRITTEN S003 cells=7\nQ35 REWRITTEN S004 cells=6,7\nQ35 REWRITTEN S013 cells=6\nQ35 REWRITTEN S041 cells=6\nQ35 REWRITTEN S047 cells=5,6,7\nQ35 REWRITTEN S051 cells=6\nQ35 REWRITTEN S052 cells=7\nQ35 REWRITTEN S053 cells=6\nQ35 REWRITTEN S054 cells=7\nQ35 REWRITTEN S055 cells=6,7\nQ35 REWRITTEN S061 cells=7\nQ35 REWRITTEN S073 cells=7\nQ35 REWRITTEN S076 cells=7,11\n"
P1U="Q35 rewritten=1 removed=0 base=2b2bf7bbdedaff3f0c749a8703002bebb104d15c tip=269dadb6a56744531bd1201e5944185e96ff6a4c\nQ35 REWRITTEN S076 cells=11\n"
Exact observed stderr values:
E0="Q35 rows base=77 tip=77 compared=77 frozen_cells=1 2 3 4 5 6 7 9\n"
ET="Q35 rows base=77 tip=77 compared=77 frozen_cells=1 2 3 4 5 6 9\n"
EO="Q35 rows base=77 tip=77 compared=77 frozen_cells=1 2 3 4 5 6 7\n"
EU="Q35 rows base=77 tip=77 compared=77 frozen_cells=1 2 3 4 5 6 7 9 11\n"
Mutation point and before/mutant/after SHA-256 (line numbers refer to pristine checker):
M1: omit teaches: FROZEN_FIELDS removes 8; FROZEN_CELLS removes 7 (lines 80-81); before=H0; mutant=37c274c2ec9d8897c2c3960c05a948a1e0de76b6ffaf3067a62560736f298c8e; after=H0.
M2: omit opened: FROZEN_FIELDS removes 10; FROZEN_CELLS removes 9 (lines 80-81); before=H0; mutant=aa78177c01c370e12dffb7b71d5bc1ae4bdeb67dcb58c73276688aca8913e87d; after=H0.
M3: compare used-by too: FROZEN_FIELDS adds 12; FROZEN_CELLS adds 11 (lines 80-81); before=H0; mutant=bdd8cf9ca0c3d2bf9d05981e5dec53f518519b14d20a5dcfb1d0c6249b34faac; after=H0.
M4: ignore removed rows: delete m++ and REMOVED emission; retain continue (lines 129-130); before=H0; mutant=6fa33482c1044123e6f359e60b011fd492a7509f9f6909b3853a944b04c395b2; after=H0.
M5: always succeed after comparison: replace awk END exit expression with exit 0 (line 147); before=H0; mutant=611a334b074ca8ffc51849d888d3df5a68a2b60a0b16bf6e3ddf3404b973d23b; after=H0.
Actual run ledger: stage | N: exit,stdout,stderr | P: exit,stdout,stderr. Command definitions above apply to every entry.
pristine | N: 1,N13,E0 | P: 0,P0,E0
M1-skip-teaches | N: 1,N7,ET | P: 0,P0,ET
R1-restored | N: 1,N13,E0 | P: 0,P0,E0
M2-skip-opened | N: 1,N13,EO | P: 0,P0,EO
R2-restored | N: 1,N13,E0 | P: 0,P0,E0
M3-compare-used-by | N: 1,N13U,EU | P: 1,P1U,EU
R3-restored | N: 1,N13,E0 | P: 0,P0,E0
M4-ignore-removed | N: 1,N13,E0 | P: 0,P0,E0
R4-restored | N: 1,N13,E0 | P: 0,P0,E0
M5-exit-zero | N: 0,N13,E0 | P: 0,P0,E0
R5-restored | N: 1,N13,E0 | P: 0,P0,E0
Receipt sensitivity: M1 KILLED by N (7 rewrites, not 13); P would not catch it. An exit-status-only N receipt would miss M1.
M2 SURVIVED N and P: omitting opened left both requested counts/statuses unchanged. Its changed frozen_cells stderr is not evidence that an opened rewrite was behaviorally detected.
M3 KILLED by P (1 rewrite, exit 1): S076 cells=11 is a false rejection of mutable used-by. N retains 13/exit 1, though its S076 diagnostic additionally says cells=7,11.
M4 SURVIVED N and P with byte-identical outputs/statuses: both comparisons have removed=0, so these receipts do not exercise row deletion.
M5 KILLED by N (13 rewrites but exit 0); P would not catch it. A count-only N receipt would miss M5.
Survivors are coverage findings, not a contract change. These historical receipts expose teaches sensitivity, mutable used-by, and failure exit status, but not opened-only rewrites or missing rows.
Restoration: R1-R5 each measured H0 and reran N/P; each restored stdout, stderr, and status exactly matched pristine. Final source and scratch hashes both equal H0.
Process cleanup command after each of 22 detector invocations and after cloning: `pgrep -af '[/]fast/scratch/hyaku/kumitate-r47/seats/w2-MutQ35'` -> exit=1 stdout="" stderr="" in all 23 checks; no matching process remained.
No tools installed or updated. No lane git/jj writes, sibling changes, source edits, or host-state changes.
