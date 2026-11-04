# K83Sentinel — fail-closed & write-safety review (round 83, w1)

**Seat:** K83Sentinel (safety review, leaf) · **Date:** 2026-11-04 · **Host:** run-15 (linux, node v24.21.0)
**Targets:** `scripts/ready-handoff.mjs` (`kumitate-ready-handoff-v3`), `scripts/omp-census.mjs` (`kumitate-omp-census-v1`)
**Scratch (all repros, deleted after the report):** `/fast/scratch/hyaku/kumitate-r83/K83Sentinel/` — lane left read-only (initial vs final `git status --porcelain` byte-identical, 24 pre-existing dirty lines from other seats/orchestration).
**Tooling installs:** none required (node v24.21.0 present); no packages installed or upgraded this seat.

## Verdict

**SENTINEL: findings=2** (F-1 medium, F-2 low). No lane escape read/write was observed; every hostile input failed closed (exit 2) or was flagged DRIFT (exit 1) exactly as designed, except the one validation gap below. Both frozen counters HELD.

## Frozen counters (run, never edited)

- `node .ufo/waves/round-83/probe/probe83-c1.mjs --set c1 --lane <lane>` → **`C83_C1: HELD held=27/27`** (exit 0). Notable arms: `dispatch-outside` exit=2 `DISPATCH_OUTSIDE`; `agents-malformed` exit=2 `AGENTS_MALFORMED`; `report-dest-outside` exit=1 `REPORT_DEST_OUTSIDE`; `policy-role-unjudgeable` exit=1.
- `node .ufo/waves/round-83/probe/probe83-c2.mjs --set c2 --lane <lane>` → **`C83_C2: HELD held=16/16`** (exit 0). `compare-future-unbounded` exit=2 `SHAPE_CLOCK captured_at=2027-02-02T12:10:53Z age_days=-90`; `clock-one-predicate ok shape=2 compare=2`; `compare-missing-receipt` exit=2 `SHAPE_NOT_FOUND`.

## I/O surface enumeration

### ready-handoff.mjs
- **Reads:** `<ready>` (readFileSync, line 123); `lstatSync(readyPath)` (126); `realpathSync(lane)` + `realpathSync(readyPath)` (131); the dispatch JSON it names (`lstatSync` 147→151, `realpathSync(waveDir)`+`realpathSync(dispatchPath)` 152, `readFileSync` in `readJson`, again for `dispatchSha`); `--policy` via `readJson`; `--agents` via `readJson`.
- **Writes:** none on the judge path (self-declared "It reads; it never writes to the lane" — confirmed by marker checks, below). `--selftest` writes fixture lanes only under `mkdtemp(--work/'rh81-')` and keeps them when `--work` is passed (deletes them only when it falls back to `os.tmpdir()`).
- **Path resolution & symlink checks:** `inside()` (line 105) is lexical `relative()` containment with `..`/absolute rejection. Ready: non-regular `lstat` → `READY_UNSAFE`, then realpath containment in `realpath(lane)`. Dispatch: must be absolute (else `DISPATCH_PATH`), lexical `inside(waveDir)`, regular-file `lstat`, then realpath containment in `realpath(waveDir)`. Report destinations: resolved against `lane`, then **lexical-only** `inside(realpathSync(lane), dest)` (line 307) — no `lstat`/`realpath` of `dest` (see F-1).

### omp-census.mjs
- **Reads:** `--root` via `readdirSync` + `lstatSync(join(root, name))` (lines 150-161) — depth-1 shape only; the binding `--note`; the receipt JSON via `readShapeDoc`.
- **Writes:** exactly one output on `--snapshot` — `writeFileSync(file.uuid.tmp, {flag:'wx', mode:0o600})` then `renameSync(tmp, file)` (238-239), `rmSync(tmp)` in `finally`. `--selftest` writes fixtures under `mkdtemp(--work/'omp-census-selftest-')` and removes them at the end.
- **Path resolution & symlink checks:** receipt entry names are validated `[/\\\0]`-free, not `.`/`..`, sorted, exact keys, kind/mode typed (line 185) and are **never joined to a path** — compare matches them as map keys against `readdir` names; root-entry symlinks are `lstat`-classified (`KIND_OF`), never followed; a symlinked `--root` fails closed (`lstat(root).isDirectory()` false → `ENOTDIR`).

## Attacks (all repros in scratch; every command exact)

Legend: result = fail-closed (exit 2), flagged (exit 1), accepted (exit 0).

