# Round-78 freeze review — K78ReviewFreeze

Axes: **operability + coverage (orchestration and tooling)**. This is an outside review, not approval/admission. Primary object: `ad2630d0566a561ee078f47fade5644a22c10621`; subsequent amendments are distinguished from those committed bytes. No lane code, counter, configuration, or git state was mutated by this seat.

## Findings, severity ordered, with exact dispositions

### FREEZE-FIX 1 — High: quoted commands select the wrong lane

Both original probes line 25 contain:

```js
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..');
```

From `.ufo/waves/round-78/probe` this selects `<lane>/.ufo`, not `<lane>`. The original claim sentences omit `--lane`, so their exact commands do not exercise the implementation: C1 returns `C78_C1: HELD held=0/12`, exit 1 (missing `.ufo/scripts/...`); C2 reports `.ufo/.ufo/pins/omp-shape.json invalid`, exit 2 before any arm. See `c1-at-scaffold.txt`, `c2-at-scaffold.txt`. These are genuine counter defects, not implementation failures.

**Disposition: invocation corrected in Amendment 2; counter defect remains routed, not a round-78 blocker under that explicit correction.** Amendment 2 says:

> Those two sentences are corrected to the explicit form:
> - C1: `node .ufo/waves/round-78/probe/probe78-c1.mjs --set c1 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin`
> - C2: `node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin`

It also states:

> **No probe byte changes.** ... The broken default is recorded as a routed defect (round 79: rewrite `DEFAULT_LANE` to four `..` and re-run both control sets).

Exact future source repair: append `, '..'` before `);` on the declaration above. Do not perform that post-data instrument change in this round. Current instrument identities: C1 `5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed`; C2 `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460`.

A2 originally also said “No arm was ever run through the default”. This review did run those commands; that universal statement is too broad. Exact wording correction requested: `No implementation-scoring run used the default` in place of `No arm was ever run through the default`. Failed review reproductions must not disappear from the record. This is wording, not a changed route or admission rule.

### FREEZE-FIX 2 — High at original freeze: arm 9 rejects canonical diagnostics

Original C1 `checkAxesCrosscheck` selects:

```js
f.kind === 'AXES_DRIFT' && f.term === 'coverage_kimi'
```

Canonical `scripts/proxy-check.mjs:1290-1306` emits `term: axis` and `key: term`. Its existing kimi selftest at 2336-2343 asserts `term === 'coverage:kimi-layer'` and `key === 'coverage_kimi'`. A compliant implementation should not regress this diagnostic contract merely to satisfy the counter.

**Disposition: fixed pre-data in Amendment 1**, not open. Exact correction `f.term === 'coverage_kimi'` → `f.key === 'coverage_kimi'`. A1 records:

> Counter bytes `aa00be37…` → `5e9d9d4f…`; all four pre-data controls were re-scored on the amended bytes ... Found ... before any C1 implementation was scored.

The new bytes and re-scored controls were observed during this review. The pre-data ordering of implementation execution is the amendment's attestation, not something a git log alone proves.

### FREEZE-FIX 3 — Medium at original freeze: C2 grammar contradicts its in-sync arm

Original plan C2 grammar ends `changed=<n> first=<name>`, without making `first` conditional. But original C2 line 95 requires exact equality with:

```text
OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0
```

No implementation can both append an unconditional `first=` and pass this exact equality.

**Disposition: wording corrected in Amendment 3**, not open. A3 says:

> The C2 line grammar above is read as `first=<name>` **on DRIFT only**; the IN_SYNC line carries no `first=` field ... which is what the frozen counter asserts.

Exact grammar interpretation: append `first=<name>` only to DRIFT; no counter bytes changed.

## Verified honest items

