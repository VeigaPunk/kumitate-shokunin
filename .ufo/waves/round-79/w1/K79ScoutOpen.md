# K79ScoutOpen — independent before-state recon (kumitate round 79)

Read-only seat. Nothing edited, nothing committed, nothing installed (tools installed: **none**).
Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; base `5019803b4e451094cf58c555408ea37490cbc07a`;
scaffolding `ba940b512d980218b11ed6f34ac2f304c01287ee`; origin `--src` `/fast/scratch/hyaku/kumitate-pin/src`
(proxy reads it `src-rev=31c465f15669`). Host Linux 7.2.11-arch1-1 x86_64, node v24.21.0.
Every tree measured is a `git archive <rev> | tar -x` extraction, so the readings are pinned to immutable bytes.

Receipts in this directory: `refs.txt`, `refs-toolscope.txt`, `dead-list.txt`, `refs-compare.txt`,
`k-before.txt`, `gates.txt`, `base-clean.json`, `base-denamed.json`, `base-modeviol.json`,
plus the methods (`refs-measure-v2.py`, `capture.sh`, `capture-k.sh`).

---

## 1. The r78 report's evidence pointers (C2's red-before) — `refs.txt`, `dead-list.txt`

Report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-78/kumitate.md`,
sha256 `f690710edfac4331d4afbd51a1ab207c8569f0400f97a0476563f8d36cc5ae02` (identical before and after this recon).
Command `python3 refs-measure-v2.py` (model in the script header: backticked inline spans + fenced blocks,
extension allow-list `txt json jsonl md mjs js sh py html tsv csv log`, trailing `:N`/`:N-M` stripped,
scheme tokens skipped, first occurrence wins; bases = lane root → report dir → `<lane>/.ufo/waves/round-78/`).

```
REFS=47 RESOLVED=34 DEAD=13 FIRST_DEAD=close/proxy-json.txt      # raw scope
refs=44 dead=10 first=close/proxy-json.txt                       # pointer scope (below)
```

Pointer scope drops three tokens that are not literal repo paths: `controls/*.txt` (a glob) and the bare
command names `fleet-commit.sh`, `sources-census.sh` (both exist — at
`/home/vgpnk/Projects/shokunin/scripts/hyaku/fleet-commit.sh` and `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`
— but under none of the three bases). Same ten dead either way.

| dead pointer | class | where the content lives |
|---|---|---|
| `close/proxy-json.txt` | receipt-shaped | `close/proxy.txt` (`PROXY: MATCH (A=874 …)`) |
| `close/census-selftest.txt` | receipt-shaped | `close/selftests.txt` |
| `close/proxy-selftest.txt` | receipt-shaped | `close/selftests.txt` |
| `close/omp-census-selftest.txt` | receipt-shaped | `close/selftests.txt` (aggregated) |
| `close/proxy-check.txt` | receipt-shaped | `close/gates.txt` |
| `close/mutants-c2.txt` | receipt-shaped | **no `close/` receipt at all** — `build/K78MutC2/battery-standin.txt` |
| `SOURCES.md` | general | `corpus/SOURCES.md` |
| `knowledge/shape-receipt-live-drift.md` | general | `corpus/knowledge/shape-receipt-live-drift.md` |
| `knowledge/kimi-plane-single-derivation.md` | general | `corpus/knowledge/kimi-plane-single-derivation.md` |
| `amended-plan-observed.md` | general | `build/K78CriticClaims/amended-plan-observed.md` |

Base-tree instrument: `base/scripts/report-receipt-diff.mjs` is `kumitate-report-receipt-diff-v3`;
`grep -c POINTER_DEAD` → **0**, `grep -c HASH_DEAD` → 10 (the id exists). The pre-data control agrees:
`controls/c2-base.txt` → `arm r78-pointers FAIL … dead=0 first=none ids=RECEIPT_MISSING,HASH_DEAD`,
`arm fixture-missing FAIL exit=0`, `C79_C2: HELD held=9/12`.

**One substantive gap, not a naming slip:** `close/mutants-c2.txt` (which the r78 report cites for
`MUTANTS78_C2: ALL-KILLED killed=10/10`) has no `close/` receipt; the battery text survives only in the
seat's `build/` dir. Eight of the nine other dead pointers are recoverable under another name; this one is not.

## 2. The K plane's before state (C1's red-before) — `k-before.txt`

Fixture built from the frozen spec `.ufo/waves/round-79/probe/kimi-fixture.json` (32 members, 30 file
children at 0644; 62 entries total) → `fixture/kimi`. Base tree `5019803b`.

| arm | command | K_sections | K_members | K_findings | C1k | `coverage_kimi` | base formula | composite |
|---|---|---|---|---|---|---|---|---|
| clean root | `--kimi-root fixture/kimi --json` | 55 | 55 | 0 | 5/5 | **10** | 10 | 10 |
| one heading de-named | same, on a copy | **54** | 55 | 0 | 5/5 | **10** | **10** | **9** |
| mode-violating (`mcp.json` 0200) | same | 55 | 55 | **1** | 5/5 | **9** | 9 | 9 |
| live root at tip `8a733ab0` | default `~/.kimi-code` | 55 | 55 | 0 | 5/5 | 10 | 10 | 10 |

Exit codes: every base run exits **1** (the pre-scaffolding `C2_TOTAL_DRIFT` 190/191 and `AXES_DRIFT`
coverage 10→9); the live-root run exits 1 on `A_DRIFT` only.

- **The r78 harm reproduces exactly**: de-naming `## \`~/.kimi-code/sessions/\` — the worktree-keyed session store`
  (`corpus/knowledge/kimi-session-state.md:50` → `## The worktree-keyed session store`) drops `K_sections`
  55 → 54 and fires `K_SECTIONS_DRIFT`, yet the score stays **10**. The composite would read **9**.
- **The findings factor is already live** at base: the mode-violating root reads `K_findings=1`,
  `coverage_kimi=9`, `K_FINDINGS_DRIFT`, `COVERAGE_KIMI_DRIFT`, `AXES_DRIFT coverage:kimi-layer`.
- Source of the base score: `scripts/proxy-check.mjs:816-819` `layerCoverage(covered,total,sections,members)`
  = `floor(10 × covered/total × sections/members)`, and the K call at `:950` passes
  `(members − findings)` **as the `sections` argument** — the `K_sections` count is a declared stanza term
  that never enters the score. That is the whole defect C1 names.
- This agrees arm-for-arm with the frozen base control `controls/c1-base.txt` (`held=7/11`; its
  denamed `K=54/55 cov=10`, findings `cov=9`, both-factors `cov=9`).

## 3. Open gate state at the scaffolding commit — `gates.txt`

Tree: `git archive ba940b51 | tar -x`. Commands run with cwd = that tree.

| gate | output | exit |
|---|---|---|
| `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict` | `PROXY  error  A_DRIFT  A: declared=868 computed=870 delta=+2` / `PROXY: DRIFT (…)` | **1** |
| `node scripts/kimi-census.mjs` | `KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)` | 0 |
| `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` | `OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)` | 0 |
| `node scripts/readme-map.mjs` | `README_MAP: CLEAN files=191 rows=191 covered=191` | 0 |
| `node scripts/spotcheck-adopt.mjs --check` | `SPOTCHECK_MAP: CLEAN spotchecks=45 uncovered=0` | 0 |
| base `5019803b` `--strict` | `C2_TOTAL_DRIFT 190/191` + `AXES_DRIFT coverage 10→9` | 1 |
| tip `8a733ab0` `--strict` | `A_DRIFT A: declared=868 computed=870 delta=+2` | 1 |

The two carried repairs **did** land: `C2/C2_total` is 191/191 and the coverage axes row derives 10 (no
`C2_TOTAL_DRIFT`, no `AXES_DRIFT` at the scaffolding tree), and the spotcheck/README adopt is clean
(191/191/191, 45/0).

## 4. Where my measurements disagree with the plan's stated open state

**D1 — the scaffolding does not read `PROXY: MATCH`; it reads `A_DRIFT` (declared 868, computed 870, exit 1).**
Plan §Open state claims `PROXY: MATCH (A=868 C=39 … C2=191/191 coverage=10 …)` exit 0. My run of the same
command on the same commit gives `A_DRIFT` +2. Cause is exact and mechanical: `A` counts every file matching
`/\.(?:mjs|js|sh|py)$/` walked under `--self` (`walkFiles` skips only `.git`), and the scaffolding commit
adds the two frozen counters `.ufo/waves/round-79/probe/probe79-c1.mjs` and `probe79-c2.mjs` → 868 + 2 = 870,
while `SCORECARD.md` still declares `A=868` (the commit's SCORECARD diff touches only `C2`/`C2_total`).

**D2 — the cited receipts do not support the MATCH claim.** `open/gates-open.txt` (committed in `ba940b51`)
contains the **pre-repair** reading: `proxy_exit=1` with `C2_TOTAL_DRIFT 190/191` and `AXES_DRIFT coverage
10→9`, plus `README_MAP: DRIFT files=191 rows=190 covered=190`, `SPOTCHECK_MAP: DRIFT … uncovered=1`,
`CHECKLIST: 35/39 pass … VERDICT: FAIL`. Only `open/proxy-json-open.json` reads MATCH (`A=868 C=39
C2=191/191 coverage=10`), and that JSON is **not reproducible from the commit's own bytes** — it was captured
before those two probe files existed on disk. The plan names both files as evidence for one verdict they
contradict.

**D3 — r78 shows the omission is avoidable, so this is a defect, not an instrument property.** At r78's
scaffolding `ad2630d0` the same command reads `PROXY: MATCH (A=859 …)` because that commit re-measured `A`
857 → 859 together with the addition of its own two probes. Round 79 re-measured `C2_total` only. The fix at
`ba940b51` would have been `A=870` in the stanza (and a re-captured `gates-open.txt`).

**D4 — the plan's pointer arithmetic.** §C2 (pre-Amendment-1) says `refs=41 missing=10`; with the seat spec's
token model I read **44 refs / the same 10 dead** and cannot reach 41 without dropping refs that resolve.
Amendment 1 says the r78 report yields "**10** `POINTER_DEAD` lines, first `close/proxy-json.txt`" — that is
impossible under the same contract's no-duplicate rule (those six `close/*` tokens are `RECEIPT_MISSING`;
the base control already shows `RECEIPT_MISSING,HASH_DEAD` on this report). Amendment 2's corrected **4**
non-receipt pointers is exactly what my census leaves: `amended-plan-observed.md`,
`knowledge/shape-receipt-live-drift.md`, `knowledge/kimi-plane-single-derivation.md`, `SOURCES.md`. The frozen arm (`≥4`, includes
`amended-plan-observed.md` + `SOURCES.md`, `RECEIPT_MISSING` still in ids) is consistent with my bytes.

**D5 — one dead pointer has no alternate name.** `close/mutants-c2.txt` is absent from `round-78/close/`
entirely; the C2 mutant battery survives only at `round-78/build/K78MutC2/battery-standin.txt`. The r78
triage ("content existed under other names") holds for nine of ten.

## 5. What this before-state can and cannot falsify

- **C1 (composite K score).** *Can* falsify the after-state reading later: the de-named-heading arm is red
  today (10, not 9) and the composite is arithmetically 9 — so the discriminator is real and the claim is
  testable by one command. *Cannot* falsify C1 itself (no composite code exists at base). It also shows the
  finding is **not** a constant-printer problem: `K_sections`, `K_findings` and `C1k` are three independently
  measured quantities that already move independently in my three arms (54/0, 55/1, 54/1).
- **C2 (report gate).** *Can* falsify the numbers in the plan text: the real dead-pointer count is 10 total /
  4 general, first `close/proxy-json.txt`; the base tool has no `POINTER_DEAD` at all, so arms 2/4/5/7 are
  red by construction (base control: `held=9/12`). *Cannot* falsify the after-state (tool not built).
- **Blocker this recon does open:** with `A=868` in the stanza, the round's `M` cannot read `PROXY: MATCH`
  until `A` is re-measured for every runnable file the round adds (870 at the scaffolding tree, more once
  seat scripts land in `.ufo/waves/round-79/`). A closure that re-runs `--strict` unchanged will read
  `A_DRIFT`, not `MATCH`.

## 6. Recon hygiene and open unknowns

- The lane advanced **during** this recon: tip `83f6815f` → `8a733ab0` (Amendment 2, the corrected
  `probe79-c2` arm 2, and the r78 erratum in `corpus/lessons/round-78.md`). All my numbers come from
  `git archive` of immutable commits; the r78 report sha256 was identical before and after.
- The lane worktree was **not** touched (only `git log/show/archive/status`-class reads). Scratch
  `/fast/scratch/hyaku/kumitate-r79/K79ScoutOpen` removed before yielding.
- Unknowns: (a) the live `M` worktree will carry in-flight seat scripts, so `A` at `M` must be measured, not
  derived from 870; (b) whether the L1 intends `A` to be re-measured in the work commit (r78's precedent
  says yes) — either way the frozen scaffolding bytes read `A_DRIFT`.
- Confidence: high on every number above (commands re-run, outputs copied as bytes); high on D1/D2/D3
  (source + commit diff + two independent runs); medium on the intent behind `A=868` (a stale capture vs a
  deliberate pre-probe capture) — the effect on any seat that trusts "open state MATCH" is the same.
