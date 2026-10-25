// shared context + helpers for the round-63 wave specs (kumitate). Prompt bytes are data; nothing here runs a seat.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

export const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
export const FLEET = '/home/vgpnk/Projects/shokunin';
export const BASE = 'dfa6fca8f362e9c962f5b940025a2619380b759b';
export const FREEZE = 'b38a2065ab8ac5b198f6569b9013d04411c3d40d';
export const DIRECTIVE = readFileSync(`${homedir()}/.agents/skills/godspeed/directive.md`, 'utf8').trimEnd();

export function context(wave, title) {
  return `ROUND CONTEXT (kumitate round 63, wave ${wave} — ${title})

- Lane repo (write scope): ${LANE}. Your tools start at the fleet root (${FLEET}), NOT the lane: use ABSOLUTE paths for every read/edit/write/bash cwd.
- Every \`Report:\` trailer path is relative to ${LANE} — write it at ${LANE}/<that path>. Your report file is ${LANE}/.ufo/waves/round-63/${wave}/<YourSeatName>.md (your seat name as the file stem; the seat name is in the "# Seat <name>" line below).
- Seat names carry the prefix K63 on purpose (the orchestrator's dispatcher keys seats by name across all lanes).
- Scratch only under /tmp/kumitate-r63/<YourSeatName>/. Produce any build artifact the task names under ${LANE}/.ufo/waves/round-63/build/<YourSeatName>/ (create it).
- The round is FROZEN: ${LANE}/.ufo/waves/round-63/plan.md (read it first), the counters ${LANE}/.ufo/waves/round-63/probe/*.mjs, the controls under ${LANE}/.ufo/waves/round-63/controls/ and the base receipts under .../base/ were committed at ${FREEZE} (base ${BASE}). NEVER edit them. You may read, copy to scratch and attack them. A finding that a frozen counter or control is wrong is reported, never patched by you.
- You are NOT an integration owner: do not edit ${LANE}/scripts/, SCORECARD.md, LOG.md, PROVINCE.md, SKILL.md, corpus/, .ufo/pins/ or anything outside your own report/build paths. Propose changes as patch text or full-file drafts inside your build directory; the L1 integrates.
- Never mutate: the fleet repo (${FLEET} outside this lane), sibling lane repos, this lane's git index or jj state (no \`jj\` mutating commands; no \`git add/commit/reset/checkout/switch/pull/push/stash\` in the lane or the fleet), \`.ufo/state/*\`, ${FLEET}/.scratch/, fleet templates/ and scripts/, MANIFEST.json, /home/vgpnk/Projects/shokuknow (read-only: read package bytes, run NO campaign tool there), ~/.omp/agent/config.yml and mcp.json.
- Git fixtures: create a fixture repo only as D=$(mktemp -d) && git -C "$D" init -q, name -C "$D" in every later git call, check git -C "$D" rev-parse --show-toplevel equals "$D" before the first commit, and commit only inside it. Never commit with a throwaway identity anywhere else.
- Tooling authorization (operator 2026-10-19): you may install or upgrade tools that help the task; first read /home/vgpnk/.omp/agent/RULES.md (official channels, update-safety gate; record tool, version, channel, reason in your report). pacman transactions are PAUSED host-wide (orchestrator ruling 2026-10-20): install via uv tool / npx / an official binary in ~/.local/bin, or report the need; never run pacman -Sy, -Syu, -U or -R, never restart a host service.
- REA MCP is disabled: do REA work only through the CLI (npx -y rea-agents@6.5.0 <command>), never through xd://mcp__rea_* devices.
- Leaf seat: do not spawn subagents or background jobs (the sole exception, an executor seat's one read-only labrat probe, is not needed here).
- Honesty: never invent numbers or quotes; an unrun check has not passed; if a command cannot run, say so and paste the error. Quote full verdict lines with their exit codes. Cite evidence as path:line, command output or full commit hash.
- Report shape (keep it dense, at most ~120 lines): first line \`VERDICT: <one sentence>\`; then \`## Evidence\` (commands + verbatim output), \`## Findings\` (numbered \`<SeatName>-1\`, \`-2\`… each with severity, what it attacks, and a reproducing command), \`## Artifacts\` (paths you wrote), \`## Limits\` (what you did not check). Then finish by yielding a 3-line summary.`;
}

export function mk(items) {
  return (name, role, body, axes, milestone) => items.push({ name, role, prompt: `${DIRECTIVE}\n\n${body}`, axes, milestone });
}

export const ROUTE = {
  gate: `${LANE}/scripts/inline-dispatch-evidence.mjs`,
  c1probe: `${LANE}/.ufo/waves/round-63/probe/inline63-probe.mjs`,
  c2probe: `${LANE}/.ufo/waves/round-63/probe/topology63-probe.mjs`,
  caps: `${LANE}/.ufo/waves/round-63/build/K63Capture`,
  staged: '/home/vgpnk/Projects/shokuknow/merge/kumitate',
};
