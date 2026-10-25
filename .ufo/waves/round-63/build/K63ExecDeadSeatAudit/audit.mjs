#!/usr/bin/env node
/**
 * audit.mjs — dead-seat audit for kumitate rounds 59..62 (considerthese 2026-10-25, idea 3).
 *
 *   node .ufo/waves/round-63/build/K63ExecDeadSeatAudit/audit.mjs [LANE_ROOT] [REPORTS_ROOT] [OUT_DIR]
 *
 * Death, per the assignment's three criteria plus the seat's own host transcript:
 *   1. launcher-progress.tsv: exit != 0, or session=null / empty
 *   2. <wave>-results.json / close/<wave>-results.json: status != completed
 *   3. no report file for the seat anywhere in .ufo/waves/round-N/ — checked at the seat's own
 *      wave path, then at every round-N/<wave>/<x>.md path the seat's transcript announces
 *      (a seat that filed under a topic name is MISNAMED, not dead), then at variant files.
 * A seat with no report anywhere is dead even when every lane record calls it alive.
 *
 * Host transcripts (read-only): <sessions-root>/**\/L1Kumitate<NN>/L1Kumitate<NN>.<Seat>.jsonl,
 * read for `session_exit` kind, `yield` tool call, the announced report path and the wave that
 * path names. A transcript whose seat has no lane record is an UNRECORDED SPAWN.
 *
 * Outputs (OUT_DIR): audit.tsv, unnamed-by-round.tsv, unrecorded-spawns.tsv.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const lane = resolve(process.argv[2] || process.cwd());
const reportsRoot = resolve(process.argv[3] || '/home/vgpnk/Projects/shokunin/.ufo/reports');
const outDir = resolve(process.argv[4] || join(lane, '.ufo/waves/round-63/build/K63ExecDeadSeatAudit'));
const sessionsRoot = process.env.SESSIONS_ROOT || join(homedir(), '.omp', 'agent', 'sessions');
const waves = join(lane, '.ufo/waves');

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const token = (name) => new RegExp(`(?<![A-Za-z0-9_.-])${esc(name)}(?![A-Za-z0-9_-])`);
const readMaybe = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };

function parseProgress(file) {
  const raw = readMaybe(file);
  if (raw === null) return null;
  const rows = [];
  let hasSessionField = false;
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const cells = line.split('\t');
    const kv = {};
    for (const c of cells.slice(1)) { const i = c.indexOf('='); if (i > 0) kv[c.slice(0, i)] = c.slice(i + 1); }
    if ('session' in kv) hasSessionField = true;
    rows.push({ name: cells[0].trim(), exit: kv.exit ?? null, session: kv.session ?? null, pid: kv.pid ?? null });
  }
  rows.hasSessionField = hasSessionField;
  return rows;
}

function parseResults(file) {
  const raw = readMaybe(file);
  if (raw === null) return null;
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j.members)) return j.members.map((m) => ({ name: m.name, status: m.status, exit: m.exit ?? null, error: m.error ?? null }));
    if (Array.isArray(j.results)) return j.results.map((m) => ({ name: m.name, status: m.status ?? null, exit: m.exit ?? null, error: m.error ?? null }));
    return null;
  } catch { return null; }
}

function parseDispatch(file) {
  const raw = readMaybe(file);
  if (raw === null) return null;
  try {
    const j = JSON.parse(raw);
    const tc = j.taskCall || j;
    return Array.isArray(tc.tasks) ? tc.tasks.map((t) => t.name) : null;
  } catch { return null; }
}

/** registry file: ufo-swarm-registry-v1 (members object) or a flat {members:[{name}]} */
function parseRegistry(file) {
  const raw = readMaybe(file);
  if (raw === null) return null;
  try {
    const j = JSON.parse(raw);
    const m = j.members;
    if (Array.isArray(m)) return m.map((x) => x.name).filter(Boolean);
    if (m && typeof m === 'object') return Object.keys(m);
    return null;
  } catch { return null; }
}

/** round -> Map(seat -> {exitKind, yielded, paths:[{wave,file}], finalText}) */
function scanTranscripts(round) {
  const out = new Map();
  if (!existsSync(sessionsRoot)) return out;
  const want = `L1Kumitate${round}`;
  const dirs = [];
  const walk = (d, depth) => {
    if (depth > 4) return;
    let ents;
    try { ents = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) if (e.isDirectory()) {
      const p = join(d, e.name);
      if (e.name === want) dirs.push(p); else walk(p, depth + 1);
    }
  };
  walk(sessionsRoot, 0);
  const pathRe = new RegExp(`\\.ufo/waves/round-${round}/([a-z0-9]+)/([A-Za-z0-9_.\\-]+\\.md)`, 'g');
  for (const d of dirs) {
    for (const f of readdirSync(d)) {
      if (!f.endsWith('.jsonl') || !f.startsWith(`${want}.`)) continue;
      const name = f.slice(want.length + 1, -6);
      const raw = readMaybe(join(d, f));
      if (raw === null) continue;
      const rec = { exitKind: null, yielded: false, paths: [], finalText: null };
      for (const line of raw.split('\n')) {
        if (!line.trim()) continue;
        let r; try { r = JSON.parse(line); } catch { continue; }
        if (r.type === 'custom' && r.customType === 'session_exit') rec.exitKind = (r.data && r.data.kind) || 'unknown';
        else if (r.type === 'message' && r.message && r.message.role === 'assistant' && Array.isArray(r.message.content)) {
          const text = r.message.content.filter((c) => c && c.type === 'text').map((c) => c.text).join('');
          for (const c of r.message.content) if (c && c.type === 'toolCall' && c.name === 'yield') rec.yielded = true;
          if (text) { rec.finalText = text; for (const m of text.matchAll(pathRe)) rec.paths.push({ wave: m[1], file: m[2] }); }
        }
      }
      out.set(name, rec);
    }
  }
  return out;
}

