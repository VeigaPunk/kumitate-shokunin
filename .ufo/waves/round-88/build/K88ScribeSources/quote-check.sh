#!/usr/bin/env bash
# quote-check.sh — K88ScribeSources: prove each drafted quote is grep -F locatable in its capture.
# Usage: bash quote-check.sh <captures-dir>
set -u
C="${1:?captures dir}"
fail=0
check() { # <file> <expected-line> <quote>
  local f="$C/$1" want="$2" q="$3" got
  echo "\$ grep -nF '$q' $1"
  got=$(grep -nF -- "$q" "$f") || { echo "MISS $1"; fail=1; return; }
  echo "$got" | cut -c1-400
  case "$got" in "$want:"*) echo "LINE_OK $1:$want";; *) echo "LINE_MISMATCH $1 want=$want"; fail=1;; esac
}
for f in cwe59.html cwe22.html gitrev.html owasp-pt.html; do
  printf 'sha256 %s bytes %s %s\n' "$(sha256sum "$C/$f" | cut -d' ' -f1)" "$(stat -c %s "$C/$f")" "$f"
done
check cwe59.html 477 'does not properly prevent that filename from identifying a link or shortcut that resolves to an unintended resource'
check cwe22.html 482 'special elements within the pathname that can cause the pathname to resolve to a location that is outside of the restricted directory'
check gitrev.html 2438 '<em>&lt;rev&gt;:&lt;path&gt;</em>, e.g. <em>HEAD:README</em>'
check gitrev.html 2441 'at the given path in the tree-ish object named by the part'
check gitrev.html 1294 'gitrevisions last updated in 2.56.0'
check owasp-pt.html 473 'access files and directories that are stored outside the web root'
[ "$fail" = 0 ] && echo "QUOTE_CHECK: CLEAN" || echo "QUOTE_CHECK: MISS"
exit "$fail"
