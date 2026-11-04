# K78ScoutSurface — `omp-census --compare` design recon (C2)

Read-only seat. Source pin `ad2630d0566a561ee078f47fade5644a22c10621`; `scripts/omp-census.mjs`
sha256 `14fea9c1e0dd8272494038bc21dc6e81f319841a7acba9a3560508a8f74d5384` (694 lines). No LSP
server is mounted on this host (`xd://lsp` → "No such tool"); symbol tracing used explicit line
reads and literal `grep` as the fallback, and no semantic claim below rests on grep alone — every
line quoted was read from the file.

Claim under review: `scripts/omp-census.mjs --compare FILE [--root DIR]`, one line
`OMP_SHAPE_COMPARE: IN_SYNC|DRIFT ...`, exit 0/1/2, count-only and non-scoring.

## 1. The contract the new verb must live inside

### 1.1 Depth-1 enumerator and kinds (L137-158)

```js
137 const KIND_OF = (st) => (st.isDirectory() ? 'dir'
138   : st.isFile() ? 'file'
139     : st.isSymbolicLink() ? 'symlink' : 'other');
...
143 /** Read the depth-1 shape of `root`. Throws on an unreadable root (fail-closed). */
144 function readShape(root) {
145   const st = lstatSync(root);
146   if (!st.isDirectory()) {
147     const e = new Error(`root is not a directory: ${root}`);
148     e.code = 'ENOTDIR';
149     throw e;
150   }
151   const names = readdirSync(root).sort();
152   const entries = [];
153   for (const name of names) {
154     const mst = lstatSync(join(root, name));
155     entries.push({ name, kind: KIND_OF(mst), mode: mst.mode & 0o777 });
156   }
157   return entries;
158 }
```

Consequences that `--compare` must inherit rather than re-implement:

- the root is `lstat`ed, so **a symlink to a directory is not a directory** (measured: `--snapshot`
  on a symlinked root → `OMP_SNAPSHOT: ERROR reason=ENOTDIR`, exit 2);
- entries are `lstat`ed, so a symlink member is `kind=symlink, mode=511 (0777)` (measured);
- a FIFO/socket/device is `kind=other`, which the receipt schema cannot represent;
- `mode` is masked to the low 9 permission bits; setuid/setgid/sticky bits are invisible;
- `readdirSync(...).sort()` and `validateShape`'s `previous >= e.name` both use JS UTF-16 code-unit
  order — that is the shape contract's canonical order.

### 1.2 Receipt schema (L160-192)

```js
160 const SHAPE_CONTRACT = 'kumitate-omp-shape-v1';
162 function validateShape(doc) {
163   if (!doc || Object.keys(doc).sort().join(',') !== 'contract,entries'
164       || doc.contract !== SHAPE_CONTRACT || !Array.isArray(doc.entries) || !doc.entries.length) {
165     throw Object.assign(new Error('invalid shape contract or entries'), { code: 'SHAPE_INVALID' });
166   }
167   let previous = null;
168   for (const e of doc.entries) {
169     if (!e || Object.keys(e).sort().join(',') !== 'kind,mode,name'
170         || typeof e.name !== 'string' || !e.name || /[/\\\0]/u.test(e.name)
171         || e.name === '.' || e.name === '..' || (previous !== null && previous >= e.name)
172         || !['file', 'dir', 'symlink'].includes(e.kind)
173         || !Number.isInteger(e.mode) || e.mode < 0 || e.mode > 0o777) {
174       throw Object.assign(new Error('invalid or unsorted shape entry'), { code: 'SHAPE_INVALID' });
175     }
176     previous = e.name;
177   }
178   return doc.entries;
179 }
180
181 /** Read only the receipt; never follow its names into the live agent root. */
182 export function shapeFromFile(file) {
183   let text;
184   try { text = readFileSync(file, 'utf8'); } catch {
185     throw Object.assign(new Error(`cannot read ${file}`), { code: 'SHAPE_NOT_FOUND' });
186   }
187   let doc;
188   try { doc = JSON.parse(text); } catch {
189     throw Object.assign(new Error('malformed shape JSON'), { code: 'SHAPE_INVALID' });
190   }
191   return validateShape(doc);
192 }
```

