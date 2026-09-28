"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  Loader2,
  Trash2,
  Check,
  X,
  PhoneCall,
  Search,
  StickyNote,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  wilaya: string | null;
  quantity: number | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

interface Summary {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  CONTACTED: number;
  total: number;
}

const TABS = ["ALL", "PENDING", "APPROVED", "CONTACTED", "REJECTED"] as const;

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminLeadsPage() {
  const { t } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab !== "ALL") params.set("status", tab);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
      setSummary(data.summary || null);
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const setStatus = async (id: string, status: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
        load();
      }
    } finally {
      setBusyId(null);
    }
  };

  const saveNotes = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft[id] ?? "" }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === id
              ? { ...l, notes: (notesDraft[id] ?? "").trim() || null }
              : l
          )
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("leads.deleteConfirm"))) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        load();
      }
    } finally {
      setBusyId(null);
    }
  };

  const copyPhone = async (id: string, phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-purple-900">
          {t("leads.title")}
        </h1>
        <p className="mt-1 text-sm text-purple-500">{t("leads.subtitle")}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label={t("leads.pending")}
          value={summary?.PENDING ?? 0}
          active={tab === "PENDING"}
          onClick={() => setTab(tab === "PENDING" ? "ALL" : "PENDING")}
          tone="text-amber-600"
        />
        <SummaryCard
          label={t("leads.approved")}
          value={summary?.APPROVED ?? 0}
          active={tab === "APPROVED"}
          onClick={() => setTab(tab === "APPROVED" ? "ALL" : "APPROVED")}
          tone="text-green-600"
        />
        <SummaryCard
          label={t("leads.contacted")}
          value={summary?.CONTACTED ?? 0}
          active={tab === "CONTACTED"}
          onClick={() => setTab(tab === "CONTACTED" ? "ALL" : "CONTACTED")}
          tone="text-blue-600"
        />
        <SummaryCard
          label={t("leads.all")}
          value={summary?.total ?? 0}
          active={tab === "ALL"}
          onClick={() => setTab("ALL")}
          tone="text-purple-600"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("leads.search")}
          className="w-full rounded-full border border-purple-200 bg-white py-2.5 pl-10 pr-4 text-sm text-purple-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-purple-400" />
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-2xl border border-purple-100 bg-white py-16 text-center text-sm text-purple-400">
          {summary?.total === 0 ? t("leads.empty") : t("leads.noLeads")}
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-purple-100 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-purple-900">{lead.name}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        STATUS_STYLE[lead.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t(`leads.${lead.status.toLowerCase()}`) || lead.status}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-purple-500">
                    <a
                      href={`tel:${lead.phone}`}
                      dir="ltr"
                      className="inline-flex items-center gap-1.5 hover:text-purple-700"
                    >
                      <PhoneCall size={13} />
                      {lead.phone}
                    </a>
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        dir="ltr"
                        className="hover:text-purple-700"
                      >
                        {lead.email}
                      </a>
                    )}
                    {lead.wilaya && <span>{lead.wilaya}</span>}
                    {lead.quantity != null && (
                      <span>× {lead.quantity}</span>
                    )}
                  </div>

                  {lead.message && (
                    <p className="mt-2.5 rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-700">
                      {lead.message}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-purple-400">
                    {t("leads.received")}:{" "}
                    {new Date(lead.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  <IconAction
                    title={copied === lead.id ? t("leads.copied") : t("leads.copyPhone")}
                    onClick={() => copyPhone(lead.id, lead.phone)}
                  >
                    <StickyNote size={15} />
                  </IconAction>
                  {lead.status !== "APPROVED" && (
                    <IconAction
                      title={t("leads.approve")}
                      tone="hover:bg-green-100 hover:text-green-600"
                      disabled={busyId === lead.id}
                      onClick={() => setStatus(lead.id, "APPROVED")}
                    >
                      <Check size={15} />
                    </IconAction>
                  )}
                  {lead.status !== "CONTACTED" && (
                    <IconAction
                      title={t("leads.markContacted")}
                      tone="hover:bg-blue-100 hover:text-blue-600"
                      disabled={busyId === lead.id}
                      onClick={() => setStatus(lead.id, "CONTACTED")}
                    >
                      <PhoneCall size={15} />
                    </IconAction>
                  )}
                  {lead.status !== "REJECTED" && (
                    <IconAction
                      title={t("leads.reject")}
                      tone="hover:bg-red-100 hover:text-red-600"
                      disabled={busyId === lead.id}
                      onClick={() => setStatus(lead.id, "REJECTED")}
                    >
                      <X size={15} />
                    </IconAction>
                  )}
                  <IconAction
                    title="Delete"
                    tone="hover:bg-red-100 hover:text-red-600"
                    disabled={busyId === lead.id}
                    onClick={() => remove(lead.id)}
                  >
                    <Trash2 size={15} />
                  </IconAction>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4 border-t border-purple-50 pt-3">
                <textarea
                  rows={2}
                  value={notesDraft[lead.id] ?? lead.notes ?? ""}
                  onChange={(e) =>
                    setNotesDraft((prev) => ({ ...prev, [lead.id]: e.target.value }))
                  }
                  placeholder={t("leads.notesPlaceholder")}
                  className="w-full resize-y rounded-lg border border-purple-200 px-3 py-2 text-sm text-purple-900 placeholder:text-purple-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => saveNotes(lead.id)}
                    disabled={busyId === lead.id}
                    className="rounded-full bg-purple-100 px-4 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-200 disabled:opacity-60"
                  >
                    {t("leads.saveNotes")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  active,
  onClick,
  tone,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  tone: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-colors ${
        active
          ? "border-purple-400 bg-purple-50"
          : "border-purple-100 bg-white hover:bg-purple-50"
      }`}
    >
      <p className={`font-serif text-2xl font-bold ${tone}`}>{value}</p>
      <p className="mt-0.5 text-xs text-purple-500">{label}</p>
    </button>
  );
}

function IconAction({
  children,
  onClick,
  title,
  tone = "hover:bg-purple-100 hover:text-purple-600",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  tone?: string;
  disabled?: boolean;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-2 text-purple-400 transition-colors disabled:opacity-40 ${tone}`}
    >
      {children}
    </button>
  );
}
