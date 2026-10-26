#!/usr/bin/env node
// Build a *proposed* ratchet prototype from the frozen counter. It never replaces the frozen file;
// it is written to scratch and diffed. Adds: capture<->URL<->live-body binding, non-empty quotes,
// registry-host allowlist, frozen instrumentation for O6, URL-cell-only version pin, Frontier-section
// PROVINCE test, and freezer-run O7 oracles. Run: node mkratchet.mjs <frozen-probe> <out>
import { readFileSync, writeFileSync } from 'node:fs';

const [, , IN, OUT] = process.argv;
let s = readFileSync(IN, 'utf8');
const must = (a, b, label) => { if (!s.includes(a)) { console.error(`ANCHOR MISSING: ${label}`); process.exit(1); } s = s.replace(a, b); };

// imports
must("import { createHash } from 'node:crypto';", "import { createHash } from 'node:crypto';\nimport { writeFileSync as wfs, chmodSync } from 'node:fs';", 'crypto import');

// helpers + freeze rev
must("const LIVE = !argv.includes('--no-live');", [
  "const LIVE = !argv.includes('--no-live');",
  "const FREEZE = process.env.OMP65_FREEZE || '2ca91a0c81542cad5f731049aa55dd2f99ade98d'; // freeze commit: instrumentation is read from here, never from M",
].join('\n'), 'LIVE');

must("const rd = (rel) => { try { return readFileSync(join(T, rel)); } catch { return null; } };", [
  "const rd = (rel) => { try { return readFileSync(join(T, rel)); } catch { return null; } };",
  "const cells0 = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());",
  "const urlOf = (line) => { const m = line && /(https?:\\/\\/[^\\s|)]+)/.exec(cells0(line)[2] || ''); return m ? m[1] : null; };",
  "const hostOf = (u) => { try { return new URL(u).host; } catch { return null; } };",
  "const gitFile = (p) => { const g = spawnSync('git', ['-C', lane, 'show', `${FREEZE}:${p}`], { maxBuffer: 64 * 1024 * 1024 }); return g.status === 0 ? g.stdout : null; };",
].join('\n'), 'rd');

// host allowlist from the round-base registry (no new host without a registry amendment)
must("const baseRows = rowsOf(baseSrc.status === 0 ? baseSrc.stdout : null);", [
  "const baseRows = rowsOf(baseSrc.status === 0 ? baseSrc.stdout : null);",
  "const ALLOWED_HOSTS = new Set([...baseRows.values()].map((l) => hostOf(urlOf(l))).filter(Boolean));",
].join('\n'), 'baseRows');

// O3: capture must name the row URL and a 200
must("    if (createHash('sha256').update(b).digest('hex') !== c.sha256 || b.length !== c.bytes) bad.push(`${id}:hash-or-size`);",
  "    if (createHash('sha256').update(b).digest('hex') !== c.sha256 || b.length !== c.bytes) bad.push(`${id}:hash-or-size`);\n    if (c.url !== urlOf(rows.get(id))) bad.push(`${id}:capture-url-mismatch`);\n    if (Number(c.status) !== 200) bad.push(`${id}:capture-status=${c.status}`);", 'O3');

// O4: reject quotes that normalise to nothing (norm('<p>') === '')
must("    if (!t || !t.includes(norm(b.q))) bad.push(`${b.id}:quote-not-in-capture(${b.q.slice(0, 30)})`);",
  "    const qn = norm(b.q);\n    if (qn.length < 8 || !/[A-Za-z0-9]/.test(qn)) bad.push(`${b.id}:quote-empty-or-short`);\n    else if (!t || !t.includes(qn)) bad.push(`${b.id}:quote-not-in-capture(${b.q.slice(0, 30)})`);", 'O4');

// O5: live body must BE the capture, and the host must already be a registry host
must("    live.set(id, norm(r.stdout));", [
  "    const cap = caps.get(id);",
  "    if (!cap || createHash('sha256').update(r.stdout).digest('hex') !== cap.sha256) bad.push(`${id}:live-body-differs-from-capture`);",
  "    const host = hostOf(url[1]);",
  "    if (!host || !ALLOWED_HOSTS.has(host)) bad.push(`${id}:url-host-not-in-registry(${host})`);",
  "    live.set(id, norm(r.stdout));",
].join('\n'), 'O5');

// O6: run the freezer's probe bytes, not the archive's
must("    const r = spawnSync('bash', [probe], { encoding: 'utf8', timeout: 180000 });", [
  "    const frozen = gitFile('scripts/omp-binary-probe.sh');",
  "    const runnable = join(T, '.omp65-frozen-probe.sh');",
  "    if (!frozen) bad.push('frozen-probe-unreadable');",
  "    else { wfs(runnable, frozen); chmodSync(runnable, 0o755); }",
  "    const r = frozen ? spawnSync('bash', [runnable], { encoding: 'utf8', timeout: 180000 }) : { status: 1, stdout: '' };",
].join('\n'), 'O6-run');

// O6 pin: the URL cell only
must("      const pinned = ids.filter((id) => { const u = rows.get(id) || ''; return u.includes(`/v${real}/`) || u.includes(`/${RELEASE_COMMIT}/`); });",
  "      const pinned = ids.filter((id) => { const u = urlOf(rows.get(id)) || ''; return u.includes(`/v${real}/`) || u.includes(`/${RELEASE_COMMIT}/`); });", 'O6-pin');

// O7: PROVINCE line must sit inside the Frontier section
must("  const named = prov ? prov.toString('utf8').split('\\n').some((l) => l.includes(ENTRY) && /frontier|band|ground|first entry|advanced/i.test(l)) : false;", [
  "  let named = false;",
  "  if (prov) {",
  "    const pt = prov.toString('utf8');",
  "    const at = pt.search(/^#{2,3}\\s+Frontier\\b.*$/m);",
  "    if (at >= 0) {",
  "      const rest = pt.slice(at);",
  "      const end = rest.slice(1).search(/^#{1,3}\\s/m);",
  "      const sec = end < 0 ? rest : rest.slice(0, end + 1);",
  "      named = sec.split('\\n').some((l) => l.includes(ENTRY));",
  "    }",
  "  }",
].join('\n'), 'O7-province');

// O7: run the two oracles from the freezer's bytes (counter-side instrumentation)
must("    const m = spawnSync('node', ['scripts/readme-map.mjs'], { cwd: T, encoding: 'utf8' });", [
  "    const ob = gitFile('scripts/readme-map.mjs');",
  "    if (ob) wfs(join(T, '.oracle-readme-map.mjs'), ob);",
  "    const m = ob ? spawnSync('node', ['.oracle-readme-map.mjs'], { cwd: T, encoding: 'utf8' }) : { status: 1, stdout: '' };",
].join('\n'), 'O7-readme');
must("    const m = spawnSync('node', ['scripts/sources-check.mjs'], { cwd: T, encoding: 'utf8' });", [
  "    const ob = gitFile('scripts/sources-check.mjs');",
  "    if (ob) wfs(join(T, '.oracle-sources-check.mjs'), ob);",
  "    const m = ob ? spawnSync('node', ['.oracle-sources-check.mjs'], { cwd: T, encoding: 'utf8' }) : { status: 1, stdout: '' };",
].join('\n'), 'O7-sources');

writeFileSync(OUT, s);
console.log(`wrote ${OUT}`);
