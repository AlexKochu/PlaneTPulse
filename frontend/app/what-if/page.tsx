import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import WhatIfSimulator from "@/components/WhatIfSimulator";
import AppNav from "@/components/AppNav";

export default function WhatIfPage() {
  return (
    <div className="landing-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppNav />

      <main style={{ flex: 1, padding: "8rem 2rem 4rem", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ maxWidth: "1000px", width: "100%" }}>
          <div style={{ marginBottom: "2rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text-muted)", textDecoration: "none", fontWeight: 500 }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
          <WhatIfSimulator />
        </div>
      </main>
    </div>
  );
}
