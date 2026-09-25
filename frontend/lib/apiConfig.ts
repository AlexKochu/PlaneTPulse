// ============================================================
// PlanetPulse — Shared API Base URL Configuration
// ============================================================
// Single source of truth for the FastAPI backend URL.
//
// In production (Vercel): NEXT_PUBLIC_API_URL is set to the
// Render backend URL (e.g. https://planetpulse-zwju.onrender.com).
//
// In local development: .env.local sets it to http://localhost:8000.
//
// This file is imported by all API client code so the URL is
// never duplicated or inconsistent.
// ============================================================

/**
 * Base URL for the FastAPI backend.
 *
 * Resolved at build time from NEXT_PUBLIC_API_URL.
 * Falls back to a relative path ("") so that in the worst case
 * requests go to the Next.js server itself (where API routes
 * like /api/coach can handle them), rather than to localhost
 * which would fail on users' devices.
 */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "";
