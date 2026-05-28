export const sparksParticles = {
  fullScreen: { enable: false },

  particles: {
    number: {
      value: 40,
      density: { enable: true, area: 800 },
    },
    color: { value: ["#ffffff", "#cccccc"] },
    opacity: {
      value: 0.7,
      animation: { enable: true, speed: 0.4, minimumValue: 0.2 }
    },
    size: {
      value: { min: 1, max: 3 },
      animation: { enable: true, speed: 1, minimumValue: 0.5 }
    },
    move: {
      enable: true,
      speed: 0.8,
      direction: "none",
      random: true,
      straight: false,
      outModes: { default: "bounce" }
    },
  },

  interactivity: {
    events: {
      onHover: { enable: false },
      onClick: { enable: false },
      resize: true
    }
  },

  detectRetina: true,
};