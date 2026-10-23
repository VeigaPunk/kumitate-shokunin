RESULT MutCensusSelftest rev=8e822511 verdict=gaps caught=26/68
Axes: operability and rule coverage. Target scripts/omp-census.mjs at 8e8225114dccb31d33fbcb76df78052807a33068; 68 single-token mutants, one at a time. Coverage finding only: pristine selftest passes; frozen P44 was not run. No tools installed.
Exact detector command for every pristine, mutated and restored run: `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node /fast/scratch/hyaku/kumitate-r44/seats/w2-MutCensusSelftest-2/lane/scripts/omp-census.mjs --selftest --work /fast/scratch/hyaku/kumitate-r44/seats/w2-MutCensusSelftest-2` (Node v24.21.0).
Expected detector: fault gives `VERDICT: FAIL` exit 1. Legend: P = `VERDICT: PASS (29 cases)` exit 0; Fn = `VERDICT: FAIL (n of 29 cases failed)` exit 1. Two pristine runs and all 68 restorations gave P; every before/restored SHA-256 was fd4d1c4e5fe385e4459c003a417c7076576598fef1e27469a7823ad0e072bba7. All post-run pgrep checks returned 1 with empty output; no fixture directories remained.
Full exact stdout/stderr, commands, changed source lines and per-mutant before/mutated/restored hashes: /fast/scratch/hyaku/kumitate-r44/seats/w2-MutCensusSelftest-2/mutation-evidence.json (sha256 0836819148ed65079f088ee97fafbeb58f1f07cf5e3fa25a3b6cef485216a376). Survived: 23 base ceilings, 12 chain anchors, four chain placeholders, one sidecar anchor, two exit paths; zero inconclusive.
| mutant | selftest verdict | caught |
|---|---|---|
| B01 L56 RULES.md: 0o644 → 0o666 | P | no |
| B02 L57 agent.db: 0o600 → 0o644 | F2 | yes |
| B03 L58 agents: 0o755 → 0o777 | P | no |
| B04 L59 blobs: 0o755 → 0o777 | P | no |
| B05 L60 cache: 0o755 → 0o777 | P | no |
| B06 L61 config.yml: 0o600 → 0o644 | P | no |
| B07 L62 custom-session-files: 0o755 → 0o777 | P | no |
| B08 L63 history.db: 0o644 → 0o666 | P | no |
| B09 L64 hooks: 0o755 → 0o777 | P | no |
| B10 L65 kimi-device-id: 0o600 → 0o644 | P | no |
| B11 L66 last-changelog-version: 0o644 → 0o666 | P | no |
| B12 L67 mcp.json: 0o600 → 0o644 | P | no |
| B13 L68 mcp.json.rea.backup: 0o600 → 0o644 | P | no |
| B14 L69 models.db: 0o644 → 0o666 | P | no |
| B15 L70 models.yml: 0o644 → 0o666 | P | no |
| B16 L71 predict: 0o755 → 0o777 | P | no |
| B17 L72 sessions: 0o755 → 0o777 | P | no |
| B18 L73 skill-descriptions.db: 0o600 → 0o644 | P | no |
| B19 L74 terminal-sessions: 0o755 → 0o777 | P | no |
| B20 L77 themes: 0o755 → 0o777 | P | no |
| B21 L78 tools: 0o755 → 0o777 | F1 | yes |
| B22 L79 commands: 0o755 → 0o777 | P | no |
| B23 L80 prompts: 0o755 → 0o777 | P | no |
| B24 L81 memories: 0o755 → 0o777 | P | no |
| B25 L82 extensions: 0o755 → 0o777 | P | no |
| L91 agent-pre-restore: C1S remove ^; C1E remove $; C1Q1 {8} → {7}; C1Q2 {6} → {5} | P; P; F14; F14 | no; no; yes; yes |
| L92 agent-recovered: C2S remove ^; C2E remove $; C2Q1 {8} → {7}; C2Q2 {6} → {5} | P; P; P; P | no; no; no; no |
| L93 history-corrupt: C3S remove ^; C3E remove $; C3Q1 {13} → {12}; C3Q2 {8} → {7}; C3Q3 {4} → {3}; C3Q4 {4} → {3}; C3Q5 {4} → {3}; C3Q6 {12} → {11} | P; P; F12; F12; F12; F12; F12; F12 | no; no; yes; yes; yes; yes; yes; yes |
| L94 agent-corrupt: C4S remove ^; C4E remove $; C4Q1 {13} → {12}; C4Q2 {8} → {7}; C4Q3 {4} → {3}; C4Q4 {4} → {3}; C4Q5 {4} → {3}; C4Q6 {12} → {11} | P; P; F5; F5; F5; F5; F5; F5 | no; no; yes; yes; yes; yes; yes; yes |
| L95 mcp-pre-disable: C5S remove ^; C5E remove $; C5Q1 {8} → {7}; C5Q2 {4} → {3} | P; P; P; P | no; no; no; no |
| L96 mcp-rea-backup-recovery: C6S remove ^; C6E remove $; C6Q1 {64} → {63} | P; P; F12 | no; no; yes |
| S1 L100 sidecar end anchor: $ → removed; S2 L100 sidecar wal suffix: wal → wla; S3 L157 base sidecar kind: kind: 'file' → kind: 'dir'; S4 L161 chain sidecar kind: kind: 'file' → kind: 'dir' | P; F13; F12; F12 | no; yes; yes; yes |
| E1 L182 EMPTY condition: === 0 → === 1 | F1 | yes |
| V1 L209 clean verdict: 'CLEAN' → 'DRIFT'; V2 L209 drift verdict: 'DRIFT' → 'CLEAN'; X1 L257 unreadable exit: return 2 → return 0; X2 L262 clean exit: ? 0 → ? 1; X3 L262 drift exit: : 1 → : 0; X4 L463 usage exit: return 64 → return 0; X5 L476 process exit propagation: exitCode → exitcode | F12; F15; F1; F12; F15; P; P | yes; yes; yes; yes; yes; no; no |
