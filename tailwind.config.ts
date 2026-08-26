import type { Config } from "tailwindcss";

// Design tokens for the SortRAG research platform.
// Aesthetic: "lab notebook / working paper" — not a generic AI-chatbot look.
// Paper background, ink-navy text, a single signal-amber accent reserved
// for the one thing that matters on any given screen: the measured result.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F0",
        ink: "#1C2321",
        "ink-soft": "#4B534F",
        rule: "#D9D4C7",
        panel: "#FFFFFF",
        signal: "#B5652B",
        "signal-soft": "#E9D9C8",
        quick: "#2B6CB0",
        merge: "#B5652B",
        builtin: "#3F6B4F",
        nosort: "#8A8478",
        pass: "#3F6B4F",
        fail: "#A93E3E"
      },
      fontFamily: {
        display: ["Source Serif 4", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "4px"
      }
    }
  },
  plugins: []
};
export default config;
