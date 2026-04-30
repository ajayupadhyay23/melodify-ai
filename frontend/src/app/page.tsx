"use client";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import AITutor from "@/components/AITutor";
import FeatureCards from "@/components/FeatureCards";
import StatsBar from "@/components/StatsBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicParticles from "@/components/MusicParticles";

// Dynamic import for 3D scene (no SSR)
const Scene3D = dynamic(() => import("@/components/Scene3D"), {
  ssr: false,
});

const titleWords = "AI Music Theory Trainer".split(" ");

export default function Home() {
  return (
    <>
      {/* 3D Background */}
      <Scene3D />

      {/* Music Note Particles */}
      <MusicParticles />

      {/* Navbar */}
      <Navbar />

      <main
        style={{
          position: "relative",
          zIndex: 5,
          minHeight: "100vh",
          paddingTop: "120px",
          paddingBottom: "40px",
        }}
      >
        {/* ===== HERO SECTION ===== */}
        <section
          style={{
            textAlign: "center",
            padding: "0 24px 60px",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "100px",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              background: "rgba(139, 92, 246, 0.08)",
              marginBottom: "28px",
              fontSize: "13px",
              color: "#c084fc",
              fontWeight: 500,
            }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ✨
            </motion.span>
            Powered by Advanced AI
          </motion.div>

          {/* Main Title - Word-by-word reveal */}
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 900,
              fontFamily: "'Outfit', sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              marginBottom: "20px",
            }}
          >
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30, rotateX: 40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + i * 0.12,
                  ease: [0.23, 1, 0.32, 1],
                }}
                style={{
                  display: "inline-block",
                  marginRight: "14px",
                }}
                className={i >= 1 && i <= 2 ? "gradient-text" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            style={{
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: "560px",
              margin: "0 auto 36px",
              fontWeight: 400,
            }}
          >
            Master notes, scales, and chords with your personal AI music tutor.
            Get instant feedback and learn at your own pace.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "14px",
              marginBottom: "48px",
            }}
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow:
                  "0 8px 30px rgba(139,92,246,0.35), 0 0 60px rgba(139,92,246,0.12)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                document
                  .getElementById("tutor-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-premium"
              style={{ fontSize: "15px" }}
            >
              Start Learning Free →
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
                y: -2,
                borderColor: "rgba(139,92,246,0.5)",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "14px 28px",
                borderRadius: "16px",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                background: "rgba(139, 92, 246, 0.06)",
                color: "var(--text-secondary)",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <StatsBar />
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section style={{ padding: "20px 24px 60px" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            style={{ textAlign: "center", marginBottom: "40px" }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#06d6a0",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Why Choose Us
            </span>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                marginTop: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              Everything You Need to{" "}
              <span className="gradient-text">Master Music</span>
            </h2>
          </motion.div>
          <FeatureCards />
        </section>

        {/* ===== AI TUTOR SECTION ===== */}
        <section id="tutor-section" style={{ padding: "40px 24px" }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", marginBottom: "36px" }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#8b5cf6",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Try It Now
            </span>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 800,
                fontFamily: "'Outfit', sans-serif",
                marginTop: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              Chat with Your{" "}
              <span className="gradient-text">AI Music Tutor</span>
            </h2>
          </motion.div>
          <AITutor />
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
