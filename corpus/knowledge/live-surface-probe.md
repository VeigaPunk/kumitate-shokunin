# live-surface probe — manifest self-consistency, not wall state

`scripts/surface-probe.mjs` (contract `kumitate-surface-probe-v1`): zero-dep ESM,
node ≥20, READ-ONLY. It re-derives from the origin tree's own bytes what the two
surfaces this province documents *declare* about themselves, and reports every
disagreement. Text verdict `SURFACE_PROBE: CLEAN|DRIFT (surfaces=2 checks=N
errors=E warnings=W)`; `--json` mirrors `scripts/cite-check.mjs`'s shape
(`{schema, src, self, options, surfaces, checks, findings, totals, verdict}`).
Exit 0 clean · 1 any error (any warn under `--strict`) · 2 fail-closed
(missing/non-dir `--src`, absent surface script, unparsable JSON, zero checks
run) · 64 usage. `--src` defaults to
`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`; `--self` to this repo.

## The two surfaces (both read-only)

- **Sighting surface** — `bash scripts/ufo-sighting surface --json`
  (`scripts/sync-ufo-contracts.mjs:102` is the authority that names this host
  path; it shells exactly that argv at `:869`). The shim is a bash FILE
  (`scripts/ufo-sighting:224` execs the module) — not a directory. Dispatched at
  `scripts/ufo-sighting.mjs:88-95`: the flag is REQUIRED
  (bare `surface` is `INVALID_ARGUMENT`), the verb body is one call to
  `surfaceManifest()` then `output()`. `scripts/ufo-sighting-lib/surface.mjs`
  imports ONLY `scripts/ufo-sighting-lib/base.mjs` constants (`:13`) — no
  `scripts/ufo-sighting-lib/wall.mjs`, no `withOperationLock`, no
  `writeFileSync` anywhere in the file; its only `spawnSync` (`:401`) is the
  unrelated legacy native-direct path. It reads the shim, the module, every
  regular `*.mjs` under `scripts/ufo-sighting-lib/` (26), and `config/ufo.json`.
- **Dispatcher status** — `node scripts/fleet-dispatcher.mjs status`
  (`scripts/fleet-dispatcher.mjs:14387-14456`). JSON by DEFAULT and there is no
  `--json` flag — passing one is `dispatcher_usage_error`; read-only by explicit
  design, not by accident: the queue read is lock-free because `writeQueue`
  publishes by atomic rename (`:14390`), and the bootstrap orphan-tmp sweep is
  gated off `status`/`view` (`:14391-14395`). Its two apparent writes are not
  writes: `emitLedgerModuleTelemetry` is console-only (`:429-436`) and the
  `ledger_coverage_degraded` episode is a GAUGE kind — only
  `DURABLE_TELEMETRY_KINDS = {ledger_event_drift,
  ledger_terminal_verdict_revision}` (`:11735`) reaches `emitterLatchTouch`
  (`:11868`), so no latch file is persisted. No tmux, no lock, no pane.

Neither surface is trusted: the probe compares each to the bytes it claims to
describe, so a surface that starts lying becomes a finding rather than a
citation.

## What it proves

- **Digest-set exhaustiveness (28).** `digestInputs` must equal
  {`scripts/ufo-sighting`, `scripts/ufo-sighting.mjs`} ∪ {regular `*.mjs` in
  `scripts/ufo-sighting-lib/`} — set equality both directions
  (`DIGEST_INPUT_MISSING` for a declared entry whose file is absent,
  `DIGEST_SET_INCOMPLETE` for a file the manifest omitted). Measured
  2026-09-28: 28 = 2 + 26, zero missing, zero extra (`readdirSync` of the lib
  directory returns 26 `.mjs` and nothing else).
- **Manifest self-consistency per file.** Every `digestInputs[].sha256` is
  recomputed from the bytes on disk (`DIGEST_MISMATCH`), so the manifest's own
  per-file claims cannot rot silently.
- **The concatenated-byte digest.** `manifest.scriptDigest` is a sha256 over the
  CONCATENATED BYTES of shim + module + sorted lib modules — in that fixed
  order, and explicitly not any single file's hash
  (`scripts/ufo-sighting-lib/surface.mjs:43-58`). Live 2026-09-28:
  `sha256:0e98c908bb8dc52353716852b5451605ad5889c98b7bc620fceebd7797725567`,
  reproduced byte-for-byte by an independent concatenation.
