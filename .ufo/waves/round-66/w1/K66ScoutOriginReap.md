VERDICT: The pin was not reaped by `purge-lane` nor successfully by disk-guard's rm — it was classified eligible by `sweep`'s 45-minute no-write idle rule during a manual `sweep --all` pass (rm failed on the a-w clone), then removed by a non-guard actor within 96 s; the recreated pin is eligible again today, and the fix is to move it outside the guard root (`/fast/scratch/hyaku-pin/src`) plus a proxy-check recreate-on-demand arm (patch text in the finding).

## Evidence

- `grep -n "kumitate-pin" .ufo/state/disk-guard.log` (fleet, 18,068 lines, 2026-10-26T02:31Z → now):
  `14088:2026-10-26T12:12:06Z defer /fast/scratch/hyaku/kumitate-pin 34.4 idle=2286 rm-failed` — the ONLY line naming the pin; no `delete` line exists.
- Same log, the next `--all` pass 96 s later: `14267:...12:13:43Z pressure /fast/scratch/hyaku ... all=1` / `14268 keep-excluded ... base-census.sh` / `14269 ok ... no-eligible-entries` → the pin dir was already gone; every candidate gets exactly one classify/delete line (`disk-guard.sh:472-524,606-660`).
- The 12:10:30/12:11:33 passes (`13123`,`14072`): `pressure ... use=28% soft=70% target=1% emergency=0 all=1` — manual `sweep --all` (SOFT gate bypassed) at 28 % use. No fleet script invokes `--all`: `grep -rn "sweep.*--all" scripts/` → empty; `inline.sh:62` runs plain `sweep`; `inline-dispatcher.py:172-178` runs `sweep`/`sweep --emergency` only.
- `grep -n "purge-lane" .ufo/state/disk-guard.log` → only `keep-live ... purge-lane <lane>-r<N>` lines; `cmd_purge_lane` targets exactly `$HYAKU_SCRATCH/<lane>-r<round>` with `[[ $round =~ ^[0-9]+$ ]]` (`disk-guard.sh:788-843`) → purge-lane cannot name `kumitate-pin`.
- Repro (fixture, cleaned up): `rm -rf --one-file-system` on a `chmod -R a-w` tree → `rm-rc=1`, tree fully intact (EACCES) — so the 12:12:06 rm-failed left the pin in place; its removal 0–96 s later was a non-guard actor [INFERENCE: most plausibly manual root cleanup; no shell-history record found].
- Eligibility re-check on the live recreated pin: `/fast/scratch/hyaku/kumitate-pin/src` is `dr-xr-xr-x`, HEAD `31c465f15669f744848bd9f5d56191c5085670f7` = `origin.json` revision; keep file `/home/vgpnk/Projects/shokunin/.ufo/state/disk-guard.keep` → `No such file or directory`. Liveness = no write within `IDLE_MIN` (45 min, mtime-based) + no process inside (`disk-guard.sh:410-417`): a read-only clone is permanently "idle".
- `bash scripts/hyaku/disk-guard.sh status` (read-only verb, run this seat): exit 0; `/fast/scratch/hyaku 27%` below SOFT; top consumers listed — `kumitate-pin` (34 MB) eligible-sized but unprotected.
- Receipt: `base/proxy-before-src-reaped.txt`: `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /fast/scratch/hyaku/kumitate-pin/src is absent`, EXIT=2; arm fired at `proxy-check.mjs:420` (`resolveOrigin`); `readPin` (`:352-379`) never reads the pin's existing `recreate` field.
- Fleet-script defect (observed, not patched by me): `disk-guard.sh:78 ENV_KEYS='... MIN_AGE_MIN'` omits `HYAKU_DISK_KEEP`/`HYAKU_DISK_LOG`/`DU_TIMEOUT` although the header (`:48-51`) documents them → `hyaku.env` cannot configure a keep file.

## Findings

1. **K66ScoutOriginReap-1 (high, operability — answers the seat question).** The reaping rule is `sweep`'s idle-eligibility rule — the 45-minute idle rule, via a manual `sweep --all` run-end purge, not `purge-lane`. Chain: pin is a plain top-level entry under guard root `/fast/scratch/hyaku`; name not excluded (`excluded_name`, `disk-guard.sh:427-432`); not keep-listed (keep file absent); age 2286 min ≫ MIN_AGE_MIN; `entry_recent`/`entry_live` see nothing (a-w clone, no writes ever, no resident process). Reproduce: `HYAKU_DISK_USAGE_OVERRIDE="/fast/scratch/hyaku=95@1000000" HYAKU_DISK_ROOTS="/fast/scratch/hyaku" bash scripts/hyaku/disk-guard.sh sweep --dry-run` in a scratch copy → the pin logs `would-delete`.
2. **K66ScoutOriginReap-2 (high, hazard is live).** The 03:10:10 recreation is in the exact same state as the reaped one: same path inside the root, same a-w perms, same absent keep-list → any future pressure sweep (`/fast/scratch/hyaku` hit 70–73 % the same day, log 18:58Z) or manual `--all` classifies it eligible again; the next non-guard cleanup reaps it and round-67 opens FAIL-CLOSED again. Reproduce: wait for use ≥ SOFT or any `--all` pass; guard rm fails but root/manual rm succeeds.
3. **K66ScoutOriginReap-3 (medium, fleet-script defect, reported not patched).** `ENV_KEYS` whitelist omits the keep/log keys the header documents (`disk-guard.sh:78` vs `:48-51`), so the keep file can only come from the default path or process env, never `hyaku.env`. One-line strengthening patch in the finding.
4. **K66ScoutOriginReap-4 (fix, patch text only).** Three proposals in `build/K66ScoutOriginReap/finding.md`: (1) move the pin to `/fast/scratch/hyaku-pin/src` — outside every configured root, zero tool changes (pinned path comes solely from `origin.json`); (2) create `$FLEET/.ufo/state/disk-guard.keep` listing the pin + repair `ENV_KEYS`; (3) recreate-on-demand in `proxy-check.mjs` (`readPin` parses the existing `recreate` field; `resolveOrigin` rebuilds under opt-in `KUMITATE_PIN_AUTOCREATE=1` with a strict shape-validated command, then the existing `gitHead`/`SRC_REV_MISMATCH` assertion still runs — all fail-closed arms preserved). Recommended pair: 1 + 3.

## Artifacts

- `.ufo/waves/round-66/build/K66ScoutOriginReap/finding.md` — full timeline, evidence index, three patch diffs.
- This report.

## Limits

- The log starts 2026-10-26T02:31Z; the pin (verified 2026-10-22) could in theory have been targeted earlier, but the observed reap window is pinned to 12:12:07–12:13:43Z on 10-26.
- The non-guard actor that finished the removal is inferred, not identified (no shell history, no second guard log found via `find` for `*disk-guard*` under the fleet/scratch).
- `proxy-check.mjs` patch is text-only, not applied or self-tested (lane `scripts/` is L1-owned; my seat must not edit it); the guard-script patch likewise targets read-only fleet files.
- Did not test a full `sweep` (only `--dry-run` would be safe against the live pin, and even that writes to the append-only guard log from the fleet default path — avoided).
