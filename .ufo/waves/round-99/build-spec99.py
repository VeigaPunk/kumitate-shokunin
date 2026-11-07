#!/usr/bin/env python3
"""Build .ufo/waves/round-99/w1-spec.json (kumitate r99, one v1 wave, 12 seats). Usage: build-spec99.py <FREEZE>"""
import json
import sys

L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
R = f'{L}/.ufo/waves/round-99'
FREEZE = sys.argv[1]
BASE_REV = 'f9cd1bff147508f0d787f9e0cc4d2191aabaf02a'
SCR = '/fast/scratch/hyaku/kumitate-r99'
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
GOD = ("/skill:godspeed\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n"
       "3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim \u2014 let the frontier walk itself.**\n\n"
       "## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize "
       "what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.\n")
CAND = f'{R}/K99ExecTool/sources-check.mjs'
COUNTER = f'node {R}/probe/probe99-c1.mjs --tool <TOOL> --work {SCR}/<your seat name>/probe'
GEN = f'python3 {R}/probe/make-controls99.py <out dir>'
SHAPES = ('spaceonly, asciiws, nbsp, zs, leadonly, trailonly, padcap3, bomstrip, cfstrip, c0strip, pystrip, idonly, '
          'enumonly, countall (plus BASE JS trim = ctl-nothing)')

