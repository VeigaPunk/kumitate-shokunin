ATTACK corpus/knowledge/remaining-scripts-census.md:698-700 (scripts/ufo-l0-watch.test.mjs) verdict=partial defects=1

Target: the re-anchored S8 section `## \`scripts/ufo-l0-watch.test.mjs\`` (heading 698,
body 700) and its table row (161), against pin `31c465f1` (`/fast/scratch/kumitate-r35/src`).
Result: 10 of 11 anchors resolve at the pin; `:28` is stale. Table count, revision
label, and every behavioral claim hold. No new false behavioral claim found.

## Defect 1 — stale anchor `:28` in the mission-result reuse sentence

Path: `corpus/knowledge/remaining-scripts-census.md:700`
Clause: "Queue helpers and `validateTaskReceipt` are reused from
`scripts/ufo-mission-result.mjs` (`:28`)."

At the pin, line 28 of the test file is the `node:os` import, not the
`ufo-mission-result.mjs` import group; at base `964f443e` the anchor was correct.

Commands run (all `cwd=/fast/scratch/kumitate-r35/src`):
```
$ git show 31c465f1:scripts/ufo-l0-watch.test.mjs | sed -n '28p'
import { tmpdir } from "node:os";
$ ... | sed -n '30p;34p;35p'
import {
  validateTaskReceipt,
} from "./ufo-mission-result.mjs";
$ git show 964f443e:scripts/ufo-l0-watch.test.mjs | sed -n '28p'
import {
```
The group moved +2 (new `utimesSync` import line, new `tmpdir` import line).
The named symbols do exist: `containedJoin` :31, `readQueueFile` :32,
`resolveQueuePath` :33, `validateTaskReceipt` :34. So the claim is true but its
citation is false; a reader at `:28` sees `node:os`.

Minimal fix: in line 700 replace `` (`:28`) `` with `` (`:30`) `` (group opener,
matching the master convention) or `` (`:34`) `` for `validateTaskReceipt`.

Root cause: `.ufo/waves/round-35/build/FidUfoL0WatchTest.md:57-62` row 10
asserted "base:28 / target:28 = `import {` opening the ufo-mission-result.mjs
import group … Correct anchor: …:28 (unchanged)" and reported `anchors=10 ok=10`.
That target:28 reading is false (wave-1 report line 59). The L1 note inherited
the unverified "unmoved" anchor. [INFERENCE] the lane's claims/cite gates do not
catch it because line 28 exists and is non-blank — consistent with the
`corpus/lessons/round-35.md:20` row stating the claims gate checks that an anchor
line exists, not that its symbol is there.

## Anchor sweep at 31c465f1 (each cited line read verbatim)

`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-l0-watch.test.mjs | sed -n 'Np'`
```
:62   whipRow,                                            (import group, ...,"}, OK)
:82   const results = [];                                 OK
:83   function test(name, fn) {                           OK (path-qualified citation)
:100  const stalledRow = (over = {}) => ({                OK
:108  const steerRecorder = (outcome = { ok: true, ... }  OK
:116  const deps = (over = {}) => ({                      OK
:221  test("order_scanError_outranks_foreign_receipt_and_drift", ...  OK
:235  test("order_foreign_receipt_outranks_future_mtime_and_drift", ... OK
:248  test("order_future_mtime_outranks_drift", ...       OK
:421  test("bindSnapshotConfig_matches_dispatcher_binding", ... OK
:28   import { tmpdir } from "node:os";                   FAIL (defect 1)
```
`:62` is inside the import group ending `} from "./ufo-l0-watch.mjs";` (:65);
`whipRow` is exported at `scripts/ufo-l0-watch.mjs:1033` and the §8.1 header is at
`:1027` of that file. Fixture sentence holds: `deps` defaults `now`/`nowIso`/
`whipCooldownMs` (:117-119) and every call site passes `deps({ steer })`
(e.g. :227, :241).

## Population-table row and size

Path: `corpus/knowledge/remaining-scripts-census.md:161`
```
| `scripts/ufo-l0-watch.test.mjs` | 1608 | suite |
$ git show 31c465f1:scripts/ufo-l0-watch.test.mjs | wc -l
1608
$ git diff --stat 964f443e 31c465f1 -- scripts/ufo-l0-watch.test.mjs
 1 file changed, 262 insertions(+), 24 deletions(-)   (1370 + 262 - 24 = 1608)
```
Trailing byte is `0a`, so `wc -l` is not short-counted. Master row read
`| ... | 1370 | suite |` (`git show master:... | grep`); the round-35 edit updated
it. Count claim holds.

## Behavior claims verified

- "records into `results` (:82) and exits 1 on any failure": pushes at :86/:89;
  tail :1606 `const failed = results.filter((r) => !r.ok);` :1608
  `if (failed.length > 0) process.exitCode = 1;`. Holds.
- "drift-bypasses-decision rule": `test("drift_bypasses_terminal_decision_and_fires_kind_steer"` :304. Holds.
- "cooldown window": :340 `cooldown_suppresses_whip_and_logs_once_per_window`,
  :351 `cooldown_window_boundary_fires_again`. Holds.
- "Lane-state transitions": `lastWhipSkip` asserted :245, `lastWhipAt` :269/:316/:372. Holds.
- "snapshot-binding parity": :421 body exercises `bindSnapshotConfig` bound/
  fail-closed/unbound arms (:422-440). Holds.
- Runner claim: no `node:test` import; 54 top-level `test(` cases run by the
  local helper. Holds.

## Revision label and removed-clause trace

- `(nc5-swarm r10)` is present verbatim in both master:719 and note:700. Kept.
- End stamp `re-anchored at 31c465f1 (round 35)` is present.
- Dropped text vs master: the `:63`/`:66` collector anchors, the rationale
  "because r10 extracted the walk verbatim into `whipRow` so the whole battery is
  pinnable offline", and the parenthetical `(lastWhipAt/lastWhipSkip/
  cooldownLoggedFor)`. The extraction claim survives ("the extracted walk uses
  imported `whipRow`"), and the lane-state claim survives generically.
- Trace check: this section carries no `(round 35: removed X — absent at
  31c465f1)` stamp, though the note uses that form 12 times elsewhere. The only
  substantive dropped name, `cooldownLoggedFor`, appears at both revisions only in
  the file-header comment (`scripts/ufo-l0-watch.test.mjs:13`; `grep -c` = 1) and
  is not behavior-pinned. [INFERENCE] ExecS8Fidelity classified this as
  `claims_reworded` (35), not `clauses_removed` (41), so the omission is within its
  own convention; not counted as a defect and no false claim remains, but a
  one-word removal trace would make the deletion auditable.

## Commands run (no installs; no lane writes; no git mutations)

`git -C /fast/scratch/kumitate-r35/src show <rev>:<path> | sed/awk/grep` (964f443e,
31c465f1); `wc -l`; `git diff --stat`; lane `git diff master`; `git show master:…`;
`grep` over the lane note, `LOG.md`, `SCORECARD.md`, `lessons/round-35.md`, Fid report.

Remaining unknowns: none; reproducible from the `git show` commands above.
