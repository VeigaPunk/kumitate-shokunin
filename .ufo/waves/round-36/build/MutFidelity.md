MUT fidelity kills=5/5 survivors=none

# MutFidelity — FIDELITY v1 mutation probe

## Artifact under test
- Delivered bytes: `/fast/scratch/kumitate-r36/w/ExecClaimsFidelity/lane/scripts/claims-check.mjs`
  sha256 `6c21180ee20f6f127fddcba70e95296fd11b9adca8f5b9c20574d24b76a20789`, 78230 B, mtime 02:40:21.
  Executor (`KumitateR36.ExecClaimsFidelity`, IRC 02:44): "final … The file is stable — I will not edit it further."
  Patch `/fast/scratch/kumitate-r36/w/ExecClaimsFidelity.patch` sha256 `fddfb98ec56d808693e86829e969a7cf8a29e6df447709858aa038bcfdefd73b`.
- Detector = delivered hermetic suite, `node <file> --selftest` with `UFO_SRC=/nonexistent`.
  Baseline pristine: `CLAIMS_SELFTEST: 56/56 pass`, `VERDICT: PASS`, exit 0.
- Live reference (behavior delta only; not the detector), master notes in the scratch lane:
  `node delivered-claims-check.mjs --fidelity --self .../MutFidelity/lane --src /fast/scratch/kumitate-r36/src`
  → exit 1, `FIDELITY_TOTAL anchors=1520 ok=456 elsewhere=280 absent=77 dead=172 noid=535 nonok=357`,
  `FIDELITY: DRIFT (nonok=357 src-rev=31c465f15669)` — matches the executor's final-rule baseline.

## Method
For each mutant: restore pristine bytes to `work-claims.mjs`, assert `old` occurs exactly once, replace with
`new`, run the full selftest, restore pristine bytes, verify sha256 equality. Driver
`/fast/scratch/kumitate-r36/w/MutFidelity/mutate.mjs`, spec `mutation-spec.json`
(`node mutate.mjs mutation-spec.json`, exit 0). All five `old` snippets occurred exactly once. After every
mutant the restored work file sha256 equals the delivered file; a final rerun of those restored bytes is
`CLAIMS_SELFTEST: 56/56 pass`, `VERDICT: PASS`, exit 0.

## M1 — KILLED by `FIDELITY classification: ok/elsewhere/absent/dead/noid, exact per-note line, DRIFT exit 1`
`classifyAnchor`: file-wide occurrence replaces the cited-range test.
```
old:  if (lines.slice(range.a - 1, range.b).join('\n').includes(symbol)) return 'ok';
      return lines.some((l) => l.includes(symbol)) ? 'elsewhere' : 'absent';
new:  if (lines.some((l) => l.includes(symbol))) return 'ok';
      return 'absent';
```
- Mutant sha256 `c267bab4ff62782d…`. Selftest exit 1, `50/56 pass`, `VERDICT: FAIL`; 6 FAILs.
  Killing case prints `… anchors=21 ok=8 elsewhere=0 absent=1 dead=4 noid=8 nonok=1`
  (expected `ok=7 elsewhere=1 absent=1 dead=4 noid=8 nonok=2`). The other five FAILs are the same
  misclassification surfacing through the pin/ratchet cases (list shared with M5 below).
- Live: exit 1, `FIDELITY_TOTAL anchors=1520 ok=736 elsewhere=0 absent=77 dead=172 noid=535 nonok=77`.
- Restored exact (sha above).

## M2 — KILLED by the same classification case
`adjacentSymbol`: the preceding-symbol fallback is replaced by a following-span (idx+2) fallback. Exact diff
(the `rightOk` definition, `if (rightOk) return right.t;` and trailing `return null;` are unchanged):
```
-  const leftOk = left !== undefined && anchor.s >= left.e && anchor.s - left.e <= FIDELITY_ADJ
-    && pairableSpan(left.t) && !FIDELITY_LEFT_BLOCK.test(line.slice(left.e, anchor.s));
-  if (rightOk && leftOk) return null;
-  if (leftOk) return left.t;
+  const next = spans[idx + 2];
+  const nextOk = next !== undefined && next.s >= anchor.e && next.s - anchor.e <= FIDELITY_ADJ
+    && pairableSpan(next.t) && !FIDELITY_RIGHT_BLOCK.test(line.slice(anchor.e, next.s));
+  if (rightOk && nextOk) return null;
+  if (nextOk) return next.t;
```
- Mutant sha256 `4763baa7c19edee5…`. Selftest exit 1, `50/56 pass`; killing case prints
  `… anchors=21 ok=2 elsewhere=0 absent=1 dead=4 noid=14 nonok=1` — every left-paired `ok` collapses to `noid`.
- Live: exit 1, `FIDELITY_TOTAL anchors=1520 ok=0 elsewhere=5 absent=2 dead=172 noid=1341 nonok=7`.
- Restored exact.

