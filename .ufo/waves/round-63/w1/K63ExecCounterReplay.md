VERDICT: Both frozen counters replay deterministically at the freeze commit (`TOPOLOGY63_UNMET held=1/7`, `INLINE63_UNMET held=1/6`, 6/6 runs identical, base receipts byte-identical) and the topology controls regenerate 12/12 AS-EXPECTED, but the inline control `forged-no-sessions` is **not reproducible from committed bytes** (gate exits 2 SESSIONS_ROOT_ABSENT, `expect`/receipts say 1 NOT_A_DISPATCH), so arm I3 is MISS at the freeze commit and C1 cannot reach 6/6 as declared without a fixture repair.

## Evidence

Sandbox (per assignment, never committed in):
`D=$(mktemp -d) && git clone -q <lane> "$D"/lane && git -C "$D"/lane rev-parse --show-toplevel` → `/tmp/tmp.sZUZWUW7Fl/lane` (== `$D/lane`); `git -C "$D"/lane checkout -q --detach b38a206…` → HEAD `b38a2065ab8ac5b198f6569b9013d04411c3d40d`, `git status --porcelain` = 0 lines. Lane HEAD is also `b38a2065…`; `git -C <lane> diff --stat b38a2065… HEAD -- .ufo/waves/round-63/{probe,controls,base,plan.md}` empty → the replay reads the bytes the lane carries today.

1) Frozen probes, three runs each (logs: `build/K63ExecCounterReplay/{topology,inline}-probe-3x.log`):
```
run1 exit=1 wall_ms=624 :: TOPOLOGY63_UNMET held=1/7 checks=7 rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d rule=T63 | T1 MISS entry-absent | T2 MISS no-entry | T3 MISS no-rows | T4 MISS bullets=0 | T5 MISS no-bullets | T7 MISS province-names-entry=false readme-map-clean=false
run2 exit=1 wall_ms=544 :: (identical)
run3 exit=1 wall_ms=537 :: (identical)
run1 exit=1 wall_ms=785 :: INLINE63_UNMET held=1/6 checks=6 rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d rule=I63 | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH | I5 MISS row-absent | I6 MISS tip-receipt-absent
run2 exit=1 wall_ms=847 :: (identical)   run3 exit=1 wall_ms=684 :: (identical)
```
A further 3 runs from cwd `/tmp` gave the same two lines (cwd-independent); the clone worktree stayed clean and no `/tmp/{topology63,inline63}.*` dirs leaked.

2) Base receipts reproduce byte-for-byte at `dfa6fca8f362e9c962f5b940025a2619380b759b`:
```
TOPOLOGY63_UNMET held=1/7 … rev=dfa6fca8… | T1 MISS entry-absent | T2 MISS no-entry | T3 MISS no-rows | T4 MISS bullets=0 | T5 MISS no-bullets | T7 MISS province-names-entry=false readme-map-clean=false
INLINE63_UNMET held=0/6 … rev=dfa6fca8… | I1 MISS tool-absent | I2 MISS no-committed-wave-results | I4 MISS no-committed-wave-results | I3 MISS tool-absent;cases=0<10;no-honest-case | I5 MISS row-absent | I6 MISS tip-receipt-absent
```
`diff` against `base/topology63-base.txt` + `base/inline63-base.txt`: no differences (both exit=1).

3) `make-topology-controls.mjs "$D"/lane dfa6fca8… <build>/topology-controls`, three independent runs: exit=0 in 12 s / 13 s / 10 s. All 12 rows `AS-EXPECTED` (`c0-honest` `TOPOLOGY63_HELD held=7/7`, `f1`…`f11` each `UNMET` naming its arm), `honest-bullets=6`. `sed -E 's/rev=[0-9a-f]+//g'` diff frozen `controls/topology/summary.txt` vs replay1/2/3: identical; all 13 per-case files also identical modulo `rev=` (`per-case-diff-failures=0`).

