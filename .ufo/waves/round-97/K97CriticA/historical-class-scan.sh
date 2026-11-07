#!/usr/bin/env bash
# historical-class-scan.sh — do any historical corpus/SOURCES.md blobs (up to the freeze) draw a character
# class the frozen battery never generates? Classes probed: U+FEFF BOM, U+2003 EM SPACE, U+200B ZWSP,
# U+2028 LINE SEPARATOR, a ``` fence line. Read-only git.
set -u
SEEN=""
L=/home/vgpnk/Projects/shokunin/kumitate-shokunin
REV=38eb197c17de7ce0dc562539f2f31f41bea037ec
PAT=$'\xEF\xBB\xBF|\xE2\x80\x83|\xE2\x80\x8B|\xE2\x80\xA8|^```'
n=0; hits=0; SEEN=""
for r in $(git -C "$L" log --format=%H "$REV" -- corpus/SOURCES.md); do
  b=$(git -C "$L" rev-parse "$r:corpus/SOURCES.md" 2>/dev/null) || continue
  case " $SEEN " in *" $b "*) continue;; esac
  SEEN="$SEEN $b"; n=$((n+1))
  if git -C "$L" cat-file blob "$b" | grep -qP -- "$PAT"; then echo "HIT $b"; hits=$((hits+1)); fi
done
echo "blobs=$n hits=$hits"
