"use client";


import { ReactNode } from "react";
import AppNav from "@/components/AppNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <AppNav />
      <main className="app-content" role="main">
        {children}
      </main>
    </div>
  );
}
