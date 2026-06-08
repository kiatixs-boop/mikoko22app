module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mikoko: {
          void: "#D4C5E2",
          panel: "#F5EDE0",
          panel2: "#EDE2D3",
          line: "#C4B8AA",
          text: "#3D2B1F",
          muted: "#7A6B5E",
          emerald: "#7DAA7D",
          crimson: "#C46A6A",
          gold: "#D4A55A",
          cyan: "#B8A6CC",
          amber: "#D4A055"
        }
      },
      fontFamily: {
        outfit: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
        silkscreen: ["Silkscreen", "monospace"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        retro: "4px 4px 0 0 #C4B8AA",
        "retro-lg": "6px 6px 0 0 #C4B8AA",
        "retro-inner": "inset 2px 2px 0 0 #C4B8AA",
        "retro-pressed": "inset 3px 3px 0 0 rgba(0,0,0,0.08)",
        glow: "0 0 32px rgba(184, 166, 204, 0.15)",
        danger: "0 0 32px rgba(196, 106, 106, 0.15)"
      }
    }
  },
  plugins: []
};
