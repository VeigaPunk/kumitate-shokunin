# kumitate fleet report — format reference (round-61 recon)

Scope: the fleet report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/kumitate.md`.
Sources read: the round 57–60 reports (as committed), `templates/round-prompt.md` §4 (lines
99–129), `scripts/hyaku/lane-addendum.md` items 1 and 6 (lines 26, 75–79, 198–199),
`scripts/shokunin-watchdog.sh` (`report_of` lines 140–160, sources-conformance line 311),
lane `corpus/QUALITY.md` Q22 (lines 243–271) and Q23 (lines 273–301).

**Bottom line.** None of r57–r60 has a `## Per-axis verdicts` section or a `## Round shape`
heading. Measured: `grep -c '^## Per-axis verdicts'` = 0, `grep -c '^## Round shape'` = 0, and
the Q23 `FLOOR|spawned total` count = 0 in all four reports. Round shape lived in an unheaded
preamble paragraph (`Round shape: **one v1 wave of 32 seats** …`, r58–r60, line 3 or 7). The
round-61 report is the first that has to satisfy Q22 and Q23, and has no precedent to copy.

## 1. Headings actually used (exact strings, in order)

| # | r57 | r58 | r59 | r60 |
|---|---|---|---|---|
| title | `# Kumitate — Round 57` | `# kumitate — round 58 report (hyaku run 5, attempt 1 resumed; Kimi fresh L1)` | `# kumitate — round 59 report (hyaku, Kimi fresh L1)` | `# kumitate — round 60 report (hyaku, Kimi fresh L1)` |
| preamble | none | `Round shape:` paragraph (base, freeze, measured rev, runtime identity) | `Round shape:` paragraph, wave-slot grant, launcher-abort note, actual-dispatch bullets | `Runtime identity:` + base/tip/measured, `Round shape:` paragraph, wave-slot grant |
| 1 | `## Work performed` | `## Work performed` | `## Work performed` | `## Work performed` |
| 2 | `## Landed changes` | `## Landed changes` | `## Landed changes` | `## Landed changes` |
| 3 | `## Before → after measurements` | `## Before → after measurements` | `## Before → after measurements` | `## Before → after measurements` |
| 3b | — | `## Wave evidence (actual dispatch, not a prepared spec)` | — | — |
| 4 | `## Sources & frontier` | `## Sources & frontier` | `## Sources & frontier` | `## Sources & frontier` |
| 5 | `## Trend verdicts` | `## Trend verdicts` | `## Trend verdicts` | `## Trend verdicts` |
| 6 | `## SHONEN` | `## SHONEN` | `## SHONEN` | `## SHONEN` |
| 7 | — | `## Inherited-file dispositions (stopped attempt → this attempt)` | — | — |
| 8 | — | `## Stale-lane` | `## Stale-lane` | `## Stale-lane` |
| 9 | — | `## Open L0 questions` | `## Open L0 questions` | `## Open L0 questions` |

The stable core is the r59/r60 shape: title, preamble, then Work performed, Landed changes,
Before → after measurements, Sources & frontier, Trend verdicts, SHONEN, Stale-lane, Open L0
questions. The middle six match `templates/round-prompt.md` §4's "Required sections, in
order". Stale-lane comes from `lane-addendum.md` item 6. r58's two extra sections were
situational: a dispatch reconciliation and a resumed attempt.

**Mechanically enforced** (everything else is conformance, judged by the closure):
- the watchdog `report_of` requires a SHONEN heading or bold-list marker and at least 400
  bytes; the r57–r60 reports are 10,247–18,157 bytes;
- `^#{1,6}\s+Sources\s*&\s*frontier` is the sources-conformance heading regex (it logs a
  defect, it does not fail the round);
- section order is **not** machine-checked, so the two new sections can go anywhere.

### Line formats inside the existing sections

- **Work performed** opens with `Declared claims, frozen in \`.ufo/waves/round-<N>/plan.md\` before any data seat scored.`,
  then one `- **C<n> — <axis> (…); capability acquisition \`<name>\` (contract \`…\`).**` bullet per claim (r59/r60).