context = f"""# Goal
Kumitate round 99 (hyaku run 15, attempt 1). ONE claim C1 = operability: inside `## Registry`, the lane gate `{L}/scripts/sources-check.mjs` trims every table cell with `function trim(value) {{ return value.trim(); }}` (line 134) — ECMAScript String.prototype.trim, which strips TAB, VT, FF, SP, NBSP, U+FEFF, every Unicode Zs, CR, LF, U+2028/U+2029. The fleet census `row_pass` (`{CENSUS}` lines 574-695) trims every cell with `gsub(/^[ \\t]+|[ \\t]+$/,"",s)` (POSIX `blank`). So `| \\u00a0S123 |`, `| docs\\u00a0 |`, `| 2025-01-02\\u2003 |` are valid for sources-check and E02/E05/E08 for the census; sources-check `counts.rows` also counts those rows (r98 K98Connector: FIX-A ID_FORM 42 vs census E02 182, rows 190 vs 349 population).
Frozen rule R99: sources-check's `trim` helper strips only ASCII SP and TAB from both ends (`value.replace(/^[ \\t]+|[ \\t]+$/g, '')`), for every Registry cell (id and the ten other cells) and every helper that calls it. Everything else unchanged (section grammar r97, outside-row regex, 13-field rule, finding kinds, exit map, contract id `kumitate-sources-v1`).

READ FIRST: `{R}/plan.md` (frozen predicate, kill rules K1-K4, 17 controls with observed verdicts). Frozen at lane commit `{FREEZE}` (base `{BASE_REV}`). Counter (FROZEN, never edit): `{R}/probe/probe99-c1.mjs`; run form:
`{COUNTER}`
It draws a fresh seed every run (`--seed <16hex>` replays): ~400 rows, nonce ids of 3-12 digits, 47 pad classes (blank, VT/FF/CR, NEL, NBSP, all Zs samples, LS/PS, Cf U+180E/200B-200E/2060/FEFF/00AD, C0 U+0001/001C/001F, Hangul fillers, mixes) x pad length 1-8 x lead/trail/both on the id, kind, tier, status, opened and recheck cells; invalid id forms; 12-field rows; duplicate pairs; it runs the census live and compares per-row finding sets, then BASE-vs-candidate `--json` on snapshots of all 21 fleet lane registries and the candidate `--selftest`. Verdict line `C99_C1: HELD|UNMET|SETUP a= b= c= d= e= f= g= h=` (~80 s wall, CPU heavy: never run more than 2 counters at once). Controls: `{R}/controls/` (`ctl-positive` = the L1 reference rule, HELD; `ctl-splitjs` = out-of-scope used-by split, HELD by design; every other control UNMET); generator `{GEN}` (shapes: {SHAPES}).
The candidate (once built) lives at `{CAND}`; its builder writes `{R}/K99ExecTool/READY` (one line: sha256 of the candidate) when final. Seats that attack the candidate: do candidate-independent work first, then look for READY; if still absent when that work is done, attack `ctl-positive` (regenerate it with the generator into your scratch) and say so (never wait in a sleep loop longer than 10 minutes total).
Lane root `{L}` is detached; read history with `git -C {L} show <rev>:<path>`.

# Contract
- Read-only on the lane: never write under `{L}/scripts/`, `{L}/corpus/`, `{R}/probe/`, `{R}/controls/`, `{R}/open/`, `{R}/plan.md`, or any other lane file. Write ONLY inside your own seat dir `{R}/<your seat name>/` (create it). Put every receipt and file you cite there, and write your trailer report there.
- Every `Report:` trailer path the validator prints is relative to {L} — write it at {L}/<that path>.
- Scratch: `{SCR}/<your seat name>/`. Create it with `mkdir -p`, pass it explicitly (`TMPDIR=<scratch>`), never use `/tmp` for anything over 50 MB, remove it before you yield (`trap 'rm -rf -- "$S"' EXIT`). A `/tmp` path is never citable evidence.
- Git: fixtures only as `D=$(mktemp -d -p <scratch> fx.XXXXXX) && test -n "$D" && git -C "$D" init -q`, every later git call names `-C "$D"`; verify `git -C "$D" rev-parse --show-toplevel` equals `$D` before the first commit; never pass an empty or unchecked variable to `git -C`. Never run `git commit/add/stash/checkout/reset/push/worktree` or any `jj` command in the lane or the fleet repo; never run a mutating git/jj command outside your fixture or your own `git clone --shared` sandbox under your scratch.
- Never message `agent://all`. Never edit the fleet repo `/home/vgpnk/Projects/shokunin`, a sibling lane, `MANIFEST.json`, or anything under `/boot`, `/etc`, `/usr`, `/var`; never change host sysctls. Never run `sudo`. Host paths outside your scratch are read-only inputs. Never run anything that could exhaust host memory without `prlimit --as=4294967296` and a `timeout`.
- Tooling: you and every seat may install or upgrade tools that help the task — read `/home/vgpnk/.omp/agent/RULES.md` first (official channels only; record tool/version/channel/reason). pacman transactions are PAUSED host-wide: never `pacman -S/-Sy/-Syu/-U/-R`; use `uv tool`, `npx`, or an official binary in `~/.local/bin`.
- Evidence over prose: every claim names the command you ran and the receipt path under your seat dir. An unrun check has not passed. If blocked, say exactly what and what you tried.
- Yield a concise result (<= 25 lines): paths produced, the command outputs that matter, blockers."""

items = []


def item(name, role, body):
    items.append({'name': name, 'role': role, 'prompt': GOD + body})


