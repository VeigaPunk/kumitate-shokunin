# ScoutOperatorLessons — seat report (round 61, w1)

Milestone: operator lessons check. Judged on: coverage.

**Result: none.** `corpus/lessons/operator-*.md` matches 0 files in kumitate-shokunin at lane
HEAD `be4a820c3`. Because there are no files, there are no author, date, content or reflection
rows.

These checks all came back empty:

- the Glob for that pattern;
- `ls` of the 90 lesson files;
- a case-insensitive `find` for `*operator*` under `corpus/lessons`;
- a repo-wide `find` for `operator-*.md`;
- `git ls-files`;
- `git log --all` on that path (so no such file was ever committed);
- all sibling lanes' `corpus/lessons/operator-*.md` (0 fleet-wide).

The rule source is `scripts/hyaku/lane-addendum.md:196-197` ("honor any
`corpus/lessons/operator-*.md` teaching not yet reflected"). It is vacuously satisfied this round.

Adjacent operator passages that are not `operator-*.md` files are listed in the findings:
`round-58.md:64` and `:103`, the "Notes for the operator" sections in verifier spotchecks 38–44,
and `QUALITY.md:288`, which records the operator's raise of the round cap to 128.

Remaining unknown: jj-only history was not inspected because `jj` is barred for this seat.

Findings: `.ufo/waves/round-61/build/ScoutOperatorLessons/findings.md`

Tool installs: none.
