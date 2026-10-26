author: hyaku closure (non-author integrator, @m_opus)

# round-37 — non-author verification and spot-check (hyaku closure)

Written by the integrator, not the lane. Inputs: fleet report `.ufo/reports/round-37/kumitate.md`
(`a8a00711` + 15 erratum/fix commits through `29920129`), prompt `.ufo/prompts/kumitate-round-37.md`
(fleet `453cfe5`). Lane HEAD before the round `5833351932af320efb04651869d9399c3f37e972` (the round-36
closure commit on top of `91da27c6`) → after `ea63c4e68c0d0559f4aafefcd3c7ae239247b2ae` → late tip
`198091c9e5551611ca0e39d80a40891e6952c527` (11 late falsify reports only). Upstream pin: the closure's
own private read-only clone `/fast/scratch/close-kumitate-r37/pin` (cloned from
`/fast/scratch/kumitate-r36/src`, checked out at `31c465f15669f744848bd9f5d56191c5085670f7`, `chmod -R a-w`).
Watchdog digest (copied): `2026-10-21T03:16:49-03:00 launch kumitate round=37 pgid=2498319
driver=hyaku-inline attempt=1` / `2026-10-21T03:48:57-03:00 complete kumitate round=37; hyaku-inline attempt=1`.
Review seats were refused twice by the process job cap (`Background job limit reached (100)`), so
every check below was run by the closure itself. No lane gate, selftest or lane script was executed;
FIDELITY output was not trusted. Anchor truth was re-measured with the closure's own parser
(Appendix A, sha256 `bcaff2f0d200645fb9b62dc1e2ae8169b871bb56279888e7bfa04b812e5dbf42`). Tool installs: none.

## Step-1 conformance

| check | command | observed |
|---|---|---|
| report author | `git log --format='%an %H' -- .ufo/reports/round-37/kumitate.md` | 16 commits, all `kumitate-shokunin`; first `a8a00711` 03:21:51, after work commit `86c0676` 03:21:37; last `29920129` 03:37:27 |
| SHONEN heading | report §SHONEN vs `SHONEN.md` | 4 lines for 4 boxes, all `[~]` with pointers |
| cited hashes | `git merge-base --is-ancestor <h> master` for 5ceb8cd, 86c0676, a5d627b, 5031720, fdac52c, fb5b90e, 5bc40d0, 469500f, c7648c7, 08ee2cf, eb4c106, 28164ee, c589b38, ea63c4e, 198091c, 91da27c, 0614092 | all ancestors (`3f51c7e7…` is a file sha256, `31c465f1` the upstream pin) |
| pushed/clean | `scripts/hyaku/jj-lane.sh state …`; `git status --porcelain \| wc -l`; `ls-remote origin refs/heads/master` | `ahead=0 behind=0 head=detached tracked=0 untracked=0`; `0`; remote = `198091c9…` |
| prompt contract | `cmp templates/round-prompt.md ~/Projects/kimi-shokunin/templates/round-prompt.md`; difflib template (140 L) vs prompt | template identical to canonical; 10 replace hunks, all placeholder lines; 0 deletions; 130 template lines kept; §6 hyaku addendum appended; §3 states ≥8 L2 in one batched call and quotes no route map, matching `MISSION.md` §L2 concurrency (no role pins) |
| fleet `-.rej` | `ls -la /home/vgpnk/Projects/shokunin/-.rej` | absent |

Conformance defects (status-neutral):

- **`LOG.md` is append-only, but the round-37 entry was rewritten in place.** `git diff 5ceb8cd ea63c4e -- LOG.md`
  shows `5031720` and `fb5b90e` replacing `C2/C2_total=83`/`C2=83/83` and the declared-claim
  sentence inside the filed entry. No appended correction entry was added. The same entry still says
  "D1 every symbol-keyed anchor … reverted", "ratchet … total 186" and "anchors=1551". All three were
  superseded by the base reset `5bc40d0`.
