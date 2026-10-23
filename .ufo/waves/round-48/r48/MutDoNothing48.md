# MutDoNothing48 — do-nothing (whitespace) control

Axis: operability. Claim C1, predicate `ROUTED_HELD`, rule F48, frozen counter
`.ufo/waves/round-48/probe/caproute48-probe.mjs`
(sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, unchanged before/after).

## Mutant

Whitespace-only commit on the freeze tree, in my own sandbox clone:

- pristine rev `fe3d45bf929246915c8c0de5f7f8682b5015b22c`
- mutant `6a92fe19e0bdb1d7b8f51e9c5e639f1b91990fa7`, parent = the freeze
- change: one blank line appended to `scripts/round-gate.mjs`. Byte proof: the new blob equals the old
  blob plus `\n` (82 398 → 82 399 bytes, first 82 398 bytes `cmp`-equal;
  `52eb183e…` → `a850feb0…`). `git diff --numstat fe3d45bf 6a92fe1` = `1 0 scripts/round-gate.mjs`; no
  other path differs. No behavior-bearing byte, no routing, no cap-spawn call added.

## Expected detector behaviour

`held=0/4` with exit 1 at both revs: at the freeze no site is routed, so a no-op must not read
`ROUTED_HELD` on any of RG742 / SP491 / SP519 / SP1592. Exit 2 is recorded, never a score, and a
pre-data control reading `ROUTED_HELD` would force an `A<n>` amendment to F48.

## Output (verbatim, both runs)

Pristine `fe3d45bf` (start 18:23:51Z, load1 8.10 → 17.71): four `SITE … label=ROUTED_MISS` lines with
`capped/n=0/116, 0/2, 0/2, 0/14` against matching `base_n=116/2/2/14`, then

```
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=17.71 end=2026-10-23T18:24:26Z
```

Mutant `6a92fe1` (start 18:24:36Z, load1 18.94 → 47.83): same four `ROUTED_MISS` lines, same
`capped/n` and `base_n`, then

```
CAPROUTE48 rev=6a92fe19e0bdb1d7b8f51e9c5e639f1b91990fa7 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
exit=1 load1=47.83 end=2026-10-23T18:25:51Z
```

Full transcripts, including every `RUN` line: `MutDoNothing48-receipt.txt`. Ten gate runs total
(4 base + 6 rev) exited 0 with `VERDICT: PASS`, `61/61` round-gate and `46/46` surface-probe cases,
`fail_lines=0`; no exit 2; MISS reasons are the targeted missing chain
(`no_bwrap_ancestor,no_capped_scope_ancestor,no_cap_run_ancestor,canary_in_env,uncapped_exec`),
not incidental selftest failures.

## Verdict

`EXPECTED_MISS` — control passed; the frozen counter produced exactly the prescribed reading on both the
pristine freeze and the no-op commit. No amendment to F48 is forced (no site read `ROUTED_HELD`).

Mutation-test classification: **not killed / not killable**. The pristine baseline is itself `0/4`, so a
do-nothing mutant cannot be distinguished and is expected to survive. This is a false-positive control:
it shows the counter does not mint `ROUTED_HELD` on interchangeable bytes and does not mis-score the
freeze; it is not evidence that a real defect would be killed. No C1 candidate exists to score.

Attempt-1 inheritance, re-verified rather than trusted: `build/CtlDoNothing-receipt-{a,b}.txt` report the
same reading for the freeze and for the comment-only commit `7331b140` (`held=0/4`, exit 1). My
independent whitespace variant at a different, recorded load agrees. Every predicated site's exec count
equals `base_n` in all three mutant runs, so no `exec_count_ne_base` MISS arises. Observation: the
surface-probe trace totals `54` execs in this wave versus `102` in the attempt-1 receipts — an
environment-dependent quantity; the predicate compares per-site counts against a base measured in the
same invocation, which is why both agree ([INFERENCE] the difference is host tooling visibility, since
the archived tree is byte-identical).

## Restoration

`git checkout --detach fe3d45bf` in my sandbox clone: HEAD back at the freeze, worktree clean,
`scripts/round-gate.mjs` sha256 `52eb183e…`, `scripts/surface-probe.mjs` `0cd94432…`,
`scripts/cap-run.mjs` `d8acc6de…`, `git diff --stat fe3d45bf` empty. Counter hash unchanged
(`f24a3af5…`). The mutant commit survives only in the sandbox object database; nothing was written to the
lane repo except this report and `MutDoNothing48-receipt.txt`, both under `.ufo/waves/round-48/r48/`.
No tools installed.

Raw capture hashes before composition: pristine `bf46bf9c…`, whitespace `500c2c08…`.
