"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark, Wordmark, DrawTick } from "@/components/Logo";

function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && el.classList.add("in")),
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function CheckRow({ label, done, right }: { label: string; done?: boolean; right?: string }) {
  return (
    <div className="checkrow" style={{ marginBottom: 7 }}>
      <span className={`checkbox ${done ? "done" : ""}`}>{done && <DrawTick size={15} color="#fff" />}</span>
      <span style={{ fontSize: 13.5 }}>{label}</span>
      {right && <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>{right}</span>}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ overflowX: "hidden" }}>
      {/* ---------- floating glass nav (glass use #1) ---------- */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <LogoMark size={32} />
          <Wordmark size={21} />
        </Link>
        <span style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
          <a href="#story" className="btn btn-g btn-sm">How it works</a>
          <a href="#pricing" className="btn btn-g btn-sm">Pricing</a>
          <Link href="/login" className="btn btn-s btn-sm">Log in</Link>
          <Link href="/signup" className="btn btn-p btn-sm">Start free</Link>
        </span>
      </nav>

      {/* ---------- SCENE 1 · The Mess ---------- */}
      <header style={{ background: "var(--navy)", color: "#fff", padding: "150px 20px 84px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 44, alignItems: "center" }}>
          <Reveal>
            <p style={{ color: "#8fd8ba", fontWeight: 700, fontSize: 12.5, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              For bookkeepers only
            </p>
            <h1 style={{ fontSize: "clamp(32px,4.6vw,50px)", lineHeight: 1.12, fontWeight: 800, margin: "14px 0 16px" }}>
              It&rsquo;s the 28th. Half your clients still owe you documents.
            </h1>
            <p style={{ color: "#c9d6e4", fontSize: 17, maxWidth: 480 }}>
              You did not become a bookkeeper to chase receipts. Ledzora sends the checklist,
              chases on schedule, and shows you one calm screen: who is done, who is waiting, who is overdue.
            </p>
            <div style={{ display: "flex", gap: 11, marginTop: 26, flexWrap: "wrap" }}>
              <Link href="/signup" className="btn btn-p" style={{ fontSize: 15.5, padding: "13px 24px" }}>
                Create your first checklist
              </Link>
              <a href="#story" className="btn" style={{ border: "2px solid #3d5a78", color: "#dce6f0" }}>
                See the story
              </a>
            </div>
            <p style={{ color: "#8fa5bb", fontSize: 12.5, marginTop: 14 }}>
              $29/month per firm. No card to start. No AI — just checklists, reminders and ticks.
            </p>
          </Reveal>
          <Reveal delay={150}>
            {/* the mess: a desk of loose paper, mid-month-end */}
            <div style={{ position: "relative", minHeight: 300 }} aria-hidden="true">
              <div style={{ position: "absolute", top: 6, left: "6%", width: 190, background: "#fff", color: "var(--ink)", borderRadius: 8, padding: "12px 14px", transform: "rotate(-5deg)", boxShadow: "0 16px 34px rgba(0,0,0,0.35)" }}>
                <b style={{ fontSize: 13 }}>Receipt — taxi</b>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>Photo of a photo. Blurry.</p>
              </div>
              <div style={{ position: "absolute", top: 96, right: "4%", width: 210, background: "var(--amber-bg)", color: "var(--ink)", borderRadius: 8, padding: "12px 14px", transform: "rotate(4deg)", boxShadow: "0 16px 34px rgba(0,0,0,0.35)" }}>
                <b style={{ fontSize: 13 }}>Sticky note</b>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>&ldquo;Ask Marco for payroll — AGAIN&rdquo;</p>
              </div>
              <div style={{ position: "absolute", bottom: 52, left: "12%", width: 230, background: "#fff", color: "var(--ink)", borderRadius: 8, padding: "12px 14px", transform: "rotate(2deg)", boxShadow: "0 16px 34px rgba(0,0,0,0.35)" }}>
                <b style={{ fontSize: 13 }}>Inbox · 14 unread</b>
                <p style={{ fontSize: 12, color: "var(--muted)" }}>&ldquo;Statement attached (final) v2 REAL.pdf&rdquo;</p>
              </div>
              <div style={{ position: "absolute", bottom: 0, right: "14%", background: "var(--red)", color: "#fff", borderRadius: 99, padding: "6px 14px", fontWeight: 700, fontSize: 13, transform: "rotate(-3deg)" }}>
                Month-end: tomorrow
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      <div id="story" style={{ maxWidth: 1060, margin: "0 auto", padding: "0 20px" }}>
        {/* ---------- SCENE 2 · The List Builds Itself ---------- */}
        <section style={{ padding: "84px 0 10px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 44, alignItems: "center" }}>
          <Reveal>
            <p className="sora" style={{ color: "var(--green)", fontWeight: 800, fontSize: 21 }}>02</p>
            <h2 style={{ fontSize: 29, color: "var(--navy)", margin: "6px 0 10px" }}>The list builds itself</h2>
            <p style={{ color: "#33404d", maxWidth: 440 }}>
              Pick a client, tick the standard month-end items — bank statements, receipts, payroll —
              add anything custom. Ledzora turns it into one link. That link is the whole job:
              you send it once, and the chasing is no longer yours.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="card" style={{ boxShadow: "0 14px 34px rgba(14,42,71,0.10)" }}>
              <p className="sora" style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 10 }}>Northgate Dental — October</p>
              <CheckRow label="Bank statements" done right="List ready" />
              <CheckRow label="Receipts & invoices" done right="List ready" />
              <CheckRow label="Payroll records" done right="List ready" />
              <CheckRow label="Sales invoices" done right="List ready" />
              <p className="small" style={{ marginTop: 9 }}>One link: ledzora.app/c/northgate &nbsp;·&nbsp; sent once, chased automatically</p>
            </div>
          </Reveal>
        </section>

        {/* ---------- SCENE 3 · The Chase Runs Itself ---------- */}
        <section style={{ padding: "70px 0 10px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 44, alignItems: "center" }}>
          <Reveal style={{ order: 2 }}>
            <p className="sora" style={{ color: "var(--green)", fontWeight: 800, fontSize: 21 }}>03</p>
            <h2 style={{ fontSize: 29, color: "var(--navy)", margin: "6px 0 10px" }}>The chase runs itself</h2>
            <p style={{ color: "#33404d", maxWidth: 440 }}>
              A fixed rule, set by you: a polite reminder on <b>Day 3</b>, a firmer one on <b>Day 7</b>.
              No AI writing emails, no surprises — the same calm chase, every client, every month,
              while you do the work you are actually paid for.
            </p>
          </Reveal>
          <Reveal delay={120} style={{ order: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <div className="card" style={{ borderLeft: "5px solid var(--amber)" }}>
                <b className="sora" style={{ color: "var(--navy)", fontSize: 14.5 }}>Day 3 — automatic reminder</b>
                <p className="small" style={{ marginTop: 3 }}>&ldquo;Hi Sarah, a quick nudge — 2 documents are still open on your October list.&rdquo;</p>
              </div>
              <div className="card" style={{ borderLeft: "5px solid var(--red)" }}>
                <b className="sora" style={{ color: "var(--navy)", fontSize: 14.5 }}>Day 7 — automatic reminder</b>
                <p className="small" style={{ marginTop: 3 }}>&ldquo;Hi Sarah, your list is now overdue — uploading today keeps your month-end on time.&rdquo;</p>
              </div>
              <div className="card" style={{ borderLeft: "5px solid var(--green)" }}>
                <b className="sora" style={{ color: "var(--navy)", fontSize: 14.5 }}>Any time — one tap from your dashboard</b>
                <p className="small" style={{ marginTop: 3 }}>Every reminder, automatic or manual, is recorded on the client&rsquo;s timeline. Nothing is ever chased twice by accident.</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---------- SCENE 4 · Clients Just Tap ---------- */}
        <section style={{ padding: "70px 0 10px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 44, alignItems: "center" }}>
          <Reveal>
            <p className="sora" style={{ color: "var(--green)", fontWeight: 800, fontSize: 21 }}>04</p>
            <h2 style={{ fontSize: 29, color: "var(--navy)", margin: "6px 0 10px" }}>Clients just tap</h2>
            <p style={{ color: "#33404d", maxWidth: 440 }}>
              Your client is a busy cafe owner, not an accountant. The link opens a page with
              their name on it, the missing items, and one big upload button. No login, no app
              to install, no password to forget. Three taps and the tick lands on your screen.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div style={{ width: 288, margin: "0 auto", border: "9px solid #14181d", borderRadius: 38, overflow: "hidden", background: "var(--paper)", boxShadow: "0 18px 40px rgba(14,42,71,0.20)" }}>
              <div style={{ height: 20, background: "#14181d" }} />
              <div style={{ padding: 15 }}>
                <div style={{ background: "var(--navy)", color: "#fff", borderRadius: 11, padding: "10px 12px", display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <b>ledzora&#10003;</b><span style={{ opacity: 0.85 }}>Secure link</span>
                </div>
                <p style={{ fontSize: 13, margin: "12px 0 6px" }}>Hi Sarah — <b>Northgate Dental</b> needs these:</p>
                <CheckRow label="Bank statement — Sep" done />
                <CheckRow label="Receipts folder" done />
                <CheckRow label="Payroll sheet" />
                <div className="dropzone" style={{ padding: 14, marginTop: 10 }}>
                  <b className="sora" style={{ color: "var(--green-d)", fontSize: 14 }}>+ Upload Payroll Sheet</b>
                  <p className="small">Take a photo or pick a file</p>
                </div>
                <p className="small" style={{ textAlign: "center", marginTop: 10 }}>4 of 6 received · Thank you</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ---------- SCENE 5 · All Green ---------- */}
        <section style={{ padding: "70px 0 10px" }}>
          <Reveal>
            <p className="sora" style={{ color: "var(--green)", fontWeight: 800, fontSize: 21, textAlign: "center" }}>05</p>
            <h2 style={{ fontSize: 29, color: "var(--navy)", textAlign: "center", margin: "6px 0 8px" }}>Month-end, closed on the 2nd.</h2>
            <p style={{ color: "#33404d", textAlign: "center", maxWidth: 520, margin: "0 auto 26px" }}>
              One dashboard. Green means done, amber means waiting, red means chase today.
              You read it in three seconds, from across the room.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="card" style={{ maxWidth: 720, margin: "0 auto", boxShadow: "0 14px 34px rgba(14,42,71,0.10)" }}>
              {[
                ["BB", "Bluebird Bakery", "6 of 6 documents in"],
                ["ND", "Northgate Dental", "6 of 6 documents in"],
                ["RC", "Riverbend Cafe", "6 of 6 documents in"],
                ["HS", "Harbor Salon", "5 of 5 documents in"],
              ].map(([ini, name, sub]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 2px", borderBottom: "1px solid var(--line)" }}>
                  <span className="avatar g">{ini}</span>
                  <span><b style={{ fontSize: 14.5 }}>{name}</b><div className="small">{sub}</div></span>
                  <span style={{ marginLeft: "auto" }} className="badge b-done"><span className="dot" />Complete</span>
                </div>
              ))}
              <p className="small" style={{ textAlign: "center", marginTop: 12 }}>That is the whole product. Calm, on purpose.</p>
            </div>
          </Reveal>
        </section>

        {/* ---------- PRICING (glass use #2: middle card) ---------- */}
        <section id="pricing" style={{ padding: "80px 0 10px" }}>
          <Reveal>
            <h2 style={{ fontSize: 29, color: "var(--navy)", textAlign: "center" }}>One plan. One price.</h2>
            <p style={{ color: "#33404d", textAlign: "center", margin: "8px auto 28px", maxWidth: 480 }}>
              A solo bookkeeper with 20 clients can lose a full week a month to chasing.
              Ledzora costs less than one of those hours.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, alignItems: "stretch", maxWidth: 900, margin: "0 auto" }}>
            <Reveal>
              <div className="card" style={{ height: "100%" }}>
                <h3 style={{ color: "var(--navy)" }}>Every firm gets</h3>
                <ul style={{ margin: "10px 0 0 17px", fontSize: 14, color: "#33404d", lineHeight: 2 }}>
                  <li>Unlimited clients</li>
                  <li>Unlimited checklists</li>
                  <li>One upload link per client</li>
                  <li>Full chase history per client</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="frost" style={{ borderRadius: 14, padding: 24, height: "100%", border: "2px solid var(--green)" }}>
                <p className="sora" style={{ fontWeight: 700, color: "var(--navy)", fontSize: 15 }}>Ledzora</p>
                <p style={{ margin: "8px 0 2px" }}>
                  <span className="sora" style={{ fontSize: 40, fontWeight: 800, color: "var(--navy)" }}>$29</span>
                  <span style={{ color: "var(--muted)" }}> /month per firm</span>
                </p>
                <ul style={{ margin: "10px 0 16px 17px", fontSize: 14, color: "#33404d", lineHeight: 2 }}>
                  <li>Automatic Day 3 / Day 7 reminders</li>
                  <li>Red-amber-green status dashboard</li>
                  <li>Client pages with no login</li>
                </ul>
                <Link href="/signup" className="btn btn-p" style={{ width: "100%" }}>Start chasing less</Link>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div className="card" style={{ height: "100%" }}>
                <h3 style={{ color: "var(--navy)" }}>Honest by design</h3>
                <ul style={{ margin: "10px 0 0 17px", fontSize: 14, color: "#33404d", lineHeight: 2 }}>
                  <li>No per-client fees</li>
                  <li>No per-seat fees</li>
                  <li>Cancel any month</li>
                  <li>Your clients never pay, never sign up</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- SCENE 6 · Start ---------- */}
        <section style={{ padding: "84px 0 90px", textAlign: "center" }}>
          <Reveal>
            <LogoMark size={54} />
            <h2 style={{ fontSize: 30, color: "var(--navy)", margin: "16px 0 8px" }}>Stop chasing clients.<br />Start closing books.</h2>
            <p style={{ color: "#33404d", marginBottom: 24 }}>Your first checklist takes about a minute to send.</p>
            <Link href="/signup" className="btn btn-p" style={{ fontSize: 16, padding: "14px 28px" }}>
              Create your first checklist
            </Link>
          </Reveal>
        </section>
      </div>

      <footer style={{ background: "var(--navy)", color: "#8fa5bb", padding: "26px 20px", textAlign: "center", fontSize: 13 }}>
        <span style={{ color: "#fff" }}><Wordmark size={17} color="#FFFFFF" /></span>
        &nbsp; · Document Chase for bookkeepers · Checklists, reminders, ticks. Nothing else.
      </footer>
    </div>
  );
}
