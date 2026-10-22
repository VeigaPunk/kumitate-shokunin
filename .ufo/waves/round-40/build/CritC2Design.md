RESULT CritC2Design rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=holes cosmetic_paths=5

Scope: attack on C2 (coverage:kimi-layer calibration). Clone /fast/scratch/hyaku/kumitate-r40/seats/CritC2Design/lane at f69817ed; mutants are throwaway copies under .../CritC2Design/exp/ (script .../CritC2Design/mut.mjs). No tools installed. Nothing written in the lane except this report.

Open baseline. `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src` exits 1 with 5 errors, not 2: C2_TOTAL_DRIFT 88/89, K_MEMBERS_DRIFT 51/52, COVERAGE_KIMI_DRIFT 10/9, AXES_DRIFT coverage 10/9, AXES_DRIFT coverage:kimi-layer 10/9 (plus 2 PIN_UNPINNED warnings). `node scripts/kimi-census.mjs` gives `KIMI_CENSUS: DRIFT (UNLISTED skills/)`, exit 1. The census selftest gives `48/48 pass`. The README-to-file set difference (LC_ALL=C comm) lists only `lessons/round-39-verifier-spotcheck.md`: no phantom rows and no duplicate rows.

Cosmetic paths. Each of these reaches 0 AXES_DRIFT rows without any learning. Every outcome is measured with the proxy command above.
1. Lower only the two `## Axes` integers to 9 (E1): AXES_DRIFT 0, but the verdict is still DRIFT on 3 term rows.
2. Lower the `## Axes` integers to 9 and set the stanza to C2_total=89, K_members=52, coverage_kimi=9 (E2): `PROXY: MATCH (… C2=88/89 coverage=9; … K=51/52 coverage:kimi-layer=9 …)`, exit 0. This is honest arithmetic but it is a retreat, not learning. A census re-pin on top makes census CLEAN too.
3. Add a phantom README row, either a duplicate `lessons/round-39.md` row (E4) or a nonexistent path (E4b), and set C2=C2_total=89: the coverage AXES_DRIFT clears. RE_README_ROW counts lines only and never resolves the target (proxy-check.mjs:482, :918).
4. Move the spotcheck lesson out of corpus/lessons (E7): C2_total drops back to 88 and the coverage AXES_DRIFT clears. This hides the routed lesson.
5. Add a stub heading `## \`~/.kimi-code/skills/kimi-webbridge\`` with the body "TODO." (E5), or a negative heading `## Not studied: skills/kimi-webbridge` in an unrelated note such as kimi-binary-secrets.md (E6), and set K_members=K_sections=52: the kimi AXES_DRIFT clears. kSections binds any `## ` token containing `/` (proxy-check.mjs:831-853) and never reads the body.
- Combination E8 (path 3 plus path 5): `PROXY: MATCH (… C2=89/89 coverage=10; … K=52/52 coverage:kimi-layer=10 …)`, exit 0. This is byte-for-byte the same verdict as the honest shape (E9). The proxy cannot tell them apart.
- Refuted: a stanza-only edit (E3) cannot zero the count; it leaves 2 AXES_DRIFT rows, because the `## Axes` rows are compared against live derivations, not against the stanza (compareAxes, :1085).

Claim item (a), the census re-pin from 6 to 7: it does not touch any proxy term, because the proxy counts `skills/` live. It is therefore a tripwire reset, not a score move. The round-34 precedent (`cursor-lane`, kimi-census.mjs:82-83) makes the reset legitimate only when the new child has an internals-level section. The census is name-blind ("names not gated"), so census CLEAN proves nothing about which child is covered.
- Changing only the two literals (:111 and :143) gives `KIMI_CENSUS: CLEAN (members=52 …)`, but `--selftest` then crashes with `EEXIST … extra-skill/skills/skills-lane-06` at :574. That is a crash, not a kill, so it does not count as a passing selftest. The selftest strings `5 children, 6 declared` and `7 children, 6 declared` and the fixture name `skills-lane-06` (:568-579) must move to 6/7, 8/7 and `skills-lane-07`.
- With that edit, the proxy reads `PIN_DRIFT pin.kimi-census: declared=7818970b… computed=4c70dcb4…`. Claim (d) leaves the pin out of its stanza list, so `pin.kimi-census` must be re-pinned as well.

