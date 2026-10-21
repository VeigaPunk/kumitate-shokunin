FIXTURE-PLAN claims-cases=31 proxy-cases=10 git-dependent=2

# Selftest fixtures: inventory + minimum FIDELITY/PIN set
Lane repo paths; lane master 0614092. Baselines observed: `node scripts/claims-check.mjs --selftest` → `CLAIMS_SELFTEST: 39/39 pass`; `node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: 109/109 pass`.

## 1. Existing inventory (observed)
**scripts/claims-check.mjs** (925 L; `selfTest` 599-863)
- `FIXTURE_FILES` 543: `scripts/a.mjs` 6 L (`ALPHA_MARK` line 3), `scripts/b.mjs` 4 L (`BETA_MARK` line 2), `scripts/dup.mjs` + `crates/ufo-core-runtime/src/dup.mjs` (basename collision), `crates/ufo-core-runtime/src/c.rs`.
- `fixtureSrc` 551, `fxNote` 559, `FX_GREEN_NOTE` 565, `FX_GREEN_ROWS` 566, `fxRepo(root,{rows,notes,extra})` 573 (mkdtemp repo + `corpus/{knowledge,lessons}` + `SCORECARD.md`).
- `runClaims(args,env)` 581 spawns `process.execPath` and merges `process.env` (583) ⇒ per-case `PATH`/`UFO_SRC` override is available. `verdictLine` 588 (last line), `kinds` 593 (lines starting `CLAIMS  `).
- `mk(name,opts)` 611 → `{self,src}`; `args` 612; `ok(run,status,needle,kindList)` 613 (exit + verdict substring + exact ordered kinds).
- `FINDING_KINDS` 109, `FAIL_CLOSED_KINDS` 117, coverage asserts 849-852. Renderer 858-863 prints FAIL lines then `n/m pass`; **no SKIP support**.
**scripts/proxy-check.mjs** (2485 L; `selfTest` 1251-2443)
- `FIXTURE_SCRIPTS` 1114, `fixtureScript` 1115, `FIXTURE_PINS` 1116 (sha256 → `pin.<script>`); `FX_SRC_FILES` 1127/`fixtureSrc` 1137; `fixtureKimi` 1167 (30 hand-counted K members); `fxLayerNote` 1200 (`MEMBER` at `rel:1`); `fxSkill` 1202; `fxReadme` 1208.
- `fxScorecard(fx)` 1223 = stanza/axes builder from hand-written `expect`; `fxDir` 1267; `fxWrite` 1273; `runProxy(args,extraEnv)` 1277 (env merge ⇒ `PATH` override); `parseFindings` 1281; `fcToken` 1289; `fxBase` 1296; `args(fx,extra)` 1328.
- `F1/F2/F3` 1337/1343/1351 asserted against **literal** verdict lines (1376+); determinism case; `layerDrift` 1502; fail-closed `fc` 2222; nested SKIP 2371-2377; renderer 2412-2443 (SKIP word supported, skipped ⇒ `ok:true`).
- `FINDING_KINDS` 381, `FAIL_CLOSED_KINDS` 390, **token rewrite at 1050** (unlisted kind → `INTERNAL_ERROR`), `STANZA_KEYS` 302 = 23 frozen keys, literal assertion 1459-1462.

## 2. Two observed facts that decide the design
1. **Hand-written `.git` satisfies `rev-parse` with no `git init`, no objects**: `.git/HEAD`=`ref: refs/heads/master`, `.git/refs/heads/master`=`<40hex>`, plus empty `.git/objects`. Real git 2.56.0: `rev-parse HEAD` → sha, `--verify HEAD` → sha, `--short=12 HEAD` → 12 hex, all status 0 (detached raw-sha HEAD works too).
2. **PATH hides git from node deterministically**: `spawnSync('git',['--version'],{env:{PATH:'/nonexistent'}})` → `status:null, error.code:'ENOENT'`; `PATH:''` likewise. (Shell `PATH=/nonexistent git …` is NOT evidence — bash still found `/usr/bin/git`.)
⇒ The pin arm needs no repository and no host git if the fixture puts a **node-script git shim** on `PATH`: file `bin/git`, shebang `#!<process.execPath>`, chmod 0o755, body asserts `argv == ['-C',<dir>,'rev-parse','HEAD']` else `exit 9`, then prints `process.env.FX_GIT_SHA`. Proved: match/mismatch → status 0 with the respective sha; no-git → ENOENT; real git over the fake repo → status 0, sha, empty stderr. The argv assertion freezes the call shape (`-C`, never `cwd:`, never `--short=12`), and writing `argv[1]` to a witness file proves the gate pointed git at `--src`.

