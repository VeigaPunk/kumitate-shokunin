# ExecRows — registry re-derivation from committed bytes (kumitate round 60, w1)

seat: ExecRows (executor) · axes: operability + coverage · date: 2026-10-24
work commit: `a745a3b0e02253e722834ef95042d97ed92e5e53` (== lane HEAD) · base: `ffbfe3cc38ff8eaa6375550b16472c90a006a179`
measured blob: `git rev-parse a745a3b…:corpus/SOURCES.md` → `762b977d950ef4e7a0e798e83bf68643a323ca3b`; extract sha256 `a4a6848d3f6ceb2ed7f14e1a27d746d5f76dedca1815e52529c754ff25cac89b` (all commands run against this blob, never the worktree).

## Verdict on the named item

**Corroborated.** Every registry fact the frozen plan names for the seven rows (rule D60 F2/F3 territory) re-derives exactly from the committed bytes, and the attack pass over **all** rows found zero defects: every row parses as eleven cells with no literal or escaped pipe in any cell.

## Method

Extracted both blobs to scratch (`/tmp/kumitate-r60/ExecRows/`), then parsed with a stdlib-Python parser (`derive.py`, exit 0) and cross-checked with two independent counters. Parser contract: a registry row must start/end with `|`, split on unescaped `|` into exactly 11 cells, and contain no `\|` / `&#124;` / literal `|` inside a cell. It also flags leading-whitespace table rows and duplicate `## Registry` headers (the collision-extractor hazard named in the plan) — none found (header occurrences = 1, no indented rows, no anomalies at base either).

## Re-derived facts (work commit a745a3b)

Row count — three independent methods agree:

```
$ awk -F'|' '/^\| S[0-9]/ { total++; if (NF==13) ok++; else bad++ }
             END { print "total=" total " nf13=" ok " bad=" bad+0 }' SOURCES-at-work.md
total=133 nf13=133 bad=0
$ grep -c '^| S[0-9]' SOURCES-at-work.md
133
$ python3 derive.py
base-data-rows: 126
work-data-rows: 133
distinct-ids: 133 duplicate-ids: none
```

`git diff --stat base work -- corpus/SOURCES.md` → `1 file changed, 7 insertions(+)` — append-only, 126 → 133, and the plan's collision-guard "reg 126 ids" matches the pre-append count. No id occurs twice.

Histograms (all sum to 133):

```
tier:   A=110 B=15 C=8
status: mined=101 queued=13 rejected=19
kind:   code=14 community=12 docs=78 own-work=9 paper=8 spec=9 tool=3
```

## The seven frozen rows

All seven occur exactly once, all appended by a745a3b (absent at base — checked), all parse as `cells=11`, `defects=none`:

| id | cells | status | opened | recheck | used-by |
|---|---|---|---|---|---|
| S126 | 11 | mined | 2026-10-24 | 90d | corpus/knowledge/durable-execution-failure-detection.md |
| S131 | 11 | mined | 2026-10-24 | 90d | corpus/knowledge/durable-execution-failure-detection.md |
| S133 | 11 | mined | 2026-10-24 | 180d | corpus/knowledge/durable-execution-failure-detection.md |
| S134 | 11 | mined | 2026-10-24 | 180d | corpus/knowledge/durable-execution-failure-detection.md |
| S135 | 11 | mined | 2026-10-24 | 180d | corpus/knowledge/durable-execution-failure-detection.md |
| S190 | 11 | mined | 2026-10-24 | 180d | corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md |
| S194 | 11 | mined | 2026-10-24 | 180d | corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md |

`recheck` is symbolic cadence (`90d`/`180d`), never prose — matches F2. `opened` is an ISO date on all seven.

## used-by consistency (F3 support)

Both used-by paths exist at rev (`git cat-file -e` → EXISTS for both), and each entry at rev cites exactly the ids its rows credit it with:

```
$ git show a745a3b…:corpus/knowledge/durable-execution-failure-detection.md | grep -o 'S1[0-9][0-9]' | sort | uniq -c
  2 S117 / 3 S126 / 2 S131 / 3 S133 / 3 S134 / 2 S135 / 1 S141
$ git show a745a3b…:corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md | grep -o 'S1[0-9][0-9]' | sort | uniq -c
  2 S190 / 2 S194
```

All five detection ids and both fanout ids are cited by their credited entry. The lone `S141` mention is the known S134/S141 document-identical pair whose re-point flip the plan defers to a later round — the entry mentions it once; the registry carries no S141 row (133 distinct ids, S141 absent), so no duplicate-URL group exists in the registry itself.

## Attack result

```
== attack: rows that do not parse as 11 clean cells ==
ATTACK RESULT: no defect — all rows parse as eleven cells, no pipe
```

Checked across all 133 rows (not just the seven): cell count, escaped `\|`, HTML-entity `&#124;`, literal pipe inside a cell, indented table rows, duplicate `## Registry` headers, duplicate ids. Zero defects; zero duplicate ids. Registry header cells read `id source kind tier scope anchor teaches status opened recheck used-by` with a pure-dash separator row.

## Observations (outside the item, no verdict)

- The worktree is dirty relative to a745a3b: an uncommitted 8-line prose bullet (band-4 S106→S194 narrative) in `corpus/SOURCES.md` above the registry. It adds no rows (worktree row count still 133) and does not affect any fact above; this report measures the committed blob only.
- All facts above corroborate D60 F2's registry-facing surface; F2's remaining clauses (capture pins, dupes CLEAN) and F4–F6 are other seats' items and were not measured here.

Report: .ufo/waves/round-60/w1/ExecRows.md
