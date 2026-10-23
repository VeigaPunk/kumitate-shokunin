RESULT CtlQ31GuardShortcut rev=a2e5b54c verdict=rejects p44d_fails=4/4 comment_passes=yes envpass_passes=no fails_when_catches=yes
Axes: operability and detector coverage. Verdict `rejects` means full Q31 rejects these candidates; pass fields refer to the complete four-grep block, not one grep.
Revision command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD`; output: `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`.
Draft inspected: `/fast/scratch/hyaku/kumitate-r45/a2/inherited-tracked.diff:87-113`; results independently re-derived, not inherited receipts.
Scratch S: `/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ31GuardShortcut`.
Source command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 32b7fd56:.ufo/waves/round-44/probe/p44d-count.mjs`; captured exact 27,129 bytes as `S/p44d-count.mjs`.
Source SHA-256: `9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e`.
Detector: `S/q31-guards.sh`; `F=$1` followed by this unchanged draft block:
```sh
bad=0
grep -q 'env:' "$F" || { echo 'Q31: FAIL explicit launcher environment'; bad=1; }
grep -Eq 'MemoryMax=|memory\.max|cgroup|counter-sandbox' "$F" || { echo 'Q31: FAIL native-memory cgroup'; bad=1; }
grep -Eq 'TOTAL_BUDGET|totalBudget|deadline|--budget' "$F" || { echo 'Q31: FAIL verdict-preserving total budget'; bad=1; }
grep -Eq "process\.on.*SIG(TERM|INT)|trap .*(TERM|INT)" "$F" || { echo 'Q31: FAIL signal cleanup handler'; bad=1; }
test "$bad" -eq 0
```
Exact detector command, used for all five runs:
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 /bin/sh /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ31GuardShortcut/q31-guards.sh /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ31GuardShortcut/p44d-count.mjs`
(a) Pristine output, exit 1:
```text
Q31: FAIL explicit launcher environment
Q31: FAIL native-memory cgroup
Q31: FAIL verdict-preserving total budget
Q31: FAIL signal cleanup handler
```
(b) Added only four comments immediately after the shebang: `// env:`, `// MemoryMax=`, `// TOTAL_BUDGET`, `// process.on SIGTERM`. No executable behavior changed. Saved as `S/p44d-comments.mjs`.
(b) Output: empty stdout and stderr; exit 0. All four greps pass. Comments-only shortcut survives the source guards.
(b) Mutated SHA-256: `4e04cc136a177f9c2fa7cb31d59e38df19020503ba337e468c6593e8e2c5d75b`.
Restored after (b): removed exactly those comments; same detector printed the four lines in (a), exit 1, empty stderr.
(c) Independently started from pristine and added only `env: process.env, ` to the `spawnSync('bwrap', args, { ... })` options at original line 375. Saved as `S/p44d-envpass.mjs`.
(c) Output, exit 1, empty stderr:
```text
Q31: FAIL native-memory cgroup
Q31: FAIL verdict-preserving total budget
Q31: FAIL signal cleanup handler
```
(c) Environment grep passes despite explicitly selecting the host environment; the other three greps fail. Thus `envpass_passes=no` for the full block, but yes for its environment guard. The option's runtime effect was not executed in this probe.
(c) Mutated SHA-256: `217edcffd1870a65a1bfa6b423b003d13f57bd0acab0845ea5420992ecbf594f`.
Restored after (c): removed exactly the added option; same detector printed the four lines in (a), exit 1, empty stderr.
Hash commands: `sha256sum /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ31GuardShortcut/p44d-count.mjs` after each mutation and restoration; final invocation also named `S/q31-guards.sh` using its absolute path.
Both restoration hashes exactly match the source SHA-256 above. Detector SHA-256: `2fb88b1b96296f369bc5e29661d9dc9e9d1e118ea59f644a362a8760e889a36e`.
Full-Q31 interpretation: YES, as written it rejects both (b) and (c) without a qualifying runner selftest receipt. Lines 106-109 require the actual runner's behavioral selftest, planting a marker and reading `/proc/1/environ`, in addition to the greps. Missing or non-PASS receipt is independently fatal. Candidate (c) also fails three source guards.
The existing p44d `selftest` (original lines 323-358, invoked at 397 before sandbox execution) checks verdict predicates and case generation; it does not launch bwrap or perform that marker check. A generic `VERDICT: PASS` from it would not be the specified behavioral receipt.
No behavioral runner selftest or `/proc/1/environ` marker probe was run here; marker leakage is unverified. This is a measured source-guard bypass and a text-grounded full-criterion rejection, not a measured full-Q31 pass or a killed behavioral mutant. Pristine was already rejected, so its failing exit cannot establish a mutant kill.
After each of the five runs: `pgrep -af /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ31GuardShortcut`; output empty, exit 1. No process tree remained; no large temporary files were created.
Receipts: `S/pristine-receipt.txt`, `S/comments-receipt.txt`, `S/restored-comments-receipt.txt`, `S/envpass-receipt.txt`, `S/restored-envpass-receipt.txt`. Active counter restored byte-for-byte; named mutant copies retained as probe evidence.
Tools: no installations or updates. Observed git 2.56.0, bash 5.3.20, systemd 262. Incidental `timeout --version` returned 125 with missing-COMMAND usage; the requested bounded timeout command executed on every detector run.
