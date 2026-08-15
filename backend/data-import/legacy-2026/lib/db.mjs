import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import { needsRebuild, buildLegacyDb } from "./build-legacy-db.mjs";

const DEFAULT_PATH = fileURLToPath(new URL("../legacy.sqlite", import.meta.url));

/**
 * Opens legacy.sqlite, rebuilding it first from the source CSVs if it's
 * missing or any CSV is newer than it (see README.md for where the CSVs come
 * from). Rebuilding is skipped when it's already up to date, so running this
 * once per lesson import isn't repeatedly re-parsing ~21MB of CSV.
 */
export function openLegacyDb(path = DEFAULT_PATH) {
  if (path === DEFAULT_PATH && needsRebuild()) {
    buildLegacyDb();
  }
  const db = new Database(path, { readonly: true, fileMustExist: true });
  return db;
}

/** Lists table names actually present in the export, so scripts can fail with a clear message instead of a raw SQL error. */
export function listTables(db) {
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map((row) => row.name);
}

export function requireTable(db, tableName) {
  if (!listTables(db).includes(tableName)) {
    throw new Error(
      `Expected table "${tableName}" not found in legacy.sqlite. Present tables: ${listTables(db).join(", ")}`
    );
  }
}
