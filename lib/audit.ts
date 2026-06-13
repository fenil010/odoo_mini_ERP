import postgres from "postgres";

export async function logAudit(
  client: postgres.Sql | postgres.TransactionSql,
  params: {
    userId: number;
    entityType: string; // e.g. "products", "customers", "vendors", "sales_orders"
    entityId: number;
    action: string; // e.g. "CREATE", "UPDATE", "DELETE", "CONFIRM", "DELIVER", "RECEIVE", "START", "COMPLETE"
    oldValue?: Record<string, any> | null;
    newValue?: Record<string, any> | null;
  }
) {
  const { userId, entityType, entityId, action, oldValue, newValue } = params;

  await client`
    INSERT INTO audit_logs (user_id, entity_type, entity_id, action, old_value, new_value)
    VALUES (
      ${userId},
      ${entityType},
      ${entityId},
      ${action},
      ${oldValue ? JSON.stringify(oldValue) : null},
      ${newValue ? JSON.stringify(newValue) : null}
    )
  `;
}
