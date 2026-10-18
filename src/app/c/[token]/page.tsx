"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  type ClientRec, findByToken, upsertClient, clientStatus, receivedCount, fmtSize, loadSettings,
} from "@/lib/store";
import { LogoMark, DrawTick } from "@/components/Logo";
import { useToast } from "@/components/Toast";

/**
 * The public client page — the heart of Ledzora.
 * No login. One link. The client taps, uploads, and the tick lands.
 * Mobile-first, per Design Pack Section 9.
 */
export default function ClientUploadPage() {
  const params = useParams<{ token: string }>();
  const toast = useToast();
  const [client, setClient] = useState<ClientRec | null | undefined>(undefined);
  const [firmName, setFirmName] = useState("");
  const [justLanded, setJustLanded] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const targetItem = useRef<string | null>(null);

  useEffect(() => {
    setClient(findByToken(params.token));
    setFirmName(loadSettings().firmName);
  }, [params.token]);

  if (client === undefined) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "26px 16px" }}>
        <div className="skel" style={{ height: 46, marginBottom: 14 }} />
        <div className="skel" style={{ height: 56, marginBottom: 9 }} />
        <div className="skel" style={{ height: 56, marginBottom: 9 }} />
        <div className="skel" style={{ height: 90 }} />
      </div>
    );
  }

  if (client === null) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 16px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><LogoMark size={52} /></div>
        <h1 className="sora" style={{ fontSize: 20, color: "var(--navy)" }}>This link is not active here</h1>
        <p className="small" style={{ marginTop: 8, lineHeight: 1.6 }}>
          This Ledzora demo keeps its data on the bookkeeper&rsquo;s own device, so a client link only
          opens on the device where the checklist was created. In the production version, links work
          on any phone, anywhere.
        </p>
      </div>
    );
  }

  const got = receivedCount(client);
  const total = client.items.length;
  const complete = clientStatus(client) === "complete";
  const firstPending = client.items.find((i) => !i.received);

  function receive(itemId: string, file: File) {
    const items = client!.items.map((i) =>
      i.id === itemId
        ? { ...i, received: true, receivedAt: new Date().toISOString(), fileName: file.name, fileSize: file.size, fileType: file.type }
        : i
    );
    const next = { ...client!, items };
    upsertClient(next);
    setClient(next);
    setJustLanded(itemId + file.name);
    const label = client!.items.find((i) => i.id === itemId)?.label;
    toast(`${label} received — thank you`);
  }

  function pickFor(itemId: string) {
    targetItem.current = itemId;
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const itemId = targetItem.current || firstPending?.id;
    if (file && itemId) receive(itemId, file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && firstPending) receive(firstPending.id, file);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "18px 16px 44px" }}>
      <input ref={fileRef} type="file" hidden onChange={onFile} accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx,.doc,.docx" />

      {/* navy identity bar */}
      <div style={{ background: "var(--navy)", color: "#fff", borderRadius: 12, padding: "12px 15px", display: "flex", alignItems: "center", gap: 10 }}>
        <LogoMark size={30} bg="#12365C" />
        <b className="sora" style={{ fontSize: 15 }}>ledzora<span style={{ color: "var(--green)" }}>&#10003;</span></b>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.85 }}>Secure link</span>
      </div>

      <p style={{ fontSize: 15, margin: "18px 0 4px" }}>
        Hi {client.contactName} — <b>{client.name}</b> is sending these documents to{" "}
        <b>{firmName}</b>:
      </p>
      <p className="small" style={{ marginBottom: 14 }}>
        {complete
          ? "Everything is in. There is nothing left to send."
          : `${total - got} of ${total} still to send. Tap a document to upload it — a photo from your phone is fine.`}
      </p>

      {client.items.map((i) => (
        <div key={i.id} className="checkrow" style={{ padding: "13px 14px" }}>
          <span className={`checkbox ${i.received ? "done" : ""}`} style={{ width: 26, height: 26 }}>
            {i.received && <DrawTick size={15} color="#fff" animateKey={justLanded || i.receivedAt || i.id} />}
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ fontWeight: i.received ? 400 : 600 }}>{i.label}</span>
            {i.received && (
              <div className="small" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {i.fileName} {i.fileSize ? `· ${fmtSize(i.fileSize)}` : ""} · received
              </div>
            )}
          </span>
          {!i.received && (
            <button className="btn btn-p btn-sm" style={{ marginLeft: "auto", minHeight: 42, padding: "8px 15px" }} onClick={() => pickFor(i.id)}>
              Upload
            </button>
          )}
        </div>
      ))}

      {!complete && firstPending && (
        <div
          className={`dropzone ${dragging ? "dragging" : ""}`}
          style={{ marginTop: 14, cursor: "pointer" }}
          onClick={() => pickFor(firstPending.id)}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          aria-label={`Upload ${firstPending.label}`}
        >
          <div className="sora" style={{ fontWeight: 700, color: "var(--green-d)", fontSize: 16.5 }}>
            + Upload {firstPending.label}
          </div>
          <p className="small" style={{ marginTop: 3 }}>Take a photo or pick a file · PDF, JPG, PNG</p>
        </div>
      )}

      {complete && (
        <div style={{ background: "var(--green-bg)", border: "1.5px solid var(--green)", borderRadius: 14, padding: "18px", textAlign: "center", marginTop: 14 }}>
          <DrawTick size={30} animateKey={"done" + got} />
          <p className="sora" style={{ fontWeight: 700, color: "var(--green-d)", fontSize: 16, marginTop: 4 }}>All documents received</p>
          <p className="small">{firmName} has everything they need. Thank you, {client.contactName}.</p>
        </div>
      )}

      {/* trust strip — frosted panel (glass use #3) */}
      <div className="frost" style={{ borderRadius: 12, padding: "12px 14px", marginTop: 16, fontSize: 12.5, color: "var(--muted)", display: "flex", gap: 9 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0E2A47" strokeWidth="2" strokeLinecap="round" style={{ flex: "none", marginTop: 1 }}>
          <rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" />
        </svg>
        <span>Your files go only to {client.name}&rsquo;s bookkeeper at {firmName}. Nobody else can see them, and this page never asks for a password.</span>
      </div>

      <p style={{ textAlign: "center", marginTop: 16, fontSize: 13.5, color: "var(--muted)" }}>
        <b style={{ color: "var(--ink)" }}>{got} of {total} received</b> · Thank you
      </p>
    </div>
  );
}
