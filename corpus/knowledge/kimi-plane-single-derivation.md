source: S041 — Kimi Code 2.3.0 session-lock service — https://github.com/MoonshotAI/kimi-code/blob/b5e28fd6beac752a2cdcc0ff2f5fdf40e6494fbb/packages/agent-core-v2/src/persistence/backends/node-fs/sessionLockService.ts#L55 and #L196 (historical locks/ provenance); internal authorities: scripts/kimi-census.mjs member rules and decide(root), scripts/proxy-check.mjs K derivation, SCORECARD.md kumitate-proxy-v1 stanza and coverage:kimi-layer row; frozen change contract: .ufo/waves/round-78/plan.md § C1
verified-at: 2026-11-04 (lane freeze ad2630d0566a561ee078f47fade5644a22c10621; S041 is a release-pinned historical source, not a fresh installed-version observation)
recheck: from the lane root, `node scripts/kimi-census.mjs --json` and `node scripts/proxy-check.mjs --strict --json`; fixture acceptance command: `node .ufo/waves/round-78/probe/probe78-c1.mjs --set c1`

# K plane: one census decision feeds the score

This is an internal derivation note. **No new external fact is asserted.** S041 grounds the historical K3 locks member, not this lane's scoring formula or its permission policy. The existing `corpus/knowledge/kimi-session-state.md` section “~/.kimi-code/locks/ — the session-occupancy lock directory (declared round 42)” supplies that member's local census treatment. S041's recursive mkdir mode must not be overread as a specification of the lane's owner, mode-ceiling or secret-shape rules.

## Decision and consumer

Under the round-78 C1 contract, `scripts/kimi-census.mjs` exports `decide(root)`. The census decides membership under its frozen rules, the findings about that root and the canonical identities used to bind note headings. Dynamic counted children and the backup-chain identity belong to that same decision; the proxy must consume them rather than enumerate a competing universe. Secret-class identities and shape handling must retain the census's rules without opening secret contents.

`scripts/proxy-check.mjs` imports this decision. The duplicate `K_MEMBER_RULES` table is deleted, not kept as a fallback. The proxy still derives the K registry fraction and documentation bindings from their appropriate lane surfaces, but it does not reimplement filesystem membership or findings. `K_sections` remains a distinct-member documentation-binding diagnostic; it is not the new formula's numerator.

The motivating failure class is a mode-floor finding that moves nothing: an existing member retains its identity and note heading while losing required permission bits. A membership-only duplicate table can still award full coverage although the census reports SHAPE_DRIFT. Importing the census's findings makes that disagreement affect the score instead of merely its prose.

## Derived term

```text
K_findings = census decision findings.length
coverage_kimi = floor(10 × C1k/C1k_total × (K_members − K_findings)/K_members)
```

`C1k/C1k_total` is the covered K-family registry fraction. `K_members` is the census-derived member total, not the number of note headings. `K_findings` is the census's finding count, not a deduplicated count of affected members. The scorecard stanza declares these terms and the proxy re-derives and cross-checks them; its axis-row cross-check prevents the displayed integer from becoming a separate authority.

The frozen census finding vocabulary is:

- `MEMBER_MISSING`: an absent declared member, a non-secret kind mismatch, or a missing declared child.
- `UNLISTED`: an undeclared child in the census's enumerable universe, including root enumeration under its explicit chain exemption.
- `SHAPE_DRIFT`: a shape-only pin failure, including secret-member kind, mode-floor, applicable mode-ceiling or owner mismatch.

An unavailable or invalid root is a fail-closed input, not a clean decision to score. Informational chain-generation counts are not findings. These statements describe the local contract and rules, not facts derived from S041.

## Gate and limits

This seat read the frozen plan and the pre-integration scripts; it did not execute the census, proxy or counter. Commands in the header are rechecks, not receipts. The intended mode-floor arm and formula are specified in `.ufo/waves/round-78/plan.md` § C1; their integrated result is UNKNOWN here. No shortened or reconstructed DRIFT output is presented as an observed line. Q6 and the frozen acceptance probe must be applied by the L1 after integration.

The census is now the only authority for K-root membership, findings and identities: a census bug is now a score bug. Shared derivation removes disagreement between implementations; it does not independently prove the shared implementation correct. The score is shape-only and says nothing about secret values, configuration correctness or model quality. Finding multiplicity matters because the formula subtracts findings, not distinct failing members; this note does not silently add deduplication or change the formula. S041's release provenance remains historical, and no current Kimi binary version was re-measured by this seat.
