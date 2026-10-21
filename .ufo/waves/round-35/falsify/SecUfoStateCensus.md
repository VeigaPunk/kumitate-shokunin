ATTACK S8-section:scripts/ufo-state-census.mjs verdict=holds defects=1

Target: the re-anchored S8 member section `## \`scripts/ufo-state-census.mjs\`` in
corpus/knowledge/remaining-scripts-census.md (current lines 760-762; master 789-791).

Axes: coverage:script-layer (anchor/length truth at pin 31c465f1), edit-trace integrity.
Method note: no `lsp` device is mounted in this session's tool inventory, so all checks
below are text/object-level verification against the git objects at the pin; no LSP
semantic proof was available (unavailability recorded, per role). No installs performed;
no pacman transactions; lane tree untouched (read-only).

## Checklist results (all pass)

1. Population-table row vs wc -l at 31c465f1 — PASS.
   Row (line 172): `| \`scripts/ufo-state-census.mjs\` | 219 | tool |` (master line 153 had 184).
   Ran: `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-state-census.mjs | wc -l` → 219. Match.
   History check: same at 964f443e → 184; old row/section both said 184. Consistent.

2. Every anchor in the section read at 31c465f1 — PASS (2 line anchors + heading).
   - Heading cites the member; file exists at the pin.
   - `CENSUS_SCHEMA` at `scripts/ufo-state-census.mjs:25`: line 25 is
     `export const CENSUS_SCHEMA = "ufo-state-census-v1";` — verified via
     `git ... show 31c465f1:scripts/ufo-state-census.mjs | sed -n '20,40p'` and `grep -n`.
   - `censusState` at `:31`: line 31 is
     `export function censusState({ stateDir, sessionsDir = null, top = DEFAULT_TOP, maxEntries = DEFAULT_MAX_ENTRIES }) {` — verified same way.
   - These are the section's only line anchors (old :22/:28 at 964f443e also re-verified
     verbatim at those lines, confirming the move +3/+3 from the two added import lines +
     one reflowed import; matches wave-1 FidUfoStateCensus.md).

3. Original revision label kept — PASS. Current 762 retains verbatim
   "re-censused 2026-10-14 against origin HEAD \`964f443e\`" and adds "; was 184 @ 964f443e",
   preserving the historical measurement; new trailer "re-anchored at 31c465f1 (round 35)".
   Same convention as every sibling re-anchored section (e.g. ufo-route-preflight.test.mjs:757,
   ufo-state-census.test.mjs:765).

4. Removed clauses left a trace — PASS (vacuously). The master→round-35 hunk for this
   section (diff lines `-Live S8 member (184 L, tool) …:28` → `+Live S8 member (219 L, tool;
   was 184 @ 964f443e) …:25 …:31 … (round 35)`) removes no clause: every master claim
   survives with numbers updated in place. Wave-1 FidUfoStateCensus.md reports
   anchors=3 ok=1 moved=2 changed=0 gone=0 and "no described behavior removed or changed";
   I independently confirmed the only export surface is exactly the two anchored symbols
   (`grep -n '^export'` at 31c465f1 → lines 25, 31 only), so nothing needed a
   "(round 35: removed …)" trace marker.

5. New false claims — none found. Upstream diff-stat cross-checked:
   `git -C /fast/scratch/kumitate-r35/src diff --stat 964f443e 31c465f1 -- scripts/ufo-state-census.mjs`
   → 54 insertions(+), 19 deletions(-), matching wave-1's evidence. The censusState
   signature gain of `sessionsDir = null` is additive and the section makes no behavioral
   claim it contradicts. Member-list line 440 still lists the member; it exists at the pin.

## Defects

D1 (low, formatting-integrity, not a false claim): round-35 integration dropped blank
lines before `##` member headings — 13 sites doc-wide vs 0 at master, including both
boundaries of my target section (previous section's paragraph → heading at 760, and my
section's paragraph 762 → `## \`scripts/ufo-state-census.test.mjs\`` at 763).
Command: `awk 'prev !~ /^$/ && $0 ~ /^## / {print NR}' corpus/knowledge/remaining-scripts-census.md`
→ 642 645 660 671 674 698 749 760 763 766 769 772 775; same awk on
`git show master:…` → none. Evidence: `sed -n '759,764p' | cat -A` shows paragraph line
directly followed by `## \`scripts/ufo-state-census.test.mjs\`$` with no `$` blank between.
Impact: none observable — CommonMark parses ATX headings mid-paragraph and proxy arm 1
greps `^## `, so section-form and the S=88/88 count are unaffected. This is convention
drift vs the doc's own blank-line-separated section form.
Minimal fix: re-insert the blank line between paragraph and next `## ` heading at the 13
listed sites (mechanical; owner: L1/ExecS8Writer, doc-wide — sibling sections outside my
target are cited only as context).

## Residual risk / verification gaps

- The dual-revision phrasing (":25" anchors inside a sentence whose census label says
  "against 964f443e", where the symbol sat at :22) is disambiguated only by the trailing
  "re-anchored at 31c465f1 (round 35)" marker. It is the lane-wide round-35 convention, so
  I do not score it as a defect; a reader auditing 964f443e must apply the trailer.
- I verified only this member's section, its table row, and its member-list entry; the
  other 12 blank-line-drift sites and sibling sections belong to sibling reviewers.
