"use client";

import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { NotificationsBell } from "@/components/notifications-bell";
import { Menu, X, ChevronDown } from "lucide-react";

export function Nav() {
  const { data: session, isPending } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const user = session?.user;

  // Close user menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    function handler() { if (window.innerWidth >= 768) setMobileMenuOpen(false); }
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <>
      <nav className="border-b border-zinc-800 px-4 sm:px-6 py-4 sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="text-white font-bold text-lg tracking-tight shrink-0">
            Prompt<span className="text-violet-400">Vault</span>
          </Link>

          {/* Desktop center nav */}
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
            <Link href="/become-a-creator" className="text-sm text-violet-400 hover:text-violet-300 px-3 py-1.5 rounded-md hover:bg-violet-500/10 transition-colors font-medium">
              Become a Creator
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isPending ? (
              <div className="w-20 h-8 bg-zinc-800 rounded animate-pulse" />
            ) : user ? (
              <>
                {(user.role === "creator" || user.role === "admin") && (
                  <Link href="/upload">
                    <Button size="sm" className="hidden sm:flex bg-violet-600 hover:bg-violet-500 text-white text-sm">
                      + Sell
                    </Button>
                  </Link>
                )}
                {user.role === "buyer" && (
                  <Link href="/become-a-creator" className="hidden sm:flex">
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white text-sm">
                      Become a Creator
                    </Button>
                  </Link>
                )}
                <NotificationsBell />
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                  >
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      {(user.role === "creator" || user.role === "admin") && (
                        <>
                          <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            Dashboard
                          </Link>
                          <Link href="/upload" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            Upload Product
                          </Link>
                          {(user as { username?: string }).username && (
                            <Link href={`/creator/${(user as { username?: string }).username}`} className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setUserMenuOpen(false)}>
                              My Profile
                            </Link>
                          )}
                        </>
                      )}
                      {user.role === "buyer" && (
                        <Link href="/become-a-creator" className="block px-4 py-2.5 text-sm text-violet-400 hover:text-violet-300 hover:bg-zinc-800 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          ✦ Become a Creator
                        </Link>
                      )}
                      <Link href="/purchases" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        My Purchases
                      </Link>
                      <Link href="/settings" className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        Settings
                      </Link>
                      <div className="border-t border-zinc-800">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
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
                <Link href="/login" className="hidden sm:block">
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

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-[65px] left-0 right-0 bg-[#0a0a0a] border-b border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 space-y-1">
              {[
                { href: "/browse", label: "Browse" },
                { href: "/browse?sort=trending", label: "Trending" },
                { href: "/browse?sort=newest", label: "New Arrivals" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/become-a-creator"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"
              >
                ✦ Become a Creator
              </Link>

              {user ? (
                <>
                  <div className="border-t border-zinc-800 my-2" />
                  {(user.role === "creator" || user.role === "admin") && (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/upload" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                        Upload Product
                      </Link>
                    </>
                  )}
                  <Link href="/purchases" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                    My Purchases
                  </Link>
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                    Settings
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-zinc-800 my-2" />
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors text-center">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
