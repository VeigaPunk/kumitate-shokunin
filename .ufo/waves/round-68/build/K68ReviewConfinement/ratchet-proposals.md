# Ratchet patch proposals — K68ReviewConfinement (strengthening only; counters are FROZEN this round)

Not edits. For the L1 to integrate in a later freeze. Every patch preserves or tightens behavior.

## P1 — ledger68-probe.mjs: hoist the static-read-path sweep above L1 and lstat it

Defect class: (a) L1 executes the archive's tool before the sweep (canary proof), while rule L7 says
"fails closed EXTRACTION_UNSAFE **before any check**"; (b) a **dangling** symlink at SKILL/QUALITY/SCORECARD.md
is not caught by the sweep's `existsSync(ap) && !chainSafe(ap)` guard (existsSync is false for a dangling
link, and UNSAFE is only set later by L6's `rd`), so it degrades to exit 1 (L6 MISS) instead of exit 2.

Replace the confinement block (currently after L3, `ledger68-probe.mjs:293-302`) with, placed BEFORE the L1 block:

```js
function pathUnsafe(ap) {
  let st;
  try { st = lstatSync(ap); } catch { return false; } // absent: checks will MISS on the read
  return st.isSymbolicLink() || !chainSafe(ap);
}
{
  const staticPaths = ['corpus/routed-ledger.md', 'SKILL.md', 'corpus/QUALITY.md', 'SCORECARD.md'];
  for (let n = FROM; n <= TO; n += 1) staticPaths.push(spotPath(n));
  if (staticPaths.some((p) => pathUnsafe(join(A, p))) || UNSAFE) { /* same EXTRACTION_UNSAFE exit 2 */ }
}
```

Keeps: absent files → plain MISS; benign symlinks elsewhere tolerated; regular read paths pass.

## P2 — deprec68-probe.mjs: same `pathUnsafe` for its staticPaths, hoisted above M1

Currently `deprec68-probe.mjs:197-204`: `staticPaths = ['corpus/SOURCES.md', '.ufo/pins/source-captures.json', 'PROVINCE.md']`
with the same `existsSync` guard, placed after M3. A dangling symlink at PROVINCE.md exits 1 (M9 MISS) instead
of the declared EXTRACTION_UNSAFE (rule M10 names PROVINCE.md explicitly). Hoist the sweep above M1 (deprec
executes no revision-controlled code before the sweep, only reads) and use the same `pathUnsafe`.

## P3 — deprec68-probe.mjs header doc: `--no-live` exit code

Header line (line 39): "exit 2 when the revision cannot be read or archived, the environment/extraction is
unsafe, **or --no-live is passed**". Actual: `--no-live` only makes M5 MISS → `process.exit(ok ? 0 : 1)` (line 398)
→ exit 1. Observed: base receipt `deprec68 exit=1`; fixture runs FIX-D4A/FIX-D2 with `--no-live` → exit 1.
Next freeze: either fix the doc line or add an explicit exit-2 branch for `--no-live`. (Frozen now; report-only.)

## P4 — ledger68-probe.mjs docstring: "any symlink" overstates the code (and the plan)

Docstring lines 31-32: "a revision containing any symlink or non-regular file fails closed `EXTRACTION_UNSAFE`
before any check". Code + plan L7 actually tolerate symlinks off the read paths (proven: fixture with only a
symlinked README.md scores normally, exit 1, no EXTRACTION_UNSAFE). Align the docstring with plan L7's wording
("a symlink at or above any static read path … — symlinks elsewhere in evidence trees are tolerated but never
followed"). (Frozen now; report-only.)
