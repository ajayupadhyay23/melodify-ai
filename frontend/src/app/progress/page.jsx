"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicParticles from "@/components/MusicParticles";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

function getSessionId() {
  if (typeof window === "undefined") return "server";
  return localStorage.getItem("melodify_session") || "unknown";
}

export default function ProgressPage() {
  const [chatHistory, setChatHistory] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (authLoading) return;

    const sessionId = getSessionId();
    Promise.all([
      axios.get(`${API}/db/chat/history?session_id=${sessionId}`).catch(() => ({ data: { data: [] } })),
      axios.get(`${API}/db/quiz/stats?session_id=${sessionId}`).catch(() => ({ data: { data: [] } })),
      axios.get(`${API}/db/stats`).catch(() => ({ data: { stats: null } })),
    ]).then(([chat, quiz, stats]) => {
      setChatHistory(chat.data.data || []);
      setQuizResults(quiz.data.data || []);
      setGlobalStats(stats.data.stats || null);
      setLoading(false);
    });
  }, [user, authLoading, router]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  const avgScore = quizResults.length
    ? Math.round(quizResults.reduce((a, r) => a + (r.score / r.total) * 100, 0) / quizResults.length)
    : 0;

  const bestScore = quizResults.length
    ? Math.max(...quizResults.map(r => Math.round((r.score / r.total) * 100)))
    : 0;

  const topicMap = quizResults.reduce((acc, r) => {
    acc[r.topic] = (acc[r.topic] || 0) + 1;
    return acc;
  }, {});
  const favTopic = Object.entries(topicMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "chats", label: "Chat History", icon: "💬" },
    { id: "quizzes", label: "Quiz Results", icon: "🎯" },
    { id: "platform", label: "Platform Stats", icon: "🌍" },
  ];

  if (!mounted) return null;

  return (
    <>
      <Scene3D />
      <MusicParticles />
      <Navbar />
      <main style={{ position: "relative", zIndex: 5, minHeight: "100vh", paddingTop: "120px", paddingBottom: "60px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#f472b6", textTransform: "uppercase", letterSpacing: "0.12em" }}>Your Journey</span>
            <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.04em", marginTop: "8px" }}>
              Learning{" "}
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "10px", fontSize: "16px" }}>
              Track your progress, review your chats, and see how far you've come.
            </p>
          </motion.div>

          {/* Tab Nav */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: "flex", gap: "8px", marginBottom: "32px", overflowX: "auto", paddingBottom: "4px" }}>
            {tabs.map(tab => (
              <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "10px 20px", borderRadius: "12px", border: activeTab === tab.id ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(139,92,246,0.15)", background: activeTab === tab.id ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.05)", color: activeTab === tab.id ? "#c084fc" : "var(--text-muted)", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.3s" }}>
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {loading ? (
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontSize: "16px" }}>
              🎵 Loading your data…
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW TAB ── */}
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                    {[
                      { label: "Questions Asked", value: chatHistory.length, icon: "💬", color: "#8b5cf6" },
                      { label: "Quizzes Taken", value: quizResults.length, icon: "🎯", color: "#06d6a0" },
                      { label: "Avg Score", value: `${avgScore}%`, icon: "📈", color: "#f472b6" },
                      { label: "Best Score", value: `${bestScore}%`, icon: "🏆", color: "#fbbf24" },
                      { label: "Fav Topic", value: favTopic, icon: "🎼", color: "#34d399", small: true },
                    ].map((stat, i) => (
                      <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                        className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
                        <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
                        <div style={{ fontSize: stat.small ? "16px" : "28px", fontWeight: 800, color: stat.color, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>{stat.value}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {quizResults.length === 0 && chatHistory.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card"
                      style={{ textAlign: "center", padding: "60px" }}>
                      <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎓</div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>No data yet!</h3>
                      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Start chatting with the AI Tutor or take a Quiz to see your progress here.</p>
                      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                        <a href="/" style={{ padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>Ask AI Tutor</a>
                        <a href="/quiz" style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid rgba(139,92,246,0.3)", color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>Take a Quiz</a>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── CHAT HISTORY TAB ── */}
              {activeTab === "chats" && (
                <motion.div key="chats" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                  {chatHistory.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: "center", padding: "60px" }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
                      <p style={{ color: "var(--text-secondary)" }}>No chat history yet. Go ask the AI Tutor!</p>
                      <a href="/" style={{ display: "inline-block", marginTop: "16px", padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>Go to AI Tutor →</a>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {chatHistory.map((chat, i) => (
                        <motion.div key={chat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          className="glass-card" style={{ padding: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                            <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "20px", background: "rgba(139,92,246,0.15)", color: "#c084fc", fontWeight: 600 }}>{chat.topic || "General"}</span>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(chat.created_at).toLocaleString()}</span>
                          </div>
                          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(139,92,246,0.1)", marginBottom: "10px" }}>
                            <p style={{ fontSize: "14px", color: "#c084fc", fontWeight: 600, margin: "0 0 2px" }}>You asked:</p>
                            <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>{chat.user_message}</p>
                          </div>
                          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(6,214,160,0.06)", border: "1px solid rgba(6,214,160,0.1)" }}>
                            <p style={{ fontSize: "14px", color: "#06d6a0", fontWeight: 600, margin: "0 0 2px" }}>🎵 AI Tutor:</p>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6, maxHeight: "80px", overflow: "hidden", textOverflow: "ellipsis" }}>{chat.ai_reply}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── QUIZ RESULTS TAB ── */}
              {activeTab === "quizzes" && (
                <motion.div key="quizzes" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                  {quizResults.length === 0 ? (
                    <div className="glass-card" style={{ textAlign: "center", padding: "60px" }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
                      <p style={{ color: "var(--text-secondary)" }}>No quiz results yet. Take a quiz!</p>
                      <a href="/quiz" style={{ display: "inline-block", marginTop: "16px", padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>Start Quiz →</a>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {quizResults.map((result, i) => {
                        const pct = Math.round((result.score / result.total) * 100);
                        const color = pct >= 80 ? "#06d6a0" : pct >= 50 ? "#f59e0b" : "#f43f5e";
                        return (
                          <motion.div key={result.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: `${color}22`, border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color, flexShrink: 0 }}>{pct}%</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#c084fc" }}>{result.topic}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "1px 8px", borderRadius: "20px", border: "1px solid rgba(139,92,246,0.15)" }}>{result.level}</span>
                              </div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                Score: {result.score}/{result.total} · {new Date(result.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div style={{ fontSize: "24px" }}>
                              {pct >= 80 ? "🏆" : pct >= 50 ? "🎵" : "💪"}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── PLATFORM STATS TAB ── */}
              {activeTab === "platform" && (
                <motion.div key="platform" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                  {globalStats ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                      {[
                        { label: "Total AI Chats", value: globalStats.total_chats, icon: "💬", color: "#8b5cf6", desc: "Questions answered across all users" },
                        { label: "Quizzes Completed", value: globalStats.total_quizzes, icon: "🎯", color: "#06d6a0", desc: "Total quiz sessions completed" },
                        { label: "Active Learners", value: globalStats.active_learners, icon: "🌍", color: "#f472b6", desc: "Unique users on the platform" },
                      ].map((s, i) => (
                        <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                          className="glass-card" style={{ padding: "28px", textAlign: "center" }}>
                          <div style={{ fontSize: "36px", marginBottom: "12px" }}>{s.icon}</div>
                          <div style={{ fontSize: "42px", fontWeight: 900, color: s.color, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.03em" }}>{s.value}</div>
                          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginTop: "8px" }}>{s.label}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>{s.desc}</div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card" style={{ textAlign: "center", padding: "60px" }}>
                      <p style={{ color: "var(--text-muted)" }}>Could not fetch platform stats. Make sure the backend is running.</p>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
