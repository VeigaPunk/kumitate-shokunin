TRUTH5 anchors=1578 false=188 delivered-nonok=186 delta=2 verdict=holds
Slice 5/8 (member sections 92-114 of 183 in note/section order = remaining-scripts-census sections 39-61): anchors=187 ok=95 false=26 (elsewhere 26, absent 0) dead=0 noid=66. Canonical and pairing-free counts agree on this slice.
Scope: line 1 is the whole universe, because the delivered comparator is universe-level. false = symbol absent from the cited lines under every adjacent-symbol reading (pairing-free; dead excluded).

## 1. Baseline drift (the item's numbers are superseded)
- Item baseline: FIDELITY_TOTAL anchors=1551 ok=675 elsewhere=169 absent=17 dead=173 noid=517 nonok=186.
- Delivered at HEAD ea63c4e (final/fidelity.txt, ratchet; the measured paths are unchanged since c589b38): anchors=1574 ok=702 elsewhere=169 absent=31 dead=168 noid=504 nonok=200; ratchet total 200.
  Cause: commit 5bc40d0 reset remaining-scripts-census, sighting-wall, route-probe-cluster and native-trial-launch to 0614092 bytes (one notice line each) and set the ratchet to 200.
- Measured frozen snapshot: HEAD c589b38, copied to /fast/scratch/kumitate-r37/Truth5/snap-c589b38 (43 files, SHA256SUMS verified). Since c589b38 only final/README.txt changed.

## 2. Method (own parser; claims-check neither imported nor run)
- /fast/scratch/kumitate-r37/Truth5/truth5.py, python3 stdlib. Pin /fast/scratch/kumitate-r36/src at 31c465f15669, `git status --porcelain` empty.
- Member section: `## \`path\`` heading whose path resolves in the pin (exact if it has '/', else unique basename). 183 sections in 20 notes (claims.txt registry count: 184).
- Anchor: backticked span that is exactly `:N[-M]` or `path:N[-M]` resolving to the section's own file (bare `:N` binds to the heading file). Plain-text `(:N)` is not counted (532 occurrences skipped).
- Adjacent symbol: backticked span on the same line, within 14 characters, eligible (>=3 chars, contains a letter, not path-like, not anchor-like).
- Truth: symbol as a whole word, or its core identifier, occurs on lines N..M. dead = N or M outside the file.

## 3. Counts on the frozen snapshot (anchors = 1578)
| reading | true (>=1 reading on range) | false | dead | unmeasurable (no adjacent symbol) |
|---|---|---|---|---|
| pairing-free (false under every adjacent reading) | 747 | 188 | 172 | 471 |
| canonical left-first (prev ?? next, 14 chars) | ok 706 | 229 (elsewhere 213, absent 16) | 172 | 471 |
| delivered now (1574) | ok 702 | 200 (169+31) | 168 | 504 |
| delivered item (1551) | ok 675 | 186 (169+17) | 173 | 517 |
- vs item 186: pairing-free +2 (+1.1%), within 10%. Canonical +43 (+23%): named boundary (b) below.
- vs current 200: pairing-free -12 (-6.0%), within 10%. Canonical +29 (+14.5%): same boundary.

## 4. Named class boundaries
(a) Anchor form. Counting plain-text anchors gives 2110 anchors on the snapshot. Backticked-only gives 1578 (delivered 1574). The residual is ops-watchers +4 anchors (417 vs 413); I did not identify the delivered rule for them.
(b) Pairing ambiguity. 41 anchors are false under canonical left-first but have another eligible adjacent symbol on the cited range: ops-watchers 32, native-admission-detail 3, runtime-support 3, distill-and-l3 1, loop-driver 1, route-probe-cluster 1. Canonical 229 = pairing-free 188 + 41. Delivered 200 is consistent with the arm counting about 12 of these as false (200 - 188; inferred, no per-anchor delivered output).
(c) Dead. 172 anchors cite lines beyond EOF (all N-beyond-EOF). Delivered prints them and excludes them from nonok by design. 158 are in ops-watchers; 121 of those cite scripts/ufo-stale-watchdog.mjs at :996-:1006 while the pinned file has 250 lines (SCORECARD S6 row records 1010 L). These are real stale citations, not a binding artifact.
(d) Unmeasurable. 471 anchors have no eligible adjacent symbol (delivered 504).

## 5. Sensitivity (frozen snapshot)
- Pairing-free false across predicates {whole-word, substring, longest-identifier, verbatim word, verbatim substring}: 168-200. Canonical false across the same predicates: 208-243. Delivered 186 and 200 both lie inside [168, 243].
- Pairing variants (whole-word predicate): right-first 312; canonical 229; prev-only-strict 217; clause-guard 173; both-sides->noid 158.
- Per note, canonical vs delivered nonok (current): exact on 12 of 20 notes, including remaining-scripts-census 70=70 and native-trial-launch 31=31; anchors exact on 19 of 20. Nonok gaps: ops-watchers +13, cost-and-profile +4, runtime-support +4, sighting-wall +3, distill-and-l3 +2, route-probe-cluster +1, runtime-remainder +1, swarm +1 (sum +29).

## 6. Pre-repair closure (123 wrong)
- Anchors true at 0614092 and false at pre-repair 91da27c6, keyed by (heading, ordinal): census 97, sighting-wall 12, route-probe 5, native-trial 4 = 118 (closure: 102/12/5/4 = 123).
- All 118 are true in the current tree. For these four notes the current anchors equal 0614092: 507/507, 71/71, 80/80, 52/52.
- Residual 5 (census 97 vs 102) is not reproduced. The closure's moved set is 167 against my 174, and the substring predicate gives 96. I did not verify those five.

## 7. Spot checks against the pinned source (sed on /fast/scratch/kumitate-r36/src)
- cost-and-profile.md L16 `:83` pairs require_cost_ledger_when_budgeted: ok. pin:83 = `pub(crate) fn require_cost_ledger_when_budgeted(`.
- cost-and-profile.md L87 `:448` pairs permits_advance: elsewhere. pin:448 = `matches!(self, Self::Authentication | Self::PermissionDenied)`.
- cost-and-profile.md L173 `native_profile.rs:260-276`: dead, file has 268 lines.
- ops-watchers.md L32 `:996`: dead, ufo-stale-watchdog.mjs has 250 lines.

## 8. Verdict
holds. The failing condition needs an unexplained delta above 10%. Canonical deltas (+23% vs 186; +14.5% vs 200) are fully attributed to class (b), the 41 pairing-ambiguous anchors (dead and noid sit outside nonok on both sides). The pairing-free count is within 10% of both baselines.
Caveats:
1. Pairing-free assumes each anchor's subject is one of its adjacent backticked spans. A plain-text subject would make a "false" anchor unmeasurable, so 188 is a floor under that assumption.
2. Delivered nonok is a floor, not a certificate. CLEAN excludes 168-173 dead anchors and 504-517 noid anchors.
3. The item baseline 186/1551 is superseded by 200/1574 (section 1).

## Reproduce
cd /fast/scratch/kumitate-r37/Truth5 && python3 truth5.py   # universe, canonical table, sensitivity, per note
python3 analysis2.py                                        # pairing-free bound, slices, closure
Installs or updates: none (python3 stdlib; git read-only with --no-optional-locks). Lane files written: this report only.
