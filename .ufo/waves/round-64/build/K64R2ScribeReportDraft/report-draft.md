# kumitate — round 64

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, base `6825a51425e91908f019ed65aa2f4209acbd7087`, plan frozen at
`dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` before any `.ready` marker (`bash scripts/plan-before-ready.sh --round 64` →
`PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 … plan=dd1a3e6f… marker=d92cf1ff…`, exit 0;
`.ufo/waves/round-64/close/plan-before-ready-after.txt`), claims measured at the integrated tree `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`.
Push status, the SCORECARD/LOG/SKILL install commit and the filed-report commit are UNMEASURED at draft time (the L1 owns them).

## Work performed

**Declared claims (2, distinct axes, each frozen with a do-nothing control before data):**
- **C1 — operability, capability acquisition `report-receipt-diff`** (frozen `RECEIPT64_HELD`, rule R64, checks P1..P5). Surface moved: a
  new tool `scripts/report-receipt-diff.mjs` (contract `kumitate-report-receipt-diff-v2`, 52-case selftest, 37 committed control cases) that
  diffs a round report against the committed `.ufo/waves/round-N/{base,close}/*` receipts it cites, read at a revision. Unmoved command at the
  base: `test -e scripts/report-receipt-diff.mjs` (absent at `6825a514`). C1 works the lowest non-retired axis (operability 9; the coverage
  family is retired at 10, so the stagnation nudge is not active).
- **C2 — coverage, frontier ground: jj workspaces as seat containment** (frozen `JJ64_HELD`, rule J64, checks J1..J8), sourced on rows
  S198/S199/S200 opened this round. Surface moved: `corpus/knowledge/jj-workspace-seat-containment.md` (21 demo outcome keys, 13 located
  quotes), `PROVINCE.md:21`, `corpus/knowledge/agent-isolation-substrates.md:301` (`Amendment 2026-10-25`), `scripts/jj-seat-demo.sh` v2.
  Unmoved command at the base: `test -e corpus/knowledge/jj-workspace-seat-containment.md` (absent) and `grep -c 'jj-workspace-seat-containment' PROVINCE.md` → 0.
- No exploratory claim. Both claims rest on the stagnation nudge's absence, not on a waiver.

**Work items (evidence pointers):**
- Freeze (`dd1a3e6f`, 101 files, +1598): `plan.md`, `probe/receipt64-probe.mjs`, `probe/jj64-probe.mjs`, `probe/make-receipt-controls.mjs`,
  `probe/jj-donothing-control.sh`, `controls/receipt/` (16 cases), nine `.ufo/waves/round-64/base/*.txt` receipts, `scripts/report-receipt-diff.mjs` v1 (177 L),
  `scripts/jj-seat-demo.sh` v1 (67 L), `assimilation/` collision and quarantine files.
- Wave 1 (41 seats, `w1-dispatch.json`, `w1-results.json`, reports `w1/`): the frozen controls were defective and both counters forgeable. C1's
  P2 demanded `>= 8` distinct finding ids while the frozen 16 controls exercised 6 and the v1 tool defined 7 (eight seats found it
  independently: `w1/K64CriticC1Predicate.md`, `K64ExecReceiptForge.md`, `K64ExecReceiptRealRun.md`, `K64ExecReceiptMutants.md`,
  `K64ReviewProbeC1.md`, `K64MutateProbes.md`, `K64ReviewPlanText.md`, `K64ScribeScorecard.md`); the tool read 20 report-lies CLEAN
  (`K64ExecReceiptForge`); on all 24 real reports 31 finding lines were hand-checked, 7 true and 24 false positives in 12 classes
  (`K64ExecReceiptRealRun`); C2's counter read `JJ64_HELD` 8/8 on four independent forgeries (`K64CriticC2Predicate`) and on a stub demo
  (`K64ExecJjHonestFixture`); the demo was deterministic but not hermetic (`K64ExecJjDemoHarden`, `K64ReviewDemo`, `K64SentinelDemoHost`);
  both counters run the measured tree with operator privileges (`K64SentinelDemoHost`).
