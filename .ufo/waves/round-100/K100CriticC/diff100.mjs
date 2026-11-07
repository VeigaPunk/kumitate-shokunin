#!/usr/bin/env node
// diff100.mjs — K100CriticC independent differential H100 driver (kumitate r100).
//
// Reads the case index written by gen100.py, runs the live census on each fixture
// (the oracle), then per fixture runs each tool variant:
//   cite-sources: one invocation per test row (README citing that row's ASCII probe)
//   source-capture: one invocation over the whole fixture (registry binds every probe)
// and compares the recognised sets against the census E06 valid-id set.
//
// usage: node diff100.mjs --cases <index.json> --work <scratch> --out <results.json>
//        --variant <name>=<cite-sources.mjs>,<source-capture.mjs> [--variant ...]
//        [--pool 10] [--only in|report|all]
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const TODAY = '2026-11-07';

const argv = process.argv.slice(2);
const opt = { variants: [], pool: 10, only: 'all' };
for (let i = 0; i < argv.length; i += 1) {
  const k = argv[i];
  if (k === '--cases') opt.cases = argv[++i];
  else if (k === '--work') opt.work = argv[++i];
  else if (k === '--out') opt.out = argv[++i];
  else if (k === '--pool') opt.pool = Number(argv[++i]);
  else if (k === '--only') opt.only = argv[++i];
  else if (k === '--variant') {
    const v = argv[++i] || '';
    const eq = v.indexOf('=');
    const parts = v.slice(eq + 1).split(',');
    if (eq < 1 || parts.length !== 2) { process.stderr.write(`bad --variant ${v}\n`); process.exit(64); }
    opt.variants.push({ name: v.slice(0, eq), cite: parts[0], capture: parts[1] });
  } else { process.stderr.write(`unknown argument ${k}\n`); process.exit(64); }
}
if (!opt.cases || !opt.work || !opt.out || opt.variants.length === 0) {
  process.stderr.write('usage: diff100.mjs --cases <index.json> --work <dir> --out <json> --variant name=cite,capture [...]\n');
  process.exit(64);
}
mkdirSync(opt.work, { recursive: true });
mkdirSync(join(opt.work, 'no-root'), { recursive: true });
const env = { ...process.env, TMPDIR: opt.work, SHOKUNIN_ROOT: join(opt.work, 'no-root') };

function run(cmd, args, opts = {}) {
  return new Promise((res) => {
    const c = spawn(cmd, args, { ...opts });
    let out = '';
    let err = '';
    c.stdout.on('data', (b) => { out += b; });
    c.stderr.on('data', (b) => { err += b; });
    c.on('close', (code) => res({ code, out, err }));
    c.on('error', (e) => res({ code: -1, out, err: String(e) }));
  });
}

async function pool(items, n, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }));
  return results;
}

function censusOf(cs) {
  const src = join(cs.dir, 'SOURCES.md');
  return run('bash', [CENSUS, 'validate', '--file', src, '--today', TODAY], { env: process.env })
    .then((r) => {
      const e06 = [];
      const codes = {};
      const lines = r.out.split('\n');
      for (const line of lines) {
        const m = line.match(/^file\tE06\t([\s\S]*) tier=(Z\S+)$/);
        if (m) { e06.push({ id: m[1], tier: m[2] }); continue; }
        const c = line.split('\t')[1];
        if (c && /^[EW][0-9]+$/.test(c)) codes[c] = (codes[c] || 0) + 1;
      }
      const valid = new Set(e06.map((e) => e.id).filter((id) => /^S[0-9]{3,}$/.test(id)));
      const readTiers = new Set(e06.map((e) => e.tier));
      return { exit: r.code, valid: [...valid].sort(), readTiers: [...readTiers].sort(), e06,
        codes, nul: r.out.includes('\u0000'), stderrNulWarn: /ignored null byte/.test(r.err),
        stdoutNulWarn: /ignored null byte/.test(r.out) };
    });
}

