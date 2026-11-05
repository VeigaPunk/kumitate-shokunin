# K89Sentinel — artifacts only, no report file (captured by the L1)

Seat `K89Sentinel` (sentinel) settled without a report file; its final output in `../w1-results.json`
is truncated narration. It did leave a full attack harness and its receipts under
`../build/K89Sentinel/`, reviewed by the L1:

- `attacks.txt` / `attacks.json` — 30 attacks (R1–R9 revision binding through aliases, B1–B9 BOM/ZWSP
  placement, O1–O8 object kinds and tokens, T1–T4 receipt-file kinds) against base v2 and the
  then-current worktree candidate (sha `70dbcd5d…`, the L1's first draft — **not** the integrated
  candidate `37201ad0…`).
- `extra.txt` — X1–X9: `/proc/self/root` and `/proc/self/fd` aliases, symlinked `--lane`, outward
  symlinks, gitlink instruments.
- `races.json`, `fixture.json`, `probe-cand.txt` (candidate 30/30), `probe-fix.txt` (its own fix
  30/30), `fix-a-lexical-inlane.mjs` + `fix-build.txt` (a 40039-byte candidate fix against
  `70dbcd5d…`).

**Findings the L1 carries forward (not applied this round; the fix targets a superseded draft):**

1. **B2/B3/B7 — a BOM- or ZWSP-prefixed duplicate line bypasses `AMBIGUOUS_FIELD`.** A second
   `cmd=`/`rev=` line prefixed with U+FEFF or U+200B is invisible to the anchored field regex, so the
   duplicate is not counted and the first line wins silently — exactly the class the v2 rule exists to
   close. Base v2 and the draft both read `CLEAN`. Routed to round 90.
2. **R9 — a hard link to the worktree instrument is indistinguishable** from a real in-lane file at the
   judged rev (both `CLEAN external=1`). Declared limit of a path-based binder.
3. **T1 — a hard link to an outside receipt file** reads `CLEAN`; the receipt is a regular file under
   `--dir`, so no rule applies.
4. **T2 — a symlinked ancestor of `--dir`** is followed (`CLEAN`), while `--dir` itself being a symlink
   is `SYMLINK_DIR`. Inconsistent but disclosed.
