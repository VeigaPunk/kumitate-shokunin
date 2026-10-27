VERDICT: The 54-case acceptance suite is built, self-contained and green on K68ExecToolV2's draft (54/54) while red on v1 (35/54, 19 arms), so the round-68 v2 contract is measured red-before/green-after; it also surfaces one live integration risk in round-66's routed section (4 column-0 bullets, not 3).

## Evidence

```
$ cd .ufo/waves/round-68/build/K68ExecToolSelftest
$ node run-cases.mjs --tool ../../../../../scripts/routed-ledger.mjs --scratch /fast/scratch/hyaku/kumitate-r68/K68ExecToolSelftest/suite-v1
  … 19 CASE FAIL lines …
  ROUTED_LEDGER_ACCEPTANCE: FAIL (35/54)                              exit 1
$ node run-cases.mjs --tool ../K68ExecToolV2/routed-ledger.mjs --scratch …/suite-v2 --emit-json cases.json
  ROUTED_LEDGER_ACCEPTANCE: PASS (54/54)                              exit 0
$ node .ufo/waves/round-68/build/K68ExecToolV2/routed-ledger.mjs --selftest | tail -1
  ROUTED_LEDGER_SELFTEST: PASS (56/56)                                exit 0
$ sha256sum scripts/routed-ledger.mjs .ufo/waves/round-68/build/K68ExecToolV2/routed-ledger.mjs
  f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5  scripts/routed-ledger.mjs
  9eebfefad18ef669bf468e4e9a932adfc339d845407f81dd62f593cdf8c8e29d  …/K68ExecToolV2/routed-ledger.mjs
```

Red-before, one line per hardening (fixture + command are cases.md §3/§4; `{root}` is the fixture root):

```
H1 B01  v1 (GIT_DIR=<decoy>/.git … --rev HEAD): exit 0  ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0
        v2:                                    exit 1  … first=UNLEDGERED:round-102-item-1
H1 B02  v1 --selftest under GIT_DIR:           PASS (33/33)  and `git -C <decoy> log` gains `48d6c5e fixture`
        v2:                                    PASS (56/56), decoy still 1 commit, status empty
H2 B03  v1: exit 0 CLEAN (follows notes/out.md out of the root); v2: exit 1 ANSWER_DEAD A1@line7:answer-symlink:notes/out.md
H2 B04  v1 --ledger ../outside-ledger.md: exit 0 CLEAN; v2: exit 2 reason=ledger-escape:../outside-ledger.md
H2 B05  v1 symlinked ledger: exit 0 CLEAN;              v2: exit 2 reason=ledger-symlink:corpus/routed-ledger.md
H3 B06  v1: exit 0 CLEAN items=7;                       v2: exit 1 DRIFT items=8 UNLEDGERED round-102-item-3
H4 B07  v1: exit 0 CLEAN (quote "juliet");              v2: exit 1 ROW_MALFORMED A2@line8:quote-words=1
H4 B08  v1: exit 0 CLEAN (first occurrence binds);      v2: exit 1 QUOTE_AMBIGUOUS A4@line10:round-101-item-4-hits=2
H5 B09  v1: exit 0 CLEAN (lines n-2..n+1 window);       v2: exit 1 ANSWER_DEAD …answer-quote-not-at-exact-line:notes/a.md:4
H6 B10  v1: exit 1 DRIFT items=8 on a CORRECT ledger;   v2: exit 0 CLEAN items=7
H6 A16  v1 binds a row quoting the fenced line (no finding for A12); v2: exit 1 QUOTE_ABSENT A12@line14:round-101-item-4
```

Live-lane routed-section shapes measured through the tool (verbatim excerpts, cases F01–F03):

```
F01 round-59: exit 0  ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=0 rows=0 open=0 closed=0 wontfix=0
F02 round-66: exit 1  ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=4 rows=0 findings=4 first=UNLEDGERED:round-66-item-1
F03 round-55: exit 1  ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=3 rows=0 findings=3 first=UNLEDGERED:round-55-item-1
```

Scratch `/fast/scratch/hyaku/kumitate-r68/K68ExecToolSelftest` removed after copying both receipts into the build dir (`ls` of the parent no longer lists it). No tool installs or upgrades were needed; no pacman, git, or jj mutation outside throwaway fixtures under that scratch (each fixture asserted `git rev-parse --show-toplevel` before its first commit).

## Findings

K68ExecToolSelftest-1 — info (verification result). K68ExecToolV2's draft at sha256 `9eebfef…` passes 54/54 of the acceptance suite and its own selftest reads `PASS (56/56)` (>= the L1 floor of 44). The suite is reproducible without the draft: `node .ufo/waves/round-68/build/K68ExecToolSelftest/run-cases.mjs --tool <path>`. Reproduce: the two commands in Evidence. Caveat: a later revision of that file invalidates this measurement — re-run it (exit 0 is the bar).

