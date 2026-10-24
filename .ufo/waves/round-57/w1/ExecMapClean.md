# ExecMapClean — `readme-map` CLEAN against the committed revision (round 57)

Verdict: **CONFIRMED**. The named gate reads exactly
`README_MAP: CLEAN files=135 rows=135 covered=135` and exits 0, both in the lane working
copy and in a pristine extraction of the committed revision. No production byte was
changed; no commit, jj/git mutation, pacman call, or install was performed.

## Judged assertion (item ExecMapClean)

    $ cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
    $ node scripts/readme-map.mjs
    README_MAP: CLEAN files=135 rows=135 covered=135
    exit 0, stderr 0 bytes

Byte-exact: `cmp` against `printf 'README_MAP: CLEAN files=135 rows=135 covered=135\n'`
matched (including the single trailing newline; `od -c` shows 49 bytes ending `\n`).
Transcript: `.ufo/waves/round-57/build/ExecMapClean/transcript-lane`.

## Committed-revision identity

- Lane tip `@` = `2909579f06afa543d43109c6719cff1b236c50f4` (`nuxonxrukusk`), dirty only
  by wave bookkeeping: `M .ufo/waves/round-57/w1/swarm-registry.json` plus untracked
  `.ufo/waves/round-57/build/*` and `w1/*.md` seat artifacts (none in `scripts/`,
  `corpus/`, or `.ufo/pins/`).
- Committed parent revision exercised = `8c6f5b017d149b18134917378cdbed3b492d8e89`
  (`oxnkytrmlsou`, "round-57: idempotence at bookkeeping tip c42afe1c — A57 10/10, D57
  5/5"), reachable as a git commit object (`git cat-file -t` → `commit`).
- `jj diff --from oxnkytrm --to @ --stat -- scripts corpus/knowledge corpus/lessons
  .ufo/pins` → `0 files changed, 0 insertions(+), 0 deletions(-)`. Every byte the gate
  reads is identical at `8c6f5b01` and at `@`, so the lane run is a committed-bytes run.
- Second, independent run inside a `git archive` extraction of `8c6f5b01`
  (`committed-tree/`, 3626 files): same line, exit 0, stderr 0 bytes
  (`transcript-committed`). `sha256sum` of the three inputs is identical in the
  extraction and the lane.

## Retained evidence (all under `.ufo/waves/round-57/build/ExecMapClean/`)

| file | content |
|---|---|
| `transcript-lane`, `transcript-lane.stdout/.stderr` | cwd + command + stdout + stderr + `exit: 0` |
| `transcript-committed`, `…stdout/.stderr` | same, inside committed-revision extraction |
| `gate-lane.stdout.txt`, `gate-lane.stderr.txt` (0 B), `gate-lane.exit.txt` (`EXIT=0`) | first lane run |
| `gate-committed.stdout.txt`, `.stderr.txt` (0 B), `.exit.txt` (`EXIT=0`) | first extraction run |
| `expected-literal.txt`, `cmp-lane.txt`, `od-lane.txt` | byte-exact comparison of the judged line |
| `sha256-inputs.txt`, `sha256-committed-vs-lane.txt` | input hashes, lane vs extraction |
| `derive-independent.mjs`, `derive-lane.json`, `derive-lane.exit.txt` | independent bimap re-derivation |
| `files.find.txt`, `covered.jq.txt`, `set-crosscheck.txt` | second-method set cross-check |
| `jj-log-tip.txt`, `rev-and-status.txt`, `wc-vs-committed-diff.txt`, `final-state.txt` | revision/state pins |
| `git-object-check.txt`, `extract.log`, `capture.sh`, `rebuild-committed-tree.sh` | reproduction trail |

Inputs (identical at `8c6f5b01` and `@`):

    scripts/readme-map.mjs          058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727
    .ufo/pins/readme-map.json       9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c
    corpus/README.md                7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d

The gate-script hash equals the round-57 `readme-map` entry in
`.ufo/pins/counter-pins.json` (`path: scripts/readme-map.mjs`, sha256 `058e5033…`), so the
instrument run is the pinned one, not a later edit.

## Independent corroboration (coverage leg is set identity, not counts)

`derive-independent.mjs` re-parses the README rows, lists the corpus, and reads the pin
registry without importing or copying the gate's code: `files=135 rows=135 covered=135`,
`perDir={knowledge:52, lessons:83}`, `verdict=CONSISTENT`, exit 0. Elementwise
differences (not just cardinalities) were all empty: `uncovered`, `orphanRows`,
`unpinned`, `staleCovered`, `rowsMinusFiles`, `filesMinusRows`, `coveredMinusFiles`,
`filesMinusCovered`, `duplicateRows`, `malformedRows`, `pinProblems`.

Second method (find + jq + comm): `files=135 covered=135`, `comm -3` output empty →
exact set equality between live corpus files and the pinned `covered` set, 0 duplicate
entries. Counts agreeing at 135 would not by itself prove the bimap; set equality does.

## Risks / caveats

- The gate validates bimap identity and row *format*, not row cell semantics: a row whose
  description/pointer columns are stale or wrong still reads CLEAN. The R56-V3 defect
  class (missing row) is captured; wrong-cell content is not.
- `135` is a live snapshot. Any corpus `*.md` added without a registry entry and a README
  row turns the gate to `DRIFT` exit 1 (`unpinned`/`uncovered`) — by design, but it means
  every corpus-touching seat must update both halves.
- `--selftest` was not exercised here; that arm belongs to the ExecMapSelftest seat, and
  the drift arms (`uncovered`, `orphan`, `duplicate`, `format`, `stale-covered`,
  `unpinned`, `empty-covered`, schema) belong to their named seats. This seat attests the
  clean path only.
- One operational slip, disclosed and reverted: the first `git archive -o committed-tree.tar`
  resolved `-o` relative to the `git -C` lane root and wrote a 52,971,520-byte tar into the
  lane root. It was removed immediately (`rm -f committed-tree.tar`), and
  `git status --porcelain` shows no `committed-tree.tar` entry afterwards. The extraction
  was redone with stdout redirection into this build dir (`extract.log`,
  `rebuild-committed-tree.sh`). No tracked file was touched.

## Files changed

None in production. Writes are confined to
`.ufo/waves/round-57/build/ExecMapClean/` and this report. No install was needed or made.

## Blockers

None.
