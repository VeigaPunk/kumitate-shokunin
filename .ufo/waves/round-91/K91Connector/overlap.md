# K91Connector — Sibling Overlap Scan and UFO-FSD Synthesis (Round 91, C1 receipt-bind v5)

Read-only on lane and sibling repositories. Writable: this seat directory (`.ufo/waves/round-91/K91Connector/`) and report (`.ufo/waves/round-91/w1/K91Connector.md`) only.
Scratch: `/fast/scratch/hyaku/kumitate-r91/K91Connector/` (cleaned before yield).

## Commands Run

```bash
# 1. Sibling scripts directories discovery
find /home/vgpnk/Projects/shokunin/ -maxdepth 3 -type d -name scripts
# Result: kumitate-shokunin/scripts, tabi-shokunin/scripts, kake-shokunin/scripts

# 2. Grep for readFileSync across all sibling scripts
grep -rn "readFileSync(" /home/vgpnk/Projects/shokunin/kake-shokunin/scripts /home/vgpnk/Projects/shokunin/tabi-shokunin/scripts > hits-sibling-scripts.txt
# Result: 254 matches across 66 files (tabi: 241 matches in 63 files, kake: 13 matches in 3 files)

# 3. Search for O_NONBLOCK, O_NOFOLLOW, and mkfifo across all 22 shokunin lanes
grep -rn --exclude-dir={.git,.ufo,node_modules,.scratch} -E "O_NONBLOCK|O_NOFOLLOW" /home/vgpnk/Projects/shokunin/*-shokunin/
# Result: Major codified precedents in souji-shokunin (Q86, S062, S070/S077, S241/S242/S245), chousa-shokunin (S134, S138-S140), and tabi-shokunin (check-freshness.mjs, check-aria-metadata.mjs, check-sources.mjs)
```

## 10 Concrete Sibling Sites (`readFileSync` on paths derived from argv / receipt text)

| # | Lane | Path:Line | Function / Context | Path Origin | lstat/fstat? | Size Capped? | Flags / Open Style | Classification vs RD-2 |
|---|---|---|---|---|---|---|---|---|
| 1 | `tabi` | `scripts/check-freshness.mjs:32` | `regularBytes(path)` | argv (`--repo`, `--expected`, `--witness`) | YES (`fstatSync.isFile`) | NO | `O_RDONLY\|O_NOFOLLOW` (no `O_NONBLOCK`) | PARTIAL-OVERLAP (hangs on FIFO; OOM on huge files) |
| 2 | `tabi` | `scripts/check-aria-metadata.mjs:280` | `readEntry(pathText)` | metadata JSON / argv path | YES (`fstatSync.isFile`) | NO | `O_RDONLY\|(O_NOFOLLOW\|\|0)` (no `O_NONBLOCK`) | PARTIAL-OVERLAP (hangs on FIFO; OOM on huge files) |
| 3 | `tabi` | `scripts/check-sources.mjs:166` | registry reader | argv (`--file REL` / default `SOURCES.md`) | YES (`fstatSync.isFile`) | NO | `O_RDONLY\|O_NOFOLLOW` (no `O_NONBLOCK`) | PARTIAL-OVERLAP (hangs on FIFO; OOM on huge files) |
| 4 | `tabi` | `scripts/check-sources.mjs:232` | `checkCitation(candidate)` | `SOURCES.md` row citation path | YES (`fstatSync.isFile`) | NO | `O_RDONLY\|O_NOFOLLOW` (no `O_NONBLOCK`) | PARTIAL-OVERLAP (hangs on FIFO; OOM on huge files) |
| 5 | `tabi` | `scripts/check-receipt-provenance.mjs:42` | `checkReceipt(file)` | argv (`--dir`) directory entry | NO | NO | raw `readFileSync(file, 'utf8')` | SAME-CLASS-RD2 (unbounded read of receipt JSON) |
| 6 | `tabi` | `scripts/check-receipt-provenance.mjs:53` | `checkReceipt(file)` | **Receipt text** (`r?.stdoutFile`) | NO | NO | raw `readFileSync(abs)` | **EXACT-SAME-CLASS-RD2** (path read from receipt text) |
| 7 | `tabi` | `scripts/check-receipt-provenance.mjs:78` | `checkMatrix(file)` | argv (`--dir`) matrix file entry | NO | NO | raw `readFileSync(file, 'utf8')` | SAME-CLASS-RD2 (unbounded read of matrix JSON) |
| 8 | `tabi` | `scripts/report-contract.mjs:35` | `readUtf8(path)` | argv (`--report`, `--shonen`) | NO | NO | raw `readFileSync(path, 'utf8')` | SAME-CLASS-RD2 (unbounded read of caller path) |
| 9 | `tabi` | `scripts/check-instrument-registry-r68.mjs:119` | `main()` | argv (`--skill <path>`) | NO | NO | raw `fs.readFileSync(args.skill)` | SAME-CLASS-RD2 (unbounded read of caller path) |
| 10 | `kake` | `scripts/probe-delta.mjs:58` | `parseHistory(file)` | argv (`--history <path>`) | NO | NO | raw `fs.readFileSync(file, 'utf8')` | SAME-CLASS-RD2 (unbounded read of caller path) |

