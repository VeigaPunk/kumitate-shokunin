# Round 50 — lesson

Lane: kumitate. Round 50 (hyaku run 6, attempt 5 — attempts 1–4 ended to orchestrator loss or
dispatch error with no report; attempt 1's committed work is inherited and re-verified, not
re-scored). Base `ff40d7dcbc90aa043d7f4003976af6a99ff76642`; freeze `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3`;
pre-data implementation corrections `5b0de268` → `378b6e73` (G3 mount-table enumeration, R8 committed-report
read); post-data hardening in the guard commit. Plan `.ufo/waves/round-50/plan.md`; counters
`.ufo/waves/round-50/probe/bindguard50-probe.mjs` (rule `G50`) and `probe/repairs50-probe.mjs` (rule `R50`),
both frozen before any data seat ran. One scored claim: **C1 operability** `GUARD_HELD`; `LEDGER_HELD` is a
closure/frontier audit, not a second axis claim.

## Mistakes

- **M1 — a report filed before its last commits leaves its recorded numbers stale.** Class: report-last /
  append-only record hygiene. Evidence: `corpus/lessons/round-49-verifier-spotcheck.md` §1 and §5 — the
  round-49 report recorded C2 `15/15` at `589d25e4` and named `64b92866` as the record commit, but
  `01b70bb0`, `923a172` and `c432cc95` landed after filing and the tip measures `16/16`. Captured by: the
  non-author r49 spot-check (routed defect 1) and the R50-1 audit check R8. Fix: an append-only
  `## Erratum` on `.ufo/reports/round-49/kumitate.md`, landed in fleet commit `f50d178`, naming the
  superseded numbers and the three post-filing lane commits; report bytes above the addendum unchanged.
  Shown able to fail: R8 read `MISS exit=0` at base `ff40d7d` (no `## Erratum`) and `PASS erratum` after
  (`.ufo/waves/round-50/controls/CtlR50-base-ff40d7d-r2.txt`; close R50 receipt).

- **M2 — three receipts with identical bytes were presented as separate, time-spaced runs.** Class:
  receipt-for-claim / invocation independence. Evidence: `sha256sum` `03a258d6…` for
  `r49/L1-score-0526f898.txt`, `r49/ReRunCounter49-2.txt` and `r49/ReRunCounter49-3.txt` in `64b92866`.
  Captured by: the r49 spot-check (routed defect 4) and the frozen R4 check. Fix: three fresh invocations
  of the frozen B49 counter at `0526f898`, each with a distinct `run-at=` prelude —
  `2026-10-23T20:43:09Z`, `20:45:54Z`, `20:57:45Z` (span 876 s), sha256
  `aa293cc4951a02b19aba7bbc3a8fc5dd19918aff4766e850f696421cb2dd06f6`,
  `96a01c840f91df0bcef0a065137aa9ace8067d832808fe67b6c1b2c34fb136ee`,
  `e59ff9af0562e25a29f80d6ea9762be06feb16c78cb623277e41cfba10f368da`
  (`.ufo/waves/round-50/ReRunB49-{1,2,3}.txt`); R4 reads `files=3 distinct=3 held=3 span_s=876`.
  Limit, recorded: `CritB49CounterAttack` executed the frozen R4 block in memory over one old body with
  three rewritten preludes → `PASS … span_s=600 body_distinct=1`, so R4 accepts a prelude-only replay. The
  receipts are author-attested invocation records, not cryptographic temporal proof (QUALITY Q39's
  sentence and limit were narrowed to say exactly that).

- **M3 — a provisional count survives in prose after the row count moves.** Class: incomplete
  cross-reference sweep. Evidence: `SKILL.md:595` and `:598` said "all eleven" beside `:589`'s "Twelve are
  gates" (`corpus/lessons/round-49-verifier-spotcheck.md:144-145`). Captured by: r49 routed defect 5 and
  the frozen R5 check. Fix: both sentences rewritten to the registry count (`Twelve are gates`, runner
  `cap-run` exceptional); R5 `MISS still-eleven` at base → `PASS swept`. The count rule is now QUALITY Q41.

- **M4 — a runner invariant voided by a flag the runner itself accepts, and a provenance header that was
  never written.** Class: state-invariant hole at an API boundary / provenance-contract omission.
  Evidence: `ScoutCapRunVisibility` found `cap-run --bind /tmp /tmp` re-exposes host `/tmp` read-write
  after the runner's own `--tmpfs /tmp`; `controls/CtlExposure-base-ff40d7d.txt` shows a child writing
  `/tmp/r50-host-tmp-exposed` through that bind (`host_marker=present`); `LabratSystemd` reproduced the
  same exposure through cap-run's automatic `--bind cwd cwd` with cwd `/tmp`. H1's freeze run failed
  item 697 with `ENTRY_HEADER_REQUIRED corpus/knowledge/counter-amendment-discipline.md:1`.
  Captured by: S095 (filesystem actions apply in argument order), the exposure control, H1 item 697 and
  R50-10. Fix: `scripts/cap-run.mjs` refuses whole-root binds (`/`, `/tmp`, `/run`, `/proc`, `/sys`, `/dev`)
  after `realpath`, and refuses an implicit cwd bind resolving to those roots, while `/tmp/<subdir>` binds
  stay legal; the selftest gains the refusal cases (12/12); the entry gains its `source:`/`verified-at:`/
  `recheck:` trio and S095/S098 `used-by` cells. QUALITY Q40 states the rule. Shown able to fail: G50 read
  `GUARD_UNMET held=5/8` at base and `6/8` at the first guard commit, `8/8` only after the re-pin (M5).

