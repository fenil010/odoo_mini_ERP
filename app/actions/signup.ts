"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { DB_ROLE_TO_KEY, ROLE_DASHBOARD } from "@/lib/auth/auth";
import type { RoleKey } from "@/app/dashboard/role-data";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum(["SALES", "PURCHASE", "MANUFACTURING", "INVENTORY"]),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type SignupState = {
  error?: string;
  success?: boolean;
};

export async function signupAction(prevState: SignupState | null, formData: FormData): Promise<SignupState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  const result = signupSchema.safeParse({ name, email, role, password });
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid inputs.";
    return { error: firstError };
  }

  const validatedData = result.data;
  const normalizedEmail = validatedData.email.trim().toLowerCase();

  let redirectUrl: string | null = null;

  try {
    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;
    if (existingUsers.length > 0) {
      return { error: "A user with this email already exists." };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    // Insert user
    const insertResult = await sql<{ id: number }[]>`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${validatedData.name}, ${normalizedEmail}, ${passwordHash}, ${validatedData.role})
      RETURNING id
    `;

    const newUser = insertResult[0];
    if (!newUser) {
      return { error: "Failed to create user. Please try again." };
    }

    // Map role to roleKey
    const roleKey = DB_ROLE_TO_KEY[validatedData.role] as RoleKey;

    // Create session and set HttpOnly cookie
    await createSession(newUser.id, validatedData.role, roleKey);

    redirectUrl = ROLE_DASHBOARD[roleKey];
  } catch (error) {
    console.error("[signupAction] error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return { success: true };
}
