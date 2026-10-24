# Round 44 — verifier spot-check (kumitate)

author: hyaku closure (non-author integrator, @m_opus)

Closure of kumitate lane-round 44. Lane base `6cda8c353c7dd7a890eb20382ffa55fac9daaf6d`, tip
`37e8f66973c54854bea305c842d806e497c64666`, measured commit `d81978cdfefdc7409eb26a6363111d6682154093`;
report `.ufo/reports/round-44/kumitate.md` (fleet `23ed7868f3c7363c2788ff4e9a366413ff045e17`); dispatched
prompt `.ufo/prompts/kumitate-round-44.md` (fleet `2f8bc30`). Driver digest (copied from the mutable
`.ufo/watchdog.log`):

    2026-10-22T22:02:56-03:00 launch kumitate round=44 pgid=3654873 driver=hyaku-inline attempt=1
    2026-10-22T23:01:48-03:00 complete kumitate round=44; hyaku-inline attempt=1

Method: committed bytes only (`git show`/`diff`/`log`/`ls-tree`, `grep`, `sha256sum`, `curl` on the cited
URLs, a tarball grep of the pinned oh-my-pi tree). No lane gate, selftest, counter, proxy or census was
executed by this closure. Five read-only seats (PromptFidelity, C1Receipts, Section9Critic, NoHarmCheck,
SourcesSpotcheck) did the re-checks in parallel. No tool was installed or updated.

## Verdict

**status `ok`, admitted `false` (`rejected-honest-stop`).** The committed receipts reproduce C1's
before→after exactly. C1 still does not verify under prompt addendum §9 on any reading. Under the frozen
p44d, three committed skip-work programs read `MET 207/207` after data, which fires plan kill rule 2. p44d
itself was replaced after seats had scored, so it is not the claim's rule. The last counter frozen before
any seat scored was p44b, and skip-work controls met it too. No axis was harmed. The author's no-harm
claims (proxy DRIFT→MATCH, Q29) hold.

## Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report landed by lane identity | `git log --format='%an %H %ci' -- .ufo/reports/round-44/kumitate.md` | `kumitate-shokunin 23ed7868… 2026-10-22 23:01:30 -0300`, after the lane tip (23:00:44) | pass |
| `SHONEN` heading, one line per box | `grep -c '^- \[' SHONEN.md` → 4; report `## SHONEN` → 4 lines (`[ ]`×2, `[~]`×2) | 4 = 4 | pass |
| cited lane commits exist and are ancestors | `git merge-base --is-ancestor <h> master` for 6cda8c35, 361d4492, 292d9266, 28e29bbe, 32b7fd56, d81978cd, bde1086e, 8e822511, 37e8f669 | 9/9 resolve to commits and are ancestors | pass |
| pushed, nothing uncommitted | `scripts/hyaku/jj-lane.sh state …` | `branch=master local=remote=37e8f669… ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` empty; `ls-remote` `37e8f669…` | pass |
| prompt carries the template contract | `diff templates/round-prompt.md .ufo/prompts/kumitate-round-44.md` | only placeholder hunks plus the §6 addendum append (P:141–365). All round-level items are present: binding P:3–7, claims P:14–17, L2 P:82–88, commit-then-push P:133–134, push scope P:135–137, L0 P:138–140. All five child-lane items are present: report path P:101, lands-last P:318, SHONEN P:118–119, hash rule P:107–108/274–275, write scope P:252–257. No L2 route map is quoted | pass |
| census | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` | `kumitate W04 S034 duplicate url …` / `kumitate ok …/corpus/SOURCES.md`, exit=0 | pass (W04 is a warning) |

Conformance observations (status-neutral):
- `361d4492` has author date 20:27:29 -03, before the 22:02:56 launch. Its committer date, 22:14:51, is
  after the launch. This matches jj's change-creation timestamp and is not a defect.
- The report's `Round shape` names 19 cancelled seats and 2 holds; this closure does not rely on
  their partial files.

## Claim C1 — operability, capability `omp-census` (counted, not exploratory)

The predicate was declared before data at `361d4492:.ufo/waves/round-44/plan.md:35-43`. A case passes iff
the census exits 0 with exactly one `OMP_CENSUS: CLEAN` line and no DRIFT line, or the symmetric DRIFT
case. MET iff every case passes and there are at least 20 cases. Kill rule 2 is at `plan.md:99`: "Any
control above reads MET (before data → redesign; after data → C1 fails)".

**Re-measured over committed bytes (this closure):**

- `git show 32b7fd56:.ufo/waves/round-44/probe/p44d-count.mjs | sha256sum` →
  `9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e`. This matches
  `open/p44d-before-6cda8c35.txt:3` and `final/p44-measured-d81978cd.txt:2,5`. Shape tsv
  `fcf9fcb6…` is byte-identical from 361d4492 to 37e8f669.
- `git show d81978cd:scripts/omp-census.mjs | sha256sum` → `fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7`.
  The bytes are identical at 37e8f669, so measured equals shipped. `SCORECARD.md` `pin.omp-census` holds the same value.
- Before: `grep -c '^CASE '` gives 207, with 0 `P44=PASS`. Summary line:
  `P44_COUNT: UNMET (passed=0 cases=207 floor=20 census_sha256=absent)`, `exit=1`.
  After: 207 cases, 207 `P44=PASS`. Summary line: `P44_COUNT: MET (passed=207 cases=207 floor=20 census_sha256=fd4d1c4e…)`,
  `exit=0`, seed `2676cbe767adc1820fd316e02a7b9020`. Both match report lines 56–60.
- The `casePasses` function text is identical in p44, p44b, p44c and p44d (pairwise diff;
  sha256 `a9c2038e…`). `plan.md` changed only by appended redesign sections between 361d4492 and 32b7fd56,
  and not at all between 32b7fd56 and 37e8f669. The predicate sentence and kill-rule text were never amended. The case set and
  target changed: 59 → 87 → 150 → 207.

**Evidence-verified (seat receipts, not re-executed):** census `--selftest` 29/29
(`controls/ExecCensusBuild.md:15`, `final/p44-dev-runs.txt:11-12`). ReRunBefore and ReRunP44Replay
reproduce the CASE lines. ReRunP44Fresh and ReRunP44Load each read 6/6 MET.

**Why C1 does not verify (§9, prompt P:352–360).** Counter history, with the time each counter was frozen:

| counter (commit, -03) | had any seat scored before it? | skip-work control that met it | evidence |
|---|---|---|---|
| p44 (361d4492, 22:14:51) | no | label shortcut found by L1 analysis | `plan.md:140-144` |
| p44b (292d9266, 22:16:44) | no — last rule frozen before any seat scored | CtlLabelKeyedA, CtlLabelKeyedB `MET (passed=87 cases=87)` | `controls/CtlLabelKeyedA.md:1`, `CtlLabelKeyedB.md` |
| p44c (28e29bbe, 22:28:49) | yes (control wave) | CritV3LabelB, CritV3Boundary `MET (passed=150 cases=150)` | `residual/CritV3Boundary.md:1`, `CritV3LabelB.md` |
| p44d (32b7fd56, 22:37:50) | yes (control and residual waves) | CtlPostDataA: three programs `MET (passed=207 cases=207)` after the counted run | `falsify/CtlPostDataA.md:1,15,38,61,86` |

- **Strict §9 reading.** "A rule changed after any seat has scored is not the claim's rule." By that
  sentence, p44c and p44d are not C1's rule, which leaves p44b. Skip-work controls met p44b, so C1 fails.
- **Author's reading.** The author treats p44d as frozen before data on the census. On that reading,
  kill rule 2 fired after data. CtlPostDataA's three programs are committed verbatim (sha256
  `73f89139…`, `c1b47177…`, `5360e5ab…`, matching their receipt headers). Their receipts bind the frozen
  p44d sha and seed. The programs replace per-member rules with a catalogue of whole-shape projections.
  They accept `qqdwgo`, `ddfnts` and `agenta` in place of `agents/`, so they skip the claimed work. C1 fails.
- **Third redesign not data-free (confirmed).** Under frozen p44c, CritV3Boundary scored a
  work-equivalent program (`no-base-presence.mjs`, `MET 150/150`, `census_sha256=eec94a3b…`). That
  receipt was committed at 32b7fd56, before the p44d freeze took effect. ExecCensusBuild also ran a
  candidate census (`5626f07f…`) on a non-frozen harness (`DEV_HARNESS cases=87 passed=87`). The
  statements "still no census scored" (plan) and "ZERO frozen runs on any candidate census bytes"
  (`final/p44-dev-runs.txt`) are therefore overbroad. No frozen run on the exact `fd4d1c4e` bytes
  preceded the counted run, so the counted run is the first run on the measured bytes, and it was not
  chosen best-of-N.
- C1 was never declared exploratory. `plan.md:86` holds only a conditional escape, and no non-author
  judgment was requested. `unprovable-but-better` is therefore not available.

Not harmed: see below. CtlPostDataB (the `extensions` rule dropped, still MET) concerns a member outside the
frozen root (`plan.md:88-94`). It is not needed to decide C1.

## No-harm re-check (independent of the author)

- **Axis integers.** `git diff 6cda8c35 37e8f669 -- SCORECARD.md` changes no `## Axes` row. operability 9;
  coverage 10 (retired); script-layer, runtime-layer and kimi-layer 10. All are byte-identical.