Claim item (b), the K2 section, carries a false-provenance trap. `skills/kimi-webbridge` is not a copy of the plugin's skill:
- The skill's `SKILL.md` is mode 600, 19437 B, sha256 prefix defba946, and reads `version: "2.0.26"`, "Kimi Browser Extension（…原 Kimi WebBridge）".
- The plugin's copy is mode 644, 11880 B, sha256 prefix 84a8e69d, and reads `version: "1.11.3"`.
- `references/operations.md` differs between the two (`cmp`: differ at char 15).
- `references/cli-creator/` (5 files) exists only in the skill.
- A section paraphrased from the existing plugin section (kimi-skills-plugins.md:253ff) would therefore pass the proxy and be false.
- These existing claims become stale and need an append-only erratum: :271 says a user skill is "a `755` symlink with no manifest"; :291 says "user skills carry no version at all"; :441-442 says "six children: five symlinks and the real `cursor-lane`".
- Other stale text: the SCORECARD K2 row (:144, "⇒ **26**"), the census header (:25, :29, "`skills/` = 6 entries"), and the `## Axes` kimi evidence text ("51/51").
- `kimi-webbridge` is now a basename owned by two K members, so a heading that uses the bare name binds to nothing (K_SECTION_AMBIGUOUS). Headings must use the full `skills/kimi-webbridge` path.

Claim item (c), the README row: legitimate.
- The SCORECARD C2 term is "Rows in `corpus/README.md` naming a corpus note over corpus note files". The spotcheck lesson is a corpus note under corpus/lessons, so it is already in the denominator.
- Precedent: README:63 is a third-party row for `lessons/round-9-aggregator-corpus-verdict.md` ("third-party artifact, aggregator-owned … artifact owner: aggregator lane").
- The new row should name hyaku closure as the non-author owner (the file header reads `author: hyaku closure (non-author integrator, @m_opus)`) and must not present the lesson as lane-authored.
- Deleting or moving the file instead is cosmetic path 4.

Smallest safe correction. Land (c) as a single row whose owner is the third party. Land (b) as a section that quotes the skill's own bytes: `2.0.26`, `cli-creator/`, the mode 600 file and the operations.md divergence, together with the three errata and the stale-count edits. Land (a) together with its selftest fixtures and the `pin.kimi-census` re-pin. Land (d) as C2=89, C2_total=89, K_members=52, K_sections=52, with coverage_kimi kept at 10 and the `## Axes` integers kept at 10. The proxy's AXES_DRIFT count alone is not acceptance evidence.

C2 count, using the parent's corrected command `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src | grep -c '^PROXY  error  AXES_DRIFT'`. The open revision reads 2; a bare `grep -c AXES_DRIFT` reads 3 because the summary line also contains the word. The stanza-only mutant E3 also reads 2 (bare 3). E1, E2, the cosmetic combination E8 and the honest shape E9 all read 0. This count is therefore necessary but not sufficient: it cannot tell E8 from E9. The closure must also run the command below.

Single closure re-run command (run at the measured commit in a clone; every part must hold):
`node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src && node scripts/kimi-census.mjs && node scripts/kimi-census.mjs --selftest && test -f corpus/lessons/round-39-verifier-spotcheck.md && test -z "$(LC_ALL=C comm -3 <(grep -o '^| `\(knowledge\|lessons\)/[^`]*`' corpus/README.md | sed 's/^| `//;s/`$//' | sort) <(cd corpus && find knowledge lessons -name '*.md' | sort))" && awk '/^## `~\/.kimi-code\/skills\/kimi-webbridge`/{s=1;next} /^## /{s=0} s' corpus/knowledge/kimi-*.md | grep -q '2\.0\.26'`
Expected: `PROXY: MATCH (… C2=89/89 coverage=10; … K=52/52 coverage:kimi-layer=10; pins=6 match …)`, `KIMI_CENSUS: CLEAN (members=52 …)`, `KIMI_CENSUS_SELFTEST: 48/48 pass` (or more), an empty set difference, and the file present.
- Tested on the mutants: the set-difference part flags E4, E4b and E8; the file test flags E7; the skill-only token part flags E5, E8 and the placeholder E9 (0 tokens).
- No mechanical check tests "internals level" beyond the skill-only token. A human L1 read of the section against `~/.kimi-code/skills/kimi-webbridge/SKILL.md` is still required.
