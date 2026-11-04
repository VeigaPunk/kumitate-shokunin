source: S236 — Kubernetes, *Admission Controllers Reference* (https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/, opened 2026-11-04); own-work — `scripts/ready-handoff.mjs`, `.ufo/waves/round-81/w1.ready`, `.ufo/waves/round-81/w1-dispatch.json`
verified-at: 2026-11-04 — `node scripts/ready-handoff.mjs --lane . --round 81 --wave w1` → `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1` exit 0; `--selftest` → `READY_HANDOFF_SELFTEST: 31/31 pass`; base tree 0/16 and constant-printer stub 3/16 on the frozen counter (`C81_C1: HELD held=16/16`)
recheck: re-run the counter and the live handoff at the next lane tip; re-open S236 if the pre-persistence/admission wording changes (cadence 180d)

# Ready-handoff admission

## The rule

A cross-session handoff is **admitted** before it is taken, never after. The
run-7 inline spawn handoff is a file the lane writes
(`<lane>/.ufo/waves/round-<N>/<wave>.ready`) and an orchestrator takes within
~15 s; the write is the request, the take is the persistence, and every rule
that distinguishes a dispatchable handoff from a bad one belongs in the window
between them.

`scripts/ready-handoff.mjs` (contract `kumitate-ready-handoff-v1`) is that
admission layer. It reads two files and nothing else — the ready file
(`READY_KEYS`, five keys exactly, `ready-handoff.mjs:38`) and the dispatch it
names — and returns one of three verdicts: `READY_HANDOFF: READY …` exit 0,
`READY_HANDOFF: DRIFT <ids>` exit 1, `READY_HANDOFF: FAIL-CLOSED <TOKEN>` exit 2,
usage 64.

## Two classes of refusal

The gate separates a **request that cannot be read** from a **request that must
not be admitted**, and the split is the design:

- **Fail-closed (exit 2)** — the handoff is not even evaluable: no ready file
  (`READY_ABSENT`, `:104`), a ready file that is not a JSON object
  (`READY_MALFORMED`), a `dispatch` that is not an absolute path
  (`DISPATCH_PATH`), one that lexically leaves the round's wave directory
  (`DISPATCH_OUTSIDE`, `:113`), one whose realpath leaves it or cannot resolve
  (`PATH_UNSAFE`), an absent or non-regular dispatch (`DISPATCH_ABSENT`), and a
  dispatch without `taskCall.context` + a non-empty `taskCall.tasks`
  (`DISPATCH_MALFORMED`, `:126`/`:129`).
- **Policy findings (exit 1)** — the handoff is readable but violates a frozen
  rule: the five-key ready contract, the lane/round/wave agreement, a non-empty
  `l1`, the wave band (`BAND`, `:146`), the attack share (`ATTACK_SHARE`,
  `:186`), the connector cap (`CONNECTOR_COUNT`, `:187`), a planner seat, an
  unknown role, a per-seat model key, a duplicate or malformed seat name, a
  missing `/skill:godspeed` lead, a task text without the lane's absolute root,
  a lane-relative round wave path (`RELATIVE_WAVE_PATH`, `:176`), a relative
  `Report:` trailer without the context's resolution sentence (`REPORT_TRAILER`,
  `:182`), and a context that names neither the lane root nor the scratch rule.

Every finding is named, not just counted: the DRIFT line lists the ids and the
first finding's detail, so a reader can repair the handoff without re-reading
the prompt.

## Why an admission layer, and what it does not prove

Kubernetes names the shape: "An admission controller is a piece of code that
intercepts requests to the Kubernetes API server prior to persistence of the
resource, but after the request is authenticated and authorized." The same page
records the limit that matters here: admission controllers do not block reads,
"because reads bypass the admission control layer." The gate is deliberately an
admission layer over *writes* (a handoff about to be taken); it says nothing
about what the seats do afterwards, and it cannot prove a seat's prompt is
useful, only that the dispatch is well-formed and policy-legal.

It also does not replace the validator. `ufo-swarm-wave.mjs plan`/`run` refuses
malformed specs before a payload exists; `ready-handoff` judges the pair as it
will be taken (ready file ↔ dispatch on disk), which is the surface the
orchestrator actually reads.

## Evidence

| claim | command | result |
|---|---|---|
| clean fixture | `node scripts/ready-handoff.mjs --lane <fixture> --round 81 --wave w1` | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 …` exit 0 |
| this round's own handoff | `node scripts/ready-handoff.mjs --lane . --round 81 --wave w1` | `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1` exit 0 |
| band | 7 and 17 seats | `DRIFT BAND` exit 1 |
| fail-closed | dispatch outside the wave dir | `FAIL-CLOSED DISPATCH_OUTSIDE` exit 2 |
| suite | `--selftest` | `READY_HANDOFF_SELFTEST: 31/31 pass`, `VERDICT: PASS` |

## Boundary

Registry row `ready-handoff` in `SKILL.md`; pin `pin.ready-handoff` in
`kumitate-gate-pins-v1`; frozen counter `C81_C1` in
`.ufo/waves/round-81/probe/probe81-c1.mjs`. The gate is read-only: it writes
nothing, follows no path outside the round's wave directory, and never spawns a
seat.
