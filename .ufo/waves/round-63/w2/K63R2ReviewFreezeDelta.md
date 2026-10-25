VERDICT: The frozen rule bytes did not change (plan.md, both counting probes, base receipts, topology controls byte-identical to b38a2065; pins verify), but the integration revision a9531c8 carries undeclared post-freeze gate-arm relaxations, regenerates all 14 frozen control fixtures, and at that revision the frozen predicate INLINE63 reads UNMET 3/6 with I5 (SCORECARD capabilities row) genuinely unmet — the SCORECARD itself asserts the row "has no admitted replacement in this round", contradicting plan I5.

## Evidence
```
$ git -C kumitate-shokunin diff --stat b38a2065ab8ac5b198f6569b9013d04411c3d40d a9531c8e617338fd16cb69c61344ef8f17711117 -- .ufo/waves/round-63/probe .ufo/waves/round-63/plan.md .ufo/waves/round-63/base
 .ufo/waves/round-63/probe/make-inline-controls.mjs | 62 +++++++++++++-----
 1 file changed, 49 insertions(+), 13 deletions(-)
```
→ inline63-probe.mjs, topology63-probe.mjs, plan.md, base/ receipts: NO change. The one changed file is the writer, declared in controls/CHANGES-AFTER-FREEZE.md item 2.
```
$ node scripts/counter-pins.mjs
COUNTER_PINS: CLEAN pins=21          (exit 0)
$ git show a9531c8e…:<p> | sha256sum   (committed bytes, all four round-63 pins)
inline63-probe.mjs        9133a29ba6b32542349aa89052dd7df8f2cc4ff570229668a4a84376350a57e6  = pin
topology63-probe.mjs      122fcf041a39fa42396f7e989110fb3ca5e00161b3a34436964425e68414f53b  = pin
make-inline-controls.mjs  407d05da78584cffee8eabe5d167ac0f844dde6a4465f4d40c94e293f861e2a5  = pin (re-pointed from 218cb9db… after the declared patch)
make-topology-controls.mjs 4ec158cd9d869a19c109ee908e42d52aba3edfe459609bf0328dee857e5c4289 = pin
```
```
$ node .ufo/waves/round-63/probe/inline63-probe.mjs . a9531c8e617338fd16cb69c61344ef8f17711117
INLINE63_UNMET held=3/6 checks=6 rev=a9531c8e617338fd16cb69c61344ef8f17711117 rule=I63 | I2 MISS total-seats=40 | I5 MISS row-absent | I6 MISS tip-receipt-absent   (exit 1)
$ node .ufo/waves/round-63/probe/topology63-probe.mjs . a9531c8e617338fd16cb69c61344ef8f17711117
TOPOLOGY63_HELD held=7/7 checks=7 rev=a9531c8e617338fd16cb69c61344ef8f17711117 rule=T63   (exit 0)
$ node scripts/inline-dispatch-evidence.mjs --root . --round 63 --wave w1 --rev a9531c8e…
INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)   (exit 0)
```
Controls delta b38a2065→a9531c8 under controls/inline: 484 A, 81 M, 0 D; `expect` files: 30 A, 0 M, 0 D (all 14 frozen expects byte-identical; I3 passes at M over `git archive`, so all 44 cases exit as their expects name). Case count 14→44 = plan floor 10 + declared ratchet; probe code comment (inline63-probe.mjs:21) still says ">= 10".
SCORECARD.md at M: capabilities table header at :1775, but grep for `inline-dispatch-evidence` finds no row; :2905 says verbatim: "It has no admitted replacement in this round." Axes block (:338-340): operability 9 (terminal), coverage 10 retired, coverage:script-layer 10 — matches plan's saturation claims.

