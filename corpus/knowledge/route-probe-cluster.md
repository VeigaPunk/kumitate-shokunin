# S7 route-probe cluster — the 6-member probe family (round-32 re-census)

## Scope — S7 is the route-probe cluster, all 6 live members

S7 is the registry's **route-probe cluster** on the origin tree at HEAD
`964f443ee53df0ce06bd689af01f0dea031b01f9`: the 5 live `scripts/probe-*.mjs`
files plus the shared helper `scripts/fake-omp.mjs` — **6 members**,
`wc -l` total **2253**, every one named at internals level in this note by its
own `## \`scripts/<rel>\`` section. Round 13 closed the family as 9 members
(7 `probe-*.mjs` + `atomic-write.mjs` + `fake-omp.mjs`); the 2026-10-12 upstream
restructure deleted three of those files from the live tree (see
`## Round-32 membership removals` below). The cluster boundary remains a stated
rule, not a natural kind: `scripts/omp-global-config.mjs` is deliberately
**excluded** — it is an S5 member already covered by
`knowledge/route-resolution.md`, so it is reused, not residue. The historical
colocated suites and `atomic-write.mjs` are **no longer members** because they
are absent from the origin tree.

The remainder of the round-12 family is still **S8** (its own live membership
is re-censused separately) and is covered by
`knowledge/remaining-scripts-census.md`. Membership order follows the wiring:
the base instrument (`scripts/probe-ufo-route-health.mjs`), the shared machinery
of the token-plan pair (`scripts/probe-token-plan-shared.mjs`), the two probes
that sit on it (`scripts/probe-token-plan-kimi.mjs`,
`scripts/probe-token-plan-models.mjs`), the canonical redaction table the
token-plan pair imports (`scripts/probe-redact.mjs`; route-health keeps a
standalone parity copy at `scripts/probe-ufo-route-health.mjs:63-65`), then the
fixture helper (`scripts/fake-omp.mjs`). The family standard is satisfied once
per member, not once per note: a member counts only with ≥1 line anchor in its
own file and ≥1 named symbol describing its own behavior; a trailing list of
source names is not naming.

## Membership and measurement

```
$ ORIGIN=/home/vgpnk/Projects/ufo-fsd-alpha
$ ( ls -1 "$ORIGIN"/scripts/probe-*.mjs; ls -1 "$ORIGIN"/scripts/fake-omp.mjs ) | LC_ALL=C sort
/home/vgpnk/Projects/ufo-fsd-alpha/scripts/fake-omp.mjs
/home/vgpnk/Projects/ufo-fsd-alpha/scripts/probe-redact.mjs
/home/vgpnk/Projects/ufo-fsd-alpha/scripts/probe-token-plan-kimi.mjs
/home/vgpnk/Projects/ufo-fsd-alpha/scripts/probe-token-plan-models.mjs
/home/vgpnk/Projects/ufo-fsd-alpha/scripts/probe-token-plan-shared.mjs
/home/vgpnk/Projects/ufo-fsd-alpha/scripts/probe-ufo-route-health.mjs
$ ( ls -1 "$ORIGIN"/scripts/probe-*.mjs; ls -1 "$ORIGIN"/scripts/fake-omp.mjs ) | wc -l
6
$ wc -l "$ORIGIN"/scripts/probe-*.mjs "$ORIGIN"/scripts/fake-omp.mjs | tail -1
 2253 total
$ test -f "$ORIGIN"/scripts/atomic-write.mjs; echo $?   # 1 = absent
1
$ ls "$ORIGIN"/scripts/probe-*.test.mjs 2>&1 | head -1  # no colocated suites
ls: cannot access '.../scripts/probe-*.test.mjs': No such file or directory
```

Historical arithmetic (round 13, frozen for the partition story, not live
membership): **9 (S7) + 60 (S8) = 69**. Live S7 is **6**; the three deletions
are recorded in `## Round-32 membership removals`. S8's live set is owned by
the S8 recensus, not this note.

| Member | L | Answers | Posture |
|---|---|---|---|
| `scripts/probe-ufo-route-health.mjs` | 1195 | Does live OMP serve one `provider/model:effort` route now? | network |
| `scripts/probe-redact.mjs` | 116 | Shared redaction table + unserved-reason ladder (token-plan pair) | offline |
| `scripts/probe-token-plan-kimi.mjs` | 147 | Does the Token Plan serve kimi-k3/kimi-k2.7-code? | network |
| `scripts/probe-token-plan-models.mjs` | 244 | Do all configured non-Kimi aliases serve on primary? | network |
| `scripts/probe-token-plan-shared.mjs` | 159 | Catalog read + per-target route-health subprocess | network |
| `scripts/fake-omp.mjs` | 392 | No-network OMP double for probe tests | offline |

All six parse: `node --check` on each → exit 0 (6/6).

## Round-32 membership removals

Removed from this note (and from the live S7 member set) because the files are
**absent** from origin HEAD `964f443e` (`test -f` → false). Parent owns the
registry row's declared-count cell; this note only drops the phantom sections.

| Removed path | Former role | Evidence of absence |
|---|---|---|
| `scripts/atomic-write.mjs` | Shared fsync+rename helper (`writeAtomicFile`) | `test -f …/atomic-write.mjs` → exit 1; durable write is now inlined in `probe-ufo-route-health.mjs:1080`/`1117` and `probe-token-plan-models.mjs:40`/`66` |
| `scripts/probe-ufo-route-health.test.mjs` | Colocated `node --test` suite (7 cases) | `ls scripts/probe-*.test.mjs` → no matches |
| `scripts/probe-redact.test.mjs` | Colocated unit suite for redaction | same glob empty |

Sections that previously headed those three paths are **gone** from this file
(not renamed, not left as historical headings under `## \`scripts/…\`` form).

## `scripts/probe-ufo-route-health.mjs`

