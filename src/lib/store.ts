"use client";

/* ------------------------------------------------------------------ */
/* Ledzora data layer (MVP)                                            */
/* Everything persists in the browser's localStorage. The shapes here  */
/* mirror the production database schema one-to-one, so swapping this  */
/* file for API calls later does not change any page.                  */
/* ------------------------------------------------------------------ */

export interface ChecklistItem {
  id: string;
  label: string;
  received: boolean;
  receivedAt?: string; // ISO
  fileName?: string;
  fileSize?: number; // bytes
  fileType?: string;
}

export interface Reminder {
  id: string;
  sentAt: string; // ISO
  kind: "manual" | "auto";
  dayMark?: number; // e.g. 3 or 7 for scheduled auto reminders
  note: string;
}

export type ClientStatus = "complete" | "waiting" | "overdue";

export interface ClientRec {
  id: string;
  name: string; // business name, e.g. "Northgate Dental"
  contactName: string; // person, e.g. "Sarah"
  email: string;
  token: string; // public upload link token: /c/<token>
  createdAt: string; // ISO — checklist sent date
  dueDate: string; // ISO — items pending past this date => overdue
  items: ChecklistItem[];
  reminders: Reminder[];
  isSample?: boolean;
}

export interface FirmSettings {
  firmName: string;
  reminderDay1: number; // default 3
  reminderDay2: number; // default 7
  periodLabel: string; // e.g. "October Close"
}

export interface Session {
  name: string;
  email: string;
  firmName: string;
}

const K = {
  clients: "ledzora:clients",
  settings: "ledzora:settings",
  session: "ledzora:session",
  users: "ledzora:users",
  seeded: "ledzora:seeded-v1",
};

/* ------------------------------ ids ------------------------------ */

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function newToken(): string {
  return (
    Math.random().toString(36).slice(2, 8) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

/* ---------------------------- settings ---------------------------- */

export const DEFAULT_SETTINGS: FirmSettings = {
  firmName: "My Bookkeeping Firm",
  reminderDay1: 3,
  reminderDay2: 7,
  periodLabel: "This month's close",
};

export function loadSettings(): FirmSettings {
  try {
    const raw = localStorage.getItem(K.settings);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: FirmSettings) {
  localStorage.setItem(K.settings, JSON.stringify(s));
}

/* ----------------------------- session ---------------------------- */

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(K.session);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session | null) {
  if (s) localStorage.setItem(K.session, JSON.stringify(s));
  else localStorage.removeItem(K.session);
}

interface StoredUser extends Session {
  password: string;
}

export function signupUser(name: string, email: string, firmName: string, password: string): Session {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(K.users) || "[]");
  const session: Session = { name, email, firmName };
  users.push({ ...session, password });
  localStorage.setItem(K.users, JSON.stringify(users));
  saveSession(session);
  const settings = loadSettings();
  saveSettings({ ...settings, firmName });
  return session;
}

export function loginUser(email: string, password: string): Session | null {
  const users: StoredUser[] = JSON.parse(localStorage.getItem(K.users) || "[]");
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  // Demo-grade auth: a known email signs in; an unknown email creates a
  // lightweight demo session so the product can be tried instantly.
  if (found) {
    if (found.password !== password) return null;
    const session: Session = { name: found.name, email: found.email, firmName: found.firmName };
    saveSession(session);
    return session;
  }
  const session: Session = { name: email.split("@")[0] || "Bookkeeper", email, firmName: loadSettings().firmName };
  users.push({ ...session, password });
  localStorage.setItem(K.users, JSON.stringify(users));
  saveSession(session);
  return session;
}

/* ----------------------------- clients ---------------------------- */

export function loadClients(): ClientRec[] {
  try {
    const raw = localStorage.getItem(K.clients);
    if (raw) return JSON.parse(raw) as ClientRec[];
  } catch {}
  return [];
}

export function saveClients(clients: ClientRec[]) {
  localStorage.setItem(K.clients, JSON.stringify(clients));
}

export function findByToken(token: string): ClientRec | null {
  return loadClients().find((c) => c.token === token) || null;
}

export function upsertClient(rec: ClientRec) {
  const clients = loadClients();
  const i = clients.findIndex((c) => c.id === rec.id);
  if (i >= 0) clients[i] = rec;
  else clients.push(rec);
  saveClients(clients);
}

export function deleteClient(id: string) {
  saveClients(loadClients().filter((c) => c.id !== id));
}

/* --------------------------- status logic -------------------------- */
/* Rule-based only. No AI anywhere in this product.                    */

export function clientStatus(c: ClientRec, now = new Date()): ClientStatus {
  if (c.items.length > 0 && c.items.every((i) => i.received)) return "complete";
  if (c.items.some((i) => !i.received) && now.getTime() > new Date(c.dueDate).getTime())
    return "overdue";
  return "waiting";
}

export function receivedCount(c: ClientRec): number {
  return c.items.filter((i) => i.received).length;
}

export function daysSince(iso: string, now = new Date()): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000);
}

/**
 * The fixed automatic-reminder rule.
 * If a client still has pending items when Day N arrives (and no reminder
 * for that day-mark has been recorded), a reminder is due. In production a
 * server cron sends the email; in this MVP the event is recorded in-app
 * the moment the rule fires, so the chase history is always truthful.
 * Returns the updated client if a reminder fired, otherwise null.
 */
