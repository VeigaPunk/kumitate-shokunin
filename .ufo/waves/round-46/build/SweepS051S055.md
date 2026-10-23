RESULT SweepS051S055 rev=516977af verdict=defects rows=5 defects=5

Anti-loop re-open of SOURCES.md rows S051–S055 at 516977af2216b1cc426ee970d260dee53714bf4f
(rows = SOURCES.md lines 64–68). Admission quotes: corpus/lessons/round-43.md:95–99 (Gate rejects
S051/S052), round-44.md:60–68 (Gate admits S053/S054/S055), plus each row's own teaches quote;
spotchecks r43-verifier-spotcheck:146–147 / r44-verifier-spotcheck:150–151 both record "agree".
All sources re-opened by ordinary means only (curl, raw.githubusercontent.com at the pinned rev,
git ls-remote, SE API, installed `omp --version`, repo grep over the v18.12.6 tag tarball, then
deleted). No installs; pacman untouched. Every defect below is a literal-source-check finding:
the underlying content claims all verified true against the fetched tag bytes, and the two rejects
still stand — the defects are record imprecision, not wrong substance.

ROW S051 verdict=pin-drift (reject otherwise substantiated verbatim)
  curl https://circleci.com/blog/what-is-mutation-testing/ (3 fetches, UA variants) → HTTP 200,
  143517 B, body sha256 814548b7…086f2 (byte-stable today), but row records "body sha256
  47f2a1f0…f951": recorded pin does not match current bytes (page is undated prose, no version).
  Gate quote verbatim in fetched text: "A floor of 60–80% on high-risk modules is the realistic
  target." Anchor § "When should a team start using mutation testing?" found; "Don't chase 100%."
  found (it is a paragraph sentence, not a bullet); datePublished "2026-06-25" in page JSON-LD.
  Reason clauses verified in bytes: no counting command/sample/revision attached to the threshold;
  "Most tools count timeouts as killed" present verbatim. Reject stands; digest alone drifted.

ROW S052 verdict=reason-wrong (one clause; reject still stands)
  SE API api.stackexchange.com/2.3/questions/73439324/answers?filter=withbody → HTTP 200,
  3475 B, sha256 b432387e…78195a; question page itself is a bot-walled HTML fetch (not retried).
  Gate quote verbatim in answer 74067880: "Such a syntactical change to the source code that does
  not change the semantics is called an equivalent mutant." Score 1, is_accepted false — anchor ok.
  Defect: reason clause "its two answers disagree on the remedy" is wrong — both answers converge
  on the remedy (answer 74067880: "You need to live with those, it does not make sense to change
  the code"; answer 73447929 score 0: code "definitely correct", "no space for us to modify the
  program without changing the behaviour"). They disagree on diagnosis only. Already disclosed at
  round-43.md:231 ("S052 'answers disagree' overstated; every reject still stands"). "Normative
  content only points at the PIT mutators page" verified (the answer's only citation is the
  pitest.org/quickstart/mutators quote). Q2 clause stands alone; reject stands.

ROW S053 verdict=teaches-overstates (locator gaps only; every name verified in file)
  raw.githubusercontent.com/can1357/oh-my-pi/45c35e40…/packages/utils/src/dirs.ts → HTTP 200;
  sha256 2d423f4f…207f24 == pinned. ls-remote: refs/tags/v18.12.6 == 45c35e40 (annotated-tag
  deref also 45c35e40… tag object → commit match); main HEAD 0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0;
  dirs.ts @0b5c27ab sha256 identical (anchor's "identical on main" re-verified). Host `omp --version`
  → omp/18.12.6. Gate quote verbatim at :1007. Defect: teaches lists "sessions" and "blobs" as
  located members, but declared locators are 29, 368-370, 952-991, 1007-1035, 1037-1050 —
  sessions (:999) and blobs (:1004) sit in the unanchored 992–1006 gap, and predict's
  agentSubdir call is :992, one line past 952-991. All 16 listed names verified present as
  agentSubdir members in the fetched file (agent.db:954, last-changelog-version:959,
  history.db:964, models.db:969, cache via path.join at :974-983, skill-descriptions.db:987,
  sessions:999, blobs:1004, themes:1009, tools:1014, commands:1019, prompts:1024, memories:1034,
  terminal-sessions:1039, custom-session-files:1049).

ROW S054 verdict=teaches-overstates (names absent from locators; claim compositionally true)
  …/packages/utils/src/sqlite.ts → HTTP 200; sha256 4a60657a…05d02b == pinned. Gate quote
  verbatim at :193 ("const backupPath = `${dbPath}.corrupt-${Date.now()}-${crypto.randomUUID()}`;");
  :12 SQLITE_STORE_SUFFIXES = ["-wal","-shm","-journal",""]; :199-200 chmodSync(dbPath+suffix,
  0o600) then copyFileSync to backupPath+suffix — verbatim, one line inside 197-200.
  Defect: teaches names "history.db/agent.db corrupt chains" but every declared locator is the
  generic dbPath helper; neither filename occurs in the fetched file. The chain is true in the
  tag (composition): openSqliteDatabase{,Sync} callers with recoverCorruption reach
  quarantineCorruptSqliteStore (:252-265); history.db goes through
  coding-agent/src/session/history-storage.ts:204 { recoverCorruption: true } and
  session-index.ts:82 via getHistoryDbPath() — but that grounding lives outside the row's locators.

ROW S055 verdict=teaches-overstates (same locator-gap class; claim true by composition)
  …/packages/ai/src/auth/sqlite-credential-store.ts → HTTP 200; sha256 11bfdcd9…4e2673 == pinned.
  Gate quote verbatim at :594 "await fs.chmod(dbPath, 0o600);"; "{ recoverCorruption: true }"
  verbatim at :601, both inside the 590-601 locator. Defect: teaches names "agent.db" and the
  "agent.db.corrupt-* family" but the literal "agent.db" never occurs in the file; the binding is
  at :580 (dbPath default = getAgentDbPath(), imported :14 from utils/dirs → "agent.db" :954),
  outside the declared 590-601 locator, and the .corrupt-* name itself comes from utils/sqlite.ts
  :193 (S054), not this file. Compositionally true (credential store open() at :580-601 does set
  agent.db to 0o600 and opts into corruption quarantine), overstated only against locators.

Residual risk: all three overstate flags are locator-coverage defects under the r45 K3' literal
rule (teaches text must not exceed quote + anchor locators), not content errors — the claims are
verifiably true inside the same pinned tag and would stand if each row gained the missing locators.
S051's digest mismatch is provenance-only on a rejected row; quote and reason re-verify at today's
bytes. If the sweep counts only load-bearing defects: substance defects = 0; record defects = 5.
