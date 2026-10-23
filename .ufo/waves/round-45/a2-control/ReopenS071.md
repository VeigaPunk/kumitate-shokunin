RESULT ReopenS071 rev=a2e5b54c verdict=confirmed quotes_found=1/1

Re-derived inherited candidate SOURCES row S071 (attempt-1 scratch UNTRUSTED; seat DemoBwrapEnv). All five checks pass; verdict CONFIRMED, row text unchanged.

1. Row inspected (verbatim from /fast/scratch/hyaku/kumitate-r45/a2/inherited-rows.md:12, identical to committed corpus/SOURCES.md S071):
`| S071 | proc_pid_environ(5), Linux man-pages — https://man7.org/linux/man-pages/man5/proc_pid_environ.5.html | docs | A | what /proc/<pid>/environ exposes | § DESCRIPTION; body sha256 93394d9edb801ad44e342e8e8ab057bea619d995803221edaf008226b2062c46; fetched 2026-10-23 (seat DemoBwrapEnv) | /proc/<pid>/environ holds the environment set when the running program was started by execve(2), not later in-process changes | mined | 2026-10-23 | 365d | corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md |`

2. Re-open command and observed output (ordinary means, curl):
`curl -sL -D headers.txt -o proc_pid_environ.5.html 'https://man7.org/linux/man-pages/man5/proc_pid_environ.5.html'` -> exit=0.
- HTTP status: `HTTP/1.1 200 OK`; no Location header (no redirects); final URL identical to the row's URL.
- `sha256sum proc_pid_environ.5.html` -> `93394d9edb801ad44e342e8e8ab057bea619d995803221edaf008226b2062c46  proc_pid_environ.5.html`; size 7747 bytes; `Last-Modified: Thu, 08 Oct 2026 17:39:35 GMT`; Content-Type text/html.
- Version: COLOPHON says the page is from the tarball `man-pages-6.19.tar.gz`; host man-pages is 6.19 per S073, so the fetched page is the host-version manual text.

3. Check 1 (locator exists and supports the teaches/gloss claim) — CONFIRMED. The § DESCRIPTION section (heading at line 8 of the extracted text, body lines 10-24) contains:
`This file contains the initial environment that was set when the currently executing program was started via execve(2).` (18 words, `printf '%s' "…" | wc -w` = 18, <=25).
Both gloss clauses are supported in the same section: "holds the environment set when the running program was started by execve(2)" (lines 10-12) and "not later in-process changes" (lines 16-19: `If, after an execve(2), the process modifies its environment (e.g., by calling functions such as putenv(3) or modifying the environ(7) variable directly), this file will not reflect those changes.`).

4. Check 2 (draft-entry quotes attributed to S071) — CONFIRMED, quotes_found=1/1. The draft /fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md mentions S071 exactly twice: line 1 (source header list, no quote) and M5 lines 86-87, the one quote:
`«set when the currently executing program was started via execve(2)»`
(10 words; normalization strips « », folds apostrophes per plan F1/CtlQuoteFabricated). The normalized fragment is found verbatim in the fetched bytes and sits inside the DESCRIPTION section (verified programmatically against the extracted page text; fragment inside DESCRIPTION body = True).

5. Check 3 (pinned sha256 vs fetch) — CONFIRMED, exact match: pinned `93394d9edb801ad44e342e8e8ab057bea619d995803221edaf008226b2062c46` equals my fetch's sha256. No live-page-mismatch note needed.

6. Check 4 (kind/tier) — CONFIRMED. kind=docs, tier=A. man7.org hosts the official Linux man-pages project (kernel.org man-pages; COLOPHON names the project and the 6.19 tarball), a primary, official source for `proc_pid_environ(5)`; tier A is correct under corpus/QUALITY.md Q2 / SOURCES-CONTRACT-v1 rule 3 (community is never A; this is not community).

7. Check 5 (rejected-row reason) — N/A: S071 is status `mined`, not rejected; the rejection clause does not apply.

8. No correction to the row text: the verified row matches the committed corpus/SOURCES.md line byte-for-byte. `recheck` 365d is appropriate for a stable manual page; `opened 2026-10-23` matches this fetch date.

9. Hygiene: no tool installs or updates (none needed); no pacman transaction; no lane writes besides this report; `pgrep -af 'a2-ReopenS071'` empty; scratch confined to /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS071 (16K). Lane clone not created (read-only re-open did not need one).
