ATTACK scripts/omp-role-work.mjs verdict=holds defects=0

Target: re-anchored S8 member section `## scripts/omp-role-work.mjs` in
corpus/knowledge/remaining-scripts-census.md (worktree lines 622-625; master
584-592). Attack = read every anchor against the pinned upstream tree
/fast/scratch/kumitate-r35/src, detached at 31c465f1 (verified: HEAD =
31c465f15669f744848bd9f5d56191c5085670f7; base commit 964f443ee53d... resolves).

## 1. Population-table row

- census line 145: `| scripts/omp-role-work.mjs | 294 | tool |` — unchanged
  from master (`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/omp-role-work.mjs | wc -l` → 294). MATCH.
- classification `tool`: `grep -nE 'process\.argv|isMain|main\('` on the pinned
  file finds nothing (exit 1) — no CLI; single non-test consumer
  `scripts/run-omp-native-trial.mjs:15` imports `roleWork` and calls it at
  `run-omp-native-trial.mjs:3528`. Consistent with library `tool`. OK.

## 2. Every anchor in the section, read at 31c465f1

Fidelity report (.ufo/waves/round-35/build/FidOmpRoleWork.md) declares 11
anchors: 10 line anchors + heading; wave-1 moved 4 and reworded 1. All 10 line
anchors re-verified independently here (`git show 31c465f1:... | grep -nE`):

| anchor | claim | line at 31c465f1 | verdict |
|---|---|---|---|
| :21 | `seatId` from ufo-native-names.mjs | `import { seatId, seatLabel } from "./ufo-native-names.mjs";` | MATCH (ufo-native-names.mjs exports `seatId` :40, `seatLabel` :45) |
| :23 | `RoleWorkError` | `export class RoleWorkError extends Error {` | MATCH |
| :38 | `ROLE_METHODS`, ten role postures | `const ROLE_METHODS = {`, block 38-59, 10 keys (scout, reviewer, critic, connector, sentinel, executor, mutation-tester, revenger, simplifier, scribe) | MATCH (count re-derived) |
| :69 | `SCOPE_DUTIES`, 16 frozen "role:scope" duties | `const SCOPE_DUTIES = {`, block 69-117, 16 `"<role>:<scope>"` keys (count re-derived) | MATCH |
| :121 | `SHARED_BOUNDS` | `const SHARED_BOUNDS = [` | MATCH |
| :129 | `ROLE_EXTRA_BOUNDS` | `const ROLE_EXTRA_BOUNDS = {` | MATCH |
| :23 guard behaviors | malformed duty key / non-function duty / non-string bounds arrays | `unknown_scope` throw :152, `invalid_table` (non-function) :155, `invalid_table` string-array :160, `unknown_role` :166 | MATCH (import-time; all inside top-level loop/for) |
| :171 | `META_CTRL_STRIP` | `const META_CTRL_STRIP = /[\u0000-\u001f\u007f-\u009f]/gu;` | MATCH |
| :189 | `evidenceSection` | `function evidenceSection(ctx) {` | MATCH |
| :213 | `roleWork` | `export function roleWork(spec, root, runDir) {` | MATCH |
| :239 | `invalid_key` | first invalid_key `fail("invalid_key", "spec.key must be an own property")` at :239 (more at :243, :246, :254) | MATCH |

Behavior clauses verified against pinned body:
- "pure template helper ... writes nothing": imports are `node:path` :20 and
  `seatId, seatLabel` :21; grep for `writeFile|fs\.|console\.` finds nothing;
  `roleWork` returns a joined string :294. OK.
- "evidenceSection (`:189`) renders the evidence schema and points to
  `<runDir>/evidence/<seatLabel>.json` with scratch under `<runDir>/scratch/`":
  `ctx.evidencePath = path.join(ctx.runDir, "evidence", \`${label}.json\`)` at
  :272 and `ctx.scratchDir = path.join(ctx.runDir, "scratch", label)` at :273;
  `label` = `seatLabel(key)` :252. The re-anchored wording (schema + both path
  clauses) is strictly more accurate than master's ("the block's evidence schema
  is rendered by evidenceSection ... pointing at ...") — no false claim. OK.
