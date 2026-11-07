# K96CriticA — C1 counter attack (round 96, wave w1)

Scope: attack the frozen C1 counter (`probe/probe96-c1.mjs --freeze 617e80cd8b01efb5748d729dbdcac95734bc461d`)
with wrong-but-plausible gates beyond the 20 controls. 14 constructions built from the L1 reference
`ctl-positive` (sha256 `8793e0d9…`) by `build-constructions.py` (one asserted patch each); 8 reach
`C96_C1: HELD`. Full table, clause quotes, differential and census receipts: `K96CriticA/constructions.md`.

## Counterexamples reaching HELD (each violates R96, each accepted by the counter)

| construction | R96 clause violated | differential vs census (`sources-census.sh validate --file`) |
|---|---|---|
| `ws-class` | `^ {0,3}##[ \t]` — separator is space/tab; JS `\s` takes `\v`/`\f`/U+00A0 | `##\vRegistry`: census E12 `[S900 S001]`, ref outside `[S900,S001]`; con declares `casB` |
| `indent-class` | indent is ` {0,3}` spaces only; `[ \t]{0,3}` takes a tab-indented heading | `\t## Leads`: census E12 `[]`, ref declares `casC`; con outside `[S002]` |
| `trail-tab` | text stripped of trailing SPACES **and TABS** | `## Registry\t`: census E12 `[]`, ref declares `casD`; con outside `[S003]` |
| `lastindex` | text after the **first** `##` | `## Foo ## Registry`: census E12 `[S004]`, ref outside `[S004]`; con declares `casE` |
| `outside-unindented` | `SOURCES_ROW_RE` allows ≤3 leading spaces | `   \| S005 \|`: census E12 `[S005]`, ref outside `[S005]`; con `[]` |
| `fence-rows` | gate mirrors the census, not CommonMark (fenced row is a row) | fenced `S006` row in registry: census E12 `[]`, ref declares `casG`; con skips |
| `no-registry-fastpath` | state starts `false`; rows with no `## Registry` are still outside | `S007`,`S008`, no heading: census E12 both, ref same; con `[]` |
| `hardcode-fixtures` | whole rule (fixture-content recognition) | FIX-A title + unrelated `S777`: census E12 `[]`, ref declares `casA`; con returns canned `[S901…S028]`, malformed `[S002]` |

Each receipt: `K96CriticA/receipts/<name>.txt` → `C96_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=79/79 f=1/1`.
Discrimination controls in the same run: `startswith-registry`, `includes-registry`, `cap-10`,
`field-2`, `blank-switch`, `text-always` are UNMET (`text-always` only by arm f, 86/89 selftest).

## Impacted axes

Operability (C1, terminal `f_O`) — the counter's discrimination on R96 near-misses. Coverage
sub-axes unaffected. These do not change the frozen verdict: they are constructions, not the
candidate; K1 still reads the candidate's bytes.

## Smallest safe correction (routed to r97; frozen bytes untouched)

Add FIX-A clauses pinned by one-line controls: `##\vRegistry`, `\t## Leads`, `## Registry\t`,
`## Foo ## Registry`, a 3-space-indented outside row, a fenced row inside the registry; and a
fourth fixture that is a `SOURCES.md` with rows and **no** `## Registry` heading (arm (d) today
tests an absent `SOURCES.md`, not an absent section). Optional: nonce the fixture row ids/titles
to kill F8 (`hardcode-fixtures`); the plan already discloses fixed seed tokens, not fixture ids.
Non-finding: the n=0 half of "only when n > 0" is guarded only by the shipped selftest's exact
text lines; arm (c) runs text mode on FIX-A (n=11) only; K2's 18 shapes do not include it.

## Do-nothing control re-run

`K96CriticA/receipts/do-nothing.txt`: `UNMET a=0 b=0 c=0 d=0 e=0/79 f=1`, identical to
`controls/ctl-nothing.txt` except the `freeze=` line (right reason: 8 outside tokens declared,
`outsideRows` null, outside `S022` counted malformed).

Evidence: `K96CriticA/{constructions.md,build-constructions.py,differential.mjs,constructions/,receipts/}`.
