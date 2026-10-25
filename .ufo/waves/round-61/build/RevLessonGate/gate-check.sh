#!/usr/bin/env bash
# Usage: gate-check.sh <draft.md>
f="$1"
[ -s "$f" ] || { echo "DRAFT_ABSENT $f"; exit 3; }
gate=$(sed -n '/^## Gate/,/^## [^G]/p' "$f" | sed '$!b;/^## [^G]/d')
echo "== gate section lines: $(printf '%s\n' "$gate" | grep -c .)"
echo "== Q21 cmd (literal) Reject|Hold bullets: $(sed -n '/^## Gate/,/^## /p' "$f" | grep -cE '^- \*\*(Reject|Hold)')"
echo "== Q21 cmd (literal) no-reject line: $(sed -n '/^## Gate/,/^## /p' "$f" | grep -c '^- no reject this round')"
echo "== bold decision bullets (Admit|Re-open|Reject|Hold):"
printf '%s\n' "$gate" | grep -nE '^- \*\*(Admit|Re-open|Reject|Hold)'
echo "== bullets NOT opening with a verdict word (non-logging):"
printf '%s\n' "$gate" | grep -nE '^- ' | grep -vE '^[0-9]+:- \*\*(Admit|Re-open|Reject|Hold)' | grep -v 'New row, logged'
echo "== uppercase/unbulleted verdict words:"
printf '%s\n' "$gate" | grep -nE '^(ADMIT|REJECT|HOLD|RE-OPEN|Admit|Reject|Hold)\b'
echo "== flip mentions per Reject/Hold bullet (paragraph-joined):"
printf '%s\n' "$gate" | awk '/^- /{if(b!="")print b; b=$0; next} /^$/{if(b!="")print b; b=""; next} {if(b!="") b=b" "$0} END{if(b!="")print b}' \
  | grep -E '^- \*\*(Reject|Hold)' | while IFS= read -r l; do
    c=$(printf '%s' "$l" | grep -ciE 'flip'); q=$(printf '%s' "$l" | grep -oE '\bQ[0-9]+\b|one-theme|one theme|duplicate|same-document|same document' | sort -u | tr '\n' ',')
    echo "flip=$c criterion=[$q] :: ${l:0:110}"; done
echo "== placeholder tokens:"
grep -nE 'TBD|TODO|FIXME|XXX|<[a-z_ -]+>|\{\{|\}\}|\?\?\?|PLACEHOLDER|<rev>|<sha>|<hash>|<N>|\.\.\.\s*$|…\s*$' "$f"
echo "== source ids named:"; grep -oE '\bS[0-9]{3}\b' "$f" | sort | uniq -c | tr '\n' ' '; echo
