import postgres from "postgres";

export async function logAudit(
  client: postgres.Sql | postgres.TransactionSql,
  params: {
    userId: number | null;
    entityType: string; // e.g. "products", "customers", "vendors", "sales_orders"
    entityId: number;
    action: string; // e.g. "CREATE", "UPDATE", "DELETE", "CONFIRM", "DELIVER", "RECEIVE", "START", "COMPLETE"
    oldValue?: Record<string, any> | null;
    newValue?: Record<string, any> | null;
    eventCategory?: string;
    severity?: string;
    entityName?: string;
    actionSummary?: string;
    metadata?: Record<string, any> | null;
    impactType?: string;
    impactValue?: number;
    isSystemEvent?: boolean;
    relatedEntityType?: string;
    relatedEntityId?: number;
  }
) {
  let {
    userId,
    entityType,
    entityId,
    action,
    oldValue,
    newValue,
    eventCategory,
    severity,
    entityName,
    actionSummary,
    metadata,
    impactType,
    impactValue,
    isSystemEvent,
    relatedEntityType,
    relatedEntityId
  } = params;

  // 1. Detect if it is a system event
  if (isSystemEvent === undefined) {
    // If user_id is null or 1 (system admin), treat as automated SYSTEM event
    isSystemEvent = userId === null || userId === 1;
  }

  // 2. Smart Event Category Categorization
  if (!eventCategory) {
    const type = entityType.toLowerCase();
    if (type.includes("sale") || type.includes("customer")) {
      eventCategory = "SALES";
    } else if (type.includes("purchase") || type.includes("vendor")) {
      eventCategory = "PURCHASE";
    } else if (type.includes("manufacturing") || type.includes("work_order")) {
      eventCategory = "MANUFACTURING";
    } else if (type.includes("product") || type.includes("inventory") || type.includes("stock")) {
      eventCategory = "INVENTORY";
    } else if (type.includes("bom")) {
      eventCategory = "MANUFACTURING";
    } else if (type.includes("user") || type.includes("role") || type.includes("permission")) {
      eventCategory = "AUTHENTICATION";
    } else {
      eventCategory = "SYSTEM";
    }
  }

  // 3. Smart Severity Level
  if (!severity) {
    const act = action.toUpperCase();
    if (act.includes("FAIL") || act.includes("CORRUPT") || act.includes("UNAUTHORIZED")) {
      severity = "CRITICAL";
    } else if (act.includes("ERROR") || act.includes("DENIED")) {
      severity = "ERROR";
    } else if (act.includes("DELETE") || act.includes("CANCEL") || act.includes("SHORTAGE") || act.includes("WARNING")) {
      severity = "WARNING";
    } else if (act.includes("RECEIVE") || act.includes("COMPLETE") || act.includes("DELIVER") || act.includes("SUCCESS") || act.includes("CONFIRM")) {
      severity = "SUCCESS";
    } else {
      severity = "INFO";
    }
  }

  // 4. Action Summary & Entity Name fallback
  if (!entityName) {
    entityName = newValue?.name ?? oldValue?.name ?? newValue?.order_number ?? oldValue?.order_number ?? newValue?.po_number ?? oldValue?.po_number ?? newValue?.mo_number ?? oldValue?.mo_number ?? null;
  }

  if (!actionSummary) {
    const actLabel = action.toLowerCase().replace(/_/g, " ");
    const nameLabel = entityName ? ` "${entityName}"` : "";
    actionSummary = `${actLabel.charAt(0).toUpperCase() + actLabel.slice(1)} on ${entityType.replace(/_/g, " ")}${nameLabel}`;
  }

  // 5. Automatic Business Impact Calculation
  if (!impactType && !impactValue) {
    if (entityType === "sales_orders" && (action === "CREATE" || action === "CONFIRM" || action === "DELIVER" || action === "DONE")) {
      const items = newValue?.items ?? oldValue?.items;
      if (Array.isArray(items)) {
        impactType = "REVENUE";
        impactValue = items.reduce((sum: number, item: any) => sum + (Number(item.quantity || 0) * Number(item.price || 0)), 0);
      }
    } else if (entityType === "purchase_orders" && (action === "RECEIVE" || action === "COMPLETE")) {
      impactType = "INVENTORY_IN";
      const items = newValue?.items ?? oldValue?.items;
      if (Array.isArray(items)) {
        impactValue = items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
      }
    } else if (entityType === "manufacturing_orders" && action === "COMPLETE") {
      impactType = "FINISHED_GOODS";
      impactValue = Number(newValue?.quantity ?? oldValue?.quantity ?? 0);
    } else if (entityType === "inventory" || entityType === "stock_ledger") {
      impactType = "STOCK_MOVE";
      impactValue = Number(newValue?.quantity ?? oldValue?.quantity ?? 0);
    }
  }

  if (impactValue === undefined) {
    impactValue = 0.00;
  }

  if (!metadata) {
    metadata = {};
  }

  const dbUserId = userId ?? null;
  const dbEntityType = entityType;
  const dbEntityId = entityId;
  const dbAction = action;
  const dbOldValue = oldValue ? JSON.stringify(oldValue) : null;
  const dbNewValue = newValue ? JSON.stringify(newValue) : null;
  const dbEventCategory = eventCategory ?? "SYSTEM";
  const dbSeverity = severity ?? "INFO";
  const dbEntityName = entityName ?? null;
  const dbActionSummary = actionSummary ?? null;
  const dbMetadata = metadata ? JSON.stringify(metadata) : null;
  const dbImpactType = impactType ?? null;
  const dbImpactValue = impactValue;
  const dbIsSystemEvent = !!isSystemEvent;
  const dbRelatedEntityType = relatedEntityType ?? null;
  const dbRelatedEntityId = relatedEntityId ?? null;

  await client`
    INSERT INTO audit_logs (
      user_id, entity_type, entity_id, action, old_value, new_value,
      event_category, severity, entity_name, action_summary, metadata,
      impact_type, impact_value, is_system_event, related_entity_type, related_entity_id
    )
    VALUES (
      ${dbUserId},
      ${dbEntityType},
      ${dbEntityId},
      ${dbAction},
      ${dbOldValue},
      ${dbNewValue},
      ${dbEventCategory},
      ${dbSeverity},
      ${dbEntityName},
      ${dbActionSummary},
      ${dbMetadata},
      ${dbImpactType},
      ${dbImpactValue},
      ${dbIsSystemEvent},
      ${dbRelatedEntityType},
      ${dbRelatedEntityId}
    )
  `;
}
