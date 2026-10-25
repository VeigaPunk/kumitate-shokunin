VERDICT: Plan is mostly exact, but P2's `>= 8 distinct finding ids` is unreachable on the frozen controls (6 exercised; the tool knows only 7 ids) — live probe reads `P2 MISS ids=6` — and the frozen `jj64-donothing.txt` receipt tail says `exit=0` where the plan claims `exit 1`; five smaller text mismatches follow.

## Evidence

- `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` → `RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6 | P5 MISS report-not-given`, exit 1.
- `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> dd1a3e6` → `JJ64_UNMET held=0/8 ... | J6 MISS stated-keys=0;workspaces_after_add:stated=undefined:live=2;...` (15 live keys enumerated), exit 1. Demo runs on this host.
- `node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (20/20)` exit 0.
- r60 report (fleet `7b0581ed63a46ac1961b1ecf98ec0caf561ccd9b`, exists): `grep -o '__[A-Z][A-Z0-9_]*__' | wc -l` = 6 (`__TIP__`×1 `__MEASURED__`×4 `__COMMITS__`×1 — plan's "six tokens" holds); tool run `--round 60 --rev 6825a514` → `REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED`, six `PLACEHOLDER` lines, `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10`, exit 1. `close/dispatch60-tip.txt` at base reads `DISPATCH60: DISPATCH60_UNMET held=8/10` — plan line 22 exact.
- r63 report (fleet `8fd46e614d6db3ca251b9ce75cdc7b94ecb574ad`): tool → `REPORT_RECEIPT: CLEAN` exit 0 at `--rev 6825a514`. P3 reachable as written.
- Controls: 16 dirs committed (`git ls-tree` = 80 files). Expect files exercise 6 distinct ids: PLACEHOLDER(c1,c2,c3,c12,c13), TALLY_UNRECEIPTED(c4,c5,c6,c12), RECEIPT_MISSING(c7), SECTION_MISSING(c8,c9), SHONEN_COUNT(c9,c10), HASH_DEAD(c11). CLEAN: c0, c14, c15.
- Base facts: tool/entry/`jj-seat-demo.sh` all absent at `6825a514` (git cat-file); `grep -c jj-workspace-seat-containment` on base PROVINCE.md = 0; base receipts all match plan text except the do-nothing exit tail.
- Counts: `grep -c '^| S[0-9]' corpus/SOURCES.md` = 136; `assimilation/` headers `136 reg-ids`, `155 staged-ids` (SOURCES.append.md also 155 rows), `3 collisions` (S195/196/197), `9 quarantine-slice`. Collision mapping verified: staged S195=lane S125 (mcp arch URL identical), staged S196=lane S117/S126 (temporal URL identical), staged S197=lane S127 (ext-tasks URL identical); lane max S197 → next S198; staged jj rows S259/S270/S290/S291/S295/S309 not in lane.
- Pins: `.ufo/pins/counter-pins.json` round-64 pins = receipt64-probe, jj64-probe, make-receipt-controls64, jj-donothing-control64; sha256 prefixes match files. `w1.ready` absent from `dd1a3e6` tree (plan-before-ready holds).
- w1-dispatch.json: `counts.spawn=41`; roles: executor 13, scribe 8, scout 6, reviewer 5, connector 4, critic 2, mutation-tester 1, sentinel 1, simplifier 1.
- M7 quote (plan line 59) verbatim at corpus/knowledge/agent-isolation-substrates.md:150-151. PROVINCE.md:21 has the "Isolation substrates" frontier line. Three `agent-isolation-substrates-amendment-*` files exist under merge/kumitate. considerthese/2026-10-25.md ideas 1–2 match plan wording.

## Findings

1. **K64ReviewPlanText-1 — severity high (disclosure-required).** Attacks P2's declared floor. Plan line 33 requires `>= 8 distinct finding ids are exercised`; the frozen controls exercise 6 (Evidence §Controls), and `scripts/report-receipt-diff.mjs` emits only 7 ids total (header lines 12-19: PLACEHOLDER, TALLY_UNRECEIPTED, RECEIPT_MISSING, HASH_DEAD, HASH_ORPHAN, SECTION_MISSING, SHONEN_COUNT). Probe line 61 enforces `seen.size < 8 → MISS`. So `RECEIPT64_HELD` is unreachable on the frozen corpus: it needs ≥1 HASH_ORPHAN control plus ≥1 *new* finding id added by a ratchet fix — a reachability precondition the plan never states; its parenthetical "(16 at freeze …)" implies sufficiency. Live proof: `P2 MISS ids=6` above.
2. **K64ReviewPlanText-2 — medium.** Plan line 31: "one honest, the rest each altering one thing." Wrong count: three CLEAN cases (c0-honest, c14-honest-templates, c15-honest-two-receipts expect `0/CLEAN`). Also the counter hard-requires the name `c0-honest` (probe line 58 `if (c === 'c0-honest') honest = true`) — an undisclosed name-coupling: renaming the honest case silently breaks P2.
3. **K64ReviewPlanText-3 — medium.** Plan line 92 claims the do-nothing receipt shows `exit 1`; committed `base/jj64-donothing.txt` ends `exit=0`. The control script's `node "$PROBE" … || true` (probe/jj-donothing-control.sh:19) makes the *script* exit 0 while the probe verdict line reads `JJ64_UNMET held=1/8` exit 1 — but the receipt's trailing convention elsewhere records the probe's own exit (receipt64-base.txt `exit=1`, jj64-base.txt `exit=1`). Frozen receipt contradicts the plan's sentence and its siblings.
4. **K64ReviewPlanText-4 — medium.** Plan line 100 attributes "136 rows" to `base/census-before.txt`; that file records no count (6 W04 lines + `ok` + `EXIT=0`). The 136 figure is real but lives in `base/sources-check-before.txt` (`SOURCES_CHECK: CLEAN (rows=136 …)`) and `assimilation/reg-ids`. Misattributed citation.
5. **K64ReviewPlanText-5 — medium.** Plan line 126 "Wave 1 (36–40 seats)": dispatch spawned 41 (`counts.spawn=41`, 41 `K64` names). Plan line 129 "attack roles >= 25% planned per wave": w1 has reviewer 5 + critic 2 + mutation-tester 1 = 8/41 = 19.5%. Strict m_flash share (exec+scribe+simplifier) 22/41 = 53.7% — that clause holds.
6. **K64ReviewPlanText-6 — low (frozen-counter defect, reported not patched).** jj64-probe.mjs:34 `process.env.SOURCES_CENSUS || <fleet>/scripts/sources-census.sh` — J7's census arm honors an env override (any binary can be swapped in) and silently runs the *fleet* copy while the plan says only "`sources-census.sh`". Also plan J7's "a frontier line" vs code `/frontier|band|ground|first entry/i` (line 210) — a line containing the bare word "ground" off a frontier bullet would pass.
7. **K64ReviewPlanText-7 — low.** Plan-vs-code looseness: (a) J8 plan "an appended `Amendment 2026-10-25` section naming the entry path and `M7`" — code checks the *tail* contains ENTRY and `M7` anywhere (lines 229-230), not inside the amendment section; (b) J1 "opens with" is a hard 14-line window in code (line 75), undeclared; (c) J2's code adds an unplanned `tier`-nonempty arm (line 113).
8. **K64ReviewPlanText-8 — low (stated-limit gap in C1).** Plan line 51 names three limits; undisclosed: RECEIPT_PATH/TALLY read only `base|close` (tool line 62) so `probe/`/`w1/` receipt paths and tallies are invisible; tool PLACEHOLDER ignores `__X__` with <3 inner chars (`{2,}` at line 38) while probe P3's independent grep counts ≥1, and `TBD`/`LANE_HASH` flag but grep doesn't count them — the "exactly as many PLACEHOLDER lines as grep count" equivalence (P3) is orthogonally fragile (holds today: 6=6).

## Artifacts

- Report: `.ufo/waves/round-64/w1/K64ReviewPlanText.md` (this file).
- Scratch: `/tmp/kumitate-r64/K64ReviewPlanText/r60.md`, `r63.md` (fleet report bytes used for the live tool runs).
- No tool installs performed; no fixes proposed (frozen-counter defects are report-only; the tool itself is not a finding of this seat).

## Limits

- Did not verify routed-defect D3's "-2 stem count, three not one" arithmetic or D4's kimi K=49 wording; D1/D2/D5/D6 claims consistent with what I saw.
- Did not re-run `readme-map`/`proxy-check` myself (maintenance subjects, not claims); base DRIFT receipts match plan lines 14-15 verbatim.
- J5 live-fetch path never exercised (no cited rows exist yet). Assimilation guard scripts are committed *outputs*, not re-executed; counts read from file headers.
- `ahead=0` vs origin unverified (no remote read). w2 spec untouched.
