author: hyaku closure (non-author integrator, @m_opus)

# Round 40 verifier spot-check (non-author closure, hyaku)

Runtime model as exposed to this closure session: `anthropic/claude-opus-5-5` (no model parameter
passed; configured `task` route). Closure prompt: `.ufo/prompts/closure/kumitate-round-40.md`.
Lane open `f69817edf687c8ce4f87ed7953a353399232f69e`, lane tip `69ceb5291a4dbcc80c62329e0057abe43cc3b7c3`,
measured production `1530a75521345e0f4516ed7146180e65f788e017`, falsify follow-up
`5ae8ac9cbb1697e30ec32b717b8c4dafb757315c`, source pin `31c465f15669f744848bd9f5d56191c5085670f7`
(clone `/fast/scratch/hyaku/kumitate-pin/src`, HEAD at the pin, `status --porcelain` empty).
Driver digest (copied from `.ufo/watchdog.log`):
`2026-10-22T10:52:53-03:00 launch kumitate round=40 pgid=23468 driver=hyaku-inline attempt=1`;
`2026-10-22T12:40:22-03:00 complete kumitate round=40; hyaku-inline attempt=1`.
No review seats were dispatched; every check below was run by this closure. Gates were not
executed (PROTOCOL §Gate standard, Closure consequence). C1 is checked from its committed evidence.
C2 is re-measured with plain counts.

Held, excluded: the wave-2 seats `AtkNovelIdentity` and `AtkNovelRecords` reported an automatic
model switch after a provider safety filter. An automatic switch is not clearance. Their reports
and items were not opened, and no verdict below counts them, for or against. The round's lesson
and SCORECARD name them as co-finders. Each ruling here rests on other seats and receipts.

## Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report landed by the lane | `git log --format='%an %H' -- .ufo/reports/round-40/kumitate.md` | `kumitate-shokunin b2be279b72874e64aff7f960f6792e33a1ce289d` (12:39:19 -0300) | ok |
| SHONEN heading | report `## SHONEN` vs `grep -c '^- \[' SHONEN.md` | 4 lines `[~]`, 4 boxes | ok |
| cited lane commits | `git rev-parse` + `merge-base --is-ancestor <h> master` for 8eea5608 1530a755 0004ae31 5ae8ac9c e26937ec 8d6a9421 69ceb529 e18ff1af | all exist, all ancestors of `master` | ok |
| source pin | `git -C /fast/scratch/hyaku/kumitate-pin/src cat-file -t 31c465f1…` | `commit`; HEAD = pin; 0 porcelain lines | ok |
| lane pushed and clean | `scripts/hyaku/jj-lane.sh state …/kumitate-shokunin`; `git status --porcelain \| wc -l` | `local=remote=69ceb529… ahead=0 behind=0 tracked=0 untracked=0`; `0` | ok |
| prompt contract | `.ufo/prompts/kumitate-round-40.md` §1–§5 | axes binding, 1–3 claims, frontier step, L2 floor, report path, SHONEN, commit/push, L0, write scope present | ok |
| dispatch evidence | `git log -- .ufo/prompts/kumitate-round-40.md` | `917d0ae1` (driver dispatch commit under the lane identity, 10:52:51) | ok |

Defects (status-neutral): (a) `8eea5608` has author date `09:28:19 -0300`, before the launch at
10:52:53. Its committer date is 11:08:56. The jj change was created before dispatch, which matches
the operator's author-date-hygiene note. (b) `evidence/seat-gate.txt` item 4 says "four
mutation-tester seats returned results" in wave 1, but `build-dispatch.json` lists three
(MutCiteGuard, MutAnchorSurvivors, MutKimiCensusArms). (c) The SKILL.md gate-registry row
`anchor-truth` (line 606) still shows `[--base REV] [--write-pin --notes …]` and does not list the new
`--open REV` mode (Gate standard, Registry).

