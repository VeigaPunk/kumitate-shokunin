# CritC2 — sourced invocation-attestation claim

## Axes and advisory disposition

**Axes:** coverage/frontier learning (C2, primary); operability (C1, preserve). Evidence quality and provenance are constraints on those axes, not new axes. The frozen plan owns operability + coverage and explicitly leaves the saturated numeric coverage successors unchanged (P:5–6, 102–109).

**Critic disposition: C2 is not yet substantiated by this counter.** There is a real mechanism-level delta available beyond Q39, and the two man-pages can defensibly be docs/A for narrowly stated Linux interface semantics. But D51 admits hollow clause content, and its D3 column indexes reject correctly shaped source rows. These are fixable defects, not evidence that more repeated receipt policy is new ground. This is an advisory falsification report, not admission or a canonical-runtime judgment.

Scope of observation: no invocation-attestation entry/draft was available in the targeted corpus/build glob searches during this review; the in-memory probe also printed `entry_live_exists=false`. Therefore the novelty assessment below reviews the **frozen proposal**, not unseen final prose. The actual S100/S101 scout reports and fetched bytes were available and read. No lane code, counters, plan, corpus, or source rows were changed.

## Evidence locators

All line citations use these absolute files:

- **P:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md`
- **A:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs`
- **D:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs`
- **Q:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md`
- **K:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/counter-amendment-discipline.md`
- **SC:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs`
- **R100:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutClockSource.md`
- **R101:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/ScoutRandomSource.md`
- **H100:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html`
- **H101:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html`

The frozen counters A and D were read before asserting predicate properties. P was read first.

## (a) New ground versus re-expression

**Already held; not a fresh coverage gain:**

