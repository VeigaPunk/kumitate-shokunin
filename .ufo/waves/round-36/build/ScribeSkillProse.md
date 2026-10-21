SCRIBE skill drafted snippets=7 retired-claims=1

# ScribeSkillProse — SKILL.md prose draft (round 36, 2026-10-21)
Draft only; **SKILL.md was not edited**. Pointers are pre-edit lines on lane master
`0614092e…` (815 lines). Every flag/field comes from the frozen contract in the item, not
observed tool output: the executor worktrees had not landed the scripts
(`grep -n -- '--fidelity\|--pin\|src-rev=\|KNOWN ' Exec*/lane/scripts/*.mjs` → nothing) and
`.ufo/pins/` was absent. Commands: `read`, `grep -n`, `sed -n`, a read-only `python3` JSON
lookup, a read of ExecChecklistRewrite's clone; no gate, no install, no write outside this report.
## Snippet 1 — gate registry, surface-probe row (SKILL.md:600)
BEFORE:
```
| surface-probe | gate | `node scripts/surface-probe.mjs [--checklists]` → `SURFACE_PROBE:` / `CHECKLIST: n/m` | `--selftest` | `## Verifiable checklist` below; frozen status shape in the script; `sighting.surfaceDigest` in the origin tree's `config/ufo.json` (outside this repo — named gap) |
```
AFTER:
```
| surface-probe | gate | `node scripts/surface-probe.mjs [--checklists] [--pin FILE] [--known FILE]` → `SURFACE_PROBE: CLEAN\|DRIFT (… known=<n> … src-rev=<12hex>)` / `CHECKLIST: n/m` | `--selftest` | `## Verifiable checklist` below; frozen status shape in the script; `sighting.surfaceDigest` in the origin tree's `config/ufo.json` (outside this repo), read at the revision pinned in `.ufo/pins/origin.json`; expected findings in `.ufo/pins/surface-known.json` (a listed finding must fire — `KNOWN_STALE` — an unlisted one stays an error) |
```
## Snippet 2 — gate registry, proxy-check row (SKILL.md:602)
BEFORE:
```
| proxy-check | gate | `node scripts/proxy-check.mjs [--strict]` → `PROXY: MATCH\|DRIFT` | `--selftest` | `SCORECARD.md` `<!-- kumitate-proxy-v1` stanza (terms + `pin.*` sha256) |
```
AFTER:
```
| proxy-check | gate | `node scripts/proxy-check.mjs [--strict] [--pin FILE]` → `PROXY: MATCH\|DRIFT (… src-rev=<12hex>)` | `--selftest` | `SCORECARD.md` `<!-- kumitate-proxy-v1` stanza (terms + `pin.*` sha256); origin revision in `.ufo/pins/origin.json` |
```
## Snippet 3 — gate registry, claims-check row (SKILL.md:603)
BEFORE:
```
| claims-check | gate | `node scripts/claims-check.mjs [--row ID] [--strict]` → `CLAIMS: MATCH\|DRIFT` | `--selftest` | `SCORECARD.md` registry `yes — <note>` cells |
```
AFTER:
```
| claims-check | gate | `node scripts/claims-check.mjs [--row ID] [--strict] [--pin FILE] [--fidelity] [--fidelity-ratchet FILE]` → `CLAIMS: MATCH\|DRIFT (… src-rev=<12hex>)` / `FIDELITY: CLEAN\|DRIFT (… nonok=<n> … src-rev=<12hex>)` | `--selftest` | `SCORECARD.md` registry `yes — <note>` cells; fidelity ceilings in `.ufo/pins/fidelity-ratchet.json` |
```
## Snippet 4 — named-gap retirement (SKILL.md:607-609)
BEFORE:
```
Named gaps (not claimed): no gate yet ships the §Gate standard "two evidences"
frozen-snapshot run with a digest-pinned expected-verdict file, and no verdict line names
the revision it measured — cite the commit beside the verdict instead.
```
AFTER:
```
Named gaps (not claimed): no gate yet ships the §Gate standard "two evidences"
frozen-snapshot run with a digest-pinned expected-verdict file. The second half of
that gap — "no verdict line names the revision it measured" — held through round 35
and was retired in round 36 (2026-10-21): `claims-check`, `proxy-check` and
`surface-probe` resolve the origin through `.ufo/pins/origin.json` and print
`src-rev=<first 12 hex>` inside the verdict line (PIN v1; working rules below). The
remaining gap is the frozen expected-verdict snapshot, not the revision.
```
## Snippet 5 — checklist intro, 14-item count with date (SKILL.md:615-616)
BEFORE:
```
Every item is read-only, runs from this repo's root, and prints its own verdict;
`node scripts/surface-probe.mjs --checklists` executes the list.
```
AFTER:
```
Fourteen items (14 since round 36, 2026-10-21 — 13 through round 35, plus the
anchor-fidelity sweep), every one read-only, runs from this repo's root, and
prints its own verdict; `node scripts/surface-probe.mjs --checklists` executes
the list.
```
Cross-owner: ExecChecklistRewrite owns 613-650 and **applied this verbatim** in its clone
(`ExecChecklistRewrite/lane/SKILL.md:615-618`; `/fast/scratch/kumitate-r36/w/ExecChecklistRewrite.patch`,
4133 B) — my 615-616 anchor becomes 615-618. Clone:640 has the 14th item,
`node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`
→ `FIDELITY: CLEAN` (matches `claims.md:19`); clone:629 item 3 is
`node scripts/surface-probe.mjs --known .ufo/pins/surface-known.json` (default pin, no
explicit `--pin`), consistent with Snippet 1. Item text remains theirs.
## Snippet 6 — PIN paragraph, new bullet between SKILL.md:702 and :703
Insert after the cite-check bullet (ends 702 `` `--strict` promotes warnings to failure.``),
before ``- Re-verify the live surfaces the same way:`` (703):
```
- Pin the revision before trusting a verdict: `.ufo/pins/origin.json` (contract
  `kumitate-origin-pin-v1`) names the upstream repo, the full revision, the
  read-only clone and the one-line `recreate` command that rebuilds it — run
  `recreate` verbatim instead of pointing `--src` at the operator checkout.
  `claims-check`, `proxy-check` and `surface-probe` take `--pin FILE` (default
  `<this repo>/.ufo/pins/origin.json` when it exists), resolve `--src` from the
  pin's clone when `--src` is absent, assert `git -C <src> rev-parse HEAD` equals
  the pinned revision, and print `src-rev=<first 12 hex>` inside the verdict line
  (`PROXY: DRIFT (…; src-rev=31c465f15669)`); with no pin file all three behave
  exactly as before. A revision mismatch is `SRC_REV_MISMATCH` (exit 2); an
  absent/non-repo/unreadable HEAD is `SRC_REV_UNVERIFIABLE` (exit 2) — neither is
  a scored zero, and a stale clone is recreated, never "fixed" by editing the pin.
  A pinned tree may be `chmod a-w`: `surface-probe` runs the dispatcher `status`
  verb with `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH` under a `mkdtemp` and removes
  it afterwards, so no file under `--src` is created or modified.
