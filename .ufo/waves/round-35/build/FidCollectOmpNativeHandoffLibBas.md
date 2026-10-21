FIDELITY scripts/collect-omp-native-handoff-lib/base.mjs anchors=13 ok=9 moved=3 changed=1 gone=0

Verified at pinned revisions in /fast/scratch/kumitate-r35/src (clone verified: 964f443ee53df0ce06bd689af01f0dea031b01f9, 31c465f15669f744848bd9f5d56191c5085670f7). File grew 955 → 1002 L (net +47; churn +131/−84). The upstream diff (`git diff 964f443e 31c465f1 -- scripts/collect-omp-native-handoff-lib/base.mjs`) makes exactly two semantic changes inside this member: (1) `PROVIDER_DOMAIN` (+4 lines) is deleted, its comment rewritten to name `../omp-route-grammar.mjs` providerDomain as the shared rule; (2) a single-pass memoized transcript scan `scanSeatEvents`/`SEAT_SCANS` (+~96 lines) is inserted between `isSuccessfulYieldResult` and `interval`, and `interval`, `firstUserAssignment`, `lastErrorEvent`, `hasSuccessfulYield`, `hasSuccessfulYieldSet`, `assertUniqueYieldIds` are rewired onto it with byte-equal die-messages and unchanged judge-parity semantics. No behavior in the note set is removed or weakened by the diff. Read-only seat: no files edited; only git show/diff/grep/nl commands run.

## ok anchors (9)

- native-trial-launch.md:370 heading `## \`scripts/collect-omp-native-handoff-lib/base.mjs\` (955 L) — shared constants + classifyFailure` — member exists at 31c465f1; size now 1002 L (the round's own re-census target). Not counted as a non-ok anchor; the "(955 L)" prose is stale under the declared C2 re-census outcome, covered by the census-count rows below.
- native-trial-launch.md:372 `:40` → `NATIVE_PROFILE_NAMES` = [STRICT_PROFILE, RESILIENT_PROFILE] at 31c465f1:40 — verbatim unchanged.
- native-trial-launch.md:372 `:96` → `PROPOSAL_WAVE_CEILING = 16` at 31c465f1:96 — verbatim.
- native-trial-launch.md:373 `:102` → `CAPACITY_FAILURES` Set usage_limit/rate_limit/model_unavailable at 31c465f1:102 — verbatim.
- native-trial-launch.md:373 `:173` → `DEADLINE_CLASS_BY_ROLE` opening at 31c465f1:173 — verbatim (keys unchanged).
- native-trial-launch.md:374 `:196` → `SEAT_CLASS_BY_ROLE` opening at 31c465f1:196 — verbatim.
- native-trial-launch.md:375 `:223` → `ROUTING_HEALTH_OUTCOMES` opening at 31c465f1:223 — verbatim (all five outcomes).
- native-trial-launch.md:375 `:120` → `GODSPEED_MARKER = "| godspeed"` at 31c465f1:120 — verbatim.
- native-trial-launch.md:376 `:133` → `EVIDENCE_KIND` map at 31c465f1:133 — verbatim.
- native-trial-launch.md:378 `:303` → `die` at 31c465f1:303 — same typed-rejection helper (exit 2, `BLOCKED:` stderr) at the same line.

## non-ok anchors

- failure-telemetry.md:80 | claim on `classifyFailure` (`collect-omp-native-handoff-lib/base.mjs`, no line anchor): "digit-guarded status codes (429 rate_limit, **401 authentication, 403 permission_denied**, 400 invalid_request)" | status: changed | correct anchor: scripts/collect-omp-native-handoff-lib/base.mjs:780-783 (unchanged body; code 429 sits at :778) | proposed replacement: keep "429 rate_limit, 401 authentication, 403 permission_denied, 400 invalid_request" — re-verified unchanged in the diff hunk `@@ -727,51 +803,37` at 31c465f1.
- native-trial-launch.md:377 | `scripts/collect-omp-native-handoff-lib/base.mjs:682` | `classifyFailure` | moved | scripts/collect-omp-native-handoff-lib/base.mjs:758 | "Classifier `classifyFailure` (`scripts/collect-omp-native-handoff-lib/base.mjs:682`) — re-anchored at 31c465f1 (`:758`)."
- remaining-scripts-census.md:36 | member-list row `scripts/collect-omp-native-handoff-lib/base.mjs` in the 91-member S-layer script (frozen list, cited by C2) | count claim | changed | scripts/collect-omp-native-handoff-lib/base.mjs:1 | "91-member script layer at 964f443e — re-censused at 31c465f1: 88 members (2 added, 5 deleted, 55 modified), base.mjs still present at 1002 L."

## C2 arithmetic relevance

Baseline S 86/88 ⇒ floor(10·86/88)=9 confirmed (stale declared 10 matches the 91-era census at remaining-scripts-census.md:36). This member is one of the 55 modified (`frozen/s-modified-members-55.tsv:6`, "+131/-84") and its anchors were verified individually: 0 dead, 0 gone — no additional DEAD_ANCHOR exposure for C2 from this member beyond the two line-shift rows and the census-count row above.
