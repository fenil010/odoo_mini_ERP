import { requireRole } from "@/lib/auth/auth";
import { RoleWorkspace } from "@/app/dashboard/role-workspace";
import { sql } from "@/lib/db";
import AuditLogsCenterClient from "./audit-logs-client";

export default async function AdminAuditLogsPage() {
  await requireRole("admin");

  // Fetch audit logs with actor information
  const logs = await sql<any[]>`
    SELECT 
      al.id,
      al.user_id,
      al.entity_type,
      al.entity_id,
      al.action,
      al.old_value,
      al.new_value,
      al.created_at,
      al.event_category,
      al.severity,
      al.entity_name,
      al.action_summary,
      al.metadata,
      al.impact_type,
      al.impact_value,
      al.is_system_event,
      al.related_entity_type,
      al.related_entity_id,
      u.name AS user_name,
      u.role AS user_role
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC, al.id DESC
    LIMIT 500
  `;

  // Fetch all users to populate profile/filter metrics
  const users = await sql<any[]>`
    SELECT id, name, email, role 
    FROM users 
    ORDER BY name ASC
  `;

  return (
    <RoleWorkspace role="admin" section="audit-logs">
      <AuditLogsCenterClient initialLogs={logs} users={users} />
    </RoleWorkspace>
  );
}
