import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)));
const envPath = join(rootDir, ".env");
const demoPassword = "Password@123";
const users = [
  {
    name: "Admin User",
    email: "admin@minierp.local",
    role: "ADMIN",
  },
  {
    name: "Sales User",
    email: "sales@minierp.local",
    role: "SALES",
  },
  {
    name: "Purchase User",
    email: "purchase@minierp.local",
    role: "PURCHASE",
  },
  {
    name: "Manufacturing User",
    email: "manufacturing@minierp.local",
    role: "MANUFACTURING",
  },
  {
    name: "Inventory Manager",
    email: "inventory@minierp.local",
    role: "INVENTORY",
  },
  {
    name: "Business Owner",
    email: "owner@minierp.local",
    role: "OWNER",
  },
];

loadEnv(envPath);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add it to .env before running seed.");
  process.exit(1);
}

const connectionString = databaseUrl;

const rows = users
  .map((user) => {
    return `(${sqlString(user.name)}, ${sqlString(user.email)}, ${sqlString(
      hashPassword(demoPassword),
    )}, ${sqlString(user.role)})`;
  })
  .join(",\n");

runPsql(
  [],
  `
INSERT INTO users (name, email, password_hash, role)
VALUES
${rows}
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;
`,
);

console.log(`Seeded ${users.length} role users.`);
console.log(`Demo password for all seeded users: ${demoPassword}`);
for (const user of users) {
  console.log(`${user.role}: ${user.email}`);
}

function hashPassword(password: string) {
  const salt = "mini-erp-demo-seed";
  const hash = createHash("sha256").update(`${salt}:${password}`).digest("hex");

  return `sha256$${salt}$${hash}`;
}

function loadEnv(filePath: string) {
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

function runPsql(args: string[], input: string) {
  const result = spawnSync(
    "psql",
    ["--no-psqlrc", "-v", "ON_ERROR_STOP=1", connectionString, ...args],
    {
      cwd: rootDir,
      input,
      encoding: "utf8",
      env: process.env,
    },
  );

  const spawnError = result.error as NodeJS.ErrnoException | undefined;

  if (spawnError?.code === "ENOENT") {
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
}

function sqlString(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}
