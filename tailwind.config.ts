import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0C0D12",
        surface: "#14151C",
        "surface-raised": "#1B1C25",
        line: "#23242E",
        ivory: "#F3F1EC",
        muted: "#8C8D99",
        coral: "#FF4D6D",
        "coral-dim": "#C43A55",
        violet: "#7C5CFF",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "coral-violet": "linear-gradient(135deg, #FF4D6D 0%, #7C5CFF 100%)",
        "void-radial":
          "radial-gradient(circle at 20% -10%, rgba(255,77,109,0.16), transparent 45%), radial-gradient(circle at 85% 10%, rgba(124,92,255,0.14), transparent 40%)",
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(255,77,109,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
