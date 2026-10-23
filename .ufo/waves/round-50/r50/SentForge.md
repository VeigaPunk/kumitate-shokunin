# SentForge — R2/R3/R4 receipt forgery review

**Axes:** operability; coverage. **Severity:** Medium for the auxiliary audit's evidence integrity (high if `LEDGER_HELD` is represented as proof that sources were re-opened or B49 was run). I attacked only frozen R2, R3, and R4; I did not modify the lane or run another runtime.

## Result

**Yes.** A writer limited to `.ufo/waves/round-50/` can create receipt text that satisfies each of R2/R3/R4 without re-opening either source or running B49. These bytes only influence the probe after they are present in the `<rev>` committed tree: the frozen counter reads files through `git show <rev>:<path>` and enumerates R4 names with `git ls-tree` (`.ufo/waves/round-50/probe/repairs50-probe.mjs:51-57, 69-90`). Uncommitted working-tree files do not count.

### R2 and R3 — source receipts are trivially forgeable

The expected source-body digests are pinned in the counter (`repairs50-probe.mjs:76-77`), but `reopen()` never hashes a source body. At lines 69-75 it only checks that the first nonblank line, after trimming, starts with `REOPEN50: HOLD ` or `REOPEN50: DRIFT `, and that the receipt text contains the expected `sha256=<digest>` substring anywhere. The URL, fetched date, cited passages, verdict correctness, and source bytes are not checked. The header regex is not end-anchored.

Counterfeit examples (the digest strings below are the exact pinned values):

```text
.ufo/waves/round-50/r50/ReopenS095.md
REOPEN50: HOLD source=https://example.invalid/not-reopened sha256=2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da fetched=not-an-ISO-date
No source was opened; invented body.

.ufo/waves/round-50/r50/ReopenS098.md
REOPEN50: DRIFT source=not-the-strace-source sha256=c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a
No cited-span check was performed.
```

I evaluated the frozen `reopen()` predicate in-memory with those exact strings and hashes; both returned `true`. Receipt text SHA-256s: S095 `b14630e1fb1dd7c3a1c7a6b84ea97c2e1e7a0319036ba35dd2901b64b6d455b5`; S098 `28b9e4a75edef1d2195c1db679501c49c8a8251f10ac6b9a8cd12e25c8b91ef1`.

**Impact / limit:** R2/R3 can count forged attestations as reopened-source receipts. The counter proves only that somebody copied the public digest into a committed file, not that the specified source was checked. This is a real evidence hole for the plan's re-open claim; no corresponding R2/R3 authenticity limit is stated in `plan.md:69-76`.

### R4 — invented outputs and timestamps pass

R4 (`repairs50-probe.mjs:79-91`) enumerates committed `ReRunB49-*.txt` names, parses a `run-at` value with `Date.parse`, searches anywhere in each file for `BINDORACLE49: ORACLE_HELD held=6/6`, checks distinct hashes of the complete text, and checks a 300-second min/max span. It does not invoke B49, bind output to a B49 invocation or revision, require an exact ISO timestamp, or verify the output beyond that substring. A writer can place these three files under `.ufo/waves/round-50/`:

```text
ReRunB49-1.txt: run-at=2000-01-01T00:00:00Z\nBINDORACLE49: ORACLE_HELD held=6/6\nFabricated receipt 0; bindoracle49-probe.mjs was never run.\n
ReRunB49-2.txt: run-at=2000-01-01T00:02:30Z\nBINDORACLE49: ORACLE_HELD held=6/6\nFabricated receipt 1; bindoracle49-probe.mjs was never run.\n
ReRunB49-3.txt: run-at=2000-01-01T00:05:01Z\nBINDORACLE49: ORACLE_HELD held=6/6\nFabricated receipt 2; bindoracle49-probe.mjs was never run.\n```

I evaluated the corresponding frozen R4 calculations in-memory. Result: `accepted=true files=3 distinct=3 held=3 span_s=301`. Candidate-file SHA-256s: `6eadd198c05cbd19f4d6161c33e39e9b553cbd31c04c0873e835967f82cd192d`, `28977b02bc208aae776e6921c69ed691d2e47c8701c76c5e58e2aa0ca6bd323c`, `90197645dbb895dbe7d232686f59072103dd3ace06b79590f286f7e8a2add75f`.

