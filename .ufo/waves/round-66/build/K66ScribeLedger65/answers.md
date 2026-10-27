# R65-D1..D7 — answers (round 66, wave w1, seat K66ScribeLedger65)

Target of this text: the `## Routed defects answered` section of `corpus/lessons/round-66.md` (paste the seven
paragraphs as-is) and the `answer` cells of `corpus/routed-ledger.md` (rule L66, L3's round-65 clause).
Each `- R65-Dk —` line is the line this seat's `rows.md` anchors on; the quote the ledger carries is the sentence
on that line (<= 25 words, located there). Where the row anchors an existing lane file instead (D4, D6, D7), the
paragraph below still carries the answer and names that file. Facts were read at lane tip
`88041bc9f45b06560bbd807bd1ea7b44126aa49f` on 2026-10-27; nothing outside this seat's report/build paths was written.

- R65-D1 — Gate record for S204-S206 carries URL, access date and capture-located quote.
  S204 `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts`, opened
  2026-10-25, quote "protocolVersion: MCP_PROTOCOL_VERSION," at `capture/omp-v18.12.6-mcp-client.ts:100` (14975 B,
  sha256 `479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9`). S205 `.../src/web/search/providers/zai.ts`,
  quote `const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";` at `capture/omp-v18.12.6-zai.ts:80` (12774 B, `0598c9f2…`).
  S206 `.../src/mcp/transports/http.ts`, quote "no protocol-version header is sent from either source." at
  `capture/omp-v18.12.6-mcp-transports-http.ts:122` (33157 B, `41ad7d5b…`); all three captures sit under
  `.ufo/waves/round-65/build/Capture/` and each matches its `.ufo/pins/source-captures.json` row on sha256 and bytes.

- R65-D2 — Capability row for harm-matrix drafted in full below: 36 gates, 114-case selftest, exit map 0/1/2/64.
  `| harm-matrix | Replay the lane's gate registry at two revisions — each revision in its own sandbox clone — and print one transition per gate (HELD, REPAIRED, HARM, HARM_ABSENT, NEW_OK, NEW_RED, GONE, CARRIED, CARRIED_MOVED); a gate is CLEAN only when its exit code is in `ok_exit` and the last matching verdict line carries a `clean` word, and a missing verdict, invalid UTF-8, >64 MiB output, signal death, spawn error or a gate past its `timeout` is FAIL_CLOSED, never clean | `node scripts/harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE]` → `HARM_MATRIX: CLEAN|HARM gates=<n> …` (contract `kumitate-harm-matrix-v2`) | `--selftest` 114 cases, PASS at round 65 (`HARM_MATRIX_SELFTEST: PASS (114/114)`) | `scripts/harm-matrix-gates.json` (36 gates); `pin.harm-matrix` still absent (`PROXY warn PIN_UNPINNED`) | 65 |`
  The row enters through a round that demonstrated the capability running (`AXES.md` §Capabilities): `HARM65_HELD
  held=5/5` at `2b1f416` and one real base→tip run `HARM_MATRIX: CLEAN gates=36 … harm=0`, per `SCORECARD.md:2995`.

