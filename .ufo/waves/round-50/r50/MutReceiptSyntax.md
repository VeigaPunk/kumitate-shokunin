# MutReceiptSyntax — receipt-syntax parameter sweep against the frozen R50 counter

Seat: KumitateR50.MutReceiptSyntax (mutation-tester). Round 50, item MutReceiptSyntax.
Frozen predicate under attack: `.ufo/waves/round-50/probe/repairs50-probe.mjs`
sha256 `f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d` (6855 bytes; identical to
`git show HEAD:` — verified). Plan: `.ufo/waves/round-50/plan.md`.

Axis read: coverage of the R2/R3/R4 text predicates (does the counter distinguish a conforming receipt
from near-miss syntax?), operability of the freeze (is the counter re-runnable/isolated?).

## Method

Scratch only, per the seat contract; the lane checkout was never written.

```
TMP=$(mktemp -d /tmp/r50-mutreceipt-XXXXXX)                       # /tmp/r50-mutreceipt-us_c3ysj
git clone --no-hardlinks --quiet <lane> $TMP/lane                 # read-only clone, base = 6927903f99bb
git -C $TMP/lane checkout -q -B base HEAD
# per case: git checkout -q -B <case> base; write fixture(s); git add -A;
#           git -c user.name=mut -c user.email=mut@example.invalid commit -q -m <case>
node $TMP/lane/.ufo/waves/round-50/probe/repairs50-probe.mjs $TMP/lane <case> --fleet /home/vgpnk/Projects/shokunin
```

Every mutant is one commit on its own branch off `base` (6927903), so the probe reads only that case's
receipt bytes via `git show <case>:<path>` / `ls-tree`. `--fleet` points at the real fleet repo (R7/R8
are live by design). Verdict language: **killed** = probe refuses the receipt (`MISS`, mutation
detected); **survived** = probe accepts a defective receipt (`PASS`, coverage gap).

Base (do-nothing) control at 6927903 with no receipts: `held=2/8`, R1 MISS / R2 MISS / R3 MISS /
R4 MISS (files=1) / R5 PASS / R6 MISS / R7 PASS / R8 MISS. R2/R3/R4 are not vacuously true at base.

## A. Reopen receipts — R2/R3 (S095 required, S098 symmetry)

`reopen()` (probe lines 92-99): first non-blank line is `.trim()`-ed, must match
`^REOPEN50: (HOLD|DRIFT) ` (case-sensitive, trailing space required), and the whole file must contain
`sha256=<expected 64-hex>` as a substring.

| # | candidate (S095) first line, after any lead bytes | expected | R2 output (verbatim) | verdict |
|---|---|---|---|---|
| 1 | `REOPEN50: HOLD source=https://…/bwrap.xml fetched=2026-10-23` (no sha256 anywhere) | MISS | `R2 MISS first=REOPEN50: HOLD source=https://raw.githubusercontent.com/cont` | killed |
| 2 | `REOPEN50: DRIFT source=… sha256=0000…00 fetched=…` (wrong hash) | MISS | `R2 MISS first=REOPEN50: DRIFT source=https://raw.githubusercontent.com/con` | killed |
| 3 | `REOPEN50: hold source=… sha256=<correct>` (lowercase verdict) | MISS | `R2 MISS first=REOPEN50: hold source=https://raw.githubusercontent.com/cont` | killed |
| 4 | `REOPEN50: HOLD source=… sha256=2cb77df2f4be fetched=…` (truncated to 12 hex) | MISS | `R2 MISS first=REOPEN50: HOLD source=https://raw.githubusercontent.com/cont` | killed |
| 5 | `    REOPEN50: HOLD source=… sha256=<correct> fetched=…` (4 leading spaces) | PASS per `.trim()` | `R2 PASS REOPEN50: HOLD source=https://raw.githubusercontent.com/containers/bubbl` | **survived** |
| C0 | control: both files correct (`HOLD` + correct hash) | PASS | `R2 PASS …` / `R3 PASS …` | control ok |
| E1 | first line no sha256; body line `body quotes hash: sha256=<correct>` | — | `R2 PASS …` | **survived** |
| E2 | `REOPEN50: DRIFT … sha256=<correct>` (verdict contradicts recorded hash) | — | `R2 PASS REOPEN50: DRIFT …` | **survived** |
| E3 | two blank lines, then the correct line | — | `R2 PASS …` | **survived** |
| E4 | S098: `REOPEN50: HOLD source=…/strace.1.in fetched=…` (no sha256) | MISS | `R3 MISS first=REOPEN50: HOLD source=https://raw.githubusercontent.com/stra` | killed |

