import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import '@fontsource/archivo/800.css';
import '@fontsource/space-mono/700.css';

const NEON = '#E8FF00', BLACK = '#0a0a0a', WHITE = '#f2f2f0', RED = '#ff3b3b', UBU = '#E95420';
const ARCH = 'Archivo, sans-serif', MONO = '"Space Mono", monospace';
const SCR = {x: 846, y: 801};

const World: React.FC<{tx: number; ty: number; s: number; screen: string; eyes: string; mouth: string}> = ({tx, ty, s, screen, eyes, mouth}) => (
  <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${s})`}}>
    <Img src={staticFile('room.png')} style={{position: 'absolute'}} />
    <Img src={staticFile('laptop.png')} style={{position: 'absolute'}} />
    <Img src={staticFile(`scr_${screen}.png`)} style={{position: 'absolute', left: SCR.x, top: SCR.y}} />
    <Img src={staticFile(`char_${mouth}_${eyes}.png`)} style={{position: 'absolute'}} />
  </AbsoluteFill>
);

const Grain: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.10) 0 2px, transparent 2px 5px)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.6) 100%)'}} />
  </AbsoluteFill>
);

const Stat: React.FC<{label: string; v: string; c: string; fg?: string}> = ({label, v, c, fg = BLACK}) => (
  <div style={{flex: 1, background: c, padding: '18px 26px', boxShadow: '8px 8px 0 #000'}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: fg}}>{label}</div>
    <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 150, lineHeight: 1, color: fg, letterSpacing: -4}}>{v}</div>
  </div>
);

export const Cover: React.FC<{variant: 'A' | 'B'}> = ({variant}) => {
  if (variant === 'A') {
    return (
      <AbsoluteFill style={{background: BLACK, overflow: 'hidden'}}>
        <World tx={0} ty={260} s={1.12} screen="ubu" eyes="wide" mouth="open" />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 900, background: `linear-gradient(${BLACK} 0%, ${BLACK}ee 50%, transparent 100%)`}} />
        <div style={{position: 'absolute', top: 270, left: 0, right: 0, textAlign: 'center'}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 34, color: NEON, letterSpacing: 2}}>&gt; REAL_TALK.EXE</div>
          <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 168, lineHeight: 0.95, color: WHITE, letterSpacing: -5, marginTop: 14, textShadow: '0 8px 0 #000'}}>ME CAMBIO</div>
          <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 168, lineHeight: 0.95, color: NEON, letterSpacing: -5, textShadow: '0 8px 0 #000'}}>A LINUX</div>
        </div>
        <div style={{position: 'absolute', top: 1340, left: 60, right: 60, display: 'flex', gap: 26, alignItems: 'center'}}>
          <Stat label="CPU · WINDOWS" v="90%" c={RED} fg={WHITE} />
          <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 90, color: WHITE}}>→</div>
          <Stat label="CPU · UBUNTU" v="4%" c={NEON} />
        </div>
        <Grain />
      </AbsoluteFill>
    );
  }
  // B: "sonaba como un avión"
  return (
    <AbsoluteFill style={{background: BLACK, overflow: 'hidden'}}>
      <World tx={-330} ty={250} s={1.5} screen="win" eyes="wide" mouth="o" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 980, background: `linear-gradient(${BLACK} 0%, ${BLACK}e8 50%, transparent 100%)`}} />
      <Img src={staticFile('sp_plane.png')} style={{position: 'absolute', left: 660, top: 860, width: 171 * 1.6, height: 90 * 1.6, imageRendering: 'pixelated'}} />
      {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 950 + i * 40, top: 905 + i * 32, width: 140 - i * 30, height: 10, background: WHITE, opacity: 0.55 - i * 0.15}} />)}
      <div style={{position: 'absolute', top: 260, left: 70, right: 70}}>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 36, color: NEON}}>&gt; solo con Brave abierto…</div>
        <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 116, lineHeight: 0.95, color: WHITE, letterSpacing: -4, marginTop: 14, textShadow: '0 8px 0 #000'}}>MI LAPTOP</div>
        <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 116, lineHeight: 0.95, color: WHITE, letterSpacing: -4, textShadow: '0 8px 0 #000'}}>SONABA COMO</div>
        <div style={{fontFamily: ARCH, fontWeight: 800, fontSize: 116, lineHeight: 0.95, color: RED, letterSpacing: -4, textShadow: '0 8px 0 #000'}}>UN AVIÓN</div>
      </div>
      <div style={{position: 'absolute', top: 1440, left: 70, display: 'flex', gap: 18}}>
        <div style={{background: NEON, color: BLACK, fontFamily: MONO, fontWeight: 700, fontSize: 46, padding: '16px 26px', boxShadow: '8px 8px 0 #000'}}>VOLVÍ A LINUX</div>
      </div>
      <Grain />
    </AbsoluteFill>
  );
};
