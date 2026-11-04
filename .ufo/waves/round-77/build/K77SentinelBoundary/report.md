# K77SentinelBoundary

Axes: operability + coverage (orchestration/tooling). Read-only audit; no remediation scope.

Baseline revision: `4dc470a131e10900fdd456b6b68d7ba27151d9d2`. Raw commands, statuses, stdout and stderr: `base-receipts.json`. Candidate results are reported separately when executor replacements are available.

## Baseline sink table

| Surface | Observed result |
|---|---|
| `omp-census --snapshot` absolute scratch destination, `../` destination, symlink, FIFO, existing directory, `/dev/full` | All exit 64; feature absent; no snapshot written. This is not proof that the eventual writer confines destinations. |
| `omp-census --shape` FIFO, missing receipt, 16 MiB whitespace receipt | All exit 64; feature absent; bounded-read behavior not established. |
| Journal with foreign lane and FIFO-symlink `.pre` | `--check` exits 1 `SPOTCHECK_MAP: DRIFT`; journal retained; no foreign refusal token. Feature absent, not safe recovery. |
| Journal manifest naming absolute scratch victim | `--check` exits 1; victim and journal untouched because recovery absent. |
| Local journal `.pre` FIFO symlink, traversal-looking directory, symlinked journal parent | All ignored, exit 1; recovery absent. A real directory entry cannot contain `/` or be literally `..`; manifest paths and symlink parents are the traversal surface. |
| Two concurrent `--check` invocations, one local journal | Both exit 1 DRIFT, journal retained; neither attempts recovery at baseline. |
| Symlinked `.ufo/pins` parent, outside fixture lane but inside scratch | **Confirmed outside-lane write:** `--adopt corpus/lessons/round-77-verifier-spotcheck.md` exits 0, `ADOPTED ... wrote=both`; external `readme-map.json` changes. |
| Census member FIFO / member symlink to FIFO | Both complete without opening FIFO; exit 1 kind drift. `readShape` uses only root lstat + readdir and member lstat. Synthetic file-member content canary absent from stdout. |

## Confirmed inherited finding

**Medium — symlinked pin parent escapes the declared pair's lane.** Command in `base-receipts.json` uses fixture `base-pin-parent`; `.ufo/pins` points to `/fast/scratch/hyaku/kumitate-r77/K77SentinelBoundary/base-external-pins`. Adoption modifies that directory's `readme-map.json`, exits 0 and reports oracle CLEAN. An actor able to prepare the checkout can redirect an operator's adoption write to another writable pin file. Smallest remediation: validate real parent paths of both destinations and journal root against canonical lane paths before reads/writes, rejecting symlink parents; preserve the same check through recovery. No fleet file or real credential was involved.

## Required tokens

Frozen final contract: `SHAPE_INVALID`, `SHAPE_NOT_FOUND`, `OMP_SHAPE_INVALID`, `OMP_SHAPE_NOT_FOUND`, and `REFUSED_JOURNAL_FOREIGN` (exit 2); conflicting shape/root flags exit 64. Recovery success lines must be exactly `RECOVERED <target> rolled-back`, `RECOVERED <target> complete`, or `RECOVERED - stale`. Existing adoption refusals remain `REFUSED_OUT_OF_SCOPE`, `REFUSED_NOT_SPOTCHECK`, `REFUSED_ABSENT`, `REFUSED_ORACLE` (exit 2). Baseline emits the existing adoption refusals; offline flags are usage-only and foreign journals emit no refusal.

## Lesson disclosures

- Snapshot output `FILE` is explicitly caller-selected; the frozen contract does **not** promise lane confinement. Arbitrary output paths require disclosure, not a quietly invented predicate.
- Atomic per-file rename is not durability (`fsync`) or multi-process serialization. Recovery claims must distinguish crash recovery from concurrency safety.
- Journals contain the complete README and pin pre-images, not lesson bodies or harness credential members. A credential mistakenly embedded in those two files would be copied; do not claim content scrubbing.
- Actual `/dev/full` candidate writes must not be run on the host: temp/rename could replace a device with sufficient privilege. Use an isolated device namespace, or report this unexercised limitation. Baseline invocation was safe because the flag is absent and exits usage before any write.

No tools installed or upgraded. Scratch fixtures are bounded and contain only synthetic material.

## Candidate boundary result

**BOUNDARY: FINDINGS 4**

