# kumitate round 50 — frozen plan

Lane `kumitate-shokunin` (master). Frozen before any data seat runs, same commit as the claim counter and auxiliary frontier audit.
Axes owned: operability + coverage (orchestration & tooling). This round's declared claim: **one**.

## Context — what this round repairs first

The r49 non-author closure (`corpus/lessons/round-49-verifier-spotcheck.md`) routed six defects; the
orchestrator's dispatch, a live proxy recheck and H1's freeze measurement add four more work items.
C1 is the round's one scored axis claim; the remaining repairs are closure/frontier conformance, not
additional axis claims.

1. R50-1 — r49 report stale vs its last four commits (`01b70bb0`, `923a172`, `c432cc95`): C2 reads
   15/15 where the tip is 16/16. Fix: append-only `## Erratum` on
   `.ufo/reports/round-49/kumitate.md` (fleet repo, `fleet-commit.sh`).
2. R50-2 — `corpus/lessons/round-49.md` has no `## Gate` section: append the
   candidates/admits/rejects/spot-check ledger as a round-50 addendum inside that file.
3. R50-3 — S095/S098 re-opens have no committed receipt: land both re-open artifacts under
   `.ufo/waves/round-50/r50/` (seat-produced or L1-produced; no-pointer-no-claim).
4. R50-4 — the three C1 B49 receipts are byte-identical: produce three genuinely spaced runs of the
   frozen B49 counter, each receipt carrying a distinct `run-at=` prelude (sha256-distinct, ≥300 s
   span).
5. R50-5 — `SKILL.md:595`/:598 `all eleven` vs `Twelve`: sweep both sentences.
6. R50-6 — seat finding (ScoutCapRunVisibility): `--bind /tmp /tmp` after `--tmpfs /tmp` re-exposes
   host `/tmp` read-write — a cap-run guard (refusal list) plus pin coverage.
7. R50-7 — `pin.bind-oracle` deferred from r49 (M2): add the pin + `GATE_PINS` entry and re-pin the
   family (`pin.cap-run`, `pin.proxy-check` change with their files).
8. R50-8 — wave-spec hygiene: r49's `taskCall` was a bare 64-array with `context` in the spec;
   keep `context`+`tasks` together in the r50 taskCall file.
9. R50-9 — live drift found at round open (`node scripts/proxy-check.mjs --strict` → `DRIFT` exit 1):
   stanza `A=38` vs computed 41, `C2=108/108` vs computed 110/112 (two verifier-spotcheck notes
   unrowed in `corpus/README.md`), `AXES_DRIFT coverage row=10 derived=9`, `PIN_UNPINNED
   bind-oracle`. Repair: README rows for the two integrator files, stanza re-derivation, pins.
10. R50-10 — H1 freeze receipt `controls/H1-freeze-5b0de268.txt` reads 20/22; item 697 reports
    `ENTRY_HEADER_REQUIRED` for `corpus/knowledge/counter-amendment-discipline.md`. Repair its
    provenance trio and the S095/S098 `used-by` paths; retain the existing source rows.

## C1 — operability: the `cap-run` tmpfs-bind guard + instrument pinning

`scripts/cap-run.mjs` mounts `--tmpfs /tmp` then appends caller `--bind`s in argument order (S095:
bwrap applies mounts in argument order), so `--bind /tmp` unmasks host `/tmp` read-write —
the sandbox's own advertised property ("and `/run` are fresh tmpfs mounts") silently voided by a
flag the runner itself accepts. The fix adds `/tmp` to the refusal list (after `realpath`, so
symlink aliases are covered), keeps subdirectory binds legal, and adds a usage-arm selftest case.
`pin.bind-oracle` enters `kumitate-gate-pins-v1` (r49 M2) with the family re-pin.

**Predicate, label `GUARD_HELD`** — `probe/bindguard50-probe.mjs` (this directory), eight checks over
the committed bytes of `<rev>` (`git archive`): G1 cap-run present; G2 every D in {/tmp, /tmp/, /tmp/.,
/, /run, /proc/self, rel, nonexistent} exits 64 `CAP_RUN: USAGE`; G3 a legitimate `--bind` under /tmp
is read-write AND the child's /tmp is still tmpfs (a child write does not appear on the host); G4
`cap-run --selftest` `VERDICT: PASS` exit 0; G5 `bind-oracle --selftest` `VERDICT: PASS` exit 0;
G6 `kumitate-gate-pins-v1` pins `pin.bind-oracle`+`pin.cap-run`+`pin.cap-spawn`+`pin.proxy-check`+
`pin.counter-rerun` at the extracted sha256; G7 `proxy-check --self <rev-extract> --strict` →
`PROXY: MATCH` exit 0; G8 no-bind child /tmp write leaves no host file. `GUARD_HELD` = held=8/8 exit 0;
else `GUARD_UNMET held=k/8` exit 1; crash/unreadable = exit 2.

- Counting command: `node .ufo/waves/round-50/probe/bindguard50-probe.mjs <lane> <rev>`
- Before (control): at `ff40d7d` → expected `GUARD_UNMET` (G2 miss on /tmp triple, G6 miss on
  pin.bind-oracle, G7 DRIFT); exposure evidence `controls/CtlExposure-base-ff40d7d.txt` (a child
  writing /tmp/<nonce> through `--bind /tmp` leaves a host file — the bug in one file).
- After: `GUARD_HELD held=8/8` at the C1 commit.

## Frontier audit (not a second claim): r49 closure repairs land verifiably

