#!/usr/bin/env python3
"""Build .ufo/waves/round-95/w1-spec.json (kumitate r95, one v1 wave, 10 seats)."""
import json

L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
R = f'{L}/.ufo/waves/round-95'
FREEZE = 'ee8479be66acd906f1d2b5f24f1b75a3d9172c1b'
SCR = '/fast/scratch/hyaku/kumitate-r95'
GOD = ("/skill:godspeed\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n"
       "3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim \u2014 let the frontier walk itself.**\n\n"
       "## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize "
       "what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.\n")
CAND = f'{R}/K95ExecTool/round-gate.mjs'
COUNTER = f'node {R}/probe/probe95-c1.mjs --tool <TOOL> --work {SCR}/<your seat name>/probe --freeze {FREEZE}'
GEN = f'python3 {R}/probe/make-controls95.py {L}/scripts/round-gate.mjs <out dir>'

context = f"""# Goal
Kumitate round 95 (hyaku run 15, attempt 1). ONE claim C1 = operability: the lane gate `{L}/scripts/round-gate.mjs` (contract `kumitate-round-gate-v1`) reads `corpus/SOURCES.md` registry rows to find declared upstream commit pins (`declaredPins()`, ~line 404). It takes the status from `line.split('|')[8]` with NO field-count check, so an unescaped `|` in an earlier cell shifts the status cell (a truly `rejected` row still declares its pin), and short/long rows declare from whatever cell lands at index 8. The fleet census (`/home/vgpnk/Projects/shokunin/CORPUS.md`, "malformed rows — 11 columns means NF=13; must print 0") already defines the row shape.
Frozen rule: a registry row (`^ {{0,3}}\\|\\s*S\\d{{3,}}\\s*\\|`) declares pins only when `line.split('|')` yields exactly 13 fields; a registry row with any other field count declares nothing, and its id (field 1, trimmed) is appended, in file order, to `--json` `citations.malformedRows` — an array always present on every `--json` output (empty when the registry was not read or holds no malformed row). Everything else is unchanged.

READ FIRST: `{R}/plan.md` (frozen predicate, kill rules K1-K4, controls). Frozen at lane commit `{FREEZE}`. Counter (FROZEN, never edit): `{R}/probe/probe95-c1.mjs`; run form:
`{COUNTER}`
It clones the lane into the work dir, runs a synthetic malformed-registry fixture, a no-SOURCES fixture, BASE vs <TOOL> over all 78 filed kumitate reports, then the tool's `--selftest`; verdict line `C95_C1: HELD|UNMET a= b= c= d=` (~45 s). Controls: `{R}/controls/` (`ctl-positive` = L1 reference rule, HELD; seven others UNMET); generator: `{GEN}`.
The candidate (once built) lives at `{CAND}`; its builder writes `{R}/K95ExecTool/READY` (one line: sha256 of the candidate) when final. Seats that attack the candidate: do candidate-independent work first, then look for READY; if still absent when that work is done, attack `ctl-positive` (regenerate it with the generator into your scratch) and say so (never wait in a sleep loop longer than 10 minutes total).
Lane root `{L}` is detached; read history with `git -C {L} show <rev>:<path>`.

# Contract
- Read-only on the lane: never write under `{L}/scripts/`, `{L}/corpus/`, `{R}/probe/`, `{R}/controls/`, `{R}/open/`, `{R}/plan.md`, or any other lane file. Write ONLY inside your own seat dir `{R}/<your seat name>/` (create it). Put every receipt and file you cite there, and write your trailer report there.
- Every `Report:` trailer path the validator prints is relative to {L} — write it at {L}/<that path>.
- Scratch: `{SCR}/<your seat name>/`. Create it with `mkdir -p`, pass it explicitly (`TMPDIR=<scratch>`), never use `/tmp` for anything over 50 MB, remove it before you yield (`trap 'rm -rf -- "$S"' EXIT`). A `/tmp` path is never citable evidence.
- Git: fixtures only as `D=$(mktemp -d -p <scratch> fx.XXXXXX) && test -n "$D" && git -C "$D" init -q`, every later git call names `-C "$D"`; verify `git -C "$D" rev-parse --show-toplevel` equals `$D` before the first commit; never pass an empty or unchecked variable to `git -C`. Never run `git commit/add/stash/checkout/reset/push/worktree` or any `jj` command in the lane or the fleet repo; never run a mutating git/jj command outside your fixture.
- Never message `agent://all`. Never edit the fleet repo `/home/vgpnk/Projects/shokunin`, a sibling lane, `MANIFEST.json`, `/boot`, or host sysctls. Never run `sudo`. Never run anything that could exhaust host memory without `prlimit --as=4294967296` and a `timeout`.
- Tooling: you may install or upgrade tools that help the task — read `/home/vgpnk/.omp/agent/RULES.md` first (official channels only; record tool/version/channel/reason). pacman transactions are PAUSED host-wide: never `pacman -S/-Sy/-Syu/-U/-R`; use `uv tool`, `npx`, or an official binary in `~/.local/bin`.
- Evidence over prose: every claim names the command you ran and the receipt path under your seat dir. An unrun check has not passed. If blocked, say exactly what and what you tried.
- Yield a concise result (<= 25 lines): paths produced, the command outputs that matter, blockers."""

