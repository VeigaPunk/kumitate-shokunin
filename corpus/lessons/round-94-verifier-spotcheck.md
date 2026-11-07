author: hyaku closure (non-author integrator, @m_zfl)

# kumitate round 94 — non-author verifier spot-check (closure)

Lane-round: kumitate r94. Lane HEAD before `a6e4da96e828e900150c08d0a801266a53caab63`, after
`180cc338af3b528add875554f4dafe12aaeafbd6` (branch `master`). Report `.ufo/reports/round-94/kumitate.md`
(fleet repo). Dispatched prompt `.ufo/prompts/kumitate-round-94.md`.

Driver digest (copied from mutable `.ufo/watchdog.log`, lines 3091 and 3106):

- 2026-11-06T20:33:06-03:00 launch kumitate round=94 pgid=3835028 driver=hyaku-inline attempt=1
- 2026-11-06T21:24:05-03:00 complete kumitate round=94; hyaku-inline attempt=1

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %H %ci' -- .ufo/reports/round-94/kumitate.md` | `kumitate-shokunin 2faab89c724d91c5fbb74bfc3aab1a6a3629b252 2026-11-06 21:23:31 -0300` (after lane tip 21:23:18, before driver `complete` 21:24:05) | pass |
| `SHONEN` heading, one line per box | read report §SHONEN | 4 lines: 3 × `[~]` with pointers, 1 × `[ ]` (PROVINCE untouched) | pass |
| cited lane commits exist + ancestor of `master` | `git cat-file -e <h>^{commit}` + `git merge-base --is-ancestor <h> master` for `a6e4da96`, `73317eca`, `791b1fdd`, `54add172`, `d21decd2`, `03083e87`, `2cba824a`, `2e7d64de`, `e0d5600e`, `180cc338` | all 10 exist, all ancestors; all round commits authored `kumitate-shokunin` 20:40:25–21:23:18 | pass |
| non-commit hashes in report | `09d4d792…`, `158062f8…`, `11f83a1a…`, `341726f3…` | tool sha256 values (`pin.round-gate`, probe `tool_sha256=`); `79fa222e…` is the upstream oh-my-pi pin of S269/S272 | not ancestry defects |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin`; `git status --porcelain` | `local=remote=180cc338… ahead=0 behind=0 head=detached tracked=0 untracked=0`; porcelain empty | pass |
| prompt carries template contract | `diff <(sed -n 1,140p .ufo/prompts/kumitate-round-94.md) templates/round-prompt.md` | only placeholder substitutions (`{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}`); §1–§5 headings identical; hyaku addendum §6 + §7 + run-15 notes follow | pass |
| marker? | — | real report with 9 commits, receipts and measurements | not a marker → status `ok` |

Conformance defects (status-neutral): (a) M94-1 — the r93 spot-check was adopted into the README map after the
freeze (`54add172`, 20:43:42, after freeze `73317eca` 20:40:25), receipt `close-l1/plan-before-ready-r94-at-dispatch.txt`
FAIL MAP_DRIFT; lane-mined, fifth recurrence of the M8 class. (b) Lesson `## Gate` word counts are off by one:
S271 quote is 18 words (lesson: 17), S272 quote is 10 words (lesson: 9) — both still ≤ 25, a count-accuracy slip
under CORPUS "a count carries its command". (c) Pre-existing, not this round: the `round-gate` registry row in
`SKILL.md:610` carries no explicit exit-code → class verdict map (§Gate standard, Registry fields).

## 2. Claims

One declared claim, **C1 — operability** (lowest non-retired axis; integer 9, terminal under `f_O`):
`scripts/round-gate.mjs` resolves SOURCES-declared upstream commit pins. Not exploratory; no capability row.

### Re-measured (plain commands over committed bytes, run by me)

