#!/usr/bin/env python3
"""Build .ufo/waves/round-96/w1-spec.json (kumitate r96, one v1 wave, 11 seats). Usage: build-spec96.py <FREEZE>"""
import json
import sys

L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
R = f'{L}/.ufo/waves/round-96'
FREEZE = sys.argv[1]
SCR = '/fast/scratch/hyaku/kumitate-r96'
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
GOD = ("/skill:godspeed\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n"
       "3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim \u2014 let the frontier walk itself.**\n\n"
       "## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize "
       "what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.\n")
CAND = f'{R}/K96ExecTool/round-gate.mjs'
COUNTER = f'node {R}/probe/probe96-c1.mjs --tool <TOOL> --work {SCR}/<your seat name>/probe --freeze {FREEZE}'
GEN = f'python3 {R}/probe/make-controls96.py {L}/scripts/round-gate.mjs <out dir>'

context = f"""# Goal
Kumitate round 96 (hyaku run 15, attempt 1). ONE claim C1 = operability: the lane gate `{L}/scripts/round-gate.mjs` (contract `kumitate-round-gate-v1`) finds declared upstream commit pins in `corpus/SOURCES.md` (`declaredPins()`, ~line 414). It matches every row-shaped line (`SOURCES_ROW_RE`) wherever it sits, so a row under `## Leads (unopened)`, before the first heading or after a later `#` heading declares its pin, although the fleet census calls it E12 ("row-shaped source outside the ## Registry section", `{CENSUS}` lines 609-624, `row_pass`).
Frozen rule R96: `declaredPins()` walks `sourcesText.split('\\n')` with the census section state: a line matching `^ {{0,3}}##[ \\t]` sets in-Registry to (text after its first `##`, leading 0-3 spaces removed, stripped of leading/trailing SPACES AND TABS ONLY, equals exactly `Registry`) and declares nothing; otherwise a line matching `^ {{0,3}}#[ \\t]` sets in-Registry false and declares nothing; the state starts false. A row-shaped line OUTSIDE declares nothing, gets no field-count check, and its id (`line.split('|')[1]` trimmed) is appended (file order, repeats kept) to `citations.outsideRows`, an array present on EVERY `citations` object (round mode + fail-closed path). Inside, the round-95 rule (13 fields else `malformedRows`; `rejected` status declares nothing) is unchanged. Text mode adds one non-finding line `ROUND_GATE  info  SOURCES_ROWS_OUTSIDE  outside=<n> [<ids>]` only when n > 0. The gate mirrors the CENSUS, not CommonMark: `## Registry ##`, `## Registry\\r` and a `## ` line inside a ``` fence are read as the census reads them.

READ FIRST: `{R}/plan.md` (frozen predicate, kill rules K1-K4, 20 controls). Frozen at lane commit `{FREEZE}`. Counter (FROZEN, never edit): `{R}/probe/probe96-c1.mjs`; run form:
`{COUNTER}`
It clones the lane, builds a clause-battery fixture A (every section clause), a whole-CRLF fixture B, a no-registry fixture, runs the census on the fixtures (its E12/E01 lists must equal the frozen lists), BASE vs <TOOL> over all 79 filed kumitate reports, then the tool's `--selftest`; verdict line `C96_C1: HELD|UNMET a= b= c= d= e= f=` (~45 s). Controls: `{R}/controls/` (`ctl-positive` = L1 reference rule, HELD; 19 others UNMET; `controls/prefreeze-run1/` is the first run, which caught `ctl-defaultin` reaching HELD — fixed before the freeze). Generator: `{GEN}`.
The candidate (once built) lives at `{CAND}`; its builder writes `{R}/K96ExecTool/READY` (one line: sha256 of the candidate) when final. Seats that attack the candidate: do candidate-independent work first, then look for READY; if still absent when that work is done, attack `ctl-positive` (regenerate it with the generator into your scratch) and say so (never wait in a sleep loop longer than 10 minutes total).
Lane root `{L}` is detached; read history with `git -C {L} show <rev>:<path>`.

# Contract
- Read-only on the lane: never write under `{L}/scripts/`, `{L}/corpus/`, `{R}/probe/`, `{R}/controls/`, `{R}/open/`, `{R}/plan.md`, or any other lane file. Write ONLY inside your own seat dir `{R}/<your seat name>/` (create it). Put every receipt and file you cite there, and write your trailer report there.
- Every `Report:` trailer path the validator prints is relative to {L} — write it at {L}/<that path>.
- Scratch: `{SCR}/<your seat name>/`. Create it with `mkdir -p`, pass it explicitly (`TMPDIR=<scratch>`), never use `/tmp` for anything over 50 MB, remove it before you yield (`trap 'rm -rf -- "$S"' EXIT`). A `/tmp` path is never citable evidence.
- Git: fixtures only as `D=$(mktemp -d -p <scratch> fx.XXXXXX) && test -n "$D" && git -C "$D" init -q`, every later git call names `-C "$D"`; verify `git -C "$D" rev-parse --show-toplevel` equals `$D` before the first commit; never pass an empty or unchecked variable to `git -C`. Never run `git commit/add/stash/checkout/reset/push/worktree` or any `jj` command in the lane or the fleet repo; never run a mutating git/jj command outside your fixture.
- Never message `agent://all`. Never edit the fleet repo `/home/vgpnk/Projects/shokunin`, a sibling lane, `MANIFEST.json`, or anything under `/boot`, `/etc`, `/usr`, `/var`; never change host sysctls. Never run `sudo`. Never run anything that could exhaust host memory without `prlimit --as=4294967296` and a `timeout`.
- Tooling: you may install or upgrade tools that help the task — read `/home/vgpnk/.omp/agent/RULES.md` first (official channels only; record tool/version/channel/reason). pacman transactions are PAUSED host-wide: never `pacman -S/-Sy/-Syu/-U/-R`; use `uv tool`, `npx`, or an official binary in `~/.local/bin`.
- Evidence over prose: every claim names the command you ran and the receipt path under your seat dir. An unrun check has not passed. If blocked, say exactly what and what you tried.
- Yield a concise result (<= 25 lines): paths produced, the command outputs that matter, blockers."""

