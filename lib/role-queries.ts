import { sql } from "./db";
import type { RoleKey, RoleDashboard } from "@/app/dashboard/role-data";

/**
 * Fetch a single role's complete configuration from database
 * Includes role metadata, menu sections, items, and modules
 */
export async function getRoleDashboardFromDB(
  roleKey: RoleKey
): Promise<RoleDashboard | null> {
  try {
    // Get role metadata
    const roleResult = await sql`
      SELECT id, key, title, responsibility, focus, sidebar_title, db_role
      FROM roles WHERE key = ${roleKey}
    `;

    if (!roleResult.length) {
      return null;
    }

    const role = roleResult[0];

    // Get menu sections and items in a single query to eliminate N+1 queries
    const itemsResult = await sql`
      SELECT 
        rms.title as section_title,
        rmi.label, 
        rmi.href, 
        rmi.description, 
        rmi.icon
      FROM role_menu_sections rms
      LEFT JOIN role_menu_items rmi ON rmi.section_id = rms.id
      WHERE rms.role_id = ${role.id}
      ORDER BY rms.display_order ASC, rmi.display_order ASC
    `;

    const sectionsMap = new Map<string, { title: string; items: any[] }>();
    for (const row of itemsResult) {
      const secTitle = row.section_title;
      if (!sectionsMap.has(secTitle)) {
        sectionsMap.set(secTitle, {
          title: secTitle,
          items: [],
        });
      }
      if (row.label) {
        sectionsMap.get(secTitle)!.items.push({
          label: row.label,
          href: row.href,
          description: row.description,
          icon: row.icon,
        });
      }
    }
    const sidebarSections = Array.from(sectionsMap.values());

    // Get modules for this role
    const modulesResult = await sql`
      SELECT module_name FROM role_modules WHERE role_id = ${role.id} ORDER BY module_name ASC
    `;

    return {
      key: roleKey,
      dbRole: role.db_role,
      title: role.title,
      responsibility: role.responsibility,
      focus: role.focus,
      sidebarTitle: role.sidebar_title,
      sidebarSections,
      modules: modulesResult.map((m) => m.module_name),
    };
  } catch (error) {
    console.error(`Error fetching role dashboard for ${roleKey}:`, error);
    return null;
  }
}

/**
 * Fetch all roles from database
 * Used for role listing and initialization
 */
export async function getAllRolesFromDB(): Promise<RoleDashboard[]> {
  try {
    const rolesResult = await sql`SELECT key FROM roles ORDER BY key ASC`;

    const roleDashboards = await Promise.all(
      rolesResult.map((role) => getRoleDashboardFromDB(role.key as RoleKey))
    );

    return roleDashboards.filter((role): role is RoleDashboard => role !== null);
  } catch (error) {
    console.error("Error fetching all roles from database:", error);
    return [];
  }
}

/**
 * Fetch a specific role page/menu item from database
 * Returns first item if section not specified, or specific section item
 */
export async function getRolePageFromDB(
  roleKey: RoleKey,
  section?: string
): Promise<{ label: string; href: string; description: string; icon: string } | null> {
  try {
    const role = await getRoleDashboardFromDB(roleKey);

    if (!role) {
      return null;
    }

    const items = role.sidebarSections.flatMap((sec) => sec.items);

    if (!section) {
      return items[0] || null;
    }

    return (
      items.find((item) => item.href === `/dashboard/${roleKey}/${section}`) ||
      null
    );
  } catch (error) {
    console.error(
      `Error fetching role page from DB for ${roleKey}/${section}:`,
      error
    );
    return null;
  }
}

/**
 * Get all sections (subsections) for a role, excluding the first item
 * Used for dynamic routing
 */
export async function getRoleSectionsFromDB(roleKey: RoleKey): Promise<string[]> {
  try {
    const role = await getRoleDashboardFromDB(roleKey);

    if (!role) {
      return [];
    }

    return role.sidebarSections
      .flatMap((section) => section.items)
      .slice(1)
      .map((item) => item.href.split("/").at(-1))
      .filter((section): section is string => Boolean(section));
  } catch (error) {
    console.error(`Error fetching role sections from DB for ${roleKey}:`, error);
    return [];
  }
}
