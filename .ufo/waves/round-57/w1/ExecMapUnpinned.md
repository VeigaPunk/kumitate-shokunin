# ExecMapUnpinned — round 57 w1 (mutation-tester, C1 instrument)

Item: **ExecMapUnpinned** — in a scratch copy, remove one `covered` entry while the
corpus files and README rows stay intact; verify the gate reports DRIFT
`unpinned:<path>` and exits 1.
Scope: C1's instrument `scripts/readme-map.mjs` + `.ufo/pins/readme-map.json`.
C2 (`worker-heartbeat-liveness`) is out of scope for this seat.

**Verdict: corroborated, no counterexample found.** With exactly one `covered` entry
deleted (file present, README row present, every other byte of the corpus tree
identical), the gate prints

```
README_MAP: DRIFT files=135 rows=135 covered=134 bad=1 first=unpinned:lessons/round-56-verifier-spotcheck.md
```

on stdout and exits **1**, with empty stderr. The finding names precisely the removed
entry, `bad=1` shows nothing else fired, and `files=135 rows=135` shows the corpus
side of the bimap was untouched. The result reproduces byte-identically at the plan's
R1 integration tip. An exhaustive sweep over **all 135** pinned entries — each removed
alone — yielded `DRIFT … covered=134 bad=1 first=unpinned:<entry>` exit 1 in 135/135
cases, with an independent (non-gate) recomputation agreeing in every case.

## 1. Identity pinning

| item | value |
|---|---|
| lane | `/home/vgpnk/Projects/shokunin/kumitate-shokunin` |
| base (K1) | `7178bfd3643c0fac74c8eb637cd6e985faadd0cf` — `git cat-file -e 7178bfd:scripts/readme-map.mjs` → `fatal: path 'scripts/readme-map.mjs' exists on disk, but not in '7178bfd…'`; same for `.ufo/pins/readme-map.json`. Gate and registry absent at base (`09-rev-presence.txt`). |
| tested rev | `8c6f5b017d149b18134917378cdbed3b492d8e89` (lane HEAD, round-57 bookkeeping tip), extracted with `git archive HEAD \| tar -x` — never the working tree |
| second rev | `f0dc6d1160e66af65355bd353665adac22bbf4a9` (plan R1 integration tip), partial extraction of `scripts/readme-map.mjs`, `corpus/{README.md,knowledge,lessons}`, `.ufo/pins/readme-map.json` |
| gate sha256 | `058e503363363ca3d9dbfd7a82602bd1b7287dfc9936af25796834b8812c7727` — equals `.ufo/pins/counter-pins.json` round-57 entry `{"round":57,"name":"readme-map","path":"scripts/readme-map.mjs"}` and the lane working-tree file (git blob `d276b294…` == `HEAD:scripts/readme-map.mjs`). The bytes tested are the pinned instrument. |
| registry sha256 | `9ef0cf6ec794bc11d139382e703794b218ec4a38070a831f22fdce40585c729c` (blob `d7e017cf…`), 135 entries |
| baseline | `README_MAP: CLEAN files=135 rows=135 covered=135`, exit 0 (both revs) |
| isolation | all mutations in `.ufo/waves/round-57/build/ExecMapUnpinned/scratch/`; commands run with `cwd=scratch` so the gate's own `LANE` resolves inside the copy |

No pacman, no installs, no git/jj mutation, no commit. Lane tip re-read after the work:
still `8c6f5b017d149b18134917378cdbed3b492d8e89`.

## 2. Primary arm — one entry removed (exact bytes)

Victim chosen for the R56-V3 lineage: `lessons/round-56-verifier-spotcheck.md`, the
file whose missing README row is the drift class this gate makes mechanical.

Mutation applied to the scratch registry only — single array element deleted:

```
removed-lines=1 victim=lessons/round-56-verifier-spotcheck.md

--- 03-registry-pristine.json
+++ scratch/.ufo/pins/readme-map.json
@@ -127,7 +127,6 @@
     "lessons/round-55-verifier-spotcheck.md",
     "lessons/round-55.md",
-    "lessons/round-56-verifier-spotcheck.md",
     "lessons/round-56.md",
```

Files/rows intact at the same moment:

- `corpus/lessons/round-56-verifier-spotcheck.md` present, 8329 bytes.
- README row present, `corpus/README.md:168`: ``| `lessons/round-56-verifier-spotcheck.md` | Round-56 non-author closure …``.
- SHA-256 manifest of `corpus/README.md` + all 135 corpus `*.md` (136 lines) taken
  before and after the mutation: `diff` exit **0**, i.e. every file and the README are
  byte-identical (`06-files-rows-intact.txt`).

Gate run, streams split (`12-streams.txt`):

```
stdout: README_MAP: DRIFT files=135 rows=135 covered=134 bad=1 first=unpinned:lessons/round-56-verifier-spotcheck.md
        (1 line only — bad=1 emits no `note` lines)
stderr: (0 bytes)
exit=1
```

Restore of the pristine registry → `README_MAP: CLEAN files=135 rows=135 covered=135`,
exit 0 (`07-restore.txt`), and `diff -r scratch ref` against a fresh `git archive HEAD`
re-extraction was exit 0 over 3626 files on both sides — the gate wrote nothing and the
scratch is byte-identical to the rev (`10-no-writes.txt`, `13-restored-final.txt`).

Same arm at R1 `f0dc6d1` (`11-r1-mutant.txt`): baseline CLEAN 135/135/135 exit 0;
after removing the same entry, identical line
`DRIFT files=135 rows=135 covered=134 bad=1 first=unpinned:lessons/round-56-verifier-spotcheck.md`,
exit 1, with the file and row still present.

## 3. Exhaustive sweep — every pinned entry, not just one

`sweep.mjs` reads the pristine registry, validates its shape (`version=1`, 135 entries,
strictly increasing and unique, all inside `knowledge|lessons/`) and the live corpus
independently of the gate (135 files; `covered` set == live set; rows == live set; no
duplicate rows). Then, for each of the 135 entries, it writes a registry with exactly
that entry removed, runs `node scripts/readme-map.mjs --registry .ufo/pins/sweep-reg.json`
from the scratch root, and asserts:

- exit code 1,
- exactly one stdout line, equal to
  `README_MAP: DRIFT files=135 rows=135 covered=134 bad=1 first=unpinned:<entry>`,
- an independent set difference (live files minus mutant `covered`) equal to exactly
  `{entry}` — evidence computed without the gate's code.

Result (`08-sweep.txt`, 135 `arm mutant-…: PASS` lines):

```
arm sweep-all-entries: PASS
sweep: removed each of 135 covered entries once; 135 => DRIFT unpinned + exit 1, 0 escaped
arm empty-covered: PASS
arm restored-clean: PASS
arm scratch-registry-pristine: PASS
SWEEP_VERDICT: PASS   (exit 0)
```

Adjacent arms in the same run (context, beyond the named item):

| arm | mutation | observed |
|---|---|---|
| empty covered | `covered=[]`, files+rows intact | `DRIFT files=135 rows=135 covered=0 bad=135 first=unpinned:knowledge/agent-isolation-substrates.md`, 134 `note unpinned:` lines, exit 1 |
| control | pristine registry via `--registry` | `CLEAN files=135 rows=135 covered=135`, exit 0 |

Order-independence (`15-order-arms.txt`): `--corpus corpus/lessons --corpus corpus/knowledge`
baseline → CLEAN exit 0; `covered` reversed (complete set, unsorted) → CLEAN exit 0;
reversed **plus** `knowledge/gate-verdict.md` removed → `DRIFT … covered=134 bad=1
first=unpinned:knowledge/gate-verdict.md`, exit 1. The finding tracks pin membership,
not list order or CLI argument order.

## 4. Relationship to the frozen counter (why this is the scored class)

Static reading of the committed `attest57-probe.mjs` at the same rev:

- `arm` helper (lines 180-186) asserts `r.status === 1 && stdout.includes(expect)`; my
  mutant satisfies both for `expect='unpinned'`.
- **B3(e)** (lines 234-243) is the same class at maximum scale: `d.covered = []` with
  files present, expects `unpinned` — my empty-covered arm reproduces exactly that
  verdict (`bad=135`, exit 1).
- **B2** (lines 150-170) requires the gate to run `CLEAN` (exit 0, `files >= 130`,
  `files == rows`) and requires `covered.length >= 1`. Since §3 shows any single
  deleted covered entry forces `DRIFT` exit 1, a registry shrunk by one entry cannot
  satisfy B2 at a judged rev.
