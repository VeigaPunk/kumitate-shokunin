# SCORECARD.md additions — round 63 (draft for the L1 integrator)

Seat `K63R2ScribeLogScorecard`. Target file: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md`
(integration-owned; this file is a draft and is not applied). Freeze `b38a2065ab8ac5b198f6569b9013d04411c3d40d`,
base `dfa6fca8f362e9c962f5b940025a2619380b759b`, wave-1 landing `05b3176`, measured integration revision
`a9531c8e617338fd16cb69c61344ef8f17711117`. Append-only: no existing paragraph is rewritten.

- Every number below is either (a) quoted from committed bytes with the command that produced it, or
  (b) a `{{L1:…}}` token. The tokens are listed together at the end; none may be replaced by an
  unmeasured value.
- **I5 constraint (mechanical):** the frozen probe reads the capability row with
  `cells = row.split('|').map(trim)` and requires `cells[cells.length - 2] === '63'`. The row must
  have exactly four cells and end with `| 63 |` — no note cell, no trailing marker text inside the row.
- The R61-V2 retirement correction appends after the round-63 section as its own `##` section.

---

## A. Capabilities row — `inline-dispatch-evidence` (enter only if C1 is HELD)

`{{L1:enter this row only if C1 reads INLINE63_HELD held=6/6 checks=6 exit 0 at the measured revision. If C1 is UNMET, do not enter it; record the MISS in Part B. A row entered on a MISS would also make I5 read held on a false premise.}}`

Insert **after** the `dispatch-evidence` row (line 1795) and **before** the line
`*Round-48 note (capabilities; the paragraphs above stay as written).*`:

| `inline-dispatch-evidence` | Read a run-7 **inline** wave's actual dispatch and judge it against three records the lane does not author: one host session transcript per seat under the harness sessions root (`# Seat <name>` marker, the dispatched task's tail, the context head, a `session` header, a `session_exit` record, a `yield` tool call for a finished seat), the orchestrator dispatcher log (`spawned <lane> <round> <wave> <n>` and `done <lane> <wave> <results path>`), and committed bytes only when `--rev` is given (`git show REV:path`, never the worktree). A wave with seats but no matching transcript is `NOT_A_DISPATCH`; a transcript that is not this seat's is `SESSION_FOREIGN`; two seats on one session id `SESSION_ID_DUP`; also `SESSION_ABSENT`, `DONE_LOG_ABSENT`, `DONE_LOG_NO_DISPATCH`, `DEAD_UNNAMED`, `DEAD_MISMATCH`; fail-closed `SESSIONS_ROOT_ABSENT` / `SPAWN_LOG_ABSENT` / `WAVE_DISPATCH_ABSENT` / `RESULTS_ABSENT` / `UNPARSEABLE_RECORD`. Exit 0 CLEAN, 1 DRIFT, 2 FAIL-CLOSED, 64 usage (contract `kumitate-inline-dispatch-evidence-v1`; a run-7 wave has no `launcher-progress.tsv`, so `dispatch-evidence` cannot read it) | `node scripts/inline-dispatch-evidence.mjs --selftest` → `INLINE_DISPATCH_SELFTEST: PASS (25/25)` exit 0; live controls `controls/inline/` (44 committed cases, `controls/inline-receipts.txt`): `{{L1:after:n/44 AS-EXPECTED, receipts re-run from committed bytes}}` | 63 |

Notes for the integrator (not part of the row):

- The selftest line is the one the gate prints at the freeze bytes (reproduced on the
  `git archive b38a2065` extraction by wave-1 seats): `INLINE_DISPATCH_SELFTEST: PASS (25/25)`, exit 0.
- The row must not claim an axis move: the operability integer stays 9 (Part B, "Score delta").
- The gate is not the frozen byte: `scripts/inline-dispatch-evidence.mjs` changed between freeze
  (`a05eb756…`) and tip (`8e60cd6c…`) via the wave-1 ratchet (five shape arms). The row text above
  describes the tip bytes; the frozen probe does not hash the gate, so the row is written against the
  committed tip.

---

## B. Section skeleton — append at EOF, after the round-62 section's closing line (2952)

