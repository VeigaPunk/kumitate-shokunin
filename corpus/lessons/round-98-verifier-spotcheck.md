author: hyaku closure (non-author integrator, @m_zfl)

# kumitate round 98 — non-author verifier spot-check (closure)

Lane-round: kumitate r98. Lane HEAD before `2f09c674bf650a6af71f8d0f8ace2ccb92c61527`, after
`cb3c003faa41f06d509a42b3c917bacf3ba0f252` (branch `master`). Report `.ufo/reports/round-98/kumitate.md`
(fleet repo). Dispatched prompt `.ufo/prompts/kumitate-round-98.md`.

Driver digest (copied from mutable `.ufo/watchdog.log`):

- 2026-11-07T00:36:14-03:00 launch kumitate round=98 pgid=688931 driver=hyaku-inline attempt=1
- 2026-11-07T03:08:10-03:00 complete kumitate round=98; hyaku-inline attempt=1

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %ae %H %ci' -- .ufo/reports/round-98/kumitate.md` | `kumitate-shokunin kumitate@shokunin.local bf72316e540f97eb3bb4423560edd8f09ad4b975 2026-11-07 03:07:38 -0300` (after lane tip `cb3c003f` at 03:06:07, before driver completion 03:08:10) | pass |
| `SHONEN` heading, one line per box | read report §SHONEN | 4 lines: 3 × `[~]` with pointers, 1 × `[ ]` (PROVINCE unchanged) | pass |
| cited lane commits exist + ancestor of `master` | `git merge-base --is-ancestor <h> master` for `42f08b17`, `7038ee4c`, `8a6a4490`, `6172bd82`, `94195b83`, `1d83c79e`, `cb3c003f` (+ base `2f09c674`) | all ancestors; `git log --oneline 2f09c674..cb3c003f` = exactly these 7 commits, all author `kumitate-shokunin`, 00:53:38 → 03:06:07 | pass |
| non-commit hashes in report | `edaa115f…`, `e7c1455e…`, `84ebaf9f…`, `1def379f…`, `a5c9d6e5…`, seeds | tool sha256 (base / M / M2 `round-gate.mjs`; M2+hygiene `sources-check.mjs`), S277 body sha256, counter seeds; not commit claims | n/a |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `branch=master local=remote=cb3c003f… ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty; remote `cb3c003faa41…` | pass |
| prompt carries template contract | `diff <(sed 's/{{[A-Z_]*}}//g' kimi-shokunin/templates/round-prompt.md) <(head -n 140 .ufo/prompts/kumitate-round-98.md)` | 10 hunks (lines 1, 5–6, 46, 61, 65, 69, 101, 133, 135, 139), all placeholder substitutions (lane, round, fleet root, axes); hyaku addendum `## 6.` at line 141, then §7 and run-15 notes | pass |
| marker? | — | real report, 7 commits, receipts and measurements | not a marker → status `ok` |

## 2. Claim re-check — C1 operability (one declared claim, not exploratory)

Claim: `scripts/round-gate.mjs` `SOURCES_ROW_RE` uses ASCII SP/TAB id-cell padding
(`^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|`) instead of JS `\s`, inside and outside `## Registry` alike, matching the
fleet census row class; every other production branch unchanged.

Re-measured (plain commands over committed bytes, run by this closure):

