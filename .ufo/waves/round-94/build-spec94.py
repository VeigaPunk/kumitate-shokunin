#!/usr/bin/env python3
"""Build .ufo/waves/round-94/w1-spec.json (kumitate r94, one v1 wave, 11 seats)."""
import json

L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
R = f'{L}/.ufo/waves/round-94'
FREEZE = '73317eca18c3927fc3c92fe492cd882dc4cda953'
SCR = '/fast/scratch/hyaku/kumitate-r94'
GOD = ("/skill:godspeed\nYou are a Godspeed-enabled subagent.\n\n1. **Name the axes.**\n2. **Iterate cheap, in parallel.**\n"
       "3. **Keep moves that improve any axis and harm none.**\n4. **Don't aim \u2014 let the frontier walk itself.**\n\n"
       "## IMMEDIATELY STOP ASKING CLARIFYING QUESTIONS. Execute tool calls concurrently in large batches. Do not serialize "
       "what can run in parallel. Do not output philosophical reasoning or verbose plans. Act directly via tool calls.\n")
CAND = f'{R}/K94ExecTool/round-gate.mjs'
COUNTER = (f'node {R}/probe/probe94-c1.mjs --tool <TOOL> --work {SCR}/<your seat name>/probe --freeze {FREEZE}')

context = f"""# Goal
Kumitate round 94 (hyaku run 15, attempt 1). ONE claim C1 = operability: the lane gate `{L}/scripts/round-gate.mjs` (contract `kumitate-round-gate-v1`) learns SOURCES-declared upstream commit pins. Today a backticked hex token in a filed report that resolves in no probeable repo (lane -> fleet main -> origin ufo-fsd-alpha) is the error `COMMIT_CITED_UNRESOLVED`; round 93's report cites oh-my-pi pin `79fa222e` (declared by the lane's own registry rows S267-S269) and reads red. Seven other red rounds (12 46 53 57 61 62 63) cite tokens NOT in the registry and must stay red.
Frozen rule: a token that resolves nowhere is `declared` (no finding; listed in `--json` `citations.declared`) iff it is a prefix of a 40-hex string that is a complete path segment (URL split on `/`, `?`, `#`) of an `http(s)://` URL on a `{L}/corpus/SOURCES.md` registry row (`^ {{0,3}}\\|\\s*S\\d{{3,}}\\s*\\|`) whose status cell (8th column) is not `rejected`. No SOURCES.md -> no declared pins. Nothing else changes.

READ FIRST: `{R}/plan.md` (frozen predicate, kill rules K1-K4, controls). Frozen at lane commit `{FREEZE}`. Counter (FROZEN, never edit): `{R}/probe/probe94-c1.mjs`; run form:
`{COUNTER}`
It clones the lane into the work dir, runs BASE vs <TOOL> over all 77 filed kumitate reports (fleet pin 87de49a6) and two synthetic fixtures, then the tool's `--selftest`; verdict line `C94_C1: HELD|UNMET a= b= c= d= e=` (~30 s). Controls: `{R}/controls/` (`ctl-positive` = L1 reference rule, HELD; seven forgeries UNMET; generator `{R}/probe/make-controls94.py`).
The candidate (once built) lives at `{CAND}`; its builder writes `{R}/K94ExecTool/READY` (one line: sha256 of the candidate) when final. Seats that attack the candidate: do candidate-independent work first, then look for READY; if still absent when that work is done, attack `ctl-positive` (regenerate it with the generator into your scratch) and say so (never wait in a sleep loop longer than 10 minutes total).
Lane root `{L}` is detached; read history with `git -C {L} show <rev>:<path>`.

# Contract
- Read-only on the lane: never write under `{L}/scripts/`, `{L}/corpus/`, `{R}/probe/`, `{R}/controls/`, `{R}/open/`, `{R}/plan.md`, or any other lane file. Write ONLY inside your own seat dir `{R}/<your seat name>/` (create it). Put every receipt and file you cite there, and write your trailer report there.
- Every `Report:` trailer path the validator prints is relative to `{L}` — write it at `{L}/<that path>`.
- Scratch: `{SCR}/<your seat name>/`. Create it with `mkdir -p`, pass it explicitly (`TMPDIR=<scratch>`), never use `/tmp` for anything over 50 MB, remove it before you yield (`trap 'rm -rf -- "$S"' EXIT`). A `/tmp` path is never citable evidence.
- Git: fixtures only as `D=$(mktemp -d -p <scratch> fx.XXXXXX) && test -n "$D" && git -C "$D" init -q`, every later git call names `-C "$D"`; verify `git -C "$D" rev-parse --show-toplevel` equals `$D` before the first commit; never pass an empty or unchecked variable to `git -C`. Never run `git commit/add/stash/checkout/reset/push/worktree` or any `jj` command in the lane or the fleet repo; never run a mutating git/jj command outside your fixture.
- Never message `agent://all`. Never edit the fleet repo `/home/vgpnk/Projects/shokunin`, a sibling lane, `MANIFEST.json`, `/boot`, or host sysctls. Never run `sudo`. Never run anything that could exhaust host memory without `prlimit --as=4294967296` and a `timeout`.
- Tooling: you may install or upgrade tools that help the task — read `/home/vgpnk/.omp/agent/RULES.md` first (official channels only; record tool/version/channel/reason). pacman transactions are PAUSED host-wide: never `pacman -S/-Sy/-Syu/-U/-R`; use `uv tool`, `npx`, or an official binary in `~/.local/bin`.
- Evidence over prose: every claim names the command you ran and the receipt path under your seat dir. An unrun check has not passed. If blocked, say exactly what and what you tried.
- Yield a concise result (<= 25 lines): paths produced, the command outputs that matter, blockers."""

