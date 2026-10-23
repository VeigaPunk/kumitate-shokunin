# Round 44 — a census of the OMP agent root, and a counter that controls tried to fool first

Source: S053–S058, S060, S061 (opened this round; S059 opened and rejected), the round-43 non-author
closure (`corpus/lessons/round-43-verifier-spotcheck.md`, routed defects R43-1..R43-6). Round open:
lane 6cda8c353c7dd7a890eb20382ffa55fac9daaf6d. Plan: `.ufo/waves/round-44/plan.md` (first frozen at
361d44927acccae721dad3fdc6c9a81a7089126e; three pre-data redesigns at 292d9266, 28e29bbe and
32b7fd561dae38b951828dde8fe11052737fb824). Measured commit d81978cdfefdc7409eb26a6363111d6682154093;
counted-run receipt bde1086ea727fa4a946f46aebb3dbf04f3d2857a.

## Claims

- **C1 operability — capability `omp-census`.** A new lane gate, `scripts/omp-census.mjs` (contract
  `kumitate-omp-census-v1`), reads the depth-1 shape of `~/.omp/agent` — names, kinds, permission
  bits, never contents — and prints `OMP_CENSUS: CLEAN` (exit 0) or `OMP_CENSUS: DRIFT` (exit 1) from
  per-member rules: 19 base members plus 6 optional OMP-named directories, each by exact name with a
  kind and a permission ceiling; four writer-attributed chain families anchored to their owners;
  optional SQLite sidecars. Axis by surface: the lane's runnable instruments gain a gate (AXES:
  "scripts that run … produce the stated outcome"). Anti-loop: rounds 42–43 were rejected on
  `gate-mutants`; this round claims nothing there.
  - **Predicate P44** (plan § P44, `casePasses` in every counter version, receipt label `P44`): a case
    passes iff the census, alone in a bubblewrap sandbox with its own file and the case's shape mirror,
    exits 0 with exactly one `OMP_CENSUS: CLEAN` line and no DRIFT line when the case expects CLEAN, or
    exits 1 with exactly one DRIFT line and no CLEAN line when it expects DRIFT; MET iff every case
    passes and there are at least 20.
  - **Before (do-nothing, round-open bytes, census absent):** `open/p44d-before-6cda8c35.txt` →
    `P44_COUNT: UNMET (passed=0 cases=207 floor=20 census_sha256=absent)` exit 1 (re-derived by
    ReRunBefore, identical CASE list).
  - **After (counted run, the first frozen-counter run on any census bytes):**
    `final/p44-measured-d81978cd.txt` → `P44_COUNT: MET (passed=207 cases=207 floor=20
    census_sha256=fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7)` exit 0, counter
    p44d sha256 `9ea97d86…`, shape `fcf9fcb6…`, seed `2676cbe767adc1820fd316e02a7b9020`, load 9–10.
  - Sources the census rules rest on: S053 (OMP member names), S054/S055 (corrupt chains, agent.db
    0600), S056 (sidecars optional), S057 (REA backups), S058/S061 (operator chains), S060 (members
    named outside `dirs.ts`, incl. `extensions/`).

## The counter, and the three replacements before data

The plan froze a predicate and a case generator before any seat ran, with a kill rule: if a program
that skips the claimed work reads MET, the counter is replaced before any census is scored, never
amended. That rule fired three times; the predicate text never changed.

| counter | cases | what read MET without the work | found by |
|---|---|---|---|
| `p44-count.mjs` (361d4492) | 59 | a census that says DRIFT on a `zq` prefix or `.orig` suffix (fixed stray labels) | L1, before dispatch |
| `p44b-count.mjs` (292d9266) | 87 | global directory count + global 600/644 split + a reject for the fixed crossgen target `RULES.md.*`; 19 names + global mode sum | CtlLabelKeyedA, CtlLabelKeyedB (control wave) |
| `p44c-count.mjs` (28e29bbe) | 150 | a bag of per-entry (sorted name characters, kind, mode) (`agents` → `stagen` passes); sourced members with no kind or ceiling rule; no ceiling on 0644/0755 members; unanchored chain ends | CritV3LabelB, CritV3Boundary (residual) |
| `p44d-count.mjs` (32b7fd56) | 207 | — 44 controls read UNMET (`controls-v4/`) | — |

