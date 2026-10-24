author: hyaku closure (non-author integrator, @m_opus)

# Round 46 — verifier spot-check (non-author)

Closure session `HyakuCloseKumitate46`, 2026-10-23. Inputs:
- report `.ufo/reports/round-46/kumitate.md` (fleet `445eb71a`)
- prompt `.ufo/prompts/kumitate-round-46.md` (fleet `a1e0784`)
- lane base `2b2bf7bbdedaff3f0c749a8703002bebb104d15c`, tip `9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0`

Driver digest, copied from `.ufo/watchdog.log`:
- `2026-10-23T04:59:31-03:00 launch kumitate round=46 pgid=504841 driver=hyaku-inline attempt=1`
- `2026-10-23T06:16:12-03:00 complete kumitate round=46; hyaku-inline attempt=1`

This session ran its own commands on 2026-10-23 between 09:10 and 09:30Z. It also used five read-only reviewer seats
(Close46Claims, Close46Chrono9, Close46Harm697, Close46SourcesAppend, Close46SpotSrc). All five completed; none died
and none was resent. No sibling gate, selftest or counter was executed. No tools were installed.

## 1. Conformance (step 1)

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %H' -- .ufo/reports/round-46/kumitate.md` | `kumitate-shokunin 445eb71a20882440499119c4355cdf7a8d0f64c4`, committed 06:15:50 -03, after the lane tip (06:15:14 -03) | ok |
| `SHONEN` heading, one line per box | read report:91-96 | 4 lines (`[~]`,`[~]`,`[ ]`,`[ ]`), each with a pointer | ok |
| cited hashes exist and are ancestors of `master` | `git merge-base --is-ancestor <h> master` for 7cd1fa37, 516977af, 3b184d3a, cacfab32, e0c18785, 980a16af, adedf671, 9b33e03e | 8 × ok | ok |
| cited control commits | `git cat-file -t 7af3d978` (report:83). The receipts also cite 9800b17f, 3f5dd9f6 and 76df5c28 | `fatal: Not a valid object name` for all four. They are scratch-clone commits | defect R46-4 (minor) |
| pushed, nothing uncommitted | `scripts/hyaku/jj-lane.sh state …` ; `git status --porcelain` | `local=remote=9b33e03e… ahead=0 behind=0 tracked=0 untracked=0` ; empty | ok |
| remote ref | `git ls-remote origin refs/heads/master` | `9b33e03ed06e08af1d1c4e1a3cfb0f6abea9fab0` | ok |
| prompt carries the template contract | `diff <(head -140 prompt) templates/round-prompt.md` | only `{{LANE}}`, `{{ROUND}}`, `{{FLEET_ROOT}}` and `{{AXES}}` substitutions differ; the §6 hyaku addendum is appended at :141 | ok |
| cancelled seats not cited | `git grep -n 'MutCapRun\|ReviewRepairs\|HarmChecks' 9b33e03e` plus the report | the names appear only at report:113 and `lessons/round-46.md:104`, each time as "cancelled at close, no report cited". LOG, SCORECARD and plan have 0 hits | ok |

Not a marker: eight lane commits carry checkable work.

## 2. Claim C1 — operability (O1 `GITENV_CANARY`, O2 `CAPRUN_PROBE`)

**Re-measured by this session over committed bytes:**
- `git show <rev>:scripts/{cite-check,proxy-check,round-gate}.mjs | grep -c GIT_INDEX_FILE` gives 0/0/0 at `2b2bf7bb`
  and 3/3/3 at `9b33e03e`.
- Each scrub runs on the `--selftest` path before any fixture:
  - `cite-check.mjs:1847-1858`, with its canary case at `:2515-2531`
  - `proxy-check.mjs:1524-1535`
  - `round-gate.mjs:695-706`
- `git cat-file -e <rev>:scripts/cap-run.mjs`: absent at base, present at the tip (416 lines). The tip file contains:
  - `MemoryMax`, `MemorySwapMax=0` and `TasksMax` at `:163-164`
  - an explicit `{PATH, XDG_RUNTIME_DIR}` environment, plus `env -i` and `bwrap --clearenv`, at `:89-92` and `:161-167`
  - `--unshare-pid --die-with-parent --new-session` at `:167`
  - a budget timer at `:198-203`
  - a scope kill at `:170-172` and `:222-223`
  - SIGTERM/SIGINT handlers at `:204-211`
