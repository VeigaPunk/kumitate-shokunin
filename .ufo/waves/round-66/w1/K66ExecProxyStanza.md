VERDICT: The `kumitate-proxy-v1` stanza was a stale round-64 claim (not a broken derivation); refreshing it on a scratch clone gives `PROXY: MATCH` exit 0 in both default and `--strict` mode, and the base receipt's `coverage declared=10 computed=9` is a **C2/README-map** artifact with **no K-layer cause** — proven by a controlled `--kimi-root` experiment.

## Evidence

### 1. The base DRIFT reproduced on a clean checkout of the base tree

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive 8d557f85 | tar -x -C …/base-tree
$ cd …/base-tree && node scripts/proxy-check.mjs --json
EXIT=1
terms: {'A': 455, 'C': 33, 'C1': 19, 'C1_total': 19, 'C2': 159, 'C2_total': 160, 'operability': 9,
        'coverage': 9, 'S_members': 88, 'S_sections': 88, 'R_members': 92, 'R_sections': 92,
        'coverage_script': 10, 'coverage_runtime': 10, 'C1k': 5, 'C1k_total': 5,
        'K_members': 53, 'K_sections': 53, 'coverage_kimi': 10, 'pinsMatched': 6, 'pinsTotal': 6}
error A_DRIFT A 351 455
error C2_DRIFT C2 156 159
error C2_TOTAL_DRIFT C2_total 156 160
error K_MEMBERS_DRIFT K_members 49 53
error K_SECTIONS_DRIFT K_sections 49 53
error AXES_DRIFT coverage 10 9
warn  PIN_UNPINNED scripts/harm-matrix.mjs
```

Matches `base/proxy-before.txt` except `K_members`/`K_sections` (52 there, 53
here) — the live `~/.kimi-code` changed under the measurement; see §3.

### 2. The refreshed stanza → PROXY: MATCH (patch applied on scratch clone at lane tip `f29eb699`)

```
$ cd …/lane2 && node scripts/proxy-check.mjs
PROXY: MATCH (A=523 C=33 operability=9; C1=19/19 C2=162/162 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
EXIT=0

$ cd …/lane2 && node scripts/proxy-check.mjs --strict
PROXY: MATCH (A=523 C=33 operability=9; C1=19/19 C2=162/162 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
STRICT_EXIT=0
```

Before the patch, on the same tip:
```
PROXY: DRIFT (A_DRIFT …; C2_DRIFT …; C2_TOTAL_DRIFT …; K_MEMBERS_DRIFT …; K_SECTIONS_DRIFT …; PIN_UNPINNED scripts/harm-matrix.mjs; PIN_UNPINNED scripts/routed-ledger.mjs; src-rev=31c465f15669)
EXIT=1
```
`--selftest` on the patched clone: `PROXY_SELFTEST: 122/122 pass` / `VERDICT: PASS`, exit 0.

### 3. `coverage declared=10 computed=9` — a C2 artifact, NOT the K layer

`coverage = floor(10 × C1/C1_total × C2/C2_total)` (`scripts/proxy-check.mjs:749-751`, `:962`).
C2 = README rows, C2_total = corpus notes. The K terms feed only
`coverage:kimi-layer`. Two controlled experiments on the patched tree:

```
# (a) K layer's search-index member REMOVED (secret-free fixture, exact live shape)
$ node scripts/proxy-check.mjs --kimi-root …/kn --json
K_members 52  K_sections 52  coverage_kimi 10  coverage 10      ← no drift at all

# (b) K layer intact, one C2 README row REMOVED
$ node scripts/proxy-check.mjs --json
C2 161  C2_total 162  coverage 9  coverage_kimi 10
AXES_DRIFT coverage coverage: ## Axes row=10 derived=9
```

(a) proves removing the K member moves `K_members` and `K_sections` together
and changes no score. (b) reproduces the base's `AXES_DRIFT coverage` with K
untouched. The base's cause was `lessons/round-65-verifier-spotcheck.md` having
no README row — the same defect `base/readme-map-before.txt` names
(`README_MAP: DRIFT files=160 rows=159 … first=uncovered:lessons/round-65-verifier-spotcheck.md`).
The kimi-census `MEMBER_MISSING search-index/` is a separate real host fact
(absent at base, present now: `drwxr-xr-x … Oct 27 03:40 search-index`); because
`coverage_kimi = floor(10 × 5/5 × K_sections/K_members)` and both terms move
together, that axis stays 10 either way — the ratio cannot show the move,
exactly as the lane's own round-42 note says.

### 4. `A` — the lane's own definition is the whole story

`A` = every `.mjs/.js/.sh/.py` file under the lane tree (`RE_RUNNABLE`, `walkFiles(self)`),
**including throwaway round probes and wave build artifacts**. Measured:
base archive 455 → freeze commit 460 → tip 523 (of which 64 are untracked
round-66 build artifacts alone). `git ls-files | grep -cE '\.(mjs|js|sh|py)$'`
= 523 = `git archive HEAD | tar -t | grep -cE '\.(mjs|js|sh|py)$'` = 523, so the
committed-tree count and the gate's count agree. `A` is therefore a moving
target by construction and MUST be refreshed at every close; the lane's own
round-45 note already records this.

### 5. `scripts/omp-binary-probe.sh` IS pinnable

The gate's `GATE_PINS` map is keyed by file path with no extension
restriction — `pin.plan-before-ready` (`scripts/plan-before-ready.sh`) and
`pin.jj-seat-demo` (`scripts/jj-seat-demo.sh`) already name `.sh` files. A
`.sh` gate pins exactly like a `.mjs` one, so `pin.omp-binary-probe` is added.

## Findings

**K66ExecProxyStanza-1 — the D4 stanza drift is a stale claim, not a broken
derivation (severity: medium; attacks `kumitate-proxy-v1`).**
The stanza was last refreshed at round 64 (`A=351`); 16 rounds of added files
made it stale. Every derived term the gate computes is correct; only the
declared copy is old. Fixed by refreshing the block. Reproduce:
`git -C <lane> archive 8d557f85 | tar -x -C /tmp/b && cd /tmp/b && node scripts/proxy-check.mjs` → exit 1.

**K66ExecProxyStanza-2 — `coverage declared=10 computed=9` is a C2/README-map
artifact, and the seat's hypothesis that it is a K-layer
`MEMBER_MISSING` artifact is FALSE (severity: medium; attacks the D4
diagnosis).**
`coverage` contains no K term. Removing the K member changes no score (§3a);
removing one C2 README row reproduces the exact drift (§3b). The honest
reading of the base receipt is: a real drop of the retired aggregate `coverage`
axis caused by one missing README row (`lessons/round-65-verifier-spotcheck.md`,
routed D7), repaired by adding the row — not by anything in the K layer.
Reproduce: `node scripts/proxy-check.mjs --kimi-root <fixture-without-search-index> --json`
→ `coverage 10`; then delete one README row and re-run → `coverage 9`.

**K66ExecProxyStanza-3 — the `K_members`/`K_sections` drift is host
volatility, not lane content (severity: low; attacks the K terms).**
`K_members`/`K_sections` are read live from `~/.kimi-code`
(`K_MEMBER_RULES`), so they move when the host's Kimi install changes:
`~/.kimi-code/search-index` was absent at the base receipt (52/52) and exists
now (53/53). The stanza must declare the live value; `coverage:kimi-layer`
stays 10 because numerator and denominator move together. Reproduce:
`ls -ld ~/.kimi-code/search-index`; `node scripts/kimi-census.mjs` →
`CLEAN (members=53 checked=53 …)`.

**K66ExecProxyStanza-4 — the two unpinned gates are `harm-matrix.mjs` and
`routed-ledger.mjs`; the refresh must also extend `GATE_PINS`
(severity: medium; attacks pin coverage).**
Both are `scripts/*.mjs` with no `pin.<name>` key in either block, so the gate
raises `PIN_UNPINNED` for each and `--strict` (the lane's checklist item 8)
turns the warnings into DRIFT. The fix is not a scorecard edit alone: a
`kumitate-gate-pins-v1` key the gate does not know fails closed with
`GATE_PIN_KEY_UNKNOWN` (exit 2, `scripts/proxy-check.mjs:1067`), so
`GATE_PINS` in `scripts/proxy-check.mjs` must gain the keys first. That edit
changes proxy-check's own bytes, so `pin.proxy-check` must be re-pinned in the
same patch — a self-reference that a naive two-file patch gets wrong.
Reproduce: `node scripts/proxy-check.mjs --strict` → exit 1 with two
`PIN_UNPINNED` warnings.

**K66ExecProxyStanza-5 — the refresh is a recurring chore, so it should be a
command (severity: low; attacks operability of the close).**
`A` counts every runnable-extension file in the tree, so it breaks on every
commit that adds one — the wave added 63 such files under
`.ufo/waves/round-66/build/` alone. Hand-editing the block guarantees the same
drift next round. `refresh-proxy-stanza.mjs` (in the build dir) recomputes both
blocks from the tree by calling the gate's own `--json` output and reading its
own `PINS`/`GATE_PINS` maps, so it cannot disagree with the gate.
`--check` exits 1 when stale, `--write` rewrites the blocks.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecProxyStanza/D4-proxy-stanza.patch` — the fix, as a unified diff against lane tip `f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed`: `scripts/proxy-check.mjs` (+3 `GATE_PINS` keys), `SCORECARD.md` (stanza + 3 gate pins + `pin.proxy-check` re-pin), `corpus/README.md` (+1 row for `lessons/round-66-verifier-spotcheck.md`). Verified on a scratch clone: `PROXY: MATCH` exit 0, `--strict` exit 0.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecProxyStanza/D4-refresh-recipe.md` — how to apply, how to re-refresh, and the full coverage/K analysis.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecProxyStanza/refresh-proxy-stanza.mjs` — the deterministic refresher (`--check` / `--write`).
- This report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/w1/K66ExecProxyStanza.md`.

## Limits

- I did not edit the lane. Every change above exists only on scratch clones under `/fast/scratch/hyaku/kumitate-r66/K66ExecProxyStanza/` (removed on exit) and as patch text in the build dir. The L1 applies it.
- The lane HEAD moved twice while I worked (`88041bc9` → `5b02f807` → `f29eb699`); the patch and the MATCH evidence are against `f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed`. A later commit re-breaks `A` and needs another refresh — that is the expected behaviour of `A`, not a defect in this patch.
- `A=523` is the count at `f29eb699`. If the L1 applies the patch after more wave artifacts land, `A` will differ and must be re-measured (the refresher does it).
- The `corpus/README.md` row I propose is prose I wrote; the L1 may want different wording. Only its presence matters for `C2`.
- I did not verify the round-66 claims C1/C2 (`LEDGER66 held=3/6`, `DEPREC66 held=0/8` before and after my patch — unchanged by it). M8's `readme-map` sub-term reads `false` on my patched tree because my proposed README row is not yet in `corpus/README.md`'s pin set; on the lane it will be.
- I did not check the frozen `.ufo/pins/counter-pins.json` registry: none of its entries name `SCORECARD.md` or `scripts/proxy-check.mjs`, so the patch cannot break it (`grep -c SCORECARD .ufo/pins/counter-pins.json` → 0).
- Secret material was never read: the K-layer experiments used a synthetic fixture built from member NAMES only.
