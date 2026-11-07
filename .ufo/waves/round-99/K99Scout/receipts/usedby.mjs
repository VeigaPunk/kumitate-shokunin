// Which classes does each used-by-path reader strip?
const NBSP = ' ', U3000 = '　', BOM = '﻿', VT = '';
const val = NBSP + 'corpus/knowledge/alpha.md' + NBSP;
console.log('JS trim      :', JSON.stringify(val.trim()));
console.log('JS split map :', JSON.stringify(val.split(',').map(v => v.trim())));
console.log('blank class  :', JSON.stringify(val.replace(/^[ \t]+|[ \t]+$/g, '')));
