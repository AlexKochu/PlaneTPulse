"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Sparkles, TrendingDown, RefreshCw,
  Zap, MessageCircle, ArrowRight, Leaf
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCurrentWeekActivities, getCurrentWeekTotal, getWeeklyTarget } from "@/lib/storage";

interface Message {
  role: "user" | "assistant";
  content: string;
  stats?: {
    total_co2: number;
    weekly_target: number;
    status: string;
    biggest_source?: string | null;
    biggest_source_co2?: number | null;
    swap_scenario?: any;
  };
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "How am I doing this week?",
  "What's my biggest emission source?",
  "How can I reduce my carbon footprint?",
  "What swaps would save the most CO₂?",
  "Am I on track for my weekly target?",
];

function buildVerifiedData() {
  const weekActivities = getCurrentWeekActivities();
  const totalCO2 = getCurrentWeekTotal();
  const targetObj = getWeeklyTarget();
  const weeklyTarget = targetObj?.targetKg || 0;

  let status = "no_target";
  if (weeklyTarget > 0) {
    status = totalCO2 > weeklyTarget ? "exceeded" : "on_track";
  }

  const totalsByType: Record<string, { co2: number; qty: number; category: string }> = {};
  for (const act of weekActivities) {
    if (!totalsByType[act.activityType]) {
      totalsByType[act.activityType] = { co2: 0, qty: 0, category: act.category };
    }
    totalsByType[act.activityType].co2 += act.co2Kg;
    totalsByType[act.activityType].qty += act.quantity;
  }

  let biggestSource: string | null = null;
  let biggestSourceCO2 = 0;
  let biggestCategory = "";
  for (const [type, data] of Object.entries(totalsByType)) {
    if (data.co2 > biggestSourceCO2) {
      biggestSource = type;
      biggestSourceCO2 = data.co2;
      biggestCategory = data.category;
    }
  }

  if (weekActivities.length === 0 && weeklyTarget === 0) return null;

  return {
    total_co2: Math.round(totalCO2 * 100) / 100,
    weekly_target: weeklyTarget,
    status,
    biggest_source: biggestSource,
    biggest_source_co2: Math.round(biggestSourceCO2 * 100) / 100,
    biggest_category: biggestCategory,
  };
}

