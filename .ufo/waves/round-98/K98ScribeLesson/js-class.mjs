const cps = { VT: 0x0b, FF: 0x0c, CR: 0x0d, NEL: 0x85, NBSP: 0xa0, OGHAM: 0x1680, MVS: 0x180e,
  EMSP: 0x2003, ZWSP: 0x200b, ZWNJ: 0x200c, ZWJ: 0x200d, LS: 0x2028, PS: 0x2029, WJ: 0x2060,
  IDSP: 0x3000, BOM: 0xfeff };
const ROW = /^ {0,3}\|\s*S\d{3,}\s*\|/;
for (const [n, c] of Object.entries(cps)) {
  const ch = String.fromCodePoint(c);
  const pad = `|${ch}S123456${ch}|`;
  console.log(`${n}\tU+${c.toString(16).toUpperCase().padStart(4, '0')}\tjs_\\s=${/\s/.test(ch) ? 1 : 0}\tBASE_ROW_RE=${ROW.test(pad) ? 1 : 0}\tcensus_first_byte_pad_ok=${/^\|[ \t]*S[0-9]{3,}[ \t]*\|/.test(pad) ? 1 : 0}`);
}
console.log(`digit U+0660 matches \\d: ${/\d/.test('\u0660')}`);
console.log(`node ${process.version}`);
