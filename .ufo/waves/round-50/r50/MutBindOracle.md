# MutBindOracle — r50 mutation probe: does bind-oracle see mount-order attacks beyond K4–K6?

Seat: `KumitateR50.MutBindOracle` (mutation-tester), round-50 wave `kumitate-r50`.
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` @ HEAD `6927903f99bbc26e397aa47387aa76950f42b3a5` (script bytes = `378b6e7` freeze + no later script edits).
Scratch: `git archive HEAD | tar -x -C $(mktemp -d)` — every command below ran there; the lane checkout was never edited.
Host: bubblewrap 0.13.1, node v24.21.0. Installs: none. bash `TMPDIR` empty, `XDG_RUNTIME_DIR=/run/user/1000`.
Pristine-byte identity at probe time (scratch vs lane): `cap-run.mjs` `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`, `bind-oracle.mjs` `c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5`. The lane working tree gained an unrelated uncommitted `cap-run.mjs` edit by another actor during the probe (see §8); all findings below are against the committed HEAD bytes named here.

Refs used: `scripts/bind-oracle.mjs:75,86,112,114,115,124,158,161-162,169`; `scripts/cap-run.mjs:190`;
`.ufo/waves/round-49/probe/bindoracle49-probe.mjs:8-13,106-108` (K4 drop / K5 extra / K6 no-tmpfs).

## 1. Baseline — existing selftest on CURRENT bytes

```
$ node scripts/bind-oracle.mjs --selftest
  PASS A1 live 3 binds
  PASS A2 live 0 binds
  PASS A3 drop-mutant
  PASS A4 extra-mutant
  PASS A5 no-tmpfs mutant
  PASS A6 missing runner
  PASS A7 usage arm
BIND_ORACLE_SELFTEST: 7/7 pass
VERDICT: PASS
EXIT=0
$ node scripts/bind-oracle.mjs --cap-run scripts/cap-run.mjs --binds 3
BIND_ORACLE: HELD binds=3 observed=3 absent=1
EXIT=0
```

## 2. Mutant (a) — `--tmpfs /tmp` duplicated at the END of argv (masks the request binds)

Construction (one-line replacement on committed `cap-run.mjs:190`, same `String.replace` idiom the oracle's own
`mutant()` uses at `bind-oracle.mjs:161`):

```diff
-    '--tmpfs', '/tmp', '--tmpfs', '/run', '--bind', cwd, cwd, ...o.bind.flatMap(...), '--chdir', cwd,
+    '--tmpfs', '/tmp', '--tmpfs', '/run', '--bind', cwd, cwd, ...o.bind.flatMap(...), '--chdir', cwd, '--tmpfs', '/tmp',
```
sha256 mutant: `a5ad86ea51a47950e8553d2f400ddf6d669e67d3a783801748e100a39a3fffa4`.

Verdict under the FROZEN oracle (its own cwd is a mkdtemp under `/tmp`, `bind-oracle.mjs:86`):

```
$ node scripts/bind-oracle.mjs --cap-run probe/cap-run.tmpfs-end.mjs --binds 3
BIND_ORACLE: NO_CHILD reason=no-child-report exit=1 CAP_RUN: EXIT code=1 unit=cap-run-...-1ac38f
EXIT=2
```

**NOT `MISSING`.** The child never starts: bwrap applies `--chdir` after every mount, and the trailing tmpfs removes
the oracle's own cwd. Direct proof:

```
$ (cwd=/tmp/r50-cwd) node probe/cap-run.tmpfs-end.mjs ... --bind /tmp/r50-binddir -- node -e 'console.log(1)'
bwrap: Can't chdir to /tmp/r50-cwd: No such file or directory
CAP_RUN: EXIT code=1 unit=cap-run-3929722-...-61c2a4
$
$ bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --tmpfs /run \
    --bind /tmp/r50-cwd /tmp/r50-cwd --bind /tmp/r50-binddir /tmp/r50-binddir \
    --chdir /tmp/r50-cwd --tmpfs /tmp -- /usr/bin/true
