"use client";

import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import type { RankEffectConfig } from "@/lib/gacha/rankEffects";

async function initEngine(engine: import("@tsparticles/engine").Engine) {
  await loadSlim(engine);
}

function buildOptions(preset: RankEffectConfig["particlePreset"], color: string): ISourceOptions {
  if (preset === "none") {
    return { particles: { number: { value: 0 } } };
  }

  const colors =
    preset === "rainbow"
      ? ["#ff0080", "#ff8c00", "#ffd700", "#00ff87", "#00c8ff", "#8b5cf6"]
      : preset === "redGold"
        ? ["#ff4444", "#ffd700", "#ff6b6b"]
        : preset === "gold"
          ? ["#ffd700", "#fff4b0", "#b8860b"]
          : preset === "sparkle"
            ? [color, "#ffffff", color]
            : [color, "#ffffff"];

  return {
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      number: { value: preset === "gold" || preset === "rainbow" ? 80 : 50 },
      color: { value: colors },
      shape: { type: preset === "stars" ? "star" : "circle" },
      opacity: { value: { min: 0.2, max: 0.85 } },
      size: { value: { min: 1, max: preset === "gold" ? 5 : 4 } },
      move: { enable: true, speed: preset === "rainbow" ? 2.5 : 1.8, outModes: { default: "out" } },
    },
    detectRetina: true,
  };
}

export function EffectParticles({ config, active }: { config: RankEffectConfig; active: boolean }) {
  const options = useMemo(
    () => buildOptions(config.particlePreset, config.glowColor),
    [config.particlePreset, config.glowColor]
  );

  if (!active || config.particlePreset === "none") return null;

  return (
    <ParticlesProvider init={initEngine}>
      <div className="pointer-events-none absolute inset-0 z-[2]">
        <Particles options={options} className="h-full w-full" />
      </div>
    </ParticlesProvider>
  );
}
