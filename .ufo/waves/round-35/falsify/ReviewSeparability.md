ATTACK causal-separability-of-C1-C2-C3 verdict=holds defects=0

Scope: for each claim, a scratch tree at /fast/scratch/kumitate-r35/w/ReviewSeparability/t/<c1|c2|c3> = master 1770305f + only that claim's hunks; every claimed number re-run at the pinned src /fast/scratch/kumitate-r35/src (31c465f1). Lane tree untouched (reads + the sandboxed mutation script only). No tools installed. Scratch evidence: out_*.txt/.json in the same dir.

Hunk split of scripts/proxy-check.mjs (31 hunks in `git diff master`): C1 = 3 hunks (layerTerms doc @@-571, code @@-586 with `sections = {S:new Set(),R:new Set()}`, 3 distinct cases @@-1500); C3 = 28 K/`mcp.json`/29→30 hunks. Sanity: applying both patches reproduces the working-tree proxy-check.mjs byte-exact. SCORECARD.md split by line (see E1): c1=master+pin.proxy-check(=sha of c1 proxy); c2=+S_members/S_sections 88 + S8 row + script-layer axes row; c3=+K_members/K_sections 51 + K1 row + kimi axes row + both pins (per-tree sha). c2 overlay: corpus/knowledge/remaining-scripts-census.md (whole file, all C2). c3 overlay: scripts/kimi-census.mjs (whole kc.diff, all C3) + kimi-mcp-plane.md.

CONTROLS ON MASTER BASE (t/base) — all replicate the declared "before" exactly:
- `node t/base/scripts/proxy-check.mjs --self t/base --src <pin>` → DRIFT, S_MEMBERS_DRIFT declared=91 computed=88, S_SECTIONS_DRIFT declared=91 computed=86, COVERAGE_SCRIPT declared=10 computed=9, C2_TOTAL_DRIFT declared=77 computed=78 (= .ufo/waves/round-35/baseline/proxy.txt).
- `--selftest` → 104/104 (= baseline/proxy-selftest.txt). `kimi-census.mjs` → `KIMI_CENSUS: DRIFT (UNLISTED mcp.json)` exit 1; `--selftest` → 45/45.
- `bash mutate.sh --self t/base --src <pin>` (wave-1 script, sandboxed copy) → MUTATION_KILLS 0/2, S 86→86, R 83→83 — exactly C1's "before".

C1 — separable, holds.
- t/c1 (master + 3 hunks): `--selftest` → `PROXY_SELFTEST: 107/107 pass` (claim: 104→107). Mutations do not depend on C3's K hunks.
- `mutate.sh --self t/c1` → MUTATION_KILLS 2/2 (S 86→85, R 83→82); on the integrated lane tree → 2/2 (S 88→87, R 83→82), replicating the claim's quoted numbers.
- Negative control t/c1n (cases-only patch on master code): `--selftest` → 103/107, FAILs are exactly the 3 new distinct cases — the cases discriminate occurrence counting; not vacuous.
- E3 caveat: C1's quoted S delta (88→87) is only reachable on the C2-updated census; the kill property (0/2→2/2) is fully independent.

C2 — separable, holds.
- t/c2 `proxy-check.mjs --json`: S_sections=88 S_members=88, coverage_script=10, zero S_* findings — under MASTER occurrence-counting layerTerms, so the re-censused note's occurrences equal its distinct identities (88); C2's S 86/88→88/88 does NOT need C1's distinct change.
- Claims gate: t/base `claims-check.mjs --row S8` → DRIFT, exactly 5 SECTION_FILE_UNRESOLVED (the 5 departed members); t/c2 → `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=60 adv=0)`.
- Census content (grep on t/c2 note): 60 `## \`scripts/…` member sections; added = omp-route-grammar.mjs (:627) + ufo-swarm-registry.mjs (:798) — the 2 members the baseline probe listed as unsectioned; all 5 departed (frozen/s-deleted-5.txt) appear only as history prose; `## \`scripts/check-hand-authored-sets.mjs\`` present exactly once (mutation drop target intact).
- E4 caveat: C2's own terms are clean, but full `PROXY: MATCH` on a C2-only tree still needs the round's unclaimed riders (README map rows → C2_total 79; the pre-existing declared=77 computed=78 drift), which also carry the derived aggregate `coverage` 9→10.

C3 — separable, holds (and is less entangled than claimed).
- t/c3 census: `KIMI_CENSUS: CLEAN (members=51 checked=51 chain=7 info=4)` exit 0 (base: DRIFT UNLISTED mcp.json); `--selftest` → 48/48 (claim 45→48).
- t/c3 proxy `--json`: K_sections=51 K_members=51, coverage_kimi=10, C1k=5/5, zero K_* findings; remaining findings are exactly the absent C2/rider drifts (S_members/S_sections/C2_total/coverage/axes) — K terms unaffected by C1/C2 absence.
- Negative control t/c3n (master kimi-mcp-plane.md instead of the round's 26-line update): K still 51/51 cov 10 — the binding heading `## \`~/.kimi-code/mcp.json\`` pre-exists at master (note line 21), so the note diff is documentation-only; SCORECARD's "the existing … heading binds it" is accurate.

ENTANGLEMENTS (none refute a claim):
- E1 process: SCORECARD.md stanza hunk @@-279,36 +285,36 (working diff) mixes C2 lines (C2/C2_total, S_members, S_sections), C3 lines (K_members, K_sections, pin.kimi-census) and C1's pin.proxy-check in ONE git hunk — the claims are line-separable, not hunk-separable there; hunk-level cherry-pick/revert of one claim drags the others' stanza lines. Fix: none needed for measurement; if hunk-granular integration is wanted, split the stanza edit into per-claim commits.
- E2 cosmetic: proxy-check.mjs doc hunk @@-84,38 +85,39 mixes C1 S/R-term prose with C3 K-term prose (comments only, no behavior).
- E3 numeric framing: C1's "(S 88→87)" presupposes C2's census (88); on master+C1-only the same mutant reads 86→85 (R 83→82 identical). The claim worded as before-on-master/after-on-round-tree is accurate but its S magnitude is tree-state-dependent.
- E4 rider coupling: C2's full MATCH depends on rows the round itself marks "not claimed" (README map rows, C2_total 79). Pre-existing at master, not created by round 35.
- E5 pin coupling: stanza pin.proxy-check=e58c08… hashes the combined C1+C3 file; it matches neither per-claim tree's proxy bytes (each per-claim tree needs its own recomputed pin — supplied in t/c1, t/c3).

Verification gaps: none material. The mutation script and gates never wrote outside mkdtemp sandboxes; the kimi root was touched by the census/proxy gates only (lstat/readdir by design; no content read of mcp.json, server.token, credentials/, oauth/). [INFERENCE] none remaining.