export function fireDueAutoReminders(c: ClientRec, settings: FirmSettings, now = new Date()): ClientRec | null {
  if (clientStatus(c, now) === "complete") return null;
  const elapsed = daysSince(c.createdAt, now);
  let changed = false;
  const reminders = [...c.reminders];
  for (const day of [settings.reminderDay1, settings.reminderDay2]) {
    if (elapsed >= day && !reminders.some((r) => r.kind === "auto" && r.dayMark === day)) {
      reminders.push({
        id: uid(),
        sentAt: now.toISOString(),
        kind: "auto",
        dayMark: day,
        note: `Automatic reminder — Day ${day} rule`,
      });
      changed = true;
    }
  }
  return changed ? { ...c, reminders } : null;
}

/* --------------------------- preset items -------------------------- */

export const PRESET_ITEMS: string[] = [
  "Bank statements",
  "Receipts & invoices",
  "Payroll records",
  "Sales invoices",
  "Credit card statements",
  "Loan / finance statements",
  "VAT receipts",
  "Mileage log",
];

/* ----------------------------- seed data --------------------------- */

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function item(label: string, received = false, daysAgoReceived?: number): ChecklistItem {
  return {
    id: uid() + label.length,
    label,
    received,
    receivedAt: received ? isoDaysFromNow(-(daysAgoReceived ?? 1)) : undefined,
    fileName: received ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".pdf" : undefined,
    fileSize: received ? 184320 : undefined,
    fileType: received ? "application/pdf" : undefined,
  };
}

export function seedSampleData(force = false): ClientRec[] {
  const existing = loadClients();
  if (!force && localStorage.getItem(K.seeded)) return existing;
  if (existing.length > 0 && !force) {
    localStorage.setItem(K.seeded, "1");
    return existing;
  }
  const samples: ClientRec[] = [
    {
      id: "sample-bluebird",
      name: "Bluebird Bakery",
      contactName: "Emma",
      email: "emma@bluebirdbakery.example",
      token: "bluebird-demo",
      createdAt: isoDaysFromNow(-6),
      dueDate: isoDaysFromNow(1),
      isSample: true,
      items: [
        item("Bank statements", true, 2),
        item("Receipts & invoices", true, 2),
        item("Payroll records", true, 1),
        item("Sales invoices", true, 1),
        item("Credit card statements", true, 1),
        item("VAT receipts", true, 0),
      ],
      reminders: [
        { id: uid(), sentAt: isoDaysFromNow(-3), kind: "auto", dayMark: 3, note: "Automatic reminder — Day 3 rule" },
      ],
    },
    {
      id: "sample-northgate",
      name: "Northgate Dental",
      contactName: "Sarah",
      email: "sarah@northgatedental.example",
      token: "northgate-demo",
      createdAt: isoDaysFromNow(-4),
      dueDate: isoDaysFromNow(3),
      isSample: true,
      items: [
        item("Bank statements", true, 2),
        item("Receipts & invoices", true, 2),
        item("Payroll records", false),
        item("Sales invoices", true, 1),
        item("Credit card statements", true, 1),
        item("VAT receipts", false),
      ],
      reminders: [
        { id: uid(), sentAt: isoDaysFromNow(-1), kind: "auto", dayMark: 3, note: "Automatic reminder — Day 3 rule" },
      ],
    },
    {
      id: "sample-riverbend",
      name: "Riverbend Cafe",
      contactName: "Marco",
      email: "marco@riverbendcafe.example",
      token: "riverbend-demo",
      createdAt: isoDaysFromNow(-11),
      dueDate: isoDaysFromNow(-4),
      isSample: true,
      items: [
        item("Bank statements", true, 9),
        item("Receipts & invoices", false),
        item("Payroll records", false),
        item("Sales invoices", false),
        item("Credit card statements", false),
        item("Mileage log", false),
      ],
      reminders: [
        { id: uid(), sentAt: isoDaysFromNow(-8), kind: "auto", dayMark: 3, note: "Automatic reminder — Day 3 rule" },
        { id: uid(), sentAt: isoDaysFromNow(-4), kind: "auto", dayMark: 7, note: "Automatic reminder — Day 7 rule" },
      ],
    },
    {
      id: "sample-harbor",
      name: "Harbor Salon",
      contactName: "Priya",
      email: "priya@harborsalon.example",
      token: "harbor-demo",
      createdAt: isoDaysFromNow(-5),
      dueDate: isoDaysFromNow(2),
      isSample: true,
      items: [
        item("Bank statements", true, 3),
        item("Receipts & invoices", true, 3),
        item("Payroll records", true, 2),
        item("Sales invoices", true, 2),
        item("Credit card statements", true, 1),
      ],
      reminders: [],
    },
  ];
  const merged = force ? samples : [...existing, ...samples];
  saveClients(merged);
  localStorage.setItem(K.seeded, "1");
  return merged;
}

export function clearSampleData(): ClientRec[] {
  const kept = loadClients().filter((c) => !c.isSample);
  saveClients(kept);
  return kept;
}

/* ---------------------------- formatting --------------------------- */

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export function fmtSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
