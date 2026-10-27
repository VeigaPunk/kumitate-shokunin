# K68ScribeLedgerD — answers, evidence, class spans (rounds 64, 65)

Lane worktree read at `39f61816d4ee7a8d401df42c1818c91a9c537bce` (round-68 freeze; `git status --porcelain` shows
only the wave's own untracked `.ufo/waves/round-68/` files). The round base in the plan is
`d23892ad44b41e1af63b3edb949d265ca1dd812d`; `git merge-base --is-ancestor d23892ad HEAD` → `anc=0`.
Scratch: `/fast/scratch/hyaku/kumitate-r68/K68ScribeLedgerD` (deleted on exit). No lane file was written outside
`.ufo/waves/round-68/build/K68ScribeLedgerD/` and `.ufo/waves/round-68/w1/K68ScribeLedgerD.md`.

## 1. Item census — the ordinal source, not a hand count

The frozen counter's `items67()` (copied verbatim to scratch) and the committed v1 tool's `routedItems()`:

```
items: r64=5 r65=7
tool routedItems: r64=5 r65=7
```

Per-round fence-aware census over the whole claim window (same parser):

```
round 55 items=3   round 60 items=9   round 64 items=5
round 56 items=4   round 61 items=6   round 65 items=7
round 57 items=4   round 62 items=5   round 66 items=4
round 58 items=8   round 63 items=6
round 59 items=0 (prose section)      total 55..65 = 57, 55..66 = 61
```

Two dispatch/plan sentences disagree with those numbers (they do not change any count that L2 binds, which is the
counter's own `items=`):

- The seat blurb says "Round 64: D1–D7"; the file routes **D1–D5** (5 items). "jj forge limits" is not an item of
  round 64's routed section at all (the nearest text is `changes-after-freeze` prose).
- The plan's sentence splits 61 as "rounds 55..65's 58 plus round 66's D1–D3"; the counter reads **57 + 4**. The
  total is 61 either way (round 66's fourth item is the operator note, `corpus/lessons/round-66-verifier-spotcheck.md`
  item 4). Reported as finding K68ScribeLedgerD-2; no in-place edit (frozen plan).

## 2. Row-by-row answer evidence

Closed rows (quote located at the exact named line — L3 has no ±2 window):

| id | status | answer target | why it answers | command that proves the target |
|---|---|---|---|---|
| R64-D1 | closed | `.ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3` — "REPORT_RECEIPT_SELFTEST: PASS (125/125)" | The item asked for one committed full-tool selftest transcript at the landed tool; this receipt is `$ node scripts/report-receipt-diff.mjs --selftest` → `PASS (125/125)` `EXIT=0`, committed in the round-65 freeze commit `2ca91a0c`, and the tool bytes are identical between round 64's after-hash and round 65's base: `git diff --stat a004902d… 47fe2383… -- scripts/report-receipt-diff.mjs` → empty; `git merge-base --is-ancestor a004902d… 47fe2383…` → exit 0 | `git log --format='%h %s' -1 -- .ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt` → `2ca91a0c round-65: freeze — …` |
| R64-D2 | closed | `corpus/README.md:192` — "row added in round 65 (D2) so the file does not open the round in DRIFT" | the row for `lessons/round-64-verifier-spotcheck.md` exists and names D2 as its cause | `grep -n 'row added in round 65 (D2)' corpus/README.md` → `192:` |
| R65-D1 | closed | `.ufo/waves/round-66/d1-gate-correction.md:11` — "These rows are copied from corpus/SOURCES.md S204–S206" | the per-row Gate record the item demanded (S204/S205/S206 URL, access date, ≤25-word quote, capture sha256/bytes) is committed at lines 7–9; line 11 states the source. Residual: the correction is not appended to the round-66 lesson (its own line 11 says "does not edit the round-65 lesson") — finding K68ScribeLedgerD-3 | `git log --format='%h %s' -1 -- .ufo/waves/round-66/d1-gate-correction.md` → `6c79d68c round-66: capture opened sources and record r65 D1 correction evidence` |
| R65-D5 | closed | `.ufo/waves/round-66/w1/K66ExecCiteCheckD5.md:19` — "base 0 M 59 freeze 58 delta_M +59" | the item asked to "attribute the 92 to files and fix or explain"; lines 19–23 are the per-file attribution (`round-65.md +59`, `omp-installed-release…md +24`, `SOURCES.md +8`, `omp-task-contract.md +1`, README net 0) and line 25 is `ADDED=99 REMOVED=7 NET=92`. The measured fix (1667→1583, 0 new errors) was **not** applied — attribution only | `git log --format='%h %s' -1 -- .ufo/waves/round-66/w1/K66ExecCiteCheckD5.md` → `a3d76c03 …` |
| R65-D7 | closed | `corpus/README.md:195` — "row added at the round-66 open (D7) so the file does not leave the round in DRIFT" | the row for `lessons/round-65-verifier-spotcheck.md` exists and names D7 | `grep -n 'row added at the round-66 open (D7)' corpus/README.md` → `195:` |

`wontfix` row:

| id | status | answer target | why |
|---|---|---|---|
| R65-D4 | wontfix | `corpus/lessons/round-65.md:158` — "carried, not harmed" | the routed item itself says "carried, disclosed"; the lesson records the disposition (`proxy-check --strict` DRIFT at base and tip, new scripts unpinned) and the verified refresh procedure for the next round. Not a repair claim |

Open rows (`-`) — each with the reproduction that shows the named work is still unlanded at the freeze:

| id | status | what is still missing | reproduction (verbatim) |
|---|---|---|---|
| R64-D3 | open | `close/supplementary-c2.txt` absent; the "re-derivation with the final tool is in the report" line absent. Third sub-item (two untracked `K64ExecProxyRepair` receipts) **is** closed: both are tracked since `2ca91a0c` | `ls .ufo/waves/round-64/close/supplementary-c2.txt` → `No such file or directory` (exit 2); `grep -c 're-deriv' /home/vgpnk/Projects/shokunin/.ufo/reports/round-64/kumitate.md` → `0`; `git ls-files .ufo/waves/round-64/build/K64ExecProxyRepair/receipts/13-manifest-before.txt` → listed |
| R64-D4 | open | Kimi layer still DEGRADED (K=49/53); `SESSION_AMBIGUOUS ×4` and the fleet-`.git` incident carry no established cause. `CHANGES-AFTER-FREEZE.md` records the kimi decision (SCORECARD note only, operator question filed) and the incident cause as unproven — a disposition for two of three parts, not a closure of the item | `sed -n '2985p' SCORECARD.md` → "**Kimi layer: DEGRADED (routed defect D4).** … **K = 49/53, DEGRADED — never cite K=49 as clean.**"; `cat -n .ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md` tail → "The lane did not establish the cause" |
| R64-D5 | open | R61-V2 still unaddressed and Audit19 residuals still unexecuted at the round-68 freeze | `grep -n 'R61-V2, unaddressed again\|Audit19 residuals' corpus/lessons/round-65.md` → `133:`/`130:`; `grep -rn 'R61-V2\|Audit19' corpus/lessons/round-6[6-8]*` → no hits |
| R65-D2 | open | `SCORECARD.md` `## Capabilities` has 19 data rows, none whose first cell is `harm-matrix`; the only mention is the round-65 prose line 2995 | L6-style scan of the section: `capat [1776] rows 19 harm-matrix in first cell: []`; `grep -n 'harm-matrix' SCORECARD.md` → `2995:` only |
| R65-D3 | open | `SKILL.md` has no registry rows for `harm-matrix` / `omp-binary-probe`; no pins | `grep -c 'harm-matrix\|omp-binary-probe' SKILL.md` → `0` (exit 1); `grep -c 'pin.harm-matrix\|pin.omp-binary-probe' SCORECARD.md` → `0` |
| R65-D6 | open | band met once (round 66: `"spawn": 66`) but no falsify wave was ever dispatched; round 68's declaration is in-flight, not evidence | `sed -n '17p' .ufo/waves/round-66/w1-dispatch.json` → `"spawn": 66,`; `ls .ufo/waves/round-66/` → `w1` only, no `w2*` |

Additional measurements used above:

```
$ grep -oE '\*\*Q[0-9]+' corpus/QUALITY.md | sort -t Q -k2 -n | tail -3
**Q59
**Q60
**Q61                       # Q62–Q64 (R65-D4's second half) never landed
$ ls scripts/class-recurrences.sh
ls: cannot access 'scripts/class-recurrences.sh': No such file or directory
$ test -e corpus/routed-ledger.md || echo absent
absent                      # ids R65-D1..D7 are free at the base
```

## 3. Class-span table so far

Class slugs are not invented here: they are the canonical 13-slug set of round-66 seat `K66ScribeClasses`
(`.ufo/waves/round-66/build/K66ScribeClasses/table.md`, 57 rows covering rounds 55–65; round 59 has 0 items,
round 66's 4 items are seat `K68ScribeLedgerE`'s). Every one of my twelve rows carries that table's slug for the
same (round,item); the spans below are the union of that table with this seat's rows (unchanged, because the table
already covers 64 and 65):

| class | distinct rounds | rounds | rows |
|---|---|---|---|
| `reference-drift` | 7 | 56, 58, 60, 61, 63, 64, 65 | 8 + mine (3) |
| `carried-unaddressed` | 6 | 55, 56, 57, 62, 63, 64 | 7 |
| `dispatch-accounting` | 5 | 57, 58, 60, 61, 62 | 5 |
| `citation-integrity` | 4 | 58, 60, 62, 65 | 4 |
| `report-fidelity` | 4 | 55, 58, 60, 65 | 4 |
| `tally-drift` | 4 | 55, 58, 60, 63 | 7 |
| `wave-shape` | 4 | 56, 62, 63, 65 | 4 |
| `dangling-pointer` | 3 | 60, 61, 64 | 4 |
| `frozen-predicate-defect` | 3 | 56, 57, 61 | 3 |
| `verification-gap` | 3 | 62, 63, 64 | 3 |
| `append-only-violation` | 2 | 57, 61 | 2 |
| `registry-home` | 2 | 58, 65 | 3 |
| `uncommitted-work` | 2 | 60, 61 | 3 |

L3's span clause (`>= 4 distinct spot-check rounds` for at least one class) is satisfied by `reference-drift` (7),
`carried-unaddressed` (6), `dispatch-accounting` (5) and four 4-round classes — **in the union**. This seat's slice
alone spans only two rounds and cannot satisfy it; the validator below reports exactly that, which is the correct
pre-integration reading for a 2-round slice and the reason the slugs must not be re-invented by a sibling seat.

## 4. Validator transcript (scratch: L3 replica + the committed v1 tool)

`node validate.mjs` — replica of L3's row rules (verbatim counter `items67`, word-boundary + uniqueness in section,
id-round match, single non-open row per item, exact-line answer quote, class arithmetic) plus the committed tool run
on a minimal scratch tree (v1 tool, worktree mode, `--from 64 --to 65`):

