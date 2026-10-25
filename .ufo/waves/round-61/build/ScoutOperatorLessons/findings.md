# ScoutOperatorLessons — operator lessons check (round 61, w1)

## Verdict

NONE: `corpus/lessons/operator-*.md` matches zero files in kumitate-shokunin. There is nothing
for the lane to reflect, so no per-file author, date, content or QUALITY.md/SKILL.md reflection
row applies.

## Evidence (observed, lane HEAD `be4a820c3`, 2026-10-25 06:39 -0300)

- The Glob `corpus/lessons/operator-*.md` returned 0 files.
- `ls corpus/lessons/` lists 90 entries. All are `round-*.md`, `round-*-verifier-spotcheck.md`
  or `round-*-aggregator-*.md`.
- `find corpus/lessons -iname '*operator*'` (any case, any depth) returned nothing.
- `find . -iname 'operator-*.md'` repo-wide (excluding `.ufo`, `.git`, `.jj`) returned nothing.
- `git ls-files 'corpus/lessons/operator-*'` is empty: no tracked file.
- `git log --all -- 'corpus/lessons/operator-*'` is empty: no such file was ever committed and
  later deleted.
- Fleet-wide, `*/corpus/lessons/operator-*.md` across all sibling lanes counts 0, so the
  convention exists but is unused anywhere right now.

## Where the rule comes from

`/home/vgpnk/Projects/shokunin/scripts/hyaku/lane-addendum.md:196-197` says: "Also honor any
`corpus/lessons/operator-*.md` teaching not yet reflected." With no such files, this rule is
vacuously satisfied for round 61.

## Adjacent (not `operator-*.md`, out of the check's literal scope; listed for coverage)

These are operator-authored or operator-addressed passages inside other lesson files. They are
not operator lesson files, so this check does not judge whether the lane reflects them:

- `corpus/lessons/round-58.md:64` is the section "Operator steer and resumption".
- `corpus/lessons/round-58.md:103` is "considerthese (operator-authored input; mined, never
  edited)".
- `round-38-verifier-spotcheck.md:211` and `round-39`…`round-44-verifier-spotcheck.md` contain
  "Notes for the operator" or "operator handoff" sections, which the verifier wrote for the
  operator.
- `corpus/QUALITY.md:288` already records one operator directive inline: "the operator raised
  the round cap from 100 to 128 on 2026-10-22".

## Unknowns

- jj-only history was not inspected, because `jj` commands are barred in this seat. Git
  history across `--all` refs shows nothing.

## Tool installs

None.