- `SOURCES.md` row count (`grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|'`): 77 at base, 79 at the tip.

**Evidence-verified (counter receipts; the counters were not executed):**
- Base: `probe/receipts/c1-base.txt` reads `GITENV_CANARY rev=2b2bf7bb… held=0/3` exit=1. `c2-base.txt` reads
  `CAPRUN_PROBE rev=2b2bf7bb… held=0/6` exit=1. The A4 re-score is in `controls-A3.txt`.
- At the C1 commit: `close/o1-c1.txt` reads `GITENV_CANARY rev=980a16afc7ca… held=3/3` exit=0 (08:54:15Z).
  `close/o2-c1.txt` reads `CAPRUN_PROBE rev=980a16af… held=6/6` exit=0 (08:54:24Z).
- At the record commit `adedf671`: `o1-final.txt` 3/3 and `o2-final.txt` 6/6.
- `git diff e0c18785 9b33e03e -- .ufo/waves/round-46/probe/` is empty: the counters are frozen from A4 on.
- The predicate labels `CANARY_HELD` and `CAP_HELD` read the same in plan A2/A4, in the counter headers and in the
  receipts.
- Residual seats: ReRunCounters agrees. MutC1Scrub killed 5/5. ReviewC1Diff is sound, with two low findings (R46-5).
- `close/proxy-strict.txt` reads `PROXY: MATCH (A=21 C=22 operability=9; … C2=104/104 …; pins=6 match)` exit=0.

### Ruling — is the counter re-design scoring under §9? (CritAmendments objection 3)

**Not violated.** Evidence (Close46Chrono9, re-checked against the commit times):
- The wave was dispatched at 08:17:13Z (`build/swarm-registry.json` `createdAt`), with the frozen tip at A1 `516977af`.
- The amendments were committed at A2 08:27:31Z, A3 08:31:49Z and A4 08:53:53Z.
- Each amendment followed a control that met the counter then frozen:
  - CtlC1PathKeyed and CtlC1Replay met it, giving A2.
  - CtlC2LabelKeyed (`7af3d978`, 6/6 ×3) met it, giving A3.
  - CtlC1Replay-with-launches (`9800b17f`, 3/3) met it, giving A4 (`controls-A3.txt:170-175`).
- This is the procedure §9 prescribes: "score it with the frozen counter … if it meets the target, the counter or target
  is wrong — fix it before data".
- Every plan change is append-only (+41/−0, +14/−0, +15/−0), and every counter change adds conditions:
  - hostile run B
  - strict-environment (e)
  - fault runs
  - cgroup and pid-namespace identity
  - observation from `/proc` outside the runner
- No target moved. A1's randomized draws are the only non-monotone parameter change: at M=176/B=4 they allow 11 s
  against the fixed 10 s. A1 landed before the wave was dispatched.
- The build executors ran only their own development checks. `build/ExecC1Scrub.md:30` reads "Own hostile smoke (NOT
  the frozen counter …)" and `:50` reads "frozen counter … Not exercised … (data rule)". `ExecCapRun.md:40` reads "Not
  run (data rule)".
- A development check is not a score of the claim's counter. Each later rule only adds conditions, so tuning a candidate
  to an earlier, weaker check cannot help it meet the final rule.
- The first counter score of a committed candidate is `980a16af`, 14 s after A4 landed, and it was scored once, under
  A4.

### Harm check — checklist item `SKILL.md:697` (gate-mutants battery)

**Ruling: a pre-existing load flake, not a harm introduced by round 46.** Receipts at the same load at base do not
exist, so the ruling rests on these observations:
- **Base.** `open/checklists.txt:18` (base `2b2bf7bb`, about 08:01Z, load not recorded) reads `PASS SKILL.md:695 exit=0`.
- **Close.** The committed close receipts show **4 of 4** runs failing, not the "3 of 4" in report:69 and
  `lessons/round-46.md:99`. Each reads `FAIL SKILL.md:697 exit=2 substring=miss`. Recorded loads: run 2 18.96, run 3
  27.39, run 4 55.60 (`close/checklists{,-2,-3,-4}.txt`).
