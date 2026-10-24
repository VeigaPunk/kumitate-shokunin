# CritC1 — C1 control-discrimination review

## Amendment — A51 v3, accepted repair and bounded recheck

**Version scope:** the original review below is preserved as evidence against **A51 v2**, not a claim that the same literal stub survives v3. The parent reports v3 frozen at **`8c07e880`**. The append-only **`plan.md:157–193`, “Freeze repair addendum”**, item 3, accepts the v2 falsification and changes the predicate to seven checks: A1, A2, A2c, A3, A3c, A4, A5. Items 1–2 retain the earlier `1fd8aceb` and `3ed875d3` repair history.

The v3 before-state is recorded in the absolute lane path `.ufo/waves/round-51/base/attest-base-v3.txt:1–4`:

```text
run-at: 2026-10-24T02:09:06Z
counter: A51 v3
ATTEST51: ATTEST_UNMET held=0/7 checks=7 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=A51 version=v3 | A1 MISS scripts/receipt-attest.mjs absent | A2 MISS attest-run-1.txt:absent;attest-run-2.txt:absent;attest-run-3.txt:absent | A2c MISS tool absent | A3 MISS attest-run-2-replayed.txt absent | A3c MISS tool absent | A4 MISS tool or receipts dir absent | A5 MISS tool or SCORECARD absent
exit=1
```

I read this committed-baseline artifact; I did not rerun the successful base measurement or claim its execution as my own.

### Does the previously demonstrated literal print-stub still survive?

**No.** I executed v3's unchanged A2c and A3c arm source in the same bounded, in-memory transport, invoking the exact old stub in real Node children. Both arms reject it at `run`: the stub exits 64 and creates no receipt. This is a meaningful improvement on the operability/control-discrimination axis, without converting the old 4/4 diagnostic into a v3 result.

Actual command: `node --input-type=module -e <v3_probe_program>`, via the same subprocess controller, cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, timeout 30 s. Output:

```text
{"diagnostic":"v3 A2c/A3c in-memory arms, literal v2 print-stub; not a full score","probeSha256":"5e75af7983330b5c1091dbca6e3b405036c01a73434fed11e58365b1390ee913","stubSha256":"f57cbe4b8d1336738efe787f6a81914f442aa29d3e5042fabd95cf165d4a6e51","checks":[{"id":"A2c","ok":false,"detail":"run exit=64 last=\"\""},{"id":"A3c","ok":false,"detail":"run exit=64"}],"runtime":"v26.12.0"}
exit=0
```

This is **two failed challenge arms**, not a full 0/7 or 5/7 score on a fake committed tree. Source evidence: v3 A2c checks fresh receipt existence, a probe nonce at the end of argv, the expected stdout hash, delegated VALID, and `/usr/bin/sha256sum -c` (`attest51-probe.mjs:141–166`). A3c issues another `run` and requires rejection of its altered prelude (current snapshot:179–206). No v3 after-state HELD reading was exercised by this seat, so this amendment does not declare C1 verified end-to-end.

### Sidecar-transfer correction observed while reading v3

The first v3 snapshot I read and hashed had:

```text
cc9bb98b8ca6c31550cd49f777da81a1cd162267c4607dacc54bdfe42d38160d  plan.md
218f43823e9fff0b83f9b9414f5f0ea4261763536b16b42780da54ef67459b4a  probe/attest51-probe.mjs
```

That A3c wrote `${rcpt}.tampered` but did not transfer the original sidecar to `${tampered}.sha256` (then-lines 188–196). I reported this new, fixable defect to the parent: missing-sidecar behavior is not the declared prelude-only forgery with an unchanged sidecar. Before the bounded stub recheck completed, the source changed. The diagnostic's own hash above identifies the corrected bytes; a fresh read observes the added unchanged-sidecar copy at current lines 196–198. The parent subsequently identified the accepted repair as **`8fd3cde172026f33ef6af7396afbfe98ce7c7d14`** (`8fd3cde1`), now explicitly recorded in **addendum item 6, `plan.md:194–198`**, alongside the v3 freeze `8c07e880`. The parent reports the post-repair base remeasurement remains `ATTEST_UNMET held=0/7`; I did not rerun it. I did not edit the probe.