- Both claim predicates at the original freeze are single sentences, each joining the M target and below-target base control with a semicolon. There are exactly 12 C1 and 11 C2 arms. Full arm-by-arm plan quotes, probe assertion quotes and source line numbers appear below (also `arm-by-arm.md`). The only direct diagnostic-field mismatch is C1 arm 9, corrected by A1. C2's command-line grammar mismatch is corrected by A3.
- `HEAD` was the scaffold commit at initial examination; its parent is `0b4df07b6f7478e7db6afb6852c418e096663c3c`. Initial worktree diff for wave/scripts/scorecard against that commit was empty. The scaffold contains all nine requested artifacts: plan, two probes, fixture, open receipt and four controls. Its time is 03:36:47 -0300; original controls are timestamped 03:36:29/41, before dispatch artifacts at 03:39. Wave git history contains only the scaffold commit (`git-history.txt`), not any round-78 scored closure. `git-scorecard-diff.txt` shows the scorecard change there is the prior spotcheck/map remeasurement, not an earned C1/C2 claim.
- **Scope of no-scoring evidence:** no committed round-78 seat score existed at freeze. Git history cannot prove nobody executed a counter privately. Later implementation-scoring activity is explicitly acknowledged by A2; it must not be projected back into the original freeze.
- Original probe hashes matched all four original control receipts exactly at initial read. Original C1 sha `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf`; original C2 sha `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460`. Later C1/receipt changes were detected and separated, not silently treated as original bytes. `artifact-digests.json` preserves both versions' identities.
- Original base controls independently reproduce **3/12 and 2/11, both exit 1**, with archived base code and exact original instruments (`c1-original-frozen-base.txt`, `c2-original-frozen-base.txt`). The amended C1 base reproduces **4/12**, exit 1 (`c1-base-rerun.txt`); its gain is exactly the canonical axes arm. All four stored negative controls fail their targets.
- Cheapest do-nothing control: run the original probes against the untouched scaffold via explicit `--lane`; it too yields **3/12 and 2/11**, exit 1 (`*-original-frozen-scaffold.txt`). C1 has no `K_findings` term or exported `decide` and retains five literal `K_MEMBER_RULES` occurrences. C2 lacks `--compare` and returns usage 64 on those calls. Therefore repairing the pre-existing map alone cannot earn either target. Constant MATCH/IN_SYNC lines cannot satisfy all conflicting clean/mode/stray/missing or added/removed/changed predicates simultaneously. Individual arms can pass by coincidence, as the stub controls honestly show.
- Fixture hash is unchanged: `3b307fe613b7d49bd29833be45cef789aca9db572cc85ceed246dabd09f01817`. Its 32 entries use only `path`, `kind`, `mode`, optional `children`; top-level metadata is `root`/`captured`. Children arrays have 18 secondary agents and 7 skills. The frozen materializer writes empty files, not real contents. All materialized files were observed empty. The 57 explicit member/child paths do not equal census member counts because census has counted-directory and chain-family rules.
- Fixture independence was exercised, not merely inferred: separately mutate scratch census `MEMBERS` and proxy `K_MEMBER_RULES` config path from `config.toml` to `mutated-member-not-in-fixture`; materialize from unchanged frozen JSON after each mutation. Both resulting normalized path/kind/mode/size lists are identical to the baseline; implementations report drift while fixture bytes and shape do not move (`fixture-independence.json`, `fixture-mutated-members.txt`, `fixture-mutated-proxy.txt`). Neither materializer consumes either source table. No real config contents were read for this check. Read-only live metadata spotchecks match the fixture modes; live counts remain 18/7.
- Open-state commands were re-run with actual exit capture. `open-kimi.txt`: `KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)`, exit 0. `open-omp.txt`: `OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)`, exit 0. Although the assignment says “two”, all three plan command families were covered: `open-proxy-base.txt` exactly reproduces `C2_TOTAL_DRIFT ... declared=186 computed=187` plus `AXES_DRIFT term=coverage ...10...9`, exit 1, at the base snapshot. Pinned origin is `31c465f`.
- “Freeze runs on a green map” is true of isolated committed scaffold bytes: `proxy-isolated-scaffold.txt` returns `PROXY: MATCH`, exit 0, `A=859 C=37`, `C2=187/187`. A live-lane check during concurrent seat writes instead returns `A_DRIFT` (`859` versus `872` in the captured full receipt); do not call that live workspace green or mistake generated-artifact drift for falsification of the committed repair. The first exploratory piped proxy command printed a pipeline status rather than the proxy status; the full subprocess receipt supersedes that status, explicitly exit 1.
- `K_MEMBER_RULES` genuinely has 32 rows and starts at line 615. It already has four `secret: true` flags; the plan says no *secret-shape aliasing*, not no secret flags. Census adds mode floors/ceilings, owner checks and leaf alias behavior; deleting these flags blindly would not be a valid interpretation of the claim.
- Saturation wording is honest: operability's integer is explicitly terminal 9, not a claimed 9→10 gain; a demonstrated non-scoring capability row is the proposed move. K's clean integer stays 10. These are pre-registered targets, not review admission of completed implementations.

## Control receipt census

| Version | Receipt | Held | Exit | Probe sha256 quoted in receipt |
|---|---|---|---|---|
| original | c1-base.txt | 3/12 | 1 | `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf` |
| original | c1-stub.txt | 5/12 | 1 | `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf` |
| original | c2-base.txt | 2/11 | 1 | `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460` |
| original | c2-stub.txt | 5/11 | 1 | `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460` |
| amended | c1-base.txt | 4/12 | 1 | `5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed` |
| amended | c1-stub.txt | 5/12 | 1 | `5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed` |
| amended | c2-base.txt | 2/11 | 1 | `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460` |
| amended | c2-stub.txt | 5/11 | 1 | `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460` |