items = []


def item(name, role, body):
    items.append({'name': name, 'role': role, 'prompt': GOD + body})


item('K94ExecTool', 'executor', f"""# Target
Build the production candidate `round-gate.mjs` with the frozen declared-pin rule. Writable: `{R}/K94ExecTool/` only.
# Change
1. Copy `{L}/scripts/round-gate.mjs` to `{CAND}` and copy `{L}/scripts/cap-spawn.mjs` and `{L}/scripts/cap-run.mjs` beside it (the gate imports `./cap-spawn.mjs`; the copies are run aids, not deliverables).
2. Implement the frozen rule (Goal) in `runChecks`: resolution order lane -> main -> origin -> declared -> unresolved/unverifiable; `citations.declared` array always present in `--json`; a declared token is never a finding; text-mode `COMMIT_CITED_UNRESOLVED` detail may add `declared=<n>`. Read `<repo>/corpus/SOURCES.md` lazily, once per run, only when a token reached the declared step. Keep the contract id `kumitate-round-gate-v1` (the rule only narrows an error; no field is removed). Update the header doc block: the resolution order, the rule sentence verbatim, `citations.declared`.
3. `--selftest`: keep every existing arm passing and add >= 6 hermetic arms that each FAIL on one forgery shape: (i) URL-segment prefix in a registry row -> declared, no finding; (ii) full 40-hex -> declared; (iii) `#fragment` after the pin (`/commit/<pin>#diff`) -> declared; (iv) pin only as a non-URL digest in a row -> COMMIT_CITED_UNRESOLVED; (v) pin in a URL on a prose line outside the registry -> unresolved; (vi) pin in a `rejected` row -> unresolved; (vii) token from the middle of a pin -> unresolved; (viii) no SOURCES.md -> unresolved, no INTERNAL_ERROR. Build fixtures with the existing selftest helpers.
4. Score: `{COUNTER.replace('<TOOL>', CAND).replace('<your seat name>', 'K94ExecTool')}` twice -> `score1.txt`, `score2.txt` (each must end `C94_C1: HELD ...`). Save `selftest.txt` (`node {CAND} --selftest`), `sha256.txt`, and `diff.txt` (`diff -u {L}/scripts/round-gate.mjs {CAND}`). Then write `{R}/K94ExecTool/READY` with the candidate's sha256 and STOP editing (a later edit must rewrite READY and be named in your yield).
5. Before READY, prove each new arm can fail: apply each of the seven rule-shape forgeries (see `{R}/probe/make-controls94.py` names blanket/substring/anyline/contains/norejfilter/slashonly + a "declared check removed" mutant) to a scratch copy of YOUR candidate and record which arms fail -> `arm-teeth.txt`.
# Acceptance
Candidate + READY + receipts; both counter verdict lines quoted; selftest count before/after; arm-teeth table.""")

