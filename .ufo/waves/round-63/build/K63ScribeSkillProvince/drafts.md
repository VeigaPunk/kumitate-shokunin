# Round 63 w1 — K63ScribeSkillProvince: paste-ready documentation drafts

Seat: scribe (leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, base
`b38a2065ab8ac5b198f6569b9013d04411c3d40d` (`git rev-parse HEAD` at drafting time; `git status
--porcelain` showed no modified tracked file, so `SKILL.md`, `PROVINCE.md` and `corpus/README.md`
read here ARE the committed bytes).

**Provenance of every fact used.** Committed: the frozen plan (`.ufo/waves/round-63/plan.md`), the
three target files, `corpus/SOURCES.md` (134 rows, last `S195`), `corpus/lessons/round-60.md`,
`corpus/lessons/round-61.md`, `.ufo/waves/round-63/controls/inline/` (14 committed case dirs),
`scripts/proxy-check.mjs`, `scripts/surface-probe.mjs`, `scripts/readme-map.mjs`,
`.ufo/waves/round-63/probe/topology63-probe.mjs`.
**UNCOMMITTED (build-tree only, at drafting time):** `scripts/inline-dispatch-evidence.mjs`
(sha256 `fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd`, 22 548 B, mtime
2026-10-25 17:38) and the captures under `.ufo/waves/round-63/build/K63Capture/`. Every clause taken
from those two is marked `[build-tree]` or `{{L1:…}}`. Nothing here is committed until the L1 pastes
it and commits.

---

## D1 — `SKILL.md` §Gate registry: the `inline-dispatch-evidence` row

### Current last row (verbatim, `SKILL.md:626`, for column style)

```
| dispatch-evidence | gate | `node scripts/dispatch-evidence.mjs --root DIR --round N --wave NAME [--expect planned=N,sessions=N,exit0=N,reports=N]` → `DISPATCH_EVIDENCE: CLEAN (seats=… sessions=… exit0=… reports=… dead=…)` (0 clean · 1 a real defect · 2 fail-closed · 64 usage), contract `kumitate-dispatch-evidence-v1` (round 60): … | `--selftest` (8 hermetic cases in `mkdtemp` fixtures; `DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)` + `VERDICT: PASS`) | the round's committed `launcher-progress.tsv` / `dispatch-actual.json` under `.ufo/waves/round-<N>/<wave>/`; `pin.dispatch-evidence` in `kumitate-gate-pins-v1` |
```

Table header (`SKILL.md:599`): `| name | kind | entry command | self-test | pinned values live in |`
— five columns, one physical line per row, `\|` escaping for a pipe inside a cell.

### DRAFT row — insert as a new line immediately after `SKILL.md:626`

