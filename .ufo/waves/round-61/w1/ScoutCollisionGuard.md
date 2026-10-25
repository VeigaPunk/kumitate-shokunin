# ScoutCollisionGuard — SOURCES id-collision guard, proven before append

Round 61, wave w1. Leaf seat; no subagents, no background jobs. Run 2026-10-25.
Proof artifact: `.ufo/waves/round-61/build/ScoutCollisionGuard/guard-proof.md`
(receipts `reg-ids.txt`, `staged-ids.txt`, `collisions.txt` beside it).

## Answer

**collisions = 0.** No staged source id collides with a registry id. Append is safe with
respect to ids.

| set | count | range |
|---|---|---|
| `reg-ids` — `corpus/SOURCES.md` | **133** | S001–S194 (61 in-range gaps) |
| `staged-ids` — `merge/kumitate/SOURCES.append.md` | **155** | S195–S349, contiguous, 0 gaps |
| `comm -12` | **0** | empty file, sha256 `e3b0c442…b855` |

The zero is structurally forced, not a silent extraction failure: `staged min 195 > reg max
194`, numeric overlap `none`, all 155 staged ids above the registry maximum.

## The three required probes

1. **Extraction.** The assignment's regex, plus a normalization step:
   `grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' <file> | sed -E 's/^[[:space:]]*\|[[:space:]]*//' | sort -u`.
   Row accounting is exactly 1:1 — registry 135 pipe rows = header + separator + 133 ids;
   staged 157 = header + separator + 155 ids. No duplicate id within either file; no code
   fences in either file; every token matches `^S[0-9]{3,}$`.
2. **Indent probe.** A scratch registry with a 2-space and a 3-space indented row matched
   **3 of 3** — the 0–3-space rule holds. 4-space and tab-indented rows matched 0 (intended:
   those are indented code, not table rows).
3. **Positive control.** Injecting `S001` into a scratch copy of the package yields
   `collisions=1 → S001`, so the zero above is a measurement, not a broken comparison.

## Findings beyond the brief

**F1 — the pipeline as literally specified misses indented duplicates.** The regex matches an
indented row, but the raw match text still carries its indent and pipe, so `comm` never
equates it to a flat id: raw tokens `  | S777` vs `| S777` → **collision missed**. A
plausible first fix is also wrong (`s/^\|?[[:space:]]*//` leaves `| S777` on indented rows).
Correct step: `s/^[[:space:]]*\|[[:space:]]*//`. End-to-end (indented registry row vs flat
staged row) then catches it: `collisions=1 → S777`. **No impact this round** — all 288 rows in
both files sit at 0 indent, and old and fixed normalizers give byte-identical lists here.
Latent, and it would have mattered the first time a row was indented.

**F2 — round 60's `collisions=3` is reconciled, not contradicted.** The package was re-keyed
between rounds: `S125→S195`, `S127→S197`, `S136→S206` (`MERGE-REPORT.md:9` "first staged id is
**S195**"; map at `:96`, `:98`, `:101`). Measured: each of S125/S127/S136 has
`reg=1 staged=0`. Package states 155 accepted rows = 155 staged ids.

**F3 — `scripts/source-dupes.mjs` is blind to 126 of the 155 staged rows.** Its loader does
`split('|')` then `if (cells.length !== 13) continue;`. The package uses escaped pipes (`\|`,
mostly in `recheck`) in **126 of 155** rows; the registry has **0**. Each escaped pipe inflates
the cell count, so those rows are dropped silently.

Measured with the lane's own gate on a scratch mirror (155 rows inserted *inside* `## Registry`,
lines 10–149, before `## Paths`):

| mirror | gate verdict |
|---|---|
| escaped pipes intact (the real package) | `SOURCE_DUPES: DRIFT groups=10 known=6 bad=4 first=new-duplicate:dl.acm.org/doi/10.1145/38714.38742 ids=S194,S264` |
| pipes neutralized (parser sees all 288 rows) | `SOURCE_DUPES: DRIFT groups=30 known=6 bad=26 first=known-mismatch:docs.temporal.io/encyclopedia/detecting-activity-failures live=S117,S126,S196` |

Baseline, unmodified registry: `SOURCE_DUPES: CLEAN groups=6 known=6`. Both mirrors exit 1, so
this is not a false CLEAN today — but **22 of the 26 defect entries are never reported**, and
a group the gate does report can show a smaller member set than the truth (jj-vcs working-copy:
`S271,S280` with pipes intact vs `S259,S270,S271,S280` escape-aware). A package whose new
duplicates fell only in escaped-pipe rows would read CLEAN.

**F4 — the package is id-clean but not URL-clean.** Escape-aware: **25 distinct same-URL
groups** not covered by the 6 pins. 8 contain a registry row and are exactly the package's own
same-document pairs (S125/S195, S127/S197, S131/S201, S135/S205, S136/S206, S190/S260,
S194/S264, S117/S126/S196); the other 17 are wholly staged (e.g. S271/S280 jj-vcs
working-copy; S277/S279 the lane's own README at two commits). That 8-row set independently
reproduces `MERGE-REPORT.md:92-103`, which corroborates the escape-aware parse as the faithful
one. The id guard's `0` therefore does not license a bare append: either new `known` pins
accompany it, or the dupe gate needs an escape-aware parser first.

## Residual limits

- Guard is line-start anchored: an id in a later cell, bolded, blockquoted, or indented 4+
  spaces is invisible. Both files are clean of all four forms today.
- Ids compared as text; `S0195` ≠ `S195`. No such id exists in either file.
- `comm` inputs are `sort -u`'d; `S`-ids are ASCII so no locale hazard.
- Covers ids only — not whether a staged row's *source* is already held (that is F3/F4).

## Tooling

No tool installed or upgraded; all work used `grep`, `sed`, `sort`, `comm`, `python3`, `node`
already on the host. Nothing written to either source file, to `.ufo/state/`, or to the
shokuknow campaign tree (read-only).

## Checks the main agent should run

- `node scripts/source-dupes.mjs` — expect `CLEAN groups=6 known=6` on the unmodified registry
  (confirmed at base this run).
- If the 155 rows are appended: re-run the id guard, then decide on pins for the 25 groups in
  F4 before trusting a `CLEAN`.
