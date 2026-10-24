# MutA57DropCheck — drop-one hold() mutant on the frozen A57 counter

Round 57 / wave 1 / seat `MutA57DropCheck` (mutation tester). Lane
`/home/vgpnk/Projects/shokunin/kumitate-shokunin`, lane HEAD `8c6f5b017d149b18134917378cdbed3b492d8e89`
(read-only; no lane write outside this seat's build dir and this report).
Measured close rev used for the probe: `f0dc6d1160e66af65355bd353665adac22bbf4a9` (plan R1,
`close/FINAL-attest57-R1.txt`). Date 2026-10-24.

## Mutant

Exactly one behavior-bearing point: the executed B10 `hold(...)` call in a scratch copy of
`.ufo/waves/round-57/probe/attest57-probe.mjs` (source lines 408–409), commented out — both
physical lines, so the file still parses; no other byte changed.

```
-      hold('B10', agree,
-        `uncovered=... gateExit=${r.status}`);
+      // hold('B10', agree,
+      //   `uncovered=... gateExit=${r.status}`);
```

Mutant copy: `.ufo/waves/round-57/build/MutA57DropCheck/attest57-dropone-mutant.mjs`,
sha256 `37095ebe434dd6d42deeb000f0695b563a9c68de912c5373c47a97e8e0093823`
(pristine `d177f6d5a7335b5e36d7d950b7cde8af4f99b979ce5d0321ab50100939045815`, identical to
the worktree probe and the `attest57-probe` pin in `.ufo/pins/counter-pins.json`; diff in
`dropone-mutant.diff`). `B5` still reports PASS in the mutant run: the self-pin hashes the
in-tree probe bytes at the rev, not the running script, so it does not bind the mutant.

## Detector and expected result

Frozen predicate (plan §C1, probe header, byte-identical sentence):

```
ATTEST57_HELD — node .ufo/waves/round-57/probe/attest57-probe.mjs <lane> <rev> prints
"ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=<rev> rule=A57 version=v1" and exits 0.
```

Item expectation (plan K3): a drop-one mutant prints `held=9/10` `ATTEST57_UNMET`, killed by
the literal `held=10/10 checks=10`.

## Observed

Same argv shape for every run (`<probe> <lane> <rev>`), rev `f0dc6d11…` except where noted.

| run | probe bytes | stdout (verdict line) | exit |
|---|---|---|---|
| pristine | `d177f6d5…` | `ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=f0dc6d11… rule=A57 version=v1 \| B1 PASS … B10 PASS` | 0 |
| drop-one (B10 hold commented) | `37095ebe…` | `ATTEST57: ATTEST57_HELD held=9/9 checks=9 rev=f0dc6d11… rule=A57 version=v1 \| B1 PASS … B9 PASS` (no B10) | 0 |
| restored (`dropone.mjs` ← pristine bytes) | `d177f6d5…` | `ATTEST57: ATTEST57_HELD held=10/10 checks=10 rev=f0dc6d11… rule=A57 version=v1 \| B1 PASS … B10 PASS` | 0 |
| drop-one at lane tip | `37095ebe…` | `ATTEST57: ATTEST57_HELD held=9/9 checks=9 rev=8c6f5b01… rule=A57 version=v1 \| B1 PASS … B9 PASS` | 0 |

The counter's HELD decision is `held === checks.length` and the denominator is
`checks.length`; dropping one `hold()` call shrinks both. **The expected `held=9/10`,
`ATTEST57_UNMET` was not produced at either rev.** The mutant self-reports `ATTEST57_HELD`,
`checks=9`, exit 0, and violates the probe header's own contract ("Any other reading is
`ATTEST57_UNMET held=<k>/10` exit 1"). It is killed only by an external exact-literal
comparison of the frozen sentence: `contains_frozen_literal=false`,
`contains_held_10_of_10=false`, `contains_held_9_of_10=false`,
`contains_ATTEST57_UNMET=false` (`literal-check.txt`). No fixed-count guard exists: the only
length guard is `checks.length === 0`.

## Committed hold-call-deleted transcript (B5c) check

Reproduced the committed procedure on a scratch copy:
`sed 's/\bhold(/void(/g' attest57-pristine.mjs > attest57-allhold-void.mjs` (18 `void(`
sites, sha256 `c4dea716716ddb32573dd2d25549c79437bd59e8dcde15dbc37ec31555574ce1`), run at
`f0dc6d11…`:

```
ATTEST57: ATTEST57_UNMET held=0/0 checks=0 rev=f0dc6d11… rule=A57 version=v1 | hold-call-deleted
exit=1
```

Within its own mutation shape the transcript's claim is corroborated. B5c's exact regexes on
the committed 770-byte transcript (`28bd03ae…`) evaluate `transcriptOk=true`, `guardOk=true`.
But B5c is a static text match over a file with no hash pin (no `counter-mutant` entry in
`.ufo/pins/*.json`) and no re-execution; the transcript's claimed rev
`1cd6d667e20075fd2e77e6e655bc755f95e3d940` is **absent from the lane repo**
(`git cat-file -t` → `fatal: bad object`), so the recorded run is not replayable against lane
bytes. Our replay at `f0dc6d11…` matches the committed line byte-for-byte after rev
substitution (`normalized_diff_exit=0`).

## Verdict

**SURVIVED as an in-band verdict mutant; KILLED only by external literal comparison.**
Expected `held=9/10`/`ATTEST57_UNMET` is falsified: a dropped check yields `held=9/9`,
`ATTEST57_HELD`, exit 0. K3's predicted output shape is wrong (it describes a failed-check,
not a dropped-check, mutant). Coverage finding: the vacuous-HELD guard covers only
`checks.length === 0`; no arm enforces the frozen count of 10 checks, so any consumer that
trusts the counter's verdict token or exit code accepts the drop-one mutant. The all-hold
transcript itself is corroborated but is not a substitute for a count guard.

## Restoration evidence

Primary scratch copy `attest57-dropone.mjs`: mutated `37095ebe…` → restored by copying the
pristine bytes → sha256 `d177f6d5a7335b5e36d7d950b7cde8af4f99b979ce5d0321ab50100939045815`
(`hashes-before.txt` / `hashes-after-restore.txt`), restored run re-prints 10/10 exit 0. The
mutant artifact is retained only as `attest57-dropone-mutant.mjs` in this build dir. No
production file, probe, pin, index, or jj/git state was modified; no commits or installs.

Evidence dir: `.ufo/waves/round-57/build/MutA57DropCheck/` — `RUNLOG.txt`, `*.cmd`,
`*.stdout`, `*.stderr`, `*.exit`, `hashes-before.txt`, `hashes-after-restore.txt`,
`dropone-mutant.diff`, `literal-check.txt`, `committed-line-normalized.txt`,
`repro-line-normalized.txt`, `run-probe.sh`.

Sources assessed: none (C1 counter mutation only; no SOURCES/knowledge edit).
