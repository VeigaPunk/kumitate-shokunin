# RevengerCounterIntent — why A57's B7 binds items 24..27, not the count alone

Round 57 (hyaku run 5), seat `RevengerCounterIntent`, 2026-10-24. Lane:
`/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only for this seat; all
writes under `.ufo/waves/round-57/build/RevengerCounterIntent/` and this report).
No tool installs. No commits. No production edits.

Question: reverse-engineer why the A57 B7 arm asserts `items === 27` **and** the
positional id→gate bindings for items 24..27, rather than the count alone; trace
the A54/A55/A56 supersession history through LOG.md/SCORECARD corrections; judge
whether the amended shape matches the routed R56-V2 intent.

---

## 1. Reconstructed contract of B7, per frozen counter (byte evidence)

All four counters read SKILL.md's `## Verifiable checklist` (SKILL.md:676) by
counting item lines `/^\s*- \[/`. Arm sources excerpted verbatim in
`build/RevengerCounterIntent/b7-arm-A{54,55,56,57}.txt`; probe sha256s in
`build/RevengerCounterIntent/probe-sha256.txt`.

| Counter | Header claim (frozen prose) | Code actually checks | Binding half |
|---|---|---|---|
| A54 (`attest54-probe.mjs:51-53,351-367`) | "exactly 24 items whose item 24 names `node scripts/counter-pins.mjs`" | `items.length === 24 && /node scripts\/counter-pins\.mjs/.test(items[23])` — **positional** | newest only, positional |
| A55 (`attest55-probe.mjs:50-52,276-285`) | "exactly 25 items whose item 25 names `node scripts/source-capture.mjs`" | `items === 25 && /- \[ \][^\n]*source-capture\.mjs/.test(txt)` — **existence-only, any line** | newest only, NOT positional (header/code drift) |
| A56 (`attest56-probe.mjs:51-53,292-301`) | "exactly 26 items whose item 26 names `node scripts/source-dupes.mjs`" | `items === 26 && /- \[ \][^\n]*source-dupes\.mjs/.test(txt)` — **existence-only** | newest only, NOT positional (same drift) |
| A57 (`attest57-probe.mjs:53-58,317-329`) | "exactly 27 items AND item 24 names `counter-pins.mjs`, item 25 `source-capture.mjs`, item 26 `source-dupes.mjs`, item 27 `readme-map.mjs` (the R56-V2 amendment: capability moves bind every item id, never only the newest)" | `items === 27 && itemLines[23..26] include counter-pins.mjs / source-capture.mjs / source-dupes.mjs / readme-map.mjs` — **positional, whole band** | all four, positional (first arm whose code matches a positional header claim for every bound item) |

Live checklist (SKILL.md, rev f0dc6d11): 27 items; item 24 = line 717
(counter-pins, r54), 25 = 718 (source-capture, r55), 26 = 719 (source-dupes,
r56), 27 = 720 (readme-map, r57). The bound band is exactly the
capability-acquisition band; items 1..23 predate it and no B7 ever bound them.

## 2. Supersession history (LOG.md / SCORECARD / lesson, with receipts)

1. **r54 (LOG.md:2085-2094):** A54 frozen v1 (10 checks). B7 introduced the
   shape "count + newest item": `exactly 24`, item 24 → counter-pins. Held
   10/10 at R1. No obsolescence existed yet; B7 was born with one binding.
2. **r55 (LOG.md:2111-2136):** A55 frozen with `exactly 25` + existence-only
   item check. LOG records the first supersession explicitly: "Named
   counter-obsolescence: frozen A54 asserts exactly-24 checklist items; the r55
   capability move makes it 25, so A54 reads 9/10 at R3 (B7) while
   A53/D53/D54 remain HELD."
3. **r56 (LOG.md:2141-2173, SCORECARD r56 block ~2661-2666):** A56 frozen with
   `exactly 26` + existence-only. LOG: "A54 reads 8/10 (B7+B8 class) and A55
   9/10 (B7) at close" — see divergence D1 below; every committed receipt says
   9/10 for both. SCORECARD: "the frozen A54 exactly-24 and A55 exactly-25
   checklist literals read MISS items=26 — the named counter-obsolescence of a
   capability acquisition … recorded not hidden".
4. **r56 verifier spot-check (corpus/lessons/round-56-verifier-spotcheck.md §1,
   §6.2):** non-author reading "A54 (exactly-24 items) and A55 (exactly-25) read
   `UNMET 9/10` … (`close/prior-probes.txt`, B7 `items=26`). Named cost of the
   capability move; an append-only counter-amendment convention exists (r53)."
   Routed item: "consider the established counter-amendment convention so
   capability moves stop retreading named obsolescence."
