SCRIBE ScribeSource quote_words=23 section=File views show the latest version on a branch

Draft row (for corpus/SOURCES.md; next id S033; not appended, lane file untouched):

| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |
|---|---|---|---|---|---|---|---|---|---|---|
| S033 | GitHub Docs: Getting permanent links to files — https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files | docs | A | branch-named file URLs versus commit-pinned permalinks on github.com | § File views show the latest version on a branch; fetched 2026-10-21T07:15:36Z (docs .md rendering, no Last-Modified shown) | A branch-named file URL shows the branch head, which changes as commits land; a commit SHA in place of the branch name pins the content. Stated for file URLs, not for line anchors | queued | 2026-10-21 | 180d | — |

Quote (23 words, verbatim, in section "File views show the latest version on a branch"):
"so if you were to copy the normal URL, the file contents might not be the same when someone looks at it later."

Access: 2026-10-21 07:15:36 UTC (04:15:36 -03:00), fetched via the `.md` suffix rendering of the docs page.

Branch-relative line links: the page does NOT state that a branch-relative line link can point at different content after changes. The closest statement is file-level (the quote above, plus "The version of a file at the head of branch can change as new commits are made"). The line-anchor consequence is an [INFERENCE] from that file-level statement. The "Creating a permanent link to a code snippet" section only links onward to a separate page and makes no line-drift claim.

Evidence:
- Fetched https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files; the reader returned the `.md` form (Content-Type text/markdown).
- Section headings in order: "File views show the latest version on a branch", "Press Y to permalink to a file in a specific commit", "Creating a permanent link to a code snippet", "Further reading".
- Commit pin example in the Press Y section: `https://github.com/github/codeql/blob/b212af08a6cffbb434f3c8a2795a579e092792fd/README.md`.
- Row style and next id S033 taken from corpus/SOURCES.md (registry ends at S032).
- Tooling: none installed or updated.
- No lane files edited; no git or jj state touched; no subagents spawned.
