# CritA3eGap — refreshed-sidecar gap review

Seat: `kumitate-r51.OfficialWeasel`. Independent leaf; advisory critique only, not a canonical judgment or admission.

## Axes and attacked claim

- **Operability / actual detection:** does the shipped verifier reject the joint prelude-rewrite + refreshed-sidecar vector rather than merely a stale sidecar?
- **Coverage / measurement honesty:** does frozen `ATTEST_HELD` independently exercise that vector, and what evidence supports the narrower claim?
- **Freeze / identity integrity:** does adding A3e now improve coverage without changing the already-scored predicate's identity?
- **Harm continuity:** preserve H1–H5 and the read-only lane boundary; do not infer their results from this bounded experiment.

Attacked: F-3 in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/LabratM2Replay.md:189-210`, specifically the distinction between the shipped instrument closing the attack and the frozen counter independently demonstrating that closure. Also challenged the stronger interpretation that *no existing check touches this class*.

## Recommendation

**Keep frozen A51 v3r6 unchanged; disclose this as an independent-counter-coverage limit, not an open defect in the tested shipped verifier.** Do not add a late A3e and silently keep the same `ATTEST_HELD` claim identity/9-check denominator.

The independent replay experiment below rejects all three joint mutations through the wall-window check. It does so with and without a ledger, with matching refreshed sidecars and byte-identical JSON bodies. The mechanism is **not nonce-reuse detection**: these copies retain the same nonce AND the same record digest, so the ledger's different-digest condition does not apply.

F-3 is accurate when stated as **no independent probe-owned arm**. It overstates the situation if read as no behavioral coverage whatsoever: A1 invokes the shipped selftest, and the shipped selftest contains this exact refreshed-sidecar/window vector. A1 trusts the instrument's selftest report; that is weaker than a separate probe-owned A3e and does not certify arbitrary replacement implementations.

## Identity and commands actually exercised

Only runnable created by this seat: `/tmp/kumitate-r51-CritA3eGap-gCI6VK/probe.mjs`. Generated receipts, refreshed sidecars and full transcript also remain in that scratch directory. The only lane write is this report.

Initial `/usr/bin/node --version` failed with `command not found`, exit 127. `command -v node` resolved the installed fnm Node; no installation or update was needed.

Executed identity command:

```text
/run/user/1000/fnm_multishells/5324_1792804850373/bin/node --version && sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs && mktemp -d /tmp/kumitate-r51-CritA3eGap-XXXXXX
```

Output:

```text
v24.21.0
44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs
73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs
/tmp/kumitate-r51-CritA3eGap-gCI6VK
```

Executed attack command (cwd `/tmp/kumitate-r51-CritA3eGap-gCI6VK`):

```text
/run/user/1000/fnm_multishells/5324_1792804850373/bin/node /tmp/kumitate-r51-CritA3eGap-gCI6VK/probe.mjs
```

The harness invokes the shipped script using Node's resolved absolute `process.execPath`:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs run --out /tmp/kumitate-r51-CritA3eGap-gCI6VK/genuine -- /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node -e 'process.stdout.write("r51-A3e-gap")'
```

Generation output:

```text
receipt-attest: wrote /tmp/kumitate-r51-CritA3eGap-gCI6VK/genuine.txt
receipt-attest: sidecar /tmp/kumitate-r51-CritA3eGap-gCI6VK/genuine.txt.sha256
receipt-attest: receipt-sha256 9b0c2e8883b2281df27cd911477819e76b4954e85a2e9a392a31274b4e539117
receipt-attest: command-exit 0
exit=0
```

A plain `verify` of that genuine absolute receipt path returned:

```text
RECEIPT: VALID
exit=0
WALL_START=2026-10-24T02:45:19.701Z
WALL_END=2026-10-24T02:45:19.718Z
WALL_DURATION_MS=17
```

The harness independently recomputed the canonical semantic digest before mutating. It rewrote only the first line to original prelude ±300 s or +600 s, preserved every subsequent byte, and wrote each new sidecar as SHA-256 of the mutated receipt plus the receipt basename. It checked that the refreshed sidecar matches, the JSON line is byte-identical, and nonce/stored inner digest are unchanged.

### Joint attack evidence

For each absolute `MUTATION` path below, both actual command forms were run:

```text
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs verify <MUTATION>
/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs verify --ledger /tmp/kumitate-r51-CritA3eGap-gCI6VK <MUTATION>
```

`<MUTATION>` denotes the corresponding absolute path, not a literal argument. The complete expanded commands and stdout/stderr are recorded in `/tmp/kumitate-r51-CritA3eGap-gCI6VK/transcript.txt`.

Observed output for −300 s:

```text
MUTATION=/tmp/kumitate-r51-CritA3eGap-gCI6VK/redated-minus-300s.txt
PRELUDE_DELTA_S=-300 BODY_LINE_EQUAL=true NONCE_EQUAL=true INNER_DIGEST_EQUAL=true SIDECAR_MATCH=true
REFRESHED_SIDECAR=6615042bb771d80c374d92b52039143d0d10a3da9f7cb65afefed9efd7dc8fa1  redated-minus-300s.txt
receipt-attest: prelude 2026-10-24T02:40:19.701Z is outside the recorded wall window [2026-10-24T02:45:19.701Z, 2026-10-24T02:45:19.718Z]
RECEIPT: TAMPERED
exit=1
```

Observed output for +300 s:

```text
MUTATION=/tmp/kumitate-r51-CritA3eGap-gCI6VK/redated-plus-300s.txt
PRELUDE_DELTA_S=300 BODY_LINE_EQUAL=true NONCE_EQUAL=true INNER_DIGEST_EQUAL=true SIDECAR_MATCH=true
REFRESHED_SIDECAR=e311a897146e00e07777f260b5a2b8f952003d11d67d23285e9c0d1d90194293  redated-plus-300s.txt
receipt-attest: prelude 2026-10-24T02:50:19.701Z is outside the recorded wall window [2026-10-24T02:45:19.701Z, 2026-10-24T02:45:19.718Z]
RECEIPT: TAMPERED
exit=1
```

Observed output for +600 s:

```text
MUTATION=/tmp/kumitate-r51-CritA3eGap-gCI6VK/redated-plus-600s.txt
PRELUDE_DELTA_S=600 BODY_LINE_EQUAL=true NONCE_EQUAL=true INNER_DIGEST_EQUAL=true SIDECAR_MATCH=true
REFRESHED_SIDECAR=0218b2ef07780e89093e9e6f7219d3571e00a28ef8b199c2d04de583598237a8  redated-plus-600s.txt
receipt-attest: prelude 2026-10-24T02:55:19.701Z is outside the recorded wall window [2026-10-24T02:45:19.701Z, 2026-10-24T02:45:19.718Z]
RECEIPT: TAMPERED
exit=1
```

Each diagnostic/verdict/exit above was identical for plain and ledger verification; stderr was empty. Harness final output:

```text
SHIPPED_IDENTITY_UNCHANGED=true
A3E_BEHAVIOR: CONFIRMED (three prelude-only shifts with refreshed sidecars; plain and ledger verify)
```

Harness exit was 0. Thus this was not rejection caused by a missing/stale sidecar, modified body, corrupt inner digest, or different-digest nonce collision.

## Static evidence and strongest remaining counterexample

Read via the file tool, not inferred from verdict text:

1. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs:106-116,190-217,307-335`: A1 accepts selftest exit 0 plus the PASS marker; A3c retains the genuine sidecar; A3d changes the digest field, not the prelude. There is no independent A3e construction.
2. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:75,371-390`: `PRELUDE_SLACK_MS = 60_000`; ledger only rejects same-nonce/different-digest; prelude check rejects outside `[wall_start − 60 s, wall_end + 60 s]` for ordered clocks.
3. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/receipt-attest.mjs:653-664`: `prelude-outside-the-wall-window-reads-tampered` rewrites the prelude, recomputes the sidecar and requires exit 1 / `RECEIPT: TAMPERED`. This is genuine checked-in behavioral coverage, but under A1's instrument-owned selftest authority.
4. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49/plan.md:61-78`: the r49 precedent explicitly freezes predicate/checklist/target after candidate scoring, and discloses an output-text oracle's forgery limit, assigning that class to mutation evidence/non-author closure instead of claiming the counter detects everything.
5. `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/lessons/round-51.md:34-41`: the integration already invokes that judged-committed-tree boundary, rather than claiming arbitrary implementation certification.

**Strongest surviving counterexample to an overbroad conclusion:** `[INFERENCE from the inspected formula, not exercised]` a long genuine wall interval can contain a +300 s prelude shift; the allowed interval is the invocation duration plus 120 s, not an unconditional ±60 s around its start. Therefore this experiment establishes rejection for this 17 ms genuine invocation and for shifts outside its recorded window; it must not become “every ≥300 s re-date always fails.” Copies also retain the same nonce, so this observation alone does not defeat A2's pairwise nonce-distinctness requirement. No long-running receipt or full A51-passing mutant was executed or claimed here.

Another implementation could remove the window check AND remove/lie about its own selftest while satisfying the independently exercised arms. That is a counter-coverage limit, not an observed defect in these pinned shipped bytes. This seat does not claim to have scored such a replacement.

## Smallest safe correction and exact report sentence

The safe move improves coverage honesty while leaving behavior, frozen predicates and H1–H5 unchanged: append the following explicit limit to the round report. Do not attribute this rejection to the ledger, and do not call it a new A51 arm.

> `ATTEST_HELD` under frozen A51 v3r6 does not independently challenge prelude-only re-dating with a refreshed sidecar: that case is present in the judged instrument’s selftest and was separately observed in wave 2 to return `TAMPERED` (exit 1) for −300 s, +300 s, and +600 s shifts of a 17 ms genuine run with unchanged JSON; the 60 s slack applies outside the recorded wall interval, and neither temporal truth nor exhaustive forgery resistance is claimed.

An independent A3e would improve discrimination of replacement implementations, but is not a harm-free same-identity change to this already-scored frozen rule. The r49 boundary is honest only with the explicit limitation and actual external behavioral evidence above; merely saying “judged bytes” without either would not close F-3.

## Scope of evidence

- Executed: shipped receipt generation, genuine verification, three refreshed-sidecar mutations, six mutant verifications, and byte-identity/hash checks within this bounded experiment.
- Not executed: full shipped selftest, either frozen counter, H1–H5, long-duration variant, canonical Rust judgment. No claim of `ATTEST_HELD`, `DOCTRINE_HELD`, or harm-gate PASS is made by this seat. Receipt 3 scheduling is outside this review and is not a finding.
- No counters, plan, scripts, corpus, SCORECARD, SKILL, repository state or peer files were edited. No other runtime, subagent, or peer message was invoked. No tools were installed or updated.

Report: `.ufo/waves/round-51/w2/CritA3eGap.md`
