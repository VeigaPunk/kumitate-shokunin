# K96ScribeSources — round-96 SOURCES row (C1 source seat)

Seat scope: draft ONE `corpus/SOURCES.md` row for the CommonMark 0.31.2 spec that the round-96
C1 rule (`declaredPins()` section state) is measured against. Read-only on the lane; all writes are
in `.ufo/waves/round-96/K96ScribeSources/` plus `/fast/scratch/hyaku/kumitate-r96/K96ScribeSources`
(removed before yield).

## Deliverables (all under `.ufo/waves/round-96/K96ScribeSources/`)

| file | what it is |
|---|---|
| `row.md` | the draft row (**S275**, one line, 13 awk fields) + field notes + optional search-log line |
| `quotes.md` | URL, access date, HTTP status, headers, body sha256, every quote with section anchor + byte offset + `wc -w` |
| `census.txt` | the `sources-census.sh validate` receipt (exit 0, `file ok`) and the `awk` NF check |
| `provenance.txt` | free-id greps, lane HEAD, freeze-vs-worktree byte identity of `corpus/SOURCES.md` |
| `wc-quotes.txt` | raw `printf '%s' "<q>" \| wc -w` transcripts (19 / 22 / 14 / 15 / 27 / 8 / 7) |
| `verify-quotes.txt` | byte-exactness check: each quote found **exactly once** in the rendered document, `ALL_FIVE_QUOTES_UNIQUE_AND_EXACT` |
| `captures/spec-0.31.2.html` | the fetched page (514698 bytes, sha256 `c85f56cc…60f0d`) |
| `captures/spec-atx.txt`, `captures/spec-fenced.txt`, `captures/headers.txt` | §4.2 and §4.5 renderings, response headers |
| `census-validate-with-row.out`, `census-validate-baseline.out`, `census-validate-superseded-corpusonly-copy.out` | raw validate outputs (with row / row removed / first copy) |

## What the row says

- **S275**, `spec` / tier `A`, url `https://spec.commonmark.org/0.31.2/`, status `mined`,
  opened `2026-11-07`, recheck `on-release`, used-by `corpus/knowledge/round-gate-registry-section.md`.
- Row quote (§4.2, body byte 62770): *"The opening sequence of # characters must be followed by
  spaces or tabs, or by the end of line."* — **19 words** (`printf … | wc -w` → 19).
- Teaches: the census/gate **agree** on two clauses (space or tab required after `##`; up to three
  leading spaces) and **deliberately differ** on three (the closing `#` sequence stays in the
  census's heading text, a `## ` line inside a fence is a heading to the census, a trailing `\r` is
  not stripped) — so the gate follows the census, not CommonMark.

## Commands that matter

```
$ curl -sS -D headers.txt -o spec.html -w 'HTTP=%{http_code} size=%{size_download}\n' \
      https://spec.commonmark.org/0.31.2/
HTTP=200 size=514698        # sha256 c85f56cc2101f761cc94215c677cd2c7c1ecca9c47be016479fdfe718af60f0d

$ printf '%s' "The opening sequence of # characters must be followed by spaces or tabs, or by the end of line." | wc -w
19

$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
      --file <scratch>/corpus/SOURCES.md --today 2026-11-07
file  W04  … (8 pre-existing duplicate-url warnings) …
file  ok   <scratch>/corpus/SOURCES.md
EXIT=0

$ awk -F'|' '/^ {0,3}\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13' <copy>
(no output; 0 bytes)        # and S275_NF=13
```

Baseline control: the same copy with the S275 line removed validates **identically** (exit 0, same
8 W04 lines, `S275` appears 0 times in the output) — the row adds no E- or W-finding.

## Gates

- `row.md`'s row line is the exact line validated (diffed against `row-line.txt`): `row_line_unchanged_and_validated`.
- 13 awk fields, no `|` inside any cell (NF check empty over all 212 S-rows).
- validate exit **0**; no E01/E12 line for the whole copy; the used-by path was created empty in the
  copy so E11 is satisfied there (the real file is the integrator's to write).
- `corpus/SOURCES.md` is byte-identical at freeze `617e80cd…` and in the worktree (`git diff --quiet`
  rc=0), so the draft applies to the frozen bytes; S275 is free and no `commonmark` /
  `spec.commonmark.org` row exists.

## Disclosed limits

- First validate run copied only `corpus/` into scratch and produced **22** E11 findings for
  used-by paths outside `corpus/` (`scripts/*.mjs`, `SKILL.md`, `.ufo/waves/round-*`); it exited 1
  and is superseded. The receipt copy is kept as
  `census-validate-superseded-corpusonly-copy.out`; after copying those referenced paths from the
  lane the identical command exits 0. This is a copy-fidelity artifact, not a registry defect —
  the lane's own registry was never modified.
- The eight W04 lines are pre-existing (S034, S068, S084, S095, S123, S126, S247, S271) and appear
  with or without the row.
- `## Registry ##`, `## Registry\r` and fence handling are read from the **census**, not from
  CommonMark; the row says so explicitly and does not claim the spec endorses the gate's behaviour.
- The example lead-ins "Up to three spaces of indentation are allowed:" (2×) and "Four spaces of
  indentation is too many:" (7×) are not unique strings in the page; they are cited by §4.2 line
  (44 / 48) and never as quotes.
- No search-log edit was made in `corpus/SOURCES.md` (assignment is one row); `row.md` carries an
  optional entry for the integrator.

## Out of scope / not touched

No lane file written, no `corpus/`, `scripts/`, `probe/`, `controls/`, `open/`, `plan.md` change; no
git/jj mutation anywhere; no `sudo`; no tool installs. Scratch removed.