The transfer omission is therefore **addressed in the later source snapshot**, not an outstanding allegation against those bytes. The more general review limit remains: A3c does not positive-verify its own generated receipt before mutation, and uses a distinguishable `.tampered` filename. Consequently, rejection of this literal stub is not proof that every stronger file-producing, filename-dispatching forger is excluded. No such stronger v3 forger was executed here. The original smallest-safe recommendation—positively validate and then mutate the same arbitrary filename—still explains the boundary without inventing an unrun result.

### Ledger clarification: supersedes the original membership ambiguity

Addendum **item 4 (`plan.md:181–188`)** now defines reuse as the **same nonce bound to a different record digest**; the target and same-digest duplicates are exempt. This resolves the original control/run-2 coexistence ambiguity under a changed, explicit rule. It is not the original literal “reject every nonce reuse across physical receipt files” rule: the same semantic digest may appear again, including when only an unbound display prelude differs. Later claim wording must carry this clarification rather than silently retain the broader nonce-freshness sentence.

**Amended review conclusion:** v2's control-discrimination defect is accepted in the addendum, and v3 demonstrably kills the exact literal print-stub previously tested. The original v2 readings remain valid historical evidence. V3's recorded base is UNMET 0/7; its complete after-state behavior, integration, and stronger-forger resistance were not verified by this seat. A2's honestly declared author-scheduling/Q39 ceiling remains unchanged.

---

## Axes and review conclusion

**Declared axis attacked:** operability / capability acquisition, not a higher operability integer (plan.md:21–24, 104–109). Review dimensions: negative-control discrimination, attribution to M2 closure, record integrity, and honest temporal provenance. C2 is not reviewed here.

**Historical v2 conclusion:** the repaired v2 counter establishes the stated **before** reading, but C1 is **not established as declared by its v2 negative-control argument**. The assertion that a verdict-printing stub cannot clear A1 or A3 is false. A bounded, real-execution stub cleared both and every A1–A4 arm when given fabricated distinct metadata. A5 was not executed against an integrated fake tree; no full `ATTEST_HELD held=5/5` reading is claimed. Its pin/proxy test supplies packaging consistency, not an independent check of invocation capture or digest binding. An integration failure at A5 would not distinguish a fake instrument from a genuine one. See the amendment above for v3's added challenges and their observed rejection of this stub.

This is a critic finding, not a canonical judgment or an admission decision. A2's author-scheduled timing is an honestly declared tradeoff, not a defect requiring cryptographic temporal proof.

## (a) Before state: observed, after an explicit parse repair

All local filesystem paths below are rooted at:

`/home/vgpnk/Projects/shokunin/kumitate-shokunin`

Command run, with that directory as cwd:

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin c90b9de94009b938fa19a089bfaa97df20b54f86
```

The **first** execution failed before scoring:

```text
file:///home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs:20
 *       receipt corpus file under .ufo/waves/round-4*/** at rev (the sweep prints what it
                                                       ^^
SyntaxError: Unexpected token '**'
Node.js v24.21.0
exit=1
```

The `*/` in the block-comment glob terminated the comment. This initial execution is not an `ATTEST_UNMET` measurement, and did not implement the declared crash exit 2 (plan.md:65–66). I reported it to the parent and did not edit the frozen file.

During review the parent supplied the repair record: **`1fd8aceb`** repairs A51's comment termination; **`3ed875d3`** repairs D51's SOURCES indexes to status `c[8]` and used-by `c[11]`. The latter is cited as parent-reported context only: I did not test D51 or independently diagnose that defect. The blocker is resolved. I reran the explicitly assigned base command against the repaired A51 bytes, obtaining:

```text
ATTEST51: ATTEST_UNMET held=0/5 checks=5 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=A51 | A1 MISS scripts/receipt-attest.mjs absent | A2 MISS attest-run-1.txt:absent;attest-run-2.txt:absent;attest-run-3.txt:absent | A3 MISS attest-run-2-replayed.txt absent | A4 MISS tool or receipts dir absent | A5 MISS tool or SCORECARD absent
exit=1
```

Thus plan.md:69's expected before state is now a real reading, but under the repaired counter identity, not the initially unparsable bytes.

A separate read-only committed-tree check was also run:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree c90b9de94009b938fa19a089bfaa97df20b54f86 -- scripts/receipt-attest.mjs .ufo/waves/round-51/receipts .ufo/waves/round-51/probe/attest51-probe.mjs
```

