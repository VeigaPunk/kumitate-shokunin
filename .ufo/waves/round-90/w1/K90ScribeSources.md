# K90ScribeSources — round-90 source rows

Scope: curate round-90 SOURCES Registry rows for the invisible-prefix-field claim (K89-V1) and its path-containment neighbour. Lane file `corpus/SOURCES.md` was NOT edited; rows are staged for the L1.

## Deliverables (all in `.ufo/waves/round-90/K90ScribeSources/`)
- `rows.md` — 3 new Registry rows, ids S260–S262 (next free id was S259).
- `gate.md` — per-row URL, access date, sha256, verbatim quote, location, word count; rejected list (none); gaps.
- Captures: `unicode-tr44.html`, `unicode-proplist.txt`, `man7-realpath3.html`.

## Sources opened (access 2026-11-05, 10:00Z)
| id | URL | sha256 | quote words |
|---|---|---|---|
| S260 | https://www.unicode.org/reports/tr44/ | d951c7cf4f697c238e7a96ab891cf27fdf0b1d94454aa0071a9d5b0d3a0e1ab4 | 21 |
| S261 | https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt | f438f532e8737bb8a2702126cdf9c4af5e357c58c7acf9d9eb2fc7c1a1d955d6 | 7 |
| S262 | https://man7.org/linux/man-pages/man3/realpath.3.html | dd2bfafe9ca9e6fffa92b24a78451175ab48f0e6a741476fe351a2dcc11dd702 | 15 |

Commands: `curl -sSL -o <capture> <url>` for each (HTTP 200); `sha256sum` on the three captures; `grep -c -F` of each quote against the tag-stripped capture (each = 1); `awk` for the staged-table check.

## Validation (scratch only)
- Copied `corpus/SOURCES.md` to scratch, inserted the three rows after the S259 row, ran the malformed-row awk: `malformed: 0`.
- Duplicate ids in scratch: 0. Rows S260–S262 each have NF=13 (11 columns with edge pipes).
- Scratch copy removed afterwards.

## Findings
- S260 grounds U+200B as Format (Cf): the reclassification from Zs was made "to clearly distinguish it from space characters", so a rule keyed on space characters misses it.
- S261 grounds U+00A0 as White_Space: a strip keyed on the White_Space property removes a leading NO-BREAK SPACE.
- S262 grounds realpath resolution (links and `/./`, `/../` removed) for containment on resolved paths. It is `queued` with no used-by path.

## Gaps and limits
- U+FEFF Cf membership is NOT quoted by any opened source. The L1 must open UnicodeData.txt (or equivalent) before citing it.
- U+200C/U+200D/U+200E Cf appear only as PropList lines 29 and 37 (not row quotes).
- S262 is not an invisible-character source; it supports the containment side only.

## Tooling
No tools installed or upgraded. Used `curl`, `sha256sum`, `grep`, `awk`, `wc` already on the host.

## Out of scope
No lane edits, no git commands, no probe or instrument runs, no subagent dispatch.
