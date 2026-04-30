"use client";
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicParticles from "@/components/MusicParticles";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card glow-purple"
          style={{ maxWidth: "480px", width: "100%", padding: "48px", textAlign: "center" }}>
          
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎵</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", marginBottom: "8px" }}>
            Welcome to <span className="gradient-text">Melodify</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "40px", lineHeight: 1.6 }}>
            Sign in to save your quiz scores, track your progress, and continue your music theory journey.
          </p>

          <motion.button 
            onClick={signInWithGoogle}
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }} 
            style={{ 
              width: "100%", 
              padding: "14px 24px", 
              borderRadius: "14px", 
              background: "#fff", 
              color: "#333", 
              border: "none",
              fontSize: "16px", 
              fontFamily: "'Inter', sans-serif", 
              fontWeight: 600, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              gap: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255,255,255,0.1)"
            }}>
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            Continue with Google
          </motion.button>
          
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "24px" }}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
