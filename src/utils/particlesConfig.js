export const plexusParticlesConfig = {
  background: { color: "transparent" },

  fullScreen: { enable: false },

  fpsLimit: 120,

  interactivity: {
    events: {
      onHover: { enable: true, mode: "grab" },
      resize: true,
    },
    modes: {
      grab: {
        distance: 180,
        links: { opacity: 0.35 },
      },
    },
  },

  particles: {
    number: {
      value: 80,
      density: { enable: true, area: 700 },
    },

    color: { value: "#ffffff" },

    shape: { type: "circle" },

    opacity: {
      value: 0.45,
      animation: {
        enable: true,
        speed: 0.5,
        minimumValue: 0.15,
      },
    },

    size: {
      value: { min: 1.2, max: 3.2 },
    },

    links: {
      enable: true,
      distance: 160,
      color: "#ffffff",
      opacity: 0.25,
      width: 1,
    },

    move: {
      enable: true,
      speed: 3.8,
      direction: "none",
      random: false,
      straight: false,
      outModes: { default: "out" },

      trail: {
        enable: false,
      },
    },

    shadow: {
      enable: true,
      color: "#ffffff",
      blur: 3,
    },
  },

  detectRetina: true,
};