# RevScope — province and write-scope review (read-only)

Seat: RevScope (reviewer). Round 52, wave 1. Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin.
No lane file written outside this report. No tool installed or updated. No subagents, no background jobs.

## Verdict

- **C1 is inside kumitate's province** — core band, lane-owned instrument (`PROVINCE.md:15`).
- **C2 is inside kumitate's province** — frontier band "named ground, entered by sourced entries"
  (`PROVINCE.md:17`) plus the core learning registry (`PROVINCE.md:15`). It documents the lane's own
  gate instrument, which is the stronger in-band anchor if the frontier bullet is read narrowly.
- **No cross-domain bleed in either claim** into chousa (research method), kagi (secrets/vault),
  kotoba (prompt/skill craft) or kasegi/kagi (MCP/OAuth security practice). One *settled sibling
  precedent* (kake) shares the mechanism and must be cited, not absorbed — finding F1.
- **The wave's write pattern honours the lane read-only rule** at instruction level and in the
  observed tree snapshot; residual depends on the late seats (F4/F5).

Axes worked by this seat: province fit (both claims anchored in PROVINCE lines), bleed isolation
(adjacent charters checked by evidence, not assumption), write-boundary conformance (dispatch text +
working tree + fleet tree), evidence fidelity (every claim below carries a path).

## Axes declaration (Godspeed)

1. Named axes: `province_band_fit`, `cross_domain_isolation`, `write_scope_conformance`,
   `saturation_arithmetic_honesty`.
2. Cheap parallel moves: PROVINCE/MISSION/lane-config read; plan + wave spec + taskCall + validation
   read; sibling charter and corpus spot-walks; working-tree and fleet-tree status/timestamps.
3. Moves kept only when they improve one axis without harming another: every finding below is
   additive evidence; no frozen byte is proposed for change except the two explicit close-time
   bookkeeping repairs (F2) and the entry clause (F1), both L1-owned.
4. Frontier: the list stops where no actionable in-scope item remains (see Residual risk).

## C1 — operability, `receipt-attest` v2: IN PROVINCE (core band)

| Province line | Reading | Evidence that C1 sits on it |
|---|---|---|
| `PROVINCE.md:15` core | "The lane's own instruments `scripts/*.mjs` (registry: `SKILL.md` §Gate registry)" | `scripts/receipt-attest.mjs:2` names contract `kumitate-receipt-attest-v1` (added round 51); `SKILL.md:618` is its gate-registry row; `SKILL.md:709` is checklist item 23 (its hermetic suite); `SCORECARD.md:322` carries `pin.receipt-attest=44919763…` |
| `PROVINCE.md:13` core (origin surfaces) | Origin scripts/runtime are separate members | C1 touches only the lane-local `scripts/receipt-attest.mjs`; nothing under `/home/vgpnk/Projects/ufo-fsd-alpha/` is edited, so the "never patched from here" adjacent rule (`PROVINCE.md:24`) is not engaged |
| `MISSION.md:26` lane axes | `operability + coverage (orchestration/tooling)` | C1 is an operability capability move over a lane gate instrument |
| `MISSION.md:41` + `AXES.md` §Working the axes | 1–3 claims, distinct axes, ≥1 on the lowest-scoring non-retired axis | `SCORECARD.md:330` operability = 9 and is terminal under `f_O`; the top-level `coverage` axis is "Saturated, retired" at 10 and its live successors are at 10, so **operability is the lowest live axis** and C1 lands on it — the obligation is satisfied |

Plan framing is honest about its kind: `plan.md:47` calls C1 "capability deepening", additions-only
(`plan.md:65`), with v1 receipts still valid (B6). Domain fit ("orchestration & tooling —
OMP task/hub, ufo-fsd scripts & runtime", `PROVINCE.md:3`) holds because the object is the lane's
gate-counter invocation record; the wrapped commands are the lane's own gates (plan §Receipt
protocol).

## C2 — frontier, `fail-closed-clock-validation`: IN PROVINCE (frontier band + core registry)

- `PROVINCE.md:17`: "**Frontier — named ground, entered by sourced entries, not yet gated**" — the
  entry is exactly a sourced entry (`plan.md:100`), trio + S102/S103 + receipt-bound clauses.
- `PROVINCE.md:22`: "Durable-execution and multi-agent failure research (idempotency, timeouts,
  failure taxonomies) — `corpus/SOURCES.md` rows, queued." The entry's subject (fail-closed clock
  validation in a digest-bound receipt verifier: grammar → parse → finite+round-trip → ordering →
  window, plus TZ-independence) is receipt-idempotency/failure-taxonomy ground for the lane's own
  instrument. It is not general research doctrine.
