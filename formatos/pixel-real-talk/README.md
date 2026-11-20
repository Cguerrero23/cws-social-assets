# Formato PIXEL REAL_TALK (cuenta personal @j.c_guerrero)

Personaje pixel art de Cesar (gorra negra con "IA", barba, hoodie negro con cordones neón, lav mic) en su cuarto (LED neón, hexágonos, monitor, laptop Dell Latitude). Primer uso: reel "Me cambio a Linux" (nov 2026).

## Capas (capas/)
- room.png, laptop.png, scr_{win,ubu,term,off}.png (pantalla del laptop en x=846,y=801)
- char_{closed,mid,open,o}_{open,blink,wide}.png → boca x ojos (lip-sync + parpadeo + sorpresa)
- sp_plane, sp_phone, sp_file, sp_fan (sprites)
- Lienzo lógico 120x214 escalado x9 (1080x1920). Regenerar con codigo/layers.py.

## Audio (audio/)
- chiptune_loop.wav: música original (112 BPM, Am-F-C-G), sintetizada con codigo/synth.py. Sin copyright. Volumen bajo (~0.075) bajo la voz.
- SFX: earshot (impact/punch, cut_hit, whoosh, glitch, ui_pop, mallet, typing_key/laptop, toggle, riser...).

## Flujo
1. Voz en off → limpiar (EQ + loudnorm), recortar pausas (trim2.py), alinear guion por sílabas (dp.py) — ojo con tomas repetidas.
2. Remotion (Video.tsx): cámara que hace zoom a lo importante, paneles tipo ventana arriba con el cuarto abajo, textos con máscara, contadores, sonido en cada texto y cambio de escena.
3. Master −14 LUFS. Portada (Cover.tsx) añadida al final 0.1 s para thumbnailOffset en Buffer.