- **Verbs vs source dispatch.** Each of the 12 `manifest.verbs` keys must have a
  `command ===` clause in `scripts/ufo-sighting.mjs` (`VERB_UNDISPATCHED`
  otherwise) and each dispatched verb must be declared (`VERB_UNDECLARED`,
  e.g. a verb added to the module but never chartered into the manifest).
  Live: `open:81, launch:208, complete:304, remove:272, steer:315, peek:323,
  status:98, overview:107, reconcile:145, respawn-terminal:150, inquiry:157,
  resume:283`; the 5 `extras` (`register:242, twin:260, surface:88, help:331,
  trigger-alias` = the `resolveTrigger` guard at `:64`) all resolve too.
- **Error codes vs `fail()` bytes.** The manifest's 79 `errors` are exactly the
  set `/\bfail\(\s*"([A-Z][A-Z0-9_]*)"/gu` finds in the module + lib bytes
  (`scripts/ufo-sighting-lib/surface.mjs:60-69`). `ERROR_CODE_UNDECLARED` = a
  `fail("X")` call site with no manifest entry;
  `ERROR_CODE_PHANTOM` = an entry with no call site. Measured 2026-09-28:
  79 = 79, both directions empty.
- **Dispatcher status shape.** The 12 top-level keys and their types (`ok`
  boolean, the rest objects) must still be present and unchanged, and
  `queue.schema` must still be `ufo-pending-work-v1` (`STATUS_SHAPE`). Extra
  keys are tolerated — the origin tree grows status fields additively (see the
  additive `reapWithheld`/`emitterLatch`/`admissions` comments at
  `scripts/fleet-dispatcher.mjs:14421-14436`); a missing or retyped key is the
  finding.
- **Reachability.** Both surfaces are actually invoked, so a summary that cannot
  run is `SURFACE_UNREACHABLE`/`MANIFEST_UNPARSED`/`MANIFEST_KIND` rather than a
  silent pass.

## Implementation map (and the read-only proof)

Origin-tree cites below carry line numbers; probe internals are cited by symbol
(the file ships with this lane, so its line numbers are not evidence).

- `readSightingSurface()` / `readDispatcherStatus()` — the ONLY two child
  processes conformance mode starts: `bash <src>/scripts/ufo-sighting surface
  --json` (cwd = `--src`) and `<node> <src>/scripts/fleet-dispatcher.mjs status`.
  Nonzero exit, a spawn error or non-JSON stdout becomes a typed detail, never a
  throw (the same discipline `scripts/sync-ufo-contracts.mjs:857-870` applies to
  the live surface leg).
- `probeConformance()` — drives `CHECK_ORDER` and assembles
  `surfaces`/`checks`/`findings`/`totals`.
- `digestSetDiff()` + `checkDigests()` — set equality, per-file `sha256`, the
  concatenated-byte digest and the `DIGEST_ORDER` note.
- `checkVerbs()`, `checkErrorCodes()`, `checkPin()`, `checkStatus()` — the four
  remaining conformance checks, each its own finding stream.
- `parseChecklist()` / `runChecklistsMode()` — the frozen-grammar parser and the
  runner (`bash -c <command>`, cwd = repo root, 120 s per item).
- `buildFixture()` / `selfTest()` — the hermetic suite. EVERY filesystem
  mutation in the file (`mkdtempSync`/`mkdirSync`/`writeFileSync`/`rmSync`) is
  inside this region under a `tmpdir()` scratch root that is removed at the end;
  conformance mode contains none of them.

## Two digests, one pin

Two different hashes exist over the same manifest, and comparing the wrong pair
is an always-false drift signal.

| Value | Input | Home |
|---|---|---|
| `manifest.scriptDigest` | sha256 of CONCATENATED FILE BYTES: shim + module + sorted `scripts/ufo-sighting-lib/*.mjs` | `scripts/ufo-sighting-lib/surface.mjs:43-58` |
| `sighting.surfaceDigest` (the pin) | sha256 of `canonicalJson(manifest)` — sorted keys, no whitespace | `scripts/sync-ufo-contracts.mjs:842-851`, `:853-855` |

