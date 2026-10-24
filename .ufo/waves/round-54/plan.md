# kumitate round 54 — plan (frozen 2026-10-24)

Lane: kumitate. Round 54 (hyaku run 5, watchdog attempt 1). Base
`383ad787ac3a9301b25422e50ebfef256d534924` (the round-53 close tip; lane clean, ahead=0).
Round shape: **ONE v2 wave of exactly 64 seats** (the round-52/53 orchestrator/operator
steer carries; validated under `scripts/hyaku/ufo-wave-policy-v2.json`, band 64–128,
≥25% attack roles), prepared by the L1 and dispatched by the orchestrator from the spec
committed at `.ufo/waves/round-54/w1-spec.json`; the §3 planner seat is held by the L1
(orchestrator ruling 2026-10-19). Seat tools start at the fleet root: every path below is
absolute or lane-root-relative from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

This plan is frozen with counters AND base receipts AND a scratch-HELD witness (QUALITY
Q43 as upgraded by lesson M5: the freeze commit must show the counters HELD against a
synthetic conformant post-state, not only UNMET at base).

## Claims (exactly two, distinct axes, causally separable)

**C1 — operability (lowest non-retired axis; capability acquisition): `counter-pins`,
the pinned-counter registry gate** — the B5d arm beyond the round-53 H6 source-pin rule,
planned round-53 candidate (2). Contract `kumitate-counter-pins-v1`: the registry
`.ufo/pins/counter-pins.json` (version 1) names each frozen round counter and the
instruments they judge with a repo-relative path and a freeze-time sha256;
`node scripts/counter-pins.mjs [--registry <path>]` re-verifies every pin mechanically —
`COUNTER_PINS: CLEAN (pins=N)` exit 0, `DRIFT` exit 1 (absent / hash-mismatch /
not-a-regular-file / path-escape / pins-empty), `FAIL-CLOSED` exit 2 (registry
unreadable, malformed, version ≠ 1, duplicate names), 64 usage. Pins bind bytes, not
names: a symlinked pin is DRIFT. Ten-case hermetic selftest. Round 53 verified its
counter source pins only by a human-run sha256sum in the close harm battery; this gate
makes the same pin set a runnable, fail-closed artifact. Predicate `ATTEST54_HELD`
(rule A54, ten checks B1..B9 + B5c).

Kill rules (frozen before data): K1 do-nothing = the base receipts below (the counter,
instrument, registry, receipts and capability row are all absent at base; B8's receipts
are absent); K2 static-forgery = the B3/B4 arms mutate real registry bytes and real
pinned files and the gate computes sha256 itself — a verdict-printing stub cannot
satisfy them; B8 binds receipt digests via the instrument's own verify; B6 runs the real
proxy recompute; K3 drop-one counter mutants print `held=9/10`, killed by the
predicate's literal `held=10/10 checks=10`; K4 vacuous-HELD = B5c (hold-call-deleted
mutant transcript + judged-bytes guard); K5 the scratch-HELD witness proves 10/10
reachable by a conformant post-state before any score is taken (lesson M5).

**C2 — frontier coverage (learning, sourced): `at-least-once-dedupe.md`.** The fourth
entry of the durable-execution research line (PROVINCE.md frontier band): at-least-once
delivery and idempotent consumption — a redelivered unit of work is detected by a stable
idempotency key, not by wall-clock time or filename; the dispatcher core's claim/repend
door redelivers work and the receipt ledger's nonce is the consumer-side dedupe key.
Rows opened this round: S106 (MQTT v5.0 OASIS standard, tier A — QoS 1 at-least-once,
the DUP flag, packet-identifier reuse as the dedupe key) and S107 (RabbitMQ
consumer-acknowledgement documentation, tier B — ack-timeout / nack-requeue redelivery
makes duplicates normal operation). Predicate `DOCTRINE54_HELD` (rule D54, five checks
E1–E5, mirroring D53).

Predicate sentences (frozen, byte-identical in this plan, both probe headers and the
report):
ATTEST54_HELD — node .ufo/waves/round-54/probe/attest54-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "ATTEST54: ATTEST54_HELD held=10/10 checks=10 rev=<rev> rule=A54 version=v1" and exits 0.
DOCTRINE54_HELD — node .ufo/waves/round-54/probe/doctrine54-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints "DOCTRINE54: DOCTRINE54_HELD held=5/5 checks=5 rev=<rev> rule=D54" and exits 0.

## Counters (frozen)

`.ufo/waves/round-54/probe/attest54-probe.mjs` (rule `A54` v1, ten checks B1..B9 + B5c)
and `.ufo/waves/round-54/probe/doctrine54-probe.mjs` (rule `D54` v1, checks E1–E5).

Source pins (the B5d arm — freeze-time sha256 of the frozen counters and the new
instrument; the registry `.ufo/pins/counter-pins.json` carries the round-53 pins
without regression and is re-verified by the B5 arm at every judged rev):

