# K87ExecMap — readme-map symlink misclassification (candidate) + spotcheck adoption command

Seat: `K87ExecMap` (executor, leaf). Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Base revision `db97929212bb61ae970b10abac3cc4cd976713ae`; measured tree = lane HEAD
`25a3a75df123a59c5cf0de944a6d2f067e278f82` (freeze commit). Nothing committed, pushed or stashed.
Host `plazir27`. No tool was installed or upgraded in this seat.

All evidence below is in
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecMap/`
(artifacts) and `.../build/K87ExecMap/repro/` (transcripts). Scratch was
`/fast/scratch/hyaku/kumitate-r87/K87ExecMap/` and is deleted before yield.

---

## 1. The latent bug — confirmed, reproduced, patched

### 1.1 Location and root cause

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs` at `25a3a75d`
(sha256 `fc119ab6056998fdd8205e9277c2665112af872d43acde20fca98efc986d8831`), lines 226–245:

```
226    const [ns, leaf] = [c.slice(0, c.indexOf('/')), c.slice(c.indexOf('/') + 1)];
227    let lst;
228    try {
229      lst = lstatSync(join(dirFor[ns], leaf));
230    } catch {
231      bad.push(`stale-covered:${c}`);
232      continue;
233    }
234    if (lst.isSymbolicLink()) {
235      try {
236        statSync(full);                       <-- `full` is never bound
237        bad.push(`covered-not-file:${c}`);
238      } catch {
239        bad.push(`stale-covered:${c}`);       <-- therefore always taken
240      }
```

