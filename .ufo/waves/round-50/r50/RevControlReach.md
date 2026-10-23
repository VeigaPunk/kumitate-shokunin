# RevControlReach — frozen-counter do-nothing-control review (round 50)

Seat: reviewer · Item: RevControlReach · Verdict: **two findings, no all-clear**
Answers the item's two questions for all 16 checks (G1–G8, R1–R8): can the frozen
counters print HELD at the freeze/base revision without the claimed work, and does
anything already committed make a check vacuously true?

## Method (what was run)

- Read both frozen probes in full: `probe/bindguard50-probe.mjs`, `probe/repairs50-probe.mjs`
  (committed bytes at HEAD).
- Ran both counters myself at three revisions:
  - `ff40d7d` (plan "Before" control rev): `GUARD_UNMET held=5/8` (G2/G6/G7 miss),
    `LEDGER_UNMET held=2/8` (R1–R6 miss, R7+R8 pass).
  - `378b6e7` ("freeze guard and closure corrections" commit): **`GUARD_HELD held=8/8`**.
  - `HEAD` `6927903` ("record wave seat assignments"): **`GUARD_HELD held=8/8`**,
    `LEDGER_UNMET held=3/8` (R5+R7+R8 pass).
- Diffed the freeze commits (`git show --stat 5b0de26 378b6e7 6927903`, per-file diffs
  for cap-run/SCORECARD/SKILL/README/SOURCES/knowledge/proxy-check).
- Read recorded controls `controls/CtlG50-base-*.txt`, `CtlR50-base-*.txt`,
  `CtlExposure-base-ff40d7d.txt`, `H1-freeze-5b0de268.txt`; checked fleet master history
  (`f50d178 round-50: kumitate report erratum`).

## Finding 1 — HIGH: C1's do-nothing control is already green at the freeze revision

`GUARD_HELD` scores **8/8 at `378b6e7` and at HEAD** — the freeze-corrections commit
itself shipped the entire C1 repair payload, before any data-seat result ran:

| Repair (plan) | Committed in `378b6e7` |
|---|---|
| R50-6 cap-run /tmp guard | `scripts/cap-run.mjs`: `bad()` gains `p === '/tmp'` (whole mount point, post-realpath), message lists `/tmp`; selftest usage-arm `--bind /tmp` added |
| R50-7 pin.bind-oracle | `SCORECARD.md`: `pin.bind-oracle=c3929a97…` plus family re-pin (`pin.cap-run=64fafb42…` == extracted cap-run sha; `pin.proxy-check=0d5c00c2…`); `scripts/proxy-check.mjs` GATE_PINS entry added |
| R50-9 proxy drift | `corpus/README.md` +2 rows (verifier-spotcheck notes); G7 now reads `PROXY: MATCH (A=43 … C2=112/112)` |
| R50-10 sources header | `corpus/knowledge/counter-amendment-discipline.md` gains `source:`/`verified-at:`/`recheck:` trio; `corpus/SOURCES.md` S095/S098/S099 rows updated |
| R50-5 all-eleven sweep | `SKILL.md` `all eleven`→`all twelve` (both target sentences) |

Evidence: `node .ufo/waves/round-50/probe/bindguard50-probe.mjs <lane> HEAD` →
`BINDGUARD50: GUARD_HELD held=8/8 … exit=0`; same at `378b6e7`. The red control only
holds at `ff40d7d`, which predates the freeze commits; the first revision at which a
score can be read is already green.

**Answer to the item's question (C1): YES — HELD prints at the freeze revision without
any seat work.** The counter scores committed bytes and cannot distinguish
"seats implemented the guard" from "the freeze commit implemented it". The plan's
"Pre-data counter implementation amendment" section documents only probe-side fixes
(G3 mount-table enumeration, `l49` blob read); it does not disclose that the cap-run
guard, pins, README rows, sources header and SKILL sweep were pre-landed in the same
commit that froze the plan. This is a claim-mechanics finding, not a verdict on the
guard bytes (correctness is reviewed by RevGuardDiff/MutGuard/SentTmpPath).

## Finding 2 — MEDIUM: R7/R8 are live-state checks; the counter is not a pure function of rev

- `R7` (sources-census validate) runs against the **live fleet root** and passes at
  every revision while the fleet registry is healthy (passes at `ff40d7d` and HEAD).