```
items: r64=5 r65=7
tool routedItems: r64=5 r65=7
rows parsed: 12 all 7-cell
ok R64-D1 closed .ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3
ok R64-D2 closed corpus/README.md:192
ok R65-D1 closed .ufo/waves/round-66/d1-gate-correction.md:11
ok R65-D4 wontfix corpus/lessons/round-65.md:158
ok R65-D5 closed .ufo/waves/round-66/w1/K66ExecCiteCheckD5.md:19
ok R65-D7 closed corpus/README.md:195
CLASS carried-unaddressed rounds=64
CLASS citation-integrity rounds=65
CLASS dangling-pointer rounds=64
CLASS reference-drift rounds=64,65
CLASS registry-home rounds=65
CLASS report-fidelity rounds=65
CLASS verification-gap rounds=64
CLASS wave-shape rounds=65
L3-REPLICA: FAIL 1 no-class-spans-4-rounds      <- union clause, not a row defect (see §3)
--- tool exit=0
CLASS reference-drift rows=3 rounds=64,65
CLASS carried-unaddressed rows=2 rounds=64
CLASS citation-integrity rows=1 rounds=65
CLASS dangling-pointer rows=1 rounds=64
CLASS registry-home rows=2 rounds=65
CLASS report-fidelity rows=1 rounds=65
CLASS verification-gap rows=1 rounds=64
CLASS wave-shape rows=1 rounds=65
ROUTED_LEDGER: CLEAN spotchecks=2 sections=2 items=12 rows=12 open=6 closed=5 wontfix=1
EXIT=0
```

