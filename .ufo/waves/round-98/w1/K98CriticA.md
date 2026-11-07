# K98CriticA — counter attack (w1)

Seat K98CriticA (critic). Target: the frozen counter `probe98-c1.mjs` (sha256 `7300fc57…`), freeze
`7038ee4c`. Full table, evidence and minimal-input differentials: `../K98CriticA/constructions.md`,
`../K98CriticA/battery-grid.txt`, `../K98CriticA/minimal-diff.txt`; per-run logs in
`../K98CriticA/logs/` (scratch copies removed at yield).

## Verdict

Nine wrong row recognisers were built as patched copies of `ctl-positive` (none is one of the 13
control shapes).
**Eight reach `C98_C1: HELD` while violating R98.** Reference runs on the same seed: `ctl-positive`
HELD; BASE (do-nothing) UNMET a=0 b=0 c=0 — the counter is sane, so these are counter gaps, not
fixture accidents.

| finding | construction | why the battery cannot see it | observed |
|---|---|---|---|
| pad **length** unbounded in R98 | `[ \t]{0,3}` | battery draws pad lengths 0,1,2 only (`MAX_PAD_LEN=2`) | HELD; minimal input `\|    S002 \|` is census `W03`, tool drops it |
| pad **class** is not all `Cf` | `[ \t\u00ad]`, `[ \t\u0008\u001f]`, `[ \t\u115f\u3164\uffa0]`, LRM/RLM strip | drawn set = `White_Space` ∪ {U+180E,U+200B,U+200C,U+200D,U+2060,U+FEFF}; U+00AD/200E/200F/0008/001F/115F/3164/FFA0 never drawn | 4× HELD; each declares a row the census reads as `E02` |
| id **length** | `S\d{3,7}` | ids drawn are 7-digit and 2-digit only | HELD; 8-digit id is census `W03`, tool refuses |
| file-start BOM | strip `^\ufeff` | no fixture starts with a BOM | HELD; BOM before `## Registry` → census reads no Registry, tool declares 2 |
| truth = census | header-keyed delegation to `sources-census.sh` | truth is derived from the census on the same file; the fixture header is a constant literal | HELD; the same construction with the census unavailable declares nothing |

Negative result (counter has teeth): skipping `rejected` rows in the outside branch is caught — FIX-B
puts every row outside (b=0) and base selftest arm (xxiii) draws one (e=0). UNMET, as it should be.

## Smallest safe correction (routed; the counter is frozen)

Add to `PADS`/the row generators: pad lengths 3/4/8 on both sides; the `Cf` remainder (U+00AD, U+200E,
U+200F, U+061C, U+FFF9) and U+0008/U+001F/U+115F/U+3164/U+FFA0; an 8-digit and a 12-digit id; one fixture
with `\ufeff` before the Registry heading. Add one arm that runs the tool with the census unavailable
(`--census /nonexistent` and no census on PATH) and draw the fixture header literal from the seed, so
census delegation and header keying stop being invisible. These are counter defects (F-K98-1..4) plus one
structural limit (F-K98-5, delegation: defect or tradeoff for the canonical judge — the claim's
observable survives, R98's local rule is not what is verified).

## Impact

Axis: operability only (the counter under-specifies R98 on pad length and class). No coverage row moves,
no harm surface touched, this seat wrote no lane file. The draft candidate at `K98ExecTool/round-gate.mjs`
already carries `[ \t]*`; no READY marker existed when this seat finished, so no candidate verdict is
claimed here.