### Verbatim Grep Receipts and Line Contexts

#### Site 1: `tabi-shokunin/scripts/check-freshness.mjs:32`
```javascript
26: function regularBytes(path) {
27:   const absolute = resolve(path);
28:   if (realpathSync(absolute) !== absolute) fail('unsafe_file', 'Symlinked input refused', 2);
29:   const fd = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
30:   try {
31:     if (!fstatSync(fd).isFile()) fail('unsafe_file', 'Non-regular input refused', 2);
32:     return readFileSync(fd);
33:   } finally {
34:     closeSync(fd);
35:   }
36: }
```
- Context: Reads files specified by CLI flags `--repo`, `--expected`, or `--witness`.
- Hardening: Has `realpathSync` symlink check and post-open `fstatSync(fd).isFile()`.
- Defect: Omits `O_NONBLOCK` on `openSync` (opening a writerless FIFO blocks indefinitely). Omits byte size cap on `readFileSync(fd)` (reading `/dev/zero` or huge regular files will OOM).

#### Site 2: `tabi-shokunin/scripts/check-aria-metadata.mjs:280`
```javascript
264:   try {
265:     fd = openSync(abs, constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
266:   } catch (error) { ... }
275:   try {
276:     const stat = fstatSync(fd);
277:     if (!stat.isFile()) {
278:       return { ok: false, path: pathText, abs, reason: 'not_regular' };
279:     }
280:     const bytes = readFileSync(fd);
...
298:   } finally {
299:     closeSync(fd);
300:   }
```
- Context: Reads entries indexed by aria metadata files.
- Hardening: Opens with `O_NOFOLLOW` and asserts `fstatSync(fd).isFile()`.
- Defect: Omits `O_NONBLOCK` (blocks on FIFO). Omits size cap.

#### Site 3: `tabi-shokunin/scripts/check-sources.mjs:166`
```javascript
163:   try {
164:     descriptor = openSync(absolute, constants.O_RDONLY | constants.O_NOFOLLOW);
165:     if (!fstatSync(descriptor).isFile()) throw gateError('registry_not_regular');
166:     const bytes = readFileSync(descriptor);
...
176:   } finally {
177:     if (descriptor !== undefined) closeSync(descriptor);
178:   }
```
- Context: Reads the registry file (passed via `--file REL` or default `corpus/SOURCES.md`).
- Hardening: Opens with `O_NOFOLLOW` and checks `fstatSync(descriptor).isFile()`.
- Defect: Omits `O_NONBLOCK` and omits size cap.

#### Site 4: `tabi-shokunin/scripts/check-sources.mjs:232`
```javascript
228:   try {
229:     descriptor = openSync(realCandidate, constants.O_RDONLY | constants.O_NOFOLLOW);
230:     if (!fstatSync(descriptor).isFile()) return { kind: 'missing' };
231:     const escaped = rowId.replace(/[.*+?^${}()|[\]\]/g, '\$&');
232:     const cites = new RegExp(`(?<![A-Za-z0-9])${escaped}(?![0-9])`).test(readFileSync(descriptor, 'utf8'));
233:     return { kind: cites ? 'cited' : 'uncited' };
...
239:   } finally {
240:     if (descriptor !== undefined) closeSync(descriptor);
241:   }
```
- Context: Reads cited source files discovered during validation.
- Hardening: Opens with `O_NOFOLLOW` and checks `fstatSync(descriptor).isFile()`.
- Defect: Omits `O_NONBLOCK` and omits size cap.

#### Site 5: `tabi-shokunin/scripts/check-receipt-provenance.mjs:42`
```javascript
41:   let r;
42:   try { r = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { push('schema', 'unparseable: ' + e.message); return failures; }
```
- Context: Reads command receipt JSON files from user-supplied `--dir` directory.
- Defect: Unchecked `readFileSync(file)`: no lstat/fstat, no `O_NONBLOCK`, no size cap.

