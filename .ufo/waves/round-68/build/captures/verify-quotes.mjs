#!/usr/bin/env node
/**
 * verify-quotes.mjs — checks that the quotes the round-68 scribe/scout seats pinned are actually
 * present in the materialised captures, using the frozen C2 counter's own normalisation and
 * word-boundary matcher (deprec68-probe.mjs `norm`/`nwords`/`wb`), so a PASS here means M4/M5 on the
 * capture side. ABSENT rows encode what the seats' briefs demanded but the capture does not carry.
 *
 *   node .ufo/waves/round-68/build/captures/verify-quotes.mjs
 *   node .ufo/waves/round-68/build/captures/verify-quotes.mjs --entry <entry.md>
 *
 * --entry mode parses the `- S### — "quote"` bullets of a candidate entry's `## Located quotes`
 * section (the exact shape M4 accepts) and checks each bullet against the capture bound to that S-id
 * here, so the L1 can re-run it on the landed entry. A bullet that only an EXTRA capture carries is
 * reported as such: that S-id's row URL must then be the extra capture's URL, or M4 will MISS.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// --- verbatim copies of the frozen counter's helpers (deprec68-probe.mjs:120-128)
const norm = (s) => String(s)
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();
const nwords = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const wb = (quote, text) => { const q = norm(quote); if (!q) return false; return new RegExp(`(^|[^A-Za-z0-9])${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z0-9]|$)`).test(norm(text)); };

const cap = (f) => { try { return readFileSync(join(HERE, f), 'utf8'); } catch { return null; } };

// [row id, capture file, quote, expectation, source of the quote]
const CASES = [
  ['S207', 'deprecated-2026-07-28.md', 'First revision released on or after 2027-07-28', 'present', 'K68ScoutS207/quotes.txt Q1 (M4 needs a 2027-07-28 quote)'],
  ['S207', 'deprecated-2026-07-28.md', 'Three months after SEP-2596 reaches Final', 'present', 'K68ScoutS207/quotes.txt Q2 (M4 needs a Three-months quote)'],
  ['S207', 'deprecated-2026-07-28.md', 'This registry is a derived view kept consistent with the per-feature deprecation notices and changelog entries, which are the normative records.', 'present', 'K68ScoutS207/quotes.txt Q3'],
  ['S207', 'deprecated-2026-07-28.md', 'The HTTP+SSE transport and the `includeContext` values were already described as deprecated before the lifecycle policy existed', 'present', 'K68ScoutS207/quotes.txt Q4'],
  ['S207', 'deprecated-2026-07-28.md', 'No features have been removed under this policy yet.', 'present', 'K68ScoutS207/quotes.txt Q5'],
  ['S207', 'deprecated-2026-07-28.md', 'new implementations **SHOULD NOT** adopt it', 'present', 'K68ScoutS207/quotes.txt Q6'],

  ['S208', 'feature-lifecycle.md', 'The minimum deprecation window is counted from that release.', 'present', 'K68ScribeRows/rows.md S208 anchor (line 93)'],
  ['S208', 'feature-lifecycle.md', 'the number of months, at least twelve, that the feature must remain Deprecated before it is eligible for removal', 'present', 'K68ScribeRows/rows.md S208 anchor (lines 68-70)'],
  ['S208', 'feature-lifecycle.md', 'not from the date the SEP reaches Final', 'present', 'K68ScribeRows/rows.md S208 anchor (lines 71-73)'],
  ['S208', 'feature-lifecycle.md', 'Three months after', 'absent', 'S208 seat brief demanded this quote of THIS page — it is not there'],

  ['S209', 'sse-v18.12.6.ts', 'export class LegacySseConnectionTimeoutError extends Error {', 'present', 'K68ScoutS209/quotes.txt 1'],
  ['S209', 'sse-v18.12.6.ts', 'Legacy SSE endpoint timeout after ${timeoutMs}ms', 'present', 'K68ScoutS209/quotes.txt 2'],
  ['S209', 'sse-v18.12.6.ts', 'Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05.', 'present', 'K68ScoutS209/quotes.txt 3'],
  ['S209', 'sse-v18.12.6.ts', 'export class LegacySseTransport implements MCPTransport {', 'present', 'K68ScoutS209/quotes.txt 4'],
  ['S209', 'sse-v18.12.6.ts', 'async connect(signal?: AbortSignal): Promise<void> {', 'present', 'K68ScoutS209/quotes.txt 5'],
  ['S209', 'sse-v18.12.6.ts', 'async close(): Promise<void> {', 'present', 'K68ScoutS209/quotes.txt 6'],

  ['S212', 'sse-v18.13.1.ts', 'export class LegacySseTransport implements MCPTransport {', 'present', 'same class at the installed-release tag'],
  ['S212', 'sse-v18.13.1.ts', 'Legacy MCP HTTP+SSE transport from protocol revision 2024-11-05.', 'present', 'same doc comment at the installed-release tag'],

  ['S210', 'sep2596.md', 'Three months after this SEP is Final', 'present', 'sep2596.md:257 (grace table cell)'],
  ['S210', 'sep2596.md', 'three-month grace period from the date this SEP reaches Final before it is eligible for removal', 'present', 'sep2596.md:249-250 (grace clause)'],
  ['S210', 'sep2596.md', 'Both features were publicly deprecated well over twelve months before this SEP', 'present', 'sep2596.md:247-248 (rationale for the grace)'],
  ['S210', 'sep2596.md', 'Status | Final', 'present', 'sep2596.md:25 (status table)'],
  ['S210', 'sep2596.md', '2026-06-03', 'absent', 'the Final DATE is not on the SEP page — it is only in S213'],

  ['S211', 'transports-2025-11-05.md', 'Clients and servers can maintain backwards compatibility with the deprecated', 'present', 'transports:281 (prose before the inline link)'],
  ['S211', 'transports-2025-11-05.md', 'the old HTTP+SSE transport, and should use that transport for all subsequent', 'present', 'transports:305 (plain prose naming HTTP+SSE)'],
  ['S211', 'transports-2025-11-05.md', 'This replaces the [HTTP+SSE transport]', 'absent', 'blockquote + inline link breaks the counter matcher (norm keeps > and link syntax)'],
  ['S211', 'transports-2025-11-05.md', '2025-11-05', 'absent', 'content is the 2025-11-25 revision; the 2025-11-05 path 404s'],

  ['S213', 'pr2596-commits-api.json', 'SEP-2596: condense Removing a feature per review', 'present', 'PR #2596 commit 027f22cbc946 (2026-05-18)'],
  ['S213', 'pr2596-commits-api.json', '2026-05-18T17:31:18Z', 'present', 'PR head commit de05e1ef (last of 18)'],
  ['S213', 'pr2596-commits-api.json', 'Mark SEPs as final', 'absent', 'the Final flip is NOT in the PR commit list'],
  ['S213', 'pr2596-commits-api.json', '2026-06-03', 'absent', 'the Final date is NOT in the PR commit list'],

  ['S213b', 'commit-183238ddac.json', 'Mark SEPs as final', 'present', 'commits-API record of 183238ddac (extra capture)'],
  ['S213b', 'commit-183238ddac.json', '2026-06-03T20:45:19Z', 'present', 'commit committer/author date (extra capture)'],
  ['S213b', 'commit-183238ddac.json', 'docs/seps/2596-spec-feature-lifecycle-and-deprecation.mdx', 'present', 'files[9] of the flip commit (extra capture)'],

  ['S210x', 'pr2596-api.json', '2026-05-18T18:09:21Z', 'present', 'PR #2596 merged_at (extra capture; the page HTML is not byte-stable)'],
];

let fail = 0;
const entryAt = process.argv.indexOf('--entry');
if (entryAt >= 0) {
  // --- --entry mode: check a candidate entry's ## Located quotes bullets against the captures
  const BIND = { S207: ['deprecated-2026-07-28.md'], S208: ['feature-lifecycle.md'], S209: ['sse-v18.12.6.ts'], S210: ['sep2596.md'],
    S211: ['transports-2025-11-05.md'], S212: ['sse-v18.13.1.ts'], S213: ['pr2596-commits-api.json', 'commit-183238ddac.json', 'pr2596-api.json'] };
  const file = process.argv[entryAt + 1];
  let text = null;
  try { text = readFileSync(file, 'utf8'); } catch { console.log(`ENTRY-UNREADABLE ${file}`); process.exit(2); }
  const L = text.split('\n');
  const at = L.findIndex((l) => /^##\s+Located quotes\s*$/.test(l.trim()));
  if (at < 0) { console.log('ENTRY_MODE: FAIL section-absent'); process.exit(1); }
  const sec = [];
  for (let i = at + 1; i < L.length && !/^##\s/.test(L[i]); i += 1) sec.push(L[i]);
  const bullets = sec.map((l) => /^-\s+(S\d{3,})\s+—\s+"(.+)"\s*$/.exec(l.trim())).filter(Boolean).map((m) => ({ id: m[1], quote: m[2] }));
  const seen = new Set();
  for (const b of bullets) {
    const files = BIND[b.id] || [];
    const w = nwords(b.quote);
    if (!files.length) { console.log(`skip ${b.id} (no capture bound here; S201-S206 are out of this seat's scope)`); continue; }
    let hit = null;
    for (const f of files) { const t = cap(f); if (t != null && wb(b.quote, t)) { hit = f; break; } }
    const ok = !!hit && w <= 25;
    if (!ok) fail += 1;
    seen.add(b.id);
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${b.id} words=${String(w).padStart(2)}${w > 25 ? ' OVER-25-WORDS' : ''} ${hit ? `in ${hit}` : `NOT in ${files.join(' | ')}`}  ${JSON.stringify(b.quote).slice(0, 80)}`);
  }
  for (const id of Object.keys(BIND)) if (!seen.has(id)) console.log(`note ${id} has no bullet in this entry (M4 requires >= 1 per cited row)`);
  console.log(`\nENTRY_MODE: ${fail === 0 ? 'PASS' : 'FAIL'} bullets=${bullets.length} failed=${fail} entry=${file}`);
  process.exit(fail === 0 ? 0 : 1);
}

for (const [id, file, quote, expect, source] of CASES) {
  const text = cap(file);
  if (text == null) { console.log(`MISSING-CAPTURE ${id} ${file}`); fail += 1; continue; }
  const found = wb(quote, text);
  const w = nwords(quote);
  const ok = (expect === 'present') === found;
  const over = w > 25 ? ' OVER-25-WORDS' : '';
  if (!ok) fail += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${id} ${expect === 'present' ? 'present' : 'absent '} words=${String(w).padStart(2)}${over} ${JSON.stringify(quote).slice(0, 88)}  <- ${source}`);
}
console.log(`\nVERIFY_QUOTES: ${fail === 0 ? 'PASS' : 'FAIL'} cases=${CASES.length} failed=${fail}`);
process.exit(fail === 0 ? 0 : 1);
