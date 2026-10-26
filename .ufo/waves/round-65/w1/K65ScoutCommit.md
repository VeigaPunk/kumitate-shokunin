VERDICT: S203 opens cleanly — commit 10bce6900b5bdcf7479ed718f52902feeab9ed00 is fetched (HTTP 200, 9953 bytes), is an ancestor of v18.12.6 (compare status `ahead`, behind_by 0), and every quote below matches under the frozen norm() in both the patch and the live commit page; row, pin and quotes are drafted for L1 append.

## Evidence
Fetch (curl -sSL, UA 'Mozilla/5.0 (kumitate-r65)'), 2026-10-25:
- `.patch`: `HTTP 200 size_download=9953`; `stat` 9953 bytes; `sha256sum` = `eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b` (build/K65ScoutCommit/capture/10bce690.patch).
- compare API `.../compare/10bce6900b5bdcf7479ed718f52902feeab9ed00...v18.12.6`: `HTTP 200 size=1966539` (not rate-limited; no git clone needed), sha256 `417e4b170627174a0f000ce521283a82ab6d786c40bba206a5a2583ca7a7ec4b`. Parsed: `status=ahead ahead_by=15357 behind_by=0 total_commits=10000 (API list capped) base_commit=merge_base_commit=10bce6900b5bdcf7479ed718f52902feeab9ed00`; the last commit listed is `45c35e40c46166dc726ccc52f5d27f40f2449f99`, equal to `base/omp-release-tag.txt` (`45c35e40…  refs/tags/v18.12.6`). merge_base == base with behind_by 0 means the commit is an ancestor of the tag.
- commit API: `HTTP 200 size=15026` sha256 `2f894f688b0af72cd02cbf330bdca59617fec359dfc9965eba8902aa22e98b46`. Dates: author `2026-08-11T17:56:14Z` (patch header `Date: Tue, 11 Aug 2026 17:56:14 +0000`), committer `2026-08-11T17:57:41Z`. Author "roboomp <omp@can.ac>". 5 files, 94 insertions, 7 deletions.
- commit HTML page: `HTTP 200`, 657323 bytes, sha256 `56cb496e81166f8b519e934ddf9069b1230488264705e76964e6dbbdd617254c` (size drifted 657324 vs 657323 between two fetches: the HTML page is not a stable carrier).
- Recheck: `curl -sS https://api.github.com/repos/can1357/oh-my-pi/commits/10bce6900 | grep -c 'the client pinned the stale 2025-03-26 revision'` → `1` today (run twice, both 1; the API JSON is one line so grep -c counts lines, not occurrences).
- Quote check, `node build/K65ScoutCommit/quote-check.mjs` (norm() copied from probe/omp65-probe.mjs:57-64): all 5 quotes `patch=true html=true`; word counts 7/17/17/15/2; only the subject carries literal `2025-11-25`.

Quotes (author-verbatim, <=25 words; file S203-quotes.md):
- S203 — "fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25"   [subject]
- S203 — "The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision."   [stale revision + header]
- S203 — "Spec-current servers (e.g. AWS Bedrock AgentCore Gateway with an outbound per-user OAuth target) discard the negotiated version"   [Bedrock; the full sentence is 26 words, so this is its first 17]
- S203 — "echo the negotiated version in the MCP-Protocol-Version header at the transport's single #fetch choke point"   [header mechanism]
- S203 — "Fixes #8264"   [trailer]

Why the .patch is a stable carrier: a git commit id is a hash of its content and parents, so `/commit/<40-hex>.patch` can never name different bytes; the server renders the same mailbox text each time (header `Date` is the author date, no relative times, no page chrome). The HTML page and the API JSON carry session/UI noise (657323 vs 657324 bytes across two fetches) and can change with GitHub's front end. Caveat: stability is of the content, not of availability (force-push garbage collection, repo deletion/rename); the committed capture covers that.