### ready-handoff
| # | attack | repro (abbreviated) | observed | expected | result |
|---|---|---|---|---|---|
| R1 | baseline judge | `--lane $S/r1/kumitate-shokunin --round 83 --wave w1 --policy $S/r1/policy.json` | `READY_HANDOFF: READY ... attack=3/10 ...`, exit 0; `find -newer .mark` → 0 entries | READY, no writes | ✅ |
| R2 | ready symlink → outside **valid JSON** | `ln -s $S/r2/outside/secret.json .../w1.ready` | `READY_HANDOFF: FAIL-CLOSED READY_UNSAFE (ready path is not a regular file (symlink))`, exit 2 | fail-closed | ✅ |
| R2b | ready symlink → outside **non-JSON** (ordering probe) | same, target `secret.txt` | `READY_UNSAFE`, exit 2 — content never parsed nor echoed (see F-2) | fail-closed, no disclosure | ✅ (note F-2) |
| R3 | `ready.dispatch` absolute outside waveDir | rewrite ready, `dispatch=$S/r3/outside/secret.json` | `FAIL-CLOSED DISPATCH_OUTSIDE`, exit 2 | fail-closed before any dispatch read | ✅ |
| R4 | `ready.dispatch` `../` lexical escape | `dispatch=.../round-83/../../escape.json` | `FAIL-CLOSED DISPATCH_OUTSIDE`, exit 2 | fail-closed | ✅ |
| R5 | dispatch through intermediate symlinked dir | `ln -s $S/r5/outside/d .../round-83/real`, dispatch `real/w1-dispatch.json` | `FAIL-CLOSED PATH_UNSAFE (dispatch realpath escapes ...)`, exit 2 | realpath containment | ✅ |
| R6 | dispatch final-component symlink | `ln -s $S/r6/outside/secret.json .../w1-dispatch.json` | `FAIL-CLOSED DISPATCH_ABSENT (not a regular file)`, exit 2 | fail-closed | ✅ |
| R7 | dispatch path is a directory | `mkdir .../w1-dispatch.json` | `FAIL-CLOSED DISPATCH_ABSENT`, exit 2 | fail-closed | ✅ |
| R8 | `--policy` is a directory | `--policy $S/r8/policydir` | `FAIL-CLOSED POLICY_ABSENT (cannot read ...)`, exit 2 | fail-closed | ✅ |
| R9a | agents registry malformed | `--agents $S/r9/agents-bad.json` | `FAIL-CLOSED AGENTS_MALFORMED`, exit 2 | fail-closed | ✅ |
| R9b | agents registry `{members:{}}` empty | `--agents $S/r9/agents-empty.json` | `FAIL-CLOSED AGENTS_MALFORMED`, exit 2 | fail-closed | ✅ |
| R9c | agents registry missing l1 | `--agents $S/r9/agents-nol1.json` | `DRIFT L1_UNRESOLVED`, exit 1 | flagged | ✅ |
| R9d | agents registry 200k members (~4 MB) | `--agents $S/r9/agents-huge.json` | parsed fine, `DRIFT L1_UNRESOLVED`, exit 1; no hang/OOM | accepted (valid shape) — size is unbounded (observation, not a defect for an operator-supplied file) | ✅ |
| R10 | report destination `../` lexical escape | task text `Report: ../escape.md` | `DRIFT ... REPORT_DEST_OUTSIDE`, exit 1 (also `TASK_LANE_ROOT` from my injected minimal text) | flagged, never written | ✅ |
| R11 | report destination **via planted lane symlink** | `ln -s $S/r11b/outside2 $S/r11b/kumitate-shokunin/planted-link`, task `Report: planted-link/evil.md` with lane-root-bearing text | **judge stays `READY`, exit 0** after planting; `realpath .../planted-link/evil.md` → `$S/r11b/outside2/evil.md` (outside lane); the lexical control `Report: ../outside2/evil-lexical.md` in the same fixture is refused `REPORT_DEST_OUTSIDE` exit 1 | dest containment honoured | ❌ **F-1** |
| R12 | `--ready` override outside lane | `--ready $S/r12/outside/secret.json` | `FAIL-CLOSED READY_UNSAFE (ready realpath escapes ...)`, exit 2 | fail-closed | ✅ |
| R13 | ready absent / malformed JSON | `rm w1.ready` / `printf '{' > w1.ready` | `READY_ABSENT` / `READY_MALFORMED`, exit 2 | fail-closed | ✅ |
| R14 | usage failures | no args; `--attack-pct 101`; `--bogus` | usage + exit 64 all three | exit 64 | ✅ |
| R15 | `--json` fail-closed shape | `--json` on R3-style fixture | one JSON object `{contract, verdict:"FAIL-CLOSED", token:"DISPATCH_OUTSIDE", detail}`, exit 2 | machine-readable refusal | ✅ |
| R16 | `--selftest` confinement | `--selftest --work $S/rhself` | `READY_HANDOFF_SELFTEST: 68/68 pass`, `VERDICT: PASS`, exit 0; top-level diff adds only `rhself`; all fixture dirs under `rhself/rh81-*/` | writes only under `--work` | ✅ |

