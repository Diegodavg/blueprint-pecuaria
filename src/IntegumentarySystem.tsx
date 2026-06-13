import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ─── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg: '#020b18',
  navy: '#0a1628',
  blue: '#1565C0',
  blueM: '#1E88E5',
  blueL: '#42A5F5',
  blueXL: '#90CAF9',
  cyan: '#00BCD4',
  cyanL: '#4DD0E1',
  cyanBright: '#00E5FF',
  epidermis: '#26C6DA',
  dermis: '#1565C0',
  hypodermis: '#0a1c3a',
  neural: '#FFD54F',
  blood: '#EF5350',
  vein: '#B71C1C',
  sebaceous: '#FFA726',
  adipose: '#FF7043',
  nail: '#B3E5FC',
  grid: 'rgba(0,229,255,0.06)',
  glowCyan: 'rgba(0,229,255,0.25)',
  glowBlue: 'rgba(33,150,243,0.3)',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function fi(
  frame: number,
  inRange: [number, number],
  outRange: [number, number]
): number {
  return interpolate(frame, inRange, outRange, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

// ─── Background ─────────────────────────────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();

  const gridOpacity = fi(frame, [0, 40], [0, 1]);
  const pulseScale = 1 + Math.sin(frame * 0.04) * 0.05;

  const particles = Array.from({length: 60}, (_, i) => ({
    x: seededRandom(i * 3) * 1920,
    y: seededRandom(i * 3 + 1) * 1080,
    r: seededRandom(i * 3 + 2) * 2.5 + 0.5,
    op: seededRandom(i * 3 + 3) * 0.6 + 0.2,
    phase: seededRandom(i * 3 + 4) * Math.PI * 2,
  }));

  return (
    <AbsoluteFill style={{background: P.bg}}>
      {/* Atmospheric radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          left: '50%',
          top: '50%',
          transform: `translate(-50%,-50%) scale(${pulseScale})`,
          background:
            'radial-gradient(ellipse at center, rgba(21,101,192,0.18) 0%, rgba(0,188,212,0.08) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid */}
      <svg
        style={{position: 'absolute', inset: 0, opacity: gridOpacity}}
        width="1920"
        height="1080"
      >
        {Array.from({length: 25}, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * 80}
            y1={0}
            x2={i * 80}
            y2={1080}
            stroke={P.grid}
            strokeWidth="1"
          />
        ))}
        {Array.from({length: 15}, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 80}
            x2={1920}
            y2={i * 80}
            stroke={P.grid}
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Particles */}
      <svg
        style={{position: 'absolute', inset: 0, opacity: gridOpacity}}
        width="1920"
        height="1080"
      >
        <defs>
          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y + Math.sin(frame * 0.02 + p.phase) * 6}
            r={p.r}
            fill={P.cyanBright}
            opacity={p.op * fi(frame, [0, 60], [0, 1])}
            filter="url(#particleGlow)"
          />
        ))}
      </svg>

      {/* Corner accent lines */}
      <svg
        style={{position: 'absolute', inset: 0, opacity: fi(frame, [20, 80], [0, 0.4])}}
        width="1920"
        height="1080"
      >
        <line x1="0" y1="0" x2="160" y2="0" stroke={P.cyanBright} strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="120" stroke={P.cyanBright} strokeWidth="1" />
        <line x1="1920" y1="0" x2="1760" y2="0" stroke={P.cyanBright} strokeWidth="1" />
        <line x1="1920" y1="0" x2="1920" y2="120" stroke={P.cyanBright} strokeWidth="1" />
        <line x1="0" y1="1080" x2="160" y2="1080" stroke={P.cyanBright} strokeWidth="1" />
        <line x1="0" y1="1080" x2="0" y2="960" stroke={P.cyanBright} strokeWidth="1" />
        <line x1="1920" y1="1080" x2="1760" y2="1080" stroke={P.cyanBright} strokeWidth="1" />
        <line x1="1920" y1="1080" x2="1920" y2="960" stroke={P.cyanBright} strokeWidth="1" />
      </svg>
    </AbsoluteFill>
  );
};

