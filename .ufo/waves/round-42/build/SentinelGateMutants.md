RESULT SentinelGateMutants rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=exploitable requirements=35

Security review of "run mutated copies of lane scripts as a checklist gate", against the round-41
reference implementation `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (the shape the
plan's `scripts/gate-mutants.mjs` will inherit: `git archive <rev> scripts | tar -x -C tmp`, mutate
in place, `spawnSync(execPath, [file,'--selftest'], {timeout: 600_000, maxBuffer: 64 MiB})`).
All probes ran in my own clone at `b237e3f09c9559e130c7367bd2efa981c4ea516f` (scratch
`/fast/scratch/hyaku/kumitate-r42/seats/SentinelGateMutants/`, `TMPDIR` inside scratch, clone
restored clean afterwards, 0 leftover processes, 0 leftover temp dirs). No lane, fleet, operator or
host state was written; no tool installs. Trust boundary: the measured revision's tree is
*untrusted input* to a runner that executes its content, so every path, mode, environment and
process limit below is an attacker-reachable surface, not hygiene.

## Confirmed exploit paths (severity, evidence)

S1 fabricated readiness — the reference pattern reads 16/16 killed with zero mutations.
`cite-check.mjs:2458-2459` reads `KUMITATE_CITE_SELFTEST_INJECT_FAIL` from the environment (only
inside `selfTest()`; `wave-census.mjs:190` reads `KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL`).
Neither the reference probe nor its selftest children scrub the environment, so a parent shell that
exports that variable flips every run to failure and every mutant to "killed":

    $ KUMITATE_CITE_SELFTEST_INJECT_FAIL=1 node lane/scripts/cite-check.mjs --selftest   # lane at b237e3f
    FAIL  injected failing case (child run only) — KUMITATE_CITE_SELFTEST_INJECT_FAIL=1
    73/74 cases passed (hermetic)          VERDICT: FAIL          exit=1  (clean run: 75/75, VERDICT: PASS, exit=0)
    $ KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL=1 node lane/scripts/wave-census.mjs --selftest
    WAVE_CENSUS_SELFTEST: 25/26 pass       VERDICT: FAIL          exit=1
    $ KUMITATE_CITE_SELFTEST_INJECT_FAIL=1 node probe.mjs --lane lane --rev b237e3f09c9559e130c7367bd2efa981c4ea516f
    CONTROL unmutated FAIL exit=1 cases=73/74 fail_lines=1
    CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=FAIL rev=b237e3f09c9559e130c7367bd2efa981c4ea516f
    (16 `MUTANT <id> killed` lines)                                       exit=0

Impact: a reader (or a gate that only tests `survived === 0`) sees a clean manifest for a run in
which no mutation was ever scored. Only the control check stands between pollution and a false
CLEAN, so the control must be mandatory and must itself be exit-2-fatal (R21-R23, R28).

S1 arbitrary-path truncation outside the temp dir — option injection through `--rev`.
The reference passes `--rev` straight into a shell string as `git -C "$0" archive "$1" scripts`; the
quoting stops shell parsing but not git's own option parsing:

    $ git -C lane archive --output=/fast/scratch/.../existing.txt scripts   # what `--rev --output=…` becomes
    fatal: not a valid object name: scripts            exit=128
    $ stat -c %s existing.txt        # before 63   after 0        <-- truncated to zero bytes
    $ git -C lane archive --remote=/nonexistent/repo scripts
    remote: fatal: '/nonexistent/repo' does not appear to be a git repository   (remote/network mode entered)

Impact: `node scripts/gate-mutants.mjs --rev '--output=/home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md'`
destroys a lane file (data loss), and `--remote=<url>` sends the gate to a remote repository. The
probe still exits 2 ("archive failed"), so the side effect is silent (R1-R2, R33).

S2 write through a symlink outside the temp dir. `git archive` materialises a tree entry of mode
120000 as a symlink, and `readFileSync`/`writeFileSync` follow it:

    $ git -C lane ls-tree HEAD scripts/cite-check.mjs
    120000 blob 91615887c08678512ae538c08bca3f56509df7d1	scripts/cite-check.mjs
    $ node probe.mjs --lane lane --rev e143e4af…        # victim.mjs is a copy of the real source, outside the temp dir
    CITE_MUTANTS survived=0/16 nomatch=0 crash=16 control=FAIL rev=e143e4afc933fc0af69e36fdba229c089ce9680c
    victim.mjs mtime changed: True (delta 16089969966 ns)      exit=0

Impact: the gate rewrites a caller-chosen file (content = that file with one literal replaced) and
runs a foreign path as the mutant copy, while still printing a `survived=0` summary and exit 0
(R8-R9). The symlink also silently degrades classification to `crash=16` + `control=FAIL` (R26-R28).

S2 unbounded block on a non-regular target. A tree entry of mode 120000 pointing at a FIFO makes the
target read block forever; the reference's 600 s timeout covers only the selftest child:

    $ timeout -s INT 5 node probe.mjs --lane lane --rev d0fa2381…     # scripts/cite-check.mjs -> fifo.mjs
    probe exit=124 (killed by my harness; the probe has no self-timeout and no signal handler)
    leftover temp dirs: 1   (tmp/kumitate-cite-mutants-*/scripts/{anchor-truth,cite-check,claims-check,…})

Impact: one hostile or accidental tree entry hangs the whole gate indefinitely, and the interrupted
run leaves its copy behind (R10, R12, R15).

S2 orphan growth — `spawnSync` timeout kills only the direct child. Measured with a child that spawns
`sleep 611` and idles:

    $ node exp/runner_bad.mjs     # spawnSync(node,[child],{timeout:1200})
    bad-runner status=null signal=SIGTERM error=ETIMEDOUT     surviving grandchildren: 1
    $ node exp/runner_good.mjs    # detached:true + process.kill(-pid,'SIGKILL')
    good-runner child exited                                   surviving grandchildren: 0

Impact: a mutant whose selftest forks (round 41: 46 processes and 3.2 GB in 10 s) keeps running after
the gate has moved on; nothing reaps it and nothing reports it (R14, R16, R19).

Observed live on this host while this review ran (read-only `pgrep`/`free`, no process touched):
a sibling seat's mutant run against the same gate recursed unbounded because its own guard failed —
`sh …/RevengerGuardIntent/guard41/run41.sh red-outer2 UNSET 20 …/m-outer2/scripts/cite-check.mjs`
(pid 1891445) held 380 → 491 → 499 `cite-check.mjs --selftest` processes over about two minutes,
sum of RSS 25.3 GB, with `free -m` showing 21737 MB used / 9241 MB available and 3.9 GB of swap in
use. Nothing killed the group; the harness's own threshold argument never fired. The L1 stopped it on
my report (`pkill -9 -f 'guard41/m-outer2/scripts/cite-check.mjs'`); my own re-measurement after that
read 0 processes for that path and `free -m` 8954 MB used / 22023 MB available. This is the same
failure the requirements above close, measured on a real runner rather than argued: a guard that is
checked inside the runaway tree, or that is not a process-group kill, does not bound the run.

S2 environment injection of code into every mutant run.

    $ NODE_OPTIONS='--require /fast/scratch/.../exp/preload.cjs' node -e 0   → exit 0, marker file written

Impact: any inherited `NODE_OPTIONS`/`NODE_PATH` executes attacker-chosen code inside each spawned
selftest; combined with S1 the classification is attacker-controlled (R23).

S3 silent wrong-repository measurement — a polluted `GIT_DIR` redirects the gate's git child:

    $ GIT_DIR=/nonexistent/repo.git git -C lane archive b237e3f scripts
    fatal: not a git repository: '/nonexistent/repo.git'

Impact: with `GIT_DIR` pointing at a real repository the gate would hash and mutate bytes that are
not the measured lane's, while the header claims the lane revision (R3, R6).

S3 archive/extraction is not the tree. `git archive` honours `.gitattributes` export filters and
`tar` recreates whatever modes the archive holds, so the file set the gate measures can differ from
the revision's:

    $ printf 'scripts/cite-check.mjs export-ignore\n' > lane/.gitattributes   # committed
    $ git -C lane ls-tree -r --name-only HEAD scripts | wc -l   → 9
    $ git -C lane archive HEAD scripts | tar -t | grep -c cite-check   → 0
    (clean revision: member set == ls-tree set, diff empty; a symlinked tree entry extracts as a symlink)

Impact: a single committed attribute line makes all 16 cite-check ids `nomatch` (exit 2 if R29 holds,
otherwise a silent skip), and the extraction itself has no realpath or size confinement (R5, R7, R11).

## Requirements for `scripts/gate-mutants.mjs` (35; each closes a measured path above)

A. measured revision, git access (no checkout, no option injection)
R1 Validate `--rev` before it reaches git: `git -C <lane> rev-parse --verify --end-of-options "<rev>^{commit}"`
  (verified: resolves `b237e3f…` to the full sha; rejects `--output=/tmp/x^{commit}` with `fatal:
  Needed a single revision`), require a 40-hex result, and use only the resolved sha afterwards.
R2 Every git child runs from an argv array (`spawnSync('git', [...])`); never `sh -c` with an
  interpolated command line, and never a shell pipeline whose earlier stage's status is unobserved.
R3 Scrub the git child environment to an allow-list: delete `GIT_DIR`, `GIT_WORK_TREE`,
  `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_COMMON_DIR`,
  `GIT_CEILING_DIRECTORIES`, `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`; set `GIT_OPTIONAL_LOCKS=0`,
  `GIT_TERMINAL_PROMPT=0`, `GIT_CONFIG_NOSYSTEM=1`, `HOME=<fresh empty dir in the temp root>`.
R4 Read objects only: `ls-tree`, `cat-file`, `show`, `archive --end-of-options` (verified exit 0).
  Never `checkout`, `worktree add`, `stash`, `reset`, `clean`, `add`, `commit`, or anything that can
  refresh the index, in the measured lane.
R5 Do not use `git archive | tar -x` for the copy. Preferred: `git ls-tree -r <rev> scripts` for the
  member list and `git show <rev>:scripts/<f>` for bytes (verified: 2674 lines for the target, no
  extraction). If archive+tar is kept, require (a) the extracted regular-file set to equal the
  `ls-tree` set, (b) every member mode to be 100644/100755 (reject 120000/160000 and anything else),
  (c) explicit `tar --no-same-owner --no-same-permissions -C <tmp>`.
R6 Record the resolved revision and, per target, the sha256 of the pre-mutation bytes (R41-7); re-hash
  after the run to prove the copy was restored, and hash the lane's own `scripts/<target>` before and
  after and require equality — the measured lane tree is never written.

B. temp root and file identity (symlink, FIFO, realpath)
R7 Create the copy root with `mkdtempSync` inside `TMPDIR` (verified mode 0700), then assert
  `mode & 0o777 === 0o700` and `realpath(tmp) === tmp`; require the temp root's parent to be
  caller-owned and not world-writable; never a fixed name in a shared directory.
R8 Reject a target whose `lstat` is not a regular file, whose `nlink !== 1`, or whose `realpath` is not
  inside `realpath(tmp)`; this is the check that stops the mode-120000 write-through above.
R9 Open the mutated file with `O_NOFOLLOW` (`fs.openSync(p, fs.constants.O_WRONLY | O_NOFOLLOW)`) or
  re-`lstat` immediately before every write; never `writeFileSync(path)` on a tree-derived path.
R10 `stat` the target first and require a regular file of at most 4 MiB, and read the bytes under a
  deadline; a non-regular target is `nomatch`-class refusal, never a blocking read.
R11 Cap the extraction before it happens: at most 512 `ls-tree` entries and 32 MiB of blob bytes;
  refuse a larger tree (round-41 growth: 3.2 GB).
R12 Remove the copy in a `finally` and also from `SIGINT`/`SIGTERM`/`SIGHUP` handlers (kill the group,
  remove the temp root, re-raise); report `leftovers=0`. A bare `finally` is not enough: a SIGINT
  during a run left one `kumitate-cite-mutants-*` copy behind (observed).
R13 Keep every temp artifact outside the measured lane and outside the fleet repo; the gate's only
  writes are under its own temp root.

C. process group, deadline, orphan reaping
R14 Spawn each selftest `detached: true` (own group/session) and kill the group on expiry
  (`process.kill(-child.pid,'SIGKILL')`), then reap via the exit callback; `spawnSync`'s `timeout`
  alone leaves grandchildren alive (measured 1 survivor vs 0 with the group kill).
R15 Per-mutant deadline ≤ 60 s (lane rule), covering extraction, target read and selftest — not the
  reference's 600 s; exceeding it is `timeout`, never a kill.
R16 After each mutant assert the group is empty (`process.kill(-pid, 0)` throws `ESRCH`); any survivor
  is `leftovers` → exit 2 with a named receipt line, and the final line reports `leftovers=0`.
R17 Run mutants strictly serially under a global wall-clock cap; abort with exit 2 when the cap is hit.
R18 Bound child output (`maxBuffer` ≤ 1 MiB) and treat `ENOBUFS` as `overflow` → exit 2, not a kill
  (the reference allows 64 MiB per run).
R19 Bound child memory and forks: pass `--max-old-space-size`, run under a wrapper applying
  `ulimit -u`/`ulimit -v`, and kill the group when a descendant-count or RSS threshold is crossed.
R20 Recursion guard: set exactly one marker variable in the child environment (for example
  `KUMITATE_GATE_MUTANTS_CHILD=1`) and make gate-mutants refuse the manifest when it is present, so a
  copy's selftest can never re-enter the gate; assert no other `KUMITATE_*` key is present.

D. environment scrubbing (mandatory, not hygiene)
R21 Build the child environment from an allow-list, never from `process.env`: `PATH=/usr/bin:/bin`,
  `LC_ALL=C`, `LANG=C`, `TMPDIR=<per-mutant dir>`, `HOME=<fresh empty dir>`, plus the R20 marker; then
  assert no key matching `^(KUMITATE_|UFO_|KIMI_|NODE_|npm_config_|GIT_|SSH_|AWS_)`.
R22 The concrete reason: `KUMITATE_CITE_SELFTEST_INJECT_FAIL` and
  `KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL` are read by the two measured gates' selftests, and an
  inherited one turns 16/16 (and 25/25) mutants into "killed" with zero mutations while the reference
  still exits 0 (receipts above).
R23 Drop `NODE_OPTIONS`, `NODE_PATH`, `NODE_EXTRA_CA_CERTS`, `NODE_COMPILE_CACHE`, `NODE_V8_COVERAGE`,
  `NODE_DEBUG`: an inherited `NODE_OPTIONS=--require …` executes that file inside every mutant run
  (verified).
R24 Never resolve the interpreter or any helper through `PATH` with a cwd inside the extracted tree:
  use the absolute `process.execPath`, and run the selftest with cwd set to a dedicated empty
  directory inside the temp root (not the extracted `scripts/`).

E. classification and verdict integrity
R25 Killed means the copy's selftest observably failed: exit ≠ 0, OR a `VERDICT: FAIL` line, OR ≥ 1
  `FAIL ` case line, OR passed < ran. The plan's "exit non-zero with a `VERDICT: FAIL` line" is wrong
  against its own frozen manifest — the receipts record killed mutants with exit 0
  (`M19-selftest-exit-const killed exit=0 … VERDICT: FAIL`, `V387-exit-const killed exit=0`,
  `V382-pass-count killed exit=0`), which that literal predicate would score as survived.
R26 Require the `N/M cases passed` line to parse; its absence is `crash`. `crash`, `timeout`,
  `overflow` and `nomatch` are never kills and each forces exit 2 (the reference still exits 0 with
  `crash=16`).
R27 Require the mutant's ran-case count to equal the control's; a mutant that silently drops cases is
  not "survived", and any mismatch is exit 2.
R28 Run the control (unmutated copy) first, in the same temp copy, same environment, same limits, and
  require exit 0 + `VERDICT: PASS` + passed === ran; any other control result is exit 2 and no CLEAN
  line may be printed (this is the single guard against S1).
R29 `nomatch` (occurrence count ≠ 1, counted on the same bytes that are hashed for the header) is exit
  2; reject a manifest entry with `from === to`, empty `from`, `from` containing NUL, or `to`
  containing `from`.

F. manifest as data, header, self-test
R30 Treat the manifest as data only: no `eval`, no `new Function`, no interpolation into a command
  string, no `import`/`require` of the mutated file in the runner process; spawn with argv arrays and
  a fixed target→path map.
R31 Validate each target id against `^[a-z][a-z0-9-]*$` and build the path as
  `join(tmp,'scripts', id + '.mjs')`; never take a path from manifest text (`../..` or an absolute
  path would escape the temp root).
R32 Header: the measured revision (resolved sha, or `working-copy`), each target's pre-mutation sha256,
  and the manifest digest (sha256 of the canonical manifest JSON) so "frozen" is checkable; per mutant
  `MUTANT <target>:<id> killed|survived|nomatch|crash|timeout|overflow`.
R33 Exit codes: 0 only for `GATE_MUTANTS: CLEAN` with 41/41 killed, control PASS and `leftovers=0`; 1
  for `SURVIVED`; 2 for nomatch/crash/timeout/overflow/control failure/leftovers/integrity failure;
  64 for usage, with no temp dir, no git call and no child spawned.
R34 `--selftest` is hermetic and bounded (≤ 60 s): a tiny fixture manifest and fixture gate in its own
  temp dir, never the lane tree and never the 41-mutant manifest, with negative cases proving each
  guard fires — option-like `--rev` rejected, symlink/FIFO target refused, timeout killed by group with
  `leftovers=0`, polluted environment scrubbed, control failure → exit 2, nomatch → exit 2, and the
  R25 classification of an exit-0-with-`VERDICT: FAIL` kill.
R35 The gate writes nothing inside the lane repo or the fleet repo and reads no operator config; all
  writes are under its own temp root.

## Scope and limits

Reviewed surface: the running of mutated copies (extraction, mutation, execution, classification) in
the shape the round-41 reference establishes. Not reviewed: the mutant literals themselves, the
proxy/SKILL checklist wording, C2, or any other seat's deliverable. All exploit paths above were
demonstrated on my own clone or on synthetic fixture commits inside my own clone; nothing was run
against the lane, the fleet repo, operator config or host state. Handoff to C1's implementer: R1-R35
are the acceptance surface for `scripts/gate-mutants.mjs`; R21-R23, R25-R28 and R33 are the
readiness-critical set (they are what stands between a polluted or hostile tree and a false CLEAN).