`scripts/probe-ufo-route-health.mjs` (1195 L) is the cluster's base instrument: it
answers whether live OMP serves one `provider/model:effort` route right now, prints
one JSON record per `--route`, and is credential-blind by construction — OMP is the
only credential authority, so the probe never reads SQLite or token files and never
constructs an HTTP `Authorization` header (`scripts/probe-ufo-route-health.mjs:2-3`),
and it never reroutes or treats stale/unknown health as available (`:6-7`). Optional
`--state` persists redacted machine records under `.ufo` via fsync+rename (`:4-5`),
implemented in-file by `persistState` (`:1080`) with a pid-timestamp tmp
(`:1117`) — the former sibling `atomic-write.mjs` import is gone. Redaction is a
**standalone parity copy** of `./probe-redact.mjs` (`:63-65`), not a sibling import,
so the origin suite can stage this one file alone. Its entry is the top-level
`main` (`:1164`) over a single argv walk, `parseArgs` (`:103`); `usage` prints to
stderr and exits 2 (`:97`) while `--help`/`-h` exits 0. All live work leaves through
the async `spawnCollect("omp", [...])` (`:678`, call site `:813`) running
`-p --mode json --model <route> …`, bounded by `PROBE_CONCURRENCY = 8` (`:61`)
through the order-preserving `mapPool` (`:784`). Named constants pin the envelope:
`DEFAULT_TIMEOUT_MS` 240_000 (`:39`), `MAX_BUFFER` 8 MiB (`:40`), `MAX_ROUTES` 16
(`:41`), the `FAILURE_CLASSES` taxonomy (`:45`) assigned by `classifyFailure`
(`:506`), and the argv token class `ROUTE_TOKEN` (`:200`). The emit gate
`assertNoSecrets` (`:939`) refuses credential-shaped output; a truncated-session
sweep is retagged `session_truncated` (`:904`). Verdicts come from
`interpretRouteHealth` (`:1015`) and `interpretPersistedHealth` (`:1037`), where
`healthy` ("every route served with no failure class", `:1174`) stays separate from
the cleanup `ok` field; exit is `!ok ? 2 : healthy ? 0 : 3` (`:1185`), and a fatal
catch emits the envelope `schema: "ufo-route-health-error-v1"` (`:1191`) then exits 1.

## `scripts/probe-token-plan-shared.mjs`

`scripts/probe-token-plan-shared.mjs` (159 L) is the library the token-plan probe pair
sits on — no shebang, no `process.exit`, no own CLI. It freezes the catalog read as
`PROVIDER = "alibaba-token-plan"` and
`CATALOG_COMMAND = \`omp models ${PROVIDER} --json --no-extensions\`` plus the two
budgets `CATALOG_TIMEOUT_MS = 45_000` and `ROUTE_TIMEOUT_MS = 250_000`
(`scripts/probe-token-plan-shared.mjs:19-20`, `:22`, `:23`). `runOmpCatalog` (`:51`)
is a `spawnSync("omp", [...])` catalog read. `probeListedModel` (`:84`) gates the
configured route and returns a typed unserved reason when the route is malformed or
when `ROUTE_HEALTH` (`:25`) is absent, otherwise spawning the probe as a subprocess
under `process.execPath`. `assertNoSecrets` (`:30`) gives both probes one redaction
gate and `failureVerdict` (`:39`) one verdict shape, so neither probe re-implements
them. Posture is network — the module only reaches out by spawning `omp` or the
route-health instrument.

## `scripts/probe-token-plan-kimi.mjs`

`scripts/probe-token-plan-kimi.mjs` (147 L) answers one narrow question — whether the
Alibaba Token Plan serves `kimi-k3` / `kimi-k2.7-code` on their primary route
(`scripts/probe-token-plan-kimi.mjs:2`) — with OMP as the only credential authority
(`:3-4`). Its argv surface is `--help`/`-h` only, which prints and exits 0 (`:57-58`);
any other `-`-prefixed argv goes through `fail` (`:24`), which prints a redacted
verdict and exits 2 (`:28`). Targets come from `readGlobalProviderAliasRoutes` (`:69`)
filtered to routes whose lowercase form `includes("kimi")` (`:77`); a sweep with no
such route prints `ok: true, available: false, targetStatus: "not-configured"`
(`:89-90`) and still exits 2 (`:100`). `probeTarget` (`:39`) delegates to
`probeListedModel` with a kimi-specific `unservedRowReason` mapping the typed field or
`"not served"` (`:41`), and a model absent from the catalog reports
`"not listed by /models"` (`:119`). Availability is the `some(...)` over merged
results (`:123`) — exit `available ? 0 : 2` (`:140`). Posture is network: one
`omp models` catalog read plus one route-health subprocess per listed target.

## `scripts/probe-token-plan-models.mjs`

`scripts/probe-token-plan-models.mjs` (244 L) asks the same question for every
configured **non**-Kimi alias and fails unless every target serves
(`scripts/probe-token-plan-models.mjs:2-4`). Unlike kimi it persists a durable verdict
**next to itself**: `writeVerdict` (`:40`) writes `VERDICT_PATH` (`:35`) =
`probe-token-plan-models.verdict.json` beside the script (no
`UFO_PROBE_VERDICT_PATH` override in the live file), through an exclusive tmp created
by `openTmpExclusive` (`:66`, `O_EXCL`), a `renameSync` (`:51`) and a parent-dir
fsync — the former `atomic-write.mjs` dependency is inlined here. `emit` (`:108`)
runs the shared `assertNoSecrets` gate (`:110`) before printing; `clearVerdict`
(`:81`) deletes or overwrites a stale `available: true` when durable write or secrets
refusal fails. A sweep with no targets emits `targetStatus: "not-configured"`
(`:196`) and exits 2; models absent from the catalog report
`"not listed by /models"` (`:221`) and availability is `targets.every(...)` (`:223`).
Posture is network — `omp models` plus one route-health subprocess per listed target.

## `scripts/probe-redact.mjs`

