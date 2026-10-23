RESULT SweepS071S077 rev=516977af verdict=defects rows=7 defects=1

Anti-loop re-open of SOURCES rows S071–S077 at 516977af2216b1cc426ee970d260dee53714bf4f.
Method: admission quote taken from the round-45 gate lines in corpus/lessons/round-45.md (lines 36–41, 145) plus
each row's own anchor cell; sources re-fetched with curl (no `-L` for pin hashing; the two rejected pages needed
`-L` because the bare URL now 301s to its trailing-slash self before serving the pinned wrapper); quote matched by
grepping the literal words in the fetched bytes (tags stripped where noted); teaches checked against the located
bytes only. sha256 via sha256sum over the response body. Scratch: /fast/scratch/hyaku/kumitate-r46/seats/w1-SweepS071S077/.
No tools installed. No lane files written except this report.

ROW S071 verdict=holds
- Gate quote: "This file contains the initial environment that was set when the currently executing program was started via execve(2)." (round-45.md:36, 18 words).
- `curl -sS https://man7.org/linux/man-pages/man5/proc_pid_environ.5.html` → http=200, body sha256 93394d9e…c46 = row pin, holds.
- Quote verbatim in fetched body lines 73–75 (spans three lines, whitespace-folded): "the initial environment that was set / when the currently executing program was started via / execve(2)".
- teaches: "holds the environment set when the running program was started by execve(2), not later in-process changes" — the "not later" clause is in the same § DESCRIPTION located bytes (lines 81–84: "the process modifies its environment … this file will not reflect those changes"). Both halves sourced.

ROW S072 verdict=holds
- Gate quote: "out-of-memory killer is invoked inside the unit" (round-45.md:37, 7 words). Verbatim at fetched line 192 of systemd.resource-control.html.
- `curl -sS …/man/262/systemd.resource-control.html` → http=200, sha256 aa70dfdf…134f = pin; `…/man/262/systemd-run.html` → http=200, sha256 fab8afcc…555a = pin. Both hold.
- teaches 4 clauses all in located bytes: MemoryMax= "absolute limit" + OOM-in-unit (dt id `MemoryMax=bytes`, lines 191–201); TasksMax= caps task creation (dt id `TasksMax=N`, line 250, text 250–258); EffectiveMemoryMax= "most stringent limit of the unit and parent slices" sits inside the MemoryMax= dd, lines 200–202 — note: it straddles the 191-201 locator by one line but is inside the same entry paragraph; systemd-run scope "will thus inherit the execution environment of the caller" at run.html line 40, inside § Description (locator 39–42).

ROW S073 verdict=holds
- Gate quote: "Sets the max memory size of V8's old memory section." (round-45.md:38, 10 words). Verbatim at cli.html line 4148 (header `--max-old-space-size=SIZE` (in MiB) at 4147).
- `curl -sS https://nodejs.org/docs/v24.21.0/api/cli.html` → http=200, sha256 7302f93c…; `…/api/buffer.html` → http=200, sha256 5c9f23a7…. Row pins NO body sha256 for either page (line locators only) — recorded, not a pin failure; page header "Node.js v24.21.0" = host `node --version` v24.21.0.
- teaches clause 1 ("--max-old-space-size sets the size of V8's old memory section only") = located text plus scoping "only"; clause 2 is a provenance note (withdrawn claim, XChanS073 → S077), not a source assertion; clause 3 (RLIMIT_AS) verified: man-pages 6.19 `man 2 getrlimit` line ~49: "maximum size of the process's virtual memory (address space) … brk(2), mmap(2) … fail with the error ENOMEM", NOTES line 315: "A child process created via fork(2) inherits its parent's resource limits"; `prlimit --help` shows `-v, --as  size of virtual memory`. All supported.

