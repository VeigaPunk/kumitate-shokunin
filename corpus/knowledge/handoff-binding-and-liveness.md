source: S238 — Kubernetes, *Validating Admission Policy* (https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/, opened 2026-11-04; capture `.ufo/waves/round-82/build/L1/captures/vap.html:3`, sha256 `ae87bdab827b…d10dc90`); own-work — `scripts/ready-handoff.mjs` (contract `kumitate-ready-handoff-v2`), `.ufo/waves/round-82/plan.md` §C1 + Amendment 1, `.ufo/waves/round-82/probe/probe82-c1.mjs` (22 arms)
verified-at: 2026-11-04 — **refreshed by round 83 (R82-V1):** the shipped tool is `kumitate-ready-handoff-v3` at the round-83 M bytes (`pin.ready-handoff`); `node scripts/ready-handoff.mjs --selftest` → `READY_HANDOFF_SELFTEST: 70/70 pass` at the round-83 work revision, and `node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane .` → `C83_C1: HELD held=27/27` exit 0. The round-82 reading stays as written below for its own revision. Round-82 text: `node .ufo/waves/round-82/probe/probe82-c1.mjs --set c1 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin` → `C82_C1: HELD held=22/22` exit 0; `node scripts/ready-handoff.mjs --selftest` → `READY_HANDOFF_SELFTEST: 53/53 pass` (worktree sha256 `4b91b204…`, whose three extra cases over HEAD sha256 `64d6b9c9…` read `50/50` — no commit carried 53/53, the shipped v2 at `125287f3` read 54/54); this wave's handoff (`--lane . --round 82 --wave w1 --policy /home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`) → `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 … agents=none`, exit 0
recheck: 180d

# Handoff binding and liveness

`corpus/knowledge/ready-handoff-admission.md` owns the v1 split (fail-closed versus policy
finding). This entry owns what v2 adds: a handoff bound to the dispatch it names and to the
campaign's own numbers, and one judgment that needs a surface the gate may not read.

## The eight v2 judgments

