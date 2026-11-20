import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, spring, interpolate, Easing, useVideoConfig} from 'remotion';
import '@fontsource/archivo/800.css';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import tl from './timeline.json';

const FPS = 30;
const NEON = '#E8FF00', BLACK = '#0a0a0a', WHITE = '#f2f2f0', RED = '#ff3b3b', BLUE = '#2f7bff', UBU = '#E95420';
const ARCH = 'Archivo, sans-serif', MONO = '"Space Mono", monospace';
const T: Record<string, {start: number; end: number}> = Object.fromEntries(tl.timeline.map((e: any) => [e.id, e]));
const s = (id: string, off = 0) => Math.round((T[id].start + off) * FPS);
const e = (id: string, off = 0) => Math.round((T[id].end + off) * FPS);
const F = (x: number) => Math.round(x * FPS);
const END = tl.frames;
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.22, 1, 0.36, 1);

// ---------- camera ----------
type Cam = [number, number, number];
const camTo = (px: number, py: number, sc: number): Cam => {
  let tx = -sc * (px - 540), ty = -sc * (py - 960);
  const mx = 540 * sc - 540, my = 960 * sc - 960;
  tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
  return [tx, ty, sc];
};
const PANEL = (ty = 600): Cam => [0, ty, 1];
const LAPTOP = camTo(945, 880, 1.9);
const moves: {at: number; to: Cam; dur?: number}[] = [
  {at: 0, to: camTo(540, 760, 1.12)},
  {at: s('avion', -0.12), to: LAPTOP, dur: 9},
  {at: s('conwindows', -0.1), to: camTo(760, 900, 1.35)},
  {at: s('mira', -0.15), to: PANEL(600)},
  {at: s('atreven', -0.1), to: camTo(540, 760, 1.25)},
  {at: s('volvi'), to: camTo(540, 740, 1.42), dur: 5},
  {at: s('ubuntu', -0.12), to: LAPTOP},
  {at: s('ahoramira', -0.15), to: PANEL(760)},
  {at: s('abanicoQ', -0.15), to: camTo(900, 860, 1.7)},
  {at: s('localsend', -0.2), to: PANEL(600)},
  {at: s('nobote', -0.15), to: camTo(540, 800, 1.18)},
  {at: s('dualboot', -0.12), to: PANEL(600)},
  {at: s('perodime', -0.15), to: camTo(540, 760, 1.25)},
  {at: s('atreverias'), to: camTo(540, 740, 1.45), dur: 50},
  {at: e('teleo2', 0.25), to: camTo(540, 900, 1.0), dur: 20},
];
const camAt = (f: number): Cam => {
  let cur: Cam = moves[0].to;
  for (let i = 1; i < moves.length; i++) {
    const m = moves[i];
    if (f < m.at) break;
    const d = m.dur ?? 11;
    const p = interpolate(f, [m.at, m.at + d], [0, 1], {...clamp, easing: ease});
    cur = [0, 1, 2].map((k) => cur[k] + (m.to[k] - cur[k]) * p) as Cam;
  }
  return cur;
};
const shakeAt = (f: number, hits: [number, number, number][]) => {
  let x = 0, y = 0;
  for (const [at, amp, dur] of hits) {
    if (f >= at && f < at + dur) {
      const k = 1 - (f - at) / dur;
      x += Math.sin(f * 2.7) * amp * k; y += Math.cos(f * 3.3) * amp * k;
    }
  }
  return [x, y];
};

// ---------- small components ----------
const Mask: React.FC<{lines: (string | React.ReactNode)[]; at: number; out?: number; size: number; top: number; color?: string; font?: string; stagger?: number; align?: 'center' | 'left'; left?: number; lh?: number; colors?: string[]; ls?: number}> = ({lines, at, out, size, top, color = WHITE, font = ARCH, stagger = 6, align = 'center', left = 60, lh = 0.98, colors, ls = -2}) => {
  const f = useCurrentFrame();
  if (f < at - 1 || (out !== undefined && f > out + 12)) return null;
  return (
    <div style={{position: 'absolute', top, left: align === 'center' ? 0 : left, right: align === 'center' ? 0 : undefined, textAlign: align}}>
      {lines.map((l, i) => {
        const p = spring({frame: f - at - i * stagger, fps: FPS, config: {damping: 18, stiffness: 160, mass: 0.7}});
        const q = out !== undefined ? interpolate(f, [out + i * 2, out + 9 + i * 2], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)}) : 0;
        return (
          <div key={i} style={{overflow: 'hidden', lineHeight: lh, paddingBottom: size * 0.06}}>
            <div style={{transform: `translateY(${(1 - p) * 115 - q * 115}%)`, fontFamily: font, fontWeight: font === ARCH ? 800 : 700, fontSize: size, color: colors?.[i] ?? color, letterSpacing: ls, textTransform: 'uppercase', textShadow: '0 6px 0 rgba(0,0,0,.55)'}}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

const Win: React.FC<{at: number; out: number; x: number; y: number; w: number; h: number; title: string; children: React.ReactNode; accent?: string; dark?: boolean}> = ({at, out, x, y, w, h, title, children, accent = NEON, dark}) => {
  const f = useCurrentFrame();
  if (f < at - 1 || f > out + 14) return null;
  const p = spring({frame: f - at, fps: FPS, config: {damping: 16, stiffness: 150, mass: 0.8}});
  const q = interpolate(f, [out, out + 12], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const ty = (1 - p) * -(y + h + 80) - q * (y + h + 80);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `translateY(${ty}px)`, background: dark ? '#000' : '#0d0d0f', border: `5px solid ${accent}`, boxShadow: `10px 10px 0 ${accent}55, 0 30px 60px rgba(0,0,0,.6)`, overflow: 'hidden'}}>
      <div style={{height: 52, background: accent, color: BLACK, fontFamily: MONO, fontWeight: 700, fontSize: 26, display: 'flex', alignItems: 'center', padding: '0 18px', justifyContent: 'space-between'}}>
        <span>{title}</span><span style={{letterSpacing: 6}}>_ □ ×</span>
      </div>
      <div style={{position: 'absolute', top: 52, left: 0, right: 0, bottom: 0, overflow: 'hidden'}}>{children}</div>
    </div>
  );
};

const Chip: React.FC<{at: number; out?: number; text: string; bg?: string; fg?: string; size?: number}> = ({at, out, text, bg = NEON, fg = BLACK, size = 34}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - at, fps: FPS, config: {damping: 14, stiffness: 180}});
  const q = out !== undefined ? interpolate(f, [out, out + 8], [0, 1], clamp) : 0;
  const vis = f >= at ? p * (1 - q) : 0;
  return (
    <div style={{maxWidth: vis * 800, overflow: 'hidden', transition: 'none', display: 'inline-block', marginRight: vis > 0.02 ? 14 : 0, verticalAlign: 'top'}}>
      <div style={{whiteSpace: 'nowrap', background: bg, color: fg, fontFamily: MONO, fontWeight: 700, fontSize: size, padding: '10px 18px', transform: `scale(${0.6 + 0.4 * vis})`, transformOrigin: 'left center'}}>{text}</div>
    </div>
  );
};

