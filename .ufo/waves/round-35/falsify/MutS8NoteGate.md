ATTACK C2-measurement-path verdict=partial defects=2

## Axes and scope
- Target axis: coverage:script-layer; related control: operability. No score/contract changes made.
- Five independent, single-point mutants; three count/shape mutants killed by the paired detector, two fidelity mutants survived both gates. These are measurement-coverage findings, not evidence that pristine C2 prose is false.
- Scratch root B=/fast/scratch/kumitate-r35/w/MutS8NoteGate. Copied the lane with `cp -a /home/vgpnk/Projects/shokunin/kumitate-shokunin B/pristine`, then copied pristine to the five case directories below. No sibling/source mutations.
- Source: `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`.
- Runtime: `node --version` → `v24.21.0`; no installs/updates. No source programs, services, unrelated tests, or other runtime invoked.

## Detector commands and controls
Both commands ran in each case directory, on pristine, mutated, and exactly restored bytes; 60-second bound per invocation, 30 detector invocations total.
```sh
node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src
node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src
```
Below C/P mean those exact claims/proxy commands. Common actual verdicts C0/P0 (exit 0):
```text
CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)
PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10; S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9; K=51/51 coverage:kimi-layer=10; pins=6 match)
```
C0 also printed `SUMMARY: errors=0 warnings=6`, S8 `sections=60 adv=0`. Every proxy invocation retained this pre-existing warning:
```text
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
```
Every case independently produced C0/P0 before mutation and again after restoration; no baseline failures or inconclusive mutants.

## Per-mutant results
N denotes `corpus/knowledge/remaining-scripts-census.md`; line numbers refer to pristine bytes unless stated otherwise.
| Case directory / mutant | Location and exact change | Expected detector from implementation | Mutated C/P exit | Verdict |
|---|---|---|---|---|
| delete-section | N:627–630, delete complete new `scripts/omp-route-grammar.mjs` section | C count check; P distinct numerator | 1 / 1 | killed by both |
| departed-section | N:814, insert old `## scripts/omp-wave-context.mjs` section with backticked path, copied verbatim from master-tree N:607–610 | C unresolved/count checks; P excludes unresolved identity | 1 / 0 | killed by C; survives P |
| registry-63 | SCORECARD.md:132, first S8 membership cell `60 members` → `63 members`, no other edit | C declared count; P counts source/section identities, not declared S8 total | 1 / 0 | killed by C; survives P |
| anchor-past-eof | N:633, `scripts/prepare-ephemeral-fleet.mjs:82` → `scripts/prepare-ephemeral-fleet.mjs:999999`; retain `:191` | C existential live-anchor check accepts other anchor; P identity-only | 0 / 0 | survived both (D1) |
| nonexistent-symbol | N:633, `readFleetPolicy` → `R35_NO_SUCH_FLEET_POLICY_SYMBOL`, preserving backticks and `composeEphemeralFleet` | C existential symbol check accepts other symbol; P identity-only | 0 / 0 | survived both (D2) |

Actual mutant verdict output (unchanged warnings omitted):
```text
# B/delete-section: C exit 1, S8 sections=59; SUMMARY: errors=1 warnings=6
CLAIMS: DRIFT (MEMBER_COUNT_DRIFT row=S8 declared 60 members, found 59 distinct sections)
# B/delete-section: P exit 1
PROXY: DRIFT (S_SECTIONS_DRIFT term=S_sections declared=88 computed=87 delta=-1; COVERAGE_SCRIPT_DRIFT term=coverage_script declared=10 computed=9 delta=-1; AXES_DRIFT term=coverage:script-layer declared=10 computed=9; PIN_UNPINNED term=scripts/sources-check.mjs)
# B/departed-section: C exit 1, S8 sections=61; SUMMARY: errors=2 warnings=6
CLAIMS: DRIFT (SECTION_FILE_UNRESOLVED row=S8 scripts/omp-wave-context.mjs does not resolve under --src; MEMBER_COUNT_DRIFT row=S8 declared 60 members, found 61 distinct sections)
# B/registry-63: C exit 1; SUMMARY: errors=1 warnings=6
CLAIMS: DRIFT (MEMBER_COUNT_DRIFT row=S8 declared 63 members, found 60 distinct sections)
```
Departed-section and registry-63 P output was exactly P0. Anchor-past-eof and nonexistent-symbol C/P output was C0/P0, including unchanged summaries/warnings.

