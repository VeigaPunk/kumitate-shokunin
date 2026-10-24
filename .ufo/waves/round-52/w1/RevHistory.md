# RevHistory — carried-items audit (round 52, wave 1)

Seat: `kumitate-r52.RevHistory`. Independent leaf; review only, no edit to lane bytes, no counter
scored, no admission. Axes named: **operability (C1 evidence chain)**, **coverage/claim honesty
(declared-vs-implemented)**, **continuity (carried items survive the round open)**, **harm-gate
continuity (H1–H5)**. Godspeed: cheap parallel reads, keep moves that improve any axis and harm none.
This report does not modify contract, axes, routes or judgment; the frozen plan is the only
instruction source I treat as authoritative.

## Method and identity

Read: `.ufo/waves/round-52/plan.md` (whole), `.ufo/waves/round-52/probe/attest52-probe.mjs`
(B1–B5c, headers 1–75, arms 100–414), `.ufo/waves/round-52/base/attest52-base.txt`,
`SCORECARD.md:1732,2255-2374`, `corpus/lessons/round-43-verifier-spotcheck.md:160-190`,
`corpus/lessons/round-44.md:97-141`, `.ufo/waves/round-51/w2/CritA3eGap.md`,
`.ufo/waves/round-51/w2/CritLedger.md`, `/home/vgpnk/Projects/shokunin/.ufo/reports/round-51/kumitate.md:180-210`,
`SKILL.md:687-709`. Lane `HEAD` = `ac5674393f68` (v2 instrument not yet integrated; working-tree
`scripts/receipt-attest.mjs` sha256 `44919763…` = the pinned v1, plan.md:48).

Executed (scratch under `.ufo/waves/round-52/build/RevHistory/`, receipts in this dir):
extracted v1 from base `02c01258`, built a window-check-deleted copy by exact line splice
(8 lines, `383-390` of the base file), and ran three constructions against both. Node
`v24.21.0` (fnm, `/home/vgpnk/.local/share/fnm/.../bin/node`); no tools installed or updated.

```text
V1_SHA=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
MUT_SHA=29d0efb0897965adfa5d6f7782a0be711daf3798442e5e6ff632b5bf4975290f
[v1]     B3c_construction="RECEIPT: TAMPERED" exit=1   reason="sidecar mismatch: …"
[v1]     A3e_in_window_refreshed_sidecar="RECEIPT: VALID" exit=0
[v1]     outside_window_refreshed_sidecar="RECEIPT: TAMPERED" exit=1
[v1]     selftest_exit=0 last="ATTEST_SELFTEST: PASS"
[mutant] B3c_construction="RECEIPT: TAMPERED" exit=1   reason="sidecar mismatch: …"
[mutant] A3e_in_window_refreshed_sidecar="RECEIPT: VALID" exit=0
[mutant] outside_window_refreshed_sidecar="RECEIPT: VALID" exit=0
[mutant] selftest_exit=1 last="ATTEST_SELFTEST: FAIL"
```

## Findings (severity order)

### F1 — HIGH (freeze-repair class): B4's "all prior receipt corpora" sweep cannot see any prior receipt-attest corpus

Frozen text: plan.md:122 "B4 ledger over the round-52 receipts + zero nonce hits across all prior
receipt corpora"; probe header `attest52-probe.mjs:49-53` narrows that to "no prior receipt corpus
file under .ufo/waves/ (round-48/49/50/51 receipt corpora)". Implementation (`:302-335`) walks
`.ufo/waves` and keeps a *file only when its basename matches* `/receipt|ReRun|L1-score/i`:

```js
if (st.isDirectory()) { if (!/round-52$/.test(n)) walk(p); continue; }
if (/receipt|ReRun|L1-score/i.test(n)) prior.push(p);
```

The actual corpora are named otherwise. Replaying the exact walk at the lane tree: 176 prior files,
`by round {"35":7,"40":6,"41":3,"42":5,"43":7,"44":12,"45":1,"46":1,"48":113,"49":3,"50":4,"51":14}`,
and **0 files from any `receipts/` directory of rounds 46/47/48/51**. The 176 are lab transcripts
(`round-48/build/*-receipt.txt`), `L1-score`/`ReRun` metadata, and five instrument-source copies
(`round-51/build/*/receipt-attest.mjs`). The round-51 receipt-attest corpus itself —
`.ufo/waves/round-51/receipts/attest-run-{1,2,3}.txt`, `attest-run-2-replayed.txt` + `.sha256`
(9 committed files at base `02c01258`, `git ls-tree` verified) — is entirely unscanned; so are
`round-46/probe/receipts/*` (`c1-base.txt`, `a2-controls.txt`, …) and `round-48/probe/receipts/*`
(`stab-r47-*`, `prefix-bug-stab-*`, …).

