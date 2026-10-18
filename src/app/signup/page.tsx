"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark, LogoLoader } from "@/components/Logo";
import { signupUser, seedSampleData } from "@/lib/store";
import { useToast } from "@/components/Toast";

export default function SignupPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return toast("Tell us your name", "error");
    if (firmName.trim().length < 2) return toast("Tell us your firm name", "error");
    if (!email.includes("@")) return toast("Enter a valid email address", "error");
    if (password.length < 4) return toast("Password needs at least 4 characters", "error");
    setLoading(true); // THE LOADER: the logo animation is the wait screen
    setTimeout(() => {
      signupUser(name.trim(), email.trim(), firmName.trim(), password);
      seedSampleData(); // first run: sample clients so the dashboard is alive instantly
      router.push("/dashboard");
    }, 1300);
  }

  if (loading) return <LogoLoader label="Setting up your firm" />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/" style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <LogoMark size={56} />
        </Link>
        <div className="card" style={{ padding: 26 }}>
          <h1 className="sora" style={{ fontSize: 21, color: "var(--navy)", textAlign: "center" }}>Create your firm account</h1>
          <p className="small" style={{ textAlign: "center", margin: "5px 0 20px" }}>
            $29/month per firm. Your first dashboard comes with sample clients so you can see exactly how it feels.
          </p>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="firm">Firm name</label>
              <input id="firm" className="input" value={firmName} onChange={(e) => setFirmName(e.target.value)} placeholder="Morgan Bookkeeping" autoComplete="organization" />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourfirm.com" autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 4 characters" autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-p" style={{ width: "100%", marginTop: 4 }}>Create account</button>
          </form>
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
        <p className="small" style={{ textAlign: "center", marginTop: 14 }}>
          MVP demo build — accounts live in this browser only.
        </p>
      </div>
    </div>
  );
}