## D1 — per-anchor fidelity is not measured by the paired gates
- Exact location: `corpus/knowledge/remaining-scripts-census.md:633`; cause: `scripts/claims-check.mjs:377–380` accepts `.some()` live own-file anchor; `scripts/proxy-check.mjs:599–600` counts identity without inspecting anchor validity.
- Commands: C and P in B/anchor-past-eof; actual output C0/P0, both exit 0, despite the planted past-EOF primary citation.
- Bound evidence: `wc -l /fast/scratch/kumitate-r35/src/scripts/prepare-ephemeral-fleet.mjs` → `482`; source line 82 declares `readFleetPolicy`, line 191 declares `composeEphemeralFleet`. The still-live secondary anchor masks the invalid primary one.
- Minimal measurement fix [INFERENCE]: require a reproducible per-citation bounds/nonblank check alongside C2's re-anchor evidence; do not use C/P MATCH alone to prove every citation. No change to the frozen ≥1-anchor contract is authorized or made here.

## D2 — per-symbol fidelity is not measured by the paired gates
- Exact location: `corpus/knowledge/remaining-scripts-census.md:633`; cause: `scripts/claims-check.mjs:382–384` accepts any backticked token occurring anywhere in the file; `scripts/proxy-check.mjs:599–600` does not inspect symbol validity.
- Commands: C and P in B/nonexistent-symbol; actual output C0/P0, both exit 0. The valid secondary `composeEphemeralFleet` masks the nonexistent primary symbol.
- Bound absence sweep: literal search `R35_NO_SUCH_FLEET_POLICY_SYMBOL` in `/fast/scratch/kumitate-r35/src/scripts/prepare-ephemeral-fleet.mjs` using the grep tool → `No matches found`.
- Minimal measurement fix [INFERENCE]: require a reproducible check of each claimed symbol/anchor pairing in C2's fidelity evidence, rather than inferring it from an existential member-section check. Keep the current ≥1-symbol contract unchanged unless separately authorized.

## Quantification and interpretation
- C kills 3/5 (60%); P kills 1/5 (20%); combined detector kills 3/5 (60%); combined survivors 2/5 (40%); inconclusive 0/5.
- Both tested fidelity corruptions survive (2/2): one primary anchor and one primary symbol in a section that retains a valid secondary pair. This is a bounded sample, not an estimated error rate across all 36 re-anchored sections.
- Structural C2 measurements hold against these count/shape attacks. Green C/P cannot independently establish the stronger all-anchor/all-symbol fidelity claim. Independent wave-1 fidelity evidence was not re-judged by this probe.

## Exact restoration and hashes
`sha256sum */corpus/knowledge/remaining-scripts-census.md */SCORECARD.md` was run before mutation and while mutants were active. After each mutated file was restored with `cp -a pristine/<file> <case>/<file>`, the same hash command plus `*/scripts/claims-check.mjs */scripts/proxy-check.mjs` was run; all before/restored hashes matched.
Hn (N, all six copies before/after): `58ae48d8b52338f6e506735a896a5ad1a988971ac9df54f8b9e09b2f37fdaa78`.
Hs (SCORECARD.md, all six copies before/after): `7f52589c3acb62a31dca7fa95e2f98eeb23c8161bb4ab74f5b192177303058d7`.
| Case | Mutated file | Before | Mutated SHA-256 | Restored |
|---|---|---|---|---|
| delete-section | N | Hn | `6ec408f2107433cb541e9d0fd899e7dea6bcc5fb4ceac8a848759fd00188b5ba` | Hn |
| departed-section | N | Hn | `26116bc02208b56b6aa28b97c1831d71371ebf58bf6dcb2a6760cae2a99aa9c6` | Hn |
| registry-63 | SCORECARD.md | Hs | `4e31a7033233dcd6bc6aeaa569c1f85111c19483c7831cb76fb2f3fbd9785e34` | Hs |
| anchor-past-eof | N | Hn | `71a79c10d09387b58230b7a308d4748263923fdb506b192e9dcd314191ae1ff8` | Hn |
| nonexistent-symbol | N | Hn | `f22679cea44f1d7c8d3600099cd42cb8d186873e97ce09e657e0dbe15e848224` | Hn |
Unmodified detector SHA-256 values, before and restored (identical in all six copies):
- claims-check.mjs: `e9a21b441f1216bf41d1cca037b36021c581ec7892df3bf973295f9321b0f61b`.
- proxy-check.mjs: `e58c08017508482fc63620c311681a3783849ddf42e1b34f53900d31a35cc647`.
All five restored pairs again returned C0/P0, exits 0/0. Only this report was written in the lane; no implementation was integrated or shipped.