**Impact / limit:** This is not evidence that three runs occurred, that they were spaced, or that their output came from B49. `plan.md:100-103` explicitly accepts a forged `run-at` clock as a limit; that makes the *timestamp-authenticity* weakness disclosed, but does not turn arbitrary text into proof of B49 execution. As written, R4 is a receipt-format check. Treating it as proof of “genuinely spaced runs” is a real gap between the prose claim (`plan.md:20-22`) and what the predicate establishes.

## Smallest remediation

- **R2/R3:** Have the verifier validate a canonical full header (exact source URL, verdict, ISO date, and digest field), and independently verify the cited evidence against the pinned upstream body—by fetching and hashing it or by checking a committed source-body snapshot against the pinned digest. Merely tightening the header regex does not authenticate the source check.
- **R4:** Either describe the result narrowly as distinct receipt text with claimed timestamps (the existing documented limit), or require independently verifiable execution evidence: bind the captured output to the B49 command and target revision and use a trusted timestamp/attestation if actual spacing matters. A stricter timestamp parser alone cannot prove a run occurred.

## Evidence / commands

Read: `.ufo/waves/round-50/plan.md:20-22,69-76,100-103`; `.ufo/waves/round-50/probe/repairs50-probe.mjs:51-57,68-91`.

Executed a read-only `node -e` harness in the lane directory. Compact reproduction of the acceptance checks:
```sh
node -e 'const {createHash}=require("node:crypto"), sha=s=>createHash("sha256").update(s).digest("hex"), hs=["2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da","c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a"], ts=[`REOPEN50: HOLD source=https://example.invalid/not-reopened sha256=${hs[0]} fetched=not-an-ISO-date\nNo source was opened; invented body.\n`,`REOPEN50: DRIFT source=not-the-strace-source sha256=${hs[1]}\nNo cited-span check was performed.\n`], reopen=(t,h)=>/^REOPEN50: (HOLD|DRIFT) /.test((t.split("\n").find(x=>x.trim())||"").trim())&&t.includes(`sha256=${h}`); console.log(`R2=${reopen(ts[0],hs[0])} R3=${reopen(ts[1],hs[1])}`); const dates=["2000-01-01T00:00:00Z","2000-01-01T00:02:30Z","2000-01-01T00:05:01Z"], rs=dates.map((d,i)=>{const t=`run-at=${d}\nBINDORACLE49: ORACLE_HELD held=6/6\nFabricated receipt ${i}; bindoracle49-probe.mjs was never run.\n`, m=t.match(/^run-at=(\S+)/); return {t,at:m?Date.parse(m[1]):NaN,sha:sha(t),held:t.includes("BINDORACLE49: ORACLE_HELD held=6/6")}}), span=(Math.max(...rs.map(x=>x.at))-Math.min(...rs.map(x=>x.at)))/1000, distinct=new Set(rs.map(x=>x.sha)).size; console.log(`R4=${rs.every(x=>x.held&&!Number.isNaN(x.at))&&distinct===rs.length&&span>=300} files=${rs.length} distinct=${distinct} held=${rs.filter(x=>x.held).length} span_s=${span}`);'
```
Its output was:
```text
R2=true R3=true
R4=true files=3 distinct=3 held=3 span_s=301
```
The detailed output (including receipt hashes) was:

```text
R2 counterfeit accepted=true sha256=b14630e1fb1dd7c3a1c7a6b84ea97c2e1e7a0319036ba35dd2901b64b6d455b5
R3 counterfeit accepted=true sha256=28b9e4a75edef1d2195c1db679501c49c8a8251f10ac6b9a8cd12e25c8b91ef1
R4 counterfeit accepted=true files=3 distinct=3 held=3 span_s=301
ReRunB49-1.txt sha256=6eadd198c05cbd19f4d6161c33e39e9b553cbd31c04c0873e835967f82cd192d
ReRunB49-2.txt sha256=28977b02bc208aae776e6921c69ed691d2e47c8701c76c5e58e2aa0ca6bd323c
ReRunB49-3.txt sha256=90197645dbb895dbe7d232686f59072103dd3ace06b79590f286f7e8a2add75f
```

This was an isolated predicate exercise, not a run of `repairs50-probe.mjs` against a modified/committed revision; no scratch repository or lane/fleet files were changed. No tools were installed.