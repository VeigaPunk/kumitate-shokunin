PROXY-PIN-MAP sites=16 at-risk-selftest-assertions=20

Scope: PIN v1 edit points in `scripts/proxy-check.mjs` at lane master 0614092e. Read-only; nothing edited. All line numbers are the current file.

## Observed facts

- No pin code exists yet: `grep -rn "SRC_REV|--pin|src-rev|origin-pin" scripts/*.mjs` → no hits; `.ufo/pins/` absent; baseline `.ufo/waves/round-36/baseline/proxy-pin.txt` is byte-identical to `proxy-default.txt` (no `src-rev=`), so `--pin` today is either ignored or was never wired.
- Selftest baseline: `selftest-proxy.txt` → `PROXY_SELFTEST: 109/109 pass`, `12 arms observed`.
- `spawnSync` is already imported (`scripts/proxy-check.mjs:240`), `existsSync` at `:242` — the git assertion needs **no new import**.
- `probeSections` is imported in process at `:251` and called exactly once, `scripts/proxy-check.mjs:1048`; it independently refuses a non-dir src (`scripts/claims-check.mjs:473`, kind `SRC_NOT_A_DIR`).
- Pin revision is the same 40-hex the clone resolves: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`.
- Hermetic git fixtures need no `git init`: a hand-built repo (`.git/HEAD` = `ref: refs/heads/main`, `.git/refs/heads/main` = 40 hex, **and** an `.git/objects/` dir) satisfies `git -C <dir> rev-parse HEAD` (exit 0, prints the hash). Without `.git/objects/` git says `fatal: not a git repository` (exit 128). Verified both.
- `walkFiles` prunes `.git`/`.ufo` (`scripts/claims-check.mjs:157`), so a fixture repo under `--src` does not perturb the S/R index.

## Site table

| # | Site | path:line | Current | PIN v1 change |
|---|---|---|---|---|
| S1 | header synopsis | scripts/proxy-check.mjs:7 | `[--src DIR] [--kimi-root DIR] [--json] [--strict]` | insert `[--pin FILE]` after `--src DIR` |
| S2 | header modes | scripts/proxy-check.mjs:53-60 | “recompute … the origin tree `--src`” | name pin resolution + `src-rev=` in default mode |
| S3 | verdict grammar | scripts/proxy-check.mjs:181-188 | `pins=<n> match)` / `PROXY: DRIFT (<KIND …>…)` | show `… match src-rev=<12 hex>)` and `(…; src-rev=<12 hex>)`; note “segment omitted with no pin” |
| S4 | fail-closed map | scripts/proxy-check.mjs:195-214 | 12-arm list, `SRC_NOT_A_DIR` prose at 200-203 | add `SRC_REV_MISMATCH`, `SRC_REV_UNVERIFIABLE` (+ optional `PIN_MALFORMED`) and their trigger order |
| S5 | bounds prose | scripts/proxy-check.mjs:216-222 | “no writes, no network, no subprocess, **no git**, no lock” | **must** change: pin adds one `git rev-parse` subprocess; also 223-227 “selftest reads no environment and no live tree” must say pin discovery is skipped in `--selftest` |
| S6 | exit-kind list | scripts/proxy-check.mjs:390-394 | 12 tokens | add the rev tokens (this list is the suite's coverage invariant) |
| S7 | USAGE synopsis | scripts/proxy-check.mjs:396 | `usage: node scripts/proxy-check.mjs [--self DIR] …` | add `[--pin FILE]` (regexes at 1411/2341 match the prefix, so safe) |
| S8 | USAGE options | scripts/proxy-check.mjs:427-430 | `--src DIR … a non-directory is refused as SRC_NOT_A_DIR (exit 2)` | add `--pin FILE` block (default `<self>/.ufo/pins/origin.json`; resolves src from `clone` when `--src` absent; mismatch ⇒ `SRC_REV_MISMATCH` exit 2) |
| S9 | renderVerdict | scripts/proxy-check.mjs:961-971 | MATCH literal `pins=${matched} match)\``; DRIFT `…join('; ')})\`` | 5th param `srcRev`; MATCH `+ \` pins=${matched} match${rev ? \` src-rev=${rev}\` : ''})\``; DRIFT `…join('; ')}${rev ? \`; src-rev=${rev}\` : ''})\`` (both no-pin branches byte-identical) |
| S10 | failClosed | scripts/proxy-check.mjs:975-996 | token at 988, line 995 `PROXY: FAIL-CLOSED (${token}) ${detail}` | **do not** move `token` or `(`; rev arms carry `pin=<rev12> src=<obs12>` inside `detail`; optionally add `pin`/`srcRev` beside `src` at 984 |
| S11 | src resolution + SRC_NOT_A_DIR | scripts/proxy-check.mjs:1001-1007 | stat `opts.src` at 1005-1006 | insert between 1004 and 1005: read+validate pin (→ `PIN_MALFORMED`/`SRC_REV_UNVERIFIABLE`), set `opts.src = resolve(pin.clone)` when `opts.src === null`, then the existing stat (an absent clone is truthfully `SRC_NOT_A_DIR`), then `git -C opts.src rev-parse HEAD` compare (→ `SRC_REV_MISMATCH`/`SRC_REV_UNVERIFIABLE`) and set `opts.srcRev = rev.slice(0,12)` |
| S12 | probeSections call | scripts/proxy-check.mjs:1048 | `probeSections({ self, scorecard, src: opts.src })` | unchanged — it consumes the pin-resolved `opts.src`; do not add a second walk |
| S13 | JSON body | scripts/proxy-check.mjs:1076-1099 | `src: opts.src` at 1084 | `src` already reflects the pin clone; add `pin: opts.pin ?? null, srcRev: opts.srcRev ?? null` (do **not** add keys under `terms` — test 2007 pins `Object.keys(j.terms).length === 0`) |
| S14 | render call | scripts/proxy-check.mjs:1104-1106 | `renderVerdict(verdict, terms, pinStats, findings)` | pass `opts.srcRev` |
| S15 | flag parsing | scripts/proxy-check.mjs:2427-2462 | `opts` init 2428-2436; guard `dirValue` 2437-2442; loop 2443-2459 (`--src` 2450); scorecard default 2460; **src default 2461** | add `pin: null`; branch `else if (a === '--pin') opts.pin = dirValue(a, next());` (reuse the guard so the new “`--pin requires`” 64-arm is free); after 2460: `if (opts.pin === null && !opts.selftest && !opts.help) { const p = join(opts.self, '.ufo', 'pins', 'origin.json'); if (existsSync(p)) opts.pin = p; }`; change 2461 to `if (opts.src === null && !opts.selftest && !opts.help && opts.pin === null) opts.src = resolveSrcDefault();` |
| S16 | fixture builder + suite | scripts/proxy-check.mjs:1137 `fixtureSrc`, 1223 `fxScorecard`, 1302 `fxBase`, 1328-1334 `args`, 2229-2284 `fc(...)` block, 2404-2407 arm-coverage check | fixtures never write `.ufo/pins`; `args()` (1329) always passes `--src` | add a pin writer (`join(dir,'.ufo','pins','origin.json')`) + a hand-built repo under a dedicated `src` (recipe above, pin revision placeholder like `a`×40). Needed fixtures: (i) default-pin discovery, no `--src` → new MATCH literal ending `pins=6 match src-rev=<12>)`; (ii) `--pin` explicit, same; (iii) `SRC_REV_MISMATCH` (repo at `b`×40, pin at `a`×40); (iv) `SRC_REV_UNVERIFIABLE` (plain dir, no `.git`); (v) optional `PIN_MALFORMED`. (iii)/(iv) must be added to the `fc()` block or S6 breaks the 2404-2407 check |

