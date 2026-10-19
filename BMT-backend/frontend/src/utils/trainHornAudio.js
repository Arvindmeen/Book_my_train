/**
 * Realistic Indian Railways Locomotive Air Chime Horn Synthesizer
 * Powered by Web Audio API
 * 
 * Recreates the authentic dual-tone pneumatic air horn (WAP-5 / WAP-7 / Vande Bharat)
 * - Authentic Nathan/Knorr-Bremse style chord (Eb Minor triad chime: 155.6Hz, 311.1Hz, 370.0Hz, 466.2Hz)
 * - Compressed pneumatic air hiss with bandpass filtering
 * - Detuned brass harmonics (sawtooth + triangle)
 * - Natural acoustic throat resonance and bell flair
 * - Instant responsive attack and natural reverberant release
 */

let audioCtx = null;
let activeHorn = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Starts blowing the train horn
 * @param {number} volume - Master volume between 0 and 1 (default 0.42)
 */
export function playTrainHorn(volume = 0.42) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return null;

    // If an existing horn is sounding, release it smoothly first
    stopTrainHorn(0.04);

    const now = ctx.currentTime;

    // Master horn gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    // Snappy pneumatic air burst attack (35ms)
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), now + 0.035);

    // Warm resonant acoustic filter (simulates physical brass horn bell)
    const bellFilter = ctx.createBiquadFilter();
    bellFilter.type = 'lowpass';
    bellFilter.frequency.setValueAtTime(1600, now);
    bellFilter.Q.setValueAtTime(2.0, now);

    // Throat resonance peak around 780 Hz
    const throatFilter = ctx.createBiquadFilter();
    throatFilter.type = 'peaking';
    throatFilter.frequency.setValueAtTime(780, now);
    throatFilter.gain.setValueAtTime(4.5, now);
    throatFilter.Q.setValueAtTime(1.4, now);

    // Iconic Indian Railways Chime Horn Frequencies:
    // Eb3 (155.56 Hz - deep locomotive chassis resonance)
    // Eb4 (311.13 Hz - primary low horn tone)
    // F#4 (369.99 Hz - secondary mid horn tone)
    // Bb4 (466.16 Hz - high piercing chime)
    const tones = [
      { freq: 155.56, type: 'sawtooth', gain: 0.32, detune: 0 },
      { freq: 311.13, type: 'sawtooth', gain: 0.48, detune: -4 },
      { freq: 311.13, type: 'triangle', gain: 0.38, detune: 3 },
      { freq: 369.99, type: 'sawtooth', gain: 0.44, detune: 5 },
      { freq: 369.99, type: 'triangle', gain: 0.32, detune: -3 },
      { freq: 466.16, type: 'sawtooth', gain: 0.36, detune: 2 },
    ];

    const oscillators = [];

    tones.forEach(({ freq, type, gain: noteGainVal, detune }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      noteGain.gain.setValueAtTime(noteGainVal, now);

      osc.connect(noteGain);
      noteGain.connect(throatFilter);

      osc.start(now);
      oscillators.push(osc);
    });

    // Compressed Pneumatic Air Rush Hiss
    const bufferSize = Math.floor(ctx.sampleRate * 2.5);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.16;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Bandpass filter for air hiss around 950 Hz
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.setValueAtTime(950, now);
    airFilter.Q.setValueAtTime(1.8, now);

    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.24, now);
    airGain.gain.exponentialRampToValueAtTime(0.09, now + 0.12);

    whiteNoise.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(throatFilter);
    whiteNoise.start(now);

    // Audio Pipeline: Filters -> MasterGain -> Destination
    throatFilter.connect(bellFilter);
    bellFilter.connect(masterGain);
    masterGain.connect(ctx.destination);

    activeHorn = {
      masterGain,
      oscillators,
      whiteNoise,
      ctx,
    };

    return activeHorn;
  } catch (err) {
    console.warn('Unable to play train horn via Web Audio API:', err);
    return null;
  }
}

/**
 * Smoothly releases and silences the train horn
 * @param {number} fadeOutSeconds - Release duration in seconds (default 0.22s)
 */
export function stopTrainHorn(fadeOutSeconds = 0.22) {
  if (!activeHorn) return;

  try {
    const { masterGain, oscillators, whiteNoise, ctx } = activeHorn;
    activeHorn = null;

    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), now);
    masterGain.gain.exponentialRampToValueAtTime(0.00001, now + fadeOutSeconds);

    setTimeout(() => {
      oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      if (whiteNoise) {
        try {
          whiteNoise.stop();
          whiteNoise.disconnect();
        } catch {}
      }
      try {
        masterGain.disconnect();
      } catch {}
    }, Math.ceil(fadeOutSeconds * 1000) + 60);
  } catch (err) {
    // Ignore cleanup error
  }
}