item('K94ExecHarm', 'executor', f"""# Target
Harm battery for the round-gate swap (kill rule K3). Writable: `{R}/K94ExecHarm/` only.
# Change
1. Make a sandbox: `S={SCR}/K94ExecHarm; mkdir -p $S; git clone -q --shared {L} $S/lane` and verify `git -C $S/lane rev-parse --show-toplevel` = `$S/lane`; `git -C $S/lane checkout -q --detach {FREEZE}`.
2. BASE battery in the sandbox (save each output with exit code into `base/`): `node scripts/proxy-check.mjs`; `node scripts/readme-map.mjs`; `node scripts/sources-check.mjs`; `node scripts/counter-pins.mjs`; `node scripts/spotcheck-adopt.mjs --check`; `node scripts/round-gate.mjs --tracked --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`; `node scripts/round-gate.mjs --round 93 --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`; `node scripts/surface-probe.mjs --checklists` (read each tool's `--help`/header if a flag differs; record what you ran).
3. When `{R}/K94ExecTool/READY` exists, copy the candidate over `$S/lane/scripts/round-gate.mjs` and rerun the battery into `cand/`. Find which tools pin round-gate bytes (`grep -n "round-gate" $S/lane/scripts/*.mjs $S/lane/SCORECARD.md`); for `pin.round-gate` in SCORECARD.md, re-pin in the SANDBOX copy only to the candidate sha256 and rerun proxy-check -> `cand/proxy-repinned.txt`. Also count which other files carry the old sha `09d4d792`.
4. Write `battery-diff.txt`: per tool BASE vs CAND verdict line + exit; name every difference and whether it is the expected pin drift. Remove `$S` before you yield.
# Acceptance
`base/`, `cand/`, `battery-diff.txt`; one line per tool: same/expected-pin/regression.""")

item('K94ScribeSources', 'scribe', f"""# Target
Draft SOURCES rows for round 94. Writable: `{R}/K94ScribeSources/` only.
# Change
1. Read `{L}/corpus/SOURCES.md` header and rows S266-S270 (11 columns `| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |`; no `|` inside any cell; recheck is an ISO date, `NNd` or a symbolic cadence like `on-release`). The next free id is S271.
2. Open each source yourself (curl into your scratch; record URL, access date 2026-11-06, HTTP status, sha256 of the body):
   (a) git's revision syntax manual, the `<sha1>` entry (https://git-scm.com/docs/gitrevisions) — the sentence that a leading substring of an object name that is unique in the repository names that object;
   (b) GitHub Docs "Getting permanent links to files" (https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files) — the sentence about the commit id in a permanent link (the lane already cites a sentence of this page somewhere — grep SOURCES.md for `permanent` first; if a row exists, draft a NEW row only if your quote teaches something that row does not, else say so);
   (c) oh-my-pi `packages/coding-agent/src/config/retry-fallback-chains.ts` at `79fa222e8390aed3494f4bc6746814e6c74c21cf` (raw.githubusercontent.com/can1357/oh-my-pi/<pin>/<path>; if the path 404s, find the file in the tree listing at that pin via the GitHub API and record the real path) — r93 used it without a SOURCES row (routed defect M93-2).
3. For each: a located quote of <= 25 words copied byte-exact, with line numbers or section anchor; a draft row with `used-by` = `corpus/knowledge/round-gate-declared-pins.md` for (a)(b) and the r93 knowledge entry `corpus/knowledge/seat-route-retry-fields.md` for (c); status `mined`.
4. Validate: copy `{L}/corpus/` to scratch, append your rows, run `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/corpus/SOURCES.md` -> must exit 0; save output.
# Acceptance
`rows.md` (draft rows), `quotes.md` (URL, date, status, sha256, quote, location per source), `census.txt`; any source refused, with reason and flip.""")

