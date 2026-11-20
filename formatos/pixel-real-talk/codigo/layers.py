"""Layers for the Ubuntu video. Logical 120x214, x9 -> 1080x1926 (cropped 1920)."""
from PIL import Image, ImageDraw, ImageFilter
import json
W,H,S=120,214,9
OUT='/home/claude/ubuntu-video/layers/'
C={"wall":"#1c1630","wall2":"#171228","floor":"#110d1b","floor2":"#0d0a15","neon":"#e8ff00","neon2":"#9aa800","neon3":"#4d5400",
"white":"#f2f2f0","gray":"#8a8a82","dark":"#0a0810","skin":"#b0704a","skin2":"#93593a","skin3":"#c98a62","beard":"#2a1c13","beard2":"#3a281b",
"cap":"#141416","cap2":"#26262b","capbrim":"#0b0b0d","hood":"#17171b","hood2":"#24242a","hood3":"#0f0f12","lip":"#7a3d2c","teeth":"#f4f1ea",
"eyew":"#f4f1ea","pupil":"#1a0f08","chair":"#2a2342","chair2":"#221c36","metal":"#2c2c34","screen":"#1b0f1a"}
def up(img): return img.resize((W*S,H*S),Image.NEAREST).crop((0,0,1080,1920))
def canvas(c=(0,0,0,0)): 
    im=Image.new("RGBA",(W,H),c); return im,ImageDraw.Draw(im)
def mk(d): return lambda x,y,w,h,c: d.rectangle([x,y,x+w-1,y+h-1],fill=C.get(c,c))

# ---------- room ----------
bg,d=canvas(C["wall"]);R=mk(d)
for y in range(0,150,6): R(0,y,W,3,"wall2")
R(0,150,W,H-150,"floor")
for x in range(0,W,10): R(x,150,1,H-150,"floor2")
R(0,18,W,1,"neon");R(0,19,W,1,"neon3")
for (x,y) in [(0,0),(1,1),(2,2),(1,3),(0,4)]: R(10+x,30+y,1,1,"neon")
R(15,34,4,1,"neon")
hexmask=["..###..",".#####.","#######","#######",".#####.","..###.."]
for (ox,oy,c) in [(86,28,"neon"),(94,28,"neon2"),(102,28,"neon"),(90,34,"neon"),(98,34,"#3a3a46"),(106,34,"neon2"),(94,40,"neon")]:
    for j,row in enumerate(hexmask):
        for i,chh in enumerate(row):
            if chh=="#": R(ox+i,oy+j,1,1,c)
R(6,52,28,1,"metal")
for i,(h,c) in enumerate([(8,"neon"),(10,"white"),(7,"gray"),(9,"neon2"),(10,"#3a3a46"),(8,"white")]): R(8+i*4,52-h,3,h,c)
R(3,84,34,22,"dark");R(4,85,32,20,"screen");R(4,85,32,2,"#2b1a29")
for i,(w,c) in enumerate([(14,"neon"),(22,"gray"),(12,"neon"),(18,"white"),(4,"neon")]): R(6,89+i*3,w,1,c)
R(18,106,4,5,"metal");R(12,111,16,1,"metal")
R(0,112,W,3,"#2a2433");R(0,115,W,1,"dark")
R(36,66,48,86,"chair");R(38,68,44,82,"chair2");R(59,70,2,78,"neon2");R(36,66,48,1,"#3a3260")
up(bg).convert("RGB").save(OUT+"room.png")

# ---------- laptop (Dell Latitude-ish, front view on desk) ----------
lp,d=canvas();R=mk(d)
LX,LY=93,88          # screen bezel top-left
R(LX,LY,24,19,"#08080b")            # lid/bezel
R(LX+1,LY+1,22,17,"#101016")
R(LX+11,LY,2,1,"#2c2c34")           # webcam
R(LX-3,LY+19,30,3,"#2a2a33")        # keyboard deck (front edge)
R(LX-3,LY+19,30,1,"#3a3a46")
R(LX-4,LY+22,32,1,"#0a0810")        # shadow
R(LX+9,LY+20,6,1,"#4a4a55")         # touchpad hint
# vent on the side (for the fan)
for i in range(4): R(LX+24,LY+20+0*i,1,1,"#000")
up(lp).save(OUT+"laptop.png")
SCR=dict(x=(LX+1)*S,y=(LY+1)*S,w=22*S,h=17*S)

