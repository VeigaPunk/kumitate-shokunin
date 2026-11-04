# K79CriticClaims — adversarial review

Axes: **operability + coverage:kimi-layer**. No admission/judgment issued; the objections below are for the canonical judge. No lane edits, git mutations, installations, or subagent dispatch. Scratch removed by driver finally. Receipts in this directory are retained bytes, not scratch citations.

## Commands and candidate identity

All attacks ran through `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-79/w1/K79CriticClaims/attack.mjs` (final run exit 0). The driver reconstructs v3 from `git -C <lane> show 5019803b4e451094cf58c555408ea37490cbc07a:scripts/report-receipt-diff.mjs` and applies the executor's retained patch in this seat's scratch. Candidate SHA256: `e6fa92398b32d548fdf625da00cde0efecfc854906de2b152b3c09d988168d21`; retained as `candidate-v4.mjs`. Commands, exit codes and stdout/stderr for every tool attack are in d/e receipts. No full frozen probe or selftest run by this seat.

Harness surprises: initial driver had a template-quote syntax error; corrected before receipts. Next attempt lost the peer scratch between discovery and copy (ENOENT); switched to retained patch. First reconstruction used a concurrently integrated worktree version and patch refused as already applied; final reconstruction explicitly uses frozen base bytes. No failed attempt is reported as a successful attack.

## (a) C1 trade / cosmetic repair

Receipt: `a-arithmetic.txt`, 3,136 combinations, members=55, sections=0..55, findings=0..55, registry fraction=1. Observed `higher=0 equal=657 lower=2479` versus r78. There is **no opposite-direction score increase** on this domain: multiplying by sections/members in [0,1] cannot increase a nonnegative old score.

Witness: sections=54/findings=0 changes r78 10 to composite 9; sections=55/findings=1 remains 9. Thus this is a real restoration of documentation sensitivity, not restoration of any score lost to census findings. C1's stated repair is not falsified by the no-increase fact. No unconditional double-counting: a mode-only finding leaves documentation unchanged, de-naming alone leaves census health unchanged. Correlated defects may affect both signals, an explicit weighting choice rather than proof of duplicated derivation. Canonical judge must assess the changed metric, not infer an integer-axis improvement from live 10→10.

**Severity: informational / metric tradeoff.** Smallest safe correction: describe restored sensitivity precisely; do not call this a score increase.

## (b) C1 arm gameability

Receipt: `b-findings-arm.txt`. A sections-only formula passes de-named-heading (9) and both-factors (9), but **findings-factor kills it** (actual 10 vs expected 9). Source-shape arm also rejects an absent findings ratio. Therefore that specific bypass fails the complete suite.

**Severity: medium, counter strength limitation.** All frozen defect runtime points quantize to 9, so minimum-of-factors also agrees there. sections=30/findings=27 yields product 2 versus minimum 5. Source regex merely finds both divisions in a helper; it does not prove multiplication or usage. This seat did not execute a complete minimum mutant. Smallest safe correction: an additional discriminating arithmetic witness in independent review; never silently change frozen counter bytes after data.

## (c) C2 duplicate authority and false premise

Receipt: `c-existing-resolution.txt`, quoting base v3 lines 195–222. Decisive code:

`const REL_RECEIPT = /(?<![\w./-])(?:base|close)\/[A-Za-z0-9._*/-]+/g;`

The `cited` helper maps those matches to `.ufo/waves/round-${round}/...`, and the receipt loop emits RECEIPT_MISSING. Amendment 1's statement that v3 handles only exact fully expanded paths and resolves none of the r78 short paths is **false**. Actual v3 r78 execution already reports six missing close/* receipts (e receipt).

cite-check's listDocs scans only SKILL.md/corpus markdown; claims-check scans registry member notes; round-gate checks report filing/commit identity, not arbitrary evidence paths. General pointers are a real uncovered capability, but report-receipt-diff is already its correct single owner; no second tool is needed.

**Severity: high, honesty/provenance.** Smallest correction: append an accurate preexisting-capability disclosure and claim only the uncovered general-pointer class.

## (d) C2 false CLEAN, duplication and mutable oracle

Receipts: `d-adversarial-fixtures.txt`, `d-live-report-stability.txt`.