- **Landed changes** has one `- \`<40-hex>\` — <freeze|work|wave evidence/close>: … LOG entry: round <N> (…).` bullet per commit,
  ending with the fleet-commit sentence (r60 line 77).
- **Before → after measurements** has `- **C<n> counting command:**` followed by the frozen
  command and nested `base …` / `measured rev …` lines that quote the full verdict line plus
  the receipt path, then gate verdicts, the operability integer and the census.
- **Trend verdicts** has exactly three bullets, written `- **expansion: improved** — …`
  (r58–r60 lowercase-colon form; r57 used `- **Expansion — improved.**`). discernment is
  written as `unprovable (self-assessed; improved pending non-author check)`.
- **SHONEN** has four boxes, `- [x]` (with a named non-author verifier) or `- [~]` (with an
  evidence pointer). r58–r60 each had 2×`[x]` and 2×`[~]`; r57 had 4×`[~]`.
- **Stale-lane** is `Respawn-per-round driver; no other mission of this lane is open. Tool installs/updates: …`.

## 2. `## Per-axis verdicts` (Q22) — required, never used before

Exact block. Axis names must be exactly the `SCORECARD.md` `## Axes` first-column names,
one row each, plain text:

```
## Per-axis verdicts

| axis | verdict | claims | basis |
|---|---|---|---|
| operability | <verdict> | C1 | <one-line basis, no literal pipe> |
| coverage | <verdict> | C2 | <basis> |
| coverage:script-layer | unchanged | — | <basis> |
| coverage:runtime-layer | unchanged | — | <basis> |
| coverage:kimi-layer | unchanged | — | <basis> |

counted claims=2
```

Rules (QUALITY.md:254–264):
- `verdict` is exactly one of `improved` `harmed` `unchanged` `unprovable-but-better` `unprovable`.
- `claims` lists every `C<n>` the plan placed on that axis, or `—`.
- `counted claims=<n>` sits on its own line, outside the table, where n is the number of rows
  whose `claims` cell names a claim. Two claims on one axis count as one.
- Every `## C<n>` heading in `.ufo/waves/round-<N>/plan.md` must appear in the section. For
  r61 that means `C1` (operability) and `C2` (coverage).
- The section must be followed by another `## ` heading, because the checks read
  `sed -n '/^## Per-axis verdicts/,/^## /p'`.

The pitfalls below were each confirmed by a dry run in scratch
(`/tmp/kumitate-r61/ScoutReportTemplate/`):
- **Axis annotations break the axis diff.** `| operability (C1) |`, the style the r60 closure
  table used, prints `> operability (C1)` and exits 1.
- **Stray claim ids break the claim diff.** The claim diff greps `C[0-9]+` across the whole
  section, basis cells included. Writing `C3` in a basis cell, for example a proxy term,
  prints `> C3` and exits 1. `C2=145/145` is harmless only because C2 is already declared.
  Keep proxy terms such as `C1=19/19` and any `C<digit>` text out of this section.
- **No prose with a literal `|`.** The axis extractor is a `-F'|'` awk over every line in the
  section.
- **No bold, colon suffixes or the r58 capitalised `Axis` header.** Use the lowercase header
  `| axis | verdict | claims | basis |`.

**Defect in Q22's own axis command.** Exactly as written in QUALITY.md:263, the command
cannot print nothing against the current `SCORECARD.md`, even for a correct report. Its
SCORECARD extractor scans every line of `## Axes`, including prose lines 372–379 that carry
literal pipes. It therefore emits `js`, `grep -cE`, `js`, and the diff prints
`< grep -cE / < js / < js` and exits 1. Measured on a correct fixture: the as-written command
exits 1. Restricting the extractor to table rows (`f&&/^\|/&&$2~/[a-z]/`) exits 0. Two fixes
are possible: the L1 re-words SCORECARD:378–379 so the prose has no pipe, or a lesson-backed
amendment narrows the extractor. Otherwise the closure reads Q22 as failing on a correct
report.

