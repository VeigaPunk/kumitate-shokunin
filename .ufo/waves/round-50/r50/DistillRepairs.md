# DistillRepairs — root-class dedup of R50-1..R50-10, claim coverage, standing-rule gaps

Seat: `KumitateR50.DistillRepairs` (connector). Read-only on the lane; evidence gathered at lane
HEAD `6927903` (plus the in-flight working-tree state, explicitly labeled). Sources read:
`.ufo/waves/round-50/plan.md` (frozen), `probe/repairs50-probe.mjs` (frozen R1-R8),
`probe/bindguard50-probe.mjs` (frozen G1-G8 per plan §C1), `corpus/lessons/round-49-verifier-spotcheck.md`
(routed defects 1-6), `git show 378b6e7` (the L1's pre-wave "freeze guard and closure corrections"
commit), `corpus/QUALITY.md` (Q21, Q39-Q41), `scripts/round-gate.mjs` header, `scripts/proxy-check.mjs`
GATE_PINS, live read-only gate runs.

## 0. State fact that reframes the list (observed, not judged)

The L1 landed most repairs **pre-dispatch** in `378b6e7` (2026-10-23 17:44:27 -03, one minute before
`6927903` "record wave seat assignments"): the cap-run `/tmp` guard + selftest usage-arm
(R50-6), `pin.bind-oracle` stanza line + GATE_PINS entry + re-pins (R50-7), stanza re-derivation
A=38→43 / C2=108→112 + README rows for the two spotcheck files (R50-9), the source trio on
`counter-amendment-discipline.md` + S098/S099 used-by (R50-10), the `all eleven`→`all twelve` sweep
(R50-5), and Q39-Q41 in QUALITY.md. Verified at HEAD: `git show 378b6e7:scripts/cap-run.mjs | sha256sum`
= `64fafb42…` = stanza `pin.cap-run` (consistent); `node scripts/sources-check.mjs` → `SOURCES_CHECK:
CLEAN … entries_with_source=6` (R50-10 effective). So the wave's executor seats are reproducing an
already-landed state on scratch copies; the frozen counters' before/after pair is
`ff40d7d` (controls) → `378b6e7`+ — both pre-wave. Claim coverage below is unaffected (the counters
enumerate committed bytes), but the round's "build" half is verification-shaped, not greenfield.

At run time the working tree additionally carries uncommitted L1 edits (` M scripts/cap-run.mjs`,
` M .ufo/waves/round-50/plan.md`): a new `cwd === '/tmp'` refusal arm + a spawned refusal selftest arm.
A read-only `node scripts/proxy-check.mjs --strict` on that working tree prints
`GATE_PIN_DRIFT pin.cap-run declared=64fafb42… computed=d9ba4179…` — expected mid-integration drift
(unpinned edit), and live proof the class-C detector works.

## 1. The dedup — 10 routed items → 5 root classes

### Class A — record-currency / append-only hygiene (3 items: R50-1, R50-2, R50-5)

One failure shape at three layers: a record's text no longer carries (or never carried) the state it
must describe.

| item | layer | subroot |
|---|---|---|
| R50-1 | fleet report `.ufo/reports/round-49/kumitate.md` | record filed before final state (3 commits after filing; C2 15/15 vs tip 16/16) |
| R50-2 | lane lesson `corpus/lessons/round-49.md` | required section absent (`## Gate`; CORPUS/LEARNING requirement) |
| R50-5 | lane registry prose `SKILL.md:595/:598` | hand-maintained count drifts when the registry grows (`all eleven` vs `Twelve`) |

- **Single recurrence-preventing artifact today: none, mechanically.** Q21 (QUALITY.md:216) governs
  Gate-ledger *content* but presupposes the section exists; Q41 (landed `378b6e7`) reconciles
  gate-count sentences against `| gate |` rows — covers R50-5's subclass only, and its own stated
  limit is "scoped to SKILL.md". `round-gate.mjs --close/--tracked` checks report presence, size,
  tracking, tree-clean and pushed — never "lesson has `## Gate`" nor "report-cited lane hash == tip
  (or an `## Erratum` exists)". All three subroots were found by the *next round's* non-author
  spot-check — a lagging detector.