// ─── Human Body SVG ──────────────────────────────────────────────────────────
const HumanBody: React.FC<{
  opacity: number;
  scale: number;
  x: number;
  glowIntensity: number;
  tiltY: number;
}> = ({opacity, scale, x, glowIntensity, tiltY}) => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame * 0.07) * 0.008;

  return (
    <div
      style={{
        position: 'absolute',
        left: 960 + x - 150,
        top: 540 - 320,
        width: 300,
        height: 640,
        opacity,
        transform: `scale(${scale * breathe}) perspective(1200px) rotateY(${tiltY}deg)`,
        transformOrigin: 'center center',
        filter: `drop-shadow(0 0 ${20 + glowIntensity * 30}px rgba(0,229,255,${0.3 + glowIntensity * 0.5}))`,
      }}
    >
      <svg viewBox="0 0 200 430" width="300" height="640" style={{overflow: 'visible'}}>
        <defs>
          <radialGradient id="bodyGrad" cx="38%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#4FC3F7" />
            <stop offset="45%" stopColor="#1E88E5" />
            <stop offset="100%" stopColor="#0D47A1" />
          </radialGradient>
          <radialGradient id="headGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#4FC3F7" />
            <stop offset="55%" stopColor="#1E88E5" />
            <stop offset="100%" stopColor="#0D47A1" />
          </radialGradient>
          <filter id="bodyGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="skinHighlight" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="rgba(0,229,255,0.35)" />
            <stop offset="100%" stopColor="rgba(0,229,255,0)" />
          </radialGradient>
        </defs>

        {/* Body ambient glow */}
        <ellipse
          cx="100"
          cy="215"
          rx="90"
          ry="210"
          fill={`rgba(0,188,212,${glowIntensity * 0.12})`}
        />

        {/* Head */}
        <ellipse cx="100" cy="34" rx="27" ry="32" fill="url(#headGrad)" filter="url(#bodyGlow)" />
        <ellipse cx="100" cy="34" rx="27" ry="32" fill="none" stroke={P.cyanBright} strokeWidth="0.6" opacity="0.7" />
        {/* Facial landmarks */}
        <ellipse cx="91" cy="28" rx="4" ry="3" fill="none" stroke={P.blueXL} strokeWidth="0.5" opacity="0.5" />
        <ellipse cx="109" cy="28" rx="4" ry="3" fill="none" stroke={P.blueXL} strokeWidth="0.5" opacity="0.5" />
        <path d="M94,40 Q100,45 106,40" fill="none" stroke={P.blueXL} strokeWidth="0.5" opacity="0.5" />

        {/* Neck */}
        <path d="M88,63 L112,63 L110,82 L90,82 Z" fill="url(#bodyGrad)" />

        {/* Clavicle/shoulders */}
        <path
          d="M45,86 Q70,78 100,80 Q130,78 155,86 L152,97 Q126,89 100,91 Q74,89 48,97 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Shoulder joints */}
        <ellipse cx="48" cy="92" rx="12" ry="11" fill="none" stroke={P.cyanL} strokeWidth="0.8" opacity="0.5" />
        <ellipse cx="152" cy="92" rx="12" ry="11" fill="none" stroke={P.cyanL} strokeWidth="0.8" opacity="0.5" />

        {/* Chest/torso upper */}
        <path
          d="M58,90 Q48,115 50,158 Q52,175 58,188 L142,188 Q148,175 150,158 Q152,115 142,90 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.7"
          opacity="0.85"
        />
        {/* Skin highlight on torso */}
        <path
          d="M65,95 Q90,90 135,95 Q140,120 138,155 Q136,175 130,188 L70,188 Q64,175 62,155 Z"
          fill="url(#skinHighlight)"
          opacity={glowIntensity}
        />

        {/* Pectoral lines */}
        <path d="M72,105 Q100,115 128,105" fill="none" stroke={P.blueXL} strokeWidth="1" opacity="0.45" />
        <path d="M72,106 L72,175" fill="none" stroke={P.blueXL} strokeWidth="0.5" opacity="0.3" />
        <path d="M128,106 L128,175" fill="none" stroke={P.blueXL} strokeWidth="0.5" opacity="0.3" />

        {/* Abdominal lines */}
        <path d="M100,115 L100,188" fill="none" stroke={P.blueXL} strokeWidth="0.7" opacity="0.4" />
        <path d="M78,130 L122,130" fill="none" stroke={P.blueXL} strokeWidth="0.5" opacity="0.3" />
        <path d="M77,150 L123,150" fill="none" stroke={P.blueXL} strokeWidth="0.5" opacity="0.3" />
        <path d="M77,170 L123,170" fill="none" stroke={P.blueXL} strokeWidth="0.5" opacity="0.3" />

        {/* Left arm upper */}
        <path
          d="M58,90 Q40,105 37,148 Q35,175 38,200 L54,200 Q52,175 53,148 Q55,110 70,98 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Left elbow */}
        <ellipse cx="43" cy="200" rx="9" ry="7" fill="none" stroke={P.cyanL} strokeWidth="0.7" opacity="0.4" />
        {/* Left forearm */}
        <path
          d="M38,200 Q35,228 36,252 L52,252 Q53,228 54,200 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Left hand */}
        <ellipse cx="44" cy="262" rx="9" ry="13" fill="url(#bodyGrad)" stroke={P.cyanBright} strokeWidth="0.6" opacity="0.8" />

        {/* Right arm upper */}
        <path
          d="M142,90 Q160,105 163,148 Q165,175 162,200 L146,200 Q148,175 147,148 Q145,110 130,98 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Right elbow */}
        <ellipse cx="157" cy="200" rx="9" ry="7" fill="none" stroke={P.cyanL} strokeWidth="0.7" opacity="0.4" />
        {/* Right forearm */}
        <path
          d="M162,200 Q165,228 164,252 L148,252 Q147,228 146,200 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Right hand */}
        <ellipse cx="156" cy="262" rx="9" ry="13" fill="url(#bodyGrad)" stroke={P.cyanBright} strokeWidth="0.6" opacity="0.8" />

        {/* Hips */}
        <path
          d="M58,186 Q52,200 54,215 L146,215 Q148,200 142,186 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />

        {/* Left leg upper */}
        <path
          d="M64,213 Q59,248 60,295 Q61,325 63,355 L81,355 Q81,325 80,295 Q78,248 82,215 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Left knee */}
        <ellipse cx="71" cy="342" rx="11" ry="9" fill="none" stroke={P.cyanL} strokeWidth="0.8" opacity="0.45" />
        {/* Left lower leg */}
        <path
          d="M63,355 Q61,380 62,408 L79,408 Q80,380 81,355 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Left foot */}
        <ellipse cx="67" cy="417" rx="14" ry="7" fill="url(#bodyGrad)" stroke={P.cyanBright} strokeWidth="0.6" opacity="0.8" />

        {/* Right leg upper */}
        <path
          d="M136,213 Q141,248 140,295 Q139,325 137,355 L119,355 Q119,325 120,295 Q122,248 118,215 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Right knee */}
        <ellipse cx="129" cy="342" rx="11" ry="9" fill="none" stroke={P.cyanL} strokeWidth="0.8" opacity="0.45" />
        {/* Right lower leg */}
        <path
          d="M137,355 Q139,380 138,408 L121,408 Q120,380 119,355 Z"
          fill="url(#bodyGrad)"
          stroke={P.cyanBright}
          strokeWidth="0.6"
          opacity="0.8"
        />
        {/* Right foot */}
        <ellipse cx="133" cy="417" rx="14" ry="7" fill="url(#bodyGrad)" stroke={P.cyanBright} strokeWidth="0.6" opacity="0.8" />
      </svg>
    </div>
  );
};

