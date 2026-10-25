# CounterReplay — round-62 frozen counter replay

Findings only. Replay used the round-62 probe copies, which are byte-identical to the frozen round-61 probes: dispatch SHA-256 `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f`; doctrine SHA-256 `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`. The round-62 plan directory was empty at inspection; the counter command/claim assumptions below therefore come from the visible round-61 frozen plan and receipts. Main lane HEAD was `0cbe0d75e5a08718e2256408329692908c837766`; it had only untracked `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` and `.ufo/waves/round-62/`.

All outputs below are literal probe output, followed by the shell-observed exit code. C1 invokes the worktree dispatch gate and checks names at the supplied rev; C2 receives explicit census root as in the frozen pack.

## C1: `dispatch61-probe.mjs`

**Base** `c2721f812cebd97ab67a1dd8cd8492a193f82d42`, lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

```text
DISPATCH61: DISPATCH61_UNMET held=1/4 checks=4 rev=c2721f812cebd97ab67a1dd8cd8492a193f82d42 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 MISS gate=0 clean=true reports=0
 | P3 MISS | `dispatch-evidence` | Read a round's **actual** dispatch record and judge it: the launcher progress file (`launcher-progress.tsv` — seat, session id, exit code) against the summary a report quotes (
 | P4 MISS absent
EXIT=1
```

P2 observes current worktree gate success but zero report filenames at the base rev; this is not a base-tree gate evaluation.

**Final R61 revision** `019a844c9db6d63206f3a39949bf790b05747a40`, same lane:

```text
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=019a844c9db6d63206f3a39949bf790b05747a40 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 MISS | `dispatch-evidence` | Read a round's **actual** dispatch record and judge it: the launcher progress file (`launcher-progress.tsv` — seat, session id, exit code) against the summary a report quotes (
 | P4 MISS absent
EXIT=1
```

**Current lane HEAD** `0cbe0d75e5a08718e2256408329692908c837766`, same lane:

```text
DISPATCH61: DISPATCH61_UNMET held=2/4 checks=4 rev=0cbe0d75e5a08718e2256408329692908c837766 rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 MISS | `dispatch-evidence` | Read a round's **actual** dispatch record and judge it: the launcher progress file (`launcher-progress.tsv` — seat, session id, exit code) against the summary a report quotes (
 | P4 MISS absent
EXIT=1
```

**Committed forged control revision** `4247d2da937842bd6846874d548b7125b356e14c`, clean fixture `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin`:

```text
DISPATCH61: DISPATCH61_UNMET held=1/4 checks=4 rev=4247d2da937842bd6846874d548b7125b356e14c rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 MISS gate=2 clean=false reports=0
 | P3 MISS | `dispatch-evidence` | Read a round's **actual** dispatch record and judge it: the launcher progress file (`launcher-progress.tsv` — seat, session id, exit code) against the summary a report quotes (
 | P4 MISS absent
EXIT=1
```

This C1 replay does **not** establish forged C1 acceptance: the committed forged fixture is a C2 fixture and has no round-61 dispatch wave; its gate fails with status 2. The extant R61 committed no-seat control receipt (`round-61/controls/ctl-c1-critic-a4-full-fabrication.txt`, also summarized in `round-62/w1/AttackC1C2.md`) reports the distinct result: fabricated dispatch records/reports satisfy the probe, `DISPATCH61_HELD held=4/4 exit=0`. That is a committed prior control result, not a replay performed here.

## C2: `doctrine61-probe.mjs`

Command form: `node .ufo/waves/round-62/probe/doctrine61-probe.mjs <lane> <rev> --census-root <fleet-root>`.

**Base** `c2721f812cebd97ab67a1dd8cd8492a193f82d42`, lane root as lane and census root `/home/vgpnk/Projects/shokunin`:

```text
DOCTRINE61: DOCTRINE61_UNMET held=1/6 checks=6 rev=c2721f812cebd97ab67a1dd8cd8492a193f82d42 rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 MISS mapped=false readme-map=1 README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
EXIT=1
```

**Final R61 revision** `019a844c9db6d63206f3a39949bf790b05747a40`, same roots:

```text
DOCTRINE61: DOCTRINE61_UNMET held=3/6 checks=6 rev=019a844c9db6d63206f3a39949bf790b05747a40 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 MISS mapped=true readme-map=1 README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
EXIT=1
```

**Current lane HEAD** `0cbe0d75e5a08718e2256408329692908c837766`, same roots:

```text
DOCTRINE61: DOCTRINE61_UNMET held=3/6 checks=6 rev=0cbe0d75e5a08718e2256408329692908c837766 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 MISS mapped=true readme-map=1 README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
EXIT=1
```

**Committed forged control revision** `4247d2da937842bd6846874d548b7125b356e14c`, fixture lane `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin`, census root `/tmp/kumitate-r61-a2/fleet`:

```text
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=4247d2da937842bd6846874d548b7125b356e14c rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 15841c50876fe839f sha=15841c50876fe839
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
EXIT=0
```

Concrete counterexample reproduced: forged committed C2 revision passes all six checks (exit 0), while genuine final revision fails three (exit 1). Probe behavior is consistent with the round-61 control receipts: E3's malformed-row finder and E4's worktree capture hash permit the forged fixture; E5/E6 use filesystem/worktree state rather than the rev tree. The fresh replay did not plant counterfeit inputs.

## Verification boundary

No tests, builds, linters, formatters, or edits were performed. No tool installs. Report confined to this assigned path. The round-62 plan itself was absent (the `plan/` directory was empty), so “final” here means the R61 final revision referenced by the frozen R61 receipts, not an independently located round-62 final revision. The C1 forged-control behavior cited above is the existing R61 committed receipt, not a new clean fixture replay of its separate scratch-repo revision.