Output: empty; exit 0. Those requested paths are not present in the base tree. This independently supports absence, not an after-state claim.

## (b) Strong cheap forger: which check actually stops it?

### Executed control

The forger does no command capture, no filesystem reads, no digest verification, and no ledger inspection. It only dispatches on arguments:

```js
const a = process.argv.slice(2);
if (a[0] === '--selftest') { console.log('ATTEST_SELFTEST: PASS'); }
else if (a[0] === 'verify') { const bad = a.at(-1).endsWith('attest-run-2-replayed.txt'); console.log('RECEIPT: ' + (bad ? 'TAMPERED' : 'VALID')); process.exitCode = bad ? 1 : 0; }
else process.exitCode = 64;
```

Exact stub bytes, including final newline, sha256:

`f57cbe4b8d1336738efe787f6a81914f442aa29d3e5042fabd95cf165d4a6e51`

I executed the repaired counter's **unchanged A1–A4 arm source** in an in-memory extracted-tree view. Every `node receipt-attest.mjs ...` call was transported to an actual Node child executing the stub with the same argv. The view contained the real 162 base-commit receipt-like blobs selected by the probe's basename rule, loaded with read-only `git ls-tree` / `git cat-file --batch`; synthetic round-51 fixtures were never written to the checkout. This was an arm-level diagnostic, **not** a frozen-counter run over a committed fake revision. No Git/JJ mutation or auxiliary file was created.

Fixtures: three `run-at:` preludes at 00:00, 00:05 and 00:10 UTC, plus a JSON line containing only `nonce`; the replay fixture is exactly receipt 2 with only its prelude changed and its sidecar retained. One run used deliberately wrong zero sidecars, another used correct whole-file SHA256 sidecars. Neither fixture set represents captured invocations; neither has the contract's inner digest or other required semantic fields.

Observed diagnostic outcomes:

| Sidecars for three positive fixtures | Nonces | A1 | A2 | A3 | A4 | Executed arms |
| --- | --- | --- | --- | --- | --- | --- |
| Wrong (three zero hashes) | identical | PASS | MISS `nonce-not-distinct` | PASS | PASS | 3/4 |
| Wrong (three zero hashes) | distinct | PASS | PASS, `span=600s` | PASS | PASS | 4/4 |
| Correct whole-file hashes | identical | PASS | MISS `nonce-not-distinct` | PASS | PASS | 3/4 |
| Correct whole-file hashes | distinct | PASS | PASS, `span=600s` | PASS | PASS | 4/4 |

A4's detail was `prior-files=162` in all four rows. In particular, **A4 still passed with three identical positive nonces**, despite the stub never looking at a ledger. The identical-nonce control is stopped by **A2's independently computed distinctness check**, not by A1, A3 or a demonstrated ledger rejection. Assigning three fresh nonce strings removes that obstacle.

Final valid-sidecar diagnostic output, from `node --input-type=module -e <valid_forger_program>` (via a Python subprocess controller; exit 0):