- **The final gate captures do not measure the final bytes.** `final/{fidelity,checklists,proxy,claims,sources}.txt`
  were last written at `8c41439`. After that, `6f88d12` changed `scripts/claims-check.mjs` (selftest
  harness env), and `b90dcf0` re-pinned `pin.claims-check` by hand. No selftest tally or PROXY run is
  committed for `ea63c4e`. The closure hand-checked the pin: `git show ea63c4e:scripts/claims-check.mjs | sha256sum`
  = `0b2d0d24…`, equal to `SCORECARD.md:305`.
- **One falsify seat is dead and undisclosed.** The dispatch has 68 tasks (`jq '.taskCall|fromjson|.tasks[].name'`).
  `falsify/` holds 67 reports at `198091c`. `AuditRemainder6` has no report and is named in no lane
  artifact except the spec/validation JSON. The slot release was never run (disclosed in `final/README.txt`).
- The report header names base `91da27c6`; the actual pre-round HEAD is `5833351` (the round-36
  closure commit, same corpus tree). `5ceb8cd` carries author-date 03:14:49, before the 03:16:49
  launch. Its committer date is 03:21:18, so it is a jj change created early, not pre-round work.

## Claims — re-check

One declared claim: **operability — "the fidelity gate measures anchor truth instead of rewarding
shifts"**. The operability integer was held at 8 (`f_O` 21/24, C=14, unchanged).

**As declared, it does not verify.** The "anchor truth" half is refuted. The author's own errata 4, 6
and 10 withdraw it. The closure measured it independently:

- `.ufo/pins/fidelity-ratchet.json` per-note ceilings sum to 200 (`jq '[.notes[]]|add'`). That equals the
  `FIDELITY_TOTAL … nonok=200` line in `final/fidelity.txt`, and every per-note ceiling equals that
  note's current `nonok`.
- So `FIDELITY: CLEAN` at landing is tautological: the ratchet was raised from all-zero (round 36) to
  the measured debt.
- For the four reset notes, the gate reports `nonok` 31+70+23+20 = 144 and `noid` 177 over 710 anchors.
  The closure parser finds 202 false, 17 dead and 123 unpairable over 811 anchors. The gate therefore
  under-counts falsity: multi-anchor runs such as `` `a` / `b` (`:1`, `:2`) `` pair with an anchor span
  and fall to `noid`.

**The "no longer rewards a shift" half is evidence-verified, not executed.**

- The code has one pairing expression, `scripts/claims-check.mjs:303` `const pair = prev ?? next ?? null;`
  (`git diff 5833351 ea63c4e -- scripts/claims-check.mjs`). No right-first path remains.
- The new fixture is discriminating by reading. Fixture line 3 is `const ALPHA_MARK = 1;` (`:841`), and
  the note is `` `BETA_MARK` (`scripts/a.mjs:3`), `ALPHA_MARK` at `scripts/a.mjs:3` ``. Left-first gives
  `nonok=1`. Right-first pairs the first anchor with `ALPHA_MARK` and gives 0.
- Committed mutation evidence `falsify/Pair1.md`: pristine `CLAIMS_SELFTEST: 47/47 pass`; the
  `next ?? prev` mutant gives `46/47` and fails exactly that case; restored gives `47/47`.
- Limit: the tally predates `6f88d12`.
- The closure's own parser passes the same shift test. The true fixture reads `['true','true']`; the
  next-symbol shift reads `['false','true']`.

Re-measured by the closure: anchor truth, the ratchet sum, note bytes, C2, the `.rej` hash, the pin
hash and the sources census. Evidence-verified only: the selftest tally, the CHECKLIST 14/14, PROXY,
CLAIMS and SOURCES_CHECK lines (`final/*.txt` at `8c41439`).

## Round-36 routed defects D1–D8

