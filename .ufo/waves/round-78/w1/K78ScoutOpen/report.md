# K78ScoutOpen — recon (round 78): C1/C2 BEFORE state, change surface, S228

**Seat**: scout (leaf). **Lane**: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (never edited).
**Tree read**: `git archive ad2630d0566a561ee078f47fade5644a22c10621` → scratch (`git archive` is read-only;
base tip `0b4df07b`). **Host**: Linux 7.2.11-arch1-1 x86_64, node v24.21.0.
No git/jj mutation was issued anywhere; scratch removed after the captures were copied to
`build/K78ScoutOpen/`. Nothing installed or upgraded (no pacman transaction).

## 0. Frozen counters — digests and measured BEFORE counts

sha256 at the adoption commit (matches the ticket prefixes):

| file | sha256 |
|---|---|
| `probe/probe78-c1.mjs` | `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf` |
| `probe/probe78-c2.mjs` | `a46e53d7449bffad66541dae4661e20651930dc4551b49f6544eb56d5e84b460` |
| `probe/kimi-fixture.json` | `3b307fe613b7d49bd29833be45cef789aca9db572cc85ceed246dabd09f01817` |

Measured on this host against the archive tree:

- `C78_C1: HELD held=3/12` exit 1 — ok arms: `census-clean-fixture`, `census-mode-violation`, `selftests`.
- `C78_C2: HELD held=2/11` exit 1 — ok arms: `non-scoring`, `selftests`.

This reproduces the scaffolding commit's `base 3/12·2/11`.

**The lane moved under the recon (authorized, append-only).** While I ran, the lane worktree gained
`plan.md` Amendments 1–3 (uncommitted; HEAD is still `ad2630d0`). Amendment 1 changes exactly one
probe byte — the arm-9 selector `f.term === 'coverage_kimi'` → `f.key === 'coverage_kimi'` — so the
live `probe78-c1.mjs` now hashes
`5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed` and the four control receipts
were re-scored (`controls/c1-base.txt` 4/12). I re-ran the amended counter myself against the same
base archive: **`C78_C1: HELD held=4/12`** (arms 1, 2, 9, 12), exit 1 (`recon-amended-probe.txt`).
C2's bytes are unchanged (`a46e53d7…`, 2/11). Both readings are below the target, so the
before-state conclusion is unaffected; the committed-byte reading in the table above is the one the
ticket's sha names.

## 1. C1 BEFORE — the six required measurements (observed)

1. `grep -c 'K_MEMBER_RULES' scripts/proxy-check.mjs` → **5** (definition line 615, consumer 922,
   selftest lookups 2188/2200/2212); the table itself is **32 rows** (616–648).
2. `grep -c 'export ' scripts/kimi-census.mjs` → **0**. No `decide`, no exports; the module is
   import-safe (entry guard at 1089–1096: `isEntry` compares `process.argv[1]` realpath, then `main()`).
3. `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src --json` → **exit 0,
   `MATCH`**; terms `C1k=5 C1k_total=5 K_members=55 K_sections=55 coverage_kimi=10`;
   **`K_findings` is ABSENT** from `terms` and from `terms.declared` (`grep -c K_findings` on the
   JSON = 0).
4. Base formula, documented at proxy line 178: `coverage_kimi = floor(10 × C1k/C1k_total ×
   K_sections/K_members)`. Assembly: `kTerms` 1026–1040, `members = kimi.members` from
   `kMembers(opts.kimiRoot)` (1465), `layerCoverage` (863). The OMP precedent the plan copies is
   already imported: `import { BASE_MEMBERS, CHAIN_FAMILIES, census, censusEntries, shapeFromFile }
   from './omp-census.mjs'` at 325; `O_findings`/`coverage_omp` at 1066–1069; formula doc at 57.