ROW S074 verdict=holds
- Gate quote: "By default, Jujutsu snapshots the working copy at the beginning of every command." (round-45.md:39, 13 words). Verbatim at `jj status --help` stdout line 36 on this host.
- `jj --version` → jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5 = row's pinned binary; capture sha256 2307dec8…370d reproduced byte-for-byte (119 lines).
- teaches: "snapshots … at the beginning of every command; --ignore-working-copy neither snapshots nor updates it" — located bytes: "Don't snapshot the working copy, and don't update it" (help lines ~33–35, within the 34–41 locator) plus the snapshot sentence. Both halves sourced.

ROW S075 verdict=holds
- Gate line: quote "Redirecting…" = the 596-byte wrapper's <title> (round-45.md:40). Status rejected.
- `curl -sS https://git-scm.com/docs/githooks/2.56.0` → http=301 (162 B, → trailing slash); `curl -sSL` → final body 596 B, sha256 9df1e5c7…f54 = row pin, holds. Wrapper contains `<link rel="canonical" href="https://git-scm.com/docs/githooks/2.54.0">`, `<title>Redirecting&hellip;</title>`, no manual text.
- Reject reason re-checked: URL serves a redirect wrapper, no manual text — accurate. Nuance (not defect): the canonical target is 2.54.0 while the unversioned githooks page footer reads "githooks last updated in 2.54.0", so the target text is by site convention the current text; the reason phrase "not 2.56.0 text" is loose but the row's load-bearing clause ("cannot pin the host version's hook environment" via this URL) is sound, and the r45 spot-check agreed on this reject.

ROW S076 verdict=reason-wrong
- Gate line quote: "gitrepository-layout last updated in 2.49.0" (round-45.md:41, from the unversioned page footer). Status rejected; decision itself correct.
- `curl -sS https://git-scm.com/docs/gitrepository-layout/2.56.0` → http=301; `curl -sSL` → final body 632 B, sha256 c4cd4197…2ca5 = row pin, holds. Wrapper: `<link rel="canonical" href="…/gitrepository-layout/2.49.0">`, title "Redirecting…", zero manual text.
- Reject reason re-checked against the source: "the versioned 2.56.0 URL is a redirect to 2.49.0 text, not manual text for the host version". The second clause is contradicted by the source: the unversioned page footer says "gitrepository-layout last updated in 2.49.0" (verified in my fetch of https://git-scm.com/docs/gitrepository-layout, http=200, sha256 d497ee1e… = S063's pin), i.e. the redirect target is manual text for the host version 2.56.0 (host `git --version` 2.56.0). The URL serves no text at all — the sound reason is "redirect wrapper, no manual text". This is exactly routed repair D3 in corpus/lessons/round-45-verifier-spotcheck.md (D3: re-word to "redirect wrapper, no manual text"); the repair has NOT landed at 516977af (SOURCES.md last touched by d5f67ee, pre-round-46), so the defect is still present at the judged revision.

ROW S077 verdict=holds
- Gate quote: "arrayBuffers refers to memory allocated for ArrayBuffers and SharedArrayBuffers, including all Node.js Buffers." (round-45.md:145, 13 words). Verbatim at process.html lines 2869–2870 (tags stripped: `<code>ArrayBuffer</code>s`, `<a href="buffer.html"><code>Buffer</code></a>s`).
- `curl -sS https://nodejs.org/docs/v24.21.0/api/process.html` → http=200, sha256 1224adf1…a4b5 = row pin, holds; page header "Node.js v24.21.0".
- teaches: "heapTotal/heapUsed are V8's memory usage" (located line 2863: "heapTotal and heapUsed refer to V8's memory usage"); "arrayBuffers counts memory of all Node.js Buffers and is included in external" (lines 2869–2871: "including all Node.js Buffers. This is also included in the external value"); "Buffer memory accounted apart from the V8 heap" is a fair composition of the two located sentences. Nothing beyond locators.

Summary: 6 holds, 1 reason-wrong (S076, already routed as repair D3 — decision correct, reason clause contradicts the source's own version footer). All pins that exist reproduce; S073 carries no body pins (locator-only row).
