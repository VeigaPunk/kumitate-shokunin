# Round 48 — non-author verifier spot-check (closure, attempt 2)

author: hyaku closure (non-author integrator, @m_kfc)
date: 2026-10-23
lane HEAD verified against: `4e4f4713a7a2d62d6ba7767b5f6e37211ba9baca` (base `f00cf278a5ab57e87b18418fc972be9f893f65da`)
report: `.ufo/reports/round-48/kumitate.md` (fleet commit `08c3202b20fc18eb568f33073b64f6bed142e4f1`, author `kumitate-shokunin`)

## 1. Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report author | `git log --format='%an %H' -- .ufo/reports/round-48/kumitate.md` | `kumitate-shokunin 08c3202b…` | pass |
| SHONEN heading | read report | `## SHONEN`, 4 box markers on 3 lines (line 3 carries boxes 3+4) = SHONEN.md's 4 boxes | pass |
| cited commits exist + ancestor of `master` | `git merge-base --is-ancestor <h> master` for `f00cf278`, `fe3d45bf`, `ce9aee5d`, `4e4f4713` | all YES (lane is jj-colocated, HEAD detached; tested against branch ref) | pass |
| lane pushed, no unpushed commit | `scripts/hyaku/jj-lane.sh state …` | `branch=master local=4e4f4713… remote=4e4f4713… ahead=0 behind=0` | pass |
| uncommitted round work | `git status --porcelain` | **5 paths**: ` M close/ReRunCounter48-1.md`, ` M close/ReRunCounterA.md` (prose reformats of committed receipt reports — substance identical to committed bytes: same held= lines, same counter sha), `?? close/ReviewIntegration.md`, `?? r48-plan.stderr`, `?? r48-residual-plan.stderr` | **defect (status-neutral)** — report named only the ReviewIntegration/CritClose late-output class as round-49 inheritance; the 2 modified .md and 2 .stderr were not named. Substance unaffected: every score-bearing receipt is committed; the working-tree edits are post-completion seat writes (mtimes 16:09–16:10 -03, after the record commit and driver `complete`). |
| prompt contract | read `.ufo/prompts/kumitate-round-48.md` vs `templates/round-prompt.md` | all round-level items (mission/axes binding §1, L2 floor §3, commit-then-push + push scope + L0 §5) and all five child-lane items (report path §4, commit-before-report §5, SHONEN heading §4, hash-citation rule §6 "The report lands last and cites the pushed lane hash", write scope §3 item 3) present; prompt committed (`70184b5`, attempt 2) | pass |
| marker vs report | read report | all required sections with evidence pointers; real report, not a marker | pass |

Dispatch/complete digest (from `.ufo/watchdog.log`, mutable — copied here as the resolving pointer):
`2026-10-23T08:04:35-03:00 launch kumitate round=48 pgid=1614930 driver=hyaku-inline attempt=1`;
`2026-10-23T15:03:19-03:00 lane-dead-no-report kumitate round=48; retry same round (hyaku-inline attempt=1: superseded at T0 2026-10-23T18:00Z: stale phase-4 author (orchestrator died 2026-10-23 ~09:30 -03); fresh attempt)`;
`2026-10-23T15:10:27-03:00 launch kumitate round=48 pgid=94401 driver=hyaku-inline attempt=2`;
`2026-10-23T16:09:30-03:00 complete kumitate round=48; hyaku-inline attempt=2`.

## 2. Claims — re-check (evidence-verified per §Gate standard closure consequence; the counter and the lane's gates were NOT executed by me — the integrator never executes a sibling's gate)

### C1 — operability (ROUTED_HELD, rule F48+A48) → **improved**

Evidence-verified (committed bytes) plus static re-measurement I ran:

- Counter bytes: `git show 4e4f4713:.ufo/waves/round-48/probe/caproute48-probe.mjs | sha256sum` → `3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59` — identical to the sha256 recorded inside every score receipt (`r48/L1-score-ce9aee5d.txt`, `close/ReRunCounter48-{1,2}-receipt.txt`).
- Scored runs (all committed, all `held=4/4 runs=3 rule=F48+A48` exit 0, at `ce9aee5d`, base `f00cf278`): L1 score 18:52:59Z; `ReRunCounter48-2` 19:00:46Z; `ReRunCounter48-1` 16:01:13-03. Three runs, time-spaced, zero exit-1/2 readings. Timestamps at/before the commit that ships them (`4e4f4713`, 16:08:15-03).
- Before-state: `r48/A48-stab-r48-fe3d45bf.txt` tail → `held=0/4 … exit=1`; base stability receipts exist (`probe/receipts/stab-r48-f00cf278-{1,2,3}.txt`).
- Static re-measurement of the before→after (mine): at `f00cf278` the four sites call `spawnSync` directly — `round-gate.mjs` runGate (:742 area), `surface-probe.mjs` :491, :519, :1592; at `ce9aee5d` all four call `capSpawnSync` imported from `./cap-spawn.mjs` (`round-gate.mjs:761`, `surface-probe.mjs:498/534/1614`). Matches the claim's site list exactly.
- A48 (pre-data amendment, forced by control MutSummaryForge M2): the amended predicate sentence is **byte-identical** between `plan.md` §A48 and the counter header (176 words each; compared whitespace-normalized). Validation receipts committed: `A48-m2prime.txt` (forgery at `905f8486` reads `held=3/4 … exit=1` — killed at exactly RG742), `A48-stab-r47-f00cf278.txt` (5/5), `A48-ctlenvcaps.txt` (0/4). The intermediate amended bytes `df42ab6b…` (propagation bug) are discarded, never scored — receipts support this.
- H2: `close/ReRunR47Set-receipt.txt` → `held=5/5 runs=3 rule=F48+A48` exit 0 at `ce9aee5d`, three genuinely distinct traces (fresh `git archive` scratch dirs).
- Declared limits verified present (bind view `r48/L1BindProbe-receipt.txt`; argv identity; A48 as output-text oracle; cap-spawn OOM→status-0; PID-wrap exit-2 risk).
- cap-spawn touch (A48 exception, CriticHarm #2): diff is +3/−0 — `rmSync(vd, …)` verdict-dir cleanup on exit paths, behavior-invariant. CriticHarm #2 documents the leak class and the measurement recipe.

### C2 — capability acquisition `counter-rerun` → **improved**

- Static: `git cat-file -e fe3d45bf:scripts/counter-rerun.mjs` fails (absent at freeze); exists at `ce9aee5d`. ✓ before→after.
- Evidence: `r48/L1-c2-binding-ce9aee5d.txt` — `COUNTER_RERUN_SELFTEST: PASS` exit 0 (14 cases incl. flake-injection killing a print-PASS stub and a counter-not-executed check); real `COUNTER_RERUN: AGREE (runs=2)` exit 0 over the frozen probe at `ce9aee5d`, both runs `held=4/4`, byte-identical summary sha256 `f3c23bdc…`. The documented `--` tail defect (first attempt exits 64/2, fail-closed) is recorded in the same receipt with the corrected absolute-path command. Instrument sha256 `c002523f…` pinned as `pin.counter-rerun`.
- Capability row in `SCORECARD.md` (line 1734) with the same-round evidence pointer — not pre-claiming.

### Harm gates

- **H1 (mine, item-level):** base `r48/L1H1Base-f00cf278-run1-2.txt` + `r48/ScribeReceipts-checklist-base-{1,2}.txt` — 18/22, FAIL items {685,686,687,697} in every base run. Tip `close/H1Tip-run{1,2}.txt` — 19/22, FAIL items {685,686,687} in both tip runs. **Zero pass→fail flips; the only change is 697 fail→pass.** Matches the report's no-harm claim exactly.
- **H2:** 5/5 committed (above). **H3:** `close/proxy-strict-close.txt` → `PROXY: MATCH (… pins=6 match)` exit 0. **H4:** `close/census-close.txt` exit 0; my own run of `scripts/sources-census.sh validate --root … kumitate` → **exit 0** (`kumitate ok`; 4 pre-existing W04 duplicate-url warnings S068/S084/S095 + S034).
- SCORECARD diff (`f00cf278..4e4f4713`): honest accounting — A 25→38 (enumerated: probe + counter-rerun + 11 inherited analysis scripts), C2/C2_total 106→108/108 (README rows), operability 9 (terminal), re-pins named. No owned axis harmed.

## 3. Discernment spot-check (LEARNING.md — from outside)

| item | gate decision | re-opened source (mine) | agree/disagree | reason |
|---|---|---|---|---|
| S098 admit (strace 7.2 manual) | admitted, tier A, mined | re-fetched `https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in` — body sha256 `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a` = row's recorded sha **exact**; `:832-835` "Aligns return values in a specific column (default column 40)" present; `:148-158` unfinished/resumed marking with whitespace before the return value present | **agree** | row quote is 25 words (≤25) and both cited spans verify; note — the quote is a located condensation of the two spans, not a verbatim string; the locators + sha are exact, so the `teaches` claim is grounded. Minor style note, not a disagreement. The probe header cites S098 textually. |
| reject sample | lesson `## Gate`: "**Rejected: None this round**" | — no candidate rejections logged in round 48's Gate | n/a — sample impossible | the round logged 1 admit / 0 rejects; the visible rejection decision of the round is the lane discarding its own intermediate A48 bytes `df42ab6b…` when re-scores disagreed (lesson Mistake 4; discarded receipts never scored; final validation receipts verified above) — **agree** with that decision and its evidence handling. Zero-reject rounds give the outside check a thin reject sample; routed as an observation, not a false gate. |
| census | exit 0 required at round end | my run: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` | **agree** | exit 0; W04 ×4 are pre-existing duplicate-url rows, unchanged this round (SOURCES.md diff = +S098 only). |

SOURCES.md row spot-check: S098 quote = "strace aligns return values to a selected column (default 40), and interleaved syscalls can be marked unfinished then resumed with whitespace before the return value." — 25 words, ≤25 ✓, located (`:832-835`, `:148-158`) ✓, sha exact ✓.

## 4. Trend verdicts

- **expansion — improved.** Verified: +1 tier-A `mined` row (S098, sha-verified); `counter-rerun` enters the SCORECARD capabilities table with a same-round passing demonstration (selftest + real AGREE); four more gate sites under the bounded runner (static diff).
- **quality — improved.** R47-1..R47-5 repaired with committed receipts (A2 re-runs 3/5,3/5,4/5 reproduced at `f00cf278` — verified in `r48/ScribeReceipts-a2-rerun-{1,2,3}.txt`; SCORECARD `## Round 47 correction`; root-cause proofs committed); Q36/Q37 appended to QUALITY.md (Q36 with a shown-able-to-fail citation); A48 closes the forged-summary class with committed kill evidence; proxy re-pins are honest (receipt reads MATCH with pins=6).
- **discernment — improved.** The lane rejected its own intermediate A48 bytes on disagreement and recorded the class (Mistake 4); the r47 outside-check disagreements became Q36/Q37 and committed re-runs, not prose; my spot-check agrees with the round's one admit and its self-rejection decision.

## 5. Routed defects and notes for round 49 (lane-owned; fix or answer there)

1. **Uncommitted leftovers at close (5 paths)** — `close/ReRunCounter48-1.md`, `close/ReRunCounterA.md` (modified receipt-report prose), `close/ReviewIntegration.md`, `r48-plan.stderr`, `r48-residual-plan.stderr`. The report named only the ReviewIntegration/CritClose class; name or resolve the rest per the inheritance rule (commit under round-49's entry or revert) in round 49.
2. **Registry gap** — `counter-rerun` carries a `--selftest` and a non-zero exit map (1 DISAGREE / 2 fail-closed / 64 usage) but has no row at the SKILL.md `## Gate registry` (only a `pin.counter-rerun` entry in proxy-check GATE_PINS). Register it (gate or probe, per the standard's classification) or record the exemption; same question for the round-48 `cap-spawn` helper change's pin.
3. **LOG.md wording** — the round-48 bullet says "two mistakes"; `corpus/lessons/round-48.md` mines four. Appended correction per the corrections-sweep rule.
4. **Minor timestamp imprecision** — report says the committed re-runs are spaced "18:52Z/18:59Z/19:00Z"; the committed `ReRunCounter48-1` receipt starts 19:01:13Z. Time-spacing conclusion unaffected.
5. **Leak-delta evidence completeness** — `r48/L1-leakfix-delta.txt` is one line (`leak-delta-at-ce9aee5d=13`) while the report/SCORECARD claim "quiet-host delta 0"; the decomposition (13 attributable to concurrent host activity vs 0 owned) is not committed. Fix itself is visible (+3 lines, all-path `rmSync`).

Operator note: SHONEN boxes are all `[~]`/`[ ]` lane-asserted; none is checkable to `[x]` by this non-author — promotion stays operator-owned. Wave accounting verified exact (r48-spec 65 seats, role mix as reported, attack 39 = 60%; residual 8; total 73).
