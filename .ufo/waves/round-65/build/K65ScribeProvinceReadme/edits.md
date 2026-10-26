# K65ScribeProvinceReadme — paste-ready edits (L1 integrates; nothing here was applied)

Every block below is `REPLACE` / `WITH` text, line-anchored against lane revision
`2ca91a0c81542cad5f731049aa55dd2f99ade98d` (the freeze). Facts in the text were run once on this host; the
command that proves each is in `## Claim checks`.

---

## 1. PROVINCE.md — line 19 (Frontier, OMP bullet). One line, bullet form kept.

REPLACE (PROVINCE.md:19, exact current bytes)

```
- OMP harness contract (task batch, agent hub, agent discovery) — first entry `corpus/knowledge/omp-task-contract.md` (round 34); the docs track upstream `main` while the host runs the installed `omp` binary (skew named in the entry).
```

WITH (one line)

```
- OMP harness contract (task batch, agent hub, agent discovery) — first entry `corpus/knowledge/omp-task-contract.md` (round 34); round 65 adds `corpus/knowledge/omp-installed-release-mcp-runtime.md`, which measures the installed release instead of naming the skew — `omp/18.12.6` = tag `v18.12.6` = `45c35e40`, the wrapper and release bytes read by `scripts/omp-binary-probe.sh`, the MCP protocol constant `2025-11-25` present in those bytes and `2026-07-28` absent — resolving the round-34 entry's Version skew for the version-to-commit mapping and the protocol constant, while the docs-versus-binary question for task/hub semantics stays named there as open (append-only `Amendment 2026-10-25`).
```

Why this wording and not "resolving the skew" outright: the probe measures version, wrapper and byte literals. It does not
re-measure any task/hub default or lifecycle rule against the binary, so `omp-task-contract.md`'s "implementation was not
inspected" sentence is answered for the MCP constant only (see §3). A PROVINCE line that claimed more would be a false
frontier claim.

---

## 2. corpus/README.md — coverage-map rows and the `## Frontier` bullet

### 2a. Two map rows, appended after README.md:192 (the last row, `lessons/round-64-verifier-spotcheck.md`)

Row for the entry (only rows for files that exist at the close: this entry and `lessons/round-65.md`):

