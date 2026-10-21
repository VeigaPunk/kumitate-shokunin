REVIEW pointers hits=433 violations=7

# ReviewRouteAdoption — Q14/Q15 pointer and provenance audit (round 36 build)

Scope: `.ufo/waves/round-36/**/*.{md,txt}` at 2026-10-21T02:34:20-03:00 — 99 files, 63 build reports —
plus lines added to lane markdown vs `0614092`. Drafts read: `build/ScribeReport.md` and the
`Scribe*`/`Connector*` drafts feeding it. The three wave `*.json` dispatch/spec files are excluded as
control input (they embed the assignment prompt verbatim). This review file is excluded from `hits`;
its own `/tmp` occurrences quote the audited paths (round-35 `falsify/ReviewLogLesson.md:60-62`
precedent), and are not pointers to live artifacts. Read-only seat: no installs, no delegation, no gate runs.
`hits` = lines matching `/tmp` | `/fast/scratch` | `vgpnk/[Pp]rojects` | `ufo-fsd-alpha|origin-work`
= 432 wave lines + 1 lane added line (`SCORECARD.md` `coverage:runtime-layer`, names `31c465f1`);
per pattern `/tmp` 96 (29 selftest), `/fast/scratch` 256, `vgpnk/Projects` 83, operator 77, lowercase 0.

## Violations (7)
### V1 [Q15, moderate] The report draft's "Before (observed)" column cites unpinned captures
- `build/ScribeReport.md:57`: `| SURFACE_PROBE | DRIFT errors=2 default, errors=3 at pin
  (\`surface-default.txt\`, \`surface-pin.txt\`) |`. The `errors=2` count is read from
  `baseline/surface-default.txt:2` — `src=/home/vgpnk/Projects/ufo-fsd-alpha`, no revision — the
  operator's moving checkout used as a measurement source, Q15's explicit prohibition.
- `:58` cites `proxy-default.txt`; `:60` cites `claims-default.txt`/`claims-rows.txt`. Pin captures
  exist (`proxy-pin.txt`, `claims-pin.txt`; byte-identical to their default twins — `cmp -s` clean —
  so no number is wrong, but the cited source is unpinned; `claims-rows.txt` has no `src=` line).
- The wave holds the correct disposition: `build/SimplSurface.md:63` "valid only as the pre-pin
  default, never as a measurement source" (`:147`), and `corpus/knowledge/pinned-evidence.md:19-23`
  labels the same pair "incomparable without a revision stamp". The draft neither labels nor scopes.
- Fix: cite `*-pin.txt` only; if the 2-error default is kept, carry SimplSurface's clause verbatim and
  keep it out of the measurement column.
