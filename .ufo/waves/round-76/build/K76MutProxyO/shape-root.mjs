// Copies depth-one name/kind/mode only: never copies credentials or the 20G live root.
import {readdirSync,lstatSync,mkdirSync,writeFileSync,chmodSync} from 'node:fs';
import {join,resolve} from 'node:path';
const [src,dst]=process.argv.slice(2).map(p=>resolve(p));
mkdirSync(dst,{recursive:true});
for(const name of readdirSync(src)){
 const st=lstatSync(join(src,name)), out=join(dst,name);
 if(st.isDirectory()) mkdirSync(out,{recursive:true});
 else if(st.isFile()) writeFileSync(out,'');
 else throw Error(`unsupported fixture kind: ${name}`);
 chmodSync(out,st.mode&0o777);
}
writeFileSync(join(dst,'bogus-member.txt'),'bogus\n');
