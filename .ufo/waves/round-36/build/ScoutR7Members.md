R7-MAP members=5 symbols=54 anchors=54

# R7 member map at pin 31c465f1 (crates/ufo-core-runtime/src)

Source: /fast/scratch/kumitate-r36/src, detached at 31c465f15669f744848bd9f5d56191c5085670f7, read-only (never touched).
Anchors are paste-ready FIDELITY pairs, ONE PAIR PER LINE: `SYMBOL` (`member:N[-M]`) —
the symbol is verbatim on that line (pair distance 2, so the parser pairs the previous span).
Do not put two pairs on one line or add a backticked span within 14 chars of an anchor.

## `bounded_fs.rs` — 149 L (prior note says 155)

- 5 variants, not 4: `BoundReadError` adds `TooLarge { max, got }` at classify time; `GrewPast` is the post-read arm.
- `check_shape` runs `meta.len() > max` at BOTH the classify stat and the post-open fstat, then `read_bounded_ident` re-checks `bytes.len() > max` after `take(max+1)`. So st_size is an over-refusal authority at pin; the note's "post-read length is the ONLY size authority" is stale.
- `read_bounded_ident` order: metadata → check_shape → open_nonblock_read → fstat → check_shape → optional check_identity → `Vec::with_capacity(min(len,max)+1)` → `take(max+1)` → GrewPast. `read_bounded` passes identity None, so `IdentityMismatch` is unreachable from local_ship (`local_ship.rs:2226`), still live for godspeed/loop_driver/native_evidence call sites.
- `open_nonblock_read` is the shared primitive (O_CLOEXEC|O_NONBLOCK, deliberately no O_NOFOLLOW) and local_ship::read_presence_body calls it, so a FIFO presence cannot block the lock claim.

Paste pairs:
`BoundReadError` (`bounded_fs.rs:27`)
`TooLarge` (`bounded_fs.rs:33`)
`GrewPast` (`bounded_fs.rs:35`)
`IdentityMismatch` (`bounded_fs.rs:37`)
`open_nonblock_read` (`bounded_fs.rs:70`)
`check_shape` (`bounded_fs.rs:81`)
`check_identity` (`bounded_fs.rs:95`)
`read_bounded_ident` (`bounded_fs.rs:112`)
`read_bounded` (`bounded_fs.rs:142`)

## `bounded_fs_tests.rs` — 5 cases, 2 `#[cfg(unix)]`

Cases: exact ceiling (8), oversized-at-classify (18), directory (30), growth-mid-read (45), identity swap (77).
Behavior pins:
- `read_bounded_rejects_growth_past_ceiling_mid_read` (45) loops up to 500 concurrent growth attempts and panics if `GrewPast` never fires — the only proof that the +1 take is live.
- `read_bounded_ident_rejects_swapped_identity_and_accepts_match` (77) asserts both arms: a wrong (dev,ino) rejects, the true pair accepts.
- `read_bounded_rejects_too_large_at_classify` (18) targets the metadata arm, distinct from the post-read arm; deleting either leaves the other green.

Paste pairs:
`read_bounded_accepts_exact_ceiling` (`bounded_fs_tests.rs:8`)
`read_bounded_rejects_too_large_at_classify` (`bounded_fs_tests.rs:18`)
`read_bounded_rejects_directory_as_not_regular` (`bounded_fs_tests.rs:30`)
`read_bounded_rejects_growth_past_ceiling_mid_read` (`bounded_fs_tests.rs:45`)
`read_bounded_ident_rejects_swapped_identity_and_accepts_match` (`bounded_fs_tests.rs:77`)

## `fs_durability.rs` — 198 L, 5 inline tests (`mod tests` at 110)

