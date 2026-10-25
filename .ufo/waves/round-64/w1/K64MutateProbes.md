VERDICT: Both frozen counters are mutant-tested (41 C1 + 39 C2 single-literal mutants, two C2 revisions); C1 as frozen can never read HELD because P2's `>= 8 distinct finding ids` floor exceeds both the committed controls (6) and the tool's reachable id ceiling (6 of 7 — HASH_ORPHAN is unreachable under the P2 harness), C2's do-nothing control is blind to 25/39 mutants and needs the honest fixture (which the pristine counter independently confirms at 8/8), and two fixture-side forgeries (lying demo stub, demoted frontier line) also read 8/8 at the frozen counter — reported, not patched.

## Evidence

Setup (all read-only against lane/fleet; commits only inside fixture clones):
- `git clone -q --no-hardlinks <lane> /tmp/kumitate-r64/K64MutateProbes/c1clone && git -C … checkout -q --detach dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` → `toplevel-ok`, HEAD `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (parent = base `6825a514…`).
- Do-nothing fixture rebuilt per frozen `probe/jj-donothing-control.sh` recipe → clone `/tmp/kumitate-r64/K64MutateProbes/donothing/c` rev `981953cc1355d12a71f9cba039cda5aa9bf8c9e4`; frozen control script rerun reproduces the frozen line modulo rev: `JJ64_UNMET held=1/8 … rev=9a36a3a4a… | J1 MISS trio source=true verified-at=false recheck=true | … | J7 MISS census-exit=0 province-names-entry=true readme-map-clean=false` (matches frozen `base/jj64-donothing.txt` reason-for-reason).
- Pristine counter copies: sha256 `receipt64-probe.mjs` = `34b3b308fab6…`, `jj64-probe.mjs` = `157be0acaa79…`, byte-identical to `.ufo/waves/round-64/probe/*` at start and end.

C1 honest score at the tool-present revision (task predicted P1..P4 pass — actual):
```
$ node build/K64MutateProbes/work/receipt64-probe.mjs /tmp/kumitate-r64/K64MutateProbes/c1clone dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef
RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6 | P5 MISS report-not-given   (exit=1)
```

C2 honest scores (sibling fixture; first sweep at `…/build/K64ExecJjHonestFixture/fixture-root/jj64-honest.BaGxJ8lr` @ `f1ef90fcba0de3c759e6571cb6fd29f0286b2f59` — that clone was later moved/deleted by its owner — then re-verified in full at the corrected, reproducible fixture `/tmp/kumitate-r64/K64ExecJjHonestFixture/fixture-root/jj64-honest.xCwMMDYu` @ `9a41cbc2aa4dce232f15d303fd9abcc5bd726856`; own `python3 -m http.server 8642` mirror, live J5 on; **0 mismatches across all 39 mutants between the two revs**, `evidence/c2-honest-rev-agreement.txt`):
```
JJ64_HELD held=8/8 checks=8 rev=f1ef90fcba0de3c759e6571cb6fd29f0286b2f59 rule=J64   (exit=0)
JJ64_HELD held=8/8 checks=8 rev=9a41cbc2aa4dce232f15d303fd9abcc5bd726856 rule=J64   (exit=0)
```

Forge probes (fixture-side mutants at the frozen counter, scratch clones of `9a41cbc2`, live J5 under my mirror; details in finding -8):
```
JJ64_HELD held=8/8 checks=8 rev=d346c87a3eab42168e9ebcdf7404b10fa8627da0 rule=J64   (exit=0)  # demo stubbed to echo stated outcomes
JJ64_HELD held=8/8 checks=8 rev=54f57ecc29f554cda106be5a76f3fbf5af328d72 rule=J64   (exit=0)  # frontier line under ### Adjacent
```

Sweep results (full table `evidence/mutants.csv`, raw JSONs + logs in `evidence/`):
- C1 (41 mutants): **25 killed, 16 survivors**.
- C2 @ do-nothing (39): **14 killed, 24 survivors, 1 flaky** (`j6-timeout-1ms`: 1 ms race between demo-absent exit 127 and SIGTERM → `demo-exit=null`; flip observed between two runs).
- C2 @ honest (39): **28 killed, 11 survivors — identical at both honest revs** (`f1ef90fc`, then `9a41cbc2`); 8 survive at *both* revisions: `base-shortprefix, j2-url-scheme, j4-bullets-5, j4-words-24, j4-dash-ascii, j6-stated-13, j6-stated-1, norm-squeeze`.
- Representative kills: `base-lastchar` → `J8 MISS file-unreadable` (7/8 honest, 0/8 do-nothing); `j3-sha512` → `J3 MISS S198:hash-or-size,…` 6/8; `j7-census-exit-1` → `J7 MISS census-exit=0 …` 7/8 honest (survivor at do-nothing — masked by readme-map DRIFT); `held-7` → `JJ64_UNMET held=8/8 … exit=1` honest.
- Restoration: driver printed `PRISTINE RESTORED 34b3b308…` / `157be0ac…` after every sweep; probe sha256s re-checked unchanged; no commits by me into either sibling fixture clone (first clone's HEAD read `f1ef90fc…` before its owner moved it; corrected clone read `9a41cbc2…` after my sweep); mirrors shut down after each sweep.

## Findings

1. **K64MutateProbes-1 (HIGH, frozen counter defect):** P2's `seen.size < 8` floor is unsatisfiable — the tool emits 7 ids, but HASH_ORPHAN requires `git cat-file` in the *case* lane dir (tool line 92–94) and archive-extracted case dirs have no `.git`, so the reachable ceiling is 6 = exactly what the 16 controls exercise. C1 can never read HELD this round; kill rule then fails the claim as declared. Kill-direction proof: mutant `seen.size < 8 → < 6` flips P2 to pass (`held=4/5`). Repro: `node .ufo/waves/round-64/probe/receipt64-probe.mjs <clone-of-lane> dd1a3e6f…`. Analysis + R64-v2 proposals in `control-drafts/P2-id-floor-analysis.md`.
2. **K64MutateProbes-2 (HIGH, frozen control-set defect):** the round's declared honest score "P1..P4 pass" is false at dd1a3e6f: actual `held=3/5`, `P2 MISS ids=6`. The committed controls meet plan-P2's case-count (16 ≥ 14), clean ≥ 2, honest-case and all expects, but only 6 distinct ids vs the plan's ">= 8". Report-only; fixing needs L1 (controls or rule v2), never a seat edit.
3. **K64MutateProbes-3 (LOW):** C1's P5 internals are untestable without `--report` — survivors `opt-report-typo` (`opt('--repork')`) and `p5-exit-1` leave the verdict byte-identical; likewise `held-boundary-4` (`held === 4 ? 'HELD'`) while held=3. The HELD boundary itself *is* enforced where testable: C2's `held-7` mutant flips honest 8/8 HELD → UNMET exit 1.
4. **K64MutateProbes-4 (LOW):** P4's stub literals are not load-bearing: `stub-clean-text2` (stub prints `PAS`), `stub-drift-exit0` (DRIFT stub exits 0), and `p4-every-to-some` (`fails.every` → `fails.some`) all leave the verdict identical because both stubs fail the harness for multiple independent reasons. Patch proposal (build dir): require `p2(stubClean).ok === false && p3(stubClean).ok === false` *and* `p2(stubDrift).ok === false` with the clean-stub passing c0-honest only — today a stub that fails everything would also satisfy P4.
5. **K64MutateProbes-5 (LOW, calibration):** C2's threshold floors are upward-invisible at the honest fixture: `<4→<5` bullets (entry has ≥5), `<12→<13` keys (≥13), `>25→>24` words (all ≤24), `[—-]→[—]` (all quotes use em-dash). Future honest fixtures should sit exactly on floors (4 bullets, 12 keys, one 25-word quote, one ASCII-dash bullet) to keep the frozen floors testable.
6. **K64MutateProbes-6 (LOW, counter-vs-plan wording):** J7's `/frontier|band|ground|first entry/i` accepts a PROVINCE line naming the entry without the word "frontier" — at the honest rev the `frontier-typo` mutant (regex missing `frontier`) still reads 8/8 HELD because another alternative matches. The plan says "names the entry path on a frontier line"; the frozen counter reads a wider line set. Reported, not patched.
7. **K64MutateProbes-7 (INFO, harness calibration):** the do-nothing control alone would have passed 24/39 C2 mutants (61% survivor rate); the honest fixture cuts survivors to 11 (28 killed) and unmasks three do-nothing-only kills (`j2-ids-1`, `j7-frontier-typo`, `final-exit-2`). C2 falsification is only meaningful at a revision with rows+captures+demo. `norm-squeeze` (`\s+`→`''`) surviving at honest shows no quote needs whitespace normalisation — acceptable.
8. **K64MutateProbes-8 (HIGH, frozen counter holes, fixture-side mutants; hypothesis credited to K64ExecJjHonestFixture, reproduced by me):** two forgeries read `JJ64_HELD held=8/8 … exit=0` at the frozen counter (scratch clones of `9a41cbc2`, one commit each, live J5 under my mirror):
   - (a) `scripts/jj-seat-demo.sh` replaced by a stub echoing the entry's own 15 stated outcomes → rev `d346c87a3eab42168e9ebcdf7404b10fa8627da0`: `JJ64_HELD held=8/8 checks=8 rev=d346c87a… rule=J64` exit 0. J6 runs the measured revision's own demo script, so a demo that lies in exactly the entry's words is undetectable; the counter never pins the demo script's bytes.
   - (b) the PROVINCE frontier line moved under a `### Adjacent` heading → rev `54f57ecc29f554cda106be5a76f3fbf5af328d72`: `JJ64_HELD held=8/8 checks=8 rev=54f57ecc… rule=J64` exit 0. J7 scans every line of PROVINCE.md, so section placement is unmeasured.
   L1-level fix direction (peer's `build/K64ExecJjHonestFixture/proposed-jj64-probe.diff`, which leaves the honest fixture at 8/8 per the peer's own receipts `out/proposed-index.txt`, `out/proposed-honest.txt` — unverified by me): pin the demo script sha256 into the entry/J6 (`J6 MISS demo-script-not-pinned`) and scope the J7 province scan to frontier lines (`province-names-entry=false`). Peer-declared cost the L1 must disclose: the pin makes any later legitimate `jj-seat-demo.sh` edit turn J6 red until re-frozen (env override `JJ64_DEMO_SHA` exists), i.e. a declared ratchet step, not a silent one. Reported, not patched — the counter is frozen for the round.

## Artifacts

- Report/build root: `.ufo/waves/round-64/build/K64MutateProbes/`
- `work/receipt64-probe.mjs`, `work/jj64-probe.mjs` — pristine copies (sha256 match frozen bytes)
- `work/mutants/c1/*.mjs` (41), `work/mutants/c2/*.mjs` (39) — applied mutants
- `evidence/mutants.csv` — full table (id, mutation, changed-verdict? per revision, held, classification)
- `evidence/results-c1.json`, `results-c1-extra.json`, `results-c2-donothing.json`, `results-c2-honest.json` (@ f1ef90fc), `results-c2-honest-9a41cbc2.json`, `c2-honest-rev-agreement.txt`, `c1-baseline.txt`, `c2-baseline.txt`, `c1-main-rerun.log`, `c2-donothing-rerun.log`
- `control-drafts/P2-id-floor-analysis.md` — unreachable-floor analysis + described fixtures (`c16-lane-hash-token`, `c17-shonen-five-boxes`) + R64-v2 options
- Scratch (disposable): `/tmp/kumitate-r64/K64MutateProbes/` (c1clone @ dd1a3e6f, donothing/c @ 981953cc, forgeA @ d346c87a + `stated.txt`, forgeB @ 54f57ecc, driver.mjs, specs-*.json)

## Limits

- 41 + 39 single-literal mutants, not every literal site; selection follows the tasking list (thresholds, regexes, booleans, exit codes, P4 stubs, BASE, OPENED) plus path/constant probes.
- C1 judged at one revision (dd1a3e6f, no `--report`): no round-64 report exists yet, so P5's end-to-end CLEAN path is untested; P5-internal survivors may die once a real report is measured.
- C2 honest results depend on the sibling's uncommitted fixture: first verified at `f1ef90fc` (clone since moved), then re-verified mutant-for-mutant at the corrected, reproducible `9a41cbc2` (0/39 mismatches, `evidence/c2-honest-rev-agreement.txt`); I verified 8/8 independently under my own mirror both times but the fixture is a build artifact, not lane history. J5 hit only `127.0.0.1:8642` (fixture-pinned URLs); no external fetches. My mirror was shut down after each sweep (port 8642 released for the fixture owner's wrapper).
- Did not rerun the C1 sweep under a passing-P2 configuration (compounding mutants) and did not mutate `sources-census.sh`/`readme-map.mjs` internals (outside the counters).
- Forge probes (-8) ran only the frozen counter against scratch fixture commits (commits use the fixture identity, inside my scratch clones); the peer's `proposed-jj64-probe.diff` was read, not applied or verified — its claims (both fixes leave honest at 8/8) are the peer's, not mine.
- No tools installed or upgraded (preinstalled node v24.21.0, git, jj 0.45.1, python3); no frozen file, sibling source, or lane/fleet state modified.