items = []


def item(name, role, body):
    items.append({'name': name, 'role': role, 'prompt': GOD + body})


item('K95ExecTool', 'executor', f"""# Target
Build the production candidate `round-gate.mjs` with the frozen registry-shape rule. Writable: `{R}/K95ExecTool/` only.
# Change
1. Copy `{L}/scripts/round-gate.mjs` to `{CAND}` and copy `{L}/scripts/cap-spawn.mjs` and `{L}/scripts/cap-run.mjs` beside it (the gate imports `./cap-spawn.mjs`; the copies are run aids, not deliverables).
2. Implement the frozen rule (Goal) in `declaredPins()` and its caller: field-count check before any cell is read; malformed ids pushed in file order to `citations.malformedRows`; `malformedRows: []` initialised on EVERY citations object, including the fail-closed `--json` path (~line 720), so the key is always present. Keep the lazy single read. Keep contract id `kumitate-round-gate-v1` (the rule only narrows a declaration; no field is removed). Update the header doc block (rule sentence verbatim, `citations.malformedRows`). Optional: text-mode disclosure may add `malformed=<n>` to the existing `COMMIT_CITED_DECLARED` info line or a separate `info` line — never a new error/warning finding.
3. `--selftest`: keep every existing arm (79) passing and add >= 6 hermetic arms that each FAIL on one forgery shape: (i) unescaped `|` shifting a `rejected` status -> unresolved + id in malformedRows; (ii) escaped `\\|` row -> unresolved + malformed; (iii) 12-field short row -> unresolved + malformed (kills lenient12/gt13); (iv) 14-field long row -> unresolved + malformed; (v) a well-formed row next to a malformed one still declares (kills dropall); (vi) malformedRows exact order/content (kills nodisclose); (vii) fail-closed `--json` output carries `malformedRows: []`. Build fixtures with the existing selftest helpers (`fxCited`, `fxRow`, ...).
4. Score: `{COUNTER.replace('<TOOL>', CAND).replace('<your seat name>', 'K95ExecTool')}` twice -> `score1.txt`, `score2.txt` (each must end `C95_C1: HELD ...`). Save `selftest.txt` (`node {CAND} --selftest`), `sha256.txt`, and `diff.txt` (`diff -u {L}/scripts/round-gate.mjs {CAND}`). Then write `{R}/K95ExecTool/READY` with the candidate's sha256 and STOP editing (a later edit must rewrite READY and be named in your yield).
5. Before READY, prove each new arm can fail: apply each of the six forgery shapes of `{R}/probe/make-controls95.py` (escapeonly, gt13, lenient12, anyrej, nodisclose, dropall) as a patch to a scratch copy of YOUR candidate and record which arms fail -> `arm-teeth.txt` (every shape must be killed by >= 1 arm).
# Acceptance
Candidate + READY + receipts; both counter verdict lines quoted; selftest count before/after; arm-teeth table.""")

item('K95ExecHarm', 'executor', f"""# Target
Harm battery for the round-gate swap (kill rule K3). Writable: `{R}/K95ExecHarm/` only.
# Change
1. Sandbox: `S={SCR}/K95ExecHarm; mkdir -p $S; git clone -q --shared {L} $S/lane`; verify `git -C $S/lane rev-parse --show-toplevel` = `$S/lane`; `git -C $S/lane checkout -q --detach {FREEZE}`.
2. BASE battery in the sandbox (each output + exit code into `base/`): `node scripts/proxy-check.mjs`; `node scripts/readme-map.mjs`; `node scripts/sources-check.mjs`; `node scripts/counter-pins.mjs`; `node scripts/spotcheck-adopt.mjs --check`; `node scripts/round-gate.mjs --tracked --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`; `node scripts/round-gate.mjs --round 94 --json --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`; `node scripts/surface-probe.mjs --checklists` (read each tool's header if a flag differs; record what you ran). The open-state proxy DRIFT (A_wave/C2 bookkeeping) is known — see `{R}/open/battery-before.txt`.
3. When `{R}/K95ExecTool/READY` exists, copy the candidate over `$S/lane/scripts/round-gate.mjs` and rerun the battery into `cand/`. Find which tools/files pin round-gate bytes (`grep -rn "round-gate" $S/lane/scripts/*.mjs $S/lane/SCORECARD.md $S/lane/.ufo/pins 2>/dev/null | head`); re-pin `pin.round-gate` in the SANDBOX SCORECARD only to the candidate sha256 and rerun proxy-check -> `cand/proxy-repinned.txt`; list other files carrying the old sha `11f83a1a`.
4. Real-registry probe: run the candidate `--round 93 --json` and `--round 94 --json` against the sandbox and confirm `citations.malformedRows` is `[]` and `declared` unchanged vs BASE.
5. Write `battery-diff.txt`: per tool BASE vs CAND verdict line + exit; name every difference and whether it is expected pin drift. Remove `$S` before you yield.
# Acceptance
`base/`, `cand/`, `battery-diff.txt`; one line per tool: same/expected-pin/regression.""")

