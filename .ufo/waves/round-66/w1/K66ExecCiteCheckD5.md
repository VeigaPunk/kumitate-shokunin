VERDICT: The +92 are not receipts or transcripts being scanned — `cite-check-fleet-dot` scans only `SKILL.md` + `corpus/**/*.md` and prunes `.ufo/` — they are 99 added error findings inside 2 new and 2 edited corpus docs (minus 7 line-shift churn), of which 61 are mechanically fixable citation defects (measured patch: 1667→1583 errors at the freeze, 0 new errors), 3 are a gate pin-owner misread (5 of 6 PIN_MISMATCH pins are byte-equal to a committed capture), 10 are upstream omp commit pins the gate's search space cannot contain, 15 are genuinely dangling names, 2 are further fixable upstream paths and 1 is a forward reference.

## Evidence

Gate definition and run shape: `scripts/harm-matrix-gates.json` (line `cite-check-fleet-dot`: `node scripts/cite-check.mjs --fleet .`, verdict `^CITE_CHECK: (\w+)`, clean `CLEAN`, exit in [0]); SKILL.md:607 names the gate. `--self` defaults to the repo containing the script (`DEFAULT_SELF = resolve(HERE,'..')`, cite-check.mjs:99), `--fleet` defaults/overrides to `resolve('.')` = cwd (cite-check.mjs:272), so under harm-matrix the run is `self == fleet == sandbox root`.

Scan set (this is the crux): `listDocs` = `SKILL.md` + `corpus/**/*.md` only (cite-check.mjs:311-319); `EXCLUDE_DIRS` contains `.ufo` (cite-check.mjs:121); a token with a `.ufo/` prefix is graded `runtime/OK` note, "never a source citation" (cite-check.mjs:198, :937-947). At the freeze: `filesScanned=164 docs=164` and `1 + $(find corpus -name '*.md' | wc -l) = 164`; `grep -c '^\.ufo/' cc-freeze.txt` → `0`.

Reproduction (one `git clone --shared` of the lane in scratch, `checkout --detach` per rev, cwd = clone, `TMPDIR` in scratch; command identical to the registry argv):
```
47fe2383151909d31557ada118ad84f90404dc6c  CITE_CHECK: DRIFT (files=161 tokens=12033 errors=1545 warnings=766)  EXIT=1
52f8497987eaae42c3be668cdd5e90a34c5bf48e  CITE_CHECK: DRIFT (files=163 tokens=12255 errors=1637 warnings=812)  EXIT=1
621212bac37f8249c72ac982d1d6534cb8d60701  CITE_CHECK: DRIFT (files=164 tokens=12313 errors=1667 warnings=821)  EXIT=1
```
1545 → 1637 (+92) and 1637 → 1667 (+30) reproduce the lesson's numbers exactly.

Per-file attribution (from `--json`, `files[].findings[].severity==="error"`; full table in `perfile.tsv`):
```
corpus/lessons/round-65.md                         base 0  M 59  freeze 58   delta_M +59
corpus/knowledge/omp-installed-release-mcp-runtime.md  0     24        24          +24
corpus/SOURCES.md                                  19     27        27           +8
corpus/knowledge/omp-task-contract.md               0      1         1           +1
corpus/README.md                                    7      7         7            0   (7 added / 7 removed: line-shift churn)
```
Set-diff by (file,kind,token,line), base→M: `ADDED=99 REMOVED=7 NET=92`. M→freeze: `ADDED=38 REMOVED=8 NET=30` = the new spot-check lesson (+31) − the forward reference `corpus/lessons/round-65-verifier-spotcheck.md` that round-65.md:126 cited before it existed (−1) + README churn (7/7).

Measured fix (applied only inside my clone at the freeze; patch `fix-D5-doc-citations.patch`, 3 files, 51 insertions/51 deletions, `git apply --check --reverse` → OK):
```
before: CITE_CHECK: DRIFT (files=164 tokens=12313 errors=1667 warnings=821)  EXIT=1
after : CITE_CHECK: DRIFT (files=164 tokens=12311 errors=1583 warnings=821)  EXIT=1
per doc: round-65.md 58→16 (-42) · spot-check 31→8 (-23) · omp entry 24→5 (-19) · SOURCES 27→27 · omp-task-contract 1→1
NEW ERRORS anywhere in the repo: 0        (total -84, warnings unchanged)
```
Rewrite classes (82 replacements, `rewrite2.log.txt`): 56 → `.ufo/waves/round-65/<token>`, 3 → another round's wave dir, 16 → a committed round-65 capture, 4 → absolute fleet paths, 2 → full URLs (de-elided), 1 → `~/.omp/mcp.json`.

