# ExecProxyCounts — kumitate round 57 / w1 (leaf, advisory)

Item: `ExecProxyCounts` — run `proxy-check --strict` at the close rev and capture
`PROXY: MATCH` with `A=90 C=27 C2=135/135`; run `readme-map` against the BASE rev's
tree (git archive) and confirm it reads DRIFT
`uncovered:lessons/round-56-verifier-spotcheck.md` (the R56-V3 red-before).
Axes claimed by the round: operability + coverage. This report is data, not a verdict;
nothing in the lane was written except this file and
`.ufo/waves/round-57/build/ExecProxyCounts/`.

**Both halves CORROBORATED at the exact revisions named in the plan.** Two independent
corroborations were added (arithmetic without the gate's code; a single-variable cause
probe for an incidental operability hazard found while measuring — F4 below).

## Revisions (read-only git, no HEAD move, no mutating command)

| role | rev | full sha | type |
|---|---|---|---|
| close R1 (integration tip) | `f0dc6d1` | `f0dc6d1160e66af65355bd353665adac22bbf4a9` | commit |
| committed tip (bookkeeping) | `8c6f5b0` | `8c6f5b017d149b18134917378cdbed3b492d8e89` | commit |
| BASE (round-56 verifier-spotcheck tip) | `7178bfd` | `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` | commit |
| origin tree src-rev (from `.ufo/pins/origin.json`, unchanged) | — | `31c465f15669f744848bd9f5d56191c5085670f7` | pin |

Trees were materialised with `git archive --format=tar <rev> | tar -x -C <build>/...`
under `.ufo/waves/round-57/build/ExecProxyCounts/` (`rev-f0dc6d1/`, `base-7178bfd/`,
`rev-8c6f5b0/`). No checkout, no worktree, no index or jj mutation.

Byte receipts:

```
f0dc6d1 = f0dc6d1160e66af65355bd353665adac22bbf4a9 (commit)
8c6f5b0 = 8c6f5b017d149b18134917378cdbed3b492d8e89 (commit)
7178bfd = 7178bfd3643c0fac74c8eb637cd6e985faadd0cf (commit)
base corpus/README.md  sha256=87eff612b6f5486fde067844455ca62a8e0efaa6fe6abe5ceeab01a0d0812d25 bytes=64630
close corpus/README.md sha256=7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d bytes=66495
close scripts/readme-map.mjs sha256=058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727
close scripts/proxy-check.mjs sha256=816a8650ba6a53c2abf20446021c3c19563747c0b8ac659d1c0695c3d84b2200
base scripts/proxy-check.mjs  sha256=b9e877143abe6f3241374c3582f6295641ccc4d74b64838f3d9b641b2dccc589
lane scripts/readme-map.mjs == close? IDENTICAL
```

## C1 — close rev: `PROXY: MATCH` with the declared counts

Instrument and subject both taken from the close rev's own bytes
(`node <close>/scripts/proxy-check.mjs --self <close> --strict`), so neither the
scorecard nor the script is a sibling's newer copy.

```
$ node .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1/scripts/proxy-check.mjs --self .ufo/waves/round-57/build/ExecProxyCounts/rev-f0dc6d1 --strict
PROXY: MATCH (A=90 C=27 operability=9; C1=19/19 C2=135/135 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit=0
```

Re-run with identical bytes (reproducibility, same line, exit 0). Same command with
`--json` (`proxy-close-f0dc6d1.json`, stderr empty):

```
verdict=MATCH exitCode=0 ok=true strict=true errors=0 warnings=0
A=90 C=27 operability=9 C1=19/19 C2=135/135 coverage=10
S=88/88 R=92/92 K=53/53
pinsMatched=6 pinsTotal=6 srcRev=31c465f15669f744848bd9f5d56191c5085670f7 findings=[]
```

The committed tip `8c6f5b0` (archive, own script bytes) reproduces the same line and
exit 0 — the bookkeeping commits did not move any counted term:

```
PROXY: MATCH (A=90 C=27 operability=9; C1=19/19 C2=135/135 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
```

Declared stanza at close (`SCORECARD.md`): `A=90`, `C=27`, `C1=19`,
`C1_total=19`, `C2=135`, `C2_total=135` — computed agrees on every term, and
`## Axes` agrees (`compareAxes` produced zero findings).

### Independent arithmetic (no gate code)

