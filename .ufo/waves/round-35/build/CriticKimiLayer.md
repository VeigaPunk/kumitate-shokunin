CRITIC_C3 verdict=admissible tests=7

Scope: claim C3 (K1 3->4, root `~/.kimi-code/mcp.json` SHAPE-ONLY, census DRIFT->CLEAN, K 50/50 -> 51/51, score 10 held). Lane 1770305f, read-only review; commands run are listed per test.

## A. Coverage move or bookkeeping?

Score-neutral by design (10 held, floor(10*51/51)) — but NOT bookkeeping:
the live census DRIFT (`.ufo/waves/round-35/baseline/kimi.txt:13-16`,
`UNLISTED mcp.json`, exit 1) is a failing checklist item (baseline
checklists.txt item 628 FAIL). Declaring restores CLEAN only in the state
where the member is present AND gated: before the change, deleting mcp.json
makes the gate *healthier* (stray disappears); after, `MEMBER_MISSING` fires.
That is new protected surface — the same class as the round-20 K5 residue
family (SCORECARD.md:141), which was judged a coverage move.

## B. Pre-registration — verified clean

- `SCORECARD.md:437-449` `## Planned` item 1, dated 2026-10-19 "written by
  round 34": names the member, the shape-only pattern, the three artifacts
  that travel together (tool MEMBERS + FROZEN K1 4, proxy K rules, stanza
  `K_members` 50->51), and its own falsifier (census not CLEAN, content open
  under strace, K_sections != 51).
- `corpus/lessons/round-34.md:22` records the move was proposed in round 34
  and REFUSED in-round per the registry rule (SCORECARD.md:913-916); held to
  round 35 exactly as the rule demands. Provenance is clean — this is the
  textbook-compliant path, not a slipped registry change.

## C. Attack: CLEAN by suppressing UNLISTED instead of declaring

Mechanically reachable — `kimi-census.mjs:353-357` (stray pass) or
`RE_CHAIN` at :101 could be widened — but detectable and insufficient:

1. `RE_CHAIN = /^config\.toml(\..+)?\.bak$/` does not match `mcp.json`;
   exempting it requires a visible regex/exemption diff.
2. Suppression leaves `FAMILY K1 members=3` and `TOTALS: members=50` —
   fails the claimed K1=4/51 signature (verified: `runVerify` computes
   from MEMBERS, census.mjs:252-323).
3. `proxy-check.mjs` independently re-derives `K_members` from its own
   `K_MEMBER_RULES` (:339-390, `kMembers` :620-652) — no import from the
   census. Suppress-only leaves proxy computing 50 vs stanza 51 ->
   `K_MEMBERS_DRIFT`, so the proxy checklist item fails. Honest 51
   requires the member entry in BOTH rule tables.
4. Selftest pins the arm: `notes.txt` stray case at :702-715 and the
   polarity-pinned mcp.json case at :716-727 (asserts `UNLISTED`,
   `rootStrays[0]==='mcp.json'`, `members===50`).

Refutation test T1 (suppress-or-declare discriminator) — integrator:
  `node scripts/kimi-census.mjs` must show `FAMILY K1 members=4`,
  `TOTALS: members=51 checked=51`, `INFO ROOT_ENUM ... strays=0`, AND
  `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src` must
  print `K=51/51` with `pins=N match`. CLEAN alone is necessary, not
  sufficient.

## D. Does shape-only say anything about content?

No — `m.secret` members get kind + mode floor via `lstatSync` only
(census.mjs:295-317); the file is never opened (contract also forbids us
reading it). So MCP server additions/removals/repointings inside mcp.json
are invisible — a real residual. It is consistent precedent (server.token,
credentials/, oauth/ at :128-132 use the same arms), but mcp.json is a
command-exec surface, arguably the most security-relevant K1 member, and
it is live mode 0644 (`stat -c '%a' ~/.kimi-code/mcp.json` -> 644,
249 bytes, mtime 2026-10-15). The axis record SHOULD name this limit in
the Axes row (the round-19 entry names the secrecy discipline;
`kimi-mcp-plane.md` already marks content UNKNOWN by design, lessons
round-34:60-61).

