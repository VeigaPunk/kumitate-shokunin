# CritSourcesRows — S100/S101 saved-byte attack

## Axes and attacked surface

- **Coverage / sourced doctrine (C2, D51):** whether S100/S101 actually ground the admitted entry.
- **Operability:** the specifically requested `sources-check --strict` result.
- **Calibration / provenance:** quote fidelity, bounded tier-A authority, and honest source-to-implementation attribution.

Attacked the integrated rows at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md:113-114`, their named consumer `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md`, and the quote/admission claims at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-51.md:55-77`. Wave-1 targets were `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutClockSource.md`, `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutRandomSource.md`, and `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScribeSources.md`.

The assignment's `build/...` names resolve under the round directory, as the scout reports explicitly record. The actual saved bodies are:

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html`
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html`

The lane-root alternatives were absent; the required saved bodies themselves were present. No dependency prevented this review.

## Findings and smallest safe corrections

### F1 — HIGH: the requested strict check is DRIFT, not CLEAN

**Counterexample:** valid-looking `mined` / `used-by` cells do not make the integrated consumer admissible to the existing source checker. Its first line is a title; `source:` starts on line 3 and wraps through line 8, while `verified-at:` and `recheck:` occur on lines 9 and 10.

**Executed command:**

```text
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs --self /home/vgpnk/Projects/shokunin/kumitate-shokunin --strict
```

**Observed output / exit:**

```text
SOURCES  error  ENTRY_HEADER_REQUIRED  corpus/knowledge/invocation-attestation.md:1  non-legacy knowledge file lacks source: header
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)
exit=1
```

**Mechanism:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs:359-366` requires `source:` on the first physical line; lines 369-390 inspect the first five lines and extract source IDs only from line 1. Merely moving the title would still leave a wrapped source declaration that loses S101 from that first-line ID extraction and leaves the other provenance fields too low.

**Smallest safe correction:** put the complete `source:` declaration containing both S100/S101 and both URLs on physical line 1; put `verified-at:` and `recheck:` on lines 2 and 3; put title and long anchor descriptions afterward. Preserve the existing checker and both counters. Do not hide the failure with a legacy exemption or dummy `used-by` path.

**Impacted axes / predicates:** operability of the requested strict gate; C2 coverage/provenance. The frozen D1 first-five-line requirement and D4 clean-check requirement would also be affected **[INFERENCE from their code, not an executed D51 verdict]**. No A51 result is asserted.

### F2 — MEDIUM: S101's teaches cell drops an operative qualification

**Counterexample:** the row says `getrandom() draws entropy from the urandom source` without qualification. Its own saved source says **“By default”** at lines 85-86, says this can change through `flags` at line 87, and documents the opposing case at lines 103-106:

```text
GRND_RANDOM
If this bit is set, then random bytes are drawn from the random source
(i.e., the same source as the /dev/random device) instead of the urandom source.
```

Thus the documented call shape `getrandom(buf, 16, GRND_RANDOM)` is a counterexample to reading the cell as an unconditional API property. No syscall was executed; this is a direct documentary counterexample from the nominated saved bytes.

**Evidence command:**

```text
read /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html:81-112
```

The above output is the tag-stripped content of displayed lines 103-106; lines 85-87 display the default/flags qualification. The Python evidence below independently printed both `S101_default_qualification=True` and the counterexample text.

**Smallest safe correction:** qualify the learner benefit as **“By default, getrandom() draws entropy from the urandom source…”**. Under the append-only source-row contract, a correction to immutable `teaches` is a new superseding row, not an in-place rewrite of S101; migrate the relevant consumer citation to that corrected row and log any allowed status/used-by changes. The frozen D51 S101 requirement is not permission to rewrite the counter or claim the original wording is exact. A newly added qualification in the consumer can bound its use of the retained historical row without modifying frozen bytes.

**Impacted axes:** technical precision / calibration of the sourced C2 claim. This is paraphrase-scope drift, **not** drift in the lesson's quoted words and not evidence that the manual itself deserves a lower tier.

### F3 — MEDIUM: tier-A kernel documentation is reused as unsupported Node-backend provenance

**Counterexample:** the named consumer at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md:35-36` actually says:

```text
- The nonce is 128 bits from `crypto.randomBytes(16)`; Node's bytes come from the kernel
  random interface `getrandom()` draws "from the urandom source" (S101, 17-word quote).
```

