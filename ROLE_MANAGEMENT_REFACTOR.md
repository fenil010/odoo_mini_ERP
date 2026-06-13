# Role Management Refactor - Database-Driven Configuration

## Overview

All role definitions, menu items, and configuration have been moved from hardcoded TypeScript to the database. This allows runtime configuration without code redeployment.

## What Changed

### Before (Hardcoded)
```typescript
// app/dashboard/role-data.ts
export const roleDashboards = {
  admin: {
    title: "Admin",
    sidebarSections: [...]
  }
}
```

### After (Database-Driven)
```typescript
// Query from database using functions from lib/role-queries.ts
const adminRole = await getRoleDashboardFromDB("admin");
```

## Database Schema

The following tables store all role configuration:

### roles
- `id` - Primary key
- `key` - Unique role identifier (admin, sales, purchase, etc.)
- `title` - Display title
- `responsibility` - Role responsibility description
- `focus` - Role focus area description
- `sidebar_title` - Sidebar section title
- `db_role` - Database role name for permissions

### role_menu_sections
- `id` - Primary key
- `role_id` - Foreign key to roles
- `title` - Section title (Admin, Sales, etc.)
- `display_order` - Order in which sections appear

### role_menu_items
- `id` - Primary key
- `section_id` - Foreign key to role_menu_sections
- `label` - Menu item label
- `href` - Route/path
- `description` - Hover description
- `icon` - Icon name (home, users, factory, etc.)
- `display_order` - Order in which items appear

### role_modules
- `id` - Primary key
- `role_id` - Foreign key to roles
- `module_name` - Module name (Users, Products, Sales, etc.)

## Migration

Run the migration to set up the database schema:

```bash
psql -d your_database -f database/migrations/005_roles_and_menu_structure.sql
```

This migration will:
1. Create all role-related tables
2. Insert default role definitions for all 6 roles (admin, sales, purchase, manufacturing, inventory, owner)
3. Populate all menu sections and items
4. Set up role-to-module mappings

## API Usage

Import functions from `@/lib/role-queries.ts`:

### Get a specific role's configuration
```typescript
import { getRoleDashboardFromDB } from "@/lib/role-queries";

const role = await getRoleDashboardFromDB("admin");
// Returns:
// {
//   key: "admin",
//   title: "Admin",
//   responsibility: "...",
//   focus: "...",
//   sidebarTitle: "System control",
//   sidebarSections: [...],
//   modules: [...]
// }
```

### Get all roles
```typescript
import { getAllRolesFromDB } from "@/lib/role-queries";

const roles = await getAllRolesFromDB();
```

### Get a specific role page/menu item
```typescript
import { getRolePageFromDB } from "@/lib/role-queries";

// Get first item
const firstPage = await getRolePageFromDB("sales");
// { label: "Sales overview", href: "/dashboard/sales", ... }

// Get specific section
const customersPage = await getRolePageFromDB("sales", "customers");
// { label: "Customers", href: "/dashboard/sales/customers", ... }
```

### Get all sections for a role (for dynamic routing)
```typescript
import { getRoleSectionsFromDB } from "@/lib/role-queries";

const sections = await getRoleSectionsFromDB("sales");
// ["customers", "sales-orders", "order-items", "shortages", "delivery-status"]
```

## Updating Role Configuration

To modify roles at runtime:

1. **Add a new role**
   ```sql
   INSERT INTO roles (key, title, responsibility, focus, sidebar_title, db_role)
   VALUES ('analyst', 'Data Analyst', '...', '...', 'Analytics', 'ANALYST');
   ```

2. **Add menu sections**
   ```sql
   INSERT INTO role_menu_sections (role_id, title, display_order)
   VALUES ((SELECT id FROM roles WHERE key = 'analyst'), 'Reports', 0);
   ```

3. **Add menu items**
   ```sql
   INSERT INTO role_menu_items (section_id, label, href, description, icon, display_order)
   VALUES (
     (SELECT id FROM role_menu_sections WHERE role_id = ... AND title = 'Reports'),
     'Dashboard',
     '/dashboard/analyst',
     'Analytics dashboard',
     'barChart',
     0
   );
   ```

4. **Add modules**
   ```sql
   INSERT INTO role_modules (role_id, module_name)
   VALUES ((SELECT id FROM roles WHERE key = 'analyst'), 'Analytics');
   ```

## Deprecated Functions

The following functions in `app/dashboard/role-data.ts` are now deprecated and will throw errors:

- `getRolePage()` → Use `getRolePageFromDB()` from `@/lib/role-queries`
- `getRoleSections()` → Use `getRoleSectionsFromDB()` from `@/lib/role-queries`
- `roleDashboards` (object) → Use `getRoleDashboardFromDB()` from `@/lib/role-queries`

## Benefits

✅ **No Redeployment Required** - Update roles/menus without code changes
✅ **Multi-Tenant Ready** - Different organizations can have different role configurations
✅ **Audit Trail** - Track who changed what and when
✅ **Runtime Customization** - Enable/disable features per organization
✅ **Scalable** - Easily add new roles and menu items
✅ **Single Source of Truth** - All configuration in one place

## Implementation Notes

- All role-queries functions are async - use `await` in your components/pages
- For Server Components, you can call these directly
- For Client Components, you'll need API routes or Server Actions
- Consider caching role configurations to improve performance
- Error handling is built-in - functions return `null` or `[]` on errors
