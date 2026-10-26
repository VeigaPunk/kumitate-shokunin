VERDICT: at the integrated tree (2ed8a5f8) the frozen C2 counter still reads `JJ64_HELD held=8/8` for every forgery that matters — an entry whose own prose and table contradict its outcomes, an entry with invented body claims, a demo that never calls `jj` (nothing binds the demo's bytes: 0 of 25 counter pins, no sha256 anywhere in the tree), a demo that derives its "measurements" from the entry through the caller's cwd, 12 arbitrary/empty outcome keys, and a synthetic capture with a recomputed pin — while the honest tree's three calibrations (wrong value, unpinned capture edit, missing bullet) still MISS, and the landed tree carries one real duplicate-authority conflict (`seat_snapshot_in_shared_op_log=2` in the lesson vs `=1` in the entry, amendment and demo).

## Evidence

Sandbox (recreate: `C=/tmp/kumitate-r64/K64R2CriticJjForge/clone; git clone --no-hardlinks -q <lane> "$C" && git -C "$C" checkout -q 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`; 229 MB, deleted after evidence capture), `git -C "$C" rev-parse --show-toplevel` = the clone, every commit inside it with `-c user.name=fixture -c user.email=fixture@example.invalid`. The lane and the frozen artifacts were never edited (lane `git status` shows no tracked modification).

Honest baseline (the frozen counter, unmodified, `sha256 157be0ac…` = its pin):
```
$ node .ufo/waves/round-64/probe/jj64-probe.mjs /tmp/.../clone 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64     exit=0
```
Forgeries (each a child commit of 2ed8a5f in the clone; full log `build/K64R2CriticJjForge/verdicts.json`):
```
F1 9949473c345e99bde3d6350d38e9c033f39c6504  JJ64_HELD held=8/8 … rule=J64  exit=0   body prose + decision table assert the opposite of the measured outcomes; Demo outcomes byte-identical to 2ed8a5f
F2 ec9a8c62d0e980f061aaff81cdc5e2ca046a147b  JJ64_HELD held=8/8 … rule=J64  exit=0   Located quotes untouched; Mechanism section replaced by invented claims
F3 d0b69edbc3b32dfea21e475e5de2c98b4556a2a2  JJ64_HELD held=8/8 … rule=J64  exit=0   scripts/jj-seat-demo.sh = heredoc echo, `jj ` occurrences=0
F3b a51a1b2c55ce5848fc3b29008e5a9a24e8f30300  JJ64_HELD held=8/8 … rule=J64  exit=0   12 arbitrary keys k01=v1 …; every measured key dropped
F3c db5f7f3bd3a0947fdc18c728f1e7ecbda84e0043  JJ64_HELD held=8/8 … rule=J64  exit=0   12 keys, all values empty
F4 9c598db011dd48f6c65400555eeb703a7aced616  JJ64_HELD held=8/8 … rule=J64  exit=0   S199 capture = synthetic page, source-captures.json sha/bytes recomputed
F5 5296ffe7550d5b22d500e8d02ffa00b7761c0a2b  JJ64_HELD held=8/8 … rule=J64  exit=0   demo derives the values from the entry via the caller's cwd, run from the LANE root (the plan's own counting context)
C1 2b02eaf71293f974fcec73e1ecceeb2844e23670  JJ64_UNMET held=7/8 … | J6 MISS abandon_seat_head_seat_state:stated=fresh:live=stale   exit=1
C2 44d7c12d6ac0e92eeb6298de8242add4b68ce109  JJ64_UNMET held=6/8 … | J3 MISS S198:hash-or-size | J4 MISS S198:quote-not-in-capture(…)   exit=1
C3 8a0f24253e83bd95111d7aabbb270afed998082d  JJ64_UNMET held=7/8 … | J4 MISS S199:no-bullet   exit=1
```
What binds the demo bytes — nothing (finding -1):
```
$ node -e "const p=require('./.ufo/pins/counter-pins.json');console.log(p.pins.filter(x=>x.path.includes('demo')).length,p.pins.length)"
0 25
$ git grep -c '2d2edd43559c52912e674d89cf5d05c3988cbd1618bb98b82561691ca53182c3' 2ed8a5f8   → none
$ node -e "…readme-map.json…includes('jj-seat-demo')"                                      → false   (covered is a bare path list, no hashes)
probe:197  const r = spawnSync('bash', [join(T, 'scripts', 'jj-seat-demo.sh')], { encoding: 'utf8', timeout: 120000 });   // no cwd, no hash
```
Captures vs live bytes (the basis for the cheapest capture fix; all three equal today):
```
S198 live=5e2f7576… cap=5e2f7576… same=YES | S199 live=abbe47cf… cap=abbe47cf… same=YES | S200 live=947d0c56… cap=947d0c56… same=YES
```
Supplementary prototype `supp-prototype.mjs` (S-A demo-execution, S-B prose-value agreement, S-C pin==live) on the same commits:
```
honest PASS (jj-calls=57 missing-sub=none keys=21 lack=none empty-values=0 distinct=10 prose-tokens=19 conflicting=none)   exit=0
F1 FAIL S-B prose-disagrees-with-outcomes=abandon_seat_head_seat_state:stale/fresh!=stale;rewrite_treechange_seat_state:stale/fresh!=stale   exit=1
F2 PASS  exit=0      F3 FAIL S-A jj-calls=0 / missing-subcommands   F3b, F3c FAIL S-A (+missing-required-keys, +empty-values/distinct)
F4 FAIL S-C S199:capture!=live(20084826!=abbe47cf)   exit=1        C1 FAIL   C2 PASS (complementary to J3)   C3 PASS
```

## Findings

1. **K64R2CriticJjForge-1 — critical, fixable, outside the declared limit. J6 has no execution evidence and nothing pins the demo.** The plan calls the demo "re-runnable, hermetic" and the ground "demonstrated"; J6 only compares stdout with the entry's own `## Demo outcomes`. F3 (echo, zero `jj` calls), F3b/F3c (12 arbitrary or empty keys) and F5 (values read from the entry through the caller's cwd, from the lane root) each read 8/8. Reproduce: `node build/K64R2CriticJjForge/forge-c2.mjs /tmp/kumitate-r64/K64R2CriticJjForge/clone` then `node .ufo/waves/round-64/probe/jj64-probe.mjs <clone> d0b69edb…`. Cheapest supplementary check: run the demo with `PATH=<shim>/bin:$PATH` where the shim `jj` logs `$*` and execs the real binary, and require ≥20 logged calls, the six subcommands (`workspace add`, `abandon`, `squash`, `op log`, `workspace update-stale`, `workspace forget`), the ten plan-named outcome keys present and non-empty with ≥4 distinct values. Measured: honest PASS, F3/F3b/F3c FAIL (S-A). Impacted: C2's "demonstrated" ground, coverage family; no integer moves.
2. **-2 — high, fixable. J6 runs untrusted bytes in the caller's cwd.** `spawnSync` passes no `cwd`, so F3 wrote `demo-cwd.txt` into the caller dir, and F5 read `corpus/knowledge/jj-workspace-seat-containment.md` from the lane working tree when the probe ran from the lane root — the plan's own invocation. Reproduce: F3 with the probe's cwd = any directory; the file appears there. Fix: `cwd: T` (and a private `TMPDIR`). Note the honest v2 demo is hermetic, so this is a counter defect, not a demo defect.
3. **-3 — high, fixable. J6's 12-key floor is information-free.** `- k01=v1 … - k12=v12` with an echoing demo reads 8/8 (F3b); twelve empty values read 8/8 (F3c). Reproduce: `node …/jj64-probe.mjs <clone> a51a1b2c…` and `… db5f7f3b…`. Fix: require the plan's named key set, reject empty values, require ≥4 distinct values (P-2/P-3 of wave 1, still open at this revision).
4. **-4 — high, fixable, machine-checkable. The entry may contradict itself.** F1 flips three prose sentences and the decision-table row to the opposite of the measured outcomes and still reads 8/8 (`Demo outcomes` untouched). Reproduce: `node …/jj64-probe.mjs <clone> 9949473c…`. Cheapest check: every `key=value` token outside `## Demo outcomes` must equal the stated value (S-B; honest has 19 tokens, 0 conflicts, F1 fails). This is not the plan's "well-grounded wrong" limit — it is internal inconsistency.
5. **-5 — high, fixable. J3 is self-referential: the pin is written by the same revision.** F4 replaces the S199 capture with a synthetic page holding the three quoted sentences and recomputes `sha256`/`bytes`; J3 passes, J4 passes, J5 passes because the real page still holds the quotes. Reproduce: `node …/jj64-probe.mjs <clone> 9c598db0…`. Cheapest check: `pin.sha256 === sha256(fresh fetch of the row URL)` — measured equal for S198/S199/S200 today, so it passes on the honest tree and fails F4 (S-C). It also catches an honest capture going stale, which is the intended fail-closed direction.
6. **-6 — medium, inside the declared limit. Invented body prose survives (F2).** The Mechanism section can assert a private per-workspace op log, a filesystem sandbox and "a seat never goes stale" — contradicted by the entry's own `seat_snapshot_in_shared_op_log=1`, `absolute_path_write_seen_in_default=1` and `abandon_seat_head_seat_state=stale` — and read 8/8. Reproduce: `node …/jj64-probe.mjs <clone> ec9a8c62…`. The obvious heuristic (every Mechanism paragraph must share an 8-word window with a located quote or capture) **false-positived on the honest `Version skew` paragraph** (measured, `SUPP_SD=1`), so I do not recommend it; the residual needs the wave-2 adversarial reviewer, as the plan's stated limit says.
7. **-7 — medium, a real defect in the landed tree (not a forgery). Duplicate authority for one measured value.** `corpus/lessons/round-64.md:63` records the rejected staged finding as "re-grounded as `seat_snapshot_in_shared_op_log=2` on S198"; the entry (`:87`), the amendment (`agent-isolation-substrates.md:318`) and the honest demo all say `=1`. The counter checks only the entry, so 8/8 while the round's gate record carries the wrong number. Reproduce: `grep -n 'seat_snapshot_in_shared_op_log=2' corpus/lessons/round-64.md` and `grep 'seat_snapshot_in_shared_op_log' <honest demo output>` → `JJ_SEAT: seat_snapshot_in_shared_op_log=1`. Fix: S-B extended to `corpus/lessons/round-64.md` and the amendment tail; the L1 corrects the lesson value.
8. **-8 — low, latent. J2 still accepts rows opened by earlier rounds.** At the base `6825a514`, `S195` and `S196` already carry `opened 2026-10-25` (verified from `git show BASE:corpus/SOURCES.md`), so a forger can re-point `used-by` at the new entry without opening ground. The honest entry uses the genuinely new S198–S200, so this is latent here; wave-1's -2 stands unchanged. Cheapest check: every cited id absent from `BASE:corpus/SOURCES.md` (fail-closed if the base registry is unreadable).
9. **-9 — calibration, positive.** The counter is not toothless at this revision: J6 refuses a stated value that disagrees with the live demo (C1), J3+J4 refuse a capture edited without its pin (C2), J4 refuses a cited row with no bullet (C3). The seven HELD forgeries all stay *inside* the checks — none requires breaking one.

