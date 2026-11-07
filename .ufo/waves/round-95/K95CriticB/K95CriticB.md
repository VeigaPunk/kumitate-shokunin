# K95CriticB — C1 framing + harm surface (round 95, seat critic B)

Candidate evaluated: `.ufo/waves/round-95/K95ExecTool/round-gate.mjs`
sha256 `c5a2f8ace8ef3208683b610736961f921a632492eee75b026541e7cbb847e0ab` (BASE
`scripts/round-gate.mjs` = `11f83a1ac7b539e76bbbfe370b618aaf836f441db48a7d587e4389f3a3c58b0a`).
READY was still absent after all candidate-independent work; the candidate above was
stable from 21:38 through the last run (hash re-checked), and was replaced twice before
that (`0a1001bb…` → `c5a2f8ac…`). If the final READY sha256 differs, the harm battery in §2
must be re-run before admission; §1 is candidate-independent and §3 is rule-level.

All receipts: `.ufo/waves/round-95/K95CriticB/receipts/`.

## Verdict (framing): SOUND, with one routed defect and two wording defects

NOT busywork, but the operative effect today is *prospective*: the class has zero real
occurrences, so C1 buys fail-closed direction and one authority, not a live defect.

### For "real move" (receipts)

1. **False provenance is reproducible, not hypothetical.** Shifted fixture (real registry
   copy, S045 = a `rejected` row whose status cell moves because one unescaped `|` is
   inserted in its scope cell; NF=14):
   - BASE: `citations.declared = ["e7f1a99fc52e68d8e8a2d99d59deba38e4272754"]`, `unresolved = []` → the gate certifies a pin the registry explicitly rejects (`receipts/fx2-base.json`; reproduces K94Sentinel `candF.rejected_shifted.json`).
   - Candidate: `declared = []`, `unresolved = ["e7f1a99f…"]` (now a `COMMIT_CITED_UNRESOLVED` error), `malformedRows = ["S045"]` (`receipts/fx2-cand.json`; text: `ROUND_GATE info COMMIT_CITED_DECLARED declared=0 malformed=1 []`).
2. **Two disagreeing parsers of one document is the duplicate-authority harm.** BASE reads
   `split('|')[8]` with no field-count guard while the census, `sources-check.mjs:261`
   (`ROW_MALFORMED`, NF≠13) and CORPUS.md:136 all define the row as 11 cells. The candidate
   makes the gate agree with the census shape; selftest grew 79→86 cases
   (`receipts/st-base.out`, `receipts/st-cand.out`) and the new arms kill the mutation that
   disables the NF check (`receipts/mut-nogate.out`, exit 1).
3. **The validators and the gate do not run at the same moments.** Gate: `SKILL.md:724`
   (round-close audit) and the mid-round `--tracked` (`SKILL.md:725`), which per
   `SKILL.md:897` "runs NO audit check of its own" — it does not re-judge citations, so a
   report certified once is not automatically re-derived after a later registry repair.
   Registry validator: `SKILL.md:730` only. A consumer-side guard is therefore the only
   guard that binds at the moment the gate speaks.

### For "busywork" (receipts)

1. **The class is already blocked twice.** Maintained census on a full fixture lane (clean
   copy): exit 0, `ok` (`receipts/census-lane-clean2.out`); same lane with the shifted S045:
   exit 1, `E01 S045` (`receipts/census-lane-shift2.out`). Lane `sources-check.mjs:261`
   carries the same NF≠13 error. Any committed malformed row blocks closure independently
   of this claim.
2. **Never observed.** Real registry today: `real_malformed=0`; every one of the 74
   revisions of `corpus/SOURCES.md` in lane history has 0 malformed rows
   (`receipts/sources-history-malformed.txt`). No filed report depends on the declared step
   in 5 of the 6 rounds sampled (only round 93 has `declared`), so the declared mechanism is
   barely exercised.
3. **The frozen (c) arm cannot see the value**: 78/78 reports are a no-regression arm only,
   exactly as the plan discloses.

Residual harm model is therefore conditional: needs a malformed row **and** a report citing
its pin **and** a gate run ordered before the registry repair. That is a real but narrow
window; the plan's own rule (declare nothing + disclose) turns it from false-green into a
visible error, which is the right direction. Judged on the frozen predicate, C1 is a
legitimate operability move; judged as "does operability 9→10 reflect a live defect", the
justification is defense-in-depth, and the round report should say so.

## Harm surface — candidate vs BASE `--json` on 6 rounds

Command (both tools):
`node <tool> --round N --json --repo <lane> --reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports --main-repo /home/vgpnk/Projects/shokunin`
(`--repo` is explicit so the candidate's `DEFAULT_REPO` derivation — `realpath(HERE/..)` —
cannot silently change the lane; without it the seat-dir copy audits `.ufo/waves/round-95`.)