### omp-census
| # | attack | repro | observed | expected | result |
|---|---|---|---|---|---|
| C0 | baseline census on fixture root | `--root $S/c0/croot` | `OMP_CENSUS: CLEAN (entries=6 findings=0 bound=35/35)`, exit 0; 0 writes | CLEAN | ✅ |
| C1 | receipt entry names `../agent.db`, `/etc/passwd`, real NUL (`610062`), `.`, `..`, `a\b` | `--shape $S/c1c/r-nul.json` etc. | `SHAPE_INVALID`, exit 2 on every name, on both `--shape` and `--compare` | refused before any root access | ✅ |
| C2 | receipt schema violations: unsorted, extra doc key, kind `fifo`, mode 4096, empty entries, missing mode | `--shape $S/c2/r-*.json` | `SHAPE_INVALID`, exit 2 (all 6) | refused | ✅ |
| C3 | future clock on **every** path | `--compare future.json` (no `--max-age`), with `--max-age 30`, `--shape future.json`, `--compare far.json` (9999) | `OMP_SHAPE_COMPARE: SHAPE_CLOCK captured_at=... age_days=-2`, exit 2; bounded call also `SHAPE_CLOCK` (clock precedes stale); `--shape` → `SHAPE_CLOCK`, exit 2; far → `age_days=-2912136` exit 2 | one predicate on every call | ✅ |
| C4 | backdated 45 d + legacy v1 | `--compare back.json` / `--max-age 30` / `60`; `--shape back.json [--max-age 30]`; `--compare legacy.json` / `--max-age 1`; `--shape legacy.json` | `IN_SYNC ... age_days=45` (0); `SHAPE_STALE_RECEIPT` exit 1; `IN_SYNC` (0); `--shape` CLEAN with `age_days=45`, `--max-age 30` → `SHAPE_STALE` exit 1; v1 compare `captured=absent age_days=absent` (0), bounded → `SHAPE_AGE_UNKNOWN` exit 2; v1 shape → `SHAPE_VERSION` exit 2 | as designed | ✅ |
| C5 | `--snapshot` over a symlinked output path | target file holds `SECRET-MARKER`; `receipt-link.json` symlinked to it | `OMP_SNAPSHOT: WROTE entries=6 sha256=...`, exit 0; `TARGET-AFTER: SECRET-MARKER` (untouched); link replaced by **regular file mode 600**; 0 `*.tmp` left | atomic, no write through the link | ✅ |
| C6 | snapshot into missing directory | `--snapshot $S/c6/no/such/dir/r.json` | `OMP_SNAPSHOT: ERROR reason=ENOENT`, exit 2; 0 `*.tmp` | fail-closed, no debris | ✅ |
| C7 | `--root` is a symlink | `--root $S/c7/croot-link` (census / compare / snapshot) | `OMP_CENSUS: ERROR ... reason=ENOTDIR` 2; `ROOT_NOT_A_DIR` 2; `OMP_SNAPSHOT: ERROR reason=ENOTDIR` 2 | fail-closed | ✅ |
| C8 | live entry is a symlink → `/etc/passwd`; compare content-blindness | replace `croot/agent.db` with symlink; snapshot→compare; then restore real file containing `CONTENT-MARKER-XYZ` | census: `KIND agent.db want=file got=symlink`, exit 1 (never followed); snapshot made while symlinked compares `IN_SYNC` (shape matches); receipt captured before the content write compares `IN_SYNC`, exit 0 — marker appears nowhere in output | drift, never follow; content never read | ✅ |
| C9 | missing / invalid receipt | `--compare absent.json` / `bad.json` (`{`) | `SHAPE_NOT_FOUND` / `SHAPE_INVALID`, exit 2 | fail-closed | ✅ |
| C10 | `--selftest` confinement | `--selftest --work $S/ocself` | `VERDICT: PASS (108 cases)`, exit 0; top-level diff adds only `ocself`; `ocself` is empty afterwards (selftest removed its own fixture tree) | writes only under `--work` | ✅ |
| C11 | usage failures | `--nonsense`; `--compare x.json --self $S/c11` | exit 64 both | exit 64 | ✅ |
| C12 | live census on the real agent root (read-only end-to-end) | `node omp-census.mjs` (default root `$HOME/.omp/agent`) | `OMP_CENSUS: CLEAN (entries=65 findings=0 bound=35/35)`, exit 0; 0 writes in watch dir | read-only | ✅ |