```markdown
## Round 63 — claims, verdicts, limits (2026-10-25)

Plan `.ufo/waves/round-63/plan.md` (frozen at `b38a2065ab8ac5b198f6569b9013d04411c3d40d`, base
`dfa6fca8f362e9c962f5b940025a2619380b759b`). Measured revision `{{L1:after:M full hash}}`, tip
`{{L1:after:T full hash, default M}}`. Round 62 was rejected-honest-stop and declared no claims; this
round's claims are frozen in the plan before the first `.ready` marker (Q58). Frozen counters and
controls are never edited by a wave seat; a wrong counter is reported, not patched.

**C1 — operability, capability acquisition `inline-dispatch-evidence` (contract
`kumitate-inline-dispatch-evidence-v1`, frozen `INLINE63_HELD` I63 v1, I1..I6).** A run-7 wave is
spawned inline by the orchestrator session, so the lane's only dispatch gate (`dispatch-evidence`,
which reads `launcher-progress.tsv`) cannot read it and nothing in the lane verified that a round's
seats ran. The new gate binds one wave to three records the lane does not author: the harness's
per-seat session transcripts under `~/.omp/agent/sessions`, the orchestrator dispatcher log
(`/fast/scratch/hyaku-run7/dispatcher.log`), and committed bytes only (`--rev`, `git show REV:path`).
Counting command:
`node .ufo/waves/round-63/probe/inline63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> [<T>]`.
Before at base `dfa6fca8`: `INLINE63_UNMET held=0/6 checks=6 rev=dfa6fca8f362e9c962f5b940025a2619380b759b
rule=I63` exit 1 (`base/inline63-base.txt`: tool, waves, controls, row and receipt all absent). At the
freeze rev `b38a2065` the same command read `INLINE63_UNMET held=1/6` exit 1 — I1 held
(`INLINE_DISPATCH_SELFTEST: PASS (25/25)`), I2/I4 MISS `no-committed-wave-results`, I3 MISS
`forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH` (empty `sessions/` tree untrackable in git), I5
MISS `row-absent`, I6 MISS `tip-receipt-absent`. After at `{{L1:after:M}}`:
`{{L1:after:INLINE63_HELD held=6/6 checks=6 rev=M rule=I63}}` exit 0
(`{{L1:after:close/inline63-tip.txt}}`; first line `rev=<M>`, quoting every wave's CLEAN line — I6).
Controls: `controls/inline/` holds 44 committed cases (one honest — a harness-shaped transcript — and
43 each altering one thing a forging or do-nothing lane could alter), generated by the independent
writer `probe/make-inline-controls.mjs`; `{{L1:after:every case exits as its expect names (controls/inline-receipts.txt, n/44)}}`. Real-data honest controls: `controls/inline-real-hosts.txt`
(kengaku r35 build/falsify and mori r47 w2 CLEAN; 15 older inline waves DRIFT). Waves: wave 1, 40
seats (committed `w1-results.json`), build + first falsifiers; wave 2 (>= 40 seats) only if wave 1
yields >= 32 distinct attack items; I2 reads every committed `.ufo/waves/round-63/<wave>-results.json`,
requires `INLINE_DISPATCH: CLEAN` per wave, >= 32 seats per wave and 64..100 seats summed.
`{{L1:after:wave names, seats per wave, seat sum (I2)}}`. Score delta: none; operability stays 9 — the
frozen `f_O` proxy's terminal value; the moved surface is the repertoire, not the number.

**C2 — coverage frontier, coordinator topology (sourced claim; the retired coverage aggregate stays
10).** `PROVINCE.md` gains the band *multi-agent coordinator topology* with a first admitted entry,
`corpus/knowledge/multi-agent-coordinator-topologies.md`, grounded on two rows opened this round
(S196: a vendor's managed-agent coordinator contract; S197: the measured scaling study, version-pinned
to arXiv 2512.08296 v3), entering via the flip condition recorded in `corpus/lessons/round-60.md`
and `corpus/lessons/round-61.md`. Frozen predicate `TOPOLOGY63_HELD` (rule T63 v1, T1..T7). Counting
command: `node .ufo/waves/round-63/probe/topology63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`.
Before at base `dfa6fca8`: `TOPOLOGY63_UNMET held=1/7 checks=7
rev=dfa6fca8f362e9c962f5b940025a2619380b759b rule=T63` exit 1 (`base/topology63-base.txt`; only the
census arm T6 passes). After at `{{L1:after:M}}`:
`{{L1:after:TOPOLOGY63_HELD held=7/7 checks=7 rev=M rule=T63}}` exit 0
(`{{L1:after:close/topology63-tip.txt receipt}}`). Controls: `controls/topology/` holds one honest
fixture and eleven single-fault variants (`controls/topology/summary.txt`): `c0-honest` reads
`TOPOLOGY63_HELD held=7/7` and each `f1..f11` reads `UNMET` naming the arm it breaks. Registry:
census before `134` rows, exit 0, six W04 warnings (`base/census-before.txt`); rows S196/S197 land at
`05b3176` (SOURCES rows 134 -> 136, committed bytes); `{{L1:after:census after: rows, exit, warnings}}`.
`{{L1:after:which S-ids the entry cites, their captures and pins (T2/T3)}}`.

**Counter holes found by wave 1 (reported; the frozen counters are not patched).** (1) C1: the
probe executes the measured revision's own tool and trusts its stdout (I1/I2/I4), so a 21-line stub
tool printing the expected lines reads `INLINE63_HELD held=6/6 checks=6` exit 0
(K63CriticC1Predicate-1, K63ReviewProbeC1-1); I2's seats come from the tool's own CLEAN line and I2
passes no `--report`, so dead seats never count (K63CriticC1Predicate-2). (2) C2: T5's live fetch is
pointed at the lane-authored URL, so a row whose only source is attacker-hosted (loopback) reads
`TOPOLOGY63_HELD held=7/7` exit 0 (K63ReviewProbeC2-1; K63CriticC2Predicate-2); an honest C2-shaped
fixture and all six assigned forgeries read HELD 7/7, so T63 v1 does not measure its own adjectives
(K63CriticC2Predicate-7). (3) I3: the frozen control `forged-no-sessions` lost its empty
`sessions/` tree to `git archive`, so I3 could not pass at any revision until repaired
(K63CriticFreezeIntegrity-1, K63ExecCounterReplay-1, K63ScribeScorecard-1).

**Post-freeze ratchet (plan.md C1, monotone — never a relaxation).** `controls/CHANGES-AFTER-FREEZE.md`
records: (1) a tracked `sessions/orch/.keep` in every inline control case, so I3 is satisfiable from
committed bytes; (2) the committed honest case reshaped from a five-row stub to a harness-shaped
transcript, and the gate gained five shape arms; (3) cases 14 -> 44 (5 from K63ReviewGateCode, 13
from K63ExecGateForgery, 12 from K63MutateInlineGate; the rev-mode-only case `mut-rev-report-absent`
dropped at tip `a9531c8e`); the I3 floor (10) and the rule text are unchanged; (4) the frozen probes
`inline63-probe.mjs` / `topology63-probe.mjs` and the C2 controls are NOT changed. A finding that a
frozen counter is wrong is reported, never patched by a seat.

**QUALITY (not capability claims).** Q58 (plan-before-ready) and Q59 (host-record dispatch evidence)
landed in `corpus/QUALITY.md` with `scripts/plan-before-ready.sh` (Q58's helper). Q58 is a helper
under the quality criterion, **not a capability claim**: no capabilities row enters for it or for
Q59. Round 62 fails Q58 (no `plan.md`; plan-before-ready reads `FAIL reason=NO_PLAN`), round 63
passes it.

**Maintenance repairs (not claims).** The round opened with two live defects. `proxy-check`
FAIL-CLOSED: `PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 330: pin.make-dispatch-actual is not a
kumitate-gate-pins-v1 key`, `EXIT=2` (`base/proxy-before.txt`) — round 62 landed the pin key without
teaching `proxy-check`; the key is now a GATE_PINS entry (`scripts/proxy-check.mjs:479`). `readme-map`
DRIFT: `README_MAP: DRIFT files=151 rows=150 covered=150 bad=2
first=uncovered:lessons/round-62-verifier-spotcheck.md`, `EXIT=1` (`base/readme-map-before.txt`) — the
round-62 spot-check file was unmapped.
`{{L1:after:both read clean at the tip, with the commands and their lines}}`.

**Waves and admission.** `{{L1:after:wave roster: w1 40 seats; w2 if declared; dead seats named}}`.
Admission: `{{L1:after:each claim HELD/UNMET as its counter printed}}`. No axis score changed: no
integer can move (operability is at the frozen proxy's terminal 9; coverage:script-layer,
coverage:runtime-layer, coverage:kimi-layer and the retired aggregate are at 10), so the verdict is the
counter, not a number. `{{L1:after:proxy stanza terms after the maintenance repairs, PROXY: MATCH}}`.

**Limits.** (a) Stated in the plan and unchanged: a lane that also writes faithful transcripts into the
host session store and lines into the orchestrator's log defeats the gate; those two records live
outside the repository and only the non-author closure re-derives them. (b) Counter holes above are
reported, not patched; C1's reported stub-tool and dead-seat holes remain open unless wave 2 closes
them. (c) T5 fetches each cited URL live: a source that becomes unreachable after the round makes the
counter MISS, and the entry's quotes stay re-locatable only against the pinned captures. (d) The
topology control receipts cite fixture revisions that are not archived in this lane, so those twelve
readings are not re-derivable from committed bytes. `{{L1:after:further limits the waves named}}`.
```

