# ScoutCorrections — R49-3 / R49-4 (R49-5 sentences located)

Verdict: `CORRECTIONS_LOCATED` at lane freeze `8237be86e2dc04e90e51b66b62bdffe770196d27`. R49-3 confirmed (LOG says two; the lesson mines four). R49-4 confirmed (filed report says `18:52Z/18:59Z/19:00Z`; the canonical `ReRunCounter48-1` receipt trailer starts `2026-10-23T16:01:13-03:00` = `19:01:13Z`). R49-5 located, not decomposed: six committed sentences say delta 0; the cited receipt reads `leak-delta-at-ce9aee5d=13`.

Sandbox: `/fast/scratch/hyaku/kumitate-r49/seats/ScoutCorrections/lane`, detached at the freeze, `git status --porcelain=v1` empty (exit 0). Quotes below are `git show 8237be86e2dc04e90e51b66b62bdffe770196d27:<path>` unless named as the fleet report. No tool installed.

## Commands (exit 0 unless noted)

```
git -C /fast/scratch/hyaku/kumitate-r49/seats/ScoutCorrections/lane rev-parse HEAD
→ 8237be86e2dc04e90e51b66b62bdffe770196d27

git -C …/lane status --porcelain=v1
→ (empty)

git -C …/lane grep -n -F 'two mistakes' 8237be86e2dc04e90e51b66b62bdffe770196d27 -- LOG.md corpus/lessons/round-48.md
→ LOG.md:1932 only

git -C …/lane show 8237be86…:.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt | tail -n 1
→ exit=0 start=2026-10-23T16:01:13-03:00 end=2026-10-23T16:03:30-03:00 load1_start=28.16 load1_end=45.92

git -C …/lane show 8237be86…:.ufo/waves/round-48/close/ReRunCounter48-1.md | tail -n 2
→ exit=0 start=2026-10-23T15:59:23.442168-03:00 end=2026-10-23T16:00:35.054492-03:00 load1_start=23.52 load1_end=27.18

git -C …/lane show 8237be86…:.ufo/waves/round-48/r48/L1-score-ce9aee5d.txt
→ date_utc_start=2026-10-23T18:52:59Z
→ exit=0 end=2026-10-23T18:53:56Z load1_end=26.13

git -C …/lane show 8237be86…:.ufo/waves/round-48/close/ReRunCounter48-2-receipt.txt | tail -n 1
→ exit=0 start=2026-10-23T19:00:46Z end=2026-10-23T19:02:42Z load1_start=27.90 load1_end=47.21 counter_sha256=3ed305f28d69da6e88654579f285ad3ea1857d469134a63221009b1657f93f59

git -C …/lane show 8237be86…:.ufo/waves/round-48/r48/L1-leakfix-delta.txt | od -An -tx1
→ 6c 65 61 6b 2d 64 65 6c 74 61 2d 61 74 2d 63 65 39 61 65 65 35 64 3d 31 33 0a
  (ASCII `leak-delta-at-ce9aee5d=13` plus newline, 26 bytes)

python3 -c '…fromisoformat("2026-10-23T16:01:13-03:00")…'
→ 2026-10-23T19:01:13Z
python3 -c '…fromisoformat("2026-10-23T15:59:23.442168-03:00")…'
→ 2026-10-23T18:59:23.442168Z

git -C /home/vgpnk/Projects/shokunin rev-parse 08c3202b20fc18eb568f33073b64f6bed142e4f1
→ 08c3202b20fc18eb568f33073b64f6bed142e4f1
git -C /home/vgpnk/Projects/shokunin log -1 --format='%H %an %s' -- .ufo/reports/round-48/kumitate.md
→ 08c3202b20fc18eb568f33073b64f6bed142e4f1 kumitate-shokunin round-48: kumitate report (…)
```

Working-tree fleet file `.ufo/reports/round-48/kumitate.md` sha256 `7ba56d8c46500574da1cc346e49354031b56d70c5a9fa1d26fb72cd3138f231f` equals `git show 08c3202b:.ufo/reports/round-48/kumitate.md`. Lane spot-check cites that report at `corpus/lessons/round-48-verifier-spotcheck.md:6`.

## (a) R49-3 — "two mistakes" vs four

The round-48 LOG bullet opens at `LOG.md:1927` (`- 2026-10-23 — round 48 attempt 2 …`) and continues through `:1932`. The words are on the continuation line, not a second bullet. Exact bytes of `LOG.md:1932` (617 chars):

```
  Frontier: S098 opened + mined (strace 7.2 manual; `r48/ReopenS098.md` HOLDS; used-by the probe — the A48 header cites it — and `corpus/lessons/round-48.md`); re-opens S084/S091/S092 landed (HOLDS, `r48/ReviewReopens48.md`); S088 ruling `r48/ReconcileS088.md`. Lesson `corpus/lessons/round-48.md` (two mistakes + A48 record + residues). Terms: A 25 → 38, C 22, C2 106 → 108/108; proxy re-pins (round-gate, surface-probe, cap-spawn, new counter-rerun). Not claimed: RG1409/SP1766 nested `--selftest`, SP1049 checklist runner, cite-check/gate-mutants/proxy-check/wave-census launches; bind-view fidelity (named limit).
```

