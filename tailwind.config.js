module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mikoko: {
          void: "#0d0e12",
          panel: "#141821",
          panel2: "#1b2230",
          line: "#273246",
          text: "#C8D4F0",
          muted: "#6B7A99",
          emerald: "#00C896",
          crimson: "#FF3B5C",
          gold: "#C6A15B",
          cyan: "#00E0FF",
          amber: "#F5A623"
        }
      },
      boxShadow: {
        glow: "0 0 32px rgba(0, 200, 150, 0.12)",
        danger: "0 0 32px rgba(255, 59, 92, 0.12)"
      }
    }
  },
  plugins: []
};
