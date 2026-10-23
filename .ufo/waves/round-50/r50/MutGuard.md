# MutGuard — r50 mutation probe of the cap-run `/tmp --bind` guard

Seat: mutation-tester (`MutGuard`). Axes attacked: **operability** (does the guard stop
`--bind /tmp` from re-exposing host /tmp) and **coverage** (which guard mutants the round's own
evidence — shipped selftest and frozen C1 predicate — actually kills). Lane repo read-only; all
scratch trees under `/tmp`, restored and removed. No tool installs, no packages changed.

## Trees, provenance, hashes

- Base: `git -C <lane> archive master | tar -x -C /tmp/r50-mutguard-work/base` at HEAD `378b6e7`.
  `scripts/cap-run.mjs` sha256 `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`
  — identical to the lane checkout and to the file `ExecBindGuardPatch` reports on (it patches
  pre-guard parent `269dadb` into exactly these two lines, so base already **is** the patched state).
- `git log -1 -S"p === '/tmp'" -- scripts/cap-run.mjs` → `378b6e7 round-50: freeze guard and closure corrections`.
  The same commit introduced the `[...lim(), '--bind', '/tmp', ...]` selftest arm
  (`git log -1 -S"'-bind', '/tmp'"` → same commit).
- Mutant copies are `cp -a` of base; each is a ≤3-line edit inside `parseArgs`'s `--bind` arm.

| tree | cap-run sha256 | change |
|---|---|---|
| base (pristine) | `64fafb42…e3b672` | committed r50 guard |
| `mut-a` | `7143177decc07e5dde8ace6fadbe550ef2c030d203926ffcb0bcd2eb751b0b80` | `p === '/tmp' \|\|` deleted from `bad()` |
| `mut-b` | `829690130029089e139ca47e6abd4e3515079a1d80c7699fee1e7a0617685cd8` | `p === '/tmp'` → `p.startsWith('/tmp')` |
| `mut-c` | `d8e49ab4f3c68eca6f13490ae8beb43cbb6e548bb8edf64e63528c02276a9e04` | guard moved **before** `realpathSync`; checks `bad(v)`, never `bad(r)` |

Mutant C's arm after the move:

```js
const bad = (p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p);
if (bad(v) || bad(resolve(v))) usage(`--bind refuses ${JSON.stringify(v)} (…stay as the sandbox mounts them)`);
let r = null;
try { r = v.startsWith('/') && statSync(v).isDirectory() ? realpathSync(v) : null; } catch { /* absent */ }
if (!r) usage(`--bind wants an existing absolute directory, got ${JSON.stringify(v)}`);
```

## Detector (fixed, applied identically to pristine and mutants)

`bash /tmp/r50-mutguard-work/detector.sh <tree> <label>` — four cases through `scripts/cap-run.mjs`
(systemd `--user` scope + bwrap 0.13.1, Node v24.21.0). A case passes only when both the exit code
and the host-file probe match.

| case | invocation | expected |
|---|---|---|
| C1 | `--bind /tmp` … child writes `/tmp/r50-mutguard-host1` | exit 64, no host file |
| C2 | `--bind <mkdtemp subdir under /tmp>` … child writes into it | exit 0, host file (subdir binds stay legal) |
| C3 | `--bind $HOME/<alias>/link` where `link -> /tmp` … child writes via it | exit 64, no host file |
| C4 | `--bind /tmp/r50-mutguard-alias` where host symlink `-> /tmp` | exit 64, no host file |

C3 and C4 are both alias spellings, kept because they fail differently: C3 is an ordinary symlink,
which bwrap refuses as a **destination**; C4's destination is masked by the sandbox tmpfs, so bwrap
creates a real mountpoint and the alias re-exposes host `/tmp`. Case C4 is the exposure-capable form.

### Baseline (pristine bytes; must pass or the probe is inconclusive)

```text
CASE1 bind=/tmp exit=64 hostfile=no -> PASS
CASE2 bind=/tmp/subdir exit=0 hostfile=yes -> PASS
CASE3 bind=/home/vgpnk/.cache/r50-mutguard/alias-…/link(->/tmp) exit=64 hostfile=no -> PASS
CASE4 bind=/tmp/r50-mutguard-alias(->/tmp, masked) exit=64 hostfile=no -> PASS
DETECTOR: PASS
detector-exit=0
```

Pristine `node scripts/cap-run.mjs --selftest` on the same tree: `CAP_RUN_SELFTEST: 12/12 pass`,
`VERDICT: PASS`, exit 0 — baseline healthy.

