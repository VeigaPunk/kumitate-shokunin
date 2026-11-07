#!/usr/bin/env node
// Compare the JS whitespace classes the fleet readers use.
const sSet = new Set();
const tSet = new Set();
for (let cp = 0; cp <= 0x10FFFF; cp += 1) {
  if (cp >= 0xD800 && cp <= 0xDFFF) continue;
  const ch = String.fromCodePoint(cp);
  if (/^\s$/.test(ch)) sSet.add(ch);
  if (ch.trim() === '') tSet.add(ch);
}
const hex = (c) => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
const onlyS = [...sSet].filter((c) => !tSet.has(c));
const onlyT = [...tSet].filter((c) => !sSet.has(c));
console.log(`JS regex \\s size = ${sSet.size}`);
console.log(`JS trim() empty-string set size = ${tSet.size}`);
console.log(`in \\s but not trim: ${onlyS.map(hex).join(' ') || '(none)'}`);
console.log(`in trim but not \\s: ${onlyT.map(hex).join(' ') || '(none)'}`);
console.log(`IDENTICAL SETS: ${onlyS.length === 0 && onlyT.length === 0}`);
console.log(`\\s set: ${[...sSet].map(hex).join(' ')}`);
