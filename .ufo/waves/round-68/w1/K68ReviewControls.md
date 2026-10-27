VERDICT: All three do-nothing controls are honest — I reproduced CONTROL-PASS for donothing/autoledger/c2-donothing with zero accidental-HELD paths — but the wave must know the frozen C2 counter was modified in the worktree AFTER the freeze commit (M6 hunk, not by me), and the counter demands 4 round-66 ledger rows where the plan's text promises D1–D3 (3).

## Evidence

Freeze integrity baseline: lane HEAD `39f61816d4ee7a8d401df42c1818c91a9c537bce` = "round-68: freeze plan + counters L68/M68 v1, base receipts, controls, validated v2 wave spec (66 seats), readme-map inherited repair". Plan/counters/base/controls are committed and were clean of uncommitted `M` entries at my first status check except as finding -1 below.

Controls re-run (scratch `/fast/scratch/hyaku/kumitate-r68/K68ReviewControls`, `HYAKU_SCRATCH` set, then deleted; full logs in build dir):

```
bash .ufo/waves/round-68/probe/c1-controls.sh donothing    -> CONTROL-PASS donothing    (script exit 0)
bash .ufo/waves/round-68/probe/c1-controls.sh autoledger   -> CONTROL-PASS autoledger   (script exit 0)
bash .ufo/waves/round-68/probe/c2-donothing.sh             -> CONTROL-PASS c2-donothing (script exit 0)
```

Fresh receipt first lines (verbatim, modulo random seed + fixture rev they byte-match the committed 11:46–11:52 receipts):

