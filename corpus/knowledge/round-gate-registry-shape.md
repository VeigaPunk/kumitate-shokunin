source: S273 (GFM tables extension: an escaped `\|` is legitimate cell content, so a GFM-aware parser accepts a row that a plain `|` split calls malformed; opened round 95); S274 (POSIX awk field splitting: `NF` is the number of `|`-separated fields on a record, the census's row-shape test; opened round 95); S271, S033, S267–S269 (the round-94 rows the declared-pin rule rests on: an abbreviated object name resolves within one repository, and a commit id replaces the branch name as a URL path segment)
verified-at: a59fbedcc4b82dc2695fd3916c99abaccfe839bb (round-95 M2: the shipped `scripts/round-gate.mjs` bytes this entry describes, sha256 `aba737dc41ffbed4…` = `pin.round-gate` at round-95 close; re-pointed in round 96 per the round-95 spot-check §5 item 3 — the round-95 text named the freeze `ee8479be66acd906f1d2b5f24f1b75a3d9172c1b`, whose `plan.md`, `probe/probe95-c1.mjs`, 8 pre-data controls and `open/` receipts remain the claim's frozen inputs); lane gate contract `kumitate-round-gate-v1`, base bytes `11f83a1ac7b539e7…` (round-94 M2); the census row shape in fleet `CORPUS.md` `### Census` and its implementations (fleet `scripts/sources-census.sh:635`; lane `scripts/sources-check.mjs:230,262`); the lane registry `corpus/SOURCES.md` at the freeze (210 rows, 0 malformed — `open/real-malformed-before.txt`); filed-report population 78 at fleet pin `e2c52ba8…`
recheck: `node scripts/round-gate.mjs --json --round 93` → `citations.malformedRows` is `[]` while the registry has no malformed row; the census `awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' corpus/SOURCES.md` → `0`; re-run `.ufo/waves/round-95/probe/probe95-c1.mjs --tool <gate> --work <scratch> --freeze ee8479be…` → `C95_C1: HELD` when the parse changes; re-open S273/S274 when the pages change.

# Registry rows the gate may trust

## The class

The round-94 declared-pin rule reads a `corpus/SOURCES.md` registry row, takes the status from
`line.split('|')[8]` and, if that cell is not `rejected`, harvests 40-hex URL path segments from the whole
line. It never asks how many fields the row has (`scripts/round-gate.mjs:404-416` at base `11f83a1a…`). So a
row whose cells do not match the registry shape can declare a pin for a reason the lane never decided:

- an unescaped `|` inside an earlier cell adds a field and shifts every later cell right by one. A row whose
  true status is `rejected` now carries it at index 9, while index 8 holds the `teaches` text — the
  rejection is never seen and the pin declares (`K94Sentinel` receipt
  `.ufo/waves/round-94/K94Sentinel/receipts/candF.rejected_shifted.json`: `verdict: CLEAN`, `declared:
  ["79fa222e"]`, `unresolved: []`; the positive control's own bytes read the same,
  `…/ctlpos.rejected_shifted.json`). K94Sentinel routed it as S94-5
  (`.ufo/waves/round-94/K94Sentinel/K94Sentinel.md:60`).
- a short row — a cell missing before `status` — shifts the status left and puts the next cell (`opened`,
  say) at index 8, so the `rejected` test reads a date. A long row with an extra cell at the end still has
  its status at index 8 and declares, while the census refuses the row. Either way the declared set comes
  from a row the registry's own validators treat as malformed.

The status filter is the only thing that keeps a rejected source's pin from laundering a citation (round-94
entry, `knowledge/round-gate-declared-pins.md` § "Why a registry pin and not an allow-list file"). A parse
that can miss the status cell makes that filter advisory.

## The frozen rule (verbatim, `.ufo/waves/round-95/plan.md`)

```
A `corpus/SOURCES.md` registry row (`^ {0,3}\|\s*S\d{3,}\s*\|`) declares pins only when `line.split('|')`
yields exactly 13 fields (the census `NF==13`); a registry row with any other field count declares nothing,
and its id (field 1, trimmed) is appended, in file order, to `--json` `citations.malformedRows` — an array
always present on every `--json` output (empty when the registry was not read or holds no malformed row).
Everything else is unchanged.
```

## Why a field-count check, and not GFM-aware parsing

The registry is a GFM table, and GFM allows a pipe inside a cell when written `\|` (S273). A parser that
followed GFM would therefore accept the escaped-pipe row and find the status where the author meant it. The
lane does not do that, for three reasons that all point the same way:

1. **The lane's registry contract has no escape.** Both authorities split on a bare `|`: the census
   (`awk -F'|'`, fleet `CORPUS.md:136-138`, "11 columns means NF=13; must print 0") and the lane checker
   (`scripts/sources-check.mjs:230` `line.split('|')`, `:262` `ROW_MALFORMED … split-fields=N; expected
   13`). Under both, `\|` is a cell separator, not cell content; the round-95 fixture encodes exactly this
   (`probe/probe95-c1.mjs:128-129`, S003, an escaped pipe, expected in `malformedRows`). [INFERENCE] The
   registry contract therefore forbids `|` in a cell, escaped or not — as implemented, it has no vocabulary
   for "inside" a cell.
2. **Two authorities must agree on one file.** A GFM-aware gate would call S003 well-formed while
   `sources-census.sh validate` and `sources-check.mjs` refuse it (E01 / `ROW_MALFORMED`). The lane would
   then hold a row the gate trusts and the registry's own validators reject — the disagreement, not the
   pipe, is the defect. The census is the authority for row shape (CORPUS.md defines it; the round-94 rule
   already inherits census-checked rows as its evidence), so the gate adopts the census's test verbatim
   rather than a second, richer grammar.
3. **Field count is the census's own test, at one comparison.** `NF==13` is what the census prints and
   what `sources-check` enforces; the same index 8 is the status under that split. A GFM parser would have
   to re-derive cell indices and could disagree with the census's `$9` status histogram on any row where
   an escape appears. The narrow change — refuse every non-13 row, declare nothing from it — makes the
   gate and the census read the same rows the same way, and nothing else moves.

`NF==13` is 11 cells plus the two empty fields the leading and trailing `|` produce. A row missing its
trailing pipe is 12 fields and refuses; a row with one extra cell is 14 and refuses. Both are `E01` /
`ROW_MALFORMED` in the registry's own checkers, so the gate now fails on exactly the rows the lane already
treats as broken.

## What the gate does now

- A registry row is checked for shape before anything else on it is read. `fields.length !== 13` -> the row
  contributes no URL, no pin, and no `rejected` test; its id (`fields[1].trim()`) is pushed to
  `citations.malformedRows` in file order.
- `citations.malformedRows` is part of the `--json` citations object on every run — audit and close — and
  is `[]` when no malformed registry row was seen (including when the registry was never read).
- Everything else is unchanged: token extraction, lane -> main -> origin resolution, `citations.declared`,
  `citations.unresolved`, the `rejected` filter for well-formed rows, verdicts and exit codes. A malformed
  row is a disclosure, not a finding: by itself it adds no error or warning.

## What `malformedRows` discloses, and what it does not

It names the rows whose shape the census would reject, in file order, so the reader of a `--json` receipt
can see that the gate refused to read a row it could not place. It does **not** repair the row, does not
change the verdict, and does not say the pin on that row is wrong — only that the gate will not trust it.
The pair of facts ("this row is malformed" and "the token you cited did not resolve") is what a lane needs
to fix the registry; either alone is easy to misread.

## Fail-closed is the point

The rule can lose a declaration: a malformed row that carries a legitimate pin (a real upstream commit a
report cites) now declares nothing, and the report citing it re-reds until the row is repaired. That is the
intended direction. Before the rule, the same row could silently declare (the S94-5 evasion) or declare
from the wrong cell; after it, a shape error can only make the gate stricter, and the repair is the census
error the lane would have had to fix anyway. The alternative — trusting a row the census refuses — is how a
`rejected` source's pin survives its own rejection.

The registry at the round-95 freeze has 210 rows and 0 malformed (`open/real-malformed-before.txt`), so no
filed report changes: the fail-closed arm cannot fire on today's registry, and the rule's teeth are the
fixture (`probe95-c1.mjs` clause a: `malformedRows` exactly `[S002, S003, S004, S007]`, equal to the census
`NF!=13` id list of the same file) and the selftest arms.

## Limits

- **Fenced code blocks are still read.** Neither the gate's `^ {0,3}\|\s*S\d{3,}\s*\|` matcher nor the
  census grep/awk tracks fences; a registry-shaped line inside a code fence is a row to both. They agree,
  which is the property this rule needs, but a fenced example row can declare a pin or count as malformed.
  Inherited, not introduced.
- **The disclosure is lazy.** The registry is read only when a cited token reaches the declared step, so a
  report whose tokens all resolve in a probeable repo never reads `corpus/SOURCES.md` and reports
  `malformedRows: []` even if the file is malformed. The array describes the run, not the file.
- **Text mode.** The frozen rule binds `--json` only. The integrated bytes add one non-finding line,
  `ROUND_GATE  info  SOURCES_ROWS_MALFORMED  malformed=<n> [<ids>]`, printed only when the run met a
  malformed row; the round-94 `COMMIT_CITED_DECLARED` line keeps its exact format (K95Reviewer non-blocker 2).
- **Shape is not honesty.** A well-formed fabricated row still declares: this rule closes the shape hole
  only. The self-attestation limit in `knowledge/round-gate-declared-pins.md` is untouched — only a closure
  re-opening the URL guards a row's truth (K94CriticB 1b).
- **Registry rows only.** A malformed non-registry table line (no `S\d{3,}` id cell) is invisible to both
  the gate and the census; neither claims to validate the whole file.
- **A malformed row is not a finding.** Verdict and exit are unchanged by a malformed row alone; the lane
  learns about it only from `--json`.

## Receipts

- `.ufo/waves/round-95/close-l1/integration-remut.txt` — the shipped selftest kills all six frozen forgery
  shapes and all nine K95CriticA constructions (15/15); the frozen counter alone admits the nine (caveat).

- `.ufo/waves/round-95/plan.md` — the frozen rule and the counter's clause (a).
- `.ufo/waves/round-95/probe/probe95-c1.mjs` — fixture rows S001–S008 (well-formed, unescaped-pipe rejected,
  escaped-pipe, short, well-formed rejected, indented, extra cell, `?plain=1`) and the census-equality check.
- `.ufo/waves/round-95/controls/ctl-positive.txt` — the L1 reference rule: `declared=[okA indentF plainH]`,
  `unresolved=[shiftB escC shortD rejE longG proseI codeJ none]`,
  `malformedRows=["S002","S003","S004","S007"]`, `census=[S002 S003 S004 S007]`, `C95_C1: HELD`.
- `.ufo/waves/round-95/open/real-malformed-before.txt` — real registry `malformed=0`.
- `.ufo/waves/round-94/K94Sentinel/receipts/candF.rejected_shifted.json`,
  `…/ctlpos.rejected_shifted.json` — the S94-5 evasion on the round-94 bytes and control.
- `.ufo/waves/round-94/K94Sentinel/K94Sentinel.md:60` — S94-5, the routed defect this rule answers.