function errExcerpt(roundDir, wave, name) {
  const raw = readMaybe(join(roundDir, wave, `${name}.err`));
  if (!raw) return null;
  let best = null;
  for (const line of raw.split('\n')) { const n = norm(line); if (n.length >= 20 && (!best || n.length > best.length)) best = n; }
  return best;
}

const R = (p) => join(waves, p);
const CONFIG = {
  50: { waves: ['r50'], results: () => null, dispatch: () => null, registry: (w) => R('round-50/r50/swarm-registry.json') },
  51: { waves: ['w1', 'w2'], results: () => null, dispatch: () => null, registry: (w) => R(`round-51/${w}/swarm-registry.json`) },
  52: { waves: ['w1'], results: () => null, dispatch: () => null, registry: () => R('round-52/w1-registry.json') },
  53: { waves: [], results: () => null, dispatch: () => null, prepared: 'report: "committed for orchestrator dispatch"' },
  54: { waves: ['w1'], results: () => null, dispatch: () => null, registry: () => R('round-54/w1/swarm-registry.json'), prepared: 'report: "no seats were spawned"' },
  55: { waves: ['w1'], results: () => null, dispatch: () => null, registry: () => R('round-55/w1/swarm-registry.json'), prepared: 'report: "no seats were spawned"' },
  56: { waves: ['w1'], results: () => null, dispatch: () => null, registry: () => R('round-56/w1/swarm-registry.json'), prepared: 'report: "no seats were spawned"' },
  57: { waves: ['w1'], results: () => null, dispatch: () => null, registry: () => R('round-57/w1/swarm-registry.json') },
  58: { waves: ['w1'], results: () => null, dispatch: () => null, registry: () => R('round-58/w1/swarm-registry.json') },
  59: { waves: ['w1'], results: () => null, dispatch: () => null },
  60: { waves: ['w1'], results: () => null, dispatch: () => null },
  61: { waves: ['w1', 'w2'], results: (w) => join(waves, 'round-61/close', `${w}-results.json`), dispatch: () => null },
  62: { waves: ['w1', 'w2'], results: () => null, dispatch: (w) => join(waves, 'round-62', `${w}-dispatch.json`) },
};

const rows = [];
const summary = [];
const unrecordedRows = [];
const notes = [];

