SOURCE_ROW status=queued tier=A quote_words=8

# ScribeSrcKimiMcpCli — round 35 build: draft registry row for the Kimi MCP command surface

Scope: one `corpus/SOURCES.md` row draft (S0NN placeholder). Registry NOT edited.

## Source opened
- URL: https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html
- Access date: 2026-10-20 (direct HTTPS read; VitePress HTML; no Last-Modified header in the response, so no revision date is claimed).
- Distinct from S005 (`/en/customization/mcp.html`): yes. It is the Reference > Slash Commands page.
- Quote 1 (≤25 words, verbatim) — location: § Built-in skill commands, table row `/mcp-config`:
  "Configure MCP servers and handle MCP OAuth login." (8 words)
- Other verbatim text observed on the same page:
  - § Information & Status, table row `/mcp`, Always available = Yes: "List MCP servers and their connection status in the current session"
  - § Built-in skill commands, after the table: "All built-in Skill commands are only available in the idle state."

## Draft row
`| S0NN | Kimi Code CLI Docs: Slash Commands — https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html | docs | A | Kimi Code in-TUI MCP commands /mcp and /mcp-config and their idle-state availability | § Information & Status (/mcp row); § Built-in skill commands (/mcp-config row); fetched 2026-10-20 | /mcp lists server connection status and is always available; /mcp-config is a built-in skill, idle-only, that configures servers and handles OAuth login | queued | 2026-10-20 | on-release | corpus/knowledge/kimi-mcp-plane.md |`

Cells: 11 (no `|` inside any cell).

## Checks
- Kind `docs`, tier `A`: official Kimi Code CLI documentation, scoped to the in-TUI MCP command surface only.
- Province: Kimi Code substrate `~/.kimi-code/` is a Core band (PROVINCE.md, Core). Not out of province.
- Novelty: S005 already says `/mcp` shows connection status and `/mcp-config` configures servers. This page adds what S005 lacks: `/mcp` is available while the agent is streaming, and `/mcp-config` is idle-only. Small but grounded, so the row is not rejected. Flip to `REJECTED: duplicates S005 § Configuration; flip: a reviewer shows the availability columns are already cited from S005` if the aggregator judges it duplicative.
- Scope limit (matters for C3): this page does NOT document the `~/.kimi-code/mcp.json` file location or its shape. Those are anchored only by S005 § Configuration. This row supports the command surface, not the K1 mcp.json member. C3 must cite S005 for the file.

## Gate notes
- Status is `queued`, not `mined`. Rule: `mined` requires a `used-by` path that cites the row. `corpus/knowledge/kimi-mcp-plane.md` is planned, and I did not open or confirm that it exists. Flip to `mined` only after that entry cites S0NN.
- Pages read in this round: the docs landing page (`/kimi-code/en/`), `customization/mcp.html` (S005 re-check; its quotes match S005's anchor), `configuration/config-files.html` (S006 re-check; `[mcp]` timeouts), and `reference/slash-commands.html` (new). Other pages were not opened, so the sweep does not show that no other page covers mcp.json. No negative claim is made.
- Re-check of S005 (not RECHECK-required): the page still contains the `mcp.json` user-level and project-level text and the `/mcp-config`, `/mcp` pointers. No quote change was needed.
- Tooling: no installs or upgrades. Read-only HTTPS fetches only; no REA device use; no edits outside this report.

## Handoff for the main agent
- Registry owner assigns the S0NN id and writes the row (the draft is a claim until then).
- The C3 mcp.json member's anchor is S005 § Configuration, not this row.