| measurement | command | before (`a6e4da96`) | after (`180cc338`) | reported | match |
|---|---|---|---|---|---|
| gate bytes | `git show <r>:scripts/round-gate.mjs \| sha256sum` | `09d4d79238f44dd7…` (1567 lines) | `11f83a1ac7b539e7…` (1927 lines); at M `d21decd2` `158062f8ac7bf512…` | base `09d4d792…`, M `158062f8…`, M2 `11f83a1a…` | yes |
| declared-pin logic present | `git show <r>:scripts/round-gate.mjs \| grep -ci declared` | 1 | 71 (63 at M) | rule added | yes |
| SOURCES rows | `git show <r>:corpus/SOURCES.md \| grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'` | 208 | 210 | 208 → 210 | yes |
| r93 red tokens declared by non-rejected rows | `grep 79fa222e8390` over SOURCES rows + status column 9 | — | S266, S267, S268, S269, S272 all `mined` | declared=2 (both tokens) | yes |
| `pin.round-gate` | `git diff a6e4da96 180cc338 -- SCORECARD.md` | `09d4d792…` | `11f83a1a…` = after-bytes sha | re-pinned | yes |
| frozen inputs untouched since freeze | `git diff --stat 73317eca 180cc338 -- .ufo/waves/round-94/{probe,controls,plan.md}` | — | empty | K4 not fired | yes |

### Evidence-verified (lane-owned gate/selftest/counter; not executed by me, per §Gate standard Closure consequence)

| evidence | path at `180cc338` | observed line |
|---|---|---|
| live before | `.ufo/waves/round-94/open/round-gate-r93-before.txt` | `COMMIT_CITED_UNRESOLVED cited=11 unresolved=2 [79fa222e 79fa222e8390…]`, `ROUND_GATE: DRIFT (round=93 …)`, `exit=1` |
| do-nothing control | `controls/ctl-nothing.txt` | `C94_C1: UNMET a=0/1 b=7/7 c=77/77 d=1/2 e=1/1`, selftest 61/61, `tool_sha256=09d4d792…` |
| forgery control | `controls/ctl-blanket.txt` | `C94_C1: UNMET a=1/1 b=0/7 c=70/77 d=0/2 e=0/1` |
| positive control | `controls/ctl-positive.txt` | `C94_C1: HELD …` |
| after at M (twice) | `close/probe1.txt`, `close/probe2.txt` | `C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1 tool_sha256=158062f8…`, selftest 75/75 |
| after at M2 = final bytes (twice) | `close/probe-m2-1.txt`, `close/probe-m2-2.txt` | `C94_C1: HELD … tool_sha256=11f83a1a…`, `ROUND_GATE_SELFTEST: 79/79 pass` |
| live after + harm battery | `close/battery-final.txt` | r93 `info COMMIT_CITED_DECLARED declared=2` + `ROUND_GATE: CLEAN`; `--tracked` CLEAN checked=76; `PROXY: MATCH`; README_MAP, SOURCES_CHECK (rows=210), COUNTER_PINS, SPOTCHECK_COVERAGE, CITE_SOURCES all CLEAN; census ok |
| own-round gate (Q88) | `close/q88-r94.txt` | `ROUND_GATE: CLEAN (round=94 …)`, `Q88: PASS … gate_sha256=11f83a1a…` |
| counter caveat | `K94CriticA/receipts/w-*.txt` | 7 construction receipts carry `HELD` (w-col0, w-extra-declared, w-len8, w-linescan-rejected, w-minedonly, w-nosplit-q, w-thin512) — matches the reported 7/12 |

C1 verifies: before DRIFT on r93 (false red on a registry-declared upstream pin) → after CLEAN with the
declaration disclosed, the seven real reds still red (b=7/7) and no other report regressed (c=77/77); final bytes
equal the pinned sha. The counter's latent clauses (K94CriticA) bound how much the HELD proves; the lane
disclosed and routed it.

### Harm check

`git diff a6e4da96 180cc338 -- SCORECARD.md`: proxy stanza bookkeeping (`A_wave` 1471→1503, `C2`/`C2_total`
239→242), `pin.round-gate` re-pin, move-log row 94, r94 disposition, r95 pre-registration. No axis score lowered;
`PROXY: MATCH` with every coverage term 10 and operability 9.

### Per-axis verdicts

| axis | verdict | reason |
|---|---|---|
| operability | improved | gate instrument repaired: r93 false red removed (DRIFT → CLEAN), real reds kept, selftest 61 → 79; score integer terminal at 9 |
| coverage | unchanged | all coverage terms 10 before and after (`PROXY: MATCH`) |

