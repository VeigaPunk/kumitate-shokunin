# K91Sentinel — round 91 security re-run

Seat `K91Sentinel`, round 91 (hyaku run 15, attempt 1). Security re-run of the round-90 sentinel
attacks (A1–A11, RD-1..RD-6) against the round-91 POSITIVE control
`.ufo/waves/round-91/controls/ref-fd-fstat.mjs` (sha256 `bc3df527…94db`), plus new attacks on the
external branch.

Full evidence: `.ufo/waves/round-91/K91Sentinel/attacks.md` (the detailed report, tables, and
remediation). Receipts: `.ufo/waves/round-91/K91Sentinel/receipts/` (139 files). Driver scripts and
logs: same seat dir. Lane read-only; all fixtures under the seat scratch.

## Alignment

The frozen probe (never edited) against the positive control and the current candidate:

```
node .ufo/waves/round-91/probe/probe91-c1.mjs --lane <lane> --work <scratch> \
  --alt /fast/scratch/hyaku --rev 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4 --tool <tool>
  -> C91_C1: HELD held=56/56   (ref and cand, exit 0)
```

## Round-90 attacks re-run (A4, A5, A6, A7, A8) — `ref` and the current candidate pass every declared class

| id | v4 (base) | ref (positive control) | cand (worktree `f39aab5c`) | expected |
|---|---|---|---|---|
| A4 `/dev/zero` | no verdict, exit 133 (OOM) | UNRESOLVED exit 2, 0.02 s | UNRESOLVED exit 2, 0.02 s | UNRESOLVED |
| A5 external FIFO | no verdict, exit 124 (20 s) | UNRESOLVED exit 2, 0.03 s | UNRESOLVED exit 2, 0.02 s | UNRESOLVED |
| A6 512 MiB external | **CLEAN external=1** | UNRESOLVED exit 2 | UNRESOLVED exit 2 | UNRESOLVED |
| A7 symlink race, 120 runs | **CLEAN(LAUNDERED) 20** | CLEAN **0** | CLEAN **0** | zero CLEAN |
| A8 receipt FIFO race, 150 runs | HUNG 6 | HUNG 2 | HUNG **0** | out of class (RD-4) |

A7/A8 are probabilistic and were reproduced in two independent runs with a fixed harness. (My first
race run was invalid — my own racer died on a stale temp file; fixed in `races.py`, and the fixed
numbers match the independent first run. The invalid numbers are not reported as findings.)

## New external-branch attacks — all correct on `ref` and `cand`

`/proc/self/fd/1` and `/dev/stdin` → SYMLINK_INSTRUMENT; named unix socket → UNRESOLVED;
mode-0000 file → UNRESOLVED (EACCES); sparse 2^40 → UNRESOLVED; `/proc/self/root` alias and a
symlinked-parent path → bind the same bytes as the plain path; `/dev/null` → UNRESOLVED (v4:
**CLEAN**, binds as empty); external directory → UNRESOLVED; cap+1 → UNRESOLVED (v4: **CLEAN**);
at-cap exactly 16777216 → CLEAN; empty → CLEAN. A char device behind a symlinked parent and via
`/proc/self/root/dev/zero` are refused too — the refusal comes from `fstat` on the descriptor, not
from a `/dev/` string test.

## FINDING (MED, routed, not a kill): the size-from-fstat cap does not bound the read

`ref` bounds the external read by `fstat(fd).size`. A procfs pseudo-file is a regular file
(`S_ISREG`, so `isFile()` is true) whose `st_size` is **0**, so it passes both the type check and
the cap check and is then read to EOF — past the declared 16777216 bound.

**IN-CLASS wrong verdict, `/proc/kallsyms` (regular file, `st_size` 0, content 22489015 bytes > cap,
receipt carries the CORRECT digest), reproduced twice:**

