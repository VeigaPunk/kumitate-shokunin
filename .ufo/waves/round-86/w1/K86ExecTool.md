# K86ExecTool — round 86 C1 `counter-receipt` v3 (candidate)

Seat: K86ExecTool (executor, leaf). Base `232350995d3001e606609aaf22ba1b58168d3655`. Production file **not edited**.

## Result

Candidate `kumitate-counter-receipt-v3` is built and tested in build/ only. L1 must integrate it.

- Candidate: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-86/build/K86ExecTool/scripts/counter-receipt.mjs`
  sha256 `e95313700aaf8430c51e0f8abdb991ab168519eecf9803cce3fac51154f31069`
- Production v2 (unchanged): `scripts/counter-receipt.mjs` sha256 `f385bd7a9fbf1dc49d465c8d83fecfd07aae34f6bf619aca7d935eda14f238cd`
- Diff: `build/K86ExecTool/v2-to-v3.diff` (43 lines, 0 context). Only the header, the source digest, the `SOURCE:` print, the selftest helpers and the `source:` table changed.
- Imports: unchanged (`node:` builtins only, no relative imports, so no resolution change).

## Patch locations (candidate, relative to build copy)

| Line(s) | Change |
|---|---|
| 3 | header `kumitate-counter-receipt-v2` → `v3` |
| 22 | doc line gains `sha256=<hex|->` |
| 89 | `inspectSource` unreadable return gains `sha: '-'` |
| 93 | `inspectSource` success return gains `sha: createHash('sha256').update(buffer).digest('hex')` (same buffer as counts, one read) |
| 151 | `SOURCE:` print gains ` sha256=${source.sha}` |
| 163–167 | selftest helpers inserted: `sha`, `emptySource`, `declaredTwoSource`, `commentedSource`, `undeclaredSource` |
| 221–231 | the 11 `source:` arms: 8 existing arms carry the digest; 3 new arms: `src-digest-bytes`, `src-unreadable-dash`, `src-undeclared-sites` |

Every other line is byte-identical to v2 (findings, precedence, exit map, RECEIPT line, metadata skipping, CRLF).

Integration: `cp .ufo/waves/round-86/build/K86ExecTool/scripts/counter-receipt.mjs scripts/counter-receipt.mjs`, then L1 deletes the build/ copy (see the A_wave note below).

## Commands and exit codes (all run against a scratch lane copy holding the candidate; production untouched)

Scratch lane: `$HYAKU_SCRATCH`=`/fast/scratch/hyaku` → `kumitate-r86/K86ExecTool/lane/scripts/counter-receipt.mjs`. Scratch removed (`scratch_exists_after_rm=False`).

1. `node <lane>/scripts/counter-receipt.mjs --selftest --work <scratch>/work/selftest` → **exit 0**, `COUNTER_RECEIPT_SELFTEST: PASS held=63/63` (63 arms: the 60 v2 arms, with the 8 existing `source:` arms now carrying the digest, plus 3 new arms). Receipt: `build/K86ExecTool/selftest-v3.txt`.
2. `node .ufo/waves/round-86/probe/probe86-c1.mjs --lane <scratch>/lane --work <scratch>/work/probe` → **exit 0**, `C86_C1: HELD held=24/24`. Receipt: `build/K86ExecTool/probe86-c1-v3.txt`.
3. Historical battery (receipt: `build/K86ExecTool/historical-battery-v3.txt`):
   - `--receipt round-83/close/c1-probe.txt` → **exit 1**, `COUNTER_RECEIPT: DRIFT ARMS_TOTAL` (red verdict preserved).
   - `--receipt round-83/close/c1-repair.txt` → exit 0, `CLEAN`.
   - `--receipt round-83/close/c1-repair.txt --src round-83/probe/probe83-c1.mjs` → **exit 1**, `COUNTER_RECEIPT: DRIFT SOURCE_DECLARED`, `SOURCE: sites=28 declared=27 receipt=28 sha256=5da10098b192a728be87b0cb676eacdd49e4163c0822dcfa6b53ad9b2b064301` (the digest matches the independent `probe83-c1.mjs` byte hash).
   - `--receipt round-83/close/c2-probe.txt` → exit 0, `CLEAN`.
4. Diff/hash, read-only: `sha256` of v2 and v3 as above; `diff` written to `v2-to-v3.diff`.

Note on the task's stated expectation: "r83 `c1-repair.txt` → `DRIFT SOURCE_DECLARED`" holds only with `--src .ufo/waves/round-83/probe/probe83-c1.mjs` (27 declared, 28 sites). With the repair probe `probe83-c1-repair.mjs` (declared 28, 28 sites) the verdict is CLEAN. I reported the observed verdicts and did not change the expectation.

v2 production on the same inputs (read-only comparison): red → `DRIFT ARMS_TOTAL` exit 1, repair+`probe83-c1.mjs` → would print no digest; v2 prints `SOURCE: sites=… declared=… receipt=…` with no `sha256=`. The RECEIPT line is byte-identical in v2 and v3.

## Receipts copied into build/K86ExecTool/

- `selftest-v3.txt` (selftest output, exit 0)
- `probe86-c1-v3.txt` (frozen probe output, exit 0)
- `historical-battery-v3.txt` (the 4 historical commands above with exit codes)
- `v2-to-v3.diff`

## Risks and limits

- The probe reads the **production** lane file. Until L1 integrates, `probe86-c1` against the lane is `UNMET` (v2 has no source digest). The 24/24 result here is from the scratch lane copy only.
- The new `src-digest-bytes` arm pins the digest to the changed bytes; it does not separately assert that two sources with identical counts produce different output lines. The expected string differs per source, so a count-derived digest would fail, but no explicit cross-arm distinctness check was added.
- The source binding stays textual: `arm('…'` literals inside comments or strings bind. Unchanged from v2, as the plan's limits state.
- `inspectSource` still uses `buffer.toString` twice (existing code, left unchanged to keep the diff minimal).
- L1 must re-run `probe86-c1` and the selftest on the integrated production tree; I did not run `proxy-check`, `cite-check` or `readme-map` (not in my item).

## Stray runnable under .ufo (flagged by K86ExecProxy)

The candidate `build/K86ExecTool/scripts/counter-receipt.mjs` is a `.mjs` under `.ufo/` and moves the proxy A_wave walk (+1, tracked 950 → walk 951). My assignment mandates the build path, so I did not rename it. L1 should delete `build/K86ExecTool/scripts/` after integration and re-measure `A_wave` on the integrated tree. K86ExecProxy has acknowledged and recorded it.

## Tooling

No installs, upgrades or host changes. Only `node` (already on PATH) and the read-only `git rev-parse HEAD`. No git mutation, no commit, no stash. Scratch under `/fast/scratch/hyaku/kumitate-r86/K86ExecTool/` removed.
