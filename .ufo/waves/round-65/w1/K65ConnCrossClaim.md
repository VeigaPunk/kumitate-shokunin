VERDICT: C1 and C2 share one pattern — a reading is valid only at a pinned revision — and the lane breaks it in 7 SOURCES rows (4 on `/main/`, one already drifted) plus in the C2 landing's own coupling to C1's `readme-map` and `source-capture` gates, which the harm-matrix counter reads as `HARM`; no sibling lane contradicts the host measurement of omp/18.12.6, but the lane's own entry and README do.

## Evidence

**Host measurement (C2's own instrument):**
```
$ bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/omp-binary-probe.sh; echo "EXIT=$?"
OMP_BIN: wrapper_is_script=1
OMP_BIN: wrapper_names_real=omp.real
OMP_BIN: wrapper_restart_codes=132-139
OMP_BIN: wrapper_max_restarts=5
OMP_BIN: real_is_elf=1
OMP_BIN: real_bytes=256702432
OMP_BIN: real_version=18.12.6
OMP_BIN: lit_2025_11_25=2
OMP_BIN: lit_2026_07_28=0
OMP_BIN: lit_2025_03_26=2
OMP_BIN: sym_MCP_PROTOCOL_VERSION=3
OMP_BIN: header_MCP-Protocol-Version=3
OMP_BIN: sym_DeferredMCPTool=3
OMP_BIN: collab_hosts_literal=2
OMP_BIN: docs_phrase_never_replayed=0
OMP_BIN_PROBE: DONE omp=18.12.6
EXIT=0
```

**Count table — moving-URL rows in `corpus/SOURCES.md` (139 registry rows):**
```
$ grep -E '^\| S[0-9]{3} \|' corpus/SOURCES.md | grep -cE '/main/|/latest/|/master/'
6
$ grep -E '^\| S[0-9]{3} \|' corpus/SOURCES.md | grep -E '/main/|/latest/|/master/' | cut -c1-120
14:| S001 | oh-my-pi docs/tools/task.md — https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md | docs | A
15:| S002 | oh-my-pi docs/agent-hub.md — https://github.com/can1357/oh-my-pi/blob/main/docs/agent-hub.md | docs | A
16:| S003 | oh-my-pi docs/task-agent-discovery.md — https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md | docs | A
37:| S024 | oh-my-pi docs/mcp-config.md — https://github.com/can1357/oh-my-pi/blob/main/docs/mcp-config.md | docs | A
61:| S048 | Cosmic Ray official docs, Concepts — https://cosmic-ray.readthedocs.io/en/latest/concepts.html | docs | A
127:| S114 | Amazon SQS visibility timeout — AWS SQS Developer Guide — https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html | docs | A
$ grep -E '^\| S[0-9]{3} \|' corpus/SOURCES.md | grep -cE '\| https?://[^ |]+ \|'
1   # bare homepage: S039 https://pitest.org/
```
| class | count | ids |
|---|---|---|
| `/main/` | 4 | S001, S002, S003, S024 |
| `/latest/` | 2 | S048, S114 |
| `/master/` | 0 | — |
| bare homepage | 1 | S039 |
| **flagged total** | **7** of 139 (5.0%) | |

Separately, **26 rows name a revision in the `anchor` cell that the `source` URL does not carry** — the pin is recorded but not in the URL.

**S001 has already drifted — its own anchor's revision differs from live `main`:**
```
$ curl -fsSL .../oh-my-pi/81fa40eadef31a578b8acb922c7054c43f0c0f2c/docs/tools/task.md | wc -l   -> 218
$ curl -fsSL .../oh-my-pi/main/docs/tools/task.md | wc -l                                        -> 220
$ curl -fsSL .../oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/docs/tools/task.md | wc -l   -> 220
$ diff 81fa40e-task.md main-task.md
61a62,63
> Batch calls reject a top-level `agent` rather than silently discarding a specialist selector and spawning the default agent. Put `agent` on each `tasks[]` item when selecting `reviewer`, `scout`, or a custom agent; the agent name is not inferred from the task text.
```
S002 (`agent-hub.md`, 123 lines) and S003 (`task-agent-discovery.md`, 341 lines) are byte-identical to `81fa40e` today — unpinned, silent-drift class. S024 (`mcp-config.md`, 567 lines) identical to its anchor `10b9b493`.

**The lane's own recheck receipt is now false.** `corpus/knowledge/omp-task-contract.md:3` records
`curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/tools/task.md | wc -l` → 218 (2026-10-19); that command returns 220 today.

**Cross-claim coupling — a C2 landing without a README row reads as C1 `HARM`** (scratch clone `git clone --no-hardlinks` of the lane; commits only in the clone):
```
README_MAP: CLEAN files=157 rows=157 covered=157
# + corpus/knowledge/omp-installed-release-mcp-runtime.md, no README row:
README_MAP: DRIFT files=158 rows=157 covered=157 bad=2 first=uncovered:knowledge/omp-installed-release-mcp-runtime.md
$ node scripts/harm-matrix.mjs --base 2ca91a0c81542cad5f731049aa55dd2f99ade98d --tip HEAD --only readme-map --timeout 120
HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: CLEAN files=157 rows=157 covered=157" tip_text="README_MAP: DRIFT files=158 rows=157 covered=157 bad=2 first=uncovered:knowledge/omp-installed-release-mcp-runtime.md [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=2ca91a0c8154 tip=1c97b0bb3e9c
```
**And the same for an uncaptured new SOURCES row:**
```
$ node scripts/harm-matrix.mjs --base 2ca91a0c81542cad5f731049aa55dd2f99ade98d --tip HEAD --only source-capture --timeout 120
HARM_ROW gate=source-capture base=CLEAN tip=NOT_CLEAN id=HARM base_text="SOURCE_CAPTURE: CLEAN captures=32 exemptions=107" tip_text="SOURCE_CAPTURE: DRIFT captures=32 exemptions=107 bad=1 first=S201:uncaptured [exit=1]"
HARM_MATRIX: HARM gates=1 held=0 repaired=0 carried=0 moved=0 new=0 gone=0 harm=1 harm_absent=0 new_red=0 base=2ca91a0c8154 tip=fb4b1d98ee1e
```

**O5 live-fetch trap: a GitHub `/blob/` URL serves HTML whose source text `norm()` deletes.** `omp65-probe.mjs:57-64` strips `<script>…</script>`; the blob page keeps the file inside `<script type="application/json" data-target="react-app.embeddedData">`. Measured on `packages/utils/src/dirs.ts` at `45c35e40`: 20/20 candidate quotes are in the raw file, only **12/20** survive the blob HTML; 8 miss, e.g. `import * as fs from "node:fs";`. The corpus's own S053 quote `/** Get the custom themes directory (~/.omp/agent/themes). */` is in the raw file and **not** in the blob HTML. Two URL forms are byte-identical to the pinned raw file and fetch as text:
```
$ sha256sum raw1 rawm
2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24  raw1   # .../blob/<sha>/...?raw=1
2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24  rawm   # raw.githubusercontent.com/.../<sha>/...
$ cmp raw1 rawm && echo IDENTICAL
IDENTICAL
$ curl -fsSL .../v18.12.6/packages/utils/src/dirs.ts | sha256sum   -> 2d423f4f…  (== commit form)
```
O6's pin test (`/v<real_version>/` **or** the release commit) passes for all three forms.

**Sibling lanes (read-only grep of `/home/vgpnk/Projects/shokunin/*-shokunin/corpus` for `oh-my-pi|omp.real|omp/18.`):** kotoba 3 files, mori 9 files, all other lanes 0. Statements:
```
kotoba-shokunin/corpus/lessons/round-51.md:4: C1 freshness — run against the installed omp 18.12.6 …
kotoba-shokunin/corpus/lessons/round-51-verifier-spotcheck.md:40: `omp --version` → `omp/18.12.6`; mtime 2026-10-21 …
kotoba-shokunin/corpus/lessons/round-47.md:19: … at BASE `omp --version` → `omp/18.12.5` …   (dated)
mori-shokunin/corpus/knowledge/harness-job-capacity-r25.md:24: Everything here is bound to one version, omp/oh-my-pi **18.12.6** (tag `v18.12.6`, commit 45c35e40…)
mori-shokunin/corpus/SOURCES.md:138: S132 … https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/crates/pi-natives/src/shell.rs
```
**No sibling contradicts the host measurement.** mori is the sibling precedent: it pins by commit and uses `raw.githubusercontent.com/…/<commit>/…` URLs.

**The contradiction is inside this lane.** `corpus/knowledge/omp-task-contract.md:205` still says "the installed host reports `omp/18.12.3` (S004)"; `corpus/README.md:91` still says "installed `omp/18.12.3`". The lane's own `S081` (`omp/18.12.6`, mined 2026-10-23, "supersedes S004") declares `used-by: corpus/knowledge/omp-task-contract.md`, but that entry cites only `S001 S002 S003 S004` (`grep -c S081 corpus/knowledge/omp-task-contract.md` → 0). `sources-check` warns `USED_BY_ASYMMETRY` only in the entry→row direction (`scripts/sources-check.mjs:377`); the row→entry direction is unchecked — measured **27 of 139 rows** claim a `used-by` entry that does not cite them (S029, S059, S080, S081, S082–S084, S087–S092, S093, S095, S096), while `node scripts/sources-check.mjs` still reads `SOURCES_CHECK: CLEAN`.

## Findings

**K65ConnCrossClaim-1 — severity high — attacks C2's O5/O6 (and C1's `source-capture` via the row set).** 7 of 139 SOURCES rows name a moving target; 26 more name a revision in `anchor` that the `source` URL does not carry. S001's anchor revision has already drifted from live `main` (218 → 220 lines, a semantic `agent`-selector change), and the entry's own recheck receipt (`…/main/docs/tools/task.md | wc -l` → 218) no longer reproduces (220).
Reproduce: `grep -E '^\| S[0-9]{3} \|' corpus/SOURCES.md | grep -E '/main/|/latest/|/master/'` and `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/tools/task.md | wc -l`.

