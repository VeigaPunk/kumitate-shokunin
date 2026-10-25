VERDICT: The Gate block is drafted with three new rows re-opened and quote-verified (3/3 gate quotes, 11/11 entry bullets), one admit and six rejects with flips, the collision guard reproduced (136/155, `S195 S196 S197`), the 9-id quarantine carried, and four defects recorded — the largest being that S200 re-opens the document lane S067 already holds.

## Evidence

Run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin` unless a `cd` is shown. Lane HEAD
`dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (`git rev-parse HEAD`); `git status --porcelain` shows only untracked
round-64 scaffolding — no tracked file was modified.

**Sources re-opened 2026-10-25; live fetch byte-compared with the round's captures.**
```
$ for u in <three URLs>; do curl -fsSL -w 'HTTP=%{http_code} BYTES=%{size_download}\n' -o live-$n.html "$u"; done
HTTP=200 BYTES=47694  https://docs.jj-vcs.dev/latest/working-copy/
HTTP=200 BYTES=48988  https://docs.jj-vcs.dev/latest/technical/concurrency/
HTTP=200 BYTES=53233  https://firefox-source-docs.mozilla.org/contributing/jujutsu.html
$ sha256sum .ufo/waves/round-64/build/K64ExecCaptures/captures/*.html \
            .ufo/waves/round-64/build/K64ScribeEntry/captures/*.html
[6 lines, 3 distinct hashes, each appearing twice — both capture sets agree]
947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7  jj-working-copy.html
5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6  jj-technical-concurrency.html
abbe47cfa45e809694b224d0db0ea7d6b00e9846b94086d077aea0604db7b3d2  firefox-jujutsu.html
```
Those hashes equal my own live-fetch hashes, so the bytes J3 would pin are what I fetched.

**Quote verification under the frozen probe's own `norm()` (`.ufo/waves/round-64/probe/jj64-probe.mjs:56-64`,
copied byte-for-byte).**
```
$ node .ufo/waves/round-64/build/K64ScribeGateRecord/quote-check.mjs \
       .ufo/waves/round-64/build/K64ScribeEntry/jj-workspace-seat-containment.md
GATE S198 words=11 hit=true
GATE S199 words=22 hit=true
GATE S200 words=17 hit=true
[11 BULLET lines, every one hit=true, word counts 9–22 — full output in quote-check.txt]
BULLETS checked=11
QUOTE_CHECK: PASS
$ echo $?
0
```
Located-quote spans in the derived text captures: `jj-technical-concurrency.txt:170-171` (S198, § Operation log),
`firefox-jujutsu-contributing.txt:640-641` (S199, § Working with multiple workspaces at `:627`),
`jj-working-copy.txt:244-246` (S200, § Stale working copy at `:226`).

**Collision guard reproduced from the frozen files.**
```
$ cd .ufo/waves/round-64/assimilation && echo "reg=$(wc -l < reg-ids) staged=$(wc -l < staged-ids)"
reg=136 staged=155
$ comm -12 <(sort reg-ids) <(sort staged-ids); echo $?
S195
S196
S197
0
$ for i in S259 S270 S271 S280 S290 S291 S295 S309 S310 S311 S327 S338; do printf '%s reg=%s\n' "$i" "$(grep -c "^$i$" reg-ids)"; done
S259 reg=0 … S338 reg=0        (all twelve print reg=0)
$ git show HEAD:corpus/SOURCES.md | grep -cE '^\| S19[89] \|'
0
```

**Staged `source:` lines** (`grep -n '^source:'` over `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/`):
admitted pair — `jj-operation-log-and-seat-staleness-2026-10-25.md:2-3` (S290, S291 URLs) and
`jj-seat-staleness-outcome-2026-10-25.md:2` (S295 = the S198 URL paired with a round-12 transcript); rejected six —
`jj-workspace-as-isolation-substrate-2026-10-24.md:2` (S259 URL), `jj-seat-workspace-containment-2026-10-24.md:2-3`
(S270 URL, S271 transcript), `jj-shared-repository-seat-visibility-2026-10-25.md:2` (S280 transcript),
`agent-isolation-substrates-amendment-2026-10-25.md:2-4` (S309/S310 URLs, S311 transcript), `…-2026-10-26.md:2`
(S327 transcript), `…-2026-10-27.md:2` (S338 fleet-tree path). The six transcript/fleet paths (S271, S280, S295,
S311, S327, S338) all exist on disk; none is inside the lane repo.

