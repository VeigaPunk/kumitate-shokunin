# K94Sentinel — security/robustness of the new SOURCES read (round 94, C1)

Seat: K94Sentinel. Scope: the `corpus/SOURCES.md` read added by C1 in
`round-gate.mjs` (`declaredPins()` + `declaredPinsNow()`). Attack first on the
L1 control `ctl-positive` (regenerated in scratch, sha256 `c67dbc8d…2424`,
identical to `controls/controls-sha256.txt`), then on the candidate bytes.

Targets tested:
- `ctl-positive` (reference rule), sha256 `c67dbc8d638b30b550d4b5e902a924dd3c1e0119ce35f3804fcbd59d5fcf2424`
- candidate snapshot `candF`, sha256 `341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20`
  (also `77f6470b…54e7`, the sha scored `C94_C1: HELD`; `341726f3` differs only in comments).
  `.ufo/waves/round-94/K94ExecTool/READY` did not exist while this report was written.

Method: hermetic fixture repo (git init in scratch, toplevel asserted) with
`corpus/SOURCES.md` variants, `SCORECARD.md`/`LOG.md`, and a 1.2 KB
`reports/round-93/KumitateR94.md`; gate run as
`prlimit --as=4294967296 -- node <tool> --round 93 --lane KumitateR94 --repo <D>
--reports-dir <D>/reports --main-repo <D> --origin <D> [--json]` under
`timeout`. Harness: `.ufo/waves/round-94/K94Sentinel/sentinel_probe.py`,
`lazy_probe.sh`; receipts in `.ufo/waves/round-94/K94Sentinel/receipts/`
(`<label>.<scenario>.json|.stdout.txt|.stderr.txt`).

## Timings and exits (wall time; `-6` = SIGABRT)

| scenario | ctl-positive | candidate 341726f3 | exit / verdict |
|---|---|---|---|
| baseline (registry declares `79fa222e…`) | 0.16 s | 0.09 s | 1 DRIFT (1 unresolved `deadbeef`) — expected |
| 1 MiB row: `https://` + `a/`×500k + 500k spaces + 1 MB hex run | 0.39 s | 0.15 s | 1 — no blow-up |
| 1 MiB single hex segment + 500k `f` query | 0.23 s | 0.12 s | 1 — no blow-up |
| SOURCES.md is a FIFO (no writer) | **timeout 20 s** | **timeout 20 s** | none — hang in `open(2)` (user 0.03 s) |
| SOURCES.md is a symlink → `/dev/zero` | **-6 after 8.4 s** | **-6 after 4.7 s** | none — V8 OOM abort |
| SOURCES.md is a directory | 0.12 s | 0.09 s | 1 — treated as absent, no INTERNAL_ERROR |
| 200 MB file, 1 unresolved token | 6.6 s | 2.97 s | 1 — one read |
| 200 MB file, 40 unresolved tokens | **143.5 s** | 3.22 s | 1 — control re-reads per token; candidate caches |
| 1 GiB file, 1 token (77f6470b; comment-only diff) | — | 0.51 s, maxRSS 1,116,536 KB | 1 |
| sentinel string `SENTINEL94_LEAK_7f3a` in every SOURCES cell/URL | leak=0 | leak=0 | 0 CLEAN |
| symlink → file outside repo carrying a registry row | 0.12 s | 0.06 s | 0 CLEAN, `declared=["79fa222e"]` |
| report cites `../../../../etc/passwd`, `/etc/shadow`, `../corpus/SOURCES.md` | checked=2 | checked=2 | 1 — only hex tokens count |
| rejected row, well-formed | 0.17 s | 0.07 s | 1 — pin stays unresolved |
| rejected row with an unescaped `|` in the scope cell | 0.12 s | 0.06 s | **0 CLEAN, `declared=["79fa222e"]`** |
| no SOURCES.md | 0.12 s | 0.08 s | 1 |
| NUL bytes + invalid UTF-8 | 0.12 s | 0.07 s | 0 — tolerated |
| FIFO + report whose tokens all resolve in lane | — | 0.054 s | 0 — read never happens |
| `/dev/zero` symlink + all tokens resolve in lane | — | 0.041 s | 0 — read never happens |
| unreadable (chmod 000) / symlink loop (ELOOP) | — | 0.051 / 0.052 s | 0 — no pins, no crash |
| `--tracked` with FIFO SOURCES | — | 0.063 s | 0 CLEAN — tracked never calls `runChecks` |

Base-immunity control (`ctl-nothing` on the same FIFO and `/dev/zero` fixtures):
0.07 s / 0.06 s, exit 1, maxRSS ~54 MB (`receipts/base-immune.*.{out,err}`) — the crash and the hang are introduced
by the C1 read (`receipts/ctlpos.*` for base-equivalent bytes).

## Findings

