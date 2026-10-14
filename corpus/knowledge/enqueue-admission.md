# Fleet-dispatcher ingress — queue I/O, mint, admission, compaction, receipt verdicts

**Superseded revision (historical).** This note maps the pre-2026-10-12
`scripts/fleet-dispatcher.mjs` at 14,769 lines. Its git pin is `b18e0274d`
(2026-09-26; then 850 commits behind (re-measured round 30: git rev-list --count b18e0274d..ee907f1cf) its era's `ee907f1cf`, the file
byte-identical across that range) and its content hash is `44a3c781…` — the
pin typology is recorded in `LOG.md`. The 2026-10-12 restructure replaced the
origin tree with a different file at the same path: the current
`scripts/fleet-dispatcher.mjs` is 9,829 lines, sha256-pinned `ba5e02be…`, and
does not carry the behaviours below. **Every `L<line>` citation in this note is
against that superseded 14,769-line revision, not the current file.** Condensed
from the full round-6 scout map (`local://kumitate-r6-dispatch-ingress.md`);
reviewer-verified (citation-clean against that revision). Complements
`queue-and-claim.md` (row schema/claim/dispatch).

## Queue I/O and the queue lock (L5713-5976)

- `readQueue` memoizes on `queueFileStatKey()` = `dev:ino:size:mtimeNs:ctimeNs`
  (L5781-5791, null on symlink/non-file = "never equal"). Stat BEFORE read —
  a racing write is cached under the pre-write key and never served after.
  Parse/validation faults rethrow as `QUEUE_INVALID` + `queuePath` (L5729-5740);
  nothing substitutes a partial queue.
- `writeQueue` (L5743-5779): `revision+1` + full `validateQueue` BEFORE writing;
  `>MAX_QUEUE_BYTES` (4 MiB, L112) and `credentialShapeTest` are pre-write
  refusals. Publish = tmp `wx` 0600 → fsync → rename → dir fsync; tmp removed
  in `finally`. Returns the published object `next`, never the arg.
- Lock = `mkdir ${queueFile}.lock` dir + `owner.json {pid,token,at}` (`wx`,
  L5830-5850). Acquire budget 30 s (L5854) vs `LOCK_STALE_MS` 30 s (L5791).
  Stale reclaim has TWO arms: dead-or-foreign pid = immediate reclaim
  (`lockPidOwnsQueue` L5813-5822 — live pid whose `/proc/<pid>/cmdline` lacks
  `fleet-dispatcher.mjs` is abandoned; empty cmdline counts as owner); absent
  `owner.json` = 30 s dir-mtime fallback. Steal = rename-to-quarantine then
  re-read seized `owner.json` token; foreign steal is restored, then `continue`
  — a steal is a retry, not an acquisition (L5893-5925).
- `withQueueLock` (L5950-5976): release is token-identity, not pid. NON-
  REENTRANT — a nested call waits the full 30 s then `QUEUE_BUSY`. Throw inside
  clears `queueReadMemo` (mutate-then-throw must not poison the memo).

## Scope partition (L6068-6117)

`canonicalScopes` resolves against `realpathSync(ROOT)`; a scope resolving to
ROOT itself → `null` which overlaps EVERYTHING (fail closed). `pairOverlap`
(L6103-6106): equality or ancestor/descendant at a `/` boundary over
ROOT-relative canonical paths — siblings never overlap, lexical only.

## Godspeed envelope gate (L5978-6039)

`splitGodspeedEnvelope` requires: exactly one `/skill:ufo` (or legacy `/ufo`)
first line, the directive bytes at core offset 0, a terminal `| godspeed`
marker with no trailing junk, no doubled marker, no second invocation line,
no second directive copy. All violations = one refusal, never silent strip.
`promptEvidence` runs this as a SIDE EFFECT of taking evidence (L6043-6063);
digest binds raw file bytes. Directive-miss typing depends on env: with
`UFO_GODSPEED_DIRECTIVE_PATH` the raw error propagates, else `DIRECTIVE_UNAVAILABLE`.

## Mint (`parseEnqueueSpec` L7217-7437, `mintQueueCandidate` L7439-7447)

