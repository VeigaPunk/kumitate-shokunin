# K81ReviewC2 — C2 review: the self-describing shape receipt (`kumitate-omp-shape-v2`)

Reviewer seat, kumitate round 81, wave 1. Scope: reachability of the 15 frozen arms,
cutover honesty (`--shape` refuses v1 / `--compare` accepts it), the no-harm claim
(no age-shaped value reaches `coverage_omp`), and the `pin.omp-shape` attack.

Measured tree: lane at `d140f288` (round-81 scaffolding commit) plus the L1's
uncommitted integration edits. Both byte-states were measured where it matters
(see §6). Lane repo: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (`$L` below).
Scratch (deleted at yield): `/fast/scratch/hyaku/kumitate-r81/K81ReviewC2/`.

## 1. Verdict

**C2 holds as claimed.** The frozen counter reads `C81_C2: HELD held=15/15` exit 0
at the live tree and against HEAD bytes; the base archive reads `UNMET held=4/15`
exit 1 under the committed control methodology (reproduced verbatim below); the
constant-printer stub reads `UNMET held=6/15` exit 1. No live committed consumer of
`--shape`/`--compare`/`--omp-shape` regressed. The no-harm claim holds at the code
and JSON surface, and is pinned by arm 11. `pin.omp-shape` is enforced by exactly
two readers, both demonstrated to reject a re-captured receipt.

Primary evidence (all run by this seat, 2026-11-04):

```
$ node $L/.ufo/waves/round-81/probe/probe81-c2.mjs            # live tree
C81_C2: HELD held=15/15 tool=$L/scripts/omp-census.mjs        exit=0
$ node $L/.ufo/waves/round-81/probe/probe81-c2.mjs --tool $S/attack --lane $L   # HEAD bytes
C81_C2: HELD held=15/15                                       exit=0
$ node $L/.ufo/waves/round-81/probe/probe81-c2.mjs --tool $S/base --lane $L     # base archive
C81_C2: UNMET held=4/15                                       exit=1   (= committed controls/c2-base.txt, Amendment 2)
```

## 2. Per-arm table

Frozen arms from `.ufo/waves/round-81/probe/probe81-c2.mjs` (lines 90–217); plan §C2.
"M" = arm result at the live tree (run R1, 15/15). "Base" = arm result with the base
archive tool (`git archive 77c7a8b3fe7f3cebe681065da283de0ae38ddb5b`, run R2b with
`--tool $S/base --lane $L`, the methodology of the committed Amendment-2 control).
"Stub" = committed `controls/c2-stub.txt` (constant printer, Amendment-2 reading).

