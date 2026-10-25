# SCORECARD.md additions — round 63 (draft for the L1 integrator)

Seat `K63ScribeScorecard`. Target file: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md`
(integration-owned; **this file is a draft and is not applied**).

- Freeze: `b38a2065ab8ac5b198f6569b9013d04411c3d40d` (plan `.ufo/waves/round-63/plan.md`, counters
  `probe/inline63-probe.mjs` + `probe/topology63-probe.mjs`, `controls/`, `base/`). Base:
  `dfa6fca8f362e9c962f5b940025a2619380b759b`.
- Every number below is either (a) quoted from committed bytes with the command that produced it, or
  (b) a `{{L1:…}}` token the integrator replaces with a measured value. No token may be replaced by an
  unmeasured value: an unrun check has not passed.
- Append-only: no existing paragraph is rewritten. Part A is one table row; Part B appends at EOF;
  Part C appends after Part B; Part D is one paragraph inside the existing `## Saturation` list.
- **I5 constraint (mechanical):** the probe reads the row with
  `cells = row.split('|').map(trim)` and requires `cells[cells.length - 2] === '63'`. The row MUST have
  exactly four cells and MUST end with `| 63 |` — no note cell, no trailing marker text inside the row.

---

## A. Capabilities row — `inline-dispatch-evidence`

{{L1:enter this row only if C1 is HELD at the measured revision (`INLINE63_HELD held=6/6 checks=6` exit 0).
If C1 is UNMET, do not enter it: record the MISS in Part B instead. A row entered on a MISS would also
make I5 read held on a false premise.}}

Insert **after** the `dispatch-evidence` row and **before** the line
`*Round-48 note (capabilities; the paragraphs above stay as written).*`:

| `inline-dispatch-evidence` | Read a run-7 **inline** wave's actual dispatch and judge it against three records the lane does not author: one host session transcript per seat under the harness sessions root (`# Seat <name>` marker, the dispatched task's tail, the context head, a `session` header, a `session_exit` record, a `yield` tool call for a finished seat), the orchestrator dispatcher log (`spawned <lane> <round> <wave> <n>` and `done <lane> <wave> <results path>`), and committed bytes only when `--rev` is given (`git show REV:path`, never the worktree). A wave with seats but no matching transcript is `NOT_A_DISPATCH`; a transcript that is not this seat's `SESSION_FOREIGN`; two seats on one session id `SESSION_ID_DUP`; also `SESSION_ABSENT`, `SESSION_AMBIGUOUS`, `PARENT_MISMATCH`, `SPAWN_LOG_ABSENT`, `SPAWN_LOG_MISMATCH`, `DONE_LOG_ABSENT`, `REPORT_ABSENT`, `REPORT_TINY`, `REPORT_DUP`, `RESULTS_MISMATCH`, `READY_MISMATCH`, `DISPATCH_MISMATCH`; a dead seat (transcript present, no `yield` or no clean `session_exit`) is named and never credited as done, and is `DEAD_UNNAMED` only when `--report` does not name it; fail-closed `WAVE_ABSENT` / `DISPATCH_UNREADABLE` / `RESULTS_UNREADABLE` / `SESSIONS_ROOT_ABSENT` / `LOG_UNREADABLE` / `REV_UNREADABLE`. Exit 0 CLEAN, 1 DRIFT, 2 FAIL-CLOSED, 64 usage (contract `kumitate-inline-dispatch-evidence-v1`; the launcher-progress gate `dispatch-evidence` cannot read an inline wave — there is no `launcher-progress.tsv` for a wave the orchestrator session spawns itself) | `node scripts/inline-dispatch-evidence.mjs --selftest` → `INLINE_DISPATCH_SELFTEST: PASS (25/25)`; `node .ufo/waves/round-63/probe/inline63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> [<T>]` → `INLINE63_HELD held=6/6 checks=6 rev=<M> rule=I63` exit 0; 14 committed control cases under `.ufo/waves/round-63/controls/inline/` (`controls/inline-receipts.txt`) plus the real-host sweep over completed inline waves (`controls/inline-real-hosts.txt`: kengaku r35 build/falsify and mori r47 w2 CLEAN, 15 older waves DRIFT) | 63 |

Notes for the integrator (not part of the row):

- The selftest line is the one the gate prints at the freeze bytes:
  `node scripts/inline-dispatch-evidence.mjs --selftest` → `INLINE_DISPATCH_SELFTEST: PASS (25/25)`,
  exit 0 (reproduced on the `git archive b38a2065` extraction).
