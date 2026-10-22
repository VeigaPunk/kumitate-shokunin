RESULT ScribeSkillPattern rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=drafted section=Gate registry

Drafted a new SKILL.md error-pattern entry for round 40, in the format of the existing one.
No lane file changed except this report; no product code touched; no patch file.
Draft: /fast/scratch/hyaku/kumitate-r40/seats/ScribeSkillPattern/skill-pattern.md (7684 bytes).

Format source
- grep -n 'Error pattern' SKILL.md -> 617 "Error pattern - a floor keyed on a field the edit can rewrite (round 39, ...)".
- git show f69817edf687c8ce4f87ed7953a353399232f69e:SKILL.md | grep -n 'Error pattern' -> same line 617, same text (pinned blob).
- No heading of its own: nearest are SKILL.md:587 "## Gate registry" and :636 "## Verifiable checklist", so the entry goes inside Gate registry, after line 634.
- Copied moves in order: title (round N, cite), Symptom, Cause, Decision since round N, backticked finding kinds, Fixtures ids, Open limits. Longest line 96 characters in the old paragraph and in the new one.

Pointers read this round
- corpus/lessons/round-39.md:93-100 L1 self-declared review (S8#92 set to review:NoSuchSeat with token "the" read CLEAN); :101-107 L2 debt headroom (base S8 debt 77, pin 4, so 73 new false anchors read CLEAN and the 74th was refused); :113-120 L3 raw swap (S8#451 :40 against S8#456 :58, token hatch true at base, CLEAN).
- corpus/lessons/round-39-verifier-spotcheck.md:141-143 R39-1; :144-146 R39-2 (the swap loses the base-true hatch claim at S8#456; 5 of 20 run reorders still accepted); :147-149 R39-3.
- corpus/QUALITY.md:157-171 Q19, the parent rule; a crashing mutant is not a kill (S034).
- scripts/anchor-truth.mjs:284-288 overrideValid; :470-474 --reviews read only under --write-pin; :343 DEBT_GREW is a count comparison; :354-363 identity is raw text + path + occurrence index and the matched entry only has to be true.

Command that shows the symptom (run once, read-only, at the lane revision)
- node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --src /fast/scratch/hyaku/kumitate-pin/src
  TRUTH note=corpus/knowledge/remaining-scripts-census.md anchors=521 true=508 debt=4 unchecked=9
  TRUTH note=corpus/knowledge/route-probe-cluster.md anchors=165 true=146 debt=16 unchecked=3
  TRUTH note=corpus/knowledge/sighting-wall.md anchors=71 true=70 debt=0 unchecked=1
  TRUTH note=corpus/knowledge/native-trial-launch.md anchors=54 true=54 debt=0 unchecked=0
  TRUTH_TOTAL anchors=811 true=778 debt=20 unchecked=13
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af3392e3823227644c977c237737fe65c9 src-rev=31c465f15669)
  exit=0
- The three attacks this verdict misses are the round-39 falsifiers. I did not re-run them (that is the round-40 probe seat's work), so the entry cites them from the two lesson files, not from a run of mine.

What the entry says
- Title: a floor that trusts a declared source and a debt budget instead of a bound record and a kept identity (round 40, R39-1 to R39-3).
- Symptom: TRUTH: CLEAN while a review:<seat> entry has no committed review record, while a base-true claim moved to another raw in the same file, or while new false anchors sit under the note's debt count; the command and its verdict line follow.
- Cause: the three gaps above, each with its script line and its lesson line.
- Decision for round 40, one rule per limit: a review:<seat> entry is true only when a committed review record binds seat, note and token; a base-true anchor counts as kept only when the matched entry is true and keeps its base token or carries a bound review; a new false anchor at a raw text that held no base anchor is refused by identity, not budgeted against the note's debt count. Each arm needs a fixture that fails on the round-39 logic and a mutant a test kills, and the probe keeps a benign-edit control beside every attack.
- Open limits: the floor protects only base-true anchors, not the round's own repair; the per-note debt number stays movable by un-anchoring a base debt entry; the three rules' verdicts come from the repair commits and the probe, not from the entry.

Limits of this draft
- At f69817edf687c8ce4f87ed7953a353399232f69e the three rules are neither implemented nor measured; the entry says so in its own last sentence, so the paragraph cannot be read as a claim that the gap is closed.
- No new finding kind and no fixture id is named, because ExecReviewBind, ExecNewDebtIdentity and ExecProbeV2 have committed neither; their gate reports should replace the last sentence of the entry with the measured commit, the finding kinds and the fixture ids.
- Placement: paste after SKILL.md:634, or fold the three rules into the round-39 paragraph's Open limits sentence; the draft states both options.

Not touched
- No lane file except this report; no scripts change, no patch, no jj write, no commit, no push. git status showed only .ufo/pins/origin.json modified and .ufo/waves/round-40/ untracked, both pre-existing and not mine.
- No host tool installed or upgraded; node and git already in the image were enough. The three attacks were not re-run and no mutant was written: this seat drafts prose.

Artifacts: draft /fast/scratch/hyaku/kumitate-r40/seats/ScribeSkillPattern/skill-pattern.md; this report .ufo/waves/round-40/build/ScribeSkillPattern.md
