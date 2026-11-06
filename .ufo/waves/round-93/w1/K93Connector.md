# K93Connector — sibling-overlap scan for `seat-route` v2 (`kumitate-seat-route-v2`)

Round 93, claim C1 (operability, capability upgrade `seat-route` v1 → v2). Read-only scan.
Method: fleet-wide grep for the v2 field vocabulary and for the omp-sessions read surface, over
`*/scripts/`, `*/tools/`, `*/verifiers/`, `*/SKILL.md`, `*/PROVINCE.md` and `*/plans/`, excluding
`.ufo/` (round evidence, not instruments), `corpus/` and `.git`. Receipts in this directory:
`sibling-scan.txt`, `province-lines.txt`, `merge-report-check.txt`, `candidate-status.txt`.

**Headline.** No sibling lane reads `retryRecovery`, `supersededBy` or `upstreamProvider` — the three
fields that make v2 a capability upgrade — anywhere in the fleet outside `kumitate-shokunin/`
(`sibling-scan.txt` § R1, § R4: 0 hits across mori/mado/kotoba/tsukuroi/tameshi/kake/souji).
v2 does not duplicate a sibling. It **does** newly formalise a *carrier* four sibling instruments
already read — the raw `~/.omp/agent/sessions/**/*.jsonl` seat transcript — and the five overlaps
below are on that carrier, not on the fields. Four are complements with a stated boundary; one
(mori) is a complement with an **unstated divergence** that C1 should cite rather than leave
contradictory.

---

## 1. Overlaps, per instrument

| # | lane | file | what it reads from a seat transcript | vs v2 |
|---|---|---|---|---|
| 1 | mori | `tools/mori-seat-terminal.py` (`9b90acbe…`, 3119 L) | tail-only (≤512 KiB) of each `*.jsonl` under a sessions dir; validates header `{"type":"session","version":3}`; classifies the **last** message row: `role`, `stopReason`, `errorStatus`, `completedAt`, `timestamp`, `provider`, `model`, and from `errorMessage` **derived metadata only** | **complement, divergence unstated** — see § 5(a) |
| 2 | mado | `tools/mado-tripwire.py` (`cd9da20c…`, 3465 L) | `.jsonl` bytes of omp transcripts; assistant `toolCall` blocks only (`bash.arguments.command`, eval `.arguments.code`); refuses paths under `~/.omp/agent` outside `sessions/`; secret-shaped substrings redacted | **complement** — different claim (issued commands), boundary already stated on mado's side |
| 3 | kotoba | `SKILL.md:556-558` + `verifiers/check_omp_catalogue_repro.py` | `~/.omp/agent/sessions/**/*.jsonl` (5842 files) **counts** `session_init` records for the skill-render census; "the counter moves inside a round, re-run before citing" | **complement** — counts rows, never reads routing fields; boundary stated at kotoba `PROVINCE.md:70` |
| 4 | tsukuroi | `tools/check-scrub-grounding-r45.py` (`a1eb402d…`, 424 L), `--sessions` default `~/.omp/agent/sessions/-Projects-shokunin` (L308) | greps seat `.txt`/transcript text for a bound `ROW GR<n> VERDICT:` line, to check a committed seat report against its own transcript; reported *outside* its predicate | **complement + a should-cite** — its honesty note is the epistemic limit v2 inherits (§ 5(c)) |
| 5 | tameshi | `tools/wave-route-mix.py` (`1954c409…`, 128 L) | does **not** read transcripts: parses `~/.omp/agent/config.yml` (`agentModelOverrides` → `modelRoles` alias → `provider/model`) | **complement, opposite end of one axis** — declared route *before* dispatch vs served route *after*; the strongest assimilation surface in the fleet (§ 4) |
| 6 | souji | `census/round-44/records/seat-terminal-errors.json` | a committed *record* (not a tool) of per-seat `model_change` rows + `stopReason:"error"` message rows with raw `errorMessage`, plus `event_types` | **precedent, not a duplicate** — historical round evidence; also the counter-example to v2's redaction (§ 5(b)) |
| 7 | kumitate (intra-lane) | `scripts/inline-dispatch-evidence.mjs` (`9f1978a9…`, 597 L) | `session_init` (`tools`, `title`, digest) at L194; `model_change` role at L197 — keeps only the **first** `role === "subagent:<stem>"` model (L197-199) | **complement by construction** — v1's own header names this: it "keeps only the first `subagent:` model_change", which is exactly the Amendment-44 gap seat-route exists to close |

