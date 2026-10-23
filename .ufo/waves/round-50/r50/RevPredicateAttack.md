# RevPredicateAttack — attack on the frozen C1 counter (`bindguard50-probe.mjs`, rule G50)

Seat: KumitateR50.RevPredicateAttack (reviewer), round 50. Pre-data attack: holes reported, nothing fixed.
Target: `.ufo/waves/round-50/probe/bindguard50-probe.mjs` (committed at 378b6e7) + `.ufo/waves/round-50/plan.md` §C1.
Method: full read of the counter and of `scripts/cap-run.mjs` (HEAD `6927903` bytes via `git show`, plus the uncommitted working-tree diff), then empirical mutants on scratch copies (`mktemp` git repos built with `git archive` from HEAD `378b6e7` and base `ff40d7d`; no lane checkout was touched). All scratch trees and host proof files were removed afterward.

## Result in one line

**GUARD_HELD held=8/8 (exit 0) was printed against a cap-run that provably exposed host /tmp read-write.** Receipt (scratch rev `3ed201071896aeb5433190afd5485066096b832c`):

```
  G1 PASS present
  G2 PASS refused=8/8
  G3 PASS exit=0 bound_rw=true tmpfs=true
  G4 PASS exit=0 VERDICT: PASS
  G5 PASS exit=0 VERDICT: PASS
  G6 PASS pins=5/5
  G7 PASS exit=0 PROXY: MATCH (A=43 C=22 operability=9; C1=19/19 C2=112/112 coverage=10; S=88/88 coverage:s
  G8 PASS exit=0 host_marker=false
BINDGUARD50: GUARD_HELD held=8/8 checks=8 rev=3ed201071896aeb5433190afd5485066096b832c rule=G50 caprun_sha256=77411ba2c20b8c33116c5f1acdfef32a38027274c0338222dd934e9b0c211071
```

The mutant ("liar") deferred the `--bind /tmp` refusal until *after* the child ran, then printed a fake `CAP_RUN: USAGE late-refusal` and exited 64. Direct harm demo, before the probe run:

```
$ node <scratch>/scripts/cap-run.mjs --mem 128 --tasks 16 --budget 20 --bind /tmp -- node -e "require('fs').writeFileSync('/tmp/r50rpa-liar-proof','x')"
CAP_RUN: USAGE late-refusal (RPA-MUTANT lies after the child ran)
liar-exit=64
-rw-r--r-- vgpnk vgpnk 1 ... /tmp/r50rpa-liar-proof
>>> HOST FILE EXISTS (child ran despite exit-64 USAGE)
```

Before the mechanical re-pin, the same liar rev scored `held=6/8` — G2 `PASS refused=8/8` and G4 `VERDICT: PASS` were already green; the only misses were G6/G7 because *my scratch commit* did not re-pin `pin.cap-run` (declared `64fafb42…` vs computed `77411ba2…`). Re-pinning the liar's own sha (the exact step R50-7/R50-9's workflow mandates after any cap-run edit) flipped G6/G7 and produced the 8/8 above. **The pins detect uncommitted change, not wrong behavior — at the scored close rev the pin is recomputed from the same tree by construction, so they cannot close this hole.**

## Findings by severity

### F1 CRITICAL — "lie about exit 64": G2+G4 cannot detect refuse-after-spawn (demonstrated end-to-end)

- Mechanism: G2 observes only `r.status === 64` and `/^CAP_RUN: USAGE /` on the last stderr+stdout line; the committed selftest's usage arms (HEAD bytes, `git show HEAD:scripts/cap-run.mjs` line ~317) check exactly the same two things. No committed check asserts that a refused bind left no bwrap/systemd-run scope, no child stdout token, and no host file. A cap-run that runs the child (bind applied) and *then* prints USAGE/64 passes both.
- Why G3/G8 don't help: they exercise a legit subdir bind and a no-bind run — never the refused strings. **100% of guard detection load sits on G2's eight exit-code observations plus G4's selftest**, and both are verdict-shape-only.
- Committed closure: **none at HEAD**. Pending closure: the L1's **uncommitted** working-tree diff adds exactly the missing checks — `refusalMarker(label, args, cwd)` (asserts exit 64 + USAGE last + child token absent from stdout + host file absent; invoked for `--bind /tmp` and for `cwd ∈ {/, /tmp, /proc, /sys, /dev, /run}`) and a `run()` cwd refusal (`realpathSync(cwd)` against `isSandboxManagedMount`). This diff would flip G4 to FAIL on my liar mutant. **Until it is committed and present at the scored rev, F1 is open.** Verification gap for the close: re-run the F1 mutant against the close rev — G4 must FAIL.
- Exploitability: HIGH as a regression class — any refactor that reorders usage-after-run (or a crash-path that emits USAGE after spawning) reintroduces exposure invisibly; no fraud required.

