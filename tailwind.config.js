module.exports = {
  content: ["./index.html", "./src/render/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        selfBorder: "#1e2226",
        selfBgColor: "#282c34",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
