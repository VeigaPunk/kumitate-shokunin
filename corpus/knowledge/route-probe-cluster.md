# Route-probe cluster — residue note for S7 (9 of 69 members)

## Scope — this note does NOT cover S7

This note names **9 of S7's 69 members** (`scripts/*.mjs` probe cluster + its
two shared helpers + its offline test double). S7 is the registry's largest
untouched family: 59 top-level `scripts/*.mjs` + `scripts/charter-scribe/` (6) +
`scripts/lean-cargo/` (4). Its row therefore stays **`no`** in `SCORECARD.md` — 9/69 is
13% of the family, and the family standard is "a corpus note names ALL of its
members at internals level". This file is honest partial progress, cited so a
future round can extend it; it must never be read as "S7 covered".

The tenth file the cluster *imports*, `scripts/omp-global-config.mjs` (735 L,
`readGlobalProviderAliasRoutes`), is **not** counted here: it is an **S5**
member already covered by `knowledge/route-resolution.md`, so it is reused, not
residue.

## Membership and measurement

```
$ ls scripts/probe-*.mjs scripts/atomic-write.mjs scripts/fake-omp.mjs | wc -l
9
$ wc -l scripts/probe-*.mjs scripts/atomic-write.mjs scripts/fake-omp.mjs | tail -1
 3132 total
$ ls scripts/*.mjs | wc -l                 # 72 − 13 S1–S6 *.mjs basenames = 59
72
$ find scripts/charter-scribe -type f | wc -l ; find scripts/lean-cargo -type f | wc -l
6
4                                          # 59 + 6 + 4 = 69
```

| Member | L | Answers | Posture |
|---|---|---|---|
| `scripts/probe-ufo-route-health.mjs` | 1364 | Does live OMP serve one `provider/model:effort` route now? | network |
| `scripts/probe-ufo-route-health.test.mjs` | 411 | Colocated suite over the probe's refusal arms | offline |
| `scripts/probe-redact.mjs` | 160 | Shared redaction table + unserved-reason ladder | offline |
| `scripts/probe-redact.test.mjs` | 79 | Unit tests for `redact`/`containsCredential`/`runOmpCatalog` | offline |
| `scripts/probe-token-plan-kimi.mjs` | 155 | Does the Token Plan serve kimi-k3/kimi-k2.7-code? | network |
| `scripts/probe-token-plan-models.mjs` | 247 | Do all configured non-Kimi aliases serve on primary? | network |
| `scripts/probe-token-plan-shared.mjs` | 235 | Catalog read + per-target route-health subprocess | network |
| `scripts/atomic-write.mjs` | 82 | fsync+rename durable publish (`writeAtomicFile`) | offline |
| `scripts/fake-omp.mjs` | 399 | No-network OMP double for both suites | offline |

All nine parse: `node --check` on each → exit 0 (9/9).

## What each probe answers

`probe-ufo-route-health.mjs` is the base instrument. It prints one JSON record
per requested route and is explicitly credential-blind — OMP is the only
credential authority; the probe never reads SQLite or token files and never
constructs an HTTP Authorization header (`scripts/probe-ufo-route-health.mjs:2-3`).
It also never reroutes and never treats stale or unknown health as available
(`:6-7`).

