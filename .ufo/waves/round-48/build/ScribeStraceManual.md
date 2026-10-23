RESULT ScribeStraceManual verdict=complete

## Draft frontier row

| S098 | strace(1) 7.2 — https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in | docs | A | strace 7.2 syscall return alignment and interleaved unfinished/resumed records, for round-48 counter parsing | doc/strace.1.in:832-835 (-a/--columns); :148-158 (interleaving and unfinished/resumed records); tag v7.2; fetched 2026-10-23; HTTP 200; Date Fri, 23 Oct 2026 11:52:26 GMT; body sha256 c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a | Return alignment defaults to column 40, so the parser accepts variable whitespace in `\)\s+= `; interleaved calls are marked unfinished then resumed, so malformed, unmatched, or still-pending traced records fail closed. | queued | 2026-10-23 | on-release | .ufo/waves/round-48/probe/caproute48-probe.mjs, corpus/lessons/round-48.md |

No S099: the SOURCES contract defines one row as a claim and does not require a separate row for each locator; these are related anchors in one versioned manual and support one counter-parsing claim. `queued` is conservative for this draft: the row is not in SOURCES.md and `corpus/lessons/round-48.md` does not yet exist, so the requested used-by paths are proposed targets, not a claim that both already cite S098.

## Findings and source evidence

Fetched the tagged manual bytes with:

```sh
curl --silent --show-error --location --dump-header /tmp/kumitate-r48-strace72.headers --output /tmp/kumitate-r48-strace72.in --write-out 'HTTP_STATUS=%{http_code}\n' 'https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in' && sha256sum /tmp/kumitate-r48-strace72.in
```

Observed output: `HTTP_STATUS=200`; `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a  /tmp/kumitate-r48-strace72.in`. Response headers report `HTTP/2 200` and `date: Fri, 23 Oct 2026 11:52:26 GMT` (`/tmp/kumitate-r48-strace72.headers:1,13`).

Verbatim excerpts from the fetched file (each quote is at most 25 words):

- “Aligns return values in a specific column (default column 40).” — line 835. The option heading is `-a` / `--columns` at lines 832-835.
- “If a system call is being executed while another is called from a different” — line 148.
- “will attempt to preserve the order of these events and mark the ongoing call as” — line 151; “.IR unfinished .” — line 152.
- “When the call returns, it will be marked as” — line 153; “.IR resumed .” — line 154.
- “[pid 28772] <... select resumed> )      = 1 (in [3])” — line 158; the sample begins unfinished at line 156 and has another PID's syscall at line 157.

The manual grounds why a strict `) = ` matcher loses resumed calls: it aligns return values to a column, while its interleaving example resumes the call with whitespace between `)` and `=`. The round-48 counter uses `/\)\s+= .../` and requires the return at the end of the record (`.ufo/waves/round-48/probe/caproute48-probe.mjs:171-175`). It records unfinished calls and matches resumed records by PID and syscall; an unmatched resume is an evaluation error, and pending calls at end-of-log also fail closed (`:153-167,193-196`). The manual explains the record form; the fail-closed policy is the counter's behavior.

## Behavior and gates

- Draft teaches the selected counter behavior: tolerate strace's column padding and interleaved resumed records, but do not score incomplete/unpaired traced records.
- No build, test, selftest, counter, or strace run was performed. This assignment was source inspection and report drafting only.

## Touched surfaces and limits

- Written artifact: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/ScribeStraceManual.md` only. The fetched source and response headers are temporary files under `/tmp`.
- No file under `corpus/` was written. The requested lesson path was checked and is absent at report time; no citation there is claimed as observed.
- Out of scope: adding the row to `corpus/SOURCES.md`, editing product/probe code, and running the frozen counter or other gates.

## Artifact

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/ScribeStraceManual.md`
