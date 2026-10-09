/**
 * High-fidelity procedural audio generator for Resonance.
 * Generates genuine, beautiful chill/ambient/synthwave WAV audio tracks
 * so the application plays real, soothing music immediately upon pressing Play,
 * feeding true audio frequencies to the Web Audio Analyser and CAVA visualizer.
 */

// Sound styles for different tracks
export type TrackAudioStyle = 'synthwave' | 'ambient' | 'chill' | 'lofi' | 'deep' | 'dream' | 'cosmic';

interface TrackProfile {
  bpm: number;
  rootFreq: number; // Hz
  scale: number[]; // semitone offsets
  chords: number[][]; // chord progression
  bassOctave: number;
  pluckPattern: number[];
}

const PROFILES: Record<TrackAudioStyle, TrackProfile> = {
  synthwave: {
    bpm: 100,
    rootFreq: 146.83, // D3
    scale: [0, 2, 3, 5, 7, 8, 10], // D Natural Minor
    chords: [
      [0, 3, 7, 10], // Dm7
      [8, 12, 15, 19], // Bbmaj7
      [3, 7, 10, 14], // Fmaj7
      [10, 14, 17, 21], // C9
    ],
    bassOctave: 0.5,
    pluckPattern: [0, 2, 1, 3, 2, 4, 3, 1],
  },
  ambient: {
    bpm: 72,
    rootFreq: 130.81, // C3
    scale: [0, 2, 4, 7, 9], // C Major Pentatonic
    chords: [
      [0, 4, 7, 11], // Cmaj7
      [5, 9, 12, 16], // Fmaj7
      [9, 12, 16, 19], // Am7
      [7, 11, 14, 17], // Gsus4
    ],
    bassOctave: 0.5,
    pluckPattern: [0, 1, 2, 3, 1, 2, 0, 3],
  },
  lofi: {
    bpm: 82,
    rootFreq: 164.81, // E3
    scale: [0, 2, 3, 5, 7, 9, 10], // E Dorian
    chords: [
      [0, 3, 7, 9], // Em6
      [5, 9, 12, 15], // Amaj7
      [3, 7, 10, 14], // Gmaj7
      [10, 14, 17, 21], // D7
    ],
    bassOctave: 0.5,
    pluckPattern: [0, 2, 3, 1, 0, 3, 2, 1],
  },
  chill: {
    bpm: 88,
    rootFreq: 174.61, // F3
    scale: [0, 2, 4, 5, 7, 9, 11],
    chords: [
      [0, 4, 7, 11],
      [7, 11, 14, 17],
      [9, 12, 16, 19],
      [5, 9, 12, 16],
    ],
    bassOctave: 0.5,
    pluckPattern: [1, 2, 0, 3, 2, 1, 3, 0],
  },
  deep: {
    bpm: 96,
    rootFreq: 110.0, // A2
    scale: [0, 3, 5, 7, 10],
    chords: [
      [0, 3, 7, 10],
      [8, 12, 15, 19],
      [5, 8, 12, 15],
      [10, 13, 17, 20],
    ],
    bassOctave: 0.5,
    pluckPattern: [0, 0, 2, 1, 0, 3, 1, 2],
  },
  dream: {
    bpm: 76,
    rootFreq: 196.0, // G3
    scale: [0, 2, 4, 7, 9],
    chords: [
      [0, 4, 7, 11],
      [4, 7, 11, 14],
      [9, 12, 16, 19],
      [2, 5, 9, 12],
    ],
    bassOctave: 0.5,
    pluckPattern: [0, 3, 1, 2, 3, 0, 2, 1],
  },
  cosmic: {
    bpm: 64,
    rootFreq: 98.0, // G2
    scale: [0, 2, 3, 5, 7, 8, 10],
    chords: [
      [0, 7, 10, 14],
      [8, 12, 15, 20],
      [3, 7, 10, 15],
      [5, 8, 12, 17],
    ],
    bassOctave: 0.5,
    pluckPattern: [0, 1, 2, 3, 2, 1, 0, 1],
  },
};

const generatedTracksCache = new Map<string, string>();

/**
 * Generate a 30-second seamless stereo WAV blob containing rich synthesizer chords,
 * warm sub-bass, plucks, and subtle vinyl groove.
 */
