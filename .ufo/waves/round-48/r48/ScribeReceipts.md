# ScribeReceipts — canonical R47-1 / R47-4 copies

## Scope and provenance

Read the attempt-1 source reports `.ufo/waves/round-48/build/ExecA2Reruns.md` and `ExecChecklistBase.md` first, then read the five cited raw receipts. Checked the receipt summaries against their full raw contents; no product or scorecard claim is inferred from the source reports alone.

- R47-1 A2 receipts record runs at `f00cf278a5ab57e87b18418fc972be9f893f65da` using the round-47 A2 probe. The receipt probe digest is `1b438de2113078b2c908ac3abd332478d278a644c95b045119ac3fbf03c0a057`; I independently hashed both the worktree probe and `git show e42eba65:.ufo/waves/round-47/probe/caproute-probe.mjs`, and both matched. The read-only `git diff --stat 269dadb6 f00cf278 -- scripts` produced no output and exit 0, confirming the report's empty scripts diffstat.
- The attempt-1 report cites `corpus/lessons/round-47.md:105-107`; direct reading confirms the quoted 3/5, 3/5, 4/5 readings. It also cites the fixed-counter stability receipts; targeted reads confirm each cited receipt reports AT802 `capped/n=106/106` in all three runs and `set=r47 held=5/5 runs=3 rule=F48`, exit 0.
- R47-4 source report identifies the checklist run commit as frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. Note the source report itself says this differs from plan H1's named base `f00cf278`; these are recorded baseline runs, not an asserted paired H1 comparison.

## Receipt verdicts

| Source receipt | Record rev | Outcome | Load1 / run details |
|---|---|---|---|
| `build/a2-rerun-1.txt` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | `CAPROUTE_PROBE held=3/5 rule=A2`; exit 1 | start 22.06, end 54.49; 11:52:41–11:56:29Z |
| `build/a2-rerun-2.txt` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | `CAPROUTE_PROBE held=3/5 rule=A2`; exit 1 | start 22.06, end 54.97; 11:52:41–11:56:27Z |
| `build/a2-rerun-3.txt` | `f00cf278a5ab57e87b18418fc972be9f893f65da` | `CAPROUTE_PROBE held=4/5 rule=A2`; exit 1 | start 22.06, end 54.49; 11:52:41–11:56:31Z |
| `build/checklist-base-1.txt` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` (per attempt-1 report) | `CHECKLIST: 18/22 pass`; `VERDICT: FAIL`; exit 1 | 11:54:24–11:57:20Z; trailer load1 54.85; per-item load1 44.44–55.76 |
| `build/checklist-base-2.txt` | `fe3d45bf929246915c8c0de5f7f8682b5015b22c` (per attempt-1 report) | `CHECKLIST: 18/22 pass`; `VERDICT: FAIL`; exit 1 | 11:57:49–12:00:59Z; trailer load1 26.89; per-item load1 27.41–59.04 |

The A2 files each contain five SITE lines followed by one aggregate verdict, an exit/load trailer, the command, matching working-tree/committed probe digests, and the scripts-diffstat marker. Their per-site labels agree with the aggregate held counts. Each checklist file contains 22 item lines, `CHECKLIST_SKIPPED: 0`, the 18/22 summary, verdict, and exit/time/load trailer. Both report the same four failing checklist items (685, 686, 687, 697); their raw details include the two `REPORTS_DIR_MISSING` failures, proxy drift, and the gate-mutants timeout. This records the base evidence only; no C1-commit H1 comparison was run for this item.

## Integrity checks and commands

Original receipt SHA-256 values, independently checked:

```text
2aafd27d8440a38c15246fc3dab456da3fbcb2be349833d23f589efa8aa79630  build/a2-rerun-1.txt
e77a919d299bbe58e490331bccf72c40c375220b0fa02e78362c2ef58016f1ba  build/a2-rerun-2.txt
9040c45ec356ebba9a501a62d095e3a9b7234d51c36684d0a5c1449202c63507  build/a2-rerun-3.txt
6ec4a0962fa57ac3db463437a874740f0fabbd2460e97a3c559201e365538d7d  build/checklist-base-1.txt
294d9b1ee3031bdd5b7821d906ad7a5696904438cff3fbc0fb38a8de45f8c924  build/checklist-base-2.txt
```

Commands and observed outcomes (run from the lane root unless an absolute path is shown):

```sh
sha256sum .ufo/waves/round-48/build/a2-rerun-1.txt .ufo/waves/round-48/build/a2-rerun-2.txt .ufo/waves/round-48/build/a2-rerun-3.txt .ufo/waves/round-48/build/checklist-base-1.txt .ufo/waves/round-48/build/checklist-base-2.txt .ufo/waves/round-47/probe/caproute-probe.mjs
# Receipt hashes above; probe: 1b438de2113078b2c908ac3abd332478d278a644c95b045119ac3fbf03c0a057