| # | arm | expected (frozen clause) | reachable | fixture the arm builds | M | base | stub |
|---|-----|--------------------------|-----------|------------------------|---|------|------|
| 1 | snapshot-v2 | `--snapshot` writes `{contract:v2, captured_at, entries}`, exact key set | yes | materialised root from the committed 65 entries; reads back the written doc | PASS | FAIL (writes v1, `captured=undefined`) | FAIL (ENOENT) |
| 2 | shape-age-disclosed | `--shape` prints `captured=<today> age_days=0` + CLEAN | yes | `fresh.json` v2 receipt, `captured_at=now` | PASS | FAIL (exit 2 `SHAPE_INVALID`) | PASS (constant printer prints the fresh line) |
| 3 | shape-v1-refused | v1 receipt → exit 2 `SHAPE_VERSION want=…v2 got=…v1` | yes | `v1.json` (`{contract:v1, entries}`) | PASS | FAIL (base accepts v1, exit 0) | FAIL |
| 4 | compare-v1-accepted | `--compare` still reads a legacy receipt → `IN_SYNC` exit 0 | yes | `v1-compare.json` + matching materialised root | PASS | PASS | PASS |
| 5 | shape-age-backdated | 45-day-old receipt → `age_days=45`, exit 0 (no gate by default) | yes | `backdated.json` v2, `captured_at=now−45d` | PASS | FAIL (exit 2) | FAIL |
| 6 | max-age-stale | `--shape --max-age 30` on it → `SHAPE_STALE age_days=45 max_age=30`, exit 1 | yes | `backdated-30.json` + `--max-age 30` | PASS | FAIL (exit 64 unknown flag) | FAIL |
| 7 | max-age-pass | window 60 → exit 0 CLEAN | yes | `backdated-60.json` + `--max-age 60` | PASS | FAIL (exit 64) | PASS (printer ignores the gate) |
| 8 | clock-future-refused | future capture instant → `SHAPE_CLOCK`, exit 2 | yes | `future.json` (`now+2d`) | PASS | FAIL (`SHAPE_INVALID`) | FAIL |
| 9 | captured-at-required | v2 doc without `captured_at` → `SHAPE_INVALID`, exit 2 | yes | `uncaptured.json` | PASS | PASS (base rejects the v2 doc as invalid) | FAIL |
| 10 | compare-v2 | `--compare` on v2 → `IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0`, content-free line | yes | `v2-compare.json` + root | PASS | FAIL (exit 2) | PASS |
| 11 | stale-does-not-score — discriminating | proxy on 45-day-old receipt → `verdict=MATCH coverage_omp=10 O_members=65` | yes | `score.json` (v2, 45d) via `proxy-check --omp-shape` | PASS | FAIL (base proxy rejects v2 → exit 2) | FAIL |
| 12 | proxy-terms-unchanged | no `O_age`/`O_captured`/`O_stale` term injected | yes | `proxy-check --json` key surface | PASS | FAIL (exit 2 on the v2 receipt path) | FAIL |
| 13 | receipt-pinned | `pin.omp-shape` = sha256 of the committed v2 receipt | yes | the lane's own `.ufo/pins/omp-shape.json` + `SCORECARD.md` | PASS | PASS (reads `--lane`, not `--tool`: live receipt/pin match) | PASS (same reason) |
| 14 | selftest | `VERDICT: PASS (\d+ cases)` | yes | hermetic fixtures under `--work` | PASS (98 cases) | PASS (89 cases) | PASS (printer claims 97) |
| 15 | usage-max-age | `--max-age` outside `--shape` → exit 64, "only meaningful with --shape" | yes | `--root $work --max-age 30` | PASS | FAIL (exit 64 "unknown argument") | FAIL |

Tallies: M 15/15 exit 0 · base 4/15 exit 1 (arms 04, 09, 13, 14) · stub 6/15 exit 1
(arms 02, 04, 07, 10, 13, 14). Both controls are committed at
`.ufo/waves/round-81/controls/c2-base.txt` and `c2-stub.txt` (Amendment 2) and my
runs reproduce them line for line (base: `held=4/15`, same four passing arms).

Cross-check with `--lane $S/base` (whole tree at base, not the control methodology):
held=3/15 — arm 13 flips to FAIL because it then reads the base tree's own v1
receipt/pin pair (`pin=84e41b9f5167 computed=84e41b9f5167 contract=v1`): the pin
mechanism itself verified correctly at base; the arm fails only on the v2-contract
requirement. Both readings are "below 15", as the claim sentence demands.

Reachability judgment: every arm is reachable by construction — the probe builds
each fixture itself (no dependence on host state beyond the committed 65-entry
receipt read via `entriesFor()`), and each arm's discriminating condition was
observed both passing at M and failing at at least one control. Arms 1, 3, 5, 6, 8,
9, 11, 12, 15 fail on the constant printer; that set carries the claim (the receipt
writer, the v2 contract, the age disclosure, the staleness gate, the clock refusal,
and the no-harm pin).

## 3. Cutover judgment: `--shape` refuses v1, `--compare` accepts it

