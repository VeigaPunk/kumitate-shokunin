# SKILL.md — gate-registry rows and decision tables for round 64's two surfaces

Two rows for the `## Gate registry` table (columns: `| name | kind | entry command | self-test | pinned values live in |`),
plus the two intro sentences the row count changes, plus a "when to run" decision table per tool, plus the
control-addition recipe the ratchet needs. The checklist items live in `checklist-item.md`.

---

## 1. Registry rows (paste as the last two rows of the table, after `plan-before-ready`)

| name | kind | entry command | self-test | pinned values live in |
|---|---|---|---|---|
| report-receipt-diff | gate | `node scripts/report-receipt-diff.mjs --lane <lane-dir> --round N --report <file> [--rev <lane-rev>] [--fleet <dir>]` → `REPORT_RECEIPT: CLEAN (round=N rev=<rev\|worktree> bytes=N)` exit 0 / `REPORT_RECEIPT: DRIFT <sorted-ids> (…)` + one `<ID> <detail>` line per finding, exit 1 / `REPORT_RECEIPT: FAIL-CLOSED rev-unreadable\|report-unreadable` exit 2 / `usage: …` on stderr exit 64, contract `kumitate-report-receipt-diff-v1` (round 64; `considerthese/2026-10-25.md` idea 2): diffs ONE round report against the lane's committed receipts. `--rev` is a **lane** revision, the only receipt source (`git show <rev>:.ufo/waves/round-N/{base,close}/*`; the worktree only when `--rev` is absent) and the tip of the ancestry test; the report file is read live from disk, never from git. Findings: `PLACEHOLDER` (a `__NAME__`/`LANE_HASH`/`TBD` token — an angle-bracket `<tip>` is a legitimate command template and is not flagged, a fenced `__COMMITS__` still is), `TALLY_UNRECEIPTED` (a labelled `<LABEL>_HELD\|UNMET held=x/y` that no receipt line carries with the same label and the same x/y), `RECEIPT_MISSING` (a named `.ufo/waves/round-N/(base\|close)/<file>` absent at the rev), `HASH_DEAD` (a 40-hex that resolves in neither the lane nor the fleet repo), `HASH_ORPHAN` (in the lane but not an ancestor of the rev), `SECTION_MISSING` (one of the six required headings `Work performed`, `Landed changes`, `Before → after measurements`, `Sources & frontier`, `Trend verdicts`, `SHONEN`), `SHONEN_COUNT` (the `SHONEN` heading not exactly once, or fewer than 4 `- [x~ ]` box lines under it). **Scope is the round report** (`.ufo/reports/round-N/kumitate.md`), not a seat report: a seat report reads `SECTION_MISSING` by design. Known limits: labelled tallies only (a bare `held=9/10` cannot be told from a plan's target), and a receipt the lane wrote is trusted as written | `--selftest` (`REPORT_RECEIPT_SELFTEST: PASS (20/20)` exit 0; 20 hermetic cases in one `mkdtemp` git fixture — `honest-clean`, four placeholder arms (measured, `LANE_HASH`, `TBD`, two-token count), three tally arms plus the bare-tally exemption, receipt present/absent, dead/orphan/live hash, section, three `SHONEN_COUNT` arms, round scoping, render exit map — with `FAIL <case>` lines on a miss. The suite prints **no** `VERDICT:` line, so it is not admissible to `gate-mutants`' K43 until it prints `VERDICT: FAIL`) + the 16 committed cases under `.ufo/waves/round-64/controls/receipt/` (`c0-honest` CLEAN/0, `c14-honest-templates` and `c15-honest-two-receipts` CLEAN/0, `c12-r60-shape` = the round-60 report shape; each case = `report.md` + `lane/` + `expect`, `expect` line 1 = exit code, line 2 = comma-joined sorted finding ids or `CLEAN`) | `.ufo/waves/round-<N>/{base,close}/*` at `--rev`; the report bytes; `--fleet` (default: the lane's parent when it has `.git`, i.e. the fleet root) for `HASH_DEAD` only. No `kumitate-gate-pins-v1` pin yet (round 64) |
| jj-seat-demo | demo — **not** a gate: it exits 0 or 2 only and has no exit-1 arm, so no defect can make it fail | `bash scripts/jj-seat-demo.sh` → 15 `JJ_SEAT: <key>=<value>` lines, then `JJ_SEAT_DEMO: DONE jj=<version>`, exit 0 / `JJ_SEAT_DEMO: FAIL-CLOSED <reason>` exit 2 (`jj-absent`, `git-absent`, `mktemp`, `git-init`, `fixture-root`, `jj-git-init`, `workspace-add`), contract `kumitate-jj-seat-demo-v1` (round 64): what a jj workspace is as a seat's working copy — `workspaces_after_add`, `seat_gets_base_file`, `seat_has_git_dir`, `seat_file_in_default_tree`, `default_status_clean_after_seat_write`, `seat_snapshot_in_shared_op_log`, `ignore_working_copy_adds_op`, `rewrite_seat_head_seat_state`, `rewrite_seat_head_description_seen`, `abandon_seat_head_seat_state`, `abandon_seat_head_files_on_disk`, `update_stale_recovers`, `absolute_path_write_seen_in_default`, `workspaces_after_forget`, `seat_dir_after_forget`. Hermetic: every repository is a fresh `mktemp` fixture, every git/jj call names it (`-C`/`-R`), identity only through `--config` inside the fixture, `JJ_CONFIG=/dev/null`, and the fixture root is asserted (`rev-parse --show-toplevel`) before the first commit. A changed value is a **measurement, not a failure**: the script never compares, the consumer does (J6 of `jj64-probe.mjs` runs it and diffs the key set against the entry's `## Demo outcomes`) | none — `--selftest` does not exist, and the script is its own fixture; the re-runnable check is `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> <rev>` (J6), which fails on any key whose live value differs from the entry's bullet or whose name is missing on either side | the 15 key/value pairs in `.ufo/waves/round-64/base/jj-seat-demo-freeze.txt`, measured with jj `0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`; a jj upgrade is expected to move values, and re-freezing means re-grounding the entry's `## Demo outcomes` |

