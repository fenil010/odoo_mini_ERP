"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").or(z.string().length(0)).nullable(),
  phone: z.string().min(5, "Phone number must be at least 5 digits.").or(z.string().length(0)).nullable(),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createCustomerAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAuth();
  
  if (session.role !== "SALES" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string || null;
  const phone = formData.get("phone") as string || null;

  const result = customerSchema.safeParse({ name, email, phone });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid customer inputs." };
  }

  const c = result.data;

  try {
    await sql.begin(async (tx) => {
      const customerResult = await tx<{ id: number }[]>`
        INSERT INTO customers (name, email, phone)
        VALUES (${c.name}, ${c.email}, ${c.phone})
        RETURNING id
      `;

      const newId = customerResult[0].id;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "customers",
        entityId: newId,
        action: "CREATE",
        newValue: c,
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[createCustomerAction] error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function updateCustomerAction(customerId: number, prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "SALES" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string || null;
  const phone = formData.get("phone") as string || null;

  const result = customerSchema.safeParse({ name, email, phone });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid customer inputs." };
  }

  const c = result.data;

  try {
    const oldResult = await sql`SELECT * FROM customers WHERE id = ${customerId} LIMIT 1`;
    const oldVal = oldResult[0];
    if (!oldVal) {
      return { error: "Customer not found." };
    }

    await sql.begin(async (tx) => {
      await tx`
        UPDATE customers
        SET name = ${c.name},
            email = ${c.email},
            phone = ${c.phone}
        WHERE id = ${customerId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "customers",
        entityId: customerId,
        action: "UPDATE",
        oldValue: oldVal,
        newValue: c,
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[updateCustomerAction] error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteCustomerAction(customerId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "SALES" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const oldResult = await sql`SELECT * FROM customers WHERE id = ${customerId} LIMIT 1`;
    const oldVal = oldResult[0];
    if (!oldVal) {
      return { error: "Customer not found." };
    }

    await sql.begin(async (tx) => {
      await tx`DELETE FROM customers WHERE id = ${customerId}`;
      
      await logAudit(tx, {
        userId: session.userId,
        entityType: "customers",
        entityId: customerId,
        action: "DELETE",
        oldValue: oldVal,
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteCustomerAction] error:", error);
    return { error: "Failed to delete customer. It may be referenced in sales orders." };
  }
}