#### Site 6: `tabi-shokunin/scripts/check-receipt-provenance.mjs:53`
```javascript
49:   const stdoutFile = r?.stdoutFile;
50:   let stdoutBytes = null;
51:   if (typeof stdoutFile === 'string' && stdoutFile) {
52:     const abs = path.isAbsolute(stdoutFile) ? stdoutFile : path.join(path.dirname(file), stdoutFile);
53:     try { stdoutBytes = fs.readFileSync(abs); } catch { stdoutBytes = null; }
54:   }
```
- Context: Reads instrument stdout file at `stdoutFile` **named inside the receipt's JSON payload**, resolving relative or absolute paths.
- Defect: **EXACT DUPLICATE OF RD-2 CLASS**: reads a path specified inside receipt text using raw `fs.readFileSync(abs)` without checking whether `abs` is a FIFO (hangs forever), a character device `/dev/zero` (aborts with OOM), or an oversized file.

#### Site 7: `tabi-shokunin/scripts/check-receipt-provenance.mjs:78`
```javascript
77:   let m;
78:   try { m = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { push('matrix-input', 'unparseable: ' + e.message); return failures; }
```
- Context: Reads matrix definition JSON files from `--dir`.
- Defect: Unchecked `readFileSync(file)`.

#### Site 8: `tabi-shokunin/scripts/report-contract.mjs:35`
```javascript
34: const readUtf8 = (path, label) => {
35:   try { return readFileSync(path, 'utf8') } catch (e) { die(`cannot read ${label} ${path}: ${e.code || e.message}`) }
36: }
```
- Context: Reads `--report` and `--shonen` paths from CLI argv.
- Defect: Unchecked `readFileSync(path)`.

#### Site 9: `tabi-shokunin/scripts/check-instrument-registry-r68.mjs:119`
```javascript
118:   const repoRoot = args.repo || process.cwd();
119:   const buf = fs.readFileSync(args.skill);
```
- Context: Reads `--skill <path>` from CLI argv.
- Defect: Unchecked `readFileSync(args.skill)`.

#### Site 10: `kake-shokunin/scripts/probe-delta.mjs:58`
```javascript
57: function parseHistory(file) {
58:   const raw = fs.readFileSync(file, 'utf8');
```
- Context: Reads `--history <path>` JSONL history file from CLI argv.
- Defect: Unchecked `readFileSync(file)`.

---

## Sibling Knowledge Entries to Cite (FIFO and Character-Device Reads)

Kumitate's C1 capability entry (`corpus/lessons/round-91.md`) should cite the following established sibling knowledge entries rather than re-deriving the semantics:

1. **`souji-shokunin/corpus/SOURCES.md:97, 201, 204`**:
   - **`S062` / `S241` (`fifo(7) § DESCRIPTION`)**: Linux man-pages 6.19: *"Normally, opening the FIFO blocks until the other end is opened also."* (Opened in souji r17 and r38; explains why blocking `open()` hangs without a writer).
   - **`S070` / `S077` / `S242` / `S245` (`open(2) § ERRORS ENXIO`)**: Linux man-pages 6.19: *"O_NONBLOCK | O_WRONLY is set, the named file is a FIFO, and no process has the FIFO open for reading."* (Opened in souji r18 and r38; establishes nonblocking open behavior on FIFOs).
   - **`S243` / `S246` (`pipe(7) § DESCRIPTION`)**: Linux man-pages 6.19: Distinguishes open-time blocking from read/write readiness.

2. **`souji-shokunin/corpus/QUALITY.md:216` (`Q86`)**:
   - Rule stating that tools touching caller-named paths must refuse non-regular files: *"A tool that writes to a caller-named path must refuse three shapes before writing: an output whose resolved path or inode is the input it just read, an output that is not a regular file (a FIFO would block a blocking O_WRONLY open forever; a directory or socket is not writable)... The open is O_NONBLOCK and the check is a post-open fstat, so no special file can be waited on."*
   - Also note souji's observation in `tools/souji-evidence-cache.py:235` and `tools/souji-preservation-evidence.py:228`: *"Digest reads are size-bounded but not time-bounded. O_NONBLOCK does not bound regular-file read length."*

3. **`chousa-shokunin/corpus/knowledge/derived-output-safety-r61.md` and `openat2-resolve-r62.md`**:
   - **`S134` (`open(2)`)**: Documents that `O_NOFOLLOW` guards only the final path component, while earlier components are followed.
   - **`S138` (`openat2(2)`)** / **`S139` (`<linux/openat2.h>`)** / **`S140` (openat2 probe)**: Documents kernel-enforced `RESOLVE_NO_SYMLINKS` across all walk components.

---

## One-Line Ruling