- Required: `title` ≤64 safeText, `taskClass` ∈ {execution,planning,review,
  integration}, `promptPath`, `resultPath`, ≥1 scope. `configPath` required
  unless `fleet` supplies `missionFormat.configPath` (a differing explicit
  path is refused — fleet format is not a per-task knob, L7270-7286).
- Route: `route` must equal the alias-resolved route (L7258-7260);
  `routeChain` must deep-equal `aliasRouting.chain` (empty → `[route]`).
- Scopes: post-normalization dup refused; root `.`/`""` refused (L7303-7308);
  state root `.ufo` refused (L7309-7316); phantom (nonexistent) scopes are
  ADMITTED but logged `queue_scope_untracked` — existence is not a gate.
- `dependsOn`/`afterChains` accept `@N` sibling refs only under
  `allowSiblingRefs`; `afterRuns` uses `AFTER_RUN_PATTERN`
  `^[A-Za-z][A-Za-z0-9_-]{0,63}$` — a different grammar than `gq<16hex>`.
- `requestedRunners` ≤ `min(runnerCeiling(), MAX_REQUESTED_RUNNERS=1024)`;
  the error names the effective bound (L7345).
- `iterate`: missing → `missionFormat.defaultIterateRounds`; explicit
  `iterate:null` or `{rounds:0}` = opt-out; iterate result path must end
  `.md` and must NOT already carry `-rN` (L7357-7363).
- Identity = `sha256(JSON.stringify(immutable))` over the content fields →
  `task_<24>`/`gq<16>`/`omp-gq<16>`; `chainRootKey = key` only on the iterate
  ROOT (round-1 rows carry no lineage). `mintQueueCandidate` wraps parse
  errors as `usageError` but lets `validateQueueTask` throw untyped — a
  minted row failing the validator is a construction bug (`dispatcher_crash`).

## Admission battery (`admitQueueCandidates` L7477-7647)

Caller holds the queue lock. Per candidate, in order:
1. content-key dedupe → `{enqueued:false, task: existing}` — silent success,
   `enqueued:false` ≠ invalid spec.
2. `dependsOn` + `afterChains` targets must exist in live ∪ archived ∪
   same-batch candidates; `afterRuns` deliberately NOT existence-checked.
3. `afterChains` live target must be an iterate chain ROOT
   (`target.iterate && resolveChainRoot(target) === root`); archived target
   with dead `terminalKind` → `dead terminal outcome` refusal (C3/C7).
4. Scope overlap vs live non-terminal non-blocked rows — blocked rows do not
   occupy; pairs joined by dependsOn/afterChains/afterRuns either direction
   are exempt (L7545-7552).
5. Result-path collision: file exists / receipt exists / live row owns it.
6. Capacity (`MAX_QUEUE_TASKS=256`): dry-run simulates `simulatedReliefCount`
   over `queue.tasks` ONLY (ignores same-batch admits); real admission runs
   `archiveCompletedRowsLocked` and publishes the shrink via `writeQueue`
   BEFORE re-checking — a later batch rejection leaves the relief published;
   callers must chain off the RETURNED post-relief `queue` object (L7641-7645).
Refusals are uniformly `usageError` + `specIndex` stamped per batch member.

## Batch (`resolveBatchSiblingRefs` L7708-7759, `enqueueBatch` L7761-7846)

`@N` = 0-based position in the SUBMITTED array; only `dependsOn`/`afterChains`
resolve (a ref in `afterRuns` fails the grammar). Pass-1 keys of ref-holding
specs are PROVISIONAL; loop 2 re-mints with resolved keys. Cycles and
out-of-range are typed usage errors naming the spec position. One lock, one
write, all-or-nothing rows; `batchIndex`/`batchSize` describe the submitted
array, not the admitted subset.

## Compaction (`compactQueue` L7858-7994, `COMPACTION_AGE_MS` 90 d)

