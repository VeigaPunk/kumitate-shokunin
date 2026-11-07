# K98CriticB — C1 framing and harm (round 98)

Role: critic, framing + harm surface. Read-only on the lane; receipts under
`.ufo/waves/round-98/K98CriticB/receipts/`. Candidate `READY` was ABSENT at measurement time
(2026-11-07T04:04Z); I measured the frozen reference `ctl-positive` (R98 rule, sha `d5737901…`,
regenerated from base bytes by `probe/make-controls98.py` — reproduces `controls/controls-sha256.txt`)
and the interim candidate bytes `e7c1455e…` (sha moved `70b3f6d5…` → `e7c1455e…` during the session).
Both read identically on every surface below.

## 0. Framing verdict

**WEAK — a real grammar divergence, but with zero live footprint; not busywork, not proven harmful.**
The claim's own sentence ("round-gate declares pins from rows the census refuses and lists
outside/malformed rows the census never reads as rows") is true of the frozen battery, and true of no
real registry row, no historical registry row, and no filed report.

## 1. Real move vs busywork (evidence)

- Real registries: **0 / 5,442** id-cell rows across all 21 `*/corpus/SOURCES.md` carry a non-blank
  pad; **0** id cells contain any non-ASCII character; all 21 files are LF, no CRLF
  (`receipts/registry-pad-scan.txt`). Every row pads with ASCII space (or TAB inside the `[ \t]` class).
- Kumitate history: `git -C kumitate-shokunin log --all -S$'\u00a0' -- corpus/SOURCES.md` → **0 commits**
  (`receipts/registry-pad-scan.txt`).
- No formatter can emit a non-blank pad: no `.prettierrc*`, `.markdownlint*`, `dprint.json`,
  `.editorconfig`, `.mdformat.toml` anywhere in the fleet (maxdepth 3, node_modules excluded; command
  and count in the trailer). No lane row-writer emits non-ASCII pads (rows in `scripts/` fixtures and
  the r98 generator use `| S123 |`).
- The declared step is live in real history but on an ASCII-padded row: round 93 declares
  `79fa222e` and the full 40-hex pin from S266–S269/S272 (`receipts/harm/r93-base.json`). The other 7
  reports with citation lists are `unresolved` at BASE already (r12, r46, r53, r57, r61, r62, r63 —
  `receipts/sweep-summary.txt`).
- 81-report sweep at BASE: 28 non-clean (pre-existing SCORECARD/SHONEN/THIN and the 7 unresolved
  above), 8 with any citation list, 1 declaring. BASE and candidate are byte-identical on every
  sampled surface (section 4).

Real divergence is reproducible only synthetically (section 2): BASE declares a pin from a row the
fleet census flags E02. So the change removes a genuine (if latent) accept path; it changes no real
reading.

## 2. When SOURCES is read + the NBSP fixture (the asked-for measurement)

Code: `declaredPins()` is reached only via `declaredPinsNow()` (`scripts/round-gate.mjs:490-492`),
invoked at **:515** — after `probe('lane')` (:506), `probe('main')` (:511) and `probe('origin')` (:513)
all fail. A report whose tokens all resolve in those three trees never opens `corpus/SOURCES.md`.

Fixture (scratch lane copy, git fixture; bytes kept as receipts): one 13-field `queued` row inside
`## Registry` with id cell `U+00A0 S501 U+00A0` and source URL
`https://example.com/commit/0123456789abcdef0123456789abcdef01234567`; one 13-field NBSP-padded row
under `## Leads (unopened)` (id S900); a 1,987-byte report citing the 40-hex pin only.

| reader | reading on the NBSP fixture |
|---|---|
| round-gate BASE `edaa115f` | **CLEAN exit 0**, `declared=[0123…4567]`, `outsideRows=[S900]` (`receipts/fx1-base.out`) |
| ctl-positive `d5737901` (R98 ref) | **DRIFT exit 1**, `COMMIT_CITED_UNRESOLVED`, `declared=[]`, `outsideRows=[]` (`receipts/fx1-ctlpos.out`) |
| interim candidate `e7c1455e` | same as ctl-positive (`receipts/fx1-cand.out`) |
| `sources-census.sh validate --file` | **exit 1**, `E02  S501` (NBSP survives `[ \t]` trim); outside row: no E12 (`receipts/fx1-census.out`) |
| `scripts/sources-check.mjs --self` | **CLEAN exit 0**, `rows=1`, id S501 accepted (`receipts/fx1-sourcescheck.txt`) |

So: **BASE reads green where the census refuses, and the candidate refuses where the lane's own
validator stays green.** Both readings are in the lane, before and after R98; R98 does not produce
unanimity.

## 3. Direction: refusing is defensible, but "the census refuses" is one authority, not the authority

