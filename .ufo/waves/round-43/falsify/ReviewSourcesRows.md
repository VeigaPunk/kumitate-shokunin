# ReviewSourcesRows — SOURCES rows S046–S052 and the S039 used-by change at 84cb1d5d

rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=defects defects=5 (all minor; none invalidates an admission)

Scope: the seven new rows S046–S052 (corpus/SOURCES.md:59-65) and the S039 used-by change
(corpus/SOURCES.md:52), checked against the frozen contract in CORPUS.md § "SOURCES.md — where a
shokunin learns" (contract v1) and against the round-43 lesson's Gate (corpus/lessons/round-43.md:63-101).

## What passed

- Frozen census (run at the measured commit, clone
  /fast/scratch/hyaku/kumitate-r43/seats/ReviewSourcesRows/lane): rows=52; malformed(NF!=13)=0;
  duplicate ids: none; enum/tier-inflation violations: none; mined used-by paths: none missing.
- `node scripts/sources-check.mjs` (bounded: systemd-run --user --scope -p MemoryMax=4G
  -p TasksMax=128 timeout -s KILL 600, cwd = clone at 84cb1d5d): exit 0,
  `SOURCES_CHECK: CLEAN (rows=52 tiers=A:45,B:2,C:5 status=queued:14,mined:29,rejected:9
  entries_with_source=3 legacy=38)`; one info LEGACY_NO_HEADER count=38 (pre-existing legacy set).
- `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin kumitate` (same bounds): exit 0, final `kumitate ok`, one warning:
  `W04 S034 duplicate url stryker-mutator.io/.../mutant-states-and-metrics across scopes`.
  SOURCES.md is byte-identical between 84cb1d5d and the lane worktree head 003dd28
  (`git diff --stat 84cb1d5d 003dd28 -- corpus/SOURCES.md` empty), so the validate covered the
  measured content. The W04 pair (S023 :36, S034 :47) predates this round — out of scope, listed
  as observation only.
- S039 change is exactly the permitted edit: cell-by-cell diff of the row at 84cb1d5d~1 vs
  84cb1d5d shows only cell 12 changed: ` corpus/lessons/round-42.md ` →
  ` corpus/lessons/round-42.md, corpus/lessons/round-43.md ` (+28 chars = the added path). The
  old→new log exists (round-43.md:78-80 "Re-read S039 … `used-by` gains this lesson"; :100
  "Registry changes logged old → new"). Append-only respected: the file diff is exactly 7
  appended rows + this one cell.
- Ids S046–S052 are the next unused, appended in order directly after S045 (:58→:65), never
  reused; no `|` inside cells (NF=13 for all 52 rows).
- Kinds (paper, docs×2, paper, community×3) and tiers (A,A,A,B,C,C,C) are in the enums;
  `community` is never A (all three community rows are C — no tier inflation); rejected rows
  S049–S052 all read `REJECTED: <reason>; … flip: <condition>`; mined rows S046–S048 are each
  cited by ≥1 used-by path and every used-by path exists.
- Every Gate quote traces to opened-evidence seat reports committed this round: S046+S039-reread
  → .ufo/waves/round-43/build/ScoutSrcFlaky.md; S047+S048+S050 → ScoutSrcKillDef.md; S051+S052 →
  ScoutRejectCandidates.md (quotes "unclear if the test actually kills", "marked incompetent",
  "realistic target", "equivalent mutant" all present in the named reports).
- Access dates recorded for all seven rows (opened 2026-10-22 or ISO datetime); anchors for
  S046–S049 and S051–S052 carry exact locators plus revision (DOI+pages; commit+line+sha256;
  §+fetch date; answer id+¶).

## Defects (all minor; none invalidates an admission)

1. **Gate entries omit the URL that rule 1 requires** (round-43.md:65-92). Contract rule 1: the
   round lesson's `## Gate` records "for every new row, the URL, the access date, and a
   ≤25-word quote with its location". Zero `http` occurrences in the Gate section; entries
   identify sources by name/commit/sha only (e.g. :65 "NSF PAR author manuscript" with no URL or
   PAR id in the Gate; :81 "Alshammari et al., Mutation 2024"; :85 "softengbook.org overview").
   Standing practice since round 42 (its Gate also carries no URLs), but it deviates from the
   frozen text. Cheapest repair: name the row id plus URL in each future admit/reject bullet, or
   log the divergence for a contract-version decision.
2. **Quote word-count annotations do not reproduce** (round-43.md:68, :82, :86, :89). Whitespace
   word counts of the quoted spans: S046 stated 22, actual 24 (:68); S049 stated 16, actual 18
   (:82); S050 stated 17, actual 18 (:86); S051 stated 12, actual 11 (:89). All ≤25, so rule 1's
   binding constraint holds and the admissions stand, but four numbers in a corpus entry fail
   the lane's own "a count carries its command" hygiene. (S047 :72, S048 :77, S039 :80, S052 :92
   match.)
3. **S050's anchor locates nothing** (corpus/SOURCES.md:63). Contract anchor: "exact section /
   heading / page / line plus revision … Never a bare homepage." The anchor reads "page served
   as text/markdown, no revision, version or date; fetched 2026-10-22" — no section, heading,
   line or page number, and neither the row nor its Gate bullet (:85-87) says where the quoted
   kill sentence sits. This is the same class round-42 falsify flagged on S043 ("the S043 anchor
   `§ thresholds` names no section of the page", corrected as an erratum because rows are
   append-only). Same repair shape: an erratum line in the lesson naming the location, or a
   superseding row if the seat's report records one.
4. **used-by `SKILL.md` is outside the contract's enumeration** (corpus/SOURCES.md:59-61).
   Contract used-by definition: "repo-relative paths of the knowledge entries or lessons citing
   the row". SKILL.md is neither; the citations are real (SKILL.md:608 cites S046, S047, S048 in
   the gate-mutants capability row) and S034's used-by `corpus/QUALITY.md` (SOURCES.md:47, round
   39) set the same wider reading, so this is a contract-text-vs-practice divergence, not a
   false claim. Flag for the contract-version decision, not a row fix.
5. **No search-log note for this round's source pass** (corpus/SOURCES.md:89; rule 5 "one prose
   note per bounded search", "a negative claim carries its sweep"). The Search log still ends at
   the round-35 lead pass (5 entries, all dated 2026-10-19/20); the three round-43 seat passes
   that produced 7 rows including 4 negative claims (S049–S052) added none, and the lesson
   carries no identified/screened/included counts either — the screening lives only in the
   committed build reports. Standing gap since round 36 (S034–S045 added none either), so not
   introduced by 84cb1d5d, but this round's rows are the newest instance.

## Residual risk / verification gaps

- I did not re-open the seven external sources; rule 1's "non-author verification re-opens a
  sample" stays with the L1. Quote fidelity above rests on the seat reports committed at
  fb3eab4/84cb1d5d, not on my own fetches.
- Word counts use whitespace tokenization; no other convention is stated in the lesson, so the
  four mismatches stand as unreproducible numbers (all quotes ≤25 under any reasonable count).
- The `systemd-run`-bounded runs left no processes of mine (pgrep for my seat path clean; the
  gate-mutants processes visible on the host during the check belong to other seats, e.g.
  CritPrimaryOnlySwitch). Temp files removed; scratch confined to
  /fast/scratch/hyaku/kumitate-r43/seats/ReviewSourcesRows/.
- Tools installed/upgraded this item: none.