## 3. Discernment spot-check (from `corpus/lessons/round-94.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S271 gitrevisions `<sha1>` | admit | `curl https://git-scm.com/docs/gitrevisions` → HTTP 200, sha256 `60bfaca3907710bd…` (= row) | agree | quote "The full SHA-1 object name (40-byte hexadecimal string), or a leading substring that is unique within the repository." present verbatim; it is the exact rule the gate needs (abbreviated names are repo-relative). 18 words (lesson says 17) |
| S272 oh-my-pi `retry-fallback-chains.ts` @ `79fa222e…` | admit | `curl raw.githubusercontent.com/…/79fa222e8390…/retry-fallback-chains.ts` → HTTP 200, sha256 `b5db529983630ee7…` (= lesson) | agree | line 188 reads `/** Fallback selectors walked after the primary; empty explicitly disables fallbacks. */`; lines 185–190 are `RetryFallbackRole` as the row anchors; closes M93-2. 10 words (lesson says 9) |
| drafted duplicate GitHub-permalinks row | reject | `curl -L https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files` → HTTP 200, sha256 `0824dda4c0c8e675…` (= lesson) | agree | same URL as S033; the new teaching ("replaces main with a specific commit ID and the file content will not change", present verbatim) sits on the page S033 already registers; a second row would only add a W04 duplicate |
| "the frozen counter pins the rule" (K94CriticA) | reject | `.ufo/waves/round-94/K94CriticA/receipts/w-*.txt` at `180cc338` | agree | 7 receipts show wrong-but-plausible gates reaching `HELD`; the counter alone does not discriminate those clauses |

New SOURCES rows re-opened: S271 and S272 above; quotes 18 and 10 words (≤ 25). Census:
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → `kumitate ok …/corpus/SOURCES.md`,
exit 0, 8 × W04 (S034, S068, S084, S095, S123, S126, S247, S271) — matches the report (7 → 8, new S271 vs S253).

## 4. Trend verdicts

- expansion: **improved** — new knowledge entry `corpus/knowledge/round-gate-declared-pins.md` (header `source:` S271/S033/S267–S269, `verified-at:`, `recheck:`), SOURCES 208 → 210, both new rows re-opened and confirmed.
- quality: **improved** — gate no longer false-reds a declared upstream pin while real reds stay red; registry read hardened (FIFO/symlink/size) and four mutant survivors killed (selftest 61 → 79, receipts above); no admitted entry failed re-check.
- discernment: **improved** — outside check agrees with the gate on both admits and both rejects sampled; Q88 is a new `QUALITY.md` criterion grounded in lesson M94-2 with fail/pass receipts. (The lane self-graded `unchanged`; the closure grades by LEARNING.md's outside-agreement rule.) The ±1 word-count slips are count accuracy, not admit/reject disagreements.

## 5. Routed defects (lane fixes next round)

1. M94-1 structural fix: a pre-freeze check that fails while a verifier spot-check is unadopted (r95 pre-registration item 1).
2. Counter coverage of the five latent rule clauses + (a) as set equality (K94CriticA; r95 item 2).
3. Registry parse: refuse rows whose field count ≠ 13 (K94Sentinel unescaped `|`; r95 item 3).
4. Correct the quote word counts in a new entry (S271 = 18, S272 = 10; lesson round-94 says 17 and 9) — append-only correction.
5. Self-attestation limit: a fabricated `queued` row silences a red token (K94CriticB 1b); only a closure re-open guards it — keep re-opening declaring rows at closure.
6. Pre-existing: add an explicit exit-code → `clean|failed|could-not-evaluate` verdict map to the `round-gate` registry row (`SKILL.md:610`).
7. Carried: M93-3 counter repair, M93-5 `--close` probe-receipt requirement, R93-D1 seat-route human-mode redaction, F93 fixtures.

Operator note: SHONEN box 4 (PROVINCE accurate) is `[ ]` this round; the three `[~]` boxes are non-author checkable
(SKILL registry row + checklist 724, LOG r94 end-to-end run, `--selftest` 79/79). Promotion is operator-owned.
