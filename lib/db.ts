import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing.");
}

const globalForPostgres = globalThis as typeof globalThis & {
  miniErpSql?: postgres.Sql;
};

export const sql =
  globalForPostgres.miniErpSql ??
  postgres(databaseUrl, {
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.miniErpSql = sql;
}
