# K91Sentinel — attacks.md

Seat `K91Sentinel`, round 91 (hyaku run 15, attempt 1). Security re-run of the round-90 sentinel
attacks against the round-91 POSITIVE control, plus new attacks on the external branch.

Lane read-only throughout. Every fixture, receipt dir and tool snapshot lives under the seat scratch
`/fast/scratch/hyaku/kumitate-r91/K91Sentinel/`; every cited receipt is copied into
`.ufo/waves/round-91/K91Sentinel/receipts/`. Nothing under `scripts/`, `corpus/`, `.ufo/pins/`,
`.ufo/waves/round-91/probe/`, `.ufo/waves/round-91/controls/` or `plan.md` was modified.
Tools installed: none (node v24.21.0, python3, prlimit, timeout — all preinstalled).

## Tools under test

| id | what | sha256 | provenance |
|---|---|---|---|
| `v4` | base receipt-bind v4 | `35f4f25e…cc1fce` | `git -C <lane> show 0bff4babeec90dd57ea36efeaa94b66db9af381d:scripts/receipt-bind.mjs` |
| `ref` | round-91 POSITIVE control | `bc3df527…94db` | `.ufo/waves/round-91/controls/ref-fd-fstat.mjs` (committed at `2b1b8bf3`) |
| `cand1` | first v5 candidate snapshot | `33ee29eb…63013d` | `.ufo/waves/round-91/K91ExecInst/receipt-bind-v5.mjs` — predates the bounded-read edit |
| `cand` | current worktree v5 candidate | `f39aab5c…3cc5e1` | snapshot of `scripts/receipt-bind.mjs` at the time of the run |
| `fix` | my remediation prototype | `29ad4875…b6642` | `ref` + a bounded read (see below) |

Snapshots: `.ufo/waves/round-91/K91Sentinel/tools/`.
Driver scripts: `attacks.py`, `probe2.py`, `candidate-battery.py`, `races.py`, `pseudo-verdict.py`,
`reproduce.py` (same directory). Logs: `attacks.log`, `probes.log`, `candidate-battery.log`,
`races.log`, `pseudo-verdict.log`, `reproduce.log`.

Fixture: a throwaway git repo at `$S/fixture-lane` (rev `e58cf577817974b43a94aa3059d09f2bbeccc2af`),
created with `git -C "$D" init -q`; `git -C "$D" rev-parse --show-toplevel` asserted equal to `$D`
before the first commit. Every tool run is `prlimit --as=2147483648 -- timeout 20 node <tool> …`.

## Alignment with the frozen scorer

The frozen probe was run directly against `ref` and against `cand` (probe is frozen; never edited):

```
node .ufo/waves/round-91/probe/probe91-c1.mjs --lane <lane> --work <scratch> --alt /fast/scratch/hyaku \
  --rev 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4 --tool <ref|cand>
  -> C91_C1: HELD held=56/56   (both, exit 0)
```

So the attack environment and the positive control both reproduce the committed
`controls/table.txt` row `ref-fd-fstat  C91_C1: HELD held=56/56`.

## 1. Round-90 attacks re-run — table

`ref` and `cand` both satisfy every declared class. `v4` fails four of them, exactly as
`controls/table.txt` records (base-v4-at-rev: UNMET 52/56, failing ext-zero, ext-null, ext-fifo,
ext-overcap).

