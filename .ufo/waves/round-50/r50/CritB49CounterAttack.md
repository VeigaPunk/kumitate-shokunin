# CritB49CounterAttack — deterministic output is not invocation provenance

## Scope and axes

Attacked: round-49 C1's frozen `B49` counter and the claim that round-50 R4's distinct, time-labelled receipts discriminate fresh B49 invocations from replay.

- **Operability:** whether B49 supports the bind-oracle mechanism demonstration, versus authenticating how often/when it ran.
- **Coverage:** whether closure evidence covers the claimed independent/time-spaced invocations. Per round-50 `plan.md:63-82`, LEDGER_HELD is auxiliary conformance, not another coverage-axis claim.

Read both frozen round-50 probes and the plan before assessing the predicates. No lane/fleet code, index, refs, or state changed. The only file written is this report. No judge, admission, integration, or orchestration runtime was invoked. No tools installed or updated.

## Direct answers

1. **B49 does freshly execute checks when actually invoked; it does not authenticate a saved receipt.** `bindoracle49-probe.mjs:44-62` extracts the requested revision and launches its oracle; `:65-108` checks actual subprocess exits and printed verdicts. It has no receipt-input or receipt-provenance check. A copied output file is not itself another invocation.
2. **Successful output can be byte-identical across genuine independent invocations.** This is not a guarantee that revision alone determines all outcomes: the host/environment can affect them. But no per-run identity or time is emitted. Given the same successful outcomes, the relevant output is deterministic.
3. **Yes: changing only the prelude of one old genuine body satisfies R4.** The exact frozen R4 block accepted three such in-memory receipts, with zero B49 launches and no receipt files written. This demonstrates R4 alone, not an end-to-end LEDGER_HELD result.

## Why B49 does not distinguish the invocations

Paths below are relative to the lane unless marked fleet.

- `.ufo/waves/round-49/probe/bindoracle49-probe.mjs:68-72` reduces the selftest to its exit and pass-count summary.
- `:91-108` retains the oracle's verdict line, not the full child mount report.
- `:113-118` prints check results, requested revision and the oracle's content hash. It does not print the extraction directory, random challenge, wall-clock time, invocation identity, or duration.
- `scripts/bind-oracle.mjs:83-98` generates fresh temporary paths, but `:113-114` replaces the fixture root with `R` in MISSING/CONTROL_VISIBLE paths. `:126` emits only counts for HELD. The successful K5 mutant names the fixed path `/etc`.
- Thus the seven-line stored successful B49 output can be identical even though different temporary directories and child processes were used. `oracle_sha256` binds instrument bytes, not invocation freshness.

The original claim explicitly required time-spaced invocations: `.ufo/waves/round-49/plan.md:61-64` requires the score and at least two same-commit, time-spaced re-runs. The output-text limitation was disclosed separately at `:68-78`; it does not turn replayed text into an invocation.

## Counterexample: exact frozen R4 block, prelude-only replay

`.ufo/waves/round-50/probe/repairs50-probe.mjs:79-92` hashes each entire receipt, parses its initial `run-at`, looks for the success substring anywhere, and requires a >=300-second timestamp span. It never invokes B49, authenticates the clock, or checks the command/exit/revision/instrument hash of the purported run.

Executed with JavaScript Eval (Bun 1.4.3), using the tool's `read` helper. Candidate files existed only as map entries in memory:

```js
const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const b49Body = await read(`${lane}/.ufo/waves/round-49/r49/L1-score-0526f898.txt`);
const repairSource = await read(`${lane}/.ufo/waves/round-50/probe/repairs50-probe.mjs`);
const { createHash } = await import('node:crypto');
const digest = (s) => createHash('sha256').update(s).digest('hex');
const r4Block = repairSource.slice(repairSource.indexOf('const rerunFiles ='), repairSource.indexOf('// R5 —'));
if (!r4Block.includes('span >= 300')) throw new Error('Unexpected R4 source');
const scoreR4 = new Function('lsRev', 'blob', 'sha', r4Block + '\nreturn {ok:g4ok, say:g4say};');
const stamps = ['2026-10-23T00:00:00Z','2026-10-23T00:05:00Z','2026-10-23T00:10:00Z'];
const makeFiles = (timestamps, withPrelude = true) => Object.fromEntries(timestamps.map((at,i) => [`.ufo/waves/round-50/r50/ReRunB49-${i+1}.txt`, (withPrelude ? `run-at=${at}\n` : '') + b49Body]));
const cases = [
  ['unchanged replay, no prelude', makeFiles(stamps, false)],
  ['same prelude, same body', makeFiles(stamps.map(() => stamps[0]))],
  ['distinct preludes, identical old body', makeFiles(stamps)],
];
print(`body_sha256=${digest(b49Body)} body_bytes=${Buffer.byteLength(b49Body)}`);
print('Executed only the frozen R4 source block in memory; B49 launches=0; receipt files written=0.');
for (const [name, files] of cases) {
  const result = scoreR4(() => Object.keys(files), (p) => files[p], digest);
  const bodyDistinct = new Set(Object.values(files).map(t => digest(t.replace(/^run-at=[^\n]*\n/, '')))).size;
  print(`${name}: ${result.ok ? 'PASS' : 'MISS'} ${result.say} body_distinct=${bodyDistinct}`);
  if (name.startsWith('distinct preludes')) for (const [p,t] of Object.entries(files)) print(`${digest(t)}  ${p}`);
}
print(`r4_block_sha256=${digest(r4Block)}`);
```

Observed output:

```text
body_sha256=03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488 body_bytes=484
Executed only the frozen R4 source block in memory; B49 launches=0; receipt files written=0.
unchanged replay, no prelude: MISS files=3 distinct=1 held=3 span_s=NaN body_distinct=1
same prelude, same body: MISS files=3 distinct=1 held=3 span_s=0 body_distinct=1
distinct preludes, identical old body: PASS files=3 distinct=3 held=3 span_s=600 body_distinct=1
6803a65952adbe15a51b49bc2b74017e128ef126b93f597040be763136ccae5c  .ufo/waves/round-50/r50/ReRunB49-1.txt
9c073b362449afedddcbfdbe8c9ea940aacee8bd1f15eb4379aa42f85e375f32  .ufo/waves/round-50/r50/ReRunB49-2.txt
a034c2fabf7d9c04ad6f2b0fbd6e4ba09e29de557e7341b5fabff7fc9e1ff5fe  .ufo/waves/round-50/r50/ReRunB49-3.txt
r4_block_sha256=bd0c058ef7431c0bcdad0c479db0345286e0fcb328782d6832424e025eac614e
```

No mounting, child write, counter battery, full R50 audit, or full B49 execution was performed for this review.

## Anchored evidence: commands and output

Run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

```sh
sha256sum .ufo/waves/round-49/probe/bindoracle49-probe.mjs .ufo/waves/round-50/probe/bindguard50-probe.mjs .ufo/waves/round-50/probe/repairs50-probe.mjs .ufo/waves/round-49/r49/L1-score-0526f898.txt .ufo/waves/round-49/r49/ReRunCounter49-2.txt .ufo/waves/round-49/r49/ReRunCounter49-3.txt
```

```text
8de1d6ce8178b2e7a031070e2b8e3f38ab58a2d1e21fe1328b501a1b7857554d  .ufo/waves/round-49/probe/bindoracle49-probe.mjs
a9e79600d8849d947f0074b6f2964c17611b40a324afb9c5793ea7f212b61dc3  .ufo/waves/round-50/probe/bindguard50-probe.mjs
f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d  .ufo/waves/round-50/probe/repairs50-probe.mjs
03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488  .ufo/waves/round-49/r49/L1-score-0526f898.txt
03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488  .ufo/waves/round-49/r49/ReRunCounter49-2.txt
03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488  .ufo/waves/round-49/r49/ReRunCounter49-3.txt
```

```sh
git show 0526f898257f58158e9264905f4895f54163e8db:scripts/bind-oracle.mjs | sha256sum
```

```text
c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5  -
```

```sh
bun --version
```

```text
1.4.3
```

The original 484-byte receipt, read at `.ufo/waves/round-49/r49/L1-score-0526f898.txt:1-7`, is:

```text
  K1 PASS present
  K2 PASS exit=0 7/7
  K3 PASS exit=0 BIND_ORACLE: HELD binds=3 observed=3 absent=1
  K4 PASS exit=1 BIND_ORACLE: MISSING missing=3 paths=R/bind0,R/bind1,R/bind2
  K5 PASS exit=1 BIND_ORACLE: EXTRA extra=1 paths=/etc
  K6 PASS exit=1 BIND_ORACLE: CONTROL_VISIBLE visible=1 paths=R/control
BINDORACLE49: ORACLE_HELD held=6/6 checks=6 rev=0526f898257f58158e9264905f4895f54163e8db rule=B49 oracle_sha256=c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
```

## Assessment of r49 C1, without an admission judgment

**The replay critique does not by itself refute the functional bind-oracle capability.** A real B49 invocation exercises its stated six output/exit predicates; deterministic output is normal for a regression test. `corpus/lessons/round-49-verifier-spotcheck.md:52-62` records the non-author's own base miss and successful executions at `64b92866` and `c432cc95`, both naming the same `c3929a97…` oracle bytes. Those are evidence in the existing review, not executions performed by this seat. The counter's inability to reject a deliberately lying instrument is already the disclosed output-text limit.

**The original three receipts do not establish the stronger independent/time-spaced-run assertion.** Byte identity alone also does not establish that they were copied. The non-author's reruns support the mechanism, but they are at two other revisions and do not reconstruct the original runs' times at `0526f898`. R4's success cannot cure that historical provenance gap: it authenticates neither a fresh execution nor elapsed real time.

This is an acceptable recorded limit for the narrow functional/author-attested conformance audit, explicitly acknowledged by round-50 `plan.md:102-103`. Treating it as demonstrated invocation independence would be a real evidence defect, not a capability gain. Neither a new coverage score nor a saturation conclusion follows from R4.

## Smallest safe correction

1. Keep the frozen B49/R50 counters unchanged. Report R4 as **distinct receipt bytes with author-attested timestamps**, never proof against replay or independent execution. Preserve the r49 provenance defect as an append-only correction; do not retroactively label old outputs as authenticated runs.
2. Capture the actual newly scheduled invocations with UTC start, exact command, output and exit, and point the closure at independently captured execution evidence. That is process evidence with an explicit trust boundary, not cryptographic temporal proof. Requiring distinct output-body hashes would be wrong: it rejects genuine deterministic runs.
3. Narrow live `corpus/QUALITY.md:760`'s sentence `Identical receipts are copies, not independent runs.` to `Identical output-only receipts do not establish independent invocations; genuine deterministic runs can emit identical output.` The current live Q39 limit at `:767-768` mentions rewriting timestamp **and** output; the demonstrated replay needs to change only the timestamp prelude. Describe that exact boundary. These are proposed wording corrections only; this seat did not edit QUALITY.md.

No scope expansion into an anti-replay infrastructure is needed for the declared functional claim. If authenticated temporal provenance becomes a scored requirement, it needs a separately frozen, trusted capture design rather than treating editable receipt text as that authority.