The base receipt never exercised this path: `base/attest52-base.txt` → `B4 MISS tool or receipts dir
absent` (the scan is inside `if (existsSync(tool) && existsSync(rd))`). So the conjunct the plan
declares has not been executed once, and when it does execute it reads no receipt-attest corpus.
Consequence: a forger (K3 whole-tree-author class, plan.md:141-145) that reuses a round-51 nonce with
a fresh body passes B4; the only remaining nonce constraint is B2's pairwise distinctness among the
three new receipts. This is a declared-vs-implemented gap in a frozen counter, which is exactly the
class Q43/round-51's headline lesson targets, and the plan already provides the repair path
("Any freeze repair after a seat finding re-runs both and commits fresh base receipts", plan.md:151-153).
Minimal fix: enumerate by path (`**/receipts/**`, `*/close/*.txt`, `*/base/*.txt`), not by basename;
re-run both base receipts and commit them under the addendum numbering.

### F2 — HIGH (freeze-repair class): B3/B3c are sidecar-integrity arms, not prelude-window arms; the window check is covered only by B1's instrument-owned selftest

Plan.md:120-121 labels B3 "committed doctored control (run-2 prelude rewrite, sidecar untouched)" and
B3c "live prelude-tamper". Probe B3c (`:278-300`) rewrites the prelude to `2020-01-01…` and then
**copies the original sidecar** (`copyFileSync(rcpt.sha256, tampered.sha256)`) onto a differently
named file. v1 rejects that at the sidecar **hash**, not at the window
(`receipt-attest.mjs`@`02c01258`: sidecar hash-only check `324-333`, no basename check; window check
`383-390`, `PRELUDE_SLACK_MS` `:75,105`). My run confirms the rejection reason on v1 — and the same
construction still reads `TAMPERED` on a build whose window check I deleted:

```text
[mutant] B3c_construction="RECEIPT: TAMPERED"  (reason: sidecar mismatch)
[mutant] outside_window_refreshed_sidecar="RECEIPT: VALID"
```

So B3/B3c pass without the prelude-window code. Under v2 they are doubly preempted: the new `SHAPE`
rule "the sidecar's recorded name must equal the receipt's basename" (plan.md:76-77) fires on the
copied name, and on the committed control `attest52-run-2-replayed.txt` (sidecar "untouched",
plan.md:164-165) the recorded basename is `attest52-run-2.txt` (a regenerated sidecar would instead
fail the hash check). The only frozen coverage of the window
check is B1 (`--selftest` PASS), i.e. the judged instrument's own test list — the exact boundary r51
recorded (`CritA3eGap.md:16,20`: "A1 trusts the instrument's selftest report … does not certify
arbitrary replacement implementations"). Minimal fix: construct the tamper fixtures with the *same
basename* in a scratch directory and a sidecar that names it (then only the window can reject), and add
the in-window counterpart that must read `VALID` (see F3).

### F3 — MEDIUM (freeze-repair class, same paragraph): the A3e question is not covered — and the in-window refreshed-sidecar class still reads VALID under the v2 contract

The round-51 SCORECARD's planned row names "the A3e captured-invocation question" (SCORECARD.md:2368-2374);
`CritA3eGap.md:150` recommends keeping it as a disclosed limit, not an open behaviour defect. Round 52's
plan has **zero** occurrences of `A3e` and no seat owns it; the only carrier is the ScribeScorecard
seat instruction ("limits subsection (carried: … A3e open …)", `w1-spec.json:160`). That is a seat
instruction, not a frozen plan statement.

The class is still live in v2: plan.md:65-69 keeps "Receipt form, digest, sidecar, verdicts, exit map:
UNCHANGED from v1", and v1 binds the prelude only via the sidecar and the wall-window check (base file
`:15-19,37-40`). With a name-correct refreshed sidecar and an in-window instant, verification returns
`RECEIPT: VALID` (my run above; independently `CritLedger.md` finding (d) on the shipped bytes). None of
the 13 v2 checks constructs that case: B1c rolls the clocks (caught by CLOCK), B2c/B2e are challenge
invocations, B3/B3c use a stale/copied sidecar. So "verified by the frozen counter" (plan.md:51-53)
remains true only for the 13 listed arms; a report sentence implying the refreshed-sidecar re-date class
is closed by the counter would be false. Correction is cheap and in the round's own vocabulary: make
B3c same-basename/refreshed-sidecar + outside-window (must be `TAMPERED`) and add the in-window twin
(must be `VALID`, labelled a boundary case), then name the residual limit in the report. If the wave
elects not to, the plan needs an addendum line carrying A3e as a limit, mirroring r51's.

