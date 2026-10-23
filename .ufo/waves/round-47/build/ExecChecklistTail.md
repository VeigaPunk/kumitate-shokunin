RESULT ExecChecklistTail rev=cac43009 verdict=READY commit=2e522caeb0eb29f57287100cf6c9cbfa71b2cb06 patch=.ufo/waves/round-47/build/ExecChecklistTail.patch sha256=e450ffa20a1eb0b5c7eff2b4e9970fefdb338bf13ae5e8c7faa338d5a148181c

# R46-3 — checklist receipts keep the item's own output, load and wall time

## Scope and clone

```
$ unset $(git rev-parse --local-env-vars) GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
$ git clone -q --no-hardlinks <lane> /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecChecklistTail/lane
$ git -C lane checkout -q --detach cac43009b22232c1ae8efdab4f2789516c1fcc6f
$ git -C lane log -1 --format='%H %s'
cac43009b22232c1ae8efdab4f2789516c1fcc6f round-47: freeze — plan (C1 ROUTED_HELD, five sites), frozen counter caproute-probe.mjs, base and calibration receipts; prerequisite runner contract kumitate-cap-run-v2 (--bind, --verdict-file, sync verdict write, budget rule; R46-5) and helper scripts/cap-spawn.mjs (before any data seat)
$ git -C lane diff cac43009..HEAD --stat
 scripts/surface-probe.mjs | 90 +++++++++++++++++++++++++++++++++++++++++++++--
 1 file changed, 87 insertions(+), 3 deletions(-)
```

One file touched (`scripts/surface-probe.mjs`): the checklist runner, a header note and one selftest case.

## What changed (behaviour)

1. Every checklist result line that ran a child (PASS and FAIL) now ends
   `… substring=<hit|miss> wall=<seconds, 3dp> load1=<os.loadavg()[0] at item start, 2dp> — <label>`. The
   prefix up to and including `substring=` is byte-identical to cac43009; the `— <label>` tail stays last.
2. A FAIL line only: `checklistTail()` appends the last 8 lines of that item's combined stdout+stderr as
   `  | ` prefixed continuation lines, cut to the last 2000 bytes of payload on code-point boundaries.
3. SKIP(checked)/SKIP(self) and grammar-ERROR lines spawn nothing and are unchanged; the summary lines
   `CHECKLIST_SKIPPED:`, `CHECKLIST: n/m pass`, `VERDICT:` are unchanged byte-for-byte.
4. `--json` items gain `wall`, `load1`, `tail` beside the existing keys (superset; no key removed or renamed).

## Evidence

```
$ git -C lane apply --check ExecChecklistTail.patch   (in a fresh clone detached at cac43009)
PATCH_APPLIES_AT_CAC43009
$ sha256sum scripts/surface-probe.mjs   (patched clone vs. patched fresh clone)
0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb  (both)
```

Selftest, patched clone, under `systemd-run --user --scope -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900`:

```
$ node scripts/surface-probe.mjs --selftest
46/46 cases passed
VERDICT: PASS
exit 0   (46 PASS lines; the new case reports: ran=3 receipted=3 tail=8:L5..L12 huge=5/2000B)
```

Red before (new case alone, inserted into the pristine `cac43009:scripts/surface-probe.mjs`, sha256
`1361075d…` = `pin.surface-probe` at the freeze commit):

```
$ node redbefore/old-probe.mjs --selftest      # old runtime + new assertion
FAIL  checklists: every ran line carries `wall=`/`load1=`, a FAIL line appends the last 8 output lines (`  | `, ≤2000 bytes) — R46-3 — exit=1 ran=3 receipted=0 tail=0:-..- huge=0/0B
FAIL  hermeticity: --selftest passes with a bogus --src (never reads the live tree) — exit=1 tail=45/46 cases passed
44/46 cases passed
VERDICT: FAIL   exit 1
```

The new case fails on old code because `receipted=0` and the FAIL tails are empty.

`--checklists` run on the patched clone (same host bounds; `real 2m6.437s`):

