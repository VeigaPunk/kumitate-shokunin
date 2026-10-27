#!/usr/bin/env bash
# K66SentinelTool — adversarial safety probes for scripts/routed-ledger.mjs.
# Reproduces every finding in review.md. Read-only against the lane: the tool is
# copied to $S and all fixtures live under $S (deleted by the caller).
set -u
S=${S:-/fast/scratch/hyaku/kumitate-r66/K66SentinelTool}
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
T=$S/tool.mjs
mkdir -p "$S/tmp"
cp "$LANE/scripts/routed-ledger.mjs" "$T"
run() { printf '\n$ %s\n' "$*"; "$@"; printf 'EXIT=%s\n' "$?"; }

echo "tool sha256: $(sha256sum "$T" | cut -d' ' -f1)"
echo "tool at freeze 621212ba: $(git -C "$LANE" show 621212bac37f8249c72ac982d1d6534cb8d60701:scripts/routed-ledger.mjs | sha256sum | cut -d' ' -f1)"
echo "node $(node --version)  git $(git --version | awk '{print $3}')"

# ---- fixture (mirrors the selftest's own clean fixture)
rm -rf "$S/fx"; mkdir -p "$S/fx/corpus/lessons" "$S/fx/notes"
printf '# R55\n\n## Routed defects for round 56\n\n- **D1 — the readme row is missing.** The map reads DRIFT.\n- **D2 — tier counts are wrong** in the report.\n\n## 6. Non-author statement\n\n- not routed\n' > "$S/fx/corpus/lessons/round-55-verifier-spotcheck.md"
printf '# routed ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n| R55-D1 | 55 | 1 | "the readme row is missing" | reference-drift | closed | `notes/answers.md:1` — "the readme row and its pin landed" |\n| R55-D2 | 55 | 2 | "tier counts are wrong" | tally-drift | open | - |\n' > "$S/fx/corpus/routed-ledger.md"
printf 'fixed R55-D1: the readme row and its pin landed\n' > "$S/fx/notes/answers.md"

echo '================ A. baseline + selftest + strace'
run node "$T" --root "$S/fx" --from 55 --to 55 --classes
TMPDIR=$S/tmp strace -f -q -e trace=openat,creat,mkdir,mkdirat,rename,renameat,renameat2,unlink,unlinkat,chdir -o "$S/st.log" node "$T" --selftest | tail -1
echo "chdir targets during --selftest: $(grep -c 'chdir(' "$S/st.log")"; grep 'chdir(' "$S/st.log" | sed -E 's/^[0-9]+ +//' | sort -u
echo "absolute write-mode opens outside \$S (expect only /dev/null):"
grep -E 'O_WRONLY|O_RDWR|O_CREAT|O_APPEND|O_TRUNC' "$S/st.log" | grep -E '"/' | grep -v "$S" | sed -E 's/^[0-9]+ +//' | sort -u

echo '================ B. --rev argument injection (closed)'
run node "$T" --root "$S/fx" --from 55 --rev=--output=/x
run node "$T" --root "$S/fx" --from 55 --rev --output=/x
for r in -q -1 -n1 -h -v -b - --quiet; do printf 'rev=%-8s ' "$r"; node "$T" --root "$S/fx" --from 55 --rev "$r" | tail -1; done

echo '================ C. answer paths: absolute / .. / symlink outside root'
cp -r "$S/fx" "$S/fxC"; sed -i 's|`notes/answers.md:1` — "the readme row and its pin landed"|`/etc/passwd:1` — "root:/root:/usr/bin/bash"|' "$S/fxC/corpus/routed-ledger.md"
run node "$T" --root "$S/fxC" --from 55 --to 55
printf 'the outside answer: readme row and its pin landed\n' > "$S/outside-answer.md"
cp -r "$S/fx" "$S/fxL"; ln -sf "$S/outside-answer.md" "$S/fxL/notes/outside.md"
sed -i 's|`notes/answers.md:1` — "the readme row and its pin landed"|`notes/outside.md:1` — "the outside answer: readme row and its pin landed"|' "$S/fxL/corpus/routed-ledger.md"
run node "$T" --root "$S/fxL" --from 55 --to 55
echo "root=$(realpath "$S/fxL")  answer-target=$(realpath "$S/fxL/notes/outside.md")"

