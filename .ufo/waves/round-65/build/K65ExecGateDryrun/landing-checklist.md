# C2 landing checklist — dry-run proven (round 65, seat K65ExecGateDryrun)

Dry-run base: `2ca91a0c81542cad5f731049aa55dd2f99ade98d` (the freeze commit), in a throwaway clone.
Do **not** land on `47fe2383151909d31557ada118ad84f90404dc6c`: the frozen round-65 probe files and
`scripts/harm-matrix.mjs` are absent there, `readme-map` already reads
`DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md`
(the D2 row landed only at the freeze), `proxy-check` reads `C2_TOTAL_DRIFT … +1` and
`AXES_DRIFT coverage: ## Axes row=10 derived=9`, `harm-matrix-selftest` exits 1 with ENOENT, and
`git apply` of the landing patch fails at `corpus/README.md:190` because that row does not exist yet.

The ordered edits below, applied in a clone at `2ca91a0` plus the two C1 pin repairs, take every gate
of `scripts/harm-matrix-gates.json` to clean except the two host-state censuses (see "Never attribute").

All commands run in the lane root. `<sha>` = `sha256sum <file> | cut -d' ' -f1`.
Reference patches: `landing.patch` (edits 1-6) and `gate-repairs.patch` (edits 7-8) in this directory, each
re-applied on a pristine clone at `2ca91a0` and re-measured (`README_MAP: CLEAN files=158 …`,
`SOURCES_CHECK: CLEAN (rows=142 …)`, `SOURCE_CAPTURE: CLEAN captures=35`, `PROXY: MATCH (… C2=158/158 … pins=6 match)`).
The patches carry placeholder bytes and must not be landed verbatim; the real entry and captures replace them.

## Ordered edits

1. **New entry** `corpus/knowledge/omp-installed-release-mcp-runtime.md`.
   First five lines must be `source:` / `verified-at: 2026-10-25` / `recheck:`; the `source:` line cites
   **S201 S202 S203** (>= 3 distinct ids). Every cited id must be a committed row at land time.
   - Keep the release hash **inside URLs only**. cite-check reads `<rev|revision|rev-pinned|HEAD|commit|sha256|pinned>`
     followed by 7-40 hex as a pin; `commit 45c35e40…` in prose or in a SOURCES cell is `REV_UNKNOWN`
     (the oh-my-pi repo is not a searched tree). Measured: +4 errors for 3 rows + the entry header.
   - This dry-run used the staged `merge/kumitate/` entry as a placeholder. The real landing is re-grounded on
     rows opened this round, never copied (assimilation rule) — no gate reads that, the round record does.
   Prove: `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=142 … entries_with_source=22 legacy=38)`;
   `node scripts/cite-check.mjs` → `errors=1545 warnings=771` (the freeze baseline: zero delta).

2. **Three rows** appended under `## Registry` in `corpus/SOURCES.md` (before `## Paths`), ids **S201-S203**,
   each **11 cells** = 13 split fields, `status=mined`, `opened=2026-10-25`, `tier=A|B`, a URL in the
   `source` cell, `used-by` naming `corpus/knowledge/omp-installed-release-mcp-runtime.md`.
   Prove: `node scripts/sources-check.mjs` (line above, rows 139 → 142);
   `node scripts/source-dupes.mjs` → `SOURCE_DUPES: CLEAN groups=6 known=6`;
   `node scripts/cite-sources.mjs` → `CITE_SOURCES: CLEAN cited=196`;
   `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file "$PWD/corpus/SOURCES.md"`
   → exit 0, `file ok` + the 6 pre-existing W04 warnings (S034/S068/S084/S095/S123/S126).

3. **Captures committed + pinned.** Commit the fetched bytes (keep `.html`/`.md`/`.ts` — see edit 7 on `A`)
   and add to `.ufo/pins/source-captures.json` one entry per row:
   `{"sourceId":"S20n","path":"<repo-relative>","sha256":"<sha>","bytes":<n>,"captured":"2026-10-25"}`.
   Path must stay beneath the lane (no `..`, no absolute), regular file, no duplicate `sourceId`.
   Prove: `node scripts/source-capture.mjs` → `SOURCE_CAPTURE: CLEAN captures=35 exemptions=107`
   (before the pin: `DRIFT captures=32 exemptions=107 bad=3 first=S201:uncaptured`, exit 1).

4. **README map row** in `corpus/README.md`, first cell exactly ``| `knowledge/omp-installed-release-mcp-runtime.md` | …``.
   Append after the last map row. Prove: `node scripts/readme-map.mjs` →
   `README_MAP: CLEAN files=158 rows=158 covered=158`; without the row the gate reads
   `uncovered:<path>`, and without the pin below it reads `unpinned:<path>` (both arms observed at
   `47fe2383` as `uncovered:lessons/round-64-verifier-spotcheck.md` / `unpinned:lessons/round-64-verifier-spotcheck.md`).

