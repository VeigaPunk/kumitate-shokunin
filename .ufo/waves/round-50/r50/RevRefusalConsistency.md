# RevRefusalConsistency — r50 refusal-design review

Seat: `KumitateR50.RevRefusalConsistency` (reviewer). Report path `.ufo/waves/round-50/r50/RevRefusalConsistency.md`.
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only; no files edited, no git/jj mutation; only read-only git + read-only node runs).
Tools installed: none (no installs needed; nothing to record).

## 1. State determination (what "after the patch" actually is)

- `ExecBindGuardPatch.md` has **not** landed in `.ufo/waves/round-50/r50/` (the dir contains only `swarm-registry.json`). Per the assignment, the refusal principle is therefore reviewed from the current bytes — which here are the *already-integrated* guard.
- The guard is **already committed** at `378b6e7` ("round-50: freeze guard and closure corrections"), which is an ancestor of HEAD `6927903f99bbc26e397aa47387aa76950f42b3a5` (`git merge-base --is-ancestor 378b6e7 HEAD` → yes).
- `git diff HEAD -- scripts/cap-run.mjs` = 0 lines (working copy == HEAD), and the file sha256 is identical at working tree, HEAD and `378b6e7`:
  - `scripts/cap-run.mjs` sha256 = `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`
  - parent `378b6e7^` (pre-guard) = `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758`
- The fully diff at `378b6e7` for cap-run.mjs is exactly three hunks: header comment (rounds 46-50, subdir-fixture wording), the `--bind` parse arm (comment + `p === '/tmp'` added to `bad()` + refusal message gains `/tmp`), and one selftest usage-arm (`[...lim(), '--bind', '/tmp', '--', 'true']` inserted between the `/` and `/run` arms). That matches the plan's ExecBindGuardPatch description. Nothing else in the file changed.
- The current refusal code (line 131 of `scripts/cap-run.mjs`):
  ```js
  let r = null;
  try { r = v.startsWith('/') && statSync(v).isDirectory() ? realpathSync(v) : null; } catch { /* absent */ }
  if (!r) usage(`--bind wants an existing absolute directory, got ${JSON.stringify(v)}`);
  const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
  if (bad(r) || bad(resolve(v))) usage(`--bind refuses ${JSON.stringify(v)} (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them)`);
  o.bind.push([r, resolve(v)]);
  ```
- The bwrap argv is built (cap-run.mjs:190) with binds **after** the tmpfs mounts: `['--tmpfs','/tmp','--tmpfs','/run','--bind',cwd,cwd,...o.bind.flatMap(([src,dst])=>['--bind',src,dst]),...]`. So a `--bind /tmp` would be mounted on top of the fresh tmpfs and re-expose host `/tmp` rw (S095 argument order) — this is exactly the round-49 ScoutCapRunVisibility hole the guard closes.

## 2. Empirical matrix (current bytes; usage-only runs, nothing spawned)

Run from the lane with each `v`, capturing exit + stderr first line:

| `--bind` value | exit | stderr |
|---|---|---|
| `/tmp` | 64 | `USAGE --bind refuses "/tmp" …` |
| `//tmp` | 64 | `USAGE --bind refuses "//tmp" …` |
| `/tmp/.` | 64 | `USAGE --bind refuses "/tmp/." …` |
| `/tmp/../tmp` | 64 | `USAGE --bind refuses "/tmp/../tmp" …` |
| `$T/lnk` (symlink → /tmp) | 64 | `USAGE --bind refuses "…/lnk" …` |
| `/proc`, `/proc/1` | 64 | refuse |
| `/run/user/1000` | 64 | refuse |
| `/dev`, `/sys` | 64 | refuse |
| `$T` (real subdir under /tmp) | 64 | `USAGE missing -- <cmd>` — i.e. bind **accepted**, later usage fires |
| `$T/lnk/../tmp` | 64 | `USAGE --bind wants an existing absolute directory, got …` — refused via the realpath-null branch |

The subdir row proves G3's premise: a legitimate subdir bind passes the bind arm (the failure is only the missing `<cmd>`). All 8 frozen G2 refusals are refused (see §4).

Diagnostic for the last row (why realpath throws): `node -e` on `$T/lnk/../tmp` shows `statSync ok, isDir=true`, `realpathSync threw: ENOENT`, `resolve = $T/tmp`. This is the documented glibc `realpath()` bug class (symlink followed by `..` fails with ENOENT); node's `realpathSync` inherits it. Consequence: any `--bind` whose lexical path uses a symlink+dotdot to land on `/tmp` is refused by the **null branch** (r=null) even before `bad()` runs.

## 3. Verdicts per design decision

