RESULT SupersedeS061 rev=cac43009 verdict=CHANGED row=S090
| S090 | Fleet lane addendum, scripts/hyaku/lane-addendum.md (shokunin fleet repo) — /home/vgpnk/Projects/shokunin/scripts/hyaku/lane-addendum.md | own-work | B | who wrote mcp.json.pre-disable-<stamp> on this host | lines 82-84 at fleet commit 4248e9244108ba81141d347b699596dff34847bf; reopened 2026-10-23; body sha256 9f0be557dee50f7d00eab4124067d5ce03ea7495d085bc275684132f0a7dce1e | supersedes S061 — The operator authorized disabling the OMP rea MCP entry; the orchestrator set enabled=false and made the pre-edit copy at 10:12 -03. | mined | 2026-10-23 | 30d | corpus/knowledge/omp-agent-root.md, corpus/lessons/round-44.md |

Gate record: URL `file:///home/vgpnk/Projects/shokunin/scripts/hyaku/lane-addendum.md` (local source, pinned fleet commit 4248e9244108ba81141d347b699596dff34847bf); accessed 2026-10-23; quote (lines 82-83; 22 words): “the operator authorized disabling the OMP `rea` MCP entry for this phase; the orchestrator set `\"enabled\": false` in `~/.omp/agent/mcp.json` at 10:12 -03”; body sha256 `9f0be557dee50f7d00eab4124067d5ce03ea7495d085bc275684132f0a7dce1e`.

Finding: CHANGED. The reopened bytes and R44-6 support the corrected actor attribution: the operator authorized the disable and the orchestrator set the flag / is attributed with the pre-edit action. The round-46 teaching's additional categorical “not an OMP or REA chain” is not stated or distinguished by the opened source; S090 records the attributable action without carrying that unsupported exclusion. No contrary bytes were found.

Evidence:
- Read first: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/plan.md`. R46-1 source: `corpus/lessons/round-46-verifier-spotcheck.md:168-177`; canonical rule: `/home/vgpnk/Projects/shokunin/CORPUS.md:116-118` (append-only; correction teaches opens `supersedes S0NN —`).
- Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 2b2bf7bb:corpus/SOURCES.md | grep '^| S061 |'`
  Output: S061 has teaching “an operator pre-edit copy, not an OMP or REA chain”.
- Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show cac43009b22232c1ae8efdab4f2789516c1fcc6f:corpus/SOURCES.md | grep '^| S061 |'`
  Output: teaching changed to “an orchestrator pre-edit copy, operator-authorized, not an OMP or REA chain” (with the R44-6/SweepS061S065 note); status `mined`, opened `2026-10-23`, recheck `30d`, and used-by paths match S090.
- Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -p --follow 980a16af^..adedf671 -- corpus/SOURCES.md`
  Output included commits `980a16af` and `adedf671`; the S061 in-place teaching rewrite appears in the round-46 diff and is carried forward.
- Re-open command: `git -C /home/vgpnk/Projects/shokunin show 4248e9244108ba81141d347b699596dff34847bf:scripts/hyaku/lane-addendum.md | nl -ba`
  Output at `82-84`: operator authorized disabling OMP `rea`; orchestrator set `enabled=false` at `10:12 -03` with the pre-edit-copy path; a later unidentified writer rewrote the file. R44-6 at `corpus/lessons/round-44.md:199-203` independently records the attribution correction as an orchestrator-created pre-edit copy.
- Hash command: `git -C /home/vgpnk/Projects/shokunin show 4248e9244108ba81141d347b699596dff34847bf:scripts/hyaku/lane-addendum.md | sha256sum`
  Output: `9f0be557dee50f7d00eab4124067d5ce03ea7495d085bc275684132f0a7dce1e  -`.
- Quote count command: `printf '%s' 'the operator authorized disabling the OMP `rea` MCP entry for this phase; the orchestrator set `"enabled": false` in `~/.omp/agent/mcp.json` at 10:12 -03' | wc -w`
  Output: `22`. S090 teaching length after the required prefix: `printf '%s' 'The operator authorized disabling the OMP rea MCP entry; the orchestrator set enabled=false and made the pre-edit copy at 10:12 -03.' | wc -m` → `132` characters.

Gates and verification: no tests, selftests, gate, counter, or demo run (not required for this source-row scribe item). No tools installed; no scratch clone or process started. No tool-install records.

Touched surfaces: this report only: `.ufo/waves/round-47/build/SupersedeS061.md`. No lane SOURCES edit was made; the L1 restores original S061 bytes and appends S090. No product code, judge, commits, fleet files, sibling lanes, or operator configuration touched.

Known limits: source is a local fleet record opened from its pinned Git blob, not a live HTTP page; the `file://` URL records that provenance. No gate/counter result is claimed.

Artifact: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-47/build/SupersedeS061.md`.
