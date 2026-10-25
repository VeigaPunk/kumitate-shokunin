# K63SentinelScope — proposed guards (patch text; the L1 integrates, this seat does not edit frozen files)

## G1 — `probe/make-inline-controls.mjs` must refuse to delete outside its own output

Current (lines 17–19):

```js
const out = resolve(process.argv[2] || '');
if (!process.argv[2]) { … exit(64); }
rmSync(out, { recursive: true, force: true });
```

Proposed replacement:

```js
const arg = process.argv[2];
if (!arg) { process.stderr.write('usage: make-inline-controls.mjs <out-dir>\n'); process.exit(64); }
const out = resolve(arg);
// containment: the generator owns exactly one tree, `<lane>/.ufo/waves/round-63/controls/inline`,
// or a scratch dir under /tmp. Anything else (the round dir, the lane root, /, $HOME) is a usage error.
const ALLOW = [
  resolve(import.meta.dirname, '..', 'controls', 'inline'),   // <round-63>/controls/inline
];
const inScratch = /^\/tmp\/kumitate-r63\/[A-Za-z0-9._-]+(\/|$)/.test(out);
if (!inScratch && !ALLOW.includes(out)) {
  process.stderr.write(`make-inline-controls: refusing to delete ${out} (not a controls/inline or /tmp/kumitate-r63 path)\n`);
  process.exit(64);
}
mkdirSync(out, { recursive: true });
for (const d of readdirSync(out, { withFileTypes: true })) if (d.isDirectory()) rmSync(join(out, d.name), { recursive: true, force: true });
```

The per-case `rmSync` (only directories directly under an owned `out`) removes the same fixtures without the
top-level recursive delete; a slip of one path component can no longer erase `plan.md`, `probe/` or the lane.

## G2 — no shell interpolation in the two counters/generators

`make-topology-controls.mjs:43`, `topology63-probe.mjs:53`, `inline63-probe.mjs:29` all run

```js
spawnSync('bash', ['-c', `git -C "${lane}" archive "${rev}" | tar -x -C "${T}"`]);
```

A `lane` argument containing `"` and `;` executes arbitrary commands (verified: `x";touch PWNED;"` created the file).
Replacement (no shell, no pipeline):

```js
const ar = spawnSync('git', ['-C', lane, 'archive', '--format=tar', rev], { maxBuffer: 256 * 1024 * 1024 });
if (ar.status !== 0) { /* archive-failed path as today */ }
const un = spawnSync('tar', ['-x', '-C', T], { input: ar.stdout, maxBuffer: 16 * 1024 * 1024 });
```

(`rev` must already be the resolved 40-hex hash, as it is in both probes.)

## G3 — T5 live-fetch arm (`topology63-probe.mjs:164–181`)

Threats verified today: a lane-written row may name any `http(s)` URL, including loopback
(`http://127.0.0.1:PORT/…` — fetched end-to-end, T5 passed), RFC1918 / `169.254.169.254` metadata; the
download is unbounded (8 MiB accepted; the only ceiling is `maxBuffer` 128 MiB); the normaliser is
quadratic on unclosed `<script>`/`<style>` (140 KB → 1.03 s, 280 KB → 4.11 s, 560 KB → 16.31 s), so a
hostile page hangs the counting command with no overall timeout. `file://` redirects are already refused
by curl 8.23's default `--proto-redir` (verified), so that path is closed.

```js
const LIVE_LIMIT = 8 * 1024 * 1024;
function publicHttpUrl(u) {
  let h; try { h = new URL(u).hostname; } catch { return false; }
  if (h === 'localhost' || /\.(localhost|local|internal|lan)$/i.test(h)) return false;
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;          // this-net, private, loopback, multicast/reserved
    if (a === 169 && b === 254) return false;                                 // link-local (cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return false;                        // private
    if (a === 192 && b === 168) return false;                                 // private
    if (a === 100 && b >= 64 && b <= 127) return false;                       // CGNAT
    return true;
  }
  if (h.startsWith('[') || h.includes(':')) return false;                     // IPv6 literal: refuse outright
  return true;                                                                // see limit: no DNS pinning
}
…
const url0 = url[1];
if (!publicHttpUrl(url0)) { bad.push(`${id}:non-public-url`); continue; }
const r = spawnSync('curl', ['-fsSL', '--proto', '=https', '--proto-redir', '=https,http', '--max-redirs', '3',
  '--max-filesize', String(LIVE_LIMIT), '--connect-timeout', '10', '--max-time', '30', '--noproxy', '*',
  '-A', 'Mozilla/5.0 (kumitate-topology63)', url0], { maxBuffer: LIVE_LIMIT + 65536 });
if (r.status !== 0) { bad.push(`${id}:live-unreachable`); continue; }
live.set(id, norm(r.stdout.subarray(0, LIVE_LIMIT)));
```

and make `norm` linear on hostile input (greedy, single pass, bounded):

```js
const norm = (b) => {
  let s = b.toString('utf8').slice(0, LIVE_LIMIT);
  s = s.replace(/<(script|style)\b[^>]*>[\s\S]*<\/(script|style)>/gi, ' ')   // greedy: linear, no per-start backtracking
       .replace(/<[^>]+>/g, ' ');
  return s.replace(/&nbsp;|&#160;/g, ' ') /* …rest unchanged… */ .replace(/\s+/g, ' ').trim();
};
```

Residual limit to state in the plan: DNS names are not pinned to an IP, so a public-looking hostname that
resolves to a private address still reaches the internal network; closing that needs `dns.lookup` +
`curl --resolve <host>:<port>:<ip>`.

## G4 — validate seat names in `scripts/inline-dispatch-evidence.mjs`

`dispatch.taskCall.tasks[].name` is lane-authored and flows unvalidated into `FINDING …` lines (stdout) and
into `src.read(\`${base}/${wave}/${s.name}.md\`)` (path join). A name containing `\n` emits a second
`INLINE_DISPATCH: CLEAN (…)` line (verified); a name containing `..` reads outside the wave directory.

```js
// after `const names = tasks.map((t) => t.name);`
const badName = names.find((n) => !/^[A-Za-z0-9._-]{1,64}$/.test(String(n)));
if (badName !== undefined) return { code: 2, findings: ['DISPATCH_UNREADABLE'], unique: ['DISPATCH_UNREADABLE'],
  line: 'INLINE_DISPATCH: FAIL-CLOSED dispatch-seat-name-invalid' };
```

Fail-closed (code 2) rather than a finding keeps a forger from turning the check into a one-line edit.
