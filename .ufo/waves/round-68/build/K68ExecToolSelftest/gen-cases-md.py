#!/usr/bin/env python3
"""gen-cases-md.py — render cases.md from cases.json + the two run receipts.

Inputs (same directory): cases.json (emitted by run-cases.mjs --emit-json against the v2 draft),
v1-run.txt and v2-run.txt (runner receipts). Output: cases.md.

Kept beside the suite so the spec table is never hand-maintained: re-run this after any case change.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
d = json.loads((HERE / 'cases.json').read_text())
cases = d['cases']


def parse(name):
    out = {}
    cur = None
    for line in (HERE / name).read_text().split('\n'):
        m = re.match(r'^CASE (ok  |FAIL) (\S+) ', line)
        if m:
            cur = m.group(2)
            out[cur] = {'st': m.group(1).strip(), 'why': ''}
        elif line.startswith('     :: ') and cur:
            out[cur]['why'] = line[8:]
    return out


v1 = parse('v1-run.txt')
v2 = parse('v2-run.txt')
if len(v1) != len(cases) or len(v2) != len(cases):
    sys.exit('receipts do not cover every case: v1=%d v2=%d cases=%d' % (len(v1), len(v2), len(cases)))

V1_SHA = 'f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5'
V2 = '.ufo/waves/round-68/build/K68ExecToolV2/routed-ledger.mjs'
V2_SHA = d['tool_sha256']


def cell(tool, cid):
    return 'ok' if tool[cid]['st'] == 'ok' else '**FAIL**'


def esc(s):
    return str(s).replace('|', '\\|')


def expectation(c):
    e = c['expect']
    bits = ['exit %d' % e['exit']]
    if e.get('verdict'):
        bits.append('`%s`' % e['verdict'])
    if e.get('finding'):
        bits.append('FINDING %s' % e['finding'])
        if e.get('detail'):
            bits.append('detail `%s`' % e['detail'])
    if e.get('selftestMin'):
        bits.append('n >= %d' % e['selftestMin'])
    if c.get('expectLines'):
        bits.append('lines ' + ', '.join('`%s`' % x for x in c['expectLines']))
    if e.get('noLine'):
        bits.append('no `%s`' % e['noLine'])
    return esc(' '.join(bits))


rows = []
for c in cases:
    rows.append('| {} | {} | {} | `{}` | {} | {} | {} |'.format(
        c['id'], c['group'], esc(c['fixture']), ' '.join(c['argv']),
        expectation(c), cell(v1, c['id']), cell(v2, c['id'])))
INDEX = '\n'.join(rows)

HARDENINGS = [
    ('B01', 'H1 GIT_DIR-inherited repo escape (`--rev` reads a foreign repo)'),
    ('B02', 'H1 GIT_DIR-inherited selftest escape (writes into a foreign repo)'),
    ('B03', 'H2 symlink answer escape'),
    ('B04', 'H2 `..` ledger escape'),
    ('B05', 'H2 symlinked ledger'),
    ('B06', 'H3 second routed section silently missed'),
    ('B07', 'H4 one-word quote binding'),
    ('B08', 'H4 ambiguous quote binding'),
    ('B09', 'H5 ±2-line answer window'),
    ('B10', 'H6 fence-blind item count (isolated: a correct ledger)'),
    ('A16', 'H6 fence-blind item count (binding: a row quoting fenced text)'),
]
hrows = []
for cid, label in HARDENINGS:
    c = next(x for x in cases if x['id'] == cid)
    hrows.append('| {} | {} | {} | {} | {} |'.format(cid, esc(label), esc(c['fixture']), expectation(c), cell(v1, cid)))
HTAB = '\n'.join(hrows)

MUT = [('good', 'A01'), ('drop', 'A02'), ('quote-swap', 'A03'), ('quote-decoy', 'A04'), ('answer-wrong', 'A05'),
       ('answer-ledger', 'A06'), ('answer-eof', 'A07'), ('dup', 'A08'), ('ordinal', 'A09'),
       ('nested-as-item', 'A10'), ('prose-as-item', 'A11'), ('long-quote', 'A12'), ('one-word-quote', 'A13'),
       ('ambiguous-quote', 'A14'), ('shifted-answer', 'A15'), ('fence-item', 'A16'), ('second-section', 'A17'),
       ('contradictory', 'A18'), ('no-section', 'A19'), ('ledger-absent', 'A20')]
mrows = []
for mut, cid in MUT:
    c = next(x for x in cases if x['id'] == cid)
    e = c['expect']
    want = e.get('finding') or ('CLEAN' if e['exit'] == 0 else 'FAIL-CLOSED')
    mrows.append('| {} | {} | exit {} / {} | {} |'.format(mut, cid, e['exit'], want, cell(v2, cid)))
MTAB = '\n'.join(mrows)

v1fails = [k for k, x in v1.items() if x['st'] != 'ok']
v1failtxt = ', '.join(v1fails)

DOC = """# K68ExecToolSelftest — `routed-ledger` v2 acceptance suite (54 cases)

