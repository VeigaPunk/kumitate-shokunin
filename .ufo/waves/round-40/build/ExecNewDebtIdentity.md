RESULT ExecNewDebtIdentity rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=done selftest=34/34 red_before=AT39,AT40,AT41,AT42 headroom_refused=yes trade_refused=yes open_pin=CLEAN unmapped_debt=0/20

Scope: own scratch clone /fast/scratch/hyaku/kumitate-r40/seats/ExecNewDebtIdentity/lane at commit 6b269ce4335352c41d4d069836b5bf7a7626220c (patched anchor-truth.mjs); src /fast/scratch/hyaku/kumitate-pin/src at 31c465f15669. Delivery: /fast/scratch/hyaku/kumitate-r40/seats/ExecNewDebtIdentity/ExecNewDebtIdentity.patch (scripts/anchor-truth.mjs only; apply-clean against f69817e, verified with `git apply --check`). No installs. Evidence commands below ran exactly as quoted.

1. Rule (L1 steer, binding): new option `--open REV` adds a second floor against the pin at REV (read via `git show REV:<pinRel>`, never HEAD/working tree). It runs compareBase against REV (BASE_TRUE_LOST, DEBT_GREW, CHECKED_SHRANK as today) plus DEBT_NEW: every current debt entry (debt:false/debt:dead; unchecked exempt) must equal a REV debt entry by identity (raw@path#occurrence) and by token, else DEBT_NEW. `--base` checks are byte-for-byte unchanged (compareBase untouched; DEBT_NEW only exists under --open).

2. Open pin stays CLEAN under --open, unmodified:
   `node scripts/anchor-truth.mjs --src /fast/scratch/hyaku/kumitate-pin/src --open f69817edf687c8ce4f87ed7953a353399232f69e`
   → `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)` exit 0.
   Same with `--base e18ff1af... --open f69817ed...` → CLEAN exit 0. unmapped_debt under --open = 0/20 (all 20 current debt entries equal an open debt entry by identity+token). Under the frozen base alone, exactly 1/20 is unmapped (S8#99), see #6.

3. One-for-one trade (round-39 limit-debt-trade.py.txt shape): at f69817e, open logic accepts:
   `python3 trade.py lane-pristine .../kumitate-pin/src` → `TRUTH: CLEAN (... base=e18ff1af...)` exit 0.
   Same trade on patched script with --open f69817e → refused:
   `TRUTH  DEBT_NEW  remaining-scripts-census.md#520  scripts/ufo-swarm-collect.test.mjs:1@scripts/ufo-swarm-collect.test.mjs#0 debt:false now, no equal debt anchor at the open revision`; `TRUTH: DRIFT (1 findings: DEBT_NEW ... open=f69817ed...` exit 1. trade_refused=yes.

4. 73-headroom attack (CritRedHeadroom/headroom-attack.py, census=73): at f69817e open logic reads CLEAN (debt 4→77 vs base 77 → no DEBT_GREW), exit 0. Patched script with --open f69817e refuses: 73× DEBT_NEW (fresh identity packages/contract-support/src/batteries.ts:1@#0..#72) + DEBT_GREW (count 4→77 vs open 4), `TRUTH: DRIFT (74 findings: DEBT_GREW DEBT_NEW ... open=f69817ed...` exit 1. headroom_refused=yes.

5. Selftest: patched script `node scripts/anchor-truth.mjs --selftest` → `ANCHOR_TRUTH_SELFTEST: 34/34 pass`, VERDICT: PASS, exit 0. New cases AT39 (count-neutral one-for-one trade → DEBT_NEW, DEBT_GREW absent), AT40 (73-headroom shape → DEBT_NEW), AT41 (open-true anchor turned false → DEBT_GREW@open), AT42 (benign new true anchor stays CLEAN). Red-before: round-open logic (scripts/anchor-truth.mjs@f69817e) with only the four new test blocks grafted in → `ANCHOR_TRUTH_SELFTEST: 30/34 pass`, AT39/AT40/AT41/AT42 FAIL (open logic rejects `--open` with exit 64 and has no DEBT_NEW/DEBT_GREW@open), exit 1.

6. S8#99 measurement (all 20 current debt entries, identity mapping): 19/20 map to base debt entries at e18ff1af. The only unmapped one is S8#99 `scripts/fleet-ledger-rotate.mjs:392@scripts/fleet-ledger-rotate.mjs#0` (debt:false, token `<segment>.<sha256>.cold`); frozen base holds it as `:392@scripts/fleet-dispatcher.mjs#0` (the round-38 path correction changed identity). Under the binding `--open f69817e` design S8#99 maps by identity+token at the open revision, so the open pin reads CLEAN with no note/pin change — no frozen-base DEBT_NEW is emitted (rule only applies under --open). H8 repair semantics (CritOperabilityCost recipe) verified: source line 392 = `function preserveToCold(segPath, segName, rawSha, rawBuf, ledgerDir, linkFn = linkSync) {`; line 393 = `const coldName = \`${segName}.${rawSha}.cold\`;`; the note's `<segment>.<sha256>.cold` literal appears only in the comment at line 20. The current debt:false anchor is therefore honest, and H8's re-pair of :392 with `preserveToCold` (true on 392) while keeping `name template :393` (review token `cold`, true on 393) is semantically right. It is NOT included in this patch: the binding steer shows it is unnecessary for CLEAN-ness under --open (the L1 may take it from recipe H8; it would remain CLEAN under --open).

7. No-harm runner (CritOperabilityCost's recipes.json, 17 recipes) against patched commit 6b269ce:
   - `node run-recipes.mjs --lane <lane> --rev 6b269ce4335352c41d4d069836b5bf7a7626220c` → `HONEST_CLEAN 9/17 skipped=0` — identical set to the open baseline (H0,H7,H8,H9,H3r,H4r,H10r,H12,H13 CLEAN). No recipe changes on the patch under `--base`-only invocation.
   - Same runner with `--open f69817ed...` added (copy of runner, not the other seat's file): `HONEST_CLEAN 5/17`; H7, H3r, H4r, H12 flip CLEAN→DRIFT solely on `BASE_TRUE_LOST ... (open floor)` because they narrow/widen ranges of anchors that were true at the open revision (the known re-cite cost now also pinned to the open floor; note H1/H2/H5/H11 already drift under --base).

8. Fail-closed: `--open ..` → `TRUTH: FAIL-CLOSED (OPEN_INVALID ..)` exit 2; `--open 0000...` → `TRUTH: FAIL-CLOSED (OPEN_UNREADABLE 0000...:.ufo/pins/anchor-truth.json)` exit 2.

Risks / costs for the L1:
- The open floor refuses honest re-cites (narrow/widen) of anchors true at the open revision (BASE_TRUE_LOST@open); recipes H7/H3r/H4r/H12 demonstrate it. Mitigation: the L1 passes `--open` at a revision after the intended edits, or admits repairs through the normal flow.
- DEBT_NEW requires identity AND token equality: an honest re-pair of a debt anchor (token change, still false) is refused until it is repaired to true or re-based.
- Identity occurrence numbering is raw@path-based; inserting an earlier anchor with the same raw@path shifts occurrences (pre-existing semantics shared with BASE_TRUE_LOST).
