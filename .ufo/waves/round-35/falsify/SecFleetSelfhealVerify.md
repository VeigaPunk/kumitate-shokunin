ATTACK S8 `scripts/fleet-selfheal-verify.mjs` verdict=holds defects=0

Target: re-anchored census section `## `scripts/fleet-selfheal-verify.mjs`` in
corpus/knowledge/remaining-scripts-census.md (heading :586, body :588; population row :136).
Master body (master:550) vs round-35 body compared clause-by-clause; every anchor read at the
pin. No tool installs (RECORD: none). All reads read-only; no lane files edited.

## Anchor verification (all 6 anchors, every one read at 31c465f1)

Command per line: `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/fleet-selfheal-verify.mjs | sed -n 'Np'`

| census claim (body :588) | pin line | observed at 31c465f1 | verdict |
|---|---|---|---|
| `MAX_LEDGER_SEGMENTS` (:52) | 52 | `const MAX_LEDGER_SEGMENTS = 5;` | ok (master :50 → :52) |
| `check(` tri-state, pass/fail gate verdict (:243) | 243 | `function check(name, ok, detail = null) {` pushes pass/fail; `failed.length` gates `process.exit` :1048 | ok (master :246 was `}`-adjacent inside skip; now exact) |
| `skip(` records unrunnable check (:247) | 247 | `function skip(name, detail) {` pushes `status: "skip"` | ok (new anchor, previously unanchored) |
| scenario `capture_planted_events` by name | 613 | `check("capture_planted_events", captured.length === 2, ...)` | ok |
| 37 `check(` sites, 10 `skip(` sites | file | `grep -o 'check("' | wc -l` = 37; `grep -o 'skip("' | wc -l` = 10 | ok (exact) |
| usage `node scripts/fleet-selfheal-verify.mjs [--report path] [--fixtures-dir path]` (:83; help :85) | 83/85 | :83 `if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {`; :85 usage string matches the census quote byte-for-byte | ok (master :81 → :83/:85) |
| exit 0 clean / 1 named failing assertions (:1048) | 1047-1048 | :1047 prints `failing: <names>`; :1048 `process.exit(failed.length === 0 ? 0 : 1);` | ok (master anchor :2092 was beyond EOF at 964f443e too, 1103 L — round-35 fixed a latent bad cite) |
| 64 unknown argv token (:114) | 108-115 | unexpected-argument branch → `process.exit(64);` at :114 | ok (master :112 → :114) |
| `--fixtures-dir` strictly beneath allowed scratch root, never rmSync an operator path | 122-123,160-171,733 | `beneathRoot` = `startsWith(root + "/")` → root-equal paths rejected ("strictly" accurate); guard exits 2 (:171); sole `rmSync` is `rmSync(FIXTURES)` :733; SCRATCH_ROOTS = [tmpdir(), SCOPE_DIR] :160 | ok |

Population row :136 `| scripts/fleet-selfheal-verify.mjs | 1048 | tool |`: `git show 31c465f1:... | wc -l` = 1048. Exact. Heading :586 matches member path; member live in S8 (Arm-1 rerun 60/60, 0 diff).

## Remaining prose claims verified at pin

- read-only against `scripts/fleet-dispatcher.mjs`: only `readFileSync(DISPATCHER)` :59 + spawnSync :483; no write path reaches it.
- writes confined: all `writeFileSync`/`mkdirSync` targets are fixture case dirs under FIXTURES (:306, :422-469, :734-735) or REPORT_PATH (bounded :182-194, guarded write :1034-1043); PRESWAP_DIR (:46) is read-only (`readdirSync`/`copyFileSync` FROM it :664-667).
- mirror preflight exits 2 on drift: block :58-81 checks all three budgets (plus LIFECYCLE_SCHEMA, LEDGER_BASE) → `process.exit(2)`; census's "drift exits 2" holds.
- spawn fixture-root overrides, nothing live touched: env pins :490-497 (UFO_PROJECT_ROOT/UFO_STATE_DIR/UFO_FLEET_LEDGER_PATH + sighting stub).
- all six named scenarios present at pin: :613, :766, :782, :836, :924, :1005.

## Revision label and removed-clause trace

- Master body carried no dated revision label (full-prose section), so nothing was dropped; the new trailing label `re-anchored at 31c465f1 (round 35)` is present at :588. Row/heading show no stale `964f443e`-only count (1048 is the pin value).
- Removed clauses (all verified STILL TRUE at the pin — compression, not concealment of a false claim):
  1. env-var names `UFO_PROJECT_ROOT`/`UFO_STATE_DIR`/`UFO_FLEET_LEDGER_PATH` → generalized "fixture-root overrides". True at :490-494. Trace: FidFleetSelfhealVerify.md "Behavior claims" (env pins 31c465f1:490-494).
  2. "stub sighting wall emitting a controlled status JSON" → removed from note. True at pin: STUB_PATH :404-406, `writeStub()` :740, `UFO_SIGHTING_PATH: STUB_PATH` :496. Trace: FidFleetSelfhealVerify.md (writeStub :740, stub sources :404-460).
  3. five scenario names (`view_dedupe_count_exact`, `once_no_drift_event`, `preswap_event_count`, `rotation_no_event_loss`, `mirror_kept_matches_sibling_reader`) → "including `capture_planted_events`". All six still present (lines above). Trace: FidFleetSelfhealVerify.md lists all six with pin lines.
  4. exit-map clause "2 preflight/refusal" → dropped; load-bearing "drift exits 2" retained in the same paragraph; exit 2 verified at :68/:74/:79/:171/:192/:211/:224/:1041. Trace: FidFleetSelfhealVerify.md.
- In-note traces for these four removals are absent; wave-1 spec (ExecS8Fidelity.md: `clauses_removed=41` = "resolved by removing or replacing the stale claim/anchor") authorizes removal, and each trace lives in the member's Fid report. Not counted as defects.

## New false claims

None. Every line-number anchor, symbol, count, usage string, exit code, and write-scope claim in :588 reproduces at 31c465f1.

## Residual risk / gaps

- "(37 `check(` sites, 10 `skip(` sites)" lost master's "in the file" clarifier and now sits in apposition to `capture_planted_events`; counts are file-wide (verified), so a strict per-scenario reading would mislead. Cosmetic wording only; minimal fix: restore "in the file" after the parenthetical.
- LSP device unavailable (no `lsp` tool mounted); verification used pinned-clone `git show` line reads, which is ground truth for a fixed revision. Grep fallback explicitly recorded per role rule.
- Shallow clone (41 commits) — pre-964f443e history unobservable; irrelevant to pin claims.
