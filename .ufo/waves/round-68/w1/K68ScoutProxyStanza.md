VERDICT: proxy-check at the freeze verdicts `PROXY: DRIFT` (exit 1) with 5 stale declared terms — A 351→548, C2/C2_total 156→163, K_members/K_sections 49→53 — while kimi-census is CLEAN at members=53; the close-time stanza refresh must re-declare those five terms (with A re-measured at close, since it counts untracked wave artifacts and moved 548→626 mid-wave).

## Evidence

Lane at HEAD `39f61816d4ee7a8d401df42c1818c91a9c537bce` (the round-68 freeze commit; `git log -1`), detached HEAD, tracked tree clean (only `.ufo/waves/round-68/w1.ready*` untracked at first read). `node v24.21.0`.

`node scripts/proxy-check.mjs` (run 1, verbatim):

```
PROXY  error  A_DRIFT  A: declared=351 computed=548 delta=+197
PROXY  error  C2_DRIFT  C2: declared=156 computed=163 delta=+7
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=156 computed=163 delta=+7
PROXY  error  K_MEMBERS_DRIFT  K_members: declared=49 computed=53 delta=+4
PROXY  error  K_SECTIONS_DRIFT  K_sections: declared=49 computed=53 delta=+4
PROXY  warn  PIN_UNPINNED  scripts/harm-matrix.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY  warn  PIN_UNPINNED  scripts/routed-ledger.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (A_DRIFT term=A declared=351 computed=548 delta=+197; C2_DRIFT term=C2 declared=156 computed=163 delta=+7; C2_TOTAL_DRIFT term=C2_total declared=156 computed=163 delta=+7; K_MEMBERS_DRIFT term=K_members declared=49 computed=53 delta=+4; K_SECTIONS_DRIFT term=K_sections declared=49 computed=53 delta=+4; PIN_UNPINNED term=scripts/harm-matrix.mjs; PIN_UNPINNED term=scripts/routed-ledger.mjs; src-rev=31c465f15669)
EXIT=1
```

Identical re-runs except computed A = 556, then 626 (delta +205, +275). `--json` terms:
`A:556..626, C:33, C1:19/19, C2:163/163, S:88/88, R:92/92, C1k:5/5, K_members:53, K_sections:53,
coverage_script:10, coverage_runtime:10, coverage_kimi:10, operability:9, coverage:10;
pinsMatched:6/6; stanzaLine:287`. No `AXES_DRIFT` — the `## Axes` integers match derivation.

`node scripts/kimi-census.mjs` (verbatim):

```
KIMI_ROOT: /home/vgpnk/.kimi-code
FAMILY K1  members=4  checked=4  frozen=4
FAMILY K2  members=27  checked=27  frozen=27
FAMILY K3  members=10  checked=10  frozen=10
FAMILY K4  members=9  checked=9  frozen=9
FAMILY K5  members=3  checked=3  frozen=3
INFO  CHAIN  config.toml.*.bak  generations=10 (reported as info, never gated)
INFO  COUNT  agents/secondary/  children=18 (counted live, names not gated)
INFO  COUNT  skills/  children=7 (counted live, names not gated)
INFO  ROOT_ENUM  -  root children=37 declared=27 chain=10 strays=0 (root enumerated against K1–K5; drift-chain generations exempt)
TOTALS: members=53 checked=53 errors=0 info=4 chain=10
KIMI_CENSUS: CLEAN (members=53 checked=53 chain=10 info=4)
exit=0
```

Independent counts (the frozen derivations, run by hand at the lane):

- A = `walkFiles(self)` ∩ `/\.(mjs|js|sh|py)$/` (proxy-check.mjs:947, 694-704; excludes only `.git`):
  - `git ls-files | grep -cE '\.(mjs|js|sh|py)$'` → **548** (517 under `.ufo/waves/` — incl. 5 under `round-68/` — plus 31 under `scripts/`: 28 `*.mjs` + `plan-before-ready.sh`, `jj-seat-demo.sh`, `omp-binary-probe.sh`; `harm-cases.json`/`harm-matrix-gates.json` not runnable)
  - `find . -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -not -path './.git/*' | wc -l` → 556 / 573 / 626 on successive reads (live wave writes)
- C = `grep -c '^\s*- \[' SKILL.md` → **33** (= declared)
- C2 = `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` → **163**
- C2_total = `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → **163**

## Findings

1. **K68ScoutProxyStanza-1** — severity: low (stale declaration, refresh-sized). Attacks the
   `kumitate-proxy-v1` stanza's C2 pair: declares 156/156 at SCORECARD.md:294-295; measured
   163/163. The plan's named base drift (`README_MAP: DRIFT files=163 rows=161`) is repaired at
   HEAD — rows and files agree — but the stanza was last declared at 156. Reproduce:
   `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md && find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → `163` `163`.
2. **K68ScoutProxyStanza-2** — severity: medium (close-time process risk). A is worktree-live:
   it counts *untracked* runnable files too, and this wave writes `*.mjs/*.sh/*.py` into
   `.ufo/waves/round-68/build/*/`. Three identical invocations read computed A = 548, 556, 626
   within ~3 min; the stable floor at the freeze commit is `git ls-files` = 548. A close-time
   stanza refresh MUST re-measure after wave artifacts land (or on a clean checkout at the
   measured revision); quoting a mid-wave number re-pins a moving target. Also note for the L1:
   517 of the 548 (94%) are committed wave-artifact scripts under `.ufo/waves/`, so stanza A
   growth is receipt accumulation, not gate-tool growth. Reproduce:
   `node scripts/proxy-check.mjs --json` twice, minutes apart, and diff `.terms.A`; versus
   `git ls-files | grep -cE '\.(mjs|js|sh|py)$'` (stable 548).
3. **K68ScoutProxyStanza-3** — severity: low (re-declaration, no axis harm). The K layer's
   degraded-state declared values are stale: stanza K_members=49, K_sections=49; the live
   substrate holds 53 members and the notes name all 53 (measured K_sections=53), so
   `coverage_kimi` stays 10 and `kimi-census` itself is CLEAN (members=53 checked=53,
   strays=0). Reproduce: `node scripts/kimi-census.mjs`; `node scripts/proxy-check.mjs`.
4. **K68ScoutProxyStanza-4** — severity: low (advisory, warn not error). Two committed
   `scripts/*.mjs` files carry no pin in either stanza: `harm-matrix.mjs` (older gap) and
   `routed-ledger.mjs` (this round's C1 subject — its v2 advance would add a third unpinned
   script until the gate-pins block gains a `pin.routed-ledger` row at integration).
   Reproduce: `node scripts/proxy-check.mjs | grep PIN_UNPINNED`.

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutProxyStanza/terms.md` — verbatim verdicts, declared→measured
  table, refresh values: `C2=163`, `C2_total=163`, `K_members=53`, `K_sections=53`, `A=548`
  tracked-at-HEAD (re-measure at close).
- `.ufo/waves/round-68/w1/K68ScoutProxyStanza.md` — this report.
- No tools installed; read-only measurements only.

## Limits

- A is reported as a range/floor (548 tracked; 548–626 observed live): no way to quote a single
  mid-wave integer honestly; close-time value will differ.
- Layer terms (C1, S*, R*, coverage_*) were taken from the tool's in-process `probeSections`
  derivation at origin src-rev `31c465f15669`; not hand-counted against the pinned clone.
- `--selftest` hermetic suites of proxy-check/kimi-census not run (not asked; measurements only).
- Did not audit why the stanza still declares pre-accumulation values (A=351, C2=156, K=49):
  inferred as "last re-declared at an earlier round close" — the refresh is the fix.