| id | attack | class | v4 result | ref result | cand result | expected |
|---|---|---|---|---|---|---|
| S0 | in-lane arm (driver sanity) | carried v4 arm | CLEAN external=0 | CLEAN external=0 | CLEAN external=0 | all CLEAN |
| A4 | `cmd=node /dev/zero` | IN-CLASS char device | **no verdict**, killed by a fatal V8 abort (shell exit 133/134; the abort path varies between SIGTRAP and SIGABRT), V8 `Fatal process out of memory` | FAIL-CLOSED UNRESOLVED exit 2, 0.02 s | FAIL-CLOSED UNRESOLVED exit 2, 0.02 s | UNRESOLVED exit 2 |
| A5 | external FIFO, no writer | IN-CLASS FIFO | **no verdict**, exit 124 (20 s timeout) | FAIL-CLOSED UNRESOLVED exit 2, 0.03 s | FAIL-CLOSED UNRESOLVED exit 2, 0.02 s | UNRESOLVED exit 2 |
| A6 | external regular file 512 MiB | IN-CLASS over-cap regular | **CLEAN external=1** (whole file read) | FAIL-CLOSED UNRESOLVED exit 2 | FAIL-CLOSED UNRESOLVED exit 2 | UNRESOLVED exit 2 |
| A7 | external symlink-swap race, 120 runs | OUT-of-CLASS (RD-3) | DRIFT 67, SYMLINK_INSTRUMENT 33, **CLEAN(LAUNDERED) 20** | SYMLINK_INSTRUMENT 41, DRIFT 56, UNRESOLVED 23, **CLEAN 0** | SYMLINK_INSTRUMENT 42, DRIFT 48, UNRESOLVED 30, **CLEAN 0** | ref/cand: zero CLEAN |
| A8 | receipt FIFO-swap race, 150 runs | OUT-of-CLASS (RD-4) | CLEAN 94, RECEIPT_UNREADABLE 50, **HUNG 6** | CLEAN 105, RECEIPT_UNREADABLE 43, **HUNG 2** | RECEIPT_UNREADABLE 81, CLEAN 69, **HUNG 0** | out of class; cand's O_NONBLOCK receipt open removes the hang |

A7/A8 are probabilistic. The `CLEAN(LAUNDERED)` row for A7 is a receipt whose `tool_sha256=` is the
digest of the symlink TARGET — a CLEAN there means the tool hashed the target's bytes, i.e. the
round-90 A7 laundering. The `O_NOFOLLOW` open closes it: `ref`/`cand` produce zero laundered CLEANs
in 120 runs each. A8's HUNG is the receipt-side race; `ref` still hangs (it has no `O_NONBLOCK` on
the receipt open), `cand` does not. Both are explicitly listed as NOT claimed in plan.md
("atomicity of the type/size check against a concurrent path swap (sentinel RD-3/A7, RD-4/A8)").

### Harness note (a defect I introduced and fixed)

My first race run reported all-`UNRESOLVED` for A7 and all-`RECEIPT_UNREADABLE` for A8 across all
three tools. That was my bug, not a tool finding: the racer's `os.symlink`/`os.mkfifo` raises EEXIST
on a stale temp file left by a previously killed racer, and the whole `try` block (including the
`os.replace`) is skipped, so the swap never happens and the instrument stays a plain file. Fixed in
`races.py` by unlinking the temp names before each iteration and clearing them before launch; the
numbers above are from the fixed harness and reproduce the independent first run
(`attacks.py`: A7 v4 CLEAN 17 / DRIFT 62 / SYMLINK_INSTRUMENT 41; A8 v4 HUNG 9). The invalid run's
numbers are not reported as findings.

## 2. New attacks on the external branch

| id | attack | class | v4 | ref | cand | expected |
|---|---|---|---|---|---|---|
| N1 | `/proc/self/fd/1` token | NEW pseudo-path | SYMLINK_INSTRUMENT | SYMLINK_INSTRUMENT | SYMLINK_INSTRUMENT | all refuse |
| N2 | `/dev/stdin` token | NEW pseudo-path | SYMLINK_INSTRUMENT | SYMLINK_INSTRUMENT | SYMLINK_INSTRUMENT | all refuse |
| N3 | external named unix socket | NEW non-regular (socket) | UNRESOLVED (ENXIO) | UNRESOLVED | UNRESOLVED | all refuse |
| N4 | external regular file mode 0000 | NEW unreadable regular | UNRESOLVED (EACCES) | UNRESOLVED | UNRESOLVED | all refuse |
| N5 | external sparse file 2^40 bytes | IN-CLASS over-cap regular | UNRESOLVED (ERR_FS_FILE_TOO_LARGE) | UNRESOLVED "too large" | UNRESOLVED "too large" | all refuse |
| N6 | external path through `/proc/self/root` | NEW alias path | CLEAN external=1 | CLEAN external=1 | CLEAN external=1 | all bind the same bytes |
| N7 | `cmd=node /dev/null` | IN-CLASS char device | **CLEAN external=1** (binds as empty) | UNRESOLVED | UNRESOLVED | UNRESOLVED |
| N8 | external directory | IN-CLASS directory | UNRESOLVED (EISDIR) | UNRESOLVED | UNRESOLVED | all refuse |
| N9 | external regular file 16777217 bytes (cap+1), correct digest | IN-CLASS over-cap regular | **CLEAN external=1** | UNRESOLVED "too large" | UNRESOLVED "too large" | UNRESOLVED |
| N10 | external regular file exactly 16777216 bytes (at cap), correct digest | IN-CLASS at-cap regular | CLEAN external=1 | CLEAN external=1 | CLEAN external=1 | all CLEAN |
| N11 | external empty regular file, sha256(empty) | IN-CLASS empty regular | CLEAN external=1 | CLEAN external=1 | CLEAN external=1 | all CLEAN |
| N12 | char device behind a symlinked parent (`<link>/dev/zero`) | IN-CLASS char device | **no verdict**, exit 133 (OOM) | UNRESOLVED | UNRESOLVED | UNRESOLVED |
| N13 | char device via `/proc/self/root/dev/zero` | OUT-of-CLASS (plan excludes) | **no verdict**, exit 133 | UNRESOLVED | UNRESOLVED | UNRESOLVED |
| N15 | external regular file behind a symlinked parent | NEW alias path | CLEAN external=1 | CLEAN external=1 | CLEAN external=1 | all bind the same bytes |

