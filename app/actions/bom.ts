"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import postgres from "postgres";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";

/**
 * checkCircularBom — recursive DFS to detect circular BoM references.
 *
 * Before saving a BoM for `rootProductId` that lists `proposedComponentIds`,
 * we walk every component's BoM recursively. If we ever encounter
 * `rootProductId` again, the BoM would be circular.
 *
 * @param tx          - active transaction client
 * @param rootProductId - the product whose BoM we are about to save
 * @param startComponentIds - the top-level component product IDs being saved
 */
async function checkCircularBom(
  tx: postgres.TransactionSql,
  rootProductId: number,
  startComponentIds: number[]
): Promise<void> {
  // We do a BFS/DFS over the existing BoMs in the database.
  // The proposed new links (startComponentIds → rootProductId) are not yet written,
  // but we simulate them by seeding the queue with startComponentIds.
  const visited = new Set<number>();
  const queue = [...startComponentIds];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === rootProductId) {
      throw new Error(
        "Circular Bill Of Materials detected: saving this BoM would create a production loop."
      );
    }

    if (visited.has(current)) continue;
    visited.add(current);

    // Fetch components of the current product's existing BoM
    const children = await tx<{ component_product_id: number }[]>`
      SELECT bi.component_product_id
      FROM bom_items bi
      JOIN boms b ON b.id = bi.bom_id
      WHERE b.product_id = ${current}
    `;

    for (const child of children) {
      if (!visited.has(child.component_product_id)) {
        queue.push(child.component_product_id);
      }
    }
  }
}

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
      // --- Circular BoM guard (runs BEFORE writing) ---
      const componentIds = items.map((i) => i.component_product_id);
      await checkCircularBom(tx, productId, componentIds);

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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Circular Bill Of Materials")) {
      return { error: msg };
    }
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