- **Proxy stanza recount.** I read the proxy's counting rules in `scripts/proxy-check.mjs:930-933` and
  did not run the script. Recount over `git ls-tree -r`:
  - `A` 11 → 16. The new files are `scripts/omp-census.mjs` plus 4 `.ufo/waves/round-44/probe/p44*.mjs`.
    The base 11 already included the round-43 probe `c1-discriminators.sh`.
  - `C` 19 → 21 (SKILL items 20–21).
  - `C2`/`C2_total` 96 → 99, with declared equal to computed at the tip.
- **DRIFT → MATCH cause verified.** At 6cda8c35, `corpus/lessons/round-43-verifier-spotcheck.md` (added by the
  round-43 closure) had no README row: `git show 6cda8c35:corpus/README.md | grep -c round-43-verifier` → 0.
  The proxy computed 97 against a declared 96, and `floor(10×19/19×96/97)` = 9 reproduces `AXES_DRIFT coverage 10/9`.
  At 37e8f669 the row exists and the stanza is 99/99. The MATCH receipts at d81978cd and 8e822511
  (`falsify/ReviewNoHarmGates.md`) are evidence-verified, not re-run.
- **`scripts/proxy-check.mjs` diff.** The diff is one added line, `'pin.omp-census': 'scripts/omp-census.mjs'` in `GATE_PINS`.
  It adds a pin and relaxes nothing. Both `pin.omp-census` and `pin.proxy-check` equal the tip file sha256.
- **Q29.** The command is pure `git` and `grep`, and this closure ran it.
  - Round 44 (`controls-v4/` at 32b7fd56): the order check is OK, grep exits 1 (no MET/CLEAN), and 44
    receipts read UNMET → PASS.
  - Round 43 (`build/ExecJunkControls.md` at fb3eab40): it hits `:26 GATE_MUTANTS: CLEAN` → FAIL,
    as the lane documented. The rule can fail.
  - Caveat: round 44's control receipts share commit 32b7fd56 with the counter they score. They predate
    the measured commit, but no earlier commit holds them.
