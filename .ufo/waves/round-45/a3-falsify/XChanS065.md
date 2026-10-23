RESULT XChanS065 rev=6b2a4517 verdict=holds channels=3 verbatim=yes version_ok=yes pins=reproduce unsupported=0

Independent-channel re-open of committed SOURCES row S065 (git(1), Git 2.56.0). All commands ran read-only;
no tool installed. Lane clone not needed: committed objects read via `git show` on the lane repo.

1. COMMITTED ROW (SOURCES.md @ 6b2a45178c72a4565bb9d98e09f4c36b95ca1521, line 78)
   `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 6b2a45178c72a4565bb9d98e09f4c36b95ca1521:corpus/SOURCES.md`
   line 78: `| S065 | git(1), Git 2.56.0 — https://git-scm.com/docs/git/2.56.0 | docs | A | repository selection: GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE, GIT_CEILING_DIRECTORIES and -C | § Environment Variables → The Git Repository (HTML 5264-5324), § OPTIONS --git-dir and -C (4005-4018); body sha256 336f7842f6015f12fa5fd9f2ed788d4c6d91fc19375a4b50424b5958dfd97f94; fetched 2026-10-23 (seat SrcGitEnv) | GIT_DIR replaces the default .git and turns off discovery; GIT_INDEX_FILE names an alternate index; GIT_CEILING_DIRECTORIES does not exclude a GIT_DIR from the environment; -C only changes the starting directory | mined | 2026-10-23 | on-release | ... |`

2. GATE LINE (lessons/round-45.md @ same commit, line 30)
   `| S065 | https://git-scm.com/docs/git/2.56.0 | 2026-10-23 | "If the GIT_DIR environment variable is set then it specifies a path to use instead of the default .git for the base of the repository." (§ Environment Variables, The Git Repository, 25) | admit A, mined |`
   Quote word count = 25, matches gate's trailing `25`:
   `printf '%s' "If the GIT_DIR environment variable is set then it specifies a path to use instead of the default .git for the base of the repository." | wc -w` -> `25`

3. ENTRY CITATIONS (knowledge/agent-isolation-substrates.md @ same commit)
   grep 'S065' -> exactly 2 lines: 1 (source cover list) and 78.
   line 78-80 (M3): `S065 (git(1) § Environment Variables, The Git Repository): «If the GIT_DIR environment variable is set then it specifies a path to use instead of the default .git for the base of the repository.»; `-C` only sets the starting directory.`

4. CHANNELS
   CH-A URL  https://git-scm.com/docs/git/2.56.0
     `curl -sI -L --max-redirs 5 -o /dev/null -w 'final_url=%{url_effective}\nhttp=%{http_code}\n' https://git-scm.com/docs/git/2.56.0`
     -> `final_url=https://git-scm.com/docs/git/2.56.0` `http=200` (NO redirect; S076's /2.56.0 redirect issue does not affect this page).
     Body: 244230 bytes; sha256 `336f7842f6015f12fa5fd9f2ed788d4c6d91fc19375a4b50424b5958dfd97f94` — byte-identical to the row's pinned hash.
     Version markers in body: line 1359 `git last updated in 2.56.0`; line 1366 `<a href="/docs/git/2.56.0"><span class="version">2.56.0</span>` -> URL serves the claimed version.
     Quote FOUND at line 5301-5303: `If the <code>GIT_DIR</code> environment variable is set then it specifies a path to use instead of the default <code>.git</code> for the base of the repository.`
     Locality: `<h3 id="_the_git_repository">The Git Repository</h3>` at line 5256; the quote sits inside that subsection (row's 5264-5324 starts at the GIT_INDEX_FILE <dt> on line 5264, spans through GIT_CEILING_DIRECTORIES and contains the quote at 5301). OPTIONS block: `--git-dir=<path>` <dt> at line 3999; "turns off the repository discovery" paragraph lines 4005-4017; `-C` cross-reference sentence lines 4018-4020 -> row's 4005-4018 matches.
   CH-B git.adoc at tag v2.56.0
     Fetch: `curl -s https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/git.adoc`
     Identity: tag object `2478544319491bbd2a42cc57a83e3d2f4730a280` peels to commit `a018953688f1b10bddf91bff8747068f5f4746a4` (GitHub refs API; same commit S064 cites for this tag). Body: 47005 bytes; sha256 `050c5330f1a231be22bee3db27c7ef90d8ba22bb7bd6c72c8bab462f6f0a1f79`.
     Quote FOUND at lines 541-544 under `The Git Repository` heading (line 504): `If the `GIT_DIR` environment variable is set then it specifies a path to use instead of the default `.git` for the base of the repository.` (backtick markup delimiters around GIT_DIR/.git; rendered text identical after normalisation).
     `-C` at lines 63-64: `Run as if git was started in '<path>' instead of the current working directory`.
   CH-C installed `man 1 git` (host git 2.56.0)
     Identity: `git --version` -> `git version 2.56.0`; `man --version` -> `man 2.13.1`. Text via `man 1 git | col -b`: 60766 bytes; sha256 `910724f26a7c2fff014c0094f461af4caaead6db522221d9a1fddc4b1501c65b`.
     Quote FOUND at lines 1009-1012: `If the GIT_DIR environment variable is set then it specifies a path to use instead of the default .git for the base of the repository.`
     Locality: ENVIRONMENT VARIABLES section starts line 950; `The Git Repository` heading line 975; quote under it.
     `-C` at lines 51-52: `Run as if git was started in <path> instead of the current working directory`.
     GIT_CEILING_DIRECTORIES (lines ~1027-1029): `It will not exclude the current working directory or a GIT_DIR set on the command line or in the environment.`

5. VERDICT ELEMENTS
   (a) channel identities: CH-A URL (unredirected, serves 2.56.0), CH-B tag v2.56.0 commit a018953688f1b10bddf91bff8747068f5f4746a4, CH-C installed git 2.56.0 manpage; row's URL serves the claimed version (version_ok=yes); row's pinned body sha256 reproduces exactly (pins=reproduce).
   (b) gate quote FOUND verbatim in all 3 channels (normalising « », apostrophe variants, whitespace); in CH-B only markup backticks wrap GIT_DIR/.git.
   (c) locality: quote sits under § Environment Variables -> The Git Repository in all 3 channels (CH-A 5256/5301, CH-B 504/541, CH-C 975/1009).
   (d) row line numbers: 5264-5324 and 4005-4018 reproduce against fetched body; sha256 336f7842... reproduces byte-for-byte.
   (e) entry sentences citing S065: (i) gate quote — supported verbatim by all channels; (ii) `-C` only sets the starting directory — supported (CH-B 63-64, CH-C 51-52, CH-A OPTIONS block). Unsupported: 0.
   Row bullet claims all supported by source text: GIT_DIR turns off discovery (CH-B 147, CH-A 4006-4009); GIT_INDEX_FILE alternate index (CH-A 5264-5268, CH-B 510-512); GIT_CEILING_DIRECTORIES does not exclude env GIT_DIR (CH-C 1027-1029, CH-A 5318-5323, CH-B 558-560).

CONCLUSION: S065 holds under independent re-open on all three channels; no defect found.

Verification gaps: none material. The adoc backtick markup is a rendering artifact, not a content difference.