Tool semantics at `$L/scripts/omp-census.mjs`: `validateShape` (lines 170–197)
accepts exactly two documents — legacy `{contract:v1, entries}` and current
`{contract:v2, captured_at, entries}`; `runShape` (lines 469–497) then hard-refuses
the legacy contract with `SHAPE_VERSION want=kumitate-omp-shape-v2 got=kumitate-omp-shape-v1`
exit 2, while `compareShape` (lines 247–288) goes through `shapeFromFile` only and
never inspects the contract beyond validation — so v1 receipts still compare
(arm 4). This asymmetry is the intended cutover: the grading surface re-captures,
the report-only surface keeps reading legacy receipts.

Committed consumers checked (grep over `$L` for `--shape`/`--compare`/`omp-shape`;
docs and round records excluded from "consumer"):

1. `SKILL.md:745` — checklist `OMP shape receipt offline re-derivation`:
   `--shape .ufo/pins/omp-shape.json | grep -q "OMP_CENSUS: CLEAN (source=snapshot" && proxy-check --omp-shape … | grep -q '"coverage_omp": 10' && echo offline-receipt`.
   Runs at M → `offline-receipt`, exit 0 (run R3a).
2. `SKILL.md:756` — checklist `OMP shape receipt age`:
   `--shape .ufo/pins/omp-shape.json --max-age 30 >/dev/null && echo age-disclosed`.
   Runs at M → `age-disclosed`, exit 0 (run R3b).
3. `SKILL.md:754` — checklist `OMP shape receipt live comparison`:
   `--compare .ufo/pins/omp-shape.json` → `OMP_SHAPE_COMPARE: IN_SYNC entries=65 …`
   exit 0 (run R3c; the v2 receipt is accepted by `--compare`).
4. `scripts/proxy-check.mjs` (default O source and `--omp-shape`) — imports
   `shapeFromFile` (line 331), which accepts both contracts; a well-formed **v1**
   receipt still scores through the proxy at M: `verdict MATCH source snapshot
   coverage_omp=10 O_members=65 errors=0`, exit 0 (run R10). Its hermetic suite
   passes (163/163, observed inside probe77's c1.9 run at M).
5. `scripts/omp-census.mjs --selftest` — 98 cases at the live tree, PASS (run R5).
6. Frozen round instruments that exercise the tool:
   - `probe81-c2.mjs` — intentional (arm 3 requires the v1 refusal).
   - `probe80-c2.mjs --set c2` at M → `C80_C2: HELD held=12/12` (run R9): its
     `--shape`/`--compare`/pin arms run against the committed v2 receipt and pass.
   - `probe77.mjs --set c1` at M → `C77_C1: UNMET held=2/12` (run R7). Its arms
     c1.1–c1.7 and c1.11 gate on `validSnapshot` (probe77.mjs:51–56) and
     `SHAPE_CONTRACT='kumitate-omp-shape-v1'` (probe77.mjs:28), and c1.10 requires
     the receipt's exact legacy key set — all hard-v1. c1.12 also fails (expects a
     live default; the default became the receipt in round 80).
   - `probe78-c2.mjs --set c2` at M → exit 2, `probe78-c2: receipt …/omp-shape.json
     invalid` (run R8): it requires the committed receipt to be v1
     (probe78-c2.mjs:27) before running anything.

**Regression judgment:** no live consumer regressed — every checklist command in
`SKILL.md` and the proxy's own surfaces pass at M, and the one sibling instrument
that is still a checklist item (`probe80-c2`, round 80) holds 12/12. The two
frozen instruments that now fail (`probe77` c1, `probe78-c2`) are not live checklist
commands; `SKILL.md:746` already classifies the round-77 probe as "superseded
history" (it read `held=9/13` at round 80). The v1-refusal cost is real but
confined to frozen history and is the intended semantics of arm 3. Recommendation
for the lesson (not a claim defect): record that `probe77 --set c1` reads 2/12 and
`probe78-c2` exits 2 at the round-81 tree, so the next closure does not re-discover
this; and refresh the round-78 checklist prose at `SKILL.md:754`, which still says
"contract `kumitate-omp-shape-v1` receipt" while the committed receipt is v2 (the
command passes either way).

## 4. No-harm: no age-shaped value can reach `coverage_omp`

Data flow, with the age-killing chokepoint:

1. Receipt bytes enter only through `readShapeDoc` (`omp-census.mjs:202–212`), which
   validates and returns the doc.
2. Every scoring/report consumer consumes `shapeFromFile` (`omp-census.mjs:214–216`):
   `return readShapeDoc(file).entries;` — the projection drops `captured_at` at the
   boundary. `receiptAgeDays` (`omp-census.mjs:219–222`) is called only from
   `runShape`, the census CLI surface.
3. `proxy-check.mjs` imports only `shapeFromFile` among the shape readers
   (line 331: `import { BASE_MEMBERS, CHAIN_FAMILIES, census, censusEntries,
   shapeFromFile } from './omp-census.mjs';`). Grep over the whole file:
   `receiptAgeDays|readShapeDoc|captured_at` → **no matches** (this seat, 2026-11-04).
4. The O terms (`proxy-check.mjs:996–1002`) derive from census counts and the
   scorecard's O-registry row: `coverage_omp = layerCoverage(C1o, C1o_total,
   O_members − O_findings, O_members)` — at M that is `floor(10 × 1/1 × 65/65) = 10`
   (O1 row `SCORECARD.md:149`, `yes`; axes row `SCORECARD.md:370`). No age input.
5. The rendered/JSON surface discloses at most `source=snapshot`
   (`renderVerdict` tail, `proxy-check.mjs:1262–1264`; JSON `source`/`sourceRead`,
   lines 1284/1423). Dumped live JSON terms keys (run R4): `A C C1 C1_total C2
   C2_total operability coverage S_members S_sections R_members R_sections
   coverage_script coverage_runtime C1k C1k_total K_members K_sections K_findings
   coverage_kimi C1o C1o_total O_members O_findings O_bound coverage_omp pins
   pinsMatched pinsTotal declared stanzaLine` — no age-shaped key.

Empirical pins: arm 11 (proxy on a 45-day-old receipt → `MATCH coverage_omp=10`),
arm 12 (no `O_age`/`O_captured`/`O_stale` injected), and run R6b (a re-captured
fresh receipt still scores `coverage_omp=10`). A live proxy run at M:
`verdict MATCH source snapshot coverage_omp 10 O_members 65 O_findings 0 O_bound
35 errors 0` (run R4).

**The one place a future edit could leak it:** `shapeFromFile`'s `.entries`
projection (`omp-census.mjs:214–216`) is the single chokepoint — it is the only
boundary through which the receipt document reaches any consumer. Two concrete leak
shapes: (a) change `shapeFromFile` to return the whole doc (every consumer inherits
the age), or (b) in `proxy-check.mjs` import `readShapeDoc`/`receiptAgeDays` and
factor an age term into the O-term block (`proxy-check.mjs:996–1002`). Shape (b)
also needs a `TERM_KEYS`/stanza change to become a *declared* term — the frozen
24-key stanza and its `STANZA_KEY_UNKNOWN` refusal make an undeclared age term a
silent no-op at comparison time, so a leak must edit both files. The existing
mutation coverage from round 77 (`K77MutC1` mutant `c1-e-live-root`, killed by
proxy-check selftest 163/163 at M) guards the receipt-vs-live routing, not the age;
the age-specific guard is arm 11/12 of this round's frozen counter.

## 5. Attacking the pin: `pin.omp-shape`

Who reads `pin.omp-shape` (grep over `$L`, excluding round history):

1. `scripts/proxy-check.mjs` — `GATE_PINS` maps it to `.ufo/pins/omp-shape.json`
   (line 553, inside the `kumitate-gate-pins-v1` block parsed block-locally by
   `parseGatePins`); `compareGatePins` (lines 1197–1215) hashes the file and emits
   error-level `GATE_PIN_DRIFT`, which `summarize` turns into exit 1. The check is
   unconditional in `runCheck` for every scored run.
2. `.ufo/waves/round-81/probe/probe81-c2.mjs` arm 13 — sha256 of the committed
   receipt vs the `SCORECARD.md` pin, plus a v2-contract assertion.

The score surface (`coverage_omp`, `--shape`, `--compare`) hashes nothing, by
design — the pin is the anti-re-capture gate. Attack, executed in a scratch copy of
the lane (`$S/attack`, `git archive HEAD | tar -x`):

```
$ sha256sum $S/attack/.ufo/pins/omp-shape.json
8b6aaa79e24fc56f39afdff6488aadeffe909f4e58f6de03f32901333263dae7   # == SCORECARD pin
$ node $S/attack/scripts/omp-census.mjs --snapshot $S/attack/.ufo/pins/omp-shape.json --root $S/root
OMP_SNAPSHOT: WROTE entries=65 sha256=5f2bf263dfb2… path=…            # same 65 entries, new captured_at
$ sha256sum $S/attack/.ufo/pins/omp-shape.json
5f2bf263dfb28d8fb9e2b834ae05b0ff478fc1288133f4028fe60bc7d5448937   # re-captured, pin now stale
$ node $S/attack/scripts/proxy-check.mjs --self $S/attack --json
verdict DRIFT errors 1
finding GATE_PIN_DRIFT pin.omp-shape declared=8b6aaa79e24fc56f39af computed=5f2bf263dfb28d8fb9e2
terms coverage_omp=10 O_members=65 O_findings=0                        # score itself unchanged
(proxy exit=1)
$ node $L/.ufo/waves/round-81/probe/probe81-c2.mjs --tool $S/attack --lane $S/attack
C81_C2 arm stale-does-not-score FAIL exit=1 verdict=DRIFT coverage_omp=10 O_members=65
C81_C2 arm proxy-terms-unchanged FAIL exit=1 injected=none O_members=65
C81_C2 arm receipt-pinned FAIL pin=8b6aaa79e24f computed=5f2bf263dfb2 contract=kumitate-omp-shape-v2
C81_C2: UNMET held=12/15                                             exit=1
```

What accepted the re-captured receipt without a new pin: `--shape` (reads it
`CLEAN … age_days=0`), `--compare` (`IN_SYNC entries=65 receipt=65 added=0 removed=0
changed=0` against the materialised root), and the O terms (`coverage_omp=10`) — all
by design, which is exactly why the byte-pin exists. What rejected it: both pin
readers, demonstrably. There is no third reader and no bypass: re-capture without a
new pin is a proxy DRIFT (exit 1, every scored run) and a counter UNMET. Note the
pin binds bytes, not semantics — a same-instant re-capture within one second would
reproduce identical bytes and pass; that is receipt equality, not a hole.

## 6. Residual risks, discrepancies, verification gaps

1. **Mid-flight tree state (informational, not a defect).** The working tree
   carries uncommitted L1 edits: `scripts/omp-census.mjs` (+14 lines: a
   `cli-max-age` selftest case — the comment cites a round-81 reviewer finding —
   plus a `--selftest --work` mkdir and an EPIPE guard), `scripts/ready-handoff.mjs`
   (Amendment-3 F10 symlink-escape fix), `SCORECARD.md` pins re-measured to the new
   bytes (`pin.omp-census` 405cf5d4→ba7cbc8f, `pin.ready-handoff`
   f8b4a92b→f8fc11f1; `pin.omp-shape` unchanged at 8b6aaa79), the Amendment-1 probe
   fixes, and the round-81 close/w1 records. I verified both byte-states are
   internally consistent: HEAD bytes + HEAD pins → counter 15/15 (run R10) and
   proxy `MATCH` on a fresh `git archive HEAD` extraction; working-tree bytes +
   working-tree pins → counter 15/15 (run R1) and proxy `MATCH` (run R4). The
   committed tip alone is likewise consistent. Nothing in the claim depends on the
   uncommitted edits; the close receipt's `rev=d140f288` label scored working-tree
   tool bytes.
2. **Frozen-plan text vs measured controls (disclosed, superseded).** §C2's kill
   rule says the constant printer "passes at most arm 2"; the measured stub passes
   6/15 (arms 2, 4, 7, 10, 13, 14) because those arms either do not exercise the
   tool's age behavior (4, 13, 14 read receipts/pins or the suite banner) or are
   satisfiable by a constant fresh-line printer (2, 7). Amendment 2 already
   superseded the per-arm kill list with the measured table; the discriminating
   load is carried by arms 1, 3, 5, 6, 8, 9, 11 (all fail on the stub). The plan's
   "arm 2 is discriminating" label is overstated against a constant printer; the
   no-harm discrimination lives in arm 11, which the stub fails.
3. **Selftest count.** Plan §C2 arm 14 parenthetical says "97 cases"; HEAD's suite
   is exactly 97 (verified via the archived tool), matching the plan. The
   working-tree suite is 98 (the added `cli-max-age` case). The frozen arm's regex
   `\d+` accepts both, so the frozen counter does not discriminate the count.
4. **Frozen-instrument decay (known side-effect).** `probe77.mjs --set c1` reads
   2/12 and `probe78-c2.mjs` exits 2 at the round-81 tree (§3). Neither is a live
   checklist command; recommend the round lesson record both readings.
5. **Doc drift.** `SKILL.md:754` round-78 checklist prose still names the v1
   contract; the command passes with the v2 receipt. Cosmetic.
6. **Amendment-1 probe diff reviewed.** The working-tree probe changes are
   fixture/args only — `materialise` now chmods fixture entries to the receipt
   modes (the freeze-time arm-4 `DRIFT changed=53` cause), `--lane`→`--self` in
   arms 11/12 (proxy-check's real flag), and a `mkdir` for the selftest work dir.
   Arm names and pass conditions are unchanged, matching Amendment 2's disclosure.
7. **Verification gaps.** I did not re-run the full `gate-mutants` battery or the
   fleet-side harness; the no-harm claim is proven for the committed code paths
   (census/proxy) and the frozen counter's arms 11–12, and would regress visibly in
   `proxy-check --selftest` (163 cases) or arm 12 if a future edit widened the score
   surface. The `receipt-evidence`/`counter-rerun` instruments were not part of this
   claim and were not exercised.

## Commands exercised (all 2026-11-04, host run-15)

- `node .ufo/waves/round-81/probe/probe81-c2.mjs [--tool DIR --lane DIR --work DIR]` — R1 (live, 15/15 exit 0), R2b (base, 4/15 exit 1), R6c (attacked copy, 12/15 exit 1), R10 (HEAD tool vs live lane, 15/15).
- `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json [--max-age 30]` — R3a/R3b, exit 0 each; `--compare .ufo/pins/omp-shape.json` — R3c, IN_SYNC exit 0; `--selftest` — R5, `VERDICT: PASS (98 cases)` (archived HEAD tool: 97).
- `node scripts/proxy-check.mjs --json` — R4, `MATCH … coverage:omp=10; pins=…` exit 0; on the attacked copy — R6a, `GATE_PIN_DRIFT pin.omp-shape` exit 1; with a v1 `--omp-shape` receipt — R10, MATCH exit 0; on a fresh HEAD archive — MATCH exit 0.
- `node .ufo/waves/round-77/probe/probe77.mjs --set c1 --lane $L` — R7, `C77_C1: UNMET held=2/12`.
- `node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2 --lane $L` — R8, exit 2 `receipt … invalid`.
- `node .ufo/waves/round-80/probe/probe80-c2.mjs --set c2 --tool $L --lane $L` — R9, `C80_C2: HELD held=12/12`.
- Attack fixture driver: materialise receipt entries → `omp-census.mjs --snapshot` into the copy's pinned receipt (digests quoted in §5).
- Greps: `pin\.omp-shape` (2 live readers), `receiptAgeDays|readShapeDoc|captured_at` in `scripts/proxy-check.mjs` (0 hits), `--shape|--compare|omp-shape` across `$L` (consumer enumeration in §3).
- No tools installed or updated. No lane file was written except this report; all fixtures lived in scratch and were removed at yield.