### F4 — MEDIUM: R52-10 is "deferred" but the v2 probe re-ships the exact weak conjunct, and the stated rationale does not apply to it

Plan.md:37-39 defers R52-9/R52-10 with one reason: "the v2 byte budget already carries eight fixes and
ledger recursion would change the B4 corpora semantics". R52-10 is "A2's distinct-sha arm is satisfiable
by trailing-newline bytes alone" (SCORECARD.md:2347-2351). The v2 probe keeps it verbatim — B2 computes
`fshas.push(sha(readFileSync(p)))` and requires pairwise distinct **file** hashes
(`attest52-probe.mjs:198-207`), and plan.md:116 lists "sha distinct" as a check term with no qualifier.
R52-10 is probe-side, not instrument bytes, and ledger recursion is irrelevant to it, so the frozen
rationale is inapplicable; the fix (drop the term, or compare something invocation-bound) costs no
instrument bytes. Not a falsification — the predicate prints `held=13/13` — but the round ships the
weak term it says it is deferring, which a reader of the plan would not expect. Either drop the term in
the freeze repair or annotate it as non-discriminating.

### F5 — MEDIUM: R43-1/R43-5 have no carrier anywhere in the frozen plan, and H1's 23/23 is coupled to the counter they mark gameable

The round-51 planned row (SCORECARD.md:2368-2374) ends "R43-1/R43-5 stay open". Round-52's plan has
zero occurrences of `R43`; there is no limits/carried section in plan.md at all (sections: Routed
inputs, Claims, contracts, Counters, Kill rules, Freeze receipts, Receipt protocol, Harm battery, Close
sequence, Frontier step, Wave). The only round-52 artifact carrying them is the ScribeScorecard
instruction (`w1-spec.json:160`), i.e. a wave-1 seat's prompt rather than a frozen input — and seats are
dead named, never replaced, so a dead scribe drops the carrier silently.

No claim is falsified: the `gate-mutants` capability row already says "the row records the miss and no
claim rests on it" (SCORECARD.md:1732), and round 52 makes no gate-mutants claim. But H1 requires
`CHECKLIST: 23/23 pass` and items `SKILL.md:704-705` run `gate-mutants.mjs` (`exit 0 + frozen=41/41`)
and its selftest — the very counter R43-1 (gameable before data) and R43-5 (witness single points)
record as weak, with round-44's shipped-tip receipt `GATE_MUTANTS: ERROR … frozen=38/41` exit 2
(`corpus/lessons/round-44.md:107`; figure `SCORECARD.md:1732`) and round-46's item failing 3 of 4 runs under load
(SCORECARD.md:2208). Round 51 read 23/23 at close, so the risk is intermittent, not certain. Report
consequence: the round-52 harm section must not present H1's gate-mutants item as capability evidence.
Plan consequence: add the two carried items to an addendum so the chain SCORECARD→plan→report is
unbroken; a `gate-mutants` receipt over the close rev (R43-3-class) remains the only real closure and is
not owed by this plan.

### F6 — LOW: R52-9's deferral text misstates the recorded mechanism; the plan's "all eleven honored" heading overstates

