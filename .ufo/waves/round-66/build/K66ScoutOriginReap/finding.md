# K66ScoutOriginReap — origin pin reap hazard (finding, round 66 w1)

Question assigned: which rule of `scripts/hyaku/disk-guard.sh` reaped the pinned origin clone
`/fast/scratch/hyaku/kumitate-pin/src`, and where should the pin live (or what recreate-on-demand
rule should proxy-check gain) so `proxy-check` stops FAIL-CLOSED on `SRC_NOT_A_DIR`.

## Short answer

- **Not `purge-lane`.** It only ever targets `$HYAKU_SCRATCH/<lane>-r<round>` with a *numeric*
  round (`disk-guard.sh:788-843`, `target="$HYAKU_SCRATCH/${lane}-r${round}"`,
  `[[ $round =~ ^[0-9]+$ ]]`). The guard log (18,068 lines, covering 2026-10-26T02:31Z onward)
  has zero `purge-lane` lines naming `kumitate-pin`.
- **The reaper rule is `sweep`'s idle-eligibility rule** — the seat's "45-minute idle rule":
  `classify_entry` (`disk-guard.sh:472-524`) drops nothing for the pin (real dir under a
  configured root, name not excluded, not keep-listed, age ≥ MIN_AGE_MIN), and the liveness test
  (`entry_recent`/`entry_live`, `disk-guard.sh:410-417`) sees no write within `IDLE_MIN` (45 min)
  and no process inside → "idle". The pin is a `chmod -R a-w` clone: **nothing ever writes to it,
  so it is permanently idle**; reads by `proxy-check` do not refresh mtime.
- **The deletion event itself was not completed by disk-guard.** The only guard log line naming
  the pin is a *failed* rm; the tree was removed by a non-guard actor 0–96 s later (see timeline).
  The pin is therefore best understood as "guard-classified eligible + finished off manually".

## Timeline (all from `.ufo/state/disk-guard.log` unless noted)

- 2026-10-26T12:10:30Z / 12:11:33Z — two manual `sweep --all` passes (log lines 13123, 14072:
  `target=1% emergency=0 all=1`). No fleet script invokes `--all`
  (`grep -rn "sweep.*--all" scripts/` is empty; `inline.sh:62` runs plain `sweep`,
  `inline-dispatcher.py:172-178` runs `sweep` / `sweep --emergency`). Root
  `/fast/scratch/hyaku` was at 28 % use — far below SOFT_PCT=70, so only `--all` (SOFT gate
  bypassed, "run-end purge") would touch anything.
- 2026-10-26T12:12:06Z — line 14088: `defer /fast/scratch/hyaku/kumitate-pin 34.4 idle=2286
  rm-failed`. The sweep tried `rm -rf --one-file-system` and failed because the clone is
  `chmod -R a-w`. **Reproduced** in a fixture: `rm -rf --one-file-system` on a `chmod -R a-w`
  tree exits rc=1 and leaves the tree fully intact (EACCES on the read-only dirs).
- 2026-10-26T12:13:43Z — the *next* `--all` pass on that root (lines 14267-14269) collects only
  `base-census.sh` and logs `no-eligible-entries`. Every non-eligible top-level entry gets exactly
  one classify line, and every eligible one a delete-loop line — so by 12:13:43Z
  `/fast/scratch/hyaku/kumitate-pin` was already gone. **The guard never logged a successful
  `delete` for it anywhere in the log.** Removal between 12:12:07Z and 12:13:43Z was a non-guard
  actor — most plausibly a manual root cleanup finishing the failed rm (an a-w tree needs root
  or a `chmod +w` first); no shell-history record exists. [INFERENCE for the actor; the log
  window is observed fact.]
