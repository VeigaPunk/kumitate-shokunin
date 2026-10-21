FIDELITY scripts/ufo-state-census.test.mjs anchors=3 ok=2 moved=0 changed=1 gone=0

# Anchor fidelity — `scripts/ufo-state-census.test.mjs` (C2, 31c465f1)

Scope: every anchor in `corpus/knowledge/remaining-scripts-census.md` that cites this
member, judged at upstream pin `31c465f1` against the note revision `964f443e`
(upstream diff: +82/−1 lines). Read-only seat: notes were not edited. No tools
installed or upgraded.

Anchors in scope: member-section heading (note `:793` + claim `:795`), the full-path
anchor `scripts/ufo-state-census.test.mjs:14`, and the `:20` continuation anchor.
Both line anchors are inside the member's own section; `grep -n
'ufo-state-census\.test\.mjs:[0-9]'` over the note returns exactly one hit (`:795`),
and a repo-wide grep for the same pattern (excluding `.git`, `node_modules`, `.ufo`)
returns no other site.

## Non-ok rows

note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording
---|---|---|---|---|---
corpus/knowledge/remaining-scripts-census.md:793 (claim at :795) | `## \`scripts/ufo-state-census.test.mjs\`` (member heading) | `Live S8 member (91 L, suite)` — size claim 91 L | changed | `scripts/ufo-state-census.test.mjs` (whole file, 172 L at 31c465f1; no line anchor) | Live S8 member (172 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1. Primary surface symbol `censusState` at `scripts/ufo-state-census.test.mjs:14`; also `sparse` at `:20`.

The replacement sentence is 25 words. The revision label `964f443e` is preserved
(the 2026-10-14 re-census was true *at that revision*); only the size is stale at
`31c465f1`, where `wc -l` = **172** (`91 + 82 − 1`).

## Ok anchors (31c465f1)

| note:line | anchor | line content at 31c465f1 | same at 964f443e? |
|---|---|---|---|
| 795 | `scripts/ufo-state-census.test.mjs:14` | `import { censusState } from "./ufo-state-census.mjs";` | yes, byte-identical |
| 795 | `:20` (continuation) | `function sparse(path, bytes) {` | yes, byte-identical |

- `censusState` is still the primary imported surface: besides `:14` it is called at
  `:48`, `:85` (pre-existing tests) and at new `:100`, `:147`, `:148`.
- `sparse` is still the sparse-fixture writer at `:20` and is reused by the three new
  fixture-based tests (`:97`, `:99`, `:118`, `:146`).
- Citation-ledger rule ("line exists and is non-empty") holds for both anchors at the
  pin: the file is 172 lines and `:14`/`:20` are present and non-empty; lines 1–90
  differ from `964f443e` only at `:10` (`sep` added to the `node:path` import).
- Member-section heading identity resolves: the member path exists and is non-empty
  at `31c465f1`; kind `suite` still holds (`import { test } from "node:test"` at `:11`).

## Supplementary stale size site (not counted as an anchor)

Note `:154` census table row `| \`scripts/ufo-state-census.test.mjs\` | 91 | suite |`
carries the same stale 91 L size. It is a registry-table row, not a line anchor or
member heading, so it is excluded from `anchors=3`, but the S8 census table needs the
same correction: `| \`scripts/ufo-state-census.test.mjs\` | 172 | suite |`
(re-anchored at 31c465f1). The round-32 "added members" list entry at note `:404`
still names an existing member and needs no change.

## Upstream diff 964f443e..31c465f1 (two hunks)

```
scripts/ufo-state-census.test.mjs | 83 +++++++++++++++++++++++++++++++++++++++-
 1 file changed, 82 insertions(+), 1 deletion(-)
@@ -8,5 +8,5 @@
-import { dirname, join } from "node:path";
+import { dirname, join, sep } from "node:path";
@@ -90,2 +90,83 @@
 });
+ test("an external sessions root is walked as the sessions class with the retention path grammar", ...)
+ test("the CLI takes the sessions root from --sessions-dir or UFO_SESSIONS_DIR and refuses a symlinked one", ...)
+ test("a sessions root beneath the state root is not walked twice", ...)
+ test("a symlinked CLI launch still runs the census (entry detection realpaths argv[1])", ...)
```

- The only pre-existing line changed is `:10` (`sep` added to the `node:path` import).
  No line at or before `:90` is deleted or renumbered, so neither cited line moved.
- Four tests are appended at `31c465f1:93–172`: external sessions-root walk with the
  `sessions/<runId>` path grammar (`sep` used at `:106`), CLI `--sessions-dir` /
  `UFO_SESSIONS_DIR` with symlinked-root refusal (`census_root_refused`, `:133`),
  nested-root dedupe (`:143`), and symlinked-launch entry detection (`census_usage_error`,
  `:168`).
- Described behavior removed/changed by the diff: **none**. The note's section describes
  only size, kind, and the two symbols; all three claims survive except the size. The
  note makes no claim about test count or coverage, so the four new cases contradict
  nothing in it. [INFERENCE] the suite still passes at `31c465f1` — not executed here
  (builds/tests are out of scope for this seat).

## Commands run and output

- `grep -n "ufo-state-census" corpus/knowledge/remaining-scripts-census.md`
  → `154:` table row, `403/404:` round-32 added-members list, `789:` sibling tool
  heading, `793:` this heading, `795:` the anchor paragraph. No other citation.
- `grep -n "ufo-state-census\.test\.mjs:[0-9]" corpus/knowledge/remaining-scripts-census.md`
  → single hit `795` (both line anchors); repo-wide same-pattern grep (excluded dirs
  noted above) → no hits (exit 1).
- `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD 31c465f1 964f443e`
  → `31c465f15669f744848bd9f5d56191c5085670f7`, `31c465f1…`, `964f443ee53d…`.
- `git -C /fast/scratch/kumitate-r35/src diff --numstat 964f443e 31c465f1 -- scripts/ufo-state-census.test.mjs`
  → `82\t1\tscripts/ufo-state-census.test.mjs`.
- `git -C /fast/scratch/kumitate-r35/src diff -U2 964f443e 31c465f1 -- scripts/ufo-state-census.test.mjs`
  → the two hunks reproduced above (import at old/new `:10`; four appended tests).
- `git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/ufo-state-census.test.mjs | wc -l`
  → `91` at `964f443e`, `172` at `31c465f1` (172 expected = 91 + 82 − 1).
- `git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/ufo-state-census.test.mjs | awk 'NR==14||NR==20'`
  → both revisions print `14: import { censusState } from "./ufo-state-census.mjs";` and
  `20: function sparse(path, bytes) {` byte-identically.
- `sed -n '789,797p' corpus/knowledge/remaining-scripts-census.md` (raw, `cat -A`)
  → heading `:793`, blank `:794`, single-line anchor paragraph `:795`, blank `:796`;
  section is exactly one paragraph (no hidden continuation anchors).

## Remaining unknowns

- The re-anchored size (172 L) is the whole-file `wc -l`; the note's convention does not
  state whether a trailing newline is counted, but it matches the old `91` the same way,
  so the comparison is consistent.
- No test execution, lint or build was performed (not assigned).
