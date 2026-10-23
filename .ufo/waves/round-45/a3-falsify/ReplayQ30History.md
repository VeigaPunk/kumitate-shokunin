RESULT ReplayQ30History rev=6b2a4517 verdict=misses p44=ERR p44b=ERR p44c=REUSED

# ReplayQ30History — history replay of QUALITY Q30 over the three round-44 counters before p44d

Method: run the committed criterion Q30 command (`git show 6b2a4517:corpus/QUALITY.md`, section Q30) on
p44 (`361d4492`), p44b (`292d9266`), p44c (`28e29bbe`), each with the shape TSV committed at that same
commit, under the host-safety wrapper. `--list` runs nothing, so every run below is a before-data replay by
construction (the census path substituted is a nonexistent file).

Verdict word `misses`: Q30 flags only p44c. p44 and p44b cannot be flagged at all — the criterion's own
command template exits 2 on both.

## Replay table

| counter | commit | counter sha256 (16) | shape at that commit | Q30 result |
|---|---|---|---|---|
| p44 | 361d4492 | 26180b32c6deea7b | p44-shape.tsv fcf9fcb60138b332 | ERR exit=2 |
| p44b | 292d9266 | 6e2c22a3079f0346 | p44-shape.tsv fcf9fcb60138b332 | ERR exit=2 |
| p44c | 28e29bbe | d7b806eb06af78d4 | p44-shape.tsv fcf9fcb60138b332 | REUSED exit=1 |

The shape TSV is byte-identical at all three commits (same sha256 `fcf9fcb60138b332…b71`), so the seed
shape is not a confounder between rows.

## Why p44 and p44b are ERR, not REUSED

1. Neither counter has a `--seed` option. `p44-count.mjs` and `p44b-count.mjs` both end their argument
   chain with `else die('unknown argument ' + a)`, and neither defines `--seed`. Q30's template substitutes
   `--seed {SEED}`, so the listing dies with status 2 before printing a CASE line; `catalog-check.mjs`
   reports `CATALOG_CHECK: ERROR (listing failed (status 2) …)` and exits 2. The stderr tail is empty
   because `die` prints to stdout (`P44_COUNT: ERROR (unknown argument --seed)`).
2. Removing `--seed` from the template does not rescue them: `p44` and `p44b` print CASE lines with no
   note column (`CASE <id> expect=<x> entries=<n>` and nothing after), so `catalog-check.mjs` reconstructs
   every CLEAN case as the base 38-entry shape and then fails its own count check:
   `reconstruction mismatch for case gen:agent.db.pre-restore-<D>T<D>Z-shm: reconstructed 38 entries,
   listing says 39` (p44) and `… gen:history.db.corrupt-<D>-<U>-shm … 38 … 39` (p44b), both exit 2.
   Counts: p44 has 59 cases and 11 CLEAN cases whose entry count is not 38; p44b has 87 cases and 11 such
   CLEAN cases. The note channel the gate reconstructs from exists only from p44c onward.

## What p44c's REUSED verdict actually measures

3. p44c: `CATALOG: REUSED (clean=19 recurring=9)`, `uniqueA=18 fraction=0.500 fracCases=0.474`,
   `CATALOG_GATE: FAIL`, exit 1 — Q30 would have flagged it, before or after data.
4. The nine recurring shapes are exactly the seed-independent fixed-shape CLEAN cases:
   `control@a47d39ddcd13`, `control-end@a47d39ddcd13`, `no-chains@3e5ca94c6b97`,
   `no-sidecars@81b3e26c1edd`, `src:commands`, `src:themes`, `src:memories`, `src:prompts`, `src:tools`
   (the sixth sourced case, `src:agent.db.corrupt`, carries a random UUID and does not recur).
5. `control` and `control-end` are constructed identically: both push `entries: clone()` with `note: ''`
   (p44c-count.mjs lines 200 and 257), so both fingerprint the base 38-entry shape and collide under any
   seed pair. One fixed-shape CLEAN case is enough: recurrence is measured between seed A and seed B runs,
   so a case whose shape cannot vary recurs by construction.
6. An alternate seed pair (`--seed-a 0f0f0f0f0f0f0f0f --seed-b 1234567890abcdef`) returns the same
   `clean=19 recurring=9` and the same nine ids (only order differs). The flag is therefore structural, not
   an artefact of the two seeds Q30 names.
