#!/usr/bin/env python3
"""Build .ufo/waves/round-97/w1-spec.json (kumitate r97, one v1 wave, 11 seats). Usage: build-spec97.py <FREEZE>"""
import json
import sys

L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
R = f'{L}/.ufo/waves/round-97'
FREEZE = sys.argv[1]
BASE_REV = '477afff790787cd2ce48ccf976afafcb5aef0cbc'
SCR = '/fast/scratch/hyaku/kumitate-r97'
CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
GOD = ("/skill:godspeed\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n"
       "3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim \u2014 let the frontier walk itself.**\n\n"
       "## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize "
       "what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.\n")
CAND = f'{R}/K97ExecTool/sources-check.mjs'
COUNTER = f'node {R}/probe/probe97-c1.mjs --tool <TOOL> --work {SCR}/<your seat name>/probe --freeze {FREEZE} --rev {FREEZE}'
GEN = f'python3 {R}/probe/make-controls97.py {L}/scripts/sources-check.mjs <out dir>'
SHAPES = ('crlfstrip, spaceonly, wsclass, jstrim, trailcr, nbsp, h1loose, h1keep, emptyhead, anyindent, casefold, '
          'closeseq, h3heading, defaultin, nodisclose')

context = f"""# Goal
Kumitate round 97 (hyaku run 15, attempt 1). ONE claim C1 = operability: the lane gate `{L}/scripts/sources-check.mjs` (contract `kumitate-sources-v1`) decides which `corpus/SOURCES.md` rows are inside `## Registry` with its own reader (`runCheck`, lines 191-208): it splits on `/\\r?\\n/` (so `## Registry\\r` reads as Registry), its heading regex `^## (.+?)\\s*$` wants a literal space (so `##<TAB>Registry` is no heading and `##  Registry` keeps a leading space), it trims with `\\s` (VT, FF, NBSP, CR) and `^#(?:\\s|$)` clears on a bare `#`. The fleet census `row_pass` (`{CENSUS}` lines 609-624) reads each of these differently, so the lane gate can read green a registry the census refuses (E12) and the reverse.
Frozen rule R97: `runCheck` computes the section state from `sourceText.split('\\n')` (CR KEPT), not from the CR-stripped lines: a line matching `^ {{0,3}}##[ \\t]` sets the active section to the text after its first `##` (leading 0-3 spaces removed), stripped of leading/trailing SPACES AND TABS ONLY (`\\r`, VT, FF, NBSP kept), and records that text as a seen heading; otherwise a line matching `^ {{0,3}}#[ \\t]` clears the section; every other line keeps it; the state starts with no section. Inside the Registry iff the section text equals exactly `Registry`. Row detection, `ROW_OUTSIDE_REGISTRY` (one finding per E12-shaped outside line, line order) and every per-row check stay as at base (rows keep their CR-stripped bytes). `SECTION_MISSING` reads the headings recorded by the same rule. Contract id unchanged. Mirror the census, not CommonMark: no closing-sequence strip, no fence awareness.

READ FIRST: `{R}/plan.md` (frozen predicate, kill rules K1-K4, 17 controls). Frozen at lane commit `{FREEZE}` (base `{BASE_REV}`). Counter (FROZEN, never edit): `{R}/probe/probe97-c1.mjs`; run form:
`{COUNTER}`
It draws a fresh seed every run (nonce ids/URLs/order; `--seed <hex>` replays), builds a 19 459-case battery from the census grammar's character classes (LF, whole-CRLF, mixed-CRLF fixtures), runs the census live on each, compares the tool's `--json` ROW_OUTSIDE_REGISTRY ids + `counts.rows` with census E12 ids + `rows`, then BASE vs tool on the lane, every historical SOURCES blob, and the tool's `--selftest`; verdict line `C97_C1: HELD|UNMET a= b= c= d= e= f=` (~2-3 min). Controls: `{R}/controls/` (`ctl-positive` = L1 reference rule, HELD; 16 others UNMET). Generator: `{GEN}` (writes `ctl-*.mjs` into <out dir>; run each beside copies of `{L}/scripts/cap-spawn.mjs` and `cap-run.mjs`).
The candidate (once built) lives at `{CAND}`; its builder writes `{R}/K97ExecTool/READY` (one line: sha256 of the candidate) when final. Seats that attack the candidate: do candidate-independent work first, then look for READY; if still absent when that work is done, attack `ctl-positive` (regenerate it with the generator into your scratch) and say so (never wait in a sleep loop longer than 10 minutes total).
Lane root `{L}` is detached; read history with `git -C {L} show <rev>:<path>`.

# Contract
- Read-only on the lane: never write under `{L}/scripts/`, `{L}/corpus/`, `{R}/probe/`, `{R}/controls/`, `{R}/open/`, `{R}/plan.md`, or any other lane file. Write ONLY inside your own seat dir `{R}/<your seat name>/` (create it). Put every receipt and file you cite there, and write your trailer report there.
- Every `Report:` trailer path the validator prints is relative to {L} — write it at {L}/<that path>.
- Scratch: `{SCR}/<your seat name>/`. Create it with `mkdir -p`, pass it explicitly (`TMPDIR=<scratch>`), never use `/tmp` for anything over 50 MB, remove it before you yield (`trap 'rm -rf -- "$S"' EXIT`). A `/tmp` path is never citable evidence.
- Git: fixtures only as `D=$(mktemp -d -p <scratch> fx.XXXXXX) && test -n "$D" && git -C "$D" init -q`, every later git call names `-C "$D"`; verify `git -C "$D" rev-parse --show-toplevel` equals `$D` before the first commit; never pass an empty or unchecked variable to `git -C`. Never run `git commit/add/stash/checkout/reset/push/worktree` or any `jj` command in the lane or the fleet repo; never run a mutating git/jj command outside your fixture.
- Never message `agent://all`. Never edit the fleet repo `/home/vgpnk/Projects/shokunin`, a sibling lane, `MANIFEST.json`, or anything under `/boot`, `/etc`, `/usr`, `/var`; never change host sysctls. Never run `sudo`. Never run anything that could exhaust host memory without `prlimit --as=4294967296` and a `timeout`.
- Tooling: you and every seat may install or upgrade tools that help the task — read `/home/vgpnk/.omp/agent/RULES.md` first (official channels only; record tool/version/channel/reason). pacman transactions are PAUSED host-wide: never `pacman -S/-Sy/-Syu/-U/-R`; use `uv tool`, `npx`, or an official binary in `~/.local/bin`.
- Evidence over prose: every claim names the command you ran and the receipt path under your seat dir. An unrun check has not passed. If blocked, say exactly what and what you tried.
- Yield a concise result (<= 25 lines): paths produced, the command outputs that matter, blockers."""

