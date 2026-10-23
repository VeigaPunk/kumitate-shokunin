# ConnSiblingOverlap — kumitate round 49

Seat: `kumitate-r49-w1-ConnSiblingOverlap` (connector, read-only on the lane tree except this report).
Sandbox clone: `/fast/scratch/hyaku/kumitate-r49/seats/ConnSiblingOverlap/lane` at freeze rev
`8237be86e2dc04e90e51b66b62bdffe770196d27` (clone + detach verified; `git status --porcelain | wc -l` → `0`).
Method: read the freshest **two** rounds per sibling lane + the operator-admitted lessons named in the
round prompt; then fleet-wide greps (`mountinfo`, `bwrap`, `receipt-attestation`, `bind.oracle|mount.oracle|
requested bind|observed mount|mount set`) into every sibling repo; then repo-level verification of each
cited artifact (path + bytes). No sibling content was absorbed; everything below is citation-decision only.

Reports read (freshest two per lane): kotoba r60/r59, kotodama r62/r61, mori r36/r35, tameshi r34/r33,
kake r42/r41, kama r29/r28 — all under `/home/vgpnk/Projects/shokunin/.ufo/reports/round-*/<lane>.md`.
Operator-admitted lessons located: tameshi r33's nine v3 fixes (`tameshi-shokunin/corpus/lessons/round-33.md`,
see §C), mori r36 append-only gate (`mori-shokunin/tools/mori-sources-appendonly.py`), kama r29
writing-revision calibration (`kama-shokunin/corpus/knowledge/self-assessment-at-writing.md`).

---

## A. (a) Bind/sandbox/mountview oracle — none built elsewhere; cite, do not duplicate

**Verdict.** No sibling lane holds an instrument that compares *requested binds* against the *observed
mount set* read inside a sandboxed child. Every sibling use of `/proc/self/mountinfo` is either (i) an
adversarial read (a leak channel to be closed), (ii) a classification probe without in-repo expected
values, or (iii) a one-shot manual verification of a proposed guard. `scripts/bind-oracle.mjs` (C1) is
new ground; the citations below keep it honest and prevent re-derivation.

Nearest prior art, with citation decisions for the bind-oracle's header/registry row/limits:

1. **Mechanism prior art — mado r20, proposed but never landed.**
   `mado-shokunin/.ufo/waves/round-20/w2/reports/SentinelHarnessNote.md:39-52` recommends replacing a
   `cmp` loop with a `/proc/self/mountinfo` membership check ("field 5 is the mount point; a no-op or
   shadowed mount leaves no row"), verified once live ("`/proc/self/mountinfo` inside the child lists
   `/tmp/shn-demo/target3` as a mount point"), with the octal-escape caveat at `:100`. The landed
   `mado-shokunin/.ufo/waves/round-20/isolation-check.sh` (tool sha256 `f7aa051f…` per the committed
   `a2/evidence/iso/crit29-*.txt` receipts, `mode=mount-nonzero`) does **not** read mountinfo — grep of
   `mado-shokunin/tools/` for `mountinfo` → no matches. **Cite** (mechanism + field-5 parsing + the
   `:52` caveat "keep `cmp` too so the checker can still distinguish bound-with-wrong-bytes" — see
   contradictions below). Also `w1/reports/ScoutUnshareHost.md:88-91` (bind both-armed + namespace
   non-leak).
2. **Dual-use class — mountinfo as leak channel.** mado r25 M25-2:
   `mado-shokunin/corpus/lessons/round-25.md:23` ("the case directory `cases/<LABEL>/home` appears in
   `/proc/self/mountinfo` inside the sandbox, so a tool can learn the case type") and `:87`;
   `mado-shokunin/.ufo/waves/round-25/registration.md:228-232` (K4LabelKeyed; and the boundary note
   "The oracle does not see binds an exec'd command would create at runtime (SentOracleBoundary)");
   control code `mado-shokunin/.ufo/waves/round-25/controls/v4/K4LabelKeyed.py:60-68` (mountinfo field 3
   root extraction). kake r40: `kake-shokunin/.ufo/waves/round-40/w1/CtlKeyFinder.md:6,24-31`
   (`/proc/self/mountinfo` shows `… /scratch/…/case-E1 /work ro …`; counter `c1_count.py:191` mounts
   `--proc`, `:259` names binds `case-<id>`); kake r41's countermeasure:
   `.ufo/reports/round-41/kake.md:9` ("counter names and mounts random … round-40 key-finders score
   0/1434") and `kake-shokunin/.ufo/waves/round-41/w1/SentinelSandbox.md:16-20`. mado's repair:
   `mado-shokunin/.ufo/waves/round-26/harness/oracle.py:21-22,230-234` (random `mkdtemp` case dirs,
   shuffled order, bwrap `--ro-bind … /snap/home`). **Cite all three** in the oracle's limits: the same
   observable the oracle uses deliberately is a keyed-forgery channel (supports the already-declared
   CtlForged limit); the oracle must keep per-run random bind-source names (as `cap-run.mjs` sites
   already do — plan.md:30-31) and must never derive a verdict from directory names.
3. **Set-diff verdict-shape prior art.** mado's counter v4 `ORACLE_CHECK missing=<n> extra=<n>` over
   18-field bind multisets (`mado-shokunin/.ufo/waves/round-25/a3w1/reports/K4EmptyArray.md:53`;
   MANIFEST `rounds[522]` finding, fleet `MANIFEST.json:16235`) is the missing/extra comparison
   vocabulary — but over *Hyprland config keybinds*, not mount binds. **Cite** the shape; note the
   naming collision: `mado-shokunin/tools/mado-binds.py:1-2` is a "Static resolver for the bind table
   of a Hyprland v0.56.2 config tree" — kumitate's `bind-oracle` registry row (R49-2) should say
   *mount binds* explicitly so future connectors do not conflate the two.
4. **Mount-set parsing precedent + soundness caveat — mori r23.**
   `mori-shokunin/.ufo/waves/round-23/build/DraftSkillRows.md:33-36` and `skill-rows.md:57`:
   `tools/mori-quota-surface.py` "classifies observed mountinfo/sysfs state" and is registered
   `kind: probe` precisely because "it carries no in-repo expected-value comparison of its own" ("a
   tool that cannot fail is a probe"); the expected values live in a separate `oracle-quota.py`.
   `CaseOptionalFields.md:324-326` re-derives "the covering-mount set and the longest-prefix winner"
   from mountinfo text. `CriticContractC2.md:54-57`: **mountinfo line order is iteration order of the
   namespace's mount set, not stack order** (rbtree by mount ID since v6.8). **Cite**: (i) the probe-vs-
   oracle kind split is direct precedent for the R49-2 registry rows — `bind-oracle` *does* carry its
   own requested-vs-observed comparison, so it registers as the capability instrument with the B49
   counter as the gate (mirror mori's inline reason); (ii) the line-order critique belongs in the
   oracle's limits: compare **sets**, never line order.
5. **Argument-order masking measured in practice — tameshi r18.**
   `tameshi-shokunin/.ufo/waves/round-18/w2/reports/SimplifyRound18.md:115`: an earlier
   `--ro-bind $FLEET /mnt/source` in the bwrap argv "makes that ro-bind cover `$W/source`" — S095's
   argument-order semantics as measured by a sibling. **Cite** next to K6 (`--tmpfs /tmp` masking the
   control dir): masking by earlier mounts is an observed sibling fact, not just manual prose.
6. **bwrap substrates (adjacent, cite-only).** tameshi r33 counter runs the tool under bwrap with
   read-only runtime mounts (`.ufo/reports/round-33/tameshi.md:33-34`; r32 amendment 1 at
   `.ufo/reports/round-32/tameshi.md:35`); kake r42 "non-dumpable bwrap runner"
   (`.ufo/reports/round-42/kake.md:26-27`); kotodama r39 isolation-replay protocol — a bwrap
   mount-namespace replay method bound at the live root (`kotodama-shokunin/reports/round-39/calib/
   isolation-replay-protocol.md`, existence verified by grep this session). None verifies binds; all
   are substrate precedent. In-lane: `corpus/knowledge/agent-isolation-substrates.md:164` already holds
   the bwrap row (env readable at `/proc/1/environ` inside) — cross-link it rather than restate.

**Contradictions / second-order effects (stated, not smoothed):**
- mado r20 `SentinelHarnessNote.md:52` vs the oracle's HELD verdict: a mountinfo membership hit proves
  the *mount point* is armed, not that the *bound bytes* are the requested source. kumitate's oracle
  checks presence/absence only — a bind of wrong bytes still reads HELD. The plan's Limits (1) records
  the output-text limit; this is a distinct, second limit (content unchecked). Recommend the registry
  row name it.
- mado `registration.md:231-232` SentOracleBoundary ("the oracle does not see binds an exec'd command
  would create at runtime") is the exact sibling statement of plan limit (3) ("the oracle proves the
  mechanism … the per-site claim stays with the sites' own children"). No conflict; cite so the limit
  is not presented as novel.
- mori r23 line-order critique vs any future EXTRA-allowlist ordering assumptions: harmless today
  (set comparison), fatal if the oracle ever diffs sequences.

## B. (b) Amendment-discipline / receipt-attestation entries the C2 entry must cite or supersede

Observed state (informational, no judgment): `corpus/knowledge/counter-amendment-discipline.md` exists
in the lane working tree (15 clauses C1–C15, every `receipt:` token kumitate-internal r47/r48/r49;
sources S095/S098/S099; names Q38 at :9).

**Structural constraint (drives every decision below):** the D49 probe resolves
`receipt:<repo-path>@sha256:<64 hex>` *inside kumitate at the scored revision* and verifies `S0NN`
citations against kumitate's `corpus/SOURCES.md`. Sibling-lane artifacts therefore **cannot** be bound
as `receipt:` tokens (their paths do not exist in this repo — the probe would read UNMET) and cannot
be `S0NN` rows. Sibling prior art goes in as **prose citations with lane-absolute paths and the
verifying sha/bytes**, clearly marked sibling-lane evidence.

Citation decisions (cite; **supersede nothing** — no sibling entry is kumitate's to supersede, and no
prior kumitate entry covers this ground):

1. **tameshi r34 receipt-attestation rule → clauses C2/C7/C8.** "the thrice-confirmed
   receipt-attestation rule; the receipt's counter_sha256 … equals the amended counter bytes at that
   rev — verified" (`.ufo/reports/round-34/tameshi.md:28-33`); committed artifact verified this
   session: `tameshi-shokunin/.ufo/evidence/round-33/c1/controls-receipt.json` (694 B; keys
   `all_false, controls, counter, counter_sha256, runner_sha256, seed`;
   `counter_sha256=f6b8868c54263c9d51f455b574e85c033d4e043392e7646992c65ad02a07f28c`, matching the
   report's claim). Rule statement: `tameshi-shokunin/corpus/knowledge/runner-tally-audit-v2.md:49-55`
   ("the counter refuses to run unless a committed controls receipt names its own sha256 … A counter
   edit therefore invalidates the receipt by itself"). Complementary, not overlapping: tameshi binds
   receipt→counter bytes; C2 binds clause→evidence-receipt content hash. Cite both.
2. **kumitate's own r42 precedent is bindable in-repo → clause C14.** tameshi already circulates the
   rule as fleet law citing *kumitate*: "Post-data findings cannot amend the frozen rule (kumitate
   r42)" (`.ufo/reports/round-34/tameshi.md:169`). The origin is
   `kumitate-shokunin/corpus/lessons/round-42.md:172-178` ("Counter amended after data (mistake …) …
   fix: a plan amendment is admissible only with a timestamp" — read verbatim this session). This file
   **is** in kumitate, so C14 can carry it as a second bound `receipt:` token (path exists at the
   scored rev; blob hash taken at scoring). Strongest single improvement available to the entry.
3. **kama r28/r29 writing-revision + amendment-timing → clauses C3/C14, Limits.** kama r28's A1 was
   written after a data seat had checked drafts with A0 functions; the rule invoked:
   "a rule changed after any seat has scored is not the claim's rule"
   (`.ufo/reports/round-28/kama.md:47-55,215-216`); kama r29 then built the writing-revision check —
   `kama-shokunin/corpus/knowledge/self-assessment-at-writing.md:5-7` ("evaluates the statement against
   the committed tree/history at W, not just against the current tip") and `:18` (append-only
   corrections under an exact heading, byte-prefix preserved). Same-revision binding is the exact class
   of D49's "verify the receipt at the same revision"; the append-only correction heading is the class
   of R49-3's LOG correction. Prose-cite both.
4. **kake r42 freeze-provenance + honest miss → clauses C13/C15.**
   `kake-shokunin/corpus/lessons/round-42.md:115-120` (M6: "instrument redesigned after seats scored
   … freeze provenance … the lane substituted 'before the build is scored'") and the same round's
   verdict reported against interest (`.ufo/reports/round-42/kake.md:134-139`). Prose-cite as the
   negative precedent C14 exists to prevent and the honest-miss precedent C15 formalizes.
5. **kotoba r60 exploratory-before-data → the plan's A49-or-exploratory rule (plan.md:63-64).**
   `kotoba-shokunin/corpus/lessons/round-60.md:3` ("declared **exploratory** before data by erratum
   E2") with M88–M90 at `:60-62`; report `.ufo/reports/round-60/kotoba.md:7,37`. Sibling precedent for
   declaring exploratory instead of amending post-data. Prose-cite.
6. **mori r36 append-only gate + freeze pinning → clause C6, Limits.**
   `mori-shokunin/tools/mori-sources-appendonly.py:55-64` (MUTABLE = `status, recheck, used-by`;
   `appendonly_violations/deleted/superseded/round_changed` summary; `--round-base` gate) with mori
   QUALITY 102 ("a superseder is a disposition, not a discharge") and the r35 M2 in-place-edit mistake
   that forced it; mori r36 freeze-v3 byte-identical counter pins
   (`.ufo/reports/round-36/mori.md:60-61,88-90`). Supports the entry's Limits line ("cite frozen round
   directories, never the lane's moving documents") — cite; kumitate already has its own registry-
   immutability criterion (QUALITY.md:705-707), so **do not** import mori's gate (out of province).
7. **kotodama r61/r62 controls-meet-revision-0 → clauses C4/C7.** "ten controls met revision 0 and
   each forced a change in revision 1" (`.ufo/reports/round-61/kotodama.md:18,71`;
   `.ufo/reports/round-62/kotodama.md:18`) — the same control-forces-pre-data-revision loop as A48/A49,
   in the freshest sibling rounds. Prose-cite (one line suffices).
8. **mado r25 disclosed-not-amended weaknesses → Limits style.** Closure admitted with weaknesses
   disclosed rather than amended (fleet `.ufo/reports/round-25/mado.md:62-63`;
   `.ufo/waves/hyaku/PHASE4.md:207` "disclosed weaknesses not fatal"). Precedent for the entry's
   Limits section existing at all.
9. **Internal cross-refs to add (no sibling needed):** the entry names only Q38; C8–C10 are Q36
   verbatim (`kumitate-shokunin/corpus/QUALITY.md:722`) and the L1-receipts binding is Q37 (`:723`) —
   name both so the criteria and the entry cannot drift apart silently.

## C. (c) Class overlap with tameshi's "coverage hole" fixes

The class (tameshi r33, operator-admitted): *the counter/audit design itself carries blind spots that
independent wave seats converge on before any data run; the fix is a disclosed, strictness-only,
pre-data amendment with an able-to-fail receipt, and the survivors ride to the next round under the
same freeze.* Evidence: `tameshi-shokunin/corpus/lessons/round-33.md:104-107` ("a coverage hole seven
seats converged on independently … the v2 design repeated v1's single-status-at-position-0 sweep …
never questioning co-occurrence"), `:61` ("whole-stdout compare … is the ninth measured v3 fix"),
`:128-132` + `:154-158` (v3 residue classes NOT adopted post-data, ride under freeze-before-data);
report `.ufo/reports/round-33/tameshi.md:85-87` ("nine coverage holes before any data run"); knowledge
entry `runner-tally-audit-v2.md:40-41` ("a public panel is memorizable"), `:70-73` ("vector design is
the audit, and it must be attacked with the same energy as the code under audit").

Overlap with this round (shared class, different domain — report, do not merge):
- B49's K4–K6 mutant-runner arms (drop binds / add `--bind /etc /etc` / drop `--tmpfs /tmp`) are
  co-occurrence-style attack variants of the instrument-runner pair — the same "attack the design, not
  just the code" class.
- CtlForged declaring the forgery class pre-data with its reading recorded as the counter's known
  limit = tameshi's memorizable-panel lesson applied ahead of time.
- C2's kill rule (a doctored entry with one changed hash must read UNMET, committed as the
  shown-able-to-fail receipt) = tameshi's able-to-fail discipline.
- The A49 amendment-or-exploratory rule = tameshi's "v3 residue classes not adopted post-data".

## What NOT to absorb (out of province — kumitate must not import these)

1. tameshi's sealed held-out set authoring machinery, set-aware witness/equivalence rules
   (`corpus/knowledge/witness-equivalence-rule.md`), co-occurrence vector generator, and any bash
   tally-audit domain content — tameshi-owned; C2's clauses must not cite them as receipts.
2. mori's `mori-sources-appendonly.py` gate and QUALITY 102 text — mori-owned; kumitate already has
   its own immutability criterion (QUALITY.md:705-707).
3. kama's `count-c1.py` extractor and its six statement classes — kama-owned; only the
   writing-revision *principle* is cited.
4. mado's `mado-binds.py` / bind-table model (Hyprland keybinds) — different object that merely shares
   the word "bind"; also mado's `isolation-check.sh` (unshare+util-linux mount substrate, not bwrap).
5. kake's sitemap/URL counter machinery and kotodama's locator/reopener tools — no overlap with either
   claim beyond the shared discipline clauses already cited in §B.
6. Any sibling round's wave-shape, seat-count, or orchestration conventions — operator-owned.

## Verification log (commands run this session; exit codes observed)

- Sandbox: `git clone -q --no-hardlinks <lane> …/ConnSiblingOverlap/lane && git checkout -q --detach
  8237be86…` → `git rev-parse HEAD` = `8237be86e2dc04e90e51b66b62bdffe770196d27`;
  `git status --porcelain | wc -l` → `0`.
- tameshi receipt: python3 json load of `tameshi-shokunin/.ufo/evidence/round-33/c1/controls-receipt.json`
  → `exists 694 bytes`, keys printed, `counter_sha256=f6b8868c…a07f28c` (matches r34 report claim). Exit 0.
- `ls kotodama-shokunin/calib/` → No such file; `grep -rn isolation-replay-protocol kotodama-shokunin
  --include='*.md' -l` → `kotodama-shokunin/reports/round-39/calib/{isolation-replay-protocol.md,
  Ca01-protocol.md,Ca02-replay-verify.md}` (protocol artifact located; report path corrected).
- `grep -n "amend|post-data" kumitate-shokunin/corpus/lessons/round-42.md` → hits at `:10,:125,:172-178`;
  `:172-178` read verbatim (quoted in §B.2).
- `grep -n "M25-2|mountinfo" mado-shokunin/corpus/lessons/round-25.md round-26.md` →
  `round-25.md:23` (M25-2 row), `:87`; none in round-26.md (repair documented in wave evidence).
- Fleet greps: `mountinfo` (5 files at fleet root: MANIFEST.json:16235, reports/round-25/mado.md:63,
  reports/round-40/kake.md:17, waves/hyaku/PHASE4.md:200-207, .scratch/…/ThreatModel.md:163-164 —
  root-.gitignore masks lane repos, so per-repo greps were run separately and are the evidence used);
  `receipt-attestation` (1 file: reports/round-34/tameshi.md:29); `bwrap` (20 files across lanes);
  `bind.oracle|mount.oracle|requested bind|observed mount|mount set` over all seven sibling repos →
  no instrument matches; all hits are the reports/lessons cited above.
- Report reads: the twelve reports listed in the header (path-anchored reads; quoted lines carry their
  `path:line` above).

## Installs

None. No pacman transaction, no uv/npx/cargo installs (stock git/python3/read/grep only; pacman pause
respected).

Report: .ufo/waves/round-49/r49/ConnSiblingOverlap.md
