# kumitate round 53 — plan (frozen 2026-10-24)

Lane: kumitate. Round 53 (hyaku run 5, watchdog attempt 1). Base
`d124a775ee46902f588ac730ff97f4d8864e4692` (the round-52 close tip; lane clean, ahead=0).
Round shape: **ONE v2 wave of exactly 64 seats** (the round-52 orchestrator/operator steer
2026-10-24 carries; validated under `scripts/hyaku/ufo-wave-policy-v2.json`, band 64–128,
≥25% attack roles), dispatched by the orchestrator from the spec committed at
`.ufo/waves/round-53/w1-spec.json`; the §3 planner seat is held by the L1 (orchestrator
ruling 2026-10-19). Seat tools start at the fleet root: every path below is absolute or
lane-root-relative from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

This plan is frozen with counters AND base receipts AND a scratch-HELD witness (QUALITY
Q43 as upgraded by lesson M5: the freeze commit must show the counters HELD against a
synthetic conformant post-state, not only UNMET at base).

## Claims (exactly two, distinct axes, causally separable)

**C1 — operability (lowest non-retired axis; capability deepening): `receipt-attest` v3,
the ledger-evidence extension.** Routed defects R52-9 (ledger `*.txt` scope —
`MutReceiptBytes` F4: a nonce-colliding forgery stored under a non-`.txt` name is invisible
to the ledger) and R52-10 remainder (the ledger evidence set binds record digests, not
byte-distinct filenames). Contract `kumitate-receipt-attest-v3`: `verify --ledger` examines
EVERY entry of the ledger directory; an attested receipt counts as nonce evidence whatever
its filename extension; non-regular files (directories, FIFOs, sockets, devices) and
non-attested entries are skipped with the printed `ledger skipped ... not an attested
receipt` note; the same-digest exemption is extension-independent. v1/v2 receipt formats,
verdicts and the exit map are unchanged (the round-51/52 receipts must still verify VALID —
A53 B6 pins this). Five v3 selftest arms ship in the 51-case suite.

Predicate sentence (frozen, byte-identical in this plan, both probe headers and the
report):
ATTEST53_HELD — node .ufo/waves/round-53/probe/attest53-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST53: ATTEST53_HELD held=17/17 checks=17 rev=<rev> rule=A53 version=v1" and exits 0.

Kill rules (frozen before data): K1 do-nothing = the base receipts below (the v2
instrument at base reads B2/B3/B7* MISS; B7a reads the R52-9 defect live: the original
receipt answers VALID beside a nonce-reusing `*.receipt` forgery); K2 static-forgery = the
B7a/B7b crafts against a verdict-printing stub cannot produce attested receipts (the
sidecar + inner-digest chain is checked by the instrument itself); K3 drop-one counter
mutants print `held=16/17`, killed by the predicate's literal `held=17/17 checks=17`; K4
vacuous-HELD = B5c (hold-call-deleted mutant transcript + judged-bytes guard); K5 the
scratch-HELD witness proves 17/17 reachable by a conformant v3 before any score is taken
(lesson M5).

**C2 — frontier coverage (learning, sourced): `receipt-identity-canonicalization.md`.**
The third entry of the durable-execution research line: a receipt's identity is its
canonical-JSON record digest (RFC 8785 JCS grounds canonical serialization), not whole-file
bytes (trailing-newline variance separates byte identity from record identity — the R52-10
class); the ledger's evidence set is the whole directory, not a filename-extension subset
(R52-9). Rows opened this round: S104 (RFC 8785, tier A) and S105 (sha256sum(1) text-mode,
tier B — Debian coreutils man page; the gnu.org manual node timed out twice from this host,
the Debian packaging of the same GNU man page is the official-channel fallback).

Predicate sentence (frozen, byte-identical):
DOCTRINE53_HELD — node .ufo/waves/round-53/probe/doctrine53-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE53: DOCTRINE53_HELD held=5/5 checks=5 rev=<rev> rule=D53" and exits 0.

## Counters (frozen)

`.ufo/waves/round-53/probe/attest53-probe.mjs` (rule `A53` v1, seventeen checks B1..B7d —
the A52 thirteen re-anchored to round-53 receipts plus B7a–B7d, the v3 ledger challenges)
and `.ufo/waves/round-53/probe/doctrine53-probe.mjs` (rule `D53` v1, checks E1–E5).

Source pins (the B5d arm — freeze-time sha256 of the frozen counters and the instrument;
re-verified by the close harm battery, so a freeze-repaired counter that never re-anchors
its plan hash fails close):