# screen contents (22x17 logical) -> each upscaled
def screen(name,fn):
    im=Image.new("RGBA",(22,17),(0,0,0,255));dd=ImageDraw.Draw(im)
    fn(lambda x,y,w,h,c: dd.rectangle([x,y,x+w-1,y+h-1],fill=c))
    im.resize((22*S,17*S),Image.NEAREST).save(OUT+f"scr_{name}.png")
def s_win(R):
    R(0,0,22,17,"#1453b8");R(0,0,22,6,"#1b66d6")
    R(0,15,22,2,"#0b1d3a")
    for i,x in enumerate([8,10,12]): R(x,15,1,1,"#9ec3ff")
    R(3,3,9,7,"#e9eef7");R(3,3,9,1,"#7f8ea8");R(4,5,6,1,"#c0c8d6");R(4,7,4,1,"#c0c8d6")
    R(10,6,9,7,"#f3f5f9");R(10,6,9,1,"#ff5a36");R(11,8,6,1,"#c0c8d6");R(11,10,5,1,"#c0c8d6")
def s_ubu(R):
    R(0,0,22,17,"#2c0f2a");R(0,0,22,8,"#3e1440");R(0,12,22,5,"#1f0a1e")
    R(0,0,22,1,"#111");R(0,0,2,17,"#1a0a19")
    for y in (3,6,9,12): R(0,y,2,2,"#e95420")
    R(11,6,5,5,"#e95420");R(12,7,3,3,"#2c0f2a");R(13,8,1,1,"#e95420")
def s_off(R): R(0,0,22,17,"#06060a")
def s_term(R):
    R(0,0,22,17,"#120a12")
    for i,(w,c) in enumerate([(9,"#e8ff00"),(14,"#8a8a82"),(6,"#e8ff00"),(12,"#f2f2f0"),(3,"#e8ff00")]): R(1,2+i*3,w,1,c)
for n,f in [("win",s_win),("ubu",s_ubu),("off",s_off),("term",s_term)]: screen(n,f)

# ---------- character (variants) ----------
def character(mouth="closed",eyes="open"):
    ch,d=canvas();P=mk(d)
    P(36,100,48,50,"hood");P(38,97,44,4,"hood");P(41,95,38,3,"hood")
    P(36,100,4,50,"hood3");P(80,100,4,50,"hood3");P(44,104,8,30,"hood2");P(52,95,16,4,"hood3")
    P(55,99,1,9,"neon");P(65,99,1,9,"neon");P(55,108,1,1,"neon2");P(65,108,1,1,"neon2");P(70,101,2,2,"metal")
    P(30,102,8,30,"hood");P(30,102,2,30,"hood3");P(31,132,8,6,"skin");P(31,137,8,1,"skin2")
    P(82,102,8,14,"hood");P(88,104,2,12,"hood3");P(84,92,7,12,"hood")
    P(84,84,8,9,"skin");P(84,92,8,1,"skin2");P(91,85,1,7,"skin2")
    P(84,82,2,3,"skin");P(87,81,2,3,"skin");P(90,82,2,3,"skin");P(82,87,2,3,"skin")
    P(54,90,12,6,"skin2")
    P(47,66,26,26,"skin");P(48,92,24,1,"skin");P(47,66,2,26,"skin2");P(71,66,2,26,"skin2");P(50,66,6,3,"skin3")
    P(45,74,2,6,"skin2");P(73,74,2,6,"skin2")
    P(47,80,26,12,"beard");P(48,92,24,2,"beard");P(47,72,2,9,"beard");P(71,72,2,9,"beard");P(50,81,20,1,"beard2")
    P(52,81,16,3,"skin");P(53,82,14,2,"beard")
    if mouth=="open":
        P(55,86,10,5,"lip");P(56,86,8,1,"teeth");P(56,87,8,3,"#3a1810");P(57,89,6,1,"#8a3b2a")
    elif mouth=="mid":
        P(55,86,10,3,"lip");P(56,86,8,1,"teeth");P(56,87,8,1,"#3a1810")
    elif mouth=="o":
        P(57,85,6,5,"lip");P(58,86,4,3,"#3a1810")
    else:
        P(55,86,10,2,"lip");P(56,86,8,1,"teeth");P(54,85,1,1,"lip");P(65,85,1,1,"lip")
    P(58,77,4,3,"skin2");P(58,79,4,1,"beard")
    for ex in (51,63):
        if eyes=="open":
            P(ex,73,6,4,"eyew");P(ex+2,73,3,4,"pupil");P(ex+3,73,1,1,"white")
            P(ex,71,6,1,"beard");P(ex,72,6,1,"skin2")
        elif eyes=="wide":
            P(ex,72,6,5,"eyew");P(ex+2,73,2,3,"pupil");P(ex+2,73,1,1,"white")
            P(ex,69,6,1,"beard");P(ex,70,6,2,"skin")
        else:
            P(ex,75,6,1,"pupil");P(ex,71,6,1,"beard");P(ex,72,6,1,"skin2")
    P(46,58,28,10,"cap");P(48,55,24,3,"cap");P(51,53,18,2,"cap");P(59,52,2,1,"cap2");P(46,58,3,10,"cap2")
    P(44,67,32,3,"capbrim");P(46,70,28,1,"capbrim")
    for (x,y) in [(54,57),(55,57),(56,57),(55,58),(55,59),(55,60),(54,61),(55,61),(56,61),(59,57),(58,58),(60,58),(58,59),(59,59),(60,59),(58,60),(60,60),(58,61),(60,61)]:
        P(x,y,1,1,"white")
    alpha=ch.split()[3];grown=alpha.filter(ImageFilter.MaxFilter(3))
    o=Image.new("RGBA",(W,H),C["dark"]);o.putalpha(grown);o.alpha_composite(ch)
    return o
