VERDICT: Delivered a spec-conformant, append-only `## Capture origin` draft at build/K69ScribeEntry/amendment.md; every bullet verified byte-for-byte against the frozen M11 bullet grammar over the round-69 base entry.

## Evidence

- Draft artifact: `.ufo/waves/round-69/build/K69ScribeEntry/amendment.md` — 941 bytes; one leading blank line (append separator), `## Capture origin` heading, a two-sentence `Amendment 2026-10-30` preamble naming the live-digest-equals-committed-capture rule, "pins alone prove nothing", and `self-asserted-source-capture`; then 7 bullets in `- S### — capture 2026-10-27 — …` form with U+2014 em-dashes.
- Base/freeze bytes: `git show 14057f3e3899180c95713bace088fb9c0d0046e3:corpus/knowledge/mcp-deprecation-registry.md | sha256sum` → `8e6c0b1f99497fbe444060dcc9535800b7a99163a7bab884b82d1c17fd350df6`; identical at freeze `9401d8655970d542b81d318bdad558d6dea39397`; `grep -c 'Capture origin'` → 0 at both (matches `base/deprec69-base.txt` `M11 MISS origin-section-absent`).
- Append-only: `(base_bytes + amendment)[:len(base)] == base` → True; base ends `…did not drop it.\n`, draft opens `\n## Capture origin` → exactly one blank separator line.
- M11 grammar, verbatim from frozen `probe/deprec69-probe.mjs:456`: `/^-\s+(S\d{3,})\s+—\s+capture\s+(\d{4}-\d{2}-\d{2})\s+—\s+(.+)$/` on each trimmed section line; heading `^##\s+Capture origin\s*$` (probe:180). citedIds = `source:` ids in the entry's first 14 lines = S207,S208,S209,S210,S211,S212,S213; the draft yields 7 bullets, one per id.
- Classification replay (same PINNED_URL regex as probe:445-446 over each row's `source:` URL): S207/S208/S211 = modelcontextprotocol.io site pages → non-pinned → `mirror S214`/`mirror S215`/`mirror S216` (the `/^mirror\s+(S\d{3,})$/` tail probe:466); S209 (tag v18.12.6), S210 (40-hex 183238dd), S212 (tag v18.13.1), S213 (github.com commit `.patch`) → pinned → tail `pinned`. All 7 `arm_ok=True`.
- Dates: `grep -o 'fetched 2026-10-27' | wc -l` over the entry's source lines → 7; every bullet's capture date matches its row's fetched date.
- Mirror rows, worktree `corpus/SOURCES.md:166-168`: S214/S215/S216 — 11 cells each, `raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/82d60be17d75e69b350c9fe77df2e8cac202ac11/…` → PINNED_URL True, `mined`, used-by names `corpus/knowledge/mcp-deprecation-registry.md`. `.ufo/pins/source-captures.json` binds each to `.ufo/waves/round-69/build/L1Capture/mirrors/{deprecated.mdx,feature-lifecycle.mdx,transports.mdx}`; all three files exist and re-hash to their pinned sha256+bytes (S207's canonical capture likewise matches).
- Worktree state: `git status --porcelain` shows `M corpus/knowledge/mcp-deprecation-registry.md` — `wt.startswith(base)` → True, delta +703 bytes: the L1's in-progress `## Capture origin` (same 7 bullets verbatim, different preamble, plus a trailing provenance paragraph naming `82d60be…`). Entry file is absent entirely at ROWBASE `d23892ad…` (M2's premise).
- Lesson term: `corpus/lessons/round-68.md:24` defines `self-asserted-source-capture`; the probe header cites it as the routed R68-4 lesson (probe:39-50).

## Findings

- K69ScribeEntry-1 — LOW — attacks prose parity between this seat's spec and the in-progress integration. The worktree's appended preamble reads `Amendment 2026-10-30 (S214–S216): M69 fetches source bytes independently of the lane's pins and compares SHA256. Mirrors are upstream carriers, not independent authors.` — two sentences, but it omits the spec-required lesson tag `self-asserted-source-capture` and states only "compares SHA256", not that counter-fetched live digests must equal the committed captures' sha256. Frozen M11 never parses preamble text (bullets only, probe:455-469), so no claim threat — informational; the seat-spec wording ships in my draft. Repro: `grep -n 'self-asserted' corpus/knowledge/mcp-deprecation-registry.md` → exit 1 (absent there; present in `build/K69ScribeEntry/amendment.md` line 3).
- K69ScribeEntry-2 — LOW — attacks bullet-grammar fragility for any downstream re-edit. M11 keys on the U+2014 em-dash: a visually identical `- S207 - capture …` or `--` parses to zero bullets → `S207:origin-bullets=0 …` ×7 MISS. This draft emits real em-dashes and was machine-checked against the same regex. Repro: `python3 -c "import re;print(re.match(r'^-\s+(S\d{3,})\s+—\s+capture','- S207 - capture 2026-10-27 - pinned'))"` → `None`.
- K69ScribeEntry-3 — LOW, named-limit confirmation — attacks the `pinned` declarations' durability. S209/S212 classify `pinned` only via `v<semver>` tag URLs (`v18.12.6`/`v18.13.1`); an upstream re-tag moves live bytes and honestly fails the M11 digest arms — the plan's own stated limit, restated here so the `pinned` tails' standing is understood as content-at-a-tag, not content-at-a-commit. Repro: `grep -n 'raw.githubusercontent.com/can1357/oh-my-pi/v18' corpus/knowledge/mcp-deprecation-registry.md` → the two `source:` lines.

## Artifacts

- `.ufo/waves/round-69/build/K69ScribeEntry/amendment.md` (941 bytes — the append delta)
- `.ufo/waves/round-69/w1/K69ScribeEntry.md` (this report)

## Limits

- No live fetches by this seat: M11 arms (a)/(c)/(d) — counter-fetched sha256 equality over cited+mirror URLs and the cross-carrier Deprecated-table equality — run only inside the frozen counter at counting time; everything above verifies the frozen structural/M3-grade arms offline against worktree bytes.
- `deprec69-probe.mjs` not executed (it measures a committed rev; HEAD `9401d865` lacks the section — the base receipt already records `M11 MISS origin-section-absent`; the worktree integration is uncommitted).
- Draft intentionally omits the L1's trailing provenance paragraph (commit `82d60be…`, delinked-table agreement, HTTPS-not-signature note); the spec asked for preamble + bullets only, and the bullet parser ignores non-bullet lines if it is appended after them.
- Worktree was mid-integration while scored; if the committed section differs further, findings re-key against the committed rev.
