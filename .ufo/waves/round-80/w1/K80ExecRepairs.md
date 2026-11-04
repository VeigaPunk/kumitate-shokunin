# K80ExecRepairs — round-79 routed record defects D1–D8: audit and exact repair text

Seat: K80ExecRepairs (leaf, executor). Lane: kumitate-shokunin. Round 80, ONE v1 wave.
Audit date 2026-11-04. Lane tip at audit: `509afb1d`; fleet repo HEAD: `3709eca`.
Source of defects: `corpus/lessons/round-79-verifier-spotcheck.md` (landed as base tip `1968689f`).
Companion files in this report dir:
`erratum-fleet-report-D1-D2-D8.md` · `erratum-lesson-round-79-erratum3.md` ·
`scorecard-correction-D5.md` · `d6-d7-round80-regime.md` · `evidence.txt` (raw outputs).

**Headline finding: most repair text already exists on disk.** The fleet-report erratum (D1/D2/D8)
and the SCORECARD correction (D5) are drafted verbatim in their working trees but **uncommitted**;
the lesson erratum (D3/D4, "Erratum 2") is **committed** at `509afb1d` but contains one sentence
that this audit proves false — it needs the appended Erratum 3 provided here. D6/D7 are prevention
regime items: round-80's plan + committed open census cover them procedurally, and neither frozen
counter enforces them (verified).

## Per-defect audit

### D1 — wrong receipt cited for the round-open repair — CONFIRMED
- Lives in: fleet report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-79/kumitate.md` (fleet
  repo, not the lane), "Round-open repair" bullet, lines 32–34.
- Evidence: the bullet cites `open/gates-open.txt` for `README_MAP: CLEAN files=191 rows=191
  covered=191`; that file line 31 reads `README_MAP: DRIFT files=191 rows=190 covered=190`. The clean
  reading is at `w1/K79ScoutOpen/gates.txt:35` and `w1/K79ReviewFreeze/scaffold-tree-readme-map.txt:1`
  (both verified).
- Repair class: filed reports are append-only → appended erratum naming the superseded citation.

### D2 — dead pointer `w1/K79MutC2/` — CONFIRMED
- Lives in: same fleet report, "Independent attacks" bullet, line 73.
- Evidence: `ls .ufo/waves/round-79/w1/` has no `K79MutC2` entry; `git log --all --oneline --
  '.ufo/waves/round-79/w1/K79MutC2*'` → 0 commits. The bullet itself records the seat filed no
  report and no matrix.
- Repair class: append-only erratum (pointer void; the absence is the record). Prevention note:
  `report-receipt-diff` v4 does not flag extensionless directory tokens — round-80's regime
  ("resolving every new pointer this round", plan §Sourced claim) is the forward fix.

### D3 — dead receipt names in the lesson's counter table — CONFIRMED, with a correction to the correction
- Lives in: lane `corpus/lessons/round-79.md` `## Counters` rows 86–90 (`close/census.txt`,
  `close/shape.txt`, `close/readme-map.txt`, `close/spotcheck-check.txt`).
- Evidence: none of the four exists at HEAD. **Precision fix:** the spotcheck's "none exists" and
  Erratum 2's "do not exist at any lane revision" are **wrong for the first two names** —
  `close/census.txt` and `close/shape.txt` existed solely at the measured work revision `357e4e73`
  (kimi census / OMP shape receipts), and `32620ef5` renamed the former to `close/census-shape.txt`
  (R075) and deleted the latter. `readme-map.txt` and `spotcheck-check.txt` never existed at any
  revision (`git log --all` → 0). Erratum 2 is committed at `509afb1d`, so its sentence can only be
  repaired by a further appended erratum: **Erratum 3 text provided in
  `erratum-lesson-round-79-erratum3.md`** (13 lines, names the superseded sentence).
- Repair class: append-only erratum in the lane lesson.

### D4 — S229 quote word count — CONFIRMED (already corrected)
- Lives in: lane lesson line 19 ("Located quote, 21 words"). `wc -w` over the quoted text = **18**
  (verified by exact `printf | wc -w`). Quote faithful; ≤25 limit unaffected.
- Repair class: append-only erratum — Erratum 2 (committed) already states 18. No further text needed.

### D5 — round-78 SCORECARD placeholder filled with round-79 text — CONFIRMED
- Lives in: lane `SCORECARD.md`, `## Round 78 — declaration and verdicts` base paragraph (line 3676
  at HEAD). `git diff 5019803b 0fb019a3 -- SCORECARD.md` shows `-…<SETTLEMENT>` /
  `+…All 13 seats settled (`.ufo/waves/round-79/w1-results.json`); …` (and a second r79 sentence at
  diff line 111).
- Repair class: append-only correction — the wrong sentence stands, a named correction supersedes
  it. The correction block exists verbatim in the lane working tree (lines 1273–1286, pure-insertion
  hunk `@@ -1253,6 +1270,19 @@`, 14 lines) but is **uncommitted**. Its evidence command re-runs
  clean: `python3 -c "…round-78/w1-results.json…"` → `14 14`. Certified copy:
  `scorecard-correction-D5.md`.

### D6 — close counter receipts name no measured revision — CONFIRMED; prevention stated, enforcement procedural
- Lives in: lane `.ufo/waves/round-79/close/c1-probe.txt` (0 `rev=` lines) and `c2-probe.txt`
  (sole `rev=` is an arm-output token `rev=worktree` on line 3, not a stamp). `proxy-check.txt:1`
  and `c2-r78.txt:1` both carry `rev=357e4e73…`, so the close knew the practice.
