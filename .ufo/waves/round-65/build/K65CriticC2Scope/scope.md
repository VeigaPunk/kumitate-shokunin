# K65CriticC2Scope — C2 scope and axis-fit attack (round 65, w1)

VERDICT: mixed — C2 does change a surface the committed corpus has never read (the installed release's
**binary bytes**), but it is sized as a first-entry/coverage move when it is an *advance* on a band the lane has
entered twice, on rows that add zero new upstream text; the sizing sentence and the "unmoved" command must change,
and the counter needs two strengthenings (band fit, row novelty).

Axes named: `coverage` (retired, 10), `coverage:script-layer` / `coverage:runtime-layer` / `coverage:kimi-layer`
(10) — C2's family — and frontier band "OMP harness contract" (PROVINCE.md:19), not the "MCP protocol revisions"
band (PROVINCE.md:20). No integer can move; the verdict is the counter, as the plan declares.

## 1. What surface does the round actually change?

| evidence class | exists at base `47fe2383`? | command |
|---|---|---|
| installed OMP **source tree** at the tag of the installed release (v18.12.6) | **yes** — `corpus/knowledge/omp-agent-root.md`, `verified-at:` names `oh-my-pi tag v18.12.6 = 45c35e40…; the installed omp --version → omp/18.12.6` | `sed -n '1,3p' corpus/knowledge/omp-agent-root.md` |
| rows pinned to that exact release commit | **yes, 8** (S053, S054, S055, S060, S068, S087, S088, S089) | `git grep -o '45c35e40c46166dc726ccc52f5d27f40f2449f99' 47fe2383 -- corpus/SOURCES.md \| wc -l` → 16 | 
| the installed **binary's bytes** (`omp.real`, wrapper) | **no** — 0 files | `git grep -l 'omp\.real' 47fe2383 -- corpus/ \| wc -l` → 0 |

So the plan sentence "the first entry that **measures the installed release**" is false in the corpus's own terms:
round 44's `omp-agent-root.md` already grounds the installed release at its tag, and 8 registry rows already pin
`45c35e40`. What is genuinely first, and new, is the **ELF/wrapper byte surface** and the re-runnable probe.

Precedent, not precedent: the staged material (`/home/vgpnk/Projects/shokuknow/merge/kumitate/...`) already measured
the binary on 2026-10-24 (`omp-host-harness-protocol-skew-2026-10-27.md:18`): "`grep -a -o -F` over
`/home/vgpnk/.local/bin/omp.real`: `2025-11-25` → 2, `2026-07-28` → **0**, `2025-03-26` → 2,
`MCP-Protocol-Version` → 3" — four of the probe's fifteen values verbatim, plus the wrapper (10 lines), the 1680-byte
size, the 256702432-byte ELF, exit codes 132–139 and max 5 restarts in prose.

## 2. New vs already-stated, counted

Probe keys at freeze: 15 (`base/omp-binary-probe-freeze.txt`). Against the staged skew entry
(`build/K65CriticC2Scope/keycheck.sh` runs the sweep):

```
key                          staged fact present (count of matching lines)
wrapper_is_script=1            1   (bash crash-restart wrapper)
wrapper_names_real=omp.real    3
wrapper_restart_codes=132-139  1
wrapper_max_restarts=5         1
real_is_elf=1                  1
real_bytes=256702432           1   (exact value)
real_version=18.12.6           1   (exact value)
lit_2025_11_25=2               1   (exact value)
lit_2026_07_28=0               1   (exact value)
lit_2025_03_26=2               1   (exact value)
header_MCP-Protocol-Version=3  1   (exact value)
sym_MCP_PROTOCOL_VERSION=3     2   (name only, not the count)
sym_DeferredMCPTool=3          0
collab_hosts_literal=2         0
docs_phrase_never_replayed=0   0
```

**12 of 15 keys' facts are already stated (9 with the exact numeric value); only 3 facts are new**
(`sym_DeferredMCPTool=3`, `collab_hosts_literal=2`, `docs_phrase_never_replayed=0`) — all three are occurrence
counts of 0–3 in a 256 MB binary, i.e. presence-only, exactly what the plan's own stated limit concedes.

Against the entry the claim is written beside, `corpus/knowledge/omp-task-contract.md`:

```
2025-11-25   0 lines
2026-07-28   0 lines
wrapper      0 lines
omp.real     0 lines
18.12        5 lines   (all the stale `omp/18.12.3` of S004 / verified-at / recheck / Scope / §Version skew)
```

So the entry does not restate `omp-task-contract.md`; it restates **staged** material and corrects one dated line
(`18.12.3` → host now `18.12.6`, already recorded 2026-10-23 in `omp-agent-root.md`).

## 3. Do the new rows carry new text? (§2b.4 answer)

No — for four of five rows the text is byte-identical to `main`, and the fifth row's document is one staged
material already cites. Measured this round (`curl` at `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0` and at tag
`v18.12.6`, sha256 of the body):

```
types.ts                  main=caa3eadeb21b tag=caa3eadeb21b IDENTICAL
client.ts                 main=479aef6ddda0 tag=479aef6ddda0 IDENTICAL
mcp-runtime-lifecycle.md  main=362acea5d3d0 tag=362acea5d3d0 IDENTICAL
package.json              main=83c96c5097f6 tag=83c96c5097f6 IDENTICAL
```

- S201 `types.ts` at the tag = the file staged `omp-mcp-protocol-version-code` (S228) quotes at `main`, byte-identical.
- S204 `client.ts` at the tag = the file staged S228 cites at `main`, byte-identical.
- S202 `docs/mcp-runtime-lifecycle.md` at the tag = the doc staged entries say they read, byte-identical.
- S203 the commit patch = the commit staged `omp-mcp-version-negotiation-decision` (S232) already cites, same sha.
- S205 `package.json` = new *path*, byte-identical to `main`.

