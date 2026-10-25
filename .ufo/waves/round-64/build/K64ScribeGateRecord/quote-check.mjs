// K64ScribeGateRecord — re-open S198/S199/S200 and prove every quote occurs.
// norm() is copied byte-for-byte from .ufo/waves/round-64/probe/jj64-probe.mjs:56-64.
// Usage: node quote-check.mjs [entryDraft]
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const URLS = {
  S198: 'https://docs.jj-vcs.dev/latest/technical/concurrency/',
  S199: 'https://firefox-source-docs.mozilla.org/contributing/jujutsu.html',
  S200: 'https://docs.jj-vcs.dev/latest/working-copy/',
};
// The three quotes the lesson's Gate records, one per new row.
const GATE = {
  S198: 'That is what allows us to detect and merge divergent operations.',
  S199: 'A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing.',
  S200: "When you modify workspace A's working-copy commit from workspace B, workspace A's working copy will become stale.",
};

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const live = {};
for (const [id, url] of Object.entries(URLS)) {
  const r = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', url], { maxBuffer: 128 * 1024 * 1024 });
  if (r.status !== 0) { console.log(`${id} UNREACHABLE ${url} status=${r.status}`); process.exit(1); }
  live[id] = norm(r.stdout);
  console.log(`${id} live-bytes=${r.stdout.length} url=${url}`);
}
let bad = 0;
for (const [id, q] of Object.entries(GATE)) {
  const w = q.trim().split(/\s+/).length;
  const hit = live[id].includes(norm(q));
  if (!hit || w > 25) bad++;
  console.log(`GATE ${id} words=${w} hit=${hit}`);
}
// Every bullet in the entry draft's ## Located quotes must occur too (calibration beyond the three).
const draft = process.argv[2];
if (draft) {
  const text = readFileSync(draft, 'utf8');
  const at = text.search(/^##\s+Located quotes\s*$/m);
  const rest = at >= 0 ? text.slice(at).split('\n').slice(1) : [];
  let n = 0;
  for (const l of rest) {
    if (/^##\s/.test(l)) break;
    const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
    if (!m) continue;
    n++;
    const w = m[2].trim().split(/\s+/).length;
    const hit = live[m[1]] ? live[m[1]].includes(norm(m[2])) : false;
    if (!hit || w > 25) bad++;
    console.log(`BULLET ${m[1]} words=${w} hit=${hit}`);
  }
  console.log(`BULLETS checked=${n}`);
}
console.log(bad === 0 ? 'QUOTE_CHECK: PASS' : `QUOTE_CHECK: FAIL bad=${bad}`);
process.exit(bad === 0 ? 0 : 1);
