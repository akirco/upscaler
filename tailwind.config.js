module.exports = {
  content: ["./index.html", "./src/render/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        selfBorder: "#1e2226",
        selfBgColor: "#282c34",
        dropDownBg: "#272c37",
        menuBg: "#111318",
        menulightBg: "#f9fafb",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
