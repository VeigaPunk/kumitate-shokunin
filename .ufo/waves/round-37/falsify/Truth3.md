TRUTH3 anchors=1551 false=186 delivered-nonok=186 delta=0 verdict=holds

Scope: corpus/knowledge member sections at revision 86c0676 (the dispatched tree; its committed final/fidelity.txt reads 1551/186). Pin 31c465f1; the 180 member files are byte-identical to HEAD blobs. Parser: /fast/scratch/kumitate-r37/Truth3/truth3.py (own code). I did not open or run scripts/claims-check.mjs. The sibling reference (fidelity-reference.mjs.txt) appeared only as grep fragments of its totals printing (lines 49-51); its pairing and classification were not read. The rules come from the round-36 build-spec item 13 text and the round-37 lessons.

## 1. Result at 86c0676 (mine = delivered, every per-note line)
| class | mine | delivered |
|---|---|---|
| anchors | 1551 | 1551 |
| ok (symbol on N..M) | 675 | 675 |
| elsewhere | 169 | 169 |
| absent | 17 | 17 |
| false = elsewhere + absent | 186 | 186 |
| dead / noid (diagnostic, ungated) | 173 / 517 | 173 / 517 |
False by note: remaining-scripts-census 78, ops-watchers 47, native-trial-launch 25, route-probe-cluster 14, sighting-wall 13, native-admission-detail 3, runtime-support 3, cost-and-profile 1, distill-and-l3 1, loop-driver 1. native-judge-pipeline is 0 in both.

## 2. Slice 3/8 (my slicing)
183 member sections, ordered by note name then document order, cut into 8 contiguous blocks of 22–23. Slice 3 = sections 46–68: anchors 543, ok 160, false 76 (elsewhere 64, absent 12), dead 155, noid 152. Its notes: native-trial-launch (7 sections), ops-watchers (5), queue-and-claim (1), remaining-scripts-census (10). All eight slices sum to 1551 / 186. Slice load is uneven: slice 3 holds 543 of 1551 anchors.

## 3. Class boundaries fixed by evidence (each changes the count, one at a time)
- Member head must start with a backticked token. "## Contract-hash mechanism (`native_contract.rs`)" at native-judge-pipeline:128 is excluded; admitting heads without a leading backtick adds 4 anchors (native-judge-pipeline +3, route-probe-cluster +1) and 2 false (1555 / 188).
- Dead precedes noid when both apply. Noid-first gives dead 139 / noid 551 against delivered 173 / 517; nonok unchanged.
- Adjacent pairing, no fallback past an invalid nearest previous span. The span immediately before the anchor (within 14 characters) is the pair. If it is invalid (e.g. another anchor), the anchor is noid. Second anchors on one line show this: sighting-wall L139 `:27`,`:27` (second is noid); L120 `:3762`,`:3762` (second is noid). Falling back to the next span gives 194 (+8: remaining +5, sighting +2, route +1).
- Path-like = contains "/" or ends in a listed extension (.json yes, .jsonl no). Evidence: ops-watchers L190 `:127` (pair "l0-watch-state.json", delivered noid) needs .json path-like; route-probe L199 `:177` (pair "fake-omp-session.jsonl", delivered ok) needs .jsonl not path-like. Slash-only gives 187 (+1). Extensions beyond .json/.jsonl are not separately tested.
- Gap = characters between the two backtick pairs, at most 14. Symbol test = exact trimmed substring on lines N..M. Range past EOF = dead.

## 4. Sensitivity against 186 (same tree)
| reading | false | delta | % |
|---|---|---|---|
| calibrated (above) | 186 | 0 | 0.0 |
| adjacent with fallback to next span | 194 | +8 | +4.3 |
| strict adjacent, any-extension path-like | 183 | -3 | -1.6 |
| slash-only path-like | 187 | +1 | +0.5 |
| lenient symbol test (longest identifier) | 180 | -6 | -3.2 |
| gap 13 / gap 15 | 184 / 190 | -2 / +4 | |
| range past EOF clipped (not dead) | 187 | +1 | |
| nearest valid span (both sides), not adjacent | 208 | +22 | +11.8 |
| right-first pairing (r36 rule) | 250 | +64 | +34.4 |
| member heads not backtick-first | 188 | +2 | +1.1 |

