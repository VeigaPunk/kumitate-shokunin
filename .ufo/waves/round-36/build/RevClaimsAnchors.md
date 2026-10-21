REV claims-anchors gate=2059 arm=1516 delta-classes=prose-bare,prose-path,compound-span,embedded-span

# Claims-gate anchor/symbol grammar vs FIDELITY v1 (read-only)

Basis: lane HEAD `0614092e` (notes extracted via `git archive HEAD SCORECARD.md corpus` → `/tmp/r36-head`; the working tree was mutating at 02:28-02:29), pin `/fast/scratch/kumitate-r36/src` @ `31c465f15669f744848bd9f5d56191c5085670f7`, claims-check unmodified by this wave. `gate=2059` is the gate's own `sum(sections[].anchors)` over its 175 row-sections; S2 and S5 both claim `failure-telemetry.md`, so its 22-anchor section counts twice (distinct `(note,heading)` = 2037). `arm=1516` is the FIDELITY-v1 universe on the same per-row basis (distinct = 1494). Delta = 543 in four gate-only classes; **arm-only = 0**.

## 1. Grammar, quoted with path:line

`scripts/claims-check.mjs:100-104`
```js
const RE_CHUNK_HEAD = /^`([^`]+)`/;
const RE_EXT = /\.(?:mjs|js|sh|rs|timer|service|json|md|toml|yml)$/;
const RE_PATHISH = /(?<![\w./:-])([A-Za-z0-9_][\w./-]*):(\d+)(?:-(\d+))?/g;
const RE_BARE = /(?<![\w:.-]):(\d+)(?:-(\d+))?/g;
const RE_SYMBOL = /`([^`\n]+)`/g;
```

`backticks()` — `scripts/claims-check.mjs:192-199`
```js
function backticks(text) {
  const out = [];
  RE_SYMBOL.lastIndex = 0;
  let m;
  while ((m = RE_SYMBOL.exec(text)) !== null) out.push(m[1]);
  return out;
}
```

`sectionBodyChunks()` — `scripts/claims-check.mjs:293-296`
```js
function sectionBodyChunks(noteText) {
  const parts = noteText.split(/^## /m);
  return parts.slice(1).map((p) => p);
}
```

Liveness rule — `scripts/claims-check.mjs:366-380`
```js
while ((m = RE_PATHISH.exec(bodyNoHead)) !== null) {
  const resolved = ctx.resolve(m[1]);
  if (resolved.length === 1) anchors.push([resolved[0], Number(m[2]), Number(m[3] ?? m[2])]);
}
RE_BARE.lastIndex = 0;
while ((m = RE_BARE.exec(bodyNoHead)) !== null) anchors.push([own, Number(m[1]), Number(m[2] ?? m[1])]);
const ownAnchors = anchors.filter((a) => a[0] === own);
const live = ownAnchors.some(([, a, b]) => a >= 1 && b <= lines.length && a <= b
  && lines[a - 1].trim() !== '' && lines[b - 1].trim() !== '');
if (ownAnchors.length === 0) add('error', 'SECTION_NO_ANCHOR', ...);
else if (!live) add('error', 'SECTION_DEAD_ANCHOR', ...);
```

Symbol rule — `scripts/claims-check.mjs:382-384`
```js
const symbols = backticks(bodyNoHead).filter((t) => !/[/\\:.\s]/.test(t) && t.length >= 3);
const symbolHit = symbols.some((s) => lines.some((l) => l.includes(s)));
if (!symbolHit) add('error', 'SECTION_NO_SYMBOL', ...);
```

