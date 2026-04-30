"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

export default function AudioVisualizer({ isActive = false }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deterministic bar data — no Math.random()
  const barData = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      baseHeight: 8 + Math.sin(i * 0.5) * 6,
      activeExtra1: 15 + ((i * 7 + 3) % 20),
      activeExtra2: 25 + ((i * 13 + 7) % 10),
      randomDur: 0.8 + ((i * 11 + 5) % 50) / 100,
      idleDur: 2 + ((i * 17 + 3) % 100) / 100,
      idleExtra: 4 + Math.sin(i * 0.3) * 3,
    }));
  }, []);

  // Don't render on server — prevents hydration mismatch entirely
  if (!mounted) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "2px",
          height: "40px",
          padding: "0 4px",
          width: "200px",
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "2px",
        height: "40px",
        padding: "0 4px",
      }}
    >
      {barData.map((bar, i) => {
        const delay = i * 0.04;
        const color =
          i < 16
            ? ["#8b5cf6", "#c084fc", "rgba(139,92,246,0.4)"]
            : i < 32
            ? ["#06d6a0", "#34d399", "rgba(6,214,160,0.4)"]
            : ["#f472b6", "#fb7185", "rgba(244,114,182,0.4)"];

        return (
          <motion.div
            key={i}
            animate={
              isActive
                ? {
                    height: [
                      bar.baseHeight,
                      bar.baseHeight + bar.activeExtra1,
                      bar.baseHeight + 5,
                      bar.baseHeight + bar.activeExtra2,
                      bar.baseHeight,
                    ],
                  }
                : {
                    height: [
                      bar.baseHeight,
                      bar.baseHeight + bar.idleExtra,
                      bar.baseHeight,
                    ],
                  }
            }
            transition={{
              duration: isActive ? bar.randomDur : bar.idleDur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            }}
            style={{
              width: 3,
              borderRadius: 2,
              background: `linear-gradient(to top, ${color[0]}, ${color[1]})`,
              opacity: 0.7 + (i % 3) * 0.1,
              boxShadow: isActive ? `0 0 8px ${color[2]}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}
