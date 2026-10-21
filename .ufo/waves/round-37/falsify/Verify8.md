D8 present=yes honest=no verdict=partial

# Verify8 — round-36 spot-check disposition D8

Disposition under test (`corpus/lessons/round-36-verifier-spotcheck.md`, §Routed defects, D8): "Add the `corpus/README.md` map row for this note, so the proxy's C2_total stays in step, as in round 35."

Tree: lane HEAD `a5d627b` (`round-37: D3 corrections verified`, 03:23:30; erratum commit landed while this seat ran). `git status --short -- corpus LOG.md SCORECARD.md .ufo/waves/round-37/repairs.md scripts` is empty. Untracked peer falsify files were not used as evidence.

## 1. Row present: yes

```
$ grep -n 'round-36-verifier-spotcheck' corpus/README.md
101:| `lessons/round-36-verifier-spotcheck.md` | Round-36 non-author closure: REJECTED-HARMED adjudication (C1 fails as declared, C2 verifies, coverage:script-layer harmed by 123 shifted anchors), routed defects D1-D8, discernment spot-check, trend verdicts; row added in round 37 | commit `5833351`; fleet closure entry |
$ git show --name-status --format=%h 5833351
5833351
A	corpus/lessons/round-36-verifier-spotcheck.md
$ read ../MANIFEST.json:9240-9279   (fleet closure entry the row points to)
9241: "round": 36,  9244: "lane": "kumitate",  9253: "verdict": "rejected-harmed",
9270: "spotcheck": "kumitate-shokunin/corpus/lessons/round-36-verifier-spotcheck.md@5833351932af320efb04651869d9399c3f37e972"
```

Row shape matches the house 3-cell format. The pointers (`5833351`, fleet closure) resolve.

## 2. C2_total in step at HEAD: yes

```
$ grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md
84
$ find corpus/knowledge corpus/lessons -name '*.md' | wc -l
84
$ comm -23 notes rows | wc -l ; comm -13 notes rows | wc -l ; uniq -d rows
0 ; 0 ; (none)
$ grep -n '^C2' SCORECARD.md
288:C2=84
289:C2_total=84
$ node scripts/proxy-check.mjs; echo EXIT=$?
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=84/84 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=51/51 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
EXIT=0
```

The mechanism is operable: the gate fails closed on a mismatch and passes on the current tree.

## 3. The check fired on the first repair commit, then cleared (history)

```
$ git show 5ceb8cd:.ufo/waves/round-37/final/proxy.txt
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=83 computed=84 delta=+1
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=83 computed=84 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/sources-check.mjs; src-rev=31c465f15669)
$ rows / notes / stanza at 5ceb8cd: 83 / 84 / C2=83 C2_total=83
$ git show --stat --format=%s 86c0676
round-37: lesson map row + C2 84 (repair close)
 SCORECARD.md     | 4 ++--
 corpus/README.md | 2 ++
```

Cause: `corpus/lessons/round-37.md`, the 84th note, shipped without its own README row. Commit `86c0676` added that row and set both stanza terms to 84. It did not amend any prose.

## 4. Honest: no. The in-repo D8 record states a result the tree never produced

```
$ grep -n 'C2`/`C2_total` = 83\|C2=83/83\|C2/C2_total=83' corpus/lessons/round-37.md LOG.md
corpus/lessons/round-37.md:37:- D8: ... `C2`/`C2_total` = 83,
corpus/lessons/round-37.md:38:  `PROXY: MATCH (… C2=83/83 …)`.
LOG.md:1724:  ... D8 README row + `C2/C2_total=83`. Gate at close: ...
LOG.md:1726:  (C=14 C2=83/83 S=88/88 R=92/92 K=51/51 pins=6 src-rev=…)`, ...
```

- The tree reads 84/84 (§2).
- The gate evidence committed with that LOG entry (`5ceb8cd`, `final/proxy.txt`) reads DRIFT, declared 83 vs computed 84 (§3). No committed state prints `MATCH … C2=83/83`: the census was already 84 when the 83 stanza landed. The LOG "Gate at close" line is therefore a gate result that was never produced, not a stale-but-once-true number.
- `86c0676` and `a5d627b1` left these lines unchanged. `a5d627b1` changed `corpus/lessons/round-37.md` only in the D3 paragraph; lines 37–38 still read 83 at HEAD.
- The fleet report is accurate. `../.ufo/reports/round-37/kumitate.md:43-44`: "rows for `lessons/round-36-verifier-spotcheck.md` and `lessons/round-37.md`; `C2 = C2_total = 84`". Lines 65–66 and 101 quote `PROXY: MATCH (… C2=84/84 …)`, which the re-run reproduces (§2).
- `.ufo/waves/round-37/repairs.md`, the disposition ledger, has no D8 entry: `grep -c D8 .ufo/waves/round-37/repairs.md` → `0`.

## 5. Verdict reasoning

- `holds` rejected: the record's D8 claim (83; MATCH at 83/83) is contradicted by the tree and by the round's own committed evidence.
- `refuted` rejected: the disposition itself holds at HEAD. The row is present, C2_total is in step, and the gate reads MATCH. Refuted would need the row or the step to be missing.
- `partial`: present, but not honestly recorded.

## 6. Secondary observations (verdict-neutral)

- Row placement. The coverage-map table has its header at `corpus/README.md:14-15` and contiguous rows at 16–95. Line 96 is blank, and rows 97, 99, 101 (D8) and 103 each follow a blank line, so they sit outside the table block. [INFERENCE: GFM ends a table at the first blank line; not rendered here.] The grep-based C2 count still includes them.
- Recurrence. The same miss has happened three times: round-34 note (`corpus/README.md:93`, "landed without one, `C2_TOTAL_DRIFT` 77→78"), round-35 note (`:95`, "`C2_TOTAL_DRIFT` 79→80"), and this round's lesson (83→84).
- Adjacent, not scored. D3 was refuted as first landed by falsify seat Verify3 and repaired in `a5d627b1` (fleet report erratum, `../.ufo/reports/round-37/kumitate.md:93-104`). That repair did not touch the D8 lines.

## 7. Smallest correction that makes D8 honest

1. `corpus/lessons/round-37.md:37-38` and `LOG.md:1724-1726`: change `83` to `84`. Record that `5ceb8cd` carried 83 and its committed `final/proxy.txt` shows `C2_TOTAL_DRIFT`, cleared in `86c0676`. Quote `PROXY: MATCH (… C2=84/84 …)` only from a run.
2. `.ufo/waves/round-37/repairs.md`: add a D8 line (rows at README:101 and :103; `C2 = C2_total = 84`).
3. Optional: move rows 97–103 into the table block so they render in the map.

## Hygiene

- Installs or updates: none. Subagents: none. REA: not used.
- Writes: this report. Scratch: `/fast/scratch/kumitate-r37/Verify8/{rows,notes}.txt`. One stray write to `/fast/scratch/.verify8_rows.txt` was made by mistake; it was removed with `rm -f` and confirmed absent.
- Lane: `scripts/proxy-check.mjs` was run read-only. No lane file was changed.
