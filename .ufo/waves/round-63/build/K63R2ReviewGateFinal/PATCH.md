# K63R2ReviewGateFinal — minimal patch proposals for scripts/inline-dispatch-evidence.mjs @ a9531c8

All text-only proposals for the L1 (this seat does not edit scripts/). Each was validated
against a scratch copy: selftest 48/48, all 44 `controls/inline/` cases, real w1 `--rev a9531c8`
CLEAN, and (P1) the 6 live w2 seats that currently fail SESSION_TIMELINE.

## P1 — drop the SESSION_TIMELINE span clause (fixes live false positives, kills nothing committed)

The span clause is pinned by no committed evidence (mutant `gate-m2-no-span.mjs`: clause deleted →
selftest 48/48, controls 44/44, real w1 CLEAN) and false-positives on honest seats whose
`session_exit` has not been written yet (6 live w2 seats, spans 35–118 s at last measure).
`rich-instant-timeline` still fails via `distinctTs` (all-equal timestamps → 1 distinct < 8);
`rich-untimed` still fails via `timestamps.length >= 8`.

```diff
--- a/scripts/inline-dispatch-evidence.mjs
+++ b/scripts/inline-dispatch-evidence.mjs
@@ function shapeFindings(t)
-  if (!(t.tsParsed === t.timestamps.length && t.timestamps.length >= SHAPE.distinctTs && t.tsDistinct >= SHAPE.distinctTs && t.spanSec >= SHAPE.spanSec)) out.push('SESSION_TIMELINE');
+  if (!(t.tsParsed === t.timestamps.length && t.timestamps.length >= SHAPE.distinctTs && t.tsDistinct >= SHAPE.distinctTs)) out.push('SESSION_TIMELINE');
@@ const SHAPE = …
-const SHAPE = { rows: 10, assistants: 2, spanSec: 120, distinctTs: 8 };
+const SHAPE = { rows: 10, assistants: 2, distinctTs: 8 }; // spanSec dropped: exit rows are written at
+  // orchestrator collection time, so an honest seat's span is set by collection latency, not by the
+  // seat (live w2: spans 35–118 s while uncollected, 510 s after collection). A forger emits
+  // timestamps freely, so the floor bound nothing but honest data.
```

Equivalent minimal variant kept green in `gate-m3-lowfloors.mjs` (`spanSec: 1, distinctTs: 2`) if the
L1 prefers keeping constants; both validated green on selftest + 44 controls + real w1.

## P2 — pin the `finished()` loosening with selftest cases (the change is currently unpinned)

Mutant `gate-m1-strict-exit.mjs` (revert to `tr.yielded && tr.exitKind === 'normal'`) passes the
48-case selftest, all 44 controls and real w1 — no committed evidence distinguishes the loosened
semantics from the strict one that false-DRIFTed w1's six idle seats. Add inside `selftest()`:

```diff
@@ function selftest()
     { const { f } = mk(['A1']); const o = join(f.sessions, 'orch'); … dead-earlier-try-is-not-ambiguity … }
+    { const { f } = mk(['A1', 'B2'], { tr: { B2: { exit: false } } }); const r = run(f);
+      cases.push(['yield-without-exit-is-finished', r.code === 0 && r.done === 2 && r.dead.length === 0, r.line]); }
+    { const { f } = mk(['A1'], { tr: { A1: { exit: 'error' } } }); const r = run(f);
+      cases.push(['error-exit-is-dead', r.code === 0 && r.done === 0 && r.dead.length === 1, r.line]); }
```

Both cases pass on the integrated gate (verified by inspection of `finished()`; the first kills M1,
the second pins that non-`normal` exits stay dead).

## P3 — map rev-mode spawn errors to fail-closed (unintegrated half of K63ReviewGateCode-9)

```diff
@@ function makeSource(root, rev)
       read(rel) {
         const r = spawnSync('git', ['-C', abs, 'show', `${hash}:${rel}`], { maxBuffer: 256 * 1024 * 1024 });
-        return r.status === 0 ? r.stdout : null;
+        if (r.error) return { error: `REV_IO ${r.error.code || r.error.message}` }; // caller must fail closed
+        return r.status === 0 ? r.stdout : null;
       },
```

(Requires threading the error through `src.read` callers; today a spawn failure is indistinguishable
from file-absent → wrong finding id, verdict still non-CLEAN. Lowest priority.)
