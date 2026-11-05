# hypothesis.md — K91ReviewProc (round-91 pseudo-file probe)

## Falsifiable statement (the seat hypothesis)

> The v5 external-read discipline (`openSync(O_RDONLY|O_NOFOLLOW|O_NONBLOCK)` → `fstatSync` →
> refuse non-regular, refuse `st_size > 16777216` → `readFileSync(fd)`) bounds every external
> read to 16777216 bytes, because the size gate sees the true size of anything it will read.

**Falsified by**: any procfs/sysfs specimen that is `S_IFREG` with `st_size = 0` but reads more
than 16777216 bytes, or never reaches EOF. Both exist on this host. **Verdict: SUPPORTED.**

## Measured sizes (`evidence/survey.jsonl`; O_RDONLY|O_NOFOLLOW|O_NONBLOCK, fstat, bounded read)

| target | st_size | isFile | bytes actually read | note |
|---|---|---|---|---|
| `/proc/<stopped-child>/smaps` (50k VMAs) | 0 | true | **37,244,686** (EOF) | > cap by 20.5 MiB; sha stable 1 s apart (`aa525802…`), drifts across minutes (same length, different sha) |
| `/proc/self/pagemap` | 0 | true | **268,435,456 in 126 ms, NO EOF** | unbounded to `TASK_SIZE` (~16 TiB of entries); worse than blocking |
| `/proc/self/maps` | 0 | true | 8,142 (EOF) | understates, small by default |
| `/proc/self/environ` | 0 | true | 14,125 (EOF) | understates |
| `/proc/self/smaps`, `smaps_rollup`, `status`, `cmdline`, `mountinfo`, `mountstats`, `meminfo`, `loadavg`, `uptime`, `net/dev` | 0 | true | 21 B–83 KB (EOF) | understates, small |
| `/proc/self/mem` | 0 | true | read error `EIO` at offset 0 | error path → UNRESOLVED (safe) |
| `/proc/sys/kernel/random/boot_id` | 0 | true | `ENOMEM` on a 4 MiB chunk; Node `readFileSync` (smaller chunks) reads its 37 B fine | binds normally (d7 DRIFT external=1) |
| `/sys/kernel/vmcoreinfo` | 4096 | true | 24 (EOF) | overstates; harmless |
| `/proc/kmsg` | 0 | — | `EACCES` (root-only; `timeout 5 cat` run, `evidence/kmsg.err`) | blocking specimen untestable as non-root |
| `/proc/kcore` | 140,737,471,594,496 | — | `EACCES` (root-only) | honest st_size would be cap-refused anyway |
| `/dev/zero`, `/dev/null` | 0 | **false** | 256 MiB no-EOF / 0 EOF | non-regular → type check refuses (declared class) |

Oversize builder: `evidence/mapper.c` — 50,000 alternating-prot anonymous mmaps, then SIGSTOP;
`/proc/<pid>/smaps` = 37,244,686 B with `st_size` still 0. (Identical adjacent anon mappings merge;
alternating PROT_READ / PROT_READ|PROT_WRITE defeats the merge.)

## Scoring the positive control `ref-fd-fstat.mjs` (sha `bc3df527…94db`, = the claimed v5 edit)

Receipts are probe-shaped (`rev=2b1b8bf3…`/`tool_sha256=`/`cmd=`), run under
`prlimit --as=2147483648 timeout 20 /usr/bin/time -v node <tool> --dir <rcpts/dN> --rev 2b1b8bf3… --lane <lane>`.
Full logs: `evidence/runs-ctl/` (control), `evidence/runs-v5-pinned/` (integrated worktree v5,
sha `33ee29eb…3013d` identical before/after the runs), `evidence/runs-fix/` (bounded prototype).

