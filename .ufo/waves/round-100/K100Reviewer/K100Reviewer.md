# K100Reviewer — C1 exact-rule review (kumitate round 100, wave w1)

Reviewed bytes (`K100ExecTool/READY`, written 04:45 local, lists exactly these two sha256):

- `K100ExecTool/cite-sources.mjs` sha256 `e887b982eff4bcfe5d15e47b2c105ebabf4b4dd9cae7ec4fdf8599fccdab9ace`
- `K100ExecTool/source-capture.mjs` sha256 `ad3227d6571838ccefa10aa3778c9777730f5e1ad9a89f03f528d6f2d7104355`

The builder's own `selftest-cite.txt` / `selftest-capture.txt` are byte-identical to the receipts
below (`diff -q` clean). Lane base `5e2f9856271525760ade3b08892f6df7601fa689`.
Read-only review: nothing was edited, judged, integrated or shipped; the verdict is a recommendation.

## 1. Edit points — production change is exactly one row reader per tool

`diff -u` of each lane script against its candidate: only three kinds of hunk — header doc
comment, the reader line, selftest body. Receipts: `diff-cite.txt`, `diff-capture.txt`.

| file | lane | candidate | old → new |
|---|---|---|---|
| `scripts/cite-sources.mjs` | :36 | :40 | `line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/)` → `line.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)` |
| `scripts/source-capture.mjs` | :157 | :159 | `raw.matchAll(/^\s*\|\s*(S[0-9]{3,})\s*\|/gm)` → `raw.split('\n').map((l) => l.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/)).filter(Boolean)` |

- cite-sources keeps the existing loop `for (const line of text.split('\n'))` (one LF record
  per element). Candidate reader line is byte-identical to `controls/ctl-positive/cite-sources.mjs:36`
  (sha256 `865ba7e5…`).
- source-capture drops the `m` flag and `matchAll`; `^` anchors at element start only. Candidate
  line is byte-identical to `controls/ctl-positive/source-capture.mjs:157` (sha256 `59ca1a3b…`).
- Doc comments only: cite +4 header lines, capture +2 (`R100` wording). No other production code
  changed; verdict lines, exit maps, contract ids, README citation reader and registry JSON rules
  are untouched.

Selftest bodies grew (cite 8 → 25 cases, capture 13 → 33); see §6 for one teeth defect.

## 2. Rule equivalence

Census oracle (`sources-census.sh` `row_pass`, lines 574-695): gawk default `RS` = LF; gate
`line ~ /^ {0,3}\|/`; id = `trim($2)` with `trim` = `[ \t]`; `E02` unless `id ~ /^S[0-9]{3,}$/`;
every NF=13 row in `## Registry` prints `E06 … tier=<tier>`, so the frozen classification
"census reads it as a valid id" = an E06 line whose id matches `^S[0-9]{3,}$`.

Candidate reader: one LF-delimited element per record, gate `^ {0,3}\|` at element start (no `m`),
then the *whole* id cell = `[ \t]*` + `S` + 3+ ASCII digits + `[ \t]*` closed by `|`. That is
`trim($2) ~ /^S[0-9]{3,}$/` for the claimed class (13-field row inside `## Registry`). Checked
against the live census in §3, the 135-row counter battery on two seeds (§4), and the 21-lane
BASE no-regression arm (c=1).

## 3. Hand-check: 20 cases vs live census (20/20)

Harness `handcheck.py` (receipts `cases-candidate.txt`, `cases-candidate.json`; rerun:
`python3 handcheck.py <cite> <capture> <out> <label>`). Each fixture is a small `SOURCES.md`
inside `## Registry` holding one always-valid anchor row `S999` plus the case row; census is run
live (`bash scripts/sources-census.sh validate --file … --today 2026-11-07`) and validity is read
from the E06 line carrying that row's unique `Z<nonce>` tier. cite-sources gets a README row
citing the probe id; source-capture gets a registry binding S999 (capture) and the probe id
(exemption). "cited" = `CLEAN cited=1`; "ghost" = `DRIFT ghosts=1 first=<probe>`; "known" =
probe id in the recognised set.

