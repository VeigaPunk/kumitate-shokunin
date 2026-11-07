# K95CriticA — counter constructions, round 95 C1 (operability)

Target: the frozen counter `.ufo/waves/round-95/probe/probe95-c1.mjs` (freeze `ee8479be66acd906f1d2b5f24f1b75a3d9172c1b`).
Question: can a gate that violates the frozen rule reach `C95_C1: HELD`?
Answer: **yes — 9 of 9 constructions do**, each violating a named clause of the rule.

Run form used for every row (unchanged, frozen counter):

```
TMPDIR=<scratch>/tmp-<n> prlimit --as=4294967296 timeout 900 node \
  .ufo/waves/round-95/probe/probe95-c1.mjs \
  --tool <seat>/constructions/<n>.mjs --work <scratch>/probe-<n> \
  --freeze ee8479be66acd906f1d2b5f24f1b75a3d9172c1b
```

Sources: `make-attacks95.py` (generator, textual patches of the BASE bytes with asserted application
counts, modelled on `probe/make-controls95.py`); each construction kept in `constructions/` beside
copies of `cap-spawn.mjs` / `cap-run.mjs` (BASE imports `./cap-spawn.mjs`). BASE sha256
`11f83a1ac7b539e76bbbfe370b618aaf836f441db48a7d587e4389f3a3c58b0a` = `controls/ctl-nothing` sha256.
Construction sha256 list: `receipts/attack-shas.txt`.

## Verdict table

| # | construction (sha256 head) | clause of the frozen rule violated | counter verdict (`receipts/<n>.txt`) |
|---|---|---|---|
| 1 | `atk-urlonly` 5093e0b5 | disclosure is unconditional: *"a registry row with any other field count … its id … is appended"*; this gate discloses only when the row contains `http` | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 2 | `atk-sorted` f3d4fc08 | *"in file order"*: the gate sorts the ids before reporting | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 3 | `atk-dedupe` 94ad96eb | appended **per row**; the gate dedupes by id identity | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 4 | `atk-crlf` f2e839e5 | a 13-field row declares (only `rejected` suppresses); the gate calls any `\r`-bearing row malformed | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 5 | `atk-vocab` bf0a0438 | a 13-field row declares whatever its status cell says unless it reads `rejected`; the gate requires one of {mined,queued,rejected} | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 6 | `atk-nofailclosed` ccf2e0f7 | *"an array **always present on every `--json` output**"*: the gate adds the key only to the audit path; the fail-closed `citations` object drops it | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 7 | `atk-hardcode` 46fa434c | unconditional disclosure; the gate discloses only ids in the literal list `['S002','S003','S004','S007']` | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 8 | `atk-dupskip` 59d236b4 | every registry row is judged by its field count; the gate drops both rows of a repeated id | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 9 | `atk-noindent` b2c9b040 | the registry row regex allows 0–3 spaces of indent, so an indented malformed row must be disclosed; the gate's disclosure pass anchors at column 0 | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 |
| 0 | `ctl-nothing` (BASE, do-nothing re-run) | — | **UNMET** a=0/1 b=0/1 c=0/78 d=1/1 |
| — | candidate `K95ExecTool/round-gate.mjs` (sha256 `c5a2f8ac…` = `READY`) | (reference candidate) | **HELD** a=1/1 b=1/1 c=78/78 d=1/1 (`receipts/candidate.txt`, independent re-run, 30 s) |

`ctl-nothing` fails for the right reasons (`receipts/ctl-nothing.txt`): (a) `declared=[okA shiftB escC
shortD indentF longG plainH]` + `malformedRows=null`; (b) `verdict=DRIFT unresolved=11/11 malformedRows=null`;
(c) `malformedRows=null` on every round; (d) 79/79 selftest PASS. The 8 pre-data controls stay UNMET (frozen
`controls/ctl-*.txt`), and my regenerated `ctl-positive` reproduces the frozen sha `5c472696…`
(`receipts/regen-controls-sha.txt`).

## The violations are behavioural, not just textual

`clause-evidence.mjs` (receipt `receipts/clause-differential.txt`) builds **one** registry holding exactly the
rows the counter's fixture omits and prints the real `--json` tuple for BASE, the regenerated reference control
and each construction:

```
census NF!=13 ids=[S002 S005 S006 S008 S008 S000]
ctl-positive     declared=[A,C,D,F,G] unresolved=[B,E] malformedRows=["S002","S005","S006","S008","S008","S000"]
ctl-positive     FAIL-CLOSED citationsKeys=[…,"declared","malformedRows","unresolved",…] malformedRows=[]
atk-urlonly      declared=[A,C,D,F,G] unresolved=[B,E] malformedRows=["S005"]
atk-sorted       … malformedRows=["S000","S002","S005","S006","S008","S008"]
atk-dedupe       … malformedRows=["S002","S005","S006","S008","S000"]
atk-crlf         declared=[A,C,F,G]  unresolved=[B,D,E] malformedRows=["S002","S004","S005","S006","S008","S008","S000"]
atk-vocab        declared=[A,D,F,G]  unresolved=[B,C,E] malformedRows=["S002","S003","S005","S006","S008","S008","S000"]
atk-nofailclosed … malformedRows=["S002","S005","S006","S008","S008","S000"]
atk-nofailclosed FAIL-CLOSED citationsKeys=["checked","external","declared","unresolved","notAncestor","unverifiable","mainProbeable","originProbeable"] malformedRows=null
atk-hardcode     … malformedRows=["S002"]
atk-dupskip      declared=[A,C,D,G]  unresolved=[B,E,F] malformedRows=["S002","S005","S000"]
atk-noindent     … malformedRows=["S002","S006","S008","S008","S000"]
```

