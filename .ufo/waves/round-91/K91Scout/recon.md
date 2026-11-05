# K91Scout — recon for the receipt-bind v5 integration and close

Seat: scout, wave 1, round 91 (hyaku run 15). Read-only; every file cited below was read at the
frozen rev `2b1b8bf3d274db8e608035bffb27bd3b3d4009d4` unless a live command is named.
Every pointer in this file is backed by a `grep -n` / command receipt in `greps.txt` (G1–G15) or
`receipts-pbr-map.txt` (R1–R6).

---

## 0. Headline findings for the integrator

| # | finding | evidence | severity |
|---|---|---|---|
| **F1** | **`plan-before-ready --round 91` is RED at the frozen plan commit** — `reason=MAP_DRIFT map_first=uncovered:lessons/round-90-verifier-spotcheck.md`. The r91 freeze (`2b1b8bf3`) was committed over a red readme-map: the r90 verifier spot-check landed in base `0bff4bab` with no `corpus/README.md` row and no `.ufo/pins/readme-map.json` pin (G31: it was **never adopted anywhere**). **The precedent is exact**: the r88 freeze (`114877a3`) and the r90 freeze (`b67fa963`) each adopted the predecessor's spot-check *inside the freeze commit* (`corpus/README.md | 1 +`, `.ufo/pins/readme-map.json | 3 +-`; the r90 freeze added exactly the row `` | `lessons/round-89-verifier-spotcheck.md` | Non-author round-89 verifier spotcheck | Closure artifact; adopted by spotcheck-adopt | ``). The r91 freeze added **neither** (G30). | R1, R2, R4, R5, R6, R15 | **BLOCKER for the close** — the `plan-before-ready` close case exits 1 and the runner's `ok` is false |
| **F2** | **The live `readme-map` gate is also RED** — `README_MAP: DRIFT files=231 rows=230 covered=230 bad=2 first=uncovered:lessons/round-90-verifier-spotcheck.md`, and `spotcheck-adopt --check` reads `SPOTCHECK_COVERAGE: DRIFT spotchecks=57 uncovered=1 first=corpus/lessons/round-90-verifier-spotcheck.md`. Same root cause as F1. **⚠️ LATE (R16): another seat adopted it in the WORKTREE while I was reconning** — the worktree now reads `README_MAP: CLEAN files=231 rows=231 covered=231` (`.ufo/pins/readme-map.json` + `corpus/README.md` modified, uncommitted). **This does NOT fix F1** — the plan-commit map arm judges `git archive 2b1b8bf3`, not the worktree, so `plan-before-ready --round 91` still reads `reason=MAP_DRIFT … map_first=uncovered:lessons/round-90-verifier-spotcheck.md` (R16b). | R3, R6, R16, R16b | **BLOCKER** — the `readme-map` close case is now green in the worktree, but `plan-before-ready` stays red until the plan commit itself is re-committed |
| **F3** | **`proxy-check --strict` fails closed on this host** — `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /fast/scratch/hyaku/kumitate-pin/src is absent`, exit 2. The origin pin (`.ufo/pins/origin.json`, rev `31c465f1…`, clone `/fast/scratch/hyaku/kumitate-pin/src`) has no clone on disk; the origin repo `/home/vgpnk/Projects/ufo-fsd-alpha` *does* exist and *does* carry that revision. The r90 close ran the same case green (`PROXY: MATCH … src-rev=31c465f15669; source=snapshot`) — the pin clone has since been removed from scratch. | R7 | **BLOCKER for the close** unless the pin clone is restored first (see §4) |
| **F4** | **C2 accounting is already one short.** `proxy-check` derives `C2 =` README rows and `C2_total =` corpus notes; at the tip that is **230 / 231**, while `SCORECARD.md:299-300` declares `C2=230` / `C2_total=230`. One corpus file (`corpus/lessons/round-90-verifier-spotcheck.md`) has no README row. Adopting it (one README row + one pin) makes derived 231/231 — which then requires bumping the declared pair to `C2=231`/`C2_total=231` in the `kumitate-proxy-v1` block, else `PROXY: DRIFT`. | R8, G5 | **accounting edit**, must be done together with F2 |
| **F5** | The **worktree already carries a v5 candidate** (`scripts/receipt-bind.mjs`, `CONTRACT = 'kumitate-receipt-bind-v5'`, `MAX_INSTRUMENT_BYTES = 16777216`, `openSync(abs, O_RDONLY\|O_NOFOLLOW\|O_NONBLOCK)` + `fstatSync` + `isFile()` + size check). Measured by me with the frozen probe: **`C91_C1: HELD held=56/56`, exit 0**. The base v4 at the frozen rev measured **`C91_C1: UNMET held=52/56`, exit 1**, failing exactly `ext-zero, ext-null, ext-fifo, ext-overcap` — matching the committed control table row `base-v4-at-rev` (sha `35f4f25e…`). ⚠️ **The candidate is a moving target** — another seat is editing it live: sha `33ee29eb…` / selftest `83/83` at 20:59:41Z, sha `f39aab5c…` / selftest `84/84` at 21:05:15Z. My 56/56 reading is against the `33ee29eb…` bytes; **re-measure at M** and take the suite count from M, not from this note. | R9, R10, R11, R11b | good news: the claim is reachable; the integration is unblocked on the instrument side |
| **F6** | **`.ufo/waves/round-91/close/` already exists on disk** (empty, created 17:45:24 by the wave scaffolding — the same second as `open/`). `run-close91.mjs` refuses `OUT_EXISTS` (exit 3) before it writes anything, so the close must either `rmdir` the empty dir first or pass a different `--out`. The r90 close dir was created by the runner itself (07:19:43), so this is a new hazard in r91. | R12, R13 | mechanical, but will bite the close seat |
| **F7** | The `round-gate --round 91` case is red for the same reason as r90's was: `REPORT_MISSING` (no `/home/vgpnk/Projects/shokunin/.ufo/reports/round-91/kumitate.md` yet), `SCORECARD_ROW_MISSING` (no `\| 91 \|` row), `LOG_ENTRY_MISSING` (no `- YYYY-MM-DD — round 91` line). r90 closed the same way and repaired them in the close commit `bf24587c` (`LOG.md | 12 +`, `SCORECARD.md | 1 +`). **These three rows are part of the v5 close deliverable, not a defect.** | R14 | expected, but must be repaired in the close commit |

