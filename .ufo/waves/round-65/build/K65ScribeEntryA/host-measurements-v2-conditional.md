# Conditional block — the entry's § Host measurements if a probe v2 lands

Status: **not applied** to `omp-installed-release-mcp-runtime.md`. The frozen counter's O6 compares stated vs live keys in
both directions (`probe/omp65-probe.mjs:184-215`), so § Host measurements must equal exactly what
`scripts/omp-binary-probe.sh` prints in the archive: 15 bullets for the round-65 v1 probe (what the entry carries), 22
for the v2b draft.

If the L1 lands `build/K65ExecOmpKeys/probe-v2b.sh` as `scripts/omp-binary-probe.sh`, replace the whole § Host
measurements section with the block below **and** change the two key counts in the header — `verified-at:` says "printed
15 `OMP_BIN:` keys" and `recheck:` says "compare its 15 `OMP_BIN:` keys" — to 22.

Independently run by this seat on 2026-10-25 (`build/K65ScribeEntryA/probe-v2b-run-by-scribe.txt`, exit 0, 1.24 s wall):
all 22 values equal the executor's three runs (output sha256 `446609c6…72a`). Difference from the earlier `probe-v2.sh`:
one slot — `docs_heading_lifecycle=0` out, `decl_2025_03_26=1` in; if the L1 prefers `probe-v2.sh`, swap that single
bullet back.

## Host measurements

`bash scripts/omp-binary-probe.sh`, run 2026-10-25, exit 0, `OMP_BIN_PROBE: DONE omp=18.12.6`:

- wrapper_is_script=1
- wrapper_names_real=omp.real
- wrapper_restart_codes=132-139
- wrapper_max_restarts=5
- real_is_elf=1
- real_bytes=256702432
- real_version=18.12.6
- lit_2025_11_25=2
- lit_2026_07_28=0
- lit_2025_03_26=2
- sym_MCP_PROTOCOL_VERSION=3
- header_MCP-Protocol-Version=3
- sym_DeferredMCPTool=3
- collab_hosts_literal=2
- docs_phrase_never_replayed=0
- real_sha256=85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4
- lit_2025_06_18=0
- decl_2025_11_25=1
- changelog_versions=43
- changelog_installed=1
- docs_heading_collab=0
- decl_2025_03_26=1

## What the extra keys would let the entry say (only if the probe lands)

- `decl_2025_11_25=1` and `decl_2025_03_26=1`: each revision literal has exactly one declaration, so the pooled counts
  split 2 = 1 declaration + 1 use per client — the core client on `2025-11-25` (S201:181, S204:100) and the Z.AI
  provider on `2025-03-26` (S205:80, :222). This is the byte-side version of § What the release negotiates.
- `real_sha256` identifies the measured artifact across host re-installs and replaces the Limits clause that the binary
  "was not re-hashed between the two runs".
- `changelog_installed=1`, `changelog_versions=43`: the release embeds its own changelog, so the `18.12.6` section can be
  read out of the binary as a cross-check on `--version`.
- `lit_2025_06_18=0` is consistent with `types.ts:287`'s `2025-06-18` being a source comment that does not survive the
  bundle (K65ScoutTypesTs-2); it is not evidence that the release refuses that revision.
