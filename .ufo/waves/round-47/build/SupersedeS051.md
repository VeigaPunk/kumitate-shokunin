RESULT SupersedeS051 rev=cac43009 verdict=CONFIRMED row=S085
| S085 | CircleCI blog: What is mutation testing? — https://circleci.com/blog/what-is-mutation-testing/ | community | C | a mutation-score threshold for teams | § When should a team start using mutation testing?, “Don’t chase 100%” bullet; unversioned article published 2026-06-25, fetched 2026-10-23; body sha256 814548b75cdc139ae4884b5737e8a86f892ec78a3a8c0d80ac5afc02e6a086f | supersedes S051 — REJECTED: the 60–80% floor lacks evidence; the timeout claim conflicts with S048/K43(a); flip: a measured threshold at a named revision or maintainer statement | rejected | 2026-10-23 | 365d | — |

Gate record
- URL: https://circleci.com/blog/what-is-mutation-testing/
- Access date: 2026-10-23
- Quote: “A floor of 60–80% on high-risk modules is the realistic target.”
- Locator: “When should a team start using mutation testing?” section, “Don’t chase 100%” bullet.
- Body SHA-256: 814548b75cdc139ae4884b5737e8a86f892ec78a3a8c0d80ac5afc02e6a086f

Findings
- CONFIRMED: round 46's S051 correction matches the re-opened article. The title/URL, community/C classification, threshold scope, published date, section and sentence locator, threshold quote, timeout claim, and current body hash are supported. Its `re-opened round 46` digest prefix matches today's exact body SHA. The carried status `rejected`, recheck `365d`, and used-by `—` remain unchanged.
- The base S051 row was rewritten in place at 980a16af: its locator changed from “‘Don’t chase 100%’ bullet” to “‘Don’t chase 100%’ sentence” and the 2026-10-22 re-open receipt was added. adedf671 does not further alter S051. The S085 draft uses the required append-only supersede form.
- The article directly states the 60–80% recommendation and that most tools count timeouts as killed. The rejection and contradiction remain the curated judgment; this report does not claim the article is versioned.

Evidence
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 2b2bf7bb:corpus/SOURCES.md` → S051: `| S051 | CircleCI blog: What is mutation testing? — https://circleci.com/blog/what-is-mutation-testing/ | community | C | a mutation-score threshold for teams | § When should a team start using mutation testing?, 'Don't chase 100%' bullet; published 2026-06-25, body sha256 47f2a1f0…f951; fetched 2026-10-22 (seat ScoutRejectCandidates) | REJECTED: "A floor of 60–80% on high-risk modules is the realistic target." is a threshold with no counting command, sample or revision (Q3, the S043 class); vendor marketing; its claim that most tools count timeouts as killed contradicts S048 and K43 (a); flip: a measured threshold at a named revision or a maintainer's statement | rejected | 2026-10-22 | 365d | — |`
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show cac43009b22232c1ae8efdab4f2789516c1fcc6f:corpus/SOURCES.md` → S051: `| S051 | CircleCI blog: What is mutation testing? — https://circleci.com/blog/what-is-mutation-testing/ | community | C | a mutation-score threshold for teams | § When should a team start using mutation testing?, 'Don't chase 100%' sentence; published 2026-06-25, body sha256 47f2a1f0…f951; fetched 2026-10-22 (seat ScoutRejectCandidates); re-opened round 46 (SweepS051S055): body sha256 814548b7…086f2, byte-stable on three fetches, quote and reason clauses still present | REJECTED: "A floor of 60–80% on high-risk modules is the realistic target." is a threshold with no counting command, sample or revision (Q3, the S043 class); vendor marketing; its claim that most tools count timeouts as killed contradicts S048 and K43 (a); flip: a measured threshold at a named revision or a maintainer's statement | rejected | 2026-10-22 | 365d | — |`
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -p --follow --format='COMMIT %H %s' -- corpus/SOURCES.md` → 980a16af diff shows the S051 in-place locator/re-open update; adedf671's recorded diff touches S047/S055, not S051.
- Re-opened with `read https://circleci.com/blog/what-is-mutation-testing/` → title `What is mutation testing? - CircleCI`; article includes the quoted 60–80% sentence and states “Most tools count timeouts as killed”.
- `curl -fsSL https://circleci.com/blog/what-is-mutation-testing/ | sha256sum` → `814548b75cdc139ae4884b5737e8a86f892ec78a3a8c0d80ac5afc02e6a086f2  -`.
- `printf '%s' 'A floor of 60–80% on high-risk modules is the realistic target.' | wc -w` → `11`.
- `printf '%s' 'REJECTED: the 60–80% floor lacks evidence; the timeout claim conflicts with S048/K43(a); flip: a measured threshold at a named revision or maintainer statement' | wc -m` → `159` characters after the required prefix `supersedes S051 — ` (≤200).

Gates and surfaces
- Source gate: opened and checked against the fetched bytes; quote count 11 words and body SHA recorded above.
- No tests, selftests, counters, or lane gates run; none were part of this scribe assignment.
- Touched surface: this report only, `.ufo/waves/round-47/build/SupersedeS051.md`. `corpus/SOURCES.md` remains read-only and unmodified by this seat. No tools installed.
- Out of scope: other round-47 rows, routing candidates, and lane changes.

Artifact path: `.ufo/waves/round-47/build/SupersedeS051.md`
