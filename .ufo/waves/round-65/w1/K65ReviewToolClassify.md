VERDICT: harm-matrix v1 (2ca91a0, scripts/harm-matrix.mjs) misreads in seven reachable ways — with coreutils `timeout` absent from PATH the whole matrix prints `HARM_MATRIX: CLEAN ... exit 0` for the real pair 47fe2383→2ca91a0 whose honest reading is `readme-map REPAIRED`; a symlinked gate measures host bytes and reads HELD; a loader-style argv drops the gate to ABSENT_BOTH and uncounts it; a `CLEAN-…` or no-capture verdict reads clean; a stderr diagnostic overrides a later stdout summary; deleting a red gate (or its registry row) reads CLEAN. A 225-line hardening patch keeps H1..H5 at 5/5 and the 26 selftest cases at PASS.

## Evidence

All runs read-only against the lane; fixtures are throwaway repos under /tmp/kumitate-r65/K65ReviewToolClassify/fx.

1. Registry survey, one run per gate in a sandbox clone at 47fe2383 — rebuilt with `git clone -q --no-hardlinks <lane> /tmp/kumitate-r65/K65ReviewToolClassify/clone && git -C <clone> checkout 47fe2383`, then `CLONE=<clone> node grade.mjs` (`scripts/harm-matrix-gates.json`, HOME real):
```
readme-map rc=1 hits=2 words=["note","DRIFT"]   "README_MAP: note uncovered:lessons/round-64-verifier-spotcheck.md"
                                                "README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=..."
proxy-check rc=1 hits=1 ["DRIFT"]  "PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 ...)"
claims-check rc=0 MATCH · counter-pins rc=0 CLEAN · sources-check rc=0 CLEAN · source-capture rc=0 CLEAN
source-dupes rc=0 CLEAN · kimi-census rc=1 DRIFT · omp-census rc=1 DRIFT · anchor-truth rc=0 CLEAN
surface-known rc=0 CLEAN · wave-census-r40 rc=0 CLEAN · 7 selftest gates rc=0 PASS · harm-matrix ABSENT (needs scripts/harm-matrix.mjs)
```
   At tip 2ca91a0 all 20 gates are measurable and each regex matches exactly one line (readme-map CLEAN rc=0; harm-matrix-selftest PASS rc=0). At base 19 gates were measurable: 18 matched one line, `readme-map` matched two (the only multi-line emitter in the registry).
2. Vacuous CLEAN, original tool, `PATH` holding node+git but no `timeout` (`--only readme-map`):
```
HARM_ROW gate=readme-map base=FAIL_CLOSED tip=FAIL_CLOSED id=CARRIED base_text="no-verdict exit=-1" tip_text="no-verdict exit=-1"
HARM_MATRIX: CLEAN gates=1 ... carried=1 ... harm=0 harm_absent=0 new_red=0 base=47fe23831519 tip=2ca91a0c8154
exit=0
```
   Control, normal PATH, same pair: `HARM_ROW gate=readme-map base=NOT_CLEAN tip=CLEAN id=REPAIRED base_text="README_MAP: DRIFT ... [exit=1]" tip_text="README_MAP: CLEAN files=157 rows=157 covered=157"`.
3. Fixtures (each builds `D=$(mktemp -d)` + `git -C "$D" init -q`, two commits, then runs the tool with `--lane "$D"`): FX1 needs, FX2 symlink, FX3 no-capture, FX4 `CLEAN-STALE`, FX5b stream order, FX6 no-timeout, FX7 exit 124, FX8 SIGSEGV, FX9 red-gate-deleted, FX10 registry row dropped, FX11 needs=dir, FX12 never-a-verdict. Verbatim key rows are quoted inside the findings.
4. Hardened draft (`harm-matrix.hardened.mjs`): `HARM_MATRIX_SELFTEST: PASS (26/26)`; every FX fixture flips to the honest row (quoted below); `git -C <clone at 2ca91a0> apply --check -p1` → exit 0; the frozen counter run against the draft (`probe-draft.mjs`, M=2ca91a0) → `HARM65_HELD held=5/5 checks=5 rev=2ca91a0c81542cad5f731049aa55dd2f99ade98d rule=H65` (so the 16 committed controls in H2 and H3/H5 still pass — the patch strengthens without relaxing).

## Findings