| case | id cell / indent | census id | cite | capture | ok |
|---|---|---|---|---|---|
| clean | ` S500 ` | valid (E06) | cited | known | True |
| nbsp-lead | `\u00a0S501 ` | invalid (E06) | ghost | unknown | True |
| u2003-trail | ` S502\u2003` | invalid (E06) | ghost | unknown | True |
| vt-pad | `\vS503\v` | invalid (E06) | ghost | unknown | True |
| cr-pad | `\rS504\r` | invalid (E06) | ghost | unknown | True |
| feff-pad | `\ufeffS505\ufeff` | invalid (E06) | ghost | unknown | True |
| u2028-pad | `\u2028S506\u2028` | invalid (E06) | ghost | unknown | True |
| tab-pad | `\tS507\t` | valid (E06) | cited | known | True |
| sp8 | `        S508        ` | valid (E06) | cited | known | True |
| indent3 | `   \| S510 ` | valid (E06) | cited | known | True |
| indent4 | `    \| S511 ` | invalid (-) | ghost | unknown | True |
| indent-tab | `\t\| S512 ` | invalid (-) | ghost | unknown | True |
| indent-nbsp | `\u00a0\| S513 ` | invalid (-) | ghost | unknown | True |
| break-cr | `\r\| S514 ` | invalid (-) | ghost | unknown | True |
| break-u2028 | `\u2028\| S515 ` | invalid (-) | ghost | unknown | True |
| break-nel | `\u0085\| S516 ` | invalid (-) | ghost | unknown | True |
| crlf | ` S517 ` | valid (E06) | cited | known | True |
| s123x | ` S518x ` | invalid (E06) | ghost | unknown | True |
| fullwidth-digits | ` S５１９ ` | invalid (E06) | ghost | unknown | True |
| two-ids | ` S520 S521 ` | invalid (E06) | ghost | unknown | True |

Notes: invalid *id* rows still print E06 in the census (it prints E06 after E02 for NF=13 rows),
with the padded id, so they classify invalid under the frozen predicate. The three "break" rows
are not rows for the census, so they emit no E-line (`-`); `crlf` is one LF record ending in CR
and is a row for both. The same 20/20 table holds for `controls/ctl-positive` (`cases-ctl-positive.txt`).

## 4. Frozen counter and shipped selftests (current bytes)

- Counter, seed `663906495c2bceec`:
  `C100_C1: HELD a=1 b=1 c=1 d=1 rows=135 valid=33 invalid=102 a_miss=0 b_miss=0 c_miss=0 lanes=21 … cite_sha256=e887b982… capture_sha256=ad3227d6…` (exit 0).
  Earlier run on builder bytes `ebb4dacf/35449a4f`, seed `bc49c1f90443de9c`: HELD, same counts.
- Counter on ctl-positive regenerated by `make-controls100.py` (shas match
  `controls/controls-sha256.txt`), seed `25d5f910cfa4018e`: `C100_C1: HELD a=1 b=1 c=1 d=1 …` (exit 0).
- Selftests: `CITE_SOURCES_SELFTEST: PASS (25/25)` + `VERDICT: PASS` (exit 0);
  `SOURCE_CAPTURE_SELFTEST: PASS (33/33)` + `VERDICT: PASS` (exit 0).

Receipts: `counter-candidate-e887.txt`, `counter-candidate-ebb4.txt`, `counter-ctl-positive.txt`,
`selftest-cite.txt`, `selftest-capture.txt`.

## 5. Fail-closed / empty / orphan rule parity (LF fixtures, BASE vs candidate)

`rules.py` → `rules-parity.txt`: six fixtures (clean, duplicate id, duplicate id via tab-padded
cell, no rows, orphan exemption, uncaptured id). BASE and candidate wrote identical stdout and
exited identically in all six (`dup*` → FAIL-CLOSED duplicate row id, exit 2; no rows →
FAIL-CLOSED `no S### rows`, exit 2; orphan/uncaptured → DRIFT, exit 1). The reader change does
not move the duplicate-id, empty-registry or orphan rules on LF files.

## 6. Defects (severity order)

1. **MEDIUM — cite-sources selftest cases `r100-lowercase-not-row` and
   `r100-fullwidth-not-row` have no teeth (K2-routed, cite-only).** Both assert only
   `CLEAN cited=1` on a README citing the *ASCII* id (S933 / S935). A reader that additionally
   accepts `s932` or `S９３４` still returns `CLEAN cited=1`. Proven by mutating only the shipped
   production line: `cite-i2` (`/i` flag) → `VERDICT: PASS` (25/25), `cite-fw2`
   (`S\p{Nd}{3,}/u`) → `VERDICT: PASS` (25/25) — receipts `mutants-cite-e887.txt`. The other
   eight cite-side control shapes are killed by the suite (`indent4`, `leadjs`, `trailjs`,
   `nbsp`, `padcap3`, `spaceonly`, `noanchor`, `nothing` all `VERDICT: FAIL`,
   `mutants-cite-sweep-e887.txt`). Fix: cite the lowercase / non-ASCII id in the README and
   assert `DRIFT ghosts=1 first=<that id>` (as the capture cases do), or assert the registry id
   set. This does not flip the frozen counter (d=1 on the shipped bytes); route under K2.
   The builder pre-empts this in `K100ExecTool/arm-teeth.txt` (`ctl-ci` / `ctl-unicode-digits`:
   “cite side verdict-equivalent: citations are uppercase-ASCII only; killed via capture”). That
   equivalence is sound *for cite verdicts today*: `citedIds`' `ID_RE` is uppercase ASCII
   `S[0-9]{3,}`, so ids admitted only by a `/i` or `\p{Nd}` reader can never match a cited id and
   the tool pair is killed via the capture case. It remains a K2-literal tool-level gap (the cite
   suite cannot see its own row-id class drift) and becomes load-bearing if the README citation
   reader or `ID_RE` ever broadens; the cheap fix above pins the class in the cite suite itself.
   For contrast, source-capture's equivalent cases do have teeth: `cap-i2` and `cap-fw2` fail
   with `first=s845:uncaptured` / `first=S８４６:uncaptured` (`mutants-cap-ebb4.txt`).
