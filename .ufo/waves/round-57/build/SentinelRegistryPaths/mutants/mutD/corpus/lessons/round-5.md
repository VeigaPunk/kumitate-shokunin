# Lessons — round 5

Evidence: LOG.md round-5 entry; commit `round-5`; report
`/home/vgpnk/projects/shokunin/.ufo/reports/round-5/kumitate.md`.

## What worked

1. **Same split worked again.** Two read-only scouts on disjoint slices
   (launcher main() spine; dispatcher front half) returned cited maps in
   ~8 and ~16 min. Parent verified the riskiest claims against source
   before landing — cheap and worth it: the membrane-seal `write` defect
   only surfaced because the scout's own claim ("the `write` literal is
   consumed as a subcommand token") was challenged with a clap repro.
2. **main() reads as a gate stack, not a script.** Every ordered step
   names its refusal code at the call site; the file is grep-linear once
   you know the vocabulary (`refuse(`, `assert*`, `writeDispatchSnapshot`).
   The deferred-assignment pattern (author+hash all, flush only after the
   resume roster gate) is the discipline that makes resume pairings safe.

## Traps

3. **Stub symmetry hides cross-boundary breakage.** The membrane-seal
   `write` token survived because BOTH test sides stubbed: JS pins the
   argv shape against a fake runtime, the Rust contract test omits `write`.
   A launcher's shell-out contract is only proven when at least one test
   exercises the REAL callee argv parser. When documenting a shell
   boundary, always locate the test that runs the real binary — if none
   exists, verify the argv against the actual clap/arg shape yourself.
4. **A function can "succeed" while its caller keeps running.**
   `handOffToSightingWall` sets `exitCode = 0` and returns; main()
   continues the full in-process launch. Read past the early-return
   pattern — absence of `process.exit`/`return` in the caller is the
   signal. Here the O_EXCL dispatch snapshot is the designed arbiter.
5. **Named-verb config keys are a trap.** `autoRegisterInvokedNativeTrial`
   is a boolean, not a function. Verb-sounding identifiers in config
   positions need an actual type check before narrating behavior.
6. **Rollback is surgical, not general.** Only the dispatch snapshot is
   ever rolled back (drift gate, domain halt, probe throw) — because it is
   the ONLY artifact that claims a wave was dispatched. Inputs,
   assignments, launch.json, epoch receipt all persist through refusal;
   the next fresh launch resets them. Never claim "the launcher cleans up
   on failure" — it doesn't, and the asymmetry is the invariant.

## Gaps (remainder)

- `crates/ufo-core-runtime` support families: `native_seats`,
  `native_admission_text` JS-parity coercions, `lane_overlay`, `lease`,
  `live`, `cost_ledger` internals, `l3_swarm`.
- the-tick ground-handler ops beyond `path_ping`.
- fleet-dispatcher settle/reconcile tail (recordDispatchResult verbs,
  auto-reap, manifest reconcile).
- `ufo-sighting-lib` internals beyond the native-trial chain
  (launch-verb/spawn-pane/pane-run detail, wall schema).
- **Cross-domain report filed:** membrane-seal `write` argv defect —
  fix belongs in ufo-fsd-alpha.
