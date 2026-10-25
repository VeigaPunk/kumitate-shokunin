#!/usr/bin/env node
// norm.mjs — reference normaliser copied semantics from topology63-probe.mjs
import { readFileSync } from 'node:fs';
export const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const count = (hay, needle) => { let n = 0, i = 0; while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; } return n; };
export const occurrences = count;
if ((process.argv[1] || '').endsWith('norm.mjs')) {
  const file = process.argv[2];
  const t = norm(readFileSync(file));
  for (const q of process.argv.slice(3)) {
    const nq = norm(q);
    console.log(`${count(t, nq)}\t${nq.length > 0 ? '' : ''}${nq}`);
  }
}
