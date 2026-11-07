author: hyaku closure (non-author integrator, @m_zfl)

# kumitate round 95 — non-author verifier spot-check (closure)

Lane-round: kumitate r95. Lane HEAD before `12aa450f51127e4ee6c105944ef5e21285342f70`, after
`03b2eb4fadb51403096a1209fd1214daf4168adf` (branch `master`). Report `.ufo/reports/round-95/kumitate.md`
(fleet repo). Dispatched prompt `.ufo/prompts/kumitate-round-95.md`.

Driver digest (copied from mutable `.ufo/watchdog.log`):

- 2026-11-06T21:27:43-03:00 launch kumitate round=95 pgid=910102 driver=hyaku-inline attempt=1
- 2026-11-06T22:11:36-03:00 complete kumitate round=95; hyaku-inline attempt=1

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an <%ae> %H %ci' -- .ufo/reports/round-95/kumitate.md` | `kumitate-shokunin <kumitate@shokunin.local> 8948db0171f0c82a408bdaf8660b60dabd16f3f5 2026-11-06 22:11:24 -0300` (after lane tip `03b2eb4f` at 22:11:17, before driver completion 22:11:36) | pass |
| `SHONEN` heading, one line per box | read report §SHONEN | 4 lines: 3 × `[~]` with pointers, 1 × `[ ]` (PROVINCE untouched) | pass |
| cited lane commits exist + ancestor of `master` | `git rev-parse --verify <h>^{commit}` + `git merge-base --is-ancestor <h> master` for `eadd519d`, `ee8479be`, `65c3374d`, `ce58e03e`, `89215d7a`, `a59fbedc`, `abceb43b`, `1eb57084`, `03b2eb4f`, `12aa450f` | all 10 resolve, all `anc=ok`; `git log 12aa450f..03b2eb4f` = exactly those 9 round commits, all author `kumitate-shokunin` | pass |
| non-commit hashes in report | `11f83a1a…`, `7aaf0082…`, `aba737dc…`, `c5a2f8ac…`, `b153d814…`, `6df7d077…` | tool sha256 values (base / M / M2 `round-gate.mjs`, READY candidate) and fetched-page sha256 values; not commit claims | n/a |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin`; `git status --porcelain` | `branch=master local=remote=03b2eb4f… ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty | pass |
| prompt carries template contract | `diff <(sed -n 1,140p templates/round-prompt.md) <(sed -n 1,140p .ufo/prompts/kumitate-round-95.md)` | only placeholder substitutions (`{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}`); §6 hyaku addendum follows at line 141 | pass |
| marker? | — | real report with 9 commits, receipts and measurements | not a marker → status `ok` |

## 2. Claim re-check — C1 operability (one declared claim, not exploratory)

Claim: `scripts/round-gate.mjs` `declaredPins()` reads a `corpus/SOURCES.md` registry row's cells only when
`line.split('|')` has 13 fields (census `NF==13`); any other registry row declares no pin and its id is listed in file
order in the always-present `--json` `citations.malformedRows`.

Re-measured (plain commands over committed bytes, run by this closure):

