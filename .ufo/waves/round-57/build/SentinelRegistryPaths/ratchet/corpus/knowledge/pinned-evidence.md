source: S031 https://git-scm.com/docs/git-rev-parse#Documentation/git-rev-parse.txt---verify (OPTIONS → Options for Output → `--verify`; quote: "If so, emit it to the standard output; otherwise, error out."); S032 https://reproducible-builds.org/docs/recording/ (§ Recording the build environment, paragraph before § File Format; quote: "All relevant information about the build environment should either be defined as part of the development process or recorded during the build process."); own-work `.ufo/pins/origin.json` and the round-36 baseline captures
verified-at: 2026-10-21 (S031 served page 2.56.0 = host `git version 2.56.0`; S032 Last-Modified 2026-10-19; revision `31c465f15669f744848bd9f5d56191c5085670f7` read at `/fast/scratch/kumitate-r36/src`, detached, mode 0555)
recheck: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f1…0f7`; `node scripts/proxy-check.mjs --pin .ufo/pins/origin.json | tail -1`; `node scripts/claims-check.mjs --pin .ufo/pins/origin.json | tail -1`; `node scripts/surface-probe.mjs --pin .ufo/pins/origin.json --known .ufo/pins/surface-known.json | tail -1` (2026-10-21)

# pinned evidence — the revision a verdict scored

## Why the verdict carries a revision

A verdict is evidence about bytes, and the origin tree moves. Round 35 measured
`S_MEMBERS_DRIFT declared=91 computed=88` because its pre-registered count had
been taken on a tree that advanced (`corpus/lessons/round-35.md` §Mistakes).
Round 36 opened the same way: `CHECKLIST: 11/13 pass` because items 620 and 625
resolved `--src` to the operator's working checkout, and `SURFACE_PROBE: DRIFT
(… errors=2 …)` on that checkout versus `errors=3` at the pin — two numbers for
one tree, incomparable without a revision stamp
(`.ufo/waves/round-36/baseline/{checklists,surface-default,surface-pin}.txt`).

S031 supplies the primitive: `git rev-parse --verify HEAD` emits exactly one
object name on success and errors otherwise, so "cannot verify" is a distinct
outcome rather than a zero. S032 supplies the obligation: environment identity
is either defined in advance or recorded during the run. PIN v1 does both — the
pin defines it, the verdict records it — and with no pin file the gates behave
exactly as before (portability).

## The pin file (`kumitate-origin-pin-v1`)

`.ufo/pins/origin.json` is a property of the tree being scored
(`<self>/.ufo/pins/origin.json`, resolved from `--self`, never from the process
cwd):

```json
{
  "contract": "kumitate-origin-pin-v1",
  "repo": "ufo-fsd-alpha",
  "revision": "31c465f15669f744848bd9f5d56191c5085670f7",
  "clone": "/fast/scratch/kumitate-r36/src",
  "recreate": "git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/kumitate-r36/src && git -C /fast/scratch/kumitate-r36/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/kumitate-r36/src",
  "verified_at": "2026-10-21"
}
```

`--pin FILE` overrides the default; `--src DIR` still wins over the pin's clone
but is itself asserted, so a gate cannot print the pin's revision while scoring
another tree. The stanza's `pin.<name>` keys are a different pin: script sha256,
not a source revision.

## Three outcomes, three exits

| outcome | condition | exit |
|---|---|---|
| match | `git -C <src> rev-parse --verify HEAD` equals the pin's 40-hex revision | the gate's own 0/1 (2/64 unchanged) |
| `SRC_REV_MISMATCH` | HEAD is a full 40-hex object name that differs from the pin | 2 |
| `SRC_REV_UNVERIFIABLE` | git absent, not a repository, unborn HEAD, or a value that is not 40 hex | 2 |

On match the revision rides inside the verdict line:
`CLAIMS: MATCH (… src-rev=31c465f15669)`, `PROXY: MATCH (…; src-rev=…)`,
`SURFACE_PROBE: CLEAN (… src-rev=…)`, `FIDELITY: CLEAN (… src-rev=…)`. The
comparison uses all 40 hex; 12 is display only. A mismatch is a `FAIL-CLOSED`
line with no scored terms.

## Reproduction

```sh
git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/kumitate-r36/src \
  && git -C /fast/scratch/kumitate-r36/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 \
  && chmod -R a-w /fast/scratch/kumitate-r36/src
node scripts/proxy-check.mjs --pin .ufo/pins/origin.json
```

The clone is the evidence path: cloned from the operator tree (a read),
detached, clean, `chmod a-w`; the assertion runs `git rev-parse` with
`GIT_OPTIONAL_LOCKS=0` so it takes no lock and writes nothing.

## The operator checkout is never `--src`

`/home/vgpnk/Projects/ufo-fsd-alpha` is a working tree: HEAD moves and it can
carry uncommitted bytes. The assertion names the commit, not the worktree — a
dirty tree at the pin's HEAD passes, which is why the rides-on evidence is the
clone and the recreate command. Reading the operator checkout as a measurement
source is a `Q15` defect (`corpus/QUALITY.md`).

## Pinning presupposes a tree the gate cannot mutate

The dispatcher `status` verb was the counter-example: with `cwd=<src>` and no
state redirect it mkdirs `<src>/.ufo` (`scripts/fleet-dispatcher.mjs:42,90,458`),
which fails EACCES on a `chmod a-w` clone and made the surface probe report
`SURFACE_UNREACHABLE`. `surface-probe` now spawns it with `UFO_STATE_DIR` and
`UFO_PENDING_WORK_PATH` under a `mkdtemp` removed afterwards, and pins
`NODE_COMPILE_CACHE` the same way for the sighting shim, so the origin verbs
never write into the tree they read (writable-copy fingerprint unchanged;
`build/ExecSurfaceDispatcherState.md`).

## What this entry does not claim

- The pin asserts a commit, not bytes: a dirty clone at the right HEAD passes.
  The clone is ours and `chmod a-w`; a shared clone would need a `diff-index`
  arm.
- Git's identity variables are inherited: an ambient `GIT_DIR` can point
  `rev-parse` at another repository. The gates pass an allowlisted child env
  (`PATH`, `HOME`, `LANG`, `LC_ALL`, `GIT_TERMINAL_PROMPT`, `GIT_OPTIONAL_LOCKS`)
  and never inherit `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`.
- The kimi-substrate census reads `~/.kimi-code`, not the origin tree, so it
  carries no `src-rev=`; that is the stated exception, not an omission.
- No pin means no assertion: the gate is byte-identical to its unpinned form and
  the verdict has no `src-rev=` segment.