**Ruling: NO OVERLAP on the round's capability claim (`kumitate-receipt-bind-v5`); ADJACENCY OVERLAP on the underlying defect class (RD-2 unbounded external reads) across sibling instruments in `tabi-shokunin` and `kake-shokunin`.**

---

## UFO-FSD Connector Synthesis (Non-Obvious Move)

### 1. Evidence
- **Candidate Instrument v5 (`receipt-bind-v5.mjs`, sha `33ee29eb…`)**: Proposed by `K91ExecInst`. Hardens external reads using `openSync(abs, O_RDONLY | O_NOFOLLOW | O_NONBLOCK)` followed by `xst = fstatSync(xfd)`, checking `!xst.isFile()` and `xst.size > MAX_INSTRUMENT_BYTES (16777216)`, and reading with `readFileSync(xfd)`. It passes the 56/56 frozen probe and 83/83 selftest arms.
- **Pseudo-File Defect Finding (`K91ReviewProc.md`)**: `K91ReviewProc` demonstrated that on Linux, pseudo-files in `/proc` and `/sys` report `S_IFREG` (`xst.isFile() === true`) with `st_size = 0`. Because `st_size === 0 <= 16777216`, the metadata size check passes. Node's `readFileSync(xfd)` then enters an unbounded chunk-reading loop:
  - Reading `/proc/self/pagemap` dumps core with exit 134 (`SIGABRT`) under the 2 GiB memory cap, exactly recreating the `/dev/zero` unhandled crash.
  - Reading `/proc/<pid>/smaps` reads 37.2 MiB (> 16 MiB cap) and binds cleanly as `external=1`.
- **Sibling Vulnerability**: Sibling `tabi-shokunin` has 4 instruments with partial descriptor hardening (`openSync` + `fstatSync.isFile()`) but missing `O_NONBLOCK` (hanging on FIFOs) and missing size caps, plus `check-receipt-provenance.mjs:53` which reads receipt-embedded `stdoutFile` paths completely unhardened.

### 2. Affected Axes
- **`operability`**: Kumitate round 91 C1 capability acquisition (`receipt-bind` v5). The contract requires bounded external reads that refuse non-regular files and oversize files without hangs or unhandled aborts.
- **`hygiene` / `calibration`**: Eliminating false-clean bindings on pseudo-files that exceed the byte cap, and preventing runtime aborts.

### 3. Proposed Move
**Synthesize descriptor-level read bounding into the v5 candidate instrument:**
Combine `K91ExecInst`'s clean descriptor discipline with `K91ReviewProc`'s bounded read:
1. Fast-path check for genuine regular files: if `xst.size > MAX_INSTRUMENT_BYTES`, immediately throw `FailClosed('UNRESOLVED', ...)` without issuing any read call.
2. Descriptor read bounding: for files reporting `xst.size === 0` (which includes both empty regular files and dynamic `/proc`/`/sys` pseudo-files), read at most `MAX_INSTRUMENT_BYTES + 1` bytes via `readSync(xfd, ...)`. If bytes read exceed `MAX_INSTRUMENT_BYTES`, throw `FailClosed('UNRESOLVED', ...)`.
3. Sibling transfer recommendation: Provide this exact 3-step pattern (`openSync(O_NONBLOCK|O_NOFOLLOW)` -> `fstatSync.isFile()` -> bounded read) to `tabi-shokunin` for `regularBytes` (`check-freshness.mjs`) and `readEntry` (`check-aria-metadata.mjs`), closing both the FIFO-hang and oversize-OOM defects across the fleet.

### 4. Risks & Second-Order Effects
- **Frozen Probe Invariance**: All 56 frozen probe arms in `probe91-c1.mjs` are unaffected: empty regular files return 0 bytes and bind as CLEAN; at-cap files bind as CLEAN; over-cap files are rejected upfront at step 1; non-regular files are rejected at `!xst.isFile()`.
- **Performance & Substrate**: For genuine regular files (`xst.size > 0`), zero extra allocations occur. For `xst.size === 0` files, reads terminate at 0 bytes (empty file) or at 16 MiB + 1 byte (pseudo-file), preventing memory exhaustion and SIGABRT.

### 5. Verification
- Frozen probe: `probe91-c1.mjs` prints `C91_C1: HELD held=56/56` exit 0 on two runs.
- Prototype verification: `K91ReviewProc/fixed-bounded-read.mjs` proved that smaps/pagemap are refused in 0.03–0.09 s (RSS <= 261 MB) with exit 2 (`FAIL-CLOSED UNRESOLVED`), and selftest passes 76/76 (or 83/83 with v5 selftest arms).
