# CritC2UnrelatedRow — round 61 wave 2, C2 subcase 7 falsification

**Target:** `w1/CritControlC2.md` counterexample 7 ("Composition → HELD (strongest)", a5) — C2 subcase 7: JS POSIX-class row regex, shifted SOURCES cell indices, arbitrary bytes with a matching invented digest, lane-root census exit, mutable live census vs measured rev, README working-tree map, fake non-Registry row, partial-hash acceptance.

**Verdict: subcase 7 is REPRODUCED.** The frozen probe `doctrine61-probe.mjs` (D61 v1, committed at `.ufo/waves/round-61/probe/`) is driven to `DOCTRINE61_HELD held=6/6` with no `S195` line inside `## Registry`, a fabricated capture, and an un-re-grounded entry. Every named mechanism in subcase 7 was isolated and reproduced in scratch, with exact outputs below. **Yes — case 7 independently prevents D61 (v1) from verifying**: the HELD verdict is achieved by a build whose S195 row lives outside `## Registry`, whose capture bytes are invented, and whose census/README gates read the mutable live worktree, not the measured revision.

**Scratch:** `/tmp/kumitate-r61/CritC2UnrelatedRow/` — fleet root with `shokunin.conf` (empty LANES) + clone of lane @ `be4a820` (`kumitate-shokunin/`, git, 14 scratch commits `R1..R2`; lane jj/git index untouched). Node v24.21.0, gawk. No tools installed.

## 1. Headline reproduction — HELD 6/6 (a5 composition)

Forged rev `8d7acd68e868a4ecd843d8c60a3a3d198b8149e6` contains:
- `corpus/knowledge/temporal-worker-versioning-pinning.md` (5 lines: `source: S195 docs — invented bytes…`, `verified-at: 2026-10-25`, `recheck: 90d`, two body lines) — no located quote, no grounding.
- `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` = one fabricated line `factory-fabricated-capture-bytes-2026-10-25` (sha256 `fdf737eddc0bd4bb5fbdba9925fc846c11151463d6283f11e502c77d165ae17e`).
- Phantom row appended under `## Leads (unopened)` (outside `## Registry`), id cell `:S195:` so the probe's literal-class regex matches while census's E12 row-shape regex does not; 12 value-cells with an extra `—` column so probe reads `c[9]=mined c[10]=2026-10-25 c[12]=used-by`; pin `sha256 fdf737…` embedded in the anchor cell.
- README row for the entry + repair row for the pre-existing `lessons/round-60-verifier-spotcheck.md` drift; `.ufo/pins/readme-map.json` appended both entries (covering 147).

Run (counting command + `--census-root` fleet root):

```
$ node probe.mjs "$PWD" 8d7acd68e868a4ecd843d8c60a3a3d198b8149e6 --census-root "$PWD/.."
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=8d7acd68e868a4ecd843d8c60a3a3d198b8149e6 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 fdf737eddc0bd4bb5 sha=fdf737eddc0bd4bb
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
exit=0
```

No `S195` line exists inside `## Registry` (`$ git show 8d7acd…:corpus/SOURCES.md | sed -n '/## Registry/,/## Paths/p' | grep -c S195` → `0`). `git show …:corpus/SOURCES.md | grep -n '^|:S195:'` → line 247 (under `## Leads (unopened)`).

## 2. Named behaviors (isolated reproductions)

### 2.1 JS POSIX-class row regex (defect 1 first clause)
The regex `/^\|[[:space:]]*S195[[:space:]]*\|/` — JS treats `[[:space:]]` as class `{[, :, s, p, a, c, e}` followed by literal `]*`, i.e. exactly one `[ :s p a c e` char (plus optional `]`) must sit each side of `S195`. Node:

```
$ node -e 'const re=/^\|[[:space:]]*S195[[:space:]]*\|/;
["| S195 | src |","|S195|x|","|:S195:| x |","|paceS195| x |","|  S195 | x |"].forEach(c=>console.log(JSON.stringify(c),re.test(c)))'
"| S195 | src |" false
"|S195|x|" false
"|:S195:| x |" true
"|paceS195| x |" false
"|  S195 | x |" false
```

So an honest canonical `| S195 | …` row is never found → `E3 row-absent`; only a `|:`-prefixed row is probe-visible (census-invisible, see 2.6). Base run at `be4a820` confirms: `E3 MISS row-absent`, `E4 MISS pin= sha=`.

