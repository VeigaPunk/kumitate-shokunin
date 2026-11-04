# K86ExecDriver — independent driver for counter-receipt v3 (C1)

Seat: K86ExecDriver (executor, leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Scope: build dir `.ufo/waves/round-86/build/K86ExecDriver/` and this report. No lane file edited.
No commit, push, stash or git mutation. No subagent spawned. No tool installed or upgraded.

## Files

- `.ufo/waves/round-86/build/K86ExecDriver/driver86-c1.mjs`
  sha256 `68557cfb742f823913ac4754172af5a90d6b8d581dd180f1ad3ff4097a861867`
- `.ufo/waves/round-86/build/K86ExecDriver/transcript-run1.txt`: the single run recorded below.

Usage: `node driver86-c1.mjs --lane DIR --work DIR`. Final line: `K86_EXEC_DRIVER: HELD held=<n>/<n>` (exit 0) or `UNMET held=<h>/<n>` (exit 1).

## Provenance of the driver

- Written from `plan.md` §"Frozen target contract" and the shipped v2 receipt grammar (the header of
  `scripts/counter-receipt.mjs`), which plan.md says stays as shipped on non-source arms.
- I opened `probe86-c1.mjs` before work as instructed, but the read tool elided its body. I saw the
  header comment, the case-table shape and the usage/exit notes only. I did not reuse any of its code,
  constants or arm bodies. The driver has its own parser, its own expectation model and its own arm list.
- Random generation is per run (mulberry32 seeded from `randomBytes(4)`; the seed is printed as `SEED=`).

## What the driver asserts

For every arm it writes fixture bytes to scratch, reads them back, derives the expected stdout and exit
code, runs `node scripts/counter-receipt.mjs`, and compares exactly:

- `COUNTER_RECEIPT: CLEAN | DRIFT <T> | FAIL-CLOSED <T> | USAGE`
- `RECEIPT: bytes=<len of bytes read back> rows=<arm lines> held=<label> findings=<overall|none> sha256=<sha of bytes|->`
- `SOURCE: sites=<arm('…' sites> declared=<last const|let|var ARMS = N | absent> receipt=<rows> sha256=<sha of source bytes|->` (only with `--src`)
- exit code 0 / 1 / 2 / 64 by finding class.

Each arm also pins its intended token; if the driver's own derivation disagreed with that pin the arm
would print `DRIVER_SELF` and fail. No `DRIVER_SELF` line occurred in the run.

Coverage: 44 fixed arms and 10 generated fixtures (54 total).

- Fixed arms H01–H44: clean, CRLF, metadata and arm-shaped metadata decoys, detail text that looks like
  an arm, leading-zero counts, one-byte detail mutation, all receipt drift and fail-closed tokens, unsafe
  integers, missing/directory receipt, four usage shapes, source clean/undeclared/last-declaration/
  missing/no-sites/unbound/arity/declared-drift/decoys, receipt-outranks-source, two source digests with
  identical counts and different bytes, and two mutations (status flip, detail byte).
- Generated G-arms (10 kinds, each with run-time random arm count 3–12, names, prefix, statuses, metadata
  lines, CRLF, and source decoys `warm('…')`): clean, arm-failed, verdict, arms-total, held-count,
  duplicate, prefix, unbound, arity, declared.

## Run (one run, against the lane tool as it stands)

Command (exit recorded):
`node .ufo/waves/round-86/build/K86ExecDriver/driver86-c1.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work /fast/scratch/hyaku/kumitate-r86/K86ExecDriver`
→ exit **1**, `K86_EXEC_DRIVER: UNMET held=30/54`.

Tool at the measured run: `scripts/counter-receipt.mjs`
sha256 `f385bd7a9fbf1dc49d465c8d83fecfd07aae34f6bf619aca7d935eda14f238cd`
header line 2 `kumitate-counter-receipt-v2` (still v2 — not yet integrated). I re-read the hash after the
run and it is unchanged. Per the brief I did not poll or sleep waiting for v3; L1 re-runs after integration.

Result breakdown:

- **30/30 receipt-only, drift, fail-closed and usage arms held** (H01–H29 plus H44; the drift/fail-closed set, usage set,
  and RECEIPT line sha256 all match v2 exactly). This shows the driver's receipt half agrees with the shipped
  v2 receipt half byte for byte.
- **24/24 source-bearing arms red, all for one reason**: the v2 `SOURCE:` line has no `sha256=` field.
  Checked in the transcript: exit codes match in every red arm; `DRIVER_SELF` count = 0; every red arm's
  `got` is a `SOURCE:` line without `sha256`, and every `want` has one. No red arm is red for any other field.
  The red arms are A31–A54 (H30–H43 and G-clean/G-arm-failed … G-declared).

This is the expected v2 signature. It does not by itself say v3 will pass; that requires L1 to re-run the
driver after integration.

## Ambiguities and gaps in the contract (for the L1 / planner)

1. **`findings=` on source-only failures.** plan.md does not say what `findings=` shows when the receipt is
   clean and the source drifts. The shipped v2 prints the *overall* finding (e.g. `findings=SOURCE_DECLARED`
   on the RECEIPT line; visible in the transcript). The driver follows v2. If v3 changes this, the 8 arms whose clean receipt is overridden by a source token (H33–H37, G-unbound, G-arity, G-declared) fail
   and the change must be disclosed in plan terms.
2. **Receipt grammar is not written out in plan.md.** The metadata skip rule (`key=`, `command:`, `rev:`,
   `exit:`), summary-shape and arm-shape rules, and the held-label rule for `SUMMARY_COUNT` were taken from
   the shipped v2 header and tested by H03/H04/H05/H13/H16/H22. A v3 that changes any of these changes
   non-source arms, which plan.md says must stay as shipped.
3. **Last `const ARMS` wins** (H32) and **`declared=absent` vs unreadable source** (H33/H34) are shipped
   behaviours that plan.md does not spell out. The driver pins the shipped behaviour.
4. **Precedence** follows the order the v2 header lists (fail-closed receipt tokens, then receipt drift,
   then source fail-closed, then source drift). plan.md only says "first finding wins; receipt outranks
   source", so the within-class order is taken from the header.
5. **Source sha on unreadable source** is `-` (plan.md). The driver reads back the bytes it wrote; for a
   directory or missing file it prints `-`.

## Hand-off

- L1 to run after integration:
  `node .ufo/waves/round-86/build/K86ExecDriver/driver86-c1.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --work <scratch>/K86ExecDriver`
  (`<scratch>` = `$HYAKU_SCRATCH/kumitate-r86`, default `/fast/scratch/hyaku`). Expect `K86_EXEC_DRIVER: HELD held=54/54`, exit 0, against the v3 tool.
- The driver creates and removes its own `k86-driver-*` subdirectory under `--work`. My scratch tree was removed before yield.
- Verification was not run by me beyond the single run above and a `node --check` syntax check of the driver. The planner owns the post-integration gate.
- Tools installed/updated: none.