```
| `knowledge/omp-installed-release-mcp-runtime.md` | The installed OMP release measured instead of named: `omp/18.12.6` = tag `v18.12.6` = commit `45c35e40…`, and what that release does on the MCP side — it sends `MCP_PROTOCOL_VERSION` in `initialize` and then adopts whatever the server returns, with no client-side comparison (S205); the constant is `2025-11-25`, with the stated reason that a gateway refuses older clients, and it is echoed in the `MCP-Protocol-Version` header (S201); the runtime resolves a 250 ms startup gate, hands cached definitions to `DeferredMCPTool`, reconnects at 500/1000/2000/4000 ms under a circuit breaker after more than 5 attempts in 30 s, and never replays a request that may have reached the server (S202); a read-only 15-key probe measures the same host — the wrapper is a script that restarts `omp.real` on exit codes 132–139 up to 5 times, and the release bytes carry `2025-11-25` twice and `2026-07-28` not at all; the round-34 entry's Version skew resolved for the version-to-commit mapping and the protocol constant only, amended append-only (`Amendment 2026-10-25`) | S201, S202, S204, S205 (rows opened 2026-10-25 at the release tag, `corpus/SOURCES.md` `## Registry`); `scripts/omp-binary-probe.sh` (contract `kumitate-omp-binary-probe-v1`); `.ufo/pins/source-captures.json` |
```

Row for the round lesson:

```
| `lessons/round-65.md` | Round-65: `harm-matrix` capability acquisition (contract `kumitate-harm-matrix-v1` — every registry gate run at a BASE and a TIP revision, each in its own sandbox clone, and classified HELD / REPAIRED / HARM / HARM_ABSENT / NEW_OK / NEW_RED / GONE / CARRIED / CARRIED_MOVED / ABSENT_BOTH; judged by frozen H65 H1–H5) and the installed-release frontier entry (`omp-installed-release-mcp-runtime.md`, judged by frozen O65 O1–O8); the round-64 base DRIFT (`readme-map` repaired by the freeze's row+pin; `proxy-check` refreshed at the close) plus the A-term drift the freeze commit itself introduced; `considerthese/2026-10-25.md` idea 4 (count recurrences) taken as a lesson table and a QUALITY criterion, with C1 as the structural fix for the class "a landing moved a gate the lane did not run" | `.ufo/waves/round-65/plan.md`; `.ufo/waves/round-65/base/`; `.ufo/waves/round-65/probe/`; `.ufo/waves/round-65/controls/harm/` |
```

Notes for the L1:
- The S-ids in row 2a are the ones the wave-1 scouts drafted (`K65ScoutTypesTs` → S201, `K65ScoutRuntimeDoc` → S202,
  `K65ScoutTagVersion` → S204 package.json, S205 client.ts, and it proposes S206 = types.ts again). **Rewrite the citation cell
  to the ids actually allocated**: `cite-sources` fails on any `S` + 3-digit id that is not a `SOURCES.md` row. If S206 is
  allocated instead of S201, replace `S201` in both cells and in the entry's `source:` line together.
- No `src/…`/`packages/…` token appears in the row on purpose: `cite-check` counts path-like tokens, and an upstream-only
  source path in `corpus/README.md` would add warnings the lane does not own.
- `K65ScoutTagVersion` proposes a further row (S206) for `types.ts` at the tag URL. Do not admit it beside S201: both captures are
  byte-identical (`sha256 caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d`, 6 occurrences of `2025-11-25` each), so it
  would be one source counted twice. S201's own row already names `tag v18.12.6 = 45c35e40`, which is what O6's "release commit"
  arm accepts; drop S206 and keep the ids S201/S202/S204/S205 used above.
- `readme-map` after both rows land: `files=159 rows=159 covered=159` (measured 157/157 at the freeze; +2 files).

### 2b. `## Frontier` bullet — README.md:283

REPLACE (README.md:283, exact current bytes)

```
- **OMP harness contract (task batch, agent hub, discovery):** first entry `knowledge/omp-task-contract.md`; upstream `main` versus the installed OMP binary skew remains named there.
```

WITH (one bullet, two-line wrap as in the neighbouring bullets is fine — markdown joins them)

```
- **OMP harness contract (task batch, agent hub, discovery):** first entry `knowledge/omp-task-contract.md`; round 65 stops at naming the skew and measures the installed release — `knowledge/omp-installed-release-mcp-runtime.md` (`omp/18.12.6` = tag `v18.12.6` = `45c35e40`, rows opened at the tag, read-only 15-key probe `scripts/omp-binary-probe.sh`) resolves the version-to-commit mapping the round-34 entry records as UNKNOWN and records the MCP protocol constant the release carries (`2025-11-25` twice, `2026-07-28` zero); the docs-versus-binary question for task/hub defaults stays open and is amended append-only in the round-34 entry.
```

---

## 3. corpus/knowledge/omp-task-contract.md — appended section (append-only; the current 214 lines stay a byte prefix)

APPEND exactly this after line 214 (the file ends `stdout `omp/18.12.3`, observed 2026-10-19.\n`; keep one blank line before the
heading). Nothing above the heading is reworded: `git rev-parse 2ca91a0c:corpus/knowledge/omp-task-contract.md` =
`9ad41eaf46385b4cfe0c963387459f54cb4fc911` = the same blob at base `47fe2383`, which is what O8 checks.

```

## Amendment 2026-10-25 — the installed release is measured for the MCP constant; the task/hub semantics stay unmeasured

Everything above this heading is the round-34 judged object and is not reworded; this section is appended after its last byte.
Of the three sentences of § Version skew, one is now answered, one is not, and one is dated:

- «`[INFERENCE]` Version skew is possible; a version-to-commit mapping is UNKNOWN.» — **answered for the installed release.**
  `omp/18.12.6` is tag `v18.12.6`, commit `45c35e40c46166dc726ccc52f5d27f40f2449f99` (`.ufo/waves/round-65/base/omp-release-tag.txt`,
  `git ls-remote` at round 65), and the MCP rows this round opened are fetched at that tag, not at `main`.
- «its implementation was not inspected, so no claim is made that every current `main` default or lifecycle behavior matches that
  binary» — **still true for this entry's subject.** No task-batch shape, recursion depth, idle TTL, isolation backend, merge mode,
  discovery-precedence or Hub-lifecycle rule above is re-measured against the binary. A byte sweep is not an implementation
  inspection, and the docs-versus-binary question for task/hub semantics is NOT answered here.
- «the installed host reports `omp/18.12.3` (S004)» — a dated observation that still stands for 2026-10-19; the host now reports
  `18.12.6` (`OMP_BIN: real_version=18.12.6`, round 65).

What round 65 does add is narrow and measured: `corpus/knowledge/omp-installed-release-mcp-runtime.md` grounds the MCP half of the
installed release on rows opened at its tag and re-measures this host with `scripts/omp-binary-probe.sh` — a read-only probe whose
only executed program is `<real> --version`. The measured facts are the release version, the wrapper (a script that restarts
`omp.real` on exit codes 132–139 up to 5 times), and the literals the release bytes carry: `2025-11-25` twice, `2026-07-28` zero
times, `MCP_PROTOCOL_VERSION` / `MCP-Protocol-Version` / `DeferredMCPTool` three times each. The MCP protocol constant, the wrapper
and the release version are the whole of what this amendment resolves; the skew named in this section remains open for everything
the entry above records about task batches, defaults and lifecycle.
```

Word checks for O8: heading contains `Amendment 2026-10-25`; body names `corpus/knowledge/omp-installed-release-mcp-runtime.md`
and the literal `Version skew`; the answered/still-open split is explicit (MCP constant + wrapper + release version answered;
docs-vs-binary task/hub semantics not answered).

---

## 4. SKILL.md — gate registry prose, two registry rows, checklist preamble, two checklist items

### 4a. Registry header sentence (counts)

REPLACE (SKILL.md, the sentence beginning the `## Gate registry` section)

```
Twenty-four gate rows over twenty-three gate files (each can exit 1 on a real defect; `report-receipt-diff` round 64 is new, and
```

WITH

```
Twenty-five gate rows over twenty-four gate files (each can exit 1 on a real defect; `harm-matrix` round 65 is new, `report-receipt-diff` round 64 the row before it, and
```

Measured: 28 registry rows at the freeze (24 gate rows over 23 gate files + `cap-run` runner + `counter-rerun` probe + `cap-spawn`
helper + `jj-seat-demo` demo); the two rows below make 30 rows / 25 gate rows / 24 gate files, and 2 probes.

### 4b. New paragraph after the `jj-seat-demo` paragraph (before `| name | kind | entry command …`)

```
`omp-binary-probe` (round 65 row) is a **probe**, not a gate: it exits 0 (measured) or 2 (fail-closed), and there is no exit-1 arm,
so a different release or wrapper on the host moves the values and cannot turn it red. Its evidence value is the 15-key set that the
frozen `.ufo/waves/round-65/probe/omp65-probe.mjs` O6 re-runs inside the judged archive and compares against the entry's
`## Host measurements`; a release change is a measurement to re-ground, not a red gate. `harm-matrix` (round 65) is the reverse
case and a real gate: its `HARM` verdict is an exit-1 arm.
```

### 4c. Two registry rows, appended after the last row (`jj-seat-demo`, SKILL.md:637)

```
| harm-matrix | gate | `node scripts/harm-matrix.mjs --base REV --tip REV [--lane DIR] [--gates FILE] [--only id,id] [--timeout S]` → one `HARM_ROW gate=<id> base=<CLEAN\|NOT_CLEAN\|ABSENT\|TIMEOUT\|FAIL_CLOSED> tip=… id=<HELD\|REPAIRED\|HARM\|HARM_ABSENT\|NEW_OK\|NEW_RED\|GONE\|CARRIED\|CARRIED_MOVED\|ABSENT_BOTH> base_text="<verdict line>" tip_text="…"` line per gate, then `HARM_MATRIX: CLEAN\|HARM gates=<n> held=… repaired=… carried=… moved=… new=… gone=… harm=… harm_absent=… new_red=… base=<12> tip=<12>` (0 clean — exit 0 exactly when harm + harm_absent + new_red = 0 · 1 harm · 2 fail-closed `HARM_MATRIX: FAIL_CLOSED reason=…` · 64 usage), contract `kumitate-harm-matrix-v1` (round 65): each gate is measured in its own `mkdtemp` `git clone --no-hardlinks` checkout of the revision, so the lane worktree, index and jj state are never touched; a gate is clean only when its exit is in `ok_exit` AND the last line matching its `verdict` regex has a first capture in `clean` — a missing verdict line is `FAIL_CLOSED` and a timeout is `TIMEOUT`, never clean; the suite is built so a stub tool that ignores its input (always `CLEAN`, always `HARM`) fails | `--selftest [--cases FILE]` (26 hermetic cases, fixture repos built per case; `HARM_MATRIX_SELFTEST: PASS (26/26)` + exit 0, 7 s on this host; the 26 cases exercise all ten transition ids and 12 of them expect exit 0) | `scripts/harm-matrix-gates.json` (20 gate rows at freeze: 12 lane-gate rows + 8 `--selftest` rows); `scripts/harm-cases.json` (26 cases); `.ufo/waves/round-65/controls/harm/` (16 case dirs + `MANIFEST.sha256`, frozen); `.ufo/pins/counter-pins.json` |
| omp-binary-probe | probe — **not** a gate: no exit-1 arm exists, so no measurement it makes can turn it red; a release or wrapper change is a value to re-ground, not a failed gate | `bash scripts/omp-binary-probe.sh` → 15 `OMP_BIN: <key>=<value>` lines then `OMP_BIN_PROBE: DONE omp=<version>`, exit 0 / `OMP_BIN_PROBE: FAIL-CLOSED <reason>` exit 2 (`util-absent`, `wrapper-absent`, `real-absent`, `version-unreadable`), contract `kumitate-omp-binary-probe-v1` (round 65): read-only — the only program it executes is `OMP_NO_RESTART=1 <real> --version`; it greps the wrapper as text and sweeps the release bytes with `grep -a -o -F`; keys: `wrapper_is_script`, `wrapper_names_real`, `wrapper_restart_codes`, `wrapper_max_restarts`, `real_is_elf`, `real_bytes`, `real_version`, `lit_2025_11_25`, `lit_2026_07_28`, `lit_2025_03_26`, `sym_MCP_PROTOCOL_VERSION`, `header_MCP-Protocol-Version`, `sym_DeferredMCPTool`, `collab_hosts_literal`, `docs_phrase_never_replayed` | exercised by `.ufo/waves/round-65/probe/omp65-probe.mjs` O6 (re-runs it inside the judged `git archive` and compares the full key set and values with the entry's `## Host measurements`) | the key list and the fail-closed reasons in the script body; `pin.omp-binary-probe` in `kumitate-gate-pins-v1` (add it with `pin.jj-seat-demo`, the other `.sh` row: `proxy-check` did not raise `PIN_UNPINNED` for it, so this is consistency, not a gate demand) |
```

### 4d. Checklist preamble

REPLACE

```
Thirty-three items (round 64; item 33 is the plan-before-ready map-arm suite, item 32 the jj seat-containment demo re-run, item 31 the report-vs-receipt diff suite,
```

WITH

```
Thirty-five items (round 65; item 35 is the harm-matrix suite over the lane's gate registry, item 34 the installed-release probe re-measurement, item 33 the plan-before-ready map-arm suite, item 32 the jj seat-containment demo re-run, item 31 the report-vs-receipt diff suite,
```

(`grep -c '^\s*- \[' SKILL.md` → 33 at the freeze; the two items below make 35, which is what the `C` term of the proxy stanza
must be refreshed to at the close.)

### 4e. Two checklist items, appended after the last item (SKILL.md:739)

```
- [ ] Harm matrix over the lane's gate registry (round 65; contract `kumitate-harm-matrix-v1`; 20 frozen gate rows, 26 hermetic cases; the real harm run before a claim lands is the registry row's command, --base <base> --tip <tip>) — `node scripts/harm-matrix.mjs --selftest` → exit 0 + `HARM_MATRIX_SELFTEST: PASS`
- [ ] Installed-release OMP probe (round 65; contract `kumitate-omp-binary-probe-v1`; 15 keys; a probe, not a gate — 0 measured or 2 fail-closed and never 1, so a release change is a measurement to re-ground) — `bash scripts/omp-binary-probe.sh` → exit 0 + `OMP_BIN_PROBE: DONE`
```

---

## 5. Close-time obligations the L1 must not miss (not edits I may make)

1. `pin.harm-matrix=6bde065f8b80a53c864be10fa6a5c30cbaeeafc29847d6a8b397144bf7ce7560` (sha256 of `scripts/harm-matrix.mjs` at
   `2ca91a0c`; recompute if any executor patch is applied). Without it `proxy-check` prints `PIN_UNPINNED
   term=scripts/harm-matrix.mjs` — measured, warn-level, present at the freeze.
2. `pin.omp-binary-probe=8774640580b56fcb454281d68465a687a779cebb0b8410cd418d5e4cb03117e3` (same rule).
3. Proxy stanza refresh at the close must move four terms, not one: `A` (351 declared vs **357 computed** at the clean freeze
   archive — the freeze's own six new runnable files; the working tree reads 368 today because wave-1 build artifacts are
   untracked), `C` (33 → 35 after the two checklist items), `C2` and `C2_total` (157 → 159 after the two `.md` files). Recompute
   `A` from the final tree, since committed `build/*.mjs` count.
4. `readme-map`: `files=159 rows=159` expected after §2a; `README_MAP: CLEAN` is O7's condition.

---

## Claim checks (run once, at `2ca91a0c`, on this host)

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -1 --format='%H %s'
2ca91a0c81542cad5f731049aa55dd2f99ade98d round-65: freeze — plan, counters H65/O65 with pins, 16 controls, base receipts, harm-matrix v1, omp-binary-probe v1, readme row for the r64 spot-check
$ test -e corpus/knowledge/omp-installed-release-mcp-runtime.md  → absent (draft seat's path; the L1 creates it)
$ cat .ufo/waves/round-65/base/omp-release-tag.txt
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6
$ bash scripts/omp-binary-probe.sh            → exit 0, 15 `OMP_BIN:` keys + `OMP_BIN_PROBE: DONE omp=18.12.6`
  real_version=18.12.6  lit_2025_11_25=2  lit_2026_07_28=0  lit_2025_03_26=2
  sym_MCP_PROTOCOL_VERSION=3  header_MCP-Protocol-Version=3  sym_DeferredMCPTool=3  collab_hosts_literal=2
  wrapper_is_script=1  wrapper_names_real=omp.real  wrapper_restart_codes=132-139  wrapper_max_restarts=5
  real_is_elf=1  real_bytes=256702432  docs_phrase_never_replayed=0
$ node scripts/harm-matrix.mjs --selftest     → HARM_MATRIX_SELFTEST: PASS (26/26), exit 0, real 6.98s
$ node scripts/harm-matrix.mjs --base 6825a514 --tip a004902d --only readme-map,proxy-check
  HARM_ROW gate=readme-map base=NOT_CLEAN tip=CLEAN id=REPAIRED …
  HARM_ROW gate=proxy-check base=NOT_CLEAN tip=CLEAN id=REPAIRED …
  HARM_MATRIX: CLEAN gates=2 held=0 repaired=2 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=6825a51425e9 tip=a004902d77d1   (exit 0, 12.5s)
$ node -e '…harm-matrix-gates.json…' → gates=20 (12 lane rows + 8 selftest rows), cases=26, expects exit0=12,
  all ten transition ids exercised
$ ls .ufo/waves/round-65/controls/harm/ | wc -l → 17 (16 case dirs + MANIFEST.sha256)
$ grep -c '^\s*- \[' SKILL.md → 33 ;  registry data rows → 28 (24 gate rows over 23 gate files + runner + probe + helper + demo)
$ wc -l corpus/knowledge/omp-task-contract.md → 214 ; last bytes `out `omp/18.12.3`, observed 2026-10-19.\n`
$ git diff --stat 47fe2383… -- corpus/knowledge/omp-task-contract.md → empty ; blob 9ad41eaf46385b4cfe0c963387459f54cb4fc911 at both
$ grep -n '250 ms' .ufo/waves/round-65/build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md → :114 ; `never replayed automatically` :152 ;
  backoff `500`/`1000`/`2000`/`4000` :198 ; `2025-11-25` :101 ; `DeferredMCPTool` :13,121,150
$ bash scripts/omp-binary-probe.sh >/dev/null; echo $? → 0
$ sed -n '169,181p' .ufo/waves/round-65/build/K65ScoutTagVersion/capture/types.ts → `Latest MCP protocol revision this client negotiates.`
  (l.171) … `export const MCP_PROTOCOL_VERSION = "2025-11-25";` (l.181)
```

### Base-state reading the drafts were written against (measured, not patched)

```
$ cd /tmp/kumitate-r65/K65ScribeProvinceReadme/freeze && node scripts/proxy-check.mjs     # git archive of 2ca91a0c
PROXY  error  A_DRIFT  A: declared=351 computed=357 delta=+6
PROXY  error  C2_DRIFT  C2: declared=156 computed=157 delta=+1
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=156 computed=157 delta=+1
PROXY  warn  PIN_UNPINNED  scripts/harm-matrix.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (...)
$ node scripts/readme-map.mjs      → README_MAP: CLEAN files=157 rows=157 covered=157   (exit 0)
```

`base/proxy-before.txt` (at `47fe2383`) reads `C2_TOTAL_DRIFT` + `AXES_DRIFT` and no `A_DRIFT`; the freeze commit's six new
runnable files (`.ufo/waves/round-65/probe/{gen-harm-cases.mjs,harm65-probe.mjs,omp-donothing-control.sh,omp65-probe.mjs}`,
`scripts/harm-matrix.mjs`, `scripts/omp-binary-probe.sh`) are the +6. Reported as a finding; the plan's maintenance line
("proxy stanza refresh at the close") covers it only if the refresh recomputes `A`, which §5.3 says explicitly.