| D | disposition | closure check | verdict |
|---|---|---|---|
| D1 restore anchor truth, keeping the base line wherever its symbol is still on it | full reset to `0614092` bytes plus one notice line per note (`5bc40d0`) | `git diff 0614092 ea63c4e -- <four notes>` = 4 × one inserted notice line at line 2 | **not as routed.** The routed rule was per-anchor. The reset also reverted 62 anchors that were true at round open (table below) |
| D2 one pairing rule plus a next-symbol shift selftest that must fail | `prev ?? next`; fixture `fidelity-shift` | code read plus `Pair1.md` mutation kill (above) | verified (evidence) |
| D3 wording corrections | `SCORECARD.md` `## Round 37 correction`; `lessons/round-36.md` `## Correction`; live runtime row `92/92` = 10 | `git diff 5833351 ea63c4e -- SCORECARD.md corpus/lessons/round-36.md` | **partial.** See the three open sentences below |
| D4 QUALITY criterion | Q16 added; cites the spot-check | `git diff … -- corpus/QUALITY.md` | present. The lane's round does not meet Q16's own committed-command bar: `lessons/round-37.md` §Gate D1 says "OWED" |
| D5 falsify wave before the report | 68-seat wave; `falsify-dispatch.json` and `swarm-registry.json` committed in `5ceb8cd` (committer 03:21:18), before the report (03:21:51); taskCall context reads "repair tree uncommitted" | `git show --stat 5ceb8cd`; timestamps | verified, with defects: 67/68 reports and the slot never released |
| D6 fleet-root `-.rej` | moved into `.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt` | `sha256sum` = `3f51c7e7c3ca…`; 249 lines; `grep -c '^@@'` = 19; fleet copy absent; `final/misroot.txt` 03:32:10 lists driver files only | verified |
| D7 ExecFidSmall.patch | discarded, with a reason (`repairs.md:12`, `lessons/round-37.md:41`, `LOG.md:1723`) | `ReviewFidSmallB.md:1` `semantic-fail=4`; no patch file in the tree | verified |
| D8 README map row | rows for `round-36-verifier-spotcheck.md` and `round-37.md`; `C2=C2_total=84` | `git show ea63c4e:corpus/README.md \| grep -c '^| \`'` = 84; 86 corpus files minus unmapped `QUALITY.md` and `SOURCES.md` = 84 | verified |

D3 sentences still open at `ea63c4e` (`git grep -n -i 'clause-guarded\|measures anchor truth\|every symbol-keyed\|total 186\|anchors=1551' ea63c4e`):

- `corpus/README.md:99` still describes round 36 as "the FIDELITY v1 arm with a clause-guarded pairing rule".
  The text is false and unmarked, though D3 asked for every mention.
- `SCORECARD.md:1717`, inside the new correction, ends "claims only that the fidelity instrument
  measures anchor truth". That contradicts the round's own errata 4 and 10.
- `LOG.md:1715-1727` still carries the symbol-keyed, 186 and 1551 statements. `corpus/lessons/round-37.md:13`
  still says the anchors were "reverted to their 0614092 sentence lines (every symbol-keyed anchor)".

### Anchor truth at the pin — closure parser (Appendix A)

Command: `PIN=/fast/scratch/close-kumitate-r37/pin python3 parse.py --compare /home/vgpnk/Projects/shokunin/kumitate-shokunin`.
It compares `0614092` (pairing text) against `5833351` (round open) and `ea63c4e` (round close).

The parser follows one rule. Within a sentence, symbols seen since the last anchor run are paired
positionally with that run, left first. With no preceding symbol, the next symbol is used. A bare
`:N` takes the most recent repo-relative path. An anchor is true when the normalized symbol, or its
longest identifier, occurs word-bounded on the cited line(s) of the pin.

| note | anchors | true at open → close | restored (r36 harm removed) | regressed (true at open → not at close) | moved, false both |
|---|---|---|---|---|---|
| native-trial-launch | 54 | 34 → 19 | 6 | **21** | 8 |
| remaining-scripts-census (S8) | 521 | 281 → 357 | 103 | **27** | 16 |
| route-probe-cluster (S7) | 165 | 45 → 46 | 7 | **6** | 9 |
| sighting-wall (S4) | 71 | 40 → 47 | 15 | **8** | 6 |
| total | 811 | **400 → 469** | **131** | **62** | 39 |

- Status at close: 469 true, 202 false, 17 dead (beyond EOF or missing at the pin), 123 unpairable
  (prose anchors).
- The same parser applied to `0614092 → 91da27c` gives round-36 harms 6/103/7/15. The round-36 closure's
  different parser measured 4/102/5/12 = 123.
