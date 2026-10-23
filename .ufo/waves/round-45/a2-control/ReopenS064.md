RESULT ReopenS064 rev=a2e5b54c verdict=confirmed quotes_found=1/1

Item: RE-DERIVE inherited candidate SOURCES row S064 (attempt-1 scratch: inherited-rows.md; seat report SrcGitHooksEnv.md, UNTRUSTED). Lane bound: seat writes this report only. No tools installed (no installs needed; used curl, git ls-remote, read/grep of lane files).

1. Re-open of the source (ordinary means, with redirects)
- Command: `curl --location --silent --show-error --output githooks-v2.56.0.adoc --write-out 'HTTP=%{http_code} FINAL=%{url_effective}\n' 'https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/githooks.adoc' && sha256sum githooks-v2.56.0.adoc`.
- Observed: `HTTP=200`; final URL is the requested raw URL (no redirect); body SHA-256 `c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1`; 29873 bytes. This matches the row's pinned sha256 and attempt-1's captured size exactly.
- Version anchor: `git ls-remote https://github.com/git/git.git 'refs/tags/v2.56.0' 'refs/tags/v2.56.0^{}'` → tag object `2478544319491bbd2a42cc57a83e3d2f4730a280` peels to commit `a018953688f1b10bddf91bff8747068f5f4746a4`, exactly the commit the row names. Tag v2.56.0 is immutable; the blob hash pins the version the text belongs to.

2. Locator content vs teaches/gloss (check 1) — CONFIRMED
- Row anchor: `Documentation/githooks.adoc:24-40`. Read fetched lines 24-40: working-directory rules (24-28), environment-variable export (30-31), foreign-repository cleanup (32-35), and the `unset $(git rev-parse --local-env-vars)` example (38-39).
- teaches "which repository-locating environment variables git exports to hooks": line 30 says "Environment variables, such as `GIT_DIR`, `GIT_WORK_TREE`, etc., are exported so that Git commands run by the hook can correctly locate the repository." Holds (page names the variables as examples; it does not enumerate the full set — the row's gloss does not claim it does).
- gloss "GIT_DIR, GIT_WORK_TREE etc. are exported to hooks so their git commands locate the repository; a git command a hook ... runs against another repository must first clear `git rev-parse --local-env-vars`": lines 32-35 ("then it should clear these environment variables so they do not interfere with Git operations at the foreign location") and 38-39 (the named unset example) hold. The "seat spawned under one" extension is a lane inference, not attributed to the page.

3. Draft quotes attributed to S064 (check 2) — CONFIRMED 1/1
- The inherited entry draft cites S064 exactly once (M3, lines 59-61): «Environment variables, such as `GIT_DIR`, `GIT_WORK_TREE`, etc., are exported so that Git commands run by the hook can correctly locate the repository.» (verified by grep for `S064|githooks` across the whole 156-line draft: matches only at line 1 source list and lines 59-61; full-file read confirms no other S064 attribution).
- Found verbatim in the fetched bytes at lines 30-31 (the draft's line break after "exported" folds onto line 31; K3 normalization applies). Word count `22` (≤25).
- Also re-verified the seat report's other quotes in the same fetched bytes: `changes its working directory to either $GIT_DIR in a bare repository or the root of the working tree in a non-bare repository.` (22 words, lines 24-26); `which are always executed in $GIT_DIR.` (6 words, lines 26-28); `then it should clear these environment variables so they do not interfere with Git operations at the foreign location.` (19 words, lines 32-35); `foreign_desc=$(unset $(git rev-parse --local-env-vars); git -C ../foreign-repo describe)` (8 words, line 39). All sit under the named section/lines.

4. Pinned sha256 (check 3) — CONFIRMED
- Fetched body SHA-256 equals the row's pinned `c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1` exactly (live raw tag URL; no mismatch note needed).

5. Kind/tier (check 4) — CONFIRMED
- Row kind `docs`, tier `A`. Source is the official git repository's documentation at an official release tag (github.com/git/git v2.56.0) — primary/official; tier A permitted per SOURCES-CONTRACT-v1 rule 3 (QUALITY Q2: community is never A; not applicable). `docs` kind is correct for a man-page source (githooks(5) adoc).

6. Rejected-row family (check 5) — not applicable to S064 (row is mined, not rejected); corroboration of sibling S075's rejection: re-fetched `https://git-scm.com/docs/githooks/2.56.0` → HTTP 200, body sha256 `9df1e5c7669b47d57a06982e7bc81c6ab585d38a08d70edcd4cc006e31753f54` (identical to attempt 1), and the 596-byte HTML is a canonicalising wrapper: `<link rel="canonical" href="https://git-scm.com/docs/githooks/2.54.0">` + meta refresh to 2.54.0. The S075 rejection reason holds, and explains row S064 being used instead.

Conclusion: row S064 is confirmed as inherited, with corrected text needed: none. Suggested final row text (unchanged from inherited):
| S064 | githooks(5), Git v2.56.0 source — https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/githooks.adoc | docs | A | which repository-locating environment variables git exports to hooks | Documentation/githooks.adoc:24-40 at tag v2.56.0 (commit a018953688f1b10bddf91bff8747068f5f4746a4); body sha256 c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1; fetched 2026-10-23 (seat SrcGitHooksEnv) | GIT_DIR, GIT_WORK_TREE etc. are exported to hooks so their git commands locate the repository; a git command a hook (or a seat spawned under one) runs against another repository must first clear `git rev-parse --local-env-vars` | mined | 2026-10-23 | on-release | corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md |

Verification gaps: none for this row. The host-git 2.56.0 version claim is the row's stated context, not a claim of this row about the host binary.
