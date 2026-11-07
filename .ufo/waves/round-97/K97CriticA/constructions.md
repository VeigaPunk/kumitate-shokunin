# K97CriticA — counter constructions (round 97, claim C1, operability)

Attack target: the FROZEN counter `.ufo/waves/round-97/probe/probe97-c1.mjs` (`C97_C1: HELD|UNMET a=…f=…`),
not the candidate. Question: **can a tool that violates frozen rule R97 reach HELD?**

Run form used for every row (freeze = release = lane M = `38eb197c17de7ce0dc562539f2f31f41bea037ec`):

    node .ufo/waves/round-97/probe/probe97-c1.mjs --tool <con> --work <scratch>/probe/<name> \
      --freeze 38eb197c17de7ce0dc562539f2f31f41bea037ec --rev 38eb197c17de7ce0dc562539f2f31f41bea037ec

Bases: every construction is a patched copy of `ctl-positive` (the L1 reference rule R97), produced by
`build-constructions.py` from the frozen generator's own output (`make-controls97.py` → `ctl-positive.mjs`,
sha256 `bc278082…`, i.e. the shape that HELDs). Siblings `cap-spawn.mjs` / `cap-run.mjs` sit beside them.
Each construction therefore differs from R97 in exactly the clause named in the table and shares every
other line with the reference, so its verdict isolates that clause.

Calibration re-run by this seat at M (receipts in this dir):

| tool | verdict | receipt |
|---|---|---|
| lane `scripts/sources-check.mjs` (do-nothing) | `UNMET a=0 b=0 c=0 d=1 e=1 f=1` | `run-nothing.txt` |
| `ctl-positive` (R97 reference) | `HELD a=1 b=1 c=1 d=1 e=1 f=1` | `run-positive.txt` |

Do-nothing is UNMET for the right reason: arms a/b/c print real per-case disagreements (e.g.
`agree=18721/19459`, `14239/19459`, `16427/19459`), not a SETUP line; d/e/f pass.

`diverge.txt` (built by `diverge.sh`) gives, for every construction, the minimal input on which it departs
from the **census** `row_pass` grammar — census E12 count / `rows` beside the construction's `--json`
`ROW_OUTSIDE_REGISTRY` count and `rows`. That file is the ground truth for "violates R97 **and** departs
from the reader C1 claims to match".

## Table

| # | construction | R97 clause violated | minimal input where it departs from the census | counter verdict |
|---|---|---|---|---|
| 1 | `x-bom-strip` | state from `sourceText.split('\n')` as-is; a leading U+FEFF is part of line 1, so `^ {0,3}##[ \t]` cannot match a BOM-prefixed heading | `\uFEFF## Registry` + row → census E12=1 rows=0; tool outside=0 rows=1 | **HELD** a=1 b=1 c=1 d=1 e=1 f=1 |
| 2 | `x-zwnbsp-trim` | heading text trimmed of spaces and tabs ONLY (U+FEFF kept) | `## Registry\uFEFF` → census E12=1 rows=0; tool outside=0 rows=1 | **HELD** |
| 3 | `x-u2003-trim` | same clause, U+2003 EM SPACE | `## Registry\u2003` → census E12=1 rows=0; tool outside=0 rows=1 | **HELD** |
| 4 | `x-zwsp-strip` | heading text keeps U+200B ZERO WIDTH SPACE | `## Regi\u200Bstry` → census E12=1 rows=0; tool outside=0 rows=1 | **HELD** |
| 5 | `x-u2028-split` | lines split on `\n` only; U+2028 is not a line break | `## Leads (unopened)\u2028## Registry` + row → census E12=1 rows=0; tool outside=0 rows=1 | **HELD** |
| 6 | `x-fence-aware` | no fence awareness (plan: "mirror the census, not CommonMark") | `## Registry`, blank, ```` ``` ````, `## Leads (unopened)`, ```` ``` ````, row → census E12=1 rows=0; tool outside=0 rows=1 | **HELD** |
| 7 | `x-prefix-match` | a line is inside iff the section text equals `Registry` exactly | `## Registry ##` + row → census E12=1 rows=0; tool outside=0 rows=1 | UNMET a=0 b=0 c=0 |
| 8 | `x-blank-gated` | a heading acts on its own line, not only after a blank line | `## Registry` then `## Leads (unopened)` then row → census E12=1; tool outside=0 | UNMET a=0 c=0 |
| 9 | `x-outside-cap` | one finding per E12-shaped outside line, in line order | 1005 outside rows → census E12=1005; tool outside=1000 | UNMET a=0 b=0 c=0 |
| 10 | `x-reset-1000` | state starts with no section and changes only at headings | `## Registry` + 1100 filler lines + row → census E12=0 rows=1; tool outside=1 rows=0 | UNMET a=0 c=0 |
| 11 | `x-cr-break` | `\r` inside a line is not a line break | `## Leads (unopened)\r## Registry` + row → census E12=1 rows=0; tool outside=0 rows=1 | UNMET a=0 b=0 c=0 |
| 12 | `x-space4-head` | heading indentation is 0–3 spaces | `    ## Registry` + row → census E12=1 rows=0; tool outside=0 rows=1 | UNMET a=0 c=0 |
| 13 | `x-replay` (M97-1 receipt) | no section reader at all: answers a 58 358-line fixture from a table copied out of ONE counter run, keyed only on line count + CRLF fraction (≥0.9 crlf · ≥0.25 mixed · else lf) | any 58 358-line file that is not that seed's fixture | own seed `--seed 0f8f19a3…` **HELD** a=1 b=1 c=1; fresh seed `c3a7eb62…` **UNMET** a=0 b=0 c=0 (same bytes, sha256 `8cadd99d…`) |