| id | class | finding | evidence | smallest remediation |
|---|---|---|---|---|
| S94-1 | **blocker** | A **git-cloneable symlink** `corpus/SOURCES.md -> /dev/zero` (mode 120000; verified it survives `git clone`) makes `readFileSync` grow a buffer without bound; V8 aborts with `OOMErrorHandler` → exit `-6`, **no verdict, fail-closed path bypassed**. Base gate is immune. | `receipts/candF.devzero.json`, `.stderr.txt`; base-immunity `receipts/base-immune.devzero.{out,err}` (0.06 s, exit 1); clone fidelity `receipts/git-symlink-clone.txt` (ls-tree mode `120000`, clone materialises the link) | Before `readText`: require `statKind(p) === 'file'` **and** `statSync(p).size <= cap` (e.g. 8–16 MiB; real file is 166,567 B), or `openSync` + `fstat` + bounded read. Cannot affect the frozen predicate (all counter fixtures are small regular files). |
| S94-2 | routed (high) | `corpus/SOURCES.md` as a FIFO hangs the gate forever in `open(2)` (0.03 s user CPU over 5 s wall); `--close`/audit never return. Not commit-able through git (local object only), so lower reachability than S94-1. | `receipts/candF.fifo.json`; `receipts/candF.fifo.time.txt` | same guard as S94-1 (`statKind === 'file'` rejects FIFOs). |
| S94-3 | routed (medium) | The read follows a symlink **outside** the repo: a fixture whose `corpus/SOURCES.md` points at `fx/outside.md` yields `declared=["79fa222e"]`, i.e. an arbitrary readable file is parsed as the lane registry. Combined with `--json citations.declared`, the gate becomes a membership oracle for chosen 7-hex prefixes of 40-hex URL segments in any locally readable file (CI-log visible in a PR-check model). | `receipts/candF.symlink_outside.json`, `.stdout.txt` | `realpathSync` the target and require it under `realpath(repo)/corpus/`, or refuse symlinks (`lstatSync().isSymbolicLink()`). |
| S94-4 | routed (low) | No size cap: 200 MB → +2.97 s per audit; 1 GiB → 1.1 GB RSS (0.51 s). Under a 4 GiB `--as` cap a multi-GB file aborts as in S94-1. Real cost today (166 KB) is ~0.09 s total gate time. | `receipts/candF.big200_1tok.json`, `candF.big200_40tok.json`, `receipts/cand.big1g.err` | same size cap as S94-1. |
| S94-5 | routed (low) | The `rejected` filter reads literal column 8, so an unescaped `|` in an earlier cell shifts the status cell and a row whose status *reads* `rejected` still declares its pin (`rejected_shifted`: CLEAN). Literal spec conformance (“8th column”), so not a code bug against the frozen sentence, but the rejection filter is evadable in a malformed row; the counter's fixture (d) covers only well-formed rejected rows. Same class: any line matching the row regex counts, including inside a fenced block. | `receipts/candF.rejected_shifted.json`, `ctlpos.rejected_shifted.json` | amendment only (e.g. require exactly 12 cells before trusting column 8); do **not** change under the frozen rule. |

## Non-findings (checked, clean)

- **ReDoS**: no super-linear behaviour on 1 MiB adversarial rows (0.15 s vs 0.09 s baseline); `SOURCES_URL_RE` is a single negated class, `SOURCES_PIN_RE` a fixed-count anchor, `SOURCES_ROW_RE` has no nested quantifier.
- **Token→path injection**: citation tokens are `^[0-9a-f]{7,40}$`; path-like backticks are not tokens (`checked=2` with three path strings present); `2e2e2f2e2e2f` is only used in `startsWith`. The read path is fixed (`join(repo,'corpus','SOURCES.md')`), never token-derived.
- **Verbatim SOURCES leak**: the sentinel string in source/anchor/teaches/URL never appears in stdout/stderr in `--json` or text mode; `citations.declared` carries report tokens only; text detail carries `declared=<n>` (count).
- **Degradation**: directory (EISDIR), symlink loop (ELOOP), chmod 000, NUL/invalid UTF-8 all fall back to “no SOURCES.md → no declared pins”, exit 0/1, no INTERNAL_ERROR.
- **Blast radius**: the read is lazy (all-resolving reports never touch the file: 0.04–0.05 s with FIFO/devzero/loop in place) and cached once per `runChecks`; `--tracked` never reads it.
- **Real registry audit**: 208 registry rows, 24 declared 40-hex pins; S045 is `rejected` and correctly excluded; none of the seven KEEP tokens (12/46/53/57/61/62/63) is a prefix of any pin; only `79fa222e…` (S266–S269) matches round 93. `receipts/real-sources-pins.txt`.

## Verdict contribution

S94-1 is a genuine availability regression introduced by C1 (base 0.06 s vs
candidate abort) but is **not reachable from the lane's actual data**: the
lane SOURCES.md is a regular 166,567-byte file, and the frozen counter's
fixtures are regular files, so `C94_C1` itself is unaffected. Blocker in the
availability sense (an audited repo can kill the auditor, and `--repo` accepts
any work tree, including a clone); if the integrator scopes the gate to
trusted lanes only, S94-1/S94-3 route instead. Recommended
before integration: the three-line regular-file + size-cap + containment guard
above; it cannot change the frozen predicate's verdict on any counter fixture.

Scratch `/fast/scratch/hyaku/kumitate-r94/K94Sentinel` removed before yield.