4) Inline controls, 14 committed cases through the gate at `b38a2065…`, three runs (255/259/262 ms, runs identical; `build/K63ExecCounterReplay/inline-run{1,2,3}.txt`): 13/14 rows equal `controls/inline-receipts.txt`; the divergent row is
```
receipt:  forged-no-sessions exit=1 want=1 NOT_A_DISPATCH | INLINE_DISPATCH: DRIFT (seats=3 sessions=0 done=0 reports=3 dead=0)
replay :  forged-no-sessions exit=2 want=1 gotid=SESSIONS_ROOT_ABSENT wantid=NOT_A_DISPATCH :: FINDING SESSIONS_ROOT_ABSENT INLINE_DISPATCH: FAIL-CLOSED contract=kumitate-inline-dispatch-evidence-v1
```
Gate selftest at the freeze commit: `INLINE_DISPATCH_SELFTEST: PASS (25/25)`, exit=0 (I1's `N>=25` arm holds).

5) Cause and repair test (scratch only): the fixture ships no `sessions/` directory — `git ls-tree -r --name-only b38a2065… -- …/forged-no-sessions` lists only `dispatcher.log`, `expect`, `lane/…` (git cannot commit the empty `sessions/orch/` that `make-inline-controls.mjs:41` created). Re-running the gate on a copy with `sessions/orch/` restored (empty, or holding `.gitkeep`) yields exit=1 and the receipt's exact line:
```
INLINE_DISPATCH: DRIFT (seats=3 sessions=0 done=0 reports=3 dead=0) / FINDING NOT_A_DISPATCH   exit=1
```
Probe re-run on a fixture repo (`git init` in `mktemp -d`, archive of `b38a2065…` + that one marker, fixture-local identity, `rev=50ac50ab0e26cfe61c83d3daa1bd3428bdf541c2`): `INLINE63_UNMET held=2/6 … | I2 MISS … | I4 MISS … | I5 MISS row-absent | I6 MISS tip-receipt-absent` — I3 leaves the MISS list. So the missing empty dir is the sole blocker of I3.

6) T5 live arm: fixture repo at `dfa6fca8…` + 6 capture-derived bullets, probe run 3× → `TOPOLOGY63_HELD held=7/7` each (wall 1926/716/746 ms; first run cold). Unreachable source URL (`http://127.0.0.1:9/dead` in the S109 source cell) → `TOPOLOGY63_UNMET held=6/7 … | T5 MISS S109:live-unreachable`, exit=1, 1847 ms. Non-routable URL (`http://10.255.255.1/dead`) → same verdict, **wall 274 s** for that one row.

## Findings

