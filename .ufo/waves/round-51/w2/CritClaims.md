# CritClaims — end-to-end claim attribution attack

Reviewer: `kumitate-r51.PlasticGoat`. This is a critic's finding/disposition, **not a canonical judgment or admission**.

## Axes, target, and scope

- **C1: operability / capability acquisition.** Attack the inference from A51 to actual invocation capture and closure of the narrowly defined M2 forgery.
- **C2: coverage / sourced frontier learning.** Attack novelty relative to Q39 and the existing counter/amendment doctrine, and whether the integrated entry actually satisfies D51.
- Evidence provenance and control discrimination constrain both claims; they are not additional claimed axes. No saturated numeric axis increase is inferred.

All committed-tree diagnostics below target **`7d88faa733c5621da1cac174515e4a7d7d8896ea`**, the assignment's integrated tip. The close revision was not available to this seat. The scheduled third receipt and its expected temporary A2 MISS are **not findings**. Synthetic third receipts below exist only in the scratch counterexample.

Absolute evidence locators:

- Plan: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md`, especially lines 21–83 and the eight-item freeze repair addendum, lines 167–222.
- A51: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs`.
- D51: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs`.
- Instrument: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs`.
- Entry: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md`.
- Q39: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md:754–772`.
- Prior doctrine: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/counter-amendment-discipline.md:42–54`.
- Historical controls: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/CritC1.md:102–197` and `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/RevCounterA.md:14–28,121–132`.

## (a) Which A51 arms actually discriminate the acquisition?

Two different questions must not be conflated: **absence at the base** versus **a present counterfeit which never runs its requested command**.

The recorded repaired before measurement at `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base/attest-base-v3r6.txt` says:

```text
ATTEST51: ATTEST_UNMET held=0/9 checks=9 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=A51 version=v3 | A1 MISS scripts/receipt-attest.mjs absent | A2 MISS attest-run-1.txt:absent;attest-run-2.txt:absent;attest-run-3.txt:absent | A2c MISS tool absent | A3 MISS attest-run-2-replayed.txt absent | A3c MISS tool absent | A4 MISS tool or receipts dir absent | A4c MISS tool absent | A3d MISS tool absent | A5 MISS tool or SCORECARD absent
exit=1
```

This is a read of the existing baseline artifact, **not a new execution by this reviewer**.

| Arm | What it genuinely adds over absence | What it does not establish |
|---|---|---|
| A1 | File exists and answers the selftest token. | The token can be printed without any test cases. |
| A2 | Three presented records have different nonces/hashes and a displayed span. | Actual child execution or elapsed time; fabricated records can satisfy it. |
| **A2c** | A fresh challenge receipt binds the visible nonce in argv and the expected output hash, with an independently checked outer sidecar. | Execution of printf: its output is exactly the nonce already disclosed in argv. |
| A3 | Rejection of the named committed negative fixture. | Content-sensitive rejection rather than filename dispatch, or fixture construction. |
| **A3c** | **The direct live M2 arm:** rewrite a generated receipt's prelude, keep its sidecar, require TAMPERED. | Authentic generation of the positive receipt or arbitrary tamper classes; the negative filename is distinguishable. |
| **A3d** | Reject a corrupted stored inner digest despite a repaired outer sidecar. | That every semantic field participates in the digest, or that an invocation occurred. |
| A4 | Positive ledger acceptance plus a genuine, finite prior-nonce substring sweep. | Ledger rejection of a conflicting record by itself, or capture freshness. |
| **A4c** | A same-nonce/different-semantic-digest twin is VALID alone and REPLAY for both ledger members. | Fresh generation across successive runs, execution truth, or temporal truth. |
| A5 | Pin and real proxy consistency identify/integrate the tested bytes. | Their invocation-capture behavior. A counterfeit can be pinned consistently. |

**Named behavior-bearing discriminators: A2c, A3c, A3d, A4c.** Of those, **A3c** directly tests the precise M2 prelude-only/stale-sidecar edit; A3 is its static companion. A3d establishes an inner-digest negative case; A4c establishes the declared distinct-record nonce-conflict class. A2c rules out the old no-`run` print stub but not a no-child generator. None independently proves that the command was executed.

