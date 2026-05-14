/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#020617",
        panel: "#0F172A",
        blue: {
          premium: "#2563EB"
        },
        gold: "#FACC15",
        orange: {
          cta: "#F97316"
        },
        green: {
          success: "#10B981"
        },
        mist: "#94A3B8",
        snow: "#F8FAFC"
      },
      boxShadow: {
        glow: "0 0 34px rgba(37, 99, 235, 0.35)",
        gold: "0 0 30px rgba(250, 204, 21, 0.22)",
        glass: "0 24px 70px rgba(0, 0, 0, 0.35)"
      },
      fontFamily: {
        display: ["Poppins", "Inter", "sans-serif"],
        body: ["Inter", "Roboto", "sans-serif"]
      },
      backgroundImage: {
        "aurora": "radial-gradient(circle at 15% 15%, rgba(37, 99, 235, 0.28), transparent 32rem), radial-gradient(circle at 85% 5%, rgba(249, 115, 22, 0.22), transparent 28rem), radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.14), transparent 34rem)"
      }
    }
  },
  plugins: []
};
