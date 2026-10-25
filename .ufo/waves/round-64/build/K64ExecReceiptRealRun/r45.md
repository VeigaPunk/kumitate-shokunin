# kumitate — round 45 report

Lane base `3632602c` (round-44 closure). Lane tip **`330ebfeb0bc7a361ab1b69d43adf1e76d21e5cfc`**. The round ran in three
attempts. Attempt 1 (`KumitateR45`) died at 05:25:25Z and attempt 2 (`KumitateR45A2`) died at 06:19:06Z, each with the
orchestrator process. Attempt 3 (`KumitateR45A3`, dispatched 06:40Z) wrote this report. Every hash below comes from a
`landed <hash>` line printed by `scripts/hyaku/jj-lane.sh`, or is an ancestor of the tip
(`git log 3632602c..330ebfeb`).

## Work performed

Declared claims: **one exploratory claim, C1, on axis coverage.** Its surface is the PROVINCE frontier band "Isolation
substrates for parallel agents" (retired aggregate, no live term). The claim has no counting command. The round
also carries routed repairs R44-1..R44-6, R43-1 and R43-5. No counted claim was made (anti-loop after the r42–r44
counter rejections).

- **C1 entry**: `corpus/knowledge/agent-isolation-substrates.md`, committed at `6b2a4517` (the judged object). It
  holds seven mechanisms (M1–M7), six of them demonstrated with a do-nothing control, and a six-row table mapping seat
  action → substrate → required guards. It cites S062–S074, S013 and S027. Verdict rule, frozen: `.ufo/waves/round-45/plan.md:41-48`
  (`cfa99304`). Checklist: E7 (`a2e5b54c`) as amended by E9 (`31656bdf`) before the entry commit.
- **Pre-freeze controls (attempt 2, `31656bdf`)**: do-nothing, glossary, label-keyed, off-topic and same-effect
  controls were scored against the checklist before the entry existed. Every K-item one of them met was amended by
  E9: `plan.md:170-202`, and `corpus/lessons/round-45.md:71-87` holds the table.
- **Falsify wave `a3-falsify`** (attempt 3, 33 seats, receipts `3837d315`). Every item was a new design; attempt 2's
  44 falsify tasks were not resent (plan E10, `9c4785ea`).
  - Re-opens: 15 independent-channel re-opens of the cited rows, plus 2 re-judgments of the rejected rows S075 and S076.
  - Method control: `CtlChannelMethod` caught 6 of 9 planted defects. Its 3 S066 probes were inconclusive because the
    page has no in-text version marker.
  - Guard ablations, one per table row: all 6 baselines reproduce with clean controls. Seats `Abl*Row`.
  - Audits and checks: 2 practice audits of the lane scripts, a whole-checklist application (`KSheetFull`: passes,
    with re-runs owed to the other seats), a strongest-failure critic, a contradiction scan and a version-drift check.
  - History replays of the repairs: Q32 (22 boundaries, 0 false negatives, 0 false positives), Q30 (cannot pass a
    counter with a fixed CLEAN case) and Q31 (11 false passes and 3 false fails on 34 real launchers).
- **Entry errata, appended only**: X1–X12 (`d5f67ee2`), then X1′ and X13–X20 after the residual review (`9e3e3ed9`).
  `git diff --numstat 6b2a4517 330ebfeb -- corpus/knowledge/agent-isolation-substrates.md` reports 94 insertions and 0
  deletions. Main corrections:
  - `git diff` is not read-only: it rewrites `.git/index`.
  - The row-3 guard line fails open when passed inline through `systemd-run`, and it differs from the tested line.
  - `MemorySwapMax=0` is necessary.
  - M2 does not abandon the old change.
  - The `env -i` name count reads 2 under the prescribed invocation, not 0.
  - A Buffer sentence that S073 does not support was withdrawn and re-sourced on the new row S077.
- **Residual review `a3-residual`** (7 seats, receipts `92889d26`):
  - RevErrataFidelity: X1 misstated one detail, and 10 receipt defects had no erratum. Fixed by X1′ and X13–X20.
  - RevReopenS077 and RevRowFixes: hold.
  - RevQualityNotes: the Q30 reading was gameable; it is now bounded.
  - RevMistake3: holds.
  - CritCloseReading: 4 overclaims and 2 omissions, corrected by the appended lesson and SCORECARD corrections.
  - CritLogClaims: 2 errors, corrected.
- **Routed repairs**: listed by id in `corpus/lessons/round-45.md:89-111`. Attempt-3 replay notes are in `corpus/QUALITY.md`
  (end of the file).
  - R44-1: Q30, with the bounded fixed-case reading.
  - R44-2: errata in `lessons/round-44.md` and the Q29 ordering note.
  - R44-3: Q31. The source greps are advisory and the behavioural selftest decides. No runner lands.
  - R44-4: 7 of the 8 owed reviews are verified in `a2-control/Verify*.md`. The census-vs-domain report arrived after
    `31656bdf`; it is untrusted and not cited.
  - R44-5: the `A` definition is recorded.
  - R44-6: record fixes.
  - R43-1 and R43-5: recorded and deferred.
