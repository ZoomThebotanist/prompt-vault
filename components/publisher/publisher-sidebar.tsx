"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Send, Calendar, BarChart3, Users, FolderOpen,
  Settings, Zap, ChevronLeft, ArrowLeft
} from "lucide-react";

const NAV = [
  { href: "/publisher",            label: "Overview",    icon: LayoutDashboard },
  { href: "/publisher/queue",      label: "Queue",       icon: Send },
  { href: "/publisher/compose",    label: "Compose",     icon: Zap },
  { href: "/publisher/calendar",   label: "Calendar",    icon: Calendar },
  { href: "/publisher/campaigns",  label: "Campaigns",   icon: FolderOpen },
  { href: "/publisher/analytics",  label: "Analytics",   icon: BarChart3 },
  { href: "/publisher/accounts",   label: "Accounts",    icon: Users },
];

export function PublisherSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Publisher</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Prompt Vault</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2">
        <div className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/publisher"
              ? pathname === "/publisher"
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Back to creator dashboard */}
      <div className="px-2 pb-4 border-t border-zinc-800 pt-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Creator Dashboard
        </Link>
      </div>
    </aside>
  );
}