All ten required/control runs above used the same probe invocation; fixture sha256s in Appendix A.
The S098 path is the same `reopen()` function (probe line 100), so the shape results transfer; E4
confirms the kill there too.

## B. ReRunB49 receipts — R4

R4 (probe lines 101-113): `ls-tree` collects `.ufo/waves/round-50/ReRunB49-<name>.txt` (≥3 needed),
each file must match `^run-at=(\S+)` **at byte 0** (no `m` flag, so a leading newline kills it),
`Date.parse` the stamp, contain `BINDORACLE49: ORACLE_HELD held=6/6` anywhere, all file sha256s
distinct, and first→last run-at span ≥ 300 s. Each case below deletes the committed
`ReRunB49-1.txt` in the scratch commit and lands exactly three fixture receipts (`m1..m3`) built by
replaying the real receipt body (run-at line + K1/K2 lines + held line + `exit=0`).

| # | candidate defect (3 files each) | expected | R4 output (verbatim) | verdict |
|---|---|---|---|---|
| 1 | one file has no `run-at=` line (starts `command: …`) | MISS | `R4 MISS files=3 distinct=3 held=3 span_s=NaN` | killed |
| 2 | one file `run-at=2026-13-45T00:00:00Z` (Date.parse → NaN) | MISS | `R4 MISS files=3 distinct=3 held=3 span_s=NaN` | killed |
| 3 | one file verdict `BINDORACLE49: ORACLE_HELD held=5/6` | MISS | `R4 MISS files=3 distinct=3 held=2 span_s=301` | killed |
| 4 | files m2 == m3 byte-identical | MISS | `R4 MISS files=3 distinct=2 held=3 span_s=150` | killed |
| 5 | three distinct stamps 100 s apart (span 200 s < 300 s) | MISS | `R4 MISS files=3 distinct=3 held=3 span_s=200` | killed |
| C0 | control: t0, t0+150 s, t0+301 s, all `held=6/6` | PASS | `R4 PASS files=3 distinct=3 held=3 span_s=301` | control ok |
| E5 | one file starts with `\n` before `run-at=` | — | `R4 MISS files=3 distinct=3 held=3 span_s=NaN` | killed |
| E6 | file m1's real line `ORACLE_UNMET held=3/6` plus comment `# expected: BINDORACLE49: ORACLE_HELD held=6/6` | — | `R4 PASS files=3 distinct=3 held=3 span_s=301` | **survived** |
| E7 | `run-at=2026-10-23T20:43:09Z (spaced)` (trailing junk after stamp) | — | `R4 PASS files=3 distinct=3 held=3 span_s=301` | **survived** |

Full-counter runs in this sweep printed `REPAIRS50: LEDGER_UNMET held=3..5/8` (R1/R6 intentionally
still MISS in the scratch rev; R5 PASS, R7 PASS, R8 see F6). Full per-fixture sha256s in Appendix A.

## C. Surviving mutants — what the counter cannot see

Ranked by whether the plan already records the limit:

1. **E6 — verdict-text forgery (real hole, not covered by plan limit (c)).** R4 greps the literal
   `BINDORACLE49: ORACLE_HELD held=6/6` over the whole file, not a verdict line. A receipt whose
   actual measured verdict is `ORACLE_UNMET held=3/6` passes by quoting the expected string in any
   comment. Plan limit (c) says a *forged clock line* is out of scope; it does not say a forged
   *verdict line* is. Recommendation for the L1: record this widened limit in the round report
   ("R4 authenticates the presence of a verdict string, not that the run produced it"), or, in a
   future round, anchor the held regex to `^BINDORACLE49: ` at line start (still forgeable, but no
   longer satisfiable by an incidental quote). Not fixable now without amending the frozen counter.
2. **E2 — `DRIFT` with the expected hash passes.** Accepted by the frozen wording
   (`(HOLD|DRIFT)`); verdict honesty is delegated to RevReopen's independent re-fetch. Record, do
   not change.
3. **#5/E3 — leading whitespace/blank lines accepted** because the probe trims the first non-blank
   line. This matches the plan's "first nonblank line" language; harmless. Record as tolerance.
4. **E1 — sha256 need not sit on the first line.** `t.includes('sha256=<hash>')` scans the whole
   file, so a body quote satisfies it. Plan wording is "first lines and the recorded body sha256s",
   so this is arguably intended; a forger can copy the hash without fetching. Acceptable only
   because RevReopen re-fetches; record it.
5. **E7 — trailing junk after the run-at stamp is ignored** (`\S+` stops at whitespace). Cosmetic.
6. **E5 — leading newline before `run-at=` is correctly killed** (`^` has no `m` flag): the one
   anchor in R4 that is stricter than it looks.

