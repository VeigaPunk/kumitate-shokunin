# K92Connector — sibling-overlap scan for C1 (`seat-route`, `kumitate-seat-route-v1`)

Read-only scan, round 92, 2026-11-06. Lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
(detached). Definitions compared against `.ufo/waves/round-92/plan.md` § *Frozen field definitions*.

Method (receipts in `receipts/`):
- `receipts/grep-fleet-fields.txt` — `grep -rn --exclude-dir={.git,node_modules,.ufo,corpus} --include=*.{mjs,js,py,sh,ts}
  -E 'model_change|resolvedModelIsFallback|stopReason|errorMessage' .` over the fleet root; 134 hits, all
  executable readers isolated below (the 134 include LOG/corpus prose, and `game-dev-3d` binaries whose
  bytes merely contain the strings).
- `receipts/grep-province.txt` — PROVINCE grep for `transcript|answering model|seat-route`.
- `receipts/r91-route-vs-inline.txt` — the only measurement run: the twelve `~/.omp/agent/sessions/*/*/K91*.jsonl`
  transcripts read read-only (names + model strings only; no body, no error text emitted), comparing
  plan's `captured`/`answered`/`final` with `inline-dispatch-evidence`'s `model`/`finished`.
- `receipts/grep-candidate-interim.txt` — interim candidate bytes grep (see §4).

## 1. Per-hit table

