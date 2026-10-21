REVENGER_C1 sources=20 acceptance_quoted=yes

# Why K got the distinct-member term in round 22 while S/R stayed occurrence counts

Wave axes: operability + coverage (orchestration & tooling); this item serves C1 (operability).

## The original defect statement (round 17, uncounted critic finding)

First written form — `corpus/lessons/round-17.md:75-90` (§1 "Duplicate sections can inflate the layer numerator"):

> `claims-check.mjs` checks a row's declared count with a distinct set over `s.file ?? s.heading` (`scripts/claims-check.mjs:378`); `proxy-check.mjs` increments `R_sections` for every in-family section occurrence (`scripts/proxy-check.mjs:412`). A duplicated section plus a missing member can therefore keep the row's occurrence count at the threshold while verifying fewer distinct files.

Same defect as a halt-condition rejection — LOG.md round-17 entry, LOG.md:905-924:

> The critic found a real halt-condition defect rather than a defect in the landed rows: `proxy-check.mjs` sums in-family section **occurrences**, while `claims-check.mjs` dedupes files only for its declared-count finding. A doctored R8 note with one duplicate and one missing member retained four occurrences and a warning-only `MATCH`; an out-of-family fourth file could also mute the count warning. The planned "zero errors" halt was therefore rejected. ... Distinct-per-layer derivation and the duplicate-one/drop-one mutation case are queued for an operability round, not hidden inside this coverage move.

Frozen one-line form — SCORECARD.md:412 (move-log row 17, uncounted critic finding):

> the pre-registered halt required 8 R1 + 4 R8 in-family sections but did not state occurrence=distinct; `proxy-check.mjs` counts every in-family section occurrence while `claims-check.mjs` dedupes for its declared-count comparison | duplicate-one/drop-one was reproduced on a fixture: the occurrence numerator can stay at the threshold with a member missing. No tool change was slipped into the coverage round ...

## Stated acceptance (quoted)
1. corpus/lessons/round-17.md:88-90: "The durable hardening is queued for an operability round: derive layer numerators from distinct resolved in-family files, with a mutation case that duplicates one section while dropping another."
2. corpus/knowledge/member-claims-gate.md:106-112 (compensating control): "A score-changing row therefore needs strict adv=0 plus an explicit occurrence=distinct census until the queued distinct-numerator fix."
3. corpus/knowledge/executable-scorecard.md:63: "Limit found round 17: this counter is occurrence-based while the gate's declared-count finding dedupes files; require occurrence=distinct for a score-changing row until the queued distinct-numerator hardening lands."
4. Round-33 pre-registration = round-35 claim 2, SCORECARD.md:450-452: "**operability — distinct S/R member derivation** in `scripts/proxy-check.mjs` (queued since round 17): duplicate-one/drop-one must fire `S_SECTIONS_DRIFT` / `R_SECTIONS_DRIFT`; live trees unchanged (S 91/91, R 83/92)."
5. corpus/lessons/round-18.md:95-99: "Reject candidate: treating a numeric proxy MATCH or a strict claims MATCH as distinct-member proof. The proxy counts section occurrences, while the claims gate's files-form count only rejects undercounts. RuntimePlan independently identified duplicate-one/drop-one as the strongest falsifier; require exact identity sets and occurrences=distinct at 5/6/4."
6. Frozen wave acceptance (.ufo/waves/round-35/build-dispatch.json:1297-1303, ExecDistinct + ExecMutationBefore): "make S_sections and R_sections count DISTINCT in-family member identities (`section.file`) per layer, the convention the K layer adopted in round 22 ... Keep the 23-key kumitate-proxy-v1 stanza contract, finding names and exit map unchanged; update the header doc comment to say distinct. Add hermetic selftest cases: (a) S duplicate-one/drop-one ... => S_SECTIONS_DRIFT against a stanza declaring the occurrence count; (b) the same for R ...; (c) a control ..."; instrument prints `MUTATION S|R dup-one/drop-one before=<n> after=<n> killed=<yes|no>` and `MUTATION_KILLS <k>/2`.