item('K95ScribeSources', 'scribe', f"""# Target
Draft SOURCES rows for round 95. Writable: `{R}/K95ScribeSources/` only.
# Change
1. Read `{L}/corpus/SOURCES.md` header and rows S266-S272 (11 columns `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`; no `|` inside any cell — not even escaped; recheck is an ISO date, `NNd` or a symbolic cadence like `on-release`). The next free id is S273. grep first for an existing row on each URL below (`grep -n 'github.github.com\\|pubs.opengroup.org' {L}/corpus/SOURCES.md`).
2. Open each source yourself (curl into your scratch; record URL, access date 2026-11-07, HTTP status, sha256 of the body):
   (a) GitHub Flavored Markdown spec, Tables (extension) section: https://github.github.com/gfm/#tables-extension- — the sentence that a pipe can be included in a cell's content by escaping it; also whether leading/trailing pipes are optional (record that sentence too: it is why the lane's stricter census shape differs from GFM);
   (b) POSIX awk specification (The Open Group Base Specifications, awk utility): https://pubs.opengroup.org/onlinepubs/9799919799/utilities/awk.html — the definition of `NF` and of field splitting by a single-character FS (the census uses `awk -F'|'` and `NF!=13`). If that URL fails, use the 2018 edition `https://pubs.opengroup.org/onlinepubs/9699919799/utilities/awk.html` and say so.
3. For each: a located quote of <= 25 words copied byte-exact, with section anchor; COUNT ITS WORDS with `printf '%s' "<quote>" | wc -w` and paste the command output (the round-94 lesson stated two counts off by one); a draft row with `used-by` = `corpus/knowledge/round-gate-registry-shape.md` (the entry the L1 will land), status `mined`, recheck `on-release`.
4. Validate: copy `{L}/corpus/` to scratch, append your rows, run `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/corpus/SOURCES.md` -> must exit 0; save output. Also run the census awk `awk -F'|' '/^ {{0,3}}\\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\\|/ && NF!=13' <copy>` -> must print nothing.
# Acceptance
`rows.md` (draft rows), `quotes.md` (URL, date, status, sha256, quote, location, wc -w output per source), `census.txt`; any source refused, with reason and flip.""")

item('K95ScribeLesson', 'scribe', f"""# Target
Draft the round-95 knowledge entry and the mined-mistake counter. Writable: `{R}/K95ScribeLesson/` only.
# Change
1. Read `{L}/corpus/lessons/round-94.md` (format, `## Gate`, `## Mistakes`), `{L}/corpus/lessons/round-94-verifier-spotcheck.md` (§1 defect (b), §5 item 4), `{R}/plan.md`, `{L}/corpus/QUALITY.md` (Q85-Q88 at least) and `{L}/corpus/knowledge/round-gate-declared-pins.md` (entry format, frontmatter `source:` ids).
2. Draft `knowledge-round-gate-registry-shape.md`: the registry shape rule (13 fields = 11 cells, census `NF==13`), why a field-count check and not GFM-aware parsing (the registry contract forbids `|` in cells, escaped or not; the census is the authority and the gate must agree with it), what `malformedRows` discloses, the K94Sentinel S94-5 evidence, limits (a malformed row with a legit pin silently stops declaring -> a report citing it re-reds, which is the intended fail-closed direction; rows inside fenced code blocks are still read by both census and gate). Leave `source:` ids as placeholders `S27x` for the L1.
3. Mined mistake (count accuracy): the round-94 lesson states quote word counts beside located quotes (`(…, 17 words): "…"`) and two are off by one (spot-check: S271 is 18, S272 is 10). Write ONE shell or node one-liner (no new file under `scripts/`) that extracts every `N words): "<quote>"` pair from a lesson file and prints `MISMATCH stated=N actual=M` per pair whose `wc -w`-style count differs, exit 1 if any mismatch, `WORDCOUNT: CLEAN pairs=<n>` exit 0 otherwise. Show it FAILING on `{L}/corpus/lessons/round-94.md` (expect the two slips) and PASSING on at least two earlier lessons that carry such pairs (find them with grep). Save the command in `wordcount-cmd.txt` and receipts under `receipts/`. Draft the `## Mistakes` row (class · evidence pointer · captured-by · fix) and a QUALITY criterion draft (Q89) whose check is that command.
4. Draft the append-only correction paragraph for round-94's counts (S271 18, S272 10) in the lane's correction style (see `SCORECARD.md` "named correction" sections).
# Acceptance
`knowledge-round-gate-registry-shape.md`, `lesson-draft.md` (Mistakes row + Q89 draft + correction), `wordcount-cmd.txt`, receipts.""")

