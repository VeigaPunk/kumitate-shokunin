#!/usr/bin/env python3
"""Build .ufo/waves/round-100/w1-spec.json (kumitate r100, one v1 wave, 12 seats). Usage: build-spec100.py <FREEZE>"""
import json
import sys

L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
R = f'{L}/.ufo/waves/round-100'
FREEZE = sys.argv[1]
BASE_REV = '5e2f9856271525760ade3b08892f6df7601fa689'
SCR = '/fast/scratch/hyaku/kumitate-r100'
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
GOD = ("/skill:godspeed\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n"
       "3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim \u2014 let the frontier walk itself.**\n\n"
       "## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize "
       "what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.\n")
CC = f'{R}/K100ExecTool/cite-sources.mjs'
CP = f'{R}/K100ExecTool/source-capture.mjs'
COUNTER = f'node {R}/probe/probe100-c1.mjs --cite <CITE> --capture <CAPTURE> --work {SCR}/<your seat name>/probe'
GEN = f'python3 {R}/probe/make-controls100.py <out dir>'
SHAPES = ('nothing (BASE), k99, citeonly, captureonly, indent-blank, indent4, spaceonly, nbsp, leadjs, trailjs, padcap3, '
          'noanchor, unicode-digits, ci, splitany')

context = f"""# Goal
Kumitate round 100 (hyaku run 15, attempt 1). ONE claim C1 = operability: the lane's two remaining JS `\\s` SOURCES row readers recognise a registry row id exactly as the fleet census `row_pass` does (`{CENSUS}` lines 574-695).
- `{L}/scripts/cite-sources.mjs:36` `line.match(/^ {{0,3}}\\|\\s*(S[0-9]{{3,}})\\s*\\|/)`: the id-cell pad is JS `\\s` (NBSP, every Zs, VT, FF, CR, U+FEFF, U+2028/U+2029), which the census does not trim (E02).
- `{L}/scripts/source-capture.mjs:157` `raw.matchAll(/^\\s*\\|\\s*(S[0-9]{{3,}})\\s*\\|/gm)`: additionally `^\\s*` accepts any JS white-space indent (TAB, NBSP, 4+ SP), and the `m` flag makes `^` match after every ECMAScript line terminator (LF, CR, U+2028, U+2029), so a row following a CR/U+2028 on the same LF record is a row for the tool and not for the census (gawk RS = LF).
Frozen rule R100: both tools recognise a row id as the census does for a 13-field row inside `## Registry`: one LF-delimited record is one line; row gate = 0-3 ASCII SP then `|`; the id cell trimmed of ASCII SP/TAB only; id = `S` + 3+ ASCII digits closed by `|`. Everything else unchanged (verdict lines, exit maps, contract ids, README citation reader, registry JSON rules). L1 reference (`ctl-positive`): cite line 36 `/^ {{0,3}}\\|[ \\t]*(S[0-9]{{3,}})[ \\t]*\\|/`; capture line 157 `for (const m of raw.split('\\n').map((l) => l.match(/^ {{0,3}}\\|[ \\t]*(S[0-9]{{3,}})[ \\t]*\\|/)).filter(Boolean)) {{`.

READ FIRST: `{R}/plan.md` (frozen predicate, kill rules K1-K4, 16 controls with observed verdicts). Frozen at lane commit `{FREEZE}` (base `{BASE_REV}`). Counter (FROZEN, never edit): `{R}/probe/probe100-c1.mjs`; run form:
`{COUNTER}`
It draws a fresh seed every run (`--seed <16hex>` replays): ~135 13-field rows inside `## Registry` (clean, blank pads 0-8, 22 non-blank pad classes x lead/trail/both, indents 0-3 SP vs 15 non-row indents, same-record CR/LS/PS/NEL/VT/FF breaks, CRLF rows, 9 invalid id forms), runs the census live (each row's tier cell is `Z<nonce>`, so every E06 line names its row), then (a) cite-sources per row, (b) source-capture on the whole file, (c) BASE vs candidate on all 21 fleet lane README+SOURCES snapshots, (d) both candidate selftests. Verdict line `C100_C1: HELD|UNMET|SETUP a= b= c= d= ...` (~20 s). Never run more than 2 counters at once. Controls: `{R}/controls/` (receipts) and the generator `{GEN}` (writes `<out>/<ctl>/cite-sources.mjs` + `source-capture.mjs`).
The candidates (once built) live at `{CC}` and `{CP}`; their builder writes `{R}/K100ExecTool/READY` (two lines: sha256 of each candidate) when final. Seats that attack the candidates: do candidate-independent work first, then look for READY; if still absent when that work is done, attack `ctl-positive` (regenerate it with the generator into your scratch) and say so (never wait in a sleep loop longer than 10 minutes total).
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


item('K100ExecTool', 'executor', f"""# Target
Build the production candidates with frozen rule R100. Writable: `{R}/K100ExecTool/` only.
# Change
1. Copy `{L}/scripts/cite-sources.mjs` to `{CC}` and `{L}/scripts/source-capture.mjs` to `{CP}`.
2. Implement R100: cite-sources line 36 -> `/^ {{0,3}}\\|[ \\t]*(S[0-9]{{3,}})[ \\t]*\\|/`; source-capture line 157 -> read one LF record per line (`raw.split('\\n')`) with the same regex (no `m` flag). Add a short doc sentence in each header (row id read as the census `row_pass` reads it: LF records, 0-3 SP indent, SP/TAB id pad, ASCII digits). Everything else byte-identical.
3. `--selftest`: keep every existing case passing (cite 8, capture 13) and add hermetic cases so that EACH control shape in `{R}/probe/make-controls100.py` ({SHAPES}) fails at least one new case of the tool it changes (for cite-only shapes, a cite case; for capture shapes, a capture case). Cases assert exact verdict lines: NBSP / U+2003 / VT / CR / U+FEFF / U+2028 pads on the id are not rows (cite: DRIFT ghost; capture: orphan-exemption); SP/TAB pads of length 1, 4 and 8 are rows; indents of 0-3 SP are rows, 4 SP / TAB / NBSP are not; a row after a CR or U+2028 on the same LF record is not a row; a CRLF row is a row; `S123x`, `s123`, fullwidth digits are not rows.
4. Score: `{COUNTER.replace('<CITE>', CC).replace('<CAPTURE>', CP).replace('<your seat name>', 'K100ExecTool')}` twice -> `score1.txt`, `score2.txt` (each must end `C100_C1: HELD ...`). Save `selftest-cite.txt`, `selftest-capture.txt`, `sha256.txt`, `diff.txt` (`diff -u` against the lane scripts). Then write `{R}/K100ExecTool/READY` (two lines `<sha256>  cite-sources.mjs` / `<sha256>  source-capture.mjs`) and STOP editing (a later edit must rewrite READY and be named in your yield).
5. Before READY, prove the cases have teeth: apply each control shape's line (from the generator) to a scratch copy of YOUR candidate and record which new cases fail -> `arm-teeth.txt` (every shape killed by >= 1 case of the tool it changes).
# Acceptance
Candidates + READY + receipts; both counter verdict lines quoted; selftest counts before/after; arm-teeth table 15/15.""")

item('K100ExecHarm', 'executor', f"""# Target
Harm battery for the two reader swaps (kill rule K3). Writable: `{R}/K100ExecHarm/` only.
# Change
1. `git clone --shared {L}` into your scratch, `git -C <clone> checkout -q {FREEZE}`; run `bash {R}/close/battery.sh <clone> base` -> `base.txt`; copy the candidates (READY, else ctl-positive) over `scripts/cite-sources.mjs` / `scripts/source-capture.mjs` in the clone and rerun -> `cand.txt`; `battery-diff.txt`. Expected: identical except proxy pin lines for the two tools.
2. Every committed revision of `{L}/corpus/SOURCES.md` (`git -C {L} log --format=%H -- corpus/SOURCES.md`): extract that revision's `corpus/SOURCES.md` and `corpus/README.md` and `.ufo/pins/source-captures.json` (where present) and compare BASE vs candidate stdout+exit for cite-sources (`--readme/--sources`) and for source-capture (a reg built from that revision's pin file if present; also an all-ids exemption reg) -> `history.txt` (rev, same|differ, first difference) with counts.
3. Every consumer of the two tools' output in the lane (`grep -rn 'cite-sources\\|source-capture' {L}/scripts {L}/SKILL.md {L}/.ufo/pins`): what each reads and whether R100 can change it -> `consumers.txt`.
# Acceptance
`base.txt`, `cand.txt`, `battery-diff.txt`, `history.txt` (counts same/differ), `consumers.txt`; one line per battery command: same/expected/regression.""")

item('K100ExecSection', 'executor', f"""# Target
Measure what R100 deliberately leaves out (report-only; NOT changed this round). Writable: `{R}/K100ExecSection/` only.
# Change
1. Section scope: build fixtures with id rows outside `## Registry` (before it, in `## Search log`, after a `# ` heading, inside a fenced block, under `### Registry` / `##Registry` / `## Registry\\r` / indented headings). For the BASE tools, the L1 reference (`ctl-positive` from the generator) and the census (`bash {CENSUS} validate --file <f> --today 2026-11-07`, E12 lines), record which ids each treats as rows -> `section.txt` with exact commands.
2. Row shape: 12- and 14-field rows, duplicate ids, a file-start U+FEFF before the first row, an escaped `\\|` in the id cell, an empty id cell — same three readers -> `shape.txt`.
3. For each divergence class, write the minimal fix (diff in your seat dir only) that would bring the tool to census parity, and state whether it changes any of the 21 live lane registries (run it).
# Acceptance
`K100ExecSection.md`: per class a table (census / BASE / reference), fix diffs, live-impact counts — the input for round 101.""")

item('K100ScribeSources', 'scribe', f"""# Target
Draft SOURCES rows for this round. Writable: `{R}/K100ScribeSources/` only.
# Change
1. Open MDN "Input boundary assertion" (`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Input_boundary_assertion`) and MDN "Lexical grammar" (`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar`, § Line terminators) with curl into your scratch; record HTTP status, bytes, sha256 (L1 captures: `{R}/open/l1-open-mdn-*.html`; compare and explain any byte difference, e.g. per-request nonces). Quote <= 25 words each with location (section heading + nearest text): the `m`-flag `^` sentence; the "Only the following Unicode code points are treated as line terminators" sentence + the four code points listed.
2. Retry the GNU gawk manual `https://www.gnu.org/software/gawk/manual/html_node/Records.html` (RS default newline) at most 3 times with `--max-time 60`; if reachable, quote the default-RS sentence; if not, log the failures (unreachable is not a rejection).
3. Draft rows in the lane's 11-column shape (house style: rows S276-S279 of `{L}/corpus/SOURCES.md`; next ids S280, S281[, S282]; status `mined`; used-by `corpus/knowledge/row-id-reader-class.md`; MDN = kind `docs`, tier B (strong secondary to ECMA-262 S276), gawk manual tier A); validate the draft in a scratch copy of the lane corpus with `bash {CENSUS} validate --file <copy>/corpus/SOURCES.md --today 2026-11-07` (exit 0 expected; the used-by path must exist in the copy).
# Acceptance
`row.md` (draft rows), `quotes.md` (URL, date, HTTP status, sha256, every quote with location and `wc -w`), `census.txt`.""")

item('K100ScribeLesson', 'scribe', f"""# Target
Draft the knowledge entry and lesson rows. Writable: `{R}/K100ScribeLesson/` only.
# Change
1. Read `{R}/plan.md`, `{L}/corpus/knowledge/sources-check-cell-trim-class.md` and `round-gate-row-id-class.md` (house style) and `{L}/corpus/QUALITY.md` Q91-Q93. Draft `knowledge-row-id-reader-class.md`: provenance trio first (`source:` S276, S277, S274 and the two MDN rows as S280/S281; `verified-at:` the freeze commit `{FREEZE}`; `recheck:` the counter command), then: the lane's four SOURCES row readers (sources-check, round-gate, cite-sources, source-capture) vs the census row gate, the `m`-flag line-terminator hole (why `/gm` is not a per-line reader), the K99 draft fix that `ctl-k99` shows still wrong, and the out-of-scope classes (section scope, malformed rows) — every count with its command.
2. Draft `lesson-draft.md`: `## Mistakes` rows (class · evidence pointer · captured-by · fix): M100-1 = this round's read order (`{R}/open/read-order.log`: canonical SKILL.md, PROTOCOL-APPENDIX.md and `skill://shokunin` opened after the claim line; run `python3 {L}/.ufo/waves/round-99/probe/read-order-check.py --log {R}/open/read-order.log --freeze {FREEZE}` and paste its output) — captured-by Q93, which runs only at freeze; M100-2 = the counter's first draft let `ctl-indent4` read HELD (the random extra indent space; `{R}/controls/pre-repair/ctl-indent4.txt` vs `{R}/controls/ctl-indent4.txt`), repaired before freeze; plus any further mistake you find in r99/r100 evidence (or the sweep that found none). Draft one QUALITY row Q94 for whichever mistake no criterion caught, with a command that can fail.
# Acceptance
`knowledge-row-id-reader-class.md`, `lesson-draft.md` (Mistakes rows + Q94 draft), every count with its command.""")

item('K100Scout', 'scout', f"""# Target
Fleet survey of SOURCES row readers and live exposure (read-only). Writable: `{R}/K100Scout/` only.
# Change
1. In all 21 `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md` (current) and every committed revision of `{L}/corpus/SOURCES.md`, count (i) lines carrying CR not immediately before LF, U+2028, U+2029 or U+0085 anywhere; (ii) id rows indented with anything but 0-3 ASCII SP; (iii) id cells with a non-blank pad -> `exposure.txt` with the script (expected 0 — say so if not, with lane/line).
2. Inventory every reader of SOURCES row ids in `{L}/scripts/*.mjs` and in sibling lanes' `scripts/` (`/home/vgpnk/Projects/shokunin/*-shokunin/scripts/`), with file:line, the regex/class used, `m`-flag or per-line, and whether it matches the census row gate -> `readers.txt` (report-only; sibling lanes are never edited).
# Acceptance
`K100Scout.md` with commands, outputs, the per-lane table and the reader inventory; scratch removed.""")

item('K100Connector', 'connector', f"""# Target
One row grammar across the lane's readers after R100 (read-only analysis). Writable: `{R}/K100Connector/` only.
# Change
1. On one counter battery (run the frozen counter on the candidates or ctl-positive with your scratch `--work`, then rebuild the same battery file with the same seed by copying the counter's generation logic into your scratch — never edit the counter), tabulate per row class which ids are rows for: the census, `{L}/scripts/sources-check.mjs` (`--json` rows/findings), `{L}/scripts/round-gate.mjs` (its SOURCES_ROW_RE), BASE and candidate cite-sources and source-capture -> `parity.txt`.
2. State, per reader, the remaining differences from the census (section scope, malformed rows, line terminators) and which round owns each (R97 section grammar, R98 row-id class, R99 trim class, R100 readers).
3. Check whether L0 `kumitate | round-99` (fleet `.ufo/l0-questions.md`, used-by path parts) has an answer yet (read-only) and say what that means for this round.
# Acceptance
`K100Connector.md`: parity table, remaining-difference table with owning round, L0 status, each with its command.""")

item('K100Reviewer', 'reviewer', f"""# Target
Exact-rule review of the candidates (READY in `{R}/K100ExecTool/READY`; else ctl-positive). Writable: `{R}/K100Reviewer/` only.
# Change
1. `diff -u` each lane script against its candidate: list every changed line; confirm the production change = the one row reader per tool (+ doc comments); for source-capture, confirm the duplicate-id fail-closed, empty-registry and orphan rules still see the same id set on LF files.
2. Hand-check 20 cases (one small SOURCES fixture each, your scratch) against the census: pads NBSP/U+2003/VT/CR/U+FEFF/U+2028/TAB/SP-length-8, indents 3 SP / 4 SP / TAB / NBSP, a row after CR / U+2028 / NEL on the same record, CRLF row, `S123x`, fullwidth digits; record census verdict vs each candidate -> `cases.txt`.
3. Run the frozen counter once on the candidates; run both `--selftest`s.
# Acceptance
`K100Reviewer.md`: edit-point list, case table, counter line, selftest lines, defect list.""")

item('K100CriticA', 'critic', f"""# Target
Break the frozen counter: wrong candidates that read `C100_C1: HELD`. Writable: `{R}/K100CriticA/` only.
# Change
Construct >= 8 distinct wrong reader implementations NOT among the 16 controls in `{R}/controls/` (e.g. accept a pad class the grid omits, cap indent at 3 chars of any blank, split on CR too but not LS, recognise ids of 3-9 digits only, key on the fixture title / tier cell / `example.invalid` URL, read only the first N rows, delegate to `{CENSUS}` by absolute path, break only on a file > N rows) and score each with the frozen counter (`--work` in your scratch). For each: does it read HELD? would an independent census differential catch it? would the shipped selftests (READY) kill it?
# Acceptance
`constructions.md` with >= 8 rows: construction, counter line, census differential, selftest kill yes/no; scratch removed.""")

item('K100CriticB', 'critic', f"""# Target
Framing and harm critique of C1 (no lane edits). Writable: `{R}/K100CriticB/` only.
# Change
1. Is R100 a real move or prospective? Use the exposure numbers (all 21 lanes + kumitate history) and argue whether census parity is the right direction for each tool (cite-sources answers "is this README id a registry row?"; source-capture "is every row bound?"), given the census is operator-owned and itself reads used-by parts differently (L0 `kumitate | round-99`).
2. Behaviour changes beyond the claim: e.g. a CRLF registry, a registry whose rows are TAB-indented, a README id now a ghost, a capture now orphaned. For each: harm, neutral or improvement, with a fixture receipt.
3. Control audit: does `{R}/controls/ctl-nothing.txt` fail for the stated reasons only? Is any arm (a)-(d) passed by BASE that should not be? Is `(c)` vacuous on today's data, and is that disclosed?
# Acceptance
`K100CriticB.md`: framing verdict with reasons and receipts; behaviour-change table; control audit.""")

item('K100CriticC', 'critic', f"""# Target
Independent differential H100: candidates vs census on fixtures YOU generate (not the counter's generator). Writable: `{R}/K100CriticC/` only.
# Change
Write your own generator (seeded; print the seed) for >= 300 small SOURCES fixtures: rows whose indent, id pads and same-record prefixes are drawn from the full Unicode White_Space set, Zs, Cf (U+00AD, U+061C, U+180E, U+200B-U+200F, U+2060-U+2064, U+FEFF), C0/C1 controls (except LF), lengths 0-10, plus CRLF files and digit forms (ASCII, fullwidth, other Nd). For each fixture compute the census-valid id set (`bash {CENSUS} validate --file <f> --today 2026-11-07`; give rows an invalid tier so each read row prints E06) and compare the candidates' recognised ids (READY, else ctl-positive) and BASE's. Run on two seeds.
# Acceptance
`H100.md` with counts (fixtures, rows, agreements, disagreements for candidates and BASE), seeds, every candidate disagreement with a minimal fixture; scratch removed.""")

item('K100Mutation', 'mutation-tester', f"""# Target
K2: do the shipped selftests pin R100? Writable: `{R}/K100Mutation/` only.
# Change
Generate >= 20 mutants of the candidates (READY; else wait <= 10 min then ctl-positive): each of the 15 violating control shapes from `{R}/probe/make-controls100.py` applied to the candidate's reader lines, plus your own (`[ \\t]` -> `[ \\t\\v]`, `{{0,3}}` -> `{{0,2}}` / `{{1,3}}`, `split('\\n')` -> `split(/\\r?\\n/)` (equivalent? say why), `{{3,}}` -> `{{4,}}`, closing `\\|` dropped, `g`/`m` flags, ...). For each run both candidates' `--selftest` and record killed/survived; for survivors, also run the frozen counter and say whether it catches them; classify equivalent mutants with a reason.
# Acceptance
`mutants.md` with >= 20 rows; selftest kill count; survivors named with the case that should catch them; the reference PASS lines.""")

spec = {
    'wave': 'kumitate-r100-w1',
    'reportDir': '.ufo/waves/round-100/w1',
    'maxLanes': 16,
    'context': context,
    'items': items,
}
with open(f'{R}/w1-spec.json', 'w', encoding='utf-8') as f:
    json.dump(spec, f, indent=1)
print(len(items), 'items')
