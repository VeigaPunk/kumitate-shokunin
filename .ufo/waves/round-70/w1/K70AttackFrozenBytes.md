# K70AttackFrozenBytes — attack report (round-70, w1, seat K70AttackFrozenBytes)

Axis: operability (C1 replay isolation). Milestone: AttackFrozenBytes.
Assignment edge: **the two frozen shell sources (`.ufo/waves/round-69/probe/c1-controls.sh`,
`c2-controls.sh`) must remain byte-exact across all transformation modes** — i.e. the only
bytes an implementation may change are the sanctioned deltas of the *private copies*; the
frozen sources themselves must never be written, and the private copies must be byte-exact
except for the sanctioned deltas.

Candidate `build/K70ExecRunner/control-replay.mjs` was **absent** at inspection time
(`ls: cannot access .../K70ExecRunner/`), so per the seat spec I attacked the contract and the
frozen counter directly, with runnable isolated counterexamples in private scratch.

## Frozen byte ground truth (observed)

```
$ sha256sum <copies of the two frozen scripts>
01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12  c1-controls.sh
679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4  c2-controls.sh
$ git -C <lane> show 78b98d762ccf3e3a0961f94c4042eaabd2bcb706:.ufo/waves/round-69/probe/c1-controls.sh | sha256sum
01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12  -
$ git -C <lane> show 78b98d762ccf3e3a0961f94c4042eaabd2bcb706:.ufo/waves/round-69/probe/c2-controls.sh | sha256sum
679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4  -
```

Lane working tree clean over the frozen scripts + r69 controls (read-only `git status`
observed empty). `/fast/scratch/hyaku/kumitate-r69` **absent** (r69 scratch was deleted after
landing) — this absence is load-bearing for AX1.

## AX1 — contract's named substitution set is insufficient: stale TMPDIR parent kills the frozen counter (DEFECT, contract-level)

The plan's implementation contract names exactly four substitutions ("substitute
LANE/PROBE/W/S assignments exactly once") plus removal of the c2 line-80 `/tmp/forge-sed.txt`
write. The frozen scripts carry a **fifth** path-coupled line that the contract does not name
(c1 line 75 / c2 line 105):

```
TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69" node "$PROBE" "$S/fx" "$REV" > "$W/c1-$MODE.txt" 2>&1 || RC=$?
```

This line is only safe because of an implicit coupling: the original `S=` default lives under
`${HYAKU_SCRATCH}/kumitate-r69`, and the script's own `mkdir -p "$S/fx"` creates that parent
as a side effect. The contract **mandates** relocating `S` to "a unique mkdtemp child under
the supplied work root", which breaks the coupling: `kumitate-r69` is never created, and the
r69 counters do `mkdtempSync(join(tmpdir(), '<fam>69.'))` at module top-level
(ledger69-probe.mjs:78, deprec69-probe.mjs:88) with `os.tmpdir()` honouring `TMPDIR`.

Counterexample (private scratch, copies only, originals never executed):

- Variant `letter` = the contract's four named substitutions only, TMPDIR line byte-exact
  (artifact `evidence/priv-letter.sh`, receipt `evidence/ce-a-letter-variant-receipt.txt`):
  ```
  Error: ENOENT: no such file or directory, mkdtemp '/fast/scratch/hyaku/kumitate-r69/ledger69.XXXXXX'
      at mkdtempSync (node:fs:3134:18)
      at file:///.../bin/probe-standin.mjs:19:17
  control=donothing exit=1 rev=feb82f1f...
  CONTROL-FAIL donothing
  ```
  Receipt first line is a node stack, not `LEDGER69_UNMET*` → the control's own PASS case
  never matches → `CONTROL-FAIL`, script exit 1. R3's requirement
  (`r.status===0 && text.includes(label) && text.includes('CONTROL-PASS '+mode)`) fails.
- Same failure against the **real frozen counter** (read-only execution of
  ledger69-probe.mjs against a scratch fixture repo, TMPDIR parent missing;
  `evidence/ce-a-real-ledger69-crash.txt`):
  ```
  Error: ENOENT: no such file or directory, mkdtemp '/.../ce-a/no-such-parent/ledger69.XXXXXX'
      at mkdtempSync (node:fs:3134:18)
      at file:///home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/ledger69-probe.mjs:78:11
  ```
- Variant `correct` = same four substitutions **plus** the fifth rewrite
  `TMPDIR="$S" node ...` (artifact `evidence/priv-correct.sh`; note `$S` exists by then and is
  reclaimed with the work tree):
  ```
  LEDGER69_UNMET held=0/7 checks=7 rev=5eb30d21... rule=L69 | standin-past-mkdtemp
  control=donothing exit=1 rev=5eb30d21...
  CONTROL-PASS donothing          (script exit 0, observed)
  ```