### K65ReviewToolClassify-1 — HIGH — a host without `timeout` yields a vacuous CLEAN (exit 0)
`measure` spawns `timeout` (harm-matrix.mjs:85) and inspects `r.error` only for `ETIMEDOUT` (:88), so `ENOENT` becomes rc −1 → `FAIL_CLOSED no-verdict exit=-1` at both revisions → `CARRIED` → `bad=0` → exit 0. `render` counts CARRIED as evidence (:143), so a run that measured nothing certifies the admission rule. Repro: evidence 2 (`PATH=/tmp/kumitate-r65/K65ReviewToolClassify/fx/bin6 node <tool> --lane <clone> --base 47fe2383… --tip 2ca91a0… --only readme-map --gates <gates.json>`; `fx/bin6` holds node+git symlinks and is created by `node fx.mjs`). Patch: preflight `if (spawnSync('timeout',['--version']).error) return { fail: 'TOOL_MISSING' }`, `spawn-error <code>` text, `unmeasured=` in the summary. Hardened output: `HARM_MATRIX: FAIL_CLOSED reason=TOOL_MISSING detail="timeout (coreutils) is not on PATH: no gate can be spawned"` exit 2.

### K65ReviewToolClassify-2 — HIGH — ABSENT is decided by `existsSync`, which follows a symlink out of the sandbox
harm-matrix.mjs:84 `existsSync(join(dir, g.needs))`: a tip whose `gate.mjs` is git mode `120000` → `/tmp/.../host-gate.mjs` passes, and `spawnSync` executes the host bytes. Repro FX2 (`node fx.mjs`): tip tree `120000 blob abb89382… gate.mjs`, original tool prints `HARM_ROW gate=gate base=CLEAN tip=CLEAN id=HELD` / `HARM_MATRIX: CLEAN gates=1 … harm=0` exit 0 although the revision carries no gate. Patch: `presence()` = reject absolute/`..`, `lstat`, resolve links and require them inside `realpath(dir)`, require `isFile()`; non-absent defects read `FAIL_CLOSED needs-escape-link:<path>`. Hardened: `HARM_ROW gate=gate base=CLEAN tip=FAIL_CLOSED id=HARM … tip_text="needs-escape-link:gate.mjs"` exit 1.

### K65ReviewToolClassify-3 — HIGH — `needs` derivation picks the loader, not the gate; the gate then vanishes from the denominator
harm-matrix.mjs:67 `g.argv.find((a) => /\.(mjs|js|sh|py)$/.test(a))` returns the value of `--import`/`-r`/`--loader`/`-e`. For `['node','--import','x.mjs','scripts/y.mjs']` needs=`x.mjs`; when x.mjs is absent at both revisions the gate is `ABSENT_BOTH`, excluded from `counted` (:143), and its regression is unreported. Repro FX1 (`node fx.mjs`): `HARM_ROW gate=loader-gate … id=ABSENT_BOTH base_text="absent:loader.mjs"`, `HARM_ROW gate=direct-gate base=CLEAN tip=NOT_CLEAN id=HARM … "GATE: DRIFT files=3 [exit=1]"` — same file, only the direct gate sees it. Patch: `deriveNeeds()` skips `NEEDS_FLAG_VALUES` and its value, then takes the first positional. Hardened: `loader-gate base=FAIL_CLOSED tip=FAIL_CLOSED` and `gates=3 … unmeasured=1` (loud, and the denominator no longer shrinks).

### K65ReviewToolClassify-4 — MED-HIGH — `\w+` stops at `-`, so a hyphenated non-clean word reads clean
`^README_MAP: (\w+)` plus `clean:["CLEAN"]` (:93/:95): `README_MAP: CLEAN-STALE files=2` captures `CLEAN` and the exit is 0 → clean. The lane already emits hyphenated compounds of exactly this shape (`README_MAP: FAIL-CLOSED`, `PROXY: FAIL-CLOSED`, `TRUTH: FAIL-CLOSED`), so one new `CLEAN-*` state is a false admission. Repro FX4 (`node fx.mjs`): original `HARM_ROW gate=readme base=CLEAN tip=CLEAN id=HELD … tip_text="README_MAP: CLEAN-STALE files=2 rows=2 covered=2"` exit 0; FX4b shows the negative direction is safe (`DRIFT-STALE` → NOT_CLEAN). Patch: skip a match whose next char is `[-A-Za-z0-9_]`. Hardened: `tip=FAIL_CLOSED tip_text="no-verdict exit=0"`, `id=HARM`, exit 1.