item('K99ExecTool', 'executor', f"""# Target
Build the production candidate `sources-check.mjs` with frozen rule R99. Writable: `{R}/K99ExecTool/` only.
# Change
1. Copy `{L}/scripts/sources-check.mjs` to `{CAND}` and copy `{L}/scripts/cap-spawn.mjs` + `cap-run.mjs` beside it (the tool imports `./cap-spawn.mjs`).
2. Implement R99: line 134 becomes `function trim(value) {{ return value.replace(/^[ \\t]+|[ \\t]+$/g, ''); }}` with a one-line doc comment (census `row_pass` `trim`, POSIX `blank`; JS `trim()` is wider); add one sentence to the header doc (lines ~1-30) that every Registry cell is trimmed with the census blank class. Everything else byte-identical.
3. `--selftest`: keep all 71 existing arms passing and add hermetic arms beside the r97 section arms (~lines 740-830; reuse `makeDefault` and helpers) so that EACH control shape in `{R}/probe/make-controls99.py` ({SHAPES}) fails at least one new arm (`ctl-splitjs` is out of scope and need not fail). Arms assert exact finding kinds + details on small fixtures: NBSP / VT / FF / CR / NEL / U+2003 / U+FEFF / U+200B / U+0001 / U+3164 lead and trail pads on id (ID_FORM, not counted in counts.rows), kind (KIND_ENUM), tier (TIER_ENUM), status (STATUS_ENUM), opened (OPENED_INVALID), recheck (RECHECK_INVALID); blank pads of length 1, 4 and 8 (SP, TAB, mixed) on every one of those cells are accepted; a duplicate valid id whose second copy is NBSP-padded is ID_FORM not ID_DUPLICATE, TAB-padded is ID_DUPLICATE; counts.rows equals the number of blank-trim-valid ids. Optionally one arm compares with the census when `SHOKUNIN_ROOT`/`{CENSUS}` is present (skip only when absent, fail on found-census exit outside 0/1, as r97sec-census-parity does).
4. Score: `{COUNTER.replace('<TOOL>', CAND).replace('<your seat name>', 'K99ExecTool')}` twice -> `score1.txt`, `score2.txt` (each must end `C99_C1: HELD ...`). Save `selftest.txt` (`node {CAND} --selftest`), `sha256.txt`, `diff.txt` (`diff -u {L}/scripts/sources-check.mjs {CAND}`). Then write `{R}/K99ExecTool/READY` with the candidate's sha256 and STOP editing (a later edit must rewrite READY and be named in your yield).
5. Before READY, prove the arms have teeth: apply each control shape (the generator's line rewrites, applied to a scratch copy of YOUR candidate) and record which new arms fail -> `arm-teeth.txt` (every shape killed by >= 1 arm, BASE JS trim too).
# Acceptance
Candidate + READY + receipts; both counter verdict lines quoted; selftest count before/after; arm-teeth table 16/16.""")

item('K99ExecHarm', 'executor', f"""# Target
Harm battery for the sources-check trim swap (kill rule K3). Writable: `{R}/K99ExecHarm/` only.
# Change
1. Run `bash {R}/close/battery.sh <dir> <label>` on a `git clone --shared {L}` sandbox under your scratch at base `{BASE_REV}` -> `base.txt`; then copy the candidate (READY, else ctl-positive) over `scripts/sources-check.mjs` in the sandbox and rerun -> `cand.txt`; `battery-diff.txt` = diff of the two. Expected: only proxy pin lines for sources-check may change; anything else is a regression.
2. Every committed revision of `{L}/corpus/SOURCES.md` (`git -C {L} log --format=%H -- corpus/SOURCES.md`): for each, build a lane snapshot (`git -C {L} archive <rev> corpus | tar -x -C <dir>`) and compare BASE vs candidate `--json` (`--today 2026-11-07`) -> `history.txt` (rev, same|differ, first differing finding).
3. Every consumer of sources-check output in the lane (`grep -rn sources-check {L}/scripts {L}/SKILL.md`): list which read `counts.rows`, tiers/status, or finding kinds; for each say whether R99 can change what it reads -> `consumers.txt`.
# Acceptance
`base.txt`, `cand.txt`, `battery-diff.txt`, `history.txt` (count same/differ), `consumers.txt`; one line per tool: same/expected/regression.""")

item('K99ExecSibling', 'executor', f"""# Target
Measure the lane's two other SOURCES row readers that still use JS `\\s` (report-only; NOT changed this round). Writable: `{R}/K99ExecSibling/` only.
# Change
1. `{L}/scripts/cite-sources.mjs:36` (`/^ {{0,3}}\\|\\s*(S[0-9]{{3,}})\\s*\\|/`) and `{L}/scripts/source-capture.mjs:157` (`/^\\s*\\|\\s*(S[0-9]{{3,}})\\s*\\|/gm`): read each tool's usage and build small hermetic fixtures (scratch lane copies) whose registry ids are padded with NBSP / U+2003 / VT / U+FEFF and indented with TAB / NBSP. Run each tool and the census (`bash {CENSUS} validate --file <f> --today 2026-11-07`) and record which ids each recognises vs the census -> `parity.txt` with the exact commands.
2. For each tool write the minimal R99-style fix (regex/trim class) as a diff in your seat dir only (`fix-cite-sources.diff`, `fix-source-capture.diff`) and show, on the same fixtures, that the fixed copy agrees with the census; run each fixed copy's own selftest if it has one.
3. Count the real-data exposure: in all 21 `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md`, rows whose id cell or indent carries any non-blank whitespace (expected 0) -> `exposure.txt`.
# Acceptance
`K99ExecSibling.md`: per tool, parity table (recognised ids tool vs census), the fix diff, fixed-copy agreement, selftest result, real exposure count.""")