item('K94ScribeLesson', 'scribe', f"""# Target
Draft the round-94 lesson skeleton and the knowledge entry. Writable: `{R}/K94ScribeLesson/` only.
# Change
1. Read `{L}/corpus/lessons/round-93.md` (format), `{L}/corpus/lessons/round-93-verifier-spotcheck.md` (5 routed defects), `{R}/plan.md`, and `{L}/corpus/QUALITY.md` (criteria Q80-Q87 at least) and `{L}/corpus/knowledge/seat-route-retry-fields.md` (entry format, frontmatter `source:` ids).
2. Draft `knowledge-round-gate-declared-pins.md`: what the gate's citation resolution is (lane -> main -> origin -> declared), the frozen rule sentence verbatim, why a registry pin and not an allow-list file (the registry is the lane's evidence that the source was opened), the seven red rounds that stay red and why (one line each: what the token is, found by `grep -rn <token> {L}` and the fleet report), and limits (prefix ambiguity across two pins; a pin deleted from SOURCES re-reds old reports). Leave `source:` ids as placeholders `S27x` for the L1.
3. Mine ONE mistake for `## Mistakes` (class · evidence pointer · captured-by · fix): candidate — r93 filed a report whose own lane gate was red (`round-gate` COMMIT_CITED_UNRESOLVED) and recorded it as an erratum instead of repairing the gate or the citation that round. Check it against the r93 report (`/home/vgpnk/Projects/shokunin/.ufo/reports/round-93/kumitate.md`, read-only) and find whether any QUALITY criterion should have caught it (captured-by), and propose a QUALITY criterion draft (Q88) whose check can FAIL: give the exact command and show it failing on r93 and passing on a round whose gate was clean (run it; save receipts under `receipts/`).
4. Check the 7 red rounds: for each token, is it a typo of a real lane/fleet commit (`git -C {L} rev-parse --disambiguate=<prefix>` style reads; `git -C /home/vgpnk/Projects/shokunin log --all --format=%H | grep ^<prefix>`)? Record in `red-rounds.md`.
# Acceptance
`knowledge-round-gate-declared-pins.md`, `lesson-draft.md` (Mistakes + Q88 draft), `red-rounds.md`, receipts.""")

item('K94Scout', 'scout', f"""# Target
Ground the rule's two design choices in primary sources and in upstream git behaviour. Writable: `{R}/K94Scout/` only (write `K94Scout.md` there; that file is your trailer).
# Change
1. Prefix semantics: in a scratch fixture (`D=$(mktemp -d -p {SCR}/K94Scout fx.XXXXXX)`), show with real git that `git cat-file -e <7-hex>^{{commit}}` resolves a unique prefix and fails on an ambiguous one (create two objects sharing a short prefix is hard; instead show `git rev-parse --disambiguate=<4 hex>` lists >1 candidate and `cat-file -e <4hex>` fails). Save the transcript. Conclude whether the rule's "prefix of a declared pin" mirrors git's own abbreviation semantics, and what the rule should do when a token prefixes TWO declared pins (count the lane's current 11 distinct pins: any shared 7-hex prefix?).
2. Count in `{L}/corpus/SOURCES.md` (read-only): registry rows with any 40-hex URL path segment; distinct pins; rows by status among them; any 40-hex that appears in a non-URL position (digest columns). Commands + outputs.
3. Fetch https://git-scm.com/docs/gitrevisions and https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files ; quote (<= 25 words each, byte-exact) the sentences that ground (a) unique leading substring and (b) commit id in permanent URLs. Record HTTP status and sha256.
4. Sibling practice (read-only): do other lanes' gates under `/home/vgpnk/Projects/shokunin/*-shokunin/scripts/` treat external pins specially? `grep -ln "COMMIT_CITED\\|cat-file -e" ...` and summarize 1 line each.
# Acceptance
`K94Scout.md` with commands, outputs, quotes; scratch removed.""")