Originals are retained as `original-*.txt`; amendment receipts as `amended-*.txt`. The C2 instrument hash is unchanged even though its receipt timestamps were refreshed. Stub outcomes are receipt-verified, not independently reproduced: the original stand-in source/driver is not frozen with these receipts.

## Residual risk and verification gaps

1. C1 `single-derivation` is weaker than the stated import/call contract: it checks absence of the literal `K_MEMBER_RULES` and an independently callable `decide(clean)`, not that proxy actually imports/calls it. A renamed duplicate could satisfy that static arm and the finite behavioral fixtures. Review actual import and callsite in the implementation; do not add a post-data counter arm or treat a zero-name search as semantic proof.
2. Pre-data ordering for A1 is attested in the append-only amendment; no independently timestamped execution ledger was supplied to prove the negative that no C1 measurement preceded it. Likewise git log proves committed chronology only.
3. Stub receipts cannot reconstruct exact stand-in source. All asserted counts and instrument identities are present and below target, but executable provenance is weaker than archived base controls.
4. Live roots and generated wave artifacts can change while seats run. Final L1 measurement must distinguish pinned code from concurrent build population and retain real exit statuses. No final implementation, pin update, or all-axis non-regression verdict is issued here.
5. `xd://lsp` returned “No such tool”; no status/references/definition/diagnostics server was available. Static source observations and subprocess receipts are used, not presented as semantic LSP proof. Runtime identity/rerouting/resume continuity were not changed in this frozen artifact diff and are not independently certified by this review.

## Commands and receipt index

- `git -C <lane> rev-parse HEAD`, `rev-parse ad2630d^`, `log -- .ufo/waves/round-78`, `show --stat ad2630d`, `show ad2630d -- SCORECARD.md`: git receipts plus artifact digests; initial HEAD/parent recorded above.
- `git -C <lane> archive <base|scaffold>` → seat-only scratch snapshots; no disposable git repository was initialized or committed. The expected `rev-parse` failure inside a git archive is not a source-root guard bypass: archives intentionally have no `.git` and no git mutation followed. For the Python scaffold extraction historical symlinks/hardlinks were excluded after `data` filtering rejected an absolute historical link; no linked target was accessed. The isolated proxy still matched.
- `sha256sum` frozen artifacts and SHA-256 over `git show <commit>:<path>` vs live bytes: `artifact-digests.json`.
- `node <original frozen probe> --set c1|c2 --lane <base|scaffold> --work <seat scratch>`: four `*-original-frozen-*.txt` receipts. Default invocations omitted `--lane`: `c1-at-scaffold.txt`, `c2-at-scaffold.txt`.
- `node <amended c1> --set c1 --lane <base> --work <seat scratch>`: `c1-base-rerun.txt`.
- `node scripts/kimi-census.mjs`, `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json`, `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --strict`: `open-*.txt`, `proxy-isolated-scaffold.txt` (each records cwd, argv, stdout/stderr, actual exit).
- Fixture materialization uses exactly frozen JSON modes/paths and empty-file semantics; surgical table mutations only in scratch snapshots: `fixture-independence.json`, `fixture-mutated-*.txt`.
- Metadata/shape exploratory commands (`stat -c '%a %n'`, child counts, table-row count) are summarized above; their raw relevant results are retained in `exploration-observations.txt`. `lsp-unavailable.txt` records device absence.

No tools installed/upgraded. Scratch copies and fixtures are deleted before handoff; evidence is under this seat's build directory, never `/tmp`.

## Arm-by-arm plan/probe evidence

# Frozen plan / assertion concordance

All line numbers refer to ad2630d. Predicates are single sentences; multiline wrapping is not a sentence boundary. Additional assertions strengthen some summaries (exit statuses, exact counters), not contradictions. C2 line grammar separately conflicts with its exact in-sync assertion (A3).

### C1 census-clean-fixture

Plan `plan.md:45`:
> 1. `census-clean-fixture` — census on the frozen fixture root: CLEAN, members=55.

Probe `probe78-c1.mjs:95`:
```js
const ok = r.status === 0 && /^KIMI_CENSUS: CLEAN \(members=55 checked=55 /u.test(line);
```

Matches the stated predicate.

### C1 census-mode-violation

Plan `plan.md:46`:
> 2. `census-mode-violation` — `mcp.json` chmod `0200` (drops the declared `0400` floor): census
>    DRIFT with `SHAPE_DRIFT mcp.json`.

