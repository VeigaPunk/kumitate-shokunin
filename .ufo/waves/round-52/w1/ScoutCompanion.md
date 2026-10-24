# ScoutCompanion — S103 served

Axes: verbatim fidelity; reproducible provenance; honest scope; read-only containment; time-to-evidence.

## Observed facts — high confidence

- First candidate served: [MDN Web Docs, Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse). Python datetime and IANA were not attempted, per first-serving-source order.
- UTC fetch start/completion: `2026-10-24T04:03:47Z`; HTTP `200`; body `172329` bytes; `Content-Type: text/html`; served `Last-Modified: Sat, 24 Oct 2026 01:31:18 GMT`. This is an unversioned page, not a pinned ECMAScript specification.
- Body SHA-256: `9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140`.
- Saved bytes: `.ufo/waves/round-52/build/ScoutCompanion/mdn-date-parse.html`. `fetch.json` records request/effective URLs, UTC times, status, count and digest; `response-headers.txt` records response header values. Capture requested identity encoding and preserved exact UTF-8 response bytes.

## One located verbatim quote

> will be set to 2019-01-01 at 00:00:00 in the local timezone of the system

14 words; excerpt, not a full sentence. Locator: [§ Using Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#using_date.parse), saved HTML line 1765. Line 1766 supplies the offset-less date-and-time example `Date.parse("2019-01-01T00:00:00")`. `quote.json` records the exact excerpt, word count, line and byte locator. Lines 1760-1763 distinguish date-only parsing as UTC; line 1747 separately documents implementation-defined other formats. These are source observations, not runtime tests.

## Proposed full corpus/SOURCES.md row

| S103 | MDN Web Docs: Date.parse() — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse | docs | B | JavaScript Date.parse documentation on offset-less date-time input and non-standard-format portability; secondary guidance, not normative RFC 3339 grammar | § Using Date.parse() (#using_date.parse), saved HTML lines 1765-1766; § Description, line 1747; fetched 2026-10-24T04:03:47Z, HTTP 200, 172329 bytes, body sha256 9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140 | Date-and-time strings without a timezone use the system-local timezone, unlike date-only ISO input (UTC); other formats are implementation-defined and may vary across browsers. | mined | 2026-10-24 | 180d | corpus/knowledge/fail-closed-clock-validation.md |

The same row is saved at `.ufo/waves/round-52/build/ScoutCompanion/S103-row.md`. Tier B is appropriate to the assigned secondary-documentation scope: MDN describes JavaScript behavior, rather than serving as the normative RFC 3339/ECMAScript authority. The `mined` / `used-by` fields are proposed for the C2 admission, not a claim that this leaf changed the registry or entry.

## Inference and remaining unknowns

- [INFERENCE] A receipt prelude that accepts a timezone-less date-and-time string can acquire verifier-local timezone dependence; requiring an explicit canonical zone removes that documented ambiguity. S103 independently grounds this local-time interpretation; S102 remains the normative grammar source.
- This source does not prove the lane verifier's actual TZ-dependent verdicts, v2 correctness, or universal behavior of all malformed strings. Those require other wave evidence. Do not generalize the local-time claim to date-only input or present MDN's browser examples as an exhaustive compatibility table.
- No missing-source blocker: S103 is open and the quote is extractable from preserved bytes. No source-code/exported-contract investigation was needed, so LSP tracing was not applicable.

Only the owned auxiliary directory and this report were written. No registry/entry edits, builds, tests, gate runs, package installations or upgrades were performed.
