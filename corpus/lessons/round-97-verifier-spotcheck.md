author: hyaku closure (non-author integrator, @m_zfl)

# kumitate round 97 — non-author verifier spot-check (closure)

Lane-round: kumitate r97. Lane HEAD before `477afff790787cd2ce48ccf976afafcb5aef0cbc`, after
`243fecd13de2ddc01e830bffbce6758ddb64cee9` (branch `master`). Report `.ufo/reports/round-97/kumitate.md`
(fleet repo). Dispatched prompt `.ufo/prompts/kumitate-round-97.md`.

Driver digest (copied from mutable `.ufo/watchdog.log`):

- 2026-11-06T23:21:56-03:00 launch kumitate round=97 pgid=812698 driver=hyaku-inline attempt=1
- 2026-11-07T00:31:29-03:00 complete kumitate round=97; hyaku-inline attempt=1

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %ae %H %ci' -- .ufo/reports/round-97/kumitate.md` | `kumitate-shokunin kumitate@shokunin.local f478100176f6c4ade2796826dc5b406a49a42600 2026-11-07 00:31:03 -0300` (after lane tip `243fecd1` at 00:30:14, before driver completion 00:31:29) | pass |
| `SHONEN` heading, one line per box | read report §SHONEN | 4 lines: 3 × `[~]` with pointers, 1 × `[ ]` (PROVINCE untouched) | pass |
| cited lane commits exist + ancestor of `master` | `git cat-file -e <h>^{commit} && git merge-base --is-ancestor <h> master` for `017bdd74`, `38eb197c`, `8535793d`, `69fb6943`, `f33786f0`, `e95dcb58`, `647de5c1`, `243fecd1` (+ base `477afff7`) | all `ok`; `git log --oneline 477afff7..243fecd1` = exactly these 8 commits, all author `kumitate-shokunin`, 23:32:02 → 00:30:14 | pass |
| non-commit hashes in report | `5402b210…`, `ccbf1619…`, `acccb0d7…`, `c1f9a159…` | tool sha256 (base / M / M2 `sources-check.mjs`) and ECMA-262 body sha256; not commit claims | n/a |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin`; `git status --porcelain`; `git ls-remote origin refs/heads/master` | `branch=master local=remote=243fecd1… ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty; remote `243fecd13de2…` | pass |
| prompt carries template contract | `diff <(sed 's/{{[A-Z_]*}}//g' kimi-shokunin/templates/round-prompt.md) <(head -n <template lines> .ufo/prompts/kumitate-round-97.md)` | only placeholder substitutions (lane, round, fleet root, axes); hyaku addendum `## 6.` at line 141, then §7 and run-15 notes | pass |
| marker? | — | real report, 8 commits, receipts and measurements | not a marker → status `ok` |

## 2. Claim re-check — C1 operability (one declared claim, not exploratory)

Claim: `scripts/sources-check.mjs` computes `corpus/SOURCES.md` `## Registry` membership exactly as the fleet
census `row_pass` does (R97: `sourceText.split('\n')`, CR kept; `^ {0,3}##[ \t]` sets the section to its
`[ \t]`-trimmed text; `^ {0,3}#[ \t]` clears; starts outside; rows and per-row checks unchanged).

Re-measured (plain commands over committed bytes, run by this closure):

