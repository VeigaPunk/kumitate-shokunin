# K70AttackOutputSymlink — wave1 attack report

Seat: K70AttackOutputSymlink · Role: critic (leaf) · Axis: operability · Milestone: AttackOutputSymlink
Scope: output symlink and dangling symlink must never overwrite target.

## Verdict

The contract edge is **real, demonstrated, and only partially held by the frozen counter**.

- A candidate that gates refusal on `fs.existsSync(out)` is **defeated by a dangling `--out` symlink**: `existsSync` follows the link and returns `false`, the gate passes, `writeFileSync` creates and writes the referent, and the tool exits `0`. Replication below shows the frozen probe would still score such a candidate `REPLAY70_HELD 10/10`.
- A candidate that lets the generated private copy emit the receipt via shell `> "$OUT"` overwrites the victim in **all four** `--out` shapes (regular file, live symlink, dangling symlink, symlink-to-frozen-standin). Note R9 *does* cover the regular-file redirect arm, so a redirect-based candidate fails R9 today; the symlink arms remain uncovered by the frozen counter.
- A candidate that writes a temp file and `rename`s it over `--out` never writes through the link (target-safe for S2/S4), but it silently replaces a regular existing file (fails R9) and is not "output creation exclusive".
- Only two strategies refused every shape with victim bytes intact on this host: **`fs.openSync(out, 'wx')`** (EEXIST on all four, including dangling) and **lstat-aware refusal** (`lstatSync(out, {throwIfNoEntry:false})` present → refuse). `wx` is the stronger primitive (no TOCTOU window between check and create).

## Candidate status

`build/K70ExecRunner/control-replay.mjs` was **absent** at attack time (`ls` → empty dir). Per seat instructions I did not wait or poll; I attacked the contract and the frozen counter directly. All findings below are contract/counter findings, reproducible against any candidate by L1 before integration.

## Observed commands and outcomes

Environment: node v24.21.0 (`/run/user/1000/fnm_multishells/.../bin/node`), linux x64. No installs; tooling directive satisfied with existing toolchain (pacman paused per plan).

1. `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 78b98d7...:.ufo/waves/round-69/controls/c1-controls.sh` → `fatal: path ... does not exist in '78b98d7...'`. Frozen controls live under `.ufo/waves/round-69/probe/` (matches probe R1). Read-only; originals never executed.
2. Read frozen `replay70-probe.mjs`; R9 arm is lines 37–39: `existing.txt` is built with `fs.writeFileSync(existing,'do-not-overwrite\n')` — a **regular file**. Grep for `symlink` in the counter: **no match**. R3–R7 `--out` paths are fresh `result-${i}.txt` under the mkdtemp root (line 28).
3. Wrote isolated harness `/fast/scratch/hyaku/kumitate-r70/K70AttackOutputSymlink/symlink-attack-v2.mjs` (copied to `build/K70AttackOutputSymlink/`, sha256 `eb885a34...`) and ran `node symlink-attack-v2.mjs` from that scratch dir. Full output preserved in `build/K70AttackOutputSymlink/attack-run2.log` (sha256 `2a8040d3...`). Scratch dir removed after receipts were copied out (`rm -rf`, then `ls /fast/scratch/hyaku/kumitate-r70/` confirms seat dir gone).

Key cells from the run (strategy × --out shape; victim-correct tracking):

| strategy | S1 regular | S2 symlink→victim | S3 dangling | S4 symlink→frozen-standin |
|---|---|---|---|---|
| A `existsSync` gate + `writeFileSync` | SAFE (refused) | SAFE (refused) | **HIT: referent created, bytes=`CONTROL-OUTPUT`, exit 0** | SAFE (refused) |
| B shell `> "$OUT"` | HIT | HIT | HIT | HIT |
| C `openSync(out,'wx')` | SAFE EEXIST | SAFE EEXIST | SAFE EEXIST | SAFE EEXIST |
| D temp + `rename` | HIT (replaced) | SAFE (link replaced, victim intact) | HIT (link replaced) | SAFE (link replaced, victim intact) |
| E `lstatSync` gate + `writeFileSync` | SAFE (refused) | SAFE (refused) | SAFE (refused) | SAFE (refused) |