```
$ node scripts/surface-probe.mjs --checklists
CHECKLIST  PASS SKILL.md:680 exit=1 expected=0|1 substring=hit wall=1.712 load1=20.63 — Citation gate verdict
CHECKLIST  PASS SKILL.md:681 exit=0 expected=0 substring=hit wall=1.118 load1=20.50 — Citation gate hermetic suite
CHECKLIST  PASS SKILL.md:682 exit=0 expected=0 substring=hit wall=0.116 load1=20.50 — Live sighting-surface conformance
CHECKLIST  PASS SKILL.md:683 exit=0 expected=0 substring=hit wall=0.806 load1=20.50 — Surface-probe hermetic suite
CHECKLIST  PASS SKILL.md:684 exit=0 expected=0 substring=hit wall=4.627 load1=20.50 — Round-gate hermetic suite
CHECKLIST  FAIL SKILL.md:685 exit=2 expected=0 substring=miss wall=0.023 load1=20.37 — Round-close artifact audit
  | ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecChecklistTail/.ufo/reports is absent
  | round-gate: fail-closed — REPORTS_DIR_MISSING: --reports-dir /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecChecklistTail/.ufo/reports is absent
CHECKLIST  FAIL SKILL.md:686 exit=2 expected=0 substring=miss wall=0.020 load1=20.37 — Filed-report tracking
  | ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecChecklistTail/.ufo/reports is absent
  | round-gate: fail-closed — REPORTS_DIR_MISSING: --reports-dir /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecChecklistTail/.ufo/reports is absent
CHECKLIST  FAIL SKILL.md:687 exit=1 expected=0 substring=miss wall=0.099 load1=20.37 — Proxy recompute (`--strict` since round 42: a missing or renamed `kumitate-gate-pins-v1` block re-raises `PIN_UNPINNED`, which strict mode fails)
  | PROXY  error  A_DRIFT  A: declared=21 computed=23 delta=+2
  | PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=104 computed=105 delta=+1
  | PROXY  error  PIN_DRIFT  pin.surface-probe: declared=1361075da7762ce870749331864646fc03114e86720dc6b933bd6efcccb678b5 computed=0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb
  | PROXY  error  GATE_PIN_DRIFT  pin.cap-run: declared=5c2afd5ce6581cbb4a22e07dfdd518eea80c52b3facd74ca9c2bb2d0ac84391f computed=b3521bc806d6c60052e0c9a769f27a72de28297e3562c69952f743feffca68b8
  | PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
  | PROXY  warn  PIN_UNPINNED  scripts/cap-spawn.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
  | PROXY: DRIFT (A_DRIFT term=A declared=21 computed=23 delta=+2; C2_TOTAL_DRIFT term=C2_total declared=104 computed=105 delta=+1; PIN_DRIFT term=pin.surface-probe declared=1361075d… computed=0cd94432…; GATE_PIN_DRIFT term=pin.cap-run declared=5c2afd5c… computed=b3521bc8…; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/cap-spawn.mjs; src-rev=31c465f15669)
CHECKLIST  PASS SKILL.md:688 exit=0 expected=0 substring=hit wall=7.174 load1=20.37 — Proxy-check hermetic suite
CHECKLIST  PASS SKILL.md:689 exit=0 expected=0 substring=hit wall=0.079 load1=20.18 — Member-claims gate
CHECKLIST  PASS SKILL.md:690 exit=0 expected=0 substring=hit wall=0.020 load1=20.18 — Kimi-substrate census
CHECKLIST  PASS SKILL.md:691 exit=0 expected=0 substring=hit wall=0.030 load1=20.18 — Sources-registry gate
CHECKLIST  PASS SKILL.md:692 exit=0 expected=0 substring=hit wall=0.905 load1=20.18 — Sources-check hermetic suite
CHECKLIST  PASS SKILL.md:693 exit=0 expected=0 substring=hit wall=0.829 load1=20.18 — Per-anchor truth burn-down
CHECKLIST  PASS SKILL.md:694 exit=0 expected=0 substring=hit wall=4.459 load1=20.18 — Anchor-truth hermetic suite
CHECKLIST  PASS SKILL.md:695 exit=0 expected=0 substring=hit wall=0.035 load1=20.72 — Wave census of round 40's committed payloads (payload counts and findings; a payload proves validation, not dispatch)
CHECKLIST  PASS SKILL.md:696 exit=0 expected=0 substring=hit wall=2.792 load1=20.72 — Wave-census hermetic suite
CHECKLIST  FAIL SKILL.md:697 exit=2 expected=0 substring=miss wall=92.094 load1=20.72 — Gate-mutants battery over the lane's own suites (contract `kumitate-gate-mutants-v2`, kill predicate K43: an evaluable run exiting numeric non-zero with an exact `VERDICT: FAIL` line, confirmed by an immediate rerun with the same sorted `FAIL ` case names; controls re-run after the mutants; 41 frozen mutants of cite-check and wave-census, exit 0 only when every mutant is killed; temp parent `$KUMITATE_GATE_MUTANTS_TMP`, else `~/.cache/kumitate-gate-mutants`)
  | MUTANT wave-census:findings/F-M22 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
  | MUTANT wave-census:exits/M22-name-half-dropped killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
  | MUTANT wave-census:findings/F-M23 killed cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=same
  | MUTANT wave-census:exits/M19-selftest-exit-const killed cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same
  | MUTANT wave-census:survivor/M04-empty-round timeout cases=not-run/not-run control=32 fail_lines=0 timeout=60000ms group_clean=true
  | CONTROL_AFTER cite-check PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=76/76 floor=75
  | CONTROL_AFTER wave-census PASS exit=0 verdict=PASS group_clean=true fail_lines=0 overflow=false cases=32/32 floor=31
  | GATE_MUTANTS: ERROR (mutants=43 killed=39 frozen=37/41 drift=0 targets=2 rev=working-copy manifest=8486506f859b79ced4865adc34594a3111321e16821a54b1ee114e8d863bb12f leftovers=0) drift=0 nomatch=0 crash=0 unstable=3 timeout=1 overflow=0 control-fail=0
CHECKLIST  PASS SKILL.md:698 exit=0 expected=0 substring=hit wall=1.159 load1=35.87 — Gate-mutants hermetic suite
CHECKLIST  PASS SKILL.md:699 exit=0 expected=0 substring=hit wall=0.030 load1=35.87 — OMP agent-root census
CHECKLIST  PASS SKILL.md:700 exit=0 expected=0 substring=hit wall=0.048 load1=35.87 — OMP-census hermetic suite
CHECKLIST  PASS SKILL.md:701 exit=0 expected=0 substring=hit wall=8.213 load1=35.87 — Cap-run hermetic suite (round 46; contract `kumitate-cap-run-v1`; needs `systemd-run --user` and unprivileged bwrap)
CHECKLIST_SKIPPED: 0
CHECKLIST: 18/22 pass
VERDICT: FAIL
```

