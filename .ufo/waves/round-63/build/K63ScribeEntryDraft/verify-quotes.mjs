#!/usr/bin/env node
// K63ScribeEntryDraft — proves every `## Located quotes` bullet of entry.md against the
// round-63 fixed captures. norm() is copied verbatim from the frozen counter
// .ufo/waves/round-63/probe/topology63-probe.mjs. Exits 1 on any miss.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const CAP = join(LANE, '.ufo/waves/round-63/build/K63Capture');
const ENTRY = join(HERE, 'entry.md');

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const cap = {
  S196: norm(readFileSync(join(CAP, 'bailian-managed-agents-multiagent.md'))),
  S197: norm(readFileSync(join(CAP, 'arxiv-2512.08296v3.html'))),
};

const text = readFileSync(ENTRY, 'utf8');
const lines = text.split('\n');
const bad = [];
const at = lines.findIndex((l) => /^##\s+Located quotes\s*$/.test(l));
if (at < 0) bad.push('no-located-quotes-section');
const bullets = [];
for (const l of lines.slice(at + 1)) {
  if (/^##\s/.test(l)) break;
  const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
  if (m) bullets.push({ id: m[1], q: m[2], line: l });
}
if (bullets.length < 8) bad.push(`bullets=${bullets.length} (<8)`);
for (const id of Object.keys(cap)) if (!bullets.some((b) => b.id === id)) bad.push(`${id}:no-bullet`);

const rows = [];
for (const b of bullets) {
  const words = b.q.trim().split(/\s+/).length;
  const hit = (cap[b.id] || '').includes(norm(b.q));
  if (words > 25) bad.push(`${b.id}:over-25-words(${words})`);
  if (!hit) bad.push(`${b.id}:NOT-IN-CAPTURE(${b.q.slice(0, 40)})`);
  rows.push(`${hit ? 'HIT ' : 'MISS'} ${b.id} words=${String(words).padStart(2)} "${b.q.slice(0, 58)}${b.q.length > 58 ? '…' : ''}"`);
}

// header trio inside the first 14 lines, as the frozen counter's T1 reads it
const head = lines.slice(0, 14).join('\n');
if (!/^source:\s*S\d{3,}/m.test(head)) bad.push('header:no-source');
if (!/^verified-at:\s*2026-10-25/m.test(head)) bad.push('header:no-verified-at');
if (!/^recheck:\s*\S+/m.test(head)) bad.push('header:no-recheck');
const ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
if (ids.length < 2) bad.push(`header:ids=${ids.length}`);

if (lines.length > 121) bad.push(`lines=${lines.length - 1} (>120)`);
if (/__[A-Z]+__|TODO|TBD|<placeholder>/i.test(text)) bad.push('template-token');
// no unsupported number: every percentage/digit-bearing claim sentence must be in the body sections,
// checked by hand in the report; the machine check covers the quote set only.

for (const r of rows) console.log(r);
console.log(`SOURCES: ${ids.join(',')}`);
console.log(`LINES: ${lines.length - 1} (<=120)  BULLETS: ${bullets.length} (>=8, both sources)`);
if (bad.length) {
  console.log(`QUOTE_VERIFY: FAIL ${bad.length} -> ${bad.join(' | ')}`);
  process.exit(1);
}
console.log('QUOTE_VERIFY: PASS');