## Mutant results (detector output verbatim, trimmed to the evidence line per case)

### (a) guard removed — `64fafb42…` → `7143177d…`

```text
CASE1 bind=/tmp exit=0 hostfile=yes -> FAIL      out: CAP_RUN: EXIT code=0 unit=cap-run-…
CASE2 bind=/tmp/subdir exit=0 hostfile=yes -> PASS
CASE3 bind=…/link(->/tmp) exit=1 hostfile=no -> FAIL   out: bwrap: Can't mount on symlink destination …|CAP_RUN: EXIT code=1
CASE4 bind=/tmp/r50-mutguard-alias(->/tmp, masked) exit=0 hostfile=yes -> FAIL
DETECTOR: FAIL   detector-exit=1
```

**KILLED** (C1: child wrote `/tmp/r50-mutguard-host1` on the host and the runner exited 0 instead of 64).
Shipped selftest also kills it: `FAIL usage arms exit 64 with CAP_RUN: USAGE (["--mem","256"]:exit=0)`,
`CAP_RUN_SELFTEST: 11/12 pass`, exit 1.

### (b) `startsWith('/tmp')` — `64fafb42…` → `82969013…`

```text
CASE1 bind=/tmp exit=64 hostfile=no -> PASS
CASE2 bind=/tmp/r50-mutguard-sub.…/sub exit=64 hostfile=no -> FAIL   out: CAP_RUN: USAGE --bind refuses "/tmp/…/sub" …
CASE3 … exit=64 hostfile=no -> PASS
CASE4 … exit=64 hostfile=no -> PASS
DETECTOR: FAIL   detector-exit=1
```

