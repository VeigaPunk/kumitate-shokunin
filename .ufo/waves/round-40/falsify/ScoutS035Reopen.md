RESULT ScoutS035Reopen rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=defects rows_checked=4 defects=1

# S035 / S036 / S037 re-open and the S012 status flip

Scope: rows S035, S036, S037 of corpus/SOURCES.md and the S012 change queued -> mined
logged in corpus/lessons/round-40.md (read at lane master 0004ae3102c595338c269e56e3a6f5e0d4a28307,
the docs commit, because the lesson lands there and not at the measured candidate).
Clone: `git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin
/fast/scratch/hyaku/kumitate-r40/seats/ScoutS035Reopen/lane`, then
`git checkout -q --detach 1530a75521345e0f4516ed7146180e65f788e017`; `rev-parse HEAD` ->
1530a75521345e0f4516ed7146180e65f788e017.

## Verdict

One defect: the S012 status flip to `mined` names a used-by entry that does not cite
S012. Rows S035, S036 and S037 are confirmed on every axis I was asked to check.

## S035 — Kimi user-scope skill kimi-webbridge (own-work)

- Fields: `awk -F'|' '/^\| S035 \|/ {print NF}'` -> 13 (contract shape, 11 cells).
- Anchor lines on this host, read-only:
  - `~/.kimi-code/skills/kimi-webbridge/SKILL.md:2` -> `name: kimi-webbridge` (matches row).
  - `:6` -> `  version: "2.0.26"` (matches row; row quotes the trimmed substring).
  - `~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md:6` ->
    `  version: "1.11.3"` (matches row).
- Digest prefixes match: `sha256sum` ->
  `defba946e6693fd4c890e…` (skills copy) and `84a8e69d04c5b810e696…` (plugin copy);
  row prefixes `defba946e6693fd4` / `84a8e69d04c5b810` are exact.
- Quote present verbatim: `grep -cF 'Kimi Browser Extension（Kimi 浏览器扩展，原 Kimi WebBridge）lets AI control the user'"'"'s real browser'` -> 1.
- Opening method and date stated on the row: "opened … read-only on 2026-10-22 11:07 -0300
  with `find`/`stat`/`sha256sum`"; `opened` column 2026-10-22 (ISO). The lesson's
  "about 14:07Z" is the same instant (11:07 -0300 = 14:07Z), so the two records agree.
- Tier/kind: `own-work` is a legal kind; tier A is within the fleet contract because A
  covers the lane's own re-runnable evidence (these are re-runnable `find`/`stat`/
  `sha256sum` reads); the "community is never A" rule does not apply.
- used-by `corpus/knowledge/kimi-skills-plugins.md` exists at 1530a75 and does carry
  the source: heading `## `~/.kimi-code/skills/kimi-webbridge`` at line 218, the
  SKILL.md:2/:6 anchors, and a 7-file inventory whose digest prefixes I re-measured —
  all 7 match (`find . -type f | xargs sha256sum` under `~/.kimi-code/skills/kimi-webbridge`),
  plus `SKILL.md` 19437 bytes mode 600, references all 644.
- The row's "seventh counted-live `skills/` child" holds:
  `node scripts/kimi-census.mjs` -> `INFO COUNT skills/ children=7`,
  `KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)`, exit 0.
- Judged axis, measured at the candidate: `node scripts/proxy-check.mjs --src
  /fast/scratch/hyaku/kumitate-pin/src` -> `PROXY: MATCH (… coverage=10; … K=52/52
  coverage:kimi-layer=10; …)`, exit 0 — `coverage:kimi-layer` is 10 as declared.
- Note, not a defect: the row states the tie-break "User over Extra" as a `must`, while
  the knowledge note marks the same outcome INFERENCE (lines 300-303). The rule text
  ("Project overrides User overrides Extra overrides Built-in") that the row's teaches
  rests on is quoted in that note, so the content difference is a label, not a fact.

## S036 — Stryker mutation-testing-elements report schema at 140f2119 (spec, A)