`scripts/probe-redact.mjs` (116 L) owns the redaction table shared by the token-plan
pair (route-health keeps a mirrored standalone copy — see parity note at
`scripts/probe-ufo-route-health.mjs:63-65`). The umbrella `CREDENTIAL_SHAPE`
(`scripts/probe-redact.mjs:8`) and the ordered `REDACT_PATTERNS` list (`:9`) compile
once as `COMPILED_REDACT_PATTERNS` (`:33`). `redact` (`:67`) strips invisible
format-character splitters via `FORMAT_CHARS_RE` (`:45`) and re-scans through
`redactOnce` (`:47`), so a Cf-split token is still a credential. `parseJsonPayload`
(`:75`) is the typed payload reader; `unservedReason` (`:106`) is the reason ladder
over a route-health row — typed failure field first, then the row/subprocess outcome,
then `uncompletedReason` (`:97`). The historical `containsCredential` export and
`RedactError` class are **gone** from the live file (116 L, not 160 L). Posture is
offline: pure regex and JSON, no IO, no CLI, no network.

## `scripts/fake-omp.mjs`

`scripts/fake-omp.mjs` (392 L) is the no-network OMP double probe tests stage as `omp`
on `PATH`; its header states it never claims live capacity and never reaches a real
provider (`scripts/fake-omp.mjs:10`). Behavior is driven by `FAKE_OMP_MODE` (`:30`) and
`FAKE_OMP_DELAY_MS` (`:35`), with `MODE` defaulting to `"healthy"` for an unset or empty
value (`:31`). `CATALOG` (`:47`) is the single source of truth for
`omp models <provider>` listings and for the `-p` catalog gate enforced by
`catalogHasRoute` (`:60`), while only `SUCCESS_MODES` (`:58`) ever claim a served route.
Output flows through `emit`/`emitRaw` (`:95`, `:98`), and `flushSession` (`:174`)
mirrors the same lines into `fake-omp-session.jsonl` (`:177`) under `--session-dir`, the
way real OMP persists sessions. Its argv hardening is deliberate non-parity — a valued
flag with a missing, empty, dash-leading or duplicated value is refused via
`usageRefusal` (`:160`) with exit 2 — and dispatch falls through to
`unknown command` for anything that is not `models`, `-p` or `--help`/`-h`.

## argv surface

| Probe | Surface |
|---|---|
| route-health | `--route provider/model:effort` (repeat ≤ 16, deduped), `--timeout-ms N` (1000..=600000), `--state .ufo/...json` (requires `--max-age-ms`), `--max-age-ms N` (1000..=86400000), `--launch <launch.json>` (≤ once), `--help`/`-h` |
| kimi / models | `--help`/`-h` only; any other `-`-prefixed argv is refused |

The route string is token-class validated (`scripts/probe-ufo-route-health.mjs:209`,
`ROUTE_TOKEN`): every component must match letters/digits/`.`/`_`/`-`, so a
route no consumer can represent is a usage error, not a spent live call
(`:203-208`). `--state` is confined under `.ufo`, must end `.json`, and is walked
for symlinks (`:994`); `MAX_ROUTES` is 16 (`:47`) and `--timeout-ms` defaults to
`DEFAULT_TIMEOUT_MS` 240_000 (`:45`). `parseArgs` is the single argv walk
(`:96`); usage prints to stderr and exits 2 (`:87`, `:93`), while `--help`
exits 0 (`:99`).

## Outcome and refusal vocabulary

**Route failure classes** (`scripts/probe-ufo-route-health.mjs:51-62`,
`FAILURE_CLASSES`), assigned by `classifyFailure` (`:507`): `usage_limit`,
`rate_limit`, `authentication`, `permission_denied`, `model_unavailable`,
`invalid_request`, `tool_failure`, `output_overflow`, `spawn_failure`,
`timeout`, `unknown`. A truncated-session sweep with no serving evidence is
retagged `session_truncated` (`:904`). `null` (not a class) means served-and-clean.

**Persisted-health status** (`interpretRouteHealth`, `:1164`;
`interpretPersistedHealth`, `:1186`) is one of `available` / `unknown` /
`stale` / `unavailable`, with reasons `invalid_validity_window` (`:1166`),
`expired` (`:1169`), `malformed_record`, `unknown_served` (`:1175`),
`malformed_state` (`:1188`), `unknown_schema`, `invalid_timestamps`,
`invalid_now`, `malformed_records` (`:1207`). The sweep-level rollup is
`available ? "available" : hasUnknown ? "unknown" : hasStale ? "stale" :
"unavailable"` (`:1217`) with rollup reasons `unknown_route_health`,
`expired`, `route_unavailable` (`:1224`).

**Launch telemetry outcomes** are the launcher's own strings
(`:1021`, `STRANDED_OUTCOMES`): `reachable` | `stranded-continue`; a record
whose `outcome` is neither dies typed (`:1102`).

**Typed runtime refusals** (`RouteHealthError`, `:79`) carry a stable
snake_case `code` so callers never regex the message (`:74`): state-path arms
(`state_path_symlink` `:994`, `state_path_outside_root`, `state_path_suffix`),
launch-ingest arms (`launch_path_symlink`, `launch_not_object`,
`stranded_record_outcome_conflict`, `stranded_record_hops_not_array`), read
arms (`session_jsonl_not_regular_file`, `session_jsonl_aggregate_too_large`)
and write arms (`credential_shaped_state` `:1266`, `state_tempfile_escaped`,
`state_replace_symlink`). The **emit gate** `assertNoSecrets` (`:943`) defaults
to code `credential_shaped_output` and message
`refusing to emit credential-shaped route-health output` (`:950`).

**Fatal envelope** (top-level catch, `:1355-1363`) is pinned:
`schema: "ufo-route-health-error-v1"` (`:1358`), `error.type: "fatal"`,
redacted `message`, plus `error.code` added only when the escaped error carries
a string code; exit 1 (`:1363`).

