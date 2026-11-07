# K97ScribeLesson — round-97 knowledge entry, M97-1 row, Q91 draft

Seat: `K97ScribeLesson` (scribe, leaf — no dispatch). Lane read-only; every artifact below is inside
`.ufo/waves/round-97/K97ScribeLesson/`. No product code, judge, probe, control, `plan.md`, or fleet file
was touched; no git/jj mutation was run anywhere (fixtures not needed this seat).

## Behavior

1. **Knowledge entry** `.ufo/waves/round-97/K97ScribeLesson/knowledge-sources-check-registry-section.md`
   (draft for `corpus/knowledge/sources-check-registry-section.md`, the exact `used-by` path the S276 row
   names). Header `source:` names **S276** (ECMA-262 2025, https://tc39.es/ecma262/2025/) as the class
   behind JS `\s`/`trim()`/`/\r?\n/`, plus S275 (CommonMark 0.31.2) and S274 (POSIX awk); `verified-at:`
   is the literal placeholder `` `<M>` `` **left for the L1** with the counter command that fills it;
   `recheck: on-release`. Body: BASE's four departures as a table with one measured example line each
   (CR split, literal-space heading regex, `\s` trim, bare-`#` clear, plus the `##  Registry` twin), R97
   quoted verbatim from the plan, why the census (not ECMA-262, not CommonMark) is the authority, the
   two-readers-one-grammar fact (`round-gate.mjs:429-435` r96, `sources-check.mjs` r97), the 19 459-case
   grammar-derived nonce battery with the 17-control table, and seven limits.
2. **Lesson draft** `.ufo/waves/round-97/K97ScribeLesson/lesson-draft.md`: `## Gate` skeleton (admit tool /
   admit S276 with four ≤25-word located quotes / admit Q91 / reject a CommonMark-or-ECMA reader; rows
   touched = S276 new only), the **M97-1** Mistakes row + detail, the r96 `M` sweep, and **QUALITY Q91**
   with rule, grounding, who-checks, command, fails-when, shown-able-to-fail and limit.
3. **Q91 (draft).** "A frozen counter draws its fixture identities per run (nonce) and prints the seed;
   a construction keyed on one run's identities must read UNMET on a fresh seed." Command form:
   `node .ufo/waves/round-97/probe/probe97-c1.mjs --tool <T> --work <scratch>/a --freeze <FREEZE> --rev <M>`
   twice (two `seed=` / `F_A_sha256=`) then `--seed <seed-of-run-a>` to replay run a.

## Gates run (this seat)

| check | command | receipt | result |
|---|---|---|---|
| four departures, one example line each | `python3 scripts/divergence.py` (census `validate --file` + BASE `git show 477afff7:scripts/sources-check.mjs --json`) | `receipts-section-reader-divergence.txt` | census E12 `[S012 S013]`, BASE outside `[S011 S014 S015]`, control `S010` agrees; census `rows=4` vs BASE `counts.rows=3`; 5/6 cases diverge, both directions |
| real registry shape | `git show 477afff7:corpus/SOURCES.md` + `sources-census.sh validate --root … kumitate` | `receipts-real-registry-lf.txt` | 172 270 bytes, **0** CR lines, 213 rows, headings column 0 (Registry line 10), **0 E12**, exit 0, 8 pre-existing W04 |
| S276 quotes located | `python3 scripts/ecma-quotes.py` over the fetched body | `receipts-ecma262-quotes.txt` | all 5 passages FOUND with raw byte offsets; body sha256 `c1f9a159…` (7 330 686 B) |
| quote word counts (Q89 form) | `printf '%s' "<quote>" \| wc -w` ×4 | `receipts-quote-wordcounts.txt` | 17 / 9 / 12 / 22 — the counts the draft prints |
| 17 controls at the freeze | `grep -h '^C97_C1' .ufo/waves/round-97/controls/ctl-*.txt` | `receipts-controls-verdicts.txt` | 17 files: `ctl-positive` HELD a=b=c=d=e=f=1/1; 16 UNMET (do-nothing + 15 one-clause), each on the arm its clause feeds |
| nonce property | probe97 on the same BASE bytes, two explicit seeds (`0b97c1c1c1c1c1c1`, `f00d97f00d97f00d`) | `receipts-counter-nonce.txt` | `F_A_sha256 cc86a956…` vs `5d80fb64…`; 0 of 12 printed disagreement heads shared per arm; C-arm agreement 16478 → 16475; verdict `UNMET` both |
| r96 `M` sweep | `grep -n "M=" .ufo/waves/round-96/close/q88-r96.txt` vs `corpus/lessons/round-96.md:7` | `receipts-r96-m-name-sweep.txt` | q88 `M=4a57390d…`, lesson `M = 09de6791…`; **same** `round-gate.mjs` sha256 `edaa115f…` at both, and `09de6791` is an ancestor of `4a57390d` → label inconsistency, verdict holds |

## Findings

1. **Candidate bytes already implement R97 literally** — `K97ExecTool/sources-check.mjs` (sha256
   `4955a6303dc26cbd1ae495f226410f760ad55a5106da9a7df044152c05b78e1d`, 23:39) has
   `rawLines = sourceText.split('\n')`, `^ {0,3}##[ \t]` → `raw.replace(/^ {0,3}##/,'').replace(/^[ \t]+|[ \t]+$/g,'')`,
   `^ {0,3}#[ \t]` clears, `headings` recorded, `SECTION_MISSING` from the same, rows still from
   `sourceLines`. **No `READY` file at 23:47** — the candidate is not final; the entry documents the rule,
   not these bytes, and no verdict here is a claim about the candidate.
2. **S276 is the next free id** (highest in the registry at base is S275; `^\| S276 ` count 0), and the
   sibling's row `used-by` is exactly this seat's knowledge-entry path — the two must land in one
   integration commit or `validate` prints `E11 S276 missing used-by` (`K97ScribeSources` finding 2).
3. **BASE's selftest pins no section clause:** 46/46 (`f=1/1`) on 14 of the 15 one-clause controls, only
   `ctl-nodisclose` failing `f`. K2 (selftest teeth on all 16 shapes) is therefore load-bearing, not a
   formality.
4. **Nonce evidence is the digest and the case list, not the totals:** a/b agreement counts coincide
   across the two seeds (18721 / 14239) because the class grid is frozen plan text; the fixture digest and
   the disagreement sets differ. Recorded in the Q91 limit so the criterion is not read as a count check.
5. **`## Registry\r` also moves `SECTION_MISSING`** in the tool (recorded heading text is `Registry\r`).
   The census has no such finding; only the heading text is shared. Stated explicitly in the entry to avoid
   implying a census finding.

## Out of scope

The lane tool change, the candidate, the counter, the controls, `probe/`, `controls/`, `open/`, `plan.md`,
the S276 row itself (sibling seat), integration into `corpus/SOURCES.md`, `corpus/QUALITY.md` (the Q91 text
is a draft here), `corpus/lessons/round-97.md`, and the fleet repo. Q90 cannot be run against a filed
lesson that does not exist yet; the S276 URL is present in both drafts (`grep -c` = 1 each) and the Q90
command is named in the lesson draft for the L1.

## Artifact paths (all under `.ufo/waves/round-97/K97ScribeLesson/`)

`knowledge-sources-check-registry-section.md`, `lesson-draft.md`,
`receipts-section-reader-divergence.txt`, `receipts-real-registry-lf.txt`,
`receipts-ecma262-quotes.txt`, `receipts-quote-wordcounts.txt`, `receipts-controls-verdicts.txt`,
`receipts-counter-nonce.txt`, `receipts-r96-m-name-sweep.txt`, `scripts/divergence.py`,
`scripts/ecma-quotes.py`, and this report (`.ufo/waves/round-97/w1/K97ScribeLesson.md`).

Scratch `/fast/scratch/hyaku/kumitate-r97/K97ScribeLesson/` (BASE bytes, control copies, fixture root,
probe work dirs, 7 MB ECMA-262 capture) is removed before yield; the capture is reproducible from the URL +
sha256 in `receipts-ecma262-quotes.txt`, the fixture from `scripts/divergence.py`, and the control copies
from `probe/make-controls97.py` (regenerated `ctl-nothing.mjs` sha256 `5402b210…` = `controls-sha256.txt`).