### D1 — `/tmp` exact-only vs prefix: **CORRECT (and required)** — SOUND
- `bad()` treats `/tmp` exactly (`p === '/tmp'`) while proc/sys/dev/run use the prefix regex `^\/(?:proc|sys|dev|run)(?:\/|$)`. 
- A prefix rule (`/^\/tmp(?:\/|$)/`) would refuse legit subdir binds under host `/tmp` — which the **frozen** counter explicitly requires to work (G3: "a host dir under /tmp is bound read-write", plus the child's own `/tmp` stays tmpfs). Exact-only is the only choice consistent with `GUARD_HELD`; prefix would break G3 → the exact-only choice is not merely acceptable, it is mandated.
- The asymmetry (exact for `/tmp`, prefix for /proc//sys//dev//run) is justified: subdir binds under `/tmp` are the documented fixture pattern (header comment, selftest, G3); there is no legitimate subdir-bind use for the runtime/kernel trees, and exposing e.g. `/run/user/1000` (host sockets, XDG_RUNTIME_DIR) or `/proc/1` would defeat the fresh tmpfs/procfs. 
- Accepted design limit (record): `--bind /tmp/<subdir>` intentionally re-exposes that host subtree through the fresh tmpfs — that is the feature, G3-tested.

### D2 — realpath-before-check: **YES** — SOUND
- `r = realpathSync(v)` is computed first (inside the try), and only then `bad(r) || bad(resolve(v))` runs. A symlink whose target is `/tmp` is caught by `bad(r)` (verified: `$T/lnk` → refused).
- Residual TOCTOU: parse-time stat/realpath vs spawn-time mount; the path is caller-controlled same-user, so this is not a trust boundary — acceptable, record as residual.

### D3 — `resolve(v)` vs `r` ordering: no ordering hazard; it is a source-vs-destination coverage question — **duel check correct** — SOUND
- `o.bind.push([r, resolve(v)])` → `src = r` (realpath), `dst = resolve(v)` (lexical). Line 190 confirms `dst` is the bwrap destination. `bad(r) || bad(resolve(v))` is order-independent (both must pass; short-circuit changes nothing).
- `resolve(v)` is the *destination* guard: it catches lexical `/tmp` destinations even when realpath diverges (symlink+dotdot). In practice every such path also dies in the realpath-null branch (glibc ENOENT quirk, §2), so the dest check is belt-and-braces — but it is the *conceptually correct* invariant (the destination must never be a sandbox-managed mount point) and must not be removed.

### D4 — `--bind /tmp` as SOURCE-only: **source-only would be insufficient** — the dual check is required — SOUND
- Because `src` and `dst` derive from the same `v` through different normalizations, a source-only check (`bad(r)` alone) leaves `dst=/tmp` reachable in principle (e.g. `v='/x/lnk/..'` with a symlink whose lexical normalization is `/tmp` while realpath is a non-managed dir). The current code refuses that via `bad(resolve(v))` (or via the realpath-null branch).
- Empirically today every dest=/tmp form is refused (matrix §2). Source-only would *in practice* still refuse all of them only because the glibc realpath `..` bug makes the divergent realpath fail — relying on a libc bug for sandbox correctness is unacceptable; keep the dual check.

## 4. Alignment with the frozen counter

- `probe/bindguard50-probe.mjs` G2 list = `/tmp`, `/tmp/`, `/tmp/.`, `/`, `/run`, `/proc/self`, `rel`, nonexistent. Each refused (exit 64, `CAP_RUN: USAGE`) — verified individually in §2 for the path forms; `rel`/nonexistent refuse via the "wants an existing absolute directory" arm (same USAGE class, exit 64). G2 satisfied at the integrated bytes.
- G3 (subdir bind works + child /tmp stays tmpfs) and G8 (no-bind isolation) match the exact-only design; G4 (selftest) verified live below.
- `node scripts/cap-run.mjs --selftest` on current bytes: **12/12 PASS, `VERDICT: PASS`, exit 0** (saw the new `--bind /tmp` usage arm in the suite; aggregate PASS covers it).
- SCORECARD.md:318 `pin.cap-run=64fafb42…` matches the committed bytes exactly (sha256 recomputed; G6 consistent). `pin.bind-oracle=c3929a97c5…` present.

## 5. Findings by severity

1. **[Positive] Guard is already integrated and sound.** Commit `378b6e7` contains exactly the planned patch; refusal semantics verified empirically for every managed point and for legitimate subdir binds. No defect found in the four decisions. (Severity: none actionable.)
2. **[Low / cosmetic] Refusal message divergence.** The bad() message lists the refused points but not the relative/nonexistent cases (which use the "wants an existing absolute directory" message). Same exit class; no behavioral impact.
3. **[Low / design note] glibc realpath `..` quirk** makes some path-mangled binds refuse via the *null* branch rather than the refusal list (`v=$T/lnk/../tmp` → "wants an existing absolute directory"). Outcome is still exit 64; message may confuse a caller diagnosing a mangled path. Not a hole.

## 6. Residual risk and verification gaps

- **TOCTOU parse→spawn**: dir swapped between `realpathSync` and bwrap mount (same-user caller; not a defense boundary).
- **Deliberate exposure**: `/tmp/<subdir>` binds re-expose host data; G3-mandated feature, documented.
- **ExecBindGuardPatch.md not landed**: the L1 should append the executor's report/diff for the record; this review used the committed equivalent.
- **Out of scope here**: G6/G7 full runs (RevHarmBattery/RevGuardDiff), history (`RevMountOrigin`), empirical bwrap semantics (`LabratBwrapEmpiric`), caller sweep (`ScoutGuardSweep`), arg-surface bypasses (`SentArgv`).
