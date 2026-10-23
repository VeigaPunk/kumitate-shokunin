RESULT ConnAdjacency rev=8e822511 verdict=7 findings

# ConnAdjacency — r44 falsify wave: who must be told about `scripts/omp-census.mjs`

Axes: operability (fleet gate/re-derivation surface), coverage (which lane's census owns
`~/.omp/agent`). Read-only. Seven sibling lanes hold a live instrument or a live pin that the new
gate touches; each is told, none absorbs. All paths are relative to `/home/vgpnk/Projects/shokunin`
unless absolute; the lane tip read is `8e8225114dccb31d33fbcb76df78052807a33068`.

- **F1 kotoba — the lane that pins kumitate's skill file.** `kotoba-shokunin/corpus/knowledge/sibling-overlap-census-round49.md:80` pins kumitate at `fac39171ac28…` quoting `SKILL.md` + `PROVINCE.md:3`, and the guard `kotoba-shokunin/verifiers/check_sibling_census.py:1-40` re-reads every quote at that pin and rejects empty/false needles.
  Tell: round 44 moved the quoted file — `SKILL.md:590` (gate prose now names `omp-census`, added round 44), gate row `SKILL.md:609`, two checklist items `SKILL.md:697-698`. The `fac39171` row is now one revision behind by design: add a round-44 row, never amend the old pin; a regenerated row that quotes a runnable-gate count must read 11 `scripts/*.mjs`, not 10.
- **F2 kagi — the fleet's existing host-surface shape census, and the secret gate.** `kagi-shokunin/corpus/surface-census.sh:26-33` defines `path/class/kind/mode` rows with `# scan <dir>` ⇒ any undeclared child is `UNLISTED`; `:39-45` forbids printing content and withholds hashes of 0600 files; `kagi-shokunin/corpus/surface-census.tsv:17-20` shows four scan roots, **none** of them `~/.omp/agent`.
  Tell: kumitate now governs `~/.omp/agent` by shape only (`OMP_CENSUS`), a root kagi already treats as credential-bearing (`kama-shokunin/corpus/knowledge/listener-census.md:225-227` records the token at `~/.omp/agent/config.yml:169`, value never reproduced). kagi's rows stay unchanged and must not be re-pointed at the new gate; if kagi ever adds `~/.omp/agent` as a scan root, the two strictness rules collide on the same dir (kagi `UNLISTED` strict vs census optional generations/`INFO`) and precedence must be decided before, not after.
- **F3 kasegi — content authority over the same file.** `kasegi-shokunin/.ufo/rounds/round-21/global-config-hash.json:2-8` hashes `/home/vgpnk/.omp/agent/config.yml` bytes; `kasegi-shokunin/.ufo/rounds/round-21/admission-gate.json:6` gates on `GLOBAL_CONFIG_BYTES: UNCHANGED sha256=08788ddc…`.
  Tell: `OMP_CENSUS: CLEAN` is shape-only and carries no content claim — a rotated token or a rewritten config stays CLEAN; kasegi's digest remains the only content authority and admission must not be re-pointed at a census verdict.
- **F4 mori — census-name collision in the observability plane.** `mori-shokunin/tools/mori-census.sh:7,410,2714` emits `MORI_CENSUS: CLEAN|DRIFT (findings=… drift=… unavailable=… surfaces=…)`; `:13-18` fixes its surfaces to watchdog/waves/journal. With kagi `SURFACE_CENSUS: CLEAN|DRIFT` (`surface-census.sh:860,866`) and tsukuroi `TSUKUROI_CENSUS: HEALTHY|DEGRADED|BLOCKED` (`tsukuroi-census.sh:483`), the fleet now carries four `*_CENSUS:` verdict lines.
  Tell: `OMP_CENSUS` is kumitate's host-shape verdict, not a liveness surface — a DRIFT is not lane silence, not an unsettled wave, and must not be added to mori's SURFACE list (mori refuses dispatch and OS state).
- **F5 tsukuroi — host permission state and the fixture-mode precedent.** `tsukuroi-shokunin/tools/tsukuroi-census.sh:3-16` is the six-plane host census with `:12` "its whole product is verdict + evidence + suggested operator action"; `:2501-2517` already builds fixture dirs at `0555/0644/0400/1777` to prove mode arms.
  Tell: the new gate carries a permission **ceiling** over a host home dir (`MODE` finding). A live `MODE` on `~/.omp/agent` is report-only and operator-owned — tsukuroi routes it back to kumitate instead of repairing, and does not add `~/.omp/agent` as a seventh plane.
- **F6 tameshi — what a red suite means under the frozen exit semantics.** `tameshi-shokunin/tools/mutate-and-run.sh:59-60` (124/126/127 = INCONCLUSIVE), `:64-66` (red control ⇒ exit 2 before any suite run), `:77-78` (exit map 0/1/2).
  Tell: the census's exit 2 is *root-unreadable fail-closed*, indistinguishable from a setup refusal to a bare exit-code harness; any non-zero, non-124/126/127 suite exit scores as KILLED, so the suite target must be a wrapper asserting the exact `OMP_CENSUS:` line (as the `round-gate`/`cite-check` wrappers do), never the bare exit code.
- **F7 souji — hygiene receipts over new pinned bytes.** `souji-shokunin/PROVINCE.md:80` records that kumitate locks live task worktrees during dispatch so souji only prunes; `:105` refuses to acquire kumitate's fleet tooling.
  Tell: `scripts/omp-census.mjs` is live and pinned (`kumitate-shokunin/SCORECARD.md:317 pin.omp-census=fd4d1c4e…`), and `.ufo/waves/round-44/probe/*` are frozen counter/shape evidence, not stale scratch; only the bubblewrap mirrors under `/fast/scratch` are disposable.

## Contradiction stated, not smoothed

Two host-directory censuses now disagree in principle, not in measurement: kagi's `# scan` rule makes any undeclared child `UNLISTED`/drift, while the census contract makes absent members, sidecars and chain generations `INFO`/CLEAN. Both are correct inside their own contract; nothing in round 44 says which is authoritative for `~/.omp/agent`, and neither lane has been told. That is the one thing F2 asks kagi to settle before either census grows a new row.

## Not told, deliberately

- `kumitate-shokunin/scripts/proxy-check.mjs` (the fleet re-derivation surface, `:930` A-walk; `SCORECARD.md:288 A=16`, 11 `scripts/*.mjs` at tip) — internal, already owned by `falsify/ReviewProxyGatePins.md`.
- `../.ufo/reports/AGGREGATE.md:123` ("scripts/ 74 entries") — fleet aggregator, not a lane, and already falsified history.
- kotoba's `verifiers/check_gate_registry.py:1-22` verifies **kotoba's own** `verifiers/` against its own `SKILL.md`, so it is context for F1's row shape, not a kumitate consumer.

## Method and limits

Read-only: `grep`/`read`/`ls` over the fleet root plus `git ls-tree` on the lane (no writes, no commits, no runs). Verified: `OMP_CENSUS|omp-census` has **no** match in the eight lanes searched (kagi, kasegi, mori, tsukuroi, kotoba, tameshi, souji, kama) — so F1-F7 are the lanes that would be affected when a caller is added, not an observed failure. Two fleet-root recursive shell greps were abandoned at the 300 s limit; the bounded search above is what stands. Installs: none.