- `TmpGuard` at pin is only `Option<PathBuf>` (new/path/disarm/Drop). There is NO `verify_staged` and NO (dev,ino) staging: the prior note's "mismatch clears the path so drop leaves the foreign replant" describes a design that no longer exists here.
- `create_0600_tmp` names `<prefix>-<pid>-<nanos:x>` (nonce only, no uuid), `create_new` 0600; `hard_link_tmp` maps AlreadyExists to Ok(false) (lost race), every other error propagates.
- `now_millis` saturates through `u64::try_from(...).unwrap_or(u64::MAX)`; `now_nanos` returns raw u128 (pre-epoch → 0). `fsync_dir` is unix open(read)+sync_all, no-op elsewhere.
- Test pins: `tmp_guard_cleans_on_drop_but_not_after_disarm` (171) proves both drop arms; `hard_link_tmp_is_create_new_semantics` (155); `create_0600_tmp_creates_private_new_file_with_nonce_name` (131).

Paste pairs:
`fsync_dir` (`fs_durability.rs:14`)
`TmpGuard` (`fs_durability.rs:30`)
`create_0600_tmp` (`fs_durability.rs:66`)
`hard_link_tmp` (`fs_durability.rs:83`)
`now_nanos` (`fs_durability.rs:93`)
`now_millis` (`fs_durability.rs:101`)
`create_0600_tmp_creates_private_new_file_with_nonce_name` (`fs_durability.rs:131`)
`hard_link_tmp_is_create_new_semantics` (`fs_durability.rs:155`)
`tmp_guard_cleans_on_drop_but_not_after_disarm` (`fs_durability.rs:171`)

## `local_ship.rs` — 2389 L

Internals the existing note does not carry (or now contradicts):
- Retention: `JOURNAL_TERMINAL_RETENTION` (373) = 7 days; `terminal_entry_is_expired` (387) uses finished_at else mtime, and a future-dated stamp is NEVER expired; sweep mtime-prefilters then parses, deletes `<op>.preimage` with the entry, never a pending entry. The note's "entries are never pruned" is stale at pin.
- `sweep_journal_artifacts` (404): name filter before stat; `.json` leaf symlinks never contribute pending authority; a pending op is recognized only when a `.preimage` sibling exists; decode bounded by 64 KiB. `sweep_ufo_ship_tmp` (527) is scoped to the target's parent and runs after the lock, not over the journal root.
- Journal grammar: `ApplyJournalEntry` (156) is deny_unknown_fields; `APPLY_JOURNAL_SCHEMA` (130) exact; `MAX_JOURNAL_ENTRY_BYTES` (135) 64 KiB. `read_journal_entry` (1356) binds op_id to filename + 16 lowercase hex, digests are 64 hex (uppercase accepted), path must be all-Normal and pass the external-effect table, and a PENDING started_at must parse RFC3339 or the entry is MalformedEntry (guards the epoch-0 order bug).
- `journal_op_id` (331) hashes (path, before, candidate, millis, pid) and truncates to 16 hex; recovery matches the stored filename, never recomputes.
- `validate_journal_root_path` (271) compares raw spelling to its component-normalized form (kills trailing slash / duplicate separator), requires leaf `.ufo/apply-journal`, and lstat-refuses a symlinked workspace, `.ufo`, or leaf; missing components are allowed for begin.
- Lock namespace: `apply_lock_path` (642) hashes the normalized spelling (non-Normal → `<NON-NORMAL>`), so `./a` and `a` share a key while distinct spellings of one inode do not. `claim_apply_lock` (777) walks components for symlinks, reclaims a non-dir at the lock root, then handles three wedge shapes: legacy regular file (foreign/read-error → pid 0 ApplyLocked, dead/unparseable removed), per-target FIFO/socket, and plain dirs. `reclaim_aside` (755) renames to `<name>.reclaimed-{nanos}` and deletes only when the rename fails.
- `read_presence_body` (730) caps the body at 1024 B via take and refuses non-regular descriptors; `collect_live_peers` (1014) removes attempt-* directories, pushes read-error/non-regular and foreign-ns presences as pid 0 (live-unknown), sweeps dead/unparseable owners, and propagates dirent errors. `lock_owner_is_foreign` (683) fails closed on `-` and on an unreadable own ns.
- Recovery: `recover_apply_journal` (1185) loads all entries (any malformed aborts) then the LiveOwner gate is all-or-nothing; pending entries are grouped by path (sorted) and each group is resolved under ONE freshly claimed per-target lock, sampling the live digest AFTER the lock. `order_pending_for_path` (1100) requires a UNIQUE candidate==live tip, caches started_at millis once per entry, and falls back to started_at desc + op_id desc on ambiguity/cycles.
- `recover_pending` (1447): preimage symlink/non-regular → MalformedEntry, missing → MissingPreimage, live==before → RolledBack with no write, live!=candidate → conflict, digest owned by a settled Applied sibling → conflict (C2), preimage digest mismatch → MalformedEntry, vanished/hardlinked target → conflict, else atomic_replace then mark. `live_target_sha256` (1577) returns None (conflict) for missing/symlinked/non-regular/oversized targets.
- `apply_local_ship` (1644): journal root is validated AND its canonical workspace compared to the apply workspace before any sweep; resolve_regular_file runs before the lock; nlink>1 is refused; preimage len>8MiB is refused before read; a verifier that exits 0 but leaves the target unreadable restores the preimage and returns Err(Io) naming the restored tree. `VerifierOutcome` success is exit 0 AND both streams ≤ max_output_bytes.
- `atomic_write` (2269) now fsyncs the parent BEFORE the rename (2324) and again after (2332): D-C in the old note (missing pre-rename fsync) is stale at pin.
- `run_verifier` (2355): env_clear + PATH=/usr/bin:/bin + LC_ALL=C; Timeout sets timed_out true, IncompletePipe/spawn/Io keep timed_out false.

