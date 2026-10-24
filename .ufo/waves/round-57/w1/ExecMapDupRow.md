# ExecMapDupRow — `readme-map` detects a duplicated coverage row (round 57)

Verdict: **CONFIRMED**. With one corpus coverage row duplicated in a scratch copy of the
committed README (nothing else touched), the gate prints
`README_MAP: DRIFT files=135 rows=136 covered=135 bad=1 first=duplicate-row:knowledge/dispatch-shapes.md`,
writes 0 bytes to stderr, and exits **1**. Deleting the added row again (byte-identical to
the committed README) returns `CLEAN` exit 0, so the finding is attributable to the
duplication alone. No production byte, `.ufo/pins` entry, Git index or jj state was
changed; no commit, install or pacman call was made.

## Judged assertion (item ExecMapDupRow)

Scratch fixture = committed `corpus/README.md` + committed corpus dirs + committed
registry; the only delta is one duplicated row (see diff below).

    $ node scripts/readme-map.mjs \
        --registry  .ufo/waves/round-57/build/ExecMapDupRow/scratch/registry.json \
        --readme    .ufo/waves/round-57/build/ExecMapDupRow/scratch/README.dup.md \
        --corpus    .ufo/waves/round-57/build/ExecMapDupRow/scratch/knowledge \
        --corpus    .ufo/waves/round-57/build/ExecMapDupRow/scratch/lessons
    README_MAP: DRIFT files=135 rows=136 covered=135 bad=1 first=duplicate-row:knowledge/dispatch-shapes.md
    exit 1, stderr 0 bytes

Byte-exact: `cmp` of stdout against
`printf 'README_MAP: DRIFT files=135 rows=136 covered=135 bad=1 first=duplicate-row:knowledge/dispatch-shapes.md\n'`
→ match, 104 bytes (`cmp-mutant.txt`, `expected-literal.txt`, `mutant.stdout`,
`mutant.stderr` 0 B, `mutant.exit` = `EXIT=1`).

The single-byte delta, verbatim (`mutant-diff.txt`):

    @@ -14,6 +14,7 @@
     | `knowledge/dispatch-shapes.md` | The three production dispatch shapes + fixture path; caps; when each applies | `ufo-swarm-wave.mjs`, `config/ufo.json`, `ufo-cli` |
    +| `knowledge/dispatch-shapes.md` | The three production dispatch shapes + fixture path; caps; when each applies | `ufo-swarm-wave.mjs`, `config/ufo.json`, `ufo-cli` |

`wc -l`: clean 267 → mutant 268; first differing line 17; added lines 1.

## Scratch identity (the mutant is real committed bytes plus one row)