- The lane's own `Verify1` reported 109 removed / 54 discarded. Erratum 7 gave sighting 8 and native 21,
  which equal the closure's counts.
- 9 of the 62 regressed round-36 lines are comment-line mentions (`die`, `taskDispatches`,
  `extendLedgerMemoWithSuffix`, `rc != 0`, `REPO_ROOT`, `ufo-mission-lifecycle-v1`, `resumeHint`,
  `label`, `agentId`). 53 are code-line definitions or uses.

Spot-verified at the pin:

| symbol | base (close) line | round-36 line |
|---|---|---|
| `resolveNativeDispatchPolicy` (`run-omp-native-trial.mjs`) | `:646` `fail("malformed", …)` | `:639` `export function resolveNativeDispatchPolicy(` |
| `acquireOperationLock` (`ufo-sighting.mjs`) | `:663` `try {` | `:648` `function acquireOperationLock(` |
| `projectMissionActivity` (`ufo-mission-activity.mjs`) | `:133` | `:123` `export function projectMissionActivity(input) {` |

The regressed anchors, given as close line → round-36 line (true at the pin), are the lane's next
per-anchor repair list:

- NTL (native-trial-launch.md, 21): `PROFILE` run-omp-native-trial.mjs :50→:56; `PROPOSAL_WAVE_CEILING` run-omp-native-trial.mjs :109→:115; `parseArgs` run-omp-native-trial.mjs :844→:851; `planLaunchMode` run-omp-native-trial.mjs :958→:965; `resolveNativeDispatchPolicy` run-omp-native-trial.mjs :646→:639; `handOffToSightingWall` run-omp-native-trial.mjs :1282→:1289; `die` run-omp-native-trial.mjs :831→:4315; `validateDispatches` collect-omp-native-handoff.mjs :869→:873; `persistEvidenceWrites` collect-omp-native-handoff.mjs :973→:977; `taskDispatches` events.mjs :381→:20; `attemptLedgerEntry` evidence.mjs :70→:71; `seatStatus` evidence.mjs :474→:476; `verifyEffectiveLaunch` evidence.mjs :631→:633; `buildCostLedger` evidence.mjs :1003→:1005; `appendRoutingHealth` evidence.mjs :1067→:1071; `splitRoute` policy.mjs :39→:66; `loadSeatRoutingMirror` policy.mjs :155→:173; `verifyLaunchSeatRouting` policy.mjs :283→:301; `readRoundPlan` policy.mjs :704→:722; `waveTokenFromContext` policy.mjs :780→:798; `parseRateCard` policy.mjs :908→:926
- S8 (remaining-scripts-census.md, 27): `extendLedgerMemoWithSuffix` fleet-ledger-read.mjs :348→:253; `MAX_BYTES` fleet-ledger-rotate.test.mjs :54→:49; `BUILD_FAMILY="build|test|check|clippy|ru` cargo-shim.sh :128→:117; `have` cargo-shim.sh :136→:125; `rc != 0` cargo-shim.sh :322→:312; `mv -f` install-shim.sh :61→:62; `UFO_LOCAL_HELPER_URL` local-helper.mjs :332→:157; `endpoint_invalid` local-helper.mjs :165→:157; `readInput` local-helper.mjs :139→:135; `input_too_large` local-helper.mjs :132→:128; `input_invalid` local-helper.mjs :135→:131; `model_output_invalid` local-helper.mjs :309→:264; `loadHook` ufo-l0-monitor-hook.test.mjs :32→:30; `REPO_ROOT` ufo-l0-monitor-hook.test.mjs :37→:7; `validateTaskReceipt` ufo-l0-monitor.test.mjs :35→:18; `projectMissionActivity` ufo-mission-activity.mjs :133→:123; `renderMissionActivity` ufo-mission-activity.mjs :160→:150; `INVALID_VIEW` ufo-mission-activity.mjs :162→:152; `projectMissionLifecycle` ufo-mission-lifecycle.mjs :96→:85; `ufo-mission-lifecycle-v1` ufo-mission-lifecycle.mjs :187→:17; `resumeHint` ufo-mission-lifecycle.mjs :181→:28; `readBoundedJsonInput` ufo-mission-lifecycle.mjs :215→:202; `mission and task lifecycle snapshots con` ufo-mission-lifecycle.mjs :131→:120; `label` ufo-mission-observation.mjs :66→:27; `task?.route` ufo-mission-observation.mjs :58→:57; `spawnSync` ufo-stale-watchdog.test.mjs :62→:10; `agentId` ufo-swarm-collect.test.mjs :560→:5
- S7 (route-probe-cluster.md, 6): `persistState` probe-ufo-route-health.mjs :1080→:1073; `PROBE_CONCURRENCY = 8` probe-ufo-route-health.mjs :61→:65; `mapPool` probe-ufo-route-health.mjs :784→:775; `assertNoSecrets` probe-ufo-route-health.mjs :939→:932; `session_truncated` probe-ufo-route-health.mjs :904→:897; `interpretPersistedHealth` probe-ufo-route-health.mjs :1037→:1030
- S4 (sighting-wall.md, 8): `acquireOperationLock` ufo-sighting.mjs :663→:648; `withOperationLock` ufo-sighting.mjs :781→:767; `spawnPaneForMission` ufo-sighting.mjs :2225→:2239; `completeMission` ufo-sighting.mjs :3339→:3361; `scheduleReconcile` ufo-sighting.mjs :3572→:3604; `peekMission` ufo-sighting.mjs :3544→:3576; `emitFatal` base.mjs :111→:116; `runLegacyNativeDirect` surface.mjs :318→:325

