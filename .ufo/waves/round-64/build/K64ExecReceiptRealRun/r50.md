# kumitate — round 50 report (hyaku run 5)

Lane repo `kumitate-shokunin` (jj-colocated, git backend; branch `master`). Base
`ff40d7dcbc90aa043d7f4003976af6a99ff76642`; freeze `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3`; measured close
revision **`ab3c64e9aaaff80faf3a2c93743287e44def4084`**; record commit **`329fcb8018d2f125128a454c1a1ccd6fb3faf6ce`**
(close receipts + LOG entry). Plan `.ufo/waves/round-50/plan.md`; counters
`.ufo/waves/round-50/probe/bindguard50-probe.mjs` (rule `G50`) and `probe/repairs50-probe.mjs` (rule `R50`), both
committed before any data seat ran. Round shape: **one v2 wave** `kumitate-r50`, 64 seats (policy
`ufo-wave-policy-v2.json`, band 64–128; dispatch `counts {"spawn":64,"resume":0}`), attack **23/64 = 35.9%** under
the campaign's canonical attack roles (reviewer 9, critic 6, mutation-tester 8; the plan's `27/64` also counted 4
sentinels and is corrected), plus **one residual call of 5 seats** (reviewer 3, critic 2) → round total **69**
(≤128). 62 of 64 wave seats wrote reports; 2 dead seats are named below.

This round declares **one scored claim — C1, operability**: the `cap-run` mount-root guard (explicit binds and the
implicit cwd bind) with gate-pin coverage, predicate `GUARD_HELD` (rule `G50`). Operability is the live axis at its
saturation line and its terminal integer (9 under the saturating `f_O`); the four live coverage successors are
unchanged. `LEDGER_HELD` (rule `R50`) is an **auxiliary closure/frontier audit** of the round-49 non-author
closure's routed defects — it carries no axis integer and is not a second claim.

## Work performed

- **Inherited state (attempts 1–4).** Attempt 1 committed the freeze, the pre-data corrections, the wave seat
  identities and the guard (`5b0de26`, `378b6e7`, `6927903`, `227b9e6`); attempts 2–4 left no report (attempt 2
  produced only `.ufo/waves/round-50/close/G50-227b9e6e.txt`). **Re-verified and reused:** plan, both counters,
  all controls, the 64-seat wave outputs, the guard, Q40/Q41 and the SOURCES `used-by` edits — each re-read or
  re-run this attempt before it entered a claim (`close/G50-ab3c64e9.txt`, `close/R50-ab3c64e9.txt`).
  **Reused as a failing receipt, never as a score:** `close/G50-227b9e6e.txt` (`held=6/8`, stale pin).
  **Discarded:** nothing — no unverified artifact was kept, and the only uncommitted lane path at open was the
  untracked `close/` directory (now `329fcb80`).
