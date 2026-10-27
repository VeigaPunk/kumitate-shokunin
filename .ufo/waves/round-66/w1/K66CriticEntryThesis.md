VERDICT: The C2 thesis is half-sound — HTTP+SSE (`sse.ts`) is deprecated since 2025-03-26 and binds OMP at its negotiated 2025-11-25, but `roots` is deprecated only from 2026-07-28, a revision OMP does not negotiate, so "declares the roots capability, both deprecated" is registry-membership truth that must NOT be phrased as a current dependency; the exact defensible wording and the must-not-claims are in build/K66CriticEntryThesis/attack.md.

## Evidence

All fetches ran 2026-10-27; captures + sha256 in `.ufo/waves/round-66/build/K66CriticEntryThesis/captures/` and `captures.sha256`.

- Registry (https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md): Roots row "Deprecated in `2026-07-28` … First revision released on or after 2027-07-28"; HTTP+SSE row "Deprecated in `2025-03-26` … Three months after SEP-2596 reaches Final"; "No features have been removed under this policy yet."
- Policy (https://modelcontextprotocol.io/community/feature-lifecycle.md): "The feature becomes Deprecated when the revision carrying these changes is released and becomes the new Current revision"; Removed features "remain documented in the Final revision it last appeared in".
- Roots at 2026-07-28 (specification/2026-07-28/client/roots.md): "**Deprecated**: The Roots feature is deprecated as of protocol version `2026-07-28`". Roots at 2025-11-25 (specification/2025-11-25/client/roots.md): zero deprecation hits; "Clients that support roots **MUST** declare the `roots` capability during initialization."
- OMP v18.12.6 types.ts:181: `export const MCP_PROTOCOL_VERSION = "2025-11-25";` client.ts `initializeConnection`: `capabilities: { roots: { listChanged: false } }`, `transport.setProtocolVersion?.(result.protocolVersion)`; `defaultRequestHandler` answers `roots/list`; `createTransport` selects SSE only for `type: "sse"`. sse.ts: "/** Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05. */"
- `curl -s https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596` → merged_at 2026-05-18T18:09:21Z; pulls/2577 → merged_at 2026-05-15T22:23:10Z. Staged campaign corpus (shokuknow, read-only) records the `final` label at 2026-06-03T17:07:09Z and two staged "corrections" (2026-07-17 vs 2026-08-18) already ruled wrong-in-kind.
- Installed binary `~/.local/bin/omp`: strings show `oh-my-pi`, `omp-coding-agent`, `2025-11-25`; `18.12.0/1/2` but no `18.12.6`; `Legacy MCP HTTP+SSE transport` count 0 (Bun-baked payload compressed). `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version` → error: command not found (path absent).

## Findings

- **K66CriticEntryThesis-1 (high; attacks the thesis's roots half / axis A revision scope).** A client declaring `roots` while negotiating 2025-11-25 does NOT depend on a deprecated feature: the deprecation is revision-scoped (policy wording + the notice's own "as of protocol version 2026-07-28"), and 2025-11-25 still marks roots Active and normative. Repro: `curl -s https://modelcontextprotocol.io/specification/2025-11-25/client/roots.md | grep -ci deprecat` → `0`; compare `captures/roots-2026-07-28.md` warning block.
- **K66CriticEntryThesis-2 (medium; attacks "both deprecated" as implicature / axis B).** The plan sentence invites the false inference that both features currently bind OMP. Only registry membership is true for roots; the dependency claim is true only conditionally (if OMP ever raises `MCP_PROTOCOL_VERSION` to ≥ 2026-07-28, the unconditional declaration exercises a Deprecated feature whose removal clock ends 2027-07-28). Repro: `grep -n "MCP_PROTOCOL_VERSION" build/K66CriticEntryThesis/captures/omp-types-v18.12.6.ts`.
- **K66CriticEntryThesis-3 (info; confirms the thesis's HTTP+SSE half).** "Deprecated in 2025-03-26" predates 2025-11-25 and binds at the negotiated revision; the 2025-11-25 transports page itself documents the "deprecated HTTP+SSE transport" and its backwards-compat path. Repro: `grep -n "deprecated" build/K66CriticEntryThesis/captures/transports-2025-11-25.md`.
- **K66CriticEntryThesis-4 (medium; attacks any settled-date claim / axis C).** "Three months after SEP-2596 reaches Final" has three candidate Final dates (created 2026-04-17; merged 2026-05-18; `final` label 2026-06-03 per the lane timeline probe in the staged corpus) → three eligibility dates, all past; the staged corpus already contains two contradictory wrong corrections. The entry must quote the cell verbatim and must not assert a computed removal date; eligibility ≠ removal and nothing has been removed. Repro: `grep -c "correction" /home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/deprecation-clock-corrections-2026-10-26.md`.
- **K66CriticEntryThesis-5 (low; axis D ship-vs-exercise + version linkage).** `sse.ts` ships (tag v18.12.6 = commit 45c35e40c46166dc726ccc52f5d27f40f2449f99, verified via API) but is selected only by config `type: "sse"`; the installed Bun-baked binary exposes no v18.12.6 string, so "installed = v18.12.6" rests on the plan's declaration. Entry must keep the plan's stated limit (no runtime-use claim). Repro: `grep -n "case \"sse\"" build/K66CriticEntryThesis/captures/omp-client-v18.12.6.ts`.

Smallest safe correction (full proposed `## Bearing on the installed OMP release` text, M7-shaped): `build/K66CriticEntryThesis/attack.md` §D. In one line: HTTP+SSE binds at the negotiated revision; roots is deprecated only from 2026-07-28 and stays Active at 2025-11-25, so its declaration is conformant until OMP moves revisions.

## Artifacts

- `.ufo/waves/round-66/build/K66CriticEntryThesis/attack.md` — full attack: axes, Q1/Q2 verdicts, clock sub-attack, proposed section text, must-not-claim list, residual gaps.
- `.ufo/waves/round-66/build/K66CriticEntryThesis/captures/` — 10 live-source captures (registry, policy, roots@2026-07-28, roots@2025-11-25, transports@2025-11-25, omp client/sse/types @v18.12.6, PR 2596/2577 JSON) + `captures.sha256`.
- Scratch `/fast/scratch/hyaku/kumitate-r66/K66CriticEntryThesis/` created empty and removed; no fixture repos needed.

## Limits

- Did not verify the host's live MCP server configs (whether any `type: "sse"` entry exists) — outside the claim's stated limit anyway.
- Could not run the installed binary's `--version` (only `omp.real` was authorized and it does not exist); version linkage relies on the plan's declaration + upstream tag existence.
- Did not re-run the frozen counters (read-only attack seat); M4 quote-length (≤25 words) and M7 regexes were read and the proposed wording is shaped to fit, but final fit is the integrator's check.
- GitHub `final`-label timestamp (2026-06-03) is cited from the staged campaign corpus's timeline probe, not re-fetched via the events API this seat.
