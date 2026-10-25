# Audit17 — Quarantine-S142 (round-61 / w2)

Task: check the S142 locator claim against the pinned source repository at the named
commit; determine whether the named source file **defines or imports**
`MCP_PROTOCOL_VERSION`.

## Verdict

**Wave-1 claim CONFIRMED in full — the register row's source cell points at the wrong
file.** At pinned commit `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0`:

- `packages/coding-agent/src/mcp/client.ts` does **NOT define** `MCP_PROTOCOL_VERSION`.
  It **imports** it (line 41) and **uses** it (line 100). `grep -n "export const"
  client.ts` → zero hits; `grep -nE "export.*MCP_PROTOCOL_VERSION|const
  MCP_PROTOCOL_VERSION"` → exit 1. The row's quoted span `export const
  MCP_PROTOCOL_VERSION = "2025-11-25";` is absent from the cited file — the census's
  `payload-absent` classification is a **locator defect**, not a fabrication.
- `packages/coding-agent/src/mcp/types.ts` **defines** it: line 181 is verbatim
  `export const MCP_PROTOCOL_VERSION = "2025-11-25";` (exact byte match to the row's
  quote). `types.ts` itself imports only *types* (`import type` at l.1, l.19); the
  constant is defined there, not imported.

## Evidence

### Register row under test

`absent-defect-register.md` at `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833` (matches
wave-1's recorded hash), 83,621 bytes. Line 140, verbatim:

```
| `kumitate` | round4 | S142 | `payload-absent` | https://github.com/can1357/oh-my-pi/blob/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/packages/coding-agent/src/mcp/client.ts | `export const MCP_PROTOCOL_VERSION = "2025-11-25";` | cited source, companion URLs and local artifacts were all checked; the quote is in none of them |
```

(Note: two other lanes also hold S142 rows — `kake` l.83, `tabi` l.197 — different
sources, out of scope; only the `kumitate` row concerns this audit.)

### Independent re-verification (this round)

- `git ls-remote https://github.com/can1357/oh-my-pi HEAD` →
  `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0` — the pinned commit **is current HEAD**;
  shallow clone (`--depth 1`) into `/tmp/kumitate-r61/Audit17/oh-my-pi`, `git
  rev-parse HEAD` = the pin.
- `grep -n MCP_PROTOCOL_VERSION packages/coding-agent/src/mcp/client.ts`:
  - `41: import { MCP_PROTOCOL_VERSION } from "./types";`
  - `100: protocolVersion: MCP_PROTOCOL_VERSION,` (inside `MCPInitializeParams`,
    `initializeConnection`)
  - **no line 3+** — exactly two references, neither a definition.
- `grep -n "export const" client.ts` → empty (exit 1 via `head` truncation-safe);
  file has zero const exports at all.
- `grep -n MCP_PROTOCOL_VERSION packages/coding-agent/src/mcp/types.ts`:
  - `181:export const MCP_PROTOCOL_VERSION = "2025-11-25";` — the **only** hit,
    the definition, byte-identical to the register quote.
- Repo-wide sweep (`grep -rn MCP_PROTOCOL_VERSION packages/`): other hits are
  `transports/http.ts:6` (doc comment reference only) and
  `web/search/providers/zai.ts:80,222` (a *different* constant
  `ZAI_MCP_PROTOCOL_VERSION = "2025-03-26"` — unrelated). **Sole definition site:
  `types.ts:181`.**
- Byte sizes reproduce wave-1's recorded fetch sizes exactly: `client.ts` = 14,975 B,
  `types.ts` = 16,167 B.

### Staged-package cross-check (the locator defect's origin)

`lanes/kumitate/round4/SOURCES-PROPOSED.md` (merge package, campaign repo):

- **Row S228, line 16**: `source` cell names `…/src/mcp/client.ts` — the wrong file
  for this quote. (Its `location` cell already says "…client.ts:91-125
  (initializeConnection → notifications/initialized), **with the version constant at
  packages/coding-agent/src/mcp/types.ts:181**" — i.e. the lane knew the constant
  lives in `types.ts`.)
- **Gate block `## Gate — S228` (l.64–70)**: `url:` names `…/src/mcp/types.ts`,
  `location:` `packages/coding-agent/src/mcp/types.ts:181`, `quote:` the same
  `export const MCP_PROTOCOL_VERSION = "2025-11-25";` — the correct file.

So row and gate disagree within the same staged document; the census checked the
row's `source` cell (`client.ts`) and correctly found the quote absent there. The
defect is in the staged row's source cell, faithfully copied into the register.

## Answers to the assigned question

1. Does the named source file (`client.ts`) **define** `MCP_PROTOCOL_VERSION`?
   **No.**
2. Does it **import** it? **Yes** — line 41 (`import { MCP_PROTOCOL_VERSION } from
   "./types";`), used at line 100.
3. Where is the quote anchored? `packages/coding-agent/src/mcp/types.ts:181` at the
   same pinned commit — verbatim.

## Commands (reproducible)

```sh
git ls-remote https://github.com/can1357/oh-my-pi HEAD
git clone --depth 1 https://github.com/can1357/oh-my-pi /tmp/kumitate-r61/Audit17/oh-my-pi
cd /tmp/kumitate-r61/Audit17/oh-my-pi && git rev-parse HEAD
grep -n MCP_PROTOCOL_VERSION packages/coding-agent/src/mcp/client.ts   # 41 import, 100 use
grep -n MCP_PROTOCOL_VERSION packages/coding-agent/src/mcp/types.ts    # 181 definition
grep -c "export const" packages/coding-agent/src/mcp/client.ts         # 0
wc -c packages/coding-agent/src/mcp/{client,types}.ts                  # 14975 / 16167
grep -n "S142" /home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md
sed -n '16p;64,70p' /home/vgpnk/Projects/shokuknow/lanes/kumitate/round4/SOURCES-PROPOSED.md
```

## Residual risk / scope notes

- The check used the commit's own clone, not the GitHub web fetch wave-1 used;
  content is commit-addressed, so equivalence is guaranteed by the hash.
- `types.ts` line 181 is the sole definition; no barrel re-export through
  `client.ts` exists (verified: `client.ts` contains no `export` of the constant).
- Fix direction (report only, register/package are read-only to this seat): the
  S228 row's `source` cell should name `types.ts`, matching its own gate block —
  or the quote should be re-anchored to `client.ts:41` (the import site), which is
  the only line in that file that textually contains the constant's name.
- No installs performed; pacman untouched per wave policy. Tools used: git,
  grep/sed/wc, sha256sum. Scratch confined to `/tmp/kumitate-r61/Audit17/`.