Enforced exactly: top-level key set `contract,entries`; per-entry key set `kind,mode,name`; kinds
`file|dir|symlink`; **strictly ascending** names (so duplicates and unsorted receipts are invalid);
integer mode in `[0, 0o777]`; names non-empty, not `.`/`..`, without `/`, `\`, NUL. An empty
`entries` array is invalid. `readFileSync` follows a symlinked receipt and reports *any* read error
(absent, EACCES, EISDIR) as `SHAPE_NOT_FOUND`.

### 1.3 Snapshot (L194-214) — the inverse `--compare` must agree with

```js
194 function snapshot(root, file, io) {
195   const tmp = `${file}.${randomUUID()}.tmp`;
196   try {
197     const entries = readShape(root);
198     validateShape({ contract: SHAPE_CONTRACT, entries });
199     const bytes = `${JSON.stringify({ contract: SHAPE_CONTRACT, entries }, null, 2)}\n`;
200     writeFileSync(tmp, bytes, { flag: 'wx', mode: 0o600 });
201     renameSync(tmp, file);
202     const digest = createHash('sha256').update(bytes).digest('hex');
203     io.out(`OMP_SNAPSHOT: WROTE entries=${entries.length} sha256=${digest} path=${file}`);
204     return 0;
205   } catch (e) {
206     io.err(`OMP_SNAPSHOT: ERROR reason=${e.code || e.message}`);
207     return 2;
```

Measured invariant (receipt `5980a0c8…`, 64 entries, materialised depth-1): a fresh `--snapshot`
of the materialised tree is **byte-identical** to the pinned receipt
(`build/K78ScoutSurface/shape-invariants.txt` §A). Therefore the roundtrip
`compare(root, snapshot(root))` must be `IN_SYNC` for every root `--snapshot` accepts. That is the
primary correctness oracle for `--compare`, and it forces exact kind/mode equality (not a ceiling)
and `lstat` symmetry.

### 1.4 Census decision path — must not move (L257-303)

```js
257 export function census(root, noteText) {
258   return censusEntries(readShape(root), noteText);
262 export function censusEntries(entries, noteText) {
281     if ((e.mode & ~rule.mode) !== 0) {
282       findings.push(`MODE ${e.name} want<=${oct4(rule.mode)} got=${oct4(e.mode)}`);
```

The census's mode rule is a **ceiling** (`got & ~want`), the opposite semantic from receipt
identity. `--compare` must be a separate predicate: a *narrower* mode (`0640` vs receipt `0644`)
is `changed=1` even though the census reads `CLEAN`. `scripts/proxy-check.mjs:325` imports
`census`, `censusEntries`, `shapeFromFile`; any change to those signatures/semantics would move
`coverage_omp` (`scripts/proxy-check.mjs:1047-1068`).

### 1.5 CLI surface and exit map

```js
314 const USAGE = 'usage: node scripts/omp-census.mjs [--root DIR] [--self DIR] [--note FILE] | --snapshot FILE [--root DIR] | --shape FILE [--self DIR] [--note FILE] | --selftest [--work DIR]';
...
342   if ((o.snapshot !== null && o.shape !== null) || (o.shape !== null && o.root !== null)
343       || (o.selftest && (o.snapshot !== null || o.shape !== null))) return { error: 'incompatible modes' };
344   for (const key of ['snapshot', 'shape']) {
345     if (o[key] !== null && (!o[key] || o[key].startsWith('-'))) return { error: `--${key} needs a file argument` };
346   }
...
376 function runShape(file, io, note) {
377   let entries;
378   try { entries = shapeFromFile(file); } catch (e) {
379     io.out(e.code);
380     return 2;
...
390   io.out(`OMP_CENSUS: ${res.verdict} (source=snapshot entries=${res.counts.entries} findings=${res.findings.length}${binding})`);
391   return res.verdict === 'CLEAN' ? 0 : 1;
...
668 function main(argv, io) {
670   if (parsed.help) { io.out(USAGE); return 0; }
674   if (parsed.error) { io.err(`omp-census: ${parsed.error}`); io.err(USAGE); return 64; }
679   if (parsed.selftest) { return selftest(parsed.work, io); }
682   const root = parsed.root || join(homedir(), '.omp', 'agent');
683   if (parsed.snapshot !== null) return snapshot(root, parsed.snapshot, io);
684   const note = parsed.note ?? join(parsed.self, 'corpus', 'knowledge', 'omp-agent-root.md');
685   if (parsed.shape !== null) return runShape(parsed.shape, io, note);
686   return runCensus(root, io, note);
687 }
...
693   process.exitCode = main(process.argv.slice(2), io);
```

| code | meaning | line |
|---|---|---|
| 0 | exactly one summary line, `CLEAN` (or, for compare, `IN_SYNC`) | L373, L391 |
| 1 | `DRIFT` summary preceded by finding lines (or, for compare, `DRIFT`) | L373, L391 |
| 2 | fail-closed: unreadable root, missing note, invalid/absent receipt — never CLEAN | L359-367, L378-380 |
| 64 | usage error, always with `USAGE` on stderr | L675-677 |

Two surface facts the new verb must not trip over:

- `--shape` is **already exclusive with `--root`** (L342); a `--compare` that reuses the `shape`
  slot internally would make `--compare FILE --root DIR` exit 64 (measured; see §7).
- `runShape` prints its `SHAPE_*` token with `io.out` (stdout). `OMP_SHAPE_INVALID` also matches
  the counter's `/SHAPE_INVALID/`, but keeping the exact `SHAPE_INVALID` / `SHAPE_NOT_FOUND`
  spellings preserves parity with `--shape` and `proxy-check`'s `OMP_${code}` mapping.

## 2. The contract `--compare` must satisfy

**CLI.** `--compare FILE` and `--compare=FILE`; `--root DIR` and `--root=DIR`; `--help`. Default
root is the census default `$HOME/.omp/agent`. Every mode/binding option
(`--snapshot`, `--shape`, `--selftest`, `--note`, explicit `--self`) is `incompatible modes` → 64.
`FILE` may not be empty or start with `-` (same rule as L344-346). `--work` is meaningless here
(see §7 for the candidate's silent accept).

**One-line grammar** (single spaces, exact term order):

```
OMP_SHAPE_COMPARE: IN_SYNC entries=<live> receipt=<n> added=0 removed=0 changed=0
OMP_SHAPE_COMPARE: DRIFT entries=<live> receipt=<n> added=<a> removed=<r> changed=<c> first=<name>
```

- `IN_SYNC` has **no** `first=`; the frozen counter compares it as an exact string.
- `DRIFT` ends with `first=<name>`; the counter anchors `first=probe-extra$`.
- The summary is the **last stdout line** (the counter's `lastLine`, probe L83); any per-name
  finding lines precede it.

**Counting.** Key by name, never by position:

| term | definition |
|---|---|
| `entries` | live depth-1 entry count after a successful `readShape` (every kind, representable or not) |
| `receipt` | `receipt.length` from the validated receipt |
| `added` | names live-only |
| `removed` | names receipt-only |
| `changed` | names in both whose `kind` differs **or** whose `mode` differs; one count per name |
| `first` | minimum name over `added ∪ removed ∪ changed` in the shape contract's canonical order (JS `<`, the order `validateShape` L171 enforces and `--snapshot` emits) |

Disjointness is structural: added/removed/changed are pairwise disjoint, so `first` is well
defined, and the identities `live = matched + added`, `receipt = matched + removed` must hold
(a violation is an internal bug, not a reading — fail closed rather than print a self-contradictory
line).

**Order of operations.** Validate the receipt first (fail-closed before touching the
filesystem), then read the live shape, then diff. This mirrors `--shape` and makes the error
deterministic when both sides are bad.

**Exit map.** 0 `IN_SYNC`; 1 `DRIFT`; 2 fail-closed with a token (`SHAPE_NOT_FOUND`,
`SHAPE_INVALID`, `ROOT_NOT_A_DIR`, and — recommended — a distinct `ROOT_UNREADABLE` for
ENOENT/EACCES/ELOOP); 64 usage.

**Invariants.** I1 roundtrip (`snapshot` → `compare` is `IN_SYNC`); I2 identity, not ceiling;
I3 content-blind (no member is opened; only `readdir`, `lstat`, and the receipt is read);
I4 never join a receipt name to the root (the live map comes solely from `readdir`);
I5 no writes of any kind; I6 zero coupling to `proxy-check.mjs` (arm 10).

## 3. Adversarial table

Fixtures are depth-1 roots built from the pinned 64-entry receipt unless stated. "exit" is the
process status; the summary line is the last stdout line.

| # | case | expected reading | mechanism / what breaks if wrong |
|---|---|---|---|
| 1 | extra file member `probe-extra` (0644) | `DRIFT entries=65 receipt=64 added=1 removed=0 changed=0 first=probe-extra`, exit 1 | name-keyed set difference; a count-only shortcut still needs the name for `first` |
| 2 | extra member lexicographically first (`0aa`) | `first=0aa` | `first` is the minimum, not "the added name" |
| 3 | extra member lexicographically last (`zzz`) | `first=zzz` | `first` is not the first live entry in readdir order |
| 4 | missing receipt member `RULES.md` | `DRIFT entries=63 receipt=64 added=0 removed=1 changed=0 first=RULES.md`, exit 1 | positional zip would report ~63 changes |
| 5 | kind change file→dir, mode equal (`agents` file 0755 vs receipt dir 0755) | `changed=1 first=agents`, exit 1 | kind is part of identity |
| 6 | mode narrowed 0644→0640 | `changed=1`, exit 1 | equality, **not** the census ceiling (census reads CLEAN) |
| 7 | mode widened 0644→0664 | `changed=1`, exit 1 | equality again |
| 8 | symlink member, receipt has none | `added=1 first=<name>`, exit 1 (kind `symlink` via `lstat`) | `stat` would follow the link and could read `file`/`dir` |
| 9 | receipt legitimately contains `kind=symlink, mode=511`, live symlink | `IN_SYNC` | receipt schema admits symlinks; `ln -s` always yields 0777 |
| 10 | root unreadable (`chmod 000`) | exit 2, no `IN_SYNC`/`DRIFT` line | fail-closed; never CLEAN by silence |
| 11 | root absent (ENOENT) | exit 2 | same fail-closed class; token may be `ROOT_UNREADABLE` |
| 12 | root is a regular file | exit 2 `ROOT_NOT_A_DIR` | frozen arm 8 |
| 13 | root is a symlink to a directory | exit 2 `ROOT_NOT_A_DIR` | `readShape` lstat's the root; no silent tree swap |
| 14 | live root is an empty directory | `DRIFT entries=0 receipt=64 added=0 removed=64 changed=0 first=RULES.md`, exit 1 | an empty receipt is impossible (SHAPE_INVALID), so IN_SYNC with an empty root is unreachable |
| 15 | live root holds a FIFO/socket (`kind=other`) | either exit 2 (unrepresentable) or `added=1`; **must be documented** | `--snapshot` refuses the same root with `SHAPE_INVALID`, so the two verbs disagree unless chosen deliberately |
| 16 | live entry vanishes between `readdir` and `lstat` | exit 2 | a dropped name would silently under-count |
| 17 | receipt has a `content` key | exit 2 `SHAPE_INVALID` | key set is exact; lenient JSON would smuggle content into a "content-free" receipt |
| 18 | receipt has an unknown top-level key | exit 2 `SHAPE_INVALID` | top key set is exact |
| 19 | receipt entries unsorted | exit 2 `SHAPE_INVALID` | L171 `previous >= e.name` |
| 20 | receipt duplicate names | exit 2 `SHAPE_INVALID` | duplicates would double-count or make `first` ambiguous |
| 21 | receipt `entries: []` | exit 2 `SHAPE_INVALID` | empty receipts cannot describe a root |
| 22 | receipt mode `0o7777` or `"0644"` | exit 2 `SHAPE_INVALID` | integer, `0..0o777` |
| 23 | receipt name with `/` or NUL | exit 2 `SHAPE_INVALID` | path-traversal guard |
| 24 | receipt name with `\n` | accepted by `validateShape`, so `first=` must escape it | a raw name splits the summary line (measured, §7) |
| 25 | receipt path is a symlink | followed; valid target → `IN_SYNC`; dangling → `SHAPE_NOT_FOUND` | `readFileSync` semantics, same as `--shape` |
| 26 | receipt path is a directory | exit 2 `SHAPE_NOT_FOUND` | EISDIR maps to NOT_FOUND |
| 27 | receipt malformed JSON / empty file | exit 2 `SHAPE_INVALID` | frozen arms 6 |
| 28 | receipt absent | exit 2 `SHAPE_NOT_FOUND` | frozen arm 7 |
| 29 | `--compare` with `--shape` / `--snapshot` / `--selftest` | exit 64 `incompatible modes` | exactly one mode per invocation |
| 30 | `--compare` with `--self` / `--note` | exit 64 `incompatible modes` | a compare never checks the note; accepting would imply a binding check |
| 31 | `--compare` with no FILE, `--compare=`, `--compare --root DIR` | exit 64 + usage | L344-346 rule |
| 32 | `--compare=FILE --root=DIR` | normal one-line reading | `=` forms |
| 33 | two differences at once | `first` = canonical minimum; counts each name once | the frozen counter never exercises this (§6) |
| 34 | kind **and** mode differ on one name | `changed=1`, not 2 | counts are per name |

## 4. Where the diagnostic can lie

`IN_SYNC` means "the live depth-1 name/kind/mode multiset equals the receipt", nothing else:

1. **Content** — a member file rewritten with new bytes still reads `IN_SYNC` (by design; arm 9).
2. **Setuid/setgid/sticky** — masked away by `mst.mode & 0o777`; changes there are invisible.
3. **Owner, group, mtime, xattrs, ACLs, SELinux labels** — not captured by the schema.
4. **Depth > 1** — nested changes are invisible (`sessions/*` etc.).
5. **Unrepresentable kinds** — FIFOs/sockets/devices have no receipt representation; if counted
   as `added`, the reading is honest about presence but a consumer cannot reproduce the receipt.
6. **Races** — an entry removed between `readdir` and `lstat`; only fail-closed avoids a silent
   under-count.
7. **Staleness** — a receipt that predates real drift but still matches the shape proves
   "unchanged since capture", not "healthy".
8. **Root identity** — a symlinked root is refused, but a root replaced by a *different directory
   at the same path* with the same shape is indistinguishable.
9. **Newline/control characters in names** — `first=` must escape them or the "one line" contract
   breaks; a sanitized `first=` is not byte-exact (the counts remain exact).
10. **Exit-code granularity** — 1 and 2 are shared by many causes; callers must read the token,
    not just the code.
11. **Default root** — omitting `--root` compares the live `$HOME/.omp/agent`; that is the
    intended after-state but must be documented, not surprising.
12. **Hard links** — two names on one inode are indistinguishable from two files.

## 5. Counter blind spots — wrong implementations that still score 11/11

The frozen counter (`.ufo/waves/round-78/probe/probe78-c2.mjs`) is satisfiable by the contract
above, but it does **not** pin all of it. Each row is a shortcut that passes all 11 arms today:

| shortcut | arms it passes | why it is still wrong | cheapest kill |
|---|---|---|---|
| `first` = maximum instead of minimum | all (every drift arm has exactly one differing name) | grammar says `first=`; inconsistent with canonical order | selftest case with two diffs (`aa`, `zz`) |
| `first` = first differing live entry in readdir order | all (single-name arms) | not a name-order minimum | same case, put `zz` before `aa` in readdir order |
| count `kind` and `mode` as two changes | all (the changed arm differs only in mode) | counts are per name | kind+mode fixture, expect `changed=1` |
| count a missing name as one `added` | removed arm? no — removed arm requires `removed=1` | arithmetic lie | already killed by arm 4 |
| ignore receipt key sets (lenient parse) | all (arm 6's receipt is malformed JSON, not a content-key receipt) | content could ride in a receipt | selftest with `content:` key and unknown top key |
| ignore sortedness/duplicates | all | duplicates make `first`/counts ambiguous | selftest unsorted + duplicate receipts |
| use `stat` instead of `lstat` | all (receipt has no symlinks) | breaks snapshot symmetry for symlink members/roots | selftest symlink member + symlinked root |
| print `first=` raw | all (all receipt/probe names are ASCII, no whitespace) | line contract breaks on a legal newline name | selftest newline name |
| silently ignore `--work` with `--compare` | all | a caller thinks it controlled scratch | usage case |
| accept a missing root as `ROOT_NOT_A_DIR` | all (arm 8 uses a regular file) | token is false for ENOENT | documentation decision, not a counter miss |
| re-implement the receipt parser | all | divergence from `--shape`/proxy | reviewer diff |

Recommended additions to `--selftest` (the file's own doctrine: every rule has a case that names
its finding): multi-difference `first`, kind+mode single-count, content-key/unknown-key receipt,
unsorted/duplicate receipt, symlink member, symlinked root, newline name, empty live root.

## 6. Measured delta against the integrated candidate

Candidate: `build/K78ExecCompare/omp-census.mjs` sha256
`cb0ea5d67d347f0cb4c6c85f4985e8f8f044201ec0ddb674ed94068586910bff` (`compareShape` L218-251,
`parseArgs` L356-392, usage L354, selftest compare block L682-734).

| hazard | candidate behaviour (measured) | verdict |
|---|---|---|
| frozen counter, `--lane <lane>` | `C78_C2: HELD held=11/11`, exit 0 (independent rerun, `counter-candidate-independent.txt`) | holds |
| in-sync against the pinned receipt | exact string, exit 0 | holds |
| added / removed / changed | `first=probe-extra`, `first=RULES.md`, `first=RULES.md`, exit 1 | holds |
| invalid / absent receipt, file root | exit 2 with `SHAPE_INVALID`, `SHAPE_NOT_FOUND`, `ROOT_NOT_A_DIR` | holds |
| content blindness | marker written into `RULES.md` → still `IN_SYNC`, no marker leak | holds |
| non-scoring | `--compare` count in `scripts/proxy-check.mjs` = 0; `--snapshot`→`--shape` still `CLEAN (source=snapshot entries=64 findings=0 bound=35/35)` | holds |
| `--compare` + shape/snapshot/selftest/note/self | exit 64 `incompatible modes` | holds |
| `--compare` + `--work` | accepted, `--work` ignored, exit 0 | minor: silent no-op; document or reject |
| root missing (ENOENT) | exit 2 `ROOT_NOT_A_DIR` | minor: token is false for "missing"; a distinct `ROOT_UNREADABLE` is cheaper to trust |
| root symlink | exit 2 `ROOT_NOT_A_DIR` | holds (matches `readShape`) |
| receipt symlink | followed, `IN_SYNC` | holds (matches `shapeFromFile`) |
| empty live root | `entries=0 removed=64 first=RULES.md`, exit 1 | holds |
| FIFO member | `added=1 first=zz-fifo`, exit 1 | documented asymmetry with `--snapshot` (which exits 2); acceptable only if stated |
| two added names | `first=aa-first` (min) | holds |
| newline in a live name | summary splits: `... first=aa` + `bb` on the next line | gap: violates the one-line contract; escape `\n`/`\r`/`\t`/`\` |
| `first` order, non-ASCII | canonical (UTF-16) min is `U+10000`; candidate prints `U+FFFD` (UTF-8 byte order) | gap: `first` does not mean "first in the receipt's canonical order"; use JS `<` or document the different order |
| content-key / unsorted / duplicate / empty receipt | exit 2 `SHAPE_INVALID` | holds |
| gate pin | script bytes change → `GATE_PIN_DRIFT pin.omp-census` until re-pinned | integration dependency, not a code defect |

## 7. Residual unknowns and integration dependencies

1. **`pin.omp-census` must be refreshed** in the integrating commit (SCORECARD gate-pins block,
   `.ufo/state`-adjacent stanza; current value `14fea9c1…`), else strict proxy reads
   `GATE_PIN_DRIFT`. `pin.omp-shape` is unaffected (the receipt is untouched).
2. **`--compare` must not appear in `scripts/proxy-check.mjs`**, including comments and usage —
   the frozen arm counts the literal string in the whole file. No proxy term changes.
3. **C2's other deliverables move counted terms**: adding `corpus/knowledge/shape-receipt-live-drift.md`
   adds a `corpus/README.md` row and a file under `corpus/knowledge`, so stanza `C2` and `C2_total`
   must be re-measured (188/188 if only that file is added), `.ufo/pins/readme-map.json` must gain
   the file, `pin.readme-map` must be refreshed, and a new `SOURCES.md` row (S228) may move `A`/`C`
   and `pin.cite-sources`. This is the exact defect class that produced the 7th `README_MAP` drift
   at round-78 open; run `node scripts/readme-map.mjs` and `node scripts/proxy-check.mjs --strict`
   in the same commit as those files.
4. **Live root stability**: measured now as `live=64 receipt=64 added=0 removed=0 changed=0`
   against `$HOME/.omp/agent` (`live-vs-receipt-preimpl.txt`); a closure running later must not
   assume it stayed put.
5. **C1's counter carries the same lane defect** (`probe78-c1.mjs:25`), so both claim sentences need
   `--lane` or a re-frozen counter. Plan Amendment 2 (working tree, pre-verdict) rewrites both
   invocations to the explicit `--lane` form and routes the `DEFAULT_LANE` rewrite to round 79;
   probe bytes are unchanged. See `counter-read.md` §1.
6. No LSP server was available for definition/reference tracing, so anchors are line-exact reads,
   not semantic queries.