5. **Findings move nothing — measured.** On the frozen probe's fixture roots the base proxy reads
   `coverage_kimi=10` for every root while the census exits 1 on three of them:

   | root | census | proxy terms (base) |
   |---|---|---|
   | `k-clean` | CLEAN, members=55 | K=55/55, cov 10 |
   | `k-mode` (`mcp.json` 0200) | exit 1 `SHAPE_DRIFT mcp.json` | K=55/55, cov 10 |
   | `k-stray` (`+probe-stray.bin`) | exit 1 `UNLISTED` | K=55/55, cov 10 |
   | `k-missing` (no `region`) | exit 1 `MEMBER_MISSING` | K=54/54, `DRIFT (K_MEMBERS_DRIFT, K_SECTIONS_DRIFT)`, cov 10 |

   Exact per-root terms are in `recon.txt` PART 8: the first three read `MATCH` with K=55/55,
   k-missing reads `DRIFT` with K=54/54 (its drift comes from the archive scorecard declaring
   55/55), and `coverage_kimi` is **10 in all four** — the census finding moves no score term.
   Probe arms 3–6 fail exactly here; `proxy-clean-terms` fails only on the absent `K_findings`.
6. Census on the probe's own fixture root: `KIMI_CENSUS: CLEAN (members=55 checked=55 chain=1
   info=4)` exit 0 — the line matches arm 1's regex (note fixture `chain=1` vs live `chain=22`).
   `--json`: verdict CLEAN, `findings: []`, `totals.rootEnum {children:28, declared:27, strays:0}`.

## 2. C1 — arm 9's field-name defect: measured here, already repaired by Amendment 1

The committed counter's arm 9 (`axes-crosscheck`) selected `findings.find(f => f.kind ===
'AXES_DRIFT' && f.term === 'coverage_kimi')`. I applied exactly the arm's mutation (copy
`SCORECARD.md`, set `| coverage:kimi-layer | 9 |`) and ran the base tool on `k-clean`; the single
finding is:

```json
{ "kind": "AXES_DRIFT", "term": "coverage:kimi-layer", "key": "coverage_kimi",
  "declared": 9, "computed": 10 }
```

`term` is the **axis name**, `key` the term key (`compareAxes`, proxy 1290–1310), so the original
selector could not match regardless of the formula. The lane's own pre-data review reached the same
conclusion: plan.md **Amendment 1** (worktree, append-only) changes that one selector to
`f.key === 'coverage_kimi'`, and the amended arm now passes at base — `axes-crosscheck ok
coverage:kimi-layer: ## Axes row=9 derived=10` in my re-run of the amended counter
(`recon-amended-probe.txt`) and in the lane's re-scored `controls/c1-base.txt`.

**Consequence for the patch: none.** The canonical shape (`term` = axis, `key` = term key) stays; no
relabel and no `AXIS_ROWS` surgery is needed, and the base assertions at 2134/2336 remain valid. I
record the measurement because it is why the counter byte moved and because that shape is now
load-bearing for the arm.

Related contract-visible spots (unchanged by the amendment):

- `scripts/proxy-check.mjs:1301` — the finding shape `{term: axis, key: term}`.
- `scripts/proxy-check.mjs:2134` — selftest asserts `term='coverage:runtime-layer'`, `key='coverage_runtime'`.
- `scripts/proxy-check.mjs:2336` — selftest asserts `term='coverage:kimi-layer'`, `key='coverage_kimi'`, `findings.length===1`.
- `LOG.md:1442,1667` — historical records `AXES_DRIFT term=coverage:kimi-layer declared=10 computed=9` (append-only prose).
- No consumer outside `scripts/proxy-check.mjs` reads a finding's `term` (grep over `scripts/*.mjs`).

## 3. C1 — the formula's `K_sections` consequence

