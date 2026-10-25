import { readFileSync } from 'node:fs';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const entry = readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63ScribeEntryDraftB/entry.md','utf8');
const bullets=[]; const at=entry.search(/^##\s+Located quotes\s*$/m);
for (const l of entry.slice(at).split('\n').slice(1)) { if(/^##\s/.test(l))break; const m=/^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l); if(m)bullets.push({id:m[1],q:m[2]}); }
const live={S196:norm(readFileSync('live-s196.md')),S197:norm(readFileSync('live-s197.html'))};
let ok=0; for(const b of bullets){const f=live[b.id].includes(norm(b.q)); if(f)ok++; console.log(`${f?'PASS':'FAIL'} live ${b.id} :: ${b.q.slice(0,60)}`);}
console.log(`LIVE_PROOF: ${ok}/${bullets.length} bullets found in today's live fetch`);
process.exit(ok===bullets.length?0:1);
