DRAFT SOURCES rows — contract-v1 shape (11 columns), for the live registry at lane tip `509afb1d`
(working tree). Proposed ids: **S236, S237, S238**. High-water mark read from the live
`corpus/SOURCES.md` at 2026-11-04T09:00Z was **S235**, so these continue the registry without collision.
Copy these rows verbatim into `corpus/SOURCES.md` under the registry table if the L1 lands the drafts.

| S236 | GitHub Actions — Contexts (`steps.<step_id>.outcome` and `.conclusion`) — https://docs.github.com/en/actions/reference/workflows-and-actions/contexts | docs | A | GitHub Actions' own step-status vocabulary: the same step's pre-policy result and post-policy result are two separately readable properties | § steps context, `steps.<step_id>.conclusion` row; fetched 2026-11-04, HTTP 200, 1,017,423 bytes, sha256 4e2c0ffd5c3ae6ba5f45adc97c277e1803a87a89497a4b91cc40b497c6c09157; capture .ufo/waves/round-80/w1/K80ScribeKnowledge/captures/gha-contexts.html line 1190 | A check keeps its own verdict beside the aggregate verdict: "When a continue-on-error step fails, the outcome is failure, but the final conclusion is success." | mined | 2026-11-04 | 180d | corpus/knowledge/two-reading-verdicts.md |
| S237 | GitLab — CI/CD YAML reference, `allow_failure` — https://docs.gitlab.com/ci/yaml/#allow_failure | docs | A | GitLab CI's job-versus-pipeline status separation: a failed job need not fail the pipeline, and the job keeps its failed status | § allow_failure; fetched 2026-11-04, HTTP 200, 731,768 bytes, sha256 93f94544e3069ceb0f801cc5163dda360bb1acb9ec12a80737b7577c4a03bf27; capture .ufo/waves/round-80/w1/K80ScribeKnowledge/captures/gitlab-ci-yaml.html line 478 | A job's own failure and the pipeline's verdict are separate readings: "Use allow_failure to determine whether a pipeline should continue running when a job fails." | mined | 2026-11-04 | 180d | corpus/knowledge/two-reading-verdicts.md |
| S238 | npm — package-lock.json — https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json | docs | A | npm's committed lockfile: the resolved tree is re-derived from the file, and each unpacked artifact is trusted through an integrity hash | § Description and § integrity; fetched 2026-11-04, HTTP 200, 537,925 bytes, sha256 0fa22b199471adbb3c95dd85de12a582d9d8f5b3610ca95b22b117f37e694d50; capture .ufo/waves/round-80/w1/K80ScribeKnowledge/captures/npm-package-lock.html lines 46 and 110 | A committed lock re-derives an identical tree "regardless of intermediate dependency updates", and its `integrity` field is an SRI hash of the unpacked artifact | mined | 2026-11-04 | 180d | corpus/knowledge/snapshot-bound-derived-scores.md |

## Reused row (no new id)

S234 (HashiCorp Terraform, Dependency Lock File) already exists in the live registry with
`used-by corpus/knowledge/snapshot-bound-derived-scores.md`. This seat re-opened the page and matched the
committed entry's two quotes against its own capture (`.ufo/waves/round-80/w1/K80ScribeKnowledge/captures/terraform-dependency-lock.html`,
sha256 b155ff6de62519b4233f53f1228338c742f7d8b09ca1b09c178fd91cfa0cb4dd): *Introduction* at lines 13–15
("Terraform remembers the decisions it made in a dependency lock file …") and *Lock file location* at
line 27 ("You should include this file in your version control repository …"), plus *Checksum
verification* at line 49 ("the checksums it previously recorded in the lock file"). No row change is
needed for S234; its `used-by` already names the entry path.

## Notes for the applier

- Two rows per entry at most: Entry A cites S236 + S237; Entry B cites S234 (existing) + S238.
- `opened` is the access date of this seat's own fetch; every capture was taken by this seat on
  2026-11-04 and is delivered under `../captures/`.
- If the L1 keeps the live entry grounds instead (Entry A on S119, Entry B on S234 alone), these three
  rows must **not** be appended: they would be `mined` rows with no citing entry, which the corpus
  contract forbids.
