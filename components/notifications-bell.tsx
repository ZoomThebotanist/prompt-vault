"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_ICONS: Record<string, string> = {
  purchase: "💰",
  review: "⭐",
  follow: "👤",
  reply: "💬",
  payout: "💸",
  featured: "🎉",
  update: "📦",
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Poll unread count every 30s
  useEffect(() => {
    fetchNotifications(false);
    const interval = setInterval(() => fetchNotifications(false), 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications(markRead = false) {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {}
  }

  async function handleOpen() {
    const wasOpen = open;
    setOpen(!wasOpen);
    if (!wasOpen && unread > 0) {
      setLoading(true);
      // Fetch latest then mark all read
      await fetchNotifications();
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={async () => {
                  await fetch("/api/notifications", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ markAllRead: true }),
                  });
                  setUnread(0);
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                <p className="text-2xl mb-2">🔔</p>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const inner = (
                  <div className={`px-4 py-3 flex items-start gap-3 hover:bg-zinc-800 transition-colors ${!n.read ? "bg-violet-500/5" : ""}`}>
                    <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${!n.read ? "text-white font-medium" : "text-zinc-300"}`}>
                          {n.title}
                        </p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5" />}
                      </div>
                      {n.body && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-xs text-zinc-600 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );

                return n.actionUrl ? (
                  <Link key={n.id} href={n.actionUrl} onClick={() => setOpen(false)}>
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-zinc-800 px-4 py-2.5">
              <p className="text-xs text-zinc-600 text-center">Last 20 notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
