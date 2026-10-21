EXEC proxy-pin done cases=7 selftest=116/116 verdict="PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=79 computed=80 delta=+1; PIN_DRIFT term=pin.proxy-check declared=5852fefd6dc061c6123e9e5e791271fafddf157d520bd6a43aa32a7c3a81fdfb computed=3f1b7c7bfa74d9d22e5429a18660f67e68bc894aeb3b5b744a6443a8becdece8; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/sources-check.mjs; src-rev=31c465f15669)"

# ExecProxyPin — PIN v1 in scripts/proxy-check.mjs

## Deliverable
Patch: `/fast/scratch/kumitate-r36/w/ExecProxyPin.patch` (506 lines, one file: `scripts/proxy-check.mjs`, +485/−21).
Scratch clone: `/fast/scratch/kumitate-r36/w/ExecProxyPin/lane` (branch `r36-execproxypin`, base `0614092e0804aaca06642cb3a263a05c1cacc98e`).
Evidence dir: `/fast/scratch/kumitate-r36/w/ExecProxyPin/` (`selftest.txt`, `live-pinned.txt`, `live-mismatch.txt`, `live-nopin.txt`, `pin.json`, `pin-bad.json`).
Applied nowhere: the lane repo was not written except this report; no git/jj state in the lane was touched.

