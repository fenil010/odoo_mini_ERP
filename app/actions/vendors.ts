"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";

const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").or(z.string().length(0)).nullable(),
  phone: z.string().min(5, "Phone number must be at least 5 digits.").or(z.string().length(0)).nullable(),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createVendorAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAuth();
  
  if (session.role !== "PURCHASE" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string || null;
  const phone = formData.get("phone") as string || null;

  const result = vendorSchema.safeParse({ name, email, phone });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid vendor inputs." };
  }

  const v = result.data;

  const productsSelling = formData.get("products_selling") as string || "";
  const productNames = productsSelling.split(",").map((name) => name.trim()).filter(Boolean);

  try {
    await sql.begin(async (tx) => {
      const vendorResult = await tx<{ id: number }[]>`
        INSERT INTO vendors (name, email, phone)
        VALUES (${v.name}, ${v.email}, ${v.phone})
        RETURNING id
      `;

      const newId = vendorResult[0].id;

      const uniqueNames = Array.from(new Set(productNames));
      if (uniqueNames.length > 0) {
        for (const name of uniqueNames) {
          let productId: number;
          const match = await tx<{ id: number }[]>`
            SELECT id FROM products WHERE LOWER(name) = LOWER(${name}) LIMIT 1
          `;
          if (!match[0]) {
            const sku = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) + '-' + Math.floor(1000 + Math.random() * 9000);
            const newProductResult = await tx<{ id: number }[]>`
              INSERT INTO products (name, sku, sale_price, cost_price, procurement_type, procure_on_demand, product_type)
              VALUES (${name}, ${sku}, 15.00, 10.00, 'BUY', TRUE, 'RAW_MATERIAL')
              RETURNING id
            `;
            productId = newProductResult[0].id;
            await tx`
              INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
              VALUES (${productId}, 0, 0)
            `;
            await logAudit(tx, {
              userId: session.userId,
              entityType: "products",
              entityId: productId,
              action: "CREATE",
              newValue: { name, sku, sale_price: 15.00, cost_price: 10.00, procurement_type: 'BUY', procure_on_demand: true, product_type: 'RAW_MATERIAL' },
            });
          } else {
            productId = match[0].id;
          }
          await tx`
            INSERT INTO product_vendors (product_id, vendor_id)
            VALUES (${productId}, ${newId})
          `;
        }
      }

      await logAudit(tx, {
        userId: session.userId,
        entityType: "vendors",
        entityId: newId,
        action: "CREATE",
        newValue: { ...v, productsSelling },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[createVendorAction] error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function updateVendorAction(vendorId: number, prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "PURCHASE" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string || null;
  const phone = formData.get("phone") as string || null;

  const result = vendorSchema.safeParse({ name, email, phone });
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid vendor inputs." };
  }

  const v = result.data;

  const productsSelling = formData.get("products_selling") as string || "";
  const productNames = productsSelling.split(",").map((name) => name.trim()).filter(Boolean);

  try {
    const oldResult = await sql`SELECT * FROM vendors WHERE id = ${vendorId} LIMIT 1`;
    const oldVal = oldResult[0];
    if (!oldVal) {
      return { error: "Vendor not found." };
    }

    await sql.begin(async (tx) => {
      await tx`
        UPDATE vendors
        SET name = ${v.name},
            email = ${v.email},
            phone = ${v.phone}
        WHERE id = ${vendorId}
      `;

      await tx`DELETE FROM product_vendors WHERE vendor_id = ${vendorId}`;

      const uniqueNames = Array.from(new Set(productNames));
      if (uniqueNames.length > 0) {
        for (const name of uniqueNames) {
          let productId: number;
          const match = await tx<{ id: number }[]>`
            SELECT id FROM products WHERE LOWER(name) = LOWER(${name}) LIMIT 1
          `;
          if (!match[0]) {
            const sku = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) + '-' + Math.floor(1000 + Math.random() * 9000);
            const newProductResult = await tx<{ id: number }[]>`
              INSERT INTO products (name, sku, sale_price, cost_price, procurement_type, procure_on_demand, product_type)
              VALUES (${name}, ${sku}, 15.00, 10.00, 'BUY', TRUE, 'RAW_MATERIAL')
              RETURNING id
            `;
            productId = newProductResult[0].id;
            await tx`
              INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
              VALUES (${productId}, 0, 0)
            `;
            await logAudit(tx, {
              userId: session.userId,
              entityType: "products",
              entityId: productId,
              action: "CREATE",
              newValue: { name, sku, sale_price: 15.00, cost_price: 10.00, procurement_type: 'BUY', procure_on_demand: true, product_type: 'RAW_MATERIAL' },
            });
          } else {
            productId = match[0].id;
          }
          await tx`
            INSERT INTO product_vendors (product_id, vendor_id)
            VALUES (${productId}, ${vendorId})
          `;
        }
      }

      await logAudit(tx, {
        userId: session.userId,
        entityType: "vendors",
        entityId: vendorId,
        action: "UPDATE",
        oldValue: oldVal,
        newValue: { ...v, productsSelling },
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[updateVendorAction] error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteVendorAction(vendorId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "PURCHASE" && session.role !== "ADMIN" && session.role !== "OWNER") {
    return { error: "Permission denied." };
  }

  try {
    const oldResult = await sql`SELECT * FROM vendors WHERE id = ${vendorId} LIMIT 1`;
    const oldVal = oldResult[0];
    if (!oldVal) {
      return { error: "Vendor not found." };
    }

    await sql.begin(async (tx) => {
      await tx`UPDATE purchase_orders SET vendor_id = NULL WHERE vendor_id = ${vendorId}`;
      await tx`DELETE FROM product_vendors WHERE vendor_id = ${vendorId}`;
      await tx`DELETE FROM vendors WHERE id = ${vendorId}`;
      
      await logAudit(tx, {
        userId: session.userId,
        entityType: "vendors",
        entityId: vendorId,
        action: "DELETE",
        oldValue: oldVal,
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteVendorAction] error:", error);
    return { error: "Failed to delete vendor. It may be referenced in purchase orders." };
  }
}
