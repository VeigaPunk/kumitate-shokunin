# K92ScribeSources — round-92 C1 sources and knowledge draft

Seat: leaf scribe. Writable surface used: `.ufo/waves/round-92/K92ScribeSources/` plus this Report path
and scratch `/fast/scratch/hyaku/kumitate-r92/K92ScribeSources/` (removed before yield). No lane file was
written; the lane is read-only from this seat.

## Behaviour produced

1. Three sources re-opened by curl at the pinned commit and byte-compared to the lane captures.
2. Rows S266/S267/S268 drafted in the 11-column Registry schema, with no `|` inside any cell (NF=13 on
   all three).
3. 21 located quotes, every one verified as a verbatim substring of the capture line (max 20 words).
4. `seat-route-from-session-transcripts.md` drafted with the `source:` / `verified-at:` / `recheck:`
   front matter, the routing model, the frozen field definitions in plain words, the Amendment-44 trap,
   measured pre-data controls, and limits.
5. Scratch-mirror census validation: exit 0 (only the seven pre-existing W04 URL warnings, identical to
   `open/census-start.txt`); a mutated-copy negative control proves the validator parses S266
   (`E07 S266 status=minedx`, exit 1).

## Commands and outcomes

- `curl -fsSL https://raw.githubusercontent.com/can1357/oh-my-pi/79fa222e8390aed3494f4bc6746814e6c74c21cf/<path>`
  for `docs/session.md`, `packages/coding-agent/src/session/session-entries.ts`, `packages/ai/src/types.ts`
  → sha256 `6a7a2375…`, `4035dad3…`, `22ea739a…`, all equal to `.ufo/waves/round-92/open/sources-fetch.txt`
  and to the lane captures. Receipt: `fetch.txt`.
- `python3` verbatim-quote checker over `quotes.md` vs `.ufo/waves/round-92/open/*` → `quotes checked: 21
  max words: 20 mismatches: 0`.
- `cp -a corpus <scratch>/corpus`; rows inserted after the Registry's last row (before `## Paths`);
  `sources-census.sh validate --today 2026-11-06 --file <scratch>/corpus/SOURCES.md` → `exit=0`,
  `file ok`. Receipt: `census-validate.txt`.
  The corpus-only mirror first read exit 1 because 21 pre-existing used-by targets (`scripts/…`,
  `SKILL.md`, `.ufo/…`) live outside `corpus/`; symlinking those three lane entries into scratch made the
  baseline reproduce `open/census-start.txt`'s exit 0. This is a mirror artifact, not a row defect.
- Negative control on a mutated copy: `E07 S266 status=minedx`, `exit=1`. Receipt:
  `census-validate-negative.txt`.

## Findings (scoped, for the L1)

- **`upstreamModel` is outside the frozen definitions.** types.ts:1335-1341 (S268) says `upstreamModel`
  is the concrete model that produced a turn when a router reports it, and is compared against `model`
  "to notice a gateway serving something other than what was requested". The definitions derive
  `answered` from `provider + "/" + model`, so a rerouting gateway still reads as the requested id.
  Recorded in the draft's Limits with `[INFERENCE]`. Routed, not a kill-rule event.
- **Errors outside turns.** `model_usage` rows carry `stopReason`/`errorMessage` but are usage accounting,
  "not model messages or transcript turns" (session.md:214-219, S266). A seat whose only failures are
  `model_usage` rows reads neither `errors` nor `dead`. Routed.
- **Synthetic aborted turns.** A resumed non-terminal tail appends an assistant message with
  `stopReason: "aborted"` (session.md:339, S266), so `aborted` can count a turn no provider ran.
- **Install dependency.** `used-by corpus/knowledge/seat-route-from-session-transcripts.md` must be
  installed in the lane before the rows are validated there, else E11 fires for S266-S268. The draft is
  in this seat dir; installation is L1's move.
- **READY state.** At 15:53 the candidate `seat-route.mjs` existed with `sha256.txt` but
  `.ufo/waves/round-92/K92ExecTool/READY` was absent; no candidate score is claimed or implied.

## Out of scope / not done

- No writes to `corpus/`, `scripts/`, `probe/`, `controls/`, `plan.md`, or any lane file; no candidate
  attack or scoring; `corpus/lessons/round-92.md` `## Mistakes` not written by this seat.

## Artifacts (all under `.ufo/waves/round-92/K92ScribeSources/`)

- `rows.md` — sha256 33cd8c7b2ea6520e9f0a1c77ecfde7b0ed12e73e6163f46724e67c98f6d1cd12
- `quotes.md` — sha256 bd16bcfbf9a615f708ac9128c1c6dfed9f3c61d1abfe54bb95fd537533cc3c19
- `fetch.txt` — sha256 f33ac268517886e657d72f28b93377131be41f42cfb1a6d6c99b5fa64ccbc0ee
- `seat-route-from-session-transcripts.md` — knowledge draft (sha256 in the terminal yield)
- `census-validate.txt` — exit 0; `census-validate-negative.txt` — E07 negative control
