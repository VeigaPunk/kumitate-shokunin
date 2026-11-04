# round 83

Two claims on two axes, both scored by counters frozen before any data seat: **C1 operability**
(integer 9 terminal) — `scripts/ready-handoff.mjs` becomes `kumitate-ready-handoff-v3`, judging the
admission the dispatcher performs (band = spawns + resumes, the effective cap including the 256
ceiling, dispatch schema/counts, policy roles the validator cannot spawn, the registry's
`{members}` shape, the reachable attack set), 27 arms; **C2 coverage:omp** (integer 10 held) —
`scripts/omp-census.mjs` judges a compare receipt's clock on every call (a future instant refuses
`SHAPE_CLOCK`, one predicate shared with `--shape`), 16 arms.

## Gate

Three rows were opened this round; each quote was re-located against its pinned source before this
file was written, and no row was rejected.

- **S240 — ufo-fsd-alpha, swarm wave validator** (code, tier A) — **admit**. Repo path
  `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` at commit `fb7157fc`, accessed
  2026-11-04 by read-only `git show fb7157fc:scripts/ufo-swarm-wave.mjs`. Quote at lines 1085-1091
  (template literal at line 1086, inside the `spawns.length > 0` band guard):
  "a wave with spawn lanes needs at least ${laneFloor} lanes (got ${total})". Scope: the band counts
  spawns **plus** resumes as one `total`, and the floor obligation is spawn-guarded — a second
  arithmetic in the gate is drift.
- **S241 — ufo-fsd-alpha, swarm registry** (code, tier A) — **admit**. Repo path
  `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-registry.mjs` at commit `fb7157fc`, accessed
  2026-11-04 by read-only `git show fb7157fc:scripts/ufo-swarm-registry.mjs`. Quote at line 27:
  `export const SWARM_REGISTRY_SCHEMA = "ufo-swarm-registry-v1";`. Scope: the registry the
  dispatcher writes is `{schema:"ufo-swarm-registry-v1", members:{name:…}}` — a liveness reader that
  expects an `agents` array judges a file no producer writes.
- **S242 — IETF RFC 3339, *Date and Time on the Internet: Timestamps*** (spec, tier A) — **admit**.
  URL `https://www.rfc-editor.org/rfc/rfc3339.html`, accessed 2026-11-04; capture
  `.ufo/waves/round-83/build/L1/captures/rfc3339.html` (sha256 `c53b2d12…`, capture line 99).
  Quote (§1 p.2): "Date and time expressions indicate an instant in time." Scope: a recorded
  instant is a claim about the past, judged by the reader against its own clock — not a duration and
  not a guarantee about the writer's clock.

Opened this round: S240, S241, S242. Admitted: all three. Rejected: none this round.

spot-check: pending (non-author)

## Limits

- **The gate stays advisory.** Nothing fleet-side invokes `ready-handoff`: the dispatcher polls the
  `.ready` file and spawns the payload (recorded in `lessons/round-81.md` § Limits; v3 does not move
  that boundary). The claim is that the handoff agrees with the dispatcher's arithmetic, not that
  the dispatcher consults it.
- **The validator is operator-side, and its constants are pinned copies.** `SWARM_ROLES` and
  `ufo-swarm-wave-dispatch-v1` are pinned in `ready-handoff.mjs` (comment at :47, constant at :51)
  and the validator was read, not executed, at `fb7157fc`. A validator revision that adds or drops
  a role desyncs the gate silently until that copy is re-pinned.
- **`--agents` liveness remains opt-in.** Without the flag the gate reads no registry and prints
  `agents=none` (e.g. `controls/c1-stub.txt`); a wave whose `l1` is not actually live still reads
  READY when the caller supplies no registry.
- **The counters' fixtures are hermetic, not the live fleet.** Both probes build fixture lanes and
  receipts under `--work` and shell the lane's own tools (probe headers); `27/27` and `16/16` say
  the tools judge those fixtures, not that a real wave was admitted or a real receipt read.
- **C2 binds a stated instant only.** A legacy v1 receipt keeps `captured=absent age_days=absent`
  (no invented instant) and only refuses when a bound is named (`SHAPE_AGE_UNKNOWN`); an unstated
  clock remains unjudged, and the compare path still scores nothing (`coverage:omp` stays 10).
- **Two gate↔dispatcher divergences are disclosed, not eliminated** (entry
  `knowledge/dispatcher-admission-surface.md` § Limits): the gate reads the policy's `lo`/`hi`
  unclamped where the dispatcher clamps both to `maxLanes` (inert under the live policy), and the
  registry branch checks only a non-empty `members` object, not its `schema` stamp.

## Mistakes

pending: filled by the L1 from the seats' findings

## Mistakes

One row per mistake; evidence pointer, the criterion that should have caught it, and the fix.

