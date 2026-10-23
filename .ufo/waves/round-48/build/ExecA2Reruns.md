RESULT ExecA2Reruns verdict=REPAIRED

# ExecA2Reruns — routed defect R47-1 (round-47 re-runs existed only as chat quotes)

Round 48, wave 1 (`build`). Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, frozen tip `fe3d45b`.
Lane tip at read time: `fe3d45bf929246915c8c0de5f7f8682b5015b22c` (branch `master`, HEAD detached at read time —
read-only; no git write was made in the lane or the fleet repo).

## What was asked and what was done

R47-1 (`corpus/lessons/round-47-verifier-spotcheck.md` §7, R47-1): the round-47 re-runs 3/5, 3/5, 4/5 that decided
C1 exist only as IRC quotations (`corpus/lessons/round-47.md:105-107`); the seats were cancelled and no receipt was
committed. The fix is commit-ready receipts: the round-47 **A2 counter run UNCHANGED**, three times concurrently, on a
rev whose `scripts/` equal `269dadb6`'s.

Done exactly as specified: the frozen A2 counter was run three times concurrently, each invocation reading the lane
read-only through `git archive` (no clone, no lane write), each invocation writing one receipt under
`.ufo/waves/round-48/build/`.

## 0. Preconditions verified before running

**Counter byte-identical to the committed frozen one** (required: "run the round-47 A2 counter UNCHANGED").

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show e42eba65:.ufo/waves/round-47/probe/caproute-probe.mjs | sha256sum
1b438de2113078b2c908ac3abd332478d278a644c95b045119ac3fbf03c0a057  -
$ sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
1b438de2113078b2c908ac3abd332478d278a644c95b045119ac3fbf03c0a057  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs
```

Identical. The probe file was not touched by this seat (both digests are also echoed inside each receipt as
`probe_sha256` / `probe_git_sha256`).

**`scripts/` identical between `269dadb6` and `f00cf278`** (required).

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff --stat 269dadb6 f00cf278 -- scripts
(no output; exit 0)
```

Empty diffstat — `scripts/` is byte-identical between the round-47 C1 commit `269dadb6` and the rev scored here
`f00cf278` (the whole-tree diff `269dadb6..f00cf278` is 45 files of `.ufo/`, `LOG.md`, `SCORECARD.md`, `corpus/` — no
`scripts/` entry). So a score at `f00cf278` is a score of the same candidate code that round 47 scored at `269dadb6`.

**Environment**: `node v24.21.0`, `/usr/bin/strace`, `/usr/bin/bwrap`, `/usr/bin/systemd-run`, `/usr/bin/git` all
present; `df -h /fast` → `/dev/nvme1n1p2 804G 734G 70G 92% /fast` (70 GB free, ≥ 20 GB required). No tool was installed
or updated by this seat (none needed).

## 1. Exact commands

Three concurrent invocations, started in the same shell, one per receipt:

```
$ cd /fast/scratch/hyaku/kumitate-r48/seats/w1-ExecA2Reruns
$ for k in 1 2 3; do ./run-k.sh $k & done; wait
```

