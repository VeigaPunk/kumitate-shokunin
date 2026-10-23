# CritCloseClaims — residual C1 review

VERDICT: DISSENT

Dissent concerns measurement attribution and two lesson sentences, not an observed bypass of the measured guard. Axes: **operability + coverage (orchestration & tooling)**. This is a critic recommendation, not an admission or canonical judgment.

Measured revision A: `ab3c64e9aaaff80faf3a2c93743287e44def4084`.
Pre-hardening parent P (`227b9e6^`): `6927903f99bbc26e397aa47387aa76950f42b3a5`.

## 1. G2 enumeration versus the implementation's refusal domain

**Answer:** G2 does not enumerate every relevant path. The implementation nevertheless refused all six adversarial inputs exercised here, including the three requested `/tmp`-prefixed aliases, `/run/user/1000`, `/proc/1`, and `/sys/fs/cgroup`. No bypass was observed.

The frozen G2 inputs are exactly `/tmp`, `/tmp/`, `/tmp/.`, `/`, `/run`, `/proc/self`, a relative path, and a nonexistent directory (`probe/bindguard50-probe.mjs:81-89`; plan:47-55). In particular, G2 itself has no `/sys` or `/dev` input, descendant runtime/cgroup input, symlink fixture, or implicit-cwd case. G4 delegates to the candidate's own selftest; the new selftest does exercise additional roots and a created symlink (`scripts/cap-run.mjs:315-344`). Those are different evidence sources.

At A, `isSandboxManagedMount` is:

```js
(p) => p === '/' || p === '/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p)
```

Explicit binds check both `realpathSync(v)` and `resolve(v)` before launching; the implicit cwd checks its realpath (`scripts/cap-run.mjs:113,127-135,181-186`). Thus the four non-tmp trees include descendants, whereas `/tmp/<subdir>` deliberately remains legal. This is not a policy of rejecting every host subtree under `/tmp`.

### Executed underlying-runner checks

The JS tool harness loaded **unaltered committed source bytes**, not working-tree bytes, and supplied them to Node on stdin. This avoids creating an extracted script or symlink fixture. Its relevant executed code was:

```js
const { spawnSync: critSpawn, execFileSync: critExec } = await import('node:child_process');
const { realpathSync: critRealpath, readlinkSync: critReadlink } = await import('node:fs');
const { createHash: critHash } = await import('node:crypto');
const critLane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const critRev = 'ab3c64e9aaaff80faf3a2c93743287e44def4084';
const critBytes = critExec('git', ['-C', critLane, 'show', `${critRev}:scripts/cap-run.mjs`]);
const critLimits = ['--mem', '128', '--tasks', '16', '--budget', '20'];
for (const d of ['/tmp/../tmp', '/tmp/../tmp/.', '/tmp/../proc/self/root/tmp',
                 `/run/user/${process.getuid()}`, '/proc/1', '/sys/fs/cgroup']) {
  const r = critSpawn('node', ['--input-type=module', '-', ...critLimits,
    '--bind', d, '--', 'true'], {
    input: critBytes, cwd: critLane, encoding: 'utf8', timeout: 30_000
  });
  console.log(`path=${JSON.stringify(d)} realpath=${critRealpath(d)} exit=${r.status} signal=${r.signal} error=${r.error?.message || 'none'}`);
  console.log(`stdout=${JSON.stringify(r.stdout)} stderr=${JSON.stringify(r.stderr)}`);
}
```

The equivalent command rendering for each input D is:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show ab3c64e9aaaff80faf3a2c93743287e44def4084:scripts/cap-run.mjs | node --input-type=module - --mem 128 --tasks 16 --budget 20 --bind "$D" -- true
```

Observed source SHA256: `e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5`. Observed `readlink('/proc/self/root')`: `/`. All six processes had `signal=null`, `error=none`, and empty stdout.

| Input D | Observed realpath | Exit | Observed stderr prefix |
|---|---|---:|---|
| `/tmp/../tmp` | `/tmp` | 64 | `CAP_RUN: USAGE --bind refuses "/tmp/../tmp"` |
| `/tmp/../tmp/.` | `/tmp` | 64 | `CAP_RUN: USAGE --bind refuses "/tmp/../tmp/."` |
| `/tmp/../proc/self/root/tmp` | `/tmp` | 64 | `CAP_RUN: USAGE --bind refuses "/tmp/../proc/self/root/tmp"` |
| `/run/user/1000` | `/run/user/1000` | 64 | `CAP_RUN: USAGE --bind refuses "/run/user/1000"` |
| `/proc/1` | `/proc/1` | 64 | `CAP_RUN: USAGE --bind refuses "/proc/1"` |
| `/sys/fs/cgroup` | `/sys/fs/cgroup` | 64 | `CAP_RUN: USAGE --bind refuses "/sys/fs/cgroup"` |

Every stderr prefix above was followed by the same observed suffix:

```text
 (root, /tmp, /proc, /sys, /dev and /run stay as the sandbox mounts them) (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)
