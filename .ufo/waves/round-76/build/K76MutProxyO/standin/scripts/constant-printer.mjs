// Stand-in only: six C1 arms, not the parent seventeen terms/pins.
import {readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
const args=process.argv.slice(2), arg=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
const opts={self:process.cwd(),ompRoot:resolve(arg('--omp-root',process.env.OMP_AGENT_ROOT)),scorecard:arg('--scorecard','SCORECARD.md')};
const AXIS_ROWS = [
  { axis: 'coverage:omp', term: 'coverage_omp' },
];
function failClosed(opts,kind,detail){console.log(JSON.stringify({verdict:'FAIL-CLOSED',findings:[{kind,detail}]},null,2));return 2;}
function main(){
 let rootKind;try{rootKind=statSync(opts.ompRoot).isDirectory()?'dir':'file';}catch{rootKind='absent';}
 if(rootKind!=='dir'){
  return failClosed(opts, 'OMP_ROOT_NOT_A_DIR', rootKind);
 }
 let note;try{note=readFileSync(join(opts.self,'corpus/knowledge/omp-agent-root.md'),'utf8');}catch{}
 if(note===undefined){
  return failClosed(opts, 'OMP_NOTE_MISSING', 'absent');
 }
 let names;try{names=readdirSync(opts.ompRoot);}catch{return failClosed(opts,'OMP_CENSUS_ERROR','ENOTDIR');}
 const text=readFileSync(opts.scorecard,'utf8');
 const oRows=text.split('\n').filter(l=>/^\| O\d+ \|/.test(l)).map(l=>l.split('|').slice(1));
 const yesRows = oRows.filter((cells) => cells[3].trim().startsWith('yes'));
 const C1o=yesRows.length,C1o_total=oRows.length;
 const O_members=names.length,O_findings=names.filter(n=>!/^member\d+$/.test(n)).length,O_bound=12;
 const ratio=(O_members - O_findings) / O_members;
 const coverage_omp=C1o_total===0||O_members===0?0:10;
 const terms={C1o,C1o_total,O_members,O_findings,O_bound,coverage_omp};
 const findings=[];
 const declared=Object.fromEntries([...text.matchAll(/^(\w+)=(\d+)$/gm)].map(m=>[m[1],+m[2]]));
 for(const [key,value]of Object.entries(terms))if(value!==declared[key])findings.push({kind:key==='coverage_omp'?'COVERAGE_OMP_DRIFT':'O_FINDINGS_DRIFT',key,computed:value});
 for(const {axis,term}of AXIS_ROWS){const m=text.match(new RegExp('^\\| '+axis+' \\| (\\d+) \\|','m'));if(!m||+m[1]!==terms[term])findings.push({kind:'AXES_DRIFT',term:axis});}
 console.log(JSON.stringify({contract:'kumitate-proxy-v1',terms,findings,verdict:findings.length?'DRIFT':'MATCH'},null,2));
 return findings.length?1:0;
}
process.exitCode=main();
