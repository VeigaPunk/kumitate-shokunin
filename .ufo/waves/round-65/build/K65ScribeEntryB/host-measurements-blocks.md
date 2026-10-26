# Host-measurements blocks for `omp-installed-release-mcp-runtime.md` — pick one, land it with the probe

O6 compares the entry's `## Host measurements` keys against `bash scripts/omp-binary-probe.sh` **in both
directions**: a key the probe prints and the block omits, or a key the block states and the probe does not
print, both read `stated-not-live`. The entry therefore cannot be landed independently of the probe script.
Draft B of the entry states the **15-key** block, because that is what the committed
`scripts/omp-binary-probe.sh` prints (v1, `kumitate-omp-binary-probe-v1`, unchanged in the working tree
on 2026-10-25). If the L1 lands the hardened 22-key probe (drafted by seat `K65ExecOmpKeys` at
`build/K65ExecOmpKeys/probe-v2.sh`, reproduced byte-identically here), swap the entry's block for the
22-key block below **in the same change** and add the three sentences the entry currently carries as
prose (`real_sha256`, the single module-scope `= "2025-11-25"` declaration plus absent `2025-06-18`,
and the in-binary `## [18.12.6]` changelog heading) back as key references.

Both blocks were measured on this host on 2026-10-25; runs are byte-identical between the v1 script, the
v2 draft, the v2 draft's three recorded runs and my independent run (`cmp` clean, exit 0, empty stderr).

## 22-key block (probe v2 — upgrade; use only if that probe lands)

```
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
- docs_heading_lifecycle=0
```

## 15-key block (committed v1 `scripts/omp-binary-probe.sh` — what draft B states)

```
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
```

## Why each added key is safe to state

- `real_sha256` is a fixed digest of the measured binary (`85d9daf3…`), already used in the entry's
  replacement falsifier; it makes "the binary changed" a single-value check.
- `lit_2025_06_18=0` widens D2: not just `2026-07-28`, the neighbouring MCP revision is absent too.
- `decl_2025_11_25=1` shows the constant is a module-scope declaration (`= "2025-11-25"`), not a member of
  a version list — the difference between "supports a set" and "sends one".
- `changelog_versions=43` / `changelog_installed=1` bind `real_version` to an in-binary
  `## [18.12.6] - <date>` heading, so the version is read from bytes, not from `--version`.
- `docs_heading_collab=0` / `docs_heading_lifecycle=0` add two headings (the runtime doc's own H1 is
  `# MCP runtime lifecycle`) to D4 without generalising to "no docs are embedded".
