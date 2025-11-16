/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Font families - for autocomplete suggestions
      fontFamily: {
        aileron: ["var(--font-family-aileron)", "sans-serif"],
        brimful: ["var(--font-family-brimful)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      // Colors - Using CSS variables for shadcn compatibility + autocomplete
      // These reference the CSS variables defined in globals.css
      colors: {
        // shadcn/ui colors - reference CSS variables
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
          // Brand primary color: #0D3B66 (dark blue)
          brand: "#0D3B66",
          // Shade scale for primary (#0D3B66)
          50: "#E8F0F7",
          100: "#C4D9EA",
          200: "#9BBFDC",
          300: "#72A5CE",
          400: "#4A8BC0",
          500: "#0D3B66", // Base color
          600: "#0A2F52",
          700: "#08243D",
          800: "#051829",
          900: "#030C14",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
          // Shade scale based on brand light (#F3FCF0)
          50: "#FDFEFD",
          100: "#FBFDFA",
          200: "#F8FBF6",
          300: "#F5F9F2",
          400: "#F2F7EE",
          500: "#F3FCF0", // Base color
          600: "#C9D0C7",
          700: "#9FA49E",
          800: "#757875",
          900: "#4B4C4B",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
          // Brand accent color: #9381FF (purple)
          brand: "#9381FF",
          // Shade scale for accent (#9381FF)
          50: "#F5F3FF",
          100: "#E8E3FF",
          200: "#D6CCFF",
          300: "#C4B5FF",
          400: "#B29EFF",
          500: "#9381FF", // Base color
          600: "#7666CC",
          700: "#594C99",
          800: "#3B3366",
          900: "#1E1933",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        // Brand color aliases for direct access
        brand: {
          primary: "#0D3B66",
          accent: "#9381FF",
          light: "#F3FCF0",
          dark: "#03000A",
        },
        // Status colors - using brand colors where appropriate
        success: {
          DEFAULT: "#11B95C",
          foreground: "#FFFFFF",
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#11B95C",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        warning: {
          DEFAULT: "#F49E00",
          foreground: "#FFFFFF",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F49E00",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        error: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        info: {
          DEFAULT: "#0D3B66", // Using brand primary
          foreground: "#F3FCF0", // Using brand light
          50: "#E8F0F7",
          100: "#C4D9EA",
          200: "#9BBFDC",
          300: "#72A5CE",
          400: "#4A8BC0",
          500: "#0D3B66",
          600: "#0A2F52",
          700: "#08243D",
          800: "#051829",
          900: "#030C14",
        },
        gray: {
          DEFAULT: "#6B7280",
          foreground: "#03000A", // Brand dark
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        // Sidebar colors (if using shadcn sidebar components)
        sidebar: {
          DEFAULT: "var(--color-sidebar)",
          foreground: "var(--color-sidebar-foreground)",
          primary: "var(--color-sidebar-primary)",
          "primary-foreground": "var(--color-sidebar-primary-foreground)",
          accent: "var(--color-sidebar-accent)",
          "accent-foreground": "var(--color-sidebar-accent-foreground)",
          border: "var(--color-sidebar-border)",
          ring: "var(--color-sidebar-ring)",
        },
        // Chart colors (if using charts)
        chart: {
          1: "var(--color-chart-1)",
          2: "var(--color-chart-2)",
          3: "var(--color-chart-3)",
          4: "var(--color-chart-4)",
          5: "var(--color-chart-5)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
};