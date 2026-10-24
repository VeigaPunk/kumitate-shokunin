# MutMapPinDrop — mutation probe: drop one middle `covered` entry (round 57, C1 `readme-map`)

Seat: `MutMapPinDrop` (mutation-tester, leaf). Item: *drop one middle `covered` entry in the
scratch registry; verify DRIFT `unpinned` for exactly that path and no others.*
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only; no production byte changed).
Rev under test: **`8c6f5b017d149b18134917378cdbed3b492d8e89`** (lane HEAD, not moved).
Tested artifact blobs at that rev: registry `d7e017cf616017824c3b384e618334fc37d44a2a`,
gate `d276b294c93efbc18aed118afa9314934009fadc` — **byte-identical to the plan's measured R1
`f0dc6d11…`** (both blob ids verified equal at R1 and HEAD), so the mutated bytes are the
measured close bytes, not a later working-tree variant.
Date: 2026-10-24. No tool installs were made (none needed); pacman untouched.

## Mutant

One-line deletion in a scratch extraction of the rev (`git archive 8c6f5b0 | tar -x`); smallest
behaviour-bearing point, no re-serialization:

| field | value |
|---|---|
| registry | `.ufo/pins/readme-map.json` (scratch copy only) |
| operation | delete exactly `    "lessons/round-23.md",` (file line 71) |
| why that entry | index 67 of 135 = arithmetic middle of a sorted `covered` set (52 knowledge + 83 lessons) |
| preconditions checked | `corpus/lessons/round-23.md` present; exactly 1 README row for it |
| mutant sha256 | `b26683ee318d7c1b0e7b1385718910074333b4be9fe1a5c647bf775f0bace6f2` |
| covered length | 135 → 134 |
| diff | single deletion; only neighbourhood context lines (`@@ -68,7 +68,6 @@`) |

## Detector (same bounded command on all three byte states)

`node <scratch>/scripts/readme-map.mjs` — the gate's default paths resolve `LANE` to the scratch
root, so registry, README and corpus all come from the extraction; no `--registry` shortcut.
Frozen instrument confirmed: scratch `scripts/readme-map.mjs` sha256
`058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` = `counter-pins.json`
round-57 `readme-map` pin = SCORECARD `pin.readme-map`.

| state | stdout (last line) | exit | sha256 of registry |
|---|---|---|---|
| 1 pristine | `README_MAP: CLEAN files=135 rows=135 covered=135` | 0 | `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c` |
| 2 mutated | `README_MAP: DRIFT files=135 rows=135 covered=134 bad=1 first=unpinned:lessons/round-23.md` | 1 | `b26683ee318d7c1b0e7b1385718910074333b4be9fe1a5c647bf775f0bace6f2` |
| 3 restored | `README_MAP: CLEAN files=135 rows=135 covered=135` | 0 | `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c` |

stderr empty in all three runs. `mutant_notes=0` (the gate prints `bad.slice(1)` as
`README_MAP: note` lines) and `bad=1` together prove the drift list holds exactly one item, and
`first=` names it. Independent re-derivation (own `readdirSync`/row-regex/set-difference, not the
gate's code): `unpinned:["lessons/round-23.md"]`, `stale:[]`, `uncovered:[]`, `orphan:[]`,
`dup:[]`, `independent_bad_total=1` — the "no others" half is corroborated twice.

Scratch gate selftest in the same extraction: `README_MAP_SELFTEST: PASS (14/14)`,
`VERDICT: PASS`, exit 0.

## Verdict

**KILLED.** The `unpinned` term (gate lines 195–197: live file ∉ `covered`) fires for exactly the
dropped path, `DRIFT` exit 1, and no other file or drift class enters the verdict. The pristine
baseline was green (`CLEAN 135/135/135`), so the kill is attributable to the mutation.
Whole-claim corroboration at the same rev: `node .ufo/waves/round-57/probe/attest57-probe.mjs
/home/vgpnk/Projects/shokunin/kumitate-shokunin 8c6f5b0…` → `ATTEST57_HELD held=10/10 checks=10 …
rule=A57 version=v1`, exit 0, B1–B10 all PASS (matches the plan's close reading).

## Restoration evidence

- restored bytes copied back from `build/MutMapPinDrop/pristine/readme-map.json`;
  `cmp -s` = **identical**, `diff -u` = **0 lines**, sha256 back to `9ef0cf6e…`.
- restored run reproduces the pristine line exactly, exit 0.
- lane registry never written: before/after sha256 both `9ef0cf6e…` = blob `d7e017c` at HEAD;
  `git diff` on that path empty. All writes live under
  `.ufo/waves/round-57/build/MutMapPinDrop/` (scratch extraction, copies, logs).

## Coverage finding (observation, not a contract change)

- Gate selftest case `unpinned` (case 7) does exercise drop-one-of-two `covered` on fixtures but
  asserts only `includes('unpinned:lessons/b.md')`; case 8 (`empty-covered`) asserts only
  `includes('unpinned:')`. Frozen A57 B3 arm (e) mutates the real registry only to `covered=[]`.
  **No frozen artifact asserts the multiplicity** (`bad=1`, no co-emitted classes) that this probe
  checked; the gate satisfies it today, but a regression that appended spurious extra drift
  alongside `unpinned` would pass both case 7 and B3(e).
- Source-located (static read, `[INFERENCE]` about runtime): `scripts/proxy-check.mjs` computes C2
  from the README row count and the corpus census and from 4th-cell `yes` flags
  (`proxy-check.mjs:727-734`); it never reads `.ufo/pins/readme-map.json`. A registry drop leaves
  `files=135 rows=135` intact, so the count-only proxy is blind to exactly this defect — the
  motivating gap the bimap closes.
- Limit: mutation applied to a scratch extraction, not to a cloned Git history; registry/README/
  corpus reads only. Probe is a single case (one middle entry); no claim is made here about
  `lessons` vs `knowledge` asymmetry.

## Reproduce

```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-57/build/MutMapPinDrop
./harness.sh        # rewrites scratch/, logs/1-pristine.out 2-mutant.out 3-restored.out, run.log
```

Evidence files: `logs/run.log`, `logs/1-pristine.out[.err]`, `logs/2-mutant.out[.err]`,
`logs/3-restored.out[.err]`, `logs/4-selftest.out`, `logs/5-independent-derivation.out`,
`logs/6-attest57-at-8c6f5b0.out`, `logs/diff-pristine-mutant.txt`,
`pristine/`, `mutant/`, `restored/readme-map.json`, `harness.sh`.
