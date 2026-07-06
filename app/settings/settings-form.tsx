"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  initial: { name: string; username: string; bio: string };
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username: username.trim().toLowerCase(), bio: bio.trim() }),
      });
      const data = await res.json();
      if (!res.ok) setProfileMsg({ type: "error", text: data.error ?? "Failed to save." });
      else setProfileMsg({ type: "success", text: "Profile updated." });
    } catch {
      setProfileMsg({ type: "error", text: "Something went wrong." });
    } finally {
      setProfileLoading(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "Passwords don't match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) setPwMsg({ type: "error", text: data.error ?? "Failed to change password." });
      else {
        setPwMsg({ type: "success", text: "Password changed." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwMsg({ type: "error", text: "Something went wrong." });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-5">Profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Username <span className="text-zinc-500 font-normal">(your public profile URL)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm shrink-0">promptvault.dev/creator/</span>
              <input
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="your-username"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Tell buyers a bit about yourself..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
            <p className="text-xs text-zinc-600 mt-1">{bio.length}/300</p>
          </div>
          {profileMsg && (
            <div className={`text-sm px-4 py-2.5 rounded-lg border ${profileMsg.type === "success" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
              {profileMsg.text}
            </div>
          )}
          <Button
            type="submit"
            disabled={profileLoading}
            className="bg-violet-600 hover:bg-violet-500 text-white px-5 disabled:opacity-50"
          >
            {profileLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-5">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          {pwMsg && (
            <div className={`text-sm px-4 py-2.5 rounded-lg border ${pwMsg.type === "success" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
              {pwMsg.text}
            </div>
          )}
          <Button
            type="submit"
            disabled={pwLoading}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-5 disabled:opacity-50"
          >
            {pwLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Session</h2>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
        >
          Sign out of all devices
        </Button>
      </section>
    </div>
  );
}
