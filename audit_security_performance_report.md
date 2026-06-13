# Enterprise ERP System Audit: Security, Performance, and Logic Review
**Prepared by: Senior Cybersecurity Architect & Principal SDE Mentor**
**Target Codebase:** Mini ERP (odoo_mini_ERP)
**Date:** June 2026

---

## Executive Summary
This document provides a comprehensive security, performance, and architectural audit of the Mini ERP codebase. The application is built on **Next.js (App Router)** and **PostgreSQL (via Postgres.js)**. 

While the system is clean, responsive, and functional, there are several **critical vulnerabilities, performance bottlenecks, and database concurrency hazards** that must be resolved to ensure the system is production-ready, secure, and horizontally scalable.

---

## 1. Security Vulnerabilities & Risk Assessment

### 1.1 Weak Cryptographic Hashing for Seeded/Demo Accounts
* **Vulnerability Type:** Insecure Cryptographic Storage / Weak Password Hashing (OWASP A02:2021)
* **Location:** [`seed.ts` (lines 81-86)](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/seed.ts#L81-L86) and [`app/api/auth/login/route.ts` (lines 16-27)](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/app/api/auth/login/route.ts#L16-L27)
* **Code Frame (`seed.ts`):**
  ```typescript
  function hashPassword(password: string) {
    const salt = "mini-erp-demo-seed";
    const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
    return `sha256$${salt}$${hash}`;
  }
  ```
* **The Problem:** 
  1. The demo/seeded accounts (including `admin@minierp.local` and `owner@minierp.local`) use a custom **salted SHA-256** hashing scheme. SHA-256 is a fast hashing algorithm designed for speed, not password storage. Attackers can brute-force SHA-256 hashes at rates of billions of attempts per second using consumer GPUs.
  2. The salt is static (`"mini-erp-demo-seed"`) and hardcoded. If the database is compromised, attackers can use precomputed rainbow tables specifically built for this salt to instantly crack all seeded passwords.
  3. While signed-up users are stored securely using **bcrypt** (via [`app/actions/signup.ts`](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/app/actions/signup.ts)), having dual hashing schemes exposes the system to the lowest common denominator.
* **Mentor Recommendation:**
  Modify `seed.ts` to use `bcryptjs` (or native `crypto.scrypt`) with a dynamic work factor/salt, aligning it with the signup mechanism. Remove SHA-256 fallback code entirely once seeded accounts are updated.

### 1.2 timingSafeEqual Vulnerable to Compiler/JIT Timing Analysis
* **Vulnerability Type:** Timing Side-Channel Attack (CWE-208)
* **Location:** [`app/api/auth/login/route.ts` (lines 38-45)](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/app/api/auth/login/route.ts#L38-L45)
* **Code Frame:**
  ```typescript
  function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  ```
* **The Problem:** 
  Although the code attempts to mitigate timing attacks by performing a bitwise XOR across all characters, implementing `timingSafeEqual` in high-level Javascript/Typescript is notoriously unsafe. Modern JIT compilers (like V8 in Node.js/Bun) look for hot loops and optimize them aggressively, which can introduce branch conditions under the hood or exit early, leaking time metrics.
* **Mentor Recommendation:**
  Use Node's native `crypto.timingSafeEqual` acting on Node `Buffer` slices or let bcrypt handle authentication comparison. Native code runs outside the JS VM JIT optimizations and is guaranteed to be timing-safe at the hardware/C++ level.
  ```typescript
  import { timingSafeEqual } from "crypto";
  // Convert strings to buffers of equal length before calling timingSafeEqual
  ```

### 1.3 Missing Rate Limiting on Authentication Routes
* **Vulnerability Type:** Lack of Rate Limiting / Brute Force Risk (OWASP A07:2021)
* **Location:** [`app/api/auth/login/route.ts`](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/app/api/auth/login/route.ts)
* **The Problem:** 
  There is no rate limiting or account lockout mechanism on the login endpoint. Attackers can automate credential stuffing or brute-force attacks against any user account without restriction.
* **Mentor Recommendation:**
  Implement an IP and account-based rate limiter on the `/api/auth/login` endpoint using a Redis store or an in-memory token bucket middleware (e.g., `upstash/ratelimit` or a localized memory store for single-instance setups).

---

## 2. Performance Bottlenecks & Query Inefficiencies

### 2.1 Dynamic Sidebar Loading: N+1 Query Disaster
* **Vulnerability Type:** Inefficient Database Querying (N+1 Select Problem)
* **Location:** [`lib/role-queries.ts` (lines 33-52)](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/lib/role-queries.ts#L33-L52)
* **Code Frame:**
  ```typescript
  const sidebarSections = await Promise.all(
    sectionsResult.map(async (section) => {
      const itemsResult = await sql`
        SELECT label, href, description, icon
        FROM role_menu_items 
        WHERE section_id = ${section.id}
        ORDER BY display_order ASC
      `;
      ...
  ```
* **The Problem:** 
  For a single role, the application fetches the menu sections first, and then executes a separate database query to fetch items *for every section*. 
  Worse, [`getAllRolesFromDB` (lines 79-92)](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/lib/role-queries.ts#L79-L92) calls `getRoleDashboardFromDB` in a map over all roles. This means loading the active roles configuration executes:
  `1 (roles) + R (role info) + (R * S) (section items) + R (modules)` queries.
  With 6 roles and 3 sections per role, this produces **over 30 database queries** on application startup or sidebar rendering.
* **Mentor Recommendation:**
  Perform a single, structured SQL `JOIN` query to fetch all roles, sections, and items in one roundtrip, then restructure the hierarchy in memory.
  ```sql
  SELECT r.key, r.title, rms.id as section_id, rms.title as section_title, rmi.label, rmi.href, rmi.icon
  FROM roles r
  JOIN role_menu_sections rms ON rms.role_id = r.id
  JOIN role_menu_items rmi ON rmi.section_id = rms.id
  ORDER BY rms.display_order ASC, rmi.display_order ASC;
  ```

### 2.2 Lack of Database Indexes on High-Frequency Search Columns
* **Vulnerability Type:** Missing Database Access Path Indexes (Unoptimized Database Access)
* **Location:** [`database/schema.sql`](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/database/schema.sql)
* **The Problem:** 
  The schema defines foreign key constraints but fails to create database indexes on them. Without indexes, PostgreSQL must perform slow **Sequential Scans** (Full Table Scans) for common joins and filter queries as the database grows:
  * Joining `sales_order_items` on `sales_order_id` or `product_id`
  * Joining `purchase_order_items` on `purchase_order_id` or `product_id`
  * Filtering `stock_ledger` on `product_id`
  * Filtering `audit_logs` on `user_id`, `event_category`, or `severity`
* **Mentor Recommendation:**
  Add B-tree indexes to foreign keys and columns frequently used in `WHERE`, `JOIN`, or `ORDER BY` operations:
  ```sql
  CREATE INDEX idx_sales_order_items_order ON sales_order_items (sales_order_id);
  CREATE INDEX idx_sales_order_items_product ON sales_order_items (product_id);
  CREATE INDEX idx_purchase_order_items_order ON purchase_order_items (purchase_order_id);
  CREATE INDEX idx_stock_ledger_product ON stock_ledger (product_id);
  CREATE INDEX idx_audit_logs_event_category ON audit_logs (event_category);
  CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);
  ```

### 2.3 Non-Indexable Date Groupings (Full Table Scans)
* **Vulnerability Type:** Arithmetic/Function-wrapped Index Suppression
* **Location:** [`lib/analytics-data.ts`](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/lib/analytics-data.ts)
* **Code Frame:**
  ```sql
  SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(...)
  FROM sales_orders
  GROUP BY month;
  ```
* **The Problem:** 
  When a query wraps `created_at` in `TO_CHAR(created_at, 'YYYY-MM')`, PostgreSQL cannot use a standard index on `created_at`. It is forced to evaluate `TO_CHAR()` for every single row in the table, group them in memory, and sort.
* **Mentor Recommendation:**
  If you must group by month, either:
  1. Filter using date boundaries first (e.g., `WHERE created_at >= '2026-01-01'`) to limit the scan.
  2. Create a functional index:
     ```sql
     CREATE INDEX idx_sales_orders_created_month ON sales_orders ((TO_CHAR(created_at, 'YYYY-MM')));
     ```

---

## 3. Concurrency Hazards & Logic Flaws

### 3.1 Deadlock Hazard in Manufacturing Order Allocation
* **Vulnerability Type:** Relational Database Concurrency Deadlock (CWE-833)
* **Location:** [`lib/stock-ledger.ts` (lines 281-288)](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/lib/stock-ledger.ts#L281-L288)
* **Code Frame:**
  ```typescript
  for (const item of bomItems) {
    ...
    const [inv] = await tx`
      SELECT on_hand_qty, reserved_qty 
      FROM inventory 
      WHERE product_id = ${item.component_product_id}
      FOR UPDATE
    `;
    ...
  }
  ```
* **The Problem:** 
  When checking component availability for a Manufacturing Order, the code locks component inventory rows using `FOR UPDATE` one-by-one inside a `for` loop.
  If **Manufacturing Order A** requires Component X and Component Y, and **Manufacturing Order B** (running concurrently) requires Component Y and Component X:
  1. MO A locks Component X.
  2. MO B locks Component Y.
  3. MO A tries to lock Component Y (blocks, waiting for MO B).
  4. MO B tries to lock Component X (blocks, waiting for MO A).
  *Result:* **Deadlock**. PostgreSQL will abort one of the transactions after a timeout.
* **Mentor Recommendation:**
  **Always lock resource rows in a deterministic, sorted order.** 
  Extract all `component_product_id`s, sort them numerically, and execute a single bulk `SELECT ... FOR UPDATE` statement before doing any allocation logic:
  ```typescript
  const componentIds = bomItems.map(item => item.component_product_id).sort((a, b) => a - b);
  if (componentIds.length > 0) {
    await tx`
      SELECT id FROM inventory 
      WHERE product_id IN (${componentIds}) 
      ORDER BY product_id ASC 
      FOR UPDATE
    `;
  }
  ```
  By sorting the lock order, Transaction A and Transaction B will both try to lock Component X before Component Y, avoiding circular wait deadlocks.

### 3.2 Lack of Database Constraints on Critical Numeric Quantities
* **Vulnerability Type:** Insufficient Data Integrity Constraints
* **Location:** [`database/schema.sql`](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/database/schema.sql)
* **The Problem:** 
  The tables `inventory` (`on_hand_qty`, `reserved_qty`) and `products` (`sale_price`, `cost_price`) use plain integer and decimal fields. Although the application layer enforces checks (e.g., throwing an error if on-hand quantity becomes negative), a direct database query, API bypass, or race condition could result in negative inventory, negative prices, or corrupt stock ledgers.
* **Mentor Recommendation:**
  Enforce integrity constraints at the database level to act as a fail-safe:
  ```sql
  ALTER TABLE inventory ADD CONSTRAINT chk_on_hand_qty CHECK (on_hand_qty >= 0);
  ALTER TABLE inventory ADD CONSTRAINT chk_reserved_qty CHECK (reserved_qty >= 0);
  ALTER TABLE products ADD CONSTRAINT chk_sale_price CHECK (sale_price >= 0.00);
  ALTER TABLE products ADD CONSTRAINT chk_cost_price CHECK (cost_price >= 0.00);
  ```

### 3.3 Procurement Engine Double-Booking / Flooding
* **Vulnerability Type:** Lack of System State Synchronization (Race Condition)
* **Location:** [`lib/procurement-engine.ts`](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/lib/procurement-engine.ts)
* **The Problem:** 
  When a sales order creates a stock shortage, the procurement engine automatically inserts a new Purchase Order (PO) or Manufacturing Order (MO) for the raw components. 
  However, it does **not** check if there are already pending, draft, or unfulfilled POs/MOs for those exact items. If five customers place sales orders for a low-stock item in rapid succession, the system will trigger five separate POs/MOs, causing the company to over-purchase or over-produce materials.
* **Mentor Recommendation:**
  Before generating a new PO/MO, search for unfulfilled orders (e.g., `status = 'DRAFT'` or `status = 'WAITING_MATERIALS'`) for that specific product. Deduct "ordered-but-not-received" quantities from the calculated shortage amount before spawning new orders.

---

## 4. Software Design Engineering (SDE) & Code Quality Review

### 4.1 Insecure Session Token Expiration Handling
* **Code Smell:** Loose Expiration Enforcements
* **Location:** [`lib/auth/session.ts` (lines 40-71)](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/lib/auth/session.ts#L40-L71)
* **The Problem:**
  Inside `decrypt(token)`, the payload parses the expiration date:
  ```typescript
  expiresAt: new Date(payload.expiresAt as string)
  ```
  However, the code does not explicitly check if `expiresAt` is in the past! It relies on `jwtVerify` to check expiration, which works if `exp` claim is set in the JWT. Since `SignJWT` uses `.setExpirationTime("7d")`, this sets the standard `exp` claim. However, because the payload duplicates `expiresAt` as a custom field, it's easy to create code mismatches.
* **Mentor Recommendation:**
  Rely purely on the standard JWT `exp` claim check. Do not pass custom date fields unless required for UI rendering, and if doing so, validate them explicitly.

### 4.2 Use of String Literals/Magic Strings for Action & Roles
* **Code Smell:** Hardcoded values (Magic Strings)
* **Location:** Throughout [`lib/audit.ts`](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/lib/audit.ts), [`lib/stock-ledger.ts`](file:///c:/Users/TAJAGN/OneDrive/Desktop/odoo_mini_ERP/lib/stock-ledger.ts), and actions.
* **The Problem:**
  Strings like `"SALES_DELIVERY"`, `"MO_CONSUME"`, `"CONFIRMED"`, and `"WAITING_MATERIALS"` are hardcoded in the query statements and switch branches. A single typo in a server action or helper will fail silently or insert invalid strings into the database, causing logic desynchronization.
* **Mentor Recommendation:**
  Extract these states into TypeScript Enums or Readonly Const Objects:
  ```typescript
  export const MOVEMENT_TYPES = {
    PURCHASE_RECEIPT: "PURCHASE_RECEIPT",
    SALES_RESERVE: "SALES_RESERVE",
    SALES_DELIVERY: "SALES_DELIVERY",
    // ...
  } as const;

  export type MovementType = keyof typeof MOVEMENT_TYPES;
  ```

### 4.3 Missing Input Sanitization for Rich Displays
* **Code Smell:** Direct User Input Rendering
* **Location:** Front-end list views.
* **The Problem:**
  User input names, emails, and notes are output in tables directly. Next.js/React standard text rendering (`{item.notes}`) auto-escapes HTML characters, protecting against primary Cross-Site Scripting (XSS). However, if developers render logs via `dangerouslySetInnerHTML` in custom diff blocks, or inject them into visual attributes (like `title="..."`), XSS vulnerabilities will manifest.
* **Mentor Recommendation:**
  Ensure that log displays, diffs, and notes strictly avoid `dangerouslySetInnerHTML` unless pre-processed by a sanitization library like `isomorphic-dompurify`.

---

## 5. Summary Matrix & Action Priority

| Issue ID | Category | Description | Severity | Priority | Action Item |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Security | SHA-256 with static salt for seed passwords | **High** | **1** | Replace seed password hashing with Bcrypt. |
| **CON-01** | Concurrency | Sequentially locking component rows in BoM allocation loop | **High** | **2** | Sort component IDs and lock them in a single bulk query. |
| **PER-01** | Performance | Dynamic Sidebar N+1 database queries | **Medium**| **3** | Restructure role loading to use a single SQL Join query. |
| **SEC-02** | Security | Custom timingSafeEqual JIT side-channel leakage | **Low** | **4** | Replace with Node.js native `crypto.timingSafeEqual`. |
| **PER-02** | Performance | Missing database B-Tree indexes on foreign keys | **Medium**| **5** | Add indexes via a migration script. |
| **CON-02** | Concurrency | Missing CHECK constraints on prices and stocks | **Low** | **6** | Add CHECK constraints to DB schema. |
| **PER-03** | Performance | `TO_CHAR()` functions blocking index execution | **Low** | **7** | Implement functional indexes or query by date ranges. |
| **SDE-01** | SDE | Magic strings instead of Const/Enums for actions/roles | **Low** | **8** | Extract types to const declarations. |
