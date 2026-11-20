import numpy as np,wave,json
sr=48000
def save(n,y,peak=0.89):
    y=y/np.max(np.abs(y)+1e-9)*peak
    o=wave.open(n,'wb');o.setnchannels(1);o.setsampwidth(2);o.setframerate(sr);o.writeframes((y*32767).astype(np.int16).tobytes());o.close()
rng=np.random.default_rng(7)
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/sr);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
# --- laptop fan "turbine": spin-up 1.2s then sustain, total 6s ---
T=16.0;t=np.arange(int(T*sr))/sr
env=np.clip(t/1.2,0,1)**1.5
f0=180+420*np.clip(t/1.4,0,1)**0.7 + 8*np.sin(2*np.pi*0.7*t)   # blade-pass whine
ph=2*np.pi*np.cumsum(f0)/sr
whine=0.5*np.sin(ph)+0.25*np.sin(2*ph)+0.12*np.sin(3*ph)
air=bp(rng.standard_normal(len(t)),600,5000)*0.9
rumble=bp(rng.standard_normal(len(t)),40,250)*1.6
y=(whine*0.35+air*0.5+rumble*0.4)*env
y[-int(0.05*sr):]*=np.linspace(1,0,int(0.05*sr))
save('fan_turbine.wav',y)
# short version for "¿y el abanico?" (spin 0.6s then hard stop)
T=1.2;t=np.arange(int(T*sr))/sr;f0=500+80*np.sin(2*np.pi*3*t);ph=2*np.pi*np.cumsum(f0)/sr
y=(0.4*np.sin(ph)+0.2*np.sin(2*ph)+0.5*bp(rng.standard_normal(len(t)),600,5000))*np.clip(t/0.15,0,1)
save('fan_short.wav',y,0.8)
# --- chiptune bed: 112 BPM, Am F C G, 8 bars loop ---
bpm=112;beat=60/bpm;step=beat/4
def sq(f,d,duty=0.5,v=1):
    n=int(d*sr);tt=np.arange(n)/sr;w=((tt*f)%1<duty).astype(float)*2-1
    e=np.exp(-tt*3.5);a=np.minimum(1,np.arange(n)/40);return w*e*a*v
def tri(f,d,v=1):
    n=int(d*sr);tt=np.arange(n)/sr;w=2*np.abs(2*((tt*f)%1)-1)-1;return w*v*np.minimum(1,(n-np.arange(n))/200)
N=lambda m:440*2**((m-69)/12)
chords=[(57,[69,72,76]),(53,[65,69,72]),(48,[67,72,76]),(55,[67,71,74])]
bars=8;L=int(bars*4*beat*sr)+sr;mix=np.zeros(L)
lead=[76,None,74,72,None,72,74,None,76,79,None,76,74,None,72,None]
for b in range(bars):
    root,ch=chords[b%4]
    for s in range(16):
        st=int((b*16+s)*step*sr)
        if s%2==0:
            bn=root-12 if s%4==0 else root
            x=tri(N(bn),step*1.9,0.55);mix[st:st+len(x)]+=x
        x=sq(N(ch[s%3]+12),step*0.9,0.25,0.12);mix[st:st+len(x)]+=x
        if b>=4 and lead[s] is not None:
            x=sq(N(lead[s]),step*1.8,0.5,0.16);mix[st:st+len(x)]+=x
        if s%4==2:
            n=int(0.04*sr);x=rng.standard_normal(n)*np.exp(-np.arange(n)/sr*90)*0.25;mix[st:st+n]+=x
        if s%8==0:
            n=int(0.12*sr);tt=np.arange(n)/sr;x=np.sin(2*np.pi*(120*np.exp(-tt*25)+45)*tt)*np.exp(-tt*22)*0.9;mix[st:st+n]+=x
loop=mix[:int(bars*4*beat*sr)]
full=np.tile(loop,4)
save('chiptune_loop.wav',full,0.7)
print('loop secs',len(loop)/sr,'full',len(full)/sr)
