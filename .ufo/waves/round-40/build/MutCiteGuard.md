RESULT MutCiteGuard rev=f69817edf687c8ce4f87ed7953a353399232f69e verdict=survived selftest=62/62 flip=yes extra_survivors=2/3

# MutCiteGuard — independent red-before for R39-5 (cite-check verdict expression)

Target: `scripts/cite-check.mjs:1590` in lane rev f69817edf687c8ce4f87ed7953a353399232f69e.
Quoted original line (verified by grep, exactly one occurrence):
`  const verdict = totals.filesScanned > 0 && totals.resolved > 0 && !drift ? 'PASS' : 'FAIL';`

Environment: node v24.21.0. Scratch clone `/fast/scratch/hyaku/kumitate-r40/seats/MutCiteGuard/lane`
(detached at f69817edf687c8ce4f87ed7953a353399232f69e). Source tree pinned read-only:
`/fast/scratch/hyaku/kumitate-pin/src` (1103 indexed files). No tool installed or upgraded
(node and git were already present; nothing was fetched).

## Baseline (pristine bytes, sha256 40573448330f52fb7d45c59cb0b91d236b6e277a250d850a0e2585adc7c10c9f)

    node scripts/cite-check.mjs --selftest        -> rc=0, "62/62 cases passed (hermetic)", "VERDICT: PASS", 62 PASS lines, 0 FAIL lines

Zero-citation scanned document (probe fixture `seats/MutCiteGuard/fixture/self/SKILL.md`: prose
only, no backticked spans, no path tokens, no line refs):

    node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src \
      --self /fast/scratch/hyaku/kumitate-r40/seats/MutCiteGuard/fixture/self
      -> "filesScanned=1 tokens=0 refs=0 findings=0", "VERDICT: FAIL",
         "CITE_CHECK: DRIFT (environment: zero-resolutions)",
         stderr "cite-check: fail-closed — zero resolved citations", exit 2

## Mutant M1 (primary): drop the `totals.resolved > 0` guard

Applied line (mutant sha256 72fc9b777a4f20ab81e78888d18c140d37b4ddac5acb625dbfda9830cf942a4b):

    `  const verdict = totals.filesScanned > 0 && !drift ? 'PASS' : 'FAIL';`

Detector (same one used for the baseline): `node scripts/cite-check.mjs --selftest`
  -> rc=0, "62/62 cases passed (hermetic)", "VERDICT: PASS". No case failed => **survived**.

Probe on the zero-citation document with M1 active:

    -> "filesScanned=1 tokens=0 refs=0 findings=0", "VERDICT: PASS"   <-- flipped FAIL -> PASS
       "CITE_CHECK: DRIFT (environment: zero-resolutions)"  (text still contradicts itself)
       stderr "cite-check: fail-closed — zero resolved citations", exit 2
    --json -> verdict=PASS  citeCheck=CLEAN  filesScanned=1  resolved=0  error=0  warn=0

So the guard's whole purpose (fail closed on a scan that resolved nothing) is unenforceable in the
JSON contract: a consumer of the JSON reads a clean bill of health with resolved=0.

## Three extra one-line mutants of the same verdict expression

| id | mutant line (after `const verdict = `) | selftest | probe verdict | verdict |
|----|---------------------------------------|----------|---------------|---------|
| E1 | `totals.filesScanned > 0 && totals.resolved >= 0 && !drift` | 62/62 PASS, rc=0 | PASS (flipped) | survived |
| E2 | `totals.filesScanned > 0 && totals.resolved > 0` (drift term dropped) | **61/62**, rc=1, "FAIL bogus-path → UNRESOLVED error — UNRESOLVED/error @SKILL.md:3" | FAIL | killed |
| E3 | `totals.filesScanned <= 0 && totals.resolved > 0 && !drift` (files-scanned check inverted) | 62/62 PASS, rc=0 | FAIL (no flip; verdict now always FAIL on a real scan) | survived |
| E4 (bonus) | `totals.filesScanned >= 0 && totals.resolved > 0 && !drift` | 62/62 PASS, rc=0 | FAIL | survived |

E1/E3/E4 mutant sha256: 28c0746f56d9ed147988222d48f9d37b5ea00b2de5c3c90381bb13a6c2e59b61,
e1279f09655e54e98ee46cbfd1c9035da05e329a7d1ee12b674b102568658b3d,
38bc1d5d67ab1263ffa9928bb39a3cf174ff9e594243d594b9d0d7240775e36c.
None of the four was invalid (all parsed and ran; no crash was counted as a kill).

Extra survivors among the three requested extras (E1, E2, E3): **2 of 3** (E1, E3 survived; E2 killed).

## Coverage finding (why the mutants survive)

`grep 'verdict === 'PASS''` over the file returns only production code (lines 1595 and 2535); the
hermetic suite never asserts a PASS verdict. The only verdict assertions it owns are
line 1873 (`rep.verdict === 'FAIL'` for the bogus-path case) and line 1968
(`r.totals.filesScanned === 0 && r.verdict === 'FAIL'` for the empty scan set). There is no case
with "files scanned > 0 and resolved == 0 and no error", and no case where the verdict must be PASS.
Both directions of the verdict expression are therefore unpinned.

Detector note: `node scripts/cite-check.mjs --integrations --src /fast/scratch/hyaku/kumitate-pin/src
--self <clone>` fails at baseline in this environment (live tree carries real error findings, e.g.
`corpus/lessons/round-6.md:10 ERROR LINE_OOR`, `VERDICT: FAIL`, exit 1). A baseline failure is
inconclusive, so integrations was not used to classify any mutant.

## Restoration evidence

After every mutant the file was restored with `git -C <clone> checkout -- scripts/cite-check.mjs`:

    sha256 after each of the 5 mutants and at the end:
      40573448330f52fb7d45c59cb0b91d236b6e277a250d850a0e2585adc7c10c9f  scripts/cite-check.mjs
    git status --porcelain -> (empty);  git diff --stat -> (empty)
    final re-run: node scripts/cite-check.mjs --selftest -> rc=0, 62/62 cases passed, VERDICT: PASS

No lane source file is modified and no patch is delivered: the probe is a measurement, not a
proposal. The sweep driver and the probe fixture live only under
`/fast/scratch/hyaku/kumitate-r40/seats/MutCiteGuard/` (outside the lane).

## Verdict

R39-5 reproduces exactly as declared: dropping only the `totals.resolved > 0` guard survives all 62
hermetic selftests and flips VERDICT FAIL -> PASS on a scanned document with zero resolved citations
and no drift (JSON then reports verdict=PASS, citeCheck=CLEAN, resolved=0). Two of the three extra
one-line mutants of the same expression also survive. A surviving mutant is a coverage finding, not
a licence to change the contract: the fix belongs in the selftest (pin a scanned-but-zero-resolved
document to FAIL, and pin one resolvable document to PASS), not in the verdict expression.