- **Existing gates untouched.** `git diff --name-status` shows no existing gate script modified apart from the
  one-line proxy pin. LOG +7/-0, lessons/round-43 +12/-0, QUALITY +29/-0, README +5/-0 and SOURCES +9/-0
  are all appends.
- **Census read-only shape.** `runCensus` uses only `lstat` and `readdir`, and `readFileSync` is not
  imported. Writes and `rmSync` exist only in `--selftest`, which works in a `mkdtemp` scratch directory.

## Per-axis verdicts

| axis | verdict | basis |
|---|---|---|
| operability | unprovable | C1 counted claim not verified (§9, above); census exists and is shape-only; integer held 9 (terminal); not harmed |
| coverage (retired) | unchanged | `C2`/`C2_total` 96 → 99 are README rows (round-43 spot-check row, new entry, lessons), unclaimed; integer 10 unchanged |
| coverage:script-layer | unchanged | `S_members`/`S_sections` not in the SCORECARD diff |
| coverage:runtime-layer | unchanged | `R_members` not in the SCORECARD diff |
| coverage:kimi-layer | unchanged | `K_members`/`K_sections` not in the SCORECARD diff |

## Discernment spot-check

Sample from `corpus/lessons/round-44.md` `## Gate` (lines 58-95 at 37e8f669). Every item was re-opened
live on 2026-10-22 by this closure's seat SourcesSpotcheck. Word counts use `printf '%s' "<quote>" | wc -w`.

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S053 | admit (A, mined) | raw.githubusercontent.com oh-my-pi@45c35e40 `packages/utils/src/dirs.ts` (HTTP 200) | agree | file sha256 `2d423f4f…` = row pin; line 1007 quote verbatim, 8 words; primary code at the installed tag (Q2) |
| S054 | admit (A, mined) | same commit, `packages/utils/src/sqlite.ts` (HTTP 200) | agree | sha256 `4a60657a…` = pin; :193 quote verbatim (4 words); :197-200 `chmodSync(…, 0o600)` then `copyFileSync`, matching the corrected locator |
| S056 | admit (A, mined) | https://www.sqlite.org/wal.html (HTTP 200) | agree | body sha256 `f3467b53…` = pin; § 4 quote verbatim (15 words) |
| S059 | reject (B) | https://cmux.com/docs/agent-integrations/oh-my-pi (HTTP 200) | agree | quote present verbatim (6 words); vendor docs about its own installer. OMP's own code is primary for `extensions/`: `discovery/builtin.ts:516` `discoverExtensionModulePaths(ctx, path.join(dir, "extensions"))` and `:608`. Minor: body now hashes `4594c59e…`, not the row's `424524b5…` |
| `omp-crash.log` | reject (unsourced case) | oh-my-pi tarball @45c35e40, full-tree grep `CrashLogPath\|omp-crash.log` | agree | definition only, at `dirs.ts:1052-1054`; zero callers write it. The lane wrote 1052-1055, but 1055 is `}` |

SOURCES.md rows: `git show 6cda8c35:corpus/SOURCES.md | grep -c '^| S[0-9]'` → 52; at 37e8f669 → 61 (S053–S061).
Newly written rows were re-opened and their ≤25-word quotes checked: S053 = 8, S054 = 4, S055 = 3,
S056 = 15, S057 = 4, S058 = 10, S059 = 6, S060 = 7, S061 = 12. Each count equals the one stated in
the gate. S061's quote ends mid-parenthesis ("…(pre-edit copy"), but it matches the row and the gate.

Result: 3 admits and 2 rejects sampled, 5/5 agree.

## Trend verdicts

- **expansion — improved.** Nine new rows (S053–S061) and a new knowledge entry
  (`corpus/knowledge/omp-agent-root.md`) open the OMP agent-root ground. This closure re-opened the five
  sampled sources and verified their quotes and pins.