## Why K moved in round 22 and S/R stayed queued
1. **Round discipline.** The defect was found in a coverage round; the lane's rule was "No tool change was slipped into the coverage round" (SCORECARD.md:412) and the queue named an *operability* round explicitly (round-17.md:88-90, LOG.md:922-924). Rounds 18-21 were not operability rounds (18 = definition/expansion, no live axis moves; 19 = operability but spent on the f_O walk; 20-21 = coverage:kimi-layer), so the queue survived.
2. **K's tightening was pre-registered one round ahead with a LIVE wrong number.** Round 21 recorded: "the occurrence term now credits ~30 distinct members — the distinct-member tightening is pre-registered for round 22 and the score will drop there, honestly" (LOG.md:1069-1072; round-21.md:39-42). K's occurrence term read 52 ⇒ 10 while distinct measured ~30/49 ⇒ ~6 — a live score-honesty defect, which out-ranks a latent hole under the lowest-axis rule.
3. **S/R's hole was latent.** Every recorded census measured occurrences=distinct on live rows (R1 8=8, R8 4=4, round-17.md:44-46), and round-18's acceptance REQUIRED that census as the compensating control (round-18.md:95-99). No live integer was wrong, so no round was forced.
4. **Definition-freeze discipline applied to K too.** Round 20 refused to change the K definition in its own measuring round: "changing it in the measuring round is the exact failure mode rounds 15→16 refused; the tightening lands with its own before/after in a later round" (round-20.md:49-53). The same rule kept S/R's frozen occurrence definition until a dedicated pre-registered round (33 → 35).
5. **Round 22 was free-craft godspeed** and took the standing plan: "the measured state argued for the standing plan: the occurrence-based `K_sections` (52) was known to over-credit (duplicate-one/drop-one hole), and the distinct-member tightening was pre-registered in round 21" (round-22.md:1-6).
6. **Nuance the record blurs:** `K_sections` was never a raw occurrence counter — its round-20 frozen definition was already "distinct (note,heading) pairs" (round-20.md:50-51); round 22 tightened pair-distinct to member-identity-distinct (canonical 49 identities, full-path binding, `K_SECTION_AMBIGUOUS` warn arm 0 live, selftest 92→98/98, +247/−54 in proxy-check.mjs, pin.proxy-check re-pinned; round-22.md:8-15). S/R never had any dedupe: `layerTerms()` sums raw occurrences (scripts/proxy-check.mjs:595). The round-35 change therefore INTRODUCES dedupe on S/R rather than tightening one.

## The K convention S/R must copy

`kSections()` accumulates a Set of canonical member identities named by
member headings across all kimi notes (proxy-check.mjs:608-616 identity
contract, 654-685 `kMembersNamedByHeading`, 694-721 `kSections`); a member
counts once however many sections name it; a basename owned by several
members binds to none and warns. Model selftest cases: "distinct ≠
occurrence: a duplicated member section + a dropped one lowers the numerator
(4→3, never 4)" (proxy-check.mjs:1760-1775) and "stanza drift arm: declaring
the OCCURRENCE count (2) where distinct is 1 is K_SECTIONS_DRIFT alone"
(proxy-check.mjs:1861-1879).

## Every place that would need to change for S/R

Code (one file; the dispatch keeps names/exit map/stanza keys unchanged):
- scripts/proxy-check.mjs:595 — the counter in `layerTerms()` (581-604):
  `if (s.inFamily === true) sections[layer] += 1;` → per-layer Set of distinct
  in-family identities. Two open forks the executor must state in the doc
  comment: (i) identity key — dispatch says `section.file`, but the gate's own
  dedupe convention (claims-check.mjs:401) is `s.file ?? s.heading`; two
  unresolved sections (file=null, different headings) count once under a bare
  `file` Set, twice under the gate's convention. (ii) dedupe scope is per
  LAYER (union across rows), not per row — K is layer-wide and round-17's
  acceptance says "layer numerators"; a member named by two different rows
  counts once either way, but a file duplicated across two rows must.
- scripts/proxy-check.mjs:86-94 — header doc comment for S_sections/R_sections
  ("Σ over the registry rows ... of the row's sections with `inFamily ===
  true`") → say DISTINCT (dispatch-mandated).
- scripts/proxy-check.mjs:46-50 — the header's "Round-22 amendment" note gains
  a round-35 sibling (or the S/R gloss flips to distinct directly).
- scripts/proxy-check.mjs selftest — new hermetic cases (a)/(b)/(c) per the
  dispatch; re-derive every fixture expect carrying S_sections/R_sections if
  its fixture can duplicate an in-family file across rows/notes: F1/F2/F3
  (1332, 1341, 1359), LAYER_KNOBS (1477-1478), xFamily (1556-1567), kCase
  (1597). TERM_KEYS 17-key check (1447-1451) and the parent-frozen 23-key
  stanza check (1452-1455) are unchanged by design.

Pins/stanza (SCORECARD.md):
- pin.proxy-check must be re-pinned after the edit (layer-axes.md:269-270:
  both files re-pinned after any edit to either; claims-check.mjs needs NO
  code change here, so pin.claims-check stands).
- Stanza declared S_sections/R_sections (SCORECARD.md:284-289) re-pinned to
  the pinned-revision re-census.

Docs (current-facing prose; historical entries stay as recorded — round-32
precedent "the historical prose occurrences stay", commit 6b982ab):
- SCORECARD.md:163-172 (script gloss "member sections only (`inFamily ===
  true`)" → distinct), 185-188 (S_sections definition), 220-249 (R_sections
  definition), 247-250 (cross-check arithmetic 143/146 re-derived),
  309-311 (`## Axes` integers per the re-census), 450-452 (claim 2's "live
  trees unchanged (S 91/91, R 83/92)" clause is FALSIFIED by the re-census —
  the round-35 record must state the reconciliation, not absorb it).
