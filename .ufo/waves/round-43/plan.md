# Round 43 plan (kumitate L1; counter, kill rule and inputs frozen at the commit that adds this file)

Round open: lane `master` = `2a7f37d2b0a413db8499b413783c27a0effdc989`, pushed (`jj-lane.sh state`:
`ahead=0 behind=0 tracked=0 untracked=3`; the three untracked files are the round-42 late falsify
reports, D1). Origin pin `31c465f15669f744848bd9f5d56191c5085670f7`, clone
`/fast/scratch/hyaku/kumitate-pin/src`. Open receipts: `.ufo/waves/round-43/open/receipts.txt`.
Repair-first: round 42 was an honest stop (closure `corpus/lessons/round-42-verifier-spotcheck.md`);
one more rejection parks the lane for the leg. One claim, sized to what one round can land.

Lowest non-retired axis: operability 9 (the round-42 terms reading; the closure re-derived it but
found the terms counter blind, D3). Every coverage sub-axis reads 10. C1 works operability.

## C1 — operability, capability `gate-mutants` re-claimed under one frozen kill predicate (K43)

**K43 (the only kill rule this round; code = `scripts/gate-mutants.mjs` in this commit, sha256
`e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a`, contract
`kumitate-gate-mutants-v2`).** A mutant is KILLED iff (a) its run is evaluable: no timeout, no
output overflow, its process group is gone, no spawn error, and a parseable case summary whose total
equals the control's; (b) the selftest exits with a numeric non-zero status; (c) stdout carries a
line exactly `VERDICT: FAIL`; and (d) an immediate second run of the same mutated bytes meets
(a)–(c) with the same sorted list of `FAIL ` case names (text before ` — `). An evaluable run that
is not killed is SURVIVED (exit 1 class). A second run that disagrees is UNSTABLE (exit 2 class).
After the mutants every control is re-run and must pass again (else exit 2). (a)–(c) are the
round-42 plan's pre-data sentence ("killed = exit non-zero with a `VERDICT: FAIL` line",
`b237e3f0:.ufo/waves/round-42/plan.md:21`); (d) and the control re-run answer round-42 seat
CritC1Claim objection 2 (a false kill under host pressure). No amendment of K43 or of this
counter is permitted this round: a miss is an honest stop.

**Counter (frozen; the bytes above, run from an extracted copy so later edits to the lane's
`scripts/gate-mutants.mjs` cannot change it):**

```sh
G=$(mktemp -d /fast/scratch/hyaku/kumitate-r43/counter.XXXXXX)
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show <this plan's commit>:scripts/gate-mutants.mjs > $G/gate-mutants.mjs
sha256sum $G/gate-mutants.mjs   # must read e24749e4…
KUMITATE_GATE_MUTANTS_TMP=/fast/scratch/hyaku/kumitate-r43/gm-tmp \
  systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=256 timeout -s KILL 1500 \
  node $G/gate-mutants.mjs --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev <REV>; echo exit=$?
```

- **Before (do-nothing control = the round-open bytes, `--rev 2a7f37d2…`):** scored with this
  counter after this commit; receipt `.ufo/waves/round-43/open/c1-control-base.txt`, committed
  before any wave. Expected from a pre-commit dry run of the same bytes (disclosed, see below):
  `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 …)`, exit 1, survivors
  `cite-check:{suite-group-verdict,suite-any-fail,suite-exit-text}` and
  `wave-census:{survivor/V382-pass-count,survivor/V385-verdict-const,survivor/V387-exit-const,exits/M19-selftest-exit-const}`.
- **After (target, one value):** at the measured commit `--rev <measured>` prints
  `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 …)` and exits 0
  (the gate prints one `MUTANT` line per id, so "41/41" is enumerated by the command).