5. **r57 (plan §Routed-defect answers; LOG.md:2204-2215; SCORECARD r57 close
   block ~2707-2712; corpus/lessons/round-57.md §Mistakes R57-2):** the
   amendment lands in the NEW frozen counter, not by editing old ones:
   "A57's B7 arm carries BOTH conjuncts — the checklist carries exactly 27
   items AND item 24 names counter-pins.mjs, item 25 source-capture.mjs, item
   26 source-dupes.mjs, item 27 readme-map.mjs — freezing the A54/A55
   supersession convention: a capability move that grows the checklist must
   name EVERY item id→gate binding, never only the newest; future superseding
   rounds re-express the same way." A57 B9 additionally binds the prose (lesson
   must name R56-V1/V2/V3; LOG must carry V2+V3) to the same commit.

Committed receipts observed (all at named revs, no HEAD move):

| Receipt | Rev | Reading |
|---|---|---|
| `.ufo/waves/round-56/close/prior-probes.txt` | e4a49432 | A54 `9/10` `B7 MISS row=true items=26 item24=true`; A55 `9/10` `B7 MISS row=true items=26 item25=true`; B8 PASS both |
| `.ufo/waves/round-56/close/INTERIM-attest56-d7da54ab.txt` | e4a49432 | A56 `9/10` with `B8 MISS receipt files missing` (pre-receipt interim) |
| `.ufo/waves/round-57/base/attest57-base.txt` | 7178bfd | A57 `held=0/10`; `B7 MISS row=false items=26 i24..27=false` |
| `.ufo/waves/round-57/close/prior-probes.txt` | f0dc6d11 | A54 `9/10` `items=27 item24=true`; A55 `9/10` `items=27 item25=true`; A56 `9/10` `items=27 item26=true`; A53/D53-D56 HELD |
| `.ufo/waves/round-57/close/prior-counters-at-close.txt` | b3bd0633 | same pattern at a second close-family rev |
| `.ufo/waves/round-57/close/FINAL-attest57-R1.txt` | f0dc6d11 | A57 `HELD 10/10`, B7 PASS |

**My independent re-run** (build dir `probes-rerun-f0dc6d11.txt`, probes pinned
in `probe-sha256.txt`) reproduces every line above at f0dc6d11: A54/A55/A56
`UNMET held=9/10` exit 1 with B7-only MISS and `item24/25/26=true`; A57
`ATTEST57_HELD held=10/10` exit 0. Note the diagnostic detail that carries the
whole story: **at items=27 the old counters' binding halves are still true
(`item24/25/26=true`); only their count literals miss.** The count half is the
fragile half; the binding half is the durable half.

## 3. Why 24..27 and not the count alone (causal reconstruction)

1. **A count-only B7 re-creates the routed defect one round later.** R56-V2 is
   not "a number changed"; it is that the supersession shape lived only in
   prose corrections, and each counter bound only the newest item. A57 B7 as
   `items === 27` alone would pin cardinality but not which gates the checklist
   carries: dropping/renaming `source-capture.mjs` while adding filler still
   passes, and r58 would again hand-amend a dead literal. Binding the band puts
   the convention "name EVERY item id→gate binding, never only the newest"
   inside the scored predicate, so the next capability move must re-express
   24..27+28 in full — the shape is self-propagating.
2. **All fragile, no durable.** The receipts show count literals going stale at
   every capability round (24→26→27) while binding halves never did. A
   count-only arm is entirely fragile half; it would read MISS at the next
   acquisition with zero surviving content, plus a weaker kill surface (one
   conjunct instead of five: row + count + four bindings — each droppable by
   the K3 drop-one mutants killed by the literal `held=10/10 checks=10`).