for (const [roundStr, cfg] of Object.entries(CONFIG)) {
  const round = Number(roundStr);
  const roundDir = join(waves, `round-${round}`);
  const filed = readMaybe(join(reportsRoot, `round-${round}`, 'kumitate.md'));
  const tr = scanTranscripts(round);

  // files per wave
  const files = {};
  for (const w of cfg.waves) {
    const d = join(roundDir, w);
    files[w] = existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)) : [];
  }

  const seats = new Map();
  const progressHasSession = {};
  const reg = (n) => { if (!seats.has(n)) seats.set(n, { wave: null }); return seats.get(n); };
  for (const w of cfg.waves) {
    const prog = parseProgress(join(roundDir, w, 'launcher-progress.tsv'));
    progressHasSession[w] = !!(prog && prog.hasSessionField);
    for (const r of prog || []) { const s = reg(r.name); s.wave = s.wave || w; s.progress = r; }
    for (const r of parseResults(cfg.results(w)) || []) { const s = reg(r.name); s.wave = s.wave || w; s.result = r; }
    for (const n of parseDispatch(cfg.dispatch(w)) || []) { const s = reg(n); s.wave = s.wave || w; s.dispatched = w; }
    for (const n of (cfg.registry ? parseRegistry(cfg.registry(w)) || [] : [])) { const s = reg(n); s.wave = s.wave || w; s.registered = w; }
    for (const n of files[w]) { const s = reg(n); s.wave = s.wave || w; }
  }
  const recorded = new Set(seats.keys());
  for (const [name, rec] of tr) {
    const s = reg(name);
    s.transcript = rec;
    if (!s.wave) {
      const announced = rec.paths.length ? rec.paths[rec.paths.length - 1].wave : null;
      s.wave = announced && cfg.waves.includes(announced) ? announced : 'w?';
      s.unrecorded = true;
      unrecordedRows.push([round, s.wave, name, rec.paths.length ? `${rec.paths[rec.paths.length - 1].wave}/${rec.paths[rec.paths.length - 1].file}` : '-', `exit=${rec.exitKind || 'none'}${rec.yielded ? '+yield' : '/no-yield'}`, norm(rec.finalText || '').slice(0, 80)].join('\t'));
    }
  }

  let dead = 0; let named = 0; let misnamed = 0; const unnamed = [];
  let measured = true; const gaps = [];

  for (const [name, s] of seats) {
    const wave = s.wave;
    const ev = [];
    if (s.progress && s.progress.exit !== '0') ev.push(`progress:exit=${s.progress.exit}`);
    else if (s.progress && progressHasSession[s.wave] && (!s.progress.session || s.progress.session === 'null')) ev.push(`progress:session=null`);
    else if (s.progress && !progressHasSession[s.wave]) s.noSessionField = true;
    if (s.result && s.result.status && s.result.status !== 'completed') ev.push(`results:status=${s.result.status}${s.result.exit != null ? `,exit=${s.result.exit}` : ''}`);

    let where = 'absent';
    if (files[wave] && files[wave].includes(name)) where = `exact:${wave}`;
    if (where === 'absent') for (const w of cfg.waves) if (files[w] && files[w].includes(name)) where = `exact-other-wave:${w}`;
    if (where === 'absent') {
      const ann = (s.transcript && s.transcript.paths) || [];
      const hit = ann.find((p) => cfg.waves.includes(p.wave) && files[p.wave].includes(p.file.slice(0, -3)));
      if (hit) { where = `misnamed:${hit.wave}/${hit.file}`; misnamed += 1; }
    }
    if (where === 'absent') {
      for (const w of cfg.waves) {
        const v = (files[w] || []).filter((k) => k !== name && (k.endsWith(`.${name}`) || k.startsWith(`${name}-`)));
        if (v.length) { where = `variant:${w}/${v.join(',')}.md`; misnamed += 1; break; }
      }
    }
    if (where === 'absent') ev.push('no-report-anywhere');
    if (ev.length === 0 && where !== 'absent') continue;
    if (cfg.prepared) continue; // registry is a prepared spec, not a dispatch: no seat ran

    dead += 1;
    const isNamed = !!filed && token(name).test(filed);
    if (isNamed) named += 1; else unnamed.push(name);
    let errText = 'no';
    if (isNamed && filed) {
      const fnorm = norm(filed);
      const ex = errExcerpt(roundDir, wave, name) || (s.result && s.result.error ? norm(s.result.error) : null);
      if (ex && fnorm.includes(ex)) errText = 'yes(err-line)';
      else {
        const idx = fnorm.search(token(name));
        const win = idx >= 0 ? fnorm.slice(Math.max(0, idx - 240), idx + name.length + 240) : '';
        const codes = [s.progress && s.progress.exit, s.result && s.result.exit].filter((x) => x != null && String(x) !== '0');
        if (codes.some((c) => win.includes(`exit ${c}`) || win.includes(`exit=${c}`) || win.includes(`exit -${String(c).replace('-', '')}`))) errText = 'yes(exit-code)';
      }
    }
    const t = s.transcript;
    rows.push([
      round, wave, name, ev.join('; ') || 'no-report-anywhere', isNamed ? 'yes' : 'no', errText, where,
      t ? `exit=${t.exitKind || 'none'}${t.yielded ? '+yield' : '/no-yield'}` : 'no-transcript',
      t && t.finalText ? norm(t.finalText).slice(0, 70) : '',
    ].join('\t'));
  }

  for (const w of cfg.waves) {
    const hasOutcome = parseProgress(join(roundDir, w, 'launcher-progress.tsv')) || parseResults(cfg.results(w));
    if (!hasOutcome && !parseDispatch(cfg.dispatch(w))) { measured = false; gaps.push(`${w}:${cfg.prepared ? cfg.prepared : 'no-outcome-record'}`); }
  }
  summary.push([round, tr.size, recorded.size, dead, named, dead - named, misnamed, measured ? 'measured' : `unmeasured(${gaps.join(',')})`, unrecordedRows.filter((r) => r.startsWith(`${round}\t`)).length].join('\t'));
  if (!filed) notes.push(`round-${round}: no filed report`);
}

const header = 'round\twave\tseat\tevidence_of_death\tnamed_in_report\terror_text_present\treport_resolution\ttranscript\tseat_final_text';
const sHeader = 'round\ttranscripts\tlane_record_seats\tdead_total\tnamed\tunnamed\tmisnamed_reports\tmeasurement\tunrecorded_spawns';
const uHeader = 'round\twave\tseat\tannounced_report\ttranscript\tfinal_text';
writeFileSync(join(outDir, 'audit.tsv'), `${header}\n${rows.join('\n')}\n`);
writeFileSync(join(outDir, 'unnamed-by-round.tsv'), `${sHeader}\n${summary.join('\n')}\n`);
writeFileSync(join(outDir, 'unrecorded-spawns.tsv'), `${uHeader}\n${unrecordedRows.join('\n')}\n`);
process.stdout.write(`${header}\n${rows.join('\n')}\n\n${sHeader}\n${summary.join('\n')}\n`);
for (const n of notes) process.stdout.write(`NOTE ${n}\n`);
