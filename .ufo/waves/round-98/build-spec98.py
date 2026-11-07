#!/usr/bin/env python3
"""Build .ufo/waves/round-98/w1-spec.json (kumitate r98, one v1 wave, 12 seats). Usage: build-spec98.py <FREEZE>"""
import json
import sys

L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
R = f'{L}/.ufo/waves/round-98'
FREEZE = sys.argv[1]
BASE_REV = '2f09c674bf650a6af71f8d0f8ace2ccb92c61527'
SCR = '/fast/scratch/hyaku/kumitate-r98'
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
GOD = ("/skill:godspeed\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n"
       "3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim \u2014 let the frontier walk itself.**\n\n"
       "## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize "
       "what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.\n")
CAND = f'{R}/K98ExecTool/round-gate.mjs'
COUNTER = f'node {R}/probe/probe98-c1.mjs --tool <TOOL> --work {SCR}/<your seat name>/probe --freeze {FREEZE}'
GEN = f'python3 {R}/probe/make-controls98.py {L}/scripts/round-gate.mjs <out dir>'
SHAPES = ('spaceonly, asciiws, nbsp, zs, leadonly, trailonly, anyindent, indent4, digits2, casefold, unicodedigit, '
          'insideonly, outsideonly (plus BASE `\\s`)')