7. Consequence: Q30's exit 1 carries no information about whether a catalog could memorise a counter's
   CLEAN cases here; it is triggered by the control pair alone. And it is jointly unsatisfiable with the
   case-design practice the same round-44 plan imposes — the plan requires "six sourced CLEAN cases … which
   a census built from the snapshot alone fails", and those cases pin source constants, so they must recur
   across seeds. A counter that keeps them is guaranteed REUSED; a counter that makes every CLEAN shape
   seed-varying loses them. Q30 as written can only be passed by a counter without fixed CLEAN cases.

## Precondition in Q30's Field that no round-44 plan met

8. `grep -oE '\b[0-9a-f]{16}\b'` over `plan.md` at 361d4492, 292d9266, 28e29bbe and 32b7fd56 returns no
   matches: no round-44 plan names any seed, let alone two. The single seed is printed by the counter's own
   header and recorded in the receipt (p44c before receipt: `seed=9602ade2d20bfb115d2c02b78630bc77`).
   Q30's Field requires "the frozen plan names the counter's listing command and two seeds"; that practice
   did not exist in round 44, so the criterion's own precondition is unmet by the history it governs.

## Retained evidence (exact commands and observed output)

```
$ cd /fast/scratch/hyaku/kumitate-r45/seats/a3f-ReplayQ30History
$ cp $L/.ufo/waves/round-45/probe/catalog-check.mjs.txt catalog-check.mjs
$ sha256sum catalog-check.mjs
51e11b8f73929b49a07f14401eb9f3c9dcb50a6bb9dfa1b342a736c57cd8a63a  catalog-check.mjs      # matches Q30
$ for c in 361d4492 292d9266 28e29bbe; do git -C $L show $c:.ufo/waves/round-44/probe/p44-shape.tsv > $c/p44-shape.tsv; done
$ sha256sum */p44-shape.tsv
fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  (x3, identical)
$ sha256sum 361d4492/p44-count.mjs 292d9266/p44b-count.mjs 28e29bbe/p44c-count.mjs
26180b32c6deea7bd18abce6895da2a6d1b1bfdf9de45d41e52d4b8b7d7434c8  p44
6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  p44b
d7b806eb06af78d4fbdd92c3cb3732e67fc06a69a3175f7b175bbfb57975f025  p44c
```