## Per-axis verdicts

`git diff 5833351 ea63c4e -- SCORECARD.md`: `C2` 82→84, `pin.claims-check` re-pinned, the runtime
row's evidence text changed 83/92 = 9 → 92/92 = 10 (score 10 unchanged), Move-log row 37 added, and
`## Round 37 correction` appended.

| axis | verdict | basis |
|---|---|---|
| operability | unprovable-but-better | Closure as named non-author reviewer. The gate can no longer be satisfied by a next-symbol shift (one rule; discriminating fixture; mutation kill), and CLEAN-under-ratchet semantics are explicit. The declared "anchor truth" claim is refuted. Integer 8 → 8 and `f_O` unchanged, so no measured move |
| coverage:script-layer | **harmed** (a trade) | 131 shift-harmed anchors restored, but 62 anchors true at round open now cite a false line: S8 27, S7 6, S4 8, native-trial 21. Net true 400 → 469. The notes carry a notice. The routed per-anchor D1 would have kept the 62. A trade inside an axis is not an improvement (AXES.md §Working the axes) |
| coverage:runtime-layer | unchanged | R 92/92 before and after; only the live-row evidence wording was corrected |
| coverage (retired) | unchanged | terminal 10 |
| coverage:kimi-layer | unchanged | K 51/51 |

## Discernment spot-check (LEARNING.md)

From `corpus/lessons/round-37.md` `## Gate` (`ea63c4e`):

| item | decision | re-opened source | verdict | reason |
|---|---|---|---|---|
| D2 left-first pairing + shift selftest | admit | `git show ea63c4e:scripts/claims-check.mjs` lines 297-305, 841, 1181; `falsify/Pair1.md` | agree | one rule; the fixture fails under right-first by reading; committed mutant 46/47 |
| D6 `-.rej` moved | admit | committed copy; `ls` of the fleet root | agree | sha256 `3f51c7e7…`, 249 L, 19 hunks; fleet copy absent |
| D7 `ExecFidSmall.patch` | reject (discarded) | `.ufo/waves/round-36/build/ReviewFidSmallB.md:1` | agree | `semantic-fail=4` were never fixed, so the green depended on right-first |
| D1 symbol-keyed restore (`5ceb8cd`) | rejected in-round, then base reset | closure parser vs the pin; `falsify/AuditRemainder3.md` | agree (direction) / disagree (magnitude) | The symbol-keyed restore was unsafe (`AuditRemainder3` header: `anchors=18 false=18 overreverted=2`). The reset's trade is 131/62 by closure count, not the 109/54 recorded in `repairs.md` |
| S032 Reproducible Builds (no new row this round) | admit (standing) | https://reproducible-builds.org/docs/recording/ (re-opened 2026-10-21) | agree | the quoted sentence appears verbatim in the paragraph before §File Format; 23 words, ≤25 |

