# K86Scout — round 86 reconnaissance over committed bytes

Seat: `K86Scout` (scout, wave `kumitate-r86-w1`). Scope: read-only recon over the **committed**
tree. Nothing outside `.ufo/waves/round-86/build/K86Scout/` and this file was written; no lane
file, corpus file, gate or manifest was touched.

Measured tree: lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, base
`232350995d3001e606609aaf22ba1b58168d3655`, freeze commit `e7228850690c6bd48400140964cbaf18667fbc06`
(`round-86: freeze source-binding probe and failing controls`).
Measured 2026-11-04T20:07Z–20:40Z, node v24.21.0, linux x86_64.

**Receipts:** `.ufo/waves/round-86/build/K86Scout/receipts-2026-11-04.txt` (all commands and
outputs below are in it). Scratch (`/fast/scratch/hyaku/kumitate-r86/K86Scout/`) was removed on exit.

## 0. How each reading was taken (two tree shapes)

The live worktree moves under this seat (sibling seats are landing corpus notes and build
artifacts), so every count below is taken on a **git archive** of a named commit, which is
reproducible:

```
D=/fast/scratch/hyaku/kumitate-r86/K86Scout
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive 232350995d3001e606609aaf22ba1b58168d3655 | tar -x -C $D/base
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive e7228850690c6bd48400140964cbaf18667fbc06 | tar -x -C $D/head
```