items = []


def item(name, role, body):
    items.append({'name': name, 'role': role, 'prompt': GOD + body})


item('K96ExecTool', 'executor', f"""# Target
Build the production candidate `round-gate.mjs` with frozen rule R96. Writable: `{R}/K96ExecTool/` only.
# Change
1. Copy `{L}/scripts/round-gate.mjs` to `{CAND}` and copy `{L}/scripts/cap-spawn.mjs` and `{L}/scripts/cap-run.mjs` beside it (run aids, not deliverables).
2. Implement R96 in `declaredPins()` and its caller: section state per the Goal (exact census semantics: `[ \\t]`-only trim, so `\\r` is kept; no closing-sequence stripping; no fence awareness; state starts outside); outside rows pushed BEFORE any field-count check; `outsideRows: []` initialised on BOTH `citations` objects (round mode ~line 440 and `failClosed` ~line 732); the caller passes `citations.outsideRows`. Keep the lazy single read. Keep contract id `kumitate-round-gate-v1`. Update the header doc block (rule sentence, `citations.outsideRows`) and add the text-mode info line right after the existing `SOURCES_ROWS_MALFORMED` line (every existing line keeps its exact format).
3. `--selftest`: keep all 89 existing arms passing and add hermetic arms so that EACH of the 18 violating control shapes in `{R}/probe/make-controls96.py` (h3exits, firstonly, closeseq, crlftrim, casefold, anyindent, nospace, fence, defaultin, h1keep, nodisclose, dedupe, sorted, urlonly, countfirst, dropall, nofailclosed, notext) fails at least one new arm. Build fixtures with the existing selftest helpers (`fxCited`, `fxRow`, ... read how the round-95 arms (xv)-(xxii) do it).
4. Score: `{COUNTER.replace('<TOOL>', CAND).replace('<your seat name>', 'K96ExecTool')}` twice -> `score1.txt`, `score2.txt` (each must end `C96_C1: HELD ...`). Save `selftest.txt` (`node {CAND} --selftest`), `sha256.txt`, `diff.txt` (`diff -u {L}/scripts/round-gate.mjs {CAND}`). Then write `{R}/K96ExecTool/READY` with the candidate's sha256 and STOP editing (a later edit must rewrite READY and be named in your yield).
5. Before READY, prove the arms have teeth: apply each of the 18 shapes as a patch to a scratch copy of YOUR candidate (mirror the generator's edits) and record which new arms fail -> `arm-teeth.txt` (every shape killed by >= 1 arm).
# Acceptance
Candidate + READY + receipts; both counter verdict lines quoted; selftest count before/after; arm-teeth table 18/18.""")

