import re,json,numpy as np,wave
P=["Me cambio a Linux","Mi laptop suena como un avión","y no estoy haciendo la gran cosa","Con Windows, el abanico siempre prendido","Mira","solo con Brave abierto","la memoria al cuarenta y seis por ciento","y el procesador en un noventa","Pero este cambio no es nuevo","antes de pasarme a Mac","yo era un fiel usuario de Linux","Así que hice lo que muchos no se atreven","volví a linux","Pero esta vez a Ubuntu","Ahora mira","un montón de programas abiertos","muchísimas pestañas de Brave por todos lados","hasta un fondo animado","y la memoria en tres punto cinco gigas","El procesador","a un cuatro por ciento","Y el abanico","Hasta me olvidé de él","Y LocalSend","el del video anterior","siempre está abierto","No lo uso solo para los videos","pero con él paso los archivos del celular a la laptop","Pero no boté a Windows","Lo dejé en dual boot","y si lo necesito, reinicio y lo elijo","Pero dime","Tú te atreverías a cambiarte","Pero dime tú te atreverías a cambiarte a Linux","Te leo en los comentarios"]
def syl(s):
    s=s.lower().replace('brave','brei').replace('laptop','laptop').replace('localsend','localsend').replace('windows','uindous').replace('linux','linux').replace('ubuntu','ubuntu')
    n=0
    for w in re.findall(r"[a-záéíóúüñ]+",s):
        g=re.findall(r"[aeiouáéíóúü]+",w)
        c=0
        for v in g:
            k=1
            for a,b in zip(v,v[1:]):
                if (a in 'aeoáéó' and b in 'aeoáéó') or a in 'íú' or b in 'íú': k+=1
            c+=k
        if w.endswith('y') and not g: c=1
        n+=max(c,1)
    return n
S=[syl(p) for p in P]
# sub-segments with peaks from vo_trim
w=wave.open('vo_trim.wav');sr=w.getframerate();x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)/32768
hop=sr//100;n=len(x)//hop
db=np.array([20*np.log10(np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2))+1e-9) for i in range(n)]);db=np.convolve(db,np.ones(3)/3,'same')
k=np.hanning(7);k/=k.sum();s2=np.convolve(db,k,'same')
sp=db>-38;subs=[];i=0
while i<n:
    if sp[i]:
        j=i
        while j<n and (sp[j] or sp[j:j+12].any()): j+=1
        if j-i>8: subs.append((i,j))
        i=j
    else:i+=1
U=[]
for a,b in subs:
    pk=[i for i in range(a+2,b-2) if s2[i]==s2[max(a,i-5):i+6].max() and s2[i]>-30]
    U.append((a/100,b/100,len(pk)))
r=sum(u[2] for u in U)/sum(S);print('subs',len(U),'phr',len(P),'ratio',round(r,2))
INF=1e9;NP,NU=len(P),len(U)
D=np.full((NP+1,NU+1),INF);B={};D[0,0]=0
for i in range(NP+1):
    for j in range(NU+1):
        if D[i,j]>=INF: continue
        for di in range(1,4):
            for dj in range(1,4):
                if i+di>NP or j+dj>NU: continue
                # allow skipping phrase 33 (retake) etc: handled by optional skip below
                c=abs(sum(S[i:i+di])*r-sum(u[2] for u in U[j:j+dj]))+0.6*(di-1)+0.6*(dj-1)
                if D[i,j]+c<D[i+di,j+dj]: D[i+di,j+dj]=D[i,j]+c;B[(i+di,j+dj)]=(i,j)
        # skip a phrase (not said)
        if i+1<=NP and D[i,j]+4<D[i+1,j]: D[i+1,j]=D[i,j]+4;B[(i+1,j)]=(i,j)
i,j=NP,NU;out=[]
while (i,j)!=(0,0):
    pi,pj=B[(i,j)];out.append((pi,i,pj,j));i,j=pi,pj
for pi,i,pj,j in reversed(out):
    print(f"{U[pj][0]:6.2f}-{U[j-1][0+1]:6.2f} peaks={sum(u[2] for u in U[pj:j]):2d} syl={sum(S[pi:i]):2d} | "+(' / '.join(P[pi:i]) if j>pj else 'SKIP '+P[pi]))