bwrap: Can't chdir to /tmp/r50-cwd: No such file or directory      BWRAP_EXIT=1
```

So the frozen counter fails *closed* (exit 2, no HELD) — but only because the instrument's cwd happens to live under
`/tmp`. Perturbing ONLY the oracle's cwd off `/tmp` (request dirs stay under `/tmp`; diff: line 86
`join(tmpdir(), 'bind-oracle-cwd.')` → `join('/home/vgpnk', '.r50-oracle-cwd.')`, sha256
`37998ab6686c16b8cb13d1ae23e860c0c287c28091e23cf093793e70192777ce`) exposes the semantics:

```
$ node probe/bind-oracle.cwd-home.mjs --cap-run scripts/cap-run.mjs --binds 3
BIND_ORACLE: HELD binds=3 observed=3 absent=1          EXIT=0     # control: perturbation clean
$ node probe/bind-oracle.cwd-home.mjs --cap-run probe/cap-run.tmpfs-end.mjs --binds 3
BIND_ORACLE: HELD binds=3 observed=3 absent=1          EXIT=0     # FALSE HELD — binds are masked
```

Raw ground truth under the same mutant (`/proc/self/mountinfo` field 5 + reachability + host-effect; cwd outside `/tmp`):

```
RAW: {"rows":[{"point":"/","fs":"btrfs"},{"point":"/tmp","fs":"xfs"},{"point":"/tmp","fs":"tmpfs"},
 {"point":"/tmp/r50-raw.MrTaet/bind0","fs":"xfs"},{"point":".../bind1","fs":"xfs"},{"point":".../bind2","fs":"xfs"},
 {"point":"/tmp","fs":"tmpfs"}],
 "exists":{".../bind0":false,".../bind1":false,".../bind2":false,".../control":false},
 "sentinel":{".../bind0":null,".../bind1":null,".../bind2":null,".../control":null},
 "wroteTmp":"yes","wroteBind":"err:ENOENT"}
host: /tmp/r50raw-... exists=false            # /tmp still masked
```

The three request-bind rows are **still listed** in mountinfo though the child cannot see the directories
(`exists=false`, sentinel unreadable, write `ENOENT`). `score()` tests mount-point membership only (`:112`), so
`observed=3`; `exists[]` is computed by the child (`:75`) but consulted only for the control dir (`:114`). Under a
surviving cwd this class is a genuine false `HELD`.

**Verdict:** survived as a false HELD when the cwd is not under `/tmp`; killed only incidentally (`NO_CHILD`, exit 2)
in the frozen configuration.

## 3. Mutant (b) — `--bind / /` appended at the END

```diff
-    ... ...o.bind.flatMap(([src, dst]) => ['--bind', src, dst]), '--chdir', cwd,
+    ... ...o.bind.flatMap(([src, dst]) => ['--bind', src, dst]), '--chdir', cwd, '--bind', '/', '/',
```
sha256: `b20f85a61671326f1c26df4e186b575bdfee92b4df7292f1e10e9ebb4732051e`.

```
$ node scripts/bind-oracle.mjs --cap-run probe/cap-run.bindroot-end.mjs --binds 3
BIND_ORACLE: MISSING missing=3 paths=R/bind0,R/bind1,R/bind2
EXIT=1
```

**Neither `EXTRA` nor `CONTROL` — it reads `MISSING`.** Raw ground truth (same probe):

```
RAW: {"rows":[{"point":"/","fs":"btrfs"},{"point":"/tmp","fs":"xfs"}],
 "exists":{".../bind0":true,".../bind1":true,".../bind2":true,".../control":true},
 "sentinel":{".../bind0":"S0",".../bind1":"S1",".../bind2":"S2",".../control":"CTL"},
 "wroteTmp":"yes","wroteBind":"yes"}