**Token-probe vocabulary**: `ProbeSharedError` codes are frozen in
`PROBE_SHARED_ERROR_CODES` (`scripts/probe-token-plan-shared.mjs:40`) —
`credential_shaped_output`, `catalog_timeout` (`:121`), `omp_not_on_path`,
`omp_spawn_failed`, `catalog_exit` (`:139`). `probe-redact.mjs` throws
`RedactError` (`scripts/probe-redact.mjs:110`) with codes `empty_payload`
(`:120`) / `invalid_json` (`:130`). Per-target row refusals are plain strings:
`configured route is malformed` (`scripts/probe-token-plan-shared.mjs:168`),
`secret-safe route probe missing` (`:171`), `not listed by /models`
(`scripts/probe-token-plan-kimi.mjs:127`, `scripts/probe-token-plan-models.mjs:224`),
`omp route probe timed out`,
`route probe output exceeded 8 MiB`.

## Exit codes

| Probe | Code | Meaning | Source |
|---|---|---|---|
| route-health | 0 | every route served, every temp tree cleaned | `scripts/probe-ufo-route-health.mjs:1346` |
| route-health | 3 | sweep clean but ≥1 route unhealthy (`healthy` false) | `scripts/probe-ufo-route-health.mjs:1346` |
| route-health | 2 | usage error, or a temp tree not removed (`ok` false) | `scripts/probe-ufo-route-health.mjs:93`, `:1346` |
| route-health | 1 | fatal typed refusal (envelope on stderr) | `scripts/probe-ufo-route-health.mjs:1363` |
| models | 0 | every configured non-Kimi target serves on primary | `scripts/probe-token-plan-models.mjs:155` |
| models | 2 | otherwise / unsupported flag / durable-write failure | `scripts/probe-token-plan-models.mjs:132`, `:142` |
| kimi | 0 | ≥1 exact Kimi model serves on primary | `scripts/probe-token-plan-kimi.mjs:148` |
| kimi | 2 | unavailable evidence, usage error, or not-configured | `scripts/probe-token-plan-kimi.mjs:32`, `:104` |

The health verdict and sweep integrity are **separate fields**: `ok` is "every
temp tree removed", `healthy` is "every route served with no failure class", and
exit reflects both (`scripts/probe-ufo-route-health.mjs:1316-1318`, `:1325`). A
not-configured Token-Plan sweep
prints `ok: true` with `available: false` and `targetStatus: "not-configured"`
(`scripts/probe-token-plan-models.mjs:195-197`,
`scripts/probe-token-plan-kimi.mjs:92-94`) yet still exits 2 — absence of a
target is not availability.

## Redaction and the emit gate

`scripts/probe-redact.mjs` owns the canonical table: `CREDENTIAL_SHAPE`
(`:8`) plus the ordered `REDACT_PATTERNS` (`:9`), with
`CREDENTIAL_TOKEN_PATTERN_INDEX` (`:44`) selecting the subset that the emit gate
must refuse even in a non-redact field. `containsCredential` (`:49`) and
`redact` (`:92`) both strip invisible credential splitters (Cf/Mn/Zl/Zp and the
non-ASCII Zs set) and re-scan — a format-character-split token is still a
credential. The route-health probe imports `CREDENTIAL_SHAPE`/`redact` from this
module rather than hand-mirroring it; the mirrored copy is exactly what once let
its own emit gate refuse its own redacted rows
(`scripts/probe-ufo-route-health.mjs:30`).

## Offline vs network posture

| Member | Posture | Evidence |
|---|---|---|
| route-health | network — `spawnCollect("omp", ...)` (`scripts/probe-ufo-route-health.mjs:813`) | `scripts/probe-ufo-route-health.mjs:678`, `:813` |
| token-plan kimi/models | network — `omp models` catalog + route-health subprocess | `scripts/probe-token-plan-shared.mjs:20`, `:51`, `:84` |
| token-plan shared | network — `spawnSync` of `omp` and of `process.execPath` + route-health | `:51`, `:84` |
| redact | offline — pure regex/parse | `scripts/probe-redact.mjs:8`, `:67` |
| fake-omp | offline — "never reaches a real provider" | `scripts/fake-omp.mjs:10` |

No member is started by this note; probes are read + `node --check` only. The
two colocated suites that once filled offline rows are **removed** (see
`## Round-32 membership removals`).

## Import / helper graph

```
probe-ufo-route-health.mjs ──> (inlined redaction parity copy of probe-redact.mjs)  :63-65
                           └─> (inlined persistState fsync+rename; no atomic-write) :1080, :1117
probe-token-plan-kimi.mjs  ──> probe-token-plan-shared.mjs (assertNoSecrets, failureVerdict,
                                 probeListedModel, PROVIDER, runOmpCatalog)
                           ├─> omp-global-config.mjs      (readGlobalProviderAliasRoutes)
                           └─> probe-redact.mjs           (redact)
probe-token-plan-models.mjs ─> probe-token-plan-shared.mjs ; omp-global-config.mjs
                           ├─> probe-redact.mjs           (redact, unservedReason)
                           └─> (inlined writeVerdict / openTmpExclusive; no atomic-write) :40, :66
probe-token-plan-shared.mjs ─> probe-redact.mjs  (parseJsonPayload, redact, unservedReason)
```

`scripts/probe-token-plan-shared.mjs:23` fixes `ROUTE_TIMEOUT_MS = 250_000`
(the subprocess budget the probes hand route-health) and `:22` fixes
`CATALOG_TIMEOUT_MS = 45_000`. `probe-ufo-route-health.mjs` carries a
standalone parity copy of the redaction table (`:63-65`) so tests can stage that
one file alone; it no longer imports `./probe-redact.mjs` or `./atomic-write.mjs`.

## Concurrency and timeout bounds

| Bound | Value | Source |
|---|---|---|
| probe timeout default | 240_000 ms | `scripts/probe-ufo-route-health.mjs:39` |
| routes per sweep | ≤ 16 | `:41` |
| concurrent `omp` subprocesses | 8 (`PROBE_CONCURRENCY`, `mapPool`) | `:61`, `:784` |
| per-stream buffer | 8 MiB (`MAX_BUFFER`) | `:40` |
| catalog timeout | 45_000 ms | `scripts/probe-token-plan-shared.mjs:22` |
| route subprocess timeout | 250_000 ms | `scripts/probe-token-plan-shared.mjs:23` |