2. **LOW / out of claim (pre-registered plan limit 2; report-only) — no section or field-count
   gate.** Neither reader restricts rows to `## Registry` nor checks NF==13, while the census
   reports E12 for a row-shaped source outside `Registry` and E01 for malformed rows. Measured
   with `rules-parity.txt`: `row-outside-registry` → census `E12,E06` vs cite treating S730
   (outside) as a registry id (kills only S732); `malformed-10cell-row` → census `E01` vs cite
   accepting S732. This is outside R100's stated scope ("13-field row inside `## Registry`"),
   already routed to the section-scope seat; not a defect against the claim.
3. **INFO — capture selftest teeth.** Every capture-side shape applied to the shipped reader was
   killed: `cap-k99` (m-flag `^`), `cap-splitany` (all line terminators split), `cap-indent-blank`,
   `cap-nothing`, plus the two digit/case mutants above → all `VERDICT: FAIL`
   (`mutants-capture-sweep-e887.txt`, `cap-*.log`).
4. **INFO — no production defect found** in either row reader for the claimed class: both match
   the L1 reference (ctl-positive) byte-for-byte and agree with the live census on all 20 hand
   cases, the 135-row counter battery (two seeds) and the 21-lane regression arm.

## 7. Residual risk and verification gaps

- **`READY` landed while the report was being written and matches the reviewed bytes exactly**
  (two sha256 lines, same values as §1; `sha256sum` of both files agrees). All receipts —
  counter (seed `663906495c2bceec`), hand-check, selftests, mutants, rule parity — were produced
  after the final file write (04:42) and are therefore on the shipped bytes. If either candidate
  is replaced later, re-run `handcheck.py`, both `--selftest`s and the counter (sha-tagged).
  I also attacked `ctl-positive` as the fallback, regenerated from `make-controls100.py` into my
  scratch (shas match `controls/controls-sha256.txt`): counter HELD.
- HELD is a refutation budget over the drawn classes, not a proof (r98/r99 precedent). File-start
  BOMs, duplicate ids and malformed rows are not drawn; section scope is not enforced (defect 2).
- Arm (c) is a no-regression arm the do-nothing control also passes (live registries carry no
  non-blank id pads / non-SP indents / same-record breaks); the claim's value is prospective.
- The census was used as the live oracle; I did not probe gawk locale edge cases for `[0-9]` or
  `[ \t]` (out of scope, unchanged by this diff).

## 8. Receipts (all under `.ufo/waves/round-100/K100Reviewer/`)

`diff-cite.txt`, `diff-capture.txt`, `cases-candidate.txt`, `cases-candidate.json`,
`cases-ctl-positive.txt`, `counter-candidate-e887.txt`, `counter-candidate-ebb4.txt`,
`counter-ctl-positive.txt`, `selftest-cite.txt`, `selftest-capture.txt`, `rules-parity.txt`,
`mutants-cite-e887.txt`, `mutants-cite-sweep-e887.txt`, `mutants-capture-sweep-e887.txt`,
`mutants-cite-ebb4.txt`, `mutants-cap-ebb4.txt`, `cap-*.log`, `handcheck.py`, `rules.py`.
Builder-side originals checked against this report: `K100ExecTool/READY` (sha match),
`K100ExecTool/arm-teeth.txt`, `K100ExecTool/selftest-cite.txt`, `K100ExecTool/selftest-capture.txt`
(latter two byte-identical to `selftest-cite.txt` / `selftest-capture.txt` here).

**Verdict (recommendation):** the production change is the exact R100 row reader in both tools
and no actionable production finding remains; one cite-selftest teeth defect (2 of 10 cite-side
shapes) is reported for K2 routing and does not change the frozen counter line
`C100_C1: HELD`.