---

## C. Append-only correction — retire the inherited `dispatch61` / `doctrine61` predicates (R61-V2)

Append **after** Part B, as its own `##` section:

```markdown
## Round 63 correction — append-only R61-V2 retirement (2026-10-25)

Appended correction; the round-61 and round-62 paragraphs above are not rewritten and stay as history.

- **`DISPATCH61_HELD` (rule P61 v1) and `DOCTRINE61_HELD` (rule D61 v1) are retired as live counting
  predicates.** Round 61 already recorded why: the C1 predicate was satisfied by a do-nothing control
  (a hand-written progress file, a dispatch record and 32 one-line reports, no seat ever ran), and the
  C2 predicate's row parser read cells of an 11-cell contract row with a POSIX class JavaScript does
  not implement, so no honest row could satisfy it. A predicate a forgery satisfies, or an honest row
  cannot, is not a predicate. Their probes (`probe/dispatch61-probe.mjs`,
  `probe/doctrine61-probe.mjs`) remain as round-61 bytes; no round after 63 may cite either counting
  command.
- **Superseded by** `INLINE63_HELD` (rule I63 v1, §Round 63 C1) for dispatch evidence and
  `TOPOLOGY63_HELD` (rule T63 v1, §Round 63 C2) for the sourced-entry frontier.
- **What carries the retired forgeries.** The round-61 C1 zero-seat fabrication is carried as
  `controls/inline/forged-no-sessions` (expect `1 NOT_A_DISPATCH`), `reports-28-bytes`
  (`1 REPORT_TINY`) and `reports-identical` (`1 REPORT_DUP`); the round-61 C2 forgery (a phantom row
  outside `## Registry`, a fabricated capture, no fetch) is carried as `controls/topology/f2-phantom-row`
  (`T2 MISS`), `f1-forged-capture` (`T5 MISS`) and `f6-capture-edited` (`T3 MISS`). Readings of
  record: `controls/inline-receipts.txt` and `controls/topology/summary.txt`.