host: /tmp/r50raw-... exists=true             # sandbox's /tmp is host /tmp, read-write
```

The true breach is total: host `/tmp` is read-write (the child's `/tmp` file lands on the host) and the **control
directory is visible** (`CTL`). Yet `EXTRA` cannot fire because `/` is in the parent mount set (`:115,:124`), and
`CONTROL_VISIBLE` is never reached because `MISSING` is checked first (`:112` before `:114`). Exit 1 is correct for
the counter, but the named arm is K4-shaped while the defect class is K6 (host `/tmp` exposure) + root re-expose.

**Verdict:** killed (exit 1), mis-attributed.

## 4. Contrast — late `--bind /tmp /tmp` (the r49 R50-6 shape)

```
$ node scripts/bind-oracle.mjs --cap-run probe/cap-run.bindtmp-end.mjs --binds 3
BIND_ORACLE: CONTROL_VISIBLE visible=1 paths=R/control
EXIT=1
```
Raw: control sentinel `CTL` readable, host `/tmp/r50raw-...` exists=true, mount rows end with `/tmp` fs=xfs.
Killed correctly by the K6 arm (`CONTROL_VISIBLE`). This is the one mask shape the control directory catches.

## 5. Does the instrument's own suite catch a defect-carrying subject runner?

Subject = scratch `scripts/cap-run.mjs` replaced by the mutant of §2; three configurations:

| config | result |
|---|---|
| frozen oracle (cwd under `/tmp`) + broken subject | `BIND_ORACLE_SELFTEST: 2/7 pass` `VERDICT: FAIL` exit 1 — A1–A5 all `NO_CHILD` (cwd artifact) |
| cwd-off-`/tmp` oracle + broken subject | `BIND_ORACLE_SELFTEST: 6/7 pass` `VERDICT: FAIL` exit 1 — **A1 and A2 PASS** (`HELD`, accepted); A5 fails only because `String.replace` removes the *first* `--tmpfs /tmp` and the trailing one keeps the control hidden |
| cwd-off-`/tmp` oracle + pristine subject | `BIND_ORACLE_SELFTEST: 7/7 pass` `VERDICT: PASS` exit 0 (perturbation control) |

Exact B output: `FAIL A5 no-tmpfs mutant want exit=1 //^CONTROL_VISIBLE visible=1 // got exit=0 HELD binds=3
observed=3 absent=1`. The suite's kill of the broken subject is an artifact of §2's cwd placement (A1) and of mutant
construction (A5), not a semantic mask-order arm: **A1, the "live" mechanism arm, accepts a runner whose requested
binds are all masked** once the cwd survives.

## 6. K4–K6 mapping / answer to the item

| attack on the runner | nearest frozen arm | actual frozen-oracle read |
|---|---|---|
| K4 drop request binds | MISSING missing=3 | MISSING (seen) |
| K5 add `--bind /etc /etc` | EXTRA extra=1 | EXTRA (seen) |
| K6 remove `--tmpfs /tmp` | CONTROL_VISIBLE | CONTROL_VISIBLE (seen) |
| **new** late `--tmpfs /tmp` (mask) | none | `NO_CHILD` exit 2 under the frozen cwd; **`HELD` exit 0 if the cwd survives** |
| **new** late `--bind / /` (root re-bind) | K4's MISSING / K6's CONTROL | `MISSING missing=3` exit 1; control visible on the ground, never named |
| r49 shape late `--bind /tmp /tmp` | K6 | CONTROL_VISIBLE exit 1 (seen) |

`/proc/self/mountinfo` lists **covered** mounts (the pristine runner already shows two `/tmp` rows: host XFS +
cap-run's tmpfs), so mount-point membership is not evidence of reachability. The instrument sees "a later mount that
exposes a host path" only through the unbound-control trick (K6), and it cannot see a later mount that masks the
requested binds at all.

## 7. Coverage finding (not a contract change, not a claim edit)

- `score()` checks requested dirs by mountinfo membership (`bind-oracle.mjs:112`) and uses `exists[]` only for the
  control (`:114`). In the masked case `exists[requestDir]` is already `false` in the child's report — a requested-dir
  existence (or sentinel-read) check would close the class; the frozen instrument does not have one.
- The frozen counter's immunity to mutant (a) is incidental: `G5`/`K2` runs the oracle with its cwd under `/tmp`, and
  bwrap's post-mount `--chdir` fails, so a runner with a late `--tmpfs /tmp` yields `NO_CHILD` (exit 2), never `HELD`.
  As configured, both new mutants are non-HELD, so C1's `GUARD_HELD` is not defeated by them; the blind spot is an
  instrument-limit, not a live counter failure. If a future arm (K7) is proposed for the mask class, the run must use
  a cwd outside `/tmp` or it will measure the cwd artifact instead of the semantics.
- Mutant (b) is killed but filed under the wrong arm; a reader of `MISSING missing=3` would not learn that host `/tmp`
  was read-write. No exit-code consequence in G50/K4-K6.

## 8. Restoration / hygiene evidence

- My seat wrote only scratch: at probe start the lane bytes equalled committed HEAD (`cap-run.mjs 64fafb42…b672`,
  `bind-oracle.mjs c3929a97…11e5`); I ran no write, no `git add/commit/checkout` and no jj command anywhere.
- **Concurrent change, not mine:** by final verification the lane working tree showed ` M scripts/cap-run.mjs`
  (6+/2−, mtime `2026-10-23 17:51:27 -0300`, sha256 now `d9ba41796f09aeb3198d96da8a659c71e838173f4f64ee69c9e1badb065cf854`).
  The diff adds, in `run()`: `const cwdReal = realpathSync(cwd); if (cwdReal === '/tmp') usage(...)` plus a
  `cap(..., tmpdir())` selftest arm — a cwd guard this seat did not author and did not apply; my archive (HEAD bytes
  above) predates it. All evidence in this report is against the committed HEAD bytes, which any `git archive <rev>`
  counter also reads.
- Scratch tree, subject copies, `/tmp/r50-*`, `/tmp/r50raw-*`, and `~/.r50-*` cwds all removed; post-clean counts:
  `scratch=0 subj=0 raw=0 home=0`. My report file is the only artifact this seat wrote in the lane.
- No tool installs or upgrades were needed.