```text
probeSha256=422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1
{"diagnostic":"raw frozen A1..A4 in-memory arms; not a counter score","duplicateNonces":true,"checks":[{"id":"A1","ok":true,"detail":"selftest PASS"},{"id":"A2","ok":false,"detail":"nonce-not-distinct"},{"id":"A3","ok":true,"detail":"prelude-replay rejected"},{"id":"A4","ok":true,"detail":"prior-files=162"}],"held":3,"total":4,"priorBlobs":162,"independentlyInvalidSidecars":0,"stubSha256":"f57cbe4b8d1336738efe787f6a81914f442aa29d3e5042fabd95cf165d4a6e51","runtime":"v26.12.0"}
{"diagnostic":"raw frozen A1..A4 in-memory arms; not a counter score","duplicateNonces":false,"checks":[{"id":"A1","ok":true,"detail":"selftest PASS"},{"id":"A2","ok":true,"detail":"3 receipts VALID span=600s nonces=distinct sha=distinct"},{"id":"A3","ok":true,"detail":"prelude-replay rejected"},{"id":"A4","ok":true,"detail":"prior-files=162"}],"held":4,"total":4,"priorBlobs":162,"independentlyInvalidSidecars":0,"stubSha256":"f57cbe4b8d1336738efe787f6a81914f442aa29d3e5042fabd95cf165d4a6e51","runtime":"v26.12.0"}
A5 NOT EXECUTED: full proxy integration is not part of this in-memory diagnostic.
```

The diagnostic controller's Node resolved to v26.12.0; the original Bash base invocation reported v24.21.0. No runtime was installed or upgraded by this seat. Early diagnostic attempts were discarded: one had an erroneous `.map(basename)` callback, and one line-number slice omitted A4 after the concurrent comment repair added a line. The reported final results use marker-bounded A1–A4 source and explicitly include all four holds.

### Why the declaration fails

References in this section use the repaired A51 line numbers:

- **A1 (71–81):** checks exit 0 plus a regex substring in the final combined-output line. It neither checks ≥10 cases nor establishes that any case ran. Plan.md:70–72's “cannot clear A1” and “exact final line” assurances exceed this implementation. The stub clears it.
- **A2 (85–117):** delegates validity to the proposed tool, then independently checks only parseable metadata, distinct positive nonces, distinct file hashes and a displayed span. It accepts even the three wrong sidecars in the diagnostic. It does not independently recompute the inner digest or capture any invocation.
- **A3 (119–128):** only asks the tool for a verdict on the publicly known `attest-run-2-replayed.txt` path. It does not compare that file with run 2, prove that only the prelude changed, prove that the original sidecar was retained, or independently validate either digest. The stub clears it by filename. Printing `TAMPERED` here is not evidence of “genuine digest binding” (plan.md:71–73).
- **A4 (130–164):** delegates ledger verdicts, then performs a genuine but finite substring sweep for the positive nonces in prior receipt-like files. Fresh fabricated nonces avoid that sweep. There is no independent negative nonce-reuse challenge. The duplicated-nonce result demonstrates the attribution gap.
- **A5 (166–180):** compares the script's actual hash with a scorecard string, then delegates strict proxy consistency. A stub is as hashable as an implementation. **[INFERENCE]** Once ordinary planned integration makes the gate-pin registry and all counts consistent, this arm adds no behavior-sensitive obstacle to the forger. This is a design conclusion, not an observed 5/5 score.

The existing proxy corroborates that boundary: `scripts/proxy-check.mjs:93–105, 934–939, 1112–1129, 1333–1338` derive counts, compare hashes and compare axes; they do not execute receipt-attest. Its current gate-key list (461–471) does not yet include `pin.receipt-attest`, and its parser (1053–1056) rejects an unknown key. Therefore **the unmodified proxy would block a properly placed new gate pin for both genuine and fake instruments** until the declared integration is performed; that is not an M2 discriminator. I did not run a new live proxy check. The pre-existing baseline transcript at `.ufo/waves/round-51/base/baseline-gates.txt:1–3` records `PROXY: MATCH`, exit 0, before that integration.

