ATTACK C1 verdict=holds defects=1

C1 — `scripts/proxy-check.mjs` `layerTerms()` now counts DISTINCT in-family
`section.file` identities for S_sections/R_sections (candidate lines
592–607 vs master `git show master:scripts/proxy-check.mjs` occurrence
sum). All four claim facets attacked and held.

## Refutation attempts (all failed)

1. Re-ran the exact wave-1 instrument
   `/fast/scratch/kumitate-r35/w/ExecMutationBefore/mutate-distinct.sh`
   against the REAL master read-only tree
   `/fast/scratch/kumitate-r35/master-tree` (needed `chmod -R u+w` on the
   sandbox copy — master files are read-only; fix copy at
   `/fast/scratch/kumitate-r35/w/CriticC1Final/mutate-distinct.sh`):

       MUTATION_BASELINE S_sections=86 R_sections=83
       MUTATION S dup-one/drop-one before=86 after=86 killed=no
       MUTATION R dup-one/drop-one before=83 after=83 killed=no
       MUTATION_KILLS 0/2

   Before was measured on the real master tree, not a fitted fixture.

2. Same script against the integrated candidate:

       MUTATION_BASELINE S_sections=88 R_sections=83
       MUTATION S dup-one/drop-one before=88 after=87 killed=yes
       MUTATION R dup-one/drop-one before=83 after=82 killed=yes
       MUTATION_KILLS 2/2

   Matches the Move-log row (SCORECARD.md round-35 operability).

3. `node scripts/proxy-check.mjs --selftest` → `PROXY_SELFTEST: 107/107 pass`.
   The three new checks encode the intended semantics: duplicate-one/drop-one
   in each layer fires exactly `S_SECTIONS_DRIFT`/`R_SECTIONS_DRIFT`, and a
   3-occurrence/2-file control still MATCHes.

4. `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` →
   `PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10;
   S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9;
   K=51/51 coverage:kimi-layer=10; pins=6 match)`. f_O = 20/23 unchanged
   (A counts `scripts/*.mjs` = 7; the `.orig` file does not match the glob).

5. `s.file` identity is canonical: `claims-check.mjs:390` pushes the resolved
   origin path `candidates[0]` — one path per member, so no overcount vector;
   ambiguous/unresolved sections push `file:null` and were already excluded
   (`inFamily` absent/`!== true`). Distinct aligns the proxy term with the
   claims gate's own semantics (`claims-check.mjs:401` dedupes `s.file` for
   `MEMBER_COUNT_DRIFT`) — the round-17/22 critic-queued inconsistency is now
   fixed, not widened.

## New blind spot (asked about, does not harm any axis)

A pure duplicate-add (same member section repeated, no drop) is now silent
for S/R sections. But it preserves the scored quantity — the set of distinct
member identities — and the claims gate is already silent on it (its member
comparison dedupes; the dup still must carry live anchors + verbatim symbols
to pass `SECTION_NO_ANCHOR`/`SECTION_NO_SYMBOL`). Critically, the killed
vector (dup+drop-of-another = a member LOST while the count held) has no
distinct-counting equivalent: removing a member's last section now always
fires. This is a strictly weaker silent class — a legitimate discrimination
upgrade, occurrence vs distinct notwithstanding.

## Defects

1. `scripts/proxy-check.mjs.orig` (121144 bytes, mode 0755, untracked)
   sits in the lane tree — patch-backup leftover; NOT identical to
   master `git show master:scripts/proxy-check.mjs`. No scored-term effect
   (A glob is `*.mjs`, verified live A=7 MATCH), but it is litter inside the
   measured surface. Minimal fix: `rm` it before commit (or rename to
   `.orig.txt` outside `scripts/`).

## Notes

- Round-end PROXY/CLAIMS/KIMI_CENSUS/SOURCES numbers re-verified live
  above; checklist 620-red is upstream-owned (out of C1 scope).
- No tools installed. Bash only; no lane files mutated (all mutation runs
  sandboxed under /tmp by the instrument itself).
