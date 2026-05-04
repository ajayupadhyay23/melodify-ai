"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicParticles from "@/components/MusicParticles";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.push("/");
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a1a" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setSubmitting(true);
    setError("");
    const { error: loginError } = await signInWithEmail(email, password);
    setSubmitting(false);
    if (loginError) {
      if (loginError.message?.toLowerCase().includes("email not confirmed")) {
        setError("Your email is not verified yet. Check your inbox for the OTP code.");
      } else if (loginError.message?.toLowerCase().includes("invalid")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(loginError.message);
      }
    }
    // On success, onAuthStateChange will set user and useEffect will redirect
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(139,92,246,0.2)",
    background: "rgba(10,10,30,0.7)",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
    boxSizing: "border-box",
  };

  return (
    <>
      <Scene3D />
      <MusicParticles />
      <Navbar />

      <main style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 60px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card glow-purple"
          style={{ maxWidth: "480px", width: "100%", padding: "48px 40px" }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: "52px", marginBottom: "14px" }}
            >
              🎵
            </motion.div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", marginBottom: "8px" }}>
              Welcome to <span className="gradient-text">Melodify</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6 }}>
              Sign in to save your quiz scores, track your progress, and continue your music theory journey.
            </p>
          </div>

          {/* Google Sign In */}
          <motion.button
            id="google-signin-btn"
            onClick={signInWithGoogle}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: "100%", padding: "13px 24px", borderRadius: "14px", background: "#fff", color: "#333", border: "none", fontSize: "15px", fontFamily: "'Inter', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", cursor: "pointer", boxShadow: "0 4px 12px rgba(255,255,255,0.1)", marginBottom: "20px" }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.15)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>OR SIGN IN WITH EMAIL</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.15)" }} />
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(139,92,246,0.2)"; e.target.style.boxShadow = "none"; }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(139,92,246,0.2)"; e.target.style.boxShadow = "none"; }}
                    style={{ ...inputStyle, paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--text-muted)" }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#fca5a5", fontSize: "13px", lineHeight: 1.5 }}
                  >
                    ⚠️ {error}
                    {error.includes("not verified") && (
                      <> {" "}<a href={`/verify-otp?email=${encodeURIComponent(email)}`} style={{ color: "#c084fc", fontWeight: 600, textDecoration: "none" }}>Enter OTP →</a></>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                id="login-submit-btn"
                type="submit"
                whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -2 }}
                whileTap={{ scale: 0.97 }}
                disabled={submitting}
                style={{ width: "100%", padding: "13px", borderRadius: "14px", border: "none", background: submitting ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 4px 20px rgba(139,92,246,0.35)", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                {submitting ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>⟳</motion.span>
                    Signing in…
                  </>
                ) : "Sign In →"}
              </motion.button>
            </div>
          </form>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)", marginTop: "24px" }}>
            New to Melodify?{" "}
            <a href="/register" style={{ color: "#c084fc", fontWeight: 600, textDecoration: "none" }}>
              Create an account →
            </a>
          </p>

          <p style={{ color: "var(--text-muted)", fontSize: "12px", textAlign: "center", marginTop: "16px" }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