- SKILL.md:651-671 (formula gloss "Σ of member sections the claims gate
  verifies ... in-family only" → distinct), 764-781 (contract stanza
  description; key list unchanged).
- corpus/knowledge/layer-axes.md:35-37 (formulas, names unchanged), 51-52
  (V_layer gloss), 83/85 (derivation table "Σ in-family member sections"),
  130-131 + 172-176 (occurrence=distinct reconciliation), 288-292
  (members-without-section arithmetic), 315-318 (drift-kind fire-conditions),
  344-356 (exit-map examples).
- corpus/knowledge/member-claims-gate.md:106-112 — the "until the queued
  distinct-numerator fix" limit paragraph is obsoleted by the fix; rewrite to
  the landed convention.
- corpus/knowledge/executable-scorecard.md:63 (occurrence row → distinct),
  300-303 (append the landed fix to the round-17 limitation note), 350-354.
- corpus/README.md:64-68, 87-90 — rows for the three knowledge notes name the
  "occurrence-vs-distinct limit"; C2 requires row↔file agreement, so blurbs
  update with the notes.
- New: corpus/lessons/round-35.md + README row + LOG.md round-35 entry
  (integrator's land, not this report's).
- Historical, DO NOT edit: lessons/round-17.md, round-22.md; SCORECARD move-log
  rows 404-416; LOG.md pre-round-35 entries.

## Measurement gap the implementer must close (not recorded in history)
- Baseline .ufo/waves/round-35/baseline/proxy-json.txt:23-28 reads computed
  S_members=88 S_sections=86, R_members=92 R_sections=83 — all OCCURRENCE
  counts (current code) — against declared 91/91/92/83, firing
  S_SECTIONS_DRIFT declared=91 computed=86 delta=-5 (proxy-json.txt:122-127;
  also proxy.txt:5). R already matches its declared 83; S does not (the
  upstream restructure at 31c465f1 deleted 3 S-members and 5 sections).
- Whether DISTINCT == 86 (S) and == 83 (R) at 31c465f1 is NOT recorded
  anywhere: no tool prints a distinct S/R count today. The executor must print
  occurrences vs distinct per layer at the pinned revision before re-pinning;
  if distinct < occurrence live, the stanza takes the distinct value and C2's
  `floor(10 × 86/88)` = 9 baseline must be restated on the distinct numerator.
- [INFERENCE] From every recorded census (R1 8=8, R8 4=4; round-18 acceptance
  requiring occurrences=distinct) the live trees most likely measure
  distinct == occurrence, but no source states it for the full 88/92 universes
  at 31c465f1.

## Evidence trail (commands run)
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --format='%h %cs %s'`
  (read-only). Round anchors: c860887 r17, 682c453 r18, 154fc45 r19, 4fc889c
  r20, dac6599+160d032 r21, 1955f74 r22, edfb9c5/5d250b4 r32, f61cfc2 r33,
  1a8eed5 r34, 1770305 HEAD.
- Reads: LOG.md:894-943,1059-1108; SCORECARD.md:403-419,429-473,284-311;
  lessons round-17/18/20/21/22; scripts/proxy-check.mjs (header 20-177,
  287-290, 581-604, 608-721, selftest 1194-1879); scripts/claims-check.mjs
  (386-392, 401-407, 692-703); corpus/knowledge/layer-axes.md (full);
  member-claims-gate.md:99-115; executable-scorecard.md:31-97,175-176,233-236,300-303,350-354;
  SKILL.md:651-671,764-781; corpus/README.md:63-68,87-90;
  .ufo/waves/round-35/build-dispatch.json:1290-1313; .ufo/rounds/round-33/lesson.md;
  baseline proxy-json.txt/proxy.txt/proxy-selftest.txt.
- Writes: this report file only. No git/jj mutation, no proxy/claims run
  (not assigned to this item), no tool installs (none needed).
