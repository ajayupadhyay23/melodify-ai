"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicParticles from "@/components/MusicParticles";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";

const Scene3D = dynamic(() => import("@/components/Scene3D"), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

const TOPICS = ["Major Scales", "Minor Scales", "Chords", "Intervals", "Rhythm", "Key Signatures", "Music Notes"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function getSessionId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("melodify_session");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now();
    localStorage.setItem("melodify_session", id);
  }
  return id;
}

function getPlayerName() {
  if (typeof window === "undefined") return "Anonymous";
  return localStorage.getItem("melodify_name") || "Anonymous";
}

export default function QuizPage() {
  const [topic, setTopic] = useState("Major Scales");
  const [level, setLevel] = useState("Beginner");
  const [playerName, setPlayerName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [savingScore, setSavingScore] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const TOTAL_QUESTIONS = 5;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API}/db/quiz/leaderboard`);
      if (res.data.success) setLeaderboard(res.data.data || []);
    } catch {}
  };

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    setShowExplanation(false);
    setError(null);
    try {
      const res = await axios.post(`${API}/ai/quiz`, { level, topic });
      if (res.data.success && res.data.quiz) {
        setQuiz(res.data.quiz);
      } else {
        setError(res.data.error || "The AI is currently busy composing a question. Please try again!");
      }
    } catch (err) {
      console.error("Quiz Fetch Error:", err);
      const detail = err.response?.data?.details || err.message;
      setError(detail.includes("API key") 
        ? "The AI service is temporarily resting. Please try again in a moment." 
        : "Music theory generator is temporarily offline. Let's try again!");
      setQuiz(null);
    }
    setLoading(false);
  }, [level, topic]);

  useEffect(() => {
    if (!mounted) return;
    
    const checkUser = () => {
      if (user?.user_metadata?.full_name) {
        setPlayerName(user.user_metadata.full_name);
        setNameSet(true);
        if (!quiz && !loading && !gameOver) fetchQuiz();
      } else {
        const name = getPlayerName();
        if (name && name !== "Anonymous") {
          setPlayerName(name);
          setNameSet(true);
        }
      }
      fetchLeaderboard();
    };

    checkUser();
  }, [user, mounted, fetchQuiz]);

  const handleStart = () => {
    if (!playerName.trim() && !user) return;
    const finalName = user?.user_metadata?.full_name || playerName.trim();
    if (!user) {
      localStorage.setItem("melodify_name", finalName);
    }
    setPlayerName(finalName);
    setNameSet(true);
    setScore(0);
    setQuestionCount(0);
    setGameOver(false);
    fetchQuiz();
  };

  const handleAnswer = async (option) => {
    if (selected) return;
    setSelected(option);
    setShowExplanation(true);
    const correct = option === quiz.correctAnswer;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    const newCount = questionCount + 1;
    setQuestionCount(newCount);

    if (newCount >= TOTAL_QUESTIONS) {
      setSavingScore(true);
      try {
        await axios.post(`${API}/db/quiz/save`, {
          session_id: getSessionId(),
          player_name: playerName || "Anonymous",
          topic,
          level,
          score: newScore,
          total: TOTAL_QUESTIONS,
        });
        await fetchLeaderboard();
      } catch {}
      setSavingScore(false);
      setTimeout(() => setGameOver(true), 2000);
    }
  };

  const handleNext = () => {
    if (questionCount >= TOTAL_QUESTIONS) {
      setGameOver(true);
    } else {
      fetchQuiz();
    }
  };

  const handleRestart = () => {
    setScore(0);
    setQuestionCount(0);
    setGameOver(false);
    setQuiz(null);
    fetchQuiz();
  };

  const scorePercent = Math.round((score / TOTAL_QUESTIONS) * 100);
  const scoreColor = scorePercent >= 80 ? "#06d6a0" : scorePercent >= 50 ? "#f59e0b" : "#f43f5e";

  if (!mounted) return null;

  return (
    <>
      <Scene3D />
      <MusicParticles />
      <Navbar />
      <main style={{ position: "relative", zIndex: 5, minHeight: "100vh", paddingTop: "120px", paddingBottom: "60px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px" }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#06d6a0", textTransform: "uppercase", letterSpacing: "0.12em" }}>Test Your Knowledge</span>
            <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.04em", marginTop: "8px" }}>
              Music Theory{" "}
              <span className="gradient-text">Quiz</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "10px", fontSize: "16px" }}>
              Answer {TOTAL_QUESTIONS} questions · Save your score · Climb the leaderboard
            </p>
          </motion.div>

          {/* ── NAME ENTRY ── */}
          {!nameSet && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card glow-purple"
              style={{ maxWidth: "480px", margin: "0 auto 40px", padding: "36px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎓</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Enter Your Name</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>Your name will appear on the leaderboard</p>
              <input
                type="text" placeholder="Your name..." value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleStart()}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid rgba(139,92,246,0.3)", background: "rgba(10,10,30,0.6)", color: "#fff", fontSize: "16px", fontFamily: "'Inter', sans-serif", outline: "none", marginBottom: "16px", boxSizing: "border-box" }}
              />

              {/* Topic & Level Pickers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Topic</label>
                  <select value={topic} onChange={e => setTopic(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(139,92,246,0.2)", background: "rgba(10,10,30,0.8)", color: "#fff", fontSize: "13px", outline: "none" }}>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>Level</label>
                  <select value={level} onChange={e => setLevel(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid rgba(139,92,246,0.2)", background: "rgba(10,10,30,0.8)", color: "#fff", fontSize: "13px", outline: "none" }}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <motion.button onClick={handleStart} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} disabled={!playerName.trim()} className="btn-premium" style={{ width: "100%", opacity: playerName.trim() ? 1 : 0.5 }}>
                Start Quiz 🚀
              </motion.button>
            </motion.div>
          )}

          {/* ── GAME OVER ── */}
          {gameOver && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card glow-purple"
              style={{ maxWidth: "480px", margin: "0 auto 40px", padding: "40px", textAlign: "center" }}>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.8, repeat: 2 }} style={{ fontSize: "64px", marginBottom: "16px" }}>
                {scorePercent >= 80 ? "🏆" : scorePercent >= 50 ? "🎵" : "💪"}
              </motion.div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>Quiz Complete!</h2>
              <div style={{ fontSize: "52px", fontWeight: 900, color: scoreColor, fontFamily: "'Outfit', sans-serif", margin: "16px 0" }}>
                {score}/{TOTAL_QUESTIONS}
              </div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>
                {scorePercent >= 80 ? "🌟 Excellent! You're a music theory master!" : scorePercent >= 50 ? "👍 Good job! Keep practicing!" : "📚 Keep studying — you'll get there!"}
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px" }}>
                {savingScore ? "Saving score..." : "✅ Score saved to leaderboard!"}
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <motion.button onClick={handleRestart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn-premium" style={{ flex: 1 }}>
                  Play Again
                </motion.button>
                <motion.button onClick={() => { setNameSet(false); setGameOver(false); setQuiz(null); }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: "14px", borderRadius: "14px", border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.08)", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                  Change Settings
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── QUIZ CARD ── */}
          {nameSet && !gameOver && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>
              <div>
                {/* Progress */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Question {Math.min(questionCount + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}</span>
                    <span style={{ fontSize: "13px", color: "#8b5cf6", fontWeight: 600 }}>Score: {score}</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "99px", background: "rgba(139,92,246,0.15)", overflow: "hidden" }}>
                    <motion.div animate={{ width: `${(questionCount / TOTAL_QUESTIONS) * 100}%` }} style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg, #8b5cf6, #06d6a0)" }} />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {loading && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="glass-card" style={{ textAlign: "center", padding: "60px", minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: "36px" }}>🎵</motion.div>
                      <p style={{ color: "var(--text-secondary)" }}>Generating question…</p>
                    </motion.div>
                  )}

                  {error && !loading && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="glass-card" style={{ textAlign: "center", padding: "40px", border: "1px solid rgba(244,63,94,0.3)" }}>
                      <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
                      <p style={{ color: "#fca5a5", marginBottom: "20px" }}>{error}</p>
                      <motion.button onClick={fetchQuiz} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-premium">
                        Try Again
                      </motion.button>
                    </motion.div>
                  )}

                  {quiz && !loading && (
                    <motion.div key={quiz.question} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass-card glow-purple" style={{ padding: "32px" }}>
                      {/* Topic Badge */}
                      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                        <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: "rgba(139,92,246,0.15)", color: "#c084fc", fontWeight: 600 }}>{topic}</span>
                        <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: "rgba(6,214,160,0.12)", color: "#06d6a0", fontWeight: 600 }}>{level}</span>
                      </div>

                      <h3 style={{ fontSize: "18px", fontWeight: 700, fontFamily: "'Outfit', sans-serif", lineHeight: 1.5, marginBottom: "24px" }}>
                        {quiz.question}
                      </h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {quiz.options.map((opt, i) => {
                          const isCorrect = opt === quiz.correctAnswer;
                          const isSelected = opt === selected;
                          const showResult = selected !== null;
                          let bg = "rgba(30,30,60,0.5)";
                          let border = "1px solid rgba(139,92,246,0.15)";
                          let color = "var(--text-primary)";
                          if (showResult) {
                            if (isCorrect) { bg = "rgba(6,214,160,0.15)"; border = "1px solid rgba(6,214,160,0.4)"; color = "#06d6a0"; }
                            else if (isSelected) { bg = "rgba(244,63,94,0.15)"; border = "1px solid rgba(244,63,94,0.4)"; color = "#f43f5e"; }
                          }
                          return (
                            <motion.button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selected}
                              whileHover={!selected ? { scale: 1.02, x: 4 } : {}}
                              whileTap={!selected ? { scale: 0.98 } : {}}
                              style={{ padding: "14px 18px", borderRadius: "12px", border, background: bg, color, fontSize: "14px", textAlign: "left", cursor: selected ? "default" : "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500, display: "flex", alignItems: "center", gap: "12px", transition: "all 0.3s" }}>
                              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: showResult && isCorrect ? "rgba(6,214,160,0.3)" : showResult && isSelected && !isCorrect ? "rgba(244,63,94,0.3)" : "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                                {showResult ? (isCorrect ? "✓" : isSelected ? "✗" : ["A","B","C","D"][i]) : ["A","B","C","D"][i]}
                              </span>
                              {opt}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <AnimatePresence>
                        {showExplanation && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            style={{ marginTop: "20px", padding: "14px 18px", borderRadius: "12px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                              <strong style={{ color: "#c084fc" }}>💡 </strong>{quiz.explanation}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {selected && questionCount < TOTAL_QUESTIONS && (
                        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                          whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                          className="btn-premium" style={{ width: "100%", marginTop: "20px" }}>
                          Next Question →
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Leaderboard Sidebar */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="glass-card" style={{ padding: "24px" }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  🏅 Leaderboard
                </h3>
                {leaderboard.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>No scores yet. Be the first! 🎯</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {leaderboard.map((entry, i) => (
                      <motion.div key={entry.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: i === 0 ? "rgba(251,191,36,0.1)" : i === 1 ? "rgba(156,163,175,0.08)" : i === 2 ? "rgba(180,83,9,0.08)" : "rgba(139,92,246,0.05)", border: i === 0 ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(139,92,246,0.08)" }}>
                        <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.player_name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{entry.topic}</div>
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: i === 0 ? "#fbbf24" : "#8b5cf6", whiteSpace: "nowrap" }}>
                          {entry.score}/{entry.total}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
