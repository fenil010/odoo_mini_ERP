"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/auth/session";

/**
 * logout — Server Action
 *
 * Deletes the HttpOnly session cookie on the server, then redirects
 * to /login. Call this from a form action to perform a secure logout.
 */
export async function logout() {
  await deleteSession();
  redirect("/login");
}
