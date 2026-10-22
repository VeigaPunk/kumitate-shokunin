RESULT SentinelCensusPaths rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=unsafe escapes=3

# SentinelCensusPaths — path handling in scripts/wave-census.mjs @ fae386aa

Scope: `--root`, round directory, dispatch file names, `Report:` paths (the `..`
guard), symlinked report and parent directories escaping the root, very large
dispatch files, and the selftest's temp directory and child processes.
Clone: /fast/scratch/hyaku/kumitate-r41a2/seats/SentinelCensusPaths/lane @ fae386aa
(`--selftest` → `WAVE_CENSUS_SELFTEST: 23/23 pass`, `VERDICT: PASS`).
All fixtures under /fast/scratch/hyaku/kumitate-r41a2/seats/SentinelCensusPaths/repro/;
lane tree untouched except this file. Attempt-1 ReviewCensusCode covered `..`
escapes at 4e58bb0e; its M4/M5 are fixed here (WC21–WC23, 3/3 revert-killed). The
symlink and resource surface below is post-fix and not covered there.

## Findings

- **F1 — three reachable escapes outside `--root` (no realpath confinement anywhere).**
  The census reads the working tree, never `git show` (contrast anchor-truth.mjs:54),
  so anything a writer can place in `.ufo/` — symlink, fifo, huge file — is read.
  (a) **Symlinked report dir**: `lstatSync(join(root, rel))` (:117) resolves
  intermediate symlinks, so a file outside the root counts as a present report;
  `existsSync` (:140, stat semantics) + `readdirSync` (:141) on a symlinked report
  dir enumerates the target's `.md` names as `STRAY_REPORT`. A repo committer can
  place the symlink, so the census — round 41's "report present" oracle — can
  attest `reports=N/N` for files outside the lane and can leak the `.md` names of
  any host directory. (b) **Symlinked dispatch file**: the wave list
  (:91, `-dispatch.json$` filter on names only) plus `readFileSync(join(dir,f))`
  (:98) follows a committed symlink and parses a payload outside `--root`.
  (c) **Symlinked round dir, `.ufo`, or `.ufo/waves`**: `statSync(dir)` (:89)
  follows the link; a whole round reads from outside `--root` with no finding.
  Final-component report symlinks are safe: `lstatSync` counts them absent.
- **F2 — dispatch file that is a FIFO blocks forever.** `readFileSync` (:98) has
  no timeout and no `isFile` check on the dispatch itself; `mkfifo x-dispatch.json`
  hangs the census (killed by `timeout 5`, exit 124). A fifo cannot be committed,
  but any writer of the working tree can place one.
- **F3 — no size or count caps (resource exhaustion).** `readFileSync` +
  `JSON.parse` of a 256 MB dispatch file peaks at ~799 MB RSS (≈3× file size);
  64 MB → 210 MB. `tasks` is unbounded (per-task `lstatSync`). STRAY_REPORT
  findings are unbounded: 20,000 `.md` files in one report dir → 20,000 findings
  and 1.6 MB of stdout. Sibling anchor-truth.mjs caps JSON reads at 32 MB
  (`readCapped`, :104-106, :579-582); wave-census has none.
- **F4 — `Report:` regex is not trailer-anchored (latent, reachable).** RE_REPORT
  (:59) takes the first `.ufo/waves/*.md` after the first `Report:` word. A task
  whose body mentions `Report: <path>` before the real trailer is read against the
  wrong path → false `absent` (reproduced). The shape exists in real payloads: 15
  tasks in rounds 38–40 mention another `.ufo/waves/*.md` before their trailer
  (e.g. `ExecTokenKept` names round-39 paths), and `ScoutDeadSeat` and
  `ReRecountC2` each carry two `Report:` words; today the earlier `Report:` lines
  carry no path, so the right path is taken by data accident.
- **F5 — output injection via task name.** `absentNames` are joined verbatim into
  the `  absent:` line; a `name` containing `\n` forges `WAVE_CENSUS: CLEAN` and
  fake `absent:` lines in text output (reproduced). `--json` consumers see the raw
  name as a string (no injection, still unsanitized).
- **F6 — `--round` aliasing.** `Number('007') === 7`; `--round 7 --round 007`
  double-counts the round (`rounds=2 waves=2`, every WAVE line duplicated).