for m in ("closed","mid","open","o"):
    for e in ("open","blink","wide"):
        up(character(m,e)).save(OUT+f"char_{m}_{e}.png")

# ---------- sprites ----------
def sprite(name,rows,pal,scale=9):
    h=len(rows);w=max(len(r) for r in rows)
    im=Image.new("RGBA",(w,h),(0,0,0,0))
    for y,r in enumerate(rows):
        for x,c in enumerate(r):
            if c in pal: im.putpixel((x,y),Image.new("RGBA",(1,1),pal[c]).getpixel((0,0)))
    im.resize((w*scale,h*scale),Image.NEAREST).save(OUT+f"sp_{name}.png")
sprite("plane",[
"..........##.......",
".........#ww#......",
"##......#www#......",
"#w#....#wwww#......",
"#ww#########ggg##..",
"#wwwwwwwwwwwwwwwww#",
".#ggggggggwwwwwwbb#",
"..######w#######...",
"........#ww#.......",
".........###.......",
],{"#":"#0a0810","w":"#f2f2f0","g":"#8a8a82","b":"#6ab0ff"})
sprite("phone",[
".##########.",
"#kkkkkkkkkk#",
"#kssssssssk#",
"#kssssssssk#",
"#ksnnnnnnsk#",
"#ksnnnnnnsk#",
"#kssssssssk#",
"#kssssssssk#",
"#ksswwwwssk#",
"#kssssssssk#",
"#kssssssssk#",
"#kssssssssk#",
"#kkkkkkkkkk#",
"#kkkkwwkkkk#",
".##########.",
],{"#":"#0a0810","k":"#26262b","s":"#1a2a2f","n":"#4dd2c8","w":"#f2f2f0"})
sprite("file",[
"#####...",
"#www##..",
"#www#w#.",
"#wwwwww#",
"#wnnnww#",
"#wwwwww#",
"#wnnnnw#",
"#wwwwww#",
"########",
],{"#":"#0a0810","w":"#f2f2f0","n":"#e8ff00"})
sprite("fan",[
"....####....",
"..##wwww##..",
".#ww#ww#ww#.",
".#w##ww##w#.",
"#ww##ww##ww#",
"#wwwwkkwwww#",
"#wwwwkkwwww#",
"#ww##ww##ww#",
".#w##ww##w#.",
".#ww#ww#ww#.",
"..##wwww##..",
"....####....",
],{"#":"#0a0810","w":"#f2f2f0","k":"#e8ff00"},scale=12)
json.dump({"screen":SCR},open(OUT+"meta.json","w"))
print(SCR)