- Gate ratchet (declared in the plan before data): tool v1 → v2 (selftest 20 → 52, two new finding ids `RECEIPT_EMPTY`/`TALLY_CHECKS_MISMATCH`,
  eight ids now exercised), demo v1 → v2 (15 → 21 keys, hermetic against inherited `GIT_*`/`JJ_*`/`TMPDIR`), controls 16 → 37 with 21
  post-freeze cases each carrying its `expect` (`.ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md`; `node scripts/counter-pins.mjs` →
  `COUNTER_PINS: CLEAN pins=25`, exit 0).
- C2 build: three captures committed under `build/Capture/`, rows S198–S200 validated in scratch and appended (`corpus/SOURCES.md:150-152`),
  capture pins appended (`.ufo/pins/source-captures.json`), entry drafted and re-grounded (the staged sentence "the seat does not go stale"
  was cut: `w1/K64ScoutStagedJjDiff.md`, `w1/K64ScribeEntry.md`), amendment appended, README/PROVINCE rows landed.
- Wave 2 (39 seats, `w2-dispatch.json`, dispatched 20:41; `w2-results.json` UNMEASURED): fresh reviewers, critics, mutation-testers and scouts
  attack the integrated tree; 5 of 39 reports were on disk at draft time (`w2/K64R2ConnCrossClaim.md`, `w2/K64R2ScoutQuotesS198.md`,
  `S199.md`, `S200.md`, `w2/K64R2ScoutRejects.md`) and their corrections are UNMEASURED until the wave settles.
- Maintenance: `readme-map` DRIFT → CLEAN (`README_MAP: CLEAN files=156 rows=156 covered=156`, exit 0, `.ufo/waves/round-64/close/readme-map-after.txt`); the
  round-start gate `scripts/plan-before-ready.sh` gained a readme-map arm (`PBR_MAP_FROM` default 65) whose red-before receipt is
  `PLAN_BEFORE_READY: FAIL … reason=MAP_DRIFT … map_first=uncovered:lessons/round-63-verifier-spotcheck.md`, exit 1 at the plan commit with
  `PBR_MAP_FROM=64` (`.ufo/waves/round-64/close/plan-before-ready-after.txt`); round 64 itself reads `map=SKIP reason=MAP_PRE_EPOCH_ROUND` because the arm
  enforces from round 65.
