EXEC known done cases=8 selftest=50/50

# ExecSurfaceKnown — `--known FILE` (KNOWN v1) in scripts/surface-probe.mjs

## Diff summary
- File: `scripts/surface-probe.mjs` only (`git status --porcelain` in the scratch clone: `M scripts/surface-probe.mjs`; nothing else touched).
- `+340 / −39` (379 changed lines). Patch: `/fast/scratch/kumitate-r36/w/ExecSurfaceKnown.patch` (661 lines, `git apply --check --reverse` OK; applied cleanly to a pristine `0614092e` worktree and its selftest passed 50/50).
- Post-patch file sha256 `eec7af8750826544dee248d51cc4ac3536ba61ffe3d2e0ad53ce48abe8b1b584`; baseline `148cbf85ce4c7682a4ca4a663b730d28f4c41698100f7a0313f424c7b0ecb52e` (= the live `SCORECARD.md:302` `pin.surface-probe`). **The merge must re-pin `pin.surface-probe` to the merged file's hash** — sibling patches on this file also move it.
- Worktree: `/fast/scratch/kumitate-r36/w/ExecSurfaceKnown/lane`, branch `r36-execsurfaceknown` at `0614092e0804aaca06642cb3a263a05c1cacc98e`.

## Behavior implemented (KNOWN v1)
- `--known FILE` (`parseArgs:1735`), loaded + validated in `resolveKnown` (`:1752`) before any tree read; passed into `probeConformance({..., known})` (`:563`).
- `loadKnown` (`:332`) validates the whole file: exact contract token `kumitate-surface-known-v1` (`:184`), non-empty string `revision`, `findings` array, every entry exactly `{surface,kind,check,subject}` of strings, `kind` an emitted code (`Object.hasOwn(SEVERITY,…)` — prototype keys refused), duplicates refused. Any violation → `SURFACE_PROBE: FAIL-CLOSED (KNOWN_MALFORMED <file>: <detail>)` exit 2.
- Exact matching in `applyKnown` (`:385`) on `(surface, kind, check, subject)` (`knownKey:364`). `subject` = the entity a finding names; multi-entity findings carry `subjects` (verbs, error codes, digest paths, status keys; `findingSubjects:374`). A finding is excused only when **every** subject it names is listed; a partially-listed finding still gates.
- Matched findings print one unindented line `KNOWN <surface>/<check> <kind> <subject>` (`renderText:949`), leave the ERROR block and the error count; they stay in `findings` JSON with `known:true`/`knownSubjects`, and `totals.known` counts matches. Aggregates (`byKind`/`bySeverity`/`bySurface`) now cover gating findings only (invariant `bySeverity.error === totals.errors` preserved).
- A listed expectation that fires nothing becomes `KNOWN_STALE` (error, `:228`, `:637`) with the full expected quadruple in the message → DRIFT exit 1. Unlisted findings unchanged.
- Pin term: `readActivePin` (`:415`) accepts the pin as a resolved object (`{file,revision,…}`), a path string, `opts.pinRevision`, or the default `<self>/.ufo/pins/origin.json`; revision mismatch → `SURFACE_PROBE: FAIL-CLOSED (KNOWN_REV_MISMATCH <known> revision <a> != active pin <b> (<file>))` exit 2, checked before the `--src` stat. Absent/unparsable pin = no active pin (pin validity stays ExecSurfacePin's job).
- Verdict shape preserved: `SURFACE_PROBE: CLEAN|DRIFT (surfaces=… checks=… errors=… warnings=…[ known=<n>])`; ` known=` appears only when `--known` is active, so every existing grep is unaffected. Header documents the contract (script header:107-129) and `USAGE` lists the flag.
- `--known` without a value → exit 64 (verified).

## Retained evidence (commands run, in the scratch clone unless noted)
1. `node scripts/surface-probe.mjs --selftest` → `50/50 cases passed` / `VERDICT: PASS` (baseline was `42/42`); 22 finding codes observed (was 21 — `KNOWN_STALE` is the new one). New cases: match, stale, unlisted-subject, all-subjects-listed, malformed contract token, malformed entry (missing `subject`), rev mismatch, rev equal.
2. Pristine-baseline check: `git worktree add --detach … 0614092e` + `git apply /fast/scratch/kumitate-r36/w/ExecSurfaceKnown.patch` + selftest → `50/50`, `VERDICT: PASS`.
3. Live at the pin (`--src /fast/scratch/kumitate-r36/src`, pin root synthesised in scratch with `revision=31c465f1…`), no `--known` → `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=3 warnings=1)`, errors = `SCRIPT_DIGEST_MISMATCH`, `VERB_UNDECLARED [surface]`, `SURFACE_UNREACHABLE dispatcher` (the last two are other items' pre-integration state; baseline was "3 at the pin").
4. Same run with the pinned known file `{"contract":"kumitate-surface-known-v1","revision":"31c465f15669f744848bd9f5d56191c5085670f7","findings":[{"surface":"sighting","kind":"VERB_UNDECLARED","check":"VERB_DISPATCH","subject":"surface"}]}` →
   `KNOWN sighting/VERB_DISPATCH VERB_UNDECLARED surface`
   `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=2 warnings=1 known=1)` — the upstream defect is excused, the other two errors are untouched.
5. `--json` with the same inputs: `known.matched=[{surface:"sighting",check:"VERB_DISPATCH",kind:"VERB_UNDECLARED",subject:"surface"}]`, `totals.known=1`, `totals.errors=2`, `known:null` when the flag is absent.
6. Fail-closed arms: `--known /nonexistent/known.json` → `SURFACE_PROBE: FAIL-CLOSED (KNOWN_MALFORMED /nonexistent/known.json: unreadable (ENOENT))`, exit 2; `--known` bare → exit 64.

## Integration notes / handoff
- Sibling patches on the same file (`ExecSurfaceDigestOrder`, `ExecSurfaceDispatcherState`, `ExecSurfacePin`) touch disjoint regions; my `readActivePin` is deliberately shape-tolerant so it consumes ExecSurfacePin's `opts.pin` without imposing a naming contract. No `--pin` arm is added here (not my item).
- After integration the expected arm contribution is: `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1)` with the above known file — the digest-order and dispatcher-state items must land for `errors=0`. The `VERB_DISPATCH` check row stays `FAIL` (the surface *is* nonconformant); KNOWN excuses the finding, never the check — no gag.
- The known file itself is another item's artefact; any path works. Its `revision` must equal `.ufo/pins/origin.json`'s revision or every run is `KNOWN_REV_MISMATCH` exit 2 (intended ratchet).
- `corpus/knowledge/live-surface-probe.md` (scribe-owned) still documents only the old flags/verdict; the header is the authoritative doc for this wave. `proxy-check`'s `pin.surface-probe` re-pin is required at integration (see above).

## Risks
- `totals.byKind`/`bySeverity`/`bySurface` intentionally exclude excused findings; a consumer that assumed `byKind` counts every entry in `findings` would see a delta only on `--known` runs (no such consumer found: `grep -rn "byKind|bySeverity" scripts/ corpus/ SKILL.md` hits only surface-probe itself).
- Matching is subject-exact by design: a future second undeclared verb is a new error until listed — that is the claimed ratchet, not a defect.
- Operational disclosure: one exploratory invocation ran the module bare (default `--src` resolved to `/home/vgpnk/Projects/ufo-fsd-alpha`). It is a read-only verb path; `find . -path ./.git -prune -o -newermt '-15 minutes' -print` in that tree printed nothing, i.e. no file created/modified. All assigned runs after that passed `--src` explicitly.
- No blockers. No tool installs; no pacman transactions.
