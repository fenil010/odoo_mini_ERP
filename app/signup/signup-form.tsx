"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/signup";

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  return (
    <form action={formAction} className="grid gap-5">
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-[#2b3933]">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
          placeholder="Full name"
        />
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
          className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
          placeholder="you@company.com"
        />
      </div>

      <div>
        <label htmlFor="role" className="text-sm font-semibold text-[#2b3933]">
          Role
        </label>
        <select
          id="role"
          name="role"
          className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
          defaultValue="SALES"
        >
          <option value="SALES">Sales User</option>
          <option value="PURCHASE">Purchase User</option>
          <option value="MANUFACTURING">Manufacturing User</option>
          <option value="INVENTORY">Inventory Manager</option>
        </select>
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-[#2b3933]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
          placeholder="Create a password"
        />
      </div>

      {state?.error ? (
        <p
          className="rounded-lg border border-[#e4b7a3] bg-[#fff2eb] px-3 py-2 text-sm font-medium text-[#8b3d1e]"
          aria-live="polite"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 h-12 rounded-lg bg-[#176b5d] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#12574b] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Creating account…" : "Sign up"}
      </button>
    </form>
  );
}
