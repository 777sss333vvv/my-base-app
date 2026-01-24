/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@coinbase/onchainkit/**/*.{js,ts,jsx,tsx,mdx}", // Добавь эту строку!
  ],
  theme: {
    extend: {
      colors: {
        baseBlue: "#0052FF",
      },
    },
  },
  plugins: [],
};