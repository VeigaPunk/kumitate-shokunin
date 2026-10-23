# MutRepairsMutants — mutation attack on C2 `repairs50-probe.mjs` (R50)

Seat: mutation-tester. Item: mutate the R1/R2/R4/R6 checks of the frozen auxiliary counter and report what
the counter kills. Read-only on the lane; all mutants live in a `mktemp` clone. No tools installed.

Frozen subject (bytes unchanged by this seat):
`sha256 .ufo/waves/round-50/probe/repairs50-probe.mjs` =
`f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d` (identical in lane and scratch).

## Method and controls

- Scratch: `git clone --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /tmp/r50-mutrepairs.GOMGUX/lane`,
  then `git checkout --detach 378b6e7` (the round freeze rev; the lane HEAD advanced to `6927903f` during the
  wave from L1 commits, not from this seat). Every mutant is a branch from one synthetic base commit inside the
  clone; the lane checkout was never written.
- Why a synthetic base: at `378b6e7` most checks miss (control below), so a "mutant kills the check" test would
  be inconclusive. The base commit `cc7b92fe03ea302036aa412610dfa25be6e4436e` adds only fixtures that make
  R1–R6 satisfiable, so each mutation can be scored as PASS→MISS.
- Base control: `REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=cc7b92fe03ea302036aa412610dfa25be6e4436e rule=R50`,
  exit 0. Every mutant below is base + one mutation; a 7/8 result isolates exactly the mutated check.
- Real-rev control (read-only): `node .ufo/waves/round-50/probe/repairs50-probe.mjs . 378b6e7 --fleet
  /home/vgpnk/Projects/shokunin` →
  `R1 MISS no ## Gate / R2 MISS absent / R3 MISS absent / R4 MISS files=1 / R5 PASS swept / R6 MISS missing /
  R7 PASS exit=0 / R8 PASS erratum` → `REPAIRS50: LEDGER_UNMET held=3/8 checks=8 rev=378b6e7 rule=R50`, exit 1.
  (At session start R8 also missed; the L1 landed the fleet erratum mid-session — see F6.)

Base fixture bytes (blob ids in the clone):
`8248cfb` round-49.md (appended `## Gate` block with lowercase `candidates/admitted/rejected/spot-check`),
`4474886` round-50.md (`## Mistakes` + `## Gate` with a ledger line), `bb23adf` ReopenS095.md and `92fe2d5`
ReopenS098.md (HOLD + correct body sha256), `94c7ea2` r50/ReRunB49-2.txt and `ca1e1cb` ReRunB49-3.txt
(run-at 20:48:09Z / 20:53:09Z, `BINDORACLE49: ORACLE_HELD held=6/6`, byte-distinct), alongside the pre-existing
`ReRunB49-1.txt` (20:43:09Z). Base R4 slot: `files=3 distinct=3 held=3 span_s=600`.

Every fixture carries an explicit `SYNTHETIC FIXTURE … not a real B49 run` / `… not a re-open` line after the
first line, so no scratch byte can be mistaken for a real receipt.

## Kill table — the four assigned mutations

| # | rev | mutation | expected | actual | verdict |
|---|---|---|---|---|---|
| a1 | `0a07eff0` | three receipts share one `run-at=2026-10-23T20:43:09Z` (bodies distinct) | R4 MISS (span < 300 s) | `R4 MISS files=3 distinct=3 held=3 span_s=0` | **KILLED** |
| a2 | `12ed5bae` | three receipts byte-identical (`cp` of ReRunB49-1.txt) | R4 MISS (distinct < 3) | `R4 MISS files=3 distinct=1 held=3 span_s=0` | **KILLED** |
| b1 | `bf94cadd` | `## Gate` with `candidates`/`admitted`/`rejected` but `spot check` (hyphen removed) | R1 MISS | `R1 MISS no ## Gate` | **KILLED** |
| c1 | `b39d77ad` | ReopenS095.md `REOPEN50: HOLD … sha256=` 64 zeros, correct hash nowhere | R2 MISS | `R2 MISS first=REOPEN50: HOLD source=https://raw.githubusercontent.com/cont` | **KILLED** |
| d1 | `63979b46` | round-50.md keeps `## Mistakes`, no `## Gate` | R6 MISS | `R6 MISS missing` | **KILLED** |
| c2 (supp.) | `f2663d49` | `REOPEN50: hold` (lowercase) with the correct hash | R2 MISS (regex case-sensitive) | `R2 MISS first=REOPEN50: hold source=https://raw.githubusercontent.com/cont` | **KILLED** |