## M3 — KILLED by `FIDELITY ratchet pass: listed ceiling and total admit the debt → CLEAN ratchet=ok`
Per-note ceiling equality stops passing (`<=` pass semantics become `<`; violation test `>` becomes `>=`).
Total comparison left pristine in this primary mutant.
```
old:  if (n > ceiling) violations.push(
new:  if (n >= ceiling) violations.push(
```
- Mutant sha256 `771df0476eb086b3…`. Selftest exit 1, `55/56 pass`; the only FAIL is the ratchet-pass case:
  `exit=1 last=FIDELITY: DRIFT (note=corpus/knowledge/fx-a.md nonok=2 ceiling=2 src-rev=24aebd81f982)`.
- Live with `ratchet-pass.json` (ceilings == pristine nonok, total 357): pristine exit 0 CLEAN `ratchet=ok`;
  mutant exit 1 `DRIFT (note=… nonok=10 ceiling=10; … +13 more)`.
- Restored exact.

## M4 — KILLED by `FIDELITY ratchet revision stale: ratchet revision != verified HEAD → exit 2`
Revision equality check disabled (the no-pin `RATCHET_REV_STALE` branch is untouched).
```
old:  if (read.ratchet.revision !== origin.srcRev) {
new:  if (false) {
```
- Mutant sha256 `2877c15c0e614f18…`. Selftest exit 1, `55/56 pass`; the only FAIL is the revision-stale case
  (expects exit 2 `RATCHET_REV_STALE`, gets the ratchet-path verdict instead).
- Live with `ratchet-stale.json` (revision `f`×40, valid ceilings): pristine exit 2
  `FAIL-CLOSED (RATCHET_REV_STALE … != verified origin HEAD 31c465f1…)`; mutant exit 0
  `FIDELITY: CLEAN (… nonok=357 ratchet=ok src-rev=31c465f15669)` — a stale debt file scores clean.
- Restored exact.

## M5 — KILLED by the same classification case
`absent` is counted as `ok` (a symbol nowhere in the file becomes a passing anchor).
```
old:  return lines.some((l) => l.includes(symbol)) ? 'elsewhere' : 'absent';
new:  return lines.some((l) => l.includes(symbol)) ? 'elsewhere' : 'ok';
```
- Mutant sha256 `e44efef191c32268…`. Selftest exit 1, `50/56 pass`; killing case prints
  `… anchors=21 ok=8 elsewhere=1 absent=0 dead=4 noid=8 nonok=1`. Same six FAIL labels as M1:
  classification; FIDELITY pin; ratchet pass; ratchet per-note regression; ratchet total regression;
  ratchet unlisted-note case.
- Live: exit 1, `FIDELITY_TOTAL anchors=1520 ok=533 elsewhere=280 absent=0 dead=172 noid=535 nonok=280`.
- Restored exact.

## Supplementary (not counted in 5/5): M3T — total-ceiling equality
`old: if (nonok > ratchet.total) violations.push(` → `new: if (nonok >= ratchet.total) violations.push(`
- Mutant sha256 `b53e8f9ecb7877b5…`. Selftest `55/56`; only FAIL = ratchet-pass case
  (`last=FIDELITY: DRIFT (total nonok=2 ceiling=2 …)`). Live ratchet-pass: exit 1
  `DRIFT (total nonok=357 ceiling=357)`. Restored exact.

## Coverage notes
- All five required mutants killed; no survivor, no named gap.
- Concentration (not a gap): M1, M2, M5 all die on the single exact-count classification case. That case is
  sensitive to each (its expected line changes in a distinct way per mutant), but a future simplification of
  that fixture would remove three detectors at once.
- M3/M4 are each killed by exactly one dedicated case; their live deltas (M4 silently accepts a stale ratchet)
  confirm those cases are load-bearing.

## Commands run
- `node delivered-claims-check.mjs --fidelity --self .../MutFidelity/lane --src /fast/scratch/kumitate-r36/src`
- `node delivered-claims-check.mjs --fidelity --fidelity-ratchet ratchet-{pass,tight,stale}.json --self … --src …`
  (pristine: 0 CLEAN / 1 DRIFT / 2 RATCHET_REV_STALE)
- `node mutate.mjs mutation-spec.json` (per-mutant selftest + live runs)
- `node work-claims.mjs --selftest` after restoration (56/56 PASS, exit 0)

## Restoration evidence
Every mutant recorded `restoredExact=true` with restored sha256
`6c21180ee20f6f127fddcba70e95296fd11b9adca8f5b9c20574d24b76a20789`; final `work-claims.mjs` matches
`delivered-claims-check.mjs` byte-for-byte and reruns 56/56 PASS. No writes outside
`/fast/scratch/kumitate-r36/w/MutFidelity/` and this report; `/fast/scratch/kumitate-r36/src` stayed
read-only (`git status --porcelain` empty). No tools installed.
