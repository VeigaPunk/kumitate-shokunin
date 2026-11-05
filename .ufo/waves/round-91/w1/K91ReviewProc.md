# K91ReviewProc — round-91 pseudo-file hypothesis (w1 report)

Hypothesis: "a size-from-fstat cap does not bound the read of a pseudo-file whose `st_size`
understates its content." **Verdict: SUPPORTED.** Label: **out-of-class → routed defect** (not a
kill; see plan's declared classes — pseudo-files are a new input spelling, kin to the routed
"char device without a `/dev/` spelling" bucket). Full detail + receipts:
`.ufo/waves/round-91/K91ReviewProc/hypothesis.md` (evidence in
`.ufo/waves/round-91/K91ReviewProc/evidence/`).

## What was measured (all runs under `prlimit --as=2147483648 timeout 20`, scratch `/fast/scratch/hyaku/kumitate-r91/K91ReviewProc`, receipts probe-shaped `rev=/tool_sha256=/cmd=`)

1. **Real pseudo-files with `st_size=0`, S_IFREG** (`evidence/survey.jsonl`):
   `/proc/<stopped-child>/smaps` (50k alternating-prot VMAs, `evidence/mapper.c`) reads
   **37,244,686 B with `st_size` 0** (20.5 MiB over the 16,777,216 cap; byte-stable across
   consecutive reads, drifts across minutes at constant length); `/proc/self/pagemap` reads
   **256 MiB in 126 ms with NO EOF** (unbounded toward ~16 TiB); `/proc/self/{maps,environ,status,…}`
   understate but stay small; `/proc/self/mem` read → EIO; sysfs `boot_id` ENOMEM on a 4 MiB chunk
   but binds via normal reads; `/proc/kmsg`//`kcore` root-gated (EACCES; `timeout 5` attempt
   recorded). No accessible blocking S_IFREG specimen found.
2. **Positive control `ref-fd-fstat.mjs` (sha `bc3df527…94db`, = the claimed v5 edit) scored on
   receipts naming such files** (`evidence/runs-ctl/`):
   - `cmd=bash /proc/3922488/smaps`, digest of a separate read → **`CLEAN matched=1 external=1`,
     exit 0, 0.10 s, 176 MB RSS — a 35.5 MiB instrument bound past the declared cap.**
   - `cmd=bash /proc/self/pagemap` → **abort, no verdict line, exit 134 (SIGABRT), 1.02 s,
     736 MB RSS** — the exact v4 `/dev/zero` (RD-2/A4) failure mode through an S_IFREG spelling.
   - Every declared-class arm behaves as committed: /dev/zero, /dev/null, FIFO, dir, empty, at-cap,
     over-cap (16,777,217 B honest regular file → UNRESOLVED too large), /proc/self/mem (EIO →
     UNRESOLVED), /proc/kcore (EACCES → UNRESOLVED), boot_id (binds, DRIFT with empty digest).
3. **Integrated worktree v5** (`scripts/receipt-bind.mjs`, contract v5, sha `33ee29eb…3013d`
   verified identical before/after; `evidence/runs-v5-pinned/`): same two results — pagemap →
   **no verdict abort** (133, 1.28 s, 735 MB); smaps → read whole 37 MB (`external=1`, no cap
   refusal); /dev/zero → correctly refused. Note: the worktree moved under this seat mid-session
   (v4 `35f4f25e…` at start → v5 `33ee29eb…` at pin); an earlier unpinned pass is kept in
   `evidence/runs-v5-firstpass-unpinned/`, superseded.

## Proposed fix + falsifying fixture

Bound the **read**, not the metadata: after the type check, read at most cap+1 bytes from the
descriptor and refuse `UNRESOLVED` when more arrive, whatever `st_size` claimed. Prototype at
`.ufo/waves/round-91/K91ReviewProc/fixed-bounded-read.mjs` (control + one loop, sha `6b6f2905…ec97`):
smaps/pagemap → FAIL-CLOSED UNRESOLVED too large in 0.03–0.09 s (≤261 MB); all declared-class
verdicts unchanged; empty + at-cap still CLEAN; selftest `PASS held=76/76`, zero arm-FAIL lines.
Falsifying fixture: `evidence/mapper.c` recipe + `evidence/receipts/d1` (binds 20.5 MiB over cap)
and `d3` (no-verdict abort). If a smaps arm is adopted, make it a recipe arm (build child → read
digest → run immediately) — content drift makes precomputed digests flake MATCH/DRIFT only; the
size refusal is drift-immune.

## Residual risk / verification gaps

- `/proc/kmsg` (blocking) and `/proc/kcore` (honest oversize) are root-only here; untestable
  unprivileged — recorded, not assumed.
- The kill rule does not fire: no declared-class arm returns a wrong verdict on control or pinned
  v5. The gap is the claim sentence "bounded external reads" being wider than its 56 enumerated
  arms; a one-arm probe addition (procfs recipe) or the bounded read closes it.
- Tooling rule: no installs performed (cc/node//usr/bin/time/prlimit already present).