What each replacement added: random attributes for added entries and a random crossgen target
(aggregates and fixed labels stop working); `swap` (two members exchange kind and mode — every
aggregate over the set is unchanged); `anagram` (identity by name, not by character bag); `wide` on
every member and every sidecar and generation; `junkgen` (end anchoring); `srckind`/`srcwide`
(the sourced members carry rules too); six sourced CLEAN cases (members OMP creates but the snapshot
lacks, so a snapshot cannot pass); a seeded HMAC stream (`--seed` replays a run exactly) and a
21-row `--selftest` (P44 clause truth table, MET rule, replay) — CritClaimSizing objections 1–2;
CritV3ClauseDrops: all 8 clause drops caught.

## Gate — admits and rejects

- **Admit S053** (https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/dirs.ts;
  code, tier A, `new → mined`). Opened 2026-10-23 (seats ScoutOmpUpstreamPin, ScoutOmpDirs, ScoutOmpDbFiles; L1
  re-read). Quote, line 1007: "/** Get the custom themes directory (~/.omp/agent/themes). */" (8 words).
  Criterion Q2 (primary code at the installed release) and Q8 (tag = installed `omp/18.12.6`; identical on main).
- **Admit S054** (…/packages/utils/src/sqlite.ts; code, A, `new → mined`). Opened 2026-10-23. Quote, line 193:
  "const backupPath = `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`;" (4 words). Q2.
- **Admit S055** (…/packages/ai/src/auth/sqlite-credential-store.ts; code, A, `new → mined`). Opened 2026-10-23.
  Quote, line 594: "await fs.chmod(dbPath, 0o600);" (3 words). Q2.
- **Admit S056** (https://www.sqlite.org/wal.html; docs, A, `new → mined`). Opened 2026-10-23T01:20Z (seat
  ScoutSqliteWal) and 01:40Z (L1), HTTP 200. Quote, § 4: "Usually, the WAL file is deleted automatically when
  the last connection to the database closes." (15 words). Q2.
