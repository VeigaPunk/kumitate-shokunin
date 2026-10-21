ATTACK Check45 measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf ids=4 agreed=4 refuted=0 unverified=0

OBS route-probe-cluster#76 agree | `const INVISIBLE_CHARACTERS = /[\p{Cc}\p{Cf}]/gu;` (pinned source line 209) | Correctly marked `debt:false` in the note's Round-38 debt section: `ROUTE_TOKEN` is gone from this file; line 209 defines diagnostic escaping, not route validation. This is not a true claim.
OBS route-probe-cluster#77 agree | `// represent, so they stay usage errors.` (pinned source line 204; preceding line says “a route no consumer can”) | This exact comment supports the narrow consumer/usage-error clause. It is corroborated by `parseRoute` delegating to `parseRouteGrammar` at 218 and shared grammar rejecting invalid components at 117–123; the adjacent `ROUTE_TOKEN` claim remains separately marked debt by #76.
OBS route-probe-cluster#78 agree | `if (!resolved.endsWith(".json")) usage("--state path must end in .json");` (line 976) | Same `assertStatePath` range confines under `.ufo` at 975 and rejects symlinks during the ancestor walk at 983, matching the cited state-path claim.
OBS route-probe-cluster#79 agree | `const MAX_ROUTES = 16;` (line 45) | This is the actual limit definition; `parseArgs` enforces it at line 174. The anchor names the correct constant, not a coincidental token.

Evidence / limits:
- Frozen note read from `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show c938c068f4dbf356c0884c2121bbfe087fbe3caf:corpus/knowledge/route-probe-cluster.md`; observed 601 lines. Full note sentence at lines 211–218 and #76 debt marking at line 584 were checked.
- Pinned source identity: `git -C /fast/scratch/kumitate-r36/src rev-parse 31c465f15669f744848bd9f5d56191c5085670f7^{commit}` → `31c465f15669f744848bd9f5d56191c5085670f7`; `git show 31c465f15669f744848bd9f5d56191c5085670f7:scripts/probe-ufo-route-health.mjs` → 1188 lines. This is the prescribed upstream pin; that script path is absent from c938's lane tree.
- LSP unavailable: `read xd://lsp` returned “No such tool” and the mounted-device list had no LSP. Literal search was navigation only; conclusions above come from direct pinned source and grammar reads, not grep as semantic proof.
- Gate/runtime not run; no LSP diagnostics, references, or definition checks were possible. No correction is indicated for these four anchors; #76 remains explicitly debt rather than a true claim.