- Routed round-63 defects: D1 map row + structural fix (above); D2 26 selftest transcripts committed under `build/K64ExecSelftestTranscripts/`
  (every run exit 0; 29 of 33 prose tallies MATCH, 4 stale by suite growth); D3 drafted as an append-only erratum (`w1/K64ScribeErratum.md`:
  three `-2` stems in the host store, zero in the lane's `w2/` or `w2-results.json`); D4 measured and carried as a limit
  (`w1/K64ExecKimiDegraded.md`: four governed K members absent, the `K=49` stanza fitted to a degraded host, not repaired); D5 the two
  counters' holes stay named; D6 role mix planned before dispatch.
- Assimilation: one theme (jj seat containment) from `merge/kumitate/`, one merged entry adopted and re-grounded; considerthese idea 2
  ("diff reports against receipts") is C1, and idea 1 ("try to forge each new gate") is what the wave-2 forge seats run.
- Mistake mined (`corpus/lessons/round-64.md` §Mistakes, lines 8-16): the R56-V3 map drift recurred a tenth time (round-63 spot-check file
  landed without its `corpus/README.md` row); captured-by `readme-map` after the fact, never at round start; fix Q60 with a red-before
  receipt.

**Round shape and seat accounting.** Two v1 waves under `ufo-wave-policy.json`, each dispatched inline through the `.ready` handoff
(`w1.ready` → `.ready.dispatched` at 19:46; `w2.ready` → 20:41). Planner seat: the L1 (the validator rejects `planner`). No residual call.
Round total **80 seats** (band 64–100).
- Wave 1: 41 seats — executor 13, scribe 8, scout 6, reviewer 5, connector 4, critic 2, sentinel 1, mutation-tester 1, simplifier 1.
  Wave 2: 39 seats — executor 12, reviewer 9, scribe 5, scout 4, critic 3, mutation-tester 3, connector 2, simplifier 1.
- Mix: attack roles (reviewer/critic/mutation-tester) w1 8/41 = 19.5%, w2 15/39 = 38.5%, round 23/80 = 28.8%. Strict m_flash set
  (executor/scribe/simplifier) w1 22/41 = 53.7%, w2 18/39 = 46.2%, round 40/80 = **50.0%** — wave 2 alone is below the ≥50% line, the round
  as a whole meets it; reported, not prettified.
- **Dead seats: none recorded.** `w1-results.json` carries `seats: 41` and no `status` field — every one of the 41 entries has `output: null`
  and the note "orchestrator kernel restarted mid-wave; seat output was delivered to the orchestrator session but not retained" — so death is
  established only by report existence, and 41/41 seat report files exist. Wave-2 deaths: UNMEASURED. Answering models: not recorded in either
  dispatch result; UNMEASURED.

## Landed changes

`LOG.md`'s round-64 entry is **not installed yet** (wave-1 draft `.ufo/waves/round-64/build/K64ScribeLogSkill/log-entry.md`; wave-2 scribes
draft the final form), so the install commit that will carry it is UNMEASURED; the changes themselves are carried by:
- `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` — freeze: plan, both counters, control generator and do-nothing script, `controls/receipt/` (16),
  nine base receipts, `scripts/report-receipt-diff.mjs` v1, `scripts/jj-seat-demo.sh` v1, counter pins.
- `d92cf1fff3026087a0e21a3183b97de169c6f22c` — wave 1 landed (1106 files, +172960/−76): tool v2, demo v2, controls 16 → 37,
  `controls/CHANGES-AFTER-FREEZE.md`, the 41 wave-1 seat reports and their build receipts.
- `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` — C2 landing (13 files, +5540/−13): entry `corpus/knowledge/jj-workspace-seat-containment.md`,
  rows S198–S200 in `corpus/SOURCES.md:150-152`, three captures, `.ufo/pins/source-captures.json` and `.ufo/pins/readme-map.json`,
  `PROVINCE.md:21`, `corpus/README.md:189,287`, `corpus/knowledge/agent-isolation-substrates.md:301`, `corpus/lessons/round-64.md`,
  `corpus/QUALITY.md` Q60 (`:999`), Q61 (`:1050`), Q51-C1 (`:1058`), and the `scripts/plan-before-ready.sh` map arm.
- Still pending (UNMEASURED): the SCORECARD round-64 section, the LOG entry, the SKILL rows/checklist items, the `proxy-check` re-pin, and this
  report — drafts at `build/K64ScribeScorecard/scorecard-r64.md`, `build/K64ScribeLogSkill/{log-entry,skill-rows,checklist-item}.md`,
  `build/K64ScribeQuality/Q60-Q61.md`.

## Before → after measurements

