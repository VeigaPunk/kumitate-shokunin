# Proposal (report only; L1 integrates) — rebind INLINE63 to a non-author reader

Smallest safe corrections, in the order they buy assurance. None is applied by this seat.

## P1 — the probe must not execute the tool under test (kills finding -1)

`.ufo/waves/round-63/probe/inline63-probe.mjs:46-48` extracts the measured revision and runs
`<archive>/scripts/inline-dispatch-evidence.mjs`, then trusts its stdout for I1–I4. A 21-line stub
(`do-nothing-stub.mjs`, 1101 bytes) reads `held=6/6` exit 0.

Minimal patch text (inserted after line 48):

```js
const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
// I1: the tool's bytes must be the frozen gate, not a file that happens to print the lines.
const TOOL_SHA = '<pin recorded in plan.md at freeze>';   // non-author value
```

and, per wave in the I2 loop (line 69-77), re-derive independently:

```js
const res = JSON.parse(git('show', `${rev}:.ufo/waves/round-63/${w}-results.json`).stdout);
const seats = Array.isArray(res.results) ? res.results.length : 0;   // never the tool's claim
const done = countMatchedTranscripts(rev, w);                        // probe's own join
if (seats < 32) bad.push(`${w}:seats=${seats}<32`);
if (done !== seats) bad.push(`${w}:done=${done}/${seats}`);
```

The probe already owns `git show` and the sessions index logic is 40 lines; the join must live in the
probe, not in the measured revision.

## P2 — I2 must not accept a wave where the seats died (kills finding -2)

`inline63-probe.mjs:69` passes no `--report`, so `DEAD_UNNAMED` can never fire and the observed line
`INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=4 reports=40 dead=36)` counts as a pass. Either pass
`--report` per wave or require `done == seats` (P1 does this).

## P3 — bind the transcript to this wave (kills finding -3)

`scripts/inline-dispatch-evidence.mjs:204,216` compares only `tc.context.slice(0,200)` and
`tail(task,120)` against the transcript, and both strings can be lifted out of the transcript itself.
Require the committed dispatch's *whole* `context` and *whole* `task` to appear, plus a per-wave nonce
committed before dispatch (e.g. `nonce: sha256(plan.md at freeze)` inside `taskCall.context`), and
reject a transcript whose `session.cwd` is not this lane's orchestrator root.

## P4 — repair the frozen control (kills finding -4; needs L1's freeze ruling)

`.ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/orch` is empty; git cannot commit an
empty directory, so `git archive` drops the root and the gate returns exit 2 `SESSIONS_ROOT_ABSENT`
while `expect` names exit 1 `NOT_A_DISPATCH`. Commit a non-transcript placeholder:

```sh
mkdir -p .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/orch
: > .ufo/waves/round-63/controls/inline/forged-no-sessions/sessions/orch/.keep
```

and teach `probe/make-inline-controls.mjs` (line 62, `noSession: NAMES`) to write the same placeholder.
