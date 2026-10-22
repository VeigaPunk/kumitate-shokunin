RESULT CritOperabilityCost rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=measured honest_clean=9/17 recipes=/fast/scratch/hyaku/kumitate-r40/seats/CritOperabilityCost/recipes.json
Clone: /fast/scratch/hyaku/kumitate-r40/seats/CritOperabilityCost/lane at f69817edf687c8ce4f87ed7953a353399232f69e; source /fast/scratch/hyaku/kumitate-pin/src HEAD 31c465f15669f744848bd9f5d56191c5085670f7. No tools installed.
Baseline: `node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 --src /fast/scratch/hyaku/kumitate-pin/src` -> exit 0, `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af... src-rev=31c465f15669)`.
Recipe run: `node run-recipes.mjs --lane lane --rev f69817edf687c8ce4f87ed7953a353399232f69e` (seat dir). Each recipe runs in a fresh detached worktree: apply one edit, re-pin with `--write-pin --notes <all 4 registered notes>` (H11: that note only), then run the checklist command above. Raw output: run-open.tsv.
Per edit (pin exit / check exit / verdict):
H0 unrelated prose edit, no re-pin: - / 0 / CLEAN.
H1 narrow census #32 BEGIN_MARKER `:717-718` -> `:717` (token on 717): 0 / 1 / DRIFT BASE_TRUE_LOST `:717-718@scripts/charter-scribe/sync.mjs#0 true at base, anchor gone`.
H2 narrow census #262 buildSeatRoutingMirror `sync-global-routing.mjs:209-214` -> `:209-211`: 0 / 1 / DRIFT BASE_TRUE_LOST.
H5 move census #34 isMain `:881-883` -> `:883` (the guard line): 0 / 1 / DRIFT BASE_TRUE_LOST.
H3 widen route-probe #118 exit-0 row `:1167` -> `:1166-1167`, plain re-pin: 1 / 1 / pin refused `PIN_REGRESSION #118 ord true -> unchecked (token served -> null)`.
H4 widen census #237 `project-devin-subagents.mjs:247` -> `:246-247`, plain re-pin: 1 / 1 / pin refused `PIN_REGRESSION #237 ord true -> debt:false (token missing -> ok:false)`.
H6 narrow census #63 failing names `:2848-2852` -> `:2849-2852`, plain re-pin: 1 / 1 / pin refused `PIN_REGRESSION #63 ord true -> unchecked (token failing -> null)`.
H10 add a true sentence `injectBeatNote` (`:716`) mid-note (census, before 87 reviewed anchors), plain re-pin: 1 / 1 / pin refused `PIN_REGRESSION #454 scripts/ufo-statusline-hook.test.mjs|hatch|0 true -> debt:false`.
H3r, H4r, H7 (H3, H4, H6 with the committed review re-stated through `--reviews`, same token and seat): 0 / 0 / CLEAN each.
H10r (H10 with all 87 census reviews at ord>=35 re-stated at ord+1 through `--reviews`): 0 / 0 / CLEAN, true 778 -> 779.
H8 repair debt census #99 (`:392` paired `<segment>.<sha256>.cold`) by adding the true paired token `preserveToCold`: 0 / 0 / CLEAN, true 778 -> 779, debt 20 -> 19.
H9 append a true sentence (`BEGIN_MARKER` `scripts/charter-scribe/sync.mjs:56`) at the end of native-trial-launch.md: 0 / 0 / CLEAN, anchors 812.
H12 control: narrow census #156 lean_frozen_cache_digest `:128-175` -> `:128-137` (the function body; this anchor was not true at base): 0 / 0 / CLEAN.
H13 legitimate re-key: keep `:717-718`, pair it with `markerCount` instead of BEGIN_MARKER: 0 / 0 / CLEAN.
H11 = H1 re-pinned with `--write-pin --notes corpus/knowledge/remaining-scripts-census.md` only: 0 / 1 / DRIFT, plus 3 x `CHECKED_SHRANK note dropped from the pin` (route-probe base true=45, sighting-wall 47, native-trial-launch 19).
Counterexample (operability, at open): an honest narrowing or move of any anchor that was true at base can never read CLEAN (H1, H2, H5). No re-pin or review path exists, because `compareBase` keys base-true anchors by raw text plus path (`raw@path#n`, scripts/anchor-truth.mjs:354-363). H12 isolates the cause: the same narrowing on a non-base anchor is CLEAN.
Second cost: a committed review is carried only when ordinal and raw are unchanged (scripts/anchor-truth.mjs:276). So a widen, a narrow or a mid-note insert silently drops reviews. The pin refuses (H3, H4, H6, H10) until the maintainer re-states every affected review by hand through `--reviews` (87 entries for H10r).
Third cost: `--write-pin --notes <one note>` writes a pin holding only that note (scripts/anchor-truth.mjs:476-500), so the instruction-form re-pin fails `CHECKED_SHRANK` on every other note (H11). Honest pinning must list all notes or omit `--notes`.
Impacted axes: operability (honest re-ranging is refused); coverage of review provenance (re-stating reviews accepts any seat name, which is the same surface as R39-1).
Smallest safe correction: keep the open-rev outcomes as the floor for the repaired gate. Any of H0, H3r, H4r, H7, H8, H9, H10r, H12 or H13 that turns non-CLEAN after the repair is an operability harm. H1, H2 and H5 are a tradeoff the L1 must rule on: allowing them means matching base identity by overlapping range plus true token, and that must not reopen the R39-2 swap and reorder attacks. Make `--write-pin --notes X` merge X into the existing pin instead of replacing it.
Falsify-wave re-run: `node /fast/scratch/hyaku/kumitate-r40/seats/CritOperabilityCost/run-recipes.mjs --lane <clone> --rev <measured commit>`. The base defaults to e18ff1af3392e3823227644c977c237737fe65c9 and the source to /fast/scratch/hyaku/kumitate-pin/src. A recipe whose old text no longer exists prints SKIP_EDIT_NOT_UNIQUE and is left out of the count.
Helpers in the seat dir: candidates.mjs (debt and range candidates, output candidates.tsv), movecands.mjs and movecands2.mjs (move candidates).