- **C1** `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`
  — before at the base: `RECEIPT64_UNMET held=0/5 checks=5 rev=6825a514… rule=R64 | P1 MISS tool-absent | … | P5 MISS report-not-given`, exit 1
  (`.ufo/waves/round-64/base/receipt64-base.txt`).
  At `2ed8a5f8`: `RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8… rule=R64 | P5 MISS report-not-given`, exit 1 (`.ufo/waves/round-64/close/receipt64-probe-at-2ed8a5f8.txt`). P1/P2/P3/P4 hold; **P5 is the arm this report exists to satisfy and its
  measurement is UNMEASURED** until the counter is re-run with `--report` over the filed report at the filing revision.
  P3 re-measured here at `2ed8a5f8`: the round-60 report (fleet `7b0581ed`) → `REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED` with six
  `PLACEHOLDER` lines matching an independent `grep -o '__[A-Z][A-Z0-9_]*__' | wc -l` → 6, and a `TALLY_UNRECEIPTED` line for the round-60
  `DISPATCH60_HELD` claim of ten of ten, exit 1; the round-63 report (fleet `8fd46e61`) → `REPORT_RECEIPT: CLEAN (round=63 rev=2ed8a5f8… bytes=17479)`,
  exit 0 (`.ufo/waves/round-64/close/p3-real-reports.txt`). Tool state: `REPORT_RECEIPT_SELFTEST: PASS (52/52)`, 37 controls exercising 8 distinct finding ids
  (`.ufo/waves/round-64/close/tool-and-controls.txt`). **Honest limits:** the counter runs the committed tool, so an echo-the-expect tool passes once the id floor is
  met (`K64ReviewProbeC1`); over all 24 real reports the v2 tool reads 13 CLEAN and 11 DRIFT, of which ten are false-positive classes
  (unresolvable hashes of read-only clones, receipts filed outside `.ufo/waves/round-64/base/`/`.ufo/waves/round-64/close/`) declared rather than fixed
  (`controls/real-reports-v2.txt`, `CHANGES-AFTER-FREEZE.md`); a bare unlabelled tally is invisible to the arm (measured: `K64ScribeQuality-4`).
- **C2** `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`
  — before at the base: `JJ64_UNMET held=0/8 checks=8 rev=6825a514… rule=J64 | J1 MISS entry-absent | … | J8 MISS …`, exit 1 (`.ufo/waves/round-64/base/jj64-base.txt`).
  The pre-data do-nothing control: `JJ64_UNMET held=1/8 checks=8 … | J7 MISS … readme-map-clean=false`, exit 0 as captured (the wrapper's exit, not the probe's — `.ufo/waves/round-64/base/jj64-donothing.txt`), a plan-text defect reported by three seats; at `2ed8a5f8`:
  `JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8… rule=J64`, exit 0 (`.ufo/waves/round-64/close/jj64-probe-at-2ed8a5f8.txt`). The demo the entry binds:
  `bash scripts/jj-seat-demo.sh` prints 21 `JJ_SEAT:` keys and `JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb…`, exit 0
  (`.ufo/waves/round-64/close/demo-after.txt`); J6 compares it set-equal with the entry's `## Demo outcomes`. **Honest limits:** the counter reads 8/8 on four
  independent forgeries (`K64CriticC2Predicate`) and on a stub demo and a demoted PROVINCE line (`K64ExecJjHonestFixture`); its archive boundary
  is porous (`../` pins, committed symlinks, caller cwd, env-overridable census — `K64ReviewProbeC2`); J3 can never fail alone; J5 accepts an
  attacker-hosted row URL (carried hole from T63); and it cannot tell a sound entry from a well-grounded wrong one.
- **Harm / maintenance check at `2ed8a5f8`**: `readme-map` CLEAN 156/156/156 exit 0 (was DRIFT 154/153/153 at the base); `sources-census.sh
  validate --root /home/vgpnk/Projects/shokunin kumitate` → `kumitate ok …` exit 0, the same six pre-existing W04 warnings as the base
  (`.ufo/waves/round-64/close/census-after.txt`). `proxy-check` on a `git archive` of `2ed8a5f8` is **DRIFT**, exit 1: `A_DRIFT declared=257 computed=514 delta=+257`,
  `C2_DRIFT 153→156`, `C2_TOTAL_DRIFT 153→156`, `GATE_PIN_DRIFT pin.plan-before-ready`, `PIN_UNPINNED scripts/report-receipt-diff.mjs`
  (`.ufo/waves/round-64/close/proxy-after.txt`) — so the plan's maintenance obligation ("both must read clean at the tip") is **not met at this revision**: the
  `A` term counts committed runnable files and rose 257 → 514 since the round-63 tip `bb184a90`, of which **255 of the 257 new files are wave build copies
  under `.ufo/waves/`** and only two are the round's real surfaces (`scripts/report-receipt-diff.mjs`, `scripts/jj-seat-demo.sh`); the changed gate and the new
  tool also need pins.
  The repair commit is UNMEASURED. Unchanged known base DRIFTs carried: `kimi-census` (four host members `MEMBER_MISSING`, `K=49` fitted to the
  degraded host), `anchor-truth`, `cite-check`, `surface-probe`, `omp-census`.