items = []


def item(name, role, body):
    items.append({'name': name, 'role': role, 'prompt': GOD + body})


item('K97ExecTool', 'executor', f"""# Target
Build the production candidate `sources-check.mjs` with frozen rule R97. Writable: `{R}/K97ExecTool/` only.
# Change
1. Copy `{L}/scripts/sources-check.mjs` to `{CAND}` and copy `{L}/scripts/cap-spawn.mjs` and `{L}/scripts/cap-run.mjs` beside it (run aids, not deliverables).
2. Implement R97 in `runCheck` (section loop, lines 191-208): exact census semantics — `split('\\n')` for the section pass only (keep `sourceLines` for row processing; both arrays have equal length), heading regexes exactly `^ {{0,3}}##[ \\t]` and `^ {{0,3}}#[ \\t]`, `[ \\t]`-only trim, state starts null, `headings[text] = true` with the same text. Update the header doc block (one sentence: sections follow the census `row_pass` grammar). Everything else byte-identical.
3. `--selftest`: keep all 46 existing arms passing and add hermetic arms (use `makeFixture`/`makeRow`/`runTool` like the existing `1-3-space indented rows outside Registry` arm) so that EACH of the 15 violating section shapes in `{R}/probe/make-controls97.py` ({SHAPES}) fails at least one new arm. Arms assert exact `ROW_OUTSIDE_REGISTRY` ids and `rows=` counts on small fixtures (CRLF heading, `##<TAB>Registry`, `##  Registry`, `## Registry<VT>`, `## Registry<NBSP>`, bare `#`, `#<TAB>x`, `## ` empty, tab/4-space indented `##`, `## registry`, `## Registry ##`, `### x` inside, a row before any heading); one arm should also compare against the census when `{CENSUS}` is present (skip, never fail, when absent — the existing awk parity arm is the pattern).
4. Score: `{COUNTER.replace('<TOOL>', CAND).replace('<your seat name>', 'K97ExecTool')}` twice -> `score1.txt`, `score2.txt` (each must end `C97_C1: HELD ...`). Save `selftest.txt` (`node {CAND} --selftest`), `sha256.txt`, `diff.txt` (`diff -u {L}/scripts/sources-check.mjs {CAND}`). Then write `{R}/K97ExecTool/READY` with the candidate's sha256 and STOP editing (a later edit must rewrite READY and be named in your yield).
5. Before READY, prove the arms have teeth: apply each of the 15 shapes to a scratch copy of YOUR candidate (mirror the generator's block variants) and record which new arms fail -> `arm-teeth.txt` (every shape killed by >= 1 arm).
# Acceptance
Candidate + READY + receipts; both counter verdict lines quoted; selftest count before/after; arm-teeth table 15/15.""")