- Repair class: **prevention only** (filed close bytes are frozen; the plan's own rule forbids
  silent edits and routes post-freeze defects to named errata — the fleet erratum records D6).
- Round-80 regime: plan line 136 mandates `rev=` in every close receipt. Enforcement check: the
  frozen counters (`probe80-c1.mjs`, `probe80-c2.mjs` at `c6a7ebd3`) contain **no `rev` logic at
  all** (`grep -in rev` → zero matches) — enforcement is the L1 stamping the header at capture time
  (r79 `proxy-check.txt` precedent). Gap: bare redirection of probe stdout would silently recreate
  D6 while still scoring `HELD`; recommend an explicit close-checklist item. Full statement:
  `d6-d7-round80-regime.md`.

### D7 — no committed round-start sources census — CONFIRMED; prevention landed
- Lives in: the r79 record — fleet report lines 110–114 cite `open/gates-open.txt` for the start
  census, but that 40-line file holds proxy/kimi/omp/readme-map/spotcheck/checklist stanzas only
  (the spotcheck's "no census section" is loose: the kimi/omp census stanzas exist; the SOURCES
  census output does not). Only `close/sources-census.txt` was committed.
- Repair class: **prevention + recorded** (the fleet erratum names the gap).
- Round-80 regime: `open/sources-census.txt` is committed at `509afb1d` — `census_exit=0`, 171 rows
  (A=146 B=16 C=9), header names lane tip `ed64ddca`. Enforcement check: not in the freeze tree
  (`c6a7ebd3` lists 7 open files, census absent) — plan prose + committed post-freeze receipt, not
  counter-enforced. The close should re-run the census into `close/` to complete the pair.

### D8 — filed report rewritten in place — CONFIRMED; recorded-not-repaired
- Lives in: fleet report history: filed `cbb52bd` (14070 bytes), rewritten `59aa9ae` (14251 bytes):
  one header lane-HEAD line + parenthetical, one Landed-changes bullet, and a regenerated receipt
  line (`bytes=14070 sha=6bb0dda3360f` → `bytes=14251 sha=c9a76770f97a`; both hashes re-verified
  against the commit contents). Commit subject says "erratum"; the body is EMPTY — no appended
  erratum, and the superseded text is not recoverable from filed bytes.
- **Number discrepancy in the router:** the spotcheck's "(13495 → 14251 bytes)" start figure is
  unverifiable and wrong — the receipt at `cbb52bd` records `bytes=14070`, and the 85-byte
  `kumitate-receipt.txt` file itself is byte-equal in size at both commits (one line changed). 14251
  is the `.md` size at `59aa9ae`. The drafted erratum correctly omits the numbers.
- Repair class: append-only record naming the rewrite (cannot restore what the rewrite destroyed).
  The drafted block does exactly this ("recorded, not repaired") and commits the round-80 report
  to being filed once. Certified copy: `erratum-fleet-report-D1-D2-D8.md`.

## Exact repair text the L1 must land (summary)

| Defect | Target file | Text | State |
|---|---|---|---|
| D1, D2, D8 | fleet `.ufo/reports/round-79/kumitate.md` | block in `erratum-fleet-report-D1-D2-D8.md` (25 lines incl. heading) | drafted verbatim on disk, **uncommitted — commit as-is** |
| D3, D4 | lane `corpus/lessons/round-79.md` | Erratum 2 (D3/D4) committed at `509afb1d` | D4 done; D3 needs the appended **Erratum 3** in `erratum-lesson-round-79-erratum3.md` (13 lines) |
| D5 | lane `SCORECARD.md` | block in `scorecard-correction-D5.md` (14 lines) | drafted verbatim on disk, **uncommitted — commit as-is** (with the other round-80 record edits) |
| D6 | lane round-80 close receipts | procedural: stamp `rev=<close commit>` on every close receipt (plan line 136) | no text to land; counter cannot enforce (frozen) |
| D7 | lane `.ufo/waves/round-80/open/` + close | done: `open/sources-census.txt` committed at `509afb1d`; re-run at close | no text to land |

## Risks / observations for the L1

1. Uncommitted repair text (fleet report erratum, SCORECARD correction) lives only in working
   trees; a careless `git checkout`/`jj` op would lose it. Commit before the wave closes.
2. Erratum 2's "do not exist at any lane revision" sentence is falsified by `357e4e73`'s tree;
   land Erratum 3 so the round-80 close does not cite the overreach.
3. Plan Amendment 1.2 says the close stanza reads `C2=197/197`; the SCORECARD working tree now
   reads 198 (post-amendment edit). Reconcile the final stanza at close.
4. D6's procedural stamp is the single unenforced prevention; make it a named checklist step.

## Tooling

No installs or upgrades were needed or performed (audit used only git, grep, sed, wc, python3,
ls, cat — all host-provided). No mutating git/jj command was run anywhere; the lane tree and fleet
repo were read-only for this seat. Scratch dir `/fast/scratch/hyaku/kumitate-r80/K80ExecRepairs`
(created, unused) removed at completion; all scripts/commands were one-liners run in place.

Report: `.ufo/waves/round-80/w1/K80ExecRepairs.md`
