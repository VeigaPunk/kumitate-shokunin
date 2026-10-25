# CritBaseNotZero — do-nothing control at the named base

Axes: operability, coverage.

Scope: critic observation for the frozen do-nothing control. Not a claim verdict. Base named by the item: `0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f`. Score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213` is used only to bind the probe bytes that ran. This seat did not score that revision.

## Binding

`git rev-parse --verify 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f^{commit}` printed that hash and exited 0. `git cat-file -t` printed `commit` and exited 0. `git log -1 --format='%H%n%P%n%s%n%ci'` printed parent `95ab6fc9dfbba350469e5c3abec3f2cdc1224487`, subject `round-58 verifier spot-check (integrator, hyaku): non-author admit/reject`, committer date `2026-10-24 20:16:50 -0300`. `git merge-base --is-ancestor` of the base against the score revision exited 0 (stdout empty). `git rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. HEAD was not moved.

The counters executed are the score-revision blobs, not a dirty edit. `git rev-parse <score>:<path>` and `git hash-object` of the worktree file printed the same id for each probe:

- `repair59-probe.mjs` blob `401db5623589424a06bb2e19c4ecef8d6f5f28ee`, content sha256 `d3fa48ed30b516659e29f484a8305733da9bfec5339ece171e3a790b9586cf37`, 7930 bytes
- `doctrine59-probe.mjs` blob `bc2993bea72a69068861b22012e60022e1f9ecd8`, content sha256 `ef8176cd968fc23a3f1907ee6a16345428addd34bd9541ee52665f1ef18338a4`, 8124 bytes

Interpreter: `node` `v26.12.0` at `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`. Identity clock `2026-10-24T21:35:53-03:00` (`00-clock.txt`). `TMPDIR` was the seat build directory so extraction scratch stayed there. The probes still `git archive` the named rev; `TMPDIR` does not select the tree.

## UNMET lines

First capture, both probes, stderr 0 bytes.

Repair59 headline (first physical line of `repair59-base.stdout`, 526 bytes, sha256 `06d1d4c8d9c069952880d0b1758ed91664b560f5e0ad9cb566a6415014542bdf`):

```text
REPAIR59: REPAIR59_UNMET held=0/8 checks=8 rev=0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f rule=A59 version=v1
```

Doctrine59 headline (first physical line of `doctrine59-base.stdout`, 377 bytes, sha256 `d9909b9cbc3acda803624ac3b00acb598f2546ad7ccd3bcd0a10a47f25ebfc95`):

```text
DOCTRINE59: DOCTRINE59_UNMET held=0/5 checks=5 rev=0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f rule=D59
```

Exit codes: repair59 `1`, doctrine59 `1`. Token counts on the first capture: `REPAIR59_HELD` 0, `REPAIR59_UNMET` 1, `DOCTRINE59_HELD` 0, `DOCTRINE59_UNMET` 1. Arm tokens: `B1`–`B8` each `MISS` once and `PASS` zero times; `E1`–`E5` each `MISS` once and `PASS` zero times (`51-arm-tokens.stdout`).

Doctrine59 detail line, same capture:

```text
 | E1 MISS entry-absent | E2 MISS clauses=0 distinct=0 hash-miss=0 | E3 MISS S125:missing,S127:missing,S136:missing,S125:unpin,S127:unpin,S136:unpin | E4 MISS admit=false fanout=false detect=false flips=0 | E5 MISS collisions=absent empty=false regS124=false stagedS125=false
```

Repair59's arm record is not one physical line. `B1`'s detail embeds a node stack (`Cannot find module`, sliced at 120 characters), so `grep -c ' MISS '` on that file counts physical lines (`44-repair-miss-count.stdout` is `2`) and is not an arm count. The eight `B*` tokens above are the arm count. Full bytes are `repair59-base.stdout`.

Commands (cwd the lane):

```sh
TMPDIR=.ufo/waves/round-59/build/CritBaseNotZero/tmp-repair node .ufo/waves/round-59/probe/repair59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f
TMPDIR=.ufo/waves/round-59/build/CritBaseNotZero/tmp-doctrine node .ufo/waves/round-59/probe/doctrine59-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f
```

