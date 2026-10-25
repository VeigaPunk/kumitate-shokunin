## Erratum — round-60 report (`.ufo/reports/round-60/kumitate.md`, fleet `7b0581ed`)

Filed bytes are not rewritten; this section supersedes the lines it names. Defect ids are the
verifier's (`corpus/lessons/round-60-verifier-spotcheck.md` §5, lane commit `33043377`). Nothing
here upgrades a round-60 verdict: C1 operability stays `unprovable`, C2 coverage stays `improved`.

- **R60-V2 — placeholders resolved.** `__TIP__` and `__MEASURED__` (report lines 4–5, 88, 96,
  190) both mean `a745a3b0e02253e722834ef95042d97ed92e5e53`, the round-60 lane tip and the only
  revision either counter was measured at. `__COMMITS__` (line 73, wave evidence) landed in round
  61 as `165b83044d33cbd52fc2209aefe57edfd7e6590a`; the other round-61 commits so far are
  `c2721f81`, `48877b4d`, `be4a820c` (`git log a745a3b0..HEAD`), and L1 appends any later ones.
- **R60-V3 — 9/10 corrected to 8/10.** At `a745a3b0` the receipt reads `DISPATCH60:
  DISPATCH60_UNMET held=8/10 checks=10`, with misses `A7 MISS row-absent` and `A10 MISS exit=2
  DISPATCH_EVIDENCE: FAIL-CLOSED wave-dir-absent` (`.ufo/waves/round-60/close/dispatch60-work.txt`).
  Line 85's "`held=9/10` — the only miss is A10" is wrong, and so is line 88's `held=10/10` at the
  measured revision: no committed revision ever held 10/10.
- **R60-V4 — tip receipts produced at `a745a3b0`.** Commit `be4a820c` adds
  `.ufo/waves/round-60/close/dispatch60-tip.txt` (`DISPATCH60_UNMET held=8/10`, `exit=1`) and
  `doctrine60-tip.txt` (`DOCTRINE60_HELD held=6/6`, `exit=0`), both stamped
  `rev=a745a3b0e022…`. Lines 89 and 97 now point at real files, but line 89's receipt contradicts
  the report's `HELD`; the D60 receipt agrees with the report.
- **R60-V9 — S141 vs S211, id precision only.** The `exactly-once-attribution.md` reject (report
  line 153, `corpus/lessons/round-60.md:32`) names `S141`, the snapshot id
  (`.ufo/waves/round-60/assimilation/staged-ids:17`). The package now assigns `S211` to the same
  arXiv 2609.29095 document (entry `source:` line 2, `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/exactly-once-attribution.md`).
  Mapping is by document, so the reject reason and its flip stand unchanged, read with the current
  id `S211`.
- **R60-V1 / V7 — fixed by `165b8304`.** That commit lands the six modified files and the seven
  untracked wave paths (`git status --porcelain` now lists only round-61 paths). At that commit
  `LOG.md` has the round-60 entry (`grep -ci 'round 60'` → 1, was 0 at `a745a3b0`), and
  `SCORECARD.md:1794` names round 60. These are post-round landings, so they do not retro-satisfy
  A7 at `a745a3b0`.
- **R60-V5 / V6 — evidence landed by `165b8304`, repairs belong to this round's wave.**
  `165b8304` commits `w1/swarm-registry.json` (still `members` as an object, 32/32
  `agentId: null`, no `dispatch-actual.json` at `be4a820c`) and `w1/launcher-progress.tsv`
  (32 rows, 27 `session=null`). The schema fix is round-61 seat `ExecDispatchSchemaTool`
  (R60-V5). The dead-seat naming, with 27 of 32 dead and the `launcher.py.txt:95` `ValueError`
  that falsifies line 10's "the parent stayed alive until settlement", is seat
  `ExecDeadSeatTable` (R60-V6); L1 cites their landed hashes.
- **Quarantine-slice ids are the campaign's, not the lane's (lane-found, no verifier id).**
  Report lines 146–148 and `corpus/lessons/round-60.md:68–71` call register S109, S116 and S118
  "the lane's own rows". They are actually the campaign's `kumitate` rows in
  `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md:136–138`;
  the lane's own S109, S116 and S118 are unrelated Kafka and Temporal-visibility pages, and the
  lane has no S129, S142–S145 or S178. "None of the nine was adopted" holds for the register's
  rows and quotes, but by document three of the nine are in the lane under lane ids with the
  lane's own captures: register S109 = lane S125, S118 = lane S134 and S178 = lane S194
  (details in `.ufo/waves/round-61/build/ScribeLessonPrep/lesson-draft.md` §Assimilation).
- **R60-V8 — open at `be4a820c`, repair belongs to this round's wave.**
  `corpus/lessons/round-60-verifier-spotcheck.md` has no `corpus/README.md` row and no
  `.ufo/pins/readme-map.json` entry (both `grep -c` → 0 at HEAD). Seat `ExecReadmeMapFix` (reviewed
  by `RevReadmeMap`) carries the fix, and L1 cites its landed hash.