Measured 2026-09-28 on the live tree: bytes digest
`sha256:0e98c908bb8dc52353716852b5451605ad5889c98b7bc620fceebd7797725567`,
canonical-manifest digest
`sha256:de50bca59b159cbd77029bf6e26d1bf26762c9849fc6b89fa2fba572995fc099` —
and that second value IS the pin at `config/ufo.json:65`. So the pin is NOT
stale: the origin tree's own authority says so, `node
scripts/sync-ufo-contracts.mjs --check` reporting for its `surface` block
`"ok": true` / `"message": "sighting surface digest matches
sha256:de50bca59b159cbd77029bf6e26d1bf26762c9849fc6b89fa2fba572995fc099"`. A
verdict that compares the pin to `scriptDigest` therefore always disagrees and
proves nothing; the probe's `PIN_DRIFT` warn (the brief's name: `PIN_STALE`) is
defined over the CANONICAL digest (pin vs `canonicalJson(manifest)`), which is
the only pair the origin tree itself gates on (`:941` live leg, `:2624-2634`
committed leg — the one case that turns that audit red, owner routed to
`ownerLane: "nc8-sighting"`, `:948` and `:2633`).

## Checks and finding codes

A conformance run executes a FIXED 12-check order — `sighting`: `SURFACE_REACH`,
`MANIFEST_PARSE`, `MANIFEST_KIND`, `DIGEST_INPUT_SET`, `DIGEST_PER_FILE`,
`DIGEST_CONCAT`, `VERB_DISPATCH`, `ERROR_CODES`, `PIN_DIGEST`; `dispatcher`:
`STATUS_REACH`, `STATUS_SHAPE`, `STATUS_QUEUE_SCHEMA` — and `checks` is that
count, never a subset. Live 2026-09-28: `checks=12 passed=12 errors=0
warnings=1 notes=2` (`ERROR_CODE_OFF_MANIFEST`; `PIN_MATCH`,
`STATUS_KEYS_DERIVED`), verdict `SURFACE_PROBE: CLEAN`, exit 0.

Errors (exit 1):

| Code | Fires when | Live 2026-09-28 |
|---|---|---|
| `SURFACE_UNREACHABLE` | a surface command cannot be spawned or exits nonzero, or the module is unreadable | not fired |
| `MANIFEST_UNPARSED` | `surface --json` stdout is not JSON | not fired |
| `MANIFEST_KIND` | `kind !== "sighting-surface-v1"` — named as an error AND fail-closes: the six digests/verb/code/pin checks are skipped and the run exits 2 (`SURFACE_PROBE: FAIL-CLOSED (manifest kind is …)`), verified against a fixture host printing a foreign kind | not fired |
| `DIGEST_INPUT_MISSING` | a `digestInputs[].path` does not exist under `--src` | not fired |
| `DIGEST_MISMATCH` | a per-file `sha256` ≠ the file's bytes | not fired |
| `DIGEST_SET_INCOMPLETE` | declared set ≠ {shim, module} ∪ {regular lib `*.mjs`} (either direction) | not fired (28 = 2 + 26) |
| `SCRIPT_DIGEST_MISMATCH` | recomputed concatenated-byte digest ≠ `manifest.scriptDigest` | not fired |
| `VERB_UNDECLARED` | a dispatched verb absent from `manifest.verbs`/`extras` — `--help`/`-h` are aliases, `__`-prefixed entries are internal | not fired |
| `VERB_UNDISPATCHED` | a declared verb with neither a `command ===` clause nor a `resolveTrigger` alias guard (`trigger-alias`) | not fired |
| `ERROR_CODE_UNDECLARED` | `fail("X")` in the bytes, `X` not in `manifest.errors` | not fired |
| `ERROR_CODE_PHANTOM` | `X` in `manifest.errors` with no `fail("X")` call site | not fired |
| `STATUS_SHAPE` | a status key missing/retyped, or `queue.schema` ≠ `ufo-pending-work-v1` | not fired (12 keys) |
| `CHECKLIST_GRAMMAR` | a `- [ ]` line in `SKILL.md` that does not match the frozen grammar | not fired (no items at probe landing) |

