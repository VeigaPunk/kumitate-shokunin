# K70AttackGitEnv — Milestone: AttackGitEnv

Seat role: attack (UFO-FSD critic). Judged axis: **operability (C1 replay isolation)**.
Assigned contract edge: **hostile `GIT_DIR` / `GIT_WORK_TREE` / `GIT_INDEX_FILE` inherited into the fixture git writes** of the r70 control-replay implementation.
Candidate state at inspection: **no `control-replay.mjs` exists** (absent from `scripts/`, absent from every `.ufo/waves/round-70/build/*/` seat dir, incl. the named `K70ExecRunner` path). This seat therefore attacks the contract + frozen counter directly, per seat spec ("inspect if present otherwise attack contract/counter directly").

Frozen bytes read, never modified (sha256 in `build/K70AttackGitEnv/evidence-sha256.txt`):

- `.ufo/waves/round-70/probe/replay70-probe.mjs` — `63f52b75…bf0c1`
- `.ufo/waves/round-69/probe/c1-controls.sh` — `01efd6dd…aeda12`
- `.ufo/waves/round-69/probe/c2-controls.sh` — `679b7d96…3a66f4`
- `.ufo/waves/round-69/probe/ledger69-probe.mjs` — `1f19d1e6…f946de` (carries the env defense the r70 counter dropped)
- `.ufo/waves/round-69/probe/deprec69-probe.mjs` — `af021f87…d2852e7` (same)

## Counterexample (headline)

A caller-exported `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE` reaches every git write in the generated private control copy, because the frozen r70 counter passes its full environment to the candidate (`env:{...process.env,TMPDIR:root}`) and the private copy's own `git init/add/commit/rev-parse` (frozen r69 script bodies) honor those variables **even when the contract-mandated explicit fixture-root `-C` arguments are used**. Demonstrated live in this seat's scratch (transcript: `build/K70AttackGitEnv/demo-transcript.txt`):

- **DEMO 1** — with `GIT_DIR=<host repo> GIT_WORK_TREE=<fixture child> GIT_INDEX_FILE=<outside path>`: the fixture child got **no `.git`** ("Unique mkdtemp child under the supplied work root" invariant broken); a foreign commit `c1-donothing fixture` (author `ctl <ctl@invalid>`, tree = fixture bytes) **landed on the host repo's branch**, advancing its HEAD (`ef5fd96 → a624dac`); the stolen index file was created outside the work root; and `REV` reported to the receipt **equals the host repo's HEAD** — false provenance inside a receipt whose only rev check is label presence.
- **DEMO 2** — `GIT_INDEX_FILE` alone redirects the index outside the work root (arbitrary-path file creation; fixture `.git/index` never written). No command-line override exists for the index path.
- **DEMO 3** — scrubbed run (`env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE …`): all writes contained in the mkdtemp child; this is exactly the contract's "scrub inherited repository environment" clause, shown sufficient.
- **DEMO 4** — explicit `--git-dir/--work-tree` args **do** override `GIT_DIR`/`GIT_WORK_TREE` env, but `GIT_INDEX_FILE` **still leaks**. Explicit fixture-root arguments alone are therefore not the defense; env scrub is required. This matters because the contract text names both, and an implementer could stop at `-C`/`--git-dir`.

(Footnote: DEMO 2/3/4 print the identical commit sha `839b79a…` — same tree, message, author, no parent, same second. Expected git behavior, not a defect.)

## Defects

### A. Contract clause "scrub inherited repository environment" is unenforced — coverage gap (fixable defect, disclosure-class)

The implementation contract requires the generated private script to scrub inherited repository environment. The frozen counter never exercises a hostile env: R2–R7 all run under `{...process.env, TMPDIR:root}`, R8–R10 are env-blind. In a benign scoring env, a candidate that omits the scrub behaves **byte-identically** to one that scrubs on every axis the counter measures — so `REPLAY70_HELD 10/10` does not evidence the clause. Worse, the escape is *invisible to the counter even when it fires*: the pre-probe fixture writes happen before the nested r69 probe runs, and the counter's R3–R7 observables (labels, preserved digests, empty work dir, exclusive output) all remain satisfiable while the foreign commit and stolen index sit outside the work root (DEMO 1 ordering: writes → probe → receipt tail). The nested r69 probes' `ENV_POISONED` preamble only detects poison **reaching the probe** — it cannot retract writes already made, and a private copy that scrubs only the probe invocation (not its own git calls) escapes detection entirely.

**Freeze consequence:** under the frozen counter, `REPLAY70_HELD` is achievable by an implementation violating an explicitly named contract requirement; the predicate is under-specified on this clause. Per the plan's own rule ("seats attack this … with limits disclosed rather than changing this predicate after scoring"), this must be recorded as a disclosed limit on the receipt, not fixed by amending the predicate after scoring.

### B. The r70 counter's own git calls inherit the caller's env unscrubbed — verdict is caller-env-dependent (fixable defect, regression vs r69)