The before/after change is therefore not nine independent demonstrations of M2 closure. The static arms and A5 carry distinct packaging/corpus functions; do not attribute their passes to captured invocation authenticity.

## (b) Can a do-nothing control reach all nine arms?

### Historical answer, version-qualified

The v2 **full frozen-counter** forger result is already recorded in the wave-1 RevCounterA report:

```text
$ node /tmp/a51-committed.mjs /tmp/forger-lane 9cb611b7761fe04081ba9d90658f17a5b65f1ebc
ATTEST51: ATTEST_HELD held=5/5 checks=5 rev=9cb611b7761fe04081ba9d90658f17a5b65f1ebc rule=A51 | A1 PASS | A2 PASS | A3 PASS | A4 PASS | A5 PASS
PROBE_EXIT=0
```

That report explains that the stub fabricated the receipts during its purported selftest, did not implement `run`, and stubbed its proxy. This is **historical quoted evidence**, not a rerun by this seat. The later recorded v3 replay is 5/7: A2c/A3c fail at `run exit=64`. Plan addendum items 7/8 then add A4c and A3d. Thus **neither the untouched before tree nor that literal old print-only stub is a v3r6 9/9 control**. The unpredictable nonce does not fix the separate issue that its expected output is disclosed verbatim in argv.

### New strongest local counterexample: no requested child, all nine unchanged arms pass

I extracted the assigned tip into an isolated directory under `/tmp/kumitate-r51-critclaims.fJnddz`, without a Git mutation. In that scratch extraction only:

1. Replace the instrument's single `spawnSync(cmd[0], cmd.slice(1), ...)` in `doRun` with an object whose stdout is `Buffer.from(cmd.at(-1))`, stderr is empty, and exit is 0. **It never launches the requested command.** Retain the real digest/sidecar/clock/ledger verifier.
2. Replace the selftest dispatch with the PASS token, without running any tests.
3. Supply three expressly synthetic, correctly hashed records with a 600-second displayed span and distinct nonces, plus the exact stale-sidecar prelude negative control.
4. Re-pin the counterfeit's bytes in the extracted scorecard. **Keep and execute the real extracted proxy-check, not a proxy stub.**
5. Execute A51's unchanged source from `// A1` through the end of A5 in a VM with the real filesystem/process helpers. The only transport substitution is pointing `runTool` at this scratch tool; no check or comparison is removed.

Command actually run:

```sh
node /tmp/kumitate-r51-critclaims.fJnddz/review.mjs
```

Output (complete substantive diagnostic):

```text
INPUT rev=7d88faa733c5621da1cac174515e4a7d7d8896ea A51=73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c D51=f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0 instrument=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
D51_COMMITTED_ENTRY_ARMS=[{"id":"D1","ok":false,"detail":"trio incomplete in first 5 lines"},{"id":"D2","ok":false,"detail":"clauses=12 bound=5 hash-miss=0"}]
NO_CHILD_CONTROL run_exit=0 touch_target_exists=false
A51_UNCHANGED_ARM_DIAGNOSTIC=[{"id":"A1","ok":true,"detail":"selftest PASS"},{"id":"A2","ok":true,"detail":"3 receipts VALID span=600s nonces=distinct sha=distinct"},{"id":"A2c","ok":true,"detail":"challenge bound argv+stdout(a51c-1a5eb) sha256sum -c ok"},{"id":"A3","ok":true,"detail":"prelude-replay rejected"},{"id":"A3c","ok":true,"detail":"live prelude-tamper rejected"},{"id":"A4","ok":true,"detail":"prior-files=162"},{"id":"A4c","ok":true,"detail":"twinValid=true ledger(orig)=REPLAY ledger(twin)=REPLAY"},{"id":"A3d","ok":true,"detail":"corrupt-digest rejected as REPLAY"},{"id":"A5","ok":true,"detail":"pin match;proxy MATCH"}]
ARM_TOTAL=9/9 NOT_A_COMMITTED_FROZEN_COUNTER_SCORE
REAL_REDATE_REPAIRED_SIDECAR prelude_shift_s=30 same_inner_digest=true exit=0 last="RECEIPT: VALID"
SCOPE: scratch extraction and fixture mutations only; no lane edits, git mutations, full frozen counter score, harm battery, fleet census or judgment runtime.
```