where `run-k.sh` (this seat's own wrapper, in the seat dir, not in the lane) is exactly:

```
timeout -k 10 3000 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/probe/caproute-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin f00cf278 > /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/a2-rerun-<k>.txt 2>&1
echo "exit=$? start=… end=… load1=…" >> …
```

Every run is bounded (`timeout -k 10 3000` ≤ 3000 s) and each invocation took ~3 min 46 s–3 min 50 s. All three
started at the same second, `2026-10-23T11:52:41Z`, and overlapped to the end — they were genuinely concurrent.

## 2. Receipts (verbatim, complete)

### `.ufo/waves/round-48/build/a2-rerun-1.txt` (sha256 `2aafd27d8440a38c15246fc3dab456da3fbcb2be349833d23f589efa8aa79630`)

```
SITE K488 gate=kimi-census label=ROUTED_HELD n=52 base_n=53 capped=52 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0
SITE SC549 gate=sources-check label=ROUTED_HELD n=39 base_n=42 capped=39 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0
SITE SC859 gate=sources-check label=ROUTED_HELD n=1 base_n=1 capped=1 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0
SITE CC879 gate=claims-check label=ROUTED_MISS n=46 base_n=46 capped=45 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_cap_run_ancestor
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=104 base_n=106 capped=99 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor,no_capped_scope_ancestor
CAPROUTE_PROBE rev=f00cf278a5ab57e87b18418fc972be9f893f65da base=0bd8be60 held=3/5 rule=A2
exit=1 start=2026-10-23T11:52:41Z end=2026-10-23T11:56:29Z load1_start=22.06 load1_end=54.49
```

### `.ufo/waves/round-48/build/a2-rerun-2.txt` (sha256 `e77a919d299bbe58e490331bccf72c40c375220b0fa02e78362c2ef58016f1ba`)

```
SITE K488 gate=kimi-census label=ROUTED_HELD n=53 base_n=53 capped=53 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0
SITE SC549 gate=sources-check label=ROUTED_MISS n=41 base_n=42 capped=39 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0 reason=no_cap_run_ancestor
SITE SC859 gate=sources-check label=ROUTED_HELD n=1 base_n=1 capped=1 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0
SITE CC879 gate=claims-check label=ROUTED_HELD n=43 base_n=46 capped=43 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0
SITE AT802 gate=anchor-truth label=ROUTED_MISS n=102 base_n=106 capped=100 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0 reason=no_cap_run_ancestor
CAPROUTE_PROBE rev=f00cf278a5ab57e87b18418fc972be9f893f65da base=0bd8be60 held=3/5 rule=A2
exit=1 start=2026-10-23T11:52:41Z end=2026-10-23T11:56:27Z load1_start=22.06 load1_end=54.97
```

### `.ufo/waves/round-48/build/a2-rerun-3.txt` (sha256 `9040c45ec356ebba9a501a62d095e3a9b7234d51c36684d0a5c1449202c63507`)

```
SITE K488 gate=kimi-census label=ROUTED_HELD n=53 base_n=53 capped=53 uncapped_direct=0 cases=54/54 base_cases=54/54 gate_exit=0
SITE SC549 gate=sources-check label=ROUTED_HELD n=41 base_n=42 capped=41 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0
SITE SC859 gate=sources-check label=ROUTED_HELD n=1 base_n=1 capped=1 uncapped_direct=0 cases=46/46 base_cases=46/46 gate_exit=0
SITE CC879 gate=claims-check label=ROUTED_MISS n=42 base_n=46 capped=41 uncapped_direct=0 cases=47/47 base_cases=47/47 gate_exit=0 reason=no_capped_scope_ancestor,no_cap_run_ancestor
SITE AT802 gate=anchor-truth label=ROUTED_HELD n=105 base_n=106 capped=105 uncapped_direct=0 cases=44/44 base_cases=44/44 gate_exit=0
CAPROUTE_PROBE rev=f00cf278a5ab57e87b18418fc972be9f893f65da base=0bd8be60 held=4/5 rule=A2
exit=1 start=2026-10-23T11:52:41Z end=2026-10-23T11:56:31Z load1_start=22.06 load1_end=54.49
```

Each receipt additionally carries (lines 8–11 of each file) the exact `cmd=`, `probe_sha256=`,
`probe_git_sha256=` and `scripts_diffstat_269dadb6_f00cf278=[]` shown in §0 — so each receipt is self-verifying.

## 3. Answer to the asked question: is any site's `n` below `base_n`?

Yes — in every run, and on the same sites each time.

| site | run 1 (n / base_n) | run 2 (n / base_n) | run 3 (n / base_n) | n < base_n? |
|---|---|---|---|---|
| K488  | 52 / 53 | 53 / 53 | 53 / 53 | run 1 only |
| SC549 | 39 / 42 | 41 / 42 | 41 / 42 | all three runs |
| SC859 | 1 / 1 | 1 / 1 | 1 / 1 | never |
| CC879 | 46 / 46 | 43 / 46 | 42 / 46 | runs 2 and 3 |
| AT802 | 104 / 106 | 102 / 106 | 105 / 106 | all three runs |

Summary per run: run 1 has 3 sites below base_n (K488, SC549, AT802); run 2 has 3 (SC549, CC879, AT802); run 3 has 3
(SC549, CC879, AT802). `SC859` (the parity shell exec) is the only site that is stable at n = base_n = 1 in all three.

## 4. Findings

**F1 — R47-1 is repaired: the readings are now committed receipts, and they reproduce the round-47 numbers exactly.**
The three receipts read `held=3/5`, `held=3/5`, `held=4/5` — the same triple as the round-47 chat quotes
(`corpus/lessons/round-47.md:105-107`: MutRouteAT802 3/5, MutRouteK488 3/5, MutRouteCC879 4/5). The quotation is now
backed by committed bytes at `f00cf278`, whose `scripts/` are identical to `269dadb6`'s (§0). The R47-1 repair is
therefore not just "receipts exist": the receipts **confirm** the round-47 reading that decided C1 as a miss, and the
counter's non-reproducibility is now demonstrated on committed evidence rather than asserted.

**F2 — The defect reproduces at moderate load, so it is not only a high-load artifact.** `load1_start=22.06`,
`load1_end≈54.5` (host load rose because sibling wave-1 seats were running probes concurrently). Round 47's
non-reproducible readings were taken under unknown load; these are at load1 ≈ 22–55 and still read 3/5, 3/5, 4/5 with
`n < base_n` at three of five sites. The shortfall therefore does not require the extreme load (load1 ≈ 110–137) of the
round-48 root-cause runs (`probe/receipts/rc-at802-pidwrap.txt`). Consistent with that receipt's second cause — strace's
padded PID prefix after the host PID counter wraps, which is a PID-numbering condition, not a load condition — the loss
happens at any load.

**F3 — The A2 counter's observation gap (R47-5) is confirmed on the committed receipts, and it is the counter, not the
routing.** In every run `uncapped_direct=0`, `gate_exit=0`, `cases == base_cases` (54/54, 46/46, 47/47, 44/44) and
`fail_lines` is absent — the gates themselves are healthy and every direct child was routed. The only defects are
`no_cap_run_ancestor` / `no_capped_scope_ancestor` on a few execs, and `capped < n` (run 1 CC879 45/46, AT802 99/104;
run 2 SC549 39/41, AT802 100/102; run 3 CC879 41/42). The ancestry chain was observed but the parser lost records:
this is exactly the defect the round-48 F48 counter was built to fix, and the round-48 receipts
(`probe/receipts/stab-r47-f00cf278-{1,2,3}.txt`, committed at `fe3d45b`) show the fixed parser reading
`AT802 capped/n=106/106,106/106,106/106` and `held=5/5 set=r47` on the same rev and the same script bytes. Two
independent readings — the old counter and the fixed counter — therefore agree that the routing itself holds at
`f00cf278`/`269dadb6`; only the A2 counter's observation is unstable.

**F4 — The A2 predicate has no exec-count floor, so it can score ROUTED_HELD with `n < base_n`.** Run 1 scores
`K488 label=ROUTED_HELD n=52 base_n=53`; run 3 scores `AT802 label=ROUTED_HELD n=105 base_n=106`; run 2 scores
`CC879 label=ROUTED_HELD n=43 base_n=46`. A run whose parser lost 1–3 child execs is still allowed to declare the site
held. That is R47-5's substance ("a site whose exec count differs from the base run's is a miss"), and the round-48 F48
counter adds it (`plan.md` § C1: "the site's child is exec'd exactly as many times as in the base run (at least once)").
This seat did not amend anything — the A2 counter was run unchanged, as instructed.

**F5 — Load is not the sole driver; three of five sites lose records in every run while two are stable.** `SC859` never
loses a record (n=1 in all three runs). `K488` loses records only in run 1. The per-site loss is unstable across runs,
which is what makes the counter's verdict unstable, not a systematic property of any one site.

## 5. Boundaries observed

- Lane repo: read-only. `git status --porcelain` in the lane shows only untracked wave artifacts
  (`.ufo/waves/round-48/build/`, `build-dispatch.json`, `build-spec.json`) produced by this and sibling wave-1 seats;
  no tracked file was modified by this seat. No `commit`/`add`/`stash`/`checkout`/`reset`/`push`/`jj` was issued in the
  lane or the fleet repo.
- Files written by this seat, both inside the allowed `.ufo/waves/round-48/build/` of the lane:
  `a2-rerun-1.txt`, `a2-rerun-2.txt`, `a2-rerun-3.txt`, `ExecA2Reruns.md`.
  Seat scratch (outside the lane): `/fast/scratch/hyaku/kumitate-r48/seats/w1-ExecA2Reruns/run-k.sh`.
- No process tree started by this seat survived: after the runs, `ps` shows no `caproute-probe.mjs` and no `run-k.sh`
  process from this seat (the `strace` processes still listed belong to sibling seats' round-48 probes, under
  `/fast/scratch/hyaku/kumitate-r48/probe-runs`, and were left untouched). The A2 probe's own scratch trees
  (`/fast/scratch/hyaku/kumitate-r47/probe-runs/…`) are removed by the probe's `finally` block: the three runs here
  created `0bd8be60d915-base-*` and `f00cf278a5ab-rev-*` trees, and none of them survives. Eight trees remain under
  that path, carrying revisions `0bd8be60` (×2), `269dadb6` (×2), `301bd0e8`, `c730977e`, `d822c7dc`, `f51b9756`;
  their mtimes are 06:56–07:55 -0300 (09:56–10:55Z), i.e. all before this seat's launch at 11:52:41Z, so none of them
  is one of these three runs' trees. Three `f00cf278a5ab-rev-*` trees were visible at 08:52:29 -0300 (11:52:29Z), 12 s
  before this seat's own launch, and had gone by the time of the check — they belonged to a concurrent process, not to
  this seat. Nothing was deleted by this seat.
- No build, lint, test or formatter was run beyond the three bounded counter invocations the item named.
- Round-47 seat ReviewCounterA2's output is not cited anywhere above (the defect R47-5 was cancelled); the R47-5
  evidence cited here is the round-48 plan § R47-5 and the committed round-48 probe receipts, plus this seat's own runs.

## 6. Risks / blockers

- **No blocker.** All three runs completed inside their bound and produced complete receipts.
- **Consequence for the round-47 verdict:** the round-47 reading of C1 as a miss is now reproducible on committed
  evidence (3/5, 3/5, 4/5 at a rev whose scripts equal the C1 commit's). The lane should treat R47-1 as closed by
  receipts rather than by a quotation.
- **Consequence for round 48's C1:** the r47-site set at `f00cf278` reads `held=5/5` under the *fixed* F48 counter
  (committed receipts `stab-r47-f00cf278-*.txt`), while the *unfixed* A2 counter reads 3/5, 3/5, 4/5 on the same bytes.
  Any round-48 comparison that mixes the two counters would be comparing parsers, not routing.
- **Not done by this seat (out of scope, no action needed):** these receipts are for the r47 site set at the A2 rule.
  They say nothing about the four round-48 sites (RG742, SP491, SP519, SP1592), whose base reading is `held=0/4`
  (`probe/receipts/stab-r48-f00cf278-*.txt`).