- **Claim coverage: one-shot only.** R8 covers R50-1 (strong: content-anchored — the six strings
  `01b70bb0/923a172/c432cc9/16/16/15/15/64b92866`), R1 covers R50-2 (weak: word-presence in the Gate
  tail — the semantics seat attacks this), R5 covers R50-5 (`!includes('all eleven') && /Twelve/`).
  All three enumerate r49/r50 bytes only; nothing standing prevents round-51 recurrence.

### Class B — receipt-for-claim (3 items: R50-3, R50-4, R50-8)

One rule at three layers — claim → pointer → *distinct* bytes:

| item | layer | subroot |
|---|---|---|
| R50-3 | S095/S098 re-opens | claim with no committed artifact (no-pointer-no-claim) |
| R50-4 | three C1 B49 receipts | bytes do not encode run identity (one sha256 ×3 in one commit) |
| R50-8 | r49 wave dispatch claims | the committed artifact is not the artifact described (bare 64-array vs emitted `{context, tasks}` taskCall) |

- **Single recurrence-preventing artifact:** `scripts/counter-rerun.mjs` (mints run-at-stamped
  distinct receipts) + Q39 (landed `378b6e7`: `run-at=<ISO-8601 UTC>` first line, distinct hashes,
  pre-registered span minimum). R2/R3/R4 freeze the enforcement this round.
- **Claim coverage: R50-3 and R50-4 fully; R50-8 not at all.**
  - R2/R3 are the strongest arms in R50: the body sha256 (`2cb77df2…`, `c16859e0…`) is pinned inside
    the frozen counter (`repairs50-probe.mjs:76-77`), so a forged receipt must at least carry the true
    source hash and the `REOPEN50: (HOLD|DRIFT)` first line (the fetch itself is unverified — the
    recorded limit, attacked by SentForge).
  - R4 enforces `run-at` parseable, `ORACLE_HELD held=6/6` in each, all sha256 distinct, span ≥300 s
    (`repairs50-probe.mjs:82-92`).
  - **R50-8 is missed entirely by both claims** (flag §3): no G1-G8 or R1-R8 check reads
    `.ufo/waves/round-50/r50-taskcall.json`. G-checks enumerate cap-run/pins; R-checks enumerate
    lesson/gate/re-opens/re-runs/SKILL/lesson-50/census/erratum. The file *is* committed at `5b0de26`
    (325 lines) and MutSpecDup shows the wave validator refuses malformed specs — but no frozen
    predicate asserts the committed shape, so a future round can regress it score-free.

### Class C — frozen-pin maintenance (2 items: R50-7, R50-9 — operationally one)

