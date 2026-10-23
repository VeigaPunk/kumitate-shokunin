# ExecSelftestArm

## Design

Axes: **coverage** (the refusal path is explicitly exercised) and **operability** (no new launch hook or production configuration is needed).

At lane HEAD `6927903f99bbc26e397aa47387aa76950f42b3a5`, `scripts/cap-run.mjs` already contains both the `/tmp` refusal and the usage-loop case at line 317. The usage case to retain/add among the other refusal inputs is:

```js
[...lim(), '--bind', '/tmp', '--', 'true'],
```

The surrounding usage loop requires exit 64 and a `CAP_RUN: USAGE` verdict. This is necessary coverage, but it only inspects the returned status and last usage line; it does not detect a deceptive implementation that emits that line and still runs the requested child.

**Recommendation:** include a separate spawned-child sentinel as a second selftest case, not a production `bwrap` interception seam. It writes only into the selftest's private `W` directory if the child runs, and checks the usage result plus marker absence. This catches a refusal-output-plus-child-execution regression. It does not directly prove that `systemd-run`/`bwrap` was never started if execution stops before the child; proving that exact syscall would need a launch seam or executable interception, which is not justified for this parser guard. The parser currently calls `usage()` (which exits 64) before `run()` can launch `systemd-run`.

Exact additional scratch-only arm:

```js
  {
    const marker = join(W, `bindtmp_${hex()}`);
    const r = cap([...lim(), '--bind', '/tmp', '--', 'node', '-e',
      `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'started')`]);
    const why = [];
    if (r.status !== 64) why.push(`exit=${r.status}`);
    if (!/^CAP_RUN: USAGE /.test(r.last)) why.push(`verdict=${JSON.stringify(r.last)}`);
    if (existsSync(marker)) why.push('child_started');
    check('--bind /tmp refuses before child execution', why);
  }
```

## Scratch execution and retained evidence

Scratch archive: `/tmp/kumitate-r50-execselftest.pycgx8` from lane HEAD above. No lane implementation file was edited. The scratch `scripts/cap-run.mjs` SHA-256 with the `/tmp` usage case restored was `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`, matching the archived lane file. No tools were installed.

Commands run: `node scripts/cap-run.mjs --selftest` from the scratch directory in each state.

- **Before**: scratch-only removal of the `/tmp` usage-loop entry (the other HEAD bytes, including the guard, stayed unchanged): 12/12 pass, 0 fail, `VERDICT: PASS`.
- **After usage arm**: restore the `/tmp` entry: 12/12 pass, 0 fail, `VERDICT: PASS`.
- **After spawned-child sentinel**: add the exact additional block above: 13/13 pass, 0 fail, `VERDICT: PASS`.

The first two runs passed all 12 existing cases: usage refusals, exit/stdout, writable cwd, verdict-file/stderr, legal bind, environment isolation, PID namespace, OOM, liveness, budget, SIGTERM, and detached-grandchild cleanup. The added marker arm also passed; no existing case broke. The OOM child reported exit 137 in the first run and 143 in later runs; each was accepted by the existing nonzero/OOM assertion.

Final expanded-run output:

```text
PASS  usage arms exit 64 with CAP_RUN: USAGE
PASS  --bind /tmp refuses before child execution
PASS  exit code and stdout pass through (EXIT code=7)
PASS  runner cwd is writable to the child
PASS  --verdict-file: child stderr byte-exact, verdict line in the file (EXIT code=3, decimal budget)
PASS  --bind: a host directory outside the cwd is read-write only when bound
PASS  explicit env: --env pair arrives, GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE and marker dropped
PASS  own PID namespace: /proc/1/environ readable, planted marker and GIT_DIR absent
PASS  512 MiB Buffer child under --mem 256 dies non-zero with OOM (allocs=15, exit=143)
PASS  32 MiB Buffer child under --mem 256 finishes (liveness)
PASS  budget 2 s on a 300 s child: BUDGET, exit 124, no leftover (wall=2.042s)
PASS  SIGTERM 1.5 s into a 300 s child: SIGNAL, exit 143, no leftover (0.016s)
PASS  detached new-session grandchild is gone after the runner returns
CAP_RUN_SELFTEST: 13/13 pass
VERDICT: PASS
```
