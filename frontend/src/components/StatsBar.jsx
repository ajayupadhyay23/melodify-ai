"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stats = [
  { label: "Music Topics", value: 150, suffix: "+", color: "#8b5cf6" },
  { label: "Practice Exercises", value: 500, suffix: "+", color: "#06d6a0" },
  { label: "Active Learners", value: 10, suffix: "K+", color: "#f472b6" },
];

function AnimatedCounter({ value, suffix, duration = 2 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = value / (duration * 60);
    const interval = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [hasStarted, value, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "48px",
        padding: "24px 0",
        position: "relative",
        zIndex: 10,
      }}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4 + i * 0.15, duration: 0.5 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              color: stat.color,
              letterSpacing: "-0.02em",
              textShadow: `0 0 30px ${stat.color}55`,
            }}
          >
            <AnimatedCounter
              value={stat.value}
              suffix={stat.suffix}
              duration={1.5 + i * 0.3}
            />
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              fontWeight: 500,
              marginTop: "4px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