// ─── Skin Cross-Section ──────────────────────────────────────────────────────
const SkinCrossSection: React.FC<{
  progress: number;
  structureProgress: number;
}> = ({progress, structureProgress}) => {
  const frame = useCurrentFrame();

  const panelW = 1600;
  const panelH = 660;
  const panelX = (1920 - panelW) / 2;
  const panelY = (1080 - panelH) / 2;

  const epiH = 88;
  const derH = 288;
  const hypoH = panelH - epiH - derH;

  const epiProgress = fi(progress, [0.15, 0.45], [0, 1]);
  const derProgress = fi(progress, [0.35, 0.65], [0, 1]);
  const hypoProgress = fi(progress, [0.55, 0.85], [0, 1]);

  // Individual structure visibilities driven by structureProgress
  const strP = (start: number, end: number) =>
    fi(structureProgress, [start, end], [0, 1]);

  const follicleP = strP(0.0, 0.18);
  const sebaceousP = strP(0.1, 0.28);
  const sweatP = strP(0.2, 0.38);
  const nervP = strP(0.3, 0.48);
  const bloodP = strP(0.4, 0.58);
  const adiposeP = strP(0.55, 0.78);

  const glowPulse = 1 + Math.sin(frame * 0.08) * 0.2;

  return (
    <div
      style={{
        position: 'absolute',
        left: panelX,
        top: panelY,
        width: panelW,
        height: panelH,
        opacity: progress,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: `0 0 60px rgba(0,229,255,0.15), 0 0 120px rgba(21,101,192,0.2)`,
      }}
    >
      <svg
        width={panelW}
        height={panelH}
        viewBox={`0 0 ${panelW} ${panelH}`}
        style={{display: 'block'}}
      >
        <defs>
          {/* Epidermis gradient */}
          <linearGradient id="epiGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4DD0E1" />
            <stop offset="100%" stopColor="#26A69A" />
          </linearGradient>
          {/* Dermis gradient */}
          <linearGradient id="derGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E88E5" />
            <stop offset="100%" stopColor="#1565C0" />
          </linearGradient>
          {/* Hypo gradient */}
          <linearGradient id="hypoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1565C0" />
            <stop offset="100%" stopColor="#0a1422" />
          </linearGradient>
          {/* Hair follicle gradient */}
          <linearGradient id="follGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1565C0" />
            <stop offset="40%" stopColor="#42A5F5" />
            <stop offset="100%" stopColor="#1565C0" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Blood vessel gradient */}
          <linearGradient id="artGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B71C1C" />
            <stop offset="50%" stopColor="#EF5350" />
            <stop offset="100%" stopColor="#B71C1C" />
          </linearGradient>
          <linearGradient id="veinGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#880E4F" />
            <stop offset="50%" stopColor="#AD1457" />
            <stop offset="100%" stopColor="#880E4F" />
          </linearGradient>
          {/* Adipose cell gradient */}
          <radialGradient id="adipGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF8A65" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#FF7043" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E64A19" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* ── BACKGROUND BASE ── */}
        <rect width={panelW} height={panelH} fill="#050f1e" />

        {/* ── HYPODERMIS ── */}
        <rect
          x={0}
          y={epiH + derH}
          width={panelW}
          height={hypoH}
          fill="url(#hypoGrad)"
          opacity={hypoProgress}
        />
        {/* Collagen strands in hypodermis */}
        {hypoProgress > 0 &&
          [0.12, 0.28, 0.44, 0.6, 0.76, 0.9].map((t, i) => (
            <path
              key={`hypoFib${i}`}
              d={`M${panelW * t - 40},${epiH + derH + 10} Q${panelW * t},${epiH + derH + 40} ${panelW * t + 40},${epiH + derH + 10}`}
              fill="none"
              stroke="rgba(33,150,243,0.15)"
              strokeWidth="1.5"
              opacity={hypoProgress}
            />
          ))}

        {/* Adipose cells */}
        {adiposeP > 0 &&
          [
            {cx: 120, cy: epiH + derH + 65, rx: 58, ry: 52},
            {cx: 270, cy: epiH + derH + 55, rx: 62, ry: 58},
            {cx: 420, cy: epiH + derH + 70, rx: 55, ry: 50},
            {cx: 565, cy: epiH + derH + 58, rx: 60, ry: 56},
            {cx: 710, cy: epiH + derH + 65, rx: 56, ry: 52},
            {cx: 860, cy: epiH + derH + 60, rx: 62, ry: 54},
            {cx: 1010, cy: epiH + derH + 68, rx: 58, ry: 50},
            {cx: 1158, cy: epiH + derH + 58, rx: 60, ry: 56},
            {cx: 1305, cy: epiH + derH + 65, rx: 56, ry: 52},
            {cx: 1455, cy: epiH + derH + 60, rx: 60, ry: 58},
            {cx: 190, cy: epiH + derH + 180, rx: 55, ry: 50},
            {cx: 340, cy: epiH + derH + 175, rx: 62, ry: 55},
            {cx: 495, cy: epiH + derH + 182, rx: 58, ry: 52},
            {cx: 645, cy: epiH + derH + 178, rx: 60, ry: 54},
            {cx: 800, cy: epiH + derH + 180, rx: 56, ry: 50},
            {cx: 955, cy: epiH + derH + 175, rx: 62, ry: 56},
            {cx: 1110, cy: epiH + derH + 182, rx: 58, ry: 52},
            {cx: 1265, cy: epiH + derH + 178, rx: 56, ry: 50},
            {cx: 1410, cy: epiH + derH + 183, rx: 62, ry: 55},
          ].map((c, i) => (
            <g key={`adip${i}`} opacity={adiposeP}>
              <ellipse {...c} fill="url(#adipGrad)" stroke="rgba(255,112,67,0.4)" strokeWidth="1.2" />
              {/* Nucleus */}
              <ellipse
                cx={c.cx + c.rx * 0.2}
                cy={c.cy + c.ry * 0.25}
                rx={c.rx * 0.18}
                ry={c.ry * 0.16}
                fill="rgba(183,28,28,0.7)"
              />
            </g>
          ))}

        {/* Hypo boundary line */}
        <line
          x1={0}
          y1={epiH + derH}
          x2={panelW}
          y2={epiH + derH}
          stroke={P.cyanBright}
          strokeWidth="1.5"
          strokeDasharray="12,6"
          opacity={fi(hypoProgress, [0, 0.3], [0, 0.6])}
        />

        {/* ── DERMIS ── */}
        <rect
          x={0}
          y={epiH}
          width={panelW}
          height={derH}
          fill="url(#derGrad)"
          opacity={derProgress}
        />

        {/* Collagen fibers in dermis */}
        {derProgress > 0 &&
          [1, 2, 3, 4, 5].map((row) =>
            [0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((t, ci) => (
              <path
                key={`col${row}-${ci}`}
                d={`M${panelW * t - 50},${epiH + row * 48} Q${panelW * t},${epiH + row * 48 + 15} ${panelW * t + 50},${epiH + row * 48}`}
                fill="none"
                stroke="rgba(66,165,245,0.18)"
                strokeWidth="1.5"
                opacity={derProgress}
              />
            ))
          )}

        {/* ── HAIR FOLLICLE + HAIR (x=260) ── */}
        {follicleP > 0 && (
          <g opacity={follicleP}>
            {/* Outer follicle sheath */}
            <path
              d="M238,0 L238,360 Q238,380 258,385 Q278,380 278,360 L278,0 Z"
              fill="rgba(13,71,161,0.7)"
              stroke="rgba(66,165,245,0.6)"
              strokeWidth="1.5"
            />
            {/* Inner root sheath */}
            <path
              d="M248,0 L248,340 Q248,358 258,362 Q268,358 268,340 L268,0 Z"
              fill="rgba(21,101,192,0.8)"
              stroke="rgba(100,181,246,0.5)"
              strokeWidth="1"
            />
            {/* Hair shaft */}
            <path
              d="M253,-30 L253,335 Q253,360 258,365 Q263,360 263,335 L263,-30 Z"
              fill="rgba(30,136,229,0.9)"
              stroke={P.cyanBright}
              strokeWidth="1.5"
              filter="url(#softGlow)"
            />
            {/* Hair bulb */}
            <ellipse
              cx={258}
              cy={375}
              rx={25}
              ry={22}
              fill="rgba(21,101,192,0.9)"
              stroke="rgba(66,165,245,0.8)"
              strokeWidth="1.5"
              filter="url(#softGlow)"
            />
            {/* Dermal papilla */}
            <ellipse
              cx={258}
              cy={384}
              rx={12}
              ry={10}
              fill="rgba(0,229,255,0.5)"
              stroke={P.cyanBright}
              strokeWidth="1"
            />
            {/* Matrix cells */}
            {[-10, -4, 2, 8, 14].map((dx, mi) => (
              <circle
                key={`mat${mi}`}
                cx={258 + dx}
                cy={374 + Math.abs(dx) * 0.4}
                r={3.5}
                fill="rgba(66,165,245,0.6)"
              />
            ))}
          </g>
        )}

        {/* ── SEBACEOUS GLAND (x=285-360) ── */}
        {sebaceousP > 0 && (
          <g opacity={sebaceousP}>
            {/* Main acinus clusters */}
            {[
              {cx: 310, cy: epiH + 90, rx: 28, ry: 24},
              {cx: 340, cy: epiH + 88, rx: 24, ry: 20},
              {cx: 320, cy: epiH + 130, rx: 30, ry: 22},
              {cx: 348, cy: epiH + 128, rx: 22, ry: 19},
              {cx: 308, cy: epiH + 165, rx: 22, ry: 18},
            ].map((cell, i) => (
              <g key={`seb${i}`}>
                <ellipse {...cell} fill={`rgba(255,167,38,0.75)`} stroke="rgba(255,152,0,0.7)" strokeWidth="1.2" />
                {/* Sebum-filled interior */}
                <ellipse
                  cx={cell.cx}
                  cy={cell.cy}
                  rx={cell.rx * 0.65}
                  ry={cell.ry * 0.65}
                  fill="rgba(255,193,7,0.5)"
                />
              </g>
            ))}
            {/* Duct to follicle */}
            <path
              d="M295,200 Q282,195 278,175"
              fill="none"
              stroke="rgba(255,167,38,0.8)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ── SWEAT GLAND (x=580-720) ── */}
        {sweatP > 0 && (
          <g opacity={sweatP}>
            {/* Eccrine duct (straight portion) */}
            <path
              d="M620,0 L620,285"
              fill="none"
              stroke={P.cyanL}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M620,0 L620,285"
              fill="none"
              stroke={P.cyanBright}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Coiled secretory portion */}
            {[
              'M580,290 Q590,305 620,300 Q650,295 660,310',
              'M660,310 Q670,325 640,330 Q610,335 600,350',
              'M600,350 Q595,365 620,368 Q645,371 655,385',
              'M655,385 Q665,398 640,400 Q615,402 610,415',
              'M610,415 Q605,428 628,430 Q651,432 660,445',
            ].map((d, i) => (
              <g key={`sw${i}`}>
                <path d={d} fill="none" stroke={P.cyanL} strokeWidth="8" strokeLinecap="round" />
                <path d={d} fill="none" stroke={P.cyanBright} strokeWidth="2.5" strokeLinecap="round" />
              </g>
            ))}
            {/* Pore indicator at surface */}
            <circle cx={620} cy={4} r={5} fill={P.cyanBright} filter="url(#softGlow)" />
          </g>
        )}

        {/* ── NERVE ENDINGS (x=440-560) ── */}
        {nervP > 0 && (
          <g opacity={nervP}>
            {/* Main nerve bundle */}
            <path
              d="M490,460 L490,200"
              fill="none"
              stroke={P.neural}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M490,460 L490,200"
              fill="none"
              stroke="rgba(255,213,79,0.4)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Branches */}
            <path d="M490,200 Q470,175 452,158" fill="none" stroke={P.neural} strokeWidth="3" strokeLinecap="round" />
            <path d="M490,200 Q510,172 528,155" fill="none" stroke={P.neural} strokeWidth="3" strokeLinecap="round" />
            <path d="M490,240 Q468,225 450,215" fill="none" stroke={P.neural} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M490,240 Q512,222 530,210" fill="none" stroke={P.neural} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M490,290 Q472,280 456,272" fill="none" stroke={P.neural} strokeWidth="2" strokeLinecap="round" />
            <path d="M490,290 Q508,278 524,270" fill="none" stroke={P.neural} strokeWidth="2" strokeLinecap="round" />
            {/* Meissner's corpuscle */}
            <ellipse
              cx={490}
              cy={epiH + 5}
              rx={14}
              ry={20}
              fill="rgba(255,213,79,0.3)"
              stroke={P.neural}
              strokeWidth="1.5"
              filter="url(#softGlow)"
            />
            {/* Corpuscle internal coil */}
            {[0, 1, 2, 3].map((i) => (
              <path
                key={`corp${i}`}
                d={`M${478},${epiH + i * 9 + 2} Q${490},${epiH + i * 9 - 3} ${502},${epiH + i * 9 + 2}`}
                fill="none"
                stroke={P.neural}
                strokeWidth="1"
                opacity="0.7"
              />
            ))}
            {/* Free nerve endings near epidermis */}
            {[460, 478, 498, 516].map((x, i) => (
              <path
                key={`free${i}`}
                d={`M${x},${epiH + 18} L${x},${epiH + 40}`}
                fill="none"
                stroke={P.neural}
                strokeWidth="1.2"
                opacity="0.55"
              />
            ))}
          </g>
        )}

        {/* ── BLOOD VESSELS (x=800-1000) ── */}
        {bloodP > 0 && (
          <g opacity={bloodP}>
            {/* Arteriole */}
            <path
              d="M840,480 L840,140"
              fill="none"
              stroke="#B71C1C"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M840,480 L840,140"
              fill="none"
              stroke="#EF5350"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M840,480 L840,140"
              fill="none"
              stroke="rgba(255,100,100,0.3)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Venule */}
            <path
              d="M905,480 L905,140"
              fill="none"
              stroke="#880E4F"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M905,480 L905,140"
              fill="none"
              stroke="#AD1457"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Capillary loops */}
            <path
              d="M840,160 Q870,120 905,160"
              fill="none"
              stroke="#EF5350"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M840,200 Q862,175 905,200"
              fill="none"
              stroke="#E53935"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M840,250 Q872,228 905,250"
              fill="none"
              stroke="#E53935"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M840,310 Q872,288 905,310"
              fill="none"
              stroke="#E53935"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Red blood cells */}
            {[170, 220, 270, 320, 380].map((y, i) => (
              <ellipse
                key={`rbc${i}`}
                cx={844 + (i % 2) * 2}
                cy={y}
                rx={4}
                ry={3}
                fill="#FF5252"
                opacity="0.8"
              />
            ))}
            {/* Vessel labels - just glows, no text */}
            <circle cx={840} cy={480} r={8} fill={P.blood} filter="url(#softGlow)" opacity={bloodP * glowPulse * 0.6} />
            <circle cx={905} cy={480} r={7} fill="#AD1457" filter="url(#softGlow)" opacity={bloodP * glowPulse * 0.6} />
          </g>
        )}

        {/* ── ADDITIONAL HAIR FOLLICLE (right side, partial, x=1150) ── */}
        {follicleP > 0.4 && (
          <g opacity={fi(follicleP, [0.4, 1.0], [0, 0.7])}>
            <path
              d="M1135,0 L1135,300 Q1135,320 1150,325 Q1165,320 1165,300 L1165,0 Z"
              fill="rgba(13,71,161,0.6)"
              stroke="rgba(66,165,245,0.5)"
              strokeWidth="1.5"
            />
            <path
              d="M1144,0 L1144,295 Q1144,318 1150,322 Q1156,318 1156,295 L1156,0 Z"
              fill="rgba(30,136,229,0.8)"
              stroke={P.cyanBright}
              strokeWidth="1.2"
            />
            <ellipse cx={1150} cy={330} rx={20} ry={18} fill="rgba(21,101,192,0.9)" stroke="rgba(66,165,245,0.7)" strokeWidth="1.5" />
            <ellipse cx={1150} cy={338} rx={10} ry={8} fill="rgba(0,229,255,0.4)" />
          </g>
        )}

        {/* ── DERMIS ── (rendered after structures, semi-transparent overlay for depth) */}
        {derProgress > 0 && (
          <rect
            x={0}
            y={epiH}
            width={panelW}
            height={derH}
            fill="transparent"
            stroke="rgba(30,136,229,0.2)"
            strokeWidth="1"
          />
        )}

        {/* ── EPIDERMIS ── */}
        <rect
          x={0}
          y={0}
          width={panelW}
          height={epiH}
          fill="url(#epiGrad)"
          opacity={epiProgress}
        />

        {/* Epidermis cell layer texture */}
        {epiProgress > 0 &&
          [0, 1, 2].map((row) =>
            Array.from({length: 30}, (_, ci) => (
              <ellipse
                key={`epi${row}-${ci}`}
                cx={ci * 54 + 27 + (row % 2) * 27}
                cy={row === 0 ? 12 : row === 1 ? 40 : 68}
                rx={row === 0 ? 22 : 20}
                ry={row === 0 ? 9 : 13}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.8"
                opacity={epiProgress}
              />
            ))
          )}

        {/* Surface wavy line */}
        <path
          d={`M0,3 ${Array.from({length: 40}, (_, i) => `Q${i * 40 + 20},${i % 2 === 0 ? -4 : 8} ${(i + 1) * 40},3`).join(' ')}`}
          fill="none"
          stroke={P.cyanBright}
          strokeWidth="2"
          opacity={epiProgress * 0.8}
          filter="url(#softGlow)"
        />

        {/* Epi/derm boundary */}
        <line
          x1={0}
          y1={epiH}
          x2={panelW}
          y2={epiH}
          stroke={P.cyanBright}
          strokeWidth="1.5"
          strokeDasharray="10,5"
          opacity={fi(epiProgress, [0.5, 1], [0, 0.7])}
        />

        {/* ── LAYER GLOW INDICATORS (subtle colored borders) ── */}
        {/* Epidermis side bar */}
        <rect
          x={8}
          y={4}
          width={6}
          height={epiH - 8}
          rx={3}
          fill={P.cyanBright}
          opacity={epiProgress * 0.7 * glowPulse * 0.6}
          filter="url(#softGlow)"
        />
        {/* Dermis side bar */}
        <rect
          x={8}
          y={epiH + 4}
          width={6}
          height={derH - 8}
          rx={3}
          fill={P.blueL}
          opacity={derProgress * 0.6 * glowPulse * 0.5}
          filter="url(#softGlow)"
        />
        {/* Hypodermis side bar */}
        <rect
          x={8}
          y={epiH + derH + 4}
          width={6}
          height={hypoH - 8}
          rx={3}
          fill={P.adipose}
          opacity={hypoProgress * 0.5 * glowPulse * 0.4}
          filter="url(#softGlow)"
        />

        {/* Panel border */}
        <rect
          x={1}
          y={1}
          width={panelW - 2}
          height={panelH - 2}
          rx={14}
          fill="none"
          stroke={`rgba(0,229,255,${0.35 * progress})`}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

// ─── Floating Structure Card ─────────────────────────────────────────────────
type StructureType =
  | 'follicle'
  | 'sweat'
  | 'sebaceous'
  | 'nerve'
  | 'blood'
  | 'nail'
  | 'adipose';

const STRUCTURE_SVG: Record<StructureType, React.ReactNode> = {
  follicle: (
    <svg viewBox="0 0 120 160" width="110" height="147">
      <defs>
        <linearGradient id="fsg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="50%" stopColor="#42A5F5" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
      </defs>
      {/* Outer sheath */}
      <path d="M44,0 L44,120 Q44,138 60,142 Q76,138 76,120 L76,0 Z" fill="rgba(13,71,161,0.8)" stroke="rgba(66,165,245,0.7)" strokeWidth="1.5" />
      {/* Inner sheath */}
      <path d="M52,0 L52,115 Q52,132 60,136 Q68,132 68,115 L68,0 Z" fill="rgba(21,101,192,0.9)" stroke="rgba(100,181,246,0.6)" strokeWidth="1" />
      {/* Hair shaft */}
      <path d="M57,0 L57,118 Q57,140 60,144 Q63,140 63,118 L63,0 Z" fill="#42A5F5" stroke="#00E5FF" strokeWidth="1.5" />
      {/* Bulb */}
      <ellipse cx={60} cy={148} rx={20} ry={16} fill="rgba(21,101,192,0.95)" stroke="#42A5F5" strokeWidth="1.5" />
      {/* Papilla */}
      <ellipse cx={60} cy={155} rx={10} ry={8} fill="rgba(0,229,255,0.55)" stroke="#00E5FF" strokeWidth="1" />
    </svg>
  ),
  sweat: (
    <svg viewBox="0 0 120 160" width="110" height="147">
      {/* Duct */}
      <path d="M58,0 L58,90" fill="none" stroke="#4DD0E1" strokeWidth="7" strokeLinecap="round" />
      <path d="M58,0 L58,90" fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />
      {/* Coil */}
      {[
        'M36,96 Q44,110 58,106 Q72,102 78,116',
        'M78,116 Q84,130 66,134 Q48,138 44,152',
        'M44,152 Q42,160 58,161 Q74,162 80,155',
      ].map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#26C6DA" strokeWidth="9" strokeLinecap="round" />
          <path d={d} fill="none" stroke="#00E5FF" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
      {/* Pore */}
      <circle cx={58} cy={4} r={5} fill="#00E5FF" />
    </svg>
  ),
  sebaceous: (
    <svg viewBox="0 0 120 160" width="110" height="147">
      {[
        {cx: 58, cy: 40, rx: 30, ry: 26},
        {cx: 86, cy: 44, rx: 24, ry: 22},
        {cx: 60, cy: 84, rx: 28, ry: 24},
        {cx: 86, cy: 86, rx: 22, ry: 20},
        {cx: 52, cy: 122, rx: 22, ry: 20},
      ].map((c, i) => (
        <g key={i}>
          <ellipse {...c} fill="rgba(255,167,38,0.8)" stroke="rgba(255,152,0,0.8)" strokeWidth="1.5" />
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx * 0.6} ry={c.ry * 0.6} fill="rgba(255,193,7,0.5)" />
        </g>
      ))}
      {/* Duct */}
      <path d="M43,135 Q36,148 30,155" fill="none" stroke="rgba(255,167,38,0.9)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  ),
  nerve: (
    <svg viewBox="0 0 120 160" width="110" height="147">
      {/* Myelin sheath (main trunk) */}
      <path d="M60,160 L60,60" fill="none" stroke="#FFD54F" strokeWidth="6" strokeLinecap="round" />
      <path d="M60,160 L60,60" fill="none" stroke="rgba(255,213,79,0.35)" strokeWidth="12" strokeLinecap="round" />
      {/* Branches */}
      {[
        'M60,60 Q44,42 32,28',
        'M60,60 Q76,42 88,28',
        'M60,95 Q46,82 35,72',
        'M60,95 Q74,80 85,70',
        'M60,120 Q48,110 40,103',
        'M60,120 Q72,108 80,101',
      ].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#FFD54F" strokeWidth={i < 2 ? 3 : 2.5} strokeLinecap="round" />
      ))}
      {/* Corpuscle */}
      <ellipse cx={60} cy={28} rx={14} ry={20} fill="rgba(255,213,79,0.25)" stroke="#FFD54F" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M47,${16 + i * 9} Q60,${12 + i * 9} 73,${16 + i * 9}`} fill="none" stroke="#FFD54F" strokeWidth="1" opacity="0.7" />
      ))}
    </svg>
  ),
  blood: (
    <svg viewBox="0 0 120 160" width="110" height="147">
      {/* Arteriole (left) */}
      <path d="M42,160 L42,10" fill="none" stroke="#B71C1C" strokeWidth="14" strokeLinecap="round" />
      <path d="M42,160 L42,10" fill="none" stroke="#EF5350" strokeWidth="7" strokeLinecap="round" />
      {/* Venule (right) */}
      <path d="M78,160 L78,10" fill="none" stroke="#880E4F" strokeWidth="12" strokeLinecap="round" />
      <path d="M78,160 L78,10" fill="none" stroke="#AD1457" strokeWidth="5" strokeLinecap="round" />
      {/* Capillary loops */}
      {[20, 55, 90, 125].map((y, i) => (
        <path key={i} d={`M42,${y} Q60,${y - 18} 78,${y}`} fill="none" stroke="#EF5350" strokeWidth="3" strokeLinecap="round" />
      ))}
      {/* RBC */}
      {[40, 80, 120].map((y, i) => (
        <ellipse key={i} cx={44} cy={y} rx={4} ry={3} fill="#FF5252" opacity="0.9" />
      ))}
    </svg>
  ),
  nail: (
    <svg viewBox="0 0 160 120" width="147" height="110">
      <defs>
        <linearGradient id="nailG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B3E5FC" />
          <stop offset="60%" stopColor="#81D4FA" />
          <stop offset="100%" stopColor="#4FC3F7" />
        </linearGradient>
      </defs>
      {/* Nail bed */}
      <path d="M20,70 Q80,62 140,70 L140,100 Q80,108 20,100 Z" fill="rgba(21,101,192,0.6)" stroke="rgba(66,165,245,0.5)" strokeWidth="1.5" />
      {/* Nail plate */}
      <path d="M20,30 Q80,18 140,30 L140,75 Q80,67 20,75 Z" fill="url(#nailG)" stroke="#00E5FF" strokeWidth="1.5" />
      {/* Lunula */}
      <path d="M22,65 Q55,45 88,65" fill="rgba(255,255,255,0.45)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* Cuticle */}
      <path d="M18,32 Q80,16 142,32 L140,28 Q80,12 20,28 Z" fill="rgba(30,136,229,0.5)" stroke="rgba(66,165,245,0.6)" strokeWidth="1" />
      {/* Highlight */}
      <path d="M30,36 Q80,26 130,36 L130,50 Q80,42 30,50 Z" fill="rgba(255,255,255,0.15)" />
      {/* Nail groove */}
      <path d="M20,30 L20,75" fill="none" stroke="rgba(66,165,245,0.4)" strokeWidth="1.5" />
      <path d="M140,30 L140,75" fill="none" stroke="rgba(66,165,245,0.4)" strokeWidth="1.5" />
    </svg>
  ),
  adipose: (
    <svg viewBox="0 0 160 160" width="147" height="147">
      <defs>
        <radialGradient id="ag" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FF8A65" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#FF7043" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#E64A19" stopOpacity="0.3" />
        </radialGradient>
      </defs>
      {[
        {cx: 45, cy: 45, rx: 40, ry: 38},
        {cx: 115, cy: 42, rx: 36, ry: 34},
        {cx: 48, cy: 118, rx: 38, ry: 36},
        {cx: 120, cy: 120, rx: 34, ry: 32},
        {cx: 80, cy: 80, rx: 30, ry: 28},
      ].map((c, i) => (
        <g key={i}>
          <ellipse {...c} fill="url(#ag)" stroke="rgba(255,112,67,0.5)" strokeWidth="1.5" />
          {/* Lipid droplet (main) */}
          <ellipse cx={c.cx - 3} cy={c.cy - 3} rx={c.rx * 0.7} ry={c.ry * 0.7} fill="rgba(255,204,188,0.4)" />
          {/* Nucleus */}
          <ellipse cx={c.cx + c.rx * 0.4} cy={c.cy + c.ry * 0.35} rx={c.rx * 0.15} ry={c.ry * 0.14} fill="rgba(183,28,28,0.75)" />
        </g>
      ))}
    </svg>
  ),
};

const STRUCTURE_POSITIONS: Record<StructureType, {left: number; top: number}> = {
  follicle:  {left: 120,  top: 180},
  sebaceous: {left: 355,  top: 140},
  sweat:     {left: 590,  top: 180},
  nerve:     {left: 825,  top: 140},
  blood:     {left: 1060, top: 180},
  nail:      {left: 1280, top: 210},
  adipose:   {left: 1500, top: 170},
};

const STRUCTURE_COLORS: Record<StructureType, string> = {
  follicle:  P.blueL,
  sebaceous: P.sebaceous,
  sweat:     P.cyanL,
  nerve:     P.neural,
  blood:     P.blood,
  nail:      P.nail,
  adipose:   P.adipose,
};

const FloatingStructure: React.FC<{
  type: StructureType;
  startFrame: number;
}> = ({type, startFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const scale = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    from: 0,
    to: 1,
    config: {damping: 70, stiffness: 180, mass: 0.6},
  });
  const opacity = fi(frame, [startFrame, startFrame + 20], [0, 1]);
  const floatY = Math.sin((frame - startFrame) * 0.06 + Math.PI * 0.3) * 10;
  const glowPulse = 0.4 + Math.sin((frame - startFrame) * 0.1) * 0.2;

  const pos = STRUCTURE_POSITIONS[type];
  const color = STRUCTURE_COLORS[type];
  const isWide = type === 'nail' || type === 'adipose';

  return (
    <div
      style={{
        position: 'absolute',
        left: pos.left,
        top: pos.top + floatY,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Card */}
      <div
        style={{
          background: `linear-gradient(145deg, rgba(10,22,40,0.95), rgba(5,15,30,0.9))`,
          border: `1.5px solid ${color}55`,
          borderRadius: 16,
          padding: '18px 16px',
          boxShadow: `0 0 ${24 + glowPulse * 20}px ${color}${Math.round(glowPulse * 80).toString(16).padStart(2, '0')}, inset 0 0 20px rgba(0,0,0,0.5)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isWide ? 190 : 160,
          height: isWide ? 165 : 190,
        }}
      >
        {STRUCTURE_SVG[type]}
      </div>
    </div>
  );
};