const Counter: React.FC<{at: number; dur: number; to: number; dec?: number; suffix: string; color: string; size: number}> = ({at, dur, to, dec = 0, suffix, color, size}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at, at + dur], [0, to], {...clamp, easing: Easing.out(Easing.cubic)});
  const pop = f >= at + dur ? spring({frame: f - at - dur, fps: FPS, config: {damping: 9, stiffness: 220}}) : 0;
  return <span style={{fontFamily: ARCH, fontWeight: 800, fontSize: size, color, display: 'inline-block', transform: `scale(${1 + 0.12 * Math.sin(pop * Math.PI)})`, letterSpacing: -3}}>{v.toFixed(dec)}{suffix}</span>;
};

const Flash: React.FC<{at: number; color?: string; dur?: number; max?: number}> = ({at, color = WHITE, dur = 7, max = 0.8}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  return <AbsoluteFill style={{background: color, opacity: interpolate(f, [at, at + dur], [max, 0])}} />;
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 12} /></filter>
        <rect width="100%" height="100%" filter="url(#n)" />
      </svg>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.10) 0 2px, transparent 2px 5px)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- character ----------
const blinks = Array.from({length: 40}, (_, i) => Math.round(i * 97 + ((i * 37) % 23) + 20));
const Character: React.FC = () => {
  const f = useCurrentFrame();
  const m = tl.mouth[f] ?? 0;
  let mouth = m === 2 ? (Math.floor(f / 4) % 3 === 0 ? 'o' : 'open') : m === 1 ? 'mid' : 'closed';
  let eyes = blinks.some((b) => f >= b && f < b + 4) ? 'blink' : 'open';
  const wide = [[s('cpu90'), e('cpu90', 0.6)], [s('abanicoQ'), e('abanicoQ', 0.4)], [s('volvi'), e('volvi', 0.3)], [s('atrev'), e('atreverias', 0.3)]];
  if (wide.some(([a, b]) => f >= a && f <= b)) eyes = 'wide';
  if (f > e('abanicoQ', 0.45) && f < s('olvide', 0.1)) eyes = 'blink';
  const breath = Math.sin((f / FPS) * Math.PI * 0.5) * 4;
  const talk = m > 0 ? -4 : 0;
  return <Img src={staticFile(`char_${mouth}_${eyes}.png`)} style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${breath + talk}px)`}} />;
};

// laptop screen
const SCR = {x: 846, y: 801, w: 198, h: 153};
const LaptopScreen: React.FC = () => {
  const f = useCurrentFrame();
  const inst0 = s('ubuntu', 0.1), inst1 = s('ubuword', 0.05);
  const g0 = s('dualboot'), g1 = s('perodime');
  let src = 'scr_win.png';
  if (f >= inst0) src = 'scr_term.png';
  if (f >= inst1) src = 'scr_ubu.png';
  if (f >= g0 && f < g1) src = 'scr_term.png';
  const prog = interpolate(f, [inst0, inst1], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, overflow: 'hidden'}}>
      <Img src={staticFile(src)} />
      {f >= inst0 && f < inst1 && <div style={{position: 'absolute', left: 18, bottom: 22, height: 14, width: (SCR.w - 36) * prog, background: UBU}} />}
      {f >= inst1 - 1 && f < inst1 + 6 && <AbsoluteFill style={{background: WHITE, opacity: interpolate(f, [inst1 - 1, inst1 + 6], [1, 0])}} />}
    </div>
  );
};

const Heat: React.FC<{active: boolean}> = ({active}) => {
  const f = useCurrentFrame();
  if (!active) return null;
  return (
    <>
      {Array.from({length: 10}, (_, i) => {
        const life = 26, t0 = (f + i * 7) % life, p = t0 / life;
        const x = 860 + ((i * 53) % 180) + Math.sin((f + i * 11) / 4) * 8;
        const y = 790 - p * 170;
        return <div key={i} style={{position: 'absolute', left: Math.round(x / 9) * 9, top: Math.round(y / 9) * 9, width: 9, height: 9, background: i % 3 ? WHITE : '#ff9a3b', opacity: (1 - p) * 0.75}} />;
      })}
    </>
  );
};

// ---------- main ----------
export const Video: React.FC = () => {
  const f = useCurrentFrame();
  const [ctx, cty, csc] = camAt(f);
  const hits: [number, number, number][] = [
    [s('hook'), 14, 8], [s('hook', 0.65), 10, 8], [s('cpu90hit'), 18, 12], [s('volvi'), 22, 12], [s('ubuword', 0.05), 8, 8],
    [s('elijo'), 8, 6], [s('atrev'), 22, 12], [END - F(3.0), 10, 8],
  ];
  const [sx, sy] = shakeAt(f, hits);
  const fanOn = f >= s('avion', -0.2) && f < s('nonuevo');
  const lapShake = fanOn ? (f < s('mira') ? 7 : 3) : (f >= s('abanicoQ', -0.1) && f <= e('abanicoQ', 0.05) ? 5 : 0);
  const lx = lapShake ? Math.round(Math.sin(f * 2.1) * lapShake) : 0;
  const ly = lapShake ? Math.round(Math.cos(f * 2.9) * lapShake * 0.6) : 0;
  const flashback = f >= s('nonuevo', -0.1) && f < s('atreven', -0.1);
  const intro = interpolate(f, [0, 8], [0, 1], clamp);

  // inner zoom for Stacer panel (image coords: 1366x768 scaled to 1000 wide)
  const stK = 1000 / 1366;
  const stMoves: {at: number; to: Cam}[] = [
    {at: 0, to: [0, 0, 1]},
    {at: s('ramzoom'), to: [-(495 * stK) * 2.2 + 500, -(270 * stK) * 2.2 + 240, 2.2]},
    {at: s('procesador', -0.1), to: [-(231 * stK) * 2.2 + 500, -(270 * stK) * 2.2 + 240, 2.2]},
  ];
  let st: Cam = [0, 0, 1];
  for (const m of stMoves) { const p = interpolate(f, [m.at, m.at + 12], [0, 1], {...clamp, easing: ease}); st = [0, 1, 2].map((k) => st[k] + (m.to[k] - st[k]) * p) as Cam; }

  const tmK = 960 / 760;
  const compAt = e('cpu4', 0.08);

  return (
    <AbsoluteFill style={{background: BLACK, overflow: 'hidden'}}>
      {/* backdrop grid for panel mode */}
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${NEON}10 2px, transparent 2px), linear-gradient(90deg, ${NEON}10 2px, transparent 2px)`, backgroundSize: '54px 54px'}} />

      {/* WORLD */}
      <AbsoluteFill style={{transform: `translate(${ctx + sx}px, ${cty + sy}px) scale(${csc})`, filter: flashback ? 'sepia(0.85) saturate(0.7) contrast(1.15) brightness(0.8)' : undefined}}>
        <Img src={staticFile('room.png')} style={{position: 'absolute'}} />
        <div style={{position: 'absolute', inset: 0, transform: `translate(${lx}px, ${ly}px)`}}>
          <Img src={staticFile('laptop.png')} style={{position: 'absolute'}} />
          <LaptopScreen />
        </div>
        <Heat active={fanOn && f < s('mira')} />
        <Character />
      </AbsoluteFill>
      {/* fade room edge into black when in panel mode */}
      {cty > 100 && <div style={{position: 'absolute', left: 0, right: 0, top: cty - 40, height: 120, background: `linear-gradient(${BLACK}, transparent)`, opacity: Math.min(1, cty / 500)}} />}

      {(() => {
        const R = [[s('hook', -0.1), s('avion', -0.1)], [s('conwindows', -0.1), s('mira', -0.1)], [s('atreven', -0.1), s('ahoramira', -0.2)], [s('abanicoQ', -0.1), s('localsend', -0.2)], [s('nobote', -0.1), s('dualboot', -0.1)], [s('perodime', -0.1), END]];
        const o = Math.max(...R.map(([a, b]) => interpolate(f, [a, a + 6, b - 4, b], [0, 1, 1, 0], clamp)));
        return o > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 760, opacity: o * 0.85, background: `linear-gradient(${BLACK} 0%, ${BLACK}dd 45%, transparent 100%)`}} /> : null;
      })()}
      {/* ===== HOOK ===== */}
      <Mask lines={['> REAL_TALK.EXE']} at={F(0.2)} out={s('avion', -0.25)} size={30} top={120} font={MONO} color={NEON} ls={2} />
      <Mask lines={['ME CAMBIO', 'A LINUX']} at={s('hook', -0.05)} out={s('avion', -0.25)} size={150} top={180} colors={[WHITE, NEON]} stagger={F(0.68)} />

      {/* ===== AVION ===== */}
      {f >= s('avion', 0.8) && f < s('avion', 2.45) && (() => {
        const p = interpolate(f, [s('avion', 0.8), s('avion', 2.45)], [0, 1]);
        const x = 1180 - p * 1600, y = 330 + Math.sin(p * 8) * 14;
        return (
          <div style={{position: 'absolute', left: x, top: y}}>
            {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 240 + i * 60, top: 40 + i * 30, width: 120 - i * 25, height: 9, background: WHITE, opacity: 0.5 - i * 0.12}} />)}
            <Img src={staticFile('sp_plane.png')} style={{width: 171 * 1.5, height: 90 * 1.5, imageRendering: 'pixelated'}} />
          </div>
        );
      })()}
      {fanOn && f < s('conwindows') && f > s('avion', 0.1) && (
        <div style={{position: 'absolute', top: 1290, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 92, color: NEON, transform: `translate(${Math.sin(f * 1.7) * 6}px, ${Math.cos(f * 2.3) * 5}px)`, textShadow: '6px 6px 0 #000'}}>VRRRRRRR</div>
      )}
      {f >= s('nohago') && f < s('conwindows', -0.1) && (() => {
        const txt = '> y no estoy haciendo la gran cosa';
        const n = Math.floor(interpolate(f, [s('nohago'), e('nohago', -0.2)], [0, txt.length], clamp));
        return <div style={{position: 'absolute', top: 1470, left: 60, right: 60, fontFamily: MONO, fontWeight: 700, fontSize: 44, color: WHITE, background: '#000c', padding: '18px 22px', border: `3px solid ${NEON}`}}>{txt.slice(0, n)}<span style={{opacity: f % 16 < 8 ? 1 : 0, color: NEON}}>█</span></div>;
      })()}

      {/* ===== CON WINDOWS ===== */}
      <div style={{position: 'absolute', top: 150, left: 60}}>
        {f >= s('conwindows') - 1 && f < s('mira', -0.1) + 12 && (
          <>
            <Chip at={s('conwindows')} out={s('mira', -0.2)} text="CON WINDOWS" bg={BLUE} fg={WHITE} size={52} />
          </>
        )}
      </div>
      {f >= s('conwindows', 0.6) && f < s('mira', -0.1) && (() => {
        const p = spring({frame: f - s('conwindows', 0.6), fps: FPS, config: {damping: 12}});
        return (
          <div style={{position: 'absolute', top: 290, left: 60, display: 'flex', alignItems: 'center', gap: 28, transform: `scale(${p})`, transformOrigin: 'left center'}}>
            <Img src={staticFile('sp_fan.png')} style={{width: 144, height: 144, transform: `rotate(${(Math.floor(f / 1) % 4) * 22.5}deg)`}} />
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 46, color: WHITE, lineHeight: 1.15}}>ABANICO:<br /><span style={{color: RED}}>SIEMPRE ON</span></div>
          </div>
        );
      })()}

      {/* ===== TASK MANAGER ===== */}
      <Win at={s('mira', -0.1)} out={s('nonuevo', -0.2)} x={60} y={110} w={960} h={52 + 272 * tmK} title="Administrador de tareas · WIN">
        <Img src={staticFile('taskmgr.png')} style={{width: 960}} />
        {f >= s('brave46', 0.05) && <div style={{position: 'absolute', left: 6, top: 216 * tmK, width: 400 * tmK, height: 28 * tmK, border: `5px solid ${NEON}`, opacity: f % 10 < 7 ? 1 : 0.5}} />}
        {f >= s('memcard') && <div style={{position: 'absolute', left: 474 * tmK, top: 100 * tmK, width: 73 * tmK, height: 48 * tmK, border: `5px solid ${RED}`}} />}
        {f >= s('cpu90') && <div style={{position: 'absolute', left: 402 * tmK, top: 100 * tmK, width: 72 * tmK, height: 48 * tmK, border: `5px solid ${RED}`, background: f >= s('cpu90hit') && f % 8 < 4 ? '#ff3b3b44' : undefined}} />}
      </Win>
      <div style={{position: 'absolute', top: 545, left: 60}}>
        {f >= s('brave46') - 1 && f < s('nonuevo') && <Chip at={s('brave46', 0.05)} out={s('nonuevo', -0.25)} text="SOLO BRAVE ABIERTO" size={36} />}
      </div>
      {f >= s('memcard') && f < s('nonuevo', 0.2) && (() => {
        const out = interpolate(f, [s('nonuevo', -0.25), s('nonuevo', 0.1)], [0, 1], clamp);
        const card = (at: number, label: string, to: number, cd: number, dd: number) => {
          const p = spring({frame: f - at, fps: FPS, config: {damping: 15}});
          return f >= at ? (
            <div style={{width: 470, background: '#000', border: `5px solid ${RED}`, padding: '14px 24px', transform: `translateY(${(1 - p) * 60 + out * -800}px)`, opacity: p}}>
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, color: WHITE}}>{label}</div>
              <Counter at={at + cd} dur={dd} to={to} suffix="%" color={RED} size={150} />
              <div style={{height: 16, background: '#222'}}><div style={{height: 16, width: `${interpolate(f, [at + cd, at + cd + dd], [0, to], clamp)}%`, background: RED}} /></div>
            </div>
          ) : <div style={{width: 470}} />;
        };
        return <div style={{position: 'absolute', top: 640, left: 50, display: 'flex', gap: 40}}>{card(s('memcard'), 'MEMORIA', 46, s('mem46') - s('memcard'), s('mem46end') - s('mem46'))}{card(s('cpu90'), 'PROCESADOR', 90, 6, s('cpu90hit') - s('cpu90') - 6)}</div>;
      })()}
      <Flash at={s('cpu90hit')} color={RED} max={0.45} dur={8} />

      {/* ===== FLASHBACK ===== */}
      {flashback && (
        <>
          <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 3px, transparent 3px 7px)'}} />
          <div style={{position: 'absolute', top: 70, left: 60, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: WHITE, opacity: f % 20 < 12 ? 1 : 0.2}}>◀◀ REWIND</div>
          <div style={{position: 'absolute', top: 70, right: 60, fontFamily: MONO, fontWeight: 700, fontSize: 40, color: RED}}>● REC</div>
        </>
      )}
      {f >= s('nonuevo', 0.1) && f < s('atreven', 0.1) && (() => {
        const out = interpolate(f, [s('atreven', -0.3), s('atreven', 0.05)], [0, 1], clamp);
        const nodes = [
          {t: 'LINUX', at: s('fiel'), c: NEON},
          {t: 'MAC', at: s('mac'), c: WHITE},
          {t: 'WINDOWS', at: s('winnode'), c: BLUE},
        ];
        const fielP = spring({frame: f - s('fiel'), fps: FPS, config: {damping: 12}});
        return (
          <div style={{position: 'absolute', top: 200, left: 0, right: 0, opacity: 1 - out, transform: `translateY(${out * -200}px)`}}>
            <Mask lines={['ESTE CAMBIO', 'NO ES NUEVO']} at={s('nonuevo', 0.0)} size={96} top={0} />
            <div style={{position: 'absolute', top: 250, left: 60, right: 60, display: 'flex', alignItems: 'center'}}>
              {nodes.map((n, i) => {
                const p = spring({frame: f - n.at, fps: FPS, config: {damping: 13, stiffness: 170}});
                const big = i === 0 ? 1 + 0.25 * fielP : 1;
                return (
                  <React.Fragment key={n.t}>
                    {i > 0 && <div style={{flex: 1, height: 8, background: WHITE, transformOrigin: 'right', transform: `scaleX(${spring({frame: f - nodes[i - 1].at, fps: FPS, config: {damping: 200}})})`, margin: '0 10px'}} />}
                    <div style={{transform: `scale(${p * big})`, background: n.c, color: n.c === WHITE || n.c === NEON ? BLACK : WHITE, fontFamily: ARCH, fontWeight: 800, fontSize: 48, padding: '16px 22px', boxShadow: i === 0 && fielP > 0.1 ? `0 0 ${40 * fielP}px ${NEON}` : undefined}}>{n.t}</div>
                  </React.Fragment>
                );
              })}
            </div>
            {f >= s('fiel') && <div style={{position: 'absolute', top: 400, left: 60, transform: `scale(${fielP})`, transformOrigin: 'left top', fontFamily: MONO, fontWeight: 700, fontSize: 40, color: NEON}}>↑ FIEL USUARIO</div>}
          </div>
        );
      })()}

      {/* ===== NO SE ATREVEN / VOLVI ===== */}
      <Mask lines={['LO QUE MUCHOS', 'NO SE ATREVEN']} at={s('muchos')} out={s('volvi', -0.15)} size={112} top={190} colors={[WHITE, NEON]} stagger={s('atrevenL2') - s('muchos')} />
      {f >= s('volvi') && f < s('ubuntu', -0.05) && (() => {
        const p = spring({frame: f - s('volvi'), fps: FPS, config: {damping: 10, stiffness: 260}});
        return <div style={{position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', fontFamily: ARCH, fontWeight: 800, fontSize: 210, color: NEON, transform: `scale(${2.2 - 1.2 * p})`, opacity: Math.min(1, p * 2), letterSpacing: -6, textShadow: '0 10px 0 #000'}}>VOLVÍ.</div>;
      })()}
      <Flash at={s('volvi')} color={NEON} max={0.5} />
      <Mask lines={['ESTA VEZ:']} at={s('ubuntu', 0.25)} out={s('ahoramira', -0.3)} size={60} top={150} font={MONO} />
      <Mask lines={['UBUNTU']} at={s('ubuword')} out={s('ahoramira', -0.3)} size={200} top={225} color={UBU} />
      <Mask lines={['26.04 LTS']} at={s('ubuword', 0.4)} out={s('ahoramira', -0.3)} size={48} top={445} font={MONO} color={WHITE} />

      {/* ===== STACER ===== */}
      <Win at={s('ahoramira', -0.1)} out={s('abanicoQ', -0.3)} x={40} y={100} w={1000} h={52 + 768 * stK} title="Stacer · UBUNTU">
        <div style={{position: 'absolute', inset: 0, opacity: f >= compAt ? 0 : 1}}>
          <Img src={staticFile('stacer.png')} style={{width: 1000, transformOrigin: '0 0', transform: `translate(${st[0]}px, ${st[1]}px) scale(${st[2]})`}} />
          {f >= s('ramzoom') && (
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: '#000d', padding: '6px 30px', display: 'flex', alignItems: 'baseline', gap: 24}}>
              {f < s('procesador', -0.1)
                ? <><span style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, color: WHITE}}>RAM</span><Counter at={s('ram35')} dur={s('ram35end') - s('ram35')} to={3.5} dec={1} suffix=" GB" color={NEON} size={120} /></>
                : <><span style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, color: WHITE}}>CPU</span><Counter at={s('cpu4', 0.0)} dur={F(0.4)} to={4} suffix="%" color={NEON} size={120} /></>}
            </div>
          )}
        </div>
        {f >= compAt && (() => {
          const row = (label: string, a: number, b: number, i: number) => {
            const at = compAt + i * 5;
            const p = interpolate(f, [at, at + 12], [0, 1], {...clamp, easing: ease});
            return (
              <div style={{marginBottom: 30}}>
                <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: WHITE, marginBottom: 8}}>{label}</div>
                {[[ 'WINDOWS', a, RED], ['UBUNTU', b, NEON]].map(([n, v, c]: any) => (
                  <div key={n} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8}}>
                    <div style={{width: 200, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: c}}>{n}</div>
                    <div style={{flex: 1, height: 44, background: '#1a1a1a'}}><div style={{height: 44, width: `${v * p}%`, background: c}} /></div>
                    <div style={{width: 130, textAlign: 'right', fontFamily: ARCH, fontWeight: 800, fontSize: 52, color: c}}>{Math.round(v * p)}%</div>
                  </div>
                ))}
              </div>
            );
          };
          return <div style={{position: 'absolute', inset: 0, background: '#000', padding: '34px 40px'}}>{row('PROCESADOR', 90, 4, 0)}{row('MEMORIA', 46, 11, 1)}</div>;
        })()}
      </Win>
      <div style={{position: 'absolute', top: 745, left: 40, width: 1000, display: 'flex', flexWrap: 'wrap', rowGap: 12}}>
        {f >= s('ahoramira') && f < s('abanicoQ') && (
          <>
            <Chip at={s('programas')} out={s('ramzoom', -0.1)} text="PROGRAMAS ABIERTOS" size={28} />
            <Chip at={s('pestanas')} out={s('ramzoom', -0.1)} text="PESTAÑAS DE BRAVE" size={28} bg={WHITE} />
            <Chip at={s('fondo')} out={s('ramzoom', -0.1)} text="FONDO ANIMADO" size={28} bg={UBU} fg={WHITE} />
          </>
        )}
      </div>

      {/* ===== ¿Y EL ABANICO? ===== */}
      {f >= s('abanicoQ', -0.05) && f < s('localsend', -0.2) && (() => {
        const stop = e('abanicoQ', 0.05);
        const spinning = f < stop;
        const p = spring({frame: f - s('abanicoQ', -0.05), fps: FPS, config: {damping: 12}});
        return (
          <div style={{position: 'absolute', top: 200, left: 420, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${p})`}}>
            <Img src={staticFile('sp_fan.png')} style={{width: 288, height: 288, transform: `rotate(${spinning ? (f % 4) * 22.5 : 0}deg)`, opacity: spinning ? 1 : 0.55}} />
            <div style={{marginTop: 26, fontFamily: MONO, fontWeight: 700, fontSize: 56, color: spinning ? WHITE : NEON}}>{spinning ? '¿Y EL ABANICO?' : 'FAN: OFF'}</div>
            {!spinning && f < s('localsend', -0.2) && ['z', 'Z', 'z'].map((z, i) => {
              const t = (f - stop - i * 8) / 30;
              return t > 0 ? <div key={i} style={{position: 'absolute', left: 640 + i * 40 + t * 40, top: 40 - t * 90, fontFamily: MONO, fontWeight: 700, fontSize: 50 + i * 12, color: WHITE, opacity: Math.max(0, 1 - t * 0.6)}}>{z}</div> : null;
            })}
          </div>
        );
      })()}
      <Mask lines={['HASTA ME', 'OLVIDÉ DE ÉL']} at={s('olvide', 0.0)} out={s('localsend', -0.3)} size={96} top={1280} colors={[WHITE, NEON]} stagger={5} />

      {/* ===== LOCALSEND ===== */}
      <Mask lines={['LOCALSEND']} at={s('localsend', 0.15)} out={s('nobote', -0.3)} size={150} top={110} color={NEON} />
      <div style={{position: 'absolute', top: 290, left: 60}}>
        {f >= s('delvideo') - 1 && f < s('nobote') && (
          <>
            <Chip at={s('delvideo', 0.0)} out={s('nobote', -0.3)} text="↺ EL DEL VIDEO ANTERIOR" size={32} bg={WHITE} />
            <Chip at={s('siempre')} out={s('nobote', -0.3)} text="SIEMPRE ABIERTO" size={32} />
          </>
        )}
      </div>
      {f >= s('localsend', 0.3) && f < s('nobote', -0.05) && (() => {
        const out = interpolate(f, [s('nobote', -0.35), s('nobote', -0.05)], [0, 1], clamp);
        const p = spring({frame: f - s('localsend', 0.3), fps: FPS, config: {damping: 14}});
        const sends = Array.from({length: Math.floor((s('nobote', -0.6) - s('delvideo', 0.2)) / 15)}, (_, i) => s('delvideo', 0.2) + i * 15);
        return (
          <div style={{position: 'absolute', top: 380, left: 0, right: 0, height: 300, opacity: 1 - out}}>
            <Img src={staticFile('sp_phone.png')} style={{position: 'absolute', left: 120, top: 20, width: 108 * 1.8, height: 135 * 1.8, transform: `translateX(${(1 - p) * -400}px)`}} />
            <div style={{position: 'absolute', left: 660, top: 40, transform: `translateX(${(1 - p) * 400}px)`}}><Img src={staticFile('laptop_icon.png')} style={{width: 280 * 1.1, height: 240 * 1.1}} /><Img src={staticFile('scr_ubu.png')} style={{position: 'absolute', left: 46 * 1.1, top: 21 * 1.1, width: 198 * 1.1, height: 153 * 1.1}} /></div>
            {sends.map((at, i) => {
              if (f < at || f > at + 15) return null;
              const t = (f - at) / 15;
              const x = 260 + t * 470, y = 120 - Math.sin(t * Math.PI) * 150;
              return <Img key={i} src={staticFile('sp_file.png')} style={{position: 'absolute', left: x, top: y, width: 72 * 1.3, height: 81 * 1.3, transform: `rotate(${t * 360}deg)`}} />;
            })}
            {f >= s('laptopword', -0.5) && <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 44, color: WHITE}}>CELULAR <span style={{color: NEON}}>→</span> LAPTOP</div>}
          </div>
        );
      })()}

      {/* ===== NO BOTE A WINDOWS ===== */}
      <Mask lines={['NO BOTÉ', 'A WINDOWS']} at={s('nobote', 0.0)} out={s('dualboot', -0.3)} size={130} top={190} colors={[WHITE, BLUE]} stagger={5} />

      {/* ===== DUAL BOOT / GRUB ===== */}
      <Win at={s('dualboot', -0.05)} out={s('perodime', -0.3)} x={60} y={110} w={960} h={470} title="GNU GRUB" accent={WHITE} dark>
        {(() => {
          const items = ['Ubuntu', 'Opciones avanzadas para Ubuntu', 'UEFI Firmware Settings', 'Windows Boot Manager'];
          const steps = [s('necesito'), s('necesito', 0.15), s('necesito', 0.3)];
          const sel = steps.filter((t) => f >= t).length;
          const enter = s('elijo');
          return (
            <div style={{padding: '30px 36px', fontFamily: MONO, fontSize: 36, color: WHITE}}>
              <div style={{border: `3px solid ${WHITE}`, padding: '14px 0'}}>
                {items.map((it, i) => (
                  <div key={it} style={{padding: '8px 22px', background: i === sel ? (f >= enter && f % 6 < 3 ? NEON : WHITE) : 'transparent', color: i === sel ? BLACK : WHITE, fontWeight: 700}}>{i === sel ? '*' : ' '}{it}</div>
                ))}
              </div>
              <div style={{marginTop: 22, fontSize: 24, color: '#aaa'}}>Usa ↑ y ↓ para elegir. Enter para arrancar.</div>
            </div>
          );
        })()}
      </Win>
      <Mask lines={['DUAL BOOT']} at={s('dualword')} out={s('perodime', -0.3)} size={150} top={620} color={NEON} />
      <Flash at={s('elijo')} color={WHITE} max={0.35} />

      {/* ===== CTA ===== */}
      <Mask lines={['¿TÚ TE', 'ATREVERÍAS?']} at={s('atreverias', 0.0)} out={e('teleo2', 0.2)} size={124} top={170} colors={[WHITE, NEON]} stagger={s('atrev') - s('atreverias')} />
      <Flash at={s('atrev')} color={NEON} max={0.4} />
      {f >= s('teleo') && f < e('teleo2', 0.3) && (() => {
        const p = spring({frame: f - s('teleo'), fps: FPS, config: {damping: 13}});
        return (
          <div style={{position: 'absolute', top: 1330, left: 60, right: 60, transform: `translateY(${(1 - p) * 120}px)`, opacity: p, textAlign: 'center'}}>
            <div style={{display: 'inline-block', background: NEON, color: BLACK, fontFamily: MONO, fontWeight: 700, fontSize: 46, padding: '18px 28px', boxShadow: '8px 8px 0 #000'}}>TE LEO EN LOS COMENTARIOS</div>
            <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 110, color: NEON, transform: `translateY(${Math.abs(Math.sin(f / 6)) * 22}px)`}}>↓</div>
          </div>
        );
      })()}

      {/* ===== END CARD ===== */}
      {f >= e('teleo2', 0.3) && (() => {
        const at = e('teleo2', 0.3);
        const p = interpolate(f, [at, at + 10], [0, 1], {...clamp, easing: ease});
        const g = f - at < 12 && f % 3 === 0;
        return (
          <AbsoluteFill style={{background: BLACK, clipPath: `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 120, color: NEON, letterSpacing: -4, transform: g ? 'translateX(14px) skewX(-8deg)' : undefined, textShadow: g ? `-8px 0 ${RED}, 8px 0 ${BLUE}` : undefined}}>REAL_TALK.EXE</div>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, color: WHITE, marginTop: 20}}>@j.c_guerrero</div>
          </AbsoluteFill>
        );
      })()}

      <Grain />
      {/* CRT turn-on */}
      {f < 10 && <AbsoluteFill style={{background: '#000', opacity: 1 - intro}}><div style={{position: 'absolute', top: 955, left: 0, right: 0, height: 10, background: WHITE, transform: `scaleX(${interpolate(f, [0, 4], [0, 1], clamp)})`}} /></AbsoluteFill>}

      <Sound />
    </AbsoluteFill>
  );
};

