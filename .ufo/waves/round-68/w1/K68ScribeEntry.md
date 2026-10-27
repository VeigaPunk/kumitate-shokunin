VERDICT: Entry drafted and counter-proven — with the seat's captures, the 7 SOURCES rows, the 7 capture pins, the PROVINCE line, a README row and a readme-map pin applied to a clone fixture, the frozen counter prints `DEPREC68_HELD held=10/10 checks=10 rev=03547a4b… rule=M68` exit 0 (live, M5 exercised); two counter/gate defects found on the way (M6 counts a markdown delimiter row as data; readme-map needs a pin as well as a row).

## Evidence

All commands run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (absolute paths), fixtures under `/fast/scratch/hyaku/kumitate-r68/K68ScribeEntry/` (deleted before yield; recipe copied to the build dir). Full transcript of every run: `build/K68ScribeEntry/counter-receipts.md`.

1. **Draft written** — `build/K68ScribeEntry/mcp-deprecation-registry.md`, 127 lines, 7 `##` sections; header block lines 1-9 = `source:` S207/S208/S209 (1-3), `verified-at:` (4), `recheck:` (5), `source:` S210/S211/S212/S213 (6-9), `coverage-map:` (10), `ground:` (11). 10 `S### — "quote"` bullets.
2. **Fixture** — `git clone --shared <lane> /fast/scratch/.../lane` at lane tip `39f61816`; payload applied and committed **inside the clone only** (`git -C <clone> rev-parse --show-toplevel` asserted equal to the clone); recipe `build/K68ScribeEntry/fixture-recipe.py`. Revision hashes below are fixture-local (the recipe reproduces the state, not the hash).
3. **Counter, structural only (no README row)**:
   `TMPDIR=<scratch> node .ufo/waves/round-68/probe/deprec68-probe.mjs <clone> 0c0295cf… --no-live`
   → `DEPREC68_UNMET held=8/10 checks=10 rev=0c0295cff30517c923ea55885b7f2ad7a8d6a169 rule=M68 | M5 MISS no-live | M9 MISS readme-map-exit=1`, EXIT=1
4. **Counter, live**: same revision → `held=9/10 … | M9 MISS readme-map-exit=1`, EXIT=1 — **M5 passed**: every bullet's quote was re-found in a fresh live fetch of its row's URL.
5. **Counter, integrated (README row + `.ufo/pins/readme-map.json` entry added)**: `187e940b…` → `DEPREC68_HELD held=10/10 checks=10 rev=187e940b3a41d697d460110ce6d380c52fb85354 rule=M68`, EXIT=0. **Final draft** `03547a4b…` → same line, EXIT=0.
6. **Gates on the integrated fixture**: `SOURCES_CHECK: CLEAN (rows=152 tiers=A:129,B:15,C:8 status=queued:13,mined:120,rejected:19 entries_with_source=23 legacy=38)`; `SOURCE_CAPTURE: CLEAN captures=45 exemptions=107`; `SOURCE_DUPES: CLEAN groups=6 known=6`; `CITE_SOURCES: CLEAN cited=206`; `README_MAP: CLEAN files=164 rows=164 covered=164`; census `validate --file` exit 0 (inside M9).
7. **Capture provenance** (`sha256sum`): S207 `c12c3cb7…` 3839 B; S208 `3f337191…` 8794 B; S209 `0b69229a…` 15183 B; S210 `6608969b…` 26389 B; S211 `ae9bb7be…` 16321 B; S212 `0b69229a…` 15183 B; S213 `ff518cf3…` 43988 B.
8. **Host release**: `omp --version` → `omp/18.13.1` (run by this seat 2026-10-27). `git ls-remote … oh-my-pi 'refs/tags/v18.13.1*' 'refs/tags/v18.12.6*'` → `45c35e40…  refs/tags/v18.12.6`, `0838d2ab…  refs/tags/v18.13.1`.
9. **Clock disproof (raw fetch)**: `…/raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/219f82421ce13f6b0d9f786e603cf9a659fd5216/seps/2596-…md | sed -n 3p` → `- **Status**: Draft`; PR metadata `merged_at=2026-05-18T18:09:21Z`, `merge_commit_sha=219f82421ce13f6b0d9f786e603cf9a659fd5216` (`build/K68ScribeEntry/pr2596-api.json`); the flip is `183238ddac`, patch `Date: Wed, 3 Jun 2026 13:45:19 -0700`, hunk `-- **Status**: Draft` / `+- **Status**: Final`.
10. **Forbidden literals**: `grep -c '2026-04-17\|2026-05-18' build/K68ScribeEntry/mcp-deprecation-registry.md` → `0` (absent from the whole entry, not only from `## The live clock`).