### V2 [Q15, moderate] `corpus/knowledge/local-ship.md` new sections name no revision
- `:203-284`: five new `## ` member sections, 42 own-file anchors (`:1644-1831`, `:112-139`, …) and
  origin counts ("Five tests pin the discipline", "three-arm"). `grep -n '31c465\|ee907\|revision'
  corpus/knowledge/local-ship.md` → no output. Q15 enumerates anchors ("S/R members, sections,
  anchors"): they are true at `31c465f1` but the note cannot say which tree they were measured at.
- Fix: one dated line before `:203` — "Member sections below measured at
  `31c465f15669f744848bd9f5d56191c5085670f7` (round 36, 2026-10-21)" — or the revision per heading.
### V3 [Q15, moderate] `native-admission-detail.md` header rev contradicts its new sections
- `:3`: "`crates/ufo-core-runtime/src/`, rev `ee907f1cf` (2026-09-27)". The four new R5 sections
  (`:71-118`) and their anchors are measured at `31c465f1`; only `:104` says "pin truth at 31c465f1".
  A reader re-checking `native_admission_rules.rs:45` at `ee907f1cf` can land elsewhere.
- Fix: scope the header rev to the round-6 map above and add the round-36 pin line before `:71`.
### V4 [Q15 / PIN v1, moderate] 11-hex `src-rev=31c465f1566` propagated as the expected verdict literal
- Seed: `claims.md:19-20` writes `src-rev=31c465f1566` twice (11 hex). PIN v1 fixes "first 12 hex" =
  `31c465f15669`; the gate prints `${rev.slice(0,12)}` (`scripts/proxy-check.mjs:1112`).
- Propagated into 6 drafts / 11 lines: `ConnectorSkillCitations.md:143`,
  `ScribeKnowledgeFidelity.md:47,112`, `ScribeLesson.md:83,88,91`, `ScribeLog.md:42,43`,
  `ScribeShonen.md:3,5`, flagged as the seed at `ScribeSkillProse.md:129-131`. The correct 12-hex form
  appears 19 times; the 11-hex form is the outlier.
- Effect: every quoted "expected" line in the report and drafts will differ from what the gates print.
- Fix: correct `claims.md:19-20` with a frozen-note ("target literal corrected to the contract's
  12-hex display form") and replace the token in all drafts; quote the gate's literal.
### V5 [Q14, moderate] The draft's evidence tree has no committed backing yet
- `git ls-files .ufo/waves/round-36` → 0; `git status --porcelain` → `?? .ufo/waves/round-36/`,
  `?? .ufo/pins/`, `?? corpus/knowledge/pinned-evidence.md`. Round-35's precedent is a committed wave:
  `git ls-files .ufo/waves/round-35 | wc -l` → 221.
- `build/ScribeReport.md:7,54-65` cites repo-relative `.ufo/waves/round-36/baseline/*` for every Before
  cell, and every `/fast/scratch` pin pointer is backed only by `.ufo/pins/origin.json`, itself untracked.
- Fix (L1, before filing): commit `.ufo/pins/*.json` and
  `.ufo/waves/round-36/{baseline,frozen,build,evidence}`; keep the three dispatch/spec JSON out (they
  duplicate full prompts — round-35 D2 rule). If not committed, reword the draft's pointers.
### V6 [Q14, minor] `/tmp` harness with neither durable copy nor disposition
- `build/ScoutFidRemainder.md:8,15,25`: every count (`anchors=506 elsewhere=164 absent=13`) and the
  "Verified candidate" section depend on `/tmp/fid-remainder.mjs` and `/tmp/fid-remainder-fixed.md`;
  no removal line, no committed copy. Contrast `baseline/fidelity-prototype-v1.mjs.txt` (the
  `.txt`-suffix pattern) and `build/ScoutCiteProvenance.md:132` ("Temp state removed after the runs").
- Fix: commit the harness as `.ufo/waves/round-36/baseline/fid-remainder.mjs.txt` (its before line
  already reproduces `baseline/fidelity-prototype-v1.txt` for that note), or add the one-line
  disposition that the per-anchor rows are the evidence and the harness is the contract re-implementation.
### V7 [Q14, minor] False provenance statement about a committed artifact
- `build/ScoutCiteProvenance.md:16`: "the round-35 prototype
  `/fast/scratch/kumitate-r35/w/ExecFidelitySweep/fidelity.mjs` (committed nowhere)".
  False: `diff -q` against `.ufo/waves/round-35/evidence/fidelity-sweep.mjs.txt` → identical;
  `anchors.tsv` (1590 lines) `diff -q` `.ufo/waves/round-35/evidence/fidelity-anchors-final.tsv` →
  identical; both tracked (round-35 wave = 221 files).
- Fix: cite the committed copies and delete "committed nowhere"; the `/tmp` redirects then have backing.

## Allowed buckets (per-file census of the remaining hits)
| Locus | Lines | Classification |
|---|---|---|
| `baseline/selftest-{proxy,roundgate,surface,cite}.txt` | 13+9+4+3 | Hermetic fixture observables printed by the tool under a temp HOME — the tool's output, not pointers a reader dereferences. |
| `build/SentinelSubprocess.md` | 11 | Fixture dirs for `GIT_DIR`/`GIT_CEILING_DIRECTORIES`/`TMPDIR` injection probes; commands and outputs inline. |
| `build/ScoutCiteProvenance.md` | 10 | Command blocks writing and consuming the path in place, with outputs quoted, plus disposition `:132`. |
| `build/ScoutSurfaceReach.md` | 8 | mkdtemp template, before/after snapshots and patched probe copy; outputs quoted; disposition `:139`. |
| `build/RevDispatcherStatus.md` | 8 | strace path, `cwd=/tmp`, negative-test fixture arg; no pointer to a deleted artifact. |
| `build/ScoutSourceGitRev.md` | 5 | Probe dirs created for git-behaviour fixtures; outputs quoted; declared `/tmp`-only `:80`. |
| `build/RevChecklistSelf.md` | 5 | Fixtures with outputs quoted; disposition `:133`; advisory: `:100,131` use an elided `/tmp/...` path. |
| `build/ScoutSourcePytest.md` | 4 | `curl -o` then `grep` in one block, outputs quoted; advisory: no removal line. |
| `build/ScoutSurfaceDigest.md` | 3 | Declared scratch `:5-6`; manifest re-created by the listed command `:142`. |
| `build/ScoutFidRemainder.md` | 3 | **V6**. |
| `build/{ScoutUpstreamVerb,ExecClaimsPin,SimplSurface,ScoutProxyPin,ReviewPristineBaseline,ReviewFidS8Counts,ScribeSources}.md`, `falsify-plan.md` | 1-2 each | cwd, fixture args, rule prose, a note-heredoc quotation, one disposition (`ScribeSources.md:114`). |
| `/fast/scratch/kumitate-r36/src` | bulk of 256 | Contract-named read-only pin clone; citing reports name `31c465f1`/full rev; `.ufo/pins/origin.json` carries `clone` + `revision` (V5 gates the commit). |
| `/fast/scratch/kumitate-r36/w/…` | ~55 | Executor lane clones, patches, validation logs; the deliverable is the patch the L1 integrates; ephemeral by contract (round-35 precedent), no report relies on one as its only evidence. |
| `vgpnk/Projects` | 83 | Lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin` as cwd/self; fleet root as report home/env; legacy `origin-work` only inside quotations of stale docs. |
| operator checkout | 77 | Named rejected source (`claims.md:5`, `ScribeLesson.md:50`, `ScribeShonen.md:62`); pin `recreate` clone source (`ExecPinFiles.md:20`, `ScribeKnowledgePin.md:33`, `pinned-evidence.md:37`); stale-doc quotations (`ConnectorPinConsumers.md:14-46`, `ScribeReadmeMap.md:90,96`); historical citation (`ScribeLesson.md:33,69`); HEAD/status identity reads (`ScoutPinDesign.md:38,97`, `ConnectorOutOfProvince.md:79`, `ScribeKnowledgePin.md:104`). No S/R/anchor/coverage count is read from it except V1. |
| lowercase `vgpnk/projects` | 0 | Zero real hits; the only two matches in the wave are the assignment text in `build-spec.json`/`build-dispatch.json` (excluded). |

Lane Q14 gate as `corpus/QUALITY.md:104` prescribes: `grep -rn '/tmp/kumitate-r\|vgpnk/projects/'
LOG.md SCORECARD.md corpus | wc -l` → 45 (worktree) = 45 (`git grep` at `0614092`); added-line filter
over the same paths → 0; added `/tmp` lines in lane markdown → 0. The one pointer-bearing added lane
line is the `SCORECARD.md` `coverage:runtime-layer` row (named `31c465f1`, pin clone) — allowed.

## Q15 count-attribution audit (all other counts name the pin)

- Pin files carry the full 40 hex: `.ufo/pins/origin.json:4`, `surface-known.json:3`,
  `fidelity-ratchet.json:3` — `31c465f15669f744848bd9f5d56191c5085670f7`.
- Reports/notes naming it (full or the lane's 8-hex shorthand): `claims.md:4-5`, `ScribeReport.md:16,67`,
  `ScribeKnowledgeFidelity.md:6`, `ScribeKnowledgePin.md:7`, `corpus/knowledge/pinned-evidence.md:2`,
  `ScoutR5Members.md:5`, `ScoutR7Members.md:5`, `ScoutCiteProvenance.md:1` (12 hex),
  `ScoutFidRemainder.md:6`, `ConnectorScorecardTerms.md:10`, `RevManifestDigest.md:5`, the `Exec*`
  reports, `ScribeSources.md:18` (S029 row).
- Bundle-level attribution only, accepted under round-35's section-level standard:
  `frozen/{R-runtime-count,S-script-count,R5-members,R7-members}.txt` (bare numbers; `frozen/pin.txt:1`
  names the rev) and the four `baseline/*-pin.txt` captures (pre-change, no `src-rev=`); `claims.md` and
  `ScribeReport.md:43,67` supply the revision once. The prototype is pin-measured by construction
  (`baseline/fidelity-prototype-v1.mjs.txt:3` hardcodes the pin clone).
- Advisory: `evidence/c2-simulation.txt` prints `R raw 95 distinct 92 score 10` with no revision, no
  command, and no citing report. Annotate with pin+command or drop it before commit.
- Advisory: `scripts/surface-probe.mjs:1721` selftest fixture embeds the round-36 scratch clone path and
  the 8-hex `31c465f1` in a `recreate` string — inert, never executed, but a durable production file
  naming a per-round path; use a synthetic clone and the full 40 hex.

## Residual risk / unobserved

- Snapshot is mid-integration: at 02:34 `scripts/claims-check.mjs` was unmodified (no `--pin`,
  `--fidelity`); only `proxy-check.mjs`, `surface-probe.mjs`, `SKILL.md`, `SCORECARD.md`,
  `corpus/README.md`, three notes and `pinned-evidence.md` had changed. [INFERENCE] claims-check will
  follow proxy-check's `${rev.slice(0,12)}`; re-run the 11-hex sweep after it lands.
- Pre-existing Q14/Q15 debt, 0 added this round: 29 lowercase `vgpnk/projects` lines (LOG.md 15,
  SCORECARD.md 2, SKILL.md 1, QUALITY.md 1, lessons 10) and operator `--src` measurements in durable
  notes (`corpus/knowledge/route-probe-cluster.md:410`, `corpus/lessons/round-18.md:104,107`).
  `route-probe-cluster.md` is re-anchored this round; line 410 is untouched and must stay untouched
  (no history rewrite), but the report must not claim the corpus is free of operator-checkout
  measurements.
- `.ufo/pins/origin.json:6` `recreate` clones from the operator worktree — allowed as bootstrap (it
  cannot measure); residual: reproduction depends on that checkout staying shallow-compatible. Q15
  "never measured from the operator checkout" is verified by source inspection of the three
  resolutions, not by a run: no gate was executed by this seat (out of item scope). Tools: none installed.

Evidence commands (lane root):
```
git status --porcelain ; git ls-files .ufo/waves/round-36 | wc -l ; git ls-files .ufo/waves/round-35 | wc -l
git diff -U0 0614092 -- '*.md' | grep '^+' | grep -cE '/tmp|/fast/scratch|vgpnk/[Pp]rojects|ufo-fsd-alpha|origin-work'   # 1
grep -rn '/tmp/kumitate-r\|vgpnk/projects/' LOG.md SCORECARD.md corpus | wc -l                                          # 45
git grep -n '/tmp/kumitate-r\|vgpnk/projects/' 0614092 -- LOG.md SCORECARD.md corpus | wc -l                            # 45
grep -rn 'src-rev=31c465f1566\b' .ufo/waves/round-36/build/*.md | wc -l                                                # 11 in 6 files
grep -n '31c465\|/tmp\|/fast/scratch\|ufo-fsd-alpha' corpus/knowledge/local-ship.md corpus/knowledge/native-admission-detail.md corpus/knowledge/pinned-evidence.md
diff -q <r35 scratch>/fidelity.mjs <(git show HEAD:.ufo/waves/round-35/evidence/fidelity-sweep.mjs.txt)   # same
diff -q <r35 scratch>/anchors.tsv .ufo/waves/round-35/evidence/fidelity-anchors-final.tsv                 # same
cmp -s baseline/claims-default.txt baseline/claims-pin.txt ; cmp -s baseline/proxy-default.txt baseline/proxy-pin.txt
```
