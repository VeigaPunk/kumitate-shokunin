ATTACK Check77 measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf ids=10 agreed=10 refuted=0 unverified=0

Commands / observed outputs:
- `mkdir -p /fast/scratch/kumitate-r38-falsify/Check77 && git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show c938c068f4dbf356c0884c2121bbfe087fbe3caf:corpus/knowledge/route-probe-cluster.md > /fast/scratch/kumitate-r38-falsify/Check77/note.md && wc -l /fast/scratch/kumitate-r38-falsify/Check77/note.md` → `601 /fast/scratch/kumitate-r38-falsify/Check77/note.md`.
- `S=/fast/scratch/kumitate-r38-falsify/Check77; U=/fast/scratch/kumitate-r36/src; P=31c465f15669f744848bd9f5d56191c5085670f7; for f in probe-token-plan-shared.mjs probe-redact.mjs fake-omp.mjs probe-ufo-route-health.mjs; do git -C $U show $P:scripts/$f > $S/$f; done; wc -l $S/*.mjs` → `392 fake-omp.mjs; 116 probe-redact.mjs; 159 probe-token-plan-shared.mjs; 1188 probe-ufo-route-health.mjs` (all under `/fast/scratch/kumitate-r38-falsify/Check77/`).
- LSP device is not present in the mounted tool inventory; no LSP semantic results are claimed. Grep was used only to locate note references; judgments below use pinned source lines and their call sites.

OBS route-probe-cluster#146 agree | `97:  const result = spawnSync(process.execPath, [` | Note row says the shared probe spawns route-health under `process.execPath`; this is that call, followed by `ROUTE_HEALTH` at 98.
OBS route-probe-cluster#147 agree | `8:export const CREDENTIAL_SHAPE =` | The cited line defines the canonical credential-shape regex as the prose states.
OBS route-probe-cluster#148 agree | `67:export function redact(value) {` | This is the named `redact` definition; lines 70–73 run redaction and re-scan after removing format characters when needed.
OBS route-probe-cluster#149 agree | `10:// Never claims live capacity; never reaches a real provider.` | Note accurately reports what the fake-OMP header states; this comment is not treated as independent runtime proof.
OBS route-probe-cluster#152 agree | `67:// PARITY: this table is a standalone copy of ./probe-redact.mjs. This file` | Lines 67–96 are the parity marker plus the redaction table, ending at `];` on 96; this supports the note's standalone-copy claim.
OBS route-probe-cluster#153 agree | `43:const DEFAULT_TIMEOUT_MS = 240_000;` | The value is the actual default: `parseArgs` initializes `timeoutMs` from it at 113.
OBS route-probe-cluster#154 agree | `45:const MAX_ROUTES = 16;` | `parseArgs` rejects route counts above `MAX_ROUTES` at 174, supporting the ≤16 sweep bound.
OBS route-probe-cluster#155 agree | `65:const PROBE_CONCURRENCY = 8;` | `main` passes this limit into `mapPool` at 1159 for route probes.
OBS route-probe-cluster#156 agree | `775:async function mapPool(items, limit, fn) {` | Workers are capped by `Math.min(limit, items.length)` at 785; indexed results preserve order, and `main` supplies the concurrency limit at 1159.
OBS route-probe-cluster#157 agree | `44:const MAX_BUFFER = 8 * 1024 * 1024;` | `probeRoute` passes this as `maxBuffer` at 825; `spawnCollect` independently applies it to stdout and stderr at 733 and 746, matching the per-stream claim.

Verification scope: static inspection of the specified final anchors at the pinned upstream blob revision only; no gate or runtime was run.