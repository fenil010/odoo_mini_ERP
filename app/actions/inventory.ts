"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";
import { createLedgerEntry, allocateStockToWaitingOrders, checkAndStartWaitingMOs } from "@/lib/stock-ledger";

const adjustSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required."),
  delta: z.coerce.number().refine((val) => val !== 0, { message: "Adjustment delta cannot be zero." }),
  reason: z.string().min(2, "Reason must be at least 2 characters."),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function adjustInventoryAction(
  productId: number,
  delta: number,
  reason: string
): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "INVENTORY" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const result = adjustSchema.safeParse({ product_id: productId, delta, reason });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid input." };
  }

  try {
    await sql.begin(async (tx) => {
      await createLedgerEntry(tx, {
        productId,
        movementType: "ADJUSTMENT",
        quantity: delta,
        referenceType: "manual",
        referenceId: productId,
        notes: reason,
      });

      // Allocate stock to waiting orders if adjustment is positive
      if (delta > 0) {
        await allocateStockToWaitingOrders(tx, productId);
        // Automatically check and start other MOs waiting for this component!
        await checkAndStartWaitingMOs(tx, productId, session.userId);
      }

      await logAudit(tx, {
        userId: session.userId,
        entityType: "inventory",
        entityId: productId,
        action: "UPDATE",
        newValue: { delta, reason },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[adjustInventoryAction] error:", error);
    return { error: "Failed to adjust inventory." };
  }
}
