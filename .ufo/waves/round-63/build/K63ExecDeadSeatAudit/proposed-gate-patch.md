# Proposed patch — inline-dispatch-evidence.mjs dead-seat arm (NOT applied; L1 integrates)

Author: K63ExecDeadSeatAudit (round-63 w1). Target: `scripts/inline-dispatch-evidence.mjs`
(sha256 at audit time: `sha256sum scripts/inline-dispatch-evidence.mjs` — 22,548 bytes, mtime 2026-10-25 17:38).
Three defects measured in `gate-demos.txt` §5–§9; each hunk below closes one.

## Hunk 1 — a seat with no transcript is dead (gate-demos §6, §7)

Today: `SESSION_ABSENT:<seat>` is a finding, but the seat is pushed as `{name, session: null}` with no
`dead` flag, so `dead=` under-counts and `--report` never requires the seat be named. Round-60's 27 dead
seats reproduce as `dead=0`.

```diff
@@ step 4 (host transcripts)
     if (matched.length === 0) {
       findings.push(foreign ? `SESSION_FOREIGN:${t.name}` : `SESSION_ABSENT:${t.name}`);
-      seatInfo.push({ name: t.name, session: null });
+      seatInfo.push({ name: t.name, session: null, dead: true, noTranscript: true });
       continue;
     }
@@ step 6 (dead seats)
-  const dead = seatInfo.filter((s) => s.dead).map((s) => s.name);
+  // A missing transcript is death only inside a wave that really dispatched (sessions > 0);
+  // a wave with no transcripts at all is NOT_A_DISPATCH, already a finding.
+  const dead = seatInfo.filter((s) => s.dead && !(s.noTranscript && sessions === 0)).map((s) => s.name);
```

## Hunk 2 — "named" must carry the death text (gate-demos §5)

Today: `rep.includes(name)` — a roster line ("dispatched seats: A, B, C") passes with `dead=1` and exit 0.
The QUALITY criterion says the report must name the seat *with its error text*.

```diff
@@ step 6 (dead seats)
-    for (const n of dead) if (!rep.includes(n)) findings.push(`DEAD_UNNAMED:${n}`);
+    for (const n of dead) {
+      if (!rep.includes(n)) { findings.push(`DEAD_UNNAMED:${n}`); continue; }
+      const line = rep.split('\n').find((l) => new RegExp(`(?<![A-Za-z0-9_.-])${n}(?![A-Za-z0-9_-])`).test(l)) || '';
+      if (!/\b(exit|dead|fail|timeout|no report|session\s*=\s*null|SIGKILL|killed)\b/i.test(line)) {
+        findings.push(`DEAD_UNNAMED_TEXT:${n}`);
+      }
+    }
```

## Hunk 3 — stem-only transcript matching collides across rounds (gate-demos §7)

Today: `indexSessions` keys by file stem alone at depth <= 3; an unrelated `ExecCensus.jsonl` from another
round/lane reads `SESSION_FOREIGN:ExecCensus` for round 60. Restrict candidates to transcripts whose user
text names this lane/round (the same binding the gate already uses for identity):

```diff
 function candidates(index, name) {
-  const out = [];
-  for (const [stem, paths] of index) {
-    if (stem === name || (stem.startsWith(`${name}-`) && /^\d+$/.test(stem.slice(name.length + 1)))) out.push(...paths);
-  }
-  return out;
+  const out = [];
+  for (const [stem, paths] of index) {
+    if (stem === name || (stem.startsWith(`${name}-`) && /^\d+$/.test(stem.slice(name.length + 1)))) out.push(...paths);
+  }
+  return out.filter((p) => {
+    let raw = '';
+    try { raw = readFileSync(p, 'utf8'); } catch { return false; }
+    return raw.includes(`.ufo/waves/round-${roundForMatch}/`) || raw.includes('kumitate');
+  });
 }
```

(`roundForMatch` must be threaded in; the cheapest honest form is to pass `round` into `candidates` and test
`new RegExp(`kumitate round ${round}\\b`).test(raw)`.)

## Not proposed

- The `yield` requirement (`tr.yielded && tr.exitKind === 'normal'`) is left alone: it is correct for the
  current runtime, and the measured false-dead class (72/72 round-61, 96/96 round-62 transcripts carry no
  `yield`) is a *historical* record, not a live wave. If a future wave runs on a runtime without `yield`,
  I1/I2 will read `dead=<all seats>` — that is a deliberate fail-loud, and the report must then name every
  seat. Recorded as an open question, not patched here.