3. **It corrects a real drift the old counters cannot fix in place.** A54 bound
   position; A55/A56 drifted to existence-only while their frozen headers still
   claimed "item 25"/"item 26" (divergence D2). Per the lane's own doctrine
   (`corpus/knowledge/counter-amendment-discipline.md`, C14: "Nothing changes
   after the first candidate score", C16: cite the origin, never re-derive) the
   frozen A55/A56 bytes cannot be repaired — the only orthodox vehicle is
   re-expression in a new frozen counter. A57's positional `itemLines[23..26]`
   is that re-expression, and it is strictly stronger: it subsumes A54's
   positional check of item 24 and hardens what A55/A56 only claimed.
4. **Anti-forgery depth at base.** At base 7178bfd, B7 misses on three
   independent grounds (`row=false items=26 i24..27=false`); count alone would
   miss on one, and a do-nothing tree that appends one generic item to reach 27
   would still fail row and binding.
5. **Why 24 as the band start:** 24 is the first capability-growth checklist
   item (counter-pins, r54) — the supersession chain's origin case. Items 1..23
   were never bound by any B7 arm; the convention concerns capability growth
   [INFERENCE for the 1..23 exclusion: no frozen rule ever bound them and the
   plan/lesson text frames the convention as applying to capability moves].

## 4. Judgment: does the amended shape match the routed R56-V2 intent?

The routed intent (lesson §6.2) has two readings:

- **Strong reading** — capability moves stop *producing* stale counters. Not
  achievable and not claimed: the append-only doctrine forbids editing frozen
  A54/A55/A56, so their exactly-N literals must MISS at items=27. The round
  embraces this instead of hiding it (H5: "recorded as named
  counter-obsolescence … not hidden"; SCORECARD r57: "the frozen A54/A55/A56
  exactly-N literals stay as written and read MISS at items=27"). My re-run
  confirms those MISS readings are exactly B7-count, nothing else regressed
  (A53/D53–D56 HELD; old B8/B9/B10 arms PASS).
- **Operative reading** — moves stop *retreading* obsolescence: no more
  re-deriving the supersession from LOG/SCORECARD prose each round, and no more
  newest-only bindings. This IS achieved: the full id→gate map (24→counter-pins,
  25→source-capture, 26→source-dupes, 27→readme-map) now lives in exactly one
  frozen place, executable, with the header/code prose bound by A57 B9 (lesson
  and LOG must name R56-V2 in the same tree), and the plan freezes "future
  superseding rounds re-express the same way".

**Verdict: the amended shape matches the routed R56-V2 intent under the
operative reading, and is the only shape available under the frozen-counter
doctrine (a growth literal "can only be re-expressed", plan §Routed-defect
answers; strictness-only amendment per doctrine C6 is inapplicable).** It does
not relax A54/A55 semantics — they still assert exactly-24/exactly-25 and still
fail at 27, exactly as written. The binding addition is strictness in the
direction the doctrine allows. Residual, accepted and named: each future
capability acquisition still flips the previous counters' count literals to
9/10-class MISS; the convention makes that cost mechanical and self-documenting
rather than eliminating it. Confidence: high (receipts + independent re-run);
the intent judgment is textual reconstruction, so [INFERENCE] on the strong/weak
reading split.

## 5. Divergences found in the recorded history

- **D1 — LOG.md r56 entry overstates the A54 miss.** LOG.md:2170: "A54 reads
  8/10 (B7+B8 class)". Every committed receipt contradicts this:
  r56 `close/prior-probes.txt` @ e4a49432 shows A54 `9/10` with `B8 PASS`; r57
  close receipts @ f0dc6d11 and b3bd0633 show the same; the non-author lesson
  says 9/10; my re-run says 9/10 (B7-only MISS). No committed artifact shows an
  A54 8/10. The only B8-miss receipt in the r56 close dir is A56's INTERIM
  (receipt files missing) — plausibly the drafting source of the conflation
  [INFERENCE]. The r57 records (plan, LOG r57, SCORECARD) already state 9/10
  correctly; LOG.md r56 remains uncorrected as written (append-only).
- **D2 — A55/A56 frozen headers claim positional bindings their code does not
  check.** Headers say "item 25"/"item 26"; code tests any item line
  (`/- \[ \][^\n]*…mjs/`). Unfixable in place under C14; A57's positional band
  is the orthodox correction. This drift is itself part of why "bind every id
  positionally" had to be re-frozen rather than assumed.
- **D3 — the lesson's convention pointer "(r53)" does not resolve by content.**
  `grep -n amend corpus/lessons/round-{53,54,55,56}.md` → no hits; the
  counter-amendment doctrine is the r49 entry
  `corpus/knowledge/counter-amendment-discipline.md` (origin: the r42
  amendment, its C16). r53's committed conventions are the prepared-wave and
  M5/Q43 freeze discipline. Likely a loose pointer in the spot-check artifact
  [INFERENCE]; the substantive convention invoked is unambiguous.

## 6. Evidence index (this seat's writes only)

- `build/RevengerCounterIntent/probes-rerun-f0dc6d11.txt` — full stdout+exit of
  attest54/55/56/57 at f0dc6d11 (exits 1/1/1/0).
- `build/RevengerCounterIntent/probe-sha256.txt` — sha256 of the four frozen
  counters as executed (e2252e8e…, cfb6c8f3…, 6b230b47…, d177f6d5…).
- `build/RevengerCounterIntent/b7-arm-A{54,55,56,57}.txt` — verbatim B7 arms.
- `build/RevengerCounterIntent/commands.log` — every command run.
- Read-only receipts cited in §2; lane files untouched; nothing committed.
