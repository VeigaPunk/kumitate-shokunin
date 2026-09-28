# `native_transcript.rs` + `native_ledger.rs` + `native_seat_coverage.rs`

All three are `NATIVE_CONTRACT_FILES` members (55th/56th/60th —
`native_contract.rs:124/125/129`); membership AND order feed
`native_contract_hash`. Two distinct "ledgers" exist: the JS-only
refinement ledger under `.ufo/scopes/<scope>/ledger/` (no Rust reader)
and the in-handoff resilient **attempt ledger** validated here —
never conflate them (`queue-summary.md` covers the JS side).

## `native_transcript.rs` (939 L) — one agent's OMP JSONL transcript

`validate_transcript(agent, route, evidence, timed_out, resilient,
approved)` (:318-336) borrow-parses every line into `BVal` (a
zero-copy `serde_json::Value` mirror — objects are `Vec` pairs with
last-wins `get`, matching `serde_json::Map` dup-key semantics :20-44;
`visit_u128`/`visit_i128` reject `"number out of range"` exactly like
serde_json without `arbitrary_precision` :157/:166). Reads the APPROVED
path bound to the approved inode (`read_file_canonical` :341); the
declared `transcript_path` keys `transcript_events` and names errors —
never the approved path (:332-335, :912-916).

Ordered gates (each a refusal literal, first hit wins):
1. Non-empty path → canonical read → lazy digest check → UTF-8.
2. Per line: ≤ `MAX_TRANSCRIPT_LINE_BYTES` = 128 KiB (bytes, :410-419) →
   `BVal` parse.
3. Event-type walk (:457-792): `session`/`session_init` count and id
   must equal `agent.session_id`; `model_change` MUST carry
   `resolvedModelIsFallback` and it must be `false` (:497-507 — a change
   resolved through a fallback is refused); effort events must match the
   declared level per attempt exactly (`thinking level must be '<e>',
   got <o>: effort_unverifiable` :587/:593 — never clamping credited as
   exact effort); yield toolCall ids and successful yield result ids are
   unique sets (:625-666); served provider/model must equal a visited
   chain `resolved` or `family_matches_parsed` (:685-716); two assistant
   errors before any `model_change` = ambiguous advance, refused (:733).
4. **Assignment binding (:755-789):** first user message after stripping
   the literal `"Complete assignment thoroughly:\n\n"` wrapper
   (`TASK_WRAPPER` in `collect-omp-native-handoff-lib/base.mjs`) must be
   BYTE-EXACT `agent.assignment` — `strip_prefix` only, no trimming; a
   second user message after the assignment is refused.
5. Post-loop counts (:794-820): `session_init` count == (role != Main);
   `model_change` == 1 + reconstructed hops; `thinking_level_change` ==
   declared levels, one per attempt.
6. `served_model_count == 0` → "no assistant provider/model evidence";
   `!assignment_found` → "contains no user assignment".
7. Completed non-Main ⇒ exactly one successful task yield and sets equal
   (:834-843); `Failed && !failure_observed && !timed_out` → refused
   (:845-854).
8. **Continuity is recomputed, not trusted**: `reconstructed` from
   `model_change` evidence must equal `agent.continuity_attempts`
   element-wise (:856-866); `agent.resolved_model` must equal the final
   continuity route's resolved form (:868-880).
9. Settlement interval: `started` = earliest observed stamp; `ended`
   from `(role,status,timed_out)` — Main→latest, Completed→yield
   terminal, Failed→failure terminal; `Blocked`/`Cancelled` hit
   `_ => None` → "no task-settlement timestamp" (never invented);
   `started >= ended` refused (:882-911).

Timestamps: `event_millis` (:274-297) collects ≤3 stamps per event —
RFC-3339 `timestamp` gated by `rfc3339::strict_shape` BEFORE chrono (so
chrono can't re-admit spellings the producer dropped), integer-millis
`completedAt`, `message.timestamp`; unparseable/pre-epoch values are
DROPPED, never rejected, never clamped (`MAX_SAFE_MILLIS` = 2^53-1
:244). `dispatch_relevant` lines only are retained for
`observed_task_dispatches` (`native_dispatch_topology.rs:344`).

## `native_ledger.rs` (350 L) — resilient attempt ledger (PC-B §3/§4)

A ledger can **authorize a hop completion but never invent one** —
everything checked against independent evidence (:19-30).
`validate_attempt_ledger` (:31-69): one entry per seat (repeat =
refusal); reverse scan refuses a `Completed` seat carrying
continuity evidence with NO ledger entry — "a fallback completion is
admitted only through a complete authorized ledger, never by relabeling
the hop as the primary" (:61-65). Route authority is the JUDGED contract
root's bundled-mirror table (`route_cache` seeded :36-42, r33/r36 P06
D1), never the compiled chain.