- **Admit S057** (https://registry.npmjs.org/rea-agents/-/rea-agents-6.7.0.tgz; code, A, `new → mined`). Opened
  2026-10-23 (seat ScoutReaBackup; L1 re-read). Quote, `dist/application/SetupRecoveryBackup.js` line 36:
  "const recoveryPath = `${firstBackupPath}.${digest}.recovery`;" (4 words). Q2.
- **Admit S058** (fleet `.ufo/waves/hyaku/PHASE4.md` line 112 at fleet 84b9519a; own-work, tier B, `new → mined`).
  Opened 2026-10-23 (L1). Quote: "pre-restore snapshot `agent.db.pre-restore-20261023T004529Z{,-wal,-shm}`; restored
  through the SQLite backup API (`.restore`)" (10 words). Tier B, not A: an operator incident record, the only
  record of a writer no code implements (Q4 marks the attribution as the record's, not an observation).
- **Admit S060** (oh-my-pi v18.12.6 tree, files outside `dirs.ts`; code, A, `new → mined`). Opened 2026-10-23
  (seats ScoutOmpDirs, ScoutOmpUpstreamPin; L1 re-read of each locator). Quote, `discovery/builtin.ts` line 423:
  "const userRulesFile = path.join(ctx.agentDir ?? getAgentDir(), \"RULES.md\");" (7 words). Q2.
- **Admit S061** (fleet `scripts/hyaku/lane-addendum.md` lines 82-84 at fleet 4248e924; own-work, B, `new → mined`).
  Opened 2026-10-23 (L1). Quote: "the orchestrator set `\"enabled\": false` in `~/.omp/agent/mcp.json` at 10:12 -03
  (pre-edit copy" (12 words). Same tier reasoning as S058.
- **Reject S059** (https://cmux.com/docs/agent-integrations/oh-my-pi; docs, B, `rejected`). Opened 2026-10-23T01:41Z
  (L1), HTTP 200, body sha256 `424524b5…`. Quote: "The extension is written to
  ~/.omp/agent/extensions/cmux-omp-session.ts" (6 words). Missed Q2: vendor docs about its own installer; OMP's
  own code is the primary source for the agent-root member `extensions/` (S060 `discovery/builtin.ts` lines 516
  and 608). The reject changed the census: `extensions/` entered as an optional member sourced to S060, not to
  S059. Flip: none for this scope.
- **Reject (not a sourced case) `omp-crash.log`**: `dirs.ts` lines 1052-1055 define the path, but no caller at
  v18.12.6 writes it (`grep -rn CrashLogPath` → the definition only). Dropped from the counter's sourced cases
  before freezing p44c. Flip: a caller that writes it.

Registry changes logged old → new: S053–S058, S060, S061 added `mined`; S059 added `rejected`. No pre-round row
changed.

## Routed defects (round-43 closure R43-1..R43-6) — dispositions

- **R43-1** (gate-mutants counter gameable): not re-claimed (anti-loop). The remedy the closure named — one run
  prefix, nothing listable, nothing to key on — is the P44 sandbox design (bwrap, fixed `/c` and `/r`, cleared
  environment, fresh tmpfs; SentinelSandboxEscape: no case-scoped channel). The gate-mutants counter is unchanged
  and its gameability stays open.
- **R43-2** (A1 timing, route attribution): appended `## Round-44 routed corrections` to `corpus/lessons/round-43.md`.
- **R43-3** (measured ≠ shipped): seat ExecR43ShippedReceipt ran the round-43 frozen counter once over the
  shipped tip b01ded32: `GATE_MUTANTS: ERROR (mutants=43 killed=40 frozen=38/41 … unstable=2 timeout=1)` exit 2
  (`controls/ExecR43ShippedReceipt.md`); the three non-kills are wave-census mutants whose file is byte-identical
  at 84cb1d5d and b01ded32 (load sensitivity, not the shipped change). Recorded in the capability row.
- **R43-4** (capability row `gate-mutants`): the row now records that the claim did not verify in rounds 42 and
  43, and the shipped-tip ERROR receipt.
- **R43-5** (witness single points; both verdict lines): MutCiteWitness ran the owed mutants on the shipped tip:
  4 of 4 survive (witness return, failure comparison, FAIL literal, primary-only switch;
  `controls/MutCiteWitness.md`). Open. P44 rejects a run that prints both verdict lines (selftest rows
  `p44-clean-plus-drift`, `p44-drift-plus-clean`).
- **R43-6** (receipts name earlier runs; report minors): appended to the round-43 lesson; the round-43 report's
  duplicate `b01ded32` line and dangling sentence are corrected in this round's report (the filed report is not
  rewritten).
- Round-43 repair of the proxy: `proxy-check --strict` read `DRIFT (C2_TOTAL_DRIFT … AXES_DRIFT coverage 10 → 9)`
  at round open (the closure's spot-check file had no README row); the row is added and the proxy reads MATCH at
  the measured commit.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| a skip-work control met the counter | round 43: J4 `GATE_MUTANTS: CLEAN` (`.ufo/waves/round-43/build/ExecJunkControls.md:26`); round 44: CtlLabelKeyedA and CtlLabelKeyedB MET under p44b, CritV3LabelB and CritV3Boundary under p44c | §9 control rule (r43: not applied before data); r44: the plan's pre-data kill rule | QUALITY Q29 (named controls scored and committed before data; a hit replaces the counter or makes the claim exploratory). Shown able to fail: the Q29 command exits 1 on round 43 (J4 receipt at `fb3eab40`, before measured `84cb1d5d`; ScribeQ29) and prints nothing for round 44's `controls-v4` |
| a counter whose cases perturb one member at a time | p44b: global aggregates (directory count, mode sum) caught every single-member change without any per-member rule | control wave (CtlLabelKeyedB) | `swap` cases (attribute permutations keep every aggregate) and `anagram` cases; random attributes for added entries |
| a fixed label in a generated case | v1 strays `zq…` / `.orig`; p44b crossgen always onto `RULES.md`, strays always 0644 | L1 pre-dispatch; CtlLabelKeyedA | every label randomized from the seeded stream; RESERVED names so a random stray never equals a sourced member (CritV3Expectations) |
| a wrong timestamp in a frozen record | plan § Pre-data redesign heading "01:24Z"; its commit is 01:16:44Z | ReviewCounterVsPlan F4 | the commit time stands; corrected in the third redesign section; future headings cite the commit, not a clock reading |
| a sandbox that leaks the launcher's environment | `/proc/1/environ` inside the counter's bwrap holds the host environment (token names and lengths seen; values not printed) | SentinelSandboxEscape (HIGH) | the frozen counter is not edited after data; the next counter passes an explicit minimal `env` to `spawnSync('bwrap', …)`; open limit below |

## Open limits

- The counter measures discrimination over shapes derived from one root at one time (38 entries); members OMP may
  create that the census does not declare (`.tmp` atomic-write leftovers, `skill-descriptions.db.adopt-<pid>`,
  `-journal` sidecars, `config.yaml`, `omp-crash.log`, `ssh.json`, `secret-placeholder.key`) read `UNLISTED`
  (`knowledge/omp-agent-root.md` § What the census does and does not measure).
- Writer attributions (S057, S058, S061) are checked by re-opening the sources, not by the counter.
- p44d's bwrap PID 1 carries the launcher's environment (SentinelSandboxEscape): a census under test could read
  host secrets into its own stdout. The measured census does not touch `/proc` (review below); the counter is
  not repaired this round.
- gate-mutants: R43-1 and R43-5 stay open (MutCiteWitness 4/4 survivors); the shipped-tip receipt reads ERROR.

## Verdict at close (author's reading; the non-author closure rules)

**C1 does not verify.** After the counted run, falsify seat CtlPostDataA built three skip-work programs
that read `P44_COUNT: MET (passed=207 cases=207)` under the frozen p44d (seed `2676cbe7…`): two compare
lossy whole-shape numeric aggregates (an FNV-style name hash summed over entries, weighted by kind and
mode) against a catalog of 18 accepted projections read off p44d's own CLEAN shapes; the third allows
one edit in a normalized name. All accept an unknown replacement for `agents/` (`qqdwgo`, `ddfnts`,
`agenta`) — no per-member table. Under the plan's kill rule 2, frozen before data, that fails C1; the
counter is not replaced again (`falsify/CtlPostDataA.md`). The lesson: a case generator whose CLEAN
shapes are few and enumerable can be memorised as a catalog; every CLEAN case needs fresh, unpredictable
legal variation (or a held-out shape), not only the DRIFT cases.

Also recorded, not decisive:
- **The third redesign was not data-free** (CritRedesignTimeline, CritC1Claim objection 1). Before the
  p44d freeze, ExecCensusBuild ran a candidate census (5626f07f…) on its own non-frozen harness replicating
  p44b's 87 cases (87/87), and residual seat CritV3Boundary scored a work-equivalent program
  (`no-base-presence.mjs`) under p44c (MET 150/150). The plan's "still no census scored" line is wrong.
  The lane census bytes were never scored by a frozen counter before the counted run, and the measured
  census reads MET under every counter version (`final/p44-superseded-counters-d81978cd.txt`: 59/59,
  87/87, 150/150), but skip-work controls also met p44b and p44c, so no version passes §9.
- CtlPostDataB: dropping the `extensions` rule keeps MET (the counter never exercises a member added after
  its freeze). MutCensusSelftest: the census's own selftest catches 26 of 68 mutants.
- SentinelProcLeak (HIGH): the 256 MB V8 cap does not bound native memory (a 6 GiB Buffer census scored
  PASS); 207 × 20 s exceeds the plan's bare `timeout 600`; the work dir survives SIGTERM/`die()`.
  SentinelSandboxEscape (HIGH): bwrap's PID 1 environ carries the launcher's environment (token names seen,
  values not printed).
- Q25 clause-to-case crosswalk (CritC1Claim objection 2): P44 clauses map to `--selftest` rows
  `p44-clean-*`/`p44-drift-*`/`p44-met-*` and to CritV3ClauseDrops (8/8 drops caught, p44c, same text in
  p44d). The frozen plan carried no such map.
- Re-derived and stable: ReRunP44Replay (207 CASE lines byte-identical), ReRunP44Fresh 6/6 MET,
  ReRunP44Load 6/6 MET, ReRunBefore (0/207 identical); CtlMissingVariants 3/3 UNMET; ReviewNoHarmGates:
  every lane gate and selftest green at d81978cd and 8e822511, proxy `--strict` MATCH (DRIFT at round open).
- Source re-opens: S054 locator 197-199 → 197-200 and S057 anchor gained SupportedClients.js (fixed in
  the row this round); S056 grounds `-shm` only via § 6 (append); S060 and S061 quote cells carry `\"`
  escapes; S061's gloss says "operator" where the source says the orchestrator (operator-authorized) — the
  same slip is in a census note comment; `used-by` cells now name the entry and this lesson.
- Proxy gate-pins block (ReviewProxyGatePins F1): adding `pin.omp-census` gives the block a fifth member
  while the operator question on that block (fleet 9a00d09, round-42 D6) is open.

Cancelled at the wrap-up (findings absent, not passed; some left partial report files, not relied on):
SentinelReaper (wave 1), and in wave 2 ReviewCensusCode, SentinelCensusNoRead, SentinelCensusEdges,
MutCensusP44, CritCensusVsDomain, ExecChecklistPass, MutChecklistBlindness, ReopenS053, ReopenS055,
ReopenS058, ReopenS059, ReviewKnowledgeEntry, ReviewR43Repairs, CritCalibration, ReviewWaveCensus,
ScoutRejectCandidates, ScribeLessonDraft, ConnAdjacency. Holds (provider cyber_policy refusal, item ended):
CritV3Channels, CritV3LabelA.