The written formula `floor(10 × C1k/C1k_total × (K_members − K_findings)/K_members)` **drops the
`K_sections/K_members` factor** the base formula carries. The frozen arms are blind to this:
every fixture root is fully sectioned (`K_sections == K_members`) and live is 55/55 with
`K_findings=0`. The base proxy selftest encodes the section-driven value in **13 verdict
literals** (`K=4/30 coverage:kimi-layer=1`: lines 1825 1835 1841 1942 2220 2224 2245 2271 2322
2546 2734 2775 2965) and **8 coverage expectations** (1770, 2163, 2232, 2382, 2411, 2429, 2449,
2466), plus the case "coverage_kimi recompute: two sections lost ⇒ 1→0" (2300–2311). Under the
written formula those fixtures read **10** when findings=0. The `## Axes` row (SCORECARD 358) still
cites `floor(10 × 5/5 × 53/53)` and names `K_MEMBER_RULES` as a live table — both need rewriting
to the new formula and the 55/55 live reading.

Because the counter is frozen and "a counter change is a routed defect", this is **not** a seat
edit; it is routed to L1 as an open question (see §9). Amendments 1–3 do not touch the formula — they
repair the arm-9 selector, the claim sentences' `--lane`, and the IN_SYNC line reading.

## 4. C1 — mechanical propagation list (code-read, not executed)

- `TERM_KEYS` 523–526: add `K_findings`; `STANZA_KEYS = [...TERM_KEYS, ...PINS]` (537) follows.
  `compareTerms` (1188) builds the kind as `` `${key.toUpperCase()}_DRIFT` ``, so
  `K_FINDINGS_DRIFT` needs no extra code.
- Stanza parse (1095–1140) **requires every stanza key**: `missing key(s) → STANZA_MALFORMED`.
  The SCORECARD stanza (`<!-- kumitate-proxy-v1`, head line 288; K lines 303–305) must gain
  `K_findings=0` in the same patch or every run is STANZA_MALFORMED.
- `FINDING_KINDS` 651–658 + the coverage assertion at 3277: every listed kind must fire in the
  selftest, so `K_FINDINGS_DRIFT` needs a fixture that makes it fire.
- `fxScorecard` (1632–1660) writes one stanza line per `TERM_KEYS` from `fx.expect`: **16**
  `expect: {` objects must gain `K_findings` (e.g. 1770, 2163, 2351) or every fixture stanza becomes
  `K_findings=undefined` → STANZA_MALFORMED.
- 1906 asserts `TERM_KEYS.length === 23`; 1909 asserts `STANZA_KEYS.join(' ') === parentV1Keys`
  (the 29-key string). Both literals move (24 term keys / 30 stanza keys).
- `decide(root)` (arm 7) must return `{members:55, findings:[], identities: Set|Array ∋ 'mcp.json'}`
  on `k-clean`. Census internals: `verify(root, uid)` (264) returns `{ok, findings, infos, rows,
  enumerables, strays, totals}` (414), findings shaped `{severity, kind, id, detail}`; `totals.errors
  = findings.length`, the natural `K_findings`. **No identity Set exists today** — rows/enumerables/
  `MEMBERS` carry the data and `decide` must expose it.
- Import path: proxy already imports a sibling census the same way (325); `kimi-census.mjs` has no
  import cycle with the proxy and its entry guard makes `import()` silent.

## 5. C2 BEFORE — usage, shape plumbing, and the freeze's exact strings

- `node scripts/omp-census.mjs --compare x` → **exit 64**, stderr `omp-census: unknown argument
  --compare`, usage printed; the usage line does not name `--compare`. `--help` → exit 0, same usage.
- `grep -c -- '--compare'`: **0** in `scripts/omp-census.mjs`, **0** in `scripts/proxy-check.mjs`.
- Reusable plumbing: `readShape` 144 (readdir + lstat, `mode & 0o777`), `validateShape` 162 (keys
  exactly `kind,mode,name`; sorted unique names; kind ∈ file|dir|symlink), `shapeFromFile` 182
  (`SHAPE_INVALID`/`SHAPE_NOT_FOUND`), `snapshot` 194, `USAGE` 314, `parseArgs` 316–345
  (`incompatible modes`), `main` 668–686, `isMain` 689, selftest `capture`/`check` ~437–465 with an
  injected `io`.