```

The symlink case uses the existing procfs root link; it is not a newly created `/tmp` symlink fixture. Because its normalized destination also falls under `/proc`, this individual case does **not** independently isolate the source-realpath check. The measured counter's G4 additionally executes the runner's actual `/tmp` symlink fixture. Neither result is an exhaustive alias/race proof.

## 2. Is GUARD_HELD reachable without the post-data guard?

**Yes — more strongly, the exact pre-hardening parent already scores 8/8 with no SCORECARD edit at all.** This is a do-nothing control relative to the requested `227b9e6` guard diff, not relative to the original `ff40d7d` baseline.

### Executed frozen counters

Working directory: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

```sh
node .ufo/waves/round-50/probe/bindguard50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin ab3c64e9aaaff80faf3a2c93743287e44def4084
```

Observed output, successful exit 0:

```text
  G1 PASS present
  G2 PASS refused=8/8
  G3 PASS exit=0 bound_rw=true tmpfs=true
  G4 PASS exit=0 VERDICT: PASS
  G5 PASS exit=0 VERDICT: PASS
  G6 PASS pins=5/5
  G7 PASS exit=0 PROXY: MATCH (A=43 C=22 operability=9; C1=19/19 C2=114/114 coverage=10; S=88/88 coverage:s
  G8 PASS exit=0 host_marker=false
BINDGUARD50: GUARD_HELD held=8/8 checks=8 rev=ab3c64e9aaaff80faf3a2c93743287e44def4084 rule=G50 caprun_sha256=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5
```

```sh
node .ufo/waves/round-50/probe/bindguard50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6927903f99bbc26e397aa47387aa76950f42b3a5
```

Observed output, successful exit 0:

```text
  G1 PASS present
  G2 PASS refused=8/8
  G3 PASS exit=0 bound_rw=true tmpfs=true
  G4 PASS exit=0 VERDICT: PASS
  G5 PASS exit=0 VERDICT: PASS
  G6 PASS pins=5/5
  G7 PASS exit=0 PROXY: MATCH (A=43 C=22 operability=9; C1=19/19 C2=112/112 coverage=10; S=88/88 coverage:s
  G8 PASS exit=0 host_marker=false
BINDGUARD50: GUARD_HELD held=8/8 checks=8 rev=6927903f99bbc26e397aa47387aa76950f42b3a5 rule=G50 caprun_sha256=64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672
```

The truncated G7 strings above are the counter's own 90-character excerpts, not omitted failures.

### Strongest behavioral counterexample: same 8/8, different cwd refusal

Using the same stdin-source harness, the following was executed once for each revision R, with the spawned Node process's cwd set to `/tmp`:

```js
const bytes = critExec('git', ['-C', critLane, 'show', `${R}:scripts/cap-run.mjs`]);
const r = critSpawn('node', ['--input-type=module', '-', ...critLimits, '--', 'true'], {
  input: bytes, cwd: '/tmp', encoding: 'utf8', timeout: 30_000
});
```

Observed results:

```text
implicit-cwd=/tmp rev=6927903f99bbc26e397aa47387aa76950f42b3a5 exit=0 signal=null error=none
stdout=""
stderr="CAP_RUN: EXIT code=0 unit=cap-run-4192030-1792796668819-e2a147\n"

implicit-cwd=/tmp rev=ab3c64e9aaaff80faf3a2c93743287e44def4084 exit=64 signal=null error=none
stdout=""
stderr="CAP_RUN: USAGE refusing cwd \"/tmp\" because it would rebind a sandbox-managed mount (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)\n"
```

The child was only `true`: this establishes acceptance/refusal, not a newly performed host-file exposure experiment. The reviewed diff shows that P appends `--bind cwd cwd` after `--tmpfs /tmp` without the new cwd guard. Consequently, frozen G50 can report success for bytes lacking the claimed implicit-cwd refusal. G4's candidate-owned selftest changes alongside the implementation; it is not an independently fixed test of that new behavior.

### Pin provenance and control scope

Executed read-only commands:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff 227b9e6^ 227b9e6 -- scripts/cap-run.mjs
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff 227b9e6^ 227b9e6 -- SCORECARD.md
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show ab3c64e9 --format=fuller --stat --patch -- SCORECARD.md scripts/cap-run.mjs
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 227b9e6^:scripts/cap-run.mjs | sha256sum
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff 227b9e6 ab3c64e9 -- scripts/cap-run.mjs .ufo/waves/round-50/probe/bindguard50-probe.mjs
```

Relevant observed outputs:

```text
# Parent script hash:
64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672  -

# 227b9e6 SCORECARD diff:
-pin.cap-run=64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672
+pin.cap-run=957756adbc1f3156b30ef9fe545d93d62ab0edc660bb9262fe5b57cd1436e1f4

# ab3c64e9 SCORECARD diff:
-pin.cap-run=957756adbc1f3156b30ef9fe545d93d62ab0edc660bb9262fe5b57cd1436e1f4
+pin.cap-run=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5

# Last diff command: no output.
```

The guard diff preserves the existing explicit-bind predicate, extracts it as `isSandboxManagedMount`, adds the implicit-cwd check, and strengthens selftests. The pin fix changes no runner or G50 bytes. Its C2 count also changes 113/113 to 114/114, so the close commit is not literally only a pin-line edit.

The existing `close/G50-227b9e6e.txt` was **read, not rerun**: it records `held=6/8`, with only G6/G7 missing because `957756ad` differs from `e1d0a79b`. That is a pin-consistency negative control, not a negative control for absent cwd hardening.

The original baseline is different: `controls/CtlG50-base-ff40d7d-r1.txt` was **read, not rerun** and records G2 misses for the three `/tmp` spellings and `held=5/8`, exit 1. A SCORECARD-only edit cannot repair those behavioral misses. `git show 378b6e7 -- scripts/cap-run.mjs` shows the explicit `/tmp` refusal was already introduced in the freeze-corrections commit; `git diff 378b6e7 6927903 -- scripts/cap-run.mjs .ufo/waves/round-50/probe/bindguard50-probe.mjs SCORECARD.md` produced no output. This agrees with the previously filed `r50/RevControlReach.md:15-48` early-green finding.

No synthetic final-revision/predecessor-script hybrid or pin-only edited extraction was created or executed. The directly measured, stronger existence result is that P already satisfies all eight checks without any edit.

## 3. Named overstated or false-provenance sentences

1. **Lesson M4 — false universal temporal qualifier** (`corpus/lessons/round-50.md:56-57`):
   > "Shown able to fail: G50 read `GUARD_UNMET held=5/8` at base and `6/8` at the first guard commit, `8/8` only after the re-pin (M5)."

   The universal clause is **"`8/8` only after the re-pin"**. P already returned 8/8 in this review; the existing review also records 8/8 at `378b6e7`. The close re-pin restores 8/8 after a stale-pin regression; it does not first make 8/8 reachable.

2. **Lesson M5 — incorrect byte provenance** (`corpus/lessons/round-50.md:60-63`):
   > "... the commit re-pinned cap-run from its pre-guard bytes."

   The committed pre-guard script hashes to `64fafb42...`, not the declared `957756ad...`. The evidence supports "declared a stale/nonmatching cap-run pin," not the asserted provenance of that pin. This is a provenance defect, not a universal behavioral claim.

3. **SCORECARD round-50 — no directly falsified behavioral sentence.** Its root list, legal `/tmp/<subdir>` exception, and final 8/8 reading match the source and these runs. The universal wording **"symlink aliases are covered"** (`SCORECARD.md:1768-1769`) is supported for stable aliases resolving to refused roots by the realpath check; the finite tests do not establish arbitrary concurrent path changes. No race bypass was established, so none is asserted here. The material omission is that the 8/8 predicate was already satisfied before the post-data guard diff. Pairing the whole explicit-plus-implicit API surface with G50 should not be read as independent measurement of that entire delta.

The plan's `"any sandbox-managed mount path"` (`plan.md:145-147`) must likewise be read with its explicit `/tmp/<subdir>` exception and the exact predicate, not as a universal prohibition of host-backed descendants. G2 is a finite check list, not proof that every possible API spelling or mount-origin scenario was exercised.

## Impacted axes and smallest safe correction

- **Operability:** the actual cwd hardening is observable and the listed adversarial binds are refused. No operational regression or successful bypass was found.
- **Coverage / orchestration & tooling:** a green-at-P counter cannot attribute the added implicit-cwd guard to a new 8/8 transition. Repeating it or repairing a hash does not repair that discrimination gap.
- **Fixable reporting defects:** replace lesson M4's "only after" with "restored to 8/8 after the stale-pin regression; pre-hardening P was already 8/8"; replace M5's pre-guard-byte attribution with "stale/nonmatching pin." Disclose in SCORECARD/report that explicit `/tmp` protection pre-landed at `378b6e7` and that the unchanged G50 does not independently distinguish the subsequent cwd hardening.
- **Instrument limitation, not an edit to this frozen predicate:** retain the historical G50 readings unchanged. If a later claim needs independent whole-API coverage, freeze a caller-owned cwd refusal check with P as its negative control. The benign P-versus-A results above are residual-review evidence, not a retroactive amendment to G1-G8. Any effect on claim admission belongs to the canonical judge.

No lane implementation, existing document, git ref/index, `.ufo/state`, or peer message was changed. Only this assigned report was written; the permitted G50 counter used its own temporary fixtures. R50 and unrelated harm checks were not run by this seat, and no result for them is claimed. No tools were installed or updated.
