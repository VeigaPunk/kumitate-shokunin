# Round 86 — byte binding on both inputs

Lane kumitate, 2026-11-04. Base `232350995d3001e606609aaf22ba1b58168d3655`; freeze `e7228850690c6bd48400140964cbaf18667fbc06`. One operability capability claim: the frozen `.ufo/waves/round-86/probe/probe86-c1.mjs` must print `C86_C1: HELD held=24/24` exit 0. Paths beginning `open/`, `controls/`, `build/` or `close/` resolve beneath `.ufo/waves/round-86/`.

## Method

The source half of v2's answer carried counts but no digest. The new contract exposes the digest of the same source bytes inspected for literal arm sites. A frozen randomized-fixture probe computes expected lines independently of the candidate. The pre-data controls score base 14/24 and constant/no-reader/nonce-replay 0/24 each, all exit 1 (`controls/{base,stub,noreader,replay}.txt`). The L1 coherence check used a disclosed scratch reference, not the candidate measurement.

The round-85 non-author spot-check was adopted through the existing two-file adoption tool before freezing the plan: the command wrote both row and pin and printed `README_MAP: CLEAN files=217 rows=217 covered=217`. No historical receipt was changed.

## Gate

Sources below were opened by the L1 on 2026-11-04; each quotation is at most 25 words.

- **Admit — S247, mined, B, criterion Q21/Q78.** *A Brief Survey on Oracle-based Test Adequacy Metrics*, https://arxiv.org/abs/2212.06118, abstract. Located quote: “it does not provide any insights into the quality or quantity of test oracles”. Corrects S245's title and survey tier (R85-V8/V9). Capture `.ufo/waves/round-86/open/survey.html`, sha256 `838d07156c06a6fb38927fd79b4d87548dba92b5e0d5f601af83c031ffa5bbd2`.
- **Admit — S248, mined, B, criterion Q21/Q78.** *The Oracle Problem in Software Testing: A Survey*, https://eecs481.org/readings/testoracles.pdf, section 1 Introduction, page 1. Located quote: “a procedure that distinguishes between the correct and incorrect behaviors of the System Under Test (SUT)”. This accessible full text satisfies S246's former flip (R85-V10); its old ACM fetch failure remains historical. Capture `.ufo/waves/round-86/open/testoracles.pdf`, sha256 `6c5689497594a75f08c1b37b3dd361e11c54946bbbf79f670d660f5d298d3d51`.
- **Reject — S249 as semantic-correctness evidence (A only for the digest API), criterion Q21.** Node.js v26.13.0 Crypto documentation, https://nodejs.org/api/crypto.html#hashdigestencoding, `hash.digest([encoding])`. Located quote: “Calculates the digest of all of the data passed to be hashed”. An API for hashing data does not establish the correctness or authorship of that data. Flip: independently specified expected behaviour and provenance evidence, not a digest alone.
- **Re-open — S246** (standing round-85 reject): the ACM locator still fails, but the reachable full text carries the located sentence, so the old flip is satisfied and S248 records the admission; S246's own cell is unchanged history.
- **no reject this round beyond S249 —** the round rejected one candidate (S249) and re-adjudicated one standing reject (S246).

Registry changes: new S247/S248/S249 only. Existing status/recheck/used-by cells are unchanged; S247 and S248 explicitly supersede S245/S246 rather than rewriting immutable cells. Independent non-author agree/disagree judgment is not self-attested here; the closure integrator owns that review.

Assimilation: none. The actual package `/home/vgpnk/Projects/shokuknow/merge/kumitate` is present and read-only; no package row is adopted. The initial discovery command misspelled it `shukuknow`, which is not absence evidence. The plan was corrected before freeze. The latest operator proposals (`considerthese/2026-10-26.md`) were reopened: ideas 1/2/3/4/6 already have Q75/Q76/Q68/Q69/Q72 implementations; idea 5 requests non-author spot-check formatting, outside this lane's authority. No still-unimplemented proposal is represented as implemented.

## Mistakes

| class | evidence | captured-by | fix and shown-able-to-fail boundary |
|---|---|---|---|
| stale-premise | the first host-surface command queried `shukuknow` and falsely inferred the assimilation package absent | CORPUS negative-claim sweep rule | opening the correct `/home/vgpnk/Projects/shokuknow/merge/kumitate` returned MERGE-REPORT and SOURCES.append; correct the plan before freeze, never treat typo ENOENT as a package census |
| attribution | R85-V3: `.ufo/waves/round-85/build/K85ExecFixture/independent-candidate.txt` names candidate digest `7659be6e…`, while the integrated tool was `f385bd7a…` | PROTOCOL revision-bound evidence | historical 41/41 is relabelled candidate-only in the new source-binding knowledge entry; candidate/integrated digests must be recorded separately in new receipts |
| number-drift | R85-V1/V2/V14: reported proxy MATCH contradicted the committed DRIFT receipts | report-receipt comparison and revision-bound counts | append the exact historical corrections to SCORECARD and LOG; classify the proxy red as lane-state, not live-host; do not fabricate a MATCH receipt |

### Supplemental same-path control (not a frozen-predicate amendment)

The original probe's differently named mutation cases do not actually overwrite one path;
its “same path” comment overstates that property. The frozen 24-arm file is retained unchanged.
Before integrating or scoring candidate bytes, `.ufo/waves/round-86/probe/same-path.mjs` was added and scored
over all four controls, then committed at `d12847c5f344ed94569939c90f8b803e143c70c1`.
It overwrites one receipt path and one source path three times, asserting all three output
lines and exit status. Base/stub/no-reader/replay each score 0/3 exit 1;
the base produces distinct answers while the three canned controls do not
(`controls/cv-*.txt`). This supplements Q78 evidence but does not backdate it into the
original freeze or alter C1's predicate. It is a procedural late-control disclosure.