- Pinned receipt `.ufo/pins/omp-shape.json`: sha256 `5980a0c8…`, contract `kumitate-omp-shape-v1`,
  **64 entries** (56 file, 8 dir, 0 symlink), sorted, first `RULES.md`. `--shape` on it →
  `OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)` exit 0.
- Live `$HOME/.omp/agent` vs that receipt (read-only name/kind/mode diff): live 64, receipt 64,
  added 0, removed 0, changed 0 → the exact IN_SYNC line can hold on this host.
- The frozen probe pins strings **the plan prose does not fully state**:
  - IN_SYNC must be exactly `OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0
    changed=0` (no `first=`), as the **last stdout line**.
  - DRIFT must be the last line starting `OMP_SHAPE_COMPARE: DRIFT ` containing
    `entries=<live> receipt=64 added=<a> removed=<r> changed=<c> ` and ending `first=<name>`;
    `first` is the first differing name (arms 4/5 victim = `RULES.md`, the first file entry).
  - root-not-dir must print the token **`ROOT_NOT_A_DIR`** (the base `readShape` throws `ENOTDIR`;
    printing that would FAIL the arm).
  - malformed/absent receipt: exit 2 with `SHAPE_INVALID` / `SHAPE_NOT_FOUND` in stdout+stderr.
  - `--help` (exit 0, stdout) must name `--compare` — the arm reads `--help`, not the error line.
  - content-blindness is already satisfied by the shape path (lstats only).
- Arm 3 leaves `probe-extra` in the root; arms 4, 5, 9 re-materialise the tree first → compare must
  be stateless per invocation.

## 6. S228 — the round's new source row

`build/K78ScoutOpen/source-s228.md`: URL, access date 2026-11-04, HTTP 200, **no `Last-Modified`
served** (Vercel/Next.js; `date`, `etag`, `age`, `x-vercel-cache` recorded instead), 276352 bytes,
sha256 `a501ef22dec9e3c0bd05ffc7082b0f6a84abf5a96d1c6199a02223b74b207cca`, anchor
`#detailed-exitcode`, 18-word verbatim quote (the 0/1/2 detailed exit codes), capture committed as
`build/K78ScoutOpen/terraform-plan.html`. The conditional `?output=1` fetch was **not** made (the
first capture carries the table). Row state: `corpus/SOURCES.md` has 166 rows, last `S227`, `S228`
absent; `corpus/knowledge/shape-receipt-live-drift.md` does not exist at base.

The row grounds the three-valued exit-code convention (0 nothing to report / 1 difference / 2 the
distinct third state) that `omp-shape-compare` adopts; the scope limit is stated in the file —
Terraform's `2` is success-with-diff, ours is fail-closed, so the row grounds the code space and the
"exit status carries the verdict" discipline, not our mapping.

## 7. Live K root shape (names/kinds/modes only) and live census

49 root children = **17 dirs** + **32 files**. Dirs: 6 at 0700 (`credentials`, `file-history`,
`locks`, `sessions`, `telemetry`, `workspace-trust`), 11 at 0755 (`agents`, `bin`, `cache`, `logs`,
`oauth`, `plugins`, `search-index`, `server`, `skills`, `updates`, `user-history`). Files: 22 are the
`config.toml.*.bak` drift chain (14×0600 + 8×0644); the rest are `config.toml` 0600, `device_id`
0600, `server.token` 0600, `session_index.jsonl` 0600, `workspaces.json` 0600, `mcp.json` 0644,
`rc-qrcode.png` 0644, `region` 0644, `tui.toml` 0644, `tui.toml.bak` 0644.
Live census: `TOTALS: members=55 checked=55 errors=0 info=4 chain=22` →
`KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)` exit 0; root enumeration
`children=49 declared=27 chain=22 strays=0`; families K1 4, K2 29, K3 10, K4 9, K5 3. No content was
read (names/kinds/modes only).