`full` does not exist anywhere in the committed file (`grep -n '\bfull\b'` returns only line 236).
An undeclared identifier read in an ES module throws `ReferenceError` at run time, so the `try`
at 235 always throws for **every** symlink and line 239 always wins. A `covered` entry that is a
symlink whose target exists therefore reads `stale-covered:<path>` — the token v2 reserves for a
*missing* file — instead of the distinct `covered-not-file:<path>` the file's own contract
promises (header lines 30–34 and 60–62: "a symlink whose target exists is likewise not a regular
file: `covered-not-file`"). The dangling-symlink arm (selftest case 16) passed only because it
expects the token the broken branch always produces; nothing exercised the resolving case.

Consequence: the gate cannot distinguish "the pinned corpus file is gone" from "the pinned corpus
file is reachable only through a link", so both classes report the same finding and any reader
(and any receipt quoting `first=`) mis-states the defect.

### 1.2 Reproduction (hermetic, scratch only)

`.../build/K87ExecMap/repro/repro.sh <work> <orig.mjs> <patched.mjs>` builds one fixture —
`corpus/knowledge/a.md`, `corpus/lessons/b.md`, `corpus/lessons/link.md -> ../knowledge/a.md`,
three README rows, `reg.json` v2 with the three covered — and runs both binaries over it.
Transcript `repro/repro-transcript.txt`:

```
link: ../knowledge/a.md
link target resolves: yes
corpus/lessons/link.md lstat/stat ---
lstat isSymbolicLink=true isFile=false
stat isFile=true
--- orig ---   README_MAP: DRIFT files=3 rows=3 covered=3 bad=1 first=stale-covered:lessons/link.md
ORIG_EXIT=1
--- patched --- README_MAP: DRIFT files=3 rows=3 covered=3 bad=1 first=covered-not-file:lessons/link.md
PATCHED_EXIT=1
```

Same fixture, same exit code, wrong token before and right token after.

### 1.3 Candidate patch

`.../build/K87ExecMap/readme-map.mjs.patch` (sha256
`3a8a9f10fb5ea0bdc9cb8a366e6a5d21c0f6d126cbaf6fb7c29c94e2a606877c`), three hunks, `-p1`
against lane root; full post-image also shipped as `readme-map.patched.mjs` (sha256
`263d961c3f42ed3da2479c4c985edd6eadd06f7c151b97370a619ff6880b2afe`).

| hunk | lines (post-image) | change |
|---|---|---|
| `@@ -224,9 +224,10 @@` | adds 227, changes 230 | binds `const full = join(dirFor[ns], leaf);` and lstat's `full`. This is the whole semantic fix: `statSync(full)` at 237 now distinguishes "target exists" (`covered-not-file`) from "target gone" (`stale-covered`). |
| `@@ -284,12 +285,13 @@` | 288, 294 | selftest fixture gains `linkTo = []`, creating symlinks to an **existing** corpus file (the existing `links` option only ever created dangling ones). Existing cases are untouched: default `[]`. |
| `@@ -438,6 +440,23 @@` | 443–459 | new selftest case 19 `symlink-resolving-covered-not-file`: asserts exit 1, `covered-not-file:lessons/link.md` present **and** no `stale-covered:` in the output. |

No new finding token string is introduced: the distinct token the assignment asks for is
`covered-not-file`, already named by the header contract (lines 30–34, 60–62) and already emitted
for directories and fifos; the patch makes it reachable for symlinks. I deliberately did **not**
add a third token (e.g. `covered-symlink`): that would contradict the file's own contract and
would either change v2's `stale-covered` for a dangling link (forbidden by the assignment) or
leave two tokens for one class.

### 1.4 Acceptance evidence

* **Applies cleanly** — `repro/patch-apply-transcript.txt`: `patch -p1 --dry-run` → `DRYRUN_EXIT=0`;
  `patch -p1` → `APPLY_EXIT=0`; `cmp` of the applied file against the candidate → identical.
  Run twice: once against a copy of the live lane script, once against the **committed blob**
  (`git show 25a3a75d:scripts/readme-map.mjs`, sha256 `fc119ab6…`) — both clean, both producing
  sha256 `263d961c…`.
* **Own selftest PASS with the new arm** — `repro/selftest-transcript.txt`:
  pre-patch copy `README_MAP_SELFTEST: PASS (18/18)`; candidate `PASS (19/19)` with
  `case symlink-resolving-covered-not-file: PASS`; patch-applied copy `PASS (19/19)`.
* **Every existing finding byte-identical** — `repro/byte-identical-transcript.txt`
  (`repro/byte-identical.sh`), `MATRIX_DIFFERENCES=0` over nine cases comparing stdout+exit of
  pre-patch vs candidate: `clean` (CLEAN, 0), `dangling` symlink (`stale-covered`, 1),
  `dirfile` (directory member, `covered-not-file` + orphan/uncovered, 1), `fifo`
  (`covered-not-file`, 1), `mixed` (outside-map + duplicate + orphan + uncovered + unpinned +
  format-unmapped, 1), `regv1` (FAIL-CLOSED version, 2), `scope` (FAIL-CLOSED malformed covered
  entry, 2), `stale` (`stale-covered`, 1), and `lane` — the committed revision itself
  (`README_MAP: DRIFT … bad=2 first=uncovered:lessons/round-86-verifier-spotcheck.md`, exit 1,
  identical both ways; the lane corpus contains no symlink: `find corpus -type l` is empty).

### 1.5 Integration point

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs` — single file, no other
caller changes. **Observed state:** at capture time (`2026-11-04T21:32Z`) the live lane file
already carried sha256 `263d961c…`, i.e. byte-identical to this candidate (mtime
`2026-11-04 18:32:25 -0300`), and its `--selftest` read `README_MAP_SELFTEST: PASS (19/19)`. So
the L1 has already integrated the candidate into the working tree; the commit remains the L1's.
If it must be re-applied: `patch -p1 -d /home/vgpnk/Projects/shokunin/kumitate-shokunin <
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ExecMap/readme-map.mjs.patch`
(dry-run first with `--dry-run`).

---

## 2. `spotcheck-adopt` / `readme-map` red state and the adoption invocation

### 2.1 Red state at the committed revision (the fourth recurrence)

Hermetic pristine clone of the lane at `25a3a75d` (`git clone --shared`, tree clean), transcript
`repro/red-state-committed-rev.txt`:

```
$ node scripts/spotcheck-adopt.mjs --check
SPOTCHECK_COVERAGE: DRIFT spotchecks=53 uncovered=1 first=corpus/lessons/round-86-verifier-spotcheck.md
MAP: DRIFT first=uncovered:lessons/round-86-verifier-spotcheck.md
EXIT=1

$ node scripts/readme-map.mjs
README_MAP: note unpinned:lessons/round-86-verifier-spotcheck.md
README_MAP: DRIFT files=220 rows=219 covered=219 bad=2 first=uncovered:lessons/round-86-verifier-spotcheck.md
EXIT=1

$ node scripts/spotcheck-adopt.mjs --predict 86
SPOTCHECK_PREDICT: UNCOVERED corpus/lessons/round-86-verifier-spotcheck.md
EXIT=1
```

`corpus/lessons/round-86-verifier-spotcheck.md` is committed (round-86 non-author spot-check) with
no `corpus/README.md` row and no `covered` pin — exactly the recurrence the plan names.

### 2.2 Live working tree (moved while this seat ran)

Transcript `repro/red-state-live-tree.txt`, `2026-11-04T21:32:35Z`, HEAD `25a3a75d`, dirty
entries include `M corpus/README.md`, `M .ufo/pins/readme-map.json`, `M scripts/readme-map.mjs`,
`?? corpus/knowledge/receipt-subject-binding.md`:

```
$ node scripts/spotcheck-adopt.mjs --check
SPOTCHECK_COVERAGE: CLEAN spotchecks=53 uncovered=0
MAP: CLEAN

$ node scripts/readme-map.mjs
README_MAP: CLEAN files=221 rows=221 covered=221

$ node scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-86-verifier-spotcheck.md
SPOTCHECK_ADOPT: ALREADY_ADOPTED corpus/lessons/round-86-verifier-spotcheck.md
```

i.e. a sibling seat already ran the adoption into the working tree (uncommitted), so the
recurrence is cleared *in the tree* but not yet in history. Earlier in this seat's run
(18:2x local) the live tree was still red with `MAP: DRIFT first=uncovered:knowledge/receipt-subject-binding.md`
while `SPOTCHECK_COVERAGE:` was already CLEAN and `--check` **exited 0**; that sighting cannot be
re-captured because the tree has since moved, so the mechanism is demonstrated hermetically in
§2.4 instead.

### 2.3 The exact invocation the L1 must use

`node scripts/spotcheck-adopt.mjs --help` prints only `SPOTCHECK_ADOPT: USAGE` and exits 64 —
the tool has no flag list (`main()` in `scripts/spotcheck-adopt.mjs:495-510`). Derived from that
function, the invocation is:

```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
node scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-86-verifier-spotcheck.md
```

* `--adopt` takes **one** argument: the target, lane-relative and required to start
  `corpus/lessons/` with a bare `round-<n>-verifier-spotcheck.md` leaf; the key used for the
  finding names is the target minus `corpus/` (`lessons/round-86-verifier-spotcheck.md`).
* It does **row + pin in one step**: pre-images of `corpus/README.md` and
  `.ufo/pins/readme-map.json` are published to `.ufo/pins/adopt-journal/`, then the README row
  (inside `## Coverage map`) and the `covered` append are written atomically, the oracle is
  re-read, and the delta test (`uncovered:`/`unpinned:` for the target cleared, every other
  finding unchanged) must pass or both files are rolled back (`REFUSED_ORACLE`).
* `--lane <dir>` may be passed first to point at another tree; `--predict 86` is the read-only
  dry-run (`SPOTCHECK_PREDICT: UNCOVERED|COVERED`, exit 1/0); `--check` only reads.
* Idempotent: re-running prints `SPOTCHECK_ADOPT: ALREADY_ADOPTED <target>` exit 0.
  Refusals: `REFUSED_ABSENT`, `REFUSED_NOT_SPOTCHECK`, `REFUSED_OUT_OF_SCOPE`,
  `REFUSED_NO_MAP_SECTION`, `REFUSED_PATH_ESCAPE`, `REFUSED_ORACLE`.

Canonical effect, measured in the scratch clone (`repro/adopt-canonical-delta.txt`):

```
$ node scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-86-verifier-spotcheck.md
SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-86-verifier-spotcheck.md wrote=both
README_MAP: CLEAN files=220 rows=220 covered=220
EXIT=0

git diff (the whole delta):
+ | `lessons/round-86-verifier-spotcheck.md` | Non-author round-86 verifier spotcheck | Closure artifact; adopted by spotcheck-adopt |
-     "lessons/round-86.md"
+     "lessons/round-86.md",
+   "lessons/round-86-verifier-spotcheck.md"

$ node scripts/spotcheck-adopt.mjs --check     -> SPOTCHECK_COVERAGE: CLEAN spotchecks=53 uncovered=0 / MAP: CLEAN   EXIT=0
$ node scripts/readme-map.mjs                  -> README_MAP: CLEAN files=220 rows=220 covered=220                    EXIT=0
$ node scripts/spotcheck-adopt.mjs --predict 86 -> SPOTCHECK_PREDICT: COVERED corpus/lessons/round-86-verifier-spotcheck.md EXIT=0
journal directory empty (retired)
```

The live working tree's two edited files carry exactly that README row and that pin entry, so the
sibling's edit matches the tool's canonical output for this target (the live pin also differs from
the committed order — see §3.2).

### 2.4 `--check` exit 0 on a red map (candidate-1 recon evidence)

`repro/check-exit-conflation.txt` — fresh clone at `25a3a75d`, adopt the spot-check, then add one
unrelated live corpus file with no row and no pin:

```
$ node scripts/spotcheck-adopt.mjs --check
SPOTCHECK_COVERAGE: CLEAN spotchecks=53 uncovered=0
MAP: DRIFT first=uncovered:knowledge/zzz-unmapped.md
EXIT=0                     <-- green exit with a red map

$ node scripts/readme-map.mjs
README_MAP: DRIFT files=221 rows=220 covered=220 bad=2 first=uncovered:knowledge/zzz-unmapped.md
EXIT=1
```

`evaluate()` computes `exit: paths.length === 0 || uncovered.length > 0 ? 1 : 0` — the exit code is
keyed on the spot-check set only, never on `MAP:`. So the round's after-state sentence "`--check`
exits 0 after the row is adopted" is satisfiable while `readme-map` is still red; `--check`'s exit
code is not a map gate. Recon only, no patch (plan: candidate 1).

---

## 3. Observations / risks (not mine to fix)

1. **`--check` conflation** (§2.4) — evidence for candidate 1; do not treat `--check` exit 0 as
   `readme-map` CLEAN in the round's close receipts.
2. **Live pin file re-sorted.** Committed `covered` at `25a3a75d`: 219 entries, *not* sorted;
   live working tree: 221 entries, **sorted**, set = committed ∪ {`knowledge/receipt-subject-binding.md`,
   `lessons/round-86-verifier-spotcheck.md`} (checked with `node -e` over both files). The gate
   treats `covered` as a set, so the semantics are unchanged, but the append-order ratchet shape is
   gone; the L1 decides whether to commit that shape.
3. **`appendPin` indentation.** The canonical append writes the new entry with two spaces inside a
   four-space array (`repro/adopt-canonical-delta.txt`). Cosmetic, pre-existing, unchanged by me.
4. **`statSync` follows links**, so a symlink to a directory also reads `covered-not-file` — which
   the header contract already covers ("a symlink to anything").
5. `dirFor[ns]` is `undefined` for a namespace outside `knowledge|lessons`, but `loadRegistry`
   rejects such entries before evaluation (`FAIL-CLOSED covered entry malformed`, matrix case
   `scope`, exit 2), so the `join` throw path is unreachable.

## 4. Files written

* `.../build/K87ExecMap/readme-map.mjs.patch` — candidate patch (3 hunks).
* `.../build/K87ExecMap/readme-map.patched.mjs` — candidate post-image (sha256 `263d961c…`).
* `.../build/K87ExecMap/repro/repro.sh`, `repro/byte-identical.sh` — the two drivers.
* `.../build/K87ExecMap/repro/repro-transcript.txt`,
  `byte-identical-transcript.txt`, `patch-apply-transcript.txt`, `selftest-transcript.txt`,
  `red-state-committed-rev.txt`, `red-state-live-tree.txt`, `adopt-canonical-delta.txt`,
  `check-exit-conflation.txt`.
* `.../build/K87ExecMap/EVIDENCE.md` — index with digests.
* This report.

Scratch `/fast/scratch/hyaku/kumitate-r87/K87ExecMap/` (three `git clone --shared` trees, fixtures,
matrix, patch copies) is removed before yield.