## 3. Fixture helpers to add (per suite, self-contained — matches existing duplication)
`fxGitDir(srcDir,sha40)`, `fxPin(dir,{rev,clone})` (writes `kumitate-origin-pin-v1` JSON), `fxShimGit(tmp,sha40)` → `bin/`, `fxRatchet(dir,obj)`; claims only: `fidLines(run)`/`fidTotal(run)` and a `skipped` field in `check()` (§6).
**Isolation rule:** every fidelity fixture's member section carries one *live* own-file anchor and one backticked symbol verbatim in the file (claims 375-381), so `SECTION_DEAD_ANCHOR`/`SECTION_NO_SYMBOL` stay silent, `CLAIMS` reads MATCH, and only `FIDELITY` moves — valid whether `--fidelity` is a separate mode or an added arm.

## 4. claims-check: 31 new cases (39 → 70)
### FIDELITY, pin-free, hermetic (12)
| # | fixture delta on green `fxRepo` | expected | exit |
|---|---|---|---|
| F1 | none (green notes: `ALPHA_MARK` at `scripts/a.mjs:3`, `BETA_MARK` at `scripts/b.mjs:2`) | 2 note lines `anchors=1 ok=1 … nonok=0`; `FIDELITY_TOTAL anchors=2 ok=2 elsewhere=0 absent=0 dead=0 noid=0 nonok=0`; `CLEAN`; no `src-rev=` | 0 |
| F2 | right-pairing `` `scripts/a.mjs:3` is where `ALPHA_MARK` sits.`` | ok=1 | 0 |
| F3 | boundary, 2 runs: gap after the anchor = `' '+'.'.repeat(12)+' '` (14) vs 13 dots (15) | run1 ok=1; run2 noid=1; nonok=0 both | 0,0 |
| F4 | `` `ALPHA_MARK` at `scripts/a.mjs:1` `` | elsewhere=1 nonok=1, `DRIFT` | 1 |
| F5 | `` `GHOST_MARK` at `scripts/a.mjs:3` `` + a verbatim `ALPHA_MARK` elsewhere in the section | absent=1 nonok=1 | 1 |
| F6 | live `` `scripts/a.mjs:3` `` + dead `` `ALPHA_MARK` at `scripts/a.mjs:99` `` | dead=1, nonok=0, `CLEAN` | 0 |
| F7 | anchor `` `scripts/a.mjs:3` ``, symbol on its own line (no adjacent span) | noid=1, nonok=0, `CLEAN` | 0 |
| F8 | 2 runs: `:2-4` (symbol on 3) and `:4-2` | run1 ok=1; run2 dead=1 nonok=0 | 0,0 |
| F9 | bare `` `ALPHA_MARK` at `:3` `` + foreign `` `BETA_MARK` at `scripts/b.mjs:2` `` + ambiguous `` `DUP_ONE` at `dup.mjs:1` `` | anchors=1 ok=1 (foreign/ambiguous spans are not anchors) | 0 |
| F10 | only anchor un-backticked: `(scripts/a.mjs:3)` (house style, 842-845) | no `FIDELITY note=` line for it; TOTAL counts the other note | 0 |
| F11 | F1 shape, run twice | byte-identical stdout | 0 |
| F12 | `--fidelity --self <ok> --src /nonexistent` | `SRC_NOT_A_DIR` | 2 |
Negative-pairing sub-checks inside F3's family (each ⇒ `noid`, nonok untouched): next span within 14 that is itself an anchor, a path-like token, `AB`, `42`, `—` — each placed with no previous span so the fixtures do not freeze the untested fallback reading.
### PIN, claims (11)
| # | fixture | expected | exit |
|---|---|---|---|
| P1 | shim git, `FX_GIT_SHA`=pin rev, `--pin`, argv witness | `FIDELITY: CLEAN (… src-rev=<12>)`, 12 chars == rev[0:12], witness == `<case>-src`; `CLAIMS` line also carries it **[G6]** | 0 |
| P2 | shim prints another 40-hex | `SRC_REV_MISMATCH` | 2 |
| P3 | no `.git` in `-src` | `SRC_REV_UNVERIFIABLE` | 2 |
| P4 | `PATH=/nonexistent` | `SRC_REV_UNVERIFIABLE` | 2 |
| P5 | shim exits 9 (wrong call shape) | `SRC_REV_UNVERIFIABLE` | 2 |
| P6 | no pin anywhere | no `src-rev=` in any line | 0 |
| P7 | `<self>/.ufo/pins/origin.json`, no flag | pin active; `.ufo` pruned from walks (claims 157) | 0 |
| P8 | pin.clone mismatching, explicit matching `--src` | `CLEAN` + that src's rev (`--src` wins) | 0 |
| P9 | pin.clone missing, no `--src` | `SRC_NOT_A_DIR` | 2 |
| P10 | pin body `{not json` | `SRC_REV_UNVERIFIABLE` **[G3]** | 2 |
| P11 | **real** git over the fake `.git`, no shim | `CLEAN` + `src-rev=`; SKIP if git absent | 0 |
### RATCHET (8; `--fidelity --fidelity-ratchet <file>`; pin revision match via shim except R5-R8)
| # | fixture | expected | exit |
|---|---|---|---|
| R1 | F1 + `{revision:pin, notes:{fx-a:0,fx-b:0}, total:0}` | `CLEAN` | 0 |
| R2 | F4 + `notes:{fx-a:0,fx-b:9} total:9` | `DRIFT` + breach line naming `fx-a` | 1 |
| R3 | F4 + `notes:{fx-a:9} total:0` | `DRIFT`, total-clause line | 1 |
| R4 | F4 + `notes:{fx-b:9}` (fx-a unlisted, nonok=1) | `DRIFT`, line names `fx-a` (implicit ceiling 0) | 1 |
| R5 | ratchet `not json` | `RATCHET_MALFORMED` | 2 |
| R6 | 2 runs: `contract:…-v0`; `total` missing | `RATCHET_MALFORMED` | 2 |
| R7 | 2 runs: other 40-hex; prefix-only `31c465f15669` | `RATCHET_REV_STALE` | 2 |
| R8 | ratchet, **no pin** | `RATCHET_REV_STALE` **[G4]** | 2 |
R5-R8 stay git-free only if pin parse → ratchet validate/revision compare → git spawn. Required ordering, not cosmetic.