- donothing, fixture `ff88cdd73f316d21e0d2dcc31d7454ddd964678e`: `LEDGER68_UNMET held=2/7 … | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=1 verdict=ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=0 … findings=61 first=UNLEDGERED:round-55-item-1 own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: ledger-empty-or-absent,unledgered:55#1,… | L4 MISS … 7/20 mutants wrong: good…ordinal…one-word-quote…ambiguous-quote | L5 MISS real-tool-passes-L4=false`
- autoledger, fixture `f3d34931cdb19c7921a69bb406a29b04a9d4d891`: `LEDGER68_UNMET held=2/7 … | L2 MISS exit=1 … items=61 rows=39 open=39 … findings=26 first=QUOTE_ABSENT:A63x4@line27:round-63-item-4 … | L3 MISS 31 problems: A63x4:quote-not-word-boundary-in-item,…` (L1 33/33<44, L4/L5 MISS as above; L6, L7 = the only held checks in both c1 controls)
- c2, fixture `97b7448c592542a18a4c779e6b6a1f48013341f5`: `DEPREC68_UNMET held=1/10 … | M1 MISS sources=2 verified-at=true recheck=true | M2 MISS cited=2 S233:row-absent,S234:row-absent | M3 MISS … pin-absent | M4 MISS section-absent | M5 MISS no-live | M6 MISS capture-table-absent | M7 MISS section=false | M8 MISS section=false … | M9 MISS census-exit=2,sources-check-exit=1,source-capture-exit=1,readme-map-exit=1` (M10 held; note province passed — the control's one PROVINCE line works, everything else is structurally absent)

Fixture forensics (do-nothing confirmed, `git ls-files` of each committed fixture):

- donothing: exactly 17 paths = `scripts/routed-ledger.mjs` (v1 copy) + 12 × `corpus/lessons/round-{55..66}-verifier-spotcheck.md` + SKILL/QUALITY/SCORECARD stubs + `corpus/routed-ledger.md`; the ledger contains exactly ONE `|` line — the header. No rows, no answers.
- autoledger: 39 data rows; class column = `auto` only; status column = 39 × `open`; zero non-`-` answers. "Only open rows, single class" confirmed.
- c2: exactly 2 paths (`corpus/knowledge/mcp-deprecation-registry.md`, `PROVINCE.md`); `cmp` vs `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/mcp-feature-deprecation-registry.md` → byte-identical; PROVINCE is the single naming line.

Exact L3 trace for autoledger (frozen counter's `norm/nwords/wb/items67/ledgerParse` + L3 block extracted verbatim into a scratch driver; output in `build/l3-trace-autoledger.txt`): 31 problems = 24 × `unledgered` (55#3; 56#1–4; 57#1–4; 58#1–8; 62#1–5; 63#4,63#6 — the generator's `^[-*+]\s+\*\*` regex misses plain-list and table-row items, rows=39 < items=61) + 2 × `quote-not-word-boundary-in-item` (A63x4, A63x6 — ordinal divergence) + **4 × `r66-item-N-not-answered-this-round`** + **`classes=1<5`**; `no-class-spans-4-rounds` does NOT fire (`auto` spans 12 rounds). So the assignment's guess is confirmed with precision: L3 is the sole structural guard, failing on `classes=1<5` AND the r66 answered-now clause AND coverage/quote defects.

M5 vacuity probe (same c2 fixture, live mode, no `--no-live`, zero network fetches performed): `DEPREC68_UNMET held=2/10 … rule=M68 | M1 MISS sources=2 …` — M5 is absent from the MISS list, i.e. M5 **PASSES with zero bullets** in live mode (vs `M5 MISS no-live`, held=1/10, in the control receipt).

Frozen-counter drift discovered at 12:15 (see finding -1): `git diff -- .ufo/waves/round-68/probe/deprec68-probe.mjs` shows worktree `bd21bb71` vs HEAD blob `2b548c4f` — one M6 hunk replacing the separator-row regex with a cell-wise `isSepRow` filter; file mtime `2026-10-27 12:08:52` (post-freeze, during the wave; not authored by this seat). `ledger68-probe.mjs` is clean. The drift is inert on the c2 fixture (M6 dies at `capture-table-absent` before the filter runs), which is why my control reproductions still byte-match the committed receipts.

I restored the three committed control receipts afterwards (`cp` from `build/receipts-before/`); `git status --porcelain -- .ufo/waves/round-68/controls/` is clean.

## Findings

1. **K68ReviewControls-1 — CRITICAL (round integrity, action for L1).** The frozen C2 counter `deprec68-probe.mjs` has been modified in the lane worktree AFTER the freeze commit (`39f61816`): M6's snapshot-row filter changed (`build/deprec68-probe-drift.diff`; mtime 12:08:52). The plan's counting command runs the worktree file, so a measured-tip run performed now would apply a rule that exists in no committed blob or receipt — the kill rule says that is not this claim's rule. The hunk reads as a plausible strengthening, but direction is irrelevant post-freeze. The c2 control cannot catch it (M6 fails earlier on the fixture), so only a worktree-vs-HEAD diff does. Repro: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff -- .ufo/waves/round-68/probe/deprec68-probe.mjs`. L1 must restore the committed blob (or consciously re-freeze with fresh receipts) before any measured-tip run. I did not touch it.
2. **K68ReviewControls-2 — HIGH (actionable for C1 data).** Round-66's routed section contains a FOURTH counter-visible item — `corpus/lessons/round-66-verifier-spotcheck.md:74` `- **Note for the operator (not a defect, promotion-owned):** …` sits inside the routed section, and `items67` counts it. L3 therefore requires a (66,4) row — covered, non-open, closed/wontfix, with a fresh exact-line answer — while the plan's composition sentence promises "rounds 55..65's 58 plus round 66's D1–D3". Empirically own-items=61 = 57 + 4. If the L1 writes only D1–D3 rows, L3 deterministically MISSes with `unledgered:66#4` + `r66-item-4-not-answered-this-round` (both observed in my trace on the autoledger fixture). Ledger 4 round-66 rows or the claim fails as declared.
3. **K68ReviewControls-3 — LOW (calibration).** The plan's "Before (base `d23892ad`): `LEDGER68_UNMET held=0/7`" misquotes its own committed receipt `base/ledger68-base.txt`, which reads `held=1/7` (L7 passes at base; L6 `skill-row=false quality=false capability-row=false`). Receipt is ground truth; the plan sentence is frozen — record the correction in the wrap-up LOG, never an in-place edit.
4. **K68ReviewControls-4 — LOW (counter metric honesty, no accidental HELD).** M5 self-credits when the entry has zero parseable bullets in live mode (proved: held 1/10 → 2/10 with no fetches). M4's ≥6-bullet gate means HELD is unreachable this way, but held counts overstate M5 on failing revisions; the `--no-live` control receipts are the conservative ones. Recommendation for a future ratchet, outside my edit scope: M5 should MISS when `bullets.length === 0` in live mode.
5. **K68ReviewControls-5 — INFO (positive).** No do-nothing control can reach HELD: donothing is pinned by L3's `ledger-empty-or-absent` + per-item `unledgered` + `classes=0<5` (skeleton parses to zero rows; header/separator are explicitly skipped by `ledgerParse`); autoledger is pinned by L3's `classes=1<5` + 4 × r66 answered-now (structural, generator-independent); c2 is pinned by M1's `sources=2 < 3` (the staged entry cites only S233/S234) and, even past M1, by M2 row-absent/M3 pin-absent/M9's four absent gates. Post-integration control re-runs will shift held upward (v2 tool can pass L1/L4/L5; donothing → up to 5/7, autoledger → up to 6/7) and stay UNMET via L2+L3 / L3 — expected, not regression.
6. **K68ReviewControls-6 — INFO.** Control expectation logic fails closed: the probe emits a single verdict line, `head -1` + `exit=1` is checked, a crashed probe yields CONTROL-FAIL exit 1; the `|| true` on missing spot-check copies is backstopped by L2's `spotsFound===12`. Cosmetic only: c1 receipts truncate the L4 wrong-mutant list to 4 of 7 (shown: good, ordinal, one-word-quote, ambiguous-quote).

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/w1/K68ReviewControls.md` (this report)
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ReviewControls/`: `run-c1-donothing.log`, `run-c1-autoledger.log`, `run-c2-donothing.log` (CONTROL-PASS lines + full verdicts), `l3-trace-autoledger.txt` (full 31-problem L3 trace), `deprec68-probe-drift.diff` (frozen-counter worktree drift), `receipts-before/` (committed control receipts snapshot, also restored to the lane)

## Limits

- My three control runs executed the DRIFTED worktree copy of `deprec68-probe.mjs` (finding -1); the M6 hunk is inert on the do-nothing fixture and verdicts byte-match the committed receipts modulo seed/rev, but I have not re-run c2 against the pristine committed blob.
- Did not name the v1 tool's 3 truncated L4 mutant failures (receipt truncation at 4; L4 fidelity is not this seat's scope).
- Did not run the measured-tip counters (no M rev exists yet), did not verify shokuknow staging provenance beyond byte-identity with the fixture copy, and could not attribute the 12:08:52 probe edit to a seat.
- LOG.md has no round-68 entry yet (wrap-up pending; the freeze is recorded in commit `39f61816`'s message).
- lsp device unused: no language server is mounted in this environment; all caller/definition checks here are file-and-git based (recorded per role instructions).
