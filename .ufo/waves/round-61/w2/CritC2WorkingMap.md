# CritC2WorkingMap — round 61 w2, C2 subcase 6 falsify (critic)

**Subcase 6 (README working-tree map):** reproduced against frozen `doctrine61-probe.mjs` (D61 v1). All scratch only; lane jj/git state untouched; no tools installed.

Scratch: `/tmp/kumitate-r61/CritC2WorkingMap/fleet/` (clone of lane @ `be4a820`, `shokunin.conf` with `SHOKUNIN_ROOT` set; assessments on branch `e6-worktree`).

## 1. Where E6 lives in the probe

`probe/doctrine61-probe.mjs` line 27:

```
const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/README.md`],{encoding:'utf8'});const mapped=(r.stdout||'').includes('temporal-worker-versioning-pinning.md');const m=spawnSync('node',[join(lane,'scripts','readme-map.mjs')],{encoding:'utf8',cwd:lane});const out=m.stdout||'';const clean=m.status===0&&/README_MAP: CLEAN/.test(out);add('E6',mapped&&clean,`mapped=${mapped} readme-map=${m.status} ${(out.match(/README_MAP: [^\n]+/)||[''])[0]}`);
```

The `mapped` conjunct is rev-read (`git show <rev>:corpus/README.md`); the `clean` conjunct executes `<lane>/scripts/readme-map.mjs` **from the live worktree** (`cwd:lane`; `readme-map.mjs:82` resolves `LANE` from its own location, so it reads the worktree's `corpus/README.md`, `corpus/knowledge|lessons/`, and `.ufo/pins/readme-map.json`). Plan.md E6 (`plan.md:74-76`) on its face requires "the map row … and `node scripts/readme-map.mjs` prints `README_MAP: CLEAN`" at the measured revision.

## 2. Reproduction

Baseline S0 (commit `523011a`): entry `corpus/knowledge/temporal-worker-versioning-pinning.md` (provenance trio), map rows for the entry and `lessons/round-60-verifier-spotcheck.md`, both pinned; `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=147 rows=147 covered=147` exit=0. Probe:

```
DOCTRINE61: DOCTRINE61_UNMET held=4/6 checks=6 rev=523011a rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
```

### 2a. Committed broken map passes E6 (worktree clean) — T2a

Commit `4c0d27c` deletes the knowledge file only (README row + pin kept): committed tree is DRIFT. `git archive 4c0d27c` + readme-map:

```
README_MAP: note stale-covered:knowledge/temporal-worker-versioning-pinning.md
README_MAP: DRIFT files=146 rows=147 covered=147 bad=2 first=orphan-row:knowledge/temporal-worker-versioning-pinning.md
exit=1
```

Restore the file in the **worktree** only (no commit; worktree map CLEAN again). Probe at the same rev:

```
DOCTRINE61: DOCTRINE61_UNMET held=2/6 checks=6 rev=4c0d27c rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
```

E6 reads the worktree, not the measured rev.

### 2b. Honest rev fails E6 on a worktree-only stray — T1a

At clean `523011a` add an uncommitted `/` `corpus/knowledge/stray-e6-t1a.md`:

```
 | E6 MISS mapped=true readme-map=1 README_MAP: note unpinned:knowledge/stray-e6-t1a.md
```

A clean commit's E6 misses on an uncommitted file. (Counterexample 5's a4 receipt `ctl-c2-critic-a4-e5-worktree-not-rev.txt` is sibling evidence for E5; this reproduces the E6 half.)

### 2c. `mapped` is rev-read; `clean` is worktree — favorable split

Mutate only the worktree README row (replace the entry's row text), rev unchanged:

```
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
```

`mapped` stayed true on a worktree row replacement (read from the rev); `clean` saw the worktree state. The two conjuncts already read different trees; a revision with no row and a forged worktree still yields `mapped=true` + `clean=true`.

### 2d. E6 is forgeable by replacing the gate executable

Commit `4c0d27c` (committed map broken) with the worktree `scripts/readme-map.mjs` replaced by a stub that unconditionally prints `README_MAP: CLEAN` and exits 0:

```
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
```

A revision whose committed map is DRIFT can be made to read `E6 PASS` by editing the worktree gate script (or by any worktree drift that makes the map CLEAN). The identity/trust of the measured revision's map is not established.

## 3. Does subcase 6 independently prevent D61 from verifying?

Yes — for the README-map obligation (E6). The `clean` half is a live-worktree measurement under a mutable gate executable: it is both an honest false negative (2b) and a forgeable false positive (2a/2d). Because `DOCTRINE61_HELD` requires E6, HELD-verifiability is broken independent of E3/E4/E5: neither the E6 `MISS` (worktree noise) nor the E6 `PASS` (worktree forgery) attests to the measured revision's map. E1–E5 being fixed would not repair E6. Per the kill rule (plan.md:79), the honest aggregate under v1 cannot be established: an unconditionally-CLEAN stub makes every revision pass E6, and the a4/a5 forgery path (worktree state) passes E3/E4/E5 as demonstrated in w1.

Residual: my scratch tree never added an S195 row, so E3/E4 stayed MISS in every run — irrelevant to the E6 flip, which was isolated as the only `PASS`/`MISS` variance across identical revs.

Verdict: w1 CritControlC2 counterexample 6 (worktree-not-rev) confirmed and extended — E6's `readme-map` conjunct both measures the worktree and is script-mutable; the plan.md E6 contract cannot be attested under D61 v1.