**KILLED** (C2: a legitimate `mkdtemp` subdirectory under `/tmp` is wrongly refused — capability lost).
Shipped selftest also kills it: `FAIL --bind: a host directory outside the cwd is read-write only when
bound (bound:exit=64,out="")`, `11/12`, exit 1 (the selftest's own bind dir is a `mkdtemp` under `/tmp`).

### (c) guard before realpath — `64fafb42…` → `d8e49ab4…`

```text
CASE1 bind=/tmp exit=64 hostfile=no -> PASS
CASE2 bind=/tmp/subdir exit=0 hostfile=yes -> PASS
CASE3 bind=…/link(->/tmp) exit=1 hostfile=no -> FAIL   out: bwrap: Can't mount on symlink destination …|CAP_RUN: EXIT code=1
CASE4 bind=/tmp/r50-mutguard-alias(->/tmp, masked) exit=0 hostfile=yes -> FAIL   out: CAP_RUN: EXIT code=0
DETECTOR: FAIL   detector-exit=1
```

**KILLED** by the detector: C3 shows the guard no longer refuses the literal alias (cap-run accepts;
bwrap's symlink-destination check is the only thing left), and C4 shows a real host write — with a
host symlink `/tmp/r50-mutguard-alias -> /tmp`, the child wrote `/tmp/r50-mutguard-host4` **on the
host** through the re-exposed mount and cap-run exited 0.

**SURVIVED by the shipped selftest**: `CAP_RUN_SELFTEST: 12/12 pass`, `VERDICT: PASS`, exit 0.

## Raw bwrap mechanism (no cap-run), host bwrap 0.13.1

```text
$ bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --bind /tmp /tmp -- node -e 'write /tmp/r50-raw1'
exit=0 hostfile=yes
$ bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp          -- node -e 'write /tmp/r50-raw2'
exit=0 hostfile=no
$ bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --bind $HOME/.cache/…/link $HOME/.cache/…/link -- node …
bwrap: Can't mount on symlink destination /home/vgpnk/.cache/…/link
exit=1 hostfile=no
```

So: the tmpfs is what masks host `/tmp`; a later bind on the same point undoes it; bwrap refuses a
**symlink destination**, but a destination hidden by the tmpfs is created as a real directory and the
bind lands.

## Findings

- **F1 — coverage hole in the shipped suite (surviving mutant).** Mutant C passes `--selftest`
  12/12; no arm pins guard-before-realpath or any alias spelling. The suite kills A (usage-arm loop)
  and B (bind-liveness case) but not C. If the L1 wants this closed, the smallest arm is a usage case
  with a symlink: create `ln -sfn /tmp <tmp>/alias` in the selftest's work dir and add
  `[...lim(), '--bind', <that alias>, '--', 'true']` to the refusal loop — but that is the L1's call,
  not applied here.
- **F2 — the frozen C1 predicate does not discriminate mutant C.** Measured on `d8e49ab4`: every G2
  candidate still refuses with exit 64 + `CAP_RUN: USAGE` (`/tmp`, `/tmp/`, `/tmp/.`, `/`, `/run`,
  `/proc/self`, `rel`, `/nonexistent-feedface` — 8/8, identical to pristine), and G4's selftest is
  12/12. G3/G5/G7/G8 do not depend on guard ordering. Only G6 (pin) notices the byte change, and the
  normal workflow is to recompute the pin — so `GUARD_HELD held=8/8` can print on a guard that still
  re-exposes host `/tmp` via `/tmp/<symlink> -> /tmp`. [INFERENCE] for G6/G7/G8 mechanics: I did not
  commit the mutant to a scratch repo and re-run the probe end-to-end.
- **F3 — recorded non-hole.** `realpathSync("<alias>/link/..")` returns the alias directory, not `/`
  (libuv resolves `..` lexically), so `link/..` is **not** a route to binding `/`; the child got
  `ENOENT`, exit 1, no host file. Nobody should count that spelling as live.
- **F4 — why C3 is not an exposure proof alone.** bwrap 0.13.1 rejects symlink destinations, so the
  guard-order defect only produces host exposure when the destination is masked by the tmpfs (C4).
  Any future test that only uses a visible symlink will under-test this guard.

## Restoration evidence

- After each mutant run the file was restored from base bytes; post-restore
  `sha256sum base/scripts/cap-run.mjs mut-*/scripts/cap-run.mjs` → all four
  `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`.
- Lane checkout untouched: `git -C <lane> status --porcelain scripts/` empty;
  `sha256sum <lane>/scripts/cap-run.mjs` = `64fafb42…e3b672` (same as at start).
- Removed my scratch trees (`/tmp/r50-mutguard-work`, `/tmp/r50-g2check`, `/tmp/r50-g2base`), the
  probe symlink `/tmp/r50-mutguard-alias` and `~/.cache/r50-mutguard`. Other seats' `/tmp/r50-*`
  directories were not touched.

## Verdict

| mutant | detector | shipped selftest | frozen C1 (G2+G4 subset) |
|---|---|---|---|
| A guard removed | KILLED (host `/tmp` writable, exit 0) | KILLED (11/12) | KILLED (G2 `/tmp`) |
| B `startsWith('/tmp')` | KILLED (subdir bind refused) | KILLED (11/12) | KILLED (G3 subdir bind) |
| C guard before realpath | KILLED (alias accepted; host `/tmp` writable via masked alias) | **SURVIVED 12/12** | **SURVIVED (G2 8/8, G4 pass)** |

The guard itself is correct as committed (baseline passes all four cases). The probe's coverage
finding is F1/F2: mutant C is invisible to both the shipped selftest and the frozen C1 counter's
enumerated variants; only the alias/masked-alias detector kills it.

## Addendum — lane working tree changed mid-probe (not by this seat)

At 17:51:27, after my evidence runs, the lane checkout's `scripts/cap-run.mjs` changed from
`64fafb42…` to `d9ba41796f09aeb3198d96da8a659c71e838173f4f64ee69c9e1badb065cf854` (uncommitted
working-tree change; `git diff` shows a `cwdReal === '/tmp'` refusal in `run()` plus a `cap(args, cwd)`
selftest parameter and a `cwd=/tmp` usage arm). My mutants and baseline above attack the frozen
committed bytes `64fafb42…`; the working-tree bytes were then re-tested read-only on a scratch copy:

- `d9ba4179…` with the detector: CASE1–CASE4 all PASS, `DETECTOR: PASS`; `--selftest` 12/12 PASS;
  `--` from an exact `/tmp` cwd → `CAP_RUN: USAGE refusing cwd /tmp because its tmpfs would be
  overmounted read-write`, exit 64.
- Mutant C re-applied to `d9ba4179…` (sha `6293181944dc080fcaed980c8c8102592273352965a6a58d72f00776b1df2d81`):
  CASE3 and CASE4 FAIL (CASE4 wrote `/tmp/r50-mutguard-host4` on the host, exit 0), while
  `--selftest` still prints 12/12 PASS. The F1/F2 coverage hole persists in the in-progress guard.
- Scratch copy restored to `d9ba4179…` and removed; the lane file was never written by this seat.

