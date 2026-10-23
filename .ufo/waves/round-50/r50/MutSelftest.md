# MutSelftest — does cap-run's selftest see a refusal that lies?

Seat: MutSelftest (mutation-tester). Read-only on the lane; every mutant built and run under
`/tmp/r50-mutselftest.cCsLqN`. No tool installs needed (host `bwrap 0.13.1`, `systemd 262`, `node v24.21.0`).

## Bytes attacked (two sets, because the lane moved mid-run)

| set | source | cap-run.mjs sha256 |
|---|---|---|
| frozen | `git archive 6927903f99bbc26e397aa47387aa76950f42b3a5` | `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672` |
| live | lane working tree `scripts/cap-run.mjs` while I ran | `d9ba41796f09aeb3198d96da8a659c71e838173f4f64ee69c9e1badb065cf854` |

The live/diff is not mine: between my first hash and my last read the integrator added a `cwd=/tmp`
refusal in `run()` and its arm (below). `bad()`, the refusal line and the 15-vector usage list are
byte-identical in both sets, so every finding was re-run on both. The seat never wrote to the lane.

Detector = the shipped selftest (`node scripts/cap-run.mjs --selftest`, 12 PASS/FAIL cases). Ground
truth = a targeted host-artifact probe: run `cap-run --bind <arg> -- node -e 'write marker'` and
check whether the marker appears on the **host** after the call. Scratch copies only.

## Q1 — Does the selftest actually run `--bind /tmp` through the usage-arm loop?

Yes. The usage arm list contains `[...lim(), '--bind', '/tmp', '--', 'true']` (rev line 317, live
line 319), inside the 15-vector `for (const args of […])` loop. Four vectors are bind-refusals
(`/`, `/tmp`, `/run`, `/proc/self`); the rest are missing/duplicate/bad-value flags.

Control `m0` proves the `/tmp` vector executes: the only change is `if (r === '/tmp') { print USAGE;
exit 1 }` before the normal refusal. Result: exactly one arm fails, with exit 1:
```
FAIL  usage arms exit 64 with CAP_RUN: USAGE (["--mem","256"]:exit=1)
CAP_RUN_SELFTEST: 11/12 pass / VERDICT: FAIL
```
No other vector can produce exit 1 there (`/`→`/`, `/run`→`/run`, `/proc/self`→`/proc/<pid>`), so
the failure is the `/tmp` vector. **Q1 = yes.**

Diagnostic defect found while proving it: the FAIL detail is `JSON.stringify(args.slice(0, 2))`,
which prints `["--mem","256"]` for all 14 non-`[]` vectors. m8 shows four identical-looking
`["--mem","256"]:exit=…` entries; an operator cannot tell which bind argument regressed from the
failure line.

## Q2 — Mutant (a): print USAGE on `/tmp` but still spawn bwrap → does any arm catch it?

**No. It survives 12/12 PASS while the host write happens.**

Mutant `m1` (rev bytes) / `l1` (live bytes): the `bad()` branch no longer calls `usage()`. It
records `o.refusedBind = v`, pushes the bind, and `usage()` is called from the child's `exit`
handler — i.e. the sandbox child runs first, then cap-run reports `CAP_RUN: USAGE` and exits 64.

```
$ node m1/scripts/cap-run.mjs --selftest
CAP_RUN_SELFTEST: 12/12 pass
VERDICT: PASS                      exit=0
$ node m1/scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind /tmp \
    -- node -e 'require("fs").writeFileSync("/tmp/r50-mut-m1-a","x")'
rc=64  hostfile=YES  last=CAP_RUN: USAGE --bind refuses "/tmp" (checked after the child ran)
```
Pristine control, same command: `rc=64 hostfile=no`. Reproduced on live bytes as `l1`
(`rc=64 hostfile=YES`, suite 12/12 PASS). The child really ran under
`--tmpfs /tmp … --bind /tmp /tmp`, so host `/tmp` was read-write inside it; the marker shows up on
the host. **The usage arm observes only `exit==64` and the last `CAP_RUN: USAGE` line — nothing in
the suite observes the absence of a child/host effect for a refused argument.**

