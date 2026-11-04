# K85Scout — round-85 reconnaissance (read-only)

Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Scope: consumers of `scripts/counter-receipt.mjs`,
the round-84 `vacuous` Mistakes row and the r84 spot-check C1 kill finding, the `proxy-check` gate-pin map,
and the seven routed defects of the r84 spot-check. No production file was edited; no git/jj mutation;
no build/lint/test on the shared tree. Every measurement below was taken in the seat scratch
`/fast/scratch/hyaku/kumitate-r85/K85Scout/` (a `git clone --shared` of the lane, plus copies of the
lane's own files), never by mutating the shared tree.

Revisions used: base `a5d3e7549501ae76dbd86a6f81c5e858f1f92446`, repair `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`,
freeze `9db0c6b5eb9111cfc5581006ba976ca2cd112792`. **While this seat was measuring, L1 landed
`a882a334eaf7d817f484f9e68c2b2059f22fe797`** ("counter-receipt v2 derives its answer from the bytes it
read and binds the counter source"), which carries the v2 tool and the corpus/prose updates. Where a
finding is affected, both states are reported: **freeze = `9db0c6b5`**, **landed = `a882a334`**.
Measured at `a882a334` (scratch clone): `README_MAP: CLEAN files=216 rows=216 covered=216` exit 0;
`node scripts/proxy-check.mjs --strict` → `A_DRIFT declared=972 computed=975 delta=+3`, **exit 1**;
lane-scoped `cite-check` → `files=221 errors=2257 warnings=921`.

---

## 1. The `vacuous` Mistakes row and the r84 spot-check C1 kill finding

### 1.1 `vacuous` Mistakes row — `corpus/lessons/round-84.md:82` (exact line)

```
| vacuous | r84 label-keyed no-reader 16/16 | Q29 required absent/constant/junk/no-reader/label-keyed controls before data; only first two were measured | No repair credit: keep C1 UNMET. Successor must freeze same-path content variation, non-outcome-bearing labels and exact unique verdict assertions before data |
```

Section anchor: `corpus/lessons/round-84.md:77` `## Mistakes`. The row is the round's own grading of the
r84 counter: no repair credit, and an explicit successor obligation — *same-path content variation,
non-outcome-bearing labels, exact unique verdict assertions, all frozen before data*.

### 1.2 Spot-check C1 kill finding — `corpus/lessons/round-84-verifier-spotcheck.md`

Claim header, `:48`:

```
### C1 — operability: `counter-receipt` capability (declared, frozen in `3794b903`)
```

Kill-rule paragraph, `:58` (exact line):

```
**Kill rule (plan.md, frozen): "do-nothing control reaching 16 means unmet".** `build/K84Critic/no-work-probe-node.txt` (`rev=3794b903`): the label-keyed no-reader prints a fixed token list and yields `C84_C1: HELD held=16/16`, `exit=0`. Its committed source `build/K84Critic/no-work-counter-receipt.mjs` is 6 lines; the first line is the comment `// Adversarial no-work candidate: never opens or interprets a receipt.` and the only output is a constant `console.log`. `renamed-red.txt` shows the same no-reader returning `X: HELD held=1/1` on a red input (exit 0, expected exit 1 `HELD_COUNT`).
```

Verdict, `:60` (exact line):

```
**Verdict: C1 UNMET** (frozen kill rule fires). The work commit's green 16/16 cannot cure a do-nothing control at 16/16. Re-measured: no. Evidence-verified: yes (controls, probe output, kill control, plan diff).
```

Corroborating line in the same file, `:65`: ``- `.ufo/waves/round-84/close/history-red.txt` (rev `ab8f6013`): `COUNTER_RECEIPT: DRIFT ARMS_TOTAL`, `exit=1`. Consistent with the 28-vs-27 defect.``

Non-author verdict sections: §5 `:130`–`131` (`operability: unchanged`, admission `false`).

---

## 2. Every consumer of `scripts/counter-receipt.mjs` (file:line) and v2's effect on its literal text

`grep -rn counter-receipt` over the lane (excluding `.git`) yields these consumers. "v2 effect" is judged
against the frozen v2 contract in `.ufo/waves/round-85/plan.md:46-58`: `--receipt FILE [--src COUNTER.mjs]`,
output = `COUNTER_RECEIPT: …` line, then `RECEIPT: bytes=… rows=… held=…/… findings=… sha256=…`, then
`SOURCE: sites=… declared=… receipt=…` only with `--src`; findings extend v1's 11 tokens with
`SOURCE_UNREADABLE`, `SOURCE_ARMS_EMPTY`, `ARM_UNBOUND`, `SOURCE_ARITY`, `SOURCE_DECLARED`.

| # | Consumer (file:line) | What it literally says | Is the literal text invalidated by v2? |
|---|---|---|---|
| 1 | `SKILL.md:607` (gate-registry row) | `node scripts/counter-receipt.mjs --receipt FILE` → `COUNTER_RECEIPT: CLEAN` (0 clean), `DRIFT` (1 failed), `FAIL-CLOSED` (2), `USAGE` (64); `kumitate-counter-receipt-v1` reconciles one arm-form counter transcript's denominator, unique names, prefix, ok/FAIL counts, verdict and ordering; pinned values: `SCORECARD.md` `kumitate-gate-pins-v1` `pin.counter-receipt`; `corpus/knowledge/counter-transcript-reconciliation.md`; Q77 | **Repaired in L1's landed commit `a882a334`**: the row now reads `--receipt FILE [--src COUNTER.mjs]`, names `kumitate-counter-receipt-v2`, adds the `RECEIPT:`/`SOURCE:` line shapes, the new finding tokens, and cites `counter-receipt-discrimination.md` + `Q77, Q78`. **At the freeze commit (9db0c6b5) the row still described v1 and was stale.** |
| 2 | `SKILL.md:760` (checklist item, round 84) | `- [ ] Counter-receipt reconciliation (round 84; grammar and limits in corpus/knowledge/counter-transcript-reconciliation.md; actual task judges the unchanged r83 red and repair receipts) — node scripts/counter-receipt.mjs --selftest → exit 0 + COUNTER_RECEIPT_SELFTEST: PASS` | **Partly invalidated.** The asserted observable still holds under v2 — measured: v2 `--selftest --work <scratch>` → exit 0, `COUNTER_RECEIPT_SELFTEST: PASS held=60/60` (substring `COUNTER_RECEIPT_SELFTEST: PASS` still matches). But (a) it points at the **v1** grammar note, whose error table (11 tokens) and "CLI prints one `COUNTER_RECEIPT:` verdict" (`corpus/knowledge/counter-transcript-reconciliation.md:44`) are **false for v2**, which prints 2–3 lines; (b) the "actual task judges the unchanged r83 red and repair receipts" half is still true — measured v2 on r83 `close/c1-probe.txt` → `DRIFT ARMS_TOTAL` exit 1, `c1-repair.txt` → `CLEAN` exit 0, `c2-probe.txt` → `CLEAN` exit 0. |
| 3 | `SKILL.md:761` (checklist item, round 85 — landed in `a882a334`) | `node .ufo/waves/round-85/probe/probe85-c1.mjs --lane . --work "${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r85/checklist"` → exit 0 + `C85_C1: HELD held=20/20` | New consumer; it moved the checklist-item count `C` 44 → 45, and the stanza says `C=45` (measured at `a882a334`) — consistent. The `surface-probe` checklist grammar (`scripts/surface-probe.mjs:278`) accepts it as written; `--work` points outside the lane, matching the scratch rule. |
| 4 | `SCORECARD.md:354` (gate-pin stanza `kumitate-gate-pins-v1`) | `pin.counter-receipt=190a4c1f893a5fc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0` — the sha256 of the **v1** file (verified: `sha256sum` of `scripts/counter-receipt.mjs` at 9db0c6b5 = `190a4c1f…`) | **Invalidated by construction**: any byte change to the tool makes this stanza value stale → `GATE_PIN_DRIFT` error → `PROXY: DRIFT`, exit 1. **Repaired in L1's landed commit `a882a334`** (re-pinned to `f385bd7a9fbf1dc49d465c8d83fecfd07aae34f6bf619aca7d935eda14f238cd`, which I verified equals the sha256 of the landed v2 file); measured at `a882a334`: **no** `GATE_PIN_DRIFT` finding. |
| 5 | `SCORECARD.md:1974-1979` (round-84 capability disposition prose) | "Round-84 capability disposition: `counter-receipt` is a shipped, self-tested instrument, but its acquisition claim is **unadmitted** … It does not enter this verified repertoire table on that counter. See `.ufo/waves/round-84/build/K84Critic/no-work-probe-node.txt` and `corpus/lessons/round-84.md`; a successor needs a separately frozen predicate." | **Not invalidated as history** (it describes round 84). It was **incomplete** if round 85 admits C1: the `## Capabilities` table (`SCORECARD.md:1942-1987`) had **no** `counter-receipt` row and no `| operability |` axis row change. **L1's landed commit `a882a334` adds the capability row** (`SCORECARD.md:1976`, "`counter-receipt` | Reconcile one arm-form counter transcript against the bytes it read and the source that produced it …") — so the r84 prose ("does not enter this verified repertoire table on that counter") and the new row are consistent only if the round-85 disposition says the claim was admitted. L1's landed commit also adds `SCORECARD.md:4086` `## Round 85 — declaration and measured disposition (2026-11-04)`. |
| 6 | `SCORECARD.md:4015-4032` (round-84 declared claim + measured disposition) | "One claim: C1 **operability** … capability acquisition `counter-receipt` … Frozen plan/counter/control commit `3794b903…`" and the row `| 84 | C1 operability … | … | **UNMET: frozen kill rule fired; rejected-honest-stop**, not an admitted capability |` | Historical; must not be rewritten (r84 lesson `reference-drift`/`scope` rules). Round 85 got its **own** `## Round 85 — declaration and measured disposition` section in `a882a334` (`SCORECARD.md:4086`); at the freeze commit `9db0c6b5` no `## Round 85` section existed at all (measured `grep -c "Round 85"` = 0). |
| 7 | `scripts/proxy-check.mjs:576` (gate-pin map) | `'pin.counter-receipt': 'scripts/counter-receipt.mjs', // round 84: executed-arm transcript reconciliation` | Path unchanged by v2 → the map entry stays valid; only the **declared sha** in the SCORECARD stanza moves (item 4). The map's key set is closed (`GATE_PINS`, 29 keys) — a new key would need `GATE_PIN_KEY_UNKNOWN` handling (`proxy-check.mjs:1106-1110`). |
| 8 | `scripts/counter-receipt.mjs` (the tool itself) | v1 header `kumitate-counter-receipt-v1 … Malformed (exit 2): SUMMARY_COUNT, ARM_MALFORMED, ARMS_EMPTY, SUMMARY_ORDER. Drift (exit 1): ARMS_TOTAL, ARM_DUPLICATE, ARM_PREFIX, HELD_COUNT, ARM_FAILED, VERDICT.` | **Superseded** by the v2 implementation landed in `a882a334` (`f385bd7a…`), whose header names `kumitate-counter-receipt-v2`, adds the source-side tokens (`SOURCE_UNREADABLE`, `SOURCE_ARMS_EMPTY`, `ARM_UNBOUND`, `SOURCE_ARITY`, `SOURCE_DECLARED`) and the `RECEIPT:`/`SOURCE:` output lines. The v1 file was byte-identical to `SCORECARD.md:354`'s declared pin and to the r84 candidate `.ufo/waves/round-84/build/K84ExecGate/counter-receipt.mjs` (both `190a4c1f…`, verified). |
| 9 | `corpus/knowledge/counter-transcript-reconciliation.md:3` (`recheck:`), `:18`, `:26-42` (error table), `:44`, `:66` | `recheck: node scripts/counter-receipt.mjs --receipt .ufo/waves/round-83/close/c1-probe.txt (expected exit 1 ARMS_TOTAL); repeat with c1-repair.txt (expected exit 0 CLEAN); selftest --work DIR …` — the v1 contract description, the 11-token precedence table, "CLI prints one `COUNTER_RECEIPT:` verdict", and "A separately frozen successor needs same-path content variation and non-outcome-bearing names, plus an unambiguous output assertion" | **Invalidated for v2 in three places**: `:18` (contract id v1), `:26-42` (error table lacks the 5 new source tokens and their precedence), `:44` ("prints one verdict" — v2 prints 2–3 lines). `:3` (recheck) remains **true** for v2 — measured: v2 on r83 `c1-probe.txt` → `DRIFT ARMS_TOTAL` exit 1; `c1-repair.txt` → `CLEAN` exit 0; `selftest --work DIR` → exit 0. `:66` is the requirement round 85 answers. The note is **not edited** — the successor knowledge note is `corpus/knowledge/counter-receipt-discrimination.md`, landed in `a882a334`; its `recheck:` line names the v2 selftest count `held=60/60`, which matches my measurement of the landed v2 tool (`PASS held=60/60`). **Residual staleness**: the v1 note still says "prints one `COUNTER_RECEIPT:` verdict" about the *same file path* the new note also claims, so a reader following either pointer can be misled. |
| 10 | `corpus/QUALITY.md:1287-1306` (Q77) and `:1309` (Q78, landed in `a882a334`) | Q77 "Command. `node scripts/counter-receipt.mjs --receipt FILE`; the new frozen `.ufo/waves/round-84/probe/probe84-c1.mjs` uses its table length …" | Q77 stays **true** under v2 (same command, same grammar, same historical receipts). Q78 (landed) grounds itself in the r84 `vacuous` row and requires four pre-data control classes — this is the R-control landing (§4). Note the **format asymmetry**: Q77 is a `### Q…` heading (`:1287`) while Q78 is a top-level bullet (`:1309`) appended after Q77's block; the file already mixes both forms (`grep -c '^### Q'` = 2). |
| 11 | `corpus/README.md:341` (knowledge row), `:342` (r84 lesson row), `:225` (r84 spot-check row) | rows naming `knowledge/counter-transcript-reconciliation.md`, `lessons/round-84.md`, `lessons/round-84-verifier-spotcheck.md` | The two **new** corpus notes needed rows: `:356` (`knowledge/counter-receipt-discrimination.md`) and `:357` (`lessons/round-85.md`) — both landed in `a882a334`; measured there, the map is consistent (216 files / 216 rows / 216 covered, `README_MAP: CLEAN` exit 0). At freeze `9db0c6b5` the map was **red** — see §5 finding F-1. |
| 12 | `corpus/SOURCES.md` (S243/S244 rows, and new S245/S246) | S243 mined (r83 `const ARMS = 27` vs 28 rows), S244 rejected (headline-only proof) | Unchanged by v2. `a882a334` adds **S245** (mined, arXiv:2212.06118 abstract) and **S246** (rejected, ACM DL HTTP 403) — matches `plan.md:80-85`. New source ids are exactly the reserved S245/S246. |
| 13 | `.ufo/waves/round-85/plan.md:13, 46-58` | the v2 contract text | Frozen; the source of truth for every "v2 effect" judgement above. |
| 14 | `.ufo/waves/round-85/probe/probe85-c1.mjs:23` | `const tool = join(lane, 'scripts', 'counter-receipt.mjs');` + the 20-case table with `RECEIPT:`/`SOURCE:` assertions | Frozen. Measured behaviour of the frozen probe: against the **current live lane** → `C85_C1: HELD held=20/20` exit 0; against the r84 candidate copy (v1) → 1/20 exit 1. |
| 15 | `.ufo/waves/round-85/controls/{base,stub,noreader}/scripts/counter-receipt.mjs` and `controls/content-variation.mjs:25` | frozen pre-data controls: v1 copy (base), constant-CLEAN printer (stub), basename-keyed no-reader (noreader), same-path content-variation driver | Frozen; the committed receipts `controls/base.txt` (`held=1/20`), `stub.txt` (`0/20`), `noreader.txt` (`1/20`), `cv-*.txt` (`0/3` each) match `plan.md:55-60` and the task statement. |
| 16 | `.ufo/waves/round-84/**` (plan, probe, build, close, w1) | the frozen v1 claim and its receipts | Historical; must not be rewritten. Note `.ufo/waves/round-84/close/{history-red,history-repair,history-c2}.txt` are the **tool's own output lines** (`rev=`, `command:`, `COUNTER_RECEIPT: …`, `exit=`), *not* arm-form transcripts — feeding them back to the tool gives `FAIL-CLOSED SUMMARY_COUNT` exit 2 (measured with v1 and v2). See F-3. |

**Not a consumer:** `scripts/counter-pins.mjs` contains no `counter-receipt` string (measured), and
`.ufo/pins/counter-pins.json` (45 pins) does **not** pin `scripts/counter-receipt.mjs`. It pins
`.ufo/waves/round-84/probe/probe84-c1.mjs` (round 84) — but **not** the round-85 probe
`.ufo/waves/round-85/probe/probe85-c1.mjs`. The r84 precedent added the round's probe to that registry
(`git log -S probe84-c1 -- .ufo/pins/counter-pins.json` → `ab8f6013`); round 85 has no equivalent entry,
so the frozen r85 counter is currently unprotected by the `counter-pins` gate → finding **F-4**.

---

## 3. `scripts/proxy-check.mjs` gate-pin map — keys, and what a changed sha does

Two closed key sets, both mapping **key → file path** (the sha lives in SCORECARD, not here):

* **Parent-frozen `PINS`** (`scripts/proxy-check.mjs:537-545`), 6 keys, and the frozen parent key list
  `A C C1 C1_total C2 C2_total S_members S_sections R_members R_sections coverage_script coverage_runtime C1k C1k_total K_members K_sections K_findings coverage_kimi C1o C1o_total O_members O_findings O_bound coverage_omp pin.cite-check pin.surface-probe pin.round-gate pin.proxy-check pin.claims-check pin.kimi-census` (`:1853`):
  `pin.cite-check`, `pin.surface-probe`, `pin.round-gate`, `pin.proxy-check`, `pin.claims-check`, `pin.kimi-census`.
* **Lane-owned `GATE_PINS`** (`scripts/proxy-check.mjs:547-577`), **29 keys** — the map the task asks about:
  `pin.anchor-truth`, `pin.sources-check`, `pin.wave-census`, `pin.gate-mutants`, `pin.omp-census`,
  `pin.omp-shape`, `pin.cap-run`, `pin.bind-oracle`, `pin.cap-spawn`, `pin.counter-rerun`,
  `pin.receipt-attest`, `pin.counter-pins`, `pin.source-capture`, `pin.source-dupes`, `pin.readme-map`,
  `pin.receipt-evidence`, `pin.cite-sources`, `pin.dispatch-evidence`, `pin.make-dispatch-actual`,
  `pin.inline-dispatch-evidence`, `pin.plan-before-ready`, `pin.jj-seat-demo`, `pin.report-receipt-diff`,
  `pin.control-replay`, `pin.harm-matrix`, `pin.routed-ledger`, `pin.spotcheck-adopt`, `pin.ready-handoff`,
  **`pin.counter-receipt` → `scripts/counter-receipt.mjs`** (`scripts/proxy-check.mjs:576`; the only key
  naming counter-receipt).

**What happens when that file's sha changes.** `compareGatePins()` (`scripts/proxy-check.mjs:1165-1182`)
recomputes `sha256File()` of the mapped path and, on mismatch, pushes
`{ severity: 'error', kind: 'GATE_PIN_DRIFT', term: key, declared, computed }`. `summarize()`
(`:1245-1249`) counts `errors>0` → verdict `DRIFT`, exit code 1 — **with or without `--strict`** (strict
only promotes *warnings*). The declared side is parsed out of the SCORECARD stanza
`<!-- kumitate-gate-pins-v1 … -->` (`parseGatePins`, `:1076-1122`): a key not in `GATE_PINS` is
`GATE_PIN_KEY_UNKNOWN` (`:1106-1110`), a non-64-hex or duplicated value is `GATE_PIN_MALFORMED`
(`:1111-1116`), and a second/malformed block is `GATE_PIN_MALFORMED` (`:1084-1097`). So the v2 edit
requires exactly one SCORECARD line change — `pin.counter-receipt=<new sha>` — and nothing else.
**Measured:** with the working tree's v2 file and its re-pinned stanza, the overlay run of
`node scripts/proxy-check.mjs --strict` reports **no** `GATE_PIN_DRIFT`; the only errors are the `A`
and `C2` term drifts of §5.

---

## 4. The r84 spot-check's seven routed defects, classified for round 85

Source: `corpus/lessons/round-84-verifier-spotcheck.md:134-142` (`## 6. Routed defects for the kumitate lane (fix next round)`).
`plan.md:92-100` carries the lane's answers.

| # | Routed defect (spot-check line) | Round-85 landing | Classification | Pointer |
|---|---|---|---|---|
| R-cite | `:136` "Fleet cite-check moved `errors 2546 → 2555`, `warnings 999 → 1003` … Attribute the +9 errors to the round-84 files … and fix them in the owning files." | The plan assigns attribution+fix to this round; the lane's own base reading is quoted as `errors=2249 warnings=921 files=219` (`plan.md:94`). **I reproduced that base reading exactly** in lane scope (`--self <lane> --fleet <fleet-root>` at `a5d3e754`: `CITE_CHECK: DRIFT (files=219 tokens=14466 errors=2249 warnings=921)`) and it is **unchanged at freeze 9db0c6b5** (same numbers, `tokens=14467`). At the landed commit `a882a334` it reads `files=221 errors=2257 warnings=921`, i.e. **+8 errors and +2 files** from the round-85 additions — the number L1 must attribute. Attribution evidence: the r84 spot-check file itself carries **29 errors** in lane-only scope (26 `UNRESOLVED` source + 3 `REV_UNKNOWN`) and 22 `UNRESOLVED` in the fleet-parent scope — the same file the pre-registration says the lane may not edit. | **carried** (in flight; the lane-owned delta is +8 errors over base, all in round-85 files) | `plan.md:93-94`; `corpus/lessons/round-84-verifier-spotcheck.md:136` |
| R-control | `:137` "Add a `corpus/QUALITY.md` criterion, grounded in the round-84 `vacuous` Mistakes row, requiring at least a label-keyed no-reader, a constant-CLEAN and a same-path content-variation control **before** data, with exact unique verdict assertions." | **Landed** in `a882a334`: `corpus/QUALITY.md:1309` — "**Q78 — pre-data controls must be able to differ from the work.**" naming the four control classes, exact verdict assertions, and grounding itself in the r84 `vacuous` row. The *behavioural* half was landed and frozen earlier, at the freeze commit: the three pre-data control receipts are committed in `9db0c6b5` (`controls/{base,stub,noreader}.txt` = 1/20, 0/20, 1/20; `controls/cv-*.txt` = 0/3 each). | **landed** (criterion + pre-data controls) | `corpus/QUALITY.md:1309`; `.ufo/waves/round-85/controls/*.txt`; `plan.md:70-72` |
| R-proxy | `:138` "The A proxy counted 11 round-84 wave-internal `.mjs` files … Propose a frozen exclusion of `.ufo/waves/` for A, pre-registered before the next measurement; do not re-baseline silently." | The **pre-registration text exists** — `SCORECARD.md` `## Round 85 — pre-registration (written by round 85)` item (1) "`A` excludes wave scaffolding", with the exact command `git ls-tree -r --name-only <branch> \| grep -E '\.(mjs\|js\|sh\|py)$' \| grep -v '^\.ufo/' \| wc -l`, a new non-scoring `A_wave` term and a proxy selftest arm. It landed with `a882a334` at `SCORECARD.md:4062`. But it is **not** in the `## Planned` section as `plan.md:94-96` states, it is written by round 85 itself (the file's convention is "Round N — pre-registration (written by round N-1)", e.g. `SCORECARD.md:3967`), and **`proxy-check.mjs` is unchanged** — the exclusion is *declared*, not *measured*. The drift is live: at the landed commit `a882a334` the stanza says `A=972` while the tree computes **975** → `A_DRIFT` error, `PROXY: DRIFT`, **exit 1** (measured). At the freeze commit it was `A=908` vs computed **913** → also red. `A` is a working-tree count (`walkFiles(self)` over `RE_RUNNABLE`, `scripts/proxy-check.mjs:601,978`), so it moves with every `.mjs` a seat writes under `.ufo/waves/round-85/` and no static re-pin can hold it. | **carried** — declaration present, amendment not applied; the plan's location wording (`## Planned`) does not match where it landed, and the gate is still red | `SCORECARD.md:4062-4076`; `plan.md:94-96`; `scripts/proxy-check.mjs:601,978` |
| R-checklist | `:139` "`close/checklists.txt` is 41/44 red … Route the live-host items to their owning lanes or record them as host-drift with a dated receipt. Do not refresh pins to hide drift." | The plan's answer is disclosure, not repair: "`VERDICT: FAIL` is disclosed with its receipt, not reclassified" (`plan.md:96-97`). L1's landed commit `a882a334` now carries a `.ufo/waves/round-85/close/` set (`c1-probe.txt`, `content-variation.txt`, `harm-matrix.txt`, `history-v2.txt`, `map-repair.txt`, `selftest.txt`, `source-counts.txt`, `s5-fix.txt`) — the disclosure surface exists; I did not re-measure the checklist verdict (it is the L1's gate, not this seat's bounded probe). | **carried** (disclosure surface landing; verdict not re-measured here) | `plan.md:96-97`; `.ufo/waves/round-85/close/`; `corpus/lessons/round-84-verifier-spotcheck.md:139` |
| R-planner | `:140` "The next wave must seat a planner as an L2 subagent (or the prompt must state the L1-held planner as a deviation). Record in the report." | Satisfied by the **declared deviation**: `plan.md:8` "L1 `KumitateR85` holds the canonical planner seat" and `plan.md:97-98` "this round records the L1-held planner as the prompt-sanctioned deviation"; the prompt states the same. The dispatched wave has 13 seats and **no** planner seat (`.ufo/waves/round-85/w1-spec.json` items: ExecGate, ExecFixture, ExecHistory, ExecSelftest, ExecPins, Scribe, Scout, Connector, Review, Critic, Mutation, Sentinel, Cheat). | **closed as a recorded deviation** | `plan.md:8, 97-98`; `.ufo/waves/round-85/w1-spec.json` |
| R-timing | `:141` "Commit round labels only after the steer; do not label pre-dispatch repair commits as `round-N`. Record report/tip timestamp order (D-c) when citing a tip from the report." | Partly satisfied, with a **repeat of the r84 D-b pattern**: both round-85 commits carry the `round-85:` label, but the repair commit `6663b3be` is dated `2026-11-04 15:36:16 -0300` while the round-85 steer/launch line in the fleet watchdog is `2026-11-04T15:37:46-03:00 launch kumitate round=85` (`/home/vgpnk/Projects/shokunin/.ufo/watchdog.log:2431`) — i.e. the pre-dispatch repair commit is labelled `round-85:` exactly 90 s before the steer (the r84 defect was the same shape, `dd91b8ec` before the `12:48:49` launch). The tip/report timestamp order is still to be recorded by L1's report. | **carried** (label-before-steer repeat; timestamp order pending) | `plan.md:98-100`; `corpus/lessons/round-84-verifier-spotcheck.md:141` (D-b at `:34`) |
| R-promotion | `:142` "SHONEN boxes 2 … and 4 … look plausibly checkable by a non-author. Box 1 and Box 3 are not. Promotion is the operator's decision; this file does not write `[x]`." | Lane-author answer: "SHONEN boxes stay `[~]`; promotion is the operator's" (`plan.md:100`). Measured: the lane's `SHONEN.md` holds 4 `- [ ]` boxes, **zero** `[x]` and **zero** `[~]`; the `[~]` markers live in the fleet report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-84/kumitate.md:101-104` (4 lines). No promotion is due from this seat. | **closed / operator-owned** | `plan.md:100`; `SHONEN.md:5-8`; `/home/vgpnk/Projects/shokunin/.ufo/reports/round-84/kumitate.md:99-104` |

**Summary:** landed 1 (R-control) · carried 5 (R-cite, R-proxy, R-checklist, R-timing, + R-promotion as
operator-owned) · closed-by-deviation 1 (R-planner) · closed/operator 1 (R-promotion).

---

## 5. Findings for L1 (measured; no edits made, frozen predicate untouched)

**F-1 (map gate — red at the freeze commit, green after L1's landed commit).** At `9db0c6b5` the map gate
read `README_MAP: DRIFT files=214 rows=214 covered=213 bad=1 first=unpinned:lessons/round-84-verifier-spotcheck.md`,
exit 1 (measured on the freeze tree). The repair commit `6663b3be` added the **README row** for the r84
spot-check note and re-pinned `C2`/`C2_total` 213→214, but did **not** add the note to
`.ufo/pins/readme-map.json` `covered` — the bimap's other half. **L1's landed commit `a882a334` closes
it**: measured at `a882a334`, `README_MAP: CLEAN files=216 rows=216 covered=216` exit 0. *Closed by the
landed commit; the freeze-commit red is the receipt for it.*

**F-2 (the `A` proxy term is still red after L1's landed commit — this is now the live gate).**
At `9db0c6b5`: `PROXY  error A_DRIFT A: declared=908 computed=913 delta=+5` → `PROXY: DRIFT (A_DRIFT …)`,
**exit 1**. The freeze commit itself added 5 runnable `.mjs` under `.ufo/waves/round-85/` (the probe, three
control copies, `content-variation.mjs`) without re-pinning `A` — the r84 R-proxy inflation recurring
inside round 85's own freeze. At the repair commit `6663b3be` the same command reads
`PROXY: MATCH (A=908 C=44 … C2=214/214 …)`, exit 0, so `plan.md:11-12`'s "reads MATCH there" is true of the
repair commit but not of the freeze commit. **After L1's landed commit `a882a334` the term is still red**:
measured `PROXY  error A_DRIFT A: declared=972 computed=975 delta=+3` → `PROXY: DRIFT (A_DRIFT …)`, exit 1.
Every other term is clean at that revision (`C=45` declared/computed, `C2=216/216`, no `GATE_PIN_DRIFT`,
no `AXES_DRIFT`). **`A` is a working-tree count** (`walkFiles(self)` over `RE_RUNNABLE`,
`scripts/proxy-check.mjs:601,978`), so it moves with every `.mjs` a seat writes under
`.ufo/waves/round-85/` — 71 runnable files live there now — and no static re-pin can hold it. L1 must
either land the pre-registered exclusion (`SCORECARD.md` `## Round 85 — pre-registration` item (1),
`git ls-tree … | grep -v '^\.ufo/'`) or disclose the drift with a dated receipt; the current stanza value
(972) is already three behind the computed value (975).

**F-3 (the plan's real-task sentence about the r84 close receipts is ambiguous as written).**
`plan.md:78-79` lists "r84 `close/history-red.txt` and `close/history-repair.txt` → DRIFT/CLEAN" alongside
the three r83 files. Measured: those two r84 files are the **tool's own output receipts**
(`rev=`, `command:`, `COUNTER_RECEIPT: …`, `exit=`), not arm-form transcripts — feeding them to the tool
yields `COUNTER_RECEIPT: FAIL-CLOSED SUMMARY_COUNT`, exit 2, under **both** v1 and v2. The sentence is
only true read as "the r84 close receipts record DRIFT and CLEAN respectively". The three r83 files behave
exactly as the plan states (measured with v2: `DRIFT ARMS_TOTAL` exit 1 / `CLEAN` exit 0 / `CLEAN` exit 0),
and L1's own close receipt `.ufo/waves/round-85/close/history-v2.txt` (rev `a882a334`) records exactly
that shape — the r83 inputs with `--src .ufo/waves/round-83/probe/probe83-c1.mjs`, exit 1,
`verdict="COUNTER_RECEIPT: DRIFT ARMS_TOTAL"`, `receipt="RECEIPT: bytes=5573 rows=28 held=27/27
findings=ARMS_TOTAL sha256=07690bff…"`. The frozen plan and probe are not to be edited — the close
receipts should keep the wording that is actually true.

**F-3 (the plan's real-task sentence about the r84 close receipts is ambiguous as written).**
`plan.md:78-79` lists "r84 `close/history-red.txt` and `close/history-repair.txt` → DRIFT/CLEAN" alongside
the three r83 files. Measured: those two r84 files are the **tool's own output receipts**
(`rev=`, `command:`, `COUNTER_RECEIPT: …`, `exit=`), not arm-form transcripts — feeding them to the tool
yields `COUNTER_RECEIPT: FAIL-CLOSED SUMMARY_COUNT`, exit 2, under **both** v1 and v2. The sentence is
only true read as "the r84 close receipts record DRIFT and CLEAN respectively". The three r83 files behave
exactly as the plan states (measured with v2: `DRIFT ARMS_TOTAL` exit 1 / `CLEAN` exit 0 / `CLEAN` exit 0).
The frozen plan and probe are not to be edited — L1 should record the r84-receipt reading in the close
receipts with the wording that is actually true.

**F-4 (frozen r85 counter is not in the counter-pins registry — still open at `a882a334`).**
`.ufo/pins/counter-pins.json` pins `.ufo/waves/round-84/probe/probe84-c1.mjs` (added in `ab8f6013`) but
has **no** entry for `.ufo/waves/round-85/probe/probe85-c1.mjs` (measured at `a882a334`: grep count 0), and
no entry for `scripts/counter-receipt.mjs`. The `counter-pins` gate therefore cannot detect a later edit
to the round-85 frozen counter. The r84 precedent suggests adding the round's probe pin (sha256 of the
freeze-time probe: `6e7b1eb77988f58e7469661e5e412fb9048dda2a275dd9eec4e9acbf7a53ec94`).

**F-5 (r84 closure artifact carries the citation errors the lane may not fix).** Per-file attribution
from `cite-check --json` (the file's own `findings` list):
`corpus/lessons/round-84-verifier-spotcheck.md` contributes **29 errors in lane-only scope**
(26 `UNRESOLVED` source citations such as `jj-lane.sh`, `plan.md`, `w1-dispatch.json`, `w1-results.json`;
3 `REV_UNKNOWN` pins) and **22 `UNRESOLVED` errors** in the fleet-parent scope of the current working tree
(measured) — the counts differ by scope, so cite the scope with the number. The lane-scoped total is
unchanged base→freeze (2249 → 2249 at `--self <clone> --fleet <fleet-root>`), so the entire remaining
lane-owned delta sits in files the lane does not own; the working tree's own round-85 additions add
**+8 errors and +2 files** (2249→2257, 219→221). Attribution for R-cite should say so explicitly rather
than "fix the round-84 files". The new round-85 knowledge note already records the control scores
(`corpus/knowledge/counter-receipt-discrimination.md:62`: "base v1 `1/20`, constant `0/20`, …"), which
match the frozen `controls/*.txt` receipts.

**F-6 (formatting, cosmetic but visible).** `corpus/QUALITY.md:1309` appends Q78 as a **top-level bullet**
immediately after Q77's `### Q77` block, while Q76/Q77 are `###` headings (and older criteria Q7/Q70-Q75
are bullets). The file mixes both styles, so this is a choice, not a rule break — but a reader scanning
`### Q` headings will not see Q78.

---

## 6. Commands run (all in the seat scratch; shared tree never mutated)

```
git clone --shared --no-checkout /home/vgpnk/Projects/shokunin/kumitate-shokunin \
        /fast/scratch/hyaku/kumitate-r85/K85Scout/clone
git -C .../clone rev-parse --show-toplevel   # == the fixture dir (asserted before every checkout)
git -C .../clone checkout 9db0c6b5 / 6663b3be / a5d3e754 / 03432bde
node scripts/proxy-check.mjs --strict                       # per revision: MATCH@6663b3be, DRIFT@9db0c6b5 (A +5), DRIFT@a5d3e754 (C2_TOTAL +1, AXES coverage 10→9)
node scripts/readme-map.mjs                                 # DRIFT@6663b3be & 9db0c6b5 (unpinned r84 spot-check), CLEAN on the overlay
node scripts/cite-check.mjs --self <clone|lane> --fleet <fleet-root|empty> [--json]
node scripts/counter-receipt.mjs --receipt <r83|r84 receipt>   # v1 and v2
node scripts/counter-receipt.mjs --selftest --work <scratch>   # v2: PASS held=60/60, exit 0
node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <lane|candidate> --work <scratch>
sha256sum scripts/counter-receipt.mjs .ufo/waves/round-84/build/K84ExecGate/counter-receipt.mjs
```

Durable receipts copied into `.ufo/waves/round-85/build/K85Scout/` before the scratch root was deleted:
`proxy-by-revision.txt`, `readme-map-by-revision.txt`, `probe85-by-target.txt`, `cite-check-by-revision.txt`,
`selftest-v2.txt`, `historical-receipts-v1-vs-v2.txt`, `consumer-inventory.txt`. No tool was installed (none
needed). No git/jj mutation, no commit, no push; the only lane files this seat wrote are
`.ufo/waves/round-85/build/K85Scout/*` and `.ufo/waves/round-85/w1/K85Scout.md`.
