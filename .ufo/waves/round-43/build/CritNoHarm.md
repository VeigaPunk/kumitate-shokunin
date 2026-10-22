RESULT CritNoHarm rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=caution risks=9 item18_headroom=7-37s pins_to_repin=pin.cite-check(v1),pin.wave-census(gate-pins) default_verdicts=unchanged
Method. Everything ran in my scratch clones under /fast/scratch/hyaku/kumitate-r43/seats/CritNoHarm/: `lane` is e5ffcbe, and `probe` is e5ffcbe plus a 14-line in-process witness, committed as 4422eb30 in the clone only. The probe is a timing probe, not a deliverable (diff sha256 ec730baf…). Every node run used systemd-run --user --scope -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600; the counter and the 256 rows used 6G/256/900. Each run had KUMITATE_GATE_MUTANTS_TMP=<seat>/gm-tmp and UFO_SRC=/fast/scratch/hyaku/kumitate-pin/src (31c465f1). Host load average was 33 to 75 on 32 cores throughout. After every run: 0 leftover processes and gm-tmp empty. Counter sha256 e24749e4… verified. No tools installed.
Axes and terms C1 and D1-D8 can move, with their before values at e5ffcbe:
- Axes and stanza: `node scripts/proxy-check.mjs --src $PIN [--strict]` gave exit 0 `PROXY: MATCH (A=10 C=19 operability=9; C1=19/19 C2=95/95 coverage=10; S=88/88 …=10; R=92/92 …=10; K=53/53 …=10; pins=6 match)`, in both modes.
- Default-mode verdicts:
  - `cite-check --src $PIN --fleet /home/vgpnk/Projects/shokunin` gave exit 1 `errors=558 warnings=486`. Without --fleet, a clone resolves the fleet to its own parent and reads errors=731 warnings=562, so a D5 receipt must name --src, --self and --fleet.
  - `wave-census --round 40` gave exit 0 CLEAN. `kimi-census` gave exit 0 `CLEAN (members=53 checked=53)`; live locks/ is `directory 700 vgpnk:vgpnk` (uid 1000). `claims-check` gave MATCH and `sources-check` gave CLEAN rows=45.
- Selftests (median of 3 at load ~28): cite-check 1.81 s 75/75; wave-census 3.26 s 31/31; gate-mutants 0.70 s 28/28; surface-probe 1.02 s 45/45; proxy-check 9.49 s 121/121. All exit 0 with VERDICT: PASS.
- Checklist, `node scripts/surface-probe.mjs --checklists` from the clone root: `CHECKLIST: 16/19 pass` exit 1, wall 130.6 s.
  - Items 682 and 683 exit 2 in any clone (no fleet reports dir, as round-42 CritTradesTip also found). Measure before and after in the same location.
  - Item 694 (item 18) exit 1 = SURVIVED.
Q1, does K43's rerun push item 18 toward surface-probe's 120 s CHECKLIST_TIMEOUT_MS (surface-probe.mjs:241)? Yes, toward it, but it stayed under the cap in every run I made.
- `node scripts/gate-mutants.mjs` alone (item 18 at SKILL.md:694, default --jobs 4, per-run 60 s cap, gate-mutants.mjs:29-30):
  - before, 256: 85.8 s (load 56.7→75.2)
  - before, 128: 95.9 s (load 61.3); the first 128 run, which read ERROR unstable=3, took ~112.9 s (shell wall time including trivial greps, load 35.5 at start)
  - probe, 128: 83.1 s
  - probe, 256: 89.8 s
  - frozen counter --rev 4422eb30: 95.7 s
  - Round 42 measured item 18 at 22.7 and 24.2 s at load ~7, without confirmation reruns.
- Selftest runs per gate run: before, 2 controls + 43 mutants + 36 confirmations + 2 controls = 83. At the C1 target, 43 confirmations make 90 (+8%). [INFERENCE: wall time is linear in runs, so ~90-104 s for the typical runs at load 50-75, but the ~112.9 s sample scales to ~122 s, which is over the cap.]
- [INFERENCE] A witness that spawns a child selftest, like wave-census WC24, roughly doubles each suite's run time. That would push item 18 past 120 s at this load, and a timed-out item reads status null = FAIL.
- Measure before and after: alternate `bash timed.sh <out> 128 4G 600 node scripts/gate-mutants.mjs` between the two revisions, at least 3 pairs, recording load. Add `--checklists` wall time and the per-item exit.
Q2, do the witness edits change pins or default-mode verdicts? Pins: yes, both. Default verdicts: no.
- Probe `proxy-check` gave exit 1 with two pin findings:
  - `PIN_DRIFT pin.cite-check … computed=a96405df…`: a v1 pin, one of the six in the kumitate-proxy-v1 stanza.
  - `GATE_PIN_DRIFT pin.wave-census … computed=8566f192…`.
