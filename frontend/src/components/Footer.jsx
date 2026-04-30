"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

function FooterLink({ label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: "12px",
        color: hovered ? "#c084fc" : "#606080",
        cursor: "pointer",
        textDecoration: "none",
        fontWeight: 500,
        transition: "color 0.3s",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      {label}
    </a>
  );
}

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      style={{
        position: "relative",
        zIndex: 10,
        padding: "48px 32px 32px",
        borderTop: "1px solid rgba(139, 92, 246, 0.08)",
        marginTop: "60px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "18px" }}>🎵</span>
            <span
              className="gradient-text"
              style={{
                fontSize: "16px",
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Melodify AI
            </span>
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#606080",
              maxWidth: "300px",
              lineHeight: 1.6,
            }}
          >
            Master music theory with the power of artificial intelligence.
            Learn, practice, and grow.
          </p>
        </div>

        <div style={{ display: "flex", gap: "32px" }}>
          {["Privacy", "Terms", "Contact"].map((link) => (
            <FooterLink key={link} label={link} />
          ))}
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(139, 92, 246, 0.05)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "#606080",
            letterSpacing: "0.04em",
          }}
        >
          © 2026 Melodify AI. Crafted with ♡ for music lovers.
        </p>
      </div>
    </motion.footer>
  );
}
