# ExecMapSchema — round 57 w1: `readme-map` registry-schema FAIL-CLOSED controls

Seat: `ExecMapSchema` (leaf, no dispatch). Item: "Run scratch controls for malformed JSON,
version 2, `covered` not an array, and a `covered` entry outside `knowledge|lessons/`; capture
each FAIL-CLOSED exit 2."

Claim binding: C1 operability / `kumitate-readme-map-v1`, counter `A57` (rule v1), arm **B4(a)–(d)**
of `.ufo/waves/round-57/probe/attest57-probe.mjs`. Axes: operability + coverage.

Revisions (read-only; HEAD never moved):

| fact | measured |
|---|---|
| base `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` | `scripts/readme-map.mjs` **ABSENT** (`git show` exit 128) |
| R1 integration tip `f0dc6d11` | gate sha256 `058e5033…2c7727` |
| tip `8c6f5b0` (HEAD during this seat) | gate sha256 `058e5033…2c7727` (identical bytes) |
| `.ufo/pins/counter-pins.json` round 57 `readme-map` | `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` — matches worktree and both revs |
| registry `.ufo/pins/readme-map.json` | sha256 `9ef0cf6e…585c729c`, version 1, `covered` 135 sorted-unique |
| `corpus/README.md` | sha256 `75756148…d97205d`; corpus `knowledge` 52 + `lessons` 83 = 135 `*.md` |

## Verdict

**Corroborated — no falsification.** All four assigned arms print the `FAIL-CLOSED` line and exit
**2** on byte-identical copies of the committed gate, at both named revisions and on the scratch
copy: 4/4 expected exit 2, 4/4 distinct reason strings matching the specific `loadRegistry`
branches (committed lines 94, 100, 103, 108). The same argv shape with the committed registry is
`CLEAN … exit 0`, so exit 2 is a property of the fixture, not of the harness.

## Assigned arms (measured, full commands in `out/controls-*.txt`)

Gate invocation for every arm:
`node <tree>/scripts/readme-map.mjs --registry <fixture> --readme <tree>/corpus/README.md --corpus <tree>/corpus/knowledge --corpus <tree>/corpus/lessons`

| arm | fixture (sha256) | stdout | exit | R1 `f0dc6d1` | tip `8c6f5b0` | scratch copy |
|---|---|---|---|---|---|---|
| malformed JSON | `c1-malformed-json.json` `3bc4fa19…d1cfc98` raw bytes `{ "version": 1, "covered": [ "knowledge/a.md",\n` | `README_MAP: FAIL-CLOSED reason=registry not valid JSON` | **2** | 2 | 2 | 2 |
| version 2 | `c2-version-2.json` `bcc91fa1…b685806` — committed `covered` (135), `version:2` | `README_MAP: FAIL-CLOSED reason=registry version 2 !== 1` | **2** | 2 | 2 | 2 |
| `covered` not an array | `c3-covered-not-array.json` `97ae7ec5…ae262f` — `covered` is the string `"knowledge/agent-isolation-substrates.md"` | `README_MAP: FAIL-CLOSED reason=registry covered not an array` | **2** | 2 | 2 | 2 |
| `covered` entry outside `knowledge\|lessons/` | `c4-covered-outside.json` `8a3cf5f8…18d8362` — committed `covered` + `"scripts/readme-map.md"` (added exactly one entry, none removed) | `README_MAP: FAIL-CLOSED reason=covered entry malformed: "scripts/readme-map.md"` | **2** | 2 | 2 | 2 |

stdout for each is one line; **no `files=`/`rows=`/`covered=` score line is emitted** — fail-closed
never takes a score. stderr empty for all four.

## Controls run — 22 cases × 3 trees, 22/22 each

Tree selector: `--root scratch` (default, byte-identical copy), `--root rev-f0dc6d1`,
`--root rev-8c6f5b0`. `CONTROLS: 22/22` with runner exit 0 on all three.

