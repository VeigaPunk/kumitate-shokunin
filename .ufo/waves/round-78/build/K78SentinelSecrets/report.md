# K78SentinelSecrets — scoped report

Axes: operability + coverage:kimi-layer. Full finding list, proof commands, marker proofs and saved patched source references: `../build/K78SentinelSecrets/security.md`; raw command/exit/trace evidence: `../build/K78SentinelSecrets/evidence.json`.

## Findings

1. **Low — output injection:** patched `scripts/omp-census.mjs:249` prints unescaped member names. A newline-bearing filename produces a second `OMP_SHAPE_COMPARE: IN_SYNC` stdout line while exit stays 1. Reproduced in `compare-newline.stdout`; no secret contents printed. Smallest repair: escape control characters in the displayed `first` field and cover that discriminator.
2. **Low — exported owner-check omission:** patched `scripts/kimi-census.mjs:264,348` omits the previous current-uid default, so canonical `decide(root)` skips directory owner checks. CLI/proxy explicitly provide uid and retain enforcement. `owner-api.stdout` compares omitted uid with a deliberately mismatched synthetic uid: zero vs three owner findings. Smallest repair: retain the running-uid default in the exported decision.
3. **Informational boundary exception:** `shapeFromFile`, unchanged line 184, follows explicit receipt FILE symlinks. A symlink outside the lane to a readable marker file is opened and returns SHAPE_INVALID/2 without leaking bytes; a valid receipt target returns IN_SYNC/0. This is inherited explicit-input behavior, not a root-member traversal exploit. If a no-follow receipt boundary is required, use descriptor-based O_NOFOLLOW plus regular-file validation; the frozen contract does not currently demand it.

## Exercised results

Unique marker `K78_SENTINEL_PRIVATE_6b9e2d077043` appeared in no tool stdout/stderr and no file in the measured lane archive. Stat/open traces establish that neither K census nor proxy opens secret member content or enumerates secret directories; escaping mcp.json/server.token symlinks remain stat-only. Compare rejects ../ and absolute receipt names (exit 2), rejects symlink roots (exit 2), and handles an extra FIFO member without opening/blocking (exit 1). Direct calls make no regular-file output writes. Receipt-target reads are explicitly excepted above; empty lexical member-open filters are not a no-symlink-read proof.

Measured archive `ad2630d0566a561ee078f47fade5644a22c10621` plus executor patch SHA256s `7ed3b4b6d059cbba097b2728b25eb9dfeb50a743c7a19dc3c32fbe43532ec7ff` (K) and `7e6c7f2eec0b089b462bc4000b9d97e811e632accc8e0405b1ce6a8535f6fdf2` (compare). Mode masks/secret flags retained; no new root-member content opens. CLI/proxy uid checks retained; one-argument API discrepancy above.

Frozen counters: baseline C1 3/12 and C2 2/11, both exit 1. Combined overlay C1 **10/12, exit 1**, C2 **11/11, exit 0**. C1's clean/live-strict misses are `GATE_PIN_DRIFT pin.omp-census` after combining patches, not marker leakage; its content-blind arm and census/proxy selftests pass. Coordinator should remeasure the final OMP tool pin, then run the frozen C1 counter. Sentinel did not modify pins or rerun that failure.

No remediation performed, no git mutation, no installs/updates. Existing Node v24.21.0 and strace 7.2 used. Scratch was removed in finally, including the separate owner discriminator.

Routing conflict: binding Report trailer authorizes this file; acceptance prose also names `w1/K78SentinelSecrets/report.md`. That extra path is not written outside the binding scope. A copy of this report is available in the authorized build directory for coordinator routing. No claim of final integrated readiness is made.
