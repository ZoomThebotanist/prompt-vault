"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/prompts", label: "Prompts" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/payouts", label: "Payouts" },
  { href: "/publisher", label: "🚀 Publisher" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto">
      {TABS.map((tab) => {
        const active = tab.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              active ? "border-violet-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
