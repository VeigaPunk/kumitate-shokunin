VERDICT: D3 is confirmed at three `-2` labels but only in the host session store (0 in the lane's `w2/` or `w2-results.json`), the report's 57% m_flash figure is computed over a role set no document defines (the addendum's set equals the strict set: 35/79 = 44.30%), a second unreported floor miss is the wave-2 seat count (39 vs plan's ≥40), and `69/69` reproduces exactly at `bb184a90` and `6825a514` (with `25/25` at the freeze commit `b38a2065`) — all three corrections drafted, nothing integrated.

## Evidence

Scratch `/tmp/kumitate-r64/K64ScribeErratum/`; all commands from `/home/vgpnk/Projects/shokunin` on 2026-10-25.

**F1 — the `-2` stems (D3).**
```
$ find ~/.omp/agent/sessions -name 'K63*-2.jsonl' -printf '%f\n' | sort
K63R2ConnRoutedDefects-2.jsonl
K63R2ScoutHostRecords-2.jsonl
K63R2ScoutLeftovers-2.jsonl
$ ls kumitate-shokunin/.ufo/waves/round-63/w2 | grep -c -- '-2\.md$'
0
$ ls kumitate-shokunin/.ufo/waves/round-63/w2 | wc -l
40
$ python3 -c "import json;d=json.load(open('kumitate-shokunin/.ufo/waves/round-63/w2-results.json'));print('results',len(d['results']),'seats',d['seats'],'names ending -2:',[r['name'] for r in d['results'] if r['name'].endswith('-2')])"
results 39 seats 39 names ending -2: []
$ find ~/.omp/agent/sessions -name 'K63R2ConnRoutedDefects.jsonl' -o -name 'K63R2ScoutHostRecords.jsonl' -o -name 'K63R2ScoutLeftovers.jsonl' | wc -l
0
$ grep -o '# Seat K63[A-Za-z0-9_-]*' ~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b/K63R2ScoutLeftovers-2.jsonl | sort -u
# Seat K63R2ScoutLeftovers
```
Each `-2` stem also has a `.md` yield summary (301/348/407 bytes), 2 `yield` call rows and a `session_exit` row.

**F2 — seat mix from the dispatch registries.**
```
$ python3 -  # counts roles in w1-dispatch.json / w2-dispatch.json 'registry'.'members'
w1: n=40 roles={'connector': 3, 'critic': 3, 'executor': 13, 'mutation-tester': 3, 'revenger': 1, 'reviewer': 4, 'scout': 5, 'scribe': 6, 'sentinel': 1, 'simplifier': 1} strict(addendum set)=20/40=50.00% loose(exec+scribe+simpl+critic+revenger+sentinel)=25/40=62.50%
w2: n=39 roles={'connector': 2, 'critic': 5, 'executor': 11, 'mutation-tester': 3, 'reviewer': 12, 'scout': 2, 'scribe': 3, 'simplifier': 1} strict(addendum set)=15/39=38.46% loose(exec+scribe+simpl+critic+revenger+sentinel)=20/39=51.28%
round: n=79 strict=35/79=44.30% loose=45/79=56.96%
labrat 0 sonic 0
```
`w1-spec.json`/`w2-spec.json` role counts are identical (40 / 39 items).

**F3 — the addendum's m_flash set, and the "run-7 map".**
```
$ grep -n 'm_flash roles carry' -A2 .ufo/prompts/kumitate-round-63.md
159:  (cross-claim/cross-source pattern finding). **"use more m_flash":** m_flash roles carry the
160-  majority of every wave (≥50% of seats as executor/scribe/labrat/sonic/simplifier) — drafting goes
161-  to scribes, runnable checks to executors/labrats; attack share (≥25%) is met with
$ grep -rl 'run-7' .ufo/prompts/ | wc -l
0
$ ls .ufo/prompts/*.md | wc -l
543
$ grep -rn 'run-7 map' --include=*.md . | grep -v -e '/\.git/' -e '/\.ufo/reports/' -e '/build/' -e 'K64ScribeErratum' | wc -l
0
```

**F4 — wave-2 floor.** `grep -n 'Wave 2' kumitate-shokunin/.ufo/waves/round-63/plan.md` → `137:falsifiers. Wave 2 (>= 40 seats, only if wave 1 yields >= 32 distinct attack items): fresh reviewers /`; `w2-spec.json` items = 39.

**F5 — selftest tally (D2), `git archive` + run in scratch.**
```
rev=6825a51425e91908f019ed65aa2f4209acbd7087 exit=0   INLINE_DISPATCH_SELFTEST: PASS (69/69)   case-lines=69
rev=bb184a901d88193cf582de03c57e39945df65f15 exit=0   INLINE_DISPATCH_SELFTEST: PASS (69/69)   case-lines=69
rev=b38a2065ab8ac5b198f6569b9013d04411c3d40d exit=0   INLINE_DISPATCH_SELFTEST: PASS (25/25)   case-lines=25
```
F6: `git -C kumitate-shokunin cat-file -e dfa6fca8…:scripts/inline-dispatch-evidence.mjs` → `fatal: … not in 'dfa6fca8…'` (base has no gate).

## Findings

1. **K64ScribeErratum-1 — medium — the round-63 report's "one w2 label landed as `K63R2ConnRoutedDefects-2`" undercounts.** Three wave-2 seats carry `-2` host transcripts (`K63R2ConnRoutedDefects-2`, `K63R2ScoutHostRecords-2`, `K63R2ScoutLeftovers-2`); no base-name transcript exists for any of them, and each transcript's `# Seat` marker is the base name. The verifier's count of three is right; its location is not — the lane's `w2/` holds 40 files with 0 `-2.md` stems and `w2-results.json` holds 39 names, none ending `-2`. Repro: F1 block above.
2. **K64ScribeErratum-2 — high — the report's 57% m_flash figure answers a role set no document defines.** The run-63 prompt defines the set as `executor/scribe/labrat/sonic/simplifier` (`.ufo/prompts/kumitate-round-63.md:160`), and no file among 543 prompts mentions a "run-7 map"; the report's set adds critic/revenger/sentinel. With 0 labrat and 0 sonic dispatched, the addendum's count equals the strict count — 35/79 = 44.30% round-wide, w1 20/40 = 50.00% (exactly on the ≥50% line the addendum applies to "every wave"), w2 15/39 = 38.46%. The 45/79 = 56.96% arithmetic is right; the label is not. Repro: F2 + F3.
3. **K64ScribeErratum-3 — low — a second seat floor miss is unreported.** `plan.md:137` states "Wave 2 (>= 40 seats …)"; the wave ran 39. The report names only the round-wide 79-vs-80–100 miss. Repro: F4.
4. **K64ScribeErratum-4 — info — the `69/69` tally is verified, not merely asserted, and D2 stays open for round 63.** `PASS (69/69)` exit 0 at the round-63 tip `bb184a90` and at the round-64 base `6825a514`; `PASS (25/25)` exit 0 at the freeze commit `b38a2065`, which verifies the report's "25 → 69". What the round-63 tree lacked is a committed transcript (the verifier's D2); the round-64 plan answers it with one. Repro: F5.
5. **K64ScribeErratum-5 — info — the "harness label dedupe" cause is unmeasured.** `/fast/scratch/hyaku-run7/dispatcher.log` carries no per-seat name lines (`grep -n 'K63' <log>` → no output), so nothing on this host records which label collided; the erratum keeps the cause as an attribution, not a fact. Repro: `grep -n 'K63' /fast/scratch/hyaku-run7/dispatcher.log`.

## Artifacts

- `.ufo/waves/round-64/build/K64ScribeErratum/erratum.md` — Part A (append text for `corpus/lessons/round-63.md` §`## Round-64 erratum`), Part B (paragraph for the round-64 report §`## Landed changes`, quoting the four superseded sentences verbatim), Part C (one command per fact with verbatim output), Limits.
- `/tmp/kumitate-r64/K64ScribeErratum/{f1,f2,f3}.txt`, `st-<rev>.txt`, archives `arch/`, `a-bb184a90…/`, `a-b38a/` (scratch; not committed).
- This report: `.ufo/waves/round-64/w1/K64ScribeErratum.md`.

## Limits

- Not measured: the cause of the three `-2` suffixes; the gate's live resolution of the `-2` stems at `--round 63 --wave w2` (round-63 receipts' claim, not re-run here); each seat's `model_change` row, so F2 is declared role share, not measured provider answers; the round-63 controls count `14 → 75`; every other round-63 number outside the four corrected items.
- Drafted only: no file outside this report and the build directory was written; the lane's `corpus/`, `scripts/`, `SCORECARD.md`, `LOG.md` and the fleet repo are untouched; no git/jj mutating command, no tool install, no subagent.
