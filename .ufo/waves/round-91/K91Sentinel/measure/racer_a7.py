import os,sys,time
d,real,other,path=sys.argv[1],sys.argv[2],sys.argv[3],sys.argv[4]
t0=time.time()
while time.time()-t0<300:
    try:
        for s in (d+'.l', d+'.r'):
            if os.path.lexists(s): os.unlink(s)
        os.symlink(os.path.basename(other), d+'.l'); os.replace(d+'.l', path)
        os.link(real, d+'.r'); os.replace(d+'.r', path)
    except OSError: pass
