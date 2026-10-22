RESULT ReopenRejects rev=c9a084bf verdict=agree agree=3/3 sample=2/2 defects=7

Re-opened S043, S044, S045 by ordinary HTTPS on 2026-10-22 (no browser, no challenge) and
sampled two of the five no-row reject bullets in the lesson's `## Gate` (R1 GeeksforGeeks,
R5 archived official legacy docs). All three rejects stand; the reject *records* carry seven
defects, none changing a verdict. Scratch: `/fast/scratch/hyaku/kumitate-r42/falsify/ReopenRejects/`
(`lane/` at c9a084bf, `evidence/` = fetched bytes). No tool installed or upgraded; no mutant run.

**S043 arika.dev — reason: agree; flip: workable but answers only one of its two grounds.**
The 80% is a recalled constant (page also gives 60%, and a PIT 1.16.1 snippet, but no measurement),
tier `community`/C, and the lane gates per mutant, so the reject is sound. Defect 1: the row's anchor
`s thresholds` names no section on the page — the quote sits unheaded under "How Mutation Testing
Works", and `thresholds` occurs only as a JSON key in the Stryker snippet, so the anchor cannot
locate the quote (contract: anchor = exact section/heading/page/line plus revision). Defect 2: the
reason gives two independent grounds and the flip answers only the first — if a score threshold is
"the wrong instrument" for a per-mutant manifest, a measured threshold alone would not flip the row.
Defect 3: the Gate entry gives no location for the quote and counts it 15 words; it is 14.

