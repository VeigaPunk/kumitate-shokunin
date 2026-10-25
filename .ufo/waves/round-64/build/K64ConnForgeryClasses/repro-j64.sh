#!/usr/bin/env bash
# repro-j64.sh — reproducible proofs of open forgeries against J64 probe
set -euo pipefail

echo "=== J64 Repro 1: Tautological Echo Demo Script passes J6 ==="
node -e '
const entryDemoSection = `
## Demo outcomes
- workspaces_after_add=2
- seat_gets_base_file=yes
- seat_has_git_dir=no
- seat_file_in_default_tree=no
- default_status_clean_after_seat_write=1
- seat_snapshot_in_shared_op_log=2
- ignore_working_copy_adds_op=no
- rewrite_seat_head_seat_state=fresh
- rewrite_seat_head_description_seen=rewritten
- abandon_seat_head_seat_state=stale
- abandon_seat_head_files_on_disk=kept
- update_stale_recovers=yes
- absolute_path_write_seen_in_default=1
- workspaces_after_forget=1
- seat_dir_after_forget=present
`;
const stated = new Map();
for (const l of entryDemoSection.split("\n")) {
  const m = /^-\s+([a-z0-9_]+)=(.*?)\s*$/.exec(l);
  if (m) stated.set(m[1], m[2]);
}
// Simulated echo demo script (grep -E "^-\s+[a-z0-9_]+=" entry.md | sed "s/^- /JJ_SEAT: /")
const live = new Map();
for (const [k, v] of stated) live.set(k, v);

const bad = [];
for (const [k, v] of live) if (stated.get(k) !== v) bad.push(`${k}:stated=${stated.get(k)}:live=${v}`);
for (const k of stated.keys()) if (!live.has(k)) bad.push(`${k}:stated-not-live`);
console.log("J6 errors with echo demo (want 0):", bad.length);
'

echo "=== J64 Repro 2: 3-line Amendment Tail passes J8 ==="
node -e '
const baseP = "dummy base content for agent-isolation-substrates.md";
const tail = "\n\n### Amendment 2026-10-25\nSee corpus/knowledge/jj-workspace-seat-containment.md for M7.\n";
const now = Buffer.from(baseP + tail);
const baseBytes = Buffer.from(baseP);

const bad = [];
if (!now.subarray(0, baseBytes.length).equals(baseBytes)) bad.push("base-bytes-not-a-prefix");
const tailStr = now.subarray(baseBytes.length).toString("utf8");
if (!/^#{1,3}\s.*Amendment 2026-10-25/m.test(tailStr)) bad.push("no-amendment-heading");
if (!tailStr.includes("corpus/knowledge/jj-workspace-seat-containment.md") || !/\bM7\b/.test(tailStr)) bad.push("amendment-lacks-entry-or-M7");
console.log("J8 errors with 3-line dummy amendment (want 0):", bad.length);
'

echo "=== J64 Repro 3: 1-word Common Quotes pass J4 ==="
node -e '
const capText = "Jujutsu is a Git-compatible VCS with working copy and commit concepts";
const norm = (s) => s.replace(/\s+/g, " ").trim();
const bullets = [
  { id: "S198", q: "Jujutsu" },
  { id: "S198", q: "Git" },
  { id: "S199", q: "working copy" },
  { id: "S199", q: "commit" }
];
const ids = ["S198", "S199"];
const bad = [];
if (bullets.length < 4) bad.push("bullets");
for (const id of ids) if (!bullets.some((b) => b.id === id)) bad.push(`${id}:no-bullet`);
for (const b of bullets) {
  if (b.q.trim().split(/\s+/).length > 25) bad.push("over-25-words");
  if (!capText.includes(norm(b.q))) bad.push("not-in-cap");
}
console.log("J4 errors with 1-word generic quotes (want 0):", bad.length);
'

echo "=== J64 Repro 4: Recheck Field accepts arbitrary text ==="
node -e '
const head = "source: S198 S199\nverified-at: 2026-10-25\nrecheck: echo-pass\n";
const hasRec = /^recheck:\s*\S+/m.test(head);
console.log("J1 recheck accepted (want true):", hasRec);
'