| round | exit base/cand | JSON equal after dropping `durationMs` + `malformedRows` | `citations.malformedRows` | text-mode diff |
|---|---|---|---|---|
| 90 | 0 / 0 | yes | `[]` | none |
| 91 | 0 / 0 | yes | `[]` | none |
| 92 | 0 / 0 | yes | `[]` | none |
| 93 | 0 / 0 | yes | `[]` | one line: `declared=2 [79fa222e …]` → `declared=2 malformed=0 [79fa222e …]` |
| 94 | 0 / 0 | yes | `[]` | none |
| 95 | 1 / 1 | yes | `[]` | none |

Receipts `receipts/base-N.json` / `receipts/cand-N.json`. `durationMs` differs run to run in
BASE itself and is not an output of the change. `--tracked` text is byte-identical
(`receipts/tr-text-base.out`, `receipts/tr-text-cand.out`); `--tracked --json` has **no**
`citations` key in BASE or candidate (`receipts/tr-cand.json`).

**Consumers.** No script consumes round-gate `citations` or the info line:
`grep -rn 'citations' kumitate-shokunin/scripts/*.mjs` finds only cite-check/prose uses;
`grep -rn 'round-gate' kumitate-shokunin/scripts/` finds `proxy-check.mjs` (hash pin),
`harm-matrix-gates.json` (runs `--selftest` only, verdict regex
`^ROUND_GATE_SELFTEST: \d+/\d+ (\w+)` — unaffected) and the gate itself. One contract
obligation remains: `pin.round-gate` is a sha256 pin in `SCORECARD.md`
(`proxy-check.mjs:542`), so the change **requires** the re-pin listed in plan K3; without it
`proxy-check --strict` is DRIFT.

## Strongest counterexamples (impact = operability `f_O`; coverage untouched)

1. **Section membership (routed defect).** The census row contract has two halves; the claim
   implements one. A row-shaped line *outside* `## Registry` is **E12** for
   `sources-census.sh validate`, but the claim's regex ignores sections, so it still declares
   pins — in both BASE and candidate (`receipts/prose-base.json`, `receipts/prose-cand.json`:
   `declared = ["deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"]`, `malformedRows = []`). With 14
   fields instead of 13 the candidate lists it (`malformedRows = ["S998"]`,
   `receipts/prose14-cand.json`), while the maintained census reports only `E12 S998` and
   never `E01` (`receipts/census-prose14.out`) — i.e. the candidate matches CORPUS.md's
   one-liner but not `validate`, and the census itself carries two readings of "malformed".
   Not a HELD failure (the frozen rule defines a row by regex and says field count only), but
   the claim title "trusts a registry row only in the census shape" overstates what shipped.
   The frozen fixture does not test this: `proseI` is prose, not a row-shaped line, so the
   counter cannot separate a section-checking candidate from this one.
2. **"always present on every `--json` output" is false for `--tracked`.** Both tools print a
   `--json` object with no `citations` at all in tracked mode (`receipts/tr-cand.json`), so
   the rule's own wording is not satisfied by any candidate that leaves the tracked schema
   alone — and "everything else unchanged" forbids adding it. Wording defect in the frozen
   claim, invisible to (c) (audit-mode reports only). Fix at integration by writing the
   invariant as "every audit/fail-closed `--json` output" in `SKILL.md:610` and the round
   report; no code change.
3. **Unforced text-output change.** The candidate does more than the rule's letter: it
   appends `malformed=<n>` to the existing `COMMIT_CITED_DECLARED` line and prints that line
   when *only* malformed rows exist. That is a byte change on every declared round (round 93
   above) and the reason a selftest arm's expected string moved. No consumer breaks today,
   but the rule says "everything else is unchanged". Smallest safe correction: leave the
   existing line byte-identical and emit a separate `ROUND_GATE info COMMIT_CITED_MALFORMED
   malformed=<n> [<ids>]` only when `malformedRows` is non-empty (or keep it JSON-only, the
   strictest reading); declare whichever choice in the round report as an amendment, the way
   round 94 disclosed the declared-pin info line.
4. **Third copy of the constant.** `13` is now hard-coded in the gate as well as
   `sources-check.mjs`, the census and CORPUS.md:136; no export exists to import. Nit, not a
   blocker; the docstring does name the census as the source.

## Smallest safe corrections (in order)

1. Fix or re-scope the claim wording: field count only (already the rule's text), and
   "every audit/fail-closed `--json` output" (§2 above). No code change needed.
2. Split the text disclosure from the existing info line, or drop it (§3 above) — one-line
   change plus the selftest expected string back to the round-94 form.
3. Route E12 to a later round as a stated limit of C1 (the gate still declares from a
   row-shaped line outside `## Registry`), and add that class to a future fixture.
4. Integration conditions: `pin.round-gate` re-pin (`proxy-check.mjs:542`), SKILL.md:610
   already names `malformedRows`; if the final READY hash ≠ `c5a2f8ac…`, re-run §2.

## What the canonical judge must NOT reject

The rule's narrowing (malformed row declares nothing → citing report becomes `unresolved`
→ error) is fail-closed and does not silently pass anything: the only way a malformed row can
still influence a verdict is through a *well-formed* row, which is out of the claim. Nothing
in §2 changes exit, check vector or the declared set on real data.
