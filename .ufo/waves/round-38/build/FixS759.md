ITEM FixS759 anchors=1 move=0 token=1 move_token=0 debt=0
VERDICT route-probe-cluster#163 TOKEN probe-token-plan-models.verdict.json | the cited line 35 is the definition the sentence documents, pin 35: `const VERDICT_PATH = path.join(HERE, "probe-token-plan-models.verdict.json");` (HERE is the script dir, so "next to itself"); the parser's paired `## Round-32 membership removals` is note line 378 in the prior bullet, absent from the sentence (381-386) and from pin 35
E1 pin = 31c465f15669f744848bd9f5d56191c5085670f7 (`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`); pin file cmp-identical to `git show HEAD:scripts/probe-token-plan-models.mjs` (244 L).
E2 lane note cmp-identical to `git show 753446a829edda519c75777ce95888443f51fa94:corpus/knowledge/route-probe-cluster.md` (578 LF); scratch copy /fast/scratch/kumitate-r38/FixS759/route-probe-cluster.at-753446a.md.
E3 item states note line 372; the anchor span is at note line 383 (bullet 381-386). Line 372 is the "**Owning suite**" bullet. This verdict applies to the span at 383.
E4 note 381-383 quoted: "**Durable verdict**: models writes / `scripts/probe-token-plan-models.verdict.json` next to itself / (`scripts/probe-token-plan-models.mjs:35`, via `writeVerdict` `:40`)".
E5 pin 34-35 quoted: `const HERE = path.dirname(fileURLToPath(import.meta.url));` / `const VERDICT_PATH = path.join(HERE, "probe-token-plan-models.verdict.json");`. Line 35 is the sole definition of VERDICT_PATH (uses at 42, 51, 83, 92).
E6 word-bounded test `(^|[^A-Za-z0-9_])TOKEN([^A-Za-z0-9_]|$)`: `probe-token-plan-models.verdict.json` hits pin 35 and note 382 (same sentence). Passes the override rule.
E7 rejected `VERDICT_PATH`: word-bounded on pin 35, but the sentence holds only `UFO_PROBE_VERDICT_PATH`, which is not word-bounded. Fails the override rule.
E8 rejected `writeVerdict`: in the sentence, but on pin 40 (`function writeVerdict(verdict) {`), not on 35.
E9 rejected `path`: mechanically word-bounded on both lines, but the sentence's "path" is the historical `.ufo/probes/…` path.
E10 pin 35 contains no `UFO_PROBE_VERDICT_PATH` and no `.ufo/probes`, so the sentence's "gone" claim holds at the pin. Only the anchor's paired symbol is false.
E11 a TOKEN override leaves the anchor count and raw span unchanged, so no ANCHOR_SET_CHANGED or re-pin follows.
E12 adjacent, outside FixS759: note 161-163 cites `:35` for `VERDICT_PATH`, and the sibling `:40` at note 383 cites `writeVerdict`. Owning items should check both against pin 35 and pin 40.
E13 tools: none installed. Git use was read-only (rev-parse, cat-file, show). No lane jj/git mutation. Scratch files are under /fast/scratch/kumitate-r38/FixS759/.
