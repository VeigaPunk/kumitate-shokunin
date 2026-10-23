RESULT CtlDoNothingEntry rev=a2e5b54c verdict=rejects vacuous=K1,K2,K3,F1,F2,F3

# CONTROL (do-nothing) — frozen C1 checklist K1–K5 and supporting checks F1–F3, scored against the empty lane

Object of the control: the lane at `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f` with **no** new entry,
**no** new SOURCES rows, **no** demo receipts. Checklist under test: `.ufo/waves/round-45/plan.md` § E7
(lines 131–142, committed in `a2e5b54c`, before any entry exists) and § Supporting checks (lines 51–60).

Scoring is literal: each item is applied to the state as it stands at the tip. "VACUOUS" means the item
holds over an empty set and therefore cannot reject the do-nothing state on its own.

## Verdict lines (one per item)

- **K1: VACUOUS** — "every decision-table row names a mechanism (M1–M7) and a demo receipt with its
  do-nothing control, or a source locator". At the tip there is no entry and no decision table, so the
  quantifier ranges over zero rows and the item is true. K1 by itself admits the do-nothing entry.
- **K2: VACUOUS** — "every demo the entry cites shows the effect and its control does not (receipt lines
  in `build/Demo*.md`)". The entry cites no demo; no `Demo*.md` receipt is committed anywhere in git
  history, so the item ranges over zero demos and is true. K2 by itself admits the do-nothing entry.
- **K3: VACUOUS** — "every new SOURCES row the entry cites (S062–S074) re-opens with its quote found
  verbatim by a non-author falsify seat". The entry cites no new row; `corpus/SOURCES.md` at the tip has
  61 rows, the highest is S061, so there is nothing to re-open. K3 by itself admits the do-nothing entry.
- **K4: FAIL** — "the entry names the prior-corpus passages it does not restate (E1) and cites the
  sibling-lane owners". No entry exists, so no passage is named and no sibling owner is cited. This is an
  existential requirement about one object, not a universal over a set: with no entry it is unmet, not
  vacuous. K4 rejects the do-nothing state.
- **K5: FAIL** — "at least two rows change a lane practice relative to round-44 practice". The floor is
  a cardinality ("at least two"); zero rows do not satisfy it. K5 rejects the do-nothing state.
