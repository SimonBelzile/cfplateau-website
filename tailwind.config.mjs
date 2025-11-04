export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
  extend: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    },
    colors: {
      brand: {
        50:"#f3f7ff",100:"#e6efff",200:"#c8dcff",300:"#9fc0ff",
        400:"#6f9bff",500:"#477bff",600:"#2f62f2",700:"#234bd0",
        800:"#1e3da6",900:"#1a3486"
      },
    },
    boxShadow: {
      card: "0 8px 24px rgba(2,6,23,.06)",
      cardHover: "0 16px 40px rgba(2,6,23,.12)",
    },
    borderRadius: { '2xl': '1.25rem' },
    keyframes: {
      in: { '0%':{opacity:0,transform:'translateY(8px) scale(.98)'}, '100%':{opacity:1,transform:'translateY(0) scale(1)'} }
    },
    animation: { in: 'in .35s ease-out both' },
  },
},
  plugins: [],
};