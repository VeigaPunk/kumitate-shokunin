ATTACK scripts/ufo-state-census.test.mjs verdict=holds defects=1

Target: ``## `scripts/ufo-state-census.test.mjs` `` in
`corpus/knowledge/remaining-scripts-census.md` (working tree :763 heading, :765 body;
master :793/:795). Upstream pin `31c465f1`, base `964f443e`, read only through
`/fast/scratch/kumitate-r35/src`. No tools installed or upgraded; no lane file written.
Verdict: every named symbol/behavior and both table/registry numbers survive; the only
defect is a lost blank-line separator introduced by this edit, not a claim.

## Anchors — all read at 31c465f1

| anchor in section | line at 31c465f1 | verdict |
|---|---|---|
| heading path `scripts/ufo-state-census.test.mjs` | file exists, 172 L, non-empty | ok; heading occurs once (`grep -cE '^## …'` = 1) |
| `scripts/ufo-state-census.test.mjs:14` → `censusState` | `import { censusState } from "./ufo-state-census.mjs";` | ok, byte-identical at 964f443e |
| `:20` (short form) → `sparse` | `function sparse(path, bytes) {` | ok, byte-identical at 964f443e |
| class claim `suite` | `import { test } from "node:test";` at :11 | ok |

Liveness (not a dead import): `censusState` is called at `:48`, `:85`, `:100`, `:147`,
`:148`; `sparse` is defined at `:20` and used at `:32-34`, `:40`, `:97-99`, `:118`,
`:146`. Commands:
`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-state-census.test.mjs | sed -n '11p;14p;20p'`
→ the three lines above; `… | grep -n 'censusState\|sparse('` → the site list.

## Population-table row

- `corpus/knowledge/remaining-scripts-census.md:173` reads
  ``| `scripts/ufo-state-census.test.mjs` | 172 | suite |``.
- `git show 31c465f1:scripts/ufo-state-census.test.mjs | wc -l` → **172**;
  `git show 964f443e:… | wc -l` → **91**. Row = `wc -l` at the pin exactly.
- Independent S8 re-derivation (note's own heredoc, not its scratch files):
  universe 88 (`git ls-tree -r --name-only 31c465f1 -- scripts` filtered to the
  note's two patterns) − S1–S7 28 (heredoc extracted from note :42-69) = **60**;
  `scripts/ufo-state-census.test.mjs` is member #52; per-member `git show | wc -l`
  sum = **33367** (matches the note's `S8 members L: 33367`), target = 172.
- Adjacent class arithmetic reproduces exactly: 22 suites + 30 tools + 3 shims +
  4 assets + 1 doc = 60; top-level 51, subdir 9 (charter-scribe 5 + lean-cargo 4).
- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8`
  → `ROWS: 1 YES: 1 NOTES: 1 SECTIONS: 60` / `SUMMARY: errors=0 warnings=0` /
  `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=60 adv=0)`.
- The note's own Arm-2 probe code (extracted verbatim from note :261-324, run on
  stdin, `UFO_SRC=` clone, `MEMBERS=` re-derived list, `NOTE=` lane note) →
  `HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0` / `MEMBER_PROBE: 60/60 ok`,
  `probe_exit=0`. Our member passes `own` anchor liveness and `NO_SYMBOL`.
- `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r35/src --symbols`
  on this section yields only OK notes: `:14 -> … (172 lines)`,
  `censusState present on …:14`, `:20 -> … (172 lines)`, pin `964f443e`
  `resolved-by-git:src`. No error/warn finding anywhere on :763-766.

## Revision label and removed-clause trace

- Original label kept: `964f443e` survives at :765; cite-check resolves it as a
  real commit (`38 commits behind HEAD`).
- Only clause removed by the edit is the old size `91 L`; it is retained as the
  trace `was 91 @ 964f443e`, and 91 is verified above.
- Diff hunk (`git diff -U1 master -- corpus/knowledge/remaining-scripts-census.md`)
  shows every other token of the master sentence kept verbatim: `suite`,
  `re-censused 2026-10-14 against origin HEAD`, both anchors,
  `Primary surface symbol`, `also … sparse`. Nothing else dropped.
- New false claim: **none found**. 172 L, `suite`, `Live S8 member`, both symbols
  and the 31c465f1 re-anchor are each independently true.

## Defect 1 — lost blank-line separator (formatting; no claim/rendering/gate impact)

- `corpus/knowledge/remaining-scripts-census.md:765-766`: the section paragraph is
  immediately followed by ``## `scripts/ufo-state-retention.mjs` `` with no blank line.
  Master had it (`git show master:… | sed -n '795,797p'` → paragraph, blank, heading);
  the round-35 replacement deleted the `-` line *and* its following blank.
- Systemic, not unique: 13 ``## `scripts/…` `` headings in the working tree are
  preceded by a non-empty text line, vs **0** on master — lines 642, 645, 660, 671,
  674, 698, 749, 760, 763, 766, 769, 772, 775. All 13 sit under round-35-rewritten
  sections, i.e. a section-template omission. Fix: one blank line before each.
- Impact bounded: Markdown still renders the heading (ATX may interrupt a
  paragraph); the note's Arm-1 heading scan (``grep -oE '^## `scripts/[^`]+`'``), Arm-2
  `/^## /m` split, `claims-check` (`split(/^## /m)`) and cite-check are all
  unaffected — proven by the MATCH/60-of-60 outputs above. Still a new deviation
  from the file's own style and from master, so it is reported.

## Notes (not refutations)

- The retained sentence `(172 L …; was 91 @ 964f443e) re-censused 2026-10-14
  against origin HEAD 964f443e` is temporally loose: 172 L is the pin size, not the
  964f443e size. The trace disambiguates it, and the same shape is family-wide
  (census note :596 and :671-673, for `land-fleet-run.mjs` and
  `ufo-godspeed-inject.test.mjs`), so it
  is a style residual, not a false claim. Stricter form would be
  `(172 L at 31c465f1; was 91 @ 964f443e)`.
- `cite-check --symbols` resolves the sticky `:20` anchor but prints no
  symbol-presence note for `sparse` (it does for `censusState` at :14). Observed
  gate blind spot only; :20 is correct by direct read.
- Out of section scope: the note's Arm-1 rerun quotes
  `/fast/scratch/kumitate-r35/w/ExecS8Writer/members-live.txt`, which no longer
  exists (that seat dir now holds only `lane/`). The 60-member result is
  reproducible from the note's derivation commands and was re-derived here, so the
  quoted output is corroborated even though its scratch path is gone.