- `c0-valid` positive control: committed registry on the same argv → `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0.
- Same-guard shapes the gate's hermetic selftest does **not** exercise, all exit 2 with correct
  reasons: duplicate entry (`covered entry duplicated: …`), non-string entry (`covered entry
  malformed: 7`), `covered` key absent (`registry covered not an array`), `covered: null` (same),
  `covered: {}` (same), probe-exact string `"x"` (same).
- Namespace-predicate boundaries, all exit 2: nested `knowledge/sub/a.md`, traversal
  `lessons/../knowledge/…`, root `README.md`, capitalized `Knowledge/…`, `lessons/x.markdown`,
  `lessons/x.md/`.
- Fail-closed siblings, all exit 2: README absent (`README unreadable: ENOENT`), corpus dir absent
  (`corpus dir unreadable: …/no-such-dir/lessons (ENOENT)`).
- Top-level registry shapes, all exit 2: array (`registry not an object`), string
  (`registry not an object`), path is a directory (`registry not a regular file`).

## Mutation controls (`out/mutants.txt`, `out/*.diff.txt`)

Each mutant is a private copy of the R1 read-set tree with one surgical change to
`scripts/readme-map.mjs` (anchors matched exactly once; gate sha256 recorded per mutant). Baseline
exits are the unmutated measurements above.

| mutant | change | baseline → mutant |
|---|---|---|
| m2 version guard inverted `!== 1` → `!== 2` | accepts a version-2 registry | c2: 2 → **0** `README_MAP: CLEAN files=135 rows=135 covered=135` (a version-2 registry would silently score) |
| m4 per-entry scope guard deleted (`typeof p !== 'string' \|\| !COVERED_RE.test(p)` → `typeof p !== 'string'`) | out-of-namespace entries load | c4: 2 → **1** `DRIFT … stale-covered:scripts/readme-map.md`; c9: 2 → 1; c11: 2 → 1 |
| m1 namespace regex weakened to `/^(knowledge\|lessons)\//` | drops extension/filename constraint | c4/c11/c13 stay 2 (still outside namespace); c9 2 → 1, c14 2 → 1, c15 2 → 1 (`stale-covered` DRIFT) |
| m3 `Array.isArray(doc.covered)` guard deleted | no array-shape check | c3 2 → **2 but different branch** (`covered entry malformed: "k"`), c3b (probe-exact `"x"`) 2 → **2 but `covered entry malformed: "x"`**, c12 (`{}`) 2 → **1** uncaught `TypeError: doc.covered is not iterable` at line 103 |

Both m2 and m4 are load-bearing and would be caught by `A57` B4(b)/B4(d) and by selftest cases
10/11 (exit moves off 2). m1 never reaches `CLEAN` on any probed shape, so it is a
FAIL-CLOSED→DRIFT classification weakening, not a scoring hole.

## Findings (coverage; advisory, nothing applied)

1. **Exit-code-only judging under-discriminates arm B4(c).** The frozen probe judges
   `r.status === 2` (`attest57-probe.mjs:247-266`) and the gate's selftest judges `r.status === 2`
   for its five fail-closed cases (`scripts/readme-map.mjs:299,306,312,319,326`) — neither reads the
   reason string. Measured consequence: deleting the `Array.isArray(doc.covered)` guard leaves the
   probe's own fixture shape (`covered = 'x'`) at exit 2, because a string is iterable and its first
   character fails the per-entry regex. The arm passes against a gate missing the guard. An object
   shape (`{}`) does discriminate (exit 1, `TypeError`), but no committed case uses one.
2. **Selftest leaves most registry-schema branches untested.** Its five fail-closed cases (9–13:
   malformed JSON, version ≠ 1, entry outside the namespace, README absent, corpus dir absent)
   never exercise: registry not an object (array/string), registry not a regular file (directory),
   `covered` not an array (string / object / absent / null), duplicate entry, non-string entry.
   All of these measured exit 2 with the committed gate, so behaviour is correct — the gap is in
   the frozen suite, not in the gate.
3. **B4(d) and selftest case 11 cannot see m1.** Both use `scripts/…md`, whose first segment is
   already outside the namespace, so a regex that accepted any `knowledge|lessons/…` path still
   rejects them. Only nested/extension shapes expose m1, and those degrade to DRIFT exit 1, never
   CLEAN.

A strictness-only future amendment could pin the per-arm reason string and add the untested shapes;
this seat performed no production edit (lane files are read-only for this wave).

## Evidence inventory — `.ufo/waves/round-57/build/ExecMapSchema/`

- `out/controls-rev-f0dc6d1.txt` `9459afc8a9bb`, `out/controls-rev-8c6f5b0.txt` `ae6ddb9cc8b2`,
  `out/controls-scratch-copy.txt` `920b78da5107` — per case: exact spawned argv, fixture
  sha256, stdout, stderr, exit, CONTROL-OK.
- `out/controls-rev-f0dc6d1.json` `bb3f86db4660` (machine-readable, same content), `out/mutants.txt`
  `6562b2109f73`, `out/mutants.json` `9c676b9b1c22`, `out/m1..m4-*.diff.txt` (`edcc3e5f999e`,
  `ebf1d35ae93c`, `a71d6c90970e`, `9ba836d6427e`), `out/m3-c12-crash.txt` `f55918a0751e`,
  `out/provenance.txt` `f87c7cf9aa3d`.
- Runners: `run-controls.mjs` `28803fcffa54` (parameterised `--root`), `run-mutants.mjs`
  `da1e9c1eee0c`, `run-provenance.mjs` `73d80514ce61`. Fixtures under `scratch/`; the earlier
  12-case transcripts are archived under `out/superseded/`.
- Revision trees `rev-f0dc6d1/`, `rev-8c6f5b0/` extracted with `git archive <rev>` and pruned to
  the read set; integrity: `ls_tree_entries=140 matched=138 pruned=2 mismatched=0` per tree
  (pruned only `corpus/QUALITY.md`, `corpus/SOURCES.md`), every retained file blob-identical.
- `scratch/` copy: gate sha256 equals the pin; the gate never wrote — extracted
  `corpus/README.md` and `.ufo/pins/readme-map.json` sha256 unchanged after all runs
  (`unchanged_by_runs=true`).
- Lane integrity: `git status --porcelain -- scripts .ufo/pins corpus` → **CLEAN (no entries)**.
  No writes to `.ufo/state/*`, `.ufo/watchdog.log`, fleet files, sibling repos, jj or the Git
  index. No commits, no installs, no pacman (host-wide pause respected; none needed).

## Risks / limits

- Measurements are of the gate's registry-load path only; the full `A57` verdict is another seat's
  item and was not run here.
- The string-iteration behaviour cited in finding 1 was measured on the *mutant*; the committed
  gate rejects non-arrays before iteration (c3/c3b/c12 all exit 2 on the unmutated gate).
- The four assigned arms use scratch fixture registries outside the lane plus revision-extracted
  README/corpus; they do not mutate any committed byte.
- m1/m3 observations are coverage findings, not requests to change the gate in this wave.
