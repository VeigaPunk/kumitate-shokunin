# K91CriticA — scoped findings (C1 kill constructions, round 91)

Seat dir: `.ufo/waves/round-91/K91CriticA/` (`scores.md`, `cand/*.mjs`, `receipts/*.txt`,
`repro/*` — six committed git repos, one per reproduction). Full scorecard: `../K91CriticA/scores.md`.

**Result: C1's kill rule FIRES on three seat-built constructions.** Each scored
`C91_C1: HELD held=56/56` exit 0 on the frozen probe (sha `3bd88e8e…3f4c`, rev `2b1b8bf3…009d4`,
3 runs each) and each has a committed reproduction — probe-shaped receipt (`rev=`/`tool_sha256=`/`cmd=`),
named input, candidate WRONG + positive control ref-fd-fstat RIGHT on the same input:

1. **cand-extsh-gate** `2c797427…60850` — descriptor discipline gated on `/dev/*` or `*.sh`;
   all other external tokens take the v4 `readFileSync` path. Kills: FIFO without `.sh`
   (`repro/extsh-gate-fifo` @ `9a40cc29…`: no verdict, exit 124 at bound) and over-cap regular
   without `.sh` (`repro/extsh-gate-overcap` @ `7b4b5542…`: CLEAN exit 0). Declared classes:
   external FIFO, external regular over cap.
2. **cand-capwindow** `cdacfa5d…8fed1` — refuses only size === 16777217 (the probed fixture's
   size). Kill: 16781312-byte external regular with correct digest binds CLEAN
   (`repro/capwindow` @ `41abf2d3…`). Declared class: external regular over the cap.
3. **cand-dirhash** `c7fb60f5…2d` — refuses an EMPTY external directory (what A48 probes) but
   binds a non-empty one as its sorted-listing digest. Kill: `repro/dirhash` @ `b82af777…`:
   `CLEAN matched=1 external=1` on directory `bundle.sh`. Declared class: external directory.

Common root: the arms fix each RD-2 fixture's shape token (`.sh`/`/dev/*` spellings, exactly
16777217, empty dir), so a construction keyed on those tokens is indistinguishable from correct
inside the probe while wrong on the same declared class one token away. **Implication for
integration:** the v5 merge must be reviewed for any input-keyed gate (path prefix/suffix, exact
size, emptiness) — `held=56/56` alone does not establish the claimed behaviour.

**Not falsified:** the claimed behaviour itself (ref-fd-fstat discipline) was right on every
repro input; empty-regular/at-cap/U+200B-midtoken/carried-v4-shapes/contexts are pinned by
twin arms and admit no 56/56 wrong-verdict construction that I could find.

**ROUTED (out-of-class, per plan, not kills):**
- `repro/shy-strip` @ `6c6dbe3d…` (cand-shy-strip `282e086b…`, 56/56): stripping U+00AD from the
  mid-token binds CLEAN where UNRESOLVED is right — new invisible code-point class.
- `repro/extsh-gate-devalias` @ `46027256…`: `bash /proc/self/root/dev/zero` through the v4
  fallback → V8 OOM abort under the 2 GiB cap, exit 133, no verdict — char device via non-`/dev/`
  spelling (sentinel A4 mode survives any v4-descendant that gates its fd discipline).
