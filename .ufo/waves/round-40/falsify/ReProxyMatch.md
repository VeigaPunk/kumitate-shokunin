RESULT ReProxyMatch rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=confirmed open_errors=5 cand_errors=0 axes_held=yes
1. Setup: clones at f69817edf687c8ce4f87ed7953a353399232f69e (lane-open) and 1530a75521345e0f4516ed7146180e65f788e017 (lane-cand), made with git clone --no-hardlinks and checkout --detach, under /fast/scratch/hyaku/kumitate-r40/seats/ReProxyMatch/. Pin /fast/scratch/hyaku/kumitate-pin/src checked at 31c465f15669f744848bd9f5d56191c5085670f7. node v24.21.0. No tools installed. Nothing written in the lane except this file.
2. Command, run inside each clone: node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src
3. OPEN f69817e, exit 1, five error rows:
   PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=88 computed=89 delta=+1
   PROXY  error  K_MEMBERS_DRIFT  K_members: declared=51 computed=52 delta=+1
   PROXY  error  COVERAGE_KIMI_DRIFT  coverage_kimi: declared=10 computed=9 delta=-1
   PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
   PROXY  error  AXES_DRIFT  coverage:kimi-layer: ## Axes row=10 derived=9
   Last line: PROXY: DRIFT (...; PIN_UNPINNED anchor-truth.mjs; PIN_UNPINNED sources-check.mjs; src-rev=31c465f15669)
4. CAND 1530a75, exit 0, zero error rows. Two warnings only: PIN_UNPINNED for scripts/anchor-truth.mjs and scripts/sources-check.mjs.
   Last line: PROXY: MATCH (A=8 C=15 operability=8; C1=19/19 C2=89/89 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
5. Counts over the saved outputs with the same regular expressions. I used the search tool, not shell grep, per tool policy; the counts are the same as grep -c would give. ^PROXY  error: open 5, cand 0. ^PROXY  error  AXES_DRIFT: open 2, cand 0.
6. The ## Axes rows at SCORECARD.md lines 314 (coverage) and 317 (coverage:kimi-layer) read 10 at both revisions. Derived at cand: coverage floor(10 x 19/19 x 89/89) = 10; coverage:kimi-layer floor(10 x 5/5 x 52/52) = 10. Derived at open: 9 and 9.
7. ls -A ~/.kimi-code/skills | wc -l = 7 (cursor-lane, godspeed, kimi-webbridge, reverse-engineer-anything, shokunin, ufo, wwkd). Same host state for both runs.
8. node scripts/kimi-census.mjs. OPEN exit 1: "CENSUS  error  UNLISTED  skills/  skills has 7 children, 6 declared" and KIMI_CENSUS: DRIFT (UNLISTED skills/). CAND exit 0: KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4). K2 frozen count is 26 at open and 27 at cand.
9. node scripts/kimi-census.mjs --selftest: both revisions print KIMI_CENSUS_SELFTEST: 48/48 pass and VERDICT: PASS, exit 0.
10. Why the numbers move (read from the source, not fitted):
   a. scripts/proxy-check.mjs is unchanged between the revisions (empty git diff). Its sha256 is f9416d66... at both, matching the stanza pin.
   b. The stanza pins that changed match their scripts at each revision: cite-check 40573448 (open) and 9e190832 (cand); kimi-census 7818970b (open) and ded569fe (cand).
   c. K_members is counted live from ~/.kimi-code: 52 at both. The open stanza said 51, so the open drift is the seventh skills child, kimi-webbridge, which had no K section at open.
   d. The candidate adds exactly one ## heading to a kimi note: "## `~/.kimi-code/skills/kimi-webbridge`" at corpus/knowledge/kimi-skills-plugins.md:218. Under kMembersNamedByHeading (proxy-check.mjs:831-854) it binds the live identity skills/kimi-webbridge, so K_sections goes 51 -> 52. No K_SECTION_AMBIGUOUS warning appears. kimi-residue-files.md changed body text and citation line numbers only; no heading changed.
   e. C2 at open was 88 of 89 notes. lessons/round-39-verifier-spotcheck.md had no README row (node check: 88 rows, 89 notes). Cand adds that row at corpus/README.md:113, in the same block layout as the neighboring round rows. This also explains the open legacy coverage drift, floor(10 x 88/89) = 9. The C2 claim text does not list this change.
   f. S035 is linked through the used-by column of corpus/SOURCES.md (corpus/knowledge/kimi-skills-plugins.md). No kimi note cites any S-ID inline (grep S0[0-9][0-9] over the three kimi notes: no matches), so "sourced from S035" holds as a registry link, not an inline cite.
11. Beyond the two named revisions: lane master 0004ae3 (the docs commit), checked in a fresh clone. Proxy MATCH with C2=90/90 (stanza C2 and C2_total moved 89 -> 90 with the round-40 README row), K=52/52, coverage:kimi-layer=10, exit 0, zero error rows. Census CLEAN, exit 0. Selftest 48/48.
12. --strict at cand: exit 1, DRIFT from the two PIN_UNPINNED warnings. The SCORECARD documents that strict mode promotes them. The claim names the default mode, so this is a residual note, not a contradiction.
13. Residual risks: (a) The MATCH holds only for this host now. K_members and the skills count read ~/.kimi-code live, so the next new child drifts again by design. (b) The candidate also changes the C2 integers, one README row, the cite-check pin, SOURCES rows (S012 queued -> mined; S035 to S037 added), and corpus/QUALITY.md (+29 lines, not a counted input). The C2 claim text omits these. (c) Not checked here, left to other seats: K2 section content, S035 facts, mutants, cite receipts.
