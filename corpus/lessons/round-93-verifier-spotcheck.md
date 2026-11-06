author: hyaku closure (non-author integrator, @m_zfl)

# kumitate round 93 — non-author verifier spot-check (closure)

Lane-round: kumitate r93. Lane HEAD before `36277d499388c68ef2645d92f44e722d454c9820`, after
`60bfb976ead1d4ab2c36c8a61b82c8b9c3f7fa39` (branch `master`). Report `.ufo/reports/round-93/kumitate.md`
(fleet repo). Dispatched prompt `.ufo/prompts/kumitate-round-93.md`.

Driver digest (copied from mutable `.ufo/watchdog.log`):

- 2026-11-06T17:46:35-03:00 launch kumitate round=93 pgid=2944909 driver=hyaku-inline attempt=1
- 2026-11-06T20:22:56-03:00 lane-dead-no-report kumitate round=93; retry same round (attempt=1 ended without a landed report: FAIL report_of)
- 2026-11-06T20:22:58-03:00 launch kumitate round=93 pgid=1594263 driver=hyaku-inline attempt=2
- 2026-11-06T20:28:29-03:00 complete kumitate round=93; hyaku-inline attempt=2

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %H' -- .ufo/reports/round-93/kumitate.md` | `kumitate-shokunin 3e6a90bb…` (filed 20:27:30-03:00), `kumitate-shokunin 73bac98c…` (erratum 20:27:43-03:00) | pass |
| filed report corrected by append only (lane's own Q87) | `git diff 3e6a90bb 73bac98c -- <report> \| grep -c '^-[^-]'` | `0` (8 lines added) | pass |
| `SHONEN` heading, one line per box | read report §SHONEN | 4 lines, all `[~]` with pointers | pass |
| cited lane commits exist + ancestor of `master` | `git cat-file -t` + `git merge-base --is-ancestor <h> master` for `b6204949`, `3b82a316`, `2f8475cd`, `60bfb976`, `36277d49` | all `commit`, all ancestors | pass |
| non-commit hashes in report | `cd7ee03d…` | sha256 of v1 `scripts/seat-route.mjs` (`controls/table.txt:15` `tool_sha256=cd7ee03d…`), not a commit; `79fa222e` is the upstream oh-my-pi pin of S269 (stated in the report erratum) | not a defect of ancestry |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin`; `git status --porcelain` | `local=remote=60bfb976… ahead=0 behind=0 tracked=0 untracked=0`; porcelain empty | pass |
| prompt carries template contract | `diff <(sed -n 1,140p templates/round-prompt.md) <(sed -n 1,140p .ufo/prompts/kumitate-round-93.md)` | only placeholder substitutions (`{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}`, `{{AXES}}`); §1–§5 headings identical; hyaku addendum §6 follows | pass |
| marker? | — | real report with commits, receipts and measurements | not a marker → status `ok` |

Conformance defects (status-neutral, routed): (a) attempt 1 ended without a report (`lane-dead-no-report`;
lane mined it as M93-5); (b) the lane's own `round-gate.mjs` reads `COMMIT_CITED_UNRESOLVED … [79fa222e]`
(report erratum) — the gate's citation scan cannot tell an external upstream pin from a lane commit; red
lane gate, routed to the lane; (c) K93Scout wrote no `w1/` trailer (M93-4).

## 2. Claims

**C1 — operability, capability upgrade `seat-route` v1 → v2 (contract `kumitate-seat-route-v2`).**
Re-measured by me over committed bytes (plain git/grep/sha256/jq):

| measurement | command | before `36277d49` | after `60bfb976` |
|---|---|---|---|
| tool bytes | `git show <rev>:scripts/seat-route.mjs \| sha256sum` | `cd7ee03dd814da01…` | `7273ad2b91eff7a6…` (= at M `2f8475cd`, = SCORECARD `pin.seat-route`, = receipts' `tool_sha256`) |
| new record fields present | `git show <rev>:scripts/seat-route.mjs \| grep -c <field>` | error_attempts 0, recovered_attempts 0, superseded_by 0, upstreamProvider 0, flag_hops 0, revert_hops 0 | 16, 11, 11, 8, 10, 10; record literal lines 397–415 carries all eight v2 fields, no `errors` key |
| contract id | `grep -c kumitate-seat-route-v{1,2}` | v1=2, v2=0 | v1=0, v2=2 |
| selftest arms | `grep -cE "^\s*check\('"` | 37 | 63 |
| kill (d) byte grep at M | `git show 2f8475cd:scripts/seat-route.mjs \| grep -c {round-93,oracle93,probe93,fixtures}` | — | 0/0/0/0 |
| kill (f) freeze time | `git show -s --format=%cI b6204949` | — | `2026-11-06T17:53:14-03:00` = 20:53:14Z < `--after 21:40:00Z` |
| frozen artefacts unchanged | `git diff --stat b6204949 60bfb976 -- plan.md probe/ controls/` | — | empty |
| fixtures | `git ls-tree --name-only 60bfb976 .ufo/waves/round-93/probe/fixtures/ \| wc -l` | — | 16 |
| r93 wave seats | `jq '{n:(.results\|length),seats:(.seats\|length)}' w1-results.json` | — | 13 / 13 |
| SOURCES rows | `git show <rev>:corpus/SOURCES.md \| grep -cE '^ {0,3}\|[[:space:]]*S[0-9]{3,}'` | 206 | 208 |

Independent definition check (no lane tool executed): `probe/fixtures/F93Flags.jsonl` by jq has six
`model_change` rows with `resolvedModelIsFallback` = null/true/false/null/1/true and roles
subagent/fallback/fallback/fallback/fallback/default; the frozen plan (lines 53–55) gives flag_hops=2,
revert_hops=3; the shipped code (lines 308–309: `=== true` → flag, else `role === 'fallback'` → revert)
yields the same, and selftest arm 17n asserts 2/3. Delegation check: the shipped tool's only
`child_process` use is `spawnSync(process.execPath, [SELF, …])` inside `--selftest` (lines 1054–1093); no
python, eval, `new Function`, dynamic import or base64 — so the counter's evadable runtime clause (M93-3)
does not bear on these bytes.

Evidence-verified (lane-owned counter `probe93-c1.py` and selftest not executed by me, PROTOCOL §Gate standard):
`close/probe1.txt`, `close/probe2.txt` both `RUNTIME: CLEAN findings=0` and `C93_C1: HELD agree=176/176
A=61/61 F=16/16 H=74/74 W=25/25 … tool_sha256=7273ad2b…` (A ≥ 55, F 16/16, H ≥ 60, located ≥ 8 per frozen
predicate); `controls/table.txt` 15 pre-data controls, only `ctl-positive` HELD (221/221), do-nothing and
v1-shipped `UNMET 0/221`; `close-l1/survivor-remut.txt` `ROWS_KILLED=3 of 3`; `close/battery-final.txt`
`SEAT_ROUTE_SELFTEST: PASS held=63/63`, `PROXY: MATCH`, `README_MAP: CLEAN`, `SOURCES_CHECK: CLEAN rows=208`,
`COUNTER_PINS: CLEAN pins=50`, `SPOTCHECK_COVERAGE: CLEAN`; `K93ExecHarm/battery-diff-final.txt`
`INVARIANTS PASS n=61 exit_drift=0 … v1_value_drift=0`. Revision measured: M `2f8475cd`, whose tool bytes equal HEAD.
Domain run `close/seat-route-r93-w1.txt`: `SEAT_ROUTE: OK seats=13 served=13 dead=0 … fallback=8`.

C1 verdict: **verified** (re-measured: bytes, fields, contract, arms, kill d/e/f, freeze integrity;
evidence-verified: counter HELD×2, controls, selftest, mutation kills).

Harm check: `git diff 36277d49 60bfb976 -- SCORECARD.md` changes only `A_wave` 1381→1471, `C2`/`C2_total`
236→239, `pin.seat-route` cd7ee03d→7273ad2b, plus the r93 move-log row, capability row and r94
pre-registration; no axis integer moved (operability 9 terminal, coverage rows 10). `LOG.md` +6/−0
(append-only); report +128/−0 across its two commits.

| axis | verdict | reason |
|---|---|---|
| operability | improved | capability row `seat-route` v2 admitted (claim verified); integer 9 is terminal, the move is the capability (same reading as r92) |
| coverage | unchanged | every coverage row 10, PROXY MATCH, README_MAP CLEAN |

## 3. Discernment spot-check (`corpus/lessons/round-93.md` § Gate)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| knowledge `seat-route-retry-fields.md` on S267–S270 | admit | `curl https://raw.githubusercontent.com/can1357/oh-my-pi/79fa222e…/packages/coding-agent/src/session/turn-recovery.ts \| sha256sum` → `1059a80e…` (= S269 capture); line 1061 `entry.message.retryRecovery = retryRecovery;`, `supersededBy: {` at 1043; S270 `census.txt:26-28` `flag_hops=941 revert_hops=17 role_fallback_rows=958` | agree | pinned bytes unchanged, both located quotes present at the stated lines, S270 numbers ground the `teaches` cell's 958 = 941 + 17 split |
| QUALITY Q87 (filed reports corrected by appending) | admit | `git diff --numstat cfb99a19 6982c483 -- .ufo/reports/round-92/kumitate.md` → `4 4`; receipts `report-append-check-rewrite.txt` rc=1, `…-append-kumitate.txt` rc=0 | agree | the grounding rewrite is real; the check fails it and passes a true append; r93's own report obeys it (deleted 0) |
| "`RUNTIME: CLEAN` shows the tool does not delegate to the oracle" | reject | `K93ExecRuntime/receipt-x7-tracer-aware-scratch.txt` → `RUNTIME: CLEAN findings=0` + `C93_C1: HELD agree=221/221` on a delegating build; `demo-x7-branch.txt` traced → v1 record, untraced → oracle record | agree | a tracer-aware construction passes the clause, so it cannot certify non-delegation; I checked the shipped bytes for delegation separately (§2) |
| "H is a held-out set no author can compute" | reject | `K93CriticB/h_forge2_counter.receipt.txt` → `C93_C1: HELD … H=60/60 h_pool=60 after=2026-11-06T21:40:00.000Z` on forged transcripts | agree | the counter accepts any post-cutoff file in the sessions root; H is post-freeze but not provenance-checked |

SOURCES row re-opened: **S269** — URL resolves at the pinned commit, sha256 `1059a80e5dc4…` equals the
row's capture; lesson quote (turn-recovery.ts:939-940) "Durably record a terminal empty error turn
(`stopReason: "error"` with no substantive content) that `#persistSessionMessageIfMissing` skipped" is
present verbatim at lines 939–940 and is 16 words (≤ 25). Row anchor cites 938–953; the doc comment opens
at 938, the quote at 939 — consistent. **S270** quote checked at `census.txt:26-28` (above).

Census: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
→ `kumitate ok …/corpus/SOURCES.md`, exit 0 (seven pre-existing W04 duplicate-url warnings: S034, S068,
S084, S095, S123, S126, S247; none from r93 rows).

## 4. Trend verdicts

- expansion: **improved** — new knowledge entry `corpus/knowledge/seat-route-retry-fields.md` whose `source:`
  cites S267–S270 (all `mined`); capability `seat-route` v2 admitted to SCORECARD; SOURCES 206 → 208.
- quality: **improved** — v1 capability superseded by a stronger v2 (selftest 37 → 63, mutants M01/M02
  killed); S269 capture re-verified by sha256 this closure; Q87 added with a lesson and fail/pass receipts;
  no admitted entry failed its re-check.
- discernment: **improved** — this outside spot-check agrees with the gate on both sampled admits and both
  sampled rejects (LEARNING.md `improved` row). The lane self-graded `unchanged` because its counter was
  shown evadable; that is a counter defect already rejected in its own Gate and routed, not a gate
  disagreement.

## 5. Routed defects (lane must address next round)

1. M93-3: counter runtime clause traces one invocation by literal strings; H has no provenance check —
   round-94 pre-registration item (1) already names the repair.
2. `round-gate.mjs` citation scan flags external upstream pins (`79fa222e`) as unresolved lane commits —
   teach it external-pin context or a declared pin list (report erratum; M93-5 family).
3. M93-5: attempt 1 ended before the close with a landed M and no report — make `round-gate --close`
   require `close/probe*.txt` when the plan freezes a predicate (pre-registration item 4).
4. M93-4: K93Scout wrote no `w1/` trailer; the L1 extraction stands labelled.
5. M93-2: `retry-fallback-chains.ts` is used as an auxiliary capture without a SOURCES row.

Operator note: the four `SHONEN` boxes each carry a resolvable pointer a non-author can check (SKILL
registry row, LOG r93 end-to-end run, `--selftest` command, PROVINCE dated amendment); promotion is operator-owned.
