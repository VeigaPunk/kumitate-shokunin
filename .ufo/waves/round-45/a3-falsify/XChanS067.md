RESULT XChanS067 rev=6b2a4517 verdict=defect channels=2 verbatim=yes version_ok=yes pins=reproduce unsupported=1

Scope: SOURCES row S067 (corpus/SOURCES.md:80 at 6b2a4517), its gate row (corpus/lessons/round-45.md:32), and every entry sentence citing S067 (corpus/knowledge/agent-isolation-substrates.md:1,54,62,149). Independent-channel re-open: (1) row URL fetch; (2) shallow clone of upstream jj at tag v0.45.1. No tools installed (existing git/curl; pacman untouched).

(a) Channel identity and byte comparisons
- Row claims (SOURCES.md:80): URL https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md; "tag v0.45.1 = 7c41cdeb16b6b321c64e789a966b6adf723816a5; body sha256 20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea".
- Channel 1 (URL): `curl -sS -D headers.txt -o url-working-copy.md https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md` → sha256 20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea, 118 lines, 6019 bytes. HTTP/2 200, content-length 6019, etag "1d1baa739fb25cb8b085cb83c5af26e389deca1dd009d63015c4a65a0fd474a3".
- Channel 2 (shallow clone): `git ls-remote https://github.com/jj-vcs/jj 'refs/tags/v0.45.1*'` → `7c41cdeb16b6b321c64e789a966b6adf723816a5  refs/tags/v0.45.1` (lightweight tag, no ^{} line). `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE git clone -q --depth 1 --branch v0.45.1 --filter=blob:none --sparse https://github.com/jj-vcs/jj jjclone && git -C jjclone sparse-checkout set docs` → HEAD=7c41cdeb16b6b321c64e789a966b6adf723816a5, TAG=7c41cdeb... (detached HEAD at tagged commit). sha256 of jjclone/docs/working-copy.md = 20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea.
- `cmp` URL body vs clone file → BYTES-IDENTICAL. Both sha256s equal the row's pin. Tag commit equals the row's tag pin. The docs file itself prints no version marker (no version line in the text), so serving identity is established via ref resolution + byte equality with the clone at the pinned tag: the URL serves the version the row claims (version_ok=yes).

(b) Gate quote
- Gate row (round-45.md:32): "You can have multiple working copies backed by a single repo." (§ Workspaces :76, 11). Word count: `printf '%s' "You can have multiple working copies backed by a single repo." | wc -w` → 11 (matches row's "11").
- FOUND verbatim in both channels. Channel 1 line 76: "You can have multiple working copies backed by a single repo. Use"; Channel 2 line 76 identical. No « » / apostrophe variants / whitespace differences to normalize.

(c) Locality
- Line 76 sits under § Workspaces (heading at line 74) in both channels; row's stated locator "§ Workspaces :76" holds. Also row's broader cites § Introduction :9-22, § Ignored files :63-71, § Workspaces :74-118 (incl. stale working copy), :95-98 — all present as stated (section headings at line 3, 60, 74, 93).

(d) Line numbers and sha256 pins reproduce
- Tag pin: row 7c41cdeb16b6b321c64e789a966b6adf723816a5 = ls-remote refs/tags/v0.45.1 = clone HEAD. Reproduces.
- Body sha256 pin: row 20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea = URL body = clone file. Reproduces.
- No line-number divergence observed for any cited span.

(e) Entry sentences citing S067
1. entry.md:54 (M1): "S067 :14-16: a new file «will be automatically committed once you run e.g. `jj st`»" — SUPPORTED: source lines 15-16 read "it will be automatically committed once you run e.g. `jj st`" (normalized).
2. entry.md:62 (M1): "a fresh clone carries no auto-track key (S067 :19-22, :69-71)" — UNSUPPORTED: source lines 19-22 define the `snapshot.auto-track` config option and note paths matching ignore files are never tracked automatically; lines 69-71 say ignored files are never ( automatically (regardless of the config value) and tracked files remain tracked. Neither span mentions fresh clones nor any absent/absent-key state. The sentence cites those spans as support for a claim they do not make. (The fact may be true from the demo, but S067 does not support it.)
3. entry.md:149 (M7): "S067 § Workspaces: «You can have multiple working copies backed by a single repo.»" — SUPPORTED: verbatim at line 76 under § Workspaces.

Residual risk: the unsupported "fresh clone carries no auto-track key" fragment is a citation-support defect (K3′ quote re-open passes; the defect is in the entry's attribution). Verification gaps: none — both independent channels agree with each other and with the row's pins; gate quote verbatim and in-section; no version marker exists in the document text itself, so version identity rests on tag resolution rather than an in-text marker.