- **Mistakes mined** (`corpus/lessons/round-45.md` § Mistakes and § Mistakes (attempt 3)):
  - The DRIFT opening caused by a closure file with no README row (8 rounds). Fix: Q32, shown to fail at `3632602c`.
  - Uncommitted work lost with a dead L1.
  - A guard tested in one form and prescribed in another. Shown able to fail: `GUARD_BYTES: DIFFER` at `6b2a4517`,
    re-run by RevMistake3, which also shows that a byte-exact copy reads SAME.
- **Inherited scratch**: 45 untracked attempt-1/2 files. They were copied byte-exact to
  `/fast/scratch/hyaku/kumitate-r45/a3/untracked-snapshot/` and removed from the lane; none is cited. The
  `a2-falsify` spec, dispatch payload and registry are committed only as the record of a dead wave (`9c4785ea`).

## Landed changes

LOG.md round-45 entry, plus its correction line. Every commit below is pushed; `jj-lane.sh state` shows `local=remote=330ebfeb ahead=0`.

| commit | content |
|---|---|
| `cfa99304` | plan, round-open receipts (attempt 1) |
| `ca5b0aac` | plan errata E1–E6 |
| `a2e5b54c` | F1 quote control, frozen checklist E7 |
| `d9ad2870` | E8, attempt-2 start census, control-wave spec |
| `31656bdf` | attempt-2 control receipts (49/50), E9 |
| `1a8312ee` | repairs: QUALITY Q29 note, Q30–Q32; round-44 errata; SCORECARD fixes |
| `6b2a4517` | C1 entry (judged object), SOURCES S013/S027 flips and S062–S076, README rows, PROVINCE line, lesson |
| `9c4785ea` | attempt-3 plan erratum E10, a2-falsify dead-wave record, a3-falsify spec and dispatch |
| `3837d315` | a3-falsify receipts (33/33) |
| `d5f67ee2` | entry errata X1–X12; S077; S013/S072/S073 row fixes; QUALITY replay notes; lesson attempt-3; SCORECARD row 45; LOG |
| `92889d26` | a3-residual receipts (7/7) |
| `9e3e3ed9` | errata X1′, X13–X20; corrections in lesson, QUALITY, SCORECARD, LOG |
| `330ebfeb` | close receipts `.ufo/waves/round-45/close/` |

## Before → after measurements

C1 is exploratory and has no counting command. It verifies only as `unprovable-but-better` with a named non-author
reviewer; that ruling is requested of the hyaku closure.

- **Surface (base → measured):** `git show 3632602c:corpus/knowledge/agent-isolation-substrates.md` → absent (`fatal: path … exists on disk, but not in '3632602c'`).
  At `6b2a4517` the entry exists, and `grep -c agent-isolation-substrates corpus/README.md PROVINCE.md` → 1 and 1.
- **Author's reading: `unprovable`, pending the non-author ruling.** K0, K1′, K4 and K5′ hold. On K2′ the 6/6 re-runs
  reproduce, and the differing numbers are corrected by named errata (admitted by K2 as frozen). On K3′ the closure
  must rule on these literal exceptions:
  - S068: the quote spans a `//` comment break.
  - S069: the quote is split by an XML tag in its source bytes.
  - S066, S067, S068, S069, S070: no in-text release marker.
  - S063: the footer names 2.49.0.
  - S077 is a source added after the freeze.

  Details: `corpus/lessons/round-45.md` § C1 at close and § C1 at close — corrections.
- **Close receipts at `9e3e3ed9`** (`.ufo/waves/round-45/close/`):
  - `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH (… C2=102/102 …)`, exit 0. At round open it was DRIFT,
    `C2_TOTAL_DRIFT declared=99 computed=100`, exit 1 (`open/proxy-strict-3632602c.txt`).
  - `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=77 …)`.
  - Q32 → empty output.
- **No axis integer moves.** Operability stays 9; script, runtime and kimi layers stay 10.

## Sources & frontier