- R65-D3 — Gate-registry rows for harm-matrix, omp-binary-probe and routed-ledger drafted below in the SKILL 5-cell shape.
  `| harm-matrix | gate | `node scripts/harm-matrix.mjs --base REV --tip REV` → `HARM_MATRIX: CLEAN|HARM` | `--selftest` (114 cases) | `scripts/harm-matrix-gates.json`; `pin.harm-matrix` absent (PROXY `PIN_UNPINNED`) |`
  `| omp-binary-probe | probe | `bash scripts/omp-binary-probe.sh` (wrapper from `OMP_BIN_WRAPPER`, default `command -v omp`) → 22 `OMP_BIN:` keys + `OMP_BIN_PROBE: DONE omp=<version>`, exit 2 `FAIL-CLOSED <reason>` (contract `kumitate-omp-binary-probe-v2`; no exit-1 arm) | 27 failure arms (`K65ExecOmpRobust/arms.sh`) | keys and the 22-key set inside the script |`
  `| routed-ledger | gate | `node scripts/routed-ledger.mjs [--root DIR] [--rev REV] [--from N] [--to N] [--classes]` → `ROUTED_LEDGER: CLEAN|DRIFT|FAIL-CLOSED` (contract `kumitate-routed-ledger-v1`) | `--selftest` → `ROUTED_LEDGER_SELFTEST: PASS (33/33)`, run 2026-10-27 | `corpus/routed-ledger.md` rows + each spot-check's routed-section ordinals; no `pin.routed-ledger` yet |`
  The `## Gate registry` preamble of `SKILL.md` states a fixed count ("Twenty-four gate rows over twenty-three gate
  files"); inserting these three rows makes it twenty-seven rows over twenty-six gate files and the sentence must be
  updated in the same edit or the file contradicts itself.

- R65-D4 — Proxy stanza state at base is recorded and carried: seven DRIFT terms, origin clone reaped.
  `.ufo/waves/round-66/base/proxy-before.txt:8` reads A declared=351 computed=455 delta=+104, C2 +3, C2_total +4,
  K_members +3, K_sections +3, AXES coverage 10 vs 9, `PIN_UNPINNED scripts/harm-matrix.mjs` (EXIT=1); the first-run
  failure is `.ufo/waves/round-66/base/proxy-before-src-reaped.txt:2` `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR)` because
  `/fast/scratch/hyaku/kumitate-pin/src` was absent, and the plan says the clone was recreated from `.ufo/pins/origin.json`.
  The item's second half is still open at the tip: `grep -cE '^- \*\*Q6[2-4]' corpus/QUALITY.md` → `0` (the file ends
  at Q61) and `ls scripts/class-recurrences.sh` → no such file. Disposition: carried and disclosed, not repaired here.

- R65-D5 — cite-check-fleet-dot growth is confined to two round-65 receipt files; per-file split is K66ExecCiteCheckD5's.
  The base-1545 reading is carried in a committed round-65 artifact,
  `.ufo/waves/round-65/build/K65ExecHarmRegistry/registry-v2-table.md:23`: `CITE_CHECK: DRIFT (files=161 tokens=12033
  errors=1545 warnings=766)`; the +92 to 1637 is the close reading in `corpus/lessons/round-65-verifier-spotcheck.md` §2
  (`errors 1545 → 1637`) and the registry ranks the movement `CARRIED_MOVED`, unranked by the tool. This is the
  placeholder the wave asked for: the per-file attribution lands with the cite-check seat's receipt, and until that
  receipt exists the delta is disclosed, not attributed.

- R65-D6 — Round size answered by the dispatch record: 66 spawns, no resumes, one v2 wave.
  `.ufo/waves/round-66/w1-dispatch.json:17` carries `"spawn": 66` with `"total": 66`, and the same file's policy block
  reads `waveMinLanes 64`, `waveMaxLanes 128`; `.ufo/waves/round-66/plan.md:106` declares one v2 wave in the 64–128 band.
  `.ufo/waves/round-66/plan.md:101` records that round 65's never-run 40-seat falsify items (S201–S206 re-opens,
  `harm-matrix` mutation, H65/O65 forging) ride this wave as seats.

- R65-D7 — README row and readme-map pin landed at the freeze; the map reads CLEAN.
  `corpus/README.md:195` is the row, `.ufo/pins/readme-map.json:163` pins `lessons/round-65-verifier-spotcheck.md`, and
  `node scripts/readme-map.mjs` printed `README_MAP: CLEAN files=160 rows=160 covered=160` exit 0 against the base
  receipt `.ufo/waves/round-66/base/readme-map-before.txt:2` `README_MAP: DRIFT files=160 rows=159 covered=159`.
  Both the row and the pin landed in commit `621212bac37f8249c72ac982d1d6534cb8d60701`; `corpus/README.md` at base
  `8d557f85312de4fcc82e09ff735d21436bc3746d` has `0` occurrences of the file name, so the answer line is new this round.