`corpus/lessons/round-48.md` section heading and the four class lines (the `**class:**` sentence is the heading of each item; evidence tails omitted here, full items are those lines):

- `:5` `## Mistakes`
- `:7` `1. **class:** A trace counter can silently omit child executions when it assumes fixed spacing in the PID prefix or the syscall-return column, then report a routed site from an incomplete trace.`
- `:8` `2. **class:** A close conclusion can rest on cancelled-seat chat readings, or state an aggregate contradicted by its cited receipts.`
- `:9` `3. **class:** A frozen counter whose suite-summary clause trusts the gate's own report reads a forged self-consistent summary as ROUTED_HELD.`
- `:10` `4. **class:** An instrument author's own amendment can silently never reach the measured object.`

No fifth numbered mistake under that heading. `corpus/README.md:143` maps the same file as `mistakes 1-4` (corroboration, not a fifth class).

## (b) R49-4 — report stamps vs the committed receipt

Filed report sentence, fleet `08c3202b:.ufo/reports/round-48/kumitate.md:20` (423 chars, the whole row):

```
| C1 | `node .ufo/waves/48/probe/caproute48-probe.mjs <lane> <rev> --set r48` | `held=0/4` at `f00cf278` ×3 (freeze receipts) and at the freeze (`r48/A48-stab-r48-fe3d45bf.txt`) | `held=4/4 runs=3 rule=F48+A48` exit 0 at `ce9aee5d`: L1 score (`r48/L1-score-ce9aee5d.txt`) + committed re-runs `close/ReRunCounter48-{1,2}-receipt.txt` (ReRunCounterA/B) — all three time-spaced (18:52Z/18:59Z/19:00Z), zero exit-1/2 readings |
```

That string `18:52Z/18:59Z/19:00Z` occurs in the lane freeze only as a quotation inside `corpus/lessons/round-48-verifier-spotcheck.md:74` and `.ufo/waves/round-49/plan.md:20`. It is not in `LOG.md`.

`ReRunCounter48-1.md` does not carry the canonical start. `close/ReRunCounter48-1.md:36` quotes the superseded trailer:

```
exit=0 start=2026-10-23T15:59:23.442168-03:00 end=2026-10-23T16:00:35.054492-03:00 load1_start=23.52 load1_end=27.18
```

That is `18:59:23.442168Z`. The same bytes are the parked original at `close/ReRunCounterA-original-receipt-run1.txt:2` and `:22`, whose header says the canonical path was replaced by the `16:01:13–16:03:30` run. `close/ReRunCounterA.md:16` quotes the same superseded trailer while `:17` points at `ReRunCounter48-1-receipt.txt`.

The committed canonical receipt, the file the plan calls `ReRunCounter48-1`, is `close/ReRunCounter48-1-receipt.txt:18`:

```
exit=0 start=2026-10-23T16:01:13-03:00 end=2026-10-23T16:03:30-03:00 load1_start=28.16 load1_end=45.92
```

`16:01:13-03:00` is `19:01:13Z`. The plan's "receipt starts 19:01:13Z" matches this trailer and does not match the trailer block inside `ReRunCounter48-1.md`.

Canonical starts of the three scored runs (receipt files, not the prose that cites them):

| run | path:line | start |
|---|---|---|
| L1 score | `.ufo/waves/round-48/r48/L1-score-ce9aee5d.txt:2` | `2026-10-23T18:52:59Z` |
| ReRunCounter48-2 | `.ufo/waves/round-48/close/ReRunCounter48-2-receipt.txt:14` | `2026-10-23T19:00:46Z` |
| ReRunCounter48-1 | `.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt:18` | `2026-10-23T16:01:13-03:00` (`19:01:13Z`) |