- `git diff 5833351 ea63c4e -- corpus/SOURCES.md | wc -l` = 0, so no new source row.
- `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
  printed `kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md` and exited 0.

## Trend verdicts

- expansion — **unchanged**: no knowledge entry, no source row, no coverage family.
- quality — **harmed**: 62 anchors that were true at round open now cite false lines. They are
  covered by a generic notice ("Do not claim this note as pin-true"), not marked per anchor. The false
  `README.md:99` "clause-guarded" row is left unmarked after D3 asked for every mention. `LOG.md`
  round 37 was rewritten in place and still states superseded figures. The round gets credit for 131
  restored anchors (net +69 true) and for the named round-36 corrections.
- discernment — **improved**: the round-36 disagreement became a lesson with a grounded `QUALITY.md`
  Q16. The sampled admit and reject decisions agree with the closure (4/4 decisions; the D1 magnitude
  differs). The lane's own falsify wave caught the unsafe symbol-keyed restore before closure.

## Adjudication

**REJECTED — harmed.** The declared operability claim does not verify as declared: the fidelity gate
does not measure anchor truth. coverage:script-layer is harmed by a trade: 62 true anchors were
regressed while 131 were restored.

Status `ok`: this is a real report citing checkable lane commits. All SHONEN boxes stay `[~]`. They
are not fully checkable by a non-author while D1 is open, and promotion remains operator-owned.

## Routed defects (lane owes next round)

- R1 Per-anchor D1. For each of the 62 regressed anchors listed above, restore the round-36 line where
  its symbol is on it. Commit the parser and its output (Q16), then lower the ratchet accordingly.
- R2 The ratchet must be a burn-down. A ceiling set equal to the current debt certifies nothing.
  Record the 0 → 200 rise, and make ceilings non-increasing by rule, with a selftest in which a
  raised ceiling fails.
- R3 Gate under-count: 144 `nonok` against 202 closure-false anchors in the four notes. Multi-anchor
  runs (`` `a` / `b` (`:1`, `:2`) ``) pair with an anchor span and fall to `noid`. Add positional run
  pairing and a fixture for it.
- R4 Corrections sweep:
  - `corpus/README.md:99` ("clause-guarded");
  - `SCORECARD.md:1717` ("measures anchor truth");
  - `LOG.md` round-37 entry (symbol-keyed / 186 / 1551), plus a named appended correction for the
    in-place rewrite of an append-only entry (`5031720`, `fb5b90e`);
  - `corpus/lessons/round-37.md:13`.
- R5 Re-capture the final gate evidence at the final bytes: a selftest tally after `6f88d12`, and
  PROXY/CHECKLIST against the re-pinned `claims-check`.
- R6 Record the dead falsify seat `AuditRemainder6` and the unreleased slot.
- R7 Add a `corpus/README.md` map row for this note (C2 84 → 85).

## Appendix A — closure parser (`parse.py`, sha256 `bcaff2f0d200645fb9b62dc1e2ae8169b871bb56279888e7bfa04b812e5dbf42`)

Re-run it with the command in §Anchor truth. It needs a pinned checkout at `$PIN`. `main()` also
accepts a snapshot directory layout, `notes/<rev>/<note>.md`.

```python
#!/usr/bin/env python3
"""Closure-owned anchor-truth parser (kumitate r37 closure). Independent of lane code.

Pairing rule (one rule, left-first positional):
  Within a sentence, symbols seen since the last anchor run are "pending". A run of
  consecutive anchors (only punctuation/whitespace/'and'/'or' between them) is paired
  positionally with the LAST k pending symbols (k = run length). If fewer pending symbols
  than anchors, the leading anchors of the run are paired with the remaining pending ones
  right-aligned and the rest take the next symbol after the run in the same sentence
  ("At `path:N`, `sym`" convention); otherwise unpaired.
Truth: symbol normalized (strip quotes/()/args/leading ./#/--); TRUE if the whole
normalized string or its longest identifier token occurs on cited line(s) of the pin.
"""
import os, re, sys, json, subprocess

