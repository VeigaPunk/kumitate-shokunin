RESULT ScoutSourcesRecheck rev=b237e3f09c9559e130c7367bd2efa981c4ea516f verdict=advanced overdue=0 reopened=5 quote_ok=5

# Scout — source recheck, round 42 wave 1

Read-only recon at the wave revision (clone at b237e3f0, clean tree, `git diff --stat
dfabe92b -- corpus/SOURCES.md scripts/` empty, so the registry at the wave revision is the
registry at round open). The only lane write is this file. No tool installed or upgraded.

## 1. Queue state at b237e3f0

E1. Registry gate, clone at b237e3f0:

    node scripts/sources-check.mjs --today 2026-10-22
    SOURCES  info  LEGACY_NO_HEADER  count=38
    SOURCES_CHECK: CLEAN (rows=38 tiers=A:37,B:1,C:0 status=queued:14,mined:22,rejected:2 entries_with_source=3 legacy=38)
    EXIT=0

E2. Fleet validator, live lane tree (read-only):

    bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate --today 2026-10-22
    kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
    kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
    FLEET_VALIDATE_EXIT=0

E3. Due-by-date check, fleet `overdue` mode (`--today 2026-10-22`): 38 `cadence` lines, zero
`overdue` lines, exit 0. So **0 rows are past their recheck date**. Every recheck cell is a
cadence (`on-release`, `90d`, `180d`, `365d`, `30d`), never an ISO date; the nearest horizons
are S008/S009 (2026-11-18), S021 (2026-11-19), S029 (2026-11-20), S035 (2026-11-21).

Queued (14, from the row parse): S010, S011, S013, S014, S015, S016, S017, S024, S025, S026,
S027, S028, S036, S037. Recheck-due on or before 2026-10-22: none. Rejected rows S019/S020 are
not due (365d). Nothing in the 14 queued rows is a defect: no admitted `knowledge/` entry cites
any of them — `grep -rn` in `corpus/knowledge/*.md` for the mutation vocabulary, `.omp/mcp.json`
and `io.modelcontextprotocol/tasks` returns nothing, and `grep -rn 'S013' corpus/knowledge/*.md
corpus/QUALITY.md` returns nothing (the notes that mention tower mode, e.g.
`corpus/knowledge/kimi-modes-machinery.md:34-54`, read binary strings and cite no row) — so under
SOURCES-CONTRACT-v1 (`status` — "mined (cited by ≥1 path in `used-by`)", line 36) none may be
flipped to `mined` today.

## 2. Five queued rows re-opened by ordinary means