item('K96ExecHarm', 'executor', f"""# Target
Harm battery for the round-gate swap (kill rule K3). Writable: `{R}/K96ExecHarm/` only.
# Change
1. Sandbox: `S={SCR}/K96ExecHarm; mkdir -p $S; git clone -q --shared {L} $S/lane`; verify `git -C $S/lane rev-parse --show-toplevel` = `$S/lane`; `git -C $S/lane checkout -q --detach {FREEZE}`.
2. BASE battery in the sandbox (each output + exit code into `base/`): `node scripts/proxy-check.mjs`; `node scripts/readme-map.mjs`; `node scripts/sources-check.mjs`; `node scripts/counter-pins.mjs`; `node scripts/spotcheck-adopt.mjs --check`; `node scripts/round-gate.mjs --tracked --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`; `node scripts/round-gate.mjs --round 95 --json --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`; `{CENSUS} validate --root /home/vgpnk/Projects/shokunin kumitate`. The open-state proxy DRIFT (C2 bookkeeping) is known — see `{R}/open/battery-before.txt`.
3. When `{R}/K96ExecTool/READY` exists, copy the candidate over `$S/lane/scripts/round-gate.mjs` and rerun the battery into `cand/`. Find which tools/files pin round-gate bytes (`grep -rn "round-gate" $S/lane/scripts/*.mjs $S/lane/SCORECARD.md $S/lane/.ufo/pins 2>/dev/null | head`); re-pin `pin.round-gate` in the SANDBOX SCORECARD only to the candidate sha256 and rerun proxy-check -> `cand/proxy-repinned.txt`; list other files carrying the old sha `aba737dc`.
4. Real-registry probe: candidate `--round 93/94/95 --json` against the sandbox: `citations.outsideRows` is `[]`, `malformedRows` `[]`, `declared` unchanged vs BASE.
5. `battery-diff.txt`: per tool BASE vs CAND verdict line + exit; name every difference and whether it is expected pin drift. Remove `$S` before you yield.
# Acceptance
`base/`, `cand/`, `battery-diff.txt`; one line per tool: same/expected-pin/regression.""")

item('K96ScribeSources', 'scribe', f"""# Target
Draft the SOURCES row for round 96. Writable: `{R}/K96ScribeSources/` only.
# Change
1. Read `{L}/corpus/SOURCES.md` header and rows S270-S274 (11 columns `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`; no `|` inside any cell — not even escaped; recheck ISO date, `NNd` or symbolic like `on-release`). Next free id: S275. grep first for an existing row on the URL (`grep -n 'commonmark' {L}/corpus/SOURCES.md`).
2. Open the CommonMark spec 0.31.2 yourself: `https://spec.commonmark.org/0.31.2/` (curl into scratch; record URL, access date 2026-11-07, HTTP status, sha256 of the body). Locate (a) §4.2 ATX headings: the sentence on the opening sequence needing spaces/tabs and the sentence on the optional closing sequence; the 0-3 spaces indentation rule for headings (an example sentence); (b) §4.5 fenced code blocks: the sentence that the content of a code fence is literal text.
3. ONE row (one URL, scope covering §4.2 + §4.5) with: a located quote of <= 25 words copied byte-exact with its section anchor; COUNT ITS WORDS with `printf '%s' "<quote>" | wc -w` and paste the command output; `used-by` = `corpus/knowledge/round-gate-registry-section.md`; status `mined`; recheck `on-release`; teaches = where the census section rule agrees with CommonMark (space/tab after `##`, 0-3 space indent) and where it deliberately differs (closing sequence kept in the text, fences ignored, `\\r` not stripped).
4. Validate: copy `{L}/corpus/` to scratch, append your row, create an empty file at the used-by path in the copy, run `{CENSUS} validate --file <scratch>/corpus/SOURCES.md` -> must exit 0; save output. Also `awk -F'|' '/^ {{0,3}}\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ && NF!=13' <copy>` -> must print nothing.
# Acceptance
`row.md` (draft row), `quotes.md` (URL, date, status, sha256, every quote with location and wc -w output), `census.txt`.""")

