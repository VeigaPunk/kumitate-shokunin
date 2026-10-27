VERDICT: The round-67 draft had one intent (bind every routed item of spot-checks 55..66 to a quote located in the item plus an answer at an exact line, under a self-confined, non-vacuous counter) and died of the *run*, not of the bug — an unexercised freeze committed by the run-9 wrap-up hid three independent fatals; r68 keeps every binding predicate verbatim and is the first draft that can emit a verdict, but it inherits L7's unbounded self-recursion and the undocumented-missing `--classes` call.

## Evidence

Intent sources read in full: r67 `plan.md` + `probe/ledger67-probe.mjs` (439 ln), r68 `plan.md` + `probe/ledger68-probe.mjs` (466 ln), `base/*.txt`, `controls/*.txt`, `corpus/lessons/round-67-verifier-spotcheck.md`.

**F1 — the crash, reproduced** (scratch copy, byte-identical byte-for-byte; `r67-run.err`):
`node ledger67-copy.mjs <lane> f29eb699…` → `exit=1`, stdout **empty**, stderr
`Error: EEXIST: file already exists, mkdir '…/ledger67.gfEY1m/archive'` / `at mkdirSync (node:fs:1410:26)` /
`at extract (ledger67-copy.mjs:79:3)` / `at ledger67-copy.mjs:92:13`.
Cause: `:71 const A = join(T,'archive'); mkdirSync(A);` + `:79 mkdirSync(dst)` inside `extract()`; first call at `:92`,
before any `check()`. The tail `rmSync(T)` never runs → the temp dir **leaks** (`tmp/ledger67.gfEY1m` observed).
No `LEDGER67_UNMET` line exists, so a harness reading the last stdout line reads nothing.

**F2 — the r67 rule was unsatisfiable on the real lane.** Only the EEXIST line patched → `LEDGER67_UNMET held=0/7 checks=7 rev=f29eb699… rule=L67 | EXTRACTION_UNSAFE`, `exit=2`, permanently: r67 `extract()` (`:85`) fails closed on *any* symlink and the lane has **16** committed symlinks at that base (`ls-tree -r … | awk '$1=="120000"'` → 16; first `.ufo/waves/round-57/build/SentinelArtifacts/fx/E8/knowledge-link`).

**F3 — the frozen denominator was wrong.** Draft's own `items67()` over the same base: `f29eb699 spots=12 sections=12 items=61 | 55:i3 56:i4 57:i4 58:i8 59:i0 60:i9 61:i6 62:i5 63:i6 64:i5 65:i7 66:i4`. 55..65 = 57; round 66 = **4** (D1, D2, D3 **and** `- **Note for the operator (not a defect, promotion-owned):**`). r67 plan says "60 items … 57 plus round 66's D1–D3"; with 60 rows L2 (`rows >= 61`) and L3 (`unledgered:…`) both MISS. Identical at `d23892ad`.

**Why it died unexercised** — the lifecycle, not the bug: `round-67-verifier-spotcheck.md` "honest stop — operator ended the hyaku run mid-round; no wave dispatched, no `.ready` marker, no claim frozen, no lane commit"; `.ufo/waves/round-67/base/` and `controls/` are **empty dirs** (0 bytes, 04:17/04:18) although the plan names `ledger67-base.txt`, `ledger67-donothing.txt`, `ledger67-autoledger.txt`, `c1-controls.sh`. Nothing had ever executed the file before the wrap-up committed it.

**r68 counter re-run at base, same seed as the receipt** — reproduces `base/ledger68-base.txt` verbatim:
`LEDGER68_UNMET held=1/7 checks=7 rev=d23892ad… rule=L68 seed=2583a841b9d97d5e | L1 MISS exit=0 line=ROUTED_LEDGER_SELFTEST: PASS (33/33) | L2 MISS exit=2 … reason=ledger-absent:corpus/routed-ledger.md own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems… | L4 MISS 7/20 mutants wrong… | L5 MISS … | L6 MISS …`; wall **200.14 s**, L7 the only held check.

