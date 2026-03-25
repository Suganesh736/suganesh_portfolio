import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "tsparticles-engine";

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine as any);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit as any}
      options={{
        fullScreen: false,
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        particles: {
          color: { value: ["#a855f7", "#3b82f6", "#06b6d4"] },
          links: {
            color: "#a855f7",
            distance: 150,
            enable: true,
            opacity: 0.15,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.8,
            direction: "none",
            outModes: { default: "bounce" },
          },
          number: { density: { enable: true }, value: 60 },
          opacity: { value: { min: 0.1, max: 0.4 } },
          size: { value: { min: 1, max: 3 } },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
          },
          modes: {
            grab: { distance: 140, links: { opacity: 0.4 } },
          },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 z-0"
    />
  );
};

export default ParticlesBackground;