```
| inline-dispatch-evidence | gate | `node scripts/inline-dispatch-evidence.mjs --root DIR --round N --wave NAME [--rev REV] [--sessions-root DIR] [--dispatcher-log FILE\|none] [--report FILE]` → `INLINE_DISPATCH: CLEAN (seats=… sessions=… done=… reports=… dead=…)` / `DRIFT (…) [FINDING]` / `FAIL-CLOSED <arm> [ID]` (0 clean · 1 a real defect · 2 fail-closed · 64 usage), contract `kumitate-inline-dispatch-evidence-v1` (round 63): a run-7 wave is spawned inline by the orchestrator session, so there is no `launcher-progress.tsv` for `dispatch-evidence` to read; this gate binds one wave to three records the lane does not author — the harness's per-seat session transcripts under `~/.omp/agent/sessions` (the seat's `# Seat <name>` marker, the tail of its dispatched task text, the head of the dispatch context, a `session` header, a `session_exit` record and a `yield` call), the orchestrator's dispatcher log (`spawned <lane> <round> <wave> <n>` and `done <lane> <wave> <results path>`, default `/fast/scratch/hyaku-run7/dispatcher.log`), and committed bytes only under `--rev` (every lane file read with `git show REV:path`, never from the worktree); a wave with seats but no matching transcript is DRIFT `NOT_A_DISPATCH`; a dead seat (no `yield` or no clean `session_exit`) is named, never credited as done, and is a finding only when `--report` does not name it (`DEAD_UNNAMED`); other findings `READY_MISMATCH`, `DISPATCH_MISMATCH`, `RESULTS_MISMATCH`, `SESSION_ABSENT`, `SESSION_AMBIGUOUS`, `SESSION_FOREIGN`, `SESSION_ID_DUP`, `PARENT_MISMATCH`, `SPAWN_LOG_ABSENT`, `SPAWN_LOG_MISMATCH`, `DONE_LOG_ABSENT`, `REPORT_ABSENT`, `REPORT_TINY`, `REPORT_DUP`; fail-closed ids `WAVE_ABSENT`, `DISPATCH_UNREADABLE`, `RESULTS_UNREADABLE`, `SESSIONS_ROOT_ABSENT`, `LOG_UNREADABLE`, `REV_UNREADABLE` | `--selftest` (25 hermetic cases in `mkdtemp` fixtures, one of them a committed-bytes arm proving a worktree edit after the commit cannot change the verdict; `INLINE_DISPATCH_SELFTEST: PASS (25/25)` + exit 0) | `pin.inline-dispatch-evidence` in `kumitate-gate-pins-v1`; the 14 committed control cases under `.ufo/waves/round-63/controls/inline/`; the `SCORECARD.md` capabilities row (first-working round 63) |
```

### Accompanying prose edits in the same section (the row is not the only edit)

1. `SKILL.md:589` — `Twenty are gates` → `Twenty-one are gates`, and append to the parenthetical
   list `, `inline-dispatch-evidence` round 63` after `dispatch-evidence` round 60`. Reason: the
   table carries exactly 20 `gate` rows today (counted over `SKILL.md:600-626`), the new row makes 21.
2. `SKILL.md:593-594` — `Verdict map for all twenty` → `Verdict map for all twenty-one`.
3. Left alone deliberately: `SKILL.md:596` still says `"all nineteen" above still counts the gates
   only` — a pre-existing stale numeral (the registry has said twenty since round 60). It is not
   this row's business and I did not renumber it; flagging it here so the L1 does not read the
   mismatch as a drafting error.

### Fact sources for D1

Committed: contract id, the three-record binding, the `NOT_A_DISPATCH` reading and the frozen
predicate I1–I6 (`plan.md` §C1, which also names the default dispatcher log and the sessions root).
`[build-tree]`: the exact usage string, the finding-id list, the fail-closed-id list, the 25-case
count. **Verified once, not rerun:** `node scripts/inline-dispatch-evidence.mjs --selftest` on the
uncommitted file printed `INLINE_DISPATCH_SELFTEST: PASS (25/25)` and exit 0 (quoted in the report).
`{{L1: the sha256 to pin as pin.inline-dispatch-evidence at the commit that lands the file}}`.
`{{L1: decide whether the 14-control sentence stays in the row or moves to the capability row}}`.

---

## D2 — `SKILL.md` §Verifiable checklist: one item, and what it does to term `C`

### Current last item (verbatim, `SKILL.md:725`, item 30 of 30)