**Severity: high, fixable predicate/control defect.** The strongest observed control clears all four behavior-facing arms without implementing the capability. The assertion that A1/A3 defeat verdict-string forgery must not survive unchanged. A real full 5/5 fake-tree test remains unexercised by this read-only seat and is not represented as passed.

## (c) Attribution: survival without closing the M2 class

The historical gap is invocation independence, not different output bytes (`corpus/lessons/round-50.md:25–38`; `corpus/QUALITY.md:754–772`).

| A-check | Could pass without M2 closure? | Attribution limit |
| --- | --- | --- |
| A1 | Yes | A selftest can cover other cases, or merely print the token. No independently imposed prelude-mutation test is required here. Even ≥10 honest tests could omit prelude coverage. |
| A2 | Yes | Genuine fresh receipts and fabricated distinct metadata both pass; no M2 attack is applied. |
| A3 | Yes for the observed filename-dispatch stub; no for a straightforward prelude-blind verifier faced with a faithful control | It is the sole direct prelude-mutation arm, but the counter does not establish its fixture's provenance or content-sensitive rejection. |
| A4 | Yes for the observed weak ledger / verdict stub; not guaranteed for an honest inclusive ledger | Nonce uniqueness is different from prelude integrity. There is also a fixture-membership caveat below. |
| A5 | Yes, conditional on normal integration consistency | Pinning identifies the bytes being tested; it does not establish their functionality. |

**Important A4 caveat:** the doctored negative fixture is in the very ledger directory being scanned and shares run 2's nonce (plan.md:34–35, 58–61). An honest ledger that considers every parseable `*.txt` will reject run 2 even if prelude hashing is correct; a ledger that first excludes invalid receipts may let the correct tool pass, but a prelude-blind tool could then treat the replay as valid and fail A4 indirectly. Accordingly, I do **not** claim that A4 must pass every realistic prelude-blind mutant. Its membership policy needs an explicit definition. The observed stub bypass is unaffected, and the probe itself does not check that policy.

Small correction for that ambiguity: define the positive nonce corpus as valid receipts only and keep deliberate invalid controls outside the positive ledger, or construct a separate valid-only ledger for A4. Then test nonce reuse with an independent negative fixture instead of relying on accidental interaction with A3.

## (d) A2 timing: honestly author-scheduled, not temporal proof

Yes. Plan.md:148–151 explicitly says the ≥300 s span is author-scheduled, by three L1 runs, and limits it to the inherited invocation-independence class. Plan.md:45–48 separately states that the records are author-attested, not cryptographic temporal proof.

The implementation matches the weak measurement boundary: A51:98–108 reads the embedded `wall_start` only as a fallback and lets the display prelude override it; it measures the three parsed prelude timestamps, not observed scheduler delay or a cross-invocation monotonic interval. The diagnostic obtains the required 600 s display span by constructing strings. The counter cannot independently establish that those minutes elapsed between invocations.

This label is honest. Do not turn a correct sidecar/digest/nonce implementation into a claim that the author cannot fabricate an internally consistent record. Recomputing an unkeyed sidecar after re-dating, or rebuilding an old deterministic body with fresh metadata, is beyond the narrowly frozen “rewrite only the prelude, retain the sidecar” control. The Q39 ceiling is a real limit, not an omitted temporal authority to add silently.

## Smallest safe correction / predicate wording

**If retaining the current counter unchanged, replace plan.md:70–73's causal assurance with an honest one:**

> A1 observes the tool's reported selftest token; A3 observes its reported verdict on the supplied control. Neither independently establishes digest binding. The identical-nonce static control is stopped by A2. A fresh-nonce verdict-dispatching control clears A1–A4; A5 checks integration consistency only. Therefore ATTEST_HELD alone does not establish M2 closure.

That wording corrects the evidence claim but does not prove the original capability-acquisition claim. Do not silently redefine C1's contract or report it as verified on that basis.

**If preserving C1's original machine-checked-capability meaning, explicitly repair/re-freeze the relevant predicate rather than only strengthening its prose:**