- Separate captured invocations, UTC start, command, output, exit, different receipt bytes, and a preregistered elapsed span are already Q39 (Q:754–767).
- The old prelude-only replay and the author-attested/not-temporal-proof ceiling are already explicit in Q39 (Q:768–772) and round-50 lesson M2 (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-50.md:25–38`).
- Independent time-spaced runs and a demonstrated capability are already K:C8–C11 (K:42–54).
- Hash-bound clauses, frozen receipts, and the distinction between unchanged evidence and true prose are already Q38 (Q:727–749) and K:10–13, 88–93. Renaming that discipline “invocation attestation” is not new ground.

**Potentially new relative to these two requested comparators:** the exact division of responsibility among a canonical semantic digest, whole-file sidecar, random per-invocation nonce, finite ledger, and within-invocation monotonic duration (P:26–48, 77–85). Those mechanisms are not specified in Q39 or K's receipt section. A reusable explanation of which mutation each layer catches would be a genuine mechanism-level addition. A list of twelve restatements of “capture receipts; hashes must differ; timestamps are not proof” would not.

**Smallest safe correction:** keep Q39 and K as the policy authorities and cross-reference them. Make the new entry an operational failure-model/decision record for the new instrument, not a second copy of the admission policy. Attribute new learning to the mechanism and observed counterexamples, not to the filename, line count, source-row count, or a saturated numeric coverage score.

## (b) Are S100/S101 docs/A defensible?

**Yes, narrowly; community/B is not forced merely because these are hosted on man7.org.** Both fetched pages identify themselves as the Linux man-pages project's kernel/C-library user-space interface documentation, obtained from the man-pages-6.19 tarball (H100:456–473; H101:226–243). This is interface documentation, not a forum answer. The lane already treats the same project's proc_pid_mountinfo page as docs/A (`/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md:112`). Q2 forbids community/A but does not require classifying this maintained manual as community (Q:18–22).

| Row | Defensible A scope | Unsupported extension to remove or separately ground |
| --- | --- | --- |
| S100, [clock_gettime(2)](https://man7.org/linux/man-pages/man2/clock_gettime.2.html) | Linux CLOCK_MONOTONIC is nonsettable, ordered across consecutive calls, unaffected by discontinuous wall-time steps, but affected by frequency adjustments; it excludes suspend time and may repeat a value (H100:170–184). | “Unaffected by NTP” is too broad; RAW is the separately documented no-frequency-adjustment clock (H100:192–196). The man-page does not establish the installed Node/libuv implementation behind `process.hrtime.bigint()`. |
| S101, [getrandom(2)](https://man7.org/linux/man-pages/man2/getrandom.2.html) | Linux getrandom supplies random bytes suitable for cryptographic uses; by default it draws from the urandom source; initialization/request-size qualifications apply (H101:80–98). | It does not establish that this installed Node/OpenSSL build's `crypto.randomBytes()` takes that syscall path, that every nonce request calls it, uniqueness, execution freshness, or temporal attestation. |

R100's proposed row is appropriately qualified about frequency adjustments (R100:36–46). R101 explicitly acknowledges that its page does not establish the Node call chain (R101:61–64). P:79 nevertheless calls S101 the kernel interface Node uses: **this is a provenance bridge the page alone cannot carry.** Narrow the assertion to Linux interface semantics, or open version-matched Node/OpenSSL/libuv primary documentation/code for the actual bridge. Downgrading an unsupported bridge to B does not create missing evidence.

Retain exact fetched-byte identities and the located, <=25-word scout quotes in the lesson Gate (P:82–85). Preserve actual UTC fetch instants: R100 records `2026-10-24T01:59:31Z`, R101 `2026-10-24T01:59:28Z`; the local round date is still the 23rd. R100 proposes opened=24 while R101 proposes opened=23. Make the registry's calendar convention explicit and retain the UTC fetch dates; a checker accepting an earlier date does not establish when bytes were opened. Do not call either source “fetched 2026-10-23 UTC.”

**Impacted axis:** sourced coverage and provenance. Scoped docs/A is defensible; overclaiming Node internals or NTP immunity is a correctable factual/scope defect, not an unavoidable A-versus-B tradeoff.

## (c) D51 does not force substantive clauses

### High — hollow-clause bypass, observed in the unchanged D1/D2 blocks

P:89–92 says >=12 clause lines, **each** with a matching committed receipt binding. D:74–87 instead counts every `- ` line, skips any without a binding, and only requires `clauses.length >= 12 && bound.length >= 12`. It does not require all clauses to be bound, substantive text after removing the binding, distinct clauses, or relevance of the bound artifact to the assertion. The first matching token is the only token inspected on a line.

I executed the exact D1/D2 block extracted from D (between the `// D1` and `// D3` markers) in memory, with the real read-only `git show` hash check unchanged. The base revision was `c90b9de94009b938fa19a089bfaa97df20b54f86`. The bound path was the existing round-48 plan, not invocation-attestation evidence:

```text
receipt:.ufo/waves/round-48/plan.md@sha256:6faa34aba4acd6c91843af6111193969f7ccd7ee57d03ed1d9b48c0e1e213f8a
```

Each payload had the proper three-line source/verified-at/recheck header citing both required man7 URLs. Observed output:

```text
READ_ONLY_D51_D1_D2_BLOCK_PROBE
counter_sha256=0c689c51ecbfee9da8d12dad6253f1c583d08d132f76a428e0ba3997b91e9682 rev=c90b9de94009b938fa19a089bfaa97df20b54f86
receipt=.ufo/waves/round-48/plan.md sha256=6faa34aba4acd6c91843af6111193969f7ccd7ee57d03ed1d9b48c0e1e213f8a git_show_exit=0
entry_live_exists=false
12 receipt-only duplicate bullets: D1=PASS trio present | D2=PASS clauses=12 bound=12 hash-miss=0
12 vacuous duplicate claims: D1=PASS trio present | D2=PASS clauses=12 bound=12 hash-miss=0
12 bound bullets plus unbound 13th: D1=PASS trio present | D2=PASS clauses=13 bound=12 hash-miss=0
11 bound bullets control: D1=PASS trio present | D2=MISS clauses=11 bound=11 hash-miss=0
12 with one wrong hash control: D1=PASS trio present | D2=MISS clauses=12 bound=12 hash-miss=1
```

The vacuous text was exactly `This entry exists.` repeated twelve times. The unbound thirteenth bullet was `- No receipt backs this extra claim.` The first payload contained no claim prose at all, only twelve identical `- receipt:...` lines.

This is **not** a full DOCTRINE_HELD demonstration. D3/D4/D5 were not executed in this probe. In particular, the separate D3 defect below currently blocks honest full attainment. D4 is a source/header schema checker, not a semantic clause judge (SC:6, 354–390), so it is not a substitute for the missing content review.

**Smallest safe correction, for L1 adjudication only:** implement the declared “each” condition (`bound.length === clauses.length`); add a hollow-entry negative control. For actual admission, require a non-author to map every substantive clause to what its receipt/source demonstrates and explicitly identify the delta from Q39/K. Reject token-only padding and repeated non-claims. Text-length or keyword checks alone would only create another hollow bypass. Do not invent a requirement for twelve distinct receipts: legitimate clauses may share evidence, as K:91 explicitly permits.

### Blocker — D3 reads opened/trailing-empty cells instead of status/used-by

This additional defect prevents the promised sourced predicate from measuring a valid registry. P:92–94 and D:15–18 require mined source rows plus a clean source checker. But D:94–99 uses:

```js
return c[1] === id && c[9] === 'mined' && c[12].includes(ENTRY);
```

The actual schema is status=`[8]`, opened=`[9]`, used-by=`[11]` (SC:266–277). SC:261–263 requires 13 split fields, and SC:302–304 rejects a non-date opened value. Thus D3 requiring opened=`mined` contradicts D4's real schema. With a trailing pipe, `[12]` is also the empty trailing field.

I independently executed the unchanged D3 `okRow` function against canonical S100/S101 row strings and a deliberately shifted extra-cell control. I also read the real S099 row from the frozen base using `git show`. Observed output:

```text
READ_ONLY_D51_D3_INDEX_PROBE
existing_S099_fields=13 c8="mined" c9="2026-10-23" c11="scripts/bind-oracle.mjs, corpus/knowledge/counter-amendment-discipline.md, corpus/lessons/round-49.md, corpus/knowledge/mount-order-and-bind-scope.md" c12=""
canonical_S100_field_count=13
canonical_S101_field_count=13
canonical_mined_rows_D3={"S100":false,"S101":false}
extra_cell_rows_D3={"S100":true,"S101":true} field_counts=14,14
```

The shifted controls have 14 fields and would be rejected by SC's explicit 13-field rule; putting `mined` in a 13-field row's opened cell instead triggers `OPENED_INVALID`. This is a code/schema contradiction, not an observed full D51 run. Both scout reports independently identify it (R100:50–69; R101:43–57).

**Smallest faithful correction:** change only those D3 indexes to `[8]` and `[11]`, with canonical-row and shifted-row controls. **Do not edit the frozen counter silently.** Record the defect and let L1 adjudicate the permissible frozen-claim/amendment disposition; this critic changed neither counter nor plan. Do not make malformed source rows, weaken the source checker, or manufacture its CLEAN output to satisfy D3.

## (d) The one thing that makes the entry worth its bytes

**A single hash-bound, actually exercised alteration/threat matrix connecting the new verifier to the old Q39 failure.** For each row: exact edit, command, observed verdict/exit, responsible layer, and remaining trust assumption. Include prelude-only rewriting, semantic-field editing with a recomputed outer sidecar, old-nonce reuse with a ledger, and an explicitly labelled author-controlled coordinated rewrite/new-nonce limit.

This would teach the absent decision: which property is exact-byte integrity, which is semantic consistency, which is duplicate detection within a selected ledger, and which is still unproved. A fully author-controlled record can be regenerated with fresh fields and matching public hashes; rejection of every such fabrication is not supplied by this design [INFERENCE from P:26–48; no coordinated-rewrite control was run here]. The matrix must record actual results rather than upgrading this inference into an observed guarantee. Monotonic duration is not UTC authenticity, and nonce uniqueness is not proof of a new child invocation.

That one artifact makes the operational mechanism new; another twelve-line statement of Q39 does not.

## Required changes / defect versus tradeoff

1. **Blocker:** adjudicate D3's schema-index defect; use the correct existing source schema, not a second registry convention.
2. **High:** adjudicate D2's failure of “each,” retain hollow/unbound controls, and supply the Q38 non-author substantive/novelty reread. A structural HELD is not automatically frontier learning.
3. **High if retained in entry:** remove unsupported Node call-chain provenance and NTP-immunity statements, or ground them in opened version-matched primary sources. Keep S100/S101 docs/A confined to their actual interfaces.
4. **Content requirement:** replace duplicate receipt policy with the exercised alteration/threat matrix and cross-reference Q39/K as the sole existing policy authorities. Preserve exact UTC fetch evidence in the Gate.

D3 and the unbound-clause condition are fixable implementation defects. Hash binding not establishing prose truth, UTC truth, or author honesty is a declared design ceiling, not a bug to paper over (Q:747–749, 768–772; P:45–48, 148–151). Claiming those stronger properties—or calling hollow repeats new frontier coverage—would require canonical rejection of the overclaim, not changing judgment in this report. No canonical verdict is emitted here.

## Exercised commands and identities

Only read-only evidence/probes ran. The two JavaScript probes ran through `functions.eval(language="js")`, with no saved harness, fixture repository, git mutation, or temporary file. They read D's bytes, used its unchanged blocks through `new Function`, and invoked these real child commands with the absolute lane argument:

```text
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show c90b9de94009b938fa19a089bfaa97df20b54f86:.ufo/waves/round-48/plan.md
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show c90b9de94009b938fa19a089bfaa97df20b54f86:corpus/SOURCES.md
date -u +%Y-%m-%dT%H:%M:%SZ
```

The date command printed `2026-10-24T02:01:08Z`. `git show` of the bound plan exited 0; individual D2 hash results are above. The D3 registry read exited 0. The first probe extracted `src.slice(src.indexOf('  // D1\n'), src.indexOf('  // D3\n'))`; the second extracted the unchanged `const okRow` declaration ending immediately before `d3 = okRow`. Full D51, D4/D5, the live fleet census, the instrument suite, builds/linters, and any orchestration/admission runtime were **not run**.

Command `sha256sum` was run with the following seven absolute operands; its exact hash/path output was:

```text
dc8fbc9a53379f8ab1ead3ac75f4640c52a262f903e8e1e4578640ebf6613c2c  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md
422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs
0c689c51ecbfee9da8d12dad6253f1c583d08d132f76a428e0ba3997b91e9682  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs
321171a9381612757bd91e063aa0c24682c898a0146ded4b8acb9ff1dbf940f0  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/QUALITY.md
a68c29eeb892b1fb50d125eb8598c71ebc5a541a2577f24e32cdcbace408a54c  /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/counter-amendment-discipline.md
7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html
366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ScoutRandomSource/getrandom.html
```

No tools were installed or updated. Only this assigned report was written.