Different selector than relief: archives receipt-valid, non-parked,
non-deferred `completed` rows aged ≥90 d (keeps receipt-invalid completed rows,
recoverable `successor_error` parks, deferred parks — relief archives
receipt-valid completed of ANY age plus `archivableBlockedChainAdvanced`).
`retainDependencyClosure` pulls back rows a retained row depends on.
Archive = `.ufo/archive/pending-work-<YYYY-MM>-<digest>.json` (from
`candidates[0].updatedAt` month) — DISTINCT from the append-only
`pending-work-archive.jsonl` relief archive. Replay verification: bounded
re-read + count + re-serialized digest + key uniqueness + every candidate
present — hand-edited archives fail replay as corrupt.

## Receipt verdict machinery (L7997-8311)

- `dispatchSnapshotDigests(task, filename)` L8018-8036: set of digests over
  every `dispatch-snapshot-*` dir under the run's session dir — run-scoped,
  presence-based (includes `.superseded-*` and prior-attempt dirs).
- `resultReceiptValid` L8140 (exported): memo keyed by taskKey + binding
  (resultPath|attempts|configSha256|promptSha256|minimumAgeMs|includeReport)
  + result/receipt stat tuples + snapshot fingerprint; re-stats on every hit
  (absence is never cached). `result_too_recent` refuses at `<=` (L8202) and
  caches `tooRecentUntilMs = mtime + minimumAgeMs`.
- Refusal ladder in compute: `result_file_missing` → `result_too_recent` →
  `result_unreadable` → `result_empty` → `receipt_missing` →
  `receipt_unreadable` → `receipt_torn` (SyntaxError) /
  `receipt_report_mismatch` (`receipt_mismatch` naming reportSha256) /
  `receipt_invalid`. Only torn settle-time shapes get grace.
- Binding is deliberately SOFT: `task.configSha256 == null` + non-empty
  snapshot set → receipt's digest must be a MEMBER, `bindingSource =
  "dispatch_snapshot"`; empty set → `unboundAdmission: true` (named
  `receipt_unbound_admitted` mode `config`). A drifted stored digest that is a
  snapshot member rebinds (config AND prompt arms) — "receipt must match the
  row's stored digests" is wrong for rebound rows.
- `digestBindingShape` (L8136) disambiguates string/null/undefined in the memo
  key — `promptSha256: null` is an ACTIVE expectation (`receipt_mismatch`),
  an absent digest skips the check.
- `logAcceptanceAdmission` L8313-8356: consumes `task.reopenEpisode` (new
  completion epoch), emits `receipt_snapshot_binding_accepted` with
  `bindingSource`, plus `receipt_unbound_admitted` when unbound; then
  `recordAdmission` → the durable latch pair contract (successor-chain.md).

## Traps

- Dry-run enqueue takes the real queue lock (L7669/L7793) — `QUEUE_BUSY` on a
  "read-only" verb; dry-run `wouldEnqueue:false` only means dedupe, every other
  violation throws.
- Relief is not rolled back: rows all-or-nothing, the mid-batch `writeQueue`
  is durable.
- `minimumAgeMs` boundary is `<=` — exactly-at-boundary = too_recent.
- `settleLiveEvidence` (L8589-8597) performs NO receipt validation — it marks
  `completed` on whatever verdict the caller hands it; caller discipline is
  the entire guard (call sites L10009, L10072).
- `reapCandidate` (L8600-8645): pending/paused never reap; stopped+blocked
  needs `retryable===false`; live+completed needs era-current AND aged valid
  receipt; a stopped mission reaping a completed row deliberately does NOT
  retract the admission (display settle only — "reaped while open" rows are
  this arm working as designed).

## Erratum (round 30, 2026-10-14, append-only)

The `44a3c781…` content hash this note records at its head was presented in
earlier revisions as a **live content pin** of `scripts/fleet-dispatcher.mjs`.
It is the **superseded** pre-2026-10-12 file — 14,769 lines, git pin
`b18e0274d`, byte-identical through `ee907f1cf`. The 2026-10-12
restructure replaced the origin tree with a different revision of that path —
9,829 lines, sha256 `ba5e02be…` — so the `L<line>` anchors above index the
superseded revision, not the current file. The supersession and the pin
typology are recorded in `LOG.md`.