Each killed run printed `REPAIRS50: LEDGER_UNMET held=7/8 checks=8 … rule=R50` and exit 1; all other checks
stayed PASS in the same run (full lines in the transcript below). All four assigned mutations are killed.

Verbatim per-run check lines (abridged only by dropping the four PASS lines that are identical in every run —
R3/R5/R7/R8; full runs are in the session transcript):

```
a1  R1 PASS gate-ledger | R2 PASS | R4 MISS files=3 distinct=3 held=3 span_s=0 | R6 PASS sections
    REPAIRS50: LEDGER_UNMET held=7/8 checks=8 rev=0a07eff07041028bcb7f446c5ea16bbf62a1ea66 rule=R50  EXIT=1
a2  R1 PASS | R2 PASS | R4 MISS files=3 distinct=1 held=3 span_s=0 | R6 PASS
    REPAIRS50: LEDGER_UNMET held=7/8 checks=8 rev=12ed5bae65bb5206220835e7188a3fc336f33c44 rule=R50  EXIT=1
b1  R1 MISS no ## Gate | R2 PASS | R4 PASS span_s=600 | R6 PASS
    REPAIRS50: LEDGER_UNMET held=7/8 checks=8 rev=bf94cadfdd5b7824235351d8f72bad663d959138 rule=R50  EXIT=1
c1  R1 PASS | R2 MISS first=REOPEN50: HOLD source=https://raw.githubusercontent.com/cont | R4 PASS | R6 PASS
    REPAIRS50: LEDGER_UNMET held=7/8 checks=8 rev=b39d77ad72b8259dacb7f400ce0a1334e95c48a2 rule=R50  EXIT=1
c2  R1 PASS | R2 MISS first=REOPEN50: hold source=https://raw.githubusercontent.com/cont | R4 PASS | R6 PASS
    REPAIRS50: LEDGER_UNMET held=7/8 checks=8 rev=f2663d49e196ef92edd183e65031905876c42a71 rule=R50  EXIT=1
d1  R1 PASS | R2 PASS | R4 PASS span_s=600 | R6 MISS missing
    REPAIRS50: LEDGER_UNMET held=7/8 checks=8 rev=63979b46310c72bf234c5d9cd01974dd042bc11a rule=R50  EXIT=1
```

## Survivor table — mutations the counter does NOT see

| # | rev | mutation | expected | actual | verdict |
|---|---|---|---|---|---|
| a5 | `7e608a38` | receipts 1 and 2 share `run-at=20:43:09Z`, receipt 3 at `20:53:09Z` (distinct bytes) | R4 MISS (not three spaced runs) | `R4 PASS files=3 distinct=3 held=3 span_s=600`, held=8/8 exit 0 | **SURVIVED** |
| b2 | `034bcd70` | Gate block replaced by one prose sentence: "The r49 candidates were admitted or rejected; a spot-check found no defect." | R1 MISS (no ledger) | `R1 PASS gate-ledger`, held=8/8 exit 0 | **SURVIVED** |
| c3 | `c1573bc6` | `REOPEN50: DRIFT … sha256=<correct>` | R2 MISS (plan expects HOLD) | `R2 PASS REOPEN50: DRIFT source=…`, held=8/8 exit 0 | **SURVIVED** |
| c4 | `f33e68e6` | `REOPEN50: HOLD (hash recorded below)`; correct hash only in a body note | R2 MISS (hash must be on the verdict line) | `R2 PASS REOPEN50: HOLD (hash recorded below)`, held=8/8 exit 0 | **SURVIVED** |
| d2 | `c235953f` | `## Gate` exists only inside a fenced `text` block | R6 MISS (no section) | `R6 PASS sections`, held=8/8 exit 0 | **SURVIVED** |
| d3 | `0405006d` | real `## Gate` heading with zero content | R6 MISS (no ledger) | `R6 PASS sections`, held=8/8 exit 0 | **SURVIVED** |

```
a5   REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=7e608a3837c46fd634318b2aaa456f4290ef26fc rule=R50  EXIT=0
b2   REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=034bcd708637c5d9645be7b3f5681ca32371b9b3 rule=R50  EXIT=0
c3   REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=c1573bc601907b7d6ed4423c127a687fb10e6503 rule=R50  EXIT=0
c4   REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=f33e68e63e9144d5adbcfe904a1b3d4028b4c4e2 rule=R50  EXIT=0
d2   REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=c235953fdb617837959b84da9fa2684ef810beab rule=R50  EXIT=0
d3   REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=0405006de4f5ae22c55e718105003e9a073c33f8 rule=R50  EXIT=0
```

## Findings (coverage findings; the frozen contract is not amended here)

