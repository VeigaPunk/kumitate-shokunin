# K70ScoutHistory — round-69 fixed-output overwrite: isolated red-before reproduction

VERDICT: incident mechanism fully traced to exact lines; red-before reproduced in isolation for both frozen families (c1 and c2) with byte-proof that the lane's original receipts and scripts were never touched. No production file edited; report only.

## 1. The incident, grounded

- `corpus/lessons/round-69-verifier-spotcheck.md` routed item 3: "Unsafe fixed-output replay design temporarily overwrote two frozen receipts (restored byte-exact from freeze) — disclosed, unpatched after freeze; replay controls should use isolated output paths."
- `corpus/lessons/round-69.md` (Freeze errata): "The frozen control scripts write receipts into fixed lane paths. A seat rerunning the originals temporarily overwrote two frozen receipts. Restore exact committed bytes after its runs settle; use isolated script copies with private W and S for replays."
- `corpus/lessons/round-70.md` (Mistakes → landing): "versioned replay execution must use a unique work directory and refuse an existing output; the counter's existing-output negative arm must demonstrate failure."
- Executing seat identified: `.ufo/waves/round-69/w1/K69ExecControlsRerun.md` lines 6/9 record it running the **originals** (`bash .ufo/waves/round-69/probe/c1-controls.sh donothing`, `.../c2-controls.sh donothing`); its note (line 26): "The original controls scripts wrote their fixed receipt paths; L1 was immediately notified to restore frozen receipt files from freeze commit after both runs settled."
- The two overwritten receipts: `.ufo/waves/round-69/controls/c1-donothing.txt` and `.ufo/waves/round-69/controls/c2-donothing.txt`.
- Why the rerun seat's `TMPDIR=...` override did not protect anything: the clobber is the shell redirection at `> "$W/..."`, and `W` is hardcoded to the lane — `TMPDIR` never influences `W`.

Mechanism, exact frozen lines:

| file | line | bytes |
|---|---|---|
| c1-controls.sh | 20 | `W="$LANE/.ufo/waves/round-69/controls"` |
| c2-controls.sh | 24 | `W="$LANE/.ufo/waves/round-69/controls"` |
| c1-controls.sh | 75 | `TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69" node "$PROBE" "$S/fx" "$REV" > "$W/c1-$MODE.txt" 2>&1 \|\| RC=$?` |
| c2-controls.sh | 106 | same shape, `> "$W/c2-$MODE.txt"` |

The redirection is truncate-on-open with no `set -C`/exclusivity, no refusal, and no post-run digest check: any rerun silently replaces whatever receipt bytes sit at the fixed path. Secondary defects on the same design (source evidence only, not exercised live):

- c1:21–22 / c2:25–26 — `S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/<family>-controls-$MODE"` then `rm -rf "$S"`: with the default scratch root, concurrent same-mode reruns clobber a **shared** namespace.
- c2:80 — `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt`: the known unused hardcoded `/tmp` write (forgecapture arm only; `ls /tmp/forge-sed.txt` → "No such file or directory" on this host today). Forgecapture is network-dependent and was **not** executed — per plan its failure is reported, never waived; line bytes captured via `grep -n 'forge-sed'` (line 80 verbatim above).

## 2. Isolated red-before reproduction (originals never executed)

Method: one-line substitution of the `W=` assignment into scratch copies (never the original paths), `HYAKU_SCRATCH` pointed at the seat scratch so `S` and `TMPDIR` land private, pre-seeded sentinel receipts at the private `W`, then run and compare digests.

Substitution proof — exactly one changed line per copy (`build/c1-substitution.diff`, `build/c2-substitution.diff`):

```
20c20  (c1)   < W="$LANE/.ufo/waves/round-69/controls"   > W="/fast/scratch/hyaku/kumitate-r70/K70ScoutHistory/red/w"
24c24  (c2)   < W="$LANE/.ufo/waves/round-69/controls"   > W="/fast/scratch/hyaku/kumitate-r70/K70ScoutHistory/red/w"
```

Commands and observed outcomes:

1. Sentinel pre-seed (`build/sentinel-before.txt`):
   `88305e4c0096b21e…  red/w/c1-donothing.txt`  `230ee03a753655c8…  red/w/c2-donothing.txt`
2. c2 isolated run: `HYAKU_SCRATCH=$SCRATCH/HYAKU bash c2-controls.isolated.sh donothing`
   → `DEPREC69_UNMET held=8/11 … M5 MISS no-live | M9 MISS readme-map-exit=1 | M11 MISS origin-section-absent`, `CONTROL-PASS donothing`, wrapper **EXIT=0**, wall 37.3s.
   Post digest `9351a7910f0db608…` ≠ sentinel `230ee03a7536…` → **prior receipt bytes silently replaced**.
