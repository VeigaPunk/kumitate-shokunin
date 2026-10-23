RESULT ReopenS073 rev=a2e5b54c verdict=confirmed quotes_found=1/1
# ReopenS073 — RE-DERIVE candidate SOURCES row S073 (Node v24.21.0 cli/buffer + installed man pages)

Item: re-derive inherited row S073 from `/fast/scratch/hyaku/kumitate-r45/a2/inherited-rows.md` (UNTRUSTED, attempt 1). Inherited seat report read for comparison only: `.ufo/waves/round-45/build/SrcNodeHeap.md` (attempt 1, UNTRUSTED; not relied on — every source re-opened fresh in this run).

## Re-open receipts (fresh fetch, this seat)

- `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE curl -sS -L -o cli.html -w 'HTTP=%{http_code} FINAL=%{url_effective} SIZE=%{size_download} REDIRECTS=%{num_redirects}\n' https://nodejs.org/docs/v24.21.0/api/cli.html`
  → `HTTP=200 FINAL=https://nodejs.org/docs/v24.21.0/api/cli.html SIZE=278644 REDIRECTS=0`; `sha256sum cli.html` → `7302f93cda9694927010d4171e181e8a7617a8852242d70f005f1ea65365538c`.
- Same command for `https://nodejs.org/docs/v24.21.0/api/buffer.html` → `HTTP=200 FINAL=https://nodejs.org/docs/v24.21.0/api/buffer.html SIZE=503390 REDIRECTS=0`; `sha256sum buffer.html` → `5c9f23a729a68d4ec02fd113e1426d3cc73b9a546c8ff71a1b04702b9d4ae8db`.
- Version identity: `cli.html` lines 5-7 `<meta name="nodejs.org:node-version" content="v24.21.0">`, `<title>Command-line API | Node.js v24.21.0 Documentation</title>`; line 116 `<h1>Node.js v24.21.0 documentation</h1>`; line 131 `<li class="pinned-header">Node.js v24.21.0</li>`. Text belongs to v24.21.0.
- Host runtime: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node --version` → `v24.21.0`.
- Local manuals (ordinary means): `MANPAGER=cat PAGER=cat man 2 getrlimit` → rendered `getrlimit.txt` sha256 `3a27e4c3d348a60be07b883414f38029189ce4ffeba426881da5496173626298` (22948 B), footer "Linux man-pages 6.19 / 2026-02-08 / getrlimit(2)"; `man 1 prlimit` → `prlimit.txt` sha256 `b7531fa0bb579b94eba5a2cab0be4ec112c951834a2f13fed87dbad6eb196c57` (4414 B), footer "util-linux 2.42.4 / 2026-09-21 / PRLIMIT(1)".

## Check verdicts

### (1) Locator exists and says what teaches/gloss claims — CONFIRMED
- Row locator `cli.html --max-old-space-size=SIZE (in MiB)` lines 4148-4150: `line 4147` `<h4><code>--max-old-space-size=SIZE</code> (in MiB)<span>...<a class="mark" href="#--max-old-space-sizesize-in-mib" id="--max-old-space-sizesize-in-mib">#</a>...`; lines 4148-4150 `<p>Sets the max memory size of V8's old memory section. As memory consumption approaches the limit, V8 will spend more time on garbage collection in an effort to free unused memory.</p>`. The section exists at the named lines and states exactly what the `teaches` column claims (what `--max-old-space-size` bounds).
- Row locator `buffer.html Buffer.from(arrayBuffer…)` lines 1621-1624: lines 1621-1624 read "This creates a view of the ArrayBuffer without copying the underlying memory. For example, when passed a reference to the `.buffer` property of a TypedArray instance, the newly created Buffer will share the same allocated memory as the TypedArray's underlying ArrayBuffer." Supports the gloss's "Buffers share ArrayBuffer backing memory" half.
- Row locator installed `getrlimit(2)` RLIMIT_AS and NOTES: `getrlimit.txt` lines 49-54 `RLIMIT_AS — This is the maximum size of the process's virtual memory (address space). ... This limit affects calls to brk(2), mmap(2), and mremap(2), which fail with the error ENOMEM upon exceeding this limit.`; NOTES lines 314-316 "A child process created via fork(2) inherits its parent's resource limits." Supports "RLIMIT_AS limits virtual address space per process (brk/mmap fail with ENOMEM) and is inherited by children".
- Row locator installed `prlimit(1)` RESOURCE OPTIONS: `prlimit.txt` line 62 `RESOURCE OPTIONS`, lines 102-103 `-v, --as[=limits] ... Address space limit.`

### (2) Verbatim quotes the draft attributes to S073 — 1/1 CONFIRMED
Draft `/fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md` mentions S073 twice:
- Line 93-94 (M6): `S073: \`--max-old-space-size\` «Sets the max memory size of V8's old memory section.»` — quote «Sets the max memory size of V8's old memory section.» (10 words, checked with `printf '%s' "Sets the max memory size of V8's old memory section." | wc -w` → `10`) found verbatim in fetched `cli.html` line 4148, inside the named section (`--max-old-space-size=SIZE (in MiB)`, h4 at 4147, <p> at 4148-4150). Straight-ascii apostrophe in both bytes; no normalization needed (K3). FOUND.
- Line 104 (M6): "RLIMIT_AS bounds address space, not resident memory (S073)" — paraphrase, no quote; not a quote check item.

### (3) Pinned sha256 — N/A, no pin recorded in row
The inherited row S073 carries no `body sha256` field (unlike S062/S063/S065 etc.). Nothing to match. As a note: my fresh fetches (`7302f93c…`, `5c9f23a…`) byte-identically match the attempt-1 seat's own pinned fetches recorded in `build/SrcNodeHeap.md` (cli-v24.21.0.html = same sha256 and 278644 bytes; buffer-v24.21.0.html = same sha256 and 503390 bytes). Live source has not changed between attempt 1 (2026-10-23) and this re-open (2026-10-23).

### (4) kind/tier — CONFIRMED
`docs`/`A`. Node.js official docs at nodejs.org/docs/v24.21.0 (primary/official) plus installed distro manuals (man-pages 6.19, util-linux 2.42.4; official). Not community; Q2 ("community is never tier A") untouched. Tier A appropriate for primary/official.

### (5) Rejected row — N/A
S073 is `mined`, not rejected (S075/S076 are the rejected rows this round).

## Findings / notes
- The gloss's "Buffers share ArrayBuffer backing memory outside it" — the "outside V8 old space" half is an inference, not stated by either page (buffer.html: "This creates a view of the ArrayBuffer without copying the underlying memory" + share sentence; cli.html: old-space-only). Same caveat was already recorded by attempt-1 seat SrcNodeHeap. Not a defect of the row; it is flagged as inference in the entry's M6 context (Q4-style). No row text correction needed.
- No tool installed or updated (no install needed; curl/man are present). No leftover processes (`pgrep -f a2-ReopenS073` → none). Scratch artifacts under `/fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS073/` (src/cli.html, src/buffer.html, man/getrlimit.txt, man/prlimit.txt).
- Corrected row: none needed; row S073 stands as inherited.
