# K70AttackOutputExisting — w1 attack report

- Seat: K70AttackOutputExisting (critic, leaf; no subagent dispatch)
- Milestone: AttackOutputExisting
- Axis: operability (C1 replay isolation)
- Scope: frozen R9 contract edge only — **existing regular output file must remain byte-exact, and refusal must happen before fixture work.**
- Candidate inspected: `.ufo/waves/round-70/build/K70ExecRunner/control-replay.mjs` — **absent** (`ls` on `build/` shows only `K70ExecFixtureTests`; `git ls-tree HEAD scripts/` contains no `control-replay.mjs`; lane worktree `scripts/` likewise). Per seat instructions I attacked the contract/counter directly and built a runnable isolated counterexample. No original control (`c1-controls.sh`/`c2-controls.sh`) was executed; mocks are self-contained.

## Freeze context verified (observed)

- `sha256sum .ufo/waves/round-70/plan.md` → `e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b`; identical to `git show 3dbe7e6e:.ufo/waves/round-70/plan.md` (frozen plan commit `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`; HEAD `1e00955a`). Plan bytes unchanged.
- `sha256sum .ufo/waves/round-70/probe/replay70-probe.mjs` → `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` — matches `.ufo/pins/counter-pins.json` pin for `replay70-probe`. Counter frozen.
- `cat base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0.
- Frozen r69 controls hashed: c1 `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12`, c2 `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4`. Untouched.
- Base receipt `.ufo/waves/round-70/base/replay70-base.txt` records `held=2/10` with **R9 PASS at base** — vacuous: at base `scripts/control-replay.mjs` does not exist, so `spawnSync(node,[tool,...])` exits 1 (MODULE_NOT_FOUND) which satisfies `status!==0` while `existing.txt` is never opened. R9 PASS therefore proves nothing about ordering at base.
- R9 frozen semantics replicated verbatim from the pinned probe:

```js
const existing=path.join(root,'existing.txt');fs.writeFileSync(existing,'do-not-overwrite\n');
const collision=run(['--lane',lane,'--family','c1','--mode','donothing','--out',existing,'--work',root]);
check('R9',collision.status!==0&&fs.readFileSync(existing,'utf8')==='do-not-overwrite\n','existing output preserved');
```

Note `--work root`: the victim lives **inside** the supplied work root, and the probe's own decoys (`tree/`, `result-*.txt`, `work-0..4/`) are siblings. The probe never inspects the work root after R9; it only re-reads `existing.txt`.

## Counterexample (runnable, isolated)

Artifact: `build/K70AttackOutputExisting/r9-existing-output-attack.mjs` (copy of scratch original). Receipt: `build/K70AttackOutputExisting/r9-attack-receipt.json.txt`. Sandboxes were created only under `/fast/scratch/hyaku/kumitate-r70/K70AttackOutputExisting/` and removed by the harness; no lane/fleet/frozen writes.

Command: `cd /fast/scratch/hyaku/kumitate-r70/K70AttackOutputExisting && node r9-existing-output-attack.mjs` (run twice; verdicts identical — only mkdtemp suffixes differ). Node v24.21.0 preexisting; **no installs** (pacman paused; nothing needed).

Eight mock candidates against the exact frozen R9 assertion, sandbox mirroring the probe root at R9 time:

| Mock | Behavior | exit | frozen R9 | Probe-invisible side effects |
|---|---|---|---|---|
| M0 | refuse (exit 1) before any fixture work | 1 | **PASS** | none (reference) |
| M1 | no exclusive create: `writeFileSync(out,'RECEIPT…')` truncates victim | 0 | MISS | — |
| M2 | full fixture work first (git-archive → mkdtemp child → run private control copy → staged receipt), refuse only at copy-out | 1 | **PASS** | 1 fixture call, `workchild-*/staged-receipt.txt`, `residue.marker` left in work root |
| M3 | refuse (exit 1) but cleanup empties the **supplied work root** | 1 | MISS (readErr ENOENT) | destroys `existing.txt`, `tree/`, `result-0.txt`, `work-0/` — real probe degrades to `REPLAY70_ERROR`, exit 2 |
| M4 | detect existing, print refusal, exit 0 | 0 | MISS | — |
| M5 | TOCTOU check-then-create (`existsSync` then flag `w`) with victim pre-existing | 1 | PASS | race window unexercised by probe |
| M5a | deterministic race: victim absent at check; attacker lands victim inside window; create flag `w` | 0 | MISS | victim truncated to `"RECEIPT\n"` |
| M5b | same race with exclusive create flag `wx` | 1 | PASS | `EEXIST` → refuse, victim byte-exact |

Observed summary lines:
```
SUMMARY frozenR9=PASS: ["M0 compliant…","M2 fixture-work-then-refuse (ordering violation)","M5 TOCTOU…","M5b race with exclusive create (wx)"]
SUMMARY frozenR9=MISS: ["M1 overwrite…","M3 refuse but wipe work root","M4 refuse with exit 0","M5a race with plain create (w)"]
```

## Findings (actual defects in what the frozen predicate can certify)

1. **R9 certifies outcome, not ordering — the "refuse before fixture work" half of this seat's edge is unenforced by the frozen counter.** M2 passes R9 (`exit 1`, victim intact) while performing every piece of fixture work first: lane archive, private-script generation/run, mkdtemp child, staged receipt, plus a residue file in the supplied work root. The probe checks only `status!==0` and victim bytes; it never asserts that no fixture work happened. Since `replay70-probe.mjs` is pinned and freeze-map must stay CLEAN, **this gap cannot be closed in the counter** — it is a fixed property of R70's predicate.
2. **Ordering is freeze-safety, not just economy.** A refuse-late implementation keeps the r69 frozen receipts exposed during a run that should never have happened: with a botched W/S substitution the private control copy would write toward `.ufo/waves/round-69/controls` *during the R9 run*, and R9 itself would not notice (only R3–R7 digest preservation and the commit-time freeze-map would). Refusing first removes that window entirely. This is the concrete freeze consequence of letting an M2-class implementation score R9 PASS.
3. **The load-bearing parts of R9 are real:** non-zero exit (M4 bites), byte-exact content (M1 bites), and the armed `--work root` trap (M3 bites — but via an uncaught `ENOENT` that collapses the whole run to `REPLAY70_ERROR` exit 2 instead of a clean `R9 MISS`; cosmetic, frozen).
4. **TOCTOU is out of R9's reach.** M5 passes the probe's only scenario; the deterministic races (M5a/M5b) show only exclusive creation (`flag 'wx'`) closes the window. The contract's "output creation exclusive" requirement is the correct and only defense; review must confirm it, R9 cannot.
5. **Vacuous R9 at base** (2/10 receipt) means R9's historical PASS carries no ordering information; do not cite base R9 PASS as evidence for anything.

## Smallest safe correction (no frozen bytes touched)

- **Runner (implementation)**: check `--out` existence with refusal as the *first* action after argument validation — before lane git access, before private-copy generation, before `mkdtemp` under `--work`. Create the final output exclusively (`fs.writeFileSync(out, …, {flag:'wx'})` or `openSync(out,'wx')`) as defense in depth; map `EEXIST` to the same non-zero refusal. Cleanup must remove only the tool's own mkdtemp child, never enumerate/empty the supplied work root.
- **Selftest (R2, the only place new assertions are allowed)**: add a stable finding id, e.g. `EXISTING_OUT_EARLY_REFUSAL`, that pre-creates `out`, runs the internal flow with instrumentation counters (git invocations, mkdtemp calls), and asserts: refusal exit, victim bytes unchanged, **zero fixture-work side effects** (no git call, no work child, no stray writes). This restores ordering coverage that frozen R9 cannot provide. Keep the existing-output check cheap and synchronous so it cannot be reordered after fixture work by accident.
- **Integrator**: treat R9 PASS as necessary-but-weak; pair it with the selftest finding id above and a diff review confirming the early-refusal ordering before claiming the operability edge. Do not amend the predicate after scoring.

## Freeze consequence (exact)

- Frozen probe pin `63f52b75…` and plan commit `3dbe7e6e…` are unchanged; all findings target implementation/review, never counter bytes. freeze-map remains CLEAN (no production writes made; verified base map only read).
- If an M2-class candidate lands and R9 alone is cited for this edge, the round's REPLAY70_HELD 10/10 would include an implementation that performs fixture work against the lane on a refusing run — a latent risk to frozen r69 receipt bytes under any future substitution bug, undetectable by the frozen counter. That is a fixable defect (enforce ordering in implementation + selftest), not a tradeoff the judge must accept.

## Tooling record

- No installs/updates. Node v24.21.0 used as found; `bash`, `sha256sum`, `git` (read-only: `hash-object`, `show`, `ls-tree`, `status`, `log`, `diff --stat`) as found. Pacman paused per assignment; no host service touched.