```
b0027fccee8134c3bbe7611363ec5ad02048c00c72f78eac836862b05040d420  .ufo/waves/round-54/probe/attest54-probe.mjs
556d5c6bea114e9558cdec4e66643c9b8cce9fc74071996adb4df3f8bc53bbb6  .ufo/waves/round-54/probe/doctrine54-probe.mjs
1024c6c7d8e0e8345e538e8e1399ec5cc59b597c597e3adbf57a5cee48fae693  scripts/counter-pins.mjs
```

## Receipt plan (C1 evidence)

Three receipts at `.ufo/waves/round-54/receipts/`, planned argv frozen here (A54 B8
asserts exactly these):

- `attest54-run-1.txt` — `node scripts/bind-oracle.mjs --selftest`
- `attest54-run-2.txt` — `node scripts/sources-check.mjs`
- `attest54-run-3.txt` — `node scripts/round-gate.mjs --selftest`

Body-field `wall_start` span ≥ 300 s across the three (minted time-spaced; run-1 minted
2026-10-24T06:24:28Z before the freeze). Doctored control `attest54-run-2-replayed.txt`
(prelude rewritten, sidecar untouched — the M2 forgery class) must read
`RECEIPT: TAMPERED` exit 1.

## Harm rules (declared before data)

H1 `node scripts/surface-probe.mjs --checklists` — checklist pass count ≥ the freeze
baseline (committed at freeze; items 620/625/627/628 are the known red floor) and the
item census reads 24 items.
H2 selftests green at close: receipt-attest 51/51, counter-pins 10/10, cap-run 12/12,
bind-oracle 7/7, round-gate 61/61, sources-check CLEAN, counter-rerun PASS.
H3 `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`.
H4 `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` exit 0.
H5 the r53-set at the close rev: `repairs50-probe-v2` 8/8, `bindguard50-probe` 8/8,
DOCTRINE51 5/5 via the round-52 archive re-anchor, DOCTRINE52 5/5, ATTEST53 17/17,
DOCTRINE53 5/5 (the pinned-counter registry must not regress the rounds it pins).
H6 the B5d source-pin arm: `sha256sum` of both counters and the instrument at close
equals the pins in §Counters above, and `node scripts/counter-pins.mjs` reads
`COUNTER_PINS: CLEAN` at the close rev.

## Close sequence (R52-11 discipline, QUALITY Q44)

R1 = the integration tip (instrument + registry + SKILL row + checklist item + SCORECARD
stanza/capability + entry + rows + lesson + receipts + all docs). FINAL receipts: A54 +
D54 run against R1, committed as `close/FINAL-attest54-R1.txt` /
`close/FINAL-doctrine54-R1.txt`. R2 = that receipt commit; idempotence re-run against R2,
committed as `close/IDEMPOTENCE-<R2>.txt`. R3 = the idempotence commit; the harm battery
+ census run against R3 and committed under `close/`. The report and SCORECARD cite the
measured close revision R1 and quote the committed FINAL lines verbatim.

## Repairs carried this round (named, non-claim)

R54-1 (round-53 closure routed item 1): the round-53 lesson's `## Gate` spot-check line
still reads `<pending>` in committed bytes — the round-53 verifier spotcheck
(`corpus/lessons/round-53-verifier-spotcheck.md` §3) is the non-author re-open that
satisfies it; the append-only pointer lands this round. Carried open, named: A3e
captured-invocation question, R43-1/R43-5, R41-2 L0 pending, R53-2 seat-accounting
convention (this round's prepared wave names every seat's report expectation; seats that
would deliver payload-without-report count returned-without-report by name).

## Frontier step

Sources: rows 105 → 107 (S106 MQTT v5.0 tier A, S107 RabbitMQ consumer acks tier B),
opened this round, saved bytes under `.ufo/waves/round-54/build/`, `## Gate` in
`corpus/lessons/round-54.md`. Mistake mined into `corpus/lessons/round-54.md` (M1:
the `<pending>` spot-check line — a lesson pointer never re-pointed at the committed
non-author check; fix = the append + QUALITY Q45). Census before → after recorded in
the report. README map rows for the new entry and lesson.

## Wave (prepared, dispatched by the orchestrator)

`.ufo/waves/round-54/w1-spec.json` — ONE v2 wave `kumitate-r54-w1`, 64 seats
(executor 19 / reviewer 13 / scribe 8 / scout 7 / critic 6 / mutation-tester 5 /
simplifier 2 / sentinel 2 / revenger 1 / connector 1 = 64; attack = reviewer+critic+
mutation-tester = 24/64 = 37.5%), `reportDir .ufo/waves/round-54/w1`, validated under
policy v2; the validated `taskCall` is committed as `w1-taskcall.json`. The host surface
mapping: this seat prepares the wave; the orchestrator dispatches it between rounds.

