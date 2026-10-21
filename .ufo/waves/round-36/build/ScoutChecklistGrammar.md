CHECKLIST-GRAMMAR items=14 self-referential=0

# Scope and tree state
Read-only reversal of `--checklists` at lane tip `0614092e0804aaca06642cb3a263a05c1cacc98e`. The lane WORKING TREE was being integrated while I read (`git status`: 8 modified files + `.ufo/pins/` + `.ufo/waves/round-36/`, `scripts/surface-probe.mjs` mtime 02:28:59); `SKILL.md` already carries the final 14 item lines. Pointer convention: `(F)` = frozen rev 0614092, `(L)` = that working tree. Every quoted implementation fact was re-read at both.

# Grammar (frozen v1, `scripts/surface-probe.mjs:182 (F)` / `:223 (L)`)
    const CHECKLIST_RE = /^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u;

- Shape, in order: optional leading whitespace; literal `- [ ] ` (ASCII hyphen/brackets); label `.+?` (>=1 char, non-greedy); literal ` — ` (U+2014 em dash); command inside backticks, `[^`]+` (no backtick; spaces, `|`, `$(...)`, `;` all legal); literal ` → exit ` (U+2192); exit set = digits joined by single `|`; literal ` + `; expected substring inside backticks, `[^`]+` (non-empty, no backtick); `$` = end of the physical line. Any char after the closing expected-substring backtick (even one space) is a non-match; `\r` is a non-match (LF only). Labels should avoid the literal ` — ` and backticks (non-greedy split); commands must avoid backticks.
- Whole file, not one section: `parseChecklist` (`:1028 (L)` / `:799 (F)`) scans every physical line of `SKILL.md`; pre-filter `/^\s*- \[/`; grammar match -> item; `/^\s*- \[[xX]\]/` -> checked; any other line that passed the pre-filter (`- [?]`, `- [-]`, `- [x ]`; any `- [x]`/`- [X]` line is checked, never malformed) -> malformed. `* [ ]` and numbered lists are invisible.
- Fail-closed (`:1063-1073 (L)` / `:834-844 (F)`): `--self` not a dir, or missing `<self>/SKILL.md` -> `CHECKLIST: FAIL-CLOSED (...)` + `VERDICT: FAIL`, exit 2. Zero parsed items -> `CHECKLIST: 0/0 pass`, `VERDICT: PASS`, exit 0.
- Defaults: `--self` = `DEFAULT_SELF = resolve(HERE,'..')` (`:166 (L)` / `:130 (F)`); commands run with `cwd = opts.self` (`:1087-1089 (L)` / `:858-860 (F)`), not the caller's cwd.
- SKIP rules (`:1079-1086 (L)` / `:850-857 (F)`): checked `- [x]`/`- [X]` -> `SKIP(checked)`; `item.command.includes('--checklists')` (substring, not argv) -> `SKIP(self)`. Skips leave BOTH numerator and denominator; they are still counted by the proxy's `C` metric.
- Execution: `spawnSync('bash', ['-c', command], {cwd: opts.self, encoding:'utf8', timeout: 120_000, maxBuffer: 8 MiB})` with NO `env:` key -> the checklist run's environment is inherited (`$UFO_SRC`, `$KUMITATE_*`, `$HOME`, `PATH`). Pass iff `typeof status === 'number'` and status is in the declared set AND `(stdout + stderr).includes(expect)` (literal, case-sensitive). Timeout/signal -> `status === null` -> fail.
- Counts/verdict (`:1100-1112 (L)` / `:876-883 (F)`): `ran` = non-skipped, malformed included as failed; per-item `CHECKLIST  PASS|FAIL SKILL.md:<line> exit=<n> expected=<set> substring=hit|miss — <label>`; malformed prints `CHECKLIST  ERROR ... grammar (...)` plus a `CHECKLIST_GRAMMAR` finding in `--json`; then `CHECKLIST_SKIPPED: <n>`, `CHECKLIST: <passed>/<ran> pass`, `VERDICT: PASS|FAIL`; exit 0 pass / 1 any fail / 2 fail-closed / 64 usage.
- Mode precedence (`:1940-1941 (L)` / `:1485-1486 (F)`): `--selftest` wins, then `--checklists`, else conformance. Checklist mode IGNORES `--src`, `--strict`, `--known` (and the new `--pin`); `--strict` can never fail a checklist run; `--json` emits only the JSON object with the same exit code.

# The 14 items (live `SKILL.md:627-640`, one LF line each; cwd = lane root; `node` from PATH)
| # | line | label | exact command | exit set | expected substring | pin |
|---|---|---|---|---|---|---|
| 1 | 627 | Citation gate verdict | `node scripts/cite-check.mjs` | 0\|1 | `CITE_CHECK:` | no |
| 2 | 628 | Citation gate hermetic suite | `node scripts/cite-check.mjs --selftest` | 0 | `VERDICT: PASS` | no |
| 3 | 629 | Live sighting-surface conformance | `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json` | 0 | `SURFACE_PROBE: CLEAN` | yes |
| 4 | 630 | Surface-probe hermetic suite | `node scripts/surface-probe.mjs --selftest` | 0 | `VERDICT: PASS` | no |
| 5 | 631 | Round-gate hermetic suite | `node scripts/round-gate.mjs --selftest` | 0 | `VERDICT: PASS` | no |
| 6 | 632 | Round-close artifact audit | `node scripts/round-gate.mjs` | 0 | `ROUND_GATE: CLEAN` | no |
| 7 | 633 | Filed-report tracking | `node scripts/round-gate.mjs --tracked` | 0 | `ROUND_GATE: CLEAN` | no |
| 8 | 634 | Proxy recompute | `node scripts/proxy-check.mjs` | 0 | `PROXY: MATCH` | yes |
| 9 | 635 | Proxy-check hermetic suite | `node scripts/proxy-check.mjs --selftest` | 0 | `VERDICT: PASS` | no |
| 10 | 636 | Member-claims gate | `node scripts/claims-check.mjs` | 0 | `CLAIMS: MATCH` | yes |
| 11 | 637 | Kimi-substrate census | `node scripts/kimi-census.mjs` | 0 | `KIMI_CENSUS: CLEAN` | no |
| 12 | 638 | Sources-registry gate | `node scripts/sources-check.mjs` | 0 | `SOURCES_CHECK: CLEAN` | no |
| 13 | 639 | Sources-check hermetic suite | `node scripts/sources-check.mjs --selftest` | 0 | `VERDICT: PASS` | no |
| 14 | 640 | Anchor fidelity | `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` | 0 | `FIDELITY: CLEAN` | yes |

# What each item needs to pass at the pin
1. Accepts DRIFT: `CITE_CHECK:` matches CLEAN and DRIFT; only exit 0|1 pass. NOT pin-aware (PIN v1 covered claims/proxy/surface only) — reads `$UFO_SRC` else `~/Projects/ufo-fsd-alpha` then `origin-work/` (`cite-check.mjs:116-117`); exit 2 on missing/non-dir src or empty/zero-resolution scan (`cite-check.mjs:2521-2522,2532-2533`) fails the item. Operator-checkout dependent.
2. Hermetic (`--selftest` never resolves --src); needs its suite green.
3. Needs: pin arm resolves the clone; digest concatenated in declared `digestInputs` order; dispatcher `status` under mkdtemp env (verified reachable: rc=0, no tree names changed); `--known` rev == pin rev; exactly one KNOWN match; 0 errors (`ERROR_CODE_OFF_MANIFEST` is a non-gating warn). Without the pin file it falls back to the legacy tree, so this item can pass with NO `src-rev=` — see flag 3.
4. Hermetic, but must be updated in lockstep: the frozen fixture "digestInputs order permuted -> DIGEST_ORDER note, no error" (`F:1095-1104`) encodes the OLD sorted concat; under declared-order concat a permuted list no longer equals the fixture manifest's scriptDigest (-> `SCRIPT_DIGEST_MISMATCH`), so clean/reordered fixtures and the new `--pin`/`--known` arms must land together (baseline suite 42 cases).
5. Hermetic; nested spawns pass `UFO_SRC: ''` and the nested `--selftest` is guarded by `KUMITATE_SURFACE_PROBE_NESTED=1` (`L:1852-1857`).
6. Lane+fleet state: SCORECARD `|<round>|` Move-log row, LOG.md round bullet, citations. Origin is touched lazily only for commit tokens lane/main cannot resolve; an unprobeable origin yields `unverifiable` (no finding) (`round-gate.mjs:381-392`). Fleet main repo defaults to the lane's parent and reports dir to `<main>/.ufo/reports` (`round-gate.mjs:56-57`).
7. Same as 6 with `--tracked` (filed reports under `<main>/.ufo/reports`).
8. Needs `PROXY: MATCH` from the pin clone. Current failure is PIN_DRIFT only — the stanza is already reconciled (`C=14 C2=80 C2_total=80 R_sections=92 coverage_script=10 coverage_runtime=10`; README rows 80 == note files 80, the 80th row being `lessons/round-35-verifier-spotcheck.md`). Exact required re-pins: `pin.surface-probe=c298d168469d4a84c943197abe8178e80a0b05ea594943d7bc54e2fa62767c4b`, `pin.proxy-check=3f1b7c7bfa74d9d22e5429a18660f67e68bc894aeb3b5b744a6443a8becdece8`, and `pin.claims-check` again after claims-check is edited (currently e9a21b44… matches the unedited file). `pin.*` are error-level (`PIN_DRIFT`), not warnings.
9. Hermetic w.r.t. trees; baseline 109 cases plus the new pin cases.
10. Needs the claims pin arm (`src-rev=` inside `CLAIMS: MATCH`) and R5/R7 member sections that parse without error (live run: PASS, substring hit).
11. Host state: `~/.kimi-code` (`DEFAULT_ROOT`, `kimi-census.mjs:97`), frozen 51-member set; neither pinned nor operator-checkout.
12. Independent gate over `corpus/SOURCES.md` + frozen legacy identity set; no src tree.
13. Hermetic.
14. Needs `--fidelity` + `--fidelity-ratchet`; `.ufo/pins/fidelity-ratchet.json` exists at the pin revision with 15 notes at ceiling 0 and total 0; a note ABSENT from `notes` (including the two C2 notes) must read nonok=0; exit 2 for RATCHET_REV_STALE / RATCHET_MALFORMED / SRC_NOT_A_DIR. Currently exits 64 (`claims-check: unsupported argument: --fidelity`).

# Flags
1. self-referential = 0. No command contains the substring `--checklists`. Item 4 is NOT skipped even though it runs the same binary: `--selftest` never reads the lane SKILL.md; its fixtures call `runChecklistsMode` in-process on temp dirs. The risk is the reverse: any future item that merely mentions `--checklists` (e.g. a "run the checklist" self-check) becomes `SKIP(self)` and silently drops out of numerator/denominator.
2. Operator-checkout dependence: #1 unconditionally. #3/#8/#10 only if the default pin file is absent or the pin arm regresses. #6/#7 may consult it for commit tokens (never gating when unprobeable). #11 is host state. Items 2/4/5/9/12/13 do not read it; 14 reads the pin's `clone`.
3. The checklist does not assert provenance. Expected substrings end before the verdict parenthetical, so #3/#8/#10/#14 pass on a CLEAN/MATCH line that carries no `src-rev=`. If "every verdict names the revision it scored" must be gated by the checklist itself, append the bare token `src-rev=` to those four expected substrings (not the literal rev, to keep the portability arm); the frozen Exec spec does not include it — L1 decision.
4. Environment inherited by `bash -c`: `$UFO_SRC` etc. pass into every item. proxy-check's precedence is explicitly `--src` > pin.clone > legacy default (`resolveOrigin`, `proxy-check.mjs:391-396`), so `$UFO_SRC` does not outrank a pin. surface-probe's LIVE `main()` still does `if (opts.src === null) opts.src = resolveSrcDefault()` (`L:1953-1955`) and has no `SRC_REV`/`src-rev` code — pin arm not yet integrated; claims-check untouched. The pin arm must make pin.clone outrank `$UFO_SRC` when `--src` is absent, else item 3 scores the wrong tree (and prints no src-rev).
5. `C` coupling: proxy's `RE_CHECKLIST = /^\s*- \[/` (`proxy-check.mjs:326`) counts the same lines as the checklist pre-filter, but skip semantics differ: a `- [x]` line is SKIP(checked) yet still counted in `C` (ran shrinks, `CHECKLIST: n/n` shrinks); a malformed `- [ ]` line is a failed item AND counted in `C`. Leave all 14 as unchecked single-line `- [ ]` items or `CHECKLIST: 14/14` and `C=14` diverge.
6. Relative pin paths (`.ufo/pins/...`) in item commands resolve against cwd = `--self` (spawn cwd), and the default pin file is read as `<self>/.ufo/pins/origin.json`. A scratch clone used as `--self` must carry all three pin files.
7. `parseChecklist` reads the WHOLE `SKILL.md`: any future `- [ ]` example line elsewhere becomes an item (and inflates `C`). Keep examples in prose/code fences without the `- [ ]` prefix. Trailing spaces, CRLF, or text after the final backtick are `CHECKLIST_GRAMMAR` (live file verified: 0 CR, 0 trailing-space lines).

# Snapshot evidence (2026-10-21 ~02:38, mid-integration working tree)
- `node scripts/surface-probe.mjs --checklists --json` -> totals `{items:14, ran:14, passed:12, failed:2, skipped:0, grammar:0}`, exit 1. All 14 parse; malformed 0; skipped 0.
- #8 FAIL: exit 1, substring miss; observed `PROXY error PIN_DRIFT pin.surface-probe: declared=148cbf85… computed=c298d168…` and `pin.proxy-check: declared=5852fefd… computed=3f1b7c7b…`; verdict names `src-rev=31c465f15669`.
- #14 FAIL: exit 64 `claims-check: unsupported argument: --fidelity`.
- #1 PASS at exit 1 with `CITE_CHECK:` hit (DRIFT accepted by design); the other eleven PASS.
- Surface without a pin arm: `SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1)` + `KNOWN sighting/VERB_DISPATCH VERB_UNDECLARED surface` — proves #3 can go green before the pin lands, so the C1 after-shot must read `src-rev=` in that line directly.

# Commands run (read-only; no writes outside this report)
`git status --short`, `git rev-parse HEAD`, `git show 0614092:scripts/surface-probe.mjs | grep -n ...`, a Bun regex replay of CHECKLIST_RE/parseChecklist over SKILL.md (13 parsed at 0614092; 14 parsed, 0 malformed on the live tree), `node scripts/surface-probe.mjs --checklists --json`, `node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json`, `node scripts/proxy-check.mjs`, `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`, `bash scripts/ufo-sighting surface --json` + python sha256 replay in `/fast/scratch/kumitate-r36/src` (declared order b36559d0… == manifest; sorted order f17d1547… == the false mismatch), and `fleet-dispatcher.mjs status` under a mkdtemp state dir (rc=0, tree file list unchanged).
