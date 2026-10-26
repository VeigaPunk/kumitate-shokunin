// shared context + helpers for the round-65 wave specs (kumitate). Prompt bytes are data; nothing here runs a seat.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

export const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
export const FLEET = '/home/vgpnk/Projects/shokunin';
export const BASE = '47fe2383151909d31557ada118ad84f90404dc6c';
export const FREEZE = process.env.K65_FREEZE || 'UNSET';
export const DIRECTIVE = readFileSync(`${homedir()}/.agents/skills/godspeed/directive.md`, 'utf8').trimEnd();
export const R = `${LANE}/.ufo/waves/round-65`;
export const STAGED = '/home/vgpnk/Projects/shokuknow/merge/kumitate';

export function context(wave, title, extra = '') {
  return `ROUND CONTEXT (kumitate round 65, wave ${wave} — ${title})

- Lane repo (write scope): ${LANE}. Your tools start at the fleet root (${FLEET}), NOT the lane: use ABSOLUTE paths for every read/edit/write/bash cwd.
- Every \`Report:\` trailer path is relative to ${LANE} — write it at ${LANE}/<that path>. Your report file is ${LANE}/.ufo/waves/round-65/${wave}/<YourSeatName>.md (your seat name as the file stem; the seat name is in the "# Seat <name>" line below).
- Seat names carry the prefix K65 on purpose (the orchestrator's dispatcher keys seats by name across all lanes).
- Scratch only under /tmp/kumitate-r65/<YourSeatName>/ (create it; /tmp has ~27 GB free — keep scratch small and delete big files you create). Produce any build artifact the task names under ${LANE}/.ufo/waves/round-65/build/<YourSeatName>/ (create it).
- The round is FROZEN: ${R}/plan.md (read it first), the counters ${R}/probe/*, the controls under ${R}/controls/ and the base receipts under ${R}/base/ were committed at ${FREEZE} (base ${BASE}). NEVER edit them. You may read, copy to scratch and attack them. A finding that a frozen counter or control is wrong is reported, never patched by you.
- The claims' SUBJECTS are NOT frozen: ${LANE}/scripts/harm-matrix.mjs, scripts/harm-matrix-gates.json, scripts/harm-cases.json (claim C1) and ${LANE}/scripts/omp-binary-probe.sh (claim C2) were first committed at ${FREEZE}; attack them freely and propose fixes as patch text / full-file drafts in your build directory (the L1 integrates; fixes only strengthen, never relax a check). The corpus entry, the new SOURCES rows and the captures of C2 do not exist yet — scribes/executors/scouts draft them in their build directories.
- You are NOT an integration owner: do not edit ${LANE}/scripts/, SCORECARD.md, LOG.md, PROVINCE.md, SKILL.md, corpus/, .ufo/pins/ or anything outside your own report/build paths. Propose changes as patch text or full-file drafts inside your build directory; the L1 integrates.
- Never mutate: the fleet repo (${FLEET} outside this lane), sibling lane repos, this lane's git index or jj state (no \`jj\` mutating commands; no \`git add/commit/reset/checkout/switch/pull/push/stash\` in the lane or the fleet), \`.ufo/state/*\`, ${FLEET}/.scratch/, fleet templates/ and scripts/, MANIFEST.json, /home/vgpnk/Projects/shokuknow (read-only: read package bytes, run NO campaign tool there), ~/.omp/agent/config.yml and mcp.json, and the installed OMP binaries (~/.local/bin/omp, omp.real: read bytes only; the only program you may run from them is \`OMP_NO_RESTART=1 ~/.local/bin/omp.real --version\`).
- Git fixtures: create a fixture repo only as D=$(mktemp -d) && git -C "$D" init -q, name -C "$D" in every later git call, check git -C "$D" rev-parse --show-toplevel equals "$D" before the first commit, and commit only inside it (pass identity as -c user.name=… -c user.email=… on that call). Never commit with a throwaway identity anywhere else. A sandbox clone of the lane for testing (git clone --no-hardlinks, the lane objects are on another filesystem) is a fixture too: all git writes name -C <clone>.
- Tooling authorization (operator 2026-10-19): you may install or upgrade tools that help the task; first read /home/vgpnk/.omp/agent/RULES.md (official channels, update-safety gate; record tool, version, channel, reason in your report). pacman transactions are PAUSED host-wide (orchestrator ruling 2026-10-20): install via uv tool / npx / an official binary in ~/.local/bin, or report the need; never run pacman -Sy, -Syu, -U or -R, never restart a host service.
- REA MCP is disabled: do REA work only through the CLI (npx -y rea-agents@6.5.0 <command>), never through xd://mcp__rea_* devices.
- Leaf seat: do not spawn subagents or background jobs (the sole exception, an executor seat's one read-only labrat probe, is not needed here).
- Honesty: never invent numbers or quotes; an unrun check has not passed; if a command cannot run, say so and paste the error. Quote full verdict lines with their exit codes. Cite evidence as path:line, command output or full commit hash. The host is heavily loaded (load average ~50): give long commands a generous timeout and run them once.
- Report shape (keep it dense, at most ~120 lines): first line \`VERDICT: <one sentence>\`; then \`## Evidence\` (commands + verbatim output), \`## Findings\` (numbered \`<SeatName>-1\`, \`-2\`… each with severity, what it attacks, and a reproducing command), \`## Artifacts\` (paths you wrote), \`## Limits\` (what you did not check). Then finish by yielding a 3-line summary.${extra ? `\n${extra}` : ''}`;
}

export function mk(items) {
  return (name, role, body, axes, milestone) => items.push({ name, role, prompt: `${DIRECTIVE}\n\n${body}`, axes, milestone });
}

export const P = {
  tool: `${LANE}/scripts/harm-matrix.mjs`,
  gates: `${LANE}/scripts/harm-matrix-gates.json`,
  cases: `${LANE}/scripts/harm-cases.json`,
  probeSh: `${LANE}/scripts/omp-binary-probe.sh`,
  c1probe: `${R}/probe/harm65-probe.mjs`,
  c2probe: `${R}/probe/omp65-probe.mjs`,
  controls: `${R}/controls/harm`,
  plan: `${R}/plan.md`,
  entry: 'corpus/knowledge/omp-installed-release-mcp-runtime.md',
};

export const NORM = `normalise both sides before matching a quote: strip HTML tags and <script>/<style>, decode &amp; &lt; &gt; &quot; &#39; &nbsp;, map curly quotes to ASCII quotes and en/em dashes to "-", delete "**", "__" and backticks, collapse all whitespace to one space (the frozen counter's norm() in ${R}/probe/omp65-probe.mjs is the reference; read it)`;
