FIDELITY scripts/check-hand-authored-sets.test.mjs anchors=2 ok=2 moved=0 changed=0 gone=0

# Anchor fidelity — `scripts/check-hand-authored-sets.test.mjs` (C2, 31c465f1)

Scope: every anchor in `corpus/knowledge/remaining-scripts-census.md` that cites this
member, judged at upstream pin `31c465f1` against the note revision `964f443e`.
Read-only: notes not edited. No tools installed or upgraded.

## Anchors found

| note:line | cited anchor | symbol/claim | status |
|---|---|---|---|
| 467 | `scripts/check-hand-authored-sets.test.mjs:14` | import of `DECLARED_PRE_HOOKS` (primary surface symbol) | ok |
| 467 | `:54` (continuation) | `checkHandAuthoredSets(root)` first shadow-baseline assertion | ok |

No non-ok rows: `moved=0 changed=0 gone=0`.

## Evidence per anchor (31c465f1)

- Note line 467, anchor `:14`:
  `import { DECLARED_PRE_HOOKS, checkHandAuthoredSets, lintCard } from "./check-hand-authored-sets.mjs";`
  Identical at `964f443e:14`; the import still binds `DECLARED_PRE_HOOKS`, still consumed at
  `:37` (`for (const hook of DECLARED_PRE_HOOKS) touch(root, ...)`).
- Note line 467, continuation `:54`:
  `assert.deepEqual(checkHandAuthoredSets(root), { ok: true, violations: [] });`
  Identical at `964f443e:54`, same enclosing test
  `"the shadow baseline and the live tree both hold exactly their declared sets"` (`:51`).
- Note line 467, size/kind claim `(141 L, suite)`: `git show 31c465f1:... | wc -l` = `141`;
  file still a `node:test` suite (`import { test } from "node:test"` at `:12`).
- Member-section heading (note `:465`) `## \`scripts/check-hand-authored-sets.test.mjs\``:
  member path resolves at `31c465f1` (file present, non-empty).
- Identity citations (no line anchors): note `:105` table row (141, suite) and `:388`
  member list entry both still name an existing member; no drift.

## Upstream diff 964f443e..31c465f1 (sole hunk)

```
scripts/check-hand-authored-sets.test.mjs | 4 ++--
@@ -94 +94 @@
-    rmSync(join(root, ".omp/hooks/pre/primeagent-assimilation.js"));
+    rmSync(join(root, ".omp/hooks/pre/ufo-l0-monitor.js"));
@@ -101 +101 @@
-      ["missing", ".omp/hooks/pre/primeagent-assimilation.js"],
+      ["missing", ".omp/hooks/pre/ufo-l0-monitor.js"],
```

Fixture retarget only: the planted-orphan case now deletes a surviving pre-hook member,
because `.omp/hooks/pre/primeagent-assimilation.js` was deleted upstream
(`git ls-tree 964f443e .omp/hooks/pre/` lists it; `git ls-tree 31c465f1 .omp/hooks/pre/`
lists only `ufo-godspeed-inject.js`, `ufo-l0-monitor.js`).
No note sentence describes the fixture or the pre-hook membership, so no described
behavior in note `:467` was removed or changed by this diff — nothing to flag.
[INFERENCE] `DECLARED_PRE_HOOKS` in the producer `.mjs` was updated to drop the removed
member; the suite's `:37` stub loop therefore still matches the live tree (not executed here).
The note's revision label `964f443e` remains accurate for these two anchors; no
`re-anchored at 31c465f1` replacement is warranted.

## Commands run and output

- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/check-hand-authored-sets.test.mjs`
  → 1 file, 2 insertions(+), 2 deletions(-); hunks `@@ -94` and `@@ -101` only.
- `git -C /fast/scratch/kumitate-r35/src diff --numstat 964f443e 31c465f1 -- <member>`
  → `2	2	scripts/check-hand-authored-sets.test.mjs`.
- `git show <rev>:scripts/check-hand-authored-sets.test.mjs | grep -n 'DECLARED_PRE_HOOKS\|checkHandAuthoredSets\|primeagent-assimilation\|ufo-l0-monitor'`
  → both revs: `14:` import, `37:` consumer, `54:` assertion, `58/74/99/135:` other calls;
  at `964f443e` also `94/101` `primeagent-assimilation.js`, replaced at `31c465f1` by `ufo-l0-monitor.js`.
- `git show <rev>:... | wc -l` → `141` at both revisions.
- `git show <rev>:... | sed -n '50,58p'` → byte-identical between revisions.
- `git ls-tree --name-only <rev> .omp/hooks/pre/` → 3 entries at `964f443e`,
  2 at `31c465f1` (the deleted `primeagent-assimilation.js`).
- `grep -n 'check-hand-authored-sets\.test\.mjs:' corpus/knowledge/remaining-scripts-census.md`
  → single hit, note `:467` (both line anchors there); no other `file:N` citation exists.

Lane HEAD /home/vgpnk/Projects/shokunin/kumitate-shokunin at `1770305`; notes were only read.