## Smallest diff shape

Four hunks, ~55 lines net (helpers excluded from this sketch):

```js
// A. parseArgs (S15) — pin path only; no IO, no subprocess
pin: null,
...
else if (a === '--pin') opts.pin = dirValue(a, next());           // after the --src branch (2450)
...
if (opts.pin === null && !opts.selftest && !opts.help) {           // after 2460
  const p = join(opts.self, '.ufo', 'pins', 'origin.json');
  if (existsSync(p)) opts.pin = p;
}
if (opts.src === null && !opts.selftest && !opts.help && opts.pin === null) opts.src = resolveSrcDefault();
```

```js
// B. new helpers (S11) — one read, one spawn, pure return
function loadPin(pinPath) { /* JSON.parse; contract==='kumitate-origin-pin-v1';
  /^[0-9a-f]{40}$/.test(revision); clone is a non-empty string
  → {ok:true, revision, clone} | {ok:false, kind:'PIN_MALFORMED', detail} */ }
function pinRev(src, pin) { /* spawnSync('git', ['-C', src, 'rev-parse', 'HEAD'],
  {encoding:'utf8'}); status!==0 || !/^[0-9a-f]{40}$/.test(out.trim())
  → {kind:'SRC_REV_UNVERIFIABLE', detail:`git -C ${src} rev-parse HEAD: ${…}`}
  ; out.trim()!==pin.revision → {kind:'SRC_REV_MISMATCH',
    detail:`pin=${pin.revision.slice(0,12)} src=${out.trim().slice(0,12)}`} */ }
```

