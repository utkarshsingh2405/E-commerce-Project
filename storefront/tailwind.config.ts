import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF8",
        surface: {
          DEFAULT: "#FFFFFF",
          sunken: "#F2F1ED",
        },
        border: {
          DEFAULT: "#E5E4E0",
          strong: "#D3D1CB",
        },
        text: {
          primary: "#171714",
          secondary: "#6B6A64",
          disabled: "#A8A69F",
        },
        accent: {
          DEFAULT: "#14464A",
          hover: "#0D3437",
          tint: "#E3EEEE",
        },
        success: {
          DEFAULT: "#3F6B4A",
          tint: "#E9F1EA",
        },
        warning: {
          DEFAULT: "#8A6A1F",
          tint: "#F6EEDA",
        },
        error: {
          DEFAULT: "#A33B2E",
          tint: "#FBEAE6",
        },
      },
      fontFamily: {
        sans: ['"General Sans"', "sans-serif"],
        mono: ['var(--font-jetbrains-mono)', '"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        lg: "8px",
        "2xl": "16px",
      },
      boxShadow: {
        tinted: "0 12px 24px -8px rgba(23, 23, 20, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
