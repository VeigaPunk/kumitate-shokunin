# Stanza Delta — kumitate round 74 (K74ExecReadmeRepair)

Re-derived SCORECARD stanza term changes forced by the readme-map repair.
Prepared by seat `K74ExecReadmeRepair`.
Base revision: `3c369336218329e30248b5d69c41348c02658169`

DO NOT commit this file to `SCORECARD.md` directly — delivered as advisory patch hunk list for L1 integration.

## 1. Re-measured terms (readme-map repair: C2 and C2_total)

Over the repaired tree (with `corpus/lessons/round-74.md`, `corpus/README.md`, and `.ufo/pins/readme-map.json`):
- `C2`: lines of `corpus/README.md` matching `/^\|\s*`(?:knowledge|lessons)\//`
  - Base tree at `3c369336`: 176 rows (missing `lessons/round-73-verifier-spotcheck.md`)
  - Repaired tree: 178 rows (+1 for `lessons/round-73-verifier-spotcheck.md`, +1 for `lessons/round-74.md`)
  - Stanza declared: `C2=167`
  - Re-measured value: `C2=178`
- `C2_total`: `*.md` regular files under `corpus/knowledge` (62) + `corpus/lessons` (116)
  - Base tree at `3c369336`: 62 + 115 = 177 files
  - Repaired tree: 62 + 116 = 178 files (+1 for `corpus/lessons/round-74.md`)
  - Stanza declared: `C2_total=167`
  - Re-measured value: `C2_total=178`
- Coverage calculation:
  - `floor(10 × C1/C1_total × C2/C2_total) = floor(10 × 19/19 × 178/178) = 10`
  - Matches `## Axes` coverage row = 10 (at base open, 176/177 computed 9, triggering `AXES_DRIFT`).

## 2. Hunk 1: C2 and C2_total patch hunk for SCORECARD.md

```diff
--- a/SCORECARD.md
+++ b/SCORECARD.md
@@ -292,2 +292,2 @@
-C2=167
-C2_total=167
+C2=178
+C2_total=178
```

## 3. Neighboring deltas arriving from C2 seat (`K74ExecKimiMembers`)

The following deltas belong to the C2 claim (`K74ExecKimiMembers`), which declares `plugins/installed.json.bak-pre-shokunin` and `plugins/managed/kimi-shokunin`:
- `K_members`: 53 → 55
- `K_sections`: 53 → 55
- `coverage_kimi`: `floor(10 × 5/5 × 55/55) = 10` (unchanged integer 10)
- `pin.kimi-census`: sha256 of `scripts/kimi-census.mjs` (L1 re-pins at integration with real hash)
- `pin.proxy-check`: sha256 of `scripts/proxy-check.mjs` (L1 re-pins at integration with real hash)

Advisory patch hunk for C2 seat terms:
```diff
--- a/SCORECARD.md
+++ b/SCORECARD.md
@@ -302,2 +302,2 @@
-K_members=53
-K_sections=53
+K_members=55
+K_sections=55
@@ -308,1 +308,1 @@
-pin.proxy-check=d6f8dce9b4a36a958960f6361aca66aa6f09a15f0626beac579353f96b33371f
+pin.proxy-check=<sha256 of scripts/proxy-check.mjs at integration>
@@ -310,1 +310,1 @@
-pin.kimi-census=9d27bc9c12546e07f8c54d36dcc73b50cfab56bf3198674febefd6c23ef84f50
+pin.kimi-census=<sha256 of scripts/kimi-census.mjs at integration>
```

## 4. Note on `A` (runnable file count)

The readme-map repair edits only `.md` and `.json` files. No runnable files (`*.mjs`, `*.js`, `*.sh`, `*.py`) are added or removed by this repair. `A` is measured by the L1 at integration close commit.