| measurement | command | observed | reported | match |
|---|---|---|---|---|
| base gate bytes | `git show 12aa450f:scripts/round-gate.mjs \| sha256sum` | `11f83a1ac7b539e7…` | base `11f83a1a…` | yes |
| shipped gate bytes = pin | `git show 03b2eb4f:scripts/round-gate.mjs \| sha256sum`; `grep pin.round-gate SCORECARD.md` | `aba737dc41ffbed4…` both | `aba737dc…` = `pin.round-gate` | yes |
| the rule in shipped bytes | read `round-gate.mjs:414-428` @ `03b2eb4f` | `const fields = line.split('|'); if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }` precedes the `fields[8]` status read | rule as claimed | yes |
| `malformedRows` always present | `git grep -n malformedRows 03b2eb4f -- scripts/round-gate.mjs` | initialised `malformedRows: []` at 440 and 732; info line `SOURCES_ROWS_MALFORMED` at 807-809 | as claimed | yes |
| fixture malformed ids (independent re-derivation) | rebuilt the counter's 9 fixture rows (`probe95-c1.mjs:117-142`) in Python, piped through `gawk -F'\|' '/^ {0,3}\| S[0-9]+ / && NF!=13 {print $2}'` | `S002 S003 S004 S007` | `malformedRows=["S002","S003","S004","S007"]` = census awk ids | yes |
| real registry shape, before → after | `git show <rev>:corpus/SOURCES.md \| awk -F'\|' '/^\| S[0-9]+ /{n++; if(NF!=13)b++} END{print n,b+0}'` | `12aa450f`: `210 0`; `03b2eb4f`: `212 0` | rows 210 → 212; 0 malformed (`open/real-malformed-before.txt`, K95Scout) | yes |
| new rows | `git diff 12aa450f 03b2eb4f -- corpus/SOURCES.md \| grep '^+\|'` | `+S273`, `+S274` only; no existing row changed | A +2, rows touched none | yes |
| frozen inputs untouched | `git diff --stat ee8479be 03b2eb4f -- .ufo/waves/round-95/{plan.md,probe,controls,open} \| wc -l` | `0` | K4 empty | yes |

Evidence-verified (lane gate and counter not executed — §Gate standard, Closure consequence):

- Selftest before 79/79: `.ufo/waves/round-95/K95CriticA/receipts/atk-*.txt` (`C94 SELFTEST exit=0 ROUND_GATE_SELFTEST: 79/79 pass`).
  At M 88/88 (`close-l1/integration-remut.txt:33`); at M2 89/89 with the survivor arm failing on the mutant 87/89
  (`close-l1/survivor-remut.txt:4-10`).
- Frozen counter: base do-nothing `C95_C1: UNMET a=0/1 b=0/1 c=0/78 d=1/1 tool_sha256=11f83a1a…` (`controls/ctl-nothing.txt`);
  M `HELD a=1/1 b=1/1 c=78/78 d=1/1 tool_sha256=7aaf0082…` ×2 (`close/probe{1,2}.txt`); M2 same verdict with
  `tool_sha256=aba737dc…` ×2 (`close/probe-m2-{1,2}.txt`) — the revision measured is the shipped bytes.
- Harm battery at final (`close/battery-final.txt`): `PROXY: MATCH (… operability=9 … coverage=10 …)`,
  `README_MAP: CLEAN`, `SOURCES_CHECK: CLEAN (rows=212 …)`, `COUNTER_PINS: CLEAN`, `SPOTCHECK_COVERAGE: CLEAN`,
  `ROUND_GATE: CLEAN` (tracked, r93, r94), census `kumitate ok`. Q88 own-round receipt `close/q88-r95.txt`:
  `Q88: PASS round=95 … gate_sha256=aba737dc…`, `ROUND_GATE: CLEAN (round=95 …)`.
- Wave: `w1-results.json` 10 results (executor ×2, scribe ×2, scout, connector, reviewer, critic ×2, mutation-tester),
  10 seat reports in `w1/`.

No-harm: `git diff 12aa450f 03b2eb4f -- SCORECARD.md` changes only the proxy bookkeeping terms (`A_wave` 1503→1532,
`C2`/`C2_total` 242→245, `pin.round-gate` re-pin), appends the r95 move-log row, the r94 named correction, the r95
disposition and the r96 pre-registration. No axis integer moved (operability 9 terminal; coverage rows 10).
Spot reads of `SKILL.md:610` (round-gate exit-code → verdict map), `corpus/QUALITY.md` Q89, `corpus/README.md`
(+3 map rows) and `LOG.md` (r95 section + one-line record + addendum) show additions only.

| axis | verdict | reason |
|---|---|---|
| operability | improved | owned gate repaired: malformed registry rows no longer declare pins (S94-5 closed); integer 9 terminal, move is the instrument |
| coverage | unchanged | every coverage row 10 before and after (`PROXY: MATCH`) |