---

## 1. Every lane file that documents or pins `receipt-bind`, with the exact v5 text

All line numbers are at rev `2b1b8bf3`. The "changes for v5" column is the literal edit the
integrator must make; wording is mine, the anchors (paths, tokens, numbers) are the lane's own.

### 1.1 `SKILL.md` — gate registry row (the contract row)

* **`SKILL.md:646`** — the `receipt-bind` row of the `§ Gate registry` table
  (header `| name | kind | entry command | self-test | pinned values live in |` at `SKILL.md:605-606`).
  Current text (G1) carries:
  `contract \`kumitate-receipt-bind-v4\` (round 90; v3 round 89, v2 round 88, v1 round 87, …)`;
  `… v4 (K89-V1) recognises a field line after a leading run of U+FEFF, U+200B..U+200E or U+00A0 …`;
  `Frozen scorers: .ufo/waves/round-87/probe/probe87-c1.mjs, …/round-90/probe/probe90-c1.mjs (47 arms); rounds 87–90 are UNMET by their kill rules, so no capability row.`;
  self-test cell `node scripts/receipt-bind.mjs --selftest --work DIR — hermetic \`git init\` fixtures, 76 cases`;
  pinned-values cell `… SCORECARD.md \`kumitate-gate-pins-v1\` \`pin.receipt-bind\``.

  **v5 edits to that one row:**
  1. contract → `` `kumitate-receipt-bind-v5` (round 91; v4 round 90, v3 round 89, v2 round 88, v1 round 87, `` …`` ``.
  2. append a **v5 boundary sentence** after the v4 one: the external (absolute, outside-lane) instrument is opened with `O_RDONLY|O_NOFOLLOW|O_NONBLOCK`, the **descriptor** is `fstat`ed, a non-regular file (character device, FIFO, directory) and a regular file larger than `16777216` bytes are `FAIL-CLOSED UNRESOLVED` (exit 2) within 20 s under a 2 GiB address-space limit, and the bytes are read **from that descriptor** — an empty external file and one of exactly `16777216` bytes still bind `CLEAN external=1`.
  3. `Frozen scorers:` list → add `` `.ufo/waves/round-91/probe/probe91-c1.mjs` (56 arms, two fixture contexts) ``; keep the r87–r90 entries.
  4. the `rounds 87–90 are UNMET … so no capability row` sentence → `rounds 87–90 are UNMET by their kill rules`; **if** the v5 predicate holds and the kill rule does not fire, this sentence must be replaced by the capability claim (see §3), otherwise keep it and say `rounds 87–91 …`.
  5. self-test cell `76 cases` → the measured v5 suite count (**83/84 as the worktree candidate stands** — R11/R11b, and the candidate is a moving target, so **re-measure at M**).
  6. pinned-values cell → add the r91 close receipt path `.ufo/waves/round-91/close/*.txt`.

### 1.2 `SKILL.md:763` — the checklist item

Current (G2): `` - [ ] Receipt-subject binding (round 87, v2 round 88, v3 round 89, v4 round 90; contract `kumitate-receipt-bind-v4`; the claim predicates are the frozen scorers at `.ufo/waves/round-87/probe/probe87-c1.mjs`, … `.ufo/waves/round-90/probe/probe90-c1.mjs` (47 arms); this item is the hermetic selftest, 76 cases including each v2 boundary with a positive twin, the v3 behaviours and the v4 invisible-prefix field lines) — `node scripts/receipt-bind.mjs --selftest` → exit 0 + `RECEIPT_BIND_SELFTEST: PASS` ``

**v5 edits:** `v4 round 90` → `v4 round 90, v5 round 91`; contract → `kumitate-receipt-bind-v5`; add the r91 scorer to the predicate list and change `(47 arms)` → `(56 arms)`; change `76 cases` → the measured v5 count and name the v5 class (bounded external reads: non-regular file / over-cap refusal, each with a positive twin).

### 1.3 `SKILL.md:589` — the gate-registry prose

`` Registry home per the fleet protocol's §Gate standard (round 34). Twenty-nine gate rows over twenty-eight gate files (round 87 adds `receipt-bind`) `` — **no change for v5**: the gate-row count is unchanged (v5 is a new version of an existing gate, not a new gate file). Only edit it if the integrator adds a new gate file.

### 1.4 `SCORECARD.md` — `kumitate-gate-pins-v1` pin

* **`SCORECARD.md:338`** (inside the `<!-- kumitate-gate-pins-v1` block that opens at `SCORECARD.md:326`, G5):
  `pin.receipt-bind=35f4f25e6130dd827747ceff8ced80682d96c6c04d9516f2a463ce58cc7c1fce`
  → **replace with the sha256 of the v5 instrument at M.** The v5 contract's own `scripts/proxy-check.mjs:561` entry (`'pin.receipt-bind': 'scripts/receipt-bind.mjs'`) does **not** change — only the value in the SCORECARD block does. `proxy-check --strict` re-hashes the file and fails `PIN_UNPINNED`/`PIN_DRIFT` if the value is stale, so this edit is **mandatory** before any close battery runs.

### 1.5 `SCORECARD.md` — the machine-readable claim block (`kumitate-proxy-v1`)

* **`SCORECARD.md:293`** opens `<!-- kumitate-proxy-v1`; the block ends at the `-->` before `SCORECARD.md:326`.
* **`SCORECARD.md:299-300`**: `C2=230` / `C2_total=230` → **`C2=231` / `C2_total=231`** once the r90 spot-check is adopted (F4). The derived pair at the tip is 230/231 (R8), so the current declared pair is already inconsistent.
* `A_wave=1253`, `C=46`, `C1=19/19` are unaffected by v5.
* `pin.*` values in the **v1** block (`SCORECARD.md:314-319`) are unaffected; `pin.receipt-bind` lives in the *gate-pins* block (§1.4).

### 1.6 `SCORECARD.md` — `## Move log` (row for round 91)

* `## Move log` at **`SCORECARD.md:470`**; the newest row is `| 90 |` at **`SCORECARD.md:474`**, `| 89 |` at `475` (G7).
* **A `| 91 |` row must be added** — `round-gate` reports `SCORECARD_ROW_MISSING` without it (R14).
* Row shape to follow (from `SCORECARD.md:474`): `| 91 | <axis: "operability (lowest non-retired axis; integer held 9 — terminal under `f_O`; capability acquisition \`receipt-bind\` v5 — HELD/UNMET …"> | <before: the do-nothing control> | <after: at M …> |`.
* `## Planned` is at **`SCORECARD.md:579`** (G8) and must name a round **later than 91** (round-gate's `SCORECARD_PLAN_MISSING` warning, R14) — i.e. a round-92 pre-registration line.

### 1.7 `SCORECARD.md` — `## Capabilities` table

* `## Capabilities` at **`SCORECARD.md:1958`** (G6). **There is NO `receipt-bind` row today** — the grep `^| .*receipt-bind` returns only the Move-log rows 474/475 and the two accounting mentions (4325, 4387); rounds 87–90 were all UNMET, so no capability row was ever credited. A v5 row is **new**, and per the plan it is credited **only if** the predicate holds at M *and* the kill rule does not fire.
* **Row format** to copy — from `| \`counter-receipt\` v3 *(verified round 86)* |` at **`SCORECARD.md:1993`** (G6): four cells — `| \`receipt-bind\` v5 *(verified round 91)* | <what it can now do> | <evidence pointer> | 91 |`.
  The v5 capability cell would read: bind every close receipt's `tool_sha256=` to the instrument its own `cmd=` names at a judged revision, **with bounded external reads** — an absolute external instrument is opened `O_RDONLY|O_NOFOLLOW|O_NONBLOCK`, `fstat`ed on the descriptor, refused `FAIL-CLOSED UNRESOLVED` when it is not a regular file or is larger than 16777216 bytes, and read from that descriptor; an empty external file and one of exactly the cap bind `CLEAN external=1`.
  The evidence-pointer cell: `node .ufo/waves/round-91/probe/probe91-c1.mjs --lane . --work <scratch> --alt /fast/scratch/hyaku --rev <M> --tool scripts/receipt-bind.mjs` → `C91_C1: HELD held=56/56` exit 0 twice (`.ufo/waves/round-91/close/probe1.txt`, `close/probe2.txt`, `RUN_CLOSE: PROBE_DETERMINISM SAME`); `--selftest` → `RECEIPT_BIND_SELFTEST: PASS held=<M-measured>/<M-measured>`; `pin.receipt-bind` = the new sha.
  The last cell: `91`.

### 1.8 `corpus/README.md` — coverage-map rows and the `## Frontier` section

* `## Coverage map` opens at **`corpus/README.md:14`**; the last row is `| \`lessons/round-90.md\` |` at **`corpus/README.md:267`** (G9).
* **A round-91 lesson row is required** — `corpus/lessons/round-91.md` (the wave's `K91ScribeLesson` seat writes it) must carry a row inside `## Coverage map`, e.g.
  `` | `lessons/round-91.md` | Round-91 receipt-bind v5: the bounded-external-read class (device/FIFO/directory/over-cap refusal with the empty and at-cap twins), the 56-arm two-context scorer, the kill-rule constructions, and the mined mistakes | LOG.md round 91; `.ufo/waves/round-91/` | ``
  placed **after line 267** (before `## Known gaps` at `corpus/README.md:269`).
* **The missing row for the r90 spot-check** is the F2/F1 repair:
  `` | `lessons/round-90-verifier-spotcheck.md` | Non-author round-90 verifier spotcheck | Closure artifact; adopted by spotcheck-adopt | ``
  (the sibling rows for r87/r88/r89 exist at `corpus/README.md:255-265`; G9 shows `lessons/round-89-verifier-spotcheck.md` at 265).
* `## Frontier` opens at **`corpus/README.md:359`** (G9). If the r91 knowledge entry adds a frontier line, it goes there — see §1.10.

### 1.9 `.ufo/pins/readme-map.json` — the `covered` set

* The `covered` array ends at `.ufo/pins/readme-map.json:233` (`"lessons/round-90.md"`); the r89 pair sits at 228/231 (G10). The registry is **version 2** and append-only in practice.
* **Two entries must be added**: `"lessons/round-90-verifier-spotcheck.md"` (F2) and `"lessons/round-91.md"` (plus any new knowledge file the r91 scribe lands, e.g. `"knowledge/receipt-bounded-external-reads.md"`).
* `scripts/spotcheck-adopt.mjs` performs the first of these automatically (its `--adopt` path writes the README row *and* the pin, journalled, pre-image rollback). Use it rather than hand-editing — but the README row for the **round-91 lesson** is yours to add.

### 1.10 `PROVINCE.md`

* `PROVINCE.md` has **no `receipt-bind` mention at all** (G11) — the lane's `receipt-bind` surface lives in the *Core* band (`PROVINCE.md:15`: "The lane's own instruments `scripts/*.mjs` (registry: `SKILL.md` §Gate registry) and its learning registry `corpus/SOURCES.md` …"), so **no PROVINCE edit is required** for v5.
* If the r91 knowledge entry is a *frontier* advance (the plan's §Frontier step: open `fifo(7)` / `open(2)` / the Node `fs` docs), then append a dated paragraph in the house style of the last one (`PROVINCE.md:50-57`, "Round-80 frontier addition (2026-11-04; the bands above stand unchanged): …"). Precedent wording: "Round-91 frontier addition (2026-11-05; the bands above stand unchanged): …".

### 1.11 `README.md` (lane root)

* **`README.md` contains no `receipt-bind` row** (G12 — `grep -n receipt README.md` exits 1). It is a 14-line stub listing `SKILL.md` / `PROVINCE.md` / `corpus/`. **No edit.** If "README map rows" in the brief means the corpus coverage map, that is `corpus/README.md` (§1.8) plus `.ufo/pins/readme-map.json` (§1.9).

### 1.12 `LOG.md`

* The r90 entry is at **`LOG.md:3104`** (`## Round 90 — receipt-bind v4: …`), with the gate-required one-line record at **`LOG.md:3108`** (G13): `- 2026-11-05 — round 90 (gate-required one-line record; the full entry is the section above): …`.
* **v5 must add**: a `## Round 91 — receipt-bind v5: …` section (above the r90 section, i.e. after `LOG.md:3112`), **and** a one-line record of the exact shape `- YYYY-MM-DD — round 91 (gate-required one-line record; …): …` — `round-gate` matches `^- \d{4}-\d{2}-\d{2} — round 91\b` and reports `LOG_ENTRY_MISSING` without it (R14).

### 1.13 `scripts/receipt-bind.mjs` (the instrument itself)

* Header contract line at **`scripts/receipt-bind.mjs:5`** (`kumitate-receipt-bind-v4`), the `CONTRACT` constant at **:96**, `MAX_RECEIPT_BYTES = 1048576` at **:97** (unchanged in v5 — that is the *receipt* cap, a different class).
* The external branch to rewrite is **`scripts/receipt-bind.mjs:370-372`** (G14): `lstatSync(abs)` → symlink check → `readFileSync(abs)`. v5 replaces it with `openSync(abs, O_RDONLY|O_NOFOLLOW|O_NONBLOCK)` → `fstatSync(fd)` → `!xst.isFile()` → `FAIL-CLOSED UNRESOLVED` → `xst.size > MAX_INSTRUMENT_BYTES` → `FAIL-CLOSED UNRESOLVED` → `readFileSync(fd)` → `closeSync(fd)` in a `finally`.
* `MAX_INSTRUMENT_BYTES = 16777216` is a **new** constant (the worktree candidate has it at `:111`); the receipt cap `MAX_RECEIPT_BYTES` stays at 1048576 (`:97`).
* The `pin.receipt-bind` sha in `SCORECARD.md:338` must be re-pinned to this file's new sha (§1.4).

---

## 2. Making `.ufo/waves/round-90/K90ExecClose/run-close90.mjs` a round-91 runner

I diffed the round-90 runner against the runner already drafted for r91
(`.ufo/waves/round-91/close-runner/run-close91.mjs`, another seat's file — read-only for me). The
complete set of edits is **five**, all mechanical; the r91 draft already contains all five.

| # | file:line (r90 runner) | edit | why |
|---|---|---|---|
| **E1** | `:80` | `const ROUND = '90';` → `'91';` | drives the probe path (`PROBE`, `:109`), the default work dir (`:106`), `round-gate --round` (`:178`) and `plan-before-ready --round` (`:179`) — the last two are correct-by-construction once `ROUND` is 91 |
| **E2** | `:168` and `:169` | add `'--alt', '/fast/scratch/hyaku'` to the probe argv of **both** `probe1` and `probe2` | **probe91 requires `--alt`** (`probe91-c1.mjs:108` → `failClosed('ALT_REQUIRED')`; the usage line is `probe91-c1.mjs:73`). Without it the probe exits 2 with `C91_C1: FAIL-CLOSED ALT_REQUIRED` and the close case fails. `--alt` must be a path that is **not** under `--work` — probe91 context B builds its fixtures under `--alt/r-<rand>` and sets `TMPDIR=--alt/t-<rand>` (`probe91-c1.mjs:146-150`) so that the candidate cannot key on the `--work` path; the probe removes both its temp dirs itself (`:833-834`) |
| **E3** | `:239` | `const probeLine = (s) => (s.match(/^C90_C1: .*$/m) || ['C90_C1: none'])[0];` → `/^C91_C1: .*$/m` / `'C91_C1: none'` | the label changed; the runner's `PROBE1`/`PROBE2`/`PROBE_DETERMINISM` lines and the `probeSame` comparison all key on this regex |
| **E4** | `:3`, `:6`, `:82`, plus the prose at `:19`, `:21`, `:41`, `:72`, `:237` | `run-close90.mjs` → `run-close91.mjs`; `C90_C1:` → `C91_C1:`; `probe90-c1.mjs` → `probe91-c1.mjs` | header/usage/prose must name the round-91 artefacts |
| **E5** | `:186` | `CASE_TIMEOUT_MS` — keep `{ probe1: 1800000, probe2: 1800000, checklists: 2400000 }` | probe91 does **two** fixture contexts per invocation, so each probe run is ~2× the round-90 cost. Measured here: 50.6 s for the base v4 (which blocks on the FIFO) and 8.5 s for the v5 candidate, single-context; the runner's 30-minute per-case budget is ample. `checklists` runs 46 SKILL items with their own 120 s budget each — unchanged |

**Not changed (deliberately, and worth stating):**

* The **case list and order** stay `probe1, probe2, selftest, checklists, proxy, sources, source-capture, census, counter-pins, readme-map, round-gate, plan-before-ready, bind` (13 cases). The r91 probe is *one* frozen scorer with two internal contexts; the runner still runs it twice for the two-run determinism check.
* `checklist-items.txt` is still written **after** the `bind` case (`r90:250-252`, `:271`): receipt-bind tallies *every* `*.txt` directly under `--dir`, so a fieldless index file would flip the bind verdict to DRIFT and break the count guard.
* `bind` remains the **last** case, one text-mode run, guard `matched+mismatched+unchecked == cases-1 == 12`.
* `--tool` still defaults to `<lane>/scripts/receipt-bind.mjs` (the integrated v5) and `--work` defaults to `HYAKU_SCRATCH/kumitate-r91/close-work`.

**Two hazards the r91 runner inherits (must be handled by the close seat):**

* **`OUT_EXISTS`** (r90 runner `:124`): `.ufo/waves/round-91/close/` **already exists** (empty, created 17:45:24 by the wave scaffolding — same second as `open/`). I ran the drafted r91 runner against it and got `RUN_CLOSE: REFUSED OUT_EXISTS …`, exit 3, nothing written (R12/R13). The close seat must `rmdir` the empty dir (it is untracked — `git ls-files` on it is empty) or pass a different `--out`.
* **`plan-before-ready` and `readme-map` are red for the F1/F2 reason**, and **`proxy-check` is red for the F3 reason**. The runner treats a non-zero case exit as a failed run (`ok` requires every case exit 0, `r90:291-294`), so the close battery exits 1 until those are repaired.

---

## 3. `SCORECARD.md` `## Capabilities` — the `receipt-bind` row(s) and the v5 row format

**Quote: there is no `receipt-bind` row.** `## Capabilities` opens at `SCORECARD.md:1958` (G6);
the grep `^| .*receipt-bind` over `SCORECARD.md` returns **only**:
* `SCORECARD.md:474` — Move-log row `| 90 | … capability acquisition \`receipt-bind\` v4 — **UNMET**, rejected-honest-stop by the frozen kill rule; no capability row) |`
* `SCORECARD.md:475` — Move-log row `| 89 | … \`receipt-bind\` v3 — **UNMET** … no capability row) |`
* `SCORECARD.md:4325` / `:4387` — historical accounting lines (`pin.receipt-bind` re-pinned).

The table's own header (G6, `SCORECARD.md:1960-1961`) is:

```
| Capability | What it can now do | Evidence pointer | First-working round |
|---|---|---|---|
```

and its rule line reads: *"Rows enter only through a round that demonstrates the capability running (`AXES.md` §Capabilities); none enter through this rollout."* (`AXES.md` does not exist in the lane — G/R8 note; the operative rule for the lane is the plan's "SCORECARD capability row only if the predicate holds and the kill rule does not fire".)

**Row format a v5 row must follow** — copy the last verified capability row,
`| \`counter-receipt\` v3 *(verified round 86)* |` at `SCORECARD.md:1993` (G6):

```
| `receipt-bind` v5 *(verified round 91)* | Bind every close receipt in a directory to the instrument its own `cmd=` names, at a judged revision, with bounded external reads: an absolute instrument outside the lane is opened `O_RDONLY|O_NOFOLLOW|O_NONBLOCK`, the descriptor is `fstat`ed, a non-regular file (character device, FIFO, directory) or a regular file larger than 16777216 bytes is `FAIL-CLOSED UNRESOLVED` within 20 s under a 2 GiB address-space limit, and the bytes are read from that descriptor; an empty external file and one of exactly 16777216 bytes still bind `CLEAN external=1`; the receipt itself is read from one `O_NOFOLLOW` descriptor; symlinked receipt / missing dir / unresolvable rev / unresolvable instrument all fail closed; read-only, never executes receipt bytes | `node .ufo/waves/round-91/probe/probe91-c1.mjs --lane . --work <scratch> --alt /fast/scratch/hyaku --rev <M> --tool scripts/receipt-bind.mjs` → `C91_C1: HELD held=56/56` exit 0 twice (`.ufo/waves/round-91/close/probe1.txt`, `close/probe2.txt`, `RUN_CLOSE: PROBE_DETERMINISM SAME`); `--selftest` → `RECEIPT_BIND_SELFTEST: PASS held=83/83`; `pin.receipt-bind` = `<sha256>` in `kumitate-gate-pins-v1` | 91 |
```

If the kill rule fires (any tool at 56/56 that is wrong on a declared class), **no row is added** —
the row is then replaced by the honest Move-log entry only, exactly as rounds 89 and 90 did.

---

## 4. Ordered close checklist (what the integrator must do, in order)

1. **Repair the red map first (F1/F2/F4)** — before anything else, because `plan-before-ready`'s
   map arm judges `git archive <PLAN commit>` and the *live* map arm is also red:
   * `node scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-90-verifier-spotcheck.md`
     (writes the `corpus/README.md` row **and** the `.ufo/pins/readme-map.json` pin, journalled).
     **Already done in the worktree by another seat while I was reconning** (R16): the live gate
     now reads `README_MAP: CLEAN files=231 rows=231 covered=231`. **It must still be committed.**
   * ⚠️ **That alone does not fix `plan-before-ready --round 91`.** The map arm judges the *frozen
     plan commit* `2b1b8bf3`, whose tree still lacks the row — verified after the adoption (R16b)
     — so the arm can only be fixed by an **amend/re-commit of the plan** (the r88/r90 precedent
     adopted the predecessor's spot-check *inside* the freeze commit: `114877a3`
     `corpus/README.md | 1 +`; `b67fa963` `.ufo/pins/readme-map.json | 3 +-`). The plan file
     itself is **not** mine to amend and the probe sha `3bd88e8e…` is frozen — **this needs the
     L1's decision**; see §5.
   * Then bump `SCORECARD.md:299-300` to `C2=231` / `C2_total=231` (F4). The derived pair is now
     231/231 (R16c) but the declared pair is still 230/230 — `proxy-check --strict` will report
     `C2_DRIFT`/`C2_total_DRIFT` until it is bumped.
2. **Restore the origin pin clone (F3)** so `proxy-check --strict` can run:
   the pin's own `recreate` recipe (`.ufo/pins/origin.json`) is
   `git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/hyaku/kumitate-pin/src && git -C /fast/scratch/hyaku/kumitate-pin/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/hyaku/kumitate-pin/src`.
   The origin repo and that revision are both present on this host (verified). Without it the
   `proxy` close case exits 2 (`SRC_NOT_A_DIR`) regardless of the v5 work.
3. **Integrate v5** (`scripts/receipt-bind.mjs`), measure at M, and **re-pin**
   `SCORECARD.md:338` `pin.receipt-bind` to the v5 sha.
4. **Land the doc edits**: `SKILL.md:646` + `SKILL.md:763` (§1.1–1.2), `SCORECARD.md:299-300`
   (§1.5), `| 91 |` Move-log row + a `## Planned` round-92 line (§1.6), `corpus/README.md` rows
   (§1.8), `.ufo/pins/readme-map.json` (§1.9), `LOG.md` section + one-line record (§1.12), and
   — only if the predicate holds and the kill rule is silent — the `## Capabilities` row (§1.7).
5. **Close battery**: `rmdir .ufo/waves/round-91/close` first (F6), then run the r91 runner with
   `--alt /fast/scratch/hyaku`, `--out <lane>/.ufo/waves/round-91/close`, `--work <scratch>`.
   Expect `plan-before-ready` to stay red until §5 is resolved.
6. **Repair the round-gate rows (F7)** in the same close commit: the fleet report
   `/home/vgpnk/Projects/shokunin/.ufo/reports/round-91/kumitate.md` (filed by the fleet side — not
   the lane's), the `| 91 |` SCORECARD row, the `- YYYY-MM-DD — round 91` LOG line.

---

## 5. Open items I could not resolve (decisions, not gaps)

* **The `plan-before-ready` map arm cannot be repaired by a later commit.** It judges
  `git archive 2b1b8bf3` (R1: `plan=2b1b8bf3…`), and that tree is red (R4: `README_MAP: DRIFT …
  first=uncovered:lessons/round-90-verifier-spotcheck.md`). I re-verified this **after** the
  worktree adoption landed and the live map went green — the arm is still red (R16b). Only
  re-committing the plan with the row present fixes it — but the plan is frozen and the probe sha
  is frozen, so that is an L1 decision (amend the freeze commit, or accept a red
  `plan-before-ready` case and route it, as round 90 routed its equivalent). **My seat is
  read-only; I did not amend anything.**
* Whether the round-91 close reports **HELD** or **UNMET** depends on the kill rule, which is a
  reviewer/critic-seat judgement, not mine. My measurements only show that the *worktree candidate*
  is at 56/56 (R10) and that the *base v4* is at 52/56 with exactly the four declared-class arms
  failing (R9, matching the committed `controls/table.txt` row `base-v4-at-rev`).

## 6. Files I produced

* `.ufo/waves/round-91/K91Scout/recon.md` — this document.
* `.ufo/waves/round-91/K91Scout/greps.txt` — the `grep -n` receipts G1–G15.
* `.ufo/waves/round-91/K91Scout/receipts-pbr-map.txt` — the live command receipts R1–R14.
* Probe transcripts (scratch, not citable): `/fast/scratch/hyaku/kumitate-r91/K91Scout/probe-base-v4.txt`,
  `…/probe-cand-worktree.txt`.
