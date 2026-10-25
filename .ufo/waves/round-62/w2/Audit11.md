# Source-provenance review: Temporal Worker Versioning

## Finding

No actionable provenance defect found in the new entry `corpus/knowledge/temporal-worker-versioning-pinning.md`.

- Its opening metadata identifies the source as **S195** and the Temporal worker-versioning URL (line 1); verified-at records 2026-10-25, HTTP 200, and the captured-body SHA-256 (line 2); and gives a concrete 90-day recheck command (line 3).
- The entry does not cite staged ID S217. References in the body use S195 and the correct Temporal source URL (lines 15, 29). S217 is absent from the entry.
- Retry statements are bounded by the documented inheritance conditions: the entry specifies when retry inheritance applies (line 21), explicitly leaves the top-level pinned retry case UNKNOWN where those conditions do not apply (line 23), and disclaims broader retry claims in scope (line 11). No unsupported retry behavior is asserted.

## Residual risk and verification gaps

This review checked the entry's text only. It did not independently fetch the external source or verify the capture against it; the verified-at and hash details are recorded in the entry, not revalidated here. No tests or runtime checks were run (read-only review assignment).