- **B10** (lines 392-414) recomputes `unpinned = files.filter(f => !covered.has(f))`
  independently and requires it empty and the gate `CLEAN`; the sweep's independent set
  difference is the same computation applied to the mutant, and it non-empty exactly
  for the removed entry.

I did not re-run the full A57 probe (other seats own that); the above is a static
cross-read plus the behavioral arms above.

## 5. Residual risks / coverage observations (advisory; nothing edited)

1. **The pin is memory, not immutability.** A coordinated edit that removes a `covered`
   entry *and* its README row *and* the corpus file yields a smaller CLEAN corpus — the
   gate has no tombstone and cannot distinguish a legitimate deletion from a silent
   unpin. The registry file is also unsigned/unhashed for *membership* (only the gate
   script is pinned in `counter-pins.json`), so anyone with registry write access can
   shrink the pin set; the gate then reports `unpinned` exit 1, which is detection, not
   prevention. Contract-conformant; recorded because "pinned set is append-only" is a
   convention, not an enforced rule.
2. **Gate accepts any `covered` order.** `covered` reversed is CLEAN (verified). The
   sorted-unique property is asserted only by the counter/probe and my sweep, not by
   the gate. Harmless (set semantics) but means a reordered registry would pass the
   gate and rely on B2/pin discipline to be caught.
3. **Selftest case 7 is a 2-file fixture** (one entry removed from a 2-file registry).
   It asserts the finding name and exit 1, not scale. My 135-entry sweep supplies the
   scale evidence, but it lives in this build dir, not in any committed check. A
   strictness-only hardening would be to assert `covered=<n-1>` and `bad=1` in the
   gate's own case 7.
4. Coverage bound: sweep executed against rev `8c6f5b0`; the primary arm additionally
   at R1 `f0dc6d1`. Base `7178bfd` has no gate/registry, so no mutant is meaningful
   there (K1 receipt above).

## 6. Files changed / artifacts

Lane production files, pins, registry, README, SCORECARD.md, LOG.md, SKILL.md,
PROVINCE.md, corpus/, git/jj state: **unchanged by this seat** (measured: lane tip
unchanged; `scripts/readme-map.mjs` and `.ufo/pins/readme-map.json` working-tree blobs
equal their `HEAD:` blobs). This seat wrote only its own auxiliary directory and this
report.

Evidence, all under `.ufo/waves/round-57/build/ExecMapUnpinned/`:

| file | content |
|---|---|
| `00-rev.txt` | rev, UTC time, node v24.21.0, git 2.56.0 |
| `01-extract.log` | `git archive HEAD` extraction + sha256 of gate/registry/README |
| `02-baseline.txt` | baseline CLEAN, exit 0 |
| `03-before-manifest.txt`, `03-registry-pristine.json`, `03-readme-pristine.md`, `03-pristine-sha.txt` | pre-mutation pins |
| `04-mutate.txt` | single-entry removal + `diff -u` (one line) |
| `05-mutant-run.txt` | file present, README row line 168, DRIFT, exit 1 |
| `06-files-rows-intact.txt` | 136-line corpus manifest unchanged, diff exit 0 |
| `07-restore.txt` | restore → CLEAN exit 0 |
| `08-sweep.txt` | 135 per-entry arms + empty-covered + restore, `SWEEP_VERDICT: PASS` |
| `09-rev-presence.txt` | gate/registry absent at base; present at R1 |
| `10-no-writes.txt` | `diff -r scratch ref` exit 0, 3626 files |
| `11-r1-mutant.txt` | R1 reproduction of the primary arm |
| `12-streams.txt`, `12-stdout.txt`, `12-stderr.txt`, `12-exit.txt` | split streams: 1 stdout line, 0 stderr bytes, exit 1 |
| `13-restored-final.txt` | post-restore CLEAN + `diff -r scratch ref2` exit 0 |
| `14-counterpin.txt` | counter-pins round-57 `readme-map` sha256 = tested bytes |
| `15-order-arms.txt` | swapped `--corpus`, reversed `covered`, reversed+one-removed |
| `16-probe-unpinned-refs.txt` | probe lines for `unpinned` / B3(e) / B10 |
| `sweep.mjs` | sweep driver (read-only w.r.t. lane; writes only `scratch/.ufo/pins/sweep-reg.json`, removed at end) |

Report: `.ufo/waves/round-57/w1/ExecMapUnpinned.md`.

## 7. Blockers

None. No tool install was needed or performed.
