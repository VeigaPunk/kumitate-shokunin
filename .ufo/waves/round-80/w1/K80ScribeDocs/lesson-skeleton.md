# corpus/lessons/round-80.md — skeleton (draft against `6d03402fddf44cc9797ec590f0f888e933db4677`)

Placeholders are marked `[closure]` or `[L1 fills]`. Nothing in this file is a source row I opened;
the C1 entry's sourced row is the L1's to open and record (plan §"Sourced claim and frontier step").
The next free SOURCES id at the scaffold is **S233** (`corpus/SOURCES.md` tail is S232).

> **Superseded in part by the L1's working-tree lesson (read after this draft).** S233 was written and
> withdrawn — `source-dupes` caught it as a `new-duplicate` of S119 (`groups=7 known=6 bad=1`); entry A
> is re-pointed to **S119** (re-opened, `used-by` extended) and entry B is **S234**. The L1's lesson
> mines two other mistake classes (duplicate source row; probe label arms). This skeleton keeps the
> class the seat brief assigned (`reference-drift`, the r79 dead-pointer/record class) as an optional
> third row; its live instance is now repaired in `LOG.md`. The L1's `## Counters` quotes the close as
> `C2=197/197`, but the tree reads 198 after the lesson and its README row landed — see
> `report.md` §F7; the close re-measure must name the final number.