**Smallest safe correction, stated as a constraint.** The counter is frozen and its sha256 is pinned in `.ufo/pins/counter-pins.json`; a patched counter would break its own pin and the plan's "a rule changed after any seat scored is not this claim's rule". So the three strengthenings that pass the honest tree and fail F1/F3/F3b/F3c/F4 (S-A, S-B, S-C) belong in the wave-2 **supplementary checker** (`K64R2ExecSupplementaryC2`, messaged), and in a next-round counter revision (J64 v2) with a fresh pin; they must never be retro-fitted into J64 v1's verdict.

## Artifacts

- `build/K64R2CriticJjForge/forge-c2.mjs` — regenerates F1, F2, F3, F3b, F3c, F4, C1–C3 in a clone (never the lane; explicit `-C`; fixture identity).
- `build/K64R2CriticJjForge/supp-prototype.mjs` — S-A/S-B/S-C prototype (S-D behind `SUPP_SD=1`, rejected by measurement).
- `build/K64R2CriticJjForge/verdicts.json`, `supp-verdicts.txt`, `honest-demo.out`, `forged-demo-F3.sh.txt`, `forged-demo-F5.sh.txt`.
- No files added under `scripts/`, `corpus/`, `SCORECARD.md`, `LOG.md`, `PROVINCE.md`, `SKILL.md`, `.ufo/pins/`; 2 script files added to my build dir (gate budget 15). Tooling: nothing installed, no package transaction.