- **F1 quotes: VACUOUS on the rows; the receipt precondition is MET** — "every new SOURCES row's ≤25-word
  quote is re-found verbatim in its re-opened source by a non-author falsify seat" ranges over zero new
  rows at the tip. The other half of F1 ("control seat `CtlQuoteFabricated` runs the re-open procedure …
  its receipt is committed before the entry") is already satisfied at `a2e5b54c`. Net: F1 does not
  reject the do-nothing state; it certifies a procedure that the entry need not use.
- **F2 demos: VACUOUS** — "every mechanism demo runs its do-nothing control in the same sandbox; a demo
  whose control shows the same effect is not cited". Zero demos cited, zero demo receipts committed: the
  item is true over an empty set. F2 does not reject the do-nothing state.
- **F3 decisions: VACUOUS as written** — "a decision-table row without a mechanism, a source id and a
  demo or source locator is cut before the entry commit". It is a per-row cut rule; with zero rows
  nothing is cut. Its parenthetical ("no-decision glossary rows are not knowledge") is the only clause
  anywhere that gestures at an existence floor, and it is phrased about rows, not about the entry.

**Overall: the checklist rejects the do-nothing state (K4 and K5 fail), but the rejection rests on two
items only. K1, K2, K3 and all three supporting checks pass vacuously against an empty lane.** The
"control must FAIL the checklist" expectation is met only because K4/K5 happen to carry an existential
floor. Any future entry that satisfies K4 and K5 while carrying no decision-table row, no demo receipt
and no new SOURCES row passes the entire frozen checklist.

## Evidence

```
$ git log --oneline -1 a2e5b54c
a2e5b54 round-45: F1 quote-control receipt and E7 frozen C1 review checklist (before entry)

$ git cat-file -e a2e5b54c:corpus/knowledge/agent-isolation-substrates.md
fatal: path 'corpus/knowledge/agent-isolation-substrates.md' does not exist in 'a2e5b54c'   -> ABSENT

$ git show a2e5b54c:corpus/SOURCES.md | grep -cE '^\| S[0-9]+'      ;  ... | grep -oE '^\| S[0-9]+' | tr -d '| ' | sort | tail -1
61
S061                       (no S062-S076 row exists at the tip)

$ git ls-tree -r --name-only a2e5b54c -- .ufo/waves/round-45/build/
.ufo/waves/round-45/build/CtlQuoteFabricated.md      (the only committed wave-45 build artifact)

$ git log --oneline --all -- '.ufo/waves/round-45/build/Demo*.md'
(empty)                    (no demo receipt has ever been committed)

$ sed -n '21p' PROVINCE.md
- Isolation substrates for parallel agents (git worktrees, harness isolation backends) — `corpus/SOURCES.md` rows, queued.

$ grep -c 'agent-isolation-substrates' corpus/README.md PROVINCE.md
corpus/README.md:0
PROVINCE.md:0
```

### Defect 1 — the landed re-open procedure contradicts K3's own normalization clause (fixable defect)

K3 requires that "normalization strips « » and folds apostrophe variants before matching". The scripts
committed with the F1 receipt at `a2e5b54c` do neither. They are byte-identical to the pre-fix scripts
printed in the receipt, which is the same defect the receipt itself reports as control (g) and (h).

```
$ python3 -c "... sha256 of receipt block vs landed probe file ..."
receipt_sh cfe9edd8c9dc4bc6 landed_sh cfe9edd8c9dc4bc6 identical True
receipt_py a633913a683b344b landed_py a633913a683b344b identical True
landed_sh guillemet_present False apostrophe_fold_present False
landed_py guillemet_present False apostrophe_fold_present False

$ grep -nE '«|»|2019|0027|apostroph' .ufo/waves/round-45/probe/normalize.py.txt .ufo/waves/round-45/probe/reopen-quote.sh.txt
grep_exit=1                       (no quote-side normalization exists)
```

Running the committed procedure on local fixtures (no network; `file://` bodies, run under the lane
bounds) reproduces the false MISSING modes the receipt names, and adds a third the receipt did not name:

```
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash ./reopen-quote.sh
REOPEN: FOUND   G   good          (bare quote, verbatim body)
REOPEN: MISSING  Q   guillemet     (same sentence wrapped in « »)
REOPEN: MISSING  A   apostrophe    (straight ' against body U+2019)
$ systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 bash ./reopen2.sh
REOPEN: MISSING  A   ascii_quotes  (corpus-style "…" wrapper)
REOPEN: FOUND   B   bare
```

The ASCII-double-quote wrapper is not an edge case: 25 of the 61 rows already committed in
`corpus/SOURCES.md` carry `"` inside the quote cell (S030–S061 series), so a falsify seat that greps the
cell verbatim gets a false MISSING on the lane's own existing rows.

```
$ python3 -c "count rows whose quote cell contains \" or « or ’"
total_rows 61 rows_with_quotechars 25
```

Impact: any K3 re-run performed with the committed procedure can report a correct row as not verbatim.
That is a false defect against the entry, the exact failure mode the round-44 spot-check punished.

### Defect 2 — K3's frozen row range excludes rows the wave is actually reopening (fixable defect)

K3 names the rows it covers as "S062–S074", a range frozen before any row existed. The candidate set in
this round is S062–S076 plus edits to S013 and S027. S075 and S076 fall outside the frozen range, so
K3 as literally written does not require their quotes to be re-opened. (This control wave has in fact
dispatched `ReopenS075` and `ReopenS076`; the checklist and the wave disagree about what is covered.)

```
$ grep -n 'S062–S074' .ufo/waves/round-45/plan.md
135:- K3 every new SOURCES row the entry cites (S062–S074) re-opens with its quote found verbatim by a non-author falsify
$ grep -oE '"name": "ReopenS[0-9]+"' .ufo/waves/round-45/a2-control-spec.json | sort -u | tr '\n' ' '
"name": "ReopenS013" "name": "ReopenS027" "name": "ReopenS062" … "name": "ReopenS076"
```

### Defect 3 — "M1–M7" has no committed registry and collides with existing corpus ids (fixable defect)

K1 requires a row to name "a mechanism (M1–M7)". Nothing committed at the tip defines those seven ids for
this entry, and M1/M2/M3/M5/M6/M7 are already used in `corpus/lessons/round-41.md` for a different
taxonomy (finding ids), with M8 in `round-36.md`. An entry that defines its own M1–M7 satisfies the
clause by construction, so K1's mechanism clause carries no external check.

```
$ git grep -lE 'M1[^0-9A-Za-z]' a2e5b54c -- corpus/ .ufo/waves/round-45/plan.md
a2e5b54c:.ufo/waves/round-45/plan.md
a2e5b54c:corpus/lessons/round-41.md
$ grep -rnoE '\bM[1-9]\b' corpus/lessons/*.md corpus/knowledge/*.md | awk -F: '{print $3}' | sort | uniq -c | sort -rn
3 M5 / 3 M3 / 3 M2 / 2 M7 / 2 M6 / 2 M4 / 1 M8 / 1 M1
```

### Defect 4 — K2 and K4 point at receipts that exist only as untracked scratch (fixable defect)

K2 cites "receipt lines in `build/Demo*.md`" and K4 cites "ConnSiblingOverlap". At the tip neither is in
git history; both exist only as untracked files in the working tree. A reviewer checking the checklist at
the entry commit finds the cited evidence absent from the commit.

```
$ git log --oneline --all -- '.ufo/waves/round-45/build/Demo*.md'      -> (empty)
$ git status --porcelain | grep -E 'Demo|ConnSiblingOverlap'
?? .ufo/waves/round-45/build/ConnSiblingOverlap.md
?? .ufo/waves/round-45/build/DemoBwrapEnv.md            (and DemoGitEnvLeak, DemoJjGitStray, DemoJjSnapshot, DemoNativeMemCap, DemoWorktreeShared)
```

## Strongest counterexample the checklist permits

An entry that: (a) lists the four E1 prior-corpus passages by file:line and names the sibling-lane
owners (K4 satisfied), (b) contains exactly two rows whose guard cells carry round-45 wording — the
`GIT_*` scrub widened to `git rev-parse --local-env-vars` and `env -i` in front of bwrap (K5 satisfied),
(c) has **no** decision table, **no** cited demo receipt, **no** new SOURCES row and **no** M1–M7
registry. Every other checklist item is then either satisfied by the two rows or vacuous. Such an entry
passes K1–K5 and F1–F3 in full while changing no lane practice beyond the two cells it names, and while
citing no primary source for either cell. The frozen checklist has no item that requires the entry to
carry sources at all.

## Smallest safe correction (append as an erratum to § E7, not a rewrite; the plan is append-only)

1. **Give the three vacuous items an existence floor.** K1 → "the entry HAS a decision table with at least
   one row, and every row names a mechanism and a demo receipt with its do-nothing control, or a source
   locator". K2 → "the entry cites at least one demo, and every demo it cites shows the effect and its
   control does not". K3 → "the entry cites at least one new SOURCES row, and every row it cites
   re-opens …". F2 → "the entry cites at least one mechanism demo, and every cited demo runs its
   do-nothing control in the same sandbox". F3 → "the entry HAS a decision table; a row without a
   mechanism, a source id and a demo or source locator is cut". F1 → "the entry cites at least one new
   SOURCES row, and every such quote is re-found verbatim". One sentence per item; each converts a
   universal over an empty set into an existential the do-nothing entry cannot satisfy.
2. **Land the normalization K3 already requires.** Before the entry commit, amend
   `probe/normalize.py.txt` and `probe/reopen-quote.sh.txt` so the quote side strips `« »` and the ASCII
   `"` wrapper the corpus uses, and folds U+2019/U+0027 (both directions). Or, if the scripts are held
   frozen, add the same normalization to the falsify seat's brief and require the receipt to print both
   the raw and the normalized attempt. Either way the receipt must not describe behavior the scripts
   lack.
3. **Make K3's range non-binding.** Replace "(S062–S074)" with "(every new SOURCES row the entry cites,
   whatever ids it uses)". The parenthetical is the only place the range is fixed, and it was fixed
   before the rows existed.