`spawnCollect` (`scripts/probe-ufo-route-health.mjs:678`) re-implements spawnSync
semantics over async `spawn` so probes can run concurrently via `mapPool` (`:784`).

## Decision table — `scripts/probe-ufo-route-health.mjs` row verdict (`interpretRouteHealth`)

| Condition (in order) | status | available | reason |
|---|---|---|---|
| window timestamps not finite | `unknown` | no | `invalid_validity_window` |
| `now > expiresAt` | `stale` | no | `expired` |
| row not an object | `unknown` | no | `malformed_record` |
| `served` not boolean | `unknown` | no | `unknown_served` |
| `served === true` and `failureClass === null` | `available` | **yes** | `null` |
| `failureClass` unknown/absent/not in `FAILURE_CLASSES` | `unknown` | no | `failureClass ?? "unknown"` |
| otherwise (a known failure class) | `unavailable` | no | the class |

Live entry: `interpretRouteHealth` at `scripts/probe-ufo-route-health.mjs:1015`
(file is 1195 L; round-13 line numbers in the citation ledger below are historical).

## Downstream consumption

- **Owning suite** `tests/route-probes.test.js` (outside the script-layer
  universe) drives live members against `scripts/fake-omp.mjs`, staged as `omp`
  on `PATH`. Exact case counts and section markers are **UNVERIFIED** against
  origin HEAD `964f443e` in this re-census (consumer only; not an S7 member).
- **Colocated suites** `scripts/probe-ufo-route-health.test.mjs` and
  `scripts/probe-redact.test.mjs` are **absent** from the live tree (removed
  members; see `## Round-32 membership removals`).
- **Gate plan** historically registered route-health + the probe/helper set as
  SUT in `scripts/gates-plan.mjs` — re-verify before citing live group lists.
- **Durable verdict**: models writes
  `scripts/probe-token-plan-models.verdict.json` next to itself
  (`scripts/probe-token-plan-models.mjs:35`, via `writeVerdict` `:40`) — the
  historical `.ufo/probes/…` path and `UFO_PROBE_VERDICT_PATH` override are
  **gone** from the live file. Concrete consumer outside scripts/tests is
  **UNVERIFIED**.
- **Fleet log**: refusal/exit history in `docs/BEHAVIOR-MATRIX.md` remains a
  human log — **UNVERIFIED** as a machine consumer.

## Member-completeness probe

Arm 1 — heading set vs member set (expect 6, then no diff lines). Both sides
must be `LC_ALL=C sort`ed (locale trap recorded in SCORECARD `## Limits`):

