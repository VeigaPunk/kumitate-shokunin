import re, hashlib, html, sys

raw = open('ecma262-2025.html', 'rb').read()
print("url: https://tc39.es/ecma262/2025/")
print("body_sha256:", hashlib.sha256(raw).hexdigest(), "bytes:", len(raw))
h = raw.decode('utf-8', errors='replace')

# stripped text with stripped-index -> raw byte offset, O(n)
chars = []
offs = []
blen = 0
i = 0
n = len(h)
tag = re.compile(r'<[^>]*>')
ent = re.compile(r'&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);')
while i < n:
    m = tag.match(h, i)
    if m:
        blen += len(h[i:m.end()].encode())
        i = m.end()
        continue
    m = ent.match(h, i)
    if m:
        blen += len(m.group(0).encode())
        s = html.unescape(m.group(0))
        for c in s:
            offs.append(blen)
            chars.append(c)
        i = m.end()
        continue
    c = h[i]
    offs.append(blen)
    chars.append(c)
    blen += len(c.encode())
    i += 1
stripped = ''.join(chars)

norm = []
nmap = []
for idx, c in enumerate(stripped):
    if c.isspace():
        if norm and norm[-1] == ' ':
            continue
        norm.append(' ')
        nmap.append(idx)
        continue
    if c in '.,;:' and norm and norm[-1] == ' ':
        norm.pop()
        nmap.pop()
    norm.append(c)
    nmap.append(idx)
N = ''.join(norm)

quotes = [
    ("12.2 White Space (id sec-white-space), paragraph before Table 35",
     "The ECMAScript white space code points are listed in Table 35."),
    ("12.2 White Space, Table 35 rows 2-3",
     "U+000B LINE TABULATION <VT> U+000C FORM FEED (FF) <FF>"),
    ("12.2 White Space, Table 35 Note 1",
     "U+0020 (SPACE) and U+00A0 (NO-BREAK SPACE) code points are part of <USP>."),
    ("12.3 Line Terminators (id sec-line-terminators)",
     "Line terminators are included in the set of white space code points that are matched by the \\s class in regular expressions."),
    ("22.1.3.32.1 TrimString (id sec-trimstring), step 3.a",
     "Let T be the String value that is a copy of S with leading white space removed."),
]
rc = 0
for loc, q in quotes:
    qq = ' '.join(q.split())
    pos = N.find(qq)
    if pos < 0:
        print("MISSING |", loc, "|", qq)
        rc = 1
        continue
    print(f"FOUND raw_byte={offs[nmap[pos]]} words={len(qq.split())} | {loc}")
    print('   "%s"' % qq)
sys.exit(rc)