- "strips C0/C1 controls and DEL": regex spans \u0000-\u001f (C0), \u007f (DEL),
  \u0080-\u009f (C1). Applied in `sanitizeMetaField` (lineage) and
  `sanitizeAxesField` (axes) before the duty body. OK.
- "it does not strip U+2028/U+2029 or bidi overrides": grep for
  `2028|2029|200E|200F|202A|202E|bidi` on the pinned file finds nothing. OK.
- "An inherited or forged key is rejected as invalid_key ... preventing a
  prototype-polluted spec or hostile key from forging a seat identity":
  `Object.hasOwn(spec, "key")` :239, `key.role !== role` :243,
  `Object.hasOwn(key, "instance")` :246, wrapped `seatId(key)` :251. OK.
- Note dropped master's "or smuggle a second line into the assignment": the
  :171 regex removes \n (in C0 range) from lineage/axes, so dropping the clause
  loses no true content. OK.

## 3. Upstream drift and revision label

- `git diff 964f443e 31c465f1 -- scripts/omp-role-work.mjs` = 1 file, +1/-1,
  one hunk `@@ -83,7 +83,7 @@`: the `executor:repeated-run-reliability` duty
  string at :86 changes `${ctx.root}/src/pareto.ts` →
  `${ctx.root}/packages/ufo-core/src/pareto.ts` (+ ./policy.ts/./types.ts
  imports) and `strictParetoGate` → `admitMove`. No census anchor cites
  pareto/strictParetoGate/admitMove (grep over census: no matches). The single
  changed line is inside the :69-117 SCOPE_DUTIES block, whose :69 anchor and
  "16 duties" count are unaffected (string edit inside one value). OK.
- Revision label kept: section ends "re-anchored at 31c465f1 (round 35)"
  (census line 625). OK.
- Removed-clause trace: the only removed clause is the U+2028/U+2029/bidi
  claim, and it was converted into an explicit negative ("it does not strip
  U+2028/U+2029 or bidi overrides") rather than deleted; both the master-false
  and worktree-true spellings are quoted above. There are no
  `(round 35: removed ...)` clauses in this section (the convention exists
  elsewhere in this same file, 12 occurrences, e.g. lines 471, 641, 655), and
  none is owed here because nothing was silently deleted. OK.
- Wave-1 input FidOmpRoleWork.md agrees with the re-anchored text (anchors 213,
  189, 171, 239; overclaim reworded). Its one [INFERENCE]-flavored residual —
  whether the launcher strips U+2028/U+2029 elsewhere — is out of member scope
  and not claimed here.

## 4. Sibling notes cross-check

- Line 410 lists `scripts/omp-role-work.test.mjs` under the round-32 removals
  ("files no longer present under origin HEAD 964f443e") — confirmed absent at
  both 964f443e and 31c465f1 (`git show` → path does not exist). Consistent;
  no phantom. [INFERENCE: round-32 prose predates the 31c465f1 pin wording; it
  names a revision that does lack the file, so it stays true.]
- `corpus/knowledge/native-trial-launch.md:79` mentions `roleWork` without a
  line anchor — no anchor to falsify, no conflict with :213.

## 5. Checks for new false claims introduced by the round-35 edit

- "ten role postures" (:38): recounted from pinned bytes = 10. OK.
- "16 frozen duties" (:69): recounted = 16. OK.
- ":213 roleWork renders the duty block a launcher embeds": sole launcher
  caller verified at run-omp-native-trial.mjs:3528. OK.
- No stale anchor survived the re-anchor (master's :233/:209/:176/:259 are all
  gone from the section). No false claim found.

Residual risk / gaps:
- All counts were re-derived from the pinned bytes; the fidelity report's
  remaining claims (diff hunk shape, key counts) were independently reproduced.
- The `-10 -1` hunk grep artifact in the first diff call was a display-truncation
  quirk of the harness output; the authoritative `git diff 964f443e 31c465f1`
  (run directly) shows exactly +1/-1, one hunk. Nothing in the note depends on
  the disputed line.
- 294-line equality at both revisions observed; byte-level identity of the
  unchanged 293 lines was not diffed beyond the single hunk (git diff is
  authoritative).