echo '================ D. ledger self-answer through an alias (guard is lexical)'
cp -r "$S/fx" "$S/fxA"; ln -s routed-ledger.md "$S/fxA/corpus/ledger-link.md"; ln "$S/fxA/corpus/routed-ledger.md" "$S/fxA/corpus/ledger-hard.md"
printf '# routed ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n| R55-D1 | 55 | 1 | "the readme row is missing" | reference-drift | closed | `corpus/routed-ledger.md:8` — "tier counts are wrong" |\n| R55-D2 | 55 | 2 | "tier counts are wrong" | tally-drift | closed | `corpus/ledger-hard.md:8` — "tier counts are wrong" |\n' > "$S/fxA/corpus/routed-ledger.md"
run node "$T" --root "$S/fxA" --from 55 --to 55

echo '================ E. --ledger escaping the root'
cp "$S/fx/corpus/routed-ledger.md" "$S/outside-ledger.md"
run node "$T" --root "$S/fx" --from 55 --to 55 --ledger ../outside-ledger.md
echo "ledger actually read: $(realpath "$S/fx/../outside-ledger.md")"
run node "$T" --root "$S/fx" --from 55 --to 55 --ledger /etc/passwd
run node "$T" --root "$S/fx" --from 55 --to 55 --ledger ../../../../../../../etc/passwd

echo '================ F. GIT_DIR hijacks the selftest git fixture (repo mutation)'
rm -rf "$S/lane3"; git clone -q --shared "$LANE" "$S/lane3"
echo "before: $(git -C "$S/lane3" rev-parse --short HEAD) commits=$(git -C "$S/lane3" rev-list --count HEAD)"
D=$(mktemp -d "$S/probe.XXXXXX"); echo "guard target (temp dir): $D"
GIT_DIR="$S/lane3/.git" git -C "$D" rev-parse --show-toplevel
GIT_DIR="$S/lane3/.git" TMPDIR="$S/tmp" node "$T" --selftest | tail -1
echo "after:  $(git -C "$S/lane3" rev-parse --short HEAD) commits=$(git -C "$S/lane3" rev-list --count HEAD)"
git -C "$S/lane3" log --oneline -2
echo "worktree entries now reported deleted: $(git -C "$S/lane3" status --porcelain | wc -l)"
git -C "$S/lane3" show --stat --oneline HEAD | head -4
rm -rf "$D"
rm -f "$S/idx"; GIT_INDEX_FILE="$S/idx" TMPDIR="$S/tmp" node "$T" --selftest | tail -1; ls -l "$S/idx" | awk '{print "GIT_INDEX_FILE wrote", $5, "bytes at", $9}'

echo '================ G. same env redirects --rev reads (--root ignored)'
run node "$T" --root "$S/fx" --from 55 --rev 88041bc9
GIT_DIR="$S/lane3/.git" node "$T" --root "$S/fx" --from 55 --rev 88041bc9
run node "$T" --root "$S/lane3" --from 55 --rev 88041bc9

echo '================ H. O(rows x k x n) in norm: 1MB item reused by 20 rows'
node -e '
const fs=require("fs"),d=process.argv[1];
fs.rmSync(d,{recursive:true,force:true}); fs.mkdirSync(d+"/corpus/lessons",{recursive:true});
const item="- **D1 — readme row drift.** "+"<style ".repeat(9000)+"a".repeat(930000);
fs.writeFileSync(d+"/corpus/lessons/round-55-verifier-spotcheck.md",["# R55","","## Routed defects","",item,"","## 6. end"].join("\n"));
const rows=[];for(let i=1;i<=20;i++)rows.push(`| R55-D${i} | 55 | 1 | "readme row drift" | reference-drift | open | - |`);
fs.writeFileSync(d+"/corpus/routed-ledger.md",["# ledger","","## Ledger","","| id | round | item | quote | class | status | answer |","|---|---|---|---|---|---|---|",...rows,""].join("\n"));
' "$S/fxbig"
( time timeout 45 node "$T" --root "$S/fxbig" --from 55 --to 55 ) 2>&1 | tail -5; echo "EXIT(timeout)=124 means the gate did not finish in 45s"
node -e 'import(process.argv[1]).then(({norm})=>{const s="<style ".repeat(9000)+"a".repeat(930000);const a=performance.now();norm(s);console.log("single norm 1MB k=9000 ms="+(performance.now()-a).toFixed(0));const s2=("<style "+"a".repeat(100)).repeat(1800);const b=performance.now();norm(s2);console.log("single norm 192KB k=1800 ms="+(performance.now()-b).toFixed(1));})' "file://$T"

echo '================ I. no size cap; unwritable TMPDIR'
head -c 50000000 /dev/zero | tr '\0' 'a' > "$S/big50.txt"
( time node "$T" --root "$S/fx" --from 55 --to 55 --ledger ../big50.txt ) 2>&1 | tail -4
TMPDIR=/nonexistent/x node "$T" --selftest 2>&1 | head -4; echo "EXIT=$?"
echo '================ done'