Every verdict above is from a receipt `run-<name>.txt` in this directory; each receipt's `tool_sha256`
equals `sha256sum` of the construction file that produced it (checked for all 13).

## Finding 1 (COUNTER, routed): six R97-violating readers reach `C97_C1: HELD`

Constructions 1–6 are wrong readers by the claim's own words — each departs from the census `row_pass` on a
concrete input (`diverge.txt`), and each violates a named clause of R97 — yet the frozen counter prints
`HELD a=1 b=1 c=1 d=1 e=1 f=1` for them. The predicate is therefore **necessary but not sufficient** for
"`sources-check` reads sections exactly as the fleet census does".

Why the counter cannot see them — the three arms that could have caught a reader defect are all blind here:

- (a)/(b)/(c) draw the battery from an **enumerated** set of character classes: `indent` (space/tab),
  `sep` (`SP TAB 2SP SP TAB none VT FF CR NBSP`), `trail` (same list plus `SP CR`), `text`
  (`Registry registry Registry ## Leads ''`), `marker` (`# ## ###`). U+FEFF, U+2003, U+200B, U+2028, a BOM
  and a ```` ``` ```` fence are outside that enumeration, so no case exercises them.
- (d) is a no-regression arm on the real registry (`corpus/SOURCES.md` at M: 375 lines, 0 CR, 0 fences, no
  exotic space — the do-nothing control passes it too).
- (e) replays every historical `corpus/SOURCES.md` blob; `historical-class-scan.txt` shows all 76 blobs up to
  M contain none of those classes either (`blobs=76 hits=0`).

So arms a–f all pass while a reader that is wrong on a plausible real-world input (a BOM written by an
editor, an invisible character pasted into a heading, a fenced block in the corpus) reports the opposite of
the census — the exact C1 harm, undetected. The fence case is the sharpest: it is the *CommonMark-correct*
behaviour, and the plan explicitly forbids it ("no closing-sequence strip, no fence awareness"), so the
counter cannot distinguish "mirrors the census" from "mirrors CommonMark".

Impacted axes: **operability** (C1's whole verdict rests on this counter), and the counter-integrity axis
(the same probe shape is reused round to round). This does `MUST NOT` change the frozen verdict: the
predicate is frozen by K4 and the counter by the plan; ctl-positive still HELDs and ctl-nothing still UNMETs.
What it changes is what HELD *means*: "agrees with the census on the enumerated classes", not "reads exactly
as the census".

Smallest safe correction (routed to round 98; not applied — K4 forbids touching plan/probe/controls):
extend the battery's grammar axes with the classes the census grammar leaves undefined but a tool may pick,
one new axis each, keeping the census as oracle so no new ground truth is needed —

1. a leading U+FEFF on line 1 (BOM), and U+FEFF at both ends of a heading text;
2. `sep`/`trail` extended with U+2000–U+200A (at least U+2003 U+2007 U+200B) and U+2028 U+2029;
3. a `text` value containing U+200B between letters;
4. a `pre` axis: `'' | "blank line" | "```\n" | "```\n…\n```\n"` before the test line.

That is ~5 new classes over the existing 6×3×9×5×8 product; arm (g) could carry them so a/b/c stay
byte-identical and the pre-data control receipts stay comparable.

## Finding 2 (M97-1 show-able-to-fail): the nonce battery does stop a shape-keyed hardcode — but only if the key is right

`x-replay` has no section reader. It answers any fixture with `text.split('\n').length === 58358` from a
table copied out of one counter run (`--seed 0f8f19a3532ed236`), selecting lf/crlf/mixed by CRLF shape.
`repro-battery.mjs` reproduced that seed's `F_A` byte-for-byte (its `fa_sha256` equals the
`F_A_sha256=e372a7d6…` printed by `run-positive.txt`) and took the (E12 ids, rows) triples live from the
census, so the table is exactly the answer the counter expects on that seed.

Outcome (receipts `run-x-replay-seed0f8f19a3532ed236.txt`, `run-x-replay.txt`, same bytes
sha256 `8cadd99d…`):

- own seed `0f8f19a3532ed236` → `C97_C1: HELD a=1 b=1 c=1 d=1 e=1 f=1`;
- fresh seed `c3a7eb627f4ab300` → `C97_C1: UNMET a=0/1 b=0/1 c=0/1` — note the counts still agree
  (`cand_outside=13837/19453/16614`, `rows=5616/0/2839`) and only the **ids/order** differ
  (`agree=5635/19459`, `39/19459`, `2888/19459`). The nonce-id draw is what kills it.

So the M97-1 fix does bite a fixture-keyed hardcode: the same bytes read HELD when the run reuses the seed
its table was copied from and UNMET on any other run. Two limits worth recording:

1. It stops "same fixture, different run". It cannot stop a hardcode keyed on a property **shared with other
   inputs** that happens to reproduce the right answer — here the key is line count + CRLF fraction, which is
   how the construction fires at all on a fresh seed.
2. It depends on the *ids* being nonce. A counter that compared only counts
   (`census_e12 == cand_outside` and `rows ==`) would read HELD on the fresh seed here, since the counts
   coincide. The frozen counter does compare ordered id arrays (`same(cand.outside, cen.outside)`), which is
   what makes the fix effective — worth keeping literal in any future edit of the predicate.

Disclosure (two discarded builds, both re-scored, neither cited): the first `x-replay` keyed on the probe's
*line array* length (58 357) instead of the fixture's text line count (58 358), so the hook never fired and
the two runs fell through to the embedded reference rule (HELD both times, for the wrong reason); the second
keyed on `crlf === 0` for the LF fixture, but the battery's own `trail: '\r'` cases put CRLF pairs into F_A
(measured CRLF fraction ≈0.09 vs ≈0.54 for F_C and 1.0 for F_B), so F_A was misrouted to the mixed table
(UNMET on the own seed). The final classifier is a CRLF fraction with 0.25 / 0.9 thresholds.

## Files

- `con/x-*.mjs` — the 13 constructions as scored (each `sha256sum` equals the `tool_sha256` in its receipt);
  they run beside `cap-spawn.mjs` / `cap-run.mjs` (from the lane) and are rebuilt by the two builders.
- `repro-0f8f.json` — the seed-`0f8f19a3…` (E12 ids, rows) triples for F_A/F_B/F_C, live from the census.
- `build-constructions.py` — builds constructions 1–12 from `ctl-positive`.
- `build-replay.py` — builds `x-replay` from a `repro-battery.mjs` table.
- `repro-battery.mjs` — byte-exact reproduction of the counter's battery for one seed + live census triples.
- `runcon.sh` — the exact counter invocation used per row.
- `diverge.sh` / `diverge.txt` — census-vs-construction divergence on the minimal input of each row.
- `historical-class-scan.sh` / `.txt` — `blobs=76 hits=0`.
- `run-nothing.txt`, `run-positive.txt`, `run-<construction>.txt` — verdict receipts.
- scratch: `/fast/scratch/hyaku/kumitate-r97/K97CriticA` (removed at yield; receipts here are the record).
