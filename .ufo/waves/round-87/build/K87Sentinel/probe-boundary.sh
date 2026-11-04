#!/usr/bin/env bash
# probe-boundary.sh — fail-closed / boundary probes for kumitate-r87 receipt-bind (C1).
# Runs the candidate instrument against adversarial receipt fixtures and prints a transcript.
# Usage: TOOL=<abs tool path> LANE=<abs lane> SCRATCH=<abs scratch> bash probe-boundary.sh
set -u
TOOL=${TOOL:?}
LANE=${LANE:?}
S=${SCRATCH:?}
REV=$(git -C "$LANE" rev-parse HEAD)
OLD=ab8f60138810981bdb1a294fe684b19b332b8a34          # rev where scripts/proxy-check.mjs differs from tip
SHA=$(git -C "$LANE" show "$REV":scripts/proxy-check.mjs | sha256sum | cut -d' ' -f1)
SHA_OLD=$(git -C "$LANE" show "$OLD":scripts/proxy-check.mjs | sha256sum | cut -d' ' -f1)
SENT="$S/work/sentinel"
rm -f "$SENT" "$SENT".*
R="$S/work/boundary"
rm -rf "$R"; mkdir -p "$R"

echo "TOOL=$TOOL"
echo "LANE=$LANE"
echo "REV=$REV"
echo "OLD=$OLD"
echo "SHA(tip proxy-check)=$SHA"
echo "SHA(OLD proxy-check)=$SHA_OLD"
echo "node=$(node --version)  git=$(git --version)"

# emit <dir> <file> <body>   (body passed with printf %b so \r\n work)
emit() { mkdir -p "$1"; printf '%b' "$3" > "$1/$2"; }

run() { # run <label> <args...>
  local label=$1; shift
  echo
  echo "### $label"
  echo "\$ node \$TOOL $*"
  node "$TOOL" "$@"
  echo "exit=$?"
}

LF=$'\n'
base_clean="rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs${LF}exit=0${LF}signal=none${LF}"

# ---------------------------------------------------------------- (1) cmd= traversal / outside lane
emit "$R/1a" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node ../../etc/passwd${LF}"
run "(1a) relative traversal token ../../etc/passwd" --dir "$R/1a" --rev "$REV" --lane "$LANE"

emit "$R/1b" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/../../etc/passwd${LF}"
run "(1b) mid-path traversal token scripts/../../etc/passwd" --dir "$R/1b" --rev "$REV" --lane "$LANE"

HSHA=$(sha256sum /etc/hostname | cut -d' ' -f1)
emit "$R/1c" r.txt "rev=$REV${LF}tool_sha256=$HSHA${LF}cmd=node /etc/hostname${LF}"
run "(1c) absolute path OUTSIDE lane, hash of that file" --dir "$R/1c" --rev "$REV" --lane "$LANE"

emit "$R/1d" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node /etc/hostname${LF}"
run "(1d) absolute path OUTSIDE lane, wrong hash" --dir "$R/1d" --rev "$REV" --lane "$LANE"

emit "$R/1e" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node /etc${LF}"
run "(1e) absolute token that is a DIRECTORY (/etc)" --dir "$R/1e" --rev "$REV" --lane "$LANE"

emit "$R/1f" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node $LANE/../kumitate-shokunin/scripts/proxy-check.mjs${LF}"
run "(1f) lane-absolute with .. prefix confusion" --dir "$R/1f" --rev "$REV" --lane "$LANE"

emit "$R/1g" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node /proc/self/environ${LF}"
run "(1g) absolute token /proc/self/environ" --dir "$R/1g" --rev "$REV" --lane "$LANE"

# ---------------------------------------------------------------- (2) receipt DIRECTORY is a symlink
emit "$R/2real" r.txt "$base_clean"
ln -s "$R/2real" "$R/2link"
run "(2a) --dir is a symlink to a directory (valid receipt inside)" --dir "$R/2link" --rev "$REV" --lane "$LANE"
emit "$R/2real" bad.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/counter-receipt.mjs${LF}"
run "(2b) same symlinked dir after a mismatching receipt is added" --dir "$R/2link" --rev "$REV" --lane "$LANE"
ln -s /etc "$R/2etc"
run "(2c) --dir symlink to /etc" --dir "$R/2etc" --rev "$REV" --lane "$LANE"

# ---------------------------------------------------------------- (3) CRLF / duplicate cmd=
emit "$R/3a" r.txt "rev=$REV\r\ntool_sha256=$SHA\r\ncmd=node scripts/proxy-check.mjs\r\nexit=0\r\n"
run "(3a) fully CRLF receipt, cmd+hash otherwise valid" --dir "$R/3a" --rev "$REV" --lane "$LANE"

emit "$R/3b" r.txt "rev=$OLD\r\ntool_sha256=$SHA\nexit=0\ncmd=node scripts/proxy-check.mjs\n"
run "(3b) MIXED endings: 'rev=OLD' has CRLF, digest+cmd LF (declares OLD, hash is TIP)" --dir "$R/3b" --rev "$REV" --lane "$LANE"
emit "$R/3b2" r.txt "rev=$OLD\ntool_sha256=$SHA\nexit=0\ncmd=node scripts/proxy-check.mjs\n"
run "(3b2) same receipt with LF everywhere (control for 3b)" --dir "$R/3b2" --rev "$REV" --lane "$LANE"