- **The R60 `dispatch-evidence` row stays history only** (first-working round 60 was never admitted;
  R61-V3), and round-62 inherited probes are byte-identical copies of the failed round-61 counters —
  neither is a live predicate.
- **Repair recorded.** The freeze-era `forged-no-sessions` case did not reproduce from committed bytes
  (empty `sessions/` tree untrackable in git; gate read `SESSIONS_ROOT_ABSENT` exit 2 instead of
  `NOT_A_DISPATCH` exit 1) until the ratchet added `sessions/orch/.keep` (Part B, Post-freeze
  ratchet). `{{L1:after:re-run receipt of the amended case from committed bytes (controls/inline-receipts.txt)}}`.
```

---

## Tokens — every `{{L1:…}}` placeholder used above (post-wave-2 measurements)

1. `{{L1:after:M full hash}}` — measured revision M (expected `a9531c8e617338fd16cb69c61344ef8f17711117` unless the L1 lands more).
2. `{{L1:after:T full hash, default M}}` — tip T for I6.
3. `{{L1:after:INLINE63_HELD held=6/6 checks=6 rev=M rule=I63}}` — C1 counter output at M (exit 0), or the UNMET line if not held.
4. `{{L1:after:close/inline63-tip.txt}}` — I6 receipt path/bytes (first line `rev=<M>`, every wave's CLEAN line).
5. `{{L1:after:every case exits as its expect names (controls/inline-receipts.txt, n/44)}}` — I3 control receipts re-run from committed bytes.
6. `{{L1:after:wave names, seats per wave, seat sum (I2)}}` — I2 wave lines and the 64..100 sum.
7. `{{L1:after:TOPOLOGY63_HELD held=7/7 checks=7 rev=M rule=T63}}` — C2 counter output at M (exit 0), or the UNMET line.
8. `{{L1:after:close/topology63-tip.txt receipt}}` — C2 close receipt path/bytes.
9. `{{L1:after:census after: rows, exit, warnings}}` — census at M after the registry append.
10. `{{L1:after:which S-ids the entry cites, their captures and pins (T2/T3)}}` — entry row bindings.
11. `{{L1:after:wave roster: w1 40 seats; w2 if declared; dead seats named}}` — both waves' rosters.
12. `{{L1:after:each claim HELD/UNMET as its counter printed}}` — admission verdicts.
13. `{{L1:after:proxy stanza terms after the maintenance repairs, PROXY: MATCH}}` — maintenance gate readings.
14. `{{L1:after:both read clean at the tip, with the commands and their lines}}` — proxy-check/readme-map at M.
15. `{{L1:after:further limits the waves named}}` — wave-2 limits to record.
16. `{{L1:after:re-run receipt of the amended case from committed bytes (controls/inline-receipts.txt)}}` — repair receipt (Part C).
17. `{{L1:enter this row only if C1 reads INLINE63_HELD held=6/6 checks=6 exit 0 at the measured revision. If C1 is UNMET, do not enter it; record the MISS in Part B. A row entered on a MISS would also make I5 read held on a false premise.}}` — capabilities-row gate.