- **Dedup: R50-7 ⊂ R50-9.** R50-9's live strict run at round open reported `PIN_UNPINNED
  scripts/bind-oracle.mjs` — which *is* R50-7's defect (the r49 M2 deferral) observed live; R50-9's
  other terms (A=38 vs computed, C2 108 vs 110/112, two integrator files unrowed in `corpus/README.md`,
  AXES_DRIFT) are the same root — stanza/pin/map state lagging file state after any `scripts/*.mjs`
  edit or corpus growth.
- **Single recurrence-preventing artifact: `node scripts/proxy-check.mjs --strict`** as a standing
  freeze+close item. It is already standing: SKILL.md checklist 693 runs it on every
  `surface-probe --checklists` pass and states strict fails `PIN_UNPINNED`; G7 freezes it for this
  round. Verified live during this seat: my read-only strict run flagged the L1's *own* in-flight
  unpinned cap-run edit as `GATE_PIN_DRIFT` — the detector catches exactly this class, including the
  integrator.
- **Claim coverage: full, and standing.** G6 (five named pins at extracted sha256, incl.
  `pin.bind-oracle` and the re-pinned `pin.cap-run`/`pin.proxy-check` family) + G7 (`PROXY: MATCH`)
  cover both items; checklist 693 keeps coverage beyond the round.

### Class D — sandbox-guard (1 item: R50-6)

- **Single recurrence-preventing artifact:** the refusal arm in `scripts/cap-run.mjs` `bad()`
  (`p === '/tmp'` after `realpathSync`, subdir binds legal) + the usage-arm/spawned-arm selftest +
  `pin.cap-run` + Q40 (landed `378b6e7`). Standing: checklist 707 (cap-run hermetic suite) + G2/G3/G4/G8
  frozen this round + bind-oracle's own mutant arms.
- **Claim coverage: this IS C1.** The class is scored, pinned, and self-tested.
- **Class-name evidence from this round:** the in-flight working-tree edit adds a `cwd === '/tmp'`
  refusal — a *second* path that overmounts the `/tmp` tmpfs (the cwd bind), surfaced by the wave's
  own seats. The root class is "anything that re-exposes a sandbox-managed mount root", of which
  `--bind /tmp` was instance one.

### Class E — provenance-header conformance (1 item: R50-10; added at freeze, outside the item's R50-1..9 range)

- **Single recurrence-preventing artifact:** `node scripts/sources-check.mjs`
  (`ENTRY_HEADER_REQUIRED`), standing via checklist 697.
- **Claim coverage: none (flag §3).** R7 is the *fleet* `sources-census.sh validate` — it checks
  SOURCES.md row structure and passed at base while 697 was red (base control: "R7 passes" alongside
  H1-freeze-5b0de268.txt item 697 FAIL), so R7 cannot see this defect class. H1's floor "≥ 20/22" does
  not force 697 green: 21/22 (only item 693 repaired via H3/G7) satisfies H1 with R50-10 unlanded.
  Repaired anyway at `378b6e7` (trio + used-by), verified `SOURCES_CHECK: CLEAN` — but the escape
  remains for a future round.

## 2. Coverage matrix (the round's two frozen predicates vs the 10 items)

| item | class | C1 GUARD_HELD (G1-G8) | R50 LEDGER_HELD (R1-R8) | standing detector |
|---|---|---|---|---|
| R50-1 erratum | A | — | **R8** (content-anchored) | none (next spot-check) |
| R50-2 ## Gate | A | — | **R1** (word-presence) | none (Q21 needs the section to exist) |
| R50-3 re-open receipts | B | — | **R2/R3** (hash-anchored) | Q39-family format |
| R50-4 spaced receipts | B | — | **R4** (distinct + ≥300 s) | Q39 + counter-rerun.mjs |
| R50-5 all-eleven sweep | A | — | **R5** | Q41 (SKILL.md-scoped) |
| R50-6 /tmp bind guard | D | **G2/G3/G4/G8** | — | checklist 707 + pin.cap-run + Q40 |
| R50-7 pin.bind-oracle | C | **G6** | — | checklist 693 strict |
| R50-8 taskCall shape | B | — | **none** | wave validator at dispatch only |
| R50-9 stanza/README drift | C | **G6/G7** | — | checklist 693 strict |
| R50-10 provenance trio | E | — | **none** (R7 census blind to it) | checklist 697 (not frozen) |

## 3. Flags — defects the claims miss entirely

1. **R50-8 (taskCall `{context, tasks}` shape): covered by neither predicate.** The committed
   `r50-taskcall.json` exists and was validator-shaped at dispatch, but no frozen check reads it, so
   the R50-8 repair is unverifiable *as a claim of the round* — exactly the r49 defect 6 shape
   ("wave claims without a committed receipt") recurring at one remove: now a committed artifact
   without a checking predicate. One-line close (r51 counter or Q42): assert
   `git show <rev>:.ufo/waves/round-N/rN-taskcall.json` parses with `context` and `tasks` keys.
2. **R50-10 (source trio): enforced by no exit-0 gate.** H1's ≥20/22 floor tolerates item 697 red
   once 693 is green (21/22 ≥ 20). Harm rules H2-H5 do not touch sources-check. A future round can
   ship a headerless knowledge entry with every frozen predicate green. Close: raise H1 to "both
   named red items green" in the r51 harm battery, or add a 697-shaped arm to that round's counter.
3. **Class A has no standing mechanical detector** (R50-1/R50-2 recur by construction until a close
   gate asserts them): `round-gate.mjs` already enumerates filed reports in `--tracked` mode — the
   natural, boring home for two one-line assertions: (i) `corpus/lessons/round-<N>.md` contains
   `^## Gate$`; (ii) for each filed report, the lane hash it cites is the lane tip at filing time
   (`git rev-list --count <cited>..HEAD` == 0) or the report carries `## Erratum`. This is the
   single-artifact fix for the whole class (covers R50-1 and R50-2 recurrence; Q41 already covers
   R50-5's subclass).
4. **Class-A wording trap already re-armed:** the R50-5 repair rewrote the two sentences to
   `all twelve` (`378b6e7`, SKILL.md:595/:598) — the same hand-maintained numeral that went stale at
   gate #12 will go stale at gate #13. The class-killing fix is to delete the numeral from prose
   ("all gates listed below"), not to update it. Q41 detects the drift but does not prevent it.

## 4. Recurring classes that still lack a standing rule (QUALITY.md candidates; ConnRepairs overlap)

- Q42 candidate — lesson shape at close: every round's lesson carries `## Mistakes` and `## Gate`
  before the report is filed (round-gate `--close` assertion; grounding: R50-2, r49 spotcheck §3).
- Q43 candidate — committed dispatch artifacts match the emitted shape: the round's taskCall/spec
  files parse as the validator emits (`{context, tasks}`), checked at the round's close, not only at
  dispatch (grounding: R50-8, r49 spotcheck defect 6).
- Q44 candidate — a landed instrument is pinned in the same round it lands (grounding: r49 M2/R50-7).
  Weaker need than Q42/Q43: PIN_UNPINNED already fails strict mechanically, so this is a who-checks
  rule, not a new detector.
- Already covered by standing rules landed this round: Q39 (class B), Q40 (class D), Q41 (class A's
  count subclass). Do not duplicate.

## 5. Connector synthesis (one bounded move)

**Move:** extend `scripts/round-gate.mjs` (`--tracked`/`--close`) with the two class-A assertions of
§3.3 — lesson `## Gate` presence and report-cited-hash==tip-or-erratum. One artifact, fail-closed,
selftestable, runs at the moment the r49 failure occurred (report filing), covers the only root class
with no standing detector, and costs nothing to the two frozen predicates (they are already frozen;
this is r51-harm-battery/QUALITY material, not a mid-round amendment).

- **Axes:** improves coverage (the audit surface stops depending on next-round spot-checks for 3 of
  10 routed items); operability unchanged-or-better (one more mechanical close check; no runtime
  surface touched). No axis harmed.
- **Risks:** (i) `--tracked` mode must tolerate the in-flight round (it already drops the highest N);
  (ii) the tip-vs-report assertion must read the hash the report cites, which requires the report's
  citation format to stay parseable — bound it to the existing "landed <hash>" convention;
  (iii) do NOT fold in R50-8/R50-10 arms mid-round — the counters are frozen; these land as r51
  candidates.
- **Verification (L1, at close):** `node scripts/round-gate.mjs --selftest` still PASS;
  `node scripts/proxy-check.mjs --strict` MATCH at the close commit (pin.cap-run re-pinned after the
  in-flight cwd-arm lands); the §2 matrix copied into `corpus/lessons/round-50.md`'s Gate/Frontier
  with R50-8/R50-10 named as uncovered-by-claims (the lesson's Mistakes M-… should carry flag §3.1).

## Commands run (evidence)

- `git log --oneline -6`; `git show 5b0de26 --stat`; `git show 378b6e7 --stat` + full diffs for
  `scripts/cap-run.mjs`, `scripts/proxy-check.mjs`, `SCORECARD.md`, `SKILL.md`, `corpus/README.md`,
  `corpus/SOURCES.md`, `corpus/knowledge/counter-amendment-discipline.md`, `corpus/QUALITY.md`.
- `git show 378b6e7:scripts/cap-run.mjs | sha256sum` → `64fafb42…` (= stanza `pin.cap-run`, HEAD
  consistent); `git show 5b0de26:scripts/cap-run.mjs | sha256sum` → `d8acc6de…` (pre-guard);
  `sha256sum scripts/cap-run.mjs` (working tree, in-flight) → `d9ba4179…`.
- `node scripts/proxy-check.mjs --strict` (working tree) → `PROXY: DRIFT (GATE_PIN_DRIFT
  term=pin.cap-run …)`. `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN`.
- Reads: `repairs50-probe.mjs:60-104` (R1-R8 internals), `QUALITY.md` Q21/Q39-Q41,
  `round-gate.mjs` header (REPORT_*/TREE_DIRTY/UNPUSHED arms), H1-freeze receipt, r49 spotcheck §5.

No tools installed or upgraded (nothing needed installing); no writes outside this report file.
