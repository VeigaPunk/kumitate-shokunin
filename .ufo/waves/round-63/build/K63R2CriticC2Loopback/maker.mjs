#!/usr/bin/env node
// maker.mjs — K63R2CriticC2Loopback fixture builder.
// Rebuilds the C2 fixture from the integrated archive at a9531c8e617338fd16cb69c61344ef8f17711117:
//   - re-points rows S196/S197 at a lane-served page (loopback by default, or any URL given)
//   - commits lane-authored captures for those rows (sha pins recomputed)
//   - leaves everything else (entry, PROVINCE, readme-map, census) at archive state
// Usage: node maker.mjs <fixture-dir> <url-s196> <url-s197> [--captures-dir <dir-with-S196.html,S197.html>]
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REV = 'a9531c8e617338fd16cb69c61344ef8f17711117';

const args = process.argv.slice(2);
const D = resolve(args.shift());
const URL_S196 = args.shift();
const URL_S197 = args.shift();
const CAPS = args.includes('--captures-dir') ? resolve(args[args.indexOf('--captures-dir') + 1]) : null;

const git = (a, env) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8', env: { ...process.env, ...env } });

// ---- fixture discipline
const top = git(['rev-parse', '--show-toplevel']);
if (top.status !== 0 || top.stdout.trim() !== D) { console.error('bad toplevel'); process.exit(2); }

// ---- extract archive into D
const ar = spawnSync('git', ['-C', LANE, 'archive', REV], { maxBuffer: 256 * 1024 * 1024 });
if (ar.status !== 0) { console.error('archive failed'); process.exit(2); }
const tar = spawnSync('tar', ['-x', '-C', D], { input: ar.stdout });
if (tar.status !== 0) { console.error('tar failed'); process.exit(2); }

// ---- rewrite SOURCES.md rows S196/S197 (source cell URL only)
const srcPath = join(D, 'corpus', 'SOURCES.md');
let src = readFileSync(srcPath, 'utf8');
const lines = src.split('\n');
const patchUrl = (row, url) => {
  const i = lines.findIndex((l) => new RegExp(`^\\| ${row} \\|`).test(l));
  if (i < 0) { console.error(`row ${row} not found`); process.exit(2); }
  if (!/https?:\/\/[^\s|)]+/.test(lines[i])) { console.error(`row ${row} url not found`); process.exit(2); }
  lines[i] = lines[i].replace(/https?:\/\/[^\s|)]+/, url);
};
patchUrl('S196', URL_S196);
patchUrl('S197', URL_S197);
src = lines.join('\n');
writeFileSync(srcPath, src);

// ---- lane-authored captures (default: fabricated pages)
const QUOTES = {
  S196: [
    '多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体。',
    '协作拓扑类型，当前仅支持 coordinator。',
    '编队条目列表，1-20 个。传空数组表示清空编队。',
    '条目类型：agent（引用另一个 Agent）或 self（coordinator 自身，编队中最多一个）。',
    '被引用的智能体版本号，type=agent 时可选（>=1，不传取最新）',
  ],
  S197: [
    'We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures',
    'Finance Agent demonstrates the strongest multi-agent benefits, with all MAS architectures substantially outperforming SAS (from +57% to +80.8%)',
    'PlanCraft exhibits consistent degradation across all MAS variants (from -70% to -39%)',
    'Terminal-Bench shows mixed results: Independent achieves marginal gains (+2%) while Centralized degrades (-19%)',
    'This suggests that sequential interdependence, rather than complexity alone, determines coordination viability.',
    'tool-rich environments amplify the coordination tax, making simpler architectures more effective',
    'tasks where single-agent performance already exceeds 45% accuracy experience negative returns from additional agents',
    'Centralized introduces hierarchical verification and bottleneck control.',
    'All MAS and SAS configurations were matched for total reasoning-token budget (mean 4,800 tokens per trial) and tool-call access to isolate coordination effects.',
    'Our framework systematically compares canonical coordination structures with preliminary exploration of scaling number of agents up to nine.',
  ],
};
const capsDir = join(D, '.ufo', 'pins', 'captures');
mkdirSync(capsDir, { recursive: true });
for (const [id, qs] of Object.entries(QUOTES)) {
  const html = `<!doctype html><html><head><title>${id}</title><style>body{display:block}</style></head><body>
<!-- fabricated page; served by the lane itself, never fetched from the real source -->
<h1>${id} (lane-served copy)</h1>\n` + qs.map((q) => `  <p class="q">${q}</p>`).join('\n') + `\n</body></html>\n`;
  const p = join(CAPS ? CAPS : capsDir, `${id}.html`);
  writeFileSync(p, html);
}

// ---- update pins
const pinsPath = join(D, '.ufo', 'pins', 'source-captures.json');
const pins = JSON.parse(readFileSync(pinsPath, 'utf8'));
for (const c of pins.captures) {
  if (c.sourceId === 'S196' || c.sourceId === 'S197') {
    const p = join(D, c.path);
    const b = readFileSync(p);
    c.sha256 = createHash('sha256').update(b).digest('hex');
    c.bytes = b.length;
  }
}
writeFileSync(pinsPath, JSON.stringify(pins, null, 1) + '\n');

// ---- commit (fixture identity, inside D only)
const env = { GIT_AUTHOR_NAME: 'fixture', GIT_AUTHOR_EMAIL: 'fixture@local', GIT_COMMITTER_NAME: 'fixture', GIT_COMMITTER_EMAIL: 'fixture@local' };
git(['add', '-A'], env);
git(['commit', '-m', 'fixture: lane-served S196/S197'], env);
const head = git(['rev-parse', 'HEAD']);
console.log(`FIXTURE_HEAD ${head.stdout.trim()}`);
console.log(`EXISTS_ENTRY ${existsSync(join(D, 'corpus', 'knowledge', 'multi-agent-coordinator-topologies.md'))}`);