| measurement | command | observed | reported | match |
|---|---|---|---|---|
| tool bytes per revision | `git show <rev>:scripts/round-gate.mjs \| sha256sum` | `2f09c674` `edaa115fa0537986…`; `6172bd82` `e7c1455e8e8afa12…`; `94195b83` = `1d83c79e` = `cb3c003f` `84ebaf9f2632114c…` | base `edaa115f`, M `e7c1455e`, M2 `84ebaf9f` | yes |
| production change scope | `git diff -U1 2f09c674 6172bd82 -- scripts/round-gate.mjs \| grep -E '^@@\|^-'` | three hunks: doc comment at :117, `SOURCES_ROW_RE` at :409–411 (`\s*` → `[ \t]*` both sides), selftest arms appended at :1791 (84 `+` lines total) | regex only, other branches unchanged | yes |
| M → M2 adds selftest arms only | `git diff --stat 6172bd82 94195b83` | `scripts/round-gate.mjs \| 55 +` only | two arms, nothing else | yes |
| rule vs census | `round-gate.mjs:411,428-436` @ `cb3c003f`; `scripts/sources-census.sh:609-621` | gate: `/^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/` after the r97 section machine; census: strip `^ {0,3}`, then `/^\|[ \t]*S[0-9]{3,}[ \t]*\|/` (outside → E12), `trim` = `[ \t]` | same id-cell class | yes |
| independent differential (my fixtures) | 400 random `SOURCES.md` fixtures (seed 9898; indent 0–4 SP or TAB; pads SP, TAB, none, double, U+00A0, U+2003, U+3000, U+FEFF, U+200B, U+2028, VT, FF, CR, U+1680, U+202F, U+0085; id lengths 2/3/4/7/8/12; Arabic-Indic / fullwidth digit injection; `s` case; first-row BOM; LF / CRLF), all rows outside Registry; census `sources-census.sh validate --file F --today 2026-11-07` E12 id lists vs the regex literal extracted from each revision's shipped bytes inside the gate's section loop, evaluated in node (lane CLI not run) | M2 regex vs census: **0 / 400 disagreements** (361 fixtures with ≥1 E12, 889 E12 ids); BASE regex: **390 / 400** disagree (differential has teeth) | gate class = census class | yes |
| registry rows | `git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\| S[0-9]{3}'` | `2f09c674` 214; `1d83c79e` 215; `cb3c003f` 215 | 214 → 215 | yes |
| new rows | `git diff 2f09c674 cb3c003f -- corpus/SOURCES.md \| grep -E '^[-+]\|'` | `+S277` only; no row removed/changed | A +1, none touched | yes |
| frozen inputs untouched | `git diff --stat 7038ee4c cb3c003f -- .ufo/waves/round-98/{plan.md,probe,controls,open}` | empty | K4 diff empty | yes |
| sources-check hygiene bytes | `git show cb3c003f:scripts/sources-check.mjs \| sha256sum`; `git diff 94195b83 1d83c79e -- scripts/sources-check.mjs` | `1def379f…` (= `pin.sources-check`); hardcoded `/home/vgpnk/…` census path → `join(derivedRoot,…)` from `SHOKUNIN_ROOT`/sibling; found-census exit ∉{0,1} now `ok:false` (was skip) | hygiene, not a claim | yes |

Evidence-verified (lane gate and frozen counter not executed — §Gate standard, Closure consequence):

- Selftest: base `ROUND_GATE_SELFTEST: 94/94 pass` (`controls/ctl-nothing.txt`) → M `96/96` (`K98ExecTool/score{1,2}.txt`)
  → M2 `98/98 pass`, `VERDICT: PASS` (`close-l1/selftest-M2.txt`). sources-check installed `SOURCES_SELFTEST: 71/71 pass`
  (`close-l1/sources-selftest-installed.txt`).
- Frozen counter: do-nothing `C98_C1: UNMET a=0/1 b=0/1 c=0/1 d=81/81 e=1/1 … tool_sha256=edaa115f…`; `controls/OBSERVED.txt`
  15 controls, all `match=yes` (14 UNMET, `ctl-positive` HELD). M `HELD … tool_sha256=e7c1455e…` ×2 (seeds `f47aaa87…`,
  `e14f949f…`); M2 `HELD … tool_sha256=84ebaf9f…` ×2 (`close/probe-m2-{1,2}.txt`, seeds `f6a8a522db960430`,
  `e1a92c68c5efab94`, freeze `7038ee4c`) — revision measured is the shipped bytes.
- Re-mutation: `REMUT: killed=14/14 reference=PASS` (`close-l1/integration-remut.txt`); `M2_TEETH: killed=9/9`
  (`close-l1/m2-teeth.txt`); invalid missing-import run retained separately, not tallied.
- Final battery (`close/battery-final.txt`): `PROXY: MATCH (A=37 C=47 operability=9; … C2=254/254 coverage=10 …)` twice,
  `README_MAP: CLEAN files=254`, `SOURCES_CHECK: CLEAN (rows=215 …)`, `ROUND_GATE: CLEAN` tracked + round=97, every `exit=0`.
  Wave: `w1-results.json` `.results|length` = 12. New-entry cite-check `errors=0` ×2 (`close-l1/cite-new-entries.txt`).

No-harm: `git diff 2f09c674 cb3c003f -- SCORECARD.md` removes only `A_wave=1650`, `C2=251`, `C2_total=251`,
`pin.round-gate=edaa115f…`, `pin.sources-check=acccb0d7…` and the r98 pre-registration pointer line, each re-declared
(`1695`, `254`, `254`, `84ebaf9f…`, `1def379f…`, r99 pointer), plus 29 added lines. No axis integer moved
(operability 9 terminal; coverage rows 10; `PROXY: MATCH`). Spot reads: `SKILL.md` round-gate and sources-check
registry rows replaced (one line each; the sources-check row now states when the parity arm skips — r97 routed item 2);
`LOG.md` +19, `corpus/QUALITY.md` +20 (Q92), `corpus/README.md` +3, new `corpus/knowledge/round-gate-row-id-class.md`
(`source:` S277/S276/S274, `verified-at: 94195b83…`) — additions only; PROVINCE/SHONEN untouched.

| axis | verdict | reason |
|---|---|---|
| operability | improved | owned gate's row recogniser now uses the census `[ \t]` id-cell class (code read + my 400-fixture differential 0 disagreements vs BASE 390); integer 9 terminal, the move is the instrument |
| coverage | unchanged | every coverage row 10 before and after (`PROXY: MATCH` at final) |