- **Claim freeze.** Plan and both counters at `5b0de26`; pre-data implementation corrections at `378b6e7` (G3 reads
  any exact `/tmp` tmpfs row; R8's committed-report read restored) — predicates, labels, check counts and
  thresholds unchanged. Do-nothing controls before data: `BINDGUARD50: GUARD_UNMET held=5/8` exit 1 at base
  (`controls/CtlG50-base-ff40d7d-r1.txt`: G2 misses `/tmp`, `/tmp/`, `/tmp/.`; G6 `pin.bind-oracle=absent`;
  G7 `PROXY: DRIFT`), exposure control `controls/CtlExposure-base-ff40d7d.txt` (`host_marker=present` — a child
  writing `/tmp/r50-host-tmp-exposed` through `--bind /tmp`), `REPAIRS50: LEDGER_UNMET held=1/8` exit 1
  (`controls/CtlR50-base-ff40d7d-r2.txt`). The first R50 control crashed `ReferenceError: l49` and is retained as
  the red/error trail (`controls/CtlR50-base-ff40d7d.txt`).
- **C1 build.** `scripts/cap-run.mjs` at `227b9e6` → `ab3c64e9`: `isSandboxManagedMount` refuses `/` and `/tmp`
  exactly (after `realpath`, so `/tmp/`, `/tmp/.` and symlink aliases are covered) and every `/proc|/sys|/dev|/run`
  descendant; the implicit cwd bind is refused on the same predicate; `/tmp/<subdir>` binds stay legal; the
  selftest grows the refusal arms and a `/tmp` symlink arm (12/12). `pin.bind-oracle` (closing r49 limit d) and
  `pin.cap-run` enter `kumitate-gate-pins-v1`. The guard commit declared a stale `pin.cap-run` (`held=6/8` at
  `227b9e6`, retained); the close commit re-pins it (`ab3c64e9`). Evidence: lesson
  `corpus/lessons/round-50.md` M4/M5, `close/G50-227b9e6e.txt`, `close/G50-ab3c64e9.txt`.
- **C1 measurement.** `GUARD_HELD held=8/8` exit 0 at `ab3c64e9`
  (`close/G50-ab3c64e9.txt`, run-at 2026-10-23T23:01:35Z: G1 present, G2 `refused=8/8`, G3 `bound_rw=true
  tmpfs=true`, G4 `VERDICT: PASS`, G5 `VERDICT: PASS`, G6 `pins=5/5`, G7 `PROXY: MATCH` (A=43 C=22 operability=9;
  C1=19/19 C2=114/114; pins=6), G8 `host_marker=false`). Independently re-run twice by residual seat
  `RevCloseG50` 94 s apart, byte-identical (`close/RevCloseG50.md`).
- **R50 frontier/closure audit and repairs.** Eight checks over the routed round-49 defects; `LEDGER_HELD held=8/8`
  exit 0 at `ab3c64e9` (`close/R50-ab3c64e9.txt`, run-at 2026-10-23T23:01:35Z; byte-identical independent re-run
  and an end-to-end R1 MISS proof on a fabricated commit by `RevCloseR50`, `close/RevCloseR50.md`). Dispositions:
  **R50-1** append-only `## Erratum` on the fleet round-49 report (fleet commit `f50d178`); **R50-2** `## Gate`
  ledger appended to `corpus/lessons/round-49.md`; **R50-3** S095/S098 re-open receipts committed
  (`r50/ReopenS095.md`, `r50/ReopenS098.md`, both `REOPEN50: HOLD`, body hashes `2cb77df2…` / `c16859e0…`) with
  S095's locator caveat refuted against the fetched bytes by `r50/L1-S095-Locator-Check.md` (the row's anchors are
  accurate and were not rewritten); **R50-4** three genuinely spaced B49 receipts (`ReRunB49-1..3.txt`,
  sha256 `aa293cc4…`/`96a01c84…`/`e59ff9af…`, `run-at` 20:43:09Z/20:45:54Z/20:57:45Z, span 876 s) replacing the
  three byte-identical r49 files; **R50-5** both stale “all eleven” sentences swept; **R50-6** the guard;
  **R50-7** pin family (`pin.cap-run`, `pin.bind-oracle`, `pin.proxy-check`); **R50-8** `r50-taskcall.json` keeps
  `context`+`tasks` together; **R50-9** round-open proxy drift repaired (two README rows, stanza re-derivation,
  pins; `PROXY: MATCH`); **R50-10** the counter-amendment entry's provenance trio plus S095/S098 `used-by`.
- **Wave seats (64).** Findings that changed this report: `ScoutGuardSweep`/`ScoutEnumerator`/
  `ScoutGuardSecondOpinion` (the implicit-cwd route), `LabratSystemd` (reproduced the cwd escape), `SentArgv`,
  `RevCapSpawn`/`RevMountOrigin` (mount-origin and spawn paths), `MutGuard`/`MutSelftest` (mutation survivors that
  forced the symlink and post-launch arms), `CritB49CounterAttack` (prelude-only replay of R4 — recorded as a
  limit, Q39 narrowed), `ScribeLesson50`/`ScribeGateLedger49`/`ScribeSourcesCells`/`ScribePinDoc` (lesson, gate
  ledger, SOURCES deltas, pin documentation). 62 seat reports + 2 re-open receipts + 1 L1 locator annotation are
  committed under `.ufo/waves/round-50/r50/`. **Dead seats:** `CritRepairsForClaims` and `CritReporting` — no
  report artifact, no terminal status or error text in `r50/swarm-registry.json`; the absence is recorded, the
  cause is **not** asserted, and neither seat was replaced or padded.
- **Residual call (5 seats, counted).** `RevCloseG50` (independent G50 re-runs + per-check audit), `RevCloseR50`
  (R50 re-run + MISS arms), `RevCloseHarm` (H1–H5 at `ab3c64e9`), `CritCloseClaims` (adversarial binds and the
  attribution control), `CritCloseReport` (report-contract checklist). Artifacts under
  `.ufo/waves/round-50/close/`.