- `controls/inline-receipts.txt` currently records `forged-no-sessions exit=1 want=1 NOT_A_DISPATCH`,
  which is **not** what committed bytes produce (see Part C, last bullet, and the seat report's finding
  K63ScribeScorecard-1). If the case is amended, cite the amended receipt; do not cite the current one
  as a passing reading.
- The row must not claim an axis move: the operability integer stays 9 (Part B, "Score delta").

---

## B. Section skeleton — append at EOF, after the round-62 section's closing line

```markdown
## Round 63 — claims, verdicts, limits (2026-10-25)

Plan `.ufo/waves/round-63/plan.md`, frozen at `b38a2065ab8ac5b198f6569b9013d04411c3d40d`; base
`dfa6fca8f362e9c962f5b940025a2619380b759b`. Measured revision `{{L1:after:M full hash}}`, tip
`{{L1:after:T full hash, default M}}`. Round 62 was rejected-honest-stop and declared no claims; this
round's claims are frozen in the plan before the first `.ready` marker. Frozen counters and controls
are never edited by a wave seat; a wrong counter is reported, not patched.

**C1 — operability, capability acquisition `inline-dispatch-evidence` (contract
`kumitate-inline-dispatch-evidence-v1`).** A run-7 wave is spawned inline by the orchestrator session,
so the lane's only dispatch gate (`dispatch-evidence`, which reads `launcher-progress.tsv`) cannot read
it and nothing in the lane verified that a round's seats ran. The new gate binds one wave to three
records the lane does not author: the harness's per-seat session transcripts under
`~/.omp/agent/sessions`, the orchestrator dispatcher log (`/fast/scratch/hyaku-run7/dispatcher.log`),
and committed bytes only (`--rev`, `git show REV:path`). Frozen predicate `INLINE63_HELD` (rule I63
v1, checks I1..I6). Counting command:
`node .ufo/waves/round-63/probe/inline63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> [<T>]`.
Before at base `dfa6fca8`: `INLINE63_UNMET held=0/6 checks=6 rev=dfa6fca8f362e9c962f5b940025a2619380b759b
rule=I63` exit 1 (`base/inline63-base.txt`: tool, waves, controls, row and receipt all absent). At the
freeze rev `b38a2065` the same command reads `INLINE63_UNMET held=1/6 checks=6
rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d rule=I63` exit 1 — I1 held
(`INLINE_DISPATCH_SELFTEST: PASS (25/25)`), I2 and I4 MISS `no-committed-wave-results` (no
`.ufo/waves/round-63/<wave>-results.json` is committed yet), I3 MISS
`forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH`, I5 MISS `row-absent` (the row is this change), I6
MISS `tip-receipt-absent`. After at `{{L1:after:M}}`: `{{L1:after:INLINE63_HELD held=6/6 checks=6
rev=M rule=I63}}` exit 0 (`{{L1:after:close/inline63-tip.txt}}`; first line `rev=<M>`, quoting every
wave's CLEAN line — I6). Controls: `controls/inline/` holds 14 committed cases (one honest, thirteen
each altering one thing a forging or do-nothing lane could alter), generated by the independent writer
`probe/make-inline-controls.mjs`; `{{L1:after:every case exits as its expect names (controls/inline-receipts.txt,
n/14)}}`. Real-data honest controls: `controls/inline-real-hosts.txt` (kengaku r35 build/falsify and
mori r47 w2 `INLINE_DISPATCH: CLEAN`; 15 older inline waves DRIFT). Waves: wave 1, 40 seats, build +
first falsifiers; wave 2 (>= 40 seats) only if wave 1 yields >= 32 distinct attack items; I2 reads
every committed `.ufo/waves/round-63/<wave>-results.json`, requires `INLINE_DISPATCH: CLEAN` per wave,
>= 32 seats per wave and 64..100 seats summed. `{{L1:after:wave names, seats per wave, seat sum}}`.
Score delta: none. The operability integer stays 9 — the frozen `f_O` proxy's terminal value; the
moved surface is the repertoire (a runnable gate that fails on a real defect), not the number.

**C2 — coverage frontier, coordinator topology (sourced claim; the retired coverage aggregate stays
10).** `PROVINCE.md` gains the band *multi-agent coordinator topology* with a first admitted entry,
`corpus/knowledge/multi-agent-coordinator-topologies.md`, grounded on two rows opened this round
(a vendor's managed-agent coordinator contract and the measured scaling study, version-pinned to arXiv
v3), entering via the flip condition recorded in `corpus/lessons/round-60.md` and
`corpus/lessons/round-61.md`. Frozen predicate `TOPOLOGY63_HELD` (rule T63 v1, checks T1..T7). Counting
command: `node .ufo/waves/round-63/probe/topology63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`.
Before at base `dfa6fca8`: `TOPOLOGY63_UNMET held=1/7 checks=7
rev=dfa6fca8f362e9c962f5b940025a2619380b759b rule=T63` exit 1 (`base/topology63-base.txt`; only the
census arm T6 passes). At the freeze rev `b38a2065`: the same `held=1/7` — entry absent, and
`git show b38a2065:PROVINCE.md | grep -c coordinator` → `0`. After at `{{L1:after:M}}`:
`{{L1:after:TOPOLOGY63_HELD held=7/7 checks=7 rev=M rule=T63}}` exit 0
(`{{L1:after:close/ receipt}}`). Controls: `controls/topology/` holds one honest fixture and eleven
single-fault variants (`controls/topology/summary.txt`): `c0-honest` reads
`TOPOLOGY63_HELD held=7/7 checks=7 rev=afb5912daaa91800da0cac2ff62ec9b6fd400ace rule=T63` and each
`f1..f11` reads `UNMET` naming the arm it breaks (T5 forged capture with its pin recomputed, T2 phantom
row, T4 wrong quote, T2 stale opened date, T1 missing `recheck:`, T3 edited capture bytes, T6 duplicate
row id, T2 used-by lacking the entry, T7 PROVINCE not naming the entry, T7 README row removed, T4 five
bullets). Registry: census before `134` rows, exit 0, six W04 warnings (`base/census-before.txt`:
`grep -c '^| S' corpus/SOURCES.md` → 134); `{{L1:after:after census: rows, exit, warnings}}`.
`{{L1:after:which S-ids the entry cites, their captures and pins}}`.

**Waves and admission.** `{{L1:after:wave roster: w1 40 seats; w2 if declared; dead seats named}}`.
Admission: `{{L1:after:each claim HELD/UNMET as its counter printed}}`. No axis score changed: no
integer can move (operability is at the frozen proxy's terminal 9; coverage:script-layer,
coverage:runtime-layer, coverage:kimi-layer and the retired aggregate are at 10), so the verdict is the
counter, not a number. `{{L1:after:proxy stanza terms after the maintenance repairs, PROXY: MATCH}}`.

**Maintenance repairs (not claims).** The round opened with two live defects. `proxy-check`
FAIL-CLOSED: `PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 330: pin.make-dispatch-actual is not a
kumitate-gate-pins-v1 key`, `EXIT=2` (`base/proxy-before.txt`) — round 62 landed the pin key without
teaching `proxy-check`. `readme-map` DRIFT: `README_MAP: DRIFT files=151 rows=150 covered=150 bad=2
first=uncovered:lessons/round-62-verifier-spotcheck.md`, `EXIT=1` (`base/readme-map-before.txt`) — the
round-62 spot-check file was unmapped. `{{L1:after:both read clean at the tip, with the commands}}`.

**Limits.** (a) Stated in the plan and unchanged: a lane that also writes faithful transcripts into the
host session store and lines into the orchestrator's log defeats the gate; those two records live
outside the repository and only the non-author closure re-derives them. (b) I3's
`forged-no-sessions` case does not reproduce from committed bytes at `b38a2065`: `git` cannot commit
the case's empty `sessions/` tree, so the gate fails closed `SESSIONS_ROOT_ABSENT` (exit 2) where
`expect` names `1 NOT_A_DISPATCH`; the committed receipt records the worktree reading.
`{{L1:after:resolution — amended case or amended expect, with the re-run receipt}}`. (c) The topology
control receipts cite fixture revisions (`afb5912d…`, `b77f9a3f…`, …) that are not archived in this
lane, so those twelve readings are not re-derivable from committed bytes; only `c0-honest`'s line is
quoted in `summary.txt`. (d) T5 fetches each cited URL live: a source that becomes unreachable after
the round makes the counter MISS, and the entry's quotes stay re-locatable only against the pinned
captures. `{{L1:after:further limits the waves named}}`.
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
  cannot, is not a predicate. Their probes (`probe/dispatch61-probe.mjs`, `probe/doctrine61-probe.mjs`)
  remain as round-61 bytes; no round after 63 may cite either counting command.
- **Superseded by** `INLINE63_HELD` (rule I63 v1, §Round 63 C1) for dispatch evidence and
  `TOPOLOGY63_HELD` (rule T63 v1, §Round 63 C2) for the sourced-entry frontier.
- **What carries the retired forgeries.** The round-61 C1 zero-seat fabrication is carried as
  `controls/inline/forged-no-sessions` (expect `1 NOT_A_DISPATCH`), `reports-28-bytes`
  (`1 REPORT_TINY`) and `reports-identical` (`1 REPORT_DUP`); the round-61 C2 forgery (a phantom row
  outside `## Registry`, a fabricated capture, no fetch) is carried as `controls/topology/f2-phantom-row`
  (`T2 MISS`), `f1-forged-capture` (`T5 MISS`) and `f6-capture-edited` (`T3 MISS`). Readings of record:
  `controls/inline-receipts.txt` and `controls/topology/summary.txt`.