1. Make A1 include a counter-owned generated `run` challenge with known argv/output/exit, and independently check the required semantic fields, inner digest, and full-file GNU sidecar. Preserve the real selftest as additional evidence, not the authority over its own success.
2. Make A3 derive the M2 mutation from a positively checked receipt, preserve the original sidecar bytes, and run the valid and altered bytes under the same arbitrary filename. This kills the observed path-dispatch forger; independently assert the fixture relation rather than trusting a committed label.
3. State ledger membership and independently inject a duplicate-nonce negative challenge for A4. Keep the valid-only no-reuse sweep and A5's packaging checks, but do not attribute those alone to prelude integrity.

These are fixable measurement defects. Demanding actual temporal truth would instead exceed the declared Q39 tradeoff and is not the proposed correction.

## Input identities and scope

Command run:

```sh
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs
```

Initial observed identities:

```text
dc8fbc9a53379f8ab1ead3ac75f4640c52a262f903e8e1e4578640ebf6613c2c  plan.md
e06be992d3fece8f1dfb61c4acfc6bc3e5297c585fc04c390dea34d73bb1dc89  probe/attest51-probe.mjs
0c689c51ecbfee9da8d12dad6253f1c583d08d132f76a428e0ba3997b91e9682  probe/doctrine51-probe.mjs
```

A later `sha256sum` on the absolute A51 path and the diagnostic's own source hash both observed repaired A51:

`422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1`

Only this report was authored. No shipped script, corpus entry, counter, plan, state, manifest, or sibling lane was edited; no Git/JJ mutation, other agent, judgment engine, or orchestration runtime was invoked. Tools installed/updated: none. Verification exercised: the assigned base counter and the bounded control diagnostics described above; no after-state C1 score or harm battery was run.

## Historical v2 reproducible diagnostic program

**Historical-source warning:** this exact executed program reads the live probe path. Do not interpret a run against today's v3 bytes as a reproduction of the v2 result; use the v2 source identified by sha256 `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1` (repair commit `1fd8aceb`) for that reproduction. The block is retained as execution provenance, not offered as a v3 test harness.

The following is the exact `valid_forger_program` supplied as the argument to `node --input-type=module -e` by the subprocess controller. cwd was the absolute lane path above; the controller timeout was 90 s. It does not create an auxiliary file. The wrong-sidecar variant changes `sha(bytes)` in the sidecar constructor to `'0'.repeat(64)`; the reported initial diagnostic counted those three wrong hashes independently.