item('K94Connector', 'connector', f"""# Target
Sibling-overlap and fleet-contract scan for the declared-pin rule. Writable: `{R}/K94Connector/` only.
# Change
1. The fleet integrator's own report-conformance check (`/home/vgpnk/Projects/shokunin/PROTOCOL.md`, search "cited" / "ancestor") — does the fleet rule say a cited hash must be a lane commit? Quote the lines. Would a `declared` external pin pass or fail the fleet check? Is the lane gate stricter or looser than the fleet after the change?
2. Grep every lane's filed reports `/home/vgpnk/Projects/shokunin/.ufo/reports/round-*/*.md` (read-only) for backticked 40-hex tokens adjacent to `github.com` / `upstream` / `pin` wording; count lanes/rounds that cite upstream pins. Which sibling lanes have a `corpus/SOURCES.md` with commit-pinned URLs (count per lane) — i.e. where the same rule would transfer.
3. Check the closure spot-checks of kumitate rounds 46 53 57 61 62 63 and 12 (`{L}/corpus/lessons/round-<N>-verifier-spotcheck.md` where present) for how the closer treated the unresolved token then.
# Acceptance
`K94Connector.md`: fleet-rule quote + verdict, transfer table, closure-history notes, each with the command used.""")

item('K94Sentinel', 'sentinel', f"""# Target
Security/robustness of the new SOURCES read in the candidate. Writable: `{R}/K94Sentinel/` only.
# Change
1. Candidate-independent first: on `ctl-positive` (regenerate: `python3 {R}/probe/make-controls94.py {L}/scripts/round-gate.mjs {SCR}/K94Sentinel/controls`), probe: (a) ReDoS — a SOURCES.md with a 1 MB row of `https://` + `a/`*N and long hex runs; time the gate (prlimit + timeout); (b) a SOURCES.md that is a FIFO, a symlink to /dev/zero, a directory, a 200 MB file — does the gate hang, crash (INTERNAL_ERROR) or degrade? (c) a token injection: can a crafted report token make the gate read outside `<repo>/corpus/SOURCES.md`? (d) does the rule ever print SOURCES content verbatim?
2. When `{R}/K94ExecTool/READY` exists, repeat on the candidate (copy beside `{L}/scripts/cap-spawn.mjs`/`cap-run.mjs` in scratch, run with explicit `--repo <fixture>`).
3. Classify each finding: blocker (must fix before integration) / routed / none, with the receipt.
# Acceptance
`K94Sentinel.md` with timings, exits and a finding table; scratch removed.""")

item('K94Reviewer', 'reviewer', f"""# Target
Review the candidate against the frozen rule by hand. Writable: `{R}/K94Reviewer/` only.
# Change
1. Candidate-independent first: from `{L}/corpus/SOURCES.md` derive by hand (shell: grep/awk) the set of declared pins under the frozen rule; list them with row id + status; derive which of the 8 currently red rounds' tokens (`node {L}/scripts/round-gate.mjs --round <N> --json` for N in 12 46 53 57 61 62 63 93; read citations.unresolved) the rule would declare. Expected: only round 93's two tokens.
2. When READY exists: read `{R}/K94ExecTool/diff.txt` line by line. Check: the rule sentence vs code (row regex, status column index on a row whose cells contain backticks, URL regex terminators, split on `/?#`, startsWith, 40-hex exact), laziness (no SOURCES read when no token reaches the declared step), `citations.declared` in JSON on every path including fail-closed `--json`, header doc accuracy, selftest arms actually assert what their names say (read each new arm). Run the counter once on the candidate -> `score.txt`.
3. List defects as blocker / non-blocker with line numbers.
# Acceptance
`K94Reviewer.md`: hand-derived pin set, defect list, counter verdict line.""")