Fixture rows, one per clause: `S002` 12 fields **with no URL**; `S003` 13 fields status `superseded`;
`S004` 13 fields **CRLF** (census `NF=13`, so it must declare); `S005` 12 fields **3-space indented**;
`S006` twice (13-field declare + 12-field malformed); `S008` twice (both malformed); `S000` malformed **last**
(below the ascending id prefix). Reference = `ctl-positive` regenerated from `make-controls95.py` at my scratch,
sha matches the frozen control.

## Why each arm misses it

- **(a)** the synthetic registry's four malformed rows (`S002 S003 S004 S007`) are all LF, unindented,
  distinct, URL-bearing, ascending — so ordering, dedupe, indentation, URL-presence, CRLF and
  vocabulary are all invisible; the only status any 13-field row carries is in {mined,queued,rejected}.
- **(b)** no registry at all: `malformedRows=[]`, nothing to discriminate. Every construction passes it
  because they all populate the array from the same `readRegistry()` result.
- **(c)** measured, not assumed (`c-vacuity.mjs`, `receipts/c-vacuity.txt`): of 78 rounds, the declared step is
  reached in **one** round only — `r93 citedTokens=11 declared=2` (`79fa222e` / `79fa222e8390…`,
  `receipts/c-r93-detail.txt`) — and the real registry has **0** non-13-field rows (all 210 rows `NF=13`,
  no CR, statuses only mined/queued/rejected). So (c) can only detect a regression on the well-formed-row path;
  every construction is byte-identical there.
- **(d)** the BASE selftest has **no** `malformedRows` arm: all 9 constructions score `79/79 pass`
  (`grep SELFTEST receipts/atk-*.txt` → 9× `ROUND_GATE_SELFTEST: 79/79 pass`). (d) discriminates nothing
  about this rule; that is K2's surface (mutation-tester), not mine.

## Counter-side observations (not verdict changes)

- **O1 (routed): HELD is necessary, not sufficient.** Every construction above violates the rule and HELDs, so
  `C95_C1: HELD` certifies only: the counter's own fixture tuple, unchanged behaviour on 78 well-formed-row
  reports, and a selftest with no arm for this rule. It does not certify unconditional disclosure, file order,
  per-row append, CRLF/indent tolerance, or the fail-closed shape. Eight of the nine clauses are **undisclosed**
  gaps; only #6 (fail-closed key) is disclosed in `plan.md` §C1 ("The counter does not exercise the fail-closed
  `--json` path's `malformedRows`").
- **O2 (latent, low): `atk-vocab`** duplicates `scripts/sources-check.mjs`'s `STATUS_ENUM` (E07: status must be
  queued/mined/rejected). It is a rule violation the counter cannot see, but a status outside that enum is
  independently rejected by `sources-check`, so the practical hazard is bounded while the enum holds.
- **O3 (harness, cannot produce a false HELD):** arm (d) runs `--selftest` with the inherited `TMPDIR`; if that
  directory does not exist the selftest dies at `mkdtemp` (`receipts/tmpdir-enoent-repro.txt`, ENOENT, exit 1) and
  (d) reads 0/1. My first two batches hit this self-inflicted false UNMET before I created the TMPDIRs; the
  counter should `mkdirSync(WORK)`-style create/validate the selftest TMPDIR, or at least not depend on it.

## Smallest safe correction (route: next counter repair, M93-3; NOT this freeze)

The counter is frozen and the predicate text lives in `plan.md`; this is a routed proposal, not an edit.

1. Add to the (a) fixture one row per clause: a 12-field row **without** a URL; a 12-field row **indented 2
   spaces**; two malformed rows sharing **one id**; a malformed row whose id sorts **below** `S001` placed
   last; a **13-field CRLF** row that must declare; a 13-field row whose status is outside
   {mined,queued,rejected} that must declare.
2. Extend `EXP_MALF` accordingly (file order, duplicates kept) — that one edit kills rows 1,2,3,4,5,7,8,9.
3. Add arm **(e)**: `--json` with a missing `--reports-dir` must print `citations.malformedRows` as `[]`
   (kills row 6, and closes the plan's own disclosed hole at counter level rather than selftest level).
Cost: one fixture edit + one arm; no change to how a correct candidate is scored.

## What this does not do

No verdict is changed: the frozen counter's `C95_C1` at M stands as the admission gate (K1). These findings are
routed and reported; they do not admit, reject, edit or re-freeze anything. The candidate itself
(`c5a2f8ac…`) HELDs on an independent re-run, but that run cannot distinguish it from `atk-urlonly` — the
clause-level check stays with the reviewer/K2 as the plan assigns it.
