# Singleton locks and queue ownership

## `acquireSingletonLock`

`scripts/ufo-mission-result.mjs` (export ~L1716). Used by fleet-dispatcher,
ufo-l0-watch, ufo-stale-watchdog. Mechanism: lock body `<pid>\n` +
inode-bound owner hardlink `<ownerLinkPrefix>.<pid>.<starttime|x>.<bootId|
x>.<hex32>` published atomically; takeover under a transient
`<lock>.takeover` ticket so two starts can't interleave. PID existence
alone can't distinguish reuse — starttime+bootId bind identity to the lock
inode. Second start while owner identity is live → refused, exit 0
(`watchdog_instance_refused` / `lock_path_occupied`). Two daemons would
clobber last-writer-wins state and double-fire respawn/whip ladders.

## Queue ownership

`fleet-dispatcher.mjs` owns `.ufo/pending-work.json` (`ufo-pending-work-v1`)
exclusively — validation, lock, ledger evidence (`fleet-ledger.jsonl`,
rotates at 10 MiB to `.jsonl.N`, cold archives never auto-deleted).
Watchdogs repend THROUGH the dispatcher (`fleet-dispatcher repend`); a
refusal (task terminal / mission live again) is a durable answer; a thrown
error retries via `state.pendingRepend`. Empty queue is idle — the
dispatcher never invents prompts, fleet-size refill, or filler missions.

## Exec-path trust boundary

Env-overridable exec/config paths (`UFO_SIGHTING_PATH`, `UFO_CONFIG_PATH`,
`UFO_GODSPEED_DIRECTIVE_PATH`) must resolve beneath the realpath'd project
root — symlink components refused, fail closed `EXEC_PATH_OUTSIDE_ROOT`;
`UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` is the test-only escape
(`fleet-dispatcher.mjs` `gatedExecPath`).

Sources: `scripts/ufo-mission-result.mjs` `acquireSingletonLock` docstring;
`scripts/ufo-stale-watchdog.mjs` header (SH-03); `scripts/fleet-dispatcher.mjs`
header + `gatedExecPath`; `scripts/ufo-l0-watch.mjs` header.
