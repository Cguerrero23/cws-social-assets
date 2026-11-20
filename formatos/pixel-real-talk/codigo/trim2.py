import json,wave,numpy as np
segs=json.load(open('segs.json'))
labels=["hook","avion","nohago","conwindows","mira","brave","cambio","macfiel","atreven","volviubuntu","ahoramira","programas","pestanas","fondo","ramcpu","abanicoQ","olvide","localsend","delvideo","siempre","nolouso","celular","nobote","dualboot","take1a","take1b","retake","teleo"]
skip={"take1a","take1b"}
gap_after={"mira":0.12,"avion":0.22,"brave":0.5,"ramcpu":1.4,"abanicoQ":1.0,"olvide":0.45,"celular":0.45,"dualboot":0.6,"nobote":0.3,"retake":0.4}
w=wave.open('/home/claude/ubuntu-video/raw/vo_clean.wav');sr=w.getframerate();x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)
pad_a,pad_b=0.07,0.12
out=[np.zeros(int(0.45*sr),np.float32)];t=0.45;seg_tl={}
for (a,b,_),lab in zip(segs,labels):
    if lab in skip: continue
    s=x[int((a-pad_a)*sr):int((b+pad_b)*sr)].copy()
    f=int(0.012*sr);r=np.linspace(0,1,f);s[:f]*=r;s[-f:]*=r[::-1]
    seg_tl[lab]=[t+pad_a,t+len(s)/sr-pad_b]
    out.append(s);t+=len(s)/sr
    g=gap_after.get(lab,0.25);out.append(np.zeros(int(g*sr),np.float32));t+=g
out.append(np.zeros(int(2.6*sr),np.float32));t+=2.6
y=np.concatenate(out).astype(np.int16)
o=wave.open('vo_trim.wav','wb');o.setnchannels(1);o.setsampwidth(2);o.setframerate(sr);o.writeframes(y.tobytes());o.close()
# analysis on trimmed
yf=y.astype(np.float32)/32768;hop=sr//100;n=len(yf)//hop
db=np.array([20*np.log10(np.sqrt(np.mean(yf[i*hop:(i+1)*hop]**2))+1e-9) for i in range(n)]);db=np.convolve(db,np.ones(3)/3,'same')
k=np.hanning(7);k/=k.sum();s2=np.convolve(db,k,'same')
def peaks(a,b):
    a,b=int(a*100),int(b*100);return [i/100 for i in range(a+2,b-2) if s2[i]==s2[max(a,i-5):i+6].max() and s2[i]>-30]
def subs(a,b):
    a,b=int(a*100),int(b*100);sp=db[a:b]>-38;r=[];i=0
    while i<len(sp):
        if sp[i]:
            j=i
            while j<len(sp) and (sp[j] or sp[j:j+12].any()): j+=1
            r.append(((a+i)/100,(a+j)/100));i=j
        else:i+=1
    return r
def at(lab,syl,nsyl,sub=None):
    a,b=seg_tl[lab]
    if sub is not None: a,b=subs(a,b)[sub]
    p=peaks(a,b);return p[min(len(p)-1,round(syl*len(p)/nsyl))]
A={}
def put(n,s,e=None): A[n]=[round(s,3),round(e if e is not None else s+0.5,3)]
for l in ["hook","avion","nohago","conwindows","mira","abanicoQ","olvide","localsend","delvideo","siempre","celular","nobote","dualboot","teleo"]: put(l,*seg_tl[l])
put("teleo2",*seg_tl["teleo"])
put("brave46",*seg_tl["brave"])
put("memcard",at("brave",7,32));put("mem46",at("brave",12,32));put("mem46end",at("brave",16,32)+0.1)
put("cpu90",at("brave",22,32),seg_tl["brave"][1]);put("cpu90hit",at("brave",29,32))
put("nonuevo",*seg_tl["cambio"])
ms=subs(*seg_tl["macfiel"]);print('macfiel subs',ms)
put("winnode",ms[0][0]);put("mac",peaks(*ms[0])[-1]);put("fiel",at("macfiel",9,11,sub=1))
put("atreven",*seg_tl["atreven"]);put("muchos",at("atreven",5,14));put("atrevenL2",at("atreven",9,14))
vs=subs(*seg_tl["volviubuntu"]);print('volvi subs',vs)
put("volvi",vs[0][0],vs[0][1]);put("ubuntu",vs[1][0],vs[1][1]);put("ubuword",at("volviubuntu",6,9,sub=1))
put("ahoramira",*seg_tl["ahoramira"]);put("programas",at("programas",4,10));put("pestanas",at("pestanas",4,14));put("fondo",at("fondo",3,9))
put("ramzoom",at("ramcpu",2,25));put("ram35",at("ramcpu",6,25));put("ram35end",at("ramcpu",10,25))
put("procesador",at("ramcpu",14,25));put("cpu4",at("ramcpu",20,25)-0.25,seg_tl["ramcpu"][1])
cs=subs(*seg_tl["celular"]);put("laptopword",cs[-1][0])
ds=subs(*seg_tl["dualboot"]);put("dualword",at("dualboot",4,6,sub=0));put("necesito",at("dualboot",3,15,sub=1));put("elijo",at("dualboot",13,15,sub=1))
put("perodime",*seg_tl["retake"]);put("atreverias",at("retake",4,18),seg_tl["retake"][1]);put("atrev",at("retake",6,18))
fps=30;hop2=sr//fps
amp=[float(np.sqrt(np.mean(yf[i*hop2:(i+1)*hop2]**2))) for i in range(len(yf)//hop2)]
mouth=[2 if 20*np.log10(a+1e-9)>-17 else 1 if 20*np.log10(a+1e-9)>-25 else 0 for a in amp]
for i in range(1,len(mouth)-1):
    if mouth[i-1]==mouth[i+1]!=mouth[i]: mouth[i]=mouth[i-1]
tl=[dict(id=k,start=v[0],end=v[1]) for k,v in A.items()]
json.dump(dict(duration=round(t,3),frames=int(t*fps)+1,timeline=tl,mouth=mouth),open('timeline.json','w'))
print('dur',round(t,2));print({k:v[0] for k,v in A.items()})
