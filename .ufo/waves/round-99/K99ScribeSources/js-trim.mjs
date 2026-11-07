// Which code points does ECMAScript String.prototype.trim() strip? (S276 class)
const cps = [['TAB',9],['LF',10],['VT',11],['FF',12],['CR',13],['SP',32],['NEL',0x85],
  ['NBSP',0xa0],['OGHAM',0x1680],['U2000',0x2000],['U2003',0x2003],['U200A',0x200a],
  ['LS',0x2028],['PS',0x2029],['NNBSP',0x202f],['MMSP',0x205f],['IDSP',0x3000],
  ['ZWSP',0x200b],['ZWNBSP',0xfeff]];
for (const [n,c] of cps) {
  const s = String.fromCodePoint(c);
  const lead = (s + 'S123').trim();
  const trail = ('S123' + s).trim();
  console.log(n.padEnd(8), 'U+' + c.toString(16).toUpperCase().padStart(4,'0'),
    'lead=' + (lead === 'S123' ? 'STRIPPED' : 'KEPT'),
    'trail=' + (trail === 'S123' ? 'STRIPPED' : 'KEPT'));
}
console.log('node', process.version);