```
- [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispatch-evidence-v1`) — `node scripts/dispatch-evidence.mjs --selftest` → exit 0 + `DISPATCH_EVIDENCE_SELFTEST: PASS`, and `node scripts/dispatch-evidence.mjs --root <lane> --round <N> --wave <w>` over the round's committed launcher record → exit 0 + `DISPATCH_EVIDENCE: CLEAN`
```

### DRAFT item — append after `SKILL.md:725`

```
- [ ] Inline dispatch-evidence gate (round 63; contract `kumitate-inline-dispatch-evidence-v1`) — `node scripts/inline-dispatch-evidence.mjs --selftest` → exit 0 + `INLINE_DISPATCH_SELFTEST: PASS`
```

**One command, deliberately.** The checklist grammar is frozen and single-command:
`CHECKLIST_RE = /^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u`
(`scripts/surface-probe.mjs:278`) — one backticked command, one exit set, one expected substring, and
`$`-anchored at the end of the line. Measured on the current file: all 30 items were matched against
that regex; **item 30 (the round-60 item above) does not match** (two commands joined by `, and`), so
`--checklists` grades it `CHECKLIST  ERROR  SKILL.md:725 grammar (…)` and fails. Writing the new item
in item 30's two-command style would add a second such failure — I tested that variant
(`…SELFTEST: PASS`, and `… --root . --round 63 --wave w1` → `INLINE_DISPATCH: CLEAN`) and it does not
parse. The live `--root … --wave w1` arm belongs in the registry row and in predicate I2, not in a
checklist line. **The L1 may also want to split item 30 into one parseable item** — that is a repair
of a committed line, not part of this draft, and it changes `C` by 0 or +1 depending on whether the
split keeps one line or two; decide explicitly.

### Term `C` — precisely how this item moves it (the L1 must decide)

- `C` is not prose: `const C = countLines(skillText, RE_CHECKLIST)` with
  `RE_CHECKLIST = /^\s*- \[/` (`scripts/proxy-check.mjs:503` and `:943`). **Every** line whose first
  non-space characters are `- [` counts, checked or not. Adding one `- [ ]` item moves `C` by
  **exactly +1**.
- Current committed value: `C=30` (`SCORECARD.md` `<!-- kumitate-proxy-v1` stanza) and
  `grep -c '^- \[ \] ' SKILL.md` → `30`. After this item: `C=31`.
- Consequence: the stanza key `C=30` must become `C=31` in the same commit, else `proxy-check` reports
  `C_DRIFT` (`FINDING_KINDS` at `scripts/proxy-check.mjs:559-566`) and the lane opens in DRIFT.
  This contradicts step 2 of `.ufo/waves/round-63/build/K63ConnIntegrationMap/integration-checklist.md`
  ("`C=30` … unchanged") — see finding K63ScribeSkillProvince-2.
- The axis integer does **not** move: `operability = floor(10 × (A+C)/(A+C+3))`
  (`scripts/proxy-check.mjs:740-742`). With the stanza's `A=117`: `C=30` → 147/150 = 9.80 → **9**;
  `C=31` → 148/151 = 9.801 → **9**. 9 is this proxy's terminal integer (`f_O < 1` for every finite
  `A+C`), so the item cannot move the integer and the round's claim is a capability acquisition, as
  `plan.md` §Axis state says.
- `## Axes` needs no edit for this: `compareAxes` (`scripts/proxy-check.mjs`) parses only the integer
  cell `| operability | N |` and compares it with the derived term; the stale prose in that row
  (`A=10`, `C=19`) is not graded. The **stanza** edit is mandatory; the prose edit is optional and, if
  done, must not contradict the stanza.
- **The L1 must decide** whether to take this item at all: it moves `C` 30 → 31 and no score, and it
  adds exactly one `CITE_CHECK` `UNRESOLVED` error of the class every existing registry row already
  produces (measured minimal pair, D1 note below). If the round wants `C` held at 30, the honest
  alternative is to leave the checklist untouched and carry the gate in the registry row only — the
  capability claim does not depend on the item (`plan.md` I1–I6 never mention the checklist).

### Also stale in this section (L1 call, not mine)

`SKILL.md:680` still reads `Twenty-six items (round 56; item 26 is …)`, while the list holds **30**
items and item 30 is the round-60 gate. With this item it holds 31. Suggested minimal replacement,
first sentence only: `Thirty-one items (round 63; item 31 is the inline dispatch-evidence gate; item
30 the round dispatch-evidence gate; item 29 the README source-id citation gate; item 28 the
receipt-evidence gate).` Leave the rest of the paragraph as written (it describes items 14–26).

### Fact sources for D2

Committed: the grammar (`surface-probe.mjs:278`), `RE_CHECKLIST`/`C` derivation, `operabilityOf`,
`C_DRIFT`, the stanza `C=30`, the 30-item count. `[build-tree]`: the 25/25 selftest string in the item.

---

## D3 — `PROVINCE.md` §Frontier: the coordinator-topology bullet

Insert as a new bullet at the end of `### Frontier — named ground, entered by sourced entries, not yet
gated` (after `PROVINCE.md:22`, before the blank line and `### Adjacent`).

```
- Multi-agent coordinator topology — orchestration topology **decisions**: how a wave's seats are arranged, not how an agent is judged — first entry `corpus/knowledge/multi-agent-coordinator-topologies.md` (round 63, S196/S197): a vendor's managed-agent coordinator contract (one coordinator agent forming a set of member agents) beside the measured scaling study of agent-system topologies, version-pinned to arXiv 2512.08296 v3; the band's subject is the arrangement itself — which topology a wave uses, what the coordinator may delegate and to whom, and what the measurement says that arrangement costs; adjacent, not absorbed: kengaku evaluates agents (a seat's output is judged there), this lane decides how the seats are arranged around that judgment; other coordinator-topology families remain queued.
```

Why it is shaped this way:

- **T7 predicate** (`.ufo/waves/round-63/probe/topology63-probe.mjs:190-199`) needs the entry path and
  `/frontier|band|ground|first entry/i` on the **same line**: this bullet carries `first entry` and
  `band` and the path. Verified against the probe's own expression (see §Verification).
- **`S196/S197`** are the ids the frozen plan assigns to the two rows this round opens
  (`plan.md` §Assimilation: "Adopted ids continue the lane's registry (S196, S197), re-pointed by
  document"). They do **not** exist in committed `corpus/SOURCES.md` (134 rows, last `S195`) — the L1
  appends them; until then the bullet cites ids the registry lacks, which is why it lands in the same
  commit as the rows.
- `arXiv 2512.08296 v3` is committed prose (`corpus/lessons/round-61.md:14`: "the quote is verbatim
  in arXiv 2512.08296v3"). `{{L1: the vendor name/URL for S196 and the paper's title, from the
  captures — both are uncommitted build-tree facts and I did not promote them into lane prose}}`.
- The entry's **admission is conditional**: `corpus/lessons/round-60.md:39-41` REJECTed this entry and
  set the flip ("a later round whose one theme is coordinator topology re-opens S130 and S132 and
  adopts it through the item-10 pipeline"); `corpus/lessons/round-61.md:14` restates it. Note that
  `S130`/`S132` are **staged package ids, not lane rows** (`grep -c 'S130\|S132' corpus/SOURCES.md` →
  `0`), so the flip's "re-opens S130 and S132" is satisfied by the package documents, not by lane
  rows — `{{L1: record in the round-63 lesson which package ids were re-opened}}`.
- Framing is the assignment's, not the entry's: this bullet claims **decisions about arrangement**,
  and names kengaku as adjacent (it evaluates agents). Do not let the bullet drift into "agent
  evaluation" — that is kengaku's province.

---

## D4 — `corpus/README.md`: coverage-map row + §Frontier sentence

### Coverage-map row — append after the `lessons/round-62.md` row (`corpus/README.md:185`)

```
| `knowledge/multi-agent-coordinator-topologies.md` | Multi-agent coordinator topology as orchestration decisions: a vendor's managed-agent coordinator contract (one coordinator agent forming member agents) beside the measured scaling study of agent-system topologies (arXiv 2512.08296 v3), mapped to how this lane arranges a wave's seats — separated from kengaku's agent evaluation | S196, S197 in `corpus/SOURCES.md`; `.ufo/waves/round-63/build/K63Capture/` |
```

Row grammar is enforced: `readme-map.mjs:147` matches
`^\|\s*`((?:knowledge|lessons)\/[^`]+)`\s*\|` — the row **must** open with the backticked
`knowledge/…` path (no `corpus/` prefix). Verified against that expression (§Verification). Landing
it also needs `.ufo/pins/readme-map.json` `covered[]` to gain the path, else `README_MAP: DRIFT
unpinned` (L1 step 10 of the integration checklist). Citing `S196, S197` is graded by
`cite-sources` (a 3+-digit `S` id must be a SOURCES row) — so the row and the registry rows land
together.