**S044 kimi-cli.com — reason: agree; flip: correct ("none for this scope", cite S042).**
Verified: VitePress 1.6.4 page documents the legacy `~/.kimi/` tree with no `locks/` node, while the
host root is `~/.kimi-code` and S042 is the official page. Defect 4: the Gate misquotes the decisive
sentence — the page reads "Kimi **Code** CLI stores all data in the `~/.kimi/` directory …" but the
Gate drops "Code" and counts 16 words; verbatim is 15, as quoted 14. Defect 5: "third-party mirror"
and "plus an injected line" are wider than the evidence — RDAP shows `kimi-cli.com` on the same
registrar as `kimi.com` with the registrant redacted (ownership unestablished), and the added line
is a docs-tooling banner ("Are you an LLM? You can read better optimized documentation at …
Markdown format"), the only text difference (132 chars), not proof of
tampering; the reject needs neither. The parenthetical "Last-Modified is the fetch moment" is also
imprecise: it is the per-path first-render stamp (`data-locations` returned 19:57:21Z on repeat;
`env-vars` returned my request instant).

**S045 main head — reason: agree; flip: workable if read as "re-open at the release tag".**
Version skew is real: at e7f1a99 the file adds `SESSION_LOCK_ENV = 'KIMI_CODE_SESSION_LOCK'`, a
`disabled` flag, `evict()` and the `'taking over session lock'` warning; the installed 2.3.0 binary
has 0 text hits for both literals yet does carry the lock-dir code as text, so the grep is
non-vacuous. Defect 6: the row's scope "the session-lock implementation the host runs" with tier A
contradicts its own reject reason (it is not what the host runs), and the anchor gives no line
locator. Defect 7: "head of 2026-10-22" is not the branch head — `main` is 759958a, four commits
ahead of e7f1a99 — though the file at `main` is byte-identical to e7f1a99 (`fb3fae82…`), so the pin
is content-correct and the reject unaffected. The reason also states a count ("0 hits") with
no literal or command (Q3); I re-ran it.

**No-row samples.** R1 (GeeksforGeeks): Gate description exact — quote "If outputs differ, the
mutant is killed; if not, it survives." present, "Last Updated : 9 Jun, 2026", no byline; agree.
R5 (archived official Kimi CLI docs): banner verbatim at `/en/guides/getting-started.html` ("This
project is archived. Kimi CLI is no longer maintained and will stop working."), `Last-Modified`
2026-09-22, no `locks` node; agree.

**Cross-cutting.** Gate says "five further candidates" but names six sources and the report holds
six no-row rejects (R1, R3, R5, R6, R7, R8; R2→S043, R4→S044). No Gate entry carries a URL literal
(admits included), and the three reject entries uniquely lack a quote location, S045 any quote, so
rule 1 ("a ≤25-word quote with its location") is met only by the admitted rows. Operability: rejected
rows feed no proxy term (`grep -n SOURCES scripts/proxy-check.mjs` → empty); `sources-check` is CLEAN
with `rejected:5`, and the registry diff open→measured adds only S039–S045, so the append-only
claim holds.

Evidence (commands run in the clone or evidence dir; outputs shortened):
- `sed -n '56,58p' corpus/SOURCES.md` → S043 anchor `§ thresholds; fetched 2026-10-22`; S044 source `third-party mirror`, anchor `§ data locations`; S045 scope `the session-lock implementation the host runs`, tier A, anchor `… (main head on 2026-10-22), 239 lines`.
- `curl -sS https://www.arika.dev/blog/engineering/mutation-testing-in-ci/` → HTTP 200; `grep -o 'A mutation score of 80% is a reasonable starting threshold for well-tested business logic.' arika.html | wc -l` → 2.
- `grep -oE '<h2[^>]*id="[^"]*"' arika.html` → how-mutation-testing-works, tooling-pit-for-jvm-stryker-for-jsts, the-problem…, incremental…, risk-weighted-scoring, baseline-scores…, debugging…, full-vs-incremental…, key-takeaways (no `thresholds`).
- `printf 'A mutation score of 80% … business logic.' | wc -w` → 14 (Gate: "15 words").
- `printf 'Kimi Code CLI stores all data in the \`~/.kimi/\` directory under the user’s home directory.' | wc -w` → 15; without "Code" → 14 (Gate quotes without "Code" and says "16 words").
- `curl -sS https://www.kimi-cli.com/en/configuration/data-locations.html` → HTTP 200, VitePress v1.6.4, tree rooted `~/.kimi/`, no `locks` node; `grep -c 'Are you an LLM'` → 1.
- `grep -c 'Are you an LLM'` on the official S042 page → 0; on the archived official page → 0; stripped-text sizes 6,909 vs 6,777 → delta 132 = that line.
- `curl -sSI https://www.kimi-cli.com/en/configuration/data-locations.html` twice → `last-modified: Thu, 22 Oct 2026 19:57:21 GMT` both times; `/en/configuration/env-vars.html` → `last-modified: Thu, 22 Oct 2026 21:02:36 GMT` (= my request at 21:02:37Z).
- `curl -sSL https://rdap.verisign.com/com/v1/domain/kimi-cli.com` → registrar Alibaba Cloud/HiChina, registered 2025-12-30, registrant redacted; `kimi.com` → same registrar.
- `curl -sS https://moonshotai.github.io/kimi-cli/en/guides/getting-started.html` → `This project is archived. Kimi CLI is no longer maintained and will stop working.` (1 hit); data-locations page `Last-Modified: Tue, 22 Sep 2026 09:30:19 GMT`, `grep -c locks` → 0.
- `curl -sS https://raw.githubusercontent.com/MoonshotAI/kimi-code/e7f1a99…/…/sessionLockService.ts` → 239 lines, sha256 `fb3fae8242862a49b4bf26e994dd6c692de17eb2a079f173474cf21186301f77`; tag b5e28fd6… → 211 lines, sha256 `acbcdd3811903885c2edfeb5e67cf5258921768b814c751c511e4cf7c867ad08`.
- `diff -u tag.ts main.ts | grep -E '^[+-][^+-]' | wc -l` → 30; markers `+export const SESSION_LOCK_ENV = 'KIMI_CODE_SESSION_LOCK';`, `+  private readonly disabled: boolean;`, `+  protected evict(sessionId: string): void {`, `+    this.log.warn('taking over session lock', …)`.
- `grep -ac 'KIMI_CODE_SESSION_LOCK' ~/.kimi-code/bin/kimi` → 0; `grep -ac 'taking over session lock'` → 0; `dd skip=134688400 count=260 | grep -ao 'lockDir[^;]*'` → `lockDir = join$98(bootstrap.homeDir, "locks", "sessions")` (grep non-vacuous).
- GitHub API `commits/main` → `759958afdfeb… 2026-10-22T12:30:23Z`; `compare/e7f1a99...759958a` → status ahead, ahead_by 4, behind_by 0; `raw.githubusercontent.com/…/main/…` file sha256 = `fb3fae82…` (identical to e7f1a99).
- `node scripts/sources-check.mjs` in the clone → `SOURCES_CHECK: CLEAN (rows=45 tiers=A:42,B:1,C:2 status=queued:14,mined:26,rejected:5)`, exit 0.
- `git diff dfabe92:corpus/SOURCES.md c9a084bf:corpus/SOURCES.md` → seven added rows S039–S045, no modified row.
- `grep -c '^### R[0-9]' .ufo/waves/round-42/build/ScoutRejectCandidates.md` → 8 (R2→S043, R4→S044 ⇒ six no-row); Gate bullet names five items but six sources.
- `grep -n 'SOURCES' scripts/proxy-check.mjs` → no output (no proxy term counts registry rows).