// ─── Main Composition ────────────────────────────────────────────────────────
export const IntegumentarySystem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // ── Body scene (frames 40-300) ──
  const bodyScale = spring({
    frame: Math.max(0, frame - 40),
    fps,
    from: 0.3,
    to: 1,
    config: {damping: 80, stiffness: 150, mass: 0.8},
  });
  const bodyOpacity = fi(frame, [40, 90], [0, 1]);
  const bodyFadeOut = fi(frame, [240, 310], [1, 0]);

  // Orbit simulation: subtle Y-axis tilt oscillation
  const tiltY = interpolate(
    Math.sin(frame * 0.025),
    [-1, 1],
    [-6, 6]
  );
  const bodyX = Math.sin(frame * 0.02) * 12;

  // Skin glow highlight on body (peaks around frame 180-240)
  const skinGlow = fi(frame, [150, 230], [0, 1]) * fi(frame, [230, 300], [1, 0]);

  // ── Cross-section (frames 260-560) ──
  const crossProgress = fi(frame, [260, 360], [0, 1]);
  const structureProgress = fi(frame, [370, 550], [0, 1]);
  const crossFade = fi(frame, [540, 590], [1, 0]);

  // ── Structure cards (frames 380-560) ──
  const structures: {type: StructureType; start: number}[] = [
    {type: 'follicle',  start: 380},
    {type: 'sebaceous', start: 404},
    {type: 'sweat',     start: 426},
    {type: 'nerve',     start: 448},
    {type: 'blood',     start: 470},
    {type: 'nail',      start: 490},
    {type: 'adipose',   start: 510},
  ];
  const cardsOpacity = fi(frame, [540, 585], [1, 0]);

  // ── Final fade ──
  const finalFade = fi(frame, [570, 600], [1, 0]);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* Background always visible */}
      <Background />

      {/* ── Human body (scenes 1-2) ── */}
      {frame < 315 && (
        <HumanBody
          opacity={bodyOpacity * bodyFadeOut}
          scale={bodyScale}
          x={bodyX}
          glowIntensity={skinGlow}
          tiltY={tiltY}
        />
      )}

      {/* ── Skin cross-section (scene 3) ── */}
      {frame > 255 && frame < 595 && (
        <div style={{opacity: crossFade}}>
          <SkinCrossSection
            progress={crossProgress}
            structureProgress={structureProgress}
          />
        </div>
      )}

      {/* ── Floating structures (scene 4) ── */}
      {frame > 375 && frame < 595 && (
        <div style={{opacity: cardsOpacity}}>
          {structures.map((s) => (
            <FloatingStructure key={s.type} type={s.type} startFrame={s.start} />
          ))}
        </div>
      )}

      {/* ── Final fade overlay ── */}
      <AbsoluteFill
        style={{
          background: P.bg,
          opacity: 1 - finalFade,
          pointerEvents: 'none',
        }}
      />

      {/* ── Opening fade-in (from black) ── */}
      <AbsoluteFill
        style={{
          background: '#000000',
          opacity: fi(frame, [0, 25], [1, 0]),
          pointerEvents: 'none',
        }}
      />

      {/*
        AUDIO - Uncomment after adding public/voiceover.mp3
        Text: "Além de proteger o corpo, o sistema tegumentar é formado por
        estruturas que atuam de forma integrada. A epiderme reveste, a derme
        sustenta e abriga vasos, nervos e glândulas, enquanto a hipoderme
        contribui para proteção, reserva de energia e isolamento térmico.
        Pelos, unhas e glândulas completam esse sistema essencial para o
        equilíbrio do organismo."
      */}
      {/* <Audio src={staticFile('voiceover.mp3')} /> */}
    </AbsoluteFill>
  );
};
