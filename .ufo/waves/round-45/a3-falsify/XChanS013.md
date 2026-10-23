RESULT XChanS013 rev=6b2a4517 verdict=holds channels=2 verbatim=yes version_ok=yes pins=reproduce unsupported=0

Item: independent-channel re-open of committed SOURCES row S013 (Kimi Code CLI Docs, Tower multi-agent collaboration), method new this attempt.
Judged object: 6b2a45178c72a4565bb9d98e09f4c36b95ca1521.

Row under test — committed corpus/SOURCES.md line 26 (file sha256 34c5cbf130902b0972e97ae32a2171be7a9554a45c5bca024ee63c6062d8678b), key cells: URL https://moonshotai.github.io/kimi-code/en/guides/tower.html; grade A; sections "§ Tower multi-agent collaboration (intro); § Check status and intervene; § Understand merges and rebases; § Safety and resource cost"; "fetched 2026-10-23 (re-derived ReopenS013); HTTP 200; unversioned page, Last-Modified Wed, 21 Oct 2026 06:23:19 GMT; body sha256 ad6eb6f82f6fe1ab9c0a8809a8342b1e26dbaa98cc66c5a895eb6c0950ce012f"; used-by the entry and lessons/round-45.md.

Gate line — committed corpus/lessons/round-45.md line 25 (file sha256 c33c2809df286b11622220376f6ac826e5df3a13bdf4145f9ea028421b08e947):
| S013 | https://moonshotai.github.io/kimi-code/en/guides/tower.html | 2026-10-23 | "Worktrees isolate writes, but they are not a security sandbox." (§ Safety and resource cost, 10) | admit A, queued → mined; locator widened to the four sections the gloss uses (ReopenS013) |
Revision log lines 62-63 and frontier line 68 of the same file corroborate the widen and the fetch re-derivation.

The ", 10" pin is a word count, not a line number: printf '%s' "Worktrees isolate writes, but they are not a security sandbox." | wc -w = 10. Proof of convention: sibling gate lines S067 "(§ Workspaces :76, 11)" writes a line anchor as ":76" separately from an 11-word quote, and S062 ", 19" / S071 ", 18" count 19 and 18 words respectively. Read as a line number, 10 would be false (observed 112/119 below); read as a word count it reproduces exactly.

CHANNEL 1 — the row's own URL, served bytes:
$ curl -sS -D headers-ch1.txt -o ch1-tower.html -w 'HTTP=%{http_code} SIZE=%{size_download}\n' 'https://moonshotai.github.io/kimi-code/en/guides/tower.html'
HTTP=200 SIZE=41799; content-type: text/html; charset=utf-8; etag: "6ad85a56-a347".
last-modified: Wed, 21 Oct 2026 06:23:18 GMT — identical on two later header-only refetches (same etag, same content-length).
sha256sum ch1-tower.html = ad6eb6f82f6fe1ab9c0a8809a8342b1e26dbaa98cc66c5a895eb6c0950ce012f — EQUALS the row's pinned body sha256. The URL serves exactly the version the row pinned.
No version marker printed in the page: grep -io 'version...' over the HTML returns nothing, supporting the row's "unversioned page" claim; identity rests on Last-Modified + sha256, as the row itself states.

CHANNEL 2 — upstream repository (independent host and format):
$ env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --depth 1 --filter=blob:none --sparse https://github.com/MoonshotAI/kimi-code <scratch>/kimi-code-upstream
Repo found: MoonshotAI/kimi-code (GitHub API: "Kimi Code CLI — The Starting Point for Next-Gen Agents") — the docs/ tree builds the Pages site (docs/en/guides/tower.md ↔ en/guides/tower.html).
Latest commit at clone: 0325b755db46f865f2dc0bca0d6c3d95ad817fcb 2026-10-23T13:18:59+08:00 "feat(agent-core-v2): leave Plan mode to the user and review every plan (#4247)".
Tower guide source docs/en/guides/tower.md at HEAD: sha256 3c855306a725d0c2f989d05ff907711542dbbf365febd2613516f6c64b8de1b8, git blob cd02dce6d0eb422aeb298b4f61129b5f2217e5e3.
Sections at HEAD: line 1 "# Tower multi-agent collaboration"; 71 "## Check status and intervene"; 82 "## Understand merges and rebases"; 117 "## Safety and resource cost" — all four row-pinned sections exist.
Gate quote at line 119 (HEAD), first sentence of the paragraph under that heading, verbatim.

