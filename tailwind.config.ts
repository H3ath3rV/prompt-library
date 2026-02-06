import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1c1e",
        fog: "#f6f6f7",
        mist: "#e9eaee",
        accent: "#0a84ff",
        leaf: "#34c759",
        amber: "#ff9f0a",
        rose: "#ff375f",
        slate: "#8e8e93"
      },
      fontFamily: {
        display: ["SF Pro Display", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        body: ["SF Pro Text", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