emit "$R/3c" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs${LF}cmd=node scripts/counter-receipt.mjs${LF}"
run "(3c) duplicate cmd= : correct FIRST, wrong SECOND" --dir "$R/3c" --rev "$REV" --lane "$LANE"
emit "$R/3d" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/counter-receipt.mjs${LF}cmd=node scripts/proxy-check.mjs${LF}"
run "(3d) duplicate cmd= : wrong FIRST, correct SECOND" --dir "$R/3d" --rev "$REV" --lane "$LANE"

emit "$R/3e" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}tool_sha256=${SHA_OLD}${LF}cmd=node scripts/proxy-check.mjs${LF}"
run "(3e) duplicate tool_sha256= : correct FIRST, wrong SECOND" --dir "$R/3e" --rev "$REV" --lane "$LANE"

# ---------------------------------------------------------------- (5) --dir at / and at the lane root
run "(5a) --dir /" --dir / --rev "$REV" --lane "$LANE"
run "(5b) --dir <lane root>" --dir "$LANE" --rev "$REV" --lane "$LANE"
run "(5c) --dir <empty dir>" --dir "$R/5c-empty" --rev "$REV" --lane "$LANE"

# ---------------------------------------------------------------- (6) rev= 40 hex, not a commit
emit "$R/6a" r.txt "rev=${LF}tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs${LF}"
printf '%s' "tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs${LF}" > "$R/6a/r.txt"
run "(6a) --rev 1111..(40) with a cmd-carrying receipt" --dir "$R/6a" --rev 1111111111111111111111111111111111111111 --lane "$LANE"
run "(6b) --rev <40-hex blob sha, not a commit>" --dir "$R/6a" --rev 674b2ac7a0667ddd2c7180dec879059a8481e9fb --lane "$LANE"
emit "$R/6c" r.txt "tool_sha256=$SHA${LF}"
run "(6c) unresolvable --rev + receipt WITHOUT cmd= (contract precedence: fail-closed)" --dir "$R/6c" --rev 1111111111111111111111111111111111111111 --lane "$LANE"
emit "$R/6d" r.txt "rev=1111111111111111111111111111111111111111${LF}tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs${LF}"
run "(6d) receipt pins an unresolvable rev=, --rev is good" --dir "$R/6d" --rev "$REV" --lane "$LANE"

# ---------------------------------------------------------------- (7) shell injection via cmd=
emit "$R/7a" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs; touch $SENT.a${LF}"
run "(7a) 'cmd=' with ; touch <sentinel> after the instrument" --dir "$R/7a" --rev "$REV" --lane "$LANE"
emit "$R/7b" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node \$(touch $SENT.b) scripts/proxy-check.mjs${LF}"
run "(7b) 'cmd=' with \$(...) command substitution as the instrument token" --dir "$R/7b" --rev "$REV" --lane "$LANE"
emit "$R/7c" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node \`touch $SENT.c\` scripts/proxy-check.mjs${LF}"
run "(7c) 'cmd=' with backtick substitution" --dir "$R/7c" --rev "$REV" --lane "$LANE"
emit "$R/7d" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node scripts/proxy-check.mjs | tee $SENT.d${LF}"
run "(7d) 'cmd=' with a pipe into tee" --dir "$R/7d" --rev "$REV" --lane "$LANE"
echo "sentinel check:"; ls -la "$SENT".* 2>&1 || echo "no sentinel files created -> no shell executed"

# ---------------------------------------------------------------- extra: entries that are not files
mkdir -p "$R/8a/sub.txt"
run "(8a) dir whose only *.txt entry is a SUBDIRECTORY" --dir "$R/8a" --rev "$REV" --lane "$LANE"
mkdir -p "$R/8b"; mkfifo "$R/8b/f.txt"
run "(8b) dir whose only *.txt entry is a FIFO" --dir "$R/8b" --rev "$REV" --lane "$LANE"
emit "$R/8c" r.txt "$base_clean"; chmod 000 "$R/8c/r.txt"
run "(8c) receipt file mode 000 (unreadable)" --dir "$R/8c" --rev "$REV" --lane "$LANE"
chmod 644 "$R/8c/r.txt"
emit "$R/8d" r.txt ""
run "(8d) zero-byte receipt" --dir "$R/8d" --rev "$REV" --lane "$LANE"
emit "$R/8e" r.txt "rev=$REV${LF}tool_sha256=$SHA${LF}cmd=node${LF}"
run "(8e) cmd= with no instrument token" --dir "$R/8e" --rev "$REV" --lane "$LANE"

# ---------------------------------------------------------------- (4) read bound: size of receipt read
echo
echo "### (4) read bound — no size cap in the reader; measure with a 64 MiB receipt"
mkdir -p "$R/4big"
{ printf 'rev=%s\ntool_sha256=%s\ncmd=node scripts/proxy-check.mjs\npadding=' "$REV" "$SHA"; head -c 67108864 /dev/zero | tr '\0' 'A'; printf '\n'; } > "$R/4big/big.txt"
ls -l "$R/4big/big.txt"
/usr/bin/time -v node "$TOOL" --dir "$R/4big" --rev "$REV" --lane "$LANE" 2>&1 | grep -E 'RECEIPT_BIND|Maximum resident|Elapsed|Exit status'
echo "exit=${PIPESTATUS[0]}"
echo
echo "DONE"