Probe `probe78-c1.mjs:101`:
```js
const ok = r.status === 1 && /SHAPE_DRIFT/u.test(r.stdout) && /mcp\.json/u.test(r.stdout);
```

Matches the stated predicate.

### C1 proxy-clean-terms

Plan `plan.md:48`:
> 3. `proxy-clean-terms` — proxy `--kimi-root F --json`: `K_members=55 K_sections=55 K_findings=0
>    coverage_kimi=10`, MATCH.

Probe `probe78-c1.mjs:109`:
```js
const ok = r.status === 0 && j?.verdict === 'MATCH' && t.K_members === 55
    && t.K_sections === 55 && t.K_findings === 0 && t.coverage_kimi === 10;
```

Matches the stated predicate.

### C1 proxy-mode-violation

Plan `plan.md:50`:
> 4. `proxy-mode-violation` — same root mutated: `K_findings=1 coverage_kimi=9`, findings include
>    `K_FINDINGS_DRIFT` and `COVERAGE_KIMI_DRIFT`.

Probe `probe78-c1.mjs:120`:
```js
const ok = t.K_findings === 1 && t.coverage_kimi === 9
    && k.has('K_FINDINGS_DRIFT') && k.has('COVERAGE_KIMI_DRIFT');
```

Matches the stated predicate.

### C1 proxy-stray

Plan `plan.md:52`:
> 5. `proxy-stray` — an undeclared root member: census `UNLISTED`; proxy `K_findings=1
>    coverage_kimi=9`.

Probe `probe78-c1.mjs:130`:
```js
const ok = c.status === 1 && /UNLISTED/u.test(c.stdout)
    && t.K_members === 55 && t.K_findings === 1 && t.coverage_kimi === 9;
```

Matches the stated predicate.

### C1 proxy-missing

Plan `plan.md:54`:
> 6. `proxy-missing` — `region` removed: census `MEMBER_MISSING`; proxy `K_members=54
>    K_findings=1 coverage_kimi=9`.

Probe `probe78-c1.mjs:140`:
```js
const ok = c.status === 1 && /MEMBER_MISSING/u.test(c.stdout)
    && t.K_members === 54 && t.K_findings === 1 && t.coverage_kimi === 9;
```

Matches the stated predicate.

### C1 single-derivation

Plan `plan.md:56`:
> 7. `single-derivation` — `K_MEMBER_RULES` in the proxy = 0 hits; the census exports `decide`
>    and `decide(F)` returns `{members:55, findings:[], identities has mcp.json}`.

Probe `probe78-c1.mjs:159`:
```js
const ok = dup === 0 && d !== null && d.members === 55 && d.findings === 0 && d.hasMcp === true;
```

Matches the stated predicate.

### C1 stanza-tamper

Plan `plan.md:58`:
> 8. `stanza-tamper` — a copied scorecard declaring `K_findings=1`: `K_FINDINGS_DRIFT` fires.

Probe `probe78-c1.mjs:177`:
```js
const ok = r.status === 1 && k.has('K_FINDINGS_DRIFT') && t.K_findings === 0 && t.coverage_kimi === 10;
```

Matches the stated predicate.

### C1 axes-crosscheck

Plan `plan.md:59`:
> 9. `axes-crosscheck` — a copied scorecard whose `coverage:kimi-layer` row reads 9: `AXES_DRIFT`.

Probe `probe78-c1.mjs:188`:
```js
const ok = r.status === 1 && k.has('AXES_DRIFT') && axes !== undefined;
```

FREEZE-FIX: field mismatch; original term selector is not the canonical axis diagnostic. Corrected by Amendment 1 (key selector).

### C1 content-blind

Plan `plan.md:60`:
> 10. `content-blind` — a fixture `mcp.json` carrying `PROBE78_KIMI_SECRET_MARKER` bytes: neither
>     tool's stdout/stderr ever contains the marker (shape-only preserved).

Probe `probe78-c1.mjs:197`:
```js
const ok = !leaked && /KIMI_CENSUS: CLEAN/u.test(c.stdout) && r.json?.terms?.K_findings === 0;
```

Matches the stated predicate.

### C1 live-strict

Plan `plan.md:62`:
> 11. `live-strict` — the live lane `--strict --json`: MATCH, `K_findings=0`, `coverage_kimi=10`.

Probe `probe78-c1.mjs:204`:
```js
const ok = r.status === 0 && r.json?.verdict === 'MATCH' && t.K_findings === 0 && t.coverage_kimi === 10;
```

Matches the stated predicate.

