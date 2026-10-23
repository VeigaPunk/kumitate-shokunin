RESULT ScribeMistake rev=cac43009 verdict=DRAFTED

## Mistakes entry — draft for `corpus/lessons/round-47.md`

1. **class:** A correction rewrote an existing `SOURCES.md` row in place, replacing its previously admitted claim bytes instead of preserving them and appending a superseding row. Tip-only validation did not check the registry's history.
   **evidence:** `corpus/lessons/round-46-verifier-spotcheck.md:168-177` (R46-1) identifies 13 in-place rewrites: S003, S004, S013, S041, S047, S051–S055, S061, S073 and S076; it reports no `supersedes S0` rows. Independently run: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff 2b2bf7bb 9b33e03e -- corpus/SOURCES.md` → `corpus/SOURCES.md | 28 +++++++++++++-----------` and `1 file changed, 15 insertions(+), 13 deletions(-)`. The two additional insertions are S078/S079, not corrections. Fleet `CORPUS.md:116-118` Rule 2 requires only `status`, `recheck`, `used-by` to change in place and corrections to append a row whose `teaches` opens `supersedes S0NN —`.
   **captured-by:** none operationally. Rule 2 was the rule that should have caught it, but no revision-aware gate enforced it: `scripts/sources-check.mjs:6,179-190` reads one `corpus/SOURCES.md`, and fleet `scripts/sources-census.sh:7,467-483` selects a single current registry path.
   **fix:** Q35 below plus the append-only checker. The separate `ExecQ35AppendOnly` receipt shows the guard fails on the R46 rewrites and on an `opened` mutation, while accepting allowed `used-by` changes and an appended `supersedes` correction. The tested checker is delivered as `.ufo/waves/round-47/build/ExecQ35AppendOnly.sh`; the intended quality path `.ufo/waves/round-47/quality/q35-append-only.sh` was not present when read, so this draft does not claim it has been installed there.

## Q35 — draft text for `corpus/QUALITY.md`

- **Q35 — an existing `SOURCES.md` row is append-only except for `status`, `recheck` and `used-by`.** Grounding: fleet `CORPUS.md:116-118` Rule 2 and R46-1 (`corpus/lessons/round-46-verifier-spotcheck.md:168-177`); round 46 rewrote 13 existing rows without `supersedes` rows.
  - **Who checks.** The author runs the comparison from the round-open revision to the candidate before committing a correction. A non-author checks the same receipt at close and confirms each correction was added as a new row with `teaches` opening `supersedes S0NN —`.
  - **Field.** For every registry id present at base, the cells `id`, `source`, `kind`, `tier`, `scope`, `anchor`, `teaches`, and `opened` (cells 1–7 and 9) remain byte-identical at tip; a removed base row also fails. Only `status` (8), `recheck` (10) and `used-by` (11) may change in place. Corrections are new rows, not edits to an old row.
  - **Command.**
    ```sh
    .ufo/waves/round-47/quality/q35-append-only.sh <lane> <base-rev> <tip-rev>
    ```
    It reads committed `corpus/SOURCES.md` rows at both revisions. Exit 1 with `Q35 rewritten=<n> removed=<m>` when either count is nonzero; exit 0 when clean; exit 2 on usage or Git errors.
  - **Fails when.** Any immutable cell differs, a base row is removed, there is no check receipt, or a correction is not accompanied by the required `supersedes` row.
  - **Shown able to fail.** Receipt `.ufo/waves/round-47/build/ExecQ35AppendOnly.md:43-67` records `bash ./q35-append-only.sh ./lane 2b2bf7bb 9b33e03e` → `Q35 rewritten=13 removed=0`, exactly S003, S004, S013, S041, S047, S051–S055, S061, S073 and S076, exit 1. The same receipt records identity comparison 0/0 exit 0; a `teaches` edit 1/0 exit 1; a `used-by`-only edit 0/0 exit 0; an appended `supersedes` row 0/0 exit 0; row removal 0/1 exit 1; an `opened` edit `cells=9` exit 1; and table-padding-only change 0/0 exit 0. The receipt says these runs used `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900`.
  - **Limit.** The checker compares committed revisions only; it does not assess uncommitted bytes or validate that a new `supersedes` row is substantively correct. The non-author check must confirm the new row's `supersedes` wording and target.

## Evidence and scope

- This seat ran the read-only diff above; no gate, selftest, counter, or demo was run by this scribe. Q35 execution claims above are attributed to the separate `ExecQ35AppendOnly` receipt, not to this seat.
- The checker delivery is at `.ufo/waves/round-47/build/ExecQ35AppendOnly.sh`; the expected `.ufo/waves/round-47/quality/` directory was absent at report time. No source-code, `QUALITY.md`, or lesson edit was made by this seat.
- Only this report was written: `.ufo/waves/round-47/build/ScribeMistake.md`. No tool was installed. C1 routing, other R46 repairs, and installing the checker at its quality path are out of scope for this scribe item.