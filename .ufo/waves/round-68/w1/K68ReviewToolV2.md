VERDICT: The v2 tool draft (build/K68ExecToolV2/routed-ledger.mjs) is sound — all six round-66 hardenings are real code, the selftest is hermetic at 56/56 (≥44), verdict shapes match the counter's regexes exactly, and it reaches 61/61 item parity with the counter on the real corpus — but the FROZEN counter's L4 is unsatisfiable as written (fixture row A5 quotes item 4's text at probe:322 while pointing at item 5), so C1 cannot reach held=7/7 until the L1 re-freezes the counter with the reviewed A5 patch; with that patch applied the draft passes the frozen L4 20/20.

## Evidence

Reviewed: v2 draft `.ufo/waves/round-68/build/K68ExecToolV2/routed-ledger.mjs` (732 lines, landed 12:04); v1 `scripts/routed-ledger.mjs` (382 lines) for the delta; frozen `probe/ledger68-probe.mjs` (466 lines) in full. Leaf seat, no subagents. Full verbatim receipts: `build/K68ReviewToolV2/receipts/{v1-baseline,v2-tool}.txt`.

1. v1 selftest → `ROUTED_LEDGER_SELFTEST: PASS (33/33)` exit=0 (33 < 44 → L1 MISSes on v1).
2. Frozen counter at base `d23892ad…` (v1 from archive) → `LEDGER68_UNMET held=1/7 … L4 MISS … 7/20 mutants wrong … | L5 MISS | L6 MISS` exit=1; counter's own count `own-items=61 own-sections=12 own-spotchecks=12` (matches plan's 61/12).
3. Verbatim replica of the counter's L4 fixture+harness (probe:284-365) vs v1 → FAILING 7/20: good, ordinal, one-word-quote, ambiguous-quote, shifted-answer, contradictory, no-section. 13 "passes" are partly accidental: every DRIFT line reads `items=8` (the fence ghost bullet shifts all ordinals), and second-section "passes" with UNLEDGERED raised for r101#6 instead of r102#3 — the class-presence check is necessary, not sufficient.
4. v2 selftest → `PASS (56/56)` exit=0; all 20 counter mutants + 36 further cases ok. Hermetic: node: builtins only; grep for lane paths/network → no matches; fixtures under tmpdir() honoring TMPDIR (ran inside my scratch); git children under a childEnv allow-list with -c identity.
5. Frozen L4 vs v2 (replica, seeds 68a1b2c3d4e5f607 and f00dcaf012345678) → FAILING 2/20 both seeds: good, no-section. Independently confirmed by the tool seat's real frozen-counter run at draft rev a97cc8c7 (`counter-on-draft-final.txt`: `L4 MISS … 2/20 mutants wrong: good…;no-section…`).
6. Root cause in the FROZEN fixture: probe:322 `{ id: 'A5', n: 101, k: 5, q: \`${items101[2].split(' ').slice(2, 4).join(' ')} ${shared}\` … }` quotes D4's words (D4 = `- **D4 — ${items101[2]} ${shared}.**`, probe:307) while item 5 is D5 (`- **D5 — ${phrase(5)} ${shared}.**`, probe:308). v2 on that fixture: `FINDING QUOTE_ABSENT A5@line11:round-101-item-5` → DRIFT exit 1, but the harness demands CLEAN exit 0 for `good` and for `no-section` (which keeps A1–A5). Any tool honoring the counter's own L3 binding rule must fail these two; a tool that passes them must mis-bind quotes. L4 as frozen is unsatisfiable → C1 unlandable at this freeze. (`shared` still appears in D4 and D5, so the ambiguous-quote design is intact.)
7. Author's patch `build/K68ExecToolV2/patch/ledger68-probe-A5-quote.patch` reviewed: 3 hunks — capture `d5 = phrase(5)`, use it in D5's text, re-point A5's quote at D5's own words. Independently verified: the same 3 lines applied to my replica → FAILING 0/20 vs v2 on both seeds. Tool seat's patched-counter receipt (`counter-with-A5-patch.txt`, rev f47065bd) → held=4/7 with L1/L4/L5/L7 PASS; remaining MISS = L2/L3 (`corpus/routed-ledger.md` not yet written) and L6 (registry rows not yet landed) — data/integration side, not tool defects.
8. Six hardenings, v1 → v2 (attack battery, fixtures in scratch; per-attack verdicts in receipts):
   - GIT_DIR: v1 `--rev` with GIT_DIR=<foreign repo> reads the forged repo → `CLEAN exit=0` (same command without it → `FAIL-CLOSED rev-unreadable`); v1 `--selftest` under GIT_DIR still PASSes (no refusal). v2: identical `FAIL-CLOSED rev-unreadable` with and without the poison (GIT_* stripped at startup; selftest PASS 56/56 under poison). Refuse-vs-strip: v2's strip is the stronger mechanism and satisfies the plan's "GIT_DIR-inherited selftest/repo escape" hardening.
   - symlink/`..`: v1 CLEAN through a symlinked answer file and CLEAN with `--ledger ../outside-tree/…`; v2 `ANSWER_DEAD …answer-symlink` and `FAIL-CLOSED ledger-escape` exit 2.
   - every-section scan: v1 `sections=1 items=1 CLEAN` (second routed section silently lost); v2 `sections=2 items=2` + `UNLEDGERED round-55-item-2`.
   - word-boundary binding: v1 CLEAN on a mid-word substring ("…wrong tod" in "wrong today") and on a 2-word quote; v2 `QUOTE_ABSENT` / `ROW_MALFORMED quote-words=2` (3-word floor).
   - exact-line answers: v1 CLEAN with the answer naming :5 and the quote on line 3 (±2 window); v2 `ANSWER_DEAD …answer-quote-not-at-exact-line`.
   - fence awareness: v1 counts a fenced bullet (`items=2` + phantom `UNLEDGERED`); v2 `CLEAN items=1`.
   - new finding classes: QUOTE_AMBIGUOUS (wb hits=2) and ROW_CONTRADICTED (two non-open rows on one item) absent in v1 (CLEAN), fire exactly once in v2.
