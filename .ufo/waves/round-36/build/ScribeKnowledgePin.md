SCRIBE knowledge-pin drafted lines=90 citations=11

## Draft — `corpus/knowledge/pinned-evidence.md`

````markdown
source: S031 https://git-scm.com/docs/git-rev-parse#Documentation/git-rev-parse.txt---verify (OPTIONS → Options for Output → `--verify`; quote: "If so, emit it to the standard output; otherwise, error out."); S032 https://reproducible-builds.org/docs/recording/ (heading § Recording the build environment, paragraph before § File Format; quote: "All relevant information about the build environment should either be defined as part of the development process or recorded during the build process."); own-work `.ufo/pins/origin.json`, round-36 baseline logs
verified-at: 2026-10-21 (S031 page banner "git-rev-parse last updated in 2.56.0" = host `git version 2.56.0`; S032 Last-Modified 2026-10-19; revision 31c465f15669f744848bd9f5d56191c5085670f7 read at /fast/scratch/kumitate-r36/src, detached, mode 0555)
recheck: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → 31c465f1…f7; `node scripts/claims-check.mjs --pin .ufo/pins/origin.json | tail -1`; `node scripts/proxy-check.mjs --pin .ufo/pins/origin.json | tail -1`; `node scripts/surface-probe.mjs --pin .ufo/pins/origin.json --known .ufo/pins/surface-known.json | tail -1` (2026-10-21)

# pinned evidence — the revision every gate verdict must name

## Why the verdict carries a revision
A verdict is evidence about bytes. Round 35 resolved the checklist's `--src` to
the operator checkout, pre-registered 91/91 S-members, measured 86/88 when the
tree moved (`corpus/lessons/round-35.md:13`, `:15`). Round 36 repeats it:
`SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=2 warnings=1)` at the operator
tree, `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)` at the
pin (2026-10-21) — incomparable without `src-rev=`; the third error is a
read-only state write.

S031 supplies the primitive: `git rev-parse HEAD` emits the object name or
errors, fatally outside a repository — "cannot verify" is a distinct outcome,
never a zero. S032 supplies the obligation: environment identity is defined in
advance or recorded during the run. PIN v1 does both; with no pin the segment is
absent and the verdict is byte-identical to the unpinned gate (portability).

## The pin file (`kumitate-origin-pin-v1`)
`.ufo/pins/origin.json`:

```json
{ "contract": "kumitate-origin-pin-v1",
  "repo": "ufo-fsd-alpha",
  "revision": "31c465f15669f744848bd9f5d56191c5085670f7",
  "clone": "/fast/scratch/kumitate-r36/src",
  "recreate": "git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/kumitate-r36/src && git -C /fast/scratch/kumitate-r36/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/kumitate-r36/src",
  "verified_at": "2026-10-21" }
```

`--pin FILE`; default `<self>/.ufo/pins/origin.json` when present. Without
`--src` the pin's `clone` is the tree; an explicit `--src` wins but is still
asserted, so the gate cannot print the pin's revision while scoring another tree
(`scripts/claims-check.mjs` `resolveOrigin`; likewise `surface-probe.mjs`,
`proxy-check.mjs`). The stanza's `pin.<name>` keys are a different pin — script
sha256, not a source revision.

## Three assertions, three outcomes
| outcome | condition | exit |
|---|---|---|
| match | `git -C <src> rev-parse HEAD` = pin `revision` | gate's own 0/1 (2/64 unchanged) |
| `SRC_REV_MISMATCH` | HEAD is 40 hex but differs | 2 |
| `SRC_REV_UNVERIFIABLE` | git missing, not a repo, unborn HEAD | 2 |

On match the revision rides inside the verdict: `CLAIMS: MATCH (…
src-rev=31c465f15669)`, `PROXY: MATCH (… pins=<n> match; src-rev=…)`,
`SURFACE_PROBE: DRIFT (… errors=<n> warnings=<n> src-rev=…)`, and
`FIDELITY: CLEAN (… src-rev=…)`. A mismatch prints
`CLAIMS: FAIL-CLOSED (SRC_REV_MISMATCH …)` — no scored verdict — and exits 2;
the assertion compares all 40 hex (12 is display only).

## Reproduction
```sh
git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/kumitate-r36/src \
  && git -C /fast/scratch/kumitate-r36/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 \
  && chmod -R a-w /fast/scratch/kumitate-r36/src
node scripts/claims-check.mjs --pin .ufo/pins/origin.json
```

## The operator's checkout is never `--src`
`/home/vgpnk/Projects/ufo-fsd-alpha` is a working tree: HEAD moves and it can
carry uncommitted bytes. The assertion pins the commit, not the worktree — a
dirty tree at the right HEAD passes. The clone is the evidence path: cloned from
the operator tree (a read), detached, clean, `chmod a-w`, and reads set
`GIT_OPTIONAL_LOCKS=0` so the assertion takes no lock.

