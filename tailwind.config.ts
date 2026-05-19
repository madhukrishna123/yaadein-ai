import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080706",
        coal: "#14110f",
        ash: "#25211d",
        heirloom: "#d8b46a",
        roseglass: "#c9857a",
        mintglass: "#8ad7b5"
      },
      boxShadow: {
        glow: "0 0 60px rgba(216, 180, 106, 0.16)",
        glass: "0 24px 80px rgba(0, 0, 0, 0.38)"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