Every node run below was wrapped:
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 <cmd>`.

```
# exact Q30 command, p44
$ … node catalog-check.mjs --label p44 --cmd "node $R/361d4492/p44-count.mjs --census {CENSUS} --shape $R/361d4492/p44-shape.tsv --seed {SEED} --list" --shape $R/361d4492/p44-shape.tsv --seed-a 0011223344556677 --seed-b aabbccddeeff0011 --require-fresh
CATALOG_CHECK: ERROR (listing failed (status 2) for seed 0011223344556677: )
exit=2
# exact Q30 command, p44b (same invocation, p44b bytes and its commit's shape)
CATALOG_CHECK: ERROR (listing failed (status 2) for seed 0011223344556677: )
exit=2
# exact Q30 command, p44c
CATALOG: REUSED (clean=19 recurring=9)
CATALOG_DETAIL: label=p44c cleanA=19 cleanB=19 uniqueA=18 recurring=9 fraction=0.500 fracCases=0.474 seedA=0011223344556677 seedB=aabbccddeeff0011
CATALOG_RECURRING: src:commands@46e92424da51 src:themes@deaef4df2919 no-chains@3e5ca94c6b97 src:memories@7a00b458f733 control@a47d39ddcd13 no-sidecars@81b3e26c1edd src:prompts@b8427fd699a4 src:tools@9e7836835180 control-end@a47d39ddcd13
CATALOG_GATE: FAIL (9 CLEAN shape(s) recur across seeds; a catalog can memorise them)
exit=1
# diagnostic only (not Q30 as written): template with --seed omitted, p44 then p44b
CATALOG_CHECK: ERROR (reconstruction mismatch for case gen:agent.db.pre-restore-<D>T<D>Z-shm: reconstructed 38 entries, listing says 39)
exit=2
CATALOG_CHECK: ERROR (reconstruction mismatch for case gen:history.db.corrupt-<D>-<U>-shm: reconstructed 38 entries, listing says 39)
exit=2
# p44c alternate seeds
CATALOG: REUSED (clean=19 recurring=9) … CATALOG_GATE: FAIL … exit=1
```

```
$ systemd-run … node 361d4492/p44-count.mjs --census /nonexistent/census-under-test.mjs --shape 361d4492/p44-shape.tsv --list
exit=0; 59 CASE lines; 11 of them `expect=CLEAN` with entries != 38
$ … node 292d9266/p44b-count.mjs … --list                 -> exit=0; 87 CASE lines; 11 CLEAN with entries != 38
$ … node 28e29bbe/p44c-count.mjs … --seed 0011223344556677 --list -> exit=0; 150 CASE lines
P44 … entries=38 base=19 sidecar=12 chain=7 cases=150
$ grep -E '^CASE (control|control-end|no-chains|no-sidecars|src:)' p44c.list.txt
CASE control expect=CLEAN entries=38
CASE control-end expect=CLEAN entries=38
CASE no-chains expect=CLEAN entries=27 -chains
CASE no-sidecars expect=CLEAN entries=26 -12 sidecars
CASE src:commands expect=CLEAN entries=39 +commands:dir:755
# (src:themes, src:memories, src:prompts, src:tools identical in form; src:agent.db.corrupt carries a fresh UUID)
$ grep -n "cases.push({ id: 'control'" 28e29bbe/p44c-count.mjs
200:  cases.push({ id: 'control', expect: 'CLEAN', entries: clone(), note: '' });
257:  cases.push({ id: 'control-end', expect: 'CLEAN', entries: clone(), note: '' });
$ for c in 361d4492 292d9266 28e29bbe 32b7fd56; do git -C $L show $c:.ufo/waves/round-44/plan.md | grep -oE '\b[0-9a-f]{16}\b'; done
(no output at any of the four commits)
```

Verbatim quotes (each ≤25 words, with locator and body sha256):

- `Usage: node p44-count.mjs --census FILE (--shape FILE | --live DIR) [--work DIR] [--list]` (13 words),
  p44-count.mjs line 37, body sha256 `26180b32c6deea7bd18abce6895da2a6d1b1bfdf9de45d41e52d4b8b7d7434c8`.
  No `--seed` in the usage line; p44b's line 41 is the same modulo the name (body
  `6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517`).
- `cases.push({ id: 'control', expect: 'CLEAN', entries: clone(), note: '' });` (10 words),
  p44c-count.mjs line 200, body sha256 `d7b806eb06af78d4fbdd92c3cb3732e67fc06a69a3175f7b175bbfb57975f025`.
- `plus --seed recorded from the receipt header for replay` (9 words, backticks dropped),
  plan.md line 207 at 28e29bbe, body sha256 `095092e0791159ad56a0bed2c56ffae6fa9639786c243fd5a11d4da933e74b0d`.

## Bearing on the judged entry

9. The judged entry (`git show 6b2a45178c72:corpus/knowledge/agent-isolation-substrates.md`) contains no
   mention of Q30, a catalog, seeds or recurrence (`grep -nEi "Q30|catalog|seed|recur"` returns nothing).
   These defects are defects of the round-45 QUALITY repair package and of Q30's stated measurement, not of
   the C1 entry's decision-table rows. They do not falsify the entry; they falsify Q30 as a usable gate and
   undercut the part of the wave-1 control story that rests on it.

## Risks and limits

10. I did not re-derive Q30's p44d number (`32b7fd56`: `clean=19 recurring=9`); it is outside this item's
    three counters. p44d's bytes differ from p44c's (`9ea97d869a613a16…` vs `d7b806eb06af78d4…`) yet the
    19/9 counts I measured on p44c match Q30's p44d figures exactly, which is consistent but not a check.
11. The p44/p44b ERR results assume a replayer keeps the template's `--seed`. Any replayer that "fixes" the
    template would get ERR too, for the second reason above; there is no substitution that yields REUSED or
    FRESH on either counter.
12. Q30's limit already recorded (`CtlQ30Shortcuts`: a junk member per seed reads FRESH) stands; my finding
    is the opposite direction — the gate fails counters that are not memorisable, because a control case
    must repeat.
13. Failure verdicts here are exit 2 (unrebuildable listing), which Q30's "Fails when" clause counts as a
    failure of the counter. Read strictly, Q30 would have failed p44 and p44b for unrebuildability before any
    data, i.e. it classes two shipped counters as failures for a CLI gap, not for a catalog hole.

## Host safety and cleanup

14. Every node run went through `systemd-run --user --scope -p MemoryMax=4G -p TasksMax=128 timeout -s KILL
    900`. No tool was installed or updated (no package manager transaction). Scratch is
    `/fast/scratch/hyaku/kumitate-r45/seats/a3f-ReplayQ30History` (164K). After the last run
    `pgrep -af '[/]fast/scratch/hyaku/kumitate-r45/seats/a3f-ReplayQ30History'` returned nothing (exit 1).
    No git or jj writes in the lane or fleet repo; `~/.omp/agent` was not read beyond the shape TSV already
    committed. An unrelated IRC message about a C2 gate layout arrived during the run and was not acted on.