- **F1 — R4's spacing proof is first-to-last only (a5, highest exploitability).** `span = max(run-at) −
  min(run-at)`, so two of three receipts may claim the same instant and R4 still prints
  `distinct=3 … span_s=600`. The r49 byte-identical defect (R50-4) can return in 2 of 3 receipts — a replay of
  one earlier run plus one genuinely later run — while LEDGER_HELD stays at 8/8. The plan already records the
  weaker limit (c) "preamble+distinct-bytes, not a temporal proof"; this is the concrete shape that limit lets
  through.
- **F2 — R1 is four-token presence, not a ledger (b2).** A single sentence containing `candidates`,
  `admitted`, `rejected`, `spot-check` scores `R1 PASS`. Any r49 `## Gate` text is judged only on those
  substrings and on being the slice before the next `^## ` heading. Secondary diagnostics defect: b1 (a real
  Gate missing only the hyphen) reported `R1 MISS no ## Gate`, conflating "heading absent" with "token absent"
  (the `say` string is `g1ok ? 'gate-ledger' : 'no ## Gate'`).
- **F3 — R2/R3 score DRIFT exactly like HOLD (c3).** `reopen()` accepts `(HOLD|DRIFT)`, and the check passes
  because the recorded body hash is present. The plan's C2 text says the two re-opens "HOLD"; a DRIFT receipt
  (source moved, cited span no longer holds) still yields 8/8. The frozen sentence does not require HOLD, so
  this is an **acceptable limit of the frozen predicate as written**, but the close report must not read
  `LEDGER_HELD` as "both re-opens verified HOLD".
- **F4 — the sha256 is an `includes()` anywhere in the file (c4).** It is not bound to the verdict line; a
  receipt whose first line is `REOPEN50: HOLD (hash recorded below)` and whose only hash is in an unrelated body
  note passes. Also noted: the first line is `.trim()`-ed before the regex, so a bare `REOPEN50: HOLD ` (nothing
  after the space) would MISS — a formatting nuance, not a hole.
- **F5 — R6 is markdown-unaware and content-free (d2, d3).** `/^## Gate\s*$/m` matches a line inside a fenced
  code block and an empty heading. Round-50's own Gate ledger (candidates/admitted/rejected/spot-check) is
  validated by no C2 check — R1 checks round-49 only. Recorded as a limit of the frozen shape check.
- **F6 — R7 and R8 are live, not rev-bound.** R8 flipped MISS→PASS mid-session while no lane rev changed (the
  L1 landed the fleet erratum); R7 runs the live fleet tree. Six of eight checks read `<rev>`, two do not, so a
  revision's score is not a pure function of its bytes. The plan records R8 ordering under limit (d); R7 has the
  same property and is worth the same disclosure.
- **F7 — the predicate is satisfiable by fixture bytes.** The synthetic base (clearly labelled fixtures, no real
  B49 run, no source fetch) scored `LEDGER_HELD held=8/8`. That is consistent with the frozen contract (R2/R3/R4
  verify format + recorded hashes, not provenance), but LEDGER_HELD must not be presented as evidence that the
  runs/re-opens actually occurred — that judgment rests on the committed receipts' authorship, not this probe.

## Verdict

All four assigned mutants are killed: identical `run-at` (a1), identical bodies (a2), a Gate with 3 of 4 ledger
words (b1), HOLD with a wrong sha256 (c1), and a round-50 lesson with no `## Gate` (d1). Six supplementary
mutants survive (a5, b2, c3, c4, d2, d3); F1 and F2 are the two that most weaken the intended repairs, and
neither may be fixed by changing the frozen predicate in this round.

## Restoration / non-mutation evidence

- The lane and fleet repos were read-only inputs: only `git show`/`ls-tree`/`log`/`status`, `cat`, `grep`,
  `sha256sum`, and the two frozen probes were run against them. The only file this seat writes in the lane is
  this report.
- Frozen counter bytes: `f69dbc3e…` in both lane and clone; the round-49 probe was not touched. No host files
  were created outside `/tmp`; no packages were installed.
- The scratch clone (`/tmp/r50-mutrepairs.GOMGUX`, 72 MB, mktemp) retains every mutant rev for inspection:
  base `cc7b92fe`, a1 `0a07eff0`, a2 `12ed5bae`, a5 `7e608a38`, b1 `bf94cadd`, b2 `034bcd70`, c1 `b39d77ad`,
  c2 `f2663d49`, c3 `c1573bc6`, c4 `f33e68e6`, d1 `63979b46`, d2 `c235953f`, d3 `0405006d`. It is disposable and
  nothing in it is a lane/fleet commit.
