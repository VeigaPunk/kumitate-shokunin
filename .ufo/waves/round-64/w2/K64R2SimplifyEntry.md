VERDICT: The C2 entry loses 11 lines / 272 words of duplicated prose, three re-quoted bullets, two table-row restatements and two over-long header lines with every probe-read artifact byte-identical, and `JJ64_HELD held=8/8` exit 0 still reads on the simplified file at a sandbox-clone commit.

## Evidence

Baseline (lane, frozen integrated tree), entry == commit bytes (`git -C <lane> diff --stat 2ed8a5f8 -- <entry>` → empty):

```
$ node kumitate-shokunin/.ufo/waves/round-64/probe/jj64-probe.mjs <lane> 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64
exit=0
```

Sandbox clone (`git clone --no-hardlinks <lane> /tmp/kumitate-r64/K64R2SimplifyEntry/final`; `git -C "$C" rev-parse --show-toplevel` →
`/tmp/kumitate-r64/K64R2SimplifyEntry/final`), simplified file committed inside the clone only
(`git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit`):

```
$ node kumitate-shokunin/.ufo/waves/round-64/probe/jj64-probe.mjs "$C" b15e315bd9cbb11edf4f5111f4f6d9dbed99b76e
JJ64_HELD held=8/8 checks=8 rev=b15e315bd9cbb11edf4f5111f4f6d9dbed99b76e rule=J64
probe_exit=0
```

Set diffs, original vs simplified (one node pass over both files):

```
ASSERT demo_keys_equal=true (21/21)
ASSERT table_rows_byte_identical=true (9/9)
ASSERT located_quotes_identical=true (13/13)
ASSERT inference_labels_equal=true (3/3)
ASSERT sources_equal=true ["S198","S199","S200"]
ASSERT limits_count=7/7
ASSERT all_keyvalue_mentions_superset=true distinct=21/21
ASSERT wording_limit_keys=true
```