The routed ledger repairs (R50-1/2/3/4/5/8 in this lane, R50-1's erratum on the fleet repo) are a
round-closure conformance audit, not an axis claim. The lane's claimed move is C1 (operability); this
audit records whether the prior-round defects are repaired, without moving the retired `coverage` axis.

**Predicate, label `LEDGER_HELD`** — `probe/repairs50-probe.mjs` (this directory), eight checks: R1
`corpus/lessons/round-49.md` carries `## Gate` with candidates/admitted/rejected/spot-check; R2/R3 the
two re-open artifacts exist with `REOPEN50: HOLD|DRIFT` first lines and the recorded body sha256s
(S095 `2cb77df2…`, S098 `c16859e0…`); R4 ≥3 `ReRunB49-*.txt` under `.ufo/waves/round-50/`, each
`run-at=<ISO>` + `ORACLE_HELD held=6/6`, sha256-distinct, ≥300 s span; R5 no `all eleven` in SKILL.md
(and `Twelve` still present); R6 `corpus/lessons/round-50.md` carries `## Mistakes` + `## Gate`; R7
fleet sources-census `validate kumitate` exit 0; R8 `git -C <fleet> show
master:.ufo/reports/round-49/kumitate.md` contains `## Erratum`. `LEDGER_HELD` = held=8/8 exit 0.

- Counting command: `node .ufo/waves/round-50/probe/repairs50-probe.mjs <lane> <rev> --fleet
  /home/vgpnk/Projects/shokunin`
- Before (control): at `ff40d7d` → `LEDGER_UNMET` (R1/R2/R3/R4/R5/R6/R8 all miss; R7 passes).
- After (conformance audit): `LEDGER_HELD held=8/8` at the close commit; no axis score attaches to this
  auxiliary audit.

## Harm rules (declared before data)

- H1 `node scripts/surface-probe.mjs --checklists` item-level pass count at close ≥ the freeze
  baseline **20/22** (`controls/H1-freeze-5b0de268.txt`: proxy recompute and sources-registry gate
  are the two named red items).
- H2 `cap-run --selftest`, `bind-oracle --selftest`, `counter-rerun --selftest` all PASS at close.
- H3 `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH` exit 0 at close (the R50-9 repair).
- H4 `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` exit 0.
- H5 `node scripts/round-gate.mjs --selftest` PASS at close (a gate the guard could starve of /tmp
  writes — it runs under cap-run sites).

## Limits, recorded not hidden

(a) The `/tmp` guard refuses the *whole* sandbox-managed mount point only; binds under `/tmp` keep
working (G3 asserts it). Host `/etc`, `/usr` etc. remain bindable — the r48 registry already treats
`--bind /etc /etc` as an EXTRA-arm scenario, not a refusal; widening the refusal list is not claimed.
(b) The G6 pin check binds declared sha256 to extracted bytes; the pin's meaning is only as good as
proxy-check's GATE_PINS map, which a seat reviews this round.
(c) R4's spacing proof is preamble+distinct-bytes, not a temporal proof — a forged clock line inside a
receipt is out of scope (same class as r49's output-text-oracle limit).
(d) R8 reads the fleet `master` ref live at probe time; the erratum lands before the frontier-audit run —
ordering recorded in the report.
(e) The wave seats are read-only on the lane repo; L1 integrates. Seat findings that are wrong are
named in the report, not silently dropped.

## Wave shape

One **v2** wave `kumitate-r50`, 64 seats under `scripts/hyaku/ufo-wave-policy-v2.json` (band 64–128),
attack 27/64 = 42.2% (reviewer 9, mutation-tester 8, critic 6, sentinel 4) — spec
`.ufo/waves/round-50/r50-spec.json`, taskCall `.ufo/waves/round-50/r50-taskcall.json` (context+tasks
together, R50-8). §3 L2 floor met inside the wave (≥8 roles incl. scout/connector/executor/scribe/
reviewer/critic). Planner seat held by the L1 (orchestrator ruling); a bounded planning data-walk rides
`ScoutGuardSweep`.

## Pre-data counter implementation amendment (no seat data had run)

Initial base controls at `ff40d7d` exposed two implementation-only defects before dispatch: G50 read
the first stacked `/tmp` mount (host XFS) rather than checking that a tmpfs mount existed at `/tmp`
(`CtlG50-base-ff40d7d.txt`; the live mount table shows both XFS and tmpfs rows); R50 threw
`ReferenceError: l49 is not defined` before scoring (`CtlR50-base-ff40d7d.txt`). The frozen predicates,
check count, labels and thresholds are unchanged. This amendment fixes only the G3 mount-table
enumeration (any exact `/tmp` row of type `tmpfs`), cleans its scratch bind directory, and restores the
missing `l49` blob read. Both base controls are re-run against the corrected bytes before wave data;
the initial receipts remain as the red/error trail, not scores.
The corrected G50 re-score read the planned base predicate `GUARD_UNMET held=5/8` (G2, G6 and G7
miss; G3 now confirms the stacked tmpfs mount). R50's next attempted control exposed another
implementation-only omission (`rep` was used but its `git show master:` read had not been assigned);
the R8 committed-report read is restored before the final pre-data control rerun. These implementation
errors are retained in their initial receipts and are not scores.

The round-open H1 run is also a conformance signal: its `20/22` baseline has exactly two named red
items (`proxy-check --strict` drift and `sources-check` missing the counter entry header). R50-10
repairs the existing entry's source trio, adds its referenced S095/S098 rows to `used-by`, and logs
those permitted old→new field edits. No claim predicate or threshold changes.

