RESULT AtkReorder rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=refused accepted=0/5 variant=accepted
Scratch: /fast/scratch/hyaku/kumitate-r40/seats/AtkReorder/ (clones lane@1530a755, open@f69817ed; replay.mjs, variant.mjs, variant-436.patch, inv-lis.mjs). No tools installed.
1. Replay of CritRedReorder case-1..5.patch (git apply --check clean on both revisions). Runner: `node replay.mjs lane cand` / `node replay.mjs open control`; per case it runs
   checklist `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --src /fast/scratch/hyaku/kumitate-pin/src` and
   open `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --open f69817edf687c8ce4f87ed7953a353399232f69e --src /fast/scratch/hyaku/kumitate-pin/src`.
   Candidate 1530a755, every case and both forms: exit=1, `TRUTH: DRIFT (2 findings: REVIEW_UNBOUND ...)`, named at both attacked entries, e.g.
   `TRUTH  REVIEW_UNBOUND  corpus/knowledge/remaining-scripts-census.md#14  :24 source=review:NoSuchSeat token=maxSubjectChars no committed review record binds this anchor` (#15 too);
   case-2 route-probe-cluster.md#71/#72, case-3 sighting-wall.md#22/#23, case-4 #42/#43, case-5 #63/#64 all read the same. `cand REPLAY accepted checklist=0/5 open=0/5`.
   Control f69817ed: checklist exit=0 `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 ...)` for all 5 (5/5 accepted);
   the --open form there is exit=64 `anchor-truth: unknown argument --open` (invalid, not a refusal).
2. Variant (keeps intent, dodges REVIEW_UNBOUND): the same adjacent-anchor swap inside one run, chosen where both anchors are already review-sourced and backed by
   committed round-38 records at the open revision, so each raw keeps its own token AND its own committed seat. Records at f69817ed (`.ufo/waves/round-38/anchor-reviews.json`):
   `remaining-scripts-census.md#436 {"seat":"Prose06","token":"bounds"}`, `#437 {"seat":"Prose06","token":"head"}`.
   Edit (line 712): "It pins cap apply bounds and head/tail preservation (`:167`, `:197-206`)" -> "(`:197-206`, `:167`)"; pin #436 raw=:197-206 token=head, #437 raw=:167 token=bounds, both review:Prose06.
   Patch: /fast/scratch/hyaku/kumitate-r40/seats/AtkReorder/variant-436.patch. `node variant.mjs lane` at 1530a755:
   `VARIANT checklist exit=0 ACCEPTED :: TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af... src-rev=31c465f15669)`
   `VARIANT open exit=0 ACCEPTED :: TRUTH: CLEAN (... base=e18ff1af... open=f69817edf687c8ce4f87ed7953a353399232f69e src-rev=31c465f15669)` — no finding lines.
   The prose is now false by position: `sed -n 197,206p` of ufo-state-retention.test.mjs contains "bounds" 0 times. The control f69817ed also accepts it (checklist exit=0 CLEAN), so this is a pre-existing gap the candidate does not close.
3. Cause [read in code, scripts/anchor-truth.mjs ReviewRecords.bound]: a record binds by note+seat+token plus identity `raw@path#occurrence`, which does not depend on order;
   checkNote pairs entries to the note in order (ANCHOR_SET_CHANGED) but never compares the order against the record revision. The open floor (compareOpen) checks
   true, debt and identity counts, which a permutation keeps unchanged.
   Surface: `node find-runs.mjs lane` lists 13 adjacent same-run pairs where both anchors carry committed records (census #234-236, #436/#437, #453-455; route-probe-cluster #82/#83, #120/#121,
   #124/#125, #127/#128, #140-146, #155/#156). The 26-attack probe never builds this: its reorders P06-P10 and ATK_REORDER_REC all use a fresh `review:probe` or forged seat.
4. Scope check: lane master 0004ae3 (docs commit) has no change under scripts/ (`git diff --stat 1530a75 0004ae3 -- scripts/` is empty). The lesson's C1 is scoped to the 26 named attacks, so C1 as stated
   is not falsified. But its open limit "No token-kept arm ... the open floor refuses the measured swaps through other findings" does not say that an unmeasured swap of recorded anchors is accepted
   by both forms; this run measures that.
Impacted axes: operability (truth gate). Defect class: fixable, not a tradeoff.
Smallest safe correction (prototype measured outside the gate, `node inv-lis.mjs lane`): under --open, per note, align current anchor identities to the pin at REV, keep the longest increasing
   subsequence of REV positions, and refuse (e.g. REVIEW_REORDERED) any anchor outside it whose REV entry is review-sourced. Measured:
   `LIS_REVIEW_MOVED variant-436.patch count=1 at remaining-scripts-census.md#437(:167@scripts/ufo-state-retention.test.mjs#0)`;
   benign note edits B01, B03, B04, BEN_REPAIR, BEN_INSERT_NOSHIFT and BEN_UNCHECKED all count=0 (note-level simulation only: no repin, no gate run; B05, BEN_PROSE and BEN_REKEY not exercised).
   A naive adjacent-inversion check is NOT safe: `INV_BENIGN BEN_INSERT_NOSHIFT count=1` (an earlier copy of :135 shifts the occurrence numbers).
   Cases 1-5 read count=0 under the prototype (their REV entries are pair-sourced); they stay refused by REVIEW_UNBOUND. Needs a selftest fixture: swap two recorded anchors in one run -> exit 1.