PIN = os.environ.get('PIN', '/fast/scratch/close-kumitate-r37/pin')
SPAN = re.compile(r'`([^`\n]+)`')
ANCH = re.compile(r'^(?P<path>[\w./@+-]*[\w-]\.[\w]+)?:(?P<a>\d+)(?:-(?P<b>\d+))?$')
PATHRE = re.compile(r'^[\w./@+-]+\.(?:mjs|cjs|js|ts|json|md|sh|rs|toml|py|service|timer|ya?ml|txt|lock|conf)$')
IDENT = re.compile(r'[A-Za-z_$][\w$]*')
JOIN = re.compile(r'^[\s,;/()]*(?:(?:and|or)[\s,;/()]*)?$')
SENT_END = re.compile(r'(?:\.\s+(?=[A-Z*`(])|\.\s*$|;\s|:\s*$)')

_files = None
def resolve(path):
    global _files
    p = os.path.join(PIN, path)
    if os.path.isfile(p):
        return path
    if _files is None:
        _files = subprocess.run(['git', '-C', PIN, 'ls-files'], capture_output=True, text=True).stdout.split('\n')
    c = [f for f in _files if f == path or f.endswith('/' + path)]
    return c[0] if len(c) == 1 else None

_cache = {}
def lines_of(path):
    if path not in _cache:
        with open(os.path.join(PIN, path), encoding='utf-8', errors='replace') as fh:
            _cache[path] = fh.read().split('\n')
    return _cache[path]

def norm(sym):
    s = sym.strip().strip('"\'')
    s = re.sub(r'\(.*\)$', '', s)
    s = s.lstrip('.#-')
    toks = IDENT.findall(s)
    longest = max(toks, key=len) if toks else s
    return s, longest

def blocks(text):
    """Yield (block_lines_text, start_line) where headings and table rows are own blocks."""
    cur, start = [], None
    for i, line in enumerate(text.split('\n'), 1):
        if line.strip() == '' or line.startswith('#') or line.lstrip().startswith('|') or line.startswith('```'):
            if cur:
                yield ' '.join(cur), start
                cur = []
            if line.strip():
                yield line, i
            continue
        if not cur:
            start = i
        cur.append(line)
    if cur:
        yield ' '.join(cur), start

def parse(text):
    """Return list of anchors in document order: dict(idx, line, path, a, b, sym)."""
    out = []
    cur_path = None
    in_code = False
    for blk, ln in blocks(text):
        if blk.startswith('```'):
            in_code = not in_code
            continue
        if in_code:
            continue
        if blk.startswith('#'):
            m = [s for s in SPAN.findall(blk) if PATHRE.match(s) and '/' in s and not s.startswith('.')]
            if m:
                cur_path = m[0]
        # split block into sentences on text outside spans
        tokens = []  # (kind, value, gap_before)
        pos = 0
        sent = []
        sentences = []
        for m in SPAN.finditer(blk):
            gap = blk[pos:m.start()]
            # sentence boundary inside gap
            if SENT_END.search(gap) or (blk.lstrip().startswith('|') and '|' in gap):
                if sent:
                    sentences.append(sent)
                sent = []
            sent.append((m.group(1), gap))
            pos = m.end()
        if sent:
            sentences.append(sent)
        for s in sentences:
            items = []
            for val, gap in s:
                am = ANCH.match(val)
                if am:
                    p = am.group('path') or None
                    items.append(['A', val, gap, p, int(am.group('a')), int(am.group('b') or am.group('a'))])
                elif PATHRE.match(val):
                    items.append(['P', val, gap])
                else:
                    items.append(['S', val, gap])
            pending = []
            i = 0
            while i < len(items):
                it = items[i]
                if it[0] == 'P':
                    if '/' in it[1] and not it[1].startswith('.'):
                        cur_path = it[1]
                    i += 1
                    continue
                if it[0] == 'S':
                    pending.append(it[1])
                    i += 1
                    continue
                run = [it]
                j = i + 1
                while j < len(items) and items[j][0] == 'A' and JOIN.match(items[j][2]):
                    run.append(items[j]); j += 1
                k = len(run)
                syms = pending[-k:] if pending else []
                nxt = None
                if len(syms) < k:
                    # forward fill from next symbol in sentence
                    for t in items[j:]:
                        if t[0] == 'S':
                            nxt = t[1]; break
                assign = [None] * (k - len(syms)) + syms
                for r, a in zip(run, assign):
                    path = r[3] or cur_path
                    if r[3]:
                        cur_path = r[3]
                    out.append(dict(line=ln, path=path, a=r[4], b=r[5], sym=a if a is not None else nxt, raw=r[1]))
                pending = []
                i = j
    return out

