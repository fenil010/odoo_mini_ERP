export type RoleKey =
  | "admin"
  | "sales"
  | "purchase"
  | "manufacturing"
  | "inventory"
  | "owner";

export type SidebarIcon =
  | "activity"
  | "barChart"
  | "boxes"
  | "clipboard"
  | "factory"
  | "fileClock"
  | "home"
  | "layers"
  | "packageCheck"
  | "packagePlus"
  | "receipt"
  | "settings"
  | "shield"
  | "shoppingCart"
  | "truck"
  | "users"
  | "warehouse"
  | "wrench";

export type RoleDashboard = {
  key: RoleKey;
  dbRole: string;
  title: string;
  responsibility: string;
  focus: string;
  sidebarTitle: string;
  sidebarSections: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
      description: string;
      icon: SidebarIcon;
    }>;
  }>;
  modules: string[];
};

/**
 * ⚠️ DEPRECATION NOTICE ⚠️
 * 
 * All role configuration has been moved to the database.
 * Migration: database/migrations/005_roles_and_menu_structure.sql
 * 
 * Instead of hardcoded data, use the functions from @/lib/role-queries:
 * - getRoleDashboardFromDB(role)
 * - getAllRolesFromDB()
 * - getRolePageFromDB(role, section)
 * - getRoleSectionsFromDB(role)
 */

/**
 * ❌ DEPRECATED: All role data is now in the database
 * Use getRoleDashboardFromDB() from @/lib/role-queries instead
 */
export const roleDashboards: Record<RoleKey, RoleDashboard> = {} as any;

/**
 * ❌ DEPRECATED: Use getAllRolesFromDB() from @/lib/role-queries instead
 */
export const roleOrder: RoleKey[] = [
  "admin",
  "sales",
  "purchase",
  "manufacturing",
  "inventory",
  "owner",
];

/**
 * ❌ DEPRECATED: Use getRolePageFromDB() from @/lib/role-queries instead
 * 
 * @throws {Error} Always throws - use getRolePageFromDB from @/lib/role-queries
 */
export function getRolePage(role: RoleKey, section?: string) {
  throw new Error(
    'getRolePage() is deprecated. Use getRolePageFromDB() from @/lib/role-queries instead.'
  );
}

/**
 * ❌ DEPRECATED: Use getRoleSectionsFromDB() from @/lib/role-queries instead
 * 
 * @throws {Error} Always throws - use getRoleSectionsFromDB from @/lib/role-queries
 */
export function getRoleSections(role: RoleKey) {
  throw new Error(
    'getRoleSections() is deprecated. Use getRoleSectionsFromDB() from @/lib/role-queries instead.'
  );
}
