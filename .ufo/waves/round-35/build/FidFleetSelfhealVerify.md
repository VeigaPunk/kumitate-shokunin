FIDELITY scripts/fleet-selfheal-verify.mjs anchors=6 ok=1 moved=4 changed=0 gone=1

# Fidelity re-verification — `scripts/fleet-selfheal-verify.mjs` (C2 anchor fidelity)

Scope: anchors in `corpus/knowledge/remaining-scripts-census.md` that cite this member
(one full-path anchor, four bare continuation anchors in its `## ` section at line 550,
one member-section heading at line 548). Read-only; notes not edited.
Base 964f443e: 1103 lines. Pinned 31c465f1: 1048 lines (diff +21/-76, net -55).

## Non-ok anchors

note:line | cited anchor | symbol/claim | status moved|changed|gone | correct anchor at 31c465f1 (file:line) | proposed replacement wording (<=30 words, keep the original revision label and add 're-anchored at 31c465f1')
--- | --- | --- | --- | --- | ---
remaining-scripts-census.md:550 | `scripts/fleet-selfheal-verify.mjs:50` | `MAX_LEDGER_SEGMENTS` (mirror-vs-SUT budget) | moved | `scripts/fleet-selfheal-verify.mjs:52` | `MAX_LEDGER_SEGMENTS` (`scripts/fleet-selfheal-verify.mjs:52`; 964f443e anchor :50 re-anchored at 31c465f1).
remaining-scripts-census.md:550 | `:246` | `check(` tri-state predicate; `skip(` records an unrunnable check | moved | `:243` (`check(`) / `:247` (`skip(`); cited line at 31c is `}` closing `check(` | Tri-state via `check(` (`:243`) and `skip(` (`:247`); 964f443e anchor :246 re-anchored at 31c465f1.
remaining-scripts-census.md:550 | `:81` | usage help echo (exit 0) | moved | `:83` (guard); usage string at `:85` | Usage help echo (`:83`; 964f443e anchor :81 re-anchored at 31c465f1).
remaining-scripts-census.md:550 | `:2092` | exit map 0 clean | gone | `:1048` (`process.exit(failed.length === 0 ? 0 : 1)`) | Exit map 0 clean at `:1048` (964f443e anchor :2092 was beyond EOF; re-anchored at 31c465f1).
remaining-scripts-census.md:550 | `:112` | 64 unknown argv token | moved | `:114` (`process.exit(64)`) | Unknown argv token exits 64 (`:114`; 964f443e anchor :112 re-anchored at 31c465f1).

## Ok anchor

- `remaining-scripts-census.md:548` — heading `## \`scripts/fleet-selfheal-verify.mjs\``: member still present at 31c465f1 with the same path; heading valid as-is.

## Anchor evidence (exact lines read)

Commands:
`git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/fleet-selfheal-verify.mjs | sed -n '<N>p'`

- 964f443e:50 `const MAX_LEDGER_SEGMENTS = 5;` → 31c465f1:50 ` stale-green the coverage checks.` ; 31c465f1:52 `const MAX_LEDGER_SEGMENTS = 5;`
- 964f443e:81 `if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {` → 31c465f1:81 blank; 31c465f1:83 same guard, `:85` usage string.
- 964f443e:112 `    process.exit(64);` → 31c465f1:112 `    && args[i - 1] !== "--report") {`; 31c465f1:114 `    process.exit(64);`
- 964f443e:246 `  checks.push({ name, status: "skip", detail });` (inside `skip(`, defined :245; `check(` :241) → 31c465f1:246 `}`; `check(` 31c465f1:243, `skip(` 31c465f1:247.
- 964f443e:2092 does not exist (file is 1103 lines; the exit map is the final `:1103`) → 31c465f1:2092 does not exist (file 1048; exit map `:1048`).
- 964f443e:1103 / 31c465f1:1048 `process.exit(failed.length === 0 ? 0 : 1);`

## Behavior claims still true at 31c465f1 (verified)

- Mirror-vs-SUT preflight: 31c465f1:58-81 re-reads `DISPATCHER`, regex-checks `MAX_LEDGER_BYTES`/`MAX_LEDGER_SEGMENTS`/`MAX_LEDGER_READ_BYTES` (and now `LIFECYCLE_SCHEMA`, `LEDGER_BASE`) and exits 2 on drift (`:68`,`:74`,`:79`); note's claim holds (now broader).
- Read-only against dispatcher + writes confined: every spawn carries `UFO_PROJECT_ROOT`/`UFO_STATE_DIR`/`UFO_FLEET_LEDGER_PATH` overrides (31c465f1:490-494); stub sighting wall still written (`writeStub()` 31c465f1:740, stub sources :404-460); `--fixtures-dir` still must sit beneath `SCRATCH_ROOTS` (31c465f1:160-181, exit 2 at :171); `--report` same bound (:182-194). Note's write-scope claim holds.
- Named scenarios all still present at 31c465f1: `capture_planted_events` :613, `view_dedupe_count_exact` :766, `once_no_drift_event` :782, `preswap_event_count` :836, `rotation_no_event_loss` :924, `mirror_kept_matches_sibling_reader` :1005.
- Counts unchanged: 37 `check("` sites and 10 `skip("` sites in both revisions (note's 37/10 exact at 31c465f1).

## Behavior the diff changed (flag — no note anchor claims it, so changed=0)

- `sibling_state_reported` check (964f443e:751-755, `run.json.ledgerModules|modules|ledger_*_module_* telemetry`) is replaced at 31c465f1:748-751 by `sibling_reader_reported` asserting `run.json?.ledger?.reader === "sibling"` — the optional-probe seam is gone because both ledger modules are now static imports (31c465f1:40-41).
- The "sibling wiring diagnostics (informational, never a check)" block (964f443e:938-1047) is rewritten (31c465f1:934-993): probes now call the imported `loadLedgerWindow`/`rotateLedgerFile` with the dispatcher's positional shape (`maxBytes`), `dryRun: true` in both rotate probes, and `resolved` hardcoded `true`; note text does not describe these probes, so nothing to reword beyond the anchors above.

## Extra census fact (not an anchor; affects the member row, not the tally)

- `remaining-scripts-census.md:113` member row says `| \`scripts/fleet-selfheal-verify.mjs\` | 1103 | tool |`; at 31c465f1 the file is 1048 lines (still `.mjs`, mode 100755, kind tool). The `1103` count is stale for the pinned revision; identity (member present, path unchanged) holds.

## Commands run (all read-only)

- `grep -n "fleet-selfheal-verify" .../remaining-scripts-census.md` → hits at :113, :548, :550.
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/fleet-selfheal-verify.mjs` → +21/-76 (imports :37+, status check rewrite :743-755, diagnostics rewrite :935-1047, `rotFn` positional-shape updates).
- `git show <rev>:scripts/fleet-selfheal-verify.mjs | wc -l` → 964f443e 1103; 31c465f1 1048.
- `git show <rev>:... | sed -n 'Np'` for 50, 81, 112, 241/243, 245/247, 1103/1048; `grep -c 'check("'`/`skip("` → 37/10 both revisions.
- `git rev-parse --is-shallow-repository` → `true` (clone has 41 commits; pre-964f443e history unavailable, so the origin of the invalid :2092 anchor cannot be traced — [INFERENCE] it was carried from an older, larger revision).

## Unknowns

- Why the note cites `:2092` cannot be established: the clone is shallow and the file is 1103 lines at the pinned base, so the anchor was invalid at 964f443e too. [INFERENCE] transcription from a pre-2026-10-14 revision.
- No tool installs/upgrades performed; no production files, notes, git/jj state or host state touched.