### §Frontier bullet — append to `corpus/README.md:277-281`

```
- **Multi-agent coordinator topology (how a wave's seats are arranged):** first entry `knowledge/multi-agent-coordinator-topologies.md` (S196/S197); the coordinator contract and the measured scaling study are mapped to this lane's seat arrangement — which topology a wave uses, what the coordinator may delegate, and what the arrangement costs stay open, and kengaku's agent evaluation is the adjacent, not absorbed, half.
```

### Fact sources for D4

Committed: the row grammar, the pin requirement, the `cite-sources` rule, the entry path and band
name (`plan.md`), `S196/S197` (`plan.md`), `arXiv 2512.08296 v3` (`corpus/lessons/round-61.md:14`).
`[build-tree]`: the capture directory path (it is an untracked build dir; if it is committed as-is
the path resolves, otherwise `{{L1: replace with the committed capture path}}`).

---

## Verification performed on these drafts (exact commands, exact output)

```
$ node /tmp/kumitate-r63/K63ScribeSkillProvince/grammar.mjs
items counted by RE_CHECKLIST = 30
LAST ITEM PARSES: false
DRAFT1 PARSES: true cmd=node scripts/inline-dispatch-evidence.mjs --selftest exits=0 expect=INLINE_DISPATCH_SELFTEST: PASS
DRAFT2 PARSES: false
A=117 C=30 -> 9  C=31 -> 9  C=32 -> 9

$ node /tmp/kumitate-r63/K63ScribeSkillProvince/all.mjs
items = 30 unparsable = 1
  item 30: - [ ] Round dispatch-evidence gate (round 60; contract `kumitate-dispa…
