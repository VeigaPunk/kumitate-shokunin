VERDICT: CONFIRMED — all 11 spot-check files (rounds 55–65) show exactly one commit in `git log --follow`, are byte-identical (sha256) from first-add through base 8d557f85, freeze 621212b and HEAD, and their routed sections and item counts (57 items / 11 sections) are unchanged, so routed-item ordinals are stable.

## Evidence
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin; BASE=8d557f85312de4fcc82e09ff735d21436bc3746d; FREEZE=621212bac37f8249c72ac982d1d6534cb8d60701; HEAD=88041bc9f45b06560bbd807bd1ea7b44126aa49f (w1 ready).
Ancestry: `git merge-base --is-ancestor` → base IS ancestor of freeze; freeze IS ancestor of HEAD.

1. One commit per file (rewritten-after-add would show >1):
`for n in $(seq 55 65); do git -C $LANE log --format=%H --follow -- corpus/lessons/round-$n-verifier-spotcheck.md | wc -l; done`
→ every round 55..65 = `1`.

2. First-add commits are ancestors of BASE (so the single commit precedes the base):
round-55 3eae059e, 56 7178bfd3, 57 c49f2a8d, 58 0f66ecd4, 59 ffbfe3cc, 60 33043377, 61 0cbe0d75, 62 dfa6fca8, 63 6825a514, 64 47fe2383, 65 8d557f85 (= the base commit itself). Each `ancestor_of_base=yes`.

3. Whole-file sha256 (12-hex) identical at first-add == base == freeze == HEAD for all 11 files, e.g. round-55 `60ea59c0955c` ×4, round-60 `0177ac463c05` ×4, round-65 `40ee7f5f0b49` ×4 (full table in the artifact).

4. Routed-section bytes (section = `routed defects|items` heading → next equal/higher heading, per scripts/routed-ledger.mjs HEAD_RE) byte-identical first-add vs base; item counts equal per round; secIdentical=true for all 11.

5. Independent item count at base:
- tool parser routedItems: 3,4,4,8,0,9,6,5,6,5,7 → sections=11 items=57
- counter parser items66 (exact copy from ledger66-probe.mjs): same → sections=11 items=57
- plan.md states "57 items in 11 sections at base" → MATCH. Round-59 = 0 items (prose section), matching the plan's stated limit.

## Findings
- K66LabratAppendOnly-1 (severity: info; supports C1 plan premise "Item ordinals assume the spot-checks stay append-only"). Spot-checks rounds 55–65 are append-only: each file touched by exactly one commit, byte-identical through base. Ordinal stability holds, so the L66 ledger binding by located quote + ordinal is well-founded. Repro: `git -C $LANE log --format=%H --follow -- corpus/lessons/round-58-verifier-spotcheck.md` → single hash `0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f`.

## Artifacts
- .ufo/waves/round-66/build/K66LabratAppendOnly/spotcheck-appendonly-evidence.txt (full hash + item-count tables)

## Limits
- Detection is from within the lane's git DAG: a whole-history rewrite (rebase/filter) that also rewrote the pinned base hash could in principle hide an edit, but the pinned base 8d557f85 anchors content and is an ancestor of freeze and HEAD, so the recorded chain is internally consistent. I did not diff against the read-only origin pin (/fast/scratch/hyaku/kumitate-pin/src) — not required given the byte-identical hashes across four revisions.
- I verified stability (ordinals unchanged), not correctness of any item's classification; round 59's prose section yields 0 items by both parsers and is intentionally not ledgered.
- Tool run `node scripts/routed-ledger.mjs --rev $BASE --from 55 --to 65` fail-closes `reason=ledger-absent` (expected at base; the ledger is the round's deliverable), so item counts above come from the exported parser and the counter's parser, not a full tool CLEAN run.
