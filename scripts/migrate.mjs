#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

runPsql([
  "-c",
  `CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW()
  );`,
]);

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

if (migrationFiles.length === 0) {
  console.log("No migrations found.");
  process.exit(0);
}

for (const file of migrationFiles) {
  const migrationName = file;
  const migrationNameSql = sqlString(migrationName);
  const alreadyApplied = runPsql([
    "-t",
    "-A",
    "-c",
    `SELECT EXISTS (
      SELECT 1 FROM schema_migrations WHERE name = ${migrationNameSql}
    );`,
  ]).trim();

  if (alreadyApplied === "t") {
    console.log(`Skipping ${migrationName}`);
    continue;
  }

  const migrationPath = join(migrationsDir, file);
  const migrationSql = readFileSync(migrationPath, "utf8");
  const wrappedMigration = [
    "BEGIN;",
    migrationSql,
    `INSERT INTO schema_migrations (name) VALUES (${migrationNameSql});`,
    "COMMIT;",
  ].join("\n\n");

  runPsql([], wrappedMigration);
  console.log(`Applied ${migrationName}`);
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

function runPsql(args, input) {
  const result = spawnSync(
    "psql",
    ["--no-psqlrc", "-v", "ON_ERROR_STOP=1", databaseUrl, ...args],
    {
      cwd: rootDir,
      input,
      encoding: "utf8",
      env: process.env,
    },
  );

  if (result.error?.code === "ENOENT") {
    console.error("psql was not found. Install PostgreSQL client tools and try again.");
    process.exit(1);
  }

  if (result.status !== 0) {
    if (result.stdout) {
      console.error(result.stdout.trim());
    }

    if (result.stderr) {
      console.error(result.stderr.trim());
    }

    process.exit(result.status ?? 1);
  }

  return result.stdout;
}

function sqlString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}