This run is the R46-3 repair demonstrated on the exact item that motivated it: item 697's exit-2 subclass is
now readable from the receipt alone (`timeout=1 unstable=3`, 39/43 killed, `frozen=37/41`, 92.1 s wall,
load1 20.72) instead of a bare `exit=2 substring=miss`. The 4 failures are attributed below; none is caused
by this change.

## Attribution of the four FAIL lines

- `SKILL.md:685`/`:686` — round-gate resolves `--reports-dir` to `resolve(__dirname,'..','..','.ufo/reports')`,
  i.e. the **seat** dir, which has no `.ufo/reports`; identical at the freeze commit:
  `node scripts/round-gate.mjs` in a pristine cac43009 clone → `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING)`.
  Sandbox layout artefact, not a regression.
- `SKILL.md:687` — `proxy-check --strict` at pristine cac43009 already reads exit 1:
  `A_DRIFT (A computed=23)`, `C2_TOTAL_DRIFT (105)`, `GATE_PIN_DRIFT pin.cap-run`,
  `AXES_DRIFT coverage 10→9`, `PIN_UNPINNED scripts/cap-spawn.mjs` (the freeze commit's own cap-run v2 /
  cap-spawn additions). This change adds exactly one finding to that set: `PIN_DRIFT pin.surface-probe
  declared=1361075d… computed=0cd94432…`.
- `SKILL.md:697` — pre-existing load sensitivity (R43-1/R43-5; round-46 §2 rules it pre-existing), not
  introduced here: this battery's targets are `cite-check` and `wave-census`, both untouched, and its
  `CONTROL_AFTER` runs pass (`76/76` and `32/32`).

## Parser compatibility (verified, not assumed)

```
$ grep -rn "substring=hit|substring=miss|CHECKLIST  PASS|CHECKLIST  FAIL|CHECKLIST: [0-9n]|CHECKLIST_SKIPPED" \
    --include=*.mjs --include=*.sh --include=*.js --include=*.py . | grep -v '^./scripts/surface-probe.mjs'
(no hits)
$ grep -rn "CHECKLIST" scripts/ --include=*.mjs --include=*.sh | grep -v surface-probe.mjs
scripts/proxy-check.mjs:492:const RE_CHECKLIST = /^\s*- \[/;     # counts SKILL.md task lines, not receipts
scripts/proxy-check.mjs:932:  const C = countLines(skillText, RE_CHECKLIST);
```