4. Frozen-R9 replication against a symlink-follower mock (exact assertion shape from lines 37–39):
   - Regular-file arm: `status=1 preserved=true` → frozen probe scores R9 **PASS** for a candidate that follows symlinks.
   - Untested symlink arm: `status=1 victim-unchanged=true` (never constructed by the counter).
   - Untested dangling arm: `status=0 referent-created=true referent-bytes="CONTROL-OUTPUT\n"` (never constructed by the counter).

Totals: 7/20 cells overwrite the victim. Harness v1 (`symlink-attack.mjs`, log `attack-run1.log`) had a victim-tracking flaw in S3/S1 and was superseded by v2; both artifacts retained for audit.

## Counterexample (strongest, from local evidence)

Candidate stands in strategy A (the natural Node implementation of "refuse an existing output"):

```js
// what a plausible control-replay.mjs does today
if (fs.existsSync(out)) { console.error('refuse'); process.exit(1); }
fs.writeFileSync(out, receipt);   // dangling symlink: gate passes, referent created+written
```

Probe run: all of R1–R8, R10 pass; R9 passes because `existing.txt` is regular (existsSync→true→refuse). Result line: `REPLAY70_HELD held=10/10`. Yet for `--out <dangling-symlink>` the tool silently wrote the receipt to the symlink's referent and reported success — the exclusive-creation clause of the implementation contract ("output creation exclusive") is violated, and if the referent is a frozen receipt/counter path, frozen bytes change. The frozen counter cannot distinguish this candidate from a correct one.

## Impacted axes

- **operability (C1 replay isolation, sole claimed axis):** R9's obligation "existing output is unchanged after refusal" is scored on a regular file only; the symlink/dangling arms of the same clause are unscored. `REPLAY70_HELD` therefore does not entail the contract edge this seat attacks.
- **Freeze integrity (consequence, not a separate axis):** an `--out` symlink whose referent is a frozen receipt/counter (or a sibling seat's artifact) turns a sloppy output write into a freeze violation. Plan fixes freeze before scoring and forbids amending the predicate after scoring, so the edge must be closed in the candidate, not the counter.

## Smallest safe correction

Candidate-side only (counter bytes frozen; do not touch `replay70-probe.mjs`):

1. Create the receipt with `fs.openSync(out, 'wx')` (or `writeFileSync(out, data, {flag:'wx'})`) — verified EEXIST on regular, live-symlink, dangling-symlink, and frozen-standin shapes on this host; refusal occurs before any byte is written, so partial-write risk is zero.
2. Never let the generated private copy write to `--out` via shell `>`; the copy writes only inside its unique mkdtemp child under `--work`, and the parent copies the receipt out with the `wx` primitive in step 1.
3. Selftest must assert refusal (nonzero exit) and victim-byte integrity for all four `--out` shapes, so the uncovered edge is enforced hermetically where the frozen counter cannot reach it.
4. L1 integration gate: before scoring, run the four-shape refusal probe (harness in `build/K70AttackOutputSymlink/symlink-attack-v2.mjs`, reusable as-is) against the actual candidate; require 4/4 refusal with unchanged victims.

## Freeze consequence (exact)

- `base/freeze-map.txt` stays CLEAN; `replay70-probe.mjs` and plan bytes (frozen `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`) are not amended — the R9 regular-file arm remains the only counter-level guard.
- The dangling-symlink hole in strategy A and the shell-redirect hole in strategy B are **not** scored by `REPLAY70_HELD`; a candidate shipping either would measure 10/10 and still violate the contract. This report and the selftest additions above are the enforcement path this round.
- If integration finds the candidate already uses `wx`/lstat gating, this attack collapses to a no-op with zero plan changes — the frontier item is then closed by the selftest assertion in (3), not by any counter edit.

## Artifacts

- `.ufo/waves/round-70/build/K70AttackOutputSymlink/symlink-attack-v2.mjs` — runnable isolated counterexample (sha256 `eb885a34...fbb`)
- `.ufo/waves/round-70/build/K70AttackOutputSymlink/attack-run2.log` — observed run output (sha256 `2a8040d3...6fd`)
- `.ufo/waves/round-70/build/K70AttackOutputSymlink/symlink-attack.mjs`, `attack-run1.log` — v1 harness + log, retained for audit (sha256 `e0724a07...`, `e34d7109...`)
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackOutputSymlink/` removed after receipt copy-out. No production files, no other seats' artifacts touched. No git/jj mutations. No delegation, no background jobs. No installs (node v24.21.0 pre-existing via fnm; pacman paused per plan).