- **F7 — `..` guard is separator-specific (POSIX-only).** `:106` splits on `/`;
  a Windows-form `build\..\..\out\x.md` is not rejected. Inert on this host
  (POSIX treats `\` as a filename byte → absent), but `path.win32.join`
  normalizes it outside the round → `C:\root\.ufo\waves\out\outside.md`.
- **F8 — selftest `run()` (:**215) uses `spawnSync` defaults: no `maxBuffer`, so a
  census output over ~1 MB throws `ENOBUFS` inside a `check` (R3 produces 1.6 MB
  legitimately). Children are argv-array, no shell (metacharacters in `--root`
  stay literal), bounded at 60 s; `mkdtempSync` is mode 0700 under `tmpdir()`;
  `rmSync(tmp, {recursive, force})` does not follow a symlink out of the temp dir
  (verified: victim dir survives). No leaked child processes.

## Smallest remediations (all reuse existing repo patterns)

- Confine every fs sink to `realpathSync(root)`: round dir, each `*-dispatch.json`,
  each report path, each report dir — the `realpathSync(p).startsWith(realpathSync(self)+sep)`
  shape already exists at anchor-truth.mjs:586.
- Reject non-regular dispatch files (`statSync(f).isFile()` after confinement) and
  cap dispatch bytes before `readFileSync` (anchor-truth `readCapped`, :579).
- Take the last `RE_REPORT` match, or anchor `Report:` to line start — trailer
  semantics per the producer contract.
- Print task names via `JSON.stringify` (or strip `\n`) in the `absent:` line.
- `opts.rounds = [...new Set(opts.rounds)]` after `Number()`.
- Add `maxBuffer` (e.g. 8 MB) to the selftest's `run()`.

## Evidence (commands and outputs; each run in the scratch clone at fae386aa)

`T1` symlinked report dir: `$R/.ufo/waves/round-15/build -> $OUT/evil` (target holds
Present.md + Extra.md; no regular file inside the root). `node scripts/wave-census.mjs --root $R --round 15` →
`reports=1/1` (outside file counted present) + `FINDING STRAY_REPORT … build/Extra.md` (outside name leaked), exit 1.

`sysdir` same against a system dir: `round-33/build -> /usr/share/doc/audit` →
`reports=2/2` (README.md, SECURITY.md counted present) + 2 `STRAY_REPORT` findings naming system files, exit 1.

`T2` `build-dispatch.json -> $OUT/evil-dispatch.json` → census prints `seats=1` from the outside file, exit 0; `readlink` confirms the read came from outside `--root`.

`T3` `round-17 -> $OUT/round17` → `seats=2` read from outside `--root`, exit 0. Same for `.ufo` and `.ufo/waves` symlinks (round-51 fixtures): `seats=1`, exit 0.

`T4` `round-18/build/A.md -> /etc/hostname` (final component) → `absent: A`, `reports=0/1` — lstat correctly refuses.

`T5` `Report: .ufo/waves/round-19/build/../../../../out/outside.md` → `absent: U` (guard holds);
`build\..\..\out\outside.md` → `absent: V` on POSIX; `path.win32.join` shows `C:\root\.ufo\waves\out\outside.md`.

`T6` task text `Example line: Report: .ufo/waves/round-99/example.md\nYour trailer is: Report: .ufo/waves/round-20/build/X.md` →
`absent: X` while `round-20/build/X.md` exists — the first path after the first `Report:` wins.

`R1` `mkfifo round-30/build-dispatch.json`; `timeout 5 node … --round 30` → `exit=124` (blocked).

`R2` peak child RSS by dispatch size: 64 MB file → 209,668 kB; 256 MB → 799,476 kB (≈3×).

`R3` 20,000 stray `.md` files → `exit=1 stdout_bytes=1609086 findings=20000`.

`R4` symlink `$tmp/link-to-outside -> victim`; `rmSync(tmp,{recursive,force})` → `victim dir still there: true`.

`inject` task name `X\nWAVE_CENSUS: CLEAN (rounds=1 waves=1 findings=0)\n  absent: GHOST` → the forged verdict and absent lines appear verbatim in stdout.

`T7` `--round 7 --round 007` → `WAVE_CENSUS: CLEAN (rounds=2 waves=2 findings=0)` with every WAVE line duplicated.

`--root` pointing at a regular file → `exit=2`; `--root` with `; touch PWNED` → `exit=2`, no file created (no shell).

`dir named x-dispatch.json` → `exit=2` (`does not parse: EISDIR`).

`node scripts/wave-census.mjs --selftest` at fae386aa → `WAVE_CENSUS_SELFTEST: 23/23 pass`, `VERDICT: PASS`.

Tools: node v24.21.0 (present), python3 + resource (rusage, present), GNU timeout — no installs needed or made.
