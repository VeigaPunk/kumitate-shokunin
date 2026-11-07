#!/usr/bin/env python3
"""Verify each cited ECMA-262 2025 sentence: locate it in the capture, print its
HTML line, byte offset in the HTML body, and confirm byte-exact presence after
tag strip + whitespace collapse. Read-only."""
import re, html, sys

CAP = sys.argv[1]
raw = open(CAP, 'rb').read()
txt = raw.decode('utf-8')
lines = txt.split('\n')
starts, acc = [], 0
for ln in lines:
    starts.append(acc); acc += len(ln.encode('utf-8')) + 1

def collapse(s):
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()

Q = [
 ("a", "22.1.3.32.1 TrimString", 34900, "The definition of white space",
  "The definition of white space is the union of WhiteSpace and LineTerminator."),
 ("b", "22.2.2.9 CompileToCharSet, CharacterClassEscape :: s", 37124, "Return the ",
  "Return the CharSet containing all characters corresponding to a code point on the right-hand side of the WhiteSpace or LineTerminator productions."),
 ("c", "12.2 White Space, Note 1", 14263, "U+0020 (SPACE) and U+00A0",
  "U+0020 (SPACE) and U+00A0 (NO-BREAK SPACE) code points are part of <USP>."),
]
bad = 0
for tag, sec, n, rawprefix, quote in Q:
    body = collapse(lines[n-1])
    seen = body.count(quote)
    i = lines[n-1].index(rawprefix)
    off = starts[n-1] + len(lines[n-1][:i].encode('utf-8'))
    print(f"({tag}) § {sec}")
    print(f"    html_line={n} html_byte={off} occurrences_on_line={seen}")
    print(f"    quote={quote}")
    if seen != 1:
        bad = 1
print(f"VERDICT: {'all three quotes located byte-exact' if bad==0 else 'MISMATCH'}")
sys.exit(bad)