Pin ownership verified by bytes (`sha256sum` in the clone / host):
```
eedfbbc405d55fdb…  .ufo/waves/round-65/build/K65ScoutCommit/capture/10bce690.patch
caa3eadeb21bc36d…  …/K65ScribeRowsDraft/capture/omp-v18.12.6-packages-coding-agent-src-mcp-types.ts
479aef6ddda012f8…  …/K65ScribeRowsDraft/capture/omp-v18.12.6-packages-coding-agent-src-mcp-client.ts
41ad7d5b3ff364ba…  …/K65ScribeRowsDraft/capture/omp-v18.12.6-packages-coding-agent-src-mcp-transports-http.ts
362acea5d3d0eca0…  …/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md
```
Fleet rung is dead: `indexFiles=1502 selfIndexFiles=212 fleetIndexFiles=212` (identical ⇒ `fleet == self`); `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` and `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh` exist but cannot resolve under `--fleet .`.

## Findings

**K66ExecCiteCheckD5-1 (high, attribution — attacks the lesson's §2/§6 claim).** The +92 is not "over 2 new files (`close/harm-matrix-…txt`)". Receipts are unreachable by construction (scan set = SKILL.md + `corpus/**/*.md`; `.ufo` pruned and exempt; 0 findings under `.ufo/` at any rev). The +92 is exactly: `corpus/lessons/round-65.md` +59, `corpus/knowledge/omp-installed-release-mcp-runtime.md` +24, `corpus/SOURCES.md` +8, `corpus/knowledge/omp-task-contract.md` +1, with `corpus/README.md` net 0 (7/7 churn). Reproduce: `S=/fast/scratch/hyaku/kumitate-r66/K66ExecCiteCheckD5; node $S/diff.mjs 47fe238 52f8497` → `ADDED=99 REMOVED=7 NET=92`.

**K66ExecCiteCheckD5-2 (high, real citation defects — 61 of 92).** The dominant class is a wave-relative receipt/artifact path written without its lane-absolute prefix: `base/harm65-base.txt`, `close/harm65-measured.txt`, `w1/K65ScoutTypesTs.md`, `build/K65ScoutTypesTs/capture/types.ts`, `probe/omp65-probe.mjs`… Each target exists verbatim at `.ufo/waves/round-65/<token>`; the doc patch resolves 56 of them that way plus 3 cross-round, 4 fleet-absolute, 2 full-URL and 1 home-config, and 16 upstream omp paths are re-anchored to the committed capture that already backs the same row. Before/after: 1667 → 1583 errors, 0 new. Reproduce: `node $S/rewrite2.mjs 621212ba` then rerun the gate.

**K66ExecCiteCheckD5-3 (high, gate misread — 6 PIN_MISMATCH, 5 provably false).** `pinFindings` attributes a content pin to the nearest *preceding* token with a `targetPath` (cite-check.mjs:1521-1528) and never looks forward or at non-local owners. `corpus/lessons/round-65.md:86` pin `eedfbbc` is byte-equal to `.ufo/waves/round-65/build/K65ScoutCommit/capture/10bce690.patch`, cited later in the same line; the gate instead hashed `corpus/knowledge/omp-installed-release-mcp-runtime.md` and reported `PIN_MISMATCH`. Same for `caa3eade` (spot-check:46), `362acea5` (:49), `479aef6d` (SOURCES:156), `41ad7d5b` (SOURCES:158). The sixth, `85d9daf3` (spot-check:29), is a host-binary digest whose owner `~/.local/bin/omp.real` **does not exist on this host** (only `~/.local/bin/omp`), so its mismatch is also against an unrelated doc. Reproduce: `sha256sum` the five capture paths above; `grep -n 'eedfbbc' corpus/lessons/round-65.md`.

**K66ExecCiteCheckD5-4 (medium, dangling citations — 15).** Names that exist nowhere in the lane: 6 staged merge entries (`omp-mcp-protocol-version-code.md`, `omp-mcp-version-negotiation-decision.md`, `omp-host-harness-protocol-skew-2026-10-27.md`, `omp-session-sharing-and-mcp-lifecycle.md`, `omp-mcp-migration-tracker-state-2026-10-27.md`, `omp-advisor-and-mcp-transports.md`; `merge/kumitate/` exists neither in the lane nor at the fleet root), `exactly-once-attribution.md`, `docs/collab.md` ×3, `RevS126Quote.md` (ambiguous: round-60 and round-62 both hold one), `close/supplementary-c2.txt` (the round-65 close dir holds no such file), `scripts/class-recurrences.sh` (the plan itself records that idea 4's script "never landed"; only a wave-build copy `build/K65ScribeQuality/class-recurrences.sh` exists), plus `packages/coding-agent/CHANGELOG.md` and `test/mcp-http-transport.test.ts` in the entry. Reproduce: `node $S/classify.mjs 621212ba corpus/lessons/round-65.md` (15 `NOWHERE`).

**K66ExecCiteCheckD5-5 (medium, registry configuration — not a doc defect).** `--fleet .` makes the fleet rung a no-op (`resolve('.') == --self`; `selfIndexFiles == fleetIndexFiles == 212`), so the registry's claim that it "pins the fleet parent inside the sandbox" is false: it pins the *lane* as its own parent. Consequence: any legitimate fleet-parent citation (`scripts/sources-census.sh`, `scripts/hyaku/jj-lane.sh`, both present at `/home/vgpnk/Projects/shokunin/scripts/`) is a permanent UNRESOLVED. Fix (L1, registry, one token): use a fleet-parent rung only in an explicit `--fleet ..` invocation and keep the sandbox run fleet-free, or state the collapse in the gate's `scope` string. Reproduce: `grep indexFiles cc-freeze.txt`.

**K66ExecCiteCheckD5-6 (low, declared limit — 10).** Upstream omp commit pins (`10bce690…` ×4, `45c35e40…` ×2, plus 4 more in SOURCES rows for other repos) are `REV_UNKNOWN` because the gate searches only self/src/fleet and never the omp repo. Not fixable in the doc except by dropping the pin; should be a declared, budgeted class.

**K66ExecCiteCheckD5-7 (info).** Elided names are unresolvable by construction: `close/harm-matrix-47fe…-2b1f….txt` (the real file is `close/harm-matrix-47fe2383151909d31557ada118ad84f90404dc6c-2b1f416e07b743caae8bcbdd0e9a74ea128feb64.txt`), `…/v18.12.6/packages/...` and `…/corpus/SOURCES.md`. The patch de-elides them; the lesson should not abbreviate a citable name.

**Residual after the patch — 31 of the +92, fully attributed:** 10 upstream commit pins (D5-6) + 3 remaining pin false positives (`85d9daf3`, and the two SOURCES pins whose capture the doc does not cite locally) + 15 dangling (D5-4) + 2 SOURCES upstream paths still un-anchored (`packages/coding-agent/src/mcp/`, `src/web/search/providers/zai.ts` — same capture rule applies, +2 more in a second pass) + 1 forward reference that the spot-check lesson resolved at the freeze.

**Recommended fix order (all strengthen, none relax):** (1) apply `fix-D5-doc-citations.patch` to `corpus/lessons/round-65.md` and `corpus/lessons/round-65-verifier-spotcheck.md` (−65 at the freeze, no prose risk); (2) re-anchor the entry's upstream paths to the committed captures, but re-word by hand — the mechanical replacement leaves sentences like "`client.ts` 479aef6d" reading as a capture path where the prose says "at the tag", so the author-facing form is the row idiom `S204:120`/`S201:181` with the capture path in `## Located quotes`; (3) fix the six pin owners by citing the capture next to the pin (doc-side, no tool change), and only then consider the gate rule — *a content pin whose nearest preceding citation is not a local file is `PIN_UNTYPED`, not `PIN_MISMATCH`* — which would move 6 errors to notes at the freeze but requires a `--selftest` case and a `counter-pins` re-pin (30 pins), so it is L1's call, not this seat's; (4) name the 15 dangling artifacts as staged/unlanded prose instead of paths.

## Artifacts
All under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecCiteCheckD5/`:
`fix-D5-doc-citations.patch` (proposed doc fix, reverse-applies clean), `cc-base.txt`, `cc-M.txt`, `cc-freeze.txt`, `cc-freeze-fixed1.txt`, `cc-freeze-fixed2.txt` (gate stdout+stderr per rev / per fix pass), `perfile.tsv` (per-file error/warn/kinds, 137 rows), `diff-base-M.txt`, `diff-M-freeze.txt` (set diffs with every added/removed finding), `rewrite2.log.txt` (all 82 rewrites + 21 skips), `class-round65.md.txt` (resolvability of each round-65.md error).

## Limits
- Ran the gate at 47fe238, 52f8497 and 621212ba only; not at lane HEAD `88041bc9` (post-freeze ready-marker commits).
- `--fleet ..` (the fleet-rung repair, D5-5) is not measured: in a sandbox the parent is the scratch dir, not `/home/vgpnk/Projects/shokunin`.
- The gate-side pin-owner rule is proposed as text, **not applied or run**: its −6 is arithmetic from the verified sha256 diagnosis, not a measured gate run, and its selftest/counter-pins cost is unmeasured.
- `85d9daf3` (host-binary digest) could not be re-verified: `~/.local/bin/omp.real` is absent on this host.
- The 1545 base errors in the other 130 docs were not audited — out of D5 scope; D5 only attributes the delta.
- No tool installs were needed; no pacman/uv/npx invocation was made.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66ExecCiteCheckD5` (clone + tmp) is deleted after this report; every cited receipt was copied into the build dir first.