item('K99ScribeSources', 'scribe', f"""# Target
Draft SOURCES rows for this round. Writable: `{R}/K99ScribeSources/` only.
# Change
1. Open Unicode PropList.txt 17.0.0 (`https://www.unicode.org/Public/17.0.0/ucd/PropList.txt`) with curl into your scratch; record HTTP status, byte count, sha256 (the L1 capture is `{R}/open/l1-open-unicode-proplist-17.0.0.txt`; compare bytes). Locate the `White_Space` entries (lines ~12-22) and quote <= 25 words with line numbers: the lines that show U+0085 (NEL, Cc) is White_Space while U+FEFF and U+200B are absent, which is why JS `trim()` (S276: WhiteSpace = TAB VT FF ZWNBSP + Zs, plus line terminators) is neither the census blank class nor Unicode White_Space.
2. Open POSIX Shell Command Language §2.13 Pattern Matching Notation (`https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html`, section 2.13.1) and quote <= 25 words, with location, on how bracket-expression character classes such as `[:space:]` take their meaning from the current locale (LC_CTYPE) — this grounds the census `usedby_findings` `trim_cell` (`{CENSUS}` lines 531-535) being locale-dependent while `row_pass` is not. Also try `https://www.gnu.org/software/bash/manual/html_node/Pattern-Matching.html` (record unreachable with the curl error if it times out).
3. Draft rows in the lane's 11-column shape (read `{L}/corpus/SOURCES.md` rows S276/S277 for the house style; ids S278, S279; status `mined`; used-by `corpus/knowledge/sources-check-cell-trim-class.md`; tier A spec/dataset); validate the draft in a scratch copy of the lane corpus with `bash {CENSUS} validate --file <copy>/corpus/SOURCES.md --today 2026-11-07` (exit 0 expected).
# Acceptance
`row.md` (draft rows), `quotes.md` (URL, date, HTTP status, sha256, every quote with location and `wc -w`), `census.txt`.""")

item('K99ScribeLesson', 'scribe', f"""# Target
Draft the knowledge entry and lesson rows. Writable: `{R}/K99ScribeLesson/` only.
# Change
1. Read `{R}/plan.md`, `{L}/corpus/knowledge/round-gate-row-id-class.md` (house style, r98) and `{L}/corpus/QUALITY.md` Q90-Q92. Draft `knowledge-sources-check-cell-trim-class.md`: provenance trio first (`source:` S276, S277, S278 (Unicode PropList, opened this round), S279 if the POSIX shell row lands; `verified-at:` the freeze commit `{FREEZE}`; `recheck:` the counter command), then: the three classes (JS trim / POSIX blank / Unicode White_Space) with a code-point table built FROM the counter's PADS list (`{R}/probe/probe99-c1.mjs` lines 46-56) marking which class strips each; what R99 changes per finding kind; the census-internal inconsistency (row_pass `[ \\t]` vs usedby_findings `trim_cell` `[[:space:]]`) as a disclosed limit; every count with its command.
2. Draft `lesson-draft.md`: `## Mistakes` rows (class · evidence pointer · captured-by · fix): M99-1 = the r98 read-order defect (`{L}/corpus/lessons/round-98.md` § Conformance correction) fixed by `{R}/open/read-order.log` + `{R}/probe/read-order-check.py` whose red receipts are `{R}/open/read-order-red.txt`; plus one more mistake you find in r98/r99 evidence (or the sweep that found none). Draft `Q93` in the Q90-Q92 shape: a frozen plan's load statement is a timestamped read-order log checked against the freeze commit (rule, grounding, command, shown able to fail, limit).
# Acceptance
`knowledge-sources-check-cell-trim-class.md`, `lesson-draft.md` (Mistakes rows + Q93 draft), every count with its command.""")