export default function ConversationalCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: userText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStarted(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Build verified deterministic data from client
      const verifiedData = buildVerifiedData();

      // Build chat history for backend (exclude the current message, already sent as user_prompt)
      const historyForBackend = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const payload = {
        user_prompt: userText.trim(),
        verified_data: verifiedData,
        chat_history: historyForBackend.length > 0 ? historyForBackend : null,
      };

      const res = await fetch(`${API_URL}/api/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      const assistantMsg: Message = {
        role: "assistant",
        content: data.coach_message,
        stats: {
          total_co2: data.total_co2,
          weekly_target: data.weekly_target,
          status: data.status,
          biggest_source: data.biggest_source,
          biggest_source_co2: data.biggest_source_co2,
          swap_scenario: data.swap_scenario,
        },
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Coach error:", err);
      // Graceful client-side fallback
      const totalCO2 = getCurrentWeekTotal();
      const targetObj = getWeeklyTarget();
      const weeklyTarget = targetObj?.targetKg || 0;
      const status = weeklyTarget === 0 ? "no_target" : totalCO2 > weeklyTarget ? "exceeded" : "on_track";

      const fallbackMsg: Message = {
        role: "assistant",
        content:
          totalCO2 === 0
            ? "I couldn't reach the AI service right now. But I can see you haven't logged any activities this week yet! Head to the dashboard to log your first activity and I'll give you personalized insights."
            : `I couldn't reach the AI service, but based on your data: you've logged ${totalCO2} kg CO₂ this week${weeklyTarget > 0 ? ` against your ${weeklyTarget} kg target (${status === "on_track" ? "you're on track! 🎉" : "target exceeded ⚠️"})` : ""}. Try asking again in a moment!`,
        stats: { total_co2: totalCO2, weekly_target: weeklyTarget, status },
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (q: string) => {
    sendMessage(q);
  };

  const handleReset = () => {
    setMessages([]);
    setStarted(false);
    setInput("");
  };

  const lastStats = messages.filter((m) => m.role === "assistant" && m.stats).slice(-1)[0]?.stats;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 180px)",
        minHeight: "520px",
        maxHeight: "780px",
        background: "var(--glass-bg)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--glass-border)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 240,
          height: 240,
          background: "var(--color-primary-green)",
          filter: "blur(110px)",
          opacity: 0.12,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--glass-border)",
          flexShrink: 0,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1B4D3E, #2E7D4F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Leaf size={18} color="#fff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
                Carbon Coach
              </h3>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--color-primary-green)",
                  background: "var(--color-soft-green)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "999px",
                  letterSpacing: "0.06em",
                }}
              >
                GROQ AI
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0 }}>
              Powered by verified PlanetPulse data
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Live stats pill */}
          {lastStats && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: lastStats.status === "exceeded" ? "rgba(239,68,68,0.1)" : "var(--color-soft-green)",
                padding: "0.3rem 0.75rem",
                borderRadius: "999px",
                border: `1px solid ${lastStats.status === "exceeded" ? "rgba(239,68,68,0.2)" : "rgba(46,125,79,0.2)"}`,
              }}
            >
              <Zap
                size={12}
                color={lastStats.status === "exceeded" ? "#EF4444" : "var(--color-primary-green)"}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: lastStats.status === "exceeded" ? "#EF4444" : "var(--color-primary-green)",
                }}
              >
                {lastStats.total_co2} kg CO₂ this week
              </span>
            </div>
          )}
          {messages.length > 0 && (
            <button
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                padding: "0.35rem 0.7rem",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <RefreshCw size={12} /> New Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Welcome / empty state */}
        {!started && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", paddingTop: "2rem" }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1B4D3E22, #2E7D4F44)",
                border: "2px solid rgba(46,125,79,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <Sparkles size={28} color="var(--color-primary-green)" />
            </div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                margin: "0 0 0.5rem",
                color: "var(--color-text)",
              }}
            >
              Ask me anything about your carbon footprint
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--color-text-muted)",
                margin: "0 0 2rem",
                maxWidth: 480,
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.6,
              }}
            >
              I analyze your real activity data—never inventing numbers—and give you
              actionable, science-backed recommendations.
            </p>

            {/* Suggested questions */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.65rem",
                justifyContent: "center",
                maxWidth: 600,
                margin: "0 auto",
              }}
            >
              {SUGGESTED_QUESTIONS.map((q) => (
                <motion.button
                  key={q}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSuggestion(q)}
                  disabled={loading}
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "999px",
                    padding: "0.55rem 1.1rem",
                    fontSize: "0.85rem",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <MessageCircle size={13} color="var(--color-primary-green)" />
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                      : "linear-gradient(135deg, #1B4D3E, #2E7D4F)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {msg.role === "user" ? (
                  <User size={16} color="#fff" />
                ) : (
                  <Bot size={16} color="#fff" />
                )}
              </div>

              {/* Bubble */}
              <div
                style={{
                  maxWidth: "75%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                        : "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(8px)",
                    color: msg.role === "user" ? "#fff" : "var(--color-text)",
                    padding: "0.85rem 1.1rem",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    fontSize: "0.925rem",
                    lineHeight: 1.6,
                    border:
                      msg.role === "assistant"
                        ? "1px solid var(--glass-border)"
                        : "none",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {msg.content}
                </div>

                {/* Stats cards for assistant messages */}
                {msg.role === "assistant" && msg.stats && msg.stats.total_co2 > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      maxWidth: "100%",
                    }}
                  >
                    <StatChip
                      label="Weekly CO₂"
                      value={`${msg.stats.total_co2} kg`}
                    />
                    {msg.stats.weekly_target > 0 && (
                      <StatChip
                        label="Target"
                        value={`${msg.stats.weekly_target} kg`}
                      />
                    )}
                    <StatChip
                      label="Status"
                      value={
                        msg.stats.status === "on_track"
                          ? "✓ On Track"
                          : msg.stats.status === "exceeded"
                          ? "⚠ Exceeded"
                          : "No Target"
                      }
                      highlight={msg.stats.status === "on_track" ? "green" : msg.stats.status === "exceeded" ? "red" : undefined}
                    />
                    {msg.stats.biggest_source && (
                      <StatChip
                        label="Top Source"
                        value={msg.stats.biggest_source.replace(/_/g, " ")}
                      />
                    )}

                    {/* Swap recommendation */}
                    {msg.stats.swap_scenario && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        style={{
                          width: "100%",
                          background: "rgba(46,125,79,0.08)",
                          border: "1px solid rgba(46,125,79,0.2)",
                          borderRadius: "10px",
                          padding: "0.75rem 1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <TrendingDown size={15} color="var(--color-primary-green)" />
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-primary-green)" }}>
                            Save {Math.abs(msg.stats.swap_scenario.difference_kg).toFixed(2)} kg CO₂ →
                            Switch to {msg.stats.swap_scenario.alternative.activity_type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <button
                          onClick={() => router.push("/what-if")}
                          style={{
                            background: "var(--color-primary-green)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "999px",
                            padding: "0.35rem 0.85rem",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          Simulate <ArrowRight size={12} />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1B4D3E, #2E7D4F)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Bot size={16} color="#fff" />
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1px solid var(--glass-border)",
                borderRadius: "18px 18px 18px 4px",
                padding: "0.85rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {[0, 1, 2].map((d) => (
                <motion.div
                  key={d}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ duration: 0.8, delay: d * 0.15, repeat: Infinity }}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--color-primary-green)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips (after first message) */}
      {started && !loading && messages.length > 0 && messages.length < 6 && (
        <div
          style={{
            padding: "0.75rem 1.5rem",
            borderTop: "1px solid var(--glass-border)",
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          {SUGGESTED_QUESTIONS.filter(
            (q) => !messages.some((m) => m.role === "user" && m.content === q)
          )
            .slice(0, 3)
            .map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                style={{
                  whiteSpace: "nowrap",
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "999px",
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.78rem",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                }}
              >
                {q}
              </button>
            ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid var(--glass-border)",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          background: "rgba(255,255,255,0.04)",
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your carbon footprint..."
          disabled={loading}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid var(--glass-border)",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            fontSize: "0.9rem",
            color: "var(--color-text)",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary-green)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--glass-border)")}
        />
        <motion.button
          type="submit"
          disabled={!input.trim() || loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            background:
              input.trim() && !loading
                ? "linear-gradient(135deg, #1B4D3E, #2E7D4F)"
                : "rgba(255,255,255,0.1)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
        >
          <Send size={18} color={input.trim() && !loading ? "#fff" : "var(--color-text-muted)"} />
        </motion.button>
      </form>
    </div>
  );
}

function StatChip({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "green" | "red";
}) {
  return (
    <div
      style={{
        background:
          highlight === "green"
            ? "rgba(46,125,79,0.1)"
            : highlight === "red"
            ? "rgba(239,68,68,0.08)"
            : "rgba(255,255,255,0.7)",
        border: `1px solid ${
          highlight === "green"
            ? "rgba(46,125,79,0.2)"
            : highlight === "red"
            ? "rgba(239,68,68,0.15)"
            : "var(--glass-border)"
        }`,
        borderRadius: "8px",
        padding: "0.35rem 0.75rem",
        display: "flex",
        flexDirection: "column" as const,
        gap: "0.1rem",
      }}
    >
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.06em",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          color:
            highlight === "green"
              ? "var(--color-primary-green)"
              : highlight === "red"
              ? "#EF4444"
              : "var(--color-text)",
          textTransform: "capitalize" as const,
        }}
      >
        {value}
      </span>
    </div>
  );
}
