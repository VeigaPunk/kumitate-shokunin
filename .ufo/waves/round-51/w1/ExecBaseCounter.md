# ExecBaseCounter — before-measurement witness (round 51, wave 1)

Seat: `ExecBaseCounter` (executor). Lane read-only apart from this report and the
assigned aux directory `.ufo/waves/round-51/build/ExecBaseCounter/`. No git/jj
mutation performed by this seat (read-only `git` only: `log`, `status`, `show`,
`cat-file`, `rev-parse`, `merge-base`, `ls-tree`, `archive`). No tool installed.

## Axes

1. **Baseline truth of the two frozen predicates at the lane base rev** — the
   before-measurement that every wave-1 build seat's claim rests on.
2. **Counter executability** — whether the frozen counters can actually be run at
   all (a counter that crashes is not a counter, and its silence is not a
   baseline).

## Result: both base readings obtained and match the expected control values

| Counter | Final line at base `c90b9de94009b938fa19a089bfaa97df20b54f86` | exit | Expected | Match |
|---|---|---|---|---|
| A51 (`attest51-probe.mjs`) | `ATTEST51: ATTEST_UNMET held=0/5 checks=5 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=A51 \| A1 MISS scripts/receipt-attest.mjs absent \| A2 MISS attest-run-1.txt:absent;attest-run-2.txt:absent;attest-run-3.txt:absent \| A3 MISS attest-run-2-replayed.txt absent \| A4 MISS tool or receipts dir absent \| A5 MISS tool or SCORECARD absent` | 1 | `ATTEST_UNMET held=0/5` | **yes** |
| D51 (`doctrine51-probe.mjs`) | `DOCTRINE51: DOCTRINE_UNMET held=0/5 checks=5 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=D51 \| D1 MISS entry-absent` | 1 | `DOCTRINE_UNMET held=0/5` | **yes** |

Verbatim transcripts (the whole captured session, stdout+stderr interleaved):

- `.ufo/waves/round-51/build/ExecBaseCounter/attest-base.txt`
  sha256 `f3cd1c550d1f277828f9e5e868f8316b727448bb9169844b9f584ffbcac0ec5c`
- `.ufo/waves/round-51/build/ExecBaseCounter/doctrine-base.txt`
  sha256 `b7c8b01a24bfb3b0a9c7b0513875e99060c30b89e801bd7ce0a8c3fec9a106c7`

Both readings were reproduced twice (two independent invocations each) with
byte-identical final lines.

## Commands run (cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`)

```sh
node .ufo/waves/round-51/probe/attest51-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin c90b9de94009b938fa19a089bfaa97df20b54f86
node .ufo/waves/round-51/probe/doctrine51-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin c90b9de94009b938fa19a089bfaa97df20b54f86
```

