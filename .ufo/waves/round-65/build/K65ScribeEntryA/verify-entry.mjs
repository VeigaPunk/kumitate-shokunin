import { readFileSync } from 'node:fs';
const DRAFT = process.argv[2], LIVE = process.argv[3];
const B = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/';
const cap = {
  S201: B + 'K65ScoutTypesTs/capture/types.ts',
  S202: B + 'K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md',
  S203: B + 'K65ScoutCommit/capture/10bce690.patch',
  S204: B + 'K65ScoutTagVersion/capture/client.ts',
  S205: B + 'K65ScribeEntryA/capture/zai.ts',
  S206: B + 'K65ScribeEntryA/capture/http.ts',
};
const live = { S201: LIVE + '/live-S201.ts', S202: LIVE + '/live-S202.md', S203: LIVE + '/live-S203.patch', S204: LIVE + '/live-S204.ts', S205: LIVE + '/live-S205.ts', S206: LIVE + '/live-S206.ts' };
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const text = readFileSync(DRAFT, 'utf8');
// O1
const head = text.split('\n').slice(0, 14).join('\n');
const hasSrc = /^source:\s*S\d{3,}/m.test(head);
const hasVer = /^verified-at:\s*2026-10-25/m.test(head);
const hasRec = /^recheck:\s*\S+/m.test(head);
const ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
console.log(`O1 headLines=14 src=${hasSrc} verified=${hasVer} recheck=${hasRec} ids=${ids.join(',')}`);
// O4
const bullets = [];
const at = text.search(/^##\s+Located quotes\s*$/m);
for (const l of text.slice(at).split('\n').slice(1)) { if (/^##\s/.test(l)) break; const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l); if (m) bullets.push({ id: m[1], q: m[2] }); }
const bad = [];
if (bullets.length < 6) bad.push(`bullets=${bullets.length}`);
for (const id of ids) if (!bullets.some((b) => b.id === id)) bad.push(`${id}:no-bullet`);
if (!bullets.some((b) => b.q.includes('2025-11-25'))) bad.push('no-2025-11-25-quote');
const capText = new Map(Object.entries(cap).map(([k, p]) => [k, norm(readFileSync(p))]));
const liveText = new Map(Object.entries(live).map(([k, p]) => [k, norm(readFileSync(p))]));
for (const b of bullets) {
  const w = b.q.trim().split(/\s+/).length;
  if (w > 25) bad.push(`${b.id}:words=${w}`);
  if (!ids.includes(b.id)) { bad.push(`${b.id}:not-a-source`); continue; }
  if (!capText.get(b.id).includes(norm(b.q))) bad.push(`${b.id}:capture-miss(${b.q.slice(0, 40)})`);
  if (!liveText.get(b.id).includes(norm(b.q))) bad.push(`${b.id}:live-miss(${b.q.slice(0, 40)})`);
}
console.log(`O4 bullets=${bullets.length} bad=${bad.length} ${bad.join(' | ')}`);
// also O3 sha check of captures against my pin drafts
import { createHash } from 'node:crypto';
for (const [k, p] of Object.entries(cap)) { const b = readFileSync(p); console.log(`O3 ${k} bytes=${b.length} sha=${createHash('sha256').update(b).digest('hex')}`); }
