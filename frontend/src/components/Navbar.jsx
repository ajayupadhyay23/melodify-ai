"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 32px",
        height: "72px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled
          ? "rgba(5, 5, 16, 0.85)"
          : "rgba(5, 5, 16, 0.3)",
        backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(139, 92, 246, 0.08)"
          : "1px solid transparent",
        transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #8b5cf6, #06d6a0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)",
          }}
        >
          🎵
        </div>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.03em",
          }}
        >
          <span className="gradient-text">Melodify</span>
          <span
            style={{
              fontSize: "10px",
              color: "#606080",
              marginLeft: "6px",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            AI
          </span>
        </span>
      </motion.div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <NavLink label="Home" href="/" />
        <NavLink label="Quiz 🎯" href="/quiz" />
        <NavLink label="Progress 📊" href="/progress" />

        {user ? (
          <div style={{ position: "relative", marginLeft: "12px" }}>
            <motion.div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "4px 12px 4px 4px",
                borderRadius: "20px",
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <img 
                src={user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=User&background=random"} 
                alt="Profile"
                style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff" }}>
                {user.user_metadata?.full_name?.split(' ')[0] || "User"}
              </span>
            </motion.div>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "160px",
                    background: "rgba(15, 15, 25, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    borderRadius: "12px",
                    padding: "8px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    zIndex: 1000
                  }}
                >
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: "4px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, margin: 0, color: "#fff" }}>{user.user_metadata?.full_name}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut();
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      background: "transparent",
                      border: "none",
                      color: "#f43f5e",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "rgba(244, 63, 94, 0.1)"}
                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                  >
                    Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.button
            onClick={() => router.push("/login")}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              marginLeft: "8px",
              padding: "9px 22px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Sign In
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
}

// Separate component to avoid framer-motion CSS variable animation issue
function NavLink({ label, href = "#" }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "8px 16px",
        fontSize: "13px",
        fontWeight: 500,
        color: hovered ? "#ffffff" : "#a0a0c0",
        background: hovered ? "rgba(139, 92, 246, 0.1)" : "transparent",
        cursor: "pointer",
        borderRadius: "8px",
        transition: "all 0.3s",
        textDecoration: "none",
      }}
    >
      {label}
    </a>
  );
}