item('K96ScribeLesson', 'scribe', f"""# Target
Draft the round-96 knowledge entry and the mined-mistake counter (Q90). Writable: `{R}/K96ScribeLesson/` only.
# Change
1. Read `{L}/corpus/lessons/round-95.md` (format, `## Gate`, `### Rows touched`, `## Mistakes`), `{L}/corpus/lessons/round-95-verifier-spotcheck.md` (§5 items 1-3), `{R}/plan.md`, `{L}/corpus/QUALITY.md` (Q85-Q89), `{L}/corpus/knowledge/round-gate-registry-shape.md` (entry format, frontmatter `source:`/`verified-at:`).
2. Draft `knowledge-round-gate-registry-section.md`: rule R96 (census section state), why the census and not CommonMark (one authority per file: the census and the lane `sources-check.mjs` both refuse outside rows; a CommonMark-aware gate would trust rows the census calls E12), the clause battery and the 20 pre-data controls (incl. the pre-freeze catch: `ctl-defaultin` reached HELD on the first counter because fixture A opened with a `#` heading — `{R}/controls/prefreeze-run1/ctl-defaultin.txt`), limits (0 real outside rows; whole-CRLF registries declare nothing, the fail-closed direction the census also takes). Frontmatter `source:` with placeholder `S275` + the r95/r94 ids it builds on; `verified-at:` left as `<M>` for the L1 (it must name the revision whose bytes the entry describes — r95 spot-check routed item 3).
3. Mined mistake M96-1: the round-95 lesson `## Gate` admitted S273/S274 without their URLs (r95 spot-check §5 item 1). Write ONE shell or node one-liner (no new file under `scripts/`) that reads a lesson file, takes every id on its `### Rows touched` `New:` line(s), looks each id up in `{L}/corpus/SOURCES.md` (column 2 holds the URL), and prints `MISSING_URL <id> <url>` for each whose URL (scheme+host+path, fragment ignored) does not appear in the lesson text; exit 1 if any, `LESSON_URLS: CLEAN new=<n>` exit 0 otherwise (and `LESSON_URLS: NONE` exit 0 when the lesson lists no new row). Show it FAILING on `{L}/corpus/lessons/round-95.md` (expect S273, S274) and PASSING on at least two earlier lessons whose new rows do carry URLs (find them). Save the command in `lesson-urls-cmd.txt`, receipts under `receipts/`. Draft the `## Mistakes` row (class · evidence pointer · captured-by · fix) and a QUALITY criterion Q90 whose check is that command.
# Acceptance
`knowledge-round-gate-registry-section.md`, `lesson-draft.md` (Mistakes row + Q90 draft), `lesson-urls-cmd.txt`, receipts.""")

item('K96Scout', 'scout', f"""# Target
Survey real registry section shapes and section-blind parsers. Writable: `{R}/K96Scout/` only (write `K96Scout.md` there; that file is your trailer).
# Change
1. Every lane's registry (read-only): for each `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md` list its `#`/`##` headings (with line numbers) and count row-shaped lines (`^ {{0,3}}\\|[[:space:]]*S[0-9]{{3,}}`) per section; flag any lane with a row-shaped line outside `## Registry` by the census rule, any `## Registry` variant (closing `#`s, case, trailing `\\r`, tab), any ``` fence containing a `#` line, any CRLF file. Table per lane.
2. kumitate history: across `git -C {L} log --format=%H -- corpus/SOURCES.md` (all revisions) count outside row-shaped lines per revision by the census rule; report first/last revisions with any, and the ids.
3. Which `{L}/scripts/*.mjs` tools read SOURCES rows, and does each apply section membership (`grep -n "SOURCES" {L}/scripts/*.mjs`, then read)? One line each with line numbers — follow-up candidates, not this round's claim.
4. Open `https://spec.commonmark.org/0.31.2/#atx-headings` and note (quote <= 25 words, wc -w) one sentence that shows a closing sequence is NOT part of the heading text. Record HTTP status and sha256.
# Acceptance
`K96Scout.md` with commands, outputs, quotes; scratch removed.""")