**L7 isolation, same rev+seed**: L7 block replaced by `check('L7',true,…)` → `real 0m2.548s` (78×; L7 = 99% of the run).

**Delta size**: `diff -u ledger67 ledger68 | grep -c '^[+-][^+-]'` → **75** changed lines of 439/466.

## Findings

**K68RevengerIntent-1 — high — r67 draft could not emit a verdict (F1).** Attacks r67 C1 at its first line of execution; mines `unexercised-counter` with a stronger fact than a crash alone: the failure path also violates the file's stated contract ("exit 2 when the revision cannot be read or archived, or the environment/extraction is unsafe") and leaks TMPDIR. Repro: `sed …`/`r67-run.err` in §Evidence; `TMPDIR=$S/tmp node ledger67-copy.mjs <lane> f29eb699…` → exit 1, empty stdout.

**K68RevengerIntent-2 — high — r67's confinement rule was unsatisfiable (F2), so `held=0/7` was its ceiling.** The EEXIST crash masked a rule that fails closed on 16 committed lane symlinks; a crash-only fix yields `EXTRACTION_UNSAFE exit 2` on every revision. Attacks r67 L7 as declared; justifies r68's refinement (a rule that cannot be measured is not a rule). Repro: `TMPDIR=$S/tmp node ledger67-fixed.mjs <lane> f29eb699…` → exit 2 `EXTRACTION_UNSAFE`.

**K68RevengerIntent-3 — high — the frozen data count was off by one (F3).** The r67 sentence "60 items" contradicts the counter's own parser (61) at its own base, so r67 L2 and L3 would have MISSed even with F1+F2 fixed. r68's total (61) is correct but its gloss is not ("58 plus round 66's D1–D3"; 55..65 is 57). The design is right — L2 binds to the counter, not the sentence — but the semantics are worth a decision: the parser counts the round-66 bullet the spot-check itself marks *"not a defect"*, and L3 then demands a closed/wontfix answer quote that does not exist at the r66 base. Repro: `build/K68RevengerIntent/item-counts.txt` (`node count.mjs … f29eb699 d23892ad`).

**K68RevengerIntent-4 — high — r68 L7 is self-recursive with no nesting guard and pays 99% of the run (F4).** `:439` and `:454` re-invoke `SELF`; the child re-enters L7; `grep -n 'NESTED|depth|recurs'` matches only `recursive:true`. Measured 2.548 s vs 200.14 s, and while one sibling seat ran it: **370 live counter processes**, nested temp chains 11 path components deep (`…/K68MutToolDrop/ledger68.6C6Sqo/ledger68.tEoKli/…/ledger68.vYCbBf/fx-symtool`), 219 of them my own (killed). On a 2-file fixture whose L1–L6 cost 2.5 s, the counter printed **no verdict in 160 s** (`exit=143`). Worse than cost: the sub-case asserts only `exit 1 && /L1 MISS/`, which *any* inner failure satisfies — including an inner run whose own L7 collapsed — so the proof claims more than it measures. Repro: `awk` L7-stub in §Evidence; `pgrep -cf 'waves/round-68/probe/ledger68-probe.mjs'`.

**K68RevengerIntent-5 — medium — `--classes` is documented in L2 and never passed (F5), verbatim in both drafts.** r68 header L2 says the tool runs `--root … --from 55 --to 66 --classes`; `grep -c "'--classes'"` = **0**. The tool supports the flag (`scripts/routed-ledger.mjs:44,320,366`), so its CLASS/RECURRENT aggregation is unexercised by the frozen counter; classes are checked only from ledger rows by L3. Same mistake class as `unexercised-counter`, one level down. Repro: `grep -c "'--classes'" .ufo/waves/round-68/probe/ledger68-probe.mjs` → 0.

