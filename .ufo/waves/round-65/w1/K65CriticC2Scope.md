VERDICT: mixed — C2 does open a surface the committed corpus has never read (the installed release's binary bytes), but it is sized as a first-entry coverage move on a band the lane has entered twice, citing five rows that add zero new upstream text; the sizing sentence and the "unmoved" command must change, and the counter needs a band-fit arm and a row-novelty arm.

## Evidence

Axis state read (no integer can move; the verdict is the counter): `SCORECARD.md ## Axes` — `coverage` retired at 10, `coverage:script-layer|runtime-layer|kimi-layer` 10; frontier bands `PROVINCE.md:19` (OMP harness contract) and `:20` (MCP protocol revisions). Base receipts read: `base/omp65-base.txt` (`held=0/8`, EXIT=1), `base/omp65-donothing.txt` (`held=1/8`, EXIT=0), `base/omp-release-tag.txt`, `base/omp-binary-probe-freeze.txt` (15 keys).

**Is the binary surface unmoved at base?** Yes — the plan's command proves a filename, this proves the surface:
```
$ git grep -l 'omp\.real' 47fe2383 -- corpus/ | wc -l          → 0
$ for p in 'lit_2025_11_25' 'lit_2026_07_28' 'real_version' 'wrapper_is_script'; do git grep -c -- "$p" 47fe2383 -- corpus/knowledge/; done  → (no lines, all 0)
```
**But the release was already entered, at source level, in round 44:**
```
$ sed -n '1,2p' corpus/knowledge/omp-agent-root.md
source: S053 https://github.com/can1357/oh-my-pi/blob/45c35e40…/packages/utils/src/dirs.ts; S054 …; S055 …; S056 …; S057 …
verified-at: 2026-10-23 (oh-my-pi tag v18.12.6 = 45c35e40c46166dc726ccc52f5d27f40f2449f99, the installed `omp --version` → omp/18.12.6; …
```
```
$ git grep -o '45c35e40c46166dc726ccc52f5d27f40f2449f99' 47fe2383 -- corpus/SOURCES.md | wc -l   → 16  (8 rows: S053,S054,S055,S060,S068,S087,S088,S089)
```
**Do the new rows carry new text?** No — main and tag bodies are byte-identical for every cited document:
```
$ for p in …/src/mcp/types.ts …/src/mcp/client.ts docs/mcp-runtime-lifecycle.md …/package.json; do
    a=$(curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/$p|sha256sum|cut -d' ' -f1)
    b=$(curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/$p|sha256sum|cut -d' ' -f1); … done
types.ts                  main=caa3eadeb21b tag=caa3eadeb21b IDENTICAL
client.ts                 main=479aef6ddda0 tag=479aef6ddda0 IDENTICAL
mcp-runtime-lifecycle.md  main=362acea5d3d0 tag=362acea5d3d0 IDENTICAL
package.json              main=83c96c5097f6 tag=83c96c5097f6 IDENTICAL
```
Staged material already measured the same binary on 2026-10-24 (`merge/kumitate/…/omp-host-harness-protocol-skew-2026-10-27.md:18`): "`grep -a -o -F` over `/home/vgpnk/.local/bin/omp.real`: `2025-11-25` → 2, `2026-07-28` → **0**, `2025-03-26` → 2, `MCP-Protocol-Version` → 3"; plus wrapper (10 lines), 1680 bytes, 256702432-byte ELF, exit codes 132–139, five restarts.

**Per-key sweep of the 15 frozen keys against that staged entry** (`build/K65CriticC2Scope/keycheck.sh`):
```
wrapper_is_script 1 · wrapper_names_real 3 · wrapper_restart_codes 1 · wrapper_max_restarts 1 · real_is_elf 1
real_bytes 1 · real_version 1 · lit_2025_11_25 1 · lit_2026_07_28 1 · lit_2025_03_26 1 · header 1
sym_MCP_PROTOCOL_VERSION 2 (name, not count) · sym_DeferredMCPTool 0 · collab_hosts_literal 0 · docs_phrase_never_replayed 0
→ 12/15 facts already stated (9 with the exact numeric value); 3 facts new, all occurrence counts of 0–3.
```
**Overlap with the entry it is written beside** (`corpus/knowledge/omp-task-contract.md`): `2025-11-25` 0 lines, `2026-07-28` 0 lines, `wrapper` 0 lines, `omp.real` 0 lines, `18.12` 5 lines (all the stale `omp/18.12.3` of S004).

**§2b.4 question answered:** the new rows are not re-opens of S053/S060/S068 — no base row contains `src/mcp`, `mcp/types.ts`, `mcp/client.ts` or `coding-agent/package.json` (`git grep -c` at base → 0 each). They are re-opens of what *staged* material already cites (S201 types.ts = staged S228's file at main, byte-identical; S204 client.ts likewise; S203 = staged S232's commit; S202 = the doc staged entries say they read), at a ref 8 base rows already pin. Requirement met formally (new ids, captures, quotes, immutable tag), substantively only as a pin.

**O7 wrong-band counterexample** (`build/K65CriticC2Scope/o7-band-probe.mjs`):
```
$ node .ufo/waves/round-65/build/K65CriticC2Scope/o7-band-probe.mjs
O7-named-by: - Isolation substrates for parallel agents — band note advanced by `corpus/knowledge/omp-installed-release-mcp-runtime.md`
NAMED (O7 would pass on a wrong band)   EXIT=0
```

## Findings

1. **K65CriticC2Scope-1 — high — mis-sizing ("first entry that measures the installed release").** Attacks the plan's C2 surface sentence and the axis-fit. The band was entered at release level in round 44 (`omp-agent-root.md`, tag `v18.12.6`), and 8 base rows already pin `45c35e40`; the only surface new to the committed corpus is the ELF/wrapper byte sweep. This is an *advance* on an existing band plus an instrument, not a first entry. Repro: `sed -n '1,3p' corpus/knowledge/omp-agent-root.md; git grep -o '45c35e40…' 47fe2383 -- corpus/SOURCES.md | wc -l` → 16. Fix: use the replacement wording in `build/K65CriticC2Scope/scope.md` §6.

2. **K65CriticC2Scope-2 — high — the rows add zero new upstream text.** Four of five drafted rows are byte-identical at `main` and at the tag (sha256 loop above) and S203 is staged S232's commit. "Re-grounded on rows opened in round 65, never copied" reads to a scorer as new evidence; the measured delta is a ref pin plus the version→commit map. Attacks false provenance of the coverage claim. Fix: the entry must disclose the sha equality and claim the pin, not the text.

3. **K65CriticC2Scope-3 — medium — O7 does not check band fit.** Any PROVINCE line containing `frontier|band|ground|first entry|advanced` satisfies `named`, so the entry could land on the isolation or durable-execution band and read 8/8. Repro: `node build/K65CriticC2Scope/o7-band-probe.mjs` → `NAMED`. Fix (next counter, frozen now): parse the entry's `coverage-map: frontier band "<X>"` and require the naming PROVINCE line to lead with `<X>`.

4. **K65CriticC2Scope-4 — medium — the plan's "command that would show it unmoved" proves a filename.** `test -e corpus/knowledge/omp-installed-release-mcp-runtime.md` would also be "unmoved" for an entry about anything. The surface command is `git grep -l 'omp\.real\|lit_2025_11_25\|real_version' 47fe2383 -- corpus/ | wc -l` → 0. Repro as pasted in Evidence.

5. **K65CriticC2Scope-5 — medium — `O65_HELD` is not a function of M.** O6 executes the archive's probe against the *host's* current `omp.real` and requires `real_version` equality plus ≥ 2 rows at `/v<real_version>/`; an `omp` upgrade flips O6 to MISS at the same revision M. C1's stated limit declares host-state gates; C2's does not. Repro by inspection: `.ufo/waves/round-65/probe/omp65-probe.mjs` O6 (`real = live.get('real_version')`). Fix: declare it in C2's stated limit.

6. **K65CriticC2Scope-6 — low — 4/15 keys measure the operator's wrapper, not the release** (`scripts/omp-binary-probe.sh:22-35`; wrapper mtime 2026-10-23, header records 9 crashes). An entry titled "the installed release" must attribute them or O6's evidence set is partly host configuration. Repro: `sed -n '22,35p' scripts/omp-binary-probe.sh`.

7. **K65CriticC2Scope-7 — low — O2 keys rows by id, not URL**: a new `S###` carrying an URL already in the base registry passes every arm. Repro: `.ufo/waves/round-65/probe/omp65-probe.mjs` O2 (`rows.get(id)` / `baseRows.has(id)`); no arm compares URL paths. Fix (next counter): require ≥ 1 cited `(repo, path)` absent at base.

## Artifacts

- `.ufo/waves/round-65/build/K65CriticC2Scope/scope.md` — full analysis, recommended plan wording, counter strengthenings.
- `.ufo/waves/round-65/build/K65CriticC2Scope/keycheck.sh` — per-key staged-coverage sweep (runs, exit 0).
- `.ufo/waves/round-65/build/K65CriticC2Scope/o7-band-probe.mjs` — O7 wrong-band reproducer (`NAMED`, exit 0).

## Limits

- I did not run the frozen counter (`omp65-probe.mjs`) against a built revision: no entry/probe/rows exist in a commit yet, and `base/omp65-base.txt` + `base/omp65-donothing.txt` already fix the before/control readings. My counterexamples are predicate-level replays of the probe's own regexes/code, not end-to-end runs.
- The staged-material overlap count is against `merge/kumitate/…/omp-host-harness-protocol-skew-2026-10-27.md` only (the closest staged artifact); other staged entries were counted for tokens, not line-by-line.
- "Not new text" is measured for the four documents the drafts cite; I did not hash the whole release tree (9294 blobs) — the scout seat's tag-vs-main blob comparison was not re-run by me.
- I read, but did not score, the drafts' quote bullets (13 in `K65ScribeEntryA`, 12 in `K65ScribeEntryB`) against their captures.