item('K99Scout', 'scout', f"""# Target
Fleet survey of registry cell pads and lane trim readers (read-only). Writable: `{R}/K99Scout/` only.
# Change
1. In all 21 `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md` (current) and every committed revision of `{L}/corpus/SOURCES.md`, count Registry rows where ANY of the 11 cells has, at either edge, a character that JS `trim()` strips but `[ \\t]` does not (VT, FF, CR, NBSP, Zs, U+FEFF, LS, PS) -> `pads.txt` with the script you used (expected 0 — say so if not, with lane/row/cell).
2. Inventory every `.trim()`, `\\s` and `[[:space:]]` used to read SOURCES rows or cells in `{L}/scripts/*.mjs` and in `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` -> `readers.txt` (file:line, class, which reader it feeds).
# Acceptance
`K99Scout.md` with commands, outputs, the per-lane table and the reader inventory; scratch removed.""")

item('K99Connector', 'connector', f"""# Target
One cell grammar for the lane after R99 (read-only analysis). Writable: `{R}/K99Connector/` only.
# Change
1. On one counter battery (run the frozen counter on the candidate or ctl-positive with your scratch `--work`; the fixtures are left under `<work>/fixA/` and `<work>/fixB/`), tabulate per finding class agreement: candidate sources-check vs census vs BASE sources-check vs `{L}/scripts/round-gate.mjs` declared rows -> `parity.txt`.
2. Measure the census's own two cell readers: `row_pass` trim `[ \\t]` vs `usedby_findings` `trim_cell` `[[:space:]]` (`{CENSUS}` 531-570) on a fixture whose mined row has a used-by path padded with NBSP, U+2003 and VT, under `LANG=C.UTF-8` and `LANG=C` -> `census-internal.txt` (E11 lines per locale). This is a fleet-script (operator-owned) disagreement: report it, never edit the script.
3. Sibling transfer (report-only): grep sibling lanes' scripts for SOURCES cell readers using `.trim()`/`\\s`/`strip()` -> table with file:line and class.
# Acceptance
`K99Connector.md`: parity table, census-internal measurement per locale, sibling table, each with its command.""")

item('K99Reviewer', 'reviewer', f"""# Target
Exact-rule review of the candidate (READY sha256 in `{R}/K99ExecTool/READY`; else ctl-positive). Writable: `{R}/K99Reviewer/` only.
# Change
1. `diff -u {L}/scripts/sources-check.mjs {CAND}`: list every changed line; confirm production change = the `trim` helper (+ doc comments) only; every call site of `trim` (`grep -n 'trim(' {CAND}`) and what each now reads.
2. Hand-check 20 cases (one row each, fixture lane in your scratch) against the census: pads NBSP/U+2003/VT/CR/U+FEFF/U+200B/TAB/SP-length-8 on id, kind, tier, status, opened, recheck; record tool finding vs census line -> `cases.txt`.
3. Run the frozen counter once on the candidate; run `node {CAND} --selftest`; check `ROW_FIELD_EMPTY` and `MINED_UNUSED` on NBSP-only / U+2003-only cells (behaviour change vs BASE; is it census-consistent? the census has no empty-field code — say what it prints instead).
# Acceptance
`K99Reviewer.md`: edit-point list, call-site table, case table, counter line, selftest line, defect list.""")

item('K99CriticA', 'critic', f"""# Target
Break the frozen counter: wrong candidates that read `C99_C1: HELD`. Writable: `{R}/K99CriticA/` only.
# Change
Construct >= 8 distinct wrong trim/count implementations NOT among the 17 controls in `{R}/controls/` (e.g. strip blank + one extra class the grid omits, blank trim capped at 9+ chars, trim only the first/last N cells, id trimmed twice, counts.rows from census delegation, keying on the fixture title/BOM/line order, a tool that shells out to `{CENSUS}` by absolute path) and score each with the frozen counter (seed printed; replay with `--seed`). For every HELD construction, give the minimal fixture showing it differs from the census -> `minimal-diff.txt`. Note which ones the shipped selftest (READY candidate) would kill.
# Acceptance
`constructions.md` with >= 8 rows: construction, counter line, census differential, selftest kill yes/no; scratch removed.""")

