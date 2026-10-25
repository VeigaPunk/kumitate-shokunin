# Fix proposals for the frozen C2 counter (`.ufo/waves/round-64/probe/jj64-probe.mjs`, sha256 157be0ac…)
# Critic seat K64CriticC2Predicate. Each hunk only STRENGTHENS a check; none relaxes one.
# The frozen file is not edited by this seat. Apply (or reject) at the L1's discretion.

## P-1 (finding -4) J6: run the demo inside the archive, not in the caller's cwd
# Today the demo inherits the probe's cwd, so run from the lane it reads/writes lane state
# (measured: `demo-cwd.txt` landed in the caller's dir). Also makes the demo hermetic.
@@ // ---- J6
-  const r = spawnSync('bash', [join(T, 'scripts', 'jj-seat-demo.sh')], { encoding: 'utf8', timeout: 120000 });
+  const r = spawnSync('bash', [join(T, 'scripts', 'jj-seat-demo.sh')], { encoding: 'utf8', timeout: 120000, cwd: T });
# consequence for the entry: a demo that needs a repo must init its own under $TMPDIR (hermetic), which the plan already requires.

## P-2 (finding -3) J6: a stated outcome must have a value
# Today `- key=` ×12 with a demo printing `JJ_SEAT: key=` reads HELD 8/8 (measured, fixture A).
@@
-      const m = /^-\s+([a-z0-9_]+)=(.*?)\s*$/.exec(l);
+      const m = /^-\s+([a-z0-9_]+)=(\S.*?)\s*$/.exec(l);
# optional, same check: require at least 4 distinct values, so 12 copies of one token do not clear the floor
+  if (new Set([...stated.values()]).size < 4) bad.push(`distinct-values=${new Set([...stated.values()]).size}`);

## P-3 (finding -2) J2: a cited row must NOT exist at the round base
# Today rows opened in rounds 61/63 carry `opened 2026-10-25` and clear J2, so the plan's
# "rows are opened this round" is unmeasured (measured: S195/S196 reused, HELD 8/8).
# The counter already shells `git -C lane show ${BASE}:…` for J8; reuse that.
@@ // ---- J2, after `const rows = new Map();` is filled
+const baseIds = new Set();
+{
+  const b = spawnSync('git', ['-C', lane, 'show', `${BASE}:corpus/SOURCES.md`], { encoding: 'utf8' });
+  if (b.status === 0) for (const m of b.stdout.matchAll(/^ {0,3}\|\s*(S\d{3,})\s*\|/gm)) baseIds.add(m[1]);
+}
@@ inside the J2 per-id loop
     if (tier === '') bad.push(`${id}:no-tier`);
+    if (baseIds.has(id)) bad.push(`${id}:existed-at-base`);
# note: if BASE's registry is unreadable the set is empty and the check degrades to today's
# behaviour — say so in the declared limit, or make it fail-closed with `baseIds-unreadable`.

## P-4 (finding -7) J7: the frontier line must be inside the Frontier section
# Today any line containing /frontier|band|ground/i passes, so the word "Background" does (measured).
@@
-  const named = prov ? prov.toString('utf8').split('\n').some((l) => l.includes(ENTRY) && /frontier|band|ground|first entry/i.test(l)) : false;
+  let named = false;
+  if (prov) {
+    const lines = prov.toString('utf8').split('\n');
+    const at = lines.findIndex((l) => /^#{1,6}\s+.*Frontier\b/i.test(l));
+    if (at >= 0) {
+      const level = /^(#+)/.exec(lines[at])[1].length;
+      let end = lines.length;
+      for (let i = at + 1; i < lines.length; i += 1) {
+        const h = /^(#+)\s/.exec(lines[i]);
+        if (h && h[1].length <= level) { end = i; break; }
+      }
+      named = lines.slice(at + 1, end).some((l) => l.includes(ENTRY));
+    }
+  }

## P-5 (finding -8) J8: the amendment must carry a body, not only the heading words
# Today `## Amendment 2026-10-25` + `M7 — <path>` (2 non-empty lines) passes (measured, F1).
@@
+    const nonEmpty = tail.split('\n').filter((l) => l.trim() !== '');
+    if (nonEmpty.length < 4) bad.push(`amendment-lines=${nonEmpty.length}`);
# (heading + >=3 body lines; the round-64 plan's amendment states the staged claim, the
# measurement and the correction — three body lines is the floor, not a style rule.)

## P-6 (finding -9) J1: the recheck line must not be a placeholder
# Today `recheck: 90d — \`grep -c -F 'llms.txt' <capture>\` -> 1` passes J1 and is never run;
# an unexpanded `<capture>` is the same class as round 60's `__MEASURED__` tokens.
@@
-  const hasRec = /^recheck:\s*\S+/m.test(head);
+  const recLine = (head.match(/^recheck:.*$/m) || [''])[0];
+  const hasRec = /^recheck:\s*\S+/.test(recLine) && !/__[A-Z][A-Z0-9_]*__/.test(recLine) && !/<[a-z][a-z0-9 _-]*>/i.test(recLine);

## P-7 (findings -1, -5, -6) structural: give J6 an oracle, and give J5 a page identity
# J6 compares the demo's output with the entry's own text, so any script that prints (or greps)
# the entry passes (measured twice). J5 compares a quote string with a page, so site boilerplate
# and an attacker-hosted URL both pass (measured twice). Smallest strengthening that adds an
# independent witness to each:
#  - J6: run the demo with PATH=<private>/bin:$PATH where <private>/bin/jj logs argv and execs
#    the real jj, and with TMPDIR=<private>/tmp; require >= 5 logged jj invocations and at least
#    one `.jj` directory created under the private TMPDIR, else `demo-not-executed`.
#  - J5: pin the fetch identity in the capture pin (`url` + `sha256` of the bytes as fetched) and
#    require `pin.url === row URL` before J3 passes; keep the live fetch as the outside witness.
#    This does not stop an attacker-authored page; it stops the capture being any page.
