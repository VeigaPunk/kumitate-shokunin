# ExecMutants

Axes: **operability** (the `/tmp` guard prevents host re-exposure) and **coverage** (the mutant run distinguishes the refusal from an unguarded path).

## Scratch variants

Read the frozen G50 counter before testing: `bindguard50-probe.mjs` lines 81–89 requires `--bind` refusals for `/tmp` and the other listed paths. Lane revision was `378b6e732a1a40ae8adfcaaa5de352cee5163cf0`; `git status --short` was empty. Both variants were extracted with `git archive` into `/tmp/r50-execmutants.aouSBS/{guarded,unguarded}`; the lane checkout was not edited.

The archived guarded bytes already contain the `/tmp` refusal in `bad()` (`p === '/' || p === '/tmp' || ...`). The unguarded mutant differs only by deleting `|| p === '/tmp'`:

```diff
-const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
+const bad = (p) => p === '/' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
```

SHA-256:

```text
64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672  guarded/scripts/cap-run.mjs
7143177decc07e5dde8ace6fadbe550ef2c030d203926ffcb0bcd2eb751b0b80  unguarded/scripts/cap-run.mjs
```

## (a) Unguarded `/tmp` bind

Exact requested payload, against the unguarded copy:

```sh
cd /tmp/r50-execmutants.aouSBS/unguarded
node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind /tmp -- node -e 'require("fs").writeFileSync("/tmp/r50proof-$$","x")'
```

Observed output:

```text
node[2]: pthread_create: Resource temporarily unavailable
CAP_RUN: EXIT code=0 unit=cap-run-3668400-1792788347831-2c1007
UNGUARDED_EXIT=0
UNGUARDED_HOST_FILE=absent path=/tmp/r50proof-$$
```

Thus the exact task-limit-8 Node run did **not** prove a host write: Node reported thread creation failure. Successful host-write controls on the same unguarded copy:

```sh
cd /tmp/r50-execmutants.aouSBS/unguarded
node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind /tmp -- /bin/sh -c 'printf x > /tmp/r50proof-shell'
```

```text
CAP_RUN: EXIT code=0 unit=cap-run-3855863-1792788379301-c358d0
SHELL_EXIT=0
SHELL_HOST_FILE=present bytes=1
```

Node with the requested payload and a larger task limit also wrote through the bind:

```sh
cd /tmp/r50-execmutants.aouSBS/unguarded
node scripts/cap-run.mjs --mem 64 --tasks 32 --budget 10 --bind /tmp -- node -e 'require("fs").writeFileSync("/tmp/r50proof-node32","x")'
```

```text
CAP_RUN: EXIT code=0 unit=cap-run-3855866-1792788379302-303ce9
NODE32_EXIT=0
NODE32_HOST_FILE=present bytes=1
```

For an additional Node run retaining `--tasks 8`, passing thread-pool settings through cap-run's supported `--env` options allowed the same bind write:

```sh
cd /tmp/r50-execmutants.aouSBS/unguarded
node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --env NODE_OPTIONS=--v8-pool-size=1 --env UV_THREADPOOL_SIZE=1 --bind /tmp -- node -e 'require("fs").writeFileSync("/tmp/r50proof-node8-tuned","x")'
```

```text
CAP_RUN: EXIT code=0 unit=cap-run-3877008-1792788399926-0b1290
NODE8_TUNED_EXIT=0
NODE8_TUNED_HOST_FILE=present bytes=1
```

The successful controls establish that the unguarded `/tmp` bind re-exposes host `/tmp`; the unmodified exact task-limit-8 Node command is inconclusive on this host because of its observed thread-creation failure.

## (b) Guarded copy

```sh
cd /tmp/r50-execmutants.aouSBS/guarded
node scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind /tmp -- node -e 'require("fs").writeFileSync("/tmp/r50proof-$$","x")'
```

```text
CAP_RUN: USAGE --bind refuses "/tmp" (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)
GUARDED_EXIT=64
GUARDED_HOST_FILE=absent path=/tmp/r50proof-$$
```

Host marker cleanup was confirmed after each run: `/tmp/r50proof-$$`, `/tmp/r50proof-shell`, `/tmp/r50proof-node32`, `/tmp/r50proof-node8-tuned`, and `/tmp/r50-node-direct` all reported `CLEAN`.

No tools were installed. No lane files other than this report were written.