export function generateProceduralAudioBlobUrl(style: TrackAudioStyle = 'synthwave'): string {
  if (generatedTracksCache.has(style)) {
    return generatedTracksCache.get(style)!;
  }

  const sampleRate = 32000; // Efficient for browser generation
  const durationSec = 28; // 28 seconds of seamless loop
  const totalSamples = sampleRate * durationSec;
  const leftChannel = new Float32Array(totalSamples);
  const rightChannel = new Float32Array(totalSamples);

  const profile = PROFILES[style] || PROFILES.synthwave;
  const beatsPerSec = profile.bpm / 60;
  const secPerBeat = 1 / beatsPerSec;
  const barLength = secPerBeat * 4;
  const numChords = profile.chords.length;

  for (let i = 0; i < totalSamples; i++) {
    const time = i / sampleRate;
    const currentBar = Math.floor(time / barLength) % numChords;
    const barProgress = (time % barLength) / barLength;
    const beatIndex = Math.floor((time % barLength) / (secPerBeat * 0.5)); // 8th notes
    const activeChord = profile.chords[currentBar];

    let left = 0;
    let right = 0;

    // 1. Pad / Chord Swell (Warm analog detuned saws + sine)
    const padEnv = 0.5 + 0.5 * Math.sin(barProgress * Math.PI); // smooth breathing envelope
    for (let c = 0; c < activeChord.length; c++) {
      const noteFreq = profile.rootFreq * Math.pow(2, activeChord[c] / 12);
      // Detuned pair for stereo width
      const s1 = Math.sin(2 * Math.PI * noteFreq * 1.002 * time);
      const s2 = Math.sin(2 * Math.PI * noteFreq * 0.998 * time);
      const subHarmonic = 0.3 * Math.sin(2 * Math.PI * (noteFreq * 0.5) * time);
      
      left += (s1 * 0.7 + subHarmonic) * padEnv * 0.08;
      right += (s2 * 0.7 + subHarmonic) * padEnv * 0.08;
    }

    // 2. Bassline (Deep solid fundamental)
    const bassNote = activeChord[0];
    const bassFreq = profile.rootFreq * profile.bassOctave * Math.pow(2, bassNote / 12);
    const bassEnv = 0.6 + 0.4 * Math.cos((time % (secPerBeat * 2)) * Math.PI * beatsPerSec);
    const bassWave = Math.sin(2 * Math.PI * bassFreq * time) + 0.25 * Math.sin(4 * Math.PI * bassFreq * time);
    left += bassWave * bassEnv * 0.18;
    right += bassWave * bassEnv * 0.18;

    // 3. Pluck / Arp Melody (Crisp bell-like tones)
    const pluckStep = profile.pluckPattern[beatIndex % profile.pluckPattern.length];
    const pluckNote = activeChord[pluckStep % activeChord.length] + 12; // 1 octave up
    const pluckFreq = profile.rootFreq * Math.pow(2, pluckNote / 12);
    const timeInStep = (time % (secPerBeat * 0.5));
    const pluckEnv = Math.exp(-timeInStep * 7.5); // fast decay
    const pluckSine = Math.sin(2 * Math.PI * pluckFreq * time) + 0.4 * Math.sin(4 * Math.PI * pluckFreq * time);
    left += pluckSine * pluckEnv * 0.11;
    right += pluckSine * pluckEnv * 0.09;

    // 4. Subtle Lo-fi Kick / Snare Pulse (Provides rhythmic punch in spectrum visualizer)
    const beatPos = (time % secPerBeat) / secPerBeat;
    // Kick on beat 1 and 3
    if (Math.floor(time / secPerBeat) % 2 === 0 && beatPos < 0.2) {
      const kickEnv = Math.exp(-beatPos * 25);
      const kickFreq = 110 * Math.exp(-beatPos * 30);
      const kick = Math.sin(2 * Math.PI * kickFreq * time) * kickEnv * 0.22;
      left += kick;
      right += kick;
    }

    // Gentle limiting / soft clipping
    leftChannel[i] = Math.tanh(left * 1.5);
    rightChannel[i] = Math.tanh(right * 1.5);
  }

  // Convert Float32 stereo channels to 16-bit PCM WAV
  const wavBuffer = encodeWAV(leftChannel, rightChannel, sampleRate);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  const objectUrl = URL.createObjectURL(blob);
  generatedTracksCache.set(style, objectUrl);
  return objectUrl;
}

function encodeWAV(left: Float32Array, right: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = left.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF Chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt Subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // data Subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write Interleaved Samples
  let offset = 44;
  for (let i = 0; i < left.length; i++) {
    // Left channel
    let sL = Math.max(-1, Math.min(1, left[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true);
    offset += 2;

    // Right channel
    let sR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
