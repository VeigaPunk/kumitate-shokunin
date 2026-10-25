VERDICT: The coverage map and pins at a9531c8e are CLEAN (files=153 rows=153 covered=153; 16/16 selftest; S196/S197 cited clean), the R56-V3 recurrence reproduces exactly as the 9th instance (unmapped round-63-verifier-spotcheck.md → DRIFT exit 1), and the L1 should land this round the minimal two-piece mechanism — `readme-map-close.mjs` (attested close receipt requiring exit 0) plus `readme-map-append.mjs` (writer) — demonstrated pass-on-legit/fail-on-unmapped in scratch; the wildcard row and receipt-alone alternatives are rejected.

## Evidence

1. Measured rev `a9531c8e617338fd16cb69c61344ef8f17711117` (lane HEAD; `git status --porcelain corpus .ufo/pins scripts` empty):
```
README_MAP: CLEAN files=153 rows=153 covered=153        EXIT=0
```
2. Pins vs files (clean `git archive`): `pins 153 unique 153 files 153 unmapped [] phantom []`.
3. `node scripts/readme-map.mjs --selftest` → `README_MAP_SELFTEST: PASS (16/16)`.
4. `node scripts/cite-sources.mjs` → `CITE_SOURCES: CLEAN cited=190` EXIT=0; selftest `PASS (8/8)`. S196 (`corpus/SOURCES.md:148`), S197 (`:149`) are registry rows; cited in `corpus/README.md:187-188` and the entry `corpus/knowledge/multi-agent-coordinator-topologies.md:1-2`.
5. Recurrence probe (archive + `corpus/lessons/round-63-verifier-spotcheck.md`, no row/pin):
```
README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md
README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md
EXIT=1
```
6. proxy-check on clean archive of a9531c8e (verbatim tail):
```
PROXY: DRIFT (A_DRIFT term=A declared=117 computed=201 delta=+84; C2_DRIFT term=C2 declared=150 computed=153 delta=+3; C2_TOTAL_DRIFT term=C2_total declared=150 computed=153 delta=+3; K_MEMBERS_DRIFT term=K_members declared=52 computed=49 delta=-3; K_SECTIONS_DRIFT term=K_sections declared=52 computed=49 delta=-3; PIN_DRIFT term=pin.proxy-check declared=7f73f8e... computed=cc4a2ea7a...; PIN_UNPINNED term=scripts/inline-dispatch-evidence.mjs; src-rev=31c465f15669)
```
`pin.readme-map=b1c8bf97...` in `SCORECARD.md:326` matches the committed script bytes.
7. Mechanism demo (scratch fixture; `build/K63R2ExecReadmeMapFinal/30-runlog.txt`):
```
A legit (R1): README_MAP_CLOSE: CLEAN recorded-exit=0 rev=841e1b6...   A_EXIT=0
B unmapped (R3): README_MAP_CLOSE: DRIFT recorded-exit=1 map-exit=1   B_EXIT=1
C writer: row=inserted pin=inserted → README_MAP: CLEAN files=154 rows=154 covered=154 → close CLEAN   C_CLOSE_EXIT=0
D idempotent row=present pin=present EXIT=0; phantom FAIL-CLOSED reason=no such corpus file EXIT=2
```

## Findings

**K63R2ExecReadmeMapFinal-1** (high; attacks the integration surface). The map itself is CLEAN at the measured rev, but the mapping is only as good as its close-time invocation: nothing at round close executes `readme-map` after the closure lands its file (proxy-check/round-gate are parent-frozen; Q32 is advisory). Reproduce: evidence 5 (9th recurrence of the R56-V3 class). Fix: land the close gate `readme-map-close.mjs` + writer `readme-map-append.mjs` (build dir, patches `10-`/`11-`).

**K63R2ExecReadmeMapFinal-2** (high; attacks integrated state). `proxy-check` reads DRIFT at a9531c8e on seven terms: A (117 vs 201 — wave-1 committed `.ufo/waves/round-63/build(+tools)` add 78 runnable files), C2/C2_total (150 vs 153), K_members/K_sections (52 vs 49, live kimi root), `pin.proxy-check` (stale declared hash), PIN_UNPINNED inline-dispatch-evidence. The scorecard stanza must be re-measured/re-pinned at the tip; C2/C2_total must read 153/153. Reproduce: evidence 6.

**K63R2ExecReadmeMapFinal-3** (medium; attacks the tempting fix). A receipt alone cannot enforce: `receipt-evidence verify` reproduces any recorded exit, so an unmapped close attests `"exit":1` and still reads `HELD`. The close gate must require recorded exit 0 (demo B vs A). Reproduce: fixture demo B (`receipt-attest: command-exit 1` → HELD).

**K63R2ExecReadmeMapFinal-4** (medium; wave-1 artifacts gap). `.ufo/waves/round-63/build/K63ExecReadmeMapRepair/apply/` (writer + structural-fix markdown + patches) is absent from the build dir; only `sp/{a,b}` scorecard variants, `wildcard/` mutant mirror and `*.log` survive. The L1 cannot re-integrate the wave-1 patch files; this seat's drafts are the reconstruction.

**K63R2ExecReadmeMapFinal-5** (low; rejected alternative re-confirmed). The wildcard row (`wildcard/corpus/README.md:185`, mutant gate c5da7e47…) reads CLEAN for a genuinely unmapped spot-check — it removes exactly the failure the class needs. Do not land it.

## Artifacts

- `.ufo/waves/round-63/build/K63R2ExecReadmeMapFinal/00-proposal.md` (recommendation, QUALITY amendment text, scorecard stanza notes)
- `.ufo/waves/round-63/build/K63R2ExecReadmeMapFinal/10-readme-map-close.patch`, `11-readme-map-append.patch` (new scripts; sha256 ceac228e… / 1577bdbc…)
- `.ufo/waves/round-63/build/K63R2ExecReadmeMapFinal/30-runlog.txt`, `40-verification.txt` (verbatim runs)
- Scratch: `/tmp/kumitate-r63/K63R2ExecReadmeMapFinal/{clean,fixture,mec}` (git-only fixture; never the lane)

## Limits

- Did not edit the lane (no writes outside report/build; corpus/pins/scripts untouched); all changes are drafts in the build dir for the L1 to integrate.
- Did not run the frozen round-63 counter arms (`INLINE63`, `TOPOLOGY63`) or other wave-2 seat surfaces.
- K_members/K_sections drift reflects the live external `/home/vgpnk/.kimi-code` (49 members) vs declared 52 — external substrate, not a map defect.
- Close-receipt enforcement beyond the lane (validator/dispatcher side) was not verified from inside the repo.
- No tool installs/upgrades were performed (nothing was needed).