- **Kill rules for the claim (frozen):** C1 misses if the after-run prints anything other than
  `CLEAN … frozen=41/41` with exit 0; if any of the junk controls below reads `CLEAN`; if a frozen
  literal stops applying exactly once (the gate exits 2 `nomatch`); or if a control case floor
  (cite-check 75, wave-census 31) is lowered.
- **Junk controls (cheapest ways to skip the work; scored with the same counter in wave 1 on
  scratch-clone commits, receipts committed):** J1 both target selftests replaced by a stub that
  prints `VERDICT: FAIL` and exits 1; J2 both targets zero-byte; J3 the seven survivor literals
  edited away (so they no longer apply). Each must read ERROR exit 2 (control failure or
  nomatch), never CLEAN.
- **The work:** the seven survivors mutate a suite's own verdict or exit path. The cite-check and
  wave-census selftests gain an independent second verdict path (a witness that counts failing
  cases from the recorded results, not from the mutated expression) so that a one-literal fault in
  the primary verdict or exit expression still ends `VERDICT: FAIL` with a non-zero exit. Every
  frozen literal must still apply exactly once; case floors unchanged; cite-check selftest wall
  time median of 3 runs measured before and after on the same host (round-41 cost trade: measured,
  not deepened).
- **Not claimed:** the operability integer (stays 9; the terms counter is blind, D3); the two
  checklist items count no move. The capability row `gate-mutants` (entered in round 42 on an
  unverified claim) is re-evidenced by this claim's receipts, or corrected if C1 misses.
- **Sourced:** the knowledge text that states K43 cites a `corpus/SOURCES.md` row opened this round
  (a primary source on kill definitions or on flaky outcomes in mutation testing).
- **Disclosure:** the do-nothing control was dry-run once on these exact counter bytes before this
  commit (2026-10-22T22:08Z, 44.6 s, result as above, scratch
  `/fast/scratch/hyaku/kumitate-r43/control-base.txt`); K43 and the counter were not changed after
  it. The committed receipt is the post-commit run.

## Routed defects (round-42 closure D1–D8; fix or explain, not claims)

- D1 commit the three late round-42 falsify reports as late evidence (this commit) and correct
  the round-42 report's "cancelled … unperformed" line in the round-43 report.
- D2 K43 above; appended corrections to "written before any counted run" (round-42 plan:81,
  lesson:10, lesson:111).
- D3 no operability claim on the terms counter; a QUALITY criterion that an operability claim
  needs a pass-sensitive counter; a checklist pass-count receipt at round open and close.
- D4 temp parent no longer a round-42 seat path (`$KUMITATE_GATE_MUTANTS_TMP`, else
  `~/.cache/kumitate-gate-mutants`, this commit); both-target `--rev` run (the control receipt);
  red-before selftest cases for the four isolation mutants (MutGateIsolation 4/8) and the
  external-kill leak (CritC1Claim objection 4).
- D5 same-sha cite-check errors/warnings receipts at `dfabe92` and `c9a084bf`, or retract.
- D6 `kumitate-gate-pins-v1`: operator ruling pending (L0 `9a00d09`); not deepened. Pin values in
  the existing block are re-pinned when a pinned file changes; no new key, arm or semantics.
- D7 `locks/` mode check and owner pin in `kimi-census.mjs` with red-before cases; `locks/sessions`
  stays ungated by design (named limit); unsourced-stub hole named in QUALITY.
- D8 wave-census canonical-path refusal red-before case; S045's decision line gains its `Q<n>`.

Base repair (not a claim, this commit): README row for `lessons/round-42-verifier-spotcheck.md`
(proxy `C2_total` 95 vs declared 94 at open); stanza `C2=C2_total=95`; `pin.gate-mutants`
re-pinned to the counter bytes. Holds `AtkNovelIdentity`, `AtkNovelRecords` are not recreated. The
round-41 trades and the pin-block ruling stay with the operator.

Host safety: every node run by a seat that executes a selftest or the gate runs under
`systemd-run --user --scope -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600` (or tighter) and
checks for leftover processes and temp dirs afterwards.