```
### close rev f0dc6d1
corpus *.md under knowledge+lessons: 135
README map rows '| `knowledge/...`' / '| `lessons/...`': 135
### base rev 7178bfd
corpus *.md: 133     README map rows: 132
SKILL.md lines matching ^\s*- \[ : 27
base rows=132 base files=133
close rows=135 close files=135
delta files=2 delta rows=3
```

`delta rows=3` is exactly the round's shape: 2 new corpus files
(`knowledge/worker-heartbeat-liveness.md`, `lessons/round-57.md`) plus 1 repair row
(the R56-V3 `round-56-verifier-spotcheck` row). `C2=135/135` and `C=27` are therefore
not artefacts of the gate's own derivation.

## C2 — base tree: the R56-V3 red-before

The `readme-map` instrument does not exist at base (receipt below), so the base tree is
the *subject* and the close-rev script is the instrument. Two registries were used:
the frozen close registry (135 covered) and a base-consistent filter of it
(133 covered = close set minus the two round-57 additions; derived and stored at
`base-consistent-registry.json`, `registry-diff.txt` shows no other difference).

```
### A) close rev f0dc6d1, own registry
$ node <close>/scripts/readme-map.mjs --registry <close>/.ufo/pins/readme-map.json --readme <close>/corpus/README.md --corpus <close>/corpus/knowledge --corpus <close>/corpus/lessons
README_MAP: CLEAN files=135 rows=135 covered=135
exit=0

### B) BASE 7178bfd tree, close-rev frozen registry
README_MAP: note stale-covered:knowledge/worker-heartbeat-liveness.md
README_MAP: note stale-covered:lessons/round-57.md
README_MAP: DRIFT files=133 rows=132 covered=135 bad=3 first=uncovered:lessons/round-56-verifier-spotcheck.md
exit=1

### C) BASE 7178bfd tree, base-consistent registry (133 covered)
README_MAP: DRIFT files=133 rows=132 covered=133 bad=1 first=uncovered:lessons/round-56-verifier-spotcheck.md
exit=1
```

Run C is the decisive one: with every registry entry present in the base tree, the
**sole** defect is `uncovered:lessons/round-56-verifier-spotcheck.md`. Run B's other two
bad entries are the anticipated `stale-covered` notes for files the round adds, not lane
defects. The base README genuinely has no row for that file and the close README does:

```
row for round-56-verifier-spotcheck at BASE: (absent)
row for round-56-verifier-spotcheck at CLOSE: 168:| `lessons/round-56-verifier-spotcheck.md` | Round-56 non-author closure … (repaired in round 57 by the `readme-map` gate) | …
```

The live lane working tree also reads `README_MAP: CLEAN files=135 rows=135 covered=135`
(exit 0), so the repair landed in the tracked corpus, not only in the archive.

### K1 do-nothing receipts at base

```
ABSENT at base: scripts/readme-map.mjs
ABSENT at base: .ufo/pins/readme-map.json
$ node <base>/scripts/readme-map.mjs --selftest   → node loader error, exit=1
```

And the base's own proxy-check (base script bytes, base tree) reproduces the plan's
frozen base receipt — the class the new gate makes mechanical:

```
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=132 computed=133 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY: DRIFT (… ; src-rev=31c465f15669)
exit=1
```

## F4 — incidental operability hazard (new observation, not a round-57 defect)

Running the *same* instrument against the **live lane working tree** (`--self .`, i.e.
default) does not MATCH — and the cause is wave evidence scratch, not lane content:

```
$ node scripts/proxy-check.mjs --strict      # live working tree, HEAD 8c6f5b0
PROXY  error  A_DRIFT  A: declared=90 computed=2884 delta=+2794
PROXY: DRIFT (A_DRIFT …; src-rev=31c465f15669)
exit=1
```

Mechanism, read from the code (`scripts/proxy-check.mjs:939`):
`const A = walkFiles(self).filter((r) => RE_RUNNABLE.test(r)).length;` — `A` counts
every `.mjs|.js|.sh|.py` under all of `--self`, and `walkFiles` prunes only `.git`
(`…/scripts/proxy-check.mjs` header + `walkFiles`). Untracked
`.ufo/waves/<round>/build/<Seat>/` trees (each seat's `git archive` extraction carries
~90 runnables) are therefore counted. Census at probe time, while siblings were still
extracting: 90 tracked runnables (`git ls-files '*.mjs' '*.js' '*.sh' '*.py'`) versus
4150 under the working tree, 4220 under `.ufo`, of which round-57 build scratch alone
accounted for ~2900 and rising (the number moved between two runs — a moving target, not
lane bytes).

