module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Ensures Tailwind applies to all Vue and JS/TS files in src
  ],
  theme: {
    extend: {
      colors: {
        brightred: "#ec1018", // Bright Red
        primary: "#d72b3f", // Couchbase red
        darkred: "#be0000", // Dark Red

        brightpurple: "#6241ff", // Bright Purple
        secondary: "#6644fe", // Directus purple
        darkpurple: "#4e00c8", // Dark Purple

        black: "#121212", // Black
        dark: "#1a1a1a", // Dark gray/black
        light: "#ffffff", // White
        yellow: "#fef1db", // Yellow
        orange: "#fd9b0b", // Orange
        customText: "#222220", // Custom dark gray
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // other plugins
  ],
};
