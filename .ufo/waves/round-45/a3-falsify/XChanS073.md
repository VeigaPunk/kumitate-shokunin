RESULT XChanS073 rev=6b2a4517 verdict=defect channels=4 verbatim=yes version_ok=yes pins=reproduce unsupported=1

Gate line, corpus/lessons/round-45.md:38 at 6b2a4517: "Sets the max memory size of V8's old memory section." (`--max-old-space-size`, line 4148, 10). `printf '%s' "..." | wc -w` → 10. Apostrophe in every hit is U+0027. No guillemets to strip.

(a) Channel identity. The row's URL does serve v24.21.0.
1. Tag v24.21.0. `git ls-remote https://github.com/nodejs/node.git refs/tags/v24.21.0` → annotated tag f37d7da830134b5314a14ced553273786a2bb4cd, peeled commit 955266bfdd854cd280dffd47548673914484e4c0. Tag URL and commit URL are byte-identical (`cmp`). cli.md sha256 15a456feb197e32b66a68622da465c0dd5a2991bc7a29093f1aba4d4bbc71c12 (125111 bytes); no version banner in the file. buffer.md sha256 d5372eef308b9b181fd33dad661ced6a49d5f30086da9979d8b68ddaeb8a0441 (156721 bytes); history marker "version: v24.21.0" at buffer.md:5312.
2. Row URL https://nodejs.org/docs/v24.21.0/api/cli.html . cli.html line 6 meta `nodejs.org:node-version` content `v24.21.0`; line 7 title "Command-line API | Node.js v24.21.0 Documentation" (8 words). Last-Modified Tue, 08 Sep 2026 00:21:20 GMT. cli.html sha256 7302f93cda9694927010d4171e181e8a7617a8852242d70f005f1ea65365538c (278644 bytes). buffer.html same meta, sha256 5c9f23a729a68d4ec02fd113e1426d3cc73b9a546c8ff71a1b04702b9d4ae8db (503390 bytes).
3. Installed `node --version` prints v24.21.0 (process.versions.v8 13.6.233.17-node.53). node --help sha256 650068b7faa41ea8c4b59927d92913879467245e9a7a1de3a3f6219377559767. node --v8-options sha256 e4a8a1ebeca4f0120473c37a9ce792ace6d576424d22f5e730dacbb51ee86e5c.
4. Installed getrlimit(2) source `.TH getrlimit 2 2026-02-08 "Linux man-pages 6.19"` (pacman: man-pages 6.19-1). Uncompressed sha256 323bed3125c937bef838bbae70d8d3079d0eb394184e3758d1af6cd7b85840a3. prlimit(1) util-linux 2.42.4-1, uncompressed sha256 9e9bd559e8a78e8f5073707ac0007f2d202a004b3339a09f1f73d812de8d7bff.

(b) Gate quote per channel.
FOUND, verbatim, cli.md:4161 and cli.html:4148.
MISSING in buffer.md and buffer.html.
MISSING in `node --help`. Lines 192-196 only say `--max-old-space-size-percentage` takes precedence over `--max-old-space-size`.
MISSING in `node --v8-options`. Closest, line 912: "max size of the old space (in Mbytes)" (8 words).
MISSING in getrlimit(2) and prlimit(1).

(c) Locality. The quote is the body of heading `--max-old-space-size=SIZE` (in MiB): cli.html h4 at line 4147, paragraph 4148-4150; cli.md heading line 4159, quote line 4161. A different heading, `--max-old-space-size-percentage=percentage` (cli.md:1817, cli.html:2251), says "Sets the maximum memory size of V8's old memory section as a percentage of available system memory." (16 words). That is not the gate quote and not the row's section.

(d) Pins. The row stores no sha256, so there is no hash pin to miss. Observed hashes are in (a). HTML line numbers reproduce. cli.html 4148-4150 is the three-line paragraph beginning "Sets the max memory size of V8's old memory section." buffer.html 1621-1624 is "This creates a view of the ArrayBuffer without copying the underlying memory" through "share the same allocated memory as the TypedArray's underlying ArrayBuffer." Markdown lines differ (quote at 4161; share text at buffer.md 1199-1202) because that channel is the source, not the HTML the row names. pins=reproduce.

(e) Entry sentences that cite S073, agent-isolation-substrates.md at 6b2a4517.
1. Line 1 label "S073 Node v24.21.0 cli/buffer and getrlimit(2)". Supported by the identities in (a).
2. Lines 134-135, the guillemet quote. Supported by cli.html:4148 and cli.md:4161 under the heading in (c).
3. Lines 134-135, "a Buffer's backing store is an ArrayBuffer outside that section." UNSUPPORTED. buffer.md:1199-1202 and buffer.html:1621-1624 say `Buffer.from(arrayBuffer)` creates a view without copying and shares that ArrayBuffer. buffer.md:12 says Buffer is a subclass of Uint8Array. None of those lines, and not the old-space section, says the memory is outside V8's old memory section. The only "outside the V8 heap" words in cli.md are under `--heapsnapshot-near-heap-limit` (cli.md:1529-1530: "native memory outside the V8 heap", 6 words), about snapshot generation, not Buffer. The row's teaches column repeats the overstatement ("Buffers share ArrayBuffer backing memory outside it"). The checklist says the teaches text must not overstate the quoted passage.
4. Lines 145-146, "RLIMIT_AS bounds address space, not resident memory (S073, getrlimit(2))." Supported. getrlimit.2 lines 78-79: "This is the maximum size of the process's virtual memory (address space)." (12 words). Lines 82-89: brk, mmap, and mremap "fail with the error ENOMEM upon exceeding this limit." (10 words). Resident set is a separate resource, RLIMIT_RSS, lines 324-326. NOTES lines 569-571: "A child process created via fork(2) inherits its parent's resource limits." (11 words). prlimit(1) RESOURCE OPTIONS: `-v, --as` is "Address space limit."

No tool installed. `pgrep -af a3f-XChanS073` → none. Scratch: /fast/scratch/hyaku/kumitate-r45/seats/a3f-XChanS073/.
