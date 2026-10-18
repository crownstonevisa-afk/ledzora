"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  type FirmSettings, loadSettings, saveSettings, loadSession, saveSession, clearSampleData, loadClients,
} from "@/lib/store";
import { useToast } from "@/components/Toast";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [settings, setSettings] = useState<FirmSettings | null>(null);
  const [hasSamples, setHasSamples] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setHasSamples(loadClients().some((c) => c.isSample));
  }, []);

  if (!settings) {
    return (
      <div>
        <div className="skel" style={{ width: 200, height: 26, marginBottom: 16 }} />
        <div className="skel" style={{ height: 200 }} />
      </div>
    );
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const day1 = Math.min(30, Math.max(1, settings.reminderDay1 || 3));
    const day2 = Math.min(60, Math.max(day1 + 1, settings.reminderDay2 || 7));
    const next = { ...settings, reminderDay1: day1, reminderDay2: day2 };
    saveSettings(next);
    setSettings(next);
    const s = loadSession();
    if (s) saveSession({ ...s, firmName: next.firmName });
    toast("Settings saved");
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 className="page-h">Settings</h1>
      <p className="small" style={{ marginTop: 3 }}>Your firm, your chase rule. Changes apply to every client.</p>

      <form className="card" style={{ marginTop: 18 }} onSubmit={save}>
        <div className="field">
          <label htmlFor="firm">Firm name</label>
          <input id="firm" className="input" value={settings.firmName} onChange={(e) => setSettings({ ...settings, firmName: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="period">Dashboard heading (current period)</label>
          <input id="period" className="input" value={settings.periodLabel} onChange={(e) => setSettings({ ...settings, periodLabel: e.target.value })} placeholder="October Close" />
        </div>
        <hr className="sep" />
        <h3 className="sora" style={{ color: "var(--navy)", fontSize: 15.5, marginBottom: 6 }}>Automatic reminder rule</h3>
        <p className="small" style={{ marginBottom: 13 }}>
          While a client still owes documents, reminders fire on these days after the checklist is sent. Reminders stop when the list is complete.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label htmlFor="d1">First reminder — day</label>
            <input id="d1" className="input" type="number" min={1} max={30} value={settings.reminderDay1} onChange={(e) => setSettings({ ...settings, reminderDay1: Number(e.target.value) })} />
          </div>
          <div className="field">
            <label htmlFor="d2">Second reminder — day</label>
            <input id="d2" className="input" type="number" min={2} max={60} value={settings.reminderDay2} onChange={(e) => setSettings({ ...settings, reminderDay2: Number(e.target.value) })} />
          </div>
        </div>
        <button type="submit" className="btn btn-p">Save settings</button>
      </form>

      {hasSamples && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 className="sora" style={{ color: "var(--navy)", fontSize: 15.5 }}>Sample data</h3>
          <p className="small" style={{ margin: "5px 0 12px" }}>Remove the four sample clients (Bluebird Bakery, Northgate Dental, Riverbend Cafe, Harbor Salon) and start with a clean board.</p>
          <button
            className="btn btn-s btn-sm"
            onClick={() => { clearSampleData(); setHasSamples(false); toast("Sample data cleared"); }}
          >
            Clear sample data
          </button>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3 className="sora" style={{ color: "var(--navy)", fontSize: 15.5 }}>Account</h3>
        <p className="small" style={{ margin: "5px 0 12px" }}>Signed in on this browser (MVP demo auth — accounts and data live in this browser&rsquo;s local storage).</p>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => { saveSession(null); router.push("/"); }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
