# ScoutAnchors — r49 repair anchors

Seat: ScoutAnchors. Read-only. No installs. No lane edits except this report.

Measured lane HEAD `6927903f99bbc26e397aa47387aa76950f42b3a5` (`6927903`, 2026-10-23 17:45:32 -0300, `round-50: record wave seat assignments`; touches only `.ufo/waves/round-50/r50/swarm-registry.json`). Parent `378b6e7` is `round-50: freeze guard and closure corrections`. Worktree matches HEAD for `corpus/lessons/round-49.md`, `SKILL.md`, and `.ufo/waves/round-49/` (`git status --porcelain` on those paths was empty). Round-49 wave tree is 25 files.

Fleet report read: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-49/kumitate.md`, sha256 `d0b2d6e9b2e9c10a7a55cd251d17e2aa4eb7c41b9a01593ceab37d05bee9e9bd`, 133 lines. Lines 123–133 are already `## Erratum (round 50; append-only)`. Reference checks below use the whole file, and say so when a hit is only in that erratum.

## (a) `corpus/lessons/round-49.md` has no `## Gate`

CONFIRMED at the worktree and at `HEAD`, and also at `5b0de268` and `c432cc95`.

```
$ grep -n '^## ' corpus/lessons/round-49.md
7:## Mistakes
35:## Frontier — SOURCES
```

```
$ git show HEAD:corpus/lessons/round-49.md | grep -n '^## '
7:## Mistakes
35:## Frontier — SOURCES
```

Same two headings at `5b0de268` and `c432cc95`. The only `Gate` substring in the worktree lesson is line 26, which cites `SKILL.md` § Gate registry; it is not a `## Gate` heading. R50-2 is still open: the ledger section is absent.

## (b) SKILL.md `all eleven` sentences

ABSENT at HEAD and in the worktree. The two sentences the spot-check names (`corpus/lessons/round-49-verifier-spotcheck.md:144-145`) are still the bytes at `5b0de268` (also `c432cc95`, `ff40d7d`). Commit `378b6e7` already replaced both `eleven` with `twelve` on the same line numbers. A second sweep of those two words is a no-op at HEAD. `Twelve` at line 589 was not touched.

Defect text (`git grep -n 'all eleven' 5b0de268 -- SKILL.md`):

```
5b0de268:SKILL.md:595:`--checklists` mode runs the commands listed below. Verdict map for all eleven: `0` → clean,
5b0de268:SKILL.md:598:code (its own exit map is in its row), so "all eleven" above still counts the gates only.
```

Neighbor at the same rev, line 589–590: `Registry home per the fleet protocol's §Gate standard (round 34). Twelve are` / `gates (each can exit 1 on a real defect; ...)`.

HEAD `6927903` (identical to `378b6e7` for these lines):

```
589: Registry home per the fleet protocol's §Gate standard (round 34). Twelve are
595: `--checklists` mode runs the commands listed below. Verdict map for all twelve: `0` → clean,
598: code (its own exit map is in its row), so "all twelve" above still counts the gates only.
```

```
$ grep -n 'all eleven' SKILL.md
(none worktree)
$ git grep -n 'all eleven' HEAD -- SKILL.md
(none HEAD)
```

`git log -S 'all eleven' --oneline -- SKILL.md` shows the removal at `378b6e7` (previous touch `980a16a`). R5's frozen check (no `all eleven`, `Twelve` still present) is already true on current `SKILL.md` bytes. It is false at `5b0de268` / `ff40d7d`.

## (c) Three B49 receipts are byte-identical

CONFIRMED. The three C1 receipts named by the report (`r49/L1-score-0526f898.txt`, `r49/ReRunCounter49-2.txt`, `r49/ReRunCounter49-3.txt`), all introduced in `64b9286`:

```
$ sha256sum .ufo/waves/round-49/r49/L1-score-0526f898.txt \
            .ufo/waves/round-49/r49/ReRunCounter49-2.txt \
            .ufo/waves/round-49/r49/ReRunCounter49-3.txt
03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488  .ufo/waves/round-49/r49/L1-score-0526f898.txt
03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488  .ufo/waves/round-49/r49/ReRunCounter49-2.txt
03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488  .ufo/waves/round-49/r49/ReRunCounter49-3.txt
$ cmp L1-score-0526f898.txt ReRunCounter49-2.txt; echo cmp12=$?
cmp12=0
$ cmp ReRunCounter49-2.txt ReRunCounter49-3.txt; echo cmp23=$?
cmp23=0
$ wc -c  → 484 484 484
$ grep -n 'run-at' <the three>
(no run-at)
```

Shared body (the whole file):

```
  K1 PASS present
  K2 PASS exit=0 7/7
  K3 PASS exit=0 BIND_ORACLE: HELD binds=3 observed=3 absent=1
  K4 PASS exit=1 BIND_ORACLE: MISSING missing=3 paths=R/bind0,R/bind1,R/bind2
  K5 PASS exit=1 BIND_ORACLE: EXTRA extra=1 paths=/etc
  K6 PASS exit=1 BIND_ORACLE: CONTROL_VISIBLE visible=1 paths=R/control
BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rev=0526f898257f58158e9264905f4895f54163e8db rule=B49 oracle_sha256=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
```

Matches the spot-check prefix `03a258d6…`. R50-4 cannot be satisfied by these three files: they are one blob, no `run-at=` prelude. New spaced runs are still required.

