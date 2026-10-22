RESULT ExecCiteZeroResolved rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=done mutant_before=survived selftest_after=64/64 mutant_after=killed sha256=9e19083226c9c59de49cf9a76e12e47dc6f276bc03f98fa891411f8373e0e7ba

# ExecCiteZeroResolved — R39-5 (the `totals.resolved > 0` guard in cite-check)

Scope: `scripts/cite-check.mjs` only. Clone `/fast/scratch/hyaku/kumitate-r40/seats/ExecCiteZeroResolved/lane`
(detached at f69817edf687c8ce4f87ed7953a353399232f69e). Source tree read-only at
`/fast/scratch/hyaku/kumitate-pin/src` (1103 indexed files). node v24.21.0, git 2.56.0 — nothing
installed or upgraded (no pacman transaction; the host-wide pacman pause was respected).

## The mutant and the red-before

`scripts/cite-check.mjs:1590` at the round-open rev, quoted exactly:

    const verdict = totals.filesScanned > 0 && totals.resolved > 0 && !drift ? 'PASS' : 'FAIL';

M1 drops only the `totals.resolved > 0` term:

    const verdict = totals.filesScanned > 0 && !drift ? 'PASS' : 'FAIL';

## Evidence (every line is a command and its observed output)

    $ git -C <clone> rev-parse HEAD
    f69817edf687c8ce4f87ed7953a353399232f69e

    $ sha256sum scripts/cite-check.mjs            # round-open bytes (git show f69817ed:scripts/cite-check.mjs)
    40573448330f52fb7d45c59cb0b91d236b6e277a250d850a0e2585adc7c10c9f

    $ node <pristine copy> --selftest             # baseline
    62/62 cases passed (hermetic)
    VERDICT: PASS

    $ node <pristine copy + M1> --selftest        # M1 against the untouched suite
    62/62 cases passed (hermetic)
    VERDICT: PASS                                 -> M1 SURVIVED

    $ node scripts/cite-check.mjs --self <fixture-zero> --src /fast/scratch/hyaku/kumitate-pin/src
      filesScanned=2 docs=2 tokens=0 refs=0 symbols=0 findings=0
      VERDICT: FAIL
      CITE_CHECK: DRIFT (environment: zero-resolutions)      exit=2

    $ node <M1 copy> --self <fixture-zero> --src /fast/scratch/hyaku/kumitate-pin/src
      filesScanned=2 docs=2 tokens=0 refs=0 symbols=0 findings=0
      VERDICT: PASS                                 -> the FAIL -> PASS flip
      CITE_CHECK: DRIFT (environment: zero-resolutions)      exit=2

    $ node <M1 copy> --self <fixture-zero> --src /fast/scratch/hyaku/kumitate-pin/src --json
    verdict=PASS citeCheck=CLEAN filesScanned=2 resolved=0 error=0 warn=0 findings=0

The fixture is two prose-only documents (`fixture-zero/SKILL.md`,
`fixture-zero/corpus/knowledge/zero-note.md`): no path token, no line reference, no backticked
span — so nothing resolves and nothing drifts.

## The patch

Two hermetic cases were added to the `--selftest` group of `scripts/cite-check.mjs` (40 added
lines, no production line touched):

1. `zero resolved citations with no drift → VERDICT FAIL (a broken scan is not a clean one)` —
   a second self root (`<tmp>/self-zero`) holding the same prose-only documents. It asserts
   `filesScanned > 0 && resolved === 0 && error === 0 && verdict === 'FAIL'`.
2. `clean fixture with one resolved citation and no drift → VERDICT PASS` (added on the L1's
   request after MutCiteGuard showed the suite never asserted a PASS verdict) — a third self root
   (`<tmp>/self-clean`) whose two documents cite `scripts/real.mjs:1` / `scripts/real.mjs:2`, the
   20-line file the suite already materializes in its own tmp source root. It asserts
   `filesScanned > 0 && resolved > 0 && error === 0 && warn === 0 && verdict === 'PASS'`.

Both roots live inside the suite's own `mkdtempSync` tmpdir, so the cases stay hermetic.

    $ node scripts/cite-check.mjs --selftest
    PASS  zero resolved citations with no drift → VERDICT FAIL (a broken scan is not a clean one) — filesScanned=2 resolved=0 errors=0 verdict=FAIL
    PASS  clean fixture with one resolved citation and no drift → VERDICT PASS — filesScanned=2 resolved=4 errors=0 warnings=0 verdict=PASS
    64/64 cases passed (hermetic)
    VERDICT: PASS

