import { NextResponse } from "next/server";
import { computeSwapSuggestion, generateSmartCoachMessage } from "@/lib/coachEngine";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";


const MODELS_TO_TRY = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3.8-27b",
];

async function callGroq(prompt: string, chatHistory?: Array<{ role: string; content: string }>) {
  if (!GROQ_API_KEY) return null;

  const messages: Array<{ role: string; content: string }> = [
    {
      role: "system",
      content:
        "You are PlanetPulse's Weekly Carbon Coach. Your goal is to supportively analyze the user's verified weekly carbon footprint and answer their questions. " +
        "CRITICAL: Never calculate, invent, extrapolate, or alter any CO2 values or statistics. Use strictly the numbers given in the prompt. " +
        "Keep your response warm, motivating, and concise.",
    },
  ];

  if (chatHistory && Array.isArray(chatHistory)) {
    for (const msg of chatHistory) {
      if (msg.role && msg.content) {
        messages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: msg.content });
      }
    }
  }

  messages.push({ role: "user", content: prompt });

  for (const model of MODELS_TO_TRY) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 450,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch {
      // try next model
    }
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const verifiedData = body.verified_data || {};
    const userPrompt = body.user_prompt || "How am I doing this week?";
    const chatHistory = body.chat_history || [];

    const weeklyFootprint = Number(verifiedData.total_co2 ?? verifiedData.totalCO2 ?? 0);
    const weeklyTarget = Number(verifiedData.weekly_target ?? verifiedData.weeklyTarget ?? 0);
    const status = verifiedData.status || (weeklyTarget > 0 ? (weeklyFootprint > weeklyTarget ? "exceeded" : "on_track") : "no_target");
    const biggestSource = verifiedData.biggest_source || verifiedData.biggestSource || null;
    const biggestSourceCO2 = Number(verifiedData.biggest_source_co2 ?? verifiedData.biggestSourceCO2 ?? 0);
    const biggestCategory = verifiedData.biggest_category || (biggestSource === "car" || biggestSource === "bus" || biggestSource === "flight" ? "Transport" : "Food");

    const swapSuggestion = verifiedData.swap_scenario || computeSwapSuggestion(biggestSource, 10);

    // Build prompt for LLM
    let prompt = `User Question: "${userPrompt}"\n\nVerified Weekly Data:\n`;
    prompt += `- Weekly Total CO2: ${weeklyFootprint.toFixed(2)} kg CO2\n`;
    prompt += `- Weekly Target: ${weeklyTarget > 0 ? `${weeklyTarget} kg CO2` : "No target set"}\n`;
    prompt += `- Status: ${status === "on_track" ? "On track" : status === "exceeded" ? "Target exceeded" : "Active"}\n`;

    if (biggestSource) {
      prompt += `- Primary Emission Source: ${biggestCategory} (${biggestSource.replace(/_/g, " ")}) generating ${biggestSourceCO2.toFixed(2)} kg CO2\n`;
    }

    if (swapSuggestion) {
      prompt += `- Recommended Action: Swapping ${biggestSource?.replace(/_/g, " ") || "current travel"} with ${swapSuggestion.alternative.activity_type} saves ~${Math.abs(swapSuggestion.difference_kg).toFixed(2)} kg CO2.\n`;
    }

    const aiMessage = await callGroq(prompt, chatHistory);

    const finalMessage = aiMessage || generateSmartCoachMessage({
      userPrompt,
      totalCO2: weeklyFootprint,
      weeklyTarget,
      status,
      biggestSource,
      biggestSourceCO2,
      biggestCategory,
      swapSuggestion,
    });

    return NextResponse.json({
      total_co2: Math.round(weeklyFootprint * 100) / 100,
      weekly_target: weeklyTarget,
      status,
      biggest_source: biggestSource,
      biggest_source_co2: Math.round(biggestSourceCO2 * 100) / 100,
      swap_scenario: swapSuggestion,
      coach_message: finalMessage,
    });
  } catch (error: any) {
    console.error("Coach route error:", error);
    return NextResponse.json({
      total_co2: 0,
      weekly_target: 0,
      status: "no_data",
      biggest_source: null,
      biggest_source_co2: null,
      swap_scenario: null,
      coach_message: "Hello! Log your travel or meals to receive instant personalized coaching and CO₂ swap recommendations.",
    });
  }
}

export async function GET() {
  return POST(new Request("https://internal/api/coach", { method: "POST", body: JSON.stringify({}) }));
}
