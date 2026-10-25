# CritC2LiveCensus — round 61 w2, C2 subcase 5 falsify (critic)

**Verdict: the wave-1 claim reproduced and confirmed — D61 v1 probe E5/E6 measure the mutable live worktree, not the measured `rev`. Subcase 5 independently falsifies the probe's "E5/E6 at the measured revision" contract.**

- Task: attack C2 subcase 5 in `.ufo/waves/round-61/w1/CritControlC2.md` — "mutable live census vs measured rev" and "README working-tree map" (counterexample 5: *E5/E6 measure the worktree, not the rev*).
- Probe under test (frozen): `.ufo/waves/round-61/probe/doctrine61-probe.mjs` — sha256 `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`; blob last touched at commit `48877b4` (frozen wave-1). Probe file unchanged in lane worktree (`git status --porcelain=v1 -- .ufo/waves/round-61/probe/` shows only untracked `counters.sh`, no modification to `doctrine61-probe.mjs`).
- Scratch only: `/tmp/kumitate-r61/CritC2LiveCensus/` (fleet root w/ `shokunin.conf`, clone of lane @ `be4a820`; archive trees under `revfleet/`, `revfleet3/`). Lane repo untouched. No tools installed; no pacman transactions.
- Probe source lines cited: E5 = line 24 (`spawnSync(sources-census.sh … --root censusRoot||lane …)` on the **live worktree's fleet**); E6 = lines 27 (`git show <rev>:corpus/README.md` for `mapped`; `spawnSync('node', [join(lane,'scripts','readme-map.mjs')], {cwd:lane})` for `clean` — the script itself is read from the worktree).

## Reproduction 1 — E5 reads the live census, not the rev (counterexample 5, first half)

Setup: commit `R1=326c56a` in scratch clone holds a malformed S195 registry row (escaped pipe `\|` inside the teaches cell → census counts `fields=12`), then the worktree is restored clean to `be4a820`.

Census of the **committed rev tree** (`git archive 326c56a` extracted under `revfleet`):

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /tmp/kumitate-r61/CritC2LiveCensus/revfleet kumitate
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
kumitate	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
kumitate	E01	S195 fields=12
(exit=1)
```

(W04 lines elided: `sources-census.sh validate … 2>/dev/null | grep -v $'\tW04\t'` → `kumitate E01 S195 fields=12`, `status=1`.)

Census of the **live worktree** the probe actually reads (clean base):

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /tmp/kumitate-r61/CritC2LiveCensus/fleet kumitate
kumitate	ok	/tmp/kumitate-r61/CritC2LiveCensus/fleet/kumitate-shokunin/corpus/SOURCES.md
(status=0)
```

Probe at the malformed rev `326c56a` — E5 PASS:

```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2LiveCensus/fleet/kumitate-shokunin 326c56a --census-root /tmp/kumitate-r61/CritC2LiveCensus/fleet
DOCTRINE61: DOCTRINE61_UNMET held=1/6 checks=6 rev=326c56a rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 PASS exit=0
 | E6 MISS mapped=false readme-map=1 README_MAP: note unpinned:lessons/round-60-verifier-spotcheck.md
(exit=1)
```

**A/B at the identical clean rev `be4a820`** — flipping only the *worktree* flips E5:

| worktree state | E5 verdict |
|---|---|
| clean (`git checkout -f be4a820` + `git clean -fdxq`) | `E5 PASS exit=0` |
| same rev, malformed S195 row inserted into worktree `corpus/SOURCES.md` (uncommitted) | `E5 MISS exit=1` |

Malformed-worktree run verbatim:

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /tmp/kumitate-r61/CritC2LiveCensus/fleet kumitate
kumitate	E01	S195 fields=12
(status=1)
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2LiveCensus/fleet/kumitate-shokunin be4a820 --census-root /tmp/kumitate-r61/CritC2LiveCensus/fleet
DOCTRINE61: DOCTRINE61_UNMET held=0/6 checks=6 rev=be4a820 rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 MISS exit=1
 | E6 MISS mapped=false readme-map=1 README_MAP: note unpinned:lessons/round-60-verifier-spotcheck.md
(exit=1)
```

Same rev (clean side) verbatim:

```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2LiveCensus/fleet/kumitate-shokunin be4a820 --census-root /tmp/kumitate-r61/CritC2LiveCensus/fleet
DOCTRINE61: DOCTRINE61_UNMET held=1/6 checks=6 rev=be4a820 rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 PASS exit=0
 | E6 MISS mapped=false readme-map=1 README_MAP: note unpinned:lessons/round-60-verifier-spotcheck.md
(exit=1)
```

Conclusion 1: E5's verdict is a function of the **live mutable worktree** registry (`sources-census.sh validate` on the worktree fleet). Neither the rev's tree (archive `E01 fields=12`, exit 1) nor the fact that the rev is clean (`be4a820` A/B) changes the outcome — E5 is not "measured at the revision" as plan.md claims (**wave-1 counterexample 5 confirmed; wave-1 receipt `ctl-c2-critic-a4-e5-worktree-not-rev.txt` reproduced with fresh scratch revs**).

## Reproduction 2 — E6 composes rev-README with worktree readme-map + worktree script (counterexample 5, second half)

Setup: commit `R3=f6f05ea` adds the temporal-worker-versioning entry file, its README row, and both pins (`lessons/round-60-verifier-spotcheck.md`, `knowledge/temporal-worker-versioning-pinning.md`) — rev tree AND worktree both `README_MAP: CLEAN files=147 rows=147 covered=147` (exit 0). Probe at R3 with clean worktree:

```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2LiveCensus/fleet/kumitate-shokunin f6f05ea --census-root /tmp/kumitate-r61/CritC2LiveCensus/fleet
DOCTRINE61: DOCTRINE61_UNMET held=3/6 checks=6 rev=f6f05ea rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
(exit=1)
```

Now delete **only** the worktree file `corpus/knowledge/temporal-worker-versioning-pinning.md` (the rev `f6f05ea` is untouched) and probe the same rev again:

```
$ node scripts/readme-map.mjs
README_MAP: note stale-covered:knowledge/temporal-worker-versioning-pinning.md
README_MAP: DRIFT files=146 rows=147 covered=147 bad=2 first=orphan-row:knowledge/temporal-worker-versioning-pinning.md
(exit=1)
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2LiveCensus/fleet/kumitate-shokunin f6f05ea --census-root /tmp/kumitate-r61/CritC2LiveCensus/fleet
DOCTRINE61: DOCTRINE61_UNMET held=2/6 checks=6 rev=f6f05ea rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 PASS exit=0
 | E6 MISS mapped=true readme-map=1 README_MAP: note stale-covered:knowledge/temporal-worker-versioning-pinning.md
(exit=1)
```

The same rev `f6f05ea` gives `E6 PASS` (clean worktree) and `E6 MISS` (mutated worktree). Note the mix visible even in the detail line: `mapped=true` still comes from the **rev's** README (`git show f6f05ea:corpus/README.md`), while `readme-map=1` and the `README_MAP:` line come from the **worktree** (including the worktree copy of `scripts/readme-map.mjs`, since probe line 27 runs `node <lane>/scripts/readme-map.mjs` with `cwd:lane`). Conclusion 2: E6 is a hybrid of two different trees — E6 does not measure a single coherent revision (wave-1 counterexample 5 confirmed).

## Sub-observation — default census root (counterexample 6 interaction)

With `--census-root` omitted (the plan.md counting command), E5 defaults to `--root <lane>`; the clone itself has no `shokunin.conf` (the conf lives at fleet root), so:

```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2LiveCensus/fleet/kumitate-shokunin f6f05ea
DOCTRINE61: DOCTRINE61_UNMET held=2/6 checks=6 rev=f6f05ea rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=
 | E5 MISS exit=2
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
(exit=1)
```

`E5 MISS exit=2` — consistent with wave-1 counterexample 6 (`ERROR: config not found …` / exit 2). Not part of subcase 5, recorded because it strengthens the "E5 does not measure rev" finding.

## Falsification verdict & residual risk

- **Does subcase 5 independently prevent D61 from verifying?** For the *E5/E6 portion* of the D61 v1 predicate: yes. E5's verdict is determined by the live worktree registry and E6's by the worktree readme-map + worktree script, not by the measured `rev`; any claim "E5/E6 evaluated at rev `R`" (plan.md, wave-1 report line 29) is not supported by the probe. E5/E6 therefore cannot certify anything about the revision's registry/README state.
- Does it alone produce `DOCTRINE61_HELD`? No — E1/E3/E4 still fail on the honest build (regex/column defects, counterexamples 1/3/4), so HELD additionally requires the off-Registry phantom row + fabricated capture (wave-1 a5 composition: 2+3+4+README row → HELD 6/6). Subcase 5 is one of several jointly-necessary falsifiers, and it is independently confirmed here.
- Residual risk / unverified: I did not re-run against the **real lane worktree** (`/home/vgpnk/Projects/shokunin/kumitate-shokunin`, which carries uncommitted worktree mutations) — wave-1 receipt `ctl-c2-critic-a4-e5-worktree-not-rev.txt` already exercised that via the same probe; my scratch runs reproduce the mechanism on identical frozen-probe code with fresh revs. The readme-map "unpinned/uncovered" base drift at `be4a820` (pre-existing lane state) is not part of the defect; it only made base E6 MISS before the entry fix, which is itself an example of worktree state leaking into E6.
