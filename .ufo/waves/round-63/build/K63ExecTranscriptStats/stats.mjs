#!/usr/bin/env node
/**
 * stats.mjs — measure the real host transcripts behind the inline-dispatch gate
 * (contract kumitate-inline-dispatch-evidence-v1, round 63 / rule I63).
 *
 * READ-ONLY. Reads every `*.jsonl` at depth <= 3 under the harness sessions root
 * (default ~/.omp/agent/sessions), skips files larger than --max-mb, and prints
 * counts only: no transcript text, no prompt bodies, no tool arguments, no exit
 * reasons. The only free-text field emitted is the lane guess derived from the
 * first user message's lane path (a repository name), because the gate needs it.
 *
 *   node stats.mjs [--root DIR] [--out TSV] [--summary TXT] [--max-mb 50]
 *
 * TSV columns (header row first):
 *   name lane session bytes rows user assistant toolResult custom toolCalls
 *   toolCallsByName hasYield exitKind modelUsage firstTs lastTs spanS
 *   idsTotal idsUnique dupIds toolCallIds orphanResults sessionInits parseFail
 *   respawn finished
 *
 * `finished` = a `yield` tool call exists AND the last `session_exit` kind is
 * `normal` — the gate's current clean-seat rule (scripts/inline-dispatch-evidence.mjs).
 */

import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, basename, dirname, resolve, relative, sep } from 'node:path';
import { homedir } from 'node:os';

const MAX_DEPTH = 3;
const MB = 1024 * 1024;

function parseArgs(argv) {
  const o = {
    root: join(homedir(), '.omp', 'agent', 'sessions'),
    out: join(dirname(new URL(import.meta.url).pathname), 'stats.tsv'),
    summary: join(dirname(new URL(import.meta.url).pathname), 'stats.summary.txt'),
    maxMb: 50,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const v = () => {
      if (i + 1 >= argv.length) { console.error(`stats: ${a} needs a value`); process.exit(2); }
      return argv[++i];
    };
    if (a === '--root') o.root = resolve(v());
    else if (a === '--out') o.out = resolve(v());
    else if (a === '--summary') o.summary = resolve(v());
    else if (a === '--max-mb') o.maxMb = Number(v());
    else if (a === '--help' || a === '-h') { console.log('usage: stats.mjs [--root DIR] [--out TSV] [--summary TXT] [--max-mb 50]'); process.exit(0); }
    else { console.error(`stats: unknown argument ${a}`); process.exit(2); }
  }
  return o;
}

/** Collect `*.jsonl` at depth <= MAX_DEPTH (depth measured from the root dir). */
function collect(root) {
  const found = [];
  const walk = (dir, depth) => {
    let ents;
    try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = join(dir, e.name);
      if (e.isDirectory()) { if (depth < MAX_DEPTH) walk(p, depth + 1); continue; }
      if (e.isFile() && e.name.endsWith('.jsonl')) found.push(p);
    }
  };
  walk(root, 0);
  return found.sort();
}

const LANE_RE = /Projects[\\/]shokunin[\\/]([A-Za-z0-9_-]+)/;

function textOf(message) {
  if (!message) return '';
  const c = message.content;
  if (typeof c === 'string') return c;
  if (!Array.isArray(c)) return '';
  let s = '';
  for (const part of c) if (part && part.type === 'text' && typeof part.text === 'string') s += part.text + '\n';
  return s;
}