- `PROVINCE.md:15`: the learning registry `corpus/SOURCES.md` and its `sources-check.mjs` gate are
  core; the C2 rows (S102/S103) and D52's E3/E4 checks sit on that line.
- Axis label: C2 is recorded as "frontier coverage" (`plan.md:55`). That matches round-49/round-51
  lane practice, but the top-level `coverage` axis is retired (SCORECARD `## Axes`). See F2 for the
  bookkeeping requirement.

Domain fit is the point to keep visible: RFC 3339 grammar is not kumitate's subject matter; the
*instrument's clock-validation failure modes* are. The entry keeps that frame (`plan.md:102-108`
content spec: R52-1/R52-8 as the case study), which keeps it in tooling rather than in chousa's
method or kake's publishing domain.

## Cross-domain bleed analysis

| Adjacent owner | Charter evidence | Verdict |
|---|---|---|
| **chousa** — research method | `chousa-shokunin/PROVINCE.md:5-6`: question framing, source hierarchy, citation chaining, claim-vs-source verification | **No bleed.** C2 uses the fleet-wide corpus sourcing mechanics to source its own instrument claim; it changes no method, no chousa gate, no chousa corpus. Adjacent evidence, reported as required by `PROVINCE.md:6`: chousa's round-26 `build/SrcRfc3339.md` already fetched the same RFC and proposed an (unwritten) S034 row; no chousa current-wave claim on this topic was found (`w1/ConnOverlap.md:4`, spot-checked here) |
| **kagi** — secrets/vault ops | `shokunin.conf:51`; `kagi-shokunin/PROVINCE.md:3` | **No bleed.** C1's nonce and sha256 values are integrity bookkeeping over public gate commands; no credential, vault or key material is read, stored or required. `SentSecrets` is lane-internal containment review, not kagi scope |
| **kotoba** — prompt/skill craft | `shokunin.conf:50`; `kotoba-shokunin/PROVINCE.md:3` ("SKILL.md/AGENTS.md quality, trigger fidelity") | **No bleed, conditional on diff discipline.** The integration touches `SKILL.md` only at the gate-registry row (`:618`), the contract label and checklist item 23 (`:709`) — expressly owned by `PROVINCE.md:15`. A prose/skill rewrite in `SKILL.md` would cross into kotoba; `ExecPinsRecipe` is scoped to "old-line -> new-line" only, so the dispatched instruction is narrow |
| **kasegi / kagi** — MCP/OAuth security practice | `PROVINCE.md:26` routes token passthrough / confused deputy there | **No bleed.** Local receipt anti-forgery (sidecar, digest, nonce ledger) is not OAuth/MCP token practice |
| **kake** — web properties/publishing | `kake-shokunin/corpus/SOURCES.md:40` (S032 RFC 3339, mined 2026-10-21); `kake-shokunin/corpus/knowledge/static-canonical-preflight.md:157-180` (parse, not prefix-compare; calendar/clock/offset; commit-time bounds) | **Shared mechanism, not absorbed scope.** Different object (publishing receipts vs lane invocation receipts) and different province. But the precedent is real and must be cited in the C2 entry — finding F1 |

kake's current round 45 is a witness-receipt audit (`c45_audit.py`, witness classes), not RFC 3339
(`w1/ConnOverlap.md:4` and its per-lane table; the lane's `w1-spec.json` carries zero `RFC 3339`/
`S032` hits). So this is prior art, not a live claim collision.

## Write pattern — does the wave honour the lane read-only rule?

**Dispatch evidence.** `w1-taskcall.json` is one `taskCall` object `{context, tasks}` with 64 unique
tasks (`ExecInstrumentV2` … `ExecLedgerRehearsal`). The shared context carries both constraints
verbatim: "the lane is READ-ONLY for you except your own aux dir … build/<YourSeatName>/ and your
report … w1/<YourSeatName>.md" and "NEVER write outside your own build/<SeatName>/ and
w1/<SeatName>.md in the lane; never touch the fleet repo, sibling lanes, lane jj state or git index,
MANIFEST.json, ~/.omp config, or .ufo/state|watchdog.log". `w1-validate.json` counts `spawn=64`,
`total=64`, policy band `waveMinLanes=64 / waveMaxLanes=128` — the frozen 64-seat band is met.

