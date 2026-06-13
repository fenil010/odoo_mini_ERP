"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/auth/auth";
import { logAudit } from "@/lib/audit";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  sku: z.string().min(2, "SKU must be at least 2 characters."),
  sale_price: z.coerce.number().min(0, "Sale price must be non-negative."),
  cost_price: z.coerce.number().min(0, "Cost price must be non-negative."),
  procurement_type: z.enum(["BUY", "MANUFACTURE"]),
  procure_on_demand: z.preprocess((val) => val === "true" || val === true, z.boolean()),
  image_url: z.string().url("Must be a valid URL.").or(z.string().length(0)).nullable(),
  product_type: z.enum(["FINISHED_GOOD", "RAW_MATERIAL"]),
});

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createProductAction(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAuth();
  
  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return { error: "Permission denied. Only Admins and Owners can manage products." };
  }

  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const sale_price = formData.get("sale_price") as string;
  const cost_price = formData.get("cost_price") as string;
  const procurement_type = formData.get("procurement_type") as string;
  const procure_on_demand = formData.get("procure_on_demand") ? "true" : "false";
  const image_url = formData.get("image_url") as string || null;
  const product_type = formData.get("product_type") as string;

  const result = productSchema.safeParse({
    name,
    sku,
    sale_price,
    cost_price,
    procurement_type,
    procure_on_demand,
    image_url,
    product_type,
  });

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid product inputs.";
    return { error: firstError };
  }

  const p = result.data;

  try {
    const existingSku = await sql`
      SELECT id FROM products WHERE sku = ${p.sku} LIMIT 1
    `;
    if (existingSku.length > 0) {
      return { error: "A product with this SKU already exists." };
    }

    await sql.begin(async (tx) => {
      const productResult = await tx<{ id: number }[]>`
        INSERT INTO products (name, sku, sale_price, cost_price, procurement_type, procure_on_demand, image_url, product_type)
        VALUES (${p.name}, ${p.sku}, ${p.sale_price}, ${p.cost_price}, ${p.procurement_type}, ${p.procure_on_demand}, ${p.image_url}, ${p.product_type})
        RETURNING id
      `;

      const newProductId = productResult[0].id;

      await tx`
        INSERT INTO inventory (product_id, on_hand_qty, reserved_qty)
        VALUES (${newProductId}, 0, 0)
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "products",
        entityId: newProductId,
        action: "CREATE",
        newValue: p,
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[createProductAction] error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function updateProductAction(productId: number, prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return { error: "Permission denied." };
  }

  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const sale_price = formData.get("sale_price") as string;
  const cost_price = formData.get("cost_price") as string;
  const procurement_type = formData.get("procurement_type") as string;
  const procure_on_demand = formData.get("procure_on_demand") ? "true" : "false";
  const image_url = formData.get("image_url") as string || null;
  const product_type = formData.get("product_type") as string;

  const result = productSchema.safeParse({
    name,
    sku,
    sale_price,
    cost_price,
    procurement_type,
    procure_on_demand,
    image_url,
    product_type,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid inputs." };
  }

  const p = result.data;

  try {
    const existingSku = await sql`
      SELECT id FROM products WHERE sku = ${p.sku} AND id != ${productId} LIMIT 1
    `;
    if (existingSku.length > 0) {
      return { error: "A product with this SKU already exists." };
    }

    const oldProductResult = await sql`
      SELECT * FROM products WHERE id = ${productId} LIMIT 1
    `;
    const oldProduct = oldProductResult[0];

    if (!oldProduct) {
      return { error: "Product not found." };
    }

    await sql.begin(async (tx) => {
      await tx`
        UPDATE products
        SET name = ${p.name},
            sku = ${p.sku},
            sale_price = ${p.sale_price},
            cost_price = ${p.cost_price},
            procurement_type = ${p.procurement_type},
            procure_on_demand = ${p.procure_on_demand},
            image_url = ${p.image_url},
            product_type = ${p.product_type}
        WHERE id = ${productId}
      `;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "products",
        entityId: productId,
        action: "UPDATE",
        oldValue: oldProduct,
        newValue: p,
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[updateProductAction] error:", error);
    return { error: "An unexpected error occurred." };
  }
}

export async function deleteProductAction(productId: number): Promise<ActionState> {
  const session = await requireAuth();
  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    return { error: "Permission denied." };
  }

  try {
    const oldProductResult = await sql`
      SELECT * FROM products WHERE id = ${productId} LIMIT 1
    `;
    const oldProduct = oldProductResult[0];
    if (!oldProduct) {
      return { error: "Product not found." };
    }

    await sql.begin(async (tx) => {
      await tx`DELETE FROM inventory WHERE product_id = ${productId}`;
      await tx`DELETE FROM product_vendors WHERE product_id = ${productId}`;

      const bomResult = await tx`SELECT id FROM boms WHERE product_id = ${productId} LIMIT 1`;
      if (bomResult.length > 0) {
        await tx`DELETE FROM bom_items WHERE bom_id = ${bomResult[0].id}`;
        await tx`DELETE FROM boms WHERE product_id = ${productId}`;
      }

      await tx`DELETE FROM products WHERE id = ${productId}`;

      await logAudit(tx, {
        userId: session.userId,
        entityType: "products",
        entityId: productId,
        action: "DELETE",
        oldValue: oldProduct,
      });
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[deleteProductAction] error:", error);
    return { error: "Failed to delete product. It may be referenced in sales, purchase, or manufacturing orders." };
  }
}
