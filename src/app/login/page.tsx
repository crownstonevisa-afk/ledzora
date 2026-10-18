"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark, LogoLoader } from "@/components/Logo";
import { loginUser } from "@/lib/store";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return toast("Enter a valid email address", "error");
    if (password.length < 4) return toast("Password needs at least 4 characters", "error");
    setLoading(true); // THE LOADER: the logo animation is the wait screen
    setTimeout(() => {
      const session = loginUser(email.trim(), password);
      if (!session) {
        setLoading(false);
        toast("That password does not match this email", "error");
        return;
      }
      router.push("/dashboard");
    }, 1300);
  }

  if (loading) return <LogoLoader label="Signing you in" />;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link href="/" style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <LogoMark size={56} />
        </Link>
        <div className="card" style={{ padding: 26 }}>
          <h1 className="sora" style={{ fontSize: 21, color: "var(--navy)", textAlign: "center" }}>Welcome back</h1>
          <p className="small" style={{ textAlign: "center", margin: "5px 0 20px" }}>Sign in to your Ledzora dashboard.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourfirm.com" autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-p" style={{ width: "100%", marginTop: 4 }}>Sign in</button>
          </form>
          <p className="small" style={{ textAlign: "center", marginTop: 16 }}>
            New to Ledzora? <Link href="/signup">Create your firm account</Link>
          </p>
        </div>
        <p className="small" style={{ textAlign: "center", marginTop: 14 }}>
          MVP demo build — accounts live in this browser only.
        </p>
      </div>
    </div>
  );
}
