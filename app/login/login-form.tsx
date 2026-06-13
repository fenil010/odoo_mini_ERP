"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";

const demoPassword = "Password@123";
const demoUsers = [
  {
    role: "Admin",
    email: "admin@minierp.local",
    password: demoPassword,
  },
  {
    role: "Sales User",
    email: "sales@minierp.local",
    password: demoPassword,
  },
  {
    role: "Purchase User",
    email: "purchase@minierp.local",
    password: demoPassword,
  },
  {
    role: "Manufacturing User",
    email: "manufacturing@minierp.local",
    password: demoPassword,
  },
  {
    role: "Inventory Manager",
    email: "inventory@minierp.local",
    password: demoPassword,
  },
  {
    role: "Business Owner",
    email: "owner@minierp.local",
    password: demoPassword,
  },
];

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function applyDemoUser(user: (typeof demoUsers)[number]) {
    setEmail(user.email);
    setPassword(user.password);
    setSelectedRole(user.role);
    setError("");
    setIsMenuOpen(false);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed. Please try again.");
        return;
      }

      // Server set the HttpOnly cookie — redirect to the dashboard
      router.push(data.redirectTo);
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleLogin}>
      <div className="relative">
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="demo-user-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-12 w-full items-center justify-between rounded-lg border border-[#cfc3ad] bg-white px-4 text-left text-sm font-semibold text-[#24332d] transition hover:bg-[#fffaf0] focus:border-[#176b5d] focus:outline-none focus:ring-2 focus:ring-[#176b5d]/20"
        >
          <span>{selectedRole ? `Demo user: ${selectedRole}` : "Choose demo user"}</span>
          <span className="text-lg leading-none">{isMenuOpen ? "-" : "+"}</span>
        </button>

        {isMenuOpen ? (
          <div
            id="demo-user-menu"
            className="absolute left-0 right-0 top-14 z-10 max-h-80 overflow-auto rounded-lg border border-[#d9cfbd] bg-white p-2 shadow-xl shadow-[#8a7d681f]"
          >
            {demoUsers.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => applyDemoUser(user)}
                className="w-full rounded-lg px-3 py-3 text-left transition hover:bg-[#eef7f3] focus:bg-[#eef7f3] focus:outline-none"
              >
                <span className="block text-sm font-semibold text-[#202a25]">{user.role}</span>
                <span className="mt-1 block break-all text-xs text-[#53645c]">
                  {user.email}
                </span>
                <span className="mt-1 block text-xs text-[#68756e]">
                  Password: {user.password}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-semibold text-[#2b3933]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSelectedRole("");
            setError("");
          }}
          className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-[#2b3933]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
          className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
          placeholder="Enter your password"
        />
      </div>

      {error ? (
        <p
          className="rounded-lg border border-[#e4b7a3] bg-[#fff2eb] px-3 py-2 text-sm font-medium text-[#8b3d1e]"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 h-12 rounded-lg bg-[#176b5d] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#12574b] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