S101 describes the Linux syscall, not Node's implementation or backend selection. The body contains no `crypto.randomBytes` or `process.hrtime`; the apparent `Node` match in each HTML file is only the Google Analytics JavaScript identifier `parentNode`, not Node.js documentation. S100 similarly does not establish which kernel clock a particular Node build uses.

**Evidence commands / output:**

```text
grep pattern="Node|randomBytes|crypto\\.randomBytes|hrtime|process\\.hrtime" paths=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html;/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html
```

Only the following matches were returned (line 591 in clock HTML; line 331 in random HTML):

```text
var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
```

```text
read /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md:29-39
read /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-51.md:55-90
```

The latter displays the conflicting lesson assertion at lines 73-75: S101 does not say Node's `crypto.randomBytes` calls `getrandom()` and **“the entry phrases both bounds exactly.”** The entry's actual text above does not keep that boundary.

**Smallest safe correction:** separate the script's chosen API (`crypto.randomBytes(16)`) from S101's bounded kernel-manual statement; explicitly say S101 does not establish Node's backend. If backend identity is required by the claim, retain that identity claim only with version-pinned authoritative Node/OpenSSL implementation evidence. Correct the lesson's claim about the entry's wording as well. Do not globally downgrade an authoritative Linux manual merely because the consumer overextends it.

**Impacted axes:** C2 source quality / calibration. This is **citation-scope inflation in use**, not proof that the runtime statement is false and not intrinsic tier inflation in either Linux-manual row.

## Every-cell audit

| Cell | S100 | S101 |
|---|---|---|
| id | Exactly one S100 at line 113; 13 split fields. | Exactly one S101 at line 114; 13 split fields. |
| source | URL matches the nominated saved page; title is `clock_getres(2)` and NAME includes `clock_gettime`, so the combined row designation is accurate. | Saved title is `getrandom(2)`; URL matches the scout record. |
| kind | `docs`: the page identifies itself as Linux kernel/C-library interface documentation. | Same, at saved lines 227-232. |
| tier | A is defensible for documented Linux CLOCK_MONOTONIC semantics; not authority for Node backend identity. | A is defensible for Linux getrandom semantics and cryptographic use; not authority for Node internals or ledger guarantees. See F3. |
| scope | Invocation-span use is an engineering application of the documented clock property; the clock semantics are grounded. | Kernel random-byte generation is grounded; receipt-ledger application is the lane's design, not a ledger algorithm taught by the page. |
| anchor | Saved lines 177-184 cover the stated properties; SHA, version 6.19, page date 2026-03-07, and tarball-origin date 2026-09-09 all match. | Saved lines 81-86 cover random bytes, cryptographic use, and default urandom source; SHA, version 6.19, page date 2026-02-08, and tarball-origin date 2026-09-09 match. |
| teaches | Accurate paraphrase: discontinuous jumps do not affect the clock; frequency adjustments do; calls never go backward. Non-negative same-invocation differences follow. No NTP-immunity inflation found. | Cryptographic-use sentence is supported at lines 82-83; source identity needs the default qualifier (F2). |
| status | `mined`: its named existing consumer physically cites S100. Consumer header is not checker-recognized (F1). | `mined`: its named existing consumer physically cites S101. Same header defect. |
| opened | `2026-10-23` matches the recorded UTC fetch instant converted to the documented local -03 zone; not a date-drift finding. | Same. |
| recheck | `180d` is valid policy cadence, not a fact claimed to come from the manual. | Same. |
| used-by | Named path exists and cites S100; semantic use exists, but the header breaks machine recognition. | Named path exists and cites S101; semantic use exists, but Node attribution overreaches its authority. |

**Transport-metadata evidence ceiling:** S100's saved `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutClockSource/headers.txt:1-9` directly shows HTTP 200 and Content-Length 30379; its `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutClockSource/fetch-utc.txt:1` records the fetch instant. S101's exact HTTP status and fetch instant are supported by its wave-1 scout report, not independently recoverable from HTML body bytes. I did not fresh-fetch either live URL or independently validate tarball membership; the version/origin checks compare the saved rendering's own COLOPHON and footline, not a downloaded tarball.

## Positive attacks held: hashes, location, and verbatim quotes

**Executed command:**

```text
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-51.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs
```

**Observed output (exit 0):**

```text
7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html
366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html
669a9ee5022d354f9724dde9395cb6c52e48693058746fd1926a154edee1f018  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
0cfe8ef67fd4f36527f92fad7a4066ebd6abf06cb395da7f79fbcecd82a010ab  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md
afac8d387adb9ec6387f0300a545c3dc603d2fb75b9a7a7c0b97c6152730464c  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-51.md
5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs
```