function citeOf(tool, cs, row) {
  const readme = join(cs.dir, `README-${row.key}.md`);
  const src = join(cs.dir, 'SOURCES.md');
  return run(process.execPath, [tool, '--readme', readme, '--sources', src], { cwd: cs.dir, env })
    .then((r) => {
      const out = r.out.trim();
      let got;
      if (r.code === 0 && out === 'CITE_SOURCES: CLEAN cited=1') got = true;
      else if (r.code === 1 && out === `CITE_SOURCES: DRIFT ghosts=1 first=${row.probe}`) got = false;
      else got = `other exit=${r.code} ${JSON.stringify(out.slice(0, 160))}`;
      return { code: r.code, out, got };
    });
}

function captureOf(tool, cs) {
  const bound = new Set(cs.rows.map((x) => x.probe));
  const reg = join(cs.dir, 'reg.json');
  const src = join(cs.dir, 'SOURCES.md');
  return run(process.execPath, [tool, '--registry', reg, '--sources', src], { cwd: cs.dir, env })
    .then((r) => {
      const items = [];
      const first = r.out.match(/^SOURCE_CAPTURE: DRIFT .* first=(\S+)$/m);
      if (first) items.push(first[1]);
      for (const line of r.out.split('\n')) {
        const m = line.match(/^SOURCE_CAPTURE: note (\S+)$/);
        if (m) items.push(m[1]);
      }
      let status = 'ok';
      let recognised = null;
      if (r.code === 0 && /^SOURCE_CAPTURE: CLEAN /m.test(r.out)) {
        recognised = new Set(bound);
      } else if (r.code === 1) {
        const orphan = new Set();
        const extra = new Set();
        for (const it of items) {
          const k = it.lastIndexOf(':');
          const id = it.slice(0, k);
          const why = it.slice(k + 1);
          if (why === 'orphan-capture' || why === 'orphan-exemption') orphan.add(id);
          else if (why === 'uncaptured') extra.add(id);
          else status = 'unexpected-item';
        }
        recognised = new Set([...bound].filter((x) => !orphan.has(x)).concat([...extra]));
      } else {
        status = `fail-closed-exit=${r.code}`;
      }
      return { code: r.code, out: r.out.trim(), items, status,
        recognised: recognised ? [...recognised].sort() : null };
    });
}

const index = JSON.parse(readFileSync(opt.cases, 'utf8'));
const cases = index.cases.filter((c) => opt.only === 'all' || c.scope === opt.only);

const t0 = Date.now();
const results = await pool(cases, opt.pool, async (cs) => {
  const census = await censusOf(cs);
  const out = { idx: cs.idx, family: cs.family, scope: cs.scope, reason: cs.reason, attrs: cs.attrs,
    model: { valid: cs.model_valid_any, read: cs.rows.filter((r) => r.model_read).map((r) => r.probe) },
    census, variants: {} };
  // attribution
  const byTier = new Map(census.e06.map((e) => [e.tier, e.id]));
  out.attribution = [];
  for (const row of cs.rows) {
    if (byTier.has(row.tier)) out.attribution.push({ key: row.key, probe: row.probe, e06id: byTier.get(row.tier), role: row.role });
  }
  const validSet = new Set(census.valid);
  for (const v of opt.variants) {
    const cite = [];
    for (const row of cs.rows.filter((r) => r.role === 'test')) {
      const r = await citeOf(v.cite, cs, row);
      const expected = validSet.has(row.probe);
      cite.push({ key: row.key, probe: row.probe, expected, got: r.got, ok: r.got === expected,
        raw: r.out.slice(0, 200) });
    }
    const cap = await captureOf(v.capture, cs);
    const expectedSet = [...validSet].sort();
    cap.expected = expectedSet;
    cap.ok = cap.recognised !== null && JSON.stringify(cap.recognised) === JSON.stringify(expectedSet);
    out.variants[v.name] = { cite, capture: cap };
  }
  return out;
});
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