item('K94CriticA', 'critic', f"""# Target
Attack the frozen counter: can a wrong tool reach HELD? Writable: `{R}/K94CriticA/` only.
# Change
1. Read `{R}/probe/probe94-c1.mjs` and `{R}/plan.md`. Build >= 5 wrong-but-plausible gates (patch copies of `{L}/scripts/round-gate.mjs` in scratch; keep each beside a copy of `cap-spawn.mjs`/`cap-run.mjs`) that violate the frozen rule in a way the counter might miss, e.g.: declare only tokens of length >= 8; hardcode the token `79fa222e`; read SOURCES from the fleet repo instead of `--repo`; declare by case-insensitive match; accept any 40-hex in the `source` cell even without `http`; skip the status filter only for `superseded`/other statuses; treat `?` but not `#`; special-case round 93.
2. Score each with the counter run form; record verdict lines in `constructions.md` (construction, the rule clause it violates, counter verdict). A construction that reaches HELD while violating the rule is a COUNTER finding (it does not change the frozen verdict; it is routed and reported).
3. Also attack (b)/(c): could a candidate that changes some unrelated check pass (c)? (e.g. one that drops `SCORECARD_PLAN_MISSING` warnings only when severity warning) — try one.
# Acceptance
`constructions.md` with >= 5 rows and verdicts; scratch removed.""")

item('K94CriticB', 'critic', f"""# Target
Attack the claim's framing and the harm surface. Writable: `{R}/K94CriticB/` only.
# Change
1. Is this a real operability move or a lowered bar? Argue both sides with evidence: the change turns one error green; would a closure have reached the same verdict anyway (r93 spot-check §1 already classified `79fa222e` as "not a defect of ancestry")? Does `declared` weaken the gate for future reports (a seat could add a SOURCES row to silence a typo)? Measure: how hard is it to silence a typo'd lane hash by adding a registry row — what other lane gate (`{L}/scripts/sources-check.mjs`, census) would catch a junk row (try in a scratch copy of `{L}/corpus/`; run `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <copy>/SOURCES.md` and `node {L}/scripts/sources-check.mjs` with whatever flag points it at the copy — read its header).
2. Do-nothing control check: confirm `{R}/controls/ctl-nothing.txt` is UNMET for the right reason and re-run it yourself once with the counter run form (tool = `{L}/scripts/round-gate.mjs`).
3. When READY exists: run the counter on the candidate once; and list any behaviour change outside the citation check you can find by diffing `--json` outputs of BASE vs candidate on 5 rounds of your choice.
# Acceptance
`K94CriticB.md`: verdict on the framing (sound / weak / unsound) with reasons and receipts.""")

item('K94Mutation', 'mutation-tester', f"""# Target
Mutation-test the candidate's NEW code (kill rule K2). Writable: `{R}/K94Mutation/` only.
# Change
1. When `{R}/K94ExecTool/READY` exists (look after reading the plan and the counter; at most 10 minutes of waiting total; if absent, mutate `ctl-positive` regenerated via `{R}/probe/make-controls94.py` and say so), copy the candidate into scratch beside copies of `{L}/scripts/cap-spawn.mjs` and `cap-run.mjs`.
2. Apply >= 12 single-point mutants, each inside the new/changed lines (`diff -u {L}/scripts/round-gate.mjs <candidate>`): include the six rule shapes of the plan's controls (blanket, substring, anyline, contains, norejfilter, slashonly) plus regex boundary mutants (`{{40}}` -> `{{7,40}}`, `S\\d{{3,}}` -> `S\\d+`, status index 8 -> 7, `rejected` case-sensitive, lazy-read removed, declared pushed to unresolved).
3. For each mutant run `node <mutant> --selftest` (exit + failing arm names) AND the counter run form. Status per mutant: KILLED-by-selftest / KILLED-by-counter-only / SURVIVED / EQUIVALENT (argue). Table -> `mutants.md`, receipts under `runs/`.
# Acceptance
`mutants.md` with >= 12 rows; selftest kill count; survivors named with the arm that should catch them.""")

spec = {
    'wave': 'kumitate-r94-w1',
    'reportDir': '.ufo/waves/round-94/w1',
    'maxLanes': 16,
    'context': context,
    'items': items,
}
with open(f'{R}/w1-spec.json', 'w', encoding='utf-8') as f:
    json.dump(spec, f, indent=1)
print(len(items), 'items')
