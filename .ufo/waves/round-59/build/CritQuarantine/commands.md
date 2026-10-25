# CritQuarantine evidence index

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Score rev `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Read-only git. No probe run. No commit.

| file | what |
|---|---|
| 00-clock.txt | capture start `2026-10-24T21:37:32-03:00` |
| 01-identity.txt | HEAD, ancestor, lesson blob `a7e14c72450f67e913db34d4b24665db08bf6e03` |
| 02-slice-bytes.txt | `wc`, sha256, `od`, `nl -ba` of the worktree slice |
| 03-lesson-at-rev.md | `git show` of `corpus/lessons/round-59.md` at the score rev |
| 04-slice-parse.txt | 9 lines, lead ids, forbidden-hit empty |
| 05-lesson-cmp.txt | worktree lesson equals score blob |
| 06-lesson-assimilation.txt | lesson lines 25–27 |
| 07-lesson-needles.txt | exact-phrase counts in the score lesson |
| 08-lesson-nine.txt | whole assimilation paragraph |
| 09-grep-and-track.txt | `wc -l` = 9; forbidden grep exit 1; slice is tracked |
| 10-sources-membership.txt | `git show` `corpus/SOURCES.md` row hits for the nine and the admit three |
| 11-lesson-gate.txt | gate table: ADMIT is only S125, S127, S136 |
| 12-lesson-sentences.txt | assimilation paragraph split on sentence boundaries |
| 13-predicate.txt | exact predicate false; `adoption closed` scopes four ids |
| 14-blob-bind.txt | slice blob `79579e50d2850999254340f49045c9d0d25665f0`; `cmp_exit=0`; tree grep |
| 14-slice-at-rev.bin | `git show` of the slice blob, byte-identical to the worktree file |
| 15-id-tokens.txt | first whitespace field vs `S`+digits |
| 16-other-lesson.txt | round-58 "adoption closed" sentence; `adoption of those` absent at the score rev |
