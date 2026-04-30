"use client";
import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    icon: "🧠",
    title: "AI-Powered Learning",
    description:
      "Personalized music theory lessons powered by advanced AI that adapts to your skill level in real-time.",
    gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    glow: "rgba(139, 92, 246, 0.15)",
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  {
    icon: "🎹",
    title: "Interactive Practice",
    description:
      "Engage with scales, chords, and progressions through interactive exercises and instant feedback.",
    gradient: "linear-gradient(135deg, #06d6a0, #059669)",
    glow: "rgba(6, 214, 160, 0.15)",
    borderColor: "rgba(6, 214, 160, 0.2)",
  },
  {
    icon: "📊",
    title: "Progress Analytics",
    description:
      "Track your learning journey with detailed analytics, streaks, and achievement milestones.",
    gradient: "linear-gradient(135deg, #f472b6, #db2777)",
    glow: "rgba(244, 114, 182, 0.15)",
    borderColor: "rgba(244, 114, 182, 0.2)",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, rotateX: 15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] },
  },
};

export default function FeatureCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        perspective: "1200px",
        position: "relative",
        zIndex: 10,
      }}
    >
      {features.map((feature, i) => (
        <motion.div
          key={i}
          variants={cardVariants}
          whileHover={{
            y: -8,
            rotateY: 5,
            rotateX: -3,
            scale: 1.02,
            transition: { duration: 0.4 },
          }}
          style={{
            padding: "28px 24px",
            borderRadius: "20px",
            background: "rgba(15, 15, 40, 0.5)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${feature.borderColor}`,
            cursor: "default",
            transformStyle: "preserve-3d",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 0%, ${feature.glow}, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          {/* Top highlight line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "20%",
              right: "20%",
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${feature.borderColor}, transparent)`,
            }}
          />

          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: feature.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              marginBottom: "18px",
              boxShadow: `0 4px 15px ${feature.glow}`,
              position: "relative",
              zIndex: 1,
            }}
          >
            {feature.icon}
          </motion.div>

          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              marginBottom: "8px",
              letterSpacing: "-0.01em",
              position: "relative",
              zIndex: 1,
            }}
          >
            {feature.title}
          </h3>

          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.65,
              margin: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            {feature.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