9. Real-corpus parity: counter `items67` vs v2 `routedSections` per round 55..66 — items identical every round (3,4,4,8,0,9,6,5,6,5,7,4), totals 61 = 61 items, 12 = 12 sections (one routed heading per file).
10. Verdict shapes: no drift. `ROUTED_LEDGER: CLEAN spotchecks=… sections=… items=… rows=… open=…` matches the L2 regex (verified on CLEAN cases), DRIFT/FAIL-CLOSED prefixes match the harness, selftest line matches the L1 regex.

## Findings

1. **K68ReviewToolV2-1 — BLOCKER (frozen counter, not the tool):** L4's `good`/`no-section` fixtures are unsatisfiable (A5 misbinding, probe:322 vs :307/:308) → C1 cannot reach held=7/7 at this freeze. Repro: replica runs above; the tool seat's own frozen-counter receipt agrees. Fix: land `patch/ledger68-probe-A5-quote.patch` via an L1 re-freeze BEFORE any C1 counting (strengthening ratchet; never an in-place edit of the frozen file). Patch independently verified 20/20 here.
2. **K68ReviewToolV2-2 — delta (v1 vs v2 contract):** all six hardenings absent in v1 with working attacks (Evidence 8); all six present and verified in v2; v1 additionally fails 7/20 frozen mutants and the ≥44 selftest floor. The v2 draft is the compliant advance.
3. **K68ReviewToolV2-3 — minor (v2 design note):** a quote-defective row yields two findings (the class finding + `UNLEDGERED` for the item it references). This MATCHES the counter's own L3 model (covered.add only after the quote checks) and breaks no L4 expectation, but makes `findings=k` non-minimal. Keep, or make row-reference-implies-coverage a conscious choice; data authors should expect findings=2 per real quote defect.
4. **K68ReviewToolV2-4 — minor (v2 residual):** the strip list covers GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE/GIT_OBJECT_DIRECTORY/GIT_COMMON_DIR/GIT_CEILING_DIRECTORIES/GIT_NAMESPACE/GIT_CONFIG/GIT_CONFIG_GLOBAL/TAR_OPTIONS but not GIT_CONFIG_COUNT/_KEY_n/_VALUE_n (git config injection into the child `git show`/`ls-tree`; read-only, low impact; the counter's own POISON list doesn't test it either). Suggest adding the three names + one selftest case — tool-side strengthening, no counter change needed.
5. **K68ReviewToolV2-5 — low (latent parser divergence):** on a routed section followed by a later heading + bullet, counter `items67` (no heading break; runs to the next ROUTED heading/EOF) counts 2 items where v2 counts 1. Coincides on the real corpus today (61=61); if any round 55..66 file ever gains items after a later heading, L2's own count and the tool diverge. Keep routed items above any later heading (the plan's append-only assumption already covers this).
6. **K68ReviewToolV2-6 — info:** no drift between tool output shapes and the counter's regexes (Evidence 10). The only counter↔tool mismatch is finding 1's fixture bug.

## Artifacts

- `.ufo/waves/round-68/w1/K68ReviewToolV2.md` (this report)
- `.ufo/waves/round-68/build/K68ReviewToolV2/receipts/v1-baseline.txt`, `receipts/v2-tool.txt` (verbatim run records)
- No lane file outside my report/build paths was modified; frozen probe/counters untouched; scratch deleted on exit. No tools installed; no network used.

## Limits

- Did not run the frozen counter end-to-end against a COMMITTED tree containing the v2 tool (leaf seat cannot commit): L4-vs-v2 evidence is the tool seat's real frozen-counter receipt (rev a97cc8c7) plus my verbatim replica of probe:284-365 run at two seeds; the replica's fixture code was transcribed verbatim from the frozen file and its results reproduce the counter's own L4 MISS line exactly.
- L2/L3/L6 were not exercised end-to-end (the ledger data and registry rows do not exist yet — integration scope).
- One v2 selftest case body (~4 lines at 560-564) was not read; the executed 56/56 run covers its behavior.
- C2/M-side (deprec68) untouched — out of seat scope. The patched-counter run was the tool seat's; I verified the patch's effect on the frozen fixture logic myself (0/20, both seeds) but did not rerun their full probe.
