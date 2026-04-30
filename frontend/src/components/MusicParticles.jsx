"use client";
import React, { useEffect, useRef, useState } from "react";

const NOTES = ["♪", "♫", "♬", "♩", "𝄞", "𝄢"];
const COLORS = [
  "rgba(139, 92, 246, 0.6)",
  "rgba(6, 214, 160, 0.5)",
  "rgba(244, 114, 182, 0.5)",
  "rgba(139, 92, 246, 0.4)",
  "rgba(6, 214, 160, 0.3)",
];

function createParticle() {
  return {
    id: Math.random(),
    x: Math.random() * 100,
    y: 100 + Math.random() * 20,
    size: 14 + Math.random() * 22,
    note: NOTES[Math.floor(Math.random() * NOTES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speedY: 0.15 + Math.random() * 0.35,
    speedX: (Math.random() - 0.5) * 0.2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 2,
    opacity: 0,
    phase: Math.random() * Math.PI * 2,
  };
}

export default function MusicParticles() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);
  const frameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Initial particles — only created on client
    const initial = Array.from({ length: 15 }, () => {
      const p = createParticle();
      p.y = Math.random() * 100;
      p.opacity = 0.3 + Math.random() * 0.3;
      return p;
    });
    setParticles(initial);

    const animate = (time) => {
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      spawnTimerRef.current += delta;

      if (spawnTimerRef.current > 800) {
        spawnTimerRef.current = 0;
        setParticles((prev) => [...prev, createParticle()]);
      }

      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y - p.speedY,
            x: p.x + p.speedX + Math.sin(time * 0.001 + p.phase) * 0.05,
            rotation: p.rotation + p.rotationSpeed,
            opacity:
              p.y > 80
                ? Math.min(p.opacity + 0.01, 0.6)
                : p.y < 10
                ? Math.max(p.opacity - 0.01, 0)
                : Math.min(p.opacity + 0.005, 0.5),
          }))
          .filter((p) => p.y > -10)
      );

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [mounted]);

  // Render nothing on server
  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: p.color,
            opacity: p.opacity,
            transform: `rotate(${p.rotation}deg)`,
            willChange: "transform, top, left, opacity",
            filter: p.size > 28 ? "blur(1px)" : "none",
            textShadow: `0 0 10px ${p.color}`,
            userSelect: "none",
          }}
        >
          {p.note}
        </span>
      ))}
    </div>
  );
}