Single-variable cause probe (own scratch copy only, cleaned afterwards):

```
### clean tip tree + ONE scratch .mjs under .ufo/waves/round-57/build/ProbeSeat/
PROXY  error  A_DRIFT  A: declared=90 computed=91 delta=+1
PROXY: DRIFT (A_DRIFT term=A declared=90 computed=91 delta=+1; src-rev=31c465f15669)
exit=1
### same tree after removing that one file
PROXY: MATCH (A=90 C=27 operability=9; C1=19/19 C2=135/135 coverage=10; … pins=6 match; src-rev=31c465f15669)
exit=0
```

Consequences for the wave convention (advisory, no production change made):
`proxy-check --strict` is only meaningful against a committed/clean tree; a wave that
parks `git archive` extractions or any `.mjs`/`.sh` under the lane flips the lane's own
H3 gate red for every concurrently running seat and for the orchestrator if it measures
the working tree. The plan's close sequence does measure the committed tree, so the
round's H3 receipt is not affected — but the next round should either measure an export
(as this seat did) or state the `--self` scope, otherwise a future `--strict` run against
the live lane will read `A_DRIFT` with a magnitude that depends on how many sibling
seats are mid-wave. This is pre-existing `walkFiles` semantics, not introduced by the
`readme-map` acquisition.

## Limits / risks

- `readme-map` **cannot** be run from base bytes; the red-before necessarily pairs the
  close instrument with the base subject. Stated here so the pairing is not misread as a
  base-rev self-test.
- Run B's `stale-covered` notes are expectation noise from the frozen 135-entry
  registry applied to a 133-file tree; run C removes it and keeps the same
  `uncovered:` defect, so the R56-V3 claim rests on run C, not on B.
- The live-tree `A_DRIFT` (F4) is a measurement-scope artefact; it is **not** evidence
  against the close-rev MATCH and must not be cited as a lane regression.
- Not in scope here, deliberately not duplicated: A57/D57 predicate runs
  (`ExecA57Close`/`ExecD57Close`), `readme-map --selftest` case count
  (`ExecMapSelftest`), mutant transcripts (`MutMap*`), sources census.

## Evidence inventory (all under `.ufo/waves/round-57/build/ExecProxyCounts/`)

```
4f1be6c150adc3579fdc19b28f7c41de22c6aa0f1cad0568e20da86913aa3934  proxy-close-f0dc6d1.txt
9ff9f22c7ab56e648b03fa96845fd0d5b72108d26244c3de9d7dd906bd3b7f95  proxy-close-f0dc6d1.json
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  proxy-close-f0dc6d1.json.err  (empty)
daccd71406feef3ab16b9941b76b0e17d5620b064508a12d8866e27ba6026676  proxy-base-and-lane.txt
ad99ac2edebe7b804b10b908ac5d88b90b71accd232cbe872c7694b311941eb0  readme-map-battery.txt
43e1bdcd12602bff73d3bd1498ca68ee84abf20a7f2f4919e37ae194d983762b  registry-diff.txt
39d5f5ca86f9395414d5b310b3f1f3e5a5835f04b3145c91c369c9ace9fa56b2  base-consistent-registry.json
bcb23caeb408f7618317e00a8c0475979ae1d15c598114a5049b612149997c58  terms-and-revs.txt
bbb0184f005c5056c3573316c410ae891a15ab1d439cefdf68116ff67a3435be  a-term-attribution.txt
6f88d4fe846ff3e76e82ccb4f8f5035f8fa1ae8f99364290f0821415721f0c2e  cause-probe.txt
2d2a14a76e0a6205d57172b5a5722e590ebfca5e8fde29e00f452b74d668c19f  final-receipts.txt
```

Tree extractions retained as the measurement subjects: `rev-f0dc6d1/` (56M),
`base-7178bfd/` (55M), `rev-8c6f5b0/` (56M). The throwaway
`rev-8c6f5b0-plus-scratch/` copy was deleted after its transcript was captured.

Tooling: none installed or updated this seat (no package manager invoked; all binaries
— `node` v24.x, `git`, coreutils — were already present).