The two Token-Plan probes sit on top. Both read the *catalog* through
`omp models alibaba-token-plan --json --no-extensions`
(`scripts/probe-token-plan-shared.mjs:19-20`, `PROVIDER`/`CATALOG_COMMAND`),
then spawn `probe-ufo-route-health.mjs` as a subprocess per target — never
import it, because that file stays standalone
(`scripts/probe-token-plan-shared.mjs:160`, `probeListedModel`). The two probes
differ only in their delta callbacks: kimi reports the typed field or
`not served` (`scripts/probe-token-plan-kimi.mjs:45`); models reports the full
`unservedReason` ladder (`scripts/probe-token-plan-models.mjs:219-224`). Verdict emission
stays per-probe: models persists a durable verdict file, kimi prints only.
`probe-token-plan-kimi.mjs` asks specifically whether `kimi-k3` /
`kimi-k2.7-code` complete on their primary route
(`scripts/probe-token-plan-kimi.mjs:2`); `probe-token-plan-models.mjs` asks the
same for every configured non-Kimi alias and fails unless **every** target
serves.

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
| route-health | network — `spawnCollect("omp", ...)` (`scripts/probe-ufo-route-health.mjs:814`) runs `-p --mode json --model <route> --thinking <effort> --max-time Ns` | `scripts/probe-ufo-route-health.mjs:826`, `:828` |
| token-plan kimi/models | network — `omp models` catalog + route-health subprocess | `scripts/probe-token-plan-shared.mjs:20`, `:160` |
| token-plan shared | network — `spawnSync` of `omp` and of `process.execPath` + route-health | `:108`, `:173-174` |
| redact + its test | offline — pure regex/parse | `scripts/probe-redact.test.mjs:1` |
| route-health test | offline — stages a shell `omp` fake into a fixture `PATH` | `scripts/probe-ufo-route-health.test.mjs:38-45` |
| fake-omp | offline — "never reaches a real provider" | `scripts/fake-omp.mjs:10` |

No member is started by this note; probes are read + `node --check` only.

## Import / helper graph

```
probe-ufo-route-health.mjs ──> probe-redact.mjs        (CREDENTIAL_SHAPE, redact)   :34
                           └─> atomic-write.mjs         (writeAtomicFile)           :35
probe-token-plan-kimi.mjs  ──> probe-token-plan-shared.mjs (assertNoSecrets, CATALOG_COMMAND,
                                 failureVerdict, probeListedModel, PROVIDER, runOmpCatalog)  :10-17
                           ├─> omp-global-config.mjs      (readGlobalProviderAliasRoutes) :18
                           └─> probe-redact.mjs           (redact)                       :19
probe-token-plan-models.mjs ─> probe-token-plan-shared.mjs ; omp-global-config.mjs      :25, :27-34
probe-token-plan-shared.mjs ─> probe-redact.mjs  (containsCredential, parseJsonPayload,
                                                   redact, unservedReason)              :12-17
```

`scripts/probe-token-plan-shared.mjs:23` fixes `ROUTE_TIMEOUT_MS = 250_000`
(the subprocess budget the probes hand route-health) and `:22` fixes
`CATALOG_TIMEOUT_MS = 45_000`. `probe-ufo-route-health.mjs` also carries a
standalone parity copy of the redaction table for the fixture-copy path, which
the suite stages alongside `probe-redact.mjs` and `atomic-write.mjs`
(`scripts/probe-ufo-route-health.test.mjs:15`, `:21`).

## Concurrency and timeout bounds

| Bound | Value | Source |
|---|---|---|
| probe timeout default | 240_000 ms | `scripts/probe-ufo-route-health.mjs:45` |
| probe timeout range | 1000..=600000 ms | `:194` |
| `--max-age-ms` range | 1000..=86400000 ms | `:956` |
| routes per sweep | ≤ 16 | `:47` |
| concurrent `omp` subprocesses | 8 (`PROBE_CONCURRENCY`, `mapPool`) | `:67`, `:785` |
| per-stream buffer | 8 MiB (`MAX_BUFFER`) → ENOBUFS kills child | `:46` |
| child timeout grace | probe timeout + 5_000 ms, then SIGTERM→SIGKILL after 2 s | `:799`, `:711-716` |
| retained session bytes | 64 MiB/file, 128 MiB aggregate, 64 files | `:43`, `:44`, `:362` |
| persisted state | 1 MiB | `:40` |
| launch.json | 1 MiB, ≤ 64 stranded records | `:1019` |
| catalog timeout | 45_000 ms | `scripts/probe-token-plan-shared.mjs:22` |
| route subprocess timeout | 250_000 ms | `scripts/probe-token-plan-shared.mjs:23` |