- `curl -sS -o src/s036.json https://raw.githubusercontent.com/…/140f211984e8a0c926ec305a550da425f9bb8d69/packages/report-schema/src/mutation-testing-report-schema.json`
  -> `sha256sum` 404575e9264686dbf85c399f6531fdb489bebc3146e7e1d793b8083bc6a041ae,
  identical to the row's declared file sha256.
- Line 92 is the enum: `sed -n '88,96p'` shows `"title": "MutantStatus"` (90), description
  (91), then line 92 `"enum": ["Killed", "Survived", "NoCoverage", "CompileError",
  "RuntimeError", "Timeout", "Ignored", "Pending"]` — the row's quote is verbatim.
- Revision: the row says "master head 140f2119, commit dated 2026-10-19". The GitHub API
  for that commit returns committer/author date 2026-10-19T00:40:50Z, and master head
  today is still 140f211984e8a0c926ec305a550da425f9bb8d69.
- Opening date stated on the row (`opened 2026-10-22T14:10:55Z`); the method ("by plain
  HTTP") is stated in the round-40 lesson `## Gate` (master) and in the build seat report
  `.ufo/waves/round-40/build/ScribeSourceMTE.md`.
- Kind `spec`, tier A, scope = status vocabulary, status `queued` with used-by `—`:
  contract-consistent, and no knowledge entry cites the schema
  (`grep -rn 'mutation-testing-report-schema' corpus/knowledge/` -> no match), so `queued`
  is the honest status.

## S037 — npm mutation-testing-report-schema 3.9.0 (spec, A)

- Tarball opened by ordinary HTTP; its sha512 recomputed and base64-encoded:
  `openssl dgst -sha512 -binary src/s037.tgz | base64 -w0` ->
  `28CobrcLdQm35zySemaLMKrUpVccLMA1DekUGtfezOSmnI0Xq8oJisixYnO0BQYIwKCkKL7+AE71/uWq/vFSJQ==`,
  byte-equal to the row's declared sha512 and to the registry's `dist.integrity`
  (`sha512-28Cobrc…` from `https://registry.npmjs.org/mutation-testing-report-schema/3.9.0`).
- Metadata cross-checks: registry `version` 3.9.0, `gitHead`
  00aa7bdc1da9df9f474e363cd70041ef4d389b4e, `repository.directory`
  `packages/report-schema` — all three match the row; the packaged
  `package/package.json` carries the same version and gitHead.
- Anchor `package/src/mutation-testing-report-schema.json:41` is the required list:
  `"required": ["id", "mutatorName", "location", "status"]` (line 41 of the extracted
  member) — verbatim.
- The row's byte-identity claim holds on its strongest literal reading: the 3.9.0 member
  extracted at `package/src/mutation-testing-report-schema.json` and the S036 file at
  140f2119 are the same bytes — `cmp` exit 0, both sha256
  404575e9264686dbf85c399f6531fdb489bebc3146e7e1d793b8083bc6a041ae. (Wording nit only:
  "the 3.9.0 member" reads as a schema fragment; the verified object is the whole file.)
- Kind `spec`, tier A, `queued` with used-by `—`, opened 2026-10-22T14:10:55Z: consistent.

## S012 — Kimi Code CLI docs, Agents and Sub-Agents (docs, A)

Content of the row re-verified by ordinary means (`curl -sS` -> HTTP 200, served HTML):

- Headings present: "Agent Locations" and "Agent File Format".
- Quote verbatim: "more specific scopes take higher priority: Explicit ( --agent-file ) >
  Project > Extra > User > Plugin > Built-in" (18 words as the lesson says).
- The teaches tail is also live: "Each directory is scanned recursively for .md files."
  and "Unknown fields are ignored, so newer files stay readable by older versions."
- Append-only mechanics are honoured: a field-level diff of the row between
   f69817edf687c8ce4f87ed7953a353399232f69e and 1530a75521345e0f4516ed7146180e65f788e017
  shows exactly two changed cells, `status` (queued -> mined) and `used-by` (— ->
  corpus/knowledge/kimi-lane-definitions.md); `opened` 2026-10-19, `recheck` on-release,
  `anchor` and `source` are unchanged. The round-40 lesson (master)
  logs that same old -> new pair, so rule 2's logging duty is met.

### Defect 1 — `used-by` names an entry that does not cite S012

- CORPUS.md (fleet, SOURCES.md contract) defines `mined` as "cited by >=1 path in
  `used-by`", and `used-by` as "repo-relative paths of the knowledge entries or lessons
  citing the row".
- `corpus/knowledge/kimi-lane-definitions.md` cites nothing of S012:
  `grep -n 'moonshotai.github.io\|agents.html\|Explicit (--agent-file)'` -> no match;
  `grep -c 'source:' corpus/knowledge/kimi-lane-definitions.md` -> 0 (the file has no
  `source:` header at all); it was not touched this round (corpus diff at the candidate
  lists only QUALITY.md, README.md, SOURCES.md, kimi-residue-files.md,
  kimi-skills-plugins.md).
- Worse, the entry still contradicts the mining: its `## Unknowns` line 229 reads
  "the exact load/resolution order (file vs registry precedence) is unverified" — the very
  question S012 is said to answer. Nothing was mined into the note.
- Why the lane's own gate does not see it: `scripts/sources-check.mjs:62-72` freezes
  `corpus/knowledge/kimi-lane-definitions.md` in `LEGACY_KNOWLEDGE_FILES`, so the
  entry-side checks (`ENTRY_HEADER_REQUIRED`, `ENTRY_SOURCE_UNKNOWN`) never apply to it,
  and the only used-by check is the reverse direction (`USED_BY_MISSING` = path absent on
  disk, `USED_BY_ASYMMETRY` = row omits an entry that cites it). Measured at the candidate:
  `node scripts/sources-check.mjs --self . --today 2026-10-22` ->
  `SOURCES info LEGACY_NO_HEADER count=38` and
  `SOURCES_CHECK: CLEAN (rows=37 … status=queued:15,mined:20,rejected:2 …)`, exit 0;
  `--strict` also exits 0. The gate's silence here is a blind spot, not a confirmation.
- Consequence and minimal repair: S012 should read `queued` with used-by `—` until an
  entry actually cites it, or the used-by cell should name an entry that did. The row's
  own source facts, anchor and quote are all sound, so this is a status-support defect,
  not a source defect. The re-open seat disclosed the legacy-header state in
  `.ufo/waves/round-40/build/ScoutSourcesRecheck.md` ("legacy knowledge file without a
  `source:` header, so `USED_BY_MISSING` and `USED_BY_ASYMMETRY` stay quiet") but did not
  repair the entry, so the contract claim is unmet even though the gate is green.

## Contract sweep on the four rows

- Census at the candidate: rows 37, malformed rows 0, tiers A=36 B=1, statuses
  mined=20 queued=15 rejected=2, no enum violations, no tier inflation, and the
  "mined rows whose used-by paths do not exist" sweep prints nothing — S012's pointer
  passes the existence test while failing the citation test above.
- Kinds used (`own-work`, `spec`, `docs`) and tiers (all A) are inside the fleet enums;
  anchors all name a line plus a revision, no bare homepage.

## Remaining unknowns

- Whether this lane intends `mined` to be satisfiable by a legacy entry that merely
  supplies the substrate the row answers; the contract text says "citing", the practice
  says otherwise. I report the discrepancy against the written contract; the L1 judges.
- I did not open the skills docs page linked from S012's page (unopened, not rowed);
  nothing in my four rows depends on it.

## Tooling

No tool was installed or upgraded; all work used pre-installed `git`, `curl`, `node`
and `python3`. No pacman transaction was attempted. Gate runs (kimi-census, proxy-check,
sources-check) were executed only inside my own scratch clone; the lane working tree,
index and refs were not touched, and this report file is the only lane write.