Channel-to-channel version correspondence: the Pages deploy (Last-Modified 2026-10-21) predates #4312, which changed tower.md at 2026-10-23T12:11:50+08:00 (commit 01ef64e). Served HTML contains the pre-#4312 phrases "Tower limits concurrently spawned agents" (1 hit) and "does not support selecting a model for an individual mission" (1 hit) and lacks the post-#4312 phrase "caps their combined total at 256" (0 hits) — the served page is built from the 60adab4-era text (60adab4 2026-10-15T12:56:05+08:00, the prior tower.md commit). At 60adab4: quote at line 112, heading "## Safety and resource cost" at line 110; tower.md sha256 763151f4c9405efa496164b529ab8e1d45302143f1919fed5e3a314f642e11b1. Diff 60adab4→HEAD on tower.md: 10 insertions, 3 deletions; the quoted sentence's text is unchanged (only its line moved 112→119).

(b) Gate quote FOUND/MISSING: FOUND verbatim in both channels.
ch1 (HTML, sha256 ad6eb6f8...): <h2 id="safety-and-resource-cost"> immediately followed by <p>Worktrees isolate writes, but they are not a security sandbox. Workers can read...
ch2 (tower.md line 112 at 60adab4 / line 119 at HEAD, sha256s 763151f4... / 3c855306...): same sentence verbatim. Only the entry's « » differs from the gate's straight quotes — inside the allowed normalization; nothing else needed normalizing.

(c) Locality: the quote is the first sentence of § Safety and resource cost in both channels (ch1: first <p> after the h2; ch2: heading line 110/117, quote line 112/119). It is the only "security sandbox" occurrence in either channel (1 hit each). All four pinned sections verified present in both channels (HTML hits 3/1/1/1; md headings lines 1/71/82/117).

(d) Row pins vs observed:
- Row position: SOURCES.md line 26 at the commit; working tree line 26 byte-identical (row sha256 a6a259d2469d5013131f0c5b35468af69805c4b5f17995acf43b902b91900e29 in both). REPRODUCE.
- Pinned body sha256 ad6eb6f8...ce012f: REPRODUCES exactly on the fetched bytes (41799 bytes, etag "6ad85a56-a347").
- Word-count pin ", 10": REPRODUCES (measured 10).
- Pinned Last-Modified "Wed, 21 Oct 2026 06:23:19 GMT": DIFFERS — observed "Wed, 21 Oct 2026 06:23:18 GMT" on all three fetches today, stable, same etag/length/bytes. A one-second metadata mismatch over a byte-identical body. This is the only row pin that does not reproduce; it changes no content claim, but it is recorded plainly as a pin flaw.

(e) Entry sentences citing S013 (entry sha256 a3a7ce3b340b9984f01a13c1aa5fde36fbf3847d68f920cd1d0573ac75d81d61; grep 'S013' hits lines 1 and 26 only):
1. Line 1 (sources list): "...; S013 Kimi Tower; ..." — identity only. SUPPORTED: the row and the guide exist with the identity given above.
2. Lines 26-27: "This entry states no security guarantee: the substrates below bound an honest seat's accidents. S013, § Safety and resource cost: «Worktrees isolate writes, but they are not a security sandbox.»" — SUPPORTED verbatim: that sentence opens § Safety and resource cost in both channels. The entry's no-security-guarantee reading matches the source's continuation "Workers can read repository content and run tools with your permissions." (line 112/119).
unsupported = 0.

Verdict rationale: holds. Two independent channels (GitHub Pages served bytes; upstream git at 0325b755) agree on the quote's verbatim text, its section locality, and the pinned bytes (sha256 exact). The entry's sole S013 citation is supported. One pin flaw found: the row's Last-Modified second (19) does not reproduce (URL stably serves 18) over identical bytes. Upstream moved past the pinned page on 2026-10-23 (#4312) without touching the quoted sentence; the row's fetch metadata correctly describes the served version, so no drift affects the judged entry today.

Tooling: nothing installed or updated (preinstalled curl and git only; pacman untouched per host pause). Host safety: bounded curls and read-only git fetches only; no gate or selftest runs; scratch < 5 MB under /fast/scratch/hyaku/kumitate-r45/seats/a3f-XChanS013/; no background jobs left.
