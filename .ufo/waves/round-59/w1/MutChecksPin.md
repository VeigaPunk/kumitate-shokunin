# MutChecksPin — kumitate round 59

Axes: operability, coverage.

Scope: C1 operability, rule A59. The committed `repair59-probe.mjs` at score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213` must print `checks=8` on a HELD line. A one-check deletion must not print HELD: the CritDropOne method is available, and `EXPECTED_CHECKS` is quoted from that committed file. Observation report, not a claim verdict. This seat does not score C2.

## Committed probe prints checks=8 on a HELD line

The named rev is a commit, and it is HEAD. `git cat-file -t 5469c0a58d7986ff8a5f203938ae1c8785a92213` printed `commit` and exited 0. `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213^{commit}` and `git rev-parse HEAD` both printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. HEAD was not moved.

The probe that was run is that commit's blob, not a drifted worktree file. `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/waves/round-59/probe/repair59-probe.mjs` and `git hash-object .ufo/waves/round-59/probe/repair59-probe.mjs` both printed `401db5623589424a06bb2e19c4ecef8d6f5f28ee`. `git cat-file -p` of that path wrote 7930 bytes. `cmp` of that extraction against the worktree path exited 0. sha256 of both is `d3fa48ed30b516659e29f484a8305733da9bfec5339ece171e3a790b9586cf37`.

Predicate-form run, captured `2026-10-24T21:40:01-03:00`, cwd the lane, interpreter `node` `v26.12.0` at `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`:

```sh
node .ufo/waves/round-59/probe/repair59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 5469c0a58d7986ff8a5f203938ae1c8785a92213
```

Observed exit code: `0`. Stderr was empty (0 bytes). Observed stdout, both lines:

```text
REPAIR59: REPAIR59_HELD held=8/8 checks=8 rev=5469c0a58d7986ff8a5f203938ae1c8785a92213 rule=A59 version=v1
 | B1 PASS selftest-8/8 | B2 PASS clean | B3 PASS prose=19 rows=19 cite-sources=true | B4 PASS cite=true receipt=true mapv2=true 16/16=true stale135=false | B5 PASS pinned=true status=0  | B6 PASS literal | B7 PASS TIER59: A=104 B=14 C=8 rows=126 | B8 PASS nuance=true pin-first=true
```

`checks=8` is on that HELD line. `grep -c` on this stdout printed `1` for `checks=8`, `1` for `REPAIR59_HELD`, and `0` for `checks-mismatch`. Stdout is 391 bytes, sha256 `70c0e2c97342628163edccd51096c7009884da18a3b1d7b0aa2fc46905cece33`.

An absolute-path run of the same blob at `2026-10-24T21:39:09-03:00` exited `0`, wrote empty stderr, and produced the same stdout (`cmp` exit 0, same sha256). That earlier command was `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/probe/repair59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 5469c0a58d7986ff8a5f203938ae1c8785a92213`.

## EXPECTED_CHECKS, from the committed file

Quoted from `git cat-file -p 5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/waves/round-59/probe/repair59-probe.mjs`, not from a worktree grep as the authority. `grep -n -F 'const EXPECTED_CHECKS = 8;'` on that extraction printed one line. `grep -c` of that assignment printed `1`. `grep -c "hold('"` printed `8`.

```text
42:const EXPECTED_CHECKS = 8;
```

The other `EXPECTED_CHECKS` hits on that blob are the comment at line 33 and the mismatch tail. The tail, same extraction:

```text
const mismatch = checks.length !== EXPECTED_CHECKS;
const full = rev.length >= 40 ? rev : rev;
const head = `REPAIR59: ${mismatch ? 'REPAIR59_UNMET' : (held === EXPECTED_CHECKS ? 'REPAIR59_HELD' : 'REPAIR59_UNMET')} held=${held}/${checks.length} checks=${EXPECTED_CHECKS} rev=${full} rule=${RULE} version=v1${mismatch ? ' checks-mismatch' : ''}`;
finish(held === EXPECTED_CHECKS && !mismatch ? 0 : 1, head);
```

`REPAIR59_HELD` is the branch taken only when `mismatch` is false. A one-check deletion leaves `EXPECTED_CHECKS` at 8 and makes `checks.length` 7, so `mismatch` is true. The headline then takes `REPAIR59_UNMET`, appends ` checks-mismatch`, and `finish` exits 1. That template cannot print HELD for a one-check deletion.

## CritDropOne method is available

Available at `2026-10-24T21:40:01-03:00`. `method_report_exists:1`. `method_artifacts_exist:1`. The report `.ufo/waves/round-59/w1/CritDropOne.md` is 6152 bytes, sha256 `8a64b4c12e8d8391f209c48ccd49b5db0fd63fe7c3b1509815257b3cd32bab62`. The method artifacts are under `.ufo/waves/round-59/build/CritDropOne/`: `command.txt`, `stdout.txt`, `stderr.txt`, `exit-code.txt`, `deleted-line.txt`, `mutant.diff`, `expected-checks.mutant.txt`, `hold-calls.mutant.txt`, `probe.unchanged.txt`.

The assigned method, from `w1-spec.json` seat `CritDropOne`: read the probe, confirm `EXPECTED_CHECKS` is 8, delete the B8 `hold()` call in a temp copy only, run that copy against `5469c0a58d7986ff8a5f203938ae1c8785a92213`, and quote the `checks-mismatch` line. Do not write the mutant into the lane.

Their captured command (`command.txt`):

```text
node /tmp/crit-drop-one.xl6gw2/repair59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 5469c0a58d7986ff8a5f203938ae1c8785a92213
```

Their deleted line (`deleted-line.txt`):

```text
    hold('B8', a && b, `nuance=${a} pin-first=${b}`);
