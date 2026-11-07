# w1 / K100ExecTool — R100 candidates built, counter HELD twice, teeth 15/15

Seat: K100ExecTool (executor). Lane read-only; all writes inside
`.ufo/waves/round-100/K100ExecTool/` (+ this report) and
`/fast/scratch/hyaku/kumitate-r100/K100ExecTool/` (removed at close).

## Candidates (READY, final — no edit after READY)

- `K100ExecTool/cite-sources.mjs` sha256 `e887b982eff4bcfe5d15e47b2c105ebabf4b4dd9cae7ec4fdf8599fccdab9ace`
- `K100ExecTool/source-capture.mjs` sha256 `ad3227d6571838ccefa10aa3778c9777730f5e1ad9a89f03f528d6f2d7104355`
- `K100ExecTool/READY` = the two `<sha>  <file>` lines; `cd K100ExecTool && sha256sum -c READY` → OK/OK.
- `K100ExecTool/diff.txt` (`diff -u` vs lane `scripts/`): only the two reader lines, two header doc
  sentences (rule R100: LF records, 0–3 SP indent, SP/TAB id pad, `S`+3+ ASCII digits closed by `|`),
  and added selftest cases. cite line 40: `line.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)`;
  capture line 159: `raw.split('\n').map((l) => l.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)).filter(Boolean)`
  (no `m` flag — one LF record per line, the census record model).

## Frozen counter (never edited), two fresh-seed runs

`node .ufo/waves/round-100/probe/probe100-c1.mjs --cite <seat>/cite-sources.mjs --capture <seat>/source-capture.mjs --work <scratch>/probe`

- score1.txt: `C100_C1: HELD a=1 b=1 c=1 d=1 rows=135 valid=33 invalid=102 a_miss=0 b_miss=0 c_miss=0 lanes=21 seed=ca29791fb0b17e47 …` (exit 0)
- score2.txt: `C100_C1: HELD a=1 b=1 c=1 d=1 rows=135 valid=33 invalid=102 a_miss=0 b_miss=0 c_miss=0 lanes=21 seed=620be7fee5300a1a …` (exit 0)

## Selftest arms with teeth (K2)

- cite: 8 cases → **25** (`K100ExecTool/selftest-cite.txt`, `CITE_SOURCES_SELFTEST: PASS (25/25)`, exit 0)
- capture: 13 → **33** (`K100ExecTool/selftest-capture.txt`, `SOURCE_CAPTURE_SELFTEST: PASS (31→33/33)`, exit 0)
- Every new case asserts the exact verdict line (`CITE_SOURCES: DRIFT ghosts=1 first=Sxxx` /
  `CLEAN cited=n`; `SOURCE_CAPTURE: CLEAN captures=… exemptions=…` /
  `DRIFT … bad=1 first=Sxxx:orphan-exemption`).
- `K100ExecTool/arm-teeth.txt`: all 16 controls regenerated into scratch with
  `make-controls100.py` (BASE hashes reproduced: ctl-nothing files byte-equal to lane scripts),
  each control's two lines applied to the candidates, both selftests run per control →
  **TEETH: 15/15 KILLED**, ctl-positive clean. Per-shape kills include: nothing → 8 cite + 14
  capture fails; k99/splitany → 3 same-record capture fails; indent-blank → indent-tab;
  indent4 → both sides; spaceonly/padcap3 → blankpad-rows (TAB/SP pads len 1,4,8 are rows);
  nbsp/leadjs/trailjs → dedicated pad cases (both-sided, lead-only, trail-only);
  noanchor → s123x (+trailpad); ci → lowercase-not-row (capture); unicode-digits →
  fullwidth-not-row (capture); citeonly/captureonly → the BASE-side families.

## Findings an attacker should re-derive

1. **ctl-ci / ctl-unicode-digits cannot be killed on the cite side, by construction.** Cited ids
   come from the unchanged `ID_RE = /\bS[0-9]{3,}\b/g` (uppercase ASCII only), so no README
   citation can ever equal a lowercase or `\p{Nd}` id; the mutated cite files pass 25/25 by
   verdict-equivalence. The kill for both shapes is a capture case — which is what "a case of the
   tool it changes" needs, since both tools' lines differ from REF. Recorded in arm-teeth.txt.
2. Both-sided-pad cases alone do **not** kill ctl-leadjs/ctl-trailjs (the strict opposite side
   blocks the match); dedicated lead-only (`|\u00A0S807|`) and trail-only (`|S808\u2003|`) cases
   were required on both tools.
3. Case discovery detail (my harness, not the candidates): cite selftest prints `FAIL <name> —`,
   capture prints `case <name>: FAIL` — any K2 mutation sweep must parse both shapes.
4. Battery arm (c) passed with c_miss=0 on all 21 fleet snapshots — no live-file regression, as
   the plan's disclosed limit (1) predicted.

## Risks / blockers

None known. Candidates are byte-frozen as of READY; probe receipts `score1.txt`/`score2.txt`
quote the candidate sha256 pair above, so the verdicts are pinned to exactly these bytes.
