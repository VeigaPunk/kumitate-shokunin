# K88ScribeSources — round 88 w1 report

Seat: scribe (sources). Lane HEAD read: `8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`. Date 2026-11-04.
Commits: none. Installs/updates: none.

## Behavior
Opened four primary/candidate sources this session with `curl -sSL -A 'Mozilla/5.0' -o <file> <url>`
(HTTP 200 each), saved byte-exact captures, drafted 11-column SOURCES rows and a `## Gate` block.

| draft id | source | verdict | tier | capture sha256 | quote line |
|---|---|---|---|---|---|
| S252 | CWE-22 https://cwe.mitre.org/data/definitions/22.html | admit, mined (grounds ESCAPES_LANE) | A | 654cd4b7…1ba017382 | cwe22.html:482 |
| S253 | gitrevisions https://git-scm.com/docs/gitrevisions | admit, mined (grounds revision binding, `<rev>:<path>`) | A | 1ab7124a…db1919070b | gitrev.html:2441 (+2438 heading) |
| S254 | OWASP community Path Traversal https://owasp.org/www-community/attacks/Path_Traversal | reject (web-root framed, no normative rule, adds nothing over S252; flip: OWASP cheat sheet with normative canonicalize-then-containment check for non-web path args) | B | ba073650…a5216a4 | owasp-pt.html:473 |
| S218 (existing) | CWE-59 https://cwe.mitre.org/data/definitions/59.html | re-opened; grounds SYMLINK_DIR; `used-by` change only | A | 4fae5c5e…a7a038 | cwe59.html:477 |

## Findings
- **Collision: CWE-59 is already S218.** Today's capture is byte-identical to S218's pinned capture
  (`.ufo/pins/source-captures.json` → `.ufo/waves/round-70/close/captures/cwe-59.html`, same sha256,
  197612 bytes). A new CWE-59 row would be a same-URL/different-scope `W04` with no new bytes. The
  draft therefore grounds SYMLINK_DIR on S218 with the contract-allowed in-place `used-by` change
  (old→new logged in the Gate draft). The seat spec's suggested "CWE-59 as a new admit" is not followed
  for that reason; the ≥2 admit rows are S252 and S253.
- New rows need pins in `.ufo/pins/source-captures.json` or `source-capture.mjs` goes DRIFT; draft
  entries are in sources-rows.md.
- RECEIPT_TOO_LARGE and AMBIGUOUS_FIELD have no external source from this seat.
- `mined` on S252/S253 is true only once `corpus/knowledge/receipt-subject-binding.md` cites them.

## Gates (exercised)
- `bash .../build/K88ScribeSources/quote-check.sh .../build/K88ScribeSources/captures` →
  run 1 exit 1 `QUOTE_CHECK: MISS` (my script expected the gitrevisions quote at line 2440; it is on
  2441 — wrong expectation in my own checker, quote itself found). Kept as
  `quote-check.receipt-run1-red.txt`; its `tool_sha256` names the pre-fix script, which no longer
  exists on disk. Fixed the expected line; run 2 exit 0 `QUOTE_CHECK: CLEAN`, all six `LINE_OK`
  (`quote-check.receipt.txt`, tool_sha256 `78bb11cd…67703276`).
- Column check: `awk -F'|'` over the three draft rows → 11 cells each.
- Not run by this seat: census `sources-census.sh validate`, `source-capture.mjs`, the probe. These
  belong to the integrator after the rows land.

## Touched surfaces
- `.ufo/waves/round-88/build/K88ScribeSources/sources-rows.md` (deliverable: rows, pin drafts, grep proof, Gate block)
- `.ufo/waves/round-88/build/K88ScribeSources/captures/{cwe59,cwe22,gitrev,owasp-pt}.html`
- `.ufo/waves/round-88/build/K88ScribeSources/quote-check.sh`, `quote-check.receipt.txt`, `quote-check.receipt-run1-red.txt`
- Scratch `/fast/scratch/hyaku/kumitate-r88/K88ScribeSources` removed.

## Out of scope
No edit to corpus/SOURCES.md, pins, the knowledge entry, the lesson, plan, probe, controls or scripts.