## Findings

**K68ScribeEntry-1 — two header windows pin the entry's shape, and `sources-check` polices only line 1 (low; attacks integration ergonomics).**
`sources-check.mjs:359,381-386` needs `source:` on line 1 and `verified-at:`/`recheck:` inside the **first five** lines; the counter's M1 reads the **first fourteen**. Seven source lines therefore cannot all precede `verified-at:`; the draft puts four of them after `recheck:` (lines 6-9). Measured: `SOURCES_CHECK: CLEAN (rows=152 …)` with that layout. But `sources-check` validates ids only from `lines[0]` (`ENTRY_SOURCE_UNKNOWN`, `USED_BY_ASYMMETRY`), so S210-S213's rows are unpoliced by that gate and are held only by the counter's M2/M3.
Repro: `node scripts/sources-check.mjs` on the integrated fixture; `sed -n '359,386p' scripts/sources-check.mjs`.

**K68ScribeEntry-2 — M6 cannot tolerate a markdown table delimiter row (medium; attacks the C2 entry's rendering path).**
The snapshot filter drops only `/^\|[\s:-]+\|$/` and the `Feature` header; a five-column delimiter contains inner `|`, which the class excludes, so it is counted as a data row. Inserting `|---|---|---|---|---|` under the header of the otherwise-passing entry yields `M6 MISS rows=7!=6`.
Repro: `git -C <fixture-clone> commit -qam variant; node .ufo/waves/round-68/probe/deprec68-probe.mjs <fixture-clone> <rev> --no-live` → `DEPREC68_UNMET held=7/10 … | M6 MISS rows=7!=6`. Evidence: `build/K68ScribeEntry/counter-receipts.md` § R3. Consequence for the L1: the draft ships the table **without** a delimiter row (it renders as pipe text); the delimiter was dropped to satisfy the frozen counter, and a strengthening (skip `/^\|[\s:|-]+\|$/`) is a ratchet proposal, never an in-place edit.

**K68ScribeEntry-3 — the readme-map "pin" is a second artifact; a row alone still DRIFTs (medium; attacks M9).**
With the entry and nothing else: `README_MAP: DRIFT files=164 rows=163 covered=163 bad=2 first=uncovered:knowledge/mcp-deprecation-registry.md`. With a README row only: `DRIFT files=164 rows=164 covered=163 bad=1 first=unpinned:knowledge/mcp-deprecation-registry.md`. Only after appending `knowledge/mcp-deprecation-registry.md` to `covered` in `.ufo/pins/readme-map.json` (163 → 164): `README_MAP: CLEAN files=164 rows=164 covered=164`. The M9 arm needs both; `readme-map.mjs:236,322` reads `covered` from the pin registry, not from the README.
Repro: the three `node scripts/readme-map.mjs` lines in `counter-receipts.md`.

**K68ScribeEntry-4 — duplicate capture sets with different bytes for the same rows (medium; coordination, attacks M3 pin integrity).**
Scout captures `build/K68ScoutS20{7,8,9}/captures/*` prepend provenance headers (S207 +111 B, S208 +512 B, S209 +543 B); after stripping them the bodies are byte-identical to this seat's (`diff` → `SAME` for all three). Pinning one set while the entry's `source:` lines quote the other set's sha256/bytes is a silent M3 `sha-mismatch`.
Repro: `diff <(tail -n +2 .ufo/waves/round-68/build/K68ScoutS207/captures/deprecated-2026-07-28.md) .ufo/waves/round-68/build/K68ScribeEntry/captures/S207-deprecated-2026-07-28.md`. S210, S211 and S212 had **no** scout capture when this seat wrote (dirs empty) and were fetched here.
Measured divergence in the shared `build/captures/`: its `sep2596.md` is **25830 B**, a docs-site *render* of the same
SEP (`| **Status** | Final |` table header), while this seat's `S210-sep2596.md` is **26389 B** of raw markdown
(`- **Status**: Final`); both are the same document, neither is pin-compatible with the other's sha256. Its
`transports-2025-11-05.md` is **16321 B** with sha256 `ae9bb7be…` — byte-identical to this seat's capture of the
**2025-11-25** transports page — so the file is correct content under a misdated name; a row whose URL said
`2025-11-05` would fail M5 outright, because that page returns **HTTP 404** (`curl -fsSL https://modelcontextprotocol.io/specification/2025-11-05/basic/transports.md` → `curl: (22) The requested URL returned error: 404`). S210/S211/S212 had no scout capture when this seat wrote (dirs empty) and were fetched here.

**K68ScribeEntry-5 — S209 and S212 are the same bytes, so the v18.13.1 row is not evidence of change (info; attacks a reader's inference).**
Both are 15183 B, sha256 `0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0`. The legacy HTTP+SSE transport was neither dropped nor edited between the two tags; the entry says so explicitly and the Limits section repeats it. `SOURCE_DUPES: CLEAN groups=6 known=6` — the two URLs do not form a duplicate group.
Repro: `sha256sum .ufo/waves/round-68/build/K68ScribeEntry/captures/S209-omp-v18.12.6-sse.ts .ufo/waves/round-68/build/K68ScribeEntry/captures/S212-omp-v18.13.1-sse.ts`.

**K68ScribeEntry-6 — the staged theme's clock readings are disproven at source, not by argument (info; strengthens the entry).**
At the PR merge commit `219f8242` the SEP still reads `- **Status**: Draft`, so a `merged_at` reading names a Draft landing; the Final flip is `183238ddac` (`Wed, 3 Jun 2026`), three months from which is 2026-09-03. The entry uses only these two artifacts and carries neither disputed literal (`grep -c` → 0).
Repro: `curl -fsSL https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/219f82421ce13f6b0d9f786e603cf9a659fd5216/seps/2596-spec-feature-lifecycle-and-deprecation.md | sed -n 3p` → `- **Status**: Draft`.

## Artifacts

Written (lane-relative):
- `.ufo/waves/round-68/build/K68ScribeEntry/mcp-deprecation-registry.md` — the entry draft (what the L1 lands verbatim).
- `.ufo/waves/round-68/build/K68ScribeEntry/captures/S207-deprecated-2026-07-28.md`, `S208-feature-lifecycle.md`, `S209-omp-v18.12.6-sse.ts`, `S210-sep2596.md`, `S211-transports-2025-11-25.md`, `S212-omp-v18.13.1-sse.ts`, `S213-commit-183238ddac.patch`.
- `.ufo/waves/round-68/build/K68ScribeEntry/sources-rows-proposal.md` — 7 SOURCES rows, PROVINCE line, README row, readme-map pin, and the 5-artifact integration list.
- `.ufo/waves/round-68/build/K68ScribeEntry/pins-proposal.json` — the 7 `.ufo/pins/source-captures.json` entries.
- `.ufo/waves/round-68/build/K68ScribeEntry/counter-receipts.md` — verbatim commands and outputs of runs R1-R5 plus the gate lines.
- `.ufo/waves/round-68/build/K68ScribeEntry/fixture-recipe.py` — reproduces the fixture (clone + payload + commit inside the clone).
- `.ufo/waves/round-68/build/K68ScribeEntry/pr2596-api.json` — PR #2596 metadata (the disproven merge reading).
- `.ufo/waves/round-68/w1/K68ScribeEntry.md` — this report.

Untouched, as required: `scripts/`, `corpus/`, `SCORECARD.md`, `PROVINCE.md`, `LOG.md`, `SKILL.md`, `.ufo/pins/`, `.ufo/state/`, the lane's git/jj index, the fleet repo. No tool installed; no `pacman` transaction run. Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeEntry/` deleted after the recipe was copied out.

## Limits

- The `DEPREC68_HELD held=10/10` line was measured on a **fixture clone**, not on a lane revision: the L1 must land the payload and re-run at the integration commit. The fixture's README row is this seat's wording, not the readme-map seat's; the row's text does not change any counter check, but the id list must stay a superset of the cited rows.
- This seat did not run `scripts/omp-binary-probe.sh`; the `omp/18.13.1` claim rests on `omp --version` run here plus the round-66 binary receipt (`K66LabratBinarySse`, `~/.local/bin/omp`, sha256 `ee2961c7…`). No MCP session, server or `mcp.json` was read, so nothing here shows the host *exercises* `roots` or the legacy transport.
- S211 is cited at `2025-11-25` and its deprecation sentence can only be quoted with the inline markdown link intact (`norm()` does not delink); a reviewer who rewrites that bullet into plain prose will see M4 `quote-not-in-capture`.
- The entry's distinct-class/registry-adequacy judgments are the non-author closure's, not this seat's; the counter binds quotes and rows, not whether the reading is the right one.