## 3. `## Round shape` (Q23) — required as a heading with machine lines

Exact block for round 61. It has one dispatch file, `.ufo/waves/round-61/w1-dispatch.json`,
with `.wave` = `kumitate-r61-w1` and `counts.spawn` = 32:

```
## Round shape

WAVE kumitate-r61-w1 payload=32 spawned=<n> returned=<n> dead=<n> gate=<granted|never granted>
FLOOR wave1 spawned executor=<n>/3 scribe=<n>/1 scout=<n>/1 connector=<n>/1 reviewer=<n>/1 critic=<n>/1 verdict=<met|unmet>
spawned total=<n> (<=128)

- <one bullet per deviation from the allowed shapes: rule, observed counts, cause>
<then the existing prose: policy and band, the batched call, attack-role %, the planner
mapping (L1 holds the seat, the validator rejects `planner`), the wave-slot grant line, the
actual-dispatch counts, and dead seats with their last error>
```

Rules (QUALITY.md:283–301):
- Write one `WAVE` line per `*-dispatch.json`, using the file's `.wave` **verbatim**, not
  `w1`. `WAVE w1 …` prints `MISSING kumitate-r61-w1` (dry run).
- `payload` = `counts.spawn`. `spawned`, `returned` and `dead` come from settled evidence
  (launcher progress / `dispatch-actual.json`), never from the payload. Round 41's error was
  writing `seats=106` against 72 spawned.
- The `FLOOR` line counts spawned seats, and any floor role at 0 makes the verdict `unmet`.
  For reference, the r61 payload role mix from `w1-spec.json` is executor 9, scout 8,
  reviewer 5, critic 4, scribe 3, connector 1, mutation-tester 1, sentinel 1 (32 seats), so
  the payload covers every floor role. The spawned counts are still owed.
- The `spawned total` cap is 128 (operator, 2026-10-22).
- `WAVE`, `FLOOR` and `spawned total` must start at column 0: bulleting them (`- FLOOR …`)
  makes the count read 0 (dry run). Putting them inside a fenced block still passes. A prose
  line beginning `FLOOR` or `spawned total` would inflate the required count of exactly 2.
- Allowed shapes are two v1 waves, one v2 wave, or a residual call of ≤8 reviewer/critic
  seats. Anything else, including a wave dispatched before its predecessor returned, gets a
  deviation bullet.

Checks (run from the lane root, report at `../.ufo/reports/round-61/kumitate.md`). The first
loop must print only `ok kumitate-r61-w1`; the second command must print `2`:

```
for f in .ufo/waves/round-61/*-dispatch.json; do w=$(jq -r .wave "$f"); sed -n '/^## Round shape/,/^## /p' ../.ufo/reports/round-61/kumitate.md | grep -q "^WAVE $w " && echo "ok $w" || echo "MISSING $w"; done
sed -n '/^## Round shape/,/^## /p' ../.ufo/reports/round-61/kumitate.md | grep -cE '^(FLOOR|spawned total)'
```

## 4. Recommended round-61 order

1. title `# kumitate — round 61 report (…)`, then the identity/base/tip/measured lines
2. `## Round shape`: promote the r58–r60 preamble to a heading and put the three machine
   lines first, then the prose
3. `## Work performed`
4. `## Landed changes`
5. `## Before → after measurements`
6. `## Per-axis verdicts`: after the measurements it grades, mirroring the closure order
   (claims, axis verdicts, discernment, trends)
7. `## Sources & frontier`
8. `## Trend verdicts`
9. `## SHONEN`
10. `## Stale-lane`
11. `## Open L0 questions`

Every required §4 section keeps its relative order, and both new sections end at the next
`## ` heading, as the range checks need. [INFERENCE] Placing `## Round shape` before
`## Work performed` is safe because §4's order is not machine-checked (watchdog lines 140–160
and 302–314). r58 already inserted a non-§4 section between required ones without a logged
defect.
