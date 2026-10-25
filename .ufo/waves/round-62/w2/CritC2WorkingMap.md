# CritC2WorkingMap — round 62 w2, C2 subcase 6 falsify (critic)

**Subcase 6 (README working-tree map):** reproduced against the frozen `doctrine61-probe.mjs` (D61 v1, sha256 `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`, byte-identical to the round-61 counters pack). All scratch only; lane jj/git state untouched; no tools installed or upgraded.

Scratch: `/tmp/kumitate-r62/CritC2WorkingMap/fleet/` (`git clone --no-hardlinks` of the lane at `0cbe0d7`; base rev used for the probe runs: `1508415` — the S195-entry commit whose committed map is CLEAN; reject commit `d05f0a55…` built inside the scratch clone only).

## 1. The frozen behavior under attack (probe line 27)

`probe/doctrine61-probe.mjs` line 27 verbatim:

```
const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/README.md`],{encoding:'utf8'});const mapped=(r.stdout||'').includes('temporal-worker-versioning-pinning.md');const m=spawnSync('node',[join(lane,'scripts','readme-map.mjs')],{encoding:'utf8',cwd:lane});const out=m.stdout||'';const clean=m.status===0&&/README_MAP: CLEAN/.test(out);add('E6',mapped&&clean,`mapped=${mapped} readme-map=${m.status} ${(out.match(/README_MAP: [^\n]+/)||[''])[0]}`);
```

The `mapped` conjunct is rev-read (`git show <rev>:corpus/README.md`); the `clean` conjunct executes `<lane>/scripts/readme-map.mjs` **from the live worktree** (`cwd:lane`), which reads the worktree's `corpus/README.md`, `corpus/knowledge|lessons/`, and `.ufo/pins/readme-map.json`. plan.md E6 (`plan.md:74-76`) requires, at the measured revision: "`corpus/README.md` carries the map row for the entry and `node scripts/readme-map.mjs` prints `README_MAP: CLEAN files=rows=covered`".

## 2. Reproduction

### 2a. Baseline — clean clone at `1508415` (worktree == rev)

```
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=148 rows=148 covered=148
$ readme-map_exit=0

$ node .ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r62/CritC2WorkingMap/fleet 1508415 --census-root /home/vgpnk/Projects/shokunin
DOCTRINE61: DOCTRINE61_UNMET held=4/6 checks=6 rev=1508415 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=148 rows=148 covered=148
$ probe_exit=1
```

E6 passes on the clean worktree.

### 2b. Honest false negative — an uncommitted stray file flips E6 at the same rev

Add one uncommitted file `corpus/knowledge/stray-e6-r62.md` to the worktree; **no commit**. Same rev `1508415`:

```
$ node scripts/readme-map.mjs
README_MAP: note unpinned:knowledge/stray-e6-r62.md
README_MAP: DRIFT files=149 rows=148 covered=148 bad=2 first=uncovered:knowledge/stray-e6-r62.md
$ readme-map_exit=1

$ node .ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r62/CritC2WorkingMap/fleet 1508415 --census-root /home/vgpnk/Projects/shokunin
DOCTRINE61: DOCTRINE61_UNMET held=3/6 checks=6 rev=1508415 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 MISS mapped=true readme-map=1 README_MAP: note unpinned:knowledge/stray-e6-r62.md
$ probe_exit=1
```

Identical measured rev, different E6 verdict — the `clean` conjunct measured the worktree, not the rev.

### 2c. Committed broken map still passes E6 when the worktree is restored

Scratch commit `d05f0a55f95e958a41e053ec3482450bf4f38507` (K1) deletes only the knowledge file (README row and pin kept). The **committed** tree at K1 is DRIFT:

```
$ git archive d05f0a55f95e958a41e053ec3482450bf4f38507 | tar -x -C /tmp/.../archive && (cd /tmp/.../archive && node scripts/readme-map.mjs)
README_MAP: note stale-covered:knowledge/temporal-worker-versioning-pinning.md
README_MAP: DRIFT files=147 rows=148 covered=148 bad=2 first=orphan-row:knowledge/temporal-worker-versioning-pinning.md
$ committed_readme-map_exit=1
```

Restore the file in the **worktree only** (untracked; no commit). Probe at the same rev K1:

```
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=148 rows=148 covered=148
$ worktree_readme-map_exit=0

