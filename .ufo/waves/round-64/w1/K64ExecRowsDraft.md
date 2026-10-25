VERDICT: The round-64 registry append block is drafted as S198 (jj concurrency), S199 (Firefox jj), S200 (working-copy v0.46.0 release delta only) — 11 cells each, `mined`, opened 2026-10-25, `180d`, used-by exactly `corpus/knowledge/jj-workspace-seat-containment.md` — and validates clean in a scratch mirror (census exit 0, six pre-existing W04 warnings; sources-check CLEAN rows=136→139); none of the staged rows can be appended as-is (each splits into E01 fields=12 + E11), S259/S270 are not appended, and S067 cannot appear on the entry's `source:` line at all.

## Evidence

All commands run 2026-10-25 from the fleet root; mirror = `.ufo/waves/round-64/build/K64ExecRowsDraft/validate`.

```
== 1. sources-census.sh validate --file <mirror>/corpus/SOURCES.md
file	W04	S034 duplicate url stryker-mutator.io/docs/... across scopes   (6 W04 lines, all pre-existing)
file	ok	.../validate/corpus/SOURCES.md
exit=0
== 2. node scripts/sources-check.mjs --self <mirror>
SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)
exit=0
== 0. control, unmodified lane: rows=136 ... CLEAN, exit=0  (base rows 136 -> mirror 139, only my three added)
== 3. verify-quotes.mjs (frozen probe normaliser, capture + live curl with the probe's argv)
QUOTE_CHECK: PASS quotes=8 failing=0   exit=0   (every quote <=25 words, in capture AND in the live page)
== 4. draft-entry-probe.mjs (J1-J5 simulated on the mirror with a draft header)
J1 PASS / J2 PASS / J3 PASS / J4 PASS / J5 PASS — DRAFT_J1_J5: PASS checks=5 ids=S198,S199,S200 bullets=8
```

Document identity, opened by curl today (`/tmp/kumitate-r64/K64ExecRowsDraft/`):
`https://docs.jj-vcs.dev/versions.json` → `{"version":"v0.46.0","title":"v0.46.0","aliases":["latest"]}`; `cmp` of
`v0.46.0/technical/concurrency/` vs `latest/technical/concurrency/` → identical (48988 bytes both); same for the
working-copy page (47694 bytes both). Host binary: `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`.
Working-copy page normalised text: latest 7777 chars vs `v0.45.1` 7284 chars; `jj workspace remove` present in
latest, **absent** in v0.45.1. Concurrency page normalised text: 8572 chars in both, operation-log quote in both.

Falsifiers (`falsifiers.sh`, full output in `falsifiers-transcript.txt`):

```
F1 staged rows S259/S270/S290/S291 appended verbatim → 4x E01 fields=12 + 4x E11 (used-by parsed as the curl tail), exit=1
F2 S198 recheck cell carries prose   → E09 S198 recheck=180d - `curl` -> 1 (ran 2026-10-25), exit=1
F3 S199 used-by points elsewhere     → E11 S199 missing used-by corpus/knowledge/jj-seat-workspace-containment-2026-10-24.md, exit=1
F4 S200 loses its teaches cell       → E01 S200 fields=10, exit=1
F5 the delivered mirror              → file ok, exit=0
```

Simulation mutants (`draft-probe-mutants.txt`): entry citing **S067** on `source:` → `J2 MISS
S067:opened=2026-10-23,S067:used-by-lacks-entry; J3 MISS S067:unbound; J4 MISS S067:no-bullet`; a quote padded past
25 words → `J4 MISS S198:over-25-words` + `J5 MISS`; S198 used-by naming another entry → `usedBy="corpus/knowledge/
agent-isolation-substrates.md" used-by-lacks-entry=true`.

## Findings

1. **K64ExecRowsDraft-1 (HIGH, staged-row shape).** Every staged row carries an escaped `\|` inside its `recheck`
   cell, so it splits into 14 fields (`E01 fields=12`) and the `used-by` cell becomes the tail of the curl command
   (`E11`). Appending any staged row verbatim fails the census on two codes at once.
   Repro: `bash .ufo/waves/round-64/build/K64ExecRowsDraft/falsifiers.sh` (F1).
2. **K64ExecRowsDraft-2 (HIGH, version lie in staged S270/S259).** `latest` is v0.46.0; the host runs jj 0.45.1, whose
   `jj workspace --help` lists `add forget list rename root update-stale` and **no `remove`**. The staged claim
   "`jj workspace remove` forgets it and deletes the directory" is true only of a version this lane cannot demo, and
   the pinned v0.45.1 doc the lane holds as S067 says only "The files can be deleted from disk separately". The row
   is drafted with that boundary stated, and the demo must not use `remove`.
   Repro: `jj workspace --help | sed -n '1,20p'`; `grep -c 'remove' /tmp/kumitate-r64/K64ExecRowsDraft/wc0451.md` → 2
   (both are "remove a file", not the subcommand).
