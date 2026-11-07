# K99CriticA — round 99 w1 critic: C1 counter constructions

Seat target: break the frozen counter (`probe/probe99-c1.mjs`, sha256
`de7b62323b4407f319490dacddf6529976fecf937645be0389e48e286f7b0724`) with wrong trim/count implementations that read
`C99_C1: HELD`. Read-only on the lane; no lane file was written. Deliverable: `K99CriticA/constructions.md` (13
constructions, 11 HELD), `K99CriticA/minfixtures/`, `K99CriticA/minimal-diff/`, `K99CriticA/raw/`,
`K99CriticA/gen/`. READY was present and used for the selftest-kill column: sha256
`50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31`.

## Counterexample (strongest): the verdict depends on the seed, not on the bytes

`k09-bom-sniff` (blank trim only when the file does not start with U+FEFF; JS `trim()` otherwise) is one 50,218-byte
tool, sha256 `c6c2c7a11abf4bd132a393800da2c9b735eb6f83f3ab2a0be3cb0bfa86de6a36`. The frozen counter reads:

- `UNMET` on seeds `0000000000000000`, `0000000000000001`, `0000000000000002` (BOM drawn);
- `HELD` on seeds `0000000000000003`, `0000000000000004` (no BOM) — `raw/k09-seed{0,1,2,3,4}.txt`.

The seed is drawn fresh each run and the verdict is `HELD` exactly when the fixture is BOM-less. The shipped selftest
does not kill it (90/90 pass, `raw/shipselftest/k09-bom-sniff.txt`) because its fixtures never start with a BOM. So a
candidate that carries the reference trim plus a BOM conditional would pass its own suite and be admitted on ~half of
fresh draws. That is a soundness failure of the frozen predicate, not a property of the submitted bytes.

## Evidence (all receipts under `K99CriticA/`)

- 11 distinct wrong implementations read `HELD` (verdict lines with seeds/shas in `raw/counter-summary.txt`):
  blank+NUL (k01), blank+U+0080 (k02), `{1,17}` cap (k03), JS trim on source/scope/anchor/teaches (k04),
  title sniff (k05), size sniff (k06), order sniff (k07), empty-id `counts.rows` (k08), BOM sniff (k09, no-BOM seeds),
  census-delegated `counts.rows` (k10), `SHOKUNIN_ROOT` sniff (k12). Two controls stay `UNMET` (padcap16, blank+NEL), so
  the grid is not toothless — it just ends at the drawn shapes.
- Census differentials (minimal fixture + command + output) are in `minimal-diff/*.txt`: census `E02` vs tool CLEAN
  (k01,k02,k05,k06,k07,k09,k12), census `ok` vs tool `ID_FORM` (k03), census `ok` vs tool `ROW_FIELD_EMPTY` (k04b),
  census rows−E02 = 0 vs tool 1 (k08). k10 has **no possible** differential: its count *is* census
  `rows` − `E02` (`minimal-diff/k10-census-counts.txt`), so arm (e) is circular against a delegate.
- Shipped selftest teeth (same shape applied to the READY bytes, `raw/shipselftest/summary.txt`): k05/k06/k07/k12 are
  killed (14 `r99trim-*` arms each), k03a/k11 killed (1 arm each); **k01, k02, k03, k04, k08, k09, k10 survive 90/90**.

## Impacted axes

- **Operability / claim C1 (the only claimed axis):** the after-state as *certified by the counter* is not established.
  The shipped bytes do implement R99 — line 137 `function trim(value) { return value.replace(/^[ \t]+|[ \t]+$/g, ''); }`,
  one helper used by id, the ten other cells, tier/status counts and used-by parts — and read `HELD` legitimately. The
  counter cannot certify that: it certifies only "no disagreement on one drawn draw of one fixture family."
- **Coverage sub-axes (10):** unharmed by this review (read-only; no lane bytes changed; no harm battery run by this seat).
- **K2 selftest axis:** the shipped suite has real teeth for six of the sniff/cap shapes but seven wrong implementations
  pass it; its pad list stops at 10 classes and its blank-acceptance stops at effective run 17.
- **Counter authority:** arm (e) is satisfiable by delegation; arm (h) is the candidate's own suite (circular); pads only
  target six cells; the battery excludes empty-id rows (disclosed limit 3) and cannot see provenance sniffing.

## Smallest safe correction

For the validator/next round (the frozen counter must not be edited; K4 stays intact):

1. Draw a **second, complementary fixture family per run** and require every arm on both: one counter-shaped (shuffled,
   ~400 rows) and one real-lane-shaped (sorted, ≤50 rows, BOM drawn independently). This kills title/size/order/BOM and
   env-keyed trims unless the tool is correct on both shapes; hash-keyed forgery remains a diff/selftest review target.
2. Run the candidate through `cap-run` with only the fixture and `/usr` bound (the fleet path hidden), and compute (e) from
   the **generator's drawn valid-id count**, not `census rows − E02`. That removes the k10 delegation and makes (e) non-circular.
3. Extend the grid to the omitted classes (NUL, U+0080–U+009F except NEL, DEL, U+2061–U+2064, U+061C) and pad lengths
   1–64 with length-2 units, and pad **all 11 cells**, comparing `ROW_FIELD_EMPTY` and the full finding set; draw empty-id
   rows. This kills k01–k04, k08 and the cap hole.
4. Add the same complements to the shipped selftest; in particular a pad run ≥18, NUL/U+0080, a source/scope/anchor/teaches
   pad arm with `ROW_FIELD_EMPTY`, an empty-id `counts.rows` arm, and a BOM'd fixture. Keep (h) from being the only teeth.

Residual tradeoff the judge must accept or reject: no finite fixture battery can certify a program that may read its own
input. The counter is a refutation budget, not a proof; if the round's admission rule treats `C99_C1: HELD` as a semantic
guarantee, these receipts show it is not one. If it is treated as "the submitted bytes were not refuted by the frozen
budget", the shipped candidate survives this review unchanged.