- **quality — improved.** Several held statements that were wrong are now corrected:
  - The `gate-mutants` capability row, which rested on unverified evidence, now records the round-42/43
    miss and the shipped-tip `ERROR frozen=38/41` receipt (R43-3, R43-4).
  - The proxy stanza moves from DRIFT to MATCH. This closure verified the cause and recounted the stanza.
  - The S054 and S057 locators are fixed in their rows.
  - Round-43 errata are appended, not rewritten.
  The author graded this trend `unchanged`. This closure grades the held corpus on its corrections, not on
  the failed claim.
- **discernment — improved.** The outside spot-check agrees with the gate on all sampled items: 3 admits
  and 2 rejects. The `omp-crash.log` reject is confirmed by an exhaustive grep of the pinned tree.

## Routed defects (kumitate owes these next round)

1. **R44-1 counter memorisable.** p44d's CLEAN shapes are few and enumerable, so a catalogue of
   whole-shape projections meets it (`falsify/CtlPostDataA.md`). Before freezing, the next counter must
   be scored against CtlPostDataA's three programs, CtlLabelKeyedA/B and CritV3LabelB/Boundary, and must
   fail all of them. Every CLEAN case needs fresh legal variation or a held-out shape.
2. **R44-2 provenance statements.** Append errata to `plan.md`, or to the lesson, for "still no census
   scored" and for `final/p44-dev-runs.txt` "ZERO frozen runs on any candidate census bytes". Frozen p44c
   scored `no-base-presence.mjs` MET 150/150 before the p44d freeze. Commit Q29 control receipts in a
   commit earlier than the counter they score, not in the same one.
3. **R44-3 counter sandbox (two HIGH findings).** SentinelSandboxEscape: bwrap PID 1's environ
   carries the launcher's environment. SentinelProcLeak: the V8 cap does not bound native memory,
   207 × 20 s exceeds `timeout 600`, and the work dir survives SIGTERM. Repair both before any further
   counted run.
4. **R44-4 owed review.** Of the 19 seats cancelled at wrap-up, these left their findings absent:
   ReviewCensusCode, SentinelCensusNoRead, SentinelCensusEdges, MutCensusP44, CritCensusVsDomain,
   ExecChecklistPass, MutChecklistBlindness, ReviewR43Repairs. The census's own selftest catches 26/68
   mutants (MutCensusSelftest).
5. **R44-5 proxy `A` counts round probes.** `A` 11 → 16, but 4 of the 5 new files are throwaway
   `.ufo/waves/round-44/probe/p44*.mjs` counters, and round 43's probe was already counted. Either
   restrict `RE_RUNNABLE` to shipped instruments or record the definition. The integer is terminal at 9,
   so it did not move.
6. **R44-6 record minors.** Six items:
   - The SCORECARD Move-log row `| 44 |` sits between `| 43 |` and `| 42 |` in a table ordered newest first.
   - The round-44 section says `C2 96 → 98`; the stanza reads 99.
   - The S061 gloss and a census note comment say "operator" where the source says the orchestrator.
   - The S059 body pin is not reproducible now (`4594c59e…`).
   - "Q2 primary-first" is shorthand; Q2's text says citation and tier rules.
   - The `omp-crash.log` locator should be 1052-1054.
7. Still open from round 43: R43-1 (gate-mutants counter gameable) and R43-5 (MutCiteWitness 4/4
   survivors). Shipped-tip `GATE_MUTANTS: ERROR` exit 2.

## Notes for the operator

The report's SHONEN boxes are `[ ]`×2 and `[~]`×2. None is checkable by a non-author this round: box 2
cites the `omp-census` live run, and the capability that run would demonstrate did not verify.
Promotion stays operator-owned. This is the lane's third consecutive rejection (r42, r43, r44). The
verdict above was reached on the frozen rules alone, and the driver consequence is operator-side.
`pin.omp-census` adds a fifth key to the `kumitate-gate-pins-v1` block while L0 `9a00d09` on that block
is still open (ReviewProxyGatePins F1).
