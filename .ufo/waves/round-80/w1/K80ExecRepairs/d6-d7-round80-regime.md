# D6 / D7 — what round-80's regime does, and whether the frozen plan + counters enforce it

## D6 — close counter receipts must name the measured revision (`rev=` line)

r79 defect (verified this audit):
- `grep -c 'rev=' .ufo/waves/round-79/close/c1-probe.txt` → **0**.
- `close/c2-probe.txt` has exactly one `rev=` token, and it is not a receipt stamp: line 3 is an arm
  output line, `C79_C2 arm fixture-clean ok REPORT_RECEIPT: CLEAN (round=79 rev=worktree bytes=268 …)`.
- `close/proxy-check.txt:1` and `close/c2-r78.txt:1` both carry `rev=357e4e730574486fc1fd77d037768296da6be685`
  — so the r79 close knew how to stamp; the two counter-probe receipts were simply not stamped.
- `git log --format='%an <%ae> %H %s' -- .ufo/waves/round-79/close/c1-probe.txt` → lane identity on
  `357e4e73…` (work) and `32620ef5…` (close receipts); neither commit adds a `rev=` line.

Repair class: **prevention only + recorded**. The filed close receipts are frozen close bytes; the
plan's own rule (`.ufo/waves/round-80/plan.md`: "a post-freeze defect is answered with a named
erratum in the round lesson, never a silent edit") forbids touching them, and the fleet-report
erratum records the defect.

Round-80 regime: plan.md line 136 (Freeze) — "the after-state is measured at the close commit,
which names the measured revision in every close receipt (`rev=` line)".

Enforcement check (frozen bytes at `c6a7ebd3`):
- `grep -in 'rev' .ufo/waves/round-80/probe/probe80-c1.mjs probe80-c2.mjs` → **no matches**. The
  frozen counters neither print nor validate a `rev=` stamp; a counter cannot fail its own receipt
  for lacking one.
- So enforcement is procedural: the L1 prepends the `rev=` header when capturing close receipts
  (the r79 `proxy-check.txt` precedent), exactly as the plan sentence mandates. **Gap:** if a close
  receipt is produced by bare redirection of probe stdout, D6 recurs silently and still scores
  `HELD`. Recommend the round-80 close checklist carry an explicit "every close receipt opens with
  `rev=<close commit>`" item; no counter change is possible post-freeze.

## D7 — committed round-start sources census under `open/`

r79 defect (verified this audit): the fleet report's Sources & frontier (lines 110–114) cites
`.ufo/waves/round-79/open/gates-open.txt` for the start census. Full read of that file (40 lines)
shows stanzas `proxy strict / proxy json / kimi census / omp census / readme map / spotcheck check /
checklists` — no sources-census output. (The spotcheck's "no census section" is loosely worded:
kimi/omp census stanzas ARE present; what is missing is the SOURCES census.) Only
`close/sources-census.txt` (`census_exit=0`) was committed for r79.

Repair class: **prevention + recorded**. Same append-only constraint; the fleet-report erratum
names the gap.

Round-80 regime and enforcement check:
- `.ufo/waves/round-80/open/sources-census.txt` EXISTS and is COMMITTED at `509afb1d` ("corpus
  increment — … round-start sources census …"), post-freeze and pre-data. Content verified:
  header `lane tip ed64ddcabf4e4f6a0d860d288d083fdad34f61c7`, six carried `W04` + `kumitate ok`,
  `census_exit=0`, histogram `171 rows, A=146 B=16 C=9`.
- The frozen plan's Open state records "sources census exit 0 (six carried W04 warnings)" and the
  Sourced-claim section states "The census is run at round open and close".
- **Gap:** the freeze commit `c6a7ebd3` does NOT carry `open/sources-census.txt`
  (`git ls-tree c6a7ebd3 -- .ufo/waves/round-80/open/` lists 7 files, census absent) — the open
  census is plan prose plus a committed post-freeze receipt, not a freeze-bound artifact. A future
  round could omit it without tripping any frozen counter. Acceptable under this round's rules
  (Amendment 1 itself is post-freeze), but the close should re-run the census into
  `close/sources-census.txt` to complete the open/close pair.
