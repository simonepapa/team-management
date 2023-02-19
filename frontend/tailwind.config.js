/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        common: "4px 4px 4px rgba(0, 0, 0, 0.25)",
      },
      maxHeight: {
        "75p": "75%",
      },
      maxWidth: {
        "8": "2rem",
        "xxs": "15rem",
        "12": "3rem",
        "75p": "75%",
      },
      width: {
        "33vw": "33vw",
        "35vw": "35vw",
        "45vw": "45vw",
        "70vw": "70vw",
        "90vw": "90vw",
      },
    },
  },
  plugins: [require("daisyui")],
}
