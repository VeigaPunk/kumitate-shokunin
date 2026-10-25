# C1 stream/history provenance counterexample

## Evidence

Committed round-61 tree at `f351c520bfc4ce193a61145bdfecbcf1cb20db01`:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only f351c520bfc4ce193a61145bdfecbcf1cb20db01 -- .ufo/waves/round-61 | rg -i 'stream|history|log|stderr|stdout|err'
```

Output contained only two prose paths, `build/ScribeErratum/erratum.md` and `w1/ScribeErratum.md`; no stream, history, stderr/stdout, or log records. More strictly, filtering committed paths for `\.(stream\.jsonl|err|log)$` yielded no matches (rg exit 1). The committed r61 wave tree has 162 paths.

The same explicit committed-tree inventory for round 60 yielded 66 `.stream.jsonl`, `.err`, or `.log` files, including per-seat `w1/*.stream.jsonl`, per-seat `w1/*.err`, and `w1-launcher.log`. Thus the evidence format existed in the immediately prior round but was not preserved in committed round-61 wave artifacts.

The exact committed C1 source `.ufo/waves/round-61/probe/dispatch61-probe.mjs` confirms it reads no stream/history source: P1 runs a selftest; P2 invokes the live worktree gate and checks revision tree filenames/report count; P3 reads revision SCORECARD bytes; P4 reads the worktree `close/dispatch61-tip.txt` (lines 10–29). It has no session-id lookup, stream file access, or history resolution. The spotcheck explicitly says the closure did not execute either frozen probe (round-61-verifier-spotcheck.md lines 26–32, 50–53).

## Counterexample and impact

C1's observed P2 can establish that a committed tree contains 32 markdown reports and the named records, and that a current gate run sees a clean progress file. It cannot establish that real tasks executed: a fabricated progress TSV and fabricated report files can satisfy these inputs without any execution trace. No committed round-61 stream/log/history artifacts exist to independently bind those records to sessions. Round 60's per-seat streams demonstrate a feasible evidence source, but are not proof about r61 execution.

Impacted axis: operability / C1 provenance (P2). This is a falsification of the claimed execution-evidence strength, not proof that r61 tasks did not execute.

## Smallest safe correction

Make P2 consume and validate revision-pinned, complete per-seat stream/history evidence tied to resolvable session identities, rather than only progress/report filenames; commit those records with the wave. Keep the claim unmet when that independent evidence is absent. Evidence pointers: committed `dispatch61-probe.mjs` lines 10–29; committed `round-61-verifier-spotcheck.md` lines 26–32 and 218–223; committed r60 path inventory above.