Committed revision exercised = `8c6f5b017d149b18134917378cdbed3b492d8e89`
(`oxnkytrmlsou`, "round-57: idempotence at bookkeeping tip c42afe1c — A57 10/10, D57
5/5"); lane tip `@` = `2909579f06afa543d43109c6719cff1b236c50f4`. Gate, README and registry
blobs read from the commit object are hash-identical to the working tree
(`committed-blob-identity.txt`):

    scripts/readme-map.mjs     058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727
    corpus/README.md           7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d
    .ufo/pins/readme-map.json  9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c

The gate hash equals the round-57 `readme-map` entry in `.ufo/pins/counter-pins.json`
(`path: scripts/readme-map.mjs`, sha256 `058e5033…`), so the instrument is the pinned one.
`diff -r corpus/knowledge scratch/knowledge` and `diff -r corpus/lessons
scratch/lessons` both exit 0; 52 knowledge + 83 lessons = 135 `*.md`
(`corpus-copy-identity.txt`).

Re-run with the gate extracted from the commit object
(`committed-gate/scripts/readme-map.mjs`, same sha256) instead of the worktree file:
identical DRIFT line, exit 1, stderr 0 bytes (`committed-gate-mutant.*`).

## Controls (what isolates the result)

| fixture (sha256) | mutation | verdict | transcript |
|---|---|---|---|
| `README.clean.md` `75756148…` | none | `CLEAN files=135 rows=135 covered=135` exit 0 | `control-clean-scratch.txt` |
| `README.dup.md` `75a892c9…` | row 16 duplicated verbatim | **DRIFT bad=1 `duplicate-row:knowledge/dispatch-shapes.md`** exit 1 | `mutant-duplicate-row.txt` |
| `README.restored.md` `75756148…` | duplicate row removed again; file **byte-identical to committed README** | `CLEAN` exit 0 | `restore-control.txt` |
| `README.dup3.md` `2f96a683…` | same path, **different** description/pointer cells | DRIFT bad=1 `duplicate-row:knowledge/dispatch-shapes.md` exit 1 | `mutant-duplicate-row-semantic.txt` |
| `README.dup4-nonadjacent.md` `76fceaaa…` | second row for the same path placed 155 lines later (occurrences at lines 16 and 171) | DRIFT bad=1 `duplicate-row:knowledge/dispatch-shapes.md` exit 1 | `mutant-duplicate-row-nonadjacent.txt` |
| `README.dup2.md` `49d0e0d1…` | duplicate of a **lessons** row (`lessons/round-57.md`) | DRIFT bad=1 `duplicate-row:lessons/round-57.md` exit 1 | `mutant-duplicate-row-lessons.txt` |
| `README.noncorpus-dup.md` `95ee6333…` | the table **header** row duplicated | `CLEAN rows=135` exit 0 | `mutant-noncorpus-duplicate.txt` |
| `README.triple.md` `cfca0f1c…` | 3 rows for one path | `note duplicate-row:…` + `DRIFT rows=137 bad=2 first=duplicate-row:knowledge/dispatch-shapes.md` exit 1 | `mutant-triple-row.txt` |

Reading of the set: detection is **path-keyed, not line-keyed** (a cosmetic rewrite of the
duplicate still trips), **not adjacency-dependent**, **covers both corpus namespaces**, and
does **not** false-positive on duplicated non-corpus lines — the R56-V3 defect class
(row/half-map drift) is what the rule binds to, not "any repeated table line". The
restore control shows the defect is removable by the single inverse edit and that the
verdict is recomputed live, not memoised (K2 static-forgery invariant).

Multiplicity: `scripts/readme-map.mjs:178-187` pushes one `duplicate-row:<path>` for every
occurrence after the first, so a triple yields `bad=2` and repeats the item on the
`note` lines while `first=` stays stable. `--selftest` case 4
(`scripts/readme-map.mjs:259-266`) is the same assertion hermetically; the full suite ran
`README_MAP_SELFTEST: PASS (14/14)` / `VERDICT: PASS` exit 0 (`selftest.txt`).

## No production change

- Lane gate unchanged: `node scripts/readme-map.mjs` → `CLEAN files=135 rows=135 covered=135` exit 0 (`lane-untouched.txt`).
- Lane `corpus/README.md`, `scripts/readme-map.mjs`, `.ufo/pins/readme-map.json` hashes equal the values recorded **before** any probe and equal the commit-object blobs.
- `jj status` shows only wave bookkeeping (`M .ufo/waves/round-57/w1/swarm-registry.json`) plus untracked `build/` and `w1/` seat artifacts; nothing under `scripts/`, `corpus/`, `.ufo/pins/` (`lane-rev-status.txt`).

## Retained evidence (all under `.ufo/waves/round-57/build/ExecMapDupRow/`)

`control-clean-scratch.txt`, `mutant-duplicate-row.txt`, `mutant-duplicate-row-semantic.txt`,
`mutant-duplicate-row-lessons.txt`, `mutant-duplicate-row-nonadjacent.txt`,
`mutant-triple-row.txt`, `mutant-noncorpus-duplicate.txt`, `restore-control.txt`,
`mutant-diff.txt`, `mutant-diff-semantic.txt`, `mutant.stdout/.stderr/.exit`,
`expected-literal.txt`, `cmp-mutant.txt`, `selftest.txt`, `committed-blob-identity.txt`,
`committed-gate-mutant.{stdout,stderr,exit}`, `committed-gate.sha256`,
`corpus-copy-identity.txt`, `counter-pin.readme-map.txt`, `readme-map.sha256`,
`scratch-inputs.sha256`, `mutant-shas.txt`, `duprow-code-lines.txt`, `lane-untouched.txt`,
`lane-rev-status.txt`, `rev.txt`, `manifest.txt`, and the `scratch/` fixture tree
(135 corpus files + 8 README variants + `registry.json`).

## Risks / caveats

- The rule counts rows, not row content: a duplicated row is caught, two *different* rows
  for one path would also be caught, but a single row with wrong description/pointer cells
  still reads CLEAN (same limit the ExecMapClean seat records).
- A duplicated row whose path has no file is reported as `orphan-row` for the first
  occurrence plus `duplicate-row` for the second (`scripts/readme-map.mjs:178-187`,
  read not executed — **[INFERENCE]** from code reading; the duplicate item is still
  emitted, so the assertion under test would not be weakened).
- Copy fidelity is checked against the commit object, but the probe does not re-derive the
  registry from scratch; registry tampering is the schema/registry seats' arm.
- No web source was assessed for this item (local instrument probe only), so no URL / quote
  / tier judgment applies.

## Files changed

Production: **none**. Writes confined to
`.ufo/waves/round-57/build/ExecMapDupRow/` and this report. No install, no pacman, no
commit, no push, no jj/git mutation, no sibling-lane write.

## Blockers

None.