| # | file:line | what it computes | vs plan.md definitions |
|---|---|---|---|
| 1 | `kumitate-shokunin/scripts/inline-dispatch-evidence.mjs:75,119,197-200,204-215,244,345` | Defaults `sessionsRoot` to `~/.omp/agent/sessions`, indexes `**/<Seat>.jsonl`, records `model` = model of the **first** `model_change` whose role *starts with* `subagent:` (any seat), `yielded` (a `toolCall` named `yield` in `content`), `exitKind` (`custom/session_exit`), and `dead = !(yielded && exitKind ∈ {null,'normal'})`; `seatInfo {name, session, dead, model, norm}` | **Overlap, partial.** `captured`: equivalent only when the first `subagent:` row is the seat's own — measured 0/12 mismatch on r91, but plan's seat-scoped role plus `default`/absent fallback is not implemented. `yielded`: agrees (same predicate). `final`: **not modelled** — yield+exit proxy, not last-turn `stopReason`; measured 0/12 divergence on r91, structurally different (yield then error ⇒ plan `dead`, gate `done`). `answered`/`fallback`/`errors`/`aborted`/`last_error`: absent. |
| 2 | `mori-shokunin/tools/mori-seat-terminal.py:1-90,29-40,582,716,736,798-815` | Tail-only (≤524288 B) read of the **last** message record; classes `completed/aborted/dead_rate_limit/dead_quota/dead_auth/dead_error_other/error_unsettled/incomplete/unavailable`; 900 s settle window; decodes `role/stopReason/errorStatus/provider/model` and from `errorMessage` only derived metadata (retry prefix, `(type=NNNN)`, quota/rate/auth tokens) — the text is **never materialized**; schema `mori-seat-terminal-v1` | **Overlap on the surface, contradiction on two fields.** `final`: differs — plan has no settle window, reads the whole file, `dead` = last turn `stopReason:error` regardless of age, and has no `unavailable` class. `last_error`: **directly contradicts** — plan emits a redacted 120-char first line; mori refuses to materialize `errorMessage` text at all. `captured`/`answered`/`fallback`: not modelled. |
| 3 | `mori-shokunin/tools/mori-round17-context-check.py:567` | Policy text over seat instructions: seats reading OMP transcripts read only `type, customType, message.role, message.stopReason, message.errorStatus, message.provider, message.model`; "never print content, errorMessage text or usage" | **Contradicts plan's `yielded` and `last_error`** as written: plan requires scanning `content` for a `toolCall` named `yield`, and printing a redacted `errorMessage` first line. Same surface, opposite privacy posture. |
| 4 | `mori-shokunin/PROVINCE.md:103-108,593` | Declared: "passive terminal-at-scan transcript observation … field-limited status tallies by naming prefix/provider/model … no permanent death, authenticated lane membership, incident count or routing decision is claimed" | **Adjacency.** Mori owns terminal *status*; it explicitly declines routing. `seat-route` answers the question mori declines. |
| 5 | `mori-shokunin/PROVINCE.md:145-156` | Per-seat wave settlement, filesystem shape only; "result acceptance and re-dispatch stay **kumitate**'s" | **Adjacency, boundary already drawn in mori's favour of kumitate.** |
| 6 | `mado-shokunin/tools/mado-tripwire.py:4,36,2767-2770,2846` + `mado-shokunin/PROVINCE.md:25` | Reads transcript `.jsonl` assistant `toolCall` blocks only (bash `arguments.command`, python `arguments.code`), refuses paths outside `~/.omp/agent/sessions`, redacts three fixed secret patterns; coordinates with mori (transcript observation) and kagi (secret redaction) | **Adjacency.** No routing field read. Third distinct redaction rule on the same surface (mado: 3 fixed patterns; plan: `[A-Za-z0-9_-]{24,}` → `<redacted>`; mori: no text). |
| 7 | `souji-shokunin/census/round-43/records/seat-terminal-evidence.json` (68 rows) + `corpus/lessons/round-43.md:92` | Hand-read per-seat record: `name, agent, output_present, terminal{stopReason, provider, model, errorMessage}, errors[]`; lesson says "Per-seat exact final error and answering model are preserved" | **Adjacency — the capability produced by hand.** `terminal.model` is the *last* turn's model (plan's final-turn model), not `answered`; `errorMessage` stored **raw**, no redaction. |
| 8 | `souji-shokunin/census/round-44/records/seat-terminal-errors.json` (6 rows) | Per-seat `events[]` list of `model_change` and `message` events with raw `errorMessage` | **Adjacency**, same as #7; drill-down form. |
| 9 | `kotodama-shokunin/reports/round-88/provider-deaths.json` | Four dead seats with `role, provider, model, stopReason, error` ("402 Upstream request failed…"), source = "observed from retained sessions" | **Adjacency** — same reading, raw error text, no `answered`/`fallback`. |
| 10 | `/home/vgpnk/Projects/shokunin/scripts/hyaku/wave-live.py:1-20,110-125` | Fleet driver liveness: bounded 256 KiB tail; assistant `stopReason` `error`/`aborted` **closes** a run, later user/assistant/tool activity **reopens** it; emits one integer | **Not the same question; do not reuse as a reading.** Its reopening rule contradicts plan's `final = last turn` (plan never reopens). No model, no error text. |
| 11 | `/home/vgpnk/Projects/shokunin/scripts/hyaku/probe-alias.sh:14-25` | Live `omp -p` probe: prints `answered-by` = last non-error `message_end` provider/model plus each errored hop with 70 chars of `errorMessage`, **unredacted** | **Adjacency on the concept** (`answered-by`, failed hops), different surface (fresh probe, not a transcript). Its rule "last non-error wins" equals plan's `answered` first-seen list only if every error precedes every success. |
| 12 | `kama-shokunin/LOG.md:196-201` | Measured: `retry.modelFallback=true` with null chains; nine `resource_exhausted` errors with **no** `model_change`; the only model changes carried `resolvedModelIsFallback:false` | **Not a reader; supports a field definition.** Evidence that `fallback` must be computed from `answered ≠ captured` (plan's choice; ctl-flagonly 126/133), not from the flag. |
| 13 | `kumitate-shokunin/scripts/dispatch-evidence.mjs:99-157` | Counts `row.session`/`row.exit` from `launcher-progress.tsv` + the wave registry JSON; never opens a transcript | **Adjacency** — the results-side consumer; wave mode's `agent`→`role` join is the missing half. |

Excluded as non-readers: `game-dev-3d-shokunin` `pybullet*.so` binary byte matches; `tameshi`/`kaidoku`/`kama`
`LOG.md` prose; `kotodama`/`chousa` corpus captures; `wave-slot-selftest.sh` (fixture writer, not a reader).

## 2. Overlap vs adjacency, per lane

| lane | ruling |
|---|---|
| **kumitate (own lane)** | **Overlap, in-lane, narrowing.** `inline-dispatch-evidence` already emits a per-seat `model` and a `dead` verdict from the same transcripts. `seat-route` adds `answered`, `fallback`, `errors`, `aborted`, `last_error`, `final`; it must not become a second `dead` verdict with different rules. Measured on r91: identical verdicts (12/12) — the risk is latent, not current. |
| **mori** | **Overlap on surface + contradiction on `last_error`/`yielded`.** Mori owns terminal-status observation (PROVINCE:103-108) and says routing is not its claim; but mori's seat rule forbids reading `content` and printing `errorMessage` (context-check:567), which plan's `yielded` and `last_error` require. |
| **mado** | **Adjacency.** Same files, `toolCall` commands only; already coordinates with mori/kagi. Redaction rules differ (three patterns vs 24-char runs). |
| **souji** | **Adjacency (consumer + precedent).** Produced the same reading by hand twice (r43 68 rows, r44 6 rows) with raw `errorMessage`; a ready consumer for `seat-route --results`. |
| **kotodama** | **Adjacency (consumer + precedent).** `provider-deaths.json` is exactly the artifact `seat-route` would emit, hand-made, raw error text. |
| **kama** | **Adjacency (semantics only).** Its measured `resolvedModelIsFallback:false`-under-capacity-failure result is evidence for computing `fallback` from `answered ≠ captured`. |
| **kagi** | **Adjacent, different store.** `corpus/transcript-scan.sh` is a leak gate over the opencode SQLite DB (`PROVINCE.md:69`), not OMP JSONL; no routing fields. |
| **kaidoku, tameshi, chousa, revenger, kengaku, kake, kotoba, lore, audio, kasegi, tabi, tsukuroi, game-dev-2d/3d, souji-proc** | **No executable reader.** Field strings appear only in LOG/corpus prose or binaries; nothing to overlap. |
| **fleet `scripts/` (driver, not a lane)** | `hyaku` tooling reads `stopReason` for **liveness** (wave-live.py) and probes live aliases (probe-alias.sh). It does not read per-seat route; `seat-route`'s wave mode consumes the same `-results.json` that `inline-dispatcher.py` writes. |

**Which lane's PROVINCE claims session-transcript forensics?** None claims *route/answering-model*.
Three lanes partition the same surface by question: **mori** terminal status (`PROVINCE.md:103-108`),
**mado** issued commands (`PROVINCE.md:25`), **kagi** secret leakage over the opencode DB
(`PROVINCE.md:69`). The question "which model actually answered / which requests failed / last error"
is unclaimed fleet-wide (`receipts/grep-province.txt`: no hits for `answering model|seat-route`).

## 3. Round-92 claim against `kumitate-shokunin/PROVINCE.md`

- In scope as an instrument — `PROVINCE.md:15`: *"The lane's own instruments `scripts/*.mjs` (registry:
  `SKILL.md` §Gate registry) and its learning registry `corpus/SOURCES.md`."*