- `R8` reads **live fleet master** (`git -C <fleet> show master:…`). Proof of
  rev-invariance: the recorded base control `CtlR50-base-ff40d7d-r2.txt` scores R8 MISS;
  after fleet commit `f50d178` landed the erratum, **the same lane rev `ff40d7d` now
  scores R8 PASS** (`LEDGER_UNMET held=2/8` today vs `1/8` in the recorded control).

So two of eight C2 points are awarded by fleet-side state, independent of `<rev>`.
This matches the plan's documented limits (d); it is recorded here as measured, with
the concrete drift: a fixed rev's LEDGER score changes over time. The remaining red
checks at HEAD are R1 (no `## Gate` in round-49.md), R2/R3 (re-open receipts not yet
committed — untracked drafts exist but probes correctly read committed bytes only),
R4 (one committed `ReRunB49-1.txt`; ≥3 needed, current run-at span ~166 s <300 s), R6
(round-50.md absent).

## Per-check dependency walk

C1 (`GUARD_HELD`, needs 8/8):
- **G1** file-existence anchor — true for every rev with cap-run; not a mover (intended anchor).
- **G2** behavioral (exit 64 + `CAP_RUN: USAGE` last line) — NOT vacuous: red at `ff40d7d`
  (`/tmp:exit=0;/tmp/:exit=0;/tmp/.:exit=0`), green only with refusal bytes in cap-run.
- **G3** regression guard — passes at base and HEAD; not vacuous (would catch an over-broad refusal).
- **G4/G5** suite passes — pass at base already; regression guards, not movers.
- **G6** exact-hash binding (5 pin lines vs extracted sha256) — NOT vacuous: red at base
  (`pin.bind-oracle=absent`), green at HEAD because the freeze commit added+re-pinned.
- **G7** `proxy-check --self <extract> --strict` — NOT vacuous: red at base
  (`PROXY: DRIFT` A=38 vs computed 41), green at HEAD (A=43 MATCH) after freeze's README rows.
- **G8** isolation regression guard — passes at base and HEAD.

C2 (`LEDGER_HELD`, needs 8/8):
- **R1** `## Gate` section containing the four words — not vacuous (absent at base/HEAD);
  granularity limit: plain case-sensitive `includes` of the four words anywhere in the
  section, so a degenerate stub ("candidates: none / admitted: none / rejected: none /
  spot-check: none") would pass — acceptable for an audit, recorded.
- **R2/R3** receipt presence + first-line regex + `sha256=<hex>` substring — not vacuous;
  laxity: the hash is a body substring, so it can appear anywhere in the file (e.g. a
  comment), not necessarily as the verified-source hash; forgeable surface per plan limit (c).
- **R4** ≥3 `ReRunB49-*.txt` at round-50 root, each `run-at=<ISO>` + `ORACLE_HELD held=6/6`,
  sha256-distinct, span ≥300 s — partial (1 committed file); uniqueness is full-bytes hash
  and spacing is parseable `run-at` only (documented limit (c)); nested `seats-*` files do
  not match `[^/]*` filter.
- **R5** already green via freeze sweep; granularity: `!includes('all eleven') && /Twelve/.test`
  — `Twelve` is independently present at SKILL.md:589, so R5 reduces to phrase-absence and
  cannot prove the two target sentences say "Twelve"; an incomplete sweep to "eleven"
  (without "all") would also pass. Acceptable limit, recorded.
- **R6** round-50.md exists with `## Mistakes` + `## Gate` — not vacuous; absent now.
- **R7/R8** live-state — see Finding 2.

## Verification gaps / residual risk

- C1's green-at-freeze finding rests on the counter reading committed bytes via `git
  archive` (no working-tree leakage); `G7` additionally points `UFO_SRC` at the live
  origin checkout (read-only) — consistent with intent.
- Nothing here checks that the implemented guard actually prevents the bwrap mount (exit
  64 semantics vs mount effect) — that is G2's boundary; G3/G8 nearby regression guards.
  The adversarial/forgery surface is covered by RevPredicateAttack, SentForge,
  SentTmpPath, MutGuard, MutSelftest.
- Plan-text vs committed-bytes disclosure gap (license 1) is the round's most material
  finding; recommend the L1 record the freeze pre-landing explicitly in the round report.

## Installations
None (no tooling installed; probes run with system `node` v24.21.0).
