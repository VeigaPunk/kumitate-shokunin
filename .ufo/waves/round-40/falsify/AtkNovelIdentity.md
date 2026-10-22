RESULT AtkNovelIdentity rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=bypass attempts=2 accepted=2

# C1 free attack — anchor identity surface (token-swap on a stable raw@path)

## Defect
`compareBase` / `compareOpen` reconcile base-true and open-true anchors by **identity
`raw@path#occurrence` only**. The identity never includes the pinned token
(`identities()` builds `${e.raw}@${e.path}#${n}`; the token is deliberately excluded,
scripts/anchor-truth.mjs:456-465). The write-path guard against re-paired tokens exists
(PIN_REGRESSION by ordinal, AT20), but the **check path** (`--base`/`--open`) has no
equivalent: a `pair` anchor whose `raw@path` and `expect:true` are preserved but whose
**token is swapped to a different identifier that also occurs on the cited line** passes
every floor. The documented symbol's verification is silently dropped; `true` count holds.
- key loop (compareBase): base key `path|oldtok|k` is absent from the current map (re-keyed
  to `path|newtok|k`) so `now.get(e.key)` misses — no DEBT_GREW (scripts/anchor-truth.mjs:481-485).
- identity loop: `raw@path#occ` still present and still `true` — no BASE_TRUE_LOST
  (scripts/anchor-truth.mjs:490-499).
- group loop: non-true count per `raw@path` unchanged — no BASE_TRUE_LOST
  (scripts/anchor-truth.mjs:503-517). Same for compareOpen (DEBT_NEW guards debt only).
- checkNote: pin token == note's re-paired symbol (no TOKEN_FORGED), token on line (no
  REGRESSED) (scripts/anchor-truth.mjs:445-449).

## Attempt 1 — BYPASS (loss of a true claim), note `remaining-scripts-census.md`
Target #29: `` `runBeat` (`scripts/charter-scribe/sync.mjs:604`) `` — line 604 is
`async function runBeat(argv = process.argv.slice(2)) {`. Swap `runBeat` -> `process`
(co-located, generic) in note + pin entry #29 (token + key). The paragraph documents the
charter-scribe beat entry point; after the edit `runBeat` occurs 0 times in note and pin.
Command (rev 1530a755, clone):
  node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9 \
    --open f69817edf687c8ce4f87ed7953a353399232f69e --src /fast/scratch/hyaku/kumitate-pin/src
Observed:
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af... open=f69817ed... src-rev=31c465f15669)
  exit=0
  runBeat in note AFTER: 0 ; runBeat in pin AFTER: 0
Diff: 2 files, 3 insertions / 3 deletions. Patch applies clean onto the round-open
revision f69817edf687c8ce4f87ed7953a353399232f69e (git apply --check -> APPLY_CLEAN_vs_f69817e=yes).
Recipe: /fast/scratch/hyaku/kumitate-r40/seats/AtkNovelIdentity/attack1-token-swap.mjs
Patch:  /fast/scratch/hyaku/kumitate-r40/seats/AtkNovelIdentity/AtkNovelIdentity-attack1.patch

## Attempt 2 — BYPASS (systemic, bare `:N` form, different note `route-probe-cluster.md`)
Target #9: bare `` `:1157` `` resolving through the heading to
`scripts/probe-ufo-route-health.mjs`; line 1157 is `async function main() {`. Swap the
documented entry point `main` -> `async` in note + pin entry #9 (token + key). After the
edit `main` occurs 0 times in the note.
Observed (same command, rev 1530a755):
  TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 base=e18ff1af... open=f69817ed... src-rev=31c465f15669)
  exit=0 ; `main` in note now: 0 ; key collision 0
Recipe: /fast/scratch/hyaku/kumitate-r40/seats/AtkNovelIdentity/attack2-barewN-swap.mjs

## Breadth
A scan of every `pair`+`true` pin entry whose cited source line carries a second
distinct lowercase identifier (len>=4, not the token's own id) found **600 candidate
anchors** across the four notes — any one can have its documented symbol silently traded
for a co-located token while the gate stays CLEAN. Both the `scripts/foo:N` and bare `:N`
anchor forms are affected; the edit touches only the symbol text in the note and the
`token`+`key` of the matching pin entry, so `ANCHOR_SET_CHANGED`, `REGRESSED`,
`TOKEN_FORGED`, `DEBT_GREW`, `BASE_TRUE_LOST`, `DEBT_NEW` and `CHECKED_SHRANK` all stay silent.

## Impacted axis / claim
C1 operability. The declared property is that the open-bound gate refuses named identity
attacks while benign edits stay CLEAN. This is a novel identity attack the gate does NOT
refuse: a verified true claim is removed from the corpus with the base and open floors
reporting CLEAN and an unchanged true-count, which is exactly the silent-loss class the
`--base`/`--open` floor is built to block. The FLOOR_PROBE2 suite (attacks_accepted=0/26)
does not include a token-swap-on-stable-identity case, so this bypass is uncovered.

## Smallest safe correction
Carry the token in the floor reconciliation: in `compareBase`/`compareOpen`, for every
anchor `true` at base/open, require the current same-identity anchor to keep the **same
token** (or record a BASE_TRUE_LOST / a dedicated TOKEN_DRIFT when a base/open-true
anchor's token changes). Equivalently, fold the token into the identity used by the floor
loops (not just the write-path ordinal guard). Add a selftest fixture: a base-true pair
anchor whose token is swapped to another on-line identifier must read a finding, not CLEAN.

## Tooling
No tools installed or upgraded; node already present. Read /home/vgpnk/.omp/agent/RULES.md
not required for any install (none performed).
