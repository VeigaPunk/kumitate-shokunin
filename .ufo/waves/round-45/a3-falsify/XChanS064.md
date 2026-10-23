RESULT XChanS064 rev=6b2a4517 verdict=holds channels=3 verbatim=yes version_ok=yes pins=reproduce unsupported=0

Item: independent-channel re-open of committed SOURCES row S064 (githooks(5), Git v2.56.0 source). Lane tip 6b2a45178c72a4565bb9d98e09f4c36b95ca1521.

Gate quote (lessons/round-45.md line 29; locator :30-31; word count stated 22):
"Environment variables, such as `GIT_DIR`, `GIT_WORK_TREE`, etc., are exported so that Git commands run by the hook can correctly locate the repository."
Observed word count: 22 (`printf '%s' "<quote>" | wc -w`).

Channel A — the row's own URL (https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/githooks.adoc):
Command: curl -sL -o row-url-githooks.adoc <url> && wc -c && sha256sum row-url-githooks.adoc
Observed: 29873 bytes; sha256 c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1, which equals the row's claimed body sha256 exactly.
Quote FOUND verbatim at lines 30-31. The URL serves the claimed version (see Channel C bytes).

Channel B — installed man 5 githooks (host git, `git --version` = 2.56.0):
Command: MANWIDTH=200 man 5 githooks | col -b > man-githooks.txt && sha256sum man-githooks.txt
Observed: sha256 8092ac457de8e36f659ac721df537ba820d21999502118954e9204fcaf193cf0; footer prints "Git 2.56.0" with date 2026-09-27, pinning the page to the host version.
Quote FOUND in DESCRIPTION (extracted line 17): "Environment variables, such as GIT_DIR, GIT_WORK_TREE, etc., are exported so that Git commands run by the hook can correctly locate the repository." — verbatim modulo man rendering (backticks dropped by troff, whitespace collapsed).

Channel C — git source tag v2.56.0, shallow clone from github.com/git/git:
Command: git clone -q --depth 1 --branch v2.56.0 https://github.com/git/git.git git-src && git rev-parse v2.56.0 && git cat-file -t v2.56.0 && git rev-parse 'v2.56.0^{}'
Observed: tag object 2478544319491bbd2a42cc57a83e3d2f4730a280 (type tag); peeled commit a018953688f1b10bddf91bff8747068f5f4746a4, which equals the row's stated commit a018953688f1b10bddf91bff8747068f5f4746a4.
Documentation/githooks.adoc sha256 c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1; `diff` against the fetched row URL: IDENTICAL (same blob as Channel A).
Quote FOUND verbatim at lines 30-31.

(b) verbatim: the gate quote is FOUND in all three channels (A, B, C); only « » / apostrophe variants / whitespace needed normalising (A/C keep the source's backticks; B drops them in troff rendering).
(c) locality: the source's DESCRIPTION section spans adoc lines 13-53; the row's stated block (lines 24-40) and the quoted lines 30-31 sit inside it. In the man page the same paragraph sits in DESCRIPTION.
(d) pins: the row claims block Documentation/githooks.adoc:24-40, quote at :30-31, body sha256 c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1. Observed lines 30-31 hold the quote; observed sha256 c3aff48667535943bf368c0086567a0f313661bd0544abbb8a41ff90a0cfcdb1. REPRODUCE.
(e) entry sentences citing S064: exactly one sentence (agent-isolation-substrates.md line 80, M3): «S064 githooks.adoc:30-31: "Environment variables, such as `GIT_DIR`, `GIT_WORK_TREE`, etc., are exported so that Git commands run by the hook can correctly locate the repository."» — SUPPORTED verbatim with the correct locator. The same M3 paragraph's operational claim (clear `git rev-parse --local-env-vars` before a hook/spawned seat runs git against another repository) is also supported by the same source, lines 32-39: "then it should clear these environment variables so they do not interfere with Git operations at the foreign location" followed by the example `foreign_desc=$(unset $(git rev-parse --local-env-vars); git -C ../foreign-repo describe)`. unsupported=0.

No tools installed or updated; nothing written inside the lane except this report; scratch only at /fast/scratch/hyaku/kumitate-r45/seats/a3f-XChanS064/ (git source clone + fetched bytes + man text); no processes left running.
