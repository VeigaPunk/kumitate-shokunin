# MutPipeRow evidence index

Score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Lane file `corpus/SOURCES.md` was not edited. Scratch mutants live only in this directory.

Primary count, 2026-10-24T21:39:59-03:00:

- `00-identity.txt` — HEAD, ancestor, porcelain, diff, blob, sha256, tool versions.
- `sources.at-rev.md` — `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/SOURCES.md`.
- `01-count.stdout` — python split of that blob. `01b-count-worktree.stdout` is the same count on the worktree path.
- `02-gawk.stdout` — gawk `NF` after the census 0–3 space strip.
- `03-contract-awk.stdout` — contract one-liner on the three ids. `03b-contract-malformed.stdout` is the whole-file `NF!=13` count.
- `04-bash-ifs.stdout` — bash `IFS='|' read -a` length. Not the census length.
- `05-census-live.stdout` — `sources-census.sh validate --file` on the lane registry. Exit in `05-census-live.exit`. Trio E01 extract is empty (`05-census-live-e01-trio.stdout`).

Scratch mutations, after the live count:

- `sources.mut-s125-extra-cell.md` — first writer padded the last cell and did not add a pipe. Length stayed 11. Do not read its census exit as a cell-count failure; E01 extract is empty. E11 is `--file` resolving used-by against this directory's parent.
- `sources.mut-s125-insert-pipe.md` — corrected insert, measured 2026-10-24T21:41:40-03:00. `08-insert-pipe.count.stdout`, `08-insert-pipe.awk.stdout`, `08-insert-pipe.census-e01.stdout`.
- `sources.mut-s127-drop-pipe.md` — one interior pipe removed. `09-drop-pipe-split.stdout` (second block is the S136 row, which still contains the token S127). Census E01 in `07-sources.mut-s127-drop-pipe.census-e01-trio.stdout`.
- `sources.mut-s136-interior-pipe.md` — pipe inserted before the opened cell. `07-sources.mut-s136-interior-pipe.count.stdout` and `07-sources.mut-s136-interior-pipe.census-e01-trio.stdout`.
- `10-substring-lines.stdout` — row hits versus the S136 scope cell that names S125 and S127.
