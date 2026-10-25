import { readFileSync, writeFileSync } from 'node:fs';

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const base = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63Capture';
const html = readFileSync(base + '/arxiv-2512.08296v3.html', 'utf8');
const bail = readFileSync(base + '/bailian-managed-agents-multiagent.md', 'utf8');
writeFileSync('/tmp/kumitate-r63/K63ScoutStagedDiff/arxiv.norm.txt', norm(html));
writeFileSync('/tmp/kumitate-r63/K63ScoutStagedDiff/bailian.norm.txt', norm(bail));
console.log('arxiv norm len', norm(html).length);
console.log('bailian norm len', norm(bail).length);
