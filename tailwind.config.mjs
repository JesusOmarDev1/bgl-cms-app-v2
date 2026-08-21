// @ts-check
const config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
        md: "2rem",
        sm: "1rem",
        xl: "2rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
      },
      screens: {
        lg: "64rem",
        md: "48rem",
        sm: "40rem",
        xl: "80rem",
        "2xl": "86rem",
        "3xl": "96rem",
      },
    },
  },
}

export default config
