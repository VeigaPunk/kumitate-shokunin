# RevengerGap — round-51 wave 1

Seat `RevengerGap` (`kumitate-r51.PreferredKangaroo`), 2026-10-23. Item: reconstruct the
actual gap left open by the round-50 repairs (M2 / Q39 / counter-amendment-discipline),
then audit plan §C1's `ATTEST_HELD` against it — property, proxy, or something else; flag
if the instrument closes a different gap than M2 named.

Artifacts under audit (read, unmodified):

- `.ufo/waves/round-51/plan.md` (frozen; §C1 at :21-73, Limits :148-155)
- `.ufo/waves/round-51/probe/attest51-probe.mjs` (rule A51, frozen counter),
  sha256 `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1`
- `corpus/lessons/round-50.md` (M2 at :25-38)
- `corpus/QUALITY.md` (Q39 at :754-772)
- `corpus/knowledge/counter-amendment-discipline.md` (C6, C13, C14)
- `.ufo/waves/round-50/plan.md` (limit (c) at :103-104), r50 close seats
  (`r50/CritClaimSizing.md`, `r50/RevRepairsSemantics.md`, `r50/MutReceiptSyntax.md`)

---

## 1. The gap the round-50 repairs actually left unproven

**One sentence.** Round-50's repair — re-issuing the three receipts by hand with fresh
`run-at=` preludes — proved only author attestation; it left unproven that a receipt's own
bytes machine-bind the claimed time and a unique per-invocation identity to a single
execution, so the lane still had no check that machine-distinguishes a genuine invocation
record from a copied body with a rewritten prelude (the frozen R4 counter scored exactly
that forgery `PASS … span_s=600 body_distinct=1`).

Evidence chain, bottom to top:

1. **M2 incident** — `corpus/lessons/round-50.md:25-27`: "three receipts with identical
   bytes were presented as separate, time-spaced runs" (class: receipt-for-claim /
   invocation independence; one sha256 `03a258d6…` over three r49 C1 receipts).
2. **Repair R50-4** — three fresh invocations, distinct preludes, span 876 s
   (`round-50.md:28-34`).
3. **Recorded limit (the unproven residue)** — `round-50.md:35-38`:
   "CritB49CounterAttack executed the frozen R4 block in memory over one old body with
   three rewritten preludes → `PASS … span_s=600 body_distinct=1`, so R4 accepts a
   prelude-only replay. The receipts are author-attested invocation records, not
   cryptographic temporal proof."
4. **Q39 codifies both halves** — `corpus/QUALITY.md:768-772`: "run-at is captured
   evidence, not a cryptographic timestamp … a prelude-only replay satisfies R4 …
   defeating a forger needs a separately frozen captured-invocation design, not a text
   check."
5. **r50 plan limit (c)** — `.ufo/waves/round-50/plan.md:103-104`: "R4's spacing proof is
   preamble+distinct-bytes, not a temporal proof — a forged clock line inside a receipt is
   out of scope." (This is the item plan §C1 cites as "r50 limit (c)"; cross-ref confirmed,
   see F4.)

The sentence decomposes into two testable properties the round-50 artifacts left open:

- **(i) tamper-evidence** — the claimed time (prelude) is bound into the record, so
  re-dating is detectable;
- **(ii) replay-evidence** — a per-invocation identity is bound into the record, so body
  copying is detectable.

Explicitly *not* part of the residue (both corpus docs record it as out of scope): temporal
truth (that the clock is true) and forgery-resistance against zero-run minting of fresh,
self-consistent receipts — the exact shape r50's own critic already named
(`.ufo/waves/round-50/r50/RevRepairsSemantics.md:119-123`, "Zero-run forgery"; also
`r50/CritClaimSizing.md:93-94`).

## 2. Audit: what does `ATTEST_HELD` measure?

Arm by arm, from the frozen counter's source (attest51-probe.mjs):

| Arm | Probe lines | What it executes | Relationship to the §1 property |
|---|---|---|---|
| A1 | :71-81 | runs `--selftest` at rev; requires exit 0 + last line matching `/ATTEST_SELFTEST: PASS/` | **Prerequisite, not the property.** String-shaped runnability check. See F2. |
| A2 | :85-117 | the three committed receipts each verify `RECEIPT: VALID`; parses nonce + `run-at:` prelude; requires nonces pairwise distinct, file sha256 pairwise distinct, span ≥ 300 s | **Property applied to the round's own evidence.** Distinctness + integrity are machine-checked. The span number itself is still author-scheduled (plan Limits (b), plan.md:149-151) — tamper-evident after C1, but not truth-bearing. |
| A3 | :119-128 | the doctored control `attest-run-2-replayed.txt` (run-2 with only the prelude rewritten, sidecar untouched — "the exact lesson-M2 forgery", plan.md:61-63) must verify `RECEIPT: TAMPERED` exit 1 | **Direct negative test of property (i)** — the literal M2 forgery artifact is required to fail. |
| A4 | :130-164 | ledger arm: each of the three receipts verifies `RECEIPT: VALID` under `verify --ledger <receipts-dir>` (:136); plus a probe-side sweep that no receipt nonce appears in any prior committed receipt corpus under `.ufo/waves/` excluding round-51 dirs (:149-158) | **Direct test of property (ii)** — nonce ledger detects body/identity replay across the round's receipts and against the r48/r49/r50 corpora. |
| A5 | :166-186 | `pin.receipt-attest` equals sha256 of the extracted script; `proxy-check --strict` prints `PROXY: MATCH` | **Provenance freshness** (the r50-M5 stale-pin class), not the M2 property. Legitimate gate shape. |