```markdown
author: kumitate L1
round: 80

# Round 80 — the map stops folding into the spotcheck verdict, and the O score re-derives from bytes

Two claims, two axes: C1 `operability` deepens the lane's spotcheck writer (`spotcheck-adopt` v3 —
`SPOTCHECK_COVERAGE:` and `MAP:` are two readings, and `--adopt` validates its own delta instead of
demanding a globally clean map); C2 `coverage:omp` moves the axis's derivation surface off the live
host — the O terms default to the committed `.ufo/pins/omp-shape.json` with `source=snapshot`, the live
root is the explicit `--omp-live` opt-in, and the receipt is re-captured at 65 members. Frozen plan:
`.ufo/waves/round-80/plan.md`; freeze `c6a7ebd3`; scaffolding `6d03402f`.

## Gate

Sources opened this round (rows in `corpus/SOURCES.md`; captures pinned in the round's build dir with
HTTP status and sha256 in `fetch-receipt.txt`):

- **Admit — S233, [L1 fills: title, kind, tier], status `mined`.** Opened 2026-11-04: HTTP `[status]`,
  `[bytes]` bytes, sha256 `[…]`. Located quote, `[n ≤ 25]` words: `[…]`. Criterion met: `[the sentence
  the entry needs — the two-readings split, i.e. one verdict per measured surface, or the exit-status
  discipline the split borrows]`. Boundary stated: `[…]` (what the page does not say about report maps
  or adopt journals).
- **Admit — own-work, tier A: round-79 § Limits and close observation (live-root sidecar flake).**
  Re-read at the scaffold: `corpus/lessons/round-79.md` § Limits records `O_members` 64 ↔ 68 while OMP
  holds `agent.db-{shm,wal,journal}` open; the round-79 close routed the live-root flake to round 80.
  Criterion met: the lane's own re-runnable observation grounds making the receipt the default O source
  and keeping the live read as an opt-in. Used by `corpus/knowledge/[L1 names the entry]`.
- **Admit — own-work, tier A: the round-80 base controls.** `open/c1-base.txt` (6/13),
  `open/c2-base.txt` (4/12), `controls/c1-stub.txt` (3/13), `controls/c2-stub.txt` (1/12): the two
  counters discriminate a real tool from a constant printer on both axes.
- **Reject — the `merge/kumitate/` assimilation package as a bulk append (carried, unchanged).**
  Re-measured read-only: 155 S-rows over 161 lines, `MERGE-REPORT.json` `entries=70`, `accepted=155`.
  Criterion missed: §10 proportionality and CORPUS.md rule 4. **Flip:** a dedicated assimilation round.
  `Assimilation: none` this round.
- **Reject (design, not a source) — a second census for the O plane.** The round keeps one derivation:
  `proxy-check` imports the census decision and now judges the same receipt the census writes; a second
  walk would recreate the drift the round removes. **Flip:** a host-bound diagnostic only if it stays
  non-scoring and is named as such (the `--compare` item already is).

Non-author spot-check of this Gate: `[closure — who sampled it and what they re-derived]`.

## Counters

| counter | open (`1968689f`) | scaffold (`6d03402f`) | source |
|---|---|---|---|
| proxy A / C / C2 / C2_total | 884 / 39 / 194 / 194 | 886 / 39 / 195 / 195 | `w1/K80ScribeDocs/base-readings.txt`; `scaffold-readings.txt` |
| operability | 9 | 9 | same (`--json` `terms.operability`) |
| proxy verdict | `DRIFT` (C2_TOTAL_DRIFT, O_MEMBERS_DRIFT, AXES_DRIFT coverage) | `MATCH … source=snapshot` | `open/proxy.txt`; `scaffold-readings.txt` |
| O census (entries / findings / bound) | live read, computed 65 vs declared 64 → DRIFT | 65 / 0 / 35, `source=snapshot` | `open/proxy.txt`; `scaffold-readings.txt` |
| coverage:omp | 10 declared / 9 derived at open (AXES_DRIFT) | 10 | `open/proxy.txt`; `scaffold-readings.txt` |
| OMP live shape compare | live root moving (64 ↔ 68) | `IN_SYNC entries=65 receipt=65 transient=0` | `scaffold-readings.txt` |
| spotcheck map (spotchecks / uncovered) | 46 / 1 | 46 / 0, `MAP: CLEAN` | `base-readings.txt`; `scaffold-readings.txt` |
| README map (files / rows / covered) | 195 / 194 / 194, `bad=2` | 195 / 195 / 195 | `base-readings.txt`; `scaffold-readings.txt` |
| probe C1 (base / stub → M) | 6/13, 3/13 | 13/13 | `open/c1-base.txt`, `controls/c1-stub.txt`; `c1-at-6d03402f.txt` |
| probe C2 (base / stub → M) | 4/12, 1/12 | 12/12 | `open/c2-base.txt`, `controls/c2-stub.txt`; `c2-at-6d03402f.txt` |
| selftests | spotcheck-adopt 26/26 at base | spotcheck-adopt 28/28; proxy 163/163 | `c1-at-6d03402f.txt`; `scaffold-readings.txt` |
| SOURCES rows / tier A | 171 / 146 (six carried W04) | [closure] | `open/sources-census.txt` |
| checklists (pass / listed) | [closure] | [closure — not measured by this seat: an archive copy is not a git work tree, so items 720/721/728 and 752 fail for environment reasons] | — |

## Mistakes

- **Class — `reference-drift` (a filed record's pointer that resolves to nothing).** The round-79
  verifier spot-check routed three instances (D2: a report pointer to `w1/K79MutC2/`, a path that never
  existed; D3: the r79 lesson's counter table cites `close/shape.txt`, `close/census.txt`,
  `close/readme-map.txt`, `close/spotcheck-check.txt`, none of which exists — the real files are
  `close/census-shape.txt` and `close/maps.txt`; D6: the close counter receipts carry no `rev=` line,
  so the measured revision is not named in the receipt). **Live instance measured this round:** the
  final round-79 bullet in `LOG.md` says "the full entry is the section below", and no round-79 section
  exists in that file — `grep -c '^## 2026-11-04 — round 79' LOG.md` → 0 with the bullet as the last
  line (`LOG.md:2544`, `wc -l` → 2544), identical at the lane HEAD (`6d03402f..ed64ddca` touches no
  `LOG.md`). **Evidence pointer:** `corpus/lessons/round-79-verifier-spotcheck.md` § Defects 2, 3, 6;
  `LOG.md:2544`; `w1/K80ScribeDocs/base-readings.txt` and `scaffold-readings.txt` for the readings.
  **Captured-by:** none — the report gate reads reports, not LOG bullets, and a "below" is not a path
  any gate can resolve. **Fix:** every pointer this round adds is resolved before filing (the report
  gate's `POINTER_DEAD`, plus a manual read of each `close/*` name against the tree); the round-79
  bullet is either backed by a landed section or rewritten to name `SCORECARD.md ## Round 79` as the
  place the entry actually is. **Why-not-optional:** a dead pointer in a filed record is the same class
  as a fabricated number — it makes a true sentence unverifiable.

## Limits

- **The O terms re-derive from the receipt, not from the host.** A host whose live root moved now reads
  `PROXY: MATCH`; the drift is visible only through the non-scoring `omp-census --compare` item (the
  counter's arm 10: a 68-member fixture DRIFTs there while the proxy default stays MATCH). The axis
  bought re-derivability by giving up a scored live watch.
- **The receipt is a capture with no age.** `.ufo/pins/omp-shape.json` carries only `contract` and
  `entries` — no capture time, host or count — so a closure cannot tell whether the pinned shape is
  stale or how far the live root may move before the watch is meaningless.
- **`coverage:omp` still saturates at 10.** One finding costs a point (`O_findings=1` → 9, counter arm
  8), so the axis can only fall, never rise; the integer held because 65/65 with zero findings is
  already terminal.
- **The `A` term counts every runnable file under the lane root.** Measured this round: 22 fixture
  `.mjs` files left under an extracted copy moved `A` 886 → 908 and turned the proxy into `A_DRIFT`
  (the checklist's proxy item read exit 1 on that copy). The lane's own rule keeps scripts out of the
  tree; the proxy does not enforce it.
- **`spotcheck-adopt --check`'s `MAP:` line is disclosure only.** Exit is the spotcheck verdict; a
  map-only drift exits 0 and is caught by the separate `readme-map` gate. A caller that reads only
  `--check` no longer learns the map is red.
- **The adopt delta compares findings, not bytes.** `otherFindings(after,key)` is a JSON comparison of
  the oracle's finding list, and a refusal restores the whole pre-image (the `originals` map), so a
  concurrent edit to an unrelated README row that adds no finding is invisible and a concurrent write
  inside the window is clobbered.
- **The plan's after-state says `spotchecks=47`; the measured lane reads 46.** `find corpus/lessons
  -name '*verifier-spotcheck*.md' | wc -l` → 46 at the scaffold. The counter's arm 13 asserts `CLEAN`,
  not a count, so it passes; the 47 is true only if the round's closure lands a 47th spotcheck file.
```
