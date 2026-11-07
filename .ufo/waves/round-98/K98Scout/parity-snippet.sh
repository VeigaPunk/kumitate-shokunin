file=$1
command -v awk >/dev/null 2>&1 || { printf "SKIP\n"; exit 0; }
rows=$(grep -cE "^\|[[:space:]]*S[0-9]{3,}[[:space:]]*\|" "$file") || exit 10
malformed=$(awk -F"|" '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ && NF!=13 {n++} END{print n+0}' "$file") || exit 11
duplicates=$(awk -F"|" '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {i=$2; gsub(/[[:space:]]/,"",i); print i}' "$file" | sort | uniq -d | wc -l) || exit 12
printf "%s %s %s\n" "$rows" "$malformed" "$(printf "%s" "$duplicates" | tr -d "[:space:]")"