function analyse(file, root) {
  const st = statSync(file);
  const raw = readFileSync(file, 'utf8');
  const lines = raw.split('\n');
  const r = {
    file, name: basename(file, '.jsonl'),
    session: relative(root, dirname(file)).split(sep).join('/'),
    bytes: st.size,
    rows: 0, user: 0, assistant: 0, toolResult: 0, custom: 0, otherRole: 0,
    toolCalls: 0, toolCallsByName: {},
    hasYield: false, exitKind: null,
    modelUsage: 0, sessionInits: 0, parseFail: 0,
    firstTs: null, lastTs: null, spanS: null,
    idsTotal: 0, idsUnique: 0, dupIds: 0,
    toolCallIds: 0, orphanResults: 0, toolExecStarts: 0, seatMarker: false, yieldAnswered: false,
    markerKind: 'none', danglingParents: 0, sessionRows: 0, hasSessionId: false, parentSession: null,
    lane: 'unknown',
    respawn: /-\d+$/.test(basename(file, '.jsonl')),
    finished: false,
  };
  const ids = new Set();
  const parentIds = [];
  const callIds = new Set();
  const resultCallIds = new Set();
  let laneSeen = false;
  let firstUserText = null;
  let yieldCallId = null;

  for (const line of lines) {
    if (!line) continue;
    let row;
    try { row = JSON.parse(line); } catch { r.parseFail++; continue; }
    r.rows++;
    if (typeof row.id === 'string') {
      r.idsTotal++;
      if (ids.has(row.id)) r.dupIds++; else ids.add(row.id);
    }
    if (typeof row.parentId === 'string') parentIds.push(row.parentId);
    const ts = row.timestamp;
    if (typeof ts === 'string') {
      if (r.firstTs === null || ts < r.firstTs) r.firstTs = ts;
      if (r.lastTs === null || ts > r.lastTs) r.lastTs = ts;
    }
    switch (row.type) {
      case 'message': {
        const m = row.message || {};
        const role = m.role;
        if (role === 'user') {
          r.user++;
          if (!laneSeen) {
            const t = textOf(m);
            if (firstUserText === null) firstUserText = t;
            const m2 = t.match(LANE_RE);
            if (m2) { r.lane = m2[1]; laneSeen = true; }
          }
        } else if (role === 'assistant') {
          r.assistant++;
          const content = Array.isArray(m.content) ? m.content : [];
          for (const part of content) {
            if (!part || part.type !== 'toolCall') continue;
            r.toolCalls++;
            const nm = typeof part.name === 'string' ? part.name : 'unknown';
            r.toolCallsByName[nm] = (r.toolCallsByName[nm] || 0) + 1;
            if (nm === 'yield') { r.hasYield = true; if (typeof part.id === 'string') yieldCallId = part.id; }
            if (typeof part.id === 'string') { r.toolCallIds++; callIds.add(part.id); }
          }
        } else if (role === 'toolResult') {
          r.toolResult++;
          if (typeof m.toolCallId === 'string') resultCallIds.add(m.toolCallId);
        } else if (role === 'custom') r.custom++;
        else r.otherRole++;
        break;
      }
      case 'custom':
        if (row.customType === 'session_exit') r.exitKind = (row.data && row.data.kind) || 'unknown';
        else if (row.customType === 'tool_execution_start') r.toolExecStarts++;
        break;
      case 'model_usage': r.modelUsage++; break;
      case 'session_init': r.sessionInits++; break;
      case 'session':
        r.sessionRows++;
        if (typeof row.id === 'string') r.hasSessionId = true;
        if (typeof row.parentSession === 'string' && !r.parentSession) r.parentSession = row.parentSession;
        break;
      default: break;
    }
  }
  r.idsUnique = ids.size;
  const baseName = r.name.replace(/-\d+$/, '');
  r.yieldAnswered = yieldCallId !== null && resultCallIds.has(yieldCallId);
  const ownMarker = firstUserText !== null && firstUserText.includes(`# Seat ${r.name}\n`);
  const baseMarker = baseName !== r.name && firstUserText !== null && firstUserText.includes(`# Seat ${baseName}\n`);
  r.markerKind = ownMarker ? 'own' : baseMarker ? 'base' : 'none';
  r.seatMarker = ownMarker || baseMarker;
  r.firstUserSha = firstUserText === null ? null : createHash('sha256').update(firstUserText).digest('hex');
  r.danglingParents = 0;
  for (const p of parentIds) if (!ids.has(p)) r.danglingParents++;
  for (const id of resultCallIds) if (!callIds.has(id)) r.orphanResults++;
  if (r.firstTs && r.lastTs) {
    const a = Date.parse(r.firstTs), b = Date.parse(r.lastTs);
    if (Number.isFinite(a) && Number.isFinite(b)) r.spanS = Math.round((b - a) / 1000);
  }
  r.finished = r.hasYield && r.exitKind === 'normal';
  return r;
}

