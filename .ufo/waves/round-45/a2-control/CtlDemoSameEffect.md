RESULT CtlDemoSameEffect rev=a2e5b54c verdict=rejects inherited_receipt_has_both=no

# CtlDemoSameEffect — a do-nothing control whose `jj st` moves the op-log count

Host observed: jj `0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, git `2.56.0`, kernel `7.2.11-arch1-1`.
Every run under `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900`.
Scratch `/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlDemoSameEffect/` (7.7 MB after cleanup). Nothing installed.

## 1. Counterexample (V1): control with no stray file, same op-count delta

`variant.sh` (sha256 `505d2b39…`) builds two fresh colocated repos (`git init` + one base commit + `jj git init --colocate`). Both sandboxes carry the same untracked `note.md`; only the effect repo also carries `stray-report.md`. Receipt lines produced (`variant-out.txt`, sha256 `5903ab3b…`):

```
  CONTROL  before: ops=4 @=c2e40b166338
  CONTROL  jj st : Working copy changes: A note.md
  CONTROL  after : ops=5 @=6dc69049ab1d  diff=[note.md | 1 + 1 file changed, 1 insertion(+), 0 deletions(-)]
  EFFECT   before: ops=4 @=9a0cd2c47083
  EFFECT   jj st : Working copy changes: A note.md
  EFFECT   after : ops=5 @=d91cc979ddd9  diff=[note.md | 1 + stray-report.md | 1 + 2 files changed, 2 insertions(+), 0 deletions(-)]
```

Both runs move the op-log count 4 → 5 and move `@`. On the op-count line the control is indistinguishable from the effect; only the diff body differs.

V2, a control with **no working-copy file at all** (a git tag moves, refs import): `before: ops=4 @=76b01470a5dd` → `jj st` → `after: ops=5 @=76b01470a5dd  diff=[0 files changed…]`. Op count moves, `@` and the working tree do not.
V3, the only shape that gives `4 → 4`: a genuinely clean repo (`jj st` → `The working copy has no changes.`).

The item’s suggested mechanisms do **not** reproduce on 0.45.1 (V4): tracked-file mtime moved backwards (`touch -d 2020-01-01`), a tracked file rewritten with identical bytes, and `snapshot.auto-track = "none()"` with an untracked file all give `ops=4 → 4`, `diff=[0 files changed]`. What reproduces is a sandbox that is not clean at measurement start, or a pending git ref/HEAD import.

## 2. The inherited receipt’s own sandbox is the trap

E7’s recipe (line 30) is “lane-shaped clone (real 21 sibling report files copied in)”. I ran that recipe at `a2e5b54c` (`lane-measure.sh`, sha256 `2d6ef4a9…`): `git clone --no-hardlinks` + `checkout --detach` + `jj git init --colocate`, then copy `build/*.md` (39 files now: 38 `.md` + `swarm-registry.json`; the receipt’s 21 is stale). Output `lane-out.txt` (sha256 `dd354fd1…`):

```
== lc (reports=38)   ops_before=5  ops_after=6  diff_files=38 files changed, 2883 insertions(+)     diff_has_stray=0
== le (reports=39)   ops_before=5  ops_after=6  diff_files=39 files changed, 2884 insertions(+)     diff_has_stray=1
```

The control (no stray file) snapshots 38 files and advances the op log exactly as the effect does. Cause: the lane’s `snapshot.auto-track = "none()"` is a per-repo key under `~/.config/jj/repos/<path-hash>/`, so it does not travel with the clone (the receipt says this itself, lines 98–103); the clone snapshots the copied reports.

## 3. What a reviewer applying K2 must compare

For every demo the entry cites, from the **same** sandbox recipe and config, compare receipt lines:

1. the demo’s stated observable before **and** after the command, printed as the same scalar with both values, for the effect run **and** for the do-nothing control run (for E3/E4/E7 that scalar is the op-log count; a bare “unchanged”, or one value, is not a line);
2. the full command bodies of both runs (`jj st` text and `jj diff -r @ --stat`), because the op count is not specific to the stray file — any new path or git-ref import moves it;
3. the sandbox pre-state, printed before the BEFORE measurement: `git status --porcelain` empty, or `jj st --ignore-working-copy` → `The working copy has no changes.`;
4. a re-run of both in that recorded-clean sandbox: effect delta ≠ 0, control delta = 0 and control diff `0 files changed`.

Reject if (i) the control’s delta on (1) equals the effect’s, (ii) the control’s body on (2) shows any snapshot (`Working copy changes:`, non-empty diff), (iii) the control’s line on (1) is missing or qualitative, or (iv) the sandbox was dirty at measurement start (pre-existing untracked paths, copied-in reports, moved refs/HEAD).

## 4. Check of `build/DemoJjSnapshot.md`

File sha256 `bf4cd1b36dca1d1d0fd06e96b0282d5cd3f8cf801ba607760e98e0476afb0cd9` (untouched by me).

- Line 26 (E3 effect): `op-log length 4 → 5`; line 27 (E4 effect): `op-log count 3 → 4`; line 30 (E7 effect): `3 → 4`. Effects carry the op-count line.
- Line 24 (E1, the do-nothing control): `jj st` body, `0 files changed` body, and “`@` commit id and `refs/jj/keep/*` count unchanged” — **no op-log count and no numeric `@`/keep values**. The control line for the predicate the effects use is absent.
- Line 25 (E2, the primary M1 claim): body-only, no op-count line; its body pair with E1 is complete.
- Line 28 (E5): “op-log count unchanged at 3” — one value, no before/after pair, and its control is the ignored-file shape, not the do-nothing one.
- Line 30’s second half is the `--ignore-working-copy` control (`3 → 3`), a different action, not the do-nothing control.

So `inherited_receipt_has_both=no`: E3/E4/E7 rest on an op-count change with no paired do-nothing control line, and E1’s control cannot be compared numerically. E1’s *conclusion* is reproducible (V3: `4 → 4` in a clean repo); only its evidence line is missing.

## 5. Smallest safe correction

1. K2 addendum (append, do not reword): “The control receipt prints the same before/after scalars as the effect and both full command bodies, from a pre-state printed as clean (`git status --porcelain` empty or `jj st --ignore-working-copy` clean); a control whose body shows any snapshot, or whose sandbox held untracked paths at measurement start, does not count.”
2. Receipt erratum for `DemoJjSnapshot.md`: add E1’s op-count line (clean colocated repo: `ops=4 → 4`, `@` unchanged — reproduced above) or re-run E1; and normalize E7’s sandbox (commit or omit the copied reports before measuring) so the do-nothing control can be clean.
3. In the entry, cite E2/E1 on the body predicate and E3/E4/E7 only after (1)+(2); never cite an op-count delta as the sole evidence.

No entry judgment made; this reviews the demo receipt only. No lane file other than this report was written; clones deleted; `pgrep -af a2-CtlDemoSameEffect` → no match after the runs.