```
## Snippet 7 — FIDELITY paragraph, new bullet between SKILL.md:731 and :732
Insert after the claims-check bullet's round-35 note (ends 731 `` `sections=` total is
still a raw occurrence count, not the proxy term.``), before ``- Re-verify the
round-close contract before claiming a round done:`` (732):
```
- Sweep anchor fidelity before trusting the registry:
  `node scripts/claims-check.mjs --fidelity` (FIDELITY v1, same gate) walks only
  the member sections the registry gate already parses — a `## ` heading whose
  first backticked token resolves to one origin file. Anchors are backticked spans
  in the section body that are a bare `:N[-M]`, or a `path:N[-M]` whose path
  resolves uniquely to that section's own member file. The symbol is the ADJACENT
  backticked span on the same note line: the next span starting within 14
  characters after the anchor (right first), else the previous span ending within
  14 characters before it; a span that is itself an anchor, path-like, under 3
  trimmed characters, or only punctuation/digits gives `noid`. Classes: `ok` = the
  paired symbol occurs in lines N..M (1-based inclusive); `elsewhere` = it occurs
  in the file but outside the range; `absent` = it occurs nowhere in the file;
  `dead` = the range is outside the file or N>M; `noid` = no usable adjacent
  symbol. Only `nonok = elsewhere + absent` gates — `dead`/`noid` print as
  diagnostics and are never ratcheted. `--fidelity-ratchet FILE`
  (`.ufo/pins/fidelity-ratchet.json`, contract `kumitate-fidelity-ratchet-v1`)
  pins per-note ceilings plus a `total` at the active revision: an unlisted note
  must read `nonok=0`, a listed note `<=` its ceiling, the total `<= total`, and a
  stale revision is `RATCHET_REV_STALE` (exit 2; `RATCHET_MALFORMED` and
  `SRC_NOT_A_DIR` likewise). Repairs by class: `elsewhere` → move the anchor onto
  the line where the symbol actually sits (or cite the symbol on the cited line);
  `absent` → the symbol was renamed/removed upstream, so re-cite the live symbol
  or drop the stale line; `dead` → the range no longer exists, so re-cite the
  surviving code; `noid` → put the symbol inside the anchor's 14-character
  window. Text is one `FIDELITY note=… anchors=… ok=… elsewhere=… absent=… dead=…
  noid=… nonok=…` line per note with anchors > 0, then `FIDELITY_TOTAL …`;
  `FIDELITY: CLEAN` needs `nonok=0` everywhere and carries `src-rev=<12hex>`
  under a pin (the segment is omitted with no pin).
```
## Findings / conflicts (verbatim, for the canonical judge)
1. **Hex width:** `claims.md:19-20` writes `src-rev=31c465f1566` (11 hex) and the context
   summary `src-rev=31c465f1` (8) while PIN v1 fixes first 12 hex = `31c465f15669`; snippets
   use 12, the shorter forms reading as prose shorthand.
2. **Verdict parenthetical not frozen past the tokens:** PIN v1 fixes only "print
   `src-rev=<first 12 hex>` inside the verdict line"; KNOWN v1 fixes the `KNOWN …` line and
   `known=`. Rows state `(… src-rev=<12hex>)` / `(… known=<n> …)`; if executors print
   `at src-rev=…` outside parentheses, keep tokens and adjust only the parentheses.
3. **`--known` in Snippet 1 is my addition** beyond the literal "pin flag and new verdict
   fields": the `known=<n>` field needs it and it is the pinned-value home; drop the
   flag/cell phrase if the L1 wants the row strictly minimal.
4. **Surface-probe cell's "— named gap" retired** (`.ufo/pins/origin.json` now names the
   revision); the digest itself is still outside the repo, as the cell says. Historical
   round text (round 16/35 notes, baselines) untouched — Snippet 4 is a dated pointer.
5. **Snippet 5 is already consumed**: L1 applies Snippets 1-4, 6-7 by text and takes the
   intro from ExecChecklistRewrite's patch once; its clone:620-625 pin paragraph overlaps
   Snippet 6 — duplication, not contradiction.
6. **Peer prose vs peer command:** its prose says "Item 1 (`cite-check`) still takes an
   explicit `--src`", but clone:627 runs bare `node scripts/cite-check.mjs` (derived default).
7. **Not observed:** no executor script carried `--pin`/`--fidelity`/`KNOWN`/`src-rev=`;
   `.ufo/pins/` absent. Snippet semantics are [contract text], not [executed output] —
   [INFERENCE] until applied and gated.