Freeze consequence: R3–R7 **all five** MISS → held caps at 5/10 (R1, R2, R8, R9, R10) →
`REPLAY70_UNMET`. No lane damage (the crash precedes every write; confirmed
`/fast/scratch/hyaku/kumitate-r69` still absent, no debris created). An implementation that
follows the contract letter-for-letter fails the round after doing everything else right.

Smallest safe correction: amend the contract sentence to name the TMPDIR-prefix rewrite as a
required fifth delta (value: the private `$S`, or delete the prefix so the harness-provided
`TMPDIR` applies), equivalently permit setting child env `HYAKU_SCRATCH` to a private root.
"Exactly once" should be read per assignment, not as an exhaustive whitelist.

## AX2 — "donothing" substitution trap overwrites prior lane receipts; the counter cannot see it (DEFECT mode + counter gap)

The frozen scripts' `donothing` mode describes a *fixture-level* transformation ("the base
tree, byte-exact"). A plausible implementation defect is to extend that "byte-exact" reading
to the *harness-level* path substitutions and skip the `W=` rewrite for donothing. Then the
private copy still writes `"$W/c1-donothing.txt"` with
`W="$LANE/.ufo/waves/round-69/controls"` — i.e. **over the real r69 receipt in the lane**.

Counterexample (simulated lane + simulated probe-archive tree in scratch; stand-in probe;
variant `wint` = W intentionally unsubstituted, all other deltas correct;
`evidence/ce-b-*`):

```
before: lane-receipt=7aa7d15e... tree-receipt=7aa7d15e...
wint exit=0
CONTROL-PASS donothing
after:  lane-receipt=916d2b5a... tree-receipt=7aa7d15e...
lane receipt content now:
LEDGER69_UNMET held=0/7 checks=7 rev=ce49d319... rule=L69 | standin-past-mkdtemp
control=donothing exit=1 rev=ce49d319...
```

The probe's preserved-check (`R3..R7`: `preserved=[...before].every(...)` over
`tree/.ufo/waves/round-69/controls/*`) is **tree-side only** — observed outcome:
`probe-style preserved check (tree-side only): PASS` while the lane-side prior receipt digest
changed (`FAIL (OVERWRITTEN)`). R1 covers only the two probe scripts, not the controls
receipts. So this implementation defect would score R3/R5 PASS while silently rewriting
committed r69 evidence bytes in the lane.

Freeze consequence: real files `.ufo/waves/round-69/controls/c1-donothing.txt` (and the c2
counterparts) byte-mutated in the lane working tree; divergence from BASE invisible to every
R70 check; recoverable only by checkout. The defect is irreversible in-flight (prior bytes
destroyed — demonstrated: the `correct` variant run afterwards leaves the already-overwritten
file untouched; the original digest `7aa7d15e...` is unrecoverable from the lane).

Smallest safe correction: implementation must apply the LANE/PROBE/W/S substitution set
**mode-invariantly** (the harness transformation is identical for all five modes; only the
fixture build differs, and that happens at script runtime, not transform time). Optional
counter hardening (outside this claim's scope, disclose-only): extend the preserved-check to
also hash the lane-side receipt files, so lane clobbering is scored instead of silent.

## AX3 — inherited repository environment: `git -C` alone does not defend; scrub is mandatory (DEFECT mode)

Contract says "use explicit fixture-root git arguments and scrub inherited repository
environment". Both halves are needed; anchoring alone is provably insufficient. The frozen
counters refuse a poisoned env (`POISON = NODE_OPTIONS, LD_PRELOAD, GIT_DIR, GIT_WORK_TREE,
GIT_INDEX_FILE, GIT_OBJECT_DIRECTORY, GIT_COMMON_DIR, TAR_OPTIONS`, ledger69-probe.mjs:64 /
deprec69-probe.mjs:73) but that guard only covers the **probe process**. The private copy's
bash-level fixture git ops (`git init/add/commit`, and c2's
`git -C "$LANE" archive ... | tar -x`) run **first**, under whatever env the implementation
passes through.

Observed (scratch repos `victim`, `hijack`):

```
$ env GIT_DIR=$S/ce-c/victim/.git git -C $S/ce-c/hijack add -A      # add rc=0
$ git -C victim ls-files --cached
alien1.txt
alien2.txt                              # victim index hijacked through `git -C`
$ env TAR_OPTIONS="--transform=s/pay/PWNED/" tar -xf tiny.tar -C extract
extracted members: PWNED.txt            # inherited TAR_OPTIONS silently rewrites extraction
```

Under `GIT_DIR` aimed at the lane, c1's fixture `git init/add/commit` would stage and commit
fixture bytes **into the lane repo** — precisely the forbidden "mutating git in lane" — and
c2's `git -C "$LANE" archive 14057f...` would read from the wrong object store (fixture build
fails, `CONTROL-FAIL`). If the poison instead reaches the probe, the receipt honestly shows
`LEDGER69_UNMET ... | ENV_POISONED:GIT_DIR` with exit 2 → `CONTROL-FAIL` (exit≠1) → R-miss;
honest, but still a miss. Note: command-execution via
`TAR_OPTIONS="--checkpoint-action=exec=touch <path>"` is rejected by GNU tar 1.35
("non-option arguments in TAR_OPTIONS", observed); the pure-option `--transform` injection
above is the working demonstration of env tampering.