## 8. Confidence

- **Observed by command** (commands + exits in `recon.txt`): §0, §1.1–1.6, §2's finding JSON, §5,
  §6, §7.
- **Code-read** (sources never executed): the propagation consequences in §2/§3/§4 — stanza
  required-keys rule, auto-generated finding kind, `fxScorecard` emission, the 23/29-key assertions,
  `verify`'s return shape, `decide`'s missing identity Set.
- **[INFERENCE]**: the committed arm-9 selector/field mismatch (independently confirmed by
  Amendment 1); `K_findings = findings.length` (consistent with arms 4/5/6: one census finding ⇒
  coverage 9); the live OMP root transient in §10 (inferred from a DRIFT → MATCH pair minutes
  apart, not from a captured entry).

## 9. Remaining unknowns (routed, not resolved here)

1. **Does the score keep a section factor?** The frozen formula drops `K_sections`; the arms cannot
   tell; 21 base selftest expectations and the axes row assume the section factor. A counter change
   is a routed defect, so this is L1's call.
2. **`decide()` on a missing/unreadable root** — census exits 2 `KIMI_ROOT_MISSING`; no arm pins the
   proxy's behaviour then.
3. **`changed` semantics for a kind flip** (arms pin only a mode flip) and whether `first` is defined
   over added ∪ removed ∪ changed sorted by name (each arm has exactly one diff).
4. Whether the S228 `?output=1` variant is wanted at all (the conditional fetch was not triggered).

Closed during the recon, by the lane's own append-only amendments: the arm-9 term/key selector
(Amendment 1, now `f.key`), the IN_SYNC `first=` reading (Amendment 3, `first=` on DRIFT only), and
the probes' `DEFAULT_LANE` resolving three `..` to `<lane>/.ufo` instead of the lane root
(Amendment 2; the claim sentences now pass `--lane`, the broken default is routed to round 79). The
`DEFAULT_LANE` bug is why every command in `recon.txt` passes `--lane` explicitly.

## 10. Lane state observed after the recon (not my edits), and one environment transient

- Worktree (HEAD `ad2630d0`, uncommitted): `plan.md` +35 lines (Amendments 1–3),
  `probe78-c1.mjs` one line (`f.term` → `f.key`, sha `aa00be37…` → `5e9d9d4f…`), and the four
  `controls/*.txt` receipts re-scored (c1-base 3/12 → 4/12, c1-stub 5/12; C2 receipts re-timed with
  unchanged probe bytes). Read-only `git diff`, no ownership claim by me.
- **Live OMP root transient.** My run of the amended counter at 03:51Z read `proxy-clean-terms`
  exit 1 with `O_MEMBERS_DRIFT` and `live-strict` DRIFT; the same proxy re-read seconds later is
  `MATCH` with `O_members=64 O_findings=0 coverage_omp=10`, and the live-vs-pin shape diff is
  64/64/0/0/0. So C1's arm 11 (`live-strict`) is sensitive to a momentary extra entry in
  `$HOME/.omp/agent` (out of the lane's control), while C2 is insulated — its arms materialise the
  receipt. Worth a retry policy at closure, not a lane defect.

## Evidence (all in `build/K78ScoutOpen/`)

`recon.txt` (908 lines, verbatim transcripts + exit codes), `recon-part1.txt`, `recon-part2.txt`,
`recon-live.txt`, `recon-extra.txt`, `recon-extra2.txt`, `recon-c2-base.txt`,
`recon-amended-probe.txt` (amended-counter base run, 4/12), `proxy-base.json` (base `--json`,
4233 bytes), `proxy-base.err.txt` (empty), `census-k-clean.json` (8705 bytes), `axes-findings.json`,
`source-s228.md`, `terraform-plan.html`, `terraform-plan.headers.txt`.
