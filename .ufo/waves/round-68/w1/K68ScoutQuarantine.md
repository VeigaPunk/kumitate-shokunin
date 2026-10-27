VERDICT: All nine quarantine rows are PRESENT at their cited document identity or pinned source; no row is fabrication-class or unreachable on this round's checks.

## Evidence
- Read `.ufo/waves/round-68/assimilation/quarantine-slice`: 9 entries — S109/S116/S118/S129/S142 `payload-absent`; S143`/S144`/S145`/S178` could-not-be-fetched.
- Read-only register `/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`: supplied cited URLs and five quotes; its NEVER CHECKED section has no quote column for the four `could-not-be-fetched` rows. Their checkable claimed spans were recovered from corresponding staged gate rows; see build verdict file.
- Fresh network results: S109 HTTP 200 / 681275 B; S116 `/abs` HTTP 200 / 45963 B and `/html` HTTP 200 / 663997 B; S118 `/abs` HTTP 200 / 44818 B and e-print HTTP 200 / 112394 B; S129 HTTP 200 / 133679 B; S142 `client.ts` HTTP 200 / 14975 B and `types.ts` HTTP 200 / 16167 B; S143 repo web HTTP 404 but `git ls-remote` exit 0, `fb7157fcf14625be9d0b91bdd425a4b3212e4194 HEAD`; S178 ACM HTTP 403 / 5522 B, Crossref HTTP 200 / 7080 B, `aaron papers fetch … --mode auto` exit 0, tier=scihub, 47194 bytes.
- Verbatim check outputs: S109 `grep -c clientCapabilities` → `8`; S116 `exact quote found: True`, `in de-tagged text: True` (v3 §4.1); S118 `main.tex:22:\\title{Where Does Exactly-Once Live?\\\\ Model, Harness, and Tool-Contract Effects\\\\ on Duplicate Side Effects in LLM Agents}`; S129 `grep -c Mcp-Session-Id` → `2`; S142 `s142_types.ts:181:export const MCP_PROTOCOL_VERSION = "2025-11-25";`; S143 `70`, reproduced residue `TOTAL=70 UNCITED=0`; S144 `blob`; S145 deletion commit `2a04baf280328658b22f70521f62c4ff76410d9b`; S178 full-text quote count → `1`.
- Verdict details, fetch commands and located text: `.ufo/waves/round-68/build/K68ScoutQuarantine/verdicts.md`.

## Findings
1. **K68ScoutQuarantine-1 — LOW, false fabrication signals.** Attacks the actionable reliability of the five `payload-absent` classifications: each quote is present when the correct representation/version is checked (JSX-interrupted HTML; arXiv v3; e-print tarball; typographic apostrophe; defining file `types.ts`). Reproduce S116: `curl -fsSL https://arxiv.org/html/2512.08296 | grep -o 'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures'` → match. S116 is present only in v3; pin v3 for future adoption/recheck.
2. **K68ScoutQuarantine-2 — MEDIUM, locator correction required.** S142's quote is present at pinned `types.ts:181`, not the register's cited `client.ts` (which imports it at line 41). Reproduce: fetch both pinned raw files and `grep -n MCP_PROTOCOL_VERSION`; results are client import/use, definition in `types.ts:181`. Do not adopt with the wrong source-cell locator.
3. **K68ScoutQuarantine-3 — LOW, fetch-channel boundary.** The four never-checked rows are not fabrication: GitHub web page returns 404 while git protocol works; ACM returns 403 while `aaron` retrieves Sagas full text and the quoted abstract span. Reproduce: `git ls-remote https://github.com/VeigaPunk/ufo-fsd-alpha HEAD` (exit 0) and `aaron papers fetch 10.1145/38714.38742 --mode auto` (exit 0). S143's 0-uncited count is time-sensitive; S178 requires the alternate fetch channel.

## Artifacts
- `.ufo/waves/round-68/build/K68ScoutQuarantine/verdicts.md`
- `.ufo/waves/round-68/w1/K68ScoutQuarantine.md`

## Limits
- S143/S144/S145/S178 have no quote in the register's never-checked rows; their claim spans were recovered from matching staged gate rows and checked against the cited documents. This is document-identity hand-checking, not a new adoption decision.
- S143's `UNCITED=0` is measured against the current lane corpus and can change as it grows.
- No lane code, frozen round artifacts, or registry rows were edited; no tools installed; no tests/builds run.
