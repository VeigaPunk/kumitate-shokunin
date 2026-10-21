KNOWN-SET findings=6 known-eligible=1 lane-defects=2

# ScoutKnownFindings — surface-probe findings at the pin

Scope: conformance mode (`scripts/surface-probe.mjs`, `kumitate-surface-probe-v1`) at upstream
`31c465f15669f744848bd9f5d56191c5085670f7`. `--checklists` reads the lane's SKILL.md (not the pin) and
`--selftest` is hermetic, so neither contributes pin findings.

Authoritative run: `.ufo/waves/round-36/baseline/surface-pin.txt` (errors=3 warnings=1 notes=2,
byKind 6 × 1). I did **not** re-run the probe against the pin: its dispatcher leg attempts a write
into that tree, and the tree is `dr-xr-xr-x` (also true today: `.ufo` absent, `git status` clean).
Every input was instead recomputed read-only (digest, verb diff, manifest dump, startup path).

## Findings produced at the pin (6)

`subject` is the KNOWN v1 discriminator. The base probe has **no** `subject` field
(`grep -n subject scripts/surface-probe.mjs` → no match); `note()` at
`scripts/surface-probe.mjs:423` pushes `{severity,kind,surface,check,message,detail}`. Only the
VERB_UNDECLARED value is contract-fixed; the others below are the observed discriminator a matcher
would have to key on ([INFERENCE] until ExecSurfaceKnown defines the field).