### 2.2 Shifted SOURCES cell indices (defect 1 second clause)
Probe line 17 reads `c[9],c[10],c[12]` from `row.split('|')`. A census-valid row has 11 value columns (NF=13 incl. leading/trailing empties): `c[8]=status c[9]=opened c[10]=recheck c[11]=used-by c[12]=""`. The probe's slots land on opened/recheck/trailing-empty. This is why a *real* S195 row can never pass E3, and why the forger must insert an extra `—` value cell to push `mined`/`2026-10-25`/used-by onto `c[9]/c[10]/c[12]` (see 2.3 receipt: `E3 MISS status=90d opened=sha256… used-by=` before alignment; `E3 PASS status=mined opened=2026-10-25` after).

### 2.3 Arbitrary bytes with matching invented digest (defect 3)
Fabricated `body.md` (one invented line, sha `fdf737ed…`, no Temporal source) pinned verbatim in the phantom row → `E4 PASS pin=sha256 fdf737eddc0bd4bb5 sha=fdf737eddc0bd4bb`. E4 binds pin↔worktree bytes; nothing ties them to a real source (no fetch, no re-grounding — E2 passes from `m`-flag anywhere-in-file regexes on the 5-line header file).

### 2.4 Lane-root census exit (defect 6)
Plan counting command (probe without `--census-root`) at the HELD rev — probe line 24 then calls census with `--root <lane>`:

```
$ node probe.mjs "$PWD" 8d7acd68e868a4ecd843d8c60a3a3d198b8149e6
 | E5 MISS exit=2
exit=1
```

Direct confirmation: `./sources-census.sh validate --root "$PWD" kumitate` → `ERROR: config not found: …/kumitate-shokunin/shokunin.conf` (exit 2) and the probe's lane-root call → `ERROR: unknown lane (not a dir, not in conf or root): kumitate` (exit 2). Only `--census-root` pointing at the fleet root yields `ok` exit=0 (2.1).

### 2.5 Mutable live census vs measured rev (defect 5)
Same rev `8d7acd68…`, worktree mutated; rev content untouched:

- SOURCES: appended malformed `| S900 | …` row at EOF → `kumitate E12 S900 row outside Registry section`, census exit=1 → `E5 MISS exit=1`, while `git show 8d7acd…:corpus/SOURCES.md | grep -c S900` → `0`.
- Entry deletion: `mv corpus/knowledge/temporal-worker-versioning-pinning.md …` → probe reads `E6 MISS mapped=true readme-map=1 README_MAP: note stale-covered:knowledge/temporal-worker-versioning-pinning.md` (exit=1) at the same rev; `git show …:corpus/README.md` still carries the row.
- `git checkout --` restore → HELD 6/6 again.

### 2.6 README working-tree map (defect 5, E6)
E6 mixes revision (`git show rev:corpus/README.md` → `mapped`) with worktree (`node scripts/readme-map.mjs` run with `cwd: lane`, which reads the live worktree registry/README/corpus). 2.5's deletion flips `readme-map` to exit=1 while `mapped=true` stays — the verdict depends on the mutable worktree, not the measured rev.

### 2.7 Fake non-Registry row (defect 2)
The `|:S195:|` phantom row under `## Leads (unopened)`: census's outside-Registry check only flags `^\|[ \t]*S[0-9]{3,}[ \t]*\|` (E12); `:` breaks that, so `validate --root <fleet> kumitate` → `kumitate ok …` exit=0. Probe finds the row (2.1) → `E3 PASS`. No Registry row exists.

### 2.8 Partial-hash acceptance (defect 3 third clause)
E4 line 21: `pin.includes(sha.slice(0,16))`. Forged rev `R2` (`6a04eef…`, pin `sha256 fdf737eddc0bd4bbdeadbeef…` — first 16 hex = real `fdf737eddc0bd4bb`, tail forged):

```
 | E4 PASS pin=sha256 fdf737eddc0bd4bbd sha=fdf737eddc0bd4bb
exit=0
```

## 3. Impact on D61 verification

Subcase 7 is not merely a counterexample: it is the **constructive proof** that D61 v1's `DOCTRINE61_HELD` is forgeable end-to-end, and that the frozen *negative* control `ctl-c2-unopened-row.txt` is vacuous (E4 reads `PASS: false` for absent rows too — base run showed `E4 MISS pin= sha=` for the honest starting state). Any v1 HELD must be rejected at face value; fixing E1–E6 per the w1 report's v2 recommendations changes the rule after seats scored, which the kill rule forbids ⇒ C2 fails as declared under v1 unless re-declared as a disclosed v2. The judge must not accept any v1 `DOCTRINE61_HELD` as provenance.
