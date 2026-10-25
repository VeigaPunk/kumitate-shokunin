#!/usr/bin/env node
// verify-quotes.mjs — K64ExecRowsDraft: check the draft rows' located quotes with the
// frozen probe's own normaliser (jj64-probe.mjs:55-63) against (a) the committed capture
// bytes in this build dir and (b) a fresh live fetch with the probe's exact curl argv.
// Read-only; no network except the same GETs J5 performs.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const ROWS = [
  { id: 'S198', capture: 'concurrency-latest.html', url: 'https://docs.jj-vcs.dev/latest/technical/concurrency/', quotes: [
    'The most important piece in the lock-free design is the "operation log". That is what allows us to detect and merge divergent operations.',
    'The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace.',
    'When a command starts, it loads the repo at the latest operation.',
  ] },
  { id: 'S199', capture: 'firefox-jujutsu.html', url: 'https://firefox-source-docs.mozilla.org/contributing/jujutsu.html', quotes: [
    'A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing.',
    'We recommend this default because some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale.',
  ] },
  { id: 'S200', capture: 'working-copy-latest.html', url: 'https://docs.jj-vcs.dev/latest/working-copy/', quotes: [
    'Use jj workspace remove to forget a workspace and remove its directory from disk.',
    'Tracked changes are snapshotted before the directory is removed, but ignored files in that directory are deleted.',
    'The main workspace cannot be removed.',
  ] },
];

let bad = 0;
for (const row of ROWS) {
  const bytes = readFileSync(join(HERE, row.capture));
  const cap = norm(bytes);
  const live = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-jj64)', row.url], { maxBuffer: 128 * 1024 * 1024 });
  const liveText = live.status === 0 ? norm(live.stdout) : null;
  console.log(`${row.id} capture=${row.capture} sha256=${createHash('sha256').update(bytes).digest('hex')} bytes=${bytes.length} live-curl-exit=${live.status}`);
  for (const q of row.quotes) {
    const words = q.trim().split(/\s+/).length;
    const inCap = cap.includes(norm(q));
    const inLive = liveText ? liveText.includes(norm(q)) : false;
    const ok = words <= 25 && inCap && inLive;
    if (!ok) bad += 1;
    console.log(`  ${ok ? 'PASS' : 'FAIL'} words=${words} capture=${inCap} live=${inLive} "${q}"`);
  }
}
console.log(`QUOTE_CHECK: ${bad === 0 ? 'PASS' : 'FAIL'} quotes=${ROWS.reduce((n, r) => n + r.quotes.length, 0)} failing=${bad}`);
process.exit(bad === 0 ? 0 : 1);