### C1 selftests

Plan `plan.md:63`:
> 12. `selftests` — `kimi-census --selftest` and `proxy-check --selftest` both exit 0.

Probe `probe78-c1.mjs:212`:
```js
const ok = c.status === 0 && p.status === 0;
```

Matches the stated predicate.

### C2 usage-lists-compare

Plan `plan.md:94`:
> 1. `usage-lists-compare` — the tool's usage names `--compare`.

Probe `probe78-c2.mjs:87`:
```js
const ok = help.status === 0 && /--compare/u.test(help.stdout);
```

Matches the stated predicate.

### C2 in-sync

Plan `plan.md:95`:
> 2. `in-sync` — materialised root vs the pinned receipt: IN_SYNC, entries=64, added/removed/changed 0, exit 0.

Probe `probe78-c2.mjs:94`:
```js
const ok = r.status === 0
    && line === 'OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0';
```

Matches the stated predicate.

### C2 added

Plan `plan.md:96`:
> 3. `added` — root + one extra member: DRIFT `added=1 first=probe-extra`, exit 1.

Probe `probe78-c2.mjs:104`:
```js
const ok = r.status === 1 && /^OMP_SHAPE_COMPARE: DRIFT /u.test(line)
    && /entries=65 receipt=64 /u.test(line) && /added=1 removed=0 changed=0 /u.test(line)
    && /first=probe-extra$/u.test(line);
```

Matches the stated predicate.

### C2 removed

Plan `plan.md:97`:
> 4. `removed` — one receipt member deleted: DRIFT `removed=1`, exit 1.

Probe `probe78-c2.mjs:116`:
```js
const ok = r.status === 1 && /entries=63 receipt=64 /u.test(line)
    && /added=0 removed=1 changed=0 /u.test(line) && line.includes(`first=${victim}`);
```

Matches the stated predicate.

### C2 changed

Plan `plan.md:98`:
> 5. `changed` — one mode changed: DRIFT `changed=1`, exit 1.

Probe `probe78-c2.mjs:127`:
```js
const ok = r.status === 1 && /entries=64 receipt=64 /u.test(line)
    && /added=0 removed=0 changed=1 /u.test(line) && line.includes(`first=${victim.name}`);
```

Matches the stated predicate.

### C2 invalid-receipt

Plan `plan.md:99`:
> 6. `invalid-receipt` — malformed JSON: exit 2 `SHAPE_INVALID`.

Probe `probe78-c2.mjs:136`:
```js
const ok = r.status === 2 && /SHAPE_INVALID/u.test(r.stdout + r.stderr);
```

Matches the stated predicate.

### C2 absent-receipt

Plan `plan.md:100`:
> 7. `absent-receipt` — missing file: exit 2 `SHAPE_NOT_FOUND`.

Probe `probe78-c2.mjs:142`:
```js
const ok = r.status === 2 && /SHAPE_NOT_FOUND/u.test(r.stdout + r.stderr);
```

Matches the stated predicate.

### C2 root-not-dir

Plan `plan.md:101`:
> 8. `root-not-dir` — `--root` a file: exit 2.

Probe `probe78-c2.mjs:150`:
```js
const ok = r.status === 2 && /ROOT_NOT_A_DIR/u.test(r.stdout + r.stderr);
```

Matches the stated predicate.

### C2 content-blind

Plan `plan.md:102`:
> 9. `content-blind` — marker bytes inside a member file: IN_SYNC and no marker in output.

Probe `probe78-c2.mjs:161`:
```js
const ok = !leaked && r.status === 0 && /IN_SYNC entries=64 receipt=64 /u.test(lastLine(r));
```

Matches the stated predicate.

### C2 non-scoring

Plan `plan.md:103`:
> 10. `non-scoring` — `--compare` is absent from `scripts/proxy-check.mjs`; `--snapshot`→`--shape`
>     roundtrip still reads `OMP_CENSUS: CLEAN (source=snapshot`.

Probe `probe78-c2.mjs:171`:
```js
const ok = inProxy === 0 && snap.status === 0 && shape.status === 0
    && /OMP_CENSUS: CLEAN \(source=snapshot entries=64 findings=0 bound=35\/35\)/u.test(shape.stdout);
```

Matches the stated predicate.

### C2 selftests

Plan `plan.md:105`:
> 11. `selftests` — `omp-census --selftest` exit 0 and the live `--shape` reading unchanged.

Probe `probe78-c2.mjs:180`:
```js
const ok = st.status === 0 && live.status === 0 && /OMP_CENSUS: CLEAN \(source=snapshot /u.test(live.stdout);
```

Matches the stated predicate.