**K68RevengerIntent-6 — medium — the r68 plan misstates its own committed receipt.** Plan: "Before (base `d23892ad`): `LEDGER68_UNMET held=0/7` exit 1 (`base/ledger68-base.txt`)"; the receipt says `held=1/7` (L7 holds at base; L1–L6 MISS). Recurrence of r67's routed D2 ("receipts must name the revision they measured" — now: must also quote what they measured). Repro: `sed -n 1p .ufo/waves/round-68/base/ledger68-base.txt`.

**K68RevengerIntent-7 — medium — receipt paths named by the r68 plan do not exist; the receipts live elsewhere.** `base/ledger68-donothing.txt`, `base/ledger68-autoledger.txt`, `base/deprec68-donothing.txt` → ABSENT; the control receipts are `controls/c1-donothing.txt`, `c1-autoledger.txt`, `c2-donothing.txt` (all three `CONTROL`-style UNMET, `held=2/7` / `held=1/10`). So the controls did run and do fail the claim — the plan's "committed, scored before any seat" is true only after path substitution. `c1-controls.sh` writes to `$LANE/.ufo/waves/round-68/controls/`, never `base/`. Repro: `ls .ufo/waves/round-68/base .ufo/waves/round-68/controls`.

**K68RevengerIntent-8 — low, inference — a dangling symlink on a static read path escapes the declared fail-closed.** The gate tests `existsSync(ap) && !chainSafe(ap)`; a dangling link is not `existsSync`-visible, so `UNSAFE` latches only later in `rd()`, after the gate, giving `L6 MISS` + exit 1 instead of `EXTRACTION_UNSAFE` exit 2. No claim is gainable (UNMET either way), but the sentence overstates the code. Not exercised: the fixture run was consumed by F4 and killed at 160 s without a verdict. Repro sketch: commit a `SKILL.md` dangling symlink (`git hash-object` + `update-index --cacheinfo 120000,…`), run the counter with `--tool` absent.

## Intent verdict (detail in `build/K68RevengerIntent/autopsy.md`)

Serves the original intent: the 20 mutants, the ≥44 selftest, the 3..25-word quote floor/ceiling, word-boundary + within-section uniqueness, exact-line answers (no ±2 window), forbidden answer paths, one non-open row per (round,item), the r66 "answered this round" clause, ≥5 classes / ≥1 class ≥4 rounds, L5 stub anti-vacuity and L6 registry home are **byte-identical** across the delta; the single relaxation (symlinks tolerated off read paths) is the precondition for measuring a lane that carries 16 of them, and it is compensated by per-read `chainSafe` plus a static-path gate. What r68 adds is exactly the crash fix and that refinement. What it does not fix: F4 (L7 recursion), F5 (`--classes`), F3's non-defect item, dead `const BASE` (`:46`, unread in both). Proposed for the L1 (never in-place edits): (a) guard the nested run (`LEDGER68_NESTED=1` in `CHILD_ENV`, skip L7 in the child) and re-run the base receipt — a strengthening; (b) pass `--classes` in L2 or delete it from the sentence; (c) restate the count as "61 = the counter's own count (55..65 = 57, round 66 = 4 incl. the non-defect note)" and correct `held=0/7` → `held=1/7`.

## Artifacts

- `.ufo/waves/round-68/build/K68RevengerIntent/autopsy.md` — intent statement, crash anatomy, 12-row delta table, verdict.
- `…/build/K68RevengerIntent/{probe.diff,item-counts.txt,count.mjs,ledger67-fixed.mjs,r67-run.err,r67-fixed.out,r68-base.out,noL7.out,noL7.time}` — receipts cited above.
- This report: `.ufo/waves/round-68/w1/K68RevengerIntent.md`.

## Limits

- Did not attack the v2 tool (`scripts/routed-ledger.mjs` v2) — it is the claim's subject and does not exist yet; L4's 20 mutants were read, not run against a candidate v2.
- Did not run the r68 counter to `7/7` on any revision (none exists yet); only the base reproduction and the L7-isolated timing.
- F6 (dangling symlink) is inference from code order, tagged as such; the fixture run was killed by F4's recursion.
- The 370-process observation counted both seats' processes; I killed only my 219. No tool installs or upgrades were needed (nothing recorded).
