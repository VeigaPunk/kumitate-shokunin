# Round-8 aggregator audit — box-3 non-author cold run

- verifier: aggregator-lane round-8 L2 `labrat` seat Box3Kumitate — **non-author**; author lane: kumitate
- dispatched by: `.ufo/reports/round-8/aggregator.md` (main repo `shokunin`)
- stamp: start 2026-09-28T23:31:05Z HEAD `c91fe967` dirty 10 → end 2026-09-28T23:33:16Z HEAD `c91fe967` dirty 10
- entry: `SKILL.md` only (no LOG/SHONEN/SCORECARD/PROVINCE/report read before the run)

## Commands executed
| # | SKILL.md cite | Command | Exit | Result vs claim |
|---|---|---|---|---|
| 1 | :519 | `node scripts/cite-check.mjs` | 1 | `CITE_CHECK: DRIFT (files=40 tokens=2586 errors=6 warnings=76)` — within claimed `0\|1 + CITE_CHECK:` envelope, so the item's claim shape holds, but errors=6 vs SKILL.md:533 embedded live claim "errors=2" |
| 2 | :520 | `node scripts/cite-check.mjs --selftest` | 0 | `19/19 cases passed (hermetic)` + `VERDICT: PASS` — exact match |
| 3 | :521 | `node scripts/surface-probe.mjs` | 0 | `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1)` — matches |
| 4 | :522 | `node scripts/surface-probe.mjs --selftest` | 0 | `38/38 cases passed` + `VERDICT: PASS` — matches |
| 5 | :523 | `node scripts/round-gate.mjs --selftest` | 0 | `ROUND_GATE_SELFTEST: 57/57 pass` + `VERDICT: PASS` — matches |
| 6 | :524 | `node scripts/round-gate.mjs` | 0 | `ROUND_GATE: CLEAN (round=10 lane=kumitate checks=10 errors=0 warnings=0)` — matches |
| 7 | :525 | `node scripts/round-gate.mjs --tracked` | 0 | `ROUND_GATE: CLEAN (mode=tracked checked=8 errors=0 warnings=0)` — matches |
| 8 | :526 | `node scripts/proxy-check.mjs` | **1** | **`PROXY: DRIFT (A_DRIFT term=A declared=4 computed=5 delta=+1)`** — claim is exit 0 + `PROXY: MATCH`; falsified |
| 9 | :527 | `node scripts/proxy-check.mjs --selftest` | 0 | `PROXY_SELFTEST: 53/53 pass` + `VERDICT: PASS` — matches |
| 10 | :517 (implied) | `node scripts/round-gate.mjs --integrations` (probe) | 64 | `round-gate: unknown argument: --integrations` — flag absent at HEAD **and** in the working tree (`git show HEAD:… \| grep -c integrations` → 0); SKILL.md:552-553 advertises it as where live-tree assertions moved |

## Gated steps (cannot cold-execute)
| SKILL.md cite | Command | Why gated |
|---|---|---|
| — | (none) | The checklist (:516) is all read-only; nothing else in SKILL.md prescribes a runnable step. `--close` (:575-578 "clean tree, nothing unpushed") was deliberately not run: it is the round-close operator act, and running a lane's close audit with a foreign dirty tree (live lane's 10 dirty entries) would record a foreign state under this verifier's stamp. Non-executable sections (launch sequence :196, judge pipeline :325) are knowledge maps, not operator steps. |

## Break points (oral context would have been required)
| # | Cite | Break | Class |
|---|---|---|---|
| 1 | SKILL.md:526 vs observed | Checklist asserts `proxy-check.mjs` → exit 0 + `PROXY: MATCH`; cold run yields exit 1 `A_DRIFT (declared=4 computed=5)`. A cold operator cannot reconcile this without the author's explanation of when A was last pinned | claim-falsified |
| 2 | SKILL.md:533-534 vs observed | Embedded live claim "Live 2026-09-28: `CITE_CHECK: DRIFT`, `errors=2`, both inside `corpus/lessons/round-6-aggregator-audit.md`" — observed errors=6 across four files (`round-close-gate.md:271` PIN_MISMATCH, `round-10.md:17` PIN_MISMATCH, `round-11.md:97,:100` REV_UNKNOWN ×2, plus the 2 historical round-6 LINE_OOR). A cold operator cannot tell which of the six are expected | claim-falsified |
| 3 | SKILL.md:552-553 | `--integrations` advertised as the home of live-tree assertions; flag does not exist in `round-gate.mjs` at HEAD or working tree (exit 64) | missing-file (flag absent) |
| 4 | SKILL.md:52-53 | "Full map: `corpus/knowledge/sighting-wall.md` (26 files, 10.6k lines)" — sizes like these are unverifiable as written and the map is the only pointer for the wall internals; cold operator cannot re-derive "26 files" from any command in SKILL.md | unresolvable-cite |