**Lane ground checked for the reject reasons.** `corpus/knowledge/agent-isolation-substrates.md:149` = M7 ("jj
workspaces share one repository … Not demonstrated this round; no table row relies on it."); `corpus/SOURCES.md:80`
S067, `:117` S104 (RFC 8785), `:130` S117, `:137` S125, `:138` S127, `:140` S126, `:143` S134 (arXiv 2609.29095) —
every id the carried rejects name resolves to the row claimed, and `corpus/lessons/round-63.md:20-21` holds both
carried rows with their flips, quoted unchanged in the Gate.

## Findings

**K64ScribeGateRecord-1 — LOW. Two location cells in the C2 entry draft name headings that do not exist.** Attacks
CORPUS rule 1 / §2b.1 ("a ≤25-word quote with its location"): URL and quote are right, the locator is not. The
draft's S200 line says "§ Stale working copies" (heading is singular) and its S199 line titles the page
"Contributing to Firefox with Jujutsu" (page title is "Introduction to Jujutsu"). The Gate records the corrected
cells. Reproduce:
```
$ grep -c 'Stale working copies' .ufo/waves/round-64/build/K64ScribeGateRecord/captures/jj-working-copy.txt
0
$ grep -c 'Stale working copy'  .ufo/waves/round-64/build/K64ScribeGateRecord/captures/jj-working-copy.txt
3
$ grep -c 'Contributing to Firefox with Jujutsu' .ufo/waves/round-64/build/K64ScribeGateRecord/captures/firefox-jujutsu-contributing.txt
0
```

**K64ScribeGateRecord-2 — MEDIUM. S200 re-opens a document the lane already holds as S067, and the census cannot
see it.** Attacks the one-row-per-document discipline that rejected `exactly-once-attribution.md`. S067
(`corpus/SOURCES.md:80`) is the same working-copy page at tag `v0.45.1`
(`raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md`, body sha256
`20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea`, opened 2026-10-23, used-by
`agent-isolation-substrates.md`); S200 is `latest`, a later version of that page — S200's first quote occurs
byte-identically in the v0.45.1 bytes and the release paragraph differs only in wording. URLs differ, so
`sources-census.sh`'s W04 duplicate-URL warning stays silent. The Gate records the relationship; the row's
`teaches` should say "version re-open", or the entry should cite S067 and accept a J2 MISS. Reproduce:
```
$ curl -fsSL -o /tmp/s067.md https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md
$ sha256sum /tmp/s067.md
20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea
$ grep -c -F 'You can have multiple working copies backed by a single repo.' /tmp/s067.md
1
```

**K64ScribeGateRecord-3 — LOW. Five of the six rejected candidates rest on rows that cannot satisfy J2's URL cell,
and one hides a transcript behind a documentation URL.** Attacks the row-as-a-claim contract. Staged
S271/S280/S311/S327/S338 are `own-work` rows whose carriers are absolute paths under
`/home/vgpnk/Projects/shokuknow/lanes/…` or `/home/vgpnk/Projects/ufo-fsd-alpha/…` — outside the lane's
`git archive`, so J2 (`a URL`) MISSes and J3/J4 have nothing to bind; S295's cell pairs the concurrency URL with a
round-12 transcript, duplicating S198's document while putting the measurement outside the pinned bytes. This is
the precise reject reason the Gate gives each candidate, with a flip naming what would make it adoptable.
Reproduce: `grep -n '^source:' <staged file>`; all six transcript/fleet paths are PRESENT on disk and all are
outside `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

**K64ScribeGateRecord-4 — LOW (frozen file; reported, not patched). The quarantine slice's four "unreachable" lines
carry a stray backtick on the id.** `cat -A` shows `S143\`` / `S144\`` / `S145\`` / `S178\`` where the five
`payload-absent` lines wrap the reason in backticks. A whitespace-then-backtick parser reads the id as `S143\``; an
id-keyed parser is unaffected. Reproduce:
`cat -A .ufo/waves/round-64/assimilation/quarantine-slice | sed -n '6,9p'`.

## Artifacts

- `.ufo/waves/round-64/build/K64ScribeGateRecord/gate.md` — the `## Gate` block for the L1 to install into
  `corpus/lessons/round-64.md` (85 lines; three `@@NAME@@` fields: `@@DEMO_RECEIPT@@`, `@@ENTRY_SHA256@@`,
  `@@COLLISION_NEG_CONTROL@@`; last line `spot-check: pending non-author`).
- `.ufo/waves/round-64/build/K64ScribeGateRecord/quote-check.mjs` + `quote-check.txt` — re-fetches the three URLs,
  applies the probe's `norm()`, checks the three gate quotes and all 11 entry bullets; exit 0 on pass.
- `.ufo/waves/round-64/build/K64ScribeGateRecord/captures/{jj-technical-concurrency,firefox-jujutsu-contributing,jj-working-copy}.txt`
  — text derivations of the captures, cited by line span (sha256 `43bb76bf…`, `ee356990…`, `784af381…`).
- Scratch `/tmp/kumitate-r64/K64ScribeGateRecord/` (live HTML, S067 pinned doc). No product file, registry, pin,
  corpus file or frozen artifact was edited.

## Limits

- I did **not** run `scripts/jj-seat-demo.sh` or verify the 15 demo outcome keys; the ADMIT row cites the draft's
  key list (`:65-79`) and leaves the run receipt as `@@DEMO_RECEIPT@@` — J6 is the counter's job.
- I did not install or verify `corpus/knowledge/jj-workspace-seat-containment.md` (L1 owns it); its committed sha256
  is `@@ENTRY_SHA256@@`.
- I did not run the collision guard's negative control (indented `  | S002 |` fixture); the Gate points at
  `@@COLLISION_NEG_CONTROL@@` for that seat evidence.
- I did not run `sources-census.sh validate` or the round census; the registry count in the Gate comes from
  `assimilation/reg-ids` (136) and `git show HEAD:corpus/SOURCES.md`, not a census transcript.
- I read the two carried rejects from `corpus/lessons/round-63.md:20-21` and confirmed the rows they name; I did not
  re-open their underlying sources (round 63 did).
- No package install or tool upgrade was needed; nothing was installed.
- No non-author has verified this block.
