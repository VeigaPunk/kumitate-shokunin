const BASE = /^ {0,3}\|\s*S\d{3,}\s*\|/;
const CEN  = /^\|[ \t]*S\d{3,}[ \t]*\|/;
const CEN_ID = /^S[0-9]{3,}$/;
const pads = { 'none':'', 'SP':' ', 'TAB':'\t', 'VT':'\v', 'FF':'\f', 'CR':'\r', 'NBSP':'\u00a0',
  'U+2000':'\u2000','U+2003':'\u2003','U+2028':'\u2028','U+2029':'\u2029','U+202F':'\u202f',
  'U+205F':'\u205f','U+3000':'\u3000','U+FEFF':'\ufeff','U+200B':'\u200b','U+180E':'\u180e','U+2060':'\u2060' };
const rows=[];
for (const [name,p] of Object.entries(pads)) {
  for (const side of ['lead','trail','both']) {
    const lead = side==='lead'||side==='both'?p:'';
    const trail = side==='trail'||side==='both'?p:'';
    const line = `|${lead}S123${trail} | src | docs | A | scope | anch | teaches | mined | 2026-01-01 | 90d | - |`;
    const b = BASE.test(line), c = CEN.test(line);
    const idCell = line.replace(/^ {0,3}\|/,'').split('|')[0];
    const awkTrim = idCell.replace(/^[ \t]+|[ \t]+$/g,'');   // census trim()
    const jsTrim  = idCell.trim();                              // JS trim()
    rows.push({pad:name, side, BASE:b, CEN:c, agree:(b===c), census_id:JSON.stringify(awkTrim), js_trim:JSON.stringify(jsTrim),
      census_id_valid: CEN_ID.test(awkTrim), js_trim_valid: CEN_ID.test(jsTrim)});
  }
}
for (const r of rows) console.log(JSON.stringify(r));
const dis = rows.filter(r=>!r.agree);
console.log('DISAGREEMENTS:', dis.length, 'of', rows.length);
