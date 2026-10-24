# ExecMapOrphan — `readme-map` orphan-row / stale-covered deletion probe (round 57)

Axis: operability (C1 capability `readme-map`, contract `kumitate-readme-map-v1`).
Item: in a scratch copy, delete one corpus file; run the gate; capture DRIFT
`orphan-row:<path>` exit 1 and `stale-covered` for its pin. Access date 2026-10-24.

Judged revision: lane HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89` ("round-57:
idempotence at bookkeeping tip c42afe1c — A57 10/10, D57 5/5"), extracted with
`git archive` — never the dirty working tree, never the lane. HEAD was identical before
and after every run (`09-head-unchanged.txt`: `head_unchanged=yes`).
Evidence root: `.ufo/waves/round-57/build/ExecMapOrphan/` (driver, 14 numbered captures,
sealed `11-manifest.txt`, retained minimal mutant harness `scratch/tree/`).

## Result

**CORROBORATED.** Deleting exactly one corpus `*.md` in the scratch extraction yields the
contract's defect pair and exit code, with the orphaned row named in `first=` and the pin
named in the `note` line. Production stayed CLEAN throughout.

## Mutant

Target: `corpus/lessons/round-56-verifier-spotcheck.md` — the R56-V3 spotcheck lesson that
the plan cites as the motivating defect class ("landed without a README row"), so the
deletion probes the exact row/file/pin triple C1 was acquired for.

Pre-mutation triple present in the extraction (`04-premutation-bimap.txt`):

```
file at extraction: present
b9cb18a087220231c76d201ef37d3a1deb422720402890f80b33553ac2ba7ef1  …/corpus/lessons/round-56-verifier-spotcheck.md
168:| `lessons/round-56-verifier-spotcheck.md` | Round-56 … (row present)
version=1 covered_n=135 pin_present=true
knowledge_md=52 lessons_md=83
```

Mutation is a single `rm` of that one file (`05-mutation.txt`):

```
$ rm -- …/scratch/tree/corpus/lessons/round-56-verifier-spotcheck.md
rm_exit=0
file after rm: GONE
knowledge_md=52 lessons_md=82
README untouched: 7575614804acc82f309d2a763af2b7572a2f81ee98520f3b0517ee187d97205d
registry untouched: 9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c
```

README and registry hashes equal the committed inputs (`75756148…`, `9ef0cf6e…`), so the
labels below are computed live from row-vs-file membership, not read off mutated input.

## Observed (pristine baseline first, same scratch tree)

Baseline, unmutated extraction (`03-baseline-gate.txt`):

```
$ cd …/scratch/tree && node scripts/readme-map.mjs
README_MAP: CLEAN files=135 rows=135 covered=135
exit=0
```

Instrument sanity on the same bytes (`03b-selftest.txt`): `README_MAP_SELFTEST: PASS
(14/14)`, exit 0. (The selftest arm is another seat's item; run here only to establish the
extracted gate was executable before mutation.)

Mutated (`06-mutated-gate.txt`):

```
$ cd …/scratch/tree && node scripts/readme-map.mjs
README_MAP: note stale-covered:lessons/round-56-verifier-spotcheck.md
README_MAP: DRIFT files=134 rows=135 covered=135 bad=2 first=orphan-row:lessons/round-56-verifier-spotcheck.md
exit=1
```

Both required signals fire on the same path, one per side of the bimap: the row lost its
file (`orphan-row`, carrying `first=`) and the registry pin outlived its file
(`stale-covered`, emitted as the one `note`). `bad=2` and `files=134` show the gate counted
the population drop instead of failing open. No `uncovered`/`unpinned`/`duplicate-row`/
`format-unmapped` lines appear: a pure deletion adds no unknown file and no second row.

Determinism: an immediate rerun is byte-identical (`06b` sha256 = `06` sha256
`9576888d…`; `06c-rerun-diff.txt` empty, diff exit 0). After pruning the extraction to a
minimal 137-file harness (gate + README + corpus + registry) the same command still prints
exactly the two lines above (`13-pruned-rerun-gate.txt`, diff vs `06` empty) — the signal
does not depend on other committed files.

## Independent recomputation (not the gate's code)

`07-independent-recompute.mjs` re-parses rows (`^\|\s*`(knowledge|lessons)/…`\s*\|`),
lists both corpus directories and reads the registry, importing nothing from the gate.
On the mutated tree (`07-independent-recompute.txt`, `13c-pruned-indep.txt`) it reports:

```json
{"version":1,"files":134,"rows":135,"covered":135,
 "orphan_row":["lessons/round-56-verifier-spotcheck.md"],
 "stale_covered":["lessons/round-56-verifier-spotcheck.md"],
 "uncovered":[],"unpinned":[],"duplicate_row":[],"verdict":"DRIFT"}