## 5. proxy-check: 10 new cases (109 → 119)
| # | fixture | expected | exit |
|---|---|---|---|
| X1 | `fxBase('match-basic')` + fake `.git` at `fx.src` + `--pin` | `PROXY: MATCH (A=6 … pins=6 match` + `src-rev=[0-9a-f]{12}` == rev[0:12]; `A=6` unchanged (`.git` excluded; pin JSON is `.json`) | 0 |
| X2 | shim other sha | `PROXY: FAIL-CLOSED (SRC_REV_MISMATCH)` | 2 |
| X3 | no `.git` | `FAIL-CLOSED (SRC_REV_UNVERIFIABLE)` | 2 |
| X4 | `PATH=/nonexistent` | same token | 2 |
| X5 | no pin; assert on existing `r1` | stdout has no `src-rev=` (literal verdict untouched) | 0 |
| X6 | `<fx.dir>/.ufo/pins/origin.json`, no flag | pin active; A/stanza unchanged | 0 |
| X7 | pin.clone mismatching, explicit matching `--src` | MATCH with that rev | 0 |
| X8 | pin.clone missing, no `--src` | `FAIL-CLOSED (SRC_NOT_A_DIR)` | 2 |
| X9 | `--json`, 2 runs (pin / none) | pin: rev exposed additively; none: key set identical to today | 0 |
| X10 | real git over fake `.git` | MATCH + `src-rev=`; SKIP if git absent | 0 |
X5 is the key regression guard: F1/F2/F3 assert literal verdict lines (1376+), so `src-rev` leaking into the pin-free path fails three existing cases.