Non-overlaps checked and dismissed: `kumitate/scripts/{omp-census,kimi-census,cite-check,proxy-check}.mjs`
(shape/registry, never transcript content — `omp-census.mjs` reads depth-1 names/kinds/modes only);
`kotoba/verifiers/check_omp_root_semantics*.py` (skill-*root* resolution from binary strings, not
sessions); `kake/scripts/{freshness-sweep,probe-delta}.mjs` (`probe-history.jsonl`, an unrelated
surface); `souji/tools/souji-seat-audit.py` (reads the *rendered* `<Seat>.txt` exported from
`history://`, not the raw `.jsonl`); `tabi/scripts/bidi-*.mjs` (`.jsonl` of a WebDriver bridge);
`mori/tools/mori-job-runway.py` (`config.yml` only).

---

## 2. `kumitate-shokunin/PROVINCE.md` — every line needing amendment

Measured at `d05fc164cdf6aee22b0522799069f249b517b563a070120aacc8d5bf826d7219` (58 lines).
This is r92 debt item (5) and it is **not optional**: v1 already reads transcript *content*, so the
lane's province statement has been false since round 92 — v2 makes it false in seven more fields.

| line | current text (abridged) | why v2 needs it amended |
|---|---|---|
| **16** | "The OMP harness agent plane `~/.omp/agent` — depth-1 members only … Member **content** stays out of scope by design (readdir + lstat only)." | **Flatly contradicted.** `scripts/seat-route.mjs` opens, streams and parses the content of files at depth 3+ under `~/.omp/agent/sessions/`. Amend to: content is out of scope **for the census** (`omp-census.mjs`, readdir + lstat for depth-1 members), and note the dated exception — `seat-route` reads seat-transcript **content** below `sessions/`, nothing else under `~/.omp/agent`. |
| **56-58** | "Unchanged and binding: member content of `~/.omp/agent` is out of scope (readdir + lstat only), and the OMP live root is read only through an explicit live read." | Same contradiction, in the Round-80 addition's closing sentence. "Unchanged and binding" is now false; the amendment must be **appended** (dated), never a rewrite of the r80 paragraph, per the r92-spot-check § 5 (2) erratum rule. |
| **32** | "Local model serving and endpoints → kama. Prompt and skill craft → kotoba. Research method → chousa." | Needs a fourth route in the Adjacent band: **seat-transcript terminal status → mori** (`mori-seat-terminal.py`, mori `PROVINCE.md:103-105,593`), **transcript tool-call conduct → mado** (`mado-tripwire.py`, mado `PROVINCE.md:20,25`), **render census over `session_init` counts → kotoba** (kotoba `PROVINCE.md:70`), **pre-dispatch route concentration → tameshi** (`wave-route-mix.py`, tameshi `SKILL.md:2019,2209`). Today kumitate's PROVINCE names **none** of the four (`grep -n -E 'mori\|mado\|tripwire\|seat-terminal' PROVINCE.md` → 0 hits). |
| *(new line, Adjacent or Frontier)* | — | The positive half: kumitate owns the **post-hoc served-route record** for its own waves; mori owns terminal-status classification, mado issued-command conduct, kotoba render counts, tameshi pre-dispatch prediction. This is what makes v2 a capability row rather than "we re-implemented mori". |

