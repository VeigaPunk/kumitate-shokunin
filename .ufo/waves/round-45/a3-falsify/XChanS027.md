RESULT XChanS027 rev=6b2a4517 verdict=holds channels=2 verbatim=yes version_ok=yes pins=reproduce unsupported=0

Independent-channel re-open of SOURCES row S027 (git v2.55.0 release notes).
Methods: channel A = the row's own URL (GitHub blob page, fetched once via curl);
channel B = shallow `git clone --depth 1 --branch v2.55.0 https://github.com/git/git`
in scratch (path /fast/scratch/hyaku/kumitate-r45/seats/a3f-XChanS027/git-v2.55.0).
No tools installed; read-only lane use. Host: /home/vgpnk/Projects/shokunin/kumitate-shokunin.

(a) Channel identities and bytes
- Channel B clone: tag v2.55.0 -> tag object 5ce91c059e41090e7d2cffad39c04af8acf98dc1,
  peeled commit e9019fcafe0040228b8631c30f97ae1adb61bcdc ("Git 2.55", clone HEAD).
- `sha256sum Documentation/RelNotes/2.55.0.adoc` (clone) =
  14b333ba079a289afc2658747f19a0ede80751426208e76af6edcf39ea42f1b4
- Channel A: `curl -sL -o row-url.html https://github.com/git/git/blob/v2.55.0/Documentation/RelNotes/2.55.0.adoc`
  (408072 bytes, sha256 afea2fd293136e001841ffecd62dfa593e6a26a7ba235acea2a957096e58d8ff of HTML page).
  Embedded JSON payload: refInfo.name = "v2.55.0", path = "Documentation/RelNotes/2.55.0.adoc",
  rawLines count = 460. Served body joined to file form: sha256 14b333ba079a289afc2658747f19a0ede80751426208e76af6edcf39ea42f1b4.
- Byte comparison served-vs-clone: IDENTICAL (both 20770 bytes; identical every line).
- The release notes text prints no version marker inside itself; version identity is anchored by
  the tag ref (GitHub blob page shows ref v2.55.0) and byte-equality with the cloned v2.55.0 tag.
  Row's URL serves the version the row claims: YES (version_ok=yes).
- Host git is 2.56.0 (`git --version`), matching the row's parenthetical "(host git 2.56.0)".

(b) Gate quote FOUND/MISSING verbatim
- Gate quote (lesson round-45.md line 26): "Document the fact that .git/info/exclude is shared
  across worktrees linked to the same repository." (13 words).
- Channel B: FOUND at lines 38-39 of Documentation/RelNotes/2.55.0.adoc, bullet split across two
  wrapped lines: "* Document the fact that .git/info/exclude is shared across worktrees" /
  "   linked to the same repository." Normalised (whitespace/line-wrap only) identical.
- Channel A: FOUND in served content, identical bytes at same offset.
- Verbatim = yes in both channels.

(c) Locality
- "UI, Workflows & Features" heading at line 4 of the release notes; the bullet sits at lines
  38-39, exactly the row's stated section and lines. Lesson gate line's locator
  "(§ UI, Workflows & Features, lines 38-39, 14)" reproduces.

(d) Pins
- Row's line pins ("bullet at lines 38-39"): REPRODUCE (observed 38-39).
- The SOURCES row and lesson gate line carry no sha256 pin to compare; I report the observed
  body sha256 above (14b333ba...). pins=reproduce for all pins present.
- Additional row claim "the v2.55.0 git-worktree page does not say so": verified — grep -i
  "exclude" and "info/exclude" on Documentation/git-worktree.adoc at v2.55.0 (546 lines) and at
  v2.56.0 (548 lines) find nothing; the v2.56.0 page also does not state the exclude sharing.

(e) Entry sentences citing S027 (entry agent-isolation-substrates.md @ 6b2a4517, 205 lines; exactly 2 "S027" occurrences)
- Line 1 source header: lists "S027 git 2.55.0 release notes" among sources; a citation list, not a claim.
- Line 98, M4 sentence: "`info/`, `hooks/` and `config` resolve to `$GIT_COMMON_DIR` (S027:
  `.git/info/exclude` is shared across linked worktrees)."
  Supporting fragment: release-notes bullet "Document the fact that .git/info/exclude is shared
  across worktrees linked to the same repository." — supports the S027 parenthetical verbatim.
  SUPPORTED. unsupported=0.

No defect found; the row's version, gate quote, locality and the entry's S027 citations all hold
against the independent channel. Report file is the only lane write; scratch holds the two clones.