- These two pin findings turned checklist item 684 red: probe `CHECKLIST: 15/19`, wall 124.6 s.
- Re-pinning the value is enough; D6 permits it with no new key.
- The other routed fixes also need re-pins: D7 needs pin.kimi-census, plus pin.proxy-check if K_MEMBER_RULES is touched. D4 needs pin.gate-mutants, which then moves the lane's item 18 off the frozen e24749e4 bytes. C1 must keep scoring with the extracted counter.
- Default verdicts are unchanged: probe cite-check default output is byte-identical to before apart from the `self=` path (`diff` with that path replaced by a placeholder: identical), and probe `wave-census --round 40` gives exit 0 CLEAN.
Risks (counterexample → smallest safe correction):
1. Item 18 headroom is 7-37 s at load 35-75: the slowest run (~112.9 s) left ~7 s, so +8% runs at the C1 target can cross 120 s on a bad sample, and there is none for a child-process witness. Keep the witness in-process, and record item 18 wall time and load in the close receipt.
2. K43 reads UNSTABLE under the checklist bound. At e5ffcbe, item 18 at TasksMax=128 read `GATE_MUTANTS: ERROR (… killed=33 frozen=32/41 …) unstable=3` exit 2. The confirmation runs disagreed for repair/read-error-rethrown, guard-outer-eq-undefined and repair/dotdot-guard-dropped. The probe checklist's item 18 also exited 2. Overall, 2 of 5 runs at 128 read ERROR and 0 of 3 at 256 did. [INFERENCE] A thread cap: an idle node has 7 threads (measured), and 4 jobs with nested children approach 128 tasks. Correction: run the measured counter only at its 256/6G bound on a lightly loaded host, record the load, and never amend K43.
3. Override-style witnesses are a trap for C1, not a harm. A witness that only forces the exit and verdict made 4 of the 7 survivors equivalent. The probe counter read `SURVIVED (killed=39 frozen=37/41)`: suite-exit-text 75/75 PASS exit 0; V385, V387 and M19 31/31 PASS exit 0. The suites' self-observation cases then pass. Correction: the witness must emit a named `FAIL ` case when its recount disagrees with the primary verdict or exit.
4. Literal uniqueness. `return pass === results.length ? 0 : 1` is the from-literal of both V387 and M19 (gate-mutants.mjs:147,161). `return verdict === 'FAIL' ? 1 : 0;` already occurs twice in cite-check; the manifest disambiguates it with the preceding line. Copying either into a witness gives nomatch, exit 2. Measure with `grep -cF` (before: 1,1,1 in wave-census; 1,1,2 in cite-check).
5. Tally inflation. parseCaseCount (gate-mutants.mjs:410-417) sums every `n/m pass` or `cases passed` line. A witness tally line would double the control totals (75→150, 31→62): the floors still pass, but every receipt's case count changes meaning. Correction: print no second tally line.
6. The A and C terms count beyond scripts/. A counts every *.mjs, .js, .sh and .py file outside .git (proxy-check.mjs:94-95), including .ufo/; a committed probe .mjs makes A=11 and the stanza drifts. C counts every `- [` line in SKILL.md. Keep probes as .txt, and add no task-shaped lines.
7. C2_total. A new round-43 lesson or knowledge .md without a README row drops derived coverage to 9 (`AXES_DRIFT coverage 10→9` at round open, receipts.txt). Correction: add the README row in the same commit.
8. D7 kimi-census. A mode-equality or owner check must keep the live `KIMI_CENSUS: CLEAN members=53`. If a locks/sessions member is added, K_members and K_sections must move together or coverage_kimi drops.
9. The round-41 cost trade cannot be resolved at this load. Alternated pairs at load ~33: cite-check before 1.34, 1.79, 2.08 s, after 1.22, 2.15, 1.46 s; wave-census before 3.39, 3.49, 3.12 s, after 3.47, 2.73, 2.94 s; all exit 0 PASS. The spread is 0.86 s against round 42's 5 ms delta at load 2.6. Correction: use 5 alternated pairs at load < 4 (CritTradesTip method), otherwise report the trade as unmeasured.
Raw outputs (seat dir): item18-*.txt, counter-probe.txt, checklist-{before,probe}.txt, pairs-{cite,wave}.txt, cite-default-{lane,probe}.txt, before-cheap.txt.