Paste pairs:
`APPLY_JOURNAL_SCHEMA` (`local_ship.rs:130`)
`MAX_JOURNAL_ENTRY_BYTES` (`local_ship.rs:135`)
`ApplyJournalEntry` (`local_ship.rs:156`)
`validate_journal_root_path` (`local_ship.rs:271`)
`journal_op_id` (`local_ship.rs:331`)
`JOURNAL_TERMINAL_RETENTION` (`local_ship.rs:373`)
`terminal_entry_is_expired` (`local_ship.rs:387`)
`sweep_journal_artifacts` (`local_ship.rs:404`)
`sweep_ufo_ship_tmp` (`local_ship.rs:527`)
`apply_lock_path` (`local_ship.rs:642`)
`lock_owner_is_foreign` (`local_ship.rs:683`)
`read_presence_body` (`local_ship.rs:730`)
`reclaim_aside` (`local_ship.rs:755`)
`claim_apply_lock` (`local_ship.rs:777`)
`collect_live_peers` (`local_ship.rs:1014`)
`order_pending_for_path` (`local_ship.rs:1100`)
`recover_apply_journal` (`local_ship.rs:1185`)
`read_journal_entry` (`local_ship.rs:1356`)
`recover_pending` (`local_ship.rs:1447`)
`live_target_sha256` (`local_ship.rs:1577`)
`apply_local_ship` (`local_ship.rs:1644`)
`atomic_write` (`local_ship.rs:2269`)
`run_verifier` (`local_ship.rs:2355`)

## `local_ship_tests.rs` — 81 tests / 23 `#[cfg(unix)]` (2969 L)

Prefix census: apply_lock 19, apply_journal 16, recovery_refuses 6, refused_verifier 4, journal_owner 4, recover_refuses 3, apply_refuses 3, rest single.
Behavior pins:
- `concurrent_apply_same_path_second_refuses_locked` (2215): real thread holding a `sleep 1` verifier; the second apply must return ApplyLocked while the first presence exists (pre-fix its HashMismatch/rollback destroyed the first commit).
- `apply_lock_fifo_presence_never_blocks_the_claim` (2516, unix): mkfifo attempt-* on disk; the claim must return within a 10 s recv_timeout, never hang on a blocking open.
- `recovery_refuses_symlinked_ufo_before_outside_restore` (894, unix): forged `.ufo -> outside/x`; recovery must be InvalidRoot AND the outside victim bytes unchanged; `JournalOp::begin` must return Symlink.
- `sweep_prunes_expired_terminal_entries_and_preimages` (1821): backdates by retention+60 s; old terminal json+preimage pruned, recent terminal kept, pending json+preimage kept.
- `apply_journal_recovery_rolls_back_pending_in_sorted_path_order` (794) pins `pending_list.sort_by(path)` (MutLocalShipGroup survivor) and self-stabilizes when read_dir already matches.
- `apply_journal_cycle_resolves_tip_by_live_match` (1386): digest cycle proves the fixpoint walk picks the live-matching tip, not a pairwise comparator.
- `apply_lock_three_way_lowest_named_wins` (2434): middle claimant refuses immediately and names the lowest live peer (min/max inversion kill).
- Helper: `ship` (23) hard-codes `journal: None` (42) — most cases exercise the unjournaled path; journaled end-to-end only via the receipt/refusal cases.

