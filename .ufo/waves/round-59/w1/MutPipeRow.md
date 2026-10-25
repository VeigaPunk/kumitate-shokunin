# MutPipeRow — round 59 / w1

Axes: operability, coverage. This file corroborates or falsifies the named cell-count item. It is not a verdict on C1 or C2, and it does not print `REPAIR59_HELD` or `DOCTRINE59_HELD`.

Item: count pipe-separated cells on the S125, S127 and S136 rows in `corpus/SOURCES.md`. Each must be 11 cells (split length 13 including the empty ends). Quote the three lengths. A length other than 11 is a census-breaking row.

**Item result: CORROBORATED.** Measured at score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213`. The three lengths are 11, 11 and 11. The three split lengths are 13, 13 and 13. None of these rows is census-breaking.

## Lengths

`python3 .ufo/waves/round-59/build/MutPipeRow/count.py` on `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/SOURCES.md` exited 0. Stderr was empty. Selected lines from `01-count.stdout` (not a contiguous dump; the file also prints cell text):

```text
id=S125 line=137
id=S125 split_len=13 cells=11 pipe_count=12
id=S125 CENSUS_BREAKING=false length=11
id=S127 line=138
id=S127 split_len=13 cells=11 pipe_count=12
id=S127 CENSUS_BREAKING=false length=11
id=S136 line=139
id=S136 split_len=13 cells=11 pipe_count=12
id=S136 CENSUS_BREAKING=false length=11
```

That split is `line.split('|')`. Length 13 is the empty start, 11 cells, and the empty end. Cells are `split[1:-1]`, the same slice `doctrine59-probe.mjs` uses at line 122 (`cells.length !== 11` fails the row). This seat did not run that probe.

Independent gawk, the census field separator, exited 0 with empty stderr:

```text
id=S125 NR=137 raw_NF=13 census_NF=13 fields=11 split_len=13 cells=11
id=S127 NR=138 raw_NF=13 census_NF=13 fields=11 split_len=13 cells=11
id=S136 NR=139 raw_NF=13 census_NF=13 fields=11 split_len=13 cells=11
```

The contract one-liner (`awk -F'|'` and `NF!=13`, SOURCES-CONTRACT-v1.md line 70) printed `malformed=0` for each id and `malformed_rows=0` for the whole blob. `awk` and `gawk` on this host are both GNU Awk 5.4.1.

Each id matched the row regex once (`^ {0,3}\| <id> \|`). No escaped `\|`. No carriage return. Leading spaces 0. Worktree `corpus/SOURCES.md` printed the same three lengths. Its sha256 equals the blob.

## Census on the live rows

`bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` exited 0. Stderr empty. E01 lines for the whole file: 0. The script's own rule is `NF!=13` prints `E01` with `fields=NF-2` (sources-census.sh lines 635–636). `fields` is the cell length. A length other than 11 is that E01. These three rows did not produce it. Closing line:

```text
file	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
```

The same stdout has five `W04` duplicate-url warnings. The script header says warnings do not change a clean exit. They are not a cell-count finding.

## A length other than 11

Scratch copies only. `corpus/SOURCES.md` was not edited. Lane sha256 after the copies was still `dae027546be53767aba9265cf19ac8c9ee0ec3455b767e6b27f643cfd2bd37af`.

Insert one pipe on the S125 row (`line + " MUT |"`). Python printed `split_len=14 cells=12` and `CENSUS_BREAKING=true length=12`. Contract awk printed `id=S125 NF=14 fields=12 malformed=1`. Census E01 extract:

```text
file	E01	S125 fields=12
```

Drop one interior pipe on the S127 row. Direct split of that line printed `line=138 split_len=12 cells=10` and `CENSUS_BREAKING=true`. The id cell swallowed the source cell, so the row regex `| S127 |` no longer matches (`row_matches=0`). The census still sees the row and prints:

```text
file	E01	S127  MCP Tasks extension specification 2026-07-28 — https://github.com/modelcontextprotocol/ext-tasks/blob/b3d28aceaa6d49f5f92258e3d06b61ad6f111e84/specification/2026-07-28/tasks.md fields=10
```

Interior pipe on S136, inserted at ` | mined |`. Python printed `split_len=14 cells=12` and `CENSUS_BREAKING=true length=12`. Census E01 extract:

```text
file	E01	S136 fields=12
```

Those three scratch census runs also print `E11` and exit 1. `--file` resolves used-by against the parent of the scratch file (`build/`), not the lane root. E11 is that path resolution. The cell finding is the E01 line, which the live registry does not print.

A first S125 writer replaced the closing pipe with ` MUT |` and did not add a delimiter. That copy stayed `split_len=13 cells=11`. Its E01 extract is empty. Padding a cell is not a length change, and it is not census-breaking. The quoted length-12 case is the later insert, `sources.mut-s125-insert-pipe.md`.

## Counters that are not the length

Bash `IFS='|' read -a` printed `bash_IFS_len=12` for all three live rows. It drops the trailing empty field. Twelve is the pipe count, and it is also that bash length. It is not the cell length and not the split length the item names. Quoting 12 would call a well-formed row census-breaking. The census counter keeps both empty ends: `NF=13`, `fields=11`.

`S125` and `S127` each occur on a second line. That line is the S136 row, whose scope cell says `secondary to S125 and S127`. Substring hits are 2, 2 and 1. Row hits are 1, 1 and 1. The second hit is not a second row and was not counted as a cell length.

## Revision identity

`2026-10-24T21:39:59-03:00` for the live count. Insert-pipe follow-up `2026-10-24T21:41:40-03:00`. `git rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `git cat-file -t` printed `commit`. `git merge-base --is-ancestor` exited 0. `git status --porcelain -- corpus/SOURCES.md` printed nothing. `git diff --exit-code` against that rev exited 0. Blob `47f99abc1bab8ed9a1730350cd9197bf84b86c1b`. Worktree and `git show` sha256 both `dae027546be53767aba9265cf19ac8c9ee0ec3455b767e6b27f643cfd2bd37af`. Python 3.14.8.

## Evidence and scope

Command output is under `.ufo/waves/round-59/build/MutPipeRow/`. `commands.md` is the index. Primary captures: `01-count.stdout`, `02-gawk.stdout`, `03-contract-awk.stdout`, `03b-contract-malformed.stdout`, `05-census-live.stdout`, `08-insert-pipe.census-e01.stdout`, `09-drop-pipe-split.stdout`, `07-sources.mut-s136-interior-pipe.census-e01-trio.stdout`.

This seat counted the three named rows and checked that a non-11 length is the census E01. It did not run `repair59-probe.mjs` or `doctrine59-probe.mjs`. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/MutPipeRow/`. No install, pacman transaction, commit, push, dispatch, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/MutPipeRow.md
