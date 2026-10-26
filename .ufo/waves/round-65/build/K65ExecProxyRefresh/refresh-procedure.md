# Round-65 proxy-stanza refresh — procedure (seat K65ExecProxyRefresh)

Dry-run only: this seat edited nothing in the lane outside its own build/report paths. Every number below was
measured either in a sandbox clone of the lane at the base revision or by reading the live lane (read-only).
`refresh.mjs` (same directory) prints both replacement blocks; the L1 pastes them at the close.

## 1. What the round moves, and what it does not

| term | declared at base `47fe2383` | computed at base | archive of the freeze commit `2ca91a0c` | close target |
|---|---|---|---|---|
| `A` | 351 | 351 | **357** | **measured at close** (§3 trap 1) |
| `C` | 33 | 33 | 33 | **35** (two SKILL checklist items) |
| `C1` / `C1_total` | 19 / 19 | 19 / 19 | 19 / 19 | unchanged |
| `C2` / `C2_total` | 156 / 156 | 156 / 157 | **157 / 157** | **160 / 160** |
| `S_members` / `S_sections` | 88 / 88 | 88 / 88 | 88 / 88 | unchanged (origin tree `31c465f15669`) |
| `R_members` / `R_sections` | 92 / 92 | 92 / 92 | 92 / 92 | unchanged |
| `C1k`, `K_members`, `K_sections`, `coverage_kimi` | 5/5, 49, 49, 10 | same | same | re-measure (host state) |
| `pin.proxy-check` (v1) | `d6f8dce9…71f` | matches | matches | **re-pin after the `GATE_PINS` edit** |
| gate pins | 22 keys | 22 match | 22 match | **+4 keys** (§2) |

The base `DRIFT` (`base/proxy-before.txt`: `C2_TOTAL_DRIFT`, `AXES_DRIFT coverage row=10 derived=9`) is already
repaired at the freeze commit: the round-64 spot-check row and its `readme-map` covered entry landed there, so the
live lane reads `README_MAP: CLEAN files=157 rows=157 covered=157` (exit 0) and coverage 10.

`operability` and `coverage` need no `## Axes` edit: `operability = floor(10·(A+C)/(A+C+3))` is 9 for every
`A ≥ 0` with `C=35`, and `coverage` is 10 exactly when `C1 == C1_total` and `C2 == C2_total`.

## 2. Pin registration: two authorities, one syntax each

A pin exists only when BOTH halves are present:

1. `scripts/proxy-check.mjs`, the `GATE_PINS` object literal:
   `'pin.<name>': 'scripts/<file>', // <round>: <why>`
   A `pin.<name>=…` line whose key is **not** in this literal makes the block fail closed
   (`GATE_PIN_KEY_UNKNOWN`, exit 2) — the block is parsed against the literal, not the other way round.
2. `SCORECARD.md`, the `kumitate-gate-pins-v1` block: `pin.<name>=<sha256-of-the-file>`.

Naming precedent: the file's basename without the extension (`pin.plan-before-ready` → `scripts/plan-before-ready.sh`,
`pin.readme-map` → `scripts/readme-map.mjs`). The v1 `kumitate-proxy-v1` block keeps its frozen 23 keys; its six
pins are never widened.

Which round-65 files need one:

| key | path | required? | why |
|---|---|---|---|
| `pin.harm-matrix` | `scripts/harm-matrix.mjs` | **yes** | a top-level `scripts/*.mjs` with no pin raises `PIN_UNPINNED`, a `warn`, and `--strict` turns a warn into `DRIFT` (measured, step 1 below) |
| `pin.omp-binary-probe` | `scripts/omp-binary-probe.sh` | recommended | `--strict` never warns for `.sh` — the file would stay unpinned silently |
| `pin.harm-matrix-gates` | `scripts/harm-matrix-gates.json` | recommended | the C1 gate registry; nothing else pins it |
| `pin.harm-cases` | `scripts/harm-cases.json` | recommended | the C1 selftest case set; nothing else pins it |

The two JSON pins are a strengthening (a silent case edit becomes a `GATE_PIN_DRIFT`), not a relaxation. If the L1
declines them, the block stays valid; the `.json` files then have no byte contract anywhere.

## 3. Ordered edit list, with the command that proves each step

0. **Make the tree final before measuring `A`.** `A` is a count over the working tree, not a commit.
   Proof of the hazard: three consecutive reads of the live lane during this wave gave `A=745, 748, 749`
   (`find` agreed within one racing write), and the freeze commit alone already reads `A=357` inside
   `git archive 2ca91a0c`.
   ```
   git -C <lane> status --porcelain          # must be empty before the measurement
   ```
1. **Land the corpus files**: the entry, the two lessons, their `corpus/README.md` rows, and their
   `.ufo/pins/readme-map.json` `covered` entries (the pin halves of the map).
   ```
   node scripts/readme-map.mjs   # README_MAP: CLEAN files=160 rows=160 covered=160   (exit 0)
   ```
   Row grammar (both gates): a line starting `| \`knowledge/…\`` or `| \`lessons/…\``; `readme-map` matches
   `^\|\s*\`((?:knowledge|lessons)/[^\`]+)\`\s*\|`. Simulated: 3 new notes + 3 rows + 1 `covered` pin each,
   plus the already-landed D2 row/pin → CLEAN 160/160/160.
2. **Land the two SKILL checklist items** (each line begins `- [ `; the tool counts matching lines anywhere in
   `SKILL.md`).
   ```
   grep -c '^\s*- \[' SKILL.md     # 33 -> 35
   ```