Frozen-counter consequence (derived replica, not the probe): G2's predicate is exactly
`status===64 && /^CAP_RUN: USAGE /` on the last line. Running that loop over G2's eight refusal
args against `m1` gives **8/8 pass**, and G4 is the selftest above (exit 0). A committed cap-run
whose refusal is cosmetic would therefore satisfy both refusal checks once its pin is recomputed
(G6 pins bytes, not behaviour). I did not run the full frozen probe; this is its G2/G4 logic applied
verbatim.

## Q3 — Mutate the refusal list to drop `/run` (and neighbours) → caught?

| mutant | change to `bad()` / refusal | suite | verdict you can read | ground truth (host artifact probe) |
|---|---|---|---|---|
| m0 | control: `/tmp` branch exits 1 | 11/12 FAIL | **KILLED** | proves `/tmp` vector runs |
| m1 / l1 | refusal deferred to child-exit (USAGE after child ran) | 12/12 PASS | **SURVIVED** | host `/tmp` marker **written**, rc=64 USAGE |
| m2 | drop `run` from regex | 11/12 FAIL | **KILLED** | host `/run/user/1000` marker written |
| m3 | drop `p === '/tmp'` | 11/12 FAIL | **KILLED** | host `/tmp` marker written |
| m4 / l4 | drop `sys` from regex | 12/12 PASS | **SURVIVED** | `/sys` accepted (rc=0); child sees rw `sysfs` bind stacked but write → `EACCES` (sysfs rejects; no host write proven) |
| m5 / l5 | drop `dev` from regex | 12/12 PASS | **SURVIVED** | host `/dev/shm` marker **written** |
| m6 / l6 | drop `bad(r)` (realpath source check) | 12/12 PASS | **SURVIVED** | symlink→`/tmp` source accepted; bwrap fails closed: `bwrap: Can't mount on symlink destination …` exit 1, no host file |
| m7 | drop `bad(resolve(v))` (lexical check) | 12/12 PASS | **SURVIVED (equivalent)** | `/tmp/`, `/tmp/.` still refused via `bad(r)`; no exposure on this host |
| m8 | remove the refusal line entirely | 11/12 FAIL | **KILLED** | host `/tmp` marker written |
| m9 | `||` → `&&` (both checks must fire) | 12/12 PASS | **SURVIVED** | same shape as m6: symlink source accepted, bwrap fails closed |
| m10 | drop `proc` from regex | 11/12 FAIL | **KILLED** | kill is delivered by bwrap (`Can't mount on symlink destination /proc/self`, exit 1), not by the guard — still catchable, but the arm is not a pure refusal test |

Killed = the suite reports a FAIL on the behaviour change. Survived = suite PASS **and** the changed
behaviour is observable outside the suite (proved with the probe). No inconclusive runs: pristine
baseline is 12/12 PASS, exit 0, on both byte-sets, and every mutant run was deterministic.

### What the suite's refusal coverage actually enumerates

- Covered and killed when dropped: `/` (m8/m3 patterns), `/tmp` (m3), `/run` (m2), `/proc` (m10).
- **Not covered, survives with a real host write: `/dev` (m5/l5)** — `--bind /dev /dev` overlays the
  callers' host devtmpfs over `--dev /dev`; `/dev/shm` is user-writable, so a child wrote a host
  file while the suite said PASS. The frozen G2 list also omits `/dev`.
