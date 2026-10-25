VERDICT: Entry draft B is written (75 lines, decision table first), every one of its 15 located quotes is proven present in the committed captures and in today's live fetch, and a fixture-repo run of the frozen counter holds T1–T5; the two open arms (T6, T7) belong to L1 integration, and one counter trap found en route is that S196's registry URL must be the `.md` rendering.

## Evidence

1. Counter contract read from the frozen files (not paraphrased): `norm()` at
   `.ufo/waves/round-63/probe/topology63-probe.mjs:57-67` and the T4 bullet regex
   `/^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/` at `:142`; T1 reads only the **first 14 lines** for
   `source:`/`verified-at:`/`recheck:` (`:70-83`); T5 re-fetches each cited row's URL from the registry (`:163-181`).

2. Quote proof against the committed captures (script copies the counter's `norm()` verbatim, then re-parses the
   entry with the counter's bullet regex):
   `node /tmp/kumitate-r63/K63ScribeEntryDraftB/prove-quotes.mjs` →
   ```
   entry lines=76 bytes=8890
   T1 source-lines=true verified-at=true recheck=true
   T1 cited ids=S196,S197
   PASS S196 words=3 found=true :: 多智能体协作让一个 coordinator（协调者） 智能体编排一组成员智能体。
   PASS S196 words=2 found=true :: 协作拓扑类型，当前仅支持 coordinator。
   ... (15/15 PASS; full listing in build/K63ScribeEntryDraftB/proof.txt)
   bullets=15 pass=15 fail=0 per-row=S196=5 S197=10
   QUOTE_PROOF: PASS (15/15 bullets located, every cited row covered, entry 76 lines <= 90)
   exit=0
   ```
   `node live-check.mjs` → `LIVE_PROOF: 15/15 bullets found in today's live fetch` (exit 0).

3. Capture bytes are today's bytes: `curl -fsSL -A 'Mozilla/5.0 (kumitate-r63)' <url> -o live.*` gave
   663997 bytes (arXiv HTML v3) and 3388 bytes (bailian `.md`), `sha256sum` equal to the committed captures
   (`7ea43966…37e6` for S196).

4. Fixture-repo run of the frozen counter (`mktemp -d`, `git init`, commit inside only; lane untouched). Fixture =
   entry copied to `corpus/knowledge/multi-agent-coordinator-topologies.md`, two 13-cell rows S196/S197, pinned
   captures, PROVINCE/README copied:
   ```
   # S196 row pointing at the bare page
   TOPOLOGY63_UNMET held=4/7 checks=7 rev=14cd41e3ca983d51f559e01a9153d41ab7232d2c rule=T63 | T5 MISS S196:quote-not-live(协作拓扑类型，当前仅支持 coordinator。);S196:quote-not-live(条目类型：agent（引用另一个 Agent）或 self（);S196:quote-not-live(被引用的智能体版本号，type=agent 时可选（>=1，) | T6 MISS census-exit=1 | T7 MISS …
   # same fixture, S196 row pointing at the .md rendering (identical entry bytes)
   TOPOLOGY63_UNMET held=5/7 checks=7 rev=2e544abd02ccc6d9c7e6d6c5277f1b68802e9066 rule=T63 | T6 MISS census-exit=1 | T7 MISS province-names-entry=false readme-map-clean=false
   exit=1
   ```
   i.e. T1–T4 and T5 hold on the draft exactly as written; T7 is unset because the fixture's PROVINCE does not name
   the entry (L1's line).

5. Fixture T6 is a fixture artefact, not a row defect:
   `sources-census.sh validate --file <fixture>/corpus/SOURCES.md | cut -f2 | sort | uniq -c` → `168 E11`, `6 W04`;
   every E11 is `missing used-by <path>` for corpus files the fixture does not contain, and
   `grep -E 'S(196|197)\b'` over the census output → `none`.

6. Every number stated in the entry was grepped in the normalised S197 capture before it was written (31 tokens:
   `0.631 0.349 +74.5 +9.2 +5.6 50.3 41.5 39.1 70.0 14.9 19.2 17.2 7.8 5.1 4.4 0.096 0.236 4,800 87% (20%) (54%)
   0.40 20-instance "up to nine" 37.5 58.7 77.2 -0.3 45% +57% +80.8`) — all FOUND.

## Findings

**K63ScribeEntryDraftB-1 — high — the S196 registry row must use the `.md` URL, or C2's T5 dies.**
T5 fetches the URL from the registry row, not from the entry. The bare page
`https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent` serves a 4,438,201-byte HTML
build in which inline `<code>` splits the Chinese cells; after `norm()` three of the five S196 quotes gain a space
the markdown does not have, and the counter reads `S196:quote-not-live`. With the `.md` URL (3,388 bytes,
byte-identical to the capture) all five pass. Repro: fixture in evidence 4, run both probes back to back.
Fix: L1 registers S196 with the `.md` URL (the staged S200 row already did).

**K63ScribeEntryDraftB-2 — medium — the staged entry over-claims version pinning.** Staged text: "member selection
is version-pinned rather than floating, so a coordinator's behaviour is reproducible across runs". S196 states the
opposite default: `version` is `可选` (optional), `不传取最新` (omitted → latest). Pinning is opt-in; an unpinned
roster floats. Draft B's roster table says so and cites the bullet. Repro:
`grep -c '可选' <capture>` → 1; quote 5 in `## Located quotes`.

**K63ScribeEntryDraftB-3 — medium — the staged entry's overhead formula is not in the capture.** Staged: "prices
it as `r·n` for a centralized topology and `r·n + p·m` for hybrid". S197 Table 2 gives `O(rnk)+O(r)` (centralized)
and `O(rnk)+O(r)+O(p)` (hybrid) — the `r·n` form drops `k`, and the `p·m` product appears nowhere. Draft B carries no
formula and uses the measured coefficients instead. Repro:
`python3 -c "t=open('s197.norm.txt').read(); print('O(rnk)+O(r)+O(p)' in t, 'r n + p' in t)"` → `True False`.

**K63ScribeEntryDraftB-4 — low — the Finance `+57%` endpoint is unattributed.** The caption gives the range
`(from +57% to +80.8%)` but names only Centralized 80.8, Decentralized 74.5, Hybrid 73.1; assigning 57% to
Independent would be invention. Draft B quotes the range and names only the three attributed values.

**K63ScribeEntryDraftB-5 — low — "fan-out capped at 20" is one short.** S196 bounds `agents` at 1–20 *entries*, and
one entry is `self`; the member ceiling is 19, and that subtraction is the entry's own [INFERENCE], labelled as
such in the roster table.

**K63ScribeEntryDraftB-6 — info — T1 reads only the first 14 lines.** A long comment block above the provenance
trio would silently drop rows from `ids`, which then fails T2/T3/T4 with a misleading reason. Draft B keeps the
trio at lines 1–5. Repro: `sed -n '70,83p' .ufo/waves/round-63/probe/topology63-probe.mjs`.

## Artifacts

- `kumitate-shokunin/.ufo/waves/round-63/build/K63ScribeEntryDraftB/entry.md` — the draft (75 lines).
- `kumitate-shokunin/.ufo/waves/round-63/build/K63ScribeEntryDraftB/proof.txt` — full 15-bullet PASS listing + live proof.
- `kumitate-shokunin/.ufo/waves/round-63/build/K63ScribeEntryDraftB/prove-quotes.mjs`, `live-check.mjs` — the proof scripts (copy of the counter's `norm()`).
- `/tmp/kumitate-r63/K63ScribeEntryDraftB/` — normalised captures (`s196.norm.txt`, `s197.norm.txt`), live fetches, fixture repo `fixture.iNK0` (rev `41f1faa2`).

## Limits

- T6 and T7 were **not** proven: writing `corpus/SOURCES.md`, `.ufo/pins/source-captures.json`, `PROVINCE.md` and
  `README.md` is L1 scope. The fixture shows only that nothing in the draft blocks T6 (no census code touches
  S196/S197) and that T7 needs the PROVINCE frontier line naming
  `corpus/knowledge/multi-agent-coordinator-topologies.md`.
- The paper was read as the captured HTML v3 and today's live HTML only; the PDF, earlier versions and the
  appendices beyond C.3/F were not read.
- S196 was read as the Chinese `.md` rendering only; no English page or API reference was opened, so field
  semantics outside `multiagent` are out of scope.
- Chinese bullets count as 1–4 whitespace "words", so the ≤25-word arm is trivially satisfied for them; the arm is
  only meaningful for the S197 bullets (max 23).
- No linter or repo gate was run (not mine to run); no tool was installed.

## What B refuses that a literal reading of the staged entry would have over-claimed

1. Staged: "version-pinned rather than floating … reproducible across runs" — S196 makes `version` optional with
   latest as the default, so a roster is floating unless the caller pins it.
2. Staged: overhead "`r·n` … `r·n + p·m`" — the capture's Table 2 says `O(rnk)+O(r)` and `O(rnk)+O(r)+O(p)`; `p·m`
   is not in the source at all.
3. Staged: "Finance Agent +57% to +80.8% — every variant wins" — the lower endpoint is unattributed, so B quotes
   the range and names only Centralized 80.8, Decentralized 74.5, Hybrid 73.1.
4. Staged: "the fan-out is capped at 20" — 20 counts the coordinator's own `self` entry, so members cap at 19.
5. Staged: "a task that decomposes cleanly … is where the coordinator wins" — B adds the two conditions the staged
   rule omits (single-agent baseline above ~45% and ≤4 tools both flip the answer back to SAS or a flat topology).
