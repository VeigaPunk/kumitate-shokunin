ATTACK scripts/fleet-dispatcher.test.mjs census-section verdict=holds defects=0

## Scope result

Axis: coverage:script-layer. The round-35 section at `corpus/knowledge/remaining-scripts-census.md:515-517` is correctly re-anchored to `31c465f1`; I found no false behavior claim in the scoped section.

- Re-opened every cited line from `/fast/scratch/kumitate-r35/src` at `31c465f1`: `:3-8`, `:16`, `:33-34`, `:36`, `:38`, `:40`, `:51`, `:59`, `:85`, `:226`, `:273`, `:285`, `:293`, `:2848-2852`, `:2850`, `:409-415`, and `:416-440`. The header has the stated five surfaces; helper/constants, scratch override, section-1 read-budget assertions, usage literals and exit assertions match the prose. `DISPATCHER` at `:31` resolves to `scripts/fleet-dispatcher.mjs`; the test uses `spawnSync` and has no `node:test` import.
- Count check: `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/fleet-dispatcher.test.mjs | wc -l` → `2852`; population row `remaining-scripts-census.md:131` says `2852 | suite`. The largest-member line at `:189` also matches pin counts: dispatcher test `2852`, sync-ufo-contracts `2137`, ufo-state-retention `1924`.
- Removed-content traces are present and accurate in the member context: `throwsib_reader_inline` existed in the prior test tree but not at the pin; no ledger-busy test block/`LEDGER_BUSY` token exists in this test at the pin. The old degraded/throwing-sibling and ledger-busy requirements are not asserted as current behavior. The section ends `re-anchored at 31c465f1 (round 35)`. The master section itself had no per-member `964f443e` revision label; the census's surrounding history still identifies the 2026-10-14/round-32 `964f443e` measurement as historical.
- Context for the prior table value: `git show c90bbcf:scripts/fleet-dispatcher.test.mjs | wc -l` → `3278`; `964f443e` → `3268`; `31c465f1` → `2852`. Thus the old `3278` value matches the observed intermediate `c90bbcf` tree, not the named base pin. The current pin value is correct.

## Verification

- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8 --json` → member section `anchors=18`, `live=true`, `symbols=12`, `symbolHit=true`, `inFamily=true`; `findings=[]`, `verdict=MATCH`.
- `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` → `PROXY: MATCH` (S=88/88, `coverage:script-layer=10`). `node scripts/proxy-check.mjs --src ... --selftest` → `VERDICT: PASS` (107 selftests).
- `cd /fast/scratch/kumitate-r35/src && node scripts/fleet-dispatcher.test.mjs --keep` → `PASS 195/195 checks passed`.
- Drop-one mutation in a scratch copy (removed this section only): proxy reported `S_SECTIONS_DRIFT declared=88 computed=87` and `COVERAGE_SCRIPT_DRIFT declared=10 computed=9`; claims-check reported `MEMBER_COUNT_DRIFT declared 60 members, found 59 distinct sections`. Restored copy matched the lane census and both gates returned MATCH.
- Falsified gate sensitivity in scratch only: changing the scoped literal `unknown command: --help` to `unknown command: --frobnicate` still yielded `CLAIMS: MATCH`; proxy likewise remained MATCH for a wrong population-table count. This does not refute the manually re-opened current claims, but demonstrates these gates do not establish prose semantics or per-row line counts.

## Residual risks and verification gaps

- Adjacent, out-of-scope stale map entry: `corpus/README.md:53` still says S8 `63 of 63`, describes a 60-row census with old totals, and lists `fleet-dispatcher.test.mjs` as `4094 L`. It was unchanged in the round-35 diff; update that README entry separately to the current census/pin values.
- Whole-note `cite-check` remains failing elsewhere (`CITE_CHECK: DRIFT`, 432 errors/445 warnings); no error was reported for the target section at lines 515-517. The scoped source/anchor check above passed.
- LSP unavailable: `read xd://lsp` returned `No such tool`; verification used direct pinned `git show` line reads and the lane gates instead.
- No tools installed. Mutation copies and test fixtures stayed under `/fast/scratch/kumitate-r35/w/SecFleetDispatcherTest/`, `/tmp`, and the test's configured scratch root; the lane working tree was not edited.