No lane script parses the receipt lines or the summary; the only consumer counts `- [` lines in `SKILL.md`.
The new selftest case asserts the frozen prefix explicitly
(`^CHECKLIST {2}PASS SKILL\.md:\d+ exit=0 expected=0 substring=hit wall=\d+\.\d{3} load1=\d+\.\d{2} — passes with a receipt$`)
and `CHECKLIST: 1/3 pass` / `VERDICT: FAIL` unchanged.

## Risks / follow-ups (outside this seat's file scope)

1. **Re-pin required.** `SCORECARD.md:307` `pin.surface-probe=1361075da7762ce870749331864646fc03114e86720dc6b933bd6efcccb678b5`
   must become `0cd94432d09316a235d03625c4834324b8e7162cda1ab269a09605a44d3e83eb`, else checklist item 7 stays
   `PROXY: DRIFT` under `--strict`. The other four proxy findings reproduce at the freeze commit and belong to
   the integrated C1 commit's re-pin.
2. Item 697 remains load-sensitive (R43-1/R43-5). It is now observable, not fixed: this run shows the failure
   class comes from the battery's own 60 s per-mutant budget (`timeout=1`) plus `unstable=3`, not from a
   harness timeout (`checklistTimeoutMs` 120 s; the item finished in 92.1 s).
3. `--checklists` receipts grow by at most 8 lines × 2000 bytes per failing item; `maxBuffer` (8 MiB) and the
   combined-output capture are unchanged.
4. Items 685/686 cannot pass from any seat clone without an `.ufo/reports` dir under the seat scratch root —
   worth a plan note for future receipts, not a change here.

No tool installed or updated (nothing needed). Host bounds used on every run
(`systemd-run --user --scope -p MemoryMax=4G -p TasksMax=512 timeout -s KILL 900`); `df -h /fast` 118G free
before the checklist run and 116G after; seat scratch 176M; no process of this seat left running.

## Diff (`git diff cac43009..HEAD` in the clone; identical to the exported patch body)

```diff
diff --git a/scripts/surface-probe.mjs b/scripts/surface-probe.mjs
index 4bc593b..d5c4304 100755
--- a/scripts/surface-probe.mjs
+++ b/scripts/surface-probe.mjs
@@ -26,6 +26,14 @@
  *   items leave both numerator and denominator. A `- [ ]` line that does not
  *   parse is a CHECKLIST_GRAMMAR error and counts as a failed item — an
  *   unverifiable checklist entry is drift, not a free pass.
+ *   Each PASS/FAIL result line ends `… substring=<hit|miss> wall=<seconds>
+ *   load1=<os.loadavg()[0] at item start> — <label>`, so a receipt names the
+ *   load it ran under (R46-3). A FAIL line then carries the tail of that item's
+ *   own combined output — at most the last 8 lines and 2000 bytes of them — as
+ *   `  | ` continuation lines, so an exit-code subclass is readable from the
+ *   receipt alone. SKIP and grammar-ERROR lines spawn nothing and carry neither.
+ *   The summary (`CHECKLIST_SKIPPED:`, `CHECKLIST: n/m pass`, `VERDICT:`) is
+ *   unchanged.
  *
  * Surfaces, byte sets, and the digest trap (read this before "fixing" a digest)
  *   sighting  The manifest is produced by `bash <src>/scripts/ufo-sighting
@@ -132,7 +140,7 @@ import { createHash } from 'node:crypto';
 import {
   existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
 } from 'node:fs';
-import { homedir, tmpdir } from 'node:os';
+import { homedir, loadavg, tmpdir } from 'node:os';
 import { dirname, join, relative, resolve, sep } from 'node:path';
 import { fileURLToPath } from 'node:url';
 
@@ -240,6 +248,13 @@ const SURFACE_KIND = 'sighting-surface-v1';
 const SPAWN_TIMEOUT_MS = 20_000;
 const CHECKLIST_TIMEOUT_MS = 120_000;
 const MAX_BUFFER = 8 * 1024 * 1024;