// ---------- audio ----------
const SFX: React.FC<{at: number; src: string; vol?: number; dur?: number}> = ({at, src, vol = 0.6, dur}) =>
  at < 0 ? null : <Sequence from={at} durationInFrames={dur ?? 300} layout="none"><Audio src={staticFile(src + '.wav')} volume={vol} /></Sequence>;

const Sound: React.FC = () => {
  const ticks = (a: number, b: number, step = 3, src = 'hover_tick_mid', vol = 0.25) => Array.from({length: Math.floor((b - a) / step)}, (_, i) => <SFX key={src + a + i} at={a + i * step} src={src} vol={vol} />);
  const silenceA = e('abanicoQ', 0.05), silenceB = s('olvide', -0.05);
  const musicVol = (f: number) => {
    if (f >= silenceA && f < silenceB) return 0;
    let v = 0.075;
    if (f >= e('teleo2', 0.3)) v = 0.16;
    return v * interpolate(f, [0, 10, END - 25, END - 2], [0, 1, 1, 0], clamp);
  };
  const fanVol = (f: number) => {
    const g = f + s('avion', -0.3);
    let v = g < s('conwindows') ? 0.5 : 0.22;
    return v * interpolate(g, [s('nonuevo', -0.3), s('nonuevo', 0.05)], [1, 0], clamp);
  };
  return (
    <>
      <Audio src={staticFile('vo_trim.wav')} volume={1} />
      <Audio src={staticFile('chiptune_loop.wav')} volume={musicVol} />
      <Sequence from={s('avion', -0.3)} durationInFrames={s('nonuevo', 0.1) - s('avion', -0.3)} layout="none"><Audio src={staticFile('fan_turbine.wav')} volume={fanVol} /></Sequence>
      <Sequence from={s('abanicoQ', -0.05)} durationInFrames={silenceA - s('abanicoQ', -0.05)} layout="none"><Audio src={staticFile('fan_short.wav')} volume={0.5} /></Sequence>

      <SFX at={0} src="glitch_hit" vol={0.45} />
      <SFX at={F(0.2)} src="ui_pop_blip" vol={0.4} />
      <SFX at={s('hook', -0.05)} src="impact_punch" vol={0.75} />
      <SFX at={s('hook', 0.62)} src="cut_hit_punch" vol={0.6} />
      <SFX at={s('avion', -0.25)} src="whoosh_fast_crisp" vol={0.5} />
      <SFX at={s('avion', 0.75)} src="whoosh_big_jet" vol={0.8} />
      {ticks(s('nohago'), e('nohago', -0.2), 3, 'typing_key_laptop', 0.32)}
      <SFX at={s('conwindows', -0.1)} src="whoosh_fast_whip" vol={0.4} />
      <SFX at={s('conwindows')} src="ui_pop_blip" vol={0.5} />
      <SFX at={s('conwindows', 0.6)} src="pop_1" vol={0.5} />
      <SFX at={s('mira', -0.15)} src="whoosh_fast_whip" vol={0.55} />
      <SFX at={s('mira', 0.25)} src="knock_desk" vol={0.5} />
      <SFX at={s('brave46', 0.05)} src="ui_pop_soft" vol={0.55} />
      <SFX at={s('memcard')} src="ui_pop_blip" vol={0.5} />
      {ticks(s('mem46'), s('mem46end'), 3)}
      <SFX at={s('cpu90')} src="ui_pop_blip" vol={0.5} />
      {ticks(s('cpu90') + 6, s('cpu90hit'), 2)}
      <SFX at={s('cpu90hit')} src="glitch_crush" vol={0.6} />
      <SFX at={s('cpu90hit')} src="sub_drop_punch" vol={0.55} />
      <SFX at={s('nonuevo', -0.25)} src="reverse_swell_short" vol={0.5} />
      <SFX at={s('nonuevo', -0.1)} src="glitch_scramble" vol={0.5} />
      <SFX at={s('winnode')} src="mallet_marimba" vol={0.45} />
      <SFX at={s('mac')} src="mallet_marimba" vol={0.45} />
      <SFX at={s('fiel')} src="mallet_glock" vol={0.55} />
      <SFX at={s('fiel')} src="swish_zing" vol={0.35} />
      <SFX at={s('atreven', -0.15)} src="whoosh_fast_crisp" vol={0.45} />
      <SFX at={s('muchos')} src="swish_zing" vol={0.35} />
      <SFX at={s('atrevenL2')} src="swish_zing" vol={0.35} />
      <SFX at={s('volvi', -2.8)} src="riser_tension" vol={0.45} />
      <SFX at={s('volvi')} src="impact_punch" vol={0.9} />
      <SFX at={s('volvi')} src="cut_hit_kick" vol={0.6} />
      <SFX at={s('ubuntu', -0.15)} src="whoosh_fast_crisp" vol={0.5} />
      {ticks(s('ubuntu', 0.1), s('ubuword'), 3, 'typing_key_laptop', 0.35)}
      <SFX at={s('ubuword')} src="swish_zing" vol={0.35} />
      <SFX at={s('ubuword', 0.05)} src="logo_sting_spark" vol={0.7} />
      <SFX at={s('ahoramira', -0.15)} src="whoosh_fast_whip" vol={0.55} />
      <SFX at={s('programas')} src="ui_pop_blip" vol={0.5} />
      <SFX at={s('pestanas')} src="ui_pop_blip" vol={0.5} />
      <SFX at={s('fondo')} src="ui_pop_blip" vol={0.5} />
      <SFX at={s('ramzoom')} src="swipe_glide" vol={0.45} />
      {ticks(s('ram35'), s('ram35end'), 3)}
      <SFX at={s('ram35end')} src="mallet_glock" vol={0.5} />
      <SFX at={s('procesador', -0.1)} src="swipe_glide" vol={0.45} />
      {ticks(s('cpu4'), s('cpu4', 0.4), 4)}
      <SFX at={s('cpu4', 0.4)} src="notify_mid_tine" vol={0.55} />
      <SFX at={e('cpu4', 0.08)} src="swish_zing" vol={0.45} />
      {ticks(e('cpu4', 0.08), e('cpu4', 0.08) + 17, 3, 'hover_tick_high', 0.25)}
      <SFX at={s('abanicoQ', -0.15)} src="whoosh_fast_crisp" vol={0.45} />
      <SFX at={e('abanicoQ', 0.05)} src="toggle_off" vol={0.7} />
      <SFX at={s('olvide')} src="ui_pop_soft" vol={0.45} />
      <SFX at={s('localsend', -0.2)} src="whoosh_fast_whip" vol={0.5} />
      <SFX at={s('localsend', 0.15)} src="cut_hit_punch" vol={0.45} />
      <SFX at={s('delvideo')} src="ui_pop_blip" vol={0.45} />
      <SFX at={s('siempre')} src="ui_pop_blip" vol={0.45} />
      {Array.from({length: Math.floor((s('nobote', -0.6) - s('delvideo', 0.2)) / 15)}, (_, i) => <React.Fragment key={'ls' + i}><SFX at={s('delvideo', 0.2) + i * 15} src="swish_zing" vol={0.22} /><SFX at={s('delvideo', 0.2) + i * 15 + 14} src="pop_1" vol={0.3} /></React.Fragment>)}
      <SFX at={s('laptopword', -0.5)} src="notify_m4" vol={0.35} />
      <SFX at={s('nobote', -0.15)} src="whoosh_fast_crisp" vol={0.45} />
      <SFX at={s('nobote')} src="knock_desk" vol={0.55} />
      <SFX at={s('dualboot', -0.1)} src="glitch_hit" vol={0.45} />
      <SFX at={s('dualword')} src="impact_punch" vol={0.5} />
      <SFX at={s('necesito', 0.3)} src="hover_tick_detent" vol={0.6} />
      <SFX at={s('necesito')} src="hover_tick_detent" vol={0.6} />
      <SFX at={s('necesito', 0.15)} src="hover_tick_detent" vol={0.6} />
      <SFX at={s('elijo')} src="toggle_on" vol={0.7} />
      <SFX at={s('perodime', -0.15)} src="whoosh_fast_crisp" vol={0.45} />
      <SFX at={s('atrev') - F(1.76)} src="riser_build" vol={0.45} />
      <SFX at={s('atreverias')} src="swish_zing" vol={0.35} />
      <SFX at={s('atrev')} src="impact_punch" vol={0.85} />
      <SFX at={s('teleo')} src="ui_pop_blip" vol={0.5} />
      <SFX at={e('teleo2', 0.3)} src="glitch_stutter" vol={0.4} />
      <SFX at={e('teleo2', 0.35)} src="logo_sting_spark" vol={0.7} />
    </>
  );
};