## 3. Discernment spot-check (`corpus/lessons/round-98.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| round-gate R98 at M/M2 (`84ebaf9f…`) | admit | shipped bytes `cb3c003f:scripts/round-gate.mjs:409-436` + `scripts/sources-census.sh:609-621`; my 400-fixture differential (§2) | agree | identical pad class and id class (ASCII digits, ≥3) on every row shape I drew, including Zs/Cf/C0/line-separator pads, long ids, Unicode digits and BOM; BASE diverges on 390/400 |
| S277 POSIX ch. 7 Locale | admit | `curl https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html` → HTTP 200, 169 700 bytes, sha256 `a5c9d6e5a971aaa4…` (= row and = committed `close-l1/l1-open-posix-ch07.html`); line 354: "In the POSIX locale, only the &lt;space&gt; and &lt;tab&gt; shall be included." under `<dt><b>blank</b>` (line 352); `space` at 300–303 lists FF/LF/CR/TAB/VT | agree | quote verbatim at the cited line, 12 words (my count); it grounds exactly why the census `[ \t]` blank class is narrower than JS `\s` (S276) |
| "C98_C1 HELD certifies R98" | reject | `K98CriticA/logs` + `battery-grid.txt`: 9 distinct `tool_sha256` at HELD on seed `00000000a1b2c3d4` (8 constructions + positive `d5737901`); `K98CriticA/minimal-diff.txt`: padcap3, shy, c0, hangulfill, idcap7, lrmstrip, rejskip, bomstrip each `DIFF` vs census | agree | the frozen counter cannot certify the rule; shipped bytes rest on code, selftests and differentials — my own differential independently confirms |
| "all three readers agree inside the Registry" | reject | `scripts/sources-check.mjs:134` `function trim(value) { return value.trim(); }` used on inside cells (:231–259); `K98Connector/K98Connector.md:50` (FIX-A parity table: sources-check accepts 148 non-blank-padded rows as valid ids that round-gate/census do not) and `receipt-disagreements.txt:397-399` (`sources-check vs census` 148/386 on FIX-A, 0/386 on FIX-B) | agree | sources-check still trims with the JS whitespace class inside cells; outside-row and section parity do not imply inside-cell parity; routed r99, correctly not folded into R98 |

New `corpus/SOURCES.md` row re-opened: S277 (above); body hash identical to the row and the L1 capture, quote cell
re-found verbatim at line 354.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → 8 × `W04` duplicate-url
warnings (S034, S068, S084, S095, S123, S126, S247, S271 — pre-existing) and `kumitate ok …/corpus/SOURCES.md`,
rc=0; matches `close/census-after.txt`.

## 4. Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| expansion | improved | new `corpus/knowledge/round-gate-row-id-class.md` citing mined S277 (re-opened above, sha256 match); SOURCES 214 → 215 |
| quality | improved | gate row class = census (differential re-run here, 0/400), selftest 94 → 98, re-mutation 14/14, M2 teeth 9/9; r97 routed items 1 (32 pad classes, Q92), 2 (census path from `SHOKUNIN_ROOT`, found-census bad exit fails) and 4 (spot-check adopted before freeze, `42f08b17`) answered |
| discernment | improved | the outside spot-check agrees with the gate on both admits and both rejects sampled; the r97 counter blind spot became Q92 plus recorded rejects |

## 5. Defects (status-neutral) and routed items

1. Read-order defect (self-disclosed): the frozen plan's "Load done" overstated L1 ordering; canonical protocol and
   fleet mission/axes/corpus/learning were opened during integration. Route: kumitate r99 loads them before choosing
   a claim and the frozen plan records the actual read order.
2. Frozen counter still certifies nothing beyond its grid (eight wrong recognisers HELD). Route: kumitate, successor
   counter draws pad lengths 0–8, id lengths 3–12, Zs/Cf/C0/filler pads, first-line BOM, nonce header and a
   census-unavailable/delegation control (lesson item 2).
3. sources-check inside-cell `trim()` vs census `[ \t]` (ID_FORM/E02 and row-count divergence). Route: kumitate r99
   candidate (lesson item 1).
4. Prospective framing: zero non-blank pads in live rows (K98CriticB/K98Scout); the gain is instrument correctness,
   not a live incident — recorded honestly, no defect.
5. Carried: status case/trim and URL class, M93-3/M93-5/R93-D1/F93 fixtures, sibling transfer (report-only),
   census gawk/bash CR L0 question (`kumitate | round-96`).
6. This spot-check is not yet in the lane's README map; the lane adopts it before its r99 freeze (M94-1 ordering).

SHONEN: boxes 1–3 (`[~]`) look checkable by a non-author from committed bytes (SKILL registry rows, LOG Round 98
end-to-end entry, `--selftest` 98/98 and 71/71 receipts); box 4 has no evidence this round. Promotion stays
operator-owned.