+/**
+ * A FAIL receipt keeps the tail of the item's own combined output (R46-3: the
+ * round-46 close could not read the gate-mutants battery's exit-2 subclass
+ * because the receipts dropped it). Last 8 lines, at most 2000 bytes of them.
+ */
+const CHECKLIST_TAIL_LINES = 8;
+const CHECKLIST_TAIL_BYTES = 2000;
 
 /** Frozen v1 status projection, used when the origin source cannot be parsed. */
 const STATUS_FROZEN_TYPES = {
@@ -969,6 +984,31 @@ function parseChecklist(text) {
   return items;
 }
 
+/**
+ * The last `CHECKLIST_TAIL_LINES` lines of a failed item's combined output, cut
+ * to the last `CHECKLIST_TAIL_BYTES` bytes (whole code points only), each
+ * rendered as an indented `  | ` continuation of the FAIL line. A cut that
+ * lands mid-line keeps the partial line: it is still the tail, never a guess.
+ */
+function checklistTail(output) {
+  const lines = String(output ?? '').split('\n').map((line) => line.replace(/\r$/u, ''));
+  while (lines.length && lines.at(-1) === '') lines.pop();
+  let payload = lines.slice(-CHECKLIST_TAIL_LINES).join('\n');
+  if (Buffer.byteLength(payload, 'utf8') > CHECKLIST_TAIL_BYTES) {
+    const chars = Array.from(payload);
+    let bytes = 0;
+    let cut = chars.length;
+    while (cut > 0) {
+      const size = Buffer.byteLength(chars[cut - 1], 'utf8');
+      if (bytes + size > CHECKLIST_TAIL_BYTES) break;
+      bytes += size;
+      cut -= 1;
+    }
+    payload = chars.slice(cut).join('');
+  }
+  return payload === '' ? [] : payload.split('\n').map((line) => `  | ${line}`);
+}
+
 function runChecklistsMode(opts) {
   const findings = [];
   // `capture` is the hermetic-suite sink: the fixture arms must not spray the
@@ -1004,13 +1044,20 @@ function runChecklistsMode(opts) {
       continue;
     }
     if (item.command.includes('--checklists')) { results.push({ ...item, skipped: 'SKIP(self)' }); continue; }
+    const startedAt = Date.now();
+    const load1 = loadavg()[0];
     const run = spawnSync('bash', ['-c', item.command], {
       cwd: opts.self, encoding: 'utf8', timeout: CHECKLIST_TIMEOUT_MS, maxBuffer: MAX_BUFFER,
     });
+    const wallSeconds = (Date.now() - startedAt) / 1000;
     const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;
     const exitOk = typeof run.status === 'number' && item.exits.includes(run.status);
     const substringOk = output.includes(item.expect);
-    results.push({ ...item, status: run.status, exitOk, substringOk, failed: !(exitOk && substringOk) });
+    const itemFailed = !(exitOk && substringOk);
+    results.push({
+      ...item, status: run.status, exitOk, substringOk, failed: itemFailed, wall: wallSeconds, load1,
+      ...(itemFailed ? { tail: checklistTail(output) } : {}),
+    });
   }
 
   const ran = results.filter((r) => !r.skipped);
@@ -1025,7 +1072,8 @@ function runChecklistsMode(opts) {
     if (r.skipped) { lines.push(`CHECKLIST  ${r.skipped}  SKILL.md:${r.line} ${r.label ?? ''}`.trimEnd()); continue; }
     if (r.malformed) { lines.push(`CHECKLIST  ERROR  SKILL.md:${r.line} grammar (${r.raw})`); continue; }
     const verdictWord = r.failed ? 'FAIL' : 'PASS';
-    lines.push(`CHECKLIST  ${verdictWord.padEnd(4)} SKILL.md:${r.line} exit=${r.status} expected=${r.exits.join('|')} substring=${r.substringOk ? 'hit' : 'miss'} — ${r.label}`);
+    lines.push(`CHECKLIST  ${verdictWord.padEnd(4)} SKILL.md:${r.line} exit=${r.status} expected=${r.exits.join('|')} substring=${r.substringOk ? 'hit' : 'miss'} wall=${r.wall.toFixed(3)} load1=${r.load1.toFixed(2)} — ${r.label}`);
+    if (r.tail) lines.push(...r.tail);
   }
   lines.push(`CHECKLIST_SKIPPED: ${skipped}`);
   lines.push(`CHECKLIST: ${passed}/${ran.length} pass`);
@@ -1042,6 +1090,9 @@ function runChecklistsMode(opts) {
         line: r.line, label: r.label ?? null, command: r.command ?? null, exits: r.exits ?? null,
         expect: r.expect ?? null, status: r.status ?? null, exitOk: r.exitOk ?? null,
         substringOk: r.substringOk ?? null, skipped: r.skipped ?? null, failed: Boolean(r.failed),
+        wall: typeof r.wall === 'number' ? Number(r.wall.toFixed(3)) : null,
+        load1: typeof r.load1 === 'number' ? Number(r.load1.toFixed(2)) : null,
+        tail: r.tail ?? null,
       })),
       findings,
       totals: { items: results.length, ran: ran.length, passed, failed, skipped, grammar: results.filter((r) => r.malformed).length },
