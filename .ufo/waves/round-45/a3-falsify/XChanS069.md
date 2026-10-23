RESULT XChanS069 rev=6b2a4517 verdict=holds channels=4 verbatim=yes version_ok=yes pins=reproduce unsupported=0

Gate, corpus/lessons/round-45.md:34: "bwrap is running a minimal pid 1 process" (:63, 8). `printf '%s' 'bwrap is running a minimal pid 1 process' | wc -w` printed 8.

Channels and byte identity. The row URL serves the version the row claims.

1. Row URL. curl of https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml returned HTTP/2 200, content-type text/plain; charset=utf-8, content-length 33289. sha256 2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da. 681 lines.
2. Release tarball. curl of https://github.com/containers/bubblewrap/releases/download/v0.13.1/bubblewrap-0.13.1.tar.xz returned 129472 bytes, sha256 0e85c8702248b8dd64144f594147553650cdd0e4c951690345faace79c217c4d. GitHub API releases/tags/v0.13.1: tag v0.13.1, published 2026-10-14T12:21:00Z, asset size 129472. A sha256sum file at that release URL returned HTTP 404. meson.build line 4 is version 0.13.1. NEWS.md line 1 is "bubblewrap 0.13.1", released 2026-10-14.
3. Shallow clone of tag v0.13.1. git rev-parse v0.13.1 returned 46ec5c413a3c1da265624ddac3a715b4d1bc487d, an annotated tag, not a commit. git rev-parse 'v0.13.1^{}' returned 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2. git ls-remote printed the same pair. The tag message says bubblewrap 0.13.1, released 2026-10-14.
4. Installed manual. bwrap --version printed bubblewrap 0.13.1. Package bubblewrap 0.13.1-1. man -w 1 bwrap printed /usr/share/man/man1/bwrap.1.gz, sha256 8e34b4164581c2ff40fc9bc2e75f20ec25e4f10a65415d13ea73435254fafc86. Rendered text sha256 8fe4a0c9cf2c61de11e0df7f6fa610d97e5c097d682fee7dd8b1bc5c8e1c0951. The page does not print 0.13.1. Its header date is 10/14/2026, the release day.

cmp says the URL file, the tarball bwrap.xml, and the clone bwrap.xml are the same bytes. Each sha256 is the row pin above. Tarball and clone bubblewrap.c also match, sha256 de141c805cb88f8faff9af1b3bb49098191fc67833b51b51fea84510ea4426ce.

Quote, normalizing only guillemets, apostrophes, and whitespace. The quote has none of the first two.

Man page: FOUND. Lines 24-25 read "If needed (e.g. when using a PID namespace) bwrap is running a minimal pid" and "1 process in the sandbox that is responsible for reaping zombies." Collapsing whitespace makes the eight words contiguous.

URL, tarball, and clone are one body: MISSING as a contiguous string. Line 62 ends with a command tag around bwrap, and line 63 is "is running a minimal pid 1 process in the sandbox that is". The closing tag sits between bwrap and is, so a whitespace-only search misses. Reading those lines, the tags are markup around the command name, and the eight words are the sentence. That reading is not the allowed normalization. The man page is the rendering of this file, and there the quote is contiguous.

Locality. The row names bwrap.xml lines 62-67. Those lines are the paragraph that contains the sentence, including "responsible for reaping zombies" on line 64. The gate's ":63" is the predicate line. The subject bwrap is the last word of line 62. The quote sits inside the row's stated lines.

Line numbers reproduce, read from the fetched file.

Lines 62-67 are the pid 1 paragraph above.
Lines 138-140 are --unshare-pid, "Create a new pid namespace".
Lines 217-235 are "Options about environment setup" through --clearenv. Lines 233-235: "Unset all environment variables, except for PWD and any that are subsequently set by --setenv" (word count 15).
Lines 587-599 are --die-with-parent, which says it kills with SIGKILL when bwrap or bwrap's parent dies, and --as-pid-1.

Pins reproduce. Body sha256 matches on all three xml copies. The row's "tag v0.13.1 = 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2" is the commit the tag points at. The tag object itself is 46ec5c41, which the row does not claim.

Entry sentences that cite S069. A search of the committed entry finds only line 1 and line 110.

Line 1 names "S069 bwrap.xml v0.13.1". Supported: the file is bwrap.xml at that tag.

Lines 110-111: with a PID namespace, the eight-word quote. Supported by lines 62-64. Counted at 16 words: "If needed (e.g. when using a PID namespace) bwrap is running a minimal pid 1 process", then "in the sandbox that is responsible for reaping zombies." Lines 596-598 say --as-pid-1 does not create that pid 1. The quoted sentence already says "If needed".

Same sentence, citing lines 233-235: "--clearenv unsets variables for the command it runs." Those lines say the 15-word unset sentence above. They do not contain "command", and they keep PWD and later --setenv. The description at lines 52-53, 15 words, says the options "construct the root filesystem and process environment for the command to run in the namespace." The entry sentence is that pair, not a verbatim quote, and it leaves the exceptions out. The manual does say both parts, so this is not counted as unsupported.

unsupported=0. No tool was installed. pgrep on this scratch path after the fetches printed no process.