Provenance: frozen base plus executor replacements, not a measured landed commit. `candidate-receipts.json` records exact command arrays, exit codes, outputs and side effects. Initial tested census SHA-256 `ebedb1f7df89f1538e6c73861692a2c534a0c2461abf3d7126805b91d693f41f`; final delivered census `45bbb62aad19d2aa8358e76c17508b9399e02dd490095ae24bf6da4a7fa77523`. `diff -u` showed only its selftest roundtrip changed; final delivered census FIFO check was also exercised and timed out. Proxy SHA-256 `66c04420057d5a404af3df4594fe06602c1b96554f91230f436d2113adcb4109`; adopter SHA-256 `1f1f4a0ffafb6f4abeee2188a1deb38575f042b3b8221abccf71bbbf109016e5`.

| Candidate sink | Command suffix / observed effect |
|---|---|
| Snapshot absolute / `..` | `--snapshot <scratch>/candidate-outside.json --root <scratch>/shape-root` and `--snapshot ../candidate-dotdot.json ...`: exit 0; complete shape files created outside clone, inside seat scratch. Caller-selected output is not confined by contract. |
| Snapshot symlink | `--snapshot <scratch>/snapshot-link ...`: exit 0; symlink itself replaced by regular receipt; target `<scratch>/untouched` remains `ORIGINAL`. No target following at final component. |
| Snapshot FIFO | `--snapshot <scratch>/fifo ...`: exit 0; FIFO replaced by regular receipt, no blocking. |
| Snapshot directory | `--snapshot <scratch>/existing-directory ...`: exit 2, stderr `OMP_SNAPSHOT: ERROR reason=EISDIR`; directory retained and no `existing-directory.*.tmp` remains. This establishes cleanup for this error, not arbitrary signal interruption. |
| `/dev/full` | Real device candidate path deliberately unexercised under host guard; scratch symlink pointing to `/dev/full` is replaced successfully, exit 0, without opening device. Actual direct-device rename behavior remains unverified. |
| Shape FIFO | Census `--shape <scratch>/fifo` and proxy `--omp-shape <scratch>/fifo --json`: both exceed 2-second deadline, terminated by probe; no refusal token. |
| Shape 16 MiB whitespace | Census exits 2 `SHAPE_INVALID`; proxy exits 2 with `OMP_SHAPE_INVALID`. Reader source uses unbounded `readFileSync`, so this is not a size-limit refusal. |
| Shape missing | Census exits 2 `SHAPE_NOT_FOUND`; proxy exits 2 `OMP_SHAPE_NOT_FOUND`. Census shape/root conflict exits 64. |
| Manifest destination absolute / `../`; pre-image `../../`; target outside lessons | Each exits 2 `REFUSED_ORACLE`, destination pair unchanged and journal retained. Absolute victim remains `UNCHANGED`. Manifest-controlled path escape is rejected by exact pair allowlist. |
| Foreign manifest with `.pre` symlink to FIFO | Exit 2 `REFUSED_JOURNAL_FOREIGN`; pair unchanged and journal retained. Foreign pre-image is not followed: returns before FIFO read. |
| Local `.pre` symlink to FIFO | Exceeds 3-second deadline, no refusal. Journal retained and pair unchanged. |
| Local `.pre` symlink to synthetic private file | Exit 1; prints `RECOVERED ... rolled-back`; `corpus/README.md` becomes byte-identical to external symlink target when manifest SHA matches. External source unchanged; journal removed. |
| Symlinked journal root, recovery | `candidate-journal-symlink/.ufo/pins/adopt-journal` points outside fixture lane: `--check` exits 1, prints rolled-back and deletes the external journal. |
| Symlinked journal root, adoption | `candidate-journal-stage-outside` plus crash seam `journal`: exit -9; manifest and both `.pre` files are created in `<scratch>/outside-journal-stage/<uuid>/`. Thus the new journal write escapes the lane. |
| Symlinked pin parent | Candidate `--adopt` exits 0 and changes `<scratch>/candidate-external-pins/readme-map.json`, inherited escape persists. |
| Non-UUID name `..boundary` | Exit 1, rolled-back recovery; directory removed. This name has no separator and cannot traverse; arbitrary journal IDs accepted, not a demonstrated traversal. |
| Concurrent recovery | Four independent fixtures crashed at `row` (each child exit -9). In each pair of concurrent `--check` runs, one exits 1 with rolled-back and one exits 2 `REFUSED_ORACLE`. No claim that simultaneous recovery is safe. |
| Member content | Candidate root with synthetic `agent.db` and FIFO `mcp.json`: census completes exit 1, `entries=2 findings=1`; FIFO was classified, not opened. Snapshot receipts contain shape only. |