Harness exit 0, Node `v24.21.0`. The no-child witness requests `/usr/bin/touch` of `/tmp/kumitate-r51-critclaims.fJnddz/SHOULD_NOT_EXIST`; the request succeeds according to the counterfeit, but the target is absent.

**Precision of conclusion:** this is **nine unchanged arms passing**, not a new frozen-counter score over a committed counterfeit revision, and not a reading at the unavailable real close commit. A complete counterfeit committed tree with these same relevant bytes would satisfy these arms **[INFERENCE]**; I did not create such a revision. The untouched actual close commit cannot be called a counterfeit on this evidence.

The word “do-nothing” matters: the counterfeit does useful integrity/ledger work, so it is not “no code whatsoever.” It is a **zero-requested-child / no captured invocation** control, which falsifies the stronger inference that the nine arms prove `run` executes the command. It does not falsify the counterfeit's ability to reject the narrow stale-sidecar M2 edit, because that part of its verifier is real.

### Additional observed ceiling: do not overclaim the ledger

The same harness also ran the **unchanged shipped instrument**, made a real receipt, shifted only its display prelude by +30 seconds, recomputed only its public outer sidecar, and verified the edited receipt with a ledger containing the original. It read VALID, exit 0, as shown above. The inner digest remains identical, so the plan's same-digest exemption applies; the verifier also allows 60 seconds of prelude slack.

This does **not** break the frozen exact M2 class, which requires the sidecar to stay untouched. It **does** refute the instrument header's broader lines 39–40, “A forger who also recomputes the sidecar still hits the ledger,” and the entry's lines 32–33 if read as rejecting every re-dated prelude after a repaired sidecar. That is a correctable overstatement, not grounds for secretly widening the frozen threat model or claiming temporal proof.

### C1 critic disposition and smallest safe correction

**Qualified, not established end-to-end by HELD alone.** The shipped code contains a real capture path and a meaningful narrow integrity verifier; the base lacks it. The narrow prelude-only/stale-sidecar rejection is not falsified here. The stronger “all nine arms exclude no-invocation fabrication / prove genuine command capture” attribution **is falsified**.

Required changes:

- Carry the precise arm attribution above into the close evidence; preserve the old v2 full 5/5 result as historical, not as a v3r6 success or failure.
- Do not state that A2c proves execution because its nonce is unpredictable: the fake can hash that nonce once it is passed in argv. To retain an actual-execution predicate, an appropriately adjudicated future counter needs an independently observed child-execution witness, not only outputs computable from argv. A probe-owned side effect would kill this literal mutant, but is not a universal authenticity proof against arbitrary tree-controlled code.
- If the declared author-attestation ceiling is retained instead, say explicitly that the challenges discriminate the named print-stub/tamper classes, **not every zero-child counterfeit**. Do not silently present this narrowed evidential statement as satisfying a stronger canonical claim.
- Correct the overbroad repaired-sidecar/ledger prose to account for same-digest exemptions and prelude slack. No temporal-authentication requirement is added by this review.

The capture-discrimination defect is fixable by a properly scoped measurement/claim correction. The author-controlled trust ceiling is a real tradeoff: the canonical judge must reject an overclaim rather than turn record integrity into temporal/execution authenticity by wording alone. I did not alter a frozen rule.

## (c) C2: new ground or duplicate authority?

### Quote and compare the existing rules

Q39 already says:

> “a claim of time-spaced re-runs needs a distinct, captured invocation receipt for each run.”

Its final limit already says:

> “The receipts are author-attested invocation records; defeating a forger needs a separately frozen captured-invocation design, not a text check.”

The existing counter/amendment doctrine already says:

> “C9 The receipts are independent and time-spaced. Re-runs are separate invocations at different times, never copies of one output”

and:

> “C11 A capability row enters with a running demonstration, not with a plan.”

Its lines 12–13 also already distinguish hash binding from prose truth:

> “The binding proves the receipt exists and is unchanged — it does not prove the clause's prose is true”

The new entry's lines 24–27 instead specify:

> “The inner `digest` field binds every semantic field … as sha256 over the canonical JSON with the `digest` field removed (parse, drop, sort keys recursively, one line — semantic re-canonicalization, not textual excision).”

Its lines 37–39 specify:

> “`--ledger` flags a nonce only when another receipt binds the SAME nonce to a DIFFERENT record digest; byte-identical duplicates are exempt”.

**Novelty finding:** the precise division of responsibility between whole-file sidecar, canonical semantic digest, nonce-conflict ledger and monotonic duration **is new mechanism-level ground relative to these two comparators**. It is not merely a renamed Q39. Separate invocations, distinct receipts, scheduled span, the author-attestation ceiling and hash-bound prose **are already-held policy**, not new coverage. Preserve Q39 and the prior doctrine as the authorities for those obligations; the new entry should explain the instrument and its failure model, not become a second admission authority. None of this implies a numeric coverage-successor increase.

### Actual integrated D51 defects, independently exercised

Before changing anything in scratch, the harness executed D51's **unchanged D1/D2 blocks** against the entry extracted at the assigned revision; the binding checks used real read-only `git show` against that revision. The observed output above is:

```text
D1 MISS trio incomplete in first 5 lines
D2 MISS clauses=12 bound=5 hash-miss=0
```

- **D1 is genuinely false:** the integrated heading starts at line 1, source detail occupies lines 3–8, `verified-at:` is line 9 and `recheck:` line 10. The repaired counter only examines its first five lines; the plan asks for the trio in the first three. This is not an unavailable-receipt dependency.
- **D2 is genuinely false:** there are twelve bullet-head lines, but only five have a binding on the same line as `- `. Several tokens are on continuation lines or only mentioned in prose. The five found tokens hash correctly. Hash-match success for five lines is not twelve clause bindings.

These are direct failures of the current entry under the frozen repaired counter, separate from the earlier D3 column bug already repaired in addendum item 2. D3/D4/D5 were not executed here; no full DOCTRINE_HELD or DOCTRINE_UNMET run is claimed. D1/D2 alone preclude HELD for this entry snapshot regardless of the other three arms.

The source scope concern from the wave-1 CritC2 review also survives in the visible entry: Linux `getrandom(2)` semantics do not by themselves establish the installed Node/OpenSSL call chain. Treat the claim “Node's bytes come from [this interface]” as needing its own bridge evidence or narrow it to the documented Linux interface semantics. The primary novelty here is the new mechanism, not a new general receipt policy or an inferred implementation call chain.

### C2 critic disposition and smallest safe correction

**Substantively novel in mechanism, but not satisfied as integrated.** Required changes are entry changes, not a counter relaxation:

1. Put `source:`, `verified-at:`, and `recheck:` on the first three physical lines; move verbose fetched-byte detail below them.
2. Put a relevant matching committed-byte token on **each of the twelve bullet-head lines**. Do not pad twelve generic duplicated tokens: Q38 and the old doctrine require the substantive non-author reread that D51 cannot supply.
3. Make the mutation/property matrix explicit: stale outer sidecar → TAMPERED; corrupt inner digest → REPLAY; same nonce/different record → ledger REPLAY; coordinated rewrite/fresh metadata → author-attestation ceiling. Include the repaired-sidecar/same-digest counterexample rather than the unconditional ledger assurance.
4. Cross-reference Q39 and the existing doctrine for the already-held policy; narrow or separately source the Node/kernel bridge. Attribute new coverage to the new mechanism and its evidenced boundary only.

These are fixable content/provenance defects. Calling duplicate receipt policy or a well-bound false assertion “new ground” would instead be an overclaim for canonical rejection, not a different route/judgment supplied by this reviewer.

## Execution provenance and reproducible control

Actual identity command:

```sh
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/counter-amendment-discipline.md
```

Output:

```text
73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs
f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs
44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs
0cfe8ef67fd4f36527f92fad7a4066ebd6abf06cb395da7f79fbcecd82a010ab  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/invocation-attestation.md
a68c29eeb892b1fb50d125eb8598c71ebc5a541a2577f24e32cdcbace408a54c  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/counter-amendment-discipline.md
```

Harness identity command/output:

```text
sha256sum /tmp/kumitate-r51-critclaims.fJnddz/review.mjs
458b6c675d915727c1473e4358b676ef4aafa692590b46913e8a3687a03f5f37  /tmp/kumitate-r51-critclaims.fJnddz/review.mjs
node --version
v24.21.0
```

One setup command failed before execution: `/usr/bin/node /tmp/kumitate-r51-critclaims.fJnddz/review.mjs` returned `command not found: /usr/bin/node`, exit 127. `command -v node` resolved the installed fnm Node; the harness was corrected to use `process.execPath` for child Node calls and then the command above completed, exit 0. No runtime was installed or upgraded.

The exact executed harness is retained below so the counterexample does not depend solely on a temporary path. Its writes target only its isolated scratch extraction and controls; no source path in the lane is written.

```js
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash, randomBytes } from 'node:crypto';
import vm from 'node:vm';

const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const rev = '7d88faa733c5621da1cac174515e4a7d7d8896ea';
const root = '/tmp/kumitate-r51-critclaims.fJnddz';
const T = join(root, 'tree');
fs.mkdirSync(T);
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { encoding: 'utf8', timeout: 120000, maxBuffer: 64 << 20, ...opts });
const ar = sh('/usr/bin/bash', ['-c', 'set -o pipefail; /usr/bin/git -C "$1" archive "$2" | /usr/bin/tar -x -C "$3"', '--', lane, rev, T]);
if (ar.status !== 0) throw new Error(`archive exit=${ar.status} ${ar.stderr}`);
const sha = b => createHash('sha256').update(b).digest('hex');
const probe = fs.readFileSync(join(T, '.ufo/waves/round-51/probe/attest51-probe.mjs'), 'utf8');
const dprobe = fs.readFileSync(join(T, '.ufo/waves/round-51/probe/doctrine51-probe.mjs'), 'utf8');
const tool = join(T, 'scripts/receipt-attest.mjs');
const source = fs.readFileSync(tool, 'utf8');
console.log(`INPUT rev=${rev} A51=${sha(probe)} D51=${sha(dprobe)} instrument=${sha(source)}`);
const entry = fs.readFileSync(join(T, 'corpus/knowledge/invocation-attestation.md'), 'utf8');
const dChecks = [];
const d1d2 = dprobe.slice(dprobe.indexOf('  // D1\n'), dprobe.indexOf('  // D3\n'));
vm.runInNewContext(d1d2, { text: entry, head: entry.split('\n').slice(0,5).join('\n'), hold: (id, ok, detail) => dChecks.push({id,ok,detail}), spawnSync, lane, rev, sha, Buffer });
console.log('D51_COMMITTED_ENTRY_ARMS=' + JSON.stringify(dChecks));

const runNeedle = "  const r = spawnSync(cmd[0], cmd.slice(1), { encoding: 'buffer', maxBuffer: 64 << 20 });";
const selfNeedle = '  selftest();\n';
if (source.split(runNeedle).length !== 2 || source.split(selfNeedle).length !== 2) throw new Error('mutation target not unique');
const mutant = source.replace(runNeedle, "  const r = { stdout: Buffer.from(cmd.at(-1) ?? '', 'utf8'), stderr: Buffer.alloc(0), status: 0 };")
  .replace(selfNeedle, "  out('ATTEST_SELFTEST: PASS\\n'); process.exit(0);\n");
fs.writeFileSync(tool, mutant);
const runTool = args => sh(process.execPath, [tool, ...args], { cwd: T });
const sentinel = join(root, 'SHOULD_NOT_EXIST');
const ctrl = runTool(['run', '--out', join(T, 'never-executed'), '--', '/usr/bin/touch', sentinel]);
console.log(`NO_CHILD_CONTROL run_exit=${ctrl.status} touch_target_exists=${fs.existsSync(sentinel)}`);

// Fixtures are expressly synthetic controls, not an assertion about the scheduled run 3.
const rd = join(T, '.ufo/waves/round-51/receipts');
fs.mkdirSync(rd, {recursive:true});
const canonical = x => JSON.stringify(Object.fromEntries(Object.keys(x).sort().map(k => [k,x[k]])));
const rnames = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
for (let i = 0; i < 3; ++i) {
  const wall = new Date(Date.UTC(2026,9,23,0,i*5)).toISOString();
  const body = {argv:['/usr/bin/printf','%s', 'synthetic-'+i], exit:0, mono_span_ms:0, nonce:randomBytes(16).toString('hex'), stderr_sha256:sha(''), stdout_sha256:sha('synthetic-'+i), wall_start:wall, wall_end:wall};
  body.digest = sha(canonical(body));
  const p = join(rd, rnames[i]);
  const bytes = `run-at: ${wall}\n${canonical(body)}\n`;
  fs.writeFileSync(p, bytes);
  fs.writeFileSync(`${p}.sha256`, `${sha(bytes)}  ${basename(p)}\n`);
}
const p2 = join(rd, rnames[1]);
const replay = join(rd, 'attest-run-2-replayed.txt');
fs.writeFileSync(replay, fs.readFileSync(p2, 'utf8').replace(/^run-at:.*$/m,'run-at: 2020-01-01T00:00:00.000Z'));
fs.copyFileSync(`${p2}.sha256`, `${replay}.sha256`);
// A5 packaging is not exempted: retain the real extracted proxy, re-pin the mutated bytes.
const sc = join(T, 'SCORECARD.md');
fs.writeFileSync(sc, fs.readFileSync(sc,'utf8').split(sha(source)).join(sha(mutant)));
const checks = [];
const arms = probe.slice(probe.indexOf('  // A1\n'), probe.indexOf('} catch (e) {\n  process.stderr.write(`ATTEST51: FAIL-CLOSED'));
const sandbox = { ...fs, join, tmpdir, randomBytes, Buffer, process, T, S:join(T,'scripts'), tool, runTool, sha, sh, ORIGIN:'/home/vgpnk/Projects/ufo-fsd-alpha', RECEIPTS:rnames, RDIR:'.ufo/waves/round-51/receipts', lastLine:r=>`${r.stderr||''}${r.stdout||''}`.trim().split('\n').pop()||'', hold:(id,ok,detail)=>checks.push({id,ok,detail}) };
vm.runInNewContext(arms,sandbox,{timeout:120000});
console.log('A51_UNCHANGED_ARM_DIAGNOSTIC=' + JSON.stringify(checks));
console.log(`ARM_TOTAL=${checks.filter(x=>x.ok).length}/${checks.length} NOT_A_COMMITTED_FROZEN_COUNTER_SCORE`);

