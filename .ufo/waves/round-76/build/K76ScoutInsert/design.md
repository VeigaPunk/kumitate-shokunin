# K76ScoutInsert — insertion map for C1 (`coverage:omp`) and C2 (`spotcheck-adopt`)

Read-only reconnaissance. Every line number is anchored at the frozen commit
**`cabc7aefd5f1562299f757e23207710c12e4ed58`** in a `git clone --shared` of the lane under
`/fast/scratch/hyaku/kumitate-r76/K76ScoutInsert/lane` (`git rev-parse --show-toplevel` =
`/fast/scratch/hyaku/kumitate-r76/K76ScoutInsert/lane`, `git status --porcelain` empty). No file of
the lane was written; this seat produced two markdown files under `.ufo/waves/round-76/`.

Host: Linux 7.2.11-arch1-1 x86_64, node v24.21.0. Tool installs: **none** (no tool was needed).

---

## 0. Base measurements I actually ran (paste-ready, at `cabc7ae`)

```
$ node scripts/omp-census.mjs
OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64 findings=0 bound=35/35)      # exit 0

$ node scripts/readme-map.mjs | tail -2
README_MAP: note unpinned:lessons/round-75-verifier-spotcheck.md
README_MAP: DRIFT files=182 rows=181 covered=181 bad=2 first=uncovered:lessons/round-75-verifier-spotcheck.md   # exit 1

$ node scripts/proxy-check.mjs --strict | tail -2
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=181 computed=182 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)   # exit 1

$ node scripts/proxy-check.mjs --selftest | tail -2
PROXY_SELFTEST: 132/132 pass
VERDICT: PASS                                                                          # exit 0  → base n = 132

$ node scripts/proxy-check.mjs --json | grep -c '"coverage_omp"'    → 0
$ node scripts/proxy-check.mjs --json | grep -n  '"coverage_kimi"'
40:    "coverage_kimi": 10,
98:      "coverage_kimi": "10",                                                             ← THE ECHO PROBLEM (§1.10)
$ node scripts/proxy-check.mjs --json  →  terms keys 24, declared keys 23

$ grep -c '^| O1 |' SCORECARD.md                          → 0
$ ls corpus/lessons | grep -c verifier-spotcheck          → 42
$ grep -cE '^\| `lessons/[^`]*verifier-spotcheck\.md`' corpus/README.md → 41
$ grep -c verifier-spotcheck .ufo/pins/readme-map.json    → 41
   → exactly one spotcheck file lacks BOTH sides: lessons/round-75-verifier-spotcheck.md
$ readme rows 181; last `lessons/` row is line 306 (`lessons/round-75.md`); line 307 is
  `knowledge/replay-output-isolation-link-following.md`
$ pin.covered 181 entries, ASCII-sorted (zero position diffs vs sort()); round-75.md at index 177
$ node scripts/cite-check.mjs  → CITE_CHECK: DRIFT (files=187 tokens=13047 errors=1959 warnings=886) exit 1
$ grep -c '^export ' scripts/omp-census.mjs → 0 ; scripts/readme-map.mjs → 0
```

---

## 1. C1 map — `coverage:omp` as registry family `O1`

Three files, in this order (constants → derivation → CLI → fixtures). Line numbers are the
insertion anchors in the base file.

### 1.1 `scripts/omp-census.mjs` — exports only (CLI, verdicts, `isMain` untouched)

| # | anchor | change |
|---|---|---|
| 1 | `:56` `const BASE_MEMBERS = [` | `export const BASE_MEMBERS = [` |
| 2 | `:92` `const CHAIN_FAMILIES = [` | `export const CHAIN_FAMILIES = [` |
| 3 | `:108` `const DECLARED_NAMES = [...]` | `export const DECLARED_NAMES = [...]` |
| 4 | `:199` `function census(root, noteText) {` | `export function census(root, noteText) {` |

Nothing else. `isMain` (`:567-570`), `parseArgs` (`:254`), `runCensus` (`:287`) and every verdict
string stay byte-identical, so `pin.omp-census` changes **only** because the file bytes changed —
re-pin it in the same commit (`kumitate-gate-pins-v1` line 317).

Two facts the proxy must respect, both from this file:
- `census()` **throws** for a non-directory/missing root: `readShape` `:139-148` does
  `lstatSync(root)`, throws `ENOTDIR` (`root is not a directory: …`) or lets `ENOENT` escape.
  So the proxy pre-guards with `statKind` + `readdirSync`; it never depends on the message text.
- `counts` is `:244` `{ entries, base, families, bound, declared }`. `O_members = counts.entries`
  (measured 64), `O_bound = counts.bound` (measured 35), `O_findings = findings.length` (measured 0).
  Do **not** use `counts.declared` (35) as `O_members`.
- Fixture notes that do not bind every declared name push `NOTE_UNBOUND` **into `findings`** (`:236`),
  not into `infos` — a fixture note must therefore be `DECLARED_NAMES.join('\n')` or the fixture can
  never read `O_findings=0`.

### 1.2 `scripts/proxy-check.mjs` — constants

| # | anchor | change |
|---|---|---|
| 5 | `:500` after `DEFAULT_KIMI_ROOT` | `const DEFAULT_OMP_ROOT = process.env.OMP_AGENT_ROOT \|\| join(homedir(), '.omp', 'agent');` — `OMP_AGENT_ROOT` is read by **no** code today (`grep -rn OMP_AGENT_ROOT scripts/` → empty); this is a new, additive default and the only env name the plan fixes |
| 6 | `:508-511` `TERM_KEYS` | **unchanged** (17 keys). Add a sibling *after* it, before `:521`: `const O_TERM_KEYS = ['C1o', 'C1o_total', 'O_members', 'O_findings', 'O_bound', 'coverage_omp'];` |
| 7 | `:521` `const STANZA_KEYS = [...TERM_KEYS, ...Object.keys(PINS)];` | `= [...TERM_KEYS, ...O_TERM_KEYS, ...Object.keys(PINS)]` (23 → 29 keys) |
| 8 | `:548` end of `GATE_PINS` | append `'pin.spotcheck-adopt': 'scripts/spotcheck-adopt.mjs',` — **`GATE_PINS`, never `PINS` (`:513` stays the frozen 6)** |
| 9 | `:551-557` `AXIS_ROWS` | append `{ axis: 'coverage:omp', term: 'coverage_omp' },` → six rows; `compareAxes` `:1258` needs no edit |
| 10 | `:577` after `RE_K_ROW` (`:576`) | `const RE_O_ROW = /^\| O\d+ \|/;` — reuse `registryCounts(text, RE_O_ROW)` (`:806`), whose 4th cell test `(cells[4] ?? '').trim().startsWith('yes')` is exactly the plan's "fourth cell starts `yes`" |
| 11 | `:631` `FINDING_KINDS` | add `'O_MEMBERS_DRIFT', 'O_FINDINGS_DRIFT', 'COVERAGE_OMP_DRIFT'` **only together with a fixture that fires each** (meta-case `:3099` fails otherwise) |
| 12 | `:640` `FAIL_CLOSED_KINDS` | add `'OMP_ROOT_NOT_A_DIR', 'OMP_NOTE_MISSING'` (meta-case `:3103`) |
| 13 | `:648` USAGE usage line, `:660-664` "the five scores", `:699-702` options | add `[--omp-root DIR]`; say six scores and name `coverage:omp`; document `--omp-root DIR` next to `--kimi-root DIR` |

### 1.3 derivation — reuse the existing score function, add no second formula

| # | anchor | change |
|---|---|---|
| 14 | `:1002` after `kTerms` | new `oTerms({ scorecardText, ompRoot, noteText })`: `const oreg = registryCounts(scorecardText, RE_O_ROW); const c = census(ompRoot, noteText); const m = c.counts.entries, f = c.findings.length;` and `coverage_omp: layerCoverage(oreg.covered, oreg.total, m - f, m)`. `layerCoverage` `:839-842` is literally `Math.floor(10*(covered/total)*(sections/members))` with `total===0 \|\| members===0 → 0`, i.e. the plan's registered formula including "a zero denominator scores 0, never NaN" |
| 15 | `:1019-1035` `deriveTerms` | accept `omp: { root, noteText }` and spread `...oTerms(...)` after `...k.terms` (`:1033`) |

### 1.4 `runCheck` (`:1340`) — gather and fail-closed

| # | anchor | change |
|---|---|---|
| 16 | after the kimi guards (`:1352-1359`), before `scorecardText` (`:1360`) | `OMP_ROOT_NOT_A_DIR` arm: `if (statKind(opts.ompRoot) !== 'dir') return failClosed(opts,'OMP_ROOT_NOT_A_DIR', \`--omp-root ${opts.ompRoot} is ${statKind(opts.ompRoot)}\`, {}, started);` plus the `try { readdirSync(opts.ompRoot) } catch → same token` mirror of `:1356-1359` |
| 17 | after `notes` (`:1389-1395`) | `OMP_NOTE_MISSING` arm: `const ompNote = join(opts.self,'corpus','knowledge','omp-agent-root.md'); const ompNoteText = readText(ompNote); if (ompNoteText === null) return failClosed(opts,'OMP_NOTE_MISSING', \`${ompNote} is ${statKind(ompNote)}\`, {}, started);` |
| 18 | `:1411` after `const kimi = kMembers(opts.kimiRoot);` | `const omp = { root: opts.ompRoot, noteText: ompNoteText };` and pass `omp` into the `deriveTerms({...})` call (`:1413-1415`) |

**Ordering constraint (hard):** the `--omp-root` arm must sit **after** the `--kimi-root` arm
(`:1352`). The two existing `KIMI_ROOT_NOT_A_DIR` cases (`:2709-2710`) pass `--self`+`--src` and no
`--omp-root`; keeping kimi first means they still hit kimi.

### 1.5 JSON body and the `declared` echo

| # | anchor | change |
|---|---|---|
| 19 | `:1438` body, `:1324` `failClosed` body | add `ompRoot: opts.ompRoot,` directly after `kimiRoot: opts.kimiRoot,` in both |
| 20 | `:1445` `declared: stanza.values,` | `declared: Object.fromEntries(Object.entries(stanza.values).filter(([k]) => !O_TERM_KEYS.includes(k))),` |

**Why 20 is mandatory (measurement, not taste).** `--json` echoes every stanza key inside
`terms.declared`, so each term key appears **twice** in the pretty-printed output — measured at base:
`"coverage_kimi": 10,` (line 40) and `"coverage_kimi": "10",` (line 98); `grep -c` therefore reads
**2**. With `declared` echoing the O keys, predicate (a)'s `grep -c '"coverage_omp"' → 1` would read
**2** and the claim would read as a miss. Filtering keeps every existing `declared` assertion alive
(`j.terms.declared.S_sections` `:1814`, `.coverage_script`, `.C1k_total`, `.K_members`,
`.coverage_kimi` `:1815-1816`, `t.declared.S_members`/`.coverage_runtime` `:1831`,
`j.terms.declared.C1k`/`.coverage_kimi` `:2164-2165`) and yields exactly one `"coverage_omp"` line:
`terms.coverage_omp`.

Resulting JSON keys (exact): `terms.C1o`, `terms.C1o_total`, `terms.O_members`, `terms.O_findings`,
`terms.O_bound`, `terms.coverage_omp`, and top-level `ompRoot`.

### 1.6 comparison

| # | anchor | change |
|---|---|---|
| 21 | `:1156-1173` `compareTerms` | keep the `TERM_KEYS` loop verbatim; add a **second loop over `O_TERM_KEYS`** with the same body (kind `${key.toUpperCase()}_DRIFT` → `O_MEMBERS_DRIFT`, `O_FINDINGS_DRIFT`, `O_BOUND_DRIFT`, `COVERAGE_OMP_DRIFT`, `C1O_DRIFT`, `C1O_TOTAL_DRIFT`; the `C1o → C1O_` capitalisation matches the existing `C1k → C1K_DRIFT`). One loop = one mutant branch. |

`compareAxes` (`:1258`), `summarize` (`:1279`), `comparePins` (`:1175`) and `compareGatePins`
(`:1199`) need no edit.

### 1.7 verdict line — nothing is mandatory; if extended, 10 literals move

Plan (b) requires only `PROXY: MATCH` + the stanza/axes contents, so `renderVerdict` (`:1297-1306`)
**may stay untouched**. If the executor wants the O group on the line, the exact fragment is
(inserted after the K group, before `pins=`):

```
+ ` O=${terms.O_bound}/${terms.O_members} findings=${terms.O_findings} coverage:omp=${terms.coverage_omp};`
```

and these byte-exact literals must change in the same edit — **10 sites**:
`:1756`, `:1766`, `:1772`, `:1873`, `:2155`, `:2477`, `:2647`, `:2688`, `:2788` (`F1_MATCH`, reused
by `:2791`/`:2796`/`:2803`/`:2996` and by `P1_VERDICT` at `:2937`).
**Recommendation: do not touch the verdict line.** Extending it buys nothing the plan asks for and
converts the highest-traffic selftest literals into churn.

### 1.8 `parseArgs` (`:3125`)

| # | anchor | change |
|---|---|---|
| 22 | `:3135` after `kimiRoot: DEFAULT_KIMI_ROOT,` | `ompRoot: DEFAULT_OMP_ROOT,` |
| 23 | after the `--kimi-root` branch (`:3150`) | `else if (a === '--omp-root') opts.ompRoot = dirValue(a, next());` — `dirValue` (`:3140-3145`) already rejects empty/flag values, so `--omp-root --json` exits 64 with `--omp-root requires …` for free |

### 1.9 selftest fixture layer

**Current shape (so the executor edits, not guesses):** `fixtureKimi` `:1521-1525`,
`FX_KIMI_FILES` `:1505-1513`, `FX_KIMI_DIRS` `:1515`, `fxReadme` `:1562`, `fxScorecard` `:1577-1605`,
`selfTest` `:1623`, `fxBase` `:1669-1707`, `args` `:1709-1716`, `F1` `:1718`, `F2` `:1724`,
`F3` `:1732`, `fc` helper `:2703-2710`, meta-cases `:3099`/`:3103`, base **n = 132**.

| # | anchor | change |
|---|---|---|
| 24 | near `:1521` | new `FX_OMP_FILES` (base members + one chain generation + one sidecar, e.g. `agent.db`, `config.yml`, `history.db`, `RULES.md`, `agent.db.pre-restore-20260101T010101Z`, `agent.db-wal`) and `function fixtureOmp(root)` modelled on `fixtureKimi` (`mkdirSync` dirs, `writeFileSync(p,'',{mode})`, `chmodSync`) |
| 25 | `:1669-1707` `fxBase` | `const omp = knobs.ompRoot === false ? null : fxDir(\`${name}-omp\`); if (omp !== null) fixtureOmp(omp);` + `fxWrite(join(dir,'corpus','knowledge','omp-agent-root.md'), DECLARED_NAMES.join('\n'));` + `omp` on the `fx` object + default `expect: { C1o: 0, C1o_total: 0, O_members: <fixture count>, O_findings: 0, O_bound: DECLARED_NAMES.length, coverage_omp: 0, … }` |
| 26 | `:1593-1597` `fxScorecard` axes block | append `` `| coverage:omp | ${expect.coverage_omp} | fixture | round 76 |`, `` |
| 27 | `:1599` `for (const k of TERM_KEYS) lines.push(...)` | `for (const k of [...TERM_KEYS, ...O_TERM_KEYS]) lines.push(\`${k}=${expect[k]}\`);` |
| 28 | `:1709-1716` `args` | inject the OMP root exactly like the kimi root: `const ompRoot = fx.omp ?? join(fx.dir,'..','no-omp-root');` and build `['--kimi-root', kimiRoot, '--omp-root', ompRoot, ...base]`, preserving both "an explicit value in `extra` wins" branches |

`args(...)` call sites: **86 uses** (87 occurrences of `args(`; the 87th is the definition at
`:1709`); 65 of them are the direct `runProxy(args(…))` form, the rest are `[...args(P4), …]` spreads
and `fc(…, args(K_BAD_VALUE), …)`. Injecting at `:1709` covers all 86.

**Sites that reach derivation WITHOUT `args()` and must gain `--omp-root`** (otherwise the live
`~/.omp/agent` is stat'd: a live-path read inside a "hermetic" suite, and every such case flips to
`O_MEMBERS_DRIFT`):

| site | line | why it matters |
|---|---|---|
| `d2` | `:2448` | asserts `kindsEq(d2, ['A_DRIFT'])` — a strict array equality, so any O drift breaks it |
| `bareProxy` | `:2786-2789` (uses `:2791`, `:2796`, `:2803`) | asserts `F1_MATCH` |
| `P1_ARGS` | `:2931` (`p1` `:2932`, `p1j` `:2935`, `P1_VERDICT` `:2937`) | asserts MATCH + `src-rev=` |
| `p2` `:2955`, `p3` `:2970`, `p3b` `:2982` | fail before derivation (`SRC_REV_MISMATCH`/`SRC_REV_UNVERIFIABLE`/`SRC_NOT_A_DIR`) | safe as-is; add the flag anyway for uniformity |
| `:2421` (`--kimi-root no-kimi-here`), `:2767` (`--self nope-nope`), `u1-u7` `:3019-3046` | fail before the OMP guard | safe as-is |

### 1.10 new selftest cases (base 132 → n ≥ 135; plan (f))

| case | construction | expected |
|---|---|---|
| `OMP_ROOT_NOT_A_DIR` (absent) | `['--self',F1.dir,'--src',F1.src,'--kimi-root',F1.kimi,'--omp-root',join(tmp,'nope-omp')]` | exit 2, `fcToken === 'OMP_ROOT_NOT_A_DIR'` |
| `OMP_ROOT_NOT_A_DIR` (file) | same with `join(F1.dir,'notes.txt')` | exit 2, same token |
| `OMP_NOTE_MISSING` | `fxBase('no-omp-note',{…})` then `rmSync(join(dir,'corpus','knowledge','omp-agent-root.md'))` | exit 2, `fcToken === 'OMP_NOTE_MISSING'` |
| O drift | `fxBase('omp-drift')` then write one bogus member (e.g. `stray.txt`) into its `-omp` dir **after** `fxBase` returns | exit 1, `kindsEq` = `['O_MEMBERS_DRIFT','O_FINDINGS_DRIFT','COVERAGE_OMP_DRIFT']` (order = `O_TERM_KEYS` order) |
| AXES drift | rewrite `\| coverage:omp \| 0 \|` → `\| coverage:omp \| 3 \|` in the fixture scorecard | exit 1, `kindsEq` = `['AXES_DRIFT']`, `f.key === 'coverage_omp'` |

Arms for the mutation receipts (one line each, kill by removing **that branch alone**):
(1) the `OMP_ROOT_NOT_A_DIR` guard, (2) the `OMP_NOTE_MISSING` guard, (3) the `O_TERM_KEYS` compare
loop, (4) the `AXIS_ROWS` `coverage:omp` entry, (5) the `declared` filter (kills predicate (a)'s
grep-1, not a selftest case — receipt it as a command, `--json | grep -c`).

### 1.11 Top three ways this change silently breaks an existing term, and detection

**R1 — the `declared` echo doubles `coverage_omp`.** Predicate (a)`grep -c '"coverage_omp"' → 1`
reads 2 unless `:1445` is filtered. *Detection:* `node scripts/proxy-check.mjs --json | grep -c
'"coverage_omp"'` must print `1` (control: the same command for `coverage_kimi` prints `2` at base,
measured above). **Symptom if missed:** every (a)–(c) number is right and the claim still reads as
an honest miss.

**R2 — putting the O keys into `TERM_KEYS`.** Two frozen selftest assertions go red:
`:1836` `TERM_KEYS.length === 17` and `:1840` `parentV1Keys` (the literal 23-key string compared
against `STANZA_KEYS.join(' ')` at `:1841`). Beyond that, `compareTerms` would then compare O keys in
`TERM_KEYS` order and every fixture that does not declare them would emit O drifts, turning
`kindsEq`'s exact-array assertions red in bulk. *Detection:* `--selftest` (it fails loudly), plus
`node -e` printing `TERM_KEYS.join(' ')` before/after — it must be unchanged.
**Consequence:** the `STANZA_KEYS` literal at `:1840` **must** be updated (23 → 29 keys, O keys
between `coverage_kimi` and `pin.cite-check`) — that is a legitimate update of a key-set assertion,
not a weakened one; `TERM_KEYS.length === 17` at `:1836` must then still pass.

**R3 — the O terms read the live `~/.omp/agent` inside the hermetic suite.** Any `runProxy(` call
that reaches `deriveTerms` without `--omp-root` stat's the operator's live root: the suite stops
being hermetic, `F1_MATCH`-style verdicts flip, and `d2`'s exact `['A_DRIFT']` breaks. *Detection:*
(a) run `--selftest` with `OMP_AGENT_ROOT=/nonexistent` — everything must still pass, which is true
only if no case relies on the default; (b) `grep -n 'runProxy(' scripts/proxy-check.mjs` and check
the four sites in §1.9. Note the existing hermeticity case (`:3056-3085`) scrubs `UFO_SRC` and
`KIMI_ROOT` but **not** `OMP_AGENT_ROOT`; extend that env block when the default lands.

---

## 2. C2 map — `scripts/spotcheck-adopt.mjs` (new) over the unchanged oracle

### 2.1 Contract and CLI

```
node scripts/spotcheck-adopt.mjs --check
node scripts/spotcheck-adopt.mjs --adopt <rel>
node scripts/spotcheck-adopt.mjs --predict <N>
node scripts/spotcheck-adopt.mjs --selftest
   [+ --readme FILE] [--registry FILE] [--corpus DIR]  (repeatable; pass-throughs to the oracle)
```
Exit map: `0` clean/adopted/already-adopted/predict-resolved · `1` drift (check finds an uncovered
spotcheck, or the post-write oracle is not CLEAN) · `2` refusal or fail-closed · `64` usage.
Contract id `kumitate-spotcheck-adopt-v1`.

Self-resolution must use the `readme-map.mjs` pattern: `const SELF = fileURLToPath(import.meta.url);
const LANE = resolve(dirname(SELF), '..')` (readme-map `:81-82`), oracle at
`join(dirname(SELF), 'readme-map.mjs')`, defaults `join(LANE,'.ufo/pins/readme-map.json')` /
`join(LANE,'corpus/README.md')` / `LANE/corpus/knowledge` + `LANE/corpus/lessons` (readme-map
`:83-85`, `:414-422`). That keeps the oracle resolvable from any scratch self copy.

### 2.2 The oracle child — exact invocation (measured surface, `readme-map.mjs:412-424`)

```js
spawnSync(process.execPath, [oracle,
  '--readme',   readmePath,
  '--registry', registryPath,
  '--corpus',   join(corpusRoot, 'knowledge'),
  '--corpus',   join(corpusRoot, 'lessons'),
], { encoding: 'utf8', timeout: 120_000 })
```
Three hard facts, all from the oracle source:
- all three paths are `resolve()`d against the **child's cwd** (`:417-419`) → pass **absolute** paths;
- `--corpus` values must have basename `knowledge` or `lessons` (`loadFiles` `:157-162`) → a scratch
  corpus must be laid out as `<x>/corpus/knowledge` + `<x>/corpus/lessons`;
- if only one `--corpus` is passed the other default is the **lane's** dir (`:424`) → always pass
  both, or the fixture silently mixes trees.
Verdict lines to relay verbatim: `README_MAP: CLEAN files=<n> rows=<n> covered=<n>` (exit 0),
`README_MAP: DRIFT … bad=<k> first=<item>` (exit 1), `README_MAP: FAIL-CLOSED reason=<why>` (exit 2).
For the drift case the oracle prints `README_MAP: note <item>` lines for `bad.slice(1)` (`emit`
`:246`) — a relay must not confuse a `note` line with the verdict line.

### 2.3 README insertion rule (measured, not assumed)

The table is **not** sorted — the first row already differs from `sort()` (index 0), and the
lessons block ends with round-69…round-75 rows (lines 295-306) followed by a late-appended
`knowledge/…` row (line 307). The rule that keeps the block together:

> Insert one row line **immediately after the last row line whose first cell is a backticked
> `lessons/` path** — here line 306 (`lessons/round-75.md`) → the new row becomes line 307.
> If no `lessons/` row exists, insert after the last `knowledge/` row. Never re-sort, never insert
> mid-block, never touch any other line.

Row template (deterministic; the tool cannot know a closure hash, so it must not invent one):

```
| `<rel>` | Non-author round-<N> verdict (adopted from the closure artifact; contents are the file's own) | `<rel>` |
```

Constraints that make this template safe, each measured:
- **no `S###`**: `cite-sources.mjs:26` `const ID_RE = /\bS[0-9]{3,}\b/g` scans every README row line
  and requires the id to be a live SOURCES row (`:36`). `S`+3 digits that is not a row → `DRIFT ghosts`.
- **only the file's own path as a backticked span**: `cite-check.mjs` censuses `corpus/**/*.md`
  (README included, `cite-check.mjs:316`) and resolves `lessons/x.md` **file-relative** to `corpus/`
  (`:47-52`), which exists after the file landed.
- **one row, no duplicate**: `loadRows` counts rows for the same path (`:190-196`) → `duplicate-row`.
- The adopt must *verify* this rather than assume it: run `node scripts/cite-check.mjs` and
  `node scripts/cite-sources.mjs` before and after and require `errors` / `ghosts` unchanged
  (base: `CITE_CHECK: DRIFT (files=187 tokens=13047 errors=1959 warnings=886)`).
  The new row adds exactly one token (`tokens` 13047 → 13048 is expected and only that).

### 2.4 Pin append rule (measured)

`.ufo/pins/readme-map.json` is **ASCII-sorted** (`sort()` position diff = none over 181 entries) and
`version: 2`, two-space indented entries, `"covered": [` … last entry without a trailing comma,
closing ` ]` (`readme-map.mjs:93-131` is the loader; header lines 70-76 state "the pin grows by
append when a file lands; the registry is never rewritten"). The rule:

> Insert the new path at its ASCII-sorted index — for `lessons/round-75-verifier-spotcheck.md` that
> is **before `lessons/round-75.md` (index 177 of 181)**, i.e. between `lessons/round-74.md` and
> `lessons/round-75.md` — as one `  "<path>",` line. Never reorder or rewrite other entries, never
> change `version`, never add a duplicate (`loadRegistry :118-127` fails closed on a duplicate).

Count parity required by the plan's (b): `files=182 rows=182 covered=182` — base is 182/181/181, so
exactly one row and one pin entry are added and nothing else moves.

### 2.5 States the tool must repair / report

| state | detection | action | line |
|---|---|---|---|
| both sides present | row set ∧ pin set contain `rel` | nothing; print `ALREADY_ADOPTED` | `SPOTCHECK_ADOPT: ALREADY_ADOPTED <rel> wrote=none` (bytes must be unchanged — sha256 before = after) |
| neither | row ∉, pin ∉ | write row then pin | `SPOTCHECK_ADOPT: ADOPTED <rel> wrote=both` |
| row present, pin missing | row ∈, pin ∉ | write pin only | `… ADOPTED <rel> wrote=pin` |
| pin present, row missing | pin ∈, row ∉ | write row only | `… ADOPTED <rel> wrote=row` |
then, **after any write**, run the oracle and relay its verdict line; `ADOPTED`/`ALREADY_ADOPTED` is
`exit 0` only when the oracle printed `README_MAP: CLEAN`.

`--check` enumerates `corpus/lessons/round-*-verifier-spotcheck.md` (`42` files measured), and prints
`SPOTCHECK_MAP: CLEAN spotchecks=42 uncovered=0` (exit 0) when both sides cover all of them; otherwise
`SPOTCHECK_MAP: DRIFT spotchecks=42 uncovered=<n> first=<rel>` + one line naming **each** uncovered
file (kill rule: "the check mode not naming an uncovered spotcheck file"), exit 1. At base this must
name exactly `lessons/round-75-verifier-spotcheck.md` (`missing row: [that file]; missing pin: [that
file]`, measured).

`--predict <N>`: `<rel> = corpus/lessons/round-<N>-verifier-spotcheck.md`;
`SPOTCHECK_PREDICT: COVERED <rel>` exit 0 when the file exists **and** both sides carry it, else
`SPOTCHECK_PREDICT: PENDING <rel>` exit 0 (a prediction, not a gate). Measured: `--predict 76` →
PENDING (file absent), `--predict 75` → COVERED after the repair.

### 2.6 Refusals (each exits 2 and writes **zero** bytes — sha256 of all three files unchanged)

| token | trigger (minimal set) |
|---|---|
| `REFUSED_OUT_OF_SCOPE` | any path whose normalised form is not `corpus/lessons/<leaf>`: `SCORECARD.md`, absolute paths, `knowledge/…`, `..` traversal, symlink whose realpath leaves `corpus/lessons`, a directory at the target |
| `REFUSED_NOT_SPOTCHECK` | under `corpus/lessons/` but leaf does not match `/^round-\d+-verifier-spotcheck\.md$/` (e.g. `corpus/lessons/round-75.md`) |
| `REFUSED_ABSENT` | the file does not exist / is not a regular file (`corpus/lessons/round-99-verifier-spotcheck.md`) |
| `FAIL-CLOSED` (reuse the oracle's tokens/reasons verbatim) | registry unreadable / not JSON / version ≠ 2 / covered not an array / malformed or duplicate covered entry; README unreadable; either corpus dir missing; zero `*.md` (readme-map `:93-179`, `:181-184`) |
| post-write not CLEAN | oracle exits 1 or 2 after the write → report the oracle line and exit non-zero; the pair is never "half adopted then reported clean" |
| duplicate on write | the row would be the second row for `rel`, or the pin entry would repeat → refuse (oracle would report `duplicate-row` / `FAIL-CLOSED`), do not write |

Implementation notes: compute both sides with the **same** row grammar the oracle uses
(`/^\|\s*`((?:knowledge|lessons)\/[^`]+)`\s*\|/`, `loadRows :136-140`), not a looser one, and read
the pin with `JSON.parse` + `version===2` (never regex the JSON). Write atomically enough that a
second `--adopt` reads byte-identical files: read both files into memory, compute the new text, then
`writeFileSync` once per changed file.

### 2.7 Selftest (`SPOTCHECK_ADOPT_SELFTEST: PASS (n/n)`, n ≥ 12)

Fixture per case: `mkdtemp` → `corpus/{knowledge,lessons}` + `corpus/README.md` + `reg.json`, then
invoke the adopt **as a child** with `--readme/--registry/--corpus`; assert the tool's own line and
the relayed oracle line. Minimum set (12): clean/already-adopted (bytes equal), adopt both, row-only,
pin-only, and the five refusal/fail-closed arms of §2.6, plus `--check` clean, `--check` naming one
uncovered file, `--predict PENDING`, `--predict COVERED`, idempotency (second run byte-identical).

---

## 3. Divergences: where the plan and the code disagree (verbatim)

**D1 — the control's token name is inverted.** Plan: "run against the base tool: it must be refused
(`STANZA_UNKNOWN_KEY`)". Code: `scripts/proxy-check.mjs:1081` emits
`return { ok: false, kind: 'STANZA_KEY_UNKNOWN', … }`, declared at `:643`, and the selftest asserts
`STANZA_KEY_UNKNOWN` (`:2542`, `:2718`, `:2745`). The base tool cannot print `STANZA_UNKNOWN_KEY`;
the control receipt must expect `STANZA_KEY_UNKNOWN` or it is unrunnable.

**D2 — predicate (a)'s grep count is unachievable with the current JSON shape.** Plan: "`node
scripts/proxy-check.mjs --json | grep -c '"coverage_omp"'` → **1**". Code: `:1445`
`declared: stanza.values,` echoes every stanza key, so each term appears twice — measured at base,
`"coverage_kimi": 10,` at output line 40 and `"coverage_kimi": "10",` at line 98, `grep -c` → 2.
One key would therefore read 2, not 1. The plan does not say to filter `declared`; §1.5 item 20 does,
and it is the only way to satisfy (a) literally.

**D3 — `omp-census` exports nothing today.** Plan: "exports its declared-member tables and its shape
decision for in-process import". Code: `grep -c '^export ' scripts/omp-census.mjs` → **0**. So
"contract `kumitate-omp-census-v1` unchanged" has to be read as CLI/verdict unchanged with the
module gaining exports — an addition the plan's C1 file scope allows, but it is a file-byte change
and therefore a `pin.omp-census` re-pin in the same commit (already pre-registered in the plan's
"routed repairs").

**D4 — "registry families (19 → 20 for S/R, plus K/O plane families)" does not parse.** Code/data:
`SCORECARD.md:121` reads `#### In-scope surface registry (19 families)` and 19 is exactly the S+R
rows (8 + 11); K1–K5 are 5 further rows and O1 will be a 24th row. Adding O1 leaves S+R at **19**,
so the table cannot read "20 families for S/R". The header is not gated by any script (only
`fxScorecard :1581` formats its own count from `registry.length`), so this is a prose decision for
the scribe: leave 19 (S/R) and say so, or restate the header as "19 S/R + K/O planes". Do not
mechanically write 20.

**D5 — C2 (b) and (e) put different text on the same line.** Plan (b): "exits 0 printing
`SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-75-verifier-spotcheck.md` followed by `README_MAP:
CLEAN files=182 rows=182 covered=182`"; plan (e): "fields `wrote=row|pin|both` on the `ADOPTED`
line". A byte-exact match of (b) and the `wrote=` field of (e) cannot both hold. Resolution used in
§2.5: `SPOTCHECK_ADOPT: ADOPTED <rel> wrote=<both|row|pin>` and (b) matches the **prefix**. The
verifier must be told this, or (b) reads as a miss.

**D6 — C1(b) is not reachable from C1's files alone.** Plan (b) requires `--strict` exit 0 `PROXY:
MATCH`. Measured at base: `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=181 computed=182
delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)`. The MATCH needs
C2's `C2_total` 181→182 (which restores `coverage` 9→10), C2's new script pinned in
`kumitate-gate-pins-v1`, and the re-measured `pin.omp-census` / `pin.proxy-check`. So the L1 must
integrate C2 (README row + pin + script + gate pin) **before** measuring C1(b), or C1(b) reads as a
miss for a reason that is not C1's.

**D7 — the oracle's own v2 doc lies about one branch (do not "fix" it; do not rely on it).**
`readme-map.mjs:224` is `statSync(full);` inside the symlink branch — `full` is undefined, so the
`ReferenceError` lands in the `catch` and **every** symlink reads `stale-covered:`, never the
`covered-not-file:` the header (`:44-49`) promises. `readme-map.mjs` stays byte-unchanged, so the
adopt tool must not depend on that distinction; it should refuse a symlink target itself
(§2.6 `REFUSED_OUT_OF_SCOPE`) rather than delegate the decision to the oracle.

---

## 4. Remaining unknowns (not resolvable from the lane at `cabc7ae`)

1. **The generated README row's prose.** The plan fixes the two-sided write, not the cell content;
   §2.3 proposes a deterministic template and a measurable safety test (no `S###`, only the file's
   own path backticked, `cite-check` `errors` unchanged). If the L1 prefers richer prose, the row
   becomes hand-curated and the tool would need the cells as arguments — which (b)'s argv does not
   provide.
2. **`--check`'s `spotchecks=<n>` definition.** 42 is the count of
   `corpus/lessons/round-*-verifier-spotcheck.md` at base; the plan fixes only `uncovered=0`. Any
   honest definition (files in scope) is compatible; the number must be stated in the report.
3. **Whether the verdict line should carry the O group.** The plan does not require it (§1.7); the
   decision is the executor's, with the 10-literal cost pre-computed.
4. **`O_members` under a `--omp-root` that is a symlink to a directory.** `statKind` (`:720`) is
   `stat`-based (`isDirectory` follows links) while `readShape` `:140` uses `lstat` and would throw
   `ENOTDIR`; the guard therefore passes and `census()` throws → the run must map that to
   `OMP_ROOT_NOT_A_DIR` (or `INTERNAL_ERROR`) rather than let the outer catch turn it into
   `INTERNAL_ERROR` silently. No base receipt covers this; flag it in the executor's report either
   way.
