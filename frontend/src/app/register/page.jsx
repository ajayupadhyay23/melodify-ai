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

export default function RegisterPage() {
  const { signUpWithEmail, user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState("register"); // "register" | "success"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});

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

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.includes("@")) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSubmitting(true);
    setError("");
    const { error: signUpError } = await signUpWithEmail(fullName.trim(), email.trim(), password);
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      // Store password temporarily so OTP page can auto-login after verification
      sessionStorage.setItem("reg_email", email.trim());
      sessionStorage.setItem("reg_pass", password);
      setStep("success");
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: "12px",
    border: `1px solid ${hasError ? "rgba(244,63,94,0.5)" : "rgba(139,92,246,0.2)"}`,
    background: "rgba(10,10,30,0.7)",
    color: "var(--text-primary)",
    fontSize: "15px",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
    boxSizing: "border-box",
  });

  const labelStyle = {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <>
      <Scene3D />
      <MusicParticles />
      <Navbar />

      <main style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 60px" }}>
        <AnimatePresence mode="wait">

          {/* ── REGISTER FORM ── */}
          {step === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
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
                  🎼
                </motion.div>
                <h1 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                  Join <span className="gradient-text">Melodify</span>
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6 }}>
                  Create your account and start your music theory journey. A verification code will be sent to your email.
                </p>
              </div>

              <form onSubmit={handleRegister} noValidate>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

                  {/* Full Name */}
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      id="reg-fullname"
                      type="text"
                      placeholder="e.g. Ajay Kumar"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(139,92,246,0.2)"; e.target.style.boxShadow = "none"; }}
                      style={inputStyle(touched.fullName && !fullName.trim())}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(139,92,246,0.2)"; e.target.style.boxShadow = "none"; }}
                      style={inputStyle(touched.email && !email.includes("@"))}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(139,92,246,0.2)"; e.target.style.boxShadow = "none"; }}
                        style={{ ...inputStyle(touched.password && password.length < 6), paddingRight: "48px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--text-muted)" }}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {password && (
                      <div style={{ marginTop: "6px", display: "flex", gap: "4px" }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: password.length >= i * 3 ? (i <= 2 ? "#f59e0b" : "#06d6a0") : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label style={labelStyle}>Confirm Password</label>
                    <input
                      id="reg-confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "rgba(139,92,246,0.2)"; e.target.style.boxShadow = "none"; }}
                      style={inputStyle(touched.confirmPassword && password !== confirmPassword)}
                    />
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    id="reg-submit"
                    type="submit"
                    whileHover={{ scale: submitting ? 1 : 1.02, y: submitting ? 0 : -2 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={submitting}
                    style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "none", background: submitting ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", fontSize: "15px", fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 4px 20px rgba(139,92,246,0.35)", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    {submitting ? (
                      <>
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>⟳</motion.span>
                        Creating account…
                      </>
                    ) : "Create Account & Send OTP ✨"}
                  </motion.button>
                </div>
              </form>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.15)" }} />
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>OR</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(139,92,246,0.15)" }} />
              </div>

              {/* Sign In Link */}
              <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <a href="/login" style={{ color: "#c084fc", fontWeight: 600, textDecoration: "none" }}>
                  Sign In →
                </a>
              </p>
            </motion.div>
          )}

          {/* ── SUCCESS / CHECK EMAIL ── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="glass-card glow-purple"
              style={{ maxWidth: "480px", width: "100%", padding: "56px 40px", textAlign: "center" }}
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: "72px", marginBottom: "20px" }}
              >
                📧
              </motion.div>
              <h2 style={{ fontSize: "26px", fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", marginBottom: "12px" }}>
                Check Your <span className="gradient-text">Email!</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.7, marginBottom: "8px" }}>
                We sent a <strong style={{ color: "#c084fc" }}>6-digit OTP code</strong> to:
              </p>
              <div style={{ padding: "10px 20px", borderRadius: "10px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", marginBottom: "24px", display: "inline-block" }}>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#c084fc" }}>{email}</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.6, marginBottom: "32px" }}>
                Open the email from <strong>Supabase / Melodify</strong>, copy the 6-digit code, and enter it on the verification page.
              </p>

              <motion.a
                href={`/verify-otp?email=${encodeURIComponent(email.trim())}`}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 32px", borderRadius: "14px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", fontWeight: 700, fontSize: "15px", textDecoration: "none", boxShadow: "0 4px 20px rgba(139,92,246,0.35)" }}
              >
                Enter OTP Code →
              </motion.a>

              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "24px" }}>
                Didn't receive it? Check your spam folder or{" "}
                <button onClick={() => setStep("register")} style={{ background: "none", border: "none", color: "#c084fc", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                  try again
                </button>
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