- **Counter forgeries, P2 floor and frozen-defect record (the round's own falsification):** the freeze's P2 floor was unsatisfiable (6 ids
  exercised against a floor of 8 and a 7-id vocabulary); it was closed by the plan's declared monotone ratchet — 21 added controls and a tool fix,
  never a floor relaxation — and the frozen counter/probe bytes are unchanged (`COUNTER_PINS: CLEAN pins=25`). Wave-1 seats also found, and the
  round reports instead of patches: the plan's `jj64-donothing` exit token, the "one honest control" sentence (three cases read CLEAN), the
  `census-before` row-count attribution (the count is printed by `.ufo/waves/round-64/base/sources-check-before.txt`), the plan's maintenance list undercounting the
  freeze's own drift, and S200 re-opening the document lane S067 already holds (`w1/K64ScribeGateRecord.md`).

## Sources & frontier

Registry census, before (`.ufo/waves/round-64/base/census-before.txt`, exit 0) and after (`.ufo/waves/round-64/close/census-after.txt`, exit 0), command
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`:
```
before: six W04 duplicate-url warnings (S034 S068 S084 S095 S123 S126) then "kumitate ok …/corpus/SOURCES.md"   EXIT=0
after:  the same six W04 warnings, then "kumitate ok …/corpus/SOURCES.md"                                      EXIT=0
```
- Rows before → after: **136 → 139** (`grep -cE '^\| S[0-9]{3} \|' corpus/SOURCES.md`; base read from `git show 6825a514:corpus/SOURCES.md`).
  Tier histogram, registry-only awk: docs 80 → **83**, community 12, spec 9, paper 9, tool 3, code 14, own-work 9 — **rows added by tier: +3, all
  tier `docs`, scope `A`** (S198 jj Concurrency v0.46.0, S199 Firefox Source Docs jj page, S200 jj Working copy v0.46.0). Rows touched
  old→new: **none** — `git diff 6825a514 2ed8a5f8 -- corpus/SOURCES.md` is three insertions, no existing row's status, recheck or used-by moved.
- Frontier rows advanced: `PROVINCE.md:21` (isolation-substrates band advanced — jj workspaces now "advanced in round 64 by
  `corpus/knowledge/jj-workspace-seat-containment.md`", mechanism M7 demonstrated), `corpus/README.md:189` (entry row) and `:287` (Frontier bullet);
  the round-45 entry is amended append-only at `corpus/knowledge/agent-isolation-substrates.md:301`.
- **Assimilation: jj seat containment** — one theme from `merge/kumitate/`, one merged entry adopted (staged `jj-operation-log-and-seat-staleness`
  + `jj-seat-staleness-outcome`, re-grounded, the staged "the seat does not go stale" sentence cut). Collision guard reproduced in scratch
  (`assimilation/`): registry 136 ids, staged 155 ids, collisions `S195 S196 S197` (none appended; the jj rows collide with nothing). Gate record
  (`w1/K64ScribeGateRecord.md`): **1 admit, 6 rejects with flips**, 3/3 gate quotes and 11/11 entry bullets re-verified, quarantine slice 9 ids
  carried, none appended.
- **Sourced claim:** C2 cites S198/S199/S200, all opened 2026-10-25; the entry carries 13 located quotes (≥1 per row, each ≤25 words), each found
  in the committed capture and in a fresh live fetch (J4/J5); access dates and quotes are in the lesson `## Gate` (`corpus/lessons/round-64.md:25`)
  and the entry's `## Located quotes`.
- **considerthese:** `considerthese/2026-10-25.md` idea 2 is C1; idea 1 is applied to the new tool and both counters by the wave-2 forge seats
  (UNMEASURED).

## Trend verdicts

- **Expansion — improved.** The lane's isolation-substrates band gains its first *demonstrated* jj-workspace ground (mechanism M7, a 21-key
  hermetic demo) and three tier-A rows; the frontier line at `PROVINCE.md:21` no longer says jj workspaces are undemonstrated. Limit: the counter
  measures an evidence chain plus a demo re-run, so it cannot distinguish this from quality work.