Pinning presupposes a tree the gate cannot mutate. The dispatcher status arm was
the counter-example: cwd `<src>` defaulted its state root into the tree it reads
— unreachable on the read-only clone, a write into the scored bytes otherwise.
`readDispatcherStatus` now spawns it with `UFO_STATE_DIR` and
`UFO_PENDING_WORK_PATH` under a `mkdtemp`, `UFO_PROJECT_ROOT=<src>`, removes the
temp root, and proves the tree unchanged before/after.

## What stays unpinned
- **kimi-census substrate (`~/.kimi-code`).** An installed live tree, not a
  repo — no commit to assert. Its provenance is the frozen member rules plus the
  census re-derived at measurement time (`scripts/kimi-census.mjs`); secret
  members are stat-only, so it cannot be content-hashed.
- **Lane-local files.** The gates and notes are this lane, not the origin. Their
  identity is the lane revision plus the proxy stanza's `pin.<script>` sha256;
  an origin pin would be a category error.

## Limits
- HEAD identity is not content identity: an edited a-w tree still matches; the
  clone's permissions are the guard. `verified_at` is not a TTL — a new upstream
  revision needs a new `revision`/`recreate`, and `.ufo/pins/surface-known.json`
  and `.ufo/pins/fidelity-ratchet.json` move with it or refuse on their own.
````

## What I did
Read-only seat. No lane edits, no scratch clone, no git/jj mutation, no
installs, no delegation, no REA. Commands run from
`/home/vgpnk/Projects/shokunin/kumitate-shokunin` or with absolute paths:

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` →
  `31c465f15669f744848bd9f5d56191c5085670f7`; `remote -v` → origin
  `/home/vgpnk/Projects/ufo-fsd-alpha`; `status --porcelain` → empty;
  `stat` → dir + `.git` `dr-xr-xr-x`.
- `head -40 corpus/knowledge/gate-verdict.md`, `head -30
  corpus/knowledge/live-surface-probe.md`, `head -60
  corpus/knowledge/member-claims-gate.md`, `sed -n '1,100p'
  corpus/QUALITY.md`, `head -60 corpus/knowledge/local-ship.md` — Q1 header
  triple at `corpus/QUALITY.md:12-18`; Q15 at `:78-84`.
- `sed -n '200,260p' scripts/proxy-check.mjs`, `sed -n '50,90p'
  scripts/claims-check.mjs`, `head -50 scripts/kimi-census.mjs` — current
  unpinned src defaults and the `pin.<name>` stanza semantics.
- `tail -60 corpus/SOURCES.md`; `python3` extraction of the build-spec items —
  S031/S032 row ownership is ScribeSources, not this seat.
- Baseline verdicts read, not re-run: `.ufo/waves/round-36/baseline/`
  `surface-default.txt` (errors=2), `surface-pin.txt` (errors=3),
  `claims-default.txt`, `claims-pin.txt`, `proxy-default.txt`,
  `proxy-pin.txt`, `checklists.txt` (11/13), `fidelity-prototype-v1.txt`
  (TOTAL anchors=1530 nonok=588).
- Draft implementation text (not yet integrated) read from executor scratch:
  `/fast/scratch/kumitate-r36/w/KumitateR36.ExecClaimsPin/lane/scripts/claims-check.mjs`
  (`resolveOrigin`, `readPin`, `gitHead`, `renderVerdict`);
  `/fast/scratch/kumitate-r36/w/ExecProxyPin/lane/scripts/proxy-check.mjs`
  (`; src-rev=` in MATCH/DRIFT); `/fast/scratch/kumitate-r36/w/ExecSurfacePin/…/surface-probe.mjs`
  (`SURFACE_PROBE: … src-rev=`); `/fast/scratch/kumitate-r36/w/ExecSurfaceDispatcherState/…/surface-probe.mjs`
  (`readDispatcherStatus` mkdtemp state); `/fast/scratch/kumitate-r36/w/ExecPinFiles.patch`
  (the three pin-file literals and `recreate` one-liner).
- Quotes checked first-hand: git-rev-parse `--verify` `<dd>`
  ("If so, emit it to the standard output; otherwise, error out.");
  reproducible-builds recording page paragraph (exact 23-word sentence above;
  `deterministic-builds/` is HTTP 404, `source-date-epoch/` states no
  provenance rule).

## Provenance / limits of this report

- The draft is a proposal for L1 integration; I did not write
  `corpus/knowledge/pinned-evidence.md`. Path:line citations inside the draft
  (`corpus/lessons/round-35.md:13`, `:15`; `corpus/QUALITY.md:78-84`) were
  observed at lane HEAD `0614092e0804aaca06642cb3a263a05c1cacc98e`.
- The script-internal names (`resolveOrigin`, `readPin`, `gitHead`,
  `readDispatcherStatus`) are from executor scratch drafts, not lane HEAD.
- `src-rev=31c465f15669` is the first 12 hex of the pin revision by the
  contract's display rule; the gate verdicts themselves were not re-run here
  (scribe seat: do not rerun to decorate).
- [INFERENCE] The statement "a dirty tree at the right HEAD passes" follows
  from the assertion being `git rev-parse HEAD` only; the frozen PIN v1
  contract names no worktree-cleanliness check, and the executor drafts
  implement none.