```

Their stdout line 1, sha256 `987c487a07bd5f1c77c700f5b5cce8e63ef8fd79b33eb78c31fd090b5ba422cf`, and their exit file `1`:

```text
REPAIR59: REPAIR59_UNMET held=7/7 checks=8 rev=5469c0a58d7986ff8a5f203938ae1c8785a92213 rule=A59 version=v1 checks-mismatch
```

`grep -c` on that stdout, re-run by this seat, printed `0` for `REPAIR59_HELD`, `1` for `checks-mismatch`, and `1` for `checks=8`. The same three strings are present in their report (`critdropone.report-pins.txt`, each `present:1`). Their mutant left `42:const EXPECTED_CHECKS = 8;` (`expected-checks.mutant.txt`) and dropped the B8 `hold()` (`hold-calls.mutant.txt` lists B1–B7 only; `mutant.diff` is that one deletion). `probe.unchanged.txt` says `lane_probe_sha256_unchanged=1`.

This seat did not re-run that mutant and did not write a copy of it. The confirmation is the committed template above plus this available method.

## Attack

Target: a one-check deletion still prints `REPAIR59_HELD`.

It does not land. The committed assignment is `const EXPECTED_CHECKS = 8;`, and the committed headline emits `REPAIR59_HELD` only when `checks.length === EXPECTED_CHECKS`. The available CritDropOne method deleted one `hold()` call, left that constant at 8, printed `REPAIR59_UNMET` with `checks-mismatch`, exited `1`, and its stdout contains zero `REPAIR59_HELD`.

The intact probe, run here, did print HELD, and that line contains `checks=8`. Those are different runs. The HELD line is not evidence that a deletion would also print HELD.

## Evidence and scope

Under `.ufo/waves/round-59/build/MutChecksPin/`:

- `command.predicate.txt`, `stdout.predicate.txt`, `stderr.predicate.txt`, `exit-code.predicate.txt`, `stdio.predicate.sha256.txt`, `stdout.predicate.cmp.txt` — predicate-form run. stderr empty.
- `command.txt`, `stdout.txt`, `stderr.txt`, `exit-code.txt`, `stdio.sha256.txt`, `stdio.bytes.txt`, `held-line.scan.txt`, `probe.clock.txt` — absolute-path run of the same blob. stderr empty.
- `probe.at-rev.mjs`, `probe.at-rev.meta.txt`, `probe.blob.rev.txt`, `probe.hash-object.txt`, `probe.cmp.txt`, `probe.sha256.txt`, `expected-checks.committed.txt`, `expected-checks.quote.txt`, `expected-checks.pin.txt`, `held-sites.committed.txt` — committed blob and the `EXPECTED_CHECKS` quote.
- `head.txt`, `rev.txt`, `rev.type.txt`, `clock.txt`, `node.version`, `node.path` — read-only identity. `head.err` and `probe.at-rev.meta.err` empty.
- `critdropone.method.txt`, `critdropone.method.sha256.txt`, `critdropone.quote.txt`, `critdropone.held-scan.txt`, `critdropone.available.txt`, `critdropone.item.txt`, `critdropone.report-pins.txt`, `critdropone.sha256.txt` — CritDropOne method availability. No file was written into that seat's directory.

No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. No install, pacman transaction, commit, push, dispatch, or mutating git/jj command was used. Writes were confined to this report and `.ufo/waves/round-59/build/MutChecksPin/`.

Report: .ufo/waves/round-59/w1/MutChecksPin.md