- **Quality — improved.** The report-diff tool went v1 → v2 on the back of 20 found forgeries (selftest 20 → 52, controls 16 → 37, 8 ids), the demo
  became hermetic with 6 measured keys added (15 → 21), `readme-map` was repaired to CLEAN, and Q60/Q61/Q51-C1 were appended. Capped: `proxy-check`
  is red at `2ed8a5f8` (four errors) and the wave-2 corrections to rows/lesson/QUALITY are UNMEASURED.
- **Discernment — improved.** The round found its own frozen predicate unsatisfiable, closed it by the declared ratchet rather than a relaxation,
  disclosed the post-freeze control growth (`controls/CHANGES-AFTER-FREEZE.md`) and left frozen defects (plan exit token, control composition,
  census attribution) reported rather than patched; the probes' privilege and boundary holes are named next to the HELD verdicts. No non-author has
  judged this report yet.

## SHONEN

- [~] SKILL.md contains real decision tables, error patterns, checklists, cited sources — the round-64 tool rows, two checklist items and the
  `SKILL.md:727` grammar repair are drafted (`build/K64ScribeLogSkill/{skill-rows,checklist-item}.md`) but **not installed**; the file's existing
  tables and 30 task lines stand. No non-author promotion verifier.
- [~] At least one end-to-end domain task executed and logged in LOG.md — the domain task is the entry + demo + two waves; the LOG entry itself is
  UNMEASURED (draft `build/K64ScribeLogSkill/log-entry.md`), evidence `.ufo/waves/round-64/{w1,w2}/`, `.ufo/waves/round-64/close/*.txt`.
- [~] Instructions executable by an agent without oral context — the counting commands, `--selftest` (52/52), `bash scripts/jj-seat-demo.sh` (21 keys)
  and `bash scripts/plan-before-ready.sh --round 64` are explicit in `plan.md`, `corpus/lessons/round-64.md` and QUALITY Q60/Q61.
- [~] No cross-domain bleed (PROVINCE.md still accurate) — only the lane's own isolation-substrates band moved; `w1/K64ConnJjSiblingOverlap.md`
  routes path non-containment and git-ref boundaries to Kagi/Souji/Tabi as adjacent, not absorbed; nothing outside `corpus/`, `PROVINCE.md` and
  `scripts/` was touched.

Stale-lane: respawn-per-round driver; no other mission of this lane is open. Tool installs/updates: **none** (node v24.21.0, jj 0.45.1-7c41cdeb,
git 2.56.0 pre-existing; no pacman, uv or npx use). Open L0 questions: UNMEASURED (the L1 owns `.ufo/l0-questions.md`; the wave-1 candidates are
the post-freeze control changes and the degraded-host Kimi stanza). Open items carried: the R56-V3 readme-map recurrence (tenth time, now gated at
round start from round 65), the `proxy-check` `A` term counting committed wave build copies (this round's red tip), the counters' declared holes
above, Audit19 residuals, and the Q51 grounding hash corrected by Q51-C1.
