// Builds legacy.sqlite from the CSV exports produced via H2's CSVWRITE (see
// README.md for how those CSVs were obtained). Column types are inferred per
// column (integer if every non-empty value looks like a whole number, text
// otherwise) so this works uniformly across all 5 tables without hardcoding
// a schema per table.

import Database from "better-sqlite3";
import { unlinkSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadCsv } from "./csv.mjs";

const SOURCE_TABLES = {
  QUESTION: "question.csv",
  GRAPHIC: "graphic.csv",
  QUESTION_POOL: "question_pool.csv",
  LESSON: "lesson.csv",
  ANSWER: "answer.csv"
};

const DB_PATH = fileURLToPath(new URL("../legacy.sqlite", import.meta.url));
const INTEGER_RE = /^-?\d+$/;

function csvPath(file) {
  return fileURLToPath(new URL(`../${file}`, import.meta.url));
}

/** True if legacy.sqlite is missing, or any source CSV is newer than it. */
export function needsRebuild() {
  if (!existsSync(DB_PATH)) return true;
  const dbMtime = statSync(DB_PATH).mtimeMs;
  return Object.values(SOURCE_TABLES).some((file) => {
    const path = csvPath(file);
    return existsSync(path) && statSync(path).mtimeMs > dbMtime;
  });
}

function inferColumnTypes(rows, columns) {
  const types = {};
  for (const col of columns) {
    types[col] = rows.every((row) => row[col] === "" || INTEGER_RE.test(row[col])) ? "INTEGER" : "TEXT";
  }
  return types;
}

function coerce(value, type) {
  if (value === "") return null;
  return type === "INTEGER" ? Number(value) : value;
}

export function buildLegacyDb() {
  for (const file of Object.values(SOURCE_TABLES)) {
    if (!existsSync(csvPath(file))) {
      throw new Error(`${file} not found in backend/data-import/legacy-2026/ - see README.md for how to get it.`);
    }
  }

  if (existsSync(DB_PATH)) unlinkSync(DB_PATH);
  const db = new Database(DB_PATH);

  for (const [tableName, file] of Object.entries(SOURCE_TABLES)) {
    const rows = loadCsv(csvPath(file));
    if (rows.length === 0) {
      console.warn(`${tableName}: 0 rows in ${file}, skipping`);
      continue;
    }
    const columns = Object.keys(rows[0]);
    const types = inferColumnTypes(rows, columns);

    db.exec(`CREATE TABLE ${tableName} (${columns.map((c) => `"${c}" ${types[c]}`).join(", ")})`);

    const insert = db.prepare(
      `INSERT INTO ${tableName} (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`
    );
    const insertAll = db.transaction((allRows) => {
      for (const row of allRows) insert.run(columns.map((c) => coerce(row[c], types[c])));
    });
    insertAll(rows);

    console.log(`legacy.sqlite: loaded ${tableName} (${rows.length} rows)`);
  }

  db.close();
}