### F2 HIGH — G2's refusal set cannot distinguish a realpath guard from a resolve-only guard (symlink-parent subpath exploit shown)

Mutant S2: `realpathSync(v)` → `resolve(v)` in the bind arm, refusal list otherwise unchanged. Frozen probe on that rev: `G2 PASS refused=8/8`, `G4 PASS` (probe run rev `f454cbfc002ad89a72d533db37c4e8ee12f76a4e`). Direct exploit on the mutant:

```
$ ln -sfn /tmp /tmp/r50rpa-alias            # parent component is a symlink to /tmp
$ mkdir -p /tmp/r50sub-real                 # real leaf directory
$ node <scratch2>/scripts/cap-run.mjs ... --bind /tmp/r50rpa-alias/r50sub-real -- node -e "write('<bind>/r50subproof','x')"
CAP_RUN: EXIT code=0 ...
>>> HOST FILE EXISTS via symlink-component subpath
```

- A *bare* symlink destination is refused by bwrap itself (`bwrap: Can't mount on symlink destination /tmp/r50rpa-alias`, exit 1) — which is why the counter's normalize-only set {/tmp, /tmp/, /tmp/.} plus bwrap's own destination check leave this class invisible: `bad(r)`'s realpath is the **only** layer that catches parent-component aliases riding the legal "subdirectory bind" carve-out (G3's B under tmpdir is exactly such a subpath, symlink-free).
- The claim text "after `realpath`, so symlink aliases are covered" (plan §C1) is a clause the frozen predicate does not verify. A future refactor swapping realpath for resolve prints held=8/8.
- Committed closure: none (the selftest has no symlink case either). Exploitability: MEDIUM (requires the committed guard to lose realpath; current bytes have it, and the working tree additionally realpaths the cwd).

### F3 MEDIUM (claim-sizing / do-nothing control) — the After state already holds at the freeze commit

Probe at pristine HEAD bytes (scratch rev `6f1cd4600e817bf454ec199631f7a0e1bbd517c8` = commit `378b6e7` "round-50: freeze guard and closure corrections"):

```
BINDGUARD50: GUARD_HELD held=8/8 checks=8 rev=6f1cd46... rule=G50 caprun_sha256=64fafb42...
```

The guard, `pin.bind-oracle` (R50-7) and the stanza re-derivation (R50-9) are all landed and consistent **at the freeze commit, before wave data**. The committed base control (`controls/CtlG50-base-ff40d7d-r1.txt`: `GUARD_UNMET held=5/8`, G2 miss on the /tmp triple, G6 `pin.bind-oracle=absent`, G7 DRIFT) proves the counter non-vacuous — but the counter cannot date the work. The close report must state that C1's after-measurement equals the freeze state, and that the L1's remaining uncommitted hardening (refusalMarker, cwd refusal — the F1/F2 closures) is **not measured by C1 at all**.

### F4 MEDIUM (scorer-trust) — the rev argument is never resolved or bound

The probe never `rev-parse`s `<rev>`: the receipt prints the argument verbatim (`rev=…`), and both `git cat-file -e <rev>:path` and `git archive <rev>` accept any tree-ish. A close receipt citing `rev=master`, `rev=HEAD` or an ambiguous short sha is not caught by any committed check. (Extraction itself is internally consistent: one `git archive | tar -x` into `T`, every check runs against `T` — I found no cross-tree read; G7's `UFO_SRC` only feeds proxy-check's origin-term resolution.) Reported, not fixed.

### F5 LOW (acceptable limit, record it) — G3's TMPFS reading is forgeable; the marker term is the real detector

At base `ff40d7d` bytes (pre-guard), `--bind /tmp` with G3-shaped child code:

```
TMPFS=true
CAP_RUN: EXIT code=0 ...
-rw-r--r-- ... /tmp/r50rpa-g3   >>> HOST MARKER EXISTS
```

