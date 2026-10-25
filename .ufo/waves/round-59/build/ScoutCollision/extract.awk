# 0-3 space id extract.
# Same row recognizer as scripts/sources-census.sh lines 40 and 615:
# 0-3 leading ASCII spaces, then '|'. Id is the trimmed second '|'-field.
# Keep ^S[0-9]{3,}$. Header "id" and separator "---" fail that pattern.
# NF=13 is not required. A Registry heading is not required.
function trim(s) { gsub(/^[ \t]+|[ \t]+$/, "", s); return s }
{
  line = $0
  if (line !~ /^ {0,3}\|/) next
  spaces = 0
  while (spaces < length(line) && substr(line, spaces + 1, 1) == " ") spaces++
  sub(/^ {0,3}/, "", line)
  n = split(line, a, "|")
  id = trim(a[2])
  if (id ~ /^S[0-9]{3,}$/) printf "%s\tspaces=%d\tnf=%d\n", id, spaces, n
}
