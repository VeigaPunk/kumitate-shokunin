// merge-cases.mjs — L1 integration: union of the committed 26 cases (frozen first 16 = controls) and the wave-1 seat case sets,
// by id; later ids never replace earlier ones. usage: node merge-cases.mjs <out.json> <in.json>...
import { readFileSync, writeFileSync } from 'node:fs';
const [out, ...ins] = process.argv.slice(2);
const seen = new Map();
for (const f of ins) {
  const d = JSON.parse(readFileSync(f, 'utf8'));
  const cs = Array.isArray(d) ? d : d.cases;
  for (const c of cs) if (!seen.has(c.id)) seen.set(c.id, c);
}
writeFileSync(out, `${JSON.stringify({ contract: 'kumitate-harm-matrix-v2', cases: [...seen.values()] }, null, 1)}\n`);
console.log(`merged ${seen.size} cases`);
