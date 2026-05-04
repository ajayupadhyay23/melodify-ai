"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Google OAuth ──
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) console.error("Error signing in with Google:", error.message);
  };

  // ── Register: Create account in Supabase + send OTP via our backend ──
  const signUpWithEmail = async (fullName, email, password) => {
    // Step 1: Create Supabase account (email confirmation may be ON or OFF)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) return { data: null, error: signUpError };

    // Step 2: Send 6-digit OTP via our own backend (Nodemailer/Gmail)
    const res = await fetch(`${API}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();

    if (!result.success) {
      return { data: null, error: { message: result.error || "Failed to send OTP email" } };
    }

    return { data, error: null };
  };

  // ── Resend OTP via backend ──
  const sendOtp = async (email) => {
    const res = await fetch(`${API}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await res.json();
    if (!result.success) return { error: { message: result.error } };
    return { error: null };
  };

  // ── Verify OTP via backend, then sign user in ──
  const verifyOtp = async (email, password, code) => {
    // Step 1: Verify our custom OTP
    const res = await fetch(`${API}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const result = await res.json();

    if (!result.success) {
      return { error: { message: result.error || "Invalid OTP" } };
    }

    // Step 2: OTP verified — sign the user in with their password
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      // If login fails (e.g. email not confirmed in Supabase), still return success
      // The user can sign in on the login page
      return { data: null, error: null, needsLogin: true };
    }

    return { data, error: null };
  };

  // ── Email + Password Login ──
  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, sendOtp, verifyOtp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
