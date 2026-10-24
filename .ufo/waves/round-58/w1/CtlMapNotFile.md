# CtlMapNotFile — kumitate round 58 / w1

Axes: operability, coverage. Date: 2026-10-24.

**Result: CORROBORATED.** At measured integration revision `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1), a `covered` entry naming a real directory under `corpus/lessons/` produced the required `README_MAP: DRIFT` with `first=covered-not-file:lessons/ctlmapnotfile.md` and exit `1`. The gate's stderr was empty. This falsifies acceptance of a directory-valued `covered` member under the v2 gate.

## Revision and sandbox binding

The seat ran exactly:

```console
$ git clone --no-hardlinks file:///home/vgpnk/Projects/shokunin/kumitate-shokunin /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapNotFile/lane
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapNotFile/lane checkout --detach 6affb9ebde37b7d663658f1959d64f0f0b68f480
```

Both commands exited `0`; their complete streams are retained in `01-clone.*` and `02-checkout-r1.*`. `git rev-parse HEAD` printed R1 before the probe and again after it. A path-limited `git diff --exit-code 6affb9ebde37b7d663658f1959d64f0f0b68f480 -- scripts/readme-map.mjs` exited `0` with empty stdout/stderr, confirming that the executed gate bytes were unchanged from R1.

## Baseline — observed

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapNotFile/lane`

```console
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=138 rows=138 covered=138
```

Exit: `0`. Stderr: empty. This establishes a clean R1 control before mutation.

## Directory mutation — observed

Only the sandbox clone was mutated:

- Created `corpus/lessons/ctlmapnotfile.md/` as a directory. `stat --format='%F %n' <path>` exited `0` and identified it as `directory`.
- Appended `lessons/ctlmapnotfile.md` to `covered` in the scratch `.ufo/pins/readme-map.json`.
- Added the matching scratch README row, mirroring the gate's own `covered-not-file` selftest fixture. This prevents an unrelated missing-row finding from preceding the arm under test and isolates the directory defect.

The uncommitted scratch diff is captured in `07-mutation-diff.stdout.txt`; `git status --short` reported only the scratch registry and README as modified. No commit was created.

## Mutated gate — observed

cwd: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlMapNotFile/lane`

```console
$ node scripts/readme-map.mjs
README_MAP: DRIFT files=139 rows=139 covered=139 bad=1 first=covered-not-file:lessons/ctlmapnotfile.md
```

Exit: `1`. Stderr: empty. The counts each increased by exactly one from baseline, and `bad=1` shows that the targeted directory arm was the sole reported finding.

## Evidence and scope

Full command lines, working directories, separate stdout/stderr captures, and exit codes are under `.ufo/waves/round-58/build/CtlMapNotFile/`:

- `00-driver.*` and `run_probe.py` — executable probe driver and its observed status.
- `01-clone.*`, `02-checkout-r1.*`, `03-head.*`, and `11-final-head.*` — sandbox and revision binding.
- `04-baseline-gate.*` — clean R1 baseline.
- `05-mutation.txt`, `06-directory-stat.*`, `07-mutation-diff.*`, and `08-status.*` — mutation shape and scratch diff.
- `09-directory-gate.*` — required DRIFT output and exit `1`.
- `10-gate-bytes-unchanged.*` — executed gate comparison against R1.
- `result.json` — machine-readable observed summary.

This seat exercised only the assigned directory-valued `covered` control. It did not run either frozen counter and makes no broader `ATTEST58_HELD` or `DOCTRINE58_HELD` claim. No production lane file, fleet file, sibling repo, jj state, or source-lane Git index was changed. Writes were confined to this report and `build/CtlMapNotFile/`; Git mutations were limited to the permitted sandbox clone/checkout. No commit, push, install, pacman transaction, seat dispatch, or subagent spawn occurred.

Report: .ufo/waves/round-58/w1/CtlMapNotFile.md
