# ConnMadoBind — 'bind' vocabulary disambiguation audit (kumitate r50)

Seat: ConnMadoBind (connector). Read-only on both lanes; no installs, no tools
added. Axes named: **operability**, **coverage**. One bounded proposal at the end.

## Verdict

`DISAMBIGUATION_ACCURATE` — the registry row's claim still matches both lanes'
current bytes. The mount-bind ↔ Hyprland-keybind split is recorded on three
committed kumitate surfaces and holds on the mado side unchanged since before
r49 flagged it. One genuine gap: this round's own in-flight knowledge entry
`corpus/knowledge/mount-order-and-bind-scope.md` (ScribeKnowledge) carries no
disambiguation — `grep -n -i 'mado|hyprland|keybind|mount binds'` over
`.ufo/waves/round-50/r50/ScribeKnowledge.md` (28 lines) returns zero hits, and
no mount/bind-named entry exists in `corpus/knowledge/` yet.

## Evidence — mado side (read-only)

- `mado-shokunin/tools/mado-binds.py:1-2` verbatim today: "Static resolver for
  the bind table of a Hyprland v0.56.2 config tree." — exactly the phrase the
  r49 citation recorded. sha256
  `0cda0e6ff5e2868bafbda28fff7227fb28d1ebfaaf69740a5e7de93f5bb41cf9`.
  `git -C mado-shokunin log --oneline -- tools/mado-binds.py` → `b6650d5`
  (round-27), `a496b02` (r26), `ef94763` (r25): last changed round-27, i.e.
  **unchanged across r49's flagging and since** — no drift.
- `mado-shokunin/PROVINCE.md:29` (tool-inventory row): `mado-binds.py` =
  "static prediction of the Hyprland v0.56.2 bind table a config tree builds".
  `PROVINCE.md:3-9`: domain is desktop & compositor craft (`~/.config/hypr/`
  keybinds, waybar, walker…). mado owns **no** sandbox/mount-namespace
  instrument; the guard's ground is uncontested (matches this round's
  ConnSiblingOverlap remit, not contested here).
- mado's keybind vocabulary lives in `corpus/knowledge/bind-table-r25.md`,
  `keybind-rule-semantics.md`; `mado-verify.sh` uses the `hyprctl … binds`
  read verb — in mado's province "binds" means keybinds.
- Reverse direction: `grep -rn 'bind-oracle|cap-run'` over mado-shokunin →
  **zero hits**. The disambiguation is one-directional (kumitate → mado),
  acceptable because kumitate coined the newer name (r49) over mado's r25 name.
- Fleet level: outside the lanes only `.ufo/reports/round-49/kumitate.md`
  mentions bind-oracle; fleet `MANIFEST.json` mado digests are keybind rounds.
  No shared fleet surface where the two vocabularies mix.

## Evidence — kumitate side (disambiguation inventory + collision surfaces)

| # | Surface | Wording | Disambiguated? |
|---|---|---|---|
| 1 | `SKILL.md:616` (gate registry row) | "requested **mount** binds — not the Hyprland `mado-binds.py` keybind file" | YES (primary) |
| 2 | `LOG.md:1972-1973` | "registry row now says requested **mount** binds and names the `mado-binds.py` Hyprland-keybind collision" | YES |
| 3 | `corpus/knowledge/counter-amendment-discipline.md:82-83` | "A lane file named `mado-binds.py` is Hyprland **keybind** config: this lane's registry row says 'requested **mount** binds' to avoid the collision." | YES |
| 4 | `.ufo/waves/round-49/r49/ConnSiblingOverlap.md:58-62,204-206` | origin record | YES (wave evidence, not committed corpus) |
| 5 | `SCORECARD.md:1738` (capabilities table row) | "compare the observed mount-point set with the requested binds" | **BARE** — mount context only, no mado note |
| 6 | `scripts/bind-oracle.mjs` header; `BIND_ORACLE: HELD binds=<n>` output token | mount-scoped, bare `binds=` | accepted: output token is regex-frozen by the B49/G50 counters; do not touch |
| 7 | **in flight this round**: `corpus/knowledge/mount-order-and-bind-scope.md` | ScribeKnowledge draft has no vocabulary note | **GAP** — the committed corpus's mount entry lands without it |

Collisions that need **no** action: #6 (machine token), mado's internal dual
usage (its own waves use `--ro-bind`/`/proc/self/mountinfo` field 5 as
*substrate* — r20 `SentinelHarnessNote.md:46-52` — while its tools are
keybind resolvers); inside mado the word already spans both senses and mado's
rows stay coherent because each names its object.

**Contradiction stated, not smoothed:** the *word* is the only collision, but
the *technique* genuinely crosses lanes — mado r20 proposed the same
mountinfo-field-5 membership check kumitate now cites as S099. The r49
ConnSiblingOverlap already records that prior art in wave evidence; it does
not need duplicating into the committed entry (whose provenance spec is
S095+S099+own-work). The note below claims name-twin only, not "no relation".

## Affected axes

- **coverage** (+): the committed corpus becomes self-disambiguating at the
  entry a 'bind' search lands on first, instead of only via the discipline
  entry and the SKILL registry.
- **operability** (unchanged): no code, no counter text, no pin bytes move.

## Proposed move (one, bounded — L1 integrates)

Add one informational line to the body of the in-flight
`corpus/knowledge/mount-order-and-bind-scope.md` (after its
`source:/verified-at:/recheck:` trio), and mirror two words into
SCORECARD.md:1738. Exact proposed line:

> Vocabulary: "bind" here is the mount(8)/`bwrap --bind` sense.
> `mado-shokunin/tools/mado-binds.py` and its `corpus/knowledge/bind-table-r25.md`
> (mado PROVINCE.md row: static Hyprland keybind-table prediction) share the
> word, not the object — this lane's registry row says "mount binds" for the
> same reason (round 49).

Secondary anchor (same move): `SCORECARD.md:1738` "the requested binds" →
"the requested **mount** binds".

## Risks

- Sibling bytes are outside this repo and unbindable by counters
  (`counter-amendment-discipline.md:84-85` already says so) — the line is
  informational, never a bindable receipt. Respect that on landing.
- Stale-quote risk if mado bumps Hyprland and rewrites its docstring: the line
  cites path + role, quotes nothing; entry `recheck:` cadence governs.
- `sources-check` (H1 item 697 class) enforces provenance headers on knowledge
  entries: the line goes in the body only; the trio comes from R50-10/ScribeKnowledge.
- No scored surface reads these bytes: G50's G1–G8 read cap-run/pins/proxy-check;
  C2 counts `corpus/README.md` rows, not entry bodies; the kumitate-gate-pins-v1
  stanza pins scripts' sha256s, not SCORECARD prose outside the stanza.

## Verification (for the L1 at close)

- `grep -n 'mado-binds' corpus/knowledge/mount-order-and-bind-scope.md` → 1 hit.
- `node scripts/sources-check.mjs` → 697-class still governed by the trio, not
  the new body line; `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`.
- `node .ufo/waves/round-50/probe/bindguard50-probe.mjs <lane> <rev>` →
  held count unchanged (guard surface untouched by this move).
- Optional drift watch: `sha256sum mado-shokunin/tools/mado-binds.py` vs the
  `0cda0e6f…` recorded above.