K68ExecToolSelftest-2 — medium, integration risk for C1/L2. Round 66's routed section carries FOUR column-0 bullets, not three: `corpus/lessons/round-66-verifier-spotcheck.md:71-74` are D1, D2, D3 and `- **Note for the operator (not a defect, promotion-owned):** …`. Any fence-aware parser counts 4, so the 61-item ledger needs a row for `round-66 item 4` or L3's "every item has a row" fails. Reproduce: `F02` in the suite, or `node scripts/routed-ledger.mjs --root <fixture-from-cases.json> --from 66 --to 66` → `items=4`. The L1 must either row it (an `open` row with a real class) or the L1 must record the exclusion in the plan drift note — the counter's own count of 61 already includes it.

K68ExecToolSelftest-3 — medium, L4 coverage gap (strengthening ratchet proposal, not an edit). The frozen L4 `fence-item` mutant is satisfied by v1 *by accident*: the fenced line takes ordinal 4, so one row shifts into QUOTE_ABSENT and the fence-quoting row still binds — the counter cannot distinguish "fence-blind" from "ordinal-shift". My B10 arm closes that: a ledger that is correct for the real section must read CLEAN under a fenced section (v1 DRIFTs, v2 CLEANs). Proposal for the L1: add B10's fixture/expectation as an additional L4 mutant in the next freeze (monotone: it can only add MISSes to a fence-blind tool).

K68ExecToolSelftest-4 — low, diagnostics regression in v2. `ROUTED_LEDGER: FAIL-CLOSED reason=root-absent` no longer names the path v1 printed (`reason=root-absent:<abs>`). My C05 case accepts both (the counter pins no detail here); restoring the path is a cheap operability win. Reproduce: `run-cases.mjs --only C05 --verbose`.

K68ExecToolSelftest-5 — low, silent verdict-semantics change. v1's `sections=` counted spot-checks whose routed section was found; v2 counts routed sections (my amended-section fixture reads `sections=3` where v1 read `2`). Both readings satisfy every frozen arm (one-section = 2, no-section = 1), so the suite does not pin it, but the v2 header should state the new meaning so L2/L3 readers do not read `sections=` as a file count. Reproduce: A17/B06 with `--verbose`.

K68ExecToolSelftest-6 — medium, safety (fixed in v2, worth a LOG sentence). v1's GIT_DIR escape is a *mutation*, not only a misread: `GIT_DIR=<foreign>/.git node scripts/routed-ledger.mjs --selftest` commits its fixture into the foreign repo (`48d6c5e fixture` on top of the decoy's single commit; its worktree files replaced by the fixture's — receipt `b02-gitdir-escape.txt`). A gate that writes into a repo named by an inherited variable can corrupt a caller's checkout; the export-only environment allow-list belongs in the v2 header's "What it does not inherit" line.

## Artifacts

- `.ufo/waves/round-68/build/K68ExecToolSelftest/cases.md` — the spec: how to run, fixture families, 54-case index (argv, expectation, measured v1/v2), the six hardenings red-before/green-after, L4 parity table, what is deliberately not pinned.
- `.ufo/waves/round-68/build/K68ExecToolSelftest/cases.json` — machine-readable: every case's exact fixture bytes (path + sha256 + content), argv, env, expectation, plus the v2 run's per-case results and tool sha256.
- `.ufo/waves/round-68/build/K68ExecToolSelftest/run-cases.mjs` — the runner (fixtures built from the case table, judged on exit + verdict regex + finding id/detail; `--only`, `--emit-json`, `--keep`, `--verbose`, `--list`).
- `.ufo/waves/round-68/build/K68ExecToolSelftest/gen-cases-md.py` — renders cases.md from cases.json + the receipts (the table is never hand-maintained).
- `.ufo/waves/round-68/build/K68ExecToolSelftest/v1-run.txt` / `v2-run.txt` — runner receipts, 35/54 and 54/54.
- `.ufo/waves/round-68/build/K68ExecToolSelftest/b02-gitdir-escape.txt` / `b02v2-decoy-untouched.txt` — the foreign-repo commit v1 leaves behind, and v2 leaving it untouched.
- `.ufo/waves/round-68/w1/K68ExecToolSelftest.md` — this report.

Case mix (54): A=20 frozen L4 mutants, B=10 hardenings, C=6 usage arms, D=11 malformed rows (incl. `id-round-mismatch` and its non-firing guard), E=4 class/RECURRENT arms, F=3 verbatim real-lane routed sections (round 59 prose/zero-item, round 66, round 55).

## Limits

- I did not run the frozen counter `ledger68-probe.mjs` end to end (that is the L1's counting step); I only read its `MUTANTS` table and reproduced the 20 expectations. So "v2 satisfies L4" is my suite's reading of L4, not a counter receipt.
- The draft I measured is K68ExecToolV2's file as of 12:00; any later revision needs a re-run (cases.md §7 records the exact sha).
- I did not attack the v2 draft's internals (its own selftest's 56 cases, its `--rev` path with a symlinked `.git`, concurrent writers, or `--ledger` pointing at a directory); I measured black-box CLI behaviour only.
- No network arms: this suite has none (that is C2/M5's territory).
- `sections=` for multi-section files and diagnostic prose beyond the disambiguating token are deliberately unpinned (cases.md §6), so a green run does not certify them.
- Round-66 item 4 (the operator note) is measured as an item; whether it *should* be ledgered is the L1's call, not mine — I report the count, not the ruling.