- **Direct run on the close bytes.** `close/gate-mutants-direct.txt` (cite-check sha `7484274f…` = 980a16af) reads
  `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)`.
- **Exit-2 class.** `surface-probe.mjs:241` gives each checklist item 120 s, and a harness kill yields `status=null`,
  not 2. The exit 2 therefore comes from the battery itself. Its exit map (`gate-mutants.mjs:149`) includes `timeout`,
  with a 60 s budget per mutant (`:30`), and `unstable`.
- **Same class before this round, on the same bytes.**
  - `.ufo/waves/round-44/controls/ExecR43ShippedReceipt.md:168` reads `GATE_MUTANTS: ERROR … unstable=2 timeout=1` at
    `b01ded32`. The lesson rules that the wave-census targets there are byte-identical to a CLEAN revision ("load
    sensitivity, not the shipped change", `lessons/round-44.md:105-107`).
  - `round-43/build/CritNoHarm.md:33`: the checklist item exited 2 in 2 of 5 runs at TasksMax=128.
  - R43-1 and R43-5 are still open (`lessons/round-45.md:107`).
- **Round diff linkage.**
  - `gate-mutants.mjs` and `wave-census.mjs` are unchanged.
  - The only battery input that changed is `cite-check.mjs`: a selftest-entry scrub and one added case (75 → 76; floor
    75).
  - The mutated selftests run under `sandboxEnv` (PATH, HOME, TMPDIR, LANG, TZ), so the scrub is inert there.
  - `build/ExecGateMutantsImpact.md` measured mutant rows byte-identical between base and a scrub fixture.
- **Residual.** The checklist receipts drop the battery's stdout, so the exit-2 subclass at close is unobserved (R46-3).
  The author's caution was honest, but it is not evidence of harm.

**Verdict C1: verified.** O1 0/3 → 3/3 and O2 0/6 → 6/6, on counters frozen before data. Capability row `cap-run` is
present in SCORECARD `## Capabilities`.

## 3. Axis verdicts

- **operability — improved.** Both obligations moved from 0 to full on the frozen counters, and capability `cap-run`
  was added. The integer stays at 9 (terminal under the saturating `f_O`).
- **coverage — unchanged** (coverage=10; script, runtime and kimi layers each 10/10 per `close/proxy-strict.txt`).
- **No axis harmed.** `git diff 2b2bf7bb 9b33e03e -- SCORECARD.md` only re-pins three hashes, adds `pin.cap-run`, the
  `| 46 |` move-log row, the `cap-run` capability row and a round-46 section. It also moves the proxy terms A 16→21,
  C 21→22 and C2 102→104, matching `proxy --strict`. No axis value is lowered.

## 4. Discernment spot-check (`lessons/round-46.md` § Gate)

| item | gate decision | re-opened source | agree / disagree | reason |
|---|---|---|---|---|
| S078 (:24) | admit A, mined | nodejs.org/docs/v24.21.0/api/child_process.html; sha256 `fa03f324…` = row pin | agree | the quote is verbatim at HTML :983 and :1598. `cite-check.mjs:1844-1854` relies on exactly this default: spawned children inherit the scrubbed `process.env` |
| S079 (:25) | admit A, mined | raw torvalds/linux v7.2 `cgroup-v2.rst`. Re-fetched by this session: sha256 `a9433bb0e16a…b7ad` = row pin | agree | :1376 `memory.max`. :1381-1383 is verbatim. `cap-run.mjs:73,138` derives its OOM verdict from the stated behaviour |
| S076 (:49-50) | reject; reason re-worded to "redirect wrapper, no manual text" | git-scm.com/docs/gitrepository-layout/2.56.0 → 632-byte meta-refresh page, sha256 `c4cd4197…` = pin | agree | no manual text. The new reason drops the round-45 contradiction with S063 (D3) |
| S073 (:48) | narrowed: "only" removed | nodejs.org v24.21.0 cli.html :4147-4149 | agree | "Sets the max memory size of V8's old memory section." "only" is absent from the located bytes |
| S055 (:45-46) | narrowed: anchor 590-601 → 580-601, teaches narrowed | oh-my-pi `45c35e40…/sqlite-credential-store.ts`, sha256 `11bfdcd9…` = pin | agree | :580 `dbPath = getAgentDbPath()`, :594 `chmod 0o600`, :601 `recoverCorruption: true`. The widened anchor covers what `teaches` claims |

New-row quote checks:
- S078: "Environment key-value pairs. Default: process.env." is 5 words.
- S079: "If a cgroup's memory usage reaches this limit and can't be reduced, the OOM killer is invoked in the cgroup." is
  20 words.

Both are ≤25 words and verbatim, and their used-by paths exist at the tip (`git ls-tree`).

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` prints `W04 S034 …`,
`W04 S068 duplicate url … across scopes`, `kumitate ok …/corpus/SOURCES.md`, exit=0. This is identical to
`open/census.txt` and `close/census-close.txt`. Report:77 names only S068 at open (R46-2).

## 5. Trend verdicts

- **expansion — improved.** S078 and S079 are new tier-A mined rows, opened this round, and code cites them. Capability
  `cap-run` was admitted to SCORECARD.
- **quality — improved.** The details:
  - All 77 rows were re-opened by non-author seats.
  - Thirteen rows were corrected toward their located bytes. Each is logged old→new at `lessons/round-46.md:33-51`.
    The three corrections sampled above re-open as stated.
  - Q33 and Q34 come with commands shown to fail.
  - No entry was found false and left unmarked.
  - The correction mechanism breaches the append-only rule (R46-1). This is a conformance defect: no corrected fact is
    hidden.
- **discernment — improved.**
  - The spot-check agrees with the gate on 2 admits and 3 reject-side decisions.
  - The round-45 disagreements (S073, S076, D2, D4) became Q33, Q34 and narrowed cells.
  - The pre-data control wave caught three counter shortcuts before data.

## 6. Routed defects (the lane fixes these next round)

- **R46-1. In-place SOURCES corrections.** `CORPUS.md:116-118` says "Only `status`, `recheck` and `used-by` change in
  place … A correction is a new row whose `teaches` opens `supersedes S0NN —`".
  - `git diff 2b2bf7bb 9b33e03e -- corpus/SOURCES.md` shows +15/−13: thirteen rows were rewritten in place (S003, S004,
    S013, S041, S047, S051–S055, S061, S073, S076). `git grep -c 'supersedes S0'` finds 0.
  - The round-45 closure's D3 wording ("re-word S076's reason") invited one of these rewrites. That cause is recorded
    against the closure.
  - Fix: append a lesson note that names the 13 rewrites against Rule 2, and land future corrections as `supersedes`
    rows.
- **R46-2. Count defects in the filed report** (append an erratum in the next report; do not rewrite the filed one):
  - report:80 and :88, and the SCORECARD round-46 section, say "15 rows corrected", but the diff and the lesson show 13.
    The other two rows were added.
  - report:69 and the lesson say item 697 failed in "3 of 4" runs. The committed receipts show 4 of 4, and run 4 was at
    load 55.6, not 19–25.
  - report:77 says the open census had "W04 S068", but `open/census.txt` also carries W04 S034.
- **R46-3. Item 697 receipts.** The gate-mutants checklist item is load-sensitive, and that sensitivity predates this
  round (R43-1/R43-5 remain open). Fix: make the checklist receipts keep the battery's stdout (the exit-2 subclass and
  the `timeout`/`unstable` counts) plus the load and wall time. Root-cause it as pre-registered for round 47.
- **R46-4. Unresolvable control commits.** `7af3d978`, `9800b17f`, `3f5dd9f6` and `76df5c28` are cited as control or
  calibration commits but exist only in scratch clones. Fix: commit the control patches, or mark these hashes as
  scratch-only in the receipts.
- **R46-5. ReviewC1Diff low findings.** A verdict-flush race at `cap-run.mjs:182-183`, and the budget regex rejecting
  decimals at `:119`. Address both before round 47 routes child sites through `cap-run`.
- **SHONEN** (operator note): no box is fully checkable by a non-author from this round. The two `[~]` lines are
  author-asserted, and what I observed matches them (`cap-run` registry row and checklist item `SKILL.md:701`; LOG
  round-46 entry with O1/O2 receipts).
