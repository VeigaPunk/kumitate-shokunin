VERDICT: The round-62 `GATE_PIN_KEY_UNKNOWN` fail-closed is repaired in a scratch mirror of `b38a206` by registering two `GATE_PINS` keys, and — once the four further drifts that fail-closed had masked are also declared — `proxy-check` reads `MATCH` exit 0 (also under `--strict`), replayable from the pristine frozen archive; the L1 must gate on a `git archive` of the tip because `A` counts runnable files under `.ufo/waves/round-63/build/**` (122 in the archive vs 373 measured in the live tree).

## Evidence

Base reproduction, unmodified mirror of `b38a2065ab8ac5b198f6569b9013d04411c3d40d`:
```
$ node scripts/proxy-check.mjs
proxy-check: fail-closed — GATE_PIN_KEY_UNKNOWN: line 330: pin.make-dispatch-actual is not a kumitate-gate-pins-v1 key
PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 330: pin.make-dispatch-actual is not a kumitate-gate-pins-v1 key
EXIT=2
```
After ONLY the two `GATE_PINS` keys (stanza untouched) — the fail-closed was hiding all of this:
```
verdict DRIFT errors 6 warnings 1
error A_DRIFT | A: declared=117 computed=122 delta=+5
error C2_TOTAL_DRIFT | C2_total: declared=150 computed=151 delta=+1
error K_MEMBERS_DRIFT | K_members: declared=52 computed=49 delta=-3
error K_SECTIONS_DRIFT | K_sections: declared=52 computed=49 delta=-3
error PIN_DRIFT | pin.proxy-check: declared=7f73f8e7… computed=cac52a0b…
error AXES_DRIFT | coverage: ## Axes row=10 derived=9
warn PIN_UNPINNED | scripts/inline-dispatch-evidence.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
```
Final mirror (`b38a206` archive + patch + stanza + README row):
```
$ node scripts/proxy-check.mjs
PROXY: MATCH (A=122 C=30 operability=9; C1=19/19 C2=151/151 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
EXIT=0
$ node scripts/proxy-check.mjs --strict
PROXY: MATCH (A=122 C=30 operability=9; C1=19/19 C2=151/151 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
STRICT_EXIT=0
```
Selftest after the key additions (known-vs-unknown gate-pin cases are selftest 63 and 65, pre-existing):
```
PASS  [ 63/122]  separate gate-pin block verifies named gates, suppresses warnings, and keeps v1 pins unchanged — exit=0 warnings=0 v1Pins=6/6 futureKey=true
PASS  [ 65/122]  GATE_PIN_KEY_UNKNOWN: an undeclared gate key fails closed — exit=2 token=GATE_PIN_KEY_UNKNOWN …
PASS  [122/122]  every declared fail-closed arm fires in at least one fixture — 17 arms observed
PROXY_SELFTEST: 122/122 pass
VERDICT: PASS            (SELFTEST_EXIT=0)
```
End-to-end replay from the pristine frozen archive (`git archive b38a206 | tar -x -C replay && git apply proxy-check.mjs.patch`, then stanza + row):
```
cac52a0b3c690fb925925fa9da87d3e68a355109caecb1877d33df9e48fcdc67  scripts/proxy-check.mjs
PROXY: MATCH (A=122 C=30 operability=9; C1=19/19 C2=151/151 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
REPLAY_STRICT_EXIT=0
```
Falsifiers on scratch copies of the fixed mirror (each kills exactly one thing):
```
f1 unknown gate key added to the block      plain_exit=2 strict_exit=2   # GATE_PIN_KEY_UNKNOWN
f2 pin.make-dispatch-actual zeroed          plain_exit=1 strict_exit=1   # GATE_PIN_DRIFT, declared+computed named
f3 registered key, declaration dropped      plain_exit=0 strict_exit=1   # PIN_UNPINNED warn; MATCH without --strict
```
The stanza is an archive count, measured on the round-62 tip (`recompute.sh` on `git archive a2281a39`): `A=117 C=30 C1=19 C1_total=19 C2=150 C2_total=150` — exactly the declared values; the same script on the live lane tree read `A=373` (later 401: 118 rest-of-tree, 155 other seats' `build/`, 122 my mirror, 6 round-63 probe/controls), with `251` runnables not in `git ls-files`.

## Findings

**K63ExecProxyStanza-1 — high — `A` is a working-tree count and the round's build convention breaks it.** `deriveTerms` walks `--self` with `walkFiles` (only `.git` pruned) and counts `.mjs/.js/.sh/.py`, so every seat's runnable artifact under `.ufo/waves/round-63/build/**` inflates `A`; this seat's mandated mirror alone adds 122 and `recompute.sh` adds 1. A MATCH in the live tree is therefore unobtainable mid-wave, and committing a build mirror would make the inflation permanent (round 51's 27 committed build runnables show artifacts do get committed). Repro: `build/K63ExecProxyStanza/recompute.sh /home/vgpnk/Projects/shokunin/kumitate-shokunin` → `A=373 … # runnables not in git ls-files … 251`; on the archive → `A=122`. Fix for the L1: gate on `git archive <tip>`, never commit `build/*/mirror/`, and run `recompute.sh` last.

**K63ExecProxyStanza-2 — high — the fail-closed masked four further stanza drifts, so the key fix alone cannot go green.** (a) `A` 117→122: the freeze committed 5 new runnables (`scripts/inline-dispatch-evidence.mjs`, 4 `probe/*.mjs`); (b) `C2_total` 150→151: the round-62 note exists with no README row, so `coverage` derives 9 against the `## Axes` row 10 (`AXES_DRIFT`) until the row lands; (c) `K_members`/`K_sections` 52→49 (finding 3); (d) `pin.proxy-check` self-hash. Repro: the "after ONLY the two keys" block above.