### K65ReviewToolClassify-5 — MED-HIGH — a verdict regex with no capture group falls back to the whole match
harm-matrix.mjs:93 `word: m[1] !== undefined ? m[1] : m[0]`; `loadGates` (:64) accepts any regex. A registry author writing `"verdict": "CLEAN"` gets `m[0]="CLEAN"` from the line `STEP: expected CLEAN, got DRIFT`. Repro FX3 (`node fx.mjs`): `HARM_ROW gate=wordonly base=CLEAN tip=CLEAN id=HELD base_text="STEP: expected CLEAN, got DRIFT"` / `HARM_MATRIX: CLEAN` exit 0. Patch: `loadGates` rejects `!re.source.startsWith('^') || !/\((?!\?)/` and `measure` drops the `m[0]` fallback. Hardened: `HARM_MATRIX: FAIL_CLOSED reason=GATES_INVALID detail="wordonly: verdict needs ^anchor and a capturing group 1"` exit 2.

### K65ReviewToolClassify-6 — MED — stdout-then-stderr concatenation is not chronological; "last match wins" is "last stderr match wins"
harm-matrix.mjs:91 joins stdout then stderr, so every stderr line outranks every stdout line regardless of when it was written. A gate that logs `GATE: DRIFT file=a.md` to stderr and its final `GATE: CLEAN` to stdout reads NOT_CLEAN while the true last line is CLEAN. Repro FX5b (`node fx2.mjs`): original `HARM_ROW gate=gate base=NOT_CLEAN tip=CLEAN id=REPAIRED base_text="GATE: DRIFT file=a.md [exit=0]"`, while `cd "$D" && node gate.mjs 2>&1 | tail -1` = `"GATE: CLEAN (final)"`. No committed gate trips it today (only readme-map emits several verdict lines, all on stdout, and case `last-verdict-wins` puts both lines on one stream), but the flag direction is false HARM/REPAIRED on any gate that logs to both. Patch: run `timeout … sh -c 'exec "$@" 2>&1' sh …` and read one stream. Hardened: `base=CLEAN tip=CLEAN id=HELD` (matches the merged tail).