**Deliverable discipline.** Every one of the 64 items delivers into `build/<SeatName>/`:
`ExecInstrumentV2` → `build/ExecInstrumentV2/receipt-attest.mjs` + `selftest.txt`; `ExecPinsRecipe` →
delta files; `ScribeEntry` → full-text entry draft; `ScribeSources` → `SOURCES-delta.md` with the
explicit instruction "Do not edit corpus/SOURCES.md itself"; `ExecR50Repair` → "Produce a patched copy
at build/ExecR50Repair/repairs50-probe-v2.mjs"; `ExecProbeA52` → a `mktemp` tree with the v2
overlaid at `scripts/receipt-attest.mjs` *in the scratch tree*; mutation seats → scratch copies under
`build/`. No item instructs a lane write.

**Observed tree (snapshot ~2026-10-24T01:07 local, wave still running).**
- `git -C <lane> diff --name-only` → empty; no modified tracked file in the lane.
- `git -C <lane> status --porcelain -uall` untracked entries are confined to
  `.ufo/waves/round-52/` (`build/`, `w1/`, `w1-assignments.json`, `w1-registry.json`).
- 51 `build/` seat directories and 51 `w1/<SeatName>.md` reports at snapshot; every report name
  matches a roster seat name.
- No file under lane `corpus/`, `scripts/`, `SKILL.md`, `SCORECARD.md`, `README*` or the fleet repo
  is attributable to a seat. This agrees with `w1/SentScope.md` (its Low is the coordinator metadata
  paths, F4 below).
- Symlinks exist only inside `build/RevCounterA/scratch/{repo,out}/receipt-link.txt` and resolve to
  the lane probe `probe/attest52-probe.mjs` (read target); no write-through occurred (probe bytes are
  unchanged in git). Seven nested `.git` scratch trees live under `build/` — all inside the
  authorized aux dirs, matching the round-51 precedent for full-tree forgery controls.
- Fleet tree: modified `SCORECARD.md` (mtime 2026-10-23 20:10), `AGENTS.md` (10-22), `.omp/mcp.json`
  (10-22), `.ufo/state/kumitate.report-baseline` (00:27) all predate the wave dispatch artifacts
  (`w1-spec.json` 00:56, `w1-taskcall.json` 00:57); `.ufo/watchdog.log` (00:58) is driver-owned.
  mtimes are not provenance, but no kumitate round-52 path appears in the fleet status list.

**Verdict: PASS at instruction and snapshot level.** The boundary is enforced by the shared context,
which every one of the 64 tasks inherits; the late seats are the residual (SentScope is the late
audit and its report is already consistent).

## Findings by severity

### F1 — LOW-MEDIUM: C2's sibling precedent is real and unmentioned in the frozen C2 text

`kake-shokunin/corpus/SOURCES.md:40` carries S032 (RFC 3339, mined) and
`kake-shokunin/corpus/knowledge/static-canonical-preflight.md:157-180` already teaches "parsed, not
prefix-compared — real calendar/clock fields … no later than the revision's committer instant" with a
"local profile" caveat. `plan.md:102` says only "second sourced entry after round 51's
invocation-attestation", which is true within kumitate and contains no "first in the fleet" sentence,
so this is not a false frozen claim. The risk is in the *entry body* and the scorecard row: if either
presents generic timestamp validation as new ground, it is false. `ScribeEntry`'s content spec does
not require the citation, and D52's E1–E5 do not check it.
Smallest remediation (L1, additive, no frozen byte changes): one clause in
`corpus/knowledge/fail-closed-clock-validation.md` citing kake S032 + the preflight precedent and
naming the kumitate increment (Node invocation `wall_start`/`wall_end`, the `.sssZ` canonical profile
and finite+round-trip, TZ-independent prelude binding). `w1/ConnOverlap.md:4` reaches the same
recommendation independently.

### F2 — LOW-MEDIUM: province/axis bookkeeping for C2

`PROVINCE.md:22` still reads "`corpus/SOURCES.md` rows, queued" and names no knowledge entries; round
51 admitted `invocation-attestation` under that line without amending PROVINCE. C2 is defensible
(two hooks above), but the lane should make the mapping explicit at close: amend the frontier bullet
to name the invocation-receipt/clock line (advancing "queued" to named ground), or anchor the
SCORECARD C2 row to `PROVINCE.md:15`. Separately, the top-level `coverage` axis is retired at 10 with
successors at 10; `AXES.md` requires a per-axis verdict even for capability/frontier moves. The
`ScribeScorecard` item says "frontier coverage" but not which verdict form to record — L1 should
record the frontier-move (noun moved from PROVINCE frontier into corpus) verdict explicitly, not a
numeric coverage move.

