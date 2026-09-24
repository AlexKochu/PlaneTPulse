"use client";

import Link from "next/link";
import { ArrowLeft, Bot, Shield } from "lucide-react";
import ConversationalCoach from "@/components/ConversationalCoach";

export default function CoachPage() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
      {/* Top bar */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          href="/app"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            fontWeight: 500,
            fontSize: "0.9rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(46,125,79,0.1)",
              padding: "0.3rem 0.75rem",
              borderRadius: "999px",
              border: "1px solid rgba(46,125,79,0.2)",
            }}
          >
            <Shield size={13} color="var(--color-primary-green)" />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-primary-green)", letterSpacing: "0.06em" }}>
              ZERO INVENTED NUMBERS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "var(--color-soft-green)",
              padding: "0.3rem 0.75rem",
              borderRadius: "999px",
            }}
          >
            <Bot size={13} color="var(--color-primary-green)" />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--color-primary-green)", letterSpacing: "0.06em" }}>
              GROQ LLM ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 0.4rem", letterSpacing: "-0.02em", color: "var(--color-text)" }}>
          Ask Coach
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", margin: 0, maxWidth: 600, lineHeight: 1.6 }}>
          Chat with your personal AI sustainability advisor. All CO₂ numbers come
          directly from your logged activities — the AI only provides language, never calculations.
        </p>
      </div>

      {/* Conversational Chat */}
      <ConversationalCoach />
    </div>
  );
}