item('K97ExecHarm', 'executor', f"""# Target
Harm battery for the sources-check swap (kill rule K3). Writable: `{R}/K97ExecHarm/` only.
# Change
1. Sandbox: `S={SCR}/K97ExecHarm; mkdir -p $S; git clone -q --shared {L} $S/lane`; verify `git -C $S/lane rev-parse --show-toplevel` = `$S/lane`; `git -C $S/lane checkout -q --detach {FREEZE}`.
2. BASE battery in the sandbox: `bash {R}/close/battery.sh $S/lane base > base.txt` (each tool's tail + exit). The open-state proxy DRIFT (A_wave/C2 bookkeeping) is known — see `{R}/open/battery-before.txt`.
3. When `{R}/K97ExecTool/READY` exists, copy the candidate over `$S/lane/scripts/sources-check.mjs`, rerun into `cand.txt`. Find which tools/files pin sources-check bytes or parse its output (`grep -rn "sources-check" $S/lane/scripts/*.mjs $S/lane/SCORECARD.md $S/lane/SKILL.md $S/lane/.ufo/pins 2>/dev/null | head -40`); list every consumer and whether the swap changes what it reads. If a SCORECARD/pin carries the old sha256 of sources-check, re-pin it in the SANDBOX only and rerun proxy-check -> `cand-proxy-repinned.txt`.
4. `--json` diff BASE vs candidate on the real lane (`--today 2026-11-07`, plain and `--strict`): must be byte-identical.
5. `battery-diff.txt`: per tool BASE vs CAND verdict line + exit; name every difference and whether it is expected. Remove `$S` before you yield.
# Acceptance
`base.txt`, `cand.txt`, `battery-diff.txt`, consumer list; one line per tool: same/expected/regression.""")

item('K97ScribeSources', 'scribe', f"""# Target
Draft the SOURCES row for round 97. Writable: `{R}/K97ScribeSources/` only.
# Change
1. Read `{L}/corpus/SOURCES.md` header and rows S272-S275 (11 columns `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`; no `|` inside any cell — not even escaped; recheck ISO date, `NNd` or symbolic like `on-release`). Next free id: S276. grep first for an existing row on the URL (`grep -n 'tc39\\|ecma' {L}/corpus/SOURCES.md`).
2. Open ECMA-262 2025 yourself: `https://tc39.es/ecma262/2025/` (curl into scratch; ~7 MB; record URL, access date 2026-11-07, HTTP status, sha256 of the body). Locate (a) §22.1.3.32.1 TrimString: the sentence defining white space as the union of WhiteSpace and LineTerminator; (b) §22.2.2.9 CompileToCharSet, `CharacterClassEscape :: s`: the sentence returning the CharSet for WhiteSpace or LineTerminator; (c) §12.2 White Space: the WhiteSpace production list (TAB VT FF ZWNBSP USP) and the table row naming U+00A0. Record each with its section number and byte offset in the HTML.
3. ONE row (one URL) with: a located quote of <= 25 words copied byte-exact (after tag strip + whitespace collapse) with its section anchor; COUNT ITS WORDS with `printf '%s' "<quote>" | wc -w` and paste the output; `used-by` = `corpus/knowledge/sources-check-registry-section.md`; status `mined`; recheck `on-release`; kind `spec`; tier `A`; teaches = why JS `\\s`/`.trim()`/`/\\r?\\n/` are wider than the census `[ \\t]` (CR, VT, FF, NBSP, other Zs) and therefore cannot be the lane's section reader.
4. Validate: copy `{L}/corpus/` to scratch, append your row inside `## Registry` after S275, create an empty file at the used-by path in the copy, run `{CENSUS} validate --file <scratch>/corpus/SOURCES.md` -> must exit 0; save output. Also `awk -F'|' '/^ {{0,3}}\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ && NF!=13' <copy>` -> must print nothing.
# Acceptance
`row.md` (draft row), `quotes.md` (URL, date, status, sha256, every quote with location and wc -w output), `census.txt`.""")

