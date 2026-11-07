# K97ScribeSources — SOURCES row for round 97 (C1 grounding)

Seat: `K97ScribeSources` (scribe, no dispatch). Lane read-only; every artifact below is
inside `.ufo/waves/round-97/K97ScribeSources/`.

## Behavior

Drafted **one** `## Registry` row, id **S276** (next free; `grep -n 'tc39\|ecma' corpus/SOURCES.md`
exits 1 — no prior row on this URL or this publisher), one URL
`https://tc39.es/ecma262/2025/`, 11 columns, `NF=13` under `gawk -F'|'`.

| column | value |
|---|---|
| source | ECMAScript 2025 Language Specification (ECMA-262) — https://tc39.es/ecma262/2025/ |
| kind / tier | `spec` / `A` |
| status / recheck | `mined` / `on-release` |
| opened | `2026-11-07` |
| used-by | `corpus/knowledge/sources-check-registry-section.md` |
| teaches | why JS `\s`, `String.prototype.trim` and `/\r?\n/` are strictly wider than the census `[ \t]` heading reader and so cannot be the lane's section reader |

The row's quote is Q(b), 21 words:
"Return the CharSet containing all characters corresponding to a code point on the
right-hand side of the WhiteSpace or LineTerminator productions." (§ 22.2.2.9
`CompileToCharSet`, `CharacterClassEscape :: s`.)

## Source opening (three located passages, all byte-exact in the saved body)

Capture `captures/ecma262-2025.html`, fetched with curl, HTTP **200**, 7 330 686 bytes,
sha256 `c1f9a15946c7dd94b13f56564fa6549cc6f212fd35101f8f5e38a32a0efbefe1`,
Last-Modified `Fri, 06 Nov 2026 17:17:55 GMT`, access date **2026-11-07** (UTC; host
local clock was 2026-11-06 23:34 -03).

| # | section | html line | html byte | words |
|---|---|---|---|---|
| a | § 22.1.3.32.1 TrimString — "The definition of white space is the union of WhiteSpace and LineTerminator." | 34900 | 4977578 | `12` |
| b | § 22.2.2.9 CompileToCharSet, `CharacterClassEscape :: s` — the row quote | 37124 | 5262464 | `21` |
| c | § 12.2 White Space, Note 1 — "U+0020 (SPACE) and U+00A0 (NO-BREAK SPACE) code points are part of <USP>." | 14263 | 2402224 | `12` |

`wc -w` was run as `printf '%s' "<quote>" | wc -w` for each; outputs 12 / 21 / 12 are
pasted in `quotes.md`. § 12.2's `WhiteSpace :: <TAB> <VT> <FF> <ZWNBSP> <USP>`
production sits at html lines 14270-14283 (Table 35 rows at 14208, 14219, 14230, 14241,
14252). § 12.3 line 14293 states line terminators are in the set matched by `\s`.

## Gates run

1. `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <mirror>/corpus/SOURCES.md`
   → **exit 0** (`census.txt`). The 8 `W04` warnings diff-identical to the lane baseline
   run on the unmodified `corpus/SOURCES.md` (`base-vs-mirror-w04.diff`, `diff_exit=0`),
   so S276 adds no finding; no line names S276.
2. `awk -F'|' '/^ {0,3}\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13' <copy>/corpus/SOURCES.md`
   → **no output**; the inserted line itself is `NF=13` (`row-check.txt`).
3. `python3 extract-quotes.py captures/ecma262-2025.html` → `VERDICT: all three quotes
   located byte-exact`, exit 0 (`quotes-verify.txt`).

## Findings

1. **A bare corpus copy is not a valid validate root.** `sources-census.sh` derives the
   lane dir from `--file` as `dirname(file)/..` and checks `used-by` existence there, so
   copying only `corpus/` yields 22 spurious `E11` lines on *pre-existing* rows
   (S038, S046-048, S078-079, S084, S093-095, S098-099, S220-222) plus the same 8 `W04`
   warnings, exit 1 (`bare-copy-validate.txt`). The valid receipt used here is a mirror
   root: a real copy of `corpus/` plus symlinks to the lane's
   `scripts/`, `.ufo/`, `.scratch/`, `SKILL.md`, `considerthese`, `AGENTS.md`, `LOG.md`,
   `PROVINCE.md`, `README.md`, `SCORECARD.md`, `SHONEN.md`. Anyone re-running this
   receipt needs the same shape.
2. **`corpus/knowledge/sources-check-registry-section.md` does not exist in the lane yet.**
   The row's `used-by` points at the knowledge entry the round is to write
   (`K97ScribeLesson`'s artifact). Integration MUST land that file in the same commit as
   the row, or `validate` emits `E11 S276 missing used-by …` and exits 1. The validation
   here created an empty placeholder at that path *in the mirror only*.
3. Round-97 plan names the document as "ECMA-262 (2025, https://tc39.es/ecma262/2025/)";
   the document itself carries no "16th edition" string (`grep -c '16th'` → 0), so the
   row titles it by the served `<title>`, `ECMAScript 2025 Language Specification`, and
   does not assert an edition number.
4. The C1 wording in the plan, "a strictly wider class than the census `[ \t]`", is
   exactly what Q(b)+Q(c) support: `\s` = WhiteSpace ∪ LineTerminator (TAB, VT, FF,
   ZWNBSP, USP incl. U+00A0, plus the four line terminators), while the census heading
   regexes accept SP and TAB only.

## Touched surfaces

Written (seat dir only):
`row.md`, `quotes.md`, `census.txt`, `row-check.txt`, `bare-copy-validate.txt`,
`base-vs-mirror-w04.diff`, `row-quote-words.txt`, `quotes-verify.txt`,
`extract-quotes.py`, `captures/ecma262-2025.html`, this report.
Nothing under `scripts/`, `corpus/`, `probe/`, `controls/`, `open/`, `plan.md` or the
fleet repo was modified: `git -C . status --porcelain` in the lane lists only untracked
seat directories (no ` M ` line). No git/jj mutation was run anywhere.

Reproducibility: the `--file` path inside `census.txt` and `bare-copy-validate.txt` points
into the seat scratch (`/fast/scratch/hyaku/kumitate-r97/K97ScribeSources/`), which is
removed on yield; the mirror recipe in finding 1 rebuilds it, and the row itself is
`row.md` line 1.


## Out of scope

The lane tool change (`runCheck` R97), the counter, the controls, the knowledge entry
itself, and integration into `corpus/SOURCES.md` (the row is a draft, not appended to the
lane file).