- **M5 — the instrument pin went stale in the same commit that changed the instrument.** Class:
  pin-after-edit (the round-49 M2 class, self-caught this time). Evidence: at `227b9e6` (the guard commit)
  G50 read `GUARD_UNMET held=6/8` with `G6 MISS pin.cap-run=957756ad!=e1d0a79b` and
  `G7 MISS exit=1 PROXY: DRIFT (GATE_PIN_DRIFT term=pin.cap-run …)`; the commit re-pinned cap-run from its
  pre-guard bytes. Captured by: the frozen G6/G7 checks running against the committed guard. Fix: re-pin
  `pin.cap-run=e1d0a79b…` in the close commit; G50 then reads `GUARD_HELD held=8/8`. The 6/8 reading is
  retained as the failing receipt, not overwritten.

- **M6 — a seat's own class of error recurs in the L1's wiring: the wave's seat catalogue names a
  report path the runtime never writes, so two seats produced no artifact.** Class: report-path/registry
  drift. Evidence: registry `r50/swarm-registry.json` lists 64 seats; `CritRepairsForClaims` and
  `CritReporting` have no report file under `.ufo/waves/round-50/r50/` and no error text in the registry.
  Captured by: the seat-report census (`ls r50/*.md` = 65 files, of which 62 match seats and 3 are
  scribe/L1 receipts). Fix: both dead seats are named in the report with their absent artifacts; the wave
  is not padded or re-run for them. Dead seats stay dead in the evidence.

## Gate

- **Candidates.** S095 (bubblewrap 0.13.1 manual) and S098 (strace 7.2 manual) were re-opened this round;
  S099 (`proc_pid_mountinfo(5)`) was the round-49 mined admission re-checked in the closure audit. Rows
  before: 99 (`SOURCES_CHECK: CLEAN (rows=99 …)`); after: 99 — no row added or removed.
- **Admitted.** S095 `REOPEN50: HOLD` — body sha256 `2cb77df2…` matches the pinned row; the row's cited
  line anchors are mislocated (253-255 is `--sync-fd`; the corrected filesystem passages are 260-263,
  301-302, 319-320, 416-418), same body, so the row's status stays `mined` and only `used-by` changes.
  S098 `REOPEN50: HOLD` — body sha256 `c16859e0…`, alignment and unfinished/resumed passages agree
  (`.ufo/waves/round-50/r50/ReopenS098.md`). S099 retained: tier A, `mined`, `opened 2026-10-23`,
  `recheck: on-release`, used-by unchanged.
- **Rejected.** None this round. (The B49/R4 replay control is a receipt-provenance limit, not a rejected
  source.)
- **Spot-check.** The round-49 non-author spot-check (`corpus/lessons/round-49-verifier-spotcheck.md` §3)
  agrees with S099's admission, the doctored-receipt rejection and the K4–K6 rejects, and disagrees with
  the r49 "discernment — improved" verdict because the lesson then had no `## Gate` ledger; R50-2 appended
  that ledger to `corpus/lessons/round-49.md`. This round's own non-author closure is the driver's duty,
  not this file's; this lesson claims no spot-check verdict for round 50.

## Frontier — SOURCES

Cells changed this round (old→new; append-only rule permits exactly `status`, `recheck`, `used-by`):

- **S095** `used-by`: `scripts/cap-run.mjs, scripts/cap-spawn.mjs, corpus/lessons/round-47.md` →
  `… , corpus/knowledge/counter-amendment-discipline.md`. `status` `mined` and `recheck` `on-release`
  unchanged; `opened` `2026-10-23` unchanged.
- **S098** `used-by`: `.ufo/waves/round-48/probe/caproute48-probe.mjs, corpus/lessons/round-48.md` →
  `… , corpus/knowledge/counter-amendment-discipline.md`. `status`/`recheck`/`opened` unchanged.
- **S099** unchanged (already lists `scripts/bind-oracle.mjs`, the knowledge entry and the r49 lesson).

Sourced claim: C1's guard rests on S095 (argument-order filesystem semantics — the reason a later
`--bind` wins over the earlier `--tmpfs`), cited in the cap-run header and in QUALITY Q40.
