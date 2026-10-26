# K65CriticC1Pairs — proposed patch drafts (L1 integrates; NOT applied)

Subject: `scripts/harm-matrix.mjs` (first committed 2ca91a0c, claim C1's subject).
Two independent, monotone strengthenings. Neither changes any verdict the frozen
counter H65 measures on real data (H3/H5 rows have no timeout/unmeasured side, and
no frozen control of the 16 expects a both-sides timeout), so H65 stays computable;
both close masked-verdict holes the plan's ratchet invites ("a lying gate, a masked
verdict").

## P1 — an unmeasured gate is not a carried gate (TIMEOUT/FAIL_CLOSED both sides)

Repro (today): `node scripts/harm-matrix.mjs --lane . --base 6825a514 --tip a004902d \
  --only round-gate-selftest --timeout 1`
reads `HARM_ROW gate=round-gate-selftest base=TIMEOUT tip=TIMEOUT id=CARRIED ...`
and `HARM_MATRIX: CLEAN gates=1 held=0 repaired=0 carried=1 ...` **exit 0** — a
registry whose only gate never produced a verdict reads CLEAN. Same for
FAIL_CLOSED on both sides (fixture: a gate that prints no verdict line).

```diff
--- a/scripts/harm-matrix.mjs
+++ b/scripts/harm-matrix.mjs
@@  // transition(b, t)
   if (b.cls === 'ABSENT' && t.cls === 'ABSENT') return 'ABSENT_BOTH';
   if (b.cls === 'ABSENT') return t.cls === 'CLEAN' ? 'NEW_OK' : 'NEW_RED';
   if (t.cls === 'ABSENT') return b.cls === 'CLEAN' ? 'HARM_ABSENT' : 'GONE';
+  // Two unmeasured sides compare equal only because both are empty: a gate that
+  // timed out or printed no verdict produced no reading at all. Only the both-sides
+  // case is reclassified; clean->timeout must stay HARM (frozen case-11) and
+  // timeout->clean must stay REPAIRED (frozen case-12).
+  const unmeasured = (c) => c === 'TIMEOUT' || c === 'FAIL_CLOSED';
+  if (unmeasured(b.cls) && unmeasured(t.cls)) return 'UNMEASURED';
   if (b.cls === 'CLEAN') return t.cls === 'CLEAN' ? 'HELD' : 'HARM';
   if (t.cls === 'CLEAN') return 'REPAIRED';
   return b.text === t.text ? 'CARRIED' : 'CARRIED_MOVED';
 }
@@  // render(res)
   const n = (id) => res.rows.filter((r) => r.id === id).length;
   for (const r of res.rows) out(`HARM_ROW gate=${r.gate} ...`);
   const counted = res.rows.filter((r) => r.id !== 'ABSENT_BOTH').length;
   if (counted === 0) failClosed('NO_GATES', 'every gate absent at both revisions');
+  if (n('UNMEASURED') > 0) {
+    const ids = res.rows.filter((r) => r.id === 'UNMEASURED').map((r) => r.gate).join(',');
+    out(`HARM_MATRIX: FAIL_CLOSED reason=UNMEASURED_GATE detail=${JSON.stringify(`gates=${ids}`)}`);
+    return 2;
+  }
   const harm = n('HARM'), harmAbsent = n('HARM_ABSENT'), newRed = n('NEW_RED');
```

Note for the L1: do NOT regenerate `controls/harm/MANIFEST.sha256` when adding the
two new controls below — `counter-pins` pins that file by sha256
(`.ufo/pins/counter-pins.json` name `harm65-controls-manifest`,
sha256 `4361a5a1…`), so any byte change reads `PIN_DRIFT` at the tip and H5 turns
that into a HARM row (base 47fe2383 is CLEAN). Nothing in `scripts/` reads the
manifest (grep: no hits), so the ratchet's new cases must be added *without*
touching it, or the pin must be re-pointed in the same commit (L1 decision).

New controls (additive; the frozen counter iterates every `case-\d+` dir, so these
are exercised by H2 without editing the counter):

```json
// case-17-both-timeout-unmeasured/spec.json
{ "gates": [{ "id": "g1", "argv": ["node", "slow.mjs"], "verdict": "^G: (\\w+)", "clean": ["CLEAN"], "timeout": 1 }],
  "base": { "slow.mjs": "setTimeout(() => { process.stdout.write('G: CLEAN\\n'); }, 3000);\n" },
  "tip":  { "slow.mjs": "setTimeout(() => { process.stdout.write('G: CLEAN\\n'); }, 3000);\n" },
  "expect": { "exit": 2, "rows": ["g1 UNMEASURED"] } }
// case-18-both-no-verdict-unmeasured/spec.json
{ "gates": [{ "id": "g1", "argv": ["node", "crash.mjs"], "verdict": "^G: (\\w+)", "clean": ["CLEAN"], "timeout": 30 }],
  "base": { "crash.mjs": "process.stdout.write('BOOM\\n'); process.exit(3);\n" },
  "tip":  { "crash.mjs": "process.stdout.write('BOOM\\n'); process.exit(3);\n" },
  "expect": { "exit": 2, "rows": ["g1 UNMEASURED"] } }
```
(Verify the probe's `runCase` compares `got.exit !== spec.expect.exit` — it does —
so exit 2 is expressible; `h2()` only counts `exit === 0` cases for the `zero >= 2`
floor, unaffected.)

**Verified (K65CriticC1Pairs, 2026-10-25):** a patched copy was run against an
independent re-implementation of the probe's H2 harness (`/tmp/kumitate-r65/
K65CriticC1Pairs/verify-p1.mjs`): **16/16 frozen controls pass with the patched
tool**, and 16/16 with the unpatched tool (the harness itself agrees with the
frozen probe). On real data the patch changes nothing the claim measures:
pairA `HARM ... harm=2` EXIT=1, pairB `CLEAN ... repaired=2 carried=2 new=1`
EXIT=0, rows identical to the unpatched run apart from `plan-before-ready`'s
random temp path. The both-sides guard is load-bearing: a broader rule
("either side unmeasured") would reclassify frozen `case-11-harm-timeout`
(clean→timeout must stay HARM) and `case-12-repaired-from-timeout`
(timeout→clean must stay REPAIRED).

## P2 — compare the whole verdict line, not its first 200 characters

`measure()` stores `hit.line.slice(0, 200)` and `transition()` compares those
prefixes. A red gate whose *new* drift terms appear after character 200 compares
equal and reads CARRIED; the printed row also hides them. Evidence: at
`019a844c` the proxy summary line is cut mid-token and its fourth finding
(`PIN_UNPINNED`) never reaches the row, while the close receipt
`.ufo/waves/round-61/close/a2-tip-proxy.txt` shows four findings.

```diff
--- a/scripts/harm-matrix.mjs
+++ b/scripts/harm-matrix.mjs
@@  // measure(g, dir)
   if (!hit) return { cls: 'FAIL_CLOSED', text: `no-verdict exit=${rc}` };
   const clean = g.okExit.includes(rc) && g.clean.includes(hit.word);
-  return { cls: clean ? 'CLEAN' : 'NOT_CLEAN', text: hit.line.slice(0, 200) + (clean ? '' : ` [exit=${rc}]`) };
+  const full = hit.line + (clean ? '' : ` [exit=${rc}]`);
+  return { cls: clean ? 'CLEAN' : 'NOT_CLEAN', text: full, sha: createHash('sha256').update(full).digest('hex') };
// (add `import { createHash } from 'node:crypto';` beside the other imports)
 }
```
and in `render()` print `base_text=${JSON.stringify(r.b.text.slice(0, 200))} base_sha=${r.b.sha}` (same for tip). The probe's row regex
`/gate=(\S+) .* id=(\S+) base_text/` and the controls' `<gate> <ID>` expectations
are unaffected; `case-10-carried-moved-line` still reads CARRIED_MOVED.

## Not proposed (would break frozen controls)
Counting `CARRIED_MOVED` as bad: `case-10-carried-moved-line` expects
`{"exit":0,"rows":["g1 CARRIED_MOVED"]}`, so that fix cannot land inside H65.
The honest-stop blindness it causes is reported as a claim defect (H3 v2), not a
tool patch for this round.
