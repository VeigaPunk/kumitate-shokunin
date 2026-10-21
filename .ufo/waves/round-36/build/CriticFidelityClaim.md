CRITIC fidelity-claim before=570 delta=-18 can-show=paired-span-substring-in-cited-range,pin-bound(src-rev=31c465f15669),per-note-gated-count-monotone

# CriticFidelityClaim — C1 fidelity leg (round 36 build, read-only critic)

Verdict: 588 comes from the prototype. It is not the FIDELITY v1 number. I re-derived the count from the pristine tree with my own implementation of the frozen contract: **nonok=570**
(anchors=1494 ok=330 elsewhere=476 absent=94 dead=168 noid=426, over 174 physical member sections). delta = 570 − 588 = **−18**.
Separately, edits that destroy anchor truth can reach nonok=0 while every lane gate stays green (§2). Of the 570, at least 132 are
artifacts of the pairing or binding rule, not stale anchors (§3).

## 1. Re-derivation (pristine 0614092, pin 31c465f1)
- pristine = `git -C <lane> archive 0614092e… | tar -x -C /fast/scratch/kumitate-r36/w/CriticFidelityClaim/pristine`. The live lane tree
  equals 0614092 for scripts/corpus/SKILL.md (`git diff --stat 0614092 -- scripts corpus SKILL.md` is empty). src = pin clone, `git rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7.
- Implementation: `…/CriticFidelityClaim/fid.mjs`. Sections come from the gate's own `^## ` chunks, zipped 1:1 with `probeSections()` rows (it aborts on any mismatch).
  It uses the gate's `makeResolver`, right-first adjacent-then-validate pairing, classifies dead before noid, and counts each physical section once.
  Its knobs reproduce both baselines exactly, so every difference traces to one anchor-level diff:

| run (pristine tree) | anchors | ok | elsewhere | absent | dead | noid | nonok |
|---|---|---|---|---|---|---|---|
| FIDELITY v1, my reading | 1494 | 330 | 476 | 94 | 168 | 426 | **570** |
| prototype knobs (= baseline/fidelity-prototype-v1.txt) | 1530 | 340 | 492 | 96 | 173 | 429 | 588 |
| L1 reference knobs (= baseline/fidelity-reference.txt) | 1504 | 330 | 481 | 96 | 173 | 424 | 577 |
| arm semantics (ExecClaimsFidelity code, emulated) | 1520 | 338 | 487 | 94 | 172 | 429 | 581 |

The −18 breaks down into four prototype defects:
- **+11 double count.** failure-telemetry.md has ONE member section (`## \`scripts/ufo-mission-result.mjs\``, :20). SCORECARD.md:126 (S2) and
  :129 (S5) both claim the note. The prototype loops over `probe.rows × row.sections` with no dedupe (fidelity-prototype-v1.mjs.txt:22), so 22 anchors are counted as 44.
  Under S2 that same section is also `SECTION_FILE_NOT_MEMBER`.
- **+4 wrong section.** `h[1].includes(sec.heading)` (v1.mjs.txt:25; reference.mjs.txt:27) matches two topic headings first:
  native-judge-pipeline.md:51 `## Judgment order — \`native.rs::judge_handoff\` (:470)` and :128 `## Contract-hash mechanism (\`native_contract.rs\`)`.
  The real member sections are at :186 and :256. Result: 7 topic-section anchors walked, 4 of them nonok. The gate's own chunks hold 0 anchors for this note.
- **+2.** `config:53` and `config:49` are paired as symbols (ops-watchers.md:387, :419). The prototype's anchor test requires a file extension.
  Under the contract (`path:N`) these spans are anchors, so their anchors become noid.
- **+1.** `"  "` is paired as a symbol (runtime-support.md:88). It fails "not only punctuation".

The contract text leaves two choices open, and each moves the before:
- Per-parse vs physical counting: 581 vs 570. The arm counts per parse; see its comment at ExecClaimsFidelity/lane/scripts/claims-check.mjs:611-613,
  "a note claimed by two rows is counted once per parsed section".
- Adjacent-then-validate vs first-valid-in-window pairing: 570 vs 588. The second reading also lands on 588, by coincidence, with a different mix
  (ok=332 absent=100 noid=406). So the value 588 is not evidence that it was computed correctly.

v0 is a different measure, not an earlier reading of the same one:
- v0 TOTAL `nonok=554` = elsewhere 338 + absent 46 + **dead 170**, so v0 counted dead anchors as debt.
- v0 counted bare `:N` anchors only (993). Its per-note counts match my bare-only counts: native-trial-launch 45, remaining-scripts-census 357,
  route-probe-cluster 74, sighting-wall 52, swarm-wave-lifecycle 4. It also has the same double count (failure-telemetry 2 vs 1) and the same native-judge-pipeline topic walk (7).