## Pre-data freeze addendum (2026-10-24; supersedes the named frozen details)

Before any wave seat is dispatched, the L1 hardened `scripts/counter-pins.mjs` after its
first 10/10 selftest: registry files must be regular files; pin metadata must carry a
positive integer round and nonempty name/path; canonicalized targets must remain beneath
their path base even through symlinked parent directories; and a traversal arm was added.
The suite is now 11/11. This hardening changes the instrument hash in §Counters from
`1024c6c7d8e0e8345e538e8e1399ec5cc59b597c597e3adbf57a5cee48fae693` to
`060d5d8662701340da24f483316053be86bed246510c541a0518492e7b29028e`. The authoritative
freeze pin is the latter; the prior plan value is retained here as repair history.

After that repair, A54 was re-run against base `383ad787ac3a9301b25422e50ebfef256d534924`:
`base/attest54-base-v2.txt` → `ATTEST54_UNMET held=0/10 checks=10`, exit 1. D54 was also
re-run at the same base: `base/doctrine54-base-v2.txt` → `DOCTRINE54_UNMET held=0/1 checks=1`,
exit 1. The first base receipts remain as history; the `*-v2.txt` receipts are authoritative
for this freeze.

The bounded source screen also opened and rejected S108 (Microservices.io's Idempotent
Consumer pattern): its database-transaction recipe does not map to the lane's file-backed
claim/repend and nonce-ledger surfaces, and is not admitted as a source for this scoped
entry. Thus the source registry closes at 108 rows, not 107: before 105; after 108 (S106 and
S107 tier A admitted, S108 tier B rejected). The sourced C2 predicate still rests only on
S106/S107. H2's counter-pins selftest floor is 11/11.

Tier correction: the earlier C2 paragraph called S107 tier B; the RabbitMQ page is its
official v4.4 documentation and is authoritative for RabbitMQ's own acknowledgement and
requeue semantics, so the source row classifies S107 as tier A. This addendum supersedes
the earlier tier label without changing the claim's scope.

## Inherited README repair addendum (R54-2)

The round-open tree already contained `corpus/lessons/round-53-verifier-spotcheck.md`
but lacked its `corpus/README.md` row. After the two round-54 notes were mapped, the
strict proxy read `C2=125`, `C2_total=126`, and `AXES_DRIFT` (declared coverage 10,
derived 9); the red receipt is `.ufo/waves/round-54/build/MistakeR54-2-before.txt`.
The missing row is now present and the strict proxy reads `C2=126/126`, coverage 10
(`MistakeR54-2-after.txt`). This repairs inherited index drift; it does not change
the C2 claim or move the retired coverage aggregate.

## H1 freeze-baseline addendum (2026-10-24; supersedes the older known-red note for this round)

The pre-data `node scripts/surface-probe.mjs --checklists` receipt
`base/checklists-freeze.txt` reads `CHECKLIST: 23/24 pass`, `VERDICT: FAIL`, exit 1.
The sole failing item is the round-close artifact audit: `ROUND_GATE` reports
`COMMIT_CITED_UNRESOLVED cited=7 unresolved=1 [b717dc035bf687a3039123f4c70527bd3774f510]`
against the existing round-53 report; this hash is the scratch witness revision named by
the round-53 plan, not a lane-branch commit. The old H1 sentence naming four red checklist
items is historical; the frozen pass floor for this round is 23/24, with 24 total items.

## Freeze repair addendum A54/D54 (pre-data)

The first synthetic HELD witness exposed three counter/evidence defects before any wave
seat scored data: A54 B1 searched only the last output line even though the selftest
summary precedes `VERDICT: PASS`; A54 B6 parsed whitespace after `pin.counter-pins`
instead of the scorecard's `key=value` grammar; and D54's hash reader round-tripped the
non-UTF8 OASIS HTML through a UTF-8 string. The corrections are B1 summary+final-verdict
checks, B6's exact `pin.counter-pins=<sha256>` parse, and hash-bound plain-text source
captures in the D54 entry (the full raw HTML remains saved and hashed in S106).

The A54 probe pin in §Counters is superseded from
`b0027fccee8134c3bbe7611363ec5ad02048c00c72f78eac836862b05040d420` to
`e2252e8e02e4c51b47868aadb8c12747a6f1c8b61f0652b0d686fd0e7d7a3137`; the registry's
`attest54-probe` pin is updated to the same value. Re-run base receipts:
`base/attest54-base-v3.txt` → `ATTEST54_UNMET held=0/10`, exit 1;
`base/doctrine54-base-v3.txt` → `DOCTRINE54_UNMET held=0/1`, exit 1.
The initial scratch outputs (`8/10` and `4/5`) remain as repair history in `witness/`;
the final scratch-HELD witness is re-run on the repaired bytes below. Predicates and
targets remain unchanged.