item('K95Scout', 'scout', f"""# Target
Survey real-world registry shapes and the parse rule's blast radius. Writable: `{R}/K95Scout/` only (write `K95Scout.md` there; that file is your trailer).
# Change
1. Every lane's registry (read-only): for each `/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md`, count registry rows (`^ {{0,3}}\\|[[:space:]]*S[0-9]{{3,}}`) and rows with NF != 13 (`awk -F'|'`), and rows containing `\\|`. Table per lane. Do any lanes carry malformed rows the census would flag? (Expect 0 where census is green.)
2. kumitate history: across `git -C {L} log --format=%H -- corpus/SOURCES.md` (all revisions), has the lane registry EVER held a malformed row? Count per revision (`git -C {L} show <rev>:corpus/SOURCES.md | awk ...`); report the first/last revisions with any, and the row ids.
3. Which `{L}/scripts/*.mjs` tools parse SOURCES rows by splitting on `|` (`grep -n "split('|')" {L}/scripts/*.mjs`)? For each, does it check the field count? One line each with line numbers — these are candidate follow-ups, not this round's claim.
4. Open https://github.github.com/gfm/#tables-extension- and note (quote <= 25 words) what GFM does with a row that has fewer or more cells than the header (the "remainder ignored / filled with empty cells" rule). Record HTTP status and sha256.
# Acceptance
`K95Scout.md` with commands, outputs, quotes; scratch removed.""")

item('K95Connector', 'connector', f"""# Target
Sibling-overlap scan: who else parses SOURCES registries, and does the census shape transfer. Writable: `{R}/K95Connector/` only.
# Change
1. Fleet tools: `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (read-only) — how does its maintained parser treat a row with NF != 13 (error id? warning?) and an escaped `\\|`? Quote the lines. Is the gate's new rule stricter, equal, or looser than the census on the fixture shapes in `{R}/probe/probe95-c1.mjs` (S002 shifted, S003 escaped, S004 short, S007 long, S006 3-space indent, S010 4-space indent)? Run the census on a scratch copy of that fixture registry (build it from the counter's SOURCES array) and record each row's census verdict.
2. Sibling lanes' scripts: `grep -ln "SOURCES.md" /home/vgpnk/Projects/shokunin/*-shokunin/scripts/* 2>/dev/null` — which split rows on `|` and read a column by index without a count check? One line per tool (lane, file:line). These are transfer candidates for the fleet, reported, never edited.
3. Fleet `CORPUS.md` census clause + `PROTOCOL.md`: quote the lines that make NF==13 the registry contract.
# Acceptance
`K95Connector.md`: census-vs-gate table on the six shapes, sibling transfer table, quotes, each with the command used.""")

item('K95Reviewer', 'reviewer', f"""# Target
Review the candidate against the frozen rule by hand. Writable: `{R}/K95Reviewer/` only.
# Change
1. Candidate-independent first: read `declaredPins()` and every `citations` object in `{L}/scripts/round-gate.mjs` (all paths that emit `--json`, incl. fail-closed and `--tracked`); list the exact edit points the rule needs and which `--json` paths must carry `malformedRows`. Check the frozen counter `{R}/probe/probe95-c1.mjs` fixture by hand: for each of S001-S008 + S010 compute `line.split('|').length` and the expected verdict; confirm EXP sets.
2. When READY exists: read `{R}/K95ExecTool/diff.txt` line by line. Check: field-count check happens BEFORE status read; id is field 1 trimmed; order is file order; laziness unchanged (no SOURCES read when no token reaches the declared step); `malformedRows` present on every `--json` path; CRLF line endings (does a `\\r` change the count? it should not — test it); header doc accuracy; each new selftest arm asserts what its name says. Run the counter once on the candidate -> `score.txt`.
3. List defects as blocker / non-blocker with line numbers.
# Acceptance
`K95Reviewer.md`: edit-point list, fixture hand-check, defect list, counter verdict line.""")

