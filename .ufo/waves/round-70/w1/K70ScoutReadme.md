# K70ScoutReadme — readme-map audit at freeze and newest verifier row

Seat: K70ScoutReadme (scout, leaf). Axis: operability. Milestone: ScoutReadme. Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Mode: read-only; no production file edited; no commit, push, or mutating git/jj run.

Tooling: none installed. Used existing `node` v24.21.0 and `git` 2.56.0 (read-only subcommands only: `rev-parse`, `show`, `ls-tree`, `archive` into scratch). pacman not touched.

## Verdict

Readme-map is CLEAN at the working-copy freeze state and reproduces CLEAN. The base commit 78b98d7 is DRIFT (168 files, 167 rows, 167 pins; `lessons/round-69-verifier-spotcheck.md` has neither row nor pin), which matches `base/readme-map.txt`. No malformed rows, duplicate rows, orphan rows, stale pins, or unpinned files exist in the freeze state. One placement defect: the two newest rows sit outside the Coverage map section (under Known gaps), without a table header. Gate passes it; no edit made.

## Observed commands and outcomes

1. `node scripts/readme-map.mjs` (lane cwd, default paths) → `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0.
2. `TMPDIR=<scratch> node scripts/readme-map.mjs --selftest` → 16/16 cases PASS, `README_MAP_SELFTEST: PASS (16/16)`, `VERDICT: PASS`, exit 0.
3. `git -C <lane> archive 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 corpus .ufo/pins/readme-map.json` extracted to scratch, then the gate run with `--registry/--readme/--corpus` pointed at it → `README_MAP: DRIFT files=168 rows=167 covered=167 bad=2 first=uncovered:lessons/round-69-verifier-spotcheck.md`, exit 1. Base commit has 168 `*.md` files (61 knowledge + 107 lessons), 167 unique rows, 167 pins.
4. Independent audit script `.ufo/waves/round-70/build/K70ScoutReadme/readme-map-audit.mjs` (read-only; first-cell regex identical to the gate):
   - working copy: files 169, rows 169 (unique 169), covered 169 (unique 169), malformedRows [], duplicateRows [], orphanRows [], uncoveredFiles [], unpinnedFiles [], stalePins [].
   - base 78b98d7: files 168, rows 167, covered 167; uncovered and unpinned = `lessons/round-69-verifier-spotcheck.md`; nothing else.
5. `cmp scripts/readme-map.mjs` against base → identical (sha256 b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e). That matches `SCORECARD.md:326 pin.readme-map=b1c8bf97…`. Gate pin not stale.
6. Pin diff base vs working copy (`.ufo/pins/readme-map.json`): covered list grew by exactly two appended entries, `lessons/round-69-verifier-spotcheck.md` and `lessons/round-70.md`. Version 2 in both.
7. README diff base vs working copy: exactly two rows added (after line 293), plus a blank line. Nothing else changed in the README.
8. `grep -nP` for non-breaking space / ZWSP / BOM in README → no hits; no CR line endings.
9. Newest verifier row, `corpus/README.md:294`:
   `| \`lessons/round-69-verifier-spotcheck.md\` | Non-author round-69 verdict and replay-isolation defects | Hyaku closure at 78b98d7 |`
   Well-formed for the gate (backticked clean path, 3 cells). Cell 3 names a base commit but no fleet report or LOG pointer, unlike earlier verifier rows (e.g. line 97: `commit …; fleet …`). Cosmetic, not gate-relevant.
10. Round-70 row, `corpus/README.md:295`: `| \`lessons/round-70.md\` | Round-70 replay-control isolation gate and mistakes | LOG.md round 70; S217 |`. Verified: `corpus/SOURCES.md:169` contains S217; `LOG.md:2338` contains `## 2026-10-30 — round 70`.
11. `sha256sum` of current README, registry, and gate → recorded in `receipts/sha256-current.txt`.

## Findings

- F1 (placement, low): README rows 294–295 are outside the `## Coverage map` section (lines 12–203). They sit under `## Known gaps` (line 205 onward), after the prose at line 292, as a headerless table fragment. The coverage-map rows above use the same blank-line-separated, headerless style after their first block, so the format matches the convention. The location does not. The gate scans the whole file, so it passes. Remedy (not applied): move both rows into the coverage-map block before line 205, or accept the placement and record it as a known wart.
- F2 (stale receipt, informational): `base/readme-map.txt` is accurate for the base commit (DRIFT 168/167/167) but is a base-only receipt. `base/freeze-map.txt` (CLEAN 169/169/169) is the current freeze and reproduces. Both are consistent; neither is stale for its stated scope.
- F3 (pins): no stale pins, no duplicate pins, no unpinned live files in the working copy. Registry version 2 with lstat semantics unchanged.
- F4 (format): no `format-unmapped` cells anywhere in the README. Frontier bullets (lines 297+) that mention `knowledge/...` are non-table lines and are correctly ignored by the row rule.

## Receipts

Private artifacts under `.ufo/waves/round-70/build/K70ScoutReadme/`:
- `readme-map-audit.mjs`
- `receipts/audit-working-copy.json`
- `receipts/audit-base-78b98d7.json`
- `receipts/gate-working-copy.txt`
- `receipts/sha256-current.txt`

Scratch `/fast/scratch/hyaku/kumitate-r70/K70ScoutReadme/` (base-tree archive, pin copies) removed before this yield.

## Remaining unknowns

- None on readme-map. The gate's own semantics for `format-unmapped` were checked against its source, not against an adversarial README.
- The rendered-markdown effect of F1 was not rendered; the judgement that the headerless block is non-table is from GFM rules, not observed output.
