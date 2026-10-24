# ScribeScorecardAudit — round-57 report

Item: audit `SCORECARD.md` — new `readme-map` capability row, round-57 section,
move-log row, stanza terms A=90 C=27 C2=135, `pin.readme-map` line.
Audit date 2026-10-24. Audited revision: lane HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89`
(working tree == HEAD, sha256 `5a0cb8f7…`), cross-checked at measured R1
`f0dc6d1160e66af65355bd353665adac22bbf4a9` and base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf`.
Evidence: `.ufo/waves/round-57/build/ScribeScorecardAudit/` (manifest, script,
transcript, diff, extraction trees).

## Behavior observed

All five audit points **corroborated**, and the quoted numbers independently
recomputed (never trusted from the text):

1. **`readme-map` capability row — PRESENT.** SCORECARD.md line 1774, in
   `## Capabilities` (header line 1757), first-working round `| 57 |`; row text
   names contract `kumitate-readme-map-v1`, the `uncovered`/`orphan-row`/
   `duplicate-row`/`format-unmapped`/`stale-covered`/`unpinned` DRIFT kinds and
   `README_MAP: CLEAN files=135 rows=135 covered=135`. Present at R1 (same line).
2. **Round-57 section — PRESENT.** `## Round 57 — claims, routed-defect
   answers, limits (2026-10-24)`, lines 2676–2717 (last section; file = 2717
   lines). Names plan, base `7178bfd3`, R1 `f0dc6d11`, both predicates with
   before/witness/after receipts, terms `A=87→90, C=26→27`, `C2=135`,
   routed-defect answers R56-V1/V2/V3, and `## Limits`-style limits paragraph.
3. **Move-log rows — PRESENT (two, C1 + C2).** Lines 449/450 under `## Move
   log` (table header line 437). C1 row: base `ATTEST57_UNMET held=0/10` exit 1,
   base terms A=87, C=26 with the `C2_TOTAL_DRIFT declared=132 computed=133`
   quote → R1 `ATTEST57_HELD held=10/10`, `A=90, C=27, operability remains 9`.
   C2 row: base `DOCTRINE57_UNMET held=2/5` → R1 `DOCTRINE57_HELD held=5/5`,
   `C2=135/135 after the inherited R56-V3 README repair`. Both rows carry full
   measured-commit `f0dc6d11…` (placeholders filled, see Findings).
4. **Stanza terms A=90 C=27 C2=135 — PRESENT and re-verified.**
   `<!-- kumitate-proxy-v1` block lines 287–311 carries `A=90`, `C=27`,
   `C2=135`, `C2_total=135` (identical lines at R1). Independent recomputation
   over `git archive` extractions — the probe's own method, not the working
   tree:
   - R1 and HEAD: `find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` → **90**; `grep -c '^\s*- \[' SKILL.md` → **27**; `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` → **135**; `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **135**.
   - Base: A=**87**, C=**26**, C2 rows=**132** vs files=**133** — exactly the
     before-column figures and the inherited R56-V3 drift.
   - `node scripts/proxy-check.mjs --strict` at the HEAD extraction →
     `PROXY: MATCH (A=90 C=27 operability=9; … C2=135/135 …; pins=6 match;
     src-rev=31c465f15669)` exit 0 — the instrument agrees with the stanza.
   - `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=135 rows=135
     covered=135` exit 0; `--selftest` → `PASS (14/14)` exit 0 (capability-row
     and move-log quotes verified live).
   - Derived integer: floor(10·(90+27)/(90+27+3)) = floor(9.75) = **9** =
     `## Axes` operability row — "operability remains 9" verified.
5. **`pin.readme-map` line — PRESENT and hash-exact.** Line 326 inside the
   `<!-- kumitate-gate-pins-v1` block (lines 312–327): `pin.readme-map=058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727`.
   Independently equal to sha256 of `scripts/readme-map.mjs` at working tree,
   HEAD and R1 (all three = `058e5033…`). `.ufo/pins/counter-pins.json` round-57
   entry (`{"round":57,"name":"readme-map",…}`) carries the identical sha256 —
   the A57 B6 seat-check would pass. `pin.readme-map` appears only in the
   gate-pins block, not in `kumitate-proxy-v1` — consistent with the prose's
   "v1 keeps its six pins" (stanza lists exactly six `pin.*` lines).

## Gates run (all exit 0)

`node scripts/readme-map.mjs` (CLEAN), `node scripts/readme-map.mjs --selftest`
(14/14 PASS), `node scripts/proxy-check.mjs --strict` (MATCH) — all inside the
extracted HEAD tree with `UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha`.

## Touched surfaces

Writes confined to `.ufo/waves/round-57/build/ScribeScorecardAudit/`
(`recompute.sh`, `recompute-transcript.txt`, `scorecard-r1-to-head.diff`,
`evidence-manifest.md`, `tree-*/` extractions) and this report. No production
file, registry, git or jj state touched; all recomputation ran on `git archive`
scratch extractions.

## Out-of-scope items

- No source reopening (S117–S120) — not this seat's item.
- B7 SKILL.md checklist/registry binding — A57 probe's own scope; B7 PASS read
  in `close/FINAL-attest57-R1.txt`, not independently re-scored here.
- Prior-round stanza/move-log history — quoted, not re-derived.

## Findings

- **F1 (neutral, bookkeeping):** at measured R1 the two move-log rows and the
  section header carried literal `R1PENDING`; `git diff f0dc6d11 8c6f5b0` shows
  HEAD replaced exactly those three tokens with `f0dc6d11…` (24-line diff,
  nothing else changed). `grep R1PENDING` at HEAD: zero matches. Every audited
  surface exists at both revisions.
- **F2 (convention, no defect):** the `## Axes` operability row (line 334)
  still shows the round-42 prose A=10/C=19 ⇒ 9 while the live stanza reads
  A=90/C=27 ⇒ 9; the machine-checked surface is the integer, which agrees at
  both counts and under `proxy-check --strict` (pins=6 match).
- **F3 (consistent detail):** `base/attest57-base.txt` B6 also records
  `AXES_DRIFT coverage declared=10 computed=9` at base — the retired coverage
  integer dropped to 9 while C2 was 132/133, consistent with the drift quote.
- **No defect found.** All five required surfaces present, quoted verdicts
  match committed receipts byte-for-byte (`ATTEST57_UNMET held=0/10`,
  `DOCTRINE57_UNMET held=2/5`, `ATTEST57_HELD held=10/10`,
  `DOCTRINE57_HELD held=5/5`, witnesses `held=10/10`/`held=5/5` at scratch
  `1cd6d667…`).

## Artifact paths

- `.ufo/waves/round-57/build/ScribeScorecardAudit/evidence-manifest.md`
- `.ufo/waves/round-57/build/ScribeScorecardAudit/recompute.sh` +
  `recompute-transcript.txt` (exact commands + output)
- `.ufo/waves/round-57/build/ScribeScorecardAudit/scorecard-r1-to-head.diff`

No tools installed (none needed; pacman pause honored).
