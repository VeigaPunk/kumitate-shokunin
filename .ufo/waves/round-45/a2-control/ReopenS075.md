RESULT ReopenS075 rev=a2e5b54c verdict=confirmed quotes_found=0/0

Item: RE-DERIVE inherited candidate SOURCES row S075 (rejected; seat SrcGitHooksEnv).
Inherited row text (/fast/scratch/hyaku/kumitate-r45/a2/inherited-rows.md line 16):
| S075 | git-scm.com versioned githooks page — https://git-scm.com/docs/githooks/2.56.0 | docs | A |
githooks(5) text for the host git 2.56.0 | HTTP 200 redirect wrapper canonicalising to
https://git-scm.com/docs/githooks/2.54.0; body sha256 9df1e5c7669b47d57a06982e7bc81c6ab585d38a08d70edcd4cc006e31753f54;
opened 2026-10-23 (seat SrcGitHooksEnv) | REJECTED: the 2.56.0 URL serves the 2.54.0 page, not
2.56.0 text, so it cannot pin the host version's hook environment; S064 (githooks.adoc at tag v2.56.0)
is used instead. flip: git-scm.com serves a 2.56.0 githooks page | rejected | 2026-10-23 | on-release |
corpus/lessons/round-45.md |

Re-open (myself, 2026-10-23, ordinary means; no headless browser, no interactions):

Command 1: curl -sS -D s075.headers -o s075.body -w 'HTTP %{http_code} final=%{url_effective}\n'
https://git-scm.com/docs/githooks/2.56.0
Observed: HTTP 301 final=https://git-scm.com/docs/githooks/2.56.0 ; Location header:
https://git-scm.com/docs/githooks/2.56.0/ (trailing-slash redirect). Body = 162-byte 301 wrapper
(sha256 9e17cb15dd75bbbd5dbb984eda674863c3b10ab72613cf8a39a00c3e11a8492a).

Command 2: curl -sS -L -o s075.final -w 'HTTP %{http_code} final=%{url_effective}\n'
https://git-scm.com/docs/githooks/2.56.0
Observed: HTTP 200 final=https://git-scm.com/docs/githooks/2.56.0/ ; size 596 bytes; sha256
9df1e5c7669b47d57a06982e7bc81c6ab585d38a08d70edcd4cc006e31753f54.
Body is a meta-refresh redirect wrapper: <title>Redirecting&hellip;</title>,
<link rel="canonical" href="https://git-scm.com/docs/githooks/2.54.0">,
<meta http-equiv="refresh" content="0; url=https://git-scm.com/docs/githooks/2.54.0">.
It serves NO githooks text of any version.

Command 3: curl -sS -L -o s054.body ... https://git-scm.com/docs/githooks/2.54.0/ → HTTP 200,
final=https://git-scm.com/docs/githooks/2.54.0/, 596 bytes, sha256 9df1e5c... (identical wrapper, same hash).
Command 4: same for https://git-scm.com/docs/githooks/2.55.0/ → HTTP 200, 596 bytes, same sha256.
Command 5: curl -sS -L -o slatest.body https://git-scm.com/docs/githooks → HTTP 200, sha256
b4157e989c1d4235477b64ea041fcc89e959adbca46c7b465d8b8965948bfdf7. Page footer: "last updated in 2.54.0";
version selector lists githooks versions up to 2.54.0 only (2.53.0, 2.54.0 newest; NO 2.55.0/2.56.0 entry).
Command 6: versioned probes 2.30.0/2.45.0/2.49.0 all → HTTP 200, 596 bytes, same wrapper (different sha256s
noted only as wrappers: b5555655... e6881a0b... 3e239497...).

Check verdicts:
(1) Locator exists and content — CONFIRMED (as a rejection basis). The URL exists (HTTP 200) but serves a
redirect wrapper to the 2.54.0 githooks page, not the gloss's claimed "githooks(5) text for the host git
2.56.0". The stated section does not exist at that URL.
(2) Quotes attributed to S075 in the inherited draft — n/m = 0/0. grep 'S075' /fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md
→ 0 matches; the draft cites S062-S074 (header line) and uses S064 for hook env (M3 quote from githooks.adoc:30-31).
Holds trivially.
(3) Pinned sha256 9df1e5c7669b47d57a06982e7bc81c6ab585d38a08d70edcd4cc006e31753f54 — CONFIRMED. My fetch of the
final body (command 2) matches exactly. Note, not refutation: attempt 1 reported final URL
https://git-scm.com/docs/githooks/2.54.0/; today the second hop is an HTML meta-refresh (not an HTTP redirect),
so curl -L stops at /2.56.0/ — the body and hash are identical.
(4) kind/tier — CONFIRMED. docs | A; git-scm.com is official Git documentation (primary source), tier A
appropriate; the row is rejected so tier is moot, but nothing wrong here.
(5) Rejection reason — CONFIRMED. The 2.56.0 URL serves 2.54.0-targeted redirect content, not 2.56.0 text, and
today the unversioned githooks page is "last updated in 2.54.0" with no 2.55.0/2.56.0 version entry, so the flip
condition ("git-scm.com serves a 2.56.0 githooks page") is not met. S064 remains the correct replacement: raw
https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/githooks.adoc → HTTP 200, 29873 bytes, sha256
c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1 (matches the S064 pin exactly; real 2.56.0 text).

Corrected row text: NONE needed — the inherited S075 row is accurate. Minor editorial precision (not a correction):
strictly the 2.56.0 URL serves a redirect wrapper pointing to the 2.54.0 page, not the page text itself.

Scratch: /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS075/ (s075.headers, s075.body, s075.final, s054.body,
s055.body, slatest.body, s245/s249/s3.body, s064.adoc). No tools installed; no leftover processes
(pgrep -af 'seats/a2-ReopenS075' → none). No lane writes other than this report.
