#!/usr/bin/env python3
"""Deterministic HTML -> plain text: strip tags, unescape entities, collapse
whitespace per paragraph (block-level tags become line breaks).  One output line
per block so line numbers stay quotable."""
import html, re, sys

BLOCK = re.compile(r'</?(p|div|li|tr|h[1-6]|pre|br|td|th|table|ul|ol|blockquote|section)\b[^>]*>', re.I)
TAG = re.compile(r'<[^>]+>')
WS = re.compile(r'[ \t\r\f\v]+')
NL = re.compile(r'\n+')

def normalize(src: str) -> str:
    s = BLOCK.sub('\n', src)
    s = TAG.sub('', s)
    s = html.unescape(s)
    out = []
    for line in s.split('\n'):
        line = WS.sub(' ', line).strip()
        if line:
            out.append(line)
    return '\n'.join(out) + '\n'

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf-8', errors='replace').read()
    open(sys.argv[2], 'w', encoding='utf-8').write(normalize(src))
