# K65ReviewProbeO65 — proposed counter fixes (NOT applied: the C2 counter is frozen)

The round-65 plan forbids editing `probe/omp65-probe.mjs`; these diffs are for a round-66 re-freeze with these
controls carried forward (the plan's own ratchet: a forged reading is added to the controls and the counter
is strengthened, never relaxed). Each hunk strengthens a check; none weakens one.

## P1 — O3: require the capture to be inside the measured revision (finding -1)

`rd(rel)` is `readFileSync(join(T, rel))`; `path.join` normalises `..`, so a committed pin can read a host file
outside the `git archive` temp dir (M12 reads `../kumitate-r65/.../S204.ts` and the counter prints HELD 8/8).

```diff
--- a/.ufo/waves/round-65/probe/omp65-probe.mjs
+++ b/.ufo/waves/round-65/probe/omp65-probe.mjs
@@
-const rd = (rel) => { try { return readFileSync(join(T, rel)); } catch { return null; } };
+const inside = (rel) => { const p = resolve(T, rel); return p === T || p.startsWith(T + sep); };
+const rd = (rel) => {
+  if (!inside(rel)) return null;                 // a capture must be a blob of revision M
+  try { return readFileSync(join(T, rel)); } catch { return null; }
+};
```
(import `sep` from `node:path`.)

## P2 — O3: bind the capture to the row's URL, not only to a path (finding -6)

M2 passes with the S204 row pointing at client.ts while its pin names the S203 patch capture. Require the pin
to carry the row's URL and to agree with `captures[i].url`.

```diff
-    if (!c.sha256 || !c.bytes || c.path === undefined) { bad.push(`${id}:pin-shape`); continue; }
+    const url = /(https?:\/\/[^\s|)]+)/.exec(cells(rows.get(id) || '')[2] || '');
+    if (!c.sha256 || !c.bytes || c.path === undefined) { bad.push(`${id}:pin-shape`); continue; }
+    if (!url || c.url !== url[1]) { bad.push(`${id}:pin-url-mismatch`); continue; }
```

## P3 — O6: pin the probe script's bytes (finding -2)

O6 runs the archive's own `scripts/omp-binary-probe.sh`; a probe that prints constants measures nothing and the
entry's prose may then contradict the numbers (M1). Pin the probe in the counter (the C1 precedent:
`controls/harm/MANIFEST.sha256`) and run the pinned copy against the host, then require the archive copy to be
byte-identical.

```diff
+const PROBE_SHA = '…sha256 of scripts/omp-binary-probe.sh at 2ca91a0…';
...
   const probe = join(T, 'scripts', 'omp-binary-probe.sh');
   if (!existsSync(probe)) bad.push('probe-absent');
+  else if (createHash('sha256').update(readFileSync(probe)).digest('hex') !== PROBE_SHA) bad.push('probe-not-the-pinned-probe');
   else { … }
```

## P4 — O6: "rows pinned to the installed version" must read the URL cell (finding -3)

`pinned` tests the whole row line, so a row at `main` passes on an anchor mention of `/v18.12.6/` (M6 HELD 8/8).

```diff
-      const pinned = ids.filter((id) => { const u = rows.get(id) || ''; return u.includes(`/v${real}/`) || u.includes(`/${RELEASE_COMMIT}/`); });
+      const pinned = ids.filter((id) => {
+        const u = /(https?:\/\/[^\s|)]+)/.exec(cells(rows.get(id) || '')[2] || '');
+        return !!u && (u[1].includes(`/v${real}/`) || u[1].includes(`/${RELEASE_COMMIT}/`));
+      });
```

## P5 — O7: the entry must be named under `### Frontier` (finding -7)

M4 names the entry only under `### Adjacent` as "background only" and O7 passes on the `ground` substring.

```diff
-  const named = prov ? prov.toString('utf8').split('\n').some((l) => l.includes(ENTRY) && /frontier|band|ground|first entry|advanced/i.test(l)) : false;
+  const pl = prov ? prov.toString('utf8').split('\n') : [];
+  const fs0 = pl.findIndex((l) => /^###\s+Frontier\b/.test(l));
+  let fe = pl.length;
+  if (fs0 >= 0) for (let i = fs0 + 1; i < pl.length; i += 1) if (/^###\s/.test(pl[i])) { fe = i; break; }
+  const named = fs0 >= 0 && pl.slice(fs0 + 1, fe).some((l) => l.includes(ENTRY));
```

## P6 — O1/O7 window agreement (finding -5)

O1 reads 14 lines, `scripts/sources-check.mjs:369` reads 5; an entry whose `recheck:` sits on line 6 passes O1
and fails O7 (M8: 7/8, only O7 MISS). Either state the 5-line window in the plan's O1 sentence at the next freeze,
or relax the gate; a counter fix cannot relax anything and O1 is already the looser side.

## P7 — the do-nothing control should fail loudly (finding -11)

```diff
-node "$PROBE" "$C" "$REV" --no-live || true
+OUT=$(node "$PROBE" "$C" "$REV" --no-live || true); echo "$OUT"
+case "$OUT" in *'held=1/8'*) ;; *) echo "CONTROL-REGRESSED: expected held=1/8"; exit 1 ;; esac
```