context = f"""# Goal
Kumitate round 98 (hyaku run 15, attempt 1). ONE claim C1 = operability: the lane gate `{L}/scripts/round-gate.mjs` recognises a `corpus/SOURCES.md` registry row in `declaredPins()` with `SOURCES_ROW_RE = /^ {{0,3}}\\|\\s*S\\d{{3,}}\\s*\\|/` (line 410): the id cell may be padded with any ECMAScript `\\s` character (VT, FF, CR, NBSP, every Unicode Zs, U+2028/U+2029, U+FEFF). The fleet census `row_pass` (`{CENSUS}` lines 617-642) pads the id cell with `[ \\t]` only (E12 test `^\\|[ \\t]*S[0-9]{{3,}}[ \\t]*\\|` after the 0-3 space indent strip; inside the Registry the id is `$2` trimmed of spaces/tabs, so `|<NBSP>S123 |` is an E02 row). So round-gate declares pins from rows the census refuses and lists outside/malformed rows the census never reads as rows.
Frozen rule R98: in `declaredPins()`, a line is a registry row iff it matches `^ {{0,3}}\\|[ \\t]*S\\d{{3,}}[ \\t]*\\|` (id cell padded with ASCII space and TAB only = POSIX-locale `blank`), on both sides, inside and outside the Registry alike. Everything else unchanged: section state (r96), 13-field rule (r95), `rejected`, URL/pin extraction, `outsideRows`/`malformedRows` ids, text lines, contract.

READ FIRST: `{R}/plan.md` (frozen predicate, kill rules K1-K4, 15 controls). Frozen at lane commit `{FREEZE}` (base `{BASE_REV}`). Counter (FROZEN, never edit): `{R}/probe/probe98-c1.mjs`; run form:
`{COUNTER}`
It draws a fresh seed every run (nonce ids/pins/order; `--seed <16hex>` replays), builds a 386-row battery over 32 id-cell pad classes (ASCII, VT/FF/CR/NEL, every Unicode White_Space class sample, Cf format chars U+180E/200B/200C/200D/2060/FEFF) x lead/trail/both x contexts (Registry 13-field mined, 12-field, rejected; Leads; before any heading) + indents + id forms, runs the census live (DECL from W03, OUT from E12, MALF from E01), compares the tool's `--json` `citations.declared/outsideRows/malformedRows` (LF and CRLF fixtures), its text lines, BASE vs tool over 81 filed kumitate reports, and `--selftest`; verdict line `C98_C1: HELD|UNMET a= b= c= d= e=` (~2 min, CPU heavy: never run more than 2 counters at once). Controls: `{R}/controls/` (`ctl-positive` = L1 reference rule, HELD; others UNMET; `controls/OBSERVED.txt`). Generator: `{GEN}` (writes `ctl-*.mjs` into <out dir>; run each from inside a lane clone's `scripts/` dir or pass it as `--tool` — the counter copies it beside the base gate).
The candidate (once built) lives at `{CAND}`; its builder writes `{R}/K98ExecTool/READY` (one line: sha256 of the candidate) when final. Seats that attack the candidate: do candidate-independent work first, then look for READY; if still absent when that work is done, attack `ctl-positive` (regenerate it with the generator into your scratch) and say so (never wait in a sleep loop longer than 10 minutes total).
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


item('K98ExecTool', 'executor', f"""# Target
Build the production candidate `round-gate.mjs` with frozen rule R98. Writable: `{R}/K98ExecTool/` only.
# Change
1. Copy `{L}/scripts/round-gate.mjs` to `{CAND}` (plus `{L}/scripts/cap-spawn.mjs`/`cap-run.mjs` beside it only if the selftest needs them to run there).
2. Implement R98: `SOURCES_ROW_RE` becomes exactly `/^ {{0,3}}\\|[ \\t]*S\\d{{3,}}[ \\t]*\\|/` and its doc comment says the id cell is padded with ASCII space/TAB only (census `row_pass`, POSIX `blank`); update the header doc paragraph on SOURCES-declared pins (~lines 115-145) with one sentence. Everything else byte-identical.
3. `--selftest`: keep all 94 existing arms passing and add hermetic arms next to the r95/r96 SOURCES arms (~lines 1550-1740; reuse their fixture helpers) so that EACH violating shape in `{R}/probe/make-controls98.py` ({SHAPES}) fails at least one new arm. Arms assert exact `citations.declared`, `outsideRows`, `malformedRows` on small fixtures: NBSP / VT / FF / CR / U+2003 / U+FEFF / U+200B lead and trail pads inside (not declared, not malformed) and outside (not in outsideRows); TAB and SP+TAB pads (declared / listed); a 12-field TAB-padded row (malformed); TAB-indented and 4-space-indented rows (not rows); `| S12 |`, `| s123 |`, Arabic-Indic digit ids (not rows). One arm may compare with the census when `SHOKUNIN_ROOT`/`{CENSUS}` is present but must never be the only arm killing a shape.
4. Score: `{COUNTER.replace('<TOOL>', CAND).replace('<your seat name>', 'K98ExecTool')}` twice -> `score1.txt`, `score2.txt` (each must end `C98_C1: HELD ...`). Save `selftest.txt` (`node {CAND} --selftest`), `sha256.txt`, `diff.txt` (`diff -u {L}/scripts/round-gate.mjs {CAND}`). Then write `{R}/K98ExecTool/READY` with the candidate's sha256 and STOP editing (a later edit must rewrite READY and be named in your yield).
5. Before READY, prove the arms have teeth: apply each shape (the generator's regex/line rewrites) to a scratch copy of YOUR candidate and record which new arms fail -> `arm-teeth.txt` (every shape killed by >= 1 arm, BASE `\\s` too).
# Acceptance
Candidate + READY + receipts; both counter verdict lines quoted; selftest count before/after; arm-teeth table 14/14.""")

item('K98ExecHarm', 'executor', f"""# Target
Harm battery for the round-gate swap (kill rule K3). Writable: `{R}/K98ExecHarm/` only.
# Change
1. Sandbox: `S={SCR}/K98ExecHarm; mkdir -p $S; git clone -q --shared {L} $S/lane`; verify `git -C $S/lane rev-parse --show-toplevel` = `$S/lane`; `git -C $S/lane checkout -q --detach {FREEZE}`.
2. BASE battery in the sandbox: `bash {R}/close/battery.sh $S/lane base > base.txt`. The open-state proxy DRIFT (A_wave/C2 bookkeeping) is known — see `{R}/open/battery-before.txt`.
3. When `{R}/K98ExecTool/READY` exists, copy the candidate over `$S/lane/scripts/round-gate.mjs`, rerun into `cand.txt`. List every consumer that pins round-gate bytes or parses its output (`grep -rn "round-gate" $S/lane/scripts/*.mjs $S/lane/SCORECARD.md $S/lane/SKILL.md $S/lane/.ufo/pins 2>/dev/null | head -60`) and whether the swap changes what it reads. If SCORECARD carries `pin.round-gate`, re-pin it in the SANDBOX only and rerun proxy-check -> `cand-proxy-repinned.txt`.
4. `--json` diff BASE vs candidate for `--tracked` and for every `--round N` (N = each `/home/vgpnk/Projects/shokunin/.ufo/reports/round-N/kumitate.md`, reports read-only, `--main-repo /home/vgpnk/Projects/shokunin`): must be byte-identical except the tool-identity fields if any (name them).
5. `battery-diff.txt`: per tool BASE vs CAND verdict line + exit; name every difference and whether it is expected. Remove `$S` before you yield.
# Acceptance
`base.txt`, `cand.txt`, `battery-diff.txt`, consumer list, per-round json diff count; one line per tool: same/expected/regression.""")

item('K98ExecDebt', 'executor', f"""# Target
Repair r97 closure routed item 2 in a CANDIDATE copy of `sources-check.mjs` (lane hygiene, not the claim). Writable: `{R}/K98ExecDebt/` only.
# Change
1. Read `{L}/corpus/lessons/round-97-verifier-spotcheck.md` §5 item 2: the selftest arm `r97sec-census-parity` (`{L}/scripts/sources-check.mjs` ~lines 793-830) hardcodes `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` first, passes `SHOKUNIN_ROOT` hardcoded, and returns SKIP when no census is found or on census exit outside {{0,1}}, leaving the tally green on such a host.
2. Copy to `{R}/K98ExecDebt/sources-check.mjs`. Change: derive the census path from `process.env.SHOKUNIN_ROOT` (then the `HERE/../../scripts` sibling), never a hardcoded home path; pass the derived root through; a census exit outside {{0,1}} when a census WAS found is a FAIL (not SKIP); SKIP stays only for "no census found" and its SKIP line names the paths tried. Keep every other byte. Also write `skill-row.md`: the replacement text for the `sources-check` row in `{L}/SKILL.md` (line 614) adding one clause that the census-parity arm skips when no census is found.
3. Receipts: `selftest.txt` (`node {R}/K98ExecDebt/sources-check.mjs --selftest`, with `SHOKUNIN_ROOT=/home/vgpnk/Projects/shokunin`), `selftest-noroot.txt` (env without SHOKUNIN_ROOT, run from a scratch copy whose `../../scripts` has no census — expect SKIP on that arm only, PASS overall), `selftest-badcensus.txt` (SHOKUNIN_ROOT pointing at a scratch root whose `scripts/sources-census.sh` is `exit 2` — expect that arm FAIL), `diff.txt`, `sha256.txt`, and the real-lane output identity: `node <candidate> --json --today 2026-11-07` vs the same for `{L}/scripts/sources-check.mjs` run from the lane (`cmp`). Write `{R}/K98ExecDebt/READY` (sha256) when final.
# Acceptance
Candidate + READY; the three selftest receipts show PASS / SKIP-only-that-arm / FAIL-that-arm; real-lane `--json` byte-identical.""")

item('K98ScribeSources', 'scribe', f"""# Target
Draft the SOURCES row for round 98. Writable: `{R}/K98ScribeSources/` only.
# Change
1. Read `{L}/corpus/SOURCES.md` header and rows S272-S276 (11 columns `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`; no `|` inside any cell — not even escaped; recheck ISO date, `NNd` or symbolic like `on-release`). Next free id: S277. grep first: `grep -n 'opengroup' {L}/corpus/SOURCES.md` (S256 realpath and S274 awk exist; this row is a different document).
2. Open POSIX Base Definitions Issue 8, ch. 7 Locale yourself: `https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap07.html` (curl into scratch; record URL, access date, HTTP status, sha256 of the body; the L1 copy is `{R}/close-l1/l1-open-posix-ch07.html`, compare sha256). Locate in §7.3.1 LC_CTYPE (a) the `blank` keyword definition: "In the POSIX locale, only the <space> and <tab> shall be included." (b) the `space` keyword definition listing <space>, <form-feed>, <newline>, <carriage-return>, <tab>, <vertical-tab>. Record each with section and HTML line number.
3. ONE row (one URL) with: a located quote of <= 25 words copied exact (after tag strip, entity decode, whitespace collapse) with its section anchor; COUNT ITS WORDS with `printf '%s' "<quote>" | wc -w` and paste the output; `used-by` = `corpus/knowledge/round-gate-row-id-class.md`; status `mined`; recheck `on-release`; kind `spec`; tier `A`; scope = the id-cell pad class of a registry row; teaches = the census `[ \\t]` is exactly POSIX `blank`, while POSIX `space` (VT FF CR) and ECMAScript `\\s` (S276) are wider, so a row recogniser keyed on either accepts rows the census refuses.
4. Validate: copy `{L}/corpus/` to scratch, append your row inside `## Registry` after S276, create an empty file at the used-by path in the copy, run `{CENSUS} validate --file <scratch>/corpus/SOURCES.md` -> must exit 0 (warnings ok); save output. Also `awk -F'|' '/^ {{0,3}}\\|[ \\t]*S[0-9][0-9][0-9]+[ \\t]*\\|/ && NF!=13' <copy>` -> must print nothing.
# Acceptance
`row.md` (draft row), `quotes.md` (URL, date, status, sha256, every quote with location and wc -w output), `census.txt`.""")

item('K98ScribeLesson', 'scribe', f"""# Target
Draft the round-98 knowledge entry and the mined-mistake row. Writable: `{R}/K98ScribeLesson/` only.
# Change
1. Read `{L}/corpus/lessons/round-97.md` (format: `## Gate`, `### Rows touched`, `## Mistakes`), `{L}/corpus/lessons/round-97-verifier-spotcheck.md` (§5 routed items), `{R}/plan.md`, `{L}/corpus/QUALITY.md` (Q85-Q91), `{L}/corpus/knowledge/round-gate-registry-section.md` and `sources-check-registry-section.md` (entry format, header `source:`/`verified-at:`/`recheck:`).
2. Draft `knowledge-round-gate-row-id-class.md`: rule R98, BASE's `\\s` id-cell class vs the census `[ \\t]` with one example line per departure class (NBSP, VT/FF/CR, Zs like U+2003, U+2028, U+FEFF/U+200B — note JS `\\s` includes U+FEFF but not U+200B/U+180E/NEL; cite the battery receipt `{R}/controls/ctl-nothing.txt` numbers), consequences (a pin declared only by an E02 row; outside/malformed disclosures naming non-rows), why the census class (placeholder `S277` POSIX `blank`, S276 ECMA-262 `\\s`, S274 POSIX awk), that the lane's three registry readers now share one row and section grammar (round-gate r96 section + r98 row; sources-check r97 section + `[ \\t]` row test at its line ~234), the nonce battery and the 15 controls, limits (out-of-scope classes listed in the plan). Header lines `source:`, `verified-at: <M>` (left for the L1), `recheck: on-release`.
3. Mined mistake M98-1 draft (class · evidence pointer · captured-by · fix): the round-97 frozen counter drew only `\\v`, `\\f`, U+00A0 among non-ASCII/odd separators, so six wrong readers reached HELD (`{L}/.ufo/waves/round-97/K97CriticA/constructions.md`, `diverge.txt`; r97 closure §5 item 1); captured-by Q91 (nonce identities) — class completeness not covered; fix = this round's counter draws every Unicode White_Space class and the Cf format characters (`{R}/probe/probe98-c1.mjs` PADS), shown able to fail by `{R}/controls/ctl-zs.txt`, `ctl-nbsp.txt`, `ctl-asciiws.txt` (UNMET). Draft a QUALITY criterion Q92: "a frozen counter over a character-class rule draws every class the opposing reader's class differs on (here Unicode White_Space + Cf + POSIX space), and the plan lists the drawn classes" with its command form (grep the PADS list).
4. Sweep for other mistakes this round: compare `{R}/plan.md` control table with `{R}/controls/OBSERVED.txt`; paste the output.
# Acceptance
`knowledge-round-gate-row-id-class.md`, `lesson-draft.md` (Mistakes row + Q92 draft), receipts.""")

item('K98Scout', 'scout', f"""# Target
Survey real registry id-cell pad classes fleet-wide and every SOURCES row recogniser in this lane. Writable: `{R}/K98Scout/` only (write `K98Scout.md` there; that file is your trailer).
# Change
1. Every lane's registry (read-only): for each `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md` classify every line starting (after 0-3 spaces) with `|` whose first cell contains `S` + digits, by the bytes padding the id cell (ASCII SP/TAB only vs any other whitespace or format char: VT, FF, CR, NBSP, U+2000-200B, U+2028/9, U+202F, U+205F, U+3000, U+FEFF). Count per class per lane; flag every line where BASE `\\s` and census `[ \\t]` disagree. CRLF files?
2. kumitate history: across `git -C {L} log --format=%H -- corpus/SOURCES.md`, count rows with a non-blank pad per revision.
3. Every row recogniser in `{L}/scripts/*.mjs` (`grep -n "S\\\\d{{3" {L}/scripts/*.mjs` and similar): which regex/pad class does each use (`\\s`, `[ \\t]`, ` `)? One line each with line numbers, and whether it differs from the census — follow-up candidates.
4. Open `https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt` and quote the White_Space lines for U+00A0, U+2028 and U+3000 (<= 25 words, wc -w). Record HTTP status and sha256.
# Acceptance
`K98Scout.md` with commands, outputs, quotes; scratch removed.""")

item('K98Connector', 'connector', f"""# Target
One row grammar for the lane: round-gate (candidate) vs sources-check vs census. Writable: `{R}/K98Connector/` only.
# Change
1. Build the counter's battery file in scratch (copy the battery construction from `{R}/probe/probe98-c1.mjs` into a small node script with a fixed `--seed` and write FIX-A and FIX-B), then on each: census W03/E12/E01/E02 ids (`{CENSUS} validate --file F --today 2026-11-07`), `{L}/scripts/sources-check.mjs` (run as `node <it> --self <dir> --today 2026-11-07 --json` where `<dir>` holds `corpus/SOURCES.md` + empty `corpus/knowledge/`) ROW_OUTSIDE_REGISTRY / ROW_MALFORMED / ID_FORM ids, and the candidate round-gate (`{CAND}` once READY, else `ctl-positive` — say which) `citations` lists. Table: fixture -> agree counts per pair (row recognised? inside? valid id?); list every disagreement with its case label.
2. Does sources-check recognise registry rows INSIDE the Registry with the census class (any `^ {{0,3}}\\|` line) or by its own id test? Measure where its `ID_FORM`/row counts differ from census E02/`rows` on the battery (this is r98 pre-registration item 3, `counts.rows` vs census `rows` — measure only).
3. Sibling transfer: `grep -n "S\\\\\\\\d{{3" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/* 2>/dev/null` and similar — which sibling tools recognise SOURCES rows with `\\s` padding instead of `[ \\t]`? One line per tool (lane, file:line). Reported, never edited.
# Acceptance
`K98Connector.md`: parity table, disagreement list, item-2 measurement, sibling transfer table, each with the command used.""")

item('K98Reviewer', 'reviewer', f"""# Target
Review the candidate against frozen rule R98 by hand. Writable: `{R}/K98Reviewer/` only.
# Change
1. Candidate-independent first: read `declaredPins()` and its callers in `{L}/scripts/round-gate.mjs` (~lines 405-520) and the census `row_pass` (`{CENSUS}` lines 573-680); confirm that on every line R98 admits `fields[1].trim()` equals the census `trim($2)`, and that R98 changes nothing for rows inside the Registry whose id cell is invalid to the census (E02) except that they no longer declare pins or list as malformed. Hand-check 20 battery cases from `{R}/probe/probe98-c1.mjs` (pick across pad classes and contexts) against the census grammar and say expected declared/outside/malformed for each; confirm with `{CENSUS} validate --file` on a tiny file per case.
2. When READY exists: read `{R}/K98ExecTool/diff.txt` line by line. Check: the regex exactly `/^ {{0,3}}\\|[ \\t]*S\\d{{3,}}[ \\t]*\\|/` (no `u`/`i` flags, no `\\s` anywhere in the row test); nothing else changed in production code; header doc accurate; each new selftest arm asserts what its name says and would fail without the change. Run the counter once on the candidate -> `score.txt`.
3. Defects as blocker / non-blocker with line numbers.
# Acceptance
`K98Reviewer.md`: edit-point list, case hand-check table, defect list, counter verdict line.""")

item('K98CriticA', 'critic', f"""# Target
Attack the frozen counter: can a wrong tool reach HELD? Writable: `{R}/K98CriticA/` only.
# Change
1. Read `{R}/probe/probe98-c1.mjs`, `{R}/plan.md` and the controls (`{R}/controls/`). Build >= 8 NEW wrong-but-plausible row recognisers (not one of the 14 control shapes) as patched copies of `ctl-positive` (generator: `{GEN}`), violating R98 in ways the counter might miss. Ideas: pads limited to <= 3 chars; `[ \\t]` but only when the line has exactly 13 fields; an exotic pad class the battery never draws (U+0008, U+001F, U+00AD soft hyphen, U+034F, U+115F, U+3164 Hangul filler, U+FFA0); ids >= 8 digits refused; id cell strip of U+200E/U+200F marks; a REPLAY construction that hardcodes one counter run's DECL/OUT/MALF (`--seed X`) and answers them whenever the file has that many lines; a construction keyed on the counter's URL shape `github.com/o/r/blob/`; a tool that declares from rows whose census id is valid only when the report cites <= 400 tokens.
2. Score each with the counter run form (never more than 2 counters at once); table in `constructions.md` (construction, R98 clause violated, counter verdict, and whether the census reads a minimal input differently — show it). A construction reaching HELD while violating R98 is a COUNTER finding (it does not change the frozen verdict; routed and reported).
3. Re-run the do-nothing control yourself once (tool = `{L}/scripts/round-gate.mjs`) and confirm UNMET for the right reason.
# Acceptance
`constructions.md` with >= 8 rows and verdicts; scratch removed.""")

item('K98CriticB', 'critic', f"""# Target
Attack the claim's framing and harm surface. Writable: `{R}/K98CriticB/` only.
# Change
1. Real move or busywork? Do any real registries (every `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md`, kumitate history) carry an id cell padded with a non-blank character? When does round-gate read SOURCES in this lane (only when a cited token fails the lane/main/origin probes — read `{L}/scripts/round-gate.mjs` ~lines 480-520)? Build a scratch lane copy whose registry has one NBSP-padded row carrying a 40-hex pin and a report citing that pin: measure BASE vs candidate (`{CAND}` once READY, else `ctl-positive`) vs census — which reads green while the other refuses? Verdict sound / weak / unsound with receipts.
2. Is refusing such a row the right direction? Argue from the census E02 and CORPUS.md (`/home/vgpnk/Projects/shokunin/CORPUS.md` SOURCES contract): could a lane legitimately need a non-blank pad? Does any editor or markdown formatter in use emit NBSP in table cells (check `git -C {L} log -S$'\\u00a0' --oneline -- corpus/SOURCES.md | head`)?
3. Harm: diff `--json` outputs BASE vs candidate on `--tracked` and three `--round N` reports; grep `{L}/scripts/` for consumers of round-gate output; list any change.
# Acceptance
`K98CriticB.md`: framing verdict with reasons and receipts; direction argument; harm diff table.""")

item('K98Mutation', 'mutation-tester', f"""# Target
Mutation-test the candidate's NEW code (kill rule K2). Writable: `{R}/K98Mutation/` only.
# Change
1. When `{R}/K98ExecTool/READY` exists (look after reading the plan and the counter; at most 10 minutes of waiting total; if absent, mutate `ctl-positive` regenerated via the generator and say so), copy the candidate into scratch.
2. Apply >= 20 single-point mutants to the row test and to the new selftest arms' subject (`diff -u {L}/scripts/round-gate.mjs <candidate>`): the 13 shapes of `{R}/probe/make-controls98.py` applied to the candidate's own code plus BASE `\\s`, and boundary mutants (`{{0,3}}` -> `{{0,2}}`, `\\d{{3,}}` -> `\\d{{4,}}`, `[ \\t]*` -> `[ \\t]?`, `[ \\t]*` -> `[ \\t]+`, `\\|` anchor dropped on the right, `^` anchor dropped, `inReg` negated on the test line, `fields[1].trim()` -> `fields[1]`).
3. For each mutant run `node <mutant> --selftest` (exit + failing arm names) AND, for selftest survivors only, the counter run form. Status: KILLED-by-selftest / KILLED-by-counter-only / SURVIVED / EQUIVALENT (argue). Table -> `mutants.md`, receipts under `runs/`.
# Acceptance
`mutants.md` with >= 20 rows; selftest kill count; survivors named with the arm that should catch them.""")

item('K98CriticC', 'critic', f"""# Target
Hypothesis H98 (falsifiable): on every historical revision of `{L}/corpus/SOURCES.md`, on every sibling lane's current registry, and on 300 seeded random mutations of the kumitate registry, the candidate's declared-pin rows, `outsideRows` and `malformedRows` equal the census-derived DECL/OUT/MALF (W03 valid ids that are mined / E12 ids / E01 valid ids — the plan's definitions). Writable: `{R}/K98CriticC/` only.
# Change
1. Tool: `{CAND}` once READY, else `ctl-positive` regenerated with `{GEN}` — say which. Harness: extract `declaredPins()` and its regex constants from the tool bytes into a node harness (record exactly how; check equivalence on 3 files against a full `--json` run with a report citing every pin), or run the full gate per file with a report citing a token per row.
2. Run over every revision (`git -C {L} log --format=%H -- corpus/SOURCES.md`, `git -C {L} show <rev>:corpus/SOURCES.md` into scratch) and every `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md`; for each file run `{CENSUS} validate --file <f> --today 2026-11-07` and compare (note: W03 needs used-by `—`; for real registries compare outside ids with E12 and malformed ids with valid-id E01, and declared rows with census-valid inside 13-field non-rejected rows that carry a 40-hex URL segment — state your attribution method).
3. 300 seeded random mutations of the current kumitate registry (replace id-cell pads with draws from SP, TAB, NBSP, VT, FF, CR, U+2003, U+2028, U+FEFF, U+200B, U+3000, NEL; indent 0-4 spaces/TAB; drop a cell; move rows between `## Registry` and `## Leads`) and compare on each. Do the same for BASE (`{L}/scripts/round-gate.mjs`) and report its disagreement count as the control.
4. Verdict: H98 SURVIVES or FALSIFIED with the smallest counterexample file saved.
# Acceptance
`H98.md` with counts (files, agreements, disagreements, BASE control), seed, counterexample if any; scratch removed.""")

spec = {
    'wave': 'kumitate-r98-w1',
    'reportDir': '.ufo/waves/round-98/w1',
    'maxLanes': 16,
    'context': context,
    'items': items,
}
with open(f'{R}/w1-spec.json', 'w', encoding='utf-8') as f:
    json.dump(spec, f, indent=1)
print(len(items), 'items')