"live" = the worktree at measurement time, and it is quoted only where the difference from the
committed tree matters (the wave's own new files).

---

## 1. Defect-by-defect verdict — R85-V1 … R85-V15

Source of the list: `corpus/lessons/round-85-verifier-spotcheck.md` §6 (lines 121–142).
Verdict key: **(a)** already fixed / carried forward correctly · **(b)** still open, with the exact
`path:line` · **(c)** report prose that no lane file can carry (the file is fleet-owned or a
historical artifact; the fix must land in the round-86 report or lesson).

| id | severity | verdict | evidence / exact path:line |
|---|---|---|---|
| **R85-V1** | HIGH | **(b) open — split into two carriers** | The claim is false at both commits. `node scripts/proxy-check.mjs --strict` in the **base** archive → `PROXY: DRIFT (A_DRIFT term=A declared=972 computed=980 delta=+8; C2_TOTAL_DRIFT term=C2_total declared=216 computed=217 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669; source=snapshot)` **exit 1**; in the **freeze-commit** archive → `PROXY: DRIFT (A_DRIFT … declared=972 computed=985 delta=+13; C2_DRIFT … 216→217; C2_TOTAL_DRIFT … 216→217)` **exit 1**. The only MATCH receipt is pre-freeze: extracting `6663b3be` gives `PROXY: MATCH (A=908 C=44 …)` exit 0. **Lane-editable half:** `kumitate-shokunin/SCORECARD.md:4113` — the `\| accounting \|` row still ends `… ; \`PROXY: MATCH --strict\``. **Fleet-prose half:** `/home/vgpnk/Projects/shokunin/.ufo/reports/round-85/kumitate.md:112` (fleet file, committed as `b67837ee`; the lane may not edit it). Supporting receipts already committed: `.ufo/waves/round-85/close/harm-matrix.txt:2` (tip_text `A_DRIFT declared=972 computed=975 delta=+3`), `.ufo/waves/round-85/close/checklists.txt:8-10` (item `SKILL.md:724` FAIL, `computed=980 delta=+8`), `.ufo/waves/round-85/build/K85Scout/proxy-by-revision.txt:12-14`. The "count the proxy row among the checklist reds" half is confirmed: the proxy red **is** one of the four reds (`checklists.txt` → `CHECKLIST FAIL SKILL.md:724`), so the report's four-red claim is right but its "live-host" labelling is not (see V14). Fix shape per the spot-check: quote the committed DRIFT line; do **not** silently re-baseline A (the exclusion is pre-registered for round 86 — see §2). |
| **R85-V2** | MEDIUM | **(b) open** | Measured `git ls-tree -r --name-only <rev> \| grep -cE '\.(mjs\|js\|sh\|py)$'`: **908** at `a5d3e754` (r85 base), **913** at `9db0c6b5` (r85 freeze), **975** at `a882a334` (r85 M), **980** at `23235099` (r85 tip), **985** at `e7228850` (r86 freeze). Shipped-only (excluding `.ufo/`) is **35 at every one of those revisions** — the report's `shipped-only A = 36` is wrong by one, and the spot-check's 35 is confirmed. The prose to replace sits in **two lane files**: `kumitate-shokunin/SCORECARD.md:4113` (`A 908→972 (59 wave-scaffolding \`.mjs\`, disclosed; shipped-only A = 36)`) and `kumitate-shokunin/LOG.md:2891-2892` (same sentence). The declared stanza value `A=972` (`SCORECARD.md:294`) is itself stale against the computed 980/985. Note: 59 counts only the work commit's `.mjs` and omits three added `.sh` — the wave-scaffolding count at the r85 tip is 945 `.ufo/` runnable files (950 at the r86 freeze), shipped-only unchanged at 35. |
| **R85-V3** | MEDIUM | **(b) open in the lane; (c) for the report line; substance already carried by the round-86 corpus work in flight** | `SCORECARD.md:4110` still reads `\| independent driver (seat) \| \`HELD held=41/41\` **on the integrated bytes** (.ufo/waves/round-85/build/K85ExecFixture/independent-candidate.txt) \|`. The receipt itself contradicts it: `.ufo/waves/round-85/build/K85ExecFixture/independent-candidate.txt:1` and `:43` name `tool_sha256=7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1`, while the integrated instrument is `sha256sum scripts/counter-receipt.mjs` = `f385bd7a9fbf1dc49d465c8d83fecfd07aae34f6bf619aca7d935eda14f238cd` (matches the pin `pin.counter-receipt` and the report's own §The instrument). So the 41/41 is a **pre-S5 candidate** measurement. The fleet report line `…/round-85/kumitate.md:96` is fleet prose → (c). The relabel itself already exists in the wave's **uncommitted** corpus work: `corpus/knowledge/counter-receipt-source-binding.md` ("The historical 41/41 independent result tested candidate digest `7659be6e…`, not the integrated `f385bd7a…` bytes") and `corpus/QUALITY.md` new `Q79`. Uncommitted → not yet a fix at the freeze commit. |
| **R85-V4** | MEDIUM | **(b) open in the lane LOG; (c) for the report quote** | `grep -rn "READY_HANDOFF" .ufo/waves/round-85/` → **no hits**: no round-85 artifact contains the quoted line. The tool's render always appends three fields (`scripts/ready-handoff.mjs:379-382`); a live run over round 85 prints `READY_HANDOFF: READY wave=w1 seats=13 resumes=0 total=13 attack=4/13 connector=1 roles=executor=5,scribe=1,scout=1,connector=1,reviewer=2,critic=1,mutation-tester=1,sentinel=1 policy=ufo-wave-policy.json agents=none` exit 0. The report's quote (`…/round-85/kumitate.md:35`) drops the `roles=… policy=… agents=…` tail, i.e. it is a partial quote presented as the gate's line → (c). The attack-count half is lane-editable: the gate's ATTACK set is `{reviewer, critic, mutation-tester}` (`scripts/ready-handoff.mjs:45`, sentinel excluded) → **4/13**, while `kumitate-shokunin/LOG.md:2884` says `Attack 5/13; connector 1;` and the frozen `…/round-85/plan.md:10` says `5/13 = 38 %`. The r85 plan is frozen evidence and must not be rewritten → the correction belongs in the round-86 LOG/report, and in `LOG.md:2884`. |
| **R85-V5** | MEDIUM | **(a) fixed for new receipts; **(b)** residual: the dated re-run beside the frozen r85 harm-matrix is still owed | Round-85 receipts indeed lack the header: `head -1 .ufo/waves/round-85/controls/{base,stub,noreader}.txt` → `C85_C1 arm clean FAIL exit=0 …` (no `rev=`/`cmd=`), and `grep -c '^exit=' .ufo/waves/round-85/close/harm-matrix.txt` → **0** (the five `exit=1` strings are inside quoted `base_text`/`tip_text`). **Round-86 receipts comply**: every one of `.ufo/waves/round-86/controls/{base,stub,noreader,replay}.txt` carries `rev=`, `cmd=` and a trailing `exit=1` (3 matching lines each). Residual, and it is an L1 close duty: the spot-check's second clause ("commit a dated re-run beside it rather than editing it") — the r85 `close/harm-matrix.txt` has no `exit=` line and no r86 `close/` directory exists yet (`ls .ufo/waves/round-86/close` → no such directory). Also stale for the record: the r85 map-repair receipt's after-text reads `README_MAP: CLEAN files=216 rows=216 covered=216`, but the live reading is now `files=217 rows=217 covered=217`. |
| **R85-V6** | MEDIUM | **(a) fixed in the round-86 frozen probe** | The r85 probe really was length-lenient: `.ufo/waves/round-85/probe/probe85-c1.mjs:85-91` checks `got3` in the source branch but never asserts `out.length === 3` (only the non-source branch asserts `out.length === 2` at `:90`), so the critic's line-lenient control scored `C85_C1: HELD held=20/20` while emitting a fourth line — see `.ufo/waves/round-85/build/K85Critic/line-lenient/direct-output.txt:11` (`EXTRA-LINE-NOT-CHECKED`) with the mutated tool at `…/line-lenient/scripts/counter-receipt.mjs:66`. **The round-86 probe closes it**: `.ufo/waves/round-86/probe/probe86-c1.mjs:264-266` computes `const wantLines = wantSource === undefined ? 2 : 3;` and asserts `ok = ok && out.length === wantLines;` on **every** arm, so every `--src` arm now demands exactly three lines. Committed at the freeze commit. Remaining reporting duty (round-86 report, not a code change): disclose that the r85 predicate did not assert output length, so the r85 `held=20/20` was length-lenient. |
| **R85-V7** | LOW-MED | **(b) open as evidence; (c) for the report attribution** | `.ufo/waves/round-85/close/map-repair.txt` (whole file, 9 lines) carries `README_MAP: DRIFT …` / `before_exit=1` / `README_MAP: CLEAN files=216 rows=216 covered=216` / `after_exit=0` / `SPOTCHECK_COVERAGE: CLEAN spotchecks=51 uncovered=0` / `MAP: CLEAN` — and **no `plan-before-ready` line** (`grep -n plan-before-ready` → no hits). The pre-repair FAIL is only in `…/round-85/w1/K85Scribe.md:62-63` (`PLAN_BEFORE_READY: FAIL … reason=MAP_DRIFT`). The report attribution at `…/round-85/kumitate.md:22-25` is fleet prose → (c). Lane-side fix is the **r86 close receipt** (does not exist yet): it must carry the `plan-before-ready` CLEAN line alongside the map readings. Current live reading of that gate: `bash scripts/plan-before-ready.sh --round 86` → `PLAN_BEFORE_READY: NA … reason=NO_MARKER … map=CLEAN files=217 rows=217 covered=217`, exit 2 — NA only because no wave marker is committed yet. |
| **R85-V8** | LOW | **(b) open in the committed tree; in flight (uncommitted) as a superseding row** | Committed `corpus/SOURCES.md:199` still titles S245 `Oracle-based Test Adequacy Metrics: A Survey`, and `corpus/lessons/round-85.md:32` repeats `*Oracle-based Test Adequacy Metrics: A Survey*`. The committed capture disproves it: `.ufo/waves/round-85/build/L1/arxiv-2212.06118.html` (sha256 `838d0715…`, 43275 B) carries `<title>[2212.06118] A Brief Survey on Oracle-based Test Adequacy Metrics</title>` and `name="citation_title" content="A Brief Survey on Oracle-based Test Adequacy Metrics"`; the wave's fresh copy `.ufo/waves/round-86/open/survey.html` has the identical sha256 `838d07156c06a6fb38927fd79b4d87548dba92b5e0d5f601af83c031ffa5bbd2`. Fix shape per the spot-check: supersede (do not rewrite the filed row), i.e. a new `teaches: supersedes S245 —` row plus an erratum in the round-86 lesson. In flight, uncommitted: `corpus/SOURCES.md` +3 rows `S247` (correct title, tier B) / `S248` / `S249`, and `corpus/knowledge/counter-receipt-source-binding.md` §"Round-85 correction (R85-V8, V9, V10, V11)". The filed lesson bytes must stay as filed. |
| **R85-V9** | LOW | **(b) open in the committed tree; in flight as the same superseding row** | Fleet `CORPUS.md:93-97` defines **B** as "strong secondary (expert write-up with reproducible detail, **survey**, textbook)" and A as "primary or authoritative for that scope"; the committed S245 row carries tier `A` for a survey (`corpus/SOURCES.md:199`, tier cell). In flight: the uncommitted `S247` row sets tier `B` (and `corpus/lessons/round-86.md` §Gate records "S247 — admit, mined, B"). Not landed at the freeze commit. |
| **R85-V10** | LOW | **(b) open in the committed tree; the flip is verifiably satisfied** | Committed `corpus/SOURCES.md:200` still marks S246 `rejected` with the ACM-403 flip. The flip condition now holds: the wave fetched `.ufo/waves/round-86/open/testoracles.pdf` (773275 B) and `pdftotext -f 1 -l 2` yields the title *The Oracle Problem in Software Testing: A Survey*, the abstract, and §1 "we need a test oracle, a procedure that distinguishes between the correct and incorrect behaviors of the System Under Test (SUT)". In flight: uncommitted `S248` (admit, tier B, eecs481.org locator) plus the same correction section in the new knowledge entry and `corpus/lessons/round-86.md` §Gate. Note the corpus rule from the spot-check: corrections are **new entries, never in-place rewrites** — S245/S246's cells stay as filed. |
| **R85-V11** | LOW | **(b) open in the committed tree; in flight as a new entry** | `corpus/knowledge/counter-receipt-discrimination.md:7-10` still reads as the orphan fragment (`the lane commands below` / `sha256 \`f385bd7a…\`; arXiv:2212.06118v3` / `fetched 2026-11-04` / `→ \`COUNTER_RECEIPT: DRIFT ARMS_TOTAL\` exit 1; …`). Fix shape: append a correction block **or** a new entry — never an in-place rewrite. In flight: `corpus/knowledge/counter-receipt-source-binding.md` carries a "Round-85 correction (R85-V8, V9, V10, V11)" section naming the orphan fragment and giving the correct historical v2 command. Uncommitted. |
| **R85-V12** | LOW | **(b) open in the committed tree; in flight as a gate patch** | Placement: the two rows are at `corpus/README.md:357-358` (the index shifted by one because the freeze commit added a row at `:226`), i.e. **after** `## Frontier` (`corpus/README.md:345`), while the `## Coverage map` table spans `corpus/README.md:14`–`:227`; `awk 'NR>=14 && NR<=228' corpus/README.md \| grep -c counter-receipt-discrimination` → **0**. Gate blindness: `scripts/readme-map.mjs` is unchanged between base and freeze (`git diff 23235099 e7228850 -- scripts/readme-map.mjs` → empty), and `loadRows` (`scripts/readme-map.mjs:139-155`) scans **every** `\|` line of the README with no `##` heading tracking, so a row after `## Frontier` counts as covered. In flight: `.ufo/waves/round-86/build/K86ExecMap/readme-map.mjs` (sha256 `5e4ec342…`) adds the section-membership arm (`outside-map:<path>` finding; heading tracking at `:152-157`) and `patch-README.diff` moves the two rows into the map. Not landed. Note: this is exactly the round's declared non-claim work item ("the section-membership arm of the README map gate"). |
| **R85-V13** | LOW | **(b) open in the lane LOG; **(c)** for the report's own row** | The fleet hash exists: `git -C /home/vgpnk/Projects/shokunin log --oneline -1 b67837ee` → `round-85: kumitate report (C1 counter-receipt v2 UNMET; 13-seat wave; S245/S246)`; the report's landed-table row `…/round-85/kumitate.md:70` still reads `\| this report \| — \| fleet \`fleet-commit.sh --as kumitate\` \|` with no hash (fleet prose → (c)). Lane side: `kumitate-shokunin/LOG.md:2842` starts the r85 entry `## Round 85 — the receipt check that must read (2026-11-04)`; within `LOG.md:2842-2894` there is **no** `602f1835` (the `## Planned`-pointer commit; `grep -c 602f1835 kumitate-shokunin/LOG.md` → **0**), no `b67837ee`, and no `SKILL.md:760` / `:761` — the r84 checklist item is `kumitate-shokunin/SKILL.md:760` (`Counter-receipt reconciliation (round 84 …)`) and the r85 one `:761`. Those three names are what the r85 LOG entry must fold in. |
| **R85-V14** | LOW | **(b) open as prose; already reclassified in the wave's uncommitted lesson** | `…/round-85/kumitate.md:144` reads `… \`CHECKLIST: 41/45 pass\` **with four live-host reds**, …`. The four reds, from `.ufo/waves/round-85/close/checklists.txt`: `SKILL.md:724` (proxy — **lane**-state `A_DRIFT`), `SKILL.md:736` (OMP census — host-bound), `SKILL.md:754` (Kimi composite — lane/derived), `SKILL.md:755` (OMP shape compare — host-bound). So the correct split is **two host-bound** (OMP census, OMP shape) and **two lane/derived** (proxy, Kimi composite), not four live-host. The fleet report line is fleet prose → (c); the reclassification must be stated in the round-86 report. Already stated in the wave's uncommitted `corpus/lessons/round-86.md` §Mistakes row `number-drift` ("R85-V1/V2/V14: reported proxy MATCH contradicted the committed DRIFT receipts"). |
| **R85-V15** | INFO | **(c) no lane action; durable pointer exists now** | The r85 census claim had no receipt: `grep -rln "sources-census" .ufo/waves/round-85/` → only `plan.md`, `w1-results.json`, `w1/K85Scribe.md` (mentions, no receipt). The round-86 wave does carry one: `.ufo/waves/round-86/open/source-census.txt` → six `W04` duplicate-URL warnings and `kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`, **exit 0**. Caveat: the census driver lives at the **fleet** root (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`), not in the lane, and the r86 receipt is still uncommitted. |

**Cross-cutting note on V8–V12:** five of the fifteen defects (V8, V9, V10, V11, V12) are in flight
as **uncommitted** wave artifacts (`corpus/SOURCES.md` +3 rows, `corpus/QUALITY.md` +Q79,
`corpus/knowledge/counter-receipt-source-binding.md`, `corpus/lessons/round-86.md`,
`.ufo/waves/round-86/build/K86ExecMap/*`). At the freeze commit none of them is landed, so the
committed tree still carries every one of them.

---

## 2. Measurements

### 2.1 `A` / `C` / `C2` readings (exact commands and outputs)

`A` is `walkFiles(self).filter(RE_RUNNABLE)` over the **whole** lane tree including `.ufo/`
(`scripts/proxy-check.mjs:601,978`); the amendment (A excludes `.ufo/`, A_wave added) is **not yet
in** the committed tool — `grep -c A_wave scripts/proxy-check.mjs` → **0**, and the committed stanza
`SCORECARD.md:293-324` has 30 keys and no `A_wave`.

**Committed freeze commit `e7228850` (git archive, reproducible):**

```
$ node scripts/proxy-check.mjs --strict
PROXY  error  A_DRIFT  A: declared=972 computed=985 delta=+13
PROXY  error  C2_DRIFT  C2: declared=216 computed=217 delta=+1
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=216 computed=217 delta=+1
PROXY: DRIFT (A_DRIFT term=A declared=972 computed=985 delta=+13; C2_DRIFT term=C2 declared=216 computed=217 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=216 computed=217 delta=+1; src-rev=31c465f15669; source=snapshot)
exit=1
```

**Committed base `23235099` (git archive):**

```
$ node scripts/proxy-check.mjs --strict
PROXY  error  A_DRIFT  A: declared=972 computed=980 delta=+8
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=216 computed=217 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (A_DRIFT … computed=980 delta=+8; C2_TOTAL_DRIFT … 216 computed=217 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669; source=snapshot)
exit=1
```

Terms (`--json`), freeze commit: `A=985  C=45  C1=19/19  C2=217/217  operability=9  coverage=10`;
declared stanza `A=972  C2=216  C2_total=216`.
Terms, base commit: `A=980  C=45  C1=19/19  C2=216/217  operability=9  coverage=9`.

Live worktree (unstable, quoted for orientation only): `A=989  C=45  C2=217/219  coverage=9` —
`A` rises with sibling build `.mjs` files, `C2_total` rose to 219 because the wave's own two new
corpus notes (`corpus/lessons/round-86.md`, `corpus/knowledge/counter-receipt-source-binding.md`)
landed and their README rows/pins have not yet been added in the same shape; `coverage` derives 9
while the `## Axes` row says 10 → `AXES_DRIFT coverage: ## Axes row=10 derived=9` appears in the
live tree and **not** at either committed commit. **That live AXES drift is a wave-state artifact
that the L1's stanza update must absorb** (it is the `C2_total` half of the `A_wave`/C2 re-baseline
in `.ufo/waves/round-86/build/K86ExecProxy/SCORECARD.patch`, which sets `C2=217 / C2_total=217`).

`C` cross-check: `grep -c '^\s*- \[' kumitate-shokunin/SKILL.md` → **45**, matching the proxy's
`C=45` and the declared `C=45`.

`A` history (the numbers R85-V2 asks to replace the prose with):

```
$ for rev in a5d3e754 9db0c6b5 a882a334 23235099 e7228850; do
    git ls-tree -r --name-only $rev | grep -cE '\.(mjs|js|sh|py)$'; done
a5d3e7549501 total=908 shipped_non_ufo=35 wave_ufo=873
9db0c6b5        total=913 shipped_non_ufo=35 wave_ufo=878
a882a334eaf7   total=975 shipped_non_ufo=35 wave_ufo=940
232350995d30   total=980 shipped_non_ufo=35 wave_ufo=945
e7228850690c   total=985 shipped_non_ufo=35 wave_ufo=950
```

(`shipped_non_ufo` = the same list minus `^\.ufo/`; `wave_ufo` = the `.ufo/` part. `980 + 5 = 985`:
the freeze commit added `probe/probe86-c1.mjs` plus four control tools.)

### 2.2 `README_MAP` and `SPOTCHECK_COVERAGE` at the base commit

**Base `23235099` — both RED (exit 1):**

```
$ node scripts/readme-map.mjs
README_MAP: note unpinned:lessons/round-85-verifier-spotcheck.md
README_MAP: DRIFT files=217 rows=216 covered=216 bad=2 first=uncovered:lessons/round-85-verifier-spotcheck.md
exit=1

$ node scripts/spotcheck-adopt.mjs --check
SPOTCHECK_COVERAGE: DRIFT spotchecks=52 uncovered=1 first=corpus/lessons/round-85-verifier-spotcheck.md
MAP: DRIFT first=uncovered:lessons/round-85-verifier-spotcheck.md
exit=1
```

**Freeze commit `e7228850` — both CLEAN (exit 0):**

```
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=217 rows=217 covered=217
exit=0

$ node scripts/spotcheck-adopt.mjs --check
SPOTCHECK_COVERAGE: CLEAN spotchecks=52 uncovered=0
MAP: CLEAN
exit=0
```

The base was red because the r85 spot-check file landed **without** its README row and pin; the
freeze commit added both (`corpus/README.md:226` row; `.ufo/pins/readme-map.json` `covered` entry
`lessons/round-85-verifier-spotcheck.md`) — exactly the "adopt before the freeze" the spot-check's
closing paragraph demanded, and it is visible in
`git diff 23235099 e7228850 -- corpus/README.md .ufo/pins/readme-map.json`.
Live worktree now: `README_MAP: CLEAN files=219 rows=219 covered=219` / `SPOTCHECK_COVERAGE: CLEAN
spotchecks=52 uncovered=0` (the two new corpus notes already carry rows and pins).

### 2.3 `PROXY` exit code at the base commit

`node scripts/proxy-check.mjs --strict` at base `23235099` → **exit 1** (`PROXY: DRIFT`, §2.1).
At the freeze commit → **exit 1** as well. There is **no** commit in the r85/r86 range where the
lane's committed tree reads `PROXY: MATCH`; the last MATCH is the pre-freeze repair commit
`6663b3be` (`A=908 C=44`).

### 2.4 Does the round-85 frozen probe still score what the round-85 report claims?

Yes for the probe's own numbers; no for the report's `PROXY: MATCH` claim.

```
$ node .ufo/waves/round-85/probe/probe85-c1.mjs --lane . --work $D/r85probe
C85_C1: HELD held=20/20
exit=0

$ for c in base stub noreader; do node .ufo/waves/round-85/probe/probe85-c1.mjs \
    --lane .ufo/waves/round-85/controls/$c --work $D/r85-$c; done
control base:     C85_C1: UNMET held=1/20   exit=1
control stub:     C85_C1: UNMET held=0/20   exit=1
control noreader: C85_C1: UNMET held=1/20   exit=1

$ node .ufo/waves/round-85/controls/content-variation.mjs --lane . --work $D/cv
CONTENT_VARIATION: HELD held=3/3 distinct_sha=true
exit=0

$ node scripts/counter-receipt.mjs --selftest
COUNTER_RECEIPT_SELFTEST: PASS held=60/60
exit=0
```

These match the committed r85 receipts (`close/c1-probe.txt` → `HELD held=20/20`;
`controls/base.txt` → `UNMET held=1/20`; `controls/stub.txt` → `0/20`;
`controls/noreader.txt` → `1/20`; `close/content-variation.txt` → `3/3 distinct_sha=true`;
`close/selftest.txt` → `PASS held=60/60`) and the report's before/after table. So the r85 *probe*
verdict reproduces; the report's **`PROXY: MATCH --strict` line does not** (see R85-V1) — the report
quotes a verdict the lane's own gate never produced at that commit.

### 2.5 The round-86 frozen probe and its controls (measured, for the L1's ledger)

```
$ node .ufo/waves/round-86/probe/probe86-c1.mjs --lane . --work $D/r86probe
C86_C1: UNMET held=14/24
exit=1
```

against the **current integrated v2** tree — expected: v2 prints no source digest, so the ten
`--src` arms fail on `want3` (e.g.
`line3="SOURCE: sites=9 declared=9 receipt=9" want3="SOURCE: sites=9 declared=9 receipt=9 sha256=7a40a9b4…"`).
Arms confirmed `24` (`grep -c "add({ name:" probe86-c1.mjs` → 24; `cases.length === 24` at `:288`).

Re-scoring the four frozen controls against the **frozen** probe (each below 24/24, as the plan's
kill rule requires):

```
control base:     C86_C1: UNMET held=14/24  exit=1
control stub:     C86_C1: UNMET held=0/24   exit=1
control noreader: C86_C1: UNMET held=0/24   exit=1
control replay:   C86_C1: UNMET held=0/24   exit=1
```

matching the committed receipts `.ufo/waves/round-86/controls/{base,stub,noreader,replay}.txt`
(`C86_C1: UNMET held=14/24` / `0/24` / `0/24` / `0/24`, each with `exit=1`).

### 2.6 Other gates, for the round's closing ledger

| command | base `23235099` | freeze `e7228850` | live worktree |
|---|---|---|---|
| `node scripts/proxy-check.mjs --strict` | exit 1 `DRIFT` | exit 1 `DRIFT` | exit 1 `DRIFT` (+AXES coverage drift from wave-in-flight corpus notes) |
| `node scripts/readme-map.mjs` | **exit 1** `DRIFT` | **exit 0** `CLEAN` | exit 0 `CLEAN` (219/219/219) |
| `node scripts/spotcheck-adopt.mjs --check` | **exit 1** `DRIFT` | **exit 0** `CLEAN` | exit 0 `CLEAN` |
| `node scripts/cite-check.mjs` | exit 1 `DRIFT` (errors=2964) | exit 1 `DRIFT` (errors=2964) | exit 1 `DRIFT` (errors=2292) |
| `node scripts/counter-receipt.mjs --selftest` | — | exit 0 `PASS 60/60` | exit 0 `PASS 60/60` |
| `bash scripts/plan-before-ready.sh --round 86` | — | exit 2 `NA` (no marker) | exit 2 `NA`, `map=CLEAN` |
| `node scripts/ready-handoff.mjs --round 85 …` | — | — | exit 0 `READY … attack=4/13 …` |

**Flag on the round's stated end-state:** the goal text says `node scripts/cite-check.mjs` must
exit 0 on the integrated tree. It exits **1** at the base, at the freeze commit and live — errors
2964 → 2292 (the r85 `harm-matrix.txt` already records `cite-check-fleet-dot base=NOT_CLEAN
tip=NOT_CLEAN id=CARRIED_MOVED`, `CITE_CHECK: DRIFT (files=221 … errors=2610 warnings=1004)`).
This is a **carried** red, not a round-86 regression, and the lane's own checklist item
`SKILL.md:717` expects `exit 0|1` for that gate. The plan's "Before (frozen)" reading of the
r86 probe (`C86_C1: UNMET held=14/24` exit 1 against v2) is reproduced exactly (§2.5).

---

## 3. Unknowns / not established by this seat

1. **The round-86 report's own text** does not exist yet (no `.ufo/reports/round-86/` in the
   lane). V1's report half, V4's quote, V13's landed-table row and V14's "live-host" wording are
   therefore all **(c) by construction** — they can only be discharged by the round-86 report the L1
   writes. I did not draft any of it.
2. Whether the **L1 will land** the in-flight artifacts that discharge V3, V8–V12 (the `S247/S248/
   S249` rows, `Q79`, the new knowledge entry, the `K86ExecMap` section-membership patch, the
   `K86ExecProxy` stanza/`A_wave` patch). All are **uncommitted** at the freeze commit.
3. Whether the **r86 close receipts** (no `close/` directory yet) will carry the `plan-before-ready`
   CLEAN line (V7) and the `exit=` lines (V5). `plan-before-ready --round 86` currently reads
   `NA` only because no wave marker is committed.
4. The **live-tree `AXES_DRIFT` coverage 10→9** is wave-state, but which stanza values the L1
   finally declares (217 vs 219 corpus notes) depends on whether the two new corpus notes keep
   their README rows/pins — I could not determine a final value.
5. `cite-check`'s 2292 live errors are outside this seat's scope; I did not attribute them.
6. I did **not** evaluate the frozen probe's correctness (V6's disclosure duty and the plan's
   "the probe can differ from a cheat" argument are L1/critic territory); I only measured what it
   scores and what it asserts.

## 4. Addendum — L1 integration notice (recorded, not re-measured)

After this seat finished its measurements, L1 `KumitateR86` messaged that the executor candidates
have been integrated and that the L1 has written named corrections for R85-V1…V15, the S247/S248
superseding rows, the lesson, Q79 and the README placement repair.

This addendum records that notice **as reported by the L1**. This seat did **not** re-run any
gate or probe after the integration, so the §1 verdict table and the §2 numbers stand exactly as
measured and keep their **base `23235099` versus freeze-commit `e7228850`** distinction:

- The §1 "in flight (uncommitted)" annotations on R85-V3, R85-V8, R85-V9, R85-V10, R85-V11 and
  R85-V12 describe the artefacts as they stood **at the freeze commit**, where they were present
  in the worktree but not committed. The L1's notice says those corrections are now written and
  integrated; confirming that against the bytes is the L1's and the reviewer's check, not this
  seat's, and no re-measurement was performed here.
- Every §2 command output is a reading of a **named commit** (base or freeze commit) or of the
  live worktree **before** the integration; the live-worktree numbers are labelled as such in §2.1
  and §2.6.

## 5. Tooling

No tools were installed or upgraded this round by this seat — nothing was needed (`node v24.21.0`,
`git`, `pdftotext` were all present). No pacman transaction was attempted; the host-wide pacman
pause (mado r15) was respected.