| # | sev | surface | kind | check | subject | message (exact) | cause | disposition |
|---|-----|---------|------|-------|---------|-----------------|-------|-------------|
| 1 | error | sighting | SCRIPT_DIGEST_MISMATCH | DIGEST_CONCAT | `sha256:f17d1547901ad6ebb50ab7f705e9d50770b4ab19ddcdc8927a97958d74068da9` (detail.computed) [INFERENCE] | concatenated-byte digest sha256:f17d15… != manifest.scriptDigest "sha256:b36559…" | **lane probe** (concat order; `surface-probe.mjs:593`, bytes built at `:290-298`) | fix probe move (a); never KNOWN |
| 2 | error | sighting | VERB_UNDECLARED | VERB_DISPATCH | `surface` (contract-fixed) | dispatched in scripts/ufo-sighting.mjs but undeclared in the manifest: surface | **upstream bytes** | the one KNOWN tuple |
| 3 | warn | sighting | ERROR_CODE_OFF_MANIFEST | ERROR_CODES | `RECONCILE_UNATTESTED_STOP,SPAWN_FAILED,UNEXPECTED_ERROR` (detail.distinct, sorted) [INFERENCE] | assigned to a code: field as a literal but absent from manifest.errors …: scripts/ufo-sighting.mjs:2010:RECONCILE_UNATTESTED_STOP, scripts/ufo-sighting.mjs:2468:UNEXPECTED_ERROR, scripts/ufo-sighting.mjs:4420:SPAWN_FAILED, scripts/ufo-sighting-lib/base.mjs:131:UNEXPECTED_ERROR | **upstream bytes** (manifest generator scans `fail()` only) | non-gating warn (`surface-probe.mjs:215,492,669`); leave unlisted |
| 4 | error | dispatcher | SURFACE_UNREACHABLE | STATUS_REACH | `status exited 1` (detail) [INFERENCE] | status exited 1 | **lane probe** (spawn without state-dir env; `surface-probe.mjs:402-417`, note `:478`) | fix probe move (b); never KNOWN |
| 5 | note | sighting | DIGEST_ORDER | DIGEST_INPUT_SET | — (note carries no detail; fixed message) | digestInputs set matches disk but the order is not shim → module → sorted lib/*.mjs | upstream declaration order, correctly reported (`surface-probe.mjs:559`) | diagnostic; keep; never KNOWN |
| 6 | note | sighting | PIN_MATCH | PIN_DIGEST | `sha256:1064c19addf69f294fd46ebbaa3a99298a4fe60eb5241fcb0d1406f1c0ba6bb4` [INFERENCE: config/ufo.json:55 == canonical digest, so PIN_MATCH must have compared this] | config/ufo.json sighting.surfaceDigest matches sha256(canonicalJson(manifest)) … | upstream contract satisfied (`surface-probe.mjs:697`) | diagnostic; keep; never KNOWN |

Checks failing **without** a finding at the pin (consequence of #4, `probeConformance` sets both
slots false with `surface unreachable`): `dispatcher/STATUS_SHAPE`, `dispatcher/STATUS_QUEUE_SCHEMA`.
The `STATUS_KEYS_DERIVED` note is also absent only because `checkStatus` never runs; it is not a defect.

Post-fix expected set at the same revision [INFERENCE from `surface-default.txt`, same rev
`31c465f1`, writable tree]: remove #1 (move a) and #4 (move b) → 1 error (#2, matched KNOWN), 1 warn
(#3), 3 notes (#5, #6, STATUS_KEYS_DERIVED) → `SURFACE_PROBE: CLEAN (known=1 …)`. Matches the target.

## Verdict on eligibility

- **Declare:** exactly `{surface:"sighting", kind:"VERB_UNDECLARED", check:"VERB_DISPATCH",
  subject:"surface"}` → prints `KNOWN sighting/VERB_DISPATCH VERB_UNDECLARED surface`; upstream-owned
  and revision-bound (it can only stop firing when upstream bytes change the manifest or the arm).
- **Upstream-owned but not declared:** `ERROR_CODE_OFF_MANIFEST` (warning, `NON_GATING_WARNS`; the
  probe's own comment calls it "an origin-owned disclosure this province reports but never repairs").
  Listing it would make `known=2` and contradict the frozen "only expected finding" set.
- **Must be fixed in the lane probe, never declared:** `SCRIPT_DIGEST_MISMATCH` (probe order bug;
  declaring it would mask a false red) and `SURFACE_UNREACHABLE` (declaring it would whitelist the
  exact write-into-the-scored-tree behaviour C1 move (b) removes). `DIGEST_ORDER` and `PIN_MATCH`
  are correct diagnostics, not defects, and are not KNOWN material.

## Upstream evidence for #2 (surface dispatched, undeclared)

Dispatch arm, `/fast/scratch/kumitate-r36/src/scripts/ufo-sighting.mjs`:

```
4484:  if (command === "surface") {
4485:    const { options, command: unexpected } = parseNamedOptions(rest, { booleans: ["json"] });
4486:    if (unexpected.length > 0) fail("INVALID_ARGUMENT", "surface takes no command");
4487:    rejectUnknownOptions(options, ["json"], "surface");
4488:    // The declared verb is `surface --json`; accepting a bare `surface` would
4489:    // make the documented flag a lie inside the surface's own manifest.
4490:    if (options.json !== true) fail("INVALID_ARGUMENT", "surface requires --json");
4491:    output(surfaceManifest());
4492:    return;
```

Manifest, `/fast/scratch/kumitate-r36/src/scripts/ufo-sighting-lib/surface.mjs`:
`verbs: {` at 74 (keys 75 open, 79 launch, 97 complete, 117 remove, 122 steer, 151 peek, 165 status,
166 overview, 170 reconcile, 171 `"respawn-terminal"`, 172 inquiry, 181 resume; block closes 202);
`extras: [` at 203 (205 register, 220 twin, 238 help; closes 245). **No `surface` key in either.**
Upstream itself treats it as a verb: usage line 265 `"       ufo-sighting surface --json"` and
`VERB_USAGE_INDEX` 283-289 with `surface: 1` at 285.

Read-only manifest dump (`node --input-type=module -e 'import {surfaceManifest} …'` in the clone):
`verbs=open,launch,complete,remove,steer,peek,status,overview,reconcile,respawn-terminal,inquiry,resume`;
`extras=register,twin,help`. Independent probe-regex replay over the two files:
`undeclared: surface`, `undispatched: (none)`, `declared: complete,help,inquiry,launch,open,overview,
peek,reconcile,register,remove,respawn-terminal,resume,status,steer,twin`. This is an upstream
vocabulary gap in the generated manifest — the only upstream-owned gating defect at the pin.

## Upstream evidence for #1 being a lane defect (not upstream)

`surface.mjs:13-18` declares `SURFACE_MODULE_PATHS = [base.mjs, argv.mjs, observe.mjs, surface.mjs]`
— **not** sorted (`argv` < `base`); `:36` builds inputs as `[SHIM_PATH, MODULE_PATH, ...that order]`.
The probe instead sorts libs (`surface-probe.mjs:290-298`, `.sort()` at 298) → argv before base.
Recomputed in the clone: declared-order concat = `sha256:b36559d027c8…` **== manifest.scriptDigest**;
sorted-order concat = `sha256:f17d1547901a…` **== the probe's detail.computed**. The manifest is
self-consistent; the false mismatch is entirely the probe's concatenation order.

## Upstream mechanism behind #4 (fix belongs in the lane probe)

`fleet-dispatcher.mjs:42` `UFO_STATE = resolve(process.env.UFO_STATE_DIR || join(ROOT, ".ufo"))`;
`:90` `LEDGER_PATH = UFO_FLEET_LEDGER_PATH || join(UFO_STATE, "fleet-ledger.jsonl")`;
`:8949` `assertLedgerPath()` runs in `main()` **for every verb**, and `:462`
`mkdirSync(dirname(LEDGER_PATH), { recursive: true, mode: 0o700 })` → EACCES on the pin tree
(`dr-xr-xr-x`, no `.ufo`). `status` is documented "Lock-free read" at `:9024` but still pays that
startup mkdir. `surface-probe.mjs:405` spawns `node <src>/scripts/fleet-dispatcher.mjs status` with
`cwd: src` and no `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH`/`UFO_PROJECT_ROOT` → the gate writes into
the tree it scores. The upstream knobs the fix must set exist at `:42` (`UFO_STATE_DIR`), `:41`
(`UFO_PROJECT_ROOT`), `:3370`/`:8953` (`UFO_PENDING_WORK_PATH`, which `fleet-dispatcher.mjs:4013` requires to stay under
`UFO_STATE` — the contract's `<mkdtemp>/ufo/pending-work.json` satisfies this). So move (b) is
correct and sufficient; the dispatcher's own read-only status is not the declared defect.

## Upstream evidence for #3 (warn only)

Sites confirmed at `ufo-sighting.mjs:2010` `code: "RECONCILE_UNATTESTED_STOP"`, `:2468`
`code: … : "UNEXPECTED_ERROR"`, `:4420` `{ code: "SPAWN_FAILED" … }`, `base.mjs:131`
`code: known ? error.code : "UNEXPECTED_ERROR"` — all assigned via `code:` literals, invisible to
`surfaceErrors()` (`surface.mjs:50-57`, `fail("X")` only). Non-gating by construction
(`surface-probe.mjs:215`, counted out at `:492`), so it never affects CLEAN and needs no KNOWN entry.

## KNOWN file literal (for `.ufo/pins/surface-known.json`)

```json
{"contract":"kumitate-surface-known-v1","revision":"31c465f15669f744848bd9f5d56191c5085670f7",
 "findings":[{"surface":"sighting","kind":"VERB_UNDECLARED","check":"VERB_DISPATCH","subject":"surface"}]}
```

This yields known=1; any extra tuple would need a second upstream-owned gating finding, and there is
none at this revision.

## Remaining unknowns

- Subject strings for #1/#3/#4/#6 are inferred discriminators, not contract text; only #2 is frozen.
  ExecSurfaceKnown must add an explicit `subject` at each note site (message text would not match
  `subject:"surface"` for #2).
- The post-fix dispatcher pass at the pin was not executed (read-only seat + it is the write the arm
  is fixing); expected pass is inferred from `surface-default.txt` at the same revision.
- No tooling installed. No writes outside this report.