- The contract's bare-only equivalent is 966 anchors with elsewhere+absent+dead = 557.
- v0→v1 changed two things at once: it added path anchors to the universe (+537), and it took dead out of the gated sum (−170). The second change is what makes the past-EOF loophole (§2) free.

Arm status: running ExecClaimsFidelity's in-flight copy failed with `ReferenceError: activePin is not defined` (claims-check.mjs:729) on both trees.
The arm row in the table is therefore my emulation of its code: no section dedupe, RE_SPAN `[^\`\n]*`, a paired span must contain a letter.

## 2. Counterexample: CLEAN without truth
Setup: a copy of pristine with two mechanical rewrites (326 changed lines in 14 notes):
1. Every `elsewhere` anchor is widened to the file's first..last non-blank line, e.g. `PROFILE` (`:50`) becomes `PROFILE` (`:1-4321`).
2. Every `absent` anchor's paired symbol is un-backticked.

Results:
- FIDELITY: anchors=1494 ok=816 elsewhere=0 absent=0 dead=168 noid=510 **nonok=0**, so CLEAN. The live all-zero
  `.ufo/pins/fidelity-ratchet.json` would also pass.
- `node pristine/scripts/claims-check.mjs --self <copy> --src <pin>` prints `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)` exit 0,
  identical to pristine. Under `--strict` the advisories are the same as pristine.
- `proxy-check.mjs --self <copy> --src <pin>` prints the same DRIFT line as pristine (pre-existing C2_TOTAL_DRIFT, AXES_DRIFT, PIN_UNPINNED).

Single moves on their own also reach nonok=0, but each trips the registry gate:

| single move | FIDELITY result | registry gate |
|---|---|---|
| widen + absent→past-EOF | dead=262 | 1 SECTION_DEAD_ANCHOR |
| delete 591 anchor spans | anchors 1494→903 | 11 findings |
| un-backtick every paired symbol | noid=984 | 1 SECTION_NO_SYMBOL |

The combined rewrite above passes everything. Only nonok is gated: anchors, ok, noid, dead and range width are not conserved. The falsifiers in claims.md name
only "a note whose `elsewhere` count rises above its ceiling".

## 3. What the 570 is made of
- **A: 127 correct anchors that the rule pairs with the wrong symbol.** In each, the anchor is paired with its right neighbour, but its LEFT neighbour symbol is in the cited range.
  107 of them have the shape `SYM` (`:N`), `NEXT`, and 101 are in remaining-scripts-census.md (57% of its 177).
  Example: native-trial-launch.md:382 `PROPOSAL_WAVE_CEILING` (`:96`), `CAPACITY_FAILURES`. Line 96 of
  collect-omp-native-handoff-lib/base.mjs is `export const PROPOSAL_WAVE_CEILING = 16;`, so the anchor is correct. But `:96` is paired with CAPACITY_FAILURES (:102) and scores elsewhere.
  Right-paired anchors are ok 23/335 (7%); left-paired anchors are ok 307/565 (54%). Right-first is the wrong default for this corpus; a left-first reading gives nonok=443.
  The repair is a format flip (`:96` `PROPOSAL_WAVE_CEILING`), which adds no truth. Re-pointing to :102 would also pass, and would be false.
  Observed at ~02:3x, transient: ExecFidSighting's copy read 52/52 and 71/71 ok with anchor counts unchanged. 14 of its 16 A anchors kept their range (format flip), none moved.
  The copy was later reverted.
- **C: 5 bare anchors bound to another file.** The symbol sits at lines N..M of another file named in the same section, e.g. ops-watchers.md:369 `:277-288` `targets` → the-tick-ping.mjs.
  The truthful fix is to qualify the path, and the anchor then leaves the universe.
- **B: 168 line drift.** 39 are within ±3 lines of the symbol's nearest occurrence, 129 within 4–20. This is real staleness at the pin; re-pointing them does add truth.
- **D: 180 far (>20 lines)** and **E: 90 absent.** Example: queue-and-claim.md:27 `fleet-dispatcher.mjs:4853` `writeQueue`, nearest occurrence 328 lines away.
  ops-watchers alone accounts for 94 D, 66 E and 154 dead. Upstream commit 057088f ("fold stale watchdog into l0-watch") shrank
  `ufo-stale-watchdog.mjs` to 250 lines. SCORECARD row S6 still says 1010 L, and ops-watchers.md:32 cites `:996`/`:1006`.
  The truthful repair is a content rewrite citing `ufo-l0-watch.mjs`. That moves the anchors out of the universe, so FIDELITY cannot certify the note either way.

At most 438 (B+D+E) of the 570 are stale anchors; 132 (A+C) are artifacts.

