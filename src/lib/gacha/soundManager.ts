import { Howl, Howler } from "howler";
import type { RankEffectConfig } from "./rankEffects";

type SoundKey = "soft" | "pulse" | "epic" | "lastOne" | "kiri" | "tap" | "chime" | "thunder" | "fanfare";

function synthWav(
  durationSec: number,
  fn: (t: number, sampleRate: number) => number
): string {
  const sampleRate = 22050;
  const samples = Math.floor(durationSec * sampleRate);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const v = Math.max(-1, Math.min(1, fn(t, sampleRate)));
    view.setInt16(44 + i * 2, v * 0x7fff, true);
  }
  const blob = new Blob([buffer], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

const PRESETS: Record<SoundKey, string> = {
  tap: synthWav(0.12, (t) => Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 30)),
  chime: synthWav(0.5, (t) =>
    Math.sin(2 * Math.PI * 880 * t) * 0.5 * Math.exp(-t * 4) +
    Math.sin(2 * Math.PI * 1320 * t) * 0.3 * Math.exp(-t * 5)
  ),
  thunder: synthWav(0.8, (t) => (Math.random() * 2 - 1) * Math.exp(-t * 3) * (t < 0.15 ? 1 : 0.3)),
  fanfare: synthWav(1.2, (t) =>
    Math.sin(2 * Math.PI * 523 * t) * 0.4 * Math.exp(-t * 1.5) +
    Math.sin(2 * Math.PI * 659 * t) * 0.35 * Math.exp(-t * 1.2) +
    Math.sin(2 * Math.PI * 784 * t) * 0.3 * Math.exp(-t * 1)
  ),
  soft: synthWav(2, (t) => Math.sin(2 * Math.PI * 220 * t) * 0.15 * (1 + 0.2 * Math.sin(t * 4))),
  pulse: synthWav(2.5, (t) => Math.sin(2 * Math.PI * 330 * t) * 0.2 * (0.6 + 0.4 * Math.sin(t * 6))),
  epic: synthWav(4, (t) =>
    Math.sin(2 * Math.PI * 196 * t) * 0.25 +
    Math.sin(2 * Math.PI * 392 * t) * 0.15 * Math.sin(t * 2)
  ),
  lastOne: synthWav(5, (t) =>
    Math.sin(2 * Math.PI * 147 * t) * 0.3 * Math.exp(-((t % 1) * 2)) +
    Math.sin(2 * Math.PI * 440 * t) * 0.1
  ),
  kiri: synthWav(5.5, (t) => {
    const freqs = [440, 554, 659, 880];
    return freqs.reduce((s, f, i) => s + Math.sin(2 * Math.PI * f * t) * 0.12 * Math.sin(t * 3 + i), 0);
  }),
};

const cache = new Map<string, Howl>();

function getHowl(key: SoundKey, loop = false): Howl {
  const id = `${key}-${loop}`;
  if (!cache.has(id)) {
    cache.set(
      id,
      new Howl({
        src: [PRESETS[key]],
        loop,
        volume: loop ? 0.35 : 0.55,
        html5: false,
      })
    );
  }
  return cache.get(id)!;
}

let muted = false;

export function setGachaSoundMuted(value: boolean) {
  muted = value;
  Howler.mute(value);
}

export function stopAllGachaSounds() {
  cache.forEach((h) => {
    h.stop();
  });
}

export function playRankSounds(config: RankEffectConfig) {
  if (muted) return;
  stopAllGachaSounds();
  if (config.sound.bgm) {
    getHowl(config.sound.bgm, true).play();
  }
  if (config.sound.reveal) {
    setTimeout(() => getHowl(config.sound.reveal!).play(), config.blackoutStart ? 400 : 200);
  }
}

export { Howler };