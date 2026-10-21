ATTACK Check47 measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf ids=1 agreed=1 refuted=0 unverified=0

OBS route-probe-cluster#84 agree | `if (argv.length === 1 && (argv[0] === "--help" || argv[0] === "-h")) {` | Pinned source line 108 is the exact `--help`/`-h` condition; lines 109–110 print usage and exit 0, matching the note sentence at frozen note lines 108–109. The pair is not a generic-token or wrong-symbol match; no correction.

Evidence / verification:
- Frozen note command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show c938c068f4dbf356c0884c2121bbfe087fbe3caf:corpus/knowledge/route-probe-cluster.md`; readback: “`main` (`:1157`) over a single argv walk, `parseArgs` (`:107`); `usage` prints to stderr and exits 2 (`:101`) while `--help`/`-h` exits 0.” (note lines 108–109).
- Pinned source command: `git -C /fast/scratch/kumitate-r36/src show 31c465f15669f744848bd9f5d56191c5085670f7:scripts/probe-ufo-route-health.mjs`; observed `wc -l`: `1188`; pinned source lines 107–110 show `parseArgs`, the quoted condition, `console.log(PROBE_USAGE)`, and `process.exit(0)`. Line 1158 confirms `main` calls `parseArgs(process.argv.slice(2))`.
- Pinned revision check: `git -C /fast/scratch/kumitate-r36/src rev-parse 31c465f15669f744848bd9f5d56191c5085670f7^{commit}` → `31c465f15669f744848bd9f5d56191c5085670f7`.
- `lsp` is unavailable in this tool session: `read xd://lsp` returned “No such tool: xd://lsp”; therefore no LSP status/references/definition/diagnostics were available. This judgment uses direct reads of immutable committed source, not grep or a gate run. No gate/runtime was run and no production files were changed.