Per entry (`validate_ledger_entry` :331-349):
- **Preamble** (:94-149): seat must be `Completed`; `logical_lane_id`
  must recompute (`<run_id>/<role>/<instance>`); `assignment_hash` equals
  the seat's bare digest AND `frozen_scope_hash` must be its
  `sha256:`-prefixed form (I5/I6 — "one frozen scope and one assignment
  across every attempt"); `output_digest` = `sha256:`-prefixed
  `artifact_hash`; `final_attempt_id` names `attempts.last()`.
- **Attempt routes** (:151-207): every `requested_route` declared in the
  role's chain; index 0 opens on the frozen primary ("a hop is never a
  lane's first attempt"); strictly forward, never wraps; `observed_model`
  must `family_matches_route` the declared chain entry; **T07**
  `observed_effort == route_effort_suffix(requested_route)` else
  `effort_unverifiable` (:190-204).
- **Pairing** (:209-285): final attempt carries NEITHER `typed_failure`
  NOR `authorized_next_hop` and MUST bind `native_agent_id ==
  agent.agent_id`; every non-final carries BOTH, `native_agent_id` None
  ("only the lane's final attempt completed"); `typed_failure` must be
  `capacity:<usage_limit|rate_limit|model_unavailable>`; `hop.reason`
  must be literal `"capacity"`; `hop.route` must equal the NEXT attempt's
  `requested_route` AND be the declared successor (`there == here+1`,
  :272-285 — no forward skip leaves declared routes unvisited).
- **Hops match** (:287-329): route-change pairs must consume
  `agent.continuity_attempts[hop_index]` element-wise — "hop evidence is
  never relabeled, and a hop the transcript does not show is not
  admitted" (:305-310).

Field presence: `attempt_ledger` refused outright under `omp-native-v1`
and `omp-native-v2` (`native_admission_rules.rs:62-72/:107-111`); only
`omp-native-resilient-v1` admits it (:119-123). Shape checks
(deny_unknown_fields, ≤20 entries, attempt_id uniqueness) live in
`native_admission_rules.rs:132-236` — an explicit documented split.

## `native_seat_coverage.rs` (317 L) — roster + pre-spawn dispatch attempts (PC-C C2)

`validate_proposal_roster` (:23-112): proposal roles only; the six
mandatory roles must appear (`MANDATORY_PROPOSAL_ROLES`); instances
contiguous from 1; multi-instance roles need distinct assignment hashes
(scope-set uniqueness is unreachable — the global `assignment_scopes`
dedup fires first :79-85); `probe_parent` must be `executor-01` exactly
(the launcher hardcodes the first executor seat, `FROZEN_TOPOLOGY`).

Per seat (:114-170): seat key unique, `assignment_scope`/`lineage`
non-empty, scope globally unique, `assignment_hash` shape-checked,
`dispatch_name` recomputes `u<tag>-<role>-<NN>`, `requested_model`/
`requested_effort` equal the canonical route, `expected_parent ==
Main/01 && expected_depth == 1`.

`validate_dispatch_attempts` (:182-317) — a pre-spawn dispatch attempt
covers a seat that never spawned: never critical, never `probe_parent`,
requests the FROZEN PRIMARY ("a pre-spawn rejection is not a hop"
:176), `attempt_id` must be `<lane>/attempt-1`, `detail` ≤2048 B, must
match the producer's `lane_failure` grammar `class=<f> seat=<role:inst>
attempted=<route> status=<s> id=<i>` (tail split on the LAST ` id=`
because a legal route rides raw inside `attempted=` :255-268), status/id
must be `cleanField`-class, and the seat must be covered by agent XOR
attempt — a seat in BOTH is refused (:291-296), as is a seat also in
the attempt ledger (:302-315 — "the ledger carries a completion's
history, and a seat that never spawned has none"). `typed_failure`
admits ANY FailureClass wire name — the capacity-only rule applies to
hops, not pre-spawn rejections. Coverage vocabulary: required =
`core_keys` (main/planner/distiller/labrat) ∪ roster; observed =
`by_seat` agents ∪ `dispatch_seats`.