R52-9 is the ledger's *suffix* scope: `readdirSync(ledgerDir)` non-recursive (`:357`) and
`if (!name.endsWith('.txt')) continue;` (`:363`) at base; the round-51 report names it "ledger extension
scope" (`.ufo/reports/round-51/kumitate.md:206`) and SCORECARD.md:2347-2349 as `*.txt`-scoped. "ledger
recursion would change the B4 corpora semantics" describes a different (larger) change than the minimal
fix (accept attested receipts regardless of suffix, or recurse deliberately). Deferral is legitimate;
the frozen wording should name the actual mechanism. Impact on this round: none — B4's ledger conjunct
runs on `.ufo/waves/round-52/receipts/`, flat and all `.txt`, so the scope does not weaken it. Separately,
plan.md:23 "Routed inputs (all eleven honored)" is contradicted by its own body: R52-9/10 deferred,
R52-4 conditional ("if the seat finds harm risk … the arm stays routed", plan.md:30-32). "Accounted for"
would be accurate; "honored" reads as "fixed".

## Per-item verdict table (the assignment's four items)

| Item | Covered by r52 plan? | Deferral text accurate? | Falsifies a claim / harms an axis? |
|---|---|---|---|
| R43-1 / R43-5 | **No** — zero plan occurrences, no seat, no limits section | **No text exists** (silent carry; only a seat prompt carries it) | No falsification (capability row says no claim rests on it); risk is H1 coupling (F5) and a broken SCORECARD→plan record |
| A3e captured-invocation question | **No** — zero plan occurrences, no seat; only a seat prompt | **No text exists**; also no longer true that only "no independent arm" is missing — B3/B3c cannot test the window at all (F2/F3) | Not a predicate falsification (13 checks are the predicate); it does weaken the meaning of B3/B3c and any report sentence implying counter coverage of the refreshed-sidecar class |
| R52-9 ledger `*.txt` scope | Deferred, stated | **Partly** — it is a suffix/non-recursion scope, not "ledger recursion"; fix path cheaper than stated | No falsification; B4 unaffected (flat `.txt` receipts dir) |
| R52-10 distinct-sha weakness | Deferred, stated | **No** — the stated reason (instrument byte budget / ledger recursion) cannot apply; and the v2 probe re-ships the weak term unchanged | No falsification; a non-discriminating term remains in the frozen counter unlabelled |

Non-deferred routed items I re-checked for accuracy: R52-7 is honored (B2 reads `wall_start` from the
JSON body, `attest52-probe.mjs:192-210`); R52-5 is honored (`checks.length > 0` gate at `:472,474`);
R52-1/R52-3/R52-8, R52-2, A2e, R52-6, R52-11 map to the SHAPE/CLOCK/LEDGER/STDIN/SELFTEST/close clauses
as the plan states. R52-4 is conditional and correctly declared as such.

## Residual risk

- The freeze's Q43 claim ("frozen AND executed") holds for the *source* of both counters, but B4's
  prior-corpus branch has never executed (base: `tool or receipts dir absent`), so the round's own
  headline lesson is not yet applied to it (F1).
- F2/F3 mean the v2 counter proves sidecar integrity and instrument selftest health, not that the
  prelude-window mechanism is probe-owned. If the report attributes window coverage to B3/B3c, that is
  an overclaim.
- R43-1/R43-5 keep the `gate-mutants` checklist items in H1 without any lane-level claim; if H1 reads
  22/23 at close, the likely cause is one of those items or the inherited proxy arm, not this round.
- Author-scheduled receipts (r51 limit g) remain the deepest limit: none of these counters proves the
  three committed receipts are three real invocations; strengthening the sha term (R52-10) would not
  change that either.

## Verification gaps

- I did not run A52 or D52 (v2 bytes do not exist at the tip; at `ac56743` the tool is v1, so the A52
  reading would equal the base receipt). No counter score, no `HELD` claim, no admission is made here.
- My B4 walk replay ran over the working tree at `ac56743`, not the extracted base tree; the receipt
  corpora are unchanged between them (round-52 receipts absent; round-51/receipts = 9 files committed
  at base, verified via `git ls-tree`). The basename filter is tree-independent.
- F2's preemption claim for v2 is static (contract text plan.md:71-77 + the probe fixture paths),
  demonstrated end-to-end only against v1 and my window-deleted mutant. The v2 build does not exist to
  test; the wave's freeze repair should re-run it.
- No `lsp` device is exposed to this seat (inventory: read/bash/grep/glob/edit/eval/write/task/wait/
  web_search), so caller/definition/diagnostic checks were done by exact-path reads and line citations,
  and the behavioural claims by execution; no semantic-index result is claimed. Findings are cited by
  path and line, and the executed readings above are quoted verbatim.

Report: `.ufo/waves/round-52/w1/RevHistory.md`
