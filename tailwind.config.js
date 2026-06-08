module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mikoko: {
          void: "#F5F0E8",
          panel: "#EDE5D5",
          panel2: "#E3DAC6",
          line: "#D4C9B0",
          text: "#2B241A",
          muted: "#6B5E4E",
          emerald: "#5B8C6A",
          crimson: "#C44545",
          gold: "#D4A55A",
          cyan: "#C47B3B",
          amber: "#D4A055"
        }
      },
      boxShadow: {
        panel: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)",
        "panel-raised": "0 4px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
        "panel-pressed": "inset 0 2px 4px rgba(0,0,0,0.08), inset 0 -1px 0 rgba(255,255,255,0.4)",
        "bevel-light": "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.06)",
        "bevel-dark": "inset 0 2px 3px rgba(0,0,0,0.08), inset 0 -1px 0 rgba(255,255,255,0.4)",
        button: "0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
        "button-pressed": "inset 0 2px 4px rgba(0,0,0,0.12)",
        glow: "0 0 32px rgba(196, 123, 59, 0.15)",
        danger: "0 0 32px rgba(196, 69, 69, 0.15)"
      },
      backgroundImage: {
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
};