```js
// C. runCheck (S11) — between the self arm (1004) and the src stat (1005)
if (opts.pin !== null) {
  const pin = loadPin(opts.pin);
  if (!pin.ok) return failClosed(opts, pin.kind, pin.detail, {}, started);
  if (opts.src === null) opts.src = resolve(pin.clone);
  if (statKind(opts.src) !== 'dir') return failClosed(opts, 'SRC_NOT_A_DIR', `--src ${opts.src} is ${statKind(opts.src)}`, {}, started);
  const rev = pinRev(opts.src, pin);
  if (rev.kind) return failClosed(opts, rev.kind, `${rev.detail} (pin ${opts.pin})`, {}, started);
  opts.srcRev = rev.rev.slice(0, 12);
}
if (statKind(opts.src) !== 'dir') { /* existing 1005-1006, now the no-pin path */ }
```

```js
// D. render (S9/S14) — one extra argument, no-pin output unchanged
function renderVerdict(verdict, terms, pinStats, findings, srcRev = null) {
  const rev = srcRev ? ` src-rev=${srcRev}` : '';
  if (verdict === 'MATCH') { … + ` pins=${pinStats.matched} match${rev})`; }
  return `PROXY: DRIFT (${findings.map(findingSummary).join('; ')}${rev ? `;${rev}` : ''})`;
}
```

Rationale for the ordering choices:
- Pin *path* is resolved at parse time (so `--help`/`--selftest` never stat a live path, mirroring `resolveSrcDefault` at 272-273), but the pin *file* is read in `runCheck` so a malformed pin is exit 2, not exit 64.
- `--src` + pin: the pin still asserts the given tree's HEAD. [INFERENCE] from PIN v1's “every verdict line carrying src-rev=” plus the C1 target “PROXY: MATCH at src-rev=31c465f1”; the alternative (assert only when src came from the clone) leaves an unpinned `--src` silently unaudited.
- A pin naming a vanished clone yields `SRC_NOT_A_DIR` (the existing, more precise arm), not `SRC_REV_UNVERIFIABLE`.
- `src-rev` goes **inside** the verdict line; the suite reads the last stdout line (`scripts/proxy-check.mjs:1280`), so a separate `src-rev=` line breaks all 20 assertions below.

## At-risk selftest assertions (20)

Mechanism: all of these break if `src-rev=` is emitted without a pin, or if the default pin path is resolved from `DEFAULT_SELF` (`scripts/proxy-check.mjs:256`, the real repo) instead of `opts.self` — the lane will commit `.ufo/pins/origin.json`, so the second mistake is live-reachable. Fixtures never write `.ufo/` today, so a correct `opts.self`-keyed implementation keeps every line below green.

| # | path:line | Assertion |
|---|---|---|
| 1 | scripts/proxy-check.mjs:1375 | `verdictLine(r1) === 'PROXY: MATCH (A=6 C=3 operability=7; … pins=6 match)'` |
| 2 | scripts/proxy-check.mjs:1385 | `verdictLine(r2) === 'PROXY: MATCH (A=6 C=1 …)'` |
| 3 | scripts/proxy-check.mjs:1391 | `verdictLine(r3) === 'PROXY: MATCH (A=11 … coverage=10 …)'` |
| 4 | scripts/proxy-check.mjs:1492 | `verdictLine(layersRun) === 'PROXY: MATCH (A=6 … C1=4/4 …)'` |
| 5 | scripts/proxy-check.mjs:1560 | `=== 'PROXY: DRIFT (S_SECTIONS_DRIFT term=S_sections declared=2 computed=1 delta=-1)'` |
| 6 | scripts/proxy-check.mjs:1569 | `=== 'PROXY: DRIFT (R_SECTIONS_DRIFT …)'` |
| 7 | scripts/proxy-check.mjs:1680 | `verdictLine(xFamilyRun) === 'PROXY: DRIFT (S_SECTIONS_DRIFT declared=1 computed=0 …)'` |
| 8 | scripts/proxy-check.mjs:1737 | `verdictLine(kr) === 'PROXY: MATCH (… K=4/30 coverage:kimi-layer=1; pins=6 match)'` |
| 9 | scripts/proxy-check.mjs:1845 | `=== 'PROXY: DRIFT (C1K_TOTAL_DRIFT term=C1k_total declared=6 computed=5 delta=-1)'` |
| 10 | scripts/proxy-check.mjs:1991 | `=== 'PROXY: DRIFT (K_SECTIONS_DRIFT term=K_sections declared=2 computed=1 delta=-1)'` |
| 11 | scripts/proxy-check.mjs:2020 | `=== 'PROXY: DRIFT (A_DRIFT term=A declared=4 computed=6 delta=+2)'` |
| 12 | scripts/proxy-check.mjs:2059 | `verdictLine(dEsc) === 'PROXY: MATCH (A=6 …)'` |
| 13 | scripts/proxy-check.mjs:2166 | `verdictLine(d13) === 'PROXY: MATCH (A=6 …)'` |
| 14 | scripts/proxy-check.mjs:2207 | `verdictLine(w1) === 'PROXY: MATCH (A=7 … pins=6 match)'` |
| 15-17 | scripts/proxy-check.mjs:2307 (literal), used 2310, 2315, 2322 | `const F1_MATCH = 'PROXY: MATCH (A=6 … pins=6 match)'`; the three bare-run checks compare `=== F1_MATCH` |
| 18 | scripts/proxy-check.mjs:2102 | `verdictLine(d8).startsWith('PROXY: DRIFT (A_DRIFT term=A declared=4 computed=6 delta=+2; C_DRIFT')` |
| 19 | scripts/proxy-check.mjs:2215 | `verdictLine(w2).startsWith('PROXY: DRIFT (PIN_UNPINNED')` (warn promoted by `--strict`) |
| 20 | scripts/proxy-check.mjs:1289-1292 | `fcToken` regex `/^PROXY: FAIL-CLOSED \(([A-Z_]+)\)/` — pinned to the token immediately after `(`; `failClosed` must not insert anything there |

