// ─── Sound & Music Manager (Next-Gen Crystal & Water Synthesizer) ─────────────

let _ctx: AudioContext | null = null;
let _musicGain: GainNode | null = null;
let _sfxGain: GainNode | null = null;
let _musicOscillators: OscillatorNode[] = [];
let _musicPlaying = false;
let _sfxEnabled = true;
let _musicEnabled = true;

function getCtx(): AudioContext {
  if (!_ctx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    _ctx = new AudioCtx();

    _musicGain = _ctx.createGain();
    _musicGain.gain.value = 0.22;
    _musicGain.connect(_ctx.destination);

    _sfxGain = _ctx.createGain();
    _sfxGain.gain.value = 0.5;
    _sfxGain.connect(_ctx.destination);
  }
  return _ctx;
}

function resume() {
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

// ─── Tone & Harmony Synthesizers ──────────────────────────────────────────────

function playHarmonicTone(
  fundamental: number,
  duration: number,
  gainVal = 0.25,
  delay = 0,
  pitchEnd?: number
) {
  if (!_sfxEnabled) return;
  resume();
  const ctx = getCtx();
  const t = ctx.currentTime + delay;

  // Primary sine fundamental
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(fundamental, t);

  // Soft octave overtone for crystal acoustic shimmer
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(fundamental * 2.02, t);

  if (pitchEnd !== undefined) {
    osc1.frequency.exponentialRampToValueAtTime(Math.max(20, pitchEnd), t + duration);
    osc2.frequency.exponentialRampToValueAtTime(Math.max(40, pitchEnd * 2), t + duration);
  }

  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(_sfxGain!);
  gain2.connect(_sfxGain!);

  gain1.gain.setValueAtTime(0, t);
  gain1.gain.linearRampToValueAtTime(gainVal, t + 0.012);
  gain1.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  gain2.gain.setValueAtTime(0, t);
  gain2.gain.linearRampToValueAtTime(gainVal * 0.35, t + 0.015);
  gain2.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + duration + 0.05);
  osc2.stop(t + duration + 0.05);
}

// Organic acoustic water splash & bubble resonance
function playOrganicWaterSplash(duration = 0.45, gainVal = 0.15) {
  if (!_sfxEnabled) return;
  resume();
  const ctx = getCtx();
  const t = ctx.currentTime;

  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Velvety brownian water noise
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.04 * white)) / 1.04;
    lastOut = data[i];
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(450, t);
  filter.frequency.exponentialRampToValueAtTime(1400, t + duration * 0.4);
  filter.frequency.exponentialRampToValueAtTime(320, t + duration);
  filter.Q.value = 2.4;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(gainVal, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(_sfxGain!);

  source.start(t);
  source.stop(t + duration + 0.05);
}

// ─── Public SFX Interface ────────────────────────────────────────────────────

export const SFX = {
  // Crystal glass tactile tap
  tap() {
    playHarmonicTone(784, 0.06, 0.15, 0, 650);
  },

  // Elegant tube focus
  select() {
    playHarmonicTone(587.33, 0.1, 0.24, 0, 880);
  },

  // Soft deselect drop
  deselect() {
    playHarmonicTone(440, 0.08, 0.14, 0, 350);
  },

  // Container lift
  tubeLift() {
    playHarmonicTone(392, 0.12, 0.18, 0, 660);
  },

  // Pure fluid pour with bubbling ripples
  pour() {
    playOrganicWaterSplash(0.5, 0.16);
    // Dynamic bubbling drops at varied pitches
    playHarmonicTone(880, 0.12, 0.18, 0.03, 680);
    playHarmonicTone(1046.5, 0.14, 0.17, 0.1, 740);
    playHarmonicTone(784, 0.15, 0.2, 0.18, 520);
    playHarmonicTone(659.25, 0.18, 0.22, 0.27, 440);
  },

  // Droplet resonance
  waterDrop() {
    playHarmonicTone(1174.66, 0.08, 0.22, 0, 587.33);
  },

  // Gentle muted bump (never shrill or harsh)
  invalid() {
    playHarmonicTone(220, 0.12, 0.18, 0, 165);
  },

  // Valid move confirmation
  validMove() {
    playHarmonicTone(659.25, 0.12, 0.22, 0);
    playHarmonicTone(880, 0.14, 0.24, 0.06);
  },

  // Single tube completed: ethereal glass chime
  tubeComplete() {
    const notes = [587.33, 739.99, 880, 1174.66, 1479.98];
    notes.forEach((freq, idx) => {
      playHarmonicTone(freq, 0.45, 0.2, idx * 0.06);
    });
  },

  // Grand victory symphony: rich pentatonic chord cascade
  complete() {
    const chord = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    chord.forEach((f, i) => {
      playHarmonicTone(f, 0.5, 0.22, i * 0.08);
    });
    // Final high crystal sparkle
    playHarmonicTone(1760, 0.65, 0.16, 0.55);
  },

  // Rewind audio cue
  undo() {
    playHarmonicTone(520, 0.1, 0.2, 0, 360);
  },

  // Milestone unlock fanfare
  milestone() {
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    fanfare.forEach((f, i) => {
      playHarmonicTone(f, 0.45, 0.25, i * 0.09);
    });
  },

  // Hint light chime
  hint() {
    playHarmonicTone(784, 0.14, 0.22, 0, 1046.5);
    playHarmonicTone(1318.51, 0.18, 0.22, 0.08);
  },

  // Daily reward claimed
  dailyReward() {
    const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98];
    notes.forEach((f, i) => playHarmonicTone(f, 0.25, 0.24, i * 0.08));
  },

  // Achievement toast
  achievement() {
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((f, i) => playHarmonicTone(f, 0.32, 0.25, i * 0.07));
  },

  // Level start chime
  levelStart() {
    playHarmonicTone(523.25, 0.1, 0.18);
    playHarmonicTone(659.25, 0.12, 0.2, 0.07);
    playHarmonicTone(783.99, 0.16, 0.22, 0.14);
  },
};

