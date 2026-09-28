# `local_ship.rs` — local apply/verify/rollback transaction (I10)

`ufo local-ship --request <file>` is the ONLY mutation transaction: apply a
candidate file, run a verifier, commit iff verifier exits 0 inside bounds,
else restore the exact preimage (`local_ship.rs:1-11`). No git, publish,
network, or command inference. Journal root `<workspace>/.ufo/apply-journal`
is OPTIONAL — absent ⇒ unjournaled apply.

## Refusal order (pinned by conformance `local-ship.json`, 39 cases)

`apply_local_ship` (:1639-1848), exact order:
1. `validate_bounds` (:1640) → `normalize_sha256` (:1641 — `sha256:` prefix
   accepted, mixed-case normalized to lowercase; `SHA256:` NOT stripped)
   → `refuse_shell_or_inferred_verifier` (:1642) → `canonical_workspace_root`
   (:1643) → `refuse_external_effect_target` (:1644 — before the path walk,
   so `../.env` is `external_effect` not `path_escape`).
2. Journal root validated AND its grandparent must canonicalize to the apply
   workspace (:1648-1664) before any sweep runs (:1666).
3. `resolve_regular_file` (:1672) BEFORE the lock — refused targets leave no
   lock dir (N4/N7). Symlinks refused at EVERY component (:1958-1960);
   `a/./b.txt` commits (`Path::components` normalizes `.` first, ls-11);
   `a/../../b.txt` → `io`, not `path_escape` (ls-10).
4. `nlink>1` refused (:1680-1690) — a hardlinked target defeats per-path
   locking ("one name, one inode").
5. `claim_apply_lock` (:1696) held RAII across the WHOLE
   check→journal→replace→verify→finish window.
6. Post-lock stat + preimage bound (`st_size > 8 MiB` refused :1710-1715 —
   a deliberate exception to the "never size from metadata" doctrine, can
   only over-refuse) → `read_bounded` + `before_sha256 == expected` else
   `HashMismatch` (:1716-1723).
7. `JournalOp::begin` (:1729): `<op>.preimage` written BEFORE `<op>.json`
   `pending` (:270, :282) — crash between them leaves only an orphan
   preimage, never an unprovable entry. Then `atomic_replace` (:1738).
8. `run_verifier` (:1739) → commit finalize (:1794-1818) or rollback
   (:1821-1847).

## Verdict asymmetry — the core contract

**Verifier failure is never `Err`.** Nonzero exit, timeout, oversized
output, spawn failure, even the 4 MiB collection cap → `Ok(RolledBack)`
(:2464-2483, :1821-1847). Only `Err(Rollback)` (restore failed, :1785) and
`Err(JournalFinalize)` (commit finalization failed, :1804) escape — and the
asymmetry is load-bearing: a pending COMMIT entry is provisional (recovery
reverts it), so its finalize fault stays `Err`; a pending rollback is
already final (recovery marks `live==before` without rewriting), so its
finalize fault rides `receipt.journal_finalization_error` (:1756, :1827-1832).
`final_sha256` after rollback is `before_sha256` — never re-read (:1837).

CLI exit map (`main.rs:1848-1860`): `Committed`→0, `RolledBack`→1,
`Err(Rollback)`→3, other typed refusals→2 with kind
(`rollback`/`journal_finalize`/`path_escape`/`symlink`/`hash_mismatch`/
`external_effect`/`replacement_too_large`/`apply_locked`/`invalid`/`io`).

## Apply lock — cooperative election, NOT mutual exclusion (:760-987)

Per-target dir `.ufo/apply-locks/apply-lock-<sha256(full spelling)>/`;
each claimant links one `attempt-{millis:013}-{pid:09}-{uuid}` file (0600,
`create_new`, token `ufo-local-ship:<pid>:<ns>:<millis>:<uuid>` written into
the body). Holder = **lowest-named live presence**: a lower-named live peer
→ withdraw (`ApplyLocked`); only higher-named peers → wait ≤8 rounds ×150 ms
then `ApplyLocked`. `MAX_LOCK_CLAIM_ROUNDS=8`, `LOCK_WITHDRAW_WAIT=150ms`
(:703/:708) — bounded ≤~1.2 s, never queues behind a verifier (:1691-1695).
Lock keys on PATH SPELLING, not inode — two (workspace,relative) spellings
of one inode can double-commit (documented residual :630-640; the nlink
refusal closes the within-one-spelling case).

