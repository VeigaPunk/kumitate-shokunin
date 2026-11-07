# K100CriticC — independent differential H100 (kumitate r100 / C1)

Verdict: **no candidate counterexample found.** The READY pair (`K100ExecTool/`, cite `e887b982…`,
capture `ad3227d6…`, sha checked before and after the runs) recognises the census-valid row-id set
on my own seeded battery: **1344/1344 cite probes and 990/990 capture fixtures agree with the live
census across two seeds; 0 candidate disagreements.** BASE disagrees 115/1344 (cite) and 203/990
(capture). `ctl-positive` (L1 reference) is also 0/0, so candidate behaviour equals the reference on
every drawn class.

Battery (independent of `probe100-c1.mjs` and `make-controls100.py`; generator `gen100.py`, driver
`diff100.mjs`, seeds A `edb7db46958057b2`, B `6864463af4d02acc`): 1014 fixtures / 2382 rows / 1368
test rows, 990 in-scope / 24 report-only. Per-role union covers Unicode White_Space 24/24 (LF
excluded: record separator), Zs 17/17, seat-spec Cf 14/14, C0+DEL+C1 64/64; pad/indent lengths 0–10;
17 digit forms (ASCII min/10-digit, fullwidth, Arabic-Indic, ext-Arabic, Devanagari, Bengali, Thai,
mixed, two-digits, malformed forms); CRLF rows; same-record prefixes over the full set. The
generator's independent `row_pass` model equals the live census on all 990 in-scope fixtures
(`model_vs_census_mismatches=0`), so the oracle is not a model artifact.

BASE disagreement classes (minimal fixtures in `K100CriticC/receipts/minimal-base/`): cite false
positives = id pads from JS `\s` minus ASCII blank (VT, FF, CR, NBSP, OGHAM, U+2000–200A, LS, PS,
NNBSP, MMSP, IDSP, FEFF); capture adds TAB/4–10-SP indents and CR/LS/PS or leading-`\s` prefixes.
BASE agrees on NEL, SHY, ALM, MVS, ZWSP–RLM, WJ/U+2060–2064, other C0/C1/DEL and all non-ASCII digit
forms (neither ECMAScript `\s` nor line terminators; ASCII `[0-9]` both sides) — useful negative
controls.

Report-only boundaries (12/seed; `K100CriticC/receipts/report-only/observed.txt`):
1. **NUL in the id cell breaks the census `--file` oracle, not the tools.** Row `|\x00S5141 | …`;
   census stderr `line 717: warning: command substitution: ignored null byte in input`; stdout shows
   `E02 S5141` *and* a valid-looking `E06 S5141` because bash dropped the NUL. Cand and BASE both
   ghost it (correct per R100's ASCII-SP/TAB trim). The frozen counter avoids this only by omitting
   U+0000 (`receipts/nul-oracle/`). Smallest safe correction: keep U+0000 out of the class and let a
   counter mark NUL-bearing E06 as SETUP; no tool change.
2. **NF==13 is load-bearing but absent from R100's sentence.** A 13-field row plus an extra pipe or
   a second CR/LS/PS-separated row is `E01` (no E06) for the census; both readers still read the
   first id, BASE also the second. Out of R100's explicit "13-field row" scope; no correction needed
   for C1, but don't claim line-level identity without a 12-pipe gate (new claim).
3. **Section scope.** Whole-file CRLF makes `## Registry\r` fail the census heading test (`E12`, no
   E06); readers parse rows regardless (disclosed). File-start BOM is benign when the Registry
   heading is intact. No C1 correction.

Latent (not drawn, `K100CriticC/receipts/latent-duplicate/`): two 13-field rows sharing an id make
source-capture FAIL-CLOSED (`duplicate row id`, pre-existing rule) while the census prints E06 for
both plus E03 and cite CLEANs; predicate (b) would score b=0 for every implementation, so duplicate
ids must stay out of the battery or become a counter SETUP precondition. No tool change is right here.

Residual limits: no shell-out-to-census check, no registry-JSON / README-reader / separator-row /
pipe-in-cell cases; LF cannot be a pad by record model; non-id cells canonical.

No hidden regression in the drawn classes; the candidate narrows BASE's multi-match on malformed
records (out of scope, census E01). Live exposure not re-measured here (K99ExecSibling 0/5,555).
Full evidence and reproduction commands: `K100CriticC/H100.md` + `K100CriticC/receipts/`
(provenance, per-seed JSON, minimal fixtures, NUL hex/stdout/stderr). Scratch removed before yield.