Live demo key set equals the stated outcomes set (not only the probe's J6 view):

```
$ bash "$C/scripts/jj-seat-demo.sh" | sed -n 's/^JJ_SEAT: //p' | sort   # diffed against stated
SET_EQUAL keys=21
```

Line/byte/word counts (`wc -l -c -w`, same order):

```
  140  2006 14392 corpus/knowledge/jj-workspace-seat-containment.md
  129  1820 13107 .ufo/waves/round-64/build/K64R2SimplifyEntry/entry.simplified.md
```

Header-line lengths (chars) old → new: `verified-at:` 241 → 143; `recheck:` 349 → 315; the three `source:` lines,
`coverage-map:` and `ground:` untouched; J1's trio still inside the first 14 lines (probe J1 passes, above).

Residual duplication scan on the simplified file: 18 prose sentences, 0 near-duplicate pairs above Jaccard 0.45
(21 sentences before); the 5 sentences without a `key=value`/quote/`(S###)` are the section thesis and the four
version-skew provenance sentences.

## Findings

1. **K64R2SimplifyEntry-1 (low) — §Mechanism re-quoted three Located-quote bullets verbatim.** It repeated S200
   "You can have multiple working copies backed by a single repo", the S200 working-copy-commit sentence and the S199
   mach-commands sentence, so the same bytes appeared twice in one entry. Replaced by cited paraphrase; exact bytes stay
   in all 13 bullets. Attacks: reader load / the `## Located quotes` section being the single home for quoted bytes.
   Repro: `grep -c 'some mach commands invoke jj' <entry>` → 2 at `2ed8a5f8`, 1 in `entry.simplified.md`.

2. **K64R2SimplifyEntry-2 (low) — §What the demo measures restated two table rows in prose.** The seat-write clause
   repeated row 1's middle cell and the `jj workspace forget` clause repeated row 8's, keys and all. Both cut; the six
   keys are still in the table and the Demo outcomes list (census: each 3→2 occurrences, none lost).
   Repro: `grep -n 'workspaces_after_forget' <entry>` → prose + table + outcomes at `2ed8a5f8`, table + outcomes after.

3. **K64R2SimplifyEntry-3 (low) — the tree-identity rule was stated three times.** Intro ("the rule that decides whether
   a seat goes stale (the seat's on-disk tree against the tree of its new commit — not the kind of operation)"), §What
   with `[INFERENCE: …]`, and Limits L4, plus a fourth restatement in §Mechanism ("modifying the seat's commit does not
   by itself stale the seat"). Kept §What (the measured rule) and Limits L4 (the caveat); cut intro and §Mechanism.
   Repro: `grep -c 'tree-identity\|on-disk tree' <entry>`.

4. **K64R2SimplifyEntry-4 (low) — two Limits bullets shared one premise.** "Measured on jj 0.45.1 only" and "the wording
   of one jj version" were two heads on one caveat; merged to "Fixture-dependent counts and wording." while keeping both
   key names. My first merge **narrowed** the caveat (dropped `ignore_working_copy_adds_op`); I caught it in review and
   restored it — a limit must never be relaxed by a simplification. Repro: `grep -n 'ignore_working_copy_adds_op' <entry>`.

5. **K64R2SimplifyEntry-5 (low) — two header lines carried duplicated provenance.** `verified-at:` re-named the demo
   command that `recheck:` already gives and re-stated the docs version that the three `source:` URLs carry; `recheck:`
   repeated the date and re-ran a demo it already names. 241→143 and 349→315 chars, J1 shape intact.
   Repro: `awk 'NR<=14 && /^(verified-at|recheck):/{print length($0)}' <entry>`.

6. **K64R2SimplifyEntry-6 (low) — intro restated the demo's key count and the rule.** "It adds what M7 lacked: a
   re-runnable hermetic demo that prints 21 outcome keys … the rule that decides whether a seat goes stale … and the
   containment consequence" split one sentence's thesis across three restatements of later sections; collapsed to demo +
   containment consequence. Repro: `sed -n '12,19p' <entry>` vs `entry.simplified.md:12-17`.

7. **K64R2SimplifyEntry-7 (medium) — the frozen counter is blind to prose loss, so no gate protects a future
   simplification.** In a throwaway clone I deleted the entire `## Limits` section (120 lines left) and the probe still
   scored `JJ64_HELD held=8/8 checks=8 rev=74580d7304143c81a57412f9b453ee13559270d0 rule=J64` exit 0. This confirms the
   plan's declared limit ("it cannot tell a sound entry from a well-grounded wrong one") and means my set-diff harness —
   not J64 — is the only evidence that this pass preserved claims. Not a counter bug; reported, not patched.
   Repro: `git clone --no-hardlinks <lane> "$C"`; delete from `## Limits` to EOF; commit in `$C`; run the probe on `$C`.

## Artifacts

- `.ufo/waves/round-64/build/K64R2SimplifyEntry/entry.simplified.md` (full-file draft for the L1 to integrate)
- `.ufo/waves/round-64/build/K64R2SimplifyEntry/entry.diff.txt` (unified diff, 46 removed / 38 added lines)
- `.ufo/waves/round-64/build/K64R2SimplifyEntry/redundancy-ledger.md` (10 cuts + 3 deliberate stops, each with surviving location)
- this report

No tools installed or upgraded. Lane tree untouched outside the two build paths and this report; the entry in
`corpus/knowledge/` was read only (probe-verified identical to `2ed8a5f8`), scratch clones under
`/tmp/kumitate-r64/K64R2SimplifyEntry/` deleted after the runs.

## Limits

- I did not re-fetch S198-S200 by hand: J5's live fetch ran inside the probe on the simplified file (it passed), which is
  the same check, but I read no page myself.
- Editorial judgement (what a reader needs, which of three copies of a key is canonical) is mine; the decision table and
  the `## What the demo measures` narrative are left at three-copy density on purpose (ledger § deliberate stops).
- I did not touch PROVINCE.md, the registry rows, pins, the demo or the counters, and did not verify J2/J3/J7/J8
  independently of the probe's own output.
- The simplified file was scored in a clone at `b15e315b`; the lane itself still carries the unsimplified entry — the L1
  integrates, so `JJ64` at a future lane revision depends on that integration.