**Second-order pointer break — repair in the same commit.** `kotoba-shokunin/PROVINCE.md:70` states
the split by citing *kumitate* `PROVINCE.md:28` ("kumitate owns dispatch/orchestration tooling and
routes 'Prompt and skill craft → kotoba'"); **kumitate `PROVINCE.md:28` is a blank line**, the text
moved to `:32` (`sed -n '28p'` and `'29,33p'` in `province-lines.txt`). The r92 debt already
requires touching this file, so the pointer must be re-verified and the kotoba citation corrected to
the post-amendment line — a one-line cross-lane fix, and the only way this amendment avoids minting
a new dead pointer in a sibling's province.

**Sibling PROVINCE files that already claim this ground** (no kumitate amendment may absorb them):
mori `PROVINCE.md:103-105` ("passive terminal-at-scan transcript observation … **no** permanent death,
authenticated lane membership, incident count or **routing decision** is claimed") and `:593`;
mado `PROVINCE.md:20,25` (tripwire row, including its `sessions/`-only path bound and the
"redacted, not reported" route to kagi); kotoba `PROVINCE.md:70`. mori's "no routing decision is
claimed" is the explicit licence for C1 and should be **cited** in the v2 PROVINCE amendment.

---

## 3. Registry rows in this lane that must move with the surface

Not a sibling question, but the same commit: v2 renames `errors` → `error_attempts` and adds seven
fields, and four committed rows still describe v1's record shape.
`SKILL.md:589` (gate count sentence, "round 92 adds `seat-route`"), `SKILL.md:647` (the gate row —
field list `…, fallback, errors, aborted, last_error, yielded, final, parse_errors`, contract
`kumitate-seat-route-v1`), `SKILL.md:703` (item 47), `SKILL.md:765` (checklist item),
`corpus/README.md:272` (knowledge map row), `corpus/knowledge/seat-route-from-session-transcripts.md:2,3,93`
(`verified-at` / instrument sha / the `recheck:` command still runs `probe92-c1.py`).
`SCORECARD.md:1999` (capability row) is a new row for v2, not an edit of the r92 row.
No other lane's registry cites `seat-route` (fleet grep, 0 hits outside this lane).

---

## 4. Assimilation — shokuknow merge package

`/home/vgpnk/Projects/shokuknow/merge/kumitate/MERGE-REPORT.md`
(`sha256 0d8b29ff1704ce0f09a1d1dcd32389b3873757604f893762cd7018becae35b9c`), 155 rows / 70 knowledge
entries staged from rounds 1-16. Nothing was run in that tree (read-only, `merge-report-check.txt`).

**Verdict: NO FIT.** Three independent reasons, each measured:

1. **Vocabulary absent.** `grep -c -E 'model_change|stopReason|retryRecovery|session_init|upstreamProvider|supersededBy|resolvedModel'`
   over `MERGE-REPORT.md`, `MERGE-REPORT.json` and `SOURCES.append.md` → **0 / 0 / 0**. The package
   contains no staged theme about seat-transcript record shape.
2. **Nearest three still miss.** `omp-session-sharing-and-mcp-lifecycle.md` (session sharing + MCP
   lifecycle), `seat-pool-failure-detection-taxonomy-2026-10-24.md` (liveness/failure-detector
   theory), `exactly-once-attribution.md` (attribution across model/harness/contract) are adjacent
   in *words* and disjoint in *object*: the first is protocol, the second is detector theory, the
   third is arXiv 2609.29095 episode attribution. None supplies a fact about
   `retryRecovery`/`upstreamProvider`/`session_init.retryFallback`.
3. **Version skew.** Every staged OMP theme is pinned to upstream `0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0`
   (2026-10-23); C1's ground is `79fa222e8390aed3494f4bc6746814e6c74c21cf` (2026-11-06). Adopting a
   staged theme onto this claim would import an older pin onto a newer claim's ground.

`Assimilation: none` therefore stands, and the plan's `Assimilation: none unless a seat finds a
fitting theme` resolves to **none** from this seat.

**But one fleet-internal assimilation is available and is not a shokuknow theme** — stated because
it is the only move this scan found that improves the operability axis without harming another:
tameshi's `wave-route-mix.py` predicts, from `~/.omp/agent/config.yml`, the provider each seat
*should* be routed to and refuses a wave above `--max-share`; v2 reports, from the transcript, the
provider each seat *was* routed to (`captured`, `resolved`, `chain`) and who answered
(`answered`, `upstream`, `superseded_by`). For any wave both are runnable on, the two sets must
agree on the captured route, and neither instrument can currently check the other. Wiring that
comparison is a later claim, not this one — recorded here as a pointer, not a scope expansion.

---

## 5. Contradictions stated, not smoothed

**(a) Two lane tools classify the same row differently and neither names the other.**
`seat-route` v2: `final = "dead"` iff the last turn's `stopReason === "error"` — no time component.
`mori-seat-terminal.py:66-70`: a terminal error is `error_unsettled`, **not** dead, while its
timestamp is newer than scan time minus `--settle-seconds` (default 900); an error with no usable
numeric timestamp is `unavailable`, "neither dead nor recent". So at any instant, a seat whose last
turn errored 2 minutes ago is `dead` to v2 and `error_unsettled` to mori. Both definitions are
correct for their own predicate (v2's is frozen and purely per-transcript; mori's is a live census
with a settle window). The risk is *reporting*: a round report quoting `SEAT_ROUTE: dead=N` beside a
mori census quoting `dead_*=M` will disagree on the same wave, and neither document says why. v2's
header should cite mori's settle window as the known divergence. (mori also distinguishes
rate-limit/quota/auth by Z.AI `(type=NNNN)` codes; v2 collapses all to `dead`, and v2's
`last_error` is where that information leaks out unstructured.)

**(b) `errorMessage` has two redaction postures on the same field.**
mori decodes `errorMessage` only for bounded derived metadata — retry-exhausted prefix boolean,
`after N retr(y|ies)` count, one `(type=NNNN)` code, presence of literal quota/rate/auth tokens —
and "the decoded text is never materialized". v2 emits the first line up to 120 chars with 24+-char
`[A-Za-z0-9_-]` runs replaced by `<redacted>`. v2 is *weaker* on a secret shorter than 24 chars and
*stronger* on long opaque blobs; the two rules are not comparable and neither cites the other's.
souji's committed `census/round-44/records/seat-terminal-errors.json` is the counter-example that
makes the rule load-bearing: it stores a raw 429 `errorMessage` including a request-id-shaped
32-hex token, which v2's rule would redact. Routing only: v2's rule is frozen by plan C1 and must
not be changed mid-round; the finding is that the divergence should be stated where both tools are
citable, and that no fixture carrying such a token may be committed (r92 GH013).

**(c) A tool reading host transcripts cannot authenticate them.**
`check-scrub-grounding-r45.py:61-62` states it plainly of the same tree: "host-local, cannot tell
forged committed records from real ones". `inline-dispatch-evidence.mjs`'s r63 shape arms
(`SESSION_HEADER`/`SESSION_TOOL_JOIN`/`SESSION_ROWGRAPH`/`SESSION_TEMPLATE`, L37-53) are this lane's
answer for *dispatch* evidence. v2 inherits the limit unstated: a hand-written transcript with the
right `session_init` + `model_change` + `message` rows scores as a real seat. Nothing in C1's kill
rule covers this (the H set is drawn from real transcripts only), and it is not a kill event — but
v2's header should say it, because v2 is about to become the tool round reports quote for seat
status.

**(d) A∩H independence holds by construction but is not asserted.**
`probe93-c1.py:82-93` (`draw_h`) selects `first_ts >= --after` with **no exclusion set**; the shared
`seen` list (L96-106, L223-227) feeds only `field_cover`/`thin`. A and H are disjoint only because
`sampleA` is pre-freeze by construction ("A the round-92 frozen stratified sample (pre-freeze real
transcripts)", `probe93-c1.py:6`), so a transcript can be scored in both sets with nothing
reporting it, if `sampleA` is ever regenerated post-freeze. Pre-data positive control reads
`HELD agree=221/221 A=61/61 F=16/16 H=120/120 W=24/24 h_pool=229 thin_fields=0`
(`controls/ctl-positive.txt`) — consistent with disjointness, not proof of it. Freeze-time finding
only; the counter is frozen and must not be edited.

**(e) Candidate unpublished at scan time.** `.ufo/waves/round-93/K93ExecTool/READY` absent
(`ls -la` shows `seat-route.mjs` 48682 B and `score1.txt` only; `candidate-status.txt`). Per the
seat spec this seat did candidate-independent work first, found no READY, and attacked the
oracle/positive control instead — items (a)-(d). The candidate was **not** attacked here.

---

## 6. Risks to C1 that this scan raises

1. **PROVINCE amendment is a kill-adjacent honesty surface, not paperwork.** v1 shipped in r92 while
   `PROVINCE.md:16` still said transcript content is out of scope. If v2 ships with that line
   unchanged, the capability row is admitted on a province statement the shipped tool contradicts —
   the same class as the r90/r91 "12/12 COMPLETE" overstatement this tool exists to end.
2. **Line-number churn.** Touching `PROVINCE.md` moves the `:32` kotoba route and the r79/r80
   additions; `cite-check.mjs` re-resolves `SKILL.md` and `corpus/**` citations but **not** sibling
   PROVINCE files, so the kotoba `PROVINCE.md:28` pointer will break silently unless repaired by hand
   in the same commit.
3. **Report contamination.** `dead` (v2) vs `error_unsettled` (mori) on one wave, quoted in one
   round report, is a contradiction a verifier will find. Cheap fix now: one sentence in v2's header.
4. **Registry drift.** Four `SKILL.md` rows + `corpus/README.md:272` + the knowledge entry's
   `recheck:` still name `probe92-c1.py` and the v1 field `errors`; the v1 field name surviving in a
   committed row while the record no longer carries it is exactly the D1 rename trap v2 is fixing.

---

## 7. Verification (commands, all read-only, re-runnable from the fleet root)

```
grep -rn --exclude-dir=.ufo --exclude-dir=.git --exclude-dir=corpus --exclude-dir=.jj \
  -E 'retryRecovery|supersededBy|upstreamProvider' . | grep -v '^./kumitate-shokunin/'
grep -rln --exclude-dir=.ufo --exclude-dir=.git --exclude-dir=corpus --exclude-dir=.jj \
  -E '\.omp/agent' . | grep -v '^./kumitate-shokunin/'
grep -n -E 'Member \*\*content\*\*|member content of|readdir \+ lstat' kumitate-shokunin/PROVINCE.md
grep -n 'kumitate' kotoba-shokunin/PROVINCE.md          # :70 cites kumitate PROVINCE.md:28 (now blank; text at :32)
grep -c -E 'model_change|stopReason|retryRecovery|session_init' \
  /home/vgpnk/Projects/shokuknow/merge/kumitate/{MERGE-REPORT.md,MERGE-REPORT.json,SOURCES.append.md}
```

Expected: first grep 0 lines; second lists mori/mado/tsukuroi/kotoba/tameshi instruments; PROVINCE
hits at 16 and 57-58; merge counts 0/0/0.

Scratch `/fast/scratch/hyaku/kumitate-r93/K93Connector/` removed on exit; no lane file outside this
seat directory and `w1/K93Connector.md` was written.
