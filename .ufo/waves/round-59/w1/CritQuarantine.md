# CritQuarantine — round 59 / w1

Item: read `.ufo/waves/round-59/assimilation/quarantine-slice`. Confirm 9 lines, that none is S125, S127 or S136, and that the lesson says adoption of those nine is closed. Quote the nine ids. Axes: operability, coverage. Date: 2026-10-24.

**Item result: FALSIFIED on the third conjunct.** This is not a claim verdict. It does not attest REPAIR59 or DOCTRINE59. The probes were not run.

The slice has 9 lines. None of those lines is S125, S127, or S136. `corpus/lessons/round-59.md` does not say adoption of those nine is closed. The exact sentence is absent from the score tree.

## Nine ids

Lead `S`+digit ids, in file order (`04-slice-parse.txt`, `15-id-tokens.txt`):

S109, S116, S118, S129, S142, S143, S144, S145, S178

First whitespace fields differ on the last four because a backtick is glued to the id: `S109`, `S116`, `S118`, `S129`, `S142`, `S143``, `S144``, `S145``, `S178``. Neither form is S125, S127, or S136.

## Nine lines

Worktree and score blob are the same file. `wc -l` (`09-grep-and-track.txt`):

```text
9 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/assimilation/quarantine-slice
```

`wc -l -c -m` (`02-slice-bytes.txt`): `9 422 422`. Ends with a newline. No blank line. `splitlines_count=9`. sha256 `8cfd754bfcf34eed917e5b8b6baf4d6f96c665d0c07e5f27a3af1160ece55bd6`. Blob `79579e50d2850999254340f49045c9d0d25665f0` (`git rev-parse` and `git hash-object` both printed that; `cmp_exit=0`).

`nl -ba` lines, trailing space included:

```text
     1	 S109   `payload-absent` 
     2	 S116   `payload-absent` 
     3	 S118   `payload-absent` 
     4	 S129   `payload-absent` 
     5	 S142   `payload-absent` 
     6	 S143`   the cited source could not be fetched, so no quote was checked 
     7	 S144`   the cited source could not be fetched, so no quote was checked 
     8	 S145`   the cited source could not be fetched, so no quote was checked 
     9	 S178`   the cited source could not be fetched, so no quote was checked 
```

## None is S125, S127, or S136

`grep -c -E 'S125|S127|S136'` on the slice printed `0` and exited 1 (`09-grep-and-track.txt`). Parsed forbidden hits: `[]`. `none_is_forbidden=True`.

Those three are the gate ADMIT rows, not slice rows. Lesson gate (`11-lesson-gate.txt`) admits only S125, S127, and S136, then says "Three rows, no others." At the score rev, `corpus/SOURCES.md` has one row each for S125 (line 137), S127 (line 138), and S136 (line 139), and zero rows for S129, S142, S143, S144, S145, and S178 (`10-sources-membership.txt`, 126 rows).

## The lesson does not say adoption of those nine is closed

Measured lesson is `corpus/lessons/round-59.md` at `5469c0a58d7986ff8a5f203938ae1c8785a92213`, blob `a7e14c72450f67e913db34d4b24665db08bf6e03`. Worktree bytes equal that blob (`05-lesson-cmp.txt`). The item does not name the base.

`git grep -n -F "adoption of those nine is closed" 5469c0a58d7986ff8a5f203938ae1c8785a92213` exited 1. `git grep -n -F "adoption of those"` at that rev also exited 1 (`14-blob-bind.txt`, `16-other-lesson.txt`). Inside the lesson file, needle counts (`07-lesson-needles.txt`): `adoption of those nine is closed` = 0, `adoption closed` = 1 (line 27 only), `unadopted` = 1, `were not touched` = 1.

Line 27, the only assimilation paragraph:

```text
Collision guard (0–3 leading spaces): reg 123, staged 147, collisions 0. Indented-fixture proof: a scratch registry row `  | S125 |` produced a nonempty collisions file containing S125. Quarantine slice re-derived: 9 rows. S109, S116, S118 are the lane's own round-55/57 rows (payload-absent in the campaign register, not absent here) and were not touched. S129, S142 stay payload-absent and unadopted. S143, S144, S145, S178 stay could-not-be-fetched: unverifiable, not fabrication, adoption closed. None of the nine is S125, S127 or S136.
```

Sentence scopes (`12-lesson-sentences.txt`, `13-predicate.txt`):

- "Quarantine slice re-derived: 9 rows." — count only.
- S109, S116, S118 "were not touched."
- S129, S142 "stay payload-absent and unadopted."
- S143, S144, S145, S178 "adoption closed." That is the only `adoption closed` sentence. Its ids are those four, not the nine.
- "None of the nine is S125, S127 or S136." — exclusion, not an adoption predicate.

`adoption_closed_sentence_ids=['S143', 'S144', 'S145', 'S178']`. `contains_exact_adoption_of_those_nine_is_closed=False`.

The three-way split matches the registry, so the missing sentence is not a gap the lesson should be rewritten to fill. S109, S116, and S118 are already rows (SOURCES lines 122, 129, 131). Calling their adoption closed would contradict the registry and the lesson's own "not absent here" clause. S129 and S142 are absent and labeled unadopted, not "adoption closed."

## Attack

Round 58 is the nearest wording and does not rescue the conjunct. `corpus/lessons/round-58.md` lines 86–91 at the same rev (`16-other-lesson.txt`):

```text
Quarantine slice (absent-defect register, read-only): 9 rows — S109/S116/S118/S129/S142 `payload-absent`,
S143/S144/S145/S178 prose-class ("could not be fetched" — the register's
unchecked family, unverifiable rather than fabricated). With adoption closed
this round every slice row stays quarantined; none was hand-checked into an
adoption.
```

That file's "this round" is round 58. It does not contain "adoption of those nine is closed." Round 59 did not repeat the uniform closure sentence. Other `those nine` hits at the score rev are round-44 and round-45 controls, not this slice.

The glued backtick on lines 6–9 is a slice defect (`15-id-tokens.txt`: `field_equals_digits=False` for S143, S144, S145, S178). It does not make any line S125, S127, or S136. Lines 1–5 wrap the reason in backticks; lines 6–9 put one backtick on the id and leave the reason bare. Id extraction by `S`+digits still yields the nine quoted above.

No second theme was admitted inside this slice. This seat did not re-derive the slice; it counted the file the item named. The lesson's "9 rows" matches that count. The adoption-closed claim does not match the lesson.

## Revision binding

Captured `2026-10-24T21:37:32-03:00` (`00-clock.txt`, `01-identity.txt`):

```text
head=5469c0a58d7986ff8a5f203938ae1c8785a92213
cat-file -t = commit
ancestor base 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f of HEAD: exit 0
lesson status porcelain: empty, status_exit=0
lesson diff --stat vs score: empty, diff_exit=0
slice status porcelain: empty, status_exit=0
slice diff --stat vs score: empty, diff_exit=0
```

HEAD was not moved. The slice is tracked (`git ls-files --error-unmatch` exit 0; `git check-ignore` exit 1; `git cat-file -e` of the score path exit 0).

## Evidence and scope

Captures are under `.ufo/waves/round-59/build/CritQuarantine/`. `commands.md` is the command index. Primary captures: `02-slice-bytes.txt`, `04-slice-parse.txt`, `09-grep-and-track.txt`, `12-lesson-sentences.txt`, `13-predicate.txt`, `14-blob-bind.txt`, `10-sources-membership.txt`.

This seat did not run `repair59-probe.mjs` or `doctrine59-probe.mjs`. No production file, corpus file, lesson, slice, lane ledger, jj state, or Git index was changed. Writes were confined to this report and `build/CritQuarantine/`. No install, pacman transaction, commit, push, subagent dispatch, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/CritQuarantine.md