def truth(anc):
    if anc['sym'] is None:
        return 'unpaired'
    if not anc['path']:
        return 'nopath'
    rp = resolve(anc['path'])
    if rp is None:
        return 'dead'
    L = lines_of(rp)
    if anc['a'] < 1 or anc['b'] > len(L) or anc['a'] > anc['b']:
        return 'dead'
    seg = '\n'.join(L[anc['a'] - 1:anc['b']])
    full, longest = norm(anc['sym'])
    def wb(t):
        return re.search(r'(?<![\w$])' + re.escape(t) + r'(?![\w$])', seg) is not None
    if (full and wb(full)) or (longest and wb(longest)):
        return 'true'
    return 'false'

def main():
    import itertools
    root = sys.argv[1]
    revs = sys.argv[2:]
    notes = sorted(f[:-3] for f in os.listdir(os.path.join(root, revs[0])))
    res = {}
    for n in notes:
        per = {}
        for r in revs:
            txt = open(os.path.join(root, r, n + '.md')).read()
            A = parse(txt)
            per[r] = [(a, truth(a)) for a in A]
        res[n] = per
    json.dump({n: {r: [dict(a, t=t) for a, t in v] for r, v in p.items()} for n, p in res.items()},
              open(os.path.join(root, '..', 'anchors.json'), 'w'), indent=0)
    for n, p in res.items():
        print(n, {r: (len(v), sum(t == 'true' for _, t in v)) for r, v in p.items()})

if __name__ == '__main__' and sys.argv[1:2] != ['--compare']:
    main()


def compare(lane, revs=('0614092', '5833351', 'ea63c4e')):
    """Align anchors by document order (r36 changed only line numbers and a few backticks),
    pair with the base (0614092) text, evaluate each revision's line numbers against the pin."""
    notes = ['native-trial-launch', 'remaining-scripts-census', 'route-probe-cluster', 'sighting-wall']
    show = lambda r, n: subprocess.run(['git', '-C', lane, 'show', f'{r}:corpus/knowledge/{n}.md'],
                                       capture_output=True, text=True, check=True).stdout
    tot = {}
    for n in notes:
        b, o, c = (parse(show(r, n)) for r in revs)
        assert len(b) == len(o) == len(c) and all(x['path'] == y['path'] == z['path'] for x, y, z in zip(b, o, c))
        k = dict(anchors=len(b), true_open=0, true_close=0, moved=0, restored=0, regressed=0, false_both=0)
        st = {}
        for x, y, z in zip(b, o, c):
            t = lambda a, bb: truth(dict(x, a=a, b=bb))
            to, tc = t(y['a'], y['b']), t(z['a'], z['b'])
            k['true_open'] += to == 'true'; k['true_close'] += tc == 'true'; st[tc] = st.get(tc, 0) + 1
            if (y['a'], y['b']) != (z['a'], z['b']):
                k['moved'] += 1
                k['restored'] += to != 'true' and tc == 'true'
                k['regressed'] += to == 'true' and tc != 'true'
                k['false_both'] += to == 'false' and tc == 'false'
        print(n, k, 'close-status', dict(sorted(st.items())))
        for key, v in k.items():
            tot[key] = tot.get(key, 0) + v
    print('TOTAL', tot)


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == '--compare':
    compare(sys.argv[2])
```