**Executed structural read:**

```text
grep pattern="S100|S101|^## " path=/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
```

**Observed heading/row sequence:** `10:## Registry`, `113:| S100 | ...`, `114:| S101 | ...`, `117:## Paths`. Both rows are inside Registry.

**Executed analysis command:** `functions.eval(language="py", title="Checking source rows and quotes", ...)` parsed both saved HTML bodies with Python's `HTMLParser(convert_charrefs=True)`, concatenated text nodes without inserting characters, collapsed whitespace, and tested the lesson's exact quote against both its located fragment and the complete parsed body. It also parsed the live registry, checked hashes against each anchor cell, and checked the named consumer path. No temporary or runnable lane file was created.

**Observed output (selected factual lines, verbatim):**

```text
S100 row_line=113 section='Registry' fields=13 occurrences=1
S100 bytes=30379 sha256=7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69 anchor_hash_matches=True
S100 quote_words=22 located_plain_substring=True full_plain_occurrences=1 lesson_quote_matches=True
S100 kind=docs tier=A status=mined opened=2026-10-23 recheck=180d
S100 used_by_exists=True cited_anywhere=True cited_first_line=False
S101 row_line=114 section='Registry' fields=13 occurrences=1
S101 bytes=16466 sha256=366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d anchor_hash_matches=True
S101 quote_words=17 located_plain_substring=True full_plain_occurrences=1 lesson_quote_matches=True
S101 kind=docs tier=A status=mined opened=2026-10-23 recheck=180d
S101 used_by_exists=True cited_anywhere=True cited_first_line=False
entry_first_line='# Invocation attestation — why receipts are built the way they are'
provenance_line_numbers=[(3, 'source: S100 https://man7.org/linux/man-pages/man2/clock_gettime.2.html (DESCRIPTION,'), (9, 'verified-at: 2026-10-23'), (10, 'recheck: 180d')]
S101_default_qualification=True
S101_flag_counterexample=GRND_RANDOM If this bit is set, then random bytes are drawn from the random source (i.e., the same source as the /dev/random device) instead of the urandom source. The random source
S101_crypto.randomBytes_literal_count=0
```

The actual quote strings tested were:

- S100, saved HTML 177-179: `The CLOCK_MONOTONIC clock is not affected by discontinuous jumps in the system time (e.g., if the system administrator manually changes the clock)`
- S101, saved HTML 85-86: `By default, getrandom() draws entropy from the urandom source (i.e., the same source as the /dev/urandom device).`

Both are verbatim substrings of the rendered textual content with HTML tags removed and whitespace normalized; they are not falsely described as contiguous raw HTML byte strings. Both match the integrated lesson exactly. **No quote drift or hash drift found.** S100's quote ends before the qualification in the continued sentence, but the teaches cell correctly retains the frequency-adjustment qualification.

**Executed date/scope analysis command:** `functions.eval(language="py", title="Checking dates and attribution scope", ...)`, using `datetime.fromisoformat` and timezone -03 on the recorded instants and the same parsed HTML text.

**Observed output:**

```text
S100 fetch_utc=2026-10-24T01:59:31Z local_minus03_date=2026-10-23 opened=2026-10-23 local_date_matches=True
S101 fetch_utc=2026-10-24T01:59:28Z local_minus03_date=2026-10-23 opened=2026-10-23 local_date_matches=True
S100 has_crypto.randomBytes=False has_process.hrtime=False has_CSPRNG=False
S101 has_crypto.randomBytes=False has_process.hrtime=False has_CSPRNG=False
S101 row_teaches_has_default=False
```

## Snapshot, boundaries, and disposition

Executed `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD`; observed `3304a56db425ea9c7cd496b426876aaedbce3949` (exit 0). This names the observed live tip, not a claim that every worktree byte was archived at that revision; the reviewed file hashes above bind this report's actual evidence.

All findings are fixable header/content/provenance defects, not a demonstrated design tradeoff. No admission, canonical judgment, integration, code edit, counter edit, git/jj mutation, peer message, subagent spawn, or alternate agent runtime was performed. Only this report was written. No tools installed or updated; no pacman transaction attempted. The strict check above was run once because the assignment explicitly requested it. D51, A51, proxy, census, and the other harm batteries were not run by this seat, and no passing result is implied for them. Receipt 3 scheduling was not treated as a finding.

Report: .ufo/waves/round-51/w2/CritSourcesRows.md