Observed defense: `env -u NODE_OPTIONS -u LD_PRELOAD -u GIT_DIR -u GIT_WORK_TREE -u
GIT_INDEX_FILE -u GIT_OBJECT_DIRECTORY -u GIT_COMMON_DIR -u TAR_OPTIONS git -C <fx> ...`
stages into the fixture repo only (fresh victim stayed `git status` clean; defended extract
yields the unrenamed `pay.txt`).

Smallest safe correction: implementation scrubs at least the frozen counters' POISON set from
the private copy's environment (the house pattern already exists: `CHILD_ENV` allow-list,
ledger69-probe.mjs:77 / deprec69-probe.mjs:87 — "reuse existing patterns"), and anchors
fixture git ops with `git -C "$S/fx"` (c1's `cd`-based ops converted) plus the c2 archive
kept as `git -C "$LANE"`.

## Sanctioned byte-delta table (ground truth for "byte-exact across all transformation modes")

Reference private copies + unified diffs at `build/K70AttackFrozenBytes/ref/`
(`c1-controls.private.sh`, `c2-controls.private.sh`, `c1.private.diff`, `c2.private.diff`,
generator `mkpriv.py`). Transform is **mode-invariant** — one private copy per frozen source,
`MODE` remains a runtime argument. Sanctioned deltas, verified by `diff -u` and EOF `cmp`:

| source | sanctioned changed lines |
|---|---|
| c1-controls.sh | `PROBE=` (1), `W=` (1), `S=` (1), `TMPDIR=` prefix (1) — 4 line replacements |
| c2-controls.sh | `PROBE=` (1), `W=` (1), `S=` (1), `TMPDIR=` prefix (1), removal of the line-80 `> /tmp/forge-sed.txt` write (1) — 4 replacements + 1 removal |

`LANE=` may keep its literal (it is read-only: `cp` source for c1, `git -C "$LANE" archive
14057f3e...` for c2 — rev presence verified read-only: `cat-file -t` → commit). Both
references pass `bash -n`. Two process notes from generating the reference itself: (1) my
first generator emitted a spurious trailing newline — caught only by `diff -u`/EOF `cmp`,
which is exactly the verification an implementation must run post-transform ("refuse
unexpected frozen source bytes" precondition: verify source sha256 against
`01efd6...`/`679b7d...` **before** transforming — note `counter-pins.json` pins the r69
*probes* but **not** the two control scripts, so the implementation must embed these two
digests itself); (2) c2 line-80 removal must be content-anchored, not line-numbered.

## Limits (disclosed, not defects)

- R1 compares archived-tree bytes at REV against BASE — tree-side only; lane working-tree
  frozen bytes are enforced out-of-band (discipline/freeze-map). Combined with AX2's gap,
  lane-side receipt clobbering is invisible to the counter.
- c2 `forgecapture` live arm is network-dependent per plan; failure is reported, never
  waived. Not exercised here (no network dependence needed for the AX1–AX3 demonstrations).
- AX1/AX2 receipts use a stand-in probe reproducing the frozen counters' startup order
  (POISON → usage gate → top-level mkdtemp); AX1 was additionally confirmed against the real
  ledger69-probe.mjs (crash at :78 observed).

## Tooling record

No installs/updates. Observed preexisting tools: node v24.21.0, Python 3.14.8,
git 2.56.0, GNU tar 1.35. Pacman untouched (paused per assignment).

## Artifact index (all under the seat's unique paths)

- `build/K70AttackFrozenBytes/ref/` — reference private copies, unified diffs, generator
  `mkpriv.py`, stand-in probe `probe-standin.mjs`.
- `build/K70AttackFrozenBytes/evidence/` — `ce-a-*` (letter-variant receipt, correct-variant
  output, real-ledger69 crash, both transformed copies), `ce-b-*` (wint output, simulated
  prior receipt, simulated receipt after overwrite).
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackFrozenBytes/` deleted after copying
  receipts/artifacts (verified); `/fast/scratch/hyaku/kumitate-r69` confirmed absent
  throughout — no debris, no lane writes, no git mutations anywhere.