```bash
ORIGIN=/home/vgpnk/Projects/ufo-fsd-alpha
NOTE=corpus/knowledge/route-probe-cluster.md
{
  ls -1 "$ORIGIN"/scripts/probe-*.mjs
  ls -1 "$ORIGIN"/scripts/fake-omp.mjs
} | sed 's|.*/scripts/|scripts/|' | LC_ALL=C sort > /tmp/s7-members.txt
grep -oE '^## `scripts/[^`]+`' "$NOTE" \
  | sed -E 's/^## `//; s/`$//' | LC_ALL=C sort > /tmp/s7-headings.txt
wc -l < /tmp/s7-members.txt                        # 6
comm -3 /tmp/s7-members.txt /tmp/s7-headings.txt   # no output: 0 diff lines
```

Arm 2 — claims gate on this row (parent re-pins declared count to 6 first):

```text
$ node scripts/claims-check.mjs --row S7 --src /home/vgpnk/Projects/ufo-fsd-alpha
# expect: six section rows, live anchors, no SECTION_FILE_UNRESOLVED for the
# three removed paths; MEMBER_COUNT_DRIFT until the registry cell says 6
```

Drop-one control (one member heading renamed): arm 1 prints a two-line diff;
`claims-check` reports `SECTION_FILE_UNRESOLVED` while `proxy-check` can still
read `PROXY: MATCH` on layer terms that ignore note contents. The compensating
check is this probe / `--claims`, not the proxy alone.

## Limits of this note

- **Live membership is 6, not 9.** Command:
  `( ls -1 $ORIGIN/scripts/probe-*.mjs; ls -1 $ORIGIN/scripts/fake-omp.mjs ) | wc -l`
  → 6. Deleted since the round-13 freeze: `atomic-write.mjs`,
  `probe-ufo-route-health.test.mjs`, `probe-redact.test.mjs` (see
  `## Round-32 membership removals`). The registry row still declares 9 until
  parent updates it — that drift is intentional and owned by parent.
- `scripts/omp-global-config.mjs` is deliberately **excluded**: an S5 member
  already covered by `knowledge/route-resolution.md`, so it is reused, not
  residue.
- The origin's `tests/route-probes.test.js` suite is described as a consumer, not
  counted as an S7 member — it lives outside the frozen script-layer universe
  (`scripts/*.mjs` + files under `scripts/*/`).
- **Runtime behaviour was not exercised here.** No daemon, no `omp` invocation,
  no live route was spent; the members are read + `node --check` only (6/6 exit
  0). These are live-network probes: running them is a deliberate, credential-
  authority-mediated act, not a documentation step.
- **Member completeness is not machine-checked by `scripts/proxy-check.mjs`** —
  it counts registry rows and README rows, never note contents. The
  `## Member-completeness probe` above is the compensating check; it is a
  documentation check a reader re-runs, not a gate.
- **Topic sections below the member block** (argv surface, exit map, bounds
  table, citation ledger fence) still carry some round-12/13 line numbers that
  pre-date the restructure; they are historical context, not the section-form
  claim surface. Live anchors for the six members are only in the
  `## \`scripts/…\`` sections above.

## Citation ledger — the round-12 fence, verbatim

Frozen round-12 fence, kept verbatim as a historical artifact against origin HEAD
`daa371583`. It is **not** the note's current citation set — many paths and line
numbers pre-date the restructure (including the three removed S7 members). The
round-13 addendum and this round-32 re-census carry live refs only in the member
sections above. The ledger text below is fenced so it is never re-parsed as new
citations. Residual fragment from the pre-edit ledger intro (kept only to mark
the fence boundary): ambiguous-ref repair that made four suite refs explicit.
The same refs appear unfenced historically; do not treat them as live.

```
scripts/fake-omp.mjs:10                        // Never claims live capacity; never reaches a real provider.
scripts/gates-plan.mjs:295                     { re: /^scripts\/(probe-ufo-route-health|sync-global-routing)\.mjs$/, groups: ["scripts-suites"], why: "colocated route-tool suites" },
scripts/gates-plan.mjs:296                     { re: /^scripts\/(collect-omp-native-handoff|fake-omp|local-helper|omp-global-config|omp-native-shutdown|omp-role-work|prepare-ephemeral-l1|project-devin-subagents|probe-redact|probe-token-plan-kimi|probe-token-plan-models|probe-token-plan-shared|probe-ufo-route-health|run-omp-native-trial|sync-global-routing|sync-ufo-contracts|the-tick-config|the-tick-ping|ufo-credential-screen|ufo-drills|ufo-ground-handler|ufo-native-names)\.mjs$/, groups: ["orchestration"], why: "orchestration suite SUT" },
scripts/probe-redact.mjs:8                     export const CREDENTIAL_SHAPE = /(?:authorization|proxy-authorization)\s*[:=]|bearer\s+[A-Za-z0-9._~+-]+|basic\s+[A-Za-z0-9+\/=]{10,}|(?:api[_-]?key|secret|password|token)\s*[:=]|(?:sk|rk|ak|xai)-[A-Za-z0-9_-]{12,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/iu;
scripts/probe-redact.mjs:9                     const REDACT_PATTERNS = [
scripts/probe-redact.mjs:44                    const CREDENTIAL_TOKEN_PATTERN_INDEX = [1, 2, 3, 4, 7, 8, 9, 10, 12];
scripts/probe-redact.mjs:49                    export function containsCredential(text) {
scripts/probe-redact.mjs:92                    export function redact(value) {
scripts/probe-redact.mjs:110                   export class RedactError extends Error {
scripts/probe-redact.mjs:120                   if (!trimmed) throw new RedactError("empty_payload", "empty JSON payload");
scripts/probe-redact.mjs:130                   throw new RedactError("invalid_json", "payload was not JSON");
scripts/probe-redact.test.mjs:1                import test from "node:test";
scripts/probe-token-plan-kimi.mjs:2            // Probe whether the Alibaba Token Plan serves kimi-k3 / kimi-k2.7-code.
scripts/probe-token-plan-kimi.mjs:32           process.exit(2);
scripts/probe-token-plan-kimi.mjs:45           unservedRowReason: (row) => redact(row.failureClass || row.spawnError || row.providerErrorCode || "not served"),
scripts/probe-token-plan-kimi.mjs:92-94        ok: true,       available: false,       targetStatus: "not-configured",
scripts/probe-token-plan-kimi.mjs:104          process.exit(2);
scripts/probe-token-plan-kimi.mjs:127          : { served: false, reason: "not listed by /models" };
scripts/probe-token-plan-kimi.mjs:148          process.exit(available ? 0 : 2);
scripts/probe-token-plan-models.mjs:40         const VERDICT_PATH = process.env.UFO_PROBE_VERDICT_PATH
scripts/probe-token-plan-models.mjs:41         ?? path.join(HERE, "..", ".ufo", "probes", "probe-token-plan-models.verdict.json");
scripts/probe-token-plan-models.mjs:132        process.exit(code);
scripts/probe-token-plan-models.mjs:142        process.exit(2);
scripts/probe-token-plan-models.mjs:155        Writes .ufo/probes/probe-token-plan-models.verdict.json (UFO_PROBE_VERDICT_PATH overrides). No API keys read.`);
scripts/probe-token-plan-models.mjs:195-197    ok: true,       available: false,       targetStatus: "not-configured",
scripts/probe-token-plan-models.mjs:219-224    const listed = targets.filter(({ model }) => modelIds.includes(model));   const chatResults = {};   for (const target of targets) {     chatResults[target.route] = modelIds.includes(target.model)       ? probeTarget(target)       : { served: false, reason: "not listed by /models" };
scripts/probe-token-plan-models.mjs:224        : { served: false, reason: "not listed by /models" };
scripts/probe-token-plan-shared.mjs:19-20      export const PROVIDER = "alibaba-token-plan"; export const CATALOG_COMMAND = `omp models ${PROVIDER} --json --no-extensions`;
scripts/probe-token-plan-shared.mjs:20         export const CATALOG_COMMAND = `omp models ${PROVIDER} --json --no-extensions`;
scripts/probe-token-plan-shared.mjs:22         const CATALOG_TIMEOUT_MS = 45_000;
scripts/probe-token-plan-shared.mjs:23         const ROUTE_TIMEOUT_MS = 250_000;
scripts/probe-token-plan-shared.mjs:40         export const PROBE_SHARED_ERROR_CODES = Object.freeze({
scripts/probe-token-plan-shared.mjs:108        export function runOmpCatalog() {
scripts/probe-token-plan-shared.mjs:121        throw new ProbeSharedError(PROBE_SHARED_ERROR_CODES.CATALOG_TIMEOUT, "omp models catalog timed out");
scripts/probe-token-plan-shared.mjs:139        PROBE_SHARED_ERROR_CODES.CATALOG_EXIT,
scripts/probe-token-plan-shared.mjs:160        export function probeListedModel(target, { mismatchReason, unservedRowReason }) {
scripts/probe-token-plan-shared.mjs:168        return { served: false, reason: "configured route is malformed" };
scripts/probe-token-plan-shared.mjs:171        return { served: false, reason: "secret-safe route probe missing" };
scripts/probe-token-plan-shared.mjs:173-174    const result = spawnSync(process.execPath, [     ROUTE_HEALTH,
scripts/probe-ufo-route-health.mjs:2-3         // Secret-safe route-health probe. Invokes OMP as the credential authority // (never reads SQLite / token files / `omp token`). Prints one JSON record
scripts/probe-ufo-route-health.mjs:6-7         // Does not reroute and does not claim exact-primary admission. Stale or unknown // health is never treated as available.
scripts/probe-ufo-route-health.mjs:30          // key-preserving marker made this probe's own emit gate refuse its own
scripts/probe-ufo-route-health.mjs:40          const MAX_STATE_BYTES = 1 * 1024 * 1024;
scripts/probe-ufo-route-health.mjs:43          // cap alone would let the 64-file enumeration hold 4 GiB.
scripts/probe-ufo-route-health.mjs:44          const MAX_SESSION_TOTAL_BYTES = 128 * 1024 * 1024;
scripts/probe-ufo-route-health.mjs:45          const DEFAULT_TIMEOUT_MS = 240_000;
scripts/probe-ufo-route-health.mjs:46          const MAX_BUFFER = 8 * 1024 * 1024;
scripts/probe-ufo-route-health.mjs:47          const MAX_ROUTES = 16;
scripts/probe-ufo-route-health.mjs:51-62       const FAILURE_CLASSES = [   "usage_limit",   "rate_limit",   "authentication",   "permission_denied",   "model_unavailable",   "invalid_request",   "tool_failure",   "output_overflow",   "spawn_failure",   "timeout",   "unknown",
scripts/probe-ufo-route-health.mjs:67          const PROBE_CONCURRENCY = 8;
scripts/probe-ufo-route-health.mjs:74          // catch carries a stable snake_case `code`, so a caller/test tells refusal arms
scripts/probe-ufo-route-health.mjs:79          class RouteHealthError extends Error {
scripts/probe-ufo-route-health.mjs:87          const PROBE_USAGE =
scripts/probe-ufo-route-health.mjs:93          process.exit(2);
scripts/probe-ufo-route-health.mjs:96          function parseArgs(argv) {
scripts/probe-ufo-route-health.mjs:99          process.exit(0);
scripts/probe-ufo-route-health.mjs:194         usage("--timeout-ms must be an integer in 1000..=600000");
scripts/probe-ufo-route-health.mjs:203-208     // Route components are the token class every downstream route surface in this // repository already accepts (fleet-dispatcher ROUTE_PATTERN, sync-ufo-contracts // typed selector, collect-omp-native-handoff splitRoute). A component outside it // — control characters, whitespace, quotes, or an extra `/`/`:` separator — is a // route no consumer can represent: admitting it spends a live omp call to report // `unknown` instead of a usage error, and echoes the raw bytes as requestedRoute.
scripts/probe-ufo-route-health.mjs:209         const ROUTE_TOKEN = /^[A-Za-z0-9._-]+$/u;
scripts/probe-ufo-route-health.mjs:362         function sessionJsonlFiles(directory) {
scripts/probe-ufo-route-health.mjs:507         function classifyFailure({ timedOut, signal, status, code, message }) {
scripts/probe-ufo-route-health.mjs:679-716     function spawnCollect(command, args, options = {}) {   const { timeout, maxBuffer = 1024 * 1024, ...spawnOptions } = options;   return new Promise((resolve) => {     let child;     try {       child = spawn(command, args, { ...spawnOptions, stdio: ["ignore", "pipe", "pipe"] });     } catch (error) {       resolve({ error, status: null, signal: null, stdout: "", stderr: String(error?.message ?? error) });       return;     }     const stdout = [];     const stderr = [];     let stdoutBytes = 0;     let stderrBytes = 0;     let stdoutOverflow = false;     let stderrOverflow = false;     let timedOut = false;     let finished = false;     let killTimer = null;     const finish = (error, status, signal) => {       if (finished) return;       finished = true;       clearTimeout(timer);       clearTimeout(killTimer);       resolve({         error: error ?? null,         status: status ?? null,         signal: signal ?? null,         stdout: Buffer.concat(stdout).toString("utf8"),         stderr: Buffer.concat(stderr).toString("utf8"),       });     };     // SIGTERM + stdio destroy + armed SIGKILL escalation, shared by the     // timeout and ENOBUFS kill paths. A wedged child must not hold the     // parent's event loop open; the unref'd escalation timer never delays     // parent exit and a 'close' before it fires clears it.     const armKillEscalation = () => {       clearTimeout(killTimer);
scripts/probe-ufo-route-health.mjs:711-716     // SIGTERM + stdio destroy + armed SIGKILL escalation, shared by the     // timeout and ENOBUFS kill paths. A wedged child must not hold the     // parent's event loop open; the unref'd escalation timer never delays     // parent exit and a 'close' before it fires clears it.     const armKillEscalation = () => {       clearTimeout(killTimer);
scripts/probe-ufo-route-health.mjs:785         async function mapPool(items, limit, fn) {
scripts/probe-ufo-route-health.mjs:799         async function probeRoute(route, timeoutMs) {
scripts/probe-ufo-route-health.mjs:814         result = await spawnCollect("omp", [
scripts/probe-ufo-route-health.mjs:826         "--model", route.requested,
scripts/probe-ufo-route-health.mjs:828         "--max-time", `${maxTimeSec}s`,
scripts/probe-ufo-route-health.mjs:904         if (valuesTruncated && !served && (failureClass === "unknown" || failureClass == null)) {
scripts/probe-ufo-route-health.mjs:943         function assertNoSecrets(value, code = "credential_shaped_output") {
scripts/probe-ufo-route-health.mjs:950         throw new RouteHealthError(code, "refusing to emit credential-shaped route-health output");
scripts/probe-ufo-route-health.mjs:956         usage("--max-age-ms must be an integer in 1000..=86400000");
scripts/probe-ufo-route-health.mjs:994         if (info?.isSymbolicLink()) reject("state_path_symlink", "--state refuses symlinks");
scripts/probe-ufo-route-health.mjs:1019        const MAX_LAUNCH_BYTES = 1 * 1024 * 1024;
scripts/probe-ufo-route-health.mjs:1021        const STRANDED_OUTCOMES = new Set(["reachable", "stranded-continue"]);
scripts/probe-ufo-route-health.mjs:1102        throw new RouteHealthError("stranded_record_outcome_invalid", `stranded record ${index} outcome must be reachable|stranded-continue`);
scripts/probe-ufo-route-health.mjs:1164        function interpretRouteHealth(row, { nowMs, expiresAtMs }) {
scripts/probe-ufo-route-health.mjs:1166        return { status: "unknown", available: false, reason: "invalid_validity_window" };
scripts/probe-ufo-route-health.mjs:1169        return { status: "stale", available: false, reason: "expired" };
scripts/probe-ufo-route-health.mjs:1175        return { status: "unknown", available: false, reason: "unknown_served" };
scripts/probe-ufo-route-health.mjs:1180        if (row.failureClass === "unknown" || row.failureClass == null || !FAILURE_CLASSES.includes(row.failureClass)) {
scripts/probe-ufo-route-health.mjs:1186        function interpretPersistedHealth(state, now = new Date()) {
scripts/probe-ufo-route-health.mjs:1188        return unavailableHealth("unknown", "malformed_state");
scripts/probe-ufo-route-health.mjs:1207        return unavailableHealth("unknown", "malformed_records", state);
scripts/probe-ufo-route-health.mjs:1217        const status = available ? "available" : hasUnknown ? "unknown" : hasStale ? "stale" : "unavailable";
scripts/probe-ufo-route-health.mjs:1224        reason: status === "available" ? null : status === "unknown" ? "unknown_route_health" : status === "stale" ? "expired" : "route_unavailable",
scripts/probe-ufo-route-health.mjs:1266        throw new RouteHealthError("credential_shaped_state", "refusing credential-shaped route-health state");
scripts/probe-ufo-route-health.mjs:1316-1318   // probe-token-plan-shared reads. healthy is the route-health verdict:     // every route served with no failure class. Callers must never read ok     // as health; the exit code reflects BOTH: 0 healthy+clean, 3 clean but
scripts/probe-ufo-route-health.mjs:1325        healthy: results.every((row) => row.served === true && row.failureClass === null),
scripts/probe-ufo-route-health.mjs:1346        process.exit(!payload.ok ? 2 : payload.healthy ? 0 : 3);
scripts/probe-ufo-route-health.mjs:1355-1363   // carries a string code (a RouteHealthError code or a Node fs code such as   // EACCES); never an argument value and never a credential slice.   const envelope = {     schema: "ufo-route-health-error-v1",     error: { type: "fatal", message },   };   if (typeof error?.code === "string" && error.code) envelope.error.code = error.code;   console.error(JSON.stringify(envelope));   process.exit(1);
scripts/probe-ufo-route-health.mjs:1358        schema: "ufo-route-health-error-v1",
scripts/probe-ufo-route-health.mjs:1363        process.exit(1);
scripts/probe-ufo-route-health.test.mjs:15     // The probe imports ./probe-redact.mjs and ./atomic-write.mjs as siblings;
scripts/probe-ufo-route-health.test.mjs:21     copyFileSync(ATOMIC_WRITE, join(scriptsDir, "atomic-write.mjs"));
scripts/probe-ufo-route-health.test.mjs:38-45  const fakeOmp = join(binDir, "omp");     writeFileSync(targetPath, "{}\n");     writeFileSync(fakeOmp,       "#!/bin/sh\n"       + "rm -f \"$UFO_PROBE_STATE_PATH\"\n"       + "ln -s \"$UFO_PROBE_STATE_TARGET\" \"$UFO_PROBE_STATE_PATH\"\n"       + "printf 'PONG\\n'\n",       { mode: 0o700 });
tests/route-probes.test.js:23                  const FAKE_OMP = join(SCRIPTS, "fake-omp.mjs");
tests/route-probes.test.js:132-138             * Create a temp directory with `omp` -> fake-omp.mjs symlink.  * Returns { dir, pathPrefix }; afterEach removes the directory.  */ function fakeOmpPath(source = null) {   const dir = mkdtempSync(join(tmpdir(), "ufo-fake-omp-"));   fakeOmpDirs.push(dir);   if (source == null) symlinkSync(FAKE_OMP, join(dir, "omp"));
tests/route-probes.test.js:285                 // ---- probe-ufo-route-health.mjs tests ----
tests/route-probes.test.js:413                 // ---- probe-redact.mjs: typed payload refusal ----
tests/route-probes.test.js:514                 // ---- --state path confinement (assertStatePath) ----
tests/route-probes.test.js:843                 // ---- interpretPersistedHealth (stale / schema / malformed) ----
tests/route-probes.test.js:1045                // ---- spawn_failure / output_overflow ----
tests/route-probes.test.js:1181                // ---- retryAfter seconds-vs-ms heuristic ----
tests/route-probes.test.js:1230                // ---- argument validation ----
tests/route-probes.test.js:1361                // ---- route-health --launch (launch.json stranded telemetry) tests ----
tests/route-probes.test.js:1628                // ---- probe-token-plan-kimi.mjs tests ----
tests/route-probes.test.js:1948                // ---- probe-token-plan-shared.mjs tests ----
tests/route-probes.test.js:2063                // ---- probe-token-plan-models.mjs tests ----
```

Sources (live S7 members + excluded reuse + external consumers):
`scripts/probe-ufo-route-health.mjs`, `scripts/probe-redact.mjs`,
`scripts/probe-token-plan-kimi.mjs`, `scripts/probe-token-plan-models.mjs`,
`scripts/probe-token-plan-shared.mjs`, `scripts/fake-omp.mjs`,
`scripts/omp-global-config.mjs` (S5, excluded), `tests/route-probes.test.js`
(consumer, not a member). Removed from the live tree (no longer sources):
`scripts/atomic-write.mjs`, `scripts/probe-ufo-route-health.test.mjs`,
`scripts/probe-redact.test.mjs`.