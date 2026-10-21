FIDELITY scripts/ufo-statusline-hook.test.mjs anchors=14 ok=11 moved=1 changed=2 gone=0
Axes: coverage:script-layer (judged axis); operability (lane axis, untouched by this leaf). Godspeed: batch-verified every anchor against both revisions in one pass; only non-ok rows below.

# Scope
Notes: corpus/knowledge/remaining-scripts-census.md. Member section = note:805-807 (single paragraph; next section starts note:809). Upstream diff 964f443e..31c465f1: +24/-1 (hunk 1 rewrites line 16; hunk 2 inserts 23 lines after old :72). Old file 75 lines, new 98; lines 1-15 and 17-72 are byte-identical, so every anchor at or below old :72 keeps its line number except :16 content.

# Anchor census (14)
Heading note:805 `## scripts/ufo-statusline-hook.test.mjs` — ok. Body anchors, all verified at 964f443e and 31c465f1 via `git show <rev>:scripts/ufo-statusline-hook.test.mjs | cat -n`:
- `:16` import — changed (below)
- `:17` cache-gate `isStatusEnvelope` comment — ok (unchanged comment line both revs)
- `:22` local test harness — changed (below; `function test(name, fn) {` still at :22 both revs)
- `:33` `CLOSED` = literal `uf0 hatch (closed)` — ok (identical both revs)
- `:36` `phaseCounts` in VALID — ok (identical both revs)
- `:40` malformed `{}` not fabricated zeros — ok (test title at :40 both revs)
- `:44` / `:50` / `:54` / `:58` null/string/array, missing levels / phaseCounts / hatch render CLOSED — ok (identical both revs)
- `:62-63` valid envelope, null l2 → `?` sentinel — ok (title :62, assert :63 both revs)
- `:66-70` valid closed envelope with counts — ok (identical both revs)
- `:74-75` pins-green print / exit 1 — moved (below)

# Non-ok anchors
note:807 | `scripts/ufo-statusline-hook.test.mjs:16` | "dynamically imports only `formatUf0Status`" | changed | scripts/ufo-statusline-hook.test.mjs:16 | dynamically imports `formatUf0Status`, `isCacheFresh`, `shouldStampDisplayRefresh` (scripts/ufo-statusline-hook.test.mjs:16; was 964f443e, re-anchored at 31c465f1)
note:807 | `:22` | "holds seven pins over a local test harness" | changed | scripts/ufo-statusline-hook.test.mjs:22 | holds nine pins over a local test harness (scripts/ufo-statusline-hook.test.mjs:22; was 964f443e, re-anchored at 31c465f1)
note:807 | `:74-75` | "run prints N/N pins green or exits 1 when any pin failed" | moved | scripts/ufo-statusline-hook.test.mjs:97-98 | the run prints N/N pins green or exits 1 when any pin failed (scripts/ufo-statusline-hook.test.mjs:97-98; was 964f443e, re-anchored at 31c465f1)

# Removed/changed behavior beyond line moves
- Nothing was removed (gone=0). The single deleted line is the old one-symbol import, replaced in place at :16.
- New pins at 31c465f1 (not yet described in the note): `isCacheFresh` TTL decoupled from poll cadence (5,000/9,999ms still fresh, 10,000ms stale, +1,000ms fresh / +1,001ms stale, non-number and NaN rejected; test at :73-85) and `shouldStampDisplayRefresh` confirmed-full-refresh gate incl. --lite never stamping (:87-94). Optional note addition for C2 editor: mention the two new cache-gate pins after the `:66-70` sentence.

# Ancillary (C2 re-census input, not an :N anchor)
- note:157 population row: `| scripts/ufo-statusline-hook.test.mjs | 75 | suite |` — count stale: 98 lines at 31c465f1 (75 at 964f443e). Pass to the C2 census editor.
- Cross-references: `grep -n "ufo-statusline-hook.test"` over the census returns only note:157, note:805, note:807 — no other section cites this member.

# Commands run (evidence)
- `grep -n "ufo-statusline-hook.test" corpus/knowledge/remaining-scripts-census.md` → 157, 805, 807 only.
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-statusline-hook.test.mjs` → 1 file changed, +24/-1; hunks at :16 and after old :70 (full output observed; two new test blocks verbatim).
- `git -C /fast/scratch/kumitate-r35/src show 964f443e:scripts/ufo-statusline-hook.test.mjs | cat -n` and same at 31c465f1 → 75 vs 98 lines; every cited line inspected at both revisions.
- `wc -l` both revisions → 75, 98.
- `sed -n '805,830p'` + `awk` numbering of the census section → section is one paragraph ending at note:807.

# Gaps
- [INFERENCE] The census section text carries no explicit per-anchor revision label; I treat the note's claims as pinned to baseline 964f443e (lane context declares it) and phrase replacements accordingly.
- Read-only item: no note edits performed; replacements are proposals for the C2 owner.
- No tool installs/updates were needed (used repo git, coreutils only).