@@ -1637,6 +1688,39 @@ function selfTest() {
       ok: clFailRun.code === 1 && clFailRun.text.includes('CHECKLIST: 0/2 pass') && clFailRun.text.includes('VERDICT: FAIL'),
       detail: `exit=${clFailRun.code}`,
     }));
+    const clReceipt = checklistTree('checklists-receipt',
+      ['# fixture SKILL', '',
+        goodItem('passes with a receipt', 'node -e "console.log(\'OK\')"', '0', 'OK'),
+        goodItem('fails with a tail',
+          'node -e "for (let i = 1; i <= 12; i += 1) console.log(\'L\' + i); process.exit(3)"', '0', 'OK'),
+        goodItem('fails with a huge tail',
+          'node -e "for (let i = 1; i <= 12; i += 1) console.log(String(i) + \' \' + \'x\'.repeat(400)); process.exit(3)"',
+          '0', 'OK'), ''].join('\n'));
+    const clReceiptRun = runChecklists(clReceipt);
+    check('checklists: every ran line carries `wall=`/`load1=`, a FAIL line appends the last 8 output lines (`  | `, ≤2000 bytes) — R46-3', () => {
+      const lines = clReceiptRun.text.split('\n');
+      const ran = lines.filter((l) => /^CHECKLIST {2}(?:PASS|FAIL) /u.test(l));
+      const receipted = ran.filter((l) => / substring=(?:hit|miss) wall=\d+\.\d{3} load1=\d+\.\d{2} — /u.test(l));
+      const tailOf = (label) => {
+        const at = lines.findIndex((l) => /^CHECKLIST {2}FAIL /u.test(l) && l.endsWith(` — ${label}`));
+        const out = [];
+        for (let i = at + 1; at >= 0 && i < lines.length && lines[i].startsWith('  | '); i += 1) out.push(lines[i].slice(4));
+        return out;
+      };
+      const tail = tailOf('fails with a tail');
+      const huge = tailOf('fails with a huge tail');
+      const hugeBytes = Buffer.byteLength(huge.join('\n'), 'utf8');
+      const compat = /^CHECKLIST {2}PASS SKILL\.md:\d+ exit=0 expected=0 substring=hit wall=\d+\.\d{3} load1=\d+\.\d{2} — passes with a receipt$/u
+        .test(lines.find((l) => l.endsWith(' — passes with a receipt')) ?? '');
+      const ok = clReceiptRun.code === 1 && ran.length === 3 && receipted.length === 3 && compat
+        && tail.length === 8 && tail[0] === 'L5' && tail.at(-1) === 'L12'
+        && huge.length > 0 && hugeBytes <= 2000 && huge.at(-1).endsWith('x'.repeat(400))
+        && lines.includes('CHECKLIST: 1/3 pass') && lines.includes('VERDICT: FAIL');
+      return {
+        ok,
+        detail: `exit=${clReceiptRun.code} ran=${ran.length} receipted=${receipted.length} tail=${tail.length}:${tail[0] ?? '-'}..${tail.at(-1) ?? '-'} huge=${huge.length}/${hugeBytes}B`,
+      };
+    });
     const clSkip = checklistTree('checklists-skip',
       ['# fixture SKILL', '',
         `- [ ] self-recursive — \`node scripts/surface-probe.mjs --checklists\` → exit 0 + \`CHECKLIST\``,
```

Blockers: none. The claim this seat owns (`R46-3`) is met: a receipt now names wall, load and, for a failure,
the item's own tail — item 697's exit-2 subclass is read from the receipt, not from a rerun.
