RESULT ReopenS065 rev=a2e5b54c verdict=confirmed quotes_found=1/1

Item ReopenS065 — RE-DERIVE inherited candidate SOURCES row S065 (git(1), Git 2.56.0).
Inherited row text: /fast/scratch/hyaku/kumitate-r45/a2/inherited-rows.md line 6.
Inherited seat report: .ufo/waves/round-45/build/SrcGitEnv.md (UNTRUSTED, attempt 1).

Fetch (ordinary means, curl, no browser):
cmd: curl -sS -L -D headers.txt -o git-2.56.0.html -w 'http_status=%{http_code} final_url=%{url_effective} size=%{size_download}\n' https://git-scm.com/docs/git/2.56.0
observed: http_status=200 final_url=https://git-scm.com/docs/git/2.56.0 size=244230
(headers) HTTP/2 200; server cloudflare; last-modified: Wed, 21 Oct 2026 15:55:47 GMT
sha256sum git-2.56.0.html -> 336f7842f6015f12fa5fd9f2ed788d4c6d91fc19375a4b50424b5958dfd97f94
Version markers in body: <span class="light d-flex">git last updated in 2.56.0</span> (HTML line 1366); version dropdown lists 2.56.0 (lines 1359, 1366); no redirect.

(1) Locator exists and teaches/gloss claims — CONFIRMED.
Section headings in body: <h2 id="_environment_variables">Environment Variables (line 5220); <h3 id="_the_git_repository">The Git Repository (line 5256). Row anchor ranges: Environment Variables -> The Git Repository HTML 5264-5324; OPTIONS --git-dir and -C 4005-4018. Verified content in those ranges:
- GIT_DIR (line ~5300-5305): "If the GIT_DIR environment variable is set then it specifies a path to use instead of the default .git for the base of the repository." (25 words). Gloss "replaces the default .git": present.
- OPTIONS --git-dir=<path> (4005-4018): "turns off the repository discovery that tries to find a directory with ".git" subdirectory" (14 words). Gloss "turns off discovery": present.
- GIT_WORK_TREE (5306-5310): "Set the path to the root of the working tree." (10 words).
- GIT_INDEX_FILE (5264-5268): "This environment variable specifies an alternate index file. If not specified, the default of $GIT_DIR/index is used." (17 words). Gloss "names an alternate index": present.
- GIT_CEILING_DIRECTORIES (5317-5324): "It will not exclude the current working directory or a GIT_DIR set on the command line or in the environment." (20 words). Gloss "does not exclude a GIT_DIR from the environment": present (the ceiling quote above IS the gloss's source verbatim).
- -C (4017-4018): "If you just want to run git as if it was started in <path> then use git -C <path>." (19 words). Gloss "-C only changes the starting directory": supported (option text: "run git as if it was started in <path>").
All four teaches/gloss claims found under the stated sections. Word counts all <=25 (counted with wc -w via python split; printed 25/14/10/17/20/19).

(2) Draft-attributed verbatim quotes — 1/1 FOUND.
grep -n S065 /fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md -> only two hits: line 1 (source header) and line 57 (M3 mechanism). M3's only guillemet quote attributed to S065:
«If the GIT_DIR environment variable is set then it specifies a path to use instead of the default .git for the base of the repository.» (25 words)
Found verbatim in fetched bytes, in block 5264-5324, under h3 "The Git Repository" -> GIT_DIR dt/dd (lines ~5300-5305). Section locality OK. (M3's "-C only sets the starting directory" is a paraphrase of the 19-word -C quote above, not a quote; the quote it rests on is verified.)
Verification method: normalized (tags stripped, entities decoded, whitespace collapsed) full-block search; all 6 target strings FOUND in their stated blocks (draft quote in 5264-5324; turns-off-discovery, -C in 4005-4018; work-tree/index/ceiling in 5264-5324). Also whole-document search for draft quote: FOUND.

(3) Pinned sha256 match — CONFIRMED (no mismatch note needed).
Row pinned: 336f7842f6015f12fa5fd9f2ed788d4c6d91fc19375a4b50424b5958dfd97f94. My fetch: identical. Last-Modified identical to attempt-1 seat record (Wed, 21 Oct 2026 15:55:47 GMT); same cached body.

(4) Kind/tier — CONFIRMED.
Contract SOURCES-CONTRACT-v1 rule 3 (read at /home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:26-30): tier A = "primary or authoritative for that scope (spec, official docs, source code, original paper, maintainer statement, ...)"; kind enum includes docs; community never A. git-scm.com is the official Git manual host; the versioned 2.56.0 page matches host `git --version` = 2.56.0 (seat report line 12). Scope "repository selection: GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE, GIT_CEILING_DIRECTORIES and -C" is exactly the official manual text fetched. docs/A correct; Q2 satisfied (tier A row).

(5) Rejected row — N/A. S065 status is `mined`, not `rejected`; no rejection reason to hold.

Concluding: no correction needed; row S065 text stands as inherited. Quotes in the row's anchor cell:
- GIT_DIR 25-word quote at lines 5300-5305 (within 5264-5324)
- OPTIONS --git-dir / -C at 4005-4018
Seat report SrcGitEnv.md's own line locators (GIT_DIR 5301-5304, GIT_WORK_TREE 5306-5310, GIT_INDEX_FILE 5264-5268, GIT_CEILING_DIRECTORIES 5317-5324, OPTIONS 4005-4018, discovery 5333-5342) all agree with observed body line positions.

Housekeeping: no process left (curl only, terminated); no installs performed; scratch body kept at /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS065/git-2.56.0.html (sha256 above).
