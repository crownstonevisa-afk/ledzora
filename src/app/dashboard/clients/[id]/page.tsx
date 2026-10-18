"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  type ClientRec, loadClients, upsertClient, deleteClient, clientStatus,
  receivedCount, fmtDate, fmtSize, uid, daysSince,
} from "@/lib/store";
import { DrawTick } from "@/components/Logo";
import { useToast } from "@/components/Toast";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [client, setClient] = useState<ClientRec | null | undefined>(undefined);
  const [newItem, setNewItem] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    setClient(loadClients().find((c) => c.id === params.id) || null);
  }, [params.id]);

  if (client === undefined) {
    return (
      <div>
        <div className="skel" style={{ width: 220, height: 26, marginBottom: 14 }} />
        <div className="skel" style={{ height: 120, marginBottom: 12 }} />
        <div className="skel" style={{ height: 56, marginBottom: 9 }} />
        <div className="skel" style={{ height: 56 }} />
      </div>
    );
  }
  if (client === null) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 38 }}>
        <h3 className="sora" style={{ color: "var(--navy)" }}>Client not found</h3>
        <p className="small" style={{ margin: "6px 0 16px" }}>This client may have been removed.</p>
        <Link href="/dashboard" className="btn btn-p">Back to dashboard</Link>
      </div>
    );
  }

  const st = clientStatus(client);
  const got = receivedCount(client);
  const link = `${origin}/c/${client.token}`;

  function update(next: ClientRec) {
    upsertClient(next);
    setClient(next);
  }

  function toggleItem(itemId: string) {
    const items = client!.items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            received: !i.received,
            receivedAt: !i.received ? new Date().toISOString() : undefined,
            fileName: !i.received ? i.fileName || "marked-received.pdf" : undefined,
          }
        : i
    );
    update({ ...client!, items });
  }

  function removeItem(itemId: string) {
    update({ ...client!, items: client!.items.filter((i) => i.id !== itemId) });
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (newItem.trim().length < 2) return;
    update({ ...client!, items: [...client!.items, { id: uid(), label: newItem.trim(), received: false }] });
    setNewItem("");
    toast("Item added to the checklist");
  }

  function sendReminder() {
    update({
      ...client!,
      reminders: [
        ...client!.reminders,
        { id: uid(), sentAt: new Date().toISOString(), kind: "manual", note: "Manual reminder — sent from client page" },
      ],
    });
    toast(`Reminder sent to ${client!.name}`);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      toast("Client link copied");
    } catch {
      toast("Copy failed — long-press the link to copy it", "error");
    }
  }

  return (
    <div>
      <Link href="/dashboard" style={{ fontSize: 13.5, textDecoration: "none" }}>&larr; All clients</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
        <h1 className="page-h">{client.name}</h1>
        {client.isSample && <span className="tag-sample">Sample data</span>}
        <span className={`badge ${st === "complete" ? "b-done" : st === "overdue" ? "b-over" : "b-wait"}`}>
          <span className="dot" />{st === "complete" ? "Complete" : st === "overdue" ? "Overdue" : "Waiting"}
        </span>
        {st !== "complete" && (
          <button className="btn btn-p" style={{ marginLeft: "auto" }} onClick={sendReminder}>Send reminder now</button>
        )}
      </div>
      <p className="small" style={{ marginTop: 4 }}>
        Contact: {client.contactName}{client.email ? ` · ${client.email}` : ""} · Checklist sent {fmtDate(client.createdAt)} ({daysSince(client.createdAt)} days ago) · Due {fmtDate(client.dueDate)}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginTop: 20, alignItems: "start" }}>
        <div className="card">
          <h3 className="sora" style={{ color: "var(--navy)", fontSize: 16 }}>
            Checklist — {got} of {client.items.length} received
          </h3>
          <div className="prog" style={{ margin: "12px 0 16px" }}>
            <i className={st === "overdue" ? "red" : st === "waiting" ? "amb" : ""} style={{ width: `${client.items.length ? (got / client.items.length) * 100 : 0}%` }} />
          </div>
          {client.items.map((i) => (
            <div key={i.id} className="checkrow">
              <button
                className={`checkbox ${i.received ? "done" : ""}`}
                onClick={() => toggleItem(i.id)}
                aria-label={i.received ? `Mark ${i.label} as not received` : `Mark ${i.label} as received`}
                style={{ cursor: "pointer" }}
              >
                {i.received && <DrawTick size={14} color="#fff" animateKey={i.receivedAt || i.id} />}
              </button>
              <span style={{ textDecoration: i.received ? "none" : "none" }}>
                {i.label}
                {i.received && i.fileName && (
                  <div className="small">{i.fileName}{i.fileSize ? ` · ${fmtSize(i.fileSize)}` : ""} · {i.receivedAt ? fmtDate(i.receivedAt) : ""}</div>
                )}
              </span>
              <button
                className="btn btn-g btn-sm"
                style={{ marginLeft: "auto", color: "var(--red)", padding: "4px 8px", minHeight: 30 }}
                onClick={() => removeItem(i.id)}
                aria-label={`Remove ${i.label}`}
              >
                Remove
              </button>
            </div>
          ))}
          <form onSubmit={addItem} style={{ display: "flex", gap: 9, marginTop: 12 }}>
            <input className="input" value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add a document to chase…" />
            <button type="submit" className="btn btn-s">Add</button>
          </form>
          <p className="small" style={{ marginTop: 9 }}>Tip: ticking a box yourself records a document you received another way (for example, by email).</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h3 className="sora" style={{ color: "var(--navy)", fontSize: 16 }}>Client upload link</h3>
            <p className="small" style={{ margin: "5px 0 11px" }}>
              Send this one link to {client.contactName}. No login, no app — they tap, upload, and the ticks land here.
            </p>
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 9, padding: "10px 12px", fontFamily: "ui-monospace, monospace", fontSize: 12.5, wordBreak: "break-all" }}>
              {link}
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
              <button className="btn btn-p btn-sm" onClick={copyLink}>Copy link</button>
              <a className="btn btn-s btn-sm" href={link} target="_blank" rel="noreferrer">Open client page</a>
            </div>
          </div>

          <div className="card">
            <h3 className="sora" style={{ color: "var(--navy)", fontSize: 16 }}>Chase history</h3>
            {client.reminders.length === 0 ? (
              <p className="small" style={{ marginTop: 6 }}>No reminders yet. The automatic rule fires on the days set in Settings while items are outstanding.</p>
            ) : (
              <div style={{ marginTop: 8 }}>
                {[...client.reminders].reverse().map((r) => (
                  <div key={r.id} className="kv">
                    <span>{r.note}{r.dayMark ? "" : ""}</span>
                    <span className="small">{fmtDate(r.sentAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ borderColor: "#ecc9c4" }}>
            <h3 className="sora" style={{ color: "var(--red)", fontSize: 15 }}>Danger zone</h3>
            <p className="small" style={{ margin: "5px 0 11px" }}>Removing this client deletes their checklist, link and chase history from this device.</p>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm(`Remove ${client.name}? This cannot be undone.`)) {
                  deleteClient(client.id);
                  router.push("/dashboard");
                }
              }}
            >
              Remove client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