item('K97ScribeLesson', 'scribe', f"""# Target
Draft the round-97 knowledge entry and the mined-mistake row. Writable: `{R}/K97ScribeLesson/` only.
# Change
1. Read `{L}/corpus/lessons/round-96.md` (format: `## Gate`, `### Rows touched`, `## Mistakes`), `{L}/corpus/lessons/round-96-verifier-spotcheck.md` (§5 routed items), `{R}/plan.md`, `{L}/corpus/QUALITY.md` (Q85-Q90), `{L}/corpus/knowledge/round-gate-registry-section.md` (entry format, header `source:`/`verified-at:`/`recheck:`).
2. Draft `knowledge-sources-check-registry-section.md`: rule R97, the BASE reader's four departures from the census (CR split, literal-space heading regex, `\\s` trim, bare-`#` clear) with one example line each, why the census and not JS whitespace (placeholder `S276` ECMA-262 + S275 CommonMark + S274 POSIX awk), that the lane now has two readers on one grammar (round-gate r96 `outsideRows`, sources-check r97), the grammar-derived nonce battery and the 17 controls, limits (real registry LF; census bash/gawk `\\r` disagreement is the census's, L0). Header lines `source:`, `verified-at: <M>` (left for the L1), `recheck: on-release`.
3. Mined mistake M97-1 draft (class · evidence pointer · captured-by · fix): the frozen counter was keyed on fixed fixture ids for three rounds, so `hardcode-fixtures` reached HELD (`{L}/.ufo/waves/round-96/K96CriticA/constructions.md`, `{L}/.ufo/waves/round-96/K96CriticA/receipts/hardcode-fixtures.txt`); captured-by Q85/Q86 (class sampling) — input identity not covered; fix = nonce counter (this round's probe), shown able to fail by K97CriticA's replay construction. Also draft a QUALITY criterion Q91 text: "a frozen counter draws its fixture ids per run (nonce) and prints the seed; a construction keyed on one run's ids must read UNMET on a fresh seed" with its command form.
4. Sweep for other mistakes: `grep -n "M=" {L}/.ufo/waves/round-96/close/q88-r96.txt` vs the r96 lesson's M (closure routed item 1) — paste output.
# Acceptance
`knowledge-sources-check-registry-section.md`, `lesson-draft.md` (Mistakes row + Q91 draft), receipts.""")

item('K97Scout', 'scout', f"""# Target
Survey real registry heading classes fleet-wide and every SOURCES section reader in this lane. Writable: `{R}/K97Scout/` only (write `K97Scout.md` there; that file is your trailer).
# Change
1. Every lane's registry (read-only): for each `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md` classify every `#`-starting line by the plan's grammar classes (indent, marker, separator, trail; any CR, VT, FF, NBSP, TAB); count lines per class; flag any line where the BASE reader and the census disagree (BASE: `^## (.+?)\\s*$` on `/\\r?\\n/`-split, `normalizeMarkdownIndent`; census: `^ {{0,3}}##[ \\t]` + `[ \\t]` trim). CRLF files? Table per lane.
2. kumitate history: across `git -C {L} log --format=%H -- corpus/SOURCES.md`, count heading lines in any non-plain class per revision.
3. Which `{L}/scripts/*.mjs` read SOURCES sections or rows (`grep -n "SOURCES\\|Registry" {L}/scripts/*.mjs`), and which reader does each use (own regex, round-gate R96, sources-check)? One line each with line numbers — follow-up candidates.
4. Open `https://tc39.es/ecma262/2025/#sec-white-space` and quote (<= 25 words, wc -w) the sentence or table row that puts U+00A0 in WhiteSpace. Record HTTP status and sha256.
# Acceptance
`K97Scout.md` with commands, outputs, quotes; scratch removed.""")

