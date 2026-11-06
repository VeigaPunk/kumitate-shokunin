# QUALITY criterion draft — Q86 (next free number; QUALITY.md's last criterion is Q85)

Number check: `grep -oE "Q[0-9]{1,3}" corpus/QUALITY.md | sed 's/Q//' | sort -n | uniq | tail -1`
→ `85`; Q78 is a bullet, not a heading, so heading counts undercount. Q86 is free.

Intended landing: `corpus/QUALITY.md`, appended after Q85, in the same block shape (Rule / Grounding /
Who checks / Field / Command / Fails when / Shown able to fail / Limit).

---

### Q86 — a capability counter scores at least one input set drawn after the candidate is final (round 92)

- **Rule.** A counter that decides a capability claim must score at least one input set that did not
  exist, and could not be computed, when the candidate's author could read the frozen counter: the
  set is drawn at scoring time, and its draw is salted with a digest of the candidate's own bytes, so
  the same bytes always draw the same set and no earlier bytes do. At least one other scored input
  must post-date the freeze (for a transcript-shaped capability, a wave whose transcripts are written
  after the tool is final). A pre-frozen set may be scored as well and may carry the stratification,
  but it may not be the only scored set. The receipt prints the salt, the candidate's sha256 and the
  drawn set's count as separate fields; a merged single number does not satisfy the rule.
- **Grounding.** Rounds 87–91 all stopped under this class. Each round's counter scored only arms
  committed before the candidate existed, and each round a construction read the expected verdict off
  those arms and reached the full mark while skipping a claimed behaviour: r87 `cand-a-worktree` 12/12
  (`corpus/lessons/round-87.md:24-27`); r88 nine one-to-six-line diffs at 20/20
  (`round-88.md:24-25`); r89 `cand-probe-keyed` (computes nothing) and `cand-skip-mode` at 30/30
  (`round-89.md:25,30-31`); r90 a whole-text strip and two context-gated prefixes at 47/47
  (`round-90.md:42-45`); r91 three token-keyed constructions at 56/56 (`round-91.md:70-72`,
  `K91CriticA/scores.md`). The r89 close names the cause: "the root cause is the scorer class, not the
  instrument" (`round-89.md:40`). Q82, Q84 and Q85 each caught their own slice of this and each can
  fail (Q82: the probe-keyed 30/30; Q84: `ctl-r90-*-gated+ref.txt` at 47/56 with eight
  `FAIL A=PASS B=FAIL`; Q85: `close-l1/class-sampler.txt` at 25–34/36), but none of them forbids
  scoring only on an input set the candidate can read at freeze; `considerthese/2026-11-05.md` idea 3
  proposed the held-out set at the fourth UNMET in the streak.
- **Who checks.** The L1 before the freeze: names the drawn-after set and its salt, and shows that at
  least one scored input cannot exist at freeze. A reviewer seat re-derives the salt from the shipped
  bytes and re-draws the set; a critic seat attempts a pre-computed lookup keyed to the sample.
- **Field.** The counter's receipt prints `salt=<first 16 hex of sha256(tool bytes)>`,
  `tool_sha256=<full>`, and per-set counts (`A=`, `C=`, `W=`); the counter reads only the tool's bytes,
  the frozen sample A, the frozen index and the wave result files — nothing whose content the
  candidate controls.
- **Command.** From the lane root at the integration commit:
  `python3 .ufo/waves/round-92/probe/probe92-c1.py --tool scripts/seat-route.mjs --index .ufo/waves/round-92/probe/index92.tsv --sample-a .ufo/waves/round-92/probe/sampleA.tsv --waves .ufo/waves/round-91/w1-results.json,.ufo/waves/round-92/w1-results.json --out <receipt>`
  prints `C92_C1: HELD agree=n/n … salt=<16 hex> tool_sha256=<64 hex>`; `salt` must equal the first
  16 hex of `sha256sum` of the scored tool, and the `W=` count must come from the post-freeze wave.
- **Fails when.** The only scored set was committed before the candidate; the salt is a constant, a
  round token or a fixture name; the drawn set appears in the tree before the candidate is final; the
  drawn count is merged into one total so a held-out miss is invisible; the "held-out" wave was
  written during the freeze rather than after the tool.
- **Shown able to fail.** (i) `.ufo/waves/round-92/controls/table.txt`: nine non-positive controls read
  `UNMET` at `agree=0/133` (do-nothing, and the existing `inline-dispatch-evidence` lane gate), 54/133,
  70/133, 102/133, 120/133, 121/133, 126/133 and 132/133 while the positive oracle reads
  `HELD agree=133/133` — the 132/133 `ctl-noredact` row shows one omitted field still loses on the
  drawn sample, so the drawn set is not a rubber stamp. (ii) The five prior rounds are five instances
  of the failing case: counters that scored only pre-frozen inputs, each returning a full mark to a
  construction that skipped a behaviour (r87 12/12 → r91 56/56).
- **Limit.** The rule bounds *when* the scored inputs are drawn, not whether they are representative: a
  construction that agrees on the drawn strata has implemented the definitions there, and strata
  outside the draw stay unmeasured. It does not apply to counters whose input is the candidate's own
  artifact set, where held-out means scoring a different revision rather than a different draw. And it
  does not by itself stop a construction that reads its own bytes at run time to reproduce the draw —
  that construction must then answer the drawn inputs, which is either the implementation or a read of
  the oracle (a separate kill clause). A build-time lookup table cannot be keyed to a salt that
  depends on that table (design argument, not a measurement; the round-92 counter's clause (d) forbids
  the oracle route).

---

Drafting note for the L1: if the round's construction findings show a further way to reach `HELD`
without implementing the frozen field definitions, it belongs in `## Gate` as a counter finding and,
if general, as a second criterion — not as an edit to the rule quoted in a frozen `## Kill rule`.
