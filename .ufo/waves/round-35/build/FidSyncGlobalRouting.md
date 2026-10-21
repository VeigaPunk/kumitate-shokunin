FIDELITY scripts/sync-global-routing.mjs anchors=21 ok=1 moved=7 changed=1 gone=12

Method. All member citations live in `corpus/knowledge/remaining-scripts-census.md`: the heading (note:668) and its single `## ` section (note:670); no other section carries a `sync-global-routing.mjs:N` or continuation anchor. Every citation was read at 964f443e and at 31c465f1 in the pinned clone (`git -C /fast/scratch/kumitate-r35/src show <rev>:scripts/sync-global-routing.mjs`) and located with `git diff 964f443e 31c465f1 -- scripts/sync-global-routing.mjs`. Counting rule: 16 `path:line`/`:N` anchors + 1 heading + 4 unanchored symbol/behavior claims in the section = 21 judged citations.

Headline. Upstream rewrote the member from a CLI tool (389 lines at 964f443e) into a library-only module (255 lines at 31c465f1): `main()`, `isMain`, `writeAtomicFile`, `--check`, usage arms and exit codes were deleted wholesale (new header: "This module deliberately has no CLI", 31c465f1:14-16; commit 3ddd6b3 "route-trial: one route grammar, effort-less hops, mirror-drift preflight"). Route parsing moved to `scripts/omp-route-grammar.mjs`. None of the 16 line anchors still lands on its symbol; the section prose describes the deleted CLI almost line for line.

| note:line | cited anchor | symbol/claim | status | correct anchor at 31c465f1 | proposed replacement wording |
|---|---|---|---|---|---|
| 668 | `## \`scripts/sync-global-routing.mjs\`` | member heading | ok | scripts/sync-global-routing.mjs (exists) | — |
| 670 | `scripts/sync-global-routing.mjs:341` | `main()` entry behind `isMain` guard | gone | — | `main()`/`isMain` CLI entry removed at 31c465f1; module is library-only. Drop the sentence. |
| 670 | `:353` | typed `usage` refusal for unknown argv | gone | — | argv `usage` refusal removed at 31c465f1 with the CLI; drop (base sat at :320-322, not :353). |
| 670 | `:345` | usage text | gone | — | usage text removed at 31c465f1 with the CLI; drop (base text at :312-317, not :345). |
| 670 | `:45` | `MIRROR_PATH` = `crates/ufo-core-runtime/bundled/omp-seat-routing.json` | moved | scripts/sync-global-routing.mjs:41 | `MIRROR_PATH` = `crates/ufo-core-runtime/bundled/omp-seat-routing.json` — re-anchored at 31c465f1 to `:41`; rendered for the gate, never written here. |
| 670 | `:46` | `MIRROR_SCHEMA` `ufo-seat-routing-v1` | moved | scripts/sync-global-routing.mjs:42 | `MIRROR_SCHEMA` `ufo-seat-routing-v1` — re-anchored at 31c465f1 to `:42`. |
| 670 | `:337` | `renderSeatRoutingMirror` | moved | scripts/sync-global-routing.mjs:253 | `renderSeatRoutingMirror` — re-anchored at 31c465f1 to `:253`; renders bytes, publishes nothing. |
| 670 | `:267` | `buildSeatRoutingMirror` | moved | scripts/sync-global-routing.mjs:211 | `buildSeatRoutingMirror` — re-anchored at 31c465f1 to `:211`; accepts optional fd-bound `snapshot` (`:209`). |
| 670 | `writeAtomicFile` (unanchored) | mirror "published through writeAtomicFile" | gone | — | `writeAtomicFile` removed at 31c465f1; the gate writes the mirror (`writeFileAtomic`, `scripts/sync-ufo-contracts.mjs:635`). Drop the phrase. |
| 670 | `:64` | `CORE_SEATS` | moved | scripts/sync-global-routing.mjs:53 | `CORE_SEATS` — re-anchored at 31c465f1 to `:53`; module-internal const, not exported (pre-existing wording error). |
| 670 | `:77` | `MIRROR_SEATS` | moved | scripts/sync-global-routing.mjs:66 | `MIRROR_SEATS` — re-anchored at 31c465f1 to `:66`; still exported for the drift guard. |
| 670 | `:82` | `EFFORT_SUFFIXES` | gone | scripts/omp-route-grammar.mjs:28 | `EFFORT_SUFFIXES` left the member at 31c465f1; grammar owns `EFFORTS` (`scripts/omp-route-grammar.mjs:28`). Drop or re-point. |
| 670 | `:52` | `RESOLVER_VERSION` | moved | scripts/sync-global-routing.mjs:48 | `RESOLVER_VERSION` — re-anchored at 31c465f1 to `:48`; still a module const, not exported. |
| 670 | `:208` | `FAMILY_ID_PATTERN` hashes non-grammar-safe groups | gone | — | No `FAMILY_ID_PATTERN` at 31c465f1 (or any pinned revision); group safety is `routingGroupProblem` (`scripts/omp-route-grammar.mjs:194`) via `chainGroup` (`:107`). Drop. |
| 670 | `:214` | literal `route-${sha256(group)}` | gone | — | Literal `route-${sha256(group)}` absent at 31c465f1 and all pinned revisions; groups stay opaque strings. Drop. |
| 670 | (unanchored clause) | non-whitelisted effort suffix is `malformed` (parity with Rust `parse_route`) | gone | scripts/omp-route-grammar.mjs:107 | In-member effort whitelist removed at 31c465f1; `validateChain` enforces it (`scripts/omp-route-grammar.mjs:107`) — re-anchored at 31c465f1 to the grammar. |
| 670 | (unanchored clause) | `gemini`-family provider other than the case-exact `google-antigravity/` prefix refused as `banned gemini-family route` | changed | scripts/sync-global-routing.mjs:89-95 | Banned-gemini screen re-anchored at 31c465f1 (`assertAdmissibleRoute`, `:89-95`); prefix match is case-insensitive, message now `route names a banned gemini-family route`. |
| 670 | `:380` | `--check` lstats dest, refuses planted symlink/special file | gone | — | `--check` lstat arm removed at 31c465f1 with the CLI (base :343); no in-member replacement located ([INFERENCE: absorbed or dropped by the gate owner; not verified]). Drop. |
| 670 | `:394` | byte drift prints re-run hint, exits 1 | gone | — | Drift hint/exit-1 path removed at 31c465f1 with the CLI; drift reporting now lives in the gate's `routes:equivalence` block. |
| 670 | `:420` | `usage` error exits 64 | gone | — | Usage exit-64 arm removed at 31c465f1 with the CLI (base :383-386). Drop. |
| 670 | `UNEXPECTED_ERROR_CODE` (unanchored) | escaped crash stamped `unexpected_error` non-enumerably | gone | — | `UNEXPECTED_ERROR_CODE`/`unexpected_error` absent at 31c465f1 and all pinned revisions — claim never matched upstream. Drop. |

Out-of-row observations for the re-census owner:

- Table row note:132 (`scripts/sync-global-routing.mjs | 389 | tool`): line count is correct at 964f443e (389) but stale at 31c465f1 (255, `wc -l`). Class `tool` remains defensible but the member is now a helper module, not a CLI.
- Note:378 bullet `scripts/sync-global-routing.test.mjs` (recorded probe-transcript member list): the file exists at NEITHER pinned revision (`git cat-file -e` fails at 964f443e and 31c465f1; the probe transcript's `UFO_SRC` was `/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`, note:300). Pre-existing staleness outside the 964f443e..31c465f1 diff.
- Pre-existing inaccuracies independent of this diff (wrong at 964f443e too): anchors `:341/:353/:345/:82/:380/:394/:420` never matched base lines; `CORE_SEATS`/`PROPOSAL_SEATS`/`EFFORT_SUFFIXES`/`RESOLVER_VERSION` are not exported in either revision (only `MIRROR_PATH`, `MIRROR_SCHEMA`, `MIRROR_SEATS`, `renderSeatRoutingMirror` are); "case-exact" prefix is wrong at base (both revisions lowercase before `startsWith`).
- New at 31c465f1, previously unrecorded: `snapshot` option (fd-bound config bytes, `:209`/`:251`), and new exports `canonicalJson` (`:120`), `canonicalJsonCompact` (`:129`) — consumed by `scripts/render-seat-tables.mjs:24` and `scripts/run-omp-native-trial.mjs:30`.

Commands run (pinned clone only; lane repo untouched except this report):

- `git -C /fast/scratch/kumitate-r35/src diff --stat 964f443e 31c465f1 -- scripts/sync-global-routing.mjs` → `97 insertions(+), 231 deletions(-)` (matches ticket).
- `git show 964f443e:scripts/sync-global-routing.mjs | wc -l` → 389; `31c465f1` → 255.
- Full numbered dumps at both revisions; full unified diff (raw: artifact://121355).
- `git grep` sweeps at both revisions: `FAMILY_ID_PATTERN`, `UNEXPECTED_ERROR_CODE`, `route-${sha256`, `writeAtomicFile`, `isMain`, `"--check"`, `EFFORT_SUFFIXES` — member-scoped, `scripts/`-scoped, then whole-tree: all absent at 31c465f1; `FAMILY_ID_PATTERN`/`UNEXPECTED_ERROR_CODE` absent at 964f443e and whole-tree at both.
- `git grep` in `scripts/omp-route-grammar.mjs` at 31c465f1: `EFFORTS` (:28), effort-suffix refusal (:107), `routingGroupProblem` (:194).
- `git grep "sync-global-routing"` at both revisions → importer lists (base: render-seat-tables(.test), sync-ufo-contracts, policy.mjs comments; target: adds run-omp-native-trial.mjs:30, render-seat-tables imports `canonicalJsonCompact`).
- `git ls-tree` both revisions + `git cat-file -e`: `scripts/sync-global-routing.test.mjs` absent at both; base scripts/ has 23 `*.test.mjs`, target 22.
- `git log --oneline -- scripts/sync-global-routing.mjs` → head commit 3ddd6b3 (route-trial rewrite).
- `sed -n` on the census note for the section, table rows, and probe appendix.
