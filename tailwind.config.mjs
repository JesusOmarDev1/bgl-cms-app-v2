// @ts-check
const config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: {
        "2xl": "2rem",
        DEFAULT: "1rem",
        lg: "2rem",
        md: "2rem",
        sm: "1rem",
        xl: "2rem",
      },
      screens: {
        "10xl": "100rem",
        "2xl": "86rem",
        lg: "64rem",
        md: "48rem",
        sm: "40rem",
        xl: "80rem",
      },
    },
  },
}

export default config
