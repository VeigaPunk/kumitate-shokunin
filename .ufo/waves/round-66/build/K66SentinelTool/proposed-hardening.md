# Proposed hardening for `scripts/routed-ledger.mjs`

Draft only — **not applied**. Target blob: `scripts/routed-ledger.mjs` at
`621212bac37f8249c72ac982d1d6534cb8d60701`, sha256 `f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5`
(identical at lane HEAD `88041bc9` when this review ran). Line numbers are from that blob.
Every hunk is a **strengthening**: no rule is relaxed, no verdict that is DRIFT today becomes CLEAN
(the only verdict changes are DRIFT→DRIFT with a stricter path rule, and CLEAN→FAIL-CLOSED/DRIFT where
an out-of-root or aliased path was previously accepted).

---

## H1 — scrub the git environment (closes review findings -1 and -2)

Why: `spawnSync('git', …)` inherits `process.env`. `GIT_DIR` / `GIT_WORK_TREE` / `GIT_INDEX_FILE` /
`GIT_OBJECT_DIRECTORY` / `GIT_COMMON_DIR` override `-C` for every call, including the selftest's own
fixture repo, so `--selftest` commits a fixture tree into whatever repo the environment names and
`--rev` reads that repo instead of `--root`.

Insert after the imports (line 58):

```js
const GIT_ENV = (() => {
  const e = { ...process.env };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY',
    'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX']) delete e[k];
  e.GIT_OPTIONAL_LOCKS = '0';
  e.GIT_TERMINAL_PROMPT = '0';
  return e;
})();
```

Then add `env: GIT_ENV` to the four spawn sites — lines 140, 144, 154 and the selftest helper at 335:

```js
const r = spawnSync('git', ['-C', root, 'show', `${rev}:${p}`], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: GIT_ENV });
const r = spawnSync('git', ['-C', root, 'ls-tree', '--name-only', `${rev}:corpus/lessons`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: GIT_ENV });
const v = spawnSync('git', ['-C', root, 'rev-parse', '--verify', `${rev}^{commit}`], { encoding: 'utf8', env: GIT_ENV });
const g = (...a) => spawnSync('git', ['-C', D, ...a], { encoding: 'utf8', env: GIT_ENV });
```

`env` replaces the inherited environment wholly, so the fixture repo can no longer be redirected.

## H2 — realpath containment for the ledger and for answer paths (closes -3 and -4)

Why: line 215 is a *lexical* check (`normalize`, `isAbsolute`, `startsWith('..')`), so a symlink (or any
second path) inside the root reaches a file outside it; and the self-answer guard `p === ledgerNorm`
compares strings, so an alias of the ledger is accepted as an answer. Line 131 `join(root, p)` follows
`..` out of the root for `--ledger`.

Add near the top (needs `realpathSync`, `sep` from `node:path`, and `statSync`):

```js
import { sep } from 'node:path';
import { realpathSync, statSync } from 'node:fs';
const inside = (root, p) => {
  try {
    const rr = realpathSync(root); const rp = realpathSync(join(root, p));
    return rp === rr || rp.startsWith(rr.endsWith(sep) ? rr : rr + sep);
  } catch { return false; }
};
```

In `evaluate`, before reading the ledger (today line 171):

```js
if (isAbsolute(ledger) || normalize(ledger).split(/[\\/]/).includes('..') || !inside(root, ledger)) {
  return { code: 2, lines: [`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-outside-root:${ledger}`] };
}
```

Replace the answer guard at 215 with:

```js
const p = normalize(ans.path);
if (isAbsolute(ans.path) || p.startsWith('..') || !inside(root, ans.path)
    || same(realpathOf(root, p), ledgerReal) || spotReal.has(realpathOf(root, p))) {
  F('ANSWER_DEAD', `${where}:answer-path-not-allowed:${ans.path}`); continue;
}
```

where `ledgerReal = realpathSync(join(root, ledger))` and `spotReal` is the set of `realpathSync` of every
spot-check path — so a symlink or hardlink alias of the ledger or a spot-check is refused by identity,
not by name.

## H3 — linear raw-text stripper + per-item memo (closes -5)

Why: line 62's `<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>` is O(k·n) — a 192 KB string with 1800
unclosed `<style` tokens costs 108 ms, 1 MB with 9000 costs 5.0 s, and `norm(s.items[k - 1])` is
recomputed for **every row**, so one 1 MB item × 20 rows did not finish in 45 s.

Replace line 62 with a single left-to-right scan:

```js
const stripRaw = (s) => {
  const t = String(s); let out = ''; let i = 0;
  for (;;) {
    const a = t.indexOf('<script', i); const b = t.indexOf('<style', i);
    const open = a < 0 ? b : (b < 0 ? a : Math.min(a, b));
    if (open < 0) return out + t.slice(i);
    const tag = open === a ? 'script' : 'style';
    const gt = t.indexOf('>', open);
    if (gt < 0) return out + t.slice(i);
    out += t.slice(i, open);
    const close = t.indexOf(`</${tag}`, gt + 1);
    if (close < 0) return out + t.slice(open);     // unclosed: keep the raw remainder, as today
    const end = t.indexOf('>', close);
    i = end < 0 ? t.length : end + 1;
  }
};
```

and use `stripRaw(s)` in place of the regex inside `norm`. Then memoise the item text in `evaluate`
(today line 214):

```js
const nrm = new Map();
const normItem = (n, k) => { const key = `${n}#${k}`; if (!nrm.has(key)) nrm.set(key, norm(s.items[k - 1])); return nrm.get(key); };
...
if (!normItem(n, k).includes(norm(row.quote))) { … }
```

## H4 — bound the ledger read (closes -6)

```js
try { if (statSync(join(root, ledger)).size > 8 * 1024 * 1024) return { code: 2, lines: [`ROUTED_LEDGER: FAIL-CLOSED reason=ledger-too-large:${ledger}`] }; } catch { /* absent is handled below */ }
```

## H5 — selftest failure shape and cleanup (closes -7)

Line 252 and the end of `selftest()`:

```js
let T;
try { T = mkdtempSync(join(tmpdir(), 'routed-ledger-st.')); }
catch (e) { process.stdout.write(`ROUTED_LEDGER_SELFTEST: FAIL (0/0) :: tmpdir-unwritable:${e.code}\n`); return 1; }
process.on('exit', () => { try { rmSync(T, { recursive: true, force: true }); } catch {} });
```

## H6 — belt-and-braces on option-looking values (optional; -8 was closed already)

At line 341, reject a value that starts with `-` for `--rev`/`--ledger`/`--root` (`throw new Error(\`${a} needs a value\`)`).
The probe shows git already fails closed on every single-dash rev, so this changes no current verdict.

---

## Selftest cases this hardening should add (the ratchet's "new selftest case" requirement)

1. `GIT_DIR` set to a second repo → `--selftest` must leave that repo's `rev-list --count` unchanged.
2. A symlink inside the root pointing outside → `ANSWER_DEAD` (today CLEAN).
3. A hardlink/symlink alias of the ledger as an answer → `ANSWER_DEAD` (today accepted).
4. `--ledger ../x` → `FAIL-CLOSED reason=ledger-outside-root` (today CLEAN).
5. A 1 MB item with 9000 unclosed `<style` × 20 rows → completes < 2 s (today > 45 s).