VERDICT: 54 named cases, each with its own fixture, exact command and expected exit + verdict; the v2
draft passes 54/54 and v1 passes 35/54, so every arm of the round-68 v2 contract is measured red-before
and green-after without touching the frozen counter.

Round 68 (wave w1), lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Contract under test:
`kumitate-routed-ledger-v2`. Subject: `scripts/routed-ledger.mjs` (v1 today). The frozen predicate whose
L4 arm this suite extends: `.ufo/waves/round-68/probe/ledger68-probe.mjs`, rule L68 v1 (checks L1-L7).

## 1. How to run

```
node .ufo/waves/round-68/build/K68ExecToolSelftest/run-cases.mjs --tool <path-to-tool> \\
     --scratch /fast/scratch/hyaku/kumitate-r68/K68ExecToolSelftest/suite [--only A|B|C|D|E|F|<ID>] \\
     [--emit-json cases.json] [--keep] [--verbose] [--list]
```

Printed per case: `CASE ok|FAIL <id> <name>` plus a `::` diagnostics line on failure; last line
`ROUTED_LEDGER_ACCEPTANCE: PASS (54/54)` or `FAIL (n/54)`; the runner exits 0 only when all 54 pass.
Nothing is written outside `--scratch` (removed on exit unless `--keep`). `cases.json` carries every
case's exact fixture bytes (path + sha256 + content), argv, env overrides and expectation, so a consumer
can materialise the fixtures without this runner. `cases.md` is rendered from `cases.json` and the two
receipts by `gen-cases-md.py`.

Judged per case: (a) process exit code, (b) the last stdout line against a regex, (c) presence of
`FINDING <ID> ` for the DRIFT arms, (d) that finding line against a detail regex where the detail is the
disambiguator, (e) named stdout lines (`CLASS`/`RECURRENT`) and forbidden prefixes where it matters. The
exit-code contract is v1's: 0 CLEAN / 1 DRIFT / 2 FAIL-CLOSED / 64 USAGE.

Receipts in this directory: `v2-run.txt` (v2 draft, 54/54), `v1-run.txt` (v1, 35/54), `cases.json`,
`b02-gitdir-escape.txt` (the foreign-repo commit v1's own selftest leaves behind).

## 2. Fixture families

Every fixture carries these files under `{root}` unless it says otherwise:

```
corpus/lessons/round-101-verifier-spotcheck.md
corpus/lessons/round-102-verifier-spotcheck.md
notes/a.md
corpus/routed-ledger.md          # the ledger under test
```

`round-101`'s routed section (`## 5. Routed defects for round 102`) holds five items in order: D1 (list
item with a nested-bullet continuation), D2 (`1.` ordered item), D3 (table data row), D4, D5; a prose
paragraph after D2 is not an item; a `## 1. Verdicts` bullet and a `## 6. Non-author statement` bullet sit
outside the section. `round-102` (`## Routed items`) holds two items. `notes/a.md:3` is
`answer alpha bravo charlie delta echo`, so the answer quote `alpha bravo charlie delta` sits on line 3 and
nowhere else; line 2 carries `answerline bravo3 charlie3` for the wontfix arm.