## (d) `.ufo/waves/round-49` files vs the r49 report

Rule: a file is **basename-hit** if `kumitate.md` contains its basename as a literal string. 25 files. 11 hits, 14 misses. A miss can still be a shortened citation, a glob, or a seat name; those are listed, not counted as hits.

Basename hits:

| file | report locator |
|---|---|
| `controls/CtlForged-static-oracle.txt` | `:33` `controls/CtlForged-static-oracle.txt` |
| `controls/CtlNothing-base-b7b040b5.txt` | `:74` |
| `plan.md` | `:4` full path |
| `probe/bindoracle49-probe.mjs` | `:22`, `:74` |
| `probe/doctrine49-probe.mjs` | `:25`, `:75`, erratum `:131` |
| `r49/L1-score-0526f898.txt` | `:38`, `:111` |
| `r49/Mistake-fixed-allowlist.txt` | `:37`, `:79` |
| `r49/ReRunCounter49-2.txt` | `:38` |
| `r49/ReRunCounter49-3.txt` | `:38` |
| `r49/ScoutRegistryClassification.md` | `:47` (only seat report cited with `.md`) |
| `r49-taskcall.json` | `:8` full path |

Basename absent — still pointed at by a shorter string:

| file | bytes | what the report actually says |
|---|---|---|
| `r49/L1-c2-score-589d25e4c2dc6600f6d8db1468b832555bda9dd0.txt` | 216 | `:43` `r49/L1-c2-score-589d25e4….txt` (ellipsis, not the basename) |
| `r49/C2-doctored-control-589d25e4c2dc6600f6d8db1468b832555bda9dd0.txt` | 264 | `:44` `r49/C2-doctored-control-589d25e4.txt` (hash truncated; that shorter name is not a file) |
| `controls/CtlNothing-c2-base-b7b040b5.txt` | 105 | `:32` glob `.ufo/waves/round-49/controls/CtlNothing-*` only. `CtlNothing-c2` is absent. Body starts `DOCTRINE49: UNMET reason=entry-absent` |
| `r49/ScoutCapRunVisibility.md` | 12511 | `:56` seat name, no `.md` |
| `r49/ScoutCorrections.md` | 12064 | `:54` seat name |
| `r49/ScoutLeftovers.md` | 13318 | `:55` seat name |
| `r49/ScoutMountinfoFields.md` | 20310 | `:58` seat name |
| `r49/ScoutSiteBindsRoundGate.md` | 5753 | `:57` seat name |
| `r49/ScoutSiteBindsSurfaceProbe.md` | 13075 | `:57` `` `…SurfaceProbe` `` only; stem `ScoutSiteBindsSurfaceProbe` is absent |
| `r49/ConnSiblingOverlap.md` | 19432 | erratum `:128` `` `ConnSiblingOverlap` seat report `` only. Absent from the filed body (lines 1–122). Landed in `c432cc9`, after the report |

Basename absent — no path, no shortened name, no seat name (`grep -F` absent):

| file | bytes | introduced | note |
|---|---|---|---|
| `r49/ScoutLeakDelta.md` | 10488 | `64b9286` | real seat report (`# ScoutLeakDelta — R49-5 leak-delta decomposition`). Not named |
| `r49-spec.json` | 179809 | `64b9286` | wave spec (`"wave": "kumitate-r49"`). Report cites `r49-taskcall.json` and "validator exit 0" (`:7-8`) but never `r49-spec` / `spec.json` |
| `r49/L1-c2-rescore-01b70bb0c5ad96ae8e7451dd90c460244bc470a3.txt` | 216 | `923a172` | `DOCTRINE49: HELD … clauses=16/16 … rev=01b70bb0…`. Erratum states the 16/16 rescore and does not name this file. `rescore` is absent |
| `r49-plan.stderr` | 0 | `64b9286` | empty. Report `:50` names `r48-plan.stderr`, which does not match this basename |

Line 28's blanket ("seat reports under `.ufo/waves/round-49/r49/` … committed in `64b92866`") does not name a file. It also does not cover `ConnSiblingOverlap.md` or `L1-c2-rescore-…txt`, which landed after `64b92866`.

## Repair-text consequences

- R50-2: append `## Gate` to `corpus/lessons/round-49.md`. It is not there.
- R50-5: the two `all eleven` sentences to sweep are the `5b0de268` quotes above. HEAD already reads `all twelve` at `:595` and `:598` (`378b6e7`). Do not sweep again unless a later commit restores `eleven`.
- R50-4: the three committed B49 receipts are one sha256 `03a258d6…`, 484 bytes, no `run-at`. Spacing has to be new receipts.
- The report's uncited committed artifacts a closure can still point at by path: `r49/ScoutLeakDelta.md`, `r49-spec.json`, `r49/L1-c2-rescore-01b70bb0c5ad96ae8e7451dd90c460244bc470a3.txt`. `r49-plan.stderr` is an empty file. The other basename misses are seat-name or truncated-hash citations, not silence.

Confidence: high on (a)(b)(c) and on the basename table. The "unreferenced" tier is the literal-basename rule stated above; a reader who treats seat names as file references will drop the eight scout `.md` files and `ConnSiblingOverlap.md` from the gap list, and will still have the four rows in the last table (`ScoutLeakDelta.md`, `r49-spec.json`, the rescore receipt, empty `r49-plan.stderr`), plus the c2 control only via glob.