## 3. Discernment spot-check (`corpus/lessons/round-95.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S273 GFM tables | admit | `curl https://github.github.com/gfm/` → HTTP 200, sha256 `b153d814fdfc8624…` (= row); body line 4575 `Include a pipe in a cell’s content by escaping it, including inside other` / 4576 `inline spans:`; leading/trailing-pipe sentence at 4510 | agree | quote verbatim at the stated location, 15 words (`wc -w`) as stated; it grounds why the census shape is stricter than GFM |
| S274 POSIX awk | admit | `curl https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html` → HTTP 200, sha256 `6df7d0776af4b28d…` (= row); FS item `If FS is a single character` at ≈ byte 51297, `Otherwise, if FS is any other character c, fields shall be delimited by each single occurrence of c.` (tags stripped); `The number of fields in the current record` at byte 42174 | agree | quote verbatim, 18 words as stated; it is the mechanism behind the census `NF!=13` test the gate now mirrors |
| GFM-aware row parsing | reject | `scripts/sources-census.sh:24,635` (`E01 malformed row (NF!=13)`, `if (NF!=13)`); `kumitate-shokunin/scripts/sources-check.mjs:261` (`if (fields.length !== 13)` → `ROW_MALFORMED`) | agree | both registry validators split on a bare `\|`; a GFM-aware gate would trust rows both refuse — a second authority on one file |
| "frozen counter pins the rule's clauses" | reject | `K95CriticA/receipts/atk-*.txt`: `grep -h C95_C1 … \| sort \| uniq -c` → 9 distinct `tool_sha256` values, each `HELD a=1/1 b=1/1 c=78/78 d=1/1` | agree | nine rule-violating constructions pass the counter, so the counter cannot certify clauses; the lane correctly rests the shipped bytes on the selftest arms (15/15 re-mutation) |

New `corpus/SOURCES.md` rows re-opened: S273 and S274 (above). The ≤25-word quotes live in the lesson `## Gate` with
location; both re-found verbatim, both counts correct (Q89 receipt `close-l1/q89-round-95.txt`: `WORDCOUNT: CLEAN pairs=2`,
exit 0; this closure recounted by hand with `wc -w`: 15, 18).

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → 8 × `W04` duplicate-url
warnings (S034, S068, S084, S095, S123, S126, S247, S271 — all pre-existing) and `kumitate ok …/corpus/SOURCES.md`, rc=0;
matches the report.

## 4. Trend verdicts

| trend | verdict | evidence |
|---|---|---|
| expansion | improved | new `corpus/knowledge/round-gate-registry-shape.md` citing mined S273/S274, with its coverage-map row in `corpus/README.md`; SOURCES 210 → 212 |
| quality | improved | the gate stops reading cells of malformed rows (selftest 79 → 89, mutation survivor killed); r94 word-count slips corrected append-only in `SCORECARD.md`; Q89 shown able to fail (r94 rc=1) |
| discernment | improved | the outside spot-check agrees with the gate on both admits and both rejects sampled |

## 5. Defects (status-neutral) and routed items

1. Lesson `## Gate` entries for S273/S274 record access date, location and quote but not the URL (CORPUS.md §Rules 1
   asks the lesson to carry the URL); the URL lives only in the SOURCES row. Route: kumitate, carry the URL in the
   lesson for new rows from r96.
2. Report "K3 harm battery CLEAN at M and final" overstates M: `close/battery-M.txt` shows `PROXY: DRIFT` (bookkeeping
   terms) at M; `SCORECARD.md` says "CLEAN except the proxy bookkeeping terms re-declared". Route: kumitate, state
   battery verdicts per revision exactly.
3. `round-gate-registry-shape.md` `verified-at:` names the freeze `ee8479be`, not the shipped bytes (`a59fbedc`,
   `aba737dc…`). Route: kumitate, point `verified-at` at the revision whose bytes the entry describes.
4. Carried (lane's own r96 pre-registration): registry-section membership (row-shaped lines outside `## Registry`
   still declare) and the counter clause battery (M95-2).
5. This spot-check is not yet in the lane's README map; the lane adopts it before its r96 freeze (M94-1 ordering).

SHONEN: boxes 1–3 (`[~]`) look checkable by a non-author from committed bytes (SKILL decision row, LOG end-to-end
entry, `--selftest` receipts); box 4 has no evidence this round. Promotion stays operator-owned.