**K65ConnCrossClaim-2 — severity high — attacks C1 (H5) via C2's landing.** C2's entry file must arrive with a `corpus/README.md` row **and** a `.ufo/pins/readme-map.json` `covered` entry, or C1's `readme-map` gate goes CLEAN→NOT_CLEAN and the harm-matrix counter prints `HARM_MATRIX: HARM … harm=1`. Verified in a scratch clone (above).
Reproduce: clone the lane, add `corpus/knowledge/omp-installed-release-mcp-runtime.md` with no README row, run `node scripts/harm-matrix.mjs --base 2ca91a0c… --tip HEAD --only readme-map`.

**K65ConnCrossClaim-3 — severity high — attacks C1 (H5) via C2's rows.** A new `S2xx` row without a binding in `.ufo/pins/source-captures.json` makes `source-capture` read `DRIFT … first=S201:uncaptured` at tip → C1 `HARM`. Verified.
Reproduce: add the row, run `node scripts/harm-matrix.mjs --base 2ca91a0c… --tip HEAD --only source-capture`.

**K65ConnCrossClaim-4 — severity medium — attacks C2's O5 directly (false red).** O5 live-fetches the row's *URL*, and a GitHub `/blob/` URL serves HTML whose file text lives in a `<script>` block that `norm()` deletes: 8 of 20 quotes measured missing on `dirs.ts`; the corpus's own S053 quote is among them. The URL still passes O6's pin test, so the row looks correct while O5 red-lights. Use `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/<path>` (mori's house form) — pinned, byte-stable, text-fetchable, O6-pinning by the tag.
Reproduce: fetch `.../blob/45c35e40…/packages/utils/src/dirs.ts`, apply the probe's `norm()` (`omp65-probe.mjs:57-64`), search for `import * as fs from "node:fs";` → absent; the same string in the raw file → present.

**K65ConnCrossClaim-5 — severity medium — attacks the lane's version record (in-lane, not a sibling).** `omp-task-contract.md:205` and `corpus/README.md:91` still assert the host reports `omp/18.12.3`; the host measures `18.12.6` (`OMP_BIN: real_version=18.12.6`). The lane's own `S081` records 18.12.6 and supersedes `S004`, but `S004` stays `mined` and both rows claim the same `used-by` entry, which cites neither consistently. `sources-check` cannot see it: the row→entry direction of `used-by` is unchecked (27 rows affected) and `SOURCES_CHECK: CLEAN` still holds.
Reproduce: `grep -c S081 corpus/knowledge/omp-task-contract.md` → 0, while `sed -n '94p' corpus/SOURCES.md` shows S081 `used-by corpus/knowledge/omp-task-contract.md`.

**K65ConnCrossClaim-6 — severity low — attacks C1's gate registry (registry shape, not a claim).** `scripts/harm-matrix-gates.json` has 20 gates while H5's floor is 14; `anchor-truth` pins `--base e18ff1af3392e3823227644c977c237737fe65c9` (a revision, good) but `wave-census-r40` reads `--round 40` (a moving label, not a revision) — the one gate in the registry whose target is named by a label rather than a commit. Informational; no change proposed.

**Proposed move (one, bounded):** repin the four `/main/` OMP doc rows (S001–S003, S024) to the installed release commit `45c35e40…` **in the URL**, using the sibling-lane `raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/<path>` form for the new C2 rows; and land C2's entry with its README row, its `readme-map.json` `covered` entry, and its row's capture binding in one commit. This improves C2 (O5/O6 stop reading a moving or HTML target), harms no axis, and closes K65ConnCrossClaim-2/-3 by construction. Patch text is in the build artifact; no frozen artefact (`plan.md`, `probe/*`, `controls/`, `base/`) is touched.

## Artifacts
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ConnCrossClaim/patterns.md` — the full pattern scan: shared-pattern argument, count table, three worst offenders with the pin each needs, sibling-lane table, O5 trap analysis, coupling reproductions, proposed move, limits.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/w1/K65ConnCrossClaim.md` — this report.
- Scratch (not part of the deliverable): `/tmp/kumitate-r65/K65ConnCrossClaim/` — a `git clone --no-hardlinks` sandbox of the lane (two probe commits inside the clone only) plus fetched upstream bytes.

## Limits
- No lane file was modified; all reproductions used a scratch clone under `/tmp/kumitate-r65/K65ConnCrossClaim/`. I did not commit in the lane, did not touch `jj` state, and did not run any `pacman` transaction.
- The GitHub `/blob/` HTML survival rate (12/20, 8 misses) was measured on two files (`docs/tools/task.md`, `packages/utils/src/dirs.ts`); it is file-specific, not a universal constant. GitHub's page shape may also change.
- I tested the `?raw=1` form with plain `curl -fsSL`, not with the counter's exact flags (`-fsSL --max-time 90 --retry 2 -A Mozilla/5.0`); the bytes are identical, but the flag path is unexercised.
- The sibling scan covered `*/corpus` for the tokens `oh-my-pi`, `omp.real`, `omp/18.`; a sibling stating an OMP version outside those tokens would not appear here. I read only `kotoba`'s and `mori`'s corpus (the other lanes had zero hits); I did not read kotoba's or souji's own ground (prompt/skill craft, colocation) and absorbed none of it.
- I did not verify whether `counter-pins.json` must record a new pin for the C2 entry — the round-65 pins are only the two probes, the case generator, the do-nothing control, and the controls manifest; `readme-map.json` and `source-captures.json` are not counter-pinned, so no counter-pin update is implied by my proposal.
- `git ls-remote` on `refs/heads/main` gave `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0` and `refs/tags/v18.12.6` gave `45c35e40c46166dc726ccc52f5d27f40f2449f99`, matching the frozen `base/omp-release-tag.txt` pin.
- No tool was installed or upgraded this seat; none was needed.
