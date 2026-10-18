"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  type ClientRec, type FirmSettings, loadClients, saveClients, loadSettings,
  clientStatus, receivedCount, fireDueAutoReminders, clearSampleData,
  PRESET_ITEMS, uid, newToken, fmtDate, daysSince,
} from "@/lib/store";
import { useToast } from "@/components/Toast";

function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function DashboardPage() {
  const toast = useToast();
  const [clients, setClients] = useState<ClientRec[] | null>(null);
  const [settings, setSettings] = useState<FirmSettings | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // add-client form state
  const [biz, setBiz] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [picked, setPicked] = useState<string[]>(PRESET_ITEMS.slice(0, 4));
  const [custom, setCustom] = useState("");
  const [dueDays, setDueDays] = useState(7);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    let list = loadClients();
    // Fire the fixed auto-reminder rule for anyone whose Day N has arrived.
    const firedNames: string[] = [];
    list = list.map((c) => {
      const updated = fireDueAutoReminders(c, s);
      if (updated) {
        firedNames.push(c.name);
        return updated;
      }
      return c;
    });
    if (firedNames.length) {
      saveClients(list);
      setTimeout(() => toast(`Automatic reminder sent to ${firedNames.join(", ")}`), 350);
    }
    setClients(list);
  }, [toast]);

  const stats = useMemo(() => {
    const st = { complete: 0, waiting: 0, overdue: 0 };
    (clients || []).forEach((c) => st[clientStatus(c)]++);
    return st;
  }, [clients]);

  function refresh() {
    setClients(loadClients());
  }

  function sendReminder(c: ClientRec) {
    const updated: ClientRec = {
      ...c,
      reminders: [
        ...c.reminders,
        { id: uid(), sentAt: new Date().toISOString(), kind: "manual", note: "Manual reminder — sent from dashboard" },
      ],
    };
    const list = loadClients().map((x) => (x.id === c.id ? updated : x));
    saveClients(list);
    setClients(list);
    toast(`Reminder sent to ${c.name}`);
  }

  function createClient(e: React.FormEvent) {
    e.preventDefault();
    if (biz.trim().length < 2) return toast("Enter the client's business name", "error");
    const items = [...picked, ...(custom.trim() ? [custom.trim()] : [])];
    if (items.length === 0) return toast("Pick at least one checklist item", "error");
    const now = new Date();
    const due = new Date(now);
    due.setDate(due.getDate() + dueDays);
    const rec: ClientRec = {
      id: uid(),
      name: biz.trim(),
      contactName: contact.trim() || "there",
      email: email.trim(),
      token: newToken(),
      createdAt: now.toISOString(),
      dueDate: due.toISOString(),
      items: items.map((label) => ({ id: uid(), label, received: false })),
      reminders: [],
    };
    saveClients([...loadClients(), rec]);
    setShowAdd(false);
    setBiz(""); setContact(""); setEmail(""); setCustom("");
    setPicked(PRESET_ITEMS.slice(0, 4));
    refresh();
    toast(`Checklist created for ${rec.name} — share the client link to start the chase`);
  }

  if (!clients || !settings) {
    // in-page load: skeleton, never a spinner (Pack §11)
    return (
      <div>
        <div className="skel" style={{ width: 240, height: 26, marginBottom: 18 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          <div className="skel" style={{ height: 74 }} /><div className="skel" style={{ height: 74 }} /><div className="skel" style={{ height: 74 }} />
        </div>
        <div className="skel" style={{ height: 62, marginBottom: 10 }} />
        <div className="skel" style={{ height: 62, marginBottom: 10 }} />
        <div className="skel" style={{ height: 62 }} />
      </div>
    );
  }

  const hasSamples = clients.some((c) => c.isSample);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="page-h">{settings.periodLabel}</h1>
          <p className="small" style={{ marginTop: 3 }}>{settings.firmName} · {clients.length} client{clients.length === 1 ? "" : "s"} on the chase list</p>
        </div>
        <button className="btn btn-p" style={{ marginLeft: "auto" }} onClick={() => setShowAdd(true)}>+ Add client &amp; checklist</button>
      </div>

      <div className="stat-row">
        <div className="stat"><div className="n" style={{ color: "var(--green-d)" }}>{stats.complete}</div><div className="l">COMPLETE</div></div>
        <div className="stat"><div className="n" style={{ color: "var(--amber)" }}>{stats.waiting}</div><div className="l">WAITING ON CLIENT</div></div>
        <div className="stat"><div className="n" style={{ color: "var(--red)" }}>{stats.overdue}</div><div className="l">OVERDUE — CHASE TODAY</div></div>
      </div>

      {clients.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <h3 className="sora" style={{ color: "var(--navy)", fontSize: 18 }}>No clients yet</h3>
          <p className="small" style={{ margin: "7px auto 18px", maxWidth: 380 }}>
            Add your first client, pick the documents you need, and send them their one link. Ledzora chases from there.
          </p>
          <button className="btn btn-p" onClick={() => setShowAdd(true)}>+ Add your first client</button>
        </div>
      ) : (
        clients.map((c) => {
          const st = clientStatus(c);
          const got = receivedCount(c);
          const pct = c.items.length ? Math.round((got / c.items.length) * 100) : 0;
          const lastReminder = c.reminders[c.reminders.length - 1];
          const celebrated = st === "complete" && daysSince(c.items.reduce((a, i) => (i.receivedAt && i.receivedAt > a ? i.receivedAt : a), "")) <= 1;
          return (
            <Link key={c.id} href={`/dashboard/clients/${c.id}`} className={`client-row ${celebrated ? "celebrate" : ""}`}>
              <span className={`avatar ${st === "complete" ? "g" : st === "overdue" ? "r" : "a"}`}>{initials(c.name)}</span>
              <span style={{ minWidth: 0 }}>
                <b style={{ fontSize: 15 }}>{c.name}</b>
                {c.isSample && <span className="tag-sample" style={{ marginLeft: 8 }}>Sample</span>}
                <div className="small" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {got} of {c.items.length} documents in
                  {lastReminder ? ` · last reminder ${fmtDate(lastReminder.sentAt)}${lastReminder.dayMark ? ` (Day ${lastReminder.dayMark})` : ""}` : " · no reminders yet"}
                  {st === "overdue" ? ` · due date passed ${fmtDate(c.dueDate)}` : ""}
                </div>
              </span>
              <span className="prog" style={{ width: 110, marginLeft: "auto" }}>
                <i className={st === "overdue" ? "red" : st === "waiting" ? "amb" : ""} style={{ width: `${pct}%` }} />
              </span>
              <span className={`badge ${st === "complete" ? "b-done" : st === "overdue" ? "b-over" : "b-wait"}`}>
                <span className="dot" />{st === "complete" ? "Complete" : st === "overdue" ? "Overdue" : "Waiting"}
              </span>
              {st !== "complete" && (
                <button
                  className="btn btn-s btn-sm"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); sendReminder(c); }}
                >
                  Send reminder
                </button>
              )}
            </Link>
          );
        })
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <h3 className="sora" style={{ color: "var(--navy)", fontSize: 15.5 }}>The automatic chase rule</h3>
        <p style={{ fontSize: 14, marginTop: 5, color: "#33404d" }}>
          If a client still owes documents, Ledzora reminds them automatically on{" "}
          <b>Day {settings.reminderDay1}</b> and again on <b>Day {settings.reminderDay2}</b> after the checklist
          is sent. Fixed rule, same for every client — change the days in Settings. Reminders stop the
          moment a list is complete.
        </p>
        {hasSamples && (
          <>
            <hr className="sep" />
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <p className="small">The four sample clients show how the board reads. Remove them when you are ready for real ones.</p>
              <button
                className="btn btn-g btn-sm"
                style={{ marginLeft: "auto", color: "var(--red)" }}
                onClick={() => { clearSampleData(); refresh(); toast("Sample data cleared"); }}
              >
                Clear sample data
              </button>
            </div>
          </>
        )}
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={createClient}>
            <h3 className="sora" style={{ color: "var(--navy)", fontSize: 18 }}>Add client &amp; create checklist</h3>
            <p className="small" style={{ margin: "4px 0 16px" }}>The client gets one link. Everything on the list is chased automatically.</p>
            <div className="field">
              <label htmlFor="biz">Business name</label>
              <input id="biz" className="input" value={biz} onChange={(e) => setBiz(e.target.value)} placeholder="Northgate Dental" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label htmlFor="contact">Contact first name</label>
                <input id="contact" className="input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Sarah" />
              </div>
              <div className="field">
                <label htmlFor="cemail">Contact email</label>
                <input id="cemail" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@client.com" />
              </div>
            </div>
            <div className="field">
              <label>Month-end documents to chase</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {PRESET_ITEMS.map((p) => (
                  <label key={p} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5, fontWeight: 400, color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 9, padding: "8px 10px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={picked.includes(p)}
                      onChange={(e) => setPicked(e.target.checked ? [...picked, p] : picked.filter((x) => x !== p))}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label htmlFor="custom">Custom item (optional)</label>
                <input id="custom" className="input" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Director's ID" />
              </div>
              <div className="field">
                <label htmlFor="due">Due in (days)</label>
                <input id="due" className="input" type="number" min={1} max={60} value={dueDays} onChange={(e) => setDueDays(Number(e.target.value) || 7)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
              <button type="button" className="btn btn-g" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-p">Create checklist</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
