# ExecMapMissing — `readme-map` FAIL-CLOSED on a removed README and a removed corpus dir (round 57)

Verdict: **CONFIRMED**. Both assigned scratch controls make the gate fail closed:
`corpus/README.md` removed and a corpus directory removed each print
`README_MAP: FAIL-CLOSED reason=…` with **exit 2**, on a pristine `git archive`
extraction of the plan's R1 revision. Restoring the same bytes in the same tree
flips the verdict back to `README_MAP: CLEAN files=135 rows=135 covered=135` exit 0,
so the failure is caused by the mutation alone. No production byte was changed, no
commit/jj mutation, no install and no pacman call was made.

Item: `ExecMapMissing` · claim C1 (operability, `readme-map`) · axes: operability + coverage.

## Judged assertion

Harness `.ufo/waves/round-57/build/ExecMapMissing/run-controls.sh` extracts the tested
revision with `git archive` into a per-arm copy, mutates only that copy, and runs the
extracted gate with no argv (`node <arm>/scripts/readme-map.mjs`), i.e. through the
gate's default `DEFAULT_REGISTRY` / `DEFAULT_README` / `DEFAULT_DIRS` resolution.

| arm | mutation (in its own copy) | stdout (verbatim) | exit | stderr |
|---|---|---|---|---|
| 11 | none (pristine control) | `README_MAP: CLEAN files=135 rows=135 covered=135` | 0 | empty |
| 20 | `rm -f corpus/README.md` | `README_MAP: FAIL-CLOSED reason=README unreadable: ENOENT` | **2** | empty |
| 30 | `rm -rf corpus/lessons` | `README_MAP: FAIL-CLOSED reason=corpus dir unreadable: <arm>/corpus/lessons (ENOENT)` | **2** | empty |
| 40 | `rm -rf corpus/knowledge` | `README_MAP: FAIL-CLOSED reason=corpus dir unreadable: <arm>/corpus/knowledge (ENOENT)` | **2** | empty |
| 50 | both dirs removed | `README_MAP: FAIL-CLOSED reason=corpus dir unreadable: <arm>/corpus/knowledge (ENOENT)` | **2** | empty |
| 55 (adjacent) | both dirs kept, all `*.md` emptied | `README_MAP: FAIL-CLOSED reason=no *.md under <arm>/corpus/knowledge + <arm>/corpus/lessons (empty corpus)` | **2** | empty |
| 21 / 31 / 41 / 56 | mutation undone in the same tree | `README_MAP: CLEAN files=135 rows=135 covered=135` | 0 | empty |

`<arm>` is the arm's absolute scratch path; quoted verbatim in the evidence files. Every
FAIL-CLOSED run emits **no** `CLEAN`/`DRIFT` score line: the fail-closed path pre-empts
scoring, so a missing input can never be scored as exit 0 or exit 1.

## Revision and instrument identity

- Tested revision = plan R1 integration tip `f0dc6d1160e66af65355bd353665adac22bbf4a9`
  (`git archive` stream sha256 `3257f0f699db3693198e5c501c05f0eaa749fbe4a27a80c8b6d3df277cd705c7`).
- Gate / registry / README blobs at R1 and at lane HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89`
  are **identical** (`d276b294…`, `d7e017cf…`, `af1b2268…`), so the R1 extraction is also the
  current committed instrument.
- Extracted gate sha256 `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727`
  equals the round-57 `readme-map` entry in `.ufo/pins/counter-pins.json` and the lane
  worktree hash — the run instrument is the pinned one.
- Plan base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` carries `corpus/README.md` only:
  `git ls-tree` returns **no** `scripts/readme-map.mjs` and **no** `.ufo/pins/readme-map.json`
  at base, consistent with plan kill-rule K1 (gate and registry absent at base).

## Retained evidence (`.ufo/waves/round-57/build/ExecMapMissing/`)

