module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Ensures Tailwind applies to all Vue and JS/TS files in src
  ],
  theme: {
    extend: {
      colors: {
        primary: "#d72b3f", // Couchbase red
        secondary: "#fef1db", // Light beige
        brightred: "#ec1018", // Bright Red
        customdark: "#1a1818", // Add your custom color here
        customtext: "#222220", // Custom dark gray
        dark: "#1a1a1a", // Dark gray/black
        header: "#666666", // Subtle grey
        light: "#ffffff", // White
        orange: "#fd9b0b", // Orange
        yellow: "#fef1db", // Yellow
      },
      fontFamily: {
        sans: ["Open Sans", "sans-serif"], // Use Open Sans as the default sans font
      },
    },
  },
  plugins: [],
};