// ─── Next-Gen Relaxing Zen Ambient Music Engine ───────────────────────────────

// Calming D Pentatonic Scale
const ZEN_SCALE = [
  293.66, // D4
  329.63, // E4
  369.99, // F#4
  440.00, // A4
  493.88, // B4
  587.33, // D5
  659.25, // E5
  739.99, // F#5
];

let _musicTimer: ReturnType<typeof setTimeout> | null = null;

function playAmbientPad(freq: number, duration: number, delay: number) {
  if (!_musicEnabled || !_ctx || !_musicGain) return;
  const ctx = _ctx;
  const t = ctx.currentTime + delay;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);

  // Warm analog filter
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(650, t);
  filter.frequency.exponentialRampToValueAtTime(1100, t + duration * 0.5);
  filter.frequency.exponentialRampToValueAtTime(500, t + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(_musicGain);

  // Soft blooming attack and long gentle release
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.09, t + 0.6);
  gain.gain.setValueAtTime(0.09, t + duration - 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.start(t);
  osc.stop(t + duration + 0.1);
  _musicOscillators.push(osc);
}

function scheduleAmbientPhrase() {
  if (!_musicPlaying || !_musicEnabled) return;
  resume();
  getCtx();

  const phraseNotes = [0, 2, 4, 3, 5, 2, 1, 0];
  let cursorTime = 0;

  for (let i = 0; i < phraseNotes.length; i++) {
    const scaleIndex = (phraseNotes[i] + Math.floor(Math.random() * 2)) % ZEN_SCALE.length;
    const freq = ZEN_SCALE[scaleIndex];
    const duration = 2.2 + Math.random() * 0.8;

    playAmbientPad(freq, duration, cursorTime);

    // Warm resonant drone note underneath
    if (i === 0 || i === 4) {
      playAmbientPad(freq * 0.5, 3.8, cursorTime);
    }

    cursorTime += 1.2 + Math.random() * 0.5;
  }

  _musicTimer = setTimeout(scheduleAmbientPhrase, (cursorTime + 1.5) * 1000);
}

export function startMusic() {
  if (_musicPlaying) return;
  _musicPlaying = true;
  _musicEnabled = true;
  scheduleAmbientPhrase();
}

export function stopMusic() {
  _musicPlaying = false;
  if (_musicTimer) {
    clearTimeout(_musicTimer);
    _musicTimer = null;
  }
  _musicOscillators.forEach((o) => {
    try {
      o.stop();
    } catch {
      // Ignore
    }
  });
  _musicOscillators = [];
}

export function setSfxEnabled(v: boolean) {
  _sfxEnabled = v;
}

export function setMusicEnabled(v: boolean) {
  _musicEnabled = v;
  if (v) {
    if (!_musicPlaying) startMusic();
  } else {
    stopMusic();
  }
}

export function setSfxVolume(v: number) {
  if (_sfxGain) _sfxGain.gain.value = Math.max(0, Math.min(1, v)) * 0.55;
}

export function setMusicVolume(v: number) {
  if (_musicGain) _musicGain.gain.value = Math.max(0, Math.min(1, v)) * 0.25;
}

export function isSfxEnabled() {
  return _sfxEnabled;
}

export function isMusicEnabled() {
  return _musicEnabled;
}