## What changed (scripts/proxy-check.mjs)
- `:53-71` PIN v1 header block: precedence, tokens, src-rev, JSON fields.
- `:206-217` verdict docs (`[; src-rev=<12 hex>]` on MATCH and DRIFT).
- `:219-239` fail-closed list + definitions for `PIN_MALFORMED`, `SRC_REV_UNVERIFIABLE`, `SRC_REV_MISMATCH`; `SRC_NOT_A_DIR` now also names a pin clone.
- `:252-278` bounds: ONE subprocess (`git -C <src> rev-parse HEAD`, `GIT_OPTIONAL_LOCKS=0`); none without a pin.
- `:327-414` new block: `PIN_CONTRACT`/`PIN_REL`/`RE_REV`, `defaultPinPath`, `readPin`, `gitHead`, `resolveOrigin` — same messages/tokens as `KumitateR36.ExecClaimsPin`'s claims-check (duplicated, not imported: claims-check exports no pin reader).
- `:529-531` `FAIL_CLOSED_KINDS` gains the three pin tokens (the suite's "every arm fires" meta test now demands them).
- `:533` USAGE `[--pin FILE]`, `:557-560` pin sentence, `:565-577` `--src`/`--pin` help.
- `:1111-1122` `renderVerdict(..., srcRev)`: `; src-rev=<12>` is the last parenthetical segment for MATCH and DRIFT; omitted with no pin (byte-identical legacy text).
- `:1130-1135` / `:1241-1246` JSON bodies gain `pin` (resolved pin object or null) and `srcRev` (40-hex or null).
- `:1158-1164` `runCheck`: `resolveOrigin(opts)` runs after `SELF_NOT_A_DIR`, before any term count; the resolved `src` is exactly what is passed to `probeSections({ self, scorecard, src })` (the imported walk) and to the layer terms.
- `:2748` `--pin` flag; `:2755-2762` origin resolution moved out of `parseArgs` into `runCheck`, which is what lets the pin supply `src` when `--src` is absent.

## Contract conformance (frozen PIN v1)
- Resolution: `--src` → pin `clone` (absent `--src`) → legacy `$UFO_SRC`/candidates. An active pin asserts the RESOLVED tree, so `--src <other-tree>` is refused, never scored under the pin's name.
- Assertion: `git -C <src> rev-parse HEAD` (env `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`). Differing rev → `SRC_REV_MISMATCH` exit 2; not a repo / git absent / non-40-hex HEAD → `SRC_REV_UNVERIFIABLE` exit 2. Malformed pin → `PIN_MALFORMED` exit 2 (never "silently unpinned"), the token `ExecClaimsPin` uses for the same contract.
- Default pin: `<self>/.ufo/pins/origin.json` when it is a file; absent default = today's behaviour exactly (portability).
- Stanza untouched: `STANZA_KEYS` still 23 keys (test `parent-frozen v1 rejects pin.sources-check` and the 23-key literal still PASS; nothing added/removed).
- `src-rev` is 12 hex per the frozen contract (`31c465f15669`), so the goal prose's `src-rev=31c465f1` is its substring, not a different spec.

## Exact new verdict texts (observed)
Pinned lane run (`node scripts/proxy-check.mjs --pin …/pin.json`, exit 1):
`PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=79 computed=80 delta=+1; PIN_DRIFT term=pin.proxy-check declared=5852fefd… computed=3f1b7c7b…; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/sources-check.mjs; src-rev=31c465f15669)`
Pinned MATCH form (fixture, selftest case 100, exit 0):
`PROXY: MATCH (A=6 C=3 operability=7; C1=1/2 C2=2/2 coverage=5; S=0/3 coverage:script-layer=0; R=0/2 coverage:runtime-layer=0; K=0/30 coverage:kimi-layer=0; pins=6 match; src-rev=5bfc9b5910fd)`
No pin (exit 1, unchanged legacy text): `…; pins=6 match)` (no src-rev segment).

## Commands run and output
- `node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: 116/116 pass` / `VERDICT: PASS` (baseline 109/109; +7 cases).
- New cases (all PASS): (1) default pin file resolves clone, asserts HEAD, `src-rev=` in verdict and JSON (`selftest.txt:100`); (2) rev≠HEAD under explicit `--src` → `SRC_REV_MISMATCH` (`:101`); (3) non-repo clone → `SRC_REV_UNVERIFIABLE` (`:102`); (4) absent clone → `SRC_NOT_A_DIR` naming the resolved path (`:103`); (5) no pin → legacy verdict, `pin`/`srcRev` null (`:104`); (6) missing explicit `--pin` → `PIN_MALFORMED` (`:105`); (7) foreign contract id → `PIN_MALFORMED` (`:106`).
- Live pinned: `node scripts/proxy-check.mjs --pin /fast/scratch/kumitate-r36/w/ExecProxyPin/pin.json` → exit 1, line above (C2_TOTAL/AXES_DRIFT are the pre-existing baseline drifts; PIN_DRIFT is expected until the integration re-pins `pin.proxy-check`).
- Live mismatch: pin revision zeroed → exit 2, `PROXY: FAIL-CLOSED (SRC_REV_MISMATCH) /fast/scratch/kumitate-r36/src HEAD 31c465f15669 != pin 000000000000 (…)`.
- Live no-pin: `--src /fast/scratch/kumitate-r36/src` → exit 1, DRIFT without `src-rev=` (legacy shape preserved).
- Pinned-tree immutability: `find /fast/scratch/kumitate-r36/src -printf '%p %s %T@\n' | sort | sha256sum` before/after a pinned run → identical `f9d416c8f0fc372c73ed0ee620eb9277ee8421649db094cd9b709f01e643f019`.
- `node --check scripts/proxy-check.mjs` → clean; `--help` renders the pin paragraphs.
- Patch applies to a pristine `0614092` export: `git archive 0614092 | tar -x` + `git apply --check` → `APPLY_CHECK_OK`; selftest in that tree → 116/116.

## Risks / handoff notes
1. `pin.proxy-check` in the lane scorecard is now stale by construction — the integration MUST re-pin this file's sha256, else `PIN_DRIFT` stays red.
2. Live lane is still `DRIFT` on `C2_TOTAL_DRIFT` (79 vs 80) and `AXES_DRIFT coverage` (10 vs 9); those are other arms' numbers, not this one's. Once the scorecard/registry arms land and the pin file exists in the lane, a bare `node scripts/proxy-check.mjs` auto-discovers `--pin` and must read `PROXY: MATCH (… pins=6 match; src-rev=31c465f15669)`.
3. `--selftest` now requires `git` on PATH for its four repo fixtures (throwaway repos in `mkdtemp`, `GIT_CONFIG_NOSYSTEM=1`/`GIT_CONFIG_GLOBAL=/dev/null`, tmp `HOME`, `GIT_CEILING_DIRECTORIES`); on a git-less host the match/mismatch cases FAIL rather than skip — deliberate, since pin verification is impossible there.
4. `SELF_NOT_A_DIR` JSON now reports `src: null` (origin resolution happens after the self check); every other arm's `src` is the resolved tree.
5. Default-pin discovery wins over `$UFO_SRC` when `--src` is absent (the pin owns provenance); this is the claims-check behaviour and is documented in `:56-58` and the `--src` help.
6. No package installs/upgrades were made; no tooling changed.
