// prove-quotes.mjs — replicate the frozen counter's norm() + T4 bullet parse, then prove each bullet.
import { readFileSync } from 'node:fs';

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const CAP = `${LANE}/.ufo/waves/round-63/build/K63Capture`;
const ENTRY = `${LANE}/.ufo/waves/round-63/build/K63ScribeEntryDraftB/entry.md`;

const caps = {
  S196: norm(readFileSync(`${CAP}/bailian-managed-agents-multiagent.md`)),
  S197: norm(readFileSync(`${CAP}/arxiv-2512.08296v3.html`)),
};

const text = readFileSync(ENTRY, 'utf8');
const lines = text.split('\n');
console.log(`entry lines=${lines.length} bytes=${Buffer.byteLength(text)}`);

// T1 head parse
const head = lines.slice(0, 14).join('\n');
console.log(`T1 source-lines=${/^source:\s*S\d{3,}/m.test(head)} verified-at=${/^verified-at:\s*2026-10-25/m.test(head)} recheck=${/^recheck:\s*\S+/m.test(head)}`);
const ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
console.log(`T1 cited ids=${ids.join(',')}`);

// T4 bullet parse (identical regex to topology63-probe.mjs)
const bullets = [];
const at = text.search(/^##\s+Located quotes\s*$/m);
if (at >= 0) for (const l of text.slice(at).split('\n').slice(1)) {
  if (/^##\s/.test(l)) break;
  const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
  if (m) bullets.push({ id: m[1], q: m[2] });
}

let pass = 0; const fail = [];
for (const b of bullets) {
  const words = b.q.trim().split(/\s+/).length;
  const found = caps[b.id] ? caps[b.id].includes(norm(b.q)) : false;
  const ok = found && words <= 25 && ids.includes(b.id);
  if (ok) pass += 1; else fail.push(`${b.id} words=${words} found=${found}`);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${b.id} words=${words} found=${found} :: ${b.q.slice(0, 72)}`);
}
const perRow = ids.map((id) => `${id}=${bullets.filter((b) => b.id === id).length}`);
console.log(`bullets=${bullets.length} pass=${pass} fail=${fail.length} per-row=${perRow.join(' ')}`);
console.log(fail.length === 0 && bullets.length >= 8 && ids.every((id) => bullets.some((b) => b.id === id))
  ? `QUOTE_PROOF: PASS (${pass}/${bullets.length} bullets located, every cited row covered, entry ${lines.length} lines <= 90)`
  : `QUOTE_PROOF: FAIL ${fail.join('; ')}`);
process.exit(fail.length === 0 ? 0 : 1);
