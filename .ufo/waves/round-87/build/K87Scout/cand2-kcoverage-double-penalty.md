# Candidate 2 — `K_findings` double penalty on a MISSING member

Seat K87Scout, read-only. Fixtures are synthetic kimi roots (`build/K87Scout/fixtures/mk-kimi2.sh`),
never `~/.kimi-code` itself. The live census was run read-only (`verify`).

## Formula and anchors

- `scripts/proxy-check.mjs:838-841` `kCoverage(covered,total,sections,members,findings)`:
  `return Math.floor(10 * (covered / total) * (sections / members) * (members - findings) / members);`
  (`:840`). `:839` returns 0 when `members === 0`.
- `scripts/proxy-check.mjs:883-884` `kMembers(kimiRoot)` → `decide()` from `kimi-census.mjs`.
- `scripts/proxy-check.mjs:963, 969-972`: `members = kimi.members`; `K_members`, `K_sections`,
  `K_findings = kimi.findings.length`, `coverage_kimi = kCoverage(…, members, kimi.findings.length)`.
- `scripts/kimi-census.mjs:304-306`: an absent member → `state='missing'; live=0; checked=0;` and
  `err('MEMBER_MISSING', …)` (a finding).
- `scripts/kimi-census.mjs:337`: `identities.add(m.path)` ONLY when `live > 0` → an absent member leaves the
  identity set, so `kSections` (`proxy-check.mjs:909-915`) cannot bind its heading.
- `scripts/kimi-census.mjs:360, 365`: `fam.members += live` → an absent member contributes 0 to `members`.

So one absent member: `members` −1 (denominator), `sections` −1 (its `## ` heading unbound), and
`findings` +1 (the `MEMBER_MISSING`). `sections/members` cancels; the `(members − findings)/members` factor
then charges the same member a second time, against a denominator that is already reduced.

## Measured matrix (`build/K87Scout/kimi-fixture-matrix.txt`, raw in `build/K87Scout/raw/proxy-kf*.json`)

Command per row: `node scripts/proxy-check.mjs --json --kimi-root <fx>` (run from the live lane, read-only).

| fixture | K_members | K_sections | K_findings | coverage_kimi | as-written value |
|---|---|---|---|---|---|
| kf2 baseline | 55 | 55 | 0 | 10 | 10.00 |
| kf3 bin/fd absent | 54 | 54 | 1 | 9 | 9.81 |
| kf4 mcp.json mode 0200 (present, shape drift) | 55 | 55 | 1 | 9 | 9.82 |
| kf5 skills/ absent | 48 | 48 | 1 | 9 | 9.79 |
| kf6 15 declared members absent | 40 | 40 | 15 | **6** | 6.25 |
| kf7 15 undeclared root strays (all members present) | 55 | 55 | 15 | **7** | 7.27 |

Census agreement: `node scripts/kimi-census.mjs verify --root <fx>` → kf6 `DRIFT (MEMBER_MISSING config.toml; …; +9 more)`,
kf7 `DRIFT (UNLISTED stray-1.txt; …; +9 more)`; both `errors=15`.

Same finding count (15), different score: absence scores 6, stray scores 7. The gap is the denominator
reduction plus the finding charge on the same member. Fixture kf4 shows the score is not an artefact of
absence: a present member with a shape drift scores 9 (one finding, denominator intact).

Note on kf: `build/K87Scout/raw/` was not kept for the first fixture `kf` (its `agents/secondary` file names did
not match the headings, `K_sections=30`); it is excluded from the matrix on purpose.

## Round-88 pre-registration candidate

Declared universe fixed at 55 (`K_members` read live but its absent members still counted in the
denominator), with |findings| matched: a claim measures whether `coverage_kimi(absent k)` equals
`coverage_kimi(stray k)`. A single-counted formula predicts 7 at k=15; today absence reads 6.

## Scope note

`K_findings` for a SHAPE_DRIFT member (kf4) is charged the same way; the candidate is the absent-member case,
not all findings.
