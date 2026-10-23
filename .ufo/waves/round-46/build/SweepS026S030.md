RESULT SweepS026S030 rev=516977af verdict=clean rows=5 defects=0

Anti-loop re-open of SOURCES.md rows S026–S030 at 516977af2216b1cc426ee970d260dee53714bf4f.
All fetches to /fast/scratch/hyaku/kumitate-r46/seats/w1-SweepS026S030/; no lane file touched; no fixes made.
Tool installs: none needed (curl, git, node, python3 already present). pacman untouched.

ROW S026 verdict=holds
- admission quote (corpus/lessons/round-35.md:60): «The Tasks extension lets a receiver return a durable task handle so the requester can follow progress and retrieve the result later.»
- re-open: `git ls-remote https://github.com/modelcontextprotocol/ext-tasks HEAD refs/heads/main` → b3d28aceaa6d49f5f92258e3d06b61ad6f111e84 (both refs) — pin b3d28ace UNCHANGED since ls-remote 2026-10-20.
- `curl raw.githubusercontent.com/.../ext-tasks/b3d28ace/README.md` → HTTP 200, sha256 69eeb67205d3cc3110fd6d5e06377691194940c667746fbdf55a8920e6acf804, 3427 B.
- quote verbatim at README.md:7 under `## Why Tasks?` (literal match, zero-normalization).
- teaches "Extension id io.modelcontextprotocol/tasks from SEP-2663; durable task handle with later retrieval; stable schema 2026-07-28": id+SEP literal at line 3, `**Extension Identifier:**` at line 11, durable-handle sentence at line 7, `| 2026-07-28 | Stable |` at line 21 under `## Schemas`. Fully located.

ROW S027 verdict=holds
- admission quote (round-35.md:61, re-quoted round-45.md:26): «Document the fact that .git/info/exclude is shared across worktrees linked to the same repository.»
- re-open: `curl raw.githubusercontent.com/git/git/v2.55.0/Documentation/RelNotes/2.55.0.adoc` → HTTP 200, sha256 14b333ba079a289afc2658747f19a0ede80751426208e76af6edcf39ea42f1b4; tag pin (immutable).
- quote verbatim, single sentence across lines 38–39, exactly as anchored (matched modulo the hard-wrapped line break).
- teaches ".git/info/exclude is shared by every worktree linked to one repository" = faithful paraphrase of the bullet.
- teaches negative "the v2.55.0 git-worktree page does not say so": `curl .../git/v2.55.0/Documentation/git-worktree.adoc` → HTTP 200, sha256 9dffe46a7cb20420ea638a59b0c8e103ea0a783c4900f68258343c05ff411c9c; `grep -ci exclude` → 0 (the file has zero 'exclude' occurrences). Served page git-scm.com/docs/git-worktree/2.55.0 is a 301→608-byte redirect stub, so the authoritative rendered source was used. Negative verified on the literal term.

ROW S028 verdict=holds
- admission quote (round-35.md:62): «persists changes only when graph execution exits — successfully, with an error, or due to a human-in-the-loop interrupt»
- re-open: `curl https://docs.langchain.com/oss/python/langgraph/checkpointers` → HTTP 200, sha256 327beef0afa420222d65488175f4c124b66318e120ab8203b6e6a226875714b7, 1326496 B.
- quote verbatim in the `exit` bullet under `## Durability modes` (tag-stripped text match; em-dashes literal).
- page JSON-LD dateModified 2026-09-28T09:34:08.127Z — matches anchor's recorded 2026-09-28T09:34:08Z.
- teaches "exit persists only on graph exit" supported by the quoted bullet; "sync persists before each next step" supported by `"sync": LangGraph persists changes synchronously before the next step starts.`; "durability trades write timing for crash safety" supported by section intro ("three durability modes that let you balance performance and data consistency") plus exit bullet's crash caveat. Nothing beyond locators.

ROW S029 verdict=holds
- own-work locator: private clone /fast/scratch/kumitate-r36/src no longer exists (stale provenance path), but the same repo lives at /home/vgpnk/Projects/ufo-fsd-alpha (contains commit 31c465f1) and the pin's canonical clone /fast/scratch/hyaku/kumitate-pin/src is present at HEAD 31c465f15669.
- re-open: scratch clone `git clone -q --no-hardlinks` + detached checkout → `rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7 (matches locator's full sha).
- `ls crates/ufo-core-runtime/src/*.rs | wc -l` → 88; `ls crates/ufo-cli/src/*.rs | wc -l` → 4; 88+4=92 runtime members ✓.
- claims probe walk: `node scripts/claims-check.mjs --src <scratch>/ufo-src --row R5 --row R7 --strict` (systemd-run scope, lane clone at 516977af) → `CLAIMS: MATCH (rows=2 yes=2 notes=2 sections=9 adv=0 src-rev=31c465f15669)` exit 0; R5 4, R7 5 — matches locator.
- full R1–R11 run → SECTIONS: 95 with 3 adv=SECTION_FILE_NOT_MEMBER (R9 test files outside family) → 92 distinct in-family = R_members=92 ⇒ 9/92 and 92/92 => 10 in teaches all confirmed. The "83 -> 92" before-side is a round-36-era measurement; after-side reproduces exactly.

ROW S030 verdict=holds
- admission quote (round-36.md:48): "This will make XPASS (“unexpectedly passing”) results from this test to fail the test suite." — `printf … | wc -w` = 15, matching the recorded (15 words).
- re-open: `curl https://docs.pytest.org/en/stable/how-to/skipping.html` → HTTP 200, sha256 be247f45372da91970b6d04cdfe1aa4023926f1da402e5d9ad2ffa9403273efe, 61623 B.
- quote verbatim in the `strict parameter` section under `<h3 id="strict-parameter">` (matched after tag-strip + whitespace collapse; curly quotes literal in bytes).
- teaches tail "A strict expectation that stops firing is itself an error" supported by surrounding text: "Both XFAIL and XPASS don’t fail the test suite by default. You can change this by setting the strict keyword-only parameter to True" — strict flips the default, so a passing xfail fails the suite. Nothing beyond locators.
- row's 404 note: `curl https://docs.pytest.org/en/stable/how-to/skip.html` → HTTP 404 — old path still dead, successor page live. Anchor accurate.

No rejected rows in S026–S030 (all status queued or mined), so no reject-reason checks apply.
Residual: S029's provenance path /fast/scratch/kumitate-r36/src is gone; source remains fully reproducible via Projects/ufo-fsd-alpha and the pin clone. Not a defect.