```

`DRAFT2` is the two-command variant (`… SELFTEST: PASS`, and `… --root . --round 63 --wave w1` →
`INLINE_DISPATCH: CLEAN`) — the shape step 5 of the integration checklist proposes; it does not parse.

Minimal pair for the `CITE_CHECK` cost of the D1 row (scratch copies of the committed `SKILL.md`,
one with the draft row appended; `--self` on each, default `--src`):

```
== a ==  CITE_CHECK: DRIFT (files=1 tokens=274 errors=133 warnings=2)   VERDICT: FAIL
== b ==  CITE_CHECK: DRIFT (files=1 tokens=276 errors=134 warnings=2)   VERDICT: FAIL
added: {"file":"SKILL.md","token":"scripts/inline-dispatch-evidence.mjs","class":"source","kind":"UNRESOLVED","severity":"error","message":"scripts/inline-dispatch-evidence.mjs not found under src (exact or suffix)"}
       {"file":"SKILL.md","token":".ufo/waves/round-63/controls/inline/","class":"runtime","kind":"OK","severity":"note"}
```

So the row costs exactly one `UNRESOLVED` error — the same class the 23 existing rows already
produce (they name lane-local `scripts/*.mjs` that the origin tree does not hold), plus one note.
Not fixable without abandoning the column style the assignment asks for.

D3/D4 checked against the two frozen expressions, on the strings actually written in this file
(`node /tmp/kumitate-r63/K63ScribeSkillProvince/check2.mjs`):

```
T7 province predicate (probe topology63-probe.mjs:190-199): true
readme-map row grammar (readme-map.mjs:147): true knowledge/multi-agent-coordinator-topologies.md
row cells = 3
README frontier bullet starts with bold term: true | names entry: true
```

Selftest of the gate the row documents (one run, uncommitted file, not rerun):

```
$ sha256sum scripts/inline-dispatch-evidence.mjs
fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd  scripts/inline-dispatch-evidence.mjs
$ node scripts/inline-dispatch-evidence.mjs --selftest | tail -1
INLINE_DISPATCH_SELFTEST: PASS (25/25)      (exit 0)
```

---

## Facts I could not take from committed bytes (`{{L1:…}}` roll-up)

1. `pin.inline-dispatch-evidence` sha256 at the landing commit (the file is uncommitted).
2. Whether the 14 committed control cases stay named in the registry row or move to the capability row.
3. The vendor name/URL of S196 and the arXiv title for S197 (captures are uncommitted).
4. Which package ids (S130/S132 in the round-60 flip wording) the round-63 lesson records as re-opened.
5. The committed capture path if `build/K63Capture/` is not committed verbatim.
6. The decision on D2: take the checklist item (`C` 30 → 31, stanza edit mandatory, no score moves)
   or hold `C` at 30 and carry the gate in the registry row only; and whether to split item 30.