$ node .ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r62/CritC2WorkingMap/fleet d05f0a55f95e958a41e053ec3482450bf4f38507 --census-root /home/vgpnk/Projects/shokunin
DOCTRINE61: DOCTRINE61_UNMET held=2/6 checks=6 rev=d05f0a55f95e958a41e053ec3482450bf4f38507 rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=148 rows=148 covered=148
$ probe_exit=1
```

A rev whose committed map is DRIFT reads `E6 PASS` when the worktree is patched. E6 attests to the worktree, not to the measured rev.

### 2d. E6 is forgeable/breakable by replacing the gate executable

The `clean` conjunct runs `<lane>/scripts/readme-map.mjs` — a mutable file in the worktree.

(1) **False positive:** with K1 (committed map broken, DRIFT) still as the measured rev, replace the worktree `scripts/readme-map.mjs` with a stub that unconditionally prints `README_MAP: CLEAN files=148 rows=148 covered=148` and exits 0:

```
$ node .ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r62/CritC2WorkingMap/fleet d05f0a55f95e958a41e053ec3482450bf4f38507 --census-root /home/vgpnk/Projects/shokunin
DOCTRINE61: DOCTRINE61_UNMET held=2/6 checks=6 rev=d05f0a55f95e958a41e053ec3482450bf4f38507 rule=D61
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=148 rows=148 covered=148
```

(2) **False negative:** with the clean rev `1508415` as the measured rev, replace the gate with a stub printing `README_MAP: DRIFT files=0 rows=0 covered=0` and exiting 1:

```
$ node .ufo/waves/round-61/probe/doctrine61-probe.mjs /tmp/kumitate-r62/CritC2WorkingMap/fleet 1508415 --census-root /home/vgpnk/Projects/shokunin
DOCTRINE61: DOCTRINE61_UNMET held=3/6 checks=6 rev=1508415 rule=D61
 | E6 MISS mapped=true readme-map=1 README_MAP: DRIFT files=0 rows=0 covered=0
```

Either direction of the E6 verdict can be manufactured without touching the measured rev; the script's identity/trust is never checked against the rev (Sha pinned/`git ls-tree` check exists for `scripts/readme-map.mjs`).

### 2e. Corroboration — the current lane HEAD's committed tree itself fails E6

`git archive 0cbe0d75e5a08718e2256408329692908c837766` (current HEAD, where the round-61 verifier spot-check lesson landed) extracted under a temp root:

```
$ node scripts/readme-map.mjs
README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
README_MAP: DRIFT files=149 rows=148 covered=148 bad=2 first=uncovered:lessons/round-61-verifier-spotcheck.md
$ HEAD_committed_readme-map_exit=1
```

The honest final state cannot pass E6 even with a perfectly clean worktree.

## 3. Does subcase 6 independently prevent D61 from verifying?

Yes — for the README-map obligation (E6). `DOCTRINE61_HELD` requires E6 PASS, and under v1 E6's `clean` conjunct is (a) a live worktree measurement (2b, 2c) and (b) executed from a mutable, unverified gate executable (2d). The E6 verdict does not attest to the measured revision in either direction: a clean rev can read `E6 MISS` (worktree noise or a failing stub) and a broken rev can read `E6 PASS` (worktree patch or a CLEAN stub). This holds independently of E1–E5: E6 alone cannot be satisfied verifiably at any rev, because the probe never measures the rev's map state — so the kill rule (plan.md:79) applies to E6 on its own. E1–E5 being repaired would not repair E6; the w1 counterexample 5 (a4, worktree-not-rev) and the w1 counterexample 7 (a5, all-HELD forgery) rely on exactly this axis.

Residual: my scratch runs passed `--census-root /home/vgpnk/Projects/shokunin` (the frozen plan's E5 form) so only E6 varied; under the documented counting command (no `--census-root`) E5 additionally reads `exit=2` — that is subcase 4's separate finding. E3/E4 stayed MISS in every run (frozen row-regex/index defects, subcases 1–2); the E6 flips above are the only `PASS`/`MISS` variance across identical revs in this scratch.

Verdict: w1 CritControlC2 counterexample 5/6 (worktree-not-rev) confirmed and extended — E6's `readme-map` conjunct measures the live worktree under a mutable gate executable, so the plan.md E6 contract cannot be attested under D61 v1.