A stacked bind of host /tmp leaves the underlying tmpfs row in `/proc/self/mounts`, so the child's `some()` check prints `TMPFS=true` while host /tmp is exposed — the reading alone is fooled, exactly the named attack vector. G3's `!existsSync(hostMarker)` term closes it (a read-write bind delivers the marker to the host; a read-only bind fails the child's write → nonzero exit). Residual: see F1 — G3/G8 never run a /tmp bind, so this closure never engages for the actual hole.

### F6 LOW / WITHDRAWN — G6 regex laxity (my prediction was wrong)

I predicted `k.replace('.', '\\.')` leaves a second dot unescaped in `pin.bind-oracle`. Test: `pin.bindXoracle=<64hex>` does **not** match — the key has only one dot and the regex is fully literal. Remaining minor laxity: G6 matches `^pin.X=<64hex>$` lines **anywhere** in SCORECARD.md (no stanza-block scoping, first match wins). This is backstopped by G7, whose block parser rejects unknown gate-pin keys (`GATE_PIN_KEY_UNKNOWN`) and reports `PIN_UNPINNED` for unpinned gate files; the only unbackstopped case is a rev shipping a proxy-check that lies — instrument-trust, mitigated procedurally (open diff review; pins make later edits visible), consistent with plan limit (b). Acceptable limit.

### F7 LOW (environment) — isolation checks assume `os.tmpdir() === '/tmp'`

`hostMarker = join(tmpdir(), marker)` while children write literal `/tmp/…`; G3's bind source `B` is `mkdtemp(tmpdir())`. A scorer environment with `TMPDIR` set elsewhere blinds G3/G8 leak detection and moves G3's subdir-legality assertion out from under /tmp. The counting command does not pin `TMPDIR`. Honest-scorer limit; record.

### F8 INFO (wording drift) — probe header vs plan/code on G7

The counter's header comment says "G7 `node scripts/proxy-check.mjs --strict`"; the plan §C1 and the code say `--self <rev-extract> --strict`. Printed line is the frozen rule (r42 rule); flagged for CritPredicateWording, no code impact.

## Named-vector verdicts (the four assigned examples)

1. **Do-nothing control** — counter non-vacuous at base (committed receipt `CtlG50-base-ff40d7d-r1.txt`, 5/8); **but already HELD at the freeze commit** (F3).
2. **Cap-run that lies about exit 64** — works; `held=8/8` demonstrated (F1). No committed closure at HEAD; closure exists only as uncommitted working-tree bytes.
3. **Extraction reading the wrong rev** — no cross-tree read found; the residual hole is the unresolved `<rev>` argument (F4).
4. **G3's TMPFS check fooled** — reading forgeable, closed by G3's own host-marker term (F5); detection load nonetheless sits entirely on G2 (F1).

## Residual risk and verification gaps

- **F1/F2 closure is uncommitted.** The `refusalMarker` + cwd-refusal diff must land in the close rev; afterward G4 must FAIL on the F1 liar and on a cwd=/tmp run. Suggest the main agent re-run the F1 mutant against the close rev as a committed-closure check.
- **Fake-instrument class remains possible by construction**: the probe executes rev-shipped code (cap-run, bind-oracle, proxy-check) with full host trust and observes only exit codes, files and stdout; a rev whose scripts emulate all eight checks can print HELD with no sandbox at all (G6 stays honest only because the stanza would pin the fake's own bytes). Mitigation is procedural, not a committed check. Low likelihood (requires committed fraud in open review), total impact.
- Untested here: bwrap's symlink-destination refusal for deeper parent-component chains (single symlink component tested); the counter never probes cwd-origin exposure (`cap-run` invoked with cwd=/tmp — the working tree refuses it; HEAD does not; the frozen counter always runs cwd=`T`).
- I did not attack `repairs50-probe.mjs` / LEDGER_HELD — out of this seat's scope (RevRepairsSemantics owns it).

## Tooling record

No installs. Used preinstalled `node`, `git`, `tar`, `coreutils` only. Three scratch git repos under `mktemp -d /tmp/r50rpa-s*` (built with read-only `git archive` from lane commits `378b6e7`/`ff40d7d`); all removed, host proof files (`/tmp/r50rpa-liar-proof`, `/tmp/r50rpa-g3`, `/tmp/r50sub-real/`, `/tmp/r50rpa-alias` symlink) deleted. Lane checkout untouched throughout.
