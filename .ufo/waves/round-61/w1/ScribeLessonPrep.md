# ScribeLessonPrep — round 61, wave w1

Seat: scribe (leaf). Judged on: coverage, calibration. Milestone: lesson draft.

## Behavior

The draft is at `.ufo/waves/round-61/build/ScribeLessonPrep/lesson-draft.md`. It has six
sections: Census before → after; **Claims: both fail as declared**; Gate (the S195 admit plus the
two re-adjudicated rejects); Assimilation (the quarantine slice with a verdict per row);
**Mistakes** (class · evidence · captured-by · fix); and a closing list of retracted claims.
Every number names its receipt. Numbers from uncommitted artifacts are marked **uncommitted**;
round-close values are left to re-derive.

Per `L1Kumitate61` (09:56Z) the draft states both claims **fail as declared**, records
**0 collisions** before and after the append, and retracts the speculative held claims.
`## Mistakes` carries three rows: round-60's quarantine id-vs-document misbinding (evidence
`corpus/lessons/round-60.md` §Assimilation, captured-by **none**, fix compare by document);
this round's vacuous C1/C2 counters (captured-by the frozen-plan kill rule, fix a disclosed v2
with a positive control); and my own earlier predicted after-values (captured-by none, removed).

**Q56 and Q57 are not added.** This lane's `corpus/QUALITY.md` ends at Q55; neither id exists
anywhere in the lane, so a row citing them would be invented.

## Gates and commands (read-only, all observed)

- `build/CritControlC1.md` verdict: *"The C1 target is reachable by a do-nothing control."*
  Observed lines: a scratch lane with no seat run reads `held=4/4 checks=4` exit 0
  (`controls/ctl-c1-critic-a4-full-fabrication.txt`), and A1b/A2c read
  `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` exit 0.
- `build/CritControlC2.md` verdict: *"C2 probe doctrine61-probe.mjs (D61 v1) is BROKEN —
  vacuous for honest work, forgeable to DOCTRINE61_HELD 6/6."* Honest build
  `held=4/6` with `E3 MISS row-absent`; full forgery `held=6/6` exit 0
  (`controls/ctl-c2-critic-a5-full-forgery-held.txt`).
- I reproduced the probe defects: the row regex tests `false` on `row-S195.txt` while `\s` tests
  `true`; E3 reads `c[9]/c[10]/c[12]` where the values sit at 8/9/11; E4 reads `body.md` from the
  worktree with `readFileSync` and compares 16 hex characters.
- `base/census-before.txt` (tracked since `c2721f8`): six `W04` lines, `ok`, `exit=0`.
- Tier histogram (round-60 `awk`): `c2721f8` and `be4a820` both `rows=133 A=110 B=15 C=8`;
  working tree `rows=134 A=111 B=15 C=8`.
- Gate runs: `SOURCES_CHECK: CLEAN (rows=133 tiers=A:110,B:15,C:8 … entries_with_source=18 …)`
  and `SOURCE_DUPES: CLEAN groups=6 known=6` at committed HEAD (`git archive HEAD` copy; working
  tree: `rows=134 tiers=A:111 …`); `README_MAP: CLEAN files=147 rows=147 covered=147`.
- `row-S195.txt`: 11 cells (NF=13), sha256 `cf37b133…d02660`; pin `8ef2ee5f…f0f8fc` equals
  `sha256sum body.md` (9645 bytes); one untracked capture directory, so `git show HEAD:` fails.
- Package (read-only): `SOURCES.append.md` runs `S195`–`S349` (155 rows), no S130/S132/S141.
  S195 = MCP Architecture; S204 and S211 = arXiv 2609.29095; S200/S202 = Bailian / 2512.08296;
  S217 = Temporal Worker Versioning.
- Register `absent-defect-register.md`: sha256 `5afe1810…bad833`, 9 kumitate rows.

## Findings

1. **Both claims fail as declared.**
   - **C1:** the predicate is reachable with no dispatch (CritControlC1), so it proves internal
     consistency only. MutDispatchGate adds 4/8 surviving mutants (M2b: zero-byte report
     credited), and RevGateSchema shows `make-dispatch-actual.mjs` never turns
     `status:"completed"` into `exit`, so real seats can be recorded `dead`.
   - **C2:** the probe is vacuous for honest work and forgeable. Any `DOCTRINE61_HELD` under
     D61 v1 is false provenance by construction. Per the kill rule it fails as declared; a fix
     must be a disclosed v2, not a silent edit.
2. **Zero collisions, before and after the append** (corrected from my earlier finding).
   Package S195 (MCP) is **not adopted**; it is lane S125's document (`MERGE-REPORT.md:96`).
   Appending the Temporal row as lane S195 adds **one source document under one id**. Guard reads
   reg 133 / staged 155 / collisions 0. The caution that survives is by-document: if package
   S217 were ever appended too, the lane would hold one document under two ids, so staged S217
   is dropped, not re-keyed. ScribeSourcesRows confirmed S195 as the final id at 09:45Z.
3. **Package re-numbered since round 60.** The rejects' ids are now S211 and S200/S202/S204
   (round 60 printed S141 and S130/S132). Both flip conditions bind by document. Both rejects
   stay refused.
4. **Package holds 2609.29095 twice.** `S204` (`:16`) and `S211` (`:23`), plus lane S134, are
   three ids for one document. `MERGE-REPORT.md`'s "already holds" table pairs neither with S134.
   Root cause: S134's source cell has no locator, so `has_locator()` returns False and
   `source-dupes` skips URL-less rows. A same-rule sweep finds 5 locator-less rows of 133 at
   HEAD: S021, S035, S074, S133, S134 (receipt `locator-sweep.txt`). Scratch test: giving S134
   its arXiv URL makes one re-keyed S211 read `DRIFT … ids=S134,S211`.
5. **Drop staged S217; rewrite the entry's references.** `source: S217` (line 2) and
   `[S217 §Pinned Workflows]` (line 24) must become S195, or E2 misses. E3/E4 miss regardless.
6. **Round-60 lesson misstatement (calibration).** Round 60 called the register's S109/S116/S118
   "the lane's own rows". They are the campaign's id space. By document, register S109 = lane
   S125, S118 = lane S134, S178 = lane S194; the lane has no S129/S142–S145/S178. The same item
   is in ScribeErratum's `erratum.md`, which also corrects the fleet report (lines 146–148).
7. **Quarantine count: 9, reconciled.** ScoutQuarantineRegister's count matches. Re-verified:
   present 8, absent 1 (S116 splice), unverifiable 0. The +16 remap chain is verified for all 9
   rows (ID-REMAP.md, URL equality), so the S143–S145/S178 verdicts are not inference. Recheck
   cautions: S109's sentence is split by JSX (count `clientCapabilities` → 8); S116 is a
   correction, since the paper has only `[v1]`.

## Touched surfaces

- `.ufo/waves/round-61/build/ScribeLessonPrep/lesson-draft.md` (new)
- `.ufo/waves/round-61/w1/ScribeLessonPrep.md` (this report)
- `.ufo/waves/round-61/build/ScribeLessonPrep/locator-sweep.txt` (new)
- `.ufo/waves/round-61/build/ScribeLessonPrep/dupes-scratch.txt` (new; scratch under
  `/tmp/kumitate-r61/ScribeLessonPrep/`)

## Out of scope

- I edited no `corpus/` file, no registry row, no lesson and no product code.
- My gate runs were read-only (sources-check, source-dupes, readme-map, sources-census). Mutating
  probes ran on scratch copies or `git archive` trees. No jj mutation and no `git add`/`commit`.
- I did not touch the campaign tree.

No tools were installed.