```
e8d016bb36df69fe3e2f937bb7e85dbc68c06bf203529edf81952984ab309e33  .ufo/waves/round-53/probe/attest53-probe.mjs
da693cf1373f38b6377653538b3dff7e232376e3356d8998eead9a5078383efd  .ufo/waves/round-53/probe/doctrine53-probe.mjs
ba5139b1290b204054c043df3140554757116e6fbaf19783b502a24ed1b2ce31  scripts/receipt-attest.mjs
```

## Receipt plan (C1 evidence)

Three receipts at `.ufo/waves/round-53/receipts/`, planned argv frozen here (A53 B2
asserts exactly these):

- `attest53-run-1.txt` — `node scripts/bind-oracle.mjs --selftest`
- `attest53-run-2.txt` — `node scripts/sources-check.mjs`
- `attest53-run-3.txt` — `node scripts/round-gate.mjs --selftest`

Body-field `wall_start` span ≥ 300 s across the three (minted time-spaced). Doctored
control `attest53-run-2-replayed.txt` (prelude rewritten, sidecar untouched — the M2
forgery) must read `RECEIPT: TAMPERED` exit 1.

## Harm rules (declared before data)

H1 `node scripts/surface-probe.mjs --checklists` — checklist pass count ≥ the freeze
baseline (committed at freeze; items 620/625/627/628 are the known red floor).
H2 selftests green at close: receipt-attest 51/51, cap-run 12/12, bind-oracle 7/7,
round-gate 61/61, sources-check CLEAN, counter-rerun PASS.
H3 `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`.
H4 `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` exit 0.
H5 the r52-set at the close rev: `repairs50-probe-v2` 8/8, `bindguard50-probe` 8/8,
DOCTRINE51 5/5 at the close rev **via the r53 re-anchor** (the r51 entry's instrument
binding moves from the replaced `scripts/receipt-attest.mjs` v1 bytes to the archived
hash-matching v1 bytes at `.ufo/waves/round-52/build/ScribeEntry/v1-receipt-attest.mjs`,
sha256 `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` — routed from
the round-52 closure), DOCTRINE52 5/5.
H6 the B5d source-pin arm: `sha256sum` of both counters and the instrument at close equals
the pins in §Counters above (a freeze repair that changed bytes without re-anchoring the
plan fails close).

## Close sequence (R52-11 discipline, QUALITY Q44)

R1 = the integration tip (instrument v3 + selftest arms + receipts + entry + rows + all
docs). FINAL receipts: A53 + D53 run against R1, committed as `close/FINAL-*-R1.txt`.
R2 = that receipt commit; idempotence re-run against R2, committed as
`close/IDEMPOTENCE-<R2>.txt`. R3 = idempotence commit; the harm battery + census run
against R3 and committed under `close/`. The report and SCORECARD cite the measured close
revision R1 and quote the committed FINAL lines verbatim.

## Repairs carried this round (named, non-claim)

R53-1 (round-52 closure routed defect): the round-52 SCORECARD section's H5 line says "D51
5/5 at R2" while the committed census reads DOCTRINE51 4/5 — an append-only named
correction lands in SCORECARD. R53-2 (seat accounting): ScribeReadme counted as
returned-without-report in the round-52 report's wording (payload landed, no w1/ report) —
the round-53 report states the convention. D51 re-anchor (H5). Carried open, named:
A3e captured-invocation question, B5d counter source-pin arm beyond H6, R43-1/R43-5,
R41-2 L0 pending.

## Frontier step

Sources: rows 103 → 105 (S104 RFC 8785 tier A, S105 sha256sum(1) tier B), opened this
round, saved bytes under `.ufo/waves/round-53/build/`, `## Gate` in
`corpus/lessons/round-53.md`. Mistake mined into `corpus/lessons/round-53.md`. Census
before → after recorded in the report. README map rows for the new entry and lesson.

## Wave (prepared, dispatched by the orchestrator)

`.ufo/waves/round-53/w1-spec.json` — ONE v2 wave `kumitate-r53-w1`, 64 seats
(executor 19 / reviewer 13 / scribe 8 / scout 7 / critic 6 / mutation-tester 5 /
simplifier 2 / sentinel 2 / revenger 1 / connector 1 = 64; attack = reviewer+critic+
mutation-tester = 24/64 = 37.5%), `reportDir .ufo/waves/round-53/w1`, validated under
policy v2; the validated `taskCall` is committed as `w1-taskcall.json`. The host surface
mapping: this seat prepares the wave; the orchestrator dispatches it between rounds.