Base ledger (7 rows; classes `reference-drift`, `section-drift`, `tally-drift`):

```
| A1 | 101 | 1 | "bravo charlie delta echo"    | reference-drift | closed | `notes/a.md:3` - "alpha bravo charlie delta" |
| A2 | 101 | 2 | "juliet kilo lima mike"       | section-drift   | open   | - |
| A3 | 101 | 3 | "xray yankee zulu"            | section-drift   | open   | - |
| A4 | 101 | 4 | "bravo2 charlie2 dup-trio"    | section-drift   | open   | - |
| A5 | 101 | 5 | "foxtrot2 golf2 dup-trio"     | section-drift   | open   | - |
| A6 | 102 | 1 | "kilo2 lima2 mike2"           | section-drift   | open   | - |
| A7 | 102 | 2 | "november2 oscar2 papa2"      | tally-drift     | open   | - |
```

Token design: D4 and D5 both contain the three-word phrase `dup-trio echo2 shared-token`; no base row
quotes it — it is the ambiguity carrier for A14/B08. `section-drift` spans rounds 101 and 102 (the
multi-round class arm E01). Every quote is 3-4 words, word-boundary unique in its section.

Families:

- **plain** — the section above with no fenced block; v2 item counts 5 + 2 = 7. Used wherever one defect
  has to be isolated; v1 reads the base ledger CLEAN here (B01/B04/B05/E01 all show that).
- **good / fence-item / fence-shift / no-section** — the same section with a fenced code block holding a
  column-0 bullet (`- fence-bravo codeline here`) between item 3 and item 4: the shape that makes v1 count
  the fenced line as item 4. v2 counts 5 + 2 (or 5 with no routed section in round 102); v1 counts 6 (8
  with round 102).
- **git-dir** — `plain` plus two repos: `fx/root` (HEAD commits the ledger with A6 removed, DRIFT; the
  worktree ledger is the CLEAN base, so `--rev HEAD` and the worktree disagree) and `fx/decoy` (a foreign
  repo whose HEAD holds the CLEAN base). The tool runs with `GIT_DIR=<decoy>/.git`.
