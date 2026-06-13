#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(rootDir, ".env");
const migrationsDir = join(rootDir, "database", "migrations");

loadEnv(envPath);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add it to .env before running migrations.");
  process.exit(1);
}

if (!existsSync(migrationsDir)) {
  console.error(`Migrations directory not found: ${migrationsDir}`);
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

try {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `;

  const appliedRows = await sql`SELECT name FROM schema_migrations`;
  const appliedMigrations = new Set(appliedRows.map((row) => row.name));
  const migrationFiles = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (migrationFiles.length === 0) {
    console.log("No migrations found.");
  }

  for (const file of migrationFiles) {
    if (appliedMigrations.has(file)) {
      console.log(`Skipping ${file}`);
      continue;
    }

    const migrationSql = readFileSync(join(migrationsDir, file), "utf8");

    await sql.begin(async (transaction) => {
      await transaction.unsafe(migrationSql);
      await transaction`
        INSERT INTO schema_migrations (name)
        VALUES (${file})
      `;
    });

    console.log(`Applied ${file}`);
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await sql.end();
}

function loadEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