In-family rule — `scripts/claims-check.mjs:256-273` (familyPatterns + branches, glob line elided)
```js
function familyPatterns(membersCell) {
  return backticks(membersCell).filter((t) => !/\s/.test(t) && !t.includes('|') && (t.includes('/') || t.includes('*') || RE_EXT.test(t)));
}
// inFamily: for each pattern p …
if (p.endsWith('/')) … if (rel.startsWith(p) || rel.includes(`/${dir}/`) || base === dir) return true;
if (p.includes('*')) { if (globMatch(p, base) || globMatch(p, rel)) return true; continue; }
if (p === rel || pathBasename(p) === base) return true;
```
It is only a warn here; the layer consumer counts solely `inFamily === true` (`scripts/proxy-check.mjs:599-601`: `if (s.inFamily === true && typeof s.file === 'string') sections[layer].add(s.file);`).

Supporting grammar: a chunk is a section only if `RE_CHUNK_HEAD` fires and the token contains `/` or matches `RE_EXT` (`:345-349`); the heading line is then stripped (`bodyNoHead = body.slice(body.indexOf('\n') + 1)`, `:369`), so heading anchors count nowhere. Resolution (`:285-288`): a token with `/` must equal an origin-relative path exactly; a bare basename resolves only if unique by basename. Both anchor regexes run over **raw** `bodyNoHead`, backticked or not; `RE_PATHISH` counts only when it resolves uniquely *and* to the section's own file (`ownAnchors`, `:376`); `RE_BARE` is assigned to `own` unconditionally.

## 2. What the gate checks

- **Anchors:** existential only — “≥1 own anchor is live” (inside file, `a<=b`, both endpoint lines non-blank). Per-anchor counts are printed, never gated: 100 dead + 1 live passes.
- **Symbols:** one filtered backticked token per section, anywhere in the file, need not be near any anchor. Tokens containing `/ \ : .` or whitespace are invisible to the filter.

## 3. What FIDELITY v1 adds

Universe: only the member sections the gate parses; anchors are **whole backticked spans** that are a bare `:N[-M]` or a `path:N[-M]` resolving uniquely to the section's own file. Per anchor it adds a symbol predicate: adjacent span on the same note line (next starting ≤14 chars after, else previous ending ≤14 before), not an anchor, not path-like, trimmed length ≥3, not only punctuation/digits; `ok` iff that symbol occurs in lines N..M. Net: per-anchor symbol-on-range, per-note accounting, per-note ratchet. It adds **no anchor class** — every arm anchor is a whole span preceded by a backtick, satisfying both lookbehinds, so arm ⊆ gate textually.

## 4. Delta classes: gate-counted, arm-invisible (543 = 2059 − 1516)

| class | n | example |
|---|---|---|
| `prose-bare` | 477 | `ops-watchers.md:51` — `:889`, `:890`, `:892`, `:893` outside backticks; `:95` — `:1305, argv walk at :1308).` |
| `prose-path` | 58 | `native-judge-pipeline.md:196` — `Probe: \`judge_handoff\` (crates/ufo-core-runtime/src/native.rs:470-613)` |
| `compound-span` | 5 | `test-inventories.md:53` — `:11064/:11101/:11136` (3); `native-transcript-ledger-seats.md:107` — `native_admission_rules.rs:62-72/:107-111`; `runtime-support.md:65` — `"parallel_cap":0` (gate reads `:0`) |
| `embedded-span` | 3 | `ops-watchers.md:174` — spans ` (:487, ` and `, :489), then consumes `; `native-transcript-ledger-seats.md:14` — ` (:318-336) borrow-parses every line into ` |

`prose-*` is deliberate house style: `scripts/claims-check.mjs:842` `check('un-backticked parenthesised anchor counts (runtime-note house style)', ...)` with fixture ``The mark `ALPHA_MARK` (scripts/a.mjs:3) is set.`` Any span-only arm cannot be a superset. **Vice versa: none.** An arm anchor is a span `` `:N` `` or `` `path:N` ``; the preceding backtick satisfies `RE_PATHISH`'s `(?<![\w./:-])` and `RE_BARE`'s `(?<![\w:.-])`, and the path text equals the span text, so the gate emits the same match at the same offset (measured 0). Shared blind spot: alias paths like `src/native_schema.rs:107` (`native-judge-pipeline.md:20`) resolve under neither grammar (the index holds `crates/ufo-core-runtime/src/...`).