## Findings
- K65ScoutCommit-1 (low): API `total_commits` is capped at 10000 while `ahead_by` is 15357, so the compare "commits" list is not the full range; ancestry rests on `status`/`behind_by`/`merge_base`, not on counting commits. Reproduce: `node -e "const j=require('./capture/compare.json');console.log(j.status,j.ahead_by,j.behind_by,j.total_commits,j.commits.length)"` from the build dir.
- K65ScoutCommit-2 (medium): comment-line quotes from the diff (e.g. the "AWS Bedrock AgentCore Gateway refuses tool calls ... below 2025-11-25" doc comment in types.ts) do NOT match under norm(): the patch interleaves `+ * ` prefixes across the wrapped lines (checked: 0/3 files). Use only commit-message sentences as quotes. A bullet such as `- S203 — "AWS Bedrock AgentCore Gateway refuses tool calls on an outbound per-user OAuth (AUTHORIZATION_CODE) target below 2025-11-25"` would be a O4 MISS.
- K65ScoutCommit-3 (medium, O6 coupling): the S203 URL (`/commit/10bce6900…`) carries neither `/v18.12.6/` nor the release commit 45c35e40…, so S203 does NOT count toward O6's ">= 2 rows pinning real_version". Two other rows with `/tree/45c35e40…` (or `/v18.12.6/`) URLs are still required (existing S060/S068 are not new this round, so they fail O2's "new this round"). S203's anchor names v18.12.6 only in prose.
- K65ScoutCommit-4 (info): the live HTML page matches every quote, so O5 passes with either row URL (`/commit/<hash>` or `.patch`); the `.patch` URL is recommended because it is byte-stable (O5 and O3 then read the same carrier). I did not run omp65-probe.mjs (no entry/rows exist yet).
- K65ScoutCommit-5 (info): the staged entries (`omp-mcp-version-negotiation-decision` S232 in the package, round-63 scout report `.ufo/waves/round-63/w1/K63ScoutStagedScope.md:74`) cite this commit as "negotiate 2025-11-25"; a `find /` for the staged file timed out, so the staged entry's own recheck line was not read here; the recheck command from the assignment was run as written (result above).

## Candidate (L1 appends after non-author re-opening)
Quote list: S203-quotes.md (above, 5 bullets). Pin line: S203-pin.json (`{"sourceId":"S203","path":".ufo/waves/round-65/build/K65ScoutCommit/capture/10bce690.patch","sha256":"eedfbbc4…172c9b","bytes":9953,"captured":"2026-10-25"}`).
11-cell row (verified `awk -F'|'` = 11 cells, no `|` inside cells; full text in S203-row.md):
`| S203 | oh-my-pi commit 10bce6900 (fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25) — https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch | code | A | why OMP pins MCP protocol 2025-11-25: … | commit message and diff … author date 2026-08-11T17:56:14Z … ancestor of v18.12.6 (compare status ahead, ahead_by 15357, behind_by 0) … sha256 eedfbbc4…172c9b | the client pinned the stale 2025-03-26 revision … MCP_PROTOCOL_VERSION to 2025-11-25 … single #fetch choke point | mined | 2026-10-25 | on-release | corpus/knowledge/omp-installed-release-mcp-runtime.md |`
Note recheck `on-release` is the lane's modal value (70 rows); the commit itself cannot change, so the only drift is availability.

## Artifacts
build/K65ScoutCommit/: capture/10bce690.patch, capture/compare.json (1.9 MB), capture/commit-api.json, capture/commit-page.html (657 KB), S203-row.md, S203-pin.json, S203-quotes.md, quote-check.mjs. Scratch: /tmp/kumitate-r65/K65ScoutCommit/m.mjs.

## Limits
Did not append anything, run omp65-probe.mjs or the census validator on the row; did not do the git bare-clone ancestry (API answered); another reader must re-open the row (non-author) before append; did not read the staged entry file; row `anchor`/`teaches` wording not reviewed for 25-word or census constraints beyond the 11-cell check.