item('K96Connector', 'connector', f"""# Target
Parser parity: three section parsers on one registry file. Writable: `{R}/K96Connector/` only.
# Change
1. Three parsers decide "outside Registry": (i) census gawk `row_pass` (`{CENSUS}` lines 606-624; the R96 authority), (ii) census bash `usedby_findings` (lines 538-571; `[[:space:]]` in its heading regex), (iii) the lane's `{L}/scripts/sources-check.mjs` (`ROW_OUTSIDE_REGISTRY`, `sectionAtLine`, ~lines 60, 232, 517). Quote the deciding lines of each.
2. Build the counter's fixture A and B text in scratch (copy the `FA`/`FB` construction from `{R}/probe/probe96-c1.mjs` into a small node script that writes the two files) and run each parser on them: (i) `{CENSUS} validate --file <f>` E12 ids; (ii) used-by findings (craft rows with `used-by` paths so E11 shows which rows the bash pass treats as inside); (iii) `node {L}/scripts/sources-check.mjs` against a scratch lane copy whose `corpus/SOURCES.md` is the fixture (read its flags; record exactly what you ran). Table: clause row -> parser (i)/(ii)/(iii) inside/outside.
3. Every disagreement is a finding (parser, clause, line). These are routed follow-ups (fleet census → operator; lane sources-check → next kumitate round), never edited.
4. Sibling transfer: `grep -ln "SOURCES.md" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/* 2>/dev/null` — which tools read SOURCES rows with no section check? One line per tool (lane, file:line). Reported, never edited.
# Acceptance
`K96Connector.md`: parity table, disagreement list, sibling transfer table, each with the command used.""")

item('K96Reviewer', 'reviewer', f"""# Target
Review the candidate against frozen rule R96 by hand. Writable: `{R}/K96Reviewer/` only.
# Change
1. Candidate-independent first: read `declaredPins()`, `runChecks`, `failClosed` and the text renderer in `{L}/scripts/round-gate.mjs`; list the exact edit points R96 needs. Hand-check the frozen counter `{R}/probe/probe96-c1.mjs` fixture A: for each line compute the census section state and the expected verdict; confirm EXP_DECL_A / EXP_OUT_A / EXP_MALF_A and FIX-B by hand.
2. When READY exists: read `{R}/K96ExecTool/diff.txt` line by line. Check: section test before the field-count test; `[ \\t]`-only trim (not `.trim()`); heading regexes exactly `^ {{0,3}}##[ \\t]` / `^ {{0,3}}#[ \\t]`; state starts false; id is field 1 trimmed; file order with repeats; laziness unchanged; `outsideRows` on every `citations` object; text line format and placement; header doc accuracy; each new selftest arm asserts what its name says. Run the counter once on the candidate -> `score.txt`.
3. Defects as blocker / non-blocker with line numbers.
# Acceptance
`K96Reviewer.md`: edit-point list, fixture hand-check, defect list, counter verdict line.""")

item('K96CriticA', 'critic', f"""# Target
Attack the frozen counter: can a wrong tool reach HELD? Writable: `{R}/K96CriticA/` only.
# Change
1. Read `{R}/probe/probe96-c1.mjs`, `{R}/plan.md` and the 20 controls (`{R}/controls/`). Build >= 8 NEW wrong-but-plausible gates (not one of the 18 control shapes) as patched copies of the BASE or of `ctl-positive` (generator: `{GEN}`), each beside copies of `cap-spawn.mjs`/`cap-run.mjs`, violating R96 in ways the counter might miss. Ideas: section text compared with `startsWith('Registry')`; `## Registry` matched anywhere in the line; a heading inside the registry only switches when followed by a blank line; outside ids taken from field 2; rows after the LAST `## Registry` only; `outsideRows` capped at 10; hardcoded fixture ids; `\\s` instead of `[ \\t]` in the heading regex (does `##\\vRegistry` matter?); a 3-space-indented heading rejected; outside rows with `rejected` status skipped from the list; the fail-closed key present only when `--json`.
2. Score each with the counter run form; table in `constructions.md` (construction, R96 clause violated, counter verdict). A construction reaching HELD while violating R96 is a COUNTER finding (it does not change the frozen verdict; routed and reported).
3. Re-run the do-nothing control yourself once (tool = `{L}/scripts/round-gate.mjs`) and confirm UNMET for the right reason.
# Acceptance
`constructions.md` with >= 8 rows and verdicts; scratch removed.""")

