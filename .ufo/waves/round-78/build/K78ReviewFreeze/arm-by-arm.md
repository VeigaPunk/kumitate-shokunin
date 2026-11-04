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
