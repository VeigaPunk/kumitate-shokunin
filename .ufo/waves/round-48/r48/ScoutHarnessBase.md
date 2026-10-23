# ScoutHarnessBase — base exec counts at attempt 2

Question: do the frozen counter's base_n values (r48 sites 116/2/2/14; r47 set, 5 sites) reproduce at attempt-2 time and load, scoring rev fe3d45bf929246915c8c0de5f7f8682b5015b22c?

**Yes.** One invocation of each set reproduced every committed base_n, and each site's three rev-run exec counts equalled that base_n. No exit 2.

## Setup (observed)

- Sandbox clone: `/fast/scratch/hyaku/kumitate-r48a/seats/ScoutHarnessBase/lane`, detached HEAD = `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. `f00cf278a5ab57e87b18418fc972be9f893f65da` and `0bd8be60d9150030a2eee8344a2e70b65f6eb4f4` are both commits in that clone and ancestors of the tip.
- Counter: `.ufo/waves/round-48/probe/caproute48-probe.mjs`, sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (wave file and the same path inside the clone). Matches the sha256 on every `probe/receipts/stab-r4*.txt` trailer.
- base_n is not stored. `measure(SET.base, 'base', 1)` re-runs the set's base rev once; `SETS.r48.base` is `f00cf278…`, `SETS.r47.base` is `0bd8be60…` (`caproute48-probe.mjs` `SETS`, lines 61-88; the SITE line prints `base[s.id].n`, lines 347-375).
- Commands (concurrent), lane = the sandbox clone, rev arg = `fe3d45bf…`:
  - `node probe lane rev --set r48` wrote `.ufo/waves/round-48/r48/ScoutHarnessBase-set-r48.txt`
  - `node probe lane rev --set r47` wrote `.ufo/waves/round-48/r48/ScoutHarnessBase-set-r47.txt`
- stderr of both invocations empty (`ScoutHarnessBase-set-r48.txt.err`, `ScoutHarnessBase-set-r47.txt.err`).
- No packages installed.

## r48 — base_n 116/2/2/14 reproduces

`CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48`, wrapper `meta exit=1`. Window 2026-10-23T18:23:24Z-18:23:47Z, loadavg `2.06 1.19 0.76` to `7.50 2.46 1.19`.

| site | gate | base_n | rev n (3 runs) | base_cases | rev cases |
|---|---|---:|---|---|---|
| RG742 | round-gate | 116 | 116, 116, 116 | 61/61 | 61/61 x3 |
| SP491 | surface-probe | 2 | 2, 2, 2 | 46/46 | 46/46 x3 |
| SP519 | surface-probe | 2 | 2, 2, 2 | 46/46 | 46/46 x3 |
| SP1592 | surface-probe | 14 | 14, 14, 14 | 46/46 | 46/46 x3 |

All four `ROUTED_MISS`, capped/n = 0 over base_n. Reasons match the freeze receipts: `no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec,uncapped_direct_children=58` (RG742) or `=9` (the three SP sites). Gate RUN totals: round-gate `execs=1308` on base and all three revs; surface-probe `execs=54` on base and all three revs; every run `exit=0`, `verdict_pass=true`, `fail_lines=0`.

`resumed` differed from the receipts (round-gate base 24 here vs 48/47/64 there; surface-probe base 0 here vs 0/3/0). That field is not an input to base_n. The log still parsed (no exit 2).

## r47 set — five sites, base_n 53/42/1/46/106 reproduces

`CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=0bd8be60 set=r47 held=5/5 runs=3 rule=F48`, wrapper `meta exit=0`. Same start 18:23:24Z, end 18:25:58Z, loadavg `2.06 1.19 0.76` to `49.04 18.47 7.12` (this invocation overlapped the r48 run, then continued while load climbed).

| site | gate | base_n | rev n (3 runs) | base_cases | rev cases |
|---|---|---:|---|---|---|
| K488 | kimi-census | 53 | 53 x3 | 54/54 | 54/54 x3 |
| SC549 | sources-check | 42 | 42 x3 | 46/46 | 46/46 x3 |
| SC859 | sources-check | 1 | 1 x3 | 46/46 | 46/46 x3 |
| CC879 | claims-check | 46 | 46 x3 | 47/47 | 47/47 x3 |
| AT802 | anchor-truth | 106 | 106 x3 | 44/44 | 44/44 x3 |

All five `ROUTED_HELD`, `uncapped_direct=0,0,0`. Gate RUN exec totals match the receipts exactly: base kimi-census 56, sources-check 51, claims-check 71, anchor-truth 1053; each rev run 427, 352, 393, 1795. Every run `exit=0`, `verdict_pass=true`, `fail_lines=0`. `resumed` again differs (several base gates `resumed=0` here; receipts had 0-7) and did not change n.

## Comparison to probe/receipts/stab-r4*

All six committed receipts agree with each other and with this pair on every base_n, on base_cases, on rev cases, and on the execs= totals above. They disagree only on `resumed` and on the load trailer.

| receipt | set | scored rev | base | held | base_n |
|---|---|---|---|---|---|
| stab-r48-f00cf278-1,2,3.txt | r48 | f00cf278… | f00cf278 | 0/4 exit 1 | 116, 2, 2, 14 |
| ScoutHarnessBase-set-r48.txt | r48 | fe3d45bf… | f00cf278 | 0/4 exit 1 | 116, 2, 2, 14 |
| stab-r47-f00cf278-1,2,3.txt | r47 | f00cf278… | 0bd8be60 | 5/5 exit 0 | 53, 42, 1, 46, 106 |
| ScoutHarnessBase-set-r47.txt | r47 | fe3d45bf… | 0bd8be60 | 5/5 exit 0 | 53, 42, 1, 46, 106 |

Freeze trailers: start 11:41:40Z, load1_start 122.77; r48 end load1 100.65; r47 end load1 82.75. This pair never saw that load. Peak load1 observed here is 49.04 at the r47 wrapper's end.

`git diff --stat f00cf278… fe3d45bf… -- scripts/` is empty, so the r48 base tree and the scored rev's `scripts/` are the same trees the r48 receipts measured (freeze commit: counter, plan, receipts, census — not gate scripts). r47's base `0bd8be60…` does differ (`anchor-truth.mjs`, `cap-run.mjs`, `cap-spawn.mjs`, `claims-check.mjs`, `kimi-census.mjs`, `sources-check.mjs`, 277 insertions / 105 deletions vs the tip); base_n still came out of a fresh `git archive` of that older rev and matched.

## Inference

[INFERENCE] The R47-5 parser (return matched as a closing paren, optional whitespace, then equals; PID prefix is digits then one or more spaces; exit 2 on an unparsed line) still yields the frozen base counts when re-measured at attempt-2 load. Interleaving (`resumed`) moved and did not move n. This is not a C1 score: r48 is held=0/4 exit 1, and the kill rule wants the L1 run plus at least two committed re-runs on the C1 commit. The r47 held=5/5 is the same reading as the three base stability receipts, not an H2 measurement (H2 is this command at the C1 commit).

## Confidence and gaps

- Confidence: high that these two invocations reproduced the frozen base_n vector.
- Not done: three independent counter invocations (the freeze ran three concurrent invocations per set). Each invocation here already contains the counter's own 1 base run + 3 rev runs, and those three rev n values agreed with base_n.
- Not done: a replay at load1 about 123. Reproduction is at the load above (start about 2, r47 end about 49), i.e. attempt-2 time, not the freeze's load.
- Not shown: that strace never drops a traced record. These two logs parsed completely (exit was 1 or 0, never 2); that does not prove drop-freedom under heavier load.