// The shipped verifier's actual scope: a re-dated prelude with a repaired sidecar
// and an unchanged semantic digest falls under the explicit same-digest exemption.
const realTool = join(root, 'real-receipt-attest.mjs');
fs.writeFileSync(realTool, source);
const good = join(root, 'real');
const rr = sh(process.execPath,[realTool,'run','--out',good,'--','/usr/bin/printf','%s','real-control']);
if(rr.status !== 0) throw new Error('real control run failed');
const original = `${good}.txt`;
const parts = fs.readFileSync(original,'utf8').split('\n');
const old = parts[0];
parts[0] = 'run-at: ' + new Date(Date.parse(old.slice(8))+30000).toISOString();
const shifted = join(root,'redated.txt');
fs.writeFileSync(shifted,parts.join('\n'));
fs.writeFileSync(`${shifted}.sha256`,`${sha(fs.readFileSync(shifted))}  redated.txt\n`);
const vr = sh(process.execPath,[realTool,'verify','--ledger',root,shifted]);
console.log(`REAL_REDATE_REPAIRED_SIDECAR prelude_shift_s=30 same_inner_digest=true exit=${vr.status} last=${JSON.stringify(vr.stdout.trim().split('\n').pop())}`);
console.log('SCOPE: scratch extraction and fixture mutations only; no lane edits, git mutations, full frozen counter score, harm battery, fleet census or judgment runtime.');
```

No H1–H5 harm claim is made: those batteries were not exercised here. No subagents, peer messages, judge/admission/orchestration runtime, fleet repo writes, Git/JJ mutations, or package transactions. Lane writes are confined to this report. Tools installed/updated: **none**.

Report: .ufo/waves/round-51/w2/CritClaims.md
