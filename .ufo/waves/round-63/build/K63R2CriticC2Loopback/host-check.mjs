#!/usr/bin/env node
// host-check.mjs — K63R2CriticC2Loopback supplementary check (NOT a change to the frozen probe).
// For a given rev, reads the C2 entry (default corpus/knowledge/multi-agent-coordinator-topologies.md)
// and the ## Registry in corpus/SOURCES.md, then fails when any cited row's URL host
//   A. is not http/https / is file: (scheme), or
//   B. is not in the host set already used by OTHER tier-A rows at that rev, or
//   C. resolves (DNS) to loopback/private/link-local/unique-local/unspecified, or is unresolvable.
// Usage: node host-check.mjs <lane-dir> <rev> [--entry <path>]
// Prints `HOST_CHECK: PASS` / `HOST_CHECK: FAIL <reasons>`; exit 0/1.
import { spawnSync } from 'node:child_process';
import * as dns from 'node:dns';

const RULE = 'HOST_CHECK';
const argv = process.argv.slice(2);
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1] === '--entry'));
if (pos.length < 2) { process.stderr.write('usage: host-check.mjs <lane-dir> <rev> [--entry path]\n'); process.exit(64); }
const lane = pos[0];
const rev = pos[1];
const ENTRY = argv.includes('--entry') ? argv[argv.indexOf('--entry') + 1] : 'corpus/knowledge/multi-agent-coordinator-topologies.md';

const rv = spawnSync('git', ['-C', lane, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8' });
if (rv.status !== 0) { process.stdout.write(`HOST_CHECK: FAIL rev-unreadable\n`); process.exit(2); }
const full = rv.stdout.trim();
const show = (p) => spawnSync('git', ['-C', lane, 'show', `${full}:${p}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const entryRaw = show(ENTRY);
if (entryRaw.status !== 0) { process.stdout.write(`HOST_CHECK: FAIL entry-absent(${ENTRY})\n`); process.exit(2); }
const srcRaw = show('corpus/SOURCES.md');
if (srcRaw.status !== 0) { process.stdout.write(`HOST_CHECK: FAIL sources-absent\n`); process.exit(2); }

// cited ids (mirror frozen probe T1 head scan)
const text = entryRaw.stdout;
const head = text.split('\n').slice(0, 14).join('\n');
const ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];

// registry rows
const lines = srcRaw.stdout.split('\n');
const start = lines.findIndex((l) => /^ {0,3}##\s+Registry\b/.test(l));
let end = lines.length;
for (let i = start + 1; i < lines.length && start >= 0; i += 1) if (/^ {0,3}##\s/.test(lines[i])) { end = i; break; }
const cells = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
const rows = new Map();
for (let i = start + 1; i < end; i += 1) {
  const m = /^ {0,3}\|\s*(S\d{3,})\s*\|/.exec(lines[i]);
  if (m) rows.set(m[1], lines[i]);
}
const hostOf = (line) => {
  const c = cells(line);
  if (c.length < 3) return null;
  const m = /(https?:\/\/[^\s|)]+)/.exec(c[2]);
  if (!m) return null;
  try { return new URL(m[1]).hostname.toLowerCase(); } catch { return null; }
};

// host set used by OTHER tier-A rows (exclude cited rows themselves)
const tierA = new Set();
for (const [id, line] of rows) {
  if (ids.includes(id)) continue;
  const c = cells(line);
  if (c.length >= 5 && c[4] === 'A') {
    const h = hostOf(line);
    if (h) tierA.add(h);
  }
}

const isPrivateIp = (ip) => {
  if (ip.includes(':')) {
    if (ip === '::' || ip === '::1') return true;
    const low = ip.toLowerCase();
    if (low.startsWith('fe80:')) return true;            // link-local
    if (/^f[c-d]/.test(low)) return true;               // fc00::/7 unique-local
    const m4 = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(ip);
    if (m4) return isPrivateIp(m4[1]);
    return false;
  }
  const [a, b] = ip.split('.').map(Number);
  if (a === 0) return true;                              // unspecified
  if (a === 127) return true;                            // loopback
  if (a === 10) return true;                             // RFC1918
  if (a === 172 && b >= 16 && b <= 31) return true;      // RFC1918
  if (a === 192 && b === 168) return true;               // RFC1918
  if (a === 169 && b === 254) return true;               // link-local
  if (a === 100 && b >= 64 && b <= 127) return true;     // CGNAT
  return false;
};

const bad = [];
for (const id of ids) {
  const line = rows.get(id);
  if (!line) { bad.push(`${id}:not-in-registry`); continue; }
  const c = cells(line);
  const m = /(https?:\/\/[^\s|)]+)/.exec(c[2] || '');
  if (!m) { bad.push(`${id}:no-url`); continue; }
  let u; try { u = new URL(m[1]); } catch { bad.push(`${id}:url-parse`); continue; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') { bad.push(`${id}:scheme(${u.protocol})`); continue; }
  const h = u.hostname.toLowerCase();
  if (!tierA.has(h)) bad.push(`${id}:host-not-in-registry(${h})`);
  let addrs; try { addrs = await dns.promises.lookup(h, { all: true }); } catch { bad.push(`${id}:unresolvable(${h})`); continue; }
  const priv = addrs.filter((a) => isPrivateIp(a.address)).map((a) => a.address);
  if (priv.length) bad.push(`${id}:private-resolves(${priv.join(',')})`);
}

const ok = bad.length === 0 && ids.length > 0;
process.stdout.write(`HOST_CHECK: ${ok ? 'PASS' : 'FAIL'}${ok ? '' : ` ${bad.join(';')}`} rev=${full} ids=${ids.join(',')} tierA-hosts=${tierA.size}\n`);
process.exit(ok ? 0 : 1);
