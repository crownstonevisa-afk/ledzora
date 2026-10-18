import React from "react";

/** The Ledzora mark: an open ledger page forming an "L", closed by a tick. */
export function LogoMark({
  size = 40,
  bg = "#0E2A47",
  tick = "#1E9E6A",
  line = "#FFFFFF",
}: {
  size?: number;
  bg?: string;
  tick?: string;
  line?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Ledzora logo" role="img">
      <rect x="2" y="2" width="60" height="60" rx="15" fill={bg} />
      <path d="M20 15v27h19" stroke={line} strokeWidth="6.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M35 40l6 6 11-13" stroke={tick} strokeWidth="6.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ size = 26, color = "#0E2A47" }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-sora), sans-serif",
        fontWeight: 800,
        fontSize: size,
        color,
        letterSpacing: "-0.01em",
        lineHeight: 1,
      }}
    >
      ledzora<span style={{ color: "#1E9E6A" }}>&#10003;</span>
    </span>
  );
}

/**
 * THE LOADER — the Ledzora logo animation is the product's only
 * full-screen loading animation (Design Pack Section 11).
 * The ledger "L" draws itself, the green tick strikes, then it loops.
 * Loop ≈ 1.15s. Respects prefers-reduced-motion (static mark + label).
 */
export function LogoLoaderMark({ size = 84 }: { size?: number }) {
  return (
    <svg
      className="logo-loader-svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-label="Loading"
      role="img"
    >
      <rect x="2" y="2" width="60" height="60" rx="15" fill="#0E2A47" />
      <path
        className="ll-line"
        d="M20 15v27h19"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="ll-tick"
        d="M35 40l6 6 11-13"
        stroke="#1E9E6A"
        strokeWidth="6.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Full-screen loading overlay: logo animation + wordmark. */
export function LogoLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="logo-loader-screen" role="status" aria-label={label}>
      <LogoLoaderMark size={88} />
      <div style={{ marginTop: 18 }}>
        <Wordmark size={28} color="#FFFFFF" />
      </div>
      <p className="logo-loader-label">{label}&hellip;</p>
    </div>
  );
}

/** Small animated tick that draws itself — used when a document lands. */
export function DrawTick({ size = 20, color = "#1E9E6A", animateKey = 0 }: { size?: number; color?: string; animateKey?: number | string }) {
  return (
    <svg key={animateKey} className="draw-tick" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12.5l5 5L20 6.5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
