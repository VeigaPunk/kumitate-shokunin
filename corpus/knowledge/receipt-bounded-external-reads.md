source: S263 (corpus/SOURCES.md, fifo(7), https://man7.org/linux/man-pages/man7/fifo.7.html § DESCRIPTION: a read-only nonblocking open of a FIFO succeeds with no writer); S264 (corpus/SOURCES.md, open(2), https://man7.org/linux/man-pages/man2/open.2.html § O_NONBLOCK, § O_NOFOLLOW); S265 (corpus/SOURCES.md, Node.js v24 fs API, https://nodejs.org/docs/latest-v24.x/api/fs.html § fs.fstatSync(fd), § File open constants)
verified-at: 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4 (round-91 freeze: probe, controls, positive control); the v5 instrument integrates at the round-91 commit that carries this entry (sha256 f39aab5c3de0e708c6f9f8d77b20b2ede540bc61518620a55521318ce66cc5e1)
recheck: `node .ufo/waves/round-91/probe/probe91-c1.mjs --lane . --work <scratch> --alt /fast/scratch/hyaku --rev <40-hex> --tool scripts/receipt-bind.mjs` (expect `C91_C1: HELD held=56/56`; the v4 bytes read `UNMET held=52/56`), and `node .ufo/waves/round-91/close-l1/class-sampler.mjs --lane . --rev <40-hex> --work <scratch> --tool scripts/receipt-bind.mjs --k 6` (expect `CLASS_SAMPLER: HELD held=36/36`)

# Bounded external reads for a receipt's instrument (receipt-bind v5)

## The class

A receipt's `cmd=` names an instrument. An ABSOLUTE token outside the lane has no revision to be
read at, so `scripts/receipt-bind.mjs` hashes it from disk and counts it `external=`. Until v4 that
branch did `lstat` (symlink test only) and then `readFileSync(abs)`: no type test, no size test.

v5's external read, in order:

1. open the path `O_RDONLY | O_NOFOLLOW | O_NONBLOCK` (S264);
2. `fstatSync` that descriptor (S265);
3. refuse as `FAIL-CLOSED UNRESOLVED` (exit 2) unless the descriptor is a regular file with
   `st_size <= 16777216`;
4. read the descriptor in 64 KiB chunks and refuse `UNRESOLVED` as soon as more than 16777216
   bytes have arrived, whatever `st_size` said.

The positive twins belong to the class: an empty regular file carrying `sha256("")` and a regular
file of exactly 16777216 bytes carrying its digest both bind CLEAN `external=1`.

## What is refused, and why

| input | v4 behaviour (do-nothing control) | why refusal is right |
|---|---|---|
| `/dev/zero` (character device, no EOF) | no verdict: aborted under a 2 GiB address-space cap (`ext-zero bound=OUT exit=null`) | a device without EOF has no finite content to digest |
| `/dev/null` (character device, reads empty) | `CLEAN external=1` with `sha256("")` | an empty read from a device is not evidence of an empty file |
| FIFO with no writer | no verdict: the blocking open never returned (`ext-fifo bound=OUT`) | a blocking open waits for a writer; a nonblocking read-only open returns at once (S263), so the type test can run |
| directory | `UNRESOLVED` (the read threw) | refused by type, not by the accident of a read error |
| regular file, `st_size` > 16777216, correct digest | `CLEAN external=1` | the digest is over the whole content; the cap is the memory bound |
| procfs regular file with `st_size` 0 and large or endless content (`/proc/self/pagemap`, `/proc/kallsyms`, `/proc/<pid>/smaps`) | pagemap: no verdict (V8 out of memory); kallsyms: `CLEAN` past the cap | `st_size` understates a pseudo-file; only a read bound bounds memory |

Receipts: `.ufo/waves/round-91/controls/ctl-base-v4-at-rev.txt` (the four failing arms);
`.ufo/waves/round-91/K91ReviewProc/hypothesis.md` and `.ufo/waves/round-91/K91Sentinel/attacks.md`
(pseudo-files, two runs each).

## Why the descriptor, not the path

- `O_NONBLOCK` makes the open of a writer-less FIFO return, so the FIFO is refused by type rather
  than by a timeout (S263, S264: "Neither the open() nor any subsequent I/O operations on the file
  descriptor which is returned will cause the calling process to wait").
- `O_NOFOLLOW` fails on a symlink leaf (S264), so the opened object is the named file. v5 keeps the
  earlier `lstat` symlink refusal (`SYMLINK_INSTRUMENT`); the flag closes the lstat-to-open window
  for the leaf only.
- `fstatSync(fd)` decides type and size on the opened object (S265), and the bytes come from the
  same descriptor.
- `st_size` is not a read bound. A procfs file is `S_IFREG` with `st_size` 0, so the type test and
  the size test both pass; the chunked read is the bound.

## Measured status (round 91)

- The positive control (`controls/ref-fd-fstat.mjs`, steps 1–3 with a whole read) and the integrated
  v5 both read `C91_C1: HELD held=56/56`; v4 reads `UNMET held=52/56`. Refuse-all reads 8/56 and
  refuse-external 49/56: blanket refusal is not the class.
- **The capability is not admitted.** Three seat constructions also read 56/56 and are wrong one
  token away inside a declared class (FIFO without `.sh`, over-cap at a size other than 16777217,
  a non-empty directory): `.ufo/waves/round-91/K91CriticA/scores.md`. The frozen kill rule fires
  (round-91 lesson). The class sampler (`close-l1/class-sampler.mjs`) separates them (UNMET on
  both runs) from v5 (`HELD held=36/36` twice): QUALITY Q85.
- Harm: v4 and the positive control agree on all 43 committed close directories and 479 single
  receipts (`.ufo/waves/round-91/K91CriticB/harm.md`); no real-history external instrument is in a
  refused class.

## Limits

- Atomicity against a concurrent path swap is not claimed. The receipt-FIFO race (A8) hung 0 of
  150 runs on the candidate and the symlink-swap race (A7) laundered 0 of 120
  (`K91Sentinel/attacks.md`); both are probabilistic measurements, not arms.
- In-lane instruments are hashed from `git cat-file blob <rev>:<path>`; their size is not capped
  by this rule.
- One refused instrument fails the whole run closed (precedence fail-closed > drift), so a receipt
  directory with one device-named receipt yields no per-receipt tally.
- A FIFO with a writer is refused by type like any FIFO; its content is whatever the writer sends,
  so no digest of it would be stable anyway.
- The sampler varies name, extension, over-cap size and directory emptiness; a construction keyed
  on a token it does not vary still passes it.