## 4b. Independent cross-check (peer helper, read-only, not mine)

Peer seat `K68ScribeLedgerC`'s `reanchor.mjs` re-derives `path:line` for every non-open row without consulting my
validator (it matches the quote anywhere in the file and reports the line that holds it):

```
$ node .ufo/waves/round-68/build/K68ScribeLedgerC/reanchor.mjs <lane> .ufo/waves/round-68/build/K68ScribeLedgerD/rows.md
BADFORMAT id
OK R64-D1 .ufo/waves/round-65/base/report-receipt-diff-selftest-freeze.txt:3
OK R64-D2 corpus/README.md:192
OK R65-D1 .ufo/waves/round-66/d1-gate-correction.md:11
OK R65-D4 corpus/lessons/round-65.md:158
OK R65-D5 .ufo/waves/round-66/w1/K66ExecCiteCheckD5.md:19
OK R65-D7 corpus/README.md:195
REANCHOR: DRIFT problems=1
```

All six closed/wontfix answers re-derive at the cited line independently. The one `BADFORMAT id` is the helper's own
header-row artefact (it treats the `| id | round | … |` header as a row whose `status` cell is `status`), not a row of
mine — `sed -n '80,82p' .ufo/waves/round-68/build/K68ScribeLedgerC/reanchor.mjs` shows `c[5] === 'open'` is the only
skip. Reported to that seat; it does not affect the tool or the frozen L3. That seat has since fixed it (header and
separator rows skipped, an unknown status now reads `BADSTATUS`) and re-ran both fixtures to `CLEAN problems=0`; the
`EXIT=0` printed in my first run was `tail`'s exit code, not the helper's — the helper exits 1 on any problem, so the
header case did fail as it should.

## 5. Limits

- The replica runs over the lane worktree, not over `git archive M`; it does not exercise the counter's `--rev`
  path (a `git show` per answer file) or its extraction/`EXTRACTION_UNSAFE` arms.
- No registry gate was run by this seat (readme-map, proxy-check, sources-check, census): statuses for R65-D2/D3/D4
  rest on file/line reads and on the committed receipts named above, not on a gate exit.
- Whether an answer truly answers its item is the non-author closure's judgment (plan §C1 stated limit); this seat
  guarantees only that every quote is located, unique and at the exact line, and that every `open` names the
  missing work.
- R65-D5's answer quotes the largest file's delta line; the rest of the attribution is on the adjacent lines of the
  same committed report, not in the row.
