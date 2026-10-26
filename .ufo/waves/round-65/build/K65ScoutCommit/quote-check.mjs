// usage: node quote-check.mjs  (run from capture-adjacent build dir); norm() copied from probe/omp65-probe.mjs:57-64
import {readFileSync} from 'node:fs';
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const d = new URL('.', import.meta.url).pathname;
const P = norm(readFileSync(d + 'capture/10bce690.patch')), H = norm(readFileSync(d + 'capture/commit-page.html'));
for (const l of readFileSync(d + 'S203-quotes.md', 'utf8').trim().split('\n')) {
  const q = /"(.*)"\s*$/.exec(l)[1];
  console.log(q.split(/\s+/).length + 'w', 'patch=' + P.includes(norm(q)), 'html=' + H.includes(norm(q)), '2025-11-25=' + q.includes('2025-11-25'));
}