3. **Register the gate keys** in `scripts/proxy-check.mjs` `GATE_PINS` (§2). Then:
   ```
   node scripts/proxy-check.mjs --selftest   # PROXY_SELFTEST: 122/122 pass ; VERDICT: PASS (exit 0)
   ```
   Measured after exactly this edit (4 new keys): 122/122, exit 0 — no suite change is needed.
4. **Dry run the refresh** (prints, never writes):
   ```
   node .ufo/waves/round-65/build/K65ExecProxyRefresh/refresh.mjs --self . --from-check
   ```
   `--from-check` fills the 17 counts from `node scripts/proxy-check.mjs --json` (`.terms`), so the block cannot
   disagree with the gate; the pins are hashed from the tree. Exit 0 means the printed blocks would read `MATCH`;
   exit 1 prints the reason (`NOTE C2=… C2_total=…`, `NOTE … is not in … GATE_PINS`, `NOTE coverage derives 9`);
   exit 2 is fail-closed (missing block / unparsable pin literal / absent pinned file / a block key the tool does
   not register — measured: `FAIL-CLOSED pin.bogus-extra is in the kumitate-gate-pins-v1 block but not in
   proxy-check.mjs GATE_PINS (GATE_PIN_KEY_UNKNOWN)`); 64 usage.
   Its output was diffed byte-for-byte against the blocks this seat applied by hand in the simulation:
   `diff` empty for both blocks.
5. **Paste the two blocks** over `SCORECARD.md` (the tool prints their line ranges). The v1 block keeps its
   shape (23 keys + 2 markers, constant), so the gate block's line range is stable across the paste.
6. **Prove the result:**
   ```
   node scripts/proxy-check.mjs --strict
   # PROXY: MATCH (A=… C=35 operability=9; C1=19/19 C2=160/160 coverage=10; S=88/88 coverage:script-layer=10;
   #              R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
   ```
7. **If any pinned script changes after step 4** (executor hardening lands late), repeat 4–6: the pins are
   hashed from the tree, so the dry run is idempotent and re-running is the whole repair.

## 4. Measured simulation trace (sandbox clone, base checkout, stub scripts)

| step | `--strict` findings |
|---|---|
| base | `C2_TOTAL_DRIFT 156→157`, `AXES_DRIFT coverage row=10 derived=9` |
| `+scripts/harm-matrix.mjs` | `A_DRIFT 351→352`, `C2_TOTAL_DRIFT`, `AXES_DRIFT`, `warn PIN_UNPINNED scripts/harm-matrix.mjs` |
| `+scripts/omp-binary-probe.sh` | `A_DRIFT 351→353`; no new finding for the `.sh` |
| `+harm-matrix-gates.json +harm-cases.json` | **no change** (`A=353`) — JSON is invisible to `A` |
| `+corpus/knowledge/omp-installed-release-mcp-runtime.md` | `C2_TOTAL_DRIFT 156→158` |
| `+readme row (entry)` | `C2_DRIFT 156→157` |
| `+readme row (D2 spot-check)` | `C2=158 C2_total=159` → `AXES_DRIFT` still |
| `+readme row (round-65 lesson)` | `C2=159 C2_total=159` → `AXES_DRIFT` **gone** (coverage 10) |
| `+lessons/round-65-verifier-spotcheck.md` (no row) | `C2_TOTAL_DRIFT 159→160` → `AXES_DRIFT` **back** |
| `+row for it` | `C2=160 C2_total=160`, coverage 10 |
| `+2 SKILL items` | `C_DRIFT 33→35` |
| `+GATE_PINS edit` | `PIN_DRIFT pin.proxy-check d6f8fce9…71f → <new>` |
| both blocks pasted (`A=353 C=35 C2=160/160`, 4 gate pins) | `PROXY: MATCH (…)` exit 0 |

## 5. Traps (each measured)

1. **`A` is a working-tree count of every `*.mjs|js|sh|py` file anywhere under the lane**, `.ufo/waves/**/build`
   included (323 of the base 351 were already `.ufo` artifacts). Two drafts added under
   `.ufo/waves/round-65/build/` moved `A` 353 → 355 with **no** `PIN_UNPINNED`; removing them restored `MATCH`.
   So `A` is reproducible only against a clean, committed tree, and every committed seat artifact counts.
2. **JSON is invisible**: `harm-matrix-gates.json` / `harm-cases.json` change `A` by 0. Pin them or they have no
   byte contract.
3. **`--strict` warns only for `scripts/*.mjs`**; a new `.sh`/`.json` is silently unpinned.
4. **Coverage is 10 only at rows == notes**: 158 rows / 159 notes read `coverage=9`; the axis integer is all or
   nothing.
5. **Editing `proxy-check.mjs` re-pins itself**: `pin.proxy-check` is in the v1 block and tracks the tool's own
   bytes — re-pin as the last edit to that file.
6. **The gate-pin block is opt-in per declared key**: an undeclared key is never a finding (removing a pin line
   silently disables its check); an unknown key is fail-closed.

## 6. Values the L1 must supply (this seat cannot fix them)

- `A` at close: run step 6's `--json` read on the final tree and paste `.terms.A`.
- `K_members` / `K_sections` / `C1k`: host state — re-read, do not copy from this document.
- Pin hashes: hash the *final* bytes of the four files (`refresh.mjs` does this for you).
