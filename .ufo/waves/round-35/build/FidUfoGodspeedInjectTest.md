FIDELITY scripts/ufo-godspeed-inject.test.mjs anchors=3 ok=2 moved=0 changed=1 gone=0

Anchors counted = the member-section heading (1) + the two `:N` citations in that section (2). The census table row at note:137 also cites the member but carries no line anchor, so it is flagged separately below. A line-anchor-only reading would be anchors=2, ok=2.

## Non-ok anchor row

note:688 | `## \`scripts/ufo-godspeed-inject.test.mjs\`` (section-level claim: `127 L, suite`) | member is 127 L suite measured at 964f443e; `loadHandler` `:33`, `DIRECTIVE` `:52` | changed | file is 180 L at 31c465f1 (`scripts/ufo-godspeed-inject.test.mjs:1-180`); both cited anchors still resolve at `scripts/ufo-godspeed-inject.test.mjs:33` and `:52` | Live S8 member (180 L, suite) re-censused 2026-10-14 against origin HEAD `964f443e`, re-anchored at 31c465f1: `loadHandler` at `scripts/ufo-godspeed-inject.test.mjs:33`; `DIRECTIVE` at `:52`; directive-led pins now live, not `todo`.

## Ok anchors (no row required)

- note:690 `scripts/ufo-godspeed-inject.test.mjs:33` — `function loadHandler() {` is byte-identical at 964f443e and 31c465f1; the function body (lines 33-44) is unchanged and still registers the hook on a fake `pi` and asserts a `tool_call` handler.
- note:690 `:52` — `const DIRECTIVE = readFileSync(join(REPO, "ssot", "godspeed-core", "directive.md"), "utf8").trimEnd();` is byte-identical at both revisions; the continuation anchor resolves against the member named in the same sentence, so it is correct shorthand.

## Position-stability evidence

`git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-godspeed-inject.test.mjs` reports only two hunks: `@@ -9,20 +9,20 @@` (old/new lines 9-28, 7-for-7 comment rewrite plus 6-for-6 import rewrite) and `@@ -117,11 +117,64 @@` (old 117-127 -> new 117-180). Lines 29-116 are untouched, which is why `:33` and `:52` keep both their numbers and their bytes.

## Behavior the diff changed (flag, even though anchors hold)

1. **Known-red `todo` removed.** At 964f443e the last test was declared with `todo: "SUB-1 hook half: hasInvocation matches only /skill:godspeed; the directive-prefix disjunct lands in the batched membrane round (hook is TRUST-OMITTED, ONESHOT §3c-b)"` (964f443e:120-121). At 31c465f1:120 it is a plain `async () => {` pin asserting `await call({ task: assignment }) === undefined` — the hook now leaves directive-led prompts byte-identical. The note's stub never recorded the todo, but its `127 L` and `964f443e` framing imply a file whose last arm is red; that is no longer true at the pinned revision.
2. **Three pins added** (31c465f1): batch mixing directive-led seats with ordinary siblings (`:126`), fleet pair `/skill:ufo\n/skill:godspeed` untouched flat and batch (`:148`), and unreadable `directive.md` failing open to the invocation arms (`:154`, uses a temp hook copy via `pathToFileURL`).
3. **Owning hook also moved:** `.omp/hooks/pre/ufo-godspeed-inject.js` changed +40/-4 in the same range — `hasInvocation` gained a `FLEET_PAIR` regex arm and a cached `canonicalDirective()` arm (fails open to null). The note calls this member "regression pins" only implicitly; the suite now pins three envelope heads, not just the invocation.

## Stale duplicate count

note:137 table row: `| \`scripts/ufo-godspeed-inject.test.mjs\` | 127 | suite |` — same stale count; the C2 re-census table needs 180 for this member. The row is otherwise correct (type `suite` holds: `node:test` with 12 `test(...)` declarations at 31c465f1 vs 9 at 964f443e).

## Commands run and output

```
$ grep -n "ufo-godspeed-inject" corpus/knowledge/remaining-scripts-census.md
137:| `scripts/ufo-godspeed-inject.test.mjs` | 127 | suite |
397:  - `scripts/ufo-godspeed-inject.test.mjs`
688:## `scripts/ufo-godspeed-inject.test.mjs`
690:Live S8 member (127 L, suite) ... `loadHandler` at `scripts/ufo-godspeed-inject.test.mjs:33`; also `DIRECTIVE` at `:52`.

$ git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/ufo-godspeed-inject.test.mjs | wc -l
127
$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-godspeed-inject.test.mjs | wc -l
180

$ git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-godspeed-inject.test.mjs | sed -n '33p;52p'
function loadHandler() {
const DIRECTIVE = readFileSync(join(REPO, "ssot", "godspeed-core", "directive.md"), "utf8").trimEnd();

$ git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 --stat -- scripts/ufo-godspeed-inject.test.mjs
 scripts/ufo-godspeed-inject.test.mjs | 81 +++++++++++++++++++++++++++++-------
 1 file changed, 67 insertions(+), 14 deletions(-)

$ git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 --stat -- .omp/hooks/pre/ufo-godspeed-inject.js
 .omp/hooks/pre/ufo-godspeed-inject.js | 44 +++++++++++++++++++++++++++++++----
 1 file changed, 40 insertions(+), 4 deletions(-)
```

Confidence: high — both anchors verified byte-for-byte at the pinned revision; the only non-ok item is the section-level line count plus the removed `todo` framing. No edits made to notes; no tools installed.
