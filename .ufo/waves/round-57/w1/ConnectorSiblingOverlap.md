# ConnectorSiblingOverlap — round 57

Axes: operability (`readme-map` / ATTEST57) and coverage (`worker-heartbeat-liveness` / DOCTRINE57). One move. Not applied. No production edit, no commit.

Pinned trees (working copies clean on every file cited; `git status --porcelain` empty, exit 0):

| lane | HEAD | subject |
|---|---|---|
| kumitate | `8c6f5b017d149b18134917378cdbed3b492d8e89` | round-57 idempotence tip |
| kama | `7c35289da5f4b94e062cd900eb086919e5094003` | round-33 verifier spot-check |
| kotoba | `2a8eba56b3f9321b70c569fa2816d42237ca49a2` | round-66 verifier spot-check |
| kasegi | `1fafde8f11454f3b0b98ab7f2b2e640aaf7f399a` | 2026-10-21 reflection |
| mado | `91862344b9fddbb5b4c3a9977acc776632993799` | round-31 verifier spot-check |
| mori (second-order only) | `d72ac167535229d737b9fa844513431d9a12f5ea` | round-41 freeze |

Plan base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` does not contain `corpus/knowledge/worker-heartbeat-liveness.md` (`git cat-file -e` fatal). At HEAD the blob is `afed676b678fafa1328c28ec8ebc20d66ef5ee6c`, and `git hash-object` of the working file matches it. The entry has 13 dash-clauses and zero occurrences of `kama`, `kotoba`, `kasegi`, `mado`, `aggregator`, `S017`, or `sibling`.

## Evidence — named siblings do not own the worker/task surface

The surface under test is the one C2 states: how an orchestrator learns a worker died while a unit of work is outstanding (Temporal activity heartbeats, Kafka session timeout plus rebalance, kubelet restart). It is not "anything called liveness."

**kama (endpoints).** PROVINCE owns "liveness/readiness probe conventions" and names the artifacts: `/health`, `/props`, `/slots`, plus "is the thing at this baseURL the model this config believes it is, right now." It refuses dispatch/route mechanism to kumitate. The neighboring knowledge is real and older than this round:

- `corpus/SOURCES.md:29` S017, mined 2026-10-19, tier A, used by `runtime-health-surface-matrix.md` and `llamacpp-loading-lifecycle.md`. URL: `https://kubernetes.io/docs/concepts/workloads/pods/probes/`.
- Matrix line 18: "Lifecycle vocabulary only; a non-Kubernetes local server inherits none of these semantics."
- Matrix line 22: "Kubernetes probe categories are borrowed vocabulary for slow model loads, not a policy this lane applies. Routing/gateway health dispatch is kumitate's surface."
- `llamacpp-loading-lifecycle.md:83-86`: Kubernetes readiness versus liveness (kama S017) classes `MODEL_LOADING`, not outstanding-work reclaim.

kama's own S117–S120 (SOURCES.md:129-132, mined 2026-10-23) are llama.cpp `server-context.cpp` @ `704366d` errors (lines 5453, 6132, 6137, 6151). They are not Temporal, Kafka, Kubernetes, or RabbitMQ.

**kotoba (prompt craft).** PROVINCE adjacent row: kumitate owns "orchestration and dispatch runtime and swarm lifecycle"; kotoba "owns the prompt wording, not the runtime." Recent knowledge through round 66 is citation and skill-file craft (`compound-clause-citation-round63.md`, `scoped-rules-round60.md`, `fleet-commit-resolution-round66.md`, and the command/hook/agent maps). The only heartbeat hit is a description of kasegi's telemetry file, not a claim on worker liveness.

**kasegi (security).** Domain remains bounty and security research. PROVINCE round-19: both surviving roots (`~/Projects/the-bounty-hunter`, `~/Projects/origin-work`) are ABSENT. The string "dispatcher heartbeat" is `corpus/knowledge/mission-ledger.md:73`, the heading for `telemetry.jsonl` event keys (`dispatcher_tick`, `mission_parked`, …), and `mission-control.md:86` for `<program>.status.json`. That is a bounty ledger stream on an absent tree, not a worker/task liveness signal.

**mado (hyprland).** Domain is the Hyprland/waybar/walker plane, read-only. A full-tree search for heartbeat, liveness probe, readme-map, and durable-execution returned no matches.

**aggregator (meta).** No `aggregator-shokunin` directory on disk. Fleet `SCORECARD.md:3-7`: aggregator axes are cross-lane quality, mint/dormancy calls, and corpus review, and "are not scored here." No PROVINCE. It does not own this entry or this lane's map gate.

**Second-order, not one of the five.** mori owns "whether the fleet, its waves and its host are alive" (watchdog, wave settlement, OOM, runway) and refuses "dispatch and orchestration mechanism (→ kumitate)." Fleet process liveness is not this entry. Do not add mori as a co-owner.

## Contradiction (do not collapse)

Both of these are true:

1. No named sibling's PROVINCE claims worker/task liveness while work is outstanding. kumitate PROVINCE adjacent already routes endpoints to kama and prompt craft to kotoba. The fleet round-57 report's "no cross-domain bleed" line (`.ufo/reports/round-57/kumitate.md` around the SHONEN checklist) matches that routing.
2. The new entry never records the neighbor that does exist. kama already mined the Kubernetes *concepts* probe page and used it for local-model `/health`. kumitate S119 is the *tasks* page. Reopened 2026-10-24, both pages carry `meta-article:modified_time` `2026-06-30T15:26:34+05:30`. The tasks page's second paragraph points at the concepts page: "For more information about probes, see Liveness, Readiness and Startup Probes." (11 words). Concepts page, §Liveness probe: "Liveness probes determine when to restart a container." (8 words). Tasks page, §Define a liveness command: "Kubernetes provides liveness probes to detect and remedy such situations." (10 words). Tier judgment: both are tier-A Kubernetes documentation of kubelet probes; they are one topic split into concept versus configure-how, not two provinces. kama's admission is vocabulary for endpoint health. kumitate's admission is the durable-execution liveness slot. Bare id "S119" denotes a different object in each lane (kama: llama.cpp line 6137; kumitate: the tasks URL).

"No bleed" does not mean "no unnamed collision."

## readme-map is lane-local by construction

Contract `kumitate-readme-map-v1` (`scripts/readme-map.mjs:3`, `:59-60`). The script sets `LANE` to the parent of its own file (`:68-69`) and defaults to `corpus/knowledge` and `corpus/lessons` joined to that root (`:70-72`, `:358`). Covered entries must match `^(knowledge|lessons)/[A-Za-z0-9._-]+\.md$` (`:73`). A57 B10 recomputes only those two directories against this lane's `corpus/README.md`. The gate never reads a sibling corpus, and a sibling README row cannot satisfy it. Registry `.ufo/pins/readme-map.json` is version 1 inside this lane. That path resolution is the boundary, not a policy comment.

## Proposed move

Append one heading and one paragraph to the existing `corpus/knowledge/worker-heartbeat-liveness.md`, after the last dash-clause. Not a `- ` line. Not in the first five lines. Not a new corpus file. Cite lane + path + URL, never a bare S-id. Text is `build/ConnectorSiblingOverlap/proposed-paragraph.md`. Scratch copy with the paragraph applied only under this build dir: `entry-with-paragraph.scratch.md`.

Shape check on that scratch (python, exit 0): before 36 lines / 13 dash-clauses at lines 18–26, 30–31, 35–36; after 40 lines / the same 13 dash lines; first five lines unchanged. Lane blob still `afed676b…`.

Affected axes:

- Coverage improves: the frontier entry becomes falsifiable against kama's already-mined concepts page and against the S117–S120 id collision, without adding a mechanism or a source row.
- Operability is unharmed: file count, README rows, and the `covered` set do not change, so the readme-map bimap stays the same object. D57 E1 reads only the first five lines; E2 binds only lines that start with `- `. A non-dash paragraph moves neither.

Rejected alternatives: a new knowledge file would be `unpinned` until a README row and a registry append land together, which couples coverage to the operability gate. Editing kama is cross-lane absorption; kama's matrix line 22 already disclaims the policy.

## Risks

- A `- ` bullet without a new receipt blob fails D57 E2 (`bound` must equal clause count, today 13, each path distinct and hashed).
- Putting the split in the first five lines crowds the E1 provenance regex. Keep it at the end.
- Citing "S119" or "S017" without the lane name attaches kama's llama.cpp error, or kumitate's Temporal activity-definition row, to the wrong page.
- Treating the tasks-page cross-link as permission to absorb kama's `/health` matrix would widen C2 into endpoint identity. The paragraph forbids that.
- mori's fleet liveness and kasegi's `telemetry.jsonl` heartbeat are string-neighbors only. Naming either as co-owner would blur the frontier slot.
- `sources-check` was not re-run on the scratch. E4's known checks are SOURCES rows and used-by paths, not this paragraph, but that is an inference until a scratch extract is checked. Do not patch the lane to find out.

## Verification

Observed, this seat: the git commands and the shape check in `build/ConnectorSiblingOverlap/commands.txt`. URLs reopened 2026-10-24 as above; quotes are from those pages, not from memory.

Not observed, this seat: ATTEST57 and DOCTRINE57 were not re-run. The HEAD subject line claims 10/10 and 5/5; that is the lane's commit message, not a measurement made here.

Later check, only if an integrator applies the paragraph in a scratch extract of `8c6f5b01` (never as a silent edit of this wave): `node .ufo/waves/round-57/probe/doctrine57-probe.mjs` must still print `held=5/5`, and `node scripts/readme-map.mjs` must still print `README_MAP: CLEAN` with the same files/rows/covered counts. A changed count means the paragraph was not the move specified here.
