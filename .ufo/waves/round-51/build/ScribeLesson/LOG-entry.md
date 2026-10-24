# LOG.md round-51 entry — skeleton for the L1

Shape follows the round-50 entry (`LOG.md:1977-2027`): one `- <date> — round N (…context…)`
bullet, then bolded run-in paragraphs for the claim, the repairs, the wave, the frontier, the
harm run and the terms, ending with the open L0 question. Placeholders are `[…]` for the L1 to
fill from committed evidence at the close; every bracketed slot names the receipt or commit it
must be filled from. Nothing here is a claim — the round has not closed.

---

- 2026-10-23 — round 51 (hyaku run 6; orchestrator attempt 1 — the `launch kumitate round=51`
  line at `.ufo/watchdog.log:1095`, 2026-10-23T22:40:30-03:00; `[no `complete kumitate round=51`
  line — fill at close]`). Base `c90b9de94009b938fa19a089bfaa97df20b54f86` (round-50 close
  B-records; the parent lesson is `corpus/lessons/round-50.md`). Freeze commit
  `06ecbf4703fe9515ae51f36a903c58825c250ccc` ("round-51: freeze plan, counters A51/D51, w1 spec")
  carried the plan and both counters together before any data seat ran; the counters were then
  repaired **pre-data** under the plan's append-only `## Freeze repair addendum` — `1fd8aceb`
  (A51 v1→v2, comment-only), `3ed875d3` (D51 v1→v2, column indexes), `8c07e880` (A51 v2→v3,
  challenge arms), `8fd3cde1` (A3c sidecar), `4b8da21` (A4c + body arithmetic + header claim),
  `cbca45c` (A3d), plus plan-text repairs `779b16e` and `8f3c692`; the final counter bytes at
  the close are `[sha256 of .ufo/waves/round-51/probe/attest51-probe.mjs and
  …/doctrine51-probe.mjs at the close commit — fill]`. Plan `.ufo/waves/round-51/plan.md`;
  counters frozen pre-data (`probe/attest51-probe.mjs` rule A51, `probe/doctrine51-probe.mjs`
  rule D51). Two claims, one per axis: C1 operability `ATTEST_HELD` (A51) and C2 coverage
  `DOCTRINE_HELD` (D51).
  **C1 operability — the `receipt-attest` instrument, `ATTEST_HELD` (rule A51).**
  `scripts/receipt-attest.mjs` (contract `kumitate-receipt-attest-v1`) turns an invocation record
  into a machine-checked object: `run --out <base> -- <cmd...>` writes `<base>.txt` (a display
  `run-at:` prelude plus one canonical-JSON line whose `digest` binds nonce, argv, exit,
  stdout/stderr sha256, wall ISO start/end and the monotonic span) and `<base>.txt.sha256` in
  GNU `sha256sum` format over the exact receipt bytes; `verify [--ledger <dir>] <file>`
  recomputes the inner digest, the sidecar hash and the clock ordering and, with `--ledger`,
  rejects a nonce rebound to a different record digest — verdicts `RECEIPT: VALID` exit 0,
  `RECEIPT: REPLAY` exit 1 (inner-digest mismatch or nonce reuse), `RECEIPT: TAMPERED` exit 1
  (sidecar mismatch), usage 64, unreadable 2; `--selftest` is a hermetic suite of `[≥10]`
  cases including a flake-injection case that must read `REPLAY` and a sidecar-mismatch case that
  must read `TAMPERED`. Before: at base `c90b9de9` the repaired counters read
  `ATTEST_UNMET held=0/9` exit 1 (`base/attest-base-v3r6.txt`) and
  `DOCTRINE_UNMET held=0/5` exit 1 (`base/doctrine-base.txt`); the static-forger control is
  recorded at `build/ExecForgerControl/` and `w1/CritC1.md`, where a verdict-printing stub reads
  `ATTEST_UNMET held=[k]/9` against the repaired arms. After: at `[close commit]` the counter
  reads `ATTEST_HELD held=9/9` exit 0 — `[fill from the L1 score receipt, with its exact rev and
  sha256]`. What it closes (r50 limit (c) / lesson M2): a receipt re-dated by rewriting only its
  `run-at:` prelude now fails verification (`TAMPERED` — the sidecar covers the whole file,
  prelude included), and a receipt forged from an old body's nonce fails the ledger (`REPLAY`).
  What it does **not** claim (Q39 ceiling kept verbatim): receipts remain author-attested
  invocation records, not cryptographic temporal proof — the instrument proves the integrity of
  the record and the freshness of nonces across a ledger, not the wall-clock truth of when the
  bytes were made. A2's ≥300 s span is author-scheduled (three runs by the L1 across the round),
  the same invocation-independence class the lane has used since R50-4, and is labelled as such.
  **C2 coverage — the `invocation-attestation` entry, `DOCTRINE_HELD` (rule D51).** New
  `corpus/knowledge/invocation-attestation.md` (≥12 clause lines, each carrying a
  `receipt:<repo-path>@sha256:<64hex>` binding) records why wall clocks alone invite the M2
  forgery, the `CLOCK_MONOTONIC` semantics of the span field (S100), nonce generation from the
  kernel urandom source (S101), the two-layer binding (sidecar over the whole file, inner digest
  over the semantic fields), the nonce ledger and the kept Q39 ceiling, with the provenance trio
  (`source:` citing S100 and S101 with their man7.org URLs, `verified-at:`, `recheck:`) in its
  first lines. Before: `DOCTRINE_UNMET held=0/5` exit 1 at base (entry absent). After: at
  `[close commit]` the counter reads `DOCTRINE_HELD held=5/5` exit 0 — `[fill from the L1 score
  receipt]`. The entry is reachable at 5/5 with a house-shaped file (`source:` as line 1) and the
  two SOURCES rows inside the `## Registry` table — measured by this seat at the draft's counter
  bytes in a scratch clone.
  **Freeze repairs (pre-data, append-only, each named in `plan.md`'s `## Freeze repair
  addendum`).** `1fd8aceb` — A51 v1's JSDoc glob `round-4*/**` closed the block comment early;
  the probe could not execute (SyntaxError) and a crash read exit 1, indistinguishable from a
  legitimate UNMET. `3ed875d3` — D51's D3 read the SOURCES-row status at split-field 9 and
  used-by at 12, while the house schema (`scripts/sources-check.mjs:261-277`) puts them at 8 and
  11, so D3 and D4 were mutually exclusive and `DOCTRINE_HELD` was unpassable as frozen; found
  independently by two seats. `8c07e880` — a verdict-printing stub cleared A51 v2's A1–A4,
  falsifying the plan's declared do-nothing kill rule; v3 adds the behavioural challenge arms
  A2c and A3c. `8fd3cde1` — v3's A3c wrote a tampered receipt without its sidecar, testing the
  missing-sidecar class instead of the declared M2 forgery. `4b8da21` — no frozen arm asserted the
  declared `RECEIPT: REPLAY` class, the §C1 body still said "five checks / held=5/5", and the
  probe header claimed an exit-2 path for malformed verdict lines the code never implements; v3r5
  adds A4c and corrects the wording. `cbca45c` — a tool whose `verify` checks only sidecars
  would pass every frozen arm; A3d corrupts only the digest field of a live-generated receipt
  (sidecar recomputed) and requires `RECEIPT: REPLAY` exit 1; the check set becomes 9.
  **Wave.** Round shape: two v1 waves, 32 + 32 = 64 seats (≤128). Wave 1 `kumitate-r51-w1`
  (build, 32 seats, band 32–64): recon, source opening, instrument build in scratch, entry
  drafting and the first falsifiers of both frozen predicates — the seat mix as committed is
  executor 8, scout 5, reviewer 5, critic 4, scribe 4, mutation-tester 2, connector 1, sentinel 1,
  revenger 1, simplifier 1 (canonical attack-role mix 11/32 = 34.4%); wave 2 `kumitate-r51-w2`
  (falsify, 32 seats) dispatched only if wave 1 yields ≥32 distinct attack items — `[fill: seats
  dispatched, reports present, dead seats, residual call and round total]`.
  **Frontier.** S100 (man7.org `clock_gettime(2)`) and S101 (man7.org `getrandom(2)`) opened this
  round by scout seats — HTTP 200, bodies sha256 `7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69`
  (30379 bytes, fetched `2026-10-24T01:59:31Z`) and `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d`
  (16466 bytes, fetched `2026-10-24T01:59:28Z`), with a ≤25-word located quote each recorded in
  `corpus/lessons/round-51.md` § Gate — rows 99 → 101, both `mined`, `opened 2026-10-24`,
  `recheck 180d`, `used-by corpus/knowledge/invocation-attestation.md`; no existing row's
  `status`, `recheck` or `opened` cell changed and no row was removed — `[fill: the landed
  old→new cell text, and the census receipt at close]`. Two wording cautions the L1 must carry
  into the rows: the `clock_gettime(2)` page is titled `clock_getres(2)` and does not say
  `CLOCK_MONOTONIC` is immune to NTP; the `getrandom(2)` page contains no `CSPRNG` string and
  does not state that Node's `crypto.randomBytes` calls `getrandom`.
  **Harm at `[close commit]`.** H1 `node scripts/surface-probe.mjs --checklists` ≥ the round-open
  baseline 22/22, exit 0 (`base/baseline-gates.txt` read `CHECKLIST: 22/22 pass` /
  `VERDICT: PASS` exit 0 with `PROXY: MATCH (A=43 C=22 …)` at round open);
  H2 `cap-run` 12/12, `bind-oracle` 7/7, `counter-rerun --selftest` PASS, `round-gate --selftest`
  61/61 — `[fill: each run's receipt]`; H3 `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`
  exit 0 — `[fill]`; H4 sources census exit 0 — `[fill]`; H5 the round-50 frozen counters do not
  regress: G50 `held=8/8`, R50 `held=8/8` — `[fill]` — `[fill: the close receipt paths]`.
  Terms: A 43 → 44 (the new shipped instrument), C 22 → 23 (checklist item 23 = the
  `receipt-attest` hermetic suite), operability integer holds 9 under `f_O`, coverage successors
  unchanged; new capability row `receipt-attest` in the SCORECARD capabilities table; stanza
  re-derivation (A/C/C2 terms + `pin.receipt-attest`) rides the close commit with
  `proxy-check --strict` MATCH as the harm gate H3 — `[fill: the measured term values at the close
  commit]`. Lesson `corpus/lessons/round-51.md` (M1–M[·]).
  Open L0: the separate `kumitate-gate-pins-v1` authority question (`.ufo/l0-questions.md:115`)
  stays pending — the round-51 `pin.receipt-attest` addition rides it, as plan.md limit (d)
  records; it does not block this round.

---

## Notes for the L1 when filling this entry

- The round-50 entry's run-in paragraphs are bolded lead-ins followed by wrapped prose
  (`LOG.md:1977-2027`); the shape above mirrors them one-for-one, replacing the round-50
  sections (C1, auxiliary audit, repairs, wave, frontier, harm, terms, lesson, open L0) with the
  round-51 ones (C1 `ATTEST_HELD`, C2 `DOCTRINE_HELD`, freeze repairs, wave, frontier, harm,
  terms, lesson, open L0). Round 51 has **two** scored claims, one per axis, so the round-50
  "auxiliary frontier/closure audit" paragraph has no round-51 counterpart.
- Every `[…]` slot names the artifact it must be filled from. Do not fill any of them from the
  working tree or from this skeleton: the counters score committed bytes at a named revision.
- The lesson's M1 (`corpus/lessons/round-51.md` § Mistakes) carries the round-50-mined
  "declared-error-exit promise not implemented" class with its three measured round-50 readings
  and the A51 v1 recurrence. Remaining Mistakes rows are mined from wave findings at the close.
- `LOG.md` ends at `:2027` with the round-50 entry; this entry appends after it.