## 6. Honest SKIP (P11, X10 only)
Probe once: `const gitOk = (() => { const r = spawnSync('git',['--version'],{encoding:'utf8',timeout:10_000}); return !r.error && r.status === 0; })();`
- proxy: reuse 2371-2377 verbatim — `{ok:true, skipped:true, detail:'SKIP(no git) — host git not runnable; shim cases cover the comparison'}`; 2416 already prints `SKIP`.
- claims: `check()` (604-609) gains `skipped`; `failed = results.filter(r => !r.ok && !r.skipped)`; print `SKIP  <label> — <detail>` and change 861 to `CLAIMS_SELFTEST: <pass>/<total> pass, <k> skipped (host git absent)` so the count cannot hide the skip.
- Coverage must not go dark: `SRC_REV_MISMATCH`/`SRC_REV_UNVERIFIABLE` are fired by P2-P5/X2-X4 (git-independent), so 849-852 / 2400-2406 hold without host git. Requirement: no fail-closed kind may be exercised only by a skippable case.

## 7. Mandatory kind-table edits
- claims `FAIL_CLOSED_KINDS` 117 += `SRC_REV_MISMATCH`, `SRC_REV_UNVERIFIABLE`, `RATCHET_MALFORMED`, `RATCHET_REV_STALE`.
- proxy `FAIL_CLOSED_KINDS` 390 += `SRC_REV_MISMATCH`, `SRC_REV_UNVERIFIABLE` — not optional, 1050 rewrites unlisted tokens to `INTERNAL_ERROR`.
- `FINDING_KINDS` (109, 381): add nothing — fidelity/ratchet stay on `FIDELITY` lines and govern only the exit, so the two "every kind fires" asserts and the drift vocabulary are untouched.
- The pin must not become a stanza key (`STANZA_KEYS` 302 = 23, asserted literally at 1459-1462).

## 8. Unfrozen points (fixtures avoid asserting them; L1 must decide)
- **[G1]** `--fidelity` separate mode vs added arm, and exit when claims drift + fidelity clean. §3 rule makes cases wiring-neutral.
- **[G2]** `src-rev=` placement inside `CLAIMS`/`PROXY` lines, and whether fail-closed lines carry it. Cases assert `src-rev=[0-9a-f]{12}` + prefix equality only, never spacing.
- **[G3]** malformed pin token — recommend `SRC_REV_UNVERIFIABLE` (closed token set). **[G4]** ratchet with no pin — recommend `RATCHET_REV_STALE`.
- **[G5]** breach line shape — recommend `FIDELITY_RATCHET note=<rel> nonok=<n> ceiling=<m>` and `FIDELITY_RATCHET total nonok=<n> ceiling=<m>`, else R2-R4 cannot be written.
- **[G6]** whether `CLAIMS: MATCH` carries `src-rev=` (C1 says every verdict names its revision); P1 asserts it, F1/P6 assert absence without a pin.

## 9. Hermeticity invariants
All fixture roots under `mkdtempSync(join(tmpdir(),…))` (`mk` 611, `fxDir` 1267); every pin/clone is a tmp path, so the a-w clone and the lane repo are never stat'd (structural). One spawn per case is `process.execPath` (581, 1277); the pin arm's `git` is the node shim; the only foreign binary anywhere is host `git` in P11/X10, which skips. No network, no `git init`/`git commit`, writes only under the tmp dir.

## 10. Commands run
- Both selftests, as quoted in the header (39/39, 109/109).
- Fake `.git`: ref form, detached form, `--verify`, `--short=12` — status 0 each.
- `spawnSync('git',['--version'])` with `PATH=/nonexistent` and `PATH=''` → ENOENT; normal → `git version 2.56.0`.
- Shim round-trip: match, mismatch, PATH-hidden, real-git-over-fake-repo — results in §2.
No installs, no writes outside this report, no lane-file edits.
