# RevGateCount — kumitate round 59

Axes: operability + coverage. Named item: count `| gate |` rows in `SKILL.md` and read the line containing `are gates`. Required: prose integer 19, row count 19, and one of those rows named `cite-sources`. Score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213` (the item does not name the base). This report is not a round verdict.

## Scoped findings

1. **Both numbers are 19.** Quoted from the named path at `2026-10-24T21:35:11-03:00`:

   ```text
   command: grep -c -F '| gate |' /home/vgpnk/Projects/shokunin/kumitate-shokunin/SKILL.md
   19
   grep_c_exit:0
   ```

   The count sentence is line 589. The token immediately before the phrase `are gates` is `Nineteen`, which denotes 19. That line does not contain the digit characters `19`.

   ```text
   589:Registry home per the fleet protocol's §Gate standard (round 34). Nineteen are gates (each can exit 1 on a real defect; `anchor-truth` added round 38, `wave-census` round 41, `gate-mutants` round 42, `omp-census` round 44, `bind-oracle` round 49, `counter-pins` round 54, `source-capture` round 55, `source-dupes` round 56, `receipt-evidence` round 58, `cite-sources` round 59);
   ```

   Prose integer **19**. Row count **19**.

2. **One of the 19 rows is `cite-sources`.** `awk` printed `AWK_ROWS	19` and these first cells, each on a line that contains `| gate |` exactly once and whose second cell is `gate`: cite-check, surface-probe, round-gate, proxy-check, claims-check, kimi-census, sources-check, anchor-truth, wave-census, gate-mutants, omp-census, receipt-evidence, bind-oracle, receipt-attest, counter-pins, source-capture, source-dupes, readme-map, cite-sources. The last is line 625. `grep -n -F '| gate |'` exited 0; that line begins `| cite-sources | gate |` and the full line is in `grep-gate-rows.worktree.txt`. Opening cells:

   ```text
   625:| cite-sources | gate | `node scripts/cite-sources.mjs [--readme PATH] [--sources PATH]` → `CITE_SOURCES: CLEAN\|DRIFT\|FAIL-CLOSED`
   ```

   No duplicate name. No `| gate |` line fails to start with `| `. A kind-column walk of the registry span (header line 599 through the line before `Named legacy gaps`) also prints `registry_kind_gate=19`.

3. **Three exclusions do not change the 19.** The same span has three data rows whose kind cell is not `gate`, so they are not `| gate |` rows: `cap-run` runner (line 612), `counter-rerun` probe (line 615), `cap-spawn` helper (line 617). The header and the `|---|` separator are not rows. Blank lines 613, 621, and 623 are not rows; rows after those blanks are still counted. Escaped pipes inside later cells (`CLEAN\|DRIFT` and similar) raise some split-cell counts above 5. They do not add a second `| gate |` token on any line (`multi_token=0`).

4. **A fixed-string search for `are gates` hits two lines; only one states the integer.** `grep -n -F 'are gates'` exited 0 and printed line 589 (above) and line 732, `pin-aware gates resolve `--src` from the pin's read-only clone, assert`. The second hit is the interior of the word `aware`. It has no number token. The phrase match, not preceded by a letter, is only line 589. Adjacent prose on that same file agrees: line 594 says `all nineteen`, and line 597 says `"all nineteen"`.

5. **The named path is the score-revision blob, not the base.** `git rev-parse HEAD` printed `5469c0a58d7986ff8a5f203938ae1c8785a92213` (subject `round-59: put the frozen A59 literals on one line`). `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213:SKILL.md`, `git rev-parse HEAD:SKILL.md`, and `git hash-object` of the path, before and after the count, all printed `746c9e66b1edaadc743d9f8290513cf4aba6575e`. `cmp` of the worktree file against `git cat-file -p` of that blob exited 0. sha256 of both is `498b2553b95ebc885e62363d077620d38d000bfc80287b857d94e8e8e8aae869`. The same counters on the blob print prose integer 19, row count 19, and `cite-sources` first-cell count 1. `grep -c -F '| gate |'` on the blob printed `19`.

   The base `0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f` is a different file (`cmp` exit 1; sha256 `2c6eae5973a51cf6fba176dfef6adeb6381551354778d1f3adbb814cc5e59de4`). It is not the item's object. On that blob, `| gate |` rows are 18, `cite-sources` is absent, and the count sentence is wrapped (`Seventeen are` / `gates`), so a single-line `are gates` search does not see it. Nearby base prose says `all eighteen`. That disagreement is not the surface counted here.

Corroborated on the named path: prose integer 19, row count 19, and one row is `cite-sources`. Not a round verdict. The probe's B3 line was not used as the measurement.

## Evidence

Under `.ufo/waves/round-59/build/RevGateCount/`:

- `clock.txt` — count time.
- `identity.txt`, `identity.err` — read-only rev identity. stderr empty.
- `skill.worktree.md`, `skill.at-rev.md`, `skill.at-base.md`, `skill.sha256`, `skill.cmp`, `hash-object.after.txt` — bytes compared. No index refresh (`cat-file`, `rev-parse`, `hash-object` only).
- `grep-c.worktree.txt`, `grep-c.worktree.err`, `grep-gate-rows.worktree.txt`, `grep-are-gates.worktree.txt` — quoted path commands.
- `awk-names.worktree.txt`, `awk-names.rev.txt`, `count.worktree.txt`, `count.rev.txt`, `summary.tsv` — name list and the three-way agreement.
- `grep-c.rev.txt`, `grep-c.base.txt`, `grep-are-gates.rev.txt`, `grep-are-gates.base.txt`, `count.base.txt`, `awk-names.base.txt` — score-rev repeat and the labeled base contrast.

No production file, another seat's directory, Git/JJ state, or index was modified. No commit, push, install, or subagent spawn occurred.

Report: .ufo/waves/round-59/w1/RevGateCount.md
