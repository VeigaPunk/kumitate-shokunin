# K77SentinelBoundary — operability + coverage

**BOUNDARY: FINDINGS 4**

Full sink table, refusal tokens, commands/side effects and lesson disclosures: [boundary report](../build/K77SentinelBoundary/report.md). Raw baseline and candidate command receipts: `../build/K77SentinelBoundary/{base,candidate}-receipts.json`.

Base `4dc470a131e10900fdd456b6b68d7ba27151d9d2`; tested executor replacements identified by SHA-256 in receipts, not a landed commit. No remediation, commits, integration, runtime invocation, installation or host service changes.

| Severity | Exploit path / observed result | Smallest remediation |
|---|---|---|
| High | Symlinked `.ufo/pins/adopt-journal` stages manifest + both pre-images outside lane (crash seam exits -9); recovery deletes external journal. Symlinked `.ufo/pins` also changes external map pin, exit 0. Exact manifest destination allowlist does not protect symlinked parents. | Validate canonical destination/journal parents, reject redirected roots, preserve boundary through recovery. Frozen plan's outside-journal kill-rule surface is exposed; L1 decides disposition. |
| Medium | `--shape FIFO` and `--omp-shape FIFO` block past 2 seconds; parser reads regular files without size bound. | Regular-file safe open plus bounded bytes; preserve frozen failure tokens. |
| Medium | Local journal `.pre` symlink to FIFO blocks past 3 seconds; symlink to known-digest synthetic outside content is read and restored into README, exit 1 with rolled-back. Foreign journal correctly exits 2 before following its FIFO pre-image. | No-follow regular pre-images and manifest, validate all opened images before writes. |
| Low, disclosed | Four genuine row-crash journals each raced by two checks: one returns rolled-back exit 1, other `REFUSED_ORACLE` exit 2. No corruption demonstrated. Header discloses single-writer assumption. | Exclusive lane recovery/adoption lock, or retain explicit single-process limitation. |

Held in exercised sweep: snapshot symlink's target unchanged (symlink itself replaced); FIFO destination replaced, not opened; directory rename error exits 2 and removes temp; absolute/`../` output works as caller-selected FILE (not a lane-confinement promise); manifest absolute/parent destination, pre-image traversal and outside target refuse exit 2 without pair changes; foreign pre-image not followed; member FIFO classified without content read; finite credential-pattern receipt scan has no matches.

Required final tokens vs observed: census `SHAPE_INVALID`/`SHAPE_NOT_FOUND`, proxy `OMP_SHAPE_INVALID`/`OMP_SHAPE_NOT_FOUND`, and adopter `REFUSED_JOURNAL_FOREIGN` observed as required. Malformed journal paths emit existing `REFUSED_ORACLE`. FIFO reads emit no token before termination. Baseline lacks offline flags (usage 64) and ignores foreign journals (check exits 1), so baseline is not a recovery-safe implementation.

Direct `/dev/full` candidate write was deliberately not performed: host guard forbids outside-scratch writes and privileged temp/rename can replace the device. A scratch symlink to `/dev/full` was replaced without opening the device. This limitation is explicit, not a passing claim.

Lesson must disclose caller-selected output/replacement semantics; shape special-file/unbounded-read risks until repaired; parent-symlink trust; untrusted local pre-image content opens; single-process recovery and process-crash-only (not power-loss) durability. Journal pre-images are full README/map bytes, not scrubbed content. Only synthetic canaries used.