### K65ReviewToolClassify-7 — MED — the registry is read once from the working tree; a dropped row is unmeasured, not HARM
`gatesFile` defaults to `join(HERE,'harm-matrix-gates.json')` (the tip's file) and the same list is applied to both revisions, so a tip that deletes a row removes the gate from both measurements; `ABSENT_BOTH` is then excluded from `counted`. Repro FX10 (`node fx2.mjs`): base registry ids `"gate","ok"`, tip registry only `ok`, tip `gate.mjs` exits 1 — original: `HARM_ROW gate=ok base=CLEAN tip=CLEAN id=HELD` / `HARM_MATRIX: CLEAN gates=1 … harm=0` exit 0. H5's `gates >= 14` floor is the only guard, and one dropped row keeps 19. Patch: when the registry lives in the repo, `git show <base>:<rel>` and union missing ids (`registry=union added=n`), plus `absent_both=` in the summary. Hardened: `registry=union added=1`, `HARM_ROW gate=gate base=CLEAN tip=NOT_CLEAN id=HARM`, exit 1.

### K65ReviewToolClassify-8 — MED — deleting a red gate reads CLEAN (`GONE` is not a bad count)
`transition` (:101-103) maps not-clean→absent to `GONE`, and `render` (:146) sums only harm/harm_absent/new_red. Repro FX9 (`node fx2.mjs`): `HARM_ROW gate=gate base=NOT_CLEAN tip=ABSENT id=GONE` / `HARM_MATRIX: CLEAN gates=2 … gone=1` exit 0 while base was red. The frozen H5 pins "exit 0 exactly when harm+harm_absent+new_red=0", so the default mapping must not change; the patch adds an opt-in `--strict-gone` (GONE counts as harm, and an all-unmeasured run fails closed): same fixture with the flag → `HARM_MATRIX: HARM gates=2 … gone=1` exit 1. Recommend the next counter read `gone=` explicitly.

### K65ReviewToolClassify-9 — LOW-MED — exit 124/137 is always TIMEOUT; 137 also hides an OOM kill
harm-matrix.mjs:90. A gate that returns 124 by its own convention reads `timeout>60s` (FX7, original: `tip=TIMEOUT tip_text="timeout>60s"`), and a kernel SIGKILL (137) is reported as a timeout rather than an OOM. Direction is never clean, so it costs diagnosis, not admission. Patch: require `elapsed >= (g.timeout - 1) * 1000` before calling it TIMEOUT. Hardened FX7: `tip=NOT_CLEAN tip_text="GATE: DRIFT findings=124 [exit=124]"`.

### K65ReviewToolClassify-10 — LOW — any signal death is fabricated as `rc=128` with no signal name
harm-matrix.mjs:89 `128` is neither the shell's `128+N` nor an exit the gate chose. FX8 (original): `tip=NOT_CLEAN tip_text="GATE: CLEAN [exit=128]"` for a SIGSEGV (the shell would report 139). Never clean, so safe; unreadable. Patch: `status===null` → `FAIL_CLOSED signal=SIGSEGV` (hardened: `tip_text="signal=SIGSEGV verdict=\"GATE: CLEAN\""`).

### K65ReviewToolClassify-11 — LOW — CARRIED compares `text` truncated to 200 chars
harm-matrix.mjs:96 truncates, :105 compares. Two different long verdict lines sharing a 200-char prefix read `CARRIED` (same reading). Patch: keep `key` = untruncated line + exit suffix for the comparison, `text` for display only.

### K65ReviewToolClassify-12 — LOW/INFO — `trimEnd()` only, and a directory satisfied `needs`
`:91` keeps leading whitespace, so an indented `  README_MAP: CLEAN` can never match an anchored verdict (reads FAIL_CLOSED, never clean). A directory passed `existsSync` and the gate ran anyway (FX11 `dir-needs`): with the patch it reads `FAIL_CLOSED needs-not-a-file:gatedir` at both revisions and appears as `unmeasured=1`.

## Registry regex grading (20 gates, 47fe2383 and 2ca91a0)
All 20 are `^TOKEN: (\w+)` with a single uppercase `clean` word; `new RegExp(g.verdict)` is built from a string, so no `i`/`g` flag exists anywhere — no case-insensitive accident, no sticky `lastIndex`. Which can match two different lines: **only `readme-map`** — `README_MAP: note <item>` (scripts/readme-map.mjs:247, one per extra bad item) then `README_MAP: DRIFT …` (:248); the note line captures `note`, so last-match-wins lands on DRIFT, correct only by luck of the words. Everything else prints exactly one matching line on its clean and its not-clean path (drift survey above). The same survey shows the live prefix hazard is not hypothetical: `PROXY: FAIL-CLOSED`, `README_MAP: FAIL-CLOSED` and `TRUTH: FAIL-CLOSED` are emitted with a hyphen in the verdict slot, so a future `CLEAN-*`/`MATCH-*`/`PASS-*` state reads clean under the current code (finding 4).

## Artifacts
- `.ufo/waves/round-65/build/K65ReviewToolClassify/harm-matrix.hardening.patch` (225 lines, applies to 2ca91a0 with `git apply -p1`)
- `…/K65ReviewToolClassify/harm-matrix.hardened.mjs` (full-file draft: selftest 26/26, H65_HELD 5/5)
- `…/K65ReviewToolClassify/fx.mjs`, `fx2.mjs` (fixture builders, findings 1..12), `grade.mjs` (per-gate survey; `CLONE=<dir>`), `probe-draft.mjs` (frozen counter pointed at the draft)

## Limits
- The registry survey first ran with `HOME` under scratch, which turned the three host-state gates into FAIL-CLOSED paths (`PROXY: FAIL-CLOSED (KIMI_ROOT_NOT_A_DIR)`, `KIMI_CENSUS: FAIL-CLOSED`, `OMP_CENSUS: ERROR`); I re-ran those three with the real HOME and the report quotes those readings (`PROXY: DRIFT`, `KIMI_CENSUS: DRIFT`, `OMP_CENSUS: DRIFT`).
- Gates run in one shared sandbox clone at CONC<=4; a gate that writes (e.g. source-capture) could see a sibling's file, and no gate in the registry does.
- I did not measure the heavy gates outside the registry (cite-check, gate-mutants, cap-run, `surface-probe --checklists`) and did not run H3's direct-run pair a004902d/6825a514 myself beyond the 47fe2383/2ca91a0 pair quoted in finding 1.
- The patch's two exit-mapping consequences are stated for the integrator: `TOOL_MISSING` (finding 1) and `--strict-gone`/all-unmeasured (finding 8) can return 2 where the frozen H5 expects 0 or 1; both only fire when nothing was measurable, and the counter run against the draft returned 5/5, so H5 is unaffected in its own invocation.
- No subagents, no lane/`scripts/` edit, no git write outside fixtures; no tool installs were needed.
