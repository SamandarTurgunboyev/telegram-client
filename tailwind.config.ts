/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        ".app/**/*.[tsx, jsx, js, ts]",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            container: {
                center: true,
                padding: "1rem",
                screens: {
                    sm: "100%",
                    md: "100%",
                    lg: "1024px",
                    xl: "1280px"
                }
            },
            fontFamily: {
                spaceGrotesk: ["var(--font-spaceGrotesk)", "sans-serif"]
            }
        },
    },
    plugins: [],
}