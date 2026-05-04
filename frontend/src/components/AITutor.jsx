"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import AudioVisualizer from "./AudioVisualizer";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";

function getSessionId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("melodify_session");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now();
    localStorage.setItem("melodify_session", id);
  }
  return id;
}

function detectTopic(text) {
  const t = text.toLowerCase();
  if (t.includes("chord")) return "Chords";
  if (t.includes("scale")) return "Scales";
  if (t.includes("note")) return "Notes";
  if (t.includes("rhythm") || t.includes("beat") || t.includes("tempo")) return "Rhythm";
  if (t.includes("key signature")) return "Key Signatures";
  if (t.includes("interval")) return "Intervals";
  return "General";
}

const suggestedQuestions = [
  { icon: "🎹", text: "What is a C Major chord?", color: "#8b5cf6" },
  { icon: "🎸", text: "Explain pentatonic scales", color: "#06d6a0" },
  { icon: "🎵", text: "How do key signatures work?", color: "#f472b6" },
  { icon: "🥁", text: "What is syncopation?", color: "#8b5cf6" },
];

const TypingIndicator = () => (
  <div style={{ display: "flex", gap: "6px", padding: "8px 0" }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -8, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.15,
          ease: "easeInOut",
        }}
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8b5cf6, #06d6a0)",
        }}
      />
    ))}
  </div>
);

export default function AITutor() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askTutor = async (customQuestion) => {
    const q = customQuestion || question;
    if (!q.trim()) return;

    const userMsg = { 
      role: "user", 
      text: q, 
      id: Date.now(), 
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/ai/tutor`, {
        prompt: q,
        context: "Beginner",
      });
      const aiMsg = {
        role: "ai",
        text: response.data.reply,
        id: Date.now() + 1,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Save to Supabase (fire-and-forget)
      axios.post(`${API}/db/chat/save`, {
        session_id: getSessionId(),
        user_message: q,
        ai_reply: response.data.reply,
        topic: detectTopic(q),
      }).catch(() => {});
    } catch (err) {
      const errMsg = {
        role: "ai",
        text: "I had trouble connecting to the server. Please check if the backend is running and try again!",
        id: Date.now() + 1,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askTutor();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
      className="glass-card glow-purple"
      style={{
        padding: 0,
        width: "100%",
        maxWidth: "720px",
        margin: "0 auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 28px 16px",
          borderBottom: "1px solid rgba(139, 92, 246, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Pulsing AI avatar */}
          <div style={{ position: "relative" }}>
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.15, 0.4],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: "-6px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(6,214,160,0.3))",
                filter: "blur(6px)",
              }}
            />
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8b5cf6, #06d6a0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                position: "relative",
                boxShadow: "0 0 20px rgba(139,92,246,0.3)",
              }}
            >
              🎵
            </div>
          </div>
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              AI Music Tutor
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "2px",
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#06d6a0",
                  boxShadow: "0 0 8px rgba(6,214,160,0.6)",
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                Online • Ready to teach
              </span>
            </div>
          </div>
        </div>
        <AudioVisualizer isActive={loading} />
      </div>

      {/* Chat Area */}
      <div
        style={{
          height: "360px",
          overflowY: "auto",
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Welcome message */}
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: "48px", marginBottom: "16px" }}
              >
                🎼
              </motion.div>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  maxWidth: "400px",
                  margin: "0 auto 24px",
                }}
              >
                Welcome! I'm your AI music theory tutor. Ask me anything about
                notes, scales, chords, rhythm, and more.
              </p>

              {/* Suggested questions */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                {suggestedQuestions.map((sq, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    whileHover={{
                      scale: 1.03,
                      y: -2,
                      boxShadow: `0 4px 20px ${sq.color}33`,
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => askTutor(sq.text)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: `1px solid ${sq.color}33`,
                      background: `${sq.color}0d`,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "13px",
                      fontFamily: "'Inter', sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.3s",
                    }}
                  >
                    <span style={{ fontSize: "18px" }}>{sq.icon}</span>
                    {sq.text}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                      : msg.isError
                      ? "rgba(244, 63, 94, 0.15)"
                      : "rgba(30, 30, 60, 0.8)",
                  border:
                    msg.role === "user"
                      ? "none"
                      : msg.isError
                      ? "1px solid rgba(244, 63, 94, 0.2)"
                      : "1px solid rgba(139, 92, 246, 0.1)",
                  boxShadow:
                    msg.role === "user"
                      ? "0 4px 15px rgba(139, 92, 246, 0.25)"
                      : "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.7,
                    color:
                      msg.role === "user"
                        ? "#fff"
                        : msg.isError
                        ? "#fca5a5"
                        : "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                    margin: 0,
                    fontWeight: msg.role === "user" ? 500 : 400,
                  }}
                >
                  {msg.text}
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                  display: "block",
                  textAlign: msg.role === "user" ? "right" : "left",
                  padding: "0 8px",
                }}
              >
                {msg.role === "user" ? "You" : "🎵 AI Tutor"} • {msg.timestamp}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              alignSelf: "flex-start",
              padding: "14px 18px",
              borderRadius: "18px 18px 18px 4px",
              background: "rgba(30, 30, 60, 0.8)",
              border: "1px solid rgba(139, 92, 246, 0.1)",
            }}
          >
            <TypingIndicator />
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "16px 28px 24px",
          borderTop: "1px solid rgba(139, 92, 246, 0.1)",
        }}
      >
        <motion.div
          animate={{
            boxShadow: isFocused
              ? "0 0 0 2px rgba(139, 92, 246, 0.3), 0 0 30px rgba(139, 92, 246, 0.08)"
              : "0 0 0 1px rgba(139, 92, 246, 0.1)",
          }}
          style={{
            display: "flex",
            gap: "10px",
            borderRadius: "16px",
            padding: "6px 6px 6px 18px",
            background: "rgba(10, 10, 30, 0.6)",
            alignItems: "center",
            transition: "all 0.3s",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask about music theory..."
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              color: "var(--text-primary)",
              fontSize: "15px",
              fontFamily: "'Inter', sans-serif",
              outline: "none",
              padding: "10px 0",
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => askTutor()}
            disabled={loading || !question.trim()}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              border: "none",
              background:
                loading || !question.trim()
                  ? "rgba(139, 92, 246, 0.2)"
                  : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              color: loading || !question.trim() ? "var(--text-muted)" : "#fff",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: loading || !question.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow:
                loading || !question.trim()
                  ? "none"
                  : "0 4px 12px rgba(139, 92, 246, 0.3)",
              transition: "all 0.3s",
            }}
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block" }}
              >
                ⟳
              </motion.span>
            ) : (
              "Ask ✨"
            )}
          </motion.button>
        </motion.div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            marginTop: "12px",
          }}
        >
          {["Notes", "Scales", "Chords", "Rhythm"].map((topic, i) => (
            <motion.span
              key={topic}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              onClick={() => {
                setQuestion(`Explain ${topic.toLowerCase()} in music theory`);
                inputRef.current?.focus();
              }}
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "1px solid rgba(139, 92, 246, 0.1)",
                cursor: "pointer",
                transition: "all 0.3s",
                fontWeight: 500,
              }}
              whileHover={{
                borderColor: "rgba(139, 92, 246, 0.4)",
                color: "#c084fc",
                y: -1,
              }}
            >
              {topic}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}