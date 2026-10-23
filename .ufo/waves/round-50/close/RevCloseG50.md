# RevCloseG50 — residual closure re-review, claim C1 (rule `G50`)

- Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only; HEAD = measured rev `ab3c64e9aaaff80faf3a2c93743287e44def4084`, working tree clean apart from this untracked `close/` directory).
- Seat: `KumitateR50.RevCloseG50` (reviewer). Date: 2026-10-23.
- Method: two independent probe runs from a shell with `cwd` = the lane, ≥60 s apart; probe source and `scripts/cap-run.mjs` read at the measured rev (extracted via `git archive`, never the working tree); every pin hash recomputed by hand with `sha256sum`. No LSP device exists in this session; review was source-level (the probe is plain `.mjs`, no semantic server available — recorded as required).

## Runs (verbatim)

Run 1 — start `2026-10-23T20:03:26,197325856-03:00`, exit `0`, wall 8.87 s:

```
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

Run 2 — start `2026-10-23T20:05:00,448839760-03:00` (94.25 s after run 1), exit `0`, wall 8.60 s: identical output block, byte-for-byte, including the same `caprun_sha256`.

Both verdicts: `BINDGUARD50: GUARD_HELD held=8/8 checks=8 rev=ab3c64e9aaaff80faf3a2c93743287e44def4084 rule=G50 caprun_sha256=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5`, exit `0`. The counter satisfies its own contract: `held=8/8` + exit 0, no `GUARD_UNMET`, no `FAIL-CLOSED`.

## Independently computed sha256

`sha256sum` over bytes extracted with `git archive ab3c64e9… | tar -x` into scratch `/tmp/g50rev-A`:

| file | my sha256 | SCORECARD.md `kumitate-gate-pins-v1` pin | match |
|---|---|---|---|
| `scripts/cap-run.mjs` | `e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5` | `pin.cap-run=` (line 318) same | ✓ |
| `scripts/bind-oracle.mjs` | `c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5` | `pin.bind-oracle=` (line 319) same | ✓ |
| `scripts/cap-spawn.mjs` | `1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0` | `pin.cap-spawn=` (line 320) same | ✓ |
| `scripts/proxy-check.mjs` | `0d5c00c26950788f3ef20fc86fac6c78523438a8d75637021fe89ea4a506f929` | `pin.proxy-check=` (line 308) same | ✓ |
| `scripts/counter-rerun.mjs` | `c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b` | `pin.counter-rerun=` (line 321) same | ✓ |

`caprun_sha256` printed by the probe equals my hash of the extracted `cap-run.mjs` — G6/G7 pin correspondence confirmed by independent recomputation, not by trusting the probe.

## Do the checks mean what the header says? (source judgement)

Guard implementation in `cap-run.mjs` at rev (lines 113, 131–135, 184–186):

- `isSandboxManagedMount(p) = p==='/' || p==='/tmp' || /^\/(?:proc|sys|dev|run)(?:\/|$)/.test(p)` — covers every root the claim names (`/, /tmp, /run, /proc, /sys, /dev`) plus anything beneath the four managed mounts.
- `--bind` refuses when the predicate hits either `realpathSync(v)` or `resolve(v)`; non-absolute or nonexistent dirs fail earlier with the same exit-64 `CAP_RUN: USAGE` arm. `/tmp/`, `/tmp/.` normalise to `/tmp`; a symlink alias resolving into a managed root is refused via the realpath leg.
- The implicit cwd bind (`run()` line 185: `realpathSync(cwd)` through the same predicate, exit 64 pre-spawn) implements C1's "implicit cwd bind" clause; the cwd bind at line 194 uses the lexical path only after the realpath refusal, so a symlinked cwd cannot smuggle a managed root.
- Refusals are all pre-spawn `usage()` (writeSync to fd 2 + exit 64), exactly what G2 asserts (`status===64` AND last line `^CAP_RUN: USAGE `). Non-vacuous.
- Legal `/tmp/<subdir>` preserved: the predicate tests exact `/tmp` equality, not prefix — G3 proves it behaviourally.

## Per-check table (my own reasoning)

| check | verdict | reasoning |
|---|---|---|
| G1 presence | PASS | `git cat-file -e <rev>:scripts/cap-run.mjs`; minimal but a real gate — fail-closed to exit 2 path if extraction broke. |
| G2 refusals 8/8 | PASS | Tests `/tmp`, `/tmp/`, `/tmp/.`, `/`, `/run`, `/proc/self`, `rel`, nonexistent — exactly the refusal set frozen in `plan.md` §C1. Each arm is a real spawned run asserting exit 64 + usage line. Caveat below: only 6 of 8 arms are mount-guard arms; `rel`/nonexistent are CLI-validation arms, and `/dev`,`/sys` are absent from the probe list. Both gaps are closed inside G4's selftest (see below), and the probe matches the frozen spec verbatim, so this is faithful-to-freeze, not a probe defect — but G2 alone does not exercise `/dev`, `/sys`, or a realpath-only catch. |
| G3 legal bind + tmpfs | PASS | Genuine end-to-end: mkdtemp under host `/tmp`, bound rw (fixture round-trip `in.txt`→`out.txt` observed on host), child reads its own `/proc/self/mounts` and reports `/tmp` is `tmpfs` (TMPFS=true asserted from inside the sandbox, not from the host), and the child's `/tmp/<marker>` write is absent on the host. This is the core "keeps `/tmp/<subdir>` legal" claim, honestly tested. |
| G4 cap-run selftest | PASS | Weight-bearing. The selftest's usage-arm block (lines 315–344) independently exercises: `--bind /`, `/tmp`, `/run`, `/proc/self`, `/dev`, `/sys` (the two probe-missing roots), a **symlink source → `/tmp`** (realpath-only catch), and `cwd ∈ {/, /tmp, /proc, /sys, /dev, /run, XDG_RUNTIME_DIR}` — which is the only exercised arm of C1's "implicit cwd bind" clause anywhere in the eight checks. It also verifies refusal is pre-spawn (planted host file + child token). G4 carrying this makes the `held=8/8` claim materially stronger. |
| G5 bind-oracle selftest | PASS | Mutant-based oracle (drop-binds, extra-bind `/etc`, no-tmpfs mutants scored); real behavioural coverage of the bind model, not a tautology. |
| G6 pins | PASS | Verified above: all five pinned sha256s equal my recomputation over extracted bytes. |
| G7 proxy strict | PASS | `proxy-check --self <extract> --strict` → `PROXY: MATCH` exit 0. Scorecard stanza consistent at rev with live origin checkout. Caveat below: tangential to the bind-guard claim and env-coupled. |
| G8 tmpfs unregressed | PASS | No-bind child writes `/tmp/<marker>`; absence on host asserted. Direct regression arm for the ordinary case. |

## Vacuous / mis-scoped items (named, unsoftened)

1. **G7 is mis-scoped relative to C1.** It gates `GUARD_HELD` on scorecard-proxy consistency against a hardcoded host path (`ORIGIN='/home/vgpnk/Projects/ufo-fsd-alpha'`) — a hygiene property, not bind semantics. A drift between SCORECARD and that checkout would flip the whole counter to `GUARD_UNMET` while the bind guard itself is perfectly sound. It is the frozen predicate's own choice (plan.md line 53–54), so the probe is faithful — but as a C1 check it is the least on-claim and the only environmentally coupled one (a lane without that origin checkout would fail-closed on an unrelated dependency). Not vacuous; mis-scoped.
2. **G2's name oversells its coverage.** `refused=8/8` sounds like eight mount-guard arms; two are argument-validation arms (`rel`, nonexistent) that any reasonable arg parser would refuse, and the frozen set omits `/dev` and `/sys`. The actual full managed-mount coverage lives in G4's selftest arms. The claim as scored is still true end-to-end, but a reader of `G2 PASS refused=8/8` alone would overestimate the probe-level guard coverage.
3. **C1's "implicit cwd bind" clause has no probe-level arm.** It is exercised only inside G4's selftest (`cwd=` loop, 7 cases). Coverage is real but indirect; `GUARD_HELD` could in principle hold with a broken cwd-refusal if G4's selftest were itself wrong. Acceptable because the selftest is pinned (`pin.cap-run`) and behavioural, but worth naming.
4. No check is vacuous. G1 is the weakest but is a necessary precondition gate.

## VERDICT: HOLD

Reasons: (a) both spaced reruns read `GUARD_HELD held=8/8` exit 0 with identical `caprun_sha256`; (b) my independent sha256 of `cap-run.mjs` and all five G6 pins match the extracted bytes exactly; (c) the refusal predicate in source covers every root C1 names (`/`, `/tmp`, `/run`, `/proc`, `/sys`, `/dev`) on both realpath and resolved-dst legs, plus the implicit-cwd clause, and `/tmp/<subdir>` remains legal — G3 proves it from inside the sandbox; (d) the probe implements the plan.md §C1 frozen predicate verbatim, including its refusal set; (e) the three named weaknesses (G7 mis-scope, G2's mixed arm composition, cwd-clause indirection) are coverage-labeling issues, not soundness holes — every one is backstopped by pinned, behavioural checks. The claim means what the header says.
