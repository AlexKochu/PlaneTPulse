"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PlanetPulseLogo from "@/components/PlanetPulseLogo";
import LiveIndicator from "@/components/LiveIndicator";

export default function AppNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", id: "nav-home" },
    { href: "/app", label: "Dashboard", id: "nav-dashboard" },
    { href: "/app/log", label: "Log Activity", id: "nav-log" },
    { href: "/app/history", label: "History", id: "nav-history" },
    { href: "/what-if", label: "What If Simulator", id: "nav-what-if" },
  ];

  return (
    <nav className="app-nav" data-testid="app-nav" role="navigation" aria-label="Main navigation">
      <div className="app-nav-inner">
        <div className="app-nav-left">
          <Link href="/" className="logo-link" data-testid="app-logo">
            <PlanetPulseLogo size="sm" />
          </Link>
          <LiveIndicator label="MONITOR ACTIVE" className="nav-live-indicator" />
        </div>

        <div className="app-nav-right">
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
      </div>
    </nav>
  );
}