All fetched with `curl` over plain HTTPS (no browser, no challenge passing), access time
2026-10-22T19:56:41Z unless stated. Quotes are ≤25 words. `quote_ok` = the recorded quote (or
the row's anchor claim) still occurs verbatim.

| id | URL | access | quote verbatim | recorded pin still live | proposed old -> new |
|---|---|---|---|---|---|
| S036 | https://raw.githubusercontent.com/stryker-mutator/mutation-testing-elements/140f2119…/packages/report-schema/src/mutation-testing-report-schema.json | 2026-10-22T19:56:41Z | yes, `:92` | yes, commit is still `master` head | status queued -> queued; mined only if the round-42 lesson cites it (see §4); recheck on-release unchanged |
| S037 | https://registry.npmjs.org/mutation-testing-report-schema/-/mutation-testing-report-schema-3.9.0.tgz | 2026-10-22T19:56:41Z | yes, `:41` in the tarball member | yes, npm `latest` is still 3.9.0 | same as S036; recheck on-release unchanged |
| S013 | https://moonshotai.github.io/kimi-code/en/guides/tower.html | 2026-10-22T19:56:41Z | yes | page editable, Last-Modified 2026-10-21 | status queued -> queued; recheck on-release unchanged |
| S024 | https://raw.githubusercontent.com/can1357/oh-my-pi/main/docs/mcp-config.md | 2026-10-22T19:56:41Z | yes | file byte-identical at recorded rev and at the new head | status queued -> queued; recheck on-release unchanged |
| S026 | https://raw.githubusercontent.com/modelcontextprotocol/ext-tasks/main/README.md | 2026-10-22T19:56:41Z | yes | yes, head still `b3d28ace` | status queued -> queued; recheck on-release unchanged |

### S036 — Stryker report schema at 140f2119 (spec, A)

    curl … /packages/report-schema/src/mutation-testing-report-schema.json   HTTP=200 bytes=12799
    sha256sum s036.json
    404575e9264686dbf85c399f6531fdb489bebc3146e7e1d793b8083bc6a041ae  s036.json
    grep -n '"enum"' -> 92: "enum": ["Killed", "Survived", "NoCoverage", "CompileError", "RuntimeError", "Timeout", "Ignored", "Pending"]
    git ls-remote https://github.com/stryker-mutator/mutation-testing-elements refs/heads/master
    140f211984e8a0c926ec305a550da425f9bb8d69	refs/heads/master

The recorded sha256 and the recorded line both match; the pinned commit has not moved off
`master`. No flip condition; the row's content claim stands. Proposed: no status change today.
`mined` becomes correct exactly when an admitted entry cites it, and the round-42 C1 lesson is
the natural citer because C1's per-mutant outcomes (`killed`, `survived`, `crash`, `timeout`)
must map onto this enum's `RuntimeError`/`Timeout`. If the L1 makes that citation, the change is
`status queued -> mined`, `used-by — -> corpus/lessons/round-42.md`, opened/recheck/anchor
unchanged. Do not pre-set a date cadence: the pin is the live head, so `on-release` is honest.

### S037 — npm 3.9.0 (spec, A)

    curl -L … 3.9.0.tgz   HTTP=200 bytes=11872
    sha512- 28CobrcLdQm35zySemaLMKrUpVccLMA1DekUGtfezOSmnI0Xq8oJisixYnO0BQYIwKCkKL7+AE71/uWq/vFSJQ==
    tar -xzOf s037.tgz package/src/mutation-testing-report-schema.json | grep -n '"required": \["id"'
    41:              "required": ["id", "mutatorName", "location", "status"],
    cmp s036.json s037.json -> exit 0 (both sha256 404575e9264686db…)
    npm registry doc: {"latest":"3.9.0","versions":46}

The tarball integrity equals the row's recorded sha512, line 41 carries the recorded quote, and
the member is byte-identical to the S036 master file — that part of the row's teaches is
measurably true, not just repeated. `latest` is still 3.9.0, so the pin is the current release.
Proposed: no change today; same conditional `mined` as S036.

### S013 — Kimi Tower (docs, A)

    curl … /kimi-code/en/guides/tower.html   HTTP=200 bytes=41799
    last-modified: Wed, 21 Oct 2026 06:23:18 GMT
    <title>Tower multi-agent collaboration | Kimi Code CLI Docs</title>
    "Worktrees isolate writes, but they are not a security sandbox."
    "Each workspace can have only one tower coordinator."
    h2 ids present: Enable Tower, Run a workflow, …, Safety and resource cost

The page changed after the 2026-10-19 open (Last-Modified 2026-10-21) but every clause the row's
teaches asserts is still on it: one coordinator per workspace, worktree per mission, independent
reviews before merge, not a security sandbox. Negative result relevant to C2: the page carries
no lock-file text — `grep -oiE '[^<>]{0,50}lock[^<>]{0,60}'` returns only three CSS class names
(`blockDiagram…`, `custom-block`). Proposed: keep `queued`; recheck `on-release` unchanged.

### S024 — OMP mcp-config docs (docs, A)

    curl … raw.githubusercontent.com/can1357/oh-my-pi/main/docs/mcp-config.md   HTTP=200 bytes=28507
    :15 ## Preferred config locations; :19 Project: `.omp/mcp.json`; :20 User: `~/.omp/agent/mcp.json`
    :22 "The native provider also reads `.omp/.mcp.json` and `~/.omp/agent/.mcp.json` for compatibility, but OMP writes to the primary `mcp.json` paths above."
    git ls-remote https://github.com/can1357/oh-my-pi refs/heads/main -> 0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0
    curl … /raw.githubusercontent.com/can1357/oh-my-pi/10b9b493/docs/mcp-config.md -> HTTP=200 bytes=28507
    sha256 both = 8d612764ebda528a32c4579876928fbb0c1545eab32d7e596113b02a3a3fe4fc; diff exit 0

The file is byte-identical at the recorded revision `10b9b493` and at today's head
`0b5c27ab`, so the anchor's "file last changed 4ab6de0b" still holds and the teaches is still
exact. Only the head pointer in the anchor cell is now historical, and `anchor` is not an
editable column (contract rule 2), so that belongs in a lesson note, not a row edit. Proposed:
keep `queued`; recheck `on-release` unchanged.

### S026 — MCP Tasks extension (spec, A)

    curl … raw.githubusercontent.com/modelcontextprotocol/ext-tasks/main/README.md   HTTP=200 bytes=3427
    :3 "…the official Model Context Protocol Tasks extension (`io.modelcontextprotocol/tasks`), based on SEP-2663"
    :11 **Extension Identifier:** `io.modelcontextprotocol/tasks`
    :21 | `2026-07-28` | Stable      | [`schema.ts`](schema/2026-07-28/schema.ts) | [`schema.json`](schema/2026-07-28/schema.json) |
    git ls-remote https://github.com/modelcontextprotocol/ext-tasks refs/heads/main -> b3d28aceaa6d49f5f92258e3d06b61ad6f111e84

Head has not moved since the 2026-10-20 ls-remote the anchor records; extension id, SEP-2663 and
the stable 2026-07-28 schema row all still read as the row states. Proposed: keep `queued`;
recheck `on-release` unchanged.

## 3. W04 duplicate (S023 and S034 on one Stryker URL)

Both rows were re-opened in the same fetch: the page served HTTP 200 (2026-10-22T19:56:51Z) with
the heading ids `Mutant states`, `Metrics`, `Test states and metrics`. S034's quote occurs
verbatim — "When at least one test failed while this mutant was active, the mutant is killed." —
and S023's teaches ("Killed = a test failed while the mutant was active; survived = all tests
passed; mutation score = detected / valid") still holds against `Mutant states` and `Metrics`.
So the duplicate is real and both rows are individually correct; the warning is about registry
shape, not about a wrong claim.

Emitter (fleet `scripts/sources-census.sh`):

    644  if (u!="" && (u in url_seen) && !(scope_key in url_scopes))
    645    printf "%s\tW04\t%s duplicate url %s across scopes\n",lane,id,u
    650  if (u!="") { url_seen[u]=1; url_scopes[scope_key]=1; if (status!="rejected") url_scope_nonrejected[scope_key]=1 }

W04 is keyed on `url` plus `scope` within one registry file. The lane contract fixes the editable
set: "**Append-only.** Only `status`, `recheck` and `used-by` change in place"
(SOURCES-CONTRACT-v1.md:49-51). S034's `url` and `scope` are therefore frozen, and W04 is printed
at S034's own row. Measured today on a scratch lane root (a copy of the registry plus symlinks for
the cited paths, `validate --today 2026-10-22 <dir>`), four shapes:

E4. keep as is -> `W04 S034 duplicate url … across scopes` + `ok`, exit 0.
E5. S034 `status` -> `rejected` -> W04 still printed on S034 + `ok`, exit 0 (W04 has no status
exemption; `url_seen` is set for every row that carries a URL).
E6. append `S039` with the same URL, **S023's exact scope string**, and `teaches` opening
`supersedes S023 — …` -> no W04 and no E04 for S039; S034's W04 still printed; exit 0. (This is
the one legal way to add another row on an already-used URL, and it is what user contract rule 2
provides for corrections.)
E7. rewrite S034's `scope` to S023's and prefix its `teaches` with `supersedes S023 —` -> `ok`,
exit 0, no W04 — but this edits two frozen columns, so it is forbidden by rule 2.

Deleting S034 was not run: append-only forbids it, and it would break live citations
(`corpus/QUALITY.md` Q19, `corpus/lessons/round-39.md`), which is why it is not a candidate.

**Proposed W04 resolution (the only one the contract allows):** keep S023 and S034 exactly as
they are; record the warning, not a repair, in the round-42 `## Gate` with the command and the
one-line output above, plus the already-landed R39-6 correction pointer
(`corpus/lessons/round-40.md` `## Correction (R39-6)`). W04 is a *warning*: `sources-census.sh:33`
keeps W-codes out of the lane's status, the validator exits 0, and the lane's own gate does not
implement W04 (`scripts/sources-check.mjs:34` — "E04, W01 and other fleet checks are intentionally
outside this contract"), so no lane-side change can clear it. The only true repair is fleet-side: a
W04 exemption for same-lane rows covered by a later `supersedes` row, i.e. a
SOURCES-CONTRACT-v2 change to `sources-census.sh` — operator/integrator surface, outside this
lane's authority. Do not buy the warning away by rejecting S034: it is the only row teaching
"runtime error is not a kill", which Q19 cites.

## 4. What the two claims should take from this

- C1 (`gate-mutants`) needs a SOURCES row **opened this round** as its primary source. None of the
  five re-opened rows qualifies (all were opened 2026-10-20 or 2026-10-22 by earlier seats, and
  all remain `queued`). If C1 opens its row on the Stryker mutant-states URL, the only shape that
  does not add a *second* W04 line is E6: identical scope string to S023 plus `teaches` opening
  `supersedes S0NN —`. Any other scope on that URL prints a fresh W04 naming the new row.
- C2 (`coverage:kimi-layer`) has no registry row naming `~/.kimi-code/locks`: no `mined` or
  `queued` row and no `corpus/knowledge/` note mentions that path (only `local-ship.md:56` names
  an unrelated `.ufo/apply-locks/`). The one queued Kimi doc row re-opened here (S013, Tower)
  documents no lock file. C2 therefore needs a genuinely new row, not a recheck of an existing one.

## 5. Not done here

No lane file other than this report was written; scratch copies live under
`/fast/scratch/hyaku/kumitate-r42/seats/ScoutSourcesRecheck/`. No commit, push, or ref update
anywhere; no pacman transaction; no tool install. Observed: every quote, hash, HTTP status and
exit code above was produced by the command shown in this run. Inferred from those observations
(stated as such): the W04 invariance claim follows from the emitter lines 644-645/650-653 and
contract rule 2, and "the only true repair is fleet-side" follows from the same two facts.