item('K96CriticB', 'critic', f"""# Target
Attack the claim's framing and harm surface. Writable: `{R}/K96CriticB/` only.
# Change
1. Real move or busywork? The real registry has 0 outside rows; the census and the lane `sources-check.mjs` already flag E12. When do census / sources-check / round-gate run (read `{L}/SKILL.md` checklist lines naming each)? Can a round be filed with a registry the census refuses while round-gate reads it green? Build the case in scratch (copy of `{L}/corpus/SOURCES.md` with one real row moved under `## Leads (unopened)`) and measure BASE vs `ctl-positive` (or the candidate when READY) on a filed report that cites that row's pin if one exists (find one: `grep` reports for 7-40 hex tokens that appear in SOURCES URLs). Verdict sound / weak / unsound with receipts.
2. Is mirroring the census (not CommonMark) right? Argue the CRLF case: a whole-CRLF registry now declares nothing (FIX-B). Does any real path produce CRLF registries (git `core.autocrlf` on this host/lane? `git -C {L} config --get core.autocrlf`; the Windows-host rounds 70-73)? Receipts.
3. Harm: when READY exists, diff `--json` outputs BASE vs candidate on 6 rounds (`node <tool> --round N --json --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`) and list any change other than the added `outsideRows` key; grep `{L}/scripts/` for consumers of round-gate JSON (`citations`).
# Acceptance
`K96CriticB.md`: framing verdict with reasons and receipts; CRLF finding; harm diff table.""")

item('K96Mutation', 'mutation-tester', f"""# Target
Mutation-test the candidate's NEW code (kill rule K2). Writable: `{R}/K96Mutation/` only.
# Change
1. When `{R}/K96ExecTool/READY` exists (look after reading the plan and the counter; at most 10 minutes of waiting total; if absent, mutate `ctl-positive` regenerated via the generator and say so), copy the candidate into scratch beside copies of `{L}/scripts/cap-spawn.mjs` and `cap-run.mjs`.
2. Apply >= 20 single-point mutants inside the new/changed lines (`diff -u {L}/scripts/round-gate.mjs <candidate>`): the 18 control shapes of `{R}/probe/make-controls96.py` applied to the candidate's own code, plus boundary mutants (`{{0,3}}` -> `{{0,4}}`, `[ \\t]` -> `\\s`, `=== 'Registry'` -> `!==`, initial state flipped, `push` -> `unshift`, id `fields[2]`, outside check moved after the `rejected` check).
3. For each mutant run `node <mutant> --selftest` (exit + failing arm names) AND the counter run form. Status: KILLED-by-selftest / KILLED-by-counter-only / SURVIVED / EQUIVALENT (argue). Table -> `mutants.md`, receipts under `runs/`.
# Acceptance
`mutants.md` with >= 20 rows; selftest kill count; survivors named with the arm that should catch them.""")

item('K96CriticC', 'critic', f"""# Target
(Seat planned as `labrat`; the validator refuses that role, so this differential rides a critic seat.) Hypothesis H96 (falsifiable): on every historical revision of `{L}/corpus/SOURCES.md` and on every sibling lane's current registry, the R96 rule's outside-id list equals the census E12 id list, and its declared pin set equals the BASE declared set wherever the census reports no E12. Writable: `{R}/K96CriticC/` only.
# Change
1. Extract the rule as a pure function: copy `declaredPins()` + its regex constants from `ctl-positive` (generator `{GEN}` into scratch) — or from `{CAND}` once READY, and say which — into a small node harness that, given a SOURCES file, prints declared pins and outside ids; do the same for BASE (`{L}/scripts/round-gate.mjs`).
2. Run over every revision (`git -C {L} log --format=%H -- corpus/SOURCES.md`, `git show <rev>:corpus/SOURCES.md` into scratch) and every `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md`; for each file run `{CENSUS} validate --file <f>` and compare E12 ids with the harness outside ids; compare declared sets R96 vs BASE.
3. Also 300 random mutations of the current kumitate registry (seeded; insert/move headings `## X`, `# X`, `### X`, `## Registry ##`, `## registry`, CRLF lines, fences; move rows between sections) and compare harness outside ids vs census E12 on each.
4. Verdict: H96 SURVIVES or FALSIFIED with the smallest counterexample file saved.
# Acceptance
`H96.md` with counts (files, agreements, disagreements), seed, counterexample if any; scratch removed.""")

spec = {
    'wave': 'kumitate-r96-w1',
    'reportDir': '.ufo/waves/round-96/w1',
    'maxLanes': 16,
    'context': context,
    'items': items,
}
with open(f'{R}/w1-spec.json', 'w', encoding='utf-8') as f:
    json.dump(spec, f, indent=1)
print(len(items), 'items')