| judgment | anchor | decides |
|---|---|---|
| `WAVE_BINDING` | `scripts/ready-handoff.mjs:187` | the dispatch stem must be `<wave>-dispatch`, not merely inside the wave dir |
| `DISPATCH_WAVE` | `scripts/ready-handoff.mjs:192` | payload `wave` must equal the slot or end `-<slot>` (A1.6, `.ufo/waves/round-82/plan.md:133`) |
| `REPORT_DEST_DUPLICATE` | `scripts/ready-handoff.mjs:247` | two seats resolving to one report path; the trailer parser at `scripts/ready-handoff.mjs:231` takes the first path-shaped token |
| `REPORT_DEST_OUTSIDE` | `scripts/ready-handoff.mjs:246` | a destination resolved outside the lane (added after the round's own C1 scout measured that uniqueness without containment admitted `/var/tmp/…`; plan Amendment 2 A2.1) |
| `L1_SEAT_COLLISION` | `scripts/ready-handoff.mjs:220` | `ready.l1` equal to a seat name, case-insensitive |
| `L1_UNRESOLVED` | `scripts/ready-handoff.mjs:195` | `ready.l1` absent from the caller's `--agents` registry |
| `BAND` from the policy | `scripts/ready-handoff.mjs:199` | seats outside `waveMinLanes:waveMaxLanes`; `ROLE_UNKNOWN` at `scripts/ready-handoff.mjs:223` when a role is not in `proposalRoles` |
| dispatch-symlink refusal | `scripts/ready-handoff.mjs:136` | `lstatSync().isFile()` refuses a symlink as `DISPATCH_ABSENT` — an arm, not new code (A1.2) |

## Offline, and the one judgment that needs a caller

The tool reads "`<ready>`, the dispatch JSON it names, `--policy`, and `--agents` when named"
(`scripts/ready-handoff.mjs:30`), so six of the seven are decided from bytes on disk; `L1_UNRESOLVED`
needs an agent-id set no lane file carries.

`--agents FILE` must hold `{agents:[{id}]}` (`scripts/ready-handoff.mjs:169`); unreadable is
`AGENTS_ABSENT`, not-JSON `AGENTS_MALFORMED` (`scripts/ready-handoff.mjs:166`), both fail-closed
exit 2 (`scripts/ready-handoff.mjs:629`) — never a silent pass. The wave's own registry is not in
that shape: `.ufo/waves/round-82/w1/swarm-registry.json` is a `members` map with `agentId: null` on
every spawn, and feeding it in reads `FAIL-CLOSED AGENTS_MALFORMED … must be {agents:[{id}]}`, exit 2
(measured). No lane script writes the gate's shape: `grep -rn "agents: \[{ id:" scripts/*.mjs` hits
only the tool's fixtures (`scripts/ready-handoff.mjs:331`).

Why the caller and not the gate: PROVINCE keeps `~/.omp/agent` at depth-1 members only — names,
kinds, permission bits — with member content out of scope by design (`readdir` + `lstat` only,
`PROVINCE.md:16`), and the frontier restates the rule as binding (`PROVINCE.md:57`). An instrument
that read registry content would leave its province, so the id set arrives as an export.

"Liveness" is one line: `ready.l1` resolves in the supplied registry, not that the agent is running
now. The shape carries no instant, `opts.agents` is optional (`scripts/ready-handoff.mjs:165`), and an
omitted read is disclosed as `agents=none` on the verdict (`scripts/ready-handoff.mjs:272`) — not
scored, not assumed.

## One authority: the policy, not the lane

Kubernetes names the shape v2 copies: "Validating admission policies offer a declarative,
in-process alternative to validating admission webhooks." (S238) — one rule set declared as a
platform object the admitting layer reads, instead of restated in each caller.

v1 carried the numbers twice: `git show 0c23c4f:scripts/ready-handoff.mjs` → `band: '8:16'` (`:47`),
`--band` (`:54`), a role list admitting `labrat` and `distiller` (`:35`). v2 deletes both copies:
band and role vocabulary are read from the policy (`scripts/ready-handoff.mjs:153-161`), applied at
`scripts/ready-handoff.mjs:199` and `scripts/ready-handoff.mjs:223`; `grep -n -- '--band'
scripts/ready-handoff.mjs` matches nothing. Measured policy: band `[8,16]`, ten roles, via `node -e`
over `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`.

The dispatch carries its own `policy` echo (`policy.minLanes` 8 in
`.ufo/waves/round-82/w1-dispatch.json`), and no code reads it: `grep -n "minLanes"
scripts/ready-handoff.mjs` matches nothing. The judged copy is the `--policy` file, so a dispatch
cannot widen the band it is judged by. Measured: policy band `[20,30]` → `DRIFT BAND`; a role
removed from the policy → `ROLE_UNKNOWN`; `labrat` refused because the policy omits it (probe arms
`policy-band-read`, `policy-roles-narrow`, `labrat-refused`).

## Disclosed limits

- **Advisory, not enforcement.** Nothing calls the gate before a dispatch is taken; the run is a
  checklist step (`SKILL.md:755`), and the plan records lane-side admission, not enforcement
  (`.ufo/waves/round-82/plan.md:107`).
- **Liveness is opt-in and undated.** `--agents` is optional (`scripts/ready-handoff.mjs:165`);
  `agents=none` on the verdict line is the disclosure that the read did not run.
- **Attack share and connector cap stay lane constants.** `ATTACK` at
  `scripts/ready-handoff.mjs:41`, `--attack-pct` defaulting to 25 at `scripts/ready-handoff.mjs:51`,
  `CONNECTOR_COUNT` at `scripts/ready-handoff.mjs:260`; the campaign policy carries no field for
  either (`.ufo/waves/round-82/plan.md:112`). This wave reads `attack=4/14`, not the plan's 5/14:
  `sentinel` sits outside the four attack roles (`.ufo/waves/round-82/plan.md:137`), and
  `ATTACK_SHARE` stays quiet at `scripts/ready-handoff.mjs:259`.
- **The realpath guard is defence in depth.** Behind the `lstat` refusal
  (`scripts/ready-handoff.mjs:136`), the realpath arm at `scripts/ready-handoff.mjs:138` is
  unreachable; A1.2 records it as disclosed, not claimed (`.ufo/waves/round-82/plan.md:119`).

## Boundary

Registry row `ready-handoff` in `SKILL.md`; the v1 admission note is
`corpus/knowledge/ready-handoff-admission.md`; frozen counter
`.ufo/waves/round-82/probe/probe82-c1.mjs` (`ARMS = 22`, `:24`). The gate reads the four named paths
and writes nothing to the lane.