```

Elementwise agreement with the gate, not just cardinality: exactly one orphan row and
exactly one stale pin, same path, no residual sets. `08-assertions.txt` scores 31/31
assertions `VERDICT: PASS 31/31`, covering rev/extraction identity, baseline CLEAN, the
exact DRIFT line, the exact note line, byte-unchanged inputs, set-exact recomputation and
HEAD stability.

## Relation to the frozen counter (A57)

A57 B3(b) arms `orphan-row` by deleting the file behind `rows[0]` and asserts only
`exit=1 && stdout.includes('orphan-row')` (`attest57-probe.mjs:184,204-209`). This seat's
move is the same class with the pin side asserted: the `stale-covered:<path>` note and the
path-attributed `first=orphan-row:<path>` are both captured over committed bytes. It
corroborates B3's mechanism; it does not alter or re-derive the predicate. No counter,
registry, or production byte was edited.

## Production purity / boundary

- Lane gate after the probe (`10-lane-production-gate.txt`):
  `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0 — the lane corpus was never
  mutated.
- `git status --porcelain -- corpus scripts .ufo/pins README.md SKILL.md SCORECARD.md LOG.md
  PROVINCE.md` is empty (`12-lane-untouched.txt`, `14-final-state.txt`); tracked diff is
  only the pre-existing `M .ufo/waves/round-57/w1/swarm-registry.json` from wave
  bookkeeping, not this seat.
- HEAD unchanged; no commit, push, jj invocation (jj would snapshot the worktree), git
  mutation, pacman call, or install. Writes are confined to
  `.ufo/waves/round-57/build/ExecMapOrphan/` and this report.
- The 56 MB / 3625-file extraction was pruned to the 2.2 MB / 137-file mutant harness; the
  full extraction is re-creatable with `bash 00-driver.sh` at the same rev.

## Risks / limits

- `first=` ordering is code-order dependent, not contractual: `evaluate()` pushes
  `orphan-row` at line 184 and `stale-covered` at line 193, so this mutant reads
  `first=orphan-row:…`. A refactor that reorders accumulation could leave a DRIFT
  exit 1 with `first=stale-covered:…`. Any future assertion of this seat's output should
  pin membership (both labels plus path) rather than the `first=` token alone.
- The `note` lines are `bad.slice(1)`: with exactly two defects exactly one note prints. A
  checker that expects `note stale-covered` unconditionally would misread a different
  mutant; this probe's `bad=2` is load-bearing.
- One-file deletion only: `uncovered`/`unpinned` (rename/append mutants) are other seats'
  arms; this seat did not exercise a knowledge-side deletion (symmetric by the same loop,
  but not measured here).
- Row-cell semantics stay unvalidated by the gate (a stale description/pointer still reads
  CLEAN) — contract-level limit, already noted by the C1 claim.
- Provenance disclosure: the first driver version failed before any gate run — `tar -x -C`
  into a not-yet-created directory gave `extract_exit=2`, and the run cascaded because the
  driver lacked fail-fast. That attempt's logs were discarded, not retained; the driver was
  rewritten with `mkdir -p` and per-stage assertions, and every capture above is from the
  successful run (driver exit 0, `DRIVER: COMPLETE`).

## Files changed

None in production. Created: `.ufo/waves/round-57/build/ExecMapOrphan/` (driver, evidence,
manifest, retained mutant harness) and this report. No install was needed or made.

## Blockers

None.