## Findings

**F-1 (medium) — `ready-handoff.mjs`: accepted `Report:` destination escapes the lane through a lane-internal symlink.**
- Class: path resolution / symlink-check incompleteness (the tool realpath-checks the ready file and the dispatch, but the seat report destination is checked lexically only, line 307).
- Repro (scratch): `mkdir $S/r11b/outside2 && ln -s $S/r11b/outside2 $S/r11b/kumitate-shokunin/planted-link`, then set seat K83T01's task text to `/skill:godspeed\n# Target\n<laneRoot>/corpus/x.md\nReport: planted-link/evil.md` and run `node scripts/ready-handoff.mjs --lane $S/r11b/kumitate-shokunin --round 83 --wave w1 --policy $S/r11b/policy.json`.
- Observed: `READY_HANDOFF: READY ...`, exit 0 both before planting and after; `realpath $S/r11b/kumitate-shokunin/planted-link/evil.md` prints `$S/r11b/outside2/evil.md` — outside the lane. The equivalent lexical escape `Report: ../outside2/evil-lexical.md` is refused `REPORT_DEST_OUTSIDE` exit 1 in the same fixture.
- Expected: `REPORT_DEST_OUTSIDE` (or realpath-based containment) for any destination whose real write target leaves the lane.
- Impact: admission can green-light a handoff whose seat report path resolves outside the lane whenever a symlink exists (or is planted by any lane-writing actor, e.g. a prior wave's seat) inside the lane at the named relative prefix. The validator itself never writes (verified), so this is a validation-evidence gap, not a direct write.
- Smallest remediation: resolve the destination against `realpathSync(lane)` (or `lstat`/`realpath` the destination's nearest existing ancestor) before `inside()`, mirroring the dispatch check.

**F-2 (low) — `ready-handoff.mjs`: ready bytes are read before the symlink/realpath refusal.**
- Class: fail-closed ordering. `readFileSync(readyPath)` (line 123) runs before the `lstatSync` regular-file check (126) and the `realpathSync` containment check (131).
- Repro: `ln -s $S/r2b/outside/secret.txt $S/r2b/kumitate-shokunin/.ufo/waves/round-83/w1.ready` (target non-JSON), run the judge.
- Observed: `READY_HANDOFF: FAIL-CLOSED READY_UNSAFE ...`, exit 2. Because a *non-JSON* outside target still yields `READY_UNSAFE` (not `READY_MALFORMED`), the content is demonstrably read but never parsed, echoed, or written — refusal is unconditional and nothing leaks beyond the path string in the error.
- Expected: cheapest hardening is `lstat`+`realpath` before the read; behavior is already fail-closed, so this is defense-in-depth.

## Write-safety verification

- Judge path (R1/R2/R3/R11, C0, C12): `find <dir> -newer .mark` immediately after each run → **0 entries** in every case; the tools never write outside their explicit outputs.
- `--selftest`: ready-handoff added only `$S/rhself` (fixtures intentionally kept when `--work` is given, line 779 of the tool); omp-census added only `$S/ocself` and removed its own fixture tree. No `/tmp` use when `--work` is passed.
- `--snapshot` (C5/C6): single atomic `tmp`+`rename`, mode `0o600`, `finally` cleanup — 0 stray `*.tmp`; a symlinked output path is replaced, never written through.
- Lane repo untouched: initial vs final `git -C <lane> status --porcelain` identical (24 pre-existing lines from other seats/orchestration; none introduced by this seat).

## What I could not verify

- **TOCTOU** between the `realpath`/`lstat` checks and the subsequent `readFileSync` of ready/dispatch: window is microseconds, the validator runs as a single local process, and no concurrent-mutator repro was attempted. Listed for completeness, not a finding.
- **Unbounded input size** on operator-supplied files (`--policy`, `--agents`, `--note`, receipts): no size cap by design; a 200k-member registry parsed without strain (R9d). Memory-only DoS surface, all exits remain fail-closed.
- The frozen probes use `os.tmpdir()` for their own fixtures (`/tmp/c83c1-*`); that is the probes' frozen behavior, outside my write-scope review of the two tools.

## Conclusion

Both tools fail closed on every hostile input tested (exit 2 with precise tokens, or DRIFT exit 1 with named findings), never follow symlinks into or out of their roots, never read member/receipt content (census is shape-only), and write only their explicit outputs under `--work`. C2's clock predicate is a single `clockRefusal` exercised on every `--shape`/`--compare` call, confirmed independently of the frozen counter. The one real gap is F-1 (report-destination symlink acceptance); F-2 is hardening.