`18:52Z` and `19:00Z` are minute truncations of the L1 and re-run-2 stamps. `18:59Z` is not a truncation of the canonical re-run-1 stamp. [INFERENCE] it was taken from the superseded `15:59:23-03` trailer (or from `close/ReRunCounter48-2-receipt.md:30`, which says `This run: start 2026-10-23T18:59:23Z (15:59:23 -03)` while that run's receipt txt starts `19:00:46Z`, and from `:32`, which attributes `15:59:23.442168 -03` to `ReRunCounter48-1-receipt.txt`). Which of those prose files the report author copied is not in the commit.

Observed on the same report row, not a routed repair: the counter path is `` `.ufo/waves/48/probe/` ``, not `round-48`.

## (c) R49-5 — every committed "delta 0" about the cap-spawn leak

Receipt that reads 13, `.ufo/waves/round-48/r48/L1-leakfix-delta.txt:1`:

```
leak-delta-at-ce9aee5d=13
```

Sentences that say delta 0 and are about this leak (unrelated `delta 0` / `every delta 0` hits in rounds 36–45 and `corpus/knowledge/agent-isolation-substrates.md` are jj-snapshot counters, not this leak):

1. `LOG.md:1931` — `Measured en route: the cap-spawn verdict-dir leak fix (12,801 accumulated dirs at open; quiet-host differential delta 0 after, `r48/L1-leakfix-delta.txt`);`
2. `SCORECARD.md:1757` — `plus its verdict-dir leak fix — 12,801 accumulated `/tmp/cap-spawn.*` dirs measured at open, delta 0 after the fix`
3. `SCORECARD.md:1759` — `Measured along the way: the cap-spawn verdict-dir leak fix (delta 0, `r48/L1-leakfix-delta.txt` on a quiet host)`
4. `corpus/lessons/round-48.md:51` — `cap-spawn leak fix delta 0 on a quiet host (`r48/L1-leakfix-delta.txt`).`
5. Fleet `08c3202b:.ufo/reports/round-48/kumitate.md:10` — `the cap-spawn verdict-dir leak fix (12,801 accumulated `/tmp/cap-spawn.*` dirs at open, quiet-host delta 0 after, `r48/L1-leakfix-delta.txt`)`
6. Fleet `08c3202b:.ufo/reports/round-48/kumitate.md:32` — `the measured cap-spawn tmpfs leak fixed (delta 0)`

`corpus/lessons/round-48-verifier-spotcheck.md:75` and `.ufo/waves/round-49/plan.md:22-23` name the contradiction; they do not themselves claim the delta was 0.

The one-line receipt does not say what the 13 directories were. Do not append "concurrent host activity" from this seat.

## Correction to append (LOG.md bullet; do not rewrite the round-48 entry or the filed report)

```
- 2026-10-23 — round 49 correction for the round-48 LOG entry (R49-3, R49-4; R49-5 wording only). That entry stays as it now reads; this entry is append-only. The filed report `.ufo/reports/round-48/kumitate.md` (fleet `08c3202b`) is not rewritten.
  R49-3: the round-48 entry says the lesson is "two mistakes" (`LOG.md:1932`). `corpus/lessons/round-48.md` `## Mistakes` (`:5`) mines four (`:7-10`): (1) a trace counter can silently omit child executions when it assumes fixed spacing in the PID prefix or the syscall-return column, then report a routed site from an incomplete trace; (2) a close conclusion can rest on cancelled-seat chat readings, or state an aggregate contradicted by its cited receipts; (3) a frozen counter whose suite-summary clause trusts the gate's own report reads a forged self-consistent summary as ROUTED_HELD; (4) an instrument author's own amendment can silently never reach the measured object.
  R49-4: the filed report says the committed re-runs are time-spaced "18:52Z/18:59Z/19:00Z" (`kumitate.md:20`). The committed canonical receipt `.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt:18` starts `2026-10-23T16:01:13-03:00` (19:01:13Z), not 18:59Z. `.ufo/waves/round-48/close/ReRunCounter48-1.md:36` still quotes the superseded trailer `2026-10-23T15:59:23.442168-03:00` (18:59:23Z), parked at `close/ReRunCounterA-original-receipt-run1.txt`. Canonical starts: L1 `2026-10-23T18:52:59Z` (`r48/L1-score-ce9aee5d.txt:2`), re-run 2 `2026-10-23T19:00:46Z` (`close/ReRunCounter48-2-receipt.txt:14`), re-run 1 `19:01:13Z`. The minute triple is wrong on the middle stamp; the three runs stay time-spaced.
  R49-5 wording, decomposition not claimed here: do not say quiet-host delta 0. The cited receipt `.ufo/waves/round-48/r48/L1-leakfix-delta.txt:1` reads `leak-delta-at-ce9aee5d=13`. The sentences that say delta 0 are `LOG.md:1931`, `SCORECARD.md:1757`, `SCORECARD.md:1759`, `corpus/lessons/round-48.md:51`, and fleet `kumitate.md:10` and `:32`.
```

## Confidence and unknowns

- High: every path:line quote above, the `19:01:13Z` conversion, and the count of delta-0 leak sentences (lane tree walk of `*.md`/`*.txt` at the freeze plus the fleet report blob).
- [INFERENCE] only: which stale prose file supplied the report's `18:59Z`. Both the superseded trailer and `ReRunCounter48-2-receipt.md:30` match that minute.
- Unresolved: what the 13 directories in `L1-leakfix-delta.txt` were. Not measured here.
- Not read: the lane working tree (it was dirty at first contact). This report uses the freeze commit only.

Report: .ufo/waves/round-49/r49/ScoutCorrections.md