## D. Freeze-property observations (not mutants)

- **F6 non-hermetic R8.** Between my base run and the rc0 run, R8 flipped `MISS exit=0` → `PASS
  erratum` because the fleet repo gained commit `f50d178 round-50: kumitate report erratum` during
  the sweep. R8 (and R7) read live state, so a full `held=8/8` run cannot be reproduced from the lane
  `<rev>` bytes alone; the plan records R8's liveness as limit (d), and this receipt is the empirical
  proof. My R2/R3/R4 verdicts are unaffected — they read only lane rev bytes.
- **F7 pre-satisfied check.** R5 already PASSes at the wave base 6927903: `SKILL.md:589` says
  `Twelve`, and the two `all eleven` lines were swept in `378b6e7` (the same commit that froze this
  round). At the plan's named control rev `ff40d7d` both lines still exist (`SKILL.md:595`, `:598`).
  So R5 contributes nothing to a base→close delta; it is a true-at-base check (fine for a
  conformance audit, must not be reported as new work at close).

## Restoration evidence

- Lane checkout never written: `git -C <lane> rev-parse HEAD` = `6927903f99bbc26e397aa47387aa76950f42b3a5`
  before and after; working tree contains only pre-existing seat files (untracked), none created by
  this seat.
- Probe bytes tested are the committed frozen bytes: file sha256 = `git show HEAD:` sha256 =
  `f69dbc3e…d240d`.
- All 19 mutant commits lived only in the scratch clone; `rm -rf /tmp/r50-mutreceipt-us_c3ysj`
  removed it (verified: `no scratch dirs remain`). No lane/fleet/jj mutation, no `git add`/`commit`
  outside the clone.
- Tooling: none installed or upgraded; node/git already present on the host.

## Appendix A — per-fixture sha256 (full 64-hex for the Reopen required mutants; the `rr` entries are
12-hex prefixes, full values reconstructible from the case bodies above; S098 fixture is constant
`cc46c4634df01fdff85d6d499cbc1de6c759d02174dbb4c767b3c2faffcadad3` in rc1-rc8)

```
rc1 ReopenS095 0f119a93de5db67dffcb0f698ea27147d9ed1f6bbc84480eea5af0ccdbc4e660
rc2 ReopenS095 16a8cb3530cbfb947557ac2df0b5e509d9fb6509f52be99e5e59686764fda258
rc3 ReopenS095 8bd52c464a21ca6eebb12037b491bbf85e0d34b7104e650dca43dc346017345c
rc4 ReopenS095 f85574353642fd633ac172781ba3ba0a65877e5cc2f7acb669e23463ddf47c6f
rc5 ReopenS095 9f6e3e58a9bdeb770b3a7765bb1327119da68989f3805acc4a88339b7b8c2ccc
rc6 ReopenS095 3b835e7cdc96dc09dd9e7162f763544a3c953fbd71e3b4a04e08039422eb99e6
rc7 ReopenS095 05dedcdb6a9dfb89589591063c69cf4d5b377f7968bd84d04fd4d719ca733f27
rc8 ReopenS095 76b925744d13d7bf780ff6bd9ea908dd73512669ca8d7f8c0628ee7bb2907749
rr1 m1..m3 924204189f56… / af3fe1b724a0… / 154e1e4b5c33…
rr2 m1..m3 924204189f56… / 3f772eaa704c… / 55f105f06274…
rr3 m1..m3 b0f75a0a3174… / 3f772eaa704c… / 154e1e4b5c33…
rr4 m1..m3 924204189f56… / 3f772eaa704c… / 3f772eaa704c…   (m2 == m3 by construction)
rr5 m1..m3 924204189f56… / 0beed689d911… / b881952c7cf6…
rr6 m1..m3 021d9a0aee1f… / 3f772eaa704c… / 154e1e4b5c33…
rr7 m1..m3 1e398613aa60… / 3f772eaa704c… / 154e1e4b5c33…
rr8 m1..m3 0a5e0b80fd63… / 3f772eaa704c… / 154e1e4b5c33…
```

## Bottom line

- Required five ReopenS095 candidates: 4/5 killed; **extra leading spaces survives** (trim tolerance,
  matches "first nonblank line" wording). Both control and S098 symmetry behave as specified.
- Required five ReRunB49 candidates: **5/5 killed**; controls PASS, so the kills are real, not
  baseline noise.
- The one substantive coverage finding the round should record is **E6** (verdict-string forgery);
  E1/E2/E3/E7 are tolerances the plan's wording already admits, and F6/F7 are freeze properties the
  close report should state rather than claim as work.
