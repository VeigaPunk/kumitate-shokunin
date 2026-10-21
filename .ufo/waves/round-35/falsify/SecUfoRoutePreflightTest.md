ATTACK scripts/ufo-route-preflight.test.mjs verdict=holds defects=0

Axes: judged axis coverage:script-layer; C1 operability / C3 kimi-layer untouched (leaf member, no cross-axis edits). Work = pure read-only falsification of the re-anchored S8 section; no moves needed, nothing to keep or discard.

# Target

Round-35 edit of section `## `scripts/ufo-route-preflight.test.mjs`` at
corpus/knowledge/remaining-scripts-census.md:753-755 (working tree). Master body
(was): `Live S8 member (206 L, suite) re-censused 2026-10-14 against origin HEAD
964f443e. Primary surface symbol routeFamilies at :17; also probeFamilies at :101.`
New body (755): `Live S8 member (239 L, suite; was 206 @ 964f443e) re-censused
2026-10-14 against origin HEAD 964f443e. Primary surface symbol routeFamilies at
scripts/ufo-route-preflight.test.mjs:17; also probeFamilies at :134. re-anchored at
31c465f1 (round 35)`. Population-table row note:170: `| scripts/ufo-route-preflight.test.mjs | 239 | suite |` (was 206 at master:151).

# Anchor checks (every anchor in the section, read at 31c465f1)

1. Line count. `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-route-preflight.test.mjs | wc -l` -> 239;
   same at 964f443e -> 206. Table row 239 matches pin exactly; `was 206 @ 964f443e` matches base exactly. OK.
2. `routeFamilies` at `scripts/ufo-route-preflight.test.mjs:17`.
   `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-route-preflight.test.mjs | sed -n '17p'` ->
   `import { commandProbe, probeFamilies, routeFamilies } from "./ufo-route-preflight.mjs";` — symbol present, import line byte-identical to 964f443e:17. OK.
3. `probeFamilies` at `:134`.
   `sed -n '134p'` at 31c465f1 -> `const { families: probed, pings: count } = probeFamilies(families, probe);`
   (first call site inside the "chains walk in order…" test). At 964f443e the same statement is at :101 — pure line shift. `grep -nE 'routeFamilies|probeFamilies'` at pin: 17, 80, 110 (routeFamilies), 113, 134 (probeFamilies); at base: 17, 80, 101. The re-anchor `:101 -> :134` is the correct first call site; the new test's own call sits at :113. Both occurrences verified verbatim. OK.
4. Symbols exported upstream: `git show 31c465f1:scripts/ufo-route-preflight.mjs | grep -nE 'export (function|const) (routeFamilies|probeFamilies|commandProbe)'` -> :55, :91, :116 — the import anchors resolve. OK.

# Removed clauses / trace

Upstream diff `git -C /fast/scratch/kumitate-r35/src diff --numstat 964f443e 31c465f1 -- scripts/ufo-route-preflight.test.mjs` -> `33 0` (33 insertions, 0 deletions; pure insertion of one new test at base L88/89 boundary). Zero removed lines means the round-35 convention of `(round 35: removed … — absent at 31c465f1)` clauses correctly does not apply — no clause to leave, and none was left. The only member change is the new test `an effort-less global fallback hop is grouped and probed verbatim` at pin :91 (7 `test(` declarations total). No described behavior was removed, moved out, or altered; gone=0 matches wave-1 FidUfoRoutePreflightTest.md.

# Revision label + no new false claims

- Original revision label kept: body still reads "re-censused 2026-10-14 against origin HEAD `964f443e`" and adds "was 206 @ 964f443e" — both true (206 verified at 964f443e; the 2026-10-14 re-census text is the master original, unaltered). Sibling sections (e.g. ufo-state-census.test.mjs at 763, `was 91 @ 964f443e`) use the identical phrasing, so this is the established convention, not a second one.
- `re-anchored at 31c465f1 (round 35)` trailer — matches the sibling trailer style; pin identity confirmed: 31c465f15669f744848bd9f5d56191c5085670f7 ("routing: grammar admits org-prefixed model ids …"), child of 964f443ee53df0ce06bd689af01f0dea031b01f9.
- Scanned the full diff hunk for this section (diff master lines 525-528): the only claims are the two symbol anchors and the line counts, all verified above. No new behavioral prose was added, so there is nothing new to be false. The bare mention at the Round-32 additions list (note:439) is historical provenance with no line anchor — unaffected and accurate.
- Cross-note sweep: `grep -rn 'ufo-route-preflight' corpus/ master-tree/` outside remaining-scripts-census.md -> no other note claims lines/behavior of this member; no stale duplicate anchor exists elsewhere.
- Section-form invariants: heading set of the note = 60, duplicates = 0; member appears exactly once; added S8 sections vs master are exactly `omp-route-grammar.mjs` and `ufo-swarm-registry.mjs` (both present at pin, verified via ls-tree) — consistent with the 63 -> 60 re-census my member rides in.

# Commands run (all read-only)

- git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff master -- corpus/knowledge/remaining-scripts-census.md (target hunks: table row, body section)
- git -C /fast/scratch/kumitate-r35/src show {964f443e,31c465f1}:scripts/ufo-route-preflight.test.mjs (wc -l; sed -n line reads; grep -nE symbols)
- git -C /fast/scratch/kumitate-r35/src diff --numstat 964f443e 31c465f1 -- scripts/ufo-route-preflight.test.mjs
- git -C /fast/scratch/kumitate-r35/src ls-tree / log / show on ufo-route-preflight.mjs exports and pin identities
- grep sweeps over corpus/ and /fast/scratch/kumitate-r35/master-tree/ for stray member anchors

No tool installs performed (tooling directive: nothing to record).

# Verdict

The re-anchored section makes exactly four empirical claims (239 L pin / 206 L base, routeFamilies :17, probeFamilies :134, re-anchor at 31c465f1); all four reproduce at the pinned source. No removed clause was owed a trace (upstream diff is purely additive). Verdict: holds, defects=0.

# Residual risk and verification gaps

- [INFERENCE] The section does not mention the new `:91` test ("an effort-less global fallback hop…"). Given the note's one-primary-one-secondary anchor convention, omission is not a false claim — recorded as a coverage observation, not a defect.
- The `:134` anchor is the first call site but the second textual occurrence at pin (:113 is the new test's call); if a future convention requires first-occurrence anchoring, this would need restating. Master convention (:101 was both first and only occurrence) is ambiguous on this; no defect derivable from the note's own text.
- I did not execute the suite at the pin (read-only falsification of prose anchors, per assignment); runtime behavior claims are none, so nothing is unverified that the section asserts.