## 2. Intro sentences the two rows change (`SKILL.md:589` and the verdict-map sentence)

Old text (verbatim, `SKILL.md:589`):

    Twenty-two are gates (each can exit 1 on a real defect; `inline-dispatch-evidence` and `plan-before-ready` round 63;

New text:

    Twenty-three are gates (each can exit 1 on a real defect; `report-receipt-diff` round 64; `inline-dispatch-evidence` and `plan-before-ready` round 63;

Old text (verbatim, the following paragraph):

    Verdict map for all twenty-two: `0` → clean,

New text (the same sentence with `twenty-two` → `twenty-three`) — and append to that same paragraph:

> `jj-seat-demo` is a **demo**, not a gate: it exits 0 (done) or 2 (fail-closed) and has no exit-1 arm, so the
> map's `1 → failed` never applies to it. Its evidence value is the key set that `jj64-probe.mjs` J6 compares;
> a jj upgrade that moves a value is a measurement to re-ground, not a red gate.

Row count after this round: 27 rows = 23 gates + `counter-rerun` (probe) + `cap-run` (runner) + `cap-spawn`
(helper) + `jj-seat-demo` (demo).

## 3. When to run `report-receipt-diff` — decision table

| when | command | expected | on anything else |
|---|---|---|---|
| **Before filing every round report**, after the round's `close/` receipts are committed | `node scripts/report-receipt-diff.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --round <N> --rev <lane-tip> --report /home/vgpnk/Projects/shokunin/.ufo/reports/round-<N>/kumitate.md` | exit 0 + `REPORT_RECEIPT: CLEAN (round=N rev=<40hex> bytes=<n>)` | `PLACEHOLDER`, `TALLY_UNRECEIPTED`, `SECTION_MISSING`, `SHONEN_COUNT` → fix the **report**; `RECEIPT_MISSING` → the receipt was never committed (or the round number is wrong) — commit it or drop the citation; `HASH_DEAD`/`HASH_ORPHAN` → cite a hash that resolves in the lane or fleet and is an ancestor of the tip. Never edit a receipt to match a report. |
| Before filing, while `close/` does not exist yet | do **not** pass `--rev`; expect no receipt to be found | — | a `TALLY_UNRECEIPTED` here is a false alarm: the receipt exists at no revision. Commit the receipts, then re-run with `--rev <tip>`. |
| Any seat report (`.ufo/waves/round-N/w1/<Seat>.md`, `w2/<Seat>.md`) | **do not run** | — | the six headings are the round report's template; a seat report reads `SECTION_MISSING` by design. Use `inline-dispatch-evidence --report` for seats. |
| The tool's bytes changed | `node scripts/report-receipt-diff.mjs --selftest`, then `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> <rev>` | `REPORT_RECEIPT_SELFTEST: PASS (20/20)`; `RECEIPT64_HELD held=5/5 checks=5 rev=<40hex> rule=R64` exit 0 | a `FAIL <case>` line names the broken rule; a probe MISS names the check (`P1`..`P5`) and its reason. |
| A report lie the tool accepts (the ratchet) | add a control (recipe below), then fix the tool | the new case exits as its `expect` names, and P2's floor stays 14 | never relax an `expect` file to match the tool; the direction is always tool ← case. |

### Adding a receipt control (exact recipe)

```bash
C=.ufo/waves/round-64/controls/receipt/<new-name>
mkdir -p "$C/lane/.ufo/waves/round-9/base" "$C/lane/.ufo/waves/round-9/close"
cp .ufo/waves/round-64/controls/receipt/c0-honest/report.md "$C/report.md"   # then change exactly ONE thing
printf '1\nPLACEHOLDER\n' > "$C/expect"        # line 1 = exit code, line 2 = sorted comma-joined ids or CLEAN
node scripts/report-receipt-diff.mjs --lane "$C/lane" --round 9 --report "$C/report.md"   # must exit as line 1, print line 2
```

`lane/` is a plain directory (worktree mode): in a non-git lane every 40-hex is `HASH_DEAD`, so `HASH_ORPHAN`
cannot be exercised this way — it needs a real fixture (`D=$(mktemp -d) && git -C "$D" init -q`, a side-branch
commit, the main line passed as `--rev`), and the committed control set as frozen exercises 6 distinct ids
(`PLACEHOLDER`, `TALLY_UNRECEIPTED`, `RECEIPT_MISSING`, `SECTION_MISSING`, `SHONEN_COUNT`, `HASH_DEAD`) where
`receipt64-probe.mjs:61` requires 8.

## 4. When to run `jj-seat-demo` — decision table

| when | command | expected | on anything else |
|---|---|---|---|
| **On a jj release** (any change of `jj --version`) | `bash scripts/jj-seat-demo.sh` | exit 0 + `JJ_SEAT_DEMO: DONE jj=<new-version>` and the 15 keys | exit 2 `FAIL-CLOSED …` is **not** a pass: no `jj`/`git`, or a fixture could not be built. Fix the host, do not edit the script. |
| Same run, compared with what the corpus entry states | command (B) below | no output, exit 0 | a differing line is a moved measurement: re-ground the entry's `## Demo outcomes` with the new value and the new jj version, and record the old value in the lesson — never delete the key. |
| As C2's ground (the counter) | `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>` | `JJ64_HELD held=8/8 checks=8 rev=<40hex> rule=J64` exit 0 | J6 names the key and both values (`<key>:stated=<x>:live=<y>`), or `stated-not-live`. |
| On a host without jj or git | — | exit 2 | report `JJ_SEAT_DEMO: FAIL-CLOSED jj-absent` verbatim; the demo's evidence is unavailable, so J5/J6 must not be claimed. |
| Anywhere but a fixture | never | — | the script builds its own `mktemp` fixtures and names every repository explicitly; do not copy its commands into the lane (they would write the lane's tree). |

Exact commands for the table above:

```bash
# (A) the demo alone
bash scripts/jj-seat-demo.sh; echo "exit=$?"

# (B) the demo vs the entry's stated outcomes (empty diff = the entry still quotes this host)
diff <(bash scripts/jj-seat-demo.sh | grep '^JJ_SEAT: ') \
     <(sed -n '/^## Demo outcomes/,/^## /p' corpus/knowledge/jj-workspace-seat-containment.md \
       | grep '^- ' | sed 's/^- /JJ_SEAT: /'); echo "exit=$?"

# (C) the counter that consumes the demo (J6 re-runs it from the archive)
node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>; echo "exit=$?"
```