* **High — directory masquerading as evidence.** Fixture creates directory `directory.md`, cites it as a markdown file: exit 0 `REPORT_RECEIPT: CLEAN`. No evidence file exists. `existsSync` checks existence, not file type. `linked.md` pointing outside lane and `../outside.md` also produce CLEAN; these show unbounded provenance, not dead-target existence. A genuinely dangling symlink correctly yields POINTER_DEAD. Smallest correction for evidence-file semantics: lstat a regular file, reject symlink components and enforce a documented containment boundary; keep namespace exceptions explicit. The frozen plan does not explicitly prohibit all general-pointer symlinks, so distinguish that boundary tradeoff from the demonstrated directory/file mismatch.
* **Medium — selector escape.** `missing.md:1` yields POINTER_DEAD, while nonexistent `missing.md:1+2` yields CLEAN. The latter is skipped by grammar. Smallest correction: either enumerate accepted selector grammar as a declared limit or consistently strip accepted selectors before pointer classification. Do not claim every selector spelling is covered.
* **High — actual no-duplicate violation / contract tension.** A single `close/missing.txt` yields both `RECEIPT_MISSING .ufo/waves/round-79/close/missing.txt` and `POINTER_DEAD close/missing.txt`. They are the same evidence pointer under v3 normalization. The executor confirms only RECEIPT_PATH, not REL_RECEIPT, is excluded from the new pass. This preserves frozen r78 >=10 POINTER_DEAD but conflicts with broad Amendment promise 'receipt-shaped tokens stay RECEIPT_MISSING (never double-reported)'. Smallest safe correction: canonicalize receipt identities before general-pointer classification; canonical owner must resolve/disclose the frozen counter conflict, not manufacture ten newly covered failures by duplicating six old ones.
* **Medium — r78 arm not immutable.** Original report SHA256 `f690710edfac4331d4afbd51a1ab207c8569f0400f97a0476563f8d36cc5ae02` yields ten POINTER_DEAD. Changing just close/proxy-json.txt to SCORECARD.md in a scratch copy yields nine and loses the required line; moving unchanged bytes beside a shadow SOURCES.md also yields nine. The frozen probe reads an absolute mutable fleet path, without checking its digest. Report relocation intentionally changes report-relative resolution; that is not inherently a tool bug, but it means count=10 is not solely a lane-revision fact. Smallest correction: retain/digest-pin exact fleet input and report the dependency; never edit filed bytes to restore a desired count.

## (e) Existing-report harm comparison

`e-historical-comparison.txt` retains actual v3 and candidate v4 commands, report hashes, complete stdout and set differences. Worktree mode, same lane/report/fleet arguments for both; no fabricated hand implementation.

| round | v3 | v4 | new findings | old findings removed |
|---|---|---|---:|---:|
| 76 | CLEAN exit 0 | DRIFT exit 1 | 6 POINTER_DEAD | 0 |
| 77 | CLEAN exit 0 | DRIFT exit 1 | 5 POINTER_DEAD | 0 |
| 78 | DRIFT exit 1, 6 RECEIPT_MISSING | DRIFT exit 1 | 10 POINTER_DEAD | 0 |

**High — false-positive historical verdict regression.** `e-context.txt` records round-76 lines 110–112 explicitly describing `omp-crash.log` / `omp-debug.log` as absent runtime examples, not repo evidence claims; both become POINTER_DEAD. Round-77 contextual assimilation basenames also become missing root-relative pointers. The extension-only grammar cannot distinguish mentioned names from evidence citations. Smallest safe correction: explicit citation namespace/grammar or authoring migration plus disclosed historical changes; do not claim v3 verdict preservation. Mere added detection is not automatically harm, but these runtime-example false positives are concrete.

## Objections to claims

I would **refuse C2 as an unqualified no-harm/every-pointer/no-duplicate claim** on the retained candidate: demonstrated directory false CLEAN, false-positive historical verdict flips, duplicate receipt identity, and false baseline description. These are fixable defects except the frozen ≥10/no-duplicate tension, which requires a canonical contract decision, not a seat's silent redefinition.

I do not have a decisive refusal counterexample to C1's stated composite sensitivity repair. I would refuse stronger claims that its frozen runtime points prove multiplication uniquely or that unchanged live integer 10 establishes an axis increase. These are not approvals of C1.

## Self-evaluation

Accuracy 4: executed raw tool evidence; no full min mutant. Completeness 4: all a–e covered; symlink/escape interpretation depends on declared general-pointer boundary. Clarity 4: concrete severity/correction per issue, lengthy contract tension retained. Actionability 4: executable reproducer and exact baseline/candidate identity; canonical conflict needs owner action. Conciseness 4: receipts carry detail, summary still necessarily broad. Overall 4.0. Highest-impact improvement is resolving receipt identity/count contract before interpreting C2 results.