## Box-3 verdict
**[ ]** — decided by: command table rows 1+8+10, i.e. `node scripts/proxy-check.mjs` (SKILL.md:526) returned exit 1 `PROXY: DRIFT (A_DRIFT …)` where the checklist promises exit 0 + `PROXY: MATCH`; `cite-check` live run (SKILL.md:519) contradicts the SKILL.md:533 embedded live-claim (errors=6 vs 2); and `--integrations` (SKILL.md:552-553) does not exist at HEAD. Three independent claim-level falsifications in the one file box 3 is graded on.

## Post-run comparison
`SHONEN.md` box-3 line: *none* — the file (8 lines, `kumitate-shokunin/SHONEN.md:5`) is the four-item promotion checklist with box 3 rendered as `- [ ] Instructions executable by an agent without oral context`, unchecked, no verdict/quote/decider. Divergence: **yes** — no recorded lane self-verdict exists to diverge from; this run is the first recorded non-author grading of box 3 for this lane.

## Incidental (boxes 1/2/4 — not graded here)
- Box 1 incidentals: SKILL.md has real decision tables (dispatch shapes :16-30) and checklists (:515-527).
- Box 2 incidentals: LOG.md exists; not opened pre-run, not graded here.
- Box 4 incidentals: SKILL.md:247-256 carries a correctly cross-domain-labeled defect ("reported, not owned" — membrane-seal), which is the right posture; no bleed observed in the graded surface.

## D-84 follow-up (gate_selftest re-executed)
- `node scripts/round-gate.mjs --selftest` → **`57/57 pass`**, `VERDICT: PASS`, exit 0.
- `node scripts/cite-check.mjs --selftest` → **`19/19 (hermetic)`** exit 0; `surface-probe --selftest` → 38/38 exit 0; `proxy-check --selftest` → 53/53 exit 0. All hermetic suites PASS.
- The ledger's "combined VERDICT: FAIL with 8/9 integration" composition does not reproduce at this HEAD: the integration failure now lives in the **live** `cite-check` run (errors=6, VERDICT: FAIL), not in any round-gate integration mode (no such mode exists at HEAD; probe → exit 64).
- Failing case still pointing at an aggregator-owned file? The two aggregator-attributed findings from D-84 are still present but are now **WARN**-class in a 3130-finding run: `round-6-aggregator-audit.md:26` `AMBIG` (`base.mjs` matches 2 files) and `:31` `SUFFIX_RESOLVED` (`charter-scribe/`). The `:23,:116` LINE_OOR entries (`native_contract.rs:10896` — the auditor's quotation of the repaired D-51 defect) are still errors and still aggregator-owned text at HEAD (file byte-identical to HEAD, sha256 `badd780c…`, no dirty diff); the four NEW errors are kumitate-owned (`round-close-gate.md:271`, `round-10.md:17` PIN_MISMATCH both caused by the live lane's uncommitted `round-gate.mjs` edit — HEAD blob sha256 `2c6c580b…` matches the pinned `2c6c580b` exactly; `round-11.md:97,:100` REV_UNKNOWN).

## Incidental notes (evidence only)
- `audit-env.sh` is untracked (`??`) — it counts toward computed A=5 (`find . -path ./.git -prune -o \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \)`) but is absent from the SCORECARD stanza's declared A=4.
- Node: v24.19.0 (≥20 gate satisfied, SKILL.md:547-548).

## Round-8 amendment (critic-absorbed)

Appended 2026-09-28T23:41:37Z after head `e79fefa`. Chain: **aggregator lane round 8 → L2 seat Box3Kumitate (labrat) → dispatch report `.ufo/reports/round-8/aggregator.md`**.

### 1. Live-tree contamination — dirty set, provenance, HEAD-vs-worktree

(a) Full `git status --short` at amendment time (unchanged membership from start stamp; `audit-env.sh` disappeared between my row-8 run and the amendment — see below):
`M LOG.md · M SCORECARD.md · M SKILL.md · M corpus/README.md · M corpus/knowledge/round-close-gate.md · M corpus/lessons/round-10.md · M scripts/round-gate.mjs · ?? corpus/knowledge/executable-scorecard.md · ?? corpus/lessons/round-11.md · ?? scripts/proxy-check.mjs`
Diffstats: `SKILL.md +35`, `scripts/round-gate.mjs +219/−19` (worktree `git diff --stat`).

