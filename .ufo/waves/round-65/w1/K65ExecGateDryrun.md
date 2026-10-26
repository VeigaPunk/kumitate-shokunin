VERDICT: A C2 landing on the freeze commit `2ca91a0` reaches 18/20 registry gates clean with seven mechanical edits (entry, 3 rows, captures+pin, README row, readme-map pin, PROVINCE line, stanza refresh) plus a two-file `pin.harm-matrix` registration; only `kimi-census`/`omp-census` stay red, and they are host state, not the revision.

## Evidence

Dry-run clone (throwaway, all git writes named `-C <clone>`):
`git clone --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /tmp/kumitate-r65/K65ExecGateDryrun/d && git -C d checkout -q 2ca91a0c81542cad5f731049aa55dd2f99ade98d`
Placeholder entry = the staged `merge/kumitate/knowledge/corpus/knowledge/omp-host-harness-protocol-skew-2026-10-27.md` re-headed (`source: S201, S202, S203`, `verified-at: 2026-10-25`, `recheck: 30d`); rows S201-S203 = types.ts/docs/mcp-config.md at `45c35e40`, releases/tag/v18.12.6; placeholder capture bytes pinned with sha256+size.

Registry (`scripts/harm-matrix-gates.json`, 20 gates, run by a loop that records exit + last line). Freeze tip before any landing (`build/.../gates-freeze.txt`):
```
readme-map exit=0 README_MAP: CLEAN files=157 rows=157 covered=157
proxy-check exit=1 PROXY: DRIFT (A_DRIFT term=A declared=351 computed=357 delta=+6; C2_DRIFT term=C2 declared=156 computed=157 delta=+1; C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 delta=+1; PIN_UNPINNED term=scripts/harm-matrix.mjs; src-rev=31c465f15669)
kimi-census exit=1 KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; MEMBER_MISSING cache/; MEMBER_MISSING search-index/; MEMBER_MISSING updates/)
omp-census exit=1 OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=42 findings=10)
harm-matrix-selftest exit=0 HARM_MATRIX_SELFTEST: PASS (26/26)
```
After the landing only (entry+rows+captures+README+pin+PROVINCE), `gates-landed-unrepaired.txt`: identical table plus
`proxy-check exit=1 … C2_DRIFT … delta=+2; C2_TOTAL_DRIFT … delta=+2` and `readme-map exit=0 README_MAP: CLEAN files=158 rows=158 covered=158`;
all other gates unchanged.
After the five required repairs (`gates-landed-repaired.txt`):
```
readme-map exit=0 README_MAP: CLEAN files=158 rows=158 covered=158
proxy-check exit=0 PROXY: MATCH (A=357 C=33 operability=9; C1=19/19 C2=158/158 coverage=10; S=88/88 …; R=92/92 …; K=49/49 …; pins=6 match; src-rev=31c465f15669)
claims-check exit=0 CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)
sources-check exit=0 SOURCES_CHECK: CLEAN (rows=142 tiers=A:119,B:15,C:8 status=queued:13,mined:110,rejected:19 entries_with_source=22 legacy=38)
source-capture exit=0 SOURCE_CAPTURE: CLEAN captures=35 exemptions=107
source-dupes exit=0 SOURCE_DUPES: CLEAN groups=6 known=6
cite-sources-selftest exit=0 VERDICT: PASS ; round-gate-selftest exit=0 VERDICT: PASS ; sources-check-selftest exit=0 VERDICT: PASS
counter-pins exit=0 COUNTER_PINS: CLEAN pins=30 ; report-receipt-diff-selftest PASS (125/125) ; plan-before-ready-selftest PASS (38/38) ; wave-census-selftest PASS ; harm-matrix-selftest PASS (26/26)
```
Extra gates: `CITE_SOURCES: CLEAN cited=196`; `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <abs>/corpus/SOURCES.md` → six pre-existing `W04` + `file ok …`, EXIT=0. `node scripts/cite-check.mjs` (5 s): freeze `CITE_CHECK: DRIFT (files=161 tokens=12035 errors=1545 warnings=771)`; landed with the release hash written as `commit 45c35e40…` `errors=1549` (+4: SOURCES:155/156/157 + entry:1, all `REV_UNKNOWN`); after moving the hash into the URLs only `files=162 tokens=12039 errors=1545 warnings=771` — zero delta.

