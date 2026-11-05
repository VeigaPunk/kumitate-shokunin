source: S### (fifo(7) — https://man7.org/linux/man-pages/man7/fifo.7.html, §"Opening a FIFO"; read 2026-11-05, capture `.ufo/waves/round-91/K91ScribeSources/fifo.7.html`, sha256 9c9bbe3240e79d086dc46cfb546dcedadb9a9ba56408994131e6482fa500749f); S### (open(2) — https://man7.org/linux/man-pages/man2/open.2.html, §DESCRIPTION `O_NOFOLLOW`/`O_NONBLOCK` and the ELOOP entry; read 2026-11-05, capture `.ufo/waves/round-91/K91ScribeSources/open.2.html`, sha256 d665489cadb85624d98fae03a8d8d06209030f32735cff8aeba949ad8491c789); S### (Node.js `fs` — https://nodejs.org/api/fs.html, §`fs.fstatSync(fd[, options])`, §`fs.Stats` (`isFile()`, `isCharacterDevice()`, `isFIFO()`, `size`), §`fs.constants` `O_NOFOLLOW`/`O_NONBLOCK`; read 2026-11-05, capture `.ufo/waves/round-91/K91ScribeSources/fs.html`, sha256 c175e0e7340f0bfb686077581e885504890780f20e7206de0cba5e3cc5c29d50; page title "File system | Node.js v24.22.2 Documentation", host node v24.21.0); lane evidence `.ufo/waves/round-91/controls/ctl-base-v4-at-rev.txt`, `.ufo/waves/round-91/controls/table.txt`, `.ufo/waves/round-91/controls/ctl-ref-fd-fstat.txt`, `.ufo/waves/round-91/probe/probe91-c1.mjs` (sha256 3bd88e8efe4bb0851b5ef57c90e80792eada34cd0f2450922d75fbe9fc313f4c), and this seat's own runs under `.ufo/waves/round-91/K91ScribeLesson/evidence/`
verified-at: 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4 (the round-91 freeze commit; the pre-data control table and the frozen probe are committed there. The v5 instrument integrates at the round-91 commit that carries this entry — the L1 fills the measured line. This seat measured the EXECUTOR'S CANDIDATE, not the integrated instrument: `.ufo/waves/round-91/K91ExecInst/receipt-bind-v5.mjs` sha256 33ee29ebcbe8eaafe11a4b55493a42f8d4d7ce20af5f5df118ab7d68c063013d scores `C91_C1: HELD held=56/56` exit 0 at the freeze rev, receipt `.ufo/waves/round-91/K91ScribeLesson/evidence/probe-v5-run1.txt`)
recheck: `node .ufo/waves/round-91/probe/probe91-c1.mjs --lane . --work <scratch> --alt /fast/scratch/hyaku --rev <40-hex> --tool scripts/receipt-bind.mjs` (expect `C91_C1: HELD held=56/56` exit 0 for the integrated v5 and `C91_C1: UNMET held=52/56` exit 1 for the v4 bytes at `2b1b8bf3`, failing exactly `ext-zero`, `ext-null`, `ext-fifo`, `ext-overcap`); the same probe on the v4 bytes at the freeze rev is this seat's receipt `.ufo/waves/round-91/K91ScribeLesson/evidence/probe-base-v4-at-rev.txt`

# Bounded external reads for a receipt's instrument (v5)

## The class the instrument recognises

A receipt field line `cmd=` names an instrument. When that token is ABSOLUTE and resolves OUTSIDE
the lane, the instrument has no revision to be read at: it is hashed from the file on disk and
counted `external=` (`scripts/receipt-bind.mjs`, the `fromDisk` branch). v4 took the bytes with
`readFileSync(abs)` after an `lstat` that was consulted only for the symlink test — no type test,
no size test. v5 replaces that read with a descriptor discipline.

v5's external read is four steps, in order:

1. **open** the path `O_RDONLY | O_NOFOLLOW | O_NONBLOCK`;
2. **fstat** that descriptor;
3. **refuse** (FAIL-CLOSED `UNRESOLVED`, exit 2) unless the descriptor is a REGULAR file and its
   `st_size` is `<= 16777216`;
4. **read** the bytes from that same descriptor.

The positive twins are part of the class, not exceptions to it: an EMPTY regular external file
whose receipt carries `sha256("")` binds CLEAN `external=1`, and a sparse regular file of exactly
16777216 bytes with its correct digest binds CLEAN `external=1`.

## What is refused, and why

| refused input | why the refusal is right | source |
|---|---|---|
| character device `/dev/zero` (content never reaches EOF) | the digest is over the bytes of a file; a device that never ends gives no finite content, and reading it costs memory until the process dies. v4 read it until the address-space limit killed it, so the run produced NO verdict at all — not a wrong one, none. | S### (open(2)); lane receipt `ctl-base-v4-at-rev.txt` arm `ext-zero` |
| character device `/dev/null` (reads empty) | an empty read is not evidence that the named file is empty; it is evidence that the path names a device. v4 hashed the empty string and reported CLEAN `external=1` — a clean verdict for a file it never read. | S### (Node.js `fs`, `fs.Stats.isCharacterDevice()`); lane receipt `ctl-base-v4-at-rev.txt` arm `ext-null` |
| FIFO with no writer | a FIFO's content is whatever a writer sends; with no writer the content is undefined, and a BLOCKING open waits for one forever, so the run produced no verdict within the bound. | S### (fifo(7): "Normally, opening the FIFO blocks until the other end is opened"; "A process can open a FIFO in nonblocking mode. In this case, opening for read-only succeeds even if no one has opened on the write side yet"); lane receipt `ctl-base-v4-at-rev.txt` arm `ext-fifo` |
| directory | a directory is not an instrument; v4 already refused it (its `readFileSync` threw), and the refusal must be by TYPE, not by the accident of what a read does. | lane receipt `ctl-base-v4-at-rev.txt` arm `ext-dir` (PASS on v4 and on v5) |
| regular file with `st_size > 16777216` | the digest is over the whole content, so the content must fit in memory; a size bound is a memory bound. v4 read such a file whole and reported CLEAN `external=1` even when the receipt carried its CORRECT digest. | lane receipt `ctl-base-v4-at-rev.txt` arm `ext-overcap` |

Two properties of the discipline carry the argument, and both are why the check is on the
descriptor rather than on the path:

- **`O_NONBLOCK` makes the open of a writer-less FIFO return immediately** instead of blocking, so
  the TYPE test can run and the FIFO is refused by type rather than by timeout (S### fifo(7);
  S### open(2) `O_NONBLOCK`).
- **`O_NOFOLLOW` keeps the symlink refusal on the same object that is read.** A symlinked external
  instrument is refused (`SYMLINK_INSTRUMENT`), and `O_NOFOLLOW` makes the open fail with `ELOOP`
  rather than following the link, so the bytes that are hashed can never be the link target's
  (S### open(2): "If path is a symbolic link and the O_NOFOLLOW flag is also specified, then the
  open fails, with the error ELOOP"; S### Node.js `fs`, `O_NOFOLLOW`).
- **`fstat` decides type and size on the opened object**, so the decision and the read see the
  same file, and `fs.Stats` exposes exactly the predicates the decision needs
  (`isFile()`, `isCharacterDevice()`, `isFIFO()`, `size`) (S### Node.js `fs`).

## The do-nothing evidence

The v4 bytes at the freeze revision are the do-nothing control
(`.ufo/waves/round-91/controls/ctl-base-v4-at-rev.txt`, sha256 of the instrument
`35f4f25e6130dd827747ceff8ced80682d96c6c04d9516f2a463ce58cc7c1fce`):

```
ARM ext-zero: FAIL A=FAIL B=FAIL | A: bound=OUT exit=null  | B: bound=OUT exit=null
ARM ext-fifo: FAIL A=FAIL B=FAIL | A: bound=OUT exit=null  | B: bound=OUT exit=null
ARM ext-null: FAIL A=FAIL B=FAIL | A: bound=in exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1 | B: bound=in exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1
ARM ext-overcap: FAIL A=FAIL B=FAIL | A: bound=in exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1 | B: bound=in exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1
C91_C1: UNMET held=52/56
```

`bound=OUT exit=null` is the key line: for `/dev/zero` and for the writer-less FIFO, v4 did not
return a verdict at all inside the 20 s wall bound under a 2 GiB address-space cap — the probe
records `exit=null` because the process was killed, not because it answered. `bound=in exit=0 …
external=1` is the other key line: for `/dev/null` and for the over-cap file, v4 answered, and
answered CLEAN. This seat re-ran the frozen probe on the same v4 bytes and got the same four
arms and the same headline (`.ufo/waves/round-91/K91ScribeLesson/evidence/probe-base-v4-at-rev.txt`).

## The control table (pre-data, committed with the plan)

`.ufo/waves/round-91/controls/table.txt`, 14 controls, each scored by the frozen probe at the
freeze rev. Every control is the v4 bytes with ONE edit at the external read line, except the two
carried round-90 constructions and the absent/absent-file controls:

| control | verdict | failing arms |
|---|---|---|
| base-v4-at-rev (do-nothing) | UNMET 52/56 | ext-zero, ext-null, ext-fifo, ext-overcap |
| dev-prefix (refuse `/dev/*`) | UNMET 54/56 | ext-fifo, ext-overcap |
| refuse-external | UNMET 49/56 | selftest, detect-r86-at-rev, detect-r86-renamed, escape-relative, alias-ancestor-external-twin, ext-empty-twin, ext-atcap |
| type-only (no cap) | UNMET 55/56 | ext-overcap |
| cap-only (no type check) | UNMET 53/56 | ext-zero, ext-null, ext-fifo |
| cap-edge-minus1 (cap at 16777215) | UNMET 55/56 | ext-atcap |
| refuse-empty | UNMET 55/56 | ext-empty-twin |
| bounded-nonblock (bounded read, no type check) | UNMET 54/56 | ext-null, ext-fifo |
| r90-global-strip + ref graft | UNMET 54/56 | selftest, midtoken-invisible |
| r90-tmpdir-gated + ref graft | UNMET 47/56 | selftest + 8 prefix arms, each `A=PASS B=FAIL` |
| r90-roundpath-gated + ref graft | UNMET 47/56 | selftest + 8 prefix arms, each `A=PASS B=FAIL` |
| refuse-all | UNMET 8/56 | 48 arms |
| absent | UNMET 0/56 | all |
| **ref-fd-fstat (POSITIVE control)** | **HELD 56/56** | — |

The table is the argument that the claimed behaviour is exactly this edit and not a refusal in
disguise: `refuse-all` scores 8/56 and `refuse-external` 49/56, while the positive control — the
descriptor discipline and nothing else — reaches 56/56. `cap-only` and `type-only` each fail
exactly the half they omit, so neither half alone is the class.

## Measured status

- The positive control reaches the terminal score: `.ufo/waves/round-91/controls/ctl-ref-fd-fstat.txt`
  prints `C91_C1: HELD held=56/56` exit 0.
- The do-nothing control does not: `ctl-base-v4-at-rev.txt` prints `C91_C1: UNMET held=52/56`
  exit 1.
- This seat's own run of the frozen probe on the executor's v5 candidate
  (`.ufo/waves/round-91/K91ExecInst/receipt-bind-v5.mjs`, sha256 `33ee29eb…63013d`) at the freeze
  rev prints `C91_C1: HELD held=56/56` exit 0, with every arm `A=PASS B=PASS`
  (`.ufo/waves/round-91/K91ScribeLesson/evidence/probe-v5-run1.txt`). That is a candidate
  measurement, not the integrated instrument's; the L1 measures the integrated bytes at M.

## Limits

- **Atomicity against a concurrent path swap is NOT claimed.** The type and size are decided by
  `fstat` on the descriptor and the bytes come from that descriptor, so the decision and the read
  see the same open file. What is not claimed is atomicity of the whole sequence against a
  swap performed between the `lstat` symlink test and the `open`, or between the `open` and the
  `fstat`: the sentinel's rows A7/A8 (RD-3/RD-4) are probabilistic races with no deterministic
  arm, and the round-91 plan lists them as not claimed. The receipt open additionally carries
  `O_NONBLOCK` (RD-4 hardening) — that is hardening, not a claim.
- **A pseudo-file's `st_size` understates its content.** The cap is read from `fstat`, and a
  `/proc` or `/sys` regular file reports `st_size` 0 while reading it yields content — measured
  here: `stat -c '%n type=%F size=%s' /proc/self/status` prints
  `/proc/self/status type=regular empty file size=0`. So a size-from-fstat cap does not bound the
  read of a pseudo-file, and the type test does not refuse it either (it is a regular file). No
  declared arm covers a pseudo-file instrument; the class is unmeasured here and is routed, not
  claimed.
- **In-lane blob size is not bounded by this cap.** The cap applies only to the `fromDisk` branch.
  A lane-relative or lane-absolute instrument is hashed from `git cat-file blob <rev>:<path>`, and
  its size at the judged revision is bounded by git's own limits, not by 16777216. The plan lists
  in-lane blob size as not claimed.
- **A refusal aborts the whole run.** The refusal is FAIL-CLOSED `UNRESOLVED` for the receipt
  whose `cmd=` names the refused instrument, so one receipt naming a device ends the binding with
  exit 2 rather than being counted as a drift. That is the intended precedence
  (usage > fail-closed > drift > clean) and is what the probe's `isFail(r, 'UNRESOLVED')` arm
  requires; it also means a directory of receipts containing one device-named receipt yields no
  per-receipt tally.
- **The empty regular file is not an exemption.** `sha256("")` on an empty regular file binds
  CLEAN `external=1`; the refusal is on the TYPE, so "empty" is only a special case of "regular".
  The `refuse-empty` control (55/56, failing `ext-empty-twin`) shows what refusing emptiness
  would cost.
- **The FIFO class is bounded, not explained.** v5 refuses a FIFO with no writer without waiting
  for a writer. A FIFO WITH a writer is a regular-file-shaped race, not a case the probe arms: the
  writer's bytes are whatever the writer sends, so no digest of them is stable.