- **Census, round start** (`.ufo/waves/round-45/open/census-before-3632602c.txt`): `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
  → `kumitate W04 S034 duplicate url …`, `kumitate ok …/corpus/SOURCES.md`, exit=0.
- **Census, round end** (`close/census-close.txt`, rev `9e3e3ed9`): W04 S034, W04 S068 (duplicate oh-my-pi tree URL
  across scopes), `kumitate ok`, exit=0.
- **Rows:** `git show <rev>:corpus/SOURCES.md | grep -c '^| S[0-9]'` → 61 at `3632602c`, 77 at `330ebfeb`.
  - Added: 16 rows, all tier A. Mined: S062–S074 and S077. Rejected: S075 and S076.
- **Rows touched (old → new; logged in the lesson's row logs):**
  - S013 and S027: `queued` → `mined`. These were the PROVINCE frontier band's queued rows.
  - S013 locator: re-derived.
  - S072: anchor (TasksMax= 245 → 250, Delegate= 618 → 610); gloss moved to EffectiveMemoryMax=.
  - S073: an unsupported teaches clause withdrawn.
  - S013: Last-Modified served-second note.
  - S014: stays `queued`.
- **Frontier:** the band "Isolation substrates for parallel agents" moves from queued rows to a mined entry.
  `PROVINCE.md:21` was amended in place.
- **Sourced claim:** C1 rests on rows opened this round. Every cited row was re-opened by attempt-2 seats
  (`a2-control/Reopen*.md`) and again through a second channel by attempt-3 seats (`a3-falsify/XChan*.md`). S077 was
  opened by the L1 and re-opened by RevReopenS077.
- **Mistake mined:** see Work performed.

## Trend verdicts

- **expansion — improved.** A new entry opens the isolation-substrates band with 16 new source rows. Two queued rows
  were mined. Every cited row was re-opened through a second channel.
- **quality — improved.** Several held statements were corrected and the corrections receipted:
  - Entry errata X1–X20 are appended and each names its receipt.
  - The S072 and S073 rows were corrected.
  - Q30's fixed-case flaw was found by replay and bounded.
  - Q31's greps were measured as blind out of sample.
  - Q32 was replayed with 0 false negatives and 0 false positives.

  Trade disclosed: the entry as judged carries those defects; the corrections are appended, never rewritten.
- **discernment — improved.** The rejects S075 and S076 were upheld through independent channels. Three entry
  statements their sources do not support (X7–X9), one locator (X10) and the read-only permission for `git diff`
  (X1) were rejected. A method control showed the re-open procedure
  catches 6 of 9 planted defects and names where it cannot judge (no in-text markers). Two independent seats
  converged on `git diff` writing the index.

## SHONEN

- [ ] SKILL.md contains real decision tables, error patterns, checklists, cited sources
- [~] At least one end-to-end domain task executed and logged in LOG.md — the six guard ablations ran the entry's table rows end to end in scratch (`a3-falsify/Abl*Row.md`); LOG round-45 entry (author-asserted)
- [ ] Instructions executable by an agent without oral context
- [~] No cross-domain bleed (PROVINCE.md still accurate) — sibling mechanics cited, not absorbed (§ Scope, errata X8/X16); PROVINCE.md:21 amended in place (author-asserted)

## Gate

Real rejects, with reasons:
- **S075, S076.** The versioned git-scm URLs serve 2.54.0 and 2.49.0 text, not 2.56.0. Upheld by XRejudgeS075 and
  XRejudgeS076.
- **The entry sentence "a Buffer's backing store is an ArrayBuffer outside that section".** No channel of S073
  supports it (XChanS073). Withdrawn and re-sourced on S077.
- **The § Scope pointer "its S072 is the same systemd-run page".** Tsukuroi's file cites its S121 (XChanS072).
- **`git diff` as a read-only lane command.** It rewrites `.git/index` (CritStrongestFail, AblReadOnlyRow).
- **The Q30 fixed-case reading as first written.** It is gameable (RevQualityNotes).
- **Attempt-1/2 leftovers as evidence.** They are untrusted.

## Round shape

Default shape: v1 waves plus a residual call, run across three attempts.
- **Attempt 1** (dead): wave `build`, 40 seats (scribe 14, executor 10, scout 4, critic 4, reviewer 3, sentinel 2,
  mutation-tester 2, connector 1). It left no committed receipts except the F1 control.
- **Attempt 2** (dead):
  - Wave `a2-control`: 50 seats (reviewer 21, executor 7, critic 6, mutation-tester 6, sentinel 4, scout 4,
    connector 1, scribe 1). 49 receipts were committed; the 50th arrived late and is not cited.
  - Wave `a2-falsify`: 44 seats, spawned in 4 chunks after a job-limit refusal. No seat report returned before the
    orchestrator died at 06:19:06Z. Their tasks were not resent.
- **Attempt 3:**
  - Wave `a3-falsify`: 33 seats (reviewer 11, scout 8, executor 8, mutation-tester 2, sentinel 2, critic 1,
    connector 1), validated under policy v1. Sent as one task call with the validator's `taskCall` unchanged, except
    for the `solutionSpace` field the task tool requires. All 33 settled, 06:50→07:14Z.
  - Residual call: 7 seats (reviewer 5, critic 2), 07:19→07:29Z.
  - Attempt 3 dispatched 40 seats. No seat died, none was cancelled, and no task call was refused.
- **Round total:** 40 + 94 + 40 = 174 seats dispatched. This exceeds the 128-seat round cap because dead attempts'
  waves count. Each attempt stayed within it.
- **Planner seat:** held by the L1. The planning data-walk rode scout `ScoutContainmentRules` (attempt 1).
- **§3 floor:** met in wave `a2-control`.
- **Misroot sweep:** `git -C /home/vgpnk/Projects/shokunin status --porcelain` lists untracked fleet files (`AGENTS.md`,
  `bm.json`, `write`, html/txt captures, `.ufo/state/*`). `grep -ci kumitate` on each non-state file → 0. No misroot.

## Open L0 questions

None new. Recorded from earlier rounds and still open: L0 `9a00d09` on the `kumitate-gate-pins-v1` block.

Stale-lane: respawn-per-round driver; no other mission of this lane is open. Tool installs: none by the L1. No seat
reported an install. curl, git, man, bwrap, systemd-run and node were already present.