`spawnCollect` re-implements spawnSync semantics over async `spawn` so probes
can run concurrently, and escalates a SIGTERM-immune child to SIGKILL so the
parent always exits (`scripts/probe-ufo-route-health.mjs:679-716`).

## Decision table — `scripts/probe-ufo-route-health.mjs` row verdict (`interpretRouteHealth`)

| Condition (in order) | status | available | reason |
|---|---|---|---|
| window timestamps not finite | `unknown` | no | `invalid_validity_window` (`:1166`) |
| `now > expiresAt` | `stale` | no | `expired` (`:1169`) |
| row not an object | `unknown` | no | `malformed_record` |
| `served` not boolean | `unknown` | no | `unknown_served` (`:1175`) |
| `served === true` and `failureClass === null` | `available` | **yes** | `null` |
| `failureClass` unknown/absent/not in `FAILURE_CLASSES` | `unknown` | no | `failureClass ?? "unknown"` (`:1180`) |
| otherwise (a known failure class) | `unavailable` | no | the class |

## Downstream consumption

- **Owning suite** `tests/route-probes.test.js` (2439 L, 96 `test(` cases) drives
  every member against `scripts/fake-omp.mjs`, staged as `omp` on `PATH`
  (`tests/route-probes.test.js:23`, `:132-138`); its section markers cover
  route-health (`tests/route-probes.test.js:285`), the typed payload refusal
  (`:413`), `--state` confinement (`:514`), `interpretPersistedHealth` (`:843`),
  `spawn_failure`/`output_overflow` (`:1045`), retry-after parsing (`:1181`),
  argument validation (`:1230`), `--launch` (`:1361`), kimi (`:1628`), shared
  (`:1948`) and models (`:2063`).
- **Colocated suite** `scripts/probe-ufo-route-health.test.mjs` (411 L,
  7 cases) re-stages the three sibling modules into a fixture `scripts/` dir.
- **Gate plan** registers the files as SUT: route-health + sync-global-routing
  as `scripts-suites` (`scripts/gates-plan.mjs:295`), and the probe/helper set
  as `orchestration` (`:296`).
- **Durable verdict**: models writes
  `.ufo/probes/probe-token-plan-models.verdict.json`
  (`scripts/probe-token-plan-models.mjs:41`, overridable via
  `UFO_PROBE_VERDICT_PATH` `:40`) for a downstream consumer — the concrete
  consumer outside scripts/tests is **UNVERIFIED** from this tree.
- **Fleet log**: refusal/exit history is recorded in `docs/BEHAVIOR-MATRIX.md`
  (e.g. the 2026-09-10 kimi exit-2 with `kimiListed: []`) — **UNVERIFIED** as a
  machine consumer; it is a human log.

## Limits of this note

- Covers 9/69 S7 members; the S7 row stays `no`. Not a coverage claim.
- `scripts/omp-global-config.mjs` is deliberately excluded (S5, already covered).
- The `tests/` suite is described as a consumer, not counted as an S7 member.
- Runtime behaviour of the network arms was **not** exercised here (no daemons,
  no `omp` invocation); only read + `node --check` (9/9 exit 0) was run.

## Citation ledger — 109 `path:line` refs, verbatim

109 citations, all re-resolved green by `node scripts/cite-check.mjs --symbols --strict` against
origin HEAD `daa371583`; the same refs appear unfenced in the prose above. Kept inside a
fence so the ledger's own text is never re-parsed as new citations.

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

Sources: `scripts/probe-ufo-route-health.mjs`, `scripts/probe-ufo-route-health.test.mjs`,
`scripts/probe-redact.mjs`, `scripts/probe-redact.test.mjs`,
`scripts/probe-token-plan-kimi.mjs`, `scripts/probe-token-plan-models.mjs`,
`scripts/probe-token-plan-shared.mjs`, `scripts/atomic-write.mjs`,
`scripts/fake-omp.mjs`, `scripts/omp-global-config.mjs`, `scripts/gates-plan.mjs`,
`tests/route-probes.test.js`, `docs/BEHAVIOR-MATRIX.md`.