- **answer-symlink** — `plain` with `notes/out.md -> ../../outside/answer.md` (target outside `{root}`,
  holding `notes/a.md`'s bytes); row A1 answers at `notes/out.md:3`.
- **ledger-dotdot** — `plain` with no ledger in the tree and a valid CLEAN ledger at `fx/outside-ledger.md`,
  reached with `--ledger ../outside-ledger.md`.
- **ledger-symlink** — `plain` with `corpus/routed-ledger.md -> ../../outside-ledger.md` (valid CLEAN).
- **round59 / round66 / round55** — one real-lane spot-check excerpt (verbatim routed section: round-59
  prose, round-66 D1-D3 + operator note, round-55 V1/V2/carried) plus an empty `## Ledger` table, run with
  `--from N --to N`.
- **recurrent4 / recurrent3** — rounds 201-204 (or 201-203), one item each, all in class
  `recurring-class`, for the RECURRENT threshold.

## 3. Case index

`argv` = the exact command tail after `<tool>`; `{root}` is the fixture root, `{nonexistent-root}` a path
that does not exist. Expectations are regexes on the last stdout line plus the finding requirement; `v1` /
`v2` are measured, not asserted.

| id | grp | fixture | argv | expectation | v1 | v2 |
|---|---|---|---|---|---|---|
{INDEX}

## 4. The six hardenings: red before, green after

v1 = `scripts/routed-ledger.mjs` at the lane tip (sha256 `{V1_SHA}`); v2 =
`{V2}`, sha256 `{V2_SHA}`.

| case | hardening | fixture | expectation | v1 |
|---|---|---|---|---|
{HTAB}

### H1 — GIT_DIR inherited into the selftest and into `--rev`

**B01**: the fixture's committed HEAD drops row A6, so committed bytes are DRIFT while the worktree ledger
is CLEAN; `GIT_DIR` names a foreign repo whose HEAD is CLEAN.

```
$ GIT_DIR=<decoy>/.git node scripts/routed-ledger.mjs --root <root> --rev HEAD --from 101 --to 102
v1: exit 0 - ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0
v2: exit 1 - ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=7 rows=6 open=5 closed=1 wontfix=0
              findings=1 first=UNLEDGERED:round-102-item-1
```

v1 never reads the fixture: `git -C <root> show ...` obeys the inherited `GIT_DIR`. **B02** is the write
side — v1's own `--selftest` commits its fixture into the foreign repo (receipt `b02-gitdir-escape.txt`):

```
$ GIT_DIR=<decoy>/.git node scripts/routed-ledger.mjs --selftest
v1: exit 0 - ROUTED_LEDGER_SELFTEST: PASS (33/33)
$ git -C <decoy> log --oneline
48d6c5e fixture            <- the selftest's own commit, in a repo that is not its fixture
3e24699 decoy (clean)
$ git -C <decoy> status --porcelain
 D corpus/lessons/round-7-verifier-spotcheck.md
 D corpus/lessons/round-8-verifier-spotcheck.md
 M corpus/routed-ledger.md
 D notes/answers.md
?? corpus/lessons/round-101-verifier-spotcheck.md
?? corpus/lessons/round-102-verifier-spotcheck.md
?? notes/a.md

v2: exit 0 - ROUTED_LEDGER_SELFTEST: PASS (56/56), decoy untouched
```

Both arms must pass; the second makes the escape observable instead of theoretical.

### H2 — symlink / `..` escapes from the answer path and the ledger path

**B03**: row A1's answer path is `notes/out.md`, a symlink to a file outside `{root}` whose line 3 carries
the quote.

```
v1: exit 0 - ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0
v2: exit 1 - FINDING ANSWER_DEAD A1@line7:answer-symlink:notes/out.md
```

**B04** (`--ledger ../outside-ledger.md`) and **B05** (a symlinked `corpus/routed-ledger.md`): v1 prints a
CLEAN verdict, exit 0, in both; v2 exits 2 with
`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-escape:../outside-ledger.md` (B04) and
`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-symlink:corpus/routed-ledger.md` (B05). v1's only containment
test is the `..`/absolute check on the *answer* path, never applied to the ledger and never resolved
through the real path of what it reads.

### H3 — the second routed section

**B06/A17**: round 102 carries `## Routed items` (2 items) and `## Routed items (amended)` (1 more).

```
v1: exit 0 - ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0
v2: exit 1 - ROUTED_LEDGER: DRIFT spotchecks=2 sections=3 items=8 rows=7 open=6 closed=1 wontfix=0
              findings=1 first=UNLEDGERED:round-102-item-3
```

v1 stops at the first matching heading and ends the section at the next same-level heading, so anything an
amend section adds is invisible and a real routed item can stay unledgered forever.

### H4 — one-word and ambiguous quotes

**B07**: row A2's quote is `juliet`, one word inside D2.

```
v1: exit 0 - ROUTED_LEDGER: CLEAN ...        (no finding: any substring binds)
v2: exit 1 - FINDING ROW_MALFORMED A2@line8:quote-words=1
              plus FINDING UNLEDGERED round-101-item-2 (a malformed row covers nothing; 2 findings, 1 cause)
```

**B08**: row A4's quote is `dup-trio echo2 shared-token`, which occurs in D4 *and* D5.

```
v1: exit 0 - ROUTED_LEDGER: CLEAN ...        (binds the first occurrence)
v2: exit 1 - FINDING QUOTE_AMBIGUOUS A4@line10:round-101-item-4-hits=2
              plus FINDING UNLEDGERED round-101-item-4
```

### H5 — the ±2-line answer window

**B09**: row A1's answer names `notes/a.md:4`, but the quote lives on line 3.

```
v1: exit 0 - ROUTED_LEDGER: CLEAN ...
v2: exit 1 - FINDING ANSWER_DEAD A1@line7:answer-quote-not-at-exact-line:notes/a.md:4
```

v1 normalises lines `n-2 .. n+1` into one string and asks whether it *contains* the quote, so a row can
name the wrong line and still bind.

### H6 — the fence-blind item count

**B10** is the isolated arm: fenced shape, ledger correct for the real section.

```
v1: exit 1 - ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=8 rows=7 open=6 closed=1 wontfix=0
              findings=5 first=QUOTE_ABSENT:A4@line10:round-101-item-4
v2: exit 0 - ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0
```

A correct ledger fails under v1 because the fenced bullet takes an ordinal and shifts D4/D5. **A16** is the
binding half: a row quoting the fenced line (`| A12 | 101 | 4 | "fence-bravo codeline here" |`) is
*accepted* by v1 (its finding list carries nothing for A12 — it binds item 4, the code block) and rejected
by v2 with `FINDING QUOTE_ABSENT A12@line14:round-101-item-4`. Together: v1 invents an item and lets a row
bind to invented text.

## 5. Parity with the frozen counter's L4 table

The counter's 20 mutants map one-to-one; these finding ids and exit codes are the counter's, not this
suite's invention (`.ufo/waves/round-68/probe/ledger68-probe.mjs`, `MUTANTS`).

| counter mutant | case | counter expectation | v2 |
|---|---|---|---|
{MTAB}

Two arms go beyond the counter because it does not pin them: **D06** (`id-round-mismatch`: an id matching
`/^R(\\d+)-/` must agree with its round cell) and **D11**, which guards D06 against over-firing on ids that
encode no round (the counter's own fixtures use `A1..A7`).

## 6. What this suite deliberately does not pin

- `sections=` for a file carrying more than one routed section (A17/B06): v1 counts spot-checks with a
  section, v2 counts sections. The counter pins `sections=` only for the one-section and no-section arms,
  where both readings agree; pinning it here would be an unforced contract break.
- Diagnostic wording beyond the disambiguating token: A15/B09 accept `answer-quote-not-at*:notes/a.md:4`;
  B04/B05 require `reason=ledger-...` but not a fixed suffix; C05 accepts `reason=root-absent` with or
  without the path (v1 printed the path, v2 does not — see the report's finding on diagnostics).
- Absolute ledger line numbers in finding details: matched as `line\\d+`, so adding a row to a fixture never
  silently re-baselines a case.
- Whether an answer *answers* the item: out of scope here and under the counter's stated limit; this suite
  measures binding and location only.
- The lane's real `corpus/routed-ledger.md` content (61 items): L2/L3's measurement. F01-F03 use verbatim
  routed-section excerpts so item parsing is measured independently of the ledger's contents.

## 7. Measured results

| tool | sha256 | acceptance suite | own selftest |
|---|---|---|---|
| v1 `scripts/routed-ledger.mjs` | `{V1_SHA}` | FAIL 35/54 (19 arms red) | `PASS (33/33)` |
| v2 draft `{V2}` | `{V2_SHA}` | **PASS 54/54** | `PASS (56/56)` |

v1's 19 red arms: {V1FAILS}.

Runner exit codes: v1 -> 1 (`ROUTED_LEDGER_ACCEPTANCE: FAIL (35/54)`), v2 -> 0
(`ROUTED_LEDGER_ACCEPTANCE: PASS (54/54)`).
"""

out = (DOC.replace('{INDEX}', INDEX).replace('{HTAB}', HTAB).replace('{MTAB}', MTAB)
          .replace('{V1_SHA}', V1_SHA).replace('{V2_SHA}', V2_SHA).replace('{V2}', V2)
          .replace('{V1FAILS}', v1failtxt))
(HERE / 'cases.md').write_text(out)
print('wrote cases.md (%d lines) from cases.json + receipts' % len(out.split('\n')))