```js
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { join, dirname, basename } from 'node:path';
import vm from 'node:vm';
const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const base = 'c90b9de94009b938fa19a089bfaa97df20b54f86';
const probePath = join(lane, '.ufo/waves/round-51/probe/attest51-probe.mjs');
const probe = readFileSync(probePath, 'utf8');
const arms = probe.slice(probe.indexOf('  // A1\n'), probe.indexOf('  // A5\n'));
console.log('probeSha256=' + createHash('sha256').update(probe).digest('hex')); 
const sha = b => createHash('sha256').update(b).digest('hex');
const git = (args, options = {}) => {
  const r = spawnSync('git', ['-C', lane, ...args], {maxBuffer: 64 << 20, ...options});
  if (r.status !== 0) throw new Error(`git failed: ${r.stderr}`);
  return r.stdout;
};
const listing = git(['ls-tree', '-r', '-z', base, '--', '.ufo/waves']).toString();
const prior = listing.split('\0').filter(Boolean).map(row => {
  const [meta, path] = row.split('\t'); return {oid: meta.split(' ')[2], path};
}).filter(x => !x.path.split('/').includes('round-51') && /receipt|ReRun|L1-score/i.test(basename(x.path)));
const contents = git(['cat-file', '--batch'], {input: prior.map(x => x.oid).join('\n') + '\n'});
const priorFiles = new Map();
let offset = 0;
for (const item of prior) {
  const end = contents.indexOf(10, offset);
  const size = Number(contents.subarray(offset, end).toString().split(' ')[2]);
  if (!Number.isSafeInteger(size)) throw new Error('bad cat-file size');
  priorFiles.set(join(lane, item.path), contents.subarray(end + 1, end + 1 + size));
  offset = end + size + 2;
}
const stub = `const a = process.argv.slice(2);\nif (a[0] === '--selftest') { console.log('ATTEST_SELFTEST: PASS'); }\nelse if (a[0] === 'verify') { const bad = a.at(-1).endsWith('attest-run-2-replayed.txt'); console.log('RECEIPT: ' + (bad ? 'TAMPERED' : 'VALID')); process.exitCode = bad ? 1 : 0; }\nelse process.exitCode = 64;\n`;
const T = lane, S = join(T, 'scripts'), tool = join(S, 'receipt-attest.mjs');
const RDIR = '.ufo/waves/round-51/receipts';
const RECEIPTS = ['attest-run-1.txt', 'attest-run-2.txt', 'attest-run-3.txt'];
for (const duplicate of [true, false]) {
  const files = new Map(priorFiles);
  files.set(tool, Buffer.from(stub));
  const ns = Array.from({length: 3}, () => randomBytes(16).toString('hex'));
  if (duplicate) ns.fill(ns[0]);
  for (let i = 0; i < 3; i++) {
    const p = join(T, RDIR, RECEIPTS[i]);
    const bytes = `run-at: 2026-10-23T00:${String(i * 5).padStart(2, '0')}:00.000Z\n${JSON.stringify({nonce: ns[i]})}\n`;
    files.set(p, Buffer.from(bytes));
    files.set(p + '.sha256', Buffer.from(sha(bytes) + '  ' + RECEIPTS[i] + '\n'));
  }
  const rp = join(T, RDIR, 'attest-run-2-replayed.txt');
  const original = join(T, RDIR, RECEIPTS[1]);
  files.set(rp, Buffer.from(files.get(original).toString().replace('00:05:00.000Z', '01:05:00.000Z')));
  files.set(rp + '.sha256', files.get(original + '.sha256'));
  const dirs = new Set([T]);
  for (const p of files.keys()) { let d = dirname(p); while (d.startsWith(T)) {dirs.add(d); if (d === T) break; d = dirname(d);} }
  const checks = [];
  const sh = (cmd, args) => {
    if (cmd !== 'node' || args[0] !== tool) throw new Error('unexpected child');
    return spawnSync(process.execPath, ['-e', `process.argv.splice(1, 0, ${JSON.stringify(tool)});\n` + stub, '--', ...args.slice(1)], {encoding:'utf8'});
  };
  const context = {
    T, S, tool, RDIR, RECEIPTS, sha, join, sh,
    existsSync: p => files.has(p) || dirs.has(p),
    readFileSync: (p, encoding) => {if (!files.has(p)) throw new Error('missing virtual file'); return encoding ? files.get(p).toString(encoding) : files.get(p);},
    readdirSync: d => [...new Set([...files.keys(), ...dirs].filter(p => p !== d && dirname(p) === d).map(p => basename(p)))],
    statSync: p => ({isDirectory: () => dirs.has(p)}),
    hold: (id, ok, detail) => checks.push({id, ok, detail})
  };
  vm.runInNewContext(arms, context, {timeout: 15000});
  const badSides = RECEIPTS.filter(f => sha(files.get(join(T,RDIR,f))) !== files.get(join(T,RDIR,f) + '.sha256').toString().slice(0, 64)).length;
  console.log(JSON.stringify({diagnostic:'raw frozen A1..A4 in-memory arms; not a counter score', duplicateNonces:duplicate, checks, held:checks.filter(x=>x.ok).length, total:checks.length, priorBlobs:prior.length, independentlyInvalidSidecars:badSides, stubSha256:sha(stub), runtime:process.version}));
}
console.log('A5 NOT EXECUTED: full proxy integration is not part of this in-memory diagnostic.');

```
