FIDELITY scripts/ufo-stale-watchdog.mjs anchors=129 ok=1 moved=67 changed=45 gone=16
ops-watchers.md:21 | :1–:30 | refire/L2-steer ownership | changed | scripts/ufo-l0-watch.mjs:1436-1646 | daa371583; re-anchored at 31c465f1: describe this as a compatibility leaf; duty moved to the watch.
ops-watchers.md:21 | :81 | reads .ufo/sessions | moved | scripts/ufo-l0-watch.mjs:198 | daa371583; re-anchored at 31c465f1: move sessions scan ownership to the watch.
ops-watchers.md:21 | :83 | writes stale-watchdog-state.json | gone | scripts/ufo-l0-watch.mjs:166 | daa371583; re-anchored at 31c465f1: remove this artifact claim; state now belongs to l0-watch.
ops-watchers.md:21 | :82 | stale-watchdog.jsonl path | moved | scripts/ufo-stale-watchdog.mjs:42 | daa371583; re-anchored at 31c465f1: retain the telemetry path at line 42.
ops-watchers.md:23 | :132 | POLL_MS=300000 | moved | scripts/ufo-l0-watch.mjs:193 | daa371583; re-anchored at 31c465f1: use MISSION_DUTY_INTERVAL_MS.
ops-watchers.md:23 | :996 | daemon for-loop | moved | scripts/ufo-l0-watch.mjs:2207 | daa371583; re-anchored at 31c465f1: loop now belongs to the watch.
ops-watchers.md:23 | :1006 | spinWait cadence | moved | scripts/ufo-l0-watch.mjs:2223 | daa371583; re-anchored at 31c465f1: anchor the watch's INTERVAL_MS wait.
ops-watchers.md:23 | :1001 | tick_error | moved | scripts/ufo-l0-watch.mjs:2221 | daa371583; re-anchored at 31c465f1: tick faults are logged by the watch.
ops-watchers.md:23 | :693 | tick() | moved | scripts/ufo-l0-watch.mjs:1856 | daa371583; re-anchored at 31c465f1: tick moved to the watch.
ops-watchers.md:23 | :706–:722 | finally state save | changed | scripts/ufo-l0-watch.mjs:2048 | daa371583; re-anchored at 31c465f1: say state is written at normal tick end, not in finally.
ops-watchers.md:23 | :715 | isPlainObject save guard | changed | scripts/ufo-l0-watch.mjs:2048 | daa371583; re-anchored at 31c465f1: remove the old guard; watch writes its state normally.
ops-watchers.md:23 | :719 | state_save_error | changed | scripts/ufo-l0-watch.mjs:2048,2221 | daa371583; re-anchored at 31c465f1: tick write faults surface as tick_error.
ops-watchers.md:23 | :734 | runTickDuties | moved | scripts/ufo-l0-watch.mjs:1477 | daa371583; re-anchored at 31c465f1: duty is missionDuty.
ops-watchers.md:25 | :734– | runTickDuties tick-order anchor | moved | scripts/ufo-l0-watch.mjs:1477 | daa371583; re-anchored at 31c465f1: duty is missionDuty.
ops-watchers.md:26 | :740 | STATE_TABLES lazy-init | changed | scripts/ufo-l0-watch.mjs:397 | daa371583; re-anchored at 31c465f1: describe the single missions state table.
ops-watchers.md:27 | :748 | drain pendingRepend before status | changed | scripts/ufo-l0-watch.mjs:1644-1655 | daa371583; re-anchored at 31c465f1: watch repends immediately; deferred drain is gone.
ops-watchers.md:28 | :757 | status probe | moved | scripts/ufo-l0-watch.mjs:1441 | daa371583; re-anchored at 31c465f1: status runs inside the watch duty.
ops-watchers.md:29 | :769 | status_malformed | changed | scripts/ufo-l0-watch.mjs:1513-1515 | daa371583; re-anchored at 31c465f1: event is mission_status_malformed.
ops-watchers.md:29 | :781 | element_shape | changed | scripts/ufo-l0-watch.mjs:1512-1515 | daa371583; re-anchored at 31c465f1: describe the consolidated mission shape fault.
ops-watchers.md:29 | :783 | running/working scope | changed | scripts/ufo-l0-watch.mjs:1522-1524,1555-1569 | daa371583; re-anchored at 31c465f1: include queue-row, out-of-scope, and receipted gates.
ops-watchers.md:30 | :931–:932 | prune skips pendingRepend | changed | scripts/ufo-l0-watch.mjs:1655 | daa371583; re-anchored at 31c465f1: describe immediate mission-row deletion after repend.
ops-watchers.md:32 | :799 | loadSwarmPolicy | moved | scripts/ufo-l0-watch.mjs:1531 | daa371583; re-anchored at 31c465f1: policy read moved to missionDuty.
ops-watchers.md:32 | :801 | waveMinLanes mapping | moved | scripts/ufo-l0-watch.mjs:1532 | daa371583; re-anchored at 31c465f1: retain the waveMinLanes mapping.
ops-watchers.md:32 | :807 | fallback doctrine object | changed | scripts/ufo-l0-watch.mjs:1535 | daa371583; re-anchored at 31c465f1: remove the source field; fallback floor remains 16.
ops-watchers.md:34 | :133 | STALE_MS | moved | scripts/ufo-l0-watch.mjs:194 | daa371583; re-anchored at 31c465f1: use MISSION_STALE_MS.
ops-watchers.md:34 | :824 | newestMtime transcript filter | moved | scripts/ufo-l0-watch.mjs:1575 | daa371583; re-anchored at 31c465f1: scan session .jsonl files in the watch.
ops-watchers.md:34 | :783 | mission running/working filter | changed | scripts/ufo-l0-watch.mjs:1522-1524,1555-1569 | daa371583; re-anchored at 31c465f1: note the additional queue and receipt scope gates.
ops-watchers.md:34 | :842 | age calculation | moved | scripts/ufo-l0-watch.mjs:1586 | daa371583; re-anchored at 31c465f1: retain the clamped age calculation.
ops-watchers.md:34 | :134 | MAX_NUDGES | moved | scripts/ufo-l0-watch.mjs:195 | daa371583; re-anchored at 31c465f1: use MISSION_MAX_NUDGES.
ops-watchers.md:34 | :135 | MAX_REFIRE_ATTEMPTS | moved | scripts/ufo-l0-watch.mjs:196 | daa371583; re-anchored at 31c465f1: use MISSION_MAX_REFIRE_ATTEMPTS.
ops-watchers.md:34 | :136 | MAX_REPEND_ATTEMPTS=12 | moved | scripts/ufo-stale-watchdog.mjs:44 | daa371583; re-anchored at 31c465f1: retain the 12-attempt repend bound.
ops-watchers.md:34 | :142 | L2_TARGET fallback floor | moved | scripts/ufo-l0-watch.mjs:197 | daa371583; re-anchored at 31c465f1: use MISSION_L2_FLOOR.
ops-watchers.md:34 | :536 | FLASH_PROBE_MS | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove the flash probe; it has no consumer.
ops-watchers.md:40 | :869 | l2_steer event | moved | scripts/ufo-l0-watch.mjs:1599 | daa371583; re-anchored at 31c465f1: l2_steer now records a watch action.
ops-watchers.md:40 | :863–:864 | band text | moved | scripts/ufo-l0-watch.mjs:1591-1593 | daa371583; re-anchored at 31c465f1: move the band rendering to missionDuty.
ops-watchers.md:40 | :867 | steer text | moved | scripts/ufo-l0-watch.mjs:1597 | daa371583; re-anchored at 31c465f1: move the L2 steer text to the watch.
ops-watchers.md:41 | :874 | recovered event | changed | scripts/ufo-l0-watch.mjs:1609 | daa371583; re-anchored at 31c465f1: event name is mission_recovered.
ops-watchers.md:42 | :889–:890 | nudge stale text | moved | scripts/ufo-l0-watch.mjs:1616 | daa371583; re-anchored at 31c465f1: retain no-session-write wording in the watch.
ops-watchers.md:42 | :892 | nudge steer text | moved | scripts/ufo-l0-watch.mjs:1618 | daa371583; re-anchored at 31c465f1: move the steer call to the watch.
ops-watchers.md:42 | :893 | nudge event | changed | scripts/ufo-l0-watch.mjs:1619 | daa371583; re-anchored at 31c465f1: event name is mission_nudge.
ops-watchers.md:43 | :909 | remove mission | moved | scripts/ufo-l0-watch.mjs:1635 | daa371583; re-anchored at 31c465f1: removeFn owns mission removal.
ops-watchers.md:43 | :914 | refire_removed | changed | scripts/ufo-l0-watch.mjs:1640 | daa371583; re-anchored at 31c465f1: event name is mission_refired.
ops-watchers.md:43 | :915 | pendingRepend init | changed | scripts/ufo-l0-watch.mjs:1644-1655 | daa371583; re-anchored at 31c465f1: immediate repend replaces refire-arm deferral.
ops-watchers.md:44 | :903 | refire_exhausted | changed | scripts/ufo-l0-watch.mjs:1629 | daa371583; re-anchored at 31c465f1: event name is mission_refire_exhausted.
ops-watchers.md:48 | :621–:687 | attemptRepend state machine | moved | scripts/ufo-stale-watchdog.mjs:190-248 | daa371583; re-anchored at 31c465f1: retain as exported seam; production watch calls rependTask directly.
ops-watchers.md:49 | :637 | refire_repended | moved | scripts/ufo-stale-watchdog.mjs:206 | daa371583; re-anchored at 31c465f1: retain the refire_repended event.
ops-watchers.md:50 | :644 | mission_live refusal | moved | scripts/ufo-stale-watchdog.mjs:213 | daa371583; re-anchored at 31c465f1: retain the bounded refusal event.
ops-watchers.md:50 | :646 | mission_live exhaustion | moved | scripts/ufo-stale-watchdog.mjs:215 | daa371583; re-anchored at 31c465f1: retain mission_live exhaustion at 12.
ops-watchers.md:51 | :662 | stale_registered remove | moved | scripts/ufo-stale-watchdog.mjs:227 | daa371583; re-anchored at 31c465f1: retain removal; add the stale_row_remove_error arm.
ops-watchers.md:51 | :667 | stale_registered exhaustion | moved | scripts/ufo-stale-watchdog.mjs:232 | daa371583; re-anchored at 31c465f1: retain stale_registered exhaustion at 12.
ops-watchers.md:52 | :672 | other-reason refusal | moved | scripts/ufo-stale-watchdog.mjs:237 | daa371583; re-anchored at 31c465f1: retain durable refusal and row deletion.
ops-watchers.md:53 | :677 | repend_error | moved | scripts/ufo-stale-watchdog.mjs:242 | daa371583; re-anchored at 31c465f1: retain repend_error handling.
ops-watchers.md:53 | :683 | throw exhaustion reason | moved | scripts/ufo-stale-watchdog.mjs:244 | daa371583; re-anchored at 31c465f1: retain e.code-or-null exhaustion reason.
ops-watchers.md:55 | :505 | dispatcher repend exec | moved | scripts/ufo-stale-watchdog.mjs:140 | daa371583; re-anchored at 31c465f1: retain dispatcher repend invocation.
ops-watchers.md:55 | :523 | parseReportOutput | moved | scripts/ufo-stale-watchdog.mjs:151 | daa371583; re-anchored at 31c465f1: retain the parsed child report.
ops-watchers.md:55 | :16–:17 | dispatcher queue ownership comment | moved | scripts/ufo-stale-watchdog.mjs:127-128 | daa371583; re-anchored at 31c465f1: retain dispatcher ownership of lock, validation, and ledger.
ops-watchers.md:55 | :515 | dispatcher_usage_error | moved | scripts/ufo-stale-watchdog.mjs:147 | daa371583; re-anchored at 31c465f1: retain durable usage-error classification.
ops-watchers.md:57 | :979 | acquireWatchdogLock | moved | scripts/ufo-l0-watch.mjs:2175 | daa371583; re-anchored at 31c465f1: lock acquisition moved to acquireWatchLock.
ops-watchers.md:57 | :955 | stale-watchdog.lock | changed | scripts/ufo-l0-watch.mjs:2066 | daa371583; re-anchored at 31c465f1: rename the active lock to l0-watch.lock.
ops-watchers.md:57 | :956 | stale-watchdog.owner prefix | changed | scripts/ufo-l0-watch.mjs:2067 | daa371583; re-anchored at 31c465f1: rename the owner prefix to .l0-watch.owner.
ops-watchers.md:57 | :983 | watchdog_instance_refused | changed | scripts/ufo-l0-watch.mjs:2179 | daa371583; re-anchored at 31c465f1: event is watch_instance_refused.
ops-watchers.md:57 | :984 | exit(0) on lock refusal | moved | scripts/ufo-l0-watch.mjs:2193 | daa371583; re-anchored at 31c465f1: retain exit zero on live-owner refusal.
ops-watchers.md:57 | :986 | watchdog_start | changed | scripts/ufo-l0-watch.mjs:2206 | daa371583; re-anchored at 31c465f1: event is watch_start.
ops-watchers.md:57 | :989 | watchdog_start_error | changed | scripts/ufo-l0-watch.mjs:2197 | daa371583; re-anchored at 31c465f1: event/stage now use watch_start_error and startup.
ops-watchers.md:59 | :731 | UFO_CONFIG_PATH | moved | scripts/ufo-l0-watch.mjs:1531-1532 | daa371583; re-anchored at 31c465f1: config gating moved into mission policy.
ops-watchers.md:59 | :808 | policy_unreadable | changed | scripts/ufo-l0-watch.mjs:1537-1540 | daa371583; re-anchored at 31c465f1: event is mission_policy_unreadable.
ops-watchers.md:59 | :79–:83 | path constants | changed | scripts/ufo-stale-watchdog.mjs:40-44 | daa371583; re-anchored at 31c465f1: retain SIGHTING, DISPATCHER, and LOG; remove SESSIONS and STATE.
ops-watchers.md:59 | :509 | d.env test seam | moved | scripts/ufo-stale-watchdog.mjs:144 | daa371583; re-anchored at 31c465f1: retain the child environment seam.
ops-watchers.md:61 | :130 | MAX_LOG_BYTES | moved | scripts/ufo-stale-watchdog.mjs:43 | daa371583; re-anchored at 31c465f1: retain the shared evidence-log cap.
ops-watchers.md:61 | :185 | watchdog_log_rotated | moved | scripts/ufo-stale-watchdog.mjs:82 | daa371583; re-anchored at 31c465f1: retain rotation event.
ops-watchers.md:61 | :190 | watchdog_log_rotate_failed | moved | scripts/ufo-stale-watchdog.mjs:87 | daa371583; re-anchored at 31c465f1: retain rotation-failure event.
ops-watchers.md:62 | :983 | lifecycle instance refusal | changed | scripts/ufo-l0-watch.mjs:2179 | daa371583; re-anchored at 31c465f1: use watch_instance_refused.
ops-watchers.md:62 | :986 | lifecycle start event | changed | scripts/ufo-l0-watch.mjs:2206 | daa371583; re-anchored at 31c465f1: use watch_start.
ops-watchers.md:62 | :989 | lifecycle start error | changed | scripts/ufo-l0-watch.mjs:2197 | daa371583; re-anchored at 31c465f1: use watch_start_error.
ops-watchers.md:62 | :1001 | lifecycle tick_error | moved | scripts/ufo-l0-watch.mjs:2221 | daa371583; re-anchored at 31c465f1: retain tick_error in the watch loop.
ops-watchers.md:63 | :281 | state_load_error | changed | scripts/ufo-stale-watchdog.mjs:111 | daa371583; re-anchored at 31c465f1: limit this event to pendingRepend row-shape faults; loadState is gone.
ops-watchers.md:63 | :719 | state_save_error | changed | scripts/ufo-l0-watch.mjs:2048,2221 | daa371583; re-anchored at 31c465f1: state-write failures now reach tick_error.
ops-watchers.md:64 | :769 | status_malformed | changed | scripts/ufo-l0-watch.mjs:1513 | daa371583; re-anchored at 31c465f1: use mission_status_malformed.
ops-watchers.md:64 | :781 | element_shape | changed | scripts/ufo-l0-watch.mjs:1512-1515 | daa371583; re-anchored at 31c465f1: describe the consolidated shape fault.
ops-watchers.md:64 | :815 | mission_skipped | moved | scripts/ufo-l0-watch.mjs:1545 | daa371583; re-anchored at 31c465f1: retain mission_skipped as a watch action.
ops-watchers.md:64 | :826 | scan_error | changed | scripts/ufo-l0-watch.mjs:1577 | daa371583; re-anchored at 31c465f1: event/action is mission_scan_error.
ops-watchers.md:64 | :840 | future_mtime | changed | scripts/ufo-l0-watch.mjs:1583-1585 | daa371583; re-anchored at 31c465f1: action is mission_future_mtime.
ops-watchers.md:64 | :808 | policy_unreadable | changed | scripts/ufo-l0-watch.mjs:1537-1540 | daa371583; re-anchored at 31c465f1: use mission_policy_unreadable.
ops-watchers.md:65 | :869 | l2_steer | moved | scripts/ufo-l0-watch.mjs:1599 | daa371583; re-anchored at 31c465f1: retain l2_steer as a watch action.
ops-watchers.md:65 | :874 | recovered | changed | scripts/ufo-l0-watch.mjs:1609 | daa371583; re-anchored at 31c465f1: use mission_recovered.
ops-watchers.md:65 | :893 | nudge | changed | scripts/ufo-l0-watch.mjs:1619 | daa371583; re-anchored at 31c465f1: use mission_nudge.
ops-watchers.md:65 | :914 | refire_removed | changed | scripts/ufo-l0-watch.mjs:1640 | daa371583; re-anchored at 31c465f1: use mission_refired.
ops-watchers.md:65 | :903 | refire_exhausted | changed | scripts/ufo-l0-watch.mjs:1629 | daa371583; re-anchored at 31c465f1: use mission_refire_exhausted.
ops-watchers.md:66 | :631 | repend_skipped | moved | scripts/ufo-stale-watchdog.mjs:200 | daa371583; re-anchored at 31c465f1: retain the exported-seam invalid-runId event.
ops-watchers.md:66 | :750 | repend_skipped in drain | gone | scripts/ufo-l0-watch.mjs:1644-1655 | daa371583; re-anchored at 31c465f1: remove the deleted per-tick drain-site citation.
ops-watchers.md:66 | :637 | refire_repended | moved | scripts/ufo-stale-watchdog.mjs:206 | daa371583; re-anchored at 31c465f1: retain refire_repended.
ops-watchers.md:66 | :644 | mission_live refusal | moved | scripts/ufo-stale-watchdog.mjs:213 | daa371583; re-anchored at 31c465f1: retain mission_live refusal.
ops-watchers.md:66 | :672 | other-reason refusal | moved | scripts/ufo-stale-watchdog.mjs:237 | daa371583; re-anchored at 31c465f1: retain other-reason refusal.
ops-watchers.md:66 | :646 | mission_live exhaustion | moved | scripts/ufo-stale-watchdog.mjs:215 | daa371583; re-anchored at 31c465f1: retain exhaustion at 12 attempts.
ops-watchers.md:66 | :667 | stale_registered exhaustion | moved | scripts/ufo-stale-watchdog.mjs:232 | daa371583; re-anchored at 31c465f1: retain stale_registered exhaustion.
ops-watchers.md:66 | :683 | throw exhaustion reason | moved | scripts/ufo-stale-watchdog.mjs:244 | daa371583; re-anchored at 31c465f1: retain e.code-or-null reason.
ops-watchers.md:66 | :677 | repend_error | moved | scripts/ufo-stale-watchdog.mjs:242 | daa371583; re-anchored at 31c465f1: retain repend_error.
ops-watchers.md:67 | :585 | flash_live | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove flash_live; the route probe was deleted.
ops-watchers.md:67 | :581 | flash_probe_fail | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove flash_probe_fail; the route probe was deleted.
ops-watchers.md:69 | :830 | scan-error blindness guard | moved | scripts/ufo-l0-watch.mjs:1581 | daa371583; re-anchored at 31c465f1: retain the partial-scan guard.
ops-watchers.md:69 | :839 | future-mtime guard | moved | scripts/ufo-l0-watch.mjs:1582 | daa371583; re-anchored at 31c465f1: retain future-mtime protection.
ops-watchers.md:69 | :840 | future_mtime | changed | scripts/ufo-l0-watch.mjs:1583-1585 | daa371583; re-anchored at 31c465f1: use mission_future_mtime.
ops-watchers.md:69 | :768 | malformed status guard | moved | scripts/ufo-l0-watch.mjs:1511-1515 | daa371583; re-anchored at 31c465f1: retain the malformed-status early return.
ops-watchers.md:71 | :147 | RUN_ID_PATTERN | moved | scripts/ufo-stale-watchdog.mjs:50 | daa371583; re-anchored at 31c465f1: retain the run-id pattern.
ops-watchers.md:71 | :154 | isSafeRunId | moved | scripts/ufo-stale-watchdog.mjs:53 | daa371583; re-anchored at 31c465f1: retain inherited-key rejection.
ops-watchers.md:71 | :160 | boundedRunId | moved | scripts/ufo-stale-watchdog.mjs:54 | daa371583; re-anchored at 31c465f1: retain 128-character clipping.
ops-watchers.md:73 | :126 | MAX_STATE_BYTES | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove the leaf state-file byte bound.
ops-watchers.md:73 | :256 | five STATE_TABLES | changed | scripts/ufo-l0-watch.mjs:397-408 | daa371583; re-anchored at 31c465f1: describe per-mission watch state, not five tables.
ops-watchers.md:73 | :264 | nonnegSafeInt | changed | scripts/ufo-stale-watchdog.mjs:171-176 | daa371583; re-anchored at 31c465f1: describe inline pendingRepend count validation.
ops-watchers.md:73 | :266 | ENTRY_RULES | gone | scripts/ufo-stale-watchdog.mjs:164-186 | daa371583; re-anchored at 31c465f1: remove the deleted ENTRY_RULES table.
ops-watchers.md:73 | :370 | salvagePendingRepend | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove the deleted salvage routine.
ops-watchers.md:75 | :561 | flashProbe | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove the deleted flash probe.
ops-watchers.md:75 | :572 | state.flashLive early return | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove flash-live backoff state.
ops-watchers.md:75 | :550 | omp flash command | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove the consumerless flash-route command.
ops-watchers.md:75 | :579 | FLASH_OK matcher | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove the deleted response matcher.
ops-watchers.md:75 | :584–:585 | flash_live success | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove flash-live success telemetry.
ops-watchers.md:77 | :984 | exit zero on refusal | moved | scripts/ufo-l0-watch.mjs:2193 | daa371583; re-anchored at 31c465f1: retain exit zero on watch refusal.
ops-watchers.md:77 | :972 | usage schema/message | gone | scripts/ufo-stale-watchdog.mjs:20 | daa371583; re-anchored at 31c465f1: remove the stale leaf's argv-refusal contract.
ops-watchers.md:77 | :974 | usage exit 64 | gone | scripts/ufo-stale-watchdog.mjs:20 | daa371583; re-anchored at 31c465f1: remove the stale leaf's argv-refusal exit.
ops-watchers.md:77 | :991-region | start-failure exit 1 | moved | scripts/ufo-l0-watch.mjs:2198 | daa371583; re-anchored at 31c465f1: anchor watch startup failure.
ops-watchers.md:79 | :79 | ufo-sighting child constant | moved | scripts/ufo-stale-watchdog.mjs:40 | daa371583; re-anchored at 31c465f1: retain SIGHTING path; status/steer duties moved to watch.
ops-watchers.md:79 | :80 | dispatcher child constant | moved | scripts/ufo-stale-watchdog.mjs:41 | daa371583; re-anchored at 31c465f1: retain DISPATCHER path.
ops-watchers.md:79 | :550 | omp child | gone | scripts/ufo-stale-watchdog.mjs:8-10 | daa371583; re-anchored at 31c465f1: remove the deleted omp probe dependency.
ops-watchers.md:79 | :110 | emitFor/writeSync fallback | changed | scripts/ufo-stale-watchdog.mjs:191-192 | daa371583; re-anchored at 31c465f1: retain direct deps.log seam; remove writeSync fallback claim.
ops-watchers.md:125 | :16-:18 | quoted never-writes statement | changed | scripts/ufo-stale-watchdog.mjs:127-140 | daa371583; re-anchored at 31c465f1: quote the dispatcher delegation comment, not the deleted phrase.
ops-watchers.md:168 | :16-:18 | never-writes/delegates-repend claim | changed | scripts/ufo-stale-watchdog.mjs:127-140 | daa371583; re-anchored at 31c465f1: retain delegation; remove the absent verbatim quote.
ops-watchers.md:169 | :821 | transcript-only session liveness | changed | scripts/ufo-l0-watch.mjs:1575 | daa371583; re-anchored at 31c465f1: say only .jsonl mtimes count; state dumps do not.
singleton-and-queue-ownership.md:51 | header (SH-03) | stale-watchdog singleton header | moved | scripts/ufo-l0-watch.mjs:2053-2067 | Round-32; re-anchored at 31c465f1: source SH-03 from the watch lock header.