Two readings exceed 10%: nearest-valid (+11.8%) and right-first, the superseded r36 rule (+34.4%). Both are named pairing boundaries. Scope: the contract says ADJACENT; the nearest-valid excess is ops-watchers +13, remaining +5, sighting +2, route +1, runtime-support +1. Direction: r36 paired right first.

## 5. Pre-repair r36 closure (123 wrong)
Same note, anchor by anchor, base 0614092 vs pre-repair 91da27c6 (counts align: 507/71/80/52):
| note (closure label) | ok->false, exact | ok->false, lenient | closure |
|---|---|---|---|
| remaining-scripts-census (S8) | 95 | 101 | 102 |
| sighting-wall (S4) | 11 | 11 | 12 |
| route-probe-cluster (S7) | 5 | 5 | 5 |
| native-trial-launch | 4 | 4 | 4 |
| total | 115 | 121 | 123 |
Under the closure's own (lenient) tolerance it reproduces within 2. Under the arm's exact symbol test it is 8 lower (-6.5%). The closure's "anchors moved" denominators (167/30/47/35) are its own; mine are over all anchors in each note.
The same four notes also show 100 false->ok flips (47/13/12/28): the shift landed some anchors on their symbol. Net false in the four notes is 144 at base and 144 at pre-repair. The harm is the 115 flips, not the net.
Right-first on 91da27c6 reproduces the r36 "after" figures exactly (figures as stated by the round-36 critic, build/CriticAxes.md): anchors 1574, ok 867, elsewhere 0, absent 0, dead 168, noid 539, nonok 0. The same tree under the repaired left-first rule reads nonok 200. The nonok=0 was produced by pairing direction alone.

## 6. Lane drift (which 186 is "delivered")
- 86c0676 (03:21:37): 1551 / 186. This is the dispatched figure.
- 5bc40d0 (03:31:09) reset the four notes to 0614092 bytes plus a notice; ratchet regenerated to 200.
- 8c41439 (03:33:13) refreshed final/fidelity.txt to 1574 / 200.
- HEAD 6f88d12: notes, pins and final unchanged since eb4c106. My measure there: 1574 / 200. Per note it equals the refreshed final/fidelity.txt (20/20) and every ratchet ceiling (20/20, total 200). Q16 re-measure at HEAD therefore agrees with the current 200.
- At HEAD the four notes match base (0 ok->false flips), so they still carry the base's 144 false anchors at the pin. The restoration returned the base's debt along with its anchors.
The number to cite today is 200 (anchors 1574). 186 describes 86c0676 only.

## 7. Limits
- Calibration: the boundaries in section 3 were set by matching the 86c0676 per-note lines. Out-of-sample checks: HEAD per-note (20/20) and the r36 right-first after-figures (exact).
- The test is symbol-substring-on-line only (the arm's criterion). It does not judge whether the symbol is the sentence's referent; that is a semantic claim outside this item.
- Slices are my definition, not the dispatcher's.

## 8. Reproduce (revisions read from the git object store; no working-tree reads for the notes)
python3 /fast/scratch/kumitate-r37/Truth3/truth3.py --notes-rev 86c0676 --member-head backtick-first --order dead-first --pairing v2 --prev-mode raw --next-mode raw --fallback none-only --path-like known
  -> TOTAL anchors=1551 ok=675 elsewhere=169 absent=17 dead=173 noid=517 nonok=186
Same with --notes-rev HEAD -> nonok 200; --notes-rev 91da27c6 --pair right -> nonok 0; add --ident-fallback -> nonok 180 at 86c0676.

## 9. Tooling
No install or update. Used system python3 and git only. Wrote only /fast/scratch/kumitate-r37/Truth3/ and this report.
