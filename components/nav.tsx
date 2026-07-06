"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/components/notifications-bell";

export function Nav() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = session?.user;

  return (
    <nav className="border-b border-zinc-800 px-6 py-4 sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-white font-bold text-lg tracking-tight shrink-0">
          Prompt<span className="text-violet-400">Vault</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/browse" className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
            Browse
          </Link>
          <Link href="/browse?sort=trending" className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
            Trending
          </Link>
          <Link href="/browse?sort=newest" className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
            New
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isPending ? (
            <div className="w-20 h-8 bg-zinc-800 rounded animate-pulse" />
          ) : user ? (
            <>
              {(user.role === "creator" || user.role === "admin") && (
                <Link href="/upload">
                  <Button size="sm" className="hidden sm:flex bg-violet-600 hover:bg-violet-500 text-white text-sm">
                    + Sell a Prompt
                  </Button>
                </Link>
              )}
              {user.role === "buyer" && (
                <Link href="/onboard">
                  <Button size="sm" variant="outline" className="hidden sm:flex border-zinc-700 text-zinc-300 hover:text-white text-sm">
                    Become a Creator
                  </Button>
                </Link>
              )}
              <NotificationsBell />
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    {(user.role === "creator" || user.role === "admin") && (
                      <>
                        <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                          Dashboard
                        </Link>
                        <Link href="/upload" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                          Upload Prompt
                        </Link>
                        {(user as { username?: string }).username && (
                          <Link href={`/creator/${(user as { username?: string }).username}`} className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                            My Profile
                          </Link>
                        )}
                      </>
                    )}
                    {user.role === "buyer" && (
                      <Link href="/onboard" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                        Become a Creator
                      </Link>
                    )}
                    <Link href="/purchases" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      My Purchases
                    </Link>
                    <Link href="/settings" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setMenuOpen(false)}>
                      Settings
                    </Link>
                    <div className="border-t border-zinc-800">
                      <button
                        onClick={() => { signOut(); setMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