const COLS = ['name', 'lane', 'session', 'bytes', 'rows', 'user', 'assistant', 'toolResult', 'custom',
  'toolCalls', 'toolCallsByName', 'hasYield', 'exitKind', 'modelUsage', 'firstTs', 'lastTs', 'spanS',
  'idsTotal', 'idsUnique', 'dupIds', 'danglingParents', 'toolCallIds', 'orphanResults', 'toolExecStarts', 'seatMarker', 'markerKind', 'yieldAnswered',
  'sessionInits', 'sessionRows', 'hasSessionId', 'parentSession', 'parseFail', 'respawn', 'finished'];

const cell = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  return String(v).replace(/[\t\n\r]/g, ' ');
};

function pct(sorted, p) {
  if (!sorted.length) return null;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * (sorted.length - 1))));
  return sorted[i];
}

function dist(values) {
  const s = values.filter((v) => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return { n: 0 };
  const sum = s.reduce((a, b) => a + b, 0);
  return { n: s.length, min: s[0], p5: pct(s, 5), median: pct(s, 50), p95: pct(s, 95), max: s[s.length - 1], mean: Math.round(sum / s.length) };
}

function fmtDist(d) {
  if (!d.n) return 'n=0';
  return `n=${d.n} min=${d.min} p5=${d.p5} median=${d.median} p95=${d.p95} max=${d.max}`;
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  const files = collect(o.root);
  const skipped = [];
  const rows = [];
  let totalBytes = 0;
  for (const f of files) {
    let st;
    try { st = statSync(f); } catch { skipped.push([f, 'stat-fail']); continue; }
    if (st.size > o.maxMb * MB) { skipped.push([f, `over-${o.maxMb}MB`]); continue; }
    totalBytes += st.size;
    try { rows.push(analyse(f, o.root)); } catch (e) { skipped.push([f, `read-fail:${e.code || 'error'}`]); }
  }

  const out = [COLS.join('\t')];
  for (const r of rows) out.push(COLS.map((c) => cell(r[c])).join('\t'));
  mkdirSync(dirname(o.out), { recursive: true });
  writeFileSync(o.out, out.join('\n') + '\n');

  // ---- classification -------------------------------------------------------
  const finished = rows.filter((r) => r.finished);
  const noYield = rows.filter((r) => !r.hasYield);
  const badExit = rows.filter((r) => r.hasYield && r.exitKind !== null && r.exitKind !== 'normal');
  const noExit = rows.filter((r) => r.hasYield && r.exitKind === null);

  const L = [];
  L.push('TRANSCRIPT_STATS root=' + o.root + ' files=' + files.length + ' scanned=' + rows.length +
    ' skipped=' + skipped.length + ' bytes=' + totalBytes);
  const seats = rows.filter((r) => r.seatMarker);
  const finishedSeats = finished.filter((r) => r.seatMarker);

  L.push('');
  L.push('## classification (mutually exclusive)');
  L.push(`files total = ${rows.length}; with "# Seat <name>" user marker = ${seats.length}; without = ${rows.length - seats.length}`);
  L.push(`finished (yield + exit normal) = ${finished.length}   [seat-marked ${finishedSeats.length}]`);
  L.push(`dead: no yield tool call          = ${noYield.length}   [seat-marked ${noYield.filter((r) => r.seatMarker).length}]`);
  L.push(`dead: yield but exit != normal    = ${badExit.length}   [seat-marked ${badExit.filter((r) => r.seatMarker).length}]`);
  L.push(`dead: yield but no session_exit   = ${noExit.length}   [seat-marked ${noExit.filter((r) => r.seatMarker).length}]`);
  L.push(`check: ${finished.length}+${noYield.length}+${badExit.length}+${noExit.length} = ${finished.length + noYield.length + badExit.length + noExit.length} of ${rows.length}`);
  const exitKinds = new Map();
  for (const r of rows) exitKinds.set(r.exitKind === null ? 'NO_RECORD' : r.exitKind, (exitKinds.get(r.exitKind === null ? 'NO_RECORD' : r.exitKind) || 0) + 1);
  L.push('exitKind census (all files): ' + [...exitKinds].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
  const seatExit = new Map();
  for (const r of seats) seatExit.set(r.exitKind === null ? 'NO_RECORD' : r.exitKind, (seatExit.get(r.exitKind === null ? 'NO_RECORD' : r.exitKind) || 0) + 1);
  L.push('exitKind census (seat-marked): ' + [...seatExit].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));

  const distBlock = (label, pop) => {
    L.push(`${label} (n=${pop.length})`);
    L.push('  bytes        ' + fmtDist(dist(pop.map((r) => r.bytes))));
    L.push('  toolResult   ' + fmtDist(dist(pop.map((r) => r.toolResult))));
    L.push('  spanS        ' + fmtDist(dist(pop.map((r) => r.spanS))));
    L.push('  toolCalls    ' + fmtDist(dist(pop.map((r) => r.toolCalls))));
    L.push('  rows         ' + fmtDist(dist(pop.map((r) => r.rows))));
    L.push('  modelUsage   ' + fmtDist(dist(pop.map((r) => r.modelUsage))));
    L.push('  assistant    ' + fmtDist(dist(pop.map((r) => r.assistant))));
    L.push('  user         ' + fmtDist(dist(pop.map((r) => r.user))));
    L.push('  sessionInits ' + fmtDist(dist(pop.map((r) => r.sessionInits))));
    L.push('  distinctTools ' + fmtDist(dist(pop.map((r) => Object.keys(r.toolCallsByName).length))));
  };
  L.push('');
  L.push('## distribution among FINISHED seats');
  distBlock('all finished', finished);
  L.push('');
  distBlock('finished + seat-marked (the population the gate credits)', finishedSeats);

  L.push('');
  L.push('## "-<N>" suffixed files (suffix is ambiguous: respawn OR a seat name that ends in -N)');
  const respawns = rows.filter((r) => r.respawn);
  const respawnSeats = seats.filter((r) => r.respawn);
  L.push(`suffixed files = ${respawns.length} (finished ${respawns.filter((r) => r.finished).length}, dead ${respawns.filter((r) => !r.finished).length})`);
  L.push(`suffixed seat-marked = ${respawnSeats.length} (finished ${respawnSeats.filter((r) => r.finished).length}, dead ${respawnSeats.filter((r) => !r.finished).length})`);
  const mk = new Map();
  for (const r of respawns) mk.set(r.markerKind, (mk.get(r.markerKind) || 0) + 1);
  L.push('suffixed markerKind census: ' + [...mk].map(([k, v]) => `${k}=${v}`).join(' ') +
    ' (own = the prompt names the -N stem itself; base = prompt names the stem without the suffix, i.e. a real respawn)');
  const trueRespawns = respawns.filter((r) => r.markerKind === 'base');
  L.push(`true respawns (prompt names the base seat) = ${trueRespawns.length}: ` +
    (trueRespawns.length ? trueRespawns.map((r) => `${r.name}(${r.finished ? 'finished' : 'dead'})`).join(' ') : '(none)'));
  // Does a base-named file also carry the SAME prompt? Then any dispatch matching the
  // respawn also matches the base and the gate's candidates() returns 2 matches.
  const byName = new Map(rows.map((r) => [r.name, r]));
  let baseAbsent = 0; let samePrompt = 0; let diffPrompt = 0; let baseDead = 0; let baseFin = 0;
  const samePromptNames = [];
  for (const r of trueRespawns) {
    const b = byName.get(r.name.replace(/-\d+$/, ''));
    if (!b) { baseAbsent++; continue; }
    if (b.finished) baseFin++; else baseDead++;
    if (b.firstUserSha && b.firstUserSha === r.firstUserSha) { samePrompt++; samePromptNames.push(r.name); } else diffPrompt++;
  }
  L.push(`respawn vs base: base-absent=${baseAbsent} base-finished=${baseFin} base-dead=${baseDead} identical-first-user-message=${samePrompt} different=${diffPrompt}`);
  L.push('identical-prompt respawns (a dispatch matching one matches both -> gate SESSION_AMBIGUOUS): ' +
    (samePromptNames.length ? samePromptNames.join(' ') : '(none)'));
  const suffixes = new Map();
  for (const r of respawns) { const s = (r.name.match(/-(\d+)$/) || [])[1]; suffixes.set(s, (suffixes.get(s) || 0) + 1); }
  L.push('suffix census: ' + [...suffixes].sort((a, b) => Number(a[0]) - Number(b[0])).map(([k, v]) => `-${k}=${v}`).join(' '));
  L.push('suffixed names: ' + (respawns.length ? respawns.map((r) => r.name).join(' ') : '(none)'));

  const invariantBlock = (label, pop) => {
    L.push('');
    L.push(`## structural invariants over ${label} (n=${pop.length})`);
    const props = [
      ['toolResult >= 1', (r) => r.toolResult >= 1],
      ['toolCalls >= 1', (r) => r.toolCalls >= 1],
      ['toolResult == toolCalls', (r) => r.toolResult === r.toolCalls],
      ['toolExecStarts == toolCalls', (r) => r.toolExecStarts === r.toolCalls],
      ['rows >= 4', (r) => r.rows >= 4],
      ['sessionInits >= 1', (r) => r.sessionInits >= 1],
      ['session row with an id', (r) => r.sessionRows >= 1 && r.hasSessionId],
      ['user >= 1', (r) => r.user >= 1],
      ['assistant >= 2', (r) => r.assistant >= 2],
      ['modelUsage >= 1', (r) => r.modelUsage >= 1],
      ['dupIds == 0', (r) => r.dupIds === 0],
      ['danglingParents == 0', (r) => r.danglingParents === 0],
      ['parseFail == 0', (r) => r.parseFail === 0],
      ['orphanResults == 0', (r) => r.orphanResults === 0],
      ['yield answered by a toolResult', (r) => r.yieldAnswered === true],
      ['spanS >= 1', (r) => typeof r.spanS === 'number' && r.spanS >= 1],
      ['distinctTools >= 3', (r) => Object.keys(r.toolCallsByName).length >= 3],
    ];
    for (const [pl, f] of props) {
      const viol = pop.filter((r) => !f(r));
      L.push(`${viol.length === 0 ? 'HOLDS ' : 'BROKEN'} ${pl}: violations=${viol.length}${viol.length ? ' [' + viol.slice(0, 12).map((r) => r.name).join(' ') + (viol.length > 12 ? ` …+${viol.length - 12}` : '') + ']' : ''}`);
    }
  };
  invariantBlock('FINISHED seats (all)', finished);
  invariantBlock('FINISHED seat-marked', finishedSeats);

  L.push('');
  L.push('## threshold sweep (violations among finished seat-marked)');
  const sweep = (label, get, ks) => {
    const vals = finishedSeats.map(get).filter((v) => typeof v === 'number');
    if (!vals.length) { L.push(label + ': n=0'); return; }
    const parts = ks.map((k) => {
      const v = vals.filter((x) => x < k).length;
      return `>=${k}:${v}`;
    });
    L.push(`${label} violations ${parts.join(' ')} (n=${vals.length}, min=${Math.min(...vals)})`);
  };
  sweep('toolResult ', (r) => r.toolResult, [2, 3, 4, 5, 8, 10, 12, 20]);
  sweep('toolCalls  ', (r) => r.toolCalls, [2, 3, 4, 5, 8, 10, 12, 20]);
  sweep('rows       ', (r) => r.rows, [10, 15, 20, 30, 40, 46]);
  sweep('bytes      ', (r) => r.bytes, [10000, 20000, 40000, 46000, 100000, 190000]);
  sweep('spanS      ', (r) => r.spanS, [30, 60, 120, 300, 420, 470]);
  sweep('distinctTools', (r) => Object.keys(r.toolCallsByName).length, [2, 3, 4, 5]);
  sweep('modelUsage ', (r) => r.modelUsage, [1]);
  L.push('zero-violation floors among finished seat-marked: ' + [
    ['toolResult', Math.min(...finishedSeats.map((r) => r.toolResult))],
    ['toolCalls', Math.min(...finishedSeats.map((r) => r.toolCalls))],
    ['rows', Math.min(...finishedSeats.map((r) => r.rows))],
    ['bytes', Math.min(...finishedSeats.map((r) => r.bytes))],
    ['spanS', Math.min(...finishedSeats.filter((r) => typeof r.spanS === 'number').map((r) => r.spanS))],
    ['distinctTools', Math.min(...finishedSeats.map((r) => Object.keys(r.toolCallsByName).length))],
  ].map(([k, v]) => `${k}>=${v}`).join(' '));

  L.push('');
  L.push('## finished seats a cheap forgery could imitate (bottom-5% band, seat-marked)');
  const weak = finishedSeats.filter((r) =>
    r.toolResult < 13 || r.bytes < 208239 || r.spanS === null || r.spanS < 484 || r.rows < 50 ||
    r.dupIds > 0 || r.orphanResults > 0 || r.toolExecStarts !== r.toolCalls ||
    Object.keys(r.toolCallsByName).length < 4);
  L.push(`bottom-5%-band finished seat-marked = ${weak.length} of ${finishedSeats.length}`);
  for (const r of weak) {
    L.push(`  ${r.name} bytes=${r.bytes} rows=${r.rows} toolResult=${r.toolResult} toolCalls=${r.toolCalls} ` +
      `execStarts=${r.toolExecStarts} spanS=${r.spanS} distinctTools=${Object.keys(r.toolCallsByName).length} dupIds=${r.dupIds} orphan=${r.orphanResults}`);
  }
  const floorSet = finishedSeats.filter((r) =>
    r.toolResult < 9 || r.toolCalls !== r.toolResult || r.toolExecStarts !== r.toolCalls || r.rows < 40 ||
    r.bytes < 132136 || r.spanS === null || r.spanS < 453 || r.dupIds > 0 || r.orphanResults > 0 ||
    r.parseFail > 0 || r.sessionInits < 1 || r.user < 1 || r.assistant < 2 ||
    Object.keys(r.toolCallsByName).length < 3 || !r.yieldAnswered);
  L.push(`finished seat-marked failing the zero-violation floor = ${floorSet.length}` +
    (floorSet.length ? ' [' + floorSet.map((r) => r.name).join(' ') + ']' : ' (none: the floor is exactly the observed minimum)'));
  const minima = [
    ['toolResult', (r) => r.toolResult], ['rows', (r) => r.rows], ['bytes', (r) => r.bytes], ['spanS', (r) => r.spanS],
  ].map(([k, get]) => {
    const m = finishedSeats.filter((r) => typeof get(r) === 'number').reduce((a, b) => (get(b) < get(a) ? b : a));
    return `${k}=${get(m)}@${m.name}`;
  });
  L.push('floor witnesses (weakest real finished seat per axis): ' + minima.join(' '));
  L.push('seats at the distinctTools floor (3): ' + finishedSeats.filter((r) => Object.keys(r.toolCallsByName).length === 3).map((r) => r.name).join(' ') || '(none)');
  L.push('seats without model_usage rows: ' + finishedSeats.filter((r) => r.modelUsage === 0).length + ' of ' + finishedSeats.length + ' (a model_usage requirement would reject them)');
  L.push('');
  L.push('## tool name census (seat-marked finished)');
  const toolCensus = new Map();
  for (const r of finishedSeats) for (const [k, v] of Object.entries(r.toolCallsByName)) toolCensus.set(k, (toolCensus.get(k) || 0) + v);
  L.push([...toolCensus].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
  const yieldless = finishedSeats.filter((r) => r.toolResult === r.toolCalls && r.toolResult < 12);
  L.push('seat-marked finished with <12 answered calls: ' + (yieldless.length ? yieldless.map((r) => `${r.name}(${r.toolResult})`).join(' ') : '(none)'));

  L.push('');
  L.push('## current orchestrator session (largest session dir) — the in-flight round');
  const sessCount = new Map();
  for (const r of rows) sessCount.set(r.session, (sessCount.get(r.session) || 0) + 1);
  const biggest = [...sessCount].sort((a, b) => b[1] - a[1])[0];
  if (biggest) {
    const pop = rows.filter((r) => r.session === biggest[0]);
    const popFin = pop.filter((r) => r.finished);
    const popSeatFin = popFin.filter((r) => r.seatMarker);
    L.push(`session ${biggest[0]} files=${pop.length} finished=${popFin.length} seat-marked-finished=${popSeatFin.length}`);
    if (popSeatFin.length) {
      L.push('  seat-marked-finished floors: ' + [
        ['toolResult', Math.min(...popSeatFin.map((r) => r.toolResult))],
        ['rows', Math.min(...popSeatFin.map((r) => r.rows))],
        ['bytes', Math.min(...popSeatFin.map((r) => r.bytes))],
        ['spanS', Math.min(...popSeatFin.filter((r) => typeof r.spanS === 'number').map((r) => r.spanS))],
        ['distinctTools', Math.min(...popSeatFin.map((r) => Object.keys(r.toolCallsByName).length))],
      ].map(([k, v]) => `${k}>=${v}`).join(' '));
      L.push('  seat-marked-finished violations of the floor: ' + popSeatFin.filter((r) =>
        r.toolResult < 9 || r.toolCalls !== r.toolResult || r.toolExecStarts !== r.toolCalls || r.rows < 40 ||
        r.bytes < 132136 || r.spanS === null || r.spanS < 453 || r.dupIds > 0 || r.orphanResults > 0 ||
        Object.keys(r.toolCallsByName).length < 3 || !r.yieldAnswered).length);
      L.push('  seat-marked-finished without model_usage: ' + popSeatFin.filter((r) => r.modelUsage === 0).length + ' of ' + popSeatFin.length);
    }
    const deadSeats = pop.filter((r) => r.seatMarker && !r.finished);
    L.push(`  seat-marked dead so far: ${deadSeats.length} (no-yield ${deadSeats.filter((r) => !r.hasYield).length}, no-exit-record ${deadSeats.filter((r) => r.hasYield && r.exitKind === null).length})`);
    const parents = new Set(pop.filter((r) => r.seatMarker).map((r) => r.parentSession).filter(Boolean));
    L.push(`  distinct parentSession among seat-marked files: ${parents.size}${parents.size > 1 ? ' (the gate requires exactly 1 -> PARENT_MISMATCH)' : ''}`);
    const popResp = pop.filter((r) => r.seatMarker && r.respawn);
    L.push(`  seat-marked "-<N>" files in this session: ${popResp.length} (markerKind base=${popResp.filter((r) => r.markerKind === 'base').length}, own=${popResp.filter((r) => r.markerKind === 'own').length}, none=${popResp.filter((r) => r.markerKind === 'none').length})`);
  }

  L.push('');
  L.push('## lane census (from first user message)');
  const lanes = new Map();
  for (const r of rows) lanes.set(r.lane, (lanes.get(r.lane) || 0) + 1);
  L.push([...lanes].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
  const laneFin = new Map();
  for (const r of finishedSeats) laneFin.set(r.lane, (laneFin.get(r.lane) || 0) + 1);
  L.push('finished seat-marked by lane: ' + [...laneFin].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));

  L.push('');
  L.push('## sessions (directory) census');
  const sess = new Map();
  for (const r of rows) {
    const s = sess.get(r.session) || { files: 0, finished: 0 };
    s.files++; if (r.finished) s.finished++;
    sess.set(r.session, s);
  }
  for (const [k, v] of [...sess].sort((a, b) => b[1].files - a[1].files)) {
    L.push(`  ${k} files=${v.files} finished=${v.finished}`);
  }

  if (skipped.length) {
    L.push('');
    L.push('## skipped files');
    for (const [f, why] of skipped) L.push(`  ${relative(o.root, f)} (${why})`);
  }

  const text = L.join('\n') + '\n';
  writeFileSync(o.summary, text);
  process.stdout.write(text);
}

main();