item('K97Connector', 'connector', f"""# Target
One section grammar for the lane: round-gate (r96) vs candidate sources-check (r97) vs census. Writable: `{R}/K97Connector/` only.
# Change
1. The lane's `{L}/scripts/round-gate.mjs` (r96, `declaredPins()` ~line 410-460) lists outside rows in `citations.outsideRows`. Build the counter's battery files in scratch (copy the battery construction from `{R}/probe/probe97-c1.mjs` into a small node script with a fixed `--seed` and write F_A, F_B, F_C), then on each: census E12 ids (`{CENSUS} validate --file`), candidate sources-check (`{CAND}` once READY, else `ctl-positive` from the generator — say which) ROW_OUTSIDE_REGISTRY ids, and round-gate's section state (extract `declaredPins()` + its regex constants into a harness and print outside ids; record exactly how). Table: fixture -> agree counts for each pair; list every disagreement with its case label.
2. Do round-gate's `SOURCES_ROW_RE` (`\\s` vs `[ \\t]` row-id class, r96 routed item 4) and sources-check's row detection agree on the row-pad cases? Measure.
3. Sibling transfer: `grep -ln "SOURCES.md" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/* 2>/dev/null` — which tools read SOURCES sections with a reader that departs from the census (literal-space heading regex, `\\s` trim, CR strip)? One line per tool (lane, file:line). Reported, never edited.
# Acceptance
`K97Connector.md`: parity table, disagreement list, sibling transfer table, each with the command used.""")

item('K97Reviewer', 'reviewer', f"""# Target
Review the candidate against frozen rule R97 by hand. Writable: `{R}/K97Reviewer/` only.
# Change
1. Candidate-independent first: read `runCheck` (lines 172-400) in `{L}/scripts/sources-check.mjs` and the census `row_pass` (`{CENSUS}` lines 575-625); list the exact edit points R97 needs and every consumer of `sectionAtLine`/`headings`. Hand-check 20 battery cases from `{R}/probe/probe97-c1.mjs` (pick across classes) against the census grammar and say expected in/out for each; then confirm with `{CENSUS} validate --file` on a tiny file per case.
2. When READY exists: read `{R}/K97ExecTool/diff.txt` line by line. Check: section pass on `split('\\n')` with CR kept; row processing still on CR-stripped lines with equal indices; regexes exactly `^ {{0,3}}##[ \\t]` / `^ {{0,3}}#[ \\t]`; `[ \\t]`-only trim (not `.trim()`); state starts null; `headings` keyed by the same text; nothing else changed; header doc accurate; each new selftest arm asserts what its name says and would fail without the change. Run the counter once on the candidate -> `score.txt`.
3. Defects as blocker / non-blocker with line numbers.
# Acceptance
`K97Reviewer.md`: edit-point list, case hand-check table, defect list, counter verdict line.""")

item('K97CriticA', 'critic', f"""# Target
Attack the frozen counter: can a wrong tool reach HELD? Writable: `{R}/K97CriticA/` only.
# Change
1. Read `{R}/probe/probe97-c1.mjs`, `{R}/plan.md` and the 17 controls (`{R}/controls/`). Build >= 8 NEW wrong-but-plausible section readers (not one of the 16 control shapes) as patched copies of `ctl-positive` (generator: `{GEN}`), each beside copies of `cap-spawn.mjs`/`cap-run.mjs`, violating R97 in ways the counter might miss. Ideas: `startsWith('Registry')`; ZWNBSP/U+FEFF or U+2003 trimmed; a BOM on line 1; `\\r` mid-line treated as a break; heading only honoured after a blank line; `###` clears; the 4th leading space accepted only for `#`; Registry compared after `.normalize()`; state reset per 1000 lines; a REPLAY construction that hardcodes the outside-id set from ONE counter run (`--seed X`) and answers it whenever the file has that many lines — score it on a fresh seed (this is the M97-1 fix's show-able-to-fail receipt: it must read UNMET on a fresh seed and HELD-like only on its own seed).
2. Score each with the counter run form; table in `constructions.md` (construction, R97 clause violated, counter verdict). A construction reaching HELD while violating R97 is a COUNTER finding (it does not change the frozen verdict; routed and reported).
3. Re-run the do-nothing control yourself once (tool = `{L}/scripts/sources-check.mjs`) and confirm UNMET for the right reason.
# Acceptance
`constructions.md` with >= 8 rows and verdicts; scratch removed.""")