- **Ordering — the open map repair was not the round's first commit.** `plan-before-ready.sh --round 83`
  reads `FAIL rev=eca7debd reason=MAP_DRIFT map_first=uncovered:lessons/round-82-verifier-spotcheck.md`:
  the round-82 spot-check file landed at the base commit without its `corpus/README.md` row, and the row
  and pin were adopted only in this round's work commit — after the freeze and after the `.ready` marker.
  Evidence: `close/plan-before-ready.txt`; `.ufo/waves/round-83/open/prereqs.txt` (base `eb8e0095`).
  Captured-by: the gate's map arm exists and the round-82 pre-registration named the class
  ("adopt before freeze — make the open repair the first commit of the round"), but no rule makes the
  L1 *run the gate at open* before freezing. Fix: round 84 runs `plan-before-ready --round N-1` (and the
  readme-map gate) at open and lands any repair as the round's first commit, before the freeze.
- **Counter arithmetic — `ARMS` disagreed with the arm count, so a red arm hid in a green verdict.**
  `probe83-c1.mjs` declares `ARMS = 27` and carries 28 `arm()` call sites; `band-total-resumes` fails
  (`ATTACK_SHARE`, 2/12) and the verdict still prints `HELD held=27/27` exit 0. Evidence:
  `w1/K83ScoutAdmission.md` §6.1–6.2, `w1/K83ReviewC1.md`, `close/c1-probe.txt` (one `FAIL` arm line beside
  the `HELD` verdict). Captured-by: none — kill rules K1–K4 covered base, stub and do-nothing controls, not
  the counter's own structure. Fix: the disclosed repair probe (`probe83-c1-repair.mjs`, `ARMS = 28`)
  re-measures the same behaviour (`C83_C1R: HELD held=28/28`); round 84 pre-registers a structural
  self-check (`arms run === ARMS`, else the counter fails) as its first claim candidate.
- **A fixture that trips a different guard than the one it tests.** The same `band-total-resumes` fixture
  (6 spawns, 2 attack = 2/12) fails `ATTACK_SHARE` before the band is judged, so it never exercised the
  inclusive total it was written for. Evidence: `w1/K83ScoutAdmission.md` §6.2. Captured-by: none (the arm
  checked an exit and a substring, not that the finding set was exactly the one under test). Fix: fixtures
  isolate the predicate (attack 3 of 12 = 25 % in the repair probe); a future arm asserts the absence of
  other findings.

- **A comment tally drifted from the frozen constant.** `probe83-c2.mjs`'s header says
  `prints C83_C2: HELD held=15/15` while `ARMS = 16` and the tool prints 16/16 (the plan and the
  predicate say 16/16); `probe83-c1.mjs`'s header says 27/27, which is the declared value but not the
  number of arms run. Evidence: `w1` critic output (`.ufo/waves/round-83/w1-results.json`,
  `K83CriticClaims`). Captured-by: the critic, on the second reading. Fix: a counter's header must not
  restate a tally it does not compute — the verdict line is the only place the number lives; round 84's
  structural self-check (`arms run === ARMS`) makes both classes machine-visible.

## Errata

- **Superseded text (round-82 lesson, S239 Gate row).** The round-82 lesson quotes "OPA is an open source,
  general-purpose policy engine that unifies policy enforcement across the stack."; the source and its
  committed capture read "The Open Policy Agent (OPA, pronounced *oh-pa*) is an open source,
  general-purpose policy engine …". The rejection and its flip stand; only the rendering was edited
  (round-82 spot-check R82-V4). Read the quote as an elision, not a verbatim span.

## Routed defects answered (round-82 spot-check)

- **R82-V1 (stale tally).** `corpus/knowledge/handoff-binding-and-liveness.md` `verified-at` refreshed to
  the shipped v3 revision: `READY_HANDOFF_SELFTEST: 70/70 pass` at round 83's M and
  `C83_C1: HELD held=27/27`; the old 53/53 reading is kept in the line with the note that no commit
  carried it (the shipped v2 read 54/54). Recorded old→new here.
- **R82-V2 (receipt stamped with bytes it did not measure).** Every receipt this round carries a `rev=`
  line written by `build/close-receipts.sh` after M is committed (`close/summary.txt`); the open receipt
  names the base commit it measured (`open/prereqs.txt`).
- **R82-V3 (capability row under-described).** The `ready-handoff` capability row is refreshed to v3: the
  shipped invocation names `--policy`, the READY line carries `seats= resumes= total=`, the counter is
  `C83_C1: HELD held=27/27`, and the stub/base readings are the round-83 ones.
- **R82-V4 (edited quote).** Recorded as an erratum above, not silently rewritten.

## Gate status changes

- S240, S241 and S242: `status` `queued → mined`; `used-by` `— → corpus/knowledge/dispatcher-admission-surface.md`
  (S240, S241) and `— → corpus/knowledge/self-asserted-instants.md` (S242). No `recheck` change.