- **Not covered: `/sys` (m4/l4)** — accepted; host sysfs is not user-writable so I could not convert
  it into a host write (write → `EACCES`), but the contract sentence ("/sys stays as the sandbox
  mounts them") is unenforced by the suite. G2 omits `/sys` too.
- **Not covered: realpath-source aliasing (`m6/l6`) and the AND form (m9)** — bwrap's own
  "Can't mount on symlink destination" is the only thing that saves this construction today; the
  suite has no symlink-source vector. The realpath check is defence-in-depth, not load-bearing for
  the one argument shape the parser can produce (src and dst both derive from the same `--bind`
  value, so a symlink argument also makes the destination a symlink).
- **Not covered: "refused argument ⇒ no child ran"** (m1/l1). This is the structural gap: all
  refusal evidence is exit-code + stderr text.
- Equivalent survivor: m7 (`bad(resolve(v))` dropped) is harmless while `/tmp` is a real directory;
  it matters only if `/tmp` itself is a symlink, where `bad(r)` would stop matching.

### Minimal additions that would close the survivors (findings, not contract changes)

1. Add `/tmp`-sibling refusal vectors for `/dev` and `/sys` to the usage list — kills m4/m5.
2. Add a symlink-to-`/tmp` source vector (`ln -s /tmp W/link`), assert exit 64 — kills m6/m9 and
   pins `bad(r)`.
3. After a refused `--bind /tmp` call, assert a marker the child would write to its `/tmp` is
   **absent from the host** (the G3/G8 technique, inverted) — kills m1/l1. Exit-code-only arms
   cannot.
4. Print the bind argument (or a per-vector label) in the FAIL detail instead of `args.slice(0,2)`.

## Evidence

Commands (all from `/tmp/r50-mutselftest.cCsLqN`, one scratch per mutant; each suite log kept as
`logs/<id>.suite.txt` during the run):
```
git -C <lane> archive 6927903… | tar -x -C $T
node $T/scripts/cap-run.mjs --selftest                       # 12/12 PASS, exit 0
for m in m0..m10 l1 l4 l5 l6; do node $T/$m/scripts/cap-run.mjs --selftest; done
node $T/<mut>/scripts/cap-run.mjs --mem 64 --tasks 8 --budget 10 --bind <arg> -- node -e '<write marker>'
```
Full hashes of every scratch file:

```
64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672  pristine (rev 6927903)
87b20268f492ab49f0540f3b5eddcbedbd9687fe4b198f74411388d61afdf228  m0   control
a12727b1c6e005d036316d6a6f2991c43bade0d008e7e3f80d1af029a6524d12  m1   late refusal
dd915ed0798135d12445d5d3c9fad9740519a3430014d4428d9eb56b2f9b48ef  m2   drop /run
7143177decc07e5dde8ace6fadbe550ef2c030d203926ffcb0bcd2eb751b0b80  m3   drop /tmp
458bb91ee230cd09bb412c3ff52420917bb01d1757dfce305903dd1224b799f8  m4   drop /sys
10d770e2d49735e5cb81afe0512382274fe51ebe9ed0582d092d15cd838ae0b4  m5   drop /dev
efd5ea0df493fc55f332af9d4d6ec0277ddba373a31fe63f90df39939c0018d5  m6   drop bad(r)
4bc17a6fc4bdc0f57ffd177bab408fc5f9e72da3529eb0a17edbefecf857f456  m7   drop bad(resolve)
44f4ebeb6e6935ba1b4b1288afaaca55145cd8ca69c93ed7493008540f7d2f7a  m8   no refusal
06cf6fb7ba9c82dba88891f084273e84d73af96fd469e129075bce37cbd72be2  m9   OR→AND
5c64fe73c9cd9408a47e5fde78b3afa2173504539301f32c788ddc84b8d4f7c2  m10  drop /proc
d9ba41796f09aeb3198d96da8a659c71e838173f4f64ee69c9e1badb065cf854  live base
22f7471a550631e4c04a7c52373b0f466514e60a6fbdd942756c3d317c23bf27  l1   live late refusal
fb4ecfc2dea65602b1277bbbffa7cd7d1d4cd831715fa2227d9b590c4c854bf7  l4   live drop /sys
cd6db2536f2f5f50c0d741463649a0dcc19ab79a661ef6967f12034659f7bc36  l5   live drop /dev
862699e7c45b3c00cf6e0fdd66dc595e06de73ba0bcfa27ece8e0c073f6d414d  l6   live drop bad(r)
```

## Cleanup / restoration

- The lane checkout was never written by this seat; the only lane change in `git status` is the
  integrator's `M scripts/cap-run.mjs` (cwd guard), observed mid-run. The frozen rev blob still
  hashes `64fafb42…`: `git show 6927903:scripts/cap-run.mjs | sha256sum`.
- All 17 variant files and their logs lived under the disposable `mktemp -d`
  `/tmp/r50-mutselftest.cCsLqN`; every host marker (`/tmp/r50-mut-*`, `/dev/shm/r50-mut-*`,
  `/run/user/1000/r50-mut-*`) was removed after each probe, and the scratch tree was deleted after
  this report was written. Nothing outside `/tmp` scratch and this Report file was created.