item('K95CriticA', 'critic', f"""# Target
Attack the frozen counter: can a wrong tool reach HELD? Writable: `{R}/K95CriticA/` only.
# Change
1. Read `{R}/probe/probe95-c1.mjs` and `{R}/plan.md`. Build >= 6 wrong-but-plausible gates (patch copies of `{L}/scripts/round-gate.mjs` in scratch, using `{R}/probe/make-controls95.py` as a template; keep each beside copies of `cap-spawn.mjs`/`cap-run.mjs`) that violate the frozen rule in a way the counter might miss, e.g.: count fields after `trimEnd()` stripping a trailing `|`; dedupe malformed ids; report malformed ids only when the row has a URL; treat CRLF rows as malformed; read malformedRows only on the declared step but omit the key on the `--tracked`/fail-closed path; hardcode the fixture ids; check `split('|').length >= 13 && status ok`; skip rows whose id appears twice.
2. Score each with the counter run form; record verdict lines in `constructions.md` (construction, rule clause violated, counter verdict). A construction reaching HELD while violating the rule is a COUNTER finding (it does not change the frozen verdict; it is routed and reported).
3. Re-run the do-nothing control yourself once (tool = `{L}/scripts/round-gate.mjs`) and confirm UNMET for the right reason.
# Acceptance
`constructions.md` with >= 6 rows and verdicts; scratch removed.""")

item('K95CriticB', 'critic', f"""# Target
Attack the claim's framing and harm surface. Writable: `{R}/K95CriticB/` only.
# Change
1. Is this a real operability move or busywork? The real registry has 0 malformed rows (`{R}/open/real-malformed-before.txt`) and the census already rejects malformed rows (exit != 0?). Measure: does `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <copy>` actually FAIL (non-zero exit) on a registry carrying the K94Sentinel shifted-rejected row? Build it in scratch from a copy of `{L}/corpus/SOURCES.md` with one row edited to carry an unescaped `|` in its scope cell. If the census already fails, what does the gate fix add (the gate runs at filing/closure on reports, the census on registries — do they run at the same moments? read `{L}/SKILL.md` checklist lines naming each)? Argue both sides with receipts; verdict sound / weak / unsound.
2. Harm: when READY exists, diff `--json` outputs of BASE vs candidate on 6 rounds of your choice (`node <tool> --round N --json --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`) and list any change other than the added `malformedRows` key. Does any consumer of round-gate JSON in `{L}/scripts/` break on an extra key (grep for `citations`)?
# Acceptance
`K95CriticB.md`: framing verdict with reasons and receipts; harm diff table.""")

item('K95Mutation', 'mutation-tester', f"""# Target
Mutation-test the candidate's NEW code (kill rule K2). Writable: `{R}/K95Mutation/` only.
# Change
1. When `{R}/K95ExecTool/READY` exists (look after reading the plan and the counter; at most 10 minutes of waiting total; if absent, mutate `ctl-positive` regenerated via the generator and say so), copy the candidate into scratch beside copies of `{L}/scripts/cap-spawn.mjs` and `cap-run.mjs`.
2. Apply >= 12 single-point mutants inside the new/changed lines (`diff -u {L}/scripts/round-gate.mjs <candidate>`): include the six forgery shapes of the plan's controls (escapeonly, gt13, lenient12, anyrej, nodisclose, dropall) plus boundary mutants (`!== 13` -> `!== 12`, `< 13`, id `fields[2]`, push without trim, `unshift` instead of `push`, malformedRows key removed from the fail-closed path, status index 8 -> 9, field check moved after the status read).
3. For each mutant run `node <mutant> --selftest` (exit + failing arm names) AND the counter run form. Status per mutant: KILLED-by-selftest / KILLED-by-counter-only / SURVIVED / EQUIVALENT (argue). Table -> `mutants.md`, receipts under `runs/`.
# Acceptance
`mutants.md` with >= 12 rows; selftest kill count; survivors named with the arm that should catch them.""")

spec = {
    'wave': 'kumitate-r95-w1',
    'reportDir': '.ufo/waves/round-95/w1',
    'maxLanes': 16,
    'context': context,
    'items': items,
}
with open(f'{R}/w1-spec.json', 'w', encoding='utf-8') as f:
    json.dump(spec, f, indent=1)
print(len(items), 'items')