Round shape, from `build-dispatch.json` and `falsify-dispatch.json` (`.counts`, `.taskCall.tasks[].agent`):
- Wave 1: 32 seats (7 executor, 8 critic, 6 scout, 4 scribe, 3 mutation-tester, 3 reviewer, 1 connector).
- Wave 2: 35 seats (12 critic, 12 reviewer, 7 mutation-tester, 2 scout, 1 sentinel, 1 connector).
- Total: 67 seats. Attack roles: 37 of 67.
- Dead seats: all 7 wave-2 mutation-tester seats died at spawn ("Error: No model selected. Use
  /login, set an API key environment variable, or create /home/vgpnk/.omp/agent/agent.db Then use
  /model to select a model."). That is 7/35 = 20%, exactly at the sentinel line, not above it. It
  is an operator-owned route issue. The seats were not replaced or rerouted, as the contract requires.

## Claims

### C1 operability: `anchor-truth --open REV` refuses the 26 named attacks (evidence-verified)

The probe runs each revision's own gate, so this closure checked the committed receipts without
running the gate. Each step below gives the command and what it showed.

1. **Probe bytes.** `git show <rev>:.ufo/waves/round-40/probe/floor-probe-v2.mjs.txt | sha256sum`
   gives `b6c1f7eec7b3…` at 1530a755, 0004ae31, 5ae8ac9c, e26937ec and 69ceb529. It is first
   committed in 1530a755.
2. **Case set.** `grep '^CASE' <receipt> | awk '{print $2,$3,$4}' | sha256sum` gives `78a430c4…`
   for all three receipts. The same 36 cases (26 attack, 10 benign) and the same expectations are
   used at each revision.
3. **Tallies, recounted from CASE lines** with `awk '{t[$3" "$5]++}'`:
   - `floor-probe2-open.txt` at f69817ed: 20 attacks ACCEPTED, 6 REFUSED (A1–A6), 10 benign ACCEPTED.
     Footer: `attacks_accepted=20/26 benign_clean=10/10 setup_errors=0 … open-supported=false`.
   - `floor-probe2-measured-1530a755.txt`: 26 REFUSED, 10 benign ACCEPTED. Footer:
     `0/26 … 10/10 … setup_errors=0 … open-supported=true`.
   - `floor-probe2-measured-5ae8ac9c.txt`: identical, 26 REFUSED and 10 ACCEPTED.
   - Every refusal at 5ae8ac9c carries the expected finding kind in `kinds=`. A4 is the only
     exception (`kinds=-`, expected PIN_INVALID), and it was already refused at open.
4. **Revision measured.** `git diff --stat 5ae8ac9c 69ceb529 -- scripts/` prints nothing, and
   `scripts/anchor-truth.mjs` has sha256 `5a7893cba3ea…` at both 5ae8ac9c and 69ceb529. So the
   5ae8ac9c receipt covers the tip's gate.
5. **Self-test tally.**
   - Distinct `AT\d\d` ids in `scripts/anchor-truth.mjs`: 30 at f69817ed, 41 at 1530a755, 42 at
     5ae8ac9c and 69ceb529.
   - Red-before receipts: `open/receipts.txt` reads `30/30`. `final/at46-red-before.txt` reads
     `41/42 pass`, `VERDICT: FAIL`, with AT46 failing. `falsify/ReviewRedBefore.md` shows
     AT31–AT34 and AT39–AT42 failing on the open logic.
   - Head: `final/checklists-lane.txt`, taken at 8d6a9421, shows the hermetic-suite item PASS and
     the checklist at `15/15`.
6. **Independent re-runs** by non-held seats: `falsify/ReProbeCount.md` (`open=20/26,10/10
   cand=0/26,10/10`) and `falsify/ReviewR39Dispositions.md`.
7. **Frozen-run verdict.** The anchor-truth gate has no frozen `.ufo/waves/*/frozen` baseline for
   the `--open` mode. The C1 evidence is the probe receipts. This is noted, not graded.

The 5ae8ac9c follow-up (AT46) rests on AtkReviewForge, AtkRecordForge and AtkNovelPin A2; the held
seat is not counted. **Before → after reproduced: 20/26 → 0/26 attacks accepted, 10/10 benign
edits clean at both ends, 0 setup errors.**

**Is the statement wider than its counter?** No. The report and lesson declare "the 26 named
attacks and 10 named benign edits only", and the counter enumerates exactly those 36 cases.
- R39-1: P01 is the routed instance.
- R39-2: P02–P05 swap S8#456, and P06–P10 are the five run-reorders accepted at round 39.
- R39-3: P11 and P12, with P12 being the 73-anchor headroom attack.

The SCORECARD row title ("refuses the round-39 routed attacks") is shorter than the scope sentence,
but its counting-command cell is this same probe. Wider classes stay open and are recorded, not
hidden, in the lesson's `## Wave-2 findings the claim does not cover`:
- token-carry swaps: `falsify/AtkSwaps.md` `accepted=4/8 with --open … control f69817ed 8/8`;
- bold-symbol headroom: `falsify/AtkHeadroom.md` `accepted=1/7`;
- prose edit on a reviewed anchor and token re-pair: `falsify/AtkNovelPin.md` A1 and A3.

**Is the `--open` refusal of honest edits a harm to operability?** Ruling: no, it is a recorded
trade inside a new opt-in mode. Reasons:
1. The operability surface (AXES: a checklist item that runs and gives the stated outcome) is
   byte-identical to round open. SKILL.md:686 at 69ceb529 equals SKILL.md:665 at f69817ed:
   `node scripts/anchor-truth.mjs --base e18ff1af…` → exit 0 + `TRUTH: CLEAN`. The `--open` form
   that 5ae8ac9c put into it (SKILL.md:682 there) was reverted in 8d6a9421.
2. In that form, honest edits read as they did at open. `falsify/ReviewBenignFloor.md`:38 reads
   `HONEST_CLEAN 9/17 … rev=1530a755`, against 9/17 at f69817ed (`:26`; also
   `build/ExecReviewBind.md`:24).
3. `--open` did not exist at open (`open-supported=false`). No earlier behaviour of it can
   regress. Its 4 refused re-cites (H3r, H4r, H7, H12; 5/17 vs 9/17) have a documented honest path,
   keep-and-add, which reads `HONEST_CLEAN 4/4` (ReviewBenignFloor:45). The refusal is listed in
   SKILL.md's error pattern and in the lesson's `## Open limits`.
4. The default form also gained: 13/26 attacks are accepted there, against 20/26 at open
   (lesson:178, ReviewSkillPattern).

Residual limits, routed below:
- The honest 9/17 in checklist form was measured at 1530a755, not re-measured after AT46 at
  5ae8ac9c.
- An honest in-round review reads `REVIEW_UNBOUND` under `--open` (`build/CritC1Design.md`
  BEN_NEWREVIEW). This limit is not recorded in SKILL.md or the lesson.
- Sentinel resource bounds (`falsify/SentinelOpenArg.md`: MEDIUM no cap on registry count, LOW
  open pin read past `MAX_JSON_BYTES`).

**Verdict: C1 verifies. operability: improved** (integer held at 8; the claimed before → after
reproduced from committed receipts).

### C2 coverage:kimi-layer: declared integers match derived ones (re-measured)

Plain recount, run by this closure over committed bytes:

| rev | `grep -cE '^\| \`(knowledge\|lessons)/' corpus/README.md` / `git ls-tree -r --name-only <rev> -- corpus/knowledge corpus/lessons \| grep -c '\.md$'` | SCORECARD stanza `C2 C2_total K_members K_sections coverage_kimi` |
|---|---|---|
| f69817ed | 88 / 89 (C2 derived ≠ declared 88/88) | 88 88 51 51 10 |
| 1530a755 | 89 / 89 | 89 89 52 52 10 |
| 5ae8ac9c | 90 / 90 | 90 90 52 52 10 |
| 69ceb529 | 90 / 90 | 90 90 52 52 10 |

- Live member: `ls -A ~/.kimi-code/skills | wc -l` → `7` (cursor-lane, godspeed, kimi-webbridge,
  reverse-engineer-anything, shokunin, ufo, wwkd). `stat` shows `kimi-webbridge` is a real
  directory.
- `scripts/kimi-census.mjs` diff shows `counted: 6` → `counted: 7` and `childCount: 6` → `7`.
- `grep '^## ' corpus/knowledge/kimi-skills-plugins.md` shows the new heading
  ``## `~/.kimi-code/skills/kimi-webbridge` `` at line 218. That accounts for K_sections 51 → 52.
- Receipts, consistent with the recount:
  - `final/proxy-open-f69817ed.txt`: `grep -c '^PROXY  error'` → 5 (C2_TOTAL_DRIFT, K_MEMBERS_DRIFT,
    COVERAGE_KIMI_DRIFT, 2× AXES_DRIFT), `exit=1`.
  - `final/proxy-5ae8ac9c.txt`: 0 error rows, `PROXY: MATCH (… C2=90/90 … K=52/52
    coverage:kimi-layer=10; pins=6 match …)`, `exit=0`.
  - `falsify/ReProxyMatch.md` confirms 5 → 0 at 1530a755.
- Axes rows for coverage and coverage:kimi-layer are held at 10 (SCORECARD `## Axes`).

Is the statement wider than its counter? No. "5 error rows → 0, `PROXY: MATCH`, exit 0" is exactly
what `grep -c '^PROXY  error'` plus the last line and exit count. It is a calibration claim of the
kind the session contract asks for: declared integers are compared with derived state. The fix also
clears the retired `coverage` term (the README row for the round-39 closure file), which falls
inside the same counter.
**Verdict: C2 verifies. coverage:kimi-layer: improved. Sourced claim:** S035 is cited by the
SCORECARD C2 row and the lesson.

### Per-axis verdicts

| axis | verdict | basis |
|---|---|---|
| operability | improved | C1 receipts above; checklist byte-identical and 15/15 at 8d6a9421 |
| coverage:kimi-layer | improved | C2 recount above |
| coverage (retired) | unchanged | 10 held; derived drift 9 → 10 repaired inside C2's counter |
| coverage:script-layer | unchanged | `S=88/88` in proxy-5ae8ac9c; SCORECARD row untouched |
| coverage:runtime-layer | unchanged | `R=92/92` in proxy-5ae8ac9c; SCORECARD row untouched |

No owned axis harmed (`git diff f69817ed 69ceb529 -- SCORECARD.md`: only K2, stanza, kimi-layer rows and appended round-40 sections).

## R39-1 to R39-8 against their failing-before receipts

| defect | failing-before receipt | after | disposition |
|---|---|---|---|
| R39-1 self-declared review | `floor-probe2-open.txt` P01, ATK_X1_REC38/40 ACCEPTED; ReviewRedBefore AT31–AT34 fail on open | REFUSED `REVIEW_UNBOUND` at 1530a755/5ae8ac9c under `--open` | closed under `--open`; checklist form still binds records at HEAD (`falsify/AtkRecordForge.md` 3/3 accepted without `--open`), recorded |
| R39-2 raw swap, run reorder | open receipt P02–P10 ACCEPTED | REFUSED | named instances closed; class partly open (AtkSwaps 4/8 with `--open`), recorded |
| R39-3 debt headroom | open receipt P11, P12, ATK_SLOTS_ALL ACCEPTED | REFUSED (`DEBT_NEW`/`DEBT_GREW`) | closed for the named attacks; bold-symbol variant open (AtkHeadroom 1/7), recorded |
| R39-4 probe depth, mutants | `mutants-open.txt`: `awk '$2=="Killed"\|\|$2=="Survived"'` → Killed=23 Survived=3 | `mutants-measured-1530a755.txt`, `mutants-5ae8ac9c.txt`: Killed=26; 10 benign controls in the probe | closed. Ledgers `mutants-open-ledger.json` and `mutants-measured-1530a755-ledger.json` validate against S036 fetched at 140f2119 with 0 errors (this closure: `uv run --with jsonschema==4.25.1`, Draft7Validator) |
| R39-5 cite-check `resolved` guard | `cite-zero-resolved-red-before.txt` STEP 1: mutant `62/62 cases passed`, STEP 2 flip FAIL → PASS | STEP 4: `63/64`, `VERDICT: FAIL`; patched suite `64/64` | closed; Q20 grounded in it |
| R39-6 W04 attribution | round-39 report line 176 | lesson `## Correction (R39-6)`; fleet `scripts/sources-census.sh:644-653` fills `url_seen`/`url_scopes` per `row_pass` (`:717`); S023 (line 36) and S034 (line 47) share the Stryker URL | closed (this closure read the emitter and re-ran the census) |
| R39-7 unreceipted cite-check value | no committed run at d8bb37db or tip | `final/cite-receipts/`: 643/639/659 (round-39 layout), 501/494/510 (real fleet) | closed for those revisions; recurs for the round-40 end value (below) |
| R39-8 pin clone, kimi drift | checklist 8/15, `SRC_MISSING` | `.ufo/pins/origin.json` clone → `/fast/scratch/hyaku/kumitate-pin/src` (exists); `checklists-lane.txt` 15/15; kimi drift fixed by C2 | closed |

## Fleet cite-check 510 → 511: ruling

`falsify/ReviewCiteReceiptCand.md` measured 510 at f69817ed and 511 at 1530a755. The one new error
is `REV_UNKNOWN 140f211984e8a0c926ec305a550da425f9bb8d69` at `corpus/SOURCES.md` row S036. The
open receipt already holds 33 `REV_UNKNOWN` lines for commits outside the lane and the pin.

This closure re-opened the S036 URL at that commit: HTTP 200, `sha256sum` →
`404575e9264686dbf85c399f6531fdb489bebc3146e7e1d793b8083bc6a041ae` (equal to the row), line 92 =
the quoted enum. The row carries the revision because the SOURCES contract requires an anchor with
its revision.

**Ruling: not a harm.** The error is a gate false positive on a correct, resolvable external
citation, and no owned axis reads cite-check. Two defects remain:
1. The end value 511 has no committed receipt at the tip. The seat's runs are scratch files, and
   it measured 513 at 0004ae31 before the two lesson rewordings. This is the R39-7 class again.
2. cite-check cannot tell an external commit named in the row's own URL from a dead lane hash.

## Discernment spot-check (`corpus/lessons/round-40.md` `## Gate`)

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S035 kimi-webbridge user skill (own-work, A) | admit | `sed -n '1,8p' ~/.kimi-code/skills/kimi-webbridge/SKILL.md`; `stat`; `sed -n 6p ~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md` | agree | `:2` `name: kimi-webbridge`, `:6` `version: "2.0.26"`, real directory. The plugin copy reads `version: "1.11.3"` with the same `name:`, so the collision and the erratum are right. Note: the used-by entry carries the anchors but never names `S035`, unlike the S012 fix this round made |
| strict token-equality rule for base-true anchors | reject | `build/CritC1Design.md` table line 20 and `:30` | agree | BEN_REKEY (an honest same-line re-pair, still true) is refused under strict token equality. The open floor already refuses the measured swaps, and BEN_REKEY reads CLEAN in all three probe receipts |
| document webbridge commands, daemon, CLI in K2 | reject | `tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md` (bc4b7d5) §4 tool table, §5 daemon binary; `tabi-shokunin/PROVINCE.md:6` | agree | tabi owns the plugin as primary substrate and holds that ground. Kumitate keeps install and load facts |
| S036 / S037 MTE schema (spec, A) | queue | `curl` of the S036 raw URL (200, sha256 = row, `:92` enum); npm 3.9.0 tarball (200, sha512 `28CobrcL…vFSJQ==` = row, `package/src/…:41` `"required": ["id", "mutatorName", "location", "status"]`) | agree | both quotes are verbatim at the stated lines and ≤25 words. `queued` is right because no admitted entry cites them |
| S012 Kimi agents docs | re-open, queued → mined | `curl -L` https://moonshotai.github.io/kimi-code/en/customization/agents.html (200) | agree | "more specific scopes take higher priority: Explicit ( --agent-file ) > Project > Extra > User > Plugin > Built-in" is present. `kimi-lane-definitions.md` now cites S012 (1 hit) |

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` →
`kumitate W04 S034 duplicate url …` and `kumitate ok …`, exit 0. The report states the same.

Frozen CORPUS census over `git show <rev>:corpus/SOURCES.md`:
- f69817ed: rows 34, malformed 0, tiers A=33 B=1, status mined=18 queued=14 rejected=2.
- 69ceb529: rows 37, malformed 0, tiers A=36 B=1, status mined=20 queued=15 rejected=2.
- The "mined used-by paths exist" sweep at the tip prints nothing.

## Trend verdicts

- **expansion: improved.** One new K2 member is covered: the `## ~/.kimi-code/skills/kimi-webbridge`
  section, K_sections 51 → 52 by heading count, the live member count 7 re-measured. It rests on
  S035 (own-work, mined). The SCORECARD K2 row and proxy stanza track it. There is no new
  entry file; the ground is new inside the existing kimi note.
- **quality: improved.**
  - Mutant survivors 3 → 0 (receipt recount).
  - The R39-5 survivor is killed and shown able to fail.
  - The falsified "no collision" inference is marked by an appended erratum (kimi-skills-plugins.md:555-).
  - S012's quote is re-verified live.
  - No admitted entry was found false and left unmarked in the sample.
  - The 511 cite-check error is a gate false positive, not a false entry.
- **discernment: improved.** The sample agrees with the gate on 1 admit, 2 rejects, 1 queue pair
  and 1 re-open. Q20 is grounded in a mined mistake (R39-5) and corrected after a falsify seat
  narrowed it.

**Admission: admitted.** Both claims verify, and no owned axis is harmed.

## Routed defects (lane fixes next round)

- **R40-1 (registry):** add `--open REV` to the SKILL.md gate-registry `anchor-truth` row, with
  its verdict map (Gate standard, Registry).
- **R40-2 (honest-edit coverage):**
  - Re-measure the 17 honest recipes in checklist form at the AT46 gate (5ae8ac9c or later).
  - Record the in-round honest review refusal under `--open` (CritC1Design BEN_NEWREVIEW) as an open limit.
- **R40-3 (receipt):** commit a fleet cite-check receipt at the tip for the 511 value (R39-7 class).
  Either classify a commit named inside the row's own URL as external, or record the count with
  its class.
- **R40-4 (sentinel):** cap the number of `anchor-reviews.json` registries read under `--open`, and
  size-check the open pin before `git show` (SentinelOpenArg MEDIUM/LOW).
- **R40-5 (sources linkage):** name `S035` in the K2 section of `corpus/knowledge/kimi-skills-plugins.md`,
  as was done for S012 this round.
- **R40-6 (calibration slip):** seat-gate item 4 says four wave-1 mutation-testers, but three were
  dispatched. Correct it in the next round's lesson.
- **R40-7 (recurring proxy drift):** this file adds one `corpus/lessons/*.md` note without a README
  row. At the next open, `C2_total` reads 91 against C2 90, so `coverage` derives 9 against 10.
  This is the same mechanism that put the round-39 closure file into the round-40 open DRIFT. Add
  the README row at open, or teach the proxy to treat non-author closure files.

## Notes for the operator

- SHONEN boxes are all `[~]`. Boxes 1, 2 and 4 look checkable by a non-author:
  - box 1: SKILL.md decision tables, error patterns, 15-item checklist, cited sources;
  - box 2: LOG round-40 entry with `.ufo/waves/round-40/final/`;
  - box 4: PROVINCE unchanged, webbridge internals left to tabi.
- Box 3 is qualified: the bare clone reads 13/15 because two round-gate items need the fleet parent.
- Promotion is operator-owned; this closure writes no `[x]`.
- Tooling used by this closure: ephemeral `uv run --with jsonschema==4.25.1` (PyPI, uv cache) to
  validate the mutant ledgers against S036. No persistent install or update.