- **Harm battery at `ab3c64e9`** (`close/RevCloseHarm.md`): H1 `CHECKLIST: 22/22 pass` exit 0 (freeze baseline
  20/22; items 693 and 697 repaired, none regressed); H2 `CAP_RUN_SELFTEST: 12/12`, `BIND_ORACLE_SELFTEST: 7/7`,
  `COUNTER_RERUN_SELFTEST: PASS`; H3 `PROXY: MATCH … pins=6 match`; H4 census exit 0; H5 `ROUND_GATE_SELFTEST:
  61/61`. Residual risk recorded: gate-mutants' K43 confirm-rerun is load-sensitive — one checklist run under a
  self-induced 7-process storm read `GATE_MUTANTS: ERROR … unstable=4`, while the standalone battery and the serial
  checklist rerun both read `CLEAN … frozen=41/41`.
- **Census.** Round-open receipt `r50/SonicCensus.md` (rev `6927903`, `run-at=2026-10-23T20:46:28Z`): `kumitate ok
  …/corpus/SOURCES.md`, 4 pre-existing `W04` duplicate-url warnings (S034, S068, S084, S095), exit 0, 99 rows. Close
  receipt `close/Census-end.txt` (`run-at=2026-10-23T23:08:22Z`): identical warnings, `kumitate ok`, exit 0,
  99 rows (`SOURCES_CHECK: CLEAN (rows=99 tiers=A:85,B:6,C:8 status=queued:12,mined:71,rejected:16
  entries_with_source=7 legacy=38)`).
- **Misroot sweep.** `git -C /home/vgpnk/Projects/shokunin status --porcelain` (no pathspec) at close: untracked
  entries are other lanes'/operator files (`.ufo/state/*`, `AGENTS.md`, html/session dumps, other lanes' wave
  dirs); a content scan of every untracked fleet-root file for both `kumitate` and `round-50` found **none** — no
  seat wrote into the fleet root. No file was copied or deleted.
- **Inherited leftovers / operator files.** None uncommitted in the lane at close apart from `close/` (committed in
  `329fcb80`). Files not authored by this lane (the fleet-root untracked set, `.ufo/state/*`,
  `round-*-aggregator-*`/`*-verifier-spotcheck.md`) were left untouched.
- **Tool installs.** None. No install/update is recorded by any of the 62 seat reports, the 5 residual seats, or
  the L1; pacman is paused host-wide and no `uv`/`npx`/binary channel was used this round.