- Surface tension, two lines: `PROVINCE.md:16`: *"Member **content** stays out of scope by design
  (readdir + lstat only)."* and `PROVINCE.md:57`: *"Unchanged and binding: member content of `~/.omp/agent`
  is out of scope (readdir + lstat only), and the OMP live root is read only through an explicit live read."*
- The read surface (`~/.omp/agent/sessions/<cwd>/<session>/<Seat>.jsonl`) is member content. The lane
  already reads it in a **registered** gate — `SKILL.md:636` describes `inline-dispatch-evidence` as binding
  "one wave to records the lane does not author — the harness's per-seat session transcripts under
  `~/.omp/agent/sessions`". So C1 inherits a pre-existing stale sentence, it does not create the gap.
- `plan.md` contains no PROVINCE amendment and no province step (`grep -i province plan.md` → no hits).
  Routed to the L1: either append a dated amendment extending the instrument band to field-limited
  transcript reads under `sessions/`, or cite `SKILL.md:636` as the declared precedent at M.

## 4. Interim candidate check (not an attack; READY absent)

At 15:52 no `K92ExecTool/READY` existed. The interim bytes
`seat-route.mjs` sha256 `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608` import only
`node:fs/os/path/child_process/string_decoder/url`; `inline-dispatch-evidence` appears in a comment only;
no `mori`, `mado`, `wave-live`, `probe-alias`, `round-92`, `oracle92` or `probe92` string
(`receipts/grep-candidate-interim.txt`). No sibling coupling and no schema-name collision at that hash;
final bytes may differ.

## 5. Ruling (one line)

**No sibling owns this:** `seat-route` is in-lane instrument work (`PROVINCE.md:15`) overlapping only the
lane's own `inline-dispatch-evidence` on `captured` + a dead/done verdict (identical on all 12 r91 seats,
definitions structurally different), adjacent to mori (terminal status), mado (issued commands),
souji/kotodama (hand-produced seat records) and kama (fallback-flag semantics); its two live
contradictions — mori's no-`content`/no-`errorMessage` seat rule vs plan's `yielded`/`last_error`, and
`PROVINCE.md:16,57` "content out of scope" vs the read surface — are routed, not resolved here.
