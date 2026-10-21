FIDELITY scripts/prepare-ephemeral-l1.mjs anchors=13 ok=1 moved=6 changed=4 gone=2

# C2 anchor fidelity — `scripts/prepare-ephemeral-l1.mjs` @ 31c465f1

Source: private clone `/fast/scratch/kumitate-r35/src` (HEAD detached 31c465f1…, base
964f443e…). Notes read: `corpus/knowledge/remaining-scripts-census.md`. Read-only; no note edits.

## Scope / anchor census
Every reference to this member in the notes: heading `:619`, table row `:126`, prose paragraph `:621`.
No `:N-M` range anchors exist for this member. The paragraph holds 12 single-line anchors
(11 full `file:N` + 1 continuation `:1435`). Anchor total = 12 + member heading = 13.
`:374` is the round-32 removal list for `scripts/prepare-ephemeral-l1.test.mjs` (different
member; genuinely absent at 31c465f1 — `git cat-file -e` fatal) — correct, not counted.
Census row `:126` (`| scripts/prepare-ephemeral-l1.mjs | 962 | tool |`) also checks out: 962
lines at both revisions, CLI `main` present; not counted as an anchor.

## Diff 964f443e..31c465f1
One hunk, `@@ -191,12 +191,12 @@`, +2/-2, zero line shift:
`git()` at `:194` gained `env = scrubbedGitEnvironment()` (default) and `:199` now passes `env`
instead of `env: scrubbedGitEnvironment()`.
`[INFERENCE]` No caller passes `env` at 31c465f1 (call sites :228, :563-:603, :617-:655 use only
`allowStatus`/`encoding`/`input`), so the scrubbed-environment behavior and every line number are
unchanged by the advance.

**Key finding:** every non-ok anchor was already wrong at 964f443e, the note's own declared
measurement revision. Line 912 is `main` at both revisions; 1226/1377/1433/1435 are past the
962-line EOF at both; `SECURE_WRITE_OPTIONS`, `PrepareError`, `destroy_target_not_child` and
`cli_usage` exist nowhere in the tree at either revision (`git grep -lE ...` empty at both).
This is a pre-existing note defect, not a delta artifact of 964f443e→31c465f1.

## Per-anchor rows (non-ok only; all rows are note:621)
note:621 | `scripts/prepare-ephemeral-l1.mjs:912` | `createEphemeralL1` library entry point | moved | `scripts/prepare-ephemeral-l1.mjs:659` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) `createEphemeralL1` is at `scripts/prepare-ephemeral-l1.mjs:659`; `:912` is `main`."
note:621 | `scripts/prepare-ephemeral-l1.mjs:1226` | `destroyEphemeralL1` library entry point | moved | `scripts/prepare-ephemeral-l1.mjs:814` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) `destroyEphemeralL1` is at `scripts/prepare-ephemeral-l1.mjs:814`; 1226 is past the 962-line EOF."
note:621 | `scripts/prepare-ephemeral-l1.mjs:1377` | `fail("cli_usage", usage)`; unknown verb refused with typed code | changed | `scripts/prepare-ephemeral-l1.mjs:917` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) an unknown verb throws `new Error("usage: prepare-ephemeral-l1.mjs …")` at `scripts/prepare-ephemeral-l1.mjs:917`; there is no `fail` or `cli_usage` code."
note:621 | `scripts/prepare-ephemeral-l1.mjs:28` | `ROOT`; mission dir "derived from `ROOT`" | changed | `scripts/prepare-ephemeral-l1.mjs:29` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) `ROOT` is at `scripts/prepare-ephemeral-l1.mjs:29`; the mission directory comes from `policy.root`, not `ROOT`."
note:621 | `scripts/prepare-ephemeral-l1.mjs:60` | `SECURE_WRITE_OPTIONS` create-once marker write | changed | `scripts/prepare-ephemeral-l1.mjs:736` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) no `SECURE_WRITE_OPTIONS` constant exists; the marker is written create-once at `scripts/prepare-ephemeral-l1.mjs:736` with `O_EXCL|O_NOFOLLOW`, mode 0o600."
note:621 | `scripts/prepare-ephemeral-l1.mjs:133` | `readPolicy` | moved | `scripts/prepare-ephemeral-l1.mjs:92` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) `readPolicy` is at `scripts/prepare-ephemeral-l1.mjs:92`."
note:621 | `scripts/prepare-ephemeral-l1.mjs:29` | `POLICY_PATH` | moved | `scripts/prepare-ephemeral-l1.mjs:30` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) `POLICY_PATH` is at `scripts/prepare-ephemeral-l1.mjs:30`."
note:621 | `scripts/prepare-ephemeral-l1.mjs:44` | `PATH_VARIABLES` freezes exactly eight keys | moved | `scripts/prepare-ephemeral-l1.mjs:45` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) `PATH_VARIABLES` is at `scripts/prepare-ephemeral-l1.mjs:45` and still freezes exactly eight keys."
note:621 | `scripts/prepare-ephemeral-l1.mjs:72` | `PrepareError` carrying stable snake_case codes | gone | — | "(origin HEAD `964f443e`; re-anchored at 31c465f1) there is no `PrepareError`; refusals are plain `Error`s and the CLI envelope is `{error: message}` at `scripts/prepare-ephemeral-l1.mjs:959`."
note:621 | `scripts/prepare-ephemeral-l1.mjs:1433` | only a code crosses stderr; anything else flattens to `internal_error` | gone | — | "(origin HEAD `964f443e`; re-anchored at 31c465f1) no `internal_error` flattening exists; every caught message is emitted verbatim at `scripts/prepare-ephemeral-l1.mjs:959`."
note:621 | `:1435` (continuation) | exit code 2 on CLI failure | moved | `scripts/prepare-ephemeral-l1.mjs:960` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) the CLI sets `process.exitCode = 2` at `scripts/prepare-ephemeral-l1.mjs:960`."
note:621 | `scripts/prepare-ephemeral-l1.mjs:1111` | `destroy_target_not_child`; destroy demands one direct child | changed | `scripts/prepare-ephemeral-l1.mjs:760` | "(origin HEAD `964f443e`; re-anchored at 31c465f1) `readValidatedMarker` refuses a non-child with a prose message at `scripts/prepare-ephemeral-l1.mjs:760`; no `destroy_target_not_child` code exists."

