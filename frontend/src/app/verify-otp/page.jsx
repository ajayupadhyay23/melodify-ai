"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicParticles from "@/components/MusicParticles";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });

function VerifyOTPContent() {
  const { verifyOtp, sendOtp, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  // Password stored by register page so we can auto-login after OTP
  const storedPass = typeof window !== "undefined" ? sessionStorage.getItem("reg_pass") || "" : "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (!loading && user) router.push("/");
  }, [user, loading, router]);

  // Auto-focus first box
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  // Cooldown timer for resend
  const startCooldown = () => {
    setCooldown(60);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };
  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(d => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits."); return; }
    if (!email) { setError("Email not found. Please register again."); return; }

    setSubmitting(true);
    setError("");
    const { error: verifyError, needsLogin } = await verifyOtp(email, storedPass, code);
    setSubmitting(false);

    if (verifyError) {
      const msg = verifyError.message?.toLowerCase() || "";
      if (msg.includes("expired")) {
        setError("This OTP has expired. Please request a new one below.");
      } else if (msg.includes("invalid")) {
        setError("Incorrect OTP code. Please check your email and try again.");
      } else {
        setError(verifyError.message || "Verification failed. Try again.");
      }
      setOtp(["",'',"","","",""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } else {
      // Clear stored credentials
      sessionStorage.removeItem("reg_email");
      sessionStorage.removeItem("reg_pass");
      setSuccess(true);
      if (needsLogin) {
        // Email not confirmed in Supabase yet — redirect to login
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setTimeout(() => router.push("/"), 2500);
      }
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    setResendMsg("");
    setError("");
    const { error: resendError } = await sendOtp(email);
    setResending(false);
    if (resendError) {
      setError("Failed to resend OTP: " + resendError.message);
    } else {
      setResendMsg("✅ New OTP sent! Check your inbox (and spam folder).");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      startCooldown();
    }
  };

  if (loading || user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a1a" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Scene3D />
      <MusicParticles />
      <Navbar />

      <main style={{ position: "relative", zIndex: 5, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 60px" }}>
        <AnimatePresence mode="wait">

          {!success ? (
            <motion.div
              key="otp-form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="glass-card glow-purple"
              style={{ maxWidth: "480px", width: "100%", padding: "48px 40px", textAlign: "center" }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: "60px", marginBottom: "20px" }}
              >
                🔐
              </motion.div>

              <h1 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", marginBottom: "10px" }}>
                Verify Your <span className="gradient-text">Email</span>
              </h1>

              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7, marginBottom: "8px" }}>
                Enter the <strong style={{ color: "#c084fc" }}>6-digit code</strong> sent to:
              </p>
              <div style={{ padding: "8px 20px", borderRadius: "10px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", marginBottom: "10px", display: "inline-block" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#c084fc" }}>{email || "your email"}</span>
              </div>

              {/* Tip */}
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.5 }}>
                💡 Check your <strong>spam/junk folder</strong> if you don't see it. The code expires in 10 minutes.
              </p>

              {/* OTP Boxes */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
                {otp.map((digit, i) => (
                  <motion.input
                    key={i}
                    id={`otp-digit-${i}`}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    whileFocus={{ scale: 1.08 }}
                    style={{
                      width: "52px", height: "60px", borderRadius: "14px",
                      border: digit ? "2px solid rgba(139,92,246,0.7)" : "2px solid rgba(139,92,246,0.2)",
                      background: digit ? "rgba(139,92,246,0.15)" : "rgba(10,10,30,0.7)",
                      color: "var(--text-primary)", fontSize: "26px", fontWeight: 800,
                      fontFamily: "'Outfit', sans-serif", textAlign: "center", outline: "none",
                      cursor: "text", transition: "all 0.2s",
                      boxShadow: digit ? "0 0 14px rgba(139,92,246,0.25)" : "none",
                    }}
                  />
                ))}
              </div>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "24px" }}>
                {otp.map((digit, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: digit ? 1.2 : 1, background: digit ? "#8b5cf6" : "rgba(139,92,246,0.2)" }}
                    transition={{ duration: 0.15 }}
                    style={{ width: "7px", height: "7px", borderRadius: "50%" }}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#fca5a5", fontSize: "13px", marginBottom: "16px", textAlign: "left" }}
                  >
                    ⚠️ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Resend success */}
              <AnimatePresence>
                {resendMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(6,214,160,0.1)", border: "1px solid rgba(6,214,160,0.25)", color: "#6ee7b7", fontSize: "13px", marginBottom: "16px", textAlign: "left" }}
                  >
                    {resendMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify Button */}
              <motion.button
                id="otp-verify-btn"
                whileHover={{ scale: submitting ? 1 : 1.03, y: submitting ? 0 : -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleVerify}
                disabled={submitting || otp.join("").length < 6}
                style={{
                  width: "100%", padding: "14px", borderRadius: "14px", border: "none",
                  background: otp.join("").length < 6 || submitting ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                  color: otp.join("").length < 6 || submitting ? "var(--text-muted)" : "#fff",
                  fontSize: "15px", fontWeight: 700, fontFamily: "'Inter', sans-serif",
                  cursor: otp.join("").length < 6 || submitting ? "not-allowed" : "pointer",
                  boxShadow: otp.join("").length === 6 && !submitting ? "0 4px 20px rgba(139,92,246,0.35)" : "none",
                  transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  marginBottom: "16px",
                }}
              >
                {submitting ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ display: "inline-block" }}>⟳</motion.span>
                    Verifying…
                  </>
                ) : "Verify & Sign In 🎵"}
              </motion.button>

              {/* Resend */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Didn't receive it?</span>
                <button
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  style={{
                    background: "none", border: "none", cursor: cooldown > 0 ? "not-allowed" : "pointer",
                    color: cooldown > 0 ? "var(--text-muted)" : "#c084fc",
                    fontSize: "13px", fontWeight: 600, padding: 0,
                  }}
                >
                  {resending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>

              <div style={{ marginTop: "12px" }}>
                <a href="/register" style={{ fontSize: "12px", color: "var(--text-muted)", textDecoration: "none" }}>
                  ← Back to Register
                </a>
              </div>
            </motion.div>

          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="glass-card"
              style={{ maxWidth: "420px", width: "100%", padding: "56px 40px", textAlign: "center" }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ fontSize: "72px", marginBottom: "20px" }}
              >
                🎉
              </motion.div>
              <h2 style={{ fontSize: "26px", fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", marginBottom: "10px" }}>
                Welcome to <span className="gradient-text">Melodify!</span>
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.7 }}>
                Email verified! Redirecting you to the app…
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "linear" }}
                style={{ height: "3px", background: "linear-gradient(90deg,#8b5cf6,#06d6a0)", borderRadius: "2px", marginTop: "28px" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a1a" }}>
        <div style={{ color: "#a0a0c0" }}>Loading…</div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
