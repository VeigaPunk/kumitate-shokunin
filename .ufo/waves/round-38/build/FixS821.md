ITEM FixS821 anchors=3 move=3 token=0 move_token=0 debt=0
VERDICT remaining-scripts-census#156 MOVE 128 | pin 128 is the definition `lean_frozen_cache_digest() {`; the sentence names the function, the call at 143 is only a use, and pin 139 is `inject=()` with no symbol
VERDICT remaining-scripts-census#157 MOVE 210 | pin 210 `max_age_s=$(( ${LEAN_CARGO_SLOT_MAX_AGE_MIN:-720} * 60 ))` is the only code occurrence and carries the sentence's default 720 min; 208 and 18/30 are comment mentions; 221 is `    fi` with no symbol on 218-221
VERDICT remaining-scripts-census#158 MOVE 312 | pin 312 "# even when rc != 0: a failed `cargo test` still produced a fresh ufo binary" is the sole literal occurrence and a documentation comment stating the sentence's rule; no code token exists (publish gate 315 has no rc test; 322 shares no token with the sentence)

Evidence:
1. Pin identity: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7.
2. Note identity: `git hash-object corpus/knowledge/remaining-scripts-census.md` (working copy) = 1ecb95baa61fb0033f775a43d41f60a5118d2575 = `git rev-parse 753446a829edda519c75777ce95888443f51fa94:corpus/knowledge/remaining-scripts-census.md`; the text under review is the revision's.
3. Note line 555 sentences: "`lean_frozen_cache_digest` (`:139`) gates the `--frozen`/offline preflight…"; "Idle slots past `LEAN_CARGO_SLOT_MAX_AGE_MIN` (default 720 min) are reaped (`:221`)"; "…publish back to the convoy bin pool even when `rc != 0` (`:322`)".
4. Literal grep on pin: lean_frozen_cache_digest → 128 (def), 143 `digest="$(lean_frozen_cache_digest)"`; LEAN_CARGO_SLOT_MAX_AGE_MIN → 18, 30 (header comments), 208 (comment), 210 (code); `rc != 0` → 312 only. The L1's first six rc hits (92, 93, 100, 280, 300, 303) are assignments (`rc=0`, `|| rc=$?`, `rc=$?`), not the literal token.
5. Choice rule: definition over call; code over comment; comment only when the literal occurs in no code line and the comment states the claim (applied only to 312).
6. #156 prose true: 146-159 cache keyed by digest; 165-168 `run_cargo --frozen metadata` sets use_frozen=1 and cok=1 only on success; 156 sets use_frozen=1 only for cached cok=1, so a network-needing workspace is never frozen. No DEBT.
7. #157 prose true: 210 reads the knob in minutes, x60 to seconds, default 720; reap 218 `if [[ -d "$s" ]] && …`, 219 `flock -n "$lockfd" && rm -rf "$s" "$s.wrk"`, 221 `    fi`. No DEBT.
8. #158 prose true: publish gate 315 `if [[ -n "${slot:-}" && -d "$CONVOY" ]]; then` has no rc test; 322 `if [[ ! -e "$dst" || "$f" -nt "$dst" ]]; then` is the freshness test. Exits inside the build path are 297 (inside bash -c) and 343 `exit "$rc"` after publish; 40 (no rustup) and 107 (clean path, 88-110) are outside it. Publish runs for any rc. No DEBT.
9. Round-36 value 12 for #156 is header line 12 (`CARGO_NET_OFFLINE=true, --frozen -q (deduped),`), no symbol, so wrong. Round-36 312 for #158 matches my choice, but I reached it from the literal search, not by copying.
10. Residual risk (#158): if the L1 counts comment occurrences as mere mentions, the only fallback is DEBT (no code token; publish gate has no rc test). Not chosen: the comment states the rule verbatim and the code confirms it.
11. Out of item, not judged: `have` (`:136`) is defined at 125 (`have() {`); `BUILD_FAMILY=` (`:128`) is defined at 117.
12. Installs/updates: none. Read-only commands only (git rev-parse, git hash-object without -w, file reads). No lane, pin, or sibling state touched.
