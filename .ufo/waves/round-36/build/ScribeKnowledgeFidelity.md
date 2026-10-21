SCRIBE knowledge-fidelity drafted lines=78 citations=6

# ScribeKnowledgeFidelity — report (round 36 build)

Draft only; read-only scribe seat — no lane file written. Proposed `corpus/knowledge/anchor-fidelity-gate.md` for the L1 to land or reject.

## Provenance
- Pin `31c465f15669f744848bd9f5d56191c5085670f7` verified: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`; `status --porcelain` empty; mode `dr-xr-xr-x`; no write inside it.
- Before: `baseline/fidelity-prototype-v1.txt` — 18 NOTE lines + `TOTAL anchors=1530 ok=340 elsewhere=492 absent=96 dead=173 noid=429 nonok=588`. Re-verified live at draft time from the preserved runner `…-v1.mjs.txt` (hardcodes self/src, imports the live `probeSections`): `node --input-type=module - < .ufo/waves/round-36/baseline/fidelity-prototype-v1.mjs.txt` reproduced `TOTAL … nonok=588` exactly (lane tracked tree clean: `git status --porcelain` shows only `?? .ufo/waves/round-36/`).
- Registry baseline `baseline/claims-pin.txt`: `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)`.
- Reference reimplementation `baseline/fidelity-reference.txt`: `anchors=1504 … nonok=577` — disclosed as the class-boundary limit, not used as the before number.
- S030 is pending: ScoutSourcePytest (`build/ScoutSourcePytest.md`: pytest `how-to/skipping.html#strict-parameter`, 15-word quote; the item's `skip.html` 404s, no redirect). ScribeSources drafts the SOURCES row this wave; admission depends on it landing.
- citations=6 = S023, S030, `scripts/claims-check.mjs`, `scripts/proxy-check.mjs`, `scripts/surface-probe.mjs`, `.ufo/pins/origin.json`.

## Commands run (exact)
```
git -C /fast/scratch/kumitate-r36/src rev-parse HEAD                    # 31c465f1…0f7
git -C /fast/scratch/kumitate-r36/src status --porcelain                # empty
stat -c '%A %n' /fast/scratch/kumitate-r36/src                          # dr-xr-xr-x
grep -c '^NOTE' …/baseline/fidelity-prototype-v1.txt                    # 18
tail -1 …/baseline/fidelity-prototype-v1.txt                            # TOTAL … nonok=588
tail -3 …/baseline/claims-pin.txt                                       # rows=19 yes=19 notes=27 sections=175
grep -n 'fidelity\|--pin\|--known' scripts/claims-check.mjs scripts/surface-probe.mjs scripts/proxy-check.mjs  # no hits
sed -n '285,420p' scripts/claims-check.mjs; sed -n '455,500p' scripts/claims-check.mjs  # parse + liveness
grep -n 'claims-check\|fidelity\|--pin\|src-rev' SKILL.md                # registry :603, checklist :627
node --input-type=module - < .ufo/waves/round-36/baseline/fidelity-prototype-v1.mjs.txt
                                                                        # TOTAL … nonok=588 (exact)
```

## Findings
- Liveness is existential per section: `scripts/claims-check.mjs:377-380` needs one own-file anchor in range with non-blank endpoints; every other anchor is unjudged — the hole the arm measures.
- Class precedence dead → noid → ok/elsewhere/absent confirmed in `baseline/fidelity-reference.mjs.txt`; only elsewhere+absent gate.
- At the lane base `scripts/claims-check.mjs` has no `--fidelity`/`--pin`/`--known` (grep empty), so the draft's after verdict is the frozen **target**, not observed. [INFERENCE] The after verdict is a target; no execution evidence for it exists in this report.
- Do not ratchet to the prototype total: the landed arm's own pristine run is authoritative (reference reads 577 vs prototype 588).

## Out of scope
No corpus/script/lane edits, no `git`/`jj` mutation, no installs, no REA, no dispatch.

## Artifacts
This report; `baseline/{fidelity-prototype-v1.txt,fidelity-prototype-v1.mjs.txt,fidelity-reference.txt,claims-pin.txt}`, `claims.md:16-26`, `build/ScoutSourcePytest.md`.

---
## Draft — `corpus/knowledge/anchor-fidelity-gate.md`

source: S023 https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/ §Mutant states (a check that cannot fail measures nothing); S030 https://docs.pytest.org/en/stable/how-to/skipping.html#strict-parameter §`strict` parameter (an expectation that stops firing must fail); own-work `scripts/claims-check.mjs` FIDELITY v1 + PIN v1, shared by `scripts/proxy-check.mjs` and `scripts/surface-probe.mjs`; pin file `.ufo/pins/origin.json`
verified-at: 2026-10-21 at 31c465f15669f744848bd9f5d56191c5085670f7 (`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`; clone `dr-xr-xr-x`; lane base `0614092e`)
recheck: `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` → `FIDELITY: CLEAN (… nonok=0 … src-rev=31c465f1566)` exit 0

# Anchor fidelity — symbol-on-line, not anchor liveness

`scripts/claims-check.mjs --fidelity` (FIDELITY v1) scores the lane's own notes against the pinned origin tree. It answers one question per anchor: **does the symbol the note points at sit on the line the note cites?** It turns the claims gate's geometric liveness test into a content check; without it a section passes while its cited passage moves out from under it.

## What it measures

The universe is the one the registry gate already parses, not a second walk: only **covered** registry rows (`| S<n> |` / `| R<n> |` whose note cell starts `yes`) are probed (`scripts/claims-check.mjs:479`), and a **member section** is a `## ` heading whose first backticked token is path-like and resolves to exactly one file under `--src` (`RE_CHUNK_HEAD`, `:100`; `sectionBodyChunks`, `:293`; `probeRow`, `:298`). At the pin the registry read 19 rows / 27 notes / 175 sections (`.ufo/waves/round-36/baseline/claims-pin.txt`); the fidelity run found 18 notes carrying at least one anchor.

An **anchor** is a backticked span in the section body that is a bare `:N` / `:N-M` (binds to the section's own member) or a `path:N[-M]` whose path resolves uniquely to that same member. The **symbol** is the adjacent backticked span on the same note line. Pairing is frozen heuristic, right first:

1. the next span whose start is within **14 characters** after the anchor's closing backtick;
2. else the previous span ending within **14 characters** before the anchor's opening backtick;
3. the paired span must not itself be an anchor, must not be path-like, must be **3+ characters** after trim, and must not be only punctuation/digits;
4. no qualifying span ⇒ `noid`.

`ok` means the symbol occurs in lines N..M of the member file, 1-based inclusive, as a substring of the joined segment — not a token or AST match.

## Five classes

| class | test, in this order | gated? |
|---|---|---|
| `dead` | N < 1, M > file lines, or N > M — tested before pairing | no, printed diagnostic |
| `noid` | no adjacent span passes the pairing rule | no, printed diagnostic |
| `ok` | symbol occurs in lines N..M | no (clean) |
| `elsewhere` | symbol occurs in the file, but not in N..M | **yes** |
| `absent` | symbol occurs nowhere in the file | **yes** |

`nonok = elsewhere + absent` is the only gated quantity; `dead`/`noid` are never gated or ratcheted — an anchor with no adjacent symbol or no math-checkable range is outside this arm's claim, and dead geometry is already the registry gate's (`SECTION_DEAD_ANCHOR`, `scripts/claims-check.mjs:377-380`).

Output: one `FIDELITY note=<repo-relative note> anchors=… ok=… elsewhere=… absent=… dead=… noid=… nonok=…` line per note with anchors > 0, then `FIDELITY_TOTAL …`, then `FIDELITY: CLEAN (…)` exit 0 or `FIDELITY: DRIFT (…)` exit 1; exit 2 fail-closed (`SRC_NOT_A_DIR`, `RATCHET_MALFORMED`, `RATCHET_REV_STALE`); 64 usage.

## Four defect shapes liveness cannot see

The registry liveness test accepts a section if **one** own-file anchor is in file with non-blank endpoint lines (`scripts/claims-check.mjs:377`); every other anchor in that section may point anywhere.

1. **Symbol moved.** Geometry still live, symbol now on another line ⇒ `elsewhere`.
2. **Symbol gone** (renamed or deleted), geometry still live ⇒ `absent`.
3. **Range widened onto a blank line** — padding a stale anchor until its endpoints land on text. Liveness sees geometry; fidelity asks where the paired symbol is: outside the widened range ⇒ `elsewhere`; out of file or inverted ⇒ `dead` (diagnostic); if the symbol falls inside, the padding is invisible (limit below).
4. **Anchor with no paired symbol.** `noid`: printed so the census is complete, not a failure — the arm refuses to guess a symbol the note did not write.

## Ratchet

`--fidelity-ratchet FILE` reads `{contract:"kumitate-fidelity-ratchet-v1", revision:"<pin rev>", notes:{<note-rel>:<ceiling>}, total:<ceiling>}`: a note **absent** from `notes` must read `nonok=0`; a listed note must read `nonok <= ceiling`; `FIDELITY_TOTAL nonok` must be `<= total`; `revision` must equal the active pin revision, else exit 2 `RATCHET_REV_STALE` (malformed file ⇒ `RATCHET_MALFORMED`; missing tree ⇒ `SRC_NOT_A_DIR`; usage ⇒ 64).

The only way to permit debt is to list a ceiling; deleting an entry re-tightens that note to zero. Same discipline one gate over: a listed upstream finding that stops firing is `KNOWN_STALE`, never a silent pass (S030); a check that cannot separate killed from survived measures nothing (S023).

## Pin coupling

`--pin FILE` (default `<self>/.ufo/pins/origin.json` when it exists) resolves `--src` from the pin's clone when `--src` is absent, asserts `git -C <src> rev-parse HEAD` equals the pin revision (mismatch ⇒ exit 2 `SRC_REV_MISMATCH`; no git or not a repo ⇒ exit 2 `SRC_REV_UNVERIFIABLE`), and prints `src-rev=<first 12 hex>` inside the verdict. Without a pin file the mode behaves as before — portable, `src-rev=` omitted. `proxy-check.mjs` and `surface-probe.mjs` take the same flag, so every gate verdict names the revision it scored.

## Before / after

Before (2026-10-21, base lane `0614092e`, pinned clone): `node --input-type=module - < .ufo/waves/round-36/baseline/fidelity-prototype-v1.mjs.txt` — the runner hardcodes `self`/`src` and imports the live `probeSections`; recorded output is `…-v1.txt`:

```text
TOTAL anchors=1530 ok=340 elsewhere=492 absent=96 dead=173 noid=429 nonok=588
```

Largest debts: `ops-watchers.md` 189, `remaining-scripts-census.md` 177, `sighting-wall.md` 35, `native-trial-launch.md` 35, `route-probe-cluster.md` 31.

After (round-36 **target**, same command as `recheck:`):

```text
FIDELITY: CLEAN (… nonok=0 … src-rev=31c465f1566)
```

with every ratchet ceiling at 0 or the note absent from `notes`, and the nine new R5/R7 member sections (`native-admission-detail.md`, `local-ship.md`) reading `nonok=0`.

## Limits

- **Heuristic pairing.** A symbol on the next line, or more than 14 characters away, is `noid` even when a human would pair it. Two independent implementations of this frozen text read different totals on the same tree: prototype `1530/588` versus `.ufo/waves/round-36/baseline/fidelity-reference.txt` `anchors=1504 … nonok=577`. The class boundary is implementation-defined at the margins; the ratchet pins the landed script's numbers, not the prototype's.
- **Section-scoped universe.** Only member sections of covered rows. Prose anchors outside them, topic-form rows (`ROW_NO_SECTIONS` advisory) and notes no row names are not measured. `nonok=0` is not "the corpus has no stale anchors".
- **No semantic equivalence.** `ok` means the symbol string occurs somewhere in N..M; the line may say something else, the range may be padded, and substring containment lets `foo` pair with `foo_bar`. Widening until the range swallows the symbol converts `elsewhere` to `ok`, and a symbol on every line (a common type name) passes any range. The arm verifies addressability, not meaning.
- **`dead`/`noid`, and blank lines inside an otherwise live range, are outside the gate.** They are printed to make the census auditable; the gated number is `elsewhere + absent` only.