Rerun at `2026-10-24T21:37:41-03:00` (`37-rerun-clock.txt`, written after wait) exited `1` and `1`. `cmp` of each rerun stdout against the first capture exited `0`. Headlines matched.

## Attack

If either probe had printed `REPAIR59_HELD` or `DOCTRINE59_HELD` against this base, the do-nothing control would have failed and the corresponding claim would be void.

That condition was not observed. Both headlines are `UNMET`, both exits are `1`, and neither HELD token occurs in either capture. The plan's do-nothing rule (must not print HELD) is corroborated for these probe bytes at this base. This seat does not turn that into a claim verdict, and it did not run either probe against `5469c0a58d7986ff8a5f203938ae1c8785a92213`.

## doctrine58 receipt

Named path `.ufo/waves/round-58/base/doctrine58-base.txt`. Regular file, 272 bytes, one trailing newline. Content sha256 `a4ae628971359db2bb779c60b93ffb417b2fc0371d4f9f9aecc74065d7d73708`. `git hash-object` printed `be3c58c9d7a3bac2177bdd4ed1cee6174868df68`. The same blob id is what `git rev-parse` printed for that path at the base, at the score revision, and at HEAD. `cmp` of `git cat-file -p be3c58c9d7a3bac2177bdd4ed1cee6174868df68` against the named path exited `0`. `git check-ignore -v` exited `1` with empty stdout (not ignored). `git ls-files` listed the path.

Exact receipt line:

```text
DOCTRINE58: DOCTRINE58_UNMET held=2/5 checks=5 rev=c49f2a8dc1e6e5e4341e15ac279185aab7e0be37 rule=D58 | E1 MISS entry-absent | E2 MISS entry-absent | E3 MISS S121:missing,S122:missing,S123:missing,S121:pin-miss,S122:pin-miss,S123:pin-miss,S124:pin-miss | E4 PASS | E5 PASS
```

`held=2/5` occurs once (grep exit `0`). `held=0/5` occurs zero times (grep `-c` printed `0` and exited `1`), on both the named path and the blob extract. The receipt says `held=2/5`, not `0/5`.

This is a byte confirmation of the filed receipt. This seat did not re-execute `doctrine58-probe.mjs`.

## Evidence

Lane-relative, under `.ufo/waves/round-59/build/CritBaseNotZero/`:

- `repair59-base.{command,stdout,stderr,exit}` and `repair59-base-r2.*`
- `doctrine59-base.{command,stdout,stderr,exit}` and `doctrine59-base-r2.*`
- `33-repair-headline.txt`, `34-doctrine-headline.txt`, `35-capture-sha256.stdout`, `38-repair-rerun-cmp.exit`, `39-doctrine-rerun-cmp.exit`, `51-arm-tokens.stdout`
- `00-clock.txt`, `01-rev-parse.*`, `02-cat-file.*`, `03-log.*`, `04-ancestor.exit`, `05-probe-sha256.stdout`, `16-head.stdout`
- `25-repair-probe-at-score.stdout`, `26-doctrine-probe-at-score.stdout`, `27-repair-probe-hash-object.stdout`, `28-doctrine-probe-hash-object.stdout`
- `doctrine58-base.txt`, `47-receipt-blob.txt`, `09-receipt-sha256.stdout`, `17-receipt-hash-object.stdout`, `18-receipt-at-score.stdout`, `19-receipt-at-base.stdout`, `20-receipt-at-head.stdout`, `21-held-2of5.*`, `22-held-0of5-count.*`, `48-blob-held-2of5.*`, `49-blob-held-0of5.*`, `50-blob-vs-path-cmp.exit`
- `POLLUTED-EXITS.txt` — four early `*.exit` files were dropped because they were captured after `|| true` and were not exit codes

`44-repair-miss-count.stdout` must not be read as an arm count.

No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. No install, pacman transaction, commit, push, or mutating git/jj command was used. No seat was dispatched.

Report: .ufo/waves/round-59/w1/CritBaseNotZero.md
