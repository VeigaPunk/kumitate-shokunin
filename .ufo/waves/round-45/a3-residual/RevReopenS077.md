RESULT RevReopenS077 rev=d5f67ee2 verdict=holds verbatim=yes pin=reproduce overstated=no
Re-open of SOURCES row S077 (sources.md:90, rev d5f67ee2) and erratum X7's use of it. All commands ran under `systemd-run --user --scope -p MemoryMax=2G -p TasksMax=64 timeout -s KILL 600`. No tools installed or updated (curl/grep/sha256sum/git preexisting). Scratch: /fast/scratch/hyaku/kumitate-r45/seats/a3r-RevReopenS077/.

PIN
$ curl -sS -o process.html -w '%{http_code} %{size_download}' https://nodejs.org/docs/v24.21.0/api/process.html
→ HTTP 200, 359605 bytes (2026-10-23)
$ sha256sum process.html
→ 1224adf135fbd77cddbada63b43a8fbcd6f56e22d8c2ac02c46a2d9b9180a4b5  process.html
→ equals row pin "body sha256 1224adf135fbd77cddbada63b43a8fbcd6f56e22d8c2ac02c46a2d9b9180a4b5" (SOURCES.md:90). Reproduce.

VERSION MARKER
$ grep -n -o 'Node\.js v24\.21\.0' process.html | head -3 → 7, 116, 131 (5 occurrences of v24.21.0 total)
→ page header marker 'Node.js v24.21.0' present, as the row records.

VERBATIM, CHANNEL 1 (fetched HTML)
process.html:2869-2870:
  <li><code>arrayBuffers</code> refers to memory allocated for <code>ArrayBuffer</code>s and
  <code>SharedArrayBuffer</code>s, including all Node.js <a href="buffer.html"><code>Buffer</code></a>s.
Rendering tags away (`<code>ArrayBuffer</code>s`→ArrayBuffers, `<a><code>Buffer</code></a>s`→Buffers) and joining the
line break: "arrayBuffers refers to memory allocated for ArrayBuffers and SharedArrayBuffers, including all Node.js Buffers." — 13 words, exactly the gate-line quote (lessons/round-45.md:145). Verbatim under whitespace-only normalisation.

LOCATOR §
process.html:2813: `</section><section><h3><code>process.memoryUsage()</code> … id="processmemoryusage"` — section opens 2813,
closes 2886 immediately before `process.memoryUsage.rss()`; the quote at 2869-2870 sits inside it. Matches row
(section id `processmemoryusage`, HTML 2813-2886) and gate locator HTML 2869-2870.

VERBATIM, CHANNEL 2 (node source tag v24.21.0)
$ curl -sS -o process_md.txt … https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/process.md → HTTP 200, 134327 bytes
process_md.txt:2839-2841 (under `## process.memoryUsage()`, md:2780):
  * `arrayBuffers` refers to memory allocated for `ArrayBuffer`s and
    `SharedArrayBuffer`s, including all Node.js [`Buffer`][]s.
    This is also included in the `external` value. …
→ same sentence in both channels; second-channel check passes.

X7 OVERSTATEMENT CHECK
$ git show d5f67ee2:corpus/knowledge/agent-isolation-substrates.md (errata block, X7 at :263-267)
X7 quotes S077 as: heapTotal/heapUsed «refer to V8's memory usage» and arrayBuffers «refers to memory allocated for
ArrayBuffers and SharedArrayBuffers, including all Node.js Buffers» "and is included in external" — both quoted
fragments are exact source text (HTML 2863, 2869-2871; "This is also included in the external value."). X7 then names
the demo measurement (arrayBuffers 537,008,379 vs heapUsed 3,921,064) as the proof and does not claim the withdrawn
sentence "a Buffer's backing store is an ArrayBuffer outside that section" appears in S077 — it says only that
sentence "is not in S073" and re-grounds the substance on S077 plus the demo. No claim beyond what the text says.
Note: M6 body (:134-136) still carries the withdrawn sentence with the S073 cite; corrected by appended X7 per the
declared errata-only mutation rule ("judged object unchanged since 6b2a4517; all corrections appended", lessons/round-45.md:222). Consistent.

RESIDUAL RISK
Body sha256 is a live-site pin: nodejs.org serves only the latest docs under /docs/v24.21.0/ until superseded; any
future doc rebuild without a version bump can break the pin. Fetched 2026-10-23; pin reproduced same day.

No actionable defect: quote verbatim in both channels at the cited locator, pin reproduces, X7 does not overstate S077.