Frozen counter on the dry-run tip (commit `6746337` in the clone, `git archive`):
`OMP65_UNMET held=4/8 checks=8 rev=67463378ea0a348224962ee64c378cb056c0d04d rule=O65 | O4 MISS bullets=0;S201:no-bullet;S202:no-bullet;S203:no-bullet;no-2025-11-25-quote | O5 MISS no-bullets | O6 MISS stated-keys=0;… | O8 MISS no-amendment-heading,…`

## Findings

**K65ExecGateDryrun-1 — HIGH — `pin.harm-matrix` alone fail-closes proxy-check.** Placing the round-65 C1 pin in the `kumitate-gate-pins-v1` block without registering the key in `scripts/proxy-check.mjs`'s `GATE_PINS` map turns a warn into exit 2:
`PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 335: pin.harm-matrix is not a kumitate-gate-pins-v1 key` (`EXIT=2`). The registration needs three coupled edits: block key → `GATE_PINS` entry → refreshed `pin.proxy-check` (the map edit changes proxy-check's own sha256; `counter-pins.json` does not pin proxy-check, so it is unaffected).
Repro: clone at `2ca91a0`, add `pin.harm-matrix=6bde065f…` to the block, `node scripts/proxy-check.mjs --strict` → exit 2; add `'pin.harm-matrix': 'scripts/harm-matrix.mjs',` to `GATE_PINS`, refresh `pin.proxy-check` → `PROXY: MATCH … coverage=10`.

**K65ExecGateDryrun-2 — HIGH — the landing adds C2/C2_total +1 each onto an already stale stanza; the close cannot be green without a refresh.** Freeze declares `C2=156 C2_total=156`, live is 157/157; landing makes 158/158; `A` is declared 351, computed 357 at freeze. The +6 are exactly `scripts/harm-matrix.mjs`, `scripts/omp-binary-probe.sh`, `.ufo/waves/round-65/probe/{gen-harm-cases.mjs,harm65-probe.mjs,omp65-probe.mjs,omp-donothing-control.sh}` (`comm` of the two `git ls-tree` lists, 351 → 357). `A` counts every `*.mjs|js|sh|py` under the lane including `.ufo/waves/**`, so any seat's `.sh/.mjs` helper under `.ufo/waves/round-65/build/<Seat>/` adds +1 until the close re-takes it; this dry-run's artifacts (`.md`, `.patch`, `.ts/.html` captures) add none.
Repro: `git ls-tree -r --name-only 2ca91a0 | grep -cE '\.(mjs|js|sh|py)$'` → 357; `node scripts/proxy-check.mjs --strict` → the `A_DRIFT` line above.

**K65ExecGateDryrun-3 — MEDIUM — cite-check reads the release hash in a SOURCES cell as a broken pin.** The grammar `<rev|revision|rev-pinned|HEAD|commit|sha256|pinned> + hex` applies to `corpus/SOURCES.md` rows and the entry header, so `commit 45c35e40…` costs 4 `REV_UNKNOWN` errors (oh-my-pi is not a searched tree); the hash kept inside a URL is a URI and costs nothing. Baseline is already `DRIFT` (1545 errors) — the check is outside the registry by the plan's stated limit, so the rule is "no new findings", not "green".
Repro: `node scripts/cite-check.mjs` on the landed clone with/without the phrase (outputs kept as `cite-check-landed-with-commit-markers.txt` / `cite-check-landed.txt`).

**K65ExecGateDryrun-4 — MEDIUM — the assigned base `47fe2383` is not landable; `2ca91a0` is.** At `47fe` (`gates-base47fe.txt`): `README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md`, `PROXY: DRIFT (C2_TOTAL_DRIFT … +1; AXES_DRIFT coverage: ## Axes row=10 derived=9)`, `harm-matrix-selftest exit=1` (`Error: Cannot find module '<clone>/scripts/harm-matrix.mjs'`; `git ls-tree 47fe -- scripts/harm-matrix.mjs scripts/harm-matrix-gates.json scripts/omp-binary-probe.sh` prints nothing), `COUNTER_PINS: CLEAN pins=25` (freeze adds 5). `git apply` of the landing patch at `47fe` fails: `error: patch failed: corpus/README.md:190` (the D2 row landed at the freeze).
Repro: `git -C <clone47> apply landing.patch` → the error above.

**K65ExecGateDryrun-5 — INFO — the machinery is provenance, not content.** The frozen O65 counter on the placeholder landing holds O1 (trio + 3 ids), O2 (11-cell mined rows new at base), O3 (pinned captures matching sha/size) and O7 (census 0, PROVINCE named, readme-map CLEAN, sources-check CLEAN), and misses only O4/O5/O6/O8. So the checklist closes the gate work; quotes, live fetch, 15 host-measurement bullets and the append-only amendment remain the scribes' deliverables.
Repro: `node .ufo/waves/round-65/probe/omp65-probe.mjs <clone> 6746337` → `held=4/8`.

**K65ExecGateDryrun-6 — INFO — two reds are host state, identical at `47fe`, `2ca91a0` and after the landing:** `KIMI_CENSUS: DRIFT (MEMBER_MISSING logs/kimi-code.log; … cache/; … search-index/; … updates/)` and `OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=42 findings=10)`. Never attribute either to a revision or to this landing.

## Artifacts

- `.ufo/waves/round-65/build/K65ExecGateDryrun/landing-checklist.md` — ordered edits 1-9, each with its proving command and expected verdict line.
- `…/build/K65ExecGateDryrun/landing.patch` — edits 1-6 as a git diff against `2ca91a0` (137 lines). Re-applied on a pristine clone at `2ca91a0` (clone `e`): `README_MAP: CLEAN files=158 rows=158 covered=158`, `SOURCES_CHECK: CLEAN (rows=142 …)`, `SOURCE_CAPTURE: CLEAN captures=35`.
- `…/build/K65ExecGateDryrun/gate-repairs.patch` — stanza refresh + gate-pin registration (A=357, C2/C2_total=158, `pin.harm-matrix`, `GATE_PINS`, refreshed `pin.proxy-check`); applied on top of the above → `PROXY: MATCH (… C2=158/158 … pins=6 match)`.
- `…/build/K65ExecGateDryrun/gates-{base47fe,freeze,landed-unrepaired,landed-repaired}.txt` — four full-registry tables (20 gates each).
- `…/build/K65ExecGateDryrun/cite-check{,-freeze,-landed-with-commit-markers}.txt` — the pin-grammar before/after.
- Scratch: `/tmp/kumitate-r65/K65ExecGateDryrun/{c,d,e,f}` (c/f at `47fe`, d at `2ca91a0` + 2 dry-run commits, e at `2ca91a0` clean).

## Limits

- Nothing was landed in the lane; the lane's own tree, index, jj state, frozen round-65 files and all pins are untouched (writes only under this seat's build dir, report path and `/tmp`).
- The placeholder rows/captures are stand-ins: their bytes are not the fetched pages, so O3 passes only as a pin mechanism, and O5 was never exercised (it short-circuits at `no-bullets`; no network fetch happened in the counter run).
- Not run: `cite-check --strict/--integrations`, `gate-mutants`, `cap-run`, `surface-probe --checklists` (outside the registry by the plan), `harm-matrix` base/tip runs (C1's seat), `omp-binary-probe.sh` directly.
- `A` is a working-tree count (untracked `.mjs/.sh` files count too); the value 357 is the committed tree only. A round that also lands a `corpus/lessons/*.md` file must add its README row and pin as well, or `readme-map`/`C2` drift again — argued from the gate code, not executed.
- `git apply` of `landing.patch` was proven only against `2ca91a0` (it fails at `47fe` by design, finding 4).