item('K97CriticB', 'critic', f"""# Target
Attack the claim's framing and harm surface. Writable: `{R}/K97CriticB/` only.
# Change
1. Real move or busywork? Do any real registries (21 lanes, kumitate history) carry a heading line in a class where BASE and the census disagree? When do sources-check and the census run in this lane (read `{L}/SKILL.md` checklist lines and `{R}/close/battery.sh`)? Build a scratch copy of `{L}/corpus/` whose `## Registry` line has a trailing CR (or `##<TAB>Registry`) and measure BASE vs `ctl-positive` (or the candidate when READY) vs census: which reads green while the other refuses? Verdict sound / weak / unsound with receipts.
2. SECTION_MISSING changes: R97 records heading text the census way — enumerate the inputs where BASE and the candidate now differ on SECTION_MISSING (e.g. `## Paths\\r`, `##  Search log`) and argue whether that is the right direction. Does `git -C {L} config --get core.autocrlf` or any `.gitattributes` make CRLF registries possible here?
3. Harm: diff `--json` outputs BASE vs candidate on the real lane and on 5 sibling lanes' `corpus/` copies (scratch); list any change; grep `{L}/scripts/` for consumers of sources-check output.
# Acceptance
`K97CriticB.md`: framing verdict with reasons and receipts; SECTION_MISSING table; harm diff table.""")

item('K97Mutation', 'mutation-tester', f"""# Target
Mutation-test the candidate's NEW code (kill rule K2). Writable: `{R}/K97Mutation/` only.
# Change
1. When `{R}/K97ExecTool/READY` exists (look after reading the plan and the counter; at most 10 minutes of waiting total; if absent, mutate `ctl-positive` regenerated via the generator and say so), copy the candidate into scratch beside copies of `{L}/scripts/cap-spawn.mjs` and `cap-run.mjs`.
2. Apply >= 20 single-point mutants inside the new/changed lines (`diff -u {L}/scripts/sources-check.mjs <candidate>`): the 15 section shapes of `{R}/probe/make-controls97.py` applied to the candidate's own code, plus boundary mutants (`{{0,3}}` -> `{{0,2}}`/`{{0,4}}`, `[ \\t]` -> `[ ]`, `=== 'Registry'` -> `!==`, `split('\\n')` -> `split(/\\n/)` (equivalent?), `headings` keyed on the raw line, index off by one, `sourceLines` used for one branch).
3. For each mutant run `node <mutant> --selftest` (exit + failing arm names) AND the counter run form. Status: KILLED-by-selftest / KILLED-by-counter-only / SURVIVED / EQUIVALENT (argue). Table -> `mutants.md`, receipts under `runs/`.
# Acceptance
`mutants.md` with >= 20 rows; selftest kill count; survivors named with the arm that should catch them.""")

item('K97CriticC', 'critic', f"""# Target
Hypothesis H97 (falsifiable): on every historical revision of `{L}/corpus/SOURCES.md`, on every sibling lane's current registry, and on 300 seeded random mutations of the kumitate registry, the candidate's ROW_OUTSIDE_REGISTRY ids and `counts.rows` equal the census E12 ids and `rows`. Writable: `{R}/K97CriticC/` only.
# Change
1. Tool: `{CAND}` once READY, else `ctl-positive` regenerated with `{GEN}` — say which. Run it as `node <tool> --self <dir> --today 2026-11-07 --json` where `<dir>` holds `corpus/SOURCES.md` + an empty `corpus/knowledge/`.
2. Run over every revision (`git -C {L} log --format=%H -- corpus/SOURCES.md`, `git -C {L} show <rev>:corpus/SOURCES.md` into scratch) and every `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md`; for each file run `{CENSUS} validate --file <f>` (E12 ids) and `{CENSUS} census --file <f>` (rows) and compare.
3. 300 seeded random mutations of the current kumitate registry (insert/move headings `## X`, `# X`, `### X`, `##\\tRegistry`, `## Registry\\r`, `## Registry\\v`, `#`, NBSP/VT/FF variants, CRLF lines, 0-4 space and tab indents; move rows between sections) and compare on each. Do the same for BASE (`{L}/scripts/sources-check.mjs`) and report its disagreement count as the control.
4. Verdict: H97 SURVIVES or FALSIFIED with the smallest counterexample file saved.
# Acceptance
`H97.md` with counts (files, agreements, disagreements, BASE control), seed, counterexample if any; scratch removed.""")

spec = {
    'wave': 'kumitate-r97-w1',
    'reportDir': '.ufo/waves/round-97/w1',
    'maxLanes': 16,
    'context': context,
    'items': items,
}
with open(f'{R}/w1-spec.json', 'w', encoding='utf-8') as f:
    json.dump(spec, f, indent=1)
print(len(items), 'items')
