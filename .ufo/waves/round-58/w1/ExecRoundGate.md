# ExecRoundGate — round 58 / w1

- Role: executor
- Axes: operability, coverage
- Lane revision observed: `6affb9ebde37b7d663658f1959d64f0f0b68f480` (R1; HEAD was not moved)
- Contract: `kumitate-round-gate-v1`

**Scoped result: the expected base-red residual was not reproduced; one additional warning was observed.** The final assigned run exited `0` with `CLEAN`, `errors=0`, and `warnings=1`. It emitted `SCORECARD_PLAN_MISSING`, not `COMMIT_CITED_UNRESOLVED`. The initial assigned run had the same output.

## Assigned command — final observed run

```bash
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/round-gate.mjs --round 58 --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin
```

Complete stdout:

```text
ROUND_GATE  warning  SCORECARD_PLAN_MISSING  ## Planned names no round later than 58
ROUND_GATE: CLEAN (round=58 lane=kumitate checks=10 errors=0 warnings=1)
```

Stderr was empty; exit code was `0`. The independent `--json` run also exited `0` with empty stderr. It reported ten checks, one finding (`SCORECARD_PLAN_MISSING`), and `citations.checked=4` with empty `external`, `unresolved`, `notAncestor`, and `unverifiable` arrays. The other nine checks passed.

## Findings

### F1 — the witness residual is absent, and the live report's round-gate-red statements are not corroborated

The live fleet report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-58/kumitate.md` names the r57 synthetic witness as `` `1cd6d667…` `` at lines 131 and 255. Those are the only backticked spans containing `1cd6d667`; neither matches the gate's citation-token regex `^[0-9a-f]{7,40}$` (`scripts/round-gate.mjs:326-335`). The parser inspection found exactly these four accepted tokens: `50548ae5b4a47bb8d8cdc62212ec0648aa3776ee`, `c49f2a8dc1e6e5e4341e15ac279185aab7e0be37`, `6affb9ebde37b7d663658f1959d64f0f0b68f480`, and `c49f2a8d`.

The full synthetic revision remains absent from the lane: `git cat-file -e '1cd6d667e20075fd2e77e6e655bc755f95e3d940^{commit}'` exited `128` with `fatal: Not a valid object name 1cd6d667e20075fd2e77e6e655bc755f95e3d940^{commit}`.

A scratch-only positive control replaced both elided spans with that full revision in a copy under this seat's build directory. Running the same gate against that scratch reports directory produced:

```text
ROUND_GATE  error  COMMIT_CITED_UNRESOLVED  cited=5 unresolved=1 [1cd6d667e20075fd2e77e6e655bc755f95e3d940]
ROUND_GATE  warning  SCORECARD_PLAN_MISSING  ## Planned names no round later than 58
ROUND_GATE: DRIFT (round=58 lane=kumitate checks=10 errors=1 warnings=1)
```

That control exited `1` with empty stderr. Thus the expected detector fires for a token-shaped full-hash citation; the live report's elision suppresses citation extraction. This is consistent with the repair described in `.ufo/waves/round-57/w1/CriticNoHarm.md:59-68`. The live round-58 report's statements at lines 130-133 and 254-256 that round-gate still flags `COMMIT_CITED_UNRESOLVED` are not corroborated by this assigned round-58 invocation. Route them to the report owner: if they describe this invocation, they are stale; this seat did not assess a different wrapper or round. No fleet report bytes were edited.

### F2 — additional warning outside the expected residual class

`SCORECARD_PLAN_MISSING` is a real additional gate finding: `## Planned` exists at `SCORECARD.md:518`, but the parser inspection found no mention of a round later than 58 (`futureRounds=[]`). In this non-strict assigned invocation it remains a warning: the verdict is `CLEAN` and exit is `0`, not a close-blocking error by itself. No other finding was emitted.

## Revision binding and limits

`git rev-parse HEAD` printed R1 immediately before the final run. A path-limited `git diff --exit-code 6affb9ebde37b7d663658f1959d64f0f0b68f480 -- scripts/round-gate.mjs SCORECARD.md LOG.md` exited `0` with both streams empty. The gate has no revision argument: it reads the live fleet report and lane files and checks citations against lane HEAD. R1 therefore binds the lane-side script, SCORECARD, LOG, and HEAD observed here; it does not pin the live fleet-report input. The scratch control is not a live-tree result. This seat makes no ATTEST58, DOCTRINE58, or round-admission verdict.

## Evidence and write boundary

Full commands, separate stdout/stderr captures, and exit-code files are under `.ufo/waves/round-58/build/ExecRoundGate/`. Primary records are `round-gate-final.*` and the initial `round-gate.*`; structured corroboration is `round-gate-json.*`. Parser/SCORECARD inspection is `inspect-gate-inputs.*`; R1 binding records are `final-head.*`, `head.*`, `r1-object.*`, `r1-ancestry.*`, and `r1-input-diff.*`. Witness probes are `witness-lane-object.*` and `witness-full-lane-object.*`; the isolated control is `make-witness-full-report.*`, `round-gate-full-witness-control.*`, and `full-witness-reports/`. Auxiliary scripts are retained beside those records.

No production file, ledger, corpus file, pin, jj state, or Git index was changed. No commit, push, install, pacman transaction, seat dispatch, or mutating git/jj command occurred.

Report: .ufo/waves/round-58/w1/ExecRoundGate.md