3. c1 isolated run: `HYAKU_SCRATCH=$SCRATCH/HYAKU bash c1-controls.isolated.sh donothing`
   → `LEDGER69_UNMET held=5/7 exit=1 rev=76069a8e…`, `CONTROL-PASS donothing`, wrapper **EXIT=0**, wall 269s.
   Post digest `b320e0134abd7bf4…` ≠ sentinel `88305e4c0096b21e…` → **prior receipt bytes silently replaced**.
4. Mid-run observation (stronger red): while the c1 probe was still executing, the sentinel measured `e3b0c44298fc1c14…` — the sha256 of **empty** input. Truncation happens at redirection open, before any replacement content exists; a failed or killed replay still destroys the prior receipt.
5. Originals untouched: `diff digests-before.txt digests-after.txt` → empty, printed `LANE-ORIGINALS-UNCHANGED`; all five `controls/*.txt` plus both `probe/c[12]-controls.sh` byte-identical before/after (full digests in `build/digests-after.txt`).

Red semantics: both controls print `CONTROL-PASS` while destroying pre-existing receipt bytes — a rerun is observably "successful" yet violates receipt preservation, with no refusal and no exit signal. That is precisely the round-69 incident mechanism, reproduced without touching lane bytes.

## 3. Mapping to the REPLAY70 counter (frozen `probe/replay70-probe.mjs`, 48 lines)

- R3–R7 require per-run `preserved=true` (digest of every `.ufo/waves/round-69/controls` file unchanged) plus CONTROL-PASS into a **new** private `--out` under a unique `--work`. The reproduction shows `preserved` is the load-bearing arm: without the isolation contract, "CONTROL-PASS" and "receipts preserved" are independent and the latter silently fails.
- R9 (existing `--out` refused, bytes intact) is the green predicate for this exact defect. **At base R9 passes vacuously** — `base/replay70-base.txt` shows `R9 PASS existing output preserved` inside the 2/10 baseline only because the absent tool cannot overwrite anything (its spawn fails). The non-vacuous red evidence for R9 is therefore the round-69 incident plus this reproduction; the base PASS must not be read as "defect absent".
- Freezing note (verified): lane commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` is a git **commit** — "round-70: freeze replay isolation claim and negative baseline" (`git cat-file -t` → `commit`; parent of `1e00955a`). `base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0.

Acceptance details the implementation seat can derive from the counter code (normative): output creation must be exclusive (fresh `--out` per run), refuse with nonzero exit and zero byte change when `--out` exists, unique mkdtemp child under `--work` reclaimed before exit, receipts copied out before cleanup, and refusal on unexpected frozen source bytes (R1 pins `78b98d76…` bytes of both scripts).

## 4. Operability observations for implementation seats

- Measured c1 replay wall time: **269s** — just under the counter's 300 000 ms per-run spawn timeout. c1 donothing+autoledger plus three c2 runs ⇒ expect ~10–15 min total for R3–R7; no outer timeout exists in the counter, but seats timing their own harnesses should budget accordingly.
- Fixture gits created by the copies lived only under the private scratch (`git init` inside `$S/fx`); no lane/fleet git was touched, no commits made.

## 5. Boundaries and artifacts

- Original `c1-controls.sh` / `c2-controls.sh` never executed; only single-line-substituted copies under private W/S with no frozen output path written (digest proof in §2.5).
- Lane/sibling/fleet/operator trees read-only (`cp`, `grep`, `git cat-file`, `git log` reads only). Scratch `/fast/scratch/hyaku/kumitate-r70/K70ScoutHistory/` created explicitly and removed before yield (verified absent); all receipts copied to build first. No background services left; one c1 run briefly backgrounded by the harness and consumed via wait.
- No tool installs (pacman paused; none needed).

Artifacts — `.ufo/waves/round-70/build/K70ScoutHistory/`: `digests-before.txt`, `digests-after.txt`, `sentinel-before.txt`, `sentinel-after.txt`, `c1-substitution.diff`, `c2-substitution.diff`, `red-c1-donothing.after.txt`, `red-c2-donothing.after.txt`, `runs.txt`.

Limits: forgecapture arms not executed (live-network; line-80 `/tmp` write evidenced statically from exact frozen bytes). No census attempted of rerun overwrites in rounds other than 69 — the incident chain here rests on the r69 spotcheck, the r69/r70 lessons, and the executing seat's own report.