| arm | cmd= | control verdict | exit | wall | maxRSS |
|---|---|---|---|---|---|
| d1 | `bash /proc/3922488/smaps` (live digest) | **CLEAN matched=1 external=1** — 35.5 MiB bound as if bounded | 0 | 0.10 s | 176 MB |
| d2 | same, wrong digest | DRIFT mismatched=1 external=1 (full 35.5 MiB read, no cap refusal) | 1 | 0.10 s | 177 MB |
| d3 | `bash /proc/self/pagemap` | **no verdict line — abort (SIGABRT)** | 134 | 1.02 s | 736 MB |
| d4 | `bash /dev/zero` | FAIL-CLOSED UNRESOLVED not-regular | 2 | 0.02 s | 53 MB |
| d5 | `bash /dev/null` | FAIL-CLOSED UNRESOLVED not-regular | 2 | 0.02 s | 53 MB |
| d6 | `bash /proc/self/mem` | FAIL-CLOSED UNRESOLVED unreadable (EIO) | 2 | 0.02 s | 52 MB |
| d7 | `bash …/boot_id` | DRIFT external=1 (37 B sysfs file binds normally) | 1 | 0.02 s | 53 MB |
| d8 | `bash /proc/kcore` | FAIL-CLOSED UNRESOLVED unreadable (EACCES, non-root) | 2 | 0.02 s | 53 MB |
| d9 | empty regular file | CLEAN external=1 (as declared) | 0 | 0.02 s | 53 MB |
| d10 | exactly 16,777,216 B | CLEAN external=1 (as declared) | 0 | 0.03 s | 70 MB |
| d11 | 16,777,217 B | FAIL-CLOSED UNRESOLVED too large (as declared) | 2 | 0.02 s | 51 MB |
| d12 | FIFO, no writer | FAIL-CLOSED UNRESOLVED not-regular (as declared) | 2 | 0.02 s | 53 MB |
| d13 | directory | FAIL-CLOSED UNRESOLVED not-regular (as declared) | 2 | 0.02 s | 53 MB |

Pinned integrated v5 (`scripts/receipt-bind.mjs`, contract v5, sha `33ee29eb…` verified before AND
after): d3 → abort, **no verdict**, 1.28 s, 735 MB RSS; d4 → UNRESOLVED not-regular ✓; d1 → DRIFT
external=1 (full 37,244,686 B read, no cap refusal). (`runs-v5-firstpass-unpinned/` holds an earlier
pass over the same arms mid-integration; superseded by the pinned set.)

## Label: OUT-OF-CLASS → routed defect (not a kill)

The frozen kill rule enumerates the declared classes: four non-regular kinds, an external regular
file on either side of the cap, a carried v4 arm's shape, a mid-token code point, fixture contexts.
The probe pins the regular-file class to the filesystem-reported size (`ext-overcap` requires
`lstatSync(f).size === CAP+1`). A procfs pseudo-file is a **new input spelling** — S_IFREG,
`st_size` 0 — expressly kin to the plan's routed "char device reachable without a `/dev/` spelling"
exclusion. No declared-class arm returns a wrong verdict on control or pinned v5 (table above), so
the kill rule does not fire. Recommended routing: same bucket as RD-2's spelling gap.

## Proposed fix + falsifying fixture

Bound the **read**, not the metadata: after the type check, read at most cap+1 bytes from the
descriptor and refuse when more arrive, whatever `st_size` claimed. Prototype:
`../fixed-bounded-read.mjs` (seat dir; control + one bounded-read loop, sha `6b6f2905…ec97`):
d1/d2/d3 → FAIL-CLOSED UNRESOLVED too large (0.03–0.09 s, ≤261 MB); every declared-class verdict
unchanged (d4–d6, d11–d13); d9/d10 still CLEAN; selftest `PASS held=76/76`, zero arm-FAIL lines
(`evidence/runs-fix/selftest.out`).
Falsifying fixture for any unbounded variant: `mapper.c` recipe + receipts `evidence/receipts/d1`
(CLEAN despite 20.5 MiB over cap) and `d3` (no-verdict abort). If a smaps arm is adopted by the
probe, it must be a recipe arm (build child → read digest → run immediately): smaps content drifts
across minutes (same 37,244,686 length, different sha), so a precomputed digest flakes MATCH/DRIFT
only — the size refusal itself is drift-immune.

## Residual risk / gaps

- Blocking S_IFREG specimen: none accessible unprivileged (`/proc/kmsg` root-only, EACCES under
  `timeout 5`); pagemap is the stronger failure (never EOF) and is covered by d3.
- Root-gated `/proc/kcore` (honest 128 TiB st_size) untested for the cap path — EACCES → UNRESOLVED.
- Worktree instrument changed under this seat mid-session (v4 `35f4f25e…` at start → v5
  `33ee29eb…` at pin time); all v5 rows are anchored to the pinned sha pair. Integration judging
  remains ExecInst/Main's job; this seat does not judge the claim.
