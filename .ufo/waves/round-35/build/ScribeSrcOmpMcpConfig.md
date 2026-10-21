SOURCE_ROW status=queued tier=A quote_words=19

# ScribeSrcOmpMcpConfig — frontier step, round 35 build (coverage)

Lead opened: "OMP docs beyond the three rows" (corpus/SOURCES.md § Leads), entry `mcp-config.md`.
Scope of this step: one row draft only. The registry was not edited.

## Source

- URL: https://github.com/can1357/oh-my-pi/blob/main/docs/mcp-config.md
- Fetched: https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/mcp-config.md (574 lines; read 1-300 in this step)
- Access date: 2026-10-20
- Main commit seen: 10b9b493f424933af884ae434f0cb96cd74b48fd
  (`git ls-remote https://github.com/can1357/oh-my-pi refs/heads/main`, run after the fetch)
- Last commit touching the file: 4ab6de0b (2026-10-16, "fix(mcp): preserve legacy resource metadata scopes"), via
  `curl -sS "https://api.github.com/repos/can1357/oh-my-pi/commits?path=docs/mcp-config.md&per_page=1"`.
  [INFERENCE] the raw fetch and the ls-remote call may straddle a main advance; the row cites 10b9b493 as the observed head.

## Quote (≤25 words, location grounded)

Location: `## Preferred config locations`, second paragraph (raw doc, first section).

> "The native provider also reads `.omp/.mcp.json` and `~/.omp/agent/.mcp.json` for compatibility, but OMP writes to the primary `mcp.json` paths above."

Word count: 19.

## Draft row

```
| S0NN | oh-my-pi docs/mcp-config.md — https://github.com/can1357/oh-my-pi/blob/main/docs/mcp-config.md | docs | A | OMP-native MCP config file locations and profile scoping on main | docs/mcp-config.md § Preferred config locations; main 10b9b493f424933af884ae434f0cb96cd74b48fd (ls-remote 2026-10-20); file last changed 4ab6de0b (2026-10-16) | OMP-native MCP config: project .omp/mcp.json and user ~/.omp/agent/mcp.json (profile-scoped); legacy .omp/.mcp.json read but not written | queued | 2026-10-20 | on-release | — |
```

Column check: 11 columns, awk NF=13 (checked on a scratch copy at
/fast/scratch/kumitate-r35/w/ScribeSrcOmpMcpConfig/row.md; `awk -F'|' '/^\| S0NN/ {print "NF="NF}'` → `NF=13`).

## Judgment

- Tier A: the row is the upstream maintainers' own docs on `main`, scoped to OMP's own MCP config surface. Tier is curation and is scoped to this row only.
- Status `queued`: opened, worth mining; `used-by` is `—` because no knowledge entry cites it yet. It becomes `mined` only when a path cites it.
- Province: in-province. The lead sits under the OMP harness frontier band (PROVINCE.md § Frontier: "OMP harness contract") and the harness owns the MCP config surface that the lane's Kimi mcp plane is compared against. Not a security-province item (no OAuth mitigation analysis is taught; the doc's auth section is only cited as a locator).
- Not a duplicate: S001–S003 cover task, hub, and discovery precedence; S005–S007 cover Kimi and Codex MCP config. No existing row covers OMP's MCP config locations or profile scoping.
- Not a rejection: nothing in the opened section contradicts an existing row or falls outside the province, so no `REJECTED:` line is drafted.

## Registry notes for the integration owner

- Next unused id is S021 (existing registry tops out at S020). The row above keeps the requested `S0NN` placeholder; the integrator assigns the number.
- This row does not satisfy the contract's "one grounded learner benefit" beyond the file-location fact; the imported-tool precedence and timeout sections were read in the raw fetch but not drafted into the teaches cell, to keep the row to one benefit.
- `corpus/SOURCES.md` § Leads "OMP docs beyond the three rows" still lists mcp-config.md; the integrator should remove it from Leads when the row lands (lead → row, not both).

## Commands run

- `_read https://github.com/can1357/oh-my-pi/blob/main/docs/mcp-config.md` → raw text via github-raw, 574 lines, first 300 read.
- `git ls-remote https://github.com/can1357/oh-my-pi refs/heads/main` → `10b9b493f424933af884ae434f0cb96cd74b48fd	refs/heads/main`
- `curl -sS -m 20 "https://api.github.com/repos/can1357/oh-my-pi/commits?path=docs/mcp-config.md&per_page=1"` → sha `4ab6de0b20b54c0bd4ced8295b723e58f7971e52`, author date 2026-10-16T14:01:35Z.
- `awk -F'|' '/^\| S0NN/ {print "NF="NF}' row.md` (scratch copy) → `NF=13`.

## Tools

- No installs or upgrades. `git`, `curl`, `awk` were already present.

## Out of scope / not touched

- Registry `corpus/SOURCES.md`: not edited.
- Other lead entries (collab.md, advisor-watchdog.md, mcp-protocol-transports.md, mcp-runtime-lifecycle.md): not opened.
- Remaining 274 lines of mcp-config.md (credential and OAuth detail, schema): not mined for this row.