git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show e42eba65:.ufo/waves/round-47/probe/caproute-probe.mjs | sha256sum
# 1b438de2113078b2c908ac3abd332478d278a644c95b045119ac3fbf03c0a057  -

git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff --stat 269dadb6 f00cf278 -- scripts
# Empty stdout; exit 0.

wc -lc .ufo/waves/round-48/build/a2-rerun-1.txt .ufo/waves/round-48/build/a2-rerun-2.txt .ufo/waves/round-48/build/a2-rerun-3.txt .ufo/waves/round-48/build/checklist-base-1.txt .ufo/waves/round-48/build/checklist-base-2.txt
# 11 lines each for A2; 42 lines each for checklist-base.
```

Commands run from the lane root (the `cp` calls were chained with `&&`; each `cmp -s` returned 0):

```sh
cp .ufo/waves/round-48/build/a2-rerun-1.txt .ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-1.txt
cp .ufo/waves/round-48/build/a2-rerun-2.txt .ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-2.txt
cp .ufo/waves/round-48/build/a2-rerun-3.txt .ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-3.txt
cp .ufo/waves/round-48/build/checklist-base-1.txt .ufo/waves/round-48/r48/ScribeReceipts-checklist-base-1.txt
cp .ufo/waves/round-48/build/checklist-base-2.txt .ufo/waves/round-48/r48/ScribeReceipts-checklist-base-2.txt
cmp -s .ufo/waves/round-48/build/a2-rerun-1.txt .ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-1.txt
cmp -s .ufo/waves/round-48/build/a2-rerun-2.txt .ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-2.txt
cmp -s .ufo/waves/round-48/build/a2-rerun-3.txt .ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-3.txt
cmp -s .ufo/waves/round-48/build/checklist-base-1.txt .ufo/waves/round-48/r48/ScribeReceipts-checklist-base-1.txt
cmp -s .ufo/waves/round-48/build/checklist-base-2.txt .ufo/waves/round-48/r48/ScribeReceipts-checklist-base-2.txt
```

The status lines and comparison confirmations:

```text
cmp a2-rerun-1: identical=yes
cmp a2-rerun-2: identical=yes
cmp a2-rerun-3: identical=yes
cmp checklist-base-1: identical=yes
cmp checklist-base-2: identical=yes
```

## Touched surfaces, gates, limits

Only the following six files were written in the allowed `r48/` directory; the five receipt files are byte-exact copies:

- `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-1.txt`
- `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-2.txt`
- `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-3.txt`
- `.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-1.txt`
- `.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-2.txt`
- `.ufo/waves/round-48/r48/ScribeReceipts.md`

No lane source, `SCORECARD.md`, `corpus/`, `LOG.md`, judge, commit, or push was changed; no tool was installed. No tests/builds or fresh probe/checklist runs were performed. These are inherited attempt-1 measurements only: they do not establish C1 or C2, and the checklist receipts alone do not satisfy the paired H1 comparison.

Artifacts: the five canonical copies above and this report.