Of the lane's 13 pre-existing oh-my-pi rows, none reads `src/mcp/`, `mcp/types.ts`, `mcp/client.ts` or
`coding-agent/package.json` (`git grep -c` at base → 0 each), so the new rows are **not** re-opens of S053/S060/S068.
§2b.4 is therefore met **formally** (new ids, new captures, new quotes, an immutable tag), and met **substantively
only at pin level**: the text delta is zero, and the release ref was already pinned by 8 base rows. The novelty the
round can honestly claim is the version→commit map (`§Version skew`'s "UNKNOWN") plus the binary bytes.

## 4. Verdict on the axis

- **Coverage?** Only in the narrow reading "binary bytes are a surface the corpus never opened". That reading is
  real (`git grep` → 0 files at base) and it is the reading the plan should name.
- **Quality?** Everything else in C2 is quality work: re-scoring an already-staged measurement (same binary, same
  commands, 2026-10-24) with a script, plus a dated correction of one existing entry.
- **Mixed, scored as an advance**: the round moves `corpus/knowledge` by one entry on a band already entered twice
  (round 34 docs, round 44 release tree) and adds an instrument. It is not a new band and not a "first entry".

## 5. Counter gaps proven with counterexamples

**(a) O7 does not check band fit.** Append the entry path to *any* PROVINCE line containing `frontier|band|ground|
first entry|advanced`, e.g. the isolation band, and O7's `named` predicate passes:

```
$ cp PROVINCE.md /tmp/…/prov-test.md && printf '\n- Isolation substrates for parallel agents — band note advanced by `corpus/knowledge/omp-installed-release-mcp-runtime.md`\n' >> prov-test.md
$ node -e '<the probe's own predicate>'   → O7-named-by: - Isolation substrates for parallel agents — band note advanced by `corpus/knowledge/omp-installed-release-mcp-runtime.md`
```

Reproducer: `node .ufo/waves/round-65/build/K65CriticC2Scope/o7-band-probe.mjs` (same regex, prints `NAMED`).

**(b) O2 has no URL-novelty gate.** It keys rows by `S###`, so a new id carrying an URL that already exists in the
base registry at another id passes every arm (`status mined`, `opened`, `tier`, `used-by`). A pure re-open with a
new number reads `O2 pass`. There is no arm that requires one cited `(repo, path)` to be absent at base.

**(c) O6 makes `O65_HELD` a function of host state, not of M.** O6 runs the archive's probe on *this* host and
requires `real_version` equal to the entry's stated value and ≥ 2 cited rows at `/v<real_version>/`. An `omp`
upgrade on the host flips O6 to MISS for the *same* revision M. C1's stated limit declares host-state gates; C2's
does not.

**(d) 4 of 15 keys measure the operator's wrapper, not the release** (`wrapper_is_script`, `wrapper_names_real`,
`wrapper_restart_codes`, `wrapper_max_restarts`; `scripts/omp-binary-probe.sh:22-35`, wrapper mtime 2026-10-23).
An entry titled "the installed release" carries a quarter of its host section about a local shell script.

## 6. Smallest safe corrections

**Plan sentence (frozen — reported, for the L1/next round record).** REPLACE the C2 "Surface it moves" sentence

> `PROVINCE.md` frontier line "OMP harness contract" gains the first entry that **measures the installed release**.

WITH

> the frontier band "OMP harness contract" — entered at docs level in round 34 (`omp-task-contract.md`) and at
> release-tree level in round 44 (`omp-agent-root.md`, rows S053/S054/S055/S060 at tag `v18.12.6`) — **advances** by
> one entry that reads the installed release's **binary bytes**, the one surface the committed corpus has never
> opened (`git grep -l 'omp\.real' 47fe2383 -- corpus/` → 0), and that supplies the version→commit map its
> predecessor records as UNKNOWN; the MCP constant `2025-11-25` is not new ground (staged
> `omp-host-harness-protocol-skew-2026-10-27` measured it on 2026-10-24, and 12 of the probe's 15 values are
> already stated there).

**Unmoved command (same report).** REPLACE
`test -e corpus/knowledge/omp-installed-release-mcp-runtime.md` and `grep -c … PROVINCE.md` (proves a filename)
WITH `git grep -l 'omp\.real\|lit_2025_11_25\|real_version' 47fe2383 -- corpus/ | wc -l` → `0` (proves the
measurement surface), keeping the PROVINCE grep as the second arm.

**Entry (not frozen; for the scribes/L1).** The entry must state its delta, not re-quote a staged fact: name
`omp/18.12.3` (S004) → `18.12.6`, name the release commit as the resolved map, and disclose in `## Scope` that
S201/S202/S204 are byte-identical to their `main` counterparts (`sha256` equal, measured 2026-10-25) so the tag pin
is the delta, not the text.

**Counter (frozen — reported only, next counter).** Two strengthenings, no relaxations:
1. O2 novelty arm: at least one cited row whose `repository+path` pair is absent from the base registry
   (`rowsOf(baseSrc)` already in hand; compare the URL's path segment).
2. O7 band fit: parse the entry's `coverage-map: frontier band "<X>"` line and require the PROVINCE line that names
   the entry to lead with that band's text (`line.startsWith('- ' + X)` after normalising the trailing qualifier).
3. C2 stated limit: add "O6 compares against the host's current binary, so a release change on the host fails the
   claim at an unchanged revision M" (C1 already declares this class).