Adjacent, **not** at risk (verified by reading the assertion):
- `scripts/proxy-check.mjs:2332` — `includes(\`--src ${want} is absent\`)`; an appended ` src-rev=…` in the detail still matches.
- `scripts/proxy-check.mjs:1407` — `verdictLine(r4) === verdictLine(r1)` (relative, both no-pin).
- `scripts/proxy-check.mjs:1411,1414-1416,2345-2366` — usage regexes/anchor on the synopsis prefix and per-flag messages; unchanged if the `dirValue` guard is reused for `--pin`.
- `scripts/proxy-check.mjs:2007` — `Object.keys(j.terms).length === 0`: do not put `srcRev` inside `terms`; top-level keys are not pinned.

## Risks / remaining unknowns

1. **Malformed-pin token is unfrozen.** PIN v1 freezes only `SRC_REV_MISMATCH`/`SRC_REV_UNVERIFIABLE`. Recommend `PIN_MALFORMED` (exit 2) and mirroring it in `claims-check.mjs` + `surface-probe.mjs`; the zero-new-token fallback is `SRC_REV_UNVERIFIABLE` with `pin <path> is <kind>` in the detail. L1 must pick one so the three gates agree. [INFERENCE for the choice]
2. **S6 coupling.** Adding tokens to `FAIL_CLOSED_KINDS` (390-394) makes the 2404-2407 check fail until the `fc()` fixtures exist; land the fixtures in the same edit.
3. **`pin.proxy-check` self-hash.** Editing this file invalidates the scorecard's `pin.proxy-check` value; the run then reports `PIN_DRIFT` and the C1 target (`PROXY: MATCH`) is unreachable until the L1 re-pins. Not a code defect — an integration ordering fact.
4. **Hermeticity of the git spawn in fixtures.** `git -C <plain tmp dir> rev-parse HEAD` exits 128 only because `/tmp` is outside any repo; keep the fixture dirs under the suite's own `mkdtemp` (already the pattern at 1252) and the `UNVERIFIABLE` fixture stays deterministic.
5. **No git binary on a runner** ⇒ every pinned run becomes `SRC_REV_UNVERIFIABLE` exit 2. That is the contract's intent; note it in S4's prose so an operator reads it as “cannot verify”, not “drift”.
6. **Header claim “no subprocess, no git” (S5) is currently true and becomes false.** Leaving it is a self-contradicting spec and the round's operability axis explicitly scores the gates' own prose honesty. Sweep it with the same edit.

Commands run (exact): `wc -l scripts/proxy-check.mjs`; `grep -n` sweeps listed above; `sed -n` ranges 180-235, 241-252, 340-470, 930-1115, 1113-1370, 2225-2412, 2415-2485; `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`; two `mktemp -d` recipes for the hand-built `.git` (no writes outside `$TMPDIR`). No tools installed. [INFERENCE] marks are labelled inline; everything else is read from the files cited.
