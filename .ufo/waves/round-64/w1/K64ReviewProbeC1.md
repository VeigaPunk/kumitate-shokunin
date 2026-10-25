VERDICT: receipt64-probe.mjs is structurally unable to ever print RECEIPT64_HELD (P2's >=8-id floor vs a 6-id corpus), and if the corpus were fixed the counter is fully gameable by an echo-the-expect tool; it also runs the measured tree through an injectable bash string and follows committed symlinks out of the commit.

## Evidence
All runs against the unmodified frozen probe; transcripts verbatim in build/K64ReviewProbeC1/run-transcript.txt.

- `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef --report dummy.md`
  → `RECEIPT64_UNMET held=3/5 ... | P2 MISS ids=6 | P5 MISS ...` exit 1 (real tool, real corpus).
- `cat controls/receipt/*/expect` line-2 census → 6 distinct non-CLEAN ids: HASH_DEAD, PLACEHOLDER,
  RECEIPT_MISSING, SECTION_MISSING, SHONEN_COUNT, TALLY_UNRECEIPTED. `seen` fills only from non-CLEAN
  passing cases → `seen.size` can never reach 8.
- Fixture A (cheat-tool.mjs echoes `dirname(--report)/expect`; zero diffing) + verbatim corpus:
  `RECEIPT64_UNMET held=4/5 | P2 MISS ids=6` — all 16 cases echoed correctly.
- Fixture B (same cheat, corpus + 2 cases → 8 ids): `RECEIPT64_HELD held=5/5` exit 0.
- Fixture C (lane dir literally named `$(touch .../PWNED)`, containing a repo): probe runs → PWNED created.
- Fixture D (committed `scripts/report-receipt-diff.mjs` = symlink → mutable host file): probe executed
  host code modified after the commit; P1 "PASS" printed by outside bytes.
- `GIT_DIR=fixtureA/.git node probe.mjs <lane> 5e03e4fb...` → `rev=5e03e4fb` resolved although that object
  exists only in fixtureA; `git -C` did not protect repo resolution.
- `node make-receipt-controls.mjs victim/` deleted `victim/keep-me.txt` and wrote 16 cases over it.
- Deleted blob in fixtureE: `git archive` fails (status 141) but rev-parse passes → probe prints
  `held=0/5 tool-absent` for a commit that DOES contain the tool.
- Case dir with `expect/` as a directory → unhandled EISDIR, 0 bytes stdout, exit 1 (same as UNMET).
- ids() demo: `X9_LABEL`, `ROUND64_X` dropped (regex `[A-Z_]+` excludes digits).

## Findings
- **K64ReviewProbeC1-1 CRITICAL** — P2's `seen.size >= 8` is unreachable: committed corpus exercises 6 ids
  and contract v1 (scripts/report-receipt-diff.mjs:18-19) defines only 7 (adds HASH_ORPHAN). No tool
  implementing the declared contract can ever score HELD; the counter silently decides C1=UNMET forever.
  Repro: section 0 (`P2 MISS ids=6` with the real tool). Fix per ratchet (strengthen, never relax): add a
  HASH_ORPHAN case AND one new finding class + case to the tool/corpus (see writer patch); or synthesize
  a nonce expect per P2 run. Never lower the floor.
- **K64ReviewProbeC1-2 CRITICAL** — counter is gameable: p2() passes `--report <case>/report.md` while
  `expect` sits in the same dir, so the answer key is one `dirname()` away; P3/P1/P5 expectations are frozen
  constants. A 30-line echo tool scores `RECEIPT64_HELD held=5/5` (transcript §3, cheat in build/).
  Fix: load expect files into memory then delete them from the extracted tree before invoking the tool;
  generate fresh nonce cases per run so no precomputed output suffices.
- **K64ReviewProbeC1-3 HIGH** — shell injection at probe:43 `bash -c "... -C \"${lane}\" ..."`: `$(...)`,
  backticks, `${...}` inside the lane path expand. Repro: PWNED file created (§4). Fix: drop bash entirely —
  `spawnSync('git',[...])` bytes piped to `spawnSync('tar',['-x','-C',TR],{input})`.
- **K64ReviewProbeC1-4 HIGH** — committed-symlink escape: tar extracts `scripts/report-receipt-diff.mjs`
  as a symlink to ANY host path; the probe then execs it (P1) — the "committed bytes only, worktree never
  read" invariant (probe:11) is false. Repro §5: P1 PASS printed by a file edited post-commit. Fix:
  `lstatSync(tool).isSymbolicLink()` → fail-closed `tool-not-regular`.
- **K64ReviewProbeC1-5 MEDIUM** — git-archive result never checked (spawnSync status discarded, pipe
  masks git's exit). Repro §8: corrupt repo → `held=0/5 tool-absent` misdiagnosis instead of exit-2
  rev/archive-unreadable. Fix: check `arc.status`/empty stdout, emit `archive-failed`.
- **K64ReviewProbeC1-6 MEDIUM** — whole child env inherited: `GIT_DIR` overrides `git -C` (§6 — rev and
  archive read from the wrong repo); `PATH` picks any git/node/tar; `NODE_OPTIONS=--require` injects code
  into the tool's node; tool run via `'node'` not `process.execPath`. Fix: env whitelist + execPath.
- **K64ReviewProbeC1-7 MEDIUM** — no `timeout` on any spawnSync: a hanging tool hangs the counter forever
  (no verdict, no exit). Fix: timeout on git/run; status null → MISS.
- **K64ReviewProbeC1-8 MEDIUM** — `make-receipt-controls.mjs:9` `rmSync(out)` deletes any directory given
  as argv[2] before writing (repro §7). Fix: refuse non-marked dirs (patch in build/); also the writer
  never enforces the >=8-id invariant it exists to satisfy (writes 6).
- **K64ReviewProbeC1-9 LOW** — probe scratch lives inside the measured tree: writes `r60.md`,`r63.md`,
  `stub-clean.mjs`,`stub-drift.mjs` at T root, silently overwriting committed files with those names and
  mixing counter data with measured bytes (§assignment's same-temp-dir point). Fix: separate scratch/tmpdir.
- **K64ReviewProbeC1-10 LOW** — exit-code mapping: probe exceptions die on `readFileSync`/`readdirSync`
  with no verdict line and exit 1, indistinguishable from UNMET (§9); header says "Exit 2 only when the
  measured revision cannot be read" yet usage exits 64. Fix: try/catch → `probe-error` exit 3.
- **K64ReviewProbeC1-11 LOW** — host-determinism: P3 fleet commits are abbreviated shas + hardcoded
  `/home/vgpnk/Projects/shokunin`; after a fleet gc or on another host P3 = `fleet-blob-unreadable` MISS,
  so C1's verdict depends on fleet reachability, not on M. Fix: full 40-hex ids, document fleet as a
  declared external input.
- **K64ReviewProbeC1-12 LOW** — ids() `[A-Z_]+` drops ids containing digits (§10): a tool emitting extra
  invented ids like `X9_LABEL` still matches a case whose expect lacks them. `c0-honest` name and
  `expect` line-1/line-2 format are hardcoded couplings; case dirs without `expect` are silently skipped.
- **K64ReviewProbeC1-13 LOW** — P4 proves only that two trivial stubs fail; it cannot detect the adaptive
  cheat of finding -2 (echo legitimately needs no diffing). Keep P4, but it is not evidence the counter
  resists forgers — the ratchet and hidden cases are.
- **K64ReviewProbeC1-14 LOW** — temp dir leaks on exception or SIGINT (mkdtemp before guarded section,
  rmSync only at :106); leaks include tool copies.

## Artifacts
- `.ufo/waves/round-64/build/K64ReviewProbeC1/cheat-tool.mjs` — 5/5-HELD echo tool (fixture B corpus).
- `.ufo/waves/round-64/build/K64ReviewProbeC1/run-transcript.txt` — verbatim commands + outputs.
- `.ufo/waves/round-64/build/K64ReviewProbeC1/probe-fixes.patch.txt` — minimal diffs for findings 2-6,9,10.
- `.ufo/waves/round-64/build/K64ReviewProbeC1/writer-fixes.patch.txt` — rmSync guard + corpus/id-floor repair.
- `/tmp/kumitate-r64/K64ReviewProbeC1/fixture{A,B,C,D,E,F}` — repro repos.

## Limits
Did not diff jj64-probe.mjs (out of scope); did not test bsdtar vs GNU tar, non-UTF8 filenames,
`export-subst`/`export-ignore` gitattributes (none committed — noted as latent hole: a future commit adding
them silently alters or drops the tool inside the archive); did not fuzz expect edge cases beyond the
EISDIR crash; did not verify the tool's diffing semantics (C1 subject review belongs to sibling seats).
No tools installed; pacman untouched.