Remaining anchor: heading `corpus/knowledge/remaining-scripts-census.md:619` → **ok** (path present at 31c465f1).

## Claim-level deltas not tied to an anchor (same paragraph)
- "destroy validates that marker before deleting anything" is false under `force`: `:823-887` can
  delete an unmarked target from layout heuristics (`:846-887`, `rmSync` at `:887`) when the marker
  is absent/unparseable.
- CLI surface is wider than "verbs are exactly create and destroy": destroy accepts `--root`,
  `--parent-root`, `--force` (`:930`), and `--force` is absent from the usage text at `:917`.
- `:621` "two library entry points" understates exports: 12 `export` declarations at 31c465f1
  (ROOT 29, POLICY_PATH 30, readPolicy 92, scrubbedGitEnvironment 178, gitOutput 214, isBeneath 243,
  ensurePrivateDirectory 255, validateSource 557, snapshotCheckout 616, create 659, destroy 814,
  main 912); the two lifecycle entry points are create/destroy.
- Claim parts that DO hold at 31c465f1: two lifecycle verbs; create clones via `snapshotCheckout`
  (`:616`, `clone --no-local` at `:617`); `readPolicy` reads `POLICY_PATH` (config
  `config/ephemeral-l1.machine.json` present, `schema ufo-ephemeral-l1-policy-v1`); `PATH_VARIABLES`
  = exactly eight keys and `readPolicy` enforces exact-set equality incl. length (`:125-129`);
  marker bounded by `maxEnvironmentBytes` and owner-private (`:769-772`, `:792-797`).

## Commands run (all read-only)
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/prepare-ephemeral-l1.mjs` → one hunk, `env` default added.
- `git show <rev>:scripts/prepare-ephemeral-l1.mjs | sed -n '<N>p'` for N=28,29,44,60,72,133,912,1111,1226,1377,1433,1435 at both revs → identical at both; several past EOF (962).
- `git show <rev>:scripts/prepare-ephemeral-l1.mjs | grep -nE '^export |git\(|SECURE|PrepareError|destroy_target_not_child|cli_usage|internal_error'`.
- `git grep -lE 'SECURE_WRITE_OPTIONS|PrepareError|destroy_target_not_child|cli_usage' 31c465f1` and same at 964f443e → empty both.
- `git show 31c465f1:scripts/prepare-ephemeral-l1.mjs | sed -n '20,60p;175,215p;640,745p;750,900p;895,962p'`.
- `git show 31c465f1:config/ephemeral-l1.machine.json`.
- `git cat-file -e 31c465f1:scripts/prepare-ephemeral-l1.test.mjs` → fatal (absent); `tests/prepare-ephemeral-l1.test.js` = 1370 lines.

Tooling installs: none. No secrets read (no content of `~/.kimi-code`, tokens, credentials).
