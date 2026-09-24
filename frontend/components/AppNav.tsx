"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import PlanetPulseLogo from "@/components/PlanetPulseLogo";
import LiveIndicator from "@/components/LiveIndicator";

export default function AppNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Home", id: "nav-home" },
    { href: "/app", label: "Dashboard", id: "nav-dashboard" },
    { href: "/app/log", label: "Log Activity", id: "nav-log" },
    { href: "/app/history", label: "History", id: "nav-history" },
    { href: "/what-if", label: "What If Simulator", id: "nav-what-if" },
    { href: "/app/coach", label: "Ask Coach", id: "nav-coach" },
  ];

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav className="app-nav" data-testid="app-nav" role="navigation" aria-label="Main navigation">
        <div className="app-nav-inner">
          <div className="app-nav-left">
            <Link href="/" className="logo-link" data-testid="app-logo">
              <PlanetPulseLogo size="sm" />
            </Link>
            <LiveIndicator label="MONITOR ACTIVE" className="nav-live-indicator" />
          </div>

          {/* Desktop links */}
          <div className="app-nav-right app-nav-desktop-links">
            <div className="app-nav-links">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`app-nav-link ${pathname === link.href ? "active" : ""}`}
                  data-testid={link.id}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="app-nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile slide-down */}
      <div className={`app-nav-mobile-menu ${mobileOpen ? "open" : ""}`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`app-nav-mobile-link ${pathname === link.href ? "active" : ""}`}
            data-testid={`${link.id}-mobile`}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="app-nav-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
