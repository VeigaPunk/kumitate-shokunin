K94ScribeLesson — round-94 lesson skeleton, declared-pin knowledge entry and red-round token audit. No lane writes outside the seat dir and this trailer.

Behavior: read plan.md, corpus/lessons/round-93.md, round-93-verifier-spotcheck.md, QUALITY Q80–Q87 + Q10/step 5, the SOURCES header and the pin rows, seat-route-retry-fields.md, the r93 filed report, and the candidate gate's declared-pin code (read-only; no READY at yield). Drafted the three documents, wrote and ran the Q88 gate-at-M check to failure (r93) and to pass (r92), and probed the seven red rounds' eight unresolved tokens four ways. No product code, judge, corpus, probe, controls, open/, plan.md, fleet repo or pin was written; no git/jj mutation; no gate/battery re-run beyond the Q88 check; the frozen counter was not executed by this seat.

Artifacts (seat dir `.ufo/waves/round-94/K94ScribeLesson/`; hashes in `receipts/draft-sha256.txt`):
- `knowledge-round-gate-declared-pins.md` — the class, the frozen rule verbatim, what the gate reads (lane → main → origin → declared; `citations.declared`; text `declared=n`), why a registry pin rather than an allow-list (CORPUS rule 1 quote; sources-check coverage; rejected-row filter), the seven red rounds one line each, limits (prefix not identity, registry read at `--repo`, complete-segment only incl. S203's `.patch` counter-example, malformed-row status shift, no network, no SOURCES → no escape), routed/integration. `source:` keeps the `S27x` placeholders for the two new rows; S267–S269 named for the concrete pin.
- `lesson-draft.md` — Mistakes row (M94-2 provisional: r93 filed with its own gate red and recorded an erratum instead) with the captured-by analysis (Q10 + QUALITY "How to apply" step 5 are prose only; Q10's gloss is parse-only; Q87 is append mechanics) and the Q88 draft in the Q80–Q87 shape.
- `red-rounds.md` — the eight tokens of rounds 12 46 53 57 61 62 63, provenance, object/near-miss/registry probes, why each stays red.
- `q88-gate-at-m.sh` — the check (archives `scripts/` at M, runs that gate for the round).

Q88 runs (receipts `q88-r93-fail.txt`, `q88-r92-pass.txt`; gate sha256 `09d4d792…` at both M):
  r93 M 2f8475cd → `COMMIT_CITED_UNRESOLVED cited=11 unresolved=2 [79fa222e 79fa222e8390aed3494f4bc6746814e6c74c21cf]`, `ROUND_GATE: DRIFT`, `Q88: FAIL rc=1`
  r92 M 7a8afb5f → `ROUND_GATE: CLEAN (round=92 … errors=0)`, `Q88: PASS rc=0`

Red-round readings (BASE gate, receipts `gate-red-round-<N>.txt`; each exit 1): 12 `23e476e21`; 46 `7af3d978`; 53 `b717dc035bf687a3039123f4c70527bd3774f510`; 57 `1cd6d667e20075fd2e77e6e655bc755f95e3d940`; 61 `ab902da2fa30d051455a5f3563627e2c23c3a74d 4247d2d`; 62 `4247d2da937842bd6846874d548b7125b356e14c`; 63 `9237a72`. All eight: 0 objects (incl. unreachable) in lane/fleet/origin, 0 commit prefixes, 0 `rev-parse --disambiguate` output, 0 near-miss commits sharing the first 6 hex, 0 SOURCES.md hits (`red-token-objects.txt`, `red-token-disambiguate.txt`, `red-token-nearmiss.txt`, `red-rounds-provenance.txt`). Six tokens are revisions of scratch/sandbox/fixture repos (four) or of one forged bundle (two: `4247d2d` short, `4247d2da…` full), one is an origin commit absent from the probeable origin, and one is a dead Q51 grounding hash.

Findings routed:
- The r93 erratum widens its own finding: it quotes the full pin, so the bytes as filed read `cited=11 unresolved=2` while the erratum reports `cited=10 unresolved=1 [79fa222e]` (`receipts/r93-erratum-vs-bytes.txt`). Q88 by construction cannot be cleared by an erratum.
- Registry inventory for the entry: 208 rows, 24 carry a complete 40-hex path segment, 10 distinct pins, S045 is the one `rejected` pin row; S203's `…/commit/10bce690….patch` is not a complete segment (`receipts/registry-inventory.txt`). An initial loose grep said 11 pins; the exact segment rule corrected it to 10.
- Q88 is Q10's command, not new doctrine: Q10 and step 5 already demand `ROUND_GATE: CLEAN`; neither has a check. The draft notes the L1 may fold it into Q10 instead of adding a criterion.
- No `K94ExecTool/READY` at yield, so the knowledge `verified-at` keeps the `<L1: integrated tool sha256, counter verdict line, selftest count at M>` placeholder; the entry describes the rule, and candidate bytes are cited only as the implementation under test.
- Integration notes in the entry: README map row in the same change; `pin.round-gate` re-pin; the two `S27x` rows and this entry must land together (else sources-check E11/ENTRY_SOURCE_UNKNOWN), and S267–S269 `used-by` gains this path if the header keeps them.

Out of scope (untouched): `scripts/`, `corpus/`, `.ufo/waves/round-94/{probe,controls,open,plan.md}`, the candidate, MANIFEST, host sysctls. Scratch `/fast/scratch/hyaku/kumitate-r94/K94ScribeLesson` removed before yield; no blockers.
