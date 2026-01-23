/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",      // Если папка app в корне
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",  // Если папка app внутри src
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
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