N12/N13 confirm the ref/cand behaviour is not a `/dev/`-string special case: the refusal comes from
`fstat` on the descriptor, so it holds through a symlinked parent and through `/proc/self/root`.

## 3. FINDING — the size-from-fstat cap does not bound the read (pseudo-files)

**Severity: MED (the positive control `ref` and the first v5 candidate snapshot were both wrong on
an IN-CLASS input).**

`ref` bounds the external read by `fstat(fd).size`. On Linux a procfs/sysfs pseudo-file is a
regular file (`S_ISREG`, so `xst.isFile()` is true) whose `st_size` is **0**. It therefore passes
both the type check and the cap check, and is then read to EOF — past the declared 16777216 bound.
plan.md assigns this hypothesis to the `ReviewProc` reviewer seat; my re-run independently confirms
it and, unlike that seat's brief, measures the verdict.

### 3a. IN-CLASS wrong verdict — `/proc/kallsyms` (reproduced twice)

`/proc/kallsyms` is a regular file, `st_size = 0`, content **22489015 bytes** (> the 16777216 cap),
and its content is stable across reads. The receipt carries the **correct** digest of that content.

```
rev=e58cf577817974b43a94aa3059d09f2bbeccc2af
tool_sha256=fee87b79c9e354e93ab9149339e51a81b01136c870b84de54de7ceb2c9eb463c
cmd=node /proc/kallsyms
exit=0
signal=none
```

| tool | reproduction 1 | reproduction 2 |
|---|---|---|
| `v4` (35f4f25e) | CLEAN matched=1 mismatched=0 unchecked=0 external=1 | CLEAN matched=1 mismatched=0 unchecked=0 external=1 |
| `ref` (bc3df527) | **CLEAN matched=1 mismatched=0 unchecked=0 external=1** | **CLEAN matched=1 mismatched=0 unchecked=0 external=1** |
| `cand1` (33ee29eb, first candidate) | **CLEAN matched=1 mismatched=0 unchecked=0 external=1** | **CLEAN matched=1 mismatched=0 unchecked=0 external=1** |
| `cand` (f39aab5c, current) | FAIL-CLOSED UNRESOLVED exit 2 | FAIL-CLOSED UNRESOLVED exit 2 |
| `fix` (29ad4875, my prototype) | FAIL-CLOSED UNRESOLVED exit 2 | FAIL-CLOSED UNRESOLVED exit 2 |

The expected verdict is FAIL-CLOSED UNRESOLVED exit 2: the file's content is 22489015 bytes, over
the cap. Instead the tool read all 22.5 MB and reported **CLEAN** — a wrong verdict on a declared
class ("a regular file larger than 16777216 bytes is FAIL-CLOSED UNRESOLVED … even when the receipt
carries its correct digest", plan.md claim class 2).

Receipts: `receipts/R1.kallsyms.{v4,ref,cand,fix}.rep{1,2}.txt`.

### 3b. No verdict at all — `/proc/self/pagemap` (reproduced twice)

`/proc/self/pagemap` is a regular file with `st_size = 0` and 274877906936 bytes (256 GiB) of
content — it never reaches EOF.

```
rev=e58cf577817974b43a94aa3059d09f2bbeccc2af
tool_sha256=0000000000000000000000000000000000000000000000000000000000000000
cmd=node /proc/self/pagemap
exit=0
signal=none
```

| tool | reproduction 1 | reproduction 2 |
|---|---|---|
| `v4` | **no verdict**, fatal V8 abort (shell 133/134) | **no verdict**, fatal V8 abort |
| `ref` | **no verdict**, fatal V8 abort | **no verdict**, fatal V8 abort |
| `cand1` (33ee29eb, first candidate) | **no verdict**, fatal V8 abort | **no verdict**, fatal V8 abort |
| `cand` (f39aab5c, current) | FAIL-CLOSED UNRESOLVED exit 2, 0.04 s | FAIL-CLOSED UNRESOLVED exit 2, 0.04 s |
| `fix` (29ad4875) | FAIL-CLOSED UNRESOLVED exit 2, 0.03 s | FAIL-CLOSED UNRESOLVED exit 2, 0.04 s |

This is the **round-90 A4 failure mode reproduced**: no fail-closed verdict is emitted at all. A4
(`/dev/zero`) was one of the two motivating rows for this round's claim; the same class of harm
survives the v5 edit whenever `fstat` under-reports the size.

Receipts: `receipts/R2.pagemap.{v4,ref,cand,fix}.rep{1,2}.txt`.

### 3c. Reachability

The path is reached through the ordinary absolute-token route; no special spelling is needed.
`/proc/self/pagemap` and `/proc/kallsyms` are absolute paths outside the lane, so the `fromDisk`
branch applies and the digest is computed from the file on disk. The same files are reachable
through a symlinked parent: `<scratch>/linkroot/proc/kallsyms` (linkroot → `/`) gives
CLEAN external=1 on the first candidate snapshot and FAIL-CLOSED UNRESOLVED on `fix`
(receipt `receipts/R1.symproc.cand.txt` / `receipts/R1.symproc.fix.txt`).

### 3d. Blast radius and class

`/proc/kallsyms` is world-readable on this host (mode `-r--r--r--`, 22489015 bytes). It is a
**declared class**: "an external regular file over or at the 16777216 cap or empty" (plan.md kill
rule, class list). The plan's excluded classes are TOCTOU atomicity (RD-3/RD-4), in-lane blob size,
a char device reachable without a `/dev/` spelling, new invisible code-point classes, RD-1 and RD-5.
A pseudo-file is none of those — it is an *external regular file whose content is over the cap*, and
the check that should have refused it is the cap check itself.

Severity is MED rather than HIGH because the outcome is bounded (a 22 MB read, or an OOM abort
inside the tool's own address-space limit) and not a forged clean on an in-lane instrument. It is
not LOW: the verdict is affirmatively wrong (CLEAN) on an over-cap external file, and the tool can
be driven to emit no verdict at all.

## 4. Smallest remediation

Bound the READ by the bytes actually read, not by `fstat`'s `st_size`: read from the descriptor in
chunks and refuse UNRESOLVED as soon as more than `MAX_INSTRUMENT_BYTES` bytes have arrived,
whatever the metadata said. The `st_size` check can stay as a cheap early-out.

Prototype (`tools/v5-bounded-read-prototype-29ad4875.mjs`, `ref` + this edit):

```js
const chunks = [];
let total = 0;
const buf = Buffer.alloc(65536);
for (;;) {
  const n = readSync(xfd, buf, 0, buf.length, null);
  if (n === 0) break;
  total += n;
  if (total > MAX_INSTRUMENT_BYTES) {
    throw new FailClosed('UNRESOLVED', `${file} external instrument too large: ${abs}`);
  }
  chunks.push(Buffer.from(buf.subarray(0, n)));
}
bytes = Buffer.concat(chunks, total);
```

Verified:
- the frozen probe still prints `C91_C1: HELD held=56/56` on the prototype (both fixture
  contexts, exit 0) — the declared arms, including `ext-empty-twin` and `ext-atcap`, still pass;
- the declared twins are preserved: at-cap (16777216) → CLEAN external=1, over-cap (16777217) →
  FAIL-CLOSED UNRESOLVED, empty → CLEAN external=1;
- `/proc/kallsyms` → FAIL-CLOSED UNRESOLVED exit 2 in 0.08 s (twice);
- `/proc/self/pagemap` → FAIL-CLOSED UNRESOLVED exit 2 in 0.03 s (twice).

The worktree candidate `f39aab5c` now carries an equivalent bounded read (its own wording:
"content exceeded the cap while reading; fstat size 0") and closes both reproductions. The current
candidate also scores `C91_C1: HELD held=56/56` on the frozen probe and passes every in-class row
of my battery.

## 5. Kill-rule assessment

**No kill.** The frozen kill rule needs a tool at 56/56 with a *committed* reproduction of a wrong
verdict on a declared class.

- `ref` (the positive control) reaches 56/56 **and** returns CLEAN on `/proc/kallsyms`, an
  over-cap external regular file with its correct digest — a wrong verdict on a declared class. So
  `ref` is a candidate for the kill rule on that reading.
- However, `ref` is not the claim: it is the plan's *committed positive control*, built by the
  plan's own control generator as "the claimed edit". plan.md (controls section) treats it as the
  demonstration that the predicate is reachable by exactly the claimed edit, and `controls/table.txt`
  records it as HELD 56/56. A finding against the control that encodes the claim is a defect in
  the claim's *scope*, not a demonstration that the claim is unmet — the same way the round-90
  sentinel's rows A4/A5 became the plan's motivating evidence rather than a v4 kill.
- The probe's own arms do not include a pseudo-file: `ext-overcap` and `ext-atcap` use
  `truncateSync` to make real sparse files of 16777217 and 16777216 bytes, whose `st_size` is
  correct. No arm distinguishes a size-from-fstat cap from a read-bounded cap, so the frozen
  predicate cannot see this defect — the positive control's 56/56 is consistent with the defect.
- The integrated candidate `f39aab5c` is 56/56 on the frozen probe and is CORRECT on every declared
  class I could construct, including the two pseudo-file reproductions.

Conclusion: the finding is a defect in the claim's stated scope and in the committed positive
control, and it is already fixed in the current candidate. It is routed, not a kill. The plan's
"not claimed" list does not mention pseudo-files, so the honest label is **in-class for the cap
class, routed because the frozen predicate does not exercise it** — Main should decide whether the
claim text should name the read-bound explicitly.

## 6. Per-attack receipt index

All under `.ufo/waves/round-91/K91Sentinel/receipts/` (139 files). Each holds the exact command,
exit status, wall time, verdict line, stdout and stderr.

| prefix | what |
|---|---|
| `S0.*`, `A4.*`, `A5.*`, `A6.*`, `N*.{v4,ref,cand}.txt` | first battery (v4 + ref) |
| `A7.txt`, `A8.txt` | race receipts (the `cmd=`/`tool_sha256=`/`rev=` pair used by the racers) |
| `A7-static.*`, `N{1..15}.{v4,ref,cand}.txt` | three-tool battery against `cand` |
| `PS1.*`, `PS2.*`, `PS3.*` | pseudo-file verdict measurement |
| `R1.kallsyms.{v4,ref,cand1,cand,fix}.rep{1,2}.txt` | IN-CLASS wrong-verdict reproduction, `/proc/kallsyms`, twice |
| `R2.pagemap.{v4,ref,cand1,cand,fix}.rep{1,2}.txt` | no-verdict reproduction, `/proc/self/pagemap`, twice |
| `FIX.{at-cap,over-cap,empty}.{ref,fix}.txt` | declared-twin preservation check for the prototype |
| `R1.symproc.{cand,fix}.txt` | symlinked-parent reach to `/proc/kallsyms` |

## 7. Limits

- A7 and A8 are probabilistic; both reproduced in two independent runs with a fixed harness.
- `/proc/self/pagemap` sizes itself to the host's page tables; on a host with different RAM the
  content length differs, but it is far over the cap either way. `/proc/kallsyms` is 22489015 bytes
  on this host and its content is stable across reads.
- The pseudo-file class is environment-dependent: a host without procfs, or one where
  `/proc/kallsyms` is unreadable, would not exhibit it. The defect is in the size-from-fstat logic,
  which is host-independent.
- The prototype is my remediation proposal, not an integrated lane change; I did not modify
  `scripts/receipt-bind.mjs`.
