"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";

const bomSchema = z.object({
  product_id: z.coerce.number().min(1, "Product is required."),
  items: z.array(
    z.object({
      component_product_id: z.coerce.number().min(1, "Component product is required."),
      quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0."),
    })
  ).min(1, "At least one component item is required."),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createBomAction(
  productId: number,
  items: { component_product_id: number; quantity: number }[]
): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "MANUFACTURING" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const result = bomSchema.safeParse({ product_id: productId, items });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid input." };
  }

  try {
    await sql.begin(async (tx) => {
      const existingBom = await tx`SELECT id FROM boms WHERE product_id = ${productId} LIMIT 1`;
      if (existingBom.length > 0) {
        const oldBomId = existingBom[0].id;
        await tx`DELETE FROM bom_items WHERE bom_id = ${oldBomId}`;
        await tx`DELETE FROM boms WHERE id = ${oldBomId}`;
      }

      const bomResult = await tx<{ id: number }[]>`
        INSERT INTO boms (product_id)
        VALUES (${productId})
        RETURNING id
      `;
      const bomId = bomResult[0].id;

      for (const item of items) {
        await tx`
          INSERT INTO bom_items (bom_id, component_product_id, quantity)
          VALUES (${bomId}, ${item.component_product_id}, ${item.quantity})
        `;
      }

      await logAudit(tx, {
        userId: session.userId,
        entityType: "boms",
        entityId: bomId,
        action: "CREATE",
        newValue: { productId, items },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[createBomAction] error:", error);
    return { error: "Failed to configure Bill of Materials." };
  }
}

export async function deleteBomAction(bomId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "MANUFACTURING" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    await sql.begin(async (tx) => {
      await tx`DELETE FROM bom_items WHERE bom_id = ${bomId}`;
      await tx`DELETE FROM boms WHERE id = ${bomId}`;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "boms",
        entityId: bomId,
        action: "DELETE",
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteBomAction] error:", error);
    return { error: "Failed to delete Bill of Materials." };
  }
}