| file | content | sha256 |
|---|---|---|
| `run-controls.sh` | the harness (whole run reproducible: `REV=<rev> ./run-controls.sh`) | `0dc48551aa7aea7055ed260bea3f140ff22c25772d59697d8d2b04bc6a6d1192` |
| `evidence/20-arm-readme-removed.txt` | argv, cwd, stdout, stderr, `--- exit: 2` | `74492efaaddf89a3dc4ad620d0ba10204d1abbe5d9e068b044794c44438868` |
| `evidence/30-arm-dir-lessons-removed.txt` | same, missing `corpus/lessons` | `ae5683ea87bc6682e48bee005b0c7e5d92bdba80ede2f57daef046e2ad3b35af` |
| `evidence/40-arm-dir-knowledge-removed.txt` | same, missing `corpus/knowledge` | `26ea3e93caa92d7ffdddc0a920d12cad59a41808e9c2d6d25b68a89fdd41673c` |
| `evidence/21-arm-readme-restored.txt`, `31-…`, `41-…`, `56-…` | restore differentials, `CLEAN … exit 0` | `0b4375fe…`, `a2df1e0b…`, `0ddab76d…`, `01149ef6…` |
| `evidence/50-arm-both-dirs-removed.txt`, `55-arm-empty-corpus.txt` | both-dirs and empty-corpus arms | `dd959de3…`, `aa2710bb…` |
| `evidence/11-baseline-pristine.txt` | pristine baseline, `CLEAN` exit 0 | `5fbefa6e5fd762734bd1db7a745218e3103f5f872987db7a0f289c68b25c12e2` |
| `evidence/12-selftest.txt` | gate `--selftest`: 14/14 PASS, `VERDICT: PASS`, exit 0 | `6e4e5de3c98834028fd8bfc1d38ef240df75b8a5cb72946715077506e30d782b` |
| `evidence/00-context.txt`, `10-pristine.txt` | rev/blob/hash pins, pristine tree (52 knowledge + 83 lessons = 135) | `b3a759c3…`, `46cf9dd5…` |
| `evidence/70-lane-integrity-after.txt` | lane input hashes + `git status` + HEAD after the run | `5f49965e64db5a79b224fc6cfddb19253fa98ab94715d8fead74c87caf0962fe` |
| `evidence/80-citations.txt`, `81-base-vs-r1-vs-pin.txt` | probe B4 line numbers; base-vs-R1-vs-pin `ls-tree` | `8f76a39fc014d3641ba93631308f6ba8406bdd6f94c78051695cbc554a003fb8`, `05dd3a1d72b2213fd3ec5760fe42b2e53c2d6c2edcdcea46fc3886fdc88b4dea` |
| `evidence/99-summary-run{1,2,3}.txt` | three independent harness runs, **byte-identical** (`a2ba6b5e…`) | `a2ba6b5e03539d16c73de650937533d1beeae1778b0d043daf2bf7e0eb8ef8f2` |
| `evidence/99-harness.log` | `time`-stamped harness run, `harness_exit=0` | `745910e6…` |
| `99-evidence-manifest.txt` | sha256 manifest of every evidence file | — |
| `scratch/pristine/`, `scratch/arm-*/` | the untouched extraction and the five mutated copies | — |

Mutation isolation: `tar -C scratch/pristine -cf - . \| sha256sum` is
`c0edcbaa79b6e9d794c30a9304893728ed751d3c3ccacebcfc68b31827c92506` both before and after
all arms; every mutation ran in its own `cp -a` copy. Lane worktree hashes
(`058e5033…` gate, `75756148…` README, `9ef0cf6e…` pin) and HEAD `8c6f5b01` are unchanged
after the runs; the only new lane entries are this seat's untracked
`.ufo/waves/round-57/build/ExecMapMissing/` and this report. Scratch is 333 MB, retained
(lane filesystem: 628 GB free).

## Coverage observation (not a verdict on A57)

The frozen counter's B4 block (`.ufo/waves/round-57/probe/attest57-probe.mjs:247-267`,
captured in `evidence/80-citations.txt`) has five arms: malformed JSON, `version=2`,
`covered:'x'`, `covered` entry outside the two namespaces, and README deleted
(line 264). **No B4 arm deletes a corpus directory**, and each arm's predicate is
`r.status === 2` only (line 252-254) — the emitted `FAIL-CLOSED` line and the absence of
a score line are not asserted. The gate selftest does cover both assigned paths at
fixture level (`readme-map.mjs:319` `readme-absent`, `:326` `corpus-dir-missing`), also
asserting status only, over 2-file `mkdtemp` fixtures reached via `--registry/--readme/
--corpus` overrides.

This seat therefore supplies the missing measurement: the two assigned paths exercised
through the default lane-relative resolution over the real 135-file corpus, with the
exact `README_MAP: FAIL-CLOSED` reason line, an empty stderr, exit 2, and a restore
differential. The gate also implements the `no *.md … (empty corpus)` branch
(`readme-map.mjs:163`) that neither B4 nor the selftest exercises; arm 55 shows it is
reachable and fail-closed (exit 2).

## Risks and limits

- **Revision-bound.** Assertions bind to gate blob `d276b294…` / sha256 `058e5033…`. If the
  lane advances to a revision where that blob differs, re-run the harness before reusing
  this evidence.
- **Reason text embeds absolute checkout paths** (`corpus dir unreadable: <path> (ENOENT)`,
  `no *.md under <path> + <path>`). Assertions match the arm's own absolute path; a
  consumer that string-compares reasons across checkouts would need normalization.
- **FAIL-CLOSED is written to stdout, not stderr** (`readme-map.mjs` `emit`), with stderr
  empty. Tooling that keys failure text off stderr would see nothing; the exit code 2 is
  the reliable channel.
- Controls measure the gate only; they say nothing about README row content correctness
  (drift arms are other seats' scope).
- Two pre-recorded harness iterations were discarded: the first failed because `tar -x -C`
  ran before `mkdir -p` (no extraction, every run a shell `exit 1`), the second because the
  aggregate check `grep 'UNEXPECTED\|FAIL'` matched the literal string `FAIL-CLOSED`
  inside PASS lines. Both were harness defects, not gate defects; the recorded three runs
  of the corrected harness are byte-identical with `harness_exit=0`.

## Files changed

- Added (untracked) `.ufo/waves/round-57/build/ExecMapMissing/` — harness, evidence,
  scratch copies.
- Added `.ufo/waves/round-57/w1/ExecMapMissing.md` (this report).
- Nothing else: no production file, `SCORECARD.md`, `LOG.md`, `SKILL.md`, `PROVINCE.md`,
  `corpus/`, pin, probe, receipt, jj/git state or fleet file was modified; no tool was
  installed.

Blockers: none.