## Mutant sweep against the patched suite (63/64 + exit 1 = killed)

| id | mutant expression after `const verdict = ` | selftest | killed? |
|----|--------------------------------------------|----------|---------|
| M1 | `totals.filesScanned > 0 && !drift` | 63/64, exit 1 — zero-resolved case FAILs | **killed** |
| E1 | `totals.filesScanned > 0 && totals.resolved >= 0 && !drift` | 63/64, exit 1 — zero-resolved case FAILs | **killed** |
| E2 | `totals.filesScanned > 0 && totals.resolved > 0` (drift term dropped) | 63/64, exit 1 — `bogus-path → UNRESOLVED error` FAILs | **killed** |
| E3 | `totals.filesScanned <= 0 && totals.resolved > 0 && !drift` | 63/64, exit 1 — clean-fixture case FAILs (`verdict=FAIL`) | **killed** |
| E4 | `totals.filesScanned >= 0 && totals.resolved > 0 && !drift` | 64/64, exit 0 | **survived** |

E4 survives for a structural reason, not a coverage gap: `totals.resolved` only increments inside
the per-document loop, so `resolved > 0` implies `filesScanned > 0`. The two clauses therefore
agree everywhere, and `filesScanned >= 0` differs from `filesScanned > 0` only at
`filesScanned === 0`, where `resolved` is necessarily 0 and both forms read FAIL. E4 is an
equivalent mutant of this expression and cannot be killed by any hermetic case; the suite already
pins the empty-scan-set arm (`filesScanned === 0 && verdict === 'FAIL'`), which E4 also satisfies.
Removing the redundancy instead would change the verdict contract, which is out of this seat's
scope.

## Re-pin the proxy stanza

`scripts/cite-check.mjs` is sha256-pinned by the proxy stanza, so `SCORECARD.md` must carry the
new digest. The lane's declared pin is now stale:

    $ node scripts/proxy-check.mjs --self <clone> --src /fast/scratch/hyaku/kumitate-pin/src --json
    {"severity":"error","kind":"PIN_DRIFT","term":"pin.cite-check",
     "declared":"40573448330f52fb7d45c59cb0b91d236b6e277a250d850a0e2585adc7c10c9f",
     "computed":"9e19083226c9c59de49cf9a76e12e47dc6f276bc03f98fa891411f8373e0e7ba"}

New digest of the patched file (this is the value the L1 must write into `SCORECARD.md:301`,
`pin.cite-check=`):

    9e19083226c9c59de49cf9a76e12e47dc6f276bc03f98fa891411f8373e0e7ba

`SCORECARD.md` was NOT edited by this seat (only the report file may be written inside the lane).

## Deliverables

- Patch: `/fast/scratch/hyaku/kumitate-r40/seats/ExecCiteZeroResolved/ExecCiteZeroResolved.patch`
  (`git diff f69817edf687c8ce4f87ed7953a353399232f69e -- scripts/cite-check.mjs`; 1 file, +40
  lines). Verified apply-clean: `git apply --check` on a fresh clone at the round-open rev → OK,
  and the applied clone gives `64/64 cases passed (hermetic)`, `VERDICT: PASS`.
- Receipt with every command and its raw output:
  `/fast/scratch/hyaku/kumitate-r40/seats/ExecCiteZeroResolved/red-before.txt` (418 lines).
- Drivers, kept outside the lane: `make-receipt.sh` (the receipt generator), `mutate.mjs` (the
  one-line mutant writer), `fixture-zero/` (the prose-only documents), `mutants/` (the five
  mutant copies), `verify/` (the fresh clone used for the apply check).

## Risks and blockers

- Blocker for the integrator, not for this seat: `SCORECARD.md` `pin.cite-check=` must be
  re-pinned to `9e19083226c9c59de49cf9a76e12e47dc6f276bc03f98fa891411f8373e0e7ba`, otherwise the
  proxy stanza reports `PIN_DRIFT` (shown above).
- E4 survives and is proven equivalent; no hermetic case can kill it.
- The `--integrations` group was not run: MutCiteGuard measured that it fails at baseline in this
  environment (live-tree error findings), so a baseline failure would be inconclusive. The two new
  cases are hermetic-only and touch no live tree.
- No other lane file was read-modified; no git index, jj state, sibling lane or host state was
  touched, and nothing was committed or pushed.
