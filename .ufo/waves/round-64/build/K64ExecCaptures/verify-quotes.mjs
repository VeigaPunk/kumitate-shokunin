#!/usr/bin/env node
/**
 * verify-quotes.mjs — re-check the C2 quote candidates in quotes-verified.md against the
 * pinned captures (J4) and, with --live, against a fresh fetch of each row URL (J5).
 * The normalizer is copied verbatim from .ufo/waves/round-64/probe/jj64-probe.mjs:70-78,
 * so a PASS here means the probe's own substring test passes.
 *
 *   node verify-quotes.mjs <lane-dir> [--pins pins-append.json] [--live]
 *
 * Exit 0 when every candidate is found and <= 25 words; exit 1 otherwise.
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const HERE = new URL('.', import.meta.url).pathname;
const argv = process.argv.slice(2);
const lane = resolve(argv[0] || '.');
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const pinsFile = join(HERE, opt('--pins', 'pins-append.json'));
const LIVE = argv.includes('--live');

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const pins = new Map(JSON.parse(readFileSync(pinsFile, 'utf8')).map((c) => [c.sourceId, c]));
const urls = new Map();
for (const l of readFileSync(join(HERE, 'draft-rows.md'), 'utf8').split('\n')) {
  const id = /^\|\s*(S\d{3,})\s*\|/.exec(l);
  const u = /(https?:\/\/[^\s|)]+)/.exec(l);
  if (id && u) urls.set(id[1], u[1]);
}

const bullets = [];
for (const l of readFileSync(join(HERE, 'quotes-verified.md'), 'utf8').split('\n')) {
  const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
  if (m) bullets.push({ id: m[1], q: m[2].replace(/\\"/g, '"') });
}
if (bullets.length === 0) { console.log('VERIFY_QUOTES: FAIL no-bullets'); process.exit(1); }

const capText = new Map();
for (const [id, c] of pins) {
  const b = readFileSync(join(lane, c.path));
  if (createHash('sha256').update(b).digest('hex') !== c.sha256 || b.length !== c.bytes) {
    console.log(`VERIFY_QUOTES: FAIL ${id} pin-mismatch (hash-or-size)`);
    process.exit(1);
  }
  capText.set(id, norm(b));
}

const liveText = new Map();
if (LIVE) {
  for (const [id, u] of urls) {
    if (!pins.has(id)) continue;
    const r = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-r64)', u], { maxBuffer: 128 * 1024 * 1024 });
    if (r.status !== 0) { console.log(`VERIFY_QUOTES: FAIL ${id} live-unreachable ${u}`); process.exit(1); }
    liveText.set(id, norm(r.stdout));
  }
}

let bad = 0;
for (const b of bullets) {
  const w = b.q.trim().split(/\s+/).length;
  const cap = capText.get(b.id);
  const inCap = Boolean(cap && cap.includes(norm(b.q)));
  const inLive = LIVE ? Boolean(liveText.get(b.id)?.includes(norm(b.q))) : null;
  const ok = inCap && inLive !== false && w <= 25;
  if (!ok) bad += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${b.id} w=${w} capture=${inCap ? 'Y' : 'n'}${LIVE ? ` live=${inLive ? 'Y' : 'n'}` : ''} :: ${b.q.slice(0, 64)}`);
}
console.log(`VERIFY_QUOTES: ${bad === 0 ? 'CLEAN' : 'DRIFT'} quotes=${bullets.length} bad=${bad} live=${LIVE ? 'on' : 'off'} pins=${opt('--pins', 'pins-append.json')}`);
process.exit(bad === 0 ? 0 : 1);
