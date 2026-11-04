# K85Sentinel build artifacts — C85_C1 v2 boundary review

Lane revision: `9db0c6b5eb9111cfc5581006ba976ca2cd112792`.
Report: `../../w1/K85Sentinel.md`.

## Tool identities (measured bytes, not revisions)

- v1 at frozen rev: `scripts/counter-receipt.mjs` sha256 `190a4c1f893a5ffc0c735a63e7155c830ae9cf2ed038fe7b870bebb11c254ec0`
- v2 reference draft (L1 scratch): sha256 `61e9ba682c552f2dc6b9d19a4d2c9215a810373dccf89053b664c844baef89e0`
- hardened copy of the draft: two-line patch in `remediation.diff`

## Receipts (each file carries its own `CMD:` / `EXIT:` lines)

| File | Command | Exit | Purpose |
|---|---|---|---|
| `receipts/probe-draft.txt` | `node .ufo/waves/round-85/probe/probe85-c1.mjs --lane <draft-copy> --work <scratch>` | 0 | frozen predicate on the reference draft: `HELD held=20/20` |
| `receipts/cv-draft.txt` | `node .ufo/waves/round-85/controls/content-variation.mjs --lane <draft-copy> --work <scratch>` | 0 | `HELD held=3/3 distinct_sha=true` |
| `receipts/selftest.txt` | `node <draft> --selftest` (`HYAKU_SCRATCH=<scratch>`) | 0 | `PASS held=56/56` |
| `receipts/attack-receipt.txt` | per-case `node <draft> --receipt <fixture>` | 0/1/2 per case | receipt-content injection, encoding, 1 MiB / 8 MiB |
| `receipts/attack-src.txt` | per-case `node <draft> --receipt <r> --src <s>` | per case | `--src` extraction: comments, strings, substring, minified, declared |
| `receipts/attack-cli.txt` | per-case argv permutations, FIFO with `timeout 5`, `/dev/zero` under `ulimit -v 1048576` | 64/2/124/133 | CLI injection and liveness |
| `receipts/forgery.txt` | per-case `node <draft> --receipt <fixture>` | 0 | hidden second summary; compound hidden red+summary; Unicode-space prefixes |
| `receipts/real-task.txt` | `node <draft> --receipt .ufo/waves/{round-83,round-84}/close/*.txt` | 1/0/2 | plan real task: r83 answers match; r84 transcripts are not arm transcripts |
| `receipts/v1-probes.txt` | `node scripts/counter-receipt.mjs --receipt <fixture>` at frozen rev | 0/2 | inherited injection class at `9db0c6b5` |
| `receipts/controls-rescore.txt` | frozen probe + CV against `controls/{base,stub,noreader}` | 1 | control scores unchanged: 1/20, 0/20, 1/20; CV 0/3 |
| `receipts/probe-cheat.txt` | frozen probe against a label-keyed hash-only tool | 0 | `HELD held=20/20` without parsing |
| `receipts/cv-cheat.txt` | CV against the same tool | 1 | `UNMET held=0/3 distinct_sha=true` — CV is the discriminator |
| `receipts/probe-fix.txt` | frozen probe against the hardened copy | 0 | `HELD held=20/20` |
| `receipts/cv-fix.txt` | CV against the hardened copy | 0 | `HELD held=3/3 distinct_sha=true` |
| `receipts/selftest-fix.txt` | selftest on the hardened copy | 0 | `PASS held=56/56` |
| `receipts/dev-zero.txt` | stderr tail of `/dev/zero` under `ulimit -v 1048576` | 133 | unbounded read aborts (SIGTRAP) |
| `receipts/fifo-receipt.txt`, `fifo-src.txt`, `v1-fifo.txt` | `timeout 5 node <tool> --receipt <fifo>` (+ `--src <fifo>`) | 124 | empty by design: no output before the 5 s kill |

## Notes

- All fixtures were generated under `/fast/scratch/hyaku/kumitate-r85/K85Sentinel/` and that
  scratch root was deleted after these receipts were copied.
- No installs; no production file, frozen probe/plan/control, `SCORECARD.md`, `LOG.md`,
  `corpus/`, `SKILL.md` or other seat's subtree was modified.