(b) Provenance of each decisive input — **[H]=HEAD, [W]=worktree**:
| Decisive claim | Input | At HEAD | At worktree | Verdict provenance |
|---|---|---|---|---|
| Checklist rows `--tracked`/`proxy-check` (:525-527) | SKILL.md text | **absent** (0 `proxy-check` mentions in HEAD SKILL.md) | present | **[W]-only** |
| proxy-check MATCH claim | `scripts/proxy-check.mjs` | **does not exist** (`git cat-file -e HEAD:…` → fatal) | untracked file | **[W]-only** |
| proxy SCORECARD stanza | SCORECARD.md | absent at HEAD | present | **[W]-only** |
| errors=2 live claim | SKILL.md:530 (HEAD numbering) | present | present (+3 lines added elsewhere) | **[H]** |
| `--integrations` clause | SKILL.md:550 (HEAD numbering) | present | present | **[H]** |
| round-gate behavior under audit | round-gate.mjs | 1226 L sha `2c6c580b` | 1426 L (+`--tracked`, 57-case suite) | divergent [H]/[W] |

(c) HEAD-vs-worktree behavior comparison (HEAD copy extracted to `/tmp/r8-head-round-gate.mjs` and HEAD clone at `/tmp/r8-head-kumitate`; no stash):
| Command | HEAD tool/tree | Worktree | Divergence |
|---|---|---|---|
| round-gate --selftest | 49/49 PASS exit 0 | 57/57 PASS exit 0 | suite grew +8; both PASS |
| round-gate (audit) | `ROUND_GATE: CLEAN (round=10 … errors=0)` exit 0 (verified three ways: HEAD tool + `--repo`, bare from `/tmp/r8-head-kumitate`, worktree) | same CLEAN | none |
| round-gate --tracked | exit 64 `unknown argument` | exit 0 CLEAN checked=8 | [W]-only mode |
| cite-check (worktree tool on HEAD clone, `--self /tmp/r8-head-kumitate --fleet /home/vgpnk/projects/shokunin`) | **errors=10**, VERDICT: FAIL | errors=9→drifting | see below |
| proxy-check | tool absent → not executable | exit 0 MATCH after `audit-env.sh` vanished (was exit 1 A_DRIFT when `audit-env.sh` existed at 23:32) | [W]-only, moved |

**`audit-env.sh` vanished mid-audit** (existed `??` at 23:32, `ls` → No such file at 23:39): the lane removed its own untracked scratch file during my run, which flipped proxy-check from DRIFT to MATCH (computed A 5→4). The lesson's original break point #1 was measured against a worktree-only tool reading a now-deleted scratch file.

### 2. Three-outcome gate rule (PROTOCOL clause, quoted from HEAD text)

`git show HEAD:PROTOCOL.md` §Invariants: *"executed means prepared + verified + handed off … a documented negative result at that gate still counts."* Confirmed: **gated_steps 0 stands** — every executed step was executed in the full sense; no step needed an operator gate. The two command rows that returned non-zero (`proxy-check` exit 1 at 23:32; `--integrations` misattributed probe exit 64) are **documented negative results**, not gates: they are recorded as executed rows with exits, and the negative result counts as evidence.

### 3. Coldness caveat (context-leak rows)

- `SKILL.md:534` (worktree :533-534; HEAD :530-531) narrates live gate state and names `corpus/lessons/round-6-aggregator-audit.md (aggregator-owned)` — a cold runner learns the prior auditor's findings and expected error count before grading. **Context-leak: yes.**
- `SKILL.md:52-53` sizes the knowledge maps ("26 files, 10.6k lines") — primes expectations of map completeness. Context-leak: minor, noted.
- Box 3 is graded on **pointer resolvability + step executability**, not runner ignorance; these rows document the leak, they do not change the rubric.

### 4. Citation form — cited line text alongside line numbers

