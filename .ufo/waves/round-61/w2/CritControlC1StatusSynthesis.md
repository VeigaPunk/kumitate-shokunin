# CritControlC1StatusSynthesis — C1 subcase 7: settled-status → exit mapping

## Scope and evidence

Reproduced only the status-mapping case, using the committed round-61 `w1/swarm-registry.json` as the 32-seat fixture and the committed pinned gate/generator scripts. All generated fixture data is under `/tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/`; no lane files were changed.

Relevant source: `scripts/make-dispatch-actual.mjs:105-119` maps status `completed` and `settled` to exit 0, `failed` to 1, timeout to 124, and canceled/aborted to -9. `:197-207` parses only status/state and optional explicit exit aliases, checks known status/exit contradictions, then uses `explicitExit ?? statusExit`; it does not inspect `outcome` or `error`. The committed `.ufo/waves/round-61/close/w1-results.json` has 32 `completed` entries with agent IDs and no numeric exit field. Its schema/source identifies these as OMP task statuses. The consumer test `scripts/make-dispatch-actual.mjs:533-535` tests `settled` only paired with explicit exit 0; it does not test status-only `settled` against an unsuccessful outcome.

## Reproduction 1 — status-only `settled` plus explicit unsuccessful marker

Fixture: 32 registry members copied from committed w1; one results entry has `status:"settled"`, `outcome:"rejected"`, and `error:"synthetic failure marker; no numeric exit supplied"`; remaining entries are `completed`. Each has a non-empty scratch report. The generator's output is then checked by the committed dispatch-evidence gate.

Command (run from the lane repo; absolute paths shown):

```sh
node scripts/make-dispatch-actual.mjs --registry /tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1/swarm-registry.json --results /tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/results.json --reports /tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1 --root /tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map --round 61 --wave w1 --gate /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/dispatch-evidence.mjs
```

Observed output:

```text
MAKE_DISPATCH_ACTUAL: CLEAN out=/tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1 seats=32 sessions=32 exit0=32 reports=32 dead=0 members=32 gate=0
DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)
```

Exit: **0**. The resulting progress row for the status-only `settled` seat is assigned `exit=0`; the rejected/error fields do not affect the derived record or the gate.

## Contrast — explicit failed status

Same scratch registry and reports, with the first result changed to `status:"failed"` and the rest `completed`:

```sh
node scripts/make-dispatch-actual.mjs --registry /tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1/swarm-registry.json --results /tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/results-failed.json --reports /tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1 --root /tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map --round 61 --wave w1 --gate /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/dispatch-evidence.mjs
```

Observed output:

```text
MAKE_DISPATCH_ACTUAL: DRIFT out=/tmp/kumitate-r61/CritControlC1StatusSynthesis/status-map/.ufo/waves/round-61/w1 seats=32 sessions=32 exit0=31 reports=32 dead=1 members=32 gate=1
DISPATCH_EVIDENCE: DRIFT (seats=32 sessions=32 exit0=31 reports=32 dead=1)
FINDING DEAD_SEAT_UNCREDITED:ExecTipReceipts
```

Exit: **1**. Thus the positive result specifically depends on mapping status-only `settled` to zero and ignoring the contradictory semantic marker; explicit `failed` is not miscredited.

## Verdict

**This case demonstrates a reproducible status-to-exit translation hole, but does not independently falsify frozen P61.** P61 checks the emitted gate verdict and committed evidence; it does not require `make-dispatch-actual.mjs` to be invoked, nor does its predicate validate the source results envelope or define `settled` as failure. The scratch `outcome:"rejected"` is an intentionally adversarial, unrecognized extra field, not proof that the actual OMP results contract permits that combination. The checked-in round-61 results use `completed`, not `settled`, and contain no failure evidence. Therefore the reproduction shows the translator can turn an adversarial status-only row into CLEAN, but does not establish that the measured revision’s P61 inputs were false or that actual-session results can produce that combination.

For the same reason, this is a concrete weakness in the evidence-producing path, not proof of successful/failed actual-session identity. Independent P61 falsification would require a committed/accepted source result identifying a non-successful seat as `settled` (or an authoritative contract defining `settled` as non-success), then showing the predicate accepts the derived CLEAN evidence.

## Verification gaps

- Did not run the full `dispatch61-probe.mjs`; only reproduced this named mapping case through the generator and gate.
- No authoritative evidence found here that OMP emits `settled` for rejected/failed tasks; round-61 committed results report `completed` for all 32.
- No tool installs or updates.
