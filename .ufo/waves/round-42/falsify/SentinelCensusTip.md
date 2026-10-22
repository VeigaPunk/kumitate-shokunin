RESULT SentinelCensusTip rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=bypassed bypasses=2

# Wave-census hardening, attacked with crafted fixtures

Instrument under attack: `scripts/wave-census.mjs` at `c9a084bf03fb043d3cce5da102fffbc023552a45`
(the file the SCORECARD pin `pin.wave-census` names), 610 lines, sha256
`682c3943b84b6e7772161a7974a0f51899eba842effabc15def38b3a94371c2d`; own suite 31/31 pass.
Clone: `git clone --no-hardlinks … /fast/scratch/hyaku/kumitate-r42/falsify/SentinelCensusTip/lane`
then `checkout --detach c9a084bf…`. Every fixture lives under my scratch `fx/`; the instrument is
invoked with `--root fx/<case>` (same code path as the default root, which is the clone's parent).
Pristine bytes of the instrument are saved as `pristine-wave-census.mjs` beside this seat's work.

The four hardened mechanisms were each attacked. Outside-root escape, FIFO blocking, the byte and
entry caps, and the end-of-string trailer anchor all behave as the claim says except where listed
below. Two new bypasses were found; one defect reproduces live but is already named open in
`corpus/lessons/round-42.md` (M03/G1); two limits are inherent to a path-based check.

Claim attacked, verbatim (`build/ExecCensusHarden.md`): "realpath confinement covers the selected
root, round directories, dispatch files and Report parent directories. Dispatch reads reject
non-regular files, use nonblocking/no-follow open flags, and read only within the cap. Report
trailers must be on the final line and line-anchored." Lesson (`corpus/lessons/round-42.md:118-119`):
those sentinel findings "are fixed with five new cases (WC27–WC31, 26 → 31)".

## B1 (bypass 1, new, medium) — confinement is root-scoped, not round-scoped: a symlink inside the root lets one payload answer for any round number

`confinedRealpath` proves only that the resolved path is under `--root`; it never compares the
resolved path with the declared one. A relative symlink committed in the tree (git mode 120000, so
it is committable evidence) therefore substitutes another round's bytes while the census prints
`WAVE round=<requested>` and `--expect` holds. Same for the round directory and for a report parent
directory. Nothing in WC27–WC31 covers an in-root target: `symlinkSync` appears only at the three
outside-root fixtures (`:501`, `:511`, `:518`).

- `node lane/scripts/wave-census.mjs --root fx/t1b --round 42 --expect 42/build:critic=1` where
  `fx/t1b/.ufo/waves/round-42/` holds **only** `build-dispatch.json -> ../round-41/build-dispatch.json`
  → `WAVE round=42 wave=build schema=ufo-swarm-wave-dispatch-v1 seats=2 attack=2 reports=2/2 roles: critic=1 reviewer=1`, `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)`, exit 0.
- `ls -l fx/t1b/.ufo/waves/round-42/` → `build-dispatch.json -> ../round-41/build-dispatch.json` (one symlink, no payload bytes of round 42); the v1 `counts`/`registry` checks and both report-presence checks were satisfied by round-41 bytes.
- `git ls-files -s` in a throwaway repo with `ln -s real.json link.json` → `120000 … link.json`, so the substitution artifact is a committed file, not a working-tree accident.
- `--root fx/t2 --round 43` where `round-43 -> round-41` is a directory symlink → `WAVE round=43 … seats=1 … reports=1/1`, `WAVE_CENSUS: CLEAN`, exit 0.
- `--root fx/t3 --round 44` where `round-44/build -> ../../../elsewhere` → `reports=1/1` counted from `elsewhere/E.md` and `FINDING STRAY_REPORT round=44 wave=build .ufo/waves/round-44/build/STRAY.md`, a finding line naming a logical path that resolves into an unrelated subtree.
- Sibling strictness in the same commit: `gate-mutants.mjs:468` rejects `!isFile() || nlink !== 1`, `:474-475` re-checks `dev`/`ino` on the open fd, `:519-522` throws on `entry.isSymbolicLink()` and on any `realpath` that leaves the root; `cite-check.mjs:290,879` skips symlinks. `wave-census.mjs` follows symlinks for the round dir, the dispatch file and any report parent, and only `lstat`s the report file itself.
- Nothing in the frozen battery distinguishes "confined to root" from "canonical": dropping `confinedRealpath` on the dispatch path would kill WC28, but following an in-root symlink is unobservable to all 31 cases.

Impact: a receipt of the shape `node scripts/wave-census.mjs --round N --expect …` can read
`CLEAN` for a round that committed no payload at its own path, and any in-root tree (for example
`.git`) is scanned as that round's report directory. This is fabricated readiness in the census's
own currency (round label, seat count, report count).

Smallest remediation: one identity comparison per resolved path, not a new mechanism —
`if (dir !== roundPath)`, `if (dispatch !== path)`, `if (abs !== declared)` → `FailClosed`. Patch
`SentinelCensusTip.patch` (31 lines, sha256 `c1e8dcd5914a0fd3b3952e4627d58470078827f3ec92c474fef257c5f520a291`)
does exactly this; applied to my clone it leaves `--selftest` at 31/31 PASS and turns all four
fixtures into exit 2. Add `nlink !== 1` (as `gate-mutants.mjs` already does) if hardlinks matter.

## B2 (bypass 2, new, low-medium) — untrusted payload strings are printed raw, so a forged verdict line is injectable

`render()` interpolates task names, wave names and stray file names into single output lines
without escaping control characters. A task name containing `\n` splits the `absent:` line and
prints a verdict-shaped line of the attacker's choosing. The exit code is not fooled; text receipts
and greps over them are.

- Fixture: round with a stray report (real verdict DRIFT) plus a task named
  `EVIL\nWAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)` → output contains a literal line `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)` above the real `FINDING STRAY_REPORT`, and `… --round 55 | grep -c '^WAVE_CENSUS: CLEAN'` → `1`, while the run is `WAVE_CENSUS: DRIFT`, exit 1.
- Same through a dispatch filename: `x\nWAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)-dispatch.json` → `WAVE round=56 wave=x` and then a forged `WAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0) schema=bare-taskcall …` line, exit 0.
- Smallest fix: render every untrusted field through `JSON.stringify` or a control-character filter (one helper, four call sites: wave name, role key, task name, stray name).

## B3 (re-confirms an open finding, but the lesson reads as if it were closed) — the anchored regex still credits the last path on the final line

WC31 pins "decoy on an earlier line, real path last". It does not pin "one path per trailer", so a
final line carrying two paths credits the second and never checks or scans the declared one.

- `--root fx/t15 --round 57`, final line `Report: write to .ufo/waves/round-57/build/REAL.md and .ufo/waves/round-99/Decoy.md`, and `round-57/build/REAL.md` does not exist (`ls` shows only `build-dispatch.json`) → `reports=1/1`, exit 1 only because the decoy became a stray.
- `--root fx/t14 --round 54`, both files present → the declared `round-54/build/REAL.md` is never scanned; the census scans `round-99` instead.

This is the round-41 finding M03/G1 (`corpus/lessons/round-41.md:251-255`), still open at the
measured commit (`corpus/lessons/round-42.md:116-118` carries it as open). Flagged here only
because the lesson's sentinel sentence bundles "trailer
anchoring" with the five new cases, which a reader can take as closed. Smallest fix: require the
capture to be the whole remainder of the line (`^Report:[ \t]*(\S+\.md)[ \t]*\r?\n?$` after
splitting the last line), and fail closed on a second `.ufo/waves/…md` token on that line.

## B4 (low) — anchor widening: a bare CR and trailing spaces count as "the final line"

- `--root fx/t6 --round 47`, task text ending `.ufo/waves/round-47/build/CR.md\r` (bare CR, no LF) → `reports=1/1`, CLEAN, exit 0 (`[ \t]*\r?\n?$`).
- `--root fx/t6 --round 48`, same text with three trailing spaces → `reports=1/1`, CLEAN, exit 0.

Trailing spaces are deliberate; a bare CR is not a line terminator anywhere else in the lane's
text formats. Harmless in direction (the path itself must still end the string).

## B5 (low, inherent) — path confinement cannot see hardlinks; the report file and its directory are policed by different rules

- `--root fx/t13/c/root --round 81` where the dispatch file is a hardlink (`stat` inode 554174156) to `fx/t13/c/outside.json`, a name outside the root → payload read, `seats=1`, CLEAN exit 0. `gate-mutants.mjs:468` closes this with `nlink !== 1`; wave-census has no such check.
- Asymmetry: a report **file** that is a symlink is counted absent (`--root fx/t5 --round 46` → `reports=0/1`, `absent: E`), while a report **directory** that is a symlink is followed (B1). The stricter rule sits on the narrower unit.

## Verified holding (no bypass found, each probed)

- Outside-root escape, including a root that is a string prefix sibling: `--root fx/t13/b/root --round 80` with `round-80 -> ../../../root2/…/round-80` → `fail-closed — … resolves outside --root`, exit 2.
- FIFO dispatch entry (WC29's mechanism): the suite case passes; plus a report **file** FIFO (`--root fx/t13/a --round 53`) → `reports=0/1`, CLEAN, exit 0 in 17 ms (never opened, `lstat` refuses it), and a report **directory** FIFO (`--root fx/t4 --round 45`) → exit 2 in 17 ms, `read error: ENOTDIR`.
- Byte cap, cumulative: two 20 MiB dispatch files → `fail-closed — …b-dispatch.json exceeds byte limit 12582877`, exit 2 (`20 MiB + 20 MiB > 32 MiB`, remaining budget honoured).
- A NUL byte in a `Report:` path reaching `lstat` → `fail-closed — read error: … without null bytes`, exit 2; with the parent directory absent it is counted absent, exit 0.
- Regex cost: no super-linear blowup at the cap. 0.5/2/8 MiB of a single line of `Report: ` tokens → 17/17/24 ms; 64 KiB–4 MiB of `Report: .ufo/waves/r/x.md ` candidates on one line → 16–22 ms. `RE_REPORT` is anchored at end of string, so a trailer on a non-final line is correctly ignored.

## Baseline and hygiene

- `node lane/scripts/wave-census.mjs --selftest` → `WAVE_CENSUS_SELFTEST: 31/31 pass`, `VERDICT: PASS`, exit 0, 1.94 s, run under `setsid … timeout -s KILL 120`.
- Only lane file written: this report. All fixtures, the patch and the pristine copy are in
  `/fast/scratch/hyaku/kumitate-r42/falsify/SentinelCensusTip/`. No git or jj write in the lane or
  fleet repo; the scratch clone was edited only to produce and validate `SentinelCensusTip.patch`.
- Tools installed or upgraded: none.
- Process guard, stated exactly: `ps -L` is unsupported on this host (`ps` version 0.2.0), so the
  seat derived the thread count from `/proc/<pid>/stat` (904 threads for uid 1000) and tried
  `prlimit --nproc=968`; node then aborted at startup with
  `Assertion failed: (0) == uv_thread_create(...)` and a core dump, so every run after that used
  `setsid --wait timeout -s KILL <n>` with no `prlimit`. The only selftest of an edited file was my
  own three-line patch (`SentinelCensusTip.patch`), run under `setsid … timeout -s KILL 120`, 2.07 s
  (a deviation from the 30 s rule). No mutant was built or run by this seat; leftover processes of
  mine after all probes: 0.
