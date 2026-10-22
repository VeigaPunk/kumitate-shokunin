RESULT ReviewKimiFloor rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=PASS live=CLEAN red=2/2

# ReviewKimiFloor — D7 review (kimi-census secret-directory mode mask + owner pin, oauth 0755 exception, red-before)

Scope: `scripts/kimi-census.mjs` e5ffcbe7f155b89cb1870f9da7b0d671d092948b..84cb1d5d8e703aafd4f73d887ba4237692ff13f9. Measured-file sha256 = 0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075 (clone at rev and `git show rev:scripts/kimi-census.mjs` agree). `pin.kimi-census` in SCORECARD.md:310 at rev = same sha, so the byte change was re-pinned correctly (D6 consistent). No `lsp` server exists on this host (`lsp://status` -> "No MCP server"; recorded — caller checks used grep plus real runs). kimi-census.mjs exports nothing; its only consumers spawn the CLI or re-derive rules (proxy-check.mjs), neither affected by the pin tightening.

## Evidence (each run under `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600`)

1. Measured selftest (clone at rev): `node scripts/kimi-census.mjs --selftest` -> `KIMI_CENSUS_SELFTEST: 54/54 pass` / `VERDICT: PASS` / exit=0.
2. Live read-only census at rev: `node scripts/kimi-census.mjs` -> `KIMI_CENSUS: CLEAN (members=53 checked=53 chain=8 info=4)` / exit=0. (Shape only; no secret content read. Live chain=8; fixture chain=3.)
3. Red-before A (ceiling): variant-oldpins.mjs = rev file with the secret-pin block reverted to the old floor-only behaviour (no ceiling, no owner). `node variant-oldpins.mjs --selftest` -> exactly two FAIL: `SHAPE_DRIFT: locks/ rejects group and other bits beyond its 0700 floor` and `SHAPE_DRIFT: locks/ owner must match the running uid`; `52/54 pass` / `VERDICT: FAIL` / exit=1. Both new checks are genuinely red against the old behaviour -> red=2/2.
4. Red-before B (owner) is case 3's second FAIL; the owner check (`verify(green, process.getuid() ^ 1)`) produced no finding under the old block since old code ignored uid.
5. oauth exception is load-bearing: variant-noauthceiling.mjs = rev file with `modeCeiling: 0o755` removed from the oauth member only. Live run -> `CENSUS error SHAPE_DRIFT oauth/ oauth mode 0755 has permissions beyond the 0700 secret-directory limit`, `DRIFT (SHAPE_DRIFT oauth/)`, exit=1. Without the exception the live tree fails; with it (run 2) CLEAN. Same variant's selftest: 54/54 pass (fixtures build oauth at 0700, so the exception exists solely to admit the live 0755).

## Findings

- None blocking. The new pin logic is correct as implemented: floor + `(mode & (0o777 ^ ceiling))` beyond-ceiling + uid equality for secret dirs; per-member ceiling defaults to floor; secret files unaffected; kind-mismatch paths still report the kind finding; fail-closed/absent and drift arms unchanged; counts stable (members=53 checked=53 on live and green fixture).
- Low / residual: (a) secret FILE pins remain floor-only by design (mcp.json/server.token accept wider modes) — pre-existing, outside D7, unchanged. (b) The owner pin's CLI wiring (`verify(root)` default `process.getuid()`) has no hermetic negative test (chown needs privileges); live CLEAN confirms the default path does not false-positive. (c) `stat.mode & 0o777` masks setgid/sticky bits, so e.g. sticky-on-0700 secret dirs pass all pins — cosmetic hardening gap, not a D7 regression. (d) SCORECARD move-log line 421 cites round-42 selftest "52/52"; the round selftest is now 54/54 (two new checks) — historical citation, not a gate.

## Verification gaps

- Owner-pin negative test under real CLI with a chowned fixture was not run (requires root; I made no host changes). The in-process `verify()` negative covers the semantics.
- No strace-style open-count re-run performed; the changed block uses the same `lstatSync`-only pattern (statInfo) as before, and the FIFO/dangling-symlink/canary selftest arms still pass (run 1).

Tooling: none installed or upgraded (no pacman transaction, no uv/npx install).