item('K99CriticB', 'critic', f"""# Target
Framing and harm critique of C1 (no lane edits). Writable: `{R}/K99CriticB/` only.
# Change
1. Is R99 a real move or prospective? Measure exposure in real registries (all 21 lanes + kumitate history) and say whether any current finding changes (expected none); argue whether census parity is the right direction (the census is operator-owned and itself inconsistent: `row_pass` `[ \\t]` vs `usedby_findings` `[[:space:]]`).
2. Behaviour changes beyond the claim: NBSP-only cells stop being ROW_FIELD_EMPTY; used-by parts trimmed blank (E11 reads `[[:space:]]`); `counts.rows` population; ROW_OUTSIDE_REGISTRY detail ids. For each: harm, neutral or improvement, with a fixture receipt.
3. Does the do-nothing control (`{R}/controls/ctl-nothing.txt`) fail for the stated reason only? Does any arm of the predicate pass for BASE that should not?
# Acceptance
`K99CriticB.md`: framing verdict with reasons and receipts; behaviour-change table; control audit.""")

item('K99CriticC', 'critic', f"""# Target
Independent differential H99: candidate vs census on fixtures YOU generate (not the counter's generator). Writable: `{R}/K99CriticC/` only.
# Change
Write your own generator (seeded; print the seed) for >= 400 small lane fixtures: random cells padded with code points drawn from the full Unicode White_Space set, Zs, Cf (U+00AD, U+061C, U+180E, U+200B-U+200F, U+2060-U+2064, U+FEFF), C0/C1 controls (except LF), at random lengths 0-10, any of the 11 cells, 12/13/14-field rows, CRLF files, duplicate ids. Compare the candidate (READY, else ctl-positive) `--json` finding sets (ID_FORM, ID_DUPLICATE, ROW_MALFORMED, KIND/TIER/STATUS_ENUM, OPENED_INVALID, RECHECK_INVALID, ROW_OUTSIDE_REGISTRY) per row against census E02/E03/E01/E05/E06/E07/E08/E09/E12 lines; run BASE as the control. Exclude only documented non-trim divergences (symbolic recheck cadences, year 0000, `id`/separator spellings, empty ids, used-by paths) and list each exclusion with its reason.
# Acceptance
`H99.md` with counts (fixtures, rows, agreements, disagreements for candidate and BASE), seed, every candidate disagreement with a minimal fixture; scratch removed.""")

item('K99Mutation', 'mutation-tester', f"""# Target
K2: does the shipped selftest pin R99? Writable: `{R}/K99Mutation/` only.
# Change
Generate >= 20 mutants of the candidate (READY; else wait <= 10 min then ctl-positive): each of the 16 control shapes from `{R}/probe/make-controls99.py` applied to the candidate's trim/id/count lines, plus your own (char class `[ \\t]` -> `[ \\t\\v]`, `+` -> `{{1,2}}`, `^` anchor dropped, `g` flag dropped, trim applied to id only, counts.rows moved, ID_FORM detail id untrimmed, ...). For each run `node <mutant> --selftest` (cap-spawn/cap-run copied beside it; reference unmutated run must PASS first) and record killed/survived and the arm that kills.
# Acceptance
`mutants.md` with >= 20 rows; selftest kill count; survivors named with the arm that should catch them; the reference PASS line.""")

spec = {
    'wave': 'kumitate-r99-w1',
    'reportDir': '.ufo/waves/round-99/w1',
    'maxLanes': 16,
    'context': context,
    'items': items,
}
with open(f'{R}/w1-spec.json', 'w', encoding='utf-8') as f:
    json.dump(spec, f, indent=1)
print(len(items), 'items')
