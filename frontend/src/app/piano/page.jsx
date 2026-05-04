"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicParticles from "@/components/MusicParticles";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });

// ── Music data ────────────────────────────────────────────────────────────────
const ALL_NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const FREQS = {
  'C4':261.63,'C#4':277.18,'D4':293.66,'D#4':311.13,'E4':329.63,
  'F4':349.23,'F#4':369.99,'G4':392.00,'G#4':415.30,'A4':440.00,
  'A#4':466.16,'B4':493.88,'C5':523.25,'C#5':554.37,'D5':587.33,
  'D#5':622.25,'E5':659.25,'F5':698.46,'F#5':739.99,'G5':783.99,
  'G#5':830.61,'A5':880.00,'A#5':932.33,'B5':987.77,'C6':1046.50
};

const SCALES = {
  'Major':           { intervals:[0,2,4,5,7,9,11],  desc:'Happy & bright — the most common scale in Western music.' },
  'Natural Minor':   { intervals:[0,2,3,5,7,8,10],  desc:'Sad & emotional — used in countless ballads and classical pieces.' },
  'Pentatonic Major':{ intervals:[0,2,4,7,9],        desc:'5-note scale loved in folk, country, and pop.' },
  'Pentatonic Minor':{ intervals:[0,3,5,7,10],       desc:'The go-to scale for blues & rock guitar solos.' },
  'Blues':           { intervals:[0,3,5,6,7,10],     desc:'Pentatonic Minor + the ♭5 "blue note" — pure soul.' },
  'Dorian':          { intervals:[0,2,3,5,7,9,10],   desc:'Minor with a raised 6th — jazzy and funky.' },
  'Mixolydian':      { intervals:[0,2,4,5,7,9,10],   desc:'Major with a ♭7 — used in rock and Celtic music.' },
  'Harmonic Minor':  { intervals:[0,2,3,5,7,8,11],   desc:'Exotic raised 7th — heard in classical and metal.' },
};

const CHORDS = {
  'Major':       { intervals:[0,4,7],     desc:'Bright and happy. The foundation of most pop songs.' },
  'Minor':       { intervals:[0,3,7],     desc:'Dark and melancholic. Universally expressive.' },
  'Dom 7th':     { intervals:[0,4,7,10],  desc:'Dominant tension that yearns to resolve — jazz staple.' },
  'Major 7th':   { intervals:[0,4,7,11],  desc:'Dreamy and lush — the sound of jazz and bossa nova.' },
  'Minor 7th':   { intervals:[0,3,7,10],  desc:'Smooth and soulful — R&B and jazz favourite.' },
  'Diminished':  { intervals:[0,3,6],     desc:'Tense and unstable — creates dramatic tension.' },
  'Augmented':   { intervals:[0,4,8],     desc:'Mysterious and unsettling — used for suspense.' },
  'Sus2':        { intervals:[0,2,7],     desc:'Open and airy — no third, leaves a sense of space.' },
  'Sus4':        { intervals:[0,5,7],     desc:'Unresolved tension — wants to move to Major.' },
  'Power':       { intervals:[0,7],       desc:'Root + 5th only — the backbone of rock guitar.' },
};

const ROOTS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const WHITE_KEYS = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5','C6'];
const BLACK_KEYS = [
  {note:'C#4',offset:0.63},{note:'D#4',offset:1.63},
  {note:'F#4',offset:3.63},{note:'G#4',offset:4.63},{note:'A#4',offset:5.63},
  {note:'C#5',offset:7.63},{note:'D#5',offset:8.63},
  {note:'F#5',offset:10.63},{note:'G#5',offset:11.63},{note:'A#5',offset:12.63},
];

const KEY_MAP = {
  'a':'C4','w':'C#4','s':'D4','e':'D#4','d':'E4','f':'F4',
  't':'F#4','g':'G4','y':'G#4','h':'A4','u':'A#4','j':'B4','k':'C5',
};

function noteBase(n) { return n.replace(/\d/,''); }

