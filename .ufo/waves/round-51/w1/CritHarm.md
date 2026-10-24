# CritHarm — round 51 harm battery review

## Scope and axes

Attacked: the completeness and measurability of H1–H5, not either claim's ambition. Axes: **operability** (old gates and the new gate actually execute), **coverage/provenance** (source and prior-round invariants), **confidentiality** (receipt publication), and **measurement integrity** (baseline identity and revision binding). This is a read-only review, not a judgment or a close measurement. No lane file other than this report was changed. No frozen counter, adjudication/orchestration runtime, or external-state operation was invoked; the bounded in-memory Node parser probe is documented below.

Paths below are relative citations under the absolute lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (`L`). The frozen baseline revision is `c90b9de94009b938fa19a089bfaa97df20b54f86` (`plan.md:3–6`). Plan citations mean `.ufo/waves/round-51/plan.md`; A51/D51 citations mean the corresponding files under `.ufo/waves/round-51/probe/`. I read the plan first, then both counters before making predicate assertions.

## H1–H5: measurable, but baseline coverage is incomplete

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base/baseline-gates.txt` **exists**. The `base/` directory contained only this file when inspected. It records exactly:

```text
1: === proxy --strict ===
2: PROXY: MATCH (A=43 C=22 operability=9; C1=19/19 C2=114/114 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
3: exit=0
27: CHECKLIST_SKIPPED: 0
28: CHECKLIST: 22/22 pass
29: VERDICT: PASS
30: exit=0
```

| Arm | Measurable at close? | Round-open baseline actually captured in `base/baseline-gates.txt`? |
| --- | --- | --- |
| H1 (`plan:116–117`) | Yes: execute the close tree's `surface-probe --checklists`, retain each item result and exit. A numerical floor alone does not establish item identity or execution of new item 23; see F2. | **Yes:** 22 individual PASS lines, lines 5–26, plus 22/22, no skips, exit 0 at 27–30. |
| H2 (`plan:118–119`) | Yes: close-tree `node scripts/{cap-run,bind-oracle,counter-rerun,round-gate}.mjs --selftest`; require respectively 12/12, 7/7, `COUNTER_RERUN_SELFTEST: PASS`, 61/61, with successful exits and PASS verdicts where emitted. | **Partial only:** cap-run and round-gate are checklist PASS entries (26 and 9), but their raw 12/12 and 61/61 summaries were not retained. No bind-oracle or counter-rerun selftest result is present. The plan's requested values are not measurements. |
| H3 (`plan:120`) | Yes: strict proxy over the same close tree, with its origin dependency recorded. | **Yes:** `PROXY: MATCH`, exit 0, lines 1–3. |
| H4 (`plan:121`) | Yes, as a **live round-end observation**, not a lane-revision-only invariant: use the exact census command at `plan:95–96`. Record time and live dependency revisions. | **No census result captured.** The sources-check checklist PASS at line 16 is a different command and cannot stand in for the fleet census. |
| H5 (`plan:122–123`) | Yes: run the frozen round-50 `bindguard50-probe.mjs L CLOSE` and `repairs50-probe.mjs L CLOSE`; require `GUARD_HELD held=8/8` and `LEDGER_HELD held=8/8`, both exit 0. R50 also depends on live census and the fleet's `master` report, so retain those identities. | **No G50/R50 readings captured.** The two 8/8 floors are declared in the plan, not observed in this baseline file. |

**F1 — MEDIUM, fixable evidence defect; impacted axes: measurement integrity, operability, coverage.** The battery is executable, but “freeze baseline = round-open measurements” (`plan:114`) overstates the supplied coverage. H1 and H3 are captured; H2 is partial; H4/H5 are not captured here. Smallest safe correction: append an evidence ledger distinguishing observed round-open results from declared floors; retain all close outputs, statuses, command/revision bindings, and external dependency identities. If L1 measures the base now to fill gaps, label that **retrospective**, not a recovered round-open run. Do not edit the frozen plan/counters or fabricate missing stdout.

Suite measurability is grounded in the summary/exit implementations: `scripts/cap-run.mjs:491–493`, `scripts/bind-oracle.mjs:176–178`, `scripts/counter-rerun.mjs:528–533`, `scripts/round-gate.mjs:1561–1564`. G50's revision extraction and verdict are specified at `.ufo/waves/round-50/probe/bindguard50-probe.mjs:7–26`; R50's external arms at `.ufo/waves/round-50/probe/repairs50-probe.mjs:7–25,102–120`.

H3 overlaps A51 A5 (`attest51-probe.mjs:165–179`) and G50 G7; H4 overlaps D51 D5 (`doctrine51-probe.mjs:110–113`) and R50 R7. Reusing gates is fine; those are shared observations, not independent additional harm coverage.

## F2 — MEDIUM: missing explicit new-checklist execution arm

**Counterexample:** add the promised receipt-attest checklist line but mark it `[x]`. The proxy still counts 23 task lines, while the checklist runner executes only the old 22. Thus `C=23` and a 22/22, exit-0 checklist run can coexist without ever executing checklist item 23. A second variant marks one old item checked and adds one new runnable item: the same numerical floor can hide loss of a baseline item unless “item-level” is enforced by identity.

Evidence: plan promises C 22→23 and registry integration (`plan:104–108`), but H1 explicitly retains the old 22/22 floor (`116–117`). The runner intentionally skips `[x]` and removes skips from both numerator and denominator (`scripts/surface-probe.mjs:24–26,994–995,1054–1062,1079–1083`). The proxy's checklist count accepts any `- [` line (`scripts/proxy-check.mjs:495,935`). A51 A1 executes the selftest directly (`attest51-probe.mjs:70–80`), not through SKILL's new checklist item; that is useful but does not prove checklist integration.

### Bounded counterexample exercised

Actual command: `node --input-type=module -e <in-memory harness>`, launched through the eval tool with cwd `L`. It extracted the existing parser and proxy count regex verbatim from the source files, then compared the current SKILL text and three in-memory variants. It spawned **no checklist commands** and wrote no files.

Exact `-e` source:

```js
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const source = readFileSync(L + '/scripts/surface-probe.mjs', 'utf8');
const proxy = readFileSync(L + '/scripts/proxy-check.mjs', 'utf8');
const skill = readFileSync(L + '/SKILL.md', 'utf8');
const grammar = source.match(/^const CHECKLIST_RE = .+;$/m)?.[0];
const countRule = proxy.match(/^const RE_CHECKLIST = .+;$/m)?.[0];
const start = source.indexOf('function parseChecklist(text) {');
const end = source.indexOf('\n}\n', start) + 3;
if (!grammar || !countRule || start < 0 || end < start) throw Error('source extraction failed');
const { parse, count } = runInNewContext('(() => {' + grammar + '\n' + countRule + '\n' + source.slice(start, end) + '\nreturn {parse: parseChecklist, count: (s) => s.split("\\n").filter(l => RE_CHECKLIST.test(l)).length};})()');
const fresh = '- [ ] Receipt-attest hermetic suite — \x60node scripts/receipt-attest.mjs --selftest\x60 → exit 0 + \x60ATTEST_SELFTEST: PASS\x60';
const cases = [['baseline', skill], ['new-unchecked', skill + '\n' + fresh], ['new-checked', skill + '\n' + fresh.replace('- [ ]', '- [x]')], ['old-checked-new-unchecked', skill.replace('- [ ] Citation gate verdict', '- [x] Citation gate verdict') + '\n' + fresh]];
const baseline = parse(skill);
for (const [id, text] of cases) {
  const items = parse(text);
  const runnable = items.filter(i => !i.checked && !i.malformed && !i.command.includes('--checklists'));
  const checked = items.filter(i => i.checked).length;
  const lost = baseline.filter(b => !runnable.some(i => i.command === b.command && i.expect === b.expect && JSON.stringify(i.exits) === JSON.stringify(b.exits))).length;
  console.log(id + ': C_listed=' + count(text) + ' parsed=' + items.length + ' runnable=' + runnable.length + ' checked=' + checked + ' baseline_items_not_runnable=' + lost);
}
console.log('Bounded parser/count probe only; no checklist command was spawned and no file was written.');
```

```text
baseline: C_listed=22 parsed=22 runnable=22 checked=0 baseline_items_not_runnable=0
new-unchecked: C_listed=23 parsed=23 runnable=23 checked=0 baseline_items_not_runnable=0
new-checked: C_listed=23 parsed=23 runnable=22 checked=1 baseline_items_not_runnable=0
old-checked-new-unchecked: C_listed=23 parsed=23 runnable=22 checked=1 baseline_items_not_runnable=1
Bounded parser/count probe only; no checklist command was spawned and no file was written.
exit=0
```

The harness extracted `CHECKLIST_RE`, `RE_CHECKLIST`, and `parseChecklist(text)` with Node `readFileSync`/`vm.runInNewContext`; variants appended the exact frozen-grammar line `Receipt-attest hermetic suite — node scripts/receipt-attest.mjs --selftest → exit 0 + ATTEST_SELFTEST: PASS`, using backticks around command/verdict, or toggled its/“Citation gate verdict”'s checkbox. Baseline identity comparison used `(command, exits, expected substring)`, not mutable SKILL line numbers. This is a parser/count witness; **no complete mutated H1–H5 run is claimed**. The predicted successful floor reading assumes the remaining executed items pass [INFERENCE]. A failing, *runnable* item 23 would already produce exit 1; that is not the hole.

**Smallest safe correction (supplemental H6):** require all original 22 item identities to remain runnable and PASS, and require the new exact receipt-attest selftest item to be runnable and PASS with exit 0 and `ATTEST_SELFTEST: PASS`; retain `CHECKLIST_SKIPPED: 0`, `CHECKLIST: 23/23 pass`, and overall exit 0 from the close tree. `--checklists --json` exposes item commands, statuses, skips, and totals (`surface-probe.mjs:1098–1118`) for an identity comparison. Require the promised registry row separately. Do not weaken the original harm floor or amend A51 to hide this gap.

## F3 — HIGH: missing receipt-confidentiality harm arm

**Counterexample [INFERENCE from the declared format]:** an otherwise valid invocation with a credential passed as an argument (for example, a token flag, Authorization header, credential-bearing URL, or inline shell assignment) records that value in exact `argv`. Not serializing the environment does not protect command arguments. Integrity hashes and distinct nonces do not make those bytes non-secret.

Evidence: `plan:26–32` requires argv capture and binding; line 38 separately promises no secret material. Existing concrete confidentiality policy is `corpus/QUALITY.md:30–34` (Q5: no credential material/references, tokens, or private URLs; count, never print values). H1–H5 (`plan:114–123`) has no receipt-content confidentiality test. A51's five arms check selftest, validation/distinctness/spacing, replay rejection, nonce reuse and pin/proxy (`attest51-probe.mjs:70–179`); D51's arms check entry/source/binding/census (`doctrine51-probe.mjs:64–113`). Neither directly sweeps published receipts for credentials.

At inspection, the proposed `scripts/receipt-attest.mjs` and `.ufo/waves/round-51/receipts/` were not present in the lane (glob returned those paths missing). This is a **design/battery finding**, not an observed credential leak or an implementation verdict.

**Smallest safe correction (supplemental H7):** before publication, screen every new receipt and sidecar at the exact close revision; require zero credential-shaped hits, no environment dump, and reviewed secret-free invocation arguments. Include a synthetic canary control proving the screen detects an argument-carried credential, including JSON-escaped text, without persisting a real secret. Record only counts/status, never matched values. Keep raw stdout/stderr out of the receipt schema as declared.

### Proposed close-revision sweep (NOT RUN)

Dependency-free command for L1; `CLOSE` must be the full committed close revision. It reads only committed receipt-directory blobs, fails closed on absent required receipts/sidecars or malformed receipt JSON, and also screens decoded JSON strings so escaping cannot trivially hide a known shape. It prints no values. This is a conservative **shape screen**, not proof that arbitrary opaque strings are non-secret; argv review and the canary control remain required.

```sh
node --input-type=module - "$CLOSE" <<'JS'
import { execFileSync } from 'node:child_process';
const L = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const R = process.argv[2], D = '.ufo/waves/round-51/receipts';
const git = a => execFileSync('git', ['-C', L, ...a], {encoding:'utf8', stdio:['ignore','pipe','pipe']});
const strings = v => typeof v === 'string' ? [v] : Array.isArray(v)
  ? v.flatMap(strings) : v && typeof v === 'object'
  ? Object.entries(v).flatMap(([k,x]) => [k, ...strings(x)]) : [];
const forbidden = /authorization|bearer\s|basic\s|api[_-]?key|client[_-]?secret|password|passwd|(?:^|[^a-z])token(?:$|[^a-z])|(?:sk|rk|ak|xai)-[a-z0-9_-]{12,}|AKIA[A-Z0-9]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|https?:\/\/[^\s/:]+:[^\s@]+@|RECEIPT_SECRET_CANARY_/iu;
try {
  if (!/^[0-9a-f]{40}$/.test(R || '')) throw Error();
  const paths = git(['ls-tree','-r','--name-only',R,'--',D]).trim().split('\n').filter(Boolean);
  for (const n of [1,2,3]) for (const suffix of ['.txt','.txt.sha256'])
    if (!paths.includes(`${D}/attest-run-${n}${suffix}`)) throw Error();
  let hits = 0;
  for (const p of paths) {
    const body = git(['show', `${R}:${p}`]);
    const decoded = p.endsWith('.txt') ? strings(JSON.parse(body.split('\n')[1])) : [];
    if (forbidden.test([p, body, ...decoded].join('\n'))) hits++;
  }
  console.log(`SECRET_SWEEP: ${hits ? 'HIT' : 'CLEAN'} files=${paths.length} hits=${hits}`);
  process.exitCode = hits ? 1 : 0;
} catch {
  console.log('SECRET_SWEEP: ERROR');
  process.exitCode = 2;
}
JS
```

**Fix versus tradeoff:** a secret-free shipped receipt set and an explicit harm check are fixable without changing the frozen claims. An unconditional promise of secret-free receipts for *arbitrary* exact argv is not established by this design. Silently redacting argv, dropping semantic fields, or editing receipts after issuance to get a clean sweep would change identity/integrity, not safely repair it. Such a contract tradeoff needs L1/canonical adjudication; it must not be presented as a harmless implementation choice. No scoring/admission decision is made here.

## Evidence and limits

Read-only tools inspected the cited files and the round/base inventories. The only exercised behavioral probe was the in-memory parser/count witness above. **H1–H5 close execution, both round-51 predicate runs, the proposed secret sweep and canary control were not run by this seat.** The observed baseline PASS/MATCH statements are quotations of the existing round-open artifact, not fresh test claims. No tools were installed or upgraded.

Actual checksum command, exit 0:

```sh
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/base/baseline-gates.txt /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/surface-probe.mjs
```

```text
dc8fbc9a53379f8ab1ead3ac75f4640c52a262f903e8e1e4578640ebf6613c2c  plan.md
422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1  probe/attest51-probe.mjs
0c689c51ecbfee9da8d12dad6253f1c583d08d132f76a428e0ba3997b91e9682  probe/doctrine51-probe.mjs
c27be9d1d05b672d8acd210c4604dcef9799ffd520d0c246c261e5a5db7255c4  base/baseline-gates.txt
79081e1b3c661590f4fafe5d2343993d966873cb4422b7b5462434366a084d35  scripts/surface-probe.mjs
```

The checksum output above abbreviates only the displayed path prefixes; hashes are verbatim.

Report: .ufo/waves/round-51/w1/CritHarm.md