- **What the carriers do not yet carry.** `forged-no-sessions` does not reproduce from committed bytes
  at the freeze rev — the case's empty `sessions/` tree is untrackable in git, so the gate reads
  `SESSIONS_ROOT_ABSENT` exit 2 instead of the expected `NOT_A_DISPATCH` exit 1, and
  `controls/inline-receipts.txt` records a worktree reading.
  `{{L1:after:resolution recorded here, with the amended case or expect and its re-run receipt}}`.
```

---

## D. Saturation paragraph — round 63

Insert **inside** `## Saturation`, after the `**Round 45 (2026-10-23).**` paragraph and before
`## Round 36 — limits and round-37 pre-registration`:

```markdown
**Round 63 (2026-10-25).** Saturation line 9 (declared round 34) and window N = 3 stand. The last
capability row with an admitted first-working round is `cite-sources` (round 59); rounds 60–62 added
none — round-60 C1 (`dispatch-evidence`) was ruled unprovable in the round-61 correction, round-61 C1
and C2 failed as declared, and round 62 declared no claims and admitted nothing. The window is
therefore exhausted and the stagnation nudge is active at round 63: the plan waives the lowest-axis
obligation, and both claims are a capability acquisition (C1) and a frontier move (C2), not an integer
move. No live axis sits below the line — operability 9 (terminal under the frozen `f_O`),
coverage:script-layer 10, coverage:runtime-layer 10, coverage:kimi-layer 10, and the retired aggregate
`coverage` 10. `{{L1:after:if C1 is HELD the window restarts at round 63; if it is UNMET the window
stays open into round 64}}`.
```