**K63ExecCounterReplay-1 — HIGH — frozen inline control not reproducible from committed bytes; I3 MISS at freeze.**
Attacks: C1's frozen predicate I3 ("every case exits as its `expect` file names") and the plan's "controls committed before data" claim. `forged-no-sessions/expect` = `1 / NOT_A_DISPATCH`, but the committed fixture has no `sessions/` dir, and `scripts/inline-dispatch-evidence.mjs:202` fail-closes (`exit 2`, `SESSIONS_ROOT_ABSENT`) when the root is absent. `inline63-probe.mjs:88-113` therefore prints `I3 MISS forged-no-sessions:exit=2 want=1 NOT_A_DISPATCH` on every run, so `INLINE63_HELD` is unreachable at `b38a2065…` regardless of later wave work. Proposed repair (L1's to apply; not applied by me): commit a marker so the empty root survives — `mkdir -p .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/orch && : > …/sessions/orch/.gitkeep` — which I verified restores exit=1 with the receipt's exact DRIFT line, keeps the `NOT_A_DISPATCH` arm (the weaker alternative, changing `expect` to `2 / SESSIONS_ROOT_ABSENT`, would drop that arm and contradicts the frozen rule). Repro: `node .ufo/waves/round-63/probe/inline63-probe.mjs <clone> b38a2065ab8ac5b198f6569b9013d04411c3d40d`.

**K63ExecCounterReplay-2 — MEDIUM — the inline receipts certify a worktree, not committed bytes, and have no committed generator.**
Attacks: the evidentiary value of `controls/inline-receipts.txt`. Its header says "worktree mode"; the run that produced it saw the empty `sessions/orch/` dir that the commit then lost, which is exactly why 1/14 rows disagree with a committed-bytes replay. Its `want=` column is copied from the `expect` files (circular on the exit code), and no committed script writes it (`grep -rn inline-receipts` finds only seat reports/build tools), unlike `make-topology-controls.mjs`, which writes `summary.txt` from `git archive`-backed fixtures. Proposed repair: add a `probe/make-inline-receipts.mjs` that extracts `git archive <rev>`, runs the gate on each case in that archive, and writes the receipt (verdicts, exit codes, DRIFT lines), then regenerate the file from the repaired fixture. Repro: `for c in <lane>/.ufo/waves/round-63/controls/inline/*/; do node <lane>/scripts/inline-dispatch-evidence.mjs --root "$c/lane" --round 7 --wave w1 --sessions-root "$c/sessions" --dispatcher-log "$c/dispatcher.log"; echo "exit=$?"; done`.

**K63ExecCounterReplay-3 — LOW — T5's live arm has no global timeout and makes the verdict network-dependent.**
Attacks: operability of the C2 counting command and its run-to-run stability. `topology63-probe.mjs:172` uses `curl -fsSL --max-time 90 --retry 2` per cited row and nothing bounds the whole probe; a non-routable URL cost **274 s** for one row (measured), so three blackholed rows stall the counter ~14 min, and a transient outage flips a would-be `HELD 7/7` to `UNMET … T5 MISS …:live-unreachable` (measured at 1.85 s for a refused port). The arm is honest (it fails closed), but the L1 should run it with a wall budget or record the network state alongside the verdict. Repro: point one cited row's source cell at `http://10.255.255.1/dead` in a fixture repo and run `node .ufo/waves/round-63/probe/topology63-probe.mjs <fixture> <rev> --entry corpus/knowledge/bounded-redelivery-budgets.md --opened 2026-10-24`.

**K63ExecCounterReplay-4 — LOW — the topology control fixtures are not committed; only the receipt is.**
Attacks: re-derivability of `controls/topology/summary.txt`. `make-topology-controls.mjs` builds a throwaway repo and `rmSync`s it, and its honest bullets are chosen by matching committed captures against **live** fetches, so the receipt cannot be regenerated offline (`--no-live` forces `T5 MISS`). Today this is benign — three regenerations agreed exactly (modulo `rev=`) — but a source that disappears between freeze and review makes the receipt unverifiable rather than falsified. Proposed (optional): commit the chosen bullets (they are 6 fixed sentences) or the fixture commits' bundles next to the receipt.

## Artifacts

- `.ufo/waves/round-63/build/K63ExecCounterReplay/topology-controls/` — 13 files (regenerated `summary.txt` + 12 per-case receipts), identical to the frozen set modulo `rev=`.
- `.ufo/waves/round-63/build/K63ExecCounterReplay/{topology-probe-3x.log,inline-probe-3x.log,inline-replay.txt,inline-run1.txt,inline-run2.txt,inline-run3.txt,topo-gen.txt}`.
- `.ufo/waves/round-63/w1/K63ExecCounterReplay.md` (this report). Scratch: `/tmp/kumitate-r63/K63ExecCounterReplay/` (`mkbullets.mjs`, run logs).
- Sandbox clone `/tmp/tmp.sZUZWUW7Fl` and fixture repos `/tmp/tmp.Zeiv3o91wt`, `/tmp/tmp.ECInFJHAK7`, `/tmp/kumitate-r63/K63ExecCounterReplay/fixprobe` — deleted after the runs (no commit was made in the clone; the only commits were inside `mktemp -d` fixture repos with fixture-local `-c user.name/email`).

## Limits

- I2 and I4 are in-flight by design (no committed `<wave>-results.json` yet): they are MISS now and I did not evaluate what they will do on the real waves. I5/I6 likewise.
- No commit moved between the freeze commit and my replay (`lane HEAD == b38a2065…`), so this says nothing about bytes an integration may add later.
- T5 was exercised on 3 source rows only (S109/S110/S111); the C2 entry's real rows do not exist yet, so its live behaviour on those URLs is unmeasured.
- I did not run `sources-census.sh` beyond what the probe invokes, did not mutation-test the probes (a sibling seat owns that), and did not inspect the host session store or dispatcher log (outside this seat's scope).
- No tools were installed; no pacman transaction was attempted.
