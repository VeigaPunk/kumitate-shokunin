# ScoutFrontierOverlap — kumitate round 57 wave 1

Read-only scan; no lane or sibling bytes modified, no installs, no git/jj mutations. Item (w1-spec.json lines 237–239): check the D57 scope against PROVINCE adjacent rows and sibling provinces (kama endpoints, kotoba prompts, kasegi security) — worker liveness belongs to orchestration, confirm no overlap absorption. Evidence: `.ufo/waves/round-57/build/ScoutFrontierOverlap/` (`sibling-boundaries.txt`, `commands.txt`, `province-r57-diff.txt`).

## Verdict

**Confirmed — D57 scope stays inside kumitate's orchestration & tooling domain; no adjacent row or sibling province is absorbed.** The single r57 PROVINCE edit extends the durable-execution frontier bullet in place (one diff hunk, `git diff e4a4943..f0dc6d1 -- PROVINCE.md`); the `### Adjacent — reported, never absorbed` section is byte-unchanged. The judged object `corpus/knowledge/worker-heartbeat-liveness.md` covers worker-liveness *mechanisms* (Temporal activity heartbeats, Kafka consumer session liveness, Kubernetes kubelet probes) and maps them to the lane's own core surface — `fleet-dispatcher.mjs` reconcile, which PROVINCE.md L12 already owns as origin script layer. Every sibling that words a boundary routes orchestration *to* kumitate rather than contesting it. Name collisions on "liveness"/"probe"/"worker" exist but resolve to different objects (below); none is a claim collision.

## D57 object and its lane mapping

- Entry `corpus/knowledge/worker-heartbeat-liveness.md`: S117 Temporal Activity Heartbeats + Heartbeat Timeout, S118 Kafka `session.timeout.ms`/`heartbeat.interval.ms` + rebalance reclaim, S119 Kubernetes liveness/startup probes + kubelet restart remedy; S120 RabbitMQ rejected as transport keepalive. SOURCES.md rows S117–S119 read `mined`, S120 `REJECTED` — matches the plan and the D57 probe header.
- Lane mapping (entry L28–31): `fleet-dispatcher.mjs` pull-based liveness — repend on `registered_mission_missing` + nonzero launcher exit, `MAX_LAUNCH_MISSES`. Verified in origin: `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/fleet-dispatcher.mjs` L117 `MAX_LAUNCH_MISSES = 8`, L123 `LAUNCHING_GRACE_MS = 120_000`, L3573 the rependable predicate. Origin tree is read-only; the entry reports the mechanism, doesn't patch it (adjacent row L28 respected).
- The entry's one design clause is marked `[INFERENCE]` (push-vs-pull axis), consistent with lane conventions.

## Named siblings

- **kama (endpoints).** Domain L3–4: "local model serving & endpoint health." Its "liveness/readiness probe conventions" row (L13) is HTTP probes `/health`, `/props`, `/slots` on the *local model serving endpoint* — answering "is the thing at this baseURL the model this config believes it is" (L42). Kama **Refuses** (L40–41): "dispatch/route mechanism (kumitate)". kama `corpus/knowledge/cross-lane-scope.md` L28/L32/L40 assigns route/dispatch resolution to kumitate. D57's liveness is *worker/task* liveness for an orchestrator (broker membership eviction, kubelet container restart) — different object, different actor, different remedy. Kama's ground is neither claimed nor needed by D57. No absorption, either direction.
- **kotoba (prompts).** Domain L3–4: "prompt & skill craft." kotoba's own adjacent-table kumitate row (PROVINCE.md L59) states the split: "orchestration and dispatch runtime and swarm lifecycle … kotoba owns the prompt wording, not the runtime." Worker liveness is runtime mechanism, not instruction text. No contact point.
- **kasegi (security).** Domain L3: "bounty & security research … program rules, claim packages"; adjacent rows name chousa/kagi/kake/kengaku only — kumitate is not even listed; "Live-target testing is refused" (L49). kumitate's own L26 routes MCP/OAuth security practice → kasegi/kagi; D57 touches no credential/auth/attack surface, so neither direction has content. (kasegi also sits under a session-long hold; its province read is documentary, which is all this check needs.)

## Adjacent rows inside kumitate PROVINCE.md

All three adjacent rows (L26–28) are routings *out* of kumitate and are untouched by the r57 commit; none names worker liveness, which correctly lands in the domain core/frontier, not Adjacent. Frontier band wording — "durable-execution and multi-agent failure research … failure taxonomies" — is the declared home for this entry family since round 54; D57 is the seventh entry of that same line, not new claimed ground.

## Liveness/probe/worker homonyms swept (fleet-wide PROVINCE grep)

These are the real near-miss surfaces; all resolve away from a collision:

- **mori** — owns fleet & host *observability*: "watchdog liveness (pid, start time, log freshness)" (L6), wave settlement, kill/OOM records. **Refuses:** "dispatch and orchestration mechanism (→ kumitate)" (L12); adjacent row L65: "kumitate | Owns OMP task/hub orchestration …; mori passively grades … No conflicting settlement contract was found." Mori *observes* liveness signals; D57 *doctrine* on how an orchestrator detects/reclaims a dead worker is exactly the mechanism mori routes to kumitate.
- **tsukuroi** ADJ-05 (L50): "unit liveness cannot prove dispatch correctness" → routes dispatch/orchestration semantics to kumitate. Same direction.
- **souji** (L50–52, L143, L154): hygiene lane; explicitly "routes liveness or resource findings to mori"; holds no liveness claim.
- **kaidoku** (L42): "Liveness / readiness probe" is a column naming the *command* that verifies each REA-MCP surface — not worker liveness.
- **audio** (L21): "leaf workers write only assigned audio-scoped reports" — seat write-scope wording, not an orchestration claim.
- **mado / aggregator**: outside this item's named paths; the fleet grep showed no liveness/worker rows in mado's PROVINCE. The broader sibling scan (recent entries, mado, aggregator) is owned by the `ConnectorSiblingOverlap` seat — noted to keep the two seats' scopes separate, not to claim its result.

## Contested scope

None found. No sibling PROVINCE claims worker/task liveness, durable-execution failure doctrine, or dispatch semantics; every boundary that touches orchestration assigns it to kumitate.

## Confidence and gaps

- **High confidence:** the three named siblings and kumitate's own adjacent rows (verbatim quotes, line-cited, plus the PROVINCE git diff limited to the frontier bullet).
- **High:** mori/tsukuroi/souji homonym sweep — the only other lanes whose provinces carry "liveness" rows all point at kumitate for orchestration or at mori for observation; neither is a competing claim.
- **Gap (scoped out, not unresolved):** whether any sibling's *recent corpus entries* (not PROVINCE) already own adjacent ground — that is `ConnectorSiblingOverlap`'s item per the wave spec; I read no sibling corpus beyond kama's `cross-lane-scope.md` boundary doc, which itself routes dispatch to kumitate.
- **Gap:** whether the entry's lane-mapping receipts (`ScoutQueue/*` build artifacts) exist at their cited sha256 — D57's E2 arm re-verifies those against the judged rev; outside this item's question.

## Commands

Full list in `build/ScoutFrontierOverlap/commands.txt`; the r57 PROVINCE diff in `build/ScoutFrontierOverlap/province-r57-diff.txt`; verbatim boundary quotes in `build/ScoutFrontierOverlap/sibling-boundaries.txt`.