Additional unanchored drift:
- ops-watchers.md:6-7 records `ufo-stale-watchdog` as 1010 lines under `daa371583`; the pinned member is 250 lines at `31c465f1` (siblings also changed).
- singleton-and-queue-ownership.md:14 says `acquireSingletonLock` is used by fleet-dispatcher and ufo-stale-watchdog; at 31c465f1 only ufo-l0-watch has a call/import in the checked caller set. The leaf lock is deleted.
- singleton-and-queue-ownership.md queue prose says thrown repend errors retry through production `state.pendingRepend`; watch now repends immediately and leaves debt to the monitor/night-watchdog helper. `attemptRepend` remains exported, but the watch imports `rependTask` only.
- remaining-scripts-census.md:152 and :785-787 concern the separate test member, not this assignment; that suite is 756→133 lines and 27→9 `test()` cases. Its `emitFor`/stderr-fallback and STALE_MS prose is stale after the fold.
- Hub dependency anchors in ops-watchers.md:79 target `ufo-mission-result.mjs`, not this member; they are excluded from the tally. LSP device/server unavailable in this lane; no LSP status/references/definitions/diagnostics were callable. [INFERENCE]

Commands/evidence:
- `git show 964f443e:scripts/ufo-stale-watchdog.mjs | wc -l` → `1010`; `git show 31c465f1:scripts/ufo-stale-watchdog.mjs | wc -l` → `250`.
- `git diff 964f443e 31c465f1 -- scripts/ufo-stale-watchdog.mjs` → `1 file changed, 49 insertions(+), 809 deletions(-)`; diff header moves daemon ownership to compatibility leaf and deletes the mission ladder/tick/lock.
- Read pinned source slices at all cited stale-watchdog lines plus complete old `:621-:687`, old tick/save `:693-:722`, new leaf `:1-:250`; watch absorption anchors include `:1477`, `:1531-:1537`, `:1575-:1586`, `:1591-:1646`, `:2048`, `:2053-:2067`, `:2175-:2223`.
- `git grep -n acquireSingletonLock 31c465f1 -- scripts/fleet-dispatcher.mjs scripts/ufo-l0-watch.mjs scripts/ufo-l0-monitor.mjs` → only `ufo-l0-watch.mjs` import/wrapper/call (`:58`, `:2058`, `:2064`).
- Test-member cross-check: old/new test `wc -l` → `756`/`133`; `grep -c '^test('` → `27`/`9`. `node --check new.mjs && node --check watch.mjs` → `CHECK_OK`.