### F3 — LOW: attack-seat arithmetic disagrees across three artifacts

- `plan.md:7`: "this wave carries 25 attack seats = 39%".
- Dispatch commit `66766f7`: "37.5% attack" (= 24/64).
- Actual roster (`w1-spec.json` roles): reviewer 13 + critic 6 + mutation-tester 5 + sentinel 2 +
  revenger 1 = **27/64 = 42.2%**.

The ≥25% floor stated in the wave context holds under every reading, so no policy breach. But
`ScribeReport` is instructed to print "25/64 attack seats" (`w1-spec.json`), which will disagree with
the roster. Also, `scripts/hyaku/ufo-wave-policy-v2.json` contains no attack-role enumeration (checked
whole file: budgets, membrane, sighting, nativeProfiles, fixtures, lanes, substrates, targets), so
the floor is defined only by wave-context prose. Remediation: L1 derives the count from the roster
(27) or names the classification rule used, in the report and SCORECARD.

### F4 — LOW: SentScope's allowlist omits coordinator metadata paths

Corroborated: `.ufo/waves/round-52/{w1-assignments.json,w1-registry.json}` (and the tracked
`w1-spec/validate/taskcall.json`) are outside the enumerated set in the SentScope item
(`plan.md`/`probe/`/`base/`/`w1/<SeatName>.md`/`build/<SeatName>/`). They are dispatcher/validator
outputs (registry `schema: ufo-swarm-wave-v1`, seat→agent map; created after the dispatch commit),
not seat writes. The audit's allowlist should name them, or the next round's SentScope template will
keep flagging the round's own dispatch machinery.

### F5 — INFO: fleet-attribution gap is narrowed but not closed

`w1/SentScope.md` marks fleet cleanliness "inconclusive". The mtime evidence above shows the modified
fleet SCORECARD.md, AGENTS.md, `.omp/mcp.json` and kumitate baseline predate the wave dispatch, and
`watchdog.log` is driver-owned. Nothing proves a seat did not write fleetside, but no round-52 path is
present. Treat the fleet tree as operator/driver state until the fleet owner reconciles it.

### F6 — INFO: non-author re-open is declared, not executed

`ScribeEntry`'s `verified-at:` line intentionally says "(wave fetch; non-author re-open pending)".
CORPUS.md's trio contract (`CORPUS.md:163-165`) does not require a re-open, so this is honest, but
the single-wave shape has no non-author re-open seat and D52 does not check one. Round 51's tier-A
practice did re-open. Residual, already declared in the artifact.

### F7 — INFO: computed A growth will pressure H3's PROXY conjunct

51+ seat build directories add runnable `.mjs` files under the lane tree; the round-51 SCORECARD
terms recorded computed A moving exactly this way and Q26 excludes transient working-tree A from
claim evidence. H3's `PROXY: MATCH` at close must re-derive the stanza against the final tree and
quote declared-vs-computed terms honestly (R51-2 phrasing). Not a province defect; flagged because a
naive close reading will see drift that is not a claim failure.

## Residual risk and verification gaps

- Snapshot, not a final audit: 51 of 64 w1 reports existed at review time. A late seat can still
  breach the write boundary; `SentScope` is the late audit seat, and its report currently agrees with
  this one.
- ConnOverlap's 17-lane phrase walk was not repeated in full. Spot-verified here: kake S032 and its
  knowledge entry, chousa round-26 RFC 3339 artifact (S034 proposal never written), and no live
  kumitate-r52 topic match in the sibling wave specs I read.
- `xd://lsp` is not mounted in this harness (`No such tool: xd://lsp. Mounted devices: ast_edit,
  debug`). This review is document/province evidence only; no semantic code-definition claim is made,
  so text evidence is the correct instrument and no cold-index absence is recorded as proof.
- Tooling: no installs or upgrades (nothing was needed).
- L1 duties not verifiable from this seat: the integration writes itself (instrument, pins, SKILL
  row, SCORECARD stanza, README row, entry, SOURCES rows, lesson, Q44, LOG), the three spaced receipt
  runs, and the R52-11 close discipline. Province verdicts above are about scope, not about those
  artifacts having landed correctly.

**Province conclusion.** Both claims are in-band. C1 is a core-band instrument capability; C2 is a
frontier sourced entry that doubles as documentation of a core-band instrument. No chousa, kagi,
kotoba or kasegi scope is absorbed. The wave's write pattern honours the lane read-only rule at
instruction level and in the observed tree. Close-time actions worth carrying: F1 (prior-art clause),
F2 (province/axis bookkeeping), F3 (attack-count arithmetic).