- 2026-10-27T03:10:01 — round-66 base receipt `proxy-before-src-reaped.txt`:
  `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src /fast/scratch/hyaku/kumitate-pin/src is absent`, EXIT=2
  (`proxy-check.mjs:420` fires `SRC_NOT_A_DIR` when the pinned `clone` is not a dir; no
  recreate-on-demand exists — `readPin` does not even read the pin's `recreate` field).
- 2026-10-27T03:10:10 — pin recreated per `origin.json` `recreate`; current state re-verified
  this seat: `src` is `dr-xr-xr-x`, HEAD = `31c465f15669f744848bd9f5d56191c5085670f7` = pin revision.

## Why this recurs (hazard is live, not historical)

The recreated pin is again: (1) a plain top-level entry under guard root `/fast/scratch/hyaku`;
(2) absent from the keep list — `$FLEET/.ufo/state/disk-guard.keep` does not exist (only
`.gitkeep`-style siblings; verified `ls` → No such file); (3) `chmod -R a-w`, so `entry_recent`
will never see a write and the dir ages monotonically — any future pressure sweep (usage ≥ SOFT;
`/fast/scratch/hyaku` hit 70-73 % the same day at 18:58) or any manual `--all` pass classifies it
eligible again. The guard's own rm will fail again, but that is cold comfort: any root/manual
cleanup (exactly what happened on 10-26) reaps it, and round-67 opens with the same FAIL-CLOSED.

Contributing defect (fleet script, reported not patched): `ENV_KEYS`
(`disk-guard.sh:78`) = `HYAKU_SCRATCH HYAKU_DISK_ROOTS SOFT_PCT TARGET_PCT HARD_PCT IDLE_MIN
MIN_AGE_MIN` — the header (`disk-guard.sh:48-51`) documents `HYAKU_DISK_KEEP` and
`HYAKU_DISK_LOG` as env-file tunables, but the whitelist omits them (and `DU_TIMEOUT`/`FLEET`), so
`hyaku.env` can never point the guard at a keep file; only the default path or the process env can.

## Proposals (patch text only; integration owner decides)

### Proposal 1 — move the pin outside every guard root (preferred)

Guard roots are exactly `/tmp /var/tmp /fast/scratch/hyaku` (`scripts/hyaku/hyaku.env`). A sibling
`/fast/scratch/hyaku-pin` is never collected (`collect_entries` iterates only over `ROOTS`). One
metadata change, zero tool changes (the pinned path comes solely from `origin.json`;
`SRC_CANDIDATES` in `proxy-check.mjs:315-318` is only the *unpinned* fallback):

```diff
--- a/.ufo/pins/origin.json
+++ b/.ufo/pins/origin.json
@@
-  "clone": "/fast/scratch/hyaku/kumitate-pin/src",
-  "recreate": "git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/hyaku/kumitate-pin/src && git -C /fast/scratch/hyaku/kumitate-pin/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/hyaku/kumitate-pin/src",
+  "clone": "/fast/scratch/hyaku-pin/src",
+  "recreate": "git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/hyaku-pin/src && git -C /fast/scratch/hyaku-pin/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/hyaku-pin/src",
   "verified_at": "2026-10-27"
```
(one-time `bash -c "$(jq -r .recreate .ufo/pins/origin.json)"`; optionally also `chmod a-w
/fast/scratch/hyaku-pin` itself. Add a line to `scripts/hyaku/lane-addendum.md` §7 marking
`/fast/scratch/hyaku-pin` as lane infrastructure excluded from manual purges.)

### Proposal 2 — keep-list the pin and repair the env whitelist (fleet-side)

```diff
--- /dev/null
+++ b/home/vgpnk/Projects/shokunin/.ufo/state/disk-guard.keep
@@
+# never reap the lane's pinned origin clone (round-66 finding K66ScoutOriginReap)
+/fast/scratch/hyaku/kumitate-pin
--- a/scripts/hyaku/disk-guard.sh
+++ b/scripts/hyaku/disk-guard.sh
@@
-ENV_KEYS='HYAKU_SCRATCH HYAKU_DISK_ROOTS SOFT_PCT TARGET_PCT HARD_PCT IDLE_MIN MIN_AGE_MIN'
+ENV_KEYS='HYAKU_SCRATCH HYAKU_DISK_ROOTS SOFT_PCT TARGET_PCT HARD_PCT IDLE_MIN MIN_AGE_MIN DU_TIMEOUT FLEET HYAKU_DISK_KEEP HYAKU_DISK_LOG'
```
(keep_listed, `disk-guard.sh:448-458`, exact-matches the top-level entry; the guard then logs
`keep-listed` forever. This strengthens the guard; it relaxes nothing.)

### Proposal 3 — recreate-on-demand in proxy-check (defense in depth)

`origin.json` already carries `recreate`; `readPin` ignores it. Teach `resolveOrigin` to rebuild
the clone when (and only when) the operator opts in, preserving fail-closed semantics on any
failure and keeping the existing rev assertion:

```diff
--- a/scripts/proxy-check.mjs
+++ b/scripts/proxy-check.mjs
@@ function readPin(file) {
   ...
   if (typeof body.clone !== 'string' || body.clone.trim() === '') {
     return { ok: false, kind: 'PIN_MALFORMED', detail: `--pin ${file} has no clone path` };
   }
-  return { ok: true, pin: { file, contract: body.contract, repo: body.repo ?? null, revision, clone: resolve(body.clone) } };
+  const recreate = typeof body.recreate === 'string' ? body.recreate : null;
+  return { ok: true, pin: { file, contract: body.contract, repo: body.repo ?? null, revision, clone: resolve(body.clone), recreate } };
 }
+
+/**
+ * Recreate the pinned clone on demand (round-66 hardening). Runs only when the caller opts in
+ * via KUMITATE_PIN_AUTOCREATE=1; default behavior is unchanged SRC_NOT_A_DIR (exit 2). The
+ * recorded command is validated against a fixed shape before it is executed — an unexpected
+ * recreate string is refused (SRC_NOT_A_DIR) never run.
+ */
+const RE_RECREATE = new RegExp(
+  '^git clone --no-hardlinks file://\\S+ (\\S+) && git -C \\1 checkout -q --detach [0-9a-f]{40}'
+  + ' && chmod -R a-w \\1$');
+
+function recreatePinnedSrc(pin) {
+  if (process.env.KUMITATE_PIN_AUTOCREATE !== '1' || typeof pin.recreate !== 'string') return false;
+  const m = RE_RECREATE.exec(pin.recreate);
+  if (!m || resolve(m[1]) !== pin.clone) return false;
+  if (/[;&|`$<>]/.exec(pin.recreate.replace('&&', ''))) return false;
+  const r = spawnSync('bash', ['-c', pin.recreate], { encoding: 'utf8', timeout: 300_000, env: gitEnv() });
+  return r.status === 0 && statKind(pin.clone) === 'dir';
+}
@@ function resolveOrigin(opts) {
   ...
   const src = opts.src ?? loaded.pin.clone;
-  if (statKind(src) !== 'dir') return { ok: false, kind: 'SRC_NOT_A_DIR', detail: `--src ${src} is ${statKind(src)}` };
+  if (statKind(src) !== 'dir' && !recreatePinnedSrc(loaded.pin)) {
+    return { ok: false, kind: 'SRC_NOT_A_DIR', detail: `--src ${src} is ${statKind(src)}` };
+  }
   const head = gitHead(src);
```
After recreation the existing `gitHead` + `SRC_REV_MISMATCH` path still asserts the pinned
revision, so a wrong-tree recreation fails closed exactly as before. Net effect: the measurement
proxy self-heals from the only failure mode the guard cannot be blamed for, while every
fail-closed arm (SELF_NOT_A_DIR, PIN_MALFORMED, SRC_NOT_A_DIR, SRC_REV_UNVERIFIABLE,
SRC_REV_MISMATCH) still exists.

## Recommended combination

Proposal 1 (move) alone removes the pin from the guard's universe permanently; Proposal 2
protects any future long-lived scratch; Proposal 3 removes the round-open outage even if both
location and keep-list regress. 1+3 is the minimal operable pair.

## Evidence index

- `scripts/hyaku/disk-guard.sh:78,410-417,448-458,472-524,764-786,788-843`
- `.ufo/state/disk-guard.log:14088` (rm-failed), `:14267-14269` (absent 96 s later),
  `:13123,:14072` (`all=1 target=1%` manual passes), `:14105` (second `--all` run 14:48Z)
- `kumitate-shokunin/.ufo/waves/round-66/base/proxy-before-src-reaped.txt` (FAIL-CLOSED receipt)
- `kumitate-shokunin/.ufo/pins/origin.json` (pin contract, `recreate` recorded)
- `kumitate-shokunin/scripts/proxy-check.mjs:315-330,352-379,414-433,1239-1245`
- fixture repro: `rm -rf --one-file-system` on `chmod -R a-w` tree → rc=1, tree intact
- `scripts/hyaku/inline.sh:62`, `scripts/hyaku/inline-dispatcher.py:172-178` (no `--all` callers)
- `bash scripts/hyaku/disk-guard.sh status` → exit 0, all roots below SOFT (run this seat)