---

## E. Blocker the integrator must rule on before C1 can read 6/6 (freeze amendment)

`controls/` is frozen at `b38a2065`, so **this seat cannot fix it and did not**. Evidence and
reproduction are in the seat report (`.ufo/waves/round-63/w1/K63ScribeScorecard.md`, findings 1 and 2).
Two amendments are possible; both touch frozen bytes and both need an L1 ruling recorded in the lesson:

1. **Add a committed non-transcript marker inside the case's sessions tree** (recommended; keeps the
   case's intent). `probe/make-inline-controls.mjs` is frozen too, so the file must be added by hand:

   ```
   .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/.keep   (empty file)
   ```

   Safe because the gate only tests `existsSync(sessionsRoot)` and `indexSessions()` walks the tree
   collecting `*.jsonl` leaves only (`scripts/inline-dispatch-evidence.mjs:96-112,202`), so a `.keep`
   leaf yields zero transcripts — exactly the state the case means to express. Then re-run
   `node .ufo/waves/round-63/probe/inline63-probe.mjs <lane> <M>` and regenerate
   `controls/inline-receipts.txt` from committed bytes (not from the worktree).
2. **Change the case's `expect`** from `1 NOT_A_DISPATCH` to `2 SESSIONS_ROOT_ABSENT` and rename it,
   which records the fail-closed arm but loses the forged-lane arm the ratchet clause exists for.
   Option 1 is preferred: the plan's ratchet says a forgery the gate accepts is added, never relaxed.

Either way, `controls/inline-receipts.txt`'s header "gate run on 14 committed fixture cases (worktree
mode)" must stop claiming committed bytes for a case whose bytes are not committed.