Refutation test T4 (secrecy, also SentinelK1Secrecy's lane):
  `strace -f -e trace=%file node scripts/kimi-census.mjs --root <fixture-with-mcp.json> 2>&1 | grep -c 'open.*mcp\.json'` -> 0
  (precedent: lessons/round-34.md:61 "strace: 0 opens"; the selftest
  secrecy canary at :644-676 uses a FIFO to prove never-read — the
  executor should extend that canary to mcp.json if declared secret).

## E. Moved/renamed mcp.json — caught?

Yes on every mutation class once declared (kind file, root member):
- deleted/renamed-away: `MEMBER_MISSING mcp.json` (:273-275).
- renamed `mcp2.json`: MEMBER_MISSING + `UNLISTED mcp2.json` (:354-356).
- `mcp.json.bak`: `RE_CHAIN` (:101) requires `config.toml` prefix — no
  match -> UNLISTED. Not silently exempt.
- moved under `server/` etc.: MEMBER_MISSING; the subdir is not a
  declared-children enumerable (ENUMERABLE :140-145 lists only
  agents/secondary, skills, plugins, plugins/managed), so it is not also
  UNLISTED — correct, not a gap introduced by this member.
- kind-flip to dir: MEMBER_MISSING (non-secret) or SHAPE_DRIFT (secret,
  :296-301).

Refutation tests T2/T3 on a fixture copy:
  `cp -a` a fixture root -> `mv mcp.json mcp2.json` ->
  `node scripts/kimi-census.mjs --root <f>` => exit 1, kinds include
  MEMBER_MISSING(mcp.json) AND UNLISTED(mcp2.json), `members=50`.

## F. Executor traps that falsify sloppy implementations (the risky part)

1. `secret: true` is the ONLY path that enforces a mode floor
   (:307-317). Claim says "presence, kind, mode floor" (server.token
   pattern) -> executor must declare `secret: true, modeFloor: 0o600`.
   Two consequences to accept explicitly: (a) floor is a bit-mask, not a
   ceiling — 0644 passes a 0600 floor; (b) `secret` loosens kind to
   `isLeaf` (:296, :209) — a SYMLINK mcp.json passes both gates
   (proxy mirrors this at :640-642). If symlink-tolerance is unwanted,
   shape-only + mode floor + exact kind 'file' needs a code change, not
   just a table row — pick one, don't silently get the loose kind.
   T6: `chmod 0400` fixture mcp.json -> `SHAPE_DRIFT ... lacks the 0600
   floor` (honest-by-design noise if a user tightens the file).
   T7: `ln -s /etc/passwd mcp.json` in fixture -> currently PASSES
   (isLeaf + lstat mode 777). Name it in the round record or gate it.
2. Stale-literal sweep is load-bearing — selftest encodes the OLD world:
   :516 green verdict `members=50`, :526-533 `members===50`,
   `K1.members===3`, `frozen.K1===3`, `j.members.length===28` (->29),
   :711 `members===50`, :723 the mcp.json-stray case (must be INVERTED
   to a member-presence case, not deleted — deleting it removes the only
   selftest coverage of the new member), plus usage text `(50 members)`
   (:161), header `:84`, FIXTURE comment :434, `FROZEN.K1` :149,
   `INFO ROOT_ENUM declared=25`->26 (kimi.txt:12). Selftest green after
   partial literal updates is the classic falsifier — the fixture is
   generated FROM MEMBERS (:436-447) so a member-row-only change + no
   selftest update => instant red, which is good.
3. `proxy-check.mjs` `K_MEMBER_RULES` must gain the matching entry or
   `K_members` computes 50 -> K_MEMBERS_DRIFT against stanza 51.
4. K_sections binding is free and unambiguous: `## \`~/.kimi-code/mcp.json\``
   exists in `corpus/knowledge/kimi-mcp-plane.md:21`; basename `mcp.json`
   is owned by exactly zero/one member (byBasename :645-650) -> binds
   clean, K_sections 50->51 with no K_SECTION_AMBIGUOUS. Verified: no
   other `## ` heading in any kimi-*.md names `mcp.json`
   (`grep -rn '^## ' corpus/knowledge/kimi-*.md | grep -i mcp` -> only
   kimi-mcp-plane.md section headings, none containing the basename
   outside :21).
5. claims-check never sees K rows — `--row K1` -> ROW_UNKNOWN (exit 64,
   observed; registry is S1-S8 R1-R11 only). So the K1 registry row
   (SCORECARD.md:137) members-cell text should still be updated to name
   mcp.json (K1 is "kimi config plane"; mcp.json is config) — cosmetic
   honesty, not gate-blocked, but the pre-registration says tool+stanza+
   Axes travel together; the row cell is part of that package.
6. `pin.kimi-census` stanza re-pin required (sha changes on MEMBERS
   edit); `K_members` term key 50->51; Axes row :311 rewrite.

## Verdict

admissible — pre-registration is airtight (SCORECARD.md:437-449 +
lessons/round-34.md:22), the move adds real gated surface (absence and
rename become findings, not silence), the suppression shortcut is
detectable by the three independent counters, and content-blindness is
declared precedent with a documented residual. The risk edge is executor
discipline (secret-flag side effects, ~10 stale literals, dual rule
tables), all covered by T1-T7 and the selftest suite if case :718 is
inverted rather than dropped.