4. **Give M1–M7 an external anchor or drop the ids.** Either name the seven mechanisms in a committed
   file before the entry commit, or replace "names a mechanism (M1–M7)" with "names the mechanism and
   the source id it comes from", so the clause is checkable outside the entry.
5. **Commit the demo receipts and the sibling-overlap receipt before the entry commit**, or restate K2 and
   K4 to name the commit that will hold them, so the judged object and its cited evidence are in one
   commit.

## Host hygiene

- One `git clone --no-hardlinks` of the lane into
  `/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlDoNothingEntry/lane`, checked out `--detach` at
  `a2e5b54c`. All reads of the lane tip were done in that clone or with `git show`/`git ls-tree` against
  the tip revision; no git or jj write was run in the lane repo or the fleet repo.
- The two procedure runs above went through
  `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900`; both exited 0.
  Fixtures were local `file://` bodies; no network fetch was made.
- `pgrep -af 'kumitate-r45/seats/a2-CtlDoNothingEntry'` → no process of mine left running; scratch
  fixtures removed.
- No tool was installed or updated for this item (git 2.56.0, python3 3.14.8, curl 8.23.0, all already
  present).
- The only file written inside the lane is this report. Nothing under `~/.omp/agent` was read or hashed.

## Scope note

This control does not judge the C1 entry and does not re-derive any inherited seat report. The draft
entry `corpus/knowledge/agent-isolation-substrates.md` exists on disk as untracked attempt-1 scratch
(sha256 `10c3dc8e5c097f84892f288f6954f61f7631d0a048fe5b38109ef8aef72402b6`); it was deliberately not
scored here — the object of this control is the empty lane at `a2e5b54c`. The sibling control
`CtlGlossaryEntry` covers the glossary-with-rows shape; this report covers the empty-state scoring and
the four defects above.
