# K91Mutation — mutation test of probe91-c1's discrimination of the v5 external-branch edit

Seat dir: `.ufo/waves/round-91/K91Mutation/` (mutants, receipts, generator). Scratch removed after runs.
Frozen base: `controls/ref-fd-fstat.mjs` sha256 `bc3df527ec224f2f5542d4c42f5583920503e433b5f39734a7be4db626a894db`;
probe sha256 verified `3bd88e8efe4bb0851b5ef57c90e80792eada34cd0f2450922d75fbe9fc313f4c` (== plan.md frozen value).
Predicate run per mutant: `node .ufo/waves/round-91/probe/probe91-c1.mjs --lane <lane> --work <scratch>/p-<id> --alt /fast/scratch/hyaku --rev 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4 --tool <mutant>` under `prlimit --as=2147483648 timeout 300`, `TMPDIR=<scratch>`.

## Axes
1. kill power over the v5 edit's declared classes; 2. survivor classification quality (equivalent vs gap); 3. run cost (12 parallel-batched probes, ≤49 s each).

## Results (receipts/<id>.txt; per-edit diffs receipts/<id>.diff)

| id | edit | verdict | failing arms |
|---|---|---|---|
| m00-pristine | none (generator copy, hash == committed control) | **HELD 56/56** rc=0 | — (baseline conclusive; runs 10 s) |
| m01-drop-nonblock | drop O_NONBLOCK | UNMET 55/56 | ext-fifo (A+B; blocked open caught by probe's 20 s arm bound, run 49 s) |
| m02-drop-nofollow | drop O_NOFOLLOW | **HELD 56/56** | SURVIVOR |
| m03-isfile→!isDirectory | `!xst.isFile()` → `!xst.isDirectory()` | UNMET 49/56 | selftest (73/76), detect-r86-at-rev, detect-r86-renamed, escape-relative, alias-ancestor-external-twin, ext-empty-twin, ext-atcap |
| m04-gte-cap | `>` → `>=` | UNMET 55/56 | ext-atcap |
| m05-cap-minus1 | 16777216 → 16777215 | UNMET 55/56 | ext-atcap |
| m06-cap-plus1 | 16777216 → 16777217 | UNMET 55/56 | ext-overcap |
| m07-read-by-path | `readFileSync(xfd)` → `readFileSync(abs)` | **HELD 56/56** | SURVIVOR |
| m08-swallow-failclosed | catch no longer rethrows FailClosed | **HELD 56/56** | SURVIVOR |
| m09-token-swap | UNRESOLVED → ESCAPES_LANE | UNMET 52/56 | ext-zero, ext-null, ext-fifo, ext-dir |
| m10-stat-abs | `fstatSync(xfd)` → `statSync(abs)` | **HELD 56/56** | SURVIVOR |
| m11-remove-close | external fd never closed | **HELD 56/56** | SURVIVOR |

**Kill ratio 7/11 = 64 %.** Every kill lands on a declared-class arm (external char device / FIFO / directory; regular file on either side of the 16777216 edge or empty; carried v4 arm shapes incl. the 76-arm selftest floor), each failing in BOTH fixture contexts (M3) — so the probe kills every declared-class-breaking mutation of the positive control's external branch. No in-class probe gap found.

## Survivor classification (all equivalent-on-suite; none is an in-class gap)

- **m02-drop-nofollow — equivalent.** The branch lstat's `abs` and throws `SYMLINK_INSTRUMENT` for a symlink final component *before* the open (ref-fd-fstat.mjs:370-371), and no probe arm places an external symlink that survives that static check. O_NOFOLLOW's residual value is purely against a post-lstat path swap — the TOCTOU race is explicitly not claimed (plan.md routed RD-3/A7/A8), so no declared class distinguishes it. Defense-in-depth note, not a contract violation.
- **m07-read-by-path — equivalent.** Type/size checks stay on the fd; only the read re-enters via the path, opening a swap window between fstat and read — again deterministic-arm-free, out-of-class (RD-3). Static fixtures give identical digests.
- **m08-swallow-failclosed — equivalent.** The wrapped rethrow keeps token `UNRESOLVED`, exit 2 — the exact declared verdict for all four external non-regular kinds and over-cap; arms read the verdict token only, and every FailClosed inside this try is already UNRESOLVED-token (SYMLINK_INSTRUMENT is thrown outside the try). Fragile design (would mask a future distinct token moved inside the try), but indistinguishable on the frozen arms.
- **m10-stat-abs — equivalent.** For every static fixture, `stat(abs)` and `fstat(fd)` report the same type/size. Divergence only under a concurrent swap (RD-3, out-of-class) or for a regular file whose `st_size` under-reports its readable length (e.g. /proc|/sys pseudo-files) — that is ReviewProc's routed hypothesis, and it applies equally to the pristine control, so it is out-of-class unless it breaks a declared class (none does).
- **m11-remove-close — equivalent.** One leaked fd per external instrument; each arm run is a short-lived process with ≪ fd-limit externals, so no verdict can change within the bounded battery. Resource hygiene, unobservable in-suite.

## Kill-rule relevance
A surviving mutant is a coverage finding, not a contract change: no survivor produces a wrong verdict on any input of a declared class (they hold 56/56, and their residual behavior differs only in out-of-class regimes: TOCTOU races, pseudo-file stats, fd hygiene). C1's probe therefore discriminates the v5 edit exactly as far as the frozen classes demand.

## Restoration / lane integrity
The committed control and probe were never opened for writing; mutants are seat-dir copies (m00-pristine sha256 verified equal to the committed control before scoring). Post-run evidence: lane file hashes unchanged (see below). Scratch `/fast/scratch/hyaku/kumitate-r91/K91Mutation` removed before yield.

## Artifacts
- `mutants.txt` — run matrix, verdicts, failing arms, kill ratio
- `receipts/<id>.txt` — full probe stdout per candidate (12); `.err` all 0 bytes; `<id>.diff` per mutant edit; `mutant-hashes.txt`
- `gen-mutants.mjs`, `run-one.sh` — deterministic generator (assert-checked single-occurrence anchors) and runner