Paste pairs:
`ship` (`local_ship_tests.rs:23`)
`apply_journal_recovery_rolls_back_pending_in_sorted_path_order` (`local_ship_tests.rs:794`)
`recovery_refuses_symlinked_ufo_before_outside_restore` (`local_ship_tests.rs:894`)
`apply_journal_cycle_resolves_tip_by_live_match` (`local_ship_tests.rs:1386`)
`sweep_prunes_expired_terminal_entries_and_preimages` (`local_ship_tests.rs:1821`)
`concurrent_apply_same_path_second_refuses_locked` (`local_ship_tests.rs:2215`)
`apply_lock_three_way_lowest_named_wins` (`local_ship_tests.rs:2434`)
`apply_lock_fifo_presence_never_blocks_the_claim` (`local_ship_tests.rs:2516`)

## Cross-note drift (must be corrected by the new sections, not repeated)

- corpus/knowledge/local-ship.md: "bounded_fs (155) + fs_durability (277)" (now 149/198); `read_bounded_ident` :118-146 (now 112-137); TmpGuard `verify_staged` (gone); "journal entries are never pruned" (7 d terminal retention now); "ONE fsync_dir after the rename / D-C" (two fsyncs now, D-C fixed); Bounds table still correct except these.
- corpus/knowledge/test-inventories.md: local_ship_tests "85 tests / 8 groups" (now 81, 23 unix); `ship` journal None :87 (now :42); `dac_override_active` :31 and `mode_bits_enforced` :50 (absent at pin; finalize tests skip on `uid()==0` instead); corrupt-journal cycle :1686 (now :1386); startswith selector :3068 (file ends 2969).
- test-inventories' group map is therefore stale; do not restate its counts in the new section.

## Commands run (all read-only against the pin)

- `ls -la` + `wc -l` member files → 149/107/198/2389/2969.
- `grep -n` symbol maps on each member; `grep -c '#[test]'` → 81 (local_ship_tests), 5 (bounded_fs_tests), 5 (fs_durability); `grep -c '#[cfg(unix)]'` → 23.
- Full reads of bounded_fs.rs, bounded_fs_tests.rs, fs_durability.rs; targeted ranges of local_ship.rs (130-260, 260-410, 404-560, 600-790, 790-1015, 1018-1085, 1085-1240, 1240-1360, 1364-1446, 1447-1620, 1644-1835, 1847-1970, 2200-2240, 2268-2390) and local_ship_tests.rs (1-45, 793-810, 889-950, 1819-1883, 1882-1910, 2214-2245, 2513-2538).
- Anchor check: every (symbol,line) pair above was re-parsed and matched against the file line before writing; 54/54 pairs match, 0 dead ranges.
- Note: the section-body parser in scripts/claims-check.mjs requires `## ` + first backticked token path-like; each heading above uses the exact member basename, which resolves uniquely under --src. No tool installs; no writes outside this report.

## Confidence / unknowns

- Observed (high): line counts, symbol lines, test counts, branch text quoted above.
- [INFERENCE] R7's declared member pattern accepts all five basenames (assumed `crates/ufo-core-runtime/src/*.rs`; not re-derived from SCORECARD here).
- [INFERENCE] Whether the section bodies as finally written by the C2 executor keep one pair per line — the only formatting rule that can turn these anchors into `noid`/`elsewhere`.
- Not evaluated: runtime behavior, build/test execution (out of scope, read-only).