| tool | verdict |
|---|---|
| `v4` | CLEAN matched=1 mismatched=0 unchecked=0 external=1 |
| `ref` (positive control, 56/56) | **CLEAN matched=1 mismatched=0 unchecked=0 external=1** — wrong; expected FAIL-CLOSED UNRESOLVED exit 2 |
| `cand1` (first candidate snapshot `33ee29eb`) | **CLEAN matched=1 mismatched=0 unchecked=0 external=1** — wrong |
| `cand` (current `f39aab5c`) | FAIL-CLOSED UNRESOLVED exit 2 |
| my prototype `29ad4875` | FAIL-CLOSED UNRESOLVED exit 2 |

**No verdict at all, `/proc/self/pagemap` (regular file, `st_size` 0, 274877906936 bytes = 256 GiB,
never reaches EOF), reproduced twice:** `v4`, `ref` and the first candidate snapshot `33ee29eb` all
abort with **no verdict line** (fatal V8 abort, shell exit 133/134) — the round-90 A4 failure mode
reproduced, the very harm this round's claim exists to fix. Current candidate and prototype:
FAIL-CLOSED UNRESOLVED exit 2 in 0.04 s.

Receipts: `receipts/R1.kallsyms.{v4,ref,cand1,cand,fix}.rep{1,2}.txt`,
`receipts/R2.pagemap.{v4,ref,cand1,cand,fix}.rep{1,2}.txt` (exact receipt bytes saved in each),
`receipts/R1.symproc.{ref,cand,fix}.txt` (reach through a symlinked parent).

**Impact.** An external absolute token naming a pseudo-file makes the tool emit an affirmatively
wrong CLEAN on an over-cap external regular file, or emit no verdict at all. `/proc/kallsyms` is
world-readable here (mode `-r--r--r--`).

**Smallest remediation.** Bound the READ by bytes actually read, not by `fstat`: read the
descriptor in 64 KiB chunks and refuse UNRESOLVED as soon as more than `MAX_INSTRUMENT_BYTES` bytes
have arrived. The `st_size` check stays as a cheap early-out. Prototype
`tools/v5-bounded-read-prototype-29ad4875.mjs` — verified: frozen probe still `HELD held=56/56`
(both contexts); at-cap → CLEAN, over-cap → UNRESOLVED, empty → CLEAN (twins preserved);
`/proc/kallsyms` → UNRESOLVED 0.08 s and `/proc/self/pagemap` → UNRESOLVED 0.03 s, twice each.

## Kill-rule assessment: NO KILL

The kill rule needs a tool at 56/56 with a committed reproduction of a wrong verdict on a declared
class. `ref` is 56/56 and is wrong on `/proc/kallsyms` — but `ref` is the plan's own committed
positive control, built by the plan's control generator as "the claimed edit", so a finding against
it is a defect in the claim's stated scope rather than a demonstration that the claim is unmet
(like round-90's A4/A5, which became the plan's motivating evidence). The frozen probe's cap arms
use `truncateSync` sparse files whose `st_size` is correct, so no arm distinguishes a
size-from-fstat cap from a read-bounded cap — the predicate cannot see this defect. The integrated
candidate `f39aab5c` is 56/56 on the frozen probe and is correct on every declared class I could
construct, including both pseudo-file reproductions. **Routed, not a kill.**

## For Main

1. The claim text should say the bound is on the bytes READ, not on `st_size`, and the committed
   positive control `controls/ref-fd-fstat.mjs` (`bc3df527`) has the same defect — the control
   generator's edit is the one the claim should be measured against.
2. plan.md's "not claimed" list does not mention pseudo-files. If pseudo-files are meant to be
   excluded, that should be written; if not, the claim needs the read-bound wording.
3. `ref`'s receipt open still lacks `O_NONBLOCK` (A8 hangs 2/150). The current candidate adds it
   and hangs 0/150. The claim's RD-4 note already covers this as unclaimed hardening.

## Limits

A7/A8 probabilistic (reproduced twice each, fixed harness). Pseudo-file content length is
host-dependent (`pagemap` scales with the page tables; `kallsyms` is 22489015 bytes here and stable
across reads). The prototype is a proposal, not a lane change — I did not modify
`scripts/receipt-bind.mjs`.
