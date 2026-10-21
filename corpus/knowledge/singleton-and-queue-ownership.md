# Singleton locks and queue ownership

> **Round-35 fidelity notice (2026-10-20).** The upstream tree moved from
> `964f443e` to `31c465f1`. Round-35 fidelity seats found 9 line anchors in this
> note that no longer land on their claim at `31c465f1` (moved, changed or gone;
> several were already off at the revision their section names). Anchors below
> are true only at the revision each section states; the member sections still
> pass the claims gate, which checks anchor liveness, not symbol-on-line.
> Re-anchoring is queued (SCORECARD.md `## Limits`, round 35); per-anchor
> findings are in the lane's round-35 wave reports (build directory, Fid*).

Registry family **S5** companion note for `scripts/ufo-mission-result.mjs`
lock helpers. The path-form member section lives once in
`knowledge/failure-telemetry.md` (`## `scripts/ufo-mission-result.mjs``) so the
claims gate counts the file once; this note keeps topic headings and live
own-file anchors only.

## `acquireSingletonLock`

`scripts/ufo-mission-result.mjs` export at
`scripts/ufo-mission-result.mjs:1308` (prior note said ~L1716 — **dead after
the 3691→2966 shrink**; corrected this round). Used by fleet-dispatcher,
ufo-l0-watch, ufo-stale-watchdog. Mechanism: lock body `<pid>\n` +
inode-bound owner hardlink `<ownerLinkPrefix>.<pid>.<starttime|x>.<bootId|
x>.<hex32>` published atomically; takeover under a transient
`<lock>.takeover` ticket so two starts can't interleave. PID existence
alone can't distinguish reuse — starttime+bootId bind identity to the lock
inode. Second start while owner identity is live → refused, exit 0
(`watchdog_instance_refused` / `lock_path_occupied`). Two daemons would
clobber last-writer-wins state and double-fire respawn/whip ladders.

Related hub symbols (same member file): `appendRotatingLog` at
`scripts/ufo-mission-result.mjs:1731`, `writeFileAtomicIfChanged` at
`scripts/ufo-mission-result.mjs:1876`, `gatedConfigPath` at
`scripts/ufo-mission-result.mjs:2143`, `newestMtime` at
`scripts/ufo-mission-result.mjs:2566`, `isMainModule` at
`scripts/ufo-mission-result.mjs:2391`.

## Queue ownership

`fleet-dispatcher.mjs` owns `.ufo/pending-work.json` (`ufo-pending-work-v1`)
exclusively — validation, lock, ledger evidence (`fleet-ledger.jsonl`,
rotates at 10 MiB to `.jsonl.N`, cold archives never auto-deleted).
Watchdogs repend THROUGH the dispatcher (`fleet-dispatcher repend`); a
refusal (task terminal / mission live again) is a durable answer; a thrown
error retries via `state.pendingRepend`. Empty queue is idle — the
dispatcher never invents prompts, fleet-size refill, or filler missions.
Owner family for the dispatcher itself is **S1**, not S5.

## Exec-path trust boundary

Env-overridable exec/config paths (`UFO_SIGHTING_PATH`, `UFO_CONFIG_PATH`,
`UFO_GODSPEED_DIRECTIVE_PATH`) must resolve beneath the realpath'd project
root — symlink components refused, fail closed `EXEC_PATH_OUTSIDE_ROOT`;
`UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` is the test-only escape
(`fleet-dispatcher.mjs` `gatedExecPath`). Config-path gating shared from S5
hub: `gatedConfigPath` (`scripts/ufo-mission-result.mjs:2143`).

Sources: `scripts/ufo-mission-result.mjs` `acquireSingletonLock` at
`scripts/ufo-mission-result.mjs:1308`; `scripts/ufo-stale-watchdog.mjs`
header (SH-03); `scripts/fleet-dispatcher.mjs` header + `gatedExecPath`;
`scripts/ufo-l0-watch.mjs` header.

## Round-32 recensus notes

- No path-form `## `scripts/…`` section here (avoids occurrence double-count
  with `failure-telemetry.md`).
- Dead anchor `~L1716` → live `scripts/ufo-mission-result.mjs:1308`.
- No section removed for a missing tree file — the lock export remains.