Owner grammar `ufo-local-ship:<pid>[:<ns>]` (:530-556, :642-647): `ns` =
`/proc/self/ns/pid` inode; `-` = writer couldn't read procfs (new readers
fail CLOSED, old readers get pid-probe semantics — backward-compatible
downgrade); a pre-ns binary reads a 3-segment body as one pid and the
LiveOwner gate fails OPEN (:132-140 — intrinsic, undetectable). `pid 0` =
live-unknown sentinel for foreign-ns/unreadable/non-regular presences —
never swept, never rendered as a live owner (:117-124, :666-688).

## Journal recovery (`recover_apply_journal` :1167-1336)

Pass order: validate journal root (:1171) → missing root ⇒ `Ok(empty)`
(:1188) → workspace = root grandparent (:1196) → sweep (:1206) → load all
`*.json` (ANY malformed entry aborts the whole pass :1208-1226) → pre-loop
`LiveOwner` gate (all-or-nothing, zero file touch :1237-1250) → partition/
sort → per-path fixpoint order (`order_pending_for_path` :1079 — unique tip
= pending entry whose `candidate==live`; chain continues via
`candidate==current.before`; off-chain/cycle → `started_at` desc) →
`settled_by_path` (Applied-only) → per entry: claim lock → `recover_pending`.

`recover_pending` decision tree (:1429-1552, first match wins):
absent/non-regular live target → `PreexistingConflict`; `live==before` →
`RolledBack` with NO write (:1486); `live!=candidate` → `PreexistingConflict`
(T31: a user edit raced the crash — never touch); `live==candidate` but
digest owned by a settled `Applied` sibling → `PreexistingConflict` (C2:
never revert a committed write :1498-1506); preimage digest ≠ `before` →
`MalformedEntry`; target vanished / `nlink>1` → `PreexistingConflict`; else
`atomic_replace(preimage)` → `RolledBack`. **Ownership is proven by digest,
never by path listing** — the `ownership` string only feeds the LiveOwner
liveness gate.

Journal entries are never pruned (:143-146) — recovery cost grows with
lifetime apply count; `MAX_JOURNAL_ENTRY_BYTES=64 KiB` is the only per-entry
bound (:153). Sweep deletes only orphan `.preimage` (no pending sibling) and
`.ufo-ship-*` temps aged ≥60 s (`SWEEP_MIN_AGE` :405), never a `.json`.

## Verifier grammar (:2061-2291) — denylist, never inference

- `verifier` must be ABSOLUTE (`!is_absolute` → invalid, :2218-2222).
- Refused basenames: **95 exact** names (`sh bash zsh fish … env busybox awk
  sed find xargs dd gcc make sudo su …`, :2080-2181) + **13 prefixes**
  (`python pypy node perl ruby php lua docker podman pip npm wasm- qemu-`,
  :2183-2191), ASCII-case-insensitive; THEN a trailing digit/dot strip
  (`python3.12`→`python`, `curl8`→`curl`, `sh.`→`sh`) re-runs both checks
  only when `stripped != raw` (:2064-2078).
- If `fs::canonicalize` succeeds: resolved path must be a regular file,
  resolved basename re-checked (symlink bypass blocked :2250-2258), first
  2 bytes `#!` → refused (:2261-2287). If canonicalize FAILS: not refused —
  deferred to spawn → `rolled_back` with `exit_code: None` (:2232-2236,
  ls-06).
- Declared limits (:2203-2216): hardlinks/renamed copies invisible,
  non-exhaustive denylist, `#!`-only sniff, check↔spawn TOCTOU.

## External-effect target table (:2001-2059)