### Findings and smallest remediations

1. **Medium — unbounded special-file shape reads (availability).** A caller supplies a FIFO to either offline interface and blocks the process indefinitely; reproduced deadlines above. A large regular receipt is read entirely before validation (`shapeFromFile` lines 182–191), with no maximum. Smallest remediation: safely open only a regular file without following unexpected special-file targets, inspect its descriptor size, apply an explicit byte cap, then parse bounded bytes; preserve `SHAPE_NOT_FOUND`/`SHAPE_INVALID` and proxy token mappings. State the size limit in the lesson if adopted.

2. **High — symlinked journal/destination parents escape lane (scope).** Adoption stages the entire new journal outside `.ufo/pins/adopt-journal/` through its symlink; recovery deletes that external journal, and the inherited pin-parent redirection writes externally. Exact external paths and newly created files are in receipts. This directly exposes the frozen “journal outside” kill-rule surface; L1 owns disposition. Smallest remediation: canonical lane and allowlisted real parent directories, reject symlink parents/root before either recovery or staging, avoid a check/use race where possible. Do not claim the exact manifest path allowlist fixes parent symlinks.

3. **Medium — local pre-image symlink opens arbitrary readable content (confidentiality/integrity).** Local recovery checks pre-image hash only after `readFileSync`; no lstat/regular-file/no-follow check. A prepared local journal can read a known-digest outside file and copy it into corpus README; FIFO case proves unconstrained opens without exposing any real credential. Foreign journals correctly refuse before these reads. Smallest remediation: require regular manifest/pre-image files inside the real validated journal, open without following symlinks, hash the opened descriptor; validate both images before any restoration as current code already does.

4. **Low — two recovery processes race (operability, disclosed).** Reproduced concurrent rollback contention gives a spurious exit-2 refusal to one process. The code snapshots entries and reads/removes shared pre-images without an exclusive owner; one can delete the other's inputs. Observed result is refusal, not proven corruption or proven double rollback. Header explicitly discloses “Assumes one writer per lane” and “not power loss.” Smallest remediation if concurrent use is wanted: one lane-scoped exclusive recovery/adoption lock held through oracle, rollback and cleanup; otherwise lesson must retain single-process operation and the observed failure mode.

### Final-code tokens observed

All requested malformed/out-of-scope manifest cases above emit `REFUSED_ORACLE`, not a journal-specific malformed token. Foreign emits `REFUSED_JOURNAL_FOREIGN`. Shape invalid/missing emit the prescribed tokens; FIFO reads emit **none** before deadline. Snapshot directory failure emits `OMP_SNAPSHOT: ERROR reason=EISDIR` on stderr. `RECOVERED ... rolled-back` is observed on genuine crash journals and synthetic valid local journals; no unexecuted complete/stale arm is claimed here.

### Content and disclosure limits

Census root reading still consists of `readdir` + `lstat` (plus the independently specified binding-note read). The adopted oracle reads README and map registry, not lesson bodies; journal pre-images store those same two complete files. The local symlink finding prevents a blanket “never reads credentials” claim for recovery. Produced receipt scans for `sk-...`, GitHub token prefixes, `Bearer ...`, and AWS access-key patterns returned no matches; this finite scan is not a universal secret detector. Only synthetic canaries were used; no live credential file was opened.

Required lesson disclosures: caller-selected snapshot destination and replacement semantics; unbounded receipt/special-file behavior until fixed; parent-symlink trust assumption; untrusted local pre-image risks; single-process recovery requirement; process-crash rather than power-loss durability. No remediation was applied.

Self-evaluation: accuracy 4 (candidate hashes recorded; actual device path unexercised); completeness 4 (requested sink classes covered, real-device write intentionally not exercised); clarity 4 (raw receipts separated from conclusions); actionability 4 (per-finding minimal remediation); conciseness 4 (sink table carries repetition needed for independent audit). Overall 4.0. Improve with a disposable device namespace before making a direct `/dev/full` claim; do not run that probe on this host.
