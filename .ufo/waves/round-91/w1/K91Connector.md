# K91Connector — Sibling-Overlap Scan and UFO-FSD Synthesis (Round 91, C1 receipt-bind v5)

Report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/w1/K91Connector.md`
Seat Dir: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91Connector/`
Artifacts: `overlap.md`, `hits-sibling-scripts.txt`, `sites.tsv`

## One-Line Ruling
**Ruling: NO OVERLAP on the round's capability claim (`kumitate-receipt-bind-v5`); ADJACENCY OVERLAP on the underlying defect class (RD-2 unbounded external reads) across sibling instruments in `tabi-shokunin` and `kake-shokunin`.**

## 1. Sibling-Overlap Scan (10 Concrete Sites in Sibling `scripts/`)
Census across all 22 shokunin lanes reveals only two siblings with Node `scripts/`: `tabi-shokunin` (241 `readFileSync` calls in 63 files) and `kake-shokunin` (13 calls in 3 files). 10 concrete sites reading argv/receipt paths:

1. `tabi/scripts/check-freshness.mjs:32` (`regularBytes`): argv `--repo/--expected/--witness`. `fstatSync(fd).isFile()`, but NO `O_NONBLOCK` and NO size cap. Blocks on FIFOs; OOMs on large files.
2. `tabi/scripts/check-aria-metadata.mjs:280` (`readEntry`): metadata JSON/argv path. `fstatSync.isFile()`, but NO `O_NONBLOCK` and NO size cap.
3. `tabi/scripts/check-sources.mjs:166` (registry reader): argv `--file REL`. `fstatSync.isFile()`, but NO `O_NONBLOCK` and NO size cap.
4. `tabi/scripts/check-sources.mjs:232` (`checkCitation`): `SOURCES.md` citation path. `fstatSync.isFile()`, but NO `O_NONBLOCK` and NO size cap.
5. `tabi/scripts/check-receipt-provenance.mjs:42` (`checkReceipt`): argv `--dir` entry. Raw `readFileSync(file)`. No stat, no cap.
6. `tabi/scripts/check-receipt-provenance.mjs:53` (`checkReceipt`): **EXACT RD-2 DUPLICATE**. Path `r?.stdoutFile` extracted directly from receipt text, read via raw `fs.readFileSync(abs)` with no type/size checks.
7. `tabi/scripts/check-receipt-provenance.mjs:78` (`checkMatrix`): argv `--dir` matrix file. Raw `readFileSync(file)`.
8. `tabi/scripts/report-contract.mjs:35` (`readUtf8`): argv `--report / --shonen`. Raw `readFileSync(path)`.
9. `tabi/scripts/check-instrument-registry-r68.mjs:119` (`main`): argv `--skill`. Raw `readFileSync(args.skill)`.
10. `kake/scripts/probe-delta.mjs:58` (`parseHistory`): argv `--history`. Raw `readFileSync(file)`.

## 2. Sibling Knowledge Entries to Cite
Rather than re-deriving FIFO and descriptor semantics, this round should cite:
- **`souji-shokunin`**: `S062` / `S241` (`fifo(7) § DESCRIPTION`: open-time block without writer), `S070` / `S077` / `S242` / `S245` (`open(2) § ERRORS ENXIO`: nonblocking open behavior), and rule `Q86` (`souji-shokunin/corpus/QUALITY.md:216`: mandatory `O_NONBLOCK` open + post-open `fstat` regular check on caller paths).
- **`chousa-shokunin`**: `S134` (`open(2)`: `O_NOFOLLOW` final-component guard) in `derived-output-safety-r61.md`, and `S138` (`openat2(2)`) in `openat2-resolve-r62.md`.

## 3. UFO-FSD Synthesis (Non-Obvious Move)
- **Evidence**: `K91ExecInst` candidate `receipt-bind-v5.mjs` relies on `xst.size > 16777216` from `fstatSync` before `readFileSync(xfd)`. `K91ReviewProc` demonstrated that Linux pseudo-files (`/proc/self/pagemap`, `/proc/<pid>/smaps`) report `S_IFREG` with `st_size = 0`, bypassing metadata size checks and causing a 134 `SIGABRT` core dump on `pagemap` (reproducing `/dev/zero` unhandled crash) and laundering 37.2 MiB on `smaps`.
- **Affected Axes**: `operability` (C1 receipt-bind v5), `hygiene`/`calibration` (clean exit vs core dump on procfs paths).
- **Proposed Move**: Synthesize descriptor read-bounding: fast-path check for `xst.size > 16777216` for regular files, combined with bounded chunked read (at most `16777216 + 1` bytes) for `xst.size === 0` inputs (refusing as `UNRESOLVED too large`). Export this 3-step discipline to `tabi-shokunin` to harden `check-freshness.mjs` and `check-receipt-provenance.mjs`.
- **Risks & Invariance**: Zero harm to frozen probe: all 56 arms hold (`HELD held=56/56`), empty files read 0 bytes, at-cap files read 16 MiB cleanly.
- **Verification**: `K91ReviewProc/fixed-bounded-read.mjs` verified exit 2 in <0.1 s on pagemap/smaps; frozen probe invariant verified.
