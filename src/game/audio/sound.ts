import { useVnSettings } from '../store/settingsStore';

let context: AudioContext | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!context) {
    try {
      context = new AudioContext();
    } catch {
      return null;
    }
  }
  if (context.state === 'suspended') {
    void context.resume();
  }
  return context;
}

function tone(
  frequency: number,
  startDelay: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  slideTo?: number,
) {
  const ctx = ensureContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t0 = ctx.currentTime + startDelay;
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function noise(duration: number, volume: number) {
  const ctx = ensureContext();
  if (!ctx) return;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.buffer = buffer;
  source.connect(gain).connect(ctx.destination);
  source.start();
}

function allowed(): boolean {
  return !useVnSettings.getState().muted;
}

export const sfx = {
  click() {
    if (!allowed()) return;
    tone(660, 0, 0.06, 'sine', 0.03);
  },
  flip() {
    if (!allowed()) return;
    tone(420, 0, 0.05, 'triangle', 0.025);
  },
  collect() {
    if (!allowed()) return;
    tone(523, 0, 0.16, 'sine', 0.05);
    tone(784, 0.08, 0.22, 'sine', 0.045);
    tone(1046, 0.16, 0.26, 'sine', 0.03);
  },
  select() {
    if (!allowed()) return;
    tone(880, 0, 0.07, 'triangle', 0.035);
  },
  wrong() {
    if (!allowed()) return;
    tone(220, 0, 0.16, 'sine', 0.04, 180);
  },
  contradiction() {
    if (!allowed()) return;
    noise(0.5, 0.09);
    tone(120, 0.02, 0.55, 'sawtooth', 0.07, 60);
    tone(880, 0.05, 0.16, 'square', 0.035, 440);
    tone(1320, 0.18, 0.3, 'triangle', 0.03);
  },
  complete() {
    if (!allowed()) return;
    tone(523, 0, 0.3, 'sine', 0.04);
    tone(659, 0.12, 0.3, 'sine', 0.04);
    tone(784, 0.24, 0.35, 'sine', 0.04);
    tone(1046, 0.36, 0.5, 'sine', 0.035);
  },
};
