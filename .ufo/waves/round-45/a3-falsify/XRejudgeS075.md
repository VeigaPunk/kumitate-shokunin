RESULT XRejudgeS075 rev=6b2a4517 verdict=reject-holds served_version=2.54.0 flip_observable=yes substitute_ok=yes

Item: re-judge rejected row S075 by a fresh re-open of its URL and independent channels for 2.56.0 text.
Judged object read at rev 6b2a45178c72a4565bb9d98e09f4c36b95ca1521 via `git show ...:corpus/SOURCES.md` and
`git show ...:corpus/lessons/round-45.md` (lane clone in scratch, detached at 6b2a4517).

Committed row S075 (SOURCES.md:88): URL https://git-scm.com/docs/githooks/2.56.0; body sha256
9df1e5c7669b47d57a06982e7bc81c6ab585d38a08d70edcd4cc006e31753f54; REJECTED: "the 2.56.0 URL serves the
2.54.0 page, not 2.56.0 text, so it cannot pin the host version's hook environment; S064 (githooks.adoc at
tag v2.56.0) is used instead. flip: git-scm.com serves a 2.56.0 githooks page".

Re-open today (2026-10-23 ~06:51Z), ordinary curl, no browser:
Command: curl -sS -L -D headers.txt -o githooks-2.56.0.html -w 'final_url=%{url_effective} http_code=%{http_code} num_redirects=%{num_redirects}\n' https://git-scm.com/docs/githooks/2.56.0
Observed: HTTP 301 (162-byte wrapper, Location: .../2.56.0/) then HTTP 200; final_url=
https://git-scm.com/docs/githooks/2.56.0/; num_redirects=1; body sha256
9df1e5c7669b47d57a06982e7bc81c6ab585d38a08d70edcd4cc006e31753f54 (596 bytes) — byte-identical to the
committed row's capture. Body is a meta-refresh redirect wrapper: <title>Redirecting&hellip;</title>, <link
rel="canonical" href="https://git-scm.com/docs/githooks/2.54.0">, <meta http-equiv="refresh" content="0;
url=https://git-scm.com/docs/githooks/2.54.0">. It serves NO githooks manual text of any version; the version
the served page names is 2.54.0 (canonical target), i.e. served_version=2.54.0.
The target https://git-scm.com/docs/githooks/2.54.0/ itself returns the same 596-byte wrapper (sha256
9df1e5c...), so the versioned paths are stubs.
Current unversioned manual https://git-scm.com/docs/githooks → HTTP 200, sha256
b4157e989c1d4235477b64ea041fcc89e959adbca46c7b465d8b8965948bfdf7, footer "last updated in 2.54.0"; version
selector lists githooks versions up to 2.54.0 only (no 2.55.0/2.56.0 entry). No githooks text for 2.56.0
exists on git-scm.com today.

Reject reason holds: the 2.56.0 URL serves a redirect wrapper to the 2.54.0 page, not 2.56.0 text, today
(identical bytes to the committed capture). Flip condition observable as written: yes — fetch the URL, inspect
the body/canonical/footer; the check is deterministic and currently false (git-scm.com serves no 2.56.0
githooks page).

Independent channels for 2.56.0 text:
Channel A (S064's own source): curl -sS -L -o githooks.adoc https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/githooks.adoc → HTTP 200, 0 redirects, sha256 c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1 — equals the committed row S064's pin exactly. git ls-remote --tags https://github.com/git/git.git refs/tags/v2.56.0 (refs/tags/v2.56.0^{}) → a018953688f1b10bddf91bff8747068f5f4746a4 — equals the row's stated commit. Quote (22 words, Documentation/githooks.adoc:30-31): "Environment variables, such as GIT_DIR, GIT_WORK_TREE, etc., are exported so that Git commands run by the hook can correctly locate the repository." Verbatim in the fetched bytes; the row's teaches matches (lines 32+ continue: clear the variables "so they do not interfere with Git operations at the foreign location", example uses `unset $(git rev-parse --local-env-vars)`). Right version: file is at tag v2.56.0.
Channel B (installed man page): /usr/share/man/man5/githooks.5.gz (host git 2.56.0) — roff header "Source: Git 2.56.0", date 2026-09-27; contains the identical sentence ("Environment variables, such as GIT_DIR, GIT_WORK_TREE, etc., are exported so that Git commands run by the hook can correctly locate the repository.") and the same clear-variables advice and example. Same text, 2.56.0.

Substitute S064 is a correct replacement: same text (quote verbatim in githooks.adoc:30-31, corroborated by the installed 2.56.0 man page), right version (tag v2.56.0, commit a018953688f1b10bddf91bff8747068f5f4746a4, pinned body sha256 c3aff486... re-derived). The entry (agent-isolation-substrates.md:80) cites S064 for the hook-env mechanism and the lesson records S075 as rejected; no entry text depends on the rejected row.

Comparison receipt: committed a2-control/ReopenS075.md (control wave, rev a2e5b54c) reached the identical conclusions with identical hashes (wrapper 9df1e5c..., unversioned b4157e98..., adoc c3aff486...), confirming the row and the method.

Scratch: /fast/scratch/hyaku/kumitate-r45/seats/a3f-XRejudgeS075/ (headers.txt, githooks-2.56.0.html, githooks-2.54.0.html, githooks-unversioned.html, githooks.adoc). No tools installed (curl present). No leftover processes (pgrep -af 'a3f-XRejudgeS075' → none). No lane writes other than this report.
