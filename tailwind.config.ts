import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx,mdx}",
    "./src/content/**/*.{ts,tsx,mdx}",
    "./src/data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#06070C",
          raised: "#0A0C13",
        },
        panel: {
          DEFAULT: "#0C0F18",
          raised: "#11141F",
        },
        hairline: {
          DEFAULT: "#1B2130",
          strong: "#2A3142",
        },
        ink: {
          DEFAULT: "#E9EBF2",
          muted: "#9AA2B4",
          subtle: "#626B7D",
        },
        brand: {
          50: "#EEF1FF",
          100: "#E0E6FF",
          200: "#C6D0FF",
          300: "#A3B2FF",
          400: "#8194FF",
          500: "#6878F2",
          600: "#5360DA",
          700: "#434EB0",
          800: "#373F8A",
          900: "#2F356E",
        },
        accent: {
          DEFAULT: "#5FE3CE",
          soft: "#7DEAD9",
          deep: "#2BB7A2",
        },
        // Soft violet — used for engagement / consulting accents in the graph
        // and as a third hue alongside brand (blue) and accent (cyan).
        violet: {
          soft: "#C4B5FD",
          DEFAULT: "#9B87F5",
          deep: "#6D52E0",
        },
        // Rare warm highlight — reserved for sparing emphasis (horizon / leadership).
        warm: {
          DEFAULT: "#F5C97B",
          deep: "#E0A94F",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
      },
      maxWidth: {
        container: "78rem",
        prose: "44rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(104,120,242,0.18), 0 24px 70px -28px rgba(104,120,242,0.45)",
        "glow-accent": "0 0 0 1px rgba(95,227,206,0.20), 0 24px 70px -28px rgba(95,227,206,0.40)",
        "glow-violet": "0 0 0 1px rgba(155,135,245,0.20), 0 24px 70px -28px rgba(155,135,245,0.42)",
        card: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 28px 60px -40px rgba(0,0,0,0.9)",
        "card-hover":
          "inset 0 1px 0 0 rgba(255,255,255,0.07), 0 36px 80px -36px rgba(104,120,242,0.35)",
        "inner-top": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
        node: "0 0 22px rgba(129,148,255,0.85)",
      },
      backgroundImage: {
        "radial-brand":
          "radial-gradient(60% 60% at 50% 0%, rgba(104,120,242,0.18) 0%, rgba(6,7,12,0) 70%)",
        "radial-accent":
          "radial-gradient(60% 60% at 50% 0%, rgba(95,227,206,0.16) 0%, rgba(6,7,12,0) 70%)",
        "radial-violet":
          "radial-gradient(60% 60% at 50% 0%, rgba(155,135,245,0.18) 0%, rgba(6,7,12,0) 70%)",
        "conic-aurora":
          "conic-gradient(from 180deg at 50% 50%, rgba(104,120,242,0.12), rgba(95,227,206,0.10), rgba(155,135,245,0.12), rgba(104,120,242,0.12))",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pulse-node": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        "dash-flow": {
          to: { strokeDashoffset: "-1000" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "trace-flow": {
          to: { strokeDashoffset: "-24" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "aurora-shift": {
          "0%, 100%": { opacity: "0.5", transform: "translate3d(0,0,0) scale(1)" },
          "50%": { opacity: "0.85", transform: "translate3d(0,-2%,0) scale(1.05)" },
        },
        "core-pulse": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
        "stream-flow": {
          to: { strokeDashoffset: "-220" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.22)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.95" },
        },
        ignite: {
          "0%": { transform: "scale(0.45)", opacity: "0" },
          "18%": { opacity: "0.95" },
          "100%": { transform: "scale(2.7)", opacity: "0" },
        },
        surge: {
          "0%, 100%": { opacity: "0.4", filter: "brightness(1)" },
          "35%": { opacity: "1", filter: "brightness(1.9)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.9s ease-out both",
        "pulse-node": "pulse-node 3.2s ease-in-out infinite",
        "dash-flow": "dash-flow 18s linear infinite",
        "trace-flow": "trace-flow 1.2s linear infinite",
        "spin-slow": "spin-slow 32s linear infinite",
        "aurora-shift": "aurora-shift 14s ease-in-out infinite",
        "core-pulse": "core-pulse 5s ease-in-out infinite",
        "stream-flow": "stream-flow 5.5s linear infinite",
        breathe: "breathe 5.2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 5s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        ignite: "ignite 1.5s cubic-bezier(0.22,1,0.36,1) forwards",
        surge: "surge 1.5s ease-out forwards",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
