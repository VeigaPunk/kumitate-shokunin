# Proposed strengthening of the frozen H65 counter (patch text — L1 integrates; nothing here relaxes a check)

Target: `.ufo/waves/round-65/probe/harm65-probe.mjs` at `2ca91a0` (frozen; I did not edit it). Every hunk below is
monotone: it can only turn a HELD into a MISS, never the reverse. Each hunk closes a channel proved in
`findings` of `.ufo/waves/round-65/w1/K65ReviewProbeH65.md` with a running stub.

## P1 — make every probe git call and every `git archive` ignore replace refs (closes the replace-ref channel)

Evidence: in a throwaway fixture, `git -C D replace C1 C2; git -C D archive C1 | tar -xO f` printed `B`
(the replacement's bytes), and `git -C D rev-parse --verify C1^{commit}` printed C2's hash. So a 40-hex pair pin does
not pin *content* once `refs/replace` exists, and `archive()` (line 50) honours it. The tool's own sandbox
(`git clone` + `checkout`) does **not** inherit `refs/replace`, so the two legs can be made to read different histories.

```diff
-const git = (dir, args, o = {}) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 64 << 20, ...o });
+const GIT_ENV = { ...process.env, GIT_NO_REPLACE_OBJECTS: '1' };
+const git = (dir, args, o = {}) => spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 64 << 20, env: GIT_ENV, ...o });
@@ const archive = (rev) => {
-  const r = spawnSync('bash', ['-c', `git -C "${lane}" archive "${rev}" | tar -x -C "${T}"`], { encoding: 'utf8' });
+  const r = spawnSync('bash', ['-c', `GIT_NO_REPLACE_OBJECTS=1 git -C "${lane}" archive "${rev}" | tar -x -C "${T}"`], { encoding: 'utf8' });
```

plus, right after `const full = rv.stdout.trim();`:

```js
const repl = git(lane, ['for-each-ref', '--format=%(refname)', 'refs/replace']).stdout.trim();
if (repl) { process.stdout.write(`HARM65_UNMET held=0/5 checks=5 rev=${full} rule=${RULE} | replace-refs-present\n`); done(2); }
```

## P2 — run the subject from a copy that has no path to the answer key (H2/H3/H5)

The archive the tool executes from (`.ufo/waves/round-65/controls/harm/case-*/spec.json`,
`.ufo/waves/round-65/base/harm-pair*-freeze.txt`) is readable from `dirname(dirname(import.meta.url))`.
`stub-blind-echo.mjs` reads exactly those two and scores **5/5**.

```diff
 const TOOL = ['node', join(A, 'scripts/harm-matrix.mjs')];
+const toolDir = tmp('harm65.tool.');
+copyFileSync(TOOL[1], join(toolDir, 'harm-matrix.mjs'));
+const TOOL_ISO = ['node', join(toolDir, 'harm-matrix.mjs')];
```

then use `TOOL_ISO` for H1/H2/H3/H4-real/H5, and give H5 the registry explicitly:
`matrixRun(TOOL_ISO, ROUND_BASE, full, ['--gates', join(A, 'scripts/harm-matrix-gates.json')])` (needs `matrixRun`
to accept extra args). This alone does not close H3: `--lane` still points at the real lane, whose worktree carries the
same receipts. P3 is the closure.

## P3 — H3: verify the row *cells* against the probe's own direct runs, on >= 2 pairs not named in any receipt

The current H3 (lines 136-148) only compares gate names and the exit code; it never checks that the tool read the
gate at either revision. `stub-canned-pairs.mjs` (four hand-written rows, no gate run) passes H3 —
`HARM65_UNMET held=2/5 ... | H1 MISS ... | H2 MISS ... | H4 MISS ...` (H3 and H5 are the two that passed).

```js
// cellsOf: "HARM_ROW gate=G base=CLEAN tip=NOT_CLEAN id=X base_text=..." -> [G, baseCell, tipCell, id]
const cellOf = (stdout, gate) => { for (const l of stdout.split('\n')) { const m = /^HARM_ROW gate=(\S+) base=(\S+) tip=(\S+) id=(\S+) /.exec(l); if (m && m[1] === gate) return { base: m[2], tip: m[3], id: m[4] }; } return null; };
const cleanAt = (rc) => rc === 0 ? 'CLEAN' : 'NOT_CLEAN';
// for each checked pair {b, t}: for gate in [readme-map, proxy-check]:
//   require cellOf(run.stdout, gate).base === cleanAt(direct(b, gate)) && .tip === cleanAt(direct(t, gate))
// pairs checked = PAIR_A, PAIR_B and >= 2 runtime-sampled adjacent history pairs:
const hist = git(lane, ['rev-list', '--first-parent', '--max-count=6', full]).stdout.trim().split('\n').filter(Boolean);
const sampled = [];
for (let i = 0; i + 1 < hist.length && sampled.length < 2; i++) { const b = hist[i + 1], t = hist[i]; if (![ROUND_BASE, ...PAIR_A, ...PAIR_B, full].includes(b) && ![...PAIR_A, ...PAIR_B, full].includes(t)) sampled.push([b, t]); }
```

`loadDirect` must be generalised to `direct(rev, gate)` (it already is `directRc`), and its results memoised per rev.
No receipt exists for the sampled pairs, so a stub must run the gates to answer. Cheap: 2 pairs x 2 revisions x 2 gates.

## P4 — H5: pin the gate count to the registry and make the summary agree with the rows

At `2ca91a0` the registry holds **20** gates, so the `Number(m[2]) >= 14` floor (line 183) accepts a report over 14 of
20 gates. `stub-blind-echo-gates14.mjs` prints `gates=14` and scores **5/5** (`HARM65_HELD held=5/5`, exit 0).

```diff
-  const bad = m ? Number(m[3]) + Number(m[4]) + Number(m[5]) : -1;
-  check('H5', !!m && Number(m[2]) >= 14 && r.status === (bad === 0 ? 0 : 1), `...`);
+  let regIds = [];
+  try { const doc = JSON.parse(readFileSync(join(A, 'scripts/harm-matrix-gates.json'), 'utf8')); regIds = (Array.isArray(doc) ? doc : doc.gates || []).map((g) => g.id).sort(); } catch {}
+  const rowIds = r.stdout.split('\n').filter((l) => l.startsWith('HARM_ROW ')).map((l) => (/^HARM_ROW gate=(\S+) /.exec(l) || [])[1]).filter(Boolean).sort();
+  const nAbsent = (r.stdout.match(/ id=ABSENT_BOTH /g) || []).length;
+  const count = (id) => (r.stdout.match(new RegExp(` id=${id} `, 'g')) || []).length;
+  const agree = !!m && Number(m[3]) === count('HARM') && Number(m[4]) === count('HARM_ABSENT') && Number(m[5]) === count('NEW_RED') && ((m[1] === 'CLEAN') === (Number(m[3]) + Number(m[4]) + Number(m[5]) === 0));
+  const bad = m ? Number(m[3]) + Number(m[4]) + Number(m[5]) : -1;
+  check('H5', !!m && agree && regIds.length >= 14 && JSON.stringify([...new Set(rowIds)].sort()) === JSON.stringify(regIds) && Number(m[2]) === regIds.length - nAbsent && r.status === (bad === 0 ? 0 : 1), `...`);
```

`agree` alone kills the masked verdict (rows say HARM, summary says `harm=0`); `rowIds === regIds` kills gate-dropping.
Note `id=HARM ` cannot collide with `id=HARM_ABSENT ` because of the trailing space.

## P5 — H1: tie the selftest count to the case file

`harm-cases.json` holds 26 cases; a printed `PASS (20/20)` satisfies the floor (my stub prints exactly that).

```diff
-  check('H1', r.status === 0 && !!m && m[1] === m[2] && Number(m[2]) >= 20, `...`);
+  let nCases = null; try { nCases = JSON.parse(readFileSync(join(A, 'scripts/harm-cases.json'), 'utf8')).cases.length; } catch {}
+  check('H1', r.status === 0 && !!m && m[1] === m[2] && Number(m[2]) >= 20 && Number(m[2]) === nCases, `selftest exit=${r.status} line=${m ? m[0] : 'none'} cases=${nCases}`);
```

and pin `scripts/harm-cases.json` in `.ufo/pins/counter-pins.json` (today only `gen-harm-cases.mjs` is pinned).

## P6 — H2: verify the case specs against the pinned manifest, and add the canned stub to H4

No code in the lane reads `controls/harm/MANIFEST.sha256` (`grep -rn MANIFEST.sha256 scripts/ probe/ SKILL.md` → no
hits); it is pinned by `counter-pins` only as a byte blob, so editing a `spec.json` in place is invisible to every
gate, while H2 reads `spec.expect` from that same archive.

```js
const man = join(controlsDir, 'MANIFEST.sha256');
if (!existsSync(man)) why.push('manifest-missing');
else for (const line of readFileSync(man, 'utf8').split('\n').filter(Boolean)) {
  const [want, rel] = line.trim().split(/\s+/);
  const got = createHash('sha256').update(readFileSync(join(controlsDir, rel))).digest('hex');
  if (got !== want) why.push(`manifest:${rel}`);
}
```

and make H4's H3 leg use the harness (line 172 today calls `spawnSync(s[0], [...s.slice(1)])` with **no**
`--lane/--base/--tip`, so the H3 leg of H4 is satisfied by any stub that prints no rows), plus a third stub whose
content is the four hand-written pair rows:

```diff
-  const w3 = h3(s, { a: spawnSync(s[0], [...s.slice(1)], { encoding: 'utf8' }), b: spawnSync(s[0], [...s.slice(1)], { encoding: 'utf8' }) });
+  const w3 = h3(s, { a: matrixRun(s, ...PAIR_A), b: matrixRun(s, ...PAIR_B) });
```

with `stubs = [clean, harm, canned]`. After P2+P3 the canned stub misses; today it would pass H4's H3 leg.