For R98:
- POSIX `blank` = space+TAB only (plan's ch. 7 citation); the id-cell pad is presentation, the id is
  `S`+digits (`CORPUS.md:89`), so NBSP is not a pad but part of the id → E02.
- No legitimate need found: no editor/formatter in use emits NBSP in cells; a paste artifact is not a
  contract; a lane can rewrite the pad in one edit.

Strongest local counterexample (impacted axis: operability, the claim's own):
- `scripts/sources-check.mjs` — the lane's registry validator — reads the id cell with JS
  `String.trim()` (`:134`, applied at `:232`, id test `:246`), which strips NBSP, VT, FF, CR, every
  `Zs` and U+FEFF. Measured: NBSP row → **CLEAN rows=1**; a VT-padded row → **CLEAN rows=1**
  (`receipts/vt-sourcescheck.txt`).
- `CORPUS.md:135` publishes the census as `^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|`; measured it
  matches a VT/FF/CR-padded id (grep count 1, `receipts/vt-corpus-md-census.txt`) while
  `sources-census.sh` prints E02 for the same row (`receipts/vt-census.out`). So the fleet already
  has three id-cell classes: BASE `\s`, sources-check JS-trim, census `[ \t]`.
- Consequence: before R98 round-gate (`\s`) and sources-check (JS trim) both accepted an inside
  non-blank pad; after R98 round-gate refuses while sources-check still accepts. A lane carrying such
  a row would read `SOURCES_CHECK: CLEAN` + `ROUND_GATE: DRIFT`. That is a **new one-way split**, not
  a unification.

Verdict on direction: keep R98 — the stricter side is the safer side (a row the census flags E02 must
not mint a citation), and the split is unobservable until such a row exists; but the claim's
disclosed-limits paragraph (`plan.md:98-101`) names only `counts.rows` vs census `rows` (routed item 3),
not this verdict split. **Smallest safe correction:** add one disclosed-limit sentence naming
sources-check's JS-trim acceptance as the surviving divergent authority (and that such a row reads
sources-check CLEAN + round-gate DRIFT), or fold the id-cell normalisation at `sources-check.mjs:232`
into the connector's "one row grammar" deliverable. No change to the frozen rule.

## 4. Harm diff — no real surface moves

All runs: `--repo kumitate-shokunin --lane kumitate --reports-dir <fleet>/.ufo/reports
--main-repo <fleet> --json`; compared after dropping `durationMs`. BASE = `edaa115f`; ctl-positive =
`d5737901`; candidate = `e7c1455e`. JSON bytes equal BASE == ctl-positive == candidate on every row.

| surface | BASE | ctl-positive | candidate | equal | declared / unresolved at BASE |
|---|---|---|---|---|---|
| `--tracked` | CLEAN checked=80 excluded=97 | CLEAN 80 | CLEAN 80 | yes | n/a |
| `--round 97` | CLEAN | CLEAN | CLEAN | yes | `[]` / `[]` |
| `--round 96` | CLEAN | CLEAN | CLEAN | yes | `[]` / `[]` |
| `--round 95` | CLEAN | CLEAN | CLEAN | yes | `[]` / `[]` |
| `--round 93` | CLEAN | CLEAN | CLEAN | yes | declared 2 tokens (S266–S269 pin) |
| `--round 53` | DRIFT | DRIFT | DRIFT | yes | `[]` / `[b717dc03…]` (pre-existing) |
| 81 filed reports (BASE sweep; candidate sampled + counter arm d) | 28 non-clean, 8 with citation lists | — | equal on samples | counter d=81/81 | 7 unresolved, 1 declaring (r93) |

Receipts: `receipts/harm/*.json`, `receipts/sweep/*.json`, `receipts/sweep-summary.txt`.

Consumers of round-gate output (fleet grep, excluding `.jj/.ufo/.git`):
- Nothing parses `citations.*` / `outsideRows` / `malformedRows`. `kumitate-shokunin/README.md`
  mentions neither.
- `scripts/harm-matrix-gates.json:18` runs `round-gate --selftest`; the candidate must keep the
  `ROUND_GATE_SELFTEST: n/n pass` line — interim `selftest.txt` reads 96/96 PASS (the counter's e arm
  is 1/1 on all 15 controls).
- `scripts/proxy-check.mjs:542,2620` pins the round-gate sha (`pin.round-gate` in SCORECARD). Any
  final byte change forces the pin re-declaration at integration (K3 already scopes harm "after
  bookkeeping re-declaration"); the moving candidate sha (`70b3f6d5…` → `e7c1455e…`) means the pin
  must name the final bytes.
- `kagi-shokunin`/`kengaku-shokunin` corpus mentions are report-only adjacency, not consumers.

Change list: no real output change; the only behavioural delta is the fx1 class (non-blank-padded
rows); plus the SCORECARD pin and the selftest tally.

## 5. Limits stated

- `READY` absent; candidate bytes are interim. Because the frozen reference and the interim candidate
  read identically on fx1 and all real surfaces, and R98 freezes the constant, the findings do not
  depend on the final bytes — but the integration must re-run this table at the final sha.
- My 81-report sweep used BASE (candidate cannot gain declarations from a narrower class; r93, the
  only declaring report, is unchanged). The counter's d=81/81 covers full equality.
- The VT fixture and NBSP fixture are synthetic; no claim is made that any lane has such a row.
- Scratch removed; every command and output is receipted under `.ufo/waves/round-98/K98CriticB/receipts/`.