## Findings
1. **K63R2ReviewFreezeDelta-1 (HIGH) — I5 unmet at the measured revision; SCORECARD note contradicts plan I5.** Plan I5: "SCORECARD.md at M carries the capabilities row `inline-dispatch-evidence` with first-working round 63". At a9531c8 the row is absent and SCORECARD.md:2905 asserts the round-60 `dispatch-evidence` row "has no admitted replacement in this round" — a sentence that, if left standing, makes frozen check I5 permanently unmeetable. I2 MISS (`total-seats=40`, sum bound 64–100 needs w2-results.json) and I6 MISS (`tip-receipt-absent`) are mid-round/close-time pending, not defects; I5 is not. Repro: `node .ufo/waves/round-63/probe/inline63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin a9531c8e617338fd16cb69c61344ef8f17711117` → `I5 MISS row-absent`.
2. **K63R2ReviewFreezeDelta-2 (MEDIUM) — three undeclared gate-arm relaxations.** controls/CHANGES-AFTER-FREEZE.md declares only the five shape arms, the honest-case swap and case additions ("the rule text unchanged"). The gate diff also relaxes: (a) `finished()` now accepts yield-without-exit (`tr.exitKind === null || 'normal'` vs frozen `=== 'normal'`) — a forger no longer needs any `session_exit` row; (b) `SESSION_AMBIGUOUS` now fires only when >1 *finished* transcripts match — a dead earlier try no longer flags; (c) dispatcher log split on `/\r?\n/` — CRLF logs read CLEAN. All three are disclosed in the gate's header comment and covered by selftests, and all 14 frozen expects still pass, but (a)+(b) change the meaning of "done"/"ambiguous", not just add arms: a skeptical non-author calls them rule changes. They should be listed in CHANGES-AFTER-FREEZE.md. Evidence: gate.diff hunks (`const finished = (tr) => tr.yielded && (tr.exitKind === null || tr.exitKind === 'normal');`, `matched.filter((m) => finished(m.tr)).length > 1`, `split(/\r?\n/)`).
3. **K63R2ReviewFreezeDelta-3 (MEDIUM) — all 14 frozen control fixtures regenerated post-freeze.** 81 M files: every original case's dispatcher.log, session transcripts, w1-results.json, w1.ready changed (lane renamed `ctl`→`kumitate` to satisfy the new context-names-lane check; transcripts harness-shaped by the patched writer). Expects unchanged and I3 passes, so the frozen I3 contract holds, but the fixture bytes wave-1 seats scored against at freeze are not the bytes now committed; CHANGES-AFTER-FREEZE discloses only the `.keep` fix and the honest swap, not the wholesale regeneration. Repro: `git diff --name-status b38a2065… a9531c8… -- .ufo/waves/round-63/controls/inline | grep '^[MD]'`.
4. **K63R2ReviewFreezeDelta-4 (LOW) — declared patch artifact absent; writer/regenerated-set drift.** CHANGES-AFTER-FREEZE item 2 cites "(make-inline-controls.patch)" but no such file exists under controls/ (`ls .ufo/waves/round-63/controls/*.patch` → none). The patched writer emits "wrote 19 cases" and starts with `rmSync(out)` — it regenerates only 19 of the 44 committed cases; the other 25 (10 `rich-*`, 12 `mut-*`, `cheap-40-seats`, `cheap-padded-bytes`, `template-renamed-transcript`) are not products of the declared independent writer, and re-running the writer in a checkout would delete them.
5. **K63R2ReviewFreezeDelta-5 (INFO) — classification of every other post-freeze gate hunk: strengthening or neutral.** Strengthening: five shape arms (SESSION_HEADER/TOOL_JOIN/ROWGRAPH/TIMELINE/TEMPLATE); fail-closed `dispatch-context-too-short` (<64), `dispatch-task-too-short` (<40), `dispatch-seat-name-invalid`; `ready-lane-invalid` charset, `READY_MISMATCH:lane-dir`, `DISPATCH_MISMATCH:context-names-another-lane-or-round`; regex-escaping of lane/round/wave in log patterns; duplicate `done` line → `DONE_LOG_MISMATCH`. Neutral: rev resolved once via `rev-parse --verify` (TOCTOU hardening), 64 MiB transcript cap, `INTERNAL_ERROR` catch, sorted `candidates()`, `SESSION_CORRUPT` as a distinct diagnostic. The plan's "(14 at freeze…)" parenthetical is stale-but-descriptive; the normative floor (>= 10) is unchanged and 44 is within the declared monotone ratchet. C2 is untouched and holds 7/7; the honest saturation claims (operability 9 terminal, coverage retired 10) match SCORECARD at M.

## Artifacts
- Report: .ufo/waves/round-63/w2/K63R2ReviewFreezeDelta.md
- Scratch: /tmp/kumitate-r63/K63R2ReviewFreezeDelta/gate.diff (403 lines), mic.diff (103 lines)
- No build artifacts required; no lane files edited (verified: worktree dirty set is only untracked w2/build files, none mine).

## Limits
- Did not re-measure the gate header's host-store claims (415 finished seats pass all arms; 1466 on raw metrics; "6 of 40" idle seats in wave 1) — quoted from code comment, not re-derived.
- Did not re-run the topology controls or re-verify T5's live-fetch independence beyond the probe's 7/7 at M; did not audit .ufo/pins/source-captures.json or readme-map.json contents beyond counter-pins CLEAN.
- Did not verify the 30 added cases' individual expect outcomes case-by-case by hand — I3's pass at M over `git archive` is the evidence.
- I2's per-wave CLEAN was observed for w1 only; w2-results.json is not yet committed, so the 64–100 sum bound is untested.