Both probes extract the scored tree with
`git -C <lane> archive <rev> | tar -x -C <tmpdir>` — the working tree is never
scored. Exit code 1 = predicate not held (per each probe's own header).

## Base-rev ground truth (independent of the probes)

The base rev does not contain any of the artifacts the predicates score:

```
$ git cat-file -e c90b9de94009b938fa19a089bfaa97df20b54f86:scripts/receipt-attest.mjs
fatal: path 'scripts/receipt-attest.mjs' does not exist in 'c90b9de94009b938fa19a089bfaa97df20b54f86'
$ git cat-file -e c90b9de94009b938fa19a089bfaa97df20b54f86:corpus/knowledge/invocation-attestation.md
fatal: path 'corpus/knowledge/invocation-attestation.md' does not exist in 'c90b9de94009b938fa19a089bfaa97df20b54f86'
$ git cat-file -e c90b9de94009b938fa19a089bfaa97df20b54f86:.ufo/waves/round-51/receipts
fatal: path '.ufo/waves/round-51/receipts' does not exist in 'c90b9de94009b938fa19a089bfaa97df20b54f86'
```

A manual `git archive` extraction of the base rev into a `mktemp -d` confirmed the
same three absences (`scripts/receipt-attest.mjs` ABSENT,
`corpus/knowledge/invocation-attestation.md` ABSENT,
`.ufo/waves/round-51/receipts` ABSENT) and that the base tree's
`.ufo/waves/` ends at `round-50` (no `round-51` at all). `git merge-base
--is-ancestor c90b9de9 HEAD` → YES, so the base is a genuine ancestor of the
round-open tip.

This is the plan's stated control: `plan.md:66-68` (A51 "Before (control)") and
`plan.md:98` (D51 "Before (control)") both expect `held=0/5` at `c90b9de9`.

## FINDING F-A51-1 (HIGH for the freeze, already repaired) — the frozen A51 counter could not execute

**What I hit first.** The very first invocation of the frozen A51 probe, against
the committed bytes at the freeze commit, died with a parse error and produced
**no counter line at all** — exit 1 from node's module loader, not a score:

```
file:///.../.ufo/waves/round-51/probe/attest51-probe.mjs:20
 *       receipt corpus file under .ufo/waves/round-4*/** at rev (the sweep prints what it
                                                       ^^

SyntaxError: Unexpected token '**'
```

Cause: the A4 arm's block-comment prose contains the glob `round-4*/**`. The
`*/` inside the glob **terminates the JSDoc block comment early**, so the
remainder of the comment (`** at rev (the sweep prints what it` …) is parsed as
JavaScript. The file is not a valid module at all.

**Why this matters beyond a typo.** The A51 probe's own header states the
failure contract: *"A crash, an unreadable extraction or a malformed verdict
line is exit 2 (never a score)"* (`attest51-probe.mjs:28-29`). A syntax error
prevents the process from ever reaching that fail-closed exit 2 — node exits 1
with a stack trace, which is indistinguishable, to a naive harness, from the
legitimate `ATTEST_UNMET` exit 1. A wave that had been scored against the
frozen bytes would have seen "exit 1" and could have recorded a false
`ATTEST_UNMET` baseline that was never actually measured. My first run *is* that
failure mode, observed.

**Repaired during the wave, not by me.** The lane HEAD moved while I was
working: `06ecbf4703fe9515ae51f36a903c58825c250ccc` ("freeze plan, counters
A51/D51, w1 spec") → `1fd8acebbd9a9d75896456e1985e752358ec4798` ("round-51:
freeze repair — comment-only fix for A51 block-comment termination (no check
semantics changed); counter executed for the first time"). That commit changes
only the A4 comment prose (`round-4*/**` → `.ufo/waves/ (round-48/49/50 receipt
corpora)`).

I verified the repair is semantics-free by comparing the pre- and post-repair
files with all `^\s*\*` comment lines stripped:

```sh
diff <(grep -v '^\s*\*' /tmp/old.mjs) <(grep -v '^\s*\*' /tmp/new.mjs)
# → no output: NON-COMMENT LINES IDENTICAL
```

and `node --check` on the repaired file exits 0.

**Provenance of the recorded baseline.** The A51 baseline quoted above was
measured with the **repaired** counter
(`attest51-probe.mjs` sha256 `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1`,
identical in the worktree and at HEAD `1fd8ace`). The frozen-at-`06ecbf4` bytes
(sha256 `e06be992d3fece8f1dfb61c4acfc6bc3e5297c585fc04c390dea34d73bb1dc89`)
cannot produce any reading. Both facts are recorded here; the crash transcript
is preserved verbatim at
`.ufo/waves/round-51/build/ExecBaseCounter/attest-base-prerepair-crash.txt`
(sha256 `4d70e21277a7d6a913c2c413b8e255310a6c393b67752484e4f67581b2203973`),
produced by running the committed freeze bytes extracted to `/tmp/a51-prerepair.mjs`.

**Severity/adjudication note for the L1 (I did not edit the frozen files).**
Severity: HIGH for freeze integrity (the counter advertised as frozen was
unparseable, so the round's C1 control could not have been executed as
published), LOW for scoring validity (the repair is provably comment-only and
the resulting readings agree with the plan's stated expectations). The L1
adjudicates; this seat only reports. Note also that `CritFreeze.md:20-27`
recorded the freeze hash `e06be992…` for the A51 probe — i.e. the critic hashed
the *broken* bytes and did not execute the file, so the defect was not caught
before the repair.

## Secondary observation — the D51 probe short-circuits at D1

`doctrine51-probe.mjs:56-61` prints `DOCTRINE_UNMET held=0/5 … | D1 MISS
entry-absent` and exits 1 **without evaluating D2–D5** when the entry is absent
at the scored rev. That is why the D51 baseline line carries only the D1 arm.
It is correct fail-closed behaviour for a base rev with no entry, but it means
"held=0/5" for D51 does **not** assert that D2..D5 would individually fail.

For completeness I exercised the D5 arm's live dependency by hand (the only
counter arm that reads outside the lane):

```sh
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \
  --root /home/vgpnk/Projects/shokunin kumitate
# … kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
# exit=0
```

So the D5 census arm is currently green at the live fleet root — D51's only
remaining unmet arm at close will be the entry-driven ones, not the census.

## Supplementary — the same counters at the current tip (not the assigned control)

At the then-current HEAD `1fd8acebbd9a9d75896456e1985e752358ec4798` both
counters still read `held=0/5` (A51: all five arms MISS; D51: `D1 MISS
entry-absent`). Expected: no build seat has landed its artifact yet at the time
of writing. Recorded only as context; the assigned measurement is the base rev.

## Scope discipline

Files written by this seat (both inside assigned paths):

- `.ufo/waves/round-51/w1/ExecBaseCounter.md` (this report)
- `.ufo/waves/round-51/build/ExecBaseCounter/attest-base.txt`
- `.ufo/waves/round-51/build/ExecBaseCounter/doctrine-base.txt`
- `.ufo/waves/round-51/build/ExecBaseCounter/attest-base-prerepair-crash.txt`

No file under `scripts/`, `corpus/`, `SCORECARD.md`, `SKILL.md`, `LOG.md`, the
fleet repo, `.ufo/state`, `MANIFEST.json` or `~/.omp/agent/*` was touched. No
git/jj mutation, no commit, no push. No packages installed or updated.

## Reproduce

```sh
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
node .ufo/waves/round-51/probe/attest51-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin c90b9de94009b938fa19a089bfaa97df20b54f86
node .ufo/waves/round-51/probe/doctrine51-probe.mjs \
  /home/vgpnk/Projects/shokunin/kumitate-shokunin c90b9de94009b938fa19a089bfaa97df20b54f86
```

Node in use: `v24.21.0`.