5. **readme-map pin** `.ufo/pins/readme-map.json`: append `"knowledge/omp-installed-release-mcp-runtime.md"`
   to `covered` (keep `"version": 2`; alphabetical order is the convention, not a rule).
   Prove: the `readme-map` line above (unpinned disappears).

6. **PROVINCE.md frontier line** naming the entry path, with one of `frontier|band|ground|first entry|advanced`
   on the same line (the frozen O7 test). Prove: `.ufo/waves/round-65/probe/omp65-probe.mjs` O7 segment
   `province-names-entry=true`; also `grep -n 'omp-installed-release-mcp-runtime' PROVINCE.md`.

7. **SCORECARD proxy stanza refresh** (`<!-- kumitate-proxy-v1 … -->`): `C2` and `C2_total` to the live
   counts (158/158 after this landing) and `A` to the live count (357 at the freeze tip). `A` counts every
   `*.mjs|*.js|*.sh|*.py` file under the lane except `.git` — **including** `.ufo/waves/**` probes and any
   seat's build-dir helper. At the freeze tip the declared 351 is stale by +6:
   `scripts/harm-matrix.mjs`, `scripts/omp-binary-probe.sh`,
   `.ufo/waves/round-65/probe/{gen-harm-cases.mjs,harm65-probe.mjs,omp65-probe.mjs,omp-donothing-control.sh}`.
   Measure with `git ls-tree -r --name-only HEAD | grep -cE '\.(mjs|js|sh|py)$'` (working tree adds untracked
   files too). Refresh at the close, after every wave artifact is committed, and forbid new `.sh/.mjs/.py`
   under `.ufo/waves/round-65/build/` unless the count is re-taken.
   Prove: `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH (A=357 … C2=158/158 coverage=10 … pins=6 match)`
   (before: `C2_DRIFT … delta=+2; C2_TOTAL_DRIFT … delta=+2`).

8. **C1 pin registration for `scripts/harm-matrix.mjs`** (red at freeze as `PIN_UNPINNED`). Three coupled edits,
   in this order — doing only (a) fail-closes the gate:
   - (a) `pin.harm-matrix=<sha of scripts/harm-matrix.mjs>` in the `kumitate-gate-pins-v1` block;
   - (b) register the key in `scripts/proxy-check.mjs` `GATE_PINS`:
     `'pin.harm-matrix': 'scripts/harm-matrix.mjs',` — without it:
     `PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 335: pin.harm-matrix is not a kumitate-gate-pins-v1 key`, exit 2;
   - (c) refresh `pin.proxy-check=<sha of scripts/proxy-check.mjs>` after (b) (else `GATE_PIN_DRIFT`).
   Recompute (a) if a forge seat edits the tool after the pin is written; recompute (c) after any proxy-check edit.
   Prove: the `PROXY: MATCH … pins=6 match` line above.

9. **Content duties the machinery cannot supply** (frozen O65 on the placeholder landing reads
   `OMP65_UNMET held=4/8 … | O4 MISS bullets=0 … | O5 MISS no-bullets | O6 MISS stated-keys=0 … | O8 MISS no-amendment-heading`):
   `## Located quotes` (>= 6 bullets `- S### — "<quote>"`, <= 25 words, found in capture and live), `## Host measurements`
   (>= 12 `- key=value` bullets equal to a fresh `bash scripts/omp-binary-probe.sh`), body naming `lit_2026_07_28`
   and `real_version`, and the append-only `Amendment 2026-10-25` in `corpus/knowledge/omp-task-contract.md`
   (base bytes a prefix; section names the entry path and `Version skew`).
   Prove: `node .ufo/waves/round-65/probe/omp65-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>` → `OMP65_HELD held=8/8`.

## Expected full-registry result after edits 1-8

`gates-landed-repaired.txt` (20/20 gates run, 47 s): 18 clean, 2 red and not the landing's:
`kimi-census` `DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)`
and `omp-census` `DRIFT (root=/home/vgpnk/.omp/agent entries=42 findings=10)`. Both read identically at
`47fe2383`, at `2ca91a0` and after the landing: host state, never attribute them to a revision.

Extra gates outside the registry, same run: `sources-check`, `source-capture`, `source-dupes`, `cite-sources`,
`readme-map`, `proxy-check --strict` all clean; `cite-check` DRIFT at the freeze baseline and byte-identical
after the landing (1545 errors / 771 warnings) — outside the registry by the plan's stated limit.

## Never attribute

- `AXES_DRIFT coverage: ## Axes row=10 derived=9` is the **base** `47fe2383` reading only; the freeze repaired it.
- `COUNTER_PINS: CLEAN pins=25` at base vs `pins=30` at freeze: the five round-65 counter pins — expected.
- `report-receipt-diff` and the other selftests are unaffected by the landing (all `PASS` at freeze and after).
