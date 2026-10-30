#!/usr/bin/env node
// Static semantic-delta demo of over-removal. Builds two fixture trees from the pinned
// round-69 archive rev and applies the c2 forgecapture transformations: `minimal` does
// the full faithful transform (including the second python block that rewrites the
// origin bullets), `over` simulates a remover that also dropped that block (the lines
// after the removed /tmp write, via a hypothetical /forge-sed/,/PY/ range delete that
// was later hand-patched back to a runnable script). Never executes the original.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = '/fast/scratch/hyaku/kumitate-r70/K70AttackTmpLiteral';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REV = '14057f3e3899180c95713bace088fb9c0d0046e3';
const R = `${ROOT}/receipts/semdelta`;
fs.rmSync(R, { recursive: true, force: true });
fs.mkdirSync(R, { recursive: true });

function extract(dir) {
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('bash', ['-c', 'set -o pipefail; git -C "$1" archive "$2" | tar -x --no-same-owner --no-same-permissions -C "$3"', 'x', LANE, REV, dir]);
}
function originSection(src) {
  const lines = fs.readFileSync(src, 'utf8').split('\n');
  const a = lines.findIndex(l => l === "ORIGIN_SECTION='");
  const b = lines.findIndex((l, i) => i > a && l === "'");
  return lines.slice(a + 1, b).join('\n') + '\n';
}
const SECTION = originSection(`${LANE}/.ufo/waves/round-69/probe/c2-controls.sh`);
const CAP = '.ufo/waves/round-68/build/K68ScribeEntry/captures/S210-sep2596.md';
const PINS = '.ufo/pins/source-captures.json';
const REG = 'corpus/knowledge/mcp-deprecation-registry.md';
const TAMPER = '\nTODO-tampered-line-for-the-forgecapture-control\n';

function transform(root, { skipBulletRewrite }) {
  fs.appendFileSync(path.join(root, REG), SECTION);
  const capP = path.join(root, CAP);
  const b = fs.readFileSync(capP);
  const nb = Buffer.concat([b, Buffer.from(TAMPER)]);
  fs.writeFileSync(capP, nb);
  const pinsP = path.join(root, PINS);
  const data = JSON.parse(fs.readFileSync(pinsP, 'utf8'));
  for (const c of data.captures) if (c.sourceId === 'S210') { c.sha256 = crypto.createHash('sha256').update(nb).digest('hex'); c.bytes = nb.length; }
  fs.writeFileSync(pinsP, JSON.stringify(data, null, 2) + '\n');
  if (!skipBulletRewrite) {
    const p = path.join(root, REG);
    let t = fs.readFileSync(p, 'utf8');
    for (const id of ['S207', 'S208', 'S209', 'S210', 'S211', 'S212', 'S213']) {
      t = t.replace(new RegExp(`- ${id} — capture 2026-10-27 — (?:mirror S21[456]|pinned)`), `- ${id} — capture 2026-10-30 — pinned`);
    }
    fs.writeFileSync(p, t);
  }
}

extract(`${R}/minimal`);
extract(`${R}/over`);
transform(`${R}/minimal`, { skipBulletRewrite: false });
transform(`${R}/over`, { skipBulletRewrite: true });
console.log('minimal tree transformed faithfully (incl. origin-bullet rewrite block)');
console.log('over tree transformed WITHOUT the origin-bullet rewrite block (dropped-block model)');