Warnings (exit 0 unless `--strict` — but the pin warn is never promoted to
error, it is the origin tree's property): `PIN_DRIFT` — pin ≠
canonical-manifest digest, owner = the origin tree, whose re-charter obligation
it is (`scripts/sync-ufo-contracts.mjs:949`); the frozen round-9 brief named
this code `PIN_STALE`, the artifact ships `PIN_DRIFT`. `PIN_MISSING` — no
`sha256:<64 hex>` pin under `config/ufo.json` `sighting.surfaceDigest`.
`STATUS_KEY_EXTRA` — a status key the contract does not name.
`ERROR_CODE_OFF_MANIFEST` — a code assigned to a `code:` field as a literal but
absent from `manifest.errors`, which is derived from `fail("X")` literals only.
Measured 2026-09-28: 6 occurrences, 4 codes —
`scripts/ufo-sighting-lib/base.mjs:181` `UNEXPECTED_ERROR`,
`scripts/ufo-sighting-lib/base.mjs:586`/`:588` `EFBIG`,
`scripts/ufo-sighting-lib/launch-verb.mjs:98` `UNEXPECTED_ERROR`,
`scripts/ufo-sighting-lib/layout.mjs:440` `RECONCILE_UNATTESTED_STOP`,
`scripts/ufo-sighting-lib/pane-run.mjs:137` `SPAWN_FAILED`. The pattern is
`/\bcode:[^,\n]*"([A-Z][A-Z0-9_]*)"/gu` — deliberately wider than
`code: "X"`, because `base.mjs:181` and `launch-verb.mjs:98` assign the code in
a ternary (`code: known ? error.code : "UNEXPECTED_ERROR"`). The finding is
origin-tree reachability evidence, not a defect claim: those refusals are
reachable states outside the manifest's declared vocabulary.

Notes (always informational): `PIN_MATCH`, `DIGEST_ORDER`, `STATUS_SHAPE_DERIVED`
(the status contract was derived from the source rather than the frozen list),
`STATUS_KEYS_DERIVED`, `CHECKLIST_ITEM`.

## Checklist mode

`--checklists` parses this repo's `SKILL.md` GFM task items against the frozen
grammar — a line `- [ ]` + label + em dash + one backticked command + `→ exit
<n>[|<m>…]` + one backticked expected substring — runs each command with
cwd = repo root, checks exit ∈ set AND substring present, and prints
`CHECKLIST: n/m pass` then `VERDICT: PASS|FAIL`. An item whose command invokes
`--checklists` is reported `SKIP(self)`; the run is exit 0 iff every
non-skipped item passes.

## What it deliberately does NOT do

- **No wall mutation.** It never runs `launch`, `resume`, `steer`, `complete`,
  `remove`, `reconcile`, `respawn-terminal`, or `open`; the single sighting verb
  it invokes is `surface --json`, the one with no pane, no lock and no marker
  path (`scripts/ufo-sighting.mjs:88-95`).
- **No lock.** It never touches `<stateDir>/operation.lock` and never takes the
  dispatcher's queue lock; it reads through the surfaces' own lock-free paths
  (`scripts/fleet-dispatcher.mjs:14390`) plus direct `readFileSync` of the
  digest inputs.
- **No tmux.** No `tmux` binary is spawned: neither `surface --json` nor
  `status` shells tmux, and the probe adds none.
- **No wall state.** It does not read `.ufo/sighting/manifest.json`, run ids,
  panes or pids — mission state is `corpus/knowledge/sighting-wall.md`'s
  subject, not this instrument's.
- **It does not own the origin tree's pin.** On a genuine canonical-digest
  mismatch it reports `PIN_DRIFT` and stops; re-chartering `config/ufo.json` is
  the origin tree's obligation (`scripts/sync-ufo-contracts.mjs:949`,
  `ownerLane` `:948`). This repo has no write path into the origin tree, which
  is what makes the probe safe to run in any lane.
- **It does not re-verify prose.** Path/line/symbol/pin citations in `SKILL.md`
  + `corpus/**/*.md` are `scripts/cite-check.mjs`'s job; the surface probe
  measures the two surfaces, not the docs about them.
- **It does not measure coverage or depth.** Which scripts/crates are
  undocumented, and whether a note is deep enough, are the coverage axis's
  questions (see `corpus/README.md` "Known gaps") — out of scope here.