3. **K64ExecRowsDraft-3 (MED, S067 cannot be cited).** J2 requires `opened = 2026-10-25`; S067 was opened
   2026-10-23, and J3/J4 would also need a fresh capture and a bullet for it. Proven by mutant M1 (above). So the
   S067 reuse is prose-only ("version-pinned counterpart"); the block's notes say so explicitly. Consequence:
   staged **S259 is not appended** (it duplicates S067's whole scope, on a moving URL), and staged **S270 is carried
   only by S200's delta scope**.
4. **K64ExecRowsDraft-4 (MED, S200 is not redundant — recommend appending it).** The scout's question resolves
   against "adds nothing": the live page carries the forget/remove distinction (+ the `jj -R` note) that S067's
   pinned v0.45.1 copy does not. S200 is therefore drafted with a **delta-only** scope, never re-grounding the
   workspaces or stale material S067 already holds. No E04/W04 fires between S200 and S067 (different URLs, disjoint
   scopes).
5. **K64ExecRowsDraft-5 (LOW, `latest` drift).** S198 and S200 point at `latest`; the v0.46.0 versioned URLs are
   byte-identical today, so a re-point is a one-cell edit when `latest` moves. S199 (Sphinx, unversioned) has only
   the digest pin (`sha256 abbe47cf…b3d2`, 53233 bytes) as its anchor.
6. **K64ExecRowsDraft-6 (LOW, concurrency page is version-stable).** Citing `latest` for a host on 0.45.1 is not a
   version lie for S198: normalised text is identical at v0.45.1 and v0.46.0 (8572 chars) and the located quote is in
   both. The same sentence is *not* true of the working-copy page — hence finding 2.
7. **K64ExecRowsDraft-7 (LOW, doc location).** The lane has no `corpus/CORPUS.md`; the kind/tier/status enums were
   read from the fleet `CORPUS.md:86-103` and cross-checked against `sources-census.sh:29-33` and
   `sources-check.mjs:102-107`. Both accept `docs`/`A`/`mined`.

## Artifacts

- `.ufo/waves/round-64/build/K64ExecRowsDraft/append-block.md` — the deliverable: exact row text, row notes,
  capture-pin JSON fragment, the 8 located quotes, the entry `source:` header line, the optional S067 `used-by` patch.
- `…/K64ExecRowsDraft/validation-transcript.txt` — the full run: base control, census, sources-check, quote check, J1-J5.
- `…/K64ExecRowsDraft/falsifiers.sh` + `falsifiers-transcript.txt` — F1-F5.
- `…/K64ExecRowsDraft/verify-quotes.mjs`, `draft-entry-probe.mjs`, `draft-probe-mutants.txt`, `quote-check.txt`.
- `…/K64ExecRowsDraft/{concurrency-latest,firefox-jujutsu,working-copy-latest}.html` — the three captures
  (sha256 `5e2f7576…00bf6` / `abbe47cf…b3d2` / `947d0c56…ff3c7`; 48988 / 53233 / 47694 bytes).
- `…/K64ExecRowsDraft/validate/corpus/` — the mirror: `SOURCES.md` with the block inside `## Registry` after S197,
  and the placeholder `knowledge/jj-workspace-seat-containment.md`.
- Report: `.ufo/waves/round-64/w1/K64ExecRowsDraft.md`. Scratch: `/tmp/kumitate-r64/K64ExecRowsDraft/`.

## Limits

- The frozen probe `jj64-probe.mjs` was **not** run: it measures `git archive <M>`, and the entry, demo and PROVINCE
  line are other seats' deliverables. J1-J5 are *simulated* with the probe's own regexes and normaliser
  (`draft-entry-probe.mjs`); J6-J8 were not attempted.
- Captures are my own fetches; the L1 must commit them at the pinned paths and add the three entries to
  `.ufo/pins/source-captures.json` (fragment in `append-block.md` §3). Until then J3 is unbound.
- The placeholder entry exists only so E11 can resolve `used-by`; it is not a knowledge entry and must never be
  integrated.
- A first pass on a **corpus-only** mirror (no lane symlinks) exited 1 with E11 for 12 pre-existing rows
  (S038, S046, S047, S048, S078×3, S079, S084, S093, S094, S095×2, S098, S099 — 15 lines), none on S198-S200: those
  paths are `scripts/`, `SKILL.md` and `.ufo/waves/round-4x`, absent from a corpus-only copy. The final mirror adds
  narrow symlinks for exactly those members; no lane file is copied or modified.
- No tool install or upgrade was needed or performed (no pacman, uv, npx); jj, node, curl and gawk were already present.
