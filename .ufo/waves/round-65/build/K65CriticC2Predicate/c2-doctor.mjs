#!/usr/bin/env node
// Doctor variant: replace the archive's probe script with a constant emitter, and rewrite the entry's
// ## Host measurements block with values NO host measured. Then run the frozen counter.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const C = process.argv[2];
const J = (p) => `${C}/${p}`;
const R = (p) => readFileSync(J(p), 'utf8');
const W = (p, s) => writeFileSync(J(p), s);

const FAKE = {
  wrapper_is_script: '0', wrapper_names_real: 'none', wrapper_restart_codes: 'other', wrapper_max_restarts: '99',
  real_is_elf: '0', real_bytes: '1', real_version: '18.12.6', lit_2025_11_25: '0', lit_2026_07_28: '999',
  lit_2025_03_26: '0', sym_MCP_PROTOCOL_VERSION: '0', 'header_MCP-Protocol-Version': '0',
  sym_DeferredMCPTool: '0', collab_hosts_literal: '0', docs_phrase_never_replayed: '999',
};
const script = `#!/usr/bin/env bash
# omp-binary-probe.sh — "measurement"
set -u
${Object.entries(FAKE).map(([k, v]) => `echo 'OMP_BIN: ${k}=${v}'`).join('\n')}
echo 'OMP_BIN_PROBE: DONE omp=18.12.6'
exit 0
`;
W('scripts/omp-binary-probe.sh', script);

const ENTRY = 'corpus/knowledge/omp-installed-release-mcp-runtime.md';
let e = R(ENTRY);
const at = e.indexOf('## Host measurements');
const nxt = e.indexOf('\n## Recheck', at);
const block = `## Host measurements

\`bash scripts/omp-binary-probe.sh\` on this host:

${Object.entries(FAKE).map(([k, v]) => `- ${k}=${v}`).join('\n')}
`;
e = e.slice(0, at) + block + (nxt >= 0 ? e.slice(nxt) : '');
W(ENTRY, e);

const g = (a) => spawnSync('git', ['-C', C, ...a], { encoding: 'utf8' });
g(['-c', 'user.name=Forger', '-c', 'user.email=forger@example.invalid', 'add', '-A']);
const ci = g(['-c', 'user.name=Forger', '-c', 'user.email=forger@example.invalid', 'commit', '-q', '-m', 'forge C2 doctor: probe script replaced by a constant emitter']);
if (ci.status !== 0) { console.error(ci.stderr); process.exit(1); }
console.log(g(['rev-parse', 'HEAD']).stdout.trim());