- **Stale-lane line.** Respawn-per-round driver: this mission serves **round 50 only**, and no other kumitate
  mission is open (`pgrep -af 'kumitate|round-50'` at close → no kumitate worker process; the only lane mission is
  this report's round).
- **Open L0.** `kumitate | round-42` (`.ufo/l0-questions.md:114`) — may the lane keep the separate
  `kumitate-gate-pins-v1` block? Still **pending**; it does not block this round, and no new question was appended.

## Landed changes

All entries are tied to the LOG.md round-50 entry (`LOG.md:1977-2027`, committed in `329fcb80`) and to the commit
that carries them:

| Commit | What it carries |
|---|---|
| `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3` | round-50 freeze: plan, both frozen counters, H1 freeze receipt, wave spec/taskCall (R50-8) |
| `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` | pre-data implementation corrections (G3 mount-table enumeration, R8 committed-report read) and the explicit `/tmp` guard |
| `6927903f99bbc26e397aa47387aa76950f42b3a5` | wave seat assignments (registry `agentId`s) |
| `227b9e6e7c93edb24ea29d189f12d9526e096c4e` | guard hardening (implicit cwd), wave seat reports, r49 Gate ledger, QUALITY Q40/Q41, SOURCES `used-by` + provenance trio, `knowledge/mount-order-and-bind-scope.md`, taskCall fix |
| `ab3c64e9aaaff80faf3a2c93743287e44def4084` | **measured C1 revision**: `pin.cap-run` re-pin, `pin.bind-oracle`, C2 stanza 114/114 + README row, Q39 field/limit narrowing, `corpus/lessons/round-50.md` (M1–M6), SCORECARD round-50 section + move-log row |
| `329fcb8018d2f125128a454c1a1ccd6fb3faf6ce` | record commit: lesson corrections (M4 attribution, M5 pin provenance, M6 causality, S095 locator + SOURCES deltas), SCORECARD measured revisions/attribution limit/attack-mix correction, LOG round-50 entry, close receipts, census receipt |
| fleet `f50d178d493eef3866021b6c80bf132065249936` | round-49 report `## Erratum` (R50-1) |

No push went to the fleet remote from the lane; the lane push is the helper's `landed` line for `329fcb80`.

## Before → after measurements

**C1 — operability, `GUARD_HELD` (rule G50).** Counting command:
`node .ufo/waves/round-50/probe/bindguard50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`.

- **Before** (measured commit `ff40d7dcbc90aa043d7f4003976af6a99ff76642`, round base):
  `BINDGUARD50: GUARD_UNMET held=5/8 checks=8 rev=ff40d7d rule=G50 caprun_sha256=d8acc6de…` exit 1 — G2 `MISS
  /tmp:exit=0;/tmp/:exit=0;/tmp/.:exit=0`, G6 `MISS pin.bind-oracle=absent`, G7 `MISS exit=1 PROXY: DRIFT`
  (`controls/CtlG50-base-ff40d7d-r1.txt`).
- **After** (measured commit `ab3c64e9aaaff80faf3a2c93743287e44def4084`): `BINDGUARD50: GUARD_HELD held=8/8
  checks=8 rev=ab3c64e9aaaff80faf3a2c93743287e44def4084 rule=G50 caprun_sha256=e1d0a79b…` exit 0
  (`close/G50-ab3c64e9.txt`).
- **Intermediate, retained:** `227b9e6` read `held=6/8` (G6 `pin.cap-run=957756ad!=e1d0a79b`, G7 `PROXY: DRIFT`)
  (`close/G50-227b9e6e.txt`) — a stale pin, fixed at `ab3c64e9`, not a behavioural pass.
- **Do-nothing control:** at base, a SCORECARD-only edit cannot clear G2 (the three `/tmp` spellings still exit 0
  and G2 misses) — the target 8/8 is unreachable without the guard. **Attribution limit, measured:** the explicit
  `/tmp` refusal pre-landed at `378b6e7` and the unchanged G50 already read 8/8 at `6927903`; the predicate does not
  independently discriminate the post-data implicit-cwd delta. That delta's evidence is G4's new selftest arms and
  the behavioural comparison in `close/CritCloseClaims.md` §2: `6927903` accepts cwd `/tmp` (exit 0) where
  `ab3c64e9` refuses it (exit 64). G2 is a finite eight-input list; `/dev`, `/sys` and descendant `/run` refusals
  are exercised in G4 (implementation: `isSandboxManagedMount`).

**Auxiliary — `LEDGER_HELD` (rule R50; no axis integer).** Counting command:
`node .ufo/waves/round-50/probe/repairs50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> --fleet
/home/vgpnk/Projects/shokunin`.

- **Before** (`ff40d7d`): `REPAIRS50: LEDGER_UNMET held=1/8 checks=8 … rule=R50` exit 1 (R1/R2/R3/R4/R5/R6/R8 miss;
  only R7 passes) — `controls/CtlR50-base-ff40d7d-r2.txt`.
- **After** (`ab3c64e9`): `REPAIRS50: LEDGER_HELD held=8/8 checks=8 … rule=R50` exit 0 —
  `close/R50-ab3c64e9.txt`.

## Sources & frontier

Census command (contract v1, run from the lane root with `--root` at the fleet):

```
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
```

- **Before** — `r50/SonicCensus.md` at rev `6927903`, `run-at=2026-10-23T20:46:28Z`:
  `kumitate W04 S034 …` / `S068` / `S084` / `S095` duplicate-url warnings, `kumitate ok
  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`, **exit 0**; manual row count
  `grep -cE '^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|' corpus/SOURCES.md` → **99**.
- **After** — `close/Census-end.txt`, `run-at=2026-10-23T23:08:22Z`: the same four `W04` warnings, `kumitate ok
  …/corpus/SOURCES.md`, **exit 0**; manual row count → **99**; `SOURCES_CHECK: CLEAN (rows=99 tiers=A:85,B:6,C:8
  status=queued:12,mined:71,rejected:16 …)`.
- **Rows added by tier:** A 0 / B 0 / C 0. **Removed:** 0. **Status/recheck transitions:** none. **Frontier rows
  advanced:** none (no queued→mined promotion; PROVINCE bands unchanged).
- **Rows touched, old→new** (append-only cells only, `corpus/SOURCES.md`):
  - **S095** `used-by`: `scripts/cap-run.mjs, scripts/cap-spawn.mjs, corpus/lessons/round-47.md` → `…,
    corpus/knowledge/counter-amendment-discipline.md, corpus/knowledge/mount-order-and-bind-scope.md`.
  - **S098** `used-by`: `.ufo/waves/round-48/probe/caproute48-probe.mjs, corpus/lessons/round-48.md` → `…,
    corpus/knowledge/counter-amendment-discipline.md`.
  - **S099** `used-by`: `scripts/bind-oracle.mjs, corpus/knowledge/counter-amendment-discipline.md,
    corpus/lessons/round-49.md` → same plus `corpus/knowledge/mount-order-and-bind-scope.md`.
- **Re-opens:** S095 and S098 re-opened 2026-10-23, both `HOLD` (bodies unchanged at their pinned hashes); S095's
  locator caveat refuted by an exact line search (`r50/L1-S095-Locator-Check.md`) — the anchor cell was not
  rewritten. The new note `corpus/knowledge/mount-order-and-bind-scope.md` (r49 build, committed at `227b9e6`) is
  named for the map; it is **not** a coverage-axis claim (no registry family moved).
- Sourced claim: C1 rests on S095 (filesystem actions apply in argument order — the reason a later `--bind` beats
  the earlier `--tmpfs`), cited in the cap-run header, QUALITY Q40 and the lesson.

## Trend verdicts

- **expansion — `unchanged`.** No new surface family or member: registry families 19/19 and the live layer terms
  are byte-identical at `ab3c64e9` (`PROXY: MATCH … C1=19/19 C2=114/114 S=88/88 R=92/92 K=53/53`), SOURCES rows
  99→99 with zero additions by tier, no capability row added, PROVINCE bands unchanged. The new knowledge note and
  the lesson are records, not coverage.
- **quality — `improved`.** A runner invariant hole is closed at its API boundary (explicit and implicit bind to a
  sandbox-managed mount root), shown by a positive exposure control (`host_marker=present` before) and a legal
  `/tmp/<subdir>` bind still working (G3); instrument pinning now covers every gate script the guard touches
  (G6 `pins=5/5`, `PROXY: MATCH`); the H1 checklist went 20/22 → 22/22 with the two frozen FAILs repaired and none
  regressed; the R50 closure audit is 8/8 with each checked defect repaired by a check shown able to fail (R1's
  MISS arm proven end-to-end by `RevCloseR50`). Honest counterweights: the post-data cwd delta is not
  discriminated by the unchanged G50 (attribution limit above), and G2 is a finite input list.
- **discernment — `improved`.** Non-author disagreements were accepted, not argued away: `CritCloseClaims`'s
  attribution dissent changed lesson M4/M5 and added a SCORECARD limit; `CritCloseReport`'s contract gaps changed
  the attack-mix figure (27→23/64), the SOURCES old→new ledger, the S095 locator resolution and the dead-seat
  wording (M6 causality removed); `CritB49CounterAttack`'s prelude-only replay is recorded as a limit and narrowed
  QUALITY Q39. The round keeps its own failing intermediate (`6/8`) and the crashed first control. Counterweight:
  no non-author round-50 closure spot-check exists yet — the driver's independent verification is still owed.

## SHONEN

- `[~]` **SKILL.md contains real decision tables, error patterns, checklists, cited sources** — `SKILL.md:12-33`
  (sourced dispatch-shape table), `:423-473` (failure-telemetry patterns), `:587-617` (gate/runner registry,
  `Twelve are gates` reconciled, R5 PASS), `:668-707` (executable checklist, `CHECKLIST: 22/22 pass` at `ab3c64e9`,
  `close/RevCloseHarm.md`). No named non-author verifier for this box.
- `[~]` **At least one end-to-end domain task executed and logged in LOG.md** — the round-50 C1 guard is executed
  end-to-end and logged (`LOG.md:1977-2027`), with `close/G50-ab3c64e9.txt` (8/8), `close/R50-ab3c64e9.txt` (8/8)
  and the guard's behavioural comparison (`close/CritCloseClaims.md` §2). No named non-author verifier for the box.
- `[~]` **Instructions executable by an agent without oral context** — `SKILL.md:668-707` states cwd, commands,
  accepted exits and marker substrings, executed as 22/22 by `surface-probe --checklists`; the round's counting and
  harm commands are stated verbatim in `.ufo/waves/round-50/plan.md:38-93` and were run from them. No named
  non-author verifier for the box.
- `[~]` **No cross-domain bleed (PROVINCE.md still accurate)** — `PROVINCE.md:3-6,12-28` (in-province: dispatch
  shapes, ufo-fsd scripts, runtime crates; out: host/session state, other lanes); the wave's scope seats
  (`r50/RevScopeCoverage.md`, `r50/ConnSiblingOverlap.md`) found no absorption; the cross-domain `membrane-seal
  write` defect remains reported, never absorbed. No named non-author verifier for the box.