## 5. Predicate deltas (same anchor, different verdict)

- Gate symbols are file-wide; the arm's must sit on the cited range. At HEAD 902 arm anchors pair a symbol; 163 of those symbols contain `/ \ : .` or whitespace and are invisible to the gate's filter (e.g. `sighting-wall.md:49` pairs `LOCK_TIMEOUT_MS = 10_000`; `native-trial-launch.md:831` pairs `BLOCKED: …`).
- The arm's `dead` tests only range-outside-file or `N>M`; it ignores blank endpoints. Three arm-`ok` anchors land on a blank endpoint, which the gate's `live` rejects: `ops-watchers.md:282` `:43-48`, `cost-and-profile.md:153` `native_profile.rs:240-257`, `runtime-remainder-census.md:302` `.../provenance.rs:174-176`.
- 34 of 175 sections (308 gate anchors, all gate-live) have **zero arm anchors**; in 37 sections the gate is live while no arm anchor is live. `native-judge-pipeline.md`: 119 gate anchors, 9 sections, 0 arm anchors, so the arm emits no line for it.

## 6. Consequences for the integrator

1. **Not a superset as specified** — 73.6% of gate matches, 0/34 ghost sections. To become one, expose and consume the gate's already-computed raw `anchors`/`ownAnchors` and pair prose anchors by character distance; the span-only universe leaves 543 anchors and whole sections outside the claim.
2. **Do not copy the prototype's section finder.** Its `heading.includes(...)` match invented 7 anchors for `native-judge-pipeline.md` from non-member headings (`native.rs` matched ``## Judgment order — `native.rs::judge_handoff` (:470)``; `native_contract.rs` matched ``## Contract-hash mechanism (`native_contract.rs`)``). Use chunk order or return bodies from `probeSections`; that note then correctly prints no NOTE line (17 note lines at HEAD, not 18).
3. **Dedupe across rows.** `failure-telemetry.md` is claimed by S2 and S5; per-row iteration doubles its section (44 anchors / 22 nonok vs 22 / 11). “One line per note” requires dedupe by `(note,heading)`.
4. **The prototype before is prototype-specific.** Contract-faithful resolver + chunk parse reads `anchors=1516 ok=338 elsewhere=487 absent=96 dead=168 noid=427 nonok=583` (per-row; deduped `1494/330/476/96/168/424/572`), not `1530/340/492/96/173/429/588`. Cause: its basename-suffix resolver admits `src/...` paths the gate rejects, plus the substring section match. The after target (nonok=0) is unaffected, but ceilings/seeds taken from 1530/588 will not reproduce.
5. **C2 heading form.** Eligibility requires `/` or `RE_EXT` (`:349`), so ``## `bounded_fs` `` is silently not a section. The in-flight sections use `crates/ufo-core-runtime/src/<file>.rs` tokens; all 9 read `inFamily=true, live=true, symbolHit=true`. Arm visibility: `local-ship.md` 42/42 gate anchors, `native-admission-detail.md` 38/39 — the extra is `:02` from `` `{role}-{:02}` `` at `native-admission-detail.md:97`, a gate false anchor the arm correctly ignores. Both notes read arm `nonok=0` as of 02:29.
6. Re-run after integration: the working tree was edited during this review (`local-ship.md` 02:29:04, `native-admission-detail.md` 02:28:56).

## Commands run (read-only)

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`
- `git archive HEAD SCORECARD.md corpus | tar -x -C /tmp/r36-head`
- `node --input-type=module -e 'import { probeSections } from "./scripts/claims-check.mjs"; ...'` (re-derived the regexes, gate resolver, chunk pairing and arm pairing; cross-checked `sum(sections[].anchors)=2059`, distinct gate 2037, arm 1494, delta 543)
- `grep -n` / `sed -n` on `scripts/claims-check.mjs`, `scripts/proxy-check.mjs`, corpus notes.
No installs; no writes outside this report.