**K63ExecProxyStanza-3 — medium — the K terms track the live host root, and the host root has lost four members.** `node scripts/kimi-census.mjs` → `KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)`, `TOTALS: members=49 checked=49 errors=4`, exit 1 — a third live base defect the plan's maintenance list does not name. Declaring `K_members=K_sections=49` is the only way `proxy-check` can MATCH without touching `scripts/kimi-census.mjs`, and it silently ratifies a shrunken host root (SCORECARD prose still says 53; the axis integer stays 10 because the ratio is 49/49). The census gate stays red either way: that is an L1 routing decision, not a proxy repair.

**K63ExecProxyStanza-4 — medium — a dropped gate-pin declaration reads `MATCH` without `--strict`.** `compareGatePins` iterates the declared map only, and `comparePinCoverage` re-warns `PIN_UNPINNED`, but a warning is not an error: f3 above prints `PROXY: MATCH …` exit 0. The tip gate must be `node scripts/proxy-check.mjs --strict` (f3 strict_exit=1).

**K63ExecProxyStanza-5 — low — the R62 class has no preflight, so it can recur.** A round can land a `pin.<gate>` line in `SCORECARD.md` and forget `GATE_PINS` (the whole base state); the tool's fail-closed is correct but fires only at gate time and suppresses the `PIN_UNPINNED` diagnostics that would have named the other unpinned script. Shipped mitigation: `recompute.sh` prints `PREFLIGHT FAIL: <key> is declared in SCORECARD.md but not in GATE_PINS` (measured on `a2281a3` and on the live lane) before anything is pasted.

### Diff to integrate (`scripts/proxy-check.mjs`, applies cleanly: `git apply --check` exit 0)
```diff
--- a/scripts/proxy-check.mjs
+++ b/scripts/proxy-check.mjs
@@ -476,6 +476,8 @@
   'pin.dispatch-evidence': 'scripts/dispatch-evidence.mjs', // round 60: the round's actual dispatch record, not a prepared spec (R58-V2)
+  'pin.make-dispatch-actual': 'scripts/make-dispatch-actual.mjs', // round 62: the round-62 dispatcher invocation writer (pinned in SCORECARD, registered here in round 63 — the R62 fail-closed)
+  'pin.inline-dispatch-evidence': 'scripts/inline-dispatch-evidence.mjs', // round 63: inline wave dispatch evidence gate (C1)
 };
```
### Stanza lines to integrate (post-patch, archive `b38a206` + these)
```
A=122            (117 + 5 runnables from the freeze)
C2=151           (requires the readme-map seat's row for lessons/round-62-verifier-spotcheck.md)
C2_total=151
K_members=49     (live host root, 2026-10-25; see finding 3)
K_sections=49
pin.proxy-check=cac52a0b3c690fb925925fa9da87d3e68a355109caecb1877d33df9e48fcdc67   (sha of the PATCHED file)
pin.inline-dispatch-evidence=fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd   (new line, gate-pins block)
```
- `C2`/`C2_total` here are PRE-INTEGRATION values (151/151 on `b38a206` + the readme seat's row). `K63ExecReadmeMapRepair` confirmed one line at the placement I mirrored and `pin.readme-map` unchanged (`b1c8bf97…`). Any round-63 `corpus/*.md` landing (C2 entry, round-63 lesson) raises `C2_total`, and each new note needs its README row in the same commit: re-run `recompute.sh` on the final tree, never hand-edit the pair.
Unchanged and verified: `C=30 C1=19 C1_total=19 S_*=88/88 R_*=92/92 C1k=5/5 coverage_script=runtime=kimi=10`, and `pin.make-dispatch-actual=f0194314…` already matched. Any further edit to `scripts/inline-dispatch-evidence.mjs` (wave-2 ratchet) or to `proxy-check.mjs` requires re-pinning from `recompute.sh`'s `pin.*` output.

## Artifacts
- `.ufo/waves/round-63/build/K63ExecProxyStanza/mirror/` — the fixed tree (MATCH, exit 0)
- `.ufo/waves/round-63/build/K63ExecProxyStanza/proxy-check.mjs.patch` — the only tool diff
- `.ufo/waves/round-63/build/K63ExecProxyStanza/recompute.sh` — `<lane>` → independent A/C/C1/C2/C2_total + every `pin.*` (maps parsed from the tool), derived scores, pin-key preflight, untracked-runnable list, tool cross-check; exit 0 consistent / 1 drift / 2 fail-closed / 64 usage
- `.ufo/waves/round-63/build/K63ExecProxyStanza/stanza.txt`, `receipts.txt`, `selftest.txt`
- scratch: `/tmp/kumitate-r63/K63ExecProxyStanza/{a2281a3,replay,f1,f2,f3,applycheck}`

## Limits
Did not touch the lane (`git status` in the lane unchanged by me except this build dir and report); the readme-map repair, the `readme-map.json` pin entry and the kimi-census DRIFT are other seats'/the L1's decisions. No new selftest case was added — cases 63/65 already cover known-vs-unknown gate keys, and the suite count stayed 122/122. `K_*` is live-host-derived, so this MATCH is dated 2026-10-25 and re-drifts if `~/.kimi-code` changes. I did not test a committed-build-artifact tip (that A depends on what the L1 commits) nor duplicate-key/malformed pin blocks beyond the existing selftest arms. Layer terms were not re-derived independently by `recompute.sh` (it prints the tool's values for them); they matched on every run. No pacman/uv/npx installs were needed.