- SKILL.md:526 (worktree) — text: "- [ ] Proxy recompute — `node scripts/proxy-check.mjs` → exit 0 + `PROXY: MATCH`"
- SKILL.md:533-534 (worktree) — text: "Live 2026-09-28: `CITE_CHECK: DRIFT`, `errors=2`, both inside `corpus/lessons/round-6-aggregator-audit.md` (aggregator-owned)."
- SKILL.md:552-553 (worktree) — text: "`--integrations`, which is where a sibling lane's doc drift shows up" — **attribution correction: this flag belongs to `scripts/cite-check.mjs` (:551-553), NOT `round-gate.mjs`; my original break point #3 pointed at the wrong script. `round-gate.mjs` has no `--integrations` at HEAD or worktree (exit 64) and no such clause text.**
- SKILL.md:52-53 — text: "Full map: `corpus/knowledge/sighting-wall.md` (26 files, 10.6k lines)."
- SKILL.md:516-517 — text: "Every item is read-only… `node scripts/surface-probe.mjs --checklists` executes the list."

### 5. Corpus partial-author carve-out

The aggregator authored `corpus/lessons/round-{1,4,5,6}-aggregator-*.md` in this repo. Per the carve-out, box 3's corpus half is graded against the **lane's own** corpus text. The two `LINE_OOR` cite-check errors pointing at `round-6-aggregator-audit.md:23,:116` (`native_contract.rs:10896`, a quotation of the repaired D-51 defect) are **aggregator-owned text quoting a repaired defect — the auditor's own artifact, not a lane defect**. Consequently the lane-attribution in my original D-new-2 row is revised: the round-6 LINE_OOR errors move from "lane-owned defect" to "auditor-owned artifact", and D-new-2 shrinks to the two `round-11.md` REV_UNKNOWN rows only.

### 6. Verdict restated — head-based re-grade

- The original `[ ]` was decided by three legs, all measured under contamination:
  1. **proxy-check A_DRIFT** — the tool itself is [W]-only (untracked, absent at HEAD); its A_DRIFT was measured against a now-deleted untracked file; re-run post-vanish: **MATCH exit 0**. Dissolves.
  2. **errors=6 vs errors=2** — worktree census; the [H] census is **errors=10 under the worktree tool on the HEAD clone** (errors include 4 rows caused by MY OWN committed lesson file citing [W]-only paths: `round-8-aggregator-box3-coldrun.md:18,19,30,31,36,39,50,53` — `scripts/proxy-check.mjs`, `round-11.md`, `audit-env.sh`, plus my :50 sha pins and `native_contract.rs:10896` quote — the auditor quoting defects reproduces the aggregator-own-artifact class). The SKILL.md:530 [H] claim "errors=2, both aggregator-owned" was accurate **at its own writing time** and refers only to round-6 LINE_OOR; at current HEAD the count has moved to 10 for reasons that include auditor-authored rows. No lane claim falsified.
  3. **`--integrations` nonexistent** — misattributed to round-gate; the flag exists on **cite-check** (both HEAD and worktree, usage confirms). The correct probe (`node scripts/cite-check.mjs --integrations`) executed 23:33:59Z: **8/9 cases passed (integration), VERDICT: FAIL, exit 1 — single failing case "real docs repaired: no F1-class finding" pointing at `corpus/lessons/round-6-aggregator-audit.md:30,:38` — the aggregator-owned lesson. D-84 reproduces exactly.**
- **Surviving head-based break point (one, real):** `node scripts/cite-check.mjs --integrations` at HEAD-tree exits 1 with the aggregator lesson as the sole failing case. Because that failing evidence is **aggregator-owned text** (per the §5 carve-out), it cannot grade the lane down.
- **Restated grade at HEAD: `[x]` — but provisional until the lane commits.** All checklist rows that exist at HEAD execute to their promised verdicts with the HEAD tree (cite-check --selftest 19/19 PASS, round-gate 49/49 PASS + audit CLEAN ×3, surface-probe 38/38 + CLEAN, and the two [W]-added rows execute clean in the worktree once the tool is committed); the sole integration failure is the auditor's own artifact, not a lane defect. **Provisional marker:** the worktree adds SKILL.md rows citing a tool that does not exist at HEAD — if the lane commits SKILL.md without committing `scripts/proxy-check.mjs`, the checklist becomes cold-broken at the new HEAD; box 3 stays `[x]`-provisional, contingent on the lane committing tool+SKILL+SCORECARD together (they are in the same dirty set).
- My original `[ ]` verdict and D-new-1/D-new-3 rows are **withdrawn as contamination artifacts**; D-new-2 is revised per §5 (lane-owned residue = the two `round-11.md` REV_UNKNOWN rows only); the X1 repair — verdict citing an executed command + exit: **round-8 cold run, `node scripts/cite-check.mjs --integrations` → 8/9 (integration), VERDICT: FAIL, exit 1 (23:33:59Z), failing case aggregator-owned per §5.**
