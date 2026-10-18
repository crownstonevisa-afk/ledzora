"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoMark, Wordmark, LogoLoader } from "@/components/Logo";
import { loadSession, saveSession, seedSampleData, type Session } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    setSession(s);
    seedSampleData();
    const t = setTimeout(() => setBooted(true), 950); // boot: THE LOADER (logo animation)
    return () => clearTimeout(t);
  }, [router]);

  if (!session || !booted) return <LogoLoader label="Opening your dashboard" />;

  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/dashboard" className="brand-row">
          <LogoMark size={34} bg="#12365C" />
          <Wordmark size={20} color="#FFFFFF" />
        </Link>
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={`nav-i ${pathname === n.href ? "on" : ""}`}>
            {n.label}
          </Link>
        ))}
        <div style={{ marginTop: "auto", borderTop: "1px solid #12365c", paddingTop: 13 }}>
          <p style={{ fontSize: 13, color: "#fff", fontWeight: 600, padding: "0 11px" }}>{session.firmName}</p>
          <p style={{ fontSize: 12, color: "#8fa5bb", padding: "0 11px 8px" }}>{session.email}</p>
          <button
            className="nav-i"
            style={{ background: "none", border: "none", width: "100%", textAlign: "left" }}
            onClick={() => {
              saveSession(null);
              router.push("/");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="mobile-topbar"
          style={{ alignItems: "center", gap: 10, background: "var(--navy)", padding: "11px 15px", position: "sticky", top: 0, zIndex: 60 }}
        >
          <LogoMark size={28} bg="#12365C" />
          <Wordmark size={18} color="#FFFFFF" />
          <span style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <Link href="/dashboard" style={{ color: "#dce6f0", fontSize: 13.5, textDecoration: "none" }}>Dashboard</Link>
            <Link href="/dashboard/settings" style={{ color: "#dce6f0", fontSize: 13.5, textDecoration: "none" }}>Settings</Link>
          </span>
        </div>
        <main className="main-area">{children}</main>
      </div>
    </div>
  );
}