The frozen r69 probes defend themselves: `POISON = ['NODE_OPTIONS','LD_PRELOAD','GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_COMMON_DIR','TAR_OPTIONS']`, a confinement preamble that exits 2 (`ENV_POISONED:<key>`), and `CHILD_ENV(T) = {PATH, TMPDIR, LANG}` for every child. The r70 counter dropped all three:

- `const git=(...a)=>spawnSync('git',['-C',lane,...a],{encoding:'utf8',maxBuffer:16*1024*1024});` — no `env` → full inheritance.
- `const run=(args)=>spawnSync(process.execPath,[tool,...args],{cwd:tree,env:{...process.env,TMPDIR:root},…});` — poison passed through to the candidate.
- the `archive` bash line likewise inherits.

**DEMO 5** (frozen helper lines replicated verbatim, `GIT_DIR` → empty scratch repo, read-only toward the lane): the R1 line `git -C lane show 78b98d76…:…c1-controls.sh` returns **status 128** and the archive line returns **status 2** → `REPLAY70_ERROR` / R1 MISS regardless of candidate quality. Any caller with `GIT_DIR` set (accident, stale export, malice) deterministically denies the predicate — and if `GIT_DIR` points at a *stale clone*, R1's `show` reads from the clone while the receipt records `rev=78b98d76…` of the lane: provenance of the R1 evidence is env-conditional. (Content-addressing does prevent forged bytes at rev B without a collision, so the false-PASS content direction is bounded; the denial direction and the provenance mislabel are not.)

**Freeze consequence:** the predicate's verdict and the receipt's `rev=` provenance depend on the scoring caller's environment, which the frozen counter neither scrubs nor records. A HELD receipt is only reproducible evidence if the invocation environment is itself clean and documented.

### Not defects (bounds of this attack)

- The nested r69 probes are defended (DEMO 6: both exit 2 `ENV_POISONED:GIT_DIR` under hostile env before any git call). The hole is solely (i) the candidate's private-copy git writes and (ii) the r70 counter's own helper/archive.
- Forged R1 *content* at rev B is infeasible (SHA-1 content addressing) without a collision attack; R9/R8 are not env-reachable in any direction shown.

## Smallest safe correction (no frozen-byte change, no predicate amendment)

1. **Candidate side (already contract text; make it load-bearing in review):** the generated private copy must (a) re-exec or wrap every git invocation in an env scrub — `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_OBJECT_DIRECTORY -u GIT_COMMON_DIR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` — and (b) carry an r69-style `ENV_POISONED` preamble of its own. Explicit `-C`/`--git-dir/--work-tree` args are retained but are **not** sufficient (DEMO 4 index leak).
2. **Scoring-invocation side (operational, bytes untouched):** L1 runs the frozen command as printed in the plan, but under an env scrub (`env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_OBJECT_DIRECTORY -u GIT_COMMON_DIR -u GIT_ALTERNATE_OBJECT_DIRECTORIES TMPDIR=… node .ufo/waves/round-70/probe/replay70-probe.mjs …`), and records both the scrub and the disclosed limit "R2–R7 do not exercise hostile repository env; the scrub clause is unenforced by the frozen counter" in SCORECARD/LOG alongside the receipt. This keeps the predicate, the counter bytes, and the plan command intact.
3. **Must not happen:** amending the predicate after scoring, or touching frozen counter bytes — both are barred by the plan and would constitute predicate laundering.

## Commands and observed outcomes

| Command | Outcome |
|---|---|
| `bash attack-git-env.sh` (private scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackGitEnv/`) | 6/6 demos as summarized above; full transcript in `build/K70AttackGitEnv/demo-transcript.txt` |
| fixture writes w/ `GIT_DIR+GIT_WORK_TREE+GIT_INDEX_FILE` (DEMO 1) | foreign commit in host repo; no `.git` in fixture child; stolen index outside; `REV == host HEAD` |
| fixture writes w/ `GIT_INDEX_FILE` only (DEMO 2) | outside index created; fixture index absent |
| fixture writes scrubbed (DEMO 3) | all contained in child |
| fixture writes w/ explicit `--git-dir/--work-tree` + hostile env (DEMO 4) | dir/tree contained; index still leaked |
| verbatim frozen-counter helper + archive under hostile `GIT_DIR` (DEMO 5) | R1 line status 128; archive status 2 → error path |
| frozen r69 probes under hostile `GIT_DIR` (DEMO 6) | both exit 2, `ENV_POISONED:GIT_DIR` |
| `sha256sum` of frozen files | `build/K70AttackGitEnv/evidence-sha256.txt` |

No installs/updates performed (none needed). Tooling on record: git 2.56.0 (pacman, preinstalled), node v24.21.0 (pacman, preinstalled), bash (system) — channel/reason per RULES.md; pacman transactions remain PAUSED, nothing added to PATH dirs.

Lane hygiene: wrote only this report, `build/K70AttackGitEnv/` (driver, transcript, hashes), and the now-deleted scratch dir. No git/jj mutations anywhere; original `c1-controls.sh`/`c2-controls.sh` never executed; frozen bytes untouched (hashes pinned above). Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackGitEnv/` removed before yield.
