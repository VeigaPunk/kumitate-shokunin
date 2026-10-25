import {readFileSync} from 'node:fs';
const t=readFileSync('norm.txt','utf8');
const Q=[
['Introduction',"Unlike those DVCSs, Jujutsu treats concurrent edits the same whether they're made locally or remotely."],
['Introduction',"To avoid depending on lock files, Jujutsu takes a different approach by accepting that concurrent changes can always happen."],
['Syncing with rsync , NFS, Dropbox, etc',"The working copy may mismatch what's supposed to be checked out, but no changes to the repo will be lost"],
['Operation log','The most important piece in the lock-free design is the "operation log". That is what allows us to detect and merge divergent operations.'],
['Operation log','The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace.'],
['Operation log','The operation log is normally linear. It becomes non-linear if there are divergent operations.'],
['Operation log','When a command starts, it loads the repo at the latest operation.'],
['Merging divergent operations','If Jujutsu tries to load the repo and finds multiple heads in the operation log, it will do a 3-way merge of the view objects'],
['Storage','The operation objects and view objects are stored in content-addressed storage just like Git commits are. That makes them safe to write without locking.'],
];
Q.forEach(([h,q],i)=>{let n=0,p=-1;while((p=t.indexOf(q,p+1))>=0)n++;const hn=t.includes(h.replace(/ ,/,' ,'));console.log(i+1,'words='+q.split(' ').length,'occurs='+n,'heading='+hn,'|',q)});
