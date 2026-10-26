VERDICT: H3 is reproducible (pairA 3/3 byte-identical verdicts) but under-powered as an admission rule — its "no HARM" half is bought by a base already red on both named gates, pairA's two harms are ONE missing README row counted twice, and a gate KNOWN red at the tip of the round-61 honest stop reads `HARM_MATRIX: CLEAN` exit 0.

# Seat K65CriticC1Pairs — attack on H3's real-data pairs (C1)

## Evidence

All commands run from the lane root; scratch `/tmp/kumitate-r65/K65CriticC1Pairs/`, tool runs are read-only (`--lane .`).

**E1 — pairA three times (frozen counter's `--timeout 120`):**
```
$ node scripts/harm-matrix.mjs --lane . --base a004902d --tip 47fe2383 --timeout 120   # ×3
HARM_MATRIX: HARM gates=19 held=15 repaired=0 carried=2 moved=0 new=0 gone=0 harm=2 harm_absent=0 new_red=0 base=a004902d77d1 tip=47fe23831519   EXIT=1  (run1)
... identical verdict line in run2 and run3 (EXIT=1, EXIT=1)
HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: CLEAN files=156 rows=156 covered=156" tip_text="README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md [exit=1]"
HARM_ROW gate=proxy-check base=CLEAN tip=NOT_CLEAN id=HARM base_text="PROXY: MATCH (A=351 C=33 operability=9; C1=19/19 C2=156/156 coverage=10; ..." tip_text="PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669) [exit=1]"
```
Row diff run1↔run2↔run3: only `plan-before-ready-selftest`'s `fixtures=/tmp/pbr-selftest.<rand>` (CLEAN/HELD; text ignored). Host gates byte-identical 3/3 (`omp-census entries=42`, `kimi-census` same 4 MEMBER_MISSING).

**E2 — my runs vs the frozen receipts:** pairA/pairB rows differ from `base/harm-pairA-freeze.txt` / `base/harm-pairB-freeze.txt` in exactly two rows each: `omp-census entries=38` (freeze) → `entries=42` (now), and the temp path. Verdict lines identical. pairB mine: `HARM_MATRIX: CLEAN gates=19 held=14 repaired=2 carried=2 moved=0 new=1 gone=0 harm=0 harm_absent=0 new_red=0 base=6825a51425e9 tip=a004902d77d1` EXIT=0.

**E3 — Q5, my added pair (round-61 honest stop): `c2721f8` → `019a844c`:**
```
$ node scripts/harm-matrix.mjs --lane . --base c2721f812cebd97ab67a1dd8cd8492a193f82d42 --tip 019a844c9db6d63206f3a39949bf790b05747a40 --timeout 120
HARM_ROW gate=proxy-check base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED_MOVED base_text="PROXY: DRIFT (A_DRIFT ... declared=105 computed=107 delta=+2; C2_TOTAL_DRIFT ... delta=+1; K_MEMBERS_DRIFT ... delta=-3; K_SEC [exit=1]" tip_text="PROXY: DRIFT (A_DRIFT ... delta=+10; C2_DRIFT ... delta=+3; C2_TOTAL_DRIFT ... delta=+3; K_MEMBERS_DRIFT  [exit=1]"
HARM_MATRIX: CLEAN gates=17 held=13 repaired=1 carried=2 moved=1 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=c2721f812ceb tip=019a844c9db6   EXIT=0
```
The tip is KNOWN red and *more* red than base: SCORECARD.md:2902-2903 ("until then / `proxy-check` reads DRIFT and that is the honest state") and `.ufo/waves/round-61/close/a2-tip-proxy.txt` (`A_DRIFT ... delta=+10`, `C2_DRIFT ... +3`, `C2_TOTAL_DRIFT ... +3`, `PIN_UNPINNED`, `exit=1`). The matrix does not find it.

**E4 — same tip, two bases (Q4):**
```
$ ... --base 6825a514 --tip 47fe2383 --only readme-map,proxy-check
HARM_ROW gate=readme-map ... id=CARRIED_MOVED ...; HARM_ROW gate=proxy-check ... id=CARRIED_MOVED ...
HARM_MATRIX: CLEAN gates=2 held=0 repaired=0 carried=0 moved=2 ... EXIT=0
```
47fe2383 is HARM from a004902d (E1) and CLEAN from 6825a514 (E4): the verdict is a property of the base's redness, and `moved` is not counted (`bad = harm + harm_absent + new_red`, `scripts/harm-matrix.mjs` render()).

**E5 — masked verdict (Q3/Q2 mechanism):**
```
$ ... --base 6825a514 --tip a004902d --only round-gate-selftest --timeout 1
HARM_ROW gate=round-gate-selftest base=TIMEOUT tip=TIMEOUT id=CARRIED base_text="timeout>1s" tip_text="timeout>1s"
HARM_MATRIX: CLEAN gates=1 held=0 repaired=0 carried=1 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 ... EXIT=0
$ fixture: gate emits no verdict line, both sides
HARM_ROW gate=crash base=FAIL_CLOSED tip=FAIL_CLOSED id=CARRIED base_text="no-verdict exit=1" ...
HARM_MATRIX: CLEAN gates=1 ... carried=1 ... EXIT=0
```
**E6 — host flip inside ONE invocation** (fixture, `$HOME`-reading gate, same commit both sides): `HARM_ROW gate=hostflip base=CLEAN tip=NOT_CLEAN id=HARM ... HARM_MATRIX: HARM gates=1 ... EXIT=1` (`build/K65CriticC1Pairs/flipdemo.sh`).
**E7 — timeout asymmetry reads HARM** (fixture: base fast, tip sleeps 3 s, `--timeout 1`): `HARM_ROW gate=slow base=CLEAN tip=TIMEOUT id=HARM ... EXIT=1`.
**E8 — load headroom** (`/proc/loadavg` = `112.50 107.71 105.28`): `report-receipt-diff.mjs --selftest` 3 959 ms, `round-gate.mjs --selftest` 19 364 ms, `plan-before-ready.sh --selftest` 3 667 ms; the probe forces `--timeout 120` on all gates (registry declares 180 for those three).

**E9 — one-defect-twice (Q1):** `git diff --stat a004902d 47fe2383` → `corpus/lessons/round-64-verifier-spotcheck.md | 69 +++`, 1 file. `scripts/readme-map.mjs:85-86` counts `corpus/knowledge`+`corpus/lessons` `*.md`; `:202` pushes `uncovered:<f>`, `:236` pushes `unpinned:<f>` — the single file yields `bad=2`. `scripts/proxy-check.mjs:101` C2_total is the same `*.md` universe, `:950` C2 = README rows, `:103` `coverage = floor(10 × C1/C1_total × C2/C2_total)` ⇒ 156/157 ⇒ 9 ⇒ the `AXES_DRIFT` term inside the same proxy row.

**E10 — ratchet/pin collision:** `.ufo/pins/counter-pins.json` pins `controls/harm/MANIFEST.sha256` by sha256 `4361a5a147cd9ebf903b6471fce54f85975c995f0c6c72f0779276ac10c37b1f`; `grep -rn MANIFEST.sha256 scripts/` → no hits.

## Findings

**K65CriticC1Pairs-1 (high) — a registry whose gates never ran reads CLEAN.** `measure()` maps rc 124/137 to `TIMEOUT` and a missing verdict to `FAIL_CLOSED`, both `NOT_CLEAN`; `transition()` then returns `CARRIED` when the two not-clean texts are equal, and `bad` excludes it. Repro E5 (both lines above). Attacks H4's "the counter can fail" and H5's exit-code honesty: the tool can print `CLEAN` exit 0 with `held=0`. Correction: `transition()` must return `UNMEASURED` when **both** sides are `TIMEOUT`/`FAIL_CLOSED` and `render()` must fail closed (exit 2) — patch P1 in `build/K65CriticC1Pairs/harm-matrix-patches.md`. Verified against a patched copy (`/tmp/kumitate-r65/K65CriticC1Pairs/harm-matrix-p1.mjs`, registry copied beside it because the tool resolves `harm-matrix-gates.json` from its own dir): the repro now reads `HARM_ROW ... id=UNMEASURED` + `HARM_MATRIX: FAIL_CLOSED reason=UNMEASURED_GATE detail="gates=round-gate-selftest"` EXIT=2; all 16 frozen controls pass with the patched tool (and with the original, 16/16 — an independent re-implementation of the probe's H2 harness, `verify-p1.mjs`); pairA reads `HARM ... harm=2` EXIT=1 and pairB `CLEAN ... repaired=2 new=1` EXIT=0, rows byte-identical to the unpatched run except `plan-before-ready`'s random temp path. The both-sides-only guard matters: reclassifying clean→timeout would break frozen `case-11-harm-timeout` and `case-12-repaired-from-timeout`.

**K65CriticC1Pairs-2 (high) — a gate KNOWN red at the tip of an honest-stop round reads CLEAN.** Repro E3. `CARRIED_MOVED` is unranked, so red→worse-red is invisible; the round-61 tip's proxy went from 3 drift terms to 4 (`+2`→`+10` on A) and the pair still exits 0. The plan declares "two not-clean readings that differ are CARRIED_MOVED and are not ranked", so the tool is honest to its rule; what fails is the claim's use of `exit 0` as the admission rule "no axis harmed". Counting moved as bad would break frozen `case-10-carried-moved-line` (`expect exit 0`, `g1 CARRIED_MOVED`), so this is a next-round claim fix, not a patch (P3 note in the patch file).

**K65CriticC1Pairs-3 (medium) — pairA's "exactly two harms" is one defect read twice.** Repro E9. The pair's whole diff is one added lesson file; readme-map's `bad=2` is `uncovered:`+`unpinned:` for that file, and proxy's `C2_TOTAL_DRIFT` and `AXES_DRIFT` are the same +1 counted as a ratio. Not circular in the tautology sense (both gates read real committed bytes; the direct runs agree), but the exactness assertion carries one bit of information, not two, and the plan's narrative "moved two gates" must not be read as two independent transitions. Minor, same sentence: `plan.md:23` calls `47fe2383` "the round-64 closure's own commit" while `plan.md:4` calls the same commit "the round-64 non-author spot-check commit" (the close was `fd437f8`); the pair should be labelled by the spot-check commit.

**K65CriticC1Pairs-4 (medium) — H3(b) is cheap; it proves REPAIR, not absence of harm.** Repro E4 + frozen pairB receipt: base 6825a514 is already `NOT_CLEAN` on both gates the pair names, `report-receipt-diff` is `ABSENT` at base (`NEW_OK`), `harm-matrix` is `ABSENT_BOTH` and excluded from `gates=19`; only 18 of the 20 registry entries have a base reading at all. The identical tip reads CLEAN from this base and HARM from a004902d. **Weakest sentence of H3:** "the pair `6825a514` → `a004902d` reads exit 0, no HARM / HARM_ABSENT / NEW_RED row, `readme-map` and `proxy-check` both REPAIRED (direct commands non-zero then 0)." It is true as written and reproducible, but it is the sentence offered as the no-harm evidence, and it is satisfied by a red base plus one repaired gate, with `moved` allowed and host gates free to flip it (E6/E7).

**K65CriticC1Pairs-5 (medium) — host-state coupling: the receipt text is not reproducible, and a host change is a HARM.** E2: `omp-census entries=38` at freeze, `42` in all four of my runs. Within a window the reading is stable 3/3 (E1), so no observed intra-invocation drift, but E6 shows the mechanism: a `$HOME`-reading gate flips between the base and tip measurement of one invocation and the row is `HARM`. H3's exactness (`harmA == ['proxy-check','readme-map']`, `rb.status === 0`) is therefore a claim about the host at measurement time. Correction: assert presence, not row id, for `kimi-census`/`omp-census`/`surface-known`.

**K65CriticC1Pairs-6 (medium) — rows compare a 200-character prefix.** `measure()` stores `hit.line.slice(0, 200)`; E3's tip proxy row is cut mid-token and its fourth finding (`PIN_UNPINNED`, present in the close receipt) never reaches the row. A red gate whose new drift terms appear after char 200 reads `CARRIED`. Correction: compare the full line, print a sha256 (patch P2).

**K65CriticC1Pairs-7 (low) — load couples the verdict both ways.** E8: ~6× headroom on the slowest heavy gate at load 112, so no observed timeout; but a tip-only timeout is `HARM` (E7) and both-side timeouts are masked (E5). The probe also lowers three gates' declared 180 s to 120 s, which the claim does not state.

**K65CriticC1Pairs-8 (medium, ratchet operability) — the ratchet's "add a control" collides with the pinned manifest.** E10: `MANIFEST.sha256` is pinned by sha and read by nothing. Adding `case-17` without touching it leaves the manifest silently covering 16 of 17; regenerating it reads `PIN_DRIFT` at the tip, and H5 (base 47fe2383 is `CLEAN`) turns that into a HARM row. Needs an L1 ruling before any wave-2 ratchet control lands.

## Pair I would add, and recommended H3 for next round

Add `c2721f8` → `019a844c` (round-61 base → honest-stop tip). It is the cheapest real-data falsifier of the tool's purpose: a gate red by the lane's own receipt at the later revision must not read CLEAN, and the pair also exercises `CARRIED_MOVED`, `REPAIRED` and two `ABSENT_BOTH` entries in one run (17 counted gates).

H3 v2 (next round): (a) keep the round-64 pair but state in the sentence that both HARM rows are one root cause; (b) replace the no-harm pair with one whose base has zero `NOT_CLEAN` non-host rows and zero `ABSENT` entries, and require `carried=0 moved=0 new=0`; (c) add the round-61 pair with an explicit expected verdict — either `HARM`/`WORSENED` naming `proxy-check`, or the claim states in the same sentence that red→worse-red is out of scope; (d) assert host-state gates by presence only; (e) run each pair twice and require identical rows; (f) do not lower registry timeouts (or record the measured headroom).

## Artifacts

- `.ufo/waves/round-65/w1/K65CriticC1Pairs.md` (this report)
- `.ufo/waves/round-65/build/K65CriticC1Pairs/harm-matrix-patches.md` (patch drafts P1/P2, new control specs, MANIFEST warning)
- `/tmp/kumitate-r65/K65CriticC1Pairs/{pairA-run1,pairA-run2,pairA-run3,pairB-run1,hostA-1,hostA-2,hostA-3,pairA-p1,pairB-p1}.txt`, `flipdemo.sh`, `verify-p1.mjs` (independent H2 harness), `harm-matrix-p1.mjs` + `harm-matrix-gates.json` (patched copy)

## Limits

Did not run the frozen counter itself (no wave-1 tip M exists; `base/harm65-base.txt` is the freeze-time reading); did not run `scripts/harm-matrix.mjs --selftest` (H1 is another seat's target) or `scripts/harm-cases.json`; did not apply/verify P2 (needs the `createHash` import) — P1 only; did not mutate `~/.kimi-code`/`~/.omp` to force a real mid-run host flip (fixture only, E6); no wave-2 mutation testing; did not test `--only`/`--timeout` combinations beyond those quoted. Tooling: no installs.