| measurement | command | observed | reported | match |
|---|---|---|---|---|
| tool bytes per revision | `git show <rev>:scripts/sources-check.mjs \| sha256sum` | `477afff7` `5402b210…`; `69fb6943` `ccbf1619…`; `f33786f0` = `243fecd1` `acccb0d792fe…` | base `5402b210…`, M `ccbf1619…`, M2 `acccb0d7…` | yes |
| M → M2 adds selftest arms only | `git diff --stat 69fb6943 f33786f0` | `scripts/sources-check.mjs \| 5 +++++` only | three arms, nothing else | yes |
| rule in shipped bytes vs census | `sources-check.mjs:191-208` @ `243fecd1`; `scripts/sources-census.sh:581,609-614` | tool: `rawLines = sourceText.split('\n')`; `/^ {0,3}##[ \t]/` → `raw.replace(/^ {0,3}##/,'').replace(/^[ \t]+\|[ \t]+$/g,'')`; `/^ {0,3}#[ \t]/` → null. Census (gawk, default RS keeps `\r`): `/^ {0,3}##[ \t]/` → `trim(substr(line,3))=="Registry"` with `trim` = `gsub(/^[ \t]+\|[ \t]+$/,…)`; `/^ {0,3}#[ \t]/` → out | same section state machine | yes |
| independent differential (my fixtures) | 400 random `SOURCES.md` fixtures (seed 9797; indents 0–4 spaces / tab; `#`/`##`/`###`; separators space, tab, none, VT, FF, U+00A0, U+2003, U+FEFF; names incl. `registry`, `Registry ##`, empty; suffixes CR, VT, U+00A0, U+200B, U+2028; stray `#`/`## ` lines; LF / whole-CRLF / mixed); census `sources-census.sh validate --file F --today 2026-11-07` E12 ids vs the section loop + outside-row loop text extracted verbatim from shipped bytes (`sources-check.mjs:134-138,191-208,228-237`) and evaluated in node — the lane CLI was not run | M2 reader vs census: **0 / 400 disagreements** (363 fixtures with ≥1 E12, 1 033 E12 ids); same harness on BASE's extracted loop: 18 / 400 disagree (the differential has teeth) | gate = census on the grammar battery and 1 274 differential cases | yes |
| registry rows | `git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\| S[0-9]{3}'` | `477afff7` 213; `647de5c1` 214; `243fecd1` 214 | 213 → 214 | yes |
| new rows | `git diff 477afff7 243fecd1 -- corpus/SOURCES.md \| grep -E '^[-+]\|'` | `+S276` only; no row removed or changed | A +1, rows touched none | yes |
| frozen inputs untouched | `git diff --stat 38eb197c 243fecd1 -- .ufo/waves/round-97/{plan.md,probe,controls,open}` | empty | K4 unchanged | yes |
| counter grid lacks the six classes | `grep -oE '\\(u[0-9a-fA-F]{4}\|x..\|v\|f)' probe/probe97-c1.mjs \| sort \| uniq -c` | only `\f`, `\u00a0`, `\v` (4 each); 0 hits for U+2003/U+200B/U+FEFF/U+2028/fences | K97CriticA blind spot | yes |

Evidence-verified (lane gate and frozen counter not executed — §Gate standard, Closure consequence):

- Selftest: base `SOURCES_SELFTEST: 46/46 pass` (`open/`, `controls/ctl-nothing.txt`) → M2 `71/71 pass`, `VERDICT: PASS`
  (`close-l1/selftest-M2.txt`).
- Frozen counter: do-nothing `C97_C1: UNMET a=0/1 b=0/1 c=0/1 d=1/1 e=1/1 f=1/1 tool_sha256=5402b210…`
  (`controls/ctl-nothing.txt`); 16 controls UNMET, `ctl-positive` HELD (17 controls + `controls-sha256.txt`); M
  `HELD … tool_sha256=ccbf1619…` ×2 (`close/probe{1,2}.txt`, seeds `a6f33876…`, `271b1d2d…`); M2 `HELD …
  tool_sha256=acccb0d7…` ×2 (`close/probe-m2-{1,2}.txt`, seeds `e1495903…`, `ef231a18…`) — the revision measured is
  the shipped bytes.
- Re-mutation of shipped M2 bytes: `REMUT: killed=15/15`, `positive: PASS … 71/71`
  (`close-l1/integration-remut.txt`); `M2_TEETH: killed=3/3` (`close-l1/m2-teeth.txt`); invalid first run kept and
  not cited (M97-2).
- Final battery (`close/battery-final.txt`): `PROXY: MATCH (… operability=9; … coverage=10 …)` twice (incl.
  `--strict`), `README_MAP: CLEAN files=251`, `SOURCES_CHECK: CLEAN (rows=214 …)`, every `exit=0`. Q88
  (`close/q88-r97.txt`): `ROUND_GATE: CLEAN (round=97 …)`, `Q88: PASS round=97 M=f33786f0…`. Wave: `w1-results.json`
  11 results.

No-harm: `git diff 477afff7 243fecd1 -- SCORECARD.md` removes only `A_wave=1595`, `C2=248`, `C2_total=248`,
`pin.sources-check=5402b210…`, each re-declared (`1650`, `251`, `251`, `acccb0d7…`), plus 48 added lines
(stanza, move-log row 97, disposition, r98 pre-registration). No axis integer moved (operability 9 terminal;
coverage rows 10; `PROXY: MATCH`). Spot reads: `SKILL.md:614` sources-check row replaced (one line); `LOG.md`,
`corpus/README.md`, `corpus/QUALITY.md` (+Q91 at :1550), new `corpus/knowledge/sources-check-registry-section.md`
(`source:` S276/S275/S274, `verified-at: f33786f0…`) — additions only. Real-lane `--json` byte-identity
(K97ExecHarm) not re-run here; the final battery's `SOURCES_CHECK: CLEAN rows=214` agrees.

