RESULT XChanS063 rev=6b2a4517 verdict=holds channels=3 verbatim=yes version_ok=yes pins=reproduce unsupported=0

Independent-channel re-open of committed SOURCES row S063, entry git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 6b2a45178c72a4565bb9d98e09f4c36b95ca1521:corpus/knowledge/agent-isolation-substrates.md (line 96, M4), row SOURCES.md:76, gate round-45.md:28.

(a) Channel identities and version check
- Ch1 git source tag v2.56.0: curl https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/gitrepository-layout.adoc -> 11890 bytes, body sha256 39ce8d137a30e1fd80eeae146b1c424e56f688f4ddd001259eb98543d3209439. Tag commit (GitHub refs API): v2.56.0 sha 2478544319491bbd2a42cc57a83e3d2f4730a280; v2.49.0 sha 8c9ea59d6eeabbfc5642d99353fce2192645ba1c.
- Ch2 installed man: /usr/share/man/man5/gitrepository-layout.5.gz (zcat sha256 2cc8adf89615a4e534fe38ffcb889312feadb855c4b4b59bb557c8387969e6fa); rendered MANWIDTH=200 man 5 | col -b (228 lines). Version marker printed in text: .TH "GITREPOSITORY-LAYOUT" "5" "2026-09-27" "Git 2.56.0" and "Source: Git 2.56.0". Host git version 2.56.0.
- Ch3 row's own URL: curl https://git-scm.com/docs/gitrepository-layout -> HTTP 200, url_effective identical (no redirect), 64533 bytes, body sha256 d497ee1e5a006482032f513f42d57b93a2d3c0200aeecd017a89cfb03e9a9b22. Version marker printed in page: "gitrepository-layout last updated in 2.49.0".
- Version question: unversioned page footer labels text 2.49.0; but the adoc at tag v2.49.0 and v2.56.0 are byte-identical (same sha256 39ce8d..., diff empty), so the served content equals the v2.56.0 source exactly. Row claims "Git 2.56.0", which matches host git 2.56.0 and the tag's bytes; row itself rejected the versioned /2.56.0 URL (S076) because it redirects to 2.49.0. Content-wise the URL serves the claimed version; page label is 2.49.0 (unchanged document). version_ok=yes.

(b) Gate quote verbatim ("All files under common however will be shared between all working trees.", 12 words by printf | wc -w)
- Ch1 adoc: FOUND as "All files under 'common' however will be shared between all working trees." (apostrophe variant around common; normalized -> verbatim), lines 183-184.
- Ch2 man: FOUND verbatim, man5.txt line 102.
- Ch3 HTML: FOUND verbatim after stripping <em> tags: "All files under <em>common</em> however will be shared between all working trees.", lines 2200-2203.

(c) Locality
Quote sits under entry common in all three channels: adoc common:: at line 180 (quote 183-184); man common entry lines 101-102; HTML common dt at 2198, quote 2200-2203 (inside row-stated 2198-2203).

(d) Row line numbers and sha256
- sha256 pin d497ee1e5a006482032f513f42d57b93a2d3c0200aeecd017a89cfb03e9a9b22 reproduces exactly on re-fetch.
- HTML line numbers reproduce: config dt@2160 text@2162-2164 (stated 2160-2164); hooks dt@2187 text@2189-2196 (stated 2187-2196); common dt@2198 text@2200-2203 (stated 2198-2203); info text@2217-2219 (stated 2217-2219; dt sits at 2215).
- Gate locator "(entry common, 12)": 12 is the quote word count, name entry common matches; not a line number.

(e) Entry citation of S063 (agent-isolation-substrates.md line 96, M4): one sentence cites S063: "S063 `common`: «All files under common however will be shared between all working trees.» — `info/`, `hooks/` and `config` resolve to `$GIT_COMMON_DIR` (S027: `.git/info/exclude` is shared across linked worktrees)."
- Quote fragment: SUPPORTED, verbatim in all three channels.
- "info/, hooks/ and config resolve to $GIT_COMMON_DIR": SUPPORTED by S063's own entries: each states "This directory is ignored if $GIT_COMMON_DIR is set and "$GIT_COMMON_DIR/<name>" will be used instead." (adoc config 145-149, hooks 170-176, info 194-198; identical in man and HTML).
- unsupported=0. Line 1 of entry lists S063 among sources (declaration, not a claim).

Verdict: holds. No defect found. Caveats: unversioned page footer says "last updated in 2.49.0" while content is byte-identical to v2.56.0 (file unchanged between tags); gate locator's "12" is word count. No tools installed (only curl, git, man, zcat, python3; all pre-existing).