## 4. What nonok=0 can and cannot show
**Can show**, at src-rev=31c465f1 only: every anchor still in the gated set (backticked, own-file, live, with an adjacent pairable span) has that span as a
substring of its cited range. The result is bound to the pin and cannot rise per note under the ratchet.

**Cannot show:**
1. That the paired span is the symbol the prose cites: 127 correct anchors fail, and an anchor moved to a wrong line passes.
2. That the cited lines do what the prose says. The check is substring-only; 3 ok anchors in pristine match only inside a longer word:
   runtime-support.md:60 `route`, :192 `self`, :249 `run_distiller_live`.
3. Repair vs relocation: deleting, un-backticking, widening and pointing past EOF all read CLEAN (§2).
4. That the symbol is on the cited line for a range. ok only means "somewhere in N..M", and width is unbounded.
   The current C2 drafts are honest: R5 has 38/38 single-line anchors; R7 has 42/42 with the symbol on line N, but 39 of them are 6–230-line ranges.
   The gate would accept `:1-2390` just as readily.
5. Coverage. The gated set before is 900 anchors out of about 3931 anchor-shaped citations in corpus/ [approx; none of these are measured]:
   - 805 un-backticked in member sections
   - 337 backticked but citing other or unresolved files
   - 605 in topic or unclaimed sections
   - 690 un-backticked elsewhere

   After CLEAN, the 168 dead and 426 noid anchors are still not examined.
6. Truth at any revision other than the pin, including after a fold like ops-watchers'.

## 5. Impacted axes
- **operability (C1):** a CLEAN verdict can be bought without truth (§2), and the burn-down is overstated by 18 (prototype defects) plus 132 (artifacts).
- **coverage (C2):** C2's falsifier, "symbol on the cited line", relies on this sweep, which only checks "symbol in range".

## 6. Smallest safe corrections
1. **Fixable.** In the arm's `fidelityWalk`, dedupe walked sections by (note, heading line). Restate the before as the arm's own pristine run: 570, or 581 with
   the duplicate labelled. Do not cite 588: it includes a topic-section walk and predicate drift that no reading of v1 allows.
2. **Fixable, additive to the contract.** Store the before vector per note in the ratchet. CLEAN should also require:
   - anchors ≥ before − declared removals
   - noid ≤ before
   - dead ≤ before
   - for a range N<M, the symbol on line N

   If the contract stays frozen this round, the L1 ships an anchor-transition ledger instead: each before-nonok anchor maps to re-pointed,
   reformatted, path-qualified, or deleted-with-reason. The judge rejects C1 on any unexplained delete, unpair, dead or widen.
   Also run the after tree under the left-first reading: any anchor that was left-ok before and is not after was moved to satisfy the rule.
3. **Tradeoff (judge).** Credit at most B+D+E (≤438) as debt burned down. The 127 format flips and 5 path qualifications are conformance to the rule, not truth.
   ops-watchers' 154 dead anchors stay as debt that the CLEAN line hides. The live ratchet also lists native-judge-pipeline.md, which has 0 member-section
   anchors under the gate's parse; that entry was inherited from the prototype.

## Commands run (outputs observed)
- `node fid.mjs <pristine> <pin> '{}'` → `FIDELITY_TOTAL anchors=1494 ok=330 elsewhere=476 absent=94 dead=168 noid=426 nonok=570 sections=174`
- Prototype knobs `{"resolver":"proto","dedup":"row","body":"proto","punct":false,"ext":"list","span":"proto","pred":"proto"}` → `…nonok=588`, matching the v1 file line for line.
- Reference knobs (suffix resolver, heading dedupe) → `…nonok=577`, matching fidelity-reference.txt.
- One knob changed at a time from my reading → nonok: dedup=row 581 · body=proto 574 · pred=proto 572 · punct off 571 · pairing=skip 588 · ext/span/lenMode/resolver 570.
- `node <arm>/scripts/claims-check.mjs --self <pristine> --src <pin> --fidelity` → `ReferenceError: activePin is not defined`.
- Combined rewrite → nonok=0. The pristine claims-check on the copy prints `CLAIMS: MATCH (…sections=175 adv=6)` exit 0, and proxy-check prints the same line as on pristine.
- `wc -l scripts/ufo-stale-watchdog.mjs` (pin) → 250. `git log -1 -- scripts/ufo-stale-watchdog.mjs` → `057088f … fold stale watchdog into l0-watch`.

Files written: only `/fast/scratch/kumitate-r36/w/CriticFidelityClaim/` (pristine archive, fid.mjs, game-* copies, JSON dumps) and this report. I ran one `git status --short` in ExecFidSighting/lane (may refresh that clone's index stat cache; no content change). No tools installed.