function getHighlightSet(root, intervals) {
  const rootIdx = ALL_NOTES.indexOf(root);
  if (rootIdx === -1) return new Set();
  const s = new Set();
  [...WHITE_KEYS, ...BLACK_KEYS.map(b=>b.note)].forEach(note => {
    const diff = (ALL_NOTES.indexOf(noteBase(note)) - rootIdx + 12) % 12;
    if (intervals.includes(diff)) s.add(note);
  });
  return s;
}

// ── Audio ─────────────────────────────────────────────────────────────────────
function playNote(audioCtxRef, note, volume = 0.6) {
  const freq = FREQS[note];
  if (!freq) return;
  if (!audioCtxRef.current) {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  const ctx = audioCtxRef.current;
  if (ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const g2 = ctx.createGain();

  osc1.type = 'triangle'; osc1.frequency.value = freq;
  osc2.type = 'sine';     osc2.frequency.value = freq * 2;
  g2.gain.value = 0.15;

  osc1.connect(gain); osc2.connect(g2); g2.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(volume * 0.4, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

  osc1.start(now); osc2.start(now);
  osc1.stop(now + 1.6); osc2.stop(now + 1.6);
}

// ── Component ─────────────────────────────────────────────────────────────────
const WK_W = 42, WK_H = 150, BK_W = 26, BK_H = 95;

export default function PianoPage() {
  const audioCtxRef = useRef(null);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [root, setRoot] = useState('C');
  const [mode, setMode] = useState('scale'); // 'scale' | 'chord'
  const [scaleName, setScaleName] = useState('Major');
  const [chordName, setChordName] = useState('Major');
  const [showLabels, setShowLabels] = useState(true);
  const [bpm, setBpm] = useState(80);
  const [metroOn, setMetroOn] = useState(false);
  const [beat, setBeat] = useState(0);
  const metroRef = useRef(null);

  const currentIntervals = mode === 'scale' ? SCALES[scaleName].intervals : CHORDS[chordName].intervals;
  const currentDesc = mode === 'scale' ? SCALES[scaleName].desc : CHORDS[chordName].desc;
  const highlighted = getHighlightSet(root, currentIntervals);

  // Flash a key briefly
  const flashKey = useCallback((note) => {
    setActiveKeys(prev => new Set([...prev, note]));
    setTimeout(() => setActiveKeys(prev => { const s = new Set(prev); s.delete(note); return s; }), 200);
  }, []);

  const handlePlay = useCallback((note) => {
    playNote(audioCtxRef, note);
    flashKey(note);
  }, [flashKey]);

  // Keyboard listener
  useEffect(() => {
    const down = (e) => { if (e.repeat) return; const note = KEY_MAP[e.key]; if (note) handlePlay(note); };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [handlePlay]);

  // Arpeggio
  const playArpeggio = () => {
    const notes = [...WHITE_KEYS, ...BLACK_KEYS.map(b=>b.note)].filter(n => highlighted.has(n))
      .sort((a,b) => Object.keys(FREQS).indexOf(a) - Object.keys(FREQS).indexOf(b));
    notes.forEach((note, i) => setTimeout(() => { playNote(audioCtxRef, note); flashKey(note); }, i * (60000 / bpm / 2)));
  };

  // Play chord simultaneously
  const playChord = () => {
    [...highlighted].forEach(note => { playNote(audioCtxRef, note, 0.4); flashKey(note); });
  };

  // Metronome
  useEffect(() => {
    if (metroOn) {
      const interval = 60000 / bpm;
      let b = 0;
      const tick = () => {
        setBeat(b % 4);
        // Metronome click sound
        if (audioCtxRef.current) {
          const ctx = audioCtxRef.current;
          if (ctx.state === 'suspended') ctx.resume();
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g); g.connect(ctx.destination);
          osc.frequency.value = b % 4 === 0 ? 1000 : 700;
          g.gain.setValueAtTime(0.3, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.06);
        } else {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        b++;
      };
      tick();
      metroRef.current = setInterval(tick, interval);
    } else {
      clearInterval(metroRef.current);
      setBeat(0);
    }
    return () => clearInterval(metroRef.current);
  }, [metroOn, bpm]);

  const totalWidth = WHITE_KEYS.length * WK_W;

  const selStyle = { padding:'8px 14px', borderRadius:'10px', border:'1px solid rgba(139,92,246,0.25)', background:'rgba(10,10,30,0.8)', color:'#e0e0ff', fontSize:'13px', fontFamily:"'Inter',sans-serif", cursor:'pointer', outline:'none' };

  return (
    <>
      <Scene3D />
      <MusicParticles />
      <Navbar />
      <main style={{ position:'relative', zIndex:5, minHeight:'100vh', paddingTop:'100px', paddingBottom:'60px' }}>
        <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'0 24px' }}>

          {/* Header */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{textAlign:'center',marginBottom:'40px'}}>
            <span style={{fontSize:'12px',fontWeight:600,color:'#06d6a0',textTransform:'uppercase',letterSpacing:'0.12em'}}>Interactive</span>
            <h1 style={{fontSize:'clamp(28px,5vw,52px)',fontWeight:900,fontFamily:"'Outfit',sans-serif",letterSpacing:'-0.04em',marginTop:'8px'}}>
              🎹 Piano <span className="gradient-text">Explorer</span>
            </h1>
            <p style={{color:'var(--text-secondary)',marginTop:'10px',fontSize:'16px'}}>
              Click keys · Use keyboard (A–K) · Explore scales & chords
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
            className="glass-card" style={{padding:'24px',marginBottom:'28px'}}>
            <div style={{display:'flex',flexWrap:'wrap',gap:'16px',alignItems:'flex-end'}}>

              {/* Root */}
              <div>
                <label style={{fontSize:'11px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:'6px'}}>Root Note</label>
                <select value={root} onChange={e=>setRoot(e.target.value)} style={selStyle}>
                  {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Mode toggle */}
              <div>
                <label style={{fontSize:'11px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:'6px'}}>Mode</label>
                <div style={{display:'flex',gap:'4px'}}>
                  {['scale','chord'].map(m => (
                    <button key={m} onClick={()=>setMode(m)}
                      style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid rgba(139,92,246,0.25)',background:mode===m?'rgba(139,92,246,0.25)':'rgba(10,10,30,0.6)',color:mode===m?'#c084fc':'var(--text-muted)',fontSize:'13px',fontWeight:600,cursor:'pointer',textTransform:'capitalize',transition:'all 0.2s'}}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scale or Chord selector */}
              {mode === 'scale' ? (
                <div>
                  <label style={{fontSize:'11px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:'6px'}}>Scale</label>
                  <select value={scaleName} onChange={e=>setScaleName(e.target.value)} style={selStyle}>
                    {Object.keys(SCALES).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{fontSize:'11px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:'6px'}}>Chord</label>
                  <select value={chordName} onChange={e=>setChordName(e.target.value)} style={selStyle}>
                    {Object.keys(CHORDS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Action buttons */}
              <div style={{display:'flex',gap:'8px'}}>
                <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.96}} onClick={playArpeggio}
                  style={{padding:'9px 18px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontSize:'13px',fontWeight:600,cursor:'pointer',boxShadow:'0 4px 14px rgba(139,92,246,0.3)'}}>
                  ▶ Arpeggio
                </motion.button>
                {mode === 'chord' && (
                  <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:0.96}} onClick={playChord}
                    style={{padding:'9px 18px',borderRadius:'10px',border:'none',background:'linear-gradient(135deg,#06d6a0,#059669)',color:'#fff',fontSize:'13px',fontWeight:600,cursor:'pointer',boxShadow:'0 4px 14px rgba(6,214,160,0.3)'}}>
                    🎵 Chord
                  </motion.button>
                )}
              </div>

              {/* Labels toggle */}
              <button onClick={()=>setShowLabels(!showLabels)}
                style={{padding:'9px 16px',borderRadius:'10px',border:'1px solid rgba(139,92,246,0.2)',background:showLabels?'rgba(139,92,246,0.15)':'rgba(10,10,30,0.6)',color:showLabels?'#c084fc':'var(--text-muted)',fontSize:'13px',fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}>
                {showLabels ? '🏷 Labels On' : '🏷 Labels Off'}
              </button>
            </div>

            {/* Info bar */}
            <div style={{marginTop:'16px',padding:'12px 16px',borderRadius:'10px',background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.15)',display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{fontSize:'20px'}}>🎼</span>
              <div>
                <span style={{fontSize:'13px',fontWeight:700,color:'#c084fc'}}>{root} {mode==='scale'?scaleName:chordName}</span>
                <span style={{fontSize:'12px',color:'var(--text-muted)',marginLeft:'10px'}}>{currentDesc}</span>
              </div>
              <div style={{marginLeft:'auto',display:'flex',gap:'6px',flexWrap:'wrap'}}>
                {[...highlighted].sort((a,b)=>Object.keys(FREQS).indexOf(a)-Object.keys(FREQS).indexOf(b))
                  .map(n => (
                    <span key={n} style={{fontSize:'11px',padding:'2px 8px',borderRadius:'20px',background:'rgba(139,92,246,0.2)',color:'#c084fc',fontWeight:600}}>
                      {noteBase(n)}
                    </span>
                  ))}
              </div>
            </div>
          </motion.div>

          {/* Piano Keyboard */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
            className="glass-card" style={{padding:'32px 24px',overflowX:'auto',marginBottom:'24px'}}>
            <div style={{position:'relative',width:totalWidth,height:WK_H+20,margin:'0 auto'}}>

              {/* White keys */}
              {WHITE_KEYS.map((note,i) => {
                const isHighlighted = highlighted.has(note);
                const isActive = activeKeys.has(note);
                const isRoot = noteBase(note) === root && isHighlighted;
                return (
                  <motion.div
                    key={note}
                    onMouseDown={() => handlePlay(note)}
                    whileTap={{scaleY:0.97}}
                    style={{
                      position:'absolute', left:i*WK_W, top:0,
                      width:WK_W-2, height:WK_H,
                      borderRadius:'0 0 8px 8px',
                      background: isActive
                        ? 'linear-gradient(180deg,#8b5cf6,#c084fc)'
                        : isRoot
                          ? 'linear-gradient(180deg,#4c1d95,#6d28d9)'
                          : isHighlighted
                            ? 'linear-gradient(180deg,#1e1b4b,#312e81)'
                            : 'linear-gradient(180deg,#f8f8ff,#e0e0ee)',
                      border: isHighlighted
                        ? `2px solid ${isRoot?'#8b5cf6':'rgba(139,92,246,0.6)'}`
                        : '1px solid rgba(100,100,120,0.3)',
                      cursor:'pointer',
                      boxShadow: isActive
                        ? '0 0 20px rgba(139,92,246,0.8), 0 4px 8px rgba(0,0,0,0.3)'
                        : isHighlighted
                          ? '0 0 12px rgba(139,92,246,0.3), 0 4px 8px rgba(0,0,0,0.3)'
                          : '0 4px 8px rgba(0,0,0,0.3)',
                      transition:'background 0.15s, box-shadow 0.15s',
                      display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:'8px',
                      userSelect:'none',
                      zIndex:1,
                    }}
                  >
                    {showLabels && (
                      <span style={{fontSize:'10px',fontWeight:700,fontFamily:"'Outfit',sans-serif",color:isHighlighted?'#e0d0ff':'rgba(60,60,80,0.6)',letterSpacing:'0.04em'}}>
                        {noteBase(note)}
                      </span>
                    )}
                  </motion.div>
                );
              })}

              {/* Black keys */}
              {BLACK_KEYS.map(({note, offset}) => {
                const isHighlighted = highlighted.has(note);
                const isActive = activeKeys.has(note);
                const isRoot = noteBase(note) === root && isHighlighted;
                return (
                  <motion.div
                    key={note}
                    onMouseDown={() => handlePlay(note)}
                    whileTap={{scaleY:0.95}}
                    style={{
                      position:'absolute',
                      left: offset * WK_W - BK_W/2 + 1,
                      top:0,
                      width:BK_W, height:BK_H,
                      borderRadius:'0 0 6px 6px',
                      background: isActive
                        ? 'linear-gradient(180deg,#8b5cf6,#6d28d9)'
                        : isRoot
                          ? 'linear-gradient(180deg,#5b21b6,#4c1d95)'
                          : isHighlighted
                            ? 'linear-gradient(180deg,#3730a3,#312e81)'
                            : 'linear-gradient(180deg,#1a1a2e,#0d0d1a)',
                      border: isHighlighted
                        ? `1px solid ${isRoot?'#a78bfa':'rgba(139,92,246,0.5)'}`
                        : '1px solid rgba(60,60,80,0.5)',
                      cursor:'pointer',
                      boxShadow: isActive
                        ? '0 0 16px rgba(139,92,246,0.9)'
                        : isHighlighted
                          ? '0 0 10px rgba(139,92,246,0.4)'
                          : '0 4px 6px rgba(0,0,0,0.6)',
                      transition:'background 0.15s, box-shadow 0.15s',
                      zIndex:2,
                      userSelect:'none',
                      display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:'6px',
                    }}
                  >
                    {showLabels && isHighlighted && (
                      <span style={{fontSize:'8px',fontWeight:700,color:'rgba(200,180,255,0.9)',writingMode:'vertical-rl',transform:'rotate(180deg)'}}>
                        {noteBase(note)}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Keyboard shortcut hints */}
            <div style={{marginTop:'20px',display:'flex',gap:'6px',flexWrap:'wrap',justifyContent:'center'}}>
              {Object.entries(KEY_MAP).slice(0,13).map(([key,note])=>(
                <div key={key} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
                  <span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'4px',background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.2)',color:'var(--text-muted)',fontFamily:'monospace'}}>
                    {key.toUpperCase()}
                  </span>
                  <span style={{fontSize:'8px',color:'var(--text-muted)'}}>{noteBase(note)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Metronome */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
            className="glass-card" style={{padding:'20px 24px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
              <span style={{fontSize:'16px',fontWeight:700,fontFamily:"'Outfit',sans-serif"}}>🥁 Metronome</span>

              {/* Beat visualizer */}
              <div style={{display:'flex',gap:'6px'}}>
                {[0,1,2,3].map(b => (
                  <motion.div key={b}
                    animate={metroOn && beat===b ? {scale:1.4, opacity:1} : {scale:1,opacity:0.3}}
                    transition={{duration:0.1}}
                    style={{width:'12px',height:'12px',borderRadius:'50%',background: b===0?'#8b5cf6':'rgba(139,92,246,0.6)'}}
                  />
                ))}
              </div>

              {/* BPM slider */}
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <span style={{fontSize:'12px',color:'var(--text-muted)'}}>BPM</span>
                <input type="range" min="40" max="200" value={bpm} onChange={e=>setBpm(Number(e.target.value))}
                  style={{width:'120px',accentColor:'#8b5cf6'}} />
                <span style={{fontSize:'14px',fontWeight:700,color:'#c084fc',minWidth:'36px'}}>{bpm}</span>
              </div>

              {/* Start/Stop */}
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={()=>setMetroOn(!metroOn)}
                style={{padding:'9px 22px',borderRadius:'10px',border:'none',background:metroOn?'rgba(244,63,94,0.8)':'linear-gradient(135deg,#06d6a0,#059669)',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 14px ${metroOn?'rgba(244,63,94,0.3)':'rgba(6,214,160,0.3)'}`}}>
                {metroOn ? '⏹ Stop' : '▶ Start'}
              </motion.button>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </>
  );
}
