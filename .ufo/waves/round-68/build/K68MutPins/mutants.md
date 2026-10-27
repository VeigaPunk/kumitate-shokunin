# K68MutPins — capture-pin mutation battery

**Verdict:** eight requested M3 mutants were killed; the path-substitution mutant survived and reads `DEPREC68_HELD` (coverage blocker); duplicate-pin extra mutant is caught only by M9. The malformed-pins parse catch is silent in M3 and manifests as `pin-absent`, while M9 gives the parse-specific diagnostic.

## Fixture and detector

Scratch fixture cloned from lane HEAD `39f61816d4ee7a8d401df42c1818c91a9c537bce`; candidate landing built from the existing `K68ScribeEntry/fixture-recipe.py` plus its measured README row/map pin. Pristine candidate revision `f5a236476746f102e5160ed8eda8658ea76044d0`. Detector: `TMPDIR=$S node <lane>/.ufo/waves/round-68/probe/deprec68-probe.mjs <clone> <revision>` (live arm, no `--no-live`). The captured pristine run returned `DEPREC68_HELD held=10/10`, exit 0 (`baseline-live.txt`). All mutations were committed only inside the fixture clone. Each full output, exit, revision and mutated pins-file SHA-256 is in the correspondingly named receipt below.

| Mutant | Exact observed result / catching check | Verdict |
|---|---|---|
| sha256 first hex digit changed (S207) | `DEPREC68_UNMET held=6/10 ... M3 MISS cited=7 S207:sha-mismatch ... M9 MISS source-capture-exit=1`, exit 1 | Killed by M3 |
| bytes incremented by one (S207) | `... M3 MISS cited=7 S207:bytes-mismatch ... M9 MISS source-capture-exit=1`, exit 1 | Killed by M3 |
| traversal path `../../../../etc/hostname` | `... M3 MISS cited=7 S207:path-escape ...`, exit 1 | Killed by M3 |
| absolute path `/etc/hostname` | `... M3 MISS cited=7 S207:path-escape ...`, exit 1 | Killed by M3's earlier `p.startsWith(sep)` branch, not `path-outside` |
| S207 pin removed | `... M3 MISS cited=7 S207:pin-absent ...`, exit 1 | Killed by M3 |
| S207 capture replaced with directory containing a file | `... M3 MISS cited=7 S207:capture-not-regular-or-symlinked ...`, exit 1 | Killed by M3 |
| S207 capture replaced by symlink to `/etc/hostname` | `... M3 MISS cited=7 S207:capture-not-regular-or-symlinked ...`, exit 1 | Killed by M3 |
| pins JSON truncated to `{ malformed JSON` | `... M3 MISS cited=7 S207:pin-absent,S208:pin-absent,S209:pin-absent,S210:pin-absent,S211:pin-absent ... M9 MISS source-capture-exit=2`, exit 1 | Killed; M3's `catch { pins = null }` (probe lines 189–191) collapses parse failure to empty captures; M9 distinguishes with source-capture `registry not valid JSON`/exit 2 |
| extra path probe: `path:""` | `... M3 MISS cited=7 S207:path-outside ... M9 MISS source-capture-exit=2`, exit 1 | Killed; demonstrates M3 path-outside branch is reachable for empty path |
| **extra: S212 pin path changed to S209 capture path (byte-identical content)** | `DEPREC68_HELD held=10/10 checks=10 rev=76a0e704f6f526b54553e9fef86ec7be0da8502b rule=M68`, exit 0 | **SURVIVED — blocker: pin binding checks bytes and size but not source-specific provenance/path** |
| extra: duplicate S207 pin appended after valid pin, bogus SHA | `DEPREC68_UNMET held=9/10 ... M9 MISS source-capture-exit=2`, exit 1 | M3 survives duplicate (uses first `caps.find` result); M9's registry duplicate-id validation catches it |

M3 ordering/source: frozen probe lines 185–208; it normalizes and rejects traversal/absolute paths (197), checks containment (199), existence (200), regular/non-symlink (201), SHA (204), bytes (205). Its `find()` at 194 uses the first duplicate. `source-capture.mjs` parse catch is lines 97–100; duplicate-id rejection lines 123–125.

## Restoration and hashes

| State | Revision | `.ufo/pins/source-captures.json` SHA-256 | Detector |
|---|---|---|---|
| Pristine candidate | `f5a236476746f102e5160ed8eda8658ea76044d0` | `0f03941ee74bde3bad5ffbf1489f9618103871554d4733e77cc869b9686478a5` | HELD 10/10, exit 0 |
| Restored candidate | `f5a236476746f102e5160ed8eda8658ea76044d0` | same `0f03941ee74bde3bad5ffbf1489f9618103871554d4733e77cc869b9686478a5` | HELD 10/10, exit 0 |

Restoration receipt: `restored-live.txt` prints `GIT_DIFF_EXIT=0`; the clone was detached back at the pristine candidate revision. Receipt files `baseline-live.txt`, `restored-live.txt`, and each mutant's `<name>.txt` preserve actual detector output, exit code, revision, and pin hash. Scratch was removed after copying receipts into this build directory.
