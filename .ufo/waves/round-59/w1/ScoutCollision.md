# ScoutCollision — round 59 / w1

Axes: operability, coverage. This file corroborates or falsifies the named collision item. It is not a verdict on C1 or C2, and it does not attest REPAIR59 or DOCTRINE59.

Item: re-run the 0–3 space id extract on `corpus/SOURCES.md` and on `/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md` (read-only), `comm -12` the id lists, and quote reg count, staged count, and collision count. The item expects collisions empty.

**Named expectation falsified.** On the two files the item names, at `2026-10-24T21:43:32-03:00`:

- reg count = **126**
- staged count = **147**
- collision count = **3**

`comm -12` printed `S125`, `S127`, `S136` and exited 0. Collisions are not empty.

## Extract

The 0–3 space id extract is the census table-row recognizer, not the Registry-section gate. `scripts/sources-census.sh` lines 40 and 615 accept 0–3 leading ASCII spaces before a `|`. The id is the trimmed second `|`-field. Keep `^S[0-9]{3,}$`. The header cell `id` and the separator `---` fail that pattern and drop. `NF=13` is not required: the lesson fixture `  | S125 |` is a 2-space row with three fields, and the saved program extracts it.

Saved program: `.ufo/waves/round-59/build/ScoutCollision/extract.awk`, sha256 `1109927a9e3e8528fb4af7b9a1640e0bc0119683721a33278751654c1e86d8ca`. A second `gawk -f extract.awk` on both named files compared equal to the first extract (`reg_rerun_cmp_exit=0`, `staged_rerun_cmp_exit=0`).

The staged file has no `## Registry` heading (`grep -c` of `^## Registry$` printed `0`). A Registry-gated control on the same bytes prints staged count 0 and collision count 0. That empty collision count is vacuous: it extracts nothing from the file the item named. The ungated extract is the one that matches the collision-guard staged list already on disk (see below).

On these two files every `|` row is column 0 (`leading_0=128` on the registry, `leading_0=149` on the staged file; no 1–3 space rows, no 4+ space rows). The space tolerance did not add or drop an id here. The fixture pin, not an input, shows the rule still fires: `  | S125 |` extracts `S125` at `spaces=2`; three spaces extract; four spaces extract nothing (`11-fixture-4space.out` is 0 bytes).

## Command output

Inputs, read-only. Staged sha256 `b168255861dbe8ef3d5ea300e5482d9ac09407d4de4a6146a2135e741abf4cf0` (153 lines, 190317 bytes). Registry sha256 `dae027546be53767aba9265cf19ac8c9ee0ec3455b767e6b27f643cfd2bd37af` (257 lines, 97779 bytes). After the extract, the staged file's mtime, size, inode, and sha256 were unchanged (`21:17:10.588047108 -0300`, inode `144995215`). Nothing was written under `/home/vgpnk/Projects/shokuknow`.

`wc -l` of the unique id lists and of `comm -12` (`16-quote-transcript.txt`):

```text
126 .../05-reg-ids.unique
147 .../05-staged-ids.unique
  3 .../07-collisions.txt
```

`LC_ALL=C comm -12` stdout, exit 0:

```text
S125
S127
S136
```

Raw equals unique on both lists. `uniq -d` on each sorted list is 0 bytes. Each of the three ids occurs once in each unique list. Staged ids run `S125` through `S271` with no gap (147 = 271 − 125 + 1). Registry ids run `S001` through `S136`, 126 unique.

The three ids are real rows, not prose hits. Registry lines 137–139. Staged lines 7, 9, and 18. Each line matches `^ {0,3}\|`.

## What the empty expectation still describes

It does not describe the files the item names.

Live `corpus/SOURCES.md` equals the score blob. `git rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. `git status --porcelain -- corpus/SOURCES.md` printed nothing. `cmp` of the worktree file against `git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/SOURCES.md` exited 0. The same extract on that blob is reg 126, collisions 3 against the staged list. The collision is in the score tree, not a dirty worktree.

The item does not name the base. The same extract on `git show 0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f:corpus/SOURCES.md` is reg 123, collisions 0 against the same staged list. That matches the lesson sentence "Collision guard (0–3 leading spaces): reg 123, staged 147, collisions 0" and the receipt files under `.ufo/waves/round-59/assimilation/`: `reg-ids` 123, `staged-ids` 147, `collisions` 0 bytes. `cmp` of this re-run's staged unique list against `assimilation/staged-ids` exited 0. `cmp` of this re-run's registry unique list against `assimilation/reg-ids` exited 1. The three ids only in the live registry are `S125`, `S127`, `S136` (`10-reg-only-live.txt`).

So the receipt is a pre-admission snapshot. Re-running the extract on the current registry, which already contains those three admitted rows, collides with the staged package on exactly those three ids. The receipt file being empty does not make this re-run empty. E5 reads that receipt; this seat did not run `doctrine59-probe.mjs` or `repair59-probe.mjs`.

## Scope

Evidence is under `.ufo/waves/round-59/build/ScoutCollision/`. Primary captures: `13-counts.txt`, `07-collisions.txt`, `16-quote-transcript.txt`, `05-reg-ids.unique`, `05-staged-ids.unique`, `extract.awk`, `02-identity.txt`, `01-input-sha256.txt`, `15-staged-sha-after.txt`.

No production file, corpus file, lesson, assimilation receipt, lane ledger, jj state, or Git index was changed. No install, pacman transaction, commit, push, or seat dispatch. The only writes are this report and that evidence directory.

Report: .ufo/waves/round-59/w1/ScoutCollision.md