| axis | verdict | reason |
|---|---|---|
| operability | improved | owned gate's section reader now equals the census `row_pass` grammar (code read + my 400-fixture differential 0 disagreements vs BASE 18); integer 9 terminal, the move is the instrument |
| coverage | unchanged | every coverage row 10 before and after (`PROXY: MATCH` at final) |

## 3. Discernment spot-check (`corpus/lessons/round-97.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| `sources-check.mjs` R97 (M2 `acccb0d7…`) | admit | shipped bytes `243fecd1:scripts/sources-check.mjs:191-237` + `scripts/sources-census.sh:581,609-621`; my 400-fixture differential (§2) | agree | identical heading test, trim class and clear rule; 0/400 E12 disagreements including U+2003/U+FEFF/U+2028/U+200B shapes the frozen counter never draws |
| S276 ECMA-262 2025 | admit | `curl https://tc39.es/ecma262/2025/` → HTTP/2 200, 7 330 686 bytes, sha256 `c1f9a15946c7dd94…` (= row); tag-stripped, whitespace-collapsed body: "Return the CharSet containing all characters corresponding to a code point on the right-hand side of the WhiteSpace or LineTerminator productions." found right after "CharacterClassEscape :: s"; "The definition of white space is the union of WhiteSpace and LineTerminator." found right after the TrimString steps (tags stripped to empty); raw byte 4977578 / 5262464 / 2402224 open exactly the cited sentences | agree | both quotes verbatim at the stated locations, 21 and 12 words (my count); they ground exactly why JS `\s`/`trim()` diverge from the census `[ \t]` |
| "C97_C1: HELD certifies R97" | reject | `K97CriticA/run-x-*.txt`: 7 distinct `tool_sha256` at HELD (6 constructions + replay own seed), 7 UNMET; `K97CriticA/diverge.txt`: each of the six → census E12=1 vs tool e12=0; counter grep (§2) shows no U+2003/U+200B/U+FEFF/U+2028/fence class | agree | the counter cannot certify the clause set; the shipped bytes rest on R97 by construction, the selftest and the differential — which my own differential independently confirms |

New `corpus/SOURCES.md` row re-opened: S276 (above). Its quote cell and the lesson's two ≤25-word quotes were
re-found verbatim. Observation only: the live `Last-Modified` header now reads `17:17:56 GMT` vs the row's
`17:17:55 GMT`; the body sha256 is identical, so the captured bytes are the same document.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → 8 × `W04` duplicate-url
warnings (S034, S068, S084, S095, S123, S126, S247, S271 — pre-existing) and `kumitate ok …/corpus/SOURCES.md`,
rc=0; matches `close/census-after.txt`.

## 4. Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| expansion | improved | new `corpus/knowledge/sources-check-registry-section.md` citing mined S276 (re-opened above, sha256 match); SOURCES 213 → 214 |
| quality | improved | gate section rule = census (differential re-run here, 0/400), selftest 46 → 71, re-mutation 15/15 at M2, M97-2 invalid run discarded not cited; r96 routed items 1 (one name for M) and 5 (spot-check adopted before freeze, `017bdd74`) answered |
| discernment | improved | the outside spot-check agrees with the gate on both admits and the reject sampled; the counter blind spot became a recorded reject plus Q91 (shown able to fail by `x-replay`) |

## 5. Defects (status-neutral) and routed items

1. Counter grid (lane r98 item 1): six HELD constructions; independently confirmed the grid draws only `\v`, `\f`,
   U+00A0 among non-ASCII/odd separators. Route: kumitate, r98 counter must draw Unicode `White_Space`/`Zs`/`Cf`,
   U+2028/U+2029 and fences.
2. `r97sec-census-parity` selftest arm hardcodes `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` first and
   returns `skip` when no census is found or on census exit ∉ {0,1}; skips print `SKIP` and leave the tally (70/70 on
   such a host), so the arm is host-bound rather than hermetic (`close-l1/selftest-M2.txt:52` shows it PASS here).
   Route: kumitate, derive the census path from `SHOKUNIN_ROOT` and note in the SKILL registry row that the arm can skip.
3. Carried (lane r98 items 2–5): census row-count definition, `round-gate` `SOURCES_ROW_RE` `\s` padding vs `[ \t]`,
   sibling-tool transfer (report only), M93 carry items, census `\r` L0 question (`kumitate | round-96`).
4. This spot-check is not yet in the lane's README map; the lane adopts it before its r98 freeze (M94-1 ordering).

SHONEN: boxes 1–3 (`[~]`) look checkable by a non-author from committed bytes (SKILL decision row, LOG end-to-end
entry, `--selftest` 71/71 receipt); box 4 has no evidence this round. Promotion stays operator-owned.