**Verdict.** `ATTEST_HELD` measures the §1 property — specifically the *detection* residue
named by M2's recorded limit: A3 tests tamper-evidence against the literal forgery, A4
tests replay-evidence via the nonce ledger, and A2 applies both to the round's own three
receipts. A1 and A5 are capability/provenance prerequisites in the standard
counter-amendment-discipline C13 shape (room between "nothing" and "the claimed
capability"). It does **not** measure temporal truth or forgery-resistance — and the plan
does not claim either (plan.md:45-48 "What it does not claim (Q39 ceiling kept verbatim)";
Limits (a) and (b) at plan.md:148-151).

## 3. Findings

### F1 (medium, round-shaping): frozen A4 × A3 co-residency — satisfiability trap

The counter requires, **at the same revision**:

- A3 (probe :121): the doctored twin exists at `rd/attest-run-2-replayed.txt`, where
  `rd = .ufo/waves/round-51/receipts`;
- A4 (probe :136): each of the three genuine receipts verifies `RECEIPT: VALID` under
  `verify --ledger rd` — the ledger directory is the same `rd`, twin included.

The twin is run-2's receipt with **only the prelude rewritten** — body untouched, so it
carries run-2's nonce. Plan §C1's frozen contract sentence (plan.md:34-35) reads: "with
`--ledger`, walks every other `*.txt` receipt in `<dir>` and rejects a nonce already
present." Under that plain reading, `verify --ledger rd attest-run-2.txt` walks the twin,
finds run-2's nonce already present, and must print `RECEIPT: REPLAY` exit 1 — A4's ledger
arm then fails for run-2 and `ATTEST_HELD` is **unsatisfiable at the very revision at
which A3 requires the twin to exist**. The probe's own header wording ("every pair of the
three round-51 receipts passes `verify --ledger <receipts-dir>`", probe :17-19) shows the
intent is that the three must pass — i.e. the twin must not poison the ledger walk.

The predicate is satisfiable only if the instrument's ledger walk consults **only files
that themselves pass parse + sidecar verification** (sidecar-invalid/unparseable files are
non-receipts for ledger purposes). Plan §C1 does not specify this behavior.

Because the counters are frozen (`counter-amendment-discipline.md` C14 "Nothing changes
after the first candidate score"; C6 "Strictness only, before data"), the compliant fix is
**instrument-side, before the first candidate score**:

1. the `--ledger` walk skips any file that does not itself verify (parse + sidecar check)
   before consulting its nonce;
2. `--selftest` gains a case: a doctored twin (valid body, valid sidecar for the *old*
   bytes — or simply a sidecar-invalid file) present in the ledger directory, the genuine
   sibling must still read `RECEIPT: VALID`.

No counter edit is required or permitted; the L1 adjudicates. Severity medium: if the
builder implements the ledger naively (hash every `*.txt`, compare nonces), C1
self-destructs at scoring time despite a correct instrument.

### F2 (low, plan-prose defect; falsified by execution): "a stub … cannot clear A1" is false

Plan control 2 (plan.md:69-73) claims: "a stub script printing verdict strings cannot
clear A1 (the probe runs the selftest and requires its exact final line from real
execution)". Probe :74-76 is exactly `status === 0 && /ATTEST_SELFTEST: PASS/.test(last)`
— exit code plus last-line regex; it cannot distinguish a real selftest from a stub
printing the line. I executed the plan's own control-2 against the frozen probe:
scratch repo `/tmp/a51-stub-wTGE` containing a 3-line stub
`scripts/receipt-attest.mjs` that prints `ATTEST_SELFTEST: PASS` on `--selftest` and
`RECEIPT: VALID` on `verify`, committed and scored:

```
$ node .ufo/waves/round-51/probe/attest51-probe.mjs /tmp/a51-stub-wTGE HEAD
ATTEST51: ATTEST_UNMET held=1/5 checks=5 rev=HEAD rule=A51 | A1 PASS | A2 MISS attest-run-1.txt:absent;attest-run-2.txt:absent;attest-run-3.txt:absent | A3 MISS attest-run-2-replayed.txt absent | A4 MISS tool or receipts dir absent | A5 MISS tool or SCORECARD absent
probe_exit=1
```

The **composite control holds** (`ATTEST_UNMET held=1/5` exit 1 — consistent with the
discipline's C13 room precedent: r49's static forgery read `held=3/6`), but the plan's
*mechanism* sentence is wrong: what keeps a stub out is A2–A4's demand for genuine verify
behavior against committed bytes, not A1. Proposed minimal prose fix (L1, counters
untouched): "cannot clear A2–A4; A1 is a string-shaped runnability arm and the composite
holds the C13 room." Note the same string-shape is why A3's genuineness ("rejected by
genuine digest binding, not string matching", plan.md:72) is also not enforced by the
counter — a name-conditional verifier passes A2+A3 — so the real anti-forgery burden sits
on the wave-1 build + selftest arms, which is exactly where F1's fix belongs.

### F3 (info, residual honestly kept): zero-run minting stays out of scope

Nothing in the instrument or predicate detects an author minting three fully-valid,
time-spaced receipts **offline** (fresh 128-bit nonces, fresh clocks, correct inner
digests and sidecars) without executing any command; A2–A4 would all pass. This is the
shape r50's critic already named (`RevRepairsSemantics.md:119-123`) and both corpus docs
place outside the claim (`QUALITY.md:771-772`; plan.md:45-48, Limits (a)-(b)). No defect —
recorded so the round-51 close does not over-claim beyond "integrity of the record and
freshness of nonces across a ledger".

### F4 (info, cross-ref confirmed): "(r50 limit (c))" resolves correctly

Plan §C1's "What it closes (r50 limit (c) / lesson M2)" (plan.md:42) cites
`.ufo/waves/round-50/plan.md:103-104` — "(c) R4's spacing proof is preamble+distinct-bytes,
not a temporal proof — a forged clock line inside a receipt is out of scope". Valid: the
instrument's sidecar-over-whole-file binding plus the A3 control narrow exactly the
forged-clock-line class (c) named. Consistent with r50 critic precedent
(`CritClaimSizing.md:93-94`).

## 4. Round-shaping verdict

Does the instrument close a different gap than the one M2 named? **No.** M2's residue had
two halves — the *detection* gap (recorded limit: R4 accepts a prelude-only replay) and
the *truth* gap (run-at is not a cryptographic timestamp). The plan targets the detection
gap by name (plan.md:15-17) and keeps the truth ceiling verbatim (plan.md:45-48, Limits
(a)). `ATTEST_HELD` measures the detection property directly (A3 = the literal M2 forgery;
A4 = replay identity; A2 = the round's own receipts), with A1/A5 as prerequisites —
property, not proxy, on the core arms. The one genuine round-shaper is **F1**: as frozen,
A4 × A3 co-residency makes the predicate satisfiable only under an unstated instrument
behavior (sidecar-gated ledger walk); the wave-1 builder must implement and selftest that
behavior before any candidate score, or C1 fails by construction at its own scoring
revision.

## Evidence appendix

Commands run this session (scratch only; no lane file outside this report was written):

```
# static-forger control (plan control 2, supplementary — the committed control is the L1's)
d=$(mktemp -d /tmp/a51-stub-XXXX) && mkdir -p "$d/scripts" && printf '%s\n' \
  '#!/usr/bin/env node' \
  "if (process.argv[2]==='--selftest'){console.log('ATTEST_SELFTEST: PASS');process.exit(0);}" \
  "console.log('RECEIPT: VALID');process.exit(0);" > "$d/scripts/receipt-attest.mjs" \
  && git -C "$d" init -q && git -C "$d" add -A \
  && git -C "$d" -c user.email=s@x -c user.name=stub commit -qm 'static-forger stub (plan control 2)' \
  && node .ufo/waves/round-51/probe/attest51-probe.mjs "$d" HEAD; echo "probe_exit=$?"
# → ATTEST51: ATTEST_UNMET held=1/5 … | A1 PASS | A2 MISS … | A3 MISS … | A4 MISS … | A5 MISS …
#   probe_exit=1          (scratch=/tmp/a51-stub-wTGE)

sha256sum .ufo/waves/round-51/probe/attest51-probe.mjs
# 422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1
```

Key line anchors: probe A1 :71-81, A2 :85-117, A3 :119-128, A4 :130-164 (ledger arm :136,
prior sweep :149-158), A5 :166-186; plan §C1 contract :33-37, predicate :50-67, control
:69-73, closure/ceiling :42-48, Limits :148-155; M2 `corpus/lessons/round-50.md:25-38`;
Q39 `corpus/QUALITY.md:754-772` (limit :768-772); r50 limit (c)
`.ufo/waves/round-50/plan.md:103-104`; discipline C6/C13/C14
(`corpus/knowledge/counter-amendment-discipline.md` §2-§4); r50 critic precedent
`r50/RevRepairsSemantics.md:109-138`, `r50/CritClaimSizing.md:93-94`.