## Limits

- Cross-check, peer-reported and not re-run by me: `K64R2ExecSupplementaryC2`'s `build/K64R2ExecSupplementaryC2/supplementary-c2.mjs` passes 2ed8a5f 6/6 and fails F1/A/D/F5 (4/6, 4/6, 3/6, 4/6) while all four still read 8/8 on the frozen counter; it dropped the `.jj`-under-TMPDIR arm for the reason recorded below, and it treats the `lessons/round-64.md:63` value conflict as an observation, not an arm, because J64 does not cover the lesson. Rebuilt from my generator in its own clone it also fails the two families I flagged: F3b (peer rev `d9818a5b`) and F3c (`2ac6be84`) read `JJ64_HELD held=8/8` on the frozen counter and 4/6 on the checker (S2 prose-key-not-in-demo + S4 demo-pin mismatch, `demo-keys=12`, `jj-calls=0`); its demo pin constant `2d2edd43559c5291…` equals the `scripts/jj-seat-demo.sh` sha256 I measured at 2ed8a5f. F2 (invented prose) stays inside the plan's declared limit. Caveat on both new pin arms: a legitimate demo or capture change now fails closed and needs a documented re-pin receipt, or the checker becomes a freeze on the evidence it is meant to verify.
- Did not attack C1 (`receipt64-probe.mjs`) or the receipt controls; not this seat's scope.
- Did not re-test the attacker-hosted row URL (wave-1 F3) or the wrong-page capture (wave-1 D); -5's fix is the same shape and my S-C measurement covers the self-authored-capture half only.
- S-A counts jj invocations, not their semantics: a demo that calls `jj` 20 times and still echoes values would pass S-A; binding behaviour to each key needs per-key oracles, which I did not design.
- My jj-dir-in-private-TMPDIR probe false-positived on the honest demo (its EXIT trap removes the fixtures); it is informational only and I dropped it from S-A.
- S-C would fail the honest tree once a cited page changes bytes; it is fail-closed by design but needs a re-pin receipt path before it lands as a gate.
- All counter runs used the clone at the same revision, not the lane itself (rev-pinned, so the archived bytes are identical); the plan's counting command from the lane root was exercised only for F5, read-only, and left no lane file.
