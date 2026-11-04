RESULT K74ScoutGitCloneDocs rev=live verdict=opened quote=23-words section=OPTIONS
Target: https://git-scm.com/docs/git-clone opened by ordinary means via curl (HTTP 200).
Capture path: .ufo/waves/round-74/build/captures/git-clone.html
Byte size: 107882 bytes
SHA-256: d31b6c9f293a5dfc52c551b86be211b2d6dad3d2b4cf0d9c696d5fbed713554a
Section heading: OPTIONS (<h2 id="_options">OPTIONS</h2>, option --no-hardlinks)
Located quote (23 words, verbatim from --no-hardlinks):
"Force the cloning process from a repository on a local filesystem to copy the files under the .git/objects directory instead of using hardlinks."
Companion local passage (12 words, verbatim from -l, --local):
"The files under .git/objects/ directory are hardlinked to save space when possible."
Installed man page verification: `git clone --help` (git version 2.56.0)
Man page agreement: Agrees completely (both passages match verbatim).
S223 draft row path: .ufo/waves/round-74/build/K74ScoutGitCloneDocs/S223-row.md
S223 draft row:
| S223 | git clone — https://git-scm.com/docs/git-clone | docs | A | git clone local-path object hardlink semantics | § OPTIONS (--no-hardlinks), located quote "Force the cloning process from a repository on a local filesystem to copy the files under the .git/objects directory instead of using hardlinks."; page captured 2026-11-04, 107882 bytes, sha256 d31b6c9f293a5dfc52c551b86be211b2d6dad3d2b4cf0d9c696d5fbed713554a | Local clone defaults to hardlinking objects; --no-hardlinks forces file copying so an immutable pin clone maintains independent object storage safe from live repository modifications | mined | 2026-11-04 | 180d | corpus/knowledge/origin-pin-restore.md |
Live repo object sharing question:
No. The page does not state anything about a "live" repository or object-sharing hazards with active live repos.
Page rationale quote (15 words, verbatim from --no-hardlinks):
"This may be desirable if you are trying to make a back-up of your repository."
Corrupt/sharing notes: Object-sharing corruption warnings appear only under -s/--shared (.git/objects/info/alternates), not under local hardlinks.
Tool installs/updates: none (curl, sha256sum, git already installed).
Report: .ufo/waves/round-74/w1/K74ScoutGitCloneDocs.md