Case-insensitive component match: `.git`→`.git`; `.ufo`→`ufo-internal`
(journal/lock forgery rationale); `.ssh/.gnupg/.aws/.docker/.netrc`→
`credential-directory`; `.env`/`.env.*`→`env-file`; `id_rsa|id_dsa|id_ecdsa|
id_ed25519|credentials|authorized_keys|known_hosts|.npmrc|.pypirc`→
`credential-file`; `*.pem|*.key|*.p12`→`key-material`. Non-`Normal`
components skipped (escape refusal is the walk's job).

## `bounded_fs` (155 lines) + `fs_durability` (277 lines)

- `read_bounded_ident` (`bounded_fs.rs:118-146`): metadata (follows links) →
  `open` with `O_CLOEXEC|O_NONBLOCK` and **NO `O_NOFOLLOW`** (symlinked
  contract files are followed BY DESIGN, :14-17) → fstat re-check ("the
  inode allowed through is the inode that gets read") → optional `(dev,ino)`
  identity check (unix-only) → `take(max+1)` → post-read length is the ONLY
  size authority — `st_size` never trusted (r27, :20-25). `+1` makes growth
  visible instead of silently truncated.
- `BoundReadError`: `Io` | `NotRegular` | `GrewPast{max}` |
  `IdentityMismatch` — but `local_ship::read_bounded` passes `identity=None`
  (:2317), so `IdentityMismatch` is unreachable from the apply path (defect
  D-A below; identity used only by godspeed/native_evidence/loop_driver
  call sites).
- `fs_durability`: `now_millis`/`now_nanos` (0 before epoch, saturate
  `u64::MAX`); `create_0600_tmp` (`create_new` = planted-symlink refusal);
  `hard_link_tmp` (`AlreadyExists`→`Ok(false)` = lost race); `TmpGuard`
  (stages `(dev,ino)` at new; `verify_staged` mismatch CLEARS the path so
  drop leaves the foreign replant in place — never unlinks it, :65-80);
  `fsync_dir` (unix: open+`sync_all`; non-unix no-op).
- `atomic_write` (:2356-2434): `.{name}.ufo-ship-{pid}-{uuid}` in the same
  dir → `create_new` 0600 → write → mode → `sync_all` → `verify_staged` →
  `rename` → ONE `fsync_dir` after the rename (doc :2345 implies two —
  stale). JS twins: `ufo-mission-result.mjs:1103-1159`, `atomic-write.mjs`
  (adds `O_NOFOLLOW` on its dir open).

## `run_verifier` (:2455-2485)

`Command::new(verifier).args(argv).current_dir(canonical_root)
.env_clear().env("PATH","/usr/bin:/bin").env("LC_ALL","C")` — vector argv,
no shell. Spawn via `run_fixture_with_stdin(cmd, b"", timeout)`
(`bounded_fixture`): stdin = `UnixStream::pair` write-end dropped → instant
EOF; stdout/stderr = socket pairs, capped `MAX_BOUNDED_CHILD_OUTPUT_BYTES`
= 4 MiB (`process_group.rs:22`); child in own process group;
`pipe_join_grace = (bound/4).clamp(50ms,2s)`. `exit0 + oversized output`
= failure (ls-05); `timed_out` is true ONLY for `Timeout` —
`IncompletePipe`/`OutputTooLarge`/`Spawn`/`Io` all report `timed_out:false`,
receipt-identical.

## Bounds table

`HARD_MAX_REPLACEMENT_BYTES` 8 MiB (:27) · `HARD_MAX_OUTPUT_BYTES` 1 MiB
(:28, per stream) · `HARD_MAX_TIMEOUT_SECS` 30 s (:29) · journal entry
64 KiB (:153) · `SWEEP_MIN_AGE` 60 s · lock: 8 rounds × 150 ms · `#!` sniff
2 B · presence body 1024 B · child stream cap 4 MiB · op_id = 16 lowercase
hex.

## Defects flagged this round (report-class, not owned)

- **D-A (moderate):** `read_bounded` passes `identity=None` (:2317) so the
  lstat-walk→metadata→open→rename TOCTOU is unmitigated; `IdentityMismatch`
  is dead code in this module. Exploitability needs a non-cooperating writer
  inside the lock's blind spot — code fact certain, impact inferred.
- **D-B (low):** `st_size>8MiB` refusal (:1710-1715) re-introduces the
  metadata-size arm r27 removed from the shared reader; can only over-refuse
  pseudo-fs/sparse files.
- **D-C:** `atomic_write` doc claims a pre-rename dir fsync that does not
  exist (:2345 vs :2411-2432).
- **Journal grammar asymmetry (fail-safe):** `read_journal_entry` accepts
  UPPERCASE hex digests (:1386 `is_ascii_hexdigit`) while `op_id` rejects
  uppercase (:1375) and `sha256_hex` emits lowercase — an uppercase-digest
  entry validates then can never match → silently degrades to
  `PreexistingConflict`/`MalformedEntry`.
- **Comment overstatement:** :1317-1318 calls the per-target lock arm
  "all-or-nothing like LiveOwner", but `claim_apply_lock?` (:1320) fires
  mid-loop after earlier entries were already marked/restored — replay-safe,
  not all-or-nothing.
- **No external pin on `before_sha256` at recovery** — an internally
  consistent tampered entry+preimage pair is a valid restore target (the
  trust model for `.ufo/apply-journal` is the mitigation).
- **Unexported types:** `LocalShipError::JournalFinalize` publicly exposes
  `state: ApplyJournalState`, but `ApplyJournalState` is not re-exported
  (`lib.rs:147-151`) — cross-crate consumers must match `{ .. }`
  (`main.rs:1849`); same for `ApplyJournalRecoveryReport/Error`.