// ---------------------------------------------------------------- summary
const summary = { seed: index.seed, fixtures: results.length, rows: 0, testRows: 0,
  modelMismatch: [], variants: {}, elapsedS: Number(elapsed) };
for (const r of results) {
  summary.rows += r.model.read.length;
  summary.testRows += r.variants[opt.variants[0].name].cite.length;
  if (r.scope === 'in') {
    const mv = JSON.stringify(r.model.valid.slice().sort());
    const cv = JSON.stringify(r.census.valid.slice().sort());
    const mr = JSON.stringify(r.model.read.slice().sort());
    const cr = JSON.stringify(r.attribution.map((a) => a.probe).sort());
    if (mv !== cv) summary.modelMismatch.push({ idx: r.idx, family: r.family, kind: 'valid', model: r.model.valid, census: r.census.valid });
    else if (mr !== cr) summary.modelMismatch.push({ idx: r.idx, family: r.family, kind: 'read', model: r.model.read, census: r.attribution.map((a) => a.probe) });
  }
}
for (const v of opt.variants) {
  const agg = { citeRows: 0, citeAgree: 0, citeDisagree: [], capFixtures: 0, capAgree: 0, capDisagree: [],
    reportCite: { rows: 0, agree: 0 }, reportCap: { fixtures: 0, agree: 0 } };
  for (const r of results) {
    const vv = r.variants[v.name];
    if (r.scope === 'in') {
      for (const c of vv.cite) {
        agg.citeRows += 1;
        if (c.ok) agg.citeAgree += 1;
        else agg.citeDisagree.push({ idx: r.idx, family: r.family, probe: c.probe, expected: c.expected, got: c.got, raw: c.raw });
      }
      agg.capFixtures += 1;
      if (vv.capture.ok) agg.capAgree += 1;
      else agg.capDisagree.push({ idx: r.idx, family: r.family, status: vv.capture.status,
        expected: vv.capture.expected, recognised: vv.capture.recognised, items: vv.capture.items });
    } else {
      agg.reportCite.rows += vv.cite.length;
      agg.reportCite.agree += vv.cite.filter((c) => c.ok).length;
      agg.reportCap.fixtures += 1;
      agg.reportCap.agree += vv.capture.ok ? 1 : 0;
    }
  }
  agg.citeDisagreeTotal = agg.citeDisagree.length;
  agg.capDisagreeTotal = agg.capDisagree.length;
  summary.variants[v.name] = agg;
}
writeFileSync(opt.out, JSON.stringify({ summary, results }, null, 1));
mkdirSync(dirname(opt.out), { recursive: true });

console.log(`seed=${summary.seed} fixtures=${summary.fixtures} in_scope=${results.filter((r) => r.scope === 'in').length} report=${results.filter((r) => r.scope !== 'in').length} testRows=${summary.testRows} elapsed=${elapsed}s`);
console.log(`model_vs_census_mismatches=${summary.modelMismatch.length}`);
for (const m of summary.modelMismatch.slice(0, 20)) console.log(`  model-mismatch ${m.family} idx=${m.idx} model=${JSON.stringify(m.model)} census=${JSON.stringify(m.census)}`);
for (const v of opt.variants) {
  const a = summary.variants[v.name];
  console.log(`variant=${v.name} cite_rows=${a.citeRows} agree=${a.citeAgree} disagree=${a.citeDisagreeTotal} | capture_fixtures=${a.capFixtures} agree=${a.capAgree} disagree=${a.capDisagreeTotal} | report cite ${a.reportCite.agree}/${a.reportCite.rows} capture ${a.reportCap.agree}/${a.reportCap.fixtures}`);
  for (const d of a.citeDisagree.slice(0, 10)) console.log(`  CITE-DISAGREE ${d.family} probe=${d.probe} expected=${d.expected} got=${d.got}`);
  for (const d of a.capDisagree.slice(0, 10)) console.log(`  CAP-DISAGREE ${d.family} status=${d.status} expected=${JSON.stringify(d.expected)} recognised=${JSON.stringify(d.recognised